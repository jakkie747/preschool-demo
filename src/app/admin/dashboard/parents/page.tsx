
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from 'next/link';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/context/LanguageContext";
import { getParents, updateParentDetails } from "@/services/parentService";
import type { Parent } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { isFirebaseConfigured } from "@/lib/firebase";
import { AlertTriangle, Edit, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAdminAuth } from "@/context/AdminAuthContext";

const parentFormSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "A valid phone number is required"),
});

export default function ManageParentsPage() {
  const [parents, setParents] = useState<Parent[]>([]);
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isConfigured] = useState(isFirebaseConfigured());
  const { teacher, loading: authLoading } = useAdminAuth();

  const [editingParent, setEditingParent] = useState<Parent | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const form = useForm<z.infer<typeof parentFormSchema>>({
    resolver: zodResolver(parentFormSchema),
    defaultValues: {
      name: "",
      phone: "",
    },
  });

  const fetchParents = useCallback(async () => {
    if (!teacher?.role || teacher.role !== 'admin') {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const fetchedParents = await getParents();
      setParents(fetchedParents);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Could not fetch parents." });
      setParents([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast, teacher?.role]);

  useEffect(() => {
    if (isConfigured && !authLoading) {
      fetchParents();
    }
  }, [isConfigured, authLoading, fetchParents]);

  const handleEditClick = (parent: Parent) => {
    setEditingParent(parent);
    form.reset({
      name: parent.name,
      phone: parent.phone,
    });
  };

  const handleCloseDialog = () => {
    setEditingParent(null);
    form.reset();
  };

  const onSubmit = async (values: z.infer<typeof parentFormSchema>) => {
    if (!editingParent) return;
    setIsSaving(true);
    try {
      await updateParentDetails(editingParent.email, { name: values.name, phone: values.phone });
      toast({
        title: t('parentUpdated'),
        description: t('parentUpdatedDesc', { name: values.name }),
      });
      await fetchParents(); // Refetch to show updated data
      handleCloseDialog();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: (error as Error).message });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (authLoading || isLoading) {
    return (
        <div className="py-6 space-y-6">
            <div className="space-y-1">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-96" />
            </div>
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                                <TableHead><Skeleton className="h-5 w-32" /></TableHead>
                                <TableHead><Skeleton className="h-5 w-48" /></TableHead>
                                <TableHead className="text-right"><Skeleton className="h-5 w-16" /></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Array.from({ length: 5 }).map((_, index) => (
                                <TableRow key={index}>
                                    <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-40" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-48" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-8 w-20 inline-block" /></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
  }

  if (teacher?.role !== 'admin') {
     return (
        <div className="container py-12">
            <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
                You do not have the required permissions to view this page.
            </AlertDescription>
            </Alert>
        </div>
    );
  }
  
  return (
    <div className="py-6 space-y-6">
      <div className="space-y-1">
        <h2 className="text-3xl font-bold tracking-tight">{t('manageParents')}</h2>
        <p className="text-muted-foreground">{t('allParentsDesc')}</p>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('parentName')}</TableHead>
                <TableHead>{t('parentPhone')}</TableHead>
                <TableHead>{t('parentEmail')}</TableHead>
                <TableHead className="hidden md:table-cell">{t('linkedChildren')}</TableHead>
                <TableHead className="text-right">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No parents found.
                  </TableCell>
                </TableRow>
              ) : (
                <TooltipProvider>
                  {parents.map((parent) => (
                    <TableRow key={parent.email}>
                      <TableCell className="font-medium">{parent.name}</TableCell>
                      <TableCell>{parent.phone}</TableCell>
                      <TableCell>{parent.email}</TableCell>
                      <TableCell className="hidden align-top md:table-cell">
                          <div className="flex flex-col items-start gap-2">
                            {parent.children.map(child => (
                              <div key={child.id} className="flex items-center justify-start gap-2">
                                <Badge variant="secondary" className="font-normal">{child.name}</Badge>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button asChild variant="ghost" size="icon" className="h-6 w-6">
                                      <Link href={`/admin/dashboard/${child.program === 'preschool' ? 'children' : 'afterschool'}/${child.id}/edit`}>
                                        <Edit className="h-3.5 w-3.5" />
                                        <span className="sr-only">Edit {child.name}'s Profile</span>
                                      </Link>
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent><p>Edit {child.name}'s Profile</p></TooltipContent>
                                </Tooltip>
                              </div>
                            ))}
                          </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => handleEditClick(parent)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent><p>{t('editParent')}</p></TooltipContent>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TooltipProvider>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editingParent} onOpenChange={(open) => !open && handleCloseDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('editParent')}: {editingParent?.name}</DialogTitle>
            <DialogDescription>{t('updateParentDetails')}</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('parentName')}</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isSaving} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('parentPhone')}</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isSaving} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem>
                <FormLabel>{t('parentEmail')}</FormLabel>
                <FormControl>
                    <Input value={editingParent?.email} disabled />
                </FormControl>
                <FormDescription>{t('emailCannotBeChanged')}</FormDescription>
              </FormItem>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog} disabled={isSaving}>{t('cancel')}</Button>
                <Button type="submit" disabled={isSaving}>{isSaving ? t('saving') : t('saveChanges')}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
