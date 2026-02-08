"use client"

import { useState } from "react"
import { GoogleMap, useJsApiLoader, MarkerF } from "@react-google-maps/api"
import { Loader2 } from "lucide-react"

const DEFAULT_POSITION = { lat: 28.6139, lng: 77.209 } // Delhi default

const containerStyle = {
  width: "100%",
  height: "100%",
}

export default function LocationMapStep() {
  const [position, setPosition] = useState(DEFAULT_POSITION)

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "",
  })

  // Handle click on map to set position
  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      setPosition({
        lat: e.latLng.lat(),
        lng: e.latLng.lng()
      })
    }
  }

  // Handle marker drag end
  const handleMarkerDragEnd = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      setPosition({
        lat: e.latLng.lat(),
        lng: e.latLng.lng()
      })
    }
  }

  if (!isLoaded) return (
    <div className="h-[420px] flex items-center justify-center bg-gray-800 border border-gray-700 rounded-lg">
      <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold">Parking Location</h2>
        <p className="text-sm text-gray-400">
          Select the exact location of your parking lot on the map.
        </p>
      </div>

      {/* Map */}
      <div className="h-[420px] rounded-lg overflow-hidden border border-gray-800 relative">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={position}
          zoom={14}
          onClick={handleMapClick}
          options={{
            disableDefaultUI: false,
            streetViewControl: false,
            mapTypeControl: false,
            zoomControl: true,
            styles: [
              { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
              { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
              { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
              { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
              { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
              { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
              { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }] },
              { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
              { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
              { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
              { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
            ]
          }}
        >
          <MarkerF
            position={position}
            draggable={true}
            onDragEnd={handleMarkerDragEnd}
            animation={window.google?.maps?.Animation?.DROP}
          />
        </GoogleMap>
      </div>

      {/* Coordinates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800/40 border border-gray-700 rounded p-4 text-sm">
          <span className="text-gray-400">Latitude:</span>
          <div className="font-medium">{position.lat.toFixed(6)}</div>
        </div>
        <div className="bg-gray-800/40 border border-gray-700 rounded p-4 text-sm">
          <span className="text-gray-400">Longitude:</span>
          <div className="font-medium">{position.lng.toFixed(6)}</div>
        </div>
      </div>

      {/* Info */}
      <div className="bg-gray-800/30 border border-gray-700 rounded p-4 text-sm text-gray-400">
        Tip: Zoom in and drag the marker to the exact parking entry point.
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <button className="text-sm text-gray-400 hover:underline">
          ← Back
        </button>

        <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded text-sm">
          Continue →
        </button>
      </div>
    </div>
  )
}