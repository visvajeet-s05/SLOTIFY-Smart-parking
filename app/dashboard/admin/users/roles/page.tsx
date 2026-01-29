"use client"

export default function AdminRolesPage() {
  return (
    <div className="max-w-6xl mx-auto bg-gray-900 border border-gray-800 rounded-lg p-6">
      <h2 className="text-lg font-semibold">Roles & Permissions</h2>
      <p className="text-sm text-gray-400 mb-4">
        Define access levels for admins and staff.
      </p>

      <div className="bg-gray-800/30 p-4 rounded text-sm">
        Role hierarchy configuration (Admin, Moderator, Support)
      </div>
    </div>
  )
}
