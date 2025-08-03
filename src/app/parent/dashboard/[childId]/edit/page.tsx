
"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ArrowLeft, Baby, HeartPulse, User, AlertTriangle, CalendarDays, FileText } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

import type { Child } from "@/lib/types";
import { getChildById, updateChild } from "@/services/childrenService";
import { getAfterschoolChildById, updateAfterschoolChild } from "@/services/afterschoolService";
import { uploadImage, deleteImageFromUrl } from "@/services/storageService";
import { serverTimestamp } from "firebase/firestore";

const parentEditSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  dateOfBirth: z.string().refine((dob) => dob && !isNaN(new Date(dob).getTime()), {
    message: "Please enter a valid date of birth.",
  }),
  gender: z.enum(["male", "female", "other"]),
  childPhoto: z.any().optional(),
  parentPhone: z.string().min(10, "Please enter a valid phone number"),
  address: z.string().min(10, "Please enter a valid address"),
  emergencyContactName: z.string().min(2, "Name is too short").max(50, "Name is too long"),
  emergencyContactPhone: z.string().min(10, "Please enter a valid phone number"),
  medicalConditions: z.string().optional(),
  previousPreschool: z.enum(["yes", "no"]),
  additionalNotes: z.string().optional(),
});

type ParentEditFormData = z.infer<typeof parentEditSchema>;

