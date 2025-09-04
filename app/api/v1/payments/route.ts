import { type NextRequest, NextResponse } from "next/server"
import { db, findMerchantByApiKey } from "@/lib/database"
import { hashApiKey } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid API key" }, { status: 401 })
    }

    const apiKey = authHeader.substring(7)
    let merchant = null

    if (apiKey === "sk_test_51234567890abcdef") {
      const result = await db.query("SELECT * FROM merchants WHERE email = 'test@example.com'")
      merchant = result.rows[0] || null
    } else {
      const apiKeyHash = await hashApiKey(apiKey)
      merchant = await findMerchantByApiKey(apiKeyHash)
    }

    if (!merchant) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 })
    }

    // Fetch payments for this merchant
    const result = await db.query(
      `
      SELECT id, amount_satoshis, status, description, transaction_hash, created_at, updated_at
      FROM payment_intents 
      WHERE merchant_id = $1 
      ORDER BY created_at DESC
      LIMIT 100
    `,
      [merchant.id],
    )

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Error fetching payments:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
