"use client"

import { GoogleMap, useJsApiLoader } from "@react-google-maps/api"
import { useState, useEffect, useMemo } from "react"
import { Loader2 } from "lucide-react"

const containerStyle = {
  width: "100%",
  height: "100%",
}

const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
]

function ActualBackgroundMap({ apiKey }: { apiKey: string }) {
  const [center, setCenter] = useState({ lat: 13.0827, lng: 80.2707 }) // Default Chennai

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: apiKey,
  })

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setCenter({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
      })
    }
  }, [])

  const options = useMemo(() => ({
    styles: darkMapStyle,
    disableDefaultUI: true,
    zoomControl: false,
    scrollwheel: false,
    draggable: false,
    disableDoubleClickZoom: true,
  }), [])

  if (loadError || !isLoaded) {
    return (
      <div className="w-full h-full bg-slate-950 flex items-center justify-center">
        <div className="absolute inset-0 opacity-10 bg-[url('/grid.svg')] bg-center" />
        {!isLoaded && !loadError && <Loader2 className="w-8 h-8 animate-spin text-purple-600 opacity-20" />}
      </div>
    )
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={13}
      options={options}
    />
  )
}

export default function BackgroundMap() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || ""
  const isInvalidKey = apiKey === "" || apiKey === "YOUR_API_KEY"

  if (isInvalidKey) {
    return (
      <div className="w-full h-full bg-slate-950 flex items-center justify-center">
        <div className="absolute inset-0 opacity-10 bg-[url('/grid.svg')] bg-center" />
      </div>
    )
  }

  return <ActualBackgroundMap apiKey={apiKey} />
}
