# sBTC Gateway Integration Guide

## Quick Start (3 minutes)

### 1. Get Your API Keys
1. Sign up at [gateway.sbtc.dev](https://gateway.sbtc.dev)
2. Get your publishable key from the dashboard
3. Copy your secret key for server-side operations

### 2. Add the Payment Button

**HTML:**
\`\`\`html
<!-- Include the SDK -->
<script src="https://gateway.sbtc.dev/js/sbtc-gateway.js" 
        data-publishable-key="pk_test_your_key_here"></script>

<!-- Add payment button -->
<button data-sbtc-button 
        data-amount="50000" 
        data-description="Premium Plan">
    Pay with sBTC
</button>
\`\`\`

**That's it!** The button will automatically handle payments.

## Integration Methods

### Method 1: Auto-Mount Buttons (Easiest)

Include the SDK with your publishable key and add `data-sbtc-button` to any element:

\`\`\`html
<script src="https://gateway.sbtc.dev/js/sbtc-gateway.js" 
        data-publishable-key="pk_test_..."></script>

<button data-sbtc-button 
        data-amount="100000"
        data-description="Product Purchase"
        data-metadata='{"product_id": "123"}'>
    Buy Now - 0.001 sBTC
</button>
\`\`\`

### Method 2: Manual SDK Usage (More Control)

\`\`\`html
<script src="https://gateway.sbtc.dev/js/sbtc-gateway.js"></script>
<script>
const gateway = new SBTCGateway('pk_test_your_key');

async function createPayment() {
    const paymentIntent = await gateway.createPaymentIntent({
        amount: 50000, // 0.0005 sBTC in satoshis
        metadata: { product: 'Premium Plan' }
    });
    
    gateway.openCheckout(paymentIntent);
}
</script>
\`\`\`

### Method 3: Server-Side Integration (Node.js)

\`\`\`javascript
const { SBTCGateway } = require('@sbtc/gateway-sdk');

const gateway = new SBTCGateway('sk_test_your_secret_key');

// Create payment intent
const paymentIntent = await gateway.createPaymentIntent({
    amount: 50000,
    metadata: { customer_id: 'cust_123' }
});

// Send checkout URL to client
res.json({ checkoutUrl: paymentIntent.checkoutUrl });
\`\`\`

## Button Attributes

| Attribute | Required | Description | Example |
|-----------|----------|-------------|---------|
| `data-sbtc-button` | ✅ | Marks element as payment button | - |
| `data-amount` | ✅ | Amount in satoshis | `"50000"` |
| `data-description` | ❌ | Payment description | `"Premium Plan"` |
| `data-metadata` | ❌ | JSON metadata | `'{"id": "123"}'` |

## Event Handling

Listen for payment events:

\`\`\`javascript
document.addEventListener('sbtc-payment-success', function(event) {
    const paymentIntent = event.detail.paymentIntent;
    console.log('Payment successful!', paymentIntent);
    
    // Redirect user or show success message
    window.location.href = '/success';
});
\`\`\`

## Webhooks

Set up webhooks to handle payments server-side:

\`\`\`javascript
// Configure webhook endpoint
await gateway.configureWebhook('https://yoursite.com/webhooks');

// Handle webhook in your server
app.post('/webhooks', (req, res) => {
    const event = req.body;
    
    if (event.type === 'payment_intent.succeeded') {
        // Payment completed - fulfill order
        console.log('Payment succeeded:', event.data);
    }
    
    res.json({ received: true });
});
\`\`\`

## Testing

Use these test values:

- **Publishable Key:** `pk_test_1234567890abcdef`
- **Secret Key:** `sk_test_1234567890abcdef`
- **Test Amounts:** Any amount in satoshis (e.g., `50000` = 0.0005 sBTC)

## Production Checklist

- [ ] Replace test keys with live keys
- [ ] Set up webhook endpoint
- [ ] Test payment flow end-to-end
- [ ] Configure proper error handling
- [ ] Set up monitoring and alerts

## Support

- **Documentation:** [docs.gateway.sbtc.dev](https://docs.gateway.sbtc.dev)
- **Examples:** [github.com/sbtc-gateway/examples](https://github.com/sbtc-gateway/examples)
- **Support:** [support@gateway.sbtc.dev](mailto:support@gateway.sbtc.dev)

## Rate Limits

- **API Requests:** 1000/hour per API key
- **Payment Intents:** 100/minute per merchant
- **Webhooks:** 10 retries with exponential backoff

## Security

- Never expose secret keys in client-side code
- Always verify webhooks using provided signatures
- Use HTTPS for all webhook endpoints
- Validate payment amounts server-side
