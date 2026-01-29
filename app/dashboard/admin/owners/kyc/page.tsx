"use client"

import { useEffect, useState } from "react"

export default function AdminOwnerKycPage() {
  const [kycs, setKycs] = useState<any[]>([])

  useEffect(() => {
    fetch("/api/admin/kyc").then(r => r.json()).then(setKycs)
  }, [])

  async function updateStatus(id: string, status: "APPROVED" | "REJECTED") {
    await fetch("/api/admin/kyc", {
      method: "PUT",
      body: JSON.stringify({ id, status }),
    })
    location.reload()
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <h1 className="text-xl font-semibold">Owner KYC Approvals</h1>

      {kycs.map(k => (
        <div key={k.id} className="admin-card flex justify-between">
          <span>{k.owner.user.name}</span>
          <div className="space-x-2">
            <button onClick={() => updateStatus(k.id, "APPROVED")} className="text-green-400">Approve</button>
            <button onClick={() => updateStatus(k.id, "REJECTED")} className="text-red-400">Reject</button>
          </div>
        </div>
      ))}
    </div>
  )
}
