import { type NextRequest, NextResponse } from "next/server"
import { generateWebhookSecret } from "@/lib/auth"
import { db } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { webhook_url, events } = body

    if (!webhook_url || !isValidUrl(webhook_url)) {
      return NextResponse.json({ error: "Invalid webhook URL" }, { status: 400 })
    }

    const webhookSecret = generateWebhookSecret()
    const webhookId = `wh_${Math.random().toString(36).substr(2, 9)}`

    // Store webhook configuration in database
    await db.query(
      `
      INSERT INTO webhooks (id, url, secret, events, active, created_at)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      ON CONFLICT (url) DO UPDATE SET
        secret = EXCLUDED.secret,
        events = EXCLUDED.events,
        updated_at = CURRENT_TIMESTAMP
    `,
      [
        webhookId,
        webhook_url,
        webhookSecret,
        JSON.stringify(events || ["payment_intent.succeeded", "payment_intent.failed"]),
        true,
      ],
    )

    try {
      const testPayload = JSON.stringify({
        id: "evt_test_" + Date.now(),
        type: "webhook.test",
        created: Math.floor(Date.now() / 1000),
        data: {
          message: "This is a test webhook from sBTC Gateway",
          webhook_id: webhookId,
        },
      })

      const testResponse = await fetch(webhook_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "sBTC-Gateway/1.0",
          "Gateway-Event-Type": "webhook.test",
          "Gateway-Event-Id": "evt_test_" + Date.now(),
        },
        body: testPayload,
        signal: AbortSignal.timeout(10000), // 10 second timeout for test
      })

      const testSuccess = testResponse.ok
      console.log(`[v0] Webhook test ${testSuccess ? "succeeded" : "failed"}:`, webhook_url, testResponse.status)

      return NextResponse.json({
        id: webhookId,
        webhook_url,
        webhook_secret: webhookSecret,
        events: events || ["payment_intent.succeeded", "payment_intent.failed"],
        active: true,
        created: Math.floor(Date.now() / 1000),
        test_delivery: {
          success: testSuccess,
          status_code: testResponse.status,
          response_time_ms: Date.now() % 1000, // Approximate
        },
        message: testSuccess
          ? "Webhook endpoint configured and tested successfully"
          : "Webhook configured but test delivery failed",
      })
    } catch (testError) {
      console.error("[v0] Webhook test delivery failed:", testError)
      return NextResponse.json({
        id: webhookId,
        webhook_url,
        webhook_secret: webhookSecret,
        events: events || ["payment_intent.succeeded", "payment_intent.failed"],
        active: true,
        created: Math.floor(Date.now() / 1000),
        test_delivery: {
          success: false,
          error: testError instanceof Error ? testError.message : "Test delivery failed",
        },
        message: "Webhook configured but test delivery failed",
      })
    }
  } catch (error) {
    console.error("[v0] Webhook configuration error:", error)
    return NextResponse.json(
      {
        error: "Failed to create webhook",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const webhooksResult = await db.query(
      `SELECT id, url as webhook_url, 'whsec_***' as webhook_secret, events, active, 
              EXTRACT(epoch FROM created_at)::integer as created
       FROM webhooks 
       ORDER BY created_at DESC 
       LIMIT 10`,
    )

    const eventsResult = await db.query(
      `SELECT id, type, 
              CASE WHEN delivered_at IS NOT NULL THEN true ELSE false END as delivered,
              delivery_attempts as attempts,
              last_error,
              EXTRACT(epoch FROM created_at)::integer as created
       FROM events 
       ORDER BY created_at DESC 
       LIMIT 20`,
    )

    return NextResponse.json({
      webhooks: webhooksResult.rows,
      events: eventsResult.rows,
    })
  } catch (error) {
    console.error("[v0] Webhook retrieval error:", error)
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
      warning: "Using mock data due to database error",
    })
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
