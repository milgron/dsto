"use client";

import { useEffect, useState } from "react";

const OPTIONS = [["light", "claro"], ["dark", "oscuro"], ["auto", "sistema"]] as const;
type Theme = (typeof OPTIONS)[number][0];

/** Sets data-theme on <html> (light by default) and remembers it in this browser. */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  useEffect(() => setTheme((document.documentElement.dataset.theme as Theme) ?? "light"), []);

  const pick = (t: Theme) => {
    setTheme(t);
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem("dsto-theme", t); } catch {}
  };

  return (
    <div className="flex gap-1" role="group" aria-label="Tema">
      {OPTIONS.map(([t, label]) => (
        <button key={t} type="button" className={`chip min-h-7 text-[11px] ${theme === t ? "chip-on" : ""}`} aria-pressed={theme === t} onClick={() => pick(t)}>
          {label}
        </button>
      ))}
    </div>
  );
}

/** Runs before paint so a remembered theme doesn't flash light first. `?theme=dark` wins (for links and screenshots). */
export const themeScript = `try{var t=new URLSearchParams(location.search).get("theme")||localStorage.getItem("dsto-theme");if(t==="dark"||t==="auto")document.documentElement.dataset.theme=t}catch(e){}`;
