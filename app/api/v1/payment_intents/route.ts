import { type NextRequest, NextResponse } from "next/server"
import { db, findMerchantByApiKey, createPaymentIntent } from "@/lib/database"
import { generateClientSecret, hashApiKey } from "@/lib/auth"
import { generateContractId, registerPaymentIntent } from "@/lib/stacks"
import type { CreatePaymentIntentRequest, CreatePaymentIntentResponse } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    // Extract API key from Authorization header
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid API key" }, { status: 401 })
    }

    const apiKey = authHeader.substring(7)

    // Find merchant by API key
    const merchant = await findMerchantByApiKey(apiKey)
    if (!merchant) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 })
    }

    // Parse request body
    const body: CreatePaymentIntentRequest = await request.json()
    const amount = typeof body.amount === "string" ? Number.parseInt(body.amount) : body.amount

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    // Generate IDs and secrets
    const contractId = generateContractId()
    const clientSecret = generateClientSecret()
    const clientSecretHash = await hashApiKey(clientSecret)

    // Create payment intent in database
    const paymentIntent = await createPaymentIntent({
      contractId,
      merchantId: merchant.id,
      amountSats: BigInt(amount),
      clientSecretHash,
      metadata: body.metadata,
    })

    // Register intent on smart contract (in background)
    if (process.env.STACKS_PRIVATE_KEY) {
      registerPaymentIntent(
        process.env.STACKS_PRIVATE_KEY,
        contractId,
        merchant.stacks_address || merchant.email, // fallback for demo
        BigInt(amount),
      ).catch(console.error) // Don't block response on contract call
    }

    // Build response
    const response: CreatePaymentIntentResponse = {
      id: paymentIntent.id,
      amount: amount.toString(),
      status: "requires_payment",
      clientSecret,
      checkoutUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/${paymentIntent.id}?client_secret=${clientSecret}`,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Payment intent creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const intentId = searchParams.get("id")

  if (!intentId) {
    return NextResponse.json({ error: "Missing payment intent ID" }, { status: 400 })
  }

  try {
    const result = await db.query("SELECT id, amount_sats, status, created_at FROM payment_intents WHERE id = $1", [
      intentId,
    ])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Payment intent not found" }, { status: 404 })
    }

    const intent = result.rows[0]
    return NextResponse.json({
      id: intent.id,
      amount: intent.amount_sats,
      status: intent.status,
      created: Math.floor(new Date(intent.created_at).getTime() / 1000),
    })
  } catch (error) {
    console.error("Payment intent retrieval error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
