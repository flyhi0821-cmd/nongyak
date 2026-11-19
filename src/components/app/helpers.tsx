"use client";
import { MAX_PER_YEAR, type Issue, type Level } from "@/lib/domain/check";
import { ING_BY_ID, PEST_BY_ID, type PestId } from "@/lib/domain/data";
import { ingsOf } from "@/lib/domain/moa";
import type { Localized, SprayRecord } from "@/lib/domain/types";
import type { Dict } from "@/i18n";

export type L = (x: Localized) => string;

export const pestName = (L: L, id: string) => (PEST_BY_ID[id as PestId] ? L(PEST_BY_ID[id as PestId].name) : id);

export function ingName(L: L, id: string, r?: SprayRecord) {
  if (ING_BY_ID[id]) return L(ING_BY_ID[id].name);
  if (r) return ingsOf(r).find((i) => i.id === id)?.name ? L(ingsOf(r).find((i) => i.id === id)!.name) : id;
  return id;
}

export function issueText(t: Dict, L: L, x: Issue, r?: SprayRecord): string {
  const p = pestName(L, x.pest);
  switch (x.kind) {
    case "unknown":
      return t.issue.unknown(x.product);
    case "consecutive":
      return t.issue.consecutive(p, x.prevDate, x.prevProduct, x.group, ingName(L, x.ingId, r));
    case "recent":
      return t.issue.recent(p, x.days, x.prevProduct, x.group);
    case "yearCount":
      return t.issue.yearCount(p, x.group, x.count, MAX_PER_YEAR);
    case "sameIngredient":
      return t.issue.sameIngredient(p, ingName(L, x.ingId, r), x.count);
  }
}

export const statusLabel = (t: Dict, lv: Level) => t.status[lv];

export function IngChips({ r, t, L }: { r: SprayRecord; t: Dict; L: L }) {
  const ii = ingsOf(r);
  if (!ii.length) return <span className="pill warn">{t.common.unknownIng}</span>;
  return (
    <>
      {ii.map((i, k) => (
        <span key={i.id}>
          {k > 0 && " + "}
          {L(i.name)} <span className="code">{i.code || t.common.noCode}</span>
        </span>
      ))}
    </>
  );
}

export const pad = (n: number) => String(n).padStart(2, "0");
export const ymd = (y: number, m: number, d: number) => `${y}-${pad(m)}-${pad(d)}`;
export const todayStr = () => {
  const d = new Date();
  return ymd(d.getFullYear(), d.getMonth() + 1, d.getDate());
};
export const toDate = (k: string) => {
  const [y, m, d] = k.split("-").map(Number);
  return new Date(y, m - 1, d);
};
