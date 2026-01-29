"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Bell, Search, User } from "lucide-react"

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

export default function OwnerNavbar() {
  const pathname = usePathname()
  const { data: session, status } = useSession()

  // ✅ SAFE helpers
  const userEmail = session?.user?.email ?? ""
  const userInitial = userEmail ? userEmail.charAt(0).toUpperCase() : "O"

  const ownerLinks = [
    { name: "Dashboard", href: "/dashboard/owner" },
    { name: "Parking Lots", href: "/dashboard/owner/parking-lots" },
    { name: "Bookings", href: "/dashboard/owner/bookings" },
    { name: "Analytics", href: "/dashboard/owner/analytics" },
    { name: "Reports", href: "/dashboard/owner/reports" },
  ]

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 left-0 right-0 z-50 bg-[#0B1220] border-b border-white/10 shadow-lg"
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center gap-8">
          <Link href="/dashboard/owner" className="flex items-center">
            <Image
              src="/Slotify_logo.jpg"
              alt="Slotify"
              width={140}
              height={40}
              priority
              className="max-h-10 object-contain"
            />
          </Link>

          <div className="flex gap-6 text-gray-200">
            {ownerLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`px-3 py-2 text-sm rounded-md ${
                  pathname === link.href
                    ? "text-purple-400"
                    : "text-gray-200 hover:text-white hover:bg-gray-800"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search bookings, lots..."
              className="bg-[#111827] text-white px-10 py-2 rounded-md outline-none border-gray-700"
            />
          </div>
          
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <Avatar className="h-8 w-8 bg-purple-600">
                  <AvatarImage src="/placeholder-user.svg" />
                  <AvatarFallback className="text-white">{userInitial}</AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-sm font-medium text-white">
                    Owner
                  </span>
                  <span className="text-xs text-gray-400">
                    {session?.user?.email || userEmail}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="bg-gray-900 border-gray-800 text-white">
              <DropdownMenuItem asChild>
                <Link href="/dashboard/owner/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/owner/settings">Settings</Link>
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
        </div>
      </div>
    </motion.nav>
  )
}