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
import { Role } from "@/lib/auth/roles"
import Logo from "@/components/ui/Logo"

export default function OwnerNavbar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const userEmail = session?.user?.email ?? ""
  const userName = session?.user?.name ?? "Owner"
  const userInitial = userName.charAt(0).toUpperCase()

  const ownerLinks = [
    { name: "Home", href: "/dashboard/owner" },
    { name: "Bookings", href: "/dashboard/owner/bookings" },
    { name: "Analytics", href: "/dashboard/owner/analytics" },
    { name: "Reports", href: "/dashboard/owner/reports" },
  ]

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 left-0 right-0 z-50 bg-[#030303]/80 backdrop-blur-2xl border-b border-white/[0.08] shadow-[0_2px_40px_rgba(0,0,0,0.4)]"
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center gap-10">
          <Link href="/dashboard/owner" className="flex items-center group">
            <div className="relative">
              <Logo size="small" className="hover:scale-105 transition-transform duration-300" />
              <div className="absolute -inset-2 bg-purple-500/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>

          <div className="hidden lg:flex gap-1 items-center">
            {ownerLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg ${isActive
                    ? "text-white"
                    : "text-gray-400 hover:text-white hover:bg-white/[0.05]"
                    }`}
                >
                  {link.name}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-1 left-4 right-4 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-5">
          <div className="hidden md:flex relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
            <Input
              placeholder="Quick search..."
              className="bg-white/[0.03] border-white/[0.08] text-white px-10 py-2 w-64 rounded-xl focus:ring-1 focus:ring-purple-500/30 focus:border-purple-500/50 transition-all placeholder:text-gray-600 outline-none"
            />
          </div>

          <Button variant="ghost" size="icon" className="relative hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-purple-500 rounded-full border-2 border-[#030303]" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-3 px-2 py-1.5 hover:bg-white/5 rounded-full transition-all border border-transparent hover:border-white/10 group">
                <div className="relative">
                  <Avatar className="h-8 w-8 ring-2 ring-purple-500/20 group-hover:ring-purple-500/40 transition-all">
                    <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white text-xs font-bold">
                      {userInitial}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#030303]" />
                </div>
                <div className="hidden sm:flex flex-col items-start leading-tight">
                  <span className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">
                    {userName}
                  </span>
                  <span className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">
                    {Role.OWNER}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56 mt-2 bg-[#0f0f0f]/95 backdrop-blur-xl border-white/10 text-white p-2 rounded-2xl shadow-2xl">
              <div className="p-3 mb-2 bg-white/[0.03] rounded-xl flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-purple-600 text-white font-bold">{userInitial}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold truncate">{userName}</span>
                  <span className="text-xs text-gray-500 truncate">{userEmail}</span>
                </div>
              </div>
              <DropdownMenuItem asChild className="rounded-lg focus:bg-white/10 cursor-pointer py-2.5">
                <Link href="/dashboard/owner/profile" className="flex items-center gap-2">
                  <User size={16} className="text-purple-400" /> Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-lg focus:bg-white/10 cursor-pointer py-2.5">
                <Link href="/dashboard/owner/settings" className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border border-gray-400" /> Account Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/5 my-1" />
              <DropdownMenuItem
                className="text-red-400 rounded-lg focus:bg-red-500/10 cursor-pointer py-2.5 font-medium"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.nav>
  )
}
