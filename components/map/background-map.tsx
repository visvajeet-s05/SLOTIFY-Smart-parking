"use client"

import { GoogleMap, useJsApiLoader, MarkerF } from "@react-google-maps/api"
import { useEffect, useState, useMemo } from "react"
import { Loader2 } from "lucide-react"

const containerStyle = {
  width: "100%",
  height: "100%",
}

export default function BackgroundMap() {
  // Default coordinates (city center)
  const [center, setCenter] = useState({ lat: 51.505, lng: -0.09 })

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "",
  })

  // Try to get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.error("Error getting location:", error)
        }
      )
    }
  }, [])

  if (!isLoaded) return (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
      <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
    </div>
  )

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={13}
      options={{
        disableDefaultUI: true,
        styles: [
          { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
          { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
          { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
        ]
      }}
    >
      <MarkerF position={center} />
    </GoogleMap>
  )
}

