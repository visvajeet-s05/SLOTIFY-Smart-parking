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
import AuthRedirect from "@/components/auth/AuthRedirect"

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
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
      </head>
      <body className={`${inter.className} bg-black text-white antialiased`}>
        <script dangerouslySetInnerHTML={{
          __html: `
            if ('scrollRestoration' in window.history) {
              window.history.scrollRestoration = 'manual';
            }
          `}} />
        <SessionProvider>
          <AuthProvider>
            <AuthRedirect />
            {!hideGlobalNavbar && <Navbar />}
            {children}
            <Toaster />
            <SonnerToaster />
          </AuthProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
