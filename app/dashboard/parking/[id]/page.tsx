"use client"

import { useEffect, useState, Suspense } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import SlotGrid from "@/components/SlotGrid"
import { motion, AnimatePresence } from "framer-motion"
import { MapPin, Clock, CreditCard, Car, CheckCircle2, ChevronDown, Building2, BatteryCharging, Accessibility, Zap, Timer, ArrowLeft, ShieldCheck } from "lucide-react"
import { useParkingSocket } from "@/hooks/useParkingSocket"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import PaymentModal from "@/components/booking/PaymentModal"

type Slot = {
  id: string
  slotNumber: number
  row: string
  status: "AVAILABLE" | "OCCUPIED" | "RESERVED" | "DISABLED" | "CLOSED"
  aiConfidence: number
  updatedBy: "AI" | "OWNER" | "CUSTOMER" | "SYSTEM"
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

function CustomerParkingContent() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const lotId = params.id as string

  const [slots, setSlots] = useState<Slot[]>([])
  const [lot, setLot] = useState<ParkingLot | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showLotSelector, setShowLotSelector] = useState(false)
  const [duration, setDuration] = useState(2)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  // Use the parking socket hook for real-time updates
  const { isConnected: wsConnected } = useParkingSocket({
    lotId: lotId,
    onSlotUpdate: (data) => {
      setSlots(prev => prev.map(slot =>
        slot.id === data.slotId
          ? { ...slot, status: data.status }
          : slot
      ))

      // Clear selection if slot becomes unavailable, UNLESS we are currently booking it (modal open)
      // This prevents the "Reserved" status update from kicking the user out of the payment flow
      if (selectedSlot?.id === data.slotId && data.status !== "AVAILABLE" && !showPaymentModal) {
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
    }
  }

  const handleBooking = () => {
    if (!selectedSlot || !lot) return
    setShowPaymentModal(true)
  }

  const handlePaymentSuccess = () => {
    // Refresh slots
    fetch(`/api/parking/${lotId}/slots`)
      .then(res => res.json())
      .then(data => {
        if (data.slots) {
          setSlots(data.slots)
        }
      })

    // Selected slot will be cleared when the modal closes or user navigates away
    // We can keep the modal open to show success state
  }

  // Handle Stripe Redirect Success
  useEffect(() => {
    const paymentIntentSecret = searchParams.get("payment_intent_client_secret")
    const redirectStatus = searchParams.get("redirect_status")

    if (paymentIntentSecret && redirectStatus === "succeeded") {
      const newUrl = window.location.pathname
      window.history.replaceState({}, '', newUrl)

      toast({
        title: "Payment Successful",
        description: "Your booking has been confirmed.",
      })
      handlePaymentSuccess()
    }
  }, [searchParams])

  const availableCount = slots.filter(s => s.status === "AVAILABLE").length
  const totalCount = slots.length

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-mesh flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-r-2 border-primary/50 animate-spin-slow"></div>
          </div>
          <p className="text-gray-400 font-medium tracking-wide animate-pulse">Synchronizing with Parking Grid...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-mesh text-white selection:bg-cyan-500/30 font-sans">
      {/* Premium Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/5 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="hover:bg-white/10 text-gray-400 hover:text-white rounded-xl"
              >
                <ArrowLeft size={20} />
              </Button>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-1">
                  <h1 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2 truncate max-w-[200px] sm:max-w-none">
                    {lot?.name || "Parking Lot"}
                    <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold uppercase tracking-wider shrink-0">
                      Live
                    </span>
                  </h1>

                  {/* Lot Selector */}
                  <div className="relative">
                    <button
                      onClick={() => setShowLotSelector(!showLotSelector)}
                      className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-semibold transition-all shadow-lg hover:shadow-cyan-500/20 whitespace-nowrap"
                    >
                      <Building2 size={12} className="text-cyan-400" />
                      Switch Zone
                      <ChevronDown size={12} className={`transition-transform duration-300 ${showLotSelector ? "rotate-180" : ""}`} />
                    </button>

                    <AnimatePresence>
                      {showLotSelector && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute top-full left-0 mt-3 w-80 bg-gray-900/95 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl ring-1 ring-white/10"
                        >
                          <div className="p-2 space-y-1 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            {PARKING_LOTS.map((parkingLot) => (
                              <button
                                key={parkingLot.id}
                                onClick={() => handleLotChange(parkingLot.id)}
                                className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between group ${parkingLot.id === lotId ? "bg-cyan-500/20 border border-cyan-500/30" : "hover:bg-white/5 border border-transparent"
                                  }`}
                              >
                                <div>
                                  <div className={`font-bold text-sm ${parkingLot.id === lotId ? "text-cyan-400" : "text-white"}`}>{parkingLot.name}</div>
                                  <div className="text-xs text-gray-400 mt-0.5 group-hover:text-gray-300">₹{parkingLot.price}/hr • High Demand</div>
                                </div>
                                {parkingLot.id === lotId && (
                                  <CheckCircle2 size={16} className="text-cyan-400" />
                                )}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={12} className="text-primary/70" />
                    <span>{lot?.address || "Loading location..."}</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-gray-700 hidden sm:block"></div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck size={12} className="text-emerald-500/70" />
                    <span>Secure Zone</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Indicators */}
            <div className="flex items-center gap-4 sm:gap-8 shrink-0">
              <div className="text-right hidden sm:block">
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Health</div>
                <div className="text-xl font-black text-emerald-400 tabular-nums leading-none">
                  {Math.round((availableCount / (totalCount || 1)) * 100)}%
                </div>
              </div>
              <div className="h-10 w-px bg-white/10 hidden sm:block"></div>
              <div className="text-right">
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 leading-none">Free Spots</div>
                <div className="text-xl md:text-2xl font-black text-white tabular-nums leading-none flex items-center justify-end gap-1.5 md:gap-2 mt-1">
                  <span className="text-emerald-400">{availableCount}</span>
                  <span className="text-sm md:text-lg text-gray-600 font-medium">/ {totalCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="space-y-6">
          {/* Main Slot Grid Section - Now Full Width */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-[2.5rem] p-8 md:p-12 border-white/5 relative overflow-hidden group min-h-[60vh]"
          >
            {/* Decorative background glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/20 transition-all duration-1000"></div>

            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                <div>
                  <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Slot Selection</h2>
                  <p className="text-gray-400 text-sm">Tap an available spot to initiate your booking session</p>
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border self-start md:self-auto ${wsConnected ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
                  <span className={`w-2.5 h-2.5 rounded-full ${wsConnected ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`}></span>
                  {wsConnected ? "Syncing Live" : "Reconnecting"}
                </div>
              </div>

              <SlotGrid
                slots={slots}
                selectable={true}
                onSelect={handleSlotSelect}
              />
            </div>
          </motion.div>
        </div>
      </main>

      {/* Checkout Dialog - Quick Interaction */}
      <Dialog open={!!selectedSlot && !showPaymentModal} onOpenChange={(open) => !open && setSelectedSlot(null)}>
        <DialogContent className="bg-[#0B0E14] border-white/10 text-white max-w-md p-0 overflow-hidden rounded-[2rem] shadow-2xl">
          <div className="relative p-8 space-y-8">
            {/* Background Ambient Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-[80px] pointer-events-none" />
            
            <DialogHeader className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  <CreditCard size={20} className="text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-black tracking-tight uppercase">Checkout</DialogTitle>
                  <DialogDescription className="text-gray-500 text-xs font-bold tracking-widest uppercase">Timer Active • Secure Channel</DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {selectedSlot && (
              <div className="space-y-8 relative z-10">
                {/* Slot Snapshot */}
                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between shadow-inner">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-black mb-1">Selected Spot</p>
                    <div className="text-4xl font-black text-white tracking-tighter">S{selectedSlot.slotNumber}</div>
                    <div className="text-xs text-primary font-bold mt-1.5 flex items-center gap-1.5 uppercase tracking-wider">
                      <MapPin size={10} />
                      {selectedSlot.row} Zone
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-white">₹{selectedSlot.price}<span className="text-xs text-gray-500 font-bold ml-1">/hr</span></div>
                    {selectedSlot.slotType === "EV" && (
                      <div className="text-[10px] text-cyan-400 font-black flex items-center justify-end gap-1 mt-2 uppercase tracking-widest">
                        <Zap size={10} fill="currentColor" /> EV Link
                      </div>
                    )}
                  </div>
                </div>

                {/* Duration Control */}
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Timer size={14} className="text-primary" />
                      Parking Time
                    </label>
                    <span className="text-2xl font-black text-white tabular-nums">{duration} <span className="text-xs text-gray-500 font-bold ml-0.5 uppercase">hrs</span></span>
                  </div>
                  <div className="px-2">
                    <Slider
                      defaultValue={[2]}
                      max={24}
                      min={1}
                      step={1}
                      value={[duration]}
                      onValueChange={(value) => setDuration(value[0])}
                      className="py-4"
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-black text-gray-700 uppercase tracking-widest px-1">
                    <span>min. 1h</span>
                    <span className="text-gray-500">Scale to needs</span>
                    <span>max. 24h</span>
                  </div>
                </div>

                <div className="h-px bg-white/5 w-full" />

                {/* Total Calc */}
                <div className="flex items-end justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Total Estimate</span>
                    <div className="text-xs text-gray-400 font-medium">Incl. service fees & GST</div>
                  </div>
                  <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-gray-500 tabular-nums tracking-tighter">
                    ₹{selectedSlot.price * duration}
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4 pt-0">
              <Button
                variant="ghost"
                onClick={() => setSelectedSlot(null)}
                className="flex-1 h-14 rounded-2xl border border-white/5 hover:bg-white/5 text-gray-400 hover:text-white font-bold transition-all"
              >
                Change Spot
              </Button>
              <Button
                onClick={handleBooking}
                className="flex-[1.5] h-14 rounded-2xl bg-gradient-to-br from-primary via-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
              >
                Proceed to Payment
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Modal */}
      {selectedSlot && lot && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          slotId={selectedSlot.id}
          slotNumber={selectedSlot.slotNumber.toString()}
          parkingName={lot.name}
          parkingLotId={lotId}
          pricePerHour={selectedSlot.price}
          duration={duration}
          onSuccess={handlePaymentSuccess}
          parkingAddress={lot?.address ?? "123 Main St, Downtown"}
        />
      )}
    </div>
  )
}

export default function CustomerParkingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full bg-mesh flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-r-2 border-primary/50 animate-spin-slow"></div>
          </div>
          <p className="text-gray-400 font-medium tracking-wide animate-pulse">Initializing Parking Grid...</p>
        </div>
      </div>
    }>
      <CustomerParkingContent />
    </Suspense>
  )
}
