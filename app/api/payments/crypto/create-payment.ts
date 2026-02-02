import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generatePaymentIntent } from '@/lib/crypto';

const POLYGON_RPC_URL = process.env.POLYGON_RPC_URL;
const SLOTIFY_WALLET = process.env.SLOTIFY_WALLET;
const SLOTIFY_PRIVATE_KEY = process.env.SLOTIFY_PRIVATE_KEY;

const USDC_ADDRESS = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'; // USDC on Polygon

export async function createPayment(request: NextRequest) {
  const { bookingId, amount, currency = 'usd', region } = await request.json();

  try {
    const paymentIntent = await generatePaymentIntent(amount);

    // Create a pending payment record
    await prisma.payment.create({
      data: {
        amount,
        currency,
        bookingId,
        status: 'PENDING',
        region: region || 'us',
        cryptoToken: 'USDC',
        cryptoChain: 'Polygon',
        cryptoWallet: SLOTIFY_WALLET,
      },
    });

    return NextResponse.json(paymentIntent);
  } catch (error) {
    console.error('Error creating crypto payment intent:', error);
    return NextResponse.json({ error: 'Failed to create crypto payment intent' }, { status: 500 });
  }
}