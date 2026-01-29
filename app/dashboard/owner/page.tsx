"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import {
  Building2,
  Calendar,
  Users,
  TrendingUp,
  CreditCard,
  BarChart3,
  MapPin,
  Settings,
  DollarSign,
  Percent,
  Car
} from "lucide-react"
import OwnerTopbar from "@/components/owner/owner-topbar"

export default function OwnerDashboardPage() {
  const { data: session } = useSession()
  const [userName, setUserName] = useState<string>("")
  const [isFirstLogin, setIsFirstLogin] = useState<boolean>(false)

  useEffect(() => {
    if (session?.user?.id) {
      fetch(`/api/user/${session.user.id}`)
        .then(res => res.json())
        .then(data => {
          setUserName(data.name || "")
          setIsFirstLogin(!data.lastLoginAt)
        })
        .catch(err => console.error("Error fetching user data:", err))
    }
  }, [session?.user?.id])

  const welcomeText = isFirstLogin
    ? `Welcome ${userName} 👋`
    : `Welcome back ${userName} 👋`

  const welcomeSubtitle = isFirstLogin
    ? "Let's set up your parking business"
    : "Here's what's happening today"

  const stats = [
    {
      title: "Total Revenue",
      value: "₹ 0",
      change: "+0%",
      icon: DollarSign,
      color: "from-green-500 to-emerald-600"
    },
    {
      title: "Active Bookings",
      value: "0",
      change: "+0",
      icon: Calendar,
      color: "from-blue-500 to-cyan-600"
    },
    {
      title: "Occupancy Rate",
      value: "0%",
      change: "+0%",
      icon: Percent,
      color: "from-purple-500 to-pink-600"
    },
    {
      title: "Parking Lots",
      value: "0",
      change: "+0",
      icon: Building2,
      color: "from-orange-500 to-red-600"
    }
  ]

  const quickActions = [
    {
      title: "Manage Parking Lots",
      description: "View and manage your parking facilities",
      href: "/dashboard/owner/parking-lots",
      icon: Building2,
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "View Bookings",
      description: "Manage current and upcoming bookings",
      href: "/dashboard/owner/bookings",
      icon: Calendar,
      color: "from-green-500 to-green-600"
    },
    {
      title: "Customer Insights",
      description: "Analyze customer behavior and trends",
      href: "/dashboard/owner/insights",
      icon: BarChart3,
      color: "from-purple-500 to-purple-600"
    },
    {
      title: "Financial Reports",
      description: "View detailed revenue and expense reports",
      href: "/dashboard/owner/finance",
      icon: CreditCard,
      color: "from-orange-500 to-orange-600"
    },
    {
      title: "Analytics",
      description: "Deep insights into parking utilization",
      href: "/dashboard/owner/analytics",
      icon: TrendingUp,
      color: "from-teal-500 to-teal-600"
    },
    {
      title: "Settings",
      description: "Configure your parking lot settings",
      href: "/dashboard/owner/settings",
      icon: Settings,
      color: "from-gray-500 to-gray-600"
    }
  ]

  return (
    <div className="min-h-screen bg-black">
      <OwnerTopbar />
      <div className="pt-4 px-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Welcome Header */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {welcomeText}
                </h1>
                <p className="text-gray-300">{welcomeSubtitle}</p>
              </div>
              <div className="hidden md:block">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Car className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition-all duration-300 group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-2">{stat.title}</p>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-sm text-green-400 mt-1">{stat.change}</p>
                  </div>
                  <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <Link 
                key={index} 
                href={action.href}
                className="group bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition-all duration-300 hover:shadow-lg hover:shadow-gray-900/50"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center group-hover:bg-gray-700 transition-colors duration-300">
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors duration-300">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-400">{action.description}</p>
              </Link>
            ))}
          </div>

          {/* Recent Activity Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">New Booking</p>
                      <p className="text-xs text-gray-400">Slot A12 - 2 hours</p>
                    </div>
                  </div>
                  <p className="text-sm text-green-400">+₹ 200</p>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <Building2 className="h-4 w-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Lot Added</p>
                      <p className="text-xs text-gray-400">Downtown Mall</p>
                    </div>
                  </div>
                  <p className="text-sm text-blue-400">+1</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Today's Revenue</span>
                  <span className="text-white font-semibold">₹ 0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Active Users</span>
                  <span className="text-white font-semibold">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Avg. Duration</span>
                  <span className="text-white font-semibold">0 min</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
