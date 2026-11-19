"use client";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { LangSwitch } from "@/components/LangSwitch";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useI18n } from "@/i18n/I18nProvider";
import { checkRecord, levelOf, yearOf } from "@/lib/domain/check";
import { ingsOf, isExempt } from "@/lib/domain/moa";
import { ORCHARDS, type SprayRecord, type UserSettings } from "@/lib/domain/types";
import { firebaseSource } from "@/lib/firebase/store";
import { localSource, resetDemo } from "@/lib/localSource";
import type { ProductInfo } from "@/lib/psis";
import type { DataSource } from "@/lib/source";
import type { Dict } from "@/i18n";
import { CheckTab } from "./CheckTab";
import type { L } from "./helpers";
import { LogTab } from "./LogTab";
import { RecTab } from "./RecTab";
import { SettingsTab } from "./SettingsTab";

export interface AppState {
  ds: DataSource;
  t: Dict;
  L: L;
  records: SprayRecord[];
  settings: UserSettings;
  /** API 동기화로 받은 감귤 상품(상표명 → 정보) */
  products: Record<string, ProductInfo>;
  orch: string; // 'all' | '1'..'6'
  setOrch: (o: string) => void;
  year: number;
  setYear: (y: number) => void;
  oName: (o: string) => string;
  /** 선택 연도 전체 과원 */
  yearAll: SprayRecord[];
  /** 선택 연도 + 선택 과원 */
  yearRecs: SprayRecord[];
  scope: string;
}

type Tab = "log" | "check" | "rec" | "settings";
const DEMO_KEY = "citrus-demo-on";

function Header({ children, onExitDemo }: { children?: React.ReactNode; onExitDemo?: () => void }) {
  const { t } = useI18n();
  const { user, signOut } = useAuth();
  const [a, b, c] = t.appTitleParts;
  return (
    <>
      <div className="topbar">
        <LangSwitch />
        <ThemeToggle />
        {user ? (
          <span className="user">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {user.photoURL && <img src={user.photoURL} alt="" referrerPolicy="no-referrer" />}
            <span>{user.displayName || user.email}</span>
            <button type="button" className="small ghost" onClick={signOut}>{t.auth.signOut}</button>
          </span>
        ) : onExitDemo ? (
          <button type="button" className="small ghost" onClick={onExitDemo}>{t.demo.exit}</button>
        ) : null}
      </div>
      <header>
        <div>
          <h1>{a}<span>{b}</span>{c}</h1>
          <p className="sub">{t.appSub}</p>
        </div>
        {children}
      </header>
    </>
  );
}

function Landing({ onDemo }: { onDemo: () => void }) {
  const { t } = useI18n();
  const { signIn, configured, loading } = useAuth();
  const [err, setErr] = useState("");
  return (
    <div className="wrap">
      <Header />
      <section className="card hero">
        <h2>{t.auth.heroTitle}</h2>
        <p style={{ margin: 0 }}>{t.auth.heroBody}</p>
        <ul>{t.auth.heroPoints.map((p) => <li key={p}>{p}</li>)}</ul>
        {!configured && <div className="alert warn">{t.auth.notConfigured}</div>}
        <div className="row">
          {configured && (
            <button type="button" className="primary gbtn" disabled={loading} onClick={() => signIn().catch((e: Error) => setErr(e.message))}>
              <GoogleMark /> {loading ? t.common.loading : t.auth.signIn}
            </button>
          )}
          <button type="button" className={configured ? "gbtn" : "primary gbtn"} onClick={onDemo}>{t.demo.start}</button>
        </div>
        <p className="note" style={{ margin: 0 }}>{t.demo.note}</p>
        {err && <div className="alert bad">{t.auth.error(err)}</div>}
      </section>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.2-.1-2.3-.4-3.5z" />
    </svg>
  );
}

export function SprayApp() {
  const { user, loading } = useAuth();
  const [demo, setDemo] = useState(false);
  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (localStorage.getItem(DEMO_KEY) === "1") setDemo(true);
    } catch {}
  }, []);
  const ds = useMemo<DataSource | null>(() => (user ? firebaseSource(user.uid) : demo ? localSource() : null), [user, demo]);

  if (loading) return <div className="wrap"><Header /><p className="muted">…</p></div>;
  if (!ds) {
    return <Landing onDemo={() => { try { localStorage.setItem(DEMO_KEY, "1"); } catch {} setDemo(true); }} />;
  }
  const exitDemo = () => { try { localStorage.removeItem(DEMO_KEY); } catch {} setDemo(false); };
  return <Workspace key={ds.kind + (user?.uid || "")} ds={ds} onExitDemo={user ? undefined : exitDemo} />;
}

