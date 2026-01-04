import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// TODO: Replace with your actual Firebase project configuration
// You can get this from the Firebase Console specific to your project.
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDsENYjoqG8JLrXQRIXXkhiN9JgSkwXqow",
  authDomain: "queue-mgmt-sys.firebaseapp.com",
  projectId: "queue-mgmt-sys",
  storageBucket: "queue-mgmt-sys.firebasestorage.app",
  messagingSenderId: "444997700120",
  appId: "1:444997700120:web:a2efacdbaa4eb6cc74116d",
  measurementId: "G-7ER8LVS281"
};
// Auto-detect if running on Firebase Hosting to fetch config dynamically
// This works when deployed to Firebase Hosting
const fetchConfig = async () => {
    try {
        const response = await fetch('/__/firebase/init.json');
        if (response.ok) {
            return await response.json();
        }
    } catch (e) {
        console.log("Could not fetch automatic config, falling back to manual constant.");
    }
    return firebaseConfig;
};

// We initialize asynchronously to allow for config fetching if needed
// However, top-level await is supported in modern modules, but for safety in simple examples
// we often stick to synchronous init with hardcoded values.
// For this demo, we will expose a promise or initialize immediately with the placeholder
// if you are running locally without emulators.

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
