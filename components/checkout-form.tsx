"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle, Clock, AlertCircle, Wallet, QrCode, Copy, Check, RefreshCw, ExternalLink } from "lucide-react"
import { useRouter } from "next/navigation"

interface CheckoutFormProps {
  paymentIntentId: string
  amount: string
  contractId: Buffer
}

interface WalletPromptProps {
  walletName: string
  isVisible: boolean
}

type PaymentStatus = "idle" | "connecting" | "pending" | "confirmed" | "failed"

type WalletProvider = {
  name: string
  provider: any
  detected: boolean
}

const SBTC_CONTRACT_ADDRESS = "ST33MYKWMAW0E2DAZETJ1Z8RTRZ93D2GB890QWQXS"
const SBTC_CONTRACT_NAME = "payment_gateway"
const NETWORK = "testnet"

// Network configuration for better consistency
const NETWORK_CONFIG = {
  url: "https://stacks-node-api.testnet.stacks.co",
  network: "testnet",
  chainId: 0x80000000 // Testnet chain ID
}

// QR Code generation function using QR Server API
const generateQRCodeSVG = (data: string, size = 160): string => {
  const encodedData = encodeURIComponent(data)
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedData}&format=png&margin=10`
}

// Wallet prompt component
const WalletPrompt = ({ walletName, isVisible }: WalletPromptProps) => {
  if (!isVisible) return null
  
  return (
    <Card className="p-4 bg-blue-50 border-blue-200 animate-pulse">
      <div className="text-center">
        <Wallet className="w-8 h-8 mx-auto text-blue-500 mb-2" />
        <p className="text-sm font-medium text-blue-800">
          Check Your {walletName} Wallet
        </p>
        <p className="text-xs text-blue-600 mt-1">
          A transaction approval request should appear in your wallet extension.
          Please approve it to continue.
        </p>
        <div className="flex items-center justify-center mt-2 text-xs text-blue-500">
          <Clock className="w-3 h-3 mr-1 animate-spin" />
          Waiting for approval...
        </div>
      </div>
    </Card>
  )
}

export default function CheckoutForm({ paymentIntentId, amount, contractId }: CheckoutFormProps) {
  const router = useRouter()
  const [status, setStatus] = useState<PaymentStatus>("idle")
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [availableWallets, setAvailableWallets] = useState<WalletProvider[]>([])
  const [selectedWallet, setSelectedWallet] = useState<WalletProvider | null>(null)
  const [copied, setCopied] = useState(false)
  const [qrCodeData, setQrCodeData] = useState<string>("")
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [showWalletPrompt, setShowWalletPrompt] = useState(false)

  // Generate QR code data
  useEffect(() => {
    const amountInMicroSbtc = Math.floor(Number.parseFloat(amount) * 1000000)
    const qrData = `stacks:${SBTC_CONTRACT_ADDRESS}.${SBTC_CONTRACT_NAME}/transfer?amount=${amountInMicroSbtc}&memo=${paymentIntentId}`
    setQrCodeData(qrData)
  }, [amount, paymentIntentId])

  // Detect available wallets
  const detectWallets = useCallback(async () => {
    if (typeof window === "undefined") return

    const wallets: WalletProvider[] = []

    // Check for Leather wallet
    if ((window as any).LeatherProvider) {
      console.log("[Wallet Detection] Found Leather wallet")
      wallets.push({
        name: "Leather",
        provider: (window as any).LeatherProvider,
        detected: true,
      })
    }

    // Check for Hiro Wallet
    if ((window as any).HiroWalletProvider) {
      console.log("[Wallet Detection] Found Hiro wallet")
      wallets.push({
        name: "Hiro",
        provider: (window as any).HiroWalletProvider,
        detected: true,
      })
    }

    if (typeof window !== "undefined") {
      // Check for sats-connect (new Xverse integration)
      if ((window as any).satsConnect && typeof (window as any).satsConnect.request === "function") {
        console.log("[Wallet Detection] Found Xverse wallet (sats-connect)")
        wallets.push({
          name: "Xverse",
          provider: (window as any).satsConnect,
          detected: true,
        })
      }
      // Check for XverseProviders.StacksProvider
      else if (
        (window as any).XverseProviders?.StacksProvider &&
        typeof (window as any).XverseProviders.StacksProvider.request === "function"
      ) {
        console.log("[Wallet Detection] Found Xverse wallet (XverseProviders)")
        wallets.push({
          name: "Xverse",
          provider: (window as any).XverseProviders.StacksProvider,
          detected: true,
        })
      }
    }

    console.log("[Wallet Detection] Total wallets found:", wallets.length)
    setAvailableWallets(wallets)

    // Auto-select first available wallet
    if (wallets.length > 0 && !selectedWallet) {
      setSelectedWallet(wallets[0])
    }
  }, [selectedWallet])

  // Initial wallet detection with retry
  useEffect(() => {
    let attempts = 0
    const maxAttempts = 10
    const retryDelay = 500

    const tryDetection = () => {
      attempts++
      console.log(`[Checkout] Wallet detection attempt ${attempts}`)

      detectWallets()

      if (availableWallets.length === 0 && attempts < maxAttempts) {
        setTimeout(tryDetection, retryDelay)
      }
    }

    // Initial detection
    tryDetection()
  }, [detectWallets, availableWallets.length])

  const checkWalletBalance = async (
    walletProvider: any,
    walletName: string,
  ): Promise<{ hasEnoughFunds: boolean; balance: number }> => {
    try {
      const amountInMicroSbtc = Math.floor(Number.parseFloat(amount) * 1_000_000)

      let address = ""

      // Get wallet address based on wallet type
      if (walletName === "Hiro") {
        const connectResponse = await walletProvider.request({
          method: "stx_requestAccounts",
        })
        address = connectResponse?.result?.[0] || ""
      } else if (walletName === "Leather") {
        const connectResponse = await walletProvider.request("getAddresses", {})
        address = connectResponse?.result?.addresses?.[0]?.address || ""
      } else if (walletName === "Xverse") {
        if ((window as any).satsConnect) {
          const connectResponse = await (window as any).satsConnect.request("wallet_connect", {
            purposes: ["stacks"],
            message: "Connect to check balance",
          })
          const stacksAddress = connectResponse.result?.addresses?.find((addr: any) => addr.purpose === "stacks")
          address = stacksAddress?.address || ""
        } else if (walletProvider.request) {
          const connectResponse = await walletProvider.request("getAddresses", {})
          address = connectResponse?.result?.addresses?.[0]?.address || ""
        }
      }

      if (!address) {
        throw new Error("Could not retrieve wallet address")
      }

      try {
        const response = await fetch(
          `https://stacks-node-api.testnet.stacks.co/v2/contracts/call-read/${SBTC_CONTRACT_ADDRESS}/${SBTC_CONTRACT_NAME}/get-balance`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              sender: address,
              arguments: [`0x${Buffer.from(address.slice(2), "hex").toString("hex")}`],
            }),
          },
        )

        const balanceData = await response.json()
        const currentBalance = balanceData.result ? Number.parseInt(balanceData.result.replace("u", "")) : 0
        const hasEnoughFunds = currentBalance >= amountInMicroSbtc

        console.log(
          `[Balance Check] Address: ${address}, sBTC Balance: ${currentBalance}, Required: ${amountInMicroSbtc}, Sufficient: ${hasEnoughFunds}`,
        )

        return { hasEnoughFunds, balance: currentBalance }
      } catch (balanceError) {
        console.log("[Balance Check] sBTC balance check failed, assuming sufficient funds:", balanceError)
        return { hasEnoughFunds: true, balance: 0 }
      }
    } catch (error) {
      console.error("[Balance Check Error]:", error)
      return { hasEnoughFunds: true, balance: 0 }
    }
  }

  const handlePayWithWallet = async () => {
    if (!selectedWallet || isProcessingPayment) {
      if (!selectedWallet) setErrorMessage("Please select a wallet first")
      return
    }

    setIsProcessingPayment(true)
    setStatus("connecting")
    setErrorMessage("")
    setShowWalletPrompt(false)

    try {
      // Add detailed logging
      console.log('[DEBUG] Starting payment process with:', {
        wallet: selectedWallet.name,
        amount: amount,
        paymentIntentId: paymentIntentId,
        contractAddress: SBTC_CONTRACT_ADDRESS,
        contractName: SBTC_CONTRACT_NAME,
        network: NETWORK
      })

      console.log(`[Checkout] Checking sBTC balance for ${selectedWallet.name}`)
      const { hasEnoughFunds, balance } = await checkWalletBalance(selectedWallet.provider, selectedWallet.name)

      if (!hasEnoughFunds) {
        const balanceInSbtc = (balance / 1_000_000).toFixed(6)
        setErrorMessage(`Insufficient sBTC funds. Balance: ${balanceInSbtc} sBTC. Required: ${amount} sBTC.`)
        setStatus("failed")
        await updatePaymentStatus(paymentIntentId, "failed", "")
        return
      }

      const amountInMicroSbtc = Math.floor(Number.parseFloat(amount) * 1_000_000)
      const memo = `Payment: ${paymentIntentId}`

      console.log(`[Checkout] Starting sBTC payment with ${selectedWallet.name}`)
      console.log(`[Checkout] Amount: ${amount} sBTC (${amountInMicroSbtc} micro-sBTC), Memo: ${memo}`)

      // Show wallet prompt before making the call
      setShowWalletPrompt(true)
      
      // Add a small delay to ensure wallet is ready
      await new Promise(resolve => setTimeout(resolve, 1000))

      let txId: string | null = null

      try {
        switch (selectedWallet.name) {
          case "Hiro":
            txId = await handleHiroSbtcPayment(selectedWallet.provider, amountInMicroSbtc, memo)
            break
          case "Leather":
            txId = await handleLeatherSbtcPayment(selectedWallet.provider, amountInMicroSbtc, memo)
            break
          case "Xverse":
            txId = await handleXverseSbtcPayment(selectedWallet.provider, amountInMicroSbtc, memo)
            break
          default:
            throw new Error(`Unsupported wallet: ${selectedWallet.name}`)
        }
      } catch (txError: unknown) {
        const error = txError as Error & { code?: string | number }
        console.error('[DEBUG] Transaction error details:', {
          error: error,
          message: error.message,
          code: error.code,
          stack: error.stack
        })
        throw error
      }

      setShowWalletPrompt(false)

      if (txId) {
        console.log(`[Checkout] sBTC transaction submitted successfully: ${txId}`)
        await updatePaymentStatus(paymentIntentId, "pending", txId)

        router.push(`/payment/processing/${paymentIntentId}?tx=${txId}`)
      } else {
        throw new Error("Transaction failed or was cancelled - no transaction ID received")
      }
    } catch (error: unknown) {
      const err = error as Error & { code?: string | number; name?: string }
      console.error('[DEBUG] Payment process failed:', {
        error: err,
        message: err.message,
        code: err.code,
        name: err.name
      })
      
      setShowWalletPrompt(false)
      const errorMsg = getErrorMessage(err)
      setErrorMessage(errorMsg)
      setStatus("failed")
      await updatePaymentStatus(paymentIntentId, "failed", "")
    } finally {
      setIsProcessingPayment(false)
    }
  }

  const handleHiroSbtcPayment = async (provider: any, amount: number, memo: string): Promise<string> => {
    console.log("[Checkout] Starting Hiro sBTC payment process...")

    const connectResponse = await provider.request({
      method: "stx_requestAccounts",
    })

    if (!connectResponse?.result?.length) {
      throw new Error("Please connect your Hiro wallet first")
    }

    const senderAddress = connectResponse.result[0]
    const recipientAddress = process.env.NEXT_PUBLIC_MERCHANT_ADDRESS || SBTC_CONTRACT_ADDRESS

    console.log("[Checkout] Hiro wallet connected, making contract call...")
    console.log("[Checkout] From:", senderAddress, "To:", recipientAddress, "Amount:", amount)

    const contractCallResponse = await provider.request({
      method: "stx_callContract",
      params: {
        contractAddress: SBTC_CONTRACT_ADDRESS,
        contractName: SBTC_CONTRACT_NAME,
        functionName: "transfer",
        functionArgs: [
          amount,
          senderAddress,
          recipientAddress,
          memo || null
        ],
        network: {
          url: NETWORK_CONFIG.url,
          network: NETWORK_CONFIG.network,
          chainId: NETWORK_CONFIG.chainId
        },
        testnet: true
      },
    })

    console.log("[Checkout] Hiro contract call response:", contractCallResponse)

    if (!contractCallResponse?.result?.txid) {
      throw new Error("sBTC transaction was cancelled or failed")
    }

    return contractCallResponse.result.txid
  }

  const handleLeatherSbtcPayment = async (provider: any, amount: number, memo: string): Promise<string> => {
    console.log("[Checkout] Starting Leather sBTC payment...")

    try {
      if (!provider || typeof provider.request !== "function") {
        throw new Error("Leather wallet provider not available")
      }

      console.log("[Checkout] Connecting to Leather wallet...")
      const connectResponse = await provider.request("getAddresses", {})

      if (!connectResponse?.result?.addresses?.length) {
        throw new Error("Failed to get wallet address. Please unlock your Leather wallet and try again.")
      }

      const senderAddress = connectResponse.result.addresses[0].address
      const recipientAddress =
        process.env.NEXT_PUBLIC_MERCHANT_ADDRESS || `${SBTC_CONTRACT_ADDRESS}.${SBTC_CONTRACT_NAME}`

      console.log("[Checkout] Calling sBTC contract transfer function...")
      console.log("[Checkout] Contract:", `${SBTC_CONTRACT_ADDRESS}.${SBTC_CONTRACT_NAME}`)
      console.log("[Checkout] From:", senderAddress, "To:", recipientAddress, "Amount:", amount)

      const contractCallResponse = await provider.request("stx_callContract", {
        contractAddress: SBTC_CONTRACT_ADDRESS,
        contractName: SBTC_CONTRACT_NAME,
        functionName: "transfer",
        functionArgs: [
          amount,
          senderAddress,
          recipientAddress,
          memo || null
        ],
        network: {
          url: NETWORK_CONFIG.url,
          network: NETWORK_CONFIG.network
        }
      })

      console.log("[Checkout] Leather contract call response:", contractCallResponse)

      if (!contractCallResponse?.result?.txid) {
        throw new Error("sBTC transaction was cancelled or failed")
      }

      return contractCallResponse.result.txid
    } catch (connectError: any) {
      console.error("[Checkout] Leather sBTC connection error:", connectError)

      if (connectError.message?.includes("User rejected") || connectError.message?.includes("cancelled")) {
        throw new Error("Payment was cancelled by user")
      }

      if (connectError.message?.includes("unlock")) {
        throw new Error("Please unlock your Leather wallet and try again.")
      }

      throw new Error(`Failed to connect to Leather wallet. Please ensure it's installed, unlocked, and try again.`)
    }
  }

  const handleXverseSbtcPayment = async (provider: any, amount: number, memo: string): Promise<string> => {
    try {
      console.log("[Checkout] Starting Xverse sBTC payment process...")

      let xverseProvider = null
      let connectionMethod = ""

      // Method 1: Check for sats-connect (most reliable)
      if (typeof window !== "undefined" && (window as any).satsConnect) {
        console.log("[Checkout] Found sats-connect API")
        xverseProvider = (window as any).satsConnect
        connectionMethod = "satsConnect"
      }
      // Method 2: Check for XverseProviders.StacksProvider
      else if (typeof window !== "undefined" && (window as any).XverseProviders?.StacksProvider) {
        console.log("[Checkout] Found XverseProviders.StacksProvider")
        xverseProvider = (window as any).XverseProviders.StacksProvider
        connectionMethod = "XverseProviders"
      }
      // Method 3: Check for legacy StacksProvider
      else if (typeof window !== "undefined" && (window as any).StacksProvider) {
        console.log("[Checkout] Found legacy StacksProvider")
        xverseProvider = (window as any).StacksProvider
        connectionMethod = "StacksProvider"
      }

      if (!xverseProvider) {
        throw new Error("Xverse wallet not detected. Please install Xverse extension and refresh the page.")
      }

      console.log(`[Checkout] Using ${connectionMethod} for Xverse connection`)

      if (connectionMethod === "satsConnect") {
        return await handleXverseSbtcWithSatsConnect(xverseProvider, amount, memo)
      } else {
        return await handleXverseSbtcLegacy(xverseProvider, amount, memo)
      }
    } catch (error: any) {
      console.error("[Checkout] Xverse sBTC Payment Error:", error)

      if (error.message?.includes("not detected") || error.message?.includes("not available")) {
        throw new Error("Xverse wallet not found. Please install the Xverse browser extension and refresh the page.")
      }

      if (error.message?.includes("User rejected") || error.message?.includes("cancelled")) {
        throw new Error("Payment was cancelled by user")
      }

      throw new Error("Failed to connect to Xverse wallet. Please ensure it's installed, unlocked, and try again.")
    }
  }

  const handleXverseSbtcWithSatsConnect = async (satsConnect: any, amount: number, memo: string): Promise<string> => {
    try {
      console.log("[Checkout] Connecting via sats-connect for sBTC...")

      if (!satsConnect || typeof satsConnect.request !== "function") {
        throw new Error("sats-connect API not available")
      }

      const connectResponse = await satsConnect.request("wallet_connect", {
        purposes: ["stacks"],
        message: "Connect to complete your sBTC payment",
      })

      if (connectResponse.status !== "success" || !connectResponse.result?.addresses?.length) {
        throw new Error("Failed to connect to Xverse wallet")
      }

      const stacksAddress = connectResponse.result.addresses.find((addr: any) => addr.purpose === "stacks")
      if (!stacksAddress) {
        throw new Error("No Stacks address found in Xverse wallet")
      }

      const senderAddress = stacksAddress.address
      const recipientAddress =
        process.env.NEXT_PUBLIC_MERCHANT_ADDRESS || `${SBTC_CONTRACT_ADDRESS}.${SBTC_CONTRACT_NAME}`

      console.log("[Checkout] Xverse connected successfully, making sBTC contract call...")
      console.log("[Checkout] Contract:", `${SBTC_CONTRACT_ADDRESS}.${SBTC_CONTRACT_NAME}`)
      console.log("[Checkout] From:", senderAddress, "To:", recipientAddress, "Amount:", amount)

      const contractCallResponse = await satsConnect.request("stx_callContract", {
        contractAddress: SBTC_CONTRACT_ADDRESS,
        contractName: SBTC_CONTRACT_NAME,
        functionName: "transfer",
        functionArgs: [
          amount,
          senderAddress,
          recipientAddress,
          memo || null
        ],
        network: NETWORK_CONFIG.network,
      })

      console.log("[Checkout] Xverse contract call response:", contractCallResponse)

      if (contractCallResponse.status !== "success" || !contractCallResponse.result?.txid) {
        throw new Error("sBTC transaction was cancelled or failed")
      }

      return contractCallResponse.result.txid
    } catch (error: any) {
      if (error.message?.includes("User rejected") || error.message?.includes("cancelled")) {
        throw new Error("sBTC payment was cancelled by user")
      }
      throw error
    }
  }

  const handleXverseSbtcLegacy = async (provider: any, amount: number, memo: string): Promise<string> => {
    try {
      console.log("[Checkout] Using legacy Xverse provider for sBTC...")

      if (!provider || typeof provider.request !== "function") {
        throw new Error("Xverse provider not available or missing request method")
      }

      const accounts = await provider.request("getAddresses", {})

      if (!accounts?.result?.addresses?.length) {
        throw new Error("No addresses found in Xverse wallet. Please unlock your wallet.")
      }

      const senderAddress = accounts.result.addresses[0].address
      const recipientAddress =
        process.env.NEXT_PUBLIC_MERCHANT_ADDRESS || `${SBTC_CONTRACT_ADDRESS}.${SBTC_CONTRACT_NAME}`

      console.log("[Checkout] Xverse accounts retrieved, making sBTC contract call...")
      console.log("[Checkout] Contract:", `${SBTC_CONTRACT_ADDRESS}.${SBTC_CONTRACT_NAME}`)
      console.log("[Checkout] From:", senderAddress, "To:", recipientAddress, "Amount:", amount)

      const contractCallResponse = await provider.request("stx_callContract", {
        contractAddress: SBTC_CONTRACT_ADDRESS,
        contractName: SBTC_CONTRACT_NAME,
        functionName: "transfer",
        functionArgs: [
          amount,
          senderAddress,
          recipientAddress,
          memo || null
        ],
        network: NETWORK_CONFIG.network,
      })

      console.log("[Checkout] Xverse legacy contract call response:", contractCallResponse)

      if (!contractCallResponse?.result?.txid) {
        throw new Error("sBTC transaction was cancelled or failed")
      }

      return contractCallResponse.result.txid
    } catch (error: any) {
      if (error.message?.includes("User rejected") || error.message?.includes("cancelled")) {
        throw new Error("sBTC payment was cancelled by user")
      }

      if (error.message?.includes("request") && error.message?.includes("not implemented")) {
        throw new Error(
          "Xverse wallet API not available. Please refresh the page and ensure Xverse is properly loaded.",
        )
      }

      throw error
    }
  }

  // Test wallet connection function (for debugging)
  const testWalletConnection = async () => {
    if (!selectedWallet) {
      console.error("[TEST] No wallet selected")
      return
    }

    try {
      console.log(`[TEST] Testing ${selectedWallet.name} wallet connection...`)
      
      let connectResponse
      
      if (selectedWallet.name === "Hiro") {
        connectResponse = await selectedWallet.provider.request({
          method: "stx_requestAccounts",
        })
        console.log('[TEST] Hiro connection response:', connectResponse)
      } else if (selectedWallet.name === "Leather") {
        connectResponse = await selectedWallet.provider.request("getAddresses", {})
        console.log('[TEST] Leather connection response:', connectResponse)
      }
      
      if (connectResponse) {
        console.log('[TEST] Connection successful!')
        alert('Wallet connection test successful! Check console for details.')
      }
      
    } catch (error) {
      console.error('[TEST] Test failed:', error)
      alert(`Wallet connection test failed: ${(error as Error).message}`)
    }
  }

  const updatePaymentStatus = async (intentId: string, status: string, txHash: string) => {
    try {
      console.log("[Checkout] Updating payment status:", { intentId, status, txHash })

      const response = await fetch(`/api/v1/payment_intents/${intentId}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          tx_hash: txHash,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("[Checkout] Failed to update payment status:", response.status, errorData)
      }
    } catch (error) {
      console.error("[Checkout] Failed to update payment status:", error)
    }
  }

  const getErrorMessage = (error: Error & { code?: string | number }): string => {
    if (
      error.message?.includes("User rejected") ||
      error.message?.includes("cancelled") ||
      error.message?.includes("denied") ||
      error.code === 4001
    ) {
      return "Payment was cancelled"
    }

    if (error.message?.includes("Insufficient") || error.message?.includes("balance")) {
      return error.message
    }

    if (error.message?.includes("connect")) {
      return error.message
    }

    if (error.message?.includes("not found") || error.message?.includes("No compatible wallets")) {
      return "No compatible wallets found. Please install a Stacks wallet."
    }

    if (error.message?.includes("network")) {
      return "Network error. Please check your connection and try again."
    }

    if (error.message?.includes("request") && error.message?.includes("not implemented")) {
      return "Xverse wallet API error. Please refresh the page and try again."
    }

    return error.message || "Payment failed - please try again"
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const retryPayment = () => {
    setStatus("idle")
    setErrorMessage("")
    setIsProcessingPayment(false)
    setShowWalletPrompt(false)
  }

  const refreshWallets = () => {
    setAvailableWallets([])
    setSelectedWallet(null)
    detectWallets()
  }

  const getStatusIcon = () => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-8 h-8 text-green-500" />
      case "pending":
      case "connecting":
        return <Clock className="w-8 h-8 text-blue-500 animate-spin" />
      case "failed":
        return <AlertCircle className="w-8 h-8 text-red-500" />
      default:
        return <Wallet className="w-8 h-8 text-gray-400" />
    }
  }

  const getStatusMessage = () => {
    switch (status) {
      case "connecting":
        return "Connecting to wallet..."
      case "pending":
        return "Processing payment..."
      case "confirmed":
        return "Payment successful!"
      case "failed":
        return errorMessage || "Payment failed"
      default:
        return availableWallets.length > 0 ? "Ready to pay" : "No wallets detected"
    }
  }

  return (
    <div className="space-y-4">
      {/* Debug info */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-blue-600 font-medium mb-1">sBTC Contract:</p>
            <code className="text-xs text-blue-800 font-mono break-all">
              {SBTC_CONTRACT_ADDRESS}.{SBTC_CONTRACT_NAME}
            </code>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => copyToClipboard(`${SBTC_CONTRACT_ADDRESS}.${SBTC_CONTRACT_NAME}`)}
            className="ml-2 flex-shrink-0"
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          </Button>
        </div>
      </Card>

      {/* Status display */}
      <div className="text-center py-4">
        {getStatusIcon()}
        <p className="mt-2 text-sm text-gray-600">{getStatusMessage()}</p>
        <p className="text-xs text-orange-600 mt-1">sBTC Testnet • Amount: {amount} sBTC</p>
      </div>

      {/* Wallet prompt */}
      <WalletPrompt walletName={selectedWallet?.name || ""} isVisible={showWalletPrompt} />

      {/* Wallet selection */}
      {availableWallets.length > 0 && (
        <Card className="p-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Select Wallet:</p>
          <div className="grid gap-2">
            {availableWallets.map((wallet) => (
              <Button
                key={wallet.name}
                variant={selectedWallet?.name === wallet.name ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedWallet(wallet)}
                className="justify-start"
              >
                <Wallet className="w-4 h-4 mr-2" />
                {wallet.name}
              </Button>
            ))}
          </div>
          
          {/* Debug test button - remove in production */}
          {process.env.NODE_ENV === 'development' && selectedWallet && (
            <Button
              onClick={testWalletConnection}
              variant="outline"
              size="sm"
              className="mt-2 w-full bg-yellow-50 border-yellow-200 text-yellow-800"
            >
              Test Wallet Connection
            </Button>
          )}
        </Card>
      )}

      {/* Payment buttons */}
      <div className="space-y-2">
        <Button
          onClick={handlePayWithWallet}
          disabled={!selectedWallet || isProcessingPayment || (status !== "idle" && status !== "failed")}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white"
          size="lg"
        >
          <Wallet className="mr-2 h-5 w-5" />
          {status === "idle" || status === "failed"
            ? selectedWallet
              ? `Pay with ${selectedWallet.name}`
              : "Select Wallet to Pay"
            : status === "connecting"
              ? "Connecting to Wallet..."
              : "Processing Payment..."}
        </Button>

        {status === "failed" && (
          <Button onClick={retryPayment} variant="outline" className="w-full bg-transparent" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        )}
      </div>

      {/* No wallets detected */}
      {availableWallets.length === 0 && (
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <div className="text-center space-y-2">
            <p className="text-sm text-yellow-800">No Stacks wallets detected</p>
            <p className="text-xs text-yellow-700">Please install a wallet extension and refresh this page</p>
            <div className="flex justify-center space-x-2 text-xs">
              <a
                href="https://wallet.hiro.so"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                Hiro Wallet
              </a>
              <span>•</span>
              <a
                href="https://leather.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                Leather Wallet
              </a>
              <span>•</span>
              <a
                href="https://www.xverse.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                Xverse Wallet
              </a>
            </div>
            <div className="text-xs text-yellow-600 mt-2">
              <p>
                <strong>Note:</strong> Make sure wallets are unlocked and connected to testnet
              </p>
            </div>
            <Button onClick={refreshWallets} variant="outline" size="sm" className="mt-2 bg-transparent">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Wallets
            </Button>
          </div>
        </Card>
      )}

      {/* QR Code section */}
      <Card className="p-4 bg-gray-50">
        <p className="text-sm text-gray-600 text-center mb-2">Or scan with mobile wallet:</p>
        <div className="w-40 h-40 bg-white border-2 border-gray-200 mx-auto flex items-center justify-center rounded-lg overflow-hidden">
          {qrCodeData ? (
            <img
              src={generateQRCodeSVG(qrCodeData, 160) || "/placeholder.svg"}
              alt="Payment QR Code"
              className="w-full h-full object-contain"
              onError={(e) => {
                console.error("QR Code failed to load")
                ;(e.target as HTMLImageElement).style.display = "none"
                const parent = (e.target as HTMLImageElement).parentNode as HTMLElement
                if (parent && !parent.querySelector(".qr-fallback")) {
                  const fallback = document.createElement("div")
                  fallback.className = "qr-fallback text-center"
                  fallback.innerHTML =
                    '<div class="h-8 w-8 mx-auto text-gray-400 mb-1">📱</div><span class="text-xs text-gray-400">QR Code</span>'
                  parent.appendChild(fallback)
                }
              }}
            />
          ) : (
            <div className="text-center">
              <QrCode className="h-8 w-8 mx-auto text-gray-400 mb-1" />
              <span className="text-xs text-gray-400">QR Code</span>
            </div>
          )}
        </div>
        <details className="mt-2">
          <summary className="text-xs text-gray-500 cursor-pointer">Show QR Data</summary>
          <p className="text-xs text-gray-400 mt-1 break-all font-mono">{qrCodeData}</p>
          <Button variant="outline" size="sm" onClick={() => copyToClipboard(qrCodeData)} className="mt-2 w-full">
            {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
            Copy QR Data
          </Button>
        </details>
      </Card>

      {/* Faucet link */}
      <Card className="p-3 bg-blue-50 border-blue-200">
        <p className="text-xs text-blue-700 text-center">
          Need testnet sBTC?{" "}
          <a
            href="https://platform.hiro.so/faucet"
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-medium inline-flex items-center"
          >
            Get free tokens
            <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        </p>
      </Card>

      {/* Error display */}
      {errorMessage && status === "failed" && (
        <Card className="p-3 bg-red-50 border-red-200">
          <div className="flex items-center space-x-2 text-red-700">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Payment Failed</span>
          </div>
          <p className="text-xs text-red-600 mt-1">{errorMessage}</p>
          
          {/* Additional debugging info in development */}
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-2">
              <summary className="text-xs text-red-500 cursor-pointer">Debug Info</summary>
              <div className="text-xs text-red-500 mt-1 font-mono">
                <p>Wallet: {selectedWallet?.name}</p>
                <p>Contract: {SBTC_CONTRACT_ADDRESS}.{SBTC_CONTRACT_NAME}</p>
                <p>Network: {NETWORK}</p>
                <p>Amount: {amount} sBTC</p>
                <p>Payment ID: {paymentIntentId}</p>
              </div>
            </details>
          )}
        </Card>
      )}

      {/* Development helper */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="p-3 bg-green-50 border-green-200">
          <details>
            <summary className="text-xs text-green-700 cursor-pointer font-medium">
              Development Debug Info
            </summary>
            <div className="text-xs text-green-600 mt-2 space-y-1">
              <p><strong>Available Wallets:</strong> {availableWallets.map(w => w.name).join(', ') || 'None'}</p>
              <p><strong>Selected Wallet:</strong> {selectedWallet?.name || 'None'}</p>
              <p><strong>Status:</strong> {status}</p>
              <p><strong>Processing:</strong> {isProcessingPayment ? 'Yes' : 'No'}</p>
              <p><strong>Wallet Prompt:</strong> {showWalletPrompt ? 'Showing' : 'Hidden'}</p>
              <p><strong>Contract:</strong> {SBTC_CONTRACT_ADDRESS}.{SBTC_CONTRACT_NAME}</p>
              <p><strong>Network:</strong> {NETWORK}</p>
              <p><strong>Amount:</strong> {amount} sBTC ({Math.floor(Number.parseFloat(amount) * 1_000_000)} micro-sBTC)</p>
              <p><strong>Payment Intent:</strong> {paymentIntentId}</p>
              <Button
                onClick={() => console.log('Current state:', {
                  availableWallets,
                  selectedWallet,
                  status,
                  isProcessingPayment,
                  showWalletPrompt,
                  errorMessage
                })}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                Log State to Console
              </Button>
            </div>
          </details>
        </Card>
      )}
    </div>
  )
}