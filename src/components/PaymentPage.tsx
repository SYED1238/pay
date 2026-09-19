'use client';

import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import PaymentTerminal from './PaymentTerminal';
import { PAYMENT_CONFIG } from '@/lib/config';
import { validateAmount, detectDevice } from '@/lib/utils';
import { DeviceInfo } from '@/lib/types';
import { useState, useEffect } from 'react';

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const amountParam = searchParams.get('amount');
  const [device, setDevice] = useState<DeviceInfo>(() => detectDevice());

  // Validate URL amount parameter
  const initialAmount = amountParam && validateAmount(amountParam) !== null ? amountParam : undefined;

  useEffect(() => {
    const param = searchParams.get('device') || searchParams.get('platform');
    const update = () => setDevice(detectDevice(param));
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [searchParams]);

  const isMobileLayout = device.isMobile || (typeof window !== 'undefined' && window.innerWidth < 768);

  return (
    <div className="flex-1 flex flex-col min-h-dvh">
      {/* Mobile Layout */}
      {isMobileLayout ? (
        <div className="flex-1 flex flex-col px-4 pt-8 pb-6 safe-area-bottom">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0 }}
            className="mb-6"
          >
            <p className="text-[11px] uppercase tracking-[0.2em] font-medium" style={{ color: 'var(--accent-champagne)' }}>
              {PAYMENT_CONFIG.payee.name}
            </p>
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="mb-8"
          >
            <h1 className="text-2xl font-semibold tracking-tight leading-tight" style={{ color: 'var(--text-primary)' }}>
              Simple. Direct. UPI.
            </h1>
            <p className="text-sm mt-2 max-w-[300px]" style={{ color: 'var(--text-secondary)' }}>
              Enter an amount and pay directly using your preferred UPI app.
            </p>
          </motion.div>

          {/* Terminal */}
          <div className="flex-1 flex flex-col justify-start">
            <PaymentTerminal initialAmount={initialAmount} deviceOverride={device} />
          </div>

          {/* Footer */}
          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8 text-center"
          >
            <p className="text-[10px] tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
              UPI payment experience by {PAYMENT_CONFIG.payee.name}
            </p>
          </motion.footer>
        </div>
      ) : (
        /* Desktop Layout — Split */
        <div className="flex-1 flex items-center justify-center px-8 py-12 min-h-dvh">
          <div className="w-full max-w-[1120px] mx-auto flex items-center gap-16 lg:gap-24">
            {/* Left: Brand + Copy */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 max-w-[460px]"
            >
              {/* Brand */}
              <p className="text-[11px] uppercase tracking-[0.2em] font-medium mb-8" style={{ color: 'var(--accent-champagne)' }}>
                {PAYMENT_CONFIG.payee.name}
              </p>

              {/* Headline */}
              <h1
                className="text-5xl lg:text-[3.5rem] font-semibold leading-[1.08] tracking-[-0.03em]"
                style={{ color: 'var(--text-primary)' }}
              >
                Pay, without
                <br />
                <span style={{ color: 'var(--text-secondary)' }}>the clutter.</span>
              </h1>

              {/* Supporting text */}
              <p className="text-base mt-6 leading-relaxed max-w-[380px]" style={{ color: 'var(--text-secondary)' }}>
                Enter an amount and pay directly using your preferred UPI app. Secure, simple, and instant.
              </p>

              {/* Features */}
              <div className="mt-10 space-y-4">
                {[
                  { label: 'Direct UPI', desc: 'Pay through any UPI-enabled app' },
                  { label: 'No sign-up', desc: 'No account or registration needed' },
                  { label: 'Secure', desc: 'Processed through the UPI ecosystem' },
                ].map((feature, i) => (
                  <motion.div
                    key={feature.label}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                    className="flex items-start gap-3"
                  >
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: 'var(--accent-champagne-subtle)' }}
                    >
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5.5L4 7.5L8 3" stroke="var(--accent-champagne)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {feature.label}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                        {feature.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Footer */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-12 text-[10px] tracking-wider"
                style={{ color: 'var(--text-tertiary)' }}
              >
                UPI payment experience by {PAYMENT_CONFIG.payee.name}
              </motion.p>
            </motion.div>

            {/* Right: Payment Terminal */}
            <div className="flex-shrink-0">
              <PaymentTerminal initialAmount={initialAmount} deviceOverride={device} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
