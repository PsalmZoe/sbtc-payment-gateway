"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CreditCard, ArrowLeft, ArrowRight, Code, Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SmartContractPage() {
  const { toast } = useToast()

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "Code has been copied to your clipboard.",
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/docs" className="flex items-center space-x-2">
              <CreditCard className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-primary">sBTC Gateway</h1>
              <Badge variant="outline">Docs</Badge>
            </Link>
            <nav className="flex items-center space-x-4">
              <Link href="/examples" className="text-muted-foreground hover:text-primary">
                Examples
              </Link>
              <Link href="/dashboard">
                <Button>Dashboard</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-8">
            <Link href="/docs" className="hover:text-primary">
              Documentation
            </Link>
            <span>/</span>
            <span>Smart Contract</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <Code className="h-8 w-8 text-purple-600" />
              <h1 className="text-4xl font-bold">Smart Contract Reference</h1>
            </div>
            <p className="text-xl text-muted-foreground">
              Complete reference for the sBTC Gateway smart contract, including functions, events, and integration
              patterns.
            </p>
          </div>

          {/* Contract Overview */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Contract Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                The sBTC Gateway smart contract handles payment intent registration, atomic sBTC transfers, and event
                emission for payment tracking.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Contract Address</h4>
                  <div className="flex items-center space-x-2">
                    <code className="text-sm bg-background p-2 rounded block flex-1">
                      ST33MYKWMAW0E2DAZETJ1Z8RTRZ93D2GB890QWQXS.payment-gateway
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard("ST33MYKWMAW0E2DAZETJ1Z8RTRZ93D2GB890QWQXS.payment-gateway")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Language</h4>
                  <p className="text-sm">Clarity (Stacks blockchain)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contract Functions */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Public Functions</h2>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Badge variant="outline">register-intent</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Registers a new payment intent with the specified amount and merchant address.
                  </p>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg mb-4">
                    <pre className="text-sm overflow-x-auto">
                      <code>{`(define-public (register-intent (amount uint) (merchant principal))
  (let ((intent-id (generate-intent-id)))
    (map-set payment-intents intent-id {
      amount: amount,
      merchant: merchant,
      status: "pending",
      created-at: block-height
    })
    (print {event: "intent-registered", intent-id: intent-id})
    (ok intent-id)))`}</code>
                    </pre>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Parameters:</h4>
                    <ul className="text-sm space-y-1">
                      <li>
                        <code>amount</code> (uint): Payment amount in satoshis
                      </li>
                      <li>
                        <code>merchant</code> (principal): Merchant's Stacks address
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Badge variant="outline">pay-intent</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Processes payment for a registered intent, transferring sBTC from customer to merchant.
                  </p>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg mb-4">
                    <pre className="text-sm overflow-x-auto">
                      <code>{`(define-public (pay-intent (intent-id (buff 32)))
  (let ((intent (unwrap! (map-get? payment-intents intent-id) ERR-INTENT-NOT-FOUND)))
    (asserts! (is-eq (get status intent) "pending") ERR-INTENT-ALREADY-PROCESSED)
    (try! (contract-call? .sbtc-token transfer 
           (get amount intent) 
           tx-sender 
           (get merchant intent) 
           none))
    (map-set payment-intents intent-id 
             (merge intent {status: "succeeded", paid-at: block-height}))
    (print {event: "payment-succeeded", intent-id: intent-id})
    (ok true)))`}</code>
                    </pre>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Parameters:</h4>
                    <ul className="text-sm space-y-1">
                      <li>
                        <code>intent-id</code> (buff 32): Unique payment intent identifier
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Badge variant="outline">get-intent</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Retrieves payment intent details by ID (read-only function).
                  </p>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg mb-4">
                    <pre className="text-sm overflow-x-auto">
                      <code>{`(define-read-only (get-intent (intent-id (buff 32)))
  (map-get? payment-intents intent-id))`}</code>
                    </pre>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Returns:</h4>
                    <p className="text-sm">
                      Optional tuple containing intent details: amount, merchant, status, created-at, paid-at
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Events */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Contract Events</h2>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Event Structure</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  The contract emits events using Clarity's <code>print</code> function. These events are captured by
                  the blockchain watcher and converted to webhooks.
                </p>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">intent-registered</h4>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
                      <pre className="text-sm">
                        <code>{`{event: "intent-registered", intent-id: 0x1234...}`}</code>
                      </pre>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">payment-succeeded</h4>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
                      <pre className="text-sm">
                        <code>{`{event: "payment-succeeded", intent-id: 0x1234...}`}</code>
                      </pre>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">payment-failed</h4>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
                      <pre className="text-sm">
                        <code>{`{event: "payment-failed", intent-id: 0x1234..., error: "insufficient-funds"}`}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Integration Examples */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Integration Examples</h2>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Direct Contract Interaction</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Example of calling the contract directly using Stacks.js:</p>
                <div className="bg-gray-900 text-gray-100 p-6 rounded-lg mb-4">
                  <pre className="text-sm overflow-x-auto">
                    <code>{`import { makeContractCall, broadcastTransaction } from '@stacks/transactions'
import { StacksTestnet } from '@stacks/network'

async function createPaymentIntent(amount, merchantAddress) {
  const txOptions = {
    contractAddress: 'ST33MYKWMAW0E2DAZETJ1Z8RTRZ93D2GB890QWQXS',
    contractName: 'payment-gateway',
    functionName: 'register-intent',
    functionArgs: [
      uintCV(amount),
      principalCV(merchantAddress)
    ],
    senderKey: privateKey,
    network: new StacksTestnet()
  }
  
  const transaction = await makeContractCall(txOptions)
  const broadcastResponse = await broadcastTransaction(transaction, network)
  return broadcastResponse.txid
}`}</code>
                  </pre>
                </div>
                <Button
                  variant="outline"
                  onClick={() =>
                    copyToClipboard(`import { makeContractCall, broadcastTransaction } from '@stacks/transactions'
import { StacksTestnet } from '@stacks/network'

async function createPaymentIntent(amount, merchantAddress) {
  const txOptions = {
    contractAddress: 'ST33MYKWMAW0E2DAZETJ1Z8RTRZ93D2GB890QWQXS',
    contractName: 'payment-gateway',
    functionName: 'register-intent',
    functionArgs: [
      uintCV(amount),
      principalCV(merchantAddress)
    ],
    senderKey: privateKey,
    network: new StacksTestnet()
  }
  
  const transaction = await makeContractCall(txOptions)
  const broadcastResponse = await broadcastTransaction(transaction, network)
  return broadcastResponse.txid
}`)
                  }
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Code
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Error Codes */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Error Codes</h2>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <code className="bg-muted px-2 py-1 rounded">ERR-INTENT-NOT-FOUND</code>
                    <span className="text-sm text-muted-foreground">Payment intent does not exist</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <code className="bg-muted px-2 py-1 rounded">ERR-INTENT-ALREADY-PROCESSED</code>
                    <span className="text-sm text-muted-foreground">Payment intent already completed</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <code className="bg-muted px-2 py-1 rounded">ERR-INSUFFICIENT-FUNDS</code>
                    <span className="text-sm text-muted-foreground">Customer has insufficient sBTC balance</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <code className="bg-muted px-2 py-1 rounded">ERR-UNAUTHORIZED</code>
                    <span className="text-sm text-muted-foreground">Caller not authorized for this operation</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-8 border-t">
            <Link href="/docs/webhooks">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Webhooks
              </Button>
            </Link>
            <Link href="/docs/authentication">
              <Button>
                Authentication
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
