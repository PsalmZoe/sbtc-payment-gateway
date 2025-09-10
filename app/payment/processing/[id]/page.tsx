"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface ProcessingPageProps {
  params: { id: string }
}

const POLL_INTERVAL = 3000
const MAX_POLL_ATTEMPTS = 30

export default function ProcessingPage({ params }: ProcessingPageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const paymentIntentId = params.id
  const txHash = searchParams.get("tx")

  const [pollAttempts, setPollAttempts] = useState(0)
  const [amount, setAmount] = useState<string>("")

  useEffect(() => {
    // Get payment details
    const fetchPaymentDetails = async () => {
      try {
        const response = await fetch(`/api/v1/payment_intents/${paymentIntentId}`)
        if (response.ok) {
          const data = await response.json()
          setAmount(data.amount || "0.000497")
        }
      } catch (error) {
        console.error("Failed to fetch payment details:", error)
        setAmount("0.000497") // fallback
      }
    }

    fetchPaymentDetails()
  }, [paymentIntentId])

  useEffect(() => {
    if (!txHash) {
      router.push(`/checkout/${paymentIntentId}`)
      return
    }

    const pollForConfirmation = async () => {
      const checkStatus = async () => {
        try {
          setPollAttempts((prev) => prev + 1)
          console.log(`[Processing] Checking transaction status, attempt: ${pollAttempts + 1}`)

          const response = await fetch(`https://stacks-node-api.testnet.stacks.co/extended/v1/tx/${txHash}`, {
            method: "GET",
            headers: { Accept: "application/json" },
          })

          if (response.ok) {
            const txData = await response.json()
            console.log(`[Processing] Transaction status: ${txData.tx_status}`)

            switch (txData.tx_status) {
              case "success":
                console.log("[Processing] Transaction confirmed as successful!")
                await updatePaymentStatus(paymentIntentId, "succeeded", txHash)
                router.push(`/payment/success/${paymentIntentId}?tx=${txHash}`)
                return
              case "abort_by_response":
              case "abort_by_post_condition":
                console.log("[Processing] Transaction failed on network")
                await updatePaymentStatus(paymentIntentId, "failed", txHash)
                router.push(`/payment/failed/${paymentIntentId}?tx=${txHash}`)
                return
              case "pending":
                console.log("[Processing] Transaction still pending...")
                break
              default:
                console.log(`[Processing] Unknown transaction status: ${txData.tx_status}`)
            }
          }

          if (pollAttempts < MAX_POLL_ATTEMPTS) {
            setTimeout(checkStatus, POLL_INTERVAL)
          } else {
            console.log("[Processing] Max polling attempts reached, marking as failed")
            await updatePaymentStatus(paymentIntentId, "failed", txHash)
            router.push(`/payment/failed/${paymentIntentId}?tx=${txHash}&reason=timeout`)
          }
        } catch (error) {
          console.error("[Processing] Status check error:", error)

          if (pollAttempts < MAX_POLL_ATTEMPTS) {
            setTimeout(checkStatus, POLL_INTERVAL * 2)
          } else {
            console.log("[Processing] Max attempts reached after errors, marking as failed")
            await updatePaymentStatus(paymentIntentId, "failed", txHash)
            router.push(`/payment/failed/${paymentIntentId}?tx=${txHash}&reason=error`)
          }
        }
      }

      setTimeout(checkStatus, POLL_INTERVAL)
    }

    pollForConfirmation()
  }, [txHash, paymentIntentId, router, pollAttempts])

  const updatePaymentStatus = async (intentId: string, status: string, txHash: string) => {
    try {
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
        console.error("[Processing] Failed to update payment status:", response.status)
      }
    } catch (error) {
      console.error("[Processing] Failed to update payment status:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 text-center">
        {/* Loading Spinner */}
        <div className="w-20 h-20 mx-auto mb-6 relative">
          <div className="w-20 h-20 border-4 border-gray-200 rounded-full"></div>
          <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          <Loader2 className="w-8 h-8 text-blue-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>

        {/* Processing Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Processing Payment</h1>
        <p className="text-gray-600 mb-1">Waiting for blockchain confirmation...</p>
        <p className="text-gray-500 text-sm mb-8">This may take up to 1 minute.</p>

        {/* Payment Details */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Amount</span>
            <span className="font-semibold">{amount} sBTC</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Network</span>
            <span className="font-semibold">Stacks</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
