"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Users, User, ShieldCheck, Search, Filter, Building2, UserCircle } from "lucide-react"
import DashboardShell from "@/components/ui/DashboardShell"

interface UserProfile {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
  walletBalance: number
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [filterRole, setFilterRole] = useState("ALL")
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetchUsers()
  }, [filterRole])

  async function fetchUsers() {
    setLoading(true)
    try {
      let url = "/api/admin/users"
      const params = new URLSearchParams()
      if (filterRole !== "ALL") params.append("role", filterRole)
      if (search) params.append("search", search)

      const res = await fetch(`${url}?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setUsers(data)
      }
    } catch (error) {
      console.error("Failed to fetch users", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchUsers()
  }

  const filteredUsers = users.filter((u) => {
    if (!search) return true
    return (
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
    )
  })

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <DashboardShell>
      <div className="max-w-7xl mx-auto space-y-6 pt-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
              <Users className="text-blue-400" />
              User Management
            </h1>
            <p className="text-gray-400 mt-1">
              Manage all platform users, including customers, owners, and admins.
            </p>
          </div>

          <div className="flex bg-gray-900 rounded-lg p-1 border border-gray-800">
            {['ALL', 'CUSTOMER', 'OWNER', 'ADMIN'].map((role) => (
              <button
                key={role}
                onClick={() => setFilterRole(role)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filterRole === role
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
              >
                {role === 'ALL' ? 'All Users' : role.charAt(0) + role.slice(1).toLowerCase() + 's'}
              </button>
            ))}
          </div>
        </div>

        {/* Search & Actions */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 flex flex-col sm:flex-row gap-4 backdrop-blur-sm">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search by name or email..."
              className="w-full bg-gray-800 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none placeholder-gray-500 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Filter size={16} />
            <span>{filteredUsers.length} results found</span>
          </div>
        </div>

        {/* User Table */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden backdrop-blur-sm shadow-xl"
        >
          {loading ? (
            <div className="p-12 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Search className="mx-auto h-12 w-12 text-gray-700 mb-4" />
              <p className="text-lg font-medium">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-800/50 text-gray-400 uppercase text-xs font-semibold border-b border-gray-800">
                  <tr>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Joined</th>
                    <th className="px-6 py-4 text-right">Wallet Balance</th>
                    <th className="px-6 py-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filteredUsers.map((user) => (
                    <motion.tr
                      key={user.id}
                      variants={item}
                      className="hover:bg-gray-800/30 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shadow-inner ${user.role === 'ADMIN' ? 'bg-purple-900 text-purple-200 ring-2 ring-purple-500/20' :
                            user.role === 'OWNER' ? 'bg-indigo-900 text-indigo-200 ring-2 ring-indigo-500/20' :
                              'bg-blue-900 text-blue-200 ring-2 ring-blue-500/20'
                            }`}>
                            {user.name?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div>
                            <div className="font-medium text-white group-hover:text-blue-400 transition-colors">{user.name}</div>
                            <div className="text-gray-500 text-xs">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border flex w-fit items-center gap-1.5 ${user.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                          user.role === 'OWNER' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                            'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          }`}>
                          {user.role === 'ADMIN' && <ShieldCheck size={12} />}
                          {user.role === 'OWNER' && <Building2 size={12} />} // Note: Building2 dependency needs fixing or replacement
                          {user.role === 'CUSTOMER' && <User size={12} />}
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-xs">
                        {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-green-400">
                        ${user.walletBalance?.toFixed(2) || "0.00"}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="w-2 h-2 rounded-full bg-green-500 inline-block mr-2" />
                        <span className="text-xs text-gray-400">Active</span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </DashboardShell>
  )
}
