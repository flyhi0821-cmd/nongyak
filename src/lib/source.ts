"use client";
/**
 * 데이터 저장소 추상화.
 *  - firebaseSource: 로그인 사용자, Firestore
 *  - localSource: 체험 모드, 이 브라우저 localStorage (예시 기록으로 시작)
 */
import type { ProductInfo } from "./psis";
import type { SprayRecord, UserSettings } from "./domain/types";

export type Unsub = () => void;

export interface DataSource {
  kind: "firebase" | "local";
  watchRecords(cb: (r: SprayRecord[]) => void, onErr: (e: Error) => void): Unsub;
  watchSettings(cb: (s: UserSettings) => void, onErr: (e: Error) => void): Unsub;
  addRecord(r: SprayRecord): Promise<void>;
  deleteRecord(id: string): Promise<void>;
  /** 넘긴 필드는 통째로 교체 */
  saveSettings(patch: Partial<UserSettings>): Promise<void>;
  /** 이전 HTML 수첩 백업 가져오기, 새로 들어간 기록 수 */
  importBackup(json: string): Promise<number>;
  /** API 동기화로 만든 감귤 상품 요약. 없으면 빈 배열 */
  loadProducts(): Promise<ProductInfo[]>;
}

export const newRecordId = () => "r" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

export function cleanRecord(r: SprayRecord): SprayRecord {
  const c: SprayRecord = {
    id: r.id,
    date: r.date,
    orchard: r.orchard || "",
    pests: r.pests,
    product: r.product || "",
    created: r.created ?? Date.now(),
  };
  if (r.code) c.code = r.code;
  return c;
}

type Legacy = { records?: SprayRecord[]; prices?: Record<string, number>; onames?: Record<string, string> };

export function parseLegacy(json: string, existing: SprayRecord[]) {
  const d = JSON.parse(json) as Legacy;
  const have = new Set(existing.map((r) => r.id));
  const fresh = (d.records || [])
    .filter((r) => r && r.id && /^\d{4}-\d{2}-\d{2}$/.test(r.date) && Array.isArray(r.pests) && !have.has(r.id))
    .map(cleanRecord);
  return { fresh, prices: d.prices || {}, names: d.onames || {} };
}
