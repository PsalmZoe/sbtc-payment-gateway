"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { XCircle, RefreshCw, Eye, AlertTriangle } from "lucide-react"

// Mock failed payments
const failedPayments = [
  {
    id: "pi_1122334455",
    amount: 100000,
    customer: "bob@example.com",
    description: "Enterprise Plan",
    created: "2024-01-14T16:45:00Z",
    failed: "2024-01-14T17:00:00Z",
    error: "Insufficient funds in wallet",
    errorCode: "INSUFFICIENT_FUNDS",
    retryable: true,
  },
  {
    id: "pi_6677889900",
    amount: 15000,
    customer: "charlie@example.com",
    description: "Starter Plan",
    created: "2024-01-14T12:30:00Z",
    failed: "2024-01-14T13:15:00Z",
    error: "Transaction timeout",
    errorCode: "TIMEOUT",
    retryable: true,
  },
  {
    id: "pi_9988776655",
    amount: 200000,
    customer: "dave@example.com",
    description: "Custom Plan",
    created: "2024-01-13T09:15:00Z",
    failed: "2024-01-13T09:30:00Z",
    error: "Invalid wallet address",
    errorCode: "INVALID_ADDRESS",
    retryable: false,
  },
]

export default function FailedPaymentsPage() {
  const formatAmount = (amount: number) => {
    return `${(amount / 100000000).toFixed(8)} sBTC`
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

  const getErrorBadge = (errorCode: string) => {
    switch (errorCode) {
      case "INSUFFICIENT_FUNDS":
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Insufficient Funds</Badge>
      case "TIMEOUT":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Timeout</Badge>
      case "INVALID_ADDRESS":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Invalid Address</Badge>
      default:
        return <Badge variant="destructive">{errorCode}</Badge>
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Failed Payments</h1>
            <p className="text-muted-foreground">Payments that failed to process with error details</p>
          </div>
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry Failed
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-2xl font-bold">{failedPayments.length}</p>
                  <p className="text-sm text-muted-foreground">Failed Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">2</p>
                  <p className="text-sm text-muted-foreground">Retryable</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-2xl font-bold">1.5%</p>
                  <p className="text-sm text-muted-foreground">Failure Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-2xl font-bold">0.00315 sBTC</p>
                  <p className="text-sm text-muted-foreground">Failed Volume</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Failed Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Failed</TableHead>
                  <TableHead>Error</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {failedPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-mono text-sm">{payment.id}</TableCell>
                    <TableCell>{payment.customer}</TableCell>
                    <TableCell>{payment.description}</TableCell>
                    <TableCell className="font-mono">{formatAmount(payment.amount)}</TableCell>
                    <TableCell>{formatDate(payment.failed)}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {getErrorBadge(payment.errorCode)}
                        <p className="text-xs text-muted-foreground">{payment.error}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {payment.retryable && (
                          <Button variant="ghost" size="sm">
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        )}
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
