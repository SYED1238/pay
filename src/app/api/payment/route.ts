import { NextRequest } from 'next/server';
import { createPaymentTransaction } from '@/lib/payment-provider';
import { validateAmount, generateUPIUri } from '@/lib/utils';
import { PAYMENT_CONFIG } from '@/lib/config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount: rawAmount, description } = body;

    // Validate amount
    if (rawAmount === undefined || rawAmount === null) {
      return Response.json(
        { error: 'Amount is required' },
        { status: 400 }
      );
    }

    const amount = validateAmount(String(rawAmount));
    if (amount === null) {
      return Response.json(
        { error: `Invalid amount. Must be between ${PAYMENT_CONFIG.currencySymbol}${PAYMENT_CONFIG.amount.min} and ${PAYMENT_CONFIG.currencySymbol}${PAYMENT_CONFIG.amount.max.toLocaleString('en-IN')}` },
        { status: 400 }
      );
    }

    // Create transaction
    const transaction = await createPaymentTransaction(amount, description);

    // Generate UPI URI
    const upiUri = generateUPIUri({
      amount,
      referenceId: transaction.referenceId,
      description,
    });

    return Response.json({
      transaction: {
        id: transaction.id,
        referenceId: transaction.referenceId,
        amount: transaction.amount,
        currency: transaction.currency,
        status: transaction.status,
        expiresAt: transaction.expiresAt,
      },
      upiUri,
    });
  } catch {
    return Response.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}
