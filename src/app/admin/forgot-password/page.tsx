
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "@/components/Logo";
import { useLanguage } from "@/context/LanguageContext";
import { auth } from "@/lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !auth) return;
    setIsLoading(true);

    try {
        await sendPasswordResetEmail(auth, email);
        toast({
            title: t('resetLinkSent'),
            description: t('resetLinkSentDesc', { email }),
        });
    } catch(error: any) {
        // We don't want to tell the user if the email exists or not for security reasons
        console.error("Password reset error:", error);
         toast({
            title: t('resetLinkSent'),
            description: t('resetLinkSentDesc', { email }),
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-dvh px-4">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <Logo href="/admin" />
        </div>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-2xl">
              {t('resetPassword')}
            </CardTitle>
            <CardDescription>
              {t('resetPasswordSub')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('emailAddress')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('egEmail')}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button
                type="submit"
                className="w-full font-semibold"
                disabled={isLoading || !email}
              >
                {isLoading ? t('loggingIn') : t('sendResetLink')}
              </Button>
            </form>
             <Button variant="link" className="w-full mt-4" asChild>
                <Link href="/admin">{t('backToLogin')}</Link>
             </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
