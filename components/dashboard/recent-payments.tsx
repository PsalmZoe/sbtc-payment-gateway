"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { MoreHorizontal, ExternalLink, Copy } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Payment {
  id: string
  amount: string
  status: string
  customer: string
  created: string
  txHash: string | null
}

export function RecentPayments() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRecentPayments = async () => {
      try {
        const response = await fetch("/api/v1/payments?limit=5&sort=created_desc")
        if (!response.ok) throw new Error("Failed to fetch recent payments")
        const data = await response.json()
        setPayments(data.payments || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load payments")
        setPayments([])
      } finally {
        setLoading(false)
      }
    }

    fetchRecentPayments()
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "succeeded":
      case "success":
      case "confirmed":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Confirmed</Badge>
      case "pending":
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Pending</Badge>
      case "failed":
      case "failure":
      case "error":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Failed</Badge>
      case "cancelled":
      case "canceled":
        return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">Cancelled</Badge>
      case "insufficient_funds":
        return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">Insufficient Funds</Badge>
      default:
        return (
          <Badge variant="secondary" className="capitalize">
            {status}
          </Badge>
        )
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // Could add toast notification here if available
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const openExplorerLink = (txHash: string) => {
    const explorerUrl = `https://explorer.stacks.co/txid/${txHash}?chain=testnet`
    window.open(explorerUrl, "_blank", "noopener,noreferrer")
  }

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Payments</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Latest payment transactions</p>
          </div>
          <Button variant="outline" size="sm">
            View All
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex items-center space-x-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Payments</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Latest payment transactions</p>
        </div>
        <Button variant="outline" size="sm">
          View All
        </Button>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-center py-8 text-muted-foreground">Error loading payments: {error}</div>
        ) : payments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No payments yet. Create your first payment to see activity here.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payment ID</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-mono text-sm">
                    <div className="flex items-center space-x-2">
                      <span>{payment.id.substring(0, 16)}...</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4"
                        onClick={() => copyToClipboard(payment.id)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">{payment.amount} sBTC</TableCell>
                  <TableCell>{getStatusBadge(payment.status)}</TableCell>
                  <TableCell className="text-muted-foreground">{payment.customer}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(payment.created)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        {payment.txHash && (
                          <DropdownMenuItem onClick={() => openExplorerLink(payment.txHash!)}>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View on Explorer
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => copyToClipboard(payment.id)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Payment ID
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
