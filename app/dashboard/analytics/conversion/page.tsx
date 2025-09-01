"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Target, Users, ShoppingCart, CheckCircle } from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

// Mock conversion data
const conversionData = [
  { date: "Jan 1", visitors: 120, checkouts: 45, completed: 38, rate: 31.7 },
  { date: "Jan 2", visitors: 150, checkouts: 58, completed: 52, rate: 34.7 },
  { date: "Jan 3", visitors: 135, checkouts: 52, completed: 44, rate: 32.6 },
  { date: "Jan 4", visitors: 180, checkouts: 72, completed: 65, rate: 36.1 },
  { date: "Jan 5", visitors: 165, checkouts: 63, completed: 55, rate: 33.3 },
  { date: "Jan 6", visitors: 200, checkouts: 85, completed: 78, rate: 39.0 },
  { date: "Jan 7", visitors: 190, checkouts: 82, completed: 74, rate: 38.9 },
]

const funnelData = [
  { name: "Page Views", value: 1240, color: "#3b82f6" },
  { name: "Checkout Started", value: 457, color: "#8b5cf6" },
  { name: "Payment Initiated", value: 406, color: "#10b981" },
  { name: "Payment Completed", value: 378, color: "#f59e0b" },
]

const deviceData = [
  { device: "Desktop", conversions: 245, rate: 42.3 },
  { device: "Mobile", rate: 28.7, conversions: 98 },
  { device: "Tablet", conversions: 35, rate: 31.2 },
]

export default function ConversionRatePage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Conversion Rate Analytics</h1>
            <p className="text-muted-foreground">Track payment conversion rates and optimize your checkout flow</p>
          </div>
          <div className="flex items-center space-x-2">
            <Select defaultValue="7d">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              Export Data
            </Button>
          </div>
        </div>

        {/* Key Conversion Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overall Conversion Rate</p>
                  <p className="text-2xl font-bold">35.2%</p>
                  <div className="flex items-center space-x-1 mt-1">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">+2.4%</span>
                  </div>
                </div>
                <Target className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Checkout Abandonment</p>
                  <p className="text-2xl font-bold">17.3%</p>
                  <div className="flex items-center space-x-1 mt-1">
                    <TrendingDown className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">-1.8%</span>
                  </div>
                </div>
                <ShoppingCart className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Time to Complete</p>
                  <p className="text-2xl font-bold">2.4 min</p>
                  <div className="flex items-center space-x-1 mt-1">
                    <TrendingDown className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">-0.3 min</span>
                  </div>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Unique Visitors</p>
                  <p className="text-2xl font-bold">1,240</p>
                  <div className="flex items-center space-x-1 mt-1">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">+8.7%</span>
                  </div>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Conversion Rate Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Conversion Rate Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={conversionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}%`, "Conversion Rate"]} />
                <Area type="monotone" dataKey="rate" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Funnel Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {funnelData.map((step, index) => {
                  const percentage = index === 0 ? 100 : (step.value / funnelData[0].value) * 100
                  const dropOff = index > 0 ? funnelData[index - 1].value - step.value : 0

                  return (
                    <div key={step.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{step.name}</span>
                        <div className="text-right">
                          <span className="font-bold">{step.value.toLocaleString()}</span>
                          <span className="text-sm text-muted-foreground ml-2">({percentage.toFixed(1)}%)</span>
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-3">
                        <div
                          className="h-3 rounded-full"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: step.color,
                          }}
                        ></div>
                      </div>
                      {dropOff > 0 && <p className="text-sm text-red-600">-{dropOff} users dropped off</p>}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Conversion by Device</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {deviceData.map((device) => (
                  <div key={device.device} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{device.device}</span>
                      <div className="text-right">
                        <span className="font-bold">{device.conversions}</span>
                        <span className="text-sm text-muted-foreground ml-2">({device.rate}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${(device.rate / 50) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Optimization Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>Optimization Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">High Impact</Badge>
                  <div>
                    <h4 className="font-medium">Optimize Mobile Experience</h4>
                    <p className="text-sm text-muted-foreground">
                      Mobile conversion rate is 13.6% lower than desktop. Consider simplifying the mobile checkout flow.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Medium Impact</Badge>
                  <div>
                    <h4 className="font-medium">Reduce Checkout Steps</h4>
                    <p className="text-sm text-muted-foreground">
                      17.3% of users abandon at checkout. Consider implementing a one-click payment option.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Low Impact</Badge>
                  <div>
                    <h4 className="font-medium">Add Trust Signals</h4>
                    <p className="text-sm text-muted-foreground">
                      Display security badges and customer testimonials to increase payment confidence.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Monitor</Badge>
                  <div>
                    <h4 className="font-medium">A/B Test Payment Flow</h4>
                    <p className="text-sm text-muted-foreground">
                      Test different checkout layouts to identify the highest converting design.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
