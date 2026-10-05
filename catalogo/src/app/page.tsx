import { readFileSync } from "node:fs";
import path from "node:path";
import tokens from "../../../tokens.json";
import { Copy } from "@/components/Copy";
import { ThemeToggle } from "@/components/ThemeToggle";

// The catalog reads the package files from the repo root (one level up): tokens.json for data,
// the CSS files for the copy buttons. `pnpm dev` runs from catalogo/.
const read = (f: string) => readFileSync(path.resolve(process.cwd(), "..", f), "utf8");

type Tok = { label: string; hex?: string; note: string; of?: string; alpha?: number };

const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const lum = (c: number[]) => {
  const [r, g, b] = c.map((v) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a: number[], b: number[]) => { const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x); return (hi + 0.05) / (lo + 0.05); };
const over = (fg: number[], a: number, bg: number[]) => fg.map((v, i) => Math.round(v * a + bg[i] * (1 - a)));
const PAPER = rgb(tokens.palette.paper.hex), INK = rgb(tokens.palette.ink.hex);
const num = (n: number, d = 2) => n.toLocaleString("es-AR", { maximumFractionDigits: d, minimumFractionDigits: d });
const ratio = (c: number[]) => num(contrast(c, PAPER));

type Side = { css: string; hex: string; contrast: Record<string, { ratio: number; min: number }> };
type ChartSide = { hex: string; L: number; C: number; contrast: number; fromPrevious?: { normal: number; cvd: number } };
type Tokened<S> = { label: string; note: string; light: S; dark: S };
const ROLES = tokens.roles as Record<string, Tokened<Side>>;
const CHART = tokens.chart as Record<string, Tokened<ChartSide>>;
const STATUS_PREFIXES = ["success", "warning", "destructive"];
const THEMES = [["light", "claro"], ["dark", "oscuro"]] as const;

