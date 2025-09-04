"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, ExternalLink, Loader2 } from "lucide-react"

export default function TestPaymentPage() {
  const [testResults, setTestResults] = useState<any[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [paymentLink, setPaymentLink] = useState("")
  const [testAmount, setTestAmount] = useState("50000")

  const addResult = (test: string, status: "success" | "error" | "info", message: string, data?: any) => {
    setTestResults((prev) => [
      ...prev,
      {
        test,
        status,
        message,
        data,
        timestamp: new Date().toLocaleTimeString(),
      },
    ])
  }

  const runCompleteTest = async () => {
    setIsRunning(true)
    setTestResults([])
    setPaymentLink("")

    try {
      addResult("Database", "info", "Testing database connection...")

      // Test 1: Database Connection
      const dbResponse = await fetch("/api/v1/init")
      const dbData = await dbResponse.json()

      if (dbResponse.ok) {
        addResult("Database", "success", "Database connection successful", dbData)
      } else {
        addResult("Database", "error", `Database connection failed: ${dbData.error}`)
        return
      }

      addResult("Payment Intent", "info", "Creating payment intent...")

      // Test 2: Create Payment Intent
      const paymentResponse = await fetch("/api/v1/payment_intents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer sk_test_51234567890abcdef",
        },
        body: JSON.stringify({
          amount: Number.parseInt(testAmount),
          metadata: {
            description: "Test Payment",
            test: true,
            created_via: "test_suite",
          },
        }),
      })

      const paymentData = await paymentResponse.json()

      if (paymentResponse.ok) {
        addResult("Payment Intent", "success", "Payment intent created successfully", paymentData)
        setPaymentLink(paymentData.checkoutUrl)

        // Test 3: Verify Payment Intent Retrieval
        addResult("Payment Retrieval", "info", "Testing payment intent retrieval...")

        const retrieveResponse = await fetch(`/api/v1/payment_intents?id=${paymentData.id}`)
        const retrieveData = await retrieveResponse.json()

        if (retrieveResponse.ok) {
          addResult("Payment Retrieval", "success", "Payment intent retrieved successfully", retrieveData)
        } else {
          addResult("Payment Retrieval", "error", `Failed to retrieve payment intent: ${retrieveData.error}`)
        }

        // Test 4: Test Status Update
        addResult("Status Update", "info", "Testing payment status update...")

        const statusResponse = await fetch(`/api/v1/payment_intents/${paymentData.id}/status`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "succeeded",
            tx_hash: "0xtest1234567890abcdef",
            block_height: 12345,
          }),
        })

        const statusData = await statusResponse.json()

        if (statusResponse.ok) {
          addResult("Status Update", "success", "Payment status updated successfully", statusData)
        } else {
          addResult("Status Update", "error", `Failed to update payment status: ${statusData.error}`)
        }
      } else {
        addResult("Payment Intent", "error", `Payment intent creation failed: ${paymentData.error}`, paymentData)
      }

      // Test 5: Webhook Test
      addResult("Webhook", "info", "Testing webhook system...")

      const webhookResponse = await fetch("/api/v1/webhook-test", {
        method: "POST",
      })

      const webhookData = await webhookResponse.json()

      if (webhookResponse.ok) {
        addResult("Webhook", "success", "Webhook test completed", webhookData)
      } else {
        addResult("Webhook", "error", `Webhook test failed: ${webhookData.error}`)
      }
    } catch (error) {
      addResult("System", "error", `Test suite error: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsRunning(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />
      case "info":
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">sBTC Payment Gateway Test Suite</h1>
          <p className="text-muted-foreground mt-2">Test the complete payment flow from creation to completion</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Test Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Test Amount (satoshis)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={testAmount}
                  onChange={(e) => setTestAmount(e.target.value)}
                  placeholder="50000"
                />
              </div>
              <div className="space-y-2">
                <Label>API Key</Label>
                <Input value="sk_test_51234567890abcdef" readOnly className="bg-muted" />
              </div>
            </div>

            <Button onClick={runCompleteTest} disabled={isRunning} className="w-full" size="lg">
              {isRunning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running Tests...
                </>
              ) : (
                "Run Complete Payment Flow Test"
              )}
            </Button>
          </CardContent>
        </Card>

        {paymentLink && (
          <Card>
            <CardHeader>
              <CardTitle>Generated Payment Link</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Input value={paymentLink} readOnly className="flex-1" />
                <Button variant="outline" size="sm" onClick={() => window.open(paymentLink, "_blank")}>
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Click the link to test the checkout flow with a Stacks wallet
              </p>
            </CardContent>
          </Card>
        )}

        {testResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                    {getStatusIcon(result.status)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <Badge
                          variant={
                            result.status === "success"
                              ? "default"
                              : result.status === "error"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {result.test}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{result.timestamp}</span>
                      </div>
                      <p className="text-sm mt-1">{result.message}</p>
                      {result.data && (
                        <details className="mt-2">
                          <summary className="text-xs text-muted-foreground cursor-pointer">View Details</summary>
                          <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-x-auto">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Manual Testing Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold">1. Create Payment Link</h4>
                <p className="text-sm text-muted-foreground">
                  Go to{" "}
                  <a href="/dashboard/payments/create-link" className="text-blue-500 underline">
                    /dashboard/payments/create-link
                  </a>{" "}
                  and create a payment link
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">2. Test Checkout Flow</h4>
                <p className="text-sm text-muted-foreground">
                  Open the generated payment link and test with a Stacks wallet (Leather or Xverse)
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">3. Verify Payment History</h4>
                <p className="text-sm text-muted-foreground">
                  Check{" "}
                  <a href="/dashboard/payments" className="text-blue-500 underline">
                    /dashboard/payments
                  </a>{" "}
                  to see if the payment appears in history
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">4. Required Setup</h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Install Leather or Xverse wallet</li>
                  <li>
                    • Get testnet STX from{" "}
                    <a
                      href="https://explorer.stacks.co/sandbox/faucet?chain=testnet"
                      className="text-blue-500 underline"
                    >
                      Stacks Faucet
                    </a>
                  </li>
                  <li>• Ensure DATABASE_URL is configured</li>
                  <li>• Run database migration scripts</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
