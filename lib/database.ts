import { Pool } from "pg"
import * as crypto from "crypto"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://localhost:5432/sbtc_gateway",
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

export const db = pool

// Helper functions
export async function findMerchantByApiKey(apiKeyHash: string) {
  try {
    const result = await db.query("SELECT * FROM merchants WHERE api_key_hash = $1", [apiKeyHash])
    return result.rows[0] || null
  } catch (error) {
    console.error("Database error in findMerchantByApiKey:", error)
    return null
  }
}

export async function createPaymentIntent(data: {
  contractId: Buffer
  merchantId: string
  amountSats: bigint
  clientSecretHash: string
  metadata?: Record<string, any>
}) {
  try {
    const paymentId = crypto.randomUUID()
    const result = await db.query(
      `
      INSERT INTO payment_intents (id, merchant_id, amount_satoshis, status, description, created_at)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      RETURNING *
    `,
      [paymentId, data.merchantId, data.amountSats.toString(), "pending", data.metadata?.description || "Payment"],
    )

    return result.rows[0]
  } catch (error) {
    console.error("Database error in createPaymentIntent:", error)
    throw error
  }
}

export async function updatePaymentIntentStatus(id: string, status: string, txHash?: string, blockHeight?: bigint) {
  const result = await db.query(
    `
    UPDATE payment_intents 
    SET status = $2, tx_hash = $3, block_height = $4, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
  `,
    [id, status, txHash, blockHeight?.toString()],
  )

  return result.rows[0]
}

export async function createWebhookEvent(data: {
  type: string
  paymentIntentId?: string
  dataJson: Record<string, any>
}) {
  const result = await db.query(
    `
    INSERT INTO events (type, payment_intent_id, data_json)
    VALUES ($1, $2, $3)
    RETURNING *
  `,
    [data.type, data.paymentIntentId, JSON.stringify(data.dataJson)],
  )

  return result.rows[0]
}

export async function markWebhookDelivered(eventId: string) {
  const result = await db.query(
    `
    UPDATE events 
    SET delivered_at = CURRENT_TIMESTAMP, delivery_attempts = delivery_attempts + 1
    WHERE id = $1
    RETURNING *
  `,
    [eventId],
  )

  return result.rows[0]
}

export async function updateWebhookAttempt(eventId: string, error: string) {
  const result = await db.query(
    `
    UPDATE events 
    SET delivery_attempts = delivery_attempts + 1, last_error = $2, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
  `,
    [eventId, error],
  )

  return result.rows[0]
}

export async function getFailedWebhooks(maxAttempts = 5, hoursBack = 24) {
  const result = await db.query(
    `
    SELECT e.*, m.webhook_url, m.webhook_secret, m.name as merchant_name
    FROM events e
    JOIN payment_intents pi ON e.payment_intent_id = pi.id
    JOIN merchants m ON pi.merchant_id = m.id
    WHERE e.delivered_at IS NULL 
      AND e.delivery_attempts < $1
      AND e.created_at > NOW() - INTERVAL '${hoursBack} hours'
      AND m.webhook_url IS NOT NULL
    ORDER BY e.created_at ASC
  `,
    [maxAttempts],
  )

  return result.rows
}

export async function testDatabaseConnection() {
  try {
    const result = await db.query("SELECT NOW() as current_time")
    console.log("[v0] Database connection successful:", result.rows[0])
    return true
  } catch (error) {
    console.error("[v0] Database connection failed:", error)
    return false
  }
}

export async function createTestMerchant() {
  try {
    // Check if test merchant already exists
    const existing = await db.query("SELECT id FROM merchants WHERE email = 'test@example.com'")
    if (existing.rows.length > 0) {
      console.log("[v0] Test merchant already exists")
      return existing.rows[0]
    }

    const result = await db.query(
      `
      INSERT INTO merchants (
        name, 
        email, 
        api_key_hash, 
        stacks_address
      ) VALUES ($1, $2, $3, $4)
      RETURNING *
    `,
      [
        "Test Merchant",
        "test@example.com",
        "$2b$10$rOvHPw5f.Uocr6mBwMhrSOBvYUoH.j0hn77YCE6qUwlO/ZAZP2ema", // bcrypt hash of 'sk_test_51234567890abcdef'
        "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
      ],
    )

    console.log("[v0] Test merchant created:", result.rows[0].id)
    return result.rows[0]
  } catch (error) {
    console.error("[v0] Failed to create test merchant:", error)
    throw error
  }
}