
"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { getActivities } from "@/services/activityService";
import type { Activity } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { isFirebaseConfigured } from "@/lib/firebase";

export default function Home() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfigured] = useState(isFirebaseConfigured());
  const [heroImage, setHeroImage] = useState<Activity | null>(null);

  const fetchActivitiesAndSetHero = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedActivities = await getActivities();
      setActivities(fetchedActivities);

      if (fetchedActivities.length > 0) {
        // Select a random image client-side to avoid hydration mismatch
        const randomIndex = Math.floor(Math.random() * fetchedActivities.length);
        setHeroImage(fetchedActivities[randomIndex]);
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Could not load activities." });
      setActivities([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (isConfigured) {
      fetchActivitiesAndSetHero();
    } else {
      setIsLoading(false);
    }
  }, [isConfigured, fetchActivitiesAndSetHero]);

  const renderRecentActivities = () => {
    if (isLoading) {
      return Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="w-full aspect-[4/3] rounded-lg" />
            <Skeleton className="h-4 w-full mt-4" />
            <Skeleton className="h-4 w-3/4 mt-2" />
          </CardContent>
        </Card>
      ));
    }

    if (!isConfigured) {
      return (
        <div className="col-span-1 md:col-span-3">
          <Alert variant="destructive">
            <AlertTitle>Firebase Configuration Error</AlertTitle>
            <AlertDescription>
              <p>Your application is not connected to Firebase.</p>
              <p className="mt-2 font-bold">Please open the file <code>src/lib/firebase.ts</code> and follow the instructions to add your Firebase credentials.</p>
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    if (activities.length === 0) {
      return <p className="col-span-3 text-center text-muted-foreground">No recent activities to show.</p>;
    }

    return activities.slice(0, 3).map((activity) => (
      <Card key={activity.id} className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle>{activity.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Image
            src={activity.image || "https://placehold.co/400x300.png"}
            alt={activity.title}
            width={400}
            height={300}
            className="rounded-lg mb-4 object-cover aspect-[4/3]"
            data-ai-hint={activity.aiHint || 'children playing'}
          />
          <p className="text-sm text-muted-foreground">{activity.description}</p>
        </CardContent>
      </Card>
    ));
  };

  return (
    <div className="flex flex-col">
      <section className="w-full py-12 md:py-24 lg:py-32 bg-primary/10">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-primary">
                  {t("welcome")}
                </h1>
                <p className="max-w-[600px] text-foreground/80 md:text-xl">
                  {t("welcomeSub")}
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button asChild size="lg" className="font-semibold">
                  <Link href="/register">{t("registerYourChild")}</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="secondary"
                  className="font-semibold"
                >
                  <Link href="/events">{t("viewUpcomingEvents")}</Link>
                </Button>
              </div>
            </div>
            {isLoading ? (
              <Skeleton className="mx-auto aspect-square w-full max-w-[600px] rounded-full object-cover lg:order-last" />
            ) : (
              <Image
                src={heroImage?.image || "https://placehold.co/600x600.png"}
                alt={heroImage?.title || "Children playing at a table"}
                width={600}
                height={600}
                className="mx-auto aspect-square w-full rounded-full object-cover lg:order-last"
                data-ai-hint={heroImage?.aiHint || "children playing"}
                priority
              />
            )}
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline text-primary">
                {t("recentActivities")}
              </h2>
              <p className="max-w-[900px] text-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                {t("recentActivitiesSub")}
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-start gap-8 py-12 sm:grid-cols-2 md:grid-cols-3">
             {renderRecentActivities()}
          </div>
        </div>
      </section>
    </div>
  );
}
