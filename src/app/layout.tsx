// src/app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CodeBridge — Built for business. | Digital Products & Technology',
  description:
    'CodeBridge delivers modern digital products, custom software, and engineering solutions to businesses. Operated by MarketBridge NG LTD, serving businesses across Nigeria and Kenya.',
  keywords: [
    'CodeBridge',
    'MarketBridge',
    'Built for business',
    'business websites',
    'e-commerce',
    'restaurant ordering systems',
    'booking systems',
    'custom software',
    'web applications',
    'Nigeria',
    'Kenya'
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body>{children}</body>
    </html>
  );
}
