"use client"

import { MapContainer, TileLayer } from "react-leaflet"

export default function StickyMap() {
  return (
    <div className="hidden lg:block lg:sticky lg:top-24 h-[420px] rounded-xl overflow-hidden">
      <MapContainer
        center={[13.0827, 80.2707]}
        zoom={12}
        className="w-full h-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>
    </div>
  )
}