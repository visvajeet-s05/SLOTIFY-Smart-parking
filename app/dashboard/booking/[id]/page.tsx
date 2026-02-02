"use client"

import React, { useState, useEffect, useMemo, use } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  Calendar,
  Clock,
  CreditCard,
  MapPin,
  Percent,
  ShieldCheck,
  Smartphone,
  Wallet,
  Car,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useSession } from "next-auth/react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export default function BookingPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const slotId = searchParams.get("slot")
  const { toast } = useToast()
  const { data: session, status } = useSession()

  // Unwrap the params Promise to access the id property
  const parkingAreaId = use(params as any)

  const [isLoaded, setIsLoaded] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [hours, setHours] = useState(2)
  const [isProcessing, setIsProcessing] = useState(false)
  const [licensePlate, setLicensePlate] = useState("")
  const [vehicleModel, setVehicleModel] = useState("")
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split("T")[0])
  const [bookingTime, setBookingTime] = useState("09:50")
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Prevent direct access without slot selection
  useEffect(() => {
    if (!slotId) {
      toast({
        title: "Select a Slot First",
        description:
          "Please select a parking slot before proceeding to booking.",
        variant: "destructive",
      })
      router.push(`/dashboard/parking/${parkingAreaId}`)
    }
  }, [slotId, router, parkingAreaId, toast])

  const bookingData = {
    parkingAreaId: parkingAreaId,
    parkingAreaName: "Downtown Parking Complex",
    address: "123 Main St, Downtown",
    slotId: slotId || "",
    basePrice: 50, // ₹50 per hour
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString(),
  }

  // Protect route → redirect if not logged in
  useEffect(() => {
    if (status !== "loading" && !session) {
      router.push("/")
    }
  }, [session, status, router])

  // Simulate page load
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 500)
    return () => clearTimeout(timer)
  }, [])

  const pricing = useMemo(() => {
    const basePrice = bookingData.basePrice * hours
    const serviceFee = basePrice * 0.1
    const tax = basePrice * 0.05
    const discount = hours >= 3 ? basePrice * 0.15 : 0
    return {
      basePrice,
      serviceFee,
      tax,
      discount,
      total: basePrice + serviceFee + tax - discount,
    }
  }, [hours])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!bookingDate) newErrors.date = "Date is required"
    if (!bookingTime) newErrors.time = "Time is required"
    if (!licensePlate.trim()) newErrors.licensePlate = "License plate is required"
    if (!vehicleModel.trim()) newErrors.vehicleModel = "Vehicle model is required"
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handlePayment = () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    
    const bookingInfo = {
      parkingAreaId: parkingAreaId,
      slotId,
      date: bookingDate,
      time: bookingTime,
      duration: hours,
      licensePlate: licensePlate.toUpperCase(),
      vehicleModel,
      paymentMethod,
      basePrice: bookingData.basePrice,
      totalPrice: pricing.total,
    }
    
    sessionStorage.setItem("lastBooking", JSON.stringify(bookingInfo))
    
    setTimeout(() => {
      setIsProcessing(false)
      toast({
        title: "Payment Successful!",
        description: "Your parking slot has been booked successfully.",
      })
      router.push(`/dashboard/confirmation/${parkingAreaId}?slot=${slotId}`)
    }, 2000)
  }

  // Loading screen
  if (status === "loading" || !isLoaded) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-purple-500 border-t-transparent"></div>
      </div>
    )
  }

  // If slot is missing, show fallback
  if (!slotId) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-black text-white">
        <p className="text-lg font-semibold mb-4">
          Please select a parking slot first
        </p>
        <Button
          onClick={() => router.push(`/dashboard/parking/${params.id}`)}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
        >
          Go Back to Parking Slots
        </Button>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4 p-4"
    >
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
          <h1 className="text-xl font-bold">Book Parking Slot</h1>
          <p className="text-gray-400 text-sm">{bookingData.parkingAreaName}</p>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Section */}
        <div className="lg:col-span-2 space-y-4">
          {/* Parking Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Parking Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{bookingData.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">
                    {bookingData.date} at {bookingData.time}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">Slot: {bookingData.slotId}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Date & Time */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Date & Time</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date" className="text-sm text-gray-300 mb-2 block">
                      Date
                    </Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                      <Input
                        id="date"
                        type="date"
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className={cn(
                          "pl-10 bg-gray-700 border-gray-600 text-white",
                          errors.date && "border-red-500"
                        )}
                      />
                    </div>
                    {errors.date && <p className="text-red-400 text-xs mt-1">{errors.date}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="time" className="text-sm text-gray-300 mb-2 block">
                      Time
                    </Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                      <Input
                        id="time"
                        type="time"
                        value={bookingTime}
                        onChange={(e) => setBookingTime(e.target.value)}
                        className={cn(
                          "pl-10 bg-gray-700 border-gray-600 text-white",
                          errors.time && "border-red-500"
                        )}
                      />
                    </div>
                    {errors.time && <p className="text-red-400 text-xs mt-1">{errors.time}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Duration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Duration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((hour) => (
                    <Button
                      key={hour}
                      variant={hours === hour ? "default" : "outline"}
                      onClick={() => setHours(hour)}
                      className={`border-gray-700 ${
                        hours === hour
                          ? "bg-gradient-to-r from-purple-600 to-indigo-600"
                          : "bg-gray-800 hover:bg-gray-700"
                      }`}
                    >
                      {hour}h
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Vehicle Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  Vehicle Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="license" className="text-sm text-gray-300 mb-2 block">
                    License Plate Number
                  </Label>
                  <Input
                    id="license"
                    type="text"
                    placeholder="e.g., TN-01-AB-1234"
                    value={licensePlate}
                    onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                    className={cn(
                      "bg-gray-700 border-gray-600 text-white placeholder-gray-400",
                      errors.licensePlate && "border-red-500"
                    )}
                  />
                  {errors.licensePlate && (
                    <p className="text-red-400 text-xs mt-1">{errors.licensePlate}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="vehicle" className="text-sm text-gray-300 mb-2 block">
                    Vehicle Model
                  </Label>
                  <Input
                    id="vehicle"
                    type="text"
                    placeholder="e.g., Honda City, Maruti Swift"
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    className={cn(
                      "bg-gray-700 border-gray-600 text-white placeholder-gray-400",
                      errors.vehicleModel && "border-red-500"
                    )}
                  />
                  {errors.vehicleModel && (
                    <p className="text-red-400 text-xs mt-1">{errors.vehicleModel}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Payment Method */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-800 border border-gray-700 hover:border-purple-500 cursor-pointer transition-colors">
                    <RadioGroupItem value="card" id="card" className="border-gray-400" />
                    <Label htmlFor="card" className="flex-1 flex items-center gap-3 cursor-pointer">
                      <CreditCard className="h-5 w-5 text-gray-400" />
                      <span>Credit/Debit Card</span>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-800 border border-gray-700 hover:border-purple-500 cursor-pointer transition-colors">
                    <RadioGroupItem value="upi" id="upi" className="border-gray-400" />
                    <Label htmlFor="upi" className="flex-1 flex items-center gap-3 cursor-pointer">
                      <Smartphone className="h-5 w-5 text-gray-400" />
                      <span>UPI Payment</span>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-800 border border-gray-700 hover:border-purple-500 cursor-pointer transition-colors">
                    <RadioGroupItem value="wallet" id="wallet" className="border-gray-400" />
                    <Label htmlFor="wallet" className="flex-1 flex items-center gap-3 cursor-pointer">
                      <Wallet className="h-5 w-5 text-gray-400" />
                      <span>Digital Wallet</span>
                    </Label>
                  </div>
                </RadioGroup>

                {/* Card Details (show only for card payment) */}
                {paymentMethod === "card" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3 pt-4 border-t border-gray-700"
                  >
                    <Input
                      type="text"
                      placeholder="Card Number"
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        type="text"
                        placeholder="MM/YY"
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      />
                      <Input
                        type="text"
                        placeholder="CVV"
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      />
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Section (Summary) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-4 lg:sticky lg:top-4"
        >
          {/* Booking Summary */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">
                  Base Price ({hours} hours)
                </span>
                <span>₹{pricing.basePrice.toFixed(0)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Service Fee</span>
                <span>₹{pricing.serviceFee.toFixed(0)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Tax</span>
                <span>₹{pricing.tax.toFixed(0)}</span>
              </div>

              {pricing.discount > 0 && (
                <div className="flex justify-between text-green-400">
                  <span className="flex items-center text-sm">
                    <Percent className="h-3 w-3 mr-1" /> Discount
                  </span>
                  <span>-₹{pricing.discount.toFixed(0)}</span>
                </div>
              )}

              <Separator className="bg-gray-700" />

              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>₹{pricing.total.toFixed(0)}</span>
              </div>

              <Button
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                onClick={handlePayment}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <div className="flex items-center">
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-t-transparent"></div>
                    Processing...
                  </div>
                ) : (
                  <>Pay ₹{pricing.total.toFixed(0)}</>
                )}
              </Button>

              <p className="text-xs text-gray-400 text-center">
                By clicking Pay, you agree to our Terms and Conditions.
              </p>
            </CardContent>
          </Card>

          {/* Security Badge */}
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-green-400">
                <ShieldCheck className="h-4 w-4" />
                <span>Secure Payment</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
