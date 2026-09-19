'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BANK_TRANSFER_CONFIG, PAYMENT_CONFIG } from '@/lib/config';
import { copyToClipboard, formatAmount, validateAmount, detectDevice } from '@/lib/utils';
import { DeviceInfo } from '@/lib/types';

interface BankTransferTerminalProps {
  initialAmount?: number | null;
  device?: DeviceInfo;
  onBack?: () => void;
}

interface BankingAppConfig {
  id: string;
  name: string;
  packageName: string;
  scheme: string;
  intentUrl: string;
  color: string;
  fallbackMsg: string;
}

const BANKING_APPS: BankingAppConfig[] = [
  {
    id: 'googlepay',
    name: 'Google Pay',
    packageName: 'com.google.android.apps.nbu.paisa.user',
    scheme: 'tez://',
    intentUrl:
      'intent:#Intent;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;package=com.google.android.apps.nbu.paisa.user;end',
    color: '#4285F4',
    fallbackMsg: "Google Pay couldn't be opened. Please open Google Pay manually and choose Bank Transfer.",
  },
  {
    id: 'phonepe',
    name: 'PhonePe',
    packageName: 'com.phonepe.app',
    scheme: 'phonepe://',
    intentUrl:
      'intent:#Intent;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;package=com.phonepe.app;end',
    color: '#5F259F',
    fallbackMsg: "PhonePe couldn't be opened. Please open PhonePe manually and choose Bank Transfer.",
  },
  {
    id: 'paytm',
    name: 'Paytm',
    packageName: 'net.one97.paytm',
    scheme: 'paytmmp://',
    intentUrl:
      'intent:#Intent;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;package=net.one97.paytm;end',
    color: '#00BAF2',
    fallbackMsg: "Paytm couldn't be opened. Please open Paytm manually and choose Bank Transfer.",
  },
  {
    id: 'bhim',
    name: 'BHIM',
    packageName: 'in.org.npci.upiapp',
    scheme: 'bhim://',
    intentUrl:
      'intent:#Intent;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;package=in.org.npci.upiapp;end',
    color: '#007A3D',
    fallbackMsg: "BHIM couldn't be opened. Please open BHIM manually and choose Bank Transfer.",
  },
];

