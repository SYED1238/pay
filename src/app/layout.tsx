import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pay Syed Hamza — Secure UPI Payment",
  description: "Make a secure UPI payment to Syed Hamza.",
  metadataBase: new URL("https://pay.syedhamza.in"),
  openGraph: {
    title: "Pay Syed Hamza — Secure UPI Payment",
    description: "Make a secure UPI payment to Syed Hamza.",
    url: "https://pay.syedhamza.in",
    siteName: "Pay Syed Hamza",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary",
    title: "Pay Syed Hamza — Secure UPI Payment",
    description: "Make a secure UPI payment to Syed Hamza.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://pay.syedhamza.in",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#080808",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-dvh flex flex-col relative">
        {/* Ambient Background */}
        <div className="ambient-bg" aria-hidden="true" />
        <div className="noise-overlay" aria-hidden="true" />

        {/* Main Content */}
        <main className="relative z-10 flex-1 flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
