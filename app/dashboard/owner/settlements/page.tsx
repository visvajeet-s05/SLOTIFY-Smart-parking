import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export default async function SettlementsPage() {
  const user = await getCurrentUser()

  const settlements = await prisma.settlement.findMany({
    where: { ownerId: user.id },
    include: { invoice: true },
  })

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString()}`

  const getMonthName = (month: number) => {
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ]
    return months[month - 1]
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString()
  }

  const getStatusColor = (paidAt: Date | null) => {
    return paidAt ? "text-green-400" : "text-yellow-400"
  }

  const getStatusText = (paidAt: Date | null) => {
    return paidAt ? "Paid" : "Pending"
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Settlement History</h1>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-sm">
        <div className="grid grid-cols-5 gap-3 font-medium text-gray-400 border-b border-gray-700 pb-2">
          <div>Invoice</div>
          <div>Amount</div>
          <div>Status</div>
          <div>Paid At</div>
          <div>Created</div>
        </div>

        {settlements.length === 0 ? (
          <div className="py-8 text-center text-gray-400">No settlements found</div>
        ) : (
          settlements.map((settlement) => (
            <div key={settlement.id} className="grid grid-cols-5 gap-3 py-3 border-b border-gray-800 last:border-b-0">
              <div>{getMonthName(settlement.invoice.month)} {settlement.invoice.year}</div>
              <div>{formatCurrency(settlement.amount)}</div>
              <div className={getStatusColor(settlement.paidAt)}>{getStatusText(settlement.paidAt)}</div>
              <div>{settlement.paidAt ? formatDate(settlement.paidAt) : "-"}</div>
              <div>{formatDate(settlement.createdAt)}</div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
