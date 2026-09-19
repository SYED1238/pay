'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PaymentStatus, UPIApp } from '@/lib/types';
import { formatAmount } from '@/lib/utils';
import { PAYMENT_CONFIG } from '@/lib/config';
import CopyUPIId from './CopyUPIId';

interface PaymentStatusDisplayProps {
  status: PaymentStatus;
  amount: number;
  referenceId?: string;
  hasReturned?: boolean;
  onRetry: () => void;
  onBack: () => void;
  onShowQR?: () => void;
  onCheckStatus?: () => Promise<void> | void;
  onSelectApp?: (app: UPIApp) => void;
  onSwitchToBank?: () => void;
}

export default function PaymentStatusDisplay({
  status,
  amount,
  referenceId,
  hasReturned = false,
  onRetry,
  onBack,
  onShowQR,
  onCheckStatus,
  onSelectApp,
  onSwitchToBank,
}: PaymentStatusDisplayProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [statusNote, setStatusNote] = useState<string | null>(null);
  const [userConfirmed, setUserConfirmed] = useState(false);
  const [showDeclineNotice, setShowDeclineNotice] = useState(false);

  const handleCheckStatus = async () => {
    setIsChecking(true);
    setStatusNote(null);
    try {
      if (onCheckStatus) {
        await onCheckStatus();
      } else {
        await new Promise((r) => setTimeout(r, 600));
      }
      // Requirement 8: Payment status cannot be verified automatically.
      setStatusNote('Payment status cannot be verified automatically. Please confirm that your payment was completed.');
    } catch {
      setStatusNote('Payment status cannot be verified automatically. Please confirm that your payment was completed.');
    } finally {
      setIsChecking(false);
    }
  };

  // User confirmed payment completion flow
  if (userConfirmed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center text-center py-6 px-4"
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
          style={{ backgroundColor: 'var(--success-subtle)' }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
          Payment Confirmation Acknowledged
        </h2>

        <p className="text-sm max-w-[320px] mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Thank you! Because this is a direct personal UPI payment, Syed Hamza will verify the credit directly in his account ({PAYMENT_CONFIG.payee.upiId}).
        </p>

        <div className="px-5 py-2.5 rounded-full mb-5" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
          <span className="text-2xl font-light tabular-nums amount-display" style={{ color: 'var(--accent-champagne)' }}>
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
          className="px-6 py-2.5 rounded-xl text-sm font-semibold"
          style={{
            backgroundColor: 'var(--accent-champagne)',
            color: 'var(--text-inverse)',
          }}
        >
          Done
        </motion.button>
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status + String(hasReturned)}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center text-center py-5 px-3"
      >
        {/* Pending / App Opening / Returning */}
        {(status === PaymentStatus.PAYMENT_PENDING || status === PaymentStatus.PAYMENT_APP_OPENING) && (
          <div className="w-full flex flex-col items-center space-y-4">
            {/* Radar Pulse animation */}
            <div className="relative w-14 h-14 flex items-center justify-center">
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ backgroundColor: 'var(--accent-champagne-subtle)' }}
                animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              />
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center relative z-10"
                style={{
                  backgroundColor: 'rgba(201, 169, 110, 0.1)',
                  border: '1px solid rgba(201, 169, 110, 0.3)',
                }}
              >
                <motion.div
                  className="w-5 h-5 rounded-full border-2"
                  style={{
                    borderColor: 'var(--accent-champagne)',
                    borderTopColor: 'transparent',
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
                />
              </div>
            </div>

            {/* Requirement 8: "Complete the payment in your UPI app." */}
            <div>
              <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                Complete the payment in your UPI app.
              </h2>
              <p className="text-xs max-w-[300px] mx-auto" style={{ color: 'var(--text-secondary)' }}>
                Pay directly to {PAYMENT_CONFIG.payee.name} ({PAYMENT_CONFIG.payee.upiId})
              </p>
            </div>

            {/* Amount Badge */}
            <div className="px-5 py-2 rounded-full" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
              <span className="text-xl font-light tabular-nums amount-display" style={{ color: 'var(--text-primary)' }}>
                {formatAmount(amount)}
              </span>
            </div>

            {/* Requirement 8: After returning callout */}
            {hasReturned && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full rounded-xl p-3 text-left"
                style={{
                  backgroundColor: 'rgba(201, 169, 110, 0.08)',
                  border: '1px solid rgba(201, 169, 110, 0.25)',
                }}
              >
                <div className="flex items-start gap-2.5">
                  <svg className="flex-shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-champagne)" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <p className="text-xs font-medium leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                    Payment status cannot be verified automatically. Please confirm that your payment was completed.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Status note if manual check was clicked */}
            {statusNote && !hasReturned && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="rounded-xl px-3.5 py-2.5 text-left w-full"
                style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
              >
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {statusNote}
                </p>
              </motion.div>
            )}

            {/* Primary Action: User confirms payment completion */}
            <motion.button
              onClick={() => setUserConfirmed(true)}
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              className="w-full py-3.5 px-4 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
              style={{
                backgroundColor: 'var(--accent-champagne)',
                color: 'var(--text-inverse)',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>I have completed the payment</span>
            </motion.button>

            {/* Check Payment Status Button */}
            <motion.button
              onClick={handleCheckStatus}
              disabled={isChecking}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-2"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              {isChecking ? (
                <>
                  <motion.div
                    className="w-3.5 h-3.5 rounded-full border-2 border-current"
                    style={{ borderTopColor: 'transparent' }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  />
                  <span>Checking status…</span>
                </>
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                  </svg>
                  <span>Check payment status</span>
                </>
              )}
            </motion.button>

            {/* Requirement 9: Neutral decline & bank limit handler */}
            <div className="w-full pt-1">
              <button
                type="button"
                onClick={() => setShowDeclineNotice((prev) => !prev)}
                className="text-xs transition-colors hover:underline inline-flex items-center gap-1 cursor-pointer"
                style={{ color: 'var(--text-tertiary)' }}
              >
                <span>Did your bank or UPI app decline this payment?</span>
                <span style={{ color: 'var(--accent-champagne)' }}>{showDeclineNotice ? 'Hide' : 'View options'}</span>
              </button>

              <AnimatePresence>
                {showDeclineNotice && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2.5 p-3.5 rounded-xl text-left space-y-2.5"
                    style={{
                      backgroundColor: 'var(--bg-elevated)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      Your UPI app or bank declined this payment. Please try another UPI account or payment method.
                    </p>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {onShowQR && (
                        <button
                          type="button"
                          onClick={onShowQR}
                          className="px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors"
                          style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            color: 'var(--accent-champagne)',
                            border: '1px solid var(--border-subtle)',
                          }}
                        >
                          Show QR Code
                        </button>
                      )}

                      {onSwitchToBank && (
                        <button
                          type="button"
                          onClick={onSwitchToBank}
                          className="px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors"
                          style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            color: 'var(--accent-champagne)',
                            border: '1px solid var(--border-subtle)',
                          }}
                        >
                          Pay via Bank Transfer
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={onRetry}
                        className="px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors"
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          color: 'var(--text-secondary)',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        Try another UPI app
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Copy UPI ID */}
            <div className="w-full pt-1">
              <CopyUPIId />
            </div>

            {/* Fallback button: Show QR */}
            {onShowQR && (
              <motion.button
                onClick={onShowQR}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="text-xs py-1.5 px-3 rounded-lg transition-colors flex items-center gap-1.5"
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

            {/* Change amount / Start Over */}
            <motion.button
              onClick={onBack}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="text-xs py-1.5 px-4 rounded-lg transition-colors"
              style={{ color: 'var(--text-tertiary)' }}
            >
              ← Change amount / Start over
            </motion.button>
          </div>
        )}

        {/* Confirmed State */}
        {status === PaymentStatus.PAYMENT_CONFIRMED && (
          <div className="w-full flex flex-col items-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: 'var(--success-subtle)' }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </motion.div>

            <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Payment Confirmed
            </h2>

            <p className="text-sm max-w-[280px] mb-4" style={{ color: 'var(--text-secondary)' }}>
              Your transfer has been successfully processed.
            </p>

            <div className="px-5 py-2.5 rounded-full mb-4" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
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
                color: 'var(--text-inverse)',
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
              className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
              style={{ backgroundColor: 'var(--error-subtle)' }}
            >
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M9 9L19 19M19 9L9 19" stroke="var(--error)" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </motion.div>

            <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Payment wasn&apos;t completed
            </h2>

            <p className="text-sm max-w-[300px] mb-4" style={{ color: 'var(--text-secondary)' }}>
              Your UPI app or bank declined this payment. Please try another UPI account or payment method.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mt-2 w-full max-w-[280px]">
              <motion.button
                onClick={onRetry}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                style={{
                  backgroundColor: 'var(--accent-champagne)',
                  color: 'var(--text-inverse)',
                }}
              >
                Try again
              </motion.button>

              <motion.button
                onClick={onBack}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors"
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
              className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
              style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
            >
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M9 9L19 19M19 9L9 19" stroke="var(--text-secondary)" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </motion.div>

            <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Payment cancelled
            </h2>

            <p className="text-sm max-w-[280px] mb-4" style={{ color: 'var(--text-secondary)' }}>
              You cancelled this payment. No money has been deducted.
            </p>

            <div className="flex gap-3 mt-2">
              <motion.button
                onClick={onRetry}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-5 py-2.5 rounded-xl text-sm font-medium"
                style={{
                  backgroundColor: 'var(--accent-champagne)',
                  color: 'var(--text-inverse)',
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
              className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
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
                color: 'var(--text-inverse)',
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
