"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function BookingFilters() {
  return (
    <div className="flex flex-wrap gap-3 bg-gray-900 border border-gray-800 p-4 rounded-lg">
      <Input placeholder="Search booking ID / email" className="w-56" />
      <Input type="date" />
      <select className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm">
        <option>Status</option>
        <option>Active</option>
        <option>Upcoming</option>
        <option>Completed</option>
        <option>Cancelled</option>
      </select>

      <Button size="sm">Apply</Button>
      <Button size="sm" variant="outline">Reset</Button>
    </div>
  )
}
