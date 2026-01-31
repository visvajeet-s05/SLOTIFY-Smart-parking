"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Home, 
  Calendar, 
  MapPin, 
  User, 
  Settings, 
  Search,
  Menu,
  X,
  Bell,
  MessageSquare
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSession, signOut } from "next-auth/react"
import AnimatedBackground from "@/components/ui/AnimatedBackground"

export default function UsersDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // ✅ SAFE helpers
  const userEmail = session?.user?.email ?? ""
  const userInitial = userEmail ? userEmail.charAt(0).toUpperCase() : "U"

  const navigation = [
    { name: "Dashboard", href: "/dashboard/users", icon: Home },
    { name: "Find Parking", href: "/dashboard/users/find", icon: MapPin },
    { name: "My Bookings", href: "/dashboard/users/bookings", icon: Calendar },
    { name: "Profile", href: "/dashboard/users/profile", icon: User },
    { name: "Settings", href: "/dashboard/users/settings", icon: Settings },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <div className="relative min-h-screen bg-black">
      <AnimatedBackground />
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-64 bg-gray-900 border-r border-gray-800 z-50 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h1 className="text-xl font-bold text-white">User Dashboard</h1>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        <nav className="p-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? "bg-purple-600/20 text-purple-400 border border-purple-500/30"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* User Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/placeholder-user.svg" />
                <AvatarFallback>{userInitial}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-white">
                  {session?.user?.email || "User"}
                </p>
                <p className="text-xs text-gray-400">{userEmail}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-red-400 hover:text-red-300"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 bg-gray-900 border-b border-gray-800 z-40">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <MessageSquare className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        {/* Top Bar */}
        <div className="fixed top-0 right-0 left-0 lg:left-64 bg-gray-900 border-b border-gray-800 z-30">
          <div className="flex items-center justify-between p-4">
            <div className="hidden lg:flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search parking spots..."
                  className="pl-10 bg-gray-800 border-gray-700 text-white w-80"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">Welcome back!</span>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded-full">
                  👥 Customer
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="pt-16 pb-8 px-6">
          {children}
        </div>
      </main>
    </div>
  )
}
