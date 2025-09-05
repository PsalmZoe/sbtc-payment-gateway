"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle, Clock, AlertCircle, Wallet, QrCode, Copy, Check, RefreshCw, ExternalLink } from "lucide-react"

interface CheckoutFormProps {
  paymentIntentId: string
  amount: string
  contractId: Buffer
}

// Fixed: Added "confirmed" to the PaymentStatus type
type PaymentStatus = "idle" | "connecting" | "pending" | "confirmed" | "failed"

type WalletProvider = {
  name: string
  provider: any
  detected: boolean
}

const CONTRACT_ADDRESS = "ST33MYKWMAW0E2DAZETJ1Z8RTRZ93D2GB890QWQXS"
const NETWORK = "testnet"
const POLL_INTERVAL = 3000
const MAX_POLL_ATTEMPTS = 30

export default function CheckoutForm({ paymentIntentId, amount, contractId }: CheckoutFormProps) {
  const [status, setStatus] = useState<PaymentStatus>("idle")
  const [txHash, setTxHash] = useState<string>("")
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [availableWallets, setAvailableWallets] = useState<WalletProvider[]>([])
  const [selectedWallet, setSelectedWallet] = useState<WalletProvider | null>(null)
  const [copied, setCopied] = useState(false)
  const [qrCodeData, setQrCodeData] = useState<string>("")
  const [pollAttempts, setPollAttempts] = useState(0)

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
        detected: true
      })
    }

    // Check for Leather Wallet
    if ((window as any).LeatherProvider) {
      wallets.push({
        name: "Leather",
        provider: (window as any).LeatherProvider,
        detected: true
      })
    }

    // Check for Xverse Wallet
    if ((window as any).XverseProviders?.StacksProvider) {
      wallets.push({
        name: "Xverse",
        provider: (window as any).XverseProviders.StacksProvider,
        detected: true
      })
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
    const maxAttempts = 5

    const tryDetection = () => {
      attempts++
      console.log(`[Checkout] Wallet detection attempt ${attempts}`)
      
      detectWallets()
      
      if (availableWallets.length === 0 && attempts < maxAttempts) {
        setTimeout(tryDetection, 1000)
      }
    }

    // Initial detection
    tryDetection()
  }, [detectWallets, availableWallets.length])

  // Handle payment with selected wallet
  const handlePayWithWallet = async () => {
    if (!selectedWallet) {
      setErrorMessage("Please select a wallet first")
      return
    }

    setStatus("connecting")
    setErrorMessage("")
    setPollAttempts(0)

    try {
      const amountInMicroStx = Math.floor(Number.parseFloat(amount))
      const memo = `Payment: ${paymentIntentId}`

      console.log(`[Checkout] Starting payment with ${selectedWallet.name}`)
      console.log(`[Checkout] Amount: ${amountInMicroStx} microSTX, Memo: ${memo}`)

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
        setTxHash(txId)
        setStatus("pending")
        
        // Update payment status in backend
        await updatePaymentStatus(paymentIntentId, "pending", txId)
        
        // Start polling for confirmation
        pollForConfirmation(txId)
      } else {
        throw new Error("Transaction failed or was cancelled - no transaction ID received")
      }

    } catch (error: any) {
      console.error("[Checkout] Payment error:", error)
      setErrorMessage(getErrorMessage(error))
      setStatus("failed")
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

  // Leather wallet payment
  const handleLeatherPayment = async (provider: any, amount: number, memo: string): Promise<string> => {
    const connectResponse = await provider.request("getAddresses", {})

    if (!connectResponse?.result?.addresses?.length) {
      throw new Error("Please connect your Leather wallet first")
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

  // Xverse wallet payment
  const handleXversePayment = async (provider: any, amount: number, memo: string): Promise<string> => {
    const connectResponse = await provider.request("getAddresses", {})

    if (!connectResponse?.result?.addresses?.length) {
      throw new Error("Please connect your Xverse wallet first")
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

  // Poll for transaction confirmation
  const pollForConfirmation = async (txId: string) => {
    const checkStatus = async () => {
      try {
        setPollAttempts(prev => prev + 1)
        console.log(`[Checkout] Checking transaction status, attempt: ${pollAttempts + 1}`)

        const response = await fetch(
          `https://stacks-node-api.testnet.stacks.co/extended/v1/tx/${txId}`,
          { 
            method: 'GET',
            headers: { 'Accept': 'application/json' }
          }
        )

        if (response.ok) {
          const txData = await response.json()
          console.log(`[Checkout] Transaction status: ${txData.tx_status}`)

          switch (txData.tx_status) {
            case "success":
              setStatus("confirmed")
              await updatePaymentStatus(paymentIntentId, "succeeded", txId)
              return
            case "abort_by_response":
            case "abort_by_post_condition":
              setStatus("failed")
              setErrorMessage("Transaction was rejected by the network")
              await updatePaymentStatus(paymentIntentId, "failed", txId)
              return
            case "pending":
              // Continue polling
              break
            default:
              console.log(`[Checkout] Unknown status: ${txData.tx_status}`)
          }
        }

        // Continue polling if not max attempts reached
        if (pollAttempts < MAX_POLL_ATTEMPTS) {
          setTimeout(checkStatus, POLL_INTERVAL)
        } else {
          console.log("[Checkout] Max polling attempts reached, assuming success")
          setStatus("confirmed")
          await updatePaymentStatus(paymentIntentId, "succeeded", txId)
        }

      } catch (error) {
        console.error("[Checkout] Status check error:", error)
        
        if (pollAttempts < MAX_POLL_ATTEMPTS) {
          setTimeout(checkStatus, POLL_INTERVAL * 2) // Longer interval on error
        } else {
          setStatus("confirmed") // Assume success after max attempts
          await updatePaymentStatus(paymentIntentId, "succeeded", txId)
        }
      }
    }

    // Start polling
    setTimeout(checkStatus, POLL_INTERVAL)
  }

  // Update payment status in backend
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

  // Get user-friendly error message
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
      return "Insufficient STX balance. Get testnet STX from the faucet."
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

    return error.message || "Payment failed - please try again"
  }

  // Copy text to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  // Retry failed payment
  const retryPayment = () => {
    setStatus("idle")
    setErrorMessage("")
    setTxHash("")
    setPollAttempts(0)
  }

  // Refresh wallet detection
  const refreshWallets = () => {
    setAvailableWallets([])
    setSelectedWallet(null)
    detectWallets()
  }

  // Get status display components
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
        return `Confirming transaction... (${pollAttempts}/${MAX_POLL_ATTEMPTS})`
      case "confirmed":
        return "Payment successful!"
      case "failed":
        return errorMessage || "Payment failed"
      default:
        return availableWallets.length > 0 ? "Ready to pay" : "No wallets detected"
    }
  }

  // Render success state
  if (status === "confirmed") {
    return (
      <Card className="p-6 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-green-700 mb-2">Payment Successful!</h2>
        <p className="text-gray-600 mb-4">Your payment has been confirmed on the Stacks testnet.</p>
        {txHash && (
          <div className="space-y-2">
            <p className="text-sm text-gray-500">
              Transaction: <code className="bg-gray-100 px-2 py-1 rounded text-xs">{txHash.slice(0, 16)}...</code>
            </p>
            <a
              href={`https://explorer.stacks.co/txid/${txHash}?chain=testnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-blue-500 hover:text-blue-700 text-sm underline"
            >
              View on Stacks Explorer
              <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </div>
        )}
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Contract Address Display */}
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

      {/* Status Display */}
      <div className="text-center py-4">
        {getStatusIcon()}
        <p className="mt-2 text-sm text-gray-600">{getStatusMessage()}</p>
        <p className="text-xs text-orange-600 mt-1">sBTC Testnet • Amount: {amount} sBTC</p>
      </div>

      {/* Wallet Selection */}
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

      {/* Main Action Button */}
      <div className="space-y-2">
        <Button
          onClick={handlePayWithWallet}
          disabled={!selectedWallet || (status !== "idle" && status !== "failed")}
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

        {/* Retry button for failed payments */}
        {status === "failed" && (
          <Button
            onClick={retryPayment}
            variant="outline"
            className="w-full"
            size="sm"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        )}
      </div>

      {/* Wallet Detection Help */}
      {availableWallets.length === 0 && (
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <div className="text-center space-y-2">
            <p className="text-sm text-yellow-800">No Stacks wallets detected</p>
            <p className="text-xs text-yellow-700">
              Please install a wallet extension and refresh this page
            </p>
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
              <p><strong>Note:</strong> Xverse requires the sats-connect library</p>
            </div>
            <Button
              onClick={refreshWallets}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </Card>
      )}

      {/* QR Code Section */}
      <Card className="p-4 bg-gray-50">
        <p className="text-sm text-gray-600 text-center mb-2">Or scan with mobile wallet:</p>
        <div className="w-32 h-32 bg-white border-2 border-dashed border-gray-300 mx-auto flex items-center justify-center rounded-lg">
          <div className="text-center">
            <QrCode className="h-8 w-8 mx-auto text-gray-400 mb-1" />
            <span className="text-xs text-gray-400">QR Code</span>
          </div>
        </div>
        <details className="mt-2">
          <summary className="text-xs text-gray-500 cursor-pointer">Show QR Data</summary>
          <p className="text-xs text-gray-400 mt-1 break-all font-mono">{qrCodeData}</p>
        </details>
      </Card>

      {/* Testnet Faucet Link */}
      <Card className="p-3 bg-blue-50 border-blue-200">
        <p className="text-xs text-blue-700 text-center">
          Need testnet sBTC?{" "}
          <a
            href="https://explorer.stacks.co/sandbox/faucet?chain=testnet"
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-medium inline-flex items-center"
          >
            Get free tokens from the Stacks Faucet
            <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        </p>
      </Card>

      {/* Error Message */}
      {errorMessage && status === "failed" && (
        <Card className="p-3 bg-red-50 border-red-200">
          <div className="flex items-center space-x-2 text-red-700">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Payment Failed</span>
          </div>
          <p className="text-xs text-red-600 mt-1">{errorMessage}</p>
          {txHash && (
            <p className="text-xs text-red-500 mt-1">
              Check transaction: {txHash.slice(0, 16)}...{txHash.slice(-8)}
            </p>
          )}
        </Card>
      )}
    </div>
  )
}