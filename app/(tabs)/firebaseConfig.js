import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAX-JAqgadu0apc6XAzHpm3E0Jan75weG4",
  authDomain: "memoria-app-4d977.firebaseapp.com",
  projectId: "memoria-app-4d977",
  storageBucket: "memoria-app-4d977.appspot.com",
  messagingSenderId: "224780412371",
  appId: "1:224780412371:web:bddeb86b83bf4da1b83b26",
  databaseURL:
    "https://memoria-app-4d977-default-rtdb.asia-southeast1.firebasedatabase.app/", // Your Firebase Database URL
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app); // Get the Firebase Realtime Database reference

export { app, database };
