"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { checkRecord, levelOf, sortRecords, yearOf, type Level } from "@/lib/domain/check";
import { ING_BY_ID, PESTS } from "@/lib/domain/data";
import { PRODUCTS, resolveProduct } from "@/lib/domain/moa";
import { ORCHARDS, type SprayRecord } from "@/lib/domain/types";
import { newRecordId } from "@/lib/source";
import { IngChips, issueText, pestName, toDate, todayStr, ymd } from "./helpers";
import type { AppState } from "./SprayApp";

/** 상표명 정확히 일치 → 접두 일치(긴 이름 우선) */
function findApiProduct(products: AppState["products"], name: string) {
  const n = name.replace(/\s+/g, "");
  if (products[name.trim()]) return products[name.trim()];
  const hit = Object.keys(products).filter((k) => n.startsWith(k.replace(/\s+/g, ""))).sort((a, b) => b.length - a.length)[0];
  return hit ? products[hit] : null;
}

export function LogTab({ app, formSignal = 0 }: { app: AppState; formSignal?: number }) {
  const { t, orch, setOrch, records, year, setYear, oName } = app;
  const [date, setDate] = useState(todayStr);
  const [selDay, setSelDay] = useState(todayStr);
  const [month, setMonth] = useState(() => todayStr().slice(0, 7));
  const [view, setView] = useState<"cal" | "list">("cal");
  const formRef = useRef<HTMLFormElement>(null);
  const productRef = useRef<HTMLInputElement>(null);

  // 하단 + 버튼: 기록 입력칸으로 이동
  useEffect(() => {
    if (!formSignal) return;
    const id = setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      productRef.current?.focus({ preventScroll: true });
    }, 50);
    return () => clearTimeout(id);
  }, [formSignal]);

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (localStorage.getItem("citrus-view") === "list") setView("list");
    } catch {}
  }, []);
  const toggleView = (v: "cal" | "list") => {
    setView(v);
    try { localStorage.setItem("citrus-view", v); } catch {}
  };

  const lvOf = (r: SprayRecord) => {
    const c = checkRecord(r, records);
    return { c, lv: levelOf(c) };
  };

  const pickDay = (k: string) => {
    setSelDay(k);
    setDate(k);
    setMonth(k.slice(0, 7));
    if (yearOf(k) !== year) setYear(yearOf(k));
  };
  const shiftMonth = (n: number) => {
    const [y, m] = month.split("-").map(Number);
    const d = new Date(y, m - 1 + n, 1);
    setMonth(ymd(d.getFullYear(), d.getMonth() + 1, 1).slice(0, 7));
  };

  const on = orch !== "all";
  const mine = useMemo(() => records.filter((r) => (r.orchard || "") === orch), [records, orch]);
  const wd = t.common.weekdays;

  return (
    <section className="panel">
      <div className="card">
        <h2>{t.cal.title}</h2>
        <div className="pestpick orchpick" role="radiogroup" aria-label={t.common.orchard}>
          {ORCHARDS.map((o) => (
            <label key={o}>
              <input type="radio" name="orch" value={o} checked={orch === o} onChange={() => setOrch(o)} />
              {oName(o)}
              <span className="cnt">{t.common.count(records.filter((r) => r.orchard === o && yearOf(r.date) === year).length)}</span>
            </label>
          ))}
        </div>
        {!on ? (
          <p className="note" style={{ margin: 0 }}>{t.cal.hint}</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div className="calhead">
              <div className="row">
                <h3>
                  {view === "list"
                    ? `${year} · ${oName(orch)}`
                    : t.cal.monthTitle(+month.slice(0, 4), +month.slice(5, 7), oName(orch))}
                </h3>
                <button type="button" className="small viewtog" aria-pressed={view === "list"} onClick={() => toggleView(view === "list" ? "cal" : "list")}>
                  {view === "list" ? t.cal.calendar : t.cal.list}
                </button>
              </div>
              {view === "cal" && (
                <div className="row">
                  <button type="button" className="small" onClick={() => shiftMonth(-1)}>{t.cal.prev}</button>
                  <button type="button" className="small" onClick={() => pickDay(todayStr())}>{t.cal.today}</button>
                  <button type="button" className="small" onClick={() => shiftMonth(1)}>{t.cal.next}</button>
                </div>
              )}
            </div>

            {view === "list" ? (
              <MonthList app={app} mine={mine} lvOf={lvOf} onPick={(k) => { toggleView("cal"); pickDay(k); }} />
            ) : (
              <>
                <Calendar month={month} selDay={selDay} mine={mine} wd={wd} lvOf={lvOf} onPick={pickDay} dayAria={t.cal.dayAria} />
                <div className="legend">
                  <span className="pill ok">{t.status.ok}</span>
                  <span className="pill warn">{t.status.warn}</span>
                  <span className="pill bad">{t.status.bad}</span>
                  <span>{t.cal.legendNote}</span>
                </div>
                <DayInfo
                  app={app}
                  day={selDay}
                  list={sortRecords(mine.filter((r) => r.date === selDay))}
                  lvOf={lvOf}
                  onGo={() => {
                    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                    productRef.current?.focus({ preventScroll: true });
                  }}
                />
              </>
            )}
          </div>
        )}
        <RecordList app={app} lvOf={lvOf} onPick={(k) => on && pickDay(k)} />
      </div>

      <SprayForm app={app} formRef={formRef} productRef={productRef} date={date} setDate={(d) => { setDate(d); if (d) { setSelDay(d); setMonth(d.slice(0, 7)); } }}
        onSaved={(r) => { setYear(yearOf(r.date)); setSelDay(r.date); setMonth(r.date.slice(0, 7)); }} />
    </section>
  );
}

