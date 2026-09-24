import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, browserLocalPersistence, setPersistence, type Auth } from "firebase/auth";

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY?.trim(),
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim(),
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim(),
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET?.trim(),
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim(),
  appId: import.meta.env.VITE_FIREBASE_APP_ID?.trim(),
};

export const firebaseConfigured = Boolean(
  config.apiKey && config.authDomain && config.projectId && config.appId
);

let firebaseApp: FirebaseApp | null = null;
let auth: Auth | null = null;

if (firebaseConfigured) {
  firebaseApp = initializeApp(config);
  auth = getAuth(firebaseApp);
  setPersistence(auth, browserLocalPersistence).catch((error) =>
    console.error("Firebase persistence setup failed:", error)
  );
} else {
  console.warn("Firebase is not configured. Add the VITE_FIREBASE_* variables in Vercel to enable login.");
}

export { firebaseApp, auth };

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });
