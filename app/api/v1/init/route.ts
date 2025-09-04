import { NextResponse } from "next/server"
import { testDatabaseConnection, createTestMerchant } from "@/lib/database"

export async function GET() {
  try {
    console.log("[v0] Initializing database connection...")

    // Test database connection
    const dbConnected = await testDatabaseConnection()
    if (!dbConnected) {
      return NextResponse.json(
        {
          error: "Database connection failed",
          details: "Check DATABASE_URL environment variable",
        },
        { status: 500 },
      )
    }

    // Create test merchant if needed
    const testMerchant = await createTestMerchant()

    return NextResponse.json({
      status: "success",
      message: "Database initialized successfully",
      testMerchant: {
        id: testMerchant.id,
        email: testMerchant.email,
        apiKey: "sk_test_51234567890abcdef", // For development only
      },
    })
  } catch (error) {
    console.error("[v0] Database initialization error:", error)
    return NextResponse.json(
      {
        error: "Database initialization failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