export default function Catalog() {
  const tokensCss = read("tokens.css");
  const tailwindCss = read("tailwind.css");
  const dstoCss = read("dsto.css");
  const theme = tailwindCss.slice(tailwindCss.indexOf("@theme inline"), tailwindCss.indexOf("}", tailwindCss.indexOf("@theme inline")) + 1);
  const utilities = tailwindCss.slice(tailwindCss.indexOf("@utility"));
  const standalone = `@import "tailwindcss";\n\n${tokensCss}\n${theme}\n\n${utilities}\n${dstoCss}`;
  const install = `pnpm add github:milgron/dsto#v${tokens.version}`;
  const importLine = `@import "tailwindcss";\n@import "dsto/tailwind.css";`;

  const groups: [string, string, Record<string, Tok>][] = [
    ["paleta", "las cinco tintas de la marca", tokens.palette],
    ["transparencias", "tinta sobre papel", tokens.alphas as unknown as Record<string, Tok>],
    ["semáforo", "estados de ux: nunca el color solo, siempre con etiqueta y forma", tokens.signal],
  ];
  const baseRoles = Object.keys(ROLES).filter((k) => !STATUS_PREFIXES.some((p) => k.startsWith(p)));
  const statusRoles = Object.keys(ROLES).filter((k) => STATUS_PREFIXES.some((p) => k.startsWith(p)));

  return (
    <main className="mx-auto max-w-6xl px-6 pt-10 pb-24">
      <header className="flex flex-wrap items-end justify-between gap-6 border-b border-border pb-5">
        <div>
          <p className="label text-muted-foreground lowercase">taller oliva · design system · v{tokens.version}</p>
          <h1 className="mt-2 text-[clamp(3rem,8vw,6rem)] leading-[0.92] font-light tracking-[-0.035em] opsz-72">dsto</h1>
        </div>
        <p className="max-w-[44ch] text-[18px] leading-snug text-muted-foreground opsz-18">
          Tokens, tipografía, clases y movimiento. Una sola fuente (<code className="label">src/tokens.ts</code>) para el sitio, el panel, escritos y lo que venga.
        </p>
      </header>

      <section className="sticky top-0 z-10 -mx-6 border-b border-border-subtle bg-background/95 px-6 py-3 backdrop-blur-[2px]" aria-label="Copiar">
        <div className="flex flex-wrap items-center gap-2">
          <span className="label mr-1 text-muted-foreground lowercase">copiar</span>
          <Copy text={install}>instalar</Copy>
          <Copy text={importLine}>import (tailwind)</Copy>
          <Copy text={tokensCss}>variables css</Copy>
          <Copy text={theme}>tema tailwind</Copy>
          <Copy text={standalone}>todo para pegar</Copy>
          <Copy text={JSON.stringify(tokens, null, 2)}>json</Copy>
          <span className="ml-auto"><ThemeToggle /></span>
        </div>
      </section>

      <Chapter n="00" title="Color">
        <p className="mt-4 max-w-[60ch] text-[16px] leading-relaxed text-muted-foreground opsz-18">
          Los componentes usan <b className="font-normal text-foreground">roles</b>: cada uno tiene su valor en claro y en oscuro, y el build falla si algún par no llega al contraste mínimo. El oscuro se pide con <code className="label">data-theme=&quot;dark&quot;</code> (o <code className="label">&quot;auto&quot;</code> para seguir al sistema); sin eso, todo queda en claro.
        </p>

        <RoleTable title="roles" sub="fondo, texto, acciones, bordes y foco" names={baseRoles} />
        <RoleTable title="estados" sub="*-foreground: texto sobre el relleno · *-text: el estado como texto · *-muted: fondo suave" names={statusRoles} />

        <div className="mt-10">
          <p className="label lowercase">series de datos <span className="text-muted-foreground">· orden fijo, nunca rotan · nunca el semáforo como serie · validadas contra daltonismo en los dos temas</span></p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {THEMES.map(([theme, name]) => (
              <div key={theme} data-theme={theme} className="border border-border bg-background p-4 text-foreground">
                <p className="label text-muted-foreground lowercase">{name}</p>
                <div className="mt-3 flex h-24 items-end gap-[2px]" aria-hidden>
                  {Object.keys(CHART).map((k, i) => (
                    <div key={k} className="flex-1 rounded-t-mark" style={{ background: `var(--${k})`, height: `${[92, 70, 80, 55, 64, 40][i]}%` }} />
                  ))}
                </div>
                <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
                  {Object.entries(CHART).map(([k, c], i) => {
                    const v = c[theme];
                    return (
                      <li key={k} className="flex items-start gap-2">
                        <span className="mt-1 size-3 flex-none" style={{ background: `var(--${k})` }} />
                        <span className="min-w-0">
                          <span className="label block text-[11px]">{i + 1} · {c.label}</span>
                          <span className="label block text-[10px] text-muted-foreground">{v.hex} · {num(v.contrast)}:1</span>
                          {v.fromPrevious && <span className="label block text-[10px] text-muted-foreground">Δ vecina {num(v.fromPrevious.normal, 0)} · dalt. {num(v.fromPrevious.cvd, 0)}</span>}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <p className="label mt-12 lowercase">materiales <span className="text-muted-foreground">· constantes: no cambian con el tema. los roles salen de acá.</span></p>
        {groups.map(([title, sub, group]) => (
          <div key={title} className="mt-6">
            <p className="label lowercase">{title} <span className="text-muted-foreground">· {sub}</span></p>
            <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
              {Object.entries(group).map(([name, t]) => {
                const c = t.hex ? rgb(t.hex) : over(rgb(tokens.palette[t.of as keyof typeof tokens.palette].hex), t.alpha!, PAPER);
                const shown = t.hex ?? `rgba(${rgb(tokens.palette[t.of as keyof typeof tokens.palette].hex).join(", ")}, ${t.alpha})`;
                const dark = lum(c) < 0.25;
                return (
                  <figure key={name} className="border border-border bg-card">
                    <div className="flex h-20 items-end p-2" style={{ backgroundColor: "var(--paper)", backgroundImage: `linear-gradient(var(--${name}), var(--${name}))` }}>
                      <span className={`label text-[11px] lowercase ${dark ? "text-paper" : "text-ink"}`}>{t.label}</span>
                    </div>
                    <figcaption className="space-y-1 px-2.5 py-2">
                      <p className="label text-[12px]">--{name}</p>
                      <p className="label text-[11px] text-muted-foreground">{shown}</p>
                      <p className="label text-[11px] text-muted-foreground lowercase">{ratio(c)}:1 sobre papel · {num(contrast(c, INK))}:1 sobre tinta</p>
                      <p className="text-[13px] leading-snug text-muted-foreground opsz-18">{t.note}</p>
                      <div className="flex gap-1.5 pt-1">
                        <Copy text={`var(--${name})`} className="chip min-h-6 px-1.5 text-[10px]">var</Copy>
                        <Copy text={shown} className="chip min-h-6 px-1.5 text-[10px]">valor</Copy>
                      </div>
                    </figcaption>
                  </figure>
                );
              })}
            </div>
          </div>
        ))}
      </Chapter>

      <Chapter n="01" title="Espacio">
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <div className="border border-border p-4">
            <p className="label text-muted-foreground lowercase">espaciado · base {tokens.space.base}</p>
            <ul className="mt-3 space-y-1.5">
              {tokens.space.steps.map((n) => (
                <li key={n} className="flex items-center gap-3">
                  <span className="label w-24 flex-none text-[11px]">--space-{n}</span>
                  <span className="h-3 bg-primary" style={{ width: `var(--space-${n})` }} />
                  <span className="label text-[11px] text-muted-foreground">{n * 4}px{n ? ` · p-${n}` : ""}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="border border-border p-4">
            <p className="label text-muted-foreground lowercase">radios · rounded-*</p>
            <ul className="mt-3 space-y-3">
              {Object.entries(tokens.radius).map(([k, r]) => (
                <li key={k} className="flex items-center gap-3">
                  <span className="size-10 flex-none bg-chart-1" style={{ borderRadius: `var(--radius-${k})` }} />
                  <span><span className="label block text-[11px]">--radius-{k} · {r.value}</span><span className="text-[13px] text-muted-foreground opsz-18">{r.note}</span></span>
                </li>
              ))}
            </ul>
          </div>
          <div className="border border-border p-4">
            <p className="label text-muted-foreground lowercase">bordes</p>
            <ul className="mt-3 space-y-3">
              {Object.entries(tokens.border).map(([k, b]) => (
                <li key={k} className="flex items-center gap-3">
                  <span className="size-10 flex-none" style={{ border: `var(--border-${k}) solid var(--border)` }} />
                  <span><span className="label block text-[11px]">--border-{k} · {b.value}</span><span className="text-[13px] text-muted-foreground opsz-18">{b.note}</span></span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Chapter>

      <Chapter n="02" title="Tipografía">
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {Object.entries(tokens.fonts).map(([k, f]) => (
            <div key={k} className="border border-border p-4">
              <p className="label text-muted-foreground lowercase">{k} · {f.variable}</p>
              <p className={`mt-2 text-[34px] leading-none ${k === "mono" ? "font-mono text-[26px]" : "font-light opsz-72"}`}>{f.family}</p>
              <p className="mt-2 text-[14px] text-muted-foreground opsz-18">{f.note}</p>
            </div>
          ))}
        </div>
        <ul className="mt-6 border-t border-border">
          {tokens.typeScale.map((t) => (
            <li key={t.key} className="grid gap-2 border-b border-border-subtle py-4 md:grid-cols-[180px_minmax(0,1fr)_auto] md:items-baseline">
              <p className="label lowercase">{t.name}<span className="block text-[11px] text-muted-foreground">{t.where}</span></p>
              <p className={`${t.cls} min-w-0 overflow-hidden text-ellipsis whitespace-nowrap`}>Tiempo de taller</p>
              <Copy text={t.cls} className="chip min-h-7 text-[11px]">clases</Copy>
            </li>
          ))}
        </ul>
      </Chapter>

      <Chapter n="03" title="Clases">
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <Demo name=".label" html={`<p class="label lowercase">etiqueta</p>`}><p className="label lowercase">última corrida hace 40 s</p></Demo>
          <Demo name=".chip · .chip-on" html={`<button class="chip">filtro</button>\n<button class="chip chip-on">activo</button>`}>
            <div className="flex gap-1.5"><span className="chip">por cliente</span><span className="chip chip-on">por tipo</span></div>
          </Demo>
          <Demo name=".ulink" html={`<a class="ulink" href="#">link</a>`}><a className="ulink text-[18px]" href="#ulink">un link subrayado</a></Demo>
          <Demo name=".leader · .leader-gif" html={`<div style="display:flex;gap:8px"><span>Sitio</span><span class="leader"></span><span class="label">ok</span></div>`}>
            <div className="flex items-baseline gap-2 text-[16px]"><span>Sitio</span><span className="leader" /><span className="label">ok</span></div>
            <div className="mt-3 flex items-baseline gap-2 text-[16px]"><span>Cargando</span><span className="leader-gif block flex-1 translate-y-[-0.35em]" /></div>
          </Demo>
          <Demo name=".btn-px" html={`<a class="btn-px" href="#">Escribinos</a>`}><a className="btn-px text-[18px]" href="#btn">Escribinos</a></Demo>
          <Demo name="dither-25 · 50 · 75 (tailwind)" html={`<div class="dither-50 h-16" style="--dither: var(--pine)"></div>`}>
            <div className="grid grid-cols-3 gap-2">
              <div className="dither-25 h-14 border border-border-subtle" /><div className="dither-50 h-14 border border-border-subtle" /><div className="dither-75 h-14 border border-border-subtle" />
            </div>
          </Demo>
          <Demo name=".px · semáforo" html={`<span class="px px-ok"></span> ok\n<span class="px px-warn"></span> en duda\n<span class="px px-down"></span> caído\n<span class="px px-new"></span> sin datos`}>
            <div className="flex flex-wrap gap-4 text-[15px]">
              {[["ok", "ok"], ["warn", "en duda"], ["down", "caído"], ["new", "sin datos"]].map(([k, l]) => (
                <span key={k} className="flex items-baseline gap-2"><span className={`px px-${k}`} />{l}</span>
              ))}
            </div>
          </Demo>
          <Demo name=".olive-dots · .pine-grain" html={`<section class="olive-dots">…</section>`}>
            <div className="grid grid-cols-2 gap-2"><div className="olive-dots h-16" /><div className="pine-grain h-16" /></div>
          </Demo>
        </div>
      </Chapter>

      <Chapter n="04" title="Movimiento">
        <ul className="mt-6 space-y-2">
          {tokens.motion.map((m) => <li key={m} className="text-[18px] leading-snug opsz-18">· {m}</li>)}
        </ul>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <Demo name=".caret" html={`<span class="caret">escribiendo</span>`}><span className="caret text-[18px]">escribiendo</span></Demo>
          <Demo name=".blink-px" html={`<span class="px px-down blink-px"></span>`}><span className="flex items-baseline gap-2 text-[15px]"><span className="px px-down blink-px" /> caído</span></Demo>
          <Demo name=".rot-gif (details)" html={`<details class="group"><summary>Pregunta <span class="rot-gif">+</span></summary>…</details>`}>
            <details className="group"><summary className="cursor-pointer text-[16px]">Abrime <span className="rot-gif inline-block">+</span></summary><p className="mt-2 text-[14px] text-muted-foreground">Gira a saltos, nunca suave.</p></details>
          </Demo>
        </div>
      </Chapter>

      <Chapter n="05" title="Cómo usarlo">
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <Snippet title="1 · instalar" code={install} />
          <Snippet title="2 · globals.css (tailwind v4)" code={importLine} />
          <Snippet
            title="3 · fuentes (next/font)"
            code={`import { Fraunces, JetBrains_Mono } from "next/font/google";\n\nconst fraunces = Fraunces({ subsets: ["latin"], style: ["normal", "italic"], axes: ["opsz"], variable: "--font-fraunces" });\nconst jetbrains = JetBrains_Mono({ subsets: ["latin"], weight: ["300", "400"], variable: "--font-jetbrains" });\n\n// <html className={\`\${fraunces.variable} \${jetbrains.variable}\`}><body className="font-display">`}
          />
          <Snippet title="sin tailwind" code={`@import "dsto/tokens.css";\n@import "dsto/dsto.css";`} />
          <Snippet title="4 · tema oscuro" code={`<!-- claro por defecto; oscuro solo si se pide -->\n<html data-theme="dark">   <!-- siempre oscuro -->\n<html data-theme="auto">   <!-- sigue al sistema -->\n<section data-theme="light"> <!-- isla clara -->\n\n<!-- usar roles, no materiales: -->\n<p class="bg-background text-foreground">…</p>\n<span class="bg-destructive-muted text-destructive-text">caído</span>`} />
        </div>
        <p className="mt-6 text-[16px] text-muted-foreground opsz-18">
          Para cambiar algo: editar <code className="label">src/tokens.ts</code>, correr <code className="label">pnpm build</code>, subir la versión en <code className="label">package.json</code>, commitear y crear el tag <code className="label">vX.Y.Z</code>. Cada proyecto actualiza cuando quiere cambiando la versión en su <code className="label">package.json</code>.
        </p>
      </Chapter>
    </main>
  );
}

function Chapter({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mt-16">
      <p className="label text-muted-foreground">{n}</p>
      <h2 className="text-[clamp(2rem,5vw,3.4rem)] leading-none font-light tracking-[-0.025em] opsz-72">{title}</h2>
      {children}
    </section>
  );
}

function Demo({ name, html, children }: { name: string; html: string; children: React.ReactNode }) {
  return (
    <div className="border border-border">
      <div className="flex items-center justify-between border-b border-border-subtle px-3 py-2">
        <p className="label text-[12px]">{name}</p>
        <Copy text={html} className="chip min-h-6 px-1.5 text-[10px]">html</Copy>
      </div>
      <div className="px-4 py-5">{children}</div>
    </div>
  );
}

function Snippet({ title, code }: { title: string; code: string }) {
  return (
    <div className="border border-border">
      <div className="flex items-center justify-between border-b border-border-subtle px-3 py-2">
        <p className="label text-[12px] lowercase">{title}</p>
        <Copy text={code} className="chip min-h-6 px-1.5 text-[10px]">copiar</Copy>
      </div>
      <pre className="overflow-x-auto bg-ink px-4 py-3 font-mono text-[12px] leading-relaxed text-oil">{code}</pre>
    </div>
  );
}

/** Light and dark side by side: each column is a data-theme island, so the swatches are the real CSS. */
function RoleTable({ title, sub, names }: { title: string; sub: string; names: string[] }) {
  return (
    <div className="mt-10">
      <p className="label lowercase">{title} <span className="text-muted-foreground">· {sub}</span></p>
      <div className="mt-3 border border-border">
        <div className="hidden grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1fr)] border-b border-border md:grid">
          <p className="label px-3 py-2 text-muted-foreground lowercase">rol</p>
          {THEMES.map(([t, name]) => <p key={t} data-theme={t} className="label bg-background px-3 py-2 text-muted-foreground lowercase">{name}</p>)}
        </div>
        {names.map((k) => {
          const r = ROLES[k];
          return (
            <div key={k} className="grid border-b border-border-subtle last:border-b-0 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1fr)]">
              <div className="px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <p className="label text-[12px]">--{k}</p>
                  <Copy text={`var(--${k})`} className="chip min-h-5 px-1 text-[10px]">var</Copy>
                </div>
                <p className="mt-0.5 text-[13px] leading-snug text-muted-foreground opsz-18">{r.label}{r.note ? ` · ${r.note}` : ""}</p>
              </div>
              {THEMES.map(([t, name]) => {
                const v = r[t];
                const pairs = Object.entries(v.contrast);
                return (
                  <div key={t} data-theme={t} className="flex items-start gap-2.5 bg-background px-3 py-2.5 text-foreground">
                    <span className="mt-0.5 size-7 flex-none border border-border-subtle" style={{ background: `var(--${k})` }} title={name} />
                    <div className="min-w-0">
                      <p className="label truncate text-[11px]">{v.css}</p>
                      {v.css !== v.hex && <p className="label text-[10px] text-muted-foreground">{v.hex}</p>}
                      {pairs.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {pairs.map(([bg, c]) => (
                            <span key={bg} className="label border border-border-subtle px-1 text-[10px]" style={{ background: `var(--${bg})`, color: k.endsWith("-foreground") || k.endsWith("-text") || k === "foreground" ? `var(--${k})` : undefined }}>
                              {k.endsWith("-foreground") || k.endsWith("-text") || k === "foreground" ? "Aa " : <span className="mr-1 inline-block size-2 align-middle" style={{ background: `var(--${k})` }} />}
                              {num(c.ratio)} <span className="opacity-70">/ {bg}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
