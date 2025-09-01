"use client"

import Link from "next/link"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CreditCard, Copy, ExternalLink, Code, Zap, Globe, Smartphone, Server } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ExamplesPage() {
  const { toast } = useToast()
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
    toast({
      title: "Copied to clipboard",
      description: "Code has been copied to your clipboard.",
    })
  }

  const examples = [
    {
      id: "simple-button",
      title: "Simple Payment Button",
      description: "Drop-in payment button with minimal setup",
      category: "Basic",
      framework: "HTML",
      icon: <Globe className="h-5 w-5" />,
      code: `<!DOCTYPE html>
<html>
<head>
    <title>My Store</title>
    <script src="https://gateway.sbtc.dev/js/sbtc-gateway.js" 
            data-publishable-key="pk_test_..."></script>
</head>
<body>
    <h1>Premium Plan - 0.0005 sBTC</h1>
    
    <button data-sbtc-button 
            data-amount="50000" 
            data-description="Premium Plan"
            data-success-url="https://mysite.com/success"
            data-cancel-url="https://mysite.com/cancel">
        Pay with sBTC
    </button>
</body>
</html>`,
    },
    {
      id: "react-integration",
      title: "React Component",
      description: "Custom React component with hooks and state management",
      category: "Frontend",
      framework: "React",
      icon: <Code className="h-5 w-5" />,
      code: `import { useEffect, useState } from 'react'

export default function PaymentButton({ amount, description }) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState('idle')

  useEffect(() => {
    // Load sBTC Gateway SDK
    const script = document.createElement('script')
    script.src = 'https://gateway.sbtc.dev/js/sbtc-gateway.js'
    script.setAttribute('data-publishable-key', 'pk_test_...')
    script.onload = () => setIsLoaded(true)
    document.head.appendChild(script)

    // Listen for payment events
    window.addEventListener('sbtc-payment-success', (e) => {
      setPaymentStatus('success')
      console.log('Payment successful:', e.detail)
    })

    window.addEventListener('sbtc-payment-error', (e) => {
      setPaymentStatus('error')
      console.error('Payment failed:', e.detail)
    })

    return () => {
      document.head.removeChild(script)
    }
  }, [])

  if (!isLoaded) return <div>Loading payment...</div>

  return (
    <div className="payment-container">
      <button 
        data-sbtc-button
        data-amount={amount}
        data-description={description}
        disabled={paymentStatus === 'processing'}
        className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700"
      >
        {paymentStatus === 'processing' ? 'Processing...' : 'Pay with sBTC'}
      </button>
      
      {paymentStatus === 'success' && (
        <div className="text-green-600 mt-2">Payment successful!</div>
      )}
      {paymentStatus === 'error' && (
        <div className="text-red-600 mt-2">Payment failed. Please try again.</div>
      )}
    </div>
  )
}`,
    },
    {
      id: "nextjs-api",
      title: "Next.js API Route",
      description: "Server-side payment intent creation with Next.js",
      category: "Backend",
      framework: "Next.js",
      icon: <Server className="h-5 w-5" />,
      code: `// app/api/create-payment/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { amount, description, customer_email } = await request.json()

    // Create payment intent
    const response = await fetch('https://api.gateway.sbtc.dev/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${process.env.SBTC_SECRET_KEY}\`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        description,
        customer_email,
        success_url: \`\${process.env.NEXT_PUBLIC_BASE_URL}/success\`,
        cancel_url: \`\${process.env.NEXT_PUBLIC_BASE_URL}/cancel\`,
      }),
    })

    const paymentIntent = await response.json()

    if (!response.ok) {
      throw new Error(paymentIntent.error?.message || 'Failed to create payment')
    }

    return NextResponse.json({
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
    })
  } catch (error) {
    console.error('Payment creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}`,
    },
    {
      id: "webhook-handler",
      title: "Webhook Handler",
      description: "Process payment events securely with signature verification",
      category: "Backend",
      framework: "Node.js",
      icon: <Zap className="h-5 w-5" />,
      code: `// webhook-handler.js
const crypto = require('crypto')

// Webhook verification function
function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')
  
  return signature === \`sha256=\${expectedSignature}\`
}

// Webhook handler function (use with your preferred framework)
function handleWebhook(payload, signature) {
  const secret = process.env.SBTC_WEBHOOK_SECRET
  
  if (!verifyWebhookSignature(payload, signature, secret)) {
    throw new Error('Invalid webhook signature')
  }

  const event = JSON.parse(payload)

  // Handle different event types
  switch (event.type) {
    case 'payment_intent.succeeded':
      console.log('Payment succeeded:', event.data.id)
      handlePaymentSuccess(event.data)
      break

    case 'payment_intent.failed':
      console.log('Payment failed:', event.data.id)
      handlePaymentFailure(event.data)
      break

    case 'payment_intent.canceled':
      console.log('Payment canceled:', event.data.id)
      handlePaymentCancellation(event.data)
      break

    default:
      console.log('Unhandled event type:', event.type)
  }
}

async function handlePaymentSuccess(paymentIntent) {
  // Your business logic here
  console.log(\`Payment \${paymentIntent.id} completed for \${paymentIntent.amount} satoshis\`)
}

// Export for use in your server framework
module.exports = { handleWebhook, verifyWebhookSignature }`,
    },
    {
      id: "mobile-flutter",
      title: "Flutter Mobile App",
      description: "Mobile payment integration with Flutter WebView",
      category: "Mobile",
      framework: "Flutter",
      icon: <Smartphone className="h-5 w-5" />,
      code: `// payment_screen.dart
import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

class PaymentScreen extends StatefulWidget {
  final String amount;
  final String description;

  const PaymentScreen({
    Key? key,
    required this.amount,
    required this.description,
  }) : super(key: key);

  @override
  _PaymentScreenState createState() => _PaymentScreenState();
}

class _PaymentScreenState extends State<PaymentScreen> {
  late WebViewController controller;
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageFinished: (String url) {
            setState(() {
              isLoading = false;
            });
          },
          onNavigationRequest: (NavigationRequest request) {
            if (request.url.contains('/success')) {
              Navigator.pop(context, 'success');
              return NavigationDecision.prevent;
            }
            if (request.url.contains('/cancel')) {
              Navigator.pop(context, 'canceled');
              return NavigationDecision.prevent;
            }
            return NavigationDecision.navigate;
          },
        ),
      )
      ..loadHtmlString('''
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="https://gateway.sbtc.dev/js/sbtc-gateway.js" 
                    data-publishable-key="pk_test_..."></script>
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                padding: 20px;
                text-align: center;
              }
              button {
                background: #f97316;
                color: white;
                border: none;
                padding: 16px 32px;
                border-radius: 8px;
                font-size: 16px;
                cursor: pointer;
              }
            </style>
        </head>
        <body>
            <h2>\${widget.description}</h2>
            <p>Amount: \${widget.amount} satoshis</p>
            
            <button data-sbtc-button 
                    data-amount="\${widget.amount}" 
                    data-description="\${widget.description}"
                    data-success-url="https://myapp.com/success"
                    data-cancel-url="https://myapp.com/cancel">
                Pay with sBTC
            </button>
        </body>
        </html>
      ''');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Complete Payment'),
        backgroundColor: Colors.orange,
      ),
      body: Stack(
        children: [
          WebViewWidget(controller: controller),
          if (isLoading)
            Center(
              child: CircularProgressIndicator(
                color: Colors.orange,
              ),
            ),
        ],
      ),
    );
  }
}`,
    },
    {
      id: "subscription-billing",
      title: "Subscription Billing",
      description: "Recurring payment setup with customer management",
      category: "Advanced",
      framework: "JavaScript",
      icon: <Code className="h-5 w-5" />,
      code: `// subscription-manager.js
class SubscriptionManager {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.gateway.sbtc.dev/v1';
  }

  async createCustomer(email, name) {
    const response = await fetch(\`\${this.baseUrl}/customers\`, {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${this.apiKey}\`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, name }),
    });
    return response.json();
  }

  async createSubscription(customerId, planId) {
    const response = await fetch(\`\${this.baseUrl}/subscriptions\`, {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${this.apiKey}\`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customer_id: customerId,
        plan_id: planId,
        billing_cycle: 'monthly',
      }),
    });
    return response.json();
  }

  async handleSubscriptionPayment(subscriptionId) {
    // Create payment intent for subscription
    const response = await fetch(\`\${this.baseUrl}/payment_intents\`, {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${this.apiKey}\`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscription_id: subscriptionId,
        description: 'Monthly subscription payment',
      }),
    });
    
    const paymentIntent = await response.json();
    
    // Trigger payment UI
    window.sBTCGateway.processPayment({
      client_secret: paymentIntent.client_secret,
      onSuccess: (result) => {
        console.log('Subscription payment successful:', result);
        this.activateSubscription(subscriptionId);
      },
      onError: (error) => {
        console.error('Subscription payment failed:', error);
        this.handlePaymentFailure(subscriptionId, error);
      }
    });
  }

  async activateSubscription(subscriptionId) {
    await fetch(\`\${this.baseUrl}/subscriptions/\${subscriptionId}/activate\`, {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${this.apiKey}\`,
      },
    });
  }
}

// Usage example
const subscriptionManager = new SubscriptionManager('sk_test_...');

async function setupSubscription(email, planId) {
  try {
    const customer = await subscriptionManager.createCustomer(email, 'John Doe');
    const subscription = await subscriptionManager.createSubscription(customer.id, planId);
    await subscriptionManager.handleSubscriptionPayment(subscription.id);
  } catch (error) {
    console.error('Subscription setup failed:', error);
  }
}`,
    },
  ]

  const categories = ["All", "Basic", "Frontend", "Backend", "Mobile", "Advanced"]
  const [selectedCategory, setSelectedCategory] = useState("All")

  const filteredExamples =
    selectedCategory === "All" ? examples : examples.filter((example) => example.category === selectedCategory)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <CreditCard className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-primary">sBTC Gateway</h1>
              <Badge variant="outline">Examples</Badge>
            </Link>
            <nav className="flex items-center space-x-4">
              <Link href="/docs" className="text-muted-foreground hover:text-primary">
                Docs
              </Link>
              <Link href="/dashboard">
                <Button>Dashboard</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <Code className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold">Code Examples</h1>
            </div>
            <p className="text-xl text-muted-foreground">
              Working code samples for different frameworks and use cases. Copy, paste, and customize for your needs.
            </p>
          </div>

          {/* Category Filter */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Examples Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredExamples.map((example) => (
              <Card key={example.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {example.icon}
                      <CardTitle className="text-lg">{example.title}</CardTitle>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">{example.framework}</Badge>
                      <Badge variant="outline">{example.category}</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{example.description}</p>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="bg-gray-900 text-gray-100 rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between p-3 border-b border-gray-700">
                      <span className="text-sm text-gray-400">{example.framework}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(example.code, example.id)}
                        className="text-gray-400 hover:text-white"
                      >
                        {copiedCode === example.id ? (
                          "Copied!"
                        ) : (
                          <>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                    <pre className="p-4 text-sm overflow-x-auto max-h-96">
                      <code>{example.code}</code>
                    </pre>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Additional Resources */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Additional Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link href="/docs/getting-started">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Zap className="h-5 w-5 text-green-600" />
                      <span>Getting Started</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Step-by-step guide to integrate sBTC payments in under 5 minutes.
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/docs/api-reference">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Code className="h-5 w-5 text-blue-600" />
                      <span>API Reference</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Complete documentation of all endpoints, parameters, and responses.
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/docs/sdk">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <ExternalLink className="h-5 w-5 text-purple-600" />
                      <span>SDK Documentation</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Advanced SDK usage, customization options, and event handling.
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
