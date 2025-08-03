
"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { ArrowLeft } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


export default function ParentRegisterPage() {
  return (
    <div className="flex items-center justify-center min-h-dvh px-4 py-8">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <Logo href="/" />
        </div>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-2xl">
              Registration Has Moved
            </CardTitle>
            <CardDescription>
                To make things easier, parent account creation is now part of child registration.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <Alert variant="default" className="text-left">
                <AlertTitle>How to Register</AlertTitle>
                <AlertDescription>
                    Please click the button below to go to our main registration page. As you fill out your child's details, you'll also create your parent login at the same time.
                </AlertDescription>
             </Alert>
            <Button asChild className="w-full mt-6">
                <Link href="/register">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Go to Child Registration
                </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
