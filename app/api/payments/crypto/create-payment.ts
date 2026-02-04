import { NextRequest, NextResponse } from 'next/server';
import { generatePaymentIntent } from '@/lib/crypto';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

const POLYGON_RPC_URL = process.env.POLYGON_RPC_URL;
const SLOTIFY_WALLET = process.env.SLOTIFY_WALLET;
const SLOTIFY_PRIVATE_KEY = process.env.SLOTIFY_PRIVATE_KEY;

const USDC_ADDRESS = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'; // USDC on Polygon

export async function createPayment(request: NextRequest) {
  const { bookingId, amount, currency = 'usd', region } = await request.json();

  try {
    const paymentIntent = await generatePaymentIntent(amount);

    await prisma.payment.create({
      data: {
        id: crypto.randomUUID(),
        bookingId,
        amount,
        currency,
        status: 'PENDING',
        region: region || 'us',
        cryptoToken: 'USDC',
        cryptoChain: 'Polygon',
        cryptoWallet: SLOTIFY_WALLET,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(paymentIntent);
  } catch (error) {
    console.error('Error creating crypto payment intent:', error);
    return NextResponse.json({ error: 'Failed to create crypto payment intent' }, { status: 500 });
  }
}
