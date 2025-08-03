
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { addTeacher, getTeacherByUid } from "@/services/teacherService";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Eye, EyeOff } from "lucide-react";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!auth) {
        setError("Firebase is not configured. Please check your setup.");
        setIsLoading(false);
        return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // On first login, create a Firestore document for the new user if it doesn't exist.
      const teacherProfile = await getTeacherByUid(user.uid);
      if (!teacherProfile && user.email) {
          await addTeacher(user.uid, {
              name: user.email, // Default name to email, can be edited later
              email: user.email,
              role: 'teacher' // Default new users to 'teacher' role
          });
      }
      
      toast({
        title: t('loginSuccess'),
        description: t('loginRedirecting'),
      });
      router.push("/admin/dashboard");

    } catch (err: any) {
       switch (err.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
            setError("Invalid email or password.");
            break;
        default:
            setError("An unexpected error occurred. Please try again.");
            console.error("Login Error:", err);
            break;
       }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-dvh px-4">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <Logo />
        </div>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-2xl">
              {t('adminLogin')}
            </CardTitle>
            <CardDescription>
              {t('adminLoginSub')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Secure Login Enabled</AlertTitle>
                <AlertDescription>
                  Log in with the credentials you created in the Firebase Authentication console. New teacher accounts must also be created there.
                </AlertDescription>
            </Alert>
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
              <div className="space-y-2">
                <Label htmlFor="password">{t('password')}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                   <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                  >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              {error && <p className="text-sm font-medium text-destructive">{error}</p>}
              <div className="flex items-center justify-end">
                <Link href="/admin/forgot-password" passHref>
                  <Button variant="link" className="p-0 h-auto text-sm">
                    {t('forgotPassword')}
                  </Button>
                </Link>
              </div>
              <Button
                type="submit"
                className="w-full font-semibold"
                disabled={isLoading}
              >
                {isLoading ? t('loggingIn') : t('login')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
