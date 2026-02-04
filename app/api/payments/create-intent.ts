import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  const { bookingId, amount, currency = 'usd', region } = await request.json();

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata: {
        bookingId,
        region: region || 'us',
      },
    });

    await prisma.payment.create({
      data: {
        id: crypto.randomUUID(),
        stripeId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency,
        bookingId,
        status: 'PENDING',
        region: region || 'us',
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json({ error: 'Failed to create payment intent' }, { status: 500 });
  }
}
