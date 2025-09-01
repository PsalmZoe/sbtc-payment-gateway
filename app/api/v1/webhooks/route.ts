import { type NextRequest, NextResponse } from "next/server"
import { db, findMerchantByApiKey } from "@/lib/database"
import { generateWebhookSecret } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    // Extract API key
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid API key" }, { status: 401 })
    }

    const apiKey = authHeader.substring(7)
    const merchant = await findMerchantByApiKey(apiKey)

    if (!merchant) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 })
    }

    const { webhook_url } = await request.json()

    if (!webhook_url || !isValidUrl(webhook_url)) {
      return NextResponse.json({ error: "Invalid webhook URL" }, { status: 400 })
    }

    // Generate new webhook secret
    const webhookSecret = generateWebhookSecret()

    // Update merchant webhook configuration
    await db.query(
      `
      UPDATE merchants 
      SET webhook_url = $1, webhook_secret = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
    `,
      [webhook_url, webhookSecret, merchant.id],
    )

    return NextResponse.json({
      webhook_url,
      webhook_secret: webhookSecret,
      message: "Webhook endpoint configured successfully",
    })
  } catch (error) {
    console.error("Webhook configuration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Extract API key
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid API key" }, { status: 401 })
    }

    const apiKey = authHeader.substring(7)
    const merchant = await findMerchantByApiKey(apiKey)

    if (!merchant) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 })
    }

    // Get recent webhook events for this merchant
    const result = await db.query(
      `
      SELECT e.id, e.type, e.delivered_at, e.delivery_attempts, e.last_error, e.created_at
      FROM events e
      JOIN payment_intents pi ON e.payment_intent_id = pi.id
      WHERE pi.merchant_id = $1
      ORDER BY e.created_at DESC
      LIMIT 50
    `,
      [merchant.id],
    )

    return NextResponse.json({
      webhook_url: merchant.webhook_url,
      webhook_secret: merchant.webhook_secret ? "whsec_***" : null,
      events: result.rows.map((event) => ({
        id: event.id,
        type: event.type,
        delivered: !!event.delivered_at,
        attempts: event.delivery_attempts,
        last_error: event.last_error,
        created: Math.floor(new Date(event.created_at).getTime() / 1000),
      })),
    })
  } catch (error) {
    console.error("Webhook retrieval error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function isValidUrl(string: string): boolean {
  try {
    const url = new URL(string)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}
