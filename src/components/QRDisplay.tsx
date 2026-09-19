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
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
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
    <div className="flex flex-col items-center gap-4">
      <p className="text-xs uppercase tracking-wider font-semibold" style={{ color: 'var(--accent-champagne)' }}>
        Scan with any UPI app
      </p>

      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative p-3.5 rounded-2xl mx-auto flex items-center justify-center shadow-lg"
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid rgba(255, 255, 255, 0.15)',
        }}
      >
        {qrDataUrl ? (
          <img
            src={qrDataUrl}
            alt={`QR code for UPI payment of ₹${amount}`}
            width={240}
            height={240}
            className="rounded-lg block"
            style={{ imageRendering: 'pixelated' }}
          />
        ) : (
          <div className="w-[240px] h-[240px] flex items-center justify-center">
            <motion.div
              className="w-6 h-6 rounded-full border-2"
              style={{ borderColor: '#000000', borderTopColor: 'transparent' }}
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
