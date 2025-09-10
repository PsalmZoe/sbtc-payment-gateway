"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw, ExternalLink } from "lucide-react"

interface FailedPageProps {
  params: { id: string }
}

export default function FailedPage({ params }: FailedPageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const paymentIntentId = params.id
  const txHash = searchParams.get("tx")
  const reason = searchParams.get("reason")

  const [paymentDetails, setPaymentDetails] = useState<any>(null)

  useEffect(() => {
    // Fetch payment details
    const fetchPaymentDetails = async () => {
      try {
        const response = await fetch(`/api/v1/payment_intents/${paymentIntentId}`)
        if (response.ok) {
          const data = await response.json()
          setPaymentDetails(data)
        }
      } catch (error) {
        console.error("Failed to fetch payment details:", error)
      }
    }

    fetchPaymentDetails()
  }, [paymentIntentId])

  const getErrorMessage = () => {
    switch (reason) {
      case "timeout":
        return "Transaction confirmation timeout. The payment may still be processing."
      case "error":
        return "Unable to confirm transaction status. Please check manually."
      case "insufficient_funds":
        return "Insufficient funds in your wallet."
      default:
        return "Payment was not completed successfully."
    }
  }

  const retryPayment = () => {
    router.push(`/checkout/${paymentIntentId}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 text-center">
        {/* Error Icon */}
        <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
          <AlertCircle className="w-12 h-12 text-red-500" />
        </div>

        {/* Error Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h1>
        <p className="text-gray-600 mb-8">{getErrorMessage()}</p>

        {/* Payment Details */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-3 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Amount</span>
            <span className="font-semibold">{paymentDetails?.amount || "0.000497"} sBTC</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Status</span>
            <span className="text-red-600 font-semibold">Failed</span>
          </div>
          {txHash && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Transaction</span>
              <span className="font-mono text-sm">
                {txHash.slice(0, 8)}...{txHash.slice(-8)}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button onClick={retryPayment} className="w-full bg-blue-500 hover:bg-blue-600 text-white" size="lg">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>

          {txHash && (
            <Button
              onClick={() => window.open(`https://explorer.stacks.co/txid/${txHash}?chain=testnet`, "_blank")}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              View on Explorer
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
