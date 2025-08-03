
export default function TermsOfServicePage() {
  return (
    <div className="bg-background text-foreground">
      <div className="container mx-auto max-w-4xl py-12 px-4 md:py-24">
        <h1 className="font-headline text-4xl font-bold text-primary mb-4">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-8">Last Updated: {new Date().toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <div className="space-y-6 text-foreground/90">
          <section className="space-y-2">
            <h2 className="font-headline text-2xl font-semibold text-primary/90 border-b pb-2">1. Acceptance of Terms</h2>
            <p>
              By downloading, accessing, or using the Blinkogies App (the "App"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the App. These Terms constitute a legal agreement between you and Blinkogies Pre-School ("we", "us", "our").
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-headline text-2xl font-semibold text-primary/90 border-b pb-2">2. Description of Service</h2>
            <p>
              The App provides a communication platform for parents/guardians and staff of Blinkogies Pre-School. Its features include child profile management, daily reports, event calendars, photo galleries, and general school communications.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-headline text-2xl font-semibold text-primary/90 border-b pb-2">3. User Accounts</h2>
            <p>
              To access certain features of the App, you must register for an account. You agree to provide accurate, current, and complete information during the registration process. You are responsible for safeguarding your password and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-headline text-2xl font-semibold text-primary/90 border-b pb-2">4. User Content</h2>
            <p>
              You are solely responsible for any data, text, photos, and other content ("User Content") that you upload, post, or otherwise transmit via the App. By posting User Content, you grant us a license to use, store, display, and distribute this content solely for the purpose of operating and providing the services of the App. You represent and warrant that you own or have the necessary rights to the User Content you post.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-headline text-2xl font-semibold text-primary/90 border-b pb-2">5. Prohibited Conduct</h2>
            <p>You agree not to use the App to:</p>
            <ul className="list-disc list-inside space-y-1 pl-4">
              <li>Upload or transmit any content that is unlawful, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable.</li>
              <li>Impersonate any person or entity, or falsely state or otherwise misrepresent your affiliation with a person or entity.</li>
              <li>Upload or transmit any unsolicited or unauthorized advertising, promotional materials, "junk mail," "spam," or any other form of solicitation.</li>
              <li>Violate any applicable local, provincial, national, or international law.</li>
            </ul>
          </section>
          
          <section className="space-y-2">
            <h2 className="font-headline text-2xl font-semibold text-primary/90 border-b pb-2">6. Intellectual Property</h2>
            <p>
                All rights, title, and interest in and to the App (excluding User Content), including all associated intellectual property rights, are and will remain the exclusive property of Blinkogies Pre-School and its licensors.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-headline text-2xl font-semibold text-primary/90 border-b pb-2">7. Termination</h2>
            <p>
              We may terminate or suspend your access to the App, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the App will immediately cease.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-headline text-2xl font-semibold text-primary/90 border-b pb-2">8. Disclaimers</h2>
            <p>
              The App is provided on an "AS IS" and "AS AVAILABLE" basis. We make no warranties, express or implied, regarding the operation or availability of the App or the information, content, or materials included therein.
            </p>
          </section>
          
          <section className="space-y-2">
            <h2 className="font-headline text-2xl font-semibold text-primary/90 border-b pb-2">9. Limitation of Liability</h2>
            <p>
              In no event shall Blinkogies Pre-School, nor its directors, employees, partners, or agents, be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or in connection with your use of the App.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-headline text-2xl font-semibold text-primary/90 border-b pb-2">10. Governing Law</h2>
            <p>
              These Terms shall be governed and construed in accordance with the laws of South Africa, without regard to its conflict of law provisions.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-headline text-2xl font-semibold text-primary/90 border-b pb-2">11. Changes to Terms</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of any changes by posting the new Terms on this page. Your continued use of the App after any such changes constitutes your acceptance of the new Terms.
            </p>
          </section>
          
          <section className="space-y-2">
            <h2 className="font-headline text-2xl font-semibold text-primary/90 border-b pb-2">12. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us:
            </p>
            <div className="p-4 bg-muted/50 rounded-md">
              <strong>Blinkogies Pre-School</strong><br />
              Email: admin@blinkogies.co.za<br />
              Phone: 072 595 3421<br />
              Address: C/O Chris Hougaard and Ockert st, Wierdapark, Centurion
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
