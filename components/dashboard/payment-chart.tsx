"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"

interface ChartData {
  date: string
  payments: number
  revenue: number
}

export function PaymentChart() {
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await fetch("/api/v1/analytics/payment-activity")
        if (!response.ok) throw new Error("Failed to fetch chart data")
        const data = await response.json()
        setChartData(data.chartData || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load chart data")
        setChartData([])
      } finally {
        setLoading(false)
      }
    }

    fetchChartData()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Payment Activity</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Monthly payment volume and revenue trends</p>
          </div>
          <Badge variant="outline" className="text-xs">
            Last 7 months
          </Badge>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error || chartData.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Payment Activity</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Monthly payment volume and revenue trends</p>
          </div>
          <Badge variant="outline" className="text-xs">
            Last 7 months
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            {error ? `Error: ${error}` : "No payment data available yet"}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Payment Activity</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Monthly payment volume and revenue trends</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs">
            Last 7 months
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" className="text-xs fill-muted-foreground" axisLine={false} tickLine={false} />
              <YAxis className="text-xs fill-muted-foreground" axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Bar dataKey="payments" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Payments" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
