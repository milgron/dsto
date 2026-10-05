# dsto

Design system de Taller Oliva (paquete `dsto`, repo público `milgron/dsto`). Lo consumen talleroliva.com, el panel de `~/code/centinela` y el editor de `~/escritos/editor`.

- **Fuente única:** `src/tokens.ts`. `tokens.css`, `tailwind.css` y `tokens.json` se **generan** con `node scripts/build.mjs`: nunca se editan a mano. `node scripts/build.mjs --check` falla si están desactualizados.
- **Las clases** viven en `dsto.css`, a mano. Ahí no va nada específico de un sitio (como la ventana del chat de Carta).
- **Catálogo:** `catalogo/`, Next.js local (`./abrir`, puerto 4760). Lee los archivos del repo por ruta relativa.
- **Versionado:** se sube la versión en `package.json` y se crea el tag `vX.Y.Z`. Los proyectos lo instalan con `github:milgron/dsto#vX.Y.Z`.
- **Idioma:** el código, en inglés; la UI y los docs, en castellano rioplatense.
- **Reglas:** el semáforo nunca solo (siempre con etiqueta y forma); nunca como serie de datos; movimiento siempre con `steps()`. Los colores de serie están validados contra daltonismo y contra el semáforo: si se cambian, hay que volver a validarlos.
