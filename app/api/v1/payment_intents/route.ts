import { type NextRequest, NextResponse } from "next/server"
import { db, findMerchantByApiKey, createPaymentIntent } from "@/lib/database"
import { generateClientSecret, hashApiKey } from "@/lib/auth"
import { generateContractId, registerPaymentIntent } from "@/lib/stacks"
import type { CreatePaymentIntentRequest, CreatePaymentIntentResponse } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Starting payment intent creation")

    const authHeader = request.headers.get("authorization")
    console.log("[v0] Auth header present:", !!authHeader)

    if (!authHeader?.startsWith("Bearer ")) {
      console.log("[v0] Missing or invalid auth header format")
      return NextResponse.json({ error: "Missing or invalid API key" }, { status: 401 })
    }

    const apiKey = authHeader.substring(7)
    console.log("[v0] Attempting to authenticate API key, length:", apiKey.length)

    const merchant = await findMerchantByApiKey(apiKey)
    console.log("[v0] Merchant lookup result:", merchant ? "found" : "not found")

    if (!merchant) {
      console.log("[v0] API key authentication failed")
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 })
    }

    console.log("[v0] API key authenticated successfully for merchant:", merchant.id)

    const body: CreatePaymentIntentRequest = await request.json()
    console.log("[v0] Request body parsed:", { amount: body.amount, hasMetadata: !!body.metadata })

    const amount = typeof body.amount === "string" ? Number.parseInt(body.amount) : body.amount
    console.log("[v0] Parsed amount:", amount)

    if (!amount || amount <= 0) {
      console.log("[v0] Invalid amount provided")
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    console.log("[v0] Generating contract ID and client secret")
    const contractId = generateContractId()
    const clientSecret = generateClientSecret()
    console.log("[v0] Generated contractId:", contractId, "clientSecret length:", clientSecret.length)

    console.log("[v0] Hashing client secret")
    const clientSecretHash = await hashApiKey(clientSecret)
    console.log("[v0] Client secret hashed successfully")

    console.log("[v0] Creating payment intent in database")
    const paymentIntent = await createPaymentIntent({
      contractId,
      merchantId: merchant.id,
      amountSats: BigInt(amount),
      clientSecretHash,
      metadata: body.metadata,
    })
    console.log("[v0] Payment intent created with ID:", paymentIntent.id)

    // Register intent on-chain in background
    if (process.env.STACKS_PRIVATE_KEY) {
      console.log("[v0] Registering payment intent on-chain")
      registerPaymentIntent(
        process.env.STACKS_PRIVATE_KEY,
        contractId,
        merchant.stacks_address || merchant.email,
        BigInt(amount),
      ).catch((error) => {
        console.error("[v0] On-chain registration failed:", error)
      })
    } else {
      console.log("[v0] No STACKS_PRIVATE_KEY found, skipping on-chain registration")
    }

    const checkoutUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/checkout/${paymentIntent.id}?client_secret=${clientSecret}`
    console.log("[v0] Generated checkout URL:", checkoutUrl)

    const response: CreatePaymentIntentResponse = {
      id: paymentIntent.id,
      amount: amount.toString(),
      status: "requires_payment",
      clientSecret,
      checkoutUrl,
    }

    console.log("[v0] Payment intent creation successful")
    return NextResponse.json(response)
  } catch (error) {
    console.error("[v0] Payment intent creation error:", error)
    console.error("[v0] Error stack:", error instanceof Error ? error.stack : "No stack trace")
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
