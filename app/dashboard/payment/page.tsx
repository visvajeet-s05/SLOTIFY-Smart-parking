"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
    CreditCard,
    Wallet,
    CheckCircle2,
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
import Confetti from "react-confetti"
import QRCode from "qrcode"

export default function PaymentPage() {
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
    const [step, setStep] = useState(1) // 1: Review, 2: Payment, 3: Success
    const [qrBase64, setQrBase64] = useState("")
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })

    useEffect(() => {
        if (typeof window !== "undefined") {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight })
        }
    }, [])

    // Vehicle Data
    const [licensePlate, setLicensePlate] = useState("")
    const [vehicleModel, setVehicleModel] = useState("")
    const [fastagId, setFastagId] = useState("")
    const [isLoadingProfile, setIsLoadingProfile] = useState(true)

    // Calculations
    const subtotal = pricePerHour * duration
    const serviceFee = 10
    const total = subtotal + serviceFee

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
            } finally {
                setIsLoadingProfile(false)
            }
        }
        fetchProfile()
    }, [])

    const handlePayment = async () => {
        if (!licensePlate || !vehicleModel) {
            toast({
                title: "Missing Details",
                description: "Please enter your vehicle information.",
                variant: "destructive"
            })
            return
        }

        setIsProcessing(true)

        try {
            const res = await fetch("/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    slotId,
                    duration,
                    amount: total,
                    licensePlate,
                    vehicleModel,
                    parkingLotId
                })
            })

            if (res.ok) {
                const booking = await res.json()
                try {
                    const url = await QRCode.toDataURL(JSON.stringify({
                        bookingId: booking.id,
                        slot: slotNumber,
                        plate: licensePlate
                    }))
                    setQrBase64(url)
                } catch (err) {
                    console.error(err)
                }

                setStep(3)
                toast({
                    title: "Payment Successful",
                    description: `Booking confirmed for Slot S${slotNumber}`,
                })

                setTimeout(() => {
                    router.push("/dashboard")
                }, 3000)
            } else {
                const err = await res.text()
                toast({
                    title: "Booking Failed",
                    description: err || "Something went wrong. Please try again.",
                    variant: "destructive"
                })
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to process payment. Please check your connection.",
                variant: "destructive"
            })
        } finally {
            setIsProcessing(false)
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
        <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-purple-500/30">
            <div className="max-w-4xl mx-auto px-6 py-12">

                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className="hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                            Secure Payment
                        </h1>
                        <p className="text-slate-400 text-sm">Complete your booking for {parkingName}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">

                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="space-y-6"
                                >
                                    {/* Vehicle Details Card */}
                                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl relative overflow-hidden">
                                        {isLoadingProfile && (
                                            <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center z-10">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
                                            </div>
                                        )}

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
                                                    className="bg-slate-800/50 border-slate-700 focus:border-cyan-500 transition-colors uppercase"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-slate-400">Vehicle Model</Label>
                                                <Input
                                                    value={vehicleModel}
                                                    onChange={(e) => setVehicleModel(e.target.value)}
                                                    placeholder="e.g. Honda City"
                                                    className="bg-slate-800/50 border-slate-700 focus:border-cyan-500 transition-colors"
                                                />
                                            </div>

                                            {/* Fastag Section */}
                                            <div className="space-y-2 md:col-span-2">
                                                <Label className="text-slate-400 flex items-center gap-2">
                                                    <Tag className="w-3 h-3 text-yellow-500" />
                                                    Linked Fastag ID
                                                </Label>
                                                <Input
                                                    value={fastagId || "No FASTag Linked"}
                                                    readOnly
                                                    className={`bg-slate-800/50 border-slate-700 ${fastagId ? 'text-green-400' : 'text-slate-500 italic'}`}
                                                />
                                                {fastagId && <p className="text-xs text-green-500/80 mt-1">Automatic deduction enabled</p>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment Method Card */}
                                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl">
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
                                                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === "card"
                                                    ? "border-purple-500 bg-purple-500/10 text-purple-400"
                                                    : "border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700"
                                                    }`}
                                            >
                                                <RadioGroupItem value="card" id="card" className="sr-only" />
                                                <CreditCard className="w-6 h-6 mb-2" />
                                                <span className="font-medium">Card</span>
                                            </Label>

                                            <Label
                                                htmlFor="upi"
                                                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === "upi"
                                                    ? "border-green-500 bg-green-500/10 text-green-400"
                                                    : "border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700"
                                                    }`}
                                            >
                                                <RadioGroupItem value="upi" id="upi" className="sr-only" />
                                                <QrCode className="w-6 h-6 mb-2" />
                                                <span className="font-medium">UPI</span>
                                            </Label>

                                            <Label
                                                htmlFor="wallet"
                                                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === "wallet"
                                                    ? "border-blue-500 bg-blue-500/10 text-blue-400"
                                                    : "border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700"
                                                    }`}
                                            >
                                                <RadioGroupItem value="wallet" id="wallet" className="sr-only" />
                                                <Wallet className="w-6 h-6 mb-2" />
                                                <span className="font-medium">Wallet</span>
                                            </Label>
                                        </RadioGroup>

                                        {/* Card Input Fields (Conditional) */}
                                        <AnimatePresence>
                                            {paymentMethod === "card" && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="mt-6 space-y-4 pt-4 border-t border-slate-800"
                                                >
                                                    <div className="space-y-2">
                                                        <Label className="text-slate-400">Card Number</Label>
                                                        <Input placeholder="0000 0000 0000 0000" className="bg-slate-800/50 border-slate-700" />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label className="text-slate-400">Expiry</Label>
                                                            <Input placeholder="MM/YY" className="bg-slate-800/50 border-slate-700" />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-slate-400">CVC</Label>
                                                            <Input placeholder="123" maxLength={3} className="bg-slate-800/50 border-slate-700" />
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <Button
                                            onClick={handlePayment}
                                            disabled={isProcessing}
                                            className="w-full mt-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 h-12 text-lg font-semibold shadow-lg shadow-purple-500/20"
                                        >
                                            {isProcessing ? (
                                                <span className="flex items-center gap-2">
                                                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                                                    Processing...
                                                </span>
                                            ) : (
                                                `Pay ₹${total}`
                                            )}
                                        </Button>

                                        <p className="text-center text-xs text-slate-500 mt-4 flex items-center justify-center gap-2">
                                            <ShieldCheck className="w-3 h-3" />
                                            Payments are encrypted and secure
                                        </p>
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center backdrop-blur-xl flex flex-col items-center justify-center min-h-[400px]"
                                >
                                    <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6">
                                        <CheckCircle2 className="w-10 h-10" />
                                    </div>
                                    <h2 className="text-3xl font-bold mb-2">Payment Successful!</h2>
                                    <p className="text-slate-400 max-w-md mx-auto mb-8">
                                        Your booking for Slot <span className="text-white font-semibold">S{slotNumber}</span> has been confirmed. You will receive a confirmation email shortly.
                                    </p>

                                    <div className="bg-white p-4 rounded-xl shadow-lg mb-8">
                                        {qrBase64 && <img src={qrBase64} alt="Booking QR" className="w-48 h-48 object-contain" />}
                                    </div>

                                    <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={500} />
                                    <Button
                                        onClick={() => router.push("/dashboard")}
                                        variant="outline"
                                        className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800"
                                    >
                                        Return to Dashboard
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Sidebar Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sticky top-24">
                            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                <Receipt className="w-5 h-5 text-cyan-400" />
                                Booking Summary
                            </h3>

                            <div className="space-y-6">
                                <div className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-800">
                                    <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-400 font-bold text-xl border border-purple-500/20">
                                        S{slotNumber}
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-400">Selected Slot</p>
                                        <p className="font-semibold text-white">{parkingName}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400 flex items-center gap-2">
                                            <Clock className="w-3 h-3" /> Duration
                                        </span>
                                        <span className="text-white">{duration} Hours</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">Rate</span>
                                        <span className="text-white">₹{pricePerHour}/hr</span>
                                    </div>
                                </div>

                                <Separator className="bg-slate-800" />

                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">Subtotal</span>
                                        <span className="text-white">₹{subtotal}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">Service Fee</span>
                                        <span className="text-white">₹{serviceFee}</span>
                                    </div>
                                    <div className="flex justify-between text-base font-semibold pt-2 border-t border-slate-800">
                                        <span className="text-white">Total Amount</span>
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
