import type React from "react"
import type { Metadata } from "next"
import { Montserrat } from "next/font/google"
import { JetBrains_Mono } from "next/font/google"
import Script from "next/script"
import "./globals.css"

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
})

export const metadata: Metadata = {
  title: "sBTC Gateway - The Stripe for Bitcoin",
  description:
    "Accept Bitcoin payments with sBTC on Stacks blockchain. Seamless, low-friction payment gateway for businesses.",
  generator: "v0.app",
  keywords: ["sBTC", "Bitcoin", "Stacks", "payments", "gateway", "blockchain"],
  authors: [{ name: "sBTC Gateway Team" }],
  openGraph: {
    title: "sBTC Gateway - The Stripe for Bitcoin",
    description: "Accept Bitcoin payments with sBTC on Stacks blockchain",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} ${jetbrainsMono.variable}`}>
      <body className="font-montserrat antialiased">
        {/* Load sats-connect for Xverse wallet support */}
        <Script 
          src="https://unpkg.com/sats-connect@2.4.2/dist/index.js"
          strategy="beforeInteractive"
        />
        
        {children}
      </body>
    </html>
  )
}