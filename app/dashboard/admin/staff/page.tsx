"use client"

import { useState, useEffect } from 'react'

interface Staff {
  id: string
  name: string
  email: string
  role: string
  status: string
  createdAt: string
  owner: {
    businessName: string
  }
}

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAllStaff()
  }, [])

  const fetchAllStaff = async () => {
    try {
      // This would need an admin API to fetch all staff across owners
      // For now, placeholder
      setStaff([])
    } catch (error) {
      console.error('Error fetching staff:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDisableStaff = async (staffId: string) => {
    // Admin can disable any staff account
    try {
      const response = await fetch(`/api/admin/staff/${staffId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'DISABLED' })
      })

      if (response.ok) {
        fetchAllStaff()
      } else {
        alert('Error disabling staff')
      }
    } catch (error) {
      console.error('Error disabling staff:', error)
      alert('Error disabling staff')
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Staff Management</h1>
        <p className="text-sm text-gray-400">
          View and manage all staff accounts across owners
        </p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-medium mb-4">All Staff Members</h3>

        {loading ? (
          <div className="text-sm text-gray-400">Loading staff...</div>
        ) : staff.length === 0 ? (
          <div className="text-sm text-gray-400">No staff members found</div>
        ) : (
          <div className="space-y-3">
            {staff.map((member) => (
              <div key={member.id} className="flex items-center justify-between bg-gray-800 rounded p-3">
                <div className="flex-1">
                  <div className="font-medium">{member.name}</div>
                  <div className="text-sm text-gray-400">{member.email}</div>
                  <div className="text-sm text-gray-500">Owner: {member.owner.businessName}</div>
                </div>
                <div className="text-sm text-gray-400">
                  Role: {member.role}
                </div>
                <div className={`text-sm ${member.status === 'ACTIVE' ? 'text-green-400' : 'text-red-400'}`}>
                  {member.status}
                </div>
                <button
                  onClick={() => handleDisableStaff(member.id)}
                  className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
                  disabled={member.status === 'DISABLED'}
                >
                  Disable
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
