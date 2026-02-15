"use client"

import { GoogleMap, MarkerF } from "@react-google-maps/api"
import { useGoogleMapsLoader } from "@/lib/use-google-maps-loader"
import { useState, useEffect, useMemo } from "react"
import { Loader2 } from "lucide-react"

const containerStyle = {
  width: "100%",
  height: "100%",
}

const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#263c3f" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b9a76" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b3" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#746855" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2835" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f3d19c" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2f3948" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#17263c" }],
  },
]

function ActualBackgroundMap({ apiKey }: { apiKey: string }) {
  const [center, setCenter] = useState({ lat: 13.0827, lng: 80.2707 }) // Default Chennai
  const [markers, setMarkers] = useState<{ id: number; lat: number; lng: number }[]>([])

  const { isLoaded, loadError } = useGoogleMapsLoader()

  useEffect(() => {
    // Try to get user's location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
          // Generate markers around user
          const newMarkers = Array.from({ length: 8 }).map((_, i) => ({
            id: i,
            lat: position.coords.latitude + (Math.random() - 0.5) * 0.05,
            lng: position.coords.longitude + (Math.random() - 0.5) * 0.05,
          }))
          setMarkers(newMarkers)
        },
        () => {
          // If geolocation fails or denied, use default markers
          const defaultMarkers = Array.from({ length: 8 }).map((_, i) => ({
            id: i,
            lat: 13.0827 + (Math.random() - 0.5) * 0.05,
            lng: 80.2707 + (Math.random() - 0.5) * 0.05,
          }))
          setMarkers(defaultMarkers)
        }
      )
    }
  }, [])

  const options = useMemo(
    () => ({
      styles: darkMapStyle,
      disableDefaultUI: true,
      zoomControl: false,
      mapTypeControl: false,
      streetViewControl: false,
      scrollwheel: false,
      draggable: false,
      disableDoubleClickZoom: true,
      keyboardShortcuts: false,
      clickableIcons: false, // Prevent clicking on POIs
    }),
    []
  )

  if (loadError || !isLoaded) {
    return (
      <div className="w-full h-full bg-[#0f172a] flex items-center justify-center relative overflow-hidden">
        {/* Simple grid background as fallback */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />
        {!isLoaded && !loadError && <Loader2 className="w-8 h-8 animate-spin text-purple-500 opacity-50 relative z-10" />}
      </div>
    )
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={13}
      options={options}
    >
      {/* Decorative Markers to simulate active ecosystem */}
      {markers.map((marker) => (
        <MarkerF
          key={marker.id}
          position={marker}
          icon={{
            // Simple circle SVG path
            path: "M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z",
            fillColor: "#8b5cf6", // Purple-500 equivalent
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 1,
            scale: 0.8,
          }}
          options={{ clickable: false }} // Non-interactive markers
        />
      ))}
    </GoogleMap>
  )
}

export default function BackgroundMap() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || ""
  const isInvalidKey = apiKey === "" || apiKey === "YOUR_API_KEY"

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
      })
    }
  }, [])

  if (isInvalidKey) {
    return (
      <div className="w-full h-full bg-[#0f172a] relative overflow-hidden">
        {userLocation ? (
          <iframe
            src={`https://maps.google.com/maps?q=${userLocation.lat},${userLocation.lng}&z=14&output=embed&iwloc=near`}
            className="w-full h-full mix-blend-normal contrast-110 saturate-50"
            style={{ filter: "grayscale(20%) opacity(0.9)", border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60 grayscale-[20%] contrast-125"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074&auto=format&fit=crop')`,
            }}
          />
        )}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent pointer-events-none" />
      </div>
    )
  }

  return <ActualBackgroundMap apiKey={apiKey} />
}
