"use client"

import { useState, useEffect } from "react"
import { priceService } from "@/lib/price-service"

interface PriceDisplayProps {
  sats?: number
  sbtc?: number
  showBoth?: boolean
  className?: string
}

export function PriceDisplay({ sats, sbtc, showBoth = true, className = "" }: PriceDisplayProps) {
  const [usdAmount, setUsdAmount] = useState<string>("...")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        let conversion
        if (sats) {
          conversion = await priceService.convertSatsToUSD(sats)
        } else if (sbtc) {
          conversion = await priceService.convertSBTCToUSD(sbtc)
        } else {
          return
        }

        setUsdAmount(priceService.formatUSD(conversion.usd_amount))
      } catch (error) {
        console.error("[v0] Price display error:", error)
        setUsdAmount("~$0.00")
      } finally {
        setLoading(false)
      }
    }

    fetchPrice()
  }, [sats, sbtc])

  if (loading) {
    return <span className={`text-muted-foreground ${className}`}>Loading...</span>
  }

  const sbtcDisplay = sats ? priceService.formatSBTC(sats / 100000000) : sbtc ? priceService.formatSBTC(sbtc) : ""

  if (showBoth && sbtcDisplay) {
    return (
      <div className={className}>
        <span className="font-mono">{sbtcDisplay}</span>
        <span className="text-muted-foreground ml-2">≈ {usdAmount}</span>
      </div>
    )
  }

  return <span className={`text-muted-foreground ${className}`}>≈ {usdAmount}</span>
}
