"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { StatusBadge } from "./status-badge"
import { formatCurrency } from "@/lib/utils"

interface Booking {
  id: string
  customerName: string
  customerEmail: string
  ownerBusiness: string
  parkingLot: string
  amount: number
  status: string
  startTime: string
  endTime: string
  createdAt: string
}

export function BookingTable() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBookings() {
      try {
        const res = await fetch("/api/admin/bookings")
        if (res.ok) {
          const data = await res.json()
          setBookings(data)
        }
      } catch (error) {
        console.error("Failed to fetch bookings", error)
      } finally {
        setLoading(false)
      }
    }
    fetchBookings()
  }, [])

  if (loading) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (bookings.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center text-gray-400">
        No bookings found.
      </div>
    )
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-800/50 text-gray-400 uppercase text-xs font-semibold">
            <tr>
              <th className="p-4">Booking ID</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Location</th>
              <th className="p-4">Time</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {bookings.map((row) => (
              <tr key={row.id} className="hover:bg-gray-800/30 transition-colors">
                <td className="p-4 font-mono text-xs text-gray-500">{row.id.slice(-6).toUpperCase()}</td>
                <td className="p-4">
                  <div className="font-medium text-white">{row.customerName}</div>
                  <div className="text-gray-500 text-xs">{row.customerEmail}</div>
                </td>
                <td className="p-4">
                  <div className="text-gray-300">{row.parkingLot}</div>
                  <div className="text-gray-500 text-xs">{row.ownerBusiness}</div>
                </td>
                <td className="p-4 text-xs text-gray-400">
                  <div>{new Date(row.startTime).toLocaleDateString()}</div>
                  <div>{new Date(row.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </td>
                <td className="p-4 text-gray-200 font-medium">
                  {formatCurrency(row.amount)}
                </td>
                <td className="p-4">
                  <StatusBadge status={row.status} />
                </td>
                <td className="p-4 text-center">
                  <Link
                    href={`/dashboard/admin/bookings/${row.id}`}
                    className="text-blue-400 hover:text-blue-300 text-xs hover:underline"
                  >
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
