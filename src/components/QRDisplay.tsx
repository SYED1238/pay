'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { motion } from 'framer-motion';

interface QRDisplayProps {
  upiUri: string;
  amount: string;
}

export default function QRDisplay({ upiUri, amount }: QRDisplayProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!upiUri) return;

    QRCode.toDataURL(upiUri, {
      width: 280,
      margin: 3,
      color: {
        dark: '#F5F5F5',
        light: '#111111',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        setQrDataUrl(url);
        setError(false);
      })
      .catch(() => {
        setError(true);
      });
  }, [upiUri]);

  if (error) {
    return (
      <div
        className="w-[280px] h-[280px] rounded-2xl flex items-center justify-center mx-auto"
        style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
      >
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Unable to generate QR code
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <p className="text-sm font-medium tracking-wide uppercase" style={{ color: 'var(--text-secondary)' }}>
        Scan with any UPI app
      </p>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative p-4 rounded-2xl"
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        {qrDataUrl ? (
          <img
            src={qrDataUrl}
            alt={`QR code for UPI payment of ₹${amount}`}
            width={280}
            height={280}
            className="rounded-xl"
            style={{ imageRendering: 'pixelated' }}
          />
        ) : (
          <div className="w-[280px] h-[280px] flex items-center justify-center">
            <motion.div
              className="w-6 h-6 rounded-full border-2"
              style={{ borderColor: 'var(--accent-champagne)', borderTopColor: 'transparent' }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        )}
      </motion.div>

      <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
        Amount: ₹{amount}
      </p>
    </div>
  );
}
