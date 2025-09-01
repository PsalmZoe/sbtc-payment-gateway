"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, UserPlus, Repeat, DollarSign, TrendingUp, MapPin } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

// Mock customer data
const customerMetrics = [
  { date: "Jan 1", newCustomers: 8, returningCustomers: 4, totalSpend: 52.8 },
  { date: "Jan 2", newCustomers: 12, returningCustomers: 6, totalSpend: 79.2 },
  { date: "Jan 3", newCustomers: 10, returningCustomers: 5, totalSpend: 66.0 },
  { date: "Jan 4", newCustomers: 15, returningCustomers: 7, totalSpend: 96.8 },
  { date: "Jan 5", newCustomers: 13, returningCustomers: 6, totalSpend: 83.6 },
  { date: "Jan 6", newCustomers: 18, returningCustomers: 7, totalSpend: 110.0 },
  { date: "Jan 7", newCustomers: 20, returningCustomers: 8, totalSpend: 123.2 },
]

const topCustomers = [
  { email: "john@example.com", totalSpent: 0.0025, payments: 8, lastPayment: "2024-01-15", status: "active" },
  { email: "sarah@example.com", totalSpent: 0.0018, payments: 5, lastPayment: "2024-01-14", status: "active" },
  { email: "mike@example.com", totalSpent: 0.0015, payments: 6, lastPayment: "2024-01-13", status: "active" },
  { email: "alice@example.com", totalSpent: 0.0012, payments: 4, lastPayment: "2024-01-12", status: "inactive" },
  { email: "bob@example.com", totalSpent: 0.001, payments: 3, lastPayment: "2024-01-10", status: "active" },
]

const geographicData = [
  { country: "United States", customers: 145, percentage: 42.3, color: "#3b82f6" },
  { country: "Canada", customers: 67, percentage: 19.5, color: "#8b5cf6" },
  { country: "United Kingdom", customers: 45, percentage: 13.1, color: "#10b981" },
  { country: "Germany", customers: 32, percentage: 9.3, color: "#f59e0b" },
  { country: "Others", customers: 54, percentage: 15.8, color: "#ef4444" },
]

const cohortData = [
  { cohort: "Jan 2024", month1: 100, month2: 85, month3: 72, month4: 65 },
  { cohort: "Dec 2023", month1: 100, month2: 82, month3: 69, month4: 58 },
  { cohort: "Nov 2023", month1: 100, month2: 78, month3: 64, month4: 52 },
]

export default function CustomerInsightsPage() {
  const formatAmount = (amount: number) => {
    return `${amount.toFixed(8)} sBTC`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Customer Insights</h1>
            <p className="text-muted-foreground">Understand your customer behavior and engagement patterns</p>
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
              Export Data
            </Button>
          </div>
        </div>

        {/* Customer Overview Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Customers</p>
                  <p className="text-2xl font-bold">343</p>
                  <div className="flex items-center space-x-1 mt-1">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">+12.3%</span>
                  </div>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">New Customers</p>
                  <p className="text-2xl font-bold">96</p>
                  <div className="flex items-center space-x-1 mt-1">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">+18.5%</span>
                  </div>
                </div>
                <UserPlus className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Returning Customers</p>
                  <p className="text-2xl font-bold">43</p>
                  <div className="flex items-center space-x-1 mt-1">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">+8.2%</span>
                  </div>
                </div>
                <Repeat className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Customer Value</p>
                  <p className="text-2xl font-bold">0.00055 sBTC</p>
                  <div className="flex items-center space-x-1 mt-1">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">+5.7%</span>
                  </div>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customer Acquisition Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Acquisition Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={customerMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="newCustomers" fill="#3b82f6" name="New Customers" />
                <Bar dataKey="returningCustomers" fill="#10b981" name="Returning Customers" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Customers and Geographic Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Customers by Value</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Payments</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topCustomers.map((customer, index) => (
                    <TableRow key={customer.email}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{customer.email}</p>
                          <p className="text-sm text-muted-foreground">Last: {formatDate(customer.lastPayment)}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">{formatAmount(customer.totalSpent)}</TableCell>
                      <TableCell>{customer.payments}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            customer.status === "active"
                              ? "bg-green-100 text-green-800 hover:bg-green-100"
                              : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                          }
                        >
                          {customer.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Geographic Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {geographicData.map((country) => (
                  <div key={country.country} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{country.country}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold">{country.customers}</span>
                        <span className="text-sm text-muted-foreground ml-2">({country.percentage}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${country.percentage}%`,
                          backgroundColor: country.color,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customer Retention Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Retention Cohort Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-5 gap-4 text-sm font-medium text-muted-foreground">
                <div>Cohort</div>
                <div>Month 1</div>
                <div>Month 2</div>
                <div>Month 3</div>
                <div>Month 4</div>
              </div>
              {cohortData.map((cohort) => (
                <div key={cohort.cohort} className="grid grid-cols-5 gap-4 text-sm">
                  <div className="font-medium">{cohort.cohort}</div>
                  <div className="flex items-center space-x-2">
                    <div className="w-12 bg-green-200 rounded h-6 flex items-center justify-center text-xs">
                      {cohort.month1}%
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-12 bg-green-200 rounded h-6 flex items-center justify-center text-xs"
                      style={{ opacity: cohort.month2 / 100 }}
                    >
                      {cohort.month2}%
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-12 bg-green-200 rounded h-6 flex items-center justify-center text-xs"
                      style={{ opacity: cohort.month3 / 100 }}
                    >
                      {cohort.month3}%
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-12 bg-green-200 rounded h-6 flex items-center justify-center text-xs"
                      style={{ opacity: cohort.month4 / 100 }}
                    >
                      {cohort.month4}%
                    </div>
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
