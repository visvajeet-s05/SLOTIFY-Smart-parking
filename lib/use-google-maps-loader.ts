"use client"

import { useJsApiLoader } from "@react-google-maps/api"
import { GOOGLE_MAPS_CONFIG } from "./google-maps-config"

/**
 * Centralized Google Maps Loader Hook
 * Use this hook in ALL components that need Google Maps
 * This prevents the "Loader must not be called again with different options" error
 */

const libraries: ("places" | "visualization" | "geometry" | "drawing")[] = [
    "places",
    "visualization",
    "geometry",
]

let isLoaderInitialized = false

export function useGoogleMapsLoader() {
    const { isLoaded, loadError } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: GOOGLE_MAPS_CONFIG.apiKey,
        libraries: libraries,
        version: "weekly",
    })

    if (!isLoaderInitialized && isLoaded) {
        isLoaderInitialized = true
    }

    return { isLoaded, loadError }
}

/**
 * Check if Google Maps is already loaded
 */
export function isGoogleMapsLoaded(): boolean {
    return typeof window !== "undefined" && typeof google !== "undefined" && typeof google.maps !== "undefined"
}

/**
 * Wait for Google Maps to load
 */
export function waitForGoogleMaps(timeout = 10000): Promise<void> {
    return new Promise((resolve, reject) => {
        if (isGoogleMapsLoaded()) {
            resolve()
            return
        }

        const startTime = Date.now()
        const checkInterval = setInterval(() => {
            if (isGoogleMapsLoaded()) {
                clearInterval(checkInterval)
                resolve()
            } else if (Date.now() - startTime > timeout) {
                clearInterval(checkInterval)
                reject(new Error("Google Maps loading timeout"))
            }
        }, 100)
    })
}
