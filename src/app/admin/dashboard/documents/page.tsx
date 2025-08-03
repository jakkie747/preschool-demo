
"use client";

import { useState, useEffect, useCallback } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, AlertTriangle, Download } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useLanguage } from "@/context/LanguageContext";
import type { Document } from "@/lib/types";
import { getDocuments, addDocument, deleteDocument } from "@/services/documentService";
import { uploadImage, deleteImageFromUrl } from "@/services/storageService";
import { Skeleton } from "@/components/ui/skeleton";
import { isFirebaseConfigured, firebaseConfig } from "@/lib/firebase";
import Link from "next/link";

const documentFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  file: z.any().refine((files) => files?.length > 0, "File is required."),
});

export default function ManageDocumentsPage() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [docToDelete, setDocToDelete] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isConfigured] = useState(isFirebaseConfigured());
  const [submissionError, setSubmissionError] = useState<{title: string, description: React.ReactNode} | null>(null);

  const form = useForm<z.infer<typeof documentFormSchema>>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: {
      title: "",
      file: undefined,
    },
  });

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedDocs = await getDocuments();
      setDocuments(fetchedDocs);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Could not fetch documents." });
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (isConfigured) {
      fetchDocuments();
    } else {
      setIsLoading(false);
    }
  }, [isConfigured, fetchDocuments]);

  const handleDeleteClick = (doc: Document) => {
    setDocToDelete(doc);
  };

  const confirmDelete = async () => {
    if (docToDelete) {
      try {
        await deleteImageFromUrl(docToDelete.fileUrl);
        await deleteDocument(docToDelete.id);
        await fetchDocuments();
        toast({
          title: t('documentDeleted'),
          description: t('documentDeletedDesc', { title: docToDelete.title }),
          variant: "destructive",
        });
      } catch (error) {
        const errorMessage = (error as Error).message;
        toast({ variant: "destructive", title: "Error", description: errorMessage || "Could not delete document." });
      } finally {
        setDocToDelete(null);
      }
    }
  };

  async function onSubmit(values: z.infer<typeof documentFormSchema>) {
    setSubmissionError(null);
    if (!isConfigured) {
      toast({ variant: "destructive", title: "Firebase Not Configured", description: "Please configure Firebase credentials." });
      return;
    }

    setIsSaving(true);
    const file = values.file[0];

    try {
      const fileUrl = await uploadImage(file, 'documents');
      await addDocument({ title: values.title, fileUrl });
      
      toast({
        title: t('documentUploaded'),
        description: t('documentUploadedDesc', { title: values.title }),
      });
      
      await fetchDocuments();
      form.reset();
    } catch (error) {
       const errorMessage = (error as Error).message || "Could not upload document.";
       let errorTitle = "Error Uploading Document";

        if (errorMessage.includes("timed out") || errorMessage.includes("storage/object-not-found") || errorMessage.toLowerCase().includes('network')) {
          errorTitle = "Upload Failed: Firebase Storage Not Ready";
          setSubmissionError({
            title: errorTitle,
            description: (
              <div className="space-y-4 text-sm">
                <p className="font-bold text-base">
                  This error usually means your Firebase project is not fully configured for file uploads.
                </p>
                <p className="mb-2">Please complete the following one-time setup steps.</p>
                <ol className="list-decimal list-inside space-y-4 pl-2">
                  <li>
                    <strong>Crucial First Step: Enable Firebase Storage.</strong>
                    <ul className="list-disc list-inside pl-4 mt-1 space-y-1">
                      <li>Go to your{' '}
                        <a href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/storage`} target="_blank" rel="noopener noreferrer" className="underline font-semibold">
                          Firebase Console Storage section
                        </a>.
                      </li>
                      <li>If you see a "Get Started" screen, you **must** click through the prompts to enable it. This creates the storage bucket.</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Update Your Security Rules.</strong>
                     <ul className="list-disc list-inside pl-4 mt-1 space-y-1">
                      <li>
                         Open your{' '}
                        <a
                          href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/storage/rules`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline"
                        >
                          Storage Rules
                        </a> and replace the content with the rules from the `storage.rules` file in your project. Click <strong>Publish</strong>.
                      </li>
                    </ul>
                  </li>
                  <li>
                    <strong>Set Storage CORS Policy using Cloud Shell.</strong>
                    <ul className="list-disc list-inside pl-4 mt-1 space-y-2">
                      <li>
                        This step is required to allow your web app to upload files. Open the{' '}
                        <a href={`https://console.cloud.google.com/home/dashboard?project=${firebaseConfig.projectId}&cloudshell=true`} target="_blank" rel="noopener noreferrer" className="underline">
                          Google Cloud Shell
                        </a>.
                      </li>
                      <li>
                        Run these two commands one by one. Copy them exactly.
                        <pre className="text-xs bg-muted p-2 rounded-md overflow-x-auto mt-2 select-all">
                          {`echo '[{"origin": ["*"], "method": ["GET", "PUT", "POST"], "responseHeader": ["Content-Type"], "maxAgeSeconds": 3600}]' > cors.json`}
                        </pre>
                        <p className="mt-2 font-semibold">
                          Crucial Note: For the next command, the Cloud Shell needs your bucket name in the format <code>gs://project-id.appspot.com</code>. Your Firebase Console may show a different URL (ending in `firebasestorage.app`), but for this command to work, you must use the `.appspot.com` version. Copy the command below exactly as it is:
                        </p>
                        <pre className="text-xs bg-muted p-2 rounded-md overflow-x-auto mt-1 select-all">{`gsutil cors set cors.json gs://${firebaseConfig.projectId}.appspot.com`}</pre>
                      </li>
                    </ul>
                  </li>
                  <li><strong>Try Again.</strong> After completing all steps, refresh and try again.</li>
                </ol>
              </div>
            )
          });
        } else {
          setSubmissionError({ title: errorTitle, description: errorMessage });
        }
    } finally {
      setIsSaving(false);
    }
  }

  if (!isConfigured) {
    return (
      <div className="container py-12">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Firebase Configuration Error</AlertTitle>
          <AlertDescription>
            <p>Cannot manage documents because the application is not connected to Firebase.</p>
            <p className="mt-2 font-bold">Please open the file <code>src/lib/firebase.ts</code> and follow the instructions.</p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="py-6 grid gap-10 lg:grid-cols-2">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-4">
          {t('uploadNewDocument')}
        </h2>
        <Card>
          <CardHeader>
            <CardTitle>{t('documentDetails')}</CardTitle>
            <CardDescription>{t('documentDetailsDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('documentTitle')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('egNewsletter')} {...field} disabled={isSaving} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="file"
                  render={({ field: { onChange, onBlur, name, ref } }) => (
                    <FormItem>
                      <FormLabel>{t('file')}</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept=".pdf,.doc,.docx,.png,.jpeg,.jpg"
                          onChange={(e) => onChange(e.target.files)}
                          onBlur={onBlur}
                          name={name}
                          ref={ref}
                          disabled={isSaving}
                        />
                      </FormControl>
                      <FormDescription>{t('fileDesc')}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isSaving}>
                  {isSaving ? "Uploading..." : t('uploadDocument')}
                </Button>
              </form>
            </Form>
             {submissionError && (
              <Alert variant="destructive" className="mt-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>{submissionError.title}</AlertTitle>
                <AlertDescription>
                  {submissionError.description}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-4">{t('existingDocuments')}</h2>
        <div className="w-full overflow-x-auto">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('title')}</TableHead>
                    <TableHead>{t('uploadedOn')}</TableHead>
                    <TableHead>{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                      </TableRow>
                    ))
                  ) : documents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center">No documents uploaded yet.</TableCell>
                    </TableRow>
                  ) : (
                    documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium">{doc.title}</TableCell>
                        <TableCell>{new Date(doc.createdAt?.toDate()).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button asChild variant="ghost" size="icon">
                                <Link href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                                    <Download className="h-4 w-4" />
                                </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDeleteClick(doc)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        <AlertDialog open={!!docToDelete} onOpenChange={(open) => !open && setDocToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('areYouSure')}</AlertDialogTitle>
              <AlertDialogDescription>{t('deleteDocumentConfirm', { title: docToDelete?.title || '' })}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete}>{t('delete')}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
