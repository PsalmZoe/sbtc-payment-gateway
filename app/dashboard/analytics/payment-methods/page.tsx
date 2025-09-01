"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Wallet, TrendingUp, Clock, CheckCircle } from "lucide-react"
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

// Mock payment method data
const paymentMethodData = [
  {
    method: "Leather Wallet",
    volume: 0.0085,
    percentage: 45.2,
    transactions: 156,
    avgTime: "2.1 min",
    color: "#3b82f6",
  },
  {
    method: "Xverse Wallet",
    volume: 0.0062,
    percentage: 33.1,
    transactions: 114,
    avgTime: "1.8 min",
    color: "#8b5cf6",
  },
  { method: "Hiro Wallet", volume: 0.0028, percentage: 14.9, transactions: 51, avgTime: "2.4 min", color: "#10b981" },
  { method: "Other Wallets", volume: 0.0013, percentage: 6.8, transactions: 23, avgTime: "3.2 min", color: "#f59e0b" },
]

const timeSeriesData = [
  { date: "Jan 1", Leather: 12, Xverse: 8, Hiro: 3, Other: 2 },
  { date: "Jan 2", Leather: 18, Xverse: 12, Hiro: 5, Other: 3 },
  { date: "Jan 3", Leather: 15, Xverse: 10, Hiro: 4, Other: 1 },
  { date: "Jan 4", Leather: 22, Xverse: 16, Hiro: 7, Other: 4 },
  { date: "Jan 5", Leather: 19, Xverse: 14, Hiro: 6, Other: 2 },
  { date: "Jan 6", Leather: 25, Xverse: 18, Hiro: 8, Other: 5 },
  { date: "Jan 7", Leather: 28, Xverse: 20, Hiro: 9, Other: 3 },
]

const successRateData = [
  { method: "Leather Wallet", successRate: 98.7, failureRate: 1.3 },
  { method: "Xverse Wallet", successRate: 97.4, failureRate: 2.6 },
  { method: "Hiro Wallet", successRate: 96.1, failureRate: 3.9 },
  { method: "Other Wallets", successRate: 94.2, failureRate: 5.8 },
]

export default function PaymentMethodInsightsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Payment Method Insights</h1>
            <p className="text-muted-foreground">Analyze wallet usage patterns and performance metrics</p>
          </div>
          <div className="flex items-center space-x-2">
            <Select defaultValue="30d">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              Export Report
            </Button>
          </div>
        </div>

        {/* Payment Method Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Most Popular Wallet</p>
                  <p className="text-2xl font-bold">Leather</p>
                  <p className="text-sm text-green-600">45.2% of payments</p>
                </div>
                <Wallet className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Fastest Wallet</p>
                  <p className="text-2xl font-bold">Xverse</p>
                  <p className="text-sm text-green-600">1.8 min avg</p>
                </div>
                <Clock className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Highest Success Rate</p>
                  <p className="text-2xl font-bold">Leather</p>
                  <p className="text-sm text-green-600">98.7% success</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Growing Fastest</p>
                  <p className="text-2xl font-bold">Hiro</p>
                  <p className="text-sm text-green-600">+23.4% growth</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Method Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Volume by Wallet</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={paymentMethodData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="percentage"
                    label={({ method, percentage }) => `${method}: ${percentage}%`}
                  >
                    {paymentMethodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Wallet Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {paymentMethodData.map((wallet) => (
                  <div key={wallet.method} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: wallet.color }}></div>
                        <span className="font-medium">{wallet.method}</span>
                      </div>
                      <Badge variant="outline">{wallet.transactions} txns</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Volume</p>
                        <p className="font-mono">{wallet.volume} sBTC</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Share</p>
                        <p className="font-medium">{wallet.percentage}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Avg Time</p>
                        <p className="font-medium">{wallet.avgTime}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Usage Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Usage by Wallet Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Leather" stackId="a" fill="#3b82f6" />
                <Bar dataKey="Xverse" stackId="a" fill="#8b5cf6" />
                <Bar dataKey="Hiro" stackId="a" fill="#10b981" />
                <Bar dataKey="Other" stackId="a" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Success Rate Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Success Rate by Wallet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {successRateData.map((wallet) => (
                <div key={wallet.method} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{wallet.method}</span>
                    <span className="text-sm font-medium">{wallet.successRate}% success</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: `${wallet.successRate}%` }}></div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{wallet.successRate}% successful</span>
                    <span>{wallet.failureRate}% failed</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
