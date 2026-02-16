"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Users,
  Building2,
  Car,
  CreditCard,
  ArrowUpRight,
  AlertCircle,
  Activity,
  CheckCircle,
  Clock
} from "lucide-react"
import DashboardShell from "@/components/ui/DashboardShell"
import { formatCurrency } from "@/lib/utils"

interface AdminStats {
  metrics: {
    totalUsers: number
    totalOwners: number // Approved
    totalCustomers: number
    totalBookings: number
    totalRevenue: number
    pendingOwnerApprovals: number
    totalParkingLots: number
    activeParkingLots: number
  }
  lists: {
    recentSignups: any[]
    recentBookings: any[]
  }
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/overview")
        if (res.ok) {
          const data = await res.json()
          setStats(data)
        }
      } catch (error) {
        console.error("Failed to load admin stats", error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <div className="max-w-7xl mx-auto space-y-8 p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Global Overview</h1>
            <p className="text-gray-400 mt-1">
              Real-time insights into platform performance, users, and revenue.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20 text-green-400 text-sm">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              System Operational
            </div>
            <span className="text-xs text-gray-500">Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {/* Revenue */}
          <motion.div variants={item} className="p-6 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700/50 shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <CreditCard size={48} />
            </div>
            <div className="flex flex-col">
              <span className="text-gray-400 text-sm font-medium mb-1">Total Revenue</span>
              <span className="text-3xl font-bold text-white tracking-tight">
                {formatCurrency(stats?.metrics.totalRevenue || 0)}
              </span>
              <div className="mt-2 text-xs text-green-400 flex items-center gap-1">
                <ArrowUpRight size={12} />
                <span>+12.5% from last month</span>
              </div>
            </div>
          </motion.div>

          {/* Users */}
          <motion.div variants={item} className="p-6 rounded-xl bg-gray-900 border border-gray-700/50 shadow-lg relative overflow-hidden group hover:border-blue-500/30 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-blue-500">
              <Users size={48} />
            </div>
            <div className="flex flex-col">
              <span className="text-gray-400 text-sm font-medium mb-1">Total Users</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white">{stats?.metrics.totalUsers}</span>
                <span className="text-xs text-gray-500">({stats?.metrics.totalCustomers} Customers)</span>
              </div>
              <div className="mt-2 text-xs text-blue-400">
                {stats?.lists.recentSignups.length} new this week
              </div>
            </div>
          </motion.div>

          {/* Owners & Lots */}
          <motion.div variants={item} className="p-6 rounded-xl bg-gray-900 border border-gray-700/50 shadow-lg relative overflow-hidden group hover:border-purple-500/30 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-purple-500">
              <Building2 size={48} />
            </div>
            <div className="flex flex-col">
              <span className="text-gray-400 text-sm font-medium mb-1">Parking Network</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white">{stats?.metrics.totalParkingLots}</span>
                <span className="text-xs text-gray-500">Lots</span>
              </div>
              <div className="mt-2 text-xs text-purple-400 flex items-center gap-2">
                <span>{stats?.metrics.totalOwners} Owners</span>
                <span className="w-1 h-1 rounded-full bg-gray-600" />
                <span>{stats?.metrics.activeParkingLots} Active</span>
              </div>
            </div>
          </motion.div>

          {/* Pending Actions */}
          <motion.div variants={item} className="p-6 rounded-xl bg-gray-900 border border-gray-700/50 shadow-lg relative overflow-hidden group hover:border-yellow-500/30 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-yellow-500">
              <AlertCircle size={48} />
            </div>
            <div className="flex flex-col">
              <span className="text-gray-400 text-sm font-medium mb-1">Pending Actions</span>
              <span className="text-3xl font-bold text-white">{stats?.metrics.pendingOwnerApprovals}</span>
              <div className="mt-2 text-xs text-yellow-400">
                Pending Owner Verifications
              </div>
              {stats?.metrics.pendingOwnerApprovals! > 0 && (
                <Link href="/dashboard/admin/owners" className="absolute bottom-4 right-4 text-xs bg-yellow-500/10 text-yellow-400 px-2 py-1 rounded hover:bg-yellow-500/20 transition-colors">
                  Review Now →
                </Link>
              )}
            </div>
          </motion.div>
        </motion.div>

        {/* Main Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Bookings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 bg-gray-900/50 border border-gray-800 rounded-xl p-6 backdrop-blur-sm"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Clock size={18} className="text-blue-400" />
                Recent Bookings
              </h2>
              <Link href="/dashboard/admin/bookings" className="text-xs text-blue-400 hover:text-blue-300">
                View All
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-800/50">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">Customer</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 rounded-r-lg">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {stats?.lists.recentBookings.map((booking: any) => (
                    <tr key={booking.id} className="hover:bg-gray-800/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-200">{booking.customer}</td>
                      <td className="px-4 py-3 text-gray-400">{booking.parkingLot}</td>
                      <td className="px-4 py-3 text-gray-200">{formatCurrency(booking.amount)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${booking.status === 'COMPLETED' ? 'bg-green-500/10 text-green-400' :
                            booking.status === 'ACTIVE' ? 'bg-blue-500/10 text-blue-400' :
                              booking.status === 'UPCOMING' ? 'bg-purple-500/10 text-purple-400' :
                                'bg-gray-700 text-gray-400'
                          }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {new Date(booking.date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {(!stats?.lists.recentBookings || stats.lists.recentBookings.length === 0) && (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-gray-500">No recent bookings found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Quick Actions & Recent Users */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 backdrop-blur-sm"
            >
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Activity size={18} className="text-purple-400" />
                Quick Actions
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/dashboard/admin/users" className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-center transition-colors border border-gray-700">
                  <Users className="mx-auto mb-2 text-blue-400" size={20} />
                  <span className="text-xs text-gray-300">Manage Users</span>
                </Link>
                <Link href="/dashboard/admin/owners" className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-center transition-colors border border-gray-700">
                  <Building2 className="mx-auto mb-2 text-purple-400" size={20} />
                  <span className="text-xs text-gray-300">Verify Owners</span>
                </Link>
                <Link href="/dashboard/admin/finance" className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-center transition-colors border border-gray-700">
                  <CreditCard className="mx-auto mb-2 text-green-400" size={20} />
                  <span className="text-xs text-gray-300">Finance</span>
                </Link>
                <Link href="/dashboard/admin/incidents" className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-center transition-colors border border-gray-700">
                  <AlertCircle className="mx-auto mb-2 text-red-400" size={20} />
                  <span className="text-xs text-gray-300">Incidents</span>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 backdrop-blur-sm"
            >
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <CheckCircle size={18} className="text-green-400" />
                New Signups
              </h2>
              <div className="space-y-4">
                {stats?.lists.recentSignups.map((user: any) => (
                  <div key={user.id} className="flex items-center justify-between border-b border-gray-800 pb-2 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${user.role === 'OWNER' ? 'bg-purple-900 text-purple-200' : 'bg-blue-900 text-blue-200'
                        }`}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-200">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
