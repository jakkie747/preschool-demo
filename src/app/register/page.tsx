
"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { School, LampDesk } from "lucide-react";

export default function RegisterSelectionPage() {
  const { t } = useLanguage();

  return (
    <div className="container py-12 md:py-24">
      <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl font-headline text-primary">
          {t('registerTitle')}
        </h1>
        <p className="max-w-[900px] text-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
          {t('registerSelectionSub')}
        </p>
      </div>

      <div className="max-w-4xl mx-auto grid gap-8 md:grid-cols-2">
        <Link href="/register/preschool" className="group">
          <Card className="h-full flex flex-col justify-center items-center text-center p-8 transition-all group-hover:shadow-xl group-hover:-translate-y-2">
            <CardHeader>
              <div className="mx-auto bg-primary/10 p-4 rounded-full mb-4">
                <School className="h-12 w-12 text-primary" />
              </div>
              <CardTitle className="font-headline text-3xl text-primary/90">
                {t('preschoolRegistration')}
              </CardTitle>
              <CardDescription className="text-base mt-2">
                {t('preschoolRegistrationDesc')}
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/register/afterschool" className="group">
          <Card className="h-full flex flex-col justify-center items-center text-center p-8 transition-all group-hover:shadow-xl group-hover:-translate-y-2">
             <CardHeader>
              <div className="mx-auto bg-accent/10 p-4 rounded-full mb-4">
                <LampDesk className="h-12 w-12 text-accent" />
              </div>
              <CardTitle className="font-headline text-3xl text-accent">
                {t('afterschoolRegistration')}
              </CardTitle>
              <CardDescription className="text-base mt-2">
                {t('afterschoolRegistrationDesc')}
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}
