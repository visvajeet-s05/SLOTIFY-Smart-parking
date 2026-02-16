"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Building2, CheckCircle, XCircle, Search, FileText } from "lucide-react"
import DashboardShell from "@/components/ui/DashboardShell"
import Link from "next/link"

interface OwnerVerification {
  id: string
  ownerId: string
  businessName: string
  documentType: string
  documentUrl: string
  status: string
  createdAt: string
  owner: {
    user: {
      name: string
      email: string
    }
  }
}

export default function AdminOwnersPage() {
  const [verifications, setVerifications] = useState<OwnerVerification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("ALL")

  useEffect(() => {
    fetchVerifications()
  }, [])

  async function fetchVerifications() {
    try {
      const res = await fetch("/api/admin/owners/verifications")
      if (res.ok) {
        const data = await res.json()
        setVerifications(data)
      }
    } catch (error) {
      console.error("Failed to fetch verifications", error)
    } finally {
      setLoading(false)
    }
  }

  async function approve(id: string) {
    // Optimistic Update
    setVerifications(prev => prev.map(v => v.id === id ? { ...v, status: 'APPROVED' } : v))
    const res = await fetch(`/api/admin/owners/verifications/${id}/approve`, { method: "POST" })
    if (!res.ok) fetchVerifications() // Revert on failure
  }

  async function reject(id: string) {
    // Optimistic Update
    setVerifications(prev => prev.map(v => v.id === id ? { ...v, status: 'REJECTED' } : v))
    const res = await fetch(`/api/admin/owners/verifications/${id}/reject`, { method: "POST" })
    if (!res.ok) fetchVerifications()
  }

  const filteredVerifications = verifications.filter(v => {
    if (filter === "ALL") return true
    return v.status === filter
  })

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
      <div className="max-w-7xl mx-auto space-y-6 pt-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
              <Building2 className="text-purple-400" />
              Owner Management
            </h1>
            <p className="text-gray-400 mt-1">
              Verify business documents and manage owner accounts.
            </p>
          </div>

          <div className="flex bg-gray-900 rounded-lg p-1 border border-gray-800">
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === f
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
              >
                {f}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden backdrop-blur-sm"
        >
          {filteredVerifications.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Search className="mx-auto h-12 w-12 text-gray-700 mb-4" />
              <p className="text-lg font-medium">No owners found</p>
              <p className="text-sm">Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-800/50 text-gray-400 uppercase text-xs font-semibold">
                  <tr>
                    <th className="px-6 py-4">Owner</th>
                    <th className="px-6 py-4">Business</th>
                    <th className="px-6 py-4">Documents</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filteredVerifications.map((v) => (
                    <tr key={v.id} className="hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{v.owner.user.name}</div>
                        <div className="text-gray-500 text-xs">{v.owner.user.email}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {v.businessName || "—"}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={v.documentUrl}
                          target="_blank"
                          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-xs bg-blue-500/10 px-3 py-1.5 rounded-full w-fit"
                        >
                          <FileText size={14} />
                          {v.documentType}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${v.status === 'APPROVED' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                            v.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                              'bg-red-500/10 text-red-400 border-red-500/20'
                          }`}>
                          {v.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {v.status === "PENDING" && (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => approve(v.id)}
                              className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors"
                              title="Approve"
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button
                              onClick={() => reject(v.id)}
                              className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <XCircle size={18} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
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
