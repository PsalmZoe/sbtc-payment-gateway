"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle, Download, Eye, ExternalLink } from "lucide-react"

// Mock succeeded payments
const succeededPayments = [
  {
    id: "pi_1234567890",
    amount: 50000,
    customer: "john@example.com",
    description: "Premium Plan",
    created: "2024-01-15T10:30:00Z",
    confirmed: "2024-01-15T10:45:00Z",
    txHash: "0x1234567890abcdef1234567890abcdef12345678",
    blockHeight: 123456,
  },
  {
    id: "pi_2233445566",
    amount: 30000,
    customer: "sarah@example.com",
    description: "Standard Plan",
    created: "2024-01-14T14:20:00Z",
    confirmed: "2024-01-14T14:35:00Z",
    txHash: "0xabcdef1234567890abcdef1234567890abcdef12",
    blockHeight: 123455,
  },
]

export default function SucceededPaymentsPage() {
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

  const truncateHash = (hash: string) => {
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Succeeded Payments</h1>
            <p className="text-muted-foreground">Successfully confirmed sBTC payments</p>
          </div>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{succeededPayments.length}</p>
                  <p className="text-sm text-muted-foreground">Succeeded Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">0.0008 sBTC</p>
                  <p className="text-sm text-muted-foreground">Total Volume Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">12 min</p>
                  <p className="text-sm text-muted-foreground">Avg. Confirmation Time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Confirmed Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Confirmed</TableHead>
                  <TableHead>Transaction Hash</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {succeededPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-mono text-sm">{payment.id}</TableCell>
                    <TableCell>{payment.customer}</TableCell>
                    <TableCell>{payment.description}</TableCell>
                    <TableCell className="font-mono">{formatAmount(payment.amount)}</TableCell>
                    <TableCell>{formatDate(payment.confirmed)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-sm">{truncateHash(payment.txHash)}</span>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
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
