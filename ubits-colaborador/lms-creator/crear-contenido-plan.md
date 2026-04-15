# Plan: Crear contenido — página dedicada (flujo real)

**Estado:** guía de trabajo y registro del corte — no sustituye acuerdos de producto.  
**Ubicación:** `ubits-colaborador/lms-creator/crear-contenido-plan.md`  

**Flujo real (playground):** **solo** `crear-contenido.html` + `crear-contenido.css` + `crear-contenido.js`. Desde `contenidos.html`, el botón **«Crear contenido»** abre esa página; los hashes legacy en la lista redirigen al hash canónico en la página dedicada. No hay flujo embebido en lista ni script `crear-contenido-drawer.js` (eliminado en el corte 2026-04).

Las menciones a “drawer” más abajo son **histórico de migración** o **criterio visual** (p. ej. full-bleed header/footer, bug del `<a>` botón); **no** describen una UI actual paralela.

---

## 1. Objetivo y restricciones (lectura obligatoria)

### Objetivo (cumplido)
**Una página HTML dedicada** para **Crear contenido**, **sin** usar el componente **Drawer** (`openDrawer`) como contenedor del flujo principal, de modo que pasos posteriores (p. ej. publicación) puedan usar overlays o drawers **sin anidar** el shell del asistente.

### Corte (cerrado)
- Eliminado el flujo embebido en lista y **`crear-contenido-drawer.js`**.
- `contenidos.html` solo enlaza / normaliza hacia `crear-contenido.html`.

### Fuente de verdad
**`crear-contenido.html`** es la única ruta de creación en el template; cualquier doc o QA debe partir de ahí.

---

## 2. Principios de implementación

| Principio | Detalle |
|-----------|---------|
| Evolución | *(Histórico)* Durante el corte se comparó con el prototipo embebido; hoy la referencia es **solo** la página dedicada. |
| Paridad producto | La página debe cumplir pasos, portada, recursos, validaciones, índice, etc., según `contexto-creacion-contenido.md` y acuerdos vigentes. |
| CSS por página | **`crear-contenido.css`** para el shell y overrides; reglas compartidas de workspace en `contenidos.css` vía clase en `body` (ver checklist §6). |
| JS | **`crear-contenido.js`**: listeners en el DOM de la página (`#crear-contenido-root` / ids del HTML), sin `openDrawer` para este flujo. |
| Rutas | Desde subcarpeta `lms-creator/`, imports `../../components/...`, `../../general-styles/...` como el resto del Creator. |

### Nombres de archivos (cerrados en Fase 0)
- `ubits-colaborador/lms-creator/crear-contenido.html`
- `ubits-colaborador/lms-creator/crear-contenido.css`
- `ubits-colaborador/lms-creator/crear-contenido.js` (lógica del flujo en página; el antiguo `crear-contenido-drawer.js` fue eliminado en el corte)

---

## 3. Fases y puntos de aprobación (visto bueno)

**Regla:** al terminar cada fase marcada con **APROBACIÓN**, tú (PM/UX) abrís la página o el entorno indicado, validáis que coincide con la experiencia actual o con el criterio de esa fase, y solo entonces se continúa.

---

### Fase 0 — Acuerdos de alcance y nombres (sin código o solo esqueleto vacío)

**Decisiones cerradas (PM — esta iteración)**

1. **Nombre del HTML:** `crear-contenido.html` (junto a `crear-contenido.css` / `crear-contenido.js` en la misma carpeta `lms-creator/`).
2. **Chrome de navegación:** **sin SubNav ni Sidebar** en esta página. Solo el **contenido central** del asistente (shell propio).
3. **Header y footer full-bleed:** el **fondo** (background) del header y del footer ocupa el **ancho completo del viewport**; el **contenido** interno (título, cerrar/volver, acciones del footer) va en contenedor con padding / max-width. Implementación: `crear-contenido.css` (`.crear-contenido-shell`, bandas header/footer). Referencia visual histórica: criterio similar al componente Drawer en `components/drawer.css` (solo inspiración, no dependencia).
4. **URLs con hashtags:** **sí**. En **`crear-contenido.html`** el paso Recursos usa **`#recursos`**; Portada **`#portada`** o sin hash (legacy `#crear-contenido` → `#portada`). Alias largos → **`#recursos`**. Desde **`contenidos.html`**, hashes legacy de la antigua URL embebida redirigen a `crear-contenido.html` con hash canónico.

