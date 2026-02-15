/**
 * Google Maps Configuration and Utilities
 * Provides centralized configuration for all Google Maps instances
 */

export const GOOGLE_MAPS_CONFIG = {
  // API Key from environment
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "",
  
  // Default map center (Chennai, India)
  defaultCenter: {
    lat: 13.0827,
    lng: 80.2707,
  },
  
  // Libraries to load
  libraries: ["places", "visualization", "geometry"] as const,
  
  // Map options
  defaultZoom: 13,
  minZoom: 3,
  maxZoom: 20,
  
  // Real-time update interval (ms)
  realtimeUpdateInterval: 5000, // 5 seconds
  
  // Marker clustering threshold
  clusteringThreshold: 10,
}

/**
 * Custom Dark Theme for Google Maps
 * Matches the application's dark mode aesthetic
 */
export const DARK_MAP_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#0f172a" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0f172a" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#64748b" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#94a3b8" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#64748b" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#0f172a" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#1e293b" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#475569" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#1e293b" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#0f172a" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#64748b" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#334155" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1e293b" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#94a3b8" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#1e293b" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#64748b" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0c1220" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#334155" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#0c1220" }],
  },
]

/**
 * Cyberpunk/Neon Theme for Google Maps
 * High-tech aesthetic for premium feel
 */
export const CYBERPUNK_MAP_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#0a0e27" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0a0e27" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#6366f1" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#a78bfa" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#8b5cf6" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#1e1b4b" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#1e1b4b" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#312e81" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#4c1d95" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#6366f1" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0c0a1f" }],
  },
]

/**
 * Map Error Types
 */
export enum MapErrorType {
  API_KEY_MISSING = "API_KEY_MISSING",
  API_KEY_INVALID = "API_KEY_INVALID",
  BILLING_NOT_ENABLED = "BILLING_NOT_ENABLED",
  REFERER_NOT_ALLOWED = "REFERER_NOT_ALLOWED",
  QUOTA_EXCEEDED = "QUOTA_EXCEEDED",
  NETWORK_ERROR = "NETWORK_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

/**
 * Parse Google Maps error and return user-friendly message
 */
export function parseMapError(error: any): {
  type: MapErrorType
  message: string
  solution: string
} {
  const errorString = error?.toString() || ""

  if (errorString.includes("ApiProjectMapError") || !GOOGLE_MAPS_CONFIG.apiKey) {
    return {
      type: MapErrorType.API_KEY_MISSING,
      message: "Google Maps API key is missing or invalid",
      solution: "Please configure NEXT_PUBLIC_GOOGLE_MAPS_KEY in your .env.local file",
    }
  }

  if (errorString.includes("BillingNotEnabledMapError")) {
    return {
      type: MapErrorType.BILLING_NOT_ENABLED,
      message: "Billing is not enabled for Google Maps API",
      solution: "Enable billing in Google Cloud Console (includes $200 free monthly credit)",
    }
  }

  if (errorString.includes("RefererNotAllowedMapError")) {
    return {
      type: MapErrorType.REFERER_NOT_ALLOWED,
      message: "This domain is not authorized to use the API key",
      solution: "Add your domain to the API key's HTTP referrer restrictions",
    }
  }

  if (errorString.includes("OverQuotaMapError")) {
    return {
      type: MapErrorType.QUOTA_EXCEEDED,
      message: "Google Maps API quota exceeded",
      solution: "Check your usage in Google Cloud Console or upgrade your plan",
    }
  }

  if (errorString.includes("NetworkError") || errorString.includes("Failed to fetch")) {
    return {
      type: MapErrorType.NETWORK_ERROR,
      message: "Network error loading Google Maps",
      solution: "Check your internet connection and try again",
    }
  }

  return {
    type: MapErrorType.UNKNOWN_ERROR,
    message: "An unknown error occurred loading Google Maps",
    solution: "Please check the browser console for more details",
  }
}

/**
 * Get marker color based on parking status
 */
export function getMarkerColor(status: "available" | "limited" | "full"): {
  primary: string
  secondary: string
  glow: string
} {
  switch (status) {
    case "available":
      return {
        primary: "#10b981", // emerald-500
        secondary: "#34d399", // emerald-400
        glow: "0 0 20px rgba(16, 185, 129, 0.6)",
      }
    case "limited":
      return {
        primary: "#f59e0b", // amber-500
        secondary: "#fbbf24", // amber-400
        glow: "0 0 20px rgba(245, 158, 11, 0.6)",
      }
    case "full":
      return {
        primary: "#ef4444", // red-500
        secondary: "#f87171", // red-400
        glow: "0 0 20px rgba(239, 68, 68, 0.6)",
      }
  }
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 * Returns distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371 // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Format distance for display
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m away`
  }
  return `${km.toFixed(1)}km away`
}

/**
 * Get bounds for multiple coordinates
 */
export function getBoundsForCoordinates(
  coordinates: Array<{ lat: number; lng: number }>
): google.maps.LatLngBounds | null {
  if (typeof google === "undefined" || coordinates.length === 0) return null

  const bounds = new google.maps.LatLngBounds()
  coordinates.forEach((coord) => {
    bounds.extend(new google.maps.LatLng(coord.lat, coord.lng))
  })
  return bounds
}

/**
 * Check if API key is configured
 */
export function isGoogleMapsConfigured(): boolean {
  return Boolean(GOOGLE_MAPS_CONFIG.apiKey && GOOGLE_MAPS_CONFIG.apiKey.length > 0)
}

/**
 * Get user's current location
 */
export function getCurrentLocation(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
      },
      (error) => {
        reject(error)
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    )
  })
}

/**
 * Animate marker bounce
 */
export function animateMarker(marker: google.maps.Marker, duration: number = 1000) {
  marker.setAnimation(google.maps.Animation.BOUNCE)
  setTimeout(() => {
    marker.setAnimation(null)
  }, duration)
}

/**
 * Create custom marker icon
 */
export function createCustomMarkerIcon(
  status: "available" | "limited" | "full",
  size: number = 40
): google.maps.Icon {
  const colors = getMarkerColor(status)
  
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
      <svg width="${size}" height="${size * 1.5}" viewBox="0 0 40 60" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <path d="M20 0 C9 0 0 9 0 20 C0 35 20 60 20 60 C20 60 40 35 40 20 C40 9 31 0 20 0 Z" 
              fill="${colors.primary}" 
              filter="url(#glow)"
              stroke="${colors.secondary}" 
              stroke-width="2"/>
        <circle cx="20" cy="20" r="8" fill="white" opacity="0.9"/>
      </svg>
    `)}`,
    scaledSize: new google.maps.Size(size, size * 1.5),
    anchor: new google.maps.Point(size / 2, size * 1.5),
  }
}
