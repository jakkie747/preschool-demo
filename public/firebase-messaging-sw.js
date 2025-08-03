// This service worker is required to receive and display web push notifications.
// It must be located in the public directory.

// Scripts for Firebase and Firebase Messaging
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDORczgYjyxDvjSAfW7Q9fsT8wkJ4gIe1g",
  authDomain: "blink-notify-494bf.firebaseapp.com",
  projectId: "blink-notify-494bf",
  storageBucket: "blink-notify-494bf.firebasestorage.app",
  messagingSenderId: "450079883039",
  appId: "1:450079883039:web:4e4162b5a3f6e1beb27a2a",
};


// Initialize Firebase
if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
}

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

// The onBackgroundMessage handler is used for custom logic when a data message
// is received. For simple notifications sent from the backend, Firebase
// handles displaying the notification automatically, so this can be left empty
// or customized later if needed.
messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );

  // Customize notification here
  const notificationTitle = payload.notification?.title || "Blinkogies Update";
  const notificationOptions = {
    body: payload.notification?.body,
    icon: payload.notification?.image || "https://placehold.co/192x192.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
