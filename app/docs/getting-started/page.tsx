"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  CreditCard,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Copy,
  ExternalLink,
  Zap,
  Code,
  Wallet,
  BookOpen,
  Webhook,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function GettingStartedPage() {
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
            <span>Getting Started</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <Zap className="h-8 w-8 text-green-600" />
              <h1 className="text-4xl font-bold">Getting Started</h1>
            </div>
            <p className="text-xl text-muted-foreground">
              Start accepting sBTC payments in under 5 minutes. This guide will walk you through the basic setup and
              your first payment integration.
            </p>
          </div>

          {/* Quick Overview */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>What You'll Learn</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Create your account</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Get API keys</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Make your first payment</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 1 */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
              <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                1
              </span>
              <span>Create Your Account</span>
            </h2>

            <p className="text-muted-foreground mb-6">
              First, you'll need to create an sBTC Gateway account to get your API keys and access the dashboard.
            </p>

            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold mb-2">Sign up for free</h3>
                    <p className="text-sm text-muted-foreground">
                      No credit card required. Start with test mode and go live when ready.
                    </p>
                  </div>
                  <Link href="/dashboard">
                    <Button>
                      Create Account
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Step 2 */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
              <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                2
              </span>
              <span>Get Your API Keys</span>
            </h2>

            <p className="text-muted-foreground mb-6">
              After creating your account, navigate to the API Keys section in your dashboard to get your publishable
              and secret keys.
            </p>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">API Key Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Publishable</Badge>
                    <div>
                      <p className="font-medium">pk_test_...</p>
                      <p className="text-sm text-muted-foreground">
                        Safe to use in frontend code. Used for creating payment intents.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Secret</Badge>
                    <div>
                      <p className="font-medium">sk_test_...</p>
                      <p className="text-sm text-muted-foreground">
                        Keep secure on your server. Used for sensitive operations.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Step 3 */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
              <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                3
              </span>
              <span>Install the SDK</span>
            </h2>

            <p className="text-muted-foreground mb-6">
              Choose your preferred integration method. We recommend starting with the JavaScript SDK for the fastest
              setup.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Code className="h-5 w-5" />
                    <span>JavaScript SDK</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Drop-in solution with automatic wallet detection and UI components.
                  </p>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg mb-4">
                    <code className="text-sm">
                      {`<script src="https://gateway.sbtc.dev/js/sbtc-gateway.js" 
        data-publishable-key="pk_test_..."></script>`}
                    </code>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(
                        `<script src="https://gateway.sbtc.dev/js/sbtc-gateway.js" data-publishable-key="pk_test_..."></script>`,
                      )
                    }
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Code className="h-5 w-5" />
                    <span>REST API</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Direct API integration for custom implementations and server-side usage.
                  </p>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg mb-4">
                    <code className="text-sm">
                      {`curl -X POST https://api.gateway.sbtc.dev/v1/payment_intents \\
  -H "Authorization: Bearer sk_test_..." \\
  -d amount=50000`}
                    </code>
                  </div>
                  <Link href="/docs/api-reference">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      API Docs
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Step 4 */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
              <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                4
              </span>
              <span>Create Your First Payment</span>
            </h2>

            <p className="text-muted-foreground mb-6">
              Add a payment button to your website. The SDK will handle wallet detection, payment processing, and
              confirmation.
            </p>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Simple Payment Button</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 text-gray-100 p-6 rounded-lg mb-4">
                  <pre className="text-sm overflow-x-auto">
                    <code>{`<!DOCTYPE html>
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
</html>`}</code>
                  </pre>
                </div>
                <Button
                  variant="outline"
                  onClick={() =>
                    copyToClipboard(`<!DOCTYPE html>
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
</html>`)
                  }
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Example
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Step 5 */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
              <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                5
              </span>
              <span>Test Your Integration</span>
            </h2>

            <p className="text-muted-foreground mb-6">
              Use test mode to verify your integration works correctly before going live.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Wallet className="h-5 w-5" />
                    <span>Test Wallets</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Use these test wallet addresses to simulate payments:
                  </p>
                  <div className="space-y-2">
                    <div className="bg-muted p-3 rounded font-mono text-sm">
                      SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7
                    </div>
                    <p className="text-xs text-muted-foreground">Test wallet with sufficient sBTC balance</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Monitor Payments</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">View all test payments in your dashboard:</p>
                  <Link href="/dashboard/payments">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Dashboard
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>

          <Separator className="my-12" />

          {/* Next Steps */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Next Steps</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link href="/docs/webhooks">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Webhook className="h-5 w-5 text-indigo-600" />
                      <span>Set up Webhooks</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Get real-time notifications when payments are completed, failed, or disputed.
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/docs/sdk">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Code className="h-5 w-5 text-purple-600" />
                      <span>Advanced SDK Usage</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Learn about custom styling, event handling, and programmatic payment creation.
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/docs/api-reference">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                      <span>API Reference</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Complete documentation of all API endpoints, parameters, and responses.
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/examples">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Code className="h-5 w-5 text-green-600" />
                      <span>Code Examples</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Working examples for different frameworks and use cases.
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-8 border-t">
            <Link href="/docs">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Documentation Home
              </Button>
            </Link>
            <Link href="/docs/api-reference">
              <Button>
                API Reference
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
