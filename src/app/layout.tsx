import type {Metadata, Viewport} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { MobileNav } from "@/components/mobile-nav";

export const metadata: Metadata = {
  title: 'AquaMart | Fresh Water Marketplace',
  description: 'Your one-stop shop for bottled and bag water delivered to your doorstep.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'AquaMart',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: '#0ea5e9',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col overflow-x-hidden">
        <div className="flex-1 pb-16 md:pb-0">
          {children}
        </div>
        <MobileNav />
        <Toaster />
      </body>
    </html>
  );
}
