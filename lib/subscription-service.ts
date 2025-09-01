import { db } from "./database"

export interface SubscriptionPlan {
  id: string
  merchant_id: string
  name: string
  description?: string
  amount_sats: number
  interval_type: "day" | "week" | "month" | "year"
  interval_count: number
  trial_period_days: number
  active: boolean
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  merchant_id: string
  plan_id: string
  customer_email: string
  customer_name?: string
  status: "active" | "paused" | "canceled" | "past_due" | "trialing"
  current_period_start: string
  current_period_end: string
  trial_end?: string
  cancel_at_period_end: boolean
  canceled_at?: string
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface SubscriptionInvoice {
  id: string
  subscription_id: string
  merchant_id: string
  amount_sats: number
  status: "pending" | "paid" | "failed" | "void"
  period_start: string
  period_end: string
  due_date: string
  paid_at?: string
  payment_intent_id?: string
  attempt_count: number
  next_retry_at?: string
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

class SubscriptionService {
  // Create subscription plan
  async createPlan(
    merchantId: string,
    planData: {
      name: string
      description?: string
      amount_sats: number
      interval_type: "day" | "week" | "month" | "year"
      interval_count?: number
      trial_period_days?: number
      metadata?: Record<string, any>
    },
  ): Promise<SubscriptionPlan> {
    const result = await db.query(
      `
      INSERT INTO subscription_plans (
        merchant_id, name, description, amount_sats, 
        interval_type, interval_count, trial_period_days, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `,
      [
        merchantId,
        planData.name,
        planData.description || null,
        planData.amount_sats,
        planData.interval_type,
        planData.interval_count || 1,
        planData.trial_period_days || 0,
        JSON.stringify(planData.metadata || {}),
      ],
    )

    return result.rows[0]
  }

  // Create subscription
  async createSubscription(
    merchantId: string,
    subscriptionData: {
      plan_id: string
      customer_email: string
      customer_name?: string
      trial_end?: Date
      metadata?: Record<string, any>
    },
  ): Promise<Subscription> {
    // Get plan details
    const planResult = await db.query("SELECT * FROM subscription_plans WHERE id = $1 AND merchant_id = $2", [
      subscriptionData.plan_id,
      merchantId,
    ])

    if (planResult.rows.length === 0) {
      throw new Error("Plan not found")
    }

    const plan = planResult.rows[0]
    const now = new Date()

    // Calculate period dates
    const periodStart = now
    let periodEnd = this.calculateNextPeriodEnd(now, plan.interval_type, plan.interval_count)
    let status: Subscription["status"] = "active"

    // Handle trial period
    if (plan.trial_period_days > 0 || subscriptionData.trial_end) {
      status = "trialing"
      const trialEnd =
        subscriptionData.trial_end || new Date(now.getTime() + plan.trial_period_days * 24 * 60 * 60 * 1000)
      periodEnd = trialEnd
    }

    const result = await db.query(
      `
      INSERT INTO subscriptions (
        merchant_id, plan_id, customer_email, customer_name,
        status, current_period_start, current_period_end, trial_end, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `,
      [
        merchantId,
        subscriptionData.plan_id,
        subscriptionData.customer_email,
        subscriptionData.customer_name || null,
        status,
        periodStart.toISOString(),
        periodEnd.toISOString(),
        subscriptionData.trial_end?.toISOString() || null,
        JSON.stringify(subscriptionData.metadata || {}),
      ],
    )

    return result.rows[0]
  }

  // Generate invoice for subscription
  async generateInvoice(subscriptionId: string): Promise<SubscriptionInvoice> {
    const subscriptionResult = await db.query(
      `
      SELECT s.*, sp.amount_sats 
      FROM subscriptions s 
      JOIN subscription_plans sp ON s.plan_id = sp.id 
      WHERE s.id = $1
    `,
      [subscriptionId],
    )

    if (subscriptionResult.rows.length === 0) {
      throw new Error("Subscription not found")
    }

    const subscription = subscriptionResult.rows[0]
    const now = new Date()
    const dueDate = new Date(subscription.current_period_end)

    const result = await db.query(
      `
      INSERT INTO subscription_invoices (
        subscription_id, merchant_id, amount_sats, status,
        period_start, period_end, due_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `,
      [
        subscriptionId,
        subscription.merchant_id,
        subscription.amount_sats,
        "pending",
        subscription.current_period_start,
        subscription.current_period_end,
        dueDate.toISOString(),
      ],
    )

    return result.rows[0]
  }

  // Process subscription renewals
  async processRenewals(): Promise<void> {
    const now = new Date()

    // Find subscriptions that need renewal
    const subscriptionsResult = await db.query(
      `
      SELECT s.*, sp.amount_sats, sp.interval_type, sp.interval_count
      FROM subscriptions s
      JOIN subscription_plans sp ON s.plan_id = sp.id
      WHERE s.status IN ('active', 'trialing') 
      AND s.current_period_end <= $1
      AND NOT s.cancel_at_period_end
    `,
      [now.toISOString()],
    )

    for (const subscription of subscriptionsResult.rows) {
      try {
        // Generate invoice for the new period
        const invoice = await this.generateInvoice(subscription.id)

        // Update subscription period
        const newPeriodStart = new Date(subscription.current_period_end)
        const newPeriodEnd = this.calculateNextPeriodEnd(
          newPeriodStart,
          subscription.interval_type,
          subscription.interval_count,
        )

        await db.query(
          `
          UPDATE subscriptions 
          SET current_period_start = $1, current_period_end = $2, status = $3
          WHERE id = $4
        `,
          [
            newPeriodStart.toISOString(),
            newPeriodEnd.toISOString(),
            "active", // Remove trialing status after first renewal
            subscription.id,
          ],
        )

        console.log(`[v0] Generated invoice ${invoice.id} for subscription ${subscription.id}`)
      } catch (error) {
        console.error(`[v0] Failed to renew subscription ${subscription.id}:`, error)
      }
    }
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd = true): Promise<Subscription> {
    const updateData = cancelAtPeriodEnd
      ? { cancel_at_period_end: true }
      : { status: "canceled", canceled_at: new Date().toISOString() }

    const result = await db.query(
      `
      UPDATE subscriptions 
      SET ${Object.keys(updateData)
        .map((key, i) => `${key} = $${i + 2}`)
        .join(", ")}
      WHERE id = $1
      RETURNING *
    `,
      [subscriptionId, ...Object.values(updateData)],
    )

    return result.rows[0]
  }

  // Helper method to calculate next period end
  private calculateNextPeriodEnd(start: Date, intervalType: string, intervalCount: number): Date {
    const end = new Date(start)

    switch (intervalType) {
      case "day":
        end.setDate(end.getDate() + intervalCount)
        break
      case "week":
        end.setDate(end.getDate() + intervalCount * 7)
        break
      case "month":
        end.setMonth(end.getMonth() + intervalCount)
        break
      case "year":
        end.setFullYear(end.getFullYear() + intervalCount)
        break
    }

    return end
  }

  // Get merchant's subscription plans
  async getMerchantPlans(merchantId: string): Promise<SubscriptionPlan[]> {
    const result = await db.query("SELECT * FROM subscription_plans WHERE merchant_id = $1 ORDER BY created_at DESC", [
      merchantId,
    ])
    return result.rows
  }

  // Get merchant's subscriptions
  async getMerchantSubscriptions(merchantId: string): Promise<Subscription[]> {
    const result = await db.query("SELECT * FROM subscriptions WHERE merchant_id = $1 ORDER BY created_at DESC", [
      merchantId,
    ])
    return result.rows
  }
}

export const subscriptionService = new SubscriptionService()
