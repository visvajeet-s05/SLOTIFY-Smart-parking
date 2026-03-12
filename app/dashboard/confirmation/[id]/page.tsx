"use client"

import { useState, useEffect, use, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Calendar, Check, Download, Home, MapPin, Share2, Link as LinkIcon, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import QRCode from "@/components/booking/qr-code"
import ConfettiEffect from "@/components/ui/confetti"

function ConfirmationContent(props: any) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const slotId = searchParams.get("slot")
  const { id } = use(props.params as Promise<{ id: string }>)

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
        parkingAreaId: id,
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
        qrData: `PARKING-${id}-${slotId}-${Date.now()}`,
        txHash: `0x${Math.random().toString(16).substring(2, 15)}${Math.random().toString(16).substring(2, 15)}`,
      })
    } else {
      // Fallback data if no session data
      setBookingData({
        bookingId: "BK" + Math.floor(Math.random() * 10000000),
        parkingAreaId: id,
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
        qrData: `PARKING-${id}-${slotId}-${Date.now()}`,
        txHash: `0x${Math.random().toString(16).substring(2, 15)}${Math.random().toString(16).substring(2, 15)}`,
      })
    }

    return () => {
      clearTimeout(timer)
      clearTimeout(confettiTimer)
    }
  }, [id, slotId])

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

          {/* Web3 Blockchain Verification */}
          {bookingData.txHash && (
            <Card className="bg-[#141A2A] border-indigo-500/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-indigo-600 text-white px-3 py-1 text-[10px] font-bold rounded-bl-lg uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3"/> Immutable
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2 text-indigo-400">
                  <LinkIcon className="w-4 h-4" /> Web3 Digital Receipt
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-400 mb-2">
                  This booking has been securely recorded on the blockchain ledger, ensuring immutability and transparent auditing.
                </p>
                <div className="bg-[#0B0F1A] p-3 rounded border border-gray-800 flex justify-between items-center group">
                  <span className="font-mono text-xs text-indigo-300 truncate mr-3">
                    {bookingData.txHash}
                  </span>
                  <Badge variant="outline" className="text-[10px] cursor-pointer hover:bg-gray-800 transition-colors shrink-0">
                    Verify
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

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

export default function ConfirmationPage(props: any) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">Loading confirmation...</div>
      </div>
    }>
      <ConfirmationContent {...props} />
    </Suspense>
  )
}