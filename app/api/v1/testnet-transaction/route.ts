import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { paymentIntentId, walletAddress, amount } = await request.json()

    // Validate required fields
    if (!paymentIntentId || !walletAddress || !amount) {
      return NextResponse.json(
        { error: "Missing required fields: paymentIntentId, walletAddress, amount" },
        { status: 400 },
      )
    }

    // Process sBTC testnet transaction
    const transactionResult = {
      id: `tx_${Date.now()}`,
      paymentIntentId,
      walletAddress,
      amount,
      currency: "sBTC",
      network: "testnet",
      status: "pending",
      txHash: `0x${Math.random().toString(16).substring(2, 66)}`,
      blockHeight: null,
      confirmations: 0,
      createdAt: new Date().toISOString(),
      estimatedConfirmationTime: "10-15 minutes",
    }

    // Simulate testnet processing
    setTimeout(async () => {
      // Update transaction status to confirmed after delay
      console.log(`[v0] Transaction ${transactionResult.id} confirmed on testnet`)
    }, 30000) // 30 seconds for demo

    return NextResponse.json({
      success: true,
      transaction: transactionResult,
      message: "sBTC testnet transaction initiated successfully",
    })
  } catch (error) {
    console.error("[v0] Testnet transaction error:", error)
    return NextResponse.json({ error: "Failed to process testnet transaction" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const txId = searchParams.get("txId")

  if (!txId) {
    return NextResponse.json({ error: "Transaction ID required" }, { status: 400 })
  }

  // Mock transaction status check
  const transaction = {
    id: txId,
    status: "confirmed",
    confirmations: 6,
    blockHeight: 123456,
    txHash: `0x${Math.random().toString(16).substring(2, 66)}`,
    network: "testnet",
  }

  return NextResponse.json({ transaction })
}
