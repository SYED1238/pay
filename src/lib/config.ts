import { UPIAppConfig, UPIApp } from './types';

// ─── Payment Configuration ────────────────────────────────────
export const PAYMENT_CONFIG = {
  payee: {
    upiId: 'syedhamza1238-4@okaxis',
    name: 'Syed Hamza',
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

// ─── Brand ────────────────────────────────────────────────────
export const BRAND = {
  name: 'SYED HAMZA',
  domain: 'pay.syedhamza.in',
  title: 'Pay Syed Hamza — Secure UPI Payment',
  description: 'Make a secure UPI payment to Syed Hamza.',
} as const;
