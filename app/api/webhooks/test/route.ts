import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("gateway-signature")
    const eventType = request.headers.get("gateway-event-type")
    const eventId = request.headers.get("gateway-event-id")

    console.log("📨 Received webhook:", {
      eventType,
      eventId,
      signature: signature?.substring(0, 20) + "...",
      bodyLength: body.length,
    })

    // In a real merchant implementation, they would verify the signature
    // const isValid = verifyWebhookSignature(body, signature, merchantWebhookSecret)

    const data = JSON.parse(body)

    // Log the webhook data
    console.log("✅ Webhook data:", JSON.stringify(data, null, 2))

    // Respond with success
    return NextResponse.json({
      received: true,
      eventId,
      eventType,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Webhook test error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 400 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Webhook test endpoint is ready",
    instructions: "POST webhook events here to test delivery",
    headers: {
      "Gateway-Signature": "Required - HMAC signature",
      "Gateway-Event-Type": "Event type (e.g., payment_intent.succeeded)",
      "Gateway-Event-Id": "Unique event ID",
    },
  })
}
