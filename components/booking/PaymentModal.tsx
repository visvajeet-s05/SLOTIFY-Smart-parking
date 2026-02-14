"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    CreditCard,
    CheckCircle2,
    ShieldCheck,
    Clock,
    Car,
    Receipt,
    QrCode,
    Tag,
    X,
    Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import Confetti from "react-confetti"
import QRCode from "qrcode"
import { useRouter } from "next/navigation"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, PaymentElement, LinkAuthenticationElement, useStripe, useElements } from "@stripe/react-stripe-js"

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

type PaymentModalProps = {
    isOpen: boolean
    onClose: () => void
    slotId: string
    slotNumber: string
    parkingName: string
    parkingLotId: string
    pricePerHour: number
    duration: number
    onSuccess: () => void
}

export default function PaymentModal({
    isOpen,
    onClose,
    slotId,
    slotNumber,
    parkingName,
    parkingLotId,
    pricePerHour,
    duration,
    onSuccess
}: PaymentModalProps) {
    const { toast } = useToast()
    const [clientSecret, setClientSecret] = useState("")
    const [bookingId, setBookingId] = useState("")
    const [isMock, setIsMock] = useState(false)

    const subtotal = pricePerHour * duration
    const serviceFee = 10
    const total = subtotal + serviceFee

    // Fetch Client Secret on Open
    useEffect(() => {
        if (isOpen) {
            const createIntent = async () => {
                try {
                    const res = await fetch("/api/payments/create-intent", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            slotId,
                            duration,
                            amount: total,
                            parkingLotId,
                            currency: "inr" // Assuming INR based on previous code context
                        })
                    })

                    if (!res.ok) {
                        throw new Error(await res.text())
                    }

                    const data = await res.json()
                    setClientSecret(data.clientSecret)
                    setBookingId(data.bookingId)
                    setIsMock(data.isMock)
                } catch (error) {
                    console.error("Failed to init payment", error)
                    toast({
                        title: "Initialization Failed",
                        description: "Could not set up payment. Please try again.",
                        variant: "destructive"
                    })
                    // onClose() // Optional: auto close on fail
                }
            }
            createIntent()
        }
    }, [isOpen, slotId, duration, total, parkingLotId, toast])

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative"
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-slate-900 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition z-50"
                    >
                        <X size={20} />
                    </button>

                    {clientSecret && clientSecret.startsWith("mock_secret") ? (
                        <div className="h-full flex flex-col">
                            <CheckoutContent
                                clientSecret={clientSecret}
                                bookingId={bookingId}
                                total={total}
                                slotNumber={slotNumber}
                                parkingName={parkingName}
                                duration={duration}
                                pricePerHour={pricePerHour}
                                subtotal={subtotal}
                                serviceFee={serviceFee}
                                onSuccess={onSuccess}
                                onClose={onClose}
                                isMock={true}
                                slotId={slotId}
                                parkingLotId={parkingLotId}
                            />
                        </div>
                    ) : clientSecret ? (
                        <Elements
                            stripe={stripePromise}
                            options={{
                                clientSecret,
                                appearance: {
                                    theme: 'night',
                                    variables: {
                                        colorPrimary: '#06b6d4',
                                        colorBackground: '#0f172a',
                                        colorText: '#f8fafc',
                                        colorDanger: '#ef4444',
                                        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                                        borderRadius: '12px',
                                    }
                                }
                            }}
                        >
                            <CheckoutContent
                                clientSecret={clientSecret}
                                bookingId={bookingId}
                                total={total}
                                slotNumber={slotNumber}
                                parkingName={parkingName}
                                duration={duration}
                                pricePerHour={pricePerHour}
                                subtotal={subtotal}
                                serviceFee={serviceFee}
                                onSuccess={onSuccess}
                                onClose={onClose}
                                isMock={isMock}
                                slotId={slotId}
                                parkingLotId={parkingLotId}
                            />
                        </Elements>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-96 gap-4">
                            <Loader2 className="w-12 h-12 text-cyan-500 animate-spin" />
                            <p className="text-slate-400 font-medium">Initializing Secure Payment...</p>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    )
}

