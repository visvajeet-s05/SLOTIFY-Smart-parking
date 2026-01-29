"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useSearchParams, useRouter } from "next/navigation"
import { ArrowLeft, QrCode, Check, Calendar, Clock, Car, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

// Mock parking locations data (simplified version)
const parkingLocationsData: Record<string, any> = {
  downtown: {
    id: "downtown",
    name: "Downtown Parking Garage",
    address: "123 Main St, Downtown",
    pricePerHour: 2.5,
  },
  mall: {
    id: "mall",
    name: "Central Mall Parking",
    address: "456 Shopping Ave, Central District",
    pricePerHour: 3.0,
  },
  station: {
    id: "station",
    name: "Metro Station P1",
    address: "789 Transit Rd, Metro District",
    pricePerHour: 1.75,
  },
  riverside: {
    id: "riverside",
    name: "Riverside Parking",
    address: "321 River View, East Side",
    pricePerHour: 2.0,
  },
  airport: {
    id: "airport",
    name: "Airport Terminal P3",
    address: "100 Airport Blvd, Terminal 3",
    pricePerHour: 4.5,
  },
}

export default function BookingConfirmPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const slotId = searchParams.get("slot")
  const locationId = searchParams.get("location")
  const hours = Number.parseInt(searchParams.get("hours") || "1")

  const [location, setLocation] = useState<any>(null)
  const [paymentStep, setPaymentStep] = useState<"details" | "processing" | "success">("details")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (locationId && locationId in parkingLocationsData) {
      setLocation(parkingLocationsData[locationId])
    } else {
      router.push("/dashboard")
    }
  }, [locationId, router])

  const handlePayment = () => {
    setIsLoading(true)
    setPaymentStep("processing")

    // Simulate payment processing
    setTimeout(() => {
      setPaymentStep("success")
      setIsLoading(false)
    }, 2000)
  }

  if (!location) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  const parkingFee = location.pricePerHour * hours
  const serviceFee = parkingFee * 0.1
  const tax = parkingFee * 0.08
  const total = parkingFee + serviceFee + tax

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 p-4">
        <div className="container mx-auto">
          <div className="flex items-center">
            <Link href={`/parking/${locationId}`}>
              <Button variant="ghost" size="icon" className="mr-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold">Confirm Booking</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4">
        {paymentStep === "details" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto">
            {/* Booking Summary */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-6">
              <h2 className="text-lg font-semibold mb-4">Booking Summary</h2>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-purple-400 mt-0.5" />
                  <div>
                    <h3 className="font-medium">{location.name}</h3>
                    <p className="text-sm text-gray-400">{location.address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Car className="h-5 w-5 text-purple-400 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Parking Slot</h3>
                    <p className="text-sm text-gray-400">Slot {slotId?.split("-")[1]}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-purple-400 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Date</h3>
                    <p className="text-sm text-gray-400">{new Date().toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-purple-400 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Duration</h3>
                    <p className="text-sm text-gray-400">
                      {hours} {hours === 1 ? "hour" : "hours"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-800">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Parking Fee</span>
                    <span>${parkingFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Service Fee</span>
                    <span>${serviceFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-700 my-2 pt-2 flex justify-between font-bold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-6">
              <h2 className="text-lg font-semibold mb-4">Payment Method</h2>

              <Tabs defaultValue="card">
                <TabsList className="w-full grid grid-cols-3 mb-4">
                  <TabsTrigger value="card">Card</TabsTrigger>
                  <TabsTrigger value="bank">Bank</TabsTrigger>
                  <TabsTrigger value="wallet">Wallet</TabsTrigger>
                </TabsList>

                <TabsContent value="card" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardName">Name on Card</Label>
                    <Input id="cardName" placeholder="John Doe" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input id="expiry" placeholder="MM/YY" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input id="cvv" placeholder="123" />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-sm">
                    <input type="checkbox" id="saveCard" className="rounded text-purple-600" />
                    <label htmlFor="saveCard">Save card for future payments</label>
                  </div>
                </TabsContent>

                <TabsContent value="bank" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input id="bankName" placeholder="Your Bank" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <Input id="accountNumber" placeholder="123456789" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="routingNumber">Routing Number</Label>
                    <Input id="routingNumber" placeholder="987654321" />
                  </div>
                </TabsContent>

                <TabsContent value="wallet" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border border-gray-800 rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-800 transition-colors">
                      <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center mb-2">
                        <span className="font-bold text-white">G</span>
                      </div>
                      <span>Google Pay</span>
                    </div>

                    <div className="border border-gray-800 rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-800 transition-colors">
                      <div className="h-12 w-12 rounded-full bg-black flex items-center justify-center mb-2 border border-white">
                        <span className="font-bold text-white">A</span>
                      </div>
                      <span>Apple Pay</span>
                    </div>

                    <div className="border border-gray-800 rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-800 transition-colors">
                      <div className="h-12 w-12 rounded-full bg-purple-500 flex items-center justify-center mb-2">
                        <span className="font-bold text-white">P</span>
                      </div>
                      <span>PayPal</span>
                    </div>

                    <div className="border border-gray-800 rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-800 transition-colors">
                      <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center mb-2">
                        <span className="font-bold text-white">V</span>
                      </div>
                      <span>Venmo</span>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <Button
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-6 text-lg"
              onClick={handlePayment}
            >
              Pay ${total.toFixed(2)}
            </Button>
          </motion.div>
        )}

        {paymentStep === "processing" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-md mx-auto text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold mb-2">Processing Payment</h2>
            <p className="text-gray-400">Please wait while we process your payment...</p>
          </motion.div>
        )}

        {paymentStep === "success" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", damping: 20 }}
            className="max-w-md mx-auto text-center py-12"
          >
            <div className="h-20 w-20 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-6">
              <Check className="h-10 w-10 text-white" />
            </div>

            <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
            <p className="text-gray-400 mb-8">Your parking slot has been successfully booked.</p>

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8">
              <div className="flex justify-center mb-4">
                <QrCode className="h-32 w-32 text-purple-400" />
              </div>
              <p className="text-sm text-gray-400 mb-2">Scan this QR code at the parking entrance</p>
              <p className="font-bold">Booking ID: PK-{Math.floor(Math.random() * 1000000)}</p>
            </div>

            <div className="space-y-4">
              <Button
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                onClick={() => router.push("/dashboard")}
              >
                Back to Dashboard
              </Button>

              <Button variant="outline" className="w-full" onClick={() => router.push("/bookings")}>
                View My Bookings
              </Button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  )
}

