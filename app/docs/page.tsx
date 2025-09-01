"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  BookOpen,
  Code,
  Zap,
  Shield,
  Webhook,
  Key,
  HelpCircle,
  Search,
  ArrowRight,
  CreditCard,
  ExternalLink,
} from "lucide-react"

const docSections = [
  {
    title: "Getting Started",
    description: "Quick setup guide to start accepting sBTC payments",
    icon: Zap,
    href: "/docs/getting-started",
    time: "5 min read",
    color: "text-green-600",
  },
  {
    title: "API Reference",
    description: "Complete REST API documentation with examples",
    icon: Code,
    href: "/docs/api-reference",
    time: "15 min read",
    color: "text-blue-600",
  },
  {
    title: "SDK Documentation",
    description: "JavaScript/TypeScript SDK guide and examples",
    icon: BookOpen,
    href: "/docs/sdk",
    time: "10 min read",
    color: "text-purple-600",
  },
  {
    title: "Smart Contract Reference",
    description: "Clarity smart contract functions and integration",
    icon: Shield,
    href: "/docs/smart-contract",
    time: "12 min read",
    color: "text-orange-600",
  },
  {
    title: "Webhooks Guide",
    description: "Real-time event notifications and handling",
    icon: Webhook,
    href: "/docs/webhooks",
    time: "8 min read",
    color: "text-indigo-600",
  },
  {
    title: "Authentication",
    description: "API keys, security, and access control",
    icon: Key,
    href: "/docs/authentication",
    time: "6 min read",
    color: "text-red-600",
  },
  {
    title: "Troubleshooting",
    description: "Common issues and debugging guide",
    icon: HelpCircle,
    href: "/docs/troubleshooting",
    time: "10 min read",
    color: "text-yellow-600",
  },
]

const quickLinks = [
  { title: "Create Payment Intent", href: "/docs/api-reference#create-payment-intent" },
  { title: "Handle Webhooks", href: "/docs/webhooks#handling-events" },
  { title: "SDK Installation", href: "/docs/sdk#installation" },
  { title: "Error Codes", href: "/docs/troubleshooting#error-codes" },
]

export default function DocsHomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <CreditCard className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-primary">sBTC Gateway</h1>
              <Badge variant="outline">Docs</Badge>
            </Link>
            <nav className="flex items-center space-x-4">
              <Link href="/examples" className="text-muted-foreground hover:text-primary">
                Examples
              </Link>
              <Link href="/dashboard">
                <Button>Dashboard</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6">Developer Documentation</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Everything you need to integrate sBTC payments into your application. From quick start guides to advanced
            smart contract interactions.
          </p>

          {/* Search */}
          <div className="relative max-w-md mx-auto mb-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search documentation..." className="pl-10" />
          </div>

          <div className="flex items-center justify-center space-x-4">
            <Link href="/docs/getting-started">
              <Button size="lg">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/docs/api-reference">
              <Button variant="outline" size="lg">
                API Reference
              </Button>
            </Link>
          </div>
        </div>

        {/* Documentation Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {docSections.map((section) => {
            const IconComponent = section.icon
            return (
              <Link key={section.href} href={section.href}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center space-x-3 mb-2">
                      <IconComponent className={`h-6 w-6 ${section.color}`} />
                      <CardTitle className="text-lg">{section.title}</CardTitle>
                    </div>
                    <p className="text-sm text-muted-foreground">{section.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {section.time}
                      </Badge>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

        {/* Quick Links and Resources */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {quickLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <span className="font-medium">{link.title}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Additional Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link
                  href="/examples"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <div>
                    <p className="font-medium">Code Examples</p>
                    <p className="text-sm text-muted-foreground">Working code samples and demos</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>

                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
                  <div>
                    <p className="font-medium">GitHub Repository</p>
                    <p className="text-sm text-muted-foreground">Open source examples and tools</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
                  <div>
                    <p className="font-medium">Community Discord</p>
                    <p className="text-sm text-muted-foreground">Get help from developers</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </div>

                <Link
                  href="/docs/troubleshooting"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <div>
                    <p className="font-medium">Support Center</p>
                    <p className="text-sm text-muted-foreground">FAQs and troubleshooting</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
