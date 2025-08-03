
export default function PrivacyPolicyPage() {
  return (
    <div className="bg-background text-foreground">
      <div className="container mx-auto max-w-4xl py-12 px-4 md:py-24">
        <h1 className="font-headline text-4xl font-bold text-primary mb-4">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last Updated: {new Date().toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <div className="space-y-6 text-foreground/90">
          <section className="space-y-2">
            <h2 className="font-headline text-2xl font-semibold text-primary/90 border-b pb-2">1. Introduction</h2>
            <p>
              Welcome to the Blinkogies App (the "App"). This App is operated by Blinkogies Pre-School ("we", "us", "our"). We are committed to protecting the privacy and personal information of our students, parents, guardians, and staff.
            </p>
            <p>
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our App. It is designed to comply with the Protection of Personal Information Act (POPIA) of South Africa.
            </p>
            <p>
              By registering for and using the App, you agree to the collection and use of information in accordance with this policy.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-headline text-2xl font-semibold text-primary/90 border-b pb-2">2. Information We Collect</h2>
            <p>
              We collect personal information that you voluntarily provide to us when you register a child, as well as information collected from our administrative staff. The types of personal information we collect include:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-4">
              <li><strong>Child's Information:</strong> Full name, date of birth, gender, and photograph.</li>
              <li><strong>Parent/Guardian Information:</strong> Full names, email addresses, phone numbers, and physical addresses.</li>
              <li><strong>Emergency and Medical Information:</strong> Emergency contact person's name and phone number, and any relevant medical conditions or allergies your child may have.</li>
              <li><strong>Teacher and Staff Information:</strong> Full name, email address, contact number, and home address. This information is collected for administrative and communication purposes.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="font-headline text-2xl font-semibold text-primary/90 border-b pb-2">3. How We Use Your Information</h2>
            <p>
              We use the information we collect for the following purposes, which are necessary for the functioning of our school and the App:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-4">
              <li>To create and manage student and teacher profiles within the App.</li>
              <li>To facilitate communication between the school and parents/guardians regarding school events, activities, and general notices.</li>
              <li>To use in case of a medical emergency.</li>
              <li>To manage our administrative records.</li>
              <li>To ensure the safety and security of our students and staff.</li>
              <li>To comply with our legal and regulatory obligations.</li>
            </ul>
            <p>
              We will not use your personal information for any other purpose without your express consent. We do not sell, rent, or trade your personal information to any third parties for marketing purposes.
            </p>
          </section>
          
          <section className="space-y-2">
            <h2 className="font-headline text-2xl font-semibold text-primary/90 border-b pb-2">4. Legal Basis for Processing (POPIA)</h2>
            <p>
                Under POPIA, our legal basis for collecting and using the personal information described in this Privacy Policy is primarily:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-4">
                <li><strong>Consent:</strong> When you register your child, you provide consent for us to process their and your personal information for the purposes outlined.</li>
                <li><strong>Legitimate Interest:</strong> We process information for our legitimate interests in operating a pre-school, ensuring child safety, and communicating effectively with parents, provided these interests are not overridden by your data protection rights.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="font-headline text-2xl font-semibold text-primary/90 border-b pb-2">5. Information Sharing and Disclosure</h2>
            <p>We may share your information with:</p>
            <ul className="list-disc list-inside space-y-1 pl-4">
              <li><strong>Authorised School Staff:</strong> Teachers and administrative staff will have access to information on a need-to-know basis to perform their duties.</li>
              <li><strong>Service Providers:</strong> We use third-party services to operate our App, such as Google Firebase for database management, storage, and authentication. These providers are contractually obligated to protect your data and are not permitted to use it for any other purpose. You can view Google's Privacy Policy <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">here</a>.</li>
              <li><strong>Legal Requirements:</strong> We may disclose your information if required to do so by law or in response to valid requests by public authorities (e.g., a court or a government agency).</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="font-headline text-2xl font-semibold text-primary/90 border-b pb-2">6. Data Storage and Security</h2>
            <p>
              Your personal information is stored securely on Google Firebase servers. We take reasonable and appropriate technical and organisational measures to protect your personal information from loss, misuse, unauthorised access, disclosure, alteration, and destruction. These measures include access controls, data encryption, and secure storage protocols.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-headline text-2xl font-semibold text-primary/90 border-b pb-2">7. Data Retention</h2>
            <p>
              We will retain your personal information only for as long as is necessary for the purposes set out in this Privacy Policy. Generally, this means we will retain the information for the duration of your child's enrolment at Blinkogies Pre-School and for a reasonable period thereafter to comply with our legal and administrative obligations. Once no longer required, the information will be securely deleted.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-headline text-2xl font-semibold text-primary/90 border-b pb-2">8. Your Rights Under POPIA</h2>
            <p>As a data subject in South Africa, you have the following rights:</p>
            <ul className="list-disc list-inside space-y-1 pl-4">
              <li><strong>The right to access:</strong> You have the right to request copies of your personal information.</li>
              <li><strong>The right to rectification:</strong> You have the right to request that we correct any information you believe is inaccurate or complete information you believe is incomplete.</li>
              <li><strong>The right to erasure:</strong> You have the right to request that we erase your personal information, under certain conditions.</li>
              <li><strong>The right to restrict processing:</strong> You have the right to object to our processing of your personal information, under certain conditions.</li>
              <li><strong>The right to data portability:</strong> You have the right to request that we transfer the data that we have collected to another organization, or directly to you, under certain conditions.</li>
              <li><strong>The right to complain:</strong> You have the right to lodge a complaint with the Information Regulator of South Africa if you believe we have not processed your information in accordance with POPIA.</li>
            </ul>
            <p>To exercise any of these rights, please contact us at the details provided below.</p>
          </section>

          <section className="space-y-2">
            <h2 className="font-headline text-2xl font-semibold text-primary/90 border-b pb-2">9. Children's Privacy</h2>
            <p>
              We collect information about children under the age of 18 for educational and safety purposes only. This is done with the explicit consent of a parent or legal guardian during the registration process. We do not knowingly collect personal information from children without parental consent.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-headline text-2xl font-semibold text-primary/90 border-b pb-2">10. Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. We may also notify you via email or through an in-app notification.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-headline text-2xl font-semibold text-primary/90 border-b pb-2">11. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or wish to exercise your rights, please contact our Information Officer:
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
