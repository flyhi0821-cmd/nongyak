"use client";
import { useState } from "react";
import { recommend, type RecStatus } from "@/lib/domain/check";
import { ING_BY_ID, MOA, PESTS } from "@/lib/domain/data";
import { ingsOf, isExempt, mixesOf, PRODUCTS } from "@/lib/domain/moa";
import { pestName, todayStr } from "./helpers";
import type { AppState } from "./SprayApp";

export function RecTab({ app }: { app: AppState }) {
  const { t, L, yearRecs, settings, scope, year, orch } = app;
  const [pest, setPest] = useState<string>("mite");
  const [onlyJ, setOnlyJ] = useState(true);
  const priceOf = (id: string) => settings.prices[id] ?? ING_BY_ID[id].price;
  const { last, groups } = recommend(pest, yearRecs, { onlyJ, today: todayStr(), priceOf });
  const pn = pestName(L, pest);
  const tip = orch === "all" ? t.rec.tipPickOrchard : "";

  const stText = (s: RecStatus) => {
    switch (s.kind) {
      case "unused": return t.rec.st.unused;
      case "usable": return t.rec.st.usable(s.lastDate.slice(5));
      case "recent": return t.rec.st.recent(s.days);
      case "lowRisk": return t.rec.st.lowRisk;
      case "overused": return t.rec.st.overused(s.count);
      case "avoid": return t.rec.st.avoid;
    }
  };

  return (
    <section className="panel">
      <div className="card">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <h2>{t.rec.title}</h2>
          <div className="row">
            <label className="f" style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              {t.rec.target}
              <select value={pest} onChange={(e) => setPest(e.target.value)}>
                {PESTS.map((p) => <option key={p.id} value={p.id}>{L(p.name)}</option>)}
              </select>
            </label>
            <label className="f" style={{ flexDirection: "row", alignItems: "center", gap: 6, color: "var(--fg)" }}>
              <input type="checkbox" checked={onlyJ} onChange={(e) => setOnlyJ(e.target.checked)} />
              {t.rec.onlyJ}
            </label>
          </div>
        </div>
        <div className="alerts">
          {last ? (
            <div className={`alert ${ingsOf(last).every((i) => isExempt(i.group)) ? "ok" : "warn"}`}>
              {t.rec.last(scope, pn, last.date, last.product, ingsOf(last).map((i) => `${L(i.name)} ${i.group}`).join(" + ") || t.common.unknownIng)}
              {tip}
            </div>
          ) : (
            <div className="alert ok">{t.rec.none(year, scope, pn)}{tip}</div>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {!groups.length ? (
            <div className="alert warn">{t.rec.noCands(pn, onlyJ)}</div>
          ) : groups.map((g) => (
            <div key={g.group} className={`grp ${g.status.kind === "avoid" ? "avoid" : ""}`}>
              <div className="grp-h">
                <div className="t"><span className="code">{g.group}</span><h3>{MOA[g.group] ? L(MOA[g.group]) : ""}</h3></div>
                <span className={`pill ${g.status.lv}`}>{stText(g.status)}</span>
              </div>
              {g.ingIds.map((id) => {
                const i = ING_BY_ID[id];
                const mx = mixesOf(id);
                const prod = [
                  i.product,
                  mx.length ? `${t.rec.mix} ` + mx.map((n) => `${n}(${PRODUCTS[n].map((x) => L(ING_BY_ID[x].name)).join("+")})`).join(", ") : "",
                ].filter(Boolean).join(" · ") || t.rec.unknownProduct;
                const userPrice = settings.prices[id] != null;
                return (
                  <div key={id} className="ing">
                    <div>
                      <b>{L(i.name)}</b> <span className="code">{i.code}</span>{" "}
                      <span className={`src ${i.src}`}>{i.src === "J" ? t.src.J : t.src.U}</span>
                      <div className="note">
                        {t.rec.products}: {prod} · {t.rec.targets}: {i.targets.map((x) => pestName(L, x)).join(", ")}
                        {i.note ? " · " + L(i.note) : ""}
                      </div>
                    </div>
                    <div className="price">
                      {t.common.won(priceOf(id))}
                      <small>{i.unit} · {userPrice ? t.rec.priceUser : t.rec.priceEst}</small>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
