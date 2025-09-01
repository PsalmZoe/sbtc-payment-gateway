"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Download, Eye, ExternalLink, Activity, AlertCircle, CheckCircle, Clock } from "lucide-react"

// Mock blockchain event data
const blockchainEvents = [
  {
    id: "evt_1234567890",
    type: "payment_confirmed",
    paymentId: "pi_1234567890",
    blockHeight: 123456,
    txHash: "0x1234567890abcdef1234567890abcdef12345678",
    timestamp: "2024-01-15T10:45:23Z",
    status: "success",
    gasUsed: 21000,
    confirmations: 6,
    details: "Payment successfully confirmed on Stacks blockchain",
  },
  {
    id: "evt_0987654321",
    type: "payment_initiated",
    paymentId: "pi_0987654321",
    blockHeight: 123457,
    txHash: "0xabcdef1234567890abcdef1234567890abcdef12",
    timestamp: "2024-01-15T10:30:15Z",
    status: "pending",
    gasUsed: 0,
    confirmations: 0,
    details: "Payment transaction broadcasted to mempool",
  },
  {
    id: "evt_1122334455",
    type: "payment_failed",
    paymentId: "pi_1122334455",
    blockHeight: null,
    txHash: null,
    timestamp: "2024-01-15T10:15:45Z",
    status: "failed",
    gasUsed: 0,
    confirmations: 0,
    details: "Transaction failed: Insufficient funds",
  },
  {
    id: "evt_5566778899",
    type: "contract_call",
    paymentId: "pi_5566778899",
    blockHeight: 123455,
    txHash: "0x5566778899aabbcc5566778899aabbcc55667788",
    timestamp: "2024-01-15T09:45:12Z",
    status: "success",
    gasUsed: 45000,
    confirmations: 8,
    details: "Smart contract function executed successfully",
  },
  {
    id: "evt_9988776655",
    type: "webhook_delivered",
    paymentId: "pi_9988776655",
    blockHeight: null,
    txHash: null,
    timestamp: "2024-01-15T09:30:33Z",
    status: "success",
    gasUsed: 0,
    confirmations: 0,
    details: "Webhook successfully delivered to merchant endpoint",
  },
]

export default function EventLogsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [eventTypeFilter, setEventTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const getEventIcon = (type: string) => {
    switch (type) {
      case "payment_confirmed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "payment_initiated":
        return <Clock className="h-4 w-4 text-blue-600" />
      case "payment_failed":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case "contract_call":
        return <Activity className="h-4 w-4 text-purple-600" />
      case "webhook_delivered":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Success</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Failed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getEventTypeBadge = (type: string) => {
    const typeMap = {
      payment_confirmed: { label: "Payment Confirmed", color: "bg-green-100 text-green-800 hover:bg-green-100" },
      payment_initiated: { label: "Payment Initiated", color: "bg-blue-100 text-blue-800 hover:bg-blue-100" },
      payment_failed: { label: "Payment Failed", color: "bg-red-100 text-red-800 hover:bg-red-100" },
      contract_call: { label: "Contract Call", color: "bg-purple-100 text-purple-800 hover:bg-purple-100" },
      webhook_delivered: { label: "Webhook Delivered", color: "bg-orange-100 text-orange-800 hover:bg-orange-100" },
    }

    const eventType = typeMap[type as keyof typeof typeMap] || {
      label: type,
      color: "bg-gray-100 text-gray-800 hover:bg-gray-100",
    }
    return <Badge className={eventType.color}>{eventType.label}</Badge>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const truncateHash = (hash: string | null) => {
    if (!hash) return "N/A"
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`
  }

  const filteredEvents = blockchainEvents.filter((event) => {
    const matchesSearch =
      event.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.paymentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.txHash && event.txHash.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesType = eventTypeFilter === "all" || event.type === eventTypeFilter
    const matchesStatus = statusFilter === "all" || event.status === statusFilter

    return matchesSearch && matchesType && matchesStatus
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Event Logs</h1>
            <p className="text-muted-foreground">Monitor blockchain transactions and system events in real-time</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export Logs
            </Button>
            <Button variant="outline" size="sm">
              Auto Refresh
            </Button>
          </div>
        </div>

        {/* Event Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Events</p>
                  <p className="text-2xl font-bold">{blockchainEvents.length}</p>
                  <p className="text-sm text-green-600">Last 24 hours</p>
                </div>
                <Activity className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Successful Events</p>
                  <p className="text-2xl font-bold">{blockchainEvents.filter((e) => e.status === "success").length}</p>
                  <p className="text-sm text-green-600">80% success rate</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Events</p>
                  <p className="text-2xl font-bold">{blockchainEvents.filter((e) => e.status === "pending").length}</p>
                  <p className="text-sm text-yellow-600">Awaiting confirmation</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Failed Events</p>
                  <p className="text-2xl font-bold">{blockchainEvents.filter((e) => e.status === "failed").length}</p>
                  <p className="text-sm text-red-600">Requires attention</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Event Logs Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Events</CardTitle>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Event Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="payment_confirmed">Payment Confirmed</SelectItem>
                    <SelectItem value="payment_initiated">Payment Initiated</SelectItem>
                    <SelectItem value="payment_failed">Payment Failed</SelectItem>
                    <SelectItem value="contract_call">Contract Call</SelectItem>
                    <SelectItem value="webhook_delivered">Webhook Delivered</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Payment ID</TableHead>
                  <TableHead>Transaction Hash</TableHead>
                  <TableHead>Block Height</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getEventIcon(event.type)}
                        <span className="font-mono text-sm">{event.id}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getEventTypeBadge(event.type)}</TableCell>
                    <TableCell className="font-mono text-sm">{event.paymentId}</TableCell>
                    <TableCell>
                      {event.txHash ? (
                        <div className="flex items-center space-x-1">
                          <span className="font-mono text-sm">{truncateHash(event.txHash)}</span>
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {event.blockHeight ? (
                        <span className="font-mono">{event.blockHeight.toLocaleString()}</span>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(event.status)}</TableCell>
                    <TableCell>{formatDate(event.timestamp)}</TableCell>
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
      </div>
    </DashboardLayout>
  )
}
