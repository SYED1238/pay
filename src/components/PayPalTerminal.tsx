'use client';

import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { PAYPAL_CONFIG } from '@/lib/config';
import { PayPalCurrency } from '@/lib/types';
import { generatePayPalUrl, validateAmount } from '@/lib/utils';

export default function PayPalTerminal() {
  const [currency, setCurrency] = useState<PayPalCurrency>(PAYPAL_CONFIG.defaultCurrency);
  const [amount, setAmount] = useState<string>('50');
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedCurrencyConfig =
    PAYPAL_CONFIG.supportedCurrencies.find((c) => c.code === currency) ||
    PAYPAL_CONFIG.supportedCurrencies[0];

  const validAmount = validateAmount(amount);
  const payPalUrl = generatePayPalUrl(validAmount, currency);

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
    <div className="space-y-6">
      {/* Route Badge & Header */}
      <div className="flex items-center justify-between">
        <div>
          <span
            className="text-[10px] uppercase tracking-[0.2em] font-medium block"
            style={{ color: 'var(--accent-champagne)' }}
          >
            International Payments
          </span>
          <h2 className="text-lg font-medium tracking-tight mt-0.5" style={{ color: 'var(--text-primary)' }}>
            Pay with PayPal
          </h2>
        </div>

        {/* PayPal Icon Badge */}
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
          aria-hidden="true"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 2.893a.855.855 0 0 1 .843-.72h7.026c2.317 0 4.09.526 5.127 1.522.955.918 1.343 2.27 1.125 3.911-.476 3.585-2.85 5.565-6.867 5.565H9.68a.855.855 0 0 0-.844.72l-1.76 7.446z"
              fill="#0079C1"
            />
            <path
              d="M9.68 13.171h2.518c4.017 0 6.391-1.98 6.867-5.565.218-1.64-.17-2.993-1.125-3.911C16.903 2.699 15.13 2.173 12.813 2.173H5.787a.855.855 0 0 0-.843.72L2.837 16.398a.641.641 0 0 0 .633.74h3.693l.972-4.117a.855.855 0 0 1 .845-.72v.87z"
              fill="#00457C"
            />
            <path
              d="M8.835 17.221l.973-4.117a.855.855 0 0 1 .844-.72h2.518c3.515 0 5.86-1.517 6.643-4.66.195.93.18 1.942-.047 2.94-.654 2.87-2.915 4.887-6.596 4.887H10.65a.855.855 0 0 0-.844.72l-1.637 6.924a.641.641 0 0 1-.633.74H4.55l1.62-6.85a.855.855 0 0 1 .844-.72h1.821v-.144z"
              fill="#0079C1"
            />
          </svg>
        </div>
      </div>

      {/* Currency Selector */}
      <div>
        <p className="text-xs uppercase tracking-wider font-medium mb-2" style={{ color: 'var(--text-tertiary)' }}>
          Select Currency
        </p>
        <div className="grid grid-cols-5 gap-1.5 p-1 rounded-xl" style={{ backgroundColor: 'var(--bg-elevated)' }}>
          {PAYPAL_CONFIG.supportedCurrencies.map((c) => {
            const isSelected = currency === c.code;
            return (
              <button
                key={c.code}
                type="button"
                onClick={() => setCurrency(c.code)}
                className="py-1.5 px-2 rounded-lg text-xs font-medium transition-all relative"
                style={{
                  color: isSelected ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  backgroundColor: isSelected ? 'var(--bg-surface)' : 'transparent',
                  boxShadow: isSelected ? '0 2px 8px rgba(0, 0, 0, 0.2)' : 'none',
                }}
              >
                {c.code}
              </button>
            );
          })}
        </div>
      </div>

      {/* Amount Display & Input */}
      <div className="space-y-4">
        <div
          className="flex items-center justify-center cursor-text py-2"
          onClick={() => inputRef.current?.focus()}
          role="button"
          tabIndex={-1}
        >
          <span
            className="amount-display text-4xl sm:text-5xl mr-1 font-light"
            style={{ color: 'var(--text-tertiary)' }}
          >
            {selectedCurrencyConfig.symbol}
          </span>
          <input
            ref={inputRef}
            type="text"
            inputMode="decimal"
            placeholder="0"
            value={amount}
            onChange={handleAmountChange}
            aria-label={`Amount in ${selectedCurrencyConfig.name}`}
            className="amount-display text-4xl sm:text-5xl bg-transparent border-none outline-none text-center w-[180px] sm:w-[220px]"
            style={{ color: 'var(--text-primary)', caretColor: 'var(--accent-champagne)' }}
          />
        </div>

        {/* Quick Amount Chips */}
        <div className="flex flex-wrap justify-center gap-1.5">
          {PAYPAL_CONFIG.quickAmounts.map((preset) => (
            <motion.button
              key={preset}
              type="button"
              onClick={() => setAmount(preset.toString())}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="px-3.5 py-1.5 rounded-full text-xs tabular-nums transition-colors"
              style={{
                backgroundColor:
                  amount === preset.toString() ? 'var(--accent-champagne-subtle)' : 'var(--bg-elevated)',
                color: amount === preset.toString() ? 'var(--accent-champagne)' : 'var(--text-secondary)',
                border: `1px solid ${
                  amount === preset.toString() ? 'var(--accent-champagne)' : 'var(--border-subtle)'
                }`,
              }}
            >
              {selectedCurrencyConfig.symbol}
              {preset}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Recipient Details & Profile Link */}
      <div
        className="px-4 py-3 rounded-xl flex items-center justify-between"
        style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
      >
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider font-medium" style={{ color: 'var(--text-tertiary)' }}>
            Recipient PayPal
          </span>
          <span className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
            @{PAYPAL_CONFIG.username}
          </span>
        </div>
        <span className="text-[11px] font-medium" style={{ color: 'var(--accent-champagne)' }}>
          Syed Hamza
        </span>
      </div>

      {/* Primary Action Button */}
      <div>
        <motion.a
          href={payPalUrl}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.985 }}
          className="w-full py-4 px-5 rounded-2xl font-semibold text-[15px] flex items-center justify-center gap-2.5 transition-all block text-center"
          style={{
            backgroundColor: 'var(--accent-champagne)',
            color: 'var(--text-inverse)',
            boxShadow: '0 4px 16px -2px rgba(0, 0, 0, 0.25)',
          }}
        >
          <span>
            {validAmount && validAmount > 0
              ? `Pay ${selectedCurrencyConfig.symbol}${validAmount} with PayPal`
              : 'Pay internationally with PayPal'}
          </span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M7 17L17 7M17 7H7M17 7V17" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.a>
        <p className="text-[11px] text-center mt-2 leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
          Opens the official PayPal.Me transfer page in a new window
        </p>
      </div>

      {/* Truthful Trust / Status Notice */}
      <div
        className="p-3.5 rounded-xl text-left"
        style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
      >
        <div className="flex items-start gap-2">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text-tertiary)"
            strokeWidth="2"
            className="flex-shrink-0 mt-0.5"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Transactions complete securely inside PayPal. Opening PayPal does not mark the payment as completed until verified.
          </p>
        </div>
      </div>
    </div>
  );
}
