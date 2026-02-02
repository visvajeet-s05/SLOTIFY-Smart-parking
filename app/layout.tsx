"use client"

import type React from "react"
import { Inter } from "next/font/google"
import { usePathname } from "next/navigation"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"
import Navbar from "@/components/navigation/navbar"
import AskLocation from "@/components/location/ask-location"
import { AuthProvider } from "@/components/auth/auth-provider"
import { SessionProvider } from "next-auth/react"
import { metadata } from "./metadata"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()

  // Hide global navbar on owner dashboard pages
  const hideGlobalNavbar = pathname.startsWith("/dashboard/owner")

  return (
    <html lang="en">
      <head>
        {/* Preload critical routes */}
        <link rel="preload" href="/login" as="document" />
        <link rel="preload" href="/dashboard" as="document" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
      </head>
      <body className={`${inter.className} bg-black text-white antialiased`}>
        <SessionProvider>
          <AuthProvider>
            {!hideGlobalNavbar && <Navbar />}
            <AskLocation />
            <main className="min-h-screen">{children}</main>
            <Toaster />
            <SonnerToaster />
          </AuthProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
