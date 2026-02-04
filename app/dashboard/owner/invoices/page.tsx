import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export default async function OwnerInvoicesPage() {
  const user = await getCurrentUser()

  const owner = await prisma.ownerprofile.findUnique({
    where: { userId: user.id },
  })

  const invoices = owner
    ? await prisma.ownerinvoice.findMany({
        where: { ownerId: owner.id },
        orderBy: { generatedAt: "desc" },
      })
    : []

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString()}`

  const getMonthName = (month: number) => {
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ]
    return months[month - 1]
  }

  // Calculate summary from latest invoice
  const latestInvoice = invoices[0]
  const summary = latestInvoice ? {
    thisMonth: latestInvoice.grossAmount,
    commission: latestInvoice.platformFee,
    tax: latestInvoice.taxAmount,
    netPayout: latestInvoice.netAmount
  } : {
    thisMonth: 0,
    commission: 0,
    tax: 0,
    netPayout: 0
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Invoices & Tax Reports</h1>
        <p className="text-sm text-gray-400">
          Monthly earnings, platform fees and payouts.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="admin-card">
          <div className="text-xs text-gray-400">This Month</div>
          <div className="text-xl font-semibold">{formatCurrency(summary.thisMonth)}</div>
        </div>

        <div className="admin-card">
          <div className="text-xs text-gray-400">Commission</div>
          <div className="text-xl font-semibold text-red-400">{formatCurrency(summary.commission)}</div>
        </div>

        <div className="admin-card">
          <div className="text-xs text-gray-400">Tax (GST)</div>
          <div className="text-xl font-semibold">{formatCurrency(summary.tax)}</div>
        </div>

        <div className="admin-card">
          <div className="text-xs text-gray-400">Net Payout</div>
          <div className="text-xl font-semibold text-green-400">{formatCurrency(summary.netPayout)}</div>
        </div>
      </div>

      {/* Invoice Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-sm">
        <div className="grid grid-cols-5 gap-3 font-medium text-gray-400 border-b border-gray-700 pb-2">
          <div>Month</div>
          <div>Gross</div>
          <div>Commission</div>
          <div>Tax</div>
          <div>Net</div>
        </div>

        {invoices.length === 0 ? (
          <div className="py-8 text-center text-gray-400">No invoices found</div>
        ) : (
          invoices.map((invoice) => (
            <div key={invoice.id} className="grid grid-cols-5 gap-3 py-3 border-b border-gray-800 last:border-b-0">
              <div>{getMonthName(invoice.month)} {invoice.year}</div>
              <div>{formatCurrency(invoice.grossAmount)}</div>
              <div>{formatCurrency(invoice.platformFee)}</div>
              <div>{formatCurrency(invoice.taxAmount)}</div>
              <div>{formatCurrency(invoice.netAmount)}</div>
            </div>
          ))
        )}
      </div>

      {/* Download */}
      <div className="text-sm text-gray-400">
        📄 PDF download & GST invoice export will be enabled after backend sync.
      </div>
    </div>
  )
}
