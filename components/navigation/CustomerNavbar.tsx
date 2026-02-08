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
import { Role } from "@/lib/auth/roles"

export default function CustomerNavbar() {
  const pathname = usePathname()
  const { data: session, status } = useSession()

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // ✅ SAFE helpers
  const userEmail = session?.user?.email ?? ""
  const userInitial = userEmail ? userEmail.charAt(0).toUpperCase() : "U"

  const dashboardLinks = [
    { name: "Home", href: "/dashboard" },
    { name: "Find Parking", href: "/dashboard#available-parking" },
    { name: "My Bookings", href: "/dashboard/bookings" },
    { name: "Profile", href: "/dashboard/profile" },
  ]

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 left-0 right-0 z-50 bg-[#020617]/80 border-b border-white/5 backdrop-blur-xl shadow-lg"
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
            className="max-h-10 object-contain filter invert opacity-90 hover:opacity-100 transition-opacity"
          />
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center space-x-6">
          {dashboardLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${pathname === link.href
                ? "text-white bg-white/10 shadow-lg shadow-purple-500/10"
                : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
            >
              {link.name}
            </Link>
          ))}

          <div className="relative ml-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search bookings..."
              className="pl-10 h-9 bg-white/5 border-white/10 text-white w-64 focus:bg-black/50 focus:border-purple-500/50 transition-all rounded-lg placeholder-gray-500"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder-user.svg" />
                  <AvatarFallback>{userInitial}</AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-sm font-medium text-white">
                    {session?.user?.name || "Customer"}
                  </span>
                  <span className="text-xs text-gray-400">
                    {session?.user?.email || userEmail}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="bg-gray-900 border-gray-800 text-white min-w-[150px]">
              <DropdownMenuItem
                className="text-red-400 cursor-pointer focus:text-red-300 focus:bg-red-500/10"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

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
  )
}