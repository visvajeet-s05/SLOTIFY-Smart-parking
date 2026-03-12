"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
    CheckCircle2,
    MapPin,
    Calendar,
    Clock,
    Car,
    CreditCard,
    Download,
    Home,
    BookOpen,
    Navigation,
    Share2,
    AlertCircle,
    XCircle,
    DollarSign
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Confetti from "react-confetti"
import QRCode from "qrcode"

function BookingSuccessContent() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [qrBase64, setQrBase64] = useState("")
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })
    const [bookingData, setBookingData] = useState<any>(null)

    // Get booking data from URL params
    const bookingId = searchParams.get("bookingId") || "BK890632"
    const parkingName = searchParams.get("parkingName") || "Downtown Parking Complex"
    const slotNumber = searchParams.get("slotNumber") || "C7"
    const address = searchParams.get("address") || "123 Main St, Downtown"
    const amount = searchParams.get("amount") || "13.18"
    const duration = searchParams.get("duration") || "2"
    const licensePlate = searchParams.get("licensePlate") || ""
    const lat = searchParams.get("lat") || "28.6139"
    const lng = searchParams.get("lng") || "77.2090"

    useEffect(() => {
        if (typeof window !== "undefined") {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight })
        }
    }, [])

    useEffect(() => {
        // Generate QR Code
        const generateQR = async () => {
            try {
                const qrData = {
                    bookingId,
                    slot: slotNumber,
                    plate: licensePlate,
                    time: new Date().toISOString()
                }
                const url = await QRCode.toDataURL(JSON.stringify(qrData), {
                    width: 300,
                    margin: 2,
                    color: {
                        dark: "#000000",
                        light: "#FFFFFF"
                    }
                })
                setQrBase64(url)
            } catch (err) {
                console.error("QR Generation Error:", err)
            }
        }
        generateQR()
    }, [bookingId, slotNumber, licensePlate])

    const currentDate = new Date()
    const formattedDate = currentDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
    const formattedTime = currentDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })

    const handleDownloadQR = () => {
        if (!qrBase64) return
        const link = document.createElement('a')
        link.href = qrBase64
        link.download = `booking-${bookingId}-qr.png`
        link.click()
    }

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Parking Booking Confirmed',
                    text: `Booking ID: ${bookingId}\nSlot: ${slotNumber}\nParking: ${parkingName}`,
                })
            } catch (err) {
                console.log('Share failed:', err)
            }
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
            {/* Confetti Effect */}
            <Confetti
                width={windowSize.width}
                height={windowSize.height}
                recycle={false}
                numberOfPieces={500}
                gravity={0.3}
            />

            {/* Header */}
            <div className="bg-slate-900/50 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">Booking Confirmation</h1>
                            <p className="text-sm text-slate-400">Your parking slot has been booked successfully</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Left Column - Booking Details */}
                    <div className="space-y-6">

                        {/* Success Message */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 backdrop-blur-xl"
                        >
                            <div className="flex items-center gap-4 mb-3">
                                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                                    <CheckCircle2 className="w-7 h-7 text-green-400" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-green-400">Booking Successful!</h2>
                                    <p className="text-slate-300">Your parking slot has been reserved successfully.</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Booking Details Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl"
                        >
                            <h3 className="text-lg font-semibold mb-6 text-slate-200">Booking Details</h3>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                                    <span className="text-slate-400 text-sm">Booking ID</span>
                                    <span className="font-mono font-bold text-cyan-400">{bookingId}</span>
                                </div>

                                <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                                    <span className="text-slate-400 text-sm">Parking Area</span>
                                    <span className="font-semibold text-white">{parkingName}</span>
                                </div>

                                <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                                    <span className="text-slate-400 text-sm">Slot Number</span>
                                    <span className="font-bold text-purple-400 text-lg">{slotNumber}</span>
                                </div>

                                <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                                    <span className="text-slate-400 text-sm flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        Date
                                    </span>
                                    <span className="font-semibold text-white">{formattedDate}</span>
                                </div>

                                <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                                    <span className="text-slate-400 text-sm flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        Time
                                    </span>
                                    <span className="font-semibold text-white">{formattedTime}</span>
                                </div>

                                <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                                    <span className="text-slate-400 text-sm">Duration</span>
                                    <span className="font-semibold text-white">{duration} hours</span>
                                </div>

                                <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                                    <span className="text-slate-400 text-sm flex items-center gap-2">
                                        <DollarSign className="w-4 h-4" />
                                        Amount Paid
                                    </span>
                                    <span className="font-bold text-green-400 text-lg">₹{amount}</span>
                                </div>

                                <div className="flex justify-between items-start">
                                    <span className="text-slate-400 text-sm flex items-center gap-2">
                                        <MapPin className="w-4 h-4" />
                                        Address
                                    </span>
                                    <span className="font-medium text-white text-right max-w-xs">{address}</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Location Map */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-xl"
                        >
                            <div className="p-4 border-b border-slate-800">
                                <h3 className="text-lg font-semibold text-slate-200">Location</h3>
                            </div>
                            <div className="relative h-64 bg-slate-800">
                                <iframe
                                    width="100%"
                                    height="100%"
                                    frameBorder="0"
                                    style={{ border: 0 }}
                                    src={`https://www.google.com/maps?q=${lat},${lng}&hl=es;z=14&output=embed`}
                                    allowFullScreen
                                />
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center border-2 border-purple-500">
                                        <MapPin className="w-6 h-6 text-purple-400" />
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 flex gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1 border-slate-700 hover:bg-slate-800"
                                    onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank')}
                                >
                                    <Navigation className="w-4 h-4 mr-2" />
                                    Get Directions
                                </Button>
                                <Button
                                    variant="outline"
                                    className="flex-1 border-slate-700 hover:bg-slate-800"
                                    onClick={handleShare}
                                >
                                    <Share2 className="w-4 h-4 mr-2" />
                                    Share Location
                                </Button>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column - QR Code & Information */}
                    <div className="space-y-6">

                        {/* QR Code Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl"
                        >
                            <h3 className="text-lg font-semibold mb-4 text-slate-200">Entry QR Code</h3>

                            <div className="bg-white p-6 rounded-xl flex items-center justify-center mb-4">
                                {qrBase64 ? (
                                    <img src={qrBase64} alt="Entry QR Code" className="w-64 h-64" />
                                ) : (
                                    <div className="w-64 h-64 flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                                    </div>
                                )}
                            </div>

                            <p className="text-center text-sm text-slate-400 mb-4">
                                Scan this QR code at the parking entrance for seamless entry.
                            </p>

                            <Button
                                onClick={handleDownloadQR}
                                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                                disabled={!qrBase64}
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Download QR Code
                            </Button>
                        </motion.div>

                        {/* Important Information */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl"
                        >
                            <h3 className="text-lg font-semibold mb-4 text-slate-200">Important Information</h3>

                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-slate-300">
                                        Please arrive at the parking area 10 minutes before your booking time.
                                    </p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-slate-300">
                                        Additional charges may apply if you exceed your booked duration.
                                    </p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <XCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-slate-300">
                                        Cancellation is available up to 30 minutes before your booking time.
                                    </p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-slate-300">
                                        For any assistance, please contact our support team.
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Action Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="grid grid-cols-2 gap-4"
                        >
                            <Button
                                onClick={() => router.push("/dashboard")}
                                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-12"
                            >
                                <Home className="w-4 h-4 mr-2" />
                                Back to Home
                            </Button>
                            <Button
                                onClick={() => router.push("/dashboard")}
                                variant="outline"
                                className="border-slate-700 hover:bg-slate-800 h-12"
                            >
                                <BookOpen className="w-4 h-4 mr-2" />
                                View All Bookings
                            </Button>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function BookingSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-white text-xl animate-pulse">Loading success details...</div>
            </div>
        }>
            <BookingSuccessContent />
        </Suspense>
    )
}
