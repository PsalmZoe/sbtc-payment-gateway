"use client"

import type React from "react"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Code, ExternalLink, Copy, RefreshCw, CheckCircle, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Mock contract data
const contractInfo = {
  address: "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7.sbtc-payment-gateway",
  network: "mainnet",
  status: "deployed",
  version: "1.2.0",
  deployedAt: "2024-01-15T10:30:00Z",
  lastUpdated: "2024-01-15T10:30:00Z",
  txHash: "0x1234567890abcdef1234567890abcdef12345678",
  blockHeight: 123456,
}

const contractABI = `
;; sBTC Payment Gateway Smart Contract
;; Version 1.2.0

(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_INVALID_AMOUNT (err u101))
(define-constant ERR_PAYMENT_NOT_FOUND (err u102))
(define-constant ERR_PAYMENT_ALREADY_PROCESSED (err u103))

(define-data-var contract-owner principal tx-sender)

(define-map payment-intents
  { payment-id: (string-ascii 64) }
  {
    merchant: principal,
    amount: uint,
    status: (string-ascii 20),
    created-at: uint,
    processed-at: (optional uint)
  }
)

(define-public (create-payment-intent (payment-id (string-ascii 64)) (amount uint))
  (begin
    (asserts! (> amount u0) ERR_INVALID_AMOUNT)
    (map-set payment-intents
      { payment-id: payment-id }
      {
        merchant: tx-sender,
        amount: amount,
        status: "pending",
        created-at: block-height,
        processed-at: none
      }
    )
    (print { event: "payment-intent-created", payment-id: payment-id, amount: amount })
    (ok payment-id)
  )
)

(define-public (process-payment (payment-id (string-ascii 64)))
  (let ((payment (unwrap! (map-get? payment-intents { payment-id: payment-id }) ERR_PAYMENT_NOT_FOUND)))
    (asserts! (is-eq (get status payment) "pending") ERR_PAYMENT_ALREADY_PROCESSED)
    (map-set payment-intents
      { payment-id: payment-id }
      (merge payment { status: "completed", processed-at: (some block-height) })
    )
    (print { event: "payment-processed", payment-id: payment-id })
    (ok true)
  )
)

(define-read-only (get-payment-intent (payment-id (string-ascii 64)))
  (map-get? payment-intents { payment-id: payment-id })
)
`

export default function SmartContractPage() {
  const { toast } = useToast()
  const [isDeploying, setIsDeploying] = useState(false)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "Contract address has been copied to your clipboard.",
    })
  }

  const handleRedeploy = async () => {
    setIsDeploying(true)
    // Simulate deployment
    setTimeout(() => {
      setIsDeploying(false)
      toast({
        title: "Contract redeployed",
        description: "Smart contract has been successfully redeployed with the latest version.",
      })
    }, 3000)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "deployed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Deployed</Badge>
      case "deploying":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Deploying</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Failed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Smart Contract</h1>
            <p className="text-muted-foreground">Manage your sBTC payment gateway smart contract deployment</p>
          </div>
          <Button onClick={handleRedeploy} disabled={isDeploying}>
            {isDeploying ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Deploying...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Redeploy Contract
              </>
            )}
          </Button>
        </div>

        {/* Contract Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Contract Status</p>
                  <p className="text-2xl font-bold">Active</p>
                  {getStatusBadge(contractInfo.status)}
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Version</p>
                  <p className="text-2xl font-bold">{contractInfo.version}</p>
                  <p className="text-sm text-green-600">Latest</p>
                </div>
                <Code className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Network</p>
                  <p className="text-2xl font-bold">Mainnet</p>
                  <p className="text-sm text-green-600">Stacks</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Block Height</p>
                  <p className="text-2xl font-bold">{contractInfo.blockHeight.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Deployed at</p>
                </div>
                <Code className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contract Details */}
        <Card>
          <CardHeader>
            <CardTitle>Contract Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Contract Address</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <code className="text-sm bg-muted px-3 py-2 rounded flex-1 break-all">{contractInfo.address}</code>
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(contractInfo.address)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Deployment Transaction</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <code className="text-sm bg-muted px-3 py-2 rounded flex-1 break-all">{contractInfo.txHash}</code>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Deployed At</Label>
                  <p className="text-sm mt-1">{formatDate(contractInfo.deployedAt)}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Last Updated</Label>
                  <p className="text-sm mt-1">{formatDate(contractInfo.lastUpdated)}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Network</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Stacks Mainnet</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contract Code and ABI */}
        <Card>
          <CardHeader>
            <CardTitle>Contract Code & ABI</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="abi" className="w-full">
              <TabsList>
                <TabsTrigger value="abi">Contract ABI</TabsTrigger>
                <TabsTrigger value="source">Source Code</TabsTrigger>
                <TabsTrigger value="functions">Functions</TabsTrigger>
              </TabsList>

              <TabsContent value="abi" className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Application Binary Interface for interacting with the smart contract
                  </p>
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(contractABI)}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy ABI
                  </Button>
                </div>
                <Textarea
                  value={contractABI}
                  readOnly
                  className="font-mono text-sm min-h-[400px] bg-muted"
                  placeholder="Contract ABI will be displayed here..."
                />
              </TabsContent>

              <TabsContent value="source" className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Complete Clarity source code for the smart contract</p>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View on Explorer
                  </Button>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Source code verification is in progress. The verified source will be available shortly.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="functions" className="space-y-4">
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">create-payment-intent</h4>
                      <Badge variant="outline">Public</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Creates a new payment intent with the specified amount
                    </p>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      (payment-id: string-ascii, amount: uint) → (response (string-ascii 64) uint)
                    </code>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">process-payment</h4>
                      <Badge variant="outline">Public</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">Processes a pending payment intent</p>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      (payment-id: string-ascii) → (response bool uint)
                    </code>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">get-payment-intent</h4>
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Read-Only</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">Retrieves payment intent details</p>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      (payment-id: string-ascii) → (optional payment-intent)
                    </code>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Deployment Warning */}
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-yellow-800">Contract Redeployment</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Redeploying the smart contract will create a new contract address. Make sure to update your
                  integration and API configuration after redeployment.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>
}
