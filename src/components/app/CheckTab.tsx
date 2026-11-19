"use client";
import { Fragment } from "react";
import { checkRecord, levelOf, sortRecords } from "@/lib/domain/check";
import { PESTS } from "@/lib/domain/data";
import { ingsOf, shortCode } from "@/lib/domain/moa";
import { ORCHARDS } from "@/lib/domain/types";
import { issueText } from "./helpers";
import type { AppState } from "./SprayApp";

export function CheckTab({ app }: { app: AppState }) {
  const { t, L, yearAll, yearRecs, orch, oName } = app;
  const list = sortRecords(yearRecs);
  const os = orch === "all" ? [...ORCHARDS, ""] : [orch];
  const rows = os.flatMap((o) =>
    PESTS.map((p) => ({ o, p, seq: list.filter((r) => (r.orchard || "") === o && r.pests.includes(p.id)) })).filter((x) => x.seq.length),
  );
  const issues = list.flatMap((r) => checkRecord(r, yearAll).map((x) => ({ x, r })));

  return (
    <section className="panel">
      <div className="card">
        <h2>{t.check.title}</h2>
        <p className="note">{t.check.note}</p>
        <div className="timeline">
          <div className="tl">
            {!rows.length ? (
              <p className="muted" style={{ gridColumn: "1/-1" }}>{t.check.empty}</p>
            ) : rows.map(({ o, p, seq }) => (
              <Fragment key={o + p.id}>
                <div><b>{L(p.name)}</b><div className="note">{oName(o)}</div></div>
                <div className="seq">
                  {seq.map((r, i) => {
                    const lv = levelOf(checkRecord(r, yearAll).filter((x) => x.pest === p.id));
                    const codes = ingsOf(r).map((g) => shortCode(g.group || "?")).join("+") || "?";
                    return (
                      <Fragment key={r.id}>
                        {i > 0 && <span className="muted">→</span>}
                        <span className={`dot ${lv === "ok" ? "" : lv}`} title={`${r.date} ${r.product}`}>
                          {r.date.slice(5).replace("-", "/")} {r.product} {codes}
                        </span>
                      </Fragment>
                    );
                  })}
                </div>
              </Fragment>
            ))}
          </div>
        </div>
      </div>
      <div className="card">
        <h2>{t.check.resultTitle}</h2>
        <div className="alerts">
          {rows.length > 0 && !issues.length && <div className="alert ok">{t.check.allOk}</div>}
          {issues.map(({ x, r }, i) => (
            <div key={i} className={`alert ${x.lv}`}>
              <b>{r.date} · {oName(r.orchard)}</b> · {issueText(t, L, x, r)}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