function CheckoutContent({
    clientSecret,
    bookingId,
    total,
    slotNumber,
    parkingName,
    duration,
    pricePerHour,
    subtotal,
    serviceFee,
    onSuccess,
    onClose,
    isMock = false,
    slotId,
    parkingLotId
}: any) {
    const stripe = isMock ? null : useStripe()
    const elements = isMock ? null : useElements()
    const { toast } = useToast()
    const router = useRouter()

    const [step, setStep] = useState(1)
    const [isProcessing, setIsProcessing] = useState(false)
    const [qrBase64, setQrBase64] = useState("")
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })

    // Vehicle Data
    const [licensePlate, setLicensePlate] = useState("")
    const [vehicleModel, setVehicleModel] = useState("")
    const [isLoadingProfile, setIsLoadingProfile] = useState(true)

    useEffect(() => {
        if (typeof window !== "undefined") {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight })
        }

        // Fetch Profile
        const fetchProfile = async () => {
            try {
                const res = await fetch("/api/user/profile")
                if (res.ok) {
                    const data = await res.json()
                    if (data.vehicle) {
                        setLicensePlate(data.vehicle.licensePlate)
                        setVehicleModel(data.vehicle.model)
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

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!isMock && (!stripe || !elements)) return

        if (!licensePlate || !vehicleModel) {
            toast({
                title: "Missing Details",
                description: "Please enter your vehicle information.",
                variant: "destructive"
            })
            return
        }

        setIsProcessing(true)

        // --- MOCK FLOW ---
        if (isMock) {
            setTimeout(async () => {
                try {
                    // 1. Confirm Booking API
                    await fetch("/api/bookings/confirm", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            bookingId,
                            slotId,
                            parkingLotId,
                            paymentId: "MOCK_PAYMENT_" + Date.now()
                        })
                    })

                    // 2. Generate QR
                    const url = await QRCode.toDataURL(JSON.stringify({
                        bookingId: bookingId,
                        slot: slotNumber,
                        plate: licensePlate,
                        paymentId: "MOCK_PAYMENT_" + Date.now()
                    }))
                    setQrBase64(url)
                    setStep(2)

                    toast({
                        title: "Payment Successful (Test Mode)",
                        description: `Booking confirmed for Slot S${slotNumber}`,
                    })
                    onSuccess()
                } catch (err) {
                    console.error(err)
                    toast({ title: "Error", description: "Mock payment failed", variant: "destructive" })
                } finally {
                    setIsProcessing(false)
                }
            }, 2000)
            return
        }

        // --- STRIPE FLOW ---
        try {
            // 1. Confirm Payment with Stripe
            const { error, paymentIntent } = await stripe!.confirmPayment({
                elements: elements!,
                redirect: "if_required",
                confirmParams: {
                    return_url: `${window.location.origin}/dashboard`,
                    payment_method_data: {
                        billing_details: { name: licensePlate }
                    }
                }
            })

            if (error) {
                toast({
                    title: "Payment Failed",
                    description: error.message || "An error occurred with your payment",
                    variant: "destructive"
                })
            } else if (paymentIntent && paymentIntent.status === "succeeded") {

                // 2. Confirm Booking API (Update Slot Status)
                try {
                    await fetch("/api/bookings/confirm", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            bookingId,
                            slotId,
                            parkingLotId,
                            paymentId: paymentIntent.id
                        })
                    })
                } catch (confirmError) {
                    console.error("Failed to confirm booking backend:", confirmError)
                    // We continue to show success because payment worked, but warn support
                }

                // 3. Generate QR
                try {
                    const url = await QRCode.toDataURL(JSON.stringify({
                        bookingId: bookingId,
                        slot: slotNumber,
                        plate: licensePlate,
                        paymentId: paymentIntent.id
                    }))
                    setQrBase64(url)
                } catch (err) {
                    console.error("QR Error", err)
                }

                setStep(2)
                toast({
                    title: "Payment Successful",
                    description: `Booking confirmed for Slot S${slotNumber}`,
                })
                onSuccess()
            }
        } catch (err) {
            console.error(err)
            toast({
                title: "Error",
                description: "An unexpected error occurred.",
                variant: "destructive"
            })
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <AnimatePresence mode="wait">
            {step === 1 ? (
                <motion.div
                    key="payment-form"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex flex-col lg:flex-row h-full overflow-hidden"
                >
                    {/* Left Side: Summary */}
                    <div className="lg:w-1/3 bg-slate-900/80 p-6 border-r border-slate-800/50 overflow-y-auto">
                        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-white">
                            <Receipt className="w-5 h-5 text-cyan-400" />
                            Booking Summary
                        </h3>

                        <div className="space-y-6">
                            <div className="bg-slate-800/30 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-xl flex items-center justify-center text-purple-400 font-black text-2xl border border-purple-500/30 shadow-inner">
                                        S{slotNumber}
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Selected Slot</p>
                                        <p className="font-bold text-white text-lg leading-tight">{parkingName}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 px-1">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500 flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-slate-600" /> Duration
                                    </span>
                                    <span className="text-white font-semibold">{duration} Hours</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500 flex items-center gap-2">
                                        <Tag className="w-4 h-4 text-slate-600" /> Rate
                                    </span>
                                    <span className="text-white font-semibold">₹{pricePerHour}/hr</span>
                                </div>
                            </div>

                            <div className="h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent" />

                            <div className="space-y-4 px-1">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Subtotal</span>
                                    <span className="text-slate-300">₹{subtotal}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Service Fee</span>
                                    <span className="text-slate-300">₹{serviceFee}</span>
                                </div>
                                <div className="flex justify-between items-end pt-2">
                                    <div>
                                        <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Total Amount</span>
                                        <div className="text-3xl font-black text-cyan-400 tabular-nums">₹{total}</div>
                                    </div>
                                    <div className="text-[10px] text-slate-600 italic">Incl. all taxes</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Payment Form */}
                    <div className="lg:w-2/3 p-8 bg-slate-950/50 overflow-y-auto custom-scrollbar text-white relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[100px] -z-10" />

                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-3">
                                Checkout
                                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-bold uppercase tracking-widest border border-white/5">
                                    Secure
                                </span>
                            </h2>
                            <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                                <ShieldCheck size={14} className="text-emerald-500" />
                                SSL Encrypted
                            </div>
                        </div>

                        <form onSubmit={handlePayment} className="space-y-8">
                            {/* Vehicle Details */}
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Car className="w-3 h-3" />
                                    Vehicle Specification
                                </h3>
                                <div className="grid md:grid-cols-2 gap-5 relative">
                                    {isLoadingProfile && (
                                        <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] flex items-center justify-center z-10 rounded-2xl border border-white/5">
                                            <div className="w-8 h-8 rounded-full border-2 border-cyan-500/20 border-t-cyan-500 animate-spin" />
                                        </div>
                                    )}
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-slate-400 ml-1">License Plate</Label>
                                        <Input
                                            value={licensePlate}
                                            onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                                            placeholder="TN-01-AB-1234"
                                            className="h-12 bg-white/5 border-white/10 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all uppercase font-mono tracking-widest text-lg"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-slate-400 ml-1">Vehicle Model</Label>
                                        <Input
                                            value={vehicleModel}
                                            onChange={(e) => setVehicleModel(e.target.value)}
                                            placeholder="e.g. Honda City"
                                            className="h-12 bg-white/5 border-white/10 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all text-white font-medium"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Payment Element */}
                            <div className="space-y-4 pt-4 border-t border-white/5">
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <CreditCard className="w-3 h-3" />
                                    Payment Details
                                </h3>

                                {isMock ? (
                                    <div className="bg-slate-900/50 p-6 rounded-xl border border-dashed border-emerald-500/30 relative overflow-hidden group">
                                        <div className="absolute top-2 right-2 bg-emerald-500/90 text-black text-[10px] font-black px-2 py-0.5 rounded shadow-lg uppercase tracking-widest z-10">SANDBOX ENV</div>
                                        <div className="space-y-4 opacity-75 grayscale transition-all group-hover:grayscale-0">
                                            <div className="space-y-2">
                                                <Label className="text-xs text-slate-500">Card Number</Label>
                                                <div className="h-10 bg-white/5 border border-white/10 rounded flex items-center px-3 font-mono text-slate-400">
                                                    xxxx xxxx xxxx 4242
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-xs text-slate-500">Expiry</Label>
                                                    <div className="h-10 bg-white/5 border border-white/10 rounded flex items-center px-3 font-mono text-slate-400">
                                                        12/28
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs text-slate-500">CVC</Label>
                                                    <div className="h-10 bg-white/5 border border-white/10 rounded flex items-center px-3 font-mono text-slate-400">
                                                        •••
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-center text-xs text-emerald-500/80 mt-4 font-bold uppercase tracking-widest animate-pulse">
                                            Secure Sandbox Channel Active
                                        </p>
                                    </div>
                                ) : (
                                    <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5 space-y-4">
                                        <LinkAuthenticationElement />
                                        <PaymentElement options={{ layout: "tabs" }} />
                                    </div>
                                )}

                                <div className="pt-6">
                                    <Button
                                        type="submit"
                                        disabled={(!stripe && !isMock) || isProcessing}
                                        className="w-full h-14 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-lg rounded-2xl shadow-[0_10px_30px_rgba(6,182,212,0.3)] transition-all hover:scale-[1.02] active:scale-95 disabled:grayscale"
                                    >
                                        {isProcessing ? (
                                            <span className="flex items-center gap-3">
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Processing Securely...
                                            </span>
                                        ) : (
                                            `Pay Now • ₹${total}`
                                        )}
                                    </Button>
                                    <p className="text-center text-[10px] text-slate-600 mt-4 flex items-center justify-center gap-2 font-bold uppercase tracking-widest">
                                        <ShieldCheck size={10} className="text-emerald-600" />
                                        PCI-DSS Compliant Secure Checkout
                                    </p>
                                </div>
                            </div>
                        </form>
                    </div>
                </motion.div>
            ) : (
                <motion.div
                    key="success-screen"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center p-10 text-center h-full relative overflow-hidden bg-slate-950"
                >
                    {/* Immersive Confetti Effect */}
                    <div className="absolute inset-0 pointer-events-none z-0">
                        <Confetti
                            width={windowSize.width}
                            height={windowSize.height}
                            recycle={false}
                            numberOfPieces={1200}
                            gravity={0.15}
                            colors={['#06b6d4', '#3b82f6', '#10b981', '#ffffff', '#8b5cf6']}
                        />
                    </div>

                    {/* Radial background glow */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.15)_0%,transparent_70%)] animate-pulse-soft pointer-events-none" />

                    <div className="relative z-10 flex flex-col items-center max-w-2xl w-full">
                        <motion.div
                            initial={{ scale: 0, rotate: -45 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
                            className="w-24 h-24 bg-gradient-to-br from-cyan-400 via-emerald-500 to-emerald-600 rounded-[2rem] flex items-center justify-center mb-8 shadow-[0_0_80px_rgba(16,185,129,0.4)] border-4 border-slate-950 relative"
                        >
                            <CheckCircle2 className="w-12 h-12 text-white" strokeWidth={3} />
                            <div className="absolute inset-0 rounded-[2rem] animate-ping bg-emerald-500/20 scale-125" />
                        </motion.div>

                        <div className="space-y-2 mb-8">
                            <motion.h2
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-400 to-emerald-500"
                            >
                                Payment Successful!
                            </motion.h2>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="text-slate-500 text-xs font-black uppercase tracking-[0.4em]"
                            >
                                Transaction ID: #{bookingId || "CONFIRMED"}
                            </motion.div>
                        </div>

                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-slate-400 max-w-md mx-auto mb-10 text-lg leading-relaxed font-medium"
                        >
                            You're all set! Slot <span className="text-white font-black px-2 py-1 bg-white/10 rounded-lg border border-white/10">S{slotNumber}</span> at <span className="text-cyan-400 font-bold">{parkingName}</span> is reserved for your arrival.
                        </motion.p>

                        <motion.div
                            initial={{ scale: 1.1, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            transition={{ delay: 0.7, type: "spring", damping: 15 }}
                            className="bg-white p-5 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.5)] mb-12 relative group group-hover:cursor-none"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-500 rounded-[2.5rem] blur-2xl opacity-30 group-hover:opacity-60 transition-all duration-1000 animate-spin-slow" />

                            <div className="relative bg-white p-3 rounded-3xl border border-gray-100 flex flex-col items-center">
                                {qrBase64 ? (
                                    <img src={qrBase64} alt="Entry QR" className="w-56 h-56 object-contain" />
                                ) : (
                                    <div className="w-56 h-56 flex items-center justify-center bg-gray-50 rounded-2xl">
                                        <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-cyan-500 animate-spin" />
                                    </div>
                                )}
                                <div className="mt-4 flex flex-col items-center">
                                    <div className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">Entry Pass Code</div>
                                    <div className="text-sm font-mono font-black text-slate-900 bg-slate-100 px-4 py-1.5 rounded-full border border-slate-200">
                                        SLC-{slotNumber}-{licensePlate.split('-').pop() || "XXXX"}
                                    </div>
                                </div>
                            </div>
                            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-slate-950 text-white text-[10px] font-black px-5 py-2 rounded-full border border-white/10 shadow-2xl whitespace-nowrap tracking-[0.2em] flex items-center gap-2">
                                <QrCode size={12} className="text-cyan-400" />
                                SECURE ENTRY PASS
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.9 }}
                            className="flex flex-col sm:flex-row gap-4 w-full justify-center"
                        >
                            <Button
                                onClick={() => router.push("/dashboard")}
                                className="h-14 px-10 bg-slate-900 hover:bg-slate-800 text-white border border-white/5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                            >
                                Back to Dashboard
                            </Button>
                            <Button
                                onClick={onClose}
                                className="h-14 px-10 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-[0_10px_30px_rgba(6,182,212,0.2)] transition-all hover:scale-[1.05]"
                            >
                                Close Ticket
                            </Button>
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
