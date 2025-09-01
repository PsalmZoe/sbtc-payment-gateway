"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Bell,
  Search,
  Settings,
  User,
  LogOut,
  CreditCard,
  ChevronDown,
  BarChart3,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  LinkIcon,
  RefreshCw,
  TrendingUp,
  Users,
  Activity,
  Key,
  Webhook,
  Code,
  Shield,
  Mail,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface UserProfile {
  name: string
  email: string
  notifications: number
}

export function DashboardHeader() {
  const [userProfile] = useState<UserProfile>({
    name: "John Merchant",
    email: "john@example.com",
    notifications: 3,
  })

  const pathname = usePathname()

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/")

  return (
    <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <CreditCard className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-primary">sBTC Gateway</h1>
            </Link>

            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/dashboard">
                <Button
                  variant="ghost"
                  className={cn(
                    "font-medium",
                    isActive("/dashboard") && pathname === "/dashboard"
                      ? "text-primary"
                      : "text-muted-foreground hover:text-primary",
                  )}
                >
                  Dashboard
                </Button>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "font-medium",
                      isActive("/dashboard/payments") ? "text-primary" : "text-muted-foreground hover:text-primary",
                    )}
                  >
                    Payments
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/payments" className="flex items-center">
                      <DollarSign className="mr-2 h-4 w-4" />
                      All Payments
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/payments/pending" className="flex items-center">
                      <Clock className="mr-2 h-4 w-4" />
                      Pending Payments
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/payments/succeeded" className="flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Succeeded Payments
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/payments/failed" className="flex items-center">
                      <XCircle className="mr-2 h-4 w-4" />
                      Failed Payments
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/payments/create-link" className="flex items-center">
                      <LinkIcon className="mr-2 h-4 w-4" />
                      Create Payment Link
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/payments/refunds" className="flex items-center">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Refunds & Disputes
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "font-medium",
                      isActive("/dashboard/analytics") ? "text-primary" : "text-muted-foreground hover:text-primary",
                    )}
                  >
                    Analytics
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/analytics" className="flex items-center">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Revenue Overview
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/analytics/conversion" className="flex items-center">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Conversion Rate
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/analytics/payment-methods" className="flex items-center">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Payment Method Insights
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/analytics/customers" className="flex items-center">
                      <Users className="mr-2 h-4 w-4" />
                      Customer Insights
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/analytics/events" className="flex items-center">
                      <Activity className="mr-2 h-4 w-4" />
                      Event Logs
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "font-medium",
                      isActive("/dashboard/settings") ? "text-primary" : "text-muted-foreground hover:text-primary",
                    )}
                  >
                    Settings
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Account Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings/api-keys" className="flex items-center">
                      <Key className="mr-2 h-4 w-4" />
                      API Keys
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings/webhooks" className="flex items-center">
                      <Webhook className="mr-2 h-4 w-4" />
                      Webhook Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings/smart-contract" className="flex items-center">
                      <Code className="mr-2 h-4 w-4" />
                      Smart Contract
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings/notifications" className="flex items-center">
                      <Mail className="mr-2 h-4 w-4" />
                      Notifications
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings/security" className="flex items-center">
                      <Shield className="mr-2 h-4 w-4" />
                      Security
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
          </div>

          {/* Search and Actions */}
          <div className="flex items-center space-x-4">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search payments..." className="pl-10 w-64 bg-background" />
            </div>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {userProfile && userProfile.notifications > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {userProfile.notifications}
                </Badge>
              )}
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div>
                    <p className="font-medium">{userProfile?.name}</p>
                    <p className="text-sm text-muted-foreground">{userProfile?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings/api-keys" className="flex items-center">
                    <CreditCard className="mr-2 h-4 w-4" />
                    API Keys
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
