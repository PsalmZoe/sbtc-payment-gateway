"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  CreditCard,
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  ArrowRight,
} from "lucide-react"

export default function TroubleshootingPage() {
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
            <span>Troubleshooting</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
              <h1 className="text-4xl font-bold">Troubleshooting</h1>
            </div>
            <p className="text-xl text-muted-foreground">
              Common issues and solutions for integrating with sBTC Gateway. Find quick fixes for the most frequent
              problems.
            </p>
          </div>

          {/* Common Issues */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Common Issues</h2>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <XCircle className="h-5 w-5 text-red-500" />
                    <span>Payment Intent Creation Fails</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Symptoms:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• 401 Unauthorized error</li>
                        <li>• "Invalid API key" message</li>
                        <li>• Payment intent creation returns null</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Solutions:</h4>
                      <ul className="text-sm space-y-2">
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                          <span>Verify your API key is correct and not expired</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                          <span>Check that you're using the secret key (sk_) for server-side calls</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                          <span>Ensure the Authorization header format is correct: "Bearer sk_..."</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                          <span>Confirm you're using the right environment (test vs live)</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-yellow-500" />
                    <span>Payments Stuck in Pending</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Symptoms:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Payment shows "pending" for extended periods</li>
                        <li>• Blockchain transaction not appearing</li>
                        <li>• Customer wallet shows transaction as failed</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Solutions:</h4>
                      <ul className="text-sm space-y-2">
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                          <span>Check Stacks blockchain status for network congestion</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                          <span>Verify customer has sufficient sBTC balance</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                          <span>Ensure smart contract address is correct</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                          <span>Check if payment intent has expired (default: 24 hours)</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <XCircle className="h-5 w-5 text-red-500" />
                    <span>Webhook Events Not Received</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Symptoms:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• No webhook events arriving at your endpoint</li>
                        <li>• Webhook endpoint shows as "inactive" in dashboard</li>
                        <li>• Payment status not updating in your system</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Solutions:</h4>
                      <ul className="text-sm space-y-2">
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                          <span>Verify webhook URL is publicly accessible (not localhost)</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                          <span>Check that your endpoint returns 200 status code</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                          <span>Ensure webhook signature verification is not blocking requests</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                          <span>Test webhook endpoint using the dashboard testing tool</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    <span>Wallet Connection Issues</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Symptoms:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• "No wallet detected" error</li>
                        <li>• Wallet connection popup doesn't appear</li>
                        <li>• Transaction signing fails</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Solutions:</h4>
                      <ul className="text-sm space-y-2">
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                          <span>Ensure customer has Leather or Xverse wallet installed</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                          <span>Check that wallet is unlocked and connected to correct network</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                          <span>Verify your site is served over HTTPS (required for wallet access)</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                          <span>Clear browser cache and try again</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Error Codes Reference */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Error Codes Reference</h2>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                    <div>
                      <code className="bg-muted px-2 py-1 rounded text-sm">400</code>
                      <p className="text-sm font-medium mt-1">Bad Request</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-muted-foreground">
                        Invalid request parameters. Check your request body and parameters.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                    <div>
                      <code className="bg-muted px-2 py-1 rounded text-sm">401</code>
                      <p className="text-sm font-medium mt-1">Unauthorized</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-muted-foreground">
                        Invalid or missing API key. Check your Authorization header.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                    <div>
                      <code className="bg-muted px-2 py-1 rounded text-sm">403</code>
                      <p className="text-sm font-medium mt-1">Forbidden</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-muted-foreground">
                        API key doesn't have permission for this operation.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                    <div>
                      <code className="bg-muted px-2 py-1 rounded text-sm">404</code>
                      <p className="text-sm font-medium mt-1">Not Found</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-muted-foreground">
                        Resource not found. Check the endpoint URL and resource ID.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                    <div>
                      <code className="bg-muted px-2 py-1 rounded text-sm">429</code>
                      <p className="text-sm font-medium mt-1">Rate Limited</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-muted-foreground">
                        Too many requests. Implement exponential backoff and retry logic.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                    <div>
                      <code className="bg-muted px-2 py-1 rounded text-sm">500</code>
                      <p className="text-sm font-medium mt-1">Server Error</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-muted-foreground">
                        Internal server error. Contact support if this persists.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Getting Help */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Getting Help</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Community Support</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Join our community for help from other developers and the sBTC Gateway team.
                  </p>
                  <Button variant="outline" className="w-full bg-transparent">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Join Discord
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Technical Support</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    For technical issues and integration support, contact our support team.
                  </p>
                  <Button variant="outline" className="w-full bg-transparent">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Contact Support
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Debug Checklist */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Debug Checklist</h2>

            <Card>
              <CardHeader>
                <CardTitle>Before Contacting Support</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Verified API keys are correct and active</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Checked network status and blockchain explorer</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Tested with different payment amounts</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Reviewed webhook endpoint logs</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Tried with different wallets/browsers</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Checked dashboard for error messages</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-8 border-t">
            <Link href="/docs/authentication">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Authentication
              </Button>
            </Link>
            <Link href="/docs">
              <Button>
                Documentation Home
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
