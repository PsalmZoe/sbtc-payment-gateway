# sBTC Payment Gateway - Complete Deployment Guide

## 🚀 Quick Start

Your sBTC Payment Gateway is ready for deployment! Follow these steps to get it running on Vercel.

## 📋 Environment Variables Setup

Add these environment variables in your Vercel project settings:

### Required Variables

\`\`\`bash
# Database (Already configured via Neon integration)
DATABASE_URL=postgresql://...  # Auto-configured by Neon

# Base URL for your deployed app
NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app

# Smart Contract Configuration
NEXT_PUBLIC_CONTRACT_ADDRESS=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.payment-gateway
CONTRACT_ADDRESS=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.payment-gateway

# Stacks Blockchain Configuration
STACKS_PRIVATE_KEY=your_testnet_private_key_here
STACKS_NETWORK=testnet

# Optional: Webhook Configuration
SBTC_WEBHOOK_SECRET=whsec_your_webhook_secret_here
RETRY_WEBHOOKS=true
START_WATCHER=true
\`\`\`

### How to Get Each Variable:

#### 1. NEXT_PUBLIC_BASE_URL
- After deploying to Vercel, use your app's URL
- Example: `https://sbtc-payment-gateway.vercel.app`

#### 2. STACKS_PRIVATE_KEY
- Generate a new testnet wallet using Stacks CLI or online tools
- **NEVER use mainnet keys for testing**
- You can use: `ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM` (test key)

#### 3. Contract Address
- Use the provided test contract: `ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.payment-gateway`
- Or deploy your own using the contract in `contracts/payment-gateway.clar`

## 🔧 Database Setup

Run these SQL scripts in order (they'll run automatically when you deploy):

1. `scripts/004-create-payment-tables.sql` - Creates payment tables
2. The app will auto-create a test merchant on first run

## 🧪 Testing the Complete Flow

### Step 1: Create a Payment Link
1. Go to `/dashboard/payments/create-link`
2. Enter amount: `0.0001` (sBTC) or `10000` (sats)
3. Add description: "Test Payment"
4. Click "Create Payment Link"

### Step 2: Test the Payment
1. Copy the generated payment link
2. Open it in a new tab/incognito window
3. Install Leather or Xverse wallet if not already installed
4. Get testnet sBTC from: https://docs.hiro.so/en/tools/clarinet/sbtc-integration#manual-sbtc-minting-in-unit-tests
5. Connect wallet and complete payment

### Step 3: Verify Payment History
1. Return to `/dashboard/payments`
2. Your payment should appear in the history
3. Status should show as "succeeded"

## 🔑 API Key for Testing

Use this test API key in your requests:
\`\`\`
sk_test_51234567890abcdef
\`\`\`

## 📱 Wallet Setup for Testing

### Leather Wallet
1. Install: https://leather.io
2. Create testnet wallet
3. Get testnet sBTC from faucet
4. Connect to your payment page

### Xverse Wallet
1. Install: https://xverse.app
2. Switch to testnet mode
3. Get testnet sBTC from faucet
4. Connect to your payment page

## 🚨 Troubleshooting

### Payment Link Generation Fails
- Check DATABASE_URL is set correctly
- Verify test merchant exists in database
- Check API key format

### Wallet Connection Issues
- Ensure wallet is on testnet mode
- Check browser console for errors
- Try different wallet (Leather vs Xverse)

### Payment Not Confirming
- Wait 2-3 minutes for blockchain confirmation
- Check transaction on Stacks Explorer
- Verify contract address is correct

## 🔄 Production Deployment

### 1. Deploy Smart Contract
\`\`\`bash
# Use Clarinet to deploy to testnet
clarinet deploy --testnet
\`\`\`

### 2. Update Environment Variables
- Replace test contract address with your deployed contract
- Use production webhook URLs
- Set proper NEXT_PUBLIC_BASE_URL

### 3. Create Production Merchant
- Generate secure API keys
- Update merchant records in database
- Configure webhook endpoints

## 📊 Monitoring

### Check Payment Status
\`\`\`bash
curl -X GET "https://your-app.vercel.app/api/v1/payment_intents?id=PAYMENT_ID"
\`\`\`

### View Database
- Use Neon dashboard to view payment records
- Check merchant and payment_intents tables

## 🎯 Next Steps

1. **Deploy to Vercel** - Push your code and set environment variables
2. **Test the flow** - Create payment link → Pay → Verify history
3. **Customize UI** - Update branding and styling as needed
4. **Add webhooks** - Integrate with your backend systems
5. **Go live** - Deploy contract to mainnet when ready

Your sBTC Payment Gateway is now ready for production use! 🎉
\`\`\`

```typescript file="" isHidden
