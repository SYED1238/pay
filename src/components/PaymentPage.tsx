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
        <div className="flex-1 flex flex-col px-4 pt-7 pb-6 safe-area-bottom max-w-[460px] mx-auto w-full">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-4"
          >
            <p className="text-[11px] uppercase tracking-[0.2em] font-medium" style={{ color: 'var(--accent-champagne)' }}>
              {PAYMENT_CONFIG.payee.name}
            </p>
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="mb-6"
          >
            <h1 className="text-2xl font-semibold tracking-tight leading-tight" style={{ color: 'var(--text-primary)' }}>
              Pay, without the clutter.
            </h1>
            <p className="text-xs mt-1.5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Simple payment options for wherever you are.
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
            <p className="text-[10px] tracking-wider uppercase" style={{ color: 'var(--text-tertiary)' }}>
              {PAYMENT_CONFIG.payee.name} · UPI · PayPal · USDT
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
              <p className="text-[11px] uppercase tracking-[0.2em] font-medium mb-7" style={{ color: 'var(--accent-champagne)' }}>
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
                Simple payment options for wherever you are.
              </p>

              {/* 3 Payment Rails Feature List */}
              <div className="mt-10 space-y-4">
                {[
                  {
                    route: 'India',
                    label: 'UPI Payments',
                    desc: 'Instant transfers via Google Pay, PhonePe, Paytm, or BHIM',
                    badge: '🇮🇳',
                  },
                  {
                    route: 'International',
                    label: 'PayPal Global',
                    desc: 'Secure checkout in USD, EUR, GBP, CAD, or AUD',
                    badge: '🌎',
                  },
                  {
                    route: 'Crypto',
                    label: 'USDT (TRON)',
                    desc: 'Direct TRC20 wallet transfer with instant address & QR code',
                    badge: '₮',
                  },
                ].map((feature, i) => (
                  <motion.div
                    key={feature.label}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 + i * 0.1, duration: 0.5 }}
                    className="flex items-start gap-3.5 p-3 rounded-2xl transition-colors"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)' }}
                  >
                    <div
                      className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 text-sm mt-0.5"
                      style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
                    >
                      {feature.badge}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs uppercase tracking-wider font-semibold" style={{ color: 'var(--accent-champagne)' }}>
                          {feature.route}
                        </span>
                        <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                          · {feature.label}
                        </span>
                      </div>
                      <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
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
                className="mt-10 text-[10px] tracking-wider uppercase"
                style={{ color: 'var(--text-tertiary)' }}
              >
                Payment terminal by {PAYMENT_CONFIG.payee.name}
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
