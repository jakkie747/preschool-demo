

"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { getChildrenByParentEmail } from "@/services/childrenService";
import type { Child, DailyReport, Invoice } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Image from "next/image";
import { Smile, Meh, Frown, Zap, Bed, Utensils, ToyBrick, NotebookPen, AlertTriangle, Edit, ReceiptText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getReportsByChildId } from "@/services/reportService";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getInvoicesByChild } from "@/services/invoiceService";


const moodConfig = {
    happy: { icon: Smile, color: "text-green-500", label: "Happy" },
    calm: { icon: Meh, color: "text-blue-500", label: "Calm" },
    sad: { icon: Frown, color: "text-red-500", label: "Sad" },
    energetic: { icon: Zap, color: "text-yellow-500", label: "Energetic" },
    tired: { icon: Bed, color: "text-purple-500", label: "Tired" },
};

function InvoiceSection({ childId }: { childId: string }) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentInProgress, setPaymentInProgress] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const fetchedInvoices = await getInvoicesByChild(childId);
        setInvoices(fetchedInvoices);
      } catch (error) {
        console.error("Failed to fetch invoices", error);
        toast({ variant: "destructive", title: "Could not fetch invoices." });
      } finally {
        setIsLoading(false);
      }
    };
    fetchInvoices();
  }, [childId, toast]);
  
  const handlePayNow = async (invoice: Invoice) => {
    setPaymentInProgress(invoice.id);
    try {
        const response = await fetch('/api/stitch/create-payment-request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: invoice.amount,
                email: invoice.parentId,
                description: invoice.description,
                externalReference: invoice.id // Use invoice ID to track payment
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'An unknown error occurred while creating the payment link.' }));
            throw new Error(errorData.error || 'Failed to create payment link.');
        }

        const { url } = await response.json();
        window.location.href = url; // Redirect parent to Stitch payment page
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Payment Error",
            description: (error as Error).message || "Could not initiate payment. Please try again.",
        });
        setPaymentInProgress(null);
    }
  };


  if (isLoading) {
    return (
      <Card>
        <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
        <CardContent><Skeleton className="h-24 w-full" /></CardContent>
      </Card>
    );
  }

  if (invoices.length === 0) {
    return null; // Don't show the card if there are no invoices
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><ReceiptText /> Invoices</CardTitle>
        <CardDescription>Your outstanding and paid invoices for this child.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {invoices.map(invoice => (
                    <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.description}</TableCell>
                        <TableCell>R{(invoice.amount / 100).toFixed(2)}</TableCell>
                        <TableCell>
                            <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                                {invoice.status}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                            {invoice.status === 'unpaid' && (
                                <Button
                                    onClick={() => handlePayNow(invoice)}
                                    disabled={paymentInProgress === invoice.id}
                                >
                                    {paymentInProgress === invoice.id ? "Processing..." : "Pay Now"}
                                </Button>
                            )}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function DailyReportCard({ report }: { report: DailyReport }) {
    const { icon: MoodIcon, color, label } = moodConfig[report.mood];

    return (
        <Card className="overflow-hidden">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>Report for {new Date(report.date).toLocaleDateString('en-ZA', { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' })}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-2">
                           <Badge variant="outline" className={`gap-2 border-0 ${color} bg-opacity-10`}>
                            <MoodIcon className={`h-4 w-4 ${color}`} />
                            {label}
                           </Badge>
                        </CardDescription>
                    </div>
                    {report.photoUrl && <Avatar><AvatarImage src={report.photoUrl} /></Avatar>}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-start gap-4">
                    <ToyBrick className="h-5 w-5 mt-1 text-primary"/>
                    <div>
                        <h4 className="font-semibold">Activities</h4>
                        <p className="text-muted-foreground">{report.activities}</p>
                    </div>
                </div>
                 <div className="flex items-start gap-4">
                    <Utensils className="h-5 w-5 mt-1 text-primary"/>
                    <div>
                        <h4 className="font-semibold">Meals</h4>
                        <p className="text-muted-foreground">{report.meals}</p>
                    </div>
                </div>
                 <div className="flex items-start gap-4">
                    <Bed className="h-5 w-5 mt-1 text-primary"/>
                    <div>
                        <h4 className="font-semibold">Naps</h4>
                        <p className="text-muted-foreground">{report.naps}</p>
                    </div>
                </div>
                {report.notes && (
                    <div className="flex items-start gap-4">
                        <NotebookPen className="h-5 w-5 mt-1 text-primary"/>
                        <div>
                            <h4 className="font-semibold">Notes from Teacher</h4>
                            <p className="text-muted-foreground">{report.notes}</p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

function ChildSection({ child }: { child: Child }) {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    try {
      const fetchedReports = await getReportsByChildId(child.id);
      setReports(fetchedReports);
    } catch (error) {
      console.error(`Failed to fetch reports for ${child.name}`, error);
      setFetchError((error as Error).message);
    } finally {
      setIsLoadingReports(false);
    }
  }, [child.id, child.name]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const renderError = () => {
    if (!fetchError) return null;

    const urlRegex = /(https?:\/\/[^\s]+)/;
    const match = fetchError.match(urlRegex);
    const indexUrl = match ? match[0].replace(/\\?$/, "") : null;

    if (indexUrl) {
      return (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Database Setup Required</AlertTitle>
          <AlertDescription>
            <p>To view daily reports, a one-time database configuration is needed by an administrator.</p>
            <p className="mt-2">Please ask the school administrator to click the link below to create the required database index. After it is created, please refresh this page.</p>
            <Button asChild variant="link" className="p-0 h-auto mt-2 text-left whitespace-normal">
              <a href={indexUrl} target="_blank" rel="noopener noreferrer" className="break-all">{indexUrl}</a>
            </Button>
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error Loading Reports</AlertTitle>
        <AlertDescription>{fetchError}</AlertDescription>
      </Alert>
    );
  };

  return (
    <div key={child.id} className="space-y-6">
        <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                    <AvatarImage src={child.photo} alt={child.name} />
                    <AvatarFallback>{child.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Updates for {child.name}</h2>
                    <p className="text-muted-foreground capitalize">{child.program} Program</p>
                </div>
            </div>
            <Button asChild variant="outline">
                <Link href={`/parent/dashboard/${child.id}/edit?program=${child.program}`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Profile
                </Link>
            </Button>
        </div>

      <InvoiceSection childId={child.id} />

      {isLoadingReports ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card><CardContent className="p-4"><Skeleton className="h-48 w-full" /></CardContent></Card>
          <Card><CardContent className="p-4"><Skeleton className="h-48 w-full" /></CardContent></Card>
        </div>
      ) : fetchError ? (
        renderError()
      ) : reports.length === 0 ? (
        <Alert>
          <AlertTitle>No Reports Yet</AlertTitle>
          <AlertDescription>There are no daily reports available for {child.name} at the moment. Please check back later.</AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-4">
             <h3 className="text-2xl font-semibold">Daily Reports</h3>
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                {reports.map(report => <DailyReportCard key={report.id} report={report} />)}
            </div>
        </div>
      )}
    </div>
  );
}


export default function ParentDashboardPage() {
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChildrenData = useCallback(async () => {
    if (user?.email) {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedChildren = await getChildrenByParentEmail(user.email);
        setChildren(fetchedChildren);
      } catch (err) {
        console.error("Error fetching child data:", err);
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    }
  }, [user]);

  useEffect(() => {
    if (user) {
        fetchChildrenData();
    } else {
        setIsLoading(false);
    }
  }, [user, fetchChildrenData]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-6 w-3/4" />
        <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    const urlRegex = /(https?:\/\/[^\s]+)/;
    const match = error.match(urlRegex);
    const indexUrl = match ? match[0].replace(/\\?$/, "") : null;

    if (indexUrl) {
        return (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>System Configuration Needed</AlertTitle>
                <AlertDescription>
                    <p>The parent dashboard is not yet configured. An administrator must complete a one-time database setup.</p>
                    <p className="mt-2">If you are an administrator, please click the link below to create the required database index, then refresh this page.</p>
                    <Button asChild variant="link" className="p-0 h-auto mt-2 text-left whitespace-normal">
                        <a href={indexUrl} target="_blank" rel="noopener noreferrer" className="break-all">{indexUrl}</a>
                    </Button>
                </AlertDescription>
            </Alert>
        );
    }
    
    return (
        <Alert variant="destructive">
            <AlertTitle>Error Loading Information</AlertTitle>
            <AlertDescription>We could not load your child's information. Please try again later or contact the school if the problem persists.</AlertDescription>
        </Alert>
    );
  }
  
  if (children && children.length === 0) {
    return (
        <Alert>
            <AlertTitle>No Child Profile Found</AlertTitle>
            <AlertDescription>
                We could not find a child profile linked to your email address ({user?.email}). 
                Please ensure you registered with the same email you provided to the school. 
                If the problem persists, please contact the school administration.
            </AlertDescription>
        </Alert>
    );
  }

  return (
    <div className="space-y-12">
        {children?.map(child => <ChildSection key={child.id} child={child} />)}
    </div>
  );
}

    

    