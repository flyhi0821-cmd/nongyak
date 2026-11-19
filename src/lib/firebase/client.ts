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

/*
 * Firebase 웹 설정은 비밀값이 아니다(브라우저에 그대로 내려감). 접근 통제는 Firestore 규칙과
 * Authentication 승인 도메인이 맡는다. 그래서 환경변수가 없을 때 이 프로젝트 값을 기본으로 쓴다
 * → GitHub push 만으로 Vercel 배포가 바로 동작.
 */
const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDZ0U1J5mrVMPWIobdwPsmYPzFG20OVVJc",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "nongyak-b1e73.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "nongyak-b1e73",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "nongyak-b1e73.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "698537164347",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:698537164347:web:b73148a1290de2400b661e",
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
