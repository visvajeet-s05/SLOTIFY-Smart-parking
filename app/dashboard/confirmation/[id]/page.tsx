"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Calendar, Check, Download, Home, MapPin, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import QRCode from "@/components/booking/qr-code"
import ConfettiEffect from "@/components/ui/confetti"

export default function ConfirmationPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const slotId = searchParams.get("slot")

  const [isLoaded, setIsLoaded] = useState(false)
  const [showConfetti, setShowConfetti] = useState(true)
  const [bookingData, setBookingData] = useState<any>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, 500)

    const confettiTimer = setTimeout(() => {
      setShowConfetti(false)
    }, 5000)

    // Get booking data from session storage
    const storedData = sessionStorage.getItem("lastBooking")
    if (storedData) {
      const parsedData = JSON.parse(storedData)
      setBookingData({
        bookingId: "BK" + Math.floor(Math.random() * 10000000),
        parkingAreaId: params.id,
        parkingAreaName: "Downtown Parking Complex",
        address: "123 Main St, Downtown",
        slotId: slotId || parsedData.slotId || "A12",
        date: parsedData.date || new Date().toLocaleDateString(),
        time: parsedData.time || new Date().toLocaleTimeString(),
        duration: `${parsedData.duration || 2} hour${parsedData.duration > 1 ? "s" : ""}`,
        amount: `₹${Math.round(parsedData.totalPrice || 100)}`,
        licensePlate: parsedData.licensePlate || "",
        vehicleModel: parsedData.vehicleModel || "",
        paymentMethod: parsedData.paymentMethod || "card",
        qrData: `PARKING-${params.id}-${slotId}-${Date.now()}`,
      })
    } else {
      // Fallback data if no session data
      setBookingData({
        bookingId: "BK" + Math.floor(Math.random() * 10000000),
        parkingAreaId: params.id,
        parkingAreaName: "Downtown Parking Complex",
        address: "123 Main St, Downtown",
        slotId: slotId || "A12",
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        duration: "2 hours",
        amount: "₹100",
        licensePlate: "",
        vehicleModel: "",
        paymentMethod: "card",
        qrData: `PARKING-${params.id}-${slotId}-${Date.now()}`,
      })
    }

    return () => {
      clearTimeout(timer)
      clearTimeout(confettiTimer)
    }
  }, [params.id, slotId])

  if (!isLoaded || !bookingData) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Confetti Effect */}
      {showConfetti && <ConfettiEffect />}

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
          <h1 className="text-xl font-bold">Booking Confirmed</h1>
          <p className="text-gray-400 text-sm">Your parking slot has been reserved</p>
        </div>
      </div>

      {/* Success Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-green-500/10 border border-green-500/20 rounded-lg p-4"
      >
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
            <Check className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-green-400">Booking Successful!</h3>
            <p className="text-sm text-gray-300">Your parking slot is reserved and ready to use.</p>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Booking Details */}
        <div className="space-y-4">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Booking Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Booking ID</span>
                <span className="font-mono text-sm">{bookingData.bookingId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Location</span>
                <span className="text-sm">{bookingData.parkingAreaName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Slot</span>
                <span className="text-sm">{bookingData.slotId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Date & Time</span>
                <span className="text-sm">{bookingData.date} at {bookingData.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Duration</span>
                <span className="text-sm">{bookingData.duration}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Amount Paid</span>
                <span className="font-semibold text-green-400">{bookingData.amount}</span>
              </div>
            </CardContent>
          </Card>

          {/* Location Info */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm">{bookingData.address}</p>
                  <Badge variant="outline" className="mt-2 bg-green-500/10 text-green-400 border-green-500/50">
                    Active Booking
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vehicle Information */}
          {(bookingData.licensePlate || bookingData.vehicleModel) && (
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Vehicle Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {bookingData.licensePlate && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">License Plate</span>
                    <span className="text-sm font-mono">{bookingData.licensePlate}</span>
                  </div>
                )}
                {bookingData.vehicleModel && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Vehicle Model</span>
                    <span className="text-sm">{bookingData.vehicleModel}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* QR Code */}
        <div className="space-y-4">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Entry QR Code</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="bg-white p-4 rounded-lg inline-block">
                <QRCode value={bookingData.qrData} size={200} />
              </div>
              <p className="text-sm text-gray-400 mt-3">
                Show this QR code at the parking entrance
              </p>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-2">
            <Button className="w-full bg-purple-600 hover:bg-purple-700">
              <Download className="h-4 w-4 mr-2" />
              Download Receipt
            </Button>
            <Button variant="outline" className="w-full bg-gray-800 border-gray-700">
              <Share2 className="h-4 w-4 mr-2" />
              Share Booking
            </Button>
            <Button 
              variant="outline" 
              className="w-full bg-gray-800 border-gray-700"
              onClick={() => router.push("/dashboard")}
            >
              <Home className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}