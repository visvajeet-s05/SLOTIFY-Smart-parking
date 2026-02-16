"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import {
  CreditCard,
  Users,
  Building2,
  LayoutDashboard,
  LogOut,
  Calendar,
  AlertCircle,
  MapPin,
  Menu,
  ShieldCheck
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (status === "loading") return

    const role = session?.user?.role || localStorage.getItem("role")
    if (role !== "ADMIN") {
      router.replace("/dashboard")
    }
  }, [session, status, router])

  const links = [
    { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/admin/users", label: "Users", icon: Users },
    { href: "/dashboard/admin/owners", label: "Owners", icon: Building2 },
    { href: "/dashboard/admin/bookings", label: "Bookings", icon: Calendar },
    { href: "/dashboard/admin/parking-areas", label: "Parking Lots", icon: MapPin },
    { href: "/dashboard/admin/finance", label: "Finance", icon: CreditCard },
    { href: "/dashboard/admin/incidents", label: "Incidents", icon: AlertCircle },
  ]

  if (status === "loading") return null

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-black/80 backdrop-blur supports-[backdrop-filter]:bg-black/60">
        <div className="flex h-16 items-center px-4 md:px-8 max-w-[1600px] mx-auto w-full justify-between">

          {/* Logo & Desktop Nav */}
          <div className="flex items-center gap-8">
            <Link href="/dashboard/admin" className="flex items-center gap-2 font-bold text-lg bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent transform hover:scale-105 transition-transform duration-200">
              <ShieldCheck className="text-purple-500" />
              <span>AdminPanel</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {links.map((link) => {
                const Icon = link.icon
                const isActive = pathname === link.href || pathname.startsWith(link.href + "/")
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-purple-500/10 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.1)]"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <Icon size={16} />
                    {link.label}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Right Side: User Profile & Mobile Menu */}
          <div className="flex items-center gap-4">
            {/* User Profile (Desktop) */}
            <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-gray-800/50">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-white">{session?.user?.name || "Admin"}</p>
                <p className="text-xs text-gray-500">{session?.user?.email}</p>
              </div>
              <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-purple-600 to-blue-600 flex items-center justify-center text-xs font-bold ring-2 ring-purple-900/20">
                {session?.user?.name?.[0] || 'A'}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                title="Sign Out"
              >
                <LogOut size={18} />
              </Button>
            </div>

            {/* Mobile Menu Trigger */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden text-gray-400 hover:text-white">
                  <Menu size={24} />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] border-r border-gray-800 bg-black text-white p-0">
                <div className="p-6 border-b border-gray-800">
                  <div className="flex items-center gap-2 font-bold text-xl">
                    <ShieldCheck className="text-purple-500" />
                    <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                      AdminPanel
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1 p-4">
                  {links.map((link) => {
                    const Icon = link.icon
                    const isActive = pathname === link.href || pathname.startsWith(link.href + "/")
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                          isActive
                            ? "bg-purple-600/10 text-purple-400"
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                        )}
                      >
                        <Icon size={18} />
                        {link.label}
                      </Link>
                    )
                  })}
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800 bg-black">
                  <div className="flex items-center gap-3 mb-4 px-2">
                    <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold">
                      {session?.user?.name?.[0] || 'A'}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-medium text-white truncate">{session?.user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{session?.user?.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    className="w-full justify-start pl-4"
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 md:px-8 py-6">
        <div className="relative z-10 w-full h-full animate-in fade-in-50 duration-500 slide-in-from-bottom-2">
          {children}
        </div>
      </main>
    </div>
  )
}