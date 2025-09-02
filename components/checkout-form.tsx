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

  useEffect(() => {
    const contractAddress =
      process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.payment-gateway"
    const qrData = `stacks:${contractAddress}/pay-intent?contractId=${contractId.toString("hex")}&amount=${amount}`
    setQrCodeData(qrData)
  }, [contractId, amount])

  useEffect(() => {
    checkWalletConnection()
  }, [])

  const checkWalletConnection = async () => {
    try {
      if (typeof window !== "undefined") {
        // Check for Leather wallet
        if ((window as any).LeatherProvider) {
          setWalletConnected(true)
          return
        }
        // Check for Xverse wallet
        if ((window as any).XverseProviders?.StacksProvider) {
          setWalletConnected(true)
          return
        }
        // Check for generic Stacks provider
        if ((window as any).StacksProvider) {
          setWalletConnected(true)
          return
        }
      }
    } catch (error) {
      console.error("Wallet check error:", error)
    }
  }

  const handlePayWithWallet = async () => {
    setStatus("connecting")

    try {
      let stacksProvider = null

      if (typeof window !== "undefined") {
        // Try Leather first
        if ((window as any).LeatherProvider) {
          stacksProvider = (window as any).LeatherProvider
        }
        // Try Xverse
        else if ((window as any).XverseProviders?.StacksProvider) {
          stacksProvider = (window as any).XverseProviders.StacksProvider
        }
        // Fallback to generic provider
        else if ((window as any).StacksProvider) {
          stacksProvider = (window as any).StacksProvider
        }
      }

      if (!stacksProvider) {
        alert(
          "Please install a Stacks wallet (Leather or Xverse) to continue.\n\nLeather: https://leather.io\nXverse: https://xverse.app",
        )
        setStatus("failed")
        return
      }

      // Request wallet connection
      const accounts = await stacksProvider.request("stx_requestAccounts", {})
      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts connected")
      }

      setStatus("pending")

      const contractAddress =
        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.payment-gateway"
      const [address, contractName] = contractAddress.split(".")

      // Create transaction to call pay-intent
      const txOptions = {
        contractAddress: address,
        contractName: contractName,
        functionName: "pay-intent",
        functionArgs: [`0x${contractId.toString("hex")}`],
        network: "testnet", // Explicitly set testnet
      }

      console.log("[v0] Calling contract with options:", txOptions)
      const result = await stacksProvider.request("stx_contractCall", txOptions)
      console.log("[v0] Transaction result:", result)

      setTxHash(result.txId)

      // Poll for confirmation
      pollForConfirmation(result.txId)
    } catch (error) {
      console.error("Payment error:", error)
      setStatus("failed")
    }
  }

  const pollForConfirmation = async (txId: string) => {
    let attempts = 0
    const maxAttempts = 30 // 1 minute with 2-second intervals

    const checkStatus = async () => {
      attempts++

      try {
        console.log("[v0] Polling payment status, attempt:", attempts)
        const response = await fetch(`/api/v1/payment_intents?id=${paymentIntentId}`)

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const data = await response.json()
        console.log("[v0] Payment status:", data.status)

        if (data.status === "succeeded") {
          setStatus("confirmed")
        } else if (data.status === "failed") {
          setStatus("failed")
        } else if (attempts < maxAttempts) {
          // Continue polling
          setTimeout(checkStatus, 2000)
        } else {
          // Max attempts reached
          console.log("[v0] Max polling attempts reached")
          setStatus("failed")
        }
      } catch (error) {
        console.error("Status check error:", error)
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 5000) // Retry with longer delay
        } else {
          setStatus("failed")
        }
      }
    }

    checkStatus()
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
        return "Payment failed. Please try again."
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
        {status === "idle" || status === "failed" ? "Pay with Stacks Wallet" : "Processing..."}
      </Button>

      <div className="text-center">
        <p className="text-xs text-gray-500 mb-2">Supported wallets: Leather, Xverse</p>
        {!walletConnected && (
          <div className="text-xs text-red-500 space-y-1">
            <p>No Stacks wallet detected.</p>
            <div className="space-x-2">
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
