import { PaymentProvider, Transaction, PaymentStatus } from './types';
import { generateReferenceId, generateExpiryDate } from './utils';
import { PAYMENT_CONFIG } from './config';

/**
 * Local payment provider — stores transactions in memory.
 * 
 * IMPORTANT: This is a placeholder provider. In production, this would be
 * replaced with a real PSP (Payment Service Provider) that can:
 * - Create payment orders through a payment gateway
 * - Verify payment status via webhooks
 * - Confirm actual fund transfers
 * 
 * This provider NEVER claims a payment is confirmed.
 * It only tracks intent creation and pending states.
 */
export class LocalPaymentProvider implements PaymentProvider {
  private transactions: Map<string, Transaction> = new Map();

  async createPayment(params: {
    amount: number;
    currency: string;
    payeeUpiId: string;
    payeeName: string;
    description?: string;
  }): Promise<Transaction> {
    const id = crypto.randomUUID();
    const referenceId = generateReferenceId();

    const transaction: Transaction = {
      id,
      referenceId,
      amount: params.amount,
      currency: params.currency,
      payeeUpiId: params.payeeUpiId,
      payeeName: params.payeeName,
      status: PaymentStatus.TRANSACTION_CREATED,
      paymentMethod: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt: generateExpiryDate(),
      description: params.description,
    };

    this.transactions.set(id, transaction);
    return transaction;
  }

  async getPaymentStatus(transactionId: string): Promise<PaymentStatus> {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) {
      return PaymentStatus.PAYMENT_FAILED;
    }

    // Check if transaction has expired
    if (new Date(transaction.expiresAt) < new Date()) {
      transaction.status = PaymentStatus.PAYMENT_EXPIRED;
      transaction.updatedAt = new Date().toISOString();
    }

    return transaction.status;
  }

  async verifyPayment(transactionId: string): Promise<{
    verified: boolean;
    status: PaymentStatus;
    referenceId?: string;
  }> {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) {
      return { verified: false, status: PaymentStatus.PAYMENT_FAILED };
    }

    // IMPORTANT: Without a real payment verification mechanism (webhook from PSP),
    // we can NEVER confirm a payment. We can only report it as pending.
    return {
      verified: false,
      status: transaction.status === PaymentStatus.PAYMENT_CONFIRMED
        ? PaymentStatus.PAYMENT_PENDING // Never trust local confirmation
        : transaction.status,
      referenceId: transaction.referenceId,
    };
  }

  updateTransactionStatus(transactionId: string, status: PaymentStatus): void {
    const transaction = this.transactions.get(transactionId);
    if (transaction) {
      // Guard: Never allow client-side confirmation
      if (status === PaymentStatus.PAYMENT_CONFIRMED) {
        transaction.status = PaymentStatus.PAYMENT_PENDING;
      } else {
        transaction.status = status;
      }
      transaction.updatedAt = new Date().toISOString();
    }
  }
}

// Singleton provider instance
let providerInstance: LocalPaymentProvider | null = null;

export function getPaymentProvider(): LocalPaymentProvider {
  if (!providerInstance) {
    providerInstance = new LocalPaymentProvider();
  }
  return providerInstance;
}

/**
 * Create a transaction and return the UPI URI.
 * This is meant to be called from the server-side API route.
 */
export async function createPaymentTransaction(amount: number, description?: string) {
  const provider = getPaymentProvider();

  const transaction = await provider.createPayment({
    amount,
    currency: PAYMENT_CONFIG.currency,
    payeeUpiId: PAYMENT_CONFIG.payee.upiId,
    payeeName: PAYMENT_CONFIG.payee.name,
    description,
  });

  return transaction;
}
