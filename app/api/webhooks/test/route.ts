import { type NextRequest, NextResponse } from "next/server"
import { generateWebhookSecret } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { webhook_url, events } = body

    if (!webhook_url || !isValidUrl(webhook_url)) {
      return NextResponse.json({ error: "Invalid webhook URL" }, { status: 400 })
    }

    // Generate new webhook secret
    const webhookSecret = generateWebhookSecret()

    // Return success response with generated webhook secret
    return NextResponse.json({
      id: `wh_${Math.random().toString(36).substr(2, 9)}`,
      webhook_url,
      webhook_secret: webhookSecret,
      events: events || ["payment_intent.succeeded", "payment_intent.failed"],
      active: true,
      created: Math.floor(Date.now() / 1000),
      message: "Webhook endpoint configured successfully",
    })
  } catch (error) {
    console.error("Webhook configuration error:", error)
    return NextResponse.json({ error: "Failed to create webhook" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const mockWebhooks = [
      {
        id: "wh_demo123",
        webhook_url: "https://example.com/webhook",
        webhook_secret: "whsec_***",
        events: ["payment_intent.succeeded", "payment_intent.failed"],
        active: true,
        created: Math.floor(Date.now() / 1000) - 86400,
      },
    ]

    const mockEvents = [
      {
        id: "evt_demo123",
        type: "payment_intent.succeeded",
        delivered: true,
        attempts: 1,
        last_error: null,
        created: Math.floor(Date.now() / 1000) - 3600,
      },
    ]

    return NextResponse.json({
      webhooks: mockWebhooks,
      events: mockEvents,
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
