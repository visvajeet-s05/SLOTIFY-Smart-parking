"use client"

import { useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { useRouter } from "next/navigation"

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
    if (parkingAreas.length > 0) {
      // Create bounds from all parking areas
      const bounds = L.latLngBounds(parkingAreas.map((area) => area.coordinates))
      map.fitBounds(bounds, { padding: [50, 50] })
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
    <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: "100%", width: "100%" }} zoomControl={true}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      <MapCenter parkingAreas={parkingAreas} />

      {parkingAreas.map((area) => (
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
  )
}

