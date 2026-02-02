"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import "leaflet-defaulticon-compatibility"
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css"
import { useRouter } from "next/navigation"
import ParkingHeatmap from "./ParkingHeatmap"
import { Button } from "@/components/ui/button"
import { Map as MapIcon, Thermometer } from "lucide-react"

// Fix for default marker icons in react-leaflet v4+
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Define marker icons
const createMarkerIcon = (color: string) => {
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  })
}

const availableIcon = createMarkerIcon("#22c55e") // green
const limitedIcon = createMarkerIcon("#eab308") // yellow
const fullIcon = createMarkerIcon("#ef4444") // red

// Map center component
function MapCenter({ parkingAreas }: { parkingAreas: any[] }) {
  const map = useMap()

  useEffect(() => {
    if (parkingAreas.length > 0 && map) {
      try {
        // Create bounds from all parking areas
        const bounds = L.latLngBounds(parkingAreas.map((area) => area.coordinates))
        map.fitBounds(bounds, { padding: [50, 50] })
      } catch (error) {
        console.warn('Error fitting bounds:', error)
      }
    }
  }, [map, parkingAreas])

  return null
}

interface ParkingMapProps {
  parkingAreas: any[]
  selectedId: string | null
  onSelectParkingArea: (id: string) => void
}

export default function ParkingMap({ parkingAreas, selectedId, onSelectParkingArea }: ParkingMapProps) {
  const router = useRouter()
  const [showHeatmap, setShowHeatmap] = useState(false)

  // Calculate initial center based on parking areas or use Chennai as default
  const getInitialCenter = () => {
    if (parkingAreas.length > 0) {
      // Use first parking area as center
      return parkingAreas[0].coordinates
    }
    // Default to Chennai, Tamil Nadu
    return [13.0827, 80.2707]
  }

  const getMarkerIcon = (status: string) => {
    switch (status) {
      case "available":
        return availableIcon
      case "limited":
        return limitedIcon
      case "full":
        return fullIcon
      default:
        return availableIcon
    }
  }

  const handleMarkerClick = (id: string) => {
    onSelectParkingArea(id)
  }

  const handleViewDetails = (id: string) => {
    router.push(`/dashboard/parking/${id}`)
  }

  return (
    <div className="relative rounded-xl overflow-hidden">
      <div className="absolute inset-0 z-10 pointer-events-none animate-pulse bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      {/* Heatmap Toggle Button */}
      <div className="absolute top-4 right-4 z-20">
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
      
      <MapContainer center={getInitialCenter()} zoom={13} style={{ height: "100%", width: "100%" }} zoomControl={true}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <MapCenter parkingAreas={parkingAreas} />

        {/* Heatmap Layer */}
        {showHeatmap && <ParkingHeatmap parkingAreas={parkingAreas} />}

        {/* Markers Layer */}
        {!showHeatmap && parkingAreas.map((area) => (
          <Marker
            key={area.id}
            position={area.coordinates}
            icon={getMarkerIcon(area.status)}
            eventHandlers={{
              click: () => handleMarkerClick(area.id),
            }}
          >
            <Popup>
              <div className="p-1">
                <h3 className="font-semibold">{area.name}</h3>
                <p className="text-sm">{area.address}</p>
                <p className="text-sm mt-1">
                  <span
                    className={`font-medium ${area.status === "available" ? "text-green-600" : area.status === "limited" ? "text-yellow-600" : "text-red-600"}`}
                  >
                    {area.availableSpots} / {area.totalSpots} spots available
                  </span>
                </p>
                <p className="text-sm mt-1">${area.price}/hr</p>
                <button
                  className="mt-2 w-full bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded text-sm"
                  onClick={() => handleViewDetails(area.id)}
                >
                  View Details
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}

