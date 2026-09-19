'use client';

import { motion } from 'framer-motion';
import { UPIApp } from '@/lib/types';
import { UPI_APPS } from '@/lib/config';

interface UPIAppButtonProps {
  app: UPIApp;
  onClick: (app: UPIApp) => void;
  disabled?: boolean;
  loading?: boolean;
}

// SVG icons for each UPI app
function AppIcon({ app, size = 24 }: { app: UPIApp; size?: number }) {
  switch (app) {
    case 'googlepay':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" fill="#F5F5F5"/>
        </svg>
      );
    case 'phonepe':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path d="M17.993 2.007H6.007C3.792 2.007 2 3.799 2 6.014v11.972C2 20.201 3.792 22 6.007 22h11.986C20.208 22 22 20.201 22 17.986V6.014C22 3.799 20.208 2.007 17.993 2.007z" fill="#5F259F"/>
          <path d="M15.5 7h-3.2c-.4 0-.7.1-1 .4L8.5 10.2c-.2.2-.3.5-.3.8v.2c0 .4.3.7.7.7h2.3l-1.5 5.1c-.1.4.3.7.6.4l5.5-6.3c.3-.3.1-.8-.3-.8h-2.2l2.5-2.5c.3-.3.1-.8-.3-.8z" fill="#F5F5F5"/>
        </svg>
      );
    case 'paytm':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <rect x="2" y="2" width="20" height="20" rx="4" fill="#00BAF2"/>
          <path d="M7 8h2.5c1.4 0 2.5.8 2.5 2.2s-1.1 2.3-2.5 2.3H8.5V15H7V8zm1.5 3.2h1c.7 0 1-.4 1-1s-.3-1-1-1h-1v2zM17 8v1.3h-2V15h-1.5V9.3h-2V8H17z" fill="#F5F5F5"/>
        </svg>
      );
    case 'bhim':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <rect x="2" y="2" width="20" height="20" rx="4" fill="#007A3D"/>
          <path d="M7 6h4.5c1.4 0 2.5.8 2.5 2 0 .8-.5 1.5-1.3 1.8 1.1.3 1.8 1.1 1.8 2.2 0 1.4-1.2 2-2.8 2H7V6zm2 3h2.2c.6 0 1-.2 1-.7s-.4-.7-1-.7H9v1.4zm0 3.6h2.4c.7 0 1.1-.3 1.1-.8 0-.6-.4-.8-1.1-.8H9v1.6z" fill="#FFFFFF"/>
          <path d="M15 15l3-3-3-3" stroke="#FF7700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case 'generic':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path d="M4 15l7-10 2 5-5 5h7l2 3H4z" fill="var(--accent-champagne)"/>
          <path d="M20 9l-7 10-2-5 5-5h-7l-2-3h13z" fill="rgba(255,255,255,0.7)"/>
        </svg>
      );
  }
}

export default function UPIAppButton({ app, onClick, disabled, loading }: UPIAppButtonProps) {
  const config = UPI_APPS[app];

  return (
    <motion.button
      onClick={() => onClick(app)}
      disabled={disabled || loading}
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed group relative overflow-hidden"
      style={{
        backgroundColor: 'var(--bg-elevated)',
        border: '1px solid var(--border-subtle)',
      }}
      aria-label={`Pay with ${config.name}`}
    >
      {/* Hover highlight */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{ backgroundColor: 'var(--bg-hover)' }}
      />

      {/* Icon */}
      <div className="relative z-10 flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl"
        style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
      >
        <AppIcon app={app} size={22} />
      </div>

      {/* Label */}
      <span className="relative z-10 text-[15px] font-medium" style={{ color: 'var(--text-primary)' }}>
        {config.name}
      </span>

      {/* Arrow */}
      <div className="relative z-10 ml-auto">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className="transition-transform duration-200 group-hover:translate-x-0.5"
        >
          <path
            d="M6 3L11 8L6 13"
            stroke="var(--text-tertiary)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </motion.button>
  );
}
