"use client";
import { usePathname } from "next/navigation";
import { useI18n } from "@/i18n/I18nProvider";
import { LOCALES, type Locale } from "@/lib/domain/types";

const LABEL = { ko: "한국어", en: "English" } as const;
const SHORT = { ko: "한", en: "EN" } as const;

function useHref() {
  const path = usePathname() || "/";
  const rest = path.replace(/^\/(ko|en)(?=\/|$)/, "");
  return (l: Locale) => `/${l}${rest}`;
}
const remember = (l: Locale) => {
  document.cookie = `lang=${l};path=/;max-age=31536000;samesite=lax`;
};

/** 설정 화면용 (언어마다 루트 레이아웃이 달라 전체 새로고침으로 이동) */
export function LangSwitch() {
  const { lang, t } = useI18n();
  const href = useHref();
  return (
    <nav className="seg" aria-label={t.lang.label}>
      {LOCALES.map((l) => (
        <a key={l} href={href(l)} hrefLang={l} aria-current={l === lang} onClick={() => remember(l)}>
          {LABEL[l]}
        </a>
      ))}
    </nav>
  );
}

/** 상단 둥근 버튼: 다른 언어로 전환 */
export function LangButton() {
  const { lang, t } = useI18n();
  const href = useHref();
  const other: Locale = lang === "ko" ? "en" : "ko";
  return (
    <a className="iconbtn" href={href(other)} hrefLang={other} onClick={() => remember(other)} aria-label={`${t.nav.lang}: ${LABEL[other]}`} style={{ textDecoration: "none" }}>
      {SHORT[other]}
    </a>
  );
}
