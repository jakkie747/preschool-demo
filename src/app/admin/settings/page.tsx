
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * This component is a placeholder to redirect from an old, incorrect URL 
 * to the correct settings page within the admin dashboard. 
 * This resolves a build error caused by this page being outside the required Auth provider.
 */
export default function OldSettingsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/dashboard/settings');
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="text-center">
        <p className="text-lg text-foreground">Redirecting to settings...</p>
      </div>
    </div>
  );
}