export default function ParentEditChildPage() {
    const { toast } = useToast();
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const { user } = useAuth();
    
    const childId = params.childId as string;
    const program = searchParams.get('program') as 'preschool' | 'afterschool' | null;

    const [child, setChild] = useState<Child | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [submissionError, setSubmissionError] = useState<string | null>(null);

    const form = useForm<ParentEditFormData>({
        resolver: zodResolver(parentEditSchema),
    });

    const fetchChildData = useCallback(async () => {
        if (!childId || !program) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const fetcher = program === 'preschool' ? getChildById : getAfterschoolChildById;
            const childData = await fetcher(childId);
            
            if (childData && childData.parentEmail === user?.email) {
                setChild(childData);
                form.reset({
                    name: childData.name || '',
                    dateOfBirth: childData.dateOfBirth || '',
                    gender: childData.gender || 'other',
                    parentPhone: childData.parentPhone || '',
                    address: childData.address || '',
                    emergencyContactName: childData.emergencyContactName || '',
                    emergencyContactPhone: childData.emergencyContactPhone || '',
                    medicalConditions: childData.medicalConditions || '',
                    previousPreschool: childData.previousPreschool || 'no',
                    additionalNotes: childData.additionalNotes || '',
                });
            } else {
                toast({ variant: "destructive", title: "Unauthorized", description: "You do not have permission to edit this profile." });
                router.push('/parent/dashboard');
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: (error as Error).message });
        } finally {
            setIsLoading(false);
        }
    }, [childId, program, form, router, toast, user?.email]);

    useEffect(() => {
        if(user) { // Only fetch data when user is available
            fetchChildData();
        }
    }, [user, fetchChildData]);
    
    const onSubmit = async (values: ParentEditFormData) => {
        if (!child || !program) return;
        setIsSaving(true);
        setSubmissionError(null);
        try {
            let photoUrl = child.photo;
            const file = values.childPhoto?.[0];

            if (file) {
                if (child.photo && child.photo.includes('firebasestorage')) {
                  await deleteImageFromUrl(child.photo);
                }
                photoUrl = await uploadImage(file, 'children');
            }

            const updateData: Partial<Omit<Child, 'id'>> = {
                name: values.name,
                dateOfBirth: values.dateOfBirth,
                gender: values.gender,
                parentPhone: values.parentPhone,
                address: values.address,
                emergencyContactName: values.emergencyContactName,
                emergencyContactPhone: values.emergencyContactPhone,
                medicalConditions: values.medicalConditions,
                previousPreschool: values.previousPreschool,
                additionalNotes: values.additionalNotes,
                photo: photoUrl,
                updatedByParentAt: serverTimestamp(),
            };

            const updater = program === 'preschool' ? updateChild : updateAfterschoolChild;
            await updater(child.id, updateData);
            
            toast({ title: "Profile Updated", description: `${child.name}'s profile has been successfully updated.` });
            router.push('/parent/dashboard');
            
        } catch (error) {
            console.error("Profile update error:", error);
            setSubmissionError((error as Error).message || "An unexpected error occurred.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading || !child) {
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
                    <Link href="/parent/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Link>
                </Button>
                <h2 className="text-3xl font-bold tracking-tight">
                    Edit Profile for {child.name}
                </h2>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Child's Details</CardTitle>
                    <CardDescription>You can update your child's information below. An administrator will be notified of any changes.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <div className="space-y-4">
                                <h3 className="text-xl font-headline text-primary/80 flex items-center gap-2"><Baby /> Child's Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} disabled={isSaving} /></FormControl><FormMessage /></FormItem>)} />
                                     <FormField
                                      control={form.control}
                                      name="dateOfBirth"
                                      render={({ field }) => (
                                        <FormItem className="flex flex-col pt-2">
                                          <FormLabel>Date of Birth</FormLabel>
                                          <Popover>
                                            <PopoverTrigger asChild>
                                              <FormControl>
                                                <Button
                                                  variant={"outline"}
                                                  className={cn(
                                                    "w-full pl-3 text-left font-normal",
                                                    !field.value && "text-muted-foreground"
                                                  )}
                                                  disabled={isSaving}
                                                >
                                                  {field.value ? (
                                                    format(new Date(field.value), "PPP")
                                                  ) : (
                                                    <span>Pick a date</span>
                                                  )}
                                                  <CalendarDays className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                              </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                              <Calendar
                                                mode="single"
                                                captionLayout="dropdown"
                                                fromYear={new Date().getFullYear() - 20}
                                                toYear={new Date().getFullYear()}
                                                selected={field.value ? new Date(field.value) : undefined}
                                                onSelect={(date) => {
                                                  if (date) {
                                                    field.onChange(format(date, 'yyyy-MM-dd'));
                                                  }
                                                }}
                                                disabled={(date) => date > new Date()}
                                                initialFocus
                                              />
                                            </PopoverContent>
                                          </Popover>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    <FormField control={form.control} name="gender" render={({ field }) => (<FormItem><FormLabel>Gender</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSaving}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="childPhoto" render={({ field: { onChange } }) => (<FormItem><FormLabel>Replace Photo</FormLabel>{child?.photo && <Image src={child.photo} alt="Current photo" width={60} height={60} className="rounded-md object-cover"/>}<FormControl><Input type="file" accept="image/*" onChange={(e) => onChange(e.target.files)} disabled={isSaving} /></FormControl><FormDescription>Upload a new photo to replace the old one.</FormDescription><FormMessage /></FormItem>)} />
                                </div>
                            </div>
                            
                            {/* Editable Parent Info */}
                            <div className="space-y-4 pt-4">
                                <h3 className="text-xl font-headline text-primary/80 flex items-center gap-2"><User /> Your Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormItem><FormLabel>Your Name</FormLabel><Input value={child.parent} disabled /></FormItem>
                                    <FormItem><FormLabel>Your Email</FormLabel><Input value={child.parentEmail} disabled /></FormItem>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField control={form.control} name="parentPhone" render={({ field }) => (<FormItem><FormLabel>Your Phone</FormLabel><FormControl><Input type="tel" {...field} disabled={isSaving} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="address" render={({ field }) => (<FormItem><FormLabel>Physical Address</FormLabel><FormControl><Textarea {...field} disabled={isSaving} /></FormControl><FormMessage /></FormItem>)} />
                                </div>
                            </div>
                            
                            {/* Editable Emergency, Medical & Other Info */}
                            <div className="space-y-4 pt-4">
                                <h3 className="text-xl font-headline text-primary/80 flex items-center gap-2"><HeartPulse /> Emergency & Medical</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField control={form.control} name="emergencyContactName" render={({ field }) => (<FormItem><FormLabel>Emergency Contact Name</FormLabel><FormControl><Input {...field} disabled={isSaving} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="emergencyContactPhone" render={({ field }) => (<FormItem><FormLabel>Emergency Contact Phone</FormLabel><FormControl><Input type="tel" {...field} disabled={isSaving} /></FormControl><FormMessage /></FormItem>)} />
                                </div>
                                <FormField control={form.control} name="medicalConditions" render={({ field }) => (<FormItem><FormLabel>Medical Conditions / Allergies</FormLabel><FormControl><Textarea {...field} placeholder="e.g. Peanut allergy" disabled={isSaving} /></FormControl><FormMessage /></FormItem>)} />
                            </div>

                             <div className="space-y-4 pt-4">
                                <h3 className="text-xl font-headline text-primary/80 flex items-center gap-2"><FileText /> Other Information</h3>
                                <FormField
                                    control={form.control}
                                    name="previousPreschool"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel>Previous Preschool Experience?</FormLabel>
                                            <FormControl>
                                                <RadioGroup
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                    className="flex space-x-4"
                                                    disabled={isSaving}
                                                >
                                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                                        <FormControl><RadioGroupItem value="yes" /></FormControl>
                                                        <FormLabel className="font-normal">Yes</FormLabel>
                                                    </FormItem>
                                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                                        <FormControl><RadioGroupItem value="no" /></FormControl>
                                                        <FormLabel className="font-normal">No</FormLabel>
                                                    </FormItem>
                                                </RadioGroup>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField control={form.control} name="additionalNotes" render={({ field }) => (<FormItem><FormLabel>Additional Notes</FormLabel><FormControl><Textarea {...field} placeholder="Anything else the teachers should know?" disabled={isSaving} /></FormControl><FormMessage /></FormItem>)} />
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Save Changes"}</Button>
                                <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSaving}>Cancel</Button>
                            </div>
                            {submissionError && (
                                <Alert variant="destructive" className="mt-4">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertTitle>Update Failed</AlertTitle>
                                    <AlertDescription>{submissionError}</AlertDescription>
                                </Alert>
                            )}
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
