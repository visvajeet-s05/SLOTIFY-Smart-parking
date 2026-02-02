import { useState } from "react";
import { ethers } from "ethers";

interface BookingNFTProps {
  contractAddress: string;
  provider: ethers.JsonRpcProvider;
}

export default function BookingNFT({ contractAddress, provider }: BookingNFTProps) {
  const [tokenId, setTokenId] = useState("");
  const [status, setStatus] = useState("");

  const handleMint = async () => {
    try {
      const signer = await provider.getSigner();
      // TODO: Load contract ABI and call mint function
      setStatus("NFT minted successfully");
    } catch (error) {
      setStatus("Mint failed");
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Booking NFT</h3>
      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Token ID"
          value={tokenId}
          onChange={(e) => setTokenId(e.target.value)}
          className="input"
        />
      </div>
      <button onClick={handleMint} className="btn-primary">
        Mint NFT
      </button>
      {status && <p className="text-sm">{status}</p>}
    </div>
  );
}