"use client"

import { useState, useEffect } from "react"

export default function OwnerIncidentsPage() {
  const [incidents, setIncidents] = useState<any[]>([])
  const [description, setDescription] = useState("")
  const [parkingId, setParkingId] = useState("")

  const load = async () =>
    setIncidents(await fetch("/api/owner/incidents").then(r => r.json()))

  useEffect(() => { load() }, [])

  async function submit() {
    await fetch("/api/owner/incidents", {
      method: "POST",
      body: JSON.stringify({ description, parkingId }),
    })
    setDescription("")
    setParkingId("")
    load()
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Incidents</h1>

      <div className="admin-card text-left space-y-2">
        <input
          placeholder="Parking ID"
          value={parkingId}
          onChange={e => setParkingId(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded p-2"
        />
        <textarea
          placeholder="Describe the issue"
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded p-2"
        />
        <button onClick={submit} className="bg-purple-600 px-4 py-2 rounded">
          Report Incident
        </button>
      </div>

      {incidents.map(i => (
        <div key={i.id} className="admin-card text-left">
          <div>{i.description}</div>
          <div>Status: {i.status}</div>
        </div>
      ))}
    </div>
  )
}
