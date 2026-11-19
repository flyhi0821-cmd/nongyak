"use client";
import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from "firebase/firestore";

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/** .env.local 이 아직 없을 때 화면에 안내를 띄우기 위한 플래그 */
export const firebaseConfigured = Boolean(config.apiKey && config.projectId);

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

function ensureApp(): FirebaseApp {
  if (!firebaseConfigured) throw new Error("Firebase env vars missing (.env.local)");
  if (!app) app = getApps()[0] ?? initializeApp(config);
  return app;
}

export function firebaseAuth(): Auth {
  if (!auth) auth = getAuth(ensureApp());
  return auth;
}

export function firestore(): Firestore {
  if (!db) {
    const a = ensureApp();
    try {
      // 과원에서 통신이 끊겨도 기록이 남도록 오프라인 캐시 사용
      db = initializeFirestore(a, {
        localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
      });
    } catch {
      db = getFirestore(a);
    }
  }
  return db;
}

export const googleProvider = () => {
  const p = new GoogleAuthProvider();
  p.setCustomParameters({ prompt: "select_account" });
  return p;
};
