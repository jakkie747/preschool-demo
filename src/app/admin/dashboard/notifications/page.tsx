
"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Mail, MessageCircle, AlertTriangle } from "lucide-react";
import { getChildren } from "@/services/childrenService";
import { Skeleton } from "@/components/ui/skeleton";
import { isFirebaseConfigured } from "@/lib/firebase";

const messageFormSchema = z.object({
  subject: z.string().min(5, "Subject must be at least 5 characters long."),
  body: z.string().min(10, "Body must be at least 10 characters long."),
});

export default function ComposeMessagePage() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [emails, setEmails] = useState<string[]>([]);
  const [phoneNumbers, setPhoneNumbers] =useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfigured] = useState(isFirebaseConfigured());

  useEffect(() => {
    if (!isConfigured) {
        setIsLoading(false);
        return;
    }
    const fetchParentContactInfo = async () => {
      setIsLoading(true);
      try {
        const children = await getChildren();
        const parentEmails = children
          .map((child) => child.parentEmail)
          .filter((email) => !!email);
        const uniqueEmails = [...new Set(parentEmails)];
        setEmails(uniqueEmails);
        
        const parentPhones = children
          .map((child) => child.parentPhone)
          .filter((phone) => !!phone);
        const uniquePhones = [...new Set(parentPhones)];
        setPhoneNumbers(uniquePhones);

      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error fetching parent info",
          description:
            "Could not load parent contact details from the children list. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchParentContactInfo();
  }, [toast, isConfigured]);

  const form = useForm<z.infer<typeof messageFormSchema>>({
    resolver: zodResolver(messageFormSchema),
    defaultValues: {
      subject: "",
      body: "",
    },
  });

  const handleSendEmail = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    if (emails.length === 0) {
      toast({
        variant: "destructive",
        title: "No Recipients",
        description: "There are no parent emails registered to send to.",
      });
      return;
    }
    
    const { subject, body } = form.getValues();
    const bcc = emails.join(',');
    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(body);
    const mailtoLink = `mailto:?bcc=${bcc}&subject=${encodedSubject}&body=${encodedBody}`;
    
    window.location.href = mailtoLink;
  };
  
  const handleSendWhatsApp = async () => {
    const isValid = await form.trigger(['body']); 
    if (!isValid) {
        toast({
            variant: "destructive",
            title: "Message Body Required",
            description: "Please fill out the message body before sending via WhatsApp.",
        });
        return;
    };
    
    if (phoneNumbers.length === 0) {
        toast({
            variant: "destructive",
            title: "No Recipients",
            description: "There are no parent phone numbers registered to send to.",
        });
        return;
    }

    const { body } = form.getValues();
    const encodedBody = encodeURIComponent(body);
    const whatsappLink = `https://wa.me/?text=${encodedBody}`;
    
    window.open(whatsappLink, '_blank');
    
    try {
      await navigator.clipboard.writeText(phoneNumbers.join(', '));
      toast({
          title: "WhatsApp Opened",
          description: `Your message is ready. The ${phoneNumbers.length} parent phone numbers have been copied to your clipboard. You can now paste them into a group or broadcast list.`,
      });
    } catch (err) {
       toast({
          title: "WhatsApp Opened",
          description: `Your message is ready. Please manually create your group or broadcast list.`,
      });
    }
  };


  return (
    <div className="py-6 space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-4">
          Compose Message
        </h2>
        <Alert>
          <Mail className="h-4 w-4" />
          <AlertTitle>Send Message to All Parents</AlertTitle>
          <AlertDescription>
            <p>
                Use this form to draft a message and send it via your own email client or WhatsApp.
            </p>
             <p className="mt-2 text-sm">
                <b>For Email:</b> This will open your default email application (like Gmail, Outlook, or Apple Mail) with the parent emails pre-filled in the BCC field.
            </p>
            <p className="mt-2 text-sm">
                <b>For WhatsApp:</b> This will open WhatsApp with your message pre-filled. You will need to manually select the parents or a parent group to send it to. Parent phone numbers will be copied to your clipboard for convenience.
            </p>
          </AlertDescription>
        </Alert>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Message Details</CardTitle>
          <CardDescription>
            Write the subject and body of your message here. 
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-6">
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject (for Email)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Important Update: School Concert"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="body"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Body</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g. Dear parents, please remember the concert is this Friday at 6 PM..."
                        {...field}
                        rows={8}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
          <div className="mt-6 border-t pt-6">
            <h3 className="text-lg font-medium mb-2">Recipients</h3>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-6 w-52" />
              </div>
            ) : (
             <div className="text-sm text-muted-foreground space-y-1">
                 <p>
                    This will be sent to{" "}
                    <strong className="text-foreground">
                    {emails.length} unique parent emails
                    </strong>.
                </p>
                 <p>
                    There are{" "}
                    <strong className="text-foreground">
                    {phoneNumbers.length} unique parent phone numbers
                    </strong> available for WhatsApp.
                </p>
             </div>
            )}
            <div className="mt-4 flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleSendEmail}
                disabled={!isConfigured || emails.length === 0 || isLoading}
              >
                <Mail className="mr-2 h-4 w-4" />
                Send via Email
              </Button>
               <Button
                onClick={handleSendWhatsApp}
                disabled={!isConfigured || phoneNumbers.length === 0 || isLoading}
                variant="secondary"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Send via WhatsApp
              </Button>
            </div>
             {!isConfigured && (
                <Alert variant="destructive" className="mt-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Firebase Not Configured</AlertTitle>
                    <AlertDescription>
                        Please configure your Firebase credentials in <code>src/lib/firebase.ts</code> to enable this feature.
                    </AlertDescription>
                </Alert>
             )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
