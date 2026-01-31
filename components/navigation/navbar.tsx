"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Car, Menu, Search, Bell, User, X, MessageSquare } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { useSession, signOut } from "next-auth/react"
import LoginModal from "@/components/auth/LoginModal"

export default function Navbar() {
  const pathname = usePathname()
  const { data: session, status } = useSession()

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)

  const isDashboard = pathname.startsWith("/dashboard")

  // ✅ SAFE helpers
  const userEmail = session?.user?.email ?? ""
  const userInitial = userEmail ? userEmail.charAt(0).toUpperCase() : "U"

  const navLinks: Array<{ name: string; href: string; onClick?: () => void }> = [
    { name: "Home", href: "/", onClick: undefined },
    {
      name: "Find Parking",
      href: status === "authenticated" ? "/find" : "#",
      onClick: status === "authenticated" ? undefined : () => setShowLoginModal(true),
    },
    { name: "How It Works", href: "/how-it-works", onClick: undefined },
    { name: "Pricing", href: "/pricing", onClick: undefined },
    { name: "About Us", href: "/about", onClick: undefined },
  ]

  const dashboardLinks: Array<{ name: string; href: string; onClick?: () => void }> = [
    { name: "Home", href: "/dashboard", onClick: undefined },
    { name: "Find Parking", href: "/dashboard/find", onClick: undefined },
    { name: "My Bookings", href: "/dashboard/bookings", onClick: undefined },
    { name: "Profile", href: "/dashboard/profile", onClick: undefined },
  ]

  const activeLinks = isDashboard ? dashboardLinks : navLinks

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 left-0 right-0 z-50 
bg-gradient-to-r from-black via-gray-900 to-black
border-b border-white/10 backdrop-blur-md shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/Slotify_logo.jpg"
              alt="Slotify"
              width={140}
              height={40}
              priority
              className="max-h-10 object-contain filter invert"
            />
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center space-x-4">
            {activeLinks.map((link) =>
              link.onClick ? (
                <button
                  key={link.name}
                  onClick={link.onClick}
                  className="px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-md"
                >
                  {link.name}
                </button>
              ) : (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-3 py-2 text-sm rounded-md ${
                    pathname === link.href
                      ? "text-purple-400"
                      : "text-gray-300 hover:text-white hover:bg-gray-800"
                  }`}
                >
                  {link.name}
                </Link>
              )
            )}

            {isDashboard && (
              <div className="relative ml-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search..."
                  className="pl-10 bg-gray-800 border-gray-700 text-white w-64"
                />
              </div>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {status === "authenticated" ? (
              <>
                {isDashboard && (
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                  </Button>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/placeholder-user.svg" />
                        <AvatarFallback>{userInitial}</AvatarFallback>
                      </Avatar>
                      <div className="hidden sm:flex flex-col items-start">
                        <span className="text-sm font-medium text-white">
                          {session?.user?.role === "OWNER" ? "👤 Owner" :
                           session?.user?.role === "ADMIN" ? "🔧 Admin" :
                           session?.user?.role === "CUSTOMER" ? "👥 Customer" : "👤 User"}
                        </span>
                        <span className="text-xs text-gray-400">
                          {userEmail}
                        </span>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="bg-gray-900 border-gray-800 text-white">
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/profile">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/bookings">My Bookings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-800" />
                    <DropdownMenuItem
                      className="text-red-400 cursor-pointer"
                      onClick={() => signOut({ callbackUrl: "/" })}
                    >
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => setShowLoginModal(true)}
                >
                  Login
                </Button>
                <Button
                  className="bg-gradient-to-r from-purple-600 to-indigo-600"
                  onClick={() => setShowLoginModal(true)}
                >
                  Get Started
                </Button>
              </>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* Login Modal */}
      <LoginModal open={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  )
}
