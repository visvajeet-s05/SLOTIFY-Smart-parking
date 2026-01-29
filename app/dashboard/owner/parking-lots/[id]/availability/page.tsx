"use client"

import { useState } from "react"
import { Calendar, Plus, Trash2 } from "lucide-react"

type BlockedPeriod = {
  id: number
  startDate: string
  endDate: string
  reason: string
}

export default function OwnerAvailabilityPage() {
  const [blocks, setBlocks] = useState<BlockedPeriod[]>([
    {
      id: 1,
      startDate: "2026-02-10",
      endDate: "2026-02-12",
      reason: "Maintenance",
    },
  ])

  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [reason, setReason] = useState("")

  const addBlock = () => {
    if (!startDate || !endDate) return

    setBlocks([
      ...blocks,
      {
        id: Date.now(),
        startDate,
        endDate,
        reason: reason || "Unavailable",
      },
    ])

    setStartDate("")
    setEndDate("")
    setReason("")
  }

  const removeBlock = (id: number) => {
    setBlocks(blocks.filter(b => b.id !== id))
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Availability Calendar</h1>
        <p className="text-sm text-gray-400">
          Block dates when parking is unavailable
        </p>
      </div>

      {/* Add Block */}
      <div className="admin-card space-y-4">
        <h3 className="font-medium flex items-center gap-2">
          <Calendar size={18} className="text-purple-400" />
          Block Availability
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
          />

          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
          />

          <input
            placeholder="Reason (Maintenance, Event...)"
            value={reason}
            onChange={e => setReason(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
          />

          <button
            onClick={addBlock}
            className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm"
          >
            <Plus size={16} />
            Block
          </button>
        </div>
      </div>

      {/* Blocked Periods Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        <div className="px-4 py-3 bg-gray-800 font-medium">
          Blocked Dates
        </div>

        <table className="w-full text-sm">
          <thead className="bg-gray-900 text-gray-400">
            <tr>
              <th className="px-4 py-3 text-left">From</th>
              <th className="px-4 py-3 text-left">To</th>
              <th className="px-4 py-3 text-left">Reason</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            {blocks.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-6 text-center text-gray-500"
                >
                  No blocked periods
                </td>
              </tr>
            )}

            {blocks.map(block => (
              <tr key={block.id} className="border-t border-gray-800">
                <td className="px-4 py-3">{block.startDate}</td>
                <td className="px-4 py-3">{block.endDate}</td>
                <td className="px-4 py-3">{block.reason}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => removeBlock(block.id)}
                    className="text-red-400 hover:text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Info */}
      <div className="text-xs text-gray-500">
        Blocked dates will automatically disable customer bookings.
      </div>
    </div>
  )
}
