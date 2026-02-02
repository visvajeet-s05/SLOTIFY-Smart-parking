import prisma from "@/lib/prisma"
import { getProvider, getChainForRegion } from "@/lib/blockchain";
import RefundManager from "@/components/crypto/RefundManager";
import BookingNFT from "@/components/crypto/BookingNFT";

export default async function BlockchainAdmin() {
  const txs = await prisma.blockchainPayment.findMany({
    orderBy: { createdAt: "desc" }
  })

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Blockchain Payments</h1>

      <table className="w-full bg-gray-900 rounded-xl">
        <thead>
          <tr className="text-gray-400 text-left">
            <th className="p-4">Payer</th>
            <th className="p-4">Owner</th>
            <th className="p-4">Amount</th>
            <th className="p-4">Token</th>
            <th className="p-4">Date</th>
          </tr>
        </thead>
        <tbody>
          {txs.map(tx => (
            <tr key={tx.id} className="border-t border-gray-800">
              <td className="p-4">{tx.payer.slice(0, 8)}...</td>
              <td className="p-4">{tx.owner.slice(0, 8)}...</td>
              <td className="p-4">{tx.amount}</td>
              <td className="p-4">{tx.token}</td>
              <td className="p-4">{new Date(tx.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}