# Pay Syed Hamza — Secure UPI Payment Experience

A luxury fintech UPI payment experience built with Next.js 16, React 19, TypeScript, Tailwind CSS, and Framer Motion for [pay.syedhamza.in](https://pay.syedhamza.in).

## Features

- **Device-Aware Flow**:
  - **Mobile (Android & iOS)**: UPI App-First flow. Launches native UPI intents with direct app selection for Google Pay, PhonePe, Paytm, BHIM, and other UPI apps, with dynamic QR code fallback.
  - **Desktop**: QR-First flow. Displays a high-contrast dynamic QR code immediately for instant scanning with any UPI app.
- **Dynamic Amount Encoding**: Real-time generation of NPCI compliant UPI URIs and dynamic QR codes with transaction references.
- **Truthful Payment States**: Transparent status tracking with active status verification and no false payment confirmation claims.
- **Fintech Luxury Aesthetics**: Cinematic dark mode with champagne gold accents, glassmorphic surfaces, and micro-interactions.

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **QR Code**: qrcode

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
