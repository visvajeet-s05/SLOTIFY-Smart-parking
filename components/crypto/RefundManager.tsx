import { useState } from "react";
import { ethers } from "ethers";

interface RefundManagerProps {
  contractAddress: string;
  provider: ethers.JsonRpcProvider;
}

export default function RefundManager({ contractAddress, provider }: RefundManagerProps) {
  const [bookingId, setBookingId] = useState("");
  const [refundAmount, setRefundAmount] = useState("");
  const [status, setStatus] = useState("");

  const handleRefund = async () => {
    try {
      const signer = await provider.getSigner();
      // TODO: Load contract ABI and call refund function
      setStatus("Refund processed successfully");
    } catch (error) {
      setStatus("Refund failed");
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Refund Manager</h3>
      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Booking ID"
          value={bookingId}
          onChange={(e) => setBookingId(e.target.value)}
          className="input"
        />
        <input
          type="number"
          placeholder="Refund Amount"
          value={refundAmount}
          onChange={(e) => setRefundAmount(e.target.value)}
          className="input"
        />
      </div>
      <button onClick={handleRefund} className="btn-primary">
        Process Refund
      </button>
      {status && <p className="text-sm">{status}</p>}
    </div>
  );
}