**Entregables (checklist Fase 0)**
- [x] Nombre final de archivos: `crear-contenido.html`, `crear-contenido.css`, `crear-contenido.js`.
- [x] Layout: sin SubNav ni Sidebar; solo contenido central + header/footer full-width en background.
- [x] Hashes en la nueva URL: mantener para navegación entre pasos.
- [x] *(Histórico Fase 0)* No tocar `contenidos.html` en la primera iteración — **superado** por el corte: `contenidos.html` solo enlaza y redirige; `crear-contenido-drawer.js` eliminado.

**Criterio de aprobación**  
Checklist verbal/documentado arriba completado.

**APROBACIÓN:** Sí / No — comentarios: _______________________

---

### Fase 1 — Esqueleto de página en blanco + CSS vacío (cero lógica de negocio)

**Entregables**
- [x] Crear `crear-contenido.html` con:
  - DOCTYPE, `lang`, meta viewport, favicon coherente con LMS Creator.
  - Imports base UBITS: `ubits-colors.css`, `styles.css`, `fontawesome-icons.css`, `ubits-typography.css`.
  - **Sin** SubNav, Sidebar ni TabBar (Fase 0).
  - Contenedor raíz vacío o con un título placeholder **sin** copiar aún el markup completo del flujo.
  - Link a `crear-contenido.css` **al final** del `<head>`.
- [x] Crear `crear-contenido.css` con solo comentario de sección y, si aplica, clase raíz en `body` o wrapper (p. ej. `body` + clase `.crear-contenido-root` según convención que se use en Fase 2).
- [x] **No** enlazar desde `contenidos.html` todavía (opcional: enlace oculto en comentario HTML solo para dev — mejor no tocar `contenidos.html` en absoluto en esta fase).

**Criterio de aprobación**  
Abrís `crear-contenido.html` en el navegador: carga sin errores 404 de CSS/JS críticos; página en blanco o mínima aceptable.

**APROBACIÓN:** Sí / No — comentarios: _______________________

---

### Fase 2 — Maquetación estática pantalla completa (sin JS del flujo)

**Entregables**
- [x] En `crear-contenido.html`, estructura **visual** pantalla completa del asistente:
  - **Header:** banda **100% viewport** de fondo; interior con título “Crear contenido”, acción cerrar/volver (enlace a `contenidos.html` **solo** en esta página).
  - **Main:** área scrollable, ancho del contenido acotado al “canvas” del flujo (sin sidebar).
  - **Footer:** banda **100% viewport** de fondo; interior con zona Anterior / Siguiente (puede ser estático o deshabilitado).
- [x] En `crear-contenido.css`, layout con tokens UBITS: altura viewport, flex column, footer pegado abajo, **full-bleed** en header/footer (criterio alineado a `components/drawer.css` como referencia + reglas bajo **`.crear-contenido-drawer-overlay`** en `contenidos.css` para workspace; clases del shell: `.crear-contenido-shell`, etc.).
- [x] **No** copiar aún stepper funcional ni pasos 1–2 con datos; puede ser un bloque “Paso 1 (placeholder)”.
- [x] **No modificar** `contenidos.css` salvo que sea estrictamente necesario; preferir todo en `crear-contenido.css`.

**Criterio de aprobación**  
**Marco general** de la página dedicada (cabecera/footer a ancho completo, proporciones del cuerpo, scroll en columna central) alineado con diseño / producto y con `contexto-creacion-contenido.md`.

**APROBACIÓN:** Sí / No — comentarios: _______________________

---

### Fase 3 — Markup del flujo en la página (IDs en scope nuevo)

**Entregables**
- [x] En `crear-contenido.html`, HTML de portada, stepper, paso recursos, etc., con **IDs / prefijos únicos** en la página (p. ej. namespace coherente con el HTML actual).
  - Mismos componentes UBITS (button, input, stepper, modal, etc.) vía rutas relativas.
- [x] *(Histórico)* La fuente temporal del markup fue el antiguo script embebido ya **eliminado**; la fuente de verdad viva es **`crear-contenido.html`**.

**Criterio de aprobación**  
La página muestra **los bloques** del flujo (stepper, portada, área paso 2, etc.); el cableado JS puede venir en Fase 4.

**APROBACIÓN:** Sí / No — comentarios: _______________________

