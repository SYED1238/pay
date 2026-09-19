'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PaymentStatus, UPIApp, Transaction, DeviceInfo, PaymentRail } from '@/lib/types';
import {
  validateAmount,
  formatAmount,
  detectDevice,
  generateUPIUri,
  generateAppSpecificUPIUri,
} from '@/lib/utils';
import { PAYMENT_CONFIG, UPI_APPS } from '@/lib/config';
import AmountInput from './AmountInput';
import UPIAppButton from './UPIAppButton';
import QRDisplay from './QRDisplay';
import CopyUPIId from './CopyUPIId';
import PaymentStatusDisplay from './PaymentStatusDisplay';
import BankTransferTerminal from './BankTransferTerminal';
import PayPalTerminal from './PayPalTerminal';
import USDTTerminal from './USDTTerminal';

type Step = 'amount' | 'method' | 'processing';

interface PaymentTerminalProps {
  initialAmount?: string;
  deviceOverride?: DeviceInfo;
}

const PAYMENT_RAILS: { id: PaymentRail; label: string; tag: string; badge: string }[] = [
  { id: 'upi', label: 'UPI', tag: 'Instant', badge: '🇮🇳' },
  { id: 'bank', label: 'Bank', tag: 'Direct', badge: '🏛️' },
  { id: 'paypal', label: 'PayPal', tag: 'Global', badge: '🌎' },
  { id: 'usdt', label: 'USDT', tag: 'TRC20', badge: '₮' },
];

