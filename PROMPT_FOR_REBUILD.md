# Master Prompt: Build a Comprehensive Preschool Family Hub App

Hello! I need your help to build a complete web application from scratch. This app will be a "Family Hub" for a preschool, designed to connect parents, teachers, and administrators.

Please use the following tech stack: **Next.js with the App Router, React, TypeScript, Tailwind CSS, and ShadCN UI components**. For the backend, please use **Firebase (Authentication, Firestore, Storage)**. For any AI features, please use **Genkit**.

**Important:** Please use placeholder images (e.g., `https://placehold.co/600x400.png`) for all images throughout the app.

Here are the detailed requirements:

---

## **1. Core Concept & Style**

The app should be called **"Easyspark Hub"**. It needs to be professional, secure, and trustworthy, but also warm, cheerful, and inviting for parents.

- **Primary Color**: A vibrant, cheerful blue.
- **Background Color**: A clean off-white or very light version of the primary color.
- **Accent Color**: A warm, sunny orange or yellow.
- **Fonts**: Use "Lilita One" for headlines and "Poppins" for body text (from Google Fonts).
- **UI**: Use ShadCN UI components throughout the app for a modern and consistent look.

---

## **2. Public-Facing Features (No Login Required)**

These pages should be accessible to anyone visiting the site.

- **Homepage**:
    - A welcoming hero section with a headline, a brief description, and a large, visually appealing placeholder image.
    - Prominent buttons to "Register Your Child" and "View Upcoming Events".
    - A section displaying the 3 most recent items from the Photo Gallery.
- **Registration Selection Page (`/register`)**:
    - A page that allows users to choose between "Preschool Registration" and "Afterschool Registration".
- **Preschool & Afterschool Registration Pages (`/register/preschool`, `/register/afterschool`)**:
    - Create two separate but identical registration forms.
    - The forms must be comprehensive and capture:
        - **Child's Info**: Full Name, Date of Birth (with an easy-to-use year selector), Gender, optional Photo Upload.
        - **Parent's Info**: Full Name, Email, Phone Number, Physical Address.
        - **Parent Account Creation**: A section for the parent to create their password, which will be used with their email to log into the parent dashboard. Include a "confirm password" field.
        - **Emergency Info**: Emergency Contact Name & Phone, a text area for Medical Conditions/Allergies.
        - **Other Info**: A radio button for "Previous preschool experience?" (Yes/No), and a field for additional notes.
- **Events Page (`/events`)**: Displays a list of all upcoming school events. Each event should be a card with a placeholder image, title, description, and date.
- **Photo Gallery Page (`/gallery`)**: Displays a grid of photos from school activities. Each photo card should have a placeholder image, a title, and a short description.
- **Documents Page (`/documents`)**: A page where parents can view and download important files like newsletters or calendars. Each document should have a title, upload date, and a "Download" button.
- **Multi-language Support**: The app must support both English and Afrikaans. Include a language toggle button in the header. All user-facing text should come from a central translation file.
- **PWA Functionality**: The app should be installable on mobile devices. Include an "Install App" button in the header that triggers the installation prompt.

---

## **3. Parent-Specific Features (Requires Login)**

- **Parent Login (`/parent-login`)**:
    - A secure login page for parents using the email and password they created during child registration.
- **Parent Dashboard (`/parent/dashboard`)**:
    - After logging in, parents are taken here.
    - This page should display the daily reports for their child (or children, if they have multiple registered under the same email).
    - If no child is linked to their email, it should show a message guiding them to contact the school.
    - Each daily report card should clearly show the **Date, Mood (with an icon), Activities, Meals, Naps, an optional Photo, and any special notes from the teacher.**
- **Edit Child Profile (`/parent/dashboard/[childId]/edit`)**:
    - Parents must be able to click an "Edit Profile" button from their dashboard for each child.
    - This page should allow them to edit **all** of their child's information (Name, DOB, Gender, Photo, their own Phone/Address, Emergency Contacts, Medical Info, etc.).
    - When a parent saves a change, it should flag the child's profile in the admin view.

---

