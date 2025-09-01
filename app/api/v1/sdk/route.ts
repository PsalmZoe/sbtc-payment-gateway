import { NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { join } from "path"

export async function GET() {
  try {
    const sdkPath = join(process.cwd(), "public", "js", "sbtc-gateway.js")
    const sdkContent = await readFile(sdkPath, "utf-8")

    return new NextResponse(sdkContent, {
      headers: {
        "Content-Type": "application/javascript",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
      },
    })
  } catch (error) {
    console.error("SDK distribution error:", error)
    return NextResponse.json({ error: "SDK not found" }, { status: 404 })
  }
}
