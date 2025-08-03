
"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Baby, Home, User, Mail, Phone, Upload, AlertTriangle, HeartPulse, Shield, FileText, Calendar as CalendarIcon, LockKeyhole, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { format } from "date-fns";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useLanguage } from "@/context/LanguageContext";
import { addAfterschoolChild } from "@/services/afterschoolService";
import type { Child } from "@/lib/types";
import { uploadImage } from "@/services/storageService";
import { auth, isFirebaseConfigured } from "@/lib/firebase";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";

const formSchema = z.object({
  childName: z.string().min(2, "Name is too short").max(50, "Name is too long"),
  dateOfBirth: z.string().refine((dob) => dob && !isNaN(new Date(dob).getTime()), {
    message: "Please enter a valid date of birth.",
  }),
  childGender: z.enum(["male", "female", "other"]),
  childPhoto: z.any().optional(),
  
  parentName: z.string().min(2, "Name is too short").max(50, "Name is too long"),
  parentEmail: z.string().email("Invalid email address"),
  parentPhone: z.string().min(10, "Please enter a valid phone number"),
  address: z.string().min(10, "Please enter a valid address"),

  password: z.string().min(6, "Password must be at least 6 characters."),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters."),

  emergencyContactName: z.string().min(2, "Name is too short").max(50, "Name is too long"),
  emergencyContactPhone: z.string().min(10, "Please enter a valid phone number"),
  
  medicalConditions: z.string().optional(),
  previousPreschool: z.enum(["yes", "no"]),
  additionalNotes: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});


