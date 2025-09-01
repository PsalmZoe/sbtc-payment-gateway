# sBTC Payment Gateway

**The Stripe for Bitcoin** - Accept Bitcoin payments seamlessly with sBTC on the Stacks blockchain.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/sbtc-gateway/sbtc-payment-gateway)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Stacks](https://img.shields.io/badge/Built%20on-Stacks-5546FF)](https://stacks.co)

## 🚀 Quick Start

Get your sBTC payment gateway running in under 5 minutes:

\`\`\`bash
# Clone and install
git clone https://github.com/your-username/sbtc-payment-gateway.git
cd sbtc-payment-gateway
npm install

# Set up environment
cp .env.example .env.local
# Add your database URL and API keys

# Run migrations and start
node scripts/run-migrations.js
npm run dev
\`\`\`

Visit `http://localhost:3000` to see your payment gateway in action.

## ✨ What is sBTC Gateway?

sBTC Gateway is a comprehensive payment infrastructure that enables businesses to accept Bitcoin payments through sBTC (Stacks Bitcoin) with the same ease as traditional payment processors. Built on the Stacks blockchain, it provides:

- **Instant Bitcoin Payments** - Accept real Bitcoin with fast settlement
- **Developer-Friendly APIs** - Stripe-like integration experience
- **Smart Contract Security** - Non-custodial, trustless transactions
- **Real-Time Webhooks** - Get notified of payment events instantly
- **Subscription Billing** - Recurring payments and subscription management
- **Comprehensive Dashboard** - Analytics, reporting, and payment management

## 🎯 Key Features

### 💳 Payment Processing
- **One-time Payments** - Accept Bitcoin for products and services
- **Recurring Billing** - Subscription and installment plans
- **Multi-currency Support** - sBTC with automatic conversion rates
- **Payment Links** - No-code payment collection
- **Checkout Components** - Pre-built UI for seamless integration

### 🔧 Developer Experience
- **RESTful APIs** - Clean, predictable endpoints
- **JavaScript SDK** - Easy integration for web applications
- **Webhook System** - Real-time event notifications
- **Comprehensive Docs** - Detailed guides and examples
- **Testnet Support** - Full testing environment

### 📊 Business Intelligence
- **Real-time Analytics** - Revenue, conversion, and customer metrics
- **Payment Insights** - Transaction patterns and success rates
- **Customer Management** - Payment history and customer profiles
- **Reporting Tools** - Export data for accounting and analysis
- **Fraud Detection** - Built-in security and risk management

### 🛡️ Security & Compliance
- **Non-custodial** - Funds go directly to your wallet
- **Smart Contract Verified** - All contracts audited and verified
- **API Key Management** - Secure authentication system
- **Webhook Signatures** - Cryptographic verification
- **Rate Limiting** - DDoS protection and abuse prevention

## 📁 Project Structure

\`\`\`
sbtc-payment-gateway/
├── app/                          # Next.js app directory
│   ├── api/v1/                  # REST API endpoints
│   │   ├── payment_intents/     # Payment creation & retrieval
│   │   ├── webhooks/            # Webhook management
│   │   ├── subscriptions/       # Recurring billing
│   │   └── sdk/                 # SDK delivery
│   ├── dashboard/               # Merchant dashboard
│   │   ├── analytics/           # Revenue & conversion metrics
│   │   └── settings/            # API keys & configuration
│   ├── docs/                    # Documentation system
│   │   ├── getting-started/     # 5-minute setup guide
│   │   ├── authentication/      # API security
│   │   └── webhooks/            # Event handling
│   └── examples/                # Code examples & demos
├── components/                   # React components
│   ├── ui/                      # shadcn/ui components
│   ├── dashboard/               # Dashboard-specific components
│   └── checkout-form.tsx        # Payment flow component
├── contracts/                    # Clarity smart contracts
│   └── payment-gateway.clar     # Main payment contract
├── lib/                         # Utility libraries
│   ├── sdk/                     # JavaScript SDK
│   ├── auth.ts                  # Authentication helpers
│   ├── subscription-service.ts  # Recurring billing logic
│   └── types.ts                 # TypeScript definitions
├── scripts/                     # Database & deployment scripts
│   ├── 001-initial-schema.sql   # Database setup
│   ├── 002-subscription-schema.sql
│   └── run-migrations.js        # Migration runner
└── docs/                        # Additional documentation
    └── integration-guide.md     # Detailed setup guide
\`\`\`

## 🔧 Installation & Setup

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (Neon recommended)
- Stacks wallet for testnet (Leather or Xverse)

### Local Development

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/your-username/sbtc-payment-gateway.git
   cd sbtc-payment-gateway
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up environment variables**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`
   
   Configure your `.env.local`:
   \`\`\`bash
   # Database
   DATABASE_URL="postgresql://username:password@host/database"
   
   # Stacks Network
   NEXT_PUBLIC_STACKS_NETWORK="testnet"
   STACKS_PRIVATE_KEY="your-testnet-private-key"
   
   # sBTC Gateway
   SBTC_SECRET_KEY="your-secret-key"
   SBTC_WEBHOOK_SECRET="your-webhook-secret"
   
   # Application
   NEXT_PUBLIC_BASE_URL="http://localhost:3000"
   \`\`\`

4. **Run database migrations**
   \`\`\`bash
   node scripts/run-migrations.js
   \`\`\`

5. **Start development server**
   \`\`\`bash
   npm run dev
   \`\`\`

Visit `http://localhost:3000` to see the application.

### Testnet Deployment

1. **Deploy to Vercel**
   \`\`\`bash
   npm install -g vercel
   vercel login
   vercel
   \`\`\`

2. **Configure environment variables in Vercel dashboard**
   - Add all environment variables from `.env.local`
   - Update `NEXT_PUBLIC_BASE_URL` to your Vercel URL

3. **Get testnet resources**
   - STX tokens: [Stacks Testnet Faucet](https://explorer.stacks.co/sandbox/faucet)
   - Test Bitcoin: [Bitcoin Testnet Faucet](https://coinfaucet.eu/en/btc-testnet/)

4. **Deploy smart contract**
   \`\`\`bash
   # Using Clarinet (recommended)
   clarinet deploy --testnet
   
   # Or deploy manually via Stacks Explorer
   # Visit: https://explorer.stacks.co/sandbox/deploy
   \`\`\`

## 📊 Dashboard Features

### Analytics & Reporting
- **Revenue Tracking**: Real-time payment volume and trends
- **Conversion Metrics**: Success rates and abandonment analysis
- **Customer Analytics**: Payment patterns and customer insights
- **Payment Methods**: sBTC transaction analysis

### Payment Management
- **Payment Overview**: View all transactions by status
- **Refund Processing**: Handle refunds and disputes
- **Subscription Management**: Recurring billing oversight
- **Transaction Details**: Blockchain verification and receipts

### Developer Tools
- **API Key Management**: Generate and rotate keys
- **Webhook Configuration**: Set up event endpoints
- **Smart Contract Settings**: Configure blockchain parameters
- **Rate Limiting**: Monitor and adjust API usage

## 🔌 API Reference

### Payment Intents

Create and manage payment intents for one-time payments.

\`\`\`bash
# Create payment intent
POST /api/v1/payment_intents
Authorization: Bearer sk_test_...
Content-Type: application/json

{
  "amount": 50000,
  "currency": "sbtc",
  "description": "Premium Plan",
  "metadata": {
    "customer_id": "cus_123",
    "order_id": "ord_456"
  }
}
\`\`\`

### Subscriptions

Manage recurring billing and subscription plans.

\`\`\`bash
# Create subscription
POST /api/v1/subscriptions
Authorization: Bearer sk_test_...
Content-Type: application/json

{
  "customer": "cus_123",
  "price": "price_456",
  "payment_behavior": "default_incomplete"
}
\`\`\`

### Webhooks

Configure endpoints to receive real-time events.

\`\`\`bash
# Create webhook endpoint
POST /api/v1/webhooks
Authorization: Bearer sk_test_...
Content-Type: application/json

{
  "url": "https://your-site.com/webhooks/sbtc",
  "events": ["payment_intent.succeeded", "payment_intent.failed"]
}
\`\`\`

## 🔔 Webhook Events

Handle real-time payment events in your application:

\`\`\`javascript
// Webhook handler example
app.post('/webhooks/sbtc', (req, res) => {
  const signature = req.headers['sbtc-signature']
  const payload = req.body
  
  // Verify webhook signature
  const isValid = verifyWebhookSignature(payload, signature, webhookSecret)
  
  if (!isValid) {
    return res.status(400).send('Invalid signature')
  }
  
  // Handle events
  switch (payload.type) {
    case 'payment_intent.succeeded':
      console.log('Payment succeeded:', payload.data)
      break
    case 'payment_intent.failed':
      console.log('Payment failed:', payload.data)
      break
  }
  
  res.status(200).send('OK')
})
\`\`\`

### Available Events

- `payment_intent.created`
- `payment_intent.succeeded`
- `payment_intent.failed`
- `payment_intent.canceled`
- `subscription.created`
- `subscription.updated`
- `subscription.canceled`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

## 🛡️ Security

### API Authentication
- **API Keys**: Separate publishable and secret keys
- **Rate Limiting**: Configurable limits per endpoint
- **Webhook Signatures**: HMAC-SHA256 verification
- **HTTPS Only**: All API calls require SSL

### Smart Contract Security
- **Non-custodial**: Funds transfer directly to merchants
- **Clarity Verification**: All contracts verified on-chain
- **Input Validation**: Comprehensive parameter checking
- **Access Control**: Role-based permissions

## 🧪 Testing

### Unit Tests
\`\`\`bash
npm run test
\`\`\`

### Integration Tests
\`\`\`bash
npm run test:integration
\`\`\`

### Smart Contract Tests
\`\`\`bash
clarinet test
\`\`\`

### Testnet Testing
1. Use testnet STX and Bitcoin from faucets
2. Test complete payment flows
3. Verify webhook delivery
4. Check blockchain confirmations

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### Code Standards
- TypeScript for type safety
- ESLint + Prettier for formatting
- Conventional commits
- 100% test coverage for critical paths

## 📚 Documentation

- **[Getting Started](./app/docs/getting-started)** - 5-minute setup guide
- **[API Reference](./app/docs/api)** - Complete endpoint documentation
- **[SDK Guide](./app/docs/sdk)** - JavaScript/TypeScript SDK
- **[Smart Contracts](./app/docs/contracts)** - Clarity contract reference
- **[Webhooks](./app/docs/webhooks)** - Event handling guide
- **[Examples](./app/examples)** - Code samples and demos

## 🌐 Community

- **Discord**: [Join our community](https://discord.gg/sbtcgateway)
- **Twitter**: [@sbtcgateway](https://twitter.com/sbtcgateway)
- **GitHub**: [Star the repo](https://github.com/sbtc-gateway/sbtc-payment-gateway)
- **Support**: [Get help](https://github.com/sbtc-gateway/sbtc-payment-gateway/issues)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Stacks Foundation** for the blockchain infrastructure
- **Hiro** for development tools and APIs
- **shadcn/ui** for the component library
- **Vercel** for hosting and deployment
- **Community contributors** for feedback and improvements

---

**Ready to accept Bitcoin payments?** [Get started now](https://gateway.sbtc.dev/register) or [view live examples](https://gateway.sbtc.dev/examples).
