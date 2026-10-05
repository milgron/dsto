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
 * Cada estado tiene un tono para formas y otro, más oscuro, para texto (el de formas no llega
 * a 4,5:1 sobre su fondo suave).
 */
export const signal = {
  leaf: { label: "hoja", hex: "#3d7a4c", note: "ok · formas y relleno" },
  "leaf-ink": { label: "hoja texto", hex: "#337344", note: "ok · texto (4,53:1 sobre hoja suave)" },
  mustard: { label: "mostaza", hex: "#b07a1c", note: "aviso · solo formas (3,39:1)" },
  "mustard-ink": { label: "mostaza texto", hex: "#86590c", note: "aviso · texto" },
  paprika: { label: "pimentón", hex: "#b3402c", note: "caído · formas y relleno" },
  "paprika-ink": { label: "pimentón texto", hex: "#a43d2b", note: "caído · texto (4,88:1 sobre pimentón suave)" },
  "leaf-soft": { label: "hoja suave", hex: "#dfe8d6", note: "fondo de fila ok" },
  "mustard-soft": { label: "mostaza suave", hex: "#f1e3c2", note: "fondo de fila aviso" },
  "paprika-soft": { label: "pimentón suave", hex: "#f3dcd4", note: "fondo de fila caído" },
} as const;

type Material = keyof typeof palette | keyof typeof signal;
/** A role value: a material by name, a literal hex, or a material (or hex) at an opacity. */
type Value = Material | `#${string}` | { of: Material | `#${string}`; alpha: number };
type Role = {
  label: string;
  light: Value;
  dark: Value;
  note: string;
  /** Minimum contrast against other roles (the build fails below it): 4.5 for text, 3 for shapes. */
  on?: Record<string, number>;
};

/**
 * Roles semánticos: lo que usan los componentes. Cada rol tiene su valor en claro y en oscuro
 * (los dos son obligatorios) y los contrastes mínimos que el build exige.
 * Los nombres siguen la convención de shadcn. Además:
 * · `*-foreground`: texto sobre el relleno sólido (sobre `success`, por ejemplo);
 * · `*-text`: el estado usado como texto, sobre el fondo, una caja o su `*-muted`;
 * · `*-muted`: fondo suave de fila o aviso.
 * El tema claro sale de la paleta; el oscuro es tinta como fondo y aceite como texto.
 */