export default function PaymentTerminal({ initialAmount, deviceOverride }: PaymentTerminalProps) {
  const [activeRail, setActiveRail] = useState<PaymentRail>('upi');
  const [amount, setAmount] = useState(initialAmount || '');
  const [step, setStep] = useState<Step>('amount');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(PaymentStatus.IDLE);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [upiUri, setUpiUri] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMobileQR, setShowMobileQR] = useState(false);
  const [device, setDevice] = useState<DeviceInfo>(() => deviceOverride || detectDevice());

  useEffect(() => {
    if (deviceOverride) {
      setDevice(deviceOverride);
    } else {
      setDevice(detectDevice());
      const handleResize = () => setDevice(detectDevice());
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [deviceOverride]);

  // If initialAmount is provided and valid, auto-advance
  useEffect(() => {
    if (initialAmount) {
      const valid = validateAmount(initialAmount);
      if (valid !== null) {
        setAmount(valid.toString());
      }
    }
  }, [initialAmount]);

  const validAmount = validateAmount(amount);
  const isValid = validAmount !== null;

  const createPayment = useCallback(async () => {
    if (!isValid || !validAmount) return;
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: validAmount }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create payment transaction');
      }

      const data = await response.json();
      setTransaction(data.transaction);
      setUpiUri(data.upiUri);
      setPaymentStatus(PaymentStatus.TRANSACTION_CREATED);
      setStep('method');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [isValid, validAmount]);

  const handleLaunchUri = useCallback((uri: string) => {
    setPaymentStatus(PaymentStatus.PAYMENT_APP_OPENING);

    try {
      // Attempt to launch the UPI app
      window.location.href = uri;

      // Transition to pending state after delay — NEVER claim instant success
      setTimeout(() => {
        setPaymentStatus(PaymentStatus.PAYMENT_PENDING);
        setStep('processing');
      }, 1600);
    } catch {
      setPaymentStatus(PaymentStatus.PAYMENT_FAILED);
      setStep('processing');
    }
  }, []);

  const handleLaunchPrimaryUPI = useCallback(() => {
    if (!transaction || !validAmount) return;
    const uri = generateUPIUri({
      amount: validAmount,
      referenceId: transaction.referenceId,
    });
    handleLaunchUri(uri);
  }, [transaction, validAmount, handleLaunchUri]);

  const handleAppSelect = useCallback((app: UPIApp) => {
    if (!transaction || !validAmount) return;
    const uri = generateAppSpecificUPIUri(
      app,
      { amount: validAmount, referenceId: transaction.referenceId },
      device
    );
    handleLaunchUri(uri);
  }, [transaction, validAmount, device, handleLaunchUri]);

  const handleCheckStatus = useCallback(async () => {
    if (!transaction?.id) return;
    try {
      const res = await fetch(`/api/payment/status?id=${encodeURIComponent(transaction.id)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.status) {
          setPaymentStatus(data.status);
        }
      }
    } catch (err) {
      console.error('Failed to check payment status', err);
    }
  }, [transaction]);

  const handleRetry = useCallback(() => {
    setPaymentStatus(PaymentStatus.IDLE);
    setStep('method');
  }, []);

  const handleBack = useCallback(() => {
    // Preserve entered amount, but reset step and transaction
    setPaymentStatus(PaymentStatus.IDLE);
    setTransaction(null);
    setUpiUri('');
    setShowMobileQR(false);
    setStep('amount');
    setError(null);
  }, []);

  const handleGoToMethod = useCallback(() => {
    if (isValid) {
      createPayment();
    }
  }, [isValid, createPayment]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      className="relative w-full max-w-[440px] mx-auto"
    >
      {/* Terminal Glow */}
      <div className="terminal-glow" />

      {/* Main Card */}
      <div
        className="relative rounded-[24px] overflow-hidden"
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 20px 50px -15px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.07)',
        }}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.15em] font-medium" style={{ color: 'var(--accent-champagne)' }}>
                {PAYMENT_CONFIG.payee.name}
              </p>
              <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                Personal Payment Terminal
              </p>
            </div>

            {/* Lock icon */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="2.5" y="6" width="9" height="6.5" rx="2" stroke="var(--text-tertiary)" strokeWidth="1.2" />
                <path d="M4.5 6V4.5a2.5 2.5 0 0 1 5 0V6" stroke="var(--text-tertiary)" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {/* Segmented Payment Rails Selector */}
          <div
            className="mt-4 grid grid-cols-4 gap-1 p-1 rounded-xl"
            style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
            role="tablist"
            aria-label="Payment rails"
          >
            {PAYMENT_RAILS.map((rail) => {
              const isActive = activeRail === rail.id;
              return (
                <button
                  key={rail.id}
                  type="button"
                  onClick={() => setActiveRail(rail.id)}
                  role="tab"
                  aria-selected={isActive}
                  className="relative py-2 px-1 rounded-lg flex flex-col items-center justify-center transition-colors text-center cursor-pointer select-none"
                  style={{
                    color: isActive ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeRailIndicator"
                      className="absolute inset-0 rounded-lg"
                      style={{
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-subtle)',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
                      }}
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10 text-[11px] font-semibold tracking-tight flex items-center justify-center gap-1">
                    <span className="text-[10px]">{rail.badge}</span>
                    <span>{rail.label}</span>
                  </span>
                  <span className="relative z-10 text-[8px] uppercase tracking-wider font-medium opacity-70 mt-0.5">
                    {rail.tag}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="h-[1px] mx-6 mb-5" style={{ backgroundColor: 'var(--border-subtle)' }} />

        {/* Content Area with Morphing Animation */}
        <div className="px-6 pb-6">
          <AnimatePresence mode="wait">
            {/* ══════════════════════════════════════════════════════
                1. UPI PAYMENT RAIL
               ══════════════════════════════════════════════════════ */}
            {activeRail === 'upi' && (
              <motion.div
                key="rail-upi"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <AnimatePresence mode="wait">
                  {/* Step 1: Amount Entry */}
                  {step === 'amount' && (
                    <motion.div
                      key="amount"
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -16 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className="space-y-6"
                    >
                      <AmountInput
                        value={amount}
                        onChange={setAmount}
                        onSubmit={handleGoToMethod}
                        disabled={isLoading}
                      />

                      {/* Error Banner */}
                      <AnimatePresence>
                        {error && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="rounded-xl px-4 py-3"
                            style={{ backgroundColor: 'var(--error-subtle)' }}
                          >
                            <p className="text-sm" style={{ color: 'var(--error)' }} role="alert">
                              {error}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Continue Button */}
                      <motion.button
                        onClick={handleGoToMethod}
                        disabled={!isValid || isLoading}
                        whileHover={isValid && !isLoading ? { scale: 1.01 } : {}}
                        whileTap={isValid && !isLoading ? { scale: 0.985 } : {}}
                        className="w-full py-4 rounded-2xl text-[15px] font-semibold transition-all disabled:cursor-not-allowed relative overflow-hidden"
                        style={{
                          backgroundColor: isValid ? 'var(--accent-champagne)' : 'var(--bg-elevated)',
                          color: isValid ? 'var(--text-inverse)' : 'var(--text-tertiary)',
                          border: isValid ? 'none' : '1px solid var(--border-subtle)',
                        }}
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center gap-2">
                            <motion.div
                              className="w-4 h-4 rounded-full border-2 border-current"
                              style={{ borderTopColor: 'transparent' }}
                              animate={{ rotate: 360 }}
                              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                            />
                            <span>Generating payment…</span>
                          </div>
                        ) : isValid && validAmount ? (
                          `Continue to pay ${formatAmount(validAmount)}`
                        ) : (
                          'Enter an amount'
                        )}
                      </motion.button>

                      {/* Direct Bank Transfer Shortcut */}
                      <div className="text-center pt-0.5">
                        <button
                          type="button"
                          onClick={() => setActiveRail('bank')}
                          className="text-xs transition-colors hover:underline inline-flex items-center gap-1.5 cursor-pointer"
                          style={{ color: 'var(--text-tertiary)' }}
                        >
                          <span>🏛️ Or transfer directly via</span>
                          <span style={{ color: 'var(--accent-champagne)', fontWeight: 500 }}>Bank Account (IMPS / NEFT) →</span>
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Payment Method Selection */}
                  {step === 'method' && (
                    <motion.div
                      key="method"
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 16 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className="space-y-5"
                    >
                      {/* Amount Badge */}
                      <div className="flex items-center justify-center">
                        <div
                          className="px-5 py-2 rounded-full"
                          style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
                        >
                          <span className="text-xl font-light tabular-nums amount-display" style={{ color: 'var(--text-primary)' }}>
                            {validAmount ? formatAmount(validAmount) : ''}
                          </span>
                        </div>
                      </div>

                      {/* In-app browser warning banner if detected */}
                      {device.isInApp && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="rounded-xl px-4 py-3 text-left"
                          style={{ backgroundColor: 'var(--warning-subtle)' }}
                        >
                          <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--warning)' }}>
                            In-App Browser Detected
                          </p>
                          <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                            For direct UPI app launching, open this page in Chrome or Safari, or use the QR Code below.
                          </p>
                        </motion.div>
                      )}

                      {/* Mobile Flow: UPI App-First */}
                      {device.isMobile ? (
                        <div className="space-y-4">
                          {/* Primary Mobile CTA */}
                          <div>
                            <motion.button
                              onClick={handleLaunchPrimaryUPI}
                              disabled={paymentStatus === PaymentStatus.PAYMENT_APP_OPENING}
                              whileHover={{ scale: 1.015 }}
                              whileTap={{ scale: 0.985 }}
                              className="w-full py-4 px-5 rounded-2xl font-semibold text-[15px] flex items-center justify-center gap-2.5 transition-all relative overflow-hidden"
                              style={{
                                backgroundColor: 'var(--accent-champagne)',
                                color: 'var(--text-inverse)',
                                boxShadow: '0 4px 16px -2px rgba(0, 0, 0, 0.25)',
                              }}
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <path d="M4 15l7-10 2 5-5 5h7l2 3H4z" fill="var(--text-inverse)"/>
                                <path d="M20 9l-7 10-2-5 5-5h-7l-2-3h13z" fill="var(--text-inverse)" opacity="0.65"/>
                              </svg>
                              <span>Pay {validAmount ? formatAmount(validAmount) : ''} with UPI</span>
                            </motion.button>
                            <p className="text-[11px] text-center mt-1.5" style={{ color: 'var(--text-tertiary)' }}>
                              Opens your default UPI application
                            </p>
                          </div>

                          {/* App Selection Section */}
                          <div>
                            <p className="text-xs uppercase tracking-wider font-medium mb-2.5" style={{ color: 'var(--text-tertiary)' }}>
                              Choose your UPI app
                            </p>
                            <div className="space-y-2">
                              {(['googlepay', 'phonepe', 'paytm', 'bhim', 'generic'] as UPIApp[]).map((app, index) => (
                                <motion.div
                                  key={app}
                                  initial={{ opacity: 0, y: 8 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.04 * index, duration: 0.25 }}
                                >
                                  <UPIAppButton
                                    app={app}
                                    onClick={handleAppSelect}
                                    disabled={paymentStatus === PaymentStatus.PAYMENT_APP_OPENING}
                                  />
                                </motion.div>
                              ))}
                            </div>
                          </div>

                          {/* UPI ID Copy */}
                          <CopyUPIId />

                          {/* ── Direct Bank Transfer Payment Card ── */}
                          <div
                            className="p-4 rounded-2xl transition-all relative overflow-hidden"
                            style={{
                              backgroundColor: 'var(--bg-elevated)',
                              border: '1px solid var(--border-subtle)',
                            }}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                  style={{
                                    backgroundColor: 'var(--bg-surface)',
                                    border: '1px solid var(--border-subtle)',
                                  }}
                                >
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-champagne)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 21h18M3 10h18M5 10v11M9 10v11M15 10v11M19 10v11M12 2L2 7h20L12 2z"/>
                                  </svg>
                                </div>
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <h3 className="text-sm font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                                      Direct Bank Transfer
                                    </h3>
                                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-md" style={{ backgroundColor: 'rgba(201, 169, 110, 0.15)', color: 'var(--accent-champagne)' }}>
                                      IMPS / NEFT
                                    </span>
                                  </div>
                                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                                    Transfer directly to our bank account
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="mt-3.5 pt-3 border-t flex items-center justify-between gap-2" style={{ borderColor: 'var(--border-subtle)' }}>
                              <span className="text-[11px] truncate" style={{ color: 'var(--text-secondary)' }}>
                                Account No + IFSC transfer
                              </span>
                              <motion.button
                                type="button"
                                onClick={() => setActiveRail('bank')}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors flex-shrink-0"
                                style={{
                                  backgroundColor: 'var(--accent-champagne)',
                                  color: 'var(--text-inverse)',
                                }}
                              >
                                <span>Pay via Bank Transfer</span>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </motion.button>
                            </div>
                          </div>

                          {/* Mobile Fallback: Having trouble? Show QR Code */}
                          <div className="pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                            <div className="text-center">
                              <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                                Having trouble opening your UPI app?
                              </p>
                              <motion.button
                                onClick={() => setShowMobileQR((prev) => !prev)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-colors"
                                style={{
                                  backgroundColor: 'var(--bg-elevated)',
                                  color: 'var(--accent-champagne)',
                                  border: '1px solid var(--border-subtle)',
                                }}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <rect x="3" y="3" width="7" height="7"/>
                                  <rect x="14" y="3" width="7" height="7"/>
                                  <rect x="14" y="14" width="7" height="7"/>
                                  <rect x="3" y="14" width="7" height="7"/>
                                </svg>
                                <span>{showMobileQR ? 'Hide QR Code' : 'Show QR Code'}</span>
                              </motion.button>
                            </div>

                            {/* Expandable QR Code Fallback */}
                            <AnimatePresence>
                              {showMobileQR && upiUri && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.3 }}
                                  className="pt-4 overflow-hidden"
                                >
                                  <div className="p-4 rounded-2xl" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                                    <p className="text-xs text-center font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
                                      Scan with any UPI app on another phone
                                    </p>
                                    <QRDisplay upiUri={upiUri} amount={validAmount ? validAmount.toString() : ''} />
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      ) : (
                        /* Desktop Flow: QR-First */
                        <div className="space-y-4">
                          <div className="text-center">
                            <p className="text-xs uppercase tracking-wider font-medium mb-1" style={{ color: 'var(--accent-champagne)' }}>
                              Scan with any UPI app
                            </p>
                            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                              Open Google Pay, PhonePe, Paytm, or BHIM to scan
                            </p>
                          </div>

                          {upiUri && (
                            <QRDisplay upiUri={upiUri} amount={validAmount ? validAmount.toString() : ''} />
                          )}

                          <CopyUPIId />

                          {/* ── Direct Bank Transfer Payment Card ── */}
                          <div
                            className="p-4 rounded-2xl transition-all relative overflow-hidden"
                            style={{
                              backgroundColor: 'var(--bg-elevated)',
                              border: '1px solid var(--border-subtle)',
                            }}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                  style={{
                                    backgroundColor: 'var(--bg-surface)',
                                    border: '1px solid var(--border-subtle)',
                                  }}
                                >
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-champagne)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 21h18M3 10h18M5 10v11M9 10v11M15 10v11M19 10v11M12 2L2 7h20L12 2z"/>
                                  </svg>
                                </div>
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <h3 className="text-sm font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                                      Direct Bank Transfer
                                    </h3>
                                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-md" style={{ backgroundColor: 'rgba(201, 169, 110, 0.15)', color: 'var(--accent-champagne)' }}>
                                      IMPS / NEFT
                                    </span>
                                  </div>
                                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                                    Transfer directly to our bank account
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="mt-3.5 pt-3 border-t flex items-center justify-between gap-2" style={{ borderColor: 'var(--border-subtle)' }}>
                              <span className="text-[11px] truncate" style={{ color: 'var(--text-secondary)' }}>
                                Account No + IFSC transfer
                              </span>
                              <motion.button
                                type="button"
                                onClick={() => setActiveRail('bank')}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors flex-shrink-0"
                                style={{
                                  backgroundColor: 'var(--accent-champagne)',
                                  color: 'var(--text-inverse)',
                                }}
                              >
                                <span>Pay via Bank Transfer</span>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Back button */}
                      <div className="flex justify-center pt-1">
                        <motion.button
                          onClick={handleBack}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="text-sm py-2 px-4 rounded-lg transition-colors"
                          style={{ color: 'var(--text-tertiary)' }}
                        >
                          ← Change amount
                        </motion.button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Processing / Status */}
                  {step === 'processing' && (
                    <motion.div
                      key="processing"
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 16 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    >
                      {!device.isMobile && paymentStatus === PaymentStatus.PAYMENT_PENDING && upiUri ? (
                        <div className="space-y-5">
                          <div className="text-center">
                            <p className="text-xs uppercase tracking-wider font-medium mb-1" style={{ color: 'var(--accent-champagne)' }}>
                              Scan with any UPI app
                            </p>
                            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                              Awaiting payment confirmation
                            </p>
                          </div>

                          <QRDisplay upiUri={upiUri} amount={validAmount ? validAmount.toString() : ''} />
                          <CopyUPIId />

                          <div className="pt-2 text-center">
                            <motion.button
                              onClick={handleCheckStatus}
                              whileHover={{ scale: 1.015 }}
                              whileTap={{ scale: 0.985 }}
                              className="w-full py-3 px-4 rounded-xl text-sm font-medium transition-all mb-3 flex items-center justify-center gap-2"
                              style={{
                                backgroundColor: 'var(--bg-elevated)',
                                color: 'var(--text-primary)',
                                border: '1px solid var(--border-subtle)',
                              }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
                              </svg>
                              <span>Check payment status</span>
                            </motion.button>

                            <motion.button
                              onClick={handleBack}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="text-sm py-2 px-4 rounded-lg transition-colors"
                              style={{ color: 'var(--text-tertiary)' }}
                            >
                              ← Start over
                            </motion.button>
                          </div>
                        </div>
                      ) : (
                        <PaymentStatusDisplay
                          status={paymentStatus}
                          amount={validAmount || 0}
                          referenceId={transaction?.referenceId}
                          onRetry={handleRetry}
                          onBack={handleBack}
                          onShowQR={() => {
                            setShowMobileQR(true);
                            setStep('method');
                          }}
                          onCheckStatus={handleCheckStatus}
                        />
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* ══════════════════════════════════════════════════════
                2. DIRECT BANK TRANSFER RAIL
               ══════════════════════════════════════════════════════ */}
            {activeRail === 'bank' && (
              <motion.div
                key="rail-bank"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <BankTransferTerminal
                  initialAmount={validAmount}
                  onBack={() => setActiveRail('upi')}
                />
              </motion.div>
            )}

            {/* ══════════════════════════════════════════════════════
                3. PAYPAL PAYMENT RAIL
               ══════════════════════════════════════════════════════ */}
            {activeRail === 'paypal' && (
              <motion.div
                key="rail-paypal"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <PayPalTerminal />
              </motion.div>
            )}

            {/* ══════════════════════════════════════════════════════
                4. USDT CRYPTO PAYMENT RAIL
               ══════════════════════════════════════════════════════ */}
            {activeRail === 'usdt' && (
              <motion.div
                key="rail-usdt"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <USDTTerminal />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer with Dynamic Rail Information */}
        <div
          className="px-6 py-3 flex items-center justify-center gap-1.5"
          style={{
            backgroundColor: 'rgba(255,255,255,0.015)',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <rect x="1" y="4" width="8" height="5" rx="1.5" stroke="var(--text-tertiary)" strokeWidth="0.8" />
            <path d="M3 4V2.5a2 2 0 0 1 4 0V4" stroke="var(--text-tertiary)" strokeWidth="0.8" strokeLinecap="round" />
          </svg>
          <span className="text-[10px] tracking-wider uppercase" style={{ color: 'var(--text-tertiary)' }}>
            {activeRail === 'upi' && 'Processed through UPI ecosystem'}
            {activeRail === 'bank' && 'Processed via Direct Bank Transfer (IMPS / NEFT)'}
            {activeRail === 'paypal' && 'Processed via PayPal Official Checkout'}
            {activeRail === 'usdt' && 'Settled on TRON (TRC20) Network'}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
