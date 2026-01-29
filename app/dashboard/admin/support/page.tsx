"use client"

import { useEffect, useState } from "react"

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<any[]>([])

  useEffect(() => {
    fetch("/api/admin/support")
      .then(res => res.json())
      .then(setTickets)
  }, [])

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Owner Support Tickets</h1>

      {tickets.map(t => (
        <div key={t.id} className="admin-card text-left">
          <div className="flex justify-between">
            <span>{t.subject}</span>
            <span className="text-xs">{t.status}</span>
          </div>
          <p className="text-sm text-gray-400">{t.message}</p>
        </div>
      ))}
    </div>
  )
}
