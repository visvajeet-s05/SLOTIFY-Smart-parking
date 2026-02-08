"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF, HeatmapLayerF } from "@react-google-maps/api"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Map as MapIcon, Thermometer } from "lucide-react"

// Map container style
const containerStyle = {
  width: "100%",
  height: "100%",
}

// Default center (Chennai)
const defaultCenter = {
  lat: 13.0827,
  lng: 80.2707,
}

// Custom Dark Map Style
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

interface ParkingMapProps {
  parkingAreas: any[]
  selectedId: string | null
  onSelectParkingArea: (id: string) => void
}

export default function ParkingMap({ parkingAreas, selectedId, onSelectParkingArea }: ParkingMapProps) {
  const router = useRouter()
  const [showHeatmap, setShowHeatmap] = useState(false)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [activeMarker, setActiveMarker] = useState<string | null>(null)

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "",
    libraries: ["visualization"], // Required for HeatmapLayer
  })

  const onLoad = useCallback((map: google.maps.Map) => {
    // Fit bounds to show all markers
    if (parkingAreas.length > 0) {
      const bounds = new window.google.maps.LatLngBounds()
      parkingAreas.forEach((area) => {
        bounds.extend({ lat: area.coordinates[0], lng: area.coordinates[1] })
      })
      map.fitBounds(bounds)
    }
    setMap(map)
  }, [parkingAreas])

  const onUnmount = useCallback(() => {
    setMap(null)
  }, [])

  const handleMarkerClick = (id: string) => {
    setActiveMarker(id)
    onSelectParkingArea(id)
  }

  const handleViewDetails = (id: string) => {
    router.push(`/dashboard/parking/${id}`)
  }

  const heatmapData = useMemo(() => {
    if (!window.google) return []
    return parkingAreas.map(area => ({
      location: new google.maps.LatLng(area.coordinates[0], area.coordinates[1]),
      weight: area.availableSlots // Higher weight = more available spots (cooler/hotter depending on logic)
    }))
  }, [parkingAreas])

  // Custom marker icons based on status
  const getMarkerIcon = (status: string) => {
    const baseUrl = "http://maps.google.com/mapfiles/ms/icons/"
    switch (status) {
      case "available": return baseUrl + "green-dot.png"
      case "limited": return baseUrl + "yellow-dot.png"
      case "full": return baseUrl + "red-dot.png"
      default: return baseUrl + "blue-dot.png"
    }
  }

  if (loadError) {
    return <div className="flex items-center justify-center h-full text-red-500 bg-gray-900">Error loading Google Maps</div>
  }

  if (!isLoaded) {
    return <div className="flex items-center justify-center h-full text-gray-400 bg-gray-900 animate-pulse">Loading Maps...</div>
  }

  return (
    <div className="relative h-full w-full">
      {/* Heatmap Toggle Button */}
      <div className="absolute top-4 right-4 z-10">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowHeatmap(!showHeatmap)}
          className="bg-gray-900/90 backdrop-blur text-white border-gray-700 hover:bg-gray-800 flex items-center gap-2"
        >
          {showHeatmap ? <MapIcon className="w-4 h-4" /> : <Thermometer className="w-4 h-4" />}
          {showHeatmap ? "Show Markers" : "Show Heatmap"}
        </Button>
      </div>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={12}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          styles: darkMapStyle,
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
        }}
      >
        {/* Heatmap Layer */}
        {showHeatmap && heatmapData.length > 0 && (
          <HeatmapLayerF
            data={heatmapData}
            options={{
              radius: 40,
              opacity: 0.8,
            }}
          />
        )}

        {/* Markers Layer */}
        {!showHeatmap && parkingAreas.map((area) => (
          <MarkerF
            key={area.id}
            position={{ lat: area.coordinates[0], lng: area.coordinates[1] }}
            icon={getMarkerIcon(area.status)}
            onClick={() => handleMarkerClick(area.id)}
          >
            {activeMarker === area.id && (
              <InfoWindowF
                onCloseClick={() => setActiveMarker(null)}
                position={{ lat: area.coordinates[0], lng: area.coordinates[1] }}
              >
                <div className="p-2 min-w-[200px] text-gray-900">
                  <h3 className="font-bold text-lg mb-1">{area.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{area.address}</p>

                  <div className="flex justify-between items-center mb-2">
                    <span className={`font-bold px-2 py-0.5 rounded text-xs ${area.status === 'available' ? 'bg-green-100 text-green-700' :
                        area.status === 'limited' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                      }`}>
                      {area.status.toUpperCase()}
                    </span>
                    <span className="font-semibold text-gray-700">₹{area.price}/hr</span>
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Availability</span>
                      <span>{area.availableSlots}/{area.totalSlots}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${area.status === 'available' ? 'bg-green-500' :
                            area.status === 'limited' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                        style={{ width: `${(area.availableSlots / area.totalSlots) * 100}%` }}
                      />
                    </div>
                  </div>

                  <button
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2 px-3 rounded text-sm transition-colors"
                    onClick={() => handleViewDetails(area.id)}
                  >
                    View Details
                  </button>
                </div>
              </InfoWindowF>
            )}
          </MarkerF>
        ))}
      </GoogleMap>
    </div>
  )
}

