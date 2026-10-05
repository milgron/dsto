// Generates tokens.css, tailwind.css and tokens.json from src/tokens.ts (the single source).
// `node scripts/build.mjs --check` fails if the committed files are out of date.
import { readFileSync, writeFileSync } from "node:fs";
import { alphas, dither, fonts, motion, palette, series, signal, typeScale } from "../src/tokens.ts";

const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const HEADER = (what) => `/* dsto · ${what}. GENERADO desde src/tokens.ts con \`node scripts/build.mjs\`: no editar a mano. */\n`;

function tokensCss() {
  const l = [HEADER("tokens del design system de Taller Oliva"), ":root {"];
  l.push("  /* paleta */");
  for (const [k, t] of Object.entries(palette)) l.push(`  --${k}: ${t.hex}; /* ${t.label}: ${t.note} */`);
  for (const [k, t] of Object.entries(alphas)) l.push(`  --${k}: rgba(${rgb(palette[t.of].hex).join(", ")}, ${t.alpha}); /* ${t.label}: ${t.note} */`);
  l.push("", "  /* semáforo: estados de UX, nunca el color solo */");
  for (const [k, t] of Object.entries(signal)) l.push(`  --${k}: ${t.hex}; /* ${t.label}: ${t.note} */`);
  l.push("", "  /* series de datos (gráficos): nunca el semáforo como serie */");
  for (const [k, t] of Object.entries(series)) l.push(`  --${k}: ${t.hex}; /* ${t.label}: ${t.note} */`);
  l.push("", "  /* tipografía: las variables --font-fraunces y --font-jetbrains las define next/font en cada app */");
  for (const [k, f] of Object.entries(fonts)) l.push(`  --dsto-font-${k}: var(${f.variable}, "${f.family}"), ${f.fallback};`);
  l.push("", "  /* tramas (dither): tinta y tamaño de píxel por defecto */", `  --dither: var(--${dither.color});`, `  --dpx: ${dither.px};`, "}");
  return l.join("\n") + "\n";
}

function tailwindCss() {
  const names = [...Object.keys(palette), ...Object.keys(alphas), ...Object.keys(signal), ...Object.keys(series)];
  const l = [HEADER("entrada para proyectos con Tailwind v4"), '@import "./tokens.css";', '@import "./dsto.css";', "", "@theme inline {"];
  for (const n of names) l.push(`  --color-${n}: var(--${n});`);
  l.push("  --font-display: var(--dsto-font-display);", "  --font-mono: var(--dsto-font-mono);", "}", "");
  l.push(readFileSync(new URL("./utilities.css", import.meta.url), "utf8").trim());
  return l.join("\n") + "\n";
}

function tokensJson() {
  return JSON.stringify({ version: JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")).version, palette, alphas, signal, series, fonts, typeScale, motion, dither }, null, 2) + "\n";
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
if (check) console.log("tokens.css, tailwind.css y tokens.json al día.");
