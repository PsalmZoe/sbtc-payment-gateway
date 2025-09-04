import { NextResponse } from "next/server"
import { createWebhookEvent } from "@/lib/database"

export async function POST() {
  try {
    // Create a test webhook event
    const testEvent = await createWebhookEvent({
      type: "payment_intent.succeeded",
      paymentIntentId: "test-payment-intent-id",
      dataJson: {
        id: "test-payment-intent-id",
        status: "succeeded",
        amount: "50000",
        tx_hash: "0x1234567890abcdef",
        test: true,
      },
    })

    return NextResponse.json({
      message: "Test webhook event created",
      event: testEvent,
    })
  } catch (error) {
    console.error("[v0] Webhook test error:", error)
    return NextResponse.json({ error: "Failed to create test webhook" }, { status: 500 })
  }
}