function Workspace({ ds, onExitDemo }: { ds: DataSource; onExitDemo?: () => void }) {
  const { t, L } = useI18n();
  const [records, setRecords] = useState<SprayRecord[]>([]);
  const [settings, setSettings] = useState<UserSettings>({ prices: {}, orchardNames: {} });
  const [products, setProducts] = useState<Record<string, ProductInfo>>({});
  const [loaded, setLoaded] = useState(false);
  const [err, setErr] = useState("");
  const [tab, setTab] = useState<Tab>("log");
  const [orch, setOrchState] = useState("1");
  const [year, setYear] = useState(() => new Date().getFullYear());

  useEffect(() => {
    try {
      const o = localStorage.getItem("citrus-last-orch");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (o) setOrchState(o);
    } catch {}
  }, []);

  useEffect(() => {
    const onErr = (e: Error) => setErr(e.message);
    const u1 = ds.watchRecords((r) => { setRecords(r); setLoaded(true); }, onErr);
    const u2 = ds.watchSettings(setSettings, onErr);
    ds.loadProducts().then((list) => setProducts(Object.fromEntries(list.map((p) => [p.brand, p]))));
    return () => { u1(); u2(); };
  }, [ds]);

  const setOrch = (o: string) => {
    setOrchState(o);
    try { if (o !== "all") localStorage.setItem("citrus-last-orch", o); } catch {}
  };

  const app: AppState = useMemo(() => {
    const oName = (o: string) => (o ? settings.orchardNames[o] || t.common.orchardName(o) : t.common.orchardNone);
    const yearAll = records.filter((r) => yearOf(r.date) === year);
    const yearRecs = yearAll.filter((r) => orch === "all" || (r.orchard || "") === orch);
    return {
      ds, t, L, records, settings, products, orch, setOrch, year, setYear, oName, yearAll, yearRecs,
      scope: orch === "all" ? t.common.allOrchards : oName(orch),
    };
  }, [ds, t, L, records, settings, products, orch, year]);

  const years = useMemo(() => {
    const ys = new Set([new Date().getFullYear(), ...records.map((r) => yearOf(r.date))]);
    return [...ys].sort((a, b) => b - a);
  }, [records]);

  const stats = useMemo(() => {
    let bad = 0, warn = 0;
    const groups = new Set<string>();
    for (const r of app.yearRecs) {
      const lv = levelOf(checkRecord(r, app.yearAll));
      if (lv === "bad") bad++; else if (lv === "warn") warn++;
      ingsOf(r).forEach((i) => { if (!isExempt(i.group)) groups.add(i.group); });
    }
    return { bad, warn, groups: groups.size };
  }, [app]);

  const tabs: Tab[] = ["log", "check", "rec", "settings"];

  return (
    <div className="wrap">
      <Header onExitDemo={onExitDemo}>
        <div className="yearsel">
          <label htmlFor="orch">{t.common.orchard}</label>
          <select id="orch" value={orch} onChange={(e) => setOrch(e.target.value)}>
            <option value="all">{t.common.all}</option>
            {ORCHARDS.map((o) => <option key={o} value={o}>{app.oName(o)}</option>)}
          </select>
          <label htmlFor="year">{t.common.year}</label>
          <select id="year" value={year} onChange={(e) => setYear(+e.target.value)}>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </Header>

      {ds.kind === "local" && (
        <div className="banner">
          <span>{t.demo.banner}</span>
          <button type="button" className="small ghost" onClick={() => { resetDemo(); location.reload(); }}>{t.demo.reset}</button>
        </div>
      )}
      {err && <div className="alert bad">{err}</div>}

      <div className="summary">
        <div className="stat"><b>{app.yearRecs.length}</b><small>{t.summary.sprays(year, app.scope)}</small></div>
        <div className="stat"><b>{stats.groups}</b><small>{t.summary.groups}</small></div>
        <div className={`stat ${stats.bad ? "bad" : ""}`}><b>{stats.bad}</b><small>{t.summary.bad}</small></div>
        <div className={`stat ${stats.warn ? "warn" : ""}`}><b>{stats.warn}</b><small>{t.summary.warn}</small></div>
      </div>

      <nav role="tablist">
        {tabs.map((k) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}>{t.tabs[k]}</button>
        ))}
      </nav>

      {!loaded ? (
        <p className="muted">{t.common.loading}</p>
      ) : tab === "log" ? (
        <LogTab app={app} />
      ) : tab === "check" ? (
        <CheckTab app={app} />
      ) : tab === "rec" ? (
        <RecTab app={app} />
      ) : (
        <SettingsTab app={app} />
      )}
    </div>
  );
}
