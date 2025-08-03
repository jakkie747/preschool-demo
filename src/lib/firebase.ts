
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { getFunctions, type Functions } from "firebase/functions";

// =================================================================================
// IMPORTANT: ACTION REQUIRED
// =================================================================================
// Your app is not connecting to Firebase. Please add your project's configuration
// details below.
//
// How to find your Firebase config:
// 1. Go to your Firebase project: https://console.firebase.google.com/project/blink-notify-494bf/overview
// 2. Click the gear icon (Project settings) next to "Project Overview".
// 3. In the "General" tab, scroll down to the "Your apps" section.
// 4. Find your web app, and in the "SDK setup and configuration" box, select "Config".
// 5. You will see an object called `firebaseConfig`. Copy the values from that
//    object and paste them into the `firebaseConfig` object below, replacing
//    the placeholder values like "PASTE_YOUR_API_KEY_HERE".
// =================================================================================
export const firebaseConfig = {
  apiKey: "AIzaSyA0ow_omnTQpny-b5OT7gJNPScDCCa8QMI",
  authDomain: "preschool-demo-621f9.firebaseapp.com",
  projectId: "preschool-demo-621f9",
  storageBucket: "preschool-demo-621f9.firebasestorage.app",
  messagingSenderId: "13117689300",
  appId: "1:13117689300:web:93ee30d12b357c82fa1a41"
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
