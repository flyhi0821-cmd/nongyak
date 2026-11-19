export const LOCALES = ["ko", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export type Localized = Record<Locale, string>;

export interface SprayRecord {
  id: string;
  /** YYYY-MM-DD */
  date: string;
  /** 과원 번호 '1'~'6' */
  orchard: string;
  pests: string[];
  product: string;
  /** 목록에 없는 상품일 때 라벨의 작용기작 표시 (예: 21A) */
  code?: string;
  created?: number;
}

export interface UserSettings {
  /** 성분 id → 사용자가 입력한 가격(원) */
  prices: Record<string, number>;
  /** 과원 번호 → 이름 */
  orchardNames: Record<string, string>;
}

export const ORCHARDS = ["1", "2", "3", "4", "5", "6"] as const;
