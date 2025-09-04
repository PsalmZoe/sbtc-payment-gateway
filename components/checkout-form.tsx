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
          console.log("[v0] Leather wallet detected")
          setWalletConnected(true)
          return
        }
        // Check for Xverse wallet
        if ((window as any).XverseProviders?.StacksProvider) {
          console.log("[v0] Xverse wallet detected")
          setWalletConnected(true)
          return
        }
        // Check for generic Stacks provider
        if ((window as any).StacksProvider) {
          console.log("[v0] Generic Stacks provider detected")
          setWalletConnected(true)
          return
        }
      }
      console.log("[v0] No Stacks wallet detected")
    } catch (error) {
      console.error("[v0] Wallet check error:", error)
    }
  }

  const handlePayWithWallet = async () => {
    setStatus("connecting")
    setErrorMessage("")

    try {
      let stacksProvider = null

      if (typeof window !== "undefined") {
        // Try Leather first
        if ((window as any).LeatherProvider) {
          stacksProvider = (window as any).LeatherProvider
          console.log("[v0] Using Leather wallet")
        }
        // Try Xverse
        else if ((window as any).XverseProviders?.StacksProvider) {
          stacksProvider = (window as any).XverseProviders.StacksProvider
          console.log("[v0] Using Xverse wallet")
        }
        // Fallback to generic provider
        else if ((window as any).StacksProvider) {
          stacksProvider = (window as any).StacksProvider
          console.log("[v0] Using generic Stacks provider")
        }
      }

      if (!stacksProvider) {
        setErrorMessage("Please install a Stacks wallet (Leather or Xverse) to continue.")
        setStatus("failed")
        return
      }

      console.log("[v0] Requesting wallet connection...")
      // Request wallet connection
      const accounts = await stacksProvider.request("stx_requestAccounts", {})
      console.log("[v0] Connected accounts:", accounts)

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
        functionArgs: [
          {
            type: "buff",
            value: contractId.toString("hex"),
          },
          {
            type: "principal",
            value: "ST000000000000000000002AMW42H.sbtc-token", // Mock sBTC token for testnet
          },
        ],
        network: "testnet",
        postConditions: [],
      }

      console.log("[v0] Calling contract with options:", txOptions)
      const result = await stacksProvider.request("stx_contractCall", txOptions)
      console.log("[v0] Transaction result:", result)

      if (result.txId) {
        setTxHash(result.txId)
        // Poll for confirmation
        pollForConfirmation(result.txId)
      } else {
        throw new Error("Transaction failed - no transaction ID returned")
      }
    } catch (error) {
      console.error("[v0] Payment error:", error)
      setErrorMessage(error instanceof Error ? error.message : "Payment failed")
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
          setErrorMessage("Payment verification failed")
        } else if (attempts < maxAttempts) {
          // Continue polling
          setTimeout(checkStatus, 2000)
        } else {
          // Max attempts reached - check Stacks explorer
          console.log("[v0] Max polling attempts reached, checking transaction status...")
          try {
            const txResponse = await fetch(`https://stacks-node-api.testnet.stacks.co/extended/v1/tx/${txId}`)
            if (txResponse.ok) {
              const txData = await txResponse.json()
              console.log("[v0] Transaction data from explorer:", txData)

              if (txData.tx_status === "success") {
                // Update payment intent status manually
                await updatePaymentStatus(paymentIntentId, "succeeded", txId)
                setStatus("confirmed")
              } else {
                setStatus("failed")
                setErrorMessage("Transaction failed on blockchain")
              }
            } else {
              setStatus("failed")
              setErrorMessage("Unable to verify transaction status")
            }
          } catch (explorerError) {
            console.error("[v0] Explorer check failed:", explorerError)
            setStatus("failed")
            setErrorMessage("Payment verification timeout")
          }
        }
      } catch (error) {
        console.error("[v0] Status check error:", error)
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 5000) // Retry with longer delay
        } else {
          setStatus("failed")
          setErrorMessage("Payment verification failed")
        }
      }
    }

    checkStatus()
  }

  const updatePaymentStatus = async (intentId: string, status: string, txHash: string) => {
    try {
      await fetch(`/api/v1/payment_intents/${intentId}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          tx_hash: txHash,
        }),
      })
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
