import { type NextRequest, NextResponse } from "next/server"
import { subscriptionService } from "@/lib/subscription-service"

export async function GET(request: NextRequest) {
  try {
    // In production, get merchant_id from authenticated user
    const merchantId = request.headers.get("x-merchant-id") || "default-merchant"

    const plans = await subscriptionService.getMerchantPlans(merchantId)

    return NextResponse.json({ plans })
  } catch (error) {
    console.error("[v0] Get subscription plans error:", error)
    return NextResponse.json({ error: "Failed to fetch subscription plans" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // In production, get merchant_id from authenticated user
    const merchantId = request.headers.get("x-merchant-id") || "default-merchant"

    const body = await request.json()
    const { name, description, amount_sats, interval_type, interval_count, trial_period_days, metadata } = body

    // Validation
    if (!name || !amount_sats || !interval_type) {
      return NextResponse.json({ error: "Missing required fields: name, amount_sats, interval_type" }, { status: 400 })
    }

    if (!["day", "week", "month", "year"].includes(interval_type)) {
      return NextResponse.json({ error: "Invalid interval_type. Must be: day, week, month, or year" }, { status: 400 })
    }

    const plan = await subscriptionService.createPlan(merchantId, {
      name,
      description,
      amount_sats: Number.parseInt(amount_sats),
      interval_type,
      interval_count: interval_count || 1,
      trial_period_days: trial_period_days || 0,
      metadata: metadata || {},
    })

    return NextResponse.json({ plan }, { status: 201 })
  } catch (error) {
    console.error("[v0] Create subscription plan error:", error)
    return NextResponse.json({ error: "Failed to create subscription plan" }, { status: 500 })
  }
}
