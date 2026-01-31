"use client"

import { useEffect, useState } from "react"

export function useUserLocation() {
  const [location, setLocation] = useState<{
    lat: number
    lng: number
  } | null>(null)

  const [error, setError] = useState<string | null>(null)
  const [isAskingPermission, setIsAskingPermission] = useState(false)

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported")
      return
    }

    // Ask for location permission on page load
    setIsAskingPermission(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        })
        setIsAskingPermission(false)
      },
      (err) => {
        setIsAskingPermission(false)
        if (err.code === err.PERMISSION_DENIED) {
          setError("Location permission denied. Using fallback location.")
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setError("Location information is unavailable.")
        } else if (err.code === err.TIMEOUT) {
          setError("Location request timed out.")
        } else {
          setError("An unknown error occurred.")
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 600000, // 10 minutes
      }
    )
  }, [])

  return { location, error, isAskingPermission }
}
