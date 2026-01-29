"use client"

import { Button } from "@/components/ui/button"

export default function AdminBookingDetailPage({
  params,
}: {
  params: { bookingId: string }
}) {
  return (
    <div className="max-w-4xl mx-auto bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-4">
      <h2 className="text-lg font-semibold">
        Booking: {params.bookingId}
      </h2>

      <div className="text-sm text-gray-400 space-y-1">
        <div>Customer: customer@test.com</div>
        <div>Owner: City Mall Parking</div>
        <div>Status: ACTIVE</div>
        <div>Amount: ₹120</div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button variant="destructive">Force Cancel</Button>
        <Button variant="outline">Mark Completed</Button>
        <Button variant="secondary">Request Refund</Button>
      </div>
    </div>
  )
}
