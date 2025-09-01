"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Key, Plus, Copy, Eye, EyeOff, Trash2, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Mock API keys data
const apiKeys = [
  {
    id: "pk_live_1234567890abcdef",
    name: "Production Key",
    type: "publishable",
    environment: "live",
    created: "2024-01-15T10:30:00Z",
    lastUsed: "2024-01-15T14:22:00Z",
    permissions: ["read", "write"],
    status: "active",
  },
  {
    id: "sk_live_abcdef1234567890",
    name: "Production Secret",
    type: "secret",
    environment: "live",
    created: "2024-01-15T10:30:00Z",
    lastUsed: "2024-01-15T14:20:00Z",
    permissions: ["read", "write", "admin"],
    status: "active",
  },
  {
    id: "pk_test_9876543210fedcba",
    name: "Test Key",
    type: "publishable",
    environment: "test",
    created: "2024-01-10T09:15:00Z",
    lastUsed: "2024-01-14T16:45:00Z",
    permissions: ["read", "write"],
    status: "active",
  },
]

export default function APIKeysPage() {
  const { toast } = useToast()
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newKeyData, setNewKeyData] = useState({
    name: "",
    type: "publishable",
    environment: "test",
    permissions: ["read"],
  })

  const toggleSecretVisibility = (keyId: string) => {
    setShowSecrets((prev) => ({ ...prev, [keyId]: !prev[keyId] }))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "API key has been copied to your clipboard.",
    })
  }

  const handleCreateKey = () => {
    toast({
      title: "API key created",
      description: "Your new API key has been generated successfully.",
    })
    setIsCreateDialogOpen(false)
    setNewKeyData({ name: "", type: "publishable", environment: "test", permissions: ["read"] })
  }

  const handleRevokeKey = (keyId: string) => {
    toast({
      title: "API key revoked",
      description: "The API key has been revoked and is no longer valid.",
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

  const getKeyTypeBadge = (type: string) => {
    return type === "secret" ? (
      <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Secret</Badge>
    ) : (
      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Publishable</Badge>
    )
  }

  const getEnvironmentBadge = (environment: string) => {
    return environment === "live" ? (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Live</Badge>
    ) : (
      <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Test</Badge>
    )
  }

  const maskKey = (key: string, show: boolean) => {
    if (show) return key
    const prefix = key.split("_")[0] + "_" + key.split("_")[1] + "_"
    return prefix + "•".repeat(20)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">API Keys</h1>
            <p className="text-muted-foreground">Manage your API keys for accessing the sBTC Gateway</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create API Key
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New API Key</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="keyName">Key Name</Label>
                  <Input
                    id="keyName"
                    placeholder="e.g., Production Frontend"
                    value={newKeyData.name}
                    onChange={(e) => setNewKeyData({ ...newKeyData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="keyType">Key Type</Label>
                  <Select
                    value={newKeyData.type}
                    onValueChange={(value) => setNewKeyData({ ...newKeyData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="publishable">Publishable Key (Frontend)</SelectItem>
                      <SelectItem value="secret">Secret Key (Backend)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="environment">Environment</Label>
                  <Select
                    value={newKeyData.environment}
                    onValueChange={(value) => setNewKeyData({ ...newKeyData, environment: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="test">Test</SelectItem>
                      <SelectItem value="live">Live</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateKey}>Create Key</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Security Warning */}
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-yellow-800">Keep your API keys secure</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Never share your secret keys publicly or commit them to version control. Use environment variables to
                  store keys securely.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Keys Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Key className="h-5 w-5" />
              <span>Your API Keys</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Key</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Environment</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell className="font-medium">{key.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {maskKey(key.id, showSecrets[key.id] || false)}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSecretVisibility(key.id)}
                          className="h-6 w-6 p-0"
                        >
                          {showSecrets[key.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(key.id)}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>{getKeyTypeBadge(key.type)}</TableCell>
                    <TableCell>{getEnvironmentBadge(key.environment)}</TableCell>
                    <TableCell>{formatDate(key.created)}</TableCell>
                    <TableCell>{formatDate(key.lastUsed)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRevokeKey(key.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Usage Guidelines */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Publishable Keys</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Use publishable keys in your frontend code. They can be safely exposed in client-side applications.
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Safe to use in JavaScript</li>
                <li>• Can be included in mobile apps</li>
                <li>• Limited to read-only operations</li>
                <li>• Start with pk_</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Secret Keys</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Secret keys should only be used on your server. Never expose them in client-side code.
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Server-side only</li>
                <li>• Full API access</li>
                <li>• Can create and modify resources</li>
                <li>• Start with sk_</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
