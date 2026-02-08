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
      className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 border-b border-white/5 backdrop-blur-xl shadow-lg"
    >
      <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <Image
            src="/Logo.png"
            alt="Slotify"
            width={120}
            height={36}
            priority
            className="h-9 w-auto object-contain brightness-110 group-hover:brightness-125 transition-all"
          />
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center space-x-1 bg-white/5 rounded-full p-1 border border-white/5">
          {dashboardLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.name}
                href={link.href}
                className="relative px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200"
              >
                {isActive && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute inset-0 bg-white/10 rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className={`relative z-10 ${isActive ? "text-white" : "text-gray-400 hover:text-white"}`}>
                  {link.name}
                </span>
              </Link>
            )
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <div className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search bookings..."
              className="pl-10 h-9 bg-white/5 border-white/10 text-white w-64 focus:bg-black/50 focus:border-cyan-500/50 transition-all rounded-full placeholder-gray-500 text-sm"
            />
          </div>

          <div className="h-6 w-px bg-white/10 mx-2 hidden md:block" />

          <Button variant="ghost" size="icon" className="relative text-gray-400 hover:text-white hover:bg-white/5 rounded-full">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-gray-950"></span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-3 pl-2 pr-4 py-1 hover:bg-white/5 rounded-full border border-transparent hover:border-white/5 transition-all">
                <Avatar className="h-8 w-8 ring-2 ring-white/10">
                  <AvatarImage src="/placeholder-user.svg" />
                  <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-bold text-xs">
                    {userInitial}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex flex-col items-start leading-none group-hover:text-white transition-colors">
                  <span className="text-sm font-semibold text-gray-200 group-hover:text-white">
                    {session?.user?.name || "Customer"}
                  </span>
                  <span className="text-[10px] text-gray-500 font-medium tracking-wide">
                    {session?.user?.email || userEmail}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-40 bg-gray-900 border-gray-800 text-gray-200 shadow-xl rounded-xl p-1">
              <DropdownMenuItem
                className="text-red-400 cursor-pointer hover:bg-red-500/10 hover:text-red-300 rounded-lg focus:bg-red-500/10 focus:text-red-300 transition-colors"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-white"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </motion.nav>
  )
}