"use client"

import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Clock, Zap, Shield, Car, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Slot {
  id: string
  number: number
  status: "AVAILABLE" | "OCCUPIED" | "RESERVED"
  price: number
}

interface ParkingArea {
  id: string
  name: string
  address: string
  totalSpots: number
  availableSpots: number
  price: number
  rating: number
  features: string[]
  openingHours: string
}

interface BookingSidebarProps {
  slot: Slot | null
  parkingArea: ParkingArea
  onConfirmBooking: () => void
}

export default function BookingSidebar({ slot, parkingArea, onConfirmBooking }: BookingSidebarProps) {
  if (!slot) {
    return (
      <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <Car className="w-8 h-8 text-gray-500" />
        </div>
        <p className="text-gray-400 text-lg">Select a slot to view details</p>
        <p className="text-gray-500 text-sm mt-2">Click on an available green slot</p>
      </div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={slot.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Selected Slot Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium opacity-90">Selected Slot</span>
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="text-3xl font-bold">S{slot.number}</h3>
          <p className="text-sm opacity-80 mt-1">Available for booking</p>
        </div>

        {/* Pricing Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">💰</span> Pricing
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-800">
              <span className="text-gray-400">Hourly Rate</span>
              <span className="text-white font-semibold text-lg">₹{slot.price}/hr</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-800">
              <span className="text-gray-400">Daily (8 hrs)</span>
              <span className="text-white font-medium">₹{(slot.price * 8).toFixed(0)}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-400">Monthly Pass</span>
              <span className="text-white font-medium">₹{(slot.price * 200).toFixed(0)}</span>
            </div>
          </div>
        </div>

        {/* Features Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">✨</span> Features
          </h4>
          <ul className="space-y-3">
            {parkingArea.features.map((feature, index) => (
              <li key={index} className="flex items-center gap-3 text-gray-300">
                {feature === "CCTV" && <Shield className="h-5 w-5 text-blue-400" />}
                {feature === "24/7" && <Clock className="h-5 w-5 text-green-400" />}
                {feature === "Covered" && <Car className="h-5 w-5 text-purple-400" />}
                {feature === "EV Charging" && <Zap className="h-5 w-5 text-yellow-400" />}
                {feature === "EV" && <Zap className="h-5 w-5 text-yellow-400" />}
                {feature === "Valet" && <Car className="h-5 w-5 text-pink-400" />}
                {feature === "Car Wash" && <Car className="h-5 w-5 text-cyan-400" />}
                {feature === "Security Guard" && <Shield className="h-5 w-5 text-red-400" />}
                {feature === "Open Air" && <Car className="h-5 w-5 text-orange-400" />}
                {feature === "Restrooms" && <Car className="h-5 w-5 text-teal-400" />}
                {feature === "Covered Parking" && <Car className="h-5 w-5 text-indigo-400" />}
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Timing Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Clock className="h-5 w-5 text-purple-400" /> Operating Hours
          </h4>
          <p className="text-gray-300">{parkingArea.openingHours}</p>
        </div>

        {/* CTA Button */}
        <Button
          onClick={onConfirmBooking}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-4 text-lg font-semibold rounded-xl shadow-lg shadow-purple-500/25 transition-all duration-200 hover:shadow-purple-500/40"
        >
          Confirm Booking
        </Button>

        {/* Security Note */}
        <p className="text-xs text-gray-500 text-center">
          🔒 Your booking is secured with real-time slot locking
        </p>
      </motion.div>
    </AnimatePresence>
  )
}