export default function BankTransferTerminal({ initialAmount, device: propDevice, onBack }: BankTransferTerminalProps) {
  const [device, setDevice] = useState<DeviceInfo>(() => propDevice || detectDevice());
  const [amount, setAmount] = useState<string>(
    initialAmount && initialAmount > 0 ? initialAmount.toString() : '500'
  );
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [utrSaved, setUtrSaved] = useState(false);
  const [launchingAppId, setLaunchingAppId] = useState<string | null>(null);
  const [modalApp, setModalApp] = useState<BankingAppConfig | null>(null);
  const [modalIsDesktop, setModalIsDesktop] = useState(false);

  const detailsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (propDevice) {
      setDevice(propDevice);
    } else {
      setDevice(detectDevice());
    }
  }, [propDevice]);

  const validAmount = validateAmount(amount);

  const handleCopy = useCallback(async (field: string, text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedField(field);
      setTimeout(() => {
        setCopiedField((curr) => (curr === field ? null : curr));
      }, 2200);
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

  const handleScrollToDetails = useCallback(() => {
    if (detailsRef.current) {
      detailsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  // Attempt to launch banking app or show graceful fallback
  const attemptLaunch = useCallback((app: BankingAppConfig) => {
    setLaunchingAppId(app.id);
    let appOpened = false;

    const onVisibilityChange = () => {
      if (document.hidden || document.visibilityState === 'hidden') {
        appOpened = true;
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('blur', onVisibilityChange);

    // Try intent URL first
    try {
      window.location.href = app.intentUrl;
    } catch {
      // Fall back to custom scheme
      try {
        window.location.href = app.scheme;
      } catch {
        // Handled by timer below
      }
    }

    // Secondary attempt with custom scheme if not yet hidden
    const secondaryTimer = setTimeout(() => {
      if (!appOpened && document.visibilityState === 'visible') {
        try {
          window.location.href = app.scheme;
        } catch {
          // ignore
        }
      }
    }, 450);

    // Final check after 1350ms: if page is still visible, app failed to open or was blocked
    const fallbackTimer = setTimeout(() => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('blur', onVisibilityChange);
      setLaunchingAppId(null);

      if (!appOpened && document.visibilityState === 'visible') {
        setModalApp(app);
        setModalIsDesktop(false);
      }
    }, 1350);

    return () => {
      clearTimeout(secondaryTimer);
      clearTimeout(fallbackTimer);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('blur', onVisibilityChange);
    };
  }, []);

  const handleAppClick = useCallback(
    (app: BankingAppConfig) => {
      // Desktop behavior per Requirement 7: Don't attempt unreliable app launching
      if (!device.isMobile && !device.isAndroid) {
        setModalApp(app);
        setModalIsDesktop(true);
        return;
      }

      // Android / Mobile behavior per Requirement 1-6
      attemptLaunch(app);
    },
    [device, attemptLaunch]
  );

  return (
    <div className="space-y-6 relative">
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <span
            className="text-[10px] uppercase tracking-[0.2em] font-medium block"
            style={{ color: 'var(--accent-champagne)' }}
          >
            Direct Account Transfer
          </span>
          <h2 className="text-lg font-medium tracking-tight mt-0.5" style={{ color: 'var(--text-primary)' }}>
            Direct Bank Transfer
          </h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
            Transfer directly to our bank account
          </p>
        </div>

        {/* Bank Icon Badge */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
          aria-hidden="true"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-champagne)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 21h18M3 10h18M5 10v11M9 10v11M15 10v11M19 10v11M12 2L2 7h20L12 2z"/>
          </svg>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!isCompleted ? (
          <motion.div
            key="bank-flow"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* ── Prominent Exact Amount Display & Input ────────────── */}
            <div
              className="p-4 rounded-2xl text-center relative overflow-hidden"
              style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
            >
              <div className="text-[11px] uppercase tracking-wider font-medium mb-1.5" style={{ color: 'var(--text-tertiary)' }}>
                Exact Payment Amount to Transfer
              </div>

              <div
                className="flex items-center justify-center cursor-text py-1"
                onClick={() => inputRef.current?.focus()}
                role="button"
                tabIndex={-1}
              >
                <span className="amount-display text-4xl sm:text-5xl mr-1 font-light" style={{ color: 'var(--text-tertiary)' }}>
                  {PAYMENT_CONFIG.currencySymbol}
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  inputMode="decimal"
                  placeholder="0"
                  value={amount}
                  onChange={handleAmountChange}
                  aria-label="Bank transfer amount in INR"
                  className="amount-display text-4xl sm:text-5xl bg-transparent border-none outline-none text-center w-[180px] sm:w-[220px]"
                  style={{ color: 'var(--text-primary)', caretColor: 'var(--accent-champagne)' }}
                />
              </div>

              {/* Quick Amount Chips */}
              <div className="flex flex-wrap justify-center gap-1.5 mt-3 pt-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                {BANK_TRANSFER_CONFIG.quickAmounts.map((preset) => (
                  <motion.button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(preset.toString())}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-3 py-1 rounded-full text-xs tabular-nums transition-colors cursor-pointer"
                    style={{
                      backgroundColor:
                        amount === preset.toString() ? 'var(--accent-champagne-subtle)' : 'var(--bg-surface)',
                      color: amount === preset.toString() ? 'var(--accent-champagne)' : 'var(--text-secondary)',
                      border: `1px solid ${
                        amount === preset.toString() ? 'var(--accent-champagne)' : 'var(--border-subtle)'
                      }`,
                    }}
                  >
                    ₹{preset}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* ── Prominent Action Button: Pay via Bank Transfer ─────── */}
            <div>
              <motion.button
                type="button"
                onClick={handleScrollToDetails}
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                className="w-full py-4 px-5 rounded-2xl font-semibold text-[15px] flex items-center justify-center gap-2.5 transition-all relative overflow-hidden cursor-pointer"
                style={{
                  backgroundColor: 'var(--accent-champagne)',
                  color: 'var(--text-inverse)',
                  boxShadow: '0 4px 16px -2px rgba(0, 0, 0, 0.25)',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 21h18M3 10h18M5 10v11M9 10v11M15 10v11M19 10v11M12 2L2 7h20L12 2z"/>
                </svg>
                <span>
                  {validAmount && validAmount > 0
                    ? `Pay ${formatAmount(validAmount)} via Bank Transfer`
                    : 'Pay via Bank Transfer'}
                </span>
              </motion.button>
              <p className="text-[11px] text-center mt-1.5" style={{ color: 'var(--text-tertiary)' }}>
                Transfer using Google Pay, PhonePe, Paytm, BHIM, or Net Banking
              </p>
            </div>

            {/* ── Bank Details Card with 1-Click Copy Buttons ───────── */}
            <div
              ref={detailsRef}
              className="p-4 rounded-2xl space-y-3.5 scroll-mt-4"
              style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
            >
              <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                <span className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: 'var(--accent-champagne)' }}>
                  Bank Account Details
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md" style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-secondary)' }}>
                  IMPS / NEFT / RTGS
                </span>
              </div>

              {/* 1. Account Holder Name */}
              <div className="flex items-center justify-between p-2.5 rounded-xl transition-colors" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                <div className="min-w-0 pr-2">
                  <span className="text-[10px] uppercase tracking-wider font-medium block" style={{ color: 'var(--text-tertiary)' }}>
                    Account Name
                  </span>
                  <span className="text-xs sm:text-sm font-semibold tracking-wide truncate block" style={{ color: 'var(--text-primary)' }}>
                    {BANK_TRANSFER_CONFIG.accountHolderName}
                  </span>
                </div>
                <motion.button
                  type="button"
                  onClick={() => handleCopy('name', BANK_TRANSFER_CONFIG.accountHolderName)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors flex-shrink-0 cursor-pointer"
                  style={{
                    backgroundColor: copiedField === 'name' ? 'var(--success-subtle)' : 'var(--bg-elevated)',
                    color: copiedField === 'name' ? 'var(--success)' : 'var(--accent-champagne)',
                    border: `1px solid ${copiedField === 'name' ? 'var(--success)' : 'var(--border-subtle)'}`,
                  }}
                  aria-label="Copy Account Name"
                >
                  {copiedField === 'name' ? (
                    <>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2.5 6.5L4.5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                        <rect x="4.5" y="4.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                        <path d="M9.5 4.5V3a1.5 1.5 0 0 0-1.5-1.5H3A1.5 1.5 0 0 0 1.5 3v5A1.5 1.5 0 0 0 3 9.5h1.5" stroke="currentColor" strokeWidth="1.2" />
                      </svg>
                      <span>Copy</span>
                    </>
                  )}
                </motion.button>
              </div>

              {/* 2. Account Number */}
              <div className="flex items-center justify-between p-2.5 rounded-xl transition-colors" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                <div className="min-w-0 pr-2">
                  <span className="text-[10px] uppercase tracking-wider font-medium block" style={{ color: 'var(--text-tertiary)' }}>
                    Account Number
                  </span>
                  <span className="text-sm sm:text-base font-mono font-bold tracking-wider select-all block" style={{ color: 'var(--text-primary)' }}>
                    {BANK_TRANSFER_CONFIG.accountNumber}
                  </span>
                </div>
                <motion.button
                  type="button"
                  onClick={() => handleCopy('account', BANK_TRANSFER_CONFIG.accountNumber)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors flex-shrink-0 cursor-pointer"
                  style={{
                    backgroundColor: copiedField === 'account' ? 'var(--success-subtle)' : 'var(--bg-elevated)',
                    color: copiedField === 'account' ? 'var(--success)' : 'var(--accent-champagne)',
                    border: `1px solid ${copiedField === 'account' ? 'var(--success)' : 'var(--border-subtle)'}`,
                  }}
                  aria-label="Copy Account Number"
                >
                  {copiedField === 'account' ? (
                    <>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2.5 6.5L4.5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                        <rect x="4.5" y="4.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                        <path d="M9.5 4.5V3a1.5 1.5 0 0 0-1.5-1.5H3A1.5 1.5 0 0 0 1.5 3v5A1.5 1.5 0 0 0 3 9.5h1.5" stroke="currentColor" strokeWidth="1.2" />
                      </svg>
                      <span>Copy</span>
                    </>
                  )}
                </motion.button>
              </div>

              {/* 3. IFSC Code */}
              <div className="flex items-center justify-between p-2.5 rounded-xl transition-colors" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                <div className="min-w-0 pr-2">
                  <span className="text-[10px] uppercase tracking-wider font-medium block" style={{ color: 'var(--text-tertiary)' }}>
                    IFSC Code
                  </span>
                  <span className="text-sm sm:text-base font-mono font-bold tracking-wider select-all block" style={{ color: 'var(--text-primary)' }}>
                    {BANK_TRANSFER_CONFIG.ifsc}
                  </span>
                </div>
                <motion.button
                  type="button"
                  onClick={() => handleCopy('ifsc', BANK_TRANSFER_CONFIG.ifsc)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors flex-shrink-0 cursor-pointer"
                  style={{
                    backgroundColor: copiedField === 'ifsc' ? 'var(--success-subtle)' : 'var(--bg-elevated)',
                    color: copiedField === 'ifsc' ? 'var(--success)' : 'var(--accent-champagne)',
                    border: `1px solid ${copiedField === 'ifsc' ? 'var(--success)' : 'var(--border-subtle)'}`,
                  }}
                  aria-label="Copy IFSC Code"
                >
                  {copiedField === 'ifsc' ? (
                    <>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2.5 6.5L4.5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                        <rect x="4.5" y="4.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                        <path d="M9.5 4.5V3a1.5 1.5 0 0 0-1.5-1.5H3A1.5 1.5 0 0 0 1.5 3v5A1.5 1.5 0 0 0 3 9.5h1.5" stroke="currentColor" strokeWidth="1.2" />
                      </svg>
                      <span>Copy</span>
                    </>
                  )}
                </motion.button>
              </div>

              {/* 4. Bank & Branch Details */}
              <div className="p-2.5 rounded-xl text-left" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                <span className="text-[10px] uppercase tracking-wider font-medium block" style={{ color: 'var(--text-tertiary)' }}>
                  Bank & Branch
                </span>
                <span className="text-xs font-medium block mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                  {BANK_TRANSFER_CONFIG.bankName} — {BANK_TRANSFER_CONFIG.branch}
                </span>
              </div>
            </div>

            {/* ── Functional Mobile Banking/UPI App Buttons (Requirement 1-6) ── */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase tracking-wider font-medium" style={{ color: 'var(--text-tertiary)' }}>
                  Open your preferred app
                </span>
                <span className="text-[11px]" style={{ color: 'var(--accent-champagne)' }}>
                  Choose &quot;Bank Transfer&quot;
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {BANKING_APPS.map((app) => {
                  const isLaunching = launchingAppId === app.id;
                  return (
                    <motion.button
                      key={app.id}
                      type="button"
                      onClick={() => handleAppClick(app)}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.96 }}
                      disabled={isLaunching}
                      className="p-2.5 rounded-xl flex flex-col items-center justify-center text-center transition-all cursor-pointer relative overflow-hidden"
                      style={{
                        backgroundColor: isLaunching ? 'rgba(201, 169, 110, 0.1)' : 'var(--bg-elevated)',
                        border: `1px solid ${isLaunching ? 'var(--accent-champagne)' : 'var(--border-subtle)'}`,
                      }}
                      title={`Open ${app.name} to choose Bank Transfer`}
                    >
                      {isLaunching ? (
                        <div className="w-2.5 h-2.5 rounded-full border border-current border-t-transparent animate-spin mb-1" style={{ color: 'var(--accent-champagne)' }} />
                      ) : (
                        <span className="w-2.5 h-2.5 rounded-full mb-1" style={{ backgroundColor: app.color }} />
                      )}
                      <span className="text-[11px] font-semibold leading-tight block" style={{ color: 'var(--text-primary)' }}>
                        {app.name}
                      </span>
                      <span className="text-[8px] uppercase tracking-wider mt-0.5" style={{ color: isLaunching ? 'var(--accent-champagne)' : 'var(--text-tertiary)' }}>
                        {isLaunching ? 'Opening…' : 'Transfer'}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
              <p className="text-[10px] text-center mt-1.5" style={{ color: 'var(--text-tertiary)' }}>
                Tapping attempts to launch your app. Inside, choose &quot;To Bank Account&quot; &amp; paste details.
              </p>
            </div>

            {/* ── Step-by-Step Bank Transfer Guide (Requirement 7) ────── */}
            <div
              className="p-4 rounded-2xl text-left space-y-3"
              style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
            >
              <div className="flex items-center gap-2 pb-1">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--accent-champagne)' }} />
                <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
                  How to Transfer in 7 Simple Steps
                </h3>
              </div>

              <ol className="space-y-2.5 text-xs">
                {[
                  { step: 1, text: 'Copy the Account Number above' },
                  { step: 2, text: 'Copy the IFSC code above' },
                  { step: 3, text: 'Open Google Pay / PhonePe / Paytm / your banking app' },
                  { step: 4, text: 'Choose "Bank Transfer" or "To Bank Account"' },
                  { step: 5, text: 'Enter the account number and IFSC' },
                  {
                    step: 6,
                    text: validAmount
                      ? `Enter the exact order amount (${formatAmount(validAmount)})`
                      : 'Enter the exact order amount',
                  },
                  { step: 7, text: 'Complete the transfer via IMPS/NEFT' },
                ].map((item) => (
                  <li key={item.step} className="flex items-start gap-2.5">
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5"
                      style={{
                        backgroundColor: 'var(--bg-surface)',
                        color: 'var(--accent-champagne)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      {item.step}
                    </span>
                    <span className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {item.text}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            {/* ── Reference ID Retention Notice (Requirement 9) ───────── */}
            <div
              className="p-3.5 rounded-xl text-left border"
              style={{
                backgroundColor: 'rgba(201, 169, 110, 0.08)',
                borderColor: 'rgba(201, 169, 110, 0.25)',
              }}
            >
              <div className="flex items-start gap-2.5">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--accent-champagne)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="flex-shrink-0 mt-0.5"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold" style={{ color: 'var(--accent-champagne)' }}>
                    Keep your Reference / UTR ID
                  </p>
                  <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    After completing the transfer, keep your transaction/reference ID for verification.
                  </p>
                </div>
              </div>
            </div>

            {/* ── Confirmation Button: I've completed the bank transfer ── */}
            <div>
              <motion.button
                type="button"
                onClick={() => setIsCompleted(true)}
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                className="w-full py-3.5 px-4 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <path d="M3.5 7.5L6.5 10.5L11.5 4.5" stroke="var(--accent-champagne)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>I&apos;ve completed the bank transfer</span>
              </motion.button>
            </div>

            {/* ── Security Reassurance ───────────────── */}
            <div className="pt-1 text-center">
              <p className="text-[10px] leading-relaxed max-w-[340px] mx-auto" style={{ color: 'var(--text-tertiary)' }}>
                🔒 Security Notice: We never ask for your UPI PIN, OTP, debit card details, CVV, password, or banking login credentials.
              </p>
            </div>

            {/* Back to previous option if requested */}
            {onBack && (
              <div className="flex justify-center pt-1">
                <button
                  type="button"
                  onClick={onBack}
                  className="text-xs py-1.5 px-3 rounded-lg transition-colors cursor-pointer"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  ← Back to options
                </button>
              </div>
            )}
          </motion.div>
        ) : (
          /* ── Honest "Awaiting Verification" State ─ */
          <motion.div
            key="bank-submitted"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.3 }}
            className="space-y-5 text-center"
          >
            {/* Status Icon */}
            <div className="flex justify-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center relative"
                style={{ backgroundColor: 'rgba(201, 169, 110, 0.12)', border: '1px solid rgba(201, 169, 110, 0.3)' }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent-champagne)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] font-semibold block" style={{ color: 'var(--accent-champagne)' }}>
                Transfer Submitted
              </span>
              <h3 className="text-xl font-semibold tracking-tight mt-1" style={{ color: 'var(--text-primary)' }}>
                Awaiting Bank Verification
              </h3>
              <p className="text-xs mt-1.5 leading-relaxed max-w-[320px] mx-auto" style={{ color: 'var(--text-secondary)' }}>
                Thank you. Your direct bank transfer has been submitted. The payment will be confirmed once credited and verified by admin.
              </p>
            </div>

            {/* Transfer Summary Card */}
            <div
              className="p-4 rounded-2xl text-left space-y-2.5"
              style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
            >
              <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Amount Transferred</span>
                <span className="text-sm font-semibold font-mono" style={{ color: 'var(--text-primary)' }}>
                  {validAmount ? formatAmount(validAmount) : `₹${amount}`}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span style={{ color: 'var(--text-tertiary)' }}>Beneficiary</span>
                <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {BANK_TRANSFER_CONFIG.accountHolderName}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span style={{ color: 'var(--text-tertiary)' }}>Bank Account</span>
                <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>
                  •••• •••• {BANK_TRANSFER_CONFIG.accountNumber.slice(-4)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span style={{ color: 'var(--text-tertiary)' }}>Verification Status</span>
                <span className="font-semibold px-2 py-0.5 rounded text-[11px]" style={{ backgroundColor: 'rgba(201, 169, 110, 0.15)', color: 'var(--accent-champagne)' }}>
                  Pending Verification
                </span>
              </div>
            </div>

            {/* Optional UTR / Reference ID submission */}
            <div
              className="p-3.5 rounded-xl text-left space-y-2"
              style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                  Transaction UTR / Reference (Optional)
                </span>
                {utrSaved && (
                  <span className="text-[10px] font-medium text-emerald-400">
                    ✓ Recorded
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. 425619384729"
                  value={utrNumber}
                  onChange={(e) => {
                    setUtrNumber(e.target.value);
                    setUtrSaved(false);
                  }}
                  className="flex-1 py-2 px-3 rounded-lg text-xs font-mono outline-none"
                  style={{
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (utrNumber.trim()) {
                      setUtrSaved(true);
                    }
                  }}
                  disabled={!utrNumber.trim()}
                  className="px-3 py-2 rounded-lg text-xs font-medium disabled:opacity-40 transition-colors cursor-pointer"
                  style={{
                    backgroundColor: 'var(--accent-champagne)',
                    color: 'var(--text-inverse)',
                  }}
                >
                  Save UTR
                </button>
              </div>
              <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
                Saving your 12-digit UTR from your bank SMS speeds up confirmation.
              </p>
            </div>

            {/* Security Guarantee */}
            <div className="p-3 rounded-xl text-left" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
              <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                🔒 <strong>Security Policy:</strong> We never declare an order as paid until funds are reconciled directly in our bank account. Syed Hamza or our team will never ask for your passwords, OTP, or PIN.
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCompleted(false)}
                className="w-full py-3 px-4 rounded-xl text-xs font-medium transition-colors cursor-pointer"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                ← View Bank Transfer Details Again
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Bottom Sheet / Fallback Modal (Requirement 6 & 7) ───────── */}
      <AnimatePresence>
        {modalApp && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalApp(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
            />

            {/* Modal Sheet Container */}
            <motion.div
              initial={device.isMobile ? { y: '100%' } : { opacity: 0, scale: 0.95, y: 10 }}
              animate={device.isMobile ? { y: 0 } : { opacity: 1, scale: 1, y: 0 }}
              exit={device.isMobile ? { y: '100%' } : { opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', damping: 28, stiffness: 350 }}
              className="relative z-10 w-full max-w-md rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl overflow-hidden space-y-4 text-left max-h-[90dvh] overflow-y-auto"
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.6)',
              }}
            >
              {/* Header */}
              <div className="flex items-start justify-between pb-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                <div className="flex items-center gap-3">
                  <span className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ backgroundColor: modalApp.color }} />
                  <div>
                    <h3 className="text-base font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                      Open {modalApp.name}
                    </h3>
                    <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--accent-champagne)' }}>
                      Choose Bank Transfer / To Bank Account
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setModalApp(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                  style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}
                  aria-label="Close"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>

              {/* Status Notice / Fallback Message */}
              <div
                className="p-3 rounded-xl border text-xs leading-relaxed"
                style={{
                  backgroundColor: modalIsDesktop ? 'var(--bg-elevated)' : 'rgba(251, 191, 36, 0.08)',
                  borderColor: modalIsDesktop ? 'var(--border-subtle)' : 'rgba(251, 191, 36, 0.25)',
                  color: modalIsDesktop ? 'var(--text-secondary)' : '#FDE68A',
                }}
              >
                {modalIsDesktop ? (
                  <>
                    <p className="font-semibold text-xs mb-0.5" style={{ color: 'var(--text-primary)' }}>
                      Bank transfer is completed inside your banking app.
                    </p>
                    <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                      Open {modalApp.name} on your mobile phone, navigate to <strong>Bank Transfer / To Bank Account</strong>, and transfer to the credentials below.
                    </p>
                  </>
                ) : (
                  <p>{modalApp.fallbackMsg}</p>
                )}
              </div>

              {/* Bank Credentials Cards */}
              <div className="space-y-2.5">
                {/* Account Number */}
                <div className="flex items-center justify-between p-2.5 rounded-xl" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider block" style={{ color: 'var(--text-tertiary)' }}>
                      Account Number
                    </span>
                    <span className="text-sm font-mono font-bold tracking-wider select-all" style={{ color: 'var(--text-primary)' }}>
                      {BANK_TRANSFER_CONFIG.accountNumber}
                    </span>
                  </div>
                  <motion.button
                    type="button"
                    onClick={() => handleCopy('modal-account', BANK_TRANSFER_CONFIG.accountNumber)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    style={{
                      backgroundColor: copiedField === 'modal-account' ? 'var(--success-subtle)' : 'var(--bg-surface)',
                      color: copiedField === 'modal-account' ? 'var(--success)' : 'var(--accent-champagne)',
                      border: `1px solid ${copiedField === 'modal-account' ? 'var(--success)' : 'var(--border-subtle)'}`,
                    }}
                  >
                    {copiedField === 'modal-account' ? 'Copied' : 'Copy'}
                  </motion.button>
                </div>

                {/* IFSC Code */}
                <div className="flex items-center justify-between p-2.5 rounded-xl" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider block" style={{ color: 'var(--text-tertiary)' }}>
                      IFSC Code
                    </span>
                    <span className="text-sm font-mono font-bold tracking-wider select-all" style={{ color: 'var(--text-primary)' }}>
                      {BANK_TRANSFER_CONFIG.ifsc}
                    </span>
                  </div>
                  <motion.button
                    type="button"
                    onClick={() => handleCopy('modal-ifsc', BANK_TRANSFER_CONFIG.ifsc)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    style={{
                      backgroundColor: copiedField === 'modal-ifsc' ? 'var(--success-subtle)' : 'var(--bg-surface)',
                      color: copiedField === 'modal-ifsc' ? 'var(--success)' : 'var(--accent-champagne)',
                      border: `1px solid ${copiedField === 'modal-ifsc' ? 'var(--success)' : 'var(--border-subtle)'}`,
                    }}
                  >
                    {copiedField === 'modal-ifsc' ? 'Copied' : 'Copy'}
                  </motion.button>
                </div>

                {/* Account Name */}
                <div className="flex items-center justify-between p-2.5 rounded-xl" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider block" style={{ color: 'var(--text-tertiary)' }}>
                      Account Name
                    </span>
                    <span className="text-xs font-semibold tracking-wide" style={{ color: 'var(--text-primary)' }}>
                      {BANK_TRANSFER_CONFIG.accountHolderName}
                    </span>
                  </div>
                  <motion.button
                    type="button"
                    onClick={() => handleCopy('modal-name', BANK_TRANSFER_CONFIG.accountHolderName)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                    style={{
                      backgroundColor: copiedField === 'modal-name' ? 'var(--success-subtle)' : 'var(--bg-surface)',
                      color: copiedField === 'modal-name' ? 'var(--success)' : 'var(--accent-champagne)',
                      border: `1px solid ${copiedField === 'modal-name' ? 'var(--success)' : 'var(--border-subtle)'}`,
                    }}
                  >
                    {copiedField === 'modal-name' ? 'Copied' : 'Copy'}
                  </motion.button>
                </div>

                {/* Bank / Branch */}
                <div className="p-2.5 rounded-xl text-left" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                  <span className="text-[10px] uppercase tracking-wider block" style={{ color: 'var(--text-tertiary)' }}>
                    Bank & Branch
                  </span>
                  <span className="text-xs font-medium block mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    {BANK_TRANSFER_CONFIG.bankName} — {BANK_TRANSFER_CONFIG.branch}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                {!modalIsDesktop && (
                  <motion.button
                    type="button"
                    onClick={() => attemptLaunch(modalApp)}
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.985 }}
                    className="w-full py-3 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    style={{
                      backgroundColor: 'var(--accent-champagne)',
                      color: 'var(--text-inverse)',
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                      <polyline points="15 3 21 3 21 9"/>
                      <line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                    <span>Open App Again</span>
                  </motion.button>
                )}

                <button
                  type="button"
                  onClick={() => setModalApp(null)}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-medium transition-colors cursor-pointer text-center"
                  style={{
                    backgroundColor: 'var(--bg-elevated)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
