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

type PaymentStatus = "idle" | "connecting" | "pending" | "confirmed" | "failed"

type WalletProvider = {
  name: string
  provider: any
  detected: boolean
}

const CONTRACT_ADDRESS = "ST33MYKWMAW0E2DAZETJ1Z8RTRZ93D2GB890QWQXS"
const NETWORK = "testnet"

// QR Code generation function using QR Server API
const generateQRCodeSVG = (data: string, size = 160): string => {
  const encodedData = encodeURIComponent(data)
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedData}&format=png&margin=10`
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

  // Generate QR code data
  useEffect(() => {
    const amountInMicroStx = Math.floor(Number.parseFloat(amount) * 1000000)
    const qrData = `stacks:transfer?recipient=${CONTRACT_ADDRESS}&amount=${amountInMicroStx}&memo=${paymentIntentId}`
    setQrCodeData(qrData)
  }, [amount, paymentIntentId])

  // Detect available wallets
  const detectWallets = useCallback(async () => {
    if (typeof window === "undefined") return

    const wallets: WalletProvider[] = []

    // Check for Hiro Wallet
    if ((window as any).HiroWalletProvider) {
      wallets.push({
        name: "Hiro",
        provider: (window as any).HiroWalletProvider,
        detected: true,
      })
    }

    // Check for Leather Wallet
    if ((window as any).LeatherProvider) {
      wallets.push({
        name: "Leather",
        provider: (window as any).LeatherProvider,
        detected: true,
      })
    }

    if (typeof window !== "undefined") {
      // Check for sats-connect (new Xverse integration) - highest priority
      if ((window as any).satsConnect && typeof (window as any).satsConnect.request === "function") {
        wallets.push({
          name: "Xverse",
          provider: (window as any).satsConnect,
          detected: true,
        })
      }
      // Check for XverseProviders.StacksProvider - second priority
      else if (
        (window as any).XverseProviders?.StacksProvider &&
        typeof (window as any).XverseProviders.StacksProvider.request === "function"
      ) {
        wallets.push({
          name: "Xverse",
          provider: (window as any).XverseProviders.StacksProvider,
          detected: true,
        })
      }
      // Check if window.StacksProvider exists - third priority
      else if ((window as any).StacksProvider && typeof (window as any).StacksProvider.request === "function") {
        wallets.push({
          name: "Xverse",
          provider: (window as any).StacksProvider,
          detected: true,
        })
      }
    }

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
      const amountInMicroStx = Math.floor(Number.parseFloat(amount) * 1_000_000)

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

      // Check balance via Stacks API
      const response = await fetch(`https://stacks-node-api.testnet.stacks.co/extended/v1/address/${address}/balances`)
      const balanceData = await response.json()

      const currentBalance = Number.parseInt(balanceData.stx.balance) || 0
      const hasEnoughFunds = currentBalance >= amountInMicroStx

      console.log(
        `[Balance Check] Address: ${address}, Balance: ${currentBalance}, Required: ${amountInMicroStx}, Sufficient: ${hasEnoughFunds}`,
      )

      return { hasEnoughFunds, balance: currentBalance }
    } catch (error) {
      console.error("[Balance Check Error]:", error)
      // If balance check fails, assume sufficient funds to not block payment
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

    try {
      console.log(`[Checkout] Checking balance for ${selectedWallet.name}`)
      const { hasEnoughFunds, balance } = await checkWalletBalance(selectedWallet.provider, selectedWallet.name)

      if (!hasEnoughFunds) {
        const balanceInStx = (balance / 1_000_000).toFixed(6)
        setErrorMessage(
          `Insufficient funds. Balance: ${balanceInStx} STX. Required: ${amount} STX. Get testnet STX from the faucet.`,
        )
        setStatus("failed")
        await updatePaymentStatus(paymentIntentId, "failed", "")
        return
      }

      // Convert sBTC (STX format) to microSTX
      const amountInMicroStx = Math.floor(Number.parseFloat(amount) * 1_000_000)
      const memo = `Payment: ${paymentIntentId}`

      console.log(`[Checkout] Starting payment with ${selectedWallet.name}`)
      console.log(`[Checkout] Amount: ${amount} sBTC (${amountInMicroStx} microSTX), Memo: ${memo}`)

      let txId: string | null = null

      switch (selectedWallet.name) {
        case "Hiro":
          txId = await handleHiroPayment(selectedWallet.provider, amountInMicroStx, memo)
          break
        case "Leather":
          txId = await handleLeatherPayment(selectedWallet.provider, amountInMicroStx, memo)
          break
        case "Xverse":
          txId = await handleXversePayment(selectedWallet.provider, amountInMicroStx, memo)
          break
        default:
          throw new Error(`Unsupported wallet: ${selectedWallet.name}`)
      }

      if (txId) {
        console.log(`[Checkout] Transaction submitted successfully: ${txId}`)
        await updatePaymentStatus(paymentIntentId, "pending", txId)

        // Redirect to processing page like munapay
        router.push(`/payment/processing/${paymentIntentId}?tx=${txId}`)
      } else {
        throw new Error("Transaction failed or was cancelled - no transaction ID received")
      }
    } catch (error: any) {
      console.error("[Checkout] Payment error:", error)
      const errorMsg = getErrorMessage(error)
      setErrorMessage(errorMsg)
      setStatus("failed")
      await updatePaymentStatus(paymentIntentId, "failed", "")
    } finally {
      setIsProcessingPayment(false)
    }
  }

  // Hiro wallet payment
  const handleHiroPayment = async (provider: any, amount: number, memo: string): Promise<string> => {
    const connectResponse = await provider.request({
      method: "stx_requestAccounts",
    })

    if (!connectResponse?.result?.length) {
      throw new Error("Please connect your Hiro wallet first")
    }

    const transferResponse = await provider.request({
      method: "stx_transferTokens",
      params: {
        recipient: CONTRACT_ADDRESS,
        amount: amount.toString(),
        memo,
        network: NETWORK,
      },
    })

    if (!transferResponse?.result?.txid) {
      throw new Error("Transaction was cancelled or failed")
    }

    return transferResponse.result.txid
  }

  const handleLeatherPayment = async (provider: any, amount: number, memo: string): Promise<string> => {
    console.log("[Checkout] Starting Leather payment...")

    try {
      const connectResponse = await provider.request("getAddresses", {})
      if (!connectResponse?.result?.addresses?.length) {
        throw new Error("Please connect your Leather wallet first")
      }
    } catch (connectError) {
      console.error("[Checkout] Leather connection error:", connectError)
      throw new Error("Failed to connect to Leather wallet. Please ensure it's unlocked and try again.")
    }

    const transferResponse = await provider.request("stx_transferTokens", {
      recipient: CONTRACT_ADDRESS,
      amount: amount.toString(),
      memo,
      network: NETWORK,
    })

    if (!transferResponse?.result?.txid) {
      throw new Error("Transaction was cancelled or failed")
    }

    return transferResponse.result.txid
  }

  const handleXversePayment = async (provider: any, amount: number, memo: string): Promise<string> => {
    try {
      console.log("[Checkout] Starting Xverse payment process...")

      // Method 1: Try sats-connect (modern Xverse API)
      if (
        typeof window !== "undefined" &&
        (window as any).satsConnect &&
        typeof (window as any).satsConnect.request === "function"
      ) {
        console.log("[Checkout] Using sats-connect API")
        try {
          return await handleXverseWithSatsConnect((window as any).satsConnect, amount, memo)
        } catch (satsConnectError) {
          console.log("[Checkout] sats-connect failed, trying legacy methods:", satsConnectError)
        }
      }

      // Method 2: Try XverseProviders.StacksProvider first (more reliable)
      if (
        typeof window !== "undefined" &&
        (window as any).XverseProviders?.StacksProvider &&
        typeof (window as any).XverseProviders.StacksProvider.request === "function"
      ) {
        console.log("[Checkout] Using XverseProviders.StacksProvider")
        try {
          return await handleXverseLegacy((window as any).XverseProviders.StacksProvider, amount, memo)
        } catch (xverseProviderError) {
          console.log("[Checkout] XverseProviders failed, trying StacksProvider:", xverseProviderError)
        }
      }

      // Method 3: Try legacy StacksProvider
      if (
        typeof window !== "undefined" &&
        (window as any).StacksProvider &&
        typeof (window as any).StacksProvider.request === "function"
      ) {
        console.log("[Checkout] Using legacy StacksProvider")
        try {
          return await handleXverseLegacy((window as any).StacksProvider, amount, memo)
        } catch (stacksProviderError) {
          console.log("[Checkout] StacksProvider failed:", stacksProviderError)
        }
      }

      // Method 4: Try the provider passed in
      if (provider && typeof provider.request === "function") {
        console.log("[Checkout] Using provided Xverse provider")
        try {
          return await handleXverseLegacy(provider, amount, memo)
        } catch (providerError) {
          console.log("[Checkout] Provided provider failed:", providerError)
        }
      }

      throw new Error(
        "Xverse wallet not properly loaded. Please refresh the page, ensure Xverse extension is installed and unlocked, then try again.",
      )
    } catch (error: any) {
      console.error("[Checkout] Xverse Payment Error:", error)

      if (error.message?.includes("request") && error.message?.includes("not implemented")) {
        throw new Error(
          "Xverse wallet API not available. Please refresh the page and ensure Xverse is properly loaded.",
        )
      }

      throw error
    }
  }

  const handleXverseWithSatsConnect = async (satsConnect: any, amount: number, memo: string): Promise<string> => {
    try {
      console.log("[Checkout] Connecting via sats-connect...")

      const connectResponse = await satsConnect.request("wallet_connect", {
        purposes: ["stacks"],
        message: "Connect to complete your STX payment",
      })

      if (connectResponse.status !== "success" || !connectResponse.result?.addresses?.length) {
        throw new Error("Failed to connect to Xverse wallet")
      }

      const stacksAddress = connectResponse.result.addresses.find((addr: any) => addr.purpose === "stacks")
      if (!stacksAddress) {
        throw new Error("No Stacks address found in Xverse wallet")
      }

      console.log("[Checkout] Xverse connected successfully, making transfer...")

      const transferResponse = await satsConnect.request("stx_transferTokens", {
        recipient: CONTRACT_ADDRESS,
        amount: amount.toString(),
        memo: memo,
        network: NETWORK,
      })

      if (transferResponse.status !== "success" || !transferResponse.result?.txid) {
        throw new Error("Transaction was cancelled or failed")
      }

      return transferResponse.result.txid
    } catch (error: any) {
      if (error.message?.includes("User rejected") || error.message?.includes("cancelled")) {
        throw new Error("Payment was cancelled by user")
      }
      throw error
    }
  }

  const handleXverseLegacy = async (provider: any, amount: number, memo: string): Promise<string> => {
    try {
      console.log("[Checkout] Using legacy Xverse provider...")

      if (!provider || typeof provider.request !== "function") {
        throw new Error("Invalid Xverse provider - missing request method")
      }

      const accounts = await provider.request("getAddresses", {})

      if (!accounts?.result?.addresses?.length) {
        throw new Error("Please connect your Xverse wallet first")
      }

      console.log("[Checkout] Xverse accounts retrieved, making transfer...")

      const transferResponse = await provider.request("stx_transferTokens", {
        recipient: CONTRACT_ADDRESS,
        amount: amount.toString(),
        memo,
        network: NETWORK,
      })

      if (!transferResponse?.result?.txid) {
        throw new Error("Transaction was cancelled or failed")
      }

      return transferResponse.result.txid
    } catch (error: any) {
      if (error.message?.includes("User rejected") || error.message?.includes("cancelled")) {
        throw new Error("Payment was cancelled by user")
      }

      if (error.message?.includes("request") && error.message?.includes("not implemented")) {
        throw new Error(
          "Xverse wallet API not available. Please refresh the page and ensure Xverse is properly loaded.",
        )
      }

      throw error
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

  const getErrorMessage = (error: any): string => {
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
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-blue-600 font-medium mb-1">Contract Address:</p>
            <code className="text-xs text-blue-800 font-mono break-all">{CONTRACT_ADDRESS}</code>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => copyToClipboard(CONTRACT_ADDRESS)}
            className="ml-2 flex-shrink-0"
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          </Button>
        </div>
      </Card>

      <div className="text-center py-4">
        {getStatusIcon()}
        <p className="mt-2 text-sm text-gray-600">{getStatusMessage()}</p>
        <p className="text-xs text-orange-600 mt-1">sBTC Testnet • Amount: {amount} sBTC</p>
      </div>

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
        </Card>
      )}

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
                <strong>Note:</strong> Make sure wallets are unlocked and connected
              </p>
            </div>
            <Button onClick={refreshWallets} variant="outline" size="sm" className="mt-2 bg-transparent">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </Card>
      )}

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

      {errorMessage && status === "failed" && (
        <Card className="p-3 bg-red-50 border-red-200">
          <div className="flex items-center space-x-2 text-red-700">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Payment Failed</span>
          </div>
          <p className="text-xs text-red-600 mt-1">{errorMessage}</p>
        </Card>
      )}
    </div>
  )
}
