export default function OwnerVerificationAdminPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Owner Verifications</h1>

      <div className="admin-card">
        Owner A — Document
        <div className="mt-2 flex gap-2">
          <button className="btn-success">Approve</button>
          <button className="btn-danger">Reject</button>
        </div>
      </div>
    </div>
  )
}
