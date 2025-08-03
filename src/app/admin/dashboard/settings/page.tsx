"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";
import { auth } from "@/lib/firebase";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword, signOut } from "firebase/auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, KeyRound } from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";

const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: z.string().min(6, "New password must be at least 6 characters."),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "New passwords do not match.",
  path: ["confirmPassword"],
});

export default function SettingsPage() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAdminAuth();

  const form = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof passwordFormSchema>) {
    setIsLoading(true);
    setError(null);

    if (!user || !user.email) {
      setError(t('changePasswordErrorNoUser'));
      setIsLoading(false);
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(user.email, values.currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, values.newPassword);
      
      toast({
        title: t('passwordChangedSuccessTitle'),
        description: t('passwordChangedSuccessDesc'),
      });
      form.reset();
      
      if (auth) {
        await signOut(auth);
        router.push('/admin');
      }

    } catch (err: any) {
      console.error("Password change error:", err);
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError(t('changePasswordErrorWrongPassword'));
      } else if (err.code === 'auth/invalid-email') {
        setError("The user's email is invalid. Please contact support.");
      } else {
        setError(t('changePasswordErrorGeneric'));
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="py-6 space-y-8">
       <div>
        <h2 className="text-3xl font-bold tracking-tight mb-4">
          {t('settings')}
        </h2>
        <Card className="max-w-2xl">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><KeyRound /> {t('changePassword')}</CardTitle>
                <CardDescription>{t('changePasswordDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="currentPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('currentPassword')}</FormLabel>
                                    <FormControl>
                                        <Input type="password" {...field} disabled={isLoading} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="newPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('newPassword')}</FormLabel>
                                    <FormControl>
                                        <Input type="password" {...field} disabled={isLoading} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('confirmNewPassword')}</FormLabel>
                                    <FormControl>
                                        <Input type="password" {...field} disabled={isLoading} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {error && (
                            <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>{t('error')}</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? t('saving') : t('updatePassword')}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
