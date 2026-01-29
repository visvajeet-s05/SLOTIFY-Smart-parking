"use client"

import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { MapPin, Star, Navigation2, Clock, TrendingUp, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface ParkingAreaCardProps {
  parkingArea: {
    id: string
    name: string
    address: string
    availableSpots: number
    totalSpots: number
    price: number
    rating: number
    distance: number
    status: "available" | "limited" | "full"
  }
  isSelected?: boolean
  onSelect?: () => void
}

export default function ParkingAreaCard({
  parkingArea,
  isSelected = false,
  onSelect,
}: ParkingAreaCardProps) {
  const router = useRouter()
  const occupancyPercent = Math.round((parkingArea.availableSpots / parkingArea.totalSpots) * 100)
  const availabilityPercent = (parkingArea.availableSpots / parkingArea.totalSpots) * 100

  const handleViewDetails = () => {
    router.push(`/dashboard/parking/${parkingArea.id}`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-500/20 text-green-400 border-green-500/50"
      case "limited":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50"
      case "full":
        return "bg-red-500/20 text-red-400 border-red-500/50"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/50"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "available":
        return "Available"
      case "limited":
        return "Limited Spaces"
      case "full":
        return "Full"
      default:
        return "Unknown"
    }
  }

  return (
    <motion.div
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      onClick={onSelect}
      className={cn(
        "group relative h-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden",
        isSelected
          ? "border-purple-500 shadow-xl shadow-purple-500/20 ring-1 ring-purple-500/50"
          : "border-gray-700 hover:border-gray-600 hover:shadow-lg"
      )}
    >
      {/* Background Gradient Overlay on Hover */}
      <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="relative p-5 space-y-4 h-full flex flex-col">
        {/* Header - Name & Status */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg font-bold text-white line-clamp-2 leading-tight">
              {parkingArea.name}
            </h3>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "text-xs font-semibold border",
              getStatusColor(parkingArea.status)
            )}
          >
            <Zap className="w-3 h-3 mr-1" />
            {getStatusText(parkingArea.status)}
          </Badge>
        </div>

        {/* Location */}
        <div className="flex items-start gap-2 text-sm text-gray-400">
          <MapPin className="w-4 h-4 mt-0.5 text-purple-400 flex-shrink-0" />
          <span className="line-clamp-2">{parkingArea.address}</span>
        </div>

        {/* Availability Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Availability</span>
            <span className="font-semibold text-white">
              {parkingArea.availableSpots}/{parkingArea.totalSpots}
            </span>
          </div>
          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${availabilityPercent}%` }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className={cn(
                "h-full rounded-full transition-all",
                availabilityPercent > 50
                  ? "bg-gradient-to-r from-green-500 to-green-400"
                  : availabilityPercent > 20
                  ? "bg-gradient-to-r from-yellow-500 to-yellow-400"
                  : "bg-gradient-to-r from-red-500 to-red-400"
              )}
            />
          </div>
        </div>

        {/* Key Info Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Price */}
          <div className="bg-gray-700/40 rounded-lg p-3">
            <p className="text-gray-400 text-xs">Price/Hour</p>
            <p className="text-lg font-bold text-white">₹{parkingArea.price}</p>
          </div>

          {/* Rating */}
          <div className="bg-gray-700/40 rounded-lg p-3">
            <p className="text-gray-400 text-xs">Rating</p>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-lg font-bold text-white">{parkingArea.rating}</span>
            </div>
          </div>

          {/* Distance */}
          <div className="bg-gray-700/40 rounded-lg p-3">
            <p className="text-gray-400 text-xs">Distance</p>
            <div className="flex items-center gap-1">
              <Navigation2 className="w-4 h-4 text-blue-400" />
              <span className="text-lg font-bold text-white">{parkingArea.distance}km</span>
            </div>
          </div>

          {/* Quick Info */}
          <div className="bg-gray-700/40 rounded-lg p-3">
            <p className="text-gray-400 text-xs">Hours</p>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-purple-400" />
              <span className="text-lg font-bold text-white">24/7</span>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="pt-2 mt-auto">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={(e) => {
                e.stopPropagation()
                handleViewDetails()
              }}
              className={cn(
                "w-full font-semibold transition-all duration-300",
                isSelected
                  ? "bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/50"
                  : "bg-gray-700 hover:bg-purple-600 text-white"
              )}
            >
              {isSelected ? "Viewing Details..." : "View Details"}
            </Button>
          </motion.div>
        </div>

        {/* Selection Indicator */}
        {isSelected && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute top-4 right-4"
          >
            <div className="w-3 h-3 bg-purple-500 rounded-full shadow-lg shadow-purple-500/50" />
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

