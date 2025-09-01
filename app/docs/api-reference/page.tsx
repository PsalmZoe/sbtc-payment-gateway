"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { CreditCard, ArrowLeft, ArrowRight, Copy, Code, CheckCircle, XCircle, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function APIReferencePage() {
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
            <span>API Reference</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <Code className="h-8 w-8 text-blue-600" />
              <h1 className="text-4xl font-bold">API Reference</h1>
            </div>
            <p className="text-xl text-muted-foreground">
              Complete REST API documentation for the sBTC Gateway. All endpoints use JSON and require authentication.
            </p>
          </div>

          {/* Base URL and Authentication */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Base URL & Authentication</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Base URL</h4>
                <div className="bg-muted p-3 rounded font-mono text-sm">https://api.gateway.sbtc.dev/v1</div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Authentication</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  All API requests require a secret key in the Authorization header:
                </p>
                <div className="bg-gray-900 text-gray-100 p-3 rounded font-mono text-sm">
                  Authorization: Bearer sk_test_...
                </div>
              </div>
            </CardContent>
          </Card>

          {/* API Endpoints */}
          <div className="space-y-8">
            {/* Payment Intents */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Payment Intents</h2>

              {/* Create Payment Intent */}
              <Card className="mb-6">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">POST</Badge>
                      <span>/payment_intents</span>
                    </CardTitle>
                    <Badge variant="outline">Create Payment Intent</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Creates a new payment intent for the specified amount. Returns a payment intent object with a client
                    secret.
                  </p>

                  <Tabs defaultValue="request" className="w-full">
                    <TabsList>
                      <TabsTrigger value="request">Request</TabsTrigger>
                      <TabsTrigger value="response">Response</TabsTrigger>
                      <TabsTrigger value="example">Example</TabsTrigger>
                    </TabsList>

                    <TabsContent value="request" className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Parameters</h4>
                        <div className="space-y-3">
                          <div className="border rounded p-3">
                            <div className="flex items-center justify-between mb-1">
                              <code className="text-sm font-medium">amount</code>
                              <Badge variant="destructive" className="text-xs">
                                required
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Payment amount in satoshis (1 sBTC = 100,000,000 sats)
                            </p>
                          </div>
                          <div className="border rounded p-3">
                            <div className="flex items-center justify-between mb-1">
                              <code className="text-sm font-medium">description</code>
                              <Badge variant="outline" className="text-xs">
                                optional
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">Description of the payment for your records</p>
                          </div>
                          <div className="border rounded p-3">
                            <div className="flex items-center justify-between mb-1">
                              <code className="text-sm font-medium">metadata</code>
                              <Badge variant="outline" className="text-xs">
                                optional
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Key-value pairs for storing additional information
                            </p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="response" className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Response Object</h4>
                        <div className="bg-gray-900 text-gray-100 p-4 rounded text-sm">
                          <pre>{`{
  "id": "pi_1234567890abcdef",
  "object": "payment_intent",
  "amount": 50000,
  "currency": "sats",
  "status": "requires_payment_method",
  "description": "Premium Plan",
  "client_secret": "pi_1234567890abcdef_secret_...",
  "created": 1642694400,
  "metadata": {}
}`}</pre>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="example" className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">cURL Example</h4>
                        <div className="bg-gray-900 text-gray-100 p-4 rounded text-sm relative">
                          <pre>{`curl -X POST https://api.gateway.sbtc.dev/v1/payment_intents \\
  -H "Authorization: Bearer sk_test_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 50000,
    "description": "Premium Plan",
    "metadata": {
      "user_id": "user_123",
      "plan": "premium"
    }
  }'`}</pre>
                          <Button
                            variant="outline"
                            size="sm"
                            className="absolute top-2 right-2 bg-transparent"
                            onClick={() =>
                              copyToClipboard(`curl -X POST https://api.gateway.sbtc.dev/v1/payment_intents \\
  -H "Authorization: Bearer sk_test_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 50000,
    "description": "Premium Plan",
    "metadata": {
      "user_id": "user_123",
      "plan": "premium"
    }
  }'`)
                            }
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Retrieve Payment Intent */}
              <Card className="mb-6">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">GET</Badge>
                      <span>/payment_intents/:id</span>
                    </CardTitle>
                    <Badge variant="outline">Retrieve Payment Intent</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Retrieves the details of a payment intent that has previously been created.
                  </p>

                  <div className="bg-gray-900 text-gray-100 p-4 rounded text-sm relative">
                    <pre>{`curl -X GET https://api.gateway.sbtc.dev/v1/payment_intents/pi_1234567890abcdef \\
  -H "Authorization: Bearer sk_test_..."`}</pre>
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2 bg-transparent"
                      onClick={() =>
                        copyToClipboard(`curl -X GET https://api.gateway.sbtc.dev/v1/payment_intents/pi_1234567890abcdef \\
  -H "Authorization: Bearer sk_test_..."`)
                      }
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Separator />

            {/* Payment Status */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Payment Status</h2>

              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Status Values</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 text-yellow-600" />
                      <div>
                        <code className="font-medium">requires_payment_method</code>
                        <p className="text-sm text-muted-foreground">Payment intent created, awaiting payment</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <div>
                        <code className="font-medium">processing</code>
                        <p className="text-sm text-muted-foreground">
                          Payment submitted, awaiting blockchain confirmation
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <code className="font-medium">succeeded</code>
                        <p className="text-sm text-muted-foreground">Payment confirmed on blockchain</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <XCircle className="h-5 w-5 text-red-600" />
                      <div>
                        <code className="font-medium">payment_failed</code>
                        <p className="text-sm text-muted-foreground">Payment failed or was rejected</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Separator />

            {/* Error Codes */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Error Codes</h2>

              <Card>
                <CardHeader>
                  <CardTitle>Common Error Responses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border rounded p-3">
                      <div className="flex items-center justify-between mb-2">
                        <code className="font-medium">400 - Bad Request</code>
                        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Client Error</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Invalid request parameters or missing required fields
                      </p>
                    </div>
                    <div className="border rounded p-3">
                      <div className="flex items-center justify-between mb-2">
                        <code className="font-medium">401 - Unauthorized</code>
                        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Auth Error</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Invalid or missing API key</p>
                    </div>
                    <div className="border rounded p-3">
                      <div className="flex items-center justify-between mb-2">
                        <code className="font-medium">404 - Not Found</code>
                        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Client Error</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Resource not found</p>
                    </div>
                    <div className="border rounded p-3">
                      <div className="flex items-center justify-between mb-2">
                        <code className="font-medium">500 - Internal Server Error</code>
                        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Server Error</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Something went wrong on our end</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-8 border-t mt-12">
            <Link href="/docs/getting-started">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Getting Started
              </Button>
            </Link>
            <Link href="/docs/sdk">
              <Button>
                SDK Documentation
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
