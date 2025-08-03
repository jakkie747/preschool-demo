'use client';

import { useState, useEffect } from 'react';
import { Logo } from '@/components/Logo';
import { cn } from '@/lib/utils';

export const SplashScreen = ({ isFading }: { isFading: boolean }) => {
  const [animation, setAnimation] = useState<'rotate' | 'pulse' | null>('rotate');

  useEffect(() => {
    const rotateTimer = setTimeout(() => {
      setAnimation('pulse');
    }, 2000); // After 2s, switch to pulse

    return () => {
      clearTimeout(rotateTimer);
    };
  }, []);

  return (
    <div
      className={cn(
        'fixed inset-0 z-[200] flex items-center justify-center bg-black transition-opacity duration-500 ease-in',
        { 'opacity-0': isFading }
      )}
    >
      <div
        className={cn({
          'animate-logo-rotate': animation === 'rotate',
          'animate-logo-pulse': animation === 'pulse',
        })}
      >
        <Logo className="h-40 w-40 text-primary-foreground" />
      </div>
    </div>
  );
};
