import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
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
              <span className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded-full">Beta</span>
            </div>
            <nav className="flex items-center space-x-4">
              <Link href="/docs" className="text-muted-foreground hover:text-primary">
                Docs
              </Link>
              <Link href="/examples" className="text-muted-foreground hover:text-primary">
                Examples
              </Link>
              <Link href="/register">
                <Button variant="outline">Sign Up</Button>
              </Link>
              <Link href="/dashboard">
                <Button>Dashboard</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold text-foreground mb-6">
            The Stripe for <span className="text-primary">sBTC</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Accept Bitcoin payments on Stacks with a developer-friendly API. Get started in minutes with our drop-in
            payment widgets and comprehensive SDK.
          </p>
          <div className="mb-6 p-4 bg-muted/50 rounded-lg max-w-lg mx-auto">
            <p className="text-sm text-muted-foreground">
              🚀 <strong>New to Stacks?</strong> No problem! Start accepting payments without a wallet. Connect later
              when you're ready.
            </p>
          </div>
          <div className="flex items-center justify-center space-x-4">
            <Link href="/register">
              <Button size="lg" className="px-8 py-3 text-lg">
                Get Started Free →
              </Button>
            </Link>
            <Link href="/examples">
              <Button variant="outline" size="lg" className="px-8 py-3 text-lg bg-transparent">
                View Examples
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">Built for Developers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="h-8 w-8 bg-yellow-500 rounded-lg flex items-center justify-center mb-2">
                  <span className="text-white font-bold">⚡</span>
                </div>
                <CardTitle>Lightning Fast Setup</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Add Bitcoin payments to your site in under 5 minutes. Just include our script and add a data
                  attribute.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="h-8 w-8 bg-green-500 rounded-lg flex items-center justify-center mb-2">
                  <span className="text-white font-bold">🛡</span>
                </div>
                <CardTitle>Secure & Non-Custodial</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Payments go directly from customer to merchant via smart contracts. We never hold your funds.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="h-8 w-8 bg-blue-500 rounded-lg flex items-center justify-center mb-2">
                  <span className="text-white font-bold">💻</span>
                </div>
                <CardTitle>Developer Experience</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  RESTful API, webhooks, comprehensive docs, and SDKs. Everything you need to build great payment
                  experiences.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testnet Transaction Showcase */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 text-foreground">Real sBTC Testnet Transactions</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Process actual sBTC transactions on Stacks testnet. Full blockchain integration with smart contract
            verification.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="bg-secondary">
              <CardHeader>
                <CardTitle className="text-lg">Testnet Ready</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Connect to Stacks testnet and process real sBTC transactions with full blockchain confirmation.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-secondary">
              <CardHeader>
                <CardTitle className="text-lg">Smart Contract Verified</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  All payments are verified through deployed Clarity smart contracts on the Stacks blockchain.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Code Example */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6 text-foreground">Simple Integration</h2>
              <p className="text-muted-foreground mb-6">
                Add Bitcoin payments with just two lines of code. Our JavaScript SDK handles everything from payment
                creation to completion.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <span className="h-5 w-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">
                    ✓
                  </span>
                  <span className="text-foreground">No complex setup required</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="h-5 w-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">
                    ✓
                  </span>
                  <span className="text-foreground">Automatic wallet detection</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="h-5 w-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">
                    ✓
                  </span>
                  <span className="text-foreground">Mobile-friendly checkout</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="h-5 w-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">
                    ✓
                  </span>
                  <span className="text-foreground">Real-time payment tracking</span>
                </div>
              </div>
            </div>
            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="p-6">
                <pre className="text-sm overflow-x-auto">
                  <code className="text-green-400 font-jetbrains-mono">{`<!-- Include the SDK -->
<script src="https://gateway.sbtc.dev/js/sbtc-gateway.js" 
        data-publishable-key="pk_test_..."></script>

<!-- Add payment button -->
<button data-sbtc-button 
        data-amount="50000" 
        data-description="Premium Plan">
    Pay with sBTC
</button>`}</code>
                </pre>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Community Engagement Section */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 text-foreground">Join Our Community</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connect with developers, get support, and stay updated on the latest features. Open source and
            community-driven.
          </p>
          <div className="flex items-center justify-center space-x-6">
            <a
              href="https://twitter.com/sbtcgateway"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <span>🐦</span>
              <span>Follow on Twitter</span>
            </a>
            <a
              href="https://discord.gg/sbtcgateway"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
            >
              <span>💬</span>
              <span>Join Discord</span>
            </a>
            <a
              href="https://github.com/sbtc-gateway/sbtc-payment-gateway"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
            >
              <span>⭐</span>
              <span>Star on GitHub</span>
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Accept Bitcoin?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join the future of payments with sBTC Gateway. Start accepting Bitcoin in minutes.
          </p>
          <Link href="/register">
            <Button variant="secondary" size="lg" className="px-8 py-3 text-lg">
              Start Building Now →
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4 bg-card">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 bg-primary rounded flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">₿</span>
              </div>
              <span className="font-semibold text-foreground">sBTC Gateway</span>
              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Open Source</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <Link href="/docs" className="hover:text-primary">
                Documentation
              </Link>
              <Link href="/examples" className="hover:text-primary">
                Examples
              </Link>
              <Link href="/support" className="hover:text-primary">
                Support
              </Link>
              <a href="https://github.com/sbtc-gateway/sbtc-payment-gateway" className="hover:text-primary">
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
