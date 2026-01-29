"use client"

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { Icon } from "leaflet"
import { useEffect, useState } from "react"

// Fix for default marker icon in Leaflet with Next.js
const icon = new Icon({
  iconUrl: "/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

export default function BackgroundMap() {
  // Default coordinates (city center)
  const [position, setPosition] = useState<[number, number]>([51.505, -0.09])

  // Try to get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setPosition([position.coords.latitude, position.coords.longitude])
        },
        (error) => {
          console.error("Error getting location:", error)
        },
      )
    }
  }, [])

  return (
    <MapContainer
      center={position}
      zoom={13}
      scrollWheelZoom={false}
      zoomControl={false}
      attributionControl={false}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={position} icon={icon}>
        <Popup>Your current location</Popup>
      </Marker>
    </MapContainer>
  )
}

