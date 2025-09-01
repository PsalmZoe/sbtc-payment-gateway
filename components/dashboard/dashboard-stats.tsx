"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp, TrendingDown, DollarSign, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { PriceDisplay } from "@/components/price-display"
import type { JSX } from "react/jsx-runtime"

interface Stat {
  title: string
  value: string
  change: string
  trend: "up" | "down"
  icon: any
  description: string | JSX.Element
}

export function DashboardStats() {
  const [stats, setStats] = useState<Stat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/v1/analytics/dashboard-stats")
        if (!response.ok) throw new Error("Failed to fetch dashboard stats")
        const data = await response.json()

        const mappedStats = [
          {
            title: "Total Revenue",
            value: data.totalRevenue || "0.00000000 sBTC",
            change: data.revenueChange || "0%",
            trend: data.revenueTrend || "up",
            icon: DollarSign,
            description: data.totalRevenueSats ? (
              <PriceDisplay sats={data.totalRevenueSats} showBoth={false} />
            ) : (
              "≈ $0 USD"
            ),
          },
          {
            title: "Successful Payments",
            value: data.successfulPayments || "0",
            change: data.successfulChange || "0%",
            trend: data.successfulTrend || "up",
            icon: CheckCircle,
            description: "This month",
          },
          {
            title: "Pending Payments",
            value: data.pendingPayments || "0",
            change: data.pendingChange || "0%",
            trend: data.pendingTrend || "down",
            icon: Clock,
            description: "Awaiting confirmation",
          },
          {
            title: "Failed Payments",
            value: data.failedPayments || "0",
            change: data.failedChange || "0%",
            trend: data.failedTrend || "up",
            icon: AlertCircle,
            description: "Last 30 days",
          },
        ]
        setStats(mappedStats)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load stats")
        setStats([
          {
            title: "Total Revenue",
            value: "0.00000000 sBTC",
            change: "0%",
            trend: "up",
            icon: DollarSign,
            description: "≈ $0 USD",
          },
          {
            title: "Successful Payments",
            value: "0",
            change: "0%",
            trend: "up",
            icon: CheckCircle,
            description: "This month",
          },
          {
            title: "Pending Payments",
            value: "0",
            change: "0%",
            trend: "down",
            icon: Clock,
            description: "Awaiting confirmation",
          },
          {
            title: "Failed Payments",
            value: "0",
            change: "0%",
            trend: "up",
            icon: AlertCircle,
            description: "Last 30 days",
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-2" />
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-5 w-12" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        const TrendIcon = stat.trend === "up" ? TrendingUp : TrendingDown

        return (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{stat.description}</p>
                <Badge
                  variant={stat.trend === "up" ? "default" : "secondary"}
                  className={`text-xs ${
                    stat.trend === "up"
                      ? "bg-green-100 text-green-700 hover:bg-green-100"
                      : "bg-red-100 text-red-700 hover:bg-red-100"
                  }`}
                >
                  <TrendIcon className="h-3 w-3 mr-1" />
                  {stat.change}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
