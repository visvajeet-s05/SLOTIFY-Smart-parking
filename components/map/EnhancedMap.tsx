"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { GoogleMap, MarkerF, InfoWindowF } from "@react-google-maps/api"
import { Loader2, MapPin, Navigation, AlertCircle, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
    GOOGLE_MAPS_CONFIG,
    DARK_MAP_STYLE,
    parseMapError,
    isGoogleMapsConfigured,
    getCurrentLocation,
    calculateDistance,
    formatDistance,
    createCustomMarkerIcon,
} from "@/lib/google-maps-config"
import { useGoogleMapsLoader } from "@/lib/use-google-maps-loader"

interface ParkingLot {
    id: string
    name: string
    address: string
    latitude: number
    longitude: number
    availableSlots: number
    totalSlots: number
    pricePerHour: number
    status: "available" | "limited" | "full"
}

interface EnhancedMapProps {
    parkingLots: ParkingLot[]
    onSelectLot?: (lotId: string) => void
    selectedLotId?: string | null
    showUserLocation?: boolean
    enableRealTimeUpdates?: boolean
    className?: string
}

const containerStyle = {
    width: "100%",
    height: "100%",
}

// Declare global for auth failure callback
declare global {
    interface Window {
        gm_authFailure?: () => void
    }
}

