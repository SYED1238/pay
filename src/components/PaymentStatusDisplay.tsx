'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PaymentStatus } from '@/lib/types';
import { formatAmount } from '@/lib/utils';

interface PaymentStatusDisplayProps {
  status: PaymentStatus;
  amount: number;
  referenceId?: string;
  onRetry: () => void;
  onBack: () => void;
  onShowQR?: () => void;
  onCheckStatus?: () => Promise<void> | void;
}

export default function PaymentStatusDisplay({
  status,
  amount,
  referenceId,
  onRetry,
  onBack,
  onShowQR,
  onCheckStatus,
}: PaymentStatusDisplayProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [statusNote, setStatusNote] = useState<string | null>(null);

  const handleCheckStatus = async () => {
    setIsChecking(true);
    setStatusNote(null);
    try {
      if (onCheckStatus) {
        await onCheckStatus();
      } else {
        await new Promise((r) => setTimeout(r, 800));
      }
      setStatusNote('Waiting for confirmation… Personal UPI transfers complete directly in your UPI app. If completed, your funds have been received.');
    } catch {
      setStatusNote('Unable to verify with provider right now. Please verify in your UPI app.');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center text-center py-6 px-4"
      >
        {/* Pending / App Opening */}
        {(status === PaymentStatus.PAYMENT_PENDING || status === PaymentStatus.PAYMENT_APP_OPENING) && (
          <div className="w-full flex flex-col items-center">
            {/* Animated Radar Pulse */}
            <div className="relative w-16 h-16 flex items-center justify-center mb-5">
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ backgroundColor: 'var(--accent-champagne-subtle)' }}
                animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              />
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center relative z-10"
                style={{
                  backgroundColor: 'rgba(201, 169, 110, 0.1)',
                  border: '1px solid rgba(201, 169, 110, 0.3)',
                }}
              >
                <motion.div
                  className="w-6 h-6 rounded-full border-2"
                  style={{
                    borderColor: 'var(--accent-champagne)',
                    borderTopColor: 'transparent',
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
                />
              </div>
            </div>

            <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
              Complete your payment
            </h2>

            <p className="text-sm max-w-[280px] mb-3" style={{ color: 'var(--text-secondary)' }}>
              Finish the payment in your UPI app.
            </p>

            {/* Amount Badge */}
            <div className="mb-3 px-5 py-2 rounded-full" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
              <span className="text-xl font-light tabular-nums amount-display" style={{ color: 'var(--text-primary)' }}>
                {formatAmount(amount)}
              </span>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--accent-champagne)' }} />
              <span className="text-xs font-medium tracking-wide" style={{ color: 'var(--accent-champagne)' }}>
                Waiting for confirmation…
              </span>
            </div>

            {referenceId && (
              <p className="text-[11px] font-mono mb-5" style={{ color: 'var(--text-tertiary)' }}>
                Ref: {referenceId}
              </p>
            )}

            {/* Check Payment Status Button */}
            <motion.button
              onClick={handleCheckStatus}
              disabled={isChecking}
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              className="w-full py-3.5 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 mb-3"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              {isChecking ? (
                <>
                  <motion.div
                    className="w-4 h-4 rounded-full border-2 border-current"
                    style={{ borderTopColor: 'transparent' }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  />
                  <span>Checking status…</span>
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                  </svg>
                  <span>Check payment status</span>
                </>
              )}
            </motion.button>

            {/* Status note if checked */}
            {statusNote && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="rounded-xl px-3 py-2.5 mb-3 text-left w-full"
                style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
              >
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {statusNote}
                </p>
              </motion.div>
            )}

            {/* Trouble opening app fallback */}
            {onShowQR && (
              <motion.button
                onClick={onShowQR}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="text-xs py-2 px-3 rounded-lg mb-2 transition-colors flex items-center gap-1.5"
                style={{ color: 'var(--accent-champagne)' }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
                <span>Having trouble? Show QR Code</span>
              </motion.button>
            )}

            {/* Start Over */}
            <motion.button
              onClick={onBack}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="text-xs py-2 px-4 rounded-lg transition-colors"
              style={{ color: 'var(--text-tertiary)' }}
            >
              ← Start over
            </motion.button>
          </div>
        )}

        {/* Confirmed / Payment Received */}
        {status === PaymentStatus.PAYMENT_CONFIRMED && (
          <div className="w-full flex flex-col items-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
              style={{ backgroundColor: 'var(--success-subtle)' }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </motion.div>

            <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Payment received
            </h2>

            <p className="text-sm max-w-[280px] mb-4" style={{ color: 'var(--text-secondary)' }}>
              Your payment has been successfully confirmed.
            </p>

            <div className="px-5 py-2.5 rounded-full mb-4" style={{ backgroundColor: 'var(--bg-elevated)' }}>
              <span className="text-2xl font-light tabular-nums amount-display" style={{ color: 'var(--success)' }}>
                {formatAmount(amount)}
              </span>
            </div>

            {referenceId && (
              <p className="text-xs font-mono mb-6" style={{ color: 'var(--text-tertiary)' }}>
                Reference: {referenceId}
              </p>
            )}

            <motion.button
              onClick={onBack}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-2.5 rounded-xl text-sm font-medium"
              style={{
                backgroundColor: 'var(--accent-champagne)',
                color: '#080808',
              }}
            >
              Done
            </motion.button>
          </div>
        )}

        {/* Failed */}
        {status === PaymentStatus.PAYMENT_FAILED && (
          <div className="w-full flex flex-col items-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
              style={{ backgroundColor: 'var(--error-subtle)' }}
            >
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M9 9L19 19M19 9L9 19" stroke="var(--error)" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </motion.div>

            <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Payment wasn&apos;t completed
            </h2>

            <p className="text-sm max-w-[280px]" style={{ color: 'var(--text-secondary)' }}>
              The payment may have been declined or cancelled. Please try again or choose another UPI app.
            </p>

            <div className="flex gap-3 mt-6">
              <motion.button
                onClick={onRetry}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-5 py-2.5 rounded-xl text-sm font-medium"
                style={{
                  backgroundColor: 'var(--accent-champagne)',
                  color: '#080808',
                }}
              >
                Try again
              </motion.button>

              <motion.button
                onClick={onBack}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                Change amount
              </motion.button>
            </div>
          </div>
        )}

        {/* Cancelled */}
        {status === PaymentStatus.PAYMENT_CANCELLED && (
          <div className="w-full flex flex-col items-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
              style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
            >
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M9 9L19 19M19 9L9 19" stroke="var(--text-secondary)" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </motion.div>

            <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Payment cancelled
            </h2>

            <p className="text-sm max-w-[280px]" style={{ color: 'var(--text-secondary)' }}>
              You cancelled this payment. No money has been deducted.
            </p>

            <div className="flex gap-3 mt-6">
              <motion.button
                onClick={onRetry}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-5 py-2.5 rounded-xl text-sm font-medium"
                style={{
                  backgroundColor: 'var(--accent-champagne)',
                  color: '#080808',
                }}
              >
                Pay again
              </motion.button>

              <motion.button
                onClick={onBack}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                Change amount
              </motion.button>
            </div>
          </div>
        )}

        {/* Expired */}
        {status === PaymentStatus.PAYMENT_EXPIRED && (
          <div className="w-full flex flex-col items-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
              style={{ backgroundColor: 'var(--warning-subtle)' }}
            >
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <circle cx="14" cy="14" r="9" stroke="var(--warning)" strokeWidth="2" />
                <path d="M14 9v6l4 2" stroke="var(--warning)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.div>

            <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Payment expired
            </h2>

            <p className="text-sm max-w-[280px]" style={{ color: 'var(--text-secondary)' }}>
              This payment request has expired. Please create a new one.
            </p>

            <motion.button
              onClick={onBack}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-6 px-5 py-2.5 rounded-xl text-sm font-medium"
              style={{
                backgroundColor: 'var(--accent-champagne)',
                color: '#080808',
              }}
            >
              Start over
            </motion.button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
