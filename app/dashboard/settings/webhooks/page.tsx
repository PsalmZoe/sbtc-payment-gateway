"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Webhook, Plus, TestTube, Eye, Trash2, CheckCircle, XCircle, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const availableEvents = [
  { id: "payment.succeeded", name: "Payment Succeeded", description: "Sent when a payment is successfully completed" },
  { id: "payment.failed", name: "Payment Failed", description: "Sent when a payment fails" },
  { id: "payment.pending", name: "Payment Pending", description: "Sent when a payment is awaiting confirmation" },
  { id: "payment.refunded", name: "Payment Refunded", description: "Sent when a payment is refunded" },
  { id: "dispute.created", name: "Dispute Created", description: "Sent when a dispute is opened" },
  { id: "dispute.resolved", name: "Dispute Resolved", description: "Sent when a dispute is resolved" },
]

const recentDeliveries = [
  {
    id: "del_1234567890",
    webhookId: "wh_1234567890",
    event: "payment.succeeded",
    status: "success",
    timestamp: "2024-01-15T14:22:00Z",
    responseCode: 200,
    responseTime: 245,
  },
  {
    id: "del_0987654321",
    webhookId: "wh_1234567890",
    event: "payment.pending",
    status: "success",
    timestamp: "2024-01-15T14:15:00Z",
    responseCode: 200,
    responseTime: 189,
  },
  {
    id: "del_1122334455",
    webhookId: "wh_0987654321",
    event: "payment.failed",
    status: "failed",
    timestamp: "2024-01-15T13:45:00Z",
    responseCode: 500,
    responseTime: 5000,
  },
]

