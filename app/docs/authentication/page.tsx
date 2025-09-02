"use client"

import type React from "react"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CreditCard, ArrowLeft, ArrowRight, Key, Shield, Copy, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AuthenticationPage() {
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
            <span>Authentication</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <Key className="h-8 w-8 text-blue-600" />
              <h1 className="text-4xl font-bold">Authentication</h1>
            </div>
            <p className="text-xl text-muted-foreground">
              Secure your API requests with API keys and learn about authentication best practices for the sBTC Gateway
              API.
            </p>
          </div>

          {/* API Keys Overview */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>API Key Authentication</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                sBTC Gateway uses API keys to authenticate requests. Include your API key in the Authorization header of
                all API requests.
              </p>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
                <code className="text-sm">Authorization: Bearer sk_test_1234567890abcdef...</code>
              </div>
            </CardContent>
          </Card>

          {/* API Key Types */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">API Key Types</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Badge className="bg-blue-100 text-blue-800">Publishable Keys</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">Safe to use in client-side code and mobile apps.</p>
                  <div className="space-y-2">
                    <div className="bg-muted p-3 rounded">
                      <code className="text-sm">pk_test_...</code> (Test mode)
                    </div>
                    <div className="bg-muted p-3 rounded">
                      <code className="text-sm">pk_live_...</code> (Live mode)
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <h4 className="font-semibold">Use for:</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Creating payment intents</li>
                      <li>• Client-side SDK initialization</li>
                      <li>• Public API endpoints</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Badge className="bg-red-100 text-red-800">Secret Keys</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">Must be kept secure on your server. Never expose these.</p>
                  <div className="space-y-2">
                    <div className="bg-muted p-3 rounded">
                      <code className="text-sm">sk_test_...</code> (Test mode)
                    </div>
                    <div className="bg-muted p-3 rounded">
                      <code className="text-sm">sk_live_...</code> (Live mode)
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <h4 className="font-semibold">Use for:</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Server-side API calls</li>
                      <li>• Webhook signature verification</li>
                      <li>• Sensitive operations</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Making Authenticated Requests */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Making Authenticated Requests</h2>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>HTTP Header Authentication</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Include your API key in the Authorization header using Bearer token format:
                </p>
                <div className="bg-gray-900 text-gray-100 p-6 rounded-lg mb-4">
                  <pre className="text-sm overflow-x-auto">
                    <code>{`curl -X POST https://api.gateway.sbtc.dev/v1/payment_intents \\
  -H "Authorization: Bearer sk_test_1234567890abcdef..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 50000,
    "description": "Premium subscription"
  }'`}</code>
                  </pre>
                </div>
                <Button
                  variant="outline"
                  onClick={(event: React.MouseEvent<HTMLButtonElement>) =>
                    copyToClipboard(`curl -X POST https://api.gateway.sbtc.dev/v1/payment_intents \\
  -H "Authorization: Bearer sk_test_1234567890abcdef..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 50000,
    "description": "Premium subscription"
  }'`)
                  }
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy cURL Example
                </Button>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>JavaScript/Node.js Example</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 text-gray-100 p-6 rounded-lg mb-4">
                  <pre className="text-sm overflow-x-auto">
                    <code>{`const response = await fetch('https://api.gateway.sbtc.dev/v1/payment_intents', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${process.env.SBTC_SECRET_KEY}\`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    amount: 50000,
    description: 'Premium subscription'
  })
})

const paymentIntent = await response.json()
console.log(paymentIntent)`}</code>
                  </pre>
                </div>
                <Button
                  variant="outline"
                  onClick={(event: React.MouseEvent<HTMLButtonElement>) =>
                    copyToClipboard(`const response = await fetch('https://api.gateway.sbtc.dev/v1/payment_intents', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${process.env.SBTC_SECRET_KEY}\`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    amount: 50000,
    description: 'Premium subscription'
  })
})

const paymentIntent = await response.json()
console.log(paymentIntent)`)
                  }
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy JavaScript Example
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Security Best Practices */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
              <Shield className="h-6 w-6" />
              <span>Security Best Practices</span>
            </h2>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <span>Keep Secret Keys Secure</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Never commit API keys to version control</li>
                    <li>• Use environment variables for API keys</li>
                    <li>• Rotate keys regularly</li>
                    <li>• Restrict key permissions when possible</li>
                    <li>• Monitor API key usage in your dashboard</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Environment Variables</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">Store API keys as environment variables:</p>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg mb-4">
                    <pre className="text-sm">
                      <code>{`# .env.local
SBTC_SECRET_KEY=sk_test_1234567890abcdef...
NEXT_PUBLIC_SBTC_PUBLISHABLE_KEY=pk_test_1234567890abcdef...`}</code>
                    </pre>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                      <p className="text-sm text-green-800">
                        <strong>✓ Safe:</strong> Publishable keys (pk_) are designed to be exposed in client-side code.
                        The NEXT_PUBLIC_ prefix is correct and secure for these keys.
                      </p>
                    </div>
                    <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                      <p className="text-sm text-red-800">
                        <strong>⚠ Never expose:</strong> Secret keys (sk_) must never use NEXT_PUBLIC_ prefix or be
                        exposed in client-side code. Keep these server-side only.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>API Key Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">Manage your API keys through the dashboard:</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-muted rounded">
                      <span className="text-sm">Create new API keys</span>
                      <Badge variant="outline">Dashboard</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded">
                      <span className="text-sm">Revoke compromised keys</span>
                      <Badge variant="outline">Dashboard</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded">
                      <span className="text-sm">Monitor key usage</span>
                      <Badge variant="outline">Dashboard</Badge>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Link href="/dashboard/settings/api-keys">
                      <Button>
                        Manage API Keys
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Error Handling */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Authentication Errors</h2>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <code className="bg-muted px-2 py-1 rounded">401 Unauthorized</code>
                      <Badge variant="destructive">Error</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Invalid or missing API key. Check your Authorization header.
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <code className="bg-muted px-2 py-1 rounded">403 Forbidden</code>
                      <Badge variant="destructive">Error</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">API key doesn't have permission for this operation.</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <code className="bg-muted px-2 py-1 rounded">429 Too Many Requests</code>
                      <Badge variant="secondary">Rate Limit</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Rate limit exceeded. Implement exponential backoff.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-8 border-t">
            <Link href="/docs/smart-contract">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Smart Contract Reference
              </Button>
            </Link>
            <Link href="/docs/troubleshooting">
              <Button>
                Troubleshooting
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
