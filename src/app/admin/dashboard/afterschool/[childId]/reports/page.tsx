
"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, Edit, Trash2, PlusCircle, AlertTriangle, Smile, Meh, Frown, Zap, Bed } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

import type { Child, DailyReport } from "@/lib/types";
import { getAfterschoolChildById } from "@/services/afterschoolService";
import { getReportsByChildId, addReport, updateReport, deleteReport } from "@/services/reportService";
import { uploadImage, deleteImageFromUrl } from "@/services/storageService";
import { firebaseConfig } from "@/lib/firebase";

const reportFormSchema = z.object({
  date: z.string().min(1, "Date is required."),
  mood: z.enum(["happy", "calm", "sad", "energetic", "tired"]),
  activities: z.string().min(10, "Please describe the activities."),
  meals: z.string().min(5, "Please describe the meals."),
  naps: z.string().min(5, "Please describe nap times."),
  notes: z.string().optional(),
  photo: z.any().optional(),
});

type ReportFormData = z.infer<typeof reportFormSchema>;

const moodIcons = {
    happy: <Smile className="h-5 w-5 text-green-500" />,
    calm: <Meh className="h-5 w-5 text-blue-500" />,
    sad: <Frown className="h-5 w-5 text-red-500" />,
    energetic: <Zap className="h-5 w-5 text-yellow-500" />,
    tired: <Bed className="h-5 w-5 text-purple-500" />,
};

