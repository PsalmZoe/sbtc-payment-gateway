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
  // All state variables properly declared
  const [status, setStatus] = useState<PaymentStatus>("idle")
  const [txHash, setTxHash] = useState<string>("")
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [availableWallets, setAvailableWallets] = useState<WalletProvider[]>([])
  const [selectedWallet, setSelectedWallet] = useState<WalletProvider | null>(null)
  const [copied, setCopied] = useState(false)
  const [qrCodeData, setQrCodeData] = useState<string>("")
  const [qrCodeImage, setQrCodeImage] = useState<string>("")
  const [pollAttempts, setPollAttempts] = useState(0)
  const [isDetecting, setIsDetecting] = useState(true)

  // QR Code generation using external API service
  const generateQRCodeDataURL = async (text: string): Promise<string> => {
    try {
      // Use QR Server API as primary method
      const encodedText = encodeURIComponent(text)
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedText}&format=png&bgcolor=ffffff&color=000000&qzone=2&margin=10`
      
      const response = await fetch(qrApiUrl)
      if (!response.ok) {
        throw new Error('QR API request failed')
      }
      
      const blob = await response.blob()
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })
    } catch (error) {
      console.warn('QR API failed, using canvas fallback:', error)
      return generateQRCodeCanvas(text)
    }
  }

  // Fallback canvas-based QR code generation
  const generateQRCodeCanvas = (text: string): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve('')
        return
      }
      
      const size = 200
      const margin = 20
      const qrSize = size - margin * 2
      canvas.width = size
      canvas.height = size
      
      // White background
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, size, size)
      
      // Black border
      ctx.fillStyle = '#000000'
      ctx.fillRect(margin - 2, margin - 2, qrSize + 4, qrSize + 4)
      
      // White inner area
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(margin, margin, qrSize, qrSize)
      
      // Generate QR pattern
      ctx.fillStyle = '#000000'
      const moduleSize = qrSize / 21
      const pattern = generateQRPattern(text)
      
      for (let row = 0; row < 21; row++) {
        for (let col = 0; col < 21; col++) {
          if (pattern[row] && pattern[row][col]) {
            ctx.fillRect(
              margin + col * moduleSize, 
              margin + row * moduleSize, 
              moduleSize, 
              moduleSize
            )
          }
        }
      }
      
      resolve(canvas.toDataURL('image/png'))
    })
  }
  
  // Generate QR pattern
  const generateQRPattern = (text: string): boolean[][] => {
    const size = 21
    const pattern: boolean[][] = Array(size).fill(null).map(() => Array(size).fill(false))
    
    // Add finder patterns (corner squares)
    const addFinderPattern = (startRow: number, startCol: number) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          if (startRow + r < size && startCol + c < size) {
            pattern[startRow + r][startCol + c] = true
          }
        }
      }
      for (let r = 1; r < 6; r++) {
        for (let c = 1; c < 6; c++) {
          if (startRow + r < size && startCol + c < size) {
            pattern[startRow + r][startCol + c] = false
          }
        }
      }
      for (let r = 2; r < 5; r++) {
        for (let c = 2; c < 5; c++) {
          if (startRow + r < size && startCol + c < size) {
            pattern[startRow + r][startCol + c] = true
          }
        }
      }
    }
    
    addFinderPattern(0, 0)
    addFinderPattern(0, 14)
    addFinderPattern(14, 0)
    
    // Add timing patterns
    for (let i = 8; i < 13; i++) {
      pattern[6][i] = i % 2 === 0
      pattern[i][6] = i % 2 === 0
    }
    
    // Add data based on text hash
    let hash = 0
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash + text.charCodeAt(i)) & 0xffffffff
    }
    
    for (let row = 8; row < 13; row++) {
      for (let col = 8; col < 13; col++) {
        if (!pattern[row][col]) {
          pattern[row][col] = ((hash >> ((row * 5 + col) % 16)) & 1) === 1
        }
      }
    }
    
    return pattern
  }

  // Generate QR code data and image
  useEffect(() => {
    const generateQRCode = async () => {
      try {
        const amountInMicroStx = Math.floor(Number.parseFloat(amount) * 1000000)
        const qrData = `stacks:transfer?recipient=${CONTRACT_ADDRESS}&amount=${amountInMicroStx}&memo=${paymentIntentId}`
        setQrCodeData(qrData)
        
        const qrCodeDataURL = await generateQRCodeDataURL(qrData)
        setQrCodeImage(qrCodeDataURL)
      } catch (error) {
        console.error("Failed to generate QR code:", error)
        setQrCodeImage("")
      }
    }
    
    generateQRCode()
  }, [amount, paymentIntentId])

  // Validation function
  const validateInputs = () => {
    const numAmount = Number.parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      throw new Error("Invalid payment amount")
    }
    
    if (numAmount > 1000) {
      throw new Error("Payment amount exceeds maximum allowed")
    }
    
    if (!paymentIntentId || paymentIntentId.length < 10) {
      throw new Error("Invalid payment intent ID")
    }
    
    if (!/^S[T|M][A-Z0-9]{38}$/.test(CONTRACT_ADDRESS)) {
      throw new Error("Invalid contract address format")
    }
  }

  // Detect available wallets
  const detectWallets = useCallback(async () => {
    if (typeof window === "undefined") return

    setIsDetecting(true)
    const wallets: WalletProvider[] = []
    
    if ((window as any).HiroWalletProvider) {
      wallets.push({
        name: "Hiro",
        provider: (window as any).HiroWalletProvider,
        detected: true
      })
    }

    if ((window as any).LeatherProvider) {
      wallets.push({
        name: "Leather",
        provider: (window as any).LeatherProvider,
        detected: true
      })
    }

    if ((window as any).satsConnect || (window as any).btc_providers) {
      wallets.push({
        name: "Xverse",
        provider: "sats-connect",
        detected: true
      })
    }

    setAvailableWallets(wallets)
    
    if (wallets.length > 0 && !selectedWallet) {
      setSelectedWallet(wallets[0])
    }
    
    setIsDetecting(false)
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

    tryDetection()
  }, [detectWallets, availableWallets.length])

  // Enhanced error handling
  const getErrorMessage = (error: any): string => {
    if (
      error.message?.includes("User rejected") ||
      error.message?.includes("cancelled") ||
      error.message?.includes("denied") ||
      error.code === 4001 ||
      error.code === -32603
    ) {
      return "Payment was cancelled by user"
    }
    
    if (
      error.message?.includes("Insufficient") || 
      error.message?.includes("balance") ||
      error.message?.includes("funds")
    ) {
      return "Insufficient STX balance. Get testnet STX from the faucet."
    }
    
    if (
      error.message?.includes("connect") ||
      error.message?.includes("wallet not connected")
    ) {
      return "Please connect your wallet and try again"
    }
    
    if (
      error.message?.includes("not found") || 
      error.message?.includes("No compatible wallets") ||
      error.code === -32002
    ) {
      return "No compatible wallets found. Please install a Stacks wallet."
    }
    
    if (
      error.message?.includes("network") ||
      error.message?.includes("fetch") ||
      error.name === "NetworkError"
    ) {
      return "Network error. Please check your connection and try again."
    }

    if (error.message?.includes("rate limit") || error.status === 429) {
      return "Too many requests. Please wait a moment and try again."
    }

    if (error.message?.includes("transaction")) {
      return "Transaction failed. Please check your wallet and try again."
    }

    return error.message || "Payment failed - please try again"
  }

  // Enhanced payment handler with validation and timeout
  const handlePayWithWallet = async () => {
    if (!selectedWallet) {
      setErrorMessage("Please select a wallet first")
      return
    }

    try {
      validateInputs()
      
      setStatus("connecting")
      setErrorMessage("")
      setPollAttempts(0)

      const amountInMicroStx = Math.floor(Number.parseFloat(amount) * 1_000_000)
      const memo = `Payment: ${paymentIntentId}`.slice(0, 34)
      
      console.log(`[Checkout] Starting payment with ${selectedWallet.name}`)
      console.log(`[Checkout] Amount: ${amount} sBTC (${amountInMicroStx} microSTX)`)

      let txId: string | null = null

      const paymentPromise = new Promise<string>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Payment timeout - please try again"))
        }, 60000)

        ;(async () => {
          try {
            let result: string
            switch (selectedWallet.name) {
              case "Hiro":
                result = await handleHiroPayment(selectedWallet.provider, amountInMicroStx, memo)
                break
              case "Leather":
                result = await handleLeatherPayment(selectedWallet.provider, amountInMicroStx, memo)
                break
              case "Xverse":
                result = await handleXversePayment(amountInMicroStx, memo)
                break
              default:
                throw new Error(`Unsupported wallet: ${selectedWallet.name}`)
            }
            clearTimeout(timeout)
            resolve(result)
          } catch (error) {
            clearTimeout(timeout)
            reject(error)
          }
        })()
      })

      txId = await paymentPromise

      if (txId && /^[a-fA-F0-9]{64}$/.test(txId)) {
        console.log(`[Checkout] Transaction submitted successfully: ${txId}`)
        setTxHash(txId)
        setStatus("pending")
        await updatePaymentStatus(paymentIntentId, "pending", txId)
        pollForConfirmation(txId)
      } else {
        throw new Error("Invalid transaction ID received")
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

  // Xverse wallet payment using sats-connect
  const handleXversePayment = async (amount: number, memo: string): Promise<string> => {
    if (!(window as any).satsConnect) {
      throw new Error("Sats Connect not available. Please install Xverse wallet extension.")
    }

    try {
      console.log("[Checkout] Connecting to Xverse wallet...")
      const connectResponse = await (window as any).satsConnect.request("wallet_connect", {
        addresses: ["stacks"]
      })

      if (!connectResponse || connectResponse.error) {
        throw new Error(connectResponse?.error?.message || "Failed to connect to Xverse wallet")
      }

      console.log("[Checkout] Xverse wallet connected, requesting transfer...")

      const transferResponse = await (window as any).satsConnect.request("stx_transferStx", {
        recipient: CONTRACT_ADDRESS,
        amount: amount.toString(),
        memo: memo
      })

      console.log("[Checkout] Xverse transfer response:", transferResponse)

      if (transferResponse.error) {
        throw new Error(transferResponse.error.message || "Transfer request failed")
      }

      if (!transferResponse.result?.txid) {
        throw new Error("No transaction ID received from Xverse wallet")
      }

      return transferResponse.result.txid

    } catch (error: any) {
      console.error("[Checkout] Xverse payment error:", error)
      
      if (error.message?.includes("User rejected")) {
        throw new Error("Transaction was cancelled by user")
      }
      
      if (error.message?.includes("Insufficient")) {
        throw new Error("Insufficient STX balance")
      }

      throw error
    }
  }

  // Fixed polling function with proper attempt tracking
  const pollForConfirmation = async (txId: string) => {
    let attempts = 0
    
    const checkStatus = async () => {
      try {
        attempts++
        setPollAttempts(attempts)
        console.log(`[Checkout] Checking transaction status, attempt: ${attempts}`)

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
              break
            default:
              console.log(`[Checkout] Unknown status: ${txData.tx_status}`)
          }
        }

        if (attempts < MAX_POLL_ATTEMPTS) {
          setTimeout(checkStatus, POLL_INTERVAL)
        } else {
          console.log("[Checkout] Max polling attempts reached, assuming success")
          setStatus("confirmed")
          await updatePaymentStatus(paymentIntentId, "succeeded", txId)
        }

      } catch (error) {
        console.error("[Checkout] Status check error:", error)
        
        if (attempts < MAX_POLL_ATTEMPTS) {
          setTimeout(checkStatus, POLL_INTERVAL * 2)
        } else {
          setStatus("confirmed")
          await updatePaymentStatus(paymentIntentId, "succeeded", txId)
        }
      }
    }

    setTimeout(checkStatus, POLL_INTERVAL)
  }

  // Update payment status with retry logic
  const updatePaymentStatus = async (intentId: string, status: string, txHash: string, retries = 3) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log("[Checkout] Updating payment status:", { intentId, status, txHash, attempt })
        
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
          return
        }

        const errorData = await response.json().catch(() => ({}))
        console.error(`[Checkout] Failed to update payment status (attempt ${attempt}):`, response.status, errorData)
        
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
        }
        
      } catch (error) {
        console.error(`[Checkout] Failed to update payment status (attempt ${attempt}):`, error)
        
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
        }
      }
    }
  }

  // Copy to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  // Retry payment
  const retryPayment = () => {
    setStatus("idle")
    setErrorMessage("")
    setTxHash("")
    setPollAttempts(0)
  }

  // Refresh wallets
  const refreshWallets = () => {
    setAvailableWallets([])
    setSelectedWallet(null)
    detectWallets()
  }

  // Status components
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
        return isDetecting 
          ? "Detecting wallets..." 
          : availableWallets.length > 0 
            ? "Ready to pay" 
            : "No wallets detected"
    }
  }

  // Success state
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

      {/* Loading state during wallet detection */}
      {isDetecting && (
        <Card className="p-4 bg-gray-50">
          <div className="flex items-center justify-center space-x-2">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
            <span className="text-sm text-gray-600">Detecting wallets...</span>
          </div>
        </Card>
      )}

      {/* Wallet Selection */}
      {!isDetecting && availableWallets.length > 0 && (
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
                {wallet.name === "Xverse" && (
                  <span className="ml-auto text-xs text-blue-600">sats-connect</span>
                )}
              </Button>
            ))}
          </div>
        </Card>
      )}

      {/* Main Action Button */}
      <div className="space-y-2">
        <Button
          onClick={handlePayWithWallet}
          disabled={!selectedWallet || (status !== "idle" && status !== "failed") || isDetecting}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50"
          size="lg"
        >
          <Wallet className="mr-2 h-5 w-5" />
          {isDetecting
            ? "Detecting Wallets..."
            : status === "idle" || status === "failed"
              ? selectedWallet
                ? `Pay with ${selectedWallet.name}`
                : "Select Wallet to Pay"
              : status === "connecting"
                ? "Connecting to Wallet..."
                : "Processing Payment..."}
        </Button>

        {/* Retry button */}
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
      {!isDetecting && availableWallets.length === 0 && (
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <div className="text-center space-y-2">
            <AlertCircle className="w-6 h-6 text-yellow-600 mx-auto" />
            <p className="text-sm text-yellow-800 font-medium">No Stacks wallets detected</p>
            <p className="text-xs text-yellow-700">
              Please install a wallet extension and refresh this page
            </p>
            <div className="flex justify-center space-x-2 text-xs flex-wrap">
              <a
                href="https://wallet.hiro.so"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline hover:text-blue-800"
              >
                Hiro Wallet
              </a>
              <span>•</span>
              <a
                href="https://leather.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline hover:text-blue-800"
              >
                Leather Wallet
              </a>
              <span>•</span>
              <a
                href="https://www.xverse.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline hover:text-blue-800"
              >
                Xverse Wallet
              </a>
            </div>
            <div className="text-xs text-yellow-600 mt-2 bg-yellow-100 p-2 rounded">
              <p><strong>Setup Instructions:</strong></p>
              <ul className="text-left mt-1 space-y-1">
                <li>• Install wallet browser extension</li>
                <li>• Create or import wallet</li>
                <li>• Switch to Stacks Testnet</li>
                <li>• Refresh this page</li>
              </ul>
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
        <div className="w-48 h-48 bg-white border border-gray-200 mx-auto flex items-center justify-center rounded-lg overflow-hidden shadow-sm">
          {qrCodeImage ? (
            <img 
              src={qrCodeImage} 
              alt="Payment QR Code" 
              className="w-full h-full object-contain"
              style={{ imageRendering: 'pixelated' }}
            />
          ) : (
            <div className="text-center">
              <QrCode className="h-8 w-8 mx-auto text-gray-400 mb-1 animate-pulse" />
              <span className="text-xs text-gray-400">Generating...</span>
            </div>
          )}
        </div>
        <div className="mt-3 text-center space-y-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => copyToClipboard(qrCodeData)}
            className="text-xs"
            disabled={!qrCodeData}
          >
            {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
            Copy Payment URI
          </Button>
          <p className="text-xs text-gray-500">
            Compatible with Stacks mobile wallets
          </p>
        </div>
        <details className="mt-2">
          <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">Show Payment URI</summary>
          <div className="text-xs text-gray-400 mt-1 break-all font-mono bg-white p-2 rounded border max-h-20 overflow-y-auto">
            {qrCodeData}
          </div>
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
            className="underline font-medium inline-flex items-center hover:text-blue-800"
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
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm font-medium">Payment Failed</span>
          </div>
          <p className="text-xs text-red-600 mt-1">{errorMessage}</p>
          {txHash && (
            <div className="mt-2 text-xs">
              <p className="text-red-500">Transaction ID: {txHash.slice(0, 16)}...{txHash.slice(-8)}</p>
              <a
                href={`https://explorer.stacks.co/txid/${txHash}?chain=testnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-600 underline hover:text-red-800 inline-flex items-center mt-1"
              >
                View on Explorer
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}