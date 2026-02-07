"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import SlotGrid from "@/components/SlotGrid"
import { motion } from "framer-motion"
import { MapPin, Clock, CreditCard, Car, CheckCircle, ChevronDown, Building2 } from "lucide-react"
import { useParkingSocket } from "@/hooks/useParkingSocket"

type Slot = {
  id: string
  slotNumber: number
  row: string
  status: "AVAILABLE" | "OCCUPIED" | "RESERVED" | "DISABLED" | "CLOSED"
  aiConfidence: number
  updatedBy: "AI" | "OWNER" | "CUSTOMER"
  updatedAt: string
  price: number
  slotType?: string
}

type ParkingLot = {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  status: string
}

const PARKING_LOTS = [
  { id: "CHENNAI_CENTRAL", name: "Chennai Central Premium Parking", price: 80 },
  { id: "ANNA_NAGAR", name: "Anna Nagar Parking Complex", price: 60 },
  { id: "T_NAGAR", name: "T Nagar Shopping District Parking", price: 100 },
  { id: "VELACHERY", name: "Velachery IT Corridor Parking", price: 50 },
  { id: "OMR", name: "OMR Tech Park Parking", price: 45 },
  { id: "ADYAR", name: "Adyar Residential Parking", price: 70 },
  { id: "GUINDY", name: "Guindy Industrial Parking", price: 40 },
  { id: "PORUR", name: "Porur Junction Parking", price: 35 }
]

