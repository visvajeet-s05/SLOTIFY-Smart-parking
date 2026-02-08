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

// Declare global window property for Google Maps auth failure
declare global {
  interface Window {
    gm_authFailure?: () => void;
  }
}

export default function ParkingMap({ parkingAreas, selectedId, onSelectParkingArea }: ParkingMapProps) {
  const router = useRouter()
  const [showHeatmap, setShowHeatmap] = useState(false)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [activeMarker, setActiveMarker] = useState<string | null>(null)
  const [authError, setAuthError] = useState(false)

  // Catch Google Maps Auth Failures (like ApiProjectMapError)
  useEffect(() => {
    window.gm_authFailure = () => {
      console.error("Google Maps Authentication Failure detected.")
      setAuthError(true)
    }
  }, [])

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
    if (!isLoaded || typeof google === "undefined" || !google.maps) return []
    return parkingAreas.map(area => ({
      location: new google.maps.LatLng(area.coordinates[0], area.coordinates[1]),
      weight: area.availableSlots // Higher weight = more available spots (cooler/hotter depending on logic)
    }))
  }, [parkingAreas, isLoaded])

  // Custom marker icons based on status
  const getMarkerIcon = (status: string) => {
    // Fallback if google is not defined yet (though isLoaded checks this)
    if (typeof google === 'undefined') return undefined

    const baseUrl = "http://maps.google.com/mapfiles/ms/icons/"
    switch (status) {
      case "available": return baseUrl + "green-dot.png"
      case "limited": return baseUrl + "yellow-dot.png"
      case "full": return baseUrl + "red-dot.png"
      default: return baseUrl + "blue-dot.png"
    }
  }

  // Show Simulated Map if API fails to load or Auth fails (Free Tier / No Billing)
  if (loadError || authError || (!isLoaded && authError)) {
    // 1. Calculate Bounds for Normalization
    const lats = parkingAreas.map(p => p.coordinates[0])
    const lngs = parkingAreas.map(p => p.coordinates[1])
    const minLat = Math.min(...lats)
    const maxLat = Math.max(...lats)
    const minLng = Math.min(...lngs)
    const maxLng = Math.max(...lngs)

    // Padding to keep markers away from edges
    const latPadding = (maxLat - minLat) * 0.2 || 0.01
    const lngPadding = (maxLng - minLng) * 0.2 || 0.01

    // Normalization Function: Lat maps to Y (inverted), Lng maps to X
    const getPosition = (lat: number, lng: number) => {
      const y = ((maxLat + latPadding) - lat) / ((maxLat + latPadding) - (minLat - latPadding)) * 100
      const x = (lng - (minLng - lngPadding)) / ((maxLng + lngPadding) - (minLng - lngPadding)) * 100
      return { top: `${y}%`, left: `${x}%` }
    }

    return (
      <div className="relative h-full w-full bg-[#0f172a] overflow-hidden group rounded-3xl">
        {/* Simulated Map Background - Dark Abstract Grid */}
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 via-transparent to-slate-900/80 pointer-events-none" />

        {/* Simulation Badge */}
        <div className="absolute top-4 left-4 z-20 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md flex items-center gap-2 shadow-lg">
          <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
          Simulation Mode
        </div>

        <div className="absolute bottom-4 left-4 z-20 max-w-xs">
          <p className="text-[10px] text-slate-500 bg-black/40 backdrop-blur-sm px-2 py-1 rounded border border-white/5">
            Map API unavailable. Showing simulated view based on real-time data.
          </p>
        </div>

        {/* Render Markers on Simulated Grid */}
        <div className="absolute inset-0 m-12">
          {parkingAreas.map((area) => {
            const pos = getPosition(area.coordinates[0], area.coordinates[1])
            const isActive = activeMarker === area.id

            return (
              <div
                key={area.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-out hover:z-50 cursor-pointer"
                style={{ top: pos.top, left: pos.left }}
                onClick={(e) => {
                  e.stopPropagation()
                  handleMarkerClick(area.id)
                }}
              >
                {/* Marker Pin */}
                <div className={`relative flex items-center justify-center transition-transform hover:scale-110 ${isActive ? 'scale-125 z-50' : 'z-10'}`}>
                  <div className={`w-8 h-8 rounded-full shadow-2xl border-2 flex items-center justify-center backdrop-blur-sm ${area.status === 'available' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500' :
                    area.status === 'limited' ? 'bg-amber-500/20 border-amber-500 text-amber-500' :
                      'bg-red-500/20 border-red-500 text-red-500'
                    }`}>
                    <div className={`w-2.5 h-2.5 rounded-full ${area.status === 'available' ? 'bg-emerald-400' :
                      area.status === 'limited' ? 'bg-amber-400' : 'bg-red-400'
                      }`} />
                  </div>
                  {/* Ripple Effect for Active */}
                  {isActive && (
                    <div className={`absolute -inset-4 rounded-full opacity-30 animate-ping ${area.status === 'available' ? 'bg-emerald-500' :
                      area.status === 'limited' ? 'bg-amber-500' : 'bg-red-500'
                      }`} />
                  )}
                </div>

                {/* Info Window (Simulated) */}
                {isActive && (
                  <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 w-64 bg-slate-900/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2 text-left">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-white leading-tight">{area.name}</h3>
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">₹{area.price}/hr</span>
                    </div>
                    <p className="text-xs text-slate-400 mb-3 line-clamp-1">{area.address}</p>

                    {/* Availability Bar */}
                    <div className="space-y-1 mb-3">
                      <div className="flex justify-between text-[10px] uppercase font-bold text-slate-500">
                        <span>Availability</span>
                        <span className={area.availableSlots > 5 ? "text-emerald-400" : "text-amber-400"}>
                          {area.availableSlots}/{area.totalSlots}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-700/50 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${area.status === 'available' ? 'bg-emerald-500' : 'bg-amber-500'}`}
                          style={{ width: `${(area.availableSlots / area.totalSlots) * 100}%` }}
                        />
                      </div>
                    </div>

                    <Button
                      size="sm"
                      className="w-full h-8 text-xs font-bold bg-white text-slate-900 hover:bg-slate-200"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleViewDetails(area.id)
                      }}
                    >
                      View Details
                    </Button>

                    {/* Arrow Down */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-4 h-4 bg-slate-900/90 border-r border-b border-white/10 transform rotate-45" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }


  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-900 border border-white/5 rounded-3xl animate-pulse">
        <MapIcon className="w-8 h-8 text-slate-600 mb-2 opacity-50" />
        <p className="text-sm font-medium text-slate-500">Loading Map...</p>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full">
      {/* Heatmap Toggle Button */}
      <div className="absolute top-4 right-4 z-10">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowHeatmap(!showHeatmap)}
          className="bg-slate-900/90 backdrop-blur-md text-white border-white/10 hover:bg-slate-800 flex items-center gap-2 shadow-lg"
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
          backgroundColor: '#0f172a', // Match dashboard bg
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
                <div className="p-1 min-w-[200px]">
                  <h3 className="font-bold text-lg mb-1 text-slate-900">{area.name}</h3>
                  <p className="text-xs text-slate-500 mb-3 font-medium">{area.address}</p>

                  <div className="flex justify-between items-center mb-3">
                    <span className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider ${area.status === 'available' ? 'bg-emerald-100 text-emerald-700' :
                      area.status === 'limited' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                      {area.status}
                    </span>
                    <span className="font-bold text-slate-700">₹{area.price}/hr</span>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1 font-semibold uppercase tracking-wider">
                      <span>Occupancy</span>
                      <span>{Math.round(((area.totalSlots - area.availableSlots) / area.totalSlots) * 100)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${area.status === 'available' ? 'bg-emerald-500' :
                          area.status === 'limited' ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                        style={{ width: `${((area.totalSlots - area.availableSlots) / area.totalSlots) * 100}%` }}
                      />
                    </div>
                  </div>

                  <button
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-3 rounded-lg text-xs transition-colors shadow-sm"
                    onClick={() => handleViewDetails(area.id)}
                  >
                    View Parking Details
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

