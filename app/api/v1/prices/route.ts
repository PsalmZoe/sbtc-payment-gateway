import { type NextRequest, NextResponse } from "next/server"
import { priceService } from "@/lib/price-service"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const amount = searchParams.get("amount")
    const unit = searchParams.get("unit") || "sbtc" // 'sbtc' or 'sats'

    // Get current BTC/USD rate
    const rate = await priceService.getBTCUSDRate()

    // If amount is provided, convert it
    if (amount) {
      const numAmount = Number.parseFloat(amount)
      if (isNaN(numAmount)) {
        return NextResponse.json({ error: "Invalid amount parameter" }, { status: 400 })
      }

      let conversion
      if (unit === "sats") {
        conversion = await priceService.convertSatsToUSD(numAmount)
      } else {
        conversion = await priceService.convertSBTCToUSD(numAmount)
      }

      return NextResponse.json({
        conversion,
        rate: {
          btc_usd: rate,
          last_updated: conversion.last_updated,
        },
      })
    }

    // Return just the rate
    return NextResponse.json({
      rate: {
        btc_usd: rate,
        last_updated: Date.now(),
      },
    })
  } catch (error) {
    console.error("[v0] Price API error:", error)
    return NextResponse.json({ error: "Failed to fetch price data" }, { status: 500 })
  }
}