type LvOf = (r: SprayRecord) => { c: ReturnType<typeof checkRecord>; lv: Level };

function Calendar({ month, selDay, mine, wd, lvOf, onPick, dayAria }: {
  month: string; selDay: string; mine: SprayRecord[]; wd: string[]; lvOf: LvOf; onPick: (k: string) => void; dayAria: (d: string, n: number) => string;
}) {
  const [Y, M] = month.split("-").map(Number);
  const byDay: Record<string, SprayRecord[]> = {};
  mine.forEach((r) => (byDay[r.date] ||= []).push(r));
  const first = new Date(Y, M - 1, 1).getDay();
  const n = new Date(Y, M, 0).getDate();
  const weeks = Math.ceil((first + n) / 7);
  const td = todayStr();
  const cells = [];
  for (let k = 0; k < weeks * 7; k++) {
    const d = new Date(Y, M - 1, 1 - first + k);
    const key = ymd(d.getFullYear(), d.getMonth() + 1, d.getDate());
    const ev = sortRecords(byDay[key] || []).map((r) => ({ r, ...lvOf(r) }));
    const worst: Level = ev.some((e) => e.lv === "bad") ? "bad" : ev.some((e) => e.lv === "warn") ? "warn" : "ok";
    const cls = ["day", d.getMonth() !== M - 1 && "out", key === td && "today", key === selDay && "sel", d.getDay() === 0 && "sun"].filter(Boolean).join(" ");
    cells.push(
      <button key={key} type="button" className={cls} aria-pressed={key === selDay} aria-label={dayAria(key, ev.length)} onClick={() => onPick(key)}>
        <span className="n">{d.getDate()}</span>
        {ev.map((e) => <span key={e.r.id} className={`ev ${e.lv}`}>{e.r.product || "?"}</span>)}
        {ev.length > 0 && <span className={`dotc ${worst}`}>{ev.length}</span>}
      </button>,
    );
  }
  return (
    <div className="cal">
      {wd.map((w, i) => <div key={w} className={`dow${i === 0 ? " sun" : ""}`}>{w}</div>)}
      {cells}
    </div>
  );
}

function RecordLine({ app, r, lvOf }: { app: AppState; r: SprayRecord; lvOf: LvOf }) {
  const { t, L } = app;
  const { c, lv } = lvOf(r);
  return (
    <>
      <div className="row">
        <span className={`pill ${lv}`}>{t.status[lv]}</span>
        <b>{r.product || t.common.noProduct}</b>
        <span className="muted">{r.pests.map((p) => pestName(L, p)).join(", ")}</span>
      </div>
      <div className="note"><IngChips r={r} t={t} L={L} /></div>
      {c.map((x, i) => <div key={i} className="note" style={{ color: `var(--${x.lv})` }}>{issueText(t, L, x, r)}</div>)}
    </>
  );
}

function DayInfo({ app, day, list, lvOf, onGo }: { app: AppState; day: string; list: SprayRecord[]; lvOf: LvOf; onGo: () => void }) {
  const { t, oName, orch } = app;
  const d = toDate(day);
  return (
    <div className="dayinfo">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h3>{t.cal.dayTitle(d.getMonth() + 1, d.getDate(), t.common.weekdays[d.getDay()], oName(orch))}</h3>
        <button type="button" className="small primary" onClick={onGo}>{t.cal.recordThisDay}</button>
      </div>
      {list.length ? list.map((r) => (
        <div key={r.id} className={`dayrec ${lvOf(r).lv}`}><RecordLine app={app} r={r} lvOf={lvOf} /></div>
      )) : <p className="note" style={{ margin: 0 }}>{t.cal.emptyDay}</p>}
    </div>
  );
}

