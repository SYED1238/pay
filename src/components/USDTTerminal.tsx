'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'qrcode';
import { USDT_CONFIG } from '@/lib/config';
import { copyToClipboard } from '@/lib/utils';

export default function USDTTerminal() {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(true);
  const [amount, setAmount] = useState<string>('100');
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  // Generate QR code for TRON address
  useEffect(() => {
    // Standard TRON payment URI or plain address
    const uri = USDT_CONFIG.address;
    QRCode.toDataURL(uri, {
      width: 240,
      margin: 1,
      color: {
        dark: '#16181D',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Failed to generate USDT QR', err));
  }, []);

  const handleCopy = useCallback(async () => {
    const success = await copyToClipboard(USDT_CONFIG.address);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  }, []);

  const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^0-9.]/g, '');
    const parts = val.split('.');
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > 2) return;
    if (val.length > 1 && val[0] === '0' && val[1] !== '.') {
      val = val.substring(1);
    }
    setAmount(val);
  }, []);

  return (
    <div className="space-y-5">
      {/* Route Badge & Header */}
      <div className="flex items-center justify-between">
        <div>
          <span
            className="text-[10px] uppercase tracking-[0.2em] font-medium block"
            style={{ color: 'var(--accent-champagne)' }}
          >
            Cryptocurrency
          </span>
          <h2 className="text-lg font-medium tracking-tight mt-0.5" style={{ color: 'var(--text-primary)' }}>
            Pay with USDT
          </h2>
        </div>

        {/* Network Badge (Unmistakable TRON / TRC20) */}
        <div
          className="px-3 py-1.5 rounded-full flex items-center gap-1.5"
          style={{
            backgroundColor: 'rgba(52, 211, 153, 0.12)',
            border: '1px solid rgba(52, 211, 153, 0.25)',
          }}
        >
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#34D399' }} />
          <span className="text-[11px] font-semibold tracking-wider uppercase text-emerald-400">
            {USDT_CONFIG.networkCode}
          </span>
        </div>
      </div>

      {/* Optional Amount Input */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs uppercase tracking-wider font-medium" style={{ color: 'var(--text-tertiary)' }}>
            Target Amount (Optional)
          </span>
          {amount && (
            <span className="text-xs font-mono font-medium" style={{ color: 'var(--accent-champagne)' }}>
              Send {amount} USDT
            </span>
          )}
        </div>

        <div className="relative flex items-center">
          <input
            type="text"
            inputMode="decimal"
            placeholder="Enter amount"
            value={amount}
            onChange={handleAmountChange}
            aria-label="USDT payment amount"
            className="w-full py-2.5 px-3.5 rounded-xl text-sm font-mono tabular-nums outline-none transition-colors"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
            }}
          />
          <span
            className="absolute right-3.5 text-xs font-semibold tracking-wider uppercase pointer-events-none"
            style={{ color: 'var(--text-tertiary)' }}
          >
            USDT
          </span>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {USDT_CONFIG.quickAmounts.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setAmount(preset.toString())}
              className="px-3 py-1 rounded-lg text-xs font-mono tabular-nums transition-colors"
              style={{
                backgroundColor:
                  amount === preset.toString() ? 'var(--accent-champagne-subtle)' : 'var(--bg-elevated)',
                color: amount === preset.toString() ? 'var(--accent-champagne)' : 'var(--text-tertiary)',
                border: `1px solid ${
                  amount === preset.toString() ? 'var(--accent-champagne)' : 'var(--border-subtle)'
                }`,
              }}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* QR Code Section (Clearly labeled USDT - TRON TRC20) */}
      <div className="text-center">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs uppercase tracking-wider font-medium" style={{ color: 'var(--text-tertiary)' }}>
            USDT — TRON (TRC20)
          </span>
          <button
            type="button"
            onClick={() => setShowQR((prev) => !prev)}
            className="text-xs font-medium transition-colors"
            style={{ color: 'var(--accent-champagne)' }}
          >
            {showQR ? 'Hide QR' : 'Show QR'}
          </button>
        </div>

        <AnimatePresence>
          {showQR && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="p-3.5 rounded-2xl bg-white shadow-sm inline-block mx-auto mb-1">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="USDT TRON TRC20 Receiving Address QR Code"
                    width={200}
                    height={200}
                    className="rounded-lg block"
                    style={{ imageRendering: 'pixelated' }}
                  />
                ) : (
                  <div className="w-[200px] h-[200px] flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full border-2 border-slate-700 border-t-transparent animate-spin" />
                  </div>
                )}
              </div>
              <p className="text-[11px] mt-1" style={{ color: 'var(--text-tertiary)' }}>
                Scan with your TRON-compatible wallet (Trust Wallet, Binance, TronLink, OKX)
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Receiving Address Display & 1-Click Copy */}
      <div
        className="p-3.5 rounded-xl space-y-2 text-left"
        style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider font-medium" style={{ color: 'var(--text-tertiary)' }}>
            Receiving Address (TRC20)
          </span>
          <span className="text-[10px] font-medium" style={{ color: 'var(--accent-champagne)' }}>
            Syed Hamza
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-black/20 break-all select-all font-mono text-xs leading-relaxed" style={{ color: 'var(--text-primary)' }}>
          {USDT_CONFIG.address}
        </div>

        <motion.button
          onClick={handleCopy}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="w-full py-2.5 px-4 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          style={{
            backgroundColor: copied ? 'var(--success-subtle)' : 'var(--bg-surface)',
            color: copied ? 'var(--success)' : 'var(--text-primary)',
            border: `1px solid ${copied ? 'var(--success)' : 'var(--border-subtle)'}`,
          }}
          aria-label={copied ? 'USDT Address Copied' : 'Copy USDT Address'}
        >
          <AnimatePresence mode="wait">
            {copied ? (
              <motion.span
                key="copied"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1.5"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 7.5L5.5 10L11 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Address Copied to Clipboard
              </motion.span>
            ) : (
              <motion.span
                key="copy"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1.5"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="4.5" y="4.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M9.5 4.5V3a1.5 1.5 0 0 0-1.5-1.5H3A1.5 1.5 0 0 0 1.5 3v5A1.5 1.5 0 0 0 3 9.5h1.5" stroke="currentColor" strokeWidth="1.2" />
                </svg>
                Copy Receiving Address
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Critical Network Warning (Requirement 13) */}
      <div
        className="p-3.5 rounded-xl text-left border"
        style={{
          backgroundColor: 'rgba(251, 191, 36, 0.08)',
          borderColor: 'rgba(251, 191, 36, 0.25)',
        }}
      >
        <div className="flex items-start gap-2.5">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#FBBF24"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="flex-shrink-0 mt-0.5"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <div className="space-y-1">
            <p className="text-xs font-semibold text-amber-300">
              Network Requirement: TRON (TRC20)
            </p>
            <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Only send USDT via the <strong>TRON / TRC20</strong> network to this address. Making a transfer using any other network (such as Ethereum ERC20, BSC, or Solana) will result in permanent loss.
            </p>
          </div>
        </div>
      </div>

      {/* Truthful Blockchain Verification Note (Requirement 15 & 16) */}
      <div
        className="p-3 rounded-xl text-left"
        style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
      >
        <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
          Payment verification is not automatic yet. Transfers settle on the TRON blockchain directly to Syed Hamza.
        </p>
      </div>
    </div>
  );
}
