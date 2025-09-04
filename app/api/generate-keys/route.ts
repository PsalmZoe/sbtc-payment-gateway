import { NextResponse } from "next/server"
import crypto from "crypto"

export async function GET() {
  try {
    // Generate SBTC Secret Key (64 hex characters)
    const secretKey = "sk_test_" + crypto.randomBytes(32).toString("hex")

    // Generate Webhook Secret (64 hex characters)
    const webhookSecret = "whsec_" + crypto.randomBytes(32).toString("hex")

    // Generate Publishable Key (64 hex characters)
    const publishableKey = "pk_test_" + crypto.randomBytes(32).toString("hex")

    const keys = {
      SBTC_SECRET_KEY: secretKey,
      SBTC_WEBHOOK_SECRET: webhookSecret,
      NEXT_PUBLIC_SBTC_PUBLISHABLE_KEY: publishableKey,
    }

    return NextResponse.json({
      message: "Generated SBTC API Keys - Copy these to your Vercel Environment Variables",
      keys,
      instructions: [
        "1. Copy each key below",
        "2. Go to Vercel Dashboard → Your Project → Settings → Environment Variables",
        "3. Add each key as a new environment variable",
        "4. Redeploy your application",
        "5. Delete this API route for security",
      ],
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate keys" }, { status: 500 })
  }
}
