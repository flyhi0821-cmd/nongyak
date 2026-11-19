"use client";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { IcAlert, IcCalendar, IcGear, IcHome, IcLayers, IcPin, IcPlus, IcShield, IcSpark } from "@/components/Icons";
import { LangButton, LangSwitch } from "@/components/LangSwitch";
import { ThemeCycleButton, ThemeToggle } from "@/components/ThemeToggle";
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
import { HomeTab } from "./HomeTab";
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

type Tab = "home" | "log" | "check" | "rec" | "settings";
const DEMO_KEY = "citrus-demo-on";

function GoogleMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.2-.1-2.3-.4-3.5z" />
    </svg>
  );
}

function Landing({ onDemo }: { onDemo: () => void }) {
  const { t } = useI18n();
  const { signIn, configured, loading } = useAuth();
  const [err, setErr] = useState("");
  const [a, b, c] = t.appTitleParts;
  const feats: [string, string, string][] = [
    ["🗓️", t.tabs.log, t.cal.hint],
    ["🛡️", t.tabs.check, t.check.note],
    ["✨", t.tabs.rec, t.rec.title],
  ];
  return (
    <div className="landing">
      <div className="hero">
        <div className="hero-top">
          <div className="brand">{a}<span>{b}</span>{c}</div>
          <div className="iconrow"><LangButton /><ThemeCycleButton /></div>
        </div>
        <div className="glass pitch">
          <h2>{t.auth.heroTitle}</h2>
          <p>{t.auth.heroBody}</p>
        </div>
      </div>
      <div className="sheet">
        {feats.map(([ic, title, body]) => (
          <div key={title} className="feature">
            <span className="ic" aria-hidden="true">{ic}</span>
            <span><b>{title}</b><small>{body}</small></span>
          </div>
        ))}
        {!configured && <div className="alert warn">{t.auth.notConfigured}</div>}
        <div className="cta">
          {configured && (
            <button type="button" className="primary gbtn" disabled={loading} onClick={() => signIn().catch((e: Error) => setErr(e.message))}>
              <GoogleMark /> {loading ? t.common.loading : t.auth.signIn}
            </button>
          )}
          <button type="button" className="gbtn" onClick={onDemo}>{t.demo.start}</button>
          <p className="note" style={{ margin: 0, textAlign: "center" }}>{t.demo.note}</p>
        </div>
        {err && <div className="alert bad">{t.auth.error(err)}</div>}
      </div>
    </div>
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

  if (loading) return <div className="landing"><div className="hero" /></div>;
  if (!ds) {
    return <Landing onDemo={() => { try { localStorage.setItem(DEMO_KEY, "1"); } catch {} setDemo(true); }} />;
  }
  const exitDemo = () => { try { localStorage.removeItem(DEMO_KEY); } catch {} setDemo(false); };
  return <Workspace key={ds.kind + (user?.uid || "")} ds={ds} onExitDemo={user ? undefined : exitDemo} />;
}

function Workspace({ ds, onExitDemo }: { ds: DataSource; onExitDemo?: () => void }) {
  const { t, L, lang } = useI18n();
  const { user, signOut } = useAuth();
  const [records, setRecords] = useState<SprayRecord[]>([]);
  const [settings, setSettings] = useState<UserSettings>({ prices: {}, orchardNames: {} });
  const [products, setProducts] = useState<Record<string, ProductInfo>>({});
  const [loaded, setLoaded] = useState(false);
  const [err, setErr] = useState("");
  const [tab, setTabState] = useState<Tab>("home");
  const [formSignal, setFormSignal] = useState(0);
  const [orch, setOrchState] = useState("all");
  const [year, setYear] = useState(() => new Date().getFullYear());

  useEffect(() => {
    // 오류가 나도 '불러오는 중'에 멈추지 않게 화면은 연다
    const onErr = (e: Error) => {
      const code = (e as { code?: string }).code || "";
      setErr(
        code === "permission-denied" ? t.errors.permission
          : code === "unavailable" ? t.errors.offline
          : t.errors.other(e.message),
      );
      setLoaded(true);
    };
    const u1 = ds.watchRecords((r) => { setRecords(r); setLoaded(true); }, onErr);
    const u2 = ds.watchSettings(setSettings, onErr);
    ds.loadProducts().then((list) => setProducts(Object.fromEntries(list.map((p) => [p.brand, p]))));
    return () => { u1(); u2(); };
  }, [ds, t]);

  const setTab = (k: Tab) => { setTabState(k); window.scrollTo({ top: 0 }); };
  const setOrch = (o: string) => {
    setOrchState(o);
    try { if (o !== "all") localStorage.setItem("citrus-last-orch", o); } catch {}
  };
  const lastOrch = () => { try { return localStorage.getItem("citrus-last-orch") || "1"; } catch { return "1"; } };

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

  const openOrchard = (o: string) => { setOrch(o || lastOrch()); setTab("log"); };
  const addRecord = () => {
    if (orch === "all") setOrch(lastOrch());
    setTabState("log");
    setFormSignal((n) => n + 1);
  };

  const today = new Date();
  const todayLabel = today.toLocaleDateString(lang === "ko" ? "ko-KR" : "en-US", { month: "long", day: "numeric", weekday: "short" });
  const name = user?.displayName || (user ? user.email : t.home.guest);

  return (
    <div className="app">
      <div className="hero">
        <div className="hero-top">
          <div className="hello">
            <span className="avatar" aria-hidden="true">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {user?.photoURL ? <img src={user.photoURL} alt="" referrerPolicy="no-referrer" /> : "🧑‍🌾"}
            </span>
            <span style={{ minWidth: 0 }}>
              <small>{t.home.hello} 👋</small>
              <b>{name}</b>
            </span>
          </div>
          <div className="iconrow">
            <LangButton />
            <ThemeCycleButton />
            <button type="button" className="iconbtn" aria-label={t.nav.settings} onClick={() => setTab("settings")}><IcGear size={20} /></button>
          </div>
        </div>

        <div className="glass herocard">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <span className="loc"><IcPin /> {t.home.heroScope(year, app.scope)}</span>
            <div className="sel">
              <select aria-label={t.common.orchard} value={orch} onChange={(e) => setOrch(e.target.value)}>
                <option value="all">{t.common.all}</option>
                {ORCHARDS.map((o) => <option key={o} value={o}>{app.oName(o)}</option>)}
              </select>
              <select aria-label={t.common.year} value={year} onChange={(e) => setYear(+e.target.value)}>
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
          <div className="big">
            <b>{app.yearRecs.length}</b>
            <span>{t.home.heroUnit} · {todayLabel}</span>
          </div>
          <div className="tags">
            <span><IcLayers /> {t.home.tagGroups(stats.groups)}</span>
          </div>
        </div>
        <div className="herostats">
          <div className={`glass herostat ${stats.bad ? "bad" : ""}`}>
            <small><IcAlert /> {t.home.statBad}</small>
            <b>{stats.bad}</b>
          </div>
          <div className={`glass herostat ${stats.warn ? "warn" : ""}`}>
            <small><IcShield size={16} /> {t.home.statWarn}</small>
            <b>{stats.warn}</b>
          </div>
        </div>
      </div>

      <main className="sheet">
        {ds.kind === "local" && (
          <div className="banner">
            <span>{t.demo.banner}</span>
            <button type="button" className="small ghost" onClick={() => { resetDemo(); location.reload(); }}>{t.demo.reset}</button>
          </div>
        )}
        {err && <div className="alert bad">{err}</div>}

        {!loaded ? (
          <p className="muted">{t.common.loading}</p>
        ) : tab === "home" ? (
          <HomeTab app={app} onOpenOrchard={openOrchard} />
        ) : tab === "log" ? (
          <LogTab app={app} formSignal={formSignal} />
        ) : tab === "check" ? (
          <CheckTab app={app} />
        ) : tab === "rec" ? (
          <RecTab app={app} />
        ) : (
          <>
            <div className="card">
              <h2>{t.nav.settings}</h2>
              <div className="row"><LangSwitch /><ThemeToggle /></div>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <span className="note">{user ? user.email : t.demo.banner}</span>
                {user ? (
                  <button type="button" className="small" onClick={signOut}>{t.auth.signOut}</button>
                ) : onExitDemo ? (
                  <button type="button" className="small" onClick={onExitDemo}>{t.demo.exit}</button>
                ) : null}
              </div>
            </div>
            <SettingsTab app={app} />
          </>
        )}
      </main>

      <nav className="bottomnav" aria-label="menu">
        <div className="bar">
          <NavTab cur={tab} k="home" label={t.nav.home} onClick={() => setTab("home")}><IcHome /></NavTab>
          <NavTab cur={tab} k="log" label={t.nav.calendar} onClick={() => { if (orch === "all") setOrch(lastOrch()); setTab("log"); }}><IcCalendar /></NavTab>
          <button type="button" className="fab" aria-label={t.nav.add} onClick={addRecord}><IcPlus /></button>
          <NavTab cur={tab} k="check" label={t.nav.check} onClick={() => setTab("check")}><IcShield /></NavTab>
          <NavTab cur={tab} k="rec" label={t.nav.rec} onClick={() => setTab("rec")}><IcSpark /></NavTab>
        </div>
      </nav>
    </div>
  );
}

function NavTab({ cur, k, label, onClick, children }: { cur: Tab; k: Tab; label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" className="tab" aria-current={cur === k ? "page" : undefined} onClick={onClick}>
      {children}
      <span>{label}</span>
    </button>
  );
}
