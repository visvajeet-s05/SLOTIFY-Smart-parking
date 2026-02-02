import { ethers } from 'ethers';

const POLYGON_RPC_URL = process.env.POLYGON_RPC_URL;
const SLOTIFY_WALLET = process.env.SLOTIFY_WALLET;
const SLOTIFY_PRIVATE_KEY = process.env.SLOTIFY_PRIVATE_KEY;

const USDC_ADDRESS = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'; // USDC on Polygon

export const cryptoProvider = new ethers.JsonRpcProvider(POLYGON_RPC_URL);
export const slotifyWallet = new ethers.Wallet(SLOTIFY_PRIVATE_KEY, cryptoProvider);

export async function verifyCryptoPayment(txHash: string, expectedAmount: number, expectedWallet: string) {
  const transaction = await cryptoProvider.getTransaction(txHash);
  if (!transaction) {
    throw new Error('Transaction not found');
  }

  const receipt = await cryptoProvider.getTransactionReceipt(txHash);
  if (!receipt || receipt.confirmations < 6) {
    throw new Error('Transaction not confirmed');
  }

  if (transaction.to !== expectedWallet) {
    throw new Error('Transaction not sent to expected wallet');
  }

  const amountInWei = ethers.utils.parseUnits(expectedAmount.toString(), 6); // USDC has 6 decimals
  if (transaction.value.lt(amountInWei)) {
    throw new Error('Amount mismatch');
  }

  return {
    transaction,
    receipt,
    amount: ethers.utils.formatUnits(transaction.value, 6),
  };
}

export async function generatePaymentIntent(amount: number) {
  return {
    amount: Math.round(amount * 100), // Convert to cents
    token: 'USDC',
    chain: 'Polygon',
    wallet: SLOTIFY_WALLET,
  };
}