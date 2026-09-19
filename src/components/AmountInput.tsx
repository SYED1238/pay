'use client';

import { useState, useRef, useEffect, useCallback, type KeyboardEvent, type ClipboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { validateAmount, formatAmount } from '@/lib/utils';
import { PAYMENT_CONFIG } from '@/lib/config';

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

const QUICK_AMOUNTS = [100, 200, 500, 1000, 2000, 5000];

export default function AmountInput({ value, onChange, onSubmit, disabled }: AmountInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const validAmount = validateAmount(value);
  const hasValue = value.length > 0;
  const isValid = validAmount !== null;

  // Auto-focus on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;

    // Strip non-numeric except decimal
    newValue = newValue.replace(/[^0-9.]/g, '');

    // Prevent multiple decimals
    const decimalCount = (newValue.match(/\./g) || []).length;
    if (decimalCount > 1) return;

    // Prevent more than 2 decimal places
    const parts = newValue.split('.');
    if (parts[1] && parts[1].length > 2) return;

    // Prevent leading zeros (except for "0.")
    if (newValue.length > 1 && newValue[0] === '0' && newValue[1] !== '.') {
      newValue = newValue.substring(1);
    }

    onChange(newValue);
  }, [onChange]);

  const handlePaste = useCallback((e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text');
    // Clean pasted value — remove currency symbols, commas, spaces
    const cleaned = pasted.replace(/[₹$€,\s]/g, '');
    const validated = validateAmount(cleaned);
    if (validated !== null) {
      onChange(validated.toString());
    }
  }, [onChange]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && isValid) {
      onSubmit();
    }
  }, [isValid, onSubmit]);

  return (
    <div className="space-y-6">
      {/* Amount Display */}
      <div className="relative">
        <div
          className="flex items-center justify-center cursor-text"
          onClick={() => inputRef.current?.focus()}
          role="button"
          tabIndex={-1}
        >
          {/* Currency Symbol */}
          <motion.span
            className="amount-display text-4xl sm:text-5xl mr-1"
            style={{ color: hasValue && isValid ? 'var(--text-primary)' : 'var(--text-tertiary)' }}
            animate={{ opacity: hasValue ? 1 : 0.4 }}
            transition={{ duration: 0.15 }}
          >
            ₹
          </motion.span>

          {/* Input */}
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              inputMode="decimal"
              pattern="[0-9]*"
              aria-label="Payment amount in rupees"
              placeholder="0"
              value={value}
              onChange={handleChange}
              onPaste={handlePaste}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              disabled={disabled}
              autoComplete="off"
              className="amount-display text-4xl sm:text-5xl bg-transparent border-none outline-none text-center w-[200px] sm:w-[280px] placeholder:text-[var(--text-tertiary)]"
              style={{ color: 'var(--text-primary)', caretColor: 'var(--accent-champagne)' }}
            />

            {/* Cursor line when focused and empty */}
            <AnimatePresence>
              {isFocused && !hasValue && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[2px] h-[36px] sm:h-[44px] cursor-blink"
                  style={{ backgroundColor: 'var(--accent-champagne)' }}
                />
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Formatted amount preview */}
        <AnimatePresence>
          {hasValue && isValid && validAmount > 0 && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="text-center text-sm mt-3 tabular-nums"
              style={{ color: 'var(--text-secondary)' }}
            >
              {formatAmount(validAmount)}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Validation error */}
        <AnimatePresence>
          {hasValue && !isValid && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="text-center text-sm mt-3"
              style={{ color: 'var(--error)' }}
              role="alert"
            >
              Please enter a valid amount (minimum ₹{PAYMENT_CONFIG.amount.min})
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Quick Amount Chips */}
      <div className="flex flex-wrap justify-center gap-2">
        {QUICK_AMOUNTS.map((amount) => (
          <motion.button
            key={amount}
            onClick={() => onChange(amount.toString())}
            disabled={disabled}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="px-4 py-2 rounded-full text-sm tabular-nums transition-colors disabled:opacity-40"
            style={{
              backgroundColor: value === amount.toString() ? 'var(--accent-champagne-subtle)' : 'var(--bg-elevated)',
              color: value === amount.toString() ? 'var(--accent-champagne)' : 'var(--text-secondary)',
              border: `1px solid ${value === amount.toString() ? 'rgba(201, 169, 110, 0.2)' : 'var(--border-subtle)'}`,
            }}
            aria-label={`Set amount to ${PAYMENT_CONFIG.currencySymbol}${amount.toLocaleString('en-IN')}`}
          >
            ₹{amount.toLocaleString('en-IN')}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
