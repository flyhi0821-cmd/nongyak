"use client";
import { checkRecord, levelOf, sortRecords, type Level } from "@/lib/domain/check";
import { ingsOf, isExempt } from "@/lib/domain/moa";
import { ORCHARDS } from "@/lib/domain/types";
import { pestName, toDate } from "./helpers";
import type { AppState } from "./SprayApp";

/** 홈: 과원 원형 칩 → 과원 카드 → 최근 살포 */
export function HomeTab({ app, onOpenOrchard }: { app: AppState; onOpenOrchard: (o: string) => void }) {
  const { t, L, yearAll, oName, orch, setOrch, records } = app;
  const md = (d: string) => `${+d.slice(5, 7)}/${+d.slice(8, 10)}`;
  const shown = orch === "all" ? [...ORCHARDS] : [orch];

  const cards = shown.map((o) => {
    const list = sortRecords(yearAll.filter((r) => r.orchard === o));
    const last = list[list.length - 1];
    const lvs = list.map((r) => levelOf(checkRecord(r, records)));
    const lv: Level = lvs.includes("bad") ? "bad" : lvs.includes("warn") ? "warn" : "ok";
    const groups = new Set(list.flatMap((r) => ingsOf(r).map((i) => i.group)).filter((g) => !isExempt(g)));
    return { o, list, last, lv, groups: groups.size };
  });

  const recent = sortRecords(orch === "all" ? yearAll : yearAll.filter((r) => r.orchard === orch)).reverse().slice(0, 6);

  return (
    <section className="panel">
      <div className="sechead">
        <h2>{t.home.myOrchards}</h2>
        {orch !== "all" && <button type="button" className="link" onClick={() => setOrch("all")}>{t.home.seeAll}</button>}
      </div>
      <div className="cats" role="group" aria-label={t.home.myOrchards}>
        <button type="button" className="cat" aria-pressed={orch === "all"} onClick={() => setOrch("all")}>
          <i>🌿</i><span>{t.home.allShort}</span>
        </button>
        {ORCHARDS.map((o) => (
          <button key={o} type="button" className="cat" aria-pressed={orch === o} onClick={() => setOrch(o)}>
            <i>🍊</i><span>{oName(o)}</span>
          </button>
        ))}
      </div>

      <div className="fieldlist">
        {cards.map(({ o, list, last, lv, groups }) => (
          <button key={o} type="button" className="field" onClick={() => onOpenOrchard(o)}>
            <span className={`thumb ${list.length ? lv : "empty"}`} aria-hidden="true" />
            <span className="fb">
              <h3>{oName(o)}</h3>
              <span className="row" style={{ gap: 6 }}>
                {list.length > 0 && <span className={`pill ${lv}`}>{t.status[lv]}</span>}
                <span className="pill blue">{t.home.sprays(list.length)}</span>
                {groups > 0 && <span className="pill line">{t.home.groups(groups)}</span>}
              </span>
              <span className="meta">{last ? t.home.last(md(last.date), last.product) : t.home.none}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="sechead" style={{ marginTop: 6 }}>
        <h2>{t.home.recent}</h2>
      </div>
      {!recent.length ? (
        <div className="card empty-state">{t.home.noRecent}</div>
      ) : (
        <div className="acts">
          {recent.map((r) => {
            const lv = levelOf(checkRecord(r, records));
            const d = toDate(r.date);
            return (
              <button key={r.id} type="button" className="act" onClick={() => onOpenOrchard(r.orchard)}>
                <span className={`ic ${lv === "ok" ? "" : lv}`} aria-hidden="true">{lv === "bad" ? "⚠️" : lv === "warn" ? "🔶" : "💧"}</span>
                <span className="ab">
                  <small>{md(r.date)} ({t.common.weekdays[d.getDay()]}) · {oName(r.orchard)}</small>
                  <b>{r.product || t.common.noProduct}</b>
                  <small>{r.pests.map((p) => pestName(L, p)).join(", ")}</small>
                </span>
                <span className={`pill ${lv}`}>{t.status[lv]}</span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
