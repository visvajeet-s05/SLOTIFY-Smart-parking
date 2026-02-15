"use client"

import { GoogleMap } from "@react-google-maps/api"
import { useGoogleMapsLoader } from "@/lib/use-google-maps-loader"
import { useMemo } from "react"

const containerStyle = {
  width: "100%",
  height: "100%",
}

const defaultCenter = {
  lat: 51.505,
  lng: -0.09,
}

const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  { elementType: "geometry", stylers: [{ color: "#212121" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#757575" }] },
  { featureType: "administrative.country", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
  { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#181818" }] },
  { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#2c2c2c" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] },
]

function ActualMapBackground({ apiKey }: { apiKey: string }) {
  const { isLoaded, loadError } = useGoogleMapsLoader()

  const options = useMemo(() => ({
    styles: darkMapStyle,
    disableDefaultUI: true,
    draggable: false,
    zoomControl: false,
    scrollwheel: false,
    disableDoubleClickZoom: true,
  }), [])

  if (loadError || !isLoaded) return <div className="w-full h-full bg-slate-950" />

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={defaultCenter}
      zoom={13}
      options={options}
    />
  )
}

export default function MapBackground() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || ""
  const isInvalidKey = apiKey === "" || apiKey === "YOUR_API_KEY"

  if (isInvalidKey) return <div className="w-full h-full bg-slate-950" />

  return <ActualMapBackground apiKey={apiKey} />
}
