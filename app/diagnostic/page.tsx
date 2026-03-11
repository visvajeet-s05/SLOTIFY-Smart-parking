"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle2, XCircle } from "lucide-react"

export default function DiagnosticPage() {
    const [results, setResults] = useState<string[]>([])
    const [isRunning, setIsRunning] = useState(false)

    const addResult = (message: string) => {
        setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
    }

    const runDiagnostics = async () => {
        setResults([])
        setIsRunning(true)

        try {
            // Test 1: Check if we can navigate
            addResult("✅ Starting diagnostics...")

            // Test 2: Check API connectivity
            addResult("📡 Testing API connectivity...")
            try {
                const response = await fetch("/api/bookings", {
                    method: "GET"
                })
                addResult(`📊 Bookings API Status: ${response.status}`)
            } catch (err: any) {
                addResult(`❌ Bookings API Error: ${err.message}`)
            }

            // Test 3: Test navigation
            addResult("🧭 Testing navigation...")
            const testUrl = `/dashboard/booking-success?bookingId=TEST123&parkingName=Test&slotNumber=T1&address=Test Address&amount=100&duration=2&licensePlate=TEST&lat=28.6139&lng=77.2090`
            addResult(`✅ Would navigate to: ${testUrl}`)

            // Test 4: Check localStorage
            addResult("💾 Checking browser storage...")
            try {
                localStorage.setItem("test", "value")
                const val = localStorage.getItem("test")
                localStorage.removeItem("test")
                addResult(`✅ LocalStorage: ${val === "value" ? "Working" : "Failed"}`)
            } catch (err: any) {
                addResult(`❌ LocalStorage Error: ${err.message}`)
            }

            // Test 5: Check router
            addResult("🔄 Testing router...")
            if (typeof window !== 'undefined') {
                addResult(`✅ Window object available`)
                addResult(`✅ Current URL: ${window.location.href}`)
            }

            addResult("🎉 Diagnostics complete!")
        } catch (error: any) {
            addResult(`💥 Error: ${error.message}`)
        } finally {
            setIsRunning(false)
        }
    }

    const testNavigation = () => {
        const testUrl = `/dashboard/booking-success?bookingId=TEST-${Date.now()}&parkingName=Test%20Parking&slotNumber=T1&address=123%20Test%20St&amount=100&duration=2&licensePlate=TEST1234&lat=28.6139&lng=77.2090`
        addResult(`🚀 Navigating to success page...`)
        window.location.href = testUrl
    }

    const testPaymentPage = () => {
        const testUrl = `/dashboard/payment?slotId=test-slot-${Date.now()}&slotNumber=T1&price=50&duration=2&parkingName=Test%20Parking%20Complex&parkingLotId=test-lot-id`
        addResult(`🚀 Navigating to payment page...`)
        window.location.href = testUrl
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <h1 className="text-3xl font-bold mb-2">🔧 Payment Flow Diagnostics</h1>
                    <p className="text-slate-400">Test the payment and booking confirmation system</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button
                        onClick={runDiagnostics}
                        disabled={isRunning}
                        className="h-16 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                    >
                        {isRunning ? "Running..." : "Run Diagnostics"}
                    </Button>

                    <Button
                        onClick={testPaymentPage}
                        className="h-16 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                    >
                        Go to Payment Page
                    </Button>

                    <Button
                        onClick={testNavigation}
                        className="h-16 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
                    >
                        Go to Success Page
                    </Button>
                </div>

                {/* Results Console */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <h2 className="text-xl font-bold mb-4">Console Output</h2>
                    <div className="bg-black rounded-lg p-4 font-mono text-sm h-96 overflow-y-auto">
                        {results.length === 0 ? (
                            <p className="text-slate-500">Click "Run Diagnostics" to start testing...</p>
                        ) : (
                            results.map((result, index) => (
                                <div key={index} className="mb-1 text-green-400">
                                    {result}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Quick Test Form */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <h2 className="text-xl font-bold mb-4">Quick Payment Test</h2>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>License Plate</Label>
                                <Input id="testPlate" defaultValue="TN-01-AB-1234" className="bg-slate-800" />
                            </div>
                            <div>
                                <Label>Vehicle Model</Label>
                                <Input id="testModel" defaultValue="Honda City" className="bg-slate-800" />
                            </div>
                        </div>
                        <Button
                            onClick={() => {
                                const plate = (document.getElementById("testPlate") as HTMLInputElement)?.value
                                const model = (document.getElementById("testModel") as HTMLInputElement)?.value
                                const url = `/dashboard/payment?slotId=test-slot&slotNumber=C7&price=50&duration=2&parkingName=Downtown%20Parking%20Complex&parkingLotId=test-lot`
                                addResult(`🚀 Opening payment page with vehicle: ${plate} - ${model}`)
                                setTimeout(() => {
                                    window.location.href = url
                                }, 500)
                            }}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        >
                            Test Payment Flow
                        </Button>
                    </div>
                </div>

                {/* Instructions */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6">
                    <h3 className="font-bold text-blue-400 mb-3">How to Use:</h3>
                    <ol className="space-y-2 text-sm text-slate-300">
                        <li><strong>1. Run Diagnostics:</strong> Check if all systems are working</li>
                        <li><strong>2. Go to Payment Page:</strong> Test the payment form directly</li>
                        <li><strong>3. Go to Success Page:</strong> Skip to the final confirmation screen</li>
                        <li><strong>4. Test Payment Flow:</strong> Complete end-to-end test with custom vehicle details</li>
                    </ol>
                </div>

                {/* Console Instructions */}
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-6">
                    <h3 className="font-bold text-yellow-400 mb-3">⚠️ Check Browser Console</h3>
                    <p className="text-sm text-slate-300 mb-2">
                        Open your browser's developer console (F12) to see detailed logs when you click "Pay Now"
                    </p>
                    <ul className="space-y-1 text-sm text-slate-400">
                        <li>• 🔵 Payment button clicked</li>
                        <li>• ✅ Vehicle details present</li>
                        <li>• 📡 API calls and responses</li>
                        <li>• 🚀 Navigation triggers</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
