"use client"

import { useEffect, useState, useCallback } from "react"
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
  const [msPulse, setMsPulse] = useState(0)
  const [currentTime, setCurrentTime] = useState(new Date())

  const fetchStats = useCallback(async () => {
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
  }, [])

  useEffect(() => {
    fetchStats()

    // High-frequency UI tick (every 10ms) for millisecond feel
    const msTimer = setInterval(() => {
      setMsPulse(Date.now() % 1000)
    }, 10)

    // Standard clock
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)

    // Auto-refresh data every 10s (standard professional delay)
    const refreshTimer = setInterval(() => {
      console.log("🔄 Admin auto-refreshing stats...")
      fetchStats()
    }, 10000)

    return () => {
      clearInterval(msTimer)
      clearInterval(timer)
      clearInterval(refreshTimer)
    }
  }, [fetchStats])

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
            <h1 className="text-3xl font-bold tracking-tight text-white uppercase">Global Overview</h1>
            <p className="text-gray-400 mt-1 uppercase text-[10px] tracking-[0.2em] font-bold">
              Real-time synchronization • ms-fidelity analytics
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20 text-green-400 text-[10px] font-bold uppercase tracking-wider">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Live Pulse
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Global Pulsar Sync</span>
              <span className="text-2xl font-mono font-bold text-white tabular-nums tracking-tighter">
                {currentTime.toLocaleTimeString()}
                <span className="text-sm text-purple-500 ml-1 opacity-70">.{String(msPulse).padStart(3, '0')}</span>
              </span>
            </div>
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
              <span className="text-gray-400 text-sm font-medium mb-1 uppercase tracking-tighter">Total Revenue</span>
              <span className="text-3xl font-bold text-white tracking-tight">
                {formatCurrency(stats?.metrics.totalRevenue || 0)}
              </span>
              <div className="mt-2 text-xs text-green-400 flex items-center gap-1 font-bold">
                <ArrowUpRight size={12} />
                <span>+12.5% INCREMENT</span>
              </div>
            </div>
          </motion.div>

          {/* Users */}
          <motion.div variants={item} className="p-6 rounded-xl bg-gray-900 border border-gray-700/50 shadow-lg relative overflow-hidden group hover:border-blue-500/30 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-blue-500">
              <Users size={48} />
            </div>
            <div className="flex flex-col">
              <span className="text-gray-400 text-sm font-medium mb-1 uppercase tracking-tighter">Total Users</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white">{stats?.metrics.totalUsers}</span>
                <span className="text-xs text-gray-500 font-bold uppercase tracking-tight">({stats?.metrics.totalCustomers} Clients)</span>
              </div>
              <div className="mt-2 text-xs text-blue-400 font-bold uppercase">
                {stats?.lists.recentSignups.length} new delta
              </div>
            </div>
          </motion.div>

          {/* Owners & Lots */}
          <motion.div variants={item} className="p-6 rounded-xl bg-gray-900 border border-gray-700/50 shadow-lg relative overflow-hidden group hover:border-purple-500/30 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-purple-500">
              <Building2 size={48} />
            </div>
            <div className="flex flex-col">
              <span className="text-gray-400 text-sm font-medium mb-1 uppercase tracking-tighter">Parking Network</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white">{stats?.metrics.totalParkingLots || 0}</span>
                <span className="text-xs text-gray-500 font-bold uppercase tracking-tight">Zones</span>
              </div>
              <div className="mt-2 text-xs text-purple-400 flex items-center gap-2 font-bold uppercase">
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
              <span className="text-gray-400 text-sm font-medium mb-1 uppercase tracking-tighter">Pending Actions</span>
              <span className="text-3xl font-bold text-white">{stats?.metrics.pendingOwnerApprovals || 0}</span>
              <div className="mt-2 text-xs text-yellow-400 font-bold uppercase">
                Priority KYC Reviews
              </div>
              {stats?.metrics && stats.metrics.pendingOwnerApprovals > 0 && (
                <Link href="/dashboard/admin/owners" className="absolute bottom-4 right-4 text-[10px] font-bold uppercase bg-yellow-500/10 text-yellow-400 px-3 py-1.5 rounded-full border border-yellow-500/20 hover:bg-yellow-500/20 transition-colors">
                   Actions Required →
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
            className="lg:col-span-2 bg-gray-900/50 border border-gray-800 rounded-2xl p-6 backdrop-blur-sm"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-white uppercase tracking-tight flex items-center gap-2">
                <Clock size={18} className="text-blue-400" />
                Live Transaction Log
              </h2>
              <Link href="/dashboard/admin/bookings" className="text-[10px] font-bold uppercase text-blue-400 hover:text-blue-300 tracking-widest border-b border-blue-400/20 pb-0.5">
                Full Database →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-[10px] font-bold text-gray-500 uppercase bg-gray-800/50 tracking-widest">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">User</th>
                    <th className="px-4 py-3">Zone</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 rounded-r-lg text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {stats?.lists.recentBookings.map((booking: any) => (
                    <tr key={booking.id} className="hover:bg-gray-800/30 transition-colors group">
                      <td className="px-4 py-4 font-semibold text-gray-200">{booking.customer}</td>
                      <td className="px-4 py-4 text-gray-400 text-xs font-bold uppercase">{booking.parkingLot}</td>
                      <td className="px-4 py-4 text-gray-200 font-mono font-bold">{formatCurrency(booking.amount)}</td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight ${booking.status === 'COMPLETED' ? 'bg-green-500/10 text-green-400' :
                            booking.status === 'ACTIVE' ? 'bg-blue-500/10 text-blue-400' :
                              booking.status === 'UPCOMING' ? 'bg-purple-500/10 text-purple-400' :
                                'bg-gray-700 text-gray-400'
                          }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-gray-500 text-xs text-right font-mono">
                        {new Date(booking.date).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                  {(!stats?.lists.recentBookings || stats.lists.recentBookings.length === 0) && (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-gray-500 uppercase text-[10px] font-bold tracking-[0.2em]">Zero transactions found in current cycle</td>
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
              className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 backdrop-blur-sm"
            >
              <h2 className="text-lg font-bold text-white uppercase tracking-tight mb-4 flex items-center gap-2">
                <Activity size={18} className="text-purple-400" />
                Control center
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/dashboard/admin/users" className="p-4 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl text-center transition-all border border-gray-700/50 group">
                  <Users className="mx-auto mb-2 text-blue-400 group-hover:scale-110 transition-transform" size={20} />
                  <span className="text-[10px] font-bold uppercase text-gray-300 tracking-wider">Clients</span>
                </Link>
                <Link href="/dashboard/admin/owners" className="p-4 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl text-center transition-all border border-gray-700/50 group">
                  <Building2 className="mx-auto mb-2 text-purple-400 group-hover:scale-110 transition-transform" size={20} />
                  <span className="text-[10px] font-bold uppercase text-gray-300 tracking-wider">Partners</span>
                </Link>
                <Link href="/dashboard/admin/finance" className="p-4 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl text-center transition-all border border-gray-700/50 group">
                  <CreditCard className="mx-auto mb-2 text-green-400 group-hover:scale-110 transition-transform" size={20} />
                  <span className="text-[10px] font-bold uppercase text-gray-300 tracking-wider">Treasury</span>
                </Link>
                <Link href="/dashboard/admin/incidents" className="p-4 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl text-center transition-all border border-gray-700/50 group">
                  <AlertCircle className="mx-auto mb-2 text-red-400 group-hover:scale-110 transition-transform" size={20} />
                  <span className="text-[10px] font-bold uppercase text-gray-300 tracking-wider">Alerts</span>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 backdrop-blur-sm"
            >
              <h2 className="text-lg font-bold text-white uppercase tracking-tight mb-4 flex items-center gap-2">
                <CheckCircle size={18} className="text-green-400" />
                Real-time ingest
              </h2>
              <div className="space-y-4">
                {stats?.lists.recentSignups.map((user: any) => (
                  <div key={user.id} className="flex items-center justify-between border-b border-gray-800/50 pb-3 last:border-0 last:pb-0 group">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black ring-2 ring-gray-800 group-hover:ring-gray-700 transition-all ${user.role === 'OWNER' ? 'bg-purple-900/30 text-purple-400' : 'bg-blue-900/30 text-blue-400'
                        }`}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-200">{user.name}</div>
                        <div className="text-[10px] text-gray-500 font-mono">{user.email}</div>
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-600 font-bold font-mono">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Footnote Sync Info */}
        <div className="pt-8 flex items-center justify-between opacity-30 select-none">
          <p className="text-[9px] font-bold uppercase tracking-[0.4em]">Integrated Security Node • 0.001s Latency Threshold</p>
          <div className="flex items-center gap-2">
             <div className="w-1 h-1 rounded-full bg-blue-500" />
             <div className="w-1 h-1 rounded-full bg-blue-500 opacity-50" />
             <div className="w-1 h-1 rounded-full bg-blue-500 opacity-20" />
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
