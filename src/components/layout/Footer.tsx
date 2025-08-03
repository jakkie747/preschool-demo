"use client";

import { Logo } from "@/components/Logo";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto flex flex-col items-center justify-between gap-6 py-10 sm:flex-row">
        <Logo />
        <p className="text-sm text-muted-foreground">
          {t('copyright')}
        </p>
        <div className="flex items-center gap-4">
          <Link
            href="/privacy-policy"
            className="text-sm text-muted-foreground hover:text-primary"
            prefetch={false}
          >
            {t('privacyPolicy')}
          </Link>
          <Link
            href="/terms-of-service"
            className="text-sm text-muted-foreground hover:text-primary"
            prefetch={false}
          >
            {t('termsOfService')}
          </Link>
        </div>
      </div>
    </footer>
  );
}
