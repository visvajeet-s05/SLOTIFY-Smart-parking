import crypto from 'crypto';

/**
 * SIMULATED BLOCKCHAIN INTEGRATION
 * For academic research and demonstration purposes.
 * Generates an immutable SHA-256 hash representing a Web3 Smart Contract transaction.
 */

export interface TransactionPayload {
  bookingId: string;
  userId: string;
  parkingLotId: string;
  amount: number;
  timestamp: string;
}

export function generateBlockchainTransaction(payload: TransactionPayload): string {
  // Generate a mock Ethereum-style Hex Hash
  const rawString = JSON.stringify(payload) + process.env.BLOCKCHAIN_SALT || 'salt';
  const hash = crypto.createHash('sha256').update(rawString).digest('hex');
  
  // Format as a pseudo-Ethereum address/hash 0x...
  return `0x${hash}`;
}