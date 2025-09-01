import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://localhost:5432/sbtc_gateway",
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
})

export const db = pool

// Helper functions
export async function findMerchantByApiKey(apiKeyHash: string) {
  const result = await db.query("SELECT * FROM merchants WHERE api_key_hash = $1", [apiKeyHash])
  return result.rows[0] || null
}

export async function createPaymentIntent(data: {
  contractId: Buffer
  merchantId: string
  amountSats: bigint
  clientSecretHash: string
  metadata?: Record<string, any>
}) {
  const result = await db.query(
    `
    INSERT INTO payment_intents (contract_id, merchant_id, amount_sats, client_secret_hash, metadata)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `,
    [
      data.contractId,
      data.merchantId,
      data.amountSats.toString(),
      data.clientSecretHash,
      JSON.stringify(data.metadata || {}),
    ],
  )

  return result.rows[0]
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
