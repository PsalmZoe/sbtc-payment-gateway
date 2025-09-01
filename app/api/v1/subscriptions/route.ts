import { type NextRequest, NextResponse } from "next/server"
import { subscriptionService } from "@/lib/subscription-service"

export async function GET(request: NextRequest) {
  try {
    // In production, get merchant_id from authenticated user
    const merchantId = request.headers.get("x-merchant-id") || "default-merchant"

    const subscriptions = await subscriptionService.getMerchantSubscriptions(merchantId)

    return NextResponse.json({ subscriptions })
  } catch (error) {
    console.error("[v0] Get subscriptions error:", error)
    return NextResponse.json({ error: "Failed to fetch subscriptions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // In production, get merchant_id from authenticated user
    const merchantId = request.headers.get("x-merchant-id") || "default-merchant"

    const body = await request.json()
    const { plan_id, customer_email, customer_name, trial_end, metadata } = body

    // Validation
    if (!plan_id || !customer_email) {
      return NextResponse.json({ error: "Missing required fields: plan_id, customer_email" }, { status: 400 })
    }

    const subscription = await subscriptionService.createSubscription(merchantId, {
      plan_id,
      customer_email,
      customer_name,
      trial_end: trial_end ? new Date(trial_end) : undefined,
      metadata: metadata || {},
    })

    return NextResponse.json({ subscription }, { status: 201 })
  } catch (error) {
    console.error("[v0] Create subscription error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create subscription" },
      { status: 500 },
    )
  }
}
