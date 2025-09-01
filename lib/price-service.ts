interface PriceData {
  btc_usd: number
  last_updated: number
  source: string
}

interface ConversionResult {
  sbtc_amount: number
  usd_amount: number
  rate: number
  last_updated: number
}

class PriceService {
  private cache: PriceData | null = null
  private cacheExpiry = 60000 // 1 minute cache
  private fallbackRate = 44000 // Fallback BTC/USD rate

  async getBTCUSDRate(): Promise<number> {
    try {
      // Check cache first
      if (this.cache && Date.now() - this.cache.last_updated < this.cacheExpiry) {
        return this.cache.btc_usd
      }

      // Try CoinGecko API (free tier)
      const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd", {
        headers: {
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(5000),
      })

      if (response.ok) {
        const data = await response.json()
        const rate = data.bitcoin?.usd

        if (rate && typeof rate === "number") {
          this.cache = {
            btc_usd: rate,
            last_updated: Date.now(),
            source: "coingecko",
          }
          return rate
        }
      }

      // Fallback to cached rate if available
      if (this.cache) {
        console.warn("[v0] Using cached BTC rate due to API failure")
        return this.cache.btc_usd
      }

      // Final fallback to hardcoded rate
      console.warn("[v0] Using fallback BTC rate due to API unavailability")
      return this.fallbackRate
    } catch (error) {
      console.error("[v0] Price service error:", error)

      // Return cached rate if available, otherwise fallback
      if (this.cache) {
        return this.cache.btc_usd
      }

      return this.fallbackRate
    }
  }

  async convertSBTCToUSD(sbtcAmount: number): Promise<ConversionResult> {
    const rate = await this.getBTCUSDRate()
    const usdAmount = sbtcAmount * rate

    return {
      sbtc_amount: sbtcAmount,
      usd_amount: usdAmount,
      rate,
      last_updated: this.cache?.last_updated || Date.now(),
    }
  }

  async convertSatsToUSD(sats: number): Promise<ConversionResult> {
    const sbtcAmount = sats / 100000000 // Convert satoshis to BTC
    return this.convertSBTCToUSD(sbtcAmount)
  }

  formatUSD(amount: number): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  formatSBTC(amount: number): string {
    return `${amount.toFixed(8)} sBTC`
  }
}

// Singleton instance
export const priceService = new PriceService()
