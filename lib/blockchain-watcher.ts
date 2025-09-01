import { StacksTestnet } from "@stacks/network"
import { updatePaymentIntentStatus, createWebhookEvent } from "./database"
import { deliverWebhook } from "./webhook-delivery"

const network = new StacksTestnet()
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
const CONTRACT_NAME = "payment-gateway"

interface StacksEvent {
  event_index: number
  event_type: string
  tx_id: string
  contract_log?: {
    contract_id: string
    topic: string
    value: any
  }
}

interface PaymentSucceededEvent {
  event: string
  id: string
  amount: number
  merchant: string
  customer: string
}

class BlockchainWatcher {
  private isRunning = false
  private lastProcessedBlock = 0
  private pollInterval = 5000 // 5 seconds

  async start() {
    if (this.isRunning) return

    this.isRunning = true
    console.log("🔍 Starting blockchain watcher...")

    // Get starting block height
    this.lastProcessedBlock = await this.getCurrentBlockHeight()

    this.pollForEvents()
  }

  stop() {
    this.isRunning = false
    console.log("⏹️ Stopping blockchain watcher...")
  }

  private async pollForEvents() {
    while (this.isRunning) {
      try {
        await this.processNewBlocks()
        await this.sleep(this.pollInterval)
      } catch (error) {
        console.error("❌ Blockchain watcher error:", error)
        await this.sleep(this.pollInterval * 2) // Back off on error
      }
    }
  }

  private async processNewBlocks() {
    const currentBlock = await this.getCurrentBlockHeight()

    if (currentBlock <= this.lastProcessedBlock) {
      return // No new blocks
    }

    console.log(`📦 Processing blocks ${this.lastProcessedBlock + 1} to ${currentBlock}`)

    // Process each new block
    for (let blockHeight = this.lastProcessedBlock + 1; blockHeight <= currentBlock; blockHeight++) {
      await this.processBlock(blockHeight)
    }

    this.lastProcessedBlock = currentBlock
  }

  private async processBlock(blockHeight: number) {
    try {
      const events = await this.getContractEventsForBlock(blockHeight)

      for (const event of events) {
        await this.processContractEvent(event)
      }
    } catch (error) {
      console.error(`❌ Error processing block ${blockHeight}:`, error)
    }
  }

  private async processContractEvent(event: StacksEvent) {
    if (!event.contract_log) return

    const { contract_id, value } = event.contract_log

    // Only process events from our contract
    if (!contract_id.includes(CONTRACT_NAME)) return

    try {
      const eventData = this.parseContractEvent(value)

      if (eventData.event === "payment_intent_succeeded") {
        await this.handlePaymentSucceeded(eventData, event.tx_id)
      } else if (eventData.event === "payment_intent_created") {
        await this.handlePaymentCreated(eventData, event.tx_id)
      }
    } catch (error) {
      console.error("❌ Error processing contract event:", error)
    }
  }

  private parseContractEvent(value: any): PaymentSucceededEvent {
    // Parse the Clarity print event data
    // This is a simplified parser - in production, use proper Clarity value parsing
    if (typeof value === "string") {
      return JSON.parse(value)
    }
    return value
  }

  private async handlePaymentSucceeded(eventData: PaymentSucceededEvent, txHash: string) {
    console.log("✅ Payment succeeded:", eventData.id)

    try {
      // Find payment intent by contract ID
      const contractIdBuffer = Buffer.from(eventData.id, "hex")

      // Update payment intent status
      const updatedIntent = await updatePaymentIntentStatus(
        eventData.id,
        "succeeded",
        txHash,
        BigInt(await this.getCurrentBlockHeight()),
      )

      if (updatedIntent) {
        // Create webhook event
        const webhookEvent = await createWebhookEvent({
          type: "payment_intent.succeeded",
          paymentIntentId: updatedIntent.id,
          dataJson: {
            id: updatedIntent.id,
            amount: updatedIntent.amount_sats,
            status: "succeeded",
            tx_hash: txHash,
            merchant_id: updatedIntent.merchant_id,
            metadata: updatedIntent.metadata,
          },
        })

        // Deliver webhook
        await deliverWebhook(webhookEvent.id)
      }
    } catch (error) {
      console.error("❌ Error handling payment succeeded:", error)
    }
  }

  private async handlePaymentCreated(eventData: any, txHash: string) {
    console.log("📝 Payment intent created on-chain:", eventData.id)
    // Optional: Update database with on-chain confirmation
  }

  private async getCurrentBlockHeight(): Promise<number> {
    try {
      const response = await fetch(`${network.coreApiUrl}/v2/info`)
      const data = await response.json()
      return data.stacks_tip_height
    } catch (error) {
      console.error("❌ Error fetching block height:", error)
      return this.lastProcessedBlock
    }
  }

  private async getContractEventsForBlock(blockHeight: number): Promise<StacksEvent[]> {
    try {
      const response = await fetch(
        `${network.coreApiUrl}/extended/v1/tx/events?block_height=${blockHeight}&contract_id=${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
      )

      if (!response.ok) {
        return []
      }

      const data = await response.json()
      return data.results || []
    } catch (error) {
      console.error(`❌ Error fetching events for block ${blockHeight}:`, error)
      return []
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

// Singleton instance
export const blockchainWatcher = new BlockchainWatcher()

// Auto-start in production
if (process.env.NODE_ENV === "production" || process.env.START_WATCHER === "true") {
  blockchainWatcher.start()
}