export default function EnhancedMap({
    parkingLots,
    onSelectLot,
    selectedLotId,
    showUserLocation = true,
    enableRealTimeUpdates = true,
    className = "",
}: EnhancedMapProps) {
    const [map, setMap] = useState<google.maps.Map | null>(null)
    const [selectedLot, setSelectedLot] = useState<ParkingLot | null>(null)
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
    const [mapError, setMapError] = useState<string | null>(null)
    const [authError, setAuthError] = useState(false)
    const [isLocating, setIsLocating] = useState(false)
    const updateIntervalRef = useRef<NodeJS.Timeout | null>(null)

    // Catch Google Maps authentication failures
    useEffect(() => {
        window.gm_authFailure = () => {
            console.error("Google Maps Authentication Failure")
            setAuthError(true)
            setMapError("Google Maps API authentication failed. Please check your API key configuration.")
        }

        return () => {
            window.gm_authFailure = undefined
        }
    }, [])

    // Load Google Maps
    const { isLoaded, loadError } = useGoogleMapsLoader()

    // Handle load errors
    useEffect(() => {
        if (loadError) {
            const error = parseMapError(loadError)
            setMapError(error.message)
            console.error("Map Load Error:", error)
        }
    }, [loadError])

    // Get user's current location
    const handleGetUserLocation = useCallback(async () => {
        setIsLocating(true)
        try {
            const location = await getCurrentLocation()
            setUserLocation(location)

            // Pan map to user location
            if (map) {
                map.panTo(location)
                map.setZoom(14)
            }
        } catch (error) {
            console.error("Error getting location:", error)
            setMapError("Unable to get your location. Please enable location services.")
        } finally {
            setIsLocating(false)
        }
    }, [map])

    // Initialize map
    const onLoad = useCallback(
        (mapInstance: google.maps.Map) => {
            setMap(mapInstance)

            // Fit bounds to show all parking lots
            if (parkingLots.length > 0) {
                const bounds = new google.maps.LatLngBounds()
                parkingLots.forEach((lot) => {
                    bounds.extend({ lat: lot.latitude, lng: lot.longitude })
                })
                mapInstance.fitBounds(bounds)
            }

            // Get user location if enabled
            if (showUserLocation) {
                handleGetUserLocation()
            }
        },
        [parkingLots, showUserLocation, handleGetUserLocation]
    )

    const onUnmount = useCallback(() => {
        setMap(null)
    }, [])

    // Handle marker click
    const handleMarkerClick = useCallback(
        (lot: ParkingLot) => {
            setSelectedLot(lot)
            onSelectLot?.(lot.id)

            // Pan to marker
            if (map) {
                map.panTo({ lat: lot.latitude, lng: lot.longitude })
            }
        },
        [map, onSelectLot]
    )

    // Real-time updates simulation
    useEffect(() => {
        if (!enableRealTimeUpdates) return

        updateIntervalRef.current = setInterval(() => {
            // In production, this would fetch real-time data from your API
            console.log("Real-time update check...")
        }, GOOGLE_MAPS_CONFIG.realtimeUpdateInterval)

        return () => {
            if (updateIntervalRef.current) {
                clearInterval(updateIntervalRef.current)
            }
        }
    }, [enableRealTimeUpdates])

    // Update selected lot when prop changes
    useEffect(() => {
        if (selectedLotId) {
            const lot = parkingLots.find((l) => l.id === selectedLotId)
            if (lot) {
                setSelectedLot(lot)
                if (map) {
                    map.panTo({ lat: lot.latitude, lng: lot.longitude })
                }
            }
        }
    }, [selectedLotId, parkingLots, map])

    // Error state - show fallback
    if (loadError || authError || !isGoogleMapsConfigured()) {
        return (
            <div className={`relative h-full w-full bg-slate-950 rounded-3xl overflow-hidden ${className}`}>
                <div className="absolute inset-0 flex items-center justify-center p-8">
                    <Alert className="max-w-2xl bg-slate-900/90 border-yellow-500/20 backdrop-blur-xl">
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                        <AlertTitle className="text-yellow-500 font-bold text-lg">
                            Google Maps Unavailable
                        </AlertTitle>
                        <AlertDescription className="text-slate-300 space-y-4 mt-3">
                            <p>{mapError || "Google Maps API is not configured."}</p>

                            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                <p className="font-semibold text-white mb-2">To enable Google Maps:</p>
                                <ol className="list-decimal list-inside space-y-1 text-sm">
                                    <li>Get an API key from Google Cloud Console</li>
                                    <li>Add it to your .env.local file as NEXT_PUBLIC_GOOGLE_MAPS_KEY</li>
                                    <li>Enable billing (includes $200 free monthly credit)</li>
                                    <li>Restart your development server</li>
                                </ol>
                            </div>

                            <Button
                                variant="outline"
                                className="w-full bg-slate-800 hover:bg-slate-700 border-slate-600"
                                onClick={() => window.open("/SETUP_GOOGLE_MAPS.md", "_blank")}
                            >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                View Setup Guide
                            </Button>

                            <div className="pt-4 border-t border-slate-700">
                                <p className="text-xs text-slate-500">
                                    The application will continue to work with simulated map views.
                                </p>
                            </div>
                        </AlertDescription>
                    </Alert>
                </div>

                {/* Simulated background */}
                <div className="absolute inset-0 opacity-10">
                    <div
                        className="w-full h-full"
                        style={{
                            backgroundImage:
                                "linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)",
                            backgroundSize: "40px 40px",
                        }}
                    />
                </div>
            </div>
        )
    }

    // Loading state
    if (!isLoaded) {
        return (
            <div className={`flex flex-col items-center justify-center h-full bg-slate-950 rounded-3xl ${className}`}>
                <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
                <p className="text-slate-400 font-medium">Loading Google Maps...</p>
                <p className="text-slate-600 text-sm mt-2">Initializing real-time view</p>
            </div>
        )
    }

    return (
        <div className={`relative h-full w-full rounded-3xl overflow-hidden ${className}`}>
            {/* User Location Button */}
            {showUserLocation && (
                <div className="absolute top-4 right-4 z-10">
                    <Button
                        size="sm"
                        onClick={handleGetUserLocation}
                        disabled={isLocating}
                        className="bg-white/90 hover:bg-white text-slate-900 shadow-lg backdrop-blur-sm"
                    >
                        {isLocating ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Navigation className="w-4 h-4" />
                        )}
                        <span className="ml-2">My Location</span>
                    </Button>
                </div>
            )}

            {/* Real-time indicator */}
            {enableRealTimeUpdates && (
                <div className="absolute top-4 left-4 z-10 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md flex items-center gap-2 shadow-lg">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE
                </div>
            )}

            <GoogleMap
                mapContainerStyle={containerStyle}
                center={GOOGLE_MAPS_CONFIG.defaultCenter}
                zoom={GOOGLE_MAPS_CONFIG.defaultZoom}
                onLoad={onLoad}
                onUnmount={onUnmount}
                options={{
                    styles: DARK_MAP_STYLE,
                    disableDefaultUI: false,
                    zoomControl: true,
                    streetViewControl: true,
                    mapTypeControl: true,
                    fullscreenControl: true,
                    minZoom: GOOGLE_MAPS_CONFIG.minZoom,
                    maxZoom: GOOGLE_MAPS_CONFIG.maxZoom,
                }}
            >
                {/* User Location Marker */}
                {userLocation && (
                    <MarkerF
                        position={userLocation}
                        icon={{
                            path: google.maps.SymbolPath.CIRCLE,
                            scale: 10,
                            fillColor: "#6366f1",
                            fillOpacity: 1,
                            strokeColor: "#ffffff",
                            strokeWeight: 3,
                        }}
                        title="Your Location"
                    />
                )}

                {/* Parking Lot Markers */}
                {parkingLots.map((lot) => (
                    <MarkerF
                        key={lot.id}
                        position={{ lat: lot.latitude, lng: lot.longitude }}
                        onClick={() => handleMarkerClick(lot)}
                        icon={createCustomMarkerIcon(lot.status)}
                        animation={
                            selectedLot?.id === lot.id ? google.maps.Animation.BOUNCE : undefined
                        }
                    />
                ))}

                {/* Info Window */}
                {selectedLot && (
                    <InfoWindowF
                        position={{ lat: selectedLot.latitude, lng: selectedLot.longitude }}
                        onCloseClick={() => setSelectedLot(null)}
                    >
                        <div className="p-4 min-w-[280px]">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900">{selectedLot.name}</h3>
                                    <p className="text-sm text-slate-600 mt-1">{selectedLot.address}</p>
                                </div>
                                <div className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg text-sm font-bold">
                                    ₹{selectedLot.pricePerHour}/hr
                                </div>
                            </div>

                            {/* Availability */}
                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600 font-medium">Availability</span>
                                    <span
                                        className={`font-bold ${selectedLot.status === "available"
                                            ? "text-emerald-600"
                                            : selectedLot.status === "limited"
                                                ? "text-amber-600"
                                                : "text-red-600"
                                            }`}
                                    >
                                        {selectedLot.availableSlots}/{selectedLot.totalSlots} slots
                                    </span>
                                </div>
                                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all ${selectedLot.status === "available"
                                            ? "bg-emerald-500"
                                            : selectedLot.status === "limited"
                                                ? "bg-amber-500"
                                                : "bg-red-500"
                                            }`}
                                        style={{
                                            width: `${(selectedLot.availableSlots / selectedLot.totalSlots) * 100}%`,
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Distance (if user location available) */}
                            {userLocation && (
                                <p className="text-xs text-slate-500 mb-3 flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {formatDistance(
                                        calculateDistance(
                                            userLocation.lat,
                                            userLocation.lng,
                                            selectedLot.latitude,
                                            selectedLot.longitude
                                        )
                                    )}
                                </p>
                            )}

                            <Button
                                className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                                onClick={() => {
                                    window.location.href = `/dashboard/parking/${selectedLot.id}`
                                }}
                            >
                                View Details & Book
                            </Button>
                        </div>
                    </InfoWindowF>
                )}
            </GoogleMap>
        </div>
    )
}
