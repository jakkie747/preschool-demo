
"use client";

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/parent-login');
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
          <div className="space-y-4 w-1/2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
          </div>
      </div>
    );
  }

  const handleLogout = async () => {
    if (!auth) return;
    try {
        await signOut(auth);
        router.push('/parent-login');
    } catch (error) {
        console.error("Logout Error:", error);
    }
  };


  return (
    <div className="min-h-screen bg-muted/40">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
                <Link href="/parent/dashboard" className="flex items-center gap-2 font-semibold">
                    <Logo href={null} />
                    <span className="hidden md:inline">Parent Dashboard</span>
                </Link>
                <Button onClick={handleLogout} variant="outline">
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                </Button>
            </div>
        </header>
        <main className="container py-8">
             {children}
        </main>
    </div>
  );
}
