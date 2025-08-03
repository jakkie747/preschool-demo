
"use client";
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, AlertTriangle, UserPlus, Edit, Ban } from "lucide-react";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useLanguage } from "@/context/LanguageContext";
import type { Teacher } from "@/lib/types";
import { getTeachers, deleteTeacherProfile } from "@/services/teacherService";
import { Skeleton } from "@/components/ui/skeleton";
import { isFirebaseConfigured, firebaseConfig } from "@/lib/firebase";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/context/AdminAuthContext";

export default function ManageTeachersPage() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);
  const [showManualDeleteNotice, setShowManualDeleteNotice] = useState<Teacher | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfigured] = useState(isFirebaseConfigured());

  const { teacher, user, loading: authLoading } = useAdminAuth();
  const isAuthorized = teacher?.role === 'admin';
  const currentUser = user;

  const fetchTeachers = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedTeachers = await getTeachers();
      setTeachers(fetchedTeachers);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Could not fetch teachers." });
      setTeachers([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (authLoading) return;

    if (isConfigured && isAuthorized) {
      fetchTeachers();
    } else {
      setIsLoading(false);
    }
  }, [isConfigured, fetchTeachers, isAuthorized, authLoading]);

  const handleDeleteClick = (teacher: Teacher) => {
    setTeacherToDelete(teacher);
  };

  const confirmDelete = async () => {
    if (!teacherToDelete || !currentUser) return;

    try {
        // This function now only deletes from Firestore and Storage
        await deleteTeacherProfile(teacherToDelete.id);
        
        toast({
          title: "Profile Removed",
          description: `The profile for ${teacherToDelete.name} has been removed from the app.`,
          variant: "destructive",
        });

        await fetchTeachers();
        setShowManualDeleteNotice(teacherToDelete); // Trigger the notification dialog
    } catch (error: any) {
      console.error("Error deleting teacher profile:", error);
      toast({ 
          variant: "destructive", 
          title: "Error Deleting Profile", 
          description: error.message || "An unexpected error occurred."
      });
    } finally {
      setTeacherToDelete(null); // Close the initial confirmation dialog
    }
  };

  if (authLoading) {
    return (
      <div className="py-6 space-y-4">
        <Skeleton className="h-8 w-1/3 mb-4" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="py-12 flex justify-center">
        <Alert variant="destructive" className="max-w-lg">
          <Ban className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You do not have permission to view this page. This feature is restricted to administrators.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!isConfigured) {
    return (
      <div className="container py-12">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Firebase Configuration Error</AlertTitle>
          <AlertDescription>
            <p>Cannot manage teachers because the application is not connected to Firebase.</p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="py-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-4">
          {t('manageTeachers')}
        </h2>
        <Card className="mb-8">
            <CardHeader>
                <CardTitle>Important: How to Add New Teachers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <Alert>
                    <UserPlus className="h-4 w-4" />
                    <AlertTitle>User management is handled in the Firebase Console.</AlertTitle>
                    <AlertDescription>
                        For security, new teachers must be added directly through the Firebase Authentication service.
                    </AlertDescription>
                </Alert>
                <a href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/users`} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline">
                        Go to Firebase Console to Add Users
                    </Button>
                </a>
            </CardContent>
        </Card>
      </div>
      
      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">
          {t('existingTeachers')}
        </h2>
        <div className="w-full overflow-x-auto">
            <Card>
                <CardContent className="p-0">
                <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{t('teacherName')}</TableHead>
                        <TableHead className="hidden sm:table-cell">{t('teacherEmail')}</TableHead>
                        <TableHead>{t('role')}</TableHead>
                        <TableHead className="text-right">{t('actions')}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                    Array.from({ length: 2 }).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-6 w-40" /></TableCell>
                            <TableCell className="hidden sm:table-cell"><Skeleton className="h-6 w-48" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-8 w-20 inline-block" /></TableCell>
                        </TableRow>
                    ))
                    ) : teachers.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                        No teachers enrolled yet.
                        </TableCell>
                    </TableRow>
                    ) : (
                    teachers.map((teacher) => (
                        <TableRow key={teacher.id}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={teacher.photo} alt={teacher.name} />
                                        <AvatarFallback>{teacher.name.charAt(0).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div className="font-medium">{teacher.name}</div>
                                </div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">{teacher.email}</TableCell>
                            <TableCell>
                                <Badge variant={teacher.role === 'admin' ? 'default' : 'secondary'}>{teacher.role}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                            <div className="flex gap-1 justify-end">
                                <Button asChild variant="ghost" size="icon">
                                    <Link href={`/admin/dashboard/teachers/${teacher.id}/edit`}><Edit className="h-4 w-4" /></Link>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() => handleDeleteClick(teacher)}
                                    disabled={teacher.id === currentUser?.uid}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            </TableCell>
                        </TableRow>
                    ))
                    )}
                </TableBody>
                </Table>
                </CardContent>
            </Card>
        </div>
      </div>
      
      <AlertDialog
        open={!!teacherToDelete}
        onOpenChange={(open) => !open && setTeacherToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Profile Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the profile for {teacherToDelete?.name}? Their login will remain active until you manually delete it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Yes, Delete Profile
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!showManualDeleteNotice}
        onOpenChange={(open) => !open && setShowManualDeleteNotice(null)}
      >
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Action Required: Final Deletion Step</AlertDialogTitle>
            </AlertDialogHeader>
            <div className="space-y-4 text-sm text-muted-foreground">
                <p>The profile for <strong>{showManualDeleteNotice?.name}</strong> has been removed from the app.</p>
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Important Final Step</AlertTitle>
                    <AlertDescription>
                        To permanently remove their login access, you must now delete the user from the Firebase Authentication console.
                    </AlertDescription>
                </Alert>
                <p>User to delete: <strong>{showManualDeleteNotice?.email}</strong></p>
            </div>
            <AlertDialogFooter>
                <AlertDialogCancel>Close</AlertDialogCancel>
                <AlertDialogAction asChild>
                    <a href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/users`} target="_blank" rel="noopener noreferrer">
                        Open Firebase Console
                    </a>
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
