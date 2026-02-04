"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Car, Clock, DollarSign, Star, MapPin, Shield, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import ParkingSlotGrid from "@/components/parking/parking-slot-grid"
import SlotDetailsModal from "@/components/parking/slot-details-modal"

// Sample parking area data
const parkingAreaData = {
  id: "2",
  name: "Madurai Meenakshi Temple Parking",
  address: "South Tower Rd, Near Meenakshi Amman Temple, Madurai",
  totalSpots: 150,
  availableSpots: 38,
  price: 25,
  rating: 4.6,
  distance: 0.5,
  features: ["CCTV", "24/7", "Covered", "EV"],
  description: "Secure multi-level parking facility near the historic Meenakshi Amman Temple.",
  openingHours: "6:00 AM – 11:00 PM",
}

export default function ParkingAreaPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [showSlotDetails, setShowSlotDetails] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  const parkingAreaId = params.id

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const handleSlotSelect = (slotId: string) => {
    setSelectedSlot(slotId)
    setShowSlotDetails(true)
  }

  const handleBookSlot = () => {
    if (selectedSlot) {
      router.push(`/dashboard/booking/${parkingAreaId}?slot=${selectedSlot}`)
    }
  }

  if (!isLoaded) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="hover:bg-gray-800"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">{parkingAreaData.name}</h1>
          <p className="text-gray-400 text-sm">{parkingAreaData.address}</p>
        </div>
      </div>

      {/* Quick Info */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="bg-gray-800 text-green-400 border-green-400">
          <Car className="mr-1 h-3 w-3" /> {parkingAreaData.availableSpots} Available
        </Badge>
        <Badge variant="outline" className="bg-gray-800 text-blue-400 border-blue-400">
          <DollarSign className="mr-1 h-3 w-3" /> ₹{parkingAreaData.price}/hr
        </Badge>
        <Badge variant="outline" className="bg-gray-800 text-yellow-400 border-yellow-400">
          <Star className="mr-1 h-3 w-3" /> {parkingAreaData.rating}
        </Badge>
        <Badge variant="outline" className="bg-gray-800 text-purple-400 border-purple-400">
          <Clock className="mr-1 h-3 w-3" /> {parkingAreaData.openingHours}
        </Badge>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Parking Slots */}
        <div className="lg:col-span-2">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Select a Parking Slot</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-sm">Occupied</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-sm">Reserved</span>
                  </div>
                </div>
              </div>
              
              <ParkingSlotGrid
                rows={6}
                cols={10}
                selectedSlot={selectedSlot}
                onSelectSlot={handleSlotSelect}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-4">
          {/* Pricing */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Hourly Rate</span>
                <span className="font-medium">₹{parkingAreaData.price}</span>
              </div>
              <div className="flex justify-between">
                <span>Daily Rate</span>
                <span className="font-medium">₹{(parkingAreaData.price * 0.8).toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Monthly Rate</span>
                <span className="font-medium">₹{(parkingAreaData.price * 8).toFixed(0)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {parkingAreaData.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    {feature === "CCTV" && <Shield className="h-4 w-4 text-blue-400" />}
                    {feature === "24/7" && <Clock className="h-4 w-4 text-green-400" />}
                    {feature === "Covered" && <Car className="h-4 w-4 text-purple-400" />}
                    {feature === "EV" && <Zap className="h-4 w-4 text-yellow-400" />}
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400">{parkingAreaData.description}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Slot Details Modal */}
      {selectedSlot && (
        <SlotDetailsModal
          isOpen={showSlotDetails}
          onClose={() => {
            setShowSlotDetails(false)
            setSelectedSlot(null)
          }}
          slotId={selectedSlot}
          parkingArea={parkingAreaData}
          onBook={handleBookSlot}
        />
      )}
    </div>
  )
}
