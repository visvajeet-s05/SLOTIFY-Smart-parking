"use client"

import { useEffect, useState } from "react"

interface OwnerVerification {
  id: string
  ownerId: string
  businessName: string
  documentType: string
  documentUrl: string
  status: string
  createdAt: string
  owner: {
    user: {
      name: string
      email: string
    }
  }
}

export default function AdminOwnersPage() {
  const [verifications, setVerifications] = useState<OwnerVerification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVerifications()
  }, [])

  async function fetchVerifications() {
    const res = await fetch("/api/admin/owners/verifications")
    if (res.ok) {
      const data = await res.json()
      setVerifications(data)
    }
    setLoading(false)
  }

  async function approve(id: string) {
    await fetch(`/api/admin/owners/verifications/${id}/approve`, { method: "POST" })
    fetchVerifications()
  }

  async function reject(id: string) {
    await fetch(`/api/admin/owners/verifications/${id}/reject`, { method: "POST" })
    fetchVerifications()
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Owner Verifications</h1>
      <div className="space-y-4">
        {verifications.map((v) => (
          <div key={v.id} className="bg-gray-800 p-4 rounded">
            <p><strong>{v.owner.user.name}</strong> ({v.owner.user.email})</p>
            <p>Business: {v.businessName}</p>
            <p>Document: {v.documentType}</p>
            <p>Status: {v.status}</p>
            <div className="mt-2 space-x-2">
              {v.status === "PENDING" && (
                <>
                  <button onClick={() => approve(v.id)} className="bg-green-600 px-4 py-2 rounded">Approve</button>
                  <button onClick={() => reject(v.id)} className="bg-red-600 px-4 py-2 rounded">Reject</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
