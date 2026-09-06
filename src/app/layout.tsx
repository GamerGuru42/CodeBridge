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
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
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
      </head>
      <body>{children}</body>
    </html>
  );
}
