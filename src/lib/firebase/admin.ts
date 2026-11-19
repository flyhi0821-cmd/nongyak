import "server-only";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

/**
 * 서버 전용(Route Handler·Cron). 서비스 계정 JSON을 base64로 넣은
 * FIREBASE_SERVICE_ACCOUNT_B64 환경변수를 쓴다.
 */
export function adminDb() {
  if (!getApps().length) {
    const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_B64;
    if (!b64) throw new Error("FIREBASE_SERVICE_ACCOUNT_B64 is not set");
    const sa = JSON.parse(Buffer.from(b64, "base64").toString("utf8"));
    initializeApp({ credential: cert(sa) });
  }
  return getFirestore();
}
