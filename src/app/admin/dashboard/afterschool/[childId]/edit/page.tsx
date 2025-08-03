
"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ArrowLeft, Baby, FileText, HeartPulse, Home, User, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import type { Child } from "@/lib/types";
import { getAfterschoolChildById, updateAfterschoolChild } from "@/services/afterschoolService";
import { uploadImage, deleteImageFromUrl } from "@/services/storageService";
import { firebaseConfig } from "@/lib/firebase";
import { deleteField } from "firebase/firestore";

const childEditFormSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  dateOfBirth: z.string().refine(v => v, { message: "Date of Birth is required." }),
  gender: z.enum(["male", "female", "other"]),
  photo: z.any().optional(),
  parent: z.string().min(2, "Parent name is too short"),
  parentEmail: z.string().email(),
  parentPhone: z.string().min(10, "Phone number is too short"),
  address: z.string().min(10, "Address is too short"),
  emergencyContactName: z.string().min(2, "Emergency contact name is too short"),
  emergencyContactPhone: z.string().min(10, "Emergency phone is too short"),
  medicalConditions: z.string().optional(),
  previousPreschool: z.enum(["yes", "no"]),
  additionalNotes: z.string().optional(),
});

export default function EditAfterschoolChildPage() {
    const { t } = useLanguage();
    const { toast } = useToast();
    const router = useRouter();
    const params = useParams();
    const childId = params.childId as string;

    const [child, setChild] = useState<Child | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [submissionError, setSubmissionError] = useState<{title: string, description: React.ReactNode} | null>(null);

    const form = useForm<z.infer<typeof childEditFormSchema>>({
        resolver: zodResolver(childEditFormSchema),
        defaultValues: {
            name: "",
            dateOfBirth: "",
            parent: "",
            parentEmail: "",
            parentPhone: "",
            address: "",
            emergencyContactName: "",
            emergencyContactPhone: "",
            medicalConditions: "",
            additionalNotes: "",
            gender: "other",
            previousPreschool: "no",
            photo: undefined,
        },
    });

    const fetchChildData = useCallback(async () => {
        if (!childId) return;
        setIsLoading(true);
        try {
            const childData = await getAfterschoolChildById(childId);
            if (childData) {
                setChild(childData);
                form.reset({
                    name: childData.name || '',
                    dateOfBirth: childData.dateOfBirth || '',
                    gender: childData.gender || 'other',
                    photo: undefined,
                    parent: childData.parent || '',
                    parentEmail: childData.parentEmail || '',
                    parentPhone: childData.parentPhone || '',
                    address: childData.address || '',
                    emergencyContactName: childData.emergencyContactName || '',
                    emergencyContactPhone: childData.emergencyContactPhone || '',
                    medicalConditions: childData.medicalConditions || '',
                    previousPreschool: childData.previousPreschool || 'no',
                    additionalNotes: childData.additionalNotes || '',
                });
            } else {
                toast({ variant: "destructive", title: "Child not found" });
                router.push('/admin/dashboard/afterschool');
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: (error as Error).message });
        } finally {
            setIsLoading(false);
        }
    }, [childId, form, router, toast]);

    useEffect(() => {
        fetchChildData();
    }, [fetchChildData]);
    
    const onSubmit = async (values: z.infer<typeof childEditFormSchema>) => {
        if (!child) return;
        setIsSaving(true);
        setSubmissionError(null);
        try {
            let photoUrl = child.photo;
            const file = values.photo?.[0];

            if (file) {
                if (child.photo && child.photo.includes('firebasestorage')) {
                await deleteImageFromUrl(child.photo);
                }
                photoUrl = await uploadImage(file, 'children');
            }

            const updateData: Partial<Omit<Child, 'id'>> & { updatedByParentAt?: any } = {
                name: values.name,
                dateOfBirth: values.dateOfBirth,
                gender: values.gender,
                parent: values.parent,
                parentEmail: values.parentEmail,
                parentPhone: values.parentPhone,
                address: values.address,
                emergencyContactName: values.emergencyContactName,
                emergencyContactPhone: values.emergencyContactPhone,
                medicalConditions: values.medicalConditions,
                previousPreschool: values.previousPreschool,
                additionalNotes: values.additionalNotes,
                photo: photoUrl,
            };

            if (child.updatedByParentAt) {
                updateData.updatedByParentAt = deleteField();
            }

            await updateAfterschoolChild(child.id, updateData);
            
            toast({ title: t('childUpdated'), description: t('childUpdatedDesc', { name: values.name }) });
            router.push('/admin/dashboard/afterschool');
            
        } catch (error) {
            const errorMessage = (error as Error).message || "Could not update profile.";
            let errorTitle = "Error updating profile";
             if (errorMessage.includes("timed out") || errorMessage.includes("storage/object-not-found") || errorMessage.toLowerCase().includes('network')) {
                errorTitle = "Save Failed: Firebase Storage Not Ready";
                setSubmissionError({
                title: errorTitle,
                description: (
                    <div className="space-y-4 text-sm">
                        <p className="font-bold text-base">This error usually means your Firebase project is not fully configured for file uploads.</p>
                        <p className="mb-2">Please complete the following one-time setup steps.</p>
                        <ol className="list-decimal list-inside space-y-4 pl-2">
                        <li><strong>Enable Firebase Storage.</strong></li>
                        <li><strong>Update Your Security Rules.</strong></li>
                        <li><strong>Set Storage CORS Policy using Cloud Shell.</strong> See SETUP_GUIDE.md for exact commands.</li>
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


    if (isLoading) {
        return (
            <div className="py-6 space-y-4">
                <Skeleton className="h-8 w-64" />
                <Card><CardContent className="p-6"><Skeleton className="h-96 w-full" /></CardContent></Card>
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
                    Edit Profile for {child?.name}
                </h2>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Child's Details</CardTitle>
                    <CardDescription>Update the child's information below. Click save when you're done.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <div className="space-y-4">
                                <h3 className="text-xl font-headline text-primary/80 flex items-center gap-2"><Baby /> {t('childInfo')}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} disabled={isSaving} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="dateOfBirth" render={({ field }) => (<FormItem><FormLabel>Date of Birth</FormLabel><FormControl><Input type="date" {...field} disabled={isSaving} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="gender" render={({ field }) => (<FormItem><FormLabel>Gender</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSaving}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="photo" render={({ field: { onChange } }) => (<FormItem><FormLabel>Replace Photo</FormLabel>{child?.photo && <Image src={child.photo} alt="Current photo" width={60} height={60} className="rounded-md object-cover"/>}<FormControl><Input type="file" accept="image/*" onChange={(e) => onChange(e.target.files)} disabled={isSaving} /></FormControl><FormDescription>Upload a new photo to replace the old one.</FormDescription><FormMessage /></FormItem>)} />
                                </div>
                            </div>
                            
                            <div className="space-y-4 pt-4">
                                <h3 className="text-xl font-headline text-primary/80 flex items-center gap-2"><User /> {t('parentInfo')}</h3>
                                <FormField control={form.control} name="parent" render={({ field }) => (<FormItem><FormLabel>Parent's Full Name</FormLabel><FormControl><Input {...field} disabled={isSaving} /></FormControl><FormMessage /></FormItem>)} />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField control={form.control} name="parentEmail" render={({ field }) => (<FormItem><FormLabel>Parent's Email</FormLabel><FormControl><Input type="email" {...field} disabled={isSaving} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="parentPhone" render={({ field }) => (<FormItem><FormLabel>Parent's Phone</FormLabel><FormControl><Input type="tel" {...field} disabled={isSaving} /></FormControl><FormMessage /></FormItem>)} />
                                </div>
                                <FormField control={form.control} name="address" render={({ field }) => (<FormItem><FormLabel>Physical Address</FormLabel><FormControl><Textarea {...field} disabled={isSaving} /></FormControl><FormMessage /></FormItem>)} />
                            </div>
                            
                             <div className="space-y-4 pt-4">
                                <h3 className="text-xl font-headline text-primary/80 flex items-center gap-2"><HeartPulse /> {t('emergencyMedicalInfo')}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField control={form.control} name="emergencyContactName" render={({ field }) => (<FormItem><FormLabel>Emergency Contact Name</FormLabel><FormControl><Input {...field} disabled={isSaving} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="emergencyContactPhone" render={({ field }) => (<FormItem><FormLabel>Emergency Contact Phone</FormLabel><FormControl><Input type="tel" {...field} disabled={isSaving} /></FormControl><FormMessage /></FormItem>)} />
                                </div>
                                <FormField control={form.control} name="medicalConditions" render={({ field }) => (<FormItem><FormLabel>Medical Conditions / Allergies</FormLabel><FormControl><Textarea {...field} disabled={isSaving} /></FormControl><FormMessage /></FormItem>)} />
                            </div>
                            
                            <div className="space-y-4 pt-4">
                                <h3 className="text-xl font-headline text-primary/80 flex items-center gap-2"><FileText /> {t('otherInfo')}</h3>
                                <FormField control={form.control} name="previousPreschool" render={({ field }) => (<FormItem className="space-y-3"><FormLabel>Previous Preschool Experience?</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4" disabled={isSaving}><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="additionalNotes" render={({ field }) => (<FormItem><FormLabel>Additional Notes</FormLabel><FormControl><Textarea {...field} disabled={isSaving} /></FormControl><FormMessage /></FormItem>)} />
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : t('saveChanges')}</Button>
                                <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSaving}>{t('cancel')}</Button>
                            </div>
                             {submissionError && (
                                <Alert variant="destructive" className="mt-4">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertTitle>{submissionError.title}</AlertTitle>
                                    <AlertDescription>
                                    {submissionError.description}
                                    </AlertDescription>
                                </Alert>
                            )}
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
