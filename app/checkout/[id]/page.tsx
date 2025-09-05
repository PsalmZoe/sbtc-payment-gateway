import { notFound } from "next/navigation"
import { db } from "@/lib/database"
import CheckoutForm from "@/components/checkout-form"
import { PriceDisplay } from "@/components/price-display"

interface CheckoutPageProps {
  params: { id: string }
  searchParams: { client_secret?: string }
}

async function getPaymentIntent(id: string) {
  try {
    const result = await db.query(
      `
      SELECT pi.*, m.name as merchant_name 
      FROM payment_intents pi 
      JOIN merchants m ON pi.merchant_id = m.id 
      WHERE pi.id = $1
    `,
      [id],
    )

    return result.rows[0] || null
  } catch (error) {
    console.error("Error fetching payment intent:", error)
    return null
  }
}

export default async function CheckoutPage({ params, searchParams }: CheckoutPageProps) {
  const paymentIntent = await getPaymentIntent(params.id)

  if (!paymentIntent || !searchParams.client_secret) {
    notFound()
  }

  const mockContractId = Buffer.from(paymentIntent.id.replace(/-/g, "").slice(0, 32).padEnd(32, "0"), "hex")

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Complete Payment</h1>
            <p className="text-gray-600 mt-2">Pay {paymentIntent.merchant_name}</p>
          </div>

          <div className="border-t border-b border-gray-200 py-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Amount</span>
              <div className="text-right">
                <PriceDisplay
                  sats={Number.parseInt(paymentIntent.amount_satoshis)}
                  showBoth={true}
                  className="text-2xl font-bold"
                />
              </div>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-gray-500">Network</span>
              <span className="text-sm text-gray-500">sBTC Testnet</span>
            </div>
            {paymentIntent.description && (
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-500">Description</span>
                <span className="text-sm text-gray-700">{paymentIntent.description}</span>
              </div>
            )}
          </div>

          <CheckoutForm
            paymentIntentId={paymentIntent.id}
            amount={(Number(paymentIntent.amount_satoshis) / 1_000_000).toFixed(6)}
            contractId={mockContractId}
          />
        </div>
      </div>
    </div>
  )
}