"use client"

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { useState } from "react"

const DEFAULT_POSITION: [number, number] = [28.6139, 77.209] // Delhi default

export default function LocationMapStep() {
  const [position, setPosition] = useState<[number, number]>(DEFAULT_POSITION)

  function LocationMarker() {
    useMapEvents({
      click(e) {
        setPosition([e.latlng.lat, e.latlng.lng])
      },
    })

    return <Marker position={position} />
  }

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
      <div className="h-[420px] rounded-lg overflow-hidden border border-gray-800">
        <MapContainer
          center={position}
          zoom={14}
          scrollWheelZoom
          className="h-full w-full"
        >
          <TileLayer
            attribution="© OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker />
        </MapContainer>
      </div>

      {/* Coordinates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800/40 border border-gray-700 rounded p-4 text-sm">
          <span className="text-gray-400">Latitude:</span>
          <div className="font-medium">{position[0].toFixed(6)}</div>
        </div>
        <div className="bg-gray-800/40 border border-gray-700 rounded p-4 text-sm">
          <span className="text-gray-400">Longitude:</span>
          <div className="font-medium">{position[1].toFixed(6)}</div>
        </div>
      </div>

      {/* Info */}
      <div className="bg-gray-800/30 border border-gray-700 rounded p-4 text-sm text-gray-400">
        Tip: Zoom in and click exactly at the parking entry point.
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