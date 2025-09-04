import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { status, tx_hash, block_height } = await request.json()
    const intentId = params.id

    console.log("[v0] Updating payment intent status:", { intentId, status, tx_hash })

    if (!intentId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const result = await db.query(
      `
      UPDATE payment_intents 
      SET status = $2, tx_hash = $3, block_height = $4, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `,
      [intentId, status, tx_hash || null, block_height || null],
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Payment intent not found" }, { status: 404 })
    }

    const updatedIntent = result.rows[0]

    console.log("[v0] Payment intent status updated successfully")

    return NextResponse.json({
      id: updatedIntent.id,
      status: updatedIntent.status,
      tx_hash: updatedIntent.tx_hash,
      block_height: updatedIntent.block_height,
    })
  } catch (error) {
    console.error("[v0] Error updating payment intent status:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
