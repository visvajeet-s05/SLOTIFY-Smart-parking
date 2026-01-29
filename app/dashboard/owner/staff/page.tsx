"use client"

import { useEffect, useState } from "react"

export default function OwnerStaffPage() {
  const [staff, setStaff] = useState<any[]>([])
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("SCANNER")

  const load = async () =>
    fetch("/api/owner/staff").then(r => r.json()).then(setStaff)

  useEffect(() => {
    load()
  }, [])

  async function addStaff() {
    await fetch("/api/owner/staff", {
      method: "POST",
      body: JSON.stringify({ name, email, role }),
    })
    setName("")
    setEmail("")
    load()
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <h1 className="text-2xl font-semibold">Staff Management</h1>

      <div className="admin-card text-left space-y-2">
        <input
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 p-2 rounded"
        />
        <input
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 p-2 rounded"
        />
        <select
          value={role}
          onChange={e => setRole(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 p-2 rounded"
        >
          <option value="SCANNER">Scanner</option>
          <option value="MANAGER">Manager</option>
        </select>

        <button
          onClick={addStaff}
          className="bg-purple-600 px-4 py-2 rounded"
        >
          Add Staff
        </button>
      </div>

      {staff.map(s => (
        <div key={s.id} className="admin-card text-left">
          <div className="flex justify-between">
            <span>{s.name}</span>
            <span className="text-xs text-gray-400">{s.role}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
