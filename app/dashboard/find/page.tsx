"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import dynamic from "next/dynamic"
import { Search, Filter, MapPin, Clock, Car, Star, TrendingUp, ChevronDown, X, AlertCircle, MapPinIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ParkingAreaCard from "@/components/parking/parking-area-card"
import { useParkingSocket } from "@/hooks/useParkingSocket"

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

interface ParkingArea {
  id: string
  name: string
  address: string
  totalSpots: number
  availableSpots: number
  price: number
  rating: number
  distance: number
  coordinates: [number, number]
  status: "available" | "limited" | "full"
}

export default function FindParkingPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [priceRange, setPriceRange] = useState([0, 50])
  const [selectedParkingArea, setSelectedParkingArea] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<"distance" | "price" | "rating">("distance")
  const [showFilters, setShowFilters] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [filteredAreas, setFilteredAreas] = useState<ParkingArea[]>(parkingAreas as ParkingArea[])

  // Real-time parking updates
  useParkingSocket((data: any) => {
    setFilteredAreas(prevAreas => 
      prevAreas.map(area => {
        if (area.id === data.parkingId) {
          const newAvailableSpots = data.availableSlots
          let newStatus: "available" | "limited" | "full" = "available"
          if (newAvailableSpots === 0) {
            newStatus = "full"
          } else if (newAvailableSpots / area.totalSpots <= 0.2) {
            newStatus = "limited"
          }
          
          return {
            ...area,
            availableSpots: newAvailableSpots,
            status: newStatus,
          }
        }
        return area
      })
    )
  })

  // Filter and sort effect
  useEffect(() => {
    setIsLoading(true)
    
    // Simulate API call delay
    const timer = setTimeout(() => {
      let results = parkingAreas.filter(
        (area) =>
          area.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          area.address.toLowerCase().includes(searchQuery.toLowerCase())
      )

      // Apply price filter
      results = results.filter(
        (area) => area.price >= priceRange[0] && area.price <= priceRange[1]
      )

      // Apply sorting
      results = [...results].sort((a, b) => {
        if (sortBy === "distance") return a.distance - b.distance
        if (sortBy === "price") return a.price - b.price
        if (sortBy === "rating") return b.rating - a.rating
        return 0
      })

      setFilteredAreas(results as ParkingArea[])
      setIsLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, priceRange, sortBy])

  const stats = {
    total: parkingAreas.length,
    available: parkingAreas.filter(a => a.status === "available").length,
    totalSpots: parkingAreas.reduce((sum, a) => sum + a.availableSpots, 0),
    avgRating: (parkingAreas.reduce((sum, a) => sum + a.rating, 0) / parkingAreas.length).toFixed(1),
  }

  const handleParkingSelect = (parkingId: string) => {
    setSelectedParkingArea(parkingId)
    // Store selected parking in session storage for reference
    sessionStorage.setItem("selectedParkingId", parkingId)
  }

  const handleViewDetails = (parkingId: string) => {
    // Navigate to parking details page
    router.push(`/dashboard/parking/${parkingId}`)
  }

  const handleResetFilters = () => {
    setSearchQuery("")
    setPriceRange([0, 50])
    setSortBy("distance")
    setSelectedParkingArea(null)
  }

  const isFiltered = searchQuery || priceRange[0] > 0 || priceRange[1] < 50

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent mb-1">
                🔍 Find Your Parking
              </h1>
              <p className="text-gray-400 text-sm">Search and book the perfect parking spot in Tamil Nadu</p>
            </div>
            <Button
              onClick={() => router.push("/dashboard")}
              variant="outline"
              className="hidden md:flex"
            >
              Back to Dashboard
            </Button>
          </div>
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
          <motion.div 
            whileHover={{ y: -4 }}
            className="bg-gradient-to-br from-blue-900/30 to-blue-800/10 border border-blue-700/30 rounded-lg p-4 backdrop-blur"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-sm font-medium">Total Parking</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <MapPinIcon className="w-8 h-8 text-blue-400/60" />
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -4 }}
            className="bg-gradient-to-br from-green-900/30 to-green-800/10 border border-green-700/30 rounded-lg p-4 backdrop-blur"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 text-sm font-medium">Available</p>
                <p className="text-2xl font-bold text-white">{stats.available}</p>
              </div>
              <Car className="w-8 h-8 text-green-400/60" />
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -4 }}
            className="bg-gradient-to-br from-purple-900/30 to-purple-800/10 border border-purple-700/30 rounded-lg p-4 backdrop-blur"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm font-medium">Total Spaces</p>
                <p className="text-2xl font-bold text-white">{stats.totalSpots}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-400/60" />
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -4 }}
            className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/10 border border-yellow-700/30 rounded-lg p-4 backdrop-blur"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-300 text-sm font-medium">Avg Rating</p>
                <p className="text-2xl font-bold text-white">{stats.avgRating}★</p>
              </div>
              <Star className="w-8 h-8 text-yellow-400/60 fill-yellow-400" />
            </div>
          </motion.div>
        </motion.div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-4"
        >
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search by name or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 h-12 focus:border-purple-500 focus:ring-purple-500"
            />
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row gap-3">
            {/* Sort Dropdown */}
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white md:w-48">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="distance">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Distance
                  </div>
                </SelectItem>
                <SelectItem value="price">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Price
                  </div>
                </SelectItem>
                <SelectItem value="rating">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Rating
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Advanced Filters Popover */}
            <Popover open={showFilters} onOpenChange={setShowFilters}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-2 bg-gray-800/50 border-gray-700 text-white hover:bg-gray-700"
                >
                  <Filter className="w-4 h-4" />
                  Advanced Filters
                  {isFiltered && (
                    <Badge className="ml-2 bg-purple-600">Active</Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="bg-gray-800 border-gray-700 p-6 w-80">
                <div className="space-y-6">
                  {/* Price Range Slider */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="text-sm font-medium text-white">Price Range</label>
                      <span className="text-sm text-purple-400 font-semibold">
                        ₹{priceRange[0]} - ₹{priceRange[1]}/hr
                      </span>
                    </div>
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      min={0}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </div>

                  {/* Filter Info */}
                  <div className="bg-gray-900/50 border border-gray-700 rounded p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-gray-400">
                        {filteredAreas.length} of {parkingAreas.length} results match your filters
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      onClick={handleResetFilters}
                      variant="outline"
                      className="flex-1 bg-gray-900/50 border-gray-600 text-white"
                    >
                      Reset
                    </Button>
                    <Button
                      onClick={() => setShowFilters(false)}
                      className="flex-1 bg-purple-600 hover:bg-purple-700"
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Clear Filters Button */}
            {isFiltered && (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                <Button
                  onClick={handleResetFilters}
                  variant="ghost"
                  className="gap-2 text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                  Clear Filters
                </Button>
              </motion.div>
            )}
          </div>

          {/* Results Info */}
          <div className="text-sm text-gray-400">
            Showing <span className="font-semibold text-white">{filteredAreas.length}</span> of{" "}
            <span className="font-semibold text-white">{parkingAreas.length}</span> parking locations
          </div>
        </motion.div>

        {/* Map Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-gray-800/30 border border-gray-700 rounded-lg overflow-hidden"
        >
          <div className="relative">
            <ParkingMap 
              parkingAreas={filteredAreas}
              selectedId={selectedParkingArea}
              onSelectParkingArea={handleParkingSelect}
            />
            <div className="absolute bottom-4 left-4 bg-gray-900/80 backdrop-blur border border-gray-700 rounded px-3 py-2 text-xs text-gray-300">
              {selectedParkingArea 
                ? `📍 ${filteredAreas.find(p => p.id === selectedParkingArea)?.name}` 
                : "💡 Click on markers to select a parking"
              }
            </div>
          </div>
        </motion.div>

        {/* Results Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 animate-pulse"
                >
                  <div className="h-24 bg-gray-700 rounded mb-4" />
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-3/4" />
                    <div className="h-4 bg-gray-700 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredAreas.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <div className="bg-gray-800/50 border border-gray-700 rounded-full p-6 mb-4">
                <MapPin className="w-12 h-12 text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Parking Found</h3>
              <p className="text-gray-400 mb-6">Try adjusting your search filters or try again later</p>
              <Button
                onClick={handleResetFilters}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Reset Filters & Try Again
              </Button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAreas.map((area, index) => (
                <motion.div
                  key={area.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  onClick={() => handleParkingSelect(area.id)}
                  className="cursor-pointer"
                >
                  <ParkingAreaCard
                    parkingArea={area}
                    isSelected={selectedParkingArea === area.id}
                    onSelect={() => handleViewDetails(area.id)}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-gradient-to-r from-purple-900/20 to-indigo-900/20 border border-purple-700/30 rounded-lg p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-400" />
                Quick Booking
              </h4>
              <p className="text-sm text-gray-400">
                Book your parking spot in seconds with our simple and fast booking process
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-purple-400" />
                Multiple Locations
              </h4>
              <p className="text-sm text-gray-400">
                Find parking across all major cities in Tamil Nadu with real-time availability
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                <Star className="w-5 h-5 text-purple-400" />
                Verified Spots
              </h4>
              <p className="text-sm text-gray-400">
                All parking spots are verified and rated by our community of users
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
