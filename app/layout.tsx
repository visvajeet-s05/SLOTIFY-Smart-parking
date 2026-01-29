import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import AuthSessionProvider from "@/components/auth/session-provider"
import { AuthProvider } from "@/components/auth/auth-provider"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"
import AskLocation from "@/components/location/ask-location"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Smart Parking - Find and Book Parking Spots",
  description: "A modern platform for finding and booking parking spots in real-time",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-black text-white antialiased`}>
        <AuthSessionProvider>
          <AuthProvider>
            <AskLocation />
            <main className="min-h-screen">{children}</main>
            <Toaster />
            <SonnerToaster />
          </AuthProvider>
        </AuthSessionProvider>
      </body>
    </html>
  )
}

