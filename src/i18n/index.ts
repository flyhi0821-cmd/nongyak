import { LOCALES, type Locale } from "@/lib/domain/types";
import en from "./en";
import ko, { type Dict } from "./ko";

export const DICTS: Record<Locale, Dict> = { ko, en };
export const DEFAULT_LOCALE: Locale = "ko";
export const hasLocale = (l: string): l is Locale => (LOCALES as readonly string[]).includes(l);
export { LOCALES, type Locale, type Dict };
