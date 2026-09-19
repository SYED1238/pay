# Pay Syed Hamza — Unified Payment Terminal

A luxury fintech payment terminal built with Next.js 16, React 19, TypeScript, Tailwind CSS, and Framer Motion for [pay.syedhamza.in](https://pay.syedhamza.in).

Supports three dedicated payment rails unified under a single, quiet-luxury terminal interface:

1. 🇮🇳 **Domestic UPI (India)**
   - Destination: `7975463051@jupiteraxis`
   - Payee: `SYED MOHAMMED HAMZA`
   - Mobile: UPI App-First flow with native app launch (Google Pay, PhonePe, Paytm, BHIM, Generic) + QR fallback
   - Desktop: Instant dynamic QR generation + 1-click UPI ID copy

2. 🌎 **International PayPal (Global)**
   - Official PayPal.Me: [paypal.me/SYEDHAMZA1238](https://paypal.me/SYEDHAMZA1238)
   - Multi-currency support: USD, EUR, GBP, CAD, AUD
   - Dynamic amount calculation and verified external transfer

3. ₮ **Cryptocurrency USDT (TRON / TRC20)**
   - Receiving Address: `TPYbZrgRbj3tzCW4evgbn7SrMiJ8ctsH5p`
   - Network: **TRON (TRC20)** with prominent warning banners
   - High-contrast QR code tile, target amount calculator, and 1-click address copy

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (Mid-Range Slate Graphite & Minimal Titanium Ecru Palette)
- **Animations**: Framer Motion
- **QR Engine**: qrcode

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:3002](http://localhost:3002) in your browser.
