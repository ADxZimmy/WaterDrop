"use client";

import React, { useState, useEffect } from 'react';
import { Share, PlusSquare, X, Download } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function PwaInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'other'>('other');

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

    // Only show prompt if not dismissed recently
    const isDismissed = localStorage.getItem('pwa-prompt-dismissed');
    
    if (!isDismissed) {
      if (isIos) {
        setPlatform('ios');
        setShowPrompt(true);
      } else if (isAndroid) {
        setPlatform('android');
        // Android often handles its own prompt, but we can show a custom one
        setShowPrompt(true);
      }
    }
  }, []);

  const dismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-[100] md:hidden animate-in fade-in slide-in-from-bottom-4">
      <Card className="shadow-2xl border-primary/20 bg-white/95 backdrop-blur-md">
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
            <div className="h-12 w-12 bg-primary rounded-xl flex items-center justify-center text-white shrink-0">
              <Download className="h-6 w-6" />
            </div>
            <div className="flex-1 pr-4">
              <p className="font-bold text-sm">Install AquaMart App</p>
              <p className="text-xs text-muted-foreground">
                {platform === 'ios' 
                  ? "Tap the Share icon below and select 'Add to Home Screen'" 
                  : "Install AquaMart to your home screen for a better experience"}
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

          {platform === 'android' && (
            <Button className="w-full mt-3 h-9 rounded-lg text-xs" onClick={() => (window as any).deferredPrompt?.prompt()}>
              Install Now
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
