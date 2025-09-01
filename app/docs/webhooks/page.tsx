"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CreditCard, ArrowLeft, ArrowRight, Webhook, Copy, Shield } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function WebhooksPage() {
  const { toast } = useToast()

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "Code has been copied to your clipboard.",
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/docs" className="flex items-center space-x-2">
              <CreditCard className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-primary">sBTC Gateway</h1>
              <Badge variant="outline">Docs</Badge>
            </Link>
            <nav className="flex items-center space-x-4">
              <Link href="/examples" className="text-muted-foreground hover:text-primary">
                Examples
              </Link>
              <Link href="/dashboard">
                <Button>Dashboard</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-8">
            <Link href="/docs" className="hover:text-primary">
              Documentation
            </Link>
            <span>/</span>
            <span>Webhooks</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <Webhook className="h-8 w-8 text-indigo-600" />
              <h1 className="text-4xl font-bold">Webhooks</h1>
            </div>
            <p className="text-xl text-muted-foreground">
              Get real-time notifications when payment events occur. Webhooks allow your application to respond
              immediately to payment status changes.
            </p>
          </div>

          {/* Overview */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>How Webhooks Work</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                When a payment event occurs (like a successful payment or failure), sBTC Gateway sends an HTTP POST
                request to your configured webhook endpoint with event details.
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Event Flow:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Payment event occurs (success, failure, etc.)</li>
                  <li>sBTC Gateway creates webhook payload</li>
                  <li>HTTP POST request sent to your endpoint</li>
                  <li>Your server processes the event</li>
                  <li>Return 200 status to acknowledge receipt</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* Setting Up Webhooks */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Setting Up Webhooks</h2>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>1. Configure Webhook Endpoint</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Add your webhook endpoint URL in the dashboard settings:</p>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg mb-4">
                  <code className="text-sm">https://your-domain.com/webhooks/sbtc</code>
                </div>
                <Link href="/dashboard/settings/webhooks">
                  <Button variant="outline">
                    Configure Webhooks
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>2. Handle Webhook Events</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Create an endpoint to receive and process webhook events:</p>
                <div className="bg-gray-900 text-gray-100 p-6 rounded-lg mb-4">
                  <pre className="text-sm overflow-x-auto">
                    <code>{`// Next.js API Route Example
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  const signature = request.headers.get('sbtc-signature')
  const payload = await request.text()
  
  // Verify webhook signature
  const secret = process.env.SBTC_WEBHOOK_SECRET
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')
  
  if (signature !== \`sha256=\${expectedSignature}\`) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }
  
  const event = JSON.parse(payload)
  
  // Handle different event types
  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSuccess(event.data)
      break
    case 'payment_intent.failed':
      await handlePaymentFailure(event.data)
      break
    default:
      console.log('Unhandled event type:', event.type)
  }
  
  return NextResponse.json({ received: true })
}`}</code>
                  </pre>
                </div>
                <Button
                  variant="outline"
                  onClick={() =>
                    copyToClipboard(`// Next.js API Route Example
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  const signature = request.headers.get('sbtc-signature')
  const payload = await request.text()
  
  // Verify webhook signature
  const secret = process.env.SBTC_WEBHOOK_SECRET
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')
  
  if (signature !== \`sha256=\${expectedSignature}\`) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }
  
  const event = JSON.parse(payload)
  
  // Handle different event types
  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSuccess(event.data)
      break
    case 'payment_intent.failed':
      await handlePaymentFailure(event.data)
      break
    default:
      console.log('Unhandled event type:', event.type)
  }
  
  return NextResponse.json({ received: true })
}`)
                  }
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Code
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Event Types */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Event Types</h2>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Badge className="bg-green-100 text-green-700">payment_intent.succeeded</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Sent when a payment is successfully confirmed on the blockchain.
                  </p>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
                    <pre className="text-sm">
                      <code>{`{
  "type": "payment_intent.succeeded",
  "data": {
    "id": "pi_1234567890",
    "amount": "50000",
    "status": "succeeded",
    "customer_email": "customer@example.com",
    "tx_hash": "0x1234...5678",
    "created": "2025-01-15T10:30:00Z"
  }
}`}</code>
                    </pre>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Badge className="bg-red-100 text-red-700">payment_intent.failed</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Sent when a payment fails due to insufficient funds, network issues, or other errors.
                  </p>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
                    <pre className="text-sm">
                      <code>{`{
  "type": "payment_intent.failed",
  "data": {
    "id": "pi_1234567891",
    "amount": "50000",
    "status": "failed",
    "error": "Insufficient funds",
    "created": "2025-01-15T10:30:00Z"
  }
}`}</code>
                    </pre>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Badge className="bg-yellow-100 text-yellow-700">payment_intent.canceled</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Sent when a payment is canceled by the customer or expires.
                  </p>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
                    <pre className="text-sm">
                      <code>{`{
  "type": "payment_intent.canceled",
  "data": {
    "id": "pi_1234567892",
    "amount": "50000",
    "status": "canceled",
    "reason": "customer_canceled",
    "created": "2025-01-15T10:30:00Z"
  }
}`}</code>
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Security */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
              <Shield className="h-6 w-6" />
              <span>Security</span>
            </h2>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Signature Verification</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Always verify webhook signatures to ensure requests are from sBTC Gateway:
                </p>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg mb-4">
                  <pre className="text-sm">
                    <code>{`const crypto = require('crypto')

function verifySignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')
  
  return signature === \`sha256=\${expectedSignature}\`
}`}</code>
                  </pre>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Important:</strong> Never process webhook events without signature verification. This
                    prevents malicious requests from triggering actions in your system.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Testing */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Testing Webhooks</h2>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Test Webhook Endpoint</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Use the webhook testing tool in your dashboard to send test events:
                </p>
                <Link href="/dashboard/settings/webhooks">
                  <Button>
                    Test Webhooks
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-8 border-t">
            <Link href="/docs/sdk">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                SDK Documentation
              </Button>
            </Link>
            <Link href="/docs/smart-contract">
              <Button>
                Smart Contract Reference
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
