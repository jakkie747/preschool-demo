
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, CalendarDays, GalleryHorizontal, Briefcase, Mail, Settings, FileText, LampDesk, ReceiptText, Sparkles } from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { useLanguage } from "@/context/LanguageContext";
import { useAdminAuth } from "@/context/AdminAuthContext";

export function AdminNav() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { teacher } = useAdminAuth();
  const userRole = teacher?.role;

  const menuItems = [
    { href: "/admin/dashboard", label: t('dashboard'), icon: LayoutDashboard, roles: ['admin', 'teacher'] },
    {
      href: "/admin/dashboard/children",
      label: t('preschoolChildrenNav'),
      icon: Users,
      roles: ['admin', 'teacher']
    },
    {
      href: "/admin/dashboard/afterschool",
      label: t('afterschoolChildren'),
      icon: LampDesk,
      roles: ['admin', 'teacher']
    },
     {
      href: "/admin/dashboard/invoicing",
      label: "Invoicing",
      icon: ReceiptText,
      roles: ['admin']
    },
    {
      href: "/admin/dashboard/events",
      label: t('manageEvents'),
      icon: CalendarDays,
      roles: ['admin', 'teacher']
    },
    {
      href: "/admin/dashboard/activities",
      label: t('manageGallery'),
      icon: GalleryHorizontal,
      roles: ['admin', 'teacher']
    },
    {
        href: "/admin/dashboard/documents",
        label: t('manageDocuments'),
        icon: FileText,
        roles: ['admin', 'teacher']
    },
    {
      href: "/admin/dashboard/teachers",
      label: t('manageTeachers'),
      icon: Briefcase,
      roles: ['admin'] // Only visible to admins
    },
    {
      href: "/admin/dashboard/parents",
      label: t('manageParents'),
      icon: Users,
      roles: ['admin']
    },
    {
      href: "/admin/dashboard/notifications",
      label: t('composeMessage'),
      icon: Mail,
      roles: ['admin', 'teacher']
    },
    {
      href: "/admin/dashboard/settings",
      label: t('settings'),
      icon: Settings,
      roles: ['admin', 'teacher']
    },
  ];

  return (
    <SidebarMenu>
      {menuItems.map((item) => 
        (userRole && item.roles.includes(userRole)) && (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              isActive={pathname === item.href || pathname.startsWith(item.href + '/')}
              tooltip={item.label}
            >
              <Link href={item.href}>
                <item.icon />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      )}
    </SidebarMenu>
  );
}