export default function ManageAfterschoolReportsPage() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const router = useRouter();
  const params = useParams();
  const childId = params.childId as string;
  
  const [child, setChild] = useState<Child | null>(null);
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [editingReport, setEditingReport] = useState<DailyReport | null>(null);
  const [reportToDelete, setReportToDelete] = useState<DailyReport | null>(null);
  const [submissionError, setSubmissionError] = useState<{title: string, description: React.ReactNode} | null>(null);


  const form = useForm<ReportFormData>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      mood: "happy",
      activities: "",
      meals: "",
      naps: "",
      notes: "",
      photo: undefined,
    },
  });

  const fetchChildAndReports = useCallback(async () => {
    setIsLoading(true);
    if (!childId) return;
    try {
      const [childData, reportsData] = await Promise.all([
        getAfterschoolChildById(childId),
        getReportsByChildId(childId),
      ]);
      setChild(childData);
      setReports(reportsData);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: (error as Error).message });
      router.push("/admin/dashboard/afterschool");
    } finally {
      setIsLoading(false);
    }
  }, [childId, toast, router]);

  useEffect(() => {
    fetchChildAndReports();
  }, [fetchChildAndReports]);

  const handleEditClick = (report: DailyReport) => {
    setEditingReport(report);
    setSubmissionError(null);
    form.reset({
      date: report.date,
      mood: report.mood,
      activities: report.activities,
      meals: report.meals,
      naps: report.naps,
      notes: report.notes || "",
      photo: undefined,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingReport(null);
    setSubmissionError(null);
    form.reset({ date: new Date().toISOString().split('T')[0], mood: "happy", activities: "", meals: "", naps: "", notes: "" });
  };

  const confirmDelete = async () => {
    if (!reportToDelete) return;
    try {
      if (reportToDelete.photoUrl) {
        await deleteImageFromUrl(reportToDelete.photoUrl);
      }
      await deleteReport(reportToDelete.id);
      toast({ title: "Report Deleted", description: `The report for ${reportToDelete.date} has been deleted.`, variant: "destructive" });
      await fetchChildAndReports();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: (error as Error).message });
    } finally {
      setReportToDelete(null);
    }
  };

  const onSubmit = async (values: ReportFormData) => {
    setIsSaving(true);
    setSubmissionError(null);
    try {
      let photoUrl = editingReport?.photoUrl;
      const file = values.photo?.[0];

      if (file) {
        if (editingReport?.photoUrl && editingReport.photoUrl.includes('firebasestorage')) {
          await deleteImageFromUrl(editingReport.photoUrl);
        }
        photoUrl = await uploadImage(file, 'reports');
      }

      // Destructure `photo` from values to prevent it from being sent to Firestore
      const { photo, ...reportContent } = values;

      const reportData: any = { ...reportContent, childId };
      if (photoUrl) {
        reportData.photoUrl = photoUrl;
      }
      
      if (editingReport) {
        await updateReport(editingReport.id, reportData);
        toast({ title: "Report Updated", description: `The report for ${values.date} has been updated.` });
      } else {
        await addReport(reportData);
        toast({ title: "Report Created", description: `A new daily report for ${values.date} has been added.` });
      }
      
      handleCancelEdit();
      await fetchChildAndReports();

    } catch (error) {
       const errorMessage = (error as Error).message || "Could not save the report.";
       let errorTitle = "Save Error";

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
                        <a href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/storage`} target="_blank" rel="noopener noreferrer" className="underline font-semibold">
                          Firebase Console Storage section
                        </a>.
                      </li>
                      <li>If you see a "Get Started" screen, you **must** click through the prompts to enable it. This creates the storage bucket.</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Set Storage CORS Policy using Cloud Shell.</strong>
                     <ul className="list-disc list-inside pl-4 mt-1 space-y-2">
                      <li>
                        Open the{' '}
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
  };

  if (isLoading || !child) {
    return (
      <div className="py-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-10 lg:grid-cols-2">
            <Card><CardContent className="p-6"><Skeleton className="h-96 w-full" /></CardContent></Card>
            <div className="space-y-4">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 space-y-6">
      <div>
        <Button variant="ghost" asChild className="mb-4">
            <Link href="/admin/dashboard/afterschool"><ArrowLeft className="mr-2 h-4 w-4" /> Back to All Afterschool Children</Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">
          Daily Reports for {child.name}
        </h2>
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <h3 className="text-2xl font-semibold mb-4">{editingReport ? `Editing Report for ${editingReport.date}` : "Create New Report"}</h3>
          <Card>
            <CardHeader>
              <CardTitle>{editingReport ? "Update Report" : "New Report Details"}</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                   <FormField control={form.control} name="date" render={({ field }) => (
                      <FormItem>
                          <FormLabel>Date</FormLabel>
                          <FormControl><Input type="date" {...field} disabled={isSaving} /></FormControl>
                          <FormMessage />
                      </FormItem>
                    )} />
                   <FormField control={form.control} name="mood" render={({ field }) => (
                      <FormItem>
                          <FormLabel>Mood</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSaving}>
                            <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select child's mood" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="happy">Happy</SelectItem>
                                <SelectItem value="calm">Calm</SelectItem>
                                <SelectItem value="sad">Sad</SelectItem>
                                <SelectItem value="energetic">Energetic</SelectItem>
                                <SelectItem value="tired">Tired</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="activities" render={({ field }) => (
                      <FormItem>
                          <FormLabel>Today's Activities</FormLabel>
                          <FormControl><Textarea placeholder="What did they do today?" {...field} disabled={isSaving} /></FormControl>
                          <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="meals" render={({ field }) => (
                      <FormItem>
                          <FormLabel>Meals</FormLabel>
                          <FormControl><Textarea placeholder="What did they eat for breakfast, lunch, and snack?" {...field} disabled={isSaving} /></FormControl>
                          <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="naps" render={({ field }) => (
                      <FormItem>
                          <FormLabel>Naps</FormLabel>
                          <FormControl><Textarea placeholder="e.g., Slept from 1pm to 2:30pm" {...field} disabled={isSaving} /></FormControl>
                          <FormMessage />
                      </FormItem>
                    )} />
                     <FormField control={form.control} name="notes" render={({ field }) => (
                      <FormItem>
                          <FormLabel>Additional Notes for Parents</FormLabel>
                          <FormControl><Textarea placeholder="e.g., Please bring extra diapers tomorrow." {...field} disabled={isSaving} /></FormControl>
                          <FormMessage />
                      </FormItem>
                    )} />

                    {editingReport?.photoUrl && (
                        <div>
                            <FormLabel>Current Photo</FormLabel>
                            <Image src={editingReport.photoUrl} alt="Report photo" width={100} height={100} className="rounded-md mt-2 border" />
                        </div>
                    )}

                    <FormField control={form.control} name="photo" render={({ field: { onChange, onBlur, name, ref } }) => (
                        <FormItem>
                            <FormLabel>{editingReport ? "Replace Photo" : "Upload Photo"}</FormLabel>
                            <FormControl>
                                <Input type="file" accept="image/*" onChange={(e) => onChange(e.target.files)} disabled={isSaving} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />

                    <div className="flex gap-2">
                        <Button type="submit" className="w-full" disabled={isSaving}>
                            {isSaving ? "Saving..." : (editingReport ? "Update Report" : "Create Report")}
                        </Button>
                        {editingReport && <Button type="button" variant="outline" onClick={handleCancelEdit} disabled={isSaving}>Cancel</Button>}
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
        
        <div className="space-y-4">
          <h3 className="text-2xl font-semibold">Past Reports</h3>
          {reports.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <p className="text-muted-foreground">No reports have been created for {child.name} yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2">
              {reports.map(report => (
                <Card key={report.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                {moodIcons[report.mood]}
                                Report for {report.date}
                            </CardTitle>
                            <CardDescription className="text-xs mt-1">
                                Created on: {new Date(report.createdAt.toDate()).toLocaleString()}
                            </CardDescription>
                        </div>
                        <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => handleEditClick(report)}><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setReportToDelete(report)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    {report.photoUrl && <Image src={report.photoUrl} alt="Daily report photo" width={400} height={300} className="rounded-md w-full aspect-video object-cover" />}
                    <div><p><strong>Activities:</strong> {report.activities}</p></div>
                    <div><p><strong>Meals:</strong> {report.meals}</p></div>
                    <div><p><strong>Naps:</strong> {report.naps}</p></div>
                    {report.notes && <div><p><strong>Notes:</strong> {report.notes}</p></div>}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      
       <AlertDialog open={!!reportToDelete} onOpenChange={(open) => !open && setReportToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the report for {reportToDelete?.date}. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

    </div>
  );
}
