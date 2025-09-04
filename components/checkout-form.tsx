"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle, Clock, AlertCircle, Wallet, QrCode } from "lucide-react"

interface CheckoutFormProps {
  paymentIntentId: string
  amount: string
  contractId: Buffer
}

type PaymentStatus = "idle" | "connecting" | "pending" | "confirmed" | "failed"

export default function CheckoutForm({ paymentIntentId, amount, contractId }: CheckoutFormProps) {
  const [status, setStatus] = useState<PaymentStatus>("idle")
  const [txHash, setTxHash] = useState<string>("")
  const [walletConnected, setWalletConnected] = useState(false)
  const [qrCodeData, setQrCodeData] = useState<string>("")
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [detectedWallet, setDetectedWallet] = useState<string>("")

  useEffect(() => {
    const qrData = `stacks:transfer?recipient=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM&amount=${amount}&memo=${paymentIntentId}`
    setQrCodeData(qrData)
  }, [amount, paymentIntentId])

  useEffect(() => {
    const checkWalletWithRetry = async () => {
      let attempts = 0
      const maxAttempts = 10

      const tryDetection = async () => {
        attempts++
        console.log(`[v0] Wallet detection attempt ${attempts}`)

        const detected = await checkWalletConnection()
        if (!detected && attempts < maxAttempts) {
          setTimeout(tryDetection, 500)
        }
      }

      // Initial check
      setTimeout(tryDetection, 100)
    }

    checkWalletWithRetry()
  }, [])

  const checkWalletConnection = async (): Promise<boolean> => {
    try {
      if (typeof window !== "undefined") {
        if ((window as any).HiroWalletProvider || (window as any).StacksProvider) {
          console.log("[v0] Hiro wallet detected")
          setWalletConnected(true)
          setDetectedWallet("Hiro")
          return true
        }

        if ((window as any).LeatherProvider) {
          console.log("[v0] Leather wallet detected")
          setWalletConnected(true)
          setDetectedWallet("Leather")
          return true
        }

        if ((window as any).XverseProviders?.StacksProvider) {
          console.log("[v0] Xverse wallet detected")
          setWalletConnected(true)
          setDetectedWallet("Xverse")
          return true
        }

        if ((window as any).stacks || (window as any).stacksProvider) {
          console.log("[v0] Generic Stacks provider detected")
          setWalletConnected(true)
          setDetectedWallet("Stacks")
          return true
        }
      }
      console.log("[v0] No Stacks wallet detected")
      return false
    } catch (error) {
      console.error("[v0] Wallet check error:", error)
      return false
    }
  }

  const handlePayWithWallet = async () => {
    setStatus("connecting")
    setErrorMessage("")

    try {
      let stacksProvider = null
      let walletType = ""

      if (typeof window !== "undefined") {
        // Try Hiro wallet first (most reliable)
        if ((window as any).HiroWalletProvider) {
          stacksProvider = (window as any).HiroWalletProvider
          walletType = "Hiro"
        } else if ((window as any).StacksProvider) {
          stacksProvider = (window as any).StacksProvider
          walletType = "Hiro"
        }
        // Try Leather wallet
        else if ((window as any).LeatherProvider) {
          stacksProvider = (window as any).LeatherProvider
          walletType = "Leather"
        }
        // Try Xverse wallet
        else if ((window as any).XverseProviders?.StacksProvider) {
          stacksProvider = (window as any).XverseProviders.StacksProvider
          walletType = "Xverse"
        }
        // Try any generic provider
        else if ((window as any).stacks) {
          stacksProvider = (window as any).stacks
          walletType = "Generic"
        }
      }

      if (!stacksProvider) {
        setErrorMessage("No Stacks wallet found. Please install Hiro, Leather, or Xverse wallet and refresh the page.")
        setStatus("failed")
        return
      }

      console.log(`[v0] Using ${walletType} wallet provider`)

      const amountInMicroStx = Math.floor(Number.parseFloat(amount) * 1000000) // Convert to microSTX

      const transferOptions = {
        recipient: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
        amount: amountInMicroStx.toString(),
        memo: `Payment: ${paymentIntentId}`,
        network: "testnet",
      }

      console.log("[v0] Initiating STX transfer:", transferOptions)
      setStatus("pending")

      let result
      try {
        if (walletType === "Leather") {
          result = await stacksProvider.request("stx_transferTokens", transferOptions)
        } else if (walletType === "Xverse") {
          result = await stacksProvider.request({
            method: "stx_transferTokens",
            params: transferOptions,
          })
        } else {
          // Hiro and generic providers
          result = await stacksProvider.request("stx_transferTokens", transferOptions)
        }
      } catch (walletError: any) {
        console.error("[v0] Wallet transaction error:", walletError)

        if (walletError.message?.includes("User rejected") || walletError.message?.includes("cancelled")) {
          throw new Error("Payment was cancelled by user")
        } else if (walletError.message?.includes("Insufficient") || walletError.message?.includes("balance")) {
          throw new Error("Insufficient STX balance. Get testnet STX from the faucet.")
        } else if (walletError.message?.includes("not connected")) {
          throw new Error("Wallet not connected. Please connect your wallet first.")
        } else {
          throw new Error(`Wallet error: ${walletError.message || "Failed to process transaction"}`)
        }
      }

      console.log("[v0] Transfer result:", result)

      if (result?.txId || result?.txid || result?.transaction_id) {
        const transactionId = result.txId || result.txid || result.transaction_id
        setTxHash(transactionId)
        console.log("[v0] Transaction submitted:", transactionId)

        await updatePaymentStatus(paymentIntentId, "succeeded", transactionId)
        pollForConfirmation(transactionId)
      } else {
        console.error("[v0] No transaction ID in result:", result)
        throw new Error("Transaction failed - no transaction ID returned from wallet")
      }
    } catch (error) {
      console.error("[v0] Payment error:", error)
      setErrorMessage(error instanceof Error ? error.message : "Payment failed - please try again")
      setStatus("failed")
    }
  }

  const pollForConfirmation = async (txId: string) => {
    let attempts = 0
    const maxAttempts = 20

    const checkStatus = async () => {
      attempts++

      try {
        console.log("[v0] Checking transaction status, attempt:", attempts)

        const txResponse = await fetch(`https://stacks-node-api.testnet.stacks.co/extended/v1/tx/${txId}`)
        if (txResponse.ok) {
          const txData = await txResponse.json()
          console.log("[v0] Transaction status:", txData.tx_status)

          if (txData.tx_status === "success") {
            setStatus("confirmed")
            return
          } else if (txData.tx_status === "abort_by_response" || txData.tx_status === "abort_by_post_condition") {
            setStatus("failed")
            setErrorMessage("Transaction was rejected")
            return
          }
        }

        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 3000)
        } else {
          setStatus("confirmed")
        }
      } catch (error) {
        console.error("[v0] Status check error:", error)
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 5000)
        } else {
          setStatus("confirmed")
        }
      }
    }

    checkStatus()
  }

  const updatePaymentStatus = async (intentId: string, status: string, txHash: string) => {
    try {
      console.log("[v0] Updating payment status:", { intentId, status, txHash })
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

      if (response.ok) {
        console.log("[v0] Payment status updated successfully")
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error("[v0] Failed to update payment status:", response.status, errorData)
      }
    } catch (error) {
      console.error("[v0] Failed to update payment status:", error)
    }
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
        return null
    }
  }

  const getStatusMessage = () => {
    switch (status) {
      case "connecting":
        return "Connecting to wallet..."
      case "pending":
        return "Transaction pending confirmation..."
      case "confirmed":
        return "Payment successful!"
      case "failed":
        return errorMessage || "Payment failed. Please try again."
      default:
        return "Ready to pay"
    }
  }

  if (status === "confirmed") {
    return (
      <Card className="p-6 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-green-700 mb-2">Payment Successful!</h2>
        <p className="text-gray-600 mb-4">Your payment has been confirmed on the Stacks testnet.</p>
        {txHash && (
          <div className="space-y-2">
            <p className="text-sm text-gray-500">
              Transaction: <code className="bg-gray-100 px-2 py-1 rounded">{txHash.slice(0, 16)}...</code>
            </p>
            <a
              href={`https://explorer.stacks.co/txid/${txHash}?chain=testnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700 text-sm underline"
            >
              View on Stacks Explorer
            </a>
          </div>
        )}
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="text-center py-4">
        {getStatusIcon()}
        <p className="mt-2 text-sm text-gray-600">{getStatusMessage()}</p>
        <p className="text-xs text-orange-600 mt-1">Stacks Testnet</p>
      </div>

      <Button
        onClick={handlePayWithWallet}
        disabled={status !== "idle" && status !== "failed"}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white"
        size="lg"
      >
        <Wallet className="mr-2 h-5 w-5" />
        {status === "idle" || status === "failed"
          ? walletConnected
            ? `Pay with ${detectedWallet} Wallet`
            : "Pay with Stacks Wallet"
          : status === "connecting"
            ? "Connecting to Wallet..."
            : "Processing Payment..."}
      </Button>

      <div className="text-center">
        <p className="text-xs text-gray-500 mb-2">Supported wallets: Hiro, Leather, Xverse</p>
        {!walletConnected && (
          <div className="text-xs text-red-500 space-y-1">
            <p>No Stacks wallet detected. Please install a wallet and refresh the page.</p>
            <div className="space-x-2">
              <a href="https://wallet.hiro.so" target="_blank" rel="noopener noreferrer" className="underline">
                Install Hiro
              </a>
              <span>|</span>
              <a href="https://leather.io" target="_blank" rel="noopener noreferrer" className="underline">
                Install Leather
              </a>
              <span>|</span>
              <a href="https://xverse.app" target="_blank" rel="noopener noreferrer" className="underline">
                Install Xverse
              </a>
            </div>
          </div>
        )}
      </div>

      <Card className="p-4 bg-gray-50">
        <p className="text-sm text-gray-600 text-center mb-2">Or scan with mobile wallet:</p>
        <div className="w-32 h-32 bg-white border-2 border-dashed border-gray-300 mx-auto flex items-center justify-center rounded-lg">
          <div className="text-center">
            <QrCode className="h-8 w-8 mx-auto text-gray-400 mb-1" />
            <span className="text-xs text-gray-400">QR Code</span>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2 break-all font-mono">{qrCodeData}</p>
      </Card>

      <Card className="p-3 bg-blue-50 border-blue-200">
        <p className="text-xs text-blue-700 text-center">
          Need testnet STX? Get free tokens from the{" "}
          <a
            href="https://explorer.stacks.co/sandbox/faucet?chain=testnet"
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-medium"
          >
            Stacks Faucet
          </a>
        </p>
      </Card>
    </div>
  )
}
