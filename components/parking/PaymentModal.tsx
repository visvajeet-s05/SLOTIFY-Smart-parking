"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    CreditCard,
    Wallet,
    CheckCircle2,
    X,
    ShieldCheck,
    Clock,
    Car,
    Receipt,
    QrCode,
    Tag,
    Download
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import Confetti from "react-confetti"
import QRCode from "qrcode"

interface PaymentModalProps {
    isOpen: boolean
    onClose: () => void
    slot: { id: string; slotNumber: number; price: number }
    parkingArea: { id: string; name: string }
    duration: number
}

export default function PaymentModal({ isOpen, onClose, slot, parkingArea, duration }: PaymentModalProps) {
    const { toast } = useToast()
    const [paymentMethod, setPaymentMethod] = useState("card")
    const [isProcessing, setIsProcessing] = useState(false)
    const [step, setStep] = useState(1) // 1: Payment, 2: Success
    const [qrBase64, setQrBase64] = useState("")

    // Vehicle Data (State)
    const [licensePlate, setLicensePlate] = useState("")
    const [vehicleModel, setVehicleModel] = useState("")
    const [fastagId, setFastagId] = useState("")
    const [isLoadingProfile, setIsLoadingProfile] = useState(true)

    // Calculate window size for confetti
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })

    useEffect(() => {
        if (typeof window !== "undefined") {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight })
        }
    }, [])

    // Fetch profile data
    useEffect(() => {
        if (!isOpen) return

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
    }, [isOpen])

    const generateQR = async (data: string) => {
        try {
            const url = await QRCode.toDataURL(data)
            setQrBase64(url)
        } catch (err) {
            console.error(err)
        }
    }

    const pricePerHour = slot.price
    const subtotal = pricePerHour * duration
    const serviceFee = 10
    const total = subtotal + serviceFee

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
                    slotId: slot.id,
                    duration,
                    amount: total,
                    licensePlate,
                    vehicleModel,
                    parkingLotId: parkingArea.id
                })
            })

            if (res.ok) {
                const booking = await res.json()
                await generateQR(JSON.stringify({
                    bookingId: booking.id,
                    slot: slot.slotNumber,
                    plate: licensePlate
                }))
                setStep(2)
                toast({
                    title: "Design Perfect!",
                    description: `Booking confirmed for Slot S${slot.slotNumber}`,
                })
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

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl bg-slate-950 border-slate-800 text-white p-0 overflow-hidden sm:rounded-2xl">
                {step === 2 && <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={500} />}

                <div className="grid grid-cols-1 md:grid-cols-3 h-full max-h-[90vh] overflow-y-auto">
                    {/* Left Panel: Payment/Success */}
                    <div className="md:col-span-2 p-6 md:p-8 space-y-6 relative">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-4 top-4 text-slate-400 hover:text-white md:hidden"
                            onClick={onClose}
                        >
                            <X className="w-5 h-5" />
                        </Button>

                        <AnimatePresence mode="wait">
                            {step === 1 ? (
                                <motion.div
                                    key="payment"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 flex items-center gap-2">
                                        <CreditCard className="w-6 h-6 text-purple-400" />
                                        Secure Checkout
                                    </h2>

                                    {/* Vehicle Details */}
                                    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-4">
                                        <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                                            <Car className="w-4 h-4 text-cyan-400" /> Vehicle Information
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label className="text-xs text-slate-400">License Plate</Label>
                                                <Input
                                                    value={licensePlate}
                                                    onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                                                    placeholder="TN-01-AB-1234"
                                                    className="bg-slate-800/50 border-slate-700 h-9 text-sm uppercase"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-xs text-slate-400">Model</Label>
                                                <Input
                                                    value={vehicleModel}
                                                    onChange={(e) => setVehicleModel(e.target.value)}
                                                    placeholder="e.g. Honda City"
                                                    className="bg-slate-800/50 border-slate-700 h-9 text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment Method */}
                                    <div className="space-y-4">
                                        <Label className="text-slate-300">Select Payment Method</Label>
                                        <RadioGroup
                                            value={paymentMethod}
                                            onValueChange={setPaymentMethod}
                                            className="grid grid-cols-3 gap-3"
                                        >
                                            <Label
                                                htmlFor="card"
                                                className={`flex flex-col items-center justify-center p-3 rounded-xl border cursor-pointer transition-all ${paymentMethod === "card"
                                                    ? "border-purple-500 bg-purple-500/10 text-purple-400"
                                                    : "border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700 hover:bg-slate-800"
                                                    }`}
                                            >
                                                <RadioGroupItem value="card" id="card" className="sr-only" />
                                                <CreditCard className="w-5 h-5 mb-1" />
                                                <span className="text-xs font-medium">Card</span>
                                            </Label>

                                            <Label
                                                htmlFor="upi"
                                                className={`flex flex-col items-center justify-center p-3 rounded-xl border cursor-pointer transition-all ${paymentMethod === "upi"
                                                    ? "border-green-500 bg-green-500/10 text-green-400"
                                                    : "border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700 hover:bg-slate-800"
                                                    }`}
                                            >
                                                <RadioGroupItem value="upi" id="upi" className="sr-only" />
                                                <QrCode className="w-5 h-5 mb-1" />
                                                <span className="text-xs font-medium">UPI</span>
                                            </Label>

                                            <Label
                                                htmlFor="wallet"
                                                className={`flex flex-col items-center justify-center p-3 rounded-xl border cursor-pointer transition-all ${paymentMethod === "wallet"
                                                    ? "border-blue-500 bg-blue-500/10 text-blue-400"
                                                    : "border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700 hover:bg-slate-800"
                                                    }`}
                                            >
                                                <RadioGroupItem value="wallet" id="wallet" className="sr-only" />
                                                <Wallet className="w-5 h-5 mb-1" />
                                                <span className="text-xs font-medium">Wallet</span>
                                            </Label>
                                        </RadioGroup>
                                    </div>

                                    {/* Action Button */}
                                    <Button
                                        onClick={handlePayment}
                                        disabled={isProcessing}
                                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 h-12 text-lg font-bold shadow-lg shadow-purple-500/20"
                                    >
                                        {isProcessing ? "Processing..." : `Pay ₹${total}`}
                                    </Button>

                                    <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                                        <ShieldCheck className="w-3 h-3" />
                                        <span>Payments are 256-bit encrypted</span>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center justify-center h-full py-8 text-center space-y-6"
                                >
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-green-500 blur-xl opacity-20 rounded-full"></div>
                                        <div className="w-24 h-24 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center relative border border-green-500/20">
                                            <CheckCircle2 className="w-12 h-12" />
                                        </div>
                                    </div>

                                    <div>
                                        <h2 className="text-3xl font-bold text-white mb-2">Booking Confirmed!</h2>
                                        <p className="text-slate-400">Your spot S{slot.slotNumber} is reserved.</p>
                                    </div>

                                    {/* QR Code */}
                                    <div className="bg-white p-4 rounded-xl shadow-lg">
                                        {qrBase64 && <img src={qrBase64} alt="Booking QR" className="w-48 h-48 object-contain" />}
                                    </div>
                                    <p className="text-xs text-slate-500">Scan this at the entry gate</p>

                                    <div className="flex gap-3 w-full max-w-xs">
                                        <Button onClick={onClose} variant="outline" className="flex-1 border-slate-700 hover:bg-slate-800 text-slate-300">
                                            Close
                                        </Button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Right Panel: Summary */}
                    <div className="bg-slate-900 border-l border-slate-800 p-6 md:p-8 flex flex-col justify-between h-full">
                        <div>
                            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-white">
                                <Receipt className="w-5 h-5 text-cyan-400" />
                                Summary
                            </h3>

                            <div className="bg-slate-800/50 rounded-xl p-4 mb-6 border border-slate-700/50">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-400 font-bold text-xl border border-purple-500/20">
                                        S{slot.slotNumber}
                                    </div>
                                    <div>
                                        <p className="font-medium text-white">{parkingArea.name}</p>
                                        <p className="text-xs text-slate-400">{parkingArea.id}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 text-sm">
                                <div className="flex justify-between text-slate-400">
                                    <span className="flex items-center gap-2"><Clock className="w-3 h-3" /> Duration</span>
                                    <span className="text-white">{duration} Hours</span>
                                </div>
                                <div className="flex justify-between text-slate-400">
                                    <span>Rate</span>
                                    <span className="text-white">₹{pricePerHour}/hr</span>
                                </div>
                                <Separator className="bg-slate-800" />
                                <div className="flex justify-between text-slate-400">
                                    <span>Subtotal</span>
                                    <span className="text-white">₹{subtotal}</span>
                                </div>
                                <div className="flex justify-between text-slate-400">
                                    <span>Service Fee</span>
                                    <span className="text-white">₹{serviceFee}</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-800 mt-6">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-slate-400">Total Amount</span>
                                <span className="text-2xl font-bold text-cyan-400">₹{total}</span>
                            </div>
                            <p className="text-xs text-slate-500 text-right">Includes all taxes</p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
