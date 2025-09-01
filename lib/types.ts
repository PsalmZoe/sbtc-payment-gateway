export interface Merchant {
  id: string
  name: string
  email: string
  apiKeyHash: string
  webhookUrl?: string
  webhookSecret?: string
  createdAt: Date
  updatedAt: Date
}

export interface PaymentIntent {
  id: string
  contractId: Buffer
  merchantId: string
  amountSats: bigint
  status: PaymentIntentStatus
  clientSecretHash: string
  metadata: Record<string, any>
  txHash?: string
  blockHeight?: bigint
  createdAt: Date
  updatedAt: Date
}

export type PaymentIntentStatus = "requires_payment" | "processing" | "succeeded" | "failed" | "canceled"

export interface CreatePaymentIntentRequest {
  amount: number | string
  metadata?: Record<string, any>
}

export interface CreatePaymentIntentResponse {
  id: string
  amount: string
  status: PaymentIntentStatus
  clientSecret: string
  checkoutUrl: string
}

export interface WebhookEvent {
  id: string
  type: string
  paymentIntentId?: string
  data: Record<string, any>
  deliveredAt?: Date
  deliveryAttempts: number
  lastError?: string
  createdAt: Date
}

export interface StacksContractEvent {
  event: string
  id: string
  amount?: number
  merchant?: string
  customer?: string
}
