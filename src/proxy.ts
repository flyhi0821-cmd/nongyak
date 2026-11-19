import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, LOCALES } from "@/i18n";

/** 경로에 언어가 없으면 쿠키 → Accept-Language → 기본(ko) 순으로 골라 리다이렉트 */
function pickLocale(req: NextRequest): string {
  const saved = req.cookies.get("lang")?.value;
  if (saved && (LOCALES as readonly string[]).includes(saved)) return saved;
  const accept = req.headers.get("accept-language") || "";
  for (const part of accept.split(",")) {
    const base = part.split(";")[0].trim().toLowerCase().split("-")[0];
    if ((LOCALES as readonly string[]).includes(base)) return base;
  }
  return DEFAULT_LOCALE;
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const has = LOCALES.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (has) return;
  req.nextUrl.pathname = `/${pickLocale(req)}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(req.nextUrl);
}

export const config = {
  // api, Next 내부 파일, 정적 파일(점 포함)은 제외
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
