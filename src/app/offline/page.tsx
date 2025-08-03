
"use client";

import { WifiOff } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function OfflinePage() {
  const { t } = useLanguage();
  return (
    <div className="container flex h-[calc(100dvh-10rem)] items-center justify-center text-center">
      <div className="flex flex-col items-center gap-4">
        <WifiOff className="h-24 w-24 text-muted-foreground" />
        <h1 className="text-3xl font-bold">You're Offline</h1>
        <p className="text-muted-foreground">
          It looks like you've lost your connection. Please check it and try again.
        </p>
         <p className="text-sm text-muted-foreground">
          Some pages you've visited may be available while you're offline.
        </p>
      </div>
    </div>
  );
}
