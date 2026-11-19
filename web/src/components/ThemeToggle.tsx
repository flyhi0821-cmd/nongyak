"use client";
import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";

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

export function ThemeToggle() {
  const { t } = useI18n();
  const [mode, setMode] = useState<Mode>("system");
  // 서버 렌더 값과 맞춘 뒤 실제 값으로 바꾼다(hydration 불일치 방지)
  useEffect(() => {
    // 언어 전환처럼 루트 레이아웃이 바뀌면 <html> 이 새로 그려지므로 다시 적용
    const m = readMode();
    apply(m);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMode(m);
  }, []);
  const opts: Mode[] = ["system", "light", "dark"];
  return (
    <div className="seg" role="group" aria-label={t.theme.label}>
      {opts.map((m) => (
        <button
          key={m}
          type="button"
          aria-pressed={mode === m}
          onClick={() => {
            apply(m);
            setMode(m);
          }}
        >
          {t.theme[m]}
        </button>
      ))}
    </div>
  );
}
