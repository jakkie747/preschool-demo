
"use client";

import { useState, useEffect } from 'react';

// This interface is a basic representation of the BeforeInstallPromptEvent
// which is not yet fully standardized in TypeScript's lib.dom.d.ts
interface CustomBeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const usePwaInstall = () => {
  const [installPrompt, setInstallPrompt] = useState<CustomBeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    console.log("usePwaInstall: Hook is active, adding event listener.");

    const handleBeforeInstallPrompt = (event: Event) => {
      console.log("usePwaInstall: 'beforeinstallprompt' event has been fired!");
      // Prevent the mini-infobar from appearing on mobile
      event.preventDefault();
      // Stash the event so it can be triggered later.
      setInstallPrompt(event as CustomBeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Clean up the event listener
    return () => {
      console.log("usePwaInstall: Hook is cleaning up, removing event listener.");
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const install = async () => {
    if (!installPrompt) {
      console.error("usePwaInstall: Install was called but no install prompt is available.");
      return;
    }
    // Show the browser's install prompt
    await installPrompt.prompt();
    
    // We can optionally wait for the user's choice
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    // The prompt can only be used once. We need to clear it.
    setInstallPrompt(null);
  };

  return { install, canInstall: !!installPrompt };
};
