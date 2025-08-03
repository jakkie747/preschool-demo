
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import type { Document } from "@/lib/types";
import { getDocuments } from "@/services/documentService";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { isFirebaseConfigured, firebaseConfig } from "@/lib/firebase";
import { FileText, Download, AlertTriangle, FileQuestion } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const FormattedDate = ({ date, language }: { date: any; language: string }) => {
  const [formattedDate, setFormattedDate] = useState('');

  useEffect(() => {
    if (date && typeof date.toDate === 'function') {
      setFormattedDate(
        date.toDate().toLocaleDateString(language, {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      );
    } else {
        setFormattedDate("Date not available")
    }
  }, [date, language]);

  if (!formattedDate) {
    return <Skeleton className="h-4 w-32" />;
  }
  
  return <span className="text-xs text-muted-foreground">{formattedDate}</span>;
};


export default function DocumentsPage() {
  const { t, language } = useLanguage();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isConfigured] = useState(isFirebaseConfigured());

  const loadDocuments = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const fetchedDocuments = await getDocuments();
      setDocuments(fetchedDocuments);
    } catch (error: any) {
      setFetchError(error.message || "An unexpected error occurred.");
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isConfigured) {
      loadDocuments();
    } else {
      setIsLoading(false);
    }
  }, [isConfigured, loadDocuments]);

  if (!isConfigured) {
    return (
      <div className="container py-12">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Firebase Configuration Error</AlertTitle>
          <AlertDescription>
            <p>Cannot display documents because the application is not connected to the database.</p>
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
          {t("documentsTitle")}
        </h1>
        <p className="max-w-[900px] text-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
          {t("documentsSub")}
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
                    <li><strong>Security Rules:</strong> Your <a href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore/rules`} target="_blank" rel="noopener noreferrer" className="underline font-semibold">Firestore Security Rules</a> might be blocking public access. Make sure the `documents` collection is readable by everyone.</li>
                    <li><strong>Database Index Missing:</strong> Firestore sometimes requires a special index for sorting data. If the error mentions "index", please check the browser's developer console (F12) for a direct link to create it.</li>
                </ul>
                <p className="mt-3"><strong>Raw Error:</strong> {fetchError}</p>
            </AlertDescription>
        </Alert>
      )}
      
      {isLoading ? (
        <div className="max-w-4xl mx-auto space-y-4">
            {Array.from({length: 4}).map((_, i) => (
                <Card key={i} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10" />
                        <div className="space-y-2">
                           <Skeleton className="h-5 w-48" />
                           <Skeleton className="h-3 w-32" />
                        </div>
                    </div>
                    <Skeleton className="h-10 w-28" />
                </Card>
            ))}
        </div>
      ) : documents.length === 0 && !fetchError ? (
        <div className="text-center text-muted-foreground py-16 flex flex-col items-center gap-4">
            <FileQuestion className="w-16 h-16" />
            <p className="text-xl">{t('noDocuments')}</p>
            <p>{t('noDocumentsDesc')}</p>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-4">
          {documents.map((doc) => (
            <Card
              key={doc.id}
              className="flex items-center justify-between p-4 transition-all hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                  <FileText className="h-8 w-8 text-primary/70" />
                  <div>
                    <h3 className="font-semibold text-lg">{doc.title}</h3>
                    <FormattedDate date={doc.createdAt} language={language} />
                  </div>
              </div>
              <Button asChild>
                <Link href={doc.fileUrl} target="_blank" rel="noopener noreferrer" download>
                  <Download className="mr-2 h-4 w-4" />
                  {t("download")}
                </Link>
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
