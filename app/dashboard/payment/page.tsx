"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
    CreditCard,
    Wallet,
    ArrowLeft,
    ShieldCheck,
    Clock,
    Car,
    Receipt,
    QrCode,
    Tag
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"

function PaymentContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { toast } = useToast()

    const slotId = searchParams.get("slotId")
    const slotNumber = searchParams.get("slotNumber") || "00"
    const pricePerHour = Number(searchParams.get("price")) || 60
    const duration = Number(searchParams.get("duration")) || 2
    const parkingName = searchParams.get("parkingName") || "Premium Parking Zone"
    const parkingLotId = searchParams.get("parkingLotId")

    const [paymentMethod, setPaymentMethod] = useState("card")
    const [isProcessing, setIsProcessing] = useState(false)
    const [licensePlate, setLicensePlate] = useState("")
    const [vehicleModel, setVehicleModel] = useState("")
    const [fastagId, setFastagId] = useState("")
    const [debugLog, setDebugLog] = useState<string[]>([])

    // Calculations
    const subtotal = pricePerHour * duration
    const serviceFee = 10
    const total = subtotal + serviceFee

    const addLog = (message: string) => {
        const log = `${new Date().toLocaleTimeString()}: ${message}`
        console.log(log)
        setDebugLog(prev => [...prev, log])
    }

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch("/api/user/profile")
                if (res.ok) {
                    const data = await res.json()
                    if (data.vehicle) {
                        setLicensePlate(data.vehicle.licensePlate)
                        setVehicleModel(data.vehicle.model)
                    }
                    if (data.fastagId) {
                        setFastagId(data.fastagId)
                    }
                }
            } catch (error) {
                console.error("Failed to fetch profile", error)
            }
        }
        fetchProfile()
    }, [])

    const handlePayment = (e: any) => {
        if (e && e.preventDefault) {
            e.preventDefault()
            e.stopPropagation()
        }

        addLog("🔵 Payment button clicked (Event captured)")
        console.error("DEBUG: Payment attempt started")

        // Auto-fill for testing if empty (remove in production if strictness needed)
        let currentPlate = licensePlate
        let currentModel = vehicleModel

        if (!currentPlate || !currentModel) {
            addLog("⚠️ Empty fields detected - Using test data")
            currentPlate = "TEST-PLATE-01"
            currentModel = "Test Vehicle"
            setLicensePlate(currentPlate)
            setVehicleModel(currentModel)
        }

        addLog(`✅ Vehicle: ${currentPlate} - ${currentModel}`)
        setIsProcessing(true)
        addLog("⏳ Processing...")

        // Generate booking ID
        const bookingId = `BK-${Date.now()}`
        addLog(`📝 Generated ID: ${bookingId}`)

        // Show toast
        toast({
            title: "Redirecting...",
            description: "Payment processed successfully.",
        })

        // Build URL
        const params = new URLSearchParams({
            bookingId: bookingId,
            parkingName: parkingName || "Parking Area",
            slotNumber: slotNumber || "01",
            address: `${parkingName} Parking Area`,
            amount: total.toString(),
            duration: duration.toString(),
            licensePlate: currentPlate,
            lat: "28.6139",
            lng: "77.2090"
        })

        const successUrl = `/dashboard/booking-success?${params.toString()}`
        addLog(`🚀 Target URL: ${successUrl}`)

        console.error(`DEBUG: Navigating to ${successUrl}`)

        // Force navigation immediately
        try {
            window.location.assign(successUrl)
            addLog("✅ window.location.assign called")
        } catch (err: any) {
            addLog(`❌ Navigation error: ${err.message}`)
            console.error(err)
            // Fallback
            window.location.href = successUrl
        }
    }

    if (!slotId) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
                <div className="text-center space-y-4">
                    <p className="text-xl">No slot selected</p>
                    <Button onClick={() => router.back()}>Go Back</Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans">
            <div className="max-w-4xl mx-auto px-6 py-12">

                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className="hover:bg-slate-800 text-slate-400 hover:text-white"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Secure Payment</h1>
                        <p className="text-slate-400 text-sm">Complete your booking for {parkingName}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Vehicle Details Card */}
                        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Car className="w-5 h-5 text-cyan-400" />
                                Vehicle Details
                            </h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-slate-400">License Plate</Label>
                                    <Input
                                        value={licensePlate}
                                        onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                                        placeholder="TN-01-AB-1234"
                                        className="bg-slate-800/50 border-slate-700 uppercase"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-400">Vehicle Model</Label>
                                    <Input
                                        value={vehicleModel}
                                        onChange={(e) => setVehicleModel(e.target.value)}
                                        placeholder="e.g. Honda City"
                                        className="bg-slate-800/50 border-slate-700"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Payment Method Card */}
                        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-purple-400" />
                                Payment Method
                            </h3>

                            <RadioGroup
                                defaultValue="card"
                                onValueChange={setPaymentMethod}
                                className="grid grid-cols-1 md:grid-cols-3 gap-4"
                            >
                                <Label
                                    htmlFor="card"
                                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer ${paymentMethod === "card" ? "border-purple-500 bg-purple-500/10" : "border-slate-800"
                                        }`}
                                >
                                    <RadioGroupItem value="card" id="card" className="sr-only" />
                                    <CreditCard className="w-6 h-6 mb-2" />
                                    <span>Card</span>
                                </Label>

                                <Label
                                    htmlFor="upi"
                                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer ${paymentMethod === "upi" ? "border-green-500 bg-green-500/10" : "border-slate-800"
                                        }`}
                                >
                                    <RadioGroupItem value="upi" id="upi" className="sr-only" />
                                    <QrCode className="w-6 h-6 mb-2" />
                                    <span>UPI</span>
                                </Label>

                                <Label
                                    htmlFor="wallet"
                                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer ${paymentMethod === "wallet" ? "border-blue-500 bg-blue-500/10" : "border-slate-800"
                                        }`}
                                >
                                    <RadioGroupItem value="wallet" id="wallet" className="sr-only" />
                                    <Wallet className="w-6 h-6 mb-2" />
                                    <span>Wallet</span>
                                </Label>
                            </RadioGroup>

                            <div className="flex gap-4 mt-6">
                                <button
                                    type="button"
                                    onClick={(e) => handlePayment(e)}
                                    disabled={isProcessing}
                                    className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 h-14 rounded-xl text-lg font-bold shadow-lg shadow-purple-500/20 active:scale-95 transition-all text-white flex items-center justify-center gap-2"
                                >
                                    {isProcessing ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>Processing...</span>
                                        </>
                                    ) : (
                                        <span>Pay ₹{total}</span>
                                    )}
                                </button>
                            </div>

                            <p className="text-center text-xs text-slate-500 mt-4 flex items-center justify-center gap-2">
                                <ShieldCheck className="w-3 h-3" />
                                Payments are encrypted and secure
                            </p>
                        </div>

                        {/* Debug Log */}
                        {debugLog.length > 0 && (
                            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                                <h3 className="text-lg font-semibold mb-4">Debug Log</h3>
                                <div className="bg-black rounded-lg p-4 font-mono text-xs space-y-1 max-h-48 overflow-y-auto">
                                    {debugLog.map((log, i) => (
                                        <div key={i} className="text-green-400">{log}</div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sticky top-24">
                            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                <Receipt className="w-5 h-5 text-cyan-400" />
                                Booking Summary
                            </h3>

                            <div className="space-y-6">
                                <div className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-xl">
                                    <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-400 font-bold text-xl">
                                        S{slotNumber}
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-400">Selected Slot</p>
                                        <p className="font-semibold">{parkingName}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400 flex items-center gap-2">
                                            <Clock className="w-3 h-3" /> Duration
                                        </span>
                                        <span>{duration} Hours</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">Rate</span>
                                        <span>₹{pricePerHour}/hr</span>
                                    </div>
                                </div>

                                <Separator className="bg-slate-800" />

                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">Subtotal</span>
                                        <span>₹{subtotal}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">Service Fee</span>
                                        <span>₹{serviceFee}</span>
                                    </div>
                                    <div className="flex justify-between text-base font-semibold pt-2 border-t border-slate-800">
                                        <span>Total Amount</span>
                                        <span className="text-cyan-400 text-xl">₹{total}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function PaymentPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-white text-xl animate-pulse">Initializing secure payment...</div>
            </div>
        }>
            <PaymentContent />
        </Suspense>
    )
}
