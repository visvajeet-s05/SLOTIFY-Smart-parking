"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { MapPin, Car, User, Calendar, Search } from "lucide-react"
import DashboardShell from "@/components/ui/DashboardShell"

interface ParkingLot {
  id: string
  name: string
  address: string
  status: string
  ownerName: string
  ownerEmail: string
  totalSlots: number
  totalBookings: number
  activeSlots: number
  createdAt: string
  coordinates: { lat: number; lng: number }
}

export default function AdminParkingLotsPage() {
  const [lots, setLots] = useState<ParkingLot[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    async function fetchLots() {
      try {
        const res = await fetch("/api/admin/parking-lots")
        if (res.ok) {
          const data = await res.json()
          setLots(data)
        }
      } catch (error) {
        console.error("Failed to fetch parking lots", error)
      } finally {
        setLoading(false)
      }
    }
    fetchLots()
  }, [])

  const filteredLots = lots.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.address.toLowerCase().includes(search.toLowerCase()) ||
    l.ownerName.toLowerCase().includes(search.toLowerCase())
  )

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <DashboardShell>
      <div className="max-w-7xl mx-auto space-y-6 pt-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
              <MapPin className="text-red-400" />
              Parking Lots Network
            </h1>
            <p className="text-gray-400 mt-1">
              Oversee all registered parking locations and their status.
            </p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search locations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-gray-900 border border-gray-800 text-white pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm w-64 placeholder-gray-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-900/50 h-64 rounded-xl animate-pulse border border-gray-800" />
            ))}
          </div>
        ) : filteredLots.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <MapPin className="mx-auto h-12 w-12 text-gray-700 mb-4" />
            <p className="text-lg font-medium">No parking lots found</p>
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredLots.map((lot) => (
              <motion.div
                key={lot.id}
                variants={item}
                className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-all hover:shadow-lg hover:shadow-red-900/10 backdrop-blur-sm group"
              >
                {/* Map Placeholder or Image */}
                <div className="h-32 bg-gray-800 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent z-10" />
                  <img
                    src={`https://maps.googleapis.com/maps/api/staticmap?center=${lot.coordinates.lat},${lot.coordinates.lng}&zoom=14&size=600x300&maptype=roadmap&markers=color:red%7C${lot.coordinates.lat},${lot.coordinates.lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
                    alt="Map"
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity transform group-hover:scale-105 duration-500"
                  />
                  <div className="absolute top-3 right-3 z-20">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${lot.status === 'ACTIVE' ? 'bg-green-500/90 text-white shadow-lg' :
                        'bg-gray-500/90 text-white'
                      }`}>
                      {lot.status}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white truncate">{lot.name}</h3>
                    <div className="flex items-center gap-1 text-gray-400 text-xs mt-1 truncate">
                      <MapPin size={12} />
                      {lot.address}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-gray-800 pt-4">
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500">Total Slots</span>
                      <div className="flex items-center gap-1.5 text-white font-medium">
                        <Car size={14} className="text-blue-400" />
                        {lot.totalSlots}
                        <span className="text-xs text-gray-600">({lot.activeSlots} active)</span>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500">Total Bookings</span>
                      <div className="flex items-center gap-1.5 text-white font-medium">
                        <Calendar size={14} className="text-purple-400" />
                        {lot.totalBookings}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-400">
                      {lot.ownerName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm text-gray-300 truncate">{lot.ownerName}</p>
                      <p className="text-xs text-gray-500 truncate">{lot.ownerEmail}</p>
                    </div>
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
