
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { intervalToDuration } from 'date-fns';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/context/LanguageContext";
import { getChildren, deleteChild } from "@/services/childrenService";
import type { Child } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { isFirebaseConfigured } from "@/lib/firebase";
import { AlertTriangle, Trash2, Edit, FileText, History } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


const ChildAge = ({ dobString }: { dobString: string }) => {
  const [age, setAge] = useState<string>('');

  useEffect(() => {
    if (!dobString || isNaN(new Date(dobString).getTime())) {
      setAge("N/A");
      return;
    }
    const dob = new Date(dobString);
    const today = new Date();

    if (dob > today) {
      setAge("Future date");
      return;
    }

    const duration = intervalToDuration({ start: dob, end: today });
    
    const years = duration.years || 0;
    const months = duration.months || 0;

    const yearString = `${years} year${years !== 1 ? 's' : ''}`;
    const monthString = `${months} month${months !== 1 ? 's' : ''}`;

    if (years > 0) {
      setAge(`${yearString} ${monthString}`);
    } else {
      setAge(monthString);
    }
  }, [dobString]);

  if (age === '') {
    return <Skeleton className="h-4 w-24" />;
  }

  return <>{age}</>;
};


export default function ChildrenPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isConfigured] = useState(isFirebaseConfigured());

  const [deletingChild, setDeletingChild] = useState<Child | null>(null);
  
  const fetchChildren = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedChildren = await getChildren();
      setChildren(fetchedChildren);
    } catch (error: any) {
      if (error.message.includes("index")) {
        toast({
          variant: "destructive",
          title: "Database Index Required",
          description: "A database index is required to sort children by name. Please check the browser console (F12) for a link to create it, then try again.",
          duration: 15000,
        });
      } else {
        toast({ variant: "destructive", title: "Error", description: error.message || "Could not fetch children." });
      }
      setChildren([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (isConfigured) {
      fetchChildren();
    } else {
      setIsLoading(false);
    }
  }, [isConfigured, fetchChildren]);
  
  const handleDeleteClick = (child: Child) => {
    setDeletingChild(child);
  };

  const confirmDelete = async () => {
    if (!deletingChild) return;
    try {
      await deleteChild(deletingChild.id);
      toast({
        title: t('childDeleted'),
        description: t('childDeletedDesc', { name: deletingChild.name }),
        variant: "destructive"
      });
      await fetchChildren();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: (error as Error).message });
    } finally {
      setDeletingChild(null);
    }
  };

  if (!isConfigured) {
    return (
      <div className="container py-12">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Firebase Configuration Error</AlertTitle>
          <AlertDescription>
            <p>Cannot display child profiles because the application is not connected to Firebase.</p>
            <p className="mt-2 font-bold">Please open the file <code>src/lib/firebase.ts</code> and follow the instructions to add your Firebase credentials.</p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="py-6 space-y-6">
       <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">
              {t('preschoolChildrenNav')}
          </h2>
          <p className="text-muted-foreground">{t('preschoolChildrenDesc')}</p>
       </div>
      <div className="w-full overflow-x-auto">
        <Card>
            <CardContent className="p-0">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>{t('childsName')}</TableHead>
                    <TableHead className="hidden md:table-cell">{t('parentDetails')}</TableHead>
                    <TableHead className="hidden sm:table-cell">{t('ageInTable')}</TableHead>
                    <TableHead className="text-right">{t('actions')}</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {isLoading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                        <TableCell><Skeleton className="h-6 w-40" /></TableCell>
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-6 w-48" /></TableCell>
                        <TableCell className="hidden sm:table-cell"><Skeleton className="h-6 w-24" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-24 inline-block" /></TableCell>
                    </TableRow>
                    ))
                ) : children.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                            No children registered yet.
                        </TableCell>
                    </TableRow>
                ) : (
                    <TooltipProvider>
                    {children.map((child) => (
                    <TableRow key={child.id}>
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={child.photo} alt={child.name} />
                                    <AvatarFallback>{child.name.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{child.name}</span>
                                  {child.updatedByParentAt && (
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <History className="h-4 w-4 text-accent" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Updated by parent on {new Date(child.updatedByParentAt.toDate()).toLocaleDateString()}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                </div>
                            </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                            <div className="flex flex-col text-sm">
                                <span className="font-medium">{child.parent}</span>
                                <span className="text-muted-foreground">{child.parentEmail}</span>
                            </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                            {child.dateOfBirth ? <ChildAge dobString={child.dateOfBirth} /> : "N/A"}
                        </TableCell>
                        <TableCell>
                            <div className="flex gap-1 justify-end">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button asChild variant="ghost" size="icon">
                                            <Link href={`/admin/dashboard/children/${child.id}/reports`}><FileText className="h-4 w-4" /></Link>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent><p>Manage Daily Reports</p></TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button asChild variant="ghost" size="icon">
                                            <Link href={`/admin/dashboard/children/${child.id}/edit`}><Edit className="h-4 w-4" /></Link>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent><p>Edit Child Profile</p></TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteClick(child)}><Trash2 className="h-4 w-4" /></Button>
                                    </TooltipTrigger>
                                    <TooltipContent><p>Delete Child Profile</p></TooltipContent>
                                </Tooltip>
                            </div>
                        </TableCell>
                    </TableRow>
                    ))}
                    </TooltipProvider>
                )}
                </TableBody>
            </Table>
            </CardContent>
        </Card>
      </div>
      
      <AlertDialog open={!!deletingChild} onOpenChange={(open) => { if (!open) setDeletingChild(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
