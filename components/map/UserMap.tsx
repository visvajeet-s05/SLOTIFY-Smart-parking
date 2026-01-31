"use client"

import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"

// Fix for Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
})

interface Parking {
  id: string
  name: string
  latitude: number
  longitude: number
}

interface Props {
  lat: number
  lng: number
  parkings?: Parking[]
}

export default function UserMap({ lat, lng, parkings = [] }: Props) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={13}
      style={{ height: "100vh", width: "100%" }}
      className="z-0"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[lat, lng]}>
        <Popup>You are here</Popup>
      </Marker>
      
      {/* 25km radius circle */}
      <Circle
        center={[lat, lng]}
        radius={25000}
        pathOptions={{ 
          color: "purple",
          weight: 2,
          opacity: 0.8,
          fillOpacity: 0.1
        }}
      />
      
      {parkings.map((parking) => (
        <Marker key={parking.id} position={[parking.latitude, parking.longitude]}>
          <Popup>
            <div>
              <h3 className="font-bold">{parking.name}</h3>
              <p className="text-sm text-gray-600">Available parking spot</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
