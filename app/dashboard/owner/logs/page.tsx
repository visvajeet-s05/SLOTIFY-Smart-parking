"use client"
import { useEffect, useState } from "react"

export default function OwnerLogsPage() {
  const [logs, setLogs] = useState<any[]>([])

  useEffect(() => {
    fetch("/api/owner/logs")
      .then(res => res.json())
      .then(setLogs)
  }, [])

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Entry / Exit Logs</h1>

      {logs.map(log => (
        <div key={log.id} className="admin-card text-sm text-left">
          {log.type} • {log.vehicleNo} • {log.slotNo}
        </div>
      ))}
    </div>
  )
}
