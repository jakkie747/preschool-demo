// This file must be in the public folder.

// Scripts for Firebase v10 compat libraries
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// Your app's Firebase configuration from src/lib/firebase.ts
const firebaseConfig = {
  apiKey: "AIzaSyDORczgYjyxDvjSAfW7Q9fsT8wkJ4gIe1g",
  authDomain: "blink-notify-494bf.firebaseapp.com",
  projectId: "blink-notify-494bf",
  storageBucket: "blink-notify-494bf.firebasestorage.app",
  messagingSenderId: "450079883039",
  appId: "1:450079883039:web:4e4162b5a3f6e1beb27a2a"
};

// Initialize the Firebase app in the service worker
firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

/**
 * The default service worker implementation is sufficient for most use cases.
 * Firebase's SDK will automatically handle displaying notifications sent from
 * FCM when the web app is in the background.
 *
 * You can optionally add an onBackgroundMessage handler to customize behavior.
 * e.g., messaging.onBackgroundMessage((payload) => { ... });
 */
