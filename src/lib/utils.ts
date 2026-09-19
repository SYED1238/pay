import { PAYMENT_CONFIG } from './config';

/**
 * Generate a unique transaction reference ID.
 * Format: TXN + timestamp + random hex
 */
export function generateReferenceId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TXN${timestamp}${random}`;
}

/**
 * Validate and normalize a payment amount.
 * Returns the sanitized number or null if invalid.
 */
export function validateAmount(input: string): number | null {
  // Strip whitespace and commas
  const cleaned = input.replace(/[\s,]/g, '');

  if (!cleaned || cleaned === '') return null;

  const amount = parseFloat(cleaned);

  if (isNaN(amount) || !isFinite(amount)) return null;
  if (amount <= 0) return null;
  if (amount < PAYMENT_CONFIG.amount.min) return null;
  if (amount > PAYMENT_CONFIG.amount.max) return null;

  // Check decimal places
  const parts = cleaned.split('.');
  if (parts.length > 2) return null;
  if (parts[1] && parts[1].length > PAYMENT_CONFIG.amount.maxDecimals) return null;

  // Round to max decimal places
  return Math.round(amount * 100) / 100;
}

/**
 * Format an amount for display with currency symbol and Indian number formatting.
 */
export function formatAmount(amount: number): string {
  // Indian number formatting: 1,00,000
  const formatted = amount.toLocaleString('en-IN', {
    minimumFractionDigits: amount % 1 !== 0 ? 2 : 0,
    maximumFractionDigits: 2,
  });
  return `${PAYMENT_CONFIG.currencySymbol}${formatted}`;
}

import { DeviceInfo, DevicePlatform, UPIApp } from './types';
import { UPI_APPS } from './config';

/**
 * Format amount for standard UPI URI without trailing .00 for integers.
 */
export function formatUpiAmount(amount: number): string {
  if (Number.isInteger(amount)) {
    return amount.toString();
  }
  const fixed = amount.toFixed(2);
  return fixed.endsWith('.00') ? Math.floor(amount).toString() : fixed;
}

/**
 * Generate a standard personal UPI payment URI.
 * Format:
 * upi://pay?pa=7975463051@jupiteraxis&pn=SYED%20MOHAMMED%20HAMZA&am=AMOUNT&cu=INR&tn=Payment%20to%20SYED%20MOHAMMED%20HAMZA
 */
export function generateUPIUri(params: {
  amount: number;
  description?: string;
  referenceId?: string;
}): string {
  const upiId = PAYMENT_CONFIG.payee.upiId; // 7975463051@jupiteraxis
  const name = PAYMENT_CONFIG.payee.name; // SYED MOHAMMED HAMZA
  const am = formatUpiAmount(params.amount);
  const encodedName = 'SYED%20MOHAMMED%20HAMZA';
  const tn = encodeURIComponent(params.description || `Payment to ${name}`).replace(/%20/g, '%20');

  return `upi://pay?pa=${upiId}&pn=${encodedName}&am=${am}&cu=INR&tn=${tn}`;
}

/**
 * Generate an app-specific UPI URI or intent where supported.
 * Uses the exact same standard personal payment parameters.
 */
export function generateAppSpecificUPIUri(
  app: UPIApp,
  params: {
    amount: number;
    description?: string;
    referenceId?: string;
  },
  device?: DeviceInfo
): string {
  const standardUri = generateUPIUri(params);
  if (app === 'generic') return standardUri;

  const appConfig = UPI_APPS[app];
  if (!appConfig) return standardUri;

  const upiId = PAYMENT_CONFIG.payee.upiId;
  const am = formatUpiAmount(params.amount);
  const encodedName = 'SYED%20MOHAMMED%20HAMZA';
  const tn = encodeURIComponent(params.description || 'Payment to SYED MOHAMMED HAMZA').replace(/%20/g, '%20');
  const queryString = `pa=${upiId}&pn=${encodedName}&am=${am}&cu=INR&tn=${tn}`;

  // If Android, launch through the app's standard UPI scheme
  if (device?.isAndroid) {
    if (app === 'googlepay') {
      return `tez://upi/pay?${queryString}`;
    }
    if (app === 'phonepe') {
      return `phonepe://pay?${queryString}`;
    }
    if (app === 'paytm') {
      return `paytmmp://pay?${queryString}`;
    }
    if (app === 'bhim') {
      return `bhim://pay?${queryString}`;
    }
  }

  // iOS custom schemes
  if (device?.isIOS) {
    if (app === 'phonepe') {
      return `phonepe://pay?${queryString}`;
    }
    if (app === 'paytm') {
      return `paytmmp://pay?${queryString}`;
    }
    if (app === 'googlepay') {
      return `gpay://upi/pay?${queryString}`;
    }
    if (app === 'bhim') {
      return `bhim://pay?${queryString}`;
    }
  }

  // Fallback to standard UPI
  return standardUri;
}

