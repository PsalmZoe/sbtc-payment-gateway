export interface PaymentIntentCreateParams {
  amount: number | string
  metadata?: Record<string, any>
}

export interface PaymentIntentResponse {
  id: string
  amount: string
  status: string
  clientSecret: string
  checkoutUrl: string
}

export interface PaymentIntent {
  id: string
  amount: string
  status: string
  created: number
}

export class SBTCGateway {
  private apiKey: string
  private baseUrl: string

  constructor(apiKey: string, options: { baseUrl?: string } = {}) {
    this.apiKey = apiKey
    this.baseUrl = options.baseUrl || "https://gateway.sbtc.dev"
  }

  async createPaymentIntent(params: PaymentIntentCreateParams): Promise<PaymentIntentResponse> {
    const response = await fetch(`${this.baseUrl}/api/v1/payment_intents`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(params),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }))
      throw new Error(`Payment intent creation failed: ${error.error || response.statusText}`)
    }

    return response.json()
  }

  async retrievePaymentIntent(paymentIntentId: string): Promise<PaymentIntent> {
    const response = await fetch(`${this.baseUrl}/api/v1/payment_intents?id=${paymentIntentId}`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }))
      throw new Error(`Payment intent retrieval failed: ${error.error || response.statusText}`)
    }

    return response.json()
  }

  async configureWebhook(webhookUrl: string): Promise<{ webhook_url: string; webhook_secret: string }> {
    const response = await fetch(`${this.baseUrl}/api/v1/webhooks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ webhook_url: webhookUrl }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }))
      throw new Error(`Webhook configuration failed: ${error.error || response.statusText}`)
    }

    return response.json()
  }

  async getWebhookEvents(): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/api/v1/webhooks`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }))
      throw new Error(`Webhook events retrieval failed: ${error.error || response.statusText}`)
    }

    const data = await response.json()
    return data.events || []
  }
}

// Export types
export type { PaymentIntentCreateParams, PaymentIntentResponse, PaymentIntent }
