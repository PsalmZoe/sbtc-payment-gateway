/**
 * sBTC Gateway JavaScript SDK
 * Version: 1.0.0
 *
 * A complete payment gateway SDK for processing sBTC payments
 * Supports both auto-mounting buttons and manual integration
 */

;((window) => {
  // SDK Configuration
  const DEFAULT_BASE_URL = "https://gateway.sbtc.dev"
  let globalPublishableKey = null

  /**
   * Main SBTCGateway class for payment processing
   */
  class SBTCGateway {
    constructor(publishableKey, options = {}) {
      if (!publishableKey) {
        throw new Error("SBTCGateway: publishableKey is required")
      }

      this.publishableKey = publishableKey
      this.baseUrl = options.baseUrl || DEFAULT_BASE_URL
      this.debug = options.debug || false
    }

    /**
     * Create a payment intent
     */
    async createPaymentIntent(params) {
      if (!params.amount) {
        throw new Error("Amount is required")
      }

      const response = await fetch(`${this.baseUrl}/api/v1/payment_intents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.publishableKey}`,
        },
        body: JSON.stringify({
          amount: params.amount,
          metadata: params.metadata || {},
        }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Unknown error" }))
        throw new Error(`Payment intent creation failed: ${error.error || response.statusText}`)
      }

      return response.json()
    }

    /**
     * Retrieve a payment intent
     */
    async retrievePaymentIntent(paymentIntentId) {
      const response = await fetch(`${this.baseUrl}/api/v1/payment_intents?id=${paymentIntentId}`, {
        headers: {
          Authorization: `Bearer ${this.publishableKey}`,
        },
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Unknown error" }))
        throw new Error(`Payment intent retrieval failed: ${error.error || response.statusText}`)
      }

      return response.json()
    }

    /**
     * Open checkout in a new window or redirect
     */
    openCheckout(paymentIntent, options = {}) {
      const checkoutUrl = paymentIntent.checkoutUrl

      if (options.redirect === true) {
        window.location.href = checkoutUrl
      } else {
        // Open in popup window
        const popup = window.open(checkoutUrl, "sbtc-checkout", "width=500,height=700,scrollbars=yes,resizable=yes")

        // Listen for payment completion
        const checkPaymentStatus = setInterval(async () => {
          try {
            const status = await this.retrievePaymentIntent(paymentIntent.id)
            if (status.status === "succeeded") {
              clearInterval(checkPaymentStatus)
              popup.close()
              this.emitEvent("payment-success", { paymentIntent: status })
            } else if (status.status === "failed") {
              clearInterval(checkPaymentStatus)
              popup.close()
              this.emitEvent("payment-failed", { paymentIntent: status })
            }
          } catch (error) {
            // Continue polling
          }
        }, 2000)

        // Stop polling if popup is closed manually
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkPaymentStatus)
            clearInterval(checkClosed)
            this.emitEvent("payment-cancelled", { paymentIntent })
          }
        }, 1000)
      }
    }

    /**
     * Configure webhook endpoint
     */
    async configureWebhook(webhookUrl) {
      const response = await fetch(`${this.baseUrl}/api/v1/webhooks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.publishableKey}`,
        },
        body: JSON.stringify({ webhook_url: webhookUrl }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Unknown error" }))
        throw new Error(`Webhook configuration failed: ${error.error || response.statusText}`)
      }

      return response.json()
    }

    /**
     * Emit custom events
     */
    emitEvent(eventName, detail) {
      const event = new CustomEvent(`sbtc-${eventName}`, { detail })
      document.dispatchEvent(event)

      if (this.debug) {
        console.log(`[sBTC Gateway] Event: ${eventName}`, detail)
      }
    }

    /**
     * Log debug messages
     */
    log(...args) {
      if (this.debug) {
        console.log("[sBTC Gateway]", ...args)
      }
    }
  }

  /**
   * Auto-mount functionality for data-sbtc-button elements
   */
  function initializeAutoMount() {
    if (!globalPublishableKey) {
      console.warn("[sBTC Gateway] No publishable key found. Auto-mount disabled.")
      return
    }

    const gateway = new SBTCGateway(globalPublishableKey)
    const buttons = document.querySelectorAll("[data-sbtc-button]")

    buttons.forEach((button) => {
      // Skip if already initialized
      if (button.hasAttribute("data-sbtc-initialized")) {
        return
      }

      const amount = button.getAttribute("data-amount")
      const description = button.getAttribute("data-description")
      const metadata = button.getAttribute("data-metadata")

      if (!amount) {
        console.error("[sBTC Gateway] Button missing required data-amount attribute", button)
        return
      }

      // Parse metadata if provided
      let parsedMetadata = {}
      if (metadata) {
        try {
          parsedMetadata = JSON.parse(metadata)
        } catch (error) {
          console.error("[sBTC Gateway] Invalid JSON in data-metadata", button)
        }
      }

      // Add description to metadata
      if (description) {
        parsedMetadata.description = description
      }

      // Add click handler
      button.addEventListener("click", async (event) => {
        event.preventDefault()

        // Add loading state
        const originalText = button.textContent
        button.textContent = "Creating payment..."
        button.disabled = true

        try {
          const paymentIntent = await gateway.createPaymentIntent({
            amount: Number.parseInt(amount),
            metadata: parsedMetadata,
          })

          gateway.openCheckout(paymentIntent)
        } catch (error) {
          console.error("[sBTC Gateway] Payment creation failed:", error)
          gateway.emitEvent("payment-error", { error: error.message })
        } finally {
          // Restore button state
          button.textContent = originalText
          button.disabled = false
        }
      })

      // Mark as initialized
      button.setAttribute("data-sbtc-initialized", "true")

      // Add visual styling
      if (!button.classList.contains("sbtc-button-styled")) {
        button.style.cssText += `
          background: linear-gradient(135deg, #f7931a 0%, #ff6b35 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        `
        button.classList.add("sbtc-button-styled")

        // Add hover effects
        button.addEventListener("mouseenter", () => {
          button.style.transform = "translateY(-2px)"
          button.style.boxShadow = "0 8px 25px rgba(247, 147, 26, 0.3)"
        })

        button.addEventListener("mouseleave", () => {
          button.style.transform = "translateY(0)"
          button.style.boxShadow = "none"
        })
      }
    })

    console.log(`[sBTC Gateway] Initialized ${buttons.length} payment buttons`)
  }

  /**
   * Initialize SDK when DOM is ready
   */
  function initialize() {
    // Get publishable key from script tag
    const scriptTag = document.querySelector('script[src*="sbtc-gateway.js"]')
    if (scriptTag) {
      globalPublishableKey = scriptTag.getAttribute("data-publishable-key")
    }

    // Initialize auto-mount buttons
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initializeAutoMount)
    } else {
      initializeAutoMount()
    }

    // Watch for dynamically added buttons
    if (window.MutationObserver) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) {
              // Element node
              if (node.hasAttribute && node.hasAttribute("data-sbtc-button")) {
                initializeAutoMount()
              } else if (node.querySelectorAll) {
                const buttons = node.querySelectorAll("[data-sbtc-button]")
                if (buttons.length > 0) {
                  initializeAutoMount()
                }
              }
            }
          })
        })
      })

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      })
    }
  }

  // Expose SBTCGateway globally
  window.SBTCGateway = SBTCGateway

  // Auto-initialize
  initialize()

  // Export for module systems
  if (typeof module !== "undefined" && module.exports) {
    module.exports = SBTCGateway
  }
})(typeof window !== "undefined" ? window : this)