## **4. Administrator Features (Requires Secure Admin Login)**

The admin section should be accessed via `/admin`. It must have a dedicated, collapsible sidebar for navigation.

- **Secure Admin Login (`/admin`)**: A separate login page for teachers and admins. Include a "Forgot Password" link.
- **Admin Dashboard (`/admin/dashboard`)**:
    - The main landing page after login.
    - Show key stats at a glance: total number of registered preschool children and upcoming events.
    - Include quick-link cards to all major management pages.
    - **Import/Export Children**: Provide functionality to import children from a CSV/TSV file and export all children's data to CSV/TSV. The import dialog should show the required header format.
- **Manage Children (`/admin/dashboard/children` and `/admin/dashboard/afterschool`)**:
    - Create two separate pages for Preschool and Afterschool children.
    - Each page should have a table displaying all registered children with their key details (photo, name, age, parent info).
    - **Parent Update Notification**: If a parent has updated a child's profile, display a small history icon next to the child's name with a tooltip indicating the update date. This icon should disappear after an admin edits and saves the profile.
    - Provide actions to **Edit** a child's full profile and **Delete** a child's profile (with a confirmation dialog).
- **Manage Daily Reports (`/admin/dashboard/children/[childId]/reports`)**:
    - From the children list, an admin must be able to click on a child to manage their reports.
    - A form to **Create** a new daily report for that child (Date, Mood, Activities, Meals, Naps, Photo, Notes).
    - A list of past reports for that child, with options to **Edit** or **Delete** them.
- **Manage Events, Gallery, and Documents**:
    - Create three separate pages for managing Events, Gallery items, and Documents.
    - Each page should have a form on one side to **Create/Edit** items (Title, Date, Description, Image/File Upload) and a table on the other side to display existing items with **Edit** and **Delete** buttons.
- **Manage Teachers (`/admin/dashboard/teachers`)**:
    - A page listing all registered teachers/admins.
    - **Important**: State clearly that new teachers must be added via the Firebase Authentication console.
    - Admins should be able to **Edit** an existing teacher's profile details (Name, Role, Contact Info, Photo).
    - Admins should be able to **Delete** a teacher's Firestore profile. This should trigger a confirmation and a follow-up dialog instructing the admin to manually delete the user from Firebase Authentication. An admin cannot delete their own profile.
- **Manage Parents (`/admin/dashboard/parents`)**:
    - A page listing all unique parents, their contact info, and the children linked to their account.
    - Provide a feature for admins to **Edit** a parent's name and phone number.
- **Compose Message (`/admin/dashboard/notifications`)**:
    - A form to write a message (Subject and Body).
    - A button to "Send via Email" which opens the user's default email client with all parent emails pre-filled in the BCC field.
    - A button to "Send via WhatsApp" which opens WhatsApp with the message pre-filled and copies all parent phone numbers to the clipboard.
- **AI Creative Assistant (`/admin/dashboard/ai-assistant`)**:
    - Use **Genkit** for this feature.
    - Provide two buttons: "Generate Story Starters" and "Generate Activity Ideas".
    - When clicked, the AI should generate and display 5 unique, age-appropriate ideas in cards.
- **Settings (`/admin/dashboard/settings`)**:
    - A page where the logged-in admin can change their own password. It should require them to enter their current password and a new password, with confirmation.

---

## **5. Backend & Database (Firebase)**

- **Authentication**: Use Firebase Auth for both Parent and Admin logins. Create separate login flows.
- **Firestore**: Create the following collections:
    - `children`: To store all preschool child registration data.
    - `afterschoolChildren`: To store all afterschool child registration data.
    - `daily_reports`: To store the daily reports linked to a child's ID.
    - `events`: To store school events.
    - `activities`: To store the gallery photos and descriptions.
    - `documents`: To store info about uploaded files.
    - `teachers`: To store teacher profile information (document ID should be their Auth UID).
- **Storage**: Use Firebase Storage to host all uploaded placeholder images and documents.

Please start by setting up the project structure, installing the necessary dependencies, and then begin building out the features, starting with the public pages. Thank you!