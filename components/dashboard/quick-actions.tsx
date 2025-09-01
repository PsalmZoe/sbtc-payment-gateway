"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Link, Settings, Key, Webhook, Copy, Check, ExternalLink } from "lucide-react"

interface ApiKey {
  id: string
  key: string
  type: "test" | "live"
}

interface WebhookEndpoint {
  url: string
  status: "active" | "inactive"
}

export function QuickActions() {
  const router = useRouter()
  const [copied, setCopied] = useState<string | null>(null)
  const [paymentAmount, setPaymentAmount] = useState("")
  const [paymentDescription, setPaymentDescription] = useState("")
  const [apiKey, setApiKey] = useState<ApiKey | null>(null)
  const [webhookEndpoint, setWebhookEndpoint] = useState<WebhookEndpoint | null>(null)
  const [loading, setLoading] = useState(true)
  const [isCreatingLink, setIsCreatingLink] = useState(false)

  useEffect(() => {
    const fetchQuickData = async () => {
      try {
        setTimeout(() => {
          setApiKey({
            id: "key_test_123",
            key: "sk_test_51234567890abcdef1234567890abcdef12345678",
            type: "test",
          })
          setWebhookEndpoint({
            url: "https://your-app.com/webhooks/sbtc",
            status: "active",
          })
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Failed to fetch quick action data:", error)
        setLoading(false)
      }
    }

    fetchQuickData()
  }, [])

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    } catch (error) {
      console.error("Failed to copy to clipboard:", error)
    }
  }

  const createPaymentLink = async () => {
    if (!paymentAmount) return

    setIsCreatingLink(true)
    try {
      const paymentId = Math.random().toString(36).substring(2, 15)
      const paymentLink = `${window.location.origin}/checkout/${paymentId}?amount=${paymentAmount}&description=${encodeURIComponent(paymentDescription || "")}`

      await copyToClipboard(paymentLink, "payment-link")

      // Reset form
      setPaymentAmount("")
      setPaymentDescription("")
    } catch (error) {
      console.error("Failed to create payment link:", error)
    } finally {
      setIsCreatingLink(false)
    }
  }

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>Quick Actions</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Create Payment Link */}
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full justify-start bg-transparent" variant="outline">
              <Link className="mr-2 h-4 w-4" />
              Create Payment Link
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Payment Link</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="amount">Amount (sBTC)</Label>
                <Input
                  id="amount"
                  placeholder="0.00100000"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  type="number"
                  step="0.00000001"
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Payment for..."
                  rows={3}
                  value={paymentDescription}
                  onChange={(e) => setPaymentDescription(e.target.value)}
                />
              </div>
              <Button onClick={createPaymentLink} className="w-full" disabled={!paymentAmount || isCreatingLink}>
                {isCreatingLink ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Creating...
                  </>
                ) : copied === "payment-link" ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Link Copied!
                  </>
                ) : (
                  <>
                    <Link className="mr-2 h-4 w-4" />
                    Create & Copy Link
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* API Keys */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Test API Key</span>
            <Badge variant="secondary">Test</Badge>
          </div>
          {loading ? (
            <Skeleton className="h-10 w-full" />
          ) : apiKey ? (
            <div className="flex items-center space-x-2">
              <Input value={`${apiKey.key.substring(0, 20)}...`} readOnly className="font-mono text-xs" />
              <Button variant="outline" size="icon" onClick={() => copyToClipboard(apiKey.key, "api-key")}>
                {copied === "api-key" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No API keys found. Create one in Settings.</div>
          )}
        </div>

        {/* Webhook Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Webhook Endpoint</span>
            {loading ? (
              <Skeleton className="h-5 w-16" />
            ) : webhookEndpoint ? (
              <Badge variant={webhookEndpoint.status === "active" ? "default" : "destructive"}>
                {webhookEndpoint.status === "active" ? "Active" : "Inactive"}
              </Badge>
            ) : (
              <Badge variant="outline">None</Badge>
            )}
          </div>
          {loading ? (
            <Skeleton className="h-8 w-full" />
          ) : webhookEndpoint ? (
            <div className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded">{webhookEndpoint.url}</div>
          ) : (
            <div className="text-xs text-muted-foreground">No webhook configured. Set up in Settings.</div>
          )}
        </div>

        {/* Quick Settings */}
        <div className="pt-2 border-t space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start"
            size="sm"
            onClick={() => handleNavigation("/dashboard/settings")}
          >
            <Settings className="mr-2 h-4 w-4" />
            Account Settings
            <ExternalLink className="ml-auto h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start"
            size="sm"
            onClick={() => handleNavigation("/dashboard/settings/api-keys")}
          >
            <Key className="mr-2 h-4 w-4" />
            Manage API Keys
            <ExternalLink className="ml-auto h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start"
            size="sm"
            onClick={() => handleNavigation("/dashboard/settings/webhooks")}
          >
            <Webhook className="mr-2 h-4 w-4" />
            Webhook Settings
            <ExternalLink className="ml-auto h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
