
"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useRouter } from 'next/navigation';
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { AdminAuthProvider, useAdminAuth } from "@/context/AdminAuthContext";

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AdminNav } from "@/components/admin/AdminNav";
import { Logo } from "@/components/Logo";
import { Skeleton } from "@/components/ui/skeleton";

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();
  const router = useRouter();
  const { loading } = useAdminAuth();

  const handleLogout = async () => {
    if (!auth) return;
    try {
        await signOut(auth);
        router.push('/admin');
    } catch (error) {
        console.error("Logout Error:", error);
    }
  };

  if (loading) {
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

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Link
            href="/admin/dashboard"
            className="flex items-center justify-start group p-4"
          >
            <Logo href={null} />
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <AdminNav />
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout} tooltip={t('logout')}>
                <LogOut />
                <span>{t('logout')}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-[57px] items-center gap-1 border-b bg-background px-4">
          <SidebarTrigger />
          <h1 className="text-xl font-semibold">{t('adminDashboard')}</h1>
        </header>
        <main className="p-4 sm:px-6 sm:py-0">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </AdminAuthProvider>
  );
}
