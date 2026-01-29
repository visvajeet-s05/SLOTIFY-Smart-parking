"use client"

import Link from "next/link"
import { StatusBadge } from "./status-badge"

export function BookingTable() {
  const rows = [
    {
      id: "BK-1001",
      customer: "customer@test.com",
      owner: "City Mall Parking",
      amount: "₹120",
      status: "active",
    },
  ]

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-800 text-gray-300">
          <tr>
            <th className="p-3 text-left">Booking ID</th>
            <th className="p-3 text-left">Customer</th>
            <th className="p-3 text-left">Owner</th>
            <th className="p-3">Amount</th>
            <th className="p-3">Status</th>
            <th className="p-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.id} className="border-t border-gray-800">
              <td className="p-3">{row.id}</td>
              <td className="p-3">{row.customer}</td>
              <td className="p-3">{row.owner}</td>
              <td className="p-3 text-center">{row.amount}</td>
              <td className="p-3 text-center">
                <StatusBadge status={row.status} />
              </td>
              <td className="p-3 text-center">
                <Link
                  href={`/dashboard/admin/bookings/${row.id}`}
                  className="text-purple-400 hover:underline"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
