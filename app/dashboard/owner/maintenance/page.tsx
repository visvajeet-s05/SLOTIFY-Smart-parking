"use client"

import { useState, useEffect } from "react"

export default function OwnerMaintenancePage() {
  const [maintenance, setMaintenance] = useState<any[]>([])
  const [title, setTitle] = useState("")
  const [parkingLotId, setParkingLotId] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")

  const load = async () =>
    setMaintenance(await fetch("/api/owner/maintenance").then(r => r.json()))

  useEffect(() => { load() }, [])

  async function submit() {
    await fetch("/api/owner/maintenance", {
      method: "POST",
      body: JSON.stringify({ title, parkingLotId, startTime, endTime }),
    })
    setTitle("")
    setParkingLotId("")
    setStartTime("")
    setEndTime("")
    load()
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Maintenance Scheduling</h1>

      <div className="admin-card text-left space-y-2">
        <input
          placeholder="Parking Lot ID"
          value={parkingLotId}
          onChange={e => setParkingLotId(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded p-2"
        />
        <input
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded p-2"
        />
        <input
          type="datetime-local"
          placeholder="Start Time"
          value={startTime}
          onChange={e => setStartTime(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded p-2"
        />
        <input
          type="datetime-local"
          placeholder="End Time"
          value={endTime}
          onChange={e => setEndTime(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded p-2"
        />
        <button onClick={submit} className="bg-purple-600 px-4 py-2 rounded">
          Schedule Maintenance
        </button>
      </div>

      {maintenance.map(m => (
        <div key={m.id} className="admin-card text-left">
          <div className="font-medium">{m.title}</div>
          <div>Parking Lot: {m.parkingLotId}</div>
          <div>From: {new Date(m.startTime).toLocaleString()}</div>
          <div>To: {new Date(m.endTime).toLocaleString()}</div>
        </div>
      ))}
    </div>
  )
}