---

### Fase 4 — JS dedicado en la página (`crear-contenido.js`)

**Entregables**
- [x] Crear `crear-contenido.js` que en `DOMContentLoaded` monte listeners sobre el **DOM de la página** (root e ids del HTML), **no** sobre `openDrawer`.
- [x] Ajustar selectores/IDs al namespace de la página.
- [x] Pasos, hashes y validaciones según `contexto-creacion-contenido.md` y `crear-contenido.js` vigente.
- [x] Sincronizar **hashes** (`#portada`, `#recursos`, alias → canónico; legacy `#crear-contenido` → `#portada`).

**Criterio de aprobación**  
Flujo usable en **`crear-contenido.html`** (portada, recursos, títulos, índice, etc.) sin depender de UI embebida en lista.

**APROBACIÓN:** Sí / No — comentarios: _______________________

---

### Fase 5 — Paridad fina (QA) y documentación

**Entregables**
- [x] Lista de verificación manual (marcar en este archivo o en issue):
  - [x] Portada: campos obligatorios, miniatura, RTE, ficha. *(Implementado en `crear-contenido.js`; verificación manual / firma PM.)*
  - [x] Paso Recursos: índice, páginas, título grande, Resources block, validación títulos, empty state, tooltips.
  - [x] Footer Anterior/Siguiente, stepper clickeable, URL/hash.
  - [x] Modo oscuro / tokens. *(Tokens UBITS; probar `data-theme="dark"` en body.)*
  - [x] Responsive (breakpoints críticos acordados). *(Reglas compartidas con `contenidos.css` + header 639px en `crear-contenido.css`.)*
  - [x] Z-index: dropdowns/menús por encima del shell — **`body.crear-contenido-app-open`** en `crear-contenido.html` + reglas en `crear-contenido.css`.
- [x] Actualizar `contexto-creacion-contenido.md` con subsección **«Implementación en página dedicada»** (rutas, assets, QA, z-index).
- [x] **README (raíz):** inventario LMS Creator y contexto enlazan **cómo abrir** `crear-contenido.html` para QA.

**Criterio de aprobación**  
PM firma lista de verificación sobre la **página dedicada**. *(Entregables técnicos listos; firma PM pendiente.)*

**APROBACIÓN:** Sí / No — comentarios: _______________________

---

### Fase 6 — Entrada de usuario (histórica; sustituida por el corte)

**Entregables originales (Fase 6 antes del corte)**
- [x] Segunda acción «Vista página completa» + flujo embebido en lista. *(Obsoleto.)*

**Estado tras el corte**
- [x] Un solo botón primario **«Crear contenido»** en `contenidos.html` → `crear-contenido.html` (misma pestaña).
- [x] Sin flujo de creación embebido en lista; sin `crear-contenido-drawer.js`.

**Criterio de aprobación**  
Navegación clara hacia **`crear-contenido.html`**; un solo flujo de creación en el playground.

**APROBACIÓN:** Sí / No — comentarios: _______________________

---

## 4. Corte — lista `contenidos.html` sin flujo embebido (ejecutado)

**Cuándo:** tras acordar que `crear-contenido.html` es la ruta oficial.

**Checklist (completado)**
- [x] Botón «Crear contenido» solo abre la página dedicada.
- [x] Eliminado el flujo embebido en `contenidos.html` y su JS; limpieza de CSS que solo servía a esa variante. Se **mantienen** en `contenidos.css` los selectores bajo **`.crear-contenido-drawer-overlay`** porque el **`body`** de `crear-contenido.html` aún usa ese nombre de clase como **hook** compartido de layout (ver `contexto-creacion-contenido.md` — no es el componente Drawer).
- [x] Eliminado `crear-contenido-drawer.js`; lógica en `crear-contenido.js`.
- [x] Mapeos en `sub-nav.js` / `floating-menu.js` para `crear-contenido.html` → contexto contenidos.

---

## 5. Riesgos y mitigación

| Riesgo | Mitigación |
|--------|------------|
| Duplicación de JS (lista vs página) | Resuelta en el corte: un solo archivo `crear-contenido.js`. |
| IDs duplicados si misma sesión abre ambas vistas | Namespace `cc-page-*` en la página nueva. |
| Reglas CSS conflictivas | Todo lo nuevo bajo prefijo del shell (p. ej. `.crear-contenido-shell`) en `crear-contenido.css`. |
| Paso 4 con overlay anidado en shell incorrecto | Resuelto al usar página dedicada como contenedor principal del asistente. |

