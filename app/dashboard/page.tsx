"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import dynamic from "next/dynamic"
import { Search, Filter, MapPin, Clock, Car, Star, TrendingUp } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import ParkingAreaCard from "@/components/parking/parking-area-card"

// Dynamically import the map to prevent SSR issues
const ParkingMap = dynamic(() => import("@/components/map/parking-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-gray-800 rounded-lg animate-pulse border border-gray-700" />
  ),
})

// 🚗 Parking Data (Tamil Nadu, 12 locations)
const parkingAreas = [
  { id: "1", name: "Chennai Central Parking Complex", address: "Near Chennai Central Railway Station, Chennai", totalSpots: 120, availableSpots: 45, price: 30, rating: 4.5, distance: 0.8, coordinates: [13.0827, 80.2707], status: "available" },
  { id: "2", name: "Coimbatore Gandhipuram Parking", address: "100 Feet Road, Gandhipuram, Coimbatore", totalSpots: 200, availableSpots: 12, price: 40, rating: 4.2, distance: 1.2, coordinates: [11.0168, 76.9558], status: "limited" },
  { id: "3", name: "Madurai Meenakshi Temple Parking", address: "Near Meenakshi Amman Temple, Madurai", totalSpots: 80, availableSpots: 0, price: 25, rating: 3.8, distance: 1.5, coordinates: [9.9252, 78.1198], status: "full" },
  { id: "4", name: "Marina Beach Parking", address: "Marina Beach Road, Chennai", totalSpots: 300, availableSpots: 150, price: 20, rating: 4.7, distance: 2.1, coordinates: [13.05, 80.2824], status: "available" },
  { id: "5", name: "Anna Nagar Tower Park Parking", address: "Anna Nagar, Chennai", totalSpots: 100, availableSpots: 60, price: 35, rating: 4.3, distance: 3.0, coordinates: [13.0878, 80.2131], status: "available" },
  { id: "6", name: "T Nagar Pondy Bazaar Parking", address: "T Nagar, Chennai", totalSpots: 150, availableSpots: 20, price: 50, rating: 4.1, distance: 2.5, coordinates: [13.0413, 80.2337], status: "limited" },
  { id: "7", name: "Erode Central Parking", address: "Near Erode Central, Erode", totalSpots: 90, availableSpots: 30, price: 25, rating: 4.0, distance: 1.0, coordinates: [11.3410, 77.7172], status: "available" },
  { id: "8", name: "Vellore Katpadi Parking", address: "Near Vellore Katpadi Railway Station", totalSpots: 70, availableSpots: 15, price: 20, rating: 3.9, distance: 1.3, coordinates: [12.9941, 79.1553], status: "limited" },
  { id: "9", name: "Trichy Rockfort Parking", address: "Near Rockfort Temple, Trichy", totalSpots: 120, availableSpots: 50, price: 30, rating: 4.2, distance: 1.6, coordinates: [10.7905, 78.7047], status: "available" },
  { id: "10", name: "Ooty Botanical Garden Parking", address: "Near Botanical Garden, Ooty", totalSpots: 80, availableSpots: 40, price: 35, rating: 4.5, distance: 2.8, coordinates: [11.4064, 76.6950], status: "available" },
  { id: "11", name: "Salem Town Parking", address: "Near Salem Railway Station, Salem", totalSpots: 90, availableSpots: 30, price: 25, rating: 4.1, distance: 1.4, coordinates: [11.6643, 78.1460], status: "available" },
  { id: "12", name: "Kanyakumari Beach Parking", address: "Near Kanyakumari Beach, Kanyakumari", totalSpots: 50, availableSpots: 20, price: 20, rating: 4.0, distance: 3.5, coordinates: [8.0883, 77.5385], status: "available" },
]

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [priceRange, setPriceRange] = useState([0, 50])
  const [selectedParkingArea, setSelectedParkingArea] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<"distance" | "price" | "rating">("distance")

  // Filter logic
  let filteredAreas = parkingAreas.filter(
    (area) =>
      area.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      area.address.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Apply price filter
  filteredAreas = filteredAreas.filter(
    (area) => area.price >= priceRange[0] && area.price <= priceRange[1]
  )

  // Apply sorting
  filteredAreas = [...filteredAreas].sort((a, b) => {
    if (sortBy === "distance") return a.distance - b.distance
    if (sortBy === "price") return a.price - b.price
    if (sortBy === "rating") return b.rating - a.rating
    return 0
  })

  const stats = {
    total: parkingAreas.length,
    available: parkingAreas.filter(a => a.status === "available").length,
    totalSpots: parkingAreas.reduce((sum, a) => sum + a.availableSpots, 0),
    avgRating: (parkingAreas.reduce((sum, a) => sum + a.rating, 0) / parkingAreas.length).toFixed(1),
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white pb-12">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-900/50 backdrop-blur-md border-b border-gray-800 sticky top-0 z-20 py-4"
      >
        <div className="px-4 max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent mb-2">
            Find Your Parking
          </h1>
          <p className="text-gray-400">Search and book the perfect parking spot in Tamil Nadu</p>
        </div>
      </motion.div>

      <div className="px-4 max-w-7xl mx-auto py-6 space-y-6">
        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Parking</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <Car className="h-8 w-8 text-purple-400 opacity-50" />
            </div>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Available</p>
                <p className="text-2xl font-bold text-green-400">{stats.available}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-400 opacity-50" />
            </div>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Spaces</p>
                <p className="text-2xl font-bold text-blue-400">{stats.totalSpots}</p>
              </div>
              <MapPin className="h-8 w-8 text-blue-400 opacity-50" />
            </div>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Avg Rating</p>
                <p className="text-2xl font-bold text-yellow-400">{stats.avgRating}★</p>
              </div>
              <Star className="h-8 w-8 text-yellow-400 opacity-50 fill-current" />
            </div>
          </div>
        </motion.div>

        {/* Search & Filters */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-4 space-y-4"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search parking areas or locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500"
              />
            </div>

            {/* Price Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button className="bg-gray-700 hover:bg-gray-600 border-gray-600 border">
                  <Filter className="mr-2 h-4 w-4" />
                  Price: ₹{priceRange[0]} - ₹{priceRange[1]}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 bg-gray-800 border-gray-700">
                <div className="space-y-4">
                  <h4 className="font-semibold text-white">Price Range (₹/hr)</h4>
                  <Slider
                    defaultValue={[0, 50]}
                    max={50}
                    step={1}
                    value={priceRange}
                    onValueChange={setPriceRange}
                    className="py-2"
                  />
                  <div className="flex justify-between text-sm text-gray-300">
                    <span>₹{priceRange[0]}</span>
                    <span>₹{priceRange[1]}</span>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
            >
              <option value="distance">Sort by Distance</option>
              <option value="price">Sort by Price</option>
              <option value="rating">Sort by Rating</option>
            </select>
          </div>

          <div className="text-sm text-gray-400">
            Found <span className="text-purple-400 font-semibold">{filteredAreas.length}</span> parking areas
          </div>
        </motion.div>

        {/* Map Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-gray-800/30 border border-gray-700 rounded-xl overflow-hidden h-[400px]"
        >
          <ParkingMap
            parkingAreas={filteredAreas}
            selectedId={selectedParkingArea}
            onSelectParkingArea={setSelectedParkingArea}
          />
        </motion.div>

        {/* Parking Areas Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-white mb-6">
            {filteredAreas.length === 0 ? "No Parking Areas Found" : `Available Parking Areas (${filteredAreas.length})`}
          </h2>

          {filteredAreas.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-4">No parking areas match your criteria</p>
              <Button
                onClick={() => {
                  setSearchQuery("")
                  setPriceRange([0, 50])
                }}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Reset Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAreas.map((area, index) => (
                <motion.div
                  key={area.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <ParkingAreaCard
                    parkingArea={area}
                    isSelected={selectedParkingArea === area.id}
                    onSelect={() => setSelectedParkingArea(area.id)}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
