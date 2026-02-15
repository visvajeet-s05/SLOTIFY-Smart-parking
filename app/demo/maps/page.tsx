"use client"

import { useState } from "react"
import EnhancedMap from "@/components/map/EnhancedMap"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Clock, DollarSign, Car } from "lucide-react"

// Sample parking lot data for demonstration
const SAMPLE_PARKING_LOTS = [
    {
        id: "1",
        name: "Marina Beach Parking",
        address: "Marina Beach Road, Chennai",
        latitude: 13.0499,
        longitude: 80.2824,
        availableSlots: 45,
        totalSlots: 100,
        pricePerHour: 30,
        status: "available" as const,
    },
    {
        id: "2",
        name: "T Nagar Shopping Complex",
        address: "Ranganathan Street, T Nagar",
        latitude: 13.0418,
        longitude: 80.2341,
        availableSlots: 12,
        totalSlots: 80,
        pricePerHour: 40,
        status: "limited" as const,
    },
    {
        id: "3",
        name: "Central Railway Station",
        address: "Chennai Central, Periyamet",
        latitude: 13.0827,
        longitude: 80.2750,
        availableSlots: 0,
        totalSlots: 150,
        pricePerHour: 25,
        status: "full" as const,
    },
    {
        id: "4",
        name: "Phoenix Marketcity",
        address: "Velachery Main Road, Chennai",
        latitude: 12.9926,
        longitude: 80.2189,
        availableSlots: 89,
        totalSlots: 200,
        pricePerHour: 50,
        status: "available" as const,
    },
    {
        id: "5",
        name: "Express Avenue Mall",
        address: "Royapettah, Chennai",
        latitude: 13.0569,
        longitude: 80.2602,
        availableSlots: 23,
        totalSlots: 120,
        pricePerHour: 45,
        status: "limited" as const,
    },
]

