"use client"

import { motion } from "framer-motion"
import { Car, Clock, DollarSign, Shield, X, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface SlotDetailsModalProps {
  slotId: string
  onClose: () => void
  onBook: () => void
  isOpen?: boolean
  parkingArea?: any
}

export default function SlotDetailsModal({ slotId, onClose, onBook, isOpen = true }: SlotDetailsModalProps) {
  if (!isOpen) return null

  // Sample slot details
  const slotDetails = {
    id: slotId,
    type: "Standard",
    size: "2.5m x 5m",
    price: 5.99,
    peakPrice: 7.99,
    features: ["Covered", "CCTV", "Lighting"],
    isEV: slotId.includes("E"),
  }

  const handleBookClick = () => {
    onBook()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />

      <motion.div
        initial={{ y: 100, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 100, opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative z-10 w-full max-w-sm rounded-xl bg-gray-900 p-4 shadow-2xl ring-1 ring-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 inline-flex items-center justify-center text-gray-400 hover:text-white transition-colors p-1"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-4 pr-6">
          <h2 className="text-lg font-bold text-white">Parking Slot {slotDetails.id}</h2>
          <p className="text-gray-400 text-sm">Select this slot to proceed with booking</p>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Car className="h-4 w-4 text-purple-400" />
                <h3 className="font-medium text-sm text-white">Slot Type</h3>
              </div>
              <p className="text-sm text-gray-300">{slotDetails.type}</p>
              <p className="text-xs text-gray-400 mt-0.5">{slotDetails.size}</p>
            </div>

            <div className="bg-gray-800 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="h-4 w-4 text-green-400" />
                <h3 className="font-medium text-sm text-white">Pricing</h3>
              </div>
              <p className="text-sm text-gray-300">${slotDetails.price}/hr</p>
              <p className="text-xs text-gray-400 mt-0.5">Peak: ${slotDetails.peakPrice}/hr</p>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-blue-400" />
              <h3 className="font-medium text-sm text-white">Features</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {slotDetails.features.map((feature) => (
                <Badge key={feature} className="bg-gray-700 text-xs text-gray-200">
                  {feature}
                </Badge>
              ))}
              {slotDetails.isEV && (
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50 text-xs">
                  <Zap className="mr-0.5 h-3 w-3" />
                  EV Charging
                </Badge>
              )}
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-yellow-400" />
              <h3 className="font-medium text-sm text-white">Availability</h3>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-gray-300">
                <span className="text-gray-400">Today</span>
                <span className="text-green-400">Available</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span className="text-gray-400">Tomorrow</span>
                <span className="text-green-400">Available</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span className="text-gray-400">Weekend</span>
                <span className="text-yellow-400">Limited</span>
              </div>
            </div>
          </div>

          <Button
            type="button"
            onClick={handleBookClick}
            className="w-full h-9 text-sm rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-[0_0_12px_rgba(168,85,247,0.25)] text-white font-medium transition-all"
          >
            Book This Slot
          </Button>
        </div>
      </motion.div>
    </div>
  )
}