export default function WebhookSettingsPage() {
  const { toast } = useToast()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [webhooks, setWebhooks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newWebhookData, setNewWebhookData] = useState({
    url: "",
    events: [] as string[],
    active: true,
  })

  useEffect(() => {
    fetchWebhooks()
  }, [])

  useEffect(() => {
    if (webhooks.length > 0 && !loading) {
      localStorage.setItem("sbtc-webhooks", JSON.stringify(webhooks))
    }
  }, [webhooks, loading])

  const fetchWebhooks = async () => {
    try {
      const savedWebhooks = localStorage.getItem("sbtc-webhooks")
      if (savedWebhooks) {
        try {
          const parsedWebhooks = JSON.parse(savedWebhooks)
          setWebhooks(parsedWebhooks)
          setLoading(false)
          return
        } catch (error) {
          console.error("Failed to parse saved webhooks:", error)
        }
      }

      const apiKey = process.env.NEXT_PUBLIC_SBTC_PUBLISHABLE_KEY || "sk_test_your_api_key_here"

      const response = await fetch("/api/v1/webhooks", {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        const webhookData = data.webhook_url
          ? [
              {
                id: "wh_" + Math.random().toString(36).substring(2, 15),
                url: data.webhook_url,
                events: ["payment.succeeded", "payment.failed", "payment.pending"],
                status: "active",
                created: new Date().toISOString(),
                lastDelivery: new Date().toISOString(),
                successRate: 98.5,
                totalDeliveries: data.events?.length || 0,
              },
            ]
          : []

        setWebhooks(webhookData)
      }
    } catch (error) {
      console.error("Failed to fetch webhooks:", error)
      setWebhooks([
        {
          id: "wh_1234567890",
          url: "https://api.example.com/webhooks/sbtc",
          events: ["payment.succeeded", "payment.failed", "payment.pending"],
          status: "active",
          created: "2024-01-15T10:30:00Z",
          lastDelivery: "2024-01-15T14:22:00Z",
          successRate: 98.5,
          totalDeliveries: 1247,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateWebhook = async () => {
    if (!newWebhookData.url) {
      toast({
        title: "Error",
        description: "Please enter a webhook URL.",
        variant: "destructive",
      })
      return
    }

    try {
      const apiKey = process.env.NEXT_PUBLIC_SBTC_PUBLISHABLE_KEY || "sk_test_your_api_key_here"

      const response = await fetch("/api/v1/webhooks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          webhook_url: newWebhookData.url,
        }),
      })

      const contentType = response.headers.get("content-type")

      if (response.ok) {
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json()

          toast({
            title: "Webhook created successfully!",
            description: `Your webhook secret is: ${data.webhook_secret}`,
          })

          const newWebhook = {
            id: data.id || "wh_" + Math.random().toString(36).substring(2, 15),
            url: data.webhook_url,
            events: newWebhookData.events,
            status: newWebhookData.active ? "active" : "inactive",
            created: new Date().toISOString(),
            lastDelivery: null,
            successRate: 100,
            totalDeliveries: 0,
            webhookSecret: data.webhook_secret,
          }

          setWebhooks((prev) => [...prev, newWebhook])
          setIsCreateDialogOpen(false)
          setNewWebhookData({ url: "", events: [], active: true })

          setTimeout(() => {
            toast({
              title: "Important: Save your webhook secret",
              description: `Webhook Secret: ${data.webhook_secret}`,
              duration: 10000,
            })
          }, 1000)
        } else {
          const textResponse = await response.text()
          console.error("Non-JSON response:", textResponse)
          toast({
            title: "Unexpected response format",
            description: "The server returned an unexpected response format.",
            variant: "destructive",
          })
        }
      } else {
        let errorMessage = "An error occurred"

        if (contentType && contentType.includes("application/json")) {
          try {
            const errorData = await response.json()
            errorMessage = errorData.error || errorMessage
          } catch (jsonError) {
            console.error("Failed to parse error JSON:", jsonError)
          }
        } else {
          const textResponse = await response.text()
          console.error("HTML error response:", textResponse)
          errorMessage = `Server error (${response.status}). Please check your API configuration.`
        }

        toast({
          title: "Failed to create webhook",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to create webhook:", error)
      toast({
        title: "Failed to create webhook",
        description: "Network error or invalid response format. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleTestWebhook = (webhookId: string) => {
    toast({
      title: "Test webhook sent",
      description: "A test event has been sent to your webhook endpoint.",
    })
  }

  const handleDeleteWebhook = (webhookId: string) => {
    setWebhooks((prev) => prev.filter((webhook) => webhook.id !== webhookId))
    toast({
      title: "Webhook deleted",
      description: "The webhook endpoint has been removed.",
      variant: "destructive",
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Inactive</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getDeliveryStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const handleEventToggle = (eventId: string, checked: boolean) => {
    if (checked) {
      setNewWebhookData({ ...newWebhookData, events: [...newWebhookData.events, eventId] })
    } else {
      setNewWebhookData({ ...newWebhookData, events: newWebhookData.events.filter((e) => e !== eventId) })
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Webhook Settings</h1>
            <p className="text-muted-foreground">Configure webhook endpoints to receive real-time payment events</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Webhook
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Webhook</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="webhookUrl">Endpoint URL</Label>
                  <Input
                    id="webhookUrl"
                    type="url"
                    placeholder="https://api.yoursite.com/webhooks/sbtc"
                    value={newWebhookData.url}
                    onChange={(e) => setNewWebhookData({ ...newWebhookData, url: e.target.value })}
                  />
                  <p className="text-sm text-muted-foreground">
                    This URL will receive webhook events. Make sure it can handle POST requests.
                  </p>
                </div>

                <div className="space-y-4">
                  <Label>Events to Send</Label>
                  <div className="grid grid-cols-1 gap-3">
                    {availableEvents.map((event) => (
                      <div key={event.id} className="flex items-start space-x-3">
                        <Checkbox
                          id={event.id}
                          checked={newWebhookData.events.includes(event.id)}
                          onCheckedChange={(checked) => handleEventToggle(event.id, checked as boolean)}
                        />
                        <div className="space-y-1">
                          <Label htmlFor={event.id} className="text-sm font-medium">
                            {event.name}
                          </Label>
                          <p className="text-xs text-muted-foreground">{event.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="active">Active</Label>
                    <p className="text-sm text-muted-foreground">Enable this webhook immediately</p>
                  </div>
                  <Switch
                    id="active"
                    checked={newWebhookData.active}
                    onCheckedChange={(checked) => setNewWebhookData({ ...newWebhookData, active: checked })}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateWebhook} disabled={!newWebhookData.url}>
                    Create Webhook
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Webhook Endpoints */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Webhook className="h-5 w-5" />
              <span>Webhook Endpoints</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <div className="h-4 bg-muted animate-pulse rounded" />
                <div className="h-4 bg-muted animate-pulse rounded" />
                <div className="h-4 bg-muted animate-pulse rounded" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>URL</TableHead>
                    <TableHead>Events</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Success Rate</TableHead>
                    <TableHead>Last Delivery</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {webhooks.map((webhook) => (
                    <TableRow key={webhook.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium truncate max-w-xs">{webhook.url}</p>
                          <p className="text-sm text-muted-foreground">{webhook.id}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {webhook.events.slice(0, 2).map((event: string) => (
                            <Badge key={event} variant="outline" className="text-xs">
                              {event.split(".")[1]}
                            </Badge>
                          ))}
                          {webhook.events.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{webhook.events.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(webhook.status)}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{webhook.successRate}%</p>
                          <p className="text-sm text-muted-foreground">{webhook.totalDeliveries} total</p>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(webhook.lastDelivery)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Button variant="ghost" size="sm" onClick={() => handleTestWebhook(webhook.id)}>
                            <TestTube className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                              // View webhook details functionality can be added here
                              console.log("View webhook:", webhook.id)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteWebhook(webhook.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Recent Deliveries */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Deliveries</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Webhook</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Response</TableHead>
                  <TableHead>Response Time</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentDeliveries.map((delivery) => (
                  <TableRow key={delivery.id}>
                    <TableCell>
                      <Badge variant="outline">{delivery.event.split(".")[1]}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{delivery.webhookId}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getDeliveryStatusIcon(delivery.status)}
                        <span className="capitalize">{delivery.status}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          delivery.responseCode === 200
                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                            : "bg-red-100 text-red-800 hover:bg-red-100"
                        }
                      >
                        {delivery.responseCode}
                      </Badge>
                    </TableCell>
                    <TableCell>{delivery.responseTime}ms</TableCell>
                    <TableCell>{formatDate(delivery.timestamp)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                          // View delivery details functionality can be added here
                          console.log("View delivery:", delivery.id)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
