"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Copy, Check, ExternalLink } from "lucide-react"

interface SuccessPageProps {
  params: { id: string }
}

export default function SuccessPage({ params }: SuccessPageProps) {
  const searchParams = useSearchParams()
  const paymentIntentId = params.id
  const txHash = searchParams.get("tx")

  const [copied, setCopied] = useState(false)
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

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const truncateHash = (hash: string) => {
    if (!hash) return ""
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`
  }

  const truncateAddress = (address: string) => {
    if (!address) return ""
    return `${address.slice(0, 8)}...${address.slice(-6)}`
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-12 h-12 text-green-500" />
        </div>

        {/* Success Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-8">Your payment has been confirmed on the blockchain</p>

        {/* Transaction Hash */}
        {txHash && (
          <div className="bg-green-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Transaction Hash</span>
              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(txHash)} className="h-6 w-6 p-0">
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              </Button>
            </div>
            <p className="text-sm font-mono text-gray-800 break-all">{txHash}</p>
          </div>
        )}

        {/* Payment Details */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-3 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">From Address</span>
            <span className="font-mono text-sm">{truncateAddress("ST2XJ38D8DB4K...Y806SX")}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">To Address</span>
            <span className="font-mono text-sm">{truncateAddress("ST2XQ48SPBHKQ...A7KCJB")}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Amount</span>
            <span className="font-semibold">{paymentDetails?.amount || "0.000497"} sBTC</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Status</span>
            <span className="text-green-600 font-semibold">Confirmed</span>
          </div>
        </div>

        {/* View on Explorer Button */}
        {txHash && (
          <Button
            onClick={() => window.open(`https://explorer.stacks.co/txid/${txHash}?chain=testnet`, "_blank")}
            className="w-full bg-green-500 hover:bg-green-600 text-white"
            size="lg"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            View on Explorer
          </Button>
        )}
      </Card>
    </div>
  )
}
