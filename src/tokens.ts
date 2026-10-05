// dsto · design system de Taller Oliva. FUENTE ÚNICA: todo lo demás (tokens.css, tailwind.css,
// tokens.json) se genera desde acá con `node scripts/build.mjs`. No editar los generados a mano.

export const palette = {
  paper: { label: "papel", hex: "#f7f4ee", note: "fondo papel: blanco cálido" },
  ink: { label: "tinta", hex: "#1c1a17", note: "tinta casi negra" },
  olive: { label: "oliva", hex: "#a9ae7b", note: "bloque a sangre: aceite de oliva" },
  pine: { label: "pino", hex: "#243d30", note: "acento: verde pino" },
  oil: { label: "aceite", hex: "#e6e2cf", note: "superficie clara sobre oliva" },
} as const;

/** Ink over paper at a given opacity. */
export const alphas = {
  mute: { label: "apagado", of: "ink", alpha: 0.68, note: "texto secundario" },
  line: { label: "línea", of: "ink", alpha: 0.18, note: "bordes y divisores suaves" },
} as const;

/**
 * Semáforo: estados de UX (ok, aviso, caído). No son tintas de marca. Nunca el color solo:
 * siempre con etiqueta y forma (hoja y pimentón se confunden con deuteranopía).
 */
export const signal = {
  leaf: { label: "hoja", hex: "#3d7a4c", note: "ok · texto y formas" },
  mustard: { label: "mostaza", hex: "#b07a1c", note: "aviso · solo formas (3,39:1)" },
  "mustard-ink": { label: "mostaza texto", hex: "#86590c", note: "aviso · texto" },
  paprika: { label: "pimentón", hex: "#b3402c", note: "caído · texto y formas" },
  "leaf-soft": { label: "hoja suave", hex: "#dfe8d6", note: "fondo de fila ok" },
  "mustard-soft": { label: "mostaza suave", hex: "#f1e3c2", note: "fondo de fila aviso" },
  "paprika-soft": { label: "pimentón suave", hex: "#f3dcd4", note: "fondo de fila caído" },
} as const;

/**
 * Series de datos (gráficos). Validadas sobre papel: luminosidad, croma, daltonismo, contraste,
 * y separadas de cada color del semáforo. El semáforo nunca se usa como serie.
 */
export const series = {
  "series-1": { label: "pizarra", hex: "#255691", note: "serie 1 · y la única, si hay una sola" },
  "series-2": { label: "brezo", hex: "#a5679f", note: "serie 2" },
} as const;

export const fonts = {
  display: { family: "Fraunces", variable: "--font-fraunces", fallback: "ui-serif, Georgia, serif", note: "todo lo que se lee; eje opsz, tope 72" },
  mono: { family: "JetBrains Mono", variable: "--font-jetbrains", fallback: "ui-monospace, monospace", note: "solo etiquetas, en minúscula; pesos 300 y 400" },
} as const;

/** Escala tipográfica, tal como la usa talleroliva.com (clases de Tailwind + la utilidad opsz-*). */
export const typeScale = [
  { key: "portada", name: "portada", where: "hero · h1", cls: "text-[clamp(3rem,8.2vw,8.4rem)] font-light leading-[0.92] tracking-[-0.035em] opsz-72" },
  { key: "tesis", name: "tesis", where: "statement", cls: "text-[clamp(3rem,9vw,8.6rem)] font-normal leading-[0.94] tracking-[-0.03em] opsz-72" },
  { key: "bloque", name: "titular de bloque", where: "h2 de bloque", cls: "text-[clamp(2.6rem,7vw,6.6rem)] font-normal leading-[0.96] tracking-[-0.025em] opsz-72" },
  { key: "seccion", name: "titular de sección", where: "h2 de sección", cls: "text-[clamp(2.2rem,5.4vw,4.8rem)] font-light leading-[0.98] tracking-[-0.025em] opsz-72" },
  { key: "chico", name: "titular chico", where: "h2 chico", cls: "text-[clamp(2rem,5vw,4rem)] font-light leading-[1] tracking-[-0.02em] opsz-72" },
  { key: "item", name: "ítem", where: "h3", cls: "text-[clamp(1.6rem,2.8vw,2.5rem)] font-light leading-[1.02] tracking-[-0.02em] opsz-72" },
  { key: "bajada", name: "bajada", where: "subtítulo", cls: "text-[18px] leading-snug opsz-18 md:text-[21px]" },
  { key: "cuerpo", name: "cuerpo", where: "párrafos", cls: "text-[18px] leading-relaxed opsz-18" },
  { key: "chica", name: "cuerpo chico", where: "respuestas, extractos", cls: "text-[16px] leading-relaxed text-mute opsz-18" },
  { key: "dato", name: "dato", where: "fichas", cls: "text-[15px] leading-snug opsz-18" },
  { key: "etiqueta", name: "etiqueta", where: "mono, en minúscula", cls: "label lowercase" },
] as const;

/** Reglas de movimiento (texto: las aplica cada componente). */
export const motion = [
  "A saltos de cuadro: siempre steps(), nunca ease. Cuadros pocos y visibles.",
  "La única excepción es una ventana que entra (chat): ahí steps() se lee como bajo fps.",
  "Todo lo que se mueve se apaga con prefers-reduced-motion.",
] as const;

/** Dither (tramas en CSS puro): color de la tinta y tamaño del píxel por defecto. */
export const dither = { color: "olive", px: "2px" } as const;
