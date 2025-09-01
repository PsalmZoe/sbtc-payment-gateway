import { db } from "./database"
import { createWebhookSignature } from "./auth"

interface WebhookEvent {
  id: string
  type: string
  payment_intent_id?: string
  data_json: any
  delivered_at?: Date
  delivery_attempts: number
  last_error?: string
  created_at: Date
}

interface Merchant {
  id: string
  webhook_url?: string
  webhook_secret?: string
}

const MAX_RETRY_ATTEMPTS = 5
const INITIAL_RETRY_DELAY = 1000 // 1 second
const MAX_RETRY_DELAY = 300000 // 5 minutes

export async function deliverWebhook(eventId: string): Promise<boolean> {
  try {
    // Get event and merchant details
    const result = await db.query(
      `
      SELECT e.*, m.webhook_url, m.webhook_secret, m.name as merchant_name
      FROM events e
      JOIN payment_intents pi ON e.payment_intent_id = pi.id
      JOIN merchants m ON pi.merchant_id = m.id
      WHERE e.id = $1
    `,
      [eventId],
    )

    if (result.rows.length === 0) {
      console.error(`❌ Event ${eventId} not found`)
      return false
    }

    const event = result.rows[0]

    if (!event.webhook_url) {
      console.log(`⚠️ No webhook URL configured for merchant ${event.merchant_name}`)
      return true // Not an error, just no webhook configured
    }

    return await attemptWebhookDelivery(event)
  } catch (error) {
    console.error(`❌ Error delivering webhook ${eventId}:`, error)
    return false
  }
}

async function attemptWebhookDelivery(event: any): Promise<boolean> {
  const payload = JSON.stringify({
    id: event.id,
    type: event.type,
    created: Math.floor(new Date(event.created_at).getTime() / 1000),
    data: event.data_json,
  })

  const timestamp = Math.floor(Date.now() / 1000)
  const signature = createWebhookSignature(payload, event.webhook_secret, timestamp)

  try {
    const response = await fetch(event.webhook_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "sBTC-Gateway/1.0",
        "Gateway-Signature": signature,
        "Gateway-Event-Type": event.type,
        "Gateway-Event-Id": event.id,
      },
      body: payload,
      signal: AbortSignal.timeout(30000), // 30 second timeout
    })

    if (response.ok) {
      // Mark as delivered
      await markWebhookDelivered(event.id)
      console.log(`✅ Webhook delivered successfully: ${event.id}`)
      return true
    } else {
      const errorText = await response.text().catch(() => "Unknown error")
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error(`❌ Webhook delivery failed: ${event.id} - ${errorMessage}`)

    // Update delivery attempt
    await updateWebhookAttempt(event.id, errorMessage)

    // Schedule retry if under max attempts
    if (event.delivery_attempts < MAX_RETRY_ATTEMPTS) {
      await scheduleWebhookRetry(event.id, event.delivery_attempts + 1)
    } else {
      console.error(`💀 Webhook ${event.id} failed permanently after ${MAX_RETRY_ATTEMPTS} attempts`)
    }

    return false
  }
}

async function markWebhookDelivered(eventId: string) {
  await db.query(
    `
    UPDATE events 
    SET delivered_at = CURRENT_TIMESTAMP, delivery_attempts = delivery_attempts + 1
    WHERE id = $1
  `,
    [eventId],
  )
}

async function updateWebhookAttempt(eventId: string, error: string) {
  await db.query(
    `
    UPDATE events 
    SET delivery_attempts = delivery_attempts + 1, last_error = $2
    WHERE id = $1
  `,
    [eventId, error],
  )
}

async function scheduleWebhookRetry(eventId: string, attemptNumber: number) {
  // Exponential backoff: 1s, 2s, 4s, 8s, 16s
  const delay = Math.min(INITIAL_RETRY_DELAY * Math.pow(2, attemptNumber - 1), MAX_RETRY_DELAY)

  console.log(`⏰ Scheduling webhook retry ${attemptNumber} for ${eventId} in ${delay}ms`)

  setTimeout(async () => {
    console.log(`🔄 Retrying webhook delivery: ${eventId} (attempt ${attemptNumber})`)
    await deliverWebhook(eventId)
  }, delay)
}

// Retry failed webhooks on startup
export async function retryFailedWebhooks() {
  try {
    const result = await db.query(
      `
      SELECT id, delivery_attempts
      FROM events 
      WHERE delivered_at IS NULL 
        AND delivery_attempts < $1
        AND created_at > NOW() - INTERVAL '24 hours'
      ORDER BY created_at ASC
      LIMIT 100
    `,
      [MAX_RETRY_ATTEMPTS],
    )

    console.log(`🔄 Found ${result.rows.length} failed webhooks to retry`)

    for (const event of result.rows) {
      // Stagger retries to avoid overwhelming the system
      setTimeout(() => {
        deliverWebhook(event.id)
      }, Math.random() * 10000) // Random delay up to 10 seconds
    }
  } catch (error) {
    console.error("❌ Error retrying failed webhooks:", error)
  }
}

// Auto-retry failed webhooks on startup
if (process.env.NODE_ENV === "production" || process.env.RETRY_WEBHOOKS === "true") {
  setTimeout(retryFailedWebhooks, 5000) // Wait 5 seconds after startup
}
