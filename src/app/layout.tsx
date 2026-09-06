// src/app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CodeBridge — Ideas to Impact | Build Your Project. Bridge to Africa.',
  description:
    'CodeBridge connects you with vetted developers and tech talent across Nigeria and Kenya, delivering high-quality solutions, on time, and within budget.',
  keywords: [
    'CodeBridge',
    'Ideas to Impact',
    'African tech talent',
    'vetted developers Nigeria',
    'vetted developers Kenya',
    'web development',
    'mobile app development',
    'UI UX design',
    'staff augmentation',
    'Nigeria',
    'Kenya'
  ],
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon.png', sizes: '128x128', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
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
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}
