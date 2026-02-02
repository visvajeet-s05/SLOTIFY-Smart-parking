"use client"

import { useEffect, useRef } from "react"
import { useMap } from "react-leaflet"
import L from "leaflet"

// Import heatmap plugin
import "leaflet.heat"

interface ParkingHeatmapProps {
  parkingAreas: any[]
}

export default function ParkingHeatmap({ parkingAreas }: ParkingHeatmapProps) {
  const map = useMap()
  const heatLayerRef = useRef<any>(null)

  useEffect(() => {
    if (!map) return

    // Remove existing heat layer if it exists
    if (heatLayerRef.current) {
      try {
        map.removeLayer(heatLayerRef.current)
      } catch (error) {
        console.warn('Error removing heat layer:', error)
      }
    }

    // Create heatmap data points with density based on availability
    const heatData = parkingAreas.map((area) => {
      const density = calculateDensity(area.availableSpots, area.totalSpots)
      return [area.coordinates[0], area.coordinates[1], density]
    })

    // Create heat layer
    try {
      heatLayerRef.current = (L as any).heatLayer(heatData, {
        radius: 30,
        blur: 20,
        maxZoom: 18,
      })

      // Add heat layer to map
      heatLayerRef.current.addTo(map)
    } catch (error) {
      console.warn('Error creating heat layer:', error)
    }

    // Cleanup
    return () => {
      if (heatLayerRef.current && map) {
        try {
          map.removeLayer(heatLayerRef.current)
        } catch (error) {
          console.warn('Error removing heat layer in cleanup:', error)
        }
      }
    }
  }, [parkingAreas, map])

  // Calculate density based on available spots percentage
  const calculateDensity = (available: number, total: number) => {
    const percentage = (available / total) * 100
    
    // Higher percentage (more available) = lower density (cooler colors)
    // Lower percentage (less available) = higher density (hotter colors)
    if (percentage > 70) return 0.3 // Green - low demand
    if (percentage > 30) return 0.6 // Yellow - medium demand
    return 0.9 // Red - high demand
  }

  return null
}
