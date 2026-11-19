import { ING_BY_ID, INGREDIENTS, MIXES } from "./data";
import type { Localized, SprayRecord } from "./types";

/** 'IRAC 21A' → 'IRAC 21', 'FRAC M3' → 'FRAC M3', '21A' → 'IRAC 21' */
export function groupOf(code: string | undefined | null): string {
  const c = (code || "").toUpperCase().replace(/\s+/g, " ").trim();
  if (!c) return "";
  if (c.startsWith("UN")) return "UN";
  const m = c.match(/^(IRAC|FRAC)?\s*(M?\d+)/);
  if (!m) return c;
  const sys = m[1] || (m[2].startsWith("M") ? "FRAC" : "IRAC");
  return `${sys} ${m[2]}`;
}

/** 저항성 위험이 낮아 연속 살포 경고에서 빼는 그룹 */
export const isExempt = (g: string) => !g || g === "UN" || /^FRAC M/.test(g) || /^KR 엠/.test(g);

export const shortCode = (c: string) => c.replace("IRAC ", "").replace("FRAC ", "F");

/** 라벨 표기를 코드로. 숫자형(예: 21A)은 IRAC로 맞춤 */
export function codeFromLabel(t: string | undefined): string {
  const s = String(t || "").toUpperCase().replace(/\s+/g, "").trim();
  if (!s) return "";
  if (/^(IRAC|FRAC|KR)/.test(s)) return s.replace(/^(IRAC|FRAC|KR)/, "$1 ");
  // 국내 살균제 한글 기호(예: 다3)
  if (/^[가-힣]/.test(s)) return "KR " + s;
  if (/^\d+[A-Z]?$/.test(s)) return "IRAC " + s;
  return s;
}

/* ---------- 상품명 → 성분 ---------- */
export const PRODUCTS: Record<string, string[]> = {};
for (const i of INGREDIENTS) {
  if (!i.product) continue;
  for (const raw of i.product.split("·")) {
    const n = raw.trim();
    if (n) PRODUCTS[n] = [i.id];
  }
}
Object.assign(PRODUCTS, MIXES);

const PNAMES = Object.keys(PRODUCTS).sort((a, b) => b.length - a.length);
const norm = (s: string) => String(s || "").replace(/\s+/g, "").replace(/[()（）]/g, "");

/** 접두 일치: '산마루 수화제' → 산마루 */
export function resolveProduct(name: string): { name: string; ids: string[] } | null {
  const n = norm(name);
  if (!n) return null;
  const hit = PNAMES.find((k) => n.startsWith(norm(k)));
  return hit ? { name: hit, ids: PRODUCTS[hit] } : null;
}

export function mixesOf(id: string): string[] {
  return Object.entries(MIXES)
    .filter(([, ids]) => ids.includes(id) && ids.length > 1)
    .map(([n]) => n);
}

export interface IngInfo {
  id: string;
  name: Localized;
  code: string;
  group: string;
  src: "J" | "U";
}

export function ingInfoById(id: string): IngInfo {
  const i = ING_BY_ID[id];
  return { id: i.id, name: i.name, code: i.code, group: groupOf(i.code), src: i.src };
}

/** 기록에 들어간 성분 목록. 모르면 빈 배열 */
export function ingsOf(r: SprayRecord): IngInfo[] {
  const res = resolveProduct(r.product);
  if (res) return res.ids.map(ingInfoById);
  if (r.code) {
    // 혼합제는 '21A+10B' 처럼 + 로 이어서 저장한다
    const label = `${r.product || ""}`;
    return r.code
      .split("+")
      .map((c) => codeFromLabel(c))
      .filter(Boolean)
      .map((code, k, arr) => ({
        id: `c:${label}:${code}`,
        name: { ko: label + (arr.length > 1 ? ` 성분${k + 1}` : " 성분"), en: label + (arr.length > 1 ? ` (ingredient ${k + 1})` : " (ingredient)") },
        code,
        group: groupOf(code),
        src: "U" as const,
      }));
  }
  return [];
}
