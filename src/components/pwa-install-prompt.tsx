"use client";

import React, { useState, useEffect } from 'react';
import { Share, PlusSquare, X, Download, Smartphone, Monitor } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function PwaInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop' | 'other'>('other');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Check if app is already installed/running as standalone
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone 
      || document.referrer.includes('android-app://');

    if (isStandalone) return;

    // Detect platform
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIos = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    
    // Handle Android/Desktop "beforeinstallprompt" event
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!isIos) {
        setPlatform(isAndroid ? 'android' : 'desktop');
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // iOS Detection (it doesn't support beforeinstallprompt)
    if (isIos && !isStandalone) {
      setPlatform('ios');
      const isDismissed = localStorage.getItem('pwa-prompt-dismissed');
      if (!isDismissed) {
        setShowPrompt(true);
      }
    }

    // For development/preview: show the prompt if we're in a desktop browser and not dismissed
    // This helps users verify the UI exists.
    if (!isIos && !isAndroid) {
      const isDismissed = localStorage.getItem('pwa-prompt-dismissed');
      if (!isDismissed) {
        setPlatform('desktop');
        setShowPrompt(true);
      }
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    } else if (platform === 'desktop') {
      // Logic for desktop browsers that don't support or haven't triggered beforeinstallprompt
      alert("To install: Click the 'Install' icon in your browser's address bar (usually near the star/bookmark icon).");
    }
  };

  const dismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-[100] max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4">
      <Card className="shadow-2xl border-primary/20 bg-white/95 backdrop-blur-md overflow-hidden">
        <CardContent className="p-4 relative">
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-1 top-1 h-6 w-6 rounded-full"
            onClick={dismiss}
          >
            <X className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-primary rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-primary/20">
              {platform === 'desktop' ? <Monitor className="h-6 w-6" /> : <Smartphone className="h-6 w-6" />}
            </div>
            <div className="flex-1 pr-4">
              <p className="font-bold text-sm">Install WaterDrop App</p>
              <p className="text-xs text-muted-foreground">
                {platform === 'ios' 
                  ? "Tap Share and select 'Add to Home Screen'" 
                  : "Get the best experience by installing to your device"}
              </p>
            </div>
          </div>

          {platform === 'ios' && (
            <div className="mt-3 flex items-center justify-center gap-4 text-[10px] font-medium text-primary bg-primary/5 py-2 rounded-lg">
              <div className="flex items-center gap-1">
                <Share className="h-3 w-3" />
                <span>Tap Share</span>
              </div>
              <div className="h-1 w-1 bg-primary/20 rounded-full" />
              <div className="flex items-center gap-1">
                <PlusSquare className="h-3 w-3" />
                <span>Add to Home Screen</span>
              </div>
            </div>
          )}

          {(platform === 'android' || platform === 'desktop') && (
            <Button className="w-full mt-4 h-11 rounded-xl text-sm font-bold gap-2" onClick={handleInstallClick}>
              <Download className="h-4 w-4" /> Install Now
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}