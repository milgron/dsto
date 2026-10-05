// Generates tokens.css, tailwind.css and tokens.json from src/tokens.ts (the single source).
// Every run validates the roles and chart series for both themes and exits 1 on any violation,
// without writing. `node scripts/build.mjs --check` also fails if the committed files are out of date.
import { readFileSync, writeFileSync } from "node:fs";
import { alphas, border, chart, dither, fonts, motion, palette, radius, roles, signal, space, typeScale } from "../src/tokens.ts";
import { contrast, deltaE, hexToRgb, oklch, over, worstCvdDelta } from "./color.mjs";

const THEMES = ["light", "dark"];
const HEADER = (what) => `/* dsto · ${what}. GENERADO desde src/tokens.ts con \`node scripts/build.mjs\`: no editar a mano. */\n`;
const materials = { ...palette, ...signal };
const isHex = (v) => typeof v === "string" && /^#[0-9a-f]{6}$/i.test(v);
const fmt = (n) => Math.round(n * 100) / 100;

// ── resolving values ─────────────────────────────────────────────────

/** Opaque hex of a material name or a literal hex. */
function solid(v) {
  if (isHex(v)) return v.toLowerCase();
  if (materials[v]) return materials[v].hex;
  throw new Error(`valor desconocido: ${JSON.stringify(v)}`);
}

/** CSS for a role value: materials by var(), literals as hex, alphas as rgba(). */
function css(v) {
  if (typeof v === "object") return `rgba(${hexToRgb(solid(v.of)).join(", ")}, ${v.alpha})`;
  return isHex(v) ? v.toLowerCase() : `var(--${v})`;
}

/** The hex a role looks like, compositing alphas over `bg` (itself a resolved hex). */
function seen(theme, name, bg) {
  const v = roles[name][theme];
  if (typeof v === "object") return over(solid(v.of), v.alpha, bg ?? seen(theme, "background"));
  return solid(v);
}

// ── checks ───────────────────────────────────────────────────────────

const errors = [];
const report = { roles: {}, chart: {} };
const BAND = { light: [0.43, 0.77], dark: [0.48, 0.67] }; // OKLCH L, same as the dataviz validator
const STATUS = ["success", "warning", "destructive"];

for (const [name, role] of Object.entries(roles)) {
  report.roles[name] = {};
  for (const theme of THEMES) {
    if (role[theme] === undefined) { errors.push(`${name}: falta el valor en ${theme === "light" ? "claro" : "oscuro"}`); continue; }
    const contrasts = {};
    for (const [bgName, min] of Object.entries(role.on ?? {})) {
      if (!roles[bgName]) { errors.push(`${name}: el rol de fondo "${bgName}" no existe`); continue; }
      const bg = seen(theme, bgName);
      const ratio = contrast(seen(theme, name, bg), bg);
      contrasts[bgName] = { ratio: fmt(ratio), min };
      if (ratio < min) errors.push(`${theme} · ${name} sobre ${bgName}: ${ratio.toFixed(2)}:1, mínimo ${min}:1`);
    }
    report.roles[name][theme] = { css: css(role[theme]), hex: seen(theme, name), contrast: contrasts };
  }
}

for (const theme of THEMES) {
  const bg = seen(theme, "background");
  const status = STATUS.map((s) => [s, seen(theme, s)]);
  const keys = Object.keys(chart);
  const missing = keys.filter((k) => chart[k][theme] === undefined);
  if (missing.length) { missing.forEach((k) => errors.push(`${k}: falta el valor en ${theme === "light" ? "claro" : "oscuro"}`)); continue; }
  const hexes = keys.map((k) => solid(chart[k][theme]));
  const [lo, hi] = BAND[theme];
  const where = (k) => `${theme} · ${k}`;
  hexes.forEach((hex, i) => {
    const [L, C] = oklch(hex);
    const ratio = contrast(hex, bg);
    const nearestStatus = Math.min(...status.map(([, s]) => deltaE(hex, s)));
    report.chart[keys[i]] ??= {};
    report.chart[keys[i]][theme] = { hex, L: fmt(L), C: fmt(C), contrast: fmt(ratio), fromStatus: fmt(nearestStatus) };
    if (L < lo || L > hi) errors.push(`${where(keys[i])}: luminosidad ${L.toFixed(2)} fuera de la banda ${lo}–${hi}`);
    if (C < 0.1) errors.push(`${where(keys[i])}: croma ${C.toFixed(3)} bajo 0,1 (se lee gris)`);
    if (ratio < 3) errors.push(`${where(keys[i])}: ${ratio.toFixed(2)}:1 sobre el fondo, mínimo 3:1`);
    for (const [s, sHex] of status) if (deltaE(hex, sHex) < 15) errors.push(`${where(keys[i])}: se parece a ${s} (ΔE ${deltaE(hex, sHex).toFixed(1)}, mínimo 15)`);
    if (i > 0) {
      const normal = deltaE(hexes[i - 1], hex), cvd = worstCvdDelta(hexes[i - 1], hex);
      report.chart[keys[i]][theme].fromPrevious = { normal: fmt(normal), cvd: fmt(cvd) };
      if (normal < 15) errors.push(`${where(keys[i])}: ΔE ${normal.toFixed(1)} con la serie anterior, mínimo 15`);
      if (cvd < 8) errors.push(`${where(keys[i])}: ΔE ${cvd.toFixed(1)} con la serie anterior bajo daltonismo, mínimo 8`);
    }
    for (let j = 0; j < i; j++) if (deltaE(hexes[j], hex) < 10) errors.push(`${where(keys[i])}: ΔE ${deltaE(hexes[j], hex).toFixed(1)} con ${keys[j]}, mínimo 10`);
  });
}

