"use client";
import { onAuthStateChanged, signInWithPopup, signInWithRedirect, signOut as fbSignOut, type User } from "firebase/auth";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { firebaseAuth, firebaseConfigured, googleProvider } from "@/lib/firebase/client";

interface AuthState {
  user: User | null;
  /** 첫 인증 상태 확인 전 */
  loading: boolean;
  configured: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(firebaseConfigured);

  useEffect(() => {
    if (!firebaseConfigured) return;
    return onAuthStateChanged(firebaseAuth(), (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  const value: AuthState = {
    user,
    loading,
    configured: firebaseConfigured,
    signIn: async () => {
      try {
        await signInWithPopup(firebaseAuth(), googleProvider());
      } catch (e) {
        const code = (e as { code?: string }).code;
        // 팝업이 막히면(일부 모바일·인앱 브라우저) 페이지 이동 방식으로 다시 시도
        if (code === "auth/popup-blocked" || code === "auth/operation-not-supported-in-this-environment") {
          await signInWithRedirect(firebaseAuth(), googleProvider());
          return;
        }
        // 사용자가 창을 닫은 경우는 오류로 보여주지 않는다
        if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") return;
        throw e;
      }
    },
    signOut: () => fbSignOut(firebaseAuth()),
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth outside AuthProvider");
  return v;
}
