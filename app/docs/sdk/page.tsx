"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreditCard, Copy, BookOpen } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SDKDocumentationPage() {
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
            <Link href="/docs" className="hover:text-primary">Documentation</Link>
            <span>/</span>
            <span>SDK Documentation</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <BookOpen className="h-8 w-8 text-purple-600" />
              <h1 className="text-4xl font-bold">SDK Documentation</h1>
            </div>
            <p className="text-xl text-muted-foreground">
              Complete guide to the sBTC Gateway JavaScript/TypeScript SDK. Build custom payment experiences with full control.
            </p>
          </div>

          {/* Installation */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Installation</h2>
            
            <Tabs defaultValue="cdn" className="w-full">
              <TabsList>
                <TabsTrigger value="cdn">CDN</TabsTrigger>
                <TabsTrigger value="npm">NPM</TabsTrigger>
                <TabsTrigger value="yarn">Yarn</TabsTrigger>
              </TabsList>
              
              <TabsContent value="cdn">
                <Card>
                  <CardHeader>
                    <CardTitle>CDN Installation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Include the SDK directly in your HTML. The SDK will be available globally as <code>sBTCGateway</code>.
                    </p>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded text-sm relative">
                      <pre>{`<script src="https://gateway.sbtc.dev/js/sbtc-gateway.js" data-publishable-key="pk_test_..."></script>`}</pre>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="absolute top-2 right-2 bg-transparent"
                        onClick={() => copyToClipboard(`<script src="https://gateway.sbtc.dev/js/sbtc-gateway.js" data-publishable-key="pk_test_..."></script>`)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="npm">
                <Card>
                  <CardHeader>
                    <CardTitle>NPM Installation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded text-sm relative">
                      <pre>{`npm install @sbtc-gateway/sdk`}</pre>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="absolute top-2 right-2 bg-transparent"
                        onClick={() => copyToClipboard(`npm install @sbtc-gateway/sdk`)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="yarn">
                <Card>
                  <CardHeader>
                    <CardTitle>Yarn Installation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded text-sm relative">
                      <pre>{`yarn add @sbtc-gateway/sdk`}</pre>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="absolute top-2 right-2 bg-transparent"
                        onClick={() => copyToClipboard(`yarn add @sbtc-gateway/sdk`)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
