"use client"

import { useState, useEffect } from "react"
import { useUserLocation } from "@/hooks/useUserLocation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, MapPin, AlertCircle, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"

export default function TestLocationPage() {
  const { location, error } = useUserLocation()
  const router = useRouter()

  // Show loading state while getting location
  if (!location && !error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
              Requesting Location
            </CardTitle>
            <CardDescription>
              Please allow location access in your browser to test the GPS functionality
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                <span>Waiting for browser permission...</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <span>Initializing GPS...</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span>Ready to fetch nearby parking...</span>
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              <Button onClick={() => window.location.reload()}>
                Retry
              </Button>
              <Button variant="outline" onClick={() => router.push("/find")}>
                Continue to Find Parking
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show error if location permission denied
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-500">
              <AlertCircle className="h-6 w-6" />
              Location Error
            </CardTitle>
            <CardDescription>
              We need your location to find nearby parking spots
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">{error}</p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 mb-2">To Test This Feature:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>1. Click "Retry" to request permission again</li>
                <li>2. In your browser, click "Allow" when prompted</li>
                <li>3. Or manually enable location in browser settings</li>
                <li>4. Refresh the page</li>
              </ul>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => window.location.reload()}>
                Retry
              </Button>
              <Button variant="outline" onClick={() => router.push("/find")}>
                Continue Without Location
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show success state with location data
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-500">
            <CheckCircle className="h-6 w-6" />
            Location Found!
          </CardTitle>
          <CardDescription>
            Your GPS location has been successfully detected
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 mb-2">Location Details:</h4>
            <div className="grid grid-cols-2 gap-2 text-sm text-green-700">
              <div><span className="font-medium">Latitude:</span> {location?.lat.toFixed(6)}</div>
              <div><span className="font-medium">Longitude:</span> {location?.lng.toFixed(6)}</div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">What This Enables:</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Browser GPS permission successfully granted
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Location coordinates retrieved
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Map can be centered on your location
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Nearby parking spots can be fetched (25km radius)
              </li>
            </ul>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => router.push("/find")}>
              <MapPin className="mr-2 h-4 w-4" />
              Test Find Parking
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Test Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}