# dsto

Design system de **Taller Oliva**: color (con tema claro y oscuro), tipografía, espacio, clases y movimiento. Es la fuente única para talleroliva.com, el panel de centinela, el editor de escritos y lo que venga.

## Catálogo local

```sh
./abrir                 # http://127.0.0.1:4760
```

Muestra:
- cada rol en claro y en oscuro, lado a lado y con sus contrastes;
- las series de datos de los dos temas;
- los materiales, el espacio, la escala tipográfica, las clases en vivo y las reglas de movimiento.

Arriba a la derecha se elige el tema (claro, oscuro o sistema). `?theme=dark` en la URL fuerza el oscuro. Tiene botones para copiar:
- **instalar** e **import**: para sumarlo a un proyecto;
- **variables css**: el bloque `:root`;
- **tema tailwind**: el bloque `@theme inline`;
- **todo para pegar**: un `globals.css` completo que no necesita el paquete;
- **json**: todo en datos.

Además, cada color tiene botones `var` y `valor`, y cada ejemplo, su HTML.

## Usarlo en un proyecto

```sh
pnpm add github:milgron/dsto#v0.2.0
```

Con Tailwind v4, en `globals.css`:

```css
@import "tailwindcss";
@import "dsto/tailwind.css";
```

Sin Tailwind:

```css
@import "dsto/tokens.css";
@import "dsto/dsto.css";
```

Las fuentes se cargan en cada app con `next/font`: Fraunces (eje `opsz`, normal e itálica) en `--font-fraunces` y JetBrains Mono (300 y 400) en `--font-jetbrains`. El catálogo, en "Cómo usarlo", trae el snippet listo para copiar.

## Qué trae

| Archivo | Qué es |
|---|---|
| `tokens.css` | Variables: materiales (constantes), roles en claro y oscuro, series de datos, espacio, radios, bordes, fuentes y tramas |
| `dsto.css` | Clases: `.label`, `.chip`, `.ulink`, `.leader`, `.btn-px`, `.px`, `.olive-dots`, animaciones a saltos… |
| `tailwind.css` | Tokens, clases, el `@theme` de Tailwind y las utilidades `opsz-*` y `dither-25/50/75` |
| `tokens.json` | Todo como datos, incluidos la escala tipográfica y los contrastes que validó el build |

## Roles y temas

Hay dos capas:
- **Materiales:** `--paper`, `--ink`, `--olive`, `--pine`, `--oil`, el semáforo (`--leaf`, `--paprika`…). Son constantes y no cambian con el tema.
- **Roles:** lo que usan los componentes. Siguen los nombres de shadcn: `background`, `foreground`, `card`, `primary`, `secondary`, `muted`, `accent`, `border`, `input`, `ring`, cada uno con su `-foreground`. Además hay:
  - `border-subtle` y `highlight`;
  - los estados `success`, `warning` y `destructive`;
  - las series `chart-1` a `chart-6`.

  Cada rol tiene un valor en claro y otro en oscuro.

Los estados tienen cuatro variantes:

| Variante | Para qué | Ejemplo |
|---|---|---|
| `destructive` | formas y relleno | el píxel de "caído" |
| `destructive-foreground` | texto **sobre** el relleno | un botón "Borrar" |
| `destructive-text` | el estado **como texto**, sobre el fondo o sobre su `-muted` | "caído hace 3 min" |
| `destructive-muted` | fondo suave de fila | la fila del chequeo caído |

**El tema:**
- Claro por defecto: si no se hace nada, todo queda en claro.
- `data-theme="dark"` en `<html>` (o en cualquier elemento) pasa a oscuro.
- `data-theme="auto"` sigue al sistema.
- `data-theme="light"` arma una isla clara dentro de una página oscura.

Con Tailwind, los roles son clases comunes (`bg-background`, `text-muted-foreground`, `bg-destructive-muted text-destructive-text`) y cambian solas con el tema.

**Espacio:**
- Base de 4px, igual que Tailwind (`p-4` = 16px). Pasos: 0, 1, 2, 3, 4, 6, 8, 12, 16, 24.
- Radios: `rounded-box` (0: las cajas son planas por decisión), `rounded-mark` (2px, marcas de datos) y `rounded-dot`.
- Bordes: `--border-hair` (1px) y `--border-rule` (2px).

## Qué valida el build

`pnpm build` no genera nada si algo de esto falla:
- **Pares completos:** cada rol y cada serie tiene que tener valor en claro y en oscuro.
- **Contraste**, en los dos temas, de cada par declarado en `src/tokens.ts`: 4,5:1 para texto y 3:1 para formas, bordes y foco. Las transparencias se mezclan sobre su fondo real antes de medir.
- **Series de datos**, en los dos temas:
  - luminosidad dentro de la banda;
  - croma mínimo (que no se lean grises);
  - separación con la serie vecina, con visión normal y con los tres tipos de daltonismo;
  - 3:1 contra el fondo;
  - distancia a cada color del semáforo.

  Son los mismos chequeos que el validador de la skill de dataviz.

**Lo que no valida:**
- que un componente use el par correcto (por ejemplo, `text-success` sobre `bg-success-muted` en vez de `text-success-text`);
- teclado, foco, etiquetas y `alt`;
- la regla del semáforo.

Eso se revisa al usarlo.

## De 0.1 a 0.2

- **Nada cambia en claro:** los materiales siguen iguales, y `--series-1` y `--series-2` siguen existiendo, ahora como alias de `--chart-1` y `--chart-2`.
- **Para tener oscuro,** hay que pasar de materiales a roles:
  - `bg-paper` → `bg-background`;
  - `text-ink` → `text-foreground`;
  - `text-mute` → `text-muted-foreground`;
  - `border-ink` → `border-border`;
  - `border-line` → `border-border-subtle`.
- **Contraste en claro:**
  - `text-paprika` sobre `bg-paprika-soft` daba 4,34:1: pasa a `text-destructive-text` sobre `bg-destructive-muted` (4,88:1);
  - `text-leaf` sobre `bg-leaf-soft` daba 4,07:1: pasa a `text-success-text` sobre `bg-success-muted` (4,53:1).
- **Las clases de `dsto.css`** usan roles, así que funcionan en los dos temas. Los chips y el botón principal tienen anillo de foco.

**Reglas que viajan con los tokens:**
- **Semáforo:** nunca el color solo; siempre con etiqueta y forma.
- **Gráficos:** el semáforo nunca se usa como serie.
- **Movimiento:** siempre `steps()`, nunca easing.

## Cambiar algo

1. Editar `src/tokens.ts`, que es la única fuente.
2. Si hace falta, cambiar `dsto.css`.
3. Correr `pnpm build`: valida y regenera `tokens.css`, `tailwind.css` y `tokens.json`. Si un contraste o una serie no pasa, explica cuál y no escribe nada. Con `pnpm check` se verifica, además, que los archivos estén al día.
4. Subir la versión en `package.json`, commitear y crear el tag: `git tag vX.Y.Z && git push --tags`.
5. Cada proyecto actualiza cuando quiere, cambiando la versión en su `package.json`.
