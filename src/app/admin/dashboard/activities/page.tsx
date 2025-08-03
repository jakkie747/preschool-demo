
"use client";
import { useState, useEffect, useCallback } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Image from "next/image";
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
import { Textarea } from "@/components/ui/textarea";
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
import { Edit, Trash2, AlertTriangle } from "lucide-react";
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
import type { Activity } from "@/lib/types";
import { getActivities, addActivity, updateActivity, deleteActivity } from "@/services/activityService";
import { uploadImage, deleteImageFromUrl } from "@/services/storageService";
import { Skeleton } from "@/components/ui/skeleton";
import { isFirebaseConfigured, firebaseConfig } from "@/lib/firebase";

const activityFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters long"),
  image: z.any().optional(),
});

export default function ManageActivitiesPage() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [activityToDelete, setActivityToDelete] = useState<Activity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isConfigured] = useState(isFirebaseConfigured());
  const [submissionError, setSubmissionError] = useState<{title: string, description: React.ReactNode} | null>(null);

  const form = useForm<z.infer<typeof activityFormSchema>>({
    resolver: zodResolver(activityFormSchema),
    defaultValues: {
      title: "",
      description: "",
      image: undefined,
    },
  });

  const fetchActivities = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedActivities = await getActivities();
      setActivities(fetchedActivities);
    } catch (error: any) {
      let title = "Error Loading Activities";
      let description = error.message || "An unexpected error occurred while fetching activities.";

      if (error.message.includes("firestore/failed-precondition") || error.message.includes("index")) {
        title = "Database Index Required";
        description = "A database index is required. Please open the browser console (F12) to find a link to create the required Firestore index, then refresh the page.";
        console.error("Firebase Error: The following error message contains a link to create the required Firestore index. Please click the link to resolve the issue:", error);
      }

      toast({
        variant: "destructive",
        title: title,
        description: description,
        duration: 15000,
      });
      setActivities([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (isConfigured) {
      fetchActivities();
    } else {
      setIsLoading(false);
    }
  }, [isConfigured, fetchActivities]);

  const handleEditClick = (activity: Activity) => {
    setEditingActivity(activity);
    setSubmissionError(null);
    form.reset({
      title: activity.title,
      description: activity.description,
      image: undefined,
    });
  };

  const handleCancelClick = () => {
    setEditingActivity(null);
    setSubmissionError(null);
    form.reset();
  };

  const handleDeleteClick = (activity: Activity) => {
    setActivityToDelete(activity);
  };

  const confirmDelete = async () => {
    if (activityToDelete) {
      try {
        if (activityToDelete.image) {
          await deleteImageFromUrl(activityToDelete.image);
        }
        await deleteActivity(activityToDelete.id);
        await fetchActivities();
        toast({
          title: t('galleryItemDeleted'),
          description: t('galleryItemDeletedDesc', { title: activityToDelete.title }),
          variant: "destructive",
        });
      } catch (error) {
        const errorMessage = (error as Error).message;
        toast({ variant: "destructive", title: "Error", description: errorMessage || "Could not delete gallery item." });
      } finally {
        setActivityToDelete(null);
      }
    }
  };

  async function onSubmit(values: z.infer<typeof activityFormSchema>) {
    setSubmissionError(null);
    if (!isConfigured) {
       setSubmissionError({
        title: "Firebase Not Configured",
        description: "Please configure your Firebase credentials in src/lib/firebase.ts before saving.",
      });
      return;
    }

    setIsSaving(true);
    const file = values.image?.[0];
    let imageUrl: string | undefined = editingActivity?.image;

    try {
      if (file) {
        const newImageUrl = await uploadImage(file, 'activities');
        if (editingActivity?.image) {
          // Avoid deleting placeholder images
          if (editingActivity.image.includes('firebasestorage')) {
            await deleteImageFromUrl(editingActivity.image);
          }
        }
        imageUrl = newImageUrl;
      }

      const activityPayload = {
        title: values.title,
        description: values.description,
        image: imageUrl || `https://placehold.co/400x300.png`,
      };

      if (editingActivity) {
        await updateActivity(editingActivity.id, activityPayload);
        toast({
          title: t('galleryItemUpdated'),
          description: t('galleryItemUpdatedDesc', { title: values.title }),
        });
      } else {
        const newActivity: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'> = {
          ...activityPayload
        };
        await addActivity(newActivity);
        toast({
          title: t('galleryItemCreated'),
          description: t('galleryItemCreatedDesc', { title: values.title }),
        });
      }
      
      await fetchActivities();
      setEditingActivity(null);
      form.reset();

    } catch (error) {
      const errorMessage = (error as Error).message || "Could not save the gallery item.";
      let errorTitle = "Error Saving Item";

      if (errorMessage.includes("timed out") || errorMessage.includes("storage/object-not-found") || errorMessage.toLowerCase().includes('network')) {
        errorTitle = "Save Failed: Firebase Storage Not Ready";
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
                      <li>
                        Go to your{' '}
                        <a
                          href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/storage`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline font-semibold"
                        >
                          Firebase Console Storage section
                        </a>
                        .
                      </li>
                      <li>
                        If you see a "Get Started" screen, you **must** click through the prompts to enable it. This creates the storage bucket.
                      </li>
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
                        <a
                          href={`https://console.cloud.google.com/home/dashboard?project=${firebaseConfig.projectId}&cloudshell=true`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline"
                        >
                          Google Cloud Shell
                        </a>
                        .
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
                  <li>
                      <strong>Try Again.</strong>
                       <p>After completing all these steps, refresh this page and try saving the item again.</p>
                  </li>
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
            <p>Cannot manage gallery because the application is not connected to Firebase.</p>
            <p className="mt-2 font-bold">Please open the file <code>src/lib/firebase.ts</code> and follow the instructions to add your Firebase credentials.</p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="py-6 grid gap-10 lg:grid-cols-2">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-4">
          {editingActivity ? t('editingGalleryItem', { title: editingActivity.title }) : t('createNewGalleryItemTitle')}
        </h2>
        <Card>
          <CardHeader>
            <CardTitle>
              {editingActivity
                ? t('editingGalleryItem', { title: editingActivity.title })
                : t('galleryItemDetails')}
            </CardTitle>
            <CardDescription>
              {editingActivity
                ? t('updateGalleryItemDetails')
                : t('createGalleryItemDetails')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('galleryItemTitle')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('egArtDay')}
                          {...field}
                          disabled={isSaving}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('description')}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t('describeGalleryItem')}
                          {...field}
                          disabled={isSaving}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {editingActivity?.image && (
                  <div className="space-y-2">
                    <FormLabel>{t('currentImage')}</FormLabel>
                    <Image
                      src={editingActivity.image}
                      alt={editingActivity.title}
                      width={100}
                      height={100}
                      className="rounded-md object-cover border"
                    />
                  </div>
                )}
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field: { onChange, onBlur, name, ref } }) => (
                    <FormItem>
                      <FormLabel>{t('galleryItemImage')}</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept="image/png, image/jpeg, image/gif, image/webp, image/avif"
                          onChange={(e) => onChange(e.target.files)}
                          onBlur={onBlur}
                          name={name}
                          ref={ref}
                          disabled={isSaving}
                        />
                      </FormControl>
                      <FormDescription>
                        {editingActivity
                          ? t('replaceImage')
                          : t('uploadImage')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-2">
                  <Button type="submit" className="w-full" disabled={isSaving || !isConfigured}>
                    {isSaving ? "Saving..." : editingActivity ? t('updateGalleryItem') : t('createGalleryItem')}
                  </Button>
                  {editingActivity && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handleCancelClick}
                      disabled={isSaving}
                    >
                      {t('cancel')}
                    </Button>
                  )}
                </div>
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
        <h2 className="text-3xl font-bold tracking-tight mb-4">
          {t('existingGalleryItems')}
        </h2>
        <div className="w-full overflow-x-auto">
          <Card>
            <CardContent className="p-0">
               <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('title')}</TableHead>
                    <TableHead>{t('description')}</TableHead>
                    <TableHead>{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                      </TableRow>
                    ))
                  ) : activities.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center">
                        No gallery items created yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    activities.map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell className="font-medium">{activity.title}</TableCell>
                        <TableCell>{activity.description.substring(0, 50)}...</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditClick(activity)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDeleteClick(activity)}
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
        <AlertDialog
          open={!!activityToDelete}
          onOpenChange={(open) => !open && setActivityToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('areYouSure')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('galleryItemDeletedDesc', { title: activityToDelete?.title || '' })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete}>
                {t('delete')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
