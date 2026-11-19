"use client";
import { useEffect, useRef, useState } from "react";
import { INGREDIENTS } from "@/lib/domain/data";
import { mixesOf } from "@/lib/domain/moa";
import { ORCHARDS } from "@/lib/domain/types";
import { pestName } from "./helpers";
import type { AppState } from "./SprayApp";

const PSIS = "https://psis.rda.go.kr/psis/agc/res/agchmRegistStusLst.ps?menuId=PS00263";

/** 입력이 멈추고 0.7초 뒤 저장 */
function useDebouncedSave() {
  const tm = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(tm.current), []);
  return (fn: () => Promise<void>) => {
    clearTimeout(tm.current);
    tm.current = setTimeout(fn, 700);
  };
}

export function SettingsTab({ app }: { app: AppState }) {
  const { t, L, settings, ds, records } = app;
  const [prices, setPrices] = useState(settings.prices);
  const [names, setNames] = useState(settings.orchardNames);
  const [priceMsg, setPriceMsg] = useState("");
  const [nameMsg, setNameMsg] = useState("");
  const [backup, setBackup] = useState("");
  const [backupMsg, setBackupMsg] = useState("");
  const savePrices = useDebouncedSave();
  const saveNames = useDebouncedSave();

  return (
    <section className="panel">
      <div className="card">
        <h2>{t.settings.priceTitle}</h2>
        <p className="note">{t.settings.priceNote}</p>
        <div className="tablewrap">
          <table>
            <thead><tr>{t.settings.cols.map((c) => <th key={c}>{c}</th>)}</tr></thead>
            <tbody>
              {INGREDIENTS.map((i) => {
                const mx = mixesOf(i.id);
                return (
                  <tr key={i.id}>
                    <td><b>{L(i.name)}</b></td>
                    <td><span className="code">{i.code}</span></td>
                    <td>{[i.product, mx.length ? `${t.settings.mixPrefix}: ${mx.join("·")}` : ""].filter(Boolean).join(" / ") || "—"}</td>
                    <td><span className={`src ${i.src}`}>{i.src === "J" ? t.src.Jshort : t.src.Ushort}</span></td>
                    <td className="note">{i.targets.map((x) => pestName(L, x)).join(", ")}</td>
                    <td>{i.unit}</td>
                    <td>
                      <input
                        type="number" min={0} step={500} placeholder={String(i.price)} aria-label={`${L(i.name)} ${t.settings.cols[6]}`}
                        value={prices[i.id] ?? ""}
                        onChange={(e) => {
                          const next = { ...prices };
                          if (e.target.value === "") delete next[i.id];
                          else if (+e.target.value >= 0) next[i.id] = +e.target.value;
                          setPrices(next);
                          // merge:true 는 map 안 키 삭제를 반영하지 않으므로 전체를 덮어쓴다
                          savePrices(async () => {
                            await ds.saveSettings({ prices: next, orchardNames: names });
                            setPriceMsg(t.settings.pricesSaved);
                          });
                        }}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="row">
          <button type="button" className="ghost small" onClick={async () => {
            setPrices({});
            await ds.saveSettings({ prices: {}, orchardNames: names });
            setPriceMsg(t.settings.pricesReset);
          }}>{t.settings.resetPrices}</button>
          <span className="status">{priceMsg}</span>
        </div>
      </div>

      <div className="card">
        <h2>{t.settings.sourcesTitle}</h2>
        <ul className="note" style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 6 }}>
          {t.settings.sources.map((s) => <li key={s}>{s}</li>)}
          <li><a href={PSIS} target="_blank" rel="noopener noreferrer">{t.settings.psisLink}</a></li>
        </ul>
      </div>

      <div className="card">
        <h2>{t.settings.orchardTitle}</h2>
        <p className="note">{t.settings.orchardNote}</p>
        <div className="grid2">
          {ORCHARDS.map((o) => (
            <label key={o} className="f">{t.settings.orchardLabel(o)}
              <input value={names[o] ?? ""} placeholder={t.common.orchardName(o)} onChange={(e) => {
                const next = { ...names };
                const v = e.target.value;
                if (v.trim()) next[o] = v; else delete next[o];
                setNames(next);
                saveNames(async () => {
                  const clean = Object.fromEntries(Object.entries(next).map(([k, x]) => [k, x.trim()]));
                  await ds.saveSettings({ prices, orchardNames: clean });
                  setNameMsg(t.settings.orchardSaved);
                });
              }} />
            </label>
          ))}
        </div>
        <span className="status">{nameMsg}</span>
      </div>

      <div className="card">
        <details>
          <summary>{t.settings.importTitle}</summary>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
            <p className="note" style={{ margin: 0 }}>{t.settings.importNote}</p>
            <textarea rows={6} value={backup} onChange={(e) => setBackup(e.target.value)} aria-label={t.settings.importTitle} />
            <div className="row">
              <button type="button" className="small" onClick={async () => {
                try {
                  const n = await ds.importBackup(backup);
                  setBackupMsg(t.settings.imported(n));
                } catch { setBackupMsg(t.settings.importBad); }
              }}>{t.settings.importBtn}</button>
              <button type="button" className="small" onClick={async () => {
                const text = JSON.stringify({ records, prices, onames: names });
                setBackup(text);
                try { await navigator.clipboard.writeText(text); setBackupMsg(t.settings.copied); } catch {}
              }}>{t.settings.exportBtn}</button>
              <span className="status">{backupMsg}</span>
            </div>
          </div>
        </details>
      </div>
    </section>
  );
}
