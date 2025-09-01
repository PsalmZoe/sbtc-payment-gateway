"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PriceDisplay } from "@/components/price-display"
import { Plus, Search, MoreHorizontal } from "lucide-react"

interface SubscriptionPlan {
  id: string
  name: string
  description?: string
  amount_sats: number
  interval_type: string
  interval_count: number
  trial_period_days: number
  active: boolean
  created_at: string
}

interface Subscription {
  id: string
  plan_id: string
  customer_email: string
  customer_name?: string
  status: string
  current_period_start: string
  current_period_end: string
  trial_end?: string
  cancel_at_period_end: boolean
  created_at: string
}

export default function SubscriptionsPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [plansRes, subscriptionsRes] = await Promise.all([
          fetch("/api/v1/subscription-plans"),
          fetch("/api/v1/subscriptions"),
        ])

        if (plansRes.ok) {
          const plansData = await plansRes.json()
          setPlans(plansData.plans || [])
        }

        if (subscriptionsRes.ok) {
          const subscriptionsData = await subscriptionsRes.json()
          setSubscriptions(subscriptionsData.subscriptions || [])
        }
      } catch (error) {
        console.error("[v0] Failed to fetch subscription data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "trialing":
        return "bg-blue-100 text-blue-800"
      case "paused":
        return "bg-yellow-100 text-yellow-800"
      case "canceled":
        return "bg-red-100 text-red-800"
      case "past_due":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatInterval = (type: string, count: number) => {
    const unit = count === 1 ? type : `${type}s`
    return count === 1 ? `Every ${unit}` : `Every ${count} ${unit}`
  }

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const matchesSearch =
      sub.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || sub.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-64 mb-2"></div>
            <div className="h-4 bg-muted rounded w-96"></div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Subscriptions</h1>
            <p className="text-muted-foreground">Manage recurring billing and subscription plans</p>
          </div>
          <Button className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Create Plan</span>
          </Button>
        </div>

        <Tabs defaultValue="subscriptions" className="space-y-6">
          <TabsList>
            <TabsTrigger value="subscriptions">Active Subscriptions</TabsTrigger>
            <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
          </TabsList>

          <TabsContent value="subscriptions" className="space-y-6">
            {/* Filters */}
            <div className="flex items-center space-x-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="trialing">Trialing</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                  <SelectItem value="past_due">Past Due</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Subscriptions List */}
            <div className="space-y-4">
              {filteredSubscriptions.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">No subscriptions found</p>
                  </CardContent>
                </Card>
              ) : (
                filteredSubscriptions.map((subscription) => (
                  <Card key={subscription.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="font-semibold">{subscription.customer_email}</h3>
                            <Badge className={getStatusColor(subscription.status)}>{subscription.status}</Badge>
                          </div>
                          {subscription.customer_name && (
                            <p className="text-sm text-muted-foreground">{subscription.customer_name}</p>
                          )}
                          <p className="text-sm text-muted-foreground">
                            Current period: {new Date(subscription.current_period_start).toLocaleDateString()} -{" "}
                            {new Date(subscription.current_period_end).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right space-y-1">
                          <p className="text-sm text-muted-foreground">Next billing</p>
                          <p className="font-medium">
                            {new Date(subscription.current_period_end).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="plans" className="space-y-6">
            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">No subscription plans created yet</p>
                    <Button className="mt-4">Create Your First Plan</Button>
                  </CardContent>
                </Card>
              ) : (
                plans.map((plan) => (
                  <Card key={plan.id} className="relative">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{plan.name}</CardTitle>
                        <Badge variant={plan.active ? "default" : "secondary"}>
                          {plan.active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      {plan.description && <p className="text-sm text-muted-foreground">{plan.description}</p>}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <PriceDisplay sats={plan.amount_sats} showBoth={true} className="text-2xl font-bold" />
                        <p className="text-sm text-muted-foreground">
                          {formatInterval(plan.interval_type, plan.interval_count)}
                        </p>
                      </div>

                      {plan.trial_period_days > 0 && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-800">{plan.trial_period_days} day free trial</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t">
                        <p className="text-sm text-muted-foreground">
                          Created {new Date(plan.created_at).toLocaleDateString()}
                        </p>
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