/**
 * Robust client-side device & platform detection.
 * Distinguishes Android mobile, iOS mobile, and Desktop/tablet.
 * Supports manual override for testing (e.g. ?device=android).
 */
export function detectDevice(overrideParam?: string | null): DeviceInfo {
  if (typeof window === 'undefined') {
    return {
      platform: 'desktop',
      isMobile: false,
      isAndroid: false,
      isIOS: false,
      isDesktop: true,
      isInApp: false,
    };
  }

  // Check URL search params for override (e.g. ?device=android, ?device=ios, ?device=desktop)
  let override = overrideParam;
  if (!override && typeof window !== 'undefined' && window.location?.search) {
    try {
      const sp = new URLSearchParams(window.location.search);
      override = sp.get('device') || sp.get('platform');
    } catch {
      // ignore
    }
  }

  if (override) {
    const o = override.toLowerCase().trim();
    if (o === 'android') {
      return { platform: 'android', isMobile: true, isAndroid: true, isIOS: false, isDesktop: false, isInApp: false };
    }
    if (o === 'ios' || o === 'iphone' || o === 'apple') {
      return { platform: 'ios', isMobile: true, isAndroid: false, isIOS: true, isDesktop: false, isInApp: false };
    }
    if (o === 'desktop' || o === 'pc' || o === 'qr') {
      return { platform: 'desktop', isMobile: false, isAndroid: false, isIOS: false, isDesktop: true, isInApp: false };
    }
  }

  const ua = navigator.userAgent || navigator.vendor || '';

  const isInApp = /FBAN|FBAV|Instagram|Line|Twitter|Snapchat|WhatsApp/i.test(ua);
  const isAndroid = /Android/i.test(ua);
  const isIOS = /iPhone|iPod/i.test(ua);
  const isIPad = /iPad/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1 && window.innerWidth >= 768);
  const isAndroidTablet = isAndroid && !/Mobile/i.test(ua);

  // Per Requirement 7:
  // IF Android mobile -> Android UPI app-first
  // IF iPhone/iOS -> iOS UPI app-first with clear fallback
  // IF desktop/tablet -> QR-first
  let platform: DevicePlatform = 'desktop';

  if (isAndroid && !isAndroidTablet) {
    platform = 'android';
  } else if (isIOS) {
    platform = 'ios';
  } else if (isIPad || isAndroidTablet) {
    platform = 'desktop';
  } else {
    // Check if mobile screen with touch (fallback for developer mobile emulation)
    const isMobileEmulation = window.innerWidth <= 768 && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
    if (isMobileEmulation) {
      platform = 'android'; // default mobile emulation to Android experience
    } else {
      platform = 'desktop';
    }
  }

  const isMobile = platform === 'android' || platform === 'ios';

  return {
    platform,
    isMobile,
    isAndroid: platform === 'android',
    isIOS: platform === 'ios',
    isDesktop: platform === 'desktop',
    isInApp,
  };
}

/**
 * Detect if the current device is mobile (legacy helper).
 */
export function isMobileDevice(): boolean {
  return detectDevice().isMobile;
}

/**
 * Detect if running in an in-app browser (Instagram, Facebook, etc.)
 */
export function isInAppBrowser(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent || navigator.vendor || '';
  return /FBAN|FBAV|Instagram|Line|Twitter|Snapchat|WhatsApp/i.test(ua);
}

/**
 * Copy text to clipboard with fallback.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate an expiry date for a transaction.
 */
export function generateExpiryDate(): string {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + PAYMENT_CONFIG.transaction.expiryMinutes);
  return expiry.toISOString();
}

/**
 * Generate an official PayPal.Me URL with optional amount and currency.
 * Fallback to base URL if amount is missing or invalid.
 */
export function generatePayPalUrl(amount?: number | null, currency: string = 'USD'): string {
  const base = 'https://paypal.me/SYEDHAMZA1238';
  if (amount && amount > 0 && isFinite(amount)) {
    const formattedAmount = amount % 1 !== 0 ? amount.toFixed(2) : amount.toString();
    const cleanCurrency = (currency || 'USD').toUpperCase();
    return `${base}/${formattedAmount}${cleanCurrency}`;
  }
  return base;
}

/**
 * Truncate a long blockchain address for mobile display.
 */
export function truncateAddress(address: string, frontChars: number = 8, backChars: number = 8): string {
  if (!address || address.length <= frontChars + backChars) return address;
  return `${address.substring(0, frontChars)}…${address.substring(address.length - backChars)}`;
}
