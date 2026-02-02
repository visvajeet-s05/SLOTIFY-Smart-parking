import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

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

    // Create a pending payment record
    await prisma.payment.create({
      data: {
        stripeId: paymentIntent.id,
        amount,
        currency,
        bookingId,
        status: 'PENDING',
        region: region || 'us',
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