"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function TestPaymentPage() {
    const router = useRouter()

    const handleTestPayment = () => {
        // Simulate a successful payment with mock data
        const testParams = new URLSearchParams({
            slotId: "slot-123",
            slotNumber: "C7",
            price: "50",
            duration: "2",
            parkingName: "Downtown Parking Complex",
            parkingLotId: "test-lot-id"
        })

        router.push(`/dashboard/payment?${testParams.toString()}`)
    }

    const handleDirectSuccess = () => {
        // Go directly to success page with mock data
        const successParams = new URLSearchParams({
            bookingId: "BK890632",
            parkingName: "Downtown Parking Complex",
            slotNumber: "C7",
            address: "123 Main St, Downtown",
            amount: "50",
            duration: "2",
            licensePlate: "TN-01-AB-1234",
            lat: "28.6139",
            lng: "77.2090"
        })

        router.push(`/dashboard/booking-success?${successParams.toString()}`)
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
            <div className="max-w-md w-full space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold">Payment Flow Test</h1>
                    <p className="text-slate-400">Test the payment and booking confirmation flow</p>
                </div>

                <div className="space-y-4">
                    <Button
                        onClick={handleTestPayment}
                        className="w-full h-14 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-lg"
                    >
                        Test Payment Page
                    </Button>

                    <Button
                        onClick={handleDirectSuccess}
                        className="w-full h-14 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-lg"
                    >
                        Test Success Page (Direct)
                    </Button>

                    <Button
                        onClick={() => router.push("/dashboard")}
                        variant="outline"
                        className="w-full h-14 border-slate-700 hover:bg-slate-800"
                    >
                        Back to Dashboard
                    </Button>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <h3 className="font-semibold mb-2">Test Instructions:</h3>
                    <ol className="text-sm text-slate-400 space-y-1 list-decimal list-inside">
                        <li>Click "Test Payment Page" to see the payment form</li>
                        <li>Fill in vehicle details and click "Pay Now"</li>
                        <li>You'll be redirected to the booking success page</li>
                        <li>Or click "Test Success Page" to skip directly to success</li>
                    </ol>
                </div>
            </div>
        </div>
    )
}
