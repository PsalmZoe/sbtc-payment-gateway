import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">₿</span>
              </div>
              <h1 className="text-2xl font-bold text-primary">sBTC Gateway</h1>
              <span className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded-full">Dashboard</span>
            </div>
            <nav className="flex items-center space-x-4">
              <Link href="/dashboard/payments" className="text-muted-foreground hover:text-primary">
                Payments
              </Link>
              <Link href="/dashboard/analytics" className="text-muted-foreground hover:text-primary">
                Analytics
              </Link>
              <Link href="/dashboard/settings" className="text-muted-foreground hover:text-primary">
                Settings
              </Link>
              <Link href="/test-payment" className="text-muted-foreground hover:text-primary">
                Test Suite
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/dashboard/payments/create-link">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="text-2xl mb-2">🔗</div>
                  <h3 className="font-semibold">Create Payment Link</h3>
                  <p className="text-sm text-muted-foreground">Generate a new payment link</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/dashboard/payments">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="text-2xl mb-2">💳</div>
                  <h3 className="font-semibold">View Payments</h3>
                  <p className="text-sm text-muted-foreground">See all payment history</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/test-payment">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="text-2xl mb-2">🧪</div>
                  <h3 className="font-semibold">Test Suite</h3>
                  <p className="text-sm text-muted-foreground">Test payment flow</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/dashboard/settings/api-keys">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="text-2xl mb-2">🔑</div>
                  <h3 className="font-semibold">API Keys</h3>
                  <p className="text-sm text-muted-foreground">Manage API keys</p>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold text-foreground">₿ 12.45</p>
                    <p className="text-xs text-green-600">+12.5% from last month</p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 text-xl">💰</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Payments</p>
                    <p className="text-2xl font-bold text-foreground">1,247</p>
                    <p className="text-xs text-green-600">+8.2% from last month</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 text-xl">📊</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                    <p className="text-2xl font-bold text-foreground">98.5%</p>
                    <p className="text-xs text-green-600">+0.3% from last month</p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 text-xl">✅</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Users</p>
                    <p className="text-2xl font-bold text-foreground">892</p>
                    <p className="text-xs text-green-600">+15.1% from last month</p>
                  </div>
                  <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 text-xl">👥</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Setup Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">For Merchants</h4>
                    <ol className="text-sm space-y-1 text-muted-foreground">
                      <li>1. Run the test suite to verify setup</li>
                      <li>2. Create your first payment link</li>
                      <li>3. Share the link with customers</li>
                      <li>4. Monitor payments in the dashboard</li>
                    </ol>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">For Customers</h4>
                    <ol className="text-sm space-y-1 text-muted-foreground">
                      <li>1. Install Leather or Xverse wallet</li>
                      <li>2. Get testnet sBTC</li>
                      <li>3. Click the payment link</li>
                      <li>4. Complete payment with your wallet</li>
                    </ol>
                  </div>
                </div>

                <div className="flex space-x-4 pt-4">
                  <Link href="/test-payment">
                    <Button>Run Test Suite</Button>
                  </Link>
                  <Link href="/dashboard/payments/create-link">
                    <Button variant="outline">Create Payment Link</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Charts and Analytics */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border">
                <CardHeader>
                  <CardTitle className="text-foreground">Payment Volume</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl mb-2">📈</div>
                      <p className="text-muted-foreground">Payment chart visualization</p>
                      <p className="text-sm text-muted-foreground">Real-time payment analytics</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border">
                <CardHeader>
                  <CardTitle className="text-foreground">Recent Payments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { id: "pi_1234", amount: "₿ 0.025", status: "succeeded", customer: "john@example.com" },
                      { id: "pi_1235", amount: "₿ 0.050", status: "succeeded", customer: "jane@example.com" },
                      { id: "pi_1236", amount: "₿ 0.015", status: "pending", customer: "bob@example.com" },
                      { id: "pi_1237", amount: "₿ 0.100", status: "succeeded", customer: "alice@example.com" },
                      { id: "pi_1238", amount: "₿ 0.075", status: "failed", customer: "charlie@example.com" },
                    ].map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`h-2 w-2 rounded-full ${
                              payment.status === "succeeded"
                                ? "bg-green-500"
                                : payment.status === "pending"
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                            }`}
                          />
                          <div>
                            <p className="font-medium text-foreground">{payment.id}</p>
                            <p className="text-sm text-muted-foreground">{payment.customer}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-foreground">{payment.amount}</p>
                          <p
                            className={`text-sm capitalize ${
                              payment.status === "succeeded"
                                ? "text-green-600"
                                : payment.status === "pending"
                                  ? "text-yellow-600"
                                  : "text-red-600"
                            }`}
                          >
                            {payment.status}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Quick Actions */}
            <div className="space-y-6">
              <Card className="border">
                <CardHeader>
                  <CardTitle className="text-foreground">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <button className="w-full p-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                    Create Payment Link
                  </button>
                  <button className="w-full p-3 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors">
                    View API Keys
                  </button>
                  <button className="w-full p-3 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors">
                    Test Webhook
                  </button>
                  <button className="w-full p-3 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors">
                    Download Reports
                  </button>
                </CardContent>
              </Card>

              <Card className="border">
                <CardHeader>
                  <CardTitle className="text-foreground">Integration Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">API Keys</span>
                      <span className="text-sm font-medium text-green-600">✅ Active</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Webhooks</span>
                      <span className="text-sm font-medium text-green-600">✅ Configured</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Smart Contract</span>
                      <span className="text-sm font-medium text-green-600">✅ Deployed</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border">
                <CardHeader>
                  <CardTitle className="text-foreground">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 bg-green-500 rounded-full" />
                      <span className="text-muted-foreground">Payment received from john@example.com</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 bg-blue-500 rounded-full" />
                      <span className="text-muted-foreground">New API key generated</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 bg-yellow-500 rounded-full" />
                      <span className="text-muted-foreground">Webhook endpoint updated</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
