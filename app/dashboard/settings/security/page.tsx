"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Shield, Smartphone, Key, Eye, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Mock security data
const apiKeyUsage = [
  {
    keyId: "pk_live_1234567890",
    lastUsed: "2024-01-15T14:22:00Z",
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    requests: 1247,
    location: "San Francisco, CA",
  },
  {
    keyId: "sk_live_abcdef1234",
    lastUsed: "2024-01-15T14:20:00Z",
    ipAddress: "10.0.0.50",
    userAgent: "Node.js/18.0.0",
    requests: 856,
    location: "AWS us-west-2",
  },
]

const loginHistory = [
  {
    id: "1",
    timestamp: "2024-01-15T14:22:00Z",
    ipAddress: "192.168.1.100",
    location: "San Francisco, CA",
    device: "Chrome on macOS",
    status: "success",
  },
  {
    id: "2",
    timestamp: "2024-01-14T09:15:00Z",
    ipAddress: "192.168.1.100",
    location: "San Francisco, CA",
    device: "Chrome on macOS",
    status: "success",
  },
  {
    id: "3",
    timestamp: "2024-01-13T16:45:00Z",
    ipAddress: "203.0.113.1",
    location: "Unknown",
    device: "Unknown",
    status: "failed",
  },
]

export default function SecurityPage() {
  const { toast } = useToast()
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [ipWhitelistEnabled, setIpWhitelistEnabled] = useState(false)
  const [sessionTimeout, setSessionTimeout] = useState("24")
  const [isSetup2FAOpen, setIsSetup2FAOpen] = useState(false)

  const handleEnable2FA = () => {
    setTwoFactorEnabled(true)
    setIsSetup2FAOpen(false)
    toast({
      title: "2FA enabled",
      description: "Two-factor authentication has been successfully enabled for your account.",
    })
  }

  const handleDisable2FA = () => {
    setTwoFactorEnabled(false)
    toast({
      title: "2FA disabled",
      description: "Two-factor authentication has been disabled for your account.",
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "failed":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Success</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Failed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Security Settings</h1>
          <p className="text-muted-foreground">Manage your account security and access controls</p>
        </div>

        {/* Security Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Security Score</p>
                  <p className="text-2xl font-bold">85%</p>
                  <p className="text-sm text-green-600">Good</p>
                </div>
                <Shield className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">2FA Status</p>
                  <p className="text-2xl font-bold">{twoFactorEnabled ? "Enabled" : "Disabled"}</p>
                  <p className={`text-sm ${twoFactorEnabled ? "text-green-600" : "text-red-600"}`}>
                    {twoFactorEnabled ? "Protected" : "Vulnerable"}
                  </p>
                </div>
                <Smartphone className={`h-8 w-8 ${twoFactorEnabled ? "text-green-600" : "text-red-600"}`} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Sessions</p>
                  <p className="text-2xl font-bold">2</p>
                  <p className="text-sm text-blue-600">Current devices</p>
                </div>
                <Key className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Two-Factor Authentication */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Smartphone className="h-5 w-5" />
              <span>Two-Factor Authentication</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Authenticator App</h3>
                <p className="text-sm text-muted-foreground">Use an authenticator app to generate verification codes</p>
              </div>
              <div className="flex items-center space-x-2">
                {twoFactorEnabled ? (
                  <>
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Enabled</Badge>
                    <Button variant="outline" size="sm" onClick={handleDisable2FA}>
                      Disable
                    </Button>
                  </>
                ) : (
                  <Dialog open={isSetup2FAOpen} onOpenChange={setIsSetup2FAOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">Enable 2FA</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Set up Two-Factor Authentication</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="text-center">
                          <div className="w-48 h-48 bg-muted rounded-lg mx-auto mb-4 flex items-center justify-center">
                            <p className="text-sm text-muted-foreground">QR Code will appear here</p>
                          </div>
                          <p className="text-sm text-muted-foreground">Scan this QR code with your authenticator app</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="verificationCode">Verification Code</Label>
                          <Input id="verificationCode" placeholder="Enter 6-digit code" maxLength={6} />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setIsSetup2FAOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleEnable2FA}>Enable 2FA</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>

            {!twoFactorEnabled && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-yellow-800">Enhance your security</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      Enable two-factor authentication to add an extra layer of security to your account.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Access Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Access Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label>IP Address Whitelist</Label>
                <p className="text-sm text-muted-foreground">Restrict API access to specific IP addresses</p>
              </div>
              <Switch checked={ipWhitelistEnabled} onCheckedChange={setIpWhitelistEnabled} />
            </div>

            {ipWhitelistEnabled && (
              <div className="space-y-2">
                <Label htmlFor="allowedIPs">Allowed IP Addresses</Label>
                <Input id="allowedIPs" placeholder="192.168.1.0/24, 10.0.0.1" className="font-mono text-sm" />
                <p className="text-xs text-muted-foreground">Enter IP addresses or CIDR blocks separated by commas</p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="sessionTimeout">Session Timeout</Label>
                <p className="text-sm text-muted-foreground">Automatically log out after inactivity</p>
              </div>
              <div className="flex items-center space-x-2">
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(e.target.value)}
                  className="w-20"
                />
                <span className="text-sm text-muted-foreground">hours</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Key Usage */}
        <Card>
          <CardHeader>
            <CardTitle>API Key Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>API Key</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Requests (24h)</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeyUsage.map((usage) => (
                  <TableRow key={usage.keyId}>
                    <TableCell className="font-mono text-sm">{usage.keyId}</TableCell>
                    <TableCell>{formatDate(usage.lastUsed)}</TableCell>
                    <TableCell className="font-mono text-sm">{usage.ipAddress}</TableCell>
                    <TableCell>{usage.location}</TableCell>
                    <TableCell>{usage.requests.toLocaleString()}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Login History */}
        <Card>
          <CardHeader>
            <CardTitle>Login History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loginHistory.map((login) => (
                  <TableRow key={login.id}>
                    <TableCell>{formatDate(login.timestamp)}</TableCell>
                    <TableCell className="font-mono text-sm">{login.ipAddress}</TableCell>
                    <TableCell>{login.location}</TableCell>
                    <TableCell>{login.device}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(login.status)}
                        {getStatusBadge(login.status)}
                      </div>
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
