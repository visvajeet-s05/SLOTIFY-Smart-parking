"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft, Car, Clock, DollarSign, Shield, Camera,
  Info, X, Wifi, WifiOff, MapPin, Zap, Navigation,
  CreditCard, Battery, Accessibility
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

const WS_URL = "ws://localhost:4000"

// Define types based on Prisma schema and API response
interface ParkingSlot {
  id: string
  slotNumber: number
  label?: string // Optional, fallback to slotNumber
  status: "AVAILABLE" | "OCCUPIED" | "RESERVED" | "DISABLED" // Uppercase from DB usually
  type: "STANDARD" | "COMPACT" | "LARGE" | "HANDICAP" | "EV"
  price?: number
  updatedBy?: string
  lastUpdate?: string
}

interface ParkingLocation {
  id: string
  name: string
  address?: string
  totalSlots: number
  availableSlots: number
  pricePerHour: number
  features: string[]
  slots: ParkingSlot[]
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
}

export default function ParkingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [location, setLocation] = useState<ParkingLocation | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [hours, setHours] = useState(2) // Default 2 hours
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const wsRef = useRef<WebSocket | null>(null)
  const selectedSlotRef = useRef<ParkingSlot | null>(null)

  // Keep ref in sync
  useEffect(() => {
    selectedSlotRef.current = selectedSlot
  }, [selectedSlot])

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const res = await fetch(`/api/parking/${id}/slots`)

        if (!res.ok) {
          if (res.status === 404) {
            toast.error("Parking lot not found")
            router.push("/dashboard")
            return
          }
          throw new Error("Failed to fetch data")
        }

        const data = await res.json()

        // Transform the data to match our interface
        const apiSlots = data.slots || []
        const apiLot = data.lot || {}

        // Mock features if not present
        const features = apiLot.features || ["24/7 Access", "CCTV Surveillance", "Covered Parking", "Security Guard"]
        const price = apiLot.pricePerHour || 20 // Default price if missing

        const availableCount = apiSlots.filter((s: any) => s.status === "AVAILABLE" || s.status === "available").length

        setLocation({
          id: apiLot.id,
          name: apiLot.name || "Unknown Parking Lot",
          address: apiLot.address || "Location details unavailable",
          totalSlots: apiLot.totalSlots || apiSlots.length,
          availableSlots: availableCount,
          pricePerHour: price,
          features: features,
          slots: apiSlots.map((s: any) => ({
            ...s,
            status: s.status.toUpperCase(), // Ensure consistency
            label: s.label || s.slotNumber.toString()
          }))
        })
      } catch (error) {
        console.error("Error fetching parking data:", error)
        toast.error("Failed to load parking details. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchData()
    }
  }, [id, router])

  // WebSocket Connection
  useEffect(() => {
    if (!id) return

    const connectWS = () => {
      if (wsRef.current?.readyState === WebSocket.OPEN) return

      const ws = new WebSocket(WS_URL)
      wsRef.current = ws

      ws.onopen = () => {
        console.log("🟢 Connected to live updates")
        setIsConnected(true)
        ws.send(JSON.stringify({
          type: "SUBSCRIBE",
          lotId: id,
          role: "CUSTOMER"
        }))
      }

      ws.onmessage = (event) => {
        try {
          const update = JSON.parse(event.data)

          if (update.type === "SLOT_UPDATE" || update.slotNumber !== undefined) {
            setLocation(prev => {
              if (!prev) return prev

              const updatedSlots = prev.slots.map(slot => {
                if (slot.slotNumber === update.slotNumber) {
                  return { ...slot, status: update.status.toUpperCase() as any }
                }
                return slot
              })

              const newAvailableCount = updatedSlots.filter(s => s.status === "AVAILABLE").length

              return {
                ...prev,
                slots: updatedSlots,
                availableSlots: newAvailableCount
              }
            })

            // Check if selected slot was affected
            if (selectedSlotRef.current?.slotNumber === update.slotNumber &&
              update.status.toUpperCase() !== "AVAILABLE") {
              toast.warning(`Slot ${update.slotNumber} is no longer available`)
              setShowBookingModal(false)
              setSelectedSlot(null)
            }
          }
        } catch (err) {
          console.error("WS Parse error:", err)
        }
      }

      ws.onclose = () => {
        setIsConnected(false)
        wsRef.current = null
        // Reconnect logic could go here
      }

      ws.onerror = (err) => {
        console.error("WS Error:", err)
        setIsConnected(false)
      }
    }

    connectWS()

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [id])

  const handleSlotClick = (slot: ParkingSlot) => {
    if (slot.status === "AVAILABLE") {
      setSelectedSlot(slot)
      setShowBookingModal(true)
    } else {
      toast.info(`Slot ${slot.label} is currently ${slot.status.toLowerCase()}`)
    }
  }

  const handleBooking = () => {
    if (!selectedSlot || !location) return
    router.push(`/booking/confirm?slotId=${selectedSlot.id}&locationId=${location.id}&hours=${hours}`)
  }

  const getSlotColor = (status: string) => {
    const s = status.toUpperCase()
    switch (s) {
      case "AVAILABLE": return "bg-emerald-500/20 border-emerald-500/50 hover:bg-emerald-500/40 text-emerald-400 cursor-pointer"
      case "OCCUPIED": return "bg-red-500/20 border-red-500/50 text-red-400 cursor-not-allowed"
      case "RESERVED": return "bg-amber-500/20 border-amber-500/50 text-amber-400 cursor-not-allowed"
      case "DISABLED": return "bg-slate-800/50 border-slate-700 text-slate-500 cursor-not-allowed"
      default: return "bg-slate-800 border-slate-700"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  if (isLoading || !location) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        <p className="text-zinc-400 animate-pulse">Connecting to parking network...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-20">
      {/* Immersive Header */}
      <div className="relative h-48 md:h-64 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 via-purple-900/30 to-black z-0" />
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20 z-0" />

        <div className="absolute top-4 left-4 z-10">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="hover:bg-white/10 rounded-full text-white">
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </Link>
        </div>

        <div className="container mx-auto h-full flex flex-col justify-end px-4 pb-6 relative z-10">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Badge variant="outline" className={`mb-2 ${isConnected ? 'border-emerald-500 text-emerald-400' : 'border-rose-500 text-rose-400'} bg-black/50 backdrop-blur-md`}>
              {isConnected ? (
                <span className="flex items-center gap-1.5"><Wifi className="h-3 w-3" /> Live Updates</span>
              ) : (
                <span className="flex items-center gap-1.5"><WifiOff className="h-3 w-3" /> Offline</span>
              )}
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              {location.name}
            </h1>
            <div className="flex items-center gap-2 text-gray-400 mt-2">
              <MapPin className="h-4 w-4" />
              <p className="max-w-xl truncate">{location.address}</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column: Stats & Info */}
          <div className="space-y-6 lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-2 gap-4"
            >
              <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <span className="text-zinc-400 text-xs uppercase tracking-wider mb-1">Available</span>
                  <div className="text-3xl font-bold text-emerald-400">{location.availableSlots}</div>
                  <span className="text-zinc-500 text-xs">of {location.totalSlots} spots</span>
                </CardContent>
              </Card>
              <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <span className="text-zinc-400 text-xs uppercase tracking-wider mb-1">Rate</span>
                  <div className="text-3xl font-bold text-indigo-400">₹{location.pricePerHour}</div>
                  <span className="text-zinc-500 text-xs">per hour</span>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden">
                <CardContent className="p-0">
                  <Tabs defaultValue="features" className="w-full">
                    <TabsList className="w-full rounded-none bg-zinc-900 p-0 h-10 border-b border-zinc-800">
                      <TabsTrigger value="features" className="flex-1 rounded-none data-[state=active]:bg-zinc-800 data-[state=active]:text-white h-full border-r border-zinc-800 text-xs uppercase tracking-wider">Features</TabsTrigger>
                      <TabsTrigger value="info" className="flex-1 rounded-none data-[state=active]:bg-zinc-800 data-[state=active]:text-white h-full text-xs uppercase tracking-wider">Details</TabsTrigger>
                    </TabsList>
                    <div className="p-4 min-h-[150px]">
                      <TabsContent value="features" className="mt-0">
                        <div className="flex flex-wrap gap-2">
                          {location.features.map((feature, i) => (
                            <Badge key={i} variant="secondary" className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </TabsContent>
                      <TabsContent value="info" className="mt-0 space-y-3 text-sm text-zinc-400">
                        <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                          <span className="flex items-center gap-2"><Clock className="h-4 w-4" /> Hours</span>
                          <span>24/7 Open</span>
                        </div>
                        <div className="flex justify-between items-center pt-1">
                          <span className="flex items-center gap-2"><Shield className="h-4 w-4" /> Security</span>
                          <span>Patrolled</span>
                        </div>
                      </TabsContent>
                    </div>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column: Slot Selection */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Car className="h-5 w-5 text-indigo-400" />
                Select Spot
              </h2>
              <div className="flex flex-wrap gap-3 text-xs text-zinc-400 bg-zinc-900/50 p-2 rounded-lg border border-zinc-800">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div> <span className="hidden sm:inline">Available</span><span className="sm:hidden">Open</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div> <span className="hidden sm:inline">Occupied</span><span className="sm:hidden">Busy</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div> <span className="hidden sm:inline">Reserved</span><span className="sm:hidden">Rsvd</span>
                </div>
              </div>
            </div>

            <Card className="bg-zinc-900 border-zinc-800 overflow-hidden relative min-h-[400px]">
              {/* Decorative driveway elements */}
              <div className="absolute inset-x-0 top-1/2 h-20 bg-zinc-950/30 -translate-y-1/2 z-0 border-y border-dashed border-zinc-800 pointer-events-none" />

              <CardContent className="p-6 relative z-10">
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3"
                >
                  {location.slots.map((slot) => (
                    <motion.button
                      key={slot.id}
                      variants={itemVariants}
                      whileHover={slot.status === "AVAILABLE" ? { scale: 1.05, y: -2 } : {}}
                      whileTap={slot.status === "AVAILABLE" ? { scale: 0.95 } : {}}
                      onClick={() => handleSlotClick(slot)}
                      disabled={slot.status !== "AVAILABLE"}
                      className={`
                           relative aspect-[3/4] rounded-lg border flex flex-col items-center justify-between p-2 transition-all duration-300
                           ${getSlotColor(slot.status)}
                           ${selectedSlot?.id === slot.id ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-900 bg-emerald-500 text-white border-emerald-400 !scale-105 z-10 shadow-lg shadow-emerald-900/20' : ''}
                         `}
                    >
                      <span className="text-xs font-medium opacity-70">{slot.label}</span>

                      {/* Icon based on type */}
                      <div className="flex-1 flex items-center justify-center">
                        {slot.type === 'EV' && <Zap className="h-4 w-4" />}
                        {slot.type === 'HANDICAP' && <Accessibility className="h-4 w-4" />}
                        {slot.type === 'COMPACT' && <span className="text-[10px] font-bold">S</span>}
                        {!['EV', 'HANDICAP', 'COMPACT'].includes(slot.type) && <Car className="h-4 w-4 opacity-50" />}
                      </div>

                      {selectedSlot?.id === slot.id && (
                        <motion.div layoutId="selection" className="absolute inset-0 border-2 border-white rounded-lg pointer-events-none" />
                      )}
                    </motion.button>
                  ))}
                </motion.div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Booking Modal/Drawer */}
      <AnimatePresence>
        {showBookingModal && selectedSlot && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
              onClick={() => setShowBookingModal(false)}
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: "0%" }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 z-[70] bg-zinc-900 border-t border-zinc-800 rounded-t-3xl shadow-2xl md:max-w-xl md:mx-auto md:bottom-4 md:rounded-2xl md:border md:inset-x-auto md:w-full"
            >
              <div className="w-12 h-1.5 bg-zinc-800 rounded-full mx-auto mt-4 mb-2 md:hidden" />

              <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <Badge variant="outline" className="mb-2 border-emerald-500/50 text-emerald-400 bg-emerald-500/10">
                      Ready to Book
                    </Badge>
                    <h3 className="text-2xl font-bold">Slot {selectedSlot.label || selectedSlot.slotNumber}</h3>
                    <p className="text-zinc-400 text-sm max-w-[200px] truncate">{location.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-zinc-500 uppercase tracking-wide">Rate</p>
                    <p className="text-xl font-bold">₹{location.pricePerHour}<span className="text-sm font-normal text-zinc-500">/hr</span></p>
                  </div>
                </div>

                <Separator className="bg-zinc-800" />

                {/* Duration Slider/Controls */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-zinc-300">Duration Needed</label>
                    <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                      {hours} Hr
                    </span>
                  </div>

                  <div className="flex items-center gap-4 bg-zinc-950/50 p-2 rounded-xl border border-zinc-800">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 text-white hover:bg-zinc-800"
                      onClick={() => setHours(h => Math.max(1, h - 1))}
                      disabled={hours <= 1}
                    >
                      -
                    </Button>
                    <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden relative">
                      <motion.div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 absolute left-0 top-0 bottom-0"
                        initial={{ width: 0 }}
                        animate={{ width: `${(hours / 12) * 100}%` }}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 text-white hover:bg-zinc-800"
                      onClick={() => setHours(h => Math.min(12, h + 1))}
                      disabled={hours >= 12}
                    >
                      +
                    </Button>
                  </div>
                </div>

                {/* Cost Breakdown */}
                <div className="bg-zinc-950 rounded-xl p-4 space-y-2 border border-zinc-800">
                  <div className="flex justify-between text-sm text-zinc-400">
                    <span>Rate (x{hours})</span>
                    <span>{formatCurrency(location.pricePerHour * hours)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-zinc-400">
                    <span>Service Fee</span>
                    <span>{formatCurrency(10)}</span>
                  </div>
                  <Separator className="bg-zinc-800 my-2" />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total Payable</span>
                    <span>{formatCurrency((location.pricePerHour * hours) + 10)}</span>
                  </div>
                </div>

                {/* Action Button */}
                <div className="space-y-3 pt-2">
                  <Button
                    size="lg"
                    className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-900/20 rounded-xl"
                    onClick={handleBooking}
                  >
                    Confirm & Pay {formatCurrency((location.pricePerHour * hours) + 10)}
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full text-zinc-500 hover:text-zinc-300 hover:bg-transparent"
                    onClick={() => setShowBookingModal(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
