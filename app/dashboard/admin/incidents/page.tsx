"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { AlertCircle, CheckCircle, Clock, User, MessageSquare } from "lucide-react"
import DashboardShell from "@/components/ui/DashboardShell"

interface Incident {
    id: string
    type: string
    title: string
    description: string
    status: string
    reporter: string
    email: string
    createdAt: string
}

export default function AdminIncidentsPage() {
    const [incidents, setIncidents] = useState<Incident[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState("ALL")

    useEffect(() => {
        fetchIncidents()
    }, [filter])

    async function fetchIncidents() {
        setLoading(true)
        try {
            const url = filter === "ALL" ? "/api/admin/incidents" : `/api/admin/incidents?status=${filter}`
            const res = await fetch(url)
            if (res.ok) {
                const data = await res.json()
                setIncidents(data)
            }
        } catch (error) {
            console.error("Failed to fetch incidents", error)
        } finally {
            setLoading(false)
        }
    }

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    }

    const item = {
        hidden: { opacity: 0, x: -20 },
        show: { opacity: 1, x: 0 }
    }

    return (
        <DashboardShell>
            <div className="max-w-7xl mx-auto space-y-6 pt-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                            <AlertCircle className="text-red-400" />
                            Incidents & Reports
                        </h1>
                        <p className="text-gray-400 mt-1">
                            Manage reported issues from owners and parking operators.
                        </p>
                    </div>

                    <div className="flex bg-gray-900 rounded-lg p-1 border border-gray-800">
                        {['ALL', 'OPEN', 'RESOLVED'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === f
                                        ? 'bg-red-600 text-white shadow-lg'
                                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-gray-900/50 h-24 rounded-xl animate-pulse border border-gray-800" />
                        ))}
                    </div>
                ) : incidents.length === 0 ? (
                    <div className="p-12 text-center text-gray-500 bg-gray-900/50 border border-gray-800 rounded-xl">
                        <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                        <p className="text-lg font-medium text-gray-300">All clear!</p>
                        <p className="text-sm">No incidents found matching your filter.</p>
                    </div>
                ) : (
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="space-y-4"
                    >
                        {incidents.map((incident) => (
                            <motion.div
                                key={incident.id}
                                variants={item}
                                className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors backdrop-blur-sm relative group"
                            >
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${incident.type === 'OWNER_ISSUE' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                                                    'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                                                }`}>
                                                {incident.type.replace('_', ' ')}
                                            </span>
                                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                                <Clock size={12} />
                                                {new Date(incident.createdAt).toLocaleString()}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                                            {incident.title}
                                        </h3>
                                        <p className="text-gray-400 text-sm mt-2 line-clamp-2">
                                            {incident.description}
                                        </p>

                                        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-800/50">
                                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                                <User size={14} />
                                                Reported by <span className="text-gray-300 font-medium">{incident.reporter}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                                <MessageSquare size={14} />
                                                {incident.email}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-2 min-w-[100px]">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${incident.status === 'RESOLVED' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                incident.status === 'OPEN' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                    'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                            }`}>
                                            {incident.status}
                                        </span>
                                        {incident.status === 'OPEN' && (
                                            <button className="text-xs text-blue-400 hover:text-blue-300 underline mt-2">
                                                Mark Resolved
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </DashboardShell>
    )
}
