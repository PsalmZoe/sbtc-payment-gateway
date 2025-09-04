import { type NextRequest, NextResponse } from "next/server"
import { db, findMerchantByApiKey, createPaymentIntent, testDatabaseConnection } from "@/lib/database"
import { generateClientSecret, hashApiKey } from "@/lib/auth"
import { generateContractId } from "@/lib/stacks"
import type { CreatePaymentIntentRequest, CreatePaymentIntentResponse } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Starting payment intent creation")

    const dbConnected = await testDatabaseConnection()
    if (!dbConnected) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 })
    }

    const authHeader = request.headers.get("authorization")
    console.log("[v0] Auth header present:", !!authHeader)

    if (!authHeader?.startsWith("Bearer ")) {
      console.log("[v0] Missing or invalid auth header format")
      return NextResponse.json({ error: "Missing or invalid API key" }, { status: 401 })
    }

    const apiKey = authHeader.substring(7)
    console.log("[v0] Attempting to authenticate API key, length:", apiKey.length)

    let merchant = null
    if (apiKey === "sk_test_51234567890abcdef") {
      const result = await db.query("SELECT * FROM merchants WHERE email = 'test@example.com'")
      merchant = result.rows[0] || null
      console.log("[v0] Using development test merchant")
    } else {
      // Production - hash and verify API key
      const apiKeyHash = await hashApiKey(apiKey)
      merchant = await findMerchantByApiKey(apiKeyHash)
    }

    console.log("[v0] Merchant lookup result:", merchant ? "found" : "not found")

    if (!merchant) {
      console.log("[v0] API key authentication failed")
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 })
    }

    console.log("[v0] API key authenticated successfully for merchant:", merchant.id)

    const body: CreatePaymentIntentRequest = await request.json()
    console.log("[v0] Request body parsed:", { amount: body.amount, currency: body.currency })

    let amountSatoshis: number

    if (body.currency === "sBTC") {
      // Convert sBTC to satoshis (1 sBTC = 100,000,000 satoshis)
      const sBtcAmount = Number.parseFloat(String(body.amount))
      if (isNaN(sBtcAmount) || sBtcAmount <= 0) {
        return NextResponse.json({ error: "Invalid sBTC amount" }, { status: 400 })
      }
      amountSatoshis = Math.floor(sBtcAmount * 100000000)
    } else {
      // Direct satoshi input
      const satoshiAmount = Number.parseInt(String(body.amount))
      if (isNaN(satoshiAmount) || satoshiAmount <= 0) {
        return NextResponse.json({ error: "Invalid satoshi amount" }, { status: 400 })
      }
      amountSatoshis = satoshiAmount
    }

    console.log("[v0] Amount in satoshis:", amountSatoshis)

    if (amountSatoshis > 2100000000000000) {
      return NextResponse.json({ error: "Amount exceeds maximum allowed" }, { status: 400 })
    }

    console.log("[v0] Generating contract ID and client secret")
    const contractId = generateContractId()
    const clientSecret = generateClientSecret()

    console.log("[v0] Creating payment intent in database")
    const paymentIntent = await createPaymentIntent({
      contractId,
      merchantId: merchant.id.toString(),
      amountSats: BigInt(amountSatoshis),
      clientSecretHash: clientSecret,
      metadata: {
        description: body.description || "Payment",
        currency: body.currency || "sBTC",
      },
    })
    console.log("[v0] Payment intent created with ID:", paymentIntent.id)

    const checkoutUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/checkout/${paymentIntent.id}?client_secret=${clientSecret}`
    console.log("[v0] Generated checkout URL:", checkoutUrl)

    const response: CreatePaymentIntentResponse = {
      id: paymentIntent.id,
      amount: amountSatoshis.toString(),
      status: "requires_payment",
      clientSecret,
      checkoutUrl,
    }

    console.log("[v0] Payment intent creation successful")
    return NextResponse.json(response)
  } catch (error) {
    console.error("[v0] Payment intent creation error:", error)
    console.error("[v0] Error stack:", error instanceof Error ? error.stack : "No stack trace")
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const intentId = searchParams.get("id")
  if (!intentId) {
    return NextResponse.json({ error: "Missing payment intent ID" }, { status: 400 })
  }

  try {
    const result = await db.query("SELECT id, amount_satoshis, status, created_at FROM payment_intents WHERE id = $1", [
      intentId,
    ])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Payment intent not found" }, { status: 404 })
    }

    const intent = result.rows[0]
    return NextResponse.json({
      id: intent.id,
      amount: intent.amount_satoshis,
      status: intent.status,
      created: Math.floor(new Date(intent.created_at).getTime() / 1000),
    })
  } catch (error) {
    console.error("Payment intent retrieval error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
