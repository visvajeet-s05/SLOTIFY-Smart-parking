"use client"

import { GoogleMap, useJsApiLoader, MarkerF, Circle, InfoWindowF } from "@react-google-maps/api"
import { useState } from "react"
import { Loader2 } from "lucide-react"

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

const containerStyle = {
  width: "100%",
  height: "100vh",
}

export default function UserMap({ lat, lng, parkings = [] }: Props) {
  const [selectedParking, setSelectedParking] = useState<Parking | null>(null)

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "",
  })

  if (!isLoaded) return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-100">
      <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
    </div>
  )

  const center = { lat, lng }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={13}
    >
      {/* User Location Marker */}
      <MarkerF
        position={center}
        label={{ text: "You", color: "white", fontWeight: "bold" }}
      />

      {/* 25km radius circle */}
      <Circle
        center={center}
        radius={25000}
        options={{
          strokeColor: "#9333ea", // purple-600
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: "#9333ea",
          fillOpacity: 0.1,
        }}
      />

      {parkings.map((parking) => (
        <MarkerF
          key={parking.id}
          position={{ lat: parking.latitude, lng: parking.longitude }}
          onClick={() => setSelectedParking(parking)}
        />
      ))}

      {selectedParking && (
        <InfoWindowF
          position={{ lat: selectedParking.latitude, lng: selectedParking.longitude }}
          onCloseClick={() => setSelectedParking(null)}
        >
          <div className="p-2">
            <h3 className="font-bold text-gray-900">{selectedParking.name}</h3>
            <p className="text-sm text-gray-600">Available parking spot</p>
          </div>
        </InfoWindowF>
      )}
    </GoogleMap>
  )
}