export default function CustomerParkingPage() {
  const params = useParams()
  const router = useRouter()
  const lotId = params.id as string
  
  const [slots, setSlots] = useState<Slot[]>([])
  const [lot, setLot] = useState<ParkingLot | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [showLotSelector, setShowLotSelector] = useState(false)

  // Use the parking socket hook for real-time updates
  const { isConnected: wsConnected } = useParkingSocket({
    lotId: lotId,
    onSlotUpdate: (data) => {
      setSlots(prev => prev.map(slot => 
        slot.id === data.slotId 
          ? { ...slot, status: data.status }
          : slot
      ))
      
      // Clear selection if slot becomes unavailable
      if (selectedSlot?.id === data.slotId && data.status !== "AVAILABLE") {
        setSelectedSlot(null)
      }
    },
    onBulkUpdate: () => {
      // Refresh all slots after bulk update
      fetch(`/api/parking/${lotId}/slots`)
        .then(res => res.json())
        .then(data => {
          if (data.slots) {
            setSlots(data.slots)
          }
        })
    }
  })

  useEffect(() => {
    // Fetch parking lot details
    fetch(`/api/parking/${lotId}`)
      .then(res => res.json())
      .then(data => {
        setLot(data.lot)
      })
      .catch(err => console.error("Failed to fetch lot:", err))

    // Fetch slots
    fetch(`/api/parking/${lotId}/slots`)
      .then(res => res.json())
      .then(data => {
        setSlots(data.slots || [])
        setIsLoading(false)
      })
      .catch(err => {
        console.error("Failed to fetch slots:", err)
        setIsLoading(false)
      })
  }, [lotId])

  const handleLotChange = (newLotId: string) => {
    router.push(`/dashboard/parking/${newLotId}`)
    setShowLotSelector(false)
  }

  const handleSlotSelect = (slot: Slot) => {
    if (slot.status === "AVAILABLE") {
      setSelectedSlot(slot)
      setBookingSuccess(false)
    }
  }

  const handleBooking = async () => {
    if (!selectedSlot) return

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slotId: selectedSlot.id,
          lotId: lotId,
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // 2 hours
        })
      })

      if (response.ok) {
        setBookingSuccess(true)
        setSelectedSlot(null)
      } else {
        alert("Booking failed. Please try again.")
      }
    } catch (error) {
      console.error("Booking error:", error)
      alert("Booking failed. Please try again.")
    }
  }

  const availableCount = slots.filter(s => s.status === "AVAILABLE").length
  const totalCount = slots.length

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading parking slots...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-white">
                  {lot?.name || "Parking Lot"}
                </h1>
                {/* Lot Selector Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowLotSelector(!showLotSelector)}
                    className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-3 py-1.5 rounded-lg text-sm transition"
                  >
                    <Building2 size={16} />
                    Switch Lot
                    <ChevronDown size={14} />
                  </button>
                  
                  {showLotSelector && (
                    <div className="absolute top-full left-0 mt-2 w-72 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-50 max-h-80 overflow-y-auto">
                      {PARKING_LOTS.map((parkingLot) => (
                        <button
                          key={parkingLot.id}
                          onClick={() => handleLotChange(parkingLot.id)}
                          className={`w-full text-left px-4 py-3 hover:bg-gray-700 transition flex items-center justify-between ${
                            parkingLot.id === lotId ? "bg-cyan-500/20 border-l-2 border-cyan-500" : ""
                          }`}
                        >
                          <div>
                            <div className="font-medium text-sm">{parkingLot.name}</div>
                            <div className="text-xs text-gray-400">₹{parkingLot.price}/hr</div>
                          </div>
                          {parkingLot.id === lotId && (
                            <CheckCircle size={16} className="text-cyan-400" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <MapPin size={16} />
                <span>{lot?.address || "Loading location..."}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400 mb-1">Available Slots</div>
              <div className="text-3xl font-bold text-green-400">
                {availableCount} <span className="text-lg text-gray-500">/ {totalCount}</span>
              </div>
              <div className={`text-xs mt-1 ${wsConnected ? "text-green-500" : "text-red-500"}`}>
                {wsConnected ? "● Live Updates" : "○ Disconnected"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Slot Grid */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Select Your Parking Slot</h2>
                <div className="text-sm text-gray-400">
                  Click on a green slot to book
                </div>
              </div>

              <SlotGrid 
                slots={slots} 
                selectable={true}
                onSelect={handleSlotSelect}
              />
            </div>
          </div>

          {/* Sidebar - Booking Details */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 sticky top-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <CreditCard size={20} className="text-cyan-400" />
                Booking Details
              </h2>
              
              {bookingSuccess ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={40} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-green-400 mb-2">Booking Confirmed!</h3>
                  <p className="text-gray-400 mb-4">Your parking slot has been reserved.</p>
                  <button
                    onClick={() => setBookingSuccess(false)}
                    className="w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-xl transition"
                  >
                    Book Another Slot
                  </button>
                </motion.div>
              ) : selectedSlot ? (
                <div className="space-y-4">
                  {/* Selected Slot Card */}
                  <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Car size={20} className="text-cyan-400" />
                        <span className="text-gray-400">Slot Number</span>
                      </div>
                      <span className="text-2xl font-bold text-white">S{selectedSlot.slotNumber}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Row</span>
                      <span className="text-lg font-semibold text-cyan-400">{selectedSlot.row}</span>
                    </div>
                  </div>

                  {/* Price Card */}
                  <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400">Hourly Rate</span>
                      <span className="text-2xl font-bold text-green-400">₹{selectedSlot.price}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {selectedSlot.slotType === "EV" && "⚡ EV Charging included (+30%)"}
                      {selectedSlot.slotType === "DISABLED" && "♿ Accessible slot (-20%)"}
                      {selectedSlot.slotType === "REGULAR" && "Standard parking slot"}
                    </div>
                  </div>

                  {/* Duration Card */}
                  <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock size={18} className="text-cyan-400" />
                      <span className="text-gray-400">Duration</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white">2 hours (default)</span>
                      <span className="text-cyan-400 font-semibold">Change</span>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-cyan-400 font-semibold">Estimated Total</span>
                      <span className="text-2xl font-bold text-cyan-400">₹{selectedSlot.price * 2}</span>
                    </div>
                    <div className="text-xs text-cyan-400/70 mt-1">
                      For 2 hours parking
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <button
                    onClick={handleBooking}
                    className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg shadow-cyan-500/25"
                  >
                    Confirm Booking
                  </button>

                  <button
                    onClick={() => setSelectedSlot(null)}
                    className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold py-3 px-6 rounded-xl transition"
                  >
                    Cancel Selection
                  </button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Car size={32} className="text-gray-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-400 mb-2">No Slot Selected</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Click on an available green slot from the grid to start booking
                  </p>
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span>Available</span>
                    <div className="w-3 h-3 bg-red-600 rounded ml-2"></div>
                    <span>Occupied</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