function MonthList({ app, mine, lvOf, onPick }: { app: AppState; mine: SprayRecord[]; lvOf: LvOf; onPick: (k: string) => void }) {
  const { t, year, oName, orch } = app;
  const list = sortRecords(mine.filter((r) => yearOf(r.date) === year)).reverse();
  if (!list.length) return <p className="note" style={{ margin: 0 }}>{t.cal.emptyYear(year, oName(orch))}</p>;
  const g: Record<number, SprayRecord[]> = {};
  list.forEach((r) => (g[+r.date.slice(5, 7)] ||= []).push(r));
  return (
    <div className="callist">
      {Object.keys(g).map(Number).sort((a, b) => b - a).map((m) => (
        <div key={m} className="lgroup">
          <h4>{t.cal.monthGroup(m, g[m].length)}</h4>
          {g[m].map((r) => {
            const d = toDate(r.date);
            return (
              <button key={r.id} type="button" className={`litem ${lvOf(r).lv}`} onClick={() => onPick(r.date)}>
                <span className="ld">{d.getMonth() + 1}.{d.getDate()}<small>{t.records.weekday(t.common.weekdays[d.getDay()])}</small></span>
                <span className="lb"><RecordLine app={app} r={r} lvOf={lvOf} /></span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function RecordList({ app, lvOf, onPick }: { app: AppState; lvOf: LvOf; onPick: (k: string) => void }) {
  const { t, yearRecs, year, scope, oName, ds } = app;
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState<string | null>(null);
  const list = sortRecords(yearRecs).reverse();
  return (
    <details className="recbox" open={open} onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}>
      <summary>
        <span className="rb-t">{t.records.title}</span>
        <span className="rb-sub">{year} · {scope}</span>
        <span className="pill info">{t.common.count(list.length)}</span>
        <span className="rb-act">{open ? t.records.collapse : t.records.expand}</span>
      </summary>
      <div className="records">
        {!list.length ? <p className="muted">{t.records.empty}</p> : list.map((r) => {
          const d = toDate(r.date);
          return (
            <div key={r.id} className="rec">
              <div className="date" onClick={() => onPick(r.date)}>
                {r.date.slice(5).replace("-", ".")}
                <small>{t.records.weekday(t.common.weekdays[d.getDay()])} · {oName(r.orchard)}</small>
              </div>
              <div className="body"><RecordLine app={app} r={r} lvOf={lvOf} /></div>
              <div>
                <button type="button" className="ghost small" onClick={() => {
                  if (confirm !== r.id) { setConfirm(r.id); setTimeout(() => setConfirm((c) => (c === r.id ? null : c)), 4000); return; }
                  ds.deleteRecord(r.id).catch(() => {});
                }}>
                  {confirm === r.id ? t.common.confirmDelete : t.common.delete}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </details>
  );
}

function SprayForm({ app, formRef, productRef, date, setDate, onSaved }: {
  app: AppState; formRef: React.RefObject<HTMLFormElement | null>; productRef: React.RefObject<HTMLInputElement | null>;
  date: string; setDate: (d: string) => void; onSaved: (r: SprayRecord) => void;
}) {
  const { t, L, orch, oName, records, products, ds } = app;
  const [product, setProduct] = useState("");
  const [code, setCode] = useState("");
  const [pests, setPests] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const res = product.trim() ? resolveProduct(product) : null;
  // 방제도감 seed 에 없으면 API(농약안전정보시스템) 상표명으로 찾는다
  const api = product.trim() ? findApiProduct(products, product) : null;
  const autoCode = !res && api?.codes.length ? api.codes.join("+") : "";
  const recCode = res ? "" : code.trim() || autoCode;
  const draft: SprayRecord | null = orch !== "all" && pests.length && product.trim() && date
    ? { id: "new", date, orchard: orch, pests, product: product.trim(), ...(recCode ? { code: recCode } : {}) }
    : null;
  const preview = draft ? checkRecord(draft, records) : null;

  const productOptions = useMemo(() => {
    const seed = Object.keys(PRODUCTS).map((n) => ({ n, ings: PRODUCTS[n].map((id) => L(ING_BY_ID[id].name)).join("+") }));
    const fromApi = Object.values(products).filter((p) => !PRODUCTS[p.brand]).map((p) => ({ n: p.brand, ings: p.item }));
    return [...seed, ...fromApi].sort((a, b) => a.n.localeCompare(b.n, "ko"));
  }, [L, products]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft) {
      const miss: string[] = [];
      if (orch === "all") miss.push(t.form.missingOrchard);
      if (!date) miss.push(t.form.date);
      if (!product.trim()) miss.push(t.form.product);
      if (!pests.length) miss.push(t.form.pests.split(" (")[0]);
      setMsg({ ok: false, text: t.form.missing(miss) });
      return;
    }
    const r = { ...draft, id: newRecordId() }; // created 는 addRecord 가 채움
    setBusy(true);
    try {
      // 오프라인이면 로컬 캐시에 쓰고 연결되면 올라간다. 무한 대기만 막는다.
      await Promise.race([ds.addRecord(r), new Promise((ok) => setTimeout(ok, 4000))]);
      const d = toDate(r.date);
      setMsg({ ok: true, text: t.form.saved(oName(r.orchard), d.getMonth() + 1, d.getDate()) });
      setProduct(""); setCode(""); setPests([]);
      onSaved(r);
    } catch (err) {
      setMsg({ ok: false, text: t.form.saveFailed((err as Error).message) });
    }
    setBusy(false);
  }

  return (
    <form className="card" ref={formRef} onSubmit={submit}>
      <h2>{orch !== "all" ? t.form.titleFor(oName(orch)) : t.form.title}</h2>
      <div className="grid2">
        <label className="f">{t.form.date}<input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label>
        <label className="f">{t.form.product}
          <input ref={productRef} value={product} onChange={(e) => setProduct(e.target.value)} list="productList" autoComplete="off" placeholder={t.form.productPh} />
        </label>
      </div>
      <datalist id="productList">
        {productOptions.map((o) => <option key={o.n} value={o.n}>{o.ings}</option>)}
      </datalist>
      {product.trim() && (res ? (
        <div className="alert ok">
          {res.name} → {res.ids.map((id, k) => (
            <span key={id}>{k > 0 && " + "}{L(ING_BY_ID[id].name)} <span className="code">{ING_BY_ID[id].code}</span></span>
          ))}{" "}
          {(() => { const j = res.ids.every((id) => ING_BY_ID[id].src === "J"); return <span className={`src ${j ? "J" : "U"}`}>{j ? t.src.J : t.src.U}</span>; })()}
          {api && <div className="note">{t.form.apiSafety(api.dilut || "", api.phi || "", api.maxUses || "")}</div>}
        </div>
      ) : api ? (
        <>
          <div className={`alert ${api.codes.length ? "ok" : "warn"}`}>
            {t.form.apiFound(api.brand, api.item, api.codes.map((c) => c.replace(/^(IRAC|KR) /, "")).join("+"))}
            <div className="note">{t.form.apiSafety(api.dilut || "", api.phi || "", api.maxUses || "")}</div>
          </div>
          {!api.codes.length && <label className="f">{t.form.codeLabel}<input value={code} onChange={(e) => setCode(e.target.value)} placeholder={t.form.codePh} /></label>}
        </>
      ) : (
        <>
          <div className="alert warn">{t.form.unknownProduct(product.trim())}</div>
          <label className="f">{t.form.codeLabel}<input value={code} onChange={(e) => setCode(e.target.value)} placeholder={t.form.codePh} /></label>
        </>
      ))}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span className="note">{t.form.pests}</span>
        <div className="pestpick">
          {PESTS.map((p) => (
            <label key={p.id}>
              <input type="checkbox" checked={pests.includes(p.id)} onChange={(e) => setPests((s) => (e.target.checked ? [...s, p.id] : s.filter((x) => x !== p.id)))} />
              {L(p.name)}
            </label>
          ))}
        </div>
      </div>
      {preview && (
        <div className="alerts">
          {preview.length ? (
            <>
              <div className="note">{t.form.previewHead(oName(orch))}</div>
              {preview.map((x, i) => <div key={i} className={`alert ${x.lv}`}>{issueText(t, L, x, draft!)}</div>)}
            </>
          ) : <div className="alert ok">{t.form.previewOk(oName(orch))}</div>}
        </div>
      )}
      <div className="row">
        <button className="primary" type="submit" disabled={busy}>{t.form.saveBtn}</button>
        {msg && <span className="status" style={{ color: msg.ok ? "var(--ok)" : "var(--bad)", fontWeight: 600 }}>{msg.text}</span>}
      </div>
    </form>
  );
}
