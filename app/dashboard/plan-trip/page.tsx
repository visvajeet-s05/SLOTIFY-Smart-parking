'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MapPin, Clock, Info, Navigation, Activity, CheckCircle, AlertTriangle, BatteryCharging, ShieldCheck } from 'lucide-react'

interface PredictionResult {
  lotId: string
  name: string
  address: string
  lat: number
  lng: number
  totalSlots: number
  predictedOccupied: number
  predictedAvailable: number
  occupancyRate: number
  currentPrice: number
  distanceKm: number | null
  congestionScore: number
  recommendationScore: number
  co2SavedKg: number
  isCityHub?: boolean
  suggestMultiModal?: boolean
}

interface PredictionData {
  targetTime: string
  predictions: PredictionResult[]
  recommended: PredictionResult | null
}

export default function PlanTripPage() {
  const [targetTime, setTargetTime] = useState('')
  const [destination, setDestination] = useState('')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<PredictionData | null>(null)

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!targetTime) return

    setLoading(true)
    try {
      // Simulate mapping target time inputs to today's date
      const dateObj = new Date()
      const [hours, mins] = targetTime.split(':')
      dateObj.setHours(parseInt(hours, 10), parseInt(mins, 10), 0, 0)
      
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          targetTime: dateObj.toISOString(),
          // Mock geocoordinates (e.g. Chennai T Nagar Simulation)
          destLat: 13.0418, 
          destLng: 80.2341 
        })
      })
      const result = await res.json()
      if (result.success) {
        setData(result.data)
      }
    } catch (error) {
      console.error('Prediction failed', error)
    } finally {
      setLoading(false)
    }
  }

  const getCongestionColor = (score: number) => {
    if (score > 0.7) return 'text-red-500'
    if (score > 0.4) return 'text-yellow-500'
    return 'text-green-500'
  }

  const getCongestionLabel = (score: number) => {
    if (score > 0.7) return 'High Traffic'
    if (score > 0.4) return 'Moderate Traffic'
    return 'Clear Route'
  }

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-purple-400 to-indigo-500 bg-clip-text text-transparent mb-2">
            Pre-Trip Parking Intelligence (PTPI)
          </h1>
          <p className="text-gray-400">
            Predict slot availability before leaving home and get congestion-aware routing to alleviate traffic.
          </p>
        </div>

        {/* Form Section */}
        <Card className="bg-[#141A2A] border-gray-800 shadow-2xl">
          <CardContent className="p-6">
            <form onSubmit={handlePredict} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
              <div className="md:col-span-5 space-y-2">
                <Label htmlFor="destination" className="text-gray-300">Destination Area</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                  <Input 
                    id="destination" 
                    placeholder="e.g. T Nagar Mall"
                    className="bg-[#1C2333] border-gray-700 text-white pl-10"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="md:col-span-4 space-y-2">
                <Label htmlFor="targetTime" className="text-gray-300">Expected Arrival Time</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                  <Input 
                    id="targetTime" 
                    type="time" 
                    className="bg-[#1C2333] border-gray-700 text-white pl-10 [color-scheme:dark]"
                    value={targetTime}
                    onChange={(e) => setTargetTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="md:col-span-3">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white h-11"
                >
                  {loading ? 'Analyzing Neural Models...' : 'Predict Availability'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Results Section */}
        {data && data.recommended && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-500">
            <h2 className="text-2xl font-semibold mb-4 text-white">Algorithm Recommendation</h2>
            
            {/* The Top Recommendation */}
            <Card className="bg-gradient-to-br from-[#141A2A] to-[#1e1c3a] border-purple-500/30 border-2 overflow-hidden relative">
              <div className="absolute top-0 right-0 bg-purple-600 text-white px-4 py-1 text-sm font-bold rounded-bl-lg flex items-center gap-1">
                <ShieldCheck className="w-4 h-4"/> Optimal Choice
              </div>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                      {data.recommended.name}
                    </h3>
                    <p className="text-gray-400 flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> {data.recommended.address}
                    </p>
                    <div className="flex gap-4 mt-6">
                      <div className="bg-[#1C2333] rounded-lg p-4 flex-1 border border-gray-800 shadow-inner">
                        <p className="text-gray-500 text-sm mb-1">Predicted Slots</p>
                        <p className="text-3xl font-bold text-green-400">
                          {data.recommended.predictedAvailable} <span className="text-sm text-gray-500">/ {data.recommended.totalSlots}</span>
                        </p>
                      </div>
                      <div className="bg-[#1C2333] rounded-lg p-4 flex-1 border border-gray-800 shadow-inner">
                        <p className="text-gray-500 text-sm mb-1">Dynamic Price</p>
                        <p className="text-3xl font-bold text-indigo-400">
                          ₹{data.recommended.currentPrice} <span className="text-sm text-gray-500">/ hr</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-[#0B0F1A]/50 rounded-lg p-5 border border-purple-500/20">
                      <h4 className="flex items-center gap-2 text-indigo-300 font-semibold mb-3">
                        <Navigation className="w-4 h-4" /> Why we recommend this:
                      </h4>
                      <ul className="space-y-3 text-sm text-gray-300">
                        <li className="flex gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                          <span>High predicted availability avoiding search-time circling.</span>
                        </li>
                        <li className="flex gap-2">
                          <Activity className={`w-4 h-4 shrink-0 ${getCongestionColor(data.recommended.congestionScore)}`} />
                          <span>
                            Route has {getCongestionLabel(data.recommended.congestionScore).toLowerCase()} 
                            ({Math.round(data.recommended.congestionScore * 100)}% density) compared to closer lots.
                          </span>
                        </li>
                      </ul>
                    </div>

                    {/* Sustainability Element */}
                    <div className="bg-emerald-900/20 rounded-lg p-5 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)] transition-all hover:bg-emerald-900/30">
                      <h4 className="flex items-center gap-2 text-emerald-400 font-bold mb-1">
                        🌍 Sustainability Impact
                      </h4>
                      <p className="text-gray-300 text-sm">
                        By avoiding cruising, you saved an estimated
                        <span className="text-emerald-400 font-extrabold text-lg mx-2">{data.recommended.co2SavedKg} kg CO₂</span>
                        today!
                      </p>
                    </div>

                    {/* Multi-Modal Integration */}
                    {data.recommended.suggestMultiModal && (
                      <div className="bg-blue-900/20 rounded-lg p-5 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-all mt-4">
                        <h4 className="flex items-center gap-2 text-blue-400 font-bold mb-1">
                          🚇 Multi-Modal Hub Suggested
                        </h4>
                        <p className="text-gray-300 text-sm">
                          Your destination area is heavily congested. We recommend parking here at this City Hub and taking a <span className="font-bold text-white">Metro or E-Bike</span> for the last mile to save time and reduce gridlock.
                        </p>
                      </div>
                    )}

                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-12 shadow-lg shadow-green-900/20 mt-6">
                      Get Direct Route & Pre-Book
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <h3 className="text-xl font-semibold mt-8 mb-4 text-gray-300">Other Available Alternatives</h3>
            
            {/* Alternative Lots Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.predictions.filter(p => p.lotId !== data.recommended?.lotId).map(lot => (
                <Card key={lot.lotId} className="bg-[#141A2A] border-gray-800 hover:border-gray-600 transition-colors">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-white">{lot.name}</CardTitle>
                    <CardDescription className="text-gray-400 text-xs truncate">{lot.address}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <p className="text-xs text-gray-500">Slots</p>
                        <p className={`font-bold ${lot.predictedAvailable > 10 ? 'text-green-400' : 'text-orange-400'}`}>
                          {lot.predictedAvailable} Left
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Traffic</p>
                        <p className={`font-bold flex items-center justify-end gap-1 ${getCongestionColor(lot.congestionScore)}`}>
                          <AlertTriangle className="w-3 h-3" />
                          {Math.round(lot.congestionScore * 100)}%
                        </p>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-800 flex justify-between items-center">
                      <span className="text-gray-300 font-mono">₹{lot.currentPrice}/hr</span>
                      <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800">
                        Select
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

          </div>
        )}
        
      </div>
    </div>
  )
}
