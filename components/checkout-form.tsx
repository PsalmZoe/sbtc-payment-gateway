"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle, Clock, AlertCircle } from "lucide-react"

interface CheckoutFormProps {
  paymentIntentId: string
  amount: string
  contractId: Buffer
}

type PaymentStatus = "idle" | "connecting" | "pending" | "confirmed" | "failed"

export default function CheckoutForm({ paymentIntentId, amount, contractId }: CheckoutFormProps) {
  const [status, setStatus] = useState<PaymentStatus>("idle")
  const [txHash, setTxHash] = useState<string>("")

  const handlePayWithWallet = async () => {
    setStatus("connecting")

    try {
      // Check if Stacks wallet is available
      if (typeof window !== "undefined" && (window as any).StacksProvider) {
        const stacks = (window as any).StacksProvider

        // Request wallet connection
        await stacks.request("stx_requestAccounts", {})

        setStatus("pending")

        // Create transaction to call pay-intent
        const txOptions = {
          contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
          contractName: "payment-gateway",
          functionName: "pay-intent",
          functionArgs: [`0x${contractId.toString("hex")}`],
        }

        const result = await stacks.request("stx_contractCall", txOptions)
        setTxHash(result.txId)

        // Poll for confirmation
        pollForConfirmation(result.txId)
      } else {
        // Fallback: show wallet connection instructions
        alert("Please install a Stacks wallet (Leather or Xverse) to continue")
        setStatus("failed")
      }
    } catch (error) {
      console.error("Payment error:", error)
      setStatus("failed")
    }
  }

  const pollForConfirmation = async (txId: string) => {
    // Poll payment intent status
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/v1/payment_intents/${paymentIntentId}`)
        const data = await response.json()

        if (data.status === "succeeded") {
          setStatus("confirmed")
        } else if (data.status === "failed") {
          setStatus("failed")
        } else {
          // Continue polling
          setTimeout(checkStatus, 2000)
        }
      } catch (error) {
        console.error("Status check error:", error)
        setTimeout(checkStatus, 5000) // Retry with longer delay
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
        <p className="text-gray-600 mb-4">Your payment has been confirmed on the blockchain.</p>
        {txHash && (
          <p className="text-sm text-gray-500">
            Transaction: <code className="bg-gray-100 px-2 py-1 rounded">{txHash.slice(0, 16)}...</code>
          </p>
        )}
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="text-center py-4">
        {getStatusIcon()}
        <p className="mt-2 text-sm text-gray-600">{getStatusMessage()}</p>
      </div>

      <Button
        onClick={handlePayWithWallet}
        disabled={status !== "idle" && status !== "failed"}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white"
        size="lg"
      >
        {status === "idle" || status === "failed" ? "Pay with Stacks Wallet" : "Processing..."}
      </Button>

      <div className="text-center">
        <p className="text-xs text-gray-500">Supported wallets: Leather, Xverse</p>
      </div>

      <Card className="p-4 bg-gray-50">
        <p className="text-sm text-gray-600 text-center mb-2">Or scan with mobile wallet:</p>
        <div className="w-32 h-32 bg-white border-2 border-dashed border-gray-300 mx-auto flex items-center justify-center">
          <span className="text-xs text-gray-400">QR Code will appear here</span>
        </div>
      </Card>
    </div>
  )
}
