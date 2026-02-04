"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { isAdmin } from "@/lib/role"
import { OnlinePulse } from "@/components/ui/OnlinePulse"
import { CountUp } from "@/components/ui/CountUp"

export default function AdminDashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const [health, setHealth] = useState<any>(null)
  const [activity, setActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Redirect if not admin
    if (session?.user && !isAdmin(session.user.role)) {
      router.push("/dashboard")
    }
  }, [session, router])

  useEffect(() => {
    // Fetch system health and activity data
    const fetchData = async () => {
      try {
        const [healthRes, activityRes] = await Promise.all([
          fetch("/api/admin/health"),
          fetch("/api/admin/activity")
        ])
        
        if (healthRes.ok) {
          const healthData = await healthRes.json()
          setHealth(healthData)
        }
        
        if (activityRes.ok) {
          const activityData = await activityRes.json()
          setActivity(activityData)
        }
      } catch (error) {
        console.error("Error fetching admin data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (!session?.user || !isAdmin(session.user.role)) {
    return <div className="p-4 text-center text-gray-400">Access denied. Admin only.</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <div className="flex items-center gap-2 mt-2">
              <OnlinePulse />
              <span className="text-sm text-gray-400">System Status</span>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
          >
            Logout
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-800 p-6 rounded-lg border border-gray-700 animate-pulse">
                <div className="h-4 bg-gray-700 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-700 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <p className="text-gray-400 text-sm">Database Status</p>
              <p className="text-2xl font-bold text-white mt-2">
                <span className={`${health?.db === "online" ? "text-green-400" : "text-red-400"}`}>
                  {health?.db}
                </span>
              </p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <p className="text-gray-400 text-sm">WebSocket Status</p>
              <p className="text-2xl font-bold text-white mt-2">
                <span className={`${health?.websocket === "online" ? "text-green-400" : "text-red-400"}`}>
                  {health?.websocket}
                </span>
              </p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <p className="text-gray-400 text-sm">Users Online</p>
              <p className="text-2xl font-bold text-white mt-2">
                <CountUp value={health?.usersOnline || 0} />
              </p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <p className="text-gray-400 text-sm">CPU Usage</p>
              <p className="text-2xl font-bold text-white mt-2">{health?.cpu}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">System Health</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Database Connection</span>
                <span className={`px-2 py-1 rounded text-xs ${health?.db === "online" ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400"}`}>
                  {health?.db}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">WebSocket Service</span>
                <span className={`px-2 py-1 rounded text-xs ${health?.websocket === "online" ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400"}`}>
                  {health?.websocket}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Active Users</span>
                <span className="text-white">{health?.usersOnline || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">CPU Load</span>
                <span className="text-white">{health?.cpu}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="border-l-2 border-gray-700 pl-4 animate-pulse">
                    <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                  </div>
                ))
              ) : (
                activity.map((log) => (
                  <div key={log.id} className="border-l-2 border-purple-500 pl-4">
                    <p className="text-sm text-gray-300">{log.action}</p>
                    <span className="text-xs text-gray-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">Admin Info</h2>
          <div className="text-gray-300 space-y-2">
            <p><span className="text-gray-400">Name:</span> {session.user.email}</p>
            <p><span className="text-gray-400">Email:</span> {session.user.email}</p>
            <p><span className="text-gray-400">Role:</span> <span className="text-purple-400 font-semibold">{session.user.role}</span></p>
          </div>
        </div>

        <div className="mt-8 bg-blue-900/20 border border-blue-700 p-4 rounded-lg">
          <p className="text-blue-300 text-sm">
            💡 Admin features (user management, booking reports, revenue analytics) coming soon!
          </p>
        </div>
      </div>
    </div>
  )
}
