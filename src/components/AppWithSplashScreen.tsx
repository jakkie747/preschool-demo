'use client';

import { useState, useEffect } from 'react';
import { SplashScreen } from '@/components/layout/SplashScreen';

export default function AppWithSplashScreen({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Start fading out before removing
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, 4500); // Start fade at 4.5s

    // Remove the splash screen from the DOM after the fade is complete
    const removeTimer = setTimeout(() => {
      setShowSplash(false);
    }, 5000); // Total splash screen time is 5s

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  return (
    <>
      {showSplash && <SplashScreen isFading={isFading} />}
      {children}
    </>
  );
}