export default function AfterschoolRegisterPage() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const router = useRouter();
  const [isConfigured] = useState(isFirebaseConfigured());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<{title: string, description: React.ReactNode} | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      childName: "",
      dateOfBirth: "",
      address: "",
      parentName: "",
      parentEmail: "",
      parentPhone: "",
      childPhoto: undefined,
      password: "",
      confirmPassword: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      medicalConditions: "",
      additionalNotes: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setSubmissionError(null);
    if (!isConfigured || !auth) {
      setSubmissionError({
        title: "Registration System Unavailable",
        description: "The registration system is currently offline. Please contact the school directly to register.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Create Auth user
      await createUserWithEmailAndPassword(auth, values.parentEmail, values.password);

      // 2. Upload photo if it exists
      const file = values.childPhoto?.[0];
      let photoUrl = "https://placehold.co/100x100.png";
      if (file) {
        photoUrl = await uploadImage(file, 'children');
      }

      // 3. Create Child document in Firestore
      const newChildData: Omit<Child, "id"> = {
        name: values.childName,
        dateOfBirth: values.dateOfBirth,
        gender: values.childGender,
        address: values.address,
        parent: values.parentName,
        parentEmail: values.parentEmail,
        parentPhone: values.parentPhone,
        photo: photoUrl,
        medicalConditions: values.medicalConditions,
        emergencyContactName: values.emergencyContactName,
        emergencyContactPhone: values.emergencyContactPhone,
        previousPreschool: values.previousPreschool,
        additionalNotes: values.additionalNotes,
      };

      await addAfterschoolChild(newChildData);

      // 4. Toast and Redirect
      toast({
        title: t('regSuccessTitle'),
        description: t('regAndLoginSuccessDesc'),
      });
      // User is automatically logged in by Firebase after account creation.
      router.push('/parent/dashboard');

    } catch (error: any) {
        console.error("Afterschool Registration Error:", error);
         if (error.code === 'auth/email-already-in-use') {
             setSubmissionError({
                title: "Email Already Registered",
                description: "An account with this email address already exists. Please log in instead or use a different email.",
            });
        } else {
            setSubmissionError({
                title: "Registration Failed",
                description: "An unexpected error occurred. This might be a temporary network issue. Please check your connection and try again. If the problem persists, please contact the school.",
            });
        }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container py-12 md:py-24">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-accent">
            {t('afterschoolRegistration')}
          </CardTitle>
          <CardDescription>
            {t('afterschoolRegisterSub')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isConfigured && (
              <Alert variant="destructive" className="mb-8">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>System Currently Unavailable</AlertTitle>
                  <AlertDescription>
                      <p>The online registration form is currently unavailable.</p>
                      <p className="mt-2 font-bold">Please contact the school directly to register your child.</p>
                  </AlertDescription>
              </Alert>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Child's Information */}
              <div className="space-y-4">
                <h3 className="text-xl font-headline text-accent/80 flex items-center gap-2">
                  <Baby /> {t('childInfo')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField
                    control={form.control}
                    name="childName"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t('fullName')}</FormLabel>
                        <FormControl>
                            <Input
                            placeholder={t('egJaneDoe')}
                            {...field}
                            disabled={isSubmitting}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                      control={form.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem className="flex flex-col pt-2">
                          <FormLabel>{t('dateOfBirth')}</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                  disabled={isSubmitting}
                                >
                                  {field.value ? (
                                    format(new Date(field.value), "PPP")
                                  ) : (
                                    <span>{t('egDob')}</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                captionLayout="dropdown"
                                fromYear={new Date().getFullYear() - 20}
                                toYear={new Date().getFullYear() - 4}
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
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField
                        control={form.control}
                        name="childGender"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('gender')}</FormLabel>
                            <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled={isSubmitting}
                            >
                            <FormControl>
                                <SelectTrigger>
                                <SelectValue placeholder={t('selectGender')} />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="male">{t('male')}</SelectItem>
                                <SelectItem value="female">{t('female')}</SelectItem>
                                <SelectItem value="other">{t('other')}</SelectItem>
                            </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="childPhoto"
                        render={({ field: { onChange, onBlur, name, ref } }) => (
                        <FormItem>
                            <FormLabel>{t('childPhoto')}</FormLabel>
                            <FormControl>
                                <Input
                                type="file"
                                accept="image/png, image/jpeg, image/gif, image/webp, image/avif"
                                onChange={(e) => onChange(e.target.files)}
                                onBlur={onBlur}
                                name={name}
                                ref={ref}
                                disabled={isSubmitting}
                                />
                            </FormControl>
                             <FormDescription>{t('childPhotoDesc')}</FormDescription>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
              </div>
              
              {/* Parent Information */}
               <div className="space-y-4 pt-4">
                <h3 className="text-xl font-headline text-accent/80 flex items-center gap-2">
                   <User /> {t('parentInfo')}
                </h3>
                <FormField
                    control={form.control}
                    name="parentName"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('fullName')}</FormLabel>
                        <FormControl>
                            <Input
                            placeholder={t('egJohnSmith')}
                            {...field}
                            disabled={isSubmitting}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField
                    control={form.control}
                    name="parentEmail"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t('emailAddress')}</FormLabel>
                        <FormControl>
                           <Input
                            type="email"
                            placeholder={t('egEmail')}
                            {...field}
                            disabled={isSubmitting}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="parentPhone"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t('phoneNumber')}</FormLabel>
                        <FormControl>
                           <Input
                            type="tel"
                            placeholder={t('egPhone')}
                            {...field}
                            disabled={isSubmitting}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
                 <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('physicalAddress')}</FormLabel>
                        <FormControl>
                           <Textarea
                            placeholder={t('egAddress')}
                            {...field}
                            disabled={isSubmitting}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
              </div>

               {/* Create Parent Account */}
                <div className="space-y-4 pt-4">
                  <h3 className="text-xl font-headline text-accent/80 flex items-center gap-2">
                    <LockKeyhole /> {t('createParentAccountTitle')}
                  </h3>
                  <p className="text-sm text-muted-foreground">{t('createParentAccountDesc')}</p>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <FormField
                          control={form.control}
                          name="password"
                          render={({ field }) => (
                          <FormItem>
                              <FormLabel>{t('password')}</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input type={showPassword ? "text" : "password"} {...field} disabled={isSubmitting} />
                                  <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                                      onClick={() => setShowPassword(!showPassword)}
                                  >
                                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </Button>
                                </div>
                              </FormControl>
                              <FormDescription>{t('passwordDesc')}</FormDescription>
                              <FormMessage />
                          </FormItem>
                          )}
                      />
                      <FormField
                          control={form.control}
                          name="confirmPassword"
                          render={({ field }) => (
                          <FormItem>
                              <FormLabel>{t('confirmPassword')}</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input type={showConfirmPassword ? "text" : "password"} {...field} disabled={isSubmitting} />
                                   <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                  >
                                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </Button>
                                </div>
                              </FormControl>
                              <FormMessage />
                          </FormItem>
                          )}
                      />
                   </div>
                </div>

               {/* Emergency & Medical Information */}
               <div className="space-y-4 pt-4">
                 <h3 className="text-xl font-headline text-accent/80 flex items-center gap-2">
                   <HeartPulse /> {t('emergencyMedicalInfo')}
                </h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField
                        control={form.control}
                        name="emergencyContactName"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('emergencyContactName')}</FormLabel>
                            <FormControl>
                                <Input
                                placeholder={t('egEmergencyContact')}
                                {...field}
                                disabled={isSubmitting}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="emergencyContactPhone"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('emergencyContactPhone')}</FormLabel>
                            <FormControl>
                                <Input
                                type="tel"
                                placeholder={t('egEmergencyPhone')}
                                {...field}
                                disabled={isSubmitting}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                 </div>
                 <FormField
                    control={form.control}
                    name="medicalConditions"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t('medicalConditions')}</FormLabel>
                        <FormControl>
                            <Textarea
                            placeholder={t('egMedical')}
                            {...field}
                            disabled={isSubmitting}
                            />
                        </FormControl>
                         <FormDescription>{t('medicalConditionsDesc')}</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
              </div>

              {/* Other Information */}
               <div className="space-y-4 pt-4">
                 <h3 className="text-xl font-headline text-accent/80 flex items-center gap-2">
                   <FileText /> {t('otherInfo')}
                </h3>
                 <FormField
                    control={form.control}
                    name="previousPreschool"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                            <FormLabel>{t('previousPreschool')}</FormLabel>
                             <FormDescription>{t('previousPreschoolDesc')}</FormDescription>
                            <FormControl>
                                <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex flex-col space-y-1"
                                disabled={isSubmitting}
                                >
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                    <RadioGroupItem value="yes" />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                    {t('yes')}
                                    </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                    <RadioGroupItem value="no" />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                    {t('no')}
                                    </FormLabel>
                                </FormItem>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                 />
                 <FormField
                    control={form.control}
                    name="additionalNotes"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t('additionalNotes')}</FormLabel>
                        <FormControl>
                            <Textarea
                            placeholder={t('egNotes')}
                            {...field}
                            disabled={isSubmitting}
                            />
                        </FormControl>
                         <FormDescription>{t('additionalNotesDesc')}</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
              </div>

              {submissionError && (
                <Alert variant="destructive" className="mt-6">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>{submissionError.title}</AlertTitle>
                  <AlertDescription>
                    {submissionError.description}
                  </AlertDescription>
                </Alert>
              )}
              <Button type="submit" size="lg" className="w-full font-semibold" disabled={isSubmitting || !isConfigured}>
                 {isSubmitting ? "Submitting..." : t('submitRegistration')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