export default function MapDemoPage() {
    const [selectedLotId, setSelectedLotId] = useState<string | null>(null)
    const selectedLot = SAMPLE_PARKING_LOTS.find((lot) => lot.id === selectedLotId)

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                        🗺️ Google Maps Integration Demo
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        Real-time, production-ready Google Maps with custom markers, user location tracking, and
                        live parking availability updates
                    </p>

                    {/* Status Badges */}
                    <div className="flex items-center justify-center gap-3 flex-wrap">
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-2" />
                            Real-time Updates
                        </Badge>
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                            <MapPin className="w-3 h-3 mr-1" />
                            User Location
                        </Badge>
                        <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20">
                            <Car className="w-3 h-3 mr-1" />
                            {SAMPLE_PARKING_LOTS.length} Parking Lots
                        </Badge>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Map */}
                    <Card className="lg:col-span-2 bg-slate-900/50 border-slate-800 backdrop-blur-xl overflow-hidden">
                        <CardHeader>
                            <CardTitle className="text-white">Interactive Map</CardTitle>
                            <CardDescription>
                                Click on markers to view parking lot details. Use "My Location" to find nearby parking.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="h-[600px]">
                                <EnhancedMap
                                    parkingLots={SAMPLE_PARKING_LOTS}
                                    onSelectLot={setSelectedLotId}
                                    selectedLotId={selectedLotId}
                                    showUserLocation={true}
                                    enableRealTimeUpdates={true}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Selected Lot Details */}
                        {selectedLot ? (
                            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-start justify-between">
                                        <span>{selectedLot.name}</span>
                                        <Badge
                                            variant="outline"
                                            className={
                                                selectedLot.status === "available"
                                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                    : selectedLot.status === "limited"
                                                        ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                                        : "bg-red-500/10 text-red-400 border-red-500/20"
                                            }
                                        >
                                            {selectedLot.status}
                                        </Badge>
                                    </CardTitle>
                                    <CardDescription>{selectedLot.address}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Stats */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-slate-800/50 p-3 rounded-lg">
                                            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                                                <Car className="w-4 h-4" />
                                                Available
                                            </div>
                                            <div className="text-2xl font-bold text-white">
                                                {selectedLot.availableSlots}/{selectedLot.totalSlots}
                                            </div>
                                        </div>
                                        <div className="bg-slate-800/50 p-3 rounded-lg">
                                            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                                                <DollarSign className="w-4 h-4" />
                                                Price
                                            </div>
                                            <div className="text-2xl font-bold text-white">₹{selectedLot.pricePerHour}</div>
                                            <div className="text-xs text-slate-500">per hour</div>
                                        </div>
                                    </div>

                                    {/* Availability Bar */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400">Occupancy</span>
                                            <span className="text-white font-medium">
                                                {Math.round(
                                                    ((selectedLot.totalSlots - selectedLot.availableSlots) /
                                                        selectedLot.totalSlots) *
                                                    100
                                                )}
                                                %
                                            </span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all ${selectedLot.status === "available"
                                                        ? "bg-emerald-500"
                                                        : selectedLot.status === "limited"
                                                            ? "bg-amber-500"
                                                            : "bg-red-500"
                                                    }`}
                                                style={{
                                                    width: `${((selectedLot.totalSlots - selectedLot.availableSlots) /
                                                            selectedLot.totalSlots) *
                                                        100
                                                        }%`,
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                                        Book Now
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
                                <CardContent className="pt-6 text-center text-slate-400">
                                    <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>Select a parking lot on the map to view details</p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Parking List */}
                        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
                            <CardHeader>
                                <CardTitle className="text-white text-sm">All Parking Lots</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 max-h-[400px] overflow-y-auto">
                                {SAMPLE_PARKING_LOTS.map((lot) => (
                                    <button
                                        key={lot.id}
                                        onClick={() => setSelectedLotId(lot.id)}
                                        className={`w-full text-left p-3 rounded-lg transition-all ${selectedLotId === lot.id
                                                ? "bg-purple-500/20 border border-purple-500/30"
                                                : "bg-slate-800/30 hover:bg-slate-800/50 border border-transparent"
                                            }`}
                                    >
                                        <div className="flex items-start justify-between mb-1">
                                            <span className="font-medium text-white text-sm">{lot.name}</span>
                                            <Badge
                                                variant="outline"
                                                className={`text-xs ${lot.status === "available"
                                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                        : lot.status === "limited"
                                                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                                            : "bg-red-500/10 text-red-400 border-red-500/20"
                                                    }`}
                                            >
                                                {lot.availableSlots} slots
                                            </Badge>
                                        </div>
                                        <div className="text-xs text-slate-400 flex items-center gap-2">
                                            <span>₹{lot.pricePerHour}/hr</span>
                                            <span>•</span>
                                            <span className="truncate">{lot.address}</span>
                                        </div>
                                    </button>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Features */}
                <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="text-white">✨ Features</CardTitle>
                        <CardDescription>
                            This demo showcases the production-ready Google Maps integration
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-slate-800/30 p-4 rounded-lg">
                                <div className="text-emerald-400 font-bold mb-2">🎯 Real-time Updates</div>
                                <p className="text-sm text-slate-400">
                                    Live parking availability updates every 5 seconds via WebSocket
                                </p>
                            </div>
                            <div className="bg-slate-800/30 p-4 rounded-lg">
                                <div className="text-blue-400 font-bold mb-2">📍 User Location</div>
                                <p className="text-sm text-slate-400">
                                    Automatic location detection with distance calculations
                                </p>
                            </div>
                            <div className="bg-slate-800/30 p-4 rounded-lg">
                                <div className="text-purple-400 font-bold mb-2">🎨 Custom Styling</div>
                                <p className="text-sm text-slate-400">
                                    Dark theme with custom markers and smooth animations
                                </p>
                            </div>
                            <div className="bg-slate-800/30 p-4 rounded-lg">
                                <div className="text-pink-400 font-bold mb-2">🛡️ Error Handling</div>
                                <p className="text-sm text-slate-400">
                                    Automatic fallback UI with helpful setup instructions
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
