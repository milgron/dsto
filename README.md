# dsto

Design system de **Taller Oliva**: tokens, tipografía, clases y movimiento. Es la fuente única para talleroliva.com, el panel de centinela, el editor de escritos y lo que venga.

## Catálogo local

```sh
./abrir                 # http://127.0.0.1:4760
```

Muestra cada token con su contraste, la escala tipográfica, las clases en vivo y las reglas de movimiento. Tiene botones para copiar:
- **instalar** e **import**: para sumarlo a un proyecto;
- **variables css**: el bloque `:root`;
- **tema tailwind**: el bloque `@theme inline`;
- **todo para pegar**: un `globals.css` completo que no necesita el paquete;
- **json**: todo en datos.

Además, cada color tiene botones `var` y `valor`, y cada ejemplo, su HTML.

## Usarlo en un proyecto

```sh
pnpm add github:milgron/dsto#v0.1.0
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
| `tokens.css` | Variables: paleta, transparencias, semáforo, series de datos, fuentes y tramas |
| `dsto.css` | Clases: `.label`, `.chip`, `.ulink`, `.leader`, `.btn-px`, `.px`, `.olive-dots`, animaciones a saltos… |
| `tailwind.css` | Tokens, clases, el `@theme` de Tailwind y las utilidades `opsz-*` y `dither-25/50/75` |
| `tokens.json` | Todo como datos, incluida la escala tipográfica |

**Reglas que viajan con los tokens:**
- **Semáforo:** nunca el color solo; siempre con etiqueta y forma.
- **Gráficos:** el semáforo nunca se usa como serie.
- **Movimiento:** siempre `steps()`, nunca easing.

## Cambiar algo

1. Editar `src/tokens.ts`, que es la única fuente.
2. Si hace falta, cambiar `dsto.css`.
3. Correr `pnpm build`: regenera `tokens.css`, `tailwind.css` y `tokens.json`. Con `pnpm check` se verifica que estén al día.
4. Subir la versión en `package.json`, commitear y crear el tag: `git tag vX.Y.Z && git push --tags`.
5. Cada proyecto actualiza cuando quiere, cambiando la versión en su `package.json`.
