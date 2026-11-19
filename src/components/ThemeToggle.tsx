"use client";
import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { IcAuto, IcMoon, IcSun } from "./Icons";

type Mode = "system" | "light" | "dark";
const KEY = "theme";

/** <head>에서 그리기 전에 실행: 저장된 테마를 먼저 적용해 깜빡임을 막는다 */
export const themeInitScript = `try{var t=localStorage.getItem('${KEY}');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t;}catch(e){}`;

function apply(m: Mode) {
  const el = document.documentElement;
  if (m === "system") delete el.dataset.theme;
  else el.dataset.theme = m;
  try {
    if (m === "system") localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, m);
  } catch {}
}

function readMode(): Mode {
  let t: string | null = null;
  try {
    t = localStorage.getItem(KEY);
  } catch {}
  return t === "light" || t === "dark" ? t : "system";
}

function useThemeMode() {
  const [mode, setMode] = useState<Mode>("system");
  useEffect(() => {
    // 루트 레이아웃이 다시 그려져도 저장된 값을 다시 적용
    const m = readMode();
    apply(m);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMode(m);
  }, []);
  return [mode, (m: Mode) => { apply(m); setMode(m); }] as const;
}

/** 설정 화면용: 시스템 / 라이트 / 다크 */
export function ThemeToggle() {
  const { t } = useI18n();
  const [mode, set] = useThemeMode();
  const opts: Mode[] = ["system", "light", "dark"];
  return (
    <div className="seg" role="group" aria-label={t.theme.label}>
      {opts.map((m) => (
        <button key={m} type="button" aria-pressed={mode === m} onClick={() => set(m)}>
          {t.theme[m]}
        </button>
      ))}
    </div>
  );
}

/** 상단 둥근 버튼: 누를 때마다 시스템 → 라이트 → 다크 */
export function ThemeCycleButton() {
  const { t } = useI18n();
  const [mode, set] = useThemeMode();
  const next: Record<Mode, Mode> = { system: "light", light: "dark", dark: "system" };
  return (
    <button type="button" className="iconbtn" onClick={() => set(next[mode])} aria-label={`${t.nav.theme}: ${t.theme[mode]}`} title={t.theme[mode]}>
      {mode === "light" ? <IcSun size={20} /> : mode === "dark" ? <IcMoon size={20} /> : <IcAuto size={20} />}
    </button>
  );
}
