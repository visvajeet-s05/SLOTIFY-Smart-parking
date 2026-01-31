"use client"

import { useState, useEffect, Suspense } from "react"
import { useUserLocation } from "@/hooks/useUserLocation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, MapPin, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"

// Dynamic import to prevent SSR issues
const UserMap = typeof window !== "undefined" 
  ? require("@/components/map/UserMap").default 
  : () => null

export default function FindParkingPage() {
  const { location, error } = useUserLocation()
  const { data: session, status } = useSession()
  const router = useRouter()
  const [nearbyParkings, setNearbyParkings] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch nearby parking when location is available and user is logged in
  useEffect(() => {
    if (location && session?.user) {
      fetchNearbyParkings()
    }
  }, [location, session])

  const fetchNearbyParkings = async () => {
    if (!location) return

    setLoading(true)
    try {
      const res = await fetch(
        `/api/parking/nearby?lat=${location.lat}&lng=${location.lng}`
      )
      const data = await res.json()
      setNearbyParkings(data)
    } catch (error) {
      console.error("Error fetching nearby parkings:", error)
    } finally {
      setLoading(false)
    }
  }

  // Show loading state while getting location
  if (!location && !error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-white text-lg">Requesting location permission...</p>
          <p className="text-gray-400 mt-2">Please allow location access to find nearby parking</p>
        </div>
      </div>
    )
  }

  // Show error if location permission denied
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-red-500" />
              Location Error
            </CardTitle>
            <CardDescription>
              We need your location to find nearby parking spots
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">{error}</p>
            <div className="flex gap-2">
              <Button 
                onClick={() => window.location.reload()}
                className="flex-1"
              >
                Try Again
              </Button>
              <Button 
                variant="outline"
                onClick={() => router.push("/login")}
                className="flex-1"
              >
                Continue Without Location
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      {/* Map Section */}
      <div className="absolute inset-0 z-0">
        {location && (
          <UserMap 
            lat={location.lat} 
            lng={location.lng} 
            parkings={nearbyParkings}
          />
        )}
      </div>

      {/* Overlay Content */}
      <div className="relative z-10 min-h-screen bg-black/20 backdrop-blur-sm">
        {/* Header */}
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => router.push("/")}
                variant="outline"
                className="bg-white/10 backdrop-blur-sm border-white/20"
              >
                ← Back to Home
              </Button>
              <div className="text-white">
                <h1 className="text-2xl font-bold">Find Parking</h1>
                <p className="text-sm text-gray-300">
                  {session?.user ? "Showing nearby parking spots" : "Please login to see nearby parking"}
                </p>
              </div>
            </div>
            
            {session?.user ? (
              <div className="text-right text-white">
                <p className="text-sm">Logged in as</p>
                <p className="font-semibold">{session.user.email}</p>
              </div>
            ) : (
              <Button
                onClick={() => router.push("/login")}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                Login to View Nearby Parking
              </Button>
            )}
          </div>
        </div>

        {/* Stats Overlay */}
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">{nearbyParkings.length}</p>
                    <p className="text-gray-300 text-sm">Nearby Spots</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                  <div>
                    <p className="text-white font-semibold">Real-time</p>
                    <p className="text-gray-300 text-sm">Live Updates</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <div className="text-blue-400">25km</div>
                  </div>
                  <div>
                    <p className="text-white font-semibold">25km</p>
                    <p className="text-gray-300 text-sm">Search Radius</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Instructions */}
        <div className="container mx-auto px-4 py-6">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-white">How to Use</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-gray-300">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-sm font-bold text-purple-400">1</span>
                </div>
                <div>
                  <h4 className="font-semibold text-white">Location Permission</h4>
                  <p className="text-sm">We automatically request your location to find nearby parking spots</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-sm font-bold text-purple-400">2</span>
                </div>
                <div>
                  <h4 className="font-semibold text-white">Login Required</h4>
                  <p className="text-sm">Login to see available parking spots and book them</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-sm font-bold text-purple-400">3</span>
                </div>
                <div>
                  <h4 className="font-semibold text-white">Book & Park</h4>
                  <p className="text-sm">Click on parking markers to view details and book your spot</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}