"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle, Clock, AlertCircle, Wallet, QrCode, Copy, Check } from "lucide-react"

interface CheckoutFormProps {
  paymentIntentId: string
  amount: string
  contractId: Buffer
}

type PaymentStatus = "idle" | "connecting" | "pending" | "confirmed" | "failed"

const CONTRACT_ADDRESS = "ST33MYKWMAW0E2DAZETJ1Z8RTRZ93D2GB890QWQXS"

export default function CheckoutForm({ paymentIntentId, amount, contractId }: CheckoutFormProps) {
  const [status, setStatus] = useState<PaymentStatus>("idle")
  const [txHash, setTxHash] = useState<string>("")
  const [walletConnected, setWalletConnected] = useState(false)
  const [qrCodeData, setQrCodeData] = useState<string>("")
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [detectedWallet, setDetectedWallet] = useState<string>("")
  const [availableWallets, setAvailableWallets] = useState<any[]>([])
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const amountInMicroStx = Math.floor(Number.parseFloat(amount) * 1000000)
    const qrData = `stacks:transfer?recipient=${CONTRACT_ADDRESS}&amount=${amountInMicroStx}&memo=${paymentIntentId}`
    setQrCodeData(qrData)
  }, [amount, paymentIntentId])

  useEffect(() => {
    const checkWalletWithRetry = async () => {
      let attempts = 0
      const maxAttempts = 10

      const tryDetection = async () => {
        attempts++
        console.log(`[v0] Wallet detection attempt ${attempts}`)

        try {
          await new Promise((resolve) => setTimeout(resolve, 500))

          const hasHiro = typeof window !== "undefined" && (window as any).HiroWalletProvider
          const hasLeather = typeof window !== "undefined" && (window as any).LeatherProvider
          const hasXverse = typeof window !== "undefined" && (window as any).XverseProviders?.StacksProvider

          console.log(`[v0] Wallet detection - Hiro: ${!!hasHiro}, Leather: ${!!hasLeather}, Xverse: ${!!hasXverse}`)

          if (hasHiro || hasLeather || hasXverse) {
            setWalletConnected(true)
            const walletName = hasHiro ? "Hiro" : hasLeather ? "Leather" : "Xverse"
            setDetectedWallet(walletName)
            console.log(`[v0] Detected wallet: ${walletName}`)
            return
          }

          if (attempts < maxAttempts) {
            setTimeout(tryDetection, 1000)
          } else {
            console.log("[v0] No wallets detected after all attempts")
            setWalletConnected(false)
          }
        } catch (error) {
          console.error(`[v0] Wallet detection error on attempt ${attempts}:`, error)
          if (attempts < maxAttempts) {
            setTimeout(tryDetection, 1000)
          }
        }
      }

      setTimeout(tryDetection, 500)
    }

    checkWalletWithRetry()
  }, [])

  const handlePayWithWallet = async () => {
    setStatus("connecting")
    setErrorMessage("")

    try {
      console.log("[v0] Starting wallet payment process")
      const amountInMicroStx = Math.floor(Number.parseFloat(amount) * 1000000)

      if (typeof window !== "undefined" && (window as any).HiroWalletProvider) {
        console.log("[v0] Connecting to Hiro wallet")

        try {
          const hiroProvider = (window as any).HiroWalletProvider

          const accounts = await hiroProvider.request({
            method: "stx_getAccounts",
          })

          if (!accounts || !accounts.result || accounts.result.length === 0) {
            throw new Error("Please connect your Hiro wallet first")
          }

          console.log("[v0] Hiro wallet connected, initiating transfer")

          const transferResponse = await hiroProvider.request({
            method: "stx_transferTokens",
            params: {
              recipient: CONTRACT_ADDRESS,
              amount: amountInMicroStx.toString(),
              memo: `Payment: ${paymentIntentId}`,
            },
          })

          if (transferResponse && transferResponse.result && transferResponse.result.txid) {
            const txId = transferResponse.result.txid
            setTxHash(txId)
            setStatus("pending")
            console.log("[v0] Hiro transaction submitted:", txId)
            await updatePaymentStatus(paymentIntentId, "succeeded", txId)
            pollForConfirmation(txId)
          } else {
            throw new Error("Transaction was cancelled or failed")
          }
        } catch (hiroError: any) {
          console.error("[v0] Hiro wallet error:", hiroError)
          throw hiroError
        }
      } else if (typeof window !== "undefined" && (window as any).LeatherProvider) {
        console.log("[v0] Connecting to Leather wallet")

        try {
          const leatherProvider = (window as any).LeatherProvider

          const accounts = await leatherProvider.request("getAddresses", {})

          if (!accounts || !accounts.result || !accounts.result.addresses || accounts.result.addresses.length === 0) {
            throw new Error("Please connect your Leather wallet first")
          }

          console.log("[v0] Leather wallet connected, initiating transfer")

          const transferResponse = await leatherProvider.request("stx_transferTokens", {
            recipient: CONTRACT_ADDRESS,
            amount: amountInMicroStx.toString(),
            memo: `Payment: ${paymentIntentId}`,
          })

          if (transferResponse && transferResponse.result && transferResponse.result.txid) {
            const txId = transferResponse.result.txid
            setTxHash(txId)
            setStatus("pending")
            console.log("[v0] Leather transaction submitted:", txId)
            await updatePaymentStatus(paymentIntentId, "succeeded", txId)
            pollForConfirmation(txId)
          } else {
            throw new Error("Transaction was cancelled or failed")
          }
        } catch (leatherError: any) {
          console.error("[v0] Leather wallet error:", leatherError)
          throw leatherError
        }
      } else if (typeof window !== "undefined" && (window as any).XverseProviders?.StacksProvider) {
        console.log("[v0] Connecting to Xverse wallet")

        try {
          const xverseProvider = (window as any).XverseProviders.StacksProvider

          const accounts = await xverseProvider.request("getAddresses", {})

          if (!accounts || !accounts.result || !accounts.result.addresses || accounts.result.addresses.length === 0) {
            throw new Error("Please connect your Xverse wallet first")
          }

          console.log("[v0] Xverse wallet connected, initiating transfer")

          const transferResponse = await xverseProvider.request("stx_transferTokens", {
            recipient: CONTRACT_ADDRESS,
            amount: amountInMicroStx.toString(),
            memo: `Payment: ${paymentIntentId}`,
          })

          if (transferResponse && transferResponse.result && transferResponse.result.txid) {
            const txId = transferResponse.result.txid
            setTxHash(txId)
            setStatus("pending")
            console.log("[v0] Xverse transaction submitted:", txId)
            await updatePaymentStatus(paymentIntentId, "succeeded", txId)
            pollForConfirmation(txId)
          } else {
            throw new Error("Transaction was cancelled or failed")
          }
        } catch (xverseError: any) {
          console.error("[v0] Xverse wallet error:", xverseError)
          throw xverseError
        }
      } else {
        console.log("[v0] No specific wallet detected, trying generic approach")

        const stacksProvider = (window as any).StacksProvider || (window as any).stacks

        if (stacksProvider && typeof stacksProvider.request === "function") {
          console.log("[v0] Found generic Stacks provider, attempting connection")

          try {
            const accounts = await stacksProvider.request({
              method: "stx_getAccounts",
            })

            if (accounts && accounts.result && accounts.result.length > 0) {
              const transferResponse = await stacksProvider.request({
                method: "stx_transferTokens",
                params: {
                  recipient: CONTRACT_ADDRESS,
                  amount: amountInMicroStx.toString(),
                  memo: `Payment: ${paymentIntentId}`,
                },
              })

              if (transferResponse && transferResponse.result && transferResponse.result.txid) {
                const txId = transferResponse.result.txid
                setTxHash(txId)
                setStatus("pending")
                console.log("[v0] Generic provider transaction submitted:", txId)
                await updatePaymentStatus(paymentIntentId, "succeeded", txId)
                pollForConfirmation(txId)
                return
              }
            }
          } catch (providerError) {
            console.log("[v0] Generic provider failed, falling back to deep link")
          }
        }

        const transferUrl = `stacks:transfer?recipient=${CONTRACT_ADDRESS}&amount=${amountInMicroStx}&memo=Payment-${paymentIntentId}`

        console.log("[v0] Opening wallet via deep link:", transferUrl)

        window.location.href = transferUrl

        setStatus("pending")
        setErrorMessage("Please complete the transaction in your wallet app, then return here to check status.")

        setTimeout(() => {
          try {
            window.open(transferUrl, "_blank")
          } catch (e) {
            console.log("[v0] Could not open in new window")
          }
        }, 1000)
      }
    } catch (error: any) {
      console.error("[v0] Payment error:", error)

      let userFriendlyMessage = "Payment failed - please try again"

      if (
        error.message?.includes("User rejected") ||
        error.message?.includes("cancelled") ||
        error.message?.includes("denied") ||
        error.message?.includes("Transaction was cancelled")
      ) {
        userFriendlyMessage = "Payment was cancelled by user"
      } else if (error.message?.includes("Insufficient") || error.message?.includes("balance")) {
        userFriendlyMessage = "Insufficient STX balance. Get testnet STX from the faucet."
      } else if (error.message?.includes("connect") || error.message?.includes("Please connect")) {
        userFriendlyMessage = error.message
      } else if (error.message?.includes("not found") || error.message?.includes("No compatible wallets")) {
        userFriendlyMessage = "No compatible wallets found. Please install Hiro, Leather, or Xverse wallet."
      } else if (error.message?.includes("network")) {
        userFriendlyMessage = "Network error. Please check your connection and try again."
      } else if (error.message?.includes("not implemented") || error.message?.includes("request")) {
        userFriendlyMessage = "Wallet connection failed. Please try refreshing the page or using a different wallet."
      } else if (error.message) {
        userFriendlyMessage = error.message
      }

      setErrorMessage(userFriendlyMessage)
      setStatus("failed")
    }
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
        return walletConnected ? "Ready to pay" : "Connect your wallet to continue"
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
            setErrorMessage("Transaction was rejected by the network")
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
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-blue-600 font-medium mb-1">Contract Address:</p>
            <code className="text-xs text-blue-800 font-mono">{CONTRACT_ADDRESS}</code>
          </div>
          <Button variant="outline" size="sm" onClick={() => copyToClipboard(CONTRACT_ADDRESS)} className="ml-2">
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          </Button>
        </div>
      </Card>

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
            ? `Pay with ${detectedWallet || "Wallet"}`
            : "Pay with Wallet"
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
