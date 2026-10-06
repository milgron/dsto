# dsto

Design system de Taller Oliva (paquete `dsto`, repo público `milgron/dsto`). Lo consumen talleroliva.com, el panel de `~/code/centinela` y el editor de `~/escritos/editor`.

- **Fuente única:** `src/tokens.ts`. `tokens.css`, `tailwind.css` y `tokens.json` se **generan** con `node scripts/build.mjs`: nunca se editan a mano. `node scripts/build.mjs --check` falla si están desactualizados.
- **Las clases** viven en `dsto.css`, a mano. Ahí no va nada específico de un sitio (como la ventana del chat de Carta).
- **Catálogo:** `catalogo/`, Next.js local (`./abrir`, puerto 4760). Lee los archivos del repo por ruta relativa.
- **Versionado:** se sube la versión en `package.json` y se crea el tag `vX.Y.Z`. Los proyectos lo instalan con `github:milgron/dsto#vX.Y.Z`.
- **Idioma:** el código, en inglés; la UI y los docs, en castellano rioplatense.
- **Dos capas:** materiales (`palette`, `signal`: constantes) y roles (`roles`, `chart`: valor en claro y en oscuro, ambos obligatorios). Los roles claros apuntan a materiales por nombre, así el claro no cambia por accidente. Los componentes y `dsto.css` usan roles, nunca materiales (salvo tramas como `.olive-dots`).
- **Tema:** claro por defecto. Oscuro solo con `data-theme="dark"`, o `"auto"` para seguir al sistema. Nunca un `@media (prefers-color-scheme)` suelto sobre `:root`: el panel y los sitios que no lo pidieron cambiarían de tema.
- **Validación:** `scripts/build.mjs` falla (y no escribe) si falta un par, si un contraste declarado en `on` no llega, o si una serie se sale de los chequeos de la skill de dataviz (banda, croma, daltonismo, vecinas, contraste, semáforo). La matemática está en `scripts/color.mjs`. Para un rol nuevo de texto, declarar sus `on`.
- **Reglas:** el semáforo nunca solo (siempre con etiqueta y forma); nunca como serie de datos; movimiento siempre con `steps()`; cajas planas (`--radius-box: 0`).
- **Subir cambios:** el remoto `origin` está en SSH y, sin agente, falla. Se empuja por HTTPS con las credenciales de `gh`, siempre a `master` (no hay `main`): `git -c credential.helper= -c credential.helper='!gh auth git-credential' push https://github.com/milgron/dsto.git HEAD:master vX.Y.Z`.

## Pendiente

- **0.3, en espera** (Tomás dijo "aún no" el 2026-10-05). Hay tres problemas de nombres:
  1. El sufijo `-ink` (`leaf-ink`, `mustard-ink`, `paprika-ink`) choca con el material `--ink`.
  2. El semáforo está a mitad de camino entre materiales y roles.
  3. Los materiales se pueden usar como clases de Tailwind (`text-leaf`, `bg-paprika-soft`), y así se saltean los roles. Los valores del oscuro, en cambio, son hex sin nombre.

  La propuesta:
  - cambiar el sufijo (por ejemplo, `-deep`);
  - dejar de exponer el semáforo como clases;
  - opcionalmente, nombrar los valores del oscuro.

  El costo: hay que migrar talleroliva.com y escritos.
- **Componentes** (`dsto/react`): para después.
- **Migrar talleroliva.com y escritos a dsto:** con el OK de Tomás, porque son otros repos.
