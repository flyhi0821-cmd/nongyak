import { INGREDIENTS } from "./data";
import { groupOf, ingsOf, isExempt } from "./moa";
import type { SprayRecord } from "./types";

export const WINDOW_DAYS = 30;
export const MAX_PER_YEAR = 2;

export type Level = "ok" | "warn" | "bad";

/** 문구는 화면에서 언어별로 만든다. 여기서는 사실만 돌려준다. */
export type Issue =
  | { kind: "unknown"; lv: "warn"; pest: string; product: string }
  | { kind: "consecutive"; lv: "bad"; pest: string; group: string; ingId: string; prevDate: string; prevProduct: string }
  | { kind: "recent"; lv: "warn"; pest: string; group: string; days: number; prevProduct: string }
  | { kind: "yearCount"; lv: "warn"; pest: string; group: string; count: number }
  | { kind: "sameIngredient"; lv: "warn"; pest: string; ingId: string; count: number };

export const yearOf = (d: string) => +d.slice(0, 4);

export function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(b) - Date.parse(a)) / 864e5);
}

export function sortRecords(list: SprayRecord[]): SprayRecord[] {
  return [...list].sort((a, b) =>
    a.date < b.date ? -1 : a.date > b.date ? 1 : (a.created || 0) - (b.created || 0),
  );
}

/** 같은 과원 · 같은 해 · 같은 대상 기준으로 r 이전 살포와 비교 */
export function checkRecord(r: SprayRecord, list: SprayRecord[]): Issue[] {
  const out: Issue[] = [];
  const all = sortRecords(list).filter(
    (x) => yearOf(x.date) === yearOf(r.date) && (x.orchard || "") === (r.orchard || ""),
  );
  const idx = all.findIndex((x) => x.id === r.id);
  const prior = idx >= 0 ? all.slice(0, idx) : all.filter((x) => x.date <= r.date);
  const rIngs = ingsOf(r);
  if (!rIngs.length) return [{ kind: "unknown", lv: "warn", pest: r.pests[0], product: r.product }];

  for (const p of r.pests) {
    const prev = prior.filter((x) => x.pests.includes(p));
    const last = prev[prev.length - 1];
    for (const ri of rIngs) {
      if (isExempt(ri.group)) continue;
      if (last && ingsOf(last).some((i) => i.group === ri.group)) {
        out.push({ kind: "consecutive", lv: "bad", pest: p, group: ri.group, ingId: ri.id, prevDate: last.date, prevProduct: last.product || "" });
      } else {
        const near = prev.filter(
          (x) => daysBetween(x.date, r.date) <= WINDOW_DAYS && ingsOf(x).some((i) => i.group === ri.group),
        );
        if (near.length) {
          const n = near[near.length - 1];
          out.push({ kind: "recent", lv: "warn", pest: p, group: ri.group, days: daysBetween(n.date, r.date), prevProduct: n.product || "" });
        }
      }
      const cnt = prev.filter((x) => ingsOf(x).some((i) => i.group === ri.group)).length + 1;
      if (cnt > MAX_PER_YEAR) out.push({ kind: "yearCount", lv: "warn", pest: p, group: ri.group, count: cnt });
      const same = prev.filter((x) => ingsOf(x).some((i) => i.id === ri.id));
      if (same.length) out.push({ kind: "sameIngredient", lv: "warn", pest: p, ingId: ri.id, count: same.length + 1 });
    }
  }
  return out;
}

export function levelOf(issues: Issue[]): Level {
  return issues.some((x) => x.lv === "bad") ? "bad" : issues.length ? "warn" : "ok";
}

/* ---------- 추천 ---------- */
export type RecStatus =
  | { kind: "unused"; lv: "ok"; rank: 0 }
  | { kind: "usable"; lv: "ok"; rank: 1; lastDate: string }
  | { kind: "recent"; lv: "warn"; rank: 2; days: number }
  | { kind: "lowRisk"; lv: "info"; rank: 3 }
  | { kind: "overused"; lv: "warn"; rank: 4; count: number }
  | { kind: "avoid"; lv: "bad"; rank: 5 };

export interface RecGroup {
  group: string;
  ingIds: string[];
  status: RecStatus;
  minPrice: number;
}

/**
 * pest 대상 다음 살포 후보를 작용기작 그룹별로 묶어 우선순위대로 돌려준다.
 * list: 이미 과원·연도로 거른 기록
 */
export function recommend(
  pest: string,
  list: SprayRecord[],
  opts: { onlyJ: boolean; today: string; priceOf: (id: string) => number },
): { last: SprayRecord | undefined; groups: RecGroup[] } {
  const mine = sortRecords(list.filter((r) => r.pests.includes(pest)));
  const last = mine[mine.length - 1];
  const lastGroups = last ? ingsOf(last).map((i) => i.group) : [];
  const cands = INGREDIENTS.filter((i) => i.targets.includes(pest as never) && (!opts.onlyJ || i.src === "J"));
  const byGroup: Record<string, string[]> = {};
  for (const i of cands) (byGroup[groupOf(i.code)] ||= []).push(i.id);

  const groups = Object.entries(byGroup).map(([g, ingIds]): RecGroup => {
    const used = mine.filter((r) => ingsOf(r).some((i) => i.group === g));
    const lastUse = used[used.length - 1];
    let status: RecStatus;
    if (isExempt(g)) status = { kind: "lowRisk", lv: "info", rank: 3 };
    else if (lastGroups.includes(g)) status = { kind: "avoid", lv: "bad", rank: 5 };
    else if (!used.length) status = { kind: "unused", lv: "ok", rank: 0 };
    else if (used.length >= MAX_PER_YEAR) status = { kind: "overused", lv: "warn", rank: 4, count: used.length };
    else if (daysBetween(lastUse.date, opts.today) <= WINDOW_DAYS)
      status = { kind: "recent", lv: "warn", rank: 2, days: daysBetween(lastUse.date, opts.today) };
    else status = { kind: "usable", lv: "ok", rank: 1, lastDate: lastUse.date };
    return { group: g, ingIds, status, minPrice: Math.min(...ingIds.map(opts.priceOf)) };
  });
  groups.sort((a, b) => a.status.rank - b.status.rank || a.minPrice - b.minPrice);
  return { last, groups };
}
