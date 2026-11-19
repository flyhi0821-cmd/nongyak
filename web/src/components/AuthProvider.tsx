"use client";
import { onAuthStateChanged, signInWithPopup, signOut as fbSignOut, type User } from "firebase/auth";
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
      await signInWithPopup(firebaseAuth(), googleProvider());
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
