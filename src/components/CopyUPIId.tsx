'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { copyToClipboard } from '@/lib/utils';
import { PAYMENT_CONFIG } from '@/lib/config';

export default function CopyUPIId() {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    const success = await copyToClipboard(PAYMENT_CONFIG.payee.upiId);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, []);

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl"
      style={{
        backgroundColor: 'var(--bg-elevated)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-[11px] uppercase tracking-wider font-medium" style={{ color: 'var(--text-tertiary)' }}>
          UPI ID
        </span>
        <span className="text-sm font-mono truncate" style={{ color: 'var(--text-secondary)' }}>
          {PAYMENT_CONFIG.payee.upiId}
        </span>
      </div>

      <motion.button
        onClick={handleCopy}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
        style={{
          backgroundColor: copied ? 'var(--success-subtle)' : 'rgba(255,255,255,0.05)',
          color: copied ? 'var(--success)' : 'var(--text-secondary)',
          border: `1px solid ${copied ? 'rgba(52, 168, 83, 0.2)' : 'var(--border-subtle)'}`,
        }}
        aria-label={copied ? 'UPI ID copied' : 'Copy UPI ID'}
      >
        <AnimatePresence mode="wait">
          {copied ? (
            <motion.span
              key="check"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-1"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 7.5L5.5 10L11 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Copied
            </motion.span>
          ) : (
            <motion.span
              key="copy"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-1"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="4.5" y="4.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                <path d="M9.5 4.5V3a1.5 1.5 0 0 0-1.5-1.5H3A1.5 1.5 0 0 0 1.5 3v5A1.5 1.5 0 0 0 3 9.5h1.5" stroke="currentColor" strokeWidth="1.2" />
              </svg>
              Copy
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
