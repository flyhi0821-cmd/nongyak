/**
 * 농촌진흥청 농약안전정보시스템(PSIS) 농약등록정보 OpenAPI
 *   요청 URL: http://psis.rda.go.kr/openApi/service.do
 *   SVC01(목록) · serviceType AA001(XML) · displayCount 최대 50
 *   키 발급: https://psis.rda.go.kr/psis/share/api/apiReqstAddForm.ps?menuId=PS00383
 *   ERR_105 = 등록하지 않은 도메인 → 신청 시 배포 도메인을 등록해야 함
 */
import { XMLParser } from "fast-xml-parser";

export const PSIS_URL = "http://psis.rda.go.kr/openApi/service.do";
export const PSIS_PAGE = 50;

/** SVC01 응답 한 줄(작물 × 병해충 × 품목) */
export interface PsisRow {
  cropName?: string;
  diseaseWeedName?: string;
  useName?: string;
  pestiKorName?: string;
  pestiBrandName?: string;
  compName?: string;
  engName?: string;
  cmpaItmNm?: string;
  indictSymbl?: string;
  applyFirstRegDate?: string;
  pestiCode?: string;
  diseaseUseSeq?: string;
  cropCd?: string;
  pestiUse?: string;
  dilutUnit?: string;
  useSuittime?: string;
  useNum?: string;
}

export function psisListUrl(apiKey: string, startPoint: number, extra: Record<string, string> = {}) {
  const u = new URL(PSIS_URL);
  u.searchParams.set("apiKey", apiKey);
  u.searchParams.set("serviceCode", "SVC01");
  u.searchParams.set("serviceType", "AA001");
  u.searchParams.set("displayCount", String(PSIS_PAGE));
  u.searchParams.set("startPoint", String(startPoint));
  for (const [k, v] of Object.entries(extra)) u.searchParams.set(k, v);
  return u;
}

/** 응답 구조 문서가 없어 pestiKorName 을 가진 객체를 깊이 우선으로 찾는다 */
function findRows(node: unknown): PsisRow[] {
  if (Array.isArray(node)) {
    if (node.some((x) => x && typeof x === "object" && "pestiKorName" in x)) return node as PsisRow[];
    for (const x of node) {
      const r = findRows(x);
      if (r.length) return r;
    }
    return [];
  }
  if (node && typeof node === "object") {
    if ("pestiKorName" in node) return [node as PsisRow];
    for (const v of Object.values(node)) {
      const r = findRows(v);
      if (r.length) return r;
    }
  }
  return [];
}

function findKey(node: unknown, key: string): unknown {
  if (!node || typeof node !== "object") return undefined;
  if (key in (node as object)) return (node as Record<string, unknown>)[key];
  for (const v of Object.values(node)) {
    const r = findKey(v, key);
    if (r !== undefined) return r;
  }
  return undefined;
}

export function parsePsisXml(xml: string): { rows: PsisRow[]; total: number | null; error: string | null } {
  const data = new XMLParser({ ignoreAttributes: true, parseTagValue: false, trimValues: true }).parse(xml);
  const err = String(findKey(data, "errorCode") ?? findKey(data, "errCode") ?? "");
  const errMsg = /ERR_\d+/.exec(xml)?.[0] || (err && err !== "0" && err !== "00" ? err : null);
  const tc = findKey(data, "totalCount");
  return { rows: findRows(data).map(cleanRow), total: tc != null && tc !== "" ? Number(tc) : null, error: errMsg };
}

const cleanRow = (r: PsisRow): PsisRow =>
  Object.fromEntries(Object.entries(r).map(([k, v]) => [k, typeof v === "string" ? v.trim() : String(v ?? "")])) as PsisRow;

/**
 * 라벨 작용기작 표시 → 비교용 코드.
 * 살충·살비제는 IRAC 번호와 같은 체계(예: 4a, 21A) → 'IRAC 21A'
 * 살균제는 한글 기호(예: 다3, 사1, 엠1) → 'KR 다3' (같은 기호끼리만 비교)
 * 혼합제는 '4a+16' 처럼 + 로 이어짐 → 배열
 */
export function parseIndict(sym: string | undefined): string[] {
  const s = String(sym || "").replace(/\s+/g, "");
  if (!s) return [];
  return s
    .split(/[+,/]/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => {
      if (/^\d+[a-zA-Z]?$/.test(p)) return "IRAC " + p.toUpperCase();
      if (/^[가-힣]+\d*[a-zA-Z]?$/.test(p)) return "KR " + p;
      return p.toUpperCase();
    });
}

/** 상표명 기준 요약 (앱이 상품명 → 성분·기작을 찾는 데 씀) */
export interface ProductInfo {
  brand: string;
  item: string; // 품목명(성분 + 제형)
  codes: string[];
  pests: string[];
  dilut?: string;
  phi?: string; // 수확 n일 전까지
  maxUses?: string;
  company?: string;
}

export function summarizeProducts(rows: PsisRow[]): Record<string, ProductInfo> {
  const out: Record<string, ProductInfo> = {};
  for (const r of rows) {
    const brand = r.pestiBrandName?.trim();
    if (!brand) continue;
    const p = (out[brand] ||= {
      brand,
      item: r.pestiKorName || "",
      codes: parseIndict(r.indictSymbl),
      pests: [],
      dilut: r.dilutUnit || undefined,
      phi: r.useSuittime || undefined,
      maxUses: r.useNum || undefined,
      company: r.compName || undefined,
    });
    if (r.diseaseWeedName && !p.pests.includes(r.diseaseWeedName)) p.pests.push(r.diseaseWeedName);
  }
  return out;
}
