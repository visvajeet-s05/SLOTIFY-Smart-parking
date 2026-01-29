"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Calendar, MapPin, Clock, Car, DollarSign, Eye, Trash2, Download, Share2, AlertCircle, X, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface Booking {
  id: string
  bookingId: string
  parkingLocation: string
  slotId: string
  bookingDate: string
  bookingTime: string
  duration: number
  licensePlate: string
  vehicleModel: string
  amount: number
  paymentMethod: "card" | "upi" | "wallet"
  status: "upcoming" | "active" | "completed" | "cancelled"
  createdAt: string
  checkInTime?: string
  checkOutTime?: string
}

// Sample bookings data
const sampleBookings: Booking[] = [
  {
    id: "1",
    bookingId: "BK-001-2025",
    parkingLocation: "Marina Beach Parking",
    slotId: "A5",
    bookingDate: "2025-12-12",
    bookingTime: "10:00",
    duration: 2,
    licensePlate: "TN-01-AB-1234",
    vehicleModel: "Honda City",
    amount: 115,
    paymentMethod: "card",
    status: "upcoming",
    createdAt: "2025-12-11",
  },
  {
    id: "2",
    bookingId: "BK-002-2025",
    parkingLocation: "Chennai Central Parking",
    slotId: "C8",
    bookingDate: "2025-12-11",
    bookingTime: "14:30",
    duration: 3,
    licensePlate: "TN-02-CD-5678",
    vehicleModel: "Maruti Swift",
    amount: 150,
    paymentMethod: "upi",
    status: "active",
    createdAt: "2025-12-10",
    checkInTime: "14:28",
  },
  {
    id: "3",
    bookingId: "BK-003-2025",
    parkingLocation: "Anna Nagar Tower Park",
    slotId: "B3",
    bookingDate: "2025-12-10",
    bookingTime: "09:00",
    duration: 4,
    licensePlate: "TN-03-EF-9012",
    vehicleModel: "Hyundai i20",
    amount: 160,
    paymentMethod: "wallet",
    status: "completed",
    createdAt: "2025-12-09",
    checkInTime: "09:05",
    checkOutTime: "13:02",
  },
  {
    id: "4",
    bookingId: "BK-004-2025",
    parkingLocation: "T Nagar Pondy Bazaar",
    slotId: "D2",
    bookingDate: "2025-12-08",
    bookingTime: "11:00",
    duration: 2,
    licensePlate: "TN-01-AB-1234",
    vehicleModel: "Honda City",
    amount: 115,
    paymentMethod: "card",
    status: "cancelled",
    createdAt: "2025-12-08",
  },
  {
    id: "5",
    bookingId: "BK-005-2025",
    parkingLocation: "Coimbatore Gandhipuram",
    slotId: "A12",
    bookingDate: "2025-12-15",
    bookingTime: "15:00",
    duration: 1,
    licensePlate: "TN-04-GH-3456",
    vehicleModel: "Tata Nexon",
    amount: 45,
    paymentMethod: "upi",
    status: "upcoming",
    createdAt: "2025-12-11",
  },
  {
    id: "6",
    bookingId: "BK-006-2025",
    parkingLocation: "Marina Beach Parking",
    slotId: "B7",
    bookingDate: "2025-12-09",
    bookingTime: "12:30",
    duration: 2,
    licensePlate: "TN-05-IJ-7890",
    vehicleModel: "Toyota Fortuner",
    amount: 50,
    paymentMethod: "wallet",
    status: "completed",
    createdAt: "2025-12-08",
    checkInTime: "12:32",
    checkOutTime: "14:45",
  },
]

