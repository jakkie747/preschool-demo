"use client";

import Link from "next/link";
import { Menu, Languages, Download, Phone, MoreVertical, Share } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";

// This interface is a basic representation of the BeforeInstallPromptEvent
interface CustomBeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function Header() {
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<CustomBeforeInstallPromptEvent | null>(null);
  const [isInstallSheetOpen, setIsInstallSheetOpen] = useState(false);
  
  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as CustomBeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleLanguageToggle = () => {
    setLanguage(language === 'en' ? 'af' : 'en');
  };

  const handleInstallClick = async () => {
    if (installPrompt) {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === "accepted") {
        console.log("PWA: User accepted the install prompt");
      }
      setInstallPrompt(null);
    } else {
      // If the native prompt isn't available, show our instruction sheet.
      setIsInstallSheetOpen(true);
    }
  };

  const navLinks = [
    { href: "/", label: t("home") },
    { href: "/register", label: t("registerChildNav") },
    { href: "/events", label: t("eventsNav") },
    { href: "/gallery", label: t("galleryNav") },
    { href: "/documents", label: t("documentsNav") },
  ];

  return (
    <>
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center justify-between">
        <div className="mr-4 flex">
          <Logo />
        </div>
        <nav className="hidden items-center gap-6 text-sm md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "font-medium transition-colors hover:text-primary",
                pathname === link.href ? "text-primary" : "text-foreground/60"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          
          <div className="hidden md:flex">
             <Button variant="outline" onClick={handleLanguageToggle}>
              {language === 'en' ? 'Afrikaans' : 'English'}
            </Button>
          </div>

          <div className="hidden md:flex">
            <Button onClick={handleInstallClick}>
              <Download className="mr-2" />
              {t("installApp")}
            </Button>
          </div>
          
          <div className="hidden md:flex items-center gap-1">
            <Button asChild variant="ghost" size="icon">
              <Link href="https://web.facebook.com/groups/1596188941091215/" target="_blank" rel="noopener noreferrer">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#1877F2" className="h-7 w-7">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
                <span className="sr-only">Facebook</span>
              </Link>
            </Button>
            <Button asChild variant="ghost" size="icon">
                <Link href="https://www.instagram.com/blink.ogies?utm_source=qr&igsh=Yjh6cDNwd2xldzNv" target="_blank" rel="noopener noreferrer">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-7 w-7" fill="none">
                      <defs>
                          <radialGradient id="instagram-gradient" cx="0.3" cy="1.2" r="1.2">
                              <stop offset="0" stopColor="#F58529" />
                              <stop offset="0.2" stopColor="#FEDA77" />
                              <stop offset="0.4" stopColor="#DD2A7B" />
                              <stop offset="0.7" stopColor="#8134AF" />
                              <stop offset="1" stopColor="#515BD4" />
                          </radialGradient>
                      </defs>
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" fill="url(#instagram-gradient)"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" stroke="white" strokeWidth="2"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="white" strokeWidth="2"></line>
                  </svg>
                    <span className="sr-only">Instagram</span>
                </Link>
            </Button>
            <Button asChild variant="ghost" size="icon">
                <Link href="https://wa.me/27725953421" target="_blank" rel="noopener noreferrer">
                    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#25D366" className="h-7 w-7">
                        <title>WhatsApp</title>
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.861 9.861 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.204-1.64a11.816 11.816 0 005.783 1.47h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    <span className="sr-only">WhatsApp</span>
                </Link>
            </Button>
          </div>

          <div className="hidden md:flex">
             <Button asChild>
                <Link href="tel:+27725953421">
                  <Phone className="mr-2" />
                  {t("callUs")}
                </Link>
              </Button>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <Button asChild variant="outline">
              <Link href="/parent-login">{t("parentLoginNav")}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin">{t("adminLoginNav")}</Link>
            </Button>
          </div>

          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden h-14 w-14">
                <Menu className="h-9 w-9" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-full max-w-xs bg-background p-0"
            >
              <div className="flex h-full flex-col">
                <SheetHeader className="p-6 pb-4">
                  <SheetTitle>
                    <div className="sr-only">Menu</div>
                  </SheetTitle>
                  <div className="flex justify-start">
                    <Logo />
                  </div>
                </SheetHeader>
                <nav className="flex-1 space-y-1 overflow-y-auto px-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "flex items-center rounded-md px-2 py-2 text-lg font-medium transition-colors hover:text-primary",
                        pathname === link.href
                          ? "text-primary bg-muted"
                          : "text-foreground/70"
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                  
                  <div className="pt-4 mt-4 border-t">
                    <button
                      onClick={() => {
                        handleInstallClick();
                        setIsMobileMenuOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center rounded-md px-2 py-2 text-lg font-medium transition-colors hover:text-primary text-foreground/70"
                      )}
                    >
                      <Download className="mr-4 h-5 w-5" />
                      {t("installApp")}
                    </button>

                    <button
                      onClick={() => {
                        handleLanguageToggle();
                        setIsMobileMenuOpen(false);
                      }}
                      className={cn(
                          "flex w-full items-center rounded-md px-2 py-2 text-lg font-medium transition-colors hover:text-primary text-foreground/70"
                      )}
                    >
                      <Languages className="mr-4 h-5 w-5" />
                      <span>{language === 'en' ? 'Switch to Afrikaans' : 'Switch to English'}</span>
                    </button>
                    
                    <Link
                      href="tel:+27725953421"
                      className={cn(
                        "flex items-center rounded-md px-2 py-2 text-lg font-medium transition-colors hover:text-primary text-foreground/70"
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Phone className="mr-4 h-5 w-5" />
                      <span>{t("callUs")}</span>
                    </Link>

                     <Link
                      href="https://wa.me/27725953421"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                          "flex items-center rounded-md px-2 py-2 text-lg font-medium transition-colors hover:text-primary text-foreground/70"
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                  >
                      <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="mr-4 h-6 w-6">
                          <title>WhatsApp</title>
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.861 9.861 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.204-1.64a11.816 11.816 0 005.783 1.47h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                      <span>{t('whatsapp')}</span>
                  </Link>

                    <Link
                      href="https://web.facebook.com/groups/1596188941091215/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "flex items-center rounded-md px-2 py-2 text-lg font-medium transition-colors hover:text-primary text-foreground/70"
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="mr-4 h-6 w-6">
                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                      </svg>
                      <span>Facebook</span>
                    </Link>

                    <Link
                        href="https://www.instagram.com/blink.ogies?utm_source=qr&igsh=Yjh6cDNwd2xldzNv"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                        "flex items-center rounded-md px-2 py-2 text-lg font-medium transition-colors hover:text-primary text-foreground/70"
                        )}
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mr-4 h-6 w-6" fill="none">
                          <defs>
                              <radialGradient id="instagram-gradient-mobile" cx="0.3" cy="1.2" r="1.2">
                                  <stop offset="0" stopColor="#F58529" />
                                  <stop offset="0.2" stopColor="#FEDA77" />
                                  <stop offset="0.4" stopColor="#DD2A7B" />
                                  <stop offset="0.7" stopColor="#8134AF" />
                                  <stop offset="1" stopColor="#515BD4" />
                              </radialGradient>
                          </defs>
                          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" fill="url(#instagram-gradient-mobile)"></rect>
                          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" stroke="white" strokeWidth="2"></path>
                          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="white" strokeWidth="2"></line>
                      </svg>
                      <span>Instagram</span>
                    </Link>
                  </div>

                </nav>
                <div className="mt-auto border-t p-4">
                  <div className="flex flex-col gap-2">
                    <Button asChild variant="ghost" className="w-full justify-start text-lg font-medium h-auto py-2">
                      <Link href="/parent-login" onClick={() => setIsMobileMenuOpen(false)} className={cn(pathname.startsWith('/parent-login') ? "text-primary" : "text-foreground/70")}>
                        {t("parentLoginNav")}
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" className="w-full justify-start text-lg font-medium h-auto py-2">
                      <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className={cn(pathname.startsWith('/admin') ? "text-primary" : "text-foreground/70")}>
                        {t("adminLoginNav")}
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>

    <Sheet open={isInstallSheetOpen} onOpenChange={setIsInstallSheetOpen}>
        <SheetContent side="bottom">
            <SheetHeader>
                <SheetTitle>{t('installInstructionsTitle')}</SheetTitle>
                <SheetDescription>{t('installInstructionsDesc')}</SheetDescription>
            </SheetHeader>
            <div className="py-4 space-y-6">
                 <div>
                    <h3 className="font-semibold mb-2">{t('installInstructionsDesktop')}</h3>
                     <ol className="list-decimal list-inside space-y-2 text-sm">
                        <li>{t('installDesktopStep1')}</li>
                        <li>{t('installDesktopStep2')}</li>
                    </ol>
                </div>
                <div>
                    <h3 className="font-semibold mb-2">{t('installInstructionsAndroid')}</h3>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                        <li>{t('installAndroidStep1', { icon: 'MoreVertical' })}</li>
                        <li>{t('installAndroidStep2')}</li>
                    </ol>
                </div>
                 <div>
                    <h3 className="font-semibold mb-2">{t('installInstructionsIOS')}</h3>
                     <ol className="list-decimal list-inside space-y-2 text-sm">
                        <li>{t('installIOSStep1', { icon: 'Share' })}</li>
                        <li>{t('installIOSStep2')}</li>
                    </ol>
                </div>
            </div>
        </SheetContent>
    </Sheet>
    </>
  );
}
