"use client"

import type React from "react"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Copy, ExternalLink, QrCode } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function CreatePaymentLinkPage() {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    currency: "sBTC",
    collectCustomerInfo: true,
    allowCustomAmount: false,
    expiresIn: "24h",
    successUrl: "",
    cancelUrl: "",
  })
  const [generatedLink, setGeneratedLink] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      console.log("[v0] Creating payment intent with form data:", formData)

      const response = await fetch("/api/v1/payment_intents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer sk_test_51234567890abcdef`,
        },
        body: JSON.stringify({
          amount: formData.amount,
          currency: formData.currency,
          description: formData.description,
          metadata: {
            success_url: formData.successUrl,
            cancel_url: formData.cancelUrl,
            expires_in: formData.expiresIn,
            collect_customer_info: formData.collectCustomerInfo,
            allow_custom_amount: formData.allowCustomAmount,
            created_via: "dashboard_create_link",
          },
        }),
      })

      console.log("[v0] Payment intent response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[v0] Payment intent creation failed:", errorText)
        throw new Error(`Failed to create payment intent: ${response.status}`)
      }

      const paymentIntent = await response.json()
      console.log("[v0] Payment intent created successfully:", paymentIntent.id)

      setGeneratedLink(paymentIntent.checkoutUrl)

      toast({
        title: "Payment link created",
        description: "Your sBTC payment link is ready to share.",
      })
    } catch (error) {
      console.error("[v0] Failed to create payment intent:", error)

      toast({
        title: "Error creating payment link",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "Payment link has been copied to your clipboard.",
    })
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Create Payment Link</h1>
          <p className="text-muted-foreground">Generate a shareable payment link for your customers</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="amount"
                      type="number"
                      step="any"
                      placeholder={formData.currency === "sBTC" ? "0.00050000" : "50000"}
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="flex-1"
                      required
                    />
                    <Select
                      value={formData.currency}
                      onValueChange={(value) => setFormData({ ...formData, currency: value })}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sats">sats</SelectItem>
                        <SelectItem value="sBTC">sBTC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formData.currency === "sBTC"
                      ? "Enter amount in sBTC (e.g., 0.0005 for 50,000 sats)"
                      : "Enter amount in satoshis (e.g., 50000 for 0.0005 sBTC)"}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Premium subscription"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="collect-info">Collect customer information</Label>
                    <Switch
                      id="collect-info"
                      checked={formData.collectCustomerInfo}
                      onCheckedChange={(checked) => setFormData({ ...formData, collectCustomerInfo: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="custom-amount">Allow custom amount</Label>
                    <Switch
                      id="custom-amount"
                      checked={formData.allowCustomAmount}
                      onCheckedChange={(checked) => setFormData({ ...formData, allowCustomAmount: checked })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expires">Link expires in</Label>
                  <Select
                    value={formData.expiresIn}
                    onValueChange={(value) => setFormData({ ...formData, expiresIn: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1h">1 hour</SelectItem>
                      <SelectItem value="24h">24 hours</SelectItem>
                      <SelectItem value="7d">7 days</SelectItem>
                      <SelectItem value="30d">30 days</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="success-url">Success redirect URL (optional)</Label>
                  <Input
                    id="success-url"
                    type="url"
                    placeholder="https://yoursite.com/success"
                    value={formData.successUrl}
                    onChange={(e) => setFormData({ ...formData, successUrl: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cancel-url">Cancel redirect URL (optional)</Label>
                  <Input
                    id="cancel-url"
                    type="url"
                    placeholder="https://yoursite.com/cancel"
                    value={formData.cancelUrl}
                    onChange={(e) => setFormData({ ...formData, cancelUrl: e.target.value })}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Payment Link"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {generatedLink && (
            <Card>
              <CardHeader>
                <CardTitle>Generated Payment Link</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Payment Link</Label>
                  <div className="flex items-center space-x-2">
                    <Input value={generatedLink} readOnly className="flex-1" />
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(generatedLink)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => window.open(generatedLink, "_blank")}>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>QR Code</Label>
                  <div className="flex items-center justify-center p-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                    <div className="text-center space-y-2">
                      <QrCode className="h-12 w-12 mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">QR code will be generated here</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Link Details</Label>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Amount:</span>
                      <span>
                        {formData.amount} {formData.currency}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Description:</span>
                      <span>{formData.description || "No description"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Expires:</span>
                      <Badge variant="outline">{formData.expiresIn === "never" ? "Never" : formData.expiresIn}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
