import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAuth, type Auth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: "G-9FMYPGCLNB",
};

function isConfigured() {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.appId
  );
}

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

function ensureFirebaseClient() {
  if (typeof window === "undefined") {
    throw new Error("Firebase client SDK can only be used in the browser.");
  }
  if (!isConfigured()) {
    throw new Error(
      "Firebase is not configured. Add NEXT_PUBLIC_FIREBASE_* values to .env.local."
    );
  }
  if (!app) {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
  }
  return { app, db: db!, auth: auth! };
}

/** Lazily initialize Firestore on the client (avoids SSR undefined db). */
export function getDb(): Firestore {
  return ensureFirebaseClient().db;
}

/** Lazily initialize Firebase Auth on the client. */
export function getClientAuth(): Auth {
  return ensureFirebaseClient().auth;
}

export function getFirebaseApp(): FirebaseApp {
  return ensureFirebaseClient().app;
}

let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== "undefined" && isConfigured()) {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(getFirebaseApp());
    }
  });
}

export { analytics };
