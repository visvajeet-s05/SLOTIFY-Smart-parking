"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function Status() {
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!session) {
      router.push("/")
    }
  }, [session, router])

  if (!session) {
    return <div className="p-4 text-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">✅ Smart Parking Status</h1>

        <div className="space-y-4">
          {/* User Status */}
          <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-2">👤 User Login</h2>
            <div className="text-gray-300 space-y-1">
              <p>✅ You are logged in as: <span className="text-purple-400">{session.user.email}</span></p>
              <p>✅ Email: <span className="text-purple-400">{session.user.email}</span></p>
              <p>✅ Role: <span className="text-green-400">{session.user.role}</span></p>
            </div>
          </div>

          {/* Database Status */}
          <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-2">📊 Database</h2>
            <div className="text-gray-300 space-y-1">
              <p>❌ Database removed from this branch</p>
              <p>⚠️ API auth endpoints are currently disabled</p>
            </div>
          </div>

          {/* Pages Status */}
          <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-2">📄 Pages Connected</h2>
            <div className="text-gray-300 space-y-2">
              <div className="flex items-center gap-2">
                <span>✅</span>
                <a href="/" className="text-purple-400 hover:underline">Home Page</a>
              </div>
              <div className="flex items-center gap-2">
                <span>✅</span>
                <a href="/dashboard" className="text-purple-400 hover:underline">Dashboard (Parking List + Map)</a>
              </div>
              <div className="flex items-center gap-2">
                <span>✅</span>
                <a href="/dashboard/parking/1" className="text-purple-400 hover:underline">Parking Area Details</a>
              </div>
              <div className="flex items-center gap-2">
                <span>✅</span>
                <a href="/admin" className="text-purple-400 hover:underline">Admin Dashboard (Admin Only)</a>
              </div>
              <div className="flex items-center gap-2">
                <span>✅</span>
                <a href="/dashboard/booking/test" className="text-purple-400 hover:underline">Booking Confirmation</a>
              </div>
            </div>
          </div>

          {/* Features Status */}
          <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-2">✨ Features</h2>
            <div className="text-gray-300 space-y-1">
              <p>✅ Geolocation permission on app load</p>
              <p>✅ Compact, professional UI</p>
              <p>✅ Admin login with hardcoded credentials</p>
              <p>✅ Customer registration and login</p>
              <p>✅ Parking slot details modal (now more compact!)</p>
              <p>⚠️ Authentication uses stubbed endpoints (DB removed)</p>
              <p>⚠️ Role-based access currently limited to front-end checks</p>
            </div>
          </div>

          {/* What's Working */}
          <div className="bg-green-900/20 border border-green-700 p-4 rounded-lg">
            <h2 className="text-xl font-semibold text-green-400 mb-2">🎯 What Works Now</h2>
            <div className="text-green-300 space-y-1">
              <p>✓ Click "Find Parking" → Shows list of parking areas</p>
              <p>✓ Click on parking area → Shows parking slot grid</p>
              <p>✓ Click on any parking slot → Opens compact slot details modal</p>
              <p>✓ Click "Book This Slot" → Proceeds to booking confirmation</p>
              <p>✓ All pages are fully functional and connected!</p>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-900/20 border border-blue-700 p-4 rounded-lg">
            <h2 className="text-xl font-semibold text-blue-400 mb-2">🚀 Next Steps (Optional)</h2>
            <div className="text-blue-300 space-y-1">
              <p>• Add payment integration (Stripe/Razorpay)</p>
              <p>• Add real-time slot availability tracking</p>
              <p>• Add booking history page</p>
              <p>• Add reviews and ratings system</p>
              <p>• Deploy to production</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
