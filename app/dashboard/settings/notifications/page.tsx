"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Mail, MessageSquare, Smartphone, Bell, Save, TestTube } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function NotificationsPage() {
  const { toast } = useToast()
  const [settings, setSettings] = useState({
    email: {
      enabled: true,
      address: "test@example.com",
      paymentSucceeded: true,
      paymentFailed: true,
      paymentPending: false,
      disputeCreated: true,
      weeklyReport: true,
      monthlyReport: true,
    },
    sms: {
      enabled: false,
      phoneNumber: "",
      paymentSucceeded: false,
      paymentFailed: true,
      disputeCreated: true,
    },
    slack: {
      enabled: false,
      webhookUrl: "",
      channel: "#payments",
      paymentSucceeded: true,
      paymentFailed: true,
      paymentPending: false,
      disputeCreated: true,
    },
    inApp: {
      enabled: true,
      paymentSucceeded: true,
      paymentFailed: true,
      paymentPending: true,
      disputeCreated: true,
      systemUpdates: true,
    },
  })

  const handleSave = () => {
    toast({
      title: "Notification settings saved",
      description: "Your notification preferences have been updated successfully.",
    })
  }

  const handleTestNotification = (type: string) => {
    toast({
      title: `Test ${type} notification sent`,
      description: `A test notification has been sent to your ${type} endpoint.`,
    })
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Notification Settings</h1>
            <p className="text-muted-foreground">Configure how you receive alerts about payments and system events</p>
          </div>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save Settings
          </Button>
        </div>

        {/* Email Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <span>Email Notifications</span>
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.email.enabled}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, email: { ...settings.email, enabled: checked } })
                  }
                />
                <Button variant="outline" size="sm" onClick={() => handleTestNotification("email")}>
                  <TestTube className="mr-2 h-4 w-4" />
                  Test
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="emailAddress">Email Address</Label>
              <Input
                id="emailAddress"
                type="email"
                value={settings.email.address}
                onChange={(e) => setSettings({ ...settings, email: { ...settings.email, address: e.target.value } })}
                disabled={!settings.email.enabled}
              />
            </div>

            <div className="space-y-4">
              <Label>Event Notifications</Label>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Payment Succeeded</Label>
                    <p className="text-sm text-muted-foreground">Get notified when payments are completed</p>
                  </div>
                  <Switch
                    checked={settings.email.paymentSucceeded}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, email: { ...settings.email, paymentSucceeded: checked } })
                    }
                    disabled={!settings.email.enabled}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Payment Failed</Label>
                    <p className="text-sm text-muted-foreground">Get notified when payments fail</p>
                  </div>
                  <Switch
                    checked={settings.email.paymentFailed}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, email: { ...settings.email, paymentFailed: checked } })
                    }
                    disabled={!settings.email.enabled}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Payment Pending</Label>
                    <p className="text-sm text-muted-foreground">Get notified when payments are pending confirmation</p>
                  </div>
                  <Switch
                    checked={settings.email.paymentPending}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, email: { ...settings.email, paymentPending: checked } })
                    }
                    disabled={!settings.email.enabled}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Dispute Created</Label>
                    <p className="text-sm text-muted-foreground">Get notified when disputes are opened</p>
                  </div>
                  <Switch
                    checked={settings.email.disputeCreated}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, email: { ...settings.email, disputeCreated: checked } })
                    }
                    disabled={!settings.email.enabled}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Reports</Label>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Weekly Report</Label>
                    <p className="text-sm text-muted-foreground">Receive weekly payment summaries</p>
                  </div>
                  <Switch
                    checked={settings.email.weeklyReport}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, email: { ...settings.email, weeklyReport: checked } })
                    }
                    disabled={!settings.email.enabled}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Monthly Report</Label>
                    <p className="text-sm text-muted-foreground">Receive monthly analytics reports</p>
                  </div>
                  <Switch
                    checked={settings.email.monthlyReport}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, email: { ...settings.email, monthlyReport: checked } })
                    }
                    disabled={!settings.email.enabled}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SMS Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Smartphone className="h-5 w-5" />
                <span>SMS Notifications</span>
                <Badge variant="outline">Premium</Badge>
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.sms.enabled}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, sms: { ...settings.sms, enabled: checked } })
                  }
                />
                <Button variant="outline" size="sm" onClick={() => handleTestNotification("SMS")}>
                  <TestTube className="mr-2 h-4 w-4" />
                  Test
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={settings.sms.phoneNumber}
                onChange={(e) => setSettings({ ...settings, sms: { ...settings.sms, phoneNumber: e.target.value } })}
                disabled={!settings.sms.enabled}
              />
            </div>

            <div className="space-y-4">
              <Label>Critical Alerts Only</Label>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Payment Failed</Label>
                    <p className="text-sm text-muted-foreground">Immediate alerts for failed payments</p>
                  </div>
                  <Switch
                    checked={settings.sms.paymentFailed}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, sms: { ...settings.sms, paymentFailed: checked } })
                    }
                    disabled={!settings.sms.enabled}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Dispute Created</Label>
                    <p className="text-sm text-muted-foreground">Immediate alerts for new disputes</p>
                  </div>
                  <Switch
                    checked={settings.sms.disputeCreated}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, sms: { ...settings.sms, disputeCreated: checked } })
                    }
                    disabled={!settings.sms.enabled}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Slack Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Slack Notifications</span>
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.slack.enabled}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, slack: { ...settings.slack, enabled: checked } })
                  }
                />
                <Button variant="outline" size="sm" onClick={() => handleTestNotification("Slack")}>
                  <TestTube className="mr-2 h-4 w-4" />
                  Test
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="slackWebhook">Webhook URL</Label>
                <Input
                  id="slackWebhook"
                  type="url"
                  placeholder="https://hooks.slack.com/services/..."
                  value={settings.slack.webhookUrl}
                  onChange={(e) =>
                    setSettings({ ...settings, slack: { ...settings.slack, webhookUrl: e.target.value } })
                  }
                  disabled={!settings.slack.enabled}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slackChannel">Channel</Label>
                <Input
                  id="slackChannel"
                  placeholder="#payments"
                  value={settings.slack.channel}
                  onChange={(e) => setSettings({ ...settings, slack: { ...settings.slack, channel: e.target.value } })}
                  disabled={!settings.slack.enabled}
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label>Event Notifications</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Payment Succeeded</Label>
                    <p className="text-sm text-muted-foreground">Success notifications</p>
                  </div>
                  <Switch
                    checked={settings.slack.paymentSucceeded}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, slack: { ...settings.slack, paymentSucceeded: checked } })
                    }
                    disabled={!settings.slack.enabled}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Payment Failed</Label>
                    <p className="text-sm text-muted-foreground">Failure alerts</p>
                  </div>
                  <Switch
                    checked={settings.slack.paymentFailed}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, slack: { ...settings.slack, paymentFailed: checked } })
                    }
                    disabled={!settings.slack.enabled}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Payment Pending</Label>
                    <p className="text-sm text-muted-foreground">Pending notifications</p>
                  </div>
                  <Switch
                    checked={settings.slack.paymentPending}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, slack: { ...settings.slack, paymentPending: checked } })
                    }
                    disabled={!settings.slack.enabled}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Dispute Created</Label>
                    <p className="text-sm text-muted-foreground">Dispute alerts</p>
                  </div>
                  <Switch
                    checked={settings.slack.disputeCreated}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, slack: { ...settings.slack, disputeCreated: checked } })
                    }
                    disabled={!settings.slack.enabled}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* In-App Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>In-App Notifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Payment Events</Label>
                  <p className="text-sm text-muted-foreground">All payment notifications</p>
                </div>
                <Switch
                  checked={settings.inApp.paymentSucceeded}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, inApp: { ...settings.inApp, paymentSucceeded: checked } })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>System Updates</Label>
                  <p className="text-sm text-muted-foreground">Platform announcements</p>
                </div>
                <Switch
                  checked={settings.inApp.systemUpdates}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, inApp: { ...settings.inApp, systemUpdates: checked } })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
