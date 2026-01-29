"use client"

import Link from "next/link"

export default function AdminUsersPage() {
  return (
    <div className="max-w-6xl mx-auto bg-gray-900 border border-gray-800 rounded-lg p-6">
      <h1 className="text-xl font-semibold mb-1">User Management</h1>
      <p className="text-sm text-gray-400 mb-6">
        Manage customers, parking owners, and access permissions.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/dashboard/admin/users/customers" className="admin-card">
          Customers
        </Link>

        <Link href="/dashboard/admin/users/owners" className="admin-card">
          Parking Owners
        </Link>

        <Link href="/dashboard/admin/users/verification" className="admin-card">
          Verification Queue
        </Link>

        <Link href="/dashboard/admin/users/roles" className="admin-card">
          Roles & Permissions
        </Link>
      </div>
    </div>
  )
}
