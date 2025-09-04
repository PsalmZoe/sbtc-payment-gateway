# sBTC Payment Gateway

A complete Bitcoin payment gateway built on the Stacks blockchain, enabling merchants to accept sBTC payments with a developer-friendly API similar to Stripe.

## Features

- 🔗 **Payment Link Generation** - Create shareable payment links for customers
- 💳 **Wallet Integration** - Support for Leather and Xverse wallets
- 📊 **Payment Dashboard** - Track payments, analytics, and revenue
- 🔐 **API Authentication** - Secure API key-based authentication
- 🪝 **Webhooks** - Real-time payment notifications
- 🧪 **Test Suite** - Comprehensive testing tools
- 📱 **Mobile Support** - QR codes for mobile wallet payments

## Quick Start

### 1. Database Setup

Run the database migration scripts:

\`\`\`bash
# Run these SQL scripts in order:
# 1. scripts/001-initial-schema.sql
# 2. scripts/002-add-stacks-address.sql
# 3. scripts/003-fix-test-merchant.sql
\`\`\`

### 2. Environment Configuration

Create `.env.local`:

\`\`\`env
DATABASE_URL=postgresql://localhost:5432/sbtc_gateway
STACKS_PRIVATE_KEY=your_stacks_private_key_here
CONTRACT_ADDRESS=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.payment-gateway
NEXT_PUBLIC_CONTRACT_ADDRESS=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.payment-gateway
NEXT_PUBLIC_BASE_URL=http://localhost:3000
\`\`\`

### 3. Test the System

1. Visit `/test-payment` to run the complete test suite
2. Go to `/dashboard/payments/create-link` to create a payment link
3. Test the checkout flow with a Stacks wallet

## API Usage

### Create Payment Intent

\`\`\`bash
curl -X POST http://localhost:3000/api/v1/payment_intents \
  -H "Authorization: Bearer sk_test_51234567890abcdef" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50000,
    "metadata": {
      "description": "Premium Plan"
    }
  }'
\`\`\`

### Response

\`\`\`json
{
  "id": "pi_1234567890",
  "amount": "50000",
  "status": "requires_payment",
  "clientSecret": "pi_1234_secret_5678",
  "checkoutUrl": "http://localhost:3000/checkout/pi_1234567890?client_secret=pi_1234_secret_5678"
}
\`\`\`

## Customer Payment Flow

1. **Receive Payment Link** - Customer gets link from merchant
2. **Open Checkout** - Link opens payment page with amount details
3. **Connect Wallet** - Customer connects Leather or Xverse wallet
4. **Confirm Payment** - Transaction is broadcast to Stacks testnet
5. **Payment Complete** - Status updates and merchant receives webhook

## Wallet Requirements

### For Customers
- **Leather Wallet**: https://leather.io
- **Xverse Wallet**: https://xverse.app
- **Testnet STX**: Get free tokens from [Stacks Faucet](https://explorer.stacks.co/sandbox/faucet?chain=testnet)

### For Merchants
- Database (PostgreSQL)
- Stacks private key for contract interactions
- Webhook endpoint (optional)

## Testing

### Automated Tests
Visit `/test-payment` to run the complete test suite which verifies:
- Database connection
- Payment intent creation
- Status updates
- Webhook delivery

### Manual Testing
1. Create payment link in dashboard
2. Open link in new tab/device
3. Connect Stacks wallet
4. Complete payment transaction
5. Verify payment appears in dashboard

## Architecture

- **Frontend**: Next.js with TypeScript
- **Database**: PostgreSQL with connection pooling
- **Blockchain**: Stacks testnet integration
- **Wallets**: Leather and Xverse support
- **Smart Contract**: Clarity contract for payment verification

## Development API Key

For testing, use: `sk_test_51234567890abcdef`

This key is pre-configured with a test merchant account.

## Support

- Check the test suite at `/test-payment` for diagnostics
- Verify wallet installation and testnet STX balance
- Ensure database is running and migrations are applied
- Check browser console for detailed error messages
