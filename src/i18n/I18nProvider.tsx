"use client";
import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Localized } from "@/lib/domain/types";
import { DICTS, type Dict, type Locale } from "./index";

const Ctx = createContext<{ lang: Locale; t: Dict; L: (x: Localized) => string } | null>(null);

export function I18nProvider({ lang, children }: { lang: Locale; children: ReactNode }) {
  const value = useMemo(() => ({ lang, t: DICTS[lang], L: (x: Localized) => x[lang] ?? x.ko }), [lang]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useI18n outside I18nProvider");
  return v;
}
