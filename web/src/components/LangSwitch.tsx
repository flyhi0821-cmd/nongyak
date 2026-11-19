"use client";
import { usePathname } from "next/navigation";
import { useI18n } from "@/i18n/I18nProvider";
import { LOCALES } from "@/lib/domain/types";

const LABEL = { ko: "한국어", en: "EN" } as const;

export function LangSwitch() {
  const { lang, t } = useI18n();
  const path = usePathname() || "/";
  const rest = path.replace(/^\/(ko|en)(?=\/|$)/, "");
  return (
    <nav className="seg" aria-label={t.lang.label} style={{ border: "1px solid var(--line)" }}>
      {/* 언어마다 루트 레이아웃이 달라 전체 새로고침으로 이동 */}
      {LOCALES.map((l) => (
        <a
          key={l}
          href={`/${l}${rest}`}
          hrefLang={l}
          aria-current={l === lang}
          onClick={() => {
            document.cookie = `lang=${l};path=/;max-age=31536000;samesite=lax`;
          }}
        >
          {LABEL[l]}
        </a>
      ))}
    </nav>
  );
}