export default function BookingsPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>(sampleBookings)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [bookingToDelete, setBookingToDelete] = useState<string | null>(null)

  // Filter bookings
  const filteredBookings = bookings.filter(
    (booking) => statusFilter === "all" || booking.status === statusFilter
  )

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30"
      case "active":
        return "bg-green-500/20 text-green-300 border-green-500/30"
      case "completed":
        return "bg-gray-500/20 text-gray-300 border-gray-500/30"
      case "cancelled":
        return "bg-red-500/20 text-red-300 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-300"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "upcoming":
        return "⏳ Upcoming"
      case "active":
        return "🟢 Active"
      case "completed":
        return "✓ Completed"
      case "cancelled":
        return "✗ Cancelled"
      default:
        return status
    }
  }

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking)
    setShowDetailsModal(true)
  }

  const handleDeleteClick = (bookingId: string) => {
    setBookingToDelete(bookingId)
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = () => {
    if (bookingToDelete) {
      setBookings(bookings.filter(b => b.id !== bookingToDelete))
      setShowDeleteModal(false)
      setBookingToDelete(null)
    }
  }

  const handleDownloadReceipt = (booking: Booking) => {
    // TODO: Implement PDF download
    alert(`Downloading receipt for booking ${booking.bookingId}`)
  }

  const handleShareBooking = (booking: Booking) => {
    // TODO: Implement share functionality
    const shareText = `I booked a parking at ${booking.parkingLocation} for ${booking.duration} hour(s). Booking ID: ${booking.bookingId}`
    navigator.clipboard.writeText(shareText)
    alert("Booking details copied to clipboard!")
  }

  const stats = {
    total: bookings.length,
    upcoming: bookings.filter(b => b.status === "upcoming").length,
    active: bookings.filter(b => b.status === "active").length,
    completed: bookings.filter(b => b.status === "completed").length,
    cancelled: bookings.filter(b => b.status === "cancelled").length,
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent mb-1">
                📋 My Bookings
              </h1>
              <p className="text-gray-400 text-sm">Manage and track all your parking bookings</p>
            </div>
            <Button
              onClick={() => router.push("/dashboard/find")}
              className="bg-purple-600 hover:bg-purple-700"
            >
              + New Booking
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="px-4 max-w-7xl mx-auto py-6 space-y-6">
        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-4"
        >
          <motion.div 
            whileHover={{ y: -4 }}
            className="bg-gradient-to-br from-blue-900/30 to-blue-800/10 border border-blue-700/30 rounded-lg p-4 backdrop-blur"
          >
            <p className="text-blue-300 text-sm font-medium mb-1">Total</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -4 }}
            className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/10 border border-yellow-700/30 rounded-lg p-4 backdrop-blur"
          >
            <p className="text-yellow-300 text-sm font-medium mb-1">Upcoming</p>
            <p className="text-2xl font-bold text-white">{stats.upcoming}</p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -4 }}
            className="bg-gradient-to-br from-green-900/30 to-green-800/10 border border-green-700/30 rounded-lg p-4 backdrop-blur"
          >
            <p className="text-green-300 text-sm font-medium mb-1">Active</p>
            <p className="text-2xl font-bold text-white">{stats.active}</p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -4 }}
            className="bg-gradient-to-br from-purple-900/30 to-purple-800/10 border border-purple-700/30 rounded-lg p-4 backdrop-blur"
          >
            <p className="text-purple-300 text-sm font-medium mb-1">Completed</p>
            <p className="text-2xl font-bold text-white">{stats.completed}</p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -4 }}
            className="bg-gradient-to-br from-red-900/30 to-red-800/10 border border-red-700/30 rounded-lg p-4 backdrop-blur"
          >
            <p className="text-red-300 text-sm font-medium mb-1">Cancelled</p>
            <p className="text-2xl font-bold text-white">{stats.cancelled}</p>
          </motion.div>
        </motion.div>

        {/* Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col md:flex-row gap-4 items-start md:items-center"
        >
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Filter by Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white w-full md:w-48">
                <SelectValue placeholder="Select status..." />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="all">All Bookings</SelectItem>
                <SelectItem value="upcoming">⏳ Upcoming</SelectItem>
                <SelectItem value="active">🟢 Active</SelectItem>
                <SelectItem value="completed">✓ Completed</SelectItem>
                <SelectItem value="cancelled">✗ Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="text-sm text-gray-400 md:mt-6">
            Showing <span className="font-semibold text-white">{filteredBookings.length}</span> of{" "}
            <span className="font-semibold text-white">{bookings.length}</span> bookings
          </div>
        </motion.div>

        {/* Bookings Table/List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {filteredBookings.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-16 text-center bg-gray-800/30 border border-gray-700 rounded-lg"
            >
              <div className="bg-gray-800/50 border border-gray-700 rounded-full p-6 mb-4">
                <Calendar className="w-12 h-12 text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Bookings Found</h3>
              <p className="text-gray-400 mb-6">You don't have any {statusFilter !== "all" ? statusFilter : ""} bookings yet.</p>
              <Button
                onClick={() => router.push("/dashboard/find")}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Book a Parking Now
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {/* Desktop Table View */}
              <div className="hidden md:block bg-gray-800/30 border border-gray-700 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-800/50 border-b border-gray-700">
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Booking ID</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Location</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Date & Time</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Duration</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Amount</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.map((booking, index) => (
                        <motion.tr
                          key={booking.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="border-b border-gray-700/50 hover:bg-gray-800/50 transition"
                        >
                          <td className="px-6 py-4">
                            <span className="font-mono text-sm text-purple-400">{booking.bookingId}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-white">{booking.parkingLocation}</p>
                              <p className="text-xs text-gray-400">Slot {booking.slotId}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <p className="text-white">{new Date(booking.bookingDate).toLocaleDateString()}</p>
                              <p className="text-xs text-gray-400">{booking.bookingTime}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-white">{booking.duration}h</td>
                          <td className="px-6 py-4 text-sm font-semibold text-green-400">₹{booking.amount}</td>
                          <td className="px-6 py-4">
                            <Badge className={cn("border", getStatusColor(booking.status))}>
                              {getStatusLabel(booking.status)}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleViewDetails(booking)}
                                className="p-2 hover:bg-gray-700 rounded-lg transition text-gray-400 hover:text-white"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {booking.status === "upcoming" && (
                                <button
                                  onClick={() => handleDeleteClick(booking.id)}
                                  className="p-2 hover:bg-red-700/30 rounded-lg transition text-gray-400 hover:text-red-400"
                                  title="Cancel Booking"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {filteredBookings.map((booking, index) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="bg-gray-800/30 border border-gray-700 rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-mono text-sm text-purple-400">{booking.bookingId}</p>
                        <p className="font-medium text-white mt-1">{booking.parkingLocation}</p>
                      </div>
                      <Badge className={cn("border", getStatusColor(booking.status))}>
                        {getStatusLabel(booking.status)}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-300">
                        <Calendar className="w-4 h-4 text-purple-400" />
                        {new Date(booking.bookingDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <Clock className="w-4 h-4 text-purple-400" />
                        {booking.bookingTime}
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <MapPin className="w-4 h-4 text-purple-400" />
                        Slot {booking.slotId}
                      </div>
                      <div className="flex items-center gap-2 text-green-400 font-semibold">
                        <DollarSign className="w-4 h-4" />
                        ₹{booking.amount}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-gray-700">
                      <button
                        onClick={() => handleViewDetails(booking)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-purple-600/20 hover:bg-purple-600/30 rounded-lg transition text-purple-300 text-sm font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        Details
                      </button>
                      {booking.status === "upcoming" && (
                        <button
                          onClick={() => handleDeleteClick(booking.id)}
                          className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-600/20 hover:bg-red-600/30 rounded-lg transition text-red-300 text-sm font-medium"
                        >
                          <Trash2 className="w-4 h-4" />
                          Cancel
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-xl p-4">
            <DialogHeader className="p-0 mb-2">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <DialogTitle className="text-lg font-semibold">Booking Details</DialogTitle>
                  <DialogDescription className="text-sm text-gray-400">Compact view of your booking</DialogDescription>
                </div>
                {selectedBooking && (
                  <div className="text-right">
                    <p className="font-mono text-sm text-purple-300">{selectedBooking.bookingId}</p>
                    <Badge className={cn("mt-1 text-xs px-2 py-1 rounded", getStatusColor(selectedBooking.status))}>
                      {getStatusLabel(selectedBooking.status)}
                    </Badge>
                  </div>
                )}
              </div>
            </DialogHeader>

            {selectedBooking && (
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400">Location</span>
                    <span className="font-medium text-white">{selectedBooking.parkingLocation}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-xs text-gray-400">Slot</span>
                    <span className="font-medium text-white">{selectedBooking.slotId}</span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <span className="text-xs text-gray-400">Date</span>
                    <div className="font-medium text-white">{new Date(selectedBooking.bookingDate).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400">Time</span>
                    <div className="font-medium text-white">{selectedBooking.bookingTime}</div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400">Duration</span>
                    <div className="font-medium text-white">{selectedBooking.duration}h</div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400">Amount</span>
                    <div className="font-semibold text-green-400">₹{selectedBooking.amount}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs text-gray-400">License Plate</span>
                    <div className="font-mono text-white">{selectedBooking.licensePlate}</div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400">Vehicle</span>
                    <div className="font-medium text-white">{selectedBooking.vehicleModel}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs text-gray-400">Payment</span>
                    <div className="font-medium text-white capitalize">{selectedBooking.paymentMethod}</div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400">Created</span>
                    <div className="font-medium text-white">{selectedBooking.createdAt}</div>
                  </div>
                </div>

                {(selectedBooking.checkInTime || selectedBooking.checkOutTime) && (
                  <div className="grid grid-cols-2 gap-3">
                    {selectedBooking.checkInTime && (
                      <div>
                        <span className="text-xs text-gray-400">Check-in</span>
                        <div className="font-medium text-white">{selectedBooking.checkInTime}</div>
                      </div>
                    )}
                    {selectedBooking.checkOutTime && (
                      <div>
                        <span className="text-xs text-gray-400">Check-out</span>
                        <div className="font-medium text-white">{selectedBooking.checkOutTime}</div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <Button
                    onClick={() => handleDownloadReceipt(selectedBooking)}
                    variant="outline"
                    className="text-xs px-3 py-1 bg-gray-800/50 border-gray-600 text-white hover:bg-gray-700"
                  >
                    <Download className="w-4 h-4" />
                    <span className="ml-2">Receipt</span>
                  </Button>
                  <Button
                    onClick={() => handleShareBooking(selectedBooking)}
                    variant="outline"
                    className="text-xs px-3 py-1 bg-gray-800/50 border-gray-600 text-white hover:bg-gray-700"
                  >
                    <Share2 className="w-4 h-4" />
                    <span className="ml-2">Share</span>
                  </Button>
                  <div className="flex-1" />
                  <Button
                    onClick={() => setShowDetailsModal(false)}
                    className="text-xs px-3 py-1 bg-purple-600 hover:bg-purple-700"
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              Cancel Booking?
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to cancel this booking? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => setShowDeleteModal(false)}
              variant="outline"
              className="flex-1 bg-gray-800/50 border-gray-600 text-white hover:bg-gray-700"
            >
              Keep Booking
            </Button>
            <Button
              onClick={handleConfirmDelete}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              Cancel Booking
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
