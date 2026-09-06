// src/app/layout.tsx
import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/common/ThemeProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'CodeBridge — Ideas to Impact | Build Your Project. Bridge to the World.',
  description:
    'CodeBridge designs, develops, and deploys high-performance digital products and custom business software for companies globally — delivered on time and within budget.',
  keywords: [
    'CodeBridge',
    'Ideas to Impact',
    'Digital products',
    'Custom software development',
    'Web application development',
    'Business management systems',
    'E-commerce platforms',
    'Milestone escrow software'
  ],
  icons: {
    icon: [
      { url: '/favicon-32x32.png?v=cb6', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png?v=cb6', sizes: '16x16', type: 'image/png' },
      { url: '/icon.svg?v=cb6', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico?v=cb6',
    apple: '/apple-touch-icon.png?v=cb6',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=cb6" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png?v=cb6" />
        <link rel="shortcut icon" href="/favicon.ico?v=cb6" />
        <link rel="icon" type="image/svg+xml" href="/icon.svg?v=cb6" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=cb6" />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