export const roles = {
  background: { label: "fondo", light: "paper", dark: "ink", note: "fondo de la página" },
  foreground: { label: "texto", light: "ink", dark: "oil", note: "texto principal", on: { background: 4.5, card: 4.5, muted: 4.5 } },
  card: { label: "caja", light: "paper", dark: "#201e1a", note: "caja plana con borde; en oscuro, un punto sobre el fondo" },
  "card-foreground": { label: "texto de caja", light: "ink", dark: "oil", note: "texto dentro de una caja", on: { card: 4.5 } },
  primary: { label: "principal", light: "pine", dark: "olive", note: "acción principal: botón, selección fuerte", on: { background: 3 } },
  "primary-foreground": { label: "texto sobre principal", light: "paper", dark: "ink", note: "texto del botón principal", on: { primary: 4.5 } },
  secondary: { label: "secundario", light: "oil", dark: "#2a2722", note: "acción secundaria, hover de chip", },
  "secondary-foreground": { label: "texto sobre secundario", light: "ink", dark: "oil", note: "", on: { secondary: 4.5 } },
  muted: { label: "apagado", light: "oil", dark: "#2a2722", note: "fondo apagado: filas, bloques, código" },
  "muted-foreground": { label: "texto apagado", light: { of: "ink", alpha: 0.68 }, dark: "#a5a294", note: "texto secundario", on: { background: 4.5, card: 4.5, muted: 4.5 } },
  accent: { label: "acento", light: "oil", dark: "#2a2722", note: "hover de filas y menús" },
  "accent-foreground": { label: "texto sobre acento", light: "ink", dark: "oil", note: "", on: { accent: 4.5 } },
  border: { label: "borde", light: "ink", dark: "#959285", note: "borde de cajas y controles (en oscuro: aceite al 60 % sobre tinta)", on: { background: 3 } },
  "border-subtle": { label: "borde suave", light: { of: "ink", alpha: 0.18 }, dark: { of: "oil", alpha: 0.18 }, note: "divisores decorativos: nunca el único límite de un control" },
  input: { label: "campo", light: "ink", dark: "#959285", note: "borde de campos", on: { background: 3 } },
  ring: { label: "foco", light: "pine", dark: "olive", note: "anillo de foco (2px)", on: { background: 3 } },
  highlight: { label: "marcador", light: "olive", dark: "olive", note: "selección de texto, resaltado" },
  "highlight-foreground": { label: "texto marcado", light: "ink", dark: "ink", note: "", on: { highlight: 4.5 } },

  success: { label: "ok", light: "leaf", dark: "#62bb78", note: "ok · formas y relleno", on: { background: 3, card: 3 } },
  "success-foreground": { label: "texto sobre ok", light: "paper", dark: "ink", note: "", on: { success: 4.5 } },
  "success-text": { label: "ok texto", light: "leaf-ink", dark: "#62bb78", note: "ok como texto", on: { background: 4.5, card: 4.5, "success-muted": 4.5 } },
  "success-muted": { label: "ok suave", light: "leaf-soft", dark: "#1f3423", note: "fondo de fila ok" },
  warning: { label: "aviso", light: "mustard", dark: "#e1a446", note: "aviso · formas y relleno", on: { background: 3, card: 3 } },
  "warning-foreground": { label: "texto sobre aviso", light: "ink", dark: "ink", note: "en claro, tinta: el papel no llega sobre mostaza", on: { warning: 4.5 } },
  "warning-text": { label: "aviso texto", light: "mustard-ink", dark: "#e1a446", note: "aviso como texto", on: { background: 4.5, card: 4.5, "warning-muted": 4.5 } },
  "warning-muted": { label: "aviso suave", light: "mustard-soft", dark: "#3e2d15", note: "fondo de fila aviso" },
  destructive: { label: "caído", light: "paprika", dark: "#ed7760", note: "caído o borrar · formas y relleno", on: { background: 3, card: 3 } },
  "destructive-foreground": { label: "texto sobre caído", light: "paper", dark: "ink", note: "", on: { destructive: 4.5 } },
  "destructive-text": { label: "caído texto", light: "paprika-ink", dark: "#ed7760", note: "caído o error como texto", on: { background: 4.5, card: 4.5, "destructive-muted": 4.5 } },
  "destructive-muted": { label: "caído suave", light: "paprika-soft", dark: "#44241e", note: "fondo de fila caído" },
} as const satisfies Record<string, Role>;

/**
 * Series de datos (gráficos), en orden fijo: la serie 1 es siempre la primera, nunca se rotan.
 * Cada tema tiene sus propios pasos (mismo tono, otra luminosidad). El build las valida contra
 * la banda de luminosidad, el croma, el daltonismo, la separación entre vecinas, el contraste con
 * el fondo y la distancia a cada color del semáforo. El semáforo nunca se usa como serie.
 */
export const chart = {
  "chart-1": { label: "pizarra", light: "#255691", dark: "#1c8dff", note: "serie 1 · y la única, si hay una sola" },
  "chart-2": { label: "brezo", light: "#a5679f", dark: "#be6db7", note: "serie 2" },
  "chart-3": { label: "lirio", light: "#62359c", dark: "#8b46df", note: "serie 3" },
  "chart-4": { label: "turquesa", light: "#009bb4", dark: "#009aba", note: "serie 4 · 3,01:1 sobre papel: siempre con etiqueta o leyenda" },
  "chart-5": { label: "ciruela", light: "#763a64", dark: "#92537e", note: "serie 5" },
  "chart-6": { label: "aciano", light: "#617de6", dark: "#4961c8", note: "serie 6 · una 7.ª serie no se inventa: va a \"otros\" o a gráficos chicos" },
} as const;

/** Espaciado: base de 4px (la misma de Tailwind: p-4 = 16px). Usar solo estos pasos. */
export const space = { base: "4px", steps: [0, 1, 2, 3, 4, 6, 8, 12, 16, 24] } as const;

/** Radios. Las cajas son planas por decisión; el redondeo queda para las marcas de datos. */
export const radius = {
  box: { value: "0px", note: "cajas, botones, campos, chips: planos" },
  mark: { value: "2px", note: "punta de barras y marcas de datos" },
  dot: { value: "9999px", note: "puntos de dato y marcadores" },
} as const;

/** Bordes. Tailwind: `border` = hair, `border-2` = rule. */
export const border = {
  hair: { value: "1px", note: "cajas, campos, chips, píxel de estado" },
  rule: { value: "2px", note: "leader, reglas, foco" },
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
  { key: "chica", name: "cuerpo chico", where: "respuestas, extractos", cls: "text-[16px] leading-relaxed text-muted-foreground opsz-18" },
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