### 5.1 Bug ya visto (no repetir): `<a>` con clases de Button y `box-sizing`

Al maquetar el header (Fase 2), el alto del botón de cierre **no** coincidía con el de un `<button>` UBITS equivalente (~65px vs ~86px). La causa **no** era solo flex/gap: el **cierre** es un **enlace** (`<a href="contenidos.html">`) con las mismas clases que un botón UBITS (`ubits-button`, `sm`, `icon-only`).

| Qué pasa | Detalle |
|----------|---------|
| **Síntoma** | El enlace “botón” mide **más alto** de lo esperado; el **flex** del header adopta ese alto y la cabecera se infla. |
| **Por qué** | En `components/button.css`, `height` (p. ej. **32px** en `sm`) está pensada como **alto total** del control. Los `<button>` suelen acabar comportándose como **`border-box`** en la práctica. Un `<a class="ubits-button">` puede seguir en **`content-box`**: entonces `height: 32px` aplica solo al **contenido** y el **padding vertical se suma** por fuera (~51px de alto real), no 32px. |
| **Corrección** | En `crear-contenido.css`, en el selector del cierre (p. ej. `.crear-contenido-shell__header > .ubits-button`), añadir **`box-sizing: border-box`** para que `height` y padding cuadren como en un **`<button>`** nativo con las mismas clases. Alternativa: usar `<button type="button">` + navegación por JS si no debe ser enlace nativo. |
| **Regla para quien implemente** | Si en **cualquier página** se reutilizan clases de `button.css` en un **`<a>`**, no dar por hecho que el tamaño coincide con `<button>`: comprobar modelo de caja o fijar `border-box` en ese contexto. `button.css` no fuerza `box-sizing` globalmente sobre enlaces. |

---

## 6. Checklist rápido (post-corte)

Antes de cada PR/commit que toque el flujo crear contenido, verificar:

- [ ] `contenidos.html` — botón «Crear contenido» → `crear-contenido.html`; redirección de hashes legacy si se cambian rutas.
- [ ] `crear-contenido.js` / `crear-contenido.html` — imports y rutas relativas correctos desde `lms-creator/`.
- [ ] `contenidos.css` — no eliminar reglas bajo `.crear-contenido-drawer-overlay` / `crear-contenido-recursos-*` que usa la **página** `crear-contenido.html` (clase histórica en body).
- [ ] Nuevos archivos referenciados correctamente desde la página dedicada.
- [ ] Si hay **`<a class="ubits-button">`**: `box-sizing: border-box` en CSS de página o verificar alto (ver §5.1).

---

## 7. Historial de aprobaciones (rellenar)

| Fecha | Fase | Aprobado por | Notas |
|-------|------|----------------|-------|
| 2026-04-14 | 0 | PM (pendiente firma) | Nombres `crear-contenido.*`; sin SubNav/Sidebar; header/footer full-bleed; hashes OK. |
| 2026-04-14 | 1 | PM (pendiente QA) | `crear-contenido.html` + `crear-contenido.css` esqueleto; sin tocar `contenidos.html`. |
| 2026-04-14 | 2 | PM (pendiente QA) | Shell `.crear-contenido-shell` (header/main/footer full-bleed); placeholder paso 1; enlace a `contenidos.html`; sin cambios en `contenidos.css`. |
| | 3 | | |
| | 4 | | |
| 2026-04-14 | 5 | PM (pendiente firma) | QA doc: `contexto-creacion-contenido.md` + README; `crear-contenido-app-open` (z-index dropdowns); checklist en plan. |
| 2026-04-14 | 6 | PM (pendiente firma) | *(Obsoleto)* Idea de segunda entrada + drawer en lista — sustituido por un solo CTA a página dedicada (ver §3 Fase 6). |
| 2026-04-14 | Corte | PM (pendiente firma) | Lista sin flujo embebido; `crear-contenido.html` oficial; eliminado `crear-contenido-drawer.js`; hashes legacy redirigen; sub-nav/floating-menu mapean `crear-contenido.html`. |

---

*Documento generado como guía de implementación. Última actualización: flujo real solo en página dedicada; §4 corte aplicado; checklist §6; redacción alineada sin “drawer” como UI paralela de creación.*
