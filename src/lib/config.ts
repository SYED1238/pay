import { UPIAppConfig, UPIApp } from './types';

// ─── Payment Configuration ────────────────────────────────────
export const PAYMENT_CONFIG = {
  payee: {
    upiId: '7975463051@jupiteraxis',
    name: 'SYED MOHAMMED HAMZA',
  },
  currency: 'INR',
  currencySymbol: '₹',
  amount: {
    min: 1,
    max: 100000,
    maxDecimals: 2,
  },
  transaction: {
    expiryMinutes: 15,
  },
} as const;

// ─── UPI App Configurations ──────────────────────────────────
export const UPI_APPS: Record<UPIApp, UPIAppConfig> = {
  googlepay: {
    id: 'googlepay',
    name: 'Google Pay',
    scheme: 'tez://upi/pay',
    packageName: 'com.google.android.apps.nbu.paisa.user',
    color: '#4285F4',
    icon: 'gpay',
  },
  phonepe: {
    id: 'phonepe',
    name: 'PhonePe',
    scheme: 'phonepe://pay',
    packageName: 'com.phonepe.app',
    color: '#5F259F',
    icon: 'phonepe',
  },
  paytm: {
    id: 'paytm',
    name: 'Paytm',
    scheme: 'paytmmp://pay',
    packageName: 'net.one97.paytm',
    color: '#00BAF2',
    icon: 'paytm',
  },
  bhim: {
    id: 'bhim',
    name: 'BHIM',
    scheme: 'bhim://pay',
    packageName: 'in.org.npci.upiapp',
    color: '#007A3D',
    icon: 'bhim',
  },
  generic: {
    id: 'generic',
    name: 'Other UPI apps',
    scheme: 'upi://pay',
    color: '#C9A96E',
    icon: 'generic',
  },
};

// ─── Direct Bank Transfer Configuration ────────────────────────
export const BANK_TRANSFER_CONFIG = {
  accountHolderName: 'SYED MOHAMMED HAMZA',
  accountNumber: '77780102114274',
  ifsc: 'FDRL0007778',
  bankName: 'Federal Bank',
  branch: 'Neo Banking / Jupiter',
  quickAmounts: [100, 200, 500, 1000, 2000, 5000],
} as const;

// ─── PayPal Configuration ─────────────────────────────────────
export const PAYPAL_CONFIG = {
  username: 'SYEDHAMZA1238',
  meUrl: 'https://paypal.me/SYEDHAMZA1238',
  defaultCurrency: 'USD' as const,
  supportedCurrencies: [
    { code: 'USD' as const, symbol: '$', name: 'US Dollar' },
    { code: 'EUR' as const, symbol: '€', name: 'Euro' },
    { code: 'GBP' as const, symbol: '£', name: 'British Pound' },
    { code: 'CAD' as const, symbol: 'CA$', name: 'Canadian Dollar' },
    { code: 'AUD' as const, symbol: 'AU$', name: 'Australian Dollar' },
  ],
  quickAmounts: [25, 50, 100, 250, 500],
} as const;

// ─── USDT / Crypto Configuration ──────────────────────────────
export const USDT_CONFIG = {
  currency: 'USDT',
  network: 'TRON',
  networkCode: 'TRC20',
  networkFullName: 'TRON (TRC20)',
  address: 'TPYbZrgRbj3tzCW4evgbn7SrMiJ8ctsH5p',
  explorerUrl: 'https://tronscan.org/#/address/TPYbZrgRbj3tzCW4evgbn7SrMiJ8ctsH5p',
  quickAmounts: [50, 100, 250, 500, 1000],
  warning: 'Only send USDT via the TRON (TRC20) network to this address. Assets sent from other networks (ERC20, BSC, Solana, etc.) cannot be recovered.',
} as const;

// ─── Brand ────────────────────────────────────────────────────
export const BRAND = {
  name: 'SYED HAMZA',
  domain: 'pay.syedhamza.in',
  title: 'Pay Syed Hamza — Unified Payment Terminal',
  description: 'Make a secure payment to Syed Hamza via UPI, Direct Bank Transfer, PayPal, or USDT.',
} as const;
