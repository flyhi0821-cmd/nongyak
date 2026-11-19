import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, LOCALES } from "@/i18n";

/**
 * 경로에 언어가 없으면 한국어(기본)로 보낸다.
 * 사용자가 화면에서 직접 언어를 바꾼 적이 있을 때(lang 쿠키)만 그 언어로 보낸다.
 * 브라우저 언어 설정(Accept-Language)은 보지 않는다.
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const has = LOCALES.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (has) return;
  const saved = req.cookies.get("lang")?.value;
  const lang = saved && (LOCALES as readonly string[]).includes(saved) ? saved : DEFAULT_LOCALE;
  req.nextUrl.pathname = `/${lang}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(req.nextUrl);
}

export const config = {
  // api, Next 내부 파일, 정적 파일(점 포함)은 제외
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
