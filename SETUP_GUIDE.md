
# How to Build an App Like This From Scratch

This guide provides a step-by-step walkthrough for setting up a new Next.js application with all the core features and technologies used in this project, including Firebase, ShadCN UI, and Genkit for AI.

---

## **Part 1: Initial Project Setup**

First, you'll create a new Next.js project with the necessary defaults.

1.  **Create a Next.js App:**
    Open your terminal and run the following command. Replace `your-app-name` with your desired project name.

    ```bash
    npx create-next-app@latest your-app-name --typescript --tailwind --eslint
    ```

    When prompted, answer the questions as follows:
    *   `Would you like to use App Router?` **Yes**
    *   `Would you like to customize the default import alias (@/*)?` **Yes** (and accept the default `@/*`)

2.  **Navigate to Your Project:**
    ```bash
    cd your-app-name
    ```

---

## **Part 2: Firebase Project Configuration**

This is the most crucial part. You'll set up the cloud backend that will store all your app's data.

1.  **Create a Firebase Project:**
    *   Go to the [Firebase Console](https://console.firebase.google.com/).
    *   Click **"Add project"** and follow the on-screen instructions to create a new project.

2.  **Register a Web App:**
    *   In your new project's dashboard, click the web icon (`</>`) to add a web app.
    *   Give your app a nickname and click **"Register app"**.
    *   Firebase will display your `firebaseConfig` object. **Keep this page open!** You will need to copy these credentials in the next step.

3.  **Set Up Firebase in Your Next.js App:**
    *   **Install the Firebase SDK:** In your terminal, run:
        ```bash
        npm install firebase
        ```
    *   **Create a Firebase configuration file:** Create a new file at `src/lib/firebase.ts`.
    *   **Paste your credentials:** Copy the entire content below into `src/lib/firebase.ts`, and replace the placeholder values with the actual credentials from the Firebase Console page you kept open.

    ```typescript
    // src/lib/firebase.ts

    import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
    import { getAuth, type Auth } from "firebase/auth";
    import { getFirestore } from "firebase/firestore";
    import { getStorage, type FirebaseStorage } from "firebase/storage";
    import { getFunctions, type Functions } from "firebase/functions";

    // PASTE YOUR FIREBASE CONFIGURATION OBJECT HERE
    export const firebaseConfig = {
      apiKey: "PASTE_YOUR_API_KEY_HERE",
      authDomain: "PASTE_YOUR_AUTH_DOMAIN_HERE",
      projectId: "PASTE_YOUR_PROJECT_ID_HERE",
      storageBucket: "PASTE_YOUR_STORAGE_BUCKET_HERE",
      messagingSenderId: "PASTE_YOUR_MESSAGING_SENDER_ID_HERE",
      appId: "PASTE_YOUR_APP_ID_HERE",
    };

    // Function to check if Firebase config is filled
    export const isFirebaseConfigured = (): boolean => {
      return !!firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith("PASTE_YOUR");
    };

    // Initialize Firebase
    const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    const db = getFirestore(app);
    const storage: FirebaseStorage = getStorage(app);
    const auth: Auth = getAuth(app);
    const functions: Functions | null = isFirebaseConfigured() ? getFunctions(app) : null;

    export { app, db, storage, auth, functions };
    ```

4.  **Enable Firebase Services:**
    In the Firebase Console menu on the left, navigate to the following sections and enable them:
    *   **Authentication:** Click "Get started" and enable the **Email/Password** provider.
    *   **Firestore Database:** Click "Create database", choose **Production mode**, select your preferred location, and click "Enable".
    *   **Storage:** Click "Get started", choose **Production mode**, and click through the prompts to enable it.

5.  **Configure Security Rules:**
    You need to tell Firebase who can read and write data. For this app, we allow public reads for things like events and gallery photos, but only authenticated users can write data.

    *   **Firestore Rules:**
        *   Go to the **Firestore Database** page in the Firebase Console and click the **"Rules"** tab.
        *   Copy the content from the `firestore.rules` file in this project and paste it into the editor, overwriting the default rules.
        *   Click **"Publish"**.

    *   **Storage Rules:**
        *   Go to the **Storage** page and click the **"Rules"** tab.
        *   Copy the content from the `storage.rules` file in this project and paste it into the editor.
        *   Click **"Publish"**.

6.  **Configure Storage CORS for File Uploads:**
    This step is essential to allow your web app to upload files to Firebase Storage.
    *   Go to the [Google Cloud Shell](https://console.cloud.google.com/) for your project. (You can find a link to this in the Firebase Storage settings).
    *   When the terminal opens, run the following two commands one by one:
        1.  Create the CORS configuration file:
            ```bash
            echo '[{"origin": ["*"], "method": ["GET", "PUT", "POST"], "responseHeader": ["Content-Type"], "maxAgeSeconds": 3600}]' > cors.json
            ```
        2.  Apply the configuration to your storage bucket. **Important:** Replace `your-project-id` with your actual Firebase Project ID.
            ```bash
            gsutil cors set cors.json gs://your-project-id.appspot.com
            ```
            *Note: You must use the bucket name ending in `.appspot.com` for this command, even if your console shows a different URL.*

---

## **Part 3: UI and Component Setup (ShadCN)**

Now, let's set up the user interface components.

1.  **Initialize ShadCN UI:**
    Run this command in your terminal:
    ```bash
    npx shadcn-ui@latest init
    ```
    Answer the prompts to match this project's configuration:
    *   `Which style would you like to use?` **Default**
    *   `Which color would you like to use as base color?` **Neutral**
    *   `Where is your global CSS file?` **`src/app/globals.css`**
    *   `Would you like to use CSS variables for colors?` **Yes**
    *   `Where is your tailwind.config.js located?` **`tailwind.config.ts`**
    *   `Configure the import alias for components:` **`@/components`**
    *   `Configure the import alias for utils:` **`@/lib/utils`**
    *   `Are you using React Server Components?` **Yes**

2.  **Add Required Components:**
    Install all the UI components this app uses with a single command:
    ```bash
    npx shadcn-ui@latest add button card input label sheet toast form select textarea avatar alert alert-dialog dialog dropdown-menu skeleton table badge
    ```

3.  **Copy Styling:**
    *   Replace the contents of `src/app/globals.css` with the code from this project's `globals.css` file to apply the Blinkogies color theme.
    *   Replace the contents of `tailwind.config.ts` with the code from this project's `tailwind.config.ts` to add the custom fonts and color definitions.

---

## **Part 4: Replicating App Structure and Logic**

The easiest way to get the app's functionality is to copy the existing logic files.

1.  **Create Service Files:**
    *   Create a directory: `src/services`.
    *   Inside `src/services`, create the following files and copy the content from this project into them:
        *   `childrenService.ts`
        *   `activityService.ts`
        *   `eventsService.ts`
        *   `documentService.ts`
        *   `teacherService.ts`
        *   `reportService.ts`
        *   `storageService.ts`

2.  **Create Library and Context Files:**
    *   Create `src/lib/types.ts` and `src/lib/translations.ts`. Copy the contents over.
    *   Create a directory `src/context` and add `LanguageContext.tsx` from this project.

3.  **Copy Core Components:**
    *   Copy the custom components from this project's `src/components/` directory (like `Logo.tsx`, and the `layout` and `admin` subdirectories) into your new project's `src/components/` directory.

4.  **Recreate Pages:**
    *   Go through the `src/app` directory in this project and recreate the page structure and files (`page.tsx`, `layout.tsx`) in your new project.
    *   This includes the `admin`, `parent`, `parent-login` folders, and all the public pages like `events`, `gallery`, etc.

---

## **Part 5: Setting up AI Features (Genkit)**

To enable the AI Assistant feature:

1.  **Install Genkit Packages:**
    ```bash
    npm install genkit @genkit-ai/googleai @genkit-ai/next zod
    ```
2.  **Create AI Files:**
    *   Create a directory: `src/ai`.
    *   Inside `src/ai`, create `genkit.ts` and `dev.ts`. Copy their content from this project.
    *   Create a subdirectory: `src/ai/flows`.
    *   Inside `flows`, create `creative-ideas-flow.ts` and copy its content.
3.  **Set Environment Variable:**
    *   Create a file named `.env.local` in the root of your project.
    *   Add your Google AI API key to it:
        ```
        GOOGLE_API_KEY=your_google_api_key_here
        ```

You are now set up! Run `npm run dev` in your terminal to start the development server and see your new app in action.
