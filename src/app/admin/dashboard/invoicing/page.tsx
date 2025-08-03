

"use client";

import { useState, useEffect, useCallback } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
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
import { AlertTriangle, ReceiptText } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Child, Invoice } from "@/lib/types";
import { getChildren } from "@/services/childrenService";
import { getAfterschoolChildren } from "@/services/afterschoolService";
import { createInvoice, getAllInvoices } from "@/services/invoiceService";
import { Skeleton } from "@/components/ui/skeleton";
import { isFirebaseConfigured } from "@/lib/firebase";
import { Badge } from "@/components/ui/badge";

const invoiceFormSchema = z.object({
  childId: z.string().min(1, "Please select a child."),
  amount: z.coerce.number().positive("Amount must be a positive number."),
  description: z.string().min(5, "Description must be at least 5 characters."),
});

type InvoiceFormData = z.infer<typeof invoiceFormSchema>;

export default function InvoicingPage() {
  const { toast } = useToast();
  const [children, setChildren] = useState<Child[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isConfigured] = useState(isFirebaseConfigured());

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      childId: "",
      description: "",
    },
  });

  const fetchInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [preschool, afterschool, fetchedInvoices] = await Promise.all([
        getChildren(),
        getAfterschoolChildren(),
        getAllInvoices(),
      ]);
      setChildren([...preschool, ...afterschool].sort((a,b) => a.name.localeCompare(b.name)));
      setInvoices(fetchedInvoices);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Could not fetch data." });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (isConfigured) {
      fetchInitialData();
    } else {
      setIsLoading(false);
    }
  }, [isConfigured, fetchInitialData]);

  async function onSubmit(values: InvoiceFormData) {
    setIsSaving(true);
    const selectedChild = children.find(c => c.id === values.childId);
    if (!selectedChild) {
      toast({ variant: "destructive", title: "Error", description: "Selected child not found." });
      setIsSaving(false);
      return;
    }

    try {
      await createInvoice({
        childId: selectedChild.id,
        parentId: selectedChild.parentEmail,
        childName: selectedChild.name,
        amount: values.amount,
        description: values.description,
      });
      toast({ title: "Invoice Created", description: `Invoice for ${selectedChild.name} has been created.` });
      form.reset();
      // Refetch invoices to update the list
      const fetchedInvoices = await getAllInvoices();
      setInvoices(fetchedInvoices);
    } catch (error) {
      toast({ variant: "destructive", title: "Error Creating Invoice", description: (error as Error).message });
    } finally {
      setIsSaving(false);
    }
  }

  if (!isConfigured) {
    return (
      <div className="container py-12">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Firebase Configuration Error</AlertTitle>
          <AlertDescription>
            <p>Cannot manage invoices because the application is not connected to Firebase.</p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="py-6 grid gap-10 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <h2 className="text-3xl font-bold tracking-tight mb-4">Create Invoice</h2>
        <Card>
          <CardHeader>
            <CardTitle>New Invoice Details</CardTitle>
            <CardDescription>Select a child and enter the details for the invoice.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="childId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Child</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSaving || isLoading}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a child..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {children.map(child => (
                            <SelectItem key={child.id} value={child.id}>
                              {child.name} ({child.parent})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount (R)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="e.g. 1500.00" 
                          {...field} 
                          value={field.value || ''}
                          disabled={isSaving} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="e.g. Monthly School Fees - July" {...field} disabled={isSaving} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isSaving || isLoading}>
                  {isSaving ? "Creating..." : "Create Invoice"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-2">
        <h2 className="text-3xl font-bold tracking-tight mb-4">Invoice History</h2>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Child</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    </TableRow>
                  ))
                ) : invoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">No invoices created yet.</TableCell>
                  </TableRow>
                ) : (
                  invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.childName}</TableCell>
                      <TableCell>{invoice.description}</TableCell>
                      <TableCell>R{(invoice.amount / 100).toFixed(2)}</TableCell>
                      <TableCell><Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>{invoice.status}</Badge></TableCell>
                      <TableCell>{invoice.createdAt ? new Date(invoice.createdAt.toDate()).toLocaleDateString() : 'N/A'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    