if (errors.length) {
  console.error(`dsto: ${errors.length} problema(s), no se generó nada:\n` + errors.map((e) => `  · ${e}`).join("\n"));
  process.exit(1);
}

// ── outputs ──────────────────────────────────────────────────────────

/** Role and chart variables for one theme (aliases included: they must resolve inside each theme block). */
function themeVars(theme, indent) {
  const l = [`${indent}color-scheme: ${theme};`];
  for (const [k, r] of Object.entries(roles)) l.push(`${indent}--${k}: ${css(r[theme])};`);
  for (const [k, c] of Object.entries(chart)) l.push(`${indent}--${k}: ${c[theme]}; /* ${c.label} */`);
  l.push(`${indent}/* alias de 0.1 */`, `${indent}--series-1: var(--chart-1);`, `${indent}--series-2: var(--chart-2);`);
  return l;
}

function tokensCss() {
  const l = [HEADER("tokens del design system de Taller Oliva")];
  l.push("/* materiales: constantes, iguales en los dos temas. Los componentes usan los roles de abajo. */", ":root {");
  l.push("  /* paleta */");
  for (const [k, t] of Object.entries(palette)) l.push(`  --${k}: ${t.hex}; /* ${t.label}: ${t.note} */`);
  for (const [k, t] of Object.entries(alphas)) l.push(`  --${k}: rgba(${hexToRgb(palette[t.of].hex).join(", ")}, ${t.alpha}); /* ${t.label}: ${t.note} */`);
  l.push("", "  /* semáforo: estados de UX, nunca el color solo */");
  for (const [k, t] of Object.entries(signal)) l.push(`  --${k}: ${t.hex}; /* ${t.label}: ${t.note} */`);
  l.push("", "  /* tipografía: las variables --font-fraunces y --font-jetbrains las define next/font en cada app */");
  for (const [k, f] of Object.entries(fonts)) l.push(`  --dsto-font-${k}: var(${f.variable}, "${f.family}"), ${f.fallback};`);
  l.push("", `  /* espaciado: base ${space.base} */`);
  for (const n of space.steps) l.push(`  --space-${n}: ${n * parseInt(space.base)}px;`);
  l.push("", "  /* radios y bordes */");
  for (const [k, r] of Object.entries(radius)) l.push(`  --radius-${k}: ${r.value}; /* ${r.note} */`);
  for (const [k, b] of Object.entries(border)) l.push(`  --border-${k}: ${b.value}; /* ${b.note} */`);
  l.push("", "  /* tramas (dither): tinta y tamaño de píxel por defecto */", `  --dither: var(--${dither.color});`, `  --dpx: ${dither.px};`, "}", "");
  l.push('/* roles: claro por defecto. data-theme="light" sirve para una isla clara dentro de una página oscura. */');
  l.push(':root,', '[data-theme="light"] {', ...themeVars("light", "  "), "}", "");
  l.push("/* oscuro: solo si se pide. Nunca sigue al sistema por su cuenta, así nadie cambia de tema sin querer. */");
  l.push('[data-theme="dark"] {', ...themeVars("dark", "  "), "}", "");
  l.push('/* data-theme="auto": sigue al sistema. */', "@media (prefers-color-scheme: dark) {", '  [data-theme="auto"] {', ...themeVars("dark", "    "), "  }", "}");
  return l.join("\n") + "\n";
}

function tailwindCss() {
  const colors = [...Object.keys(palette), ...Object.keys(alphas), ...Object.keys(signal), ...Object.keys(roles), ...Object.keys(chart), "series-1", "series-2"];
  const l = [HEADER("entrada para proyectos con Tailwind v4"), '@import "./tokens.css";', '@import "./dsto.css";', "", "@theme inline {"];
  for (const n of colors) l.push(`  --color-${n}: var(--${n});`);
  for (const [k, r] of Object.entries(radius)) l.push(`  --radius-${k}: ${r.value};`); // literal: var(--radius-x) here would point at itself
  l.push("  --font-display: var(--dsto-font-display);", "  --font-mono: var(--dsto-font-mono);", "}", "");
  l.push(readFileSync(new URL("./utilities.css", import.meta.url), "utf8").trim());
  return l.join("\n") + "\n";
}

function tokensJson() {
  const version = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")).version;
  const r = Object.fromEntries(Object.entries(roles).map(([k, v]) => [k, { label: v.label, note: v.note, ...report.roles[k] }]));
  const c = Object.fromEntries(Object.entries(chart).map(([k, v]) => [k, { label: v.label, note: v.note, ...report.chart[k] }]));
  return JSON.stringify({ version, palette, alphas, signal, roles: r, chart: c, space, radius, border, fonts, typeScale, motion, dither }, null, 2) + "\n";
}

const out = { "tokens.css": tokensCss(), "tailwind.css": tailwindCss(), "tokens.json": tokensJson() };
const check = process.argv.includes("--check");
let stale = 0;
for (const [file, content] of Object.entries(out)) {
  const path = new URL(`../${file}`, import.meta.url);
  let current = "";
  try { current = readFileSync(path, "utf8"); } catch {}
  if (current === content) continue;
  if (check) { console.error(`desactualizado: ${file}`); stale++; }
  else { writeFileSync(path, content); console.log(`generado: ${file}`); }
}
if (check && stale) { console.error("Corré `node scripts/build.mjs`."); process.exit(1); }
console.log(`roles y series validados en claro y oscuro${check ? "; tokens.css, tailwind.css y tokens.json al día" : ""}.`);
