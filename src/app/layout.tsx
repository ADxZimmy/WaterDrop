import type {Metadata, Viewport} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { MobileNav } from "@/components/mobile-nav";
import { PwaInstallPrompt } from "@/components/pwa-install-prompt";

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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="font-body">
        <div className="flex flex-col min-h-screen">
          <main className="flex-1 w-full max-w-full pb-16 md:pb-0 relative">
            {children}
          </main>
          <MobileNav />
          <PwaInstallPrompt />
          <Toaster />
        </div>
      </body>
    </html>
  );
}
