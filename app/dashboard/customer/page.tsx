'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface CustomerSlotState {
  total: number
  available: number
  currentPrice?: number
}

export default function CustomerDashboard() {
  const [slotState, setSlotState] = useState<CustomerSlotState | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSlotData()
    const interval = setInterval(fetchSlotData, 10000) // Less frequent updates for customers
    return () => clearInterval(interval)
  }, [])

  const fetchSlotData = async () => {
    try {
      const response = await fetch('/api/parking/customer/status')
      const data = await response.json()
      setSlotState(data)
    } catch (error) {
      console.error('Failed to fetch slot data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBookSlot = (slotId: number) => {
    // TODO: Implement booking logic
    alert(`Booking slot ${slotId} - Feature coming soon!`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  // Generate slot grid for customer view (simplified)
  const slots = Array.from({ length: slotState?.total || 9 }, (_, i) => ({
    id: i + 1,
    available: Math.random() > 0.5 // Simplified - in real app this would come from API
  }))

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Parking Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-[#141A2A] border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Total Spaces</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#7C3AED]">{slotState?.total || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-[#141A2A] border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Available Now</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{slotState?.available || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Parking Slots Grid */}
        <Card className="bg-[#141A2A] border-gray-700 mb-6">
          <CardHeader>
            <CardTitle className="text-white">Available Parking Spaces</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {slots.map((slot) => (
                <div
                  key={slot.id}
                  className={`aspect-square rounded-lg border-2 flex flex-col items-center justify-center font-bold text-lg transition-all duration-300 ${
                    slot.available
                      ? 'bg-green-500/20 border-green-500/50 shadow-green-500/25 hover:bg-green-500/30'
                      : 'bg-gray-500/20 border-gray-500/50 opacity-60'
                  } shadow-lg`}
                >
                  <div className="text-center">
                    <div className={`text-xl ${slot.available ? 'text-white' : 'text-gray-400'}`}>
                      {slot.id}
                    </div>
                    <div className={`text-xs ${slot.available ? 'text-green-300' : 'text-gray-500'}`}>
                      {slot.available ? 'Available' : 'Occupied'}
                    </div>
                    {slot.available && (
                      <Button
                        size="sm"
                        className="mt-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs"
                        onClick={() => handleBookSlot(slot.id)}
                      >
                        Book
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-[#141A2A] border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Current Dynamic Rate:</span>
                  <div className="flex items-center gap-2">
                    {slotState?.total !== slotState?.available && (
                      <span className="text-xs text-orange-400 border border-orange-400/30 bg-orange-400/10 px-2 py-0.5 rounded-full animate-pulse">
                        SURGE ACTIVE
                      </span>
                    )}
                    <span className="text-[#7C3AED] font-semibold text-lg">
                      ₹{slotState?.currentPrice || 50}/hr
                    </span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Daily Maximum:</span>
                  <span className="text-[#7C3AED] font-semibold">₹{(slotState?.currentPrice || 50) * 6}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">EV Charging:</span>
                  <span className="text-[#7C3AED] font-semibold">+₹20/hr</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#141A2A] border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Real-time availability
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Secure booking system
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  EV charging stations
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  24/7 monitoring
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
