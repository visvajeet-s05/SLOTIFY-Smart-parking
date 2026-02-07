"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Car, Clock, DollarSign, Shield, Camera, Info, X, Wifi, WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { parkingAreas } from "@/data/parking"

const WS_URL = "ws://localhost:4000"

// Define parking slot interface
interface ParkingSlot {
  id: number
  slotNumber: number
  label: string
  status: "available" | "occupied" | "reserved" | "disabled"
  type?: "standard" | "compact" | "large" | "handicap" | "ev"
  price?: number
}

// Define parking location interface
interface ParkingLocation {
  id: string
  name: string
  address: string
  totalSlots: number
  availableSlots: number
  pricePerHour: number
  features: string[]
  slots: ParkingSlot[]
}

export default function ParkingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [parkingLocation, setParkingLocation] = useState<ParkingLocation | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [hours, setHours] = useState(1)
  const [isConnected, setIsConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const selectedSlotRef = useRef<ParkingSlot | null>(null)

  // Fetch initial data
  useEffect(() => {
    const locationData = parkingAreas.find(area => area.id === id)
    if (locationData) {
      fetch(`/api/parking/${id}/slots`)
        .then(res => res.json())
        .then(slots => {
          const availableSlots = slots.filter((slot: ParkingSlot) => slot.status === "available").length
          
          setParkingLocation({
            id: locationData.id,
            name: locationData.name,
            address: locationData.address,
            totalSlots: locationData.totalSpots,
            availableSlots: availableSlots,
            pricePerHour: locationData.price,
            features: locationData.features,
            slots: slots,
          })
        })
    } else {
      router.push("/dashboard")
    }
  }, [id, router])

  // Keep selectedSlotRef in sync with selectedSlot state
  useEffect(() => {
    selectedSlotRef.current = selectedSlot
  }, [selectedSlot])

  // WebSocket connection for real-time updates
  useEffect(() => {
    // ⛔ Prevent duplicate connections
    if (wsRef.current) return

    const ws = new WebSocket(WS_URL)
    wsRef.current = ws

    ws.onopen = () => {
      console.log("✅ Customer connected to WebSocket")
      setIsConnected(true)
      
      // Subscribe to this parking lot
      ws.send(JSON.stringify({
        type: "SUBSCRIBE",
        lotId: id,
        role: "CUSTOMER"
      }))
    }

    ws.onmessage = (event) => {
      try {
        const update = JSON.parse(event.data)
        console.log("📥 Customer received update:", update)

        setParkingLocation((prev) => {
          if (!prev) return prev

          const updatedSlots = prev.slots.map((slot) =>
            slot.slotNumber === update.slotNumber
              ? { ...slot, status: update.status.toLowerCase() as ParkingSlot["status"] }
              : slot
          )

          const availableSlots = updatedSlots.filter(
            (slot) => slot.status === "available"
          ).length

          return {
            ...prev,
            slots: updatedSlots,
            availableSlots,
          }
        })

        // Close modal if selected slot becomes unavailable
        // Use ref to avoid dependency on selectedSlot state
        const currentSelectedSlot = selectedSlotRef.current
        if (currentSelectedSlot?.slotNumber === update.slotNumber && update.status !== "AVAILABLE") {
          setShowBookingModal(false)
          setSelectedSlot(null)
        }
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error)
      }
    }

    ws.onclose = () => {
      console.warn("🔌 Customer disconnected from WebSocket")
      setIsConnected(false)
      wsRef.current = null
    }

    ws.onerror = (error) => {
      console.error("❌ WebSocket error:", error)
      setIsConnected(false)
    }

    return () => {
      ws.close()
      wsRef.current = null
    }
  }, [id]) // ✅ ONLY id - prevents infinite loop when selecting slots

  const handleSlotClick = (slot: ParkingSlot) => {
    if (slot.status === "available") {
      setSelectedSlot(slot)
      setShowBookingModal(true)
    }
  }

  const handleBooking = () => {
    // Simulate booking process
    router.push(`/booking/confirm?slot=${selectedSlot?.id}&location=${id}&hours=${hours}`)
  }

  const getSlotColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-500"
      case "occupied":
        return "bg-red-500"
      case "reserved":
        return "bg-yellow-500"
      case "ev":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  const getSlotCursor = (status: string) => {
    return status === "available" ? "cursor-pointer" : "cursor-not-allowed"
  }

  if (!parkingLocation) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 p-4">
        <div className="container mx-auto">
          <div className="flex items-center">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="mr-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold">{parkingLocation.name}</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4">
        {/* Location Info */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold mb-1">{parkingLocation.name}</h2>
              <p className="text-gray-400 mb-2">{parkingLocation.address}</p>
              <div className="flex flex-wrap gap-2 mb-2">
                {parkingLocation.features.map((feature, index) => (
                  <span key={index} className="bg-gray-800 text-xs px-2 py-1 rounded">
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-start md:items-end">
              <div className="flex items-center gap-2 mb-1">
                <Car className="h-4 w-4 text-purple-400" />
                <span>
                  <span className="font-bold text-green-500">{parkingLocation.availableSlots}</span> /{" "}
                  {parkingLocation.totalSlots} slots available
                </span>
              </div>
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <Wifi className="h-4 w-4 text-green-400" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-400" />
                )}
                <span className="text-sm text-gray-400">
                  {isConnected ? 'Live Updates' : 'Offline'}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="h-4 w-4 text-purple-400" />
                <span>₹{parkingLocation.pricePerHour.toFixed(2)}/hour</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-400" />
                <span>Open 24/7</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="slots" className="mb-6">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="slots">Parking Slots</TabsTrigger>
            <TabsTrigger value="info">Information</TabsTrigger>
          </TabsList>

          <TabsContent value="slots" className="mt-4">
            {/* Legend */}
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                <span className="text-sm">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500"></div>
                <span className="text-sm">Occupied</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                <span className="text-sm">Reserved</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gray-500"></div>
                <span className="text-sm">Disabled</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                <span className="text-sm">EV Charging</span>
              </div>
            </div>

            {/* Parking Grid */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Select a Parking Slot</h3>
              <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
                {parkingLocation.slots.map((slot) => (
                  <motion.div
                    key={slot.id}
                    className={`${getSlotColor(slot.status)} ${getSlotCursor(slot.status)} rounded-md h-12 flex items-center justify-center transition-colors`}
                    whileHover={slot.status === "available" ? { scale: 1.05 } : {}}
                    onClick={() => handleSlotClick(slot)}
                    title={`Slot ${slot.label} - ${slot.type || 'Standard'} - ₹${parkingLocation.pricePerHour}/hr`}
                  >
                    <span className="font-bold text-sm">{slot.label}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="info" className="mt-4">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Parking Information</h3>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Hours of Operation</h4>
                  <p className="text-gray-400">Open 24 hours, 7 days a week</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Pricing</h4>
                  <ul className="text-gray-400 space-y-1">
                    <li>Standard: ₹{parkingLocation.pricePerHour.toFixed(2)}/hour</li>
                    <li>Daily Maximum: ₹240.00</li>
                    <li>Monthly Pass: ₹1,800.00</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Features</h4>
                  <ul className="text-gray-400 space-y-1">
                    {parkingLocation.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Rules & Regulations</h4>
                  <ul className="text-gray-400 space-y-1">
                    <li>No overnight parking without prior arrangement</li>
                    <li>Vehicles must be parked within designated spaces</li>
                    <li>Management not responsible for theft or damage</li>
                    <li>No refunds for unused time</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Booking Modal */}
      <AnimatePresence>
        {showBookingModal && selectedSlot && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 z-40"
              onClick={() => setShowBookingModal(false)}
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: "0%" }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 rounded-t-xl p-6 z-50 max-h-[80vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Book Parking Slot</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowBookingModal(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Slot {selectedSlot.label}</h3>
                    <p className="text-gray-400">{parkingLocation.name}</p>
                  </div>
                  <div className="h-16 w-16 rounded-lg bg-green-500 flex items-center justify-center">
                    <span className="font-bold text-xl">{selectedSlot.label}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Car className="h-4 w-4 text-purple-400" />
                      <span className="text-sm text-gray-400">Type</span>
                    </div>
                    <p className="font-medium capitalize">{selectedSlot.type || 'Standard'}</p>
                  </div>

                  <div className="bg-gray-800 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="h-4 w-4 text-purple-400" />
                      <span className="text-sm text-gray-400">Price</span>
                    </div>
                    <p className="font-medium">₹{parkingLocation.pricePerHour}/hour</p>
                  </div>

                  <div className="bg-gray-800 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="h-4 w-4 text-purple-400" />
                      <span className="text-sm text-gray-400">Security</span>
                    </div>
                    <p className="font-medium">24/7 Surveillance</p>
                  </div>

                  <div className="bg-gray-800 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Camera className="h-4 w-4 text-purple-400" />
                      <span className="text-sm text-gray-400">CCTV</span>
                    </div>
                    <p className="font-medium">Available</p>
                  </div>
                </div>

                <div className="bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-medium mb-3">Duration</h4>
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setHours(Math.max(1, hours - 1))}
                      disabled={hours <= 1}
                    >
                      -
                    </Button>
                    <span className="font-bold text-xl">
                      {hours} {hours === 1 ? "hour" : "hours"}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setHours(Math.min(24, hours + 1))}
                      disabled={hours >= 24}
                    >
                      +
                    </Button>
                  </div>
                </div>

                <div className="bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-medium mb-3">Payment Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Parking Fee</span>
                      <span>₹{(parkingLocation.pricePerHour * hours).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Service Fee</span>
                      <span>₹{(parkingLocation.pricePerHour * hours * 0.1).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Tax</span>
                      <span>₹{(parkingLocation.pricePerHour * hours * 0.08).toFixed(2)}</span>
                    </div>
                    <div className="border-t border-gray-700 my-2 pt-2 flex justify-between font-bold">
                      <span>Total</span>
                      <span>₹{(parkingLocation.pricePerHour * hours * 1.18).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-6 text-lg"
                  onClick={handleBooking}
                >
                  Book Now
                </Button>

                <div className="flex items-center gap-2 text-sm text-gray-400 justify-center">
                  <Info className="h-4 w-4" />
                  <span>You won't be charged until you confirm payment</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
