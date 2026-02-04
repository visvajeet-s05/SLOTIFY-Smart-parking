import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export default async function SettlementsPage() {
  const user = await getCurrentUser()

  const settlements = await prisma.ownersettlement.findMany({
    where: { ownerId: user.id },
  })

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString()}`

  const formatDate = (date: Date) => {
    return date.toLocaleDateString()
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Settlement History</h1>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-sm">
        <div className="grid grid-cols-3 gap-3 font-medium text-gray-400 border-b border-gray-700 pb-2">
          <div>Reference</div>
          <div>Amount</div>
          <div>Settled At</div>
        </div>

        {settlements.length === 0 ? (
          <div className="py-8 text-center text-gray-400">No settlements found</div>
        ) : (
          settlements.map((settlement) => (
            <div key={settlement.id} className="grid grid-cols-3 gap-3 py-3 border-b border-gray-800 last:border-b-0">
              <div className="font-mono text-xs">{settlement.referenceId}</div>
              <div>{formatCurrency(settlement.amount)}</div>
              <div>{formatDate(settlement.settledAt)}</div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
