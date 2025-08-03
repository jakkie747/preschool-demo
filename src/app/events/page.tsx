
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, Info, AlertTriangle } from "lucide-react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import type { Event } from "@/lib/types";
import { getEvents } from "@/services/eventsService";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { isFirebaseConfigured, firebaseConfig } from "@/lib/firebase";

const FormattedEventDate = ({ date, language }: { date: string; language: string; }) => {
  const [formattedDate, setFormattedDate] = useState('');

  useEffect(() => {
    // This logic is now safe inside useEffect, as it only runs on the client
    setFormattedDate(
      new Date(date).toLocaleDateString(language, {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
      })
    );
  }, [date, language]);

  if (!formattedDate) {
    return <Skeleton className="h-4 w-32" />;
  }
  
  return <span>{formattedDate}</span>;
};


export default function EventsPage() {
  const { t, language } = useLanguage();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isConfigured] = useState(isFirebaseConfigured());

  const loadEvents = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const fetchedEvents = await getEvents();
      setEvents(fetchedEvents);
    } catch (error: any) {
      setFetchError(error.message || "An unexpected error occurred.");
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isConfigured) {
      loadEvents();
    } else {
      setIsLoading(false);
    }
  }, [isConfigured, loadEvents]);

  if (!isConfigured) {
    return (
      <div className="container py-12">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Firebase Configuration Error</AlertTitle>
          <AlertDescription>
            <p>Cannot display events because the application is not connected to the database.</p>
            <p className="mt-2 font-bold">Please open the file <code>src/lib/firebase.ts</code> and follow the instructions to add your Firebase credentials.</p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-12 md:py-24">
      <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl font-headline text-primary">
          {t("upcomingEvents")}
        </h1>
        <p className="max-w-[900px] text-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
          {t("upcomingEventsSub")}
        </p>
      </div>

      {fetchError && (
        <Alert variant="destructive" className="mb-8">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error Loading Data</AlertTitle>
            <AlertDescription>
                <p className="mb-2">There was a problem fetching data from the database. This can happen for a few reasons:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                    <li><strong>Firebase Not Configured:</strong> Your <code>src/lib/firebase.ts</code> file might have incorrect or missing credentials.</li>
                    <li><strong>Security Rules:</strong> Your <a href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore/rules`} target="_blank" rel="noopener noreferrer" className="underline font-semibold">Firestore Security Rules</a> might be blocking public access. Make sure the `events` collection is readable by everyone.</li>
                    <li><strong>Database Index Missing:</strong> Firestore sometimes requires a special index for sorting data. If the error mentions "index", please check the browser's developer console (F12) for a direct link to create it.</li>
                </ul>
                <p className="mt-3"><strong>Raw Error:</strong> {fetchError}</p>
            </AlertDescription>
        </Alert>
      )}
      
      {isLoading ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
            {Array.from({length: 2}).map((_, i) => (
                <Card key={i} className="flex flex-col overflow-hidden">
                    <Skeleton className="w-full h-[340px]" />
                    <CardContent className="flex-1 p-6">
                        <Skeleton className="h-8 w-3/4 mb-4" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-full" />
                    </CardContent>
                    <CardFooter className="p-6 pt-0">
                        <Skeleton className="h-6 w-1/2" />
                    </CardFooter>
                </Card>
            ))}
        </div>
      ) : events.length === 0 && !fetchError ? (
        <div className="text-center text-muted-foreground py-16 flex flex-col items-center gap-4">
            <Info className="w-16 h-16" />
            <p className="text-xl">No upcoming events at the moment.</p>
            <p>Please check back later for new and exciting activities!</p>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
          {events.map((event) => (
            <Card
              key={event.id}
              className="flex flex-col overflow-hidden transition-all hover:shadow-xl"
            >
              <CardHeader className="p-0">
                <Image
                  src={event.image || "https://placehold.co/600x400.png"}
                  data-ai-hint={event.aiHint}
                  alt={event.title}
                  width={600}
                  height={400}
                  className="w-full aspect-video object-cover"
                />
              </CardHeader>
              <CardContent className="flex-1 p-6">
                <CardTitle className="font-headline text-2xl text-primary/90">
                  {event.title}
                </CardTitle>
                <CardDescription className="mt-2 text-base">
                  {event.description}
                </CardDescription>
              </CardContent>
              <CardFooter className="p-6 pt-0">
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4" />
                  <FormattedEventDate date={event.date} language={language} />
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
