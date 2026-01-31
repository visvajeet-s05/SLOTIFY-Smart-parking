"use client"

import Link from "next/link"
import { 
  Calendar, 
  MapPin, 
  CreditCard, 
  TrendingUp,
  Car,
  Clock,
  DollarSign
} from "lucide-react"
import { useSession } from "next-auth/react"

export default function UsersDashboardPage() {
  const { data: session } = useSession()
  
  const userEmail = session?.user?.email ?? ""
  const userName = userEmail.split('@')[0] || "User"

  const stats = [
    {
      title: "Total Bookings",
      value: "0",
      change: "+0",
      icon: Calendar,
      color: "from-blue-500 to-cyan-600"
    },
    {
      title: "Total Spent",
      value: "₹ 0",
      change: "+0%",
      icon: DollarSign,
      color: "from-green-500 to-emerald-600"
    },
    {
      title: "Favorite Location",
      value: "None",
      change: "N/A",
      icon: MapPin,
      color: "from-purple-500 to-pink-600"
    },
    {
      title: "Avg. Duration",
      value: "0 min",
      change: "N/A",
      icon: Clock,
      color: "from-orange-500 to-red-600"
    }
  ]

  const quickActions = [
    {
      title: "Find Parking",
      description: "Search and book parking spots near you",
      href: "/dashboard/users/find",
      icon: MapPin,
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "My Bookings",
      description: "View and manage your parking reservations",
      href: "/dashboard/users/bookings",
      icon: Calendar,
      color: "from-green-500 to-green-600"
    },
    {
      title: "Payment History",
      description: "View your payment and billing history",
      href: "/dashboard/users/payments",
      icon: CreditCard,
      color: "from-purple-500 to-purple-600"
    },
    {
      title: "Preferences",
      description: "Set your parking preferences and settings",
      href: "/dashboard/users/preferences",
      icon: Settings,
      color: "from-orange-500 to-orange-600"
    }
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 border border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, {userName}! 👋
            </h1>
            <p className="text-gray-300">Your parking dashboard - quick access to bookings and preferences</p>
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
                <p className="text-sm text-gray-400 mt-1">{stat.change}</p>
              </div>
              <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
          <h3 className="text-lg font-semibold text-white mb-4">Recent Bookings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Shopping Mall</p>
                  <p className="text-xs text-gray-400">Today, 2:00 PM - 4:00 PM</p>
                </div>
              </div>
              <p className="text-sm text-green-400">₹ 150</p>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Airport Parking</p>
                  <p className="text-xs text-gray-400">Yesterday, 10:00 AM</p>
                </div>
              </div>
              <p className="text-sm text-blue-400">₹ 500</p>
            </div>
            <div className="text-center pt-4">
              <Link href="/dashboard/users/bookings" className="text-purple-400 hover:text-purple-300 text-sm font-medium">
                View All Bookings →
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Tips</h3>
          <div className="space-y-4">
            <div className="p-4 bg-gray-800 rounded-lg">
              <h4 className="font-medium text-white mb-2">💡 Save Time</h4>
              <p className="text-sm text-gray-400">Book your favorite spots in advance to guarantee availability</p>
            </div>
            <div className="p-4 bg-gray-800 rounded-lg">
              <h4 className="font-medium text-white mb-2">📱 Mobile App</h4>
              <p className="text-sm text-gray-400">Download our mobile app for on-the-go parking management</p>
            </div>
            <div className="p-4 bg-gray-800 rounded-lg">
              <h4 className="font-medium text-white mb-2">💳 Payment Options</h4>
              <p className="text-sm text-gray-400">Add multiple payment methods for faster checkout</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}