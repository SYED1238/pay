// Payment state machine
export enum PaymentStatus {
  IDLE = 'IDLE',
  AMOUNT_ENTERED = 'AMOUNT_ENTERED',
  TRANSACTION_CREATED = 'TRANSACTION_CREATED',
  PAYMENT_INTENT_READY = 'PAYMENT_INTENT_READY',
  PAYMENT_APP_OPENING = 'PAYMENT_APP_OPENING',
  PAYMENT_PENDING = 'PAYMENT_PENDING',
  PAYMENT_CONFIRMED = 'PAYMENT_CONFIRMED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  PAYMENT_CANCELLED = 'PAYMENT_CANCELLED',
  PAYMENT_EXPIRED = 'PAYMENT_EXPIRED',
}

export type PaymentRail = 'upi' | 'bank' | 'paypal' | 'usdt';

export interface BankTransferConfig {
  accountHolderName: string;
  accountNumber: string;
  ifsc: string;
  bankName: string;
  branch: string;
}

export type UPIApp = 'googlepay' | 'phonepe' | 'paytm' | 'bhim' | 'generic';

export type DevicePlatform = 'android' | 'ios' | 'desktop';

export interface DeviceInfo {
  platform: DevicePlatform;
  isMobile: boolean;
  isAndroid: boolean;
  isIOS: boolean;
  isDesktop: boolean;
  isInApp: boolean;
}

export type PayPalCurrency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD';

export interface PayPalCurrencyOption {
  code: PayPalCurrency;
  symbol: string;
  name: string;
}

export interface PayPalConfig {
  username: string;
  meUrl: string;
  defaultCurrency: PayPalCurrency;
  supportedCurrencies: PayPalCurrencyOption[];
}

export interface USDTConfig {
  network: string;
  networkCode: string;
  networkFullName: string;
  address: string;
  currency: string;
}

// Extensible blockchain transaction interface for future on-chain verification
export interface BlockchainTransaction {
  txHash?: string;
  amount?: number;
  senderAddress?: string;
  network: string;
  blockNumber?: number;
  confirmations?: number;
  timestamp?: string;
  status: 'unconfirmed' | 'confirming' | 'confirmed';
}

export interface UPIAppConfig {
  id: UPIApp;
  name: string;
  scheme: string;
  packageName?: string; // Android package name
  color: string;
  icon: string; // SVG identifier
}

export interface Transaction {
  id: string;
  referenceId: string;
  amount: number;
  currency: string;
  payeeUpiId: string;
  payeeName: string;
  status: PaymentStatus;
  paymentMethod: UPIApp | null;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentIntent {
  uri: string;
  transaction: Transaction;
}

// Payment provider abstraction — designed for future webhook/PSP integration
export interface PaymentProvider {
  createPayment(params: {
    amount: number;
    currency: string;
    payeeUpiId: string;
    payeeName: string;
    description?: string;
  }): Promise<Transaction>;

  getPaymentStatus(transactionId: string): Promise<PaymentStatus>;

  verifyPayment(transactionId: string): Promise<{
    verified: boolean;
    status: PaymentStatus;
    referenceId?: string;
  }>;
}
