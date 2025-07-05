
'use client';

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

// Your web app's Firebase configuration.
// This is read from the .env file.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

// Check if all necessary Firebase config keys are present to avoid app crash
const isFirebaseConfigured = firebaseConfig.apiKey &&
                             firebaseConfig.authDomain &&
                             firebaseConfig.projectId;

if (isFirebaseConfigured) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
  } catch(error) {
    console.error("Firebase initialization failed:", error);
    // If initialization fails (e.g., invalid config values), set to null
    app = null;
    auth = null;
  }
} else {
    // This warning will appear in the browser console if keys are missing
    if (typeof window !== 'undefined') {
        console.warn("Firebase is not configured. Please ensure all required variables are set in a .env.local file and that you have restarted the development server.");
        if (!firebaseConfig.apiKey) console.warn("❌ Missing: NEXT_PUBLIC_FIREBASE_API_KEY");
        if (!firebaseConfig.authDomain) console.warn("❌ Missing: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN");
        if (!firebaseConfig.projectId) console.warn("❌ Missing: NEXT_PUBLIC_FIREBASE_PROJECT_ID");
    }
}

export { app, auth };
