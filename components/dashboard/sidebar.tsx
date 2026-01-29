"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { BookMarked, Car, CreditCard, Home, MapPin, Menu, MessageSquare, Settings, User, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

const sidebarLinks = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Find Parking", href: "/dashboard/find", icon: MapPin },
  { name: "My Bookings", href: "/dashboard/bookings", icon: BookMarked },
  { name: "Vehicles", href: "/dashboard/vehicles", icon: Car },
  { name: "Payments", href: "/dashboard/payments", icon: CreditCard },
  { name: "Support", href: "/dashboard/support", icon: MessageSquare },
  { name: "Profile", href: "/dashboard/profile", icon: User },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  return (
    <>
      {/* Mobile Sidebar Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-20 z-40 md:hidden" // Updated top position to account for navbar
        onClick={() => setIsMobileOpen(true)}
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}


      {/* Sidebar - Always Static */}
      <aside
        className={cn(
          "fixed top-16 bottom-0 left-0 z-40 flex flex-col border-r border-gray-800 bg-gray-900 md:relative md:translate-x-0",
          "w-80 min-w-80 max-w-80", // Fixed width - always 320px
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between border-b border-gray-800 px-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">Dashboard</span>
          </div>

          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Sidebar Content */}
        <ScrollArea className="flex-1 px-4 py-6">
          <nav className="flex flex-col gap-2">
            {sidebarLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                  pathname === link.href
                    ? "bg-purple-600/20 text-purple-400"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                )}
              >
                <link.icon className="h-5 w-5" />
                <span>{link.name}</span>
              </Link>
            ))}
          </nav>
        </ScrollArea>

        {/* Sidebar Footer */}
        <div className="border-t border-gray-800 p-4">
          <div className="rounded-lg bg-gray-800 p-4">
            <h3 className="font-medium">Need Help?</h3>
            <p className="mt-1 text-sm text-gray-400">Contact our support team for assistance.</p>
            <Button className="mt-3 w-full bg-purple-600 hover:bg-purple-700" size="sm">
              <MessageSquare className="mr-2 h-4 w-4" />
              Contact Support
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}

