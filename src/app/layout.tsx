import { Inter } from 'next/font/google';
import type {Metadata, Viewport} from 'next';
import './globals.css';
import { AppChrome } from "@/components/app-chrome";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: 'WaterDrop | Fresh Water Marketplace',
  description: 'Your one-stop shop for bottled and bag water delivered to your doorstep.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'WaterDrop',
  },
  formatDetection: {
    telephone: true,
  },
  applicationName: 'WaterDrop',
  authors: [{ name: 'WaterDrop Team' }],
  keywords: ['water', 'delivery', 'marketplace', 'pwa'],
};

export const viewport: Viewport = {
  themeColor: '#0ea5e9',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'auto',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${inter.variable} font-body`}>
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  );
}
