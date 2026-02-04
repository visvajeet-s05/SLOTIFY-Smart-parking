"use client"

import React, { useEffect, useState } from "react"

export default function AskLocation(): React.ReactElement | null {
  const [showRetry, setShowRetry] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    try {
      const asked = localStorage.getItem("locationPromptAsked")
      if (asked === "true") return

      if (!("geolocation" in navigator)) {
        localStorage.setItem("locationPromptAsked", "true")
        return
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords
          localStorage.setItem("userLocation", JSON.stringify({ latitude, longitude }))
          localStorage.setItem("locationPromptAsked", "true")
        },
        (err) => {
          // If permission was denied or another error occurred, allow user to retry
          localStorage.setItem("locationPromptAsked", "true")
          if (err && err.code === 1) {
            setShowRetry(true)
          }
        },
        { enableHighAccuracy: true, timeout: 10000 }
      )
    } catch (e) {
      // ignore
    }
  }, [])

  const requestAgain = () => {
    try {
      if (!("geolocation" in navigator)) return
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords
          localStorage.setItem("userLocation", JSON.stringify({ latitude, longitude }))
          setShowRetry(false)
        },
        () => {
          setShowRetry(true)
        },
        { enableHighAccuracy: true, timeout: 10000 }
      )
    } catch (e) {
      // ignore
    }
  }

  if (!showRetry) return null

  return (
    <div style={{ position: "fixed", right: 16, bottom: 16, zIndex: 60 }}>
      <button
        onClick={requestAgain}
        style={{
          background: "#111827",
          color: "#fff",
          padding: "8px 12px",
          borderRadius: 8,
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        Allow location to improve navigation
      </button>
    </div>
  )
}
