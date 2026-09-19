import { getPaymentProvider } from '@/lib/payment-provider';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const transactionId = searchParams.get('id');

    if (!transactionId) {
      return Response.json(
        { error: 'Transaction ID is required' },
        { status: 400 }
      );
    }

    const provider = getPaymentProvider();
    const status = await provider.getPaymentStatus(transactionId);
    const verification = await provider.verifyPayment(transactionId);

    return Response.json({
      transactionId,
      status,
      verified: verification.verified,
      referenceId: verification.referenceId,
      // Explicit note: without a real PSP webhook, verification is not possible
      notice: verification.verified
        ? undefined
        : 'Payment verification requires a connected payment service provider. Status shown is based on client-side tracking only.',
    });
  } catch {
    return Response.json(
      { error: 'Failed to check payment status' },
      { status: 500 }
    );
  }
}
