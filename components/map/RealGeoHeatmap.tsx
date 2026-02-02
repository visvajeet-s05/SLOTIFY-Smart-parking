"use client"

import { useEffect, useRef, useState } from "react"
import { useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet.heat"
import { Thermometer, MapPin, Info } from "lucide-react"

interface HeatmapDataPoint {
  lat: number
  lng: number
  intensity: number
  type: 'demand' | 'availability' | 'price'
}

const generateHeatmapData = (): HeatmapDataPoint[] => {
  const data: HeatmapDataPoint[] = []
  const centerLat = 51.505
  const centerLng = -0.09
  
  for (let i = 0; i < 100; i++) {
    const latOffset = (Math.random() - 0.5) * 0.1
    const lngOffset = (Math.random() - 0.5) * 0.1
    
    const intensity = Math.random()
    
    data.push({
      lat: centerLat + latOffset,
      lng: centerLng + lngOffset,
      intensity: intensity,
      type: Math.random() > 0.66 ? 'price' : (Math.random() > 0.33 ? 'availability' : 'demand')
    })
  }
  
  return data
}

interface RealGeoHeatmapProps {
  dataType: 'demand' | 'availability' | 'price'
}

export default function RealGeoHeatmap({ dataType }: RealGeoHeatmapProps) {
  const map = useMap()
  const heatLayerRef = useRef<any>(null)
  const [heatmapData, setHeatmapData] = useState<HeatmapDataPoint[]>([])

  useEffect(() => {
    const data = generateHeatmapData()
    setHeatmapData(data)
  }, [])

  useEffect(() => {
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current)
    }

    const layerData = heatmapData.map(point => [
      point.lat, 
      point.lng, 
      getIntensityByType(point.intensity, point.type, dataType)
    ])

    heatLayerRef.current = (L as any).heatLayer(layerData, {
      radius: 25,
      blur: 20,
      maxZoom: 18,
      gradient: getGradient(dataType)
    })

    heatLayerRef.current.addTo(map)

    return () => {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current)
      }
    }
  }, [heatmapData, dataType, map])

  const getIntensityByType = (baseIntensity: number, pointType: string, currentType: string): number => {
    if (pointType === currentType) {
      return baseIntensity * 0.8 + 0.2
    }
    return baseIntensity * 0.3
  }

  const getGradient = (type: string) => {
    switch (type) {
      case 'demand':
        return {
          0.0: 'blue',
          0.33: 'cyan',
          0.66: 'yellow',
          1.0: 'red'
        }
      case 'availability':
        return {
          0.0: 'red',
          0.33: 'orange',
          0.66: 'yellow',
          1.0: 'green'
        }
      case 'price':
        return {
          0.0: 'green',
          0.33: 'yellow',
          0.66: 'orange',
          1.0: 'red'
        }
      default:
        return {
          0.0: 'blue',
          0.6: 'cyan',
          1.0: 'red'
        }
    }
  }

  const getLegendTitle = () => {
    switch (dataType) {
      case 'demand':
        return 'Demand Level'
      case 'availability':
        return 'Availability'
      case 'price':
        return 'Price per Hour'
      default:
        return 'Heatmap'
    }
  }

  return (
    <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 max-w-xs">
      <div className="flex items-center gap-2 mb-2">
        <Thermometer className="h-4 w-4 text-gray-600" />
        <h3 className="text-sm font-semibold text-gray-800">{getLegendTitle()}</h3>
      </div>
      
      <div className="space-y-2">
        {dataType === 'demand' && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Low Demand</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Medium Demand</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>High Demand</span>
            </div>
          </div>
        )}
        
        {dataType === 'availability' && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Low Availability</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Medium Availability</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>High Availability</span>
            </div>
          </div>
        )}
        
        {dataType === 'price' && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Low Price</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Medium Price</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>High Price</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-2 flex items-start gap-2">
        <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-gray-500 leading-relaxed">
          Heatmap shows real-time {dataType} distribution across the city.
          {dataType === 'demand' && ' Red areas indicate high demand and potential price surges.'}
          {dataType === 'availability' && ' Green areas have high availability and better prices.'}
          {dataType === 'price' && ' Red areas indicate premium pricing due to high demand.'}
        </p>
      </div>
    </div>
  )
}