// Import the Firebase app and messaging modules.
// This uses the compatibility library to work in a service worker environment.
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// IMPORTANT: These are your public Firebase project configuration values.
const firebaseConfig = {
  apiKey: "AIzaSyDORczgYjyxDvjSAfW7Q9fsT8wkJ4gIe1g",
  authDomain: "blink-notify-494bf.firebaseapp.com",
  projectId: "blink-notify-494bf",
  storageBucket: "blink-notify-494bf.firebasestorage.app",
  messagingSenderId: "450079883039",
  appId: "1:450079883039:web:4e4162b5a3f6e1beb27a2a",
};

// Initialize the Firebase app in the service worker
firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    '[firebase-messaging-sw.js] Received background message ',
    payload
  );
  
  // Customize the notification here from the data passed in the cloud function
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || '/logo-192.png', // A default icon
    data: {
        // The fcmOptions.link is passed from the cloud function
        url: payload.fcmOptions.link 
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// This listener handles what happens when a user clicks the notification.
self.addEventListener('notificationclick', (event) => {
    // Close the notification
    event.notification.close(); 

    // Get the URL from the notification's data payload
    const urlToOpen = event.notification.data.url || '/';

    // Tell the browser to open a new tab/window to that URL
    event.waitUntil(
        clients.openWindow(urlToOpen)
    );
});
