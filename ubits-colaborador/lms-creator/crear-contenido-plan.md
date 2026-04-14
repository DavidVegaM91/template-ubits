# Plan: Crear contenido en página dedicada (réplica de la experiencia actual)

**Estado:** guía de trabajo — no sustituye acuerdos de producto.  
**Ubicación sugerida del plan:** `ubits-colaborador/lms-creator/crear-contenido-plan.md`  
**Corte aplicado (2026-04):** la lista `contenidos.html` ya no embebe el flujo en drawer; la ruta oficial es `crear-contenido.html` + `crear-contenido.js`; `crear-contenido-drawer.js` fue eliminado.

---

## 1. Objetivo y restricciones (lectura obligatoria)

### Objetivo
Tener **una página HTML aparte** (misma apariencia “pantalla completa” que hoy el drawer) para el flujo **Crear contenido**, **sin** usar el componente **drawer** (`openDrawer`), de modo que en el **paso 4** se pueda usar un **drawer real** sin anidar drawers.

### Restricción crítica (histórica — vigente hasta el corte)
- ~~**No modificar, no borrar ni “simplificar”** la experiencia embebida en `contenidos.html` + `crear-contenido-drawer.js`…~~ **Cumplido y cerrado:** el corte eliminó el drawer de lista y el archivo `crear-contenido-drawer.js`.
- La lista redirige hashes legacy (`#crear-contenido`, etc.) a `crear-contenido.html`; el botón **«Crear contenido»** abre la página dedicada.

### Meta final
**Hecha:** la experiencia drawer desde `contenidos.html` fue retirada; `crear-contenido.html` es la ruta única para crear desde el playground del template.

---

## 2. Principios de implementación

| Principio | Detalle |
|-----------|---------|
| Comparación | *(Histórico)* Drawer en lista para comparar lado a lado; tras el corte solo queda la página dedicada. |
| Réplica visual/funcional | La página nueva debe comportarse **igual** (pasos, portada, recursos, validaciones, índice, etc.) salvo decisiones explícitas documentadas abajo. |
| CSS por página | La página nueva tiene **su propio** `crear-contenido.css`; **no** mezclar reglas nuevas dentro de `contenidos.css` si pueden vivir en el CSS de la página (salvo tokens/variables globales ya existentes). |
| JS | Preferir **`crear-contenido.js`** que monte el flujo en modo “página” (`root` en DOM) sin tocar la API del drawer hasta una fase de refactor opcional. |
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
2. **Chrome de navegación:** **sin SubNav ni Sidebar** en esta página. Solo el **contenido central** del flujo (equivalente al cuerpo del drawer).
3. **Header y footer “como drawer”:** el **fondo** (background) del header y del footer debe ocupar el **ancho completo del viewport** (full-bleed), igual que en el componente drawer. El **contenido** interno (título, botón cerrar, acciones del footer) puede ir en un contenedor alineado al ancho útil del flujo (padding / max-width según diseño), pero las **bandas** superior e inferior se extienden de borde a borde. En Fase 2 se implementa en `crear-contenido.css` con estructura tipo: fila header full-width → capa interior; `main` scrollable; fila footer full-width → capa interior.
4. **URLs con hashtags:** **sí**. En **`crear-contenido.html`** el paso Recursos usa hash corto **`#recursos`**; Portada **`#portada`** o sin hash (legacy `#crear-contenido` → normalizado a `#portada`). Alias largos se normalizan a `#recursos`. Desde **`contenidos.html`**, los hashes legacy del antiguo drawer redirigen a `crear-contenido.html` con el hash canónico.

**Entregables (checklist Fase 0)**
- [x] Nombre final de archivos: `crear-contenido.html`, `crear-contenido.css`, `crear-contenido.js`.
- [x] Layout: sin SubNav ni Sidebar; solo contenido central + header/footer full-width en background.
- [x] Hashes en la nueva URL: mantener para navegación entre pasos.
- [x] Confirmación: **no se toca** `contenidos.html` ni `crear-contenido-drawer.js` en esta fase (solo documentación del plan).

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
  - Contenedor raíz vacío o con un título placeholder **sin** copiar aún el body del drawer.
  - Link a `crear-contenido.css` **al final** del `<head>`.
- [x] Crear `crear-contenido.css` con solo comentario de sección y, si aplica, clase raíz en `body` o wrapper (p. ej. `body` + clase `.crear-contenido-root` según convención que se use en Fase 2).
- [x] **No** enlazar desde `contenidos.html` todavía (opcional: enlace oculto en comentario HTML solo para dev — mejor no tocar `contenidos.html` en absoluto en esta fase).

**Criterio de aprobación**  
Abrís `crear-contenido.html` en el navegador: carga sin errores 404 de CSS/JS críticos; página en blanco o mínima aceptable.

**APROBACIÓN:** Sí / No — comentarios: _______________________

---

### Fase 2 — Maquetación estática “tipo drawer fullscreen” (sin JS del flujo)

**Entregables**
- [x] En `crear-contenido.html`, estructura **visual** equivalente a la pantalla completa del drawer:
  - **Header:** banda **100% viewport** de fondo; interior con título “Crear contenido”, acción cerrar/volver (enlace a `contenidos.html` **solo** en esta página).
  - **Main:** área scrollable, ancho del contenido acotado al “canvas” del flujo (sin sidebar).
  - **Footer:** banda **100% viewport** de fondo; interior con zona Anterior / Siguiente (puede ser estático o deshabilitado).
- [x] En `crear-contenido.css`, layout con tokens UBITS: altura viewport, flex column, footer pegado abajo, **full-bleed** en header/footer (referencia visual: header/footer del drawer en `components/drawer.css` + reglas `crear-contenido-drawer-overlay` en `contenidos.css` — **solo lectura**, replicar criterio en clases nuevas, p. ej. `.crear-contenido-shell`, `.crear-contenido-shell__header-band`, `.crear-contenido-shell__footer-band`).
- [x] **No** copiar aún stepper funcional ni pasos 1–2 con datos; puede ser un bloque “Paso 1 (placeholder)”.
- [x] **No modificar** `contenidos.css` salvo que sea estrictamente necesario; preferir todo en `crear-contenido.css`.

**Criterio de aprobación**  
Comparación visual lado a lado: abrir drawer en `contenidos.html` y `crear-contenido.html` — **marco general** (cabecera/footer a ancho completo, proporciones del cuerpo) alineado con tolerancia razonable de PM.

**APROBACIÓN:** Sí / No — comentarios: _______________________

---

### Fase 3 — Réplica HTML del contenido del drawer (markup + IDs en scope nuevo)

**Entregables**
- [x] Pegar/adaptar en `crear-contenido.html` el **mismo HTML** que genera el cuerpo del drawer (portada, stepper, paso recursos, etc.) desde `getCrearContenidoBodyHtml()` / estructura actual, con estos matices:
  - **Prefijos o IDs únicos** si hace falta evitar colisión al abrir `contenidos` en la misma sesión (ideal: namespace `cc-page-` para IDs en la página nueva).
  - Mismos componentes CSS/JS referenciados que ya usa el drawer (button, input, stepper, modal, etc.) vía rutas relativas.
- [x] **No** eliminar ni alterar el string/HTML dentro de `crear-contenido-drawer.js` *(fase histórica; el archivo fue retirado en el corte)*; la fuente de verdad para “copiar” era **lectura** del archivo o del DOM renderizado.

**Criterio de aprobación**  
La nueva página muestra **los mismos bloques** (stepper, formulario portada, área paso 2, etc.) que el drawer; puede estar sin cablear JS.

**APROBACIÓN:** Sí / No — comentarios: _______________________

---

### Fase 4 — JS dedicado: modo “página” (nuevo archivo, drawer intacto)

**Entregables**
- [x] Crear `crear-contenido.js` que:
  - En `DOMContentLoaded`, inicialice el flujo montando listeners sobre el **root** de la página nueva (no sobre `openDrawer`).
  - Reutilice **lógica** equivalente a la de `crear-contenido-drawer.js` mediante **copia inicial** (duplicado controlado) o extracción a un tercer archivo **nuevo** (`crear-contenido-shared.js`) que **importen** tanto el drawer como la página — **solo si** se acuerda no editar `crear-contenido-drawer.js` en la primera iteración: entonces **duplicar** en `crear-contenido.js` y documentar deuda técnica para unificar después.
- [x] Ajustar selectores/IDs al namespace de la página nueva (`OVERLAY_ID` → contenedor raíz de página, etc.).
- [x] Comportamiento esperado: mismos pasos, mismo hash si se definió en Fase 0, mismas validaciones que ya tenéis en el drawer **en la medida replicable**.
- [x] **Cero cambios** en `crear-contenido-drawer.js` en esta fase *(histórico; archivo eliminado tras el corte)*.
- [x] Sincronizar **hashes** en `crear-contenido.html` (`#portada`, `#recursos`, alias largos → canónico `#recursos`; legacy `#crear-contenido` → `#portada`).

**Criterio de aprobación**  
Flujo usable en `crear-contenido.html` **igual** al del drawer (crear desde cero, pasos, recursos, títulos, etc.), comparando con el drawer en `contenidos.html`.

**APROBACIÓN:** Sí / No — comentarios: _______________________

---

### Fase 5 — Paridad fina (QA) y documentación

**Entregables**
- [x] Lista de verificación manual (marcar en este archivo o en issue):
  - [x] Portada: campos obligatorios, miniatura, RTE, ficha. *(Implementado en `crear-contenido.js` alineado al drawer; verificación manual / firma PM.)*
  - [x] Paso Recursos: índice, páginas, título grande, Resources block, validación títulos, empty state, tooltips.
  - [x] Footer Anterior/Siguiente, stepper clickeable, URL/hash.
  - [x] Modo oscuro / tokens. *(Tokens UBITS; probar `data-theme="dark"` en body.)*
  - [x] Responsive (breakpoints críticos acordados). *(Reglas compartidas con `contenidos.css` + header 639px en `crear-contenido.css`.)*
  - [x] Z-index: dropdowns/menús por encima del shell de página — **`body.crear-contenido-app-open`** en `crear-contenido.html` + reglas en `crear-contenido.css` (antes se comparaba con `body.crear-contenido-drawer-abierto` en lista; drawer de lista eliminado).
- [x] Actualizar `contexto-creacion-contenido.md` con subsección **«Implementación en página dedicada»** (rutas, assets, QA, z-index); el corte documenta el fin del drawer en lista.
- [x] **README (raíz):** inventario LMS Creator y contexto enlazan **cómo abrir** `crear-contenido.html` para QA.

**Criterio de aprobación**  
PM firma lista de verificación; no hay regresiones respecto al drawer en los ítems marcados. *(Entregables técnicos listos; firma PM pendiente.)*

**APROBACIÓN:** Sí / No — comentarios: _______________________

---

### Fase 6 — Entrada de usuario (histórica; sustituida por el corte)

**Entregables originales (Fase 6 antes del corte)**
- [x] Segunda acción «Vista página completa» + drawer en lista. *(Obsoleto.)*

**Estado tras el corte**
- [x] Un solo botón primario **«Crear contenido»** en `contenidos.html` → `crear-contenido.html` (misma pestaña).
- [x] Sin drawer de creación en lista; sin `crear-contenido-drawer.js`.

**Criterio de aprobación**  
Navegación clara hacia la página dedicada; sin flujo duplicado en drawer.

**APROBACIÓN:** Sí / No — comentarios: _______________________

---

## 4. Corte — drawer de `contenidos.html` (ejecutado)

**Cuándo:** tras acordar que `crear-contenido.html` es la ruta oficial.

**Checklist (completado)**
- [x] Botón «Crear contenido» solo abre la página nueva.
- [x] Eliminados HTML/JS del drawer en `contenidos.html`; limpieza de reglas solo del drawer en `contenidos.css` (se mantienen selectores `.crear-contenido-drawer-overlay` en body de `crear-contenido.html` para layout compartido con `contenidos.css`).
- [x] Eliminado `crear-contenido-drawer.js`; lógica en `crear-contenido.js`.
- [x] Mapeos en `sub-nav.js` / `floating-menu.js` para `crear-contenido.html` → contexto contenidos.

---

## 5. Riesgos y mitigación

| Riesgo | Mitigación |
|--------|------------|
| Duplicación de JS (drawer vs página) | Resuelta en el corte: un solo archivo `crear-contenido.js`. |
| IDs duplicados si misma sesión abre ambas vistas | Namespace `cc-page-*` en la página nueva. |
| Reglas CSS conflictivas | Todo lo nuevo bajo prefijo del shell (p. ej. `.crear-contenido-shell`) en `crear-contenido.css`. |
| Paso 4 con drawer anidado | Resuelto al no usar drawer en el contenedor principal de esta experiencia. |

### 5.1 Bug ya visto (no repetir): `<a>` con clases de Button y `box-sizing`

Al maquetar el header (Fase 2), el alto **no** coincidía con el drawer (~65px vs ~86px). La causa **no** era solo flex/gap: el **cierre** es un **enlace** (`<a href="contenidos.html">`) con las mismas clases que un botón UBITS (`ubits-button`, `sm`, `icon-only`).

| Qué pasa | Detalle |
|----------|---------|
| **Síntoma** | El enlace “botón” mide **más alto** de lo esperado; el **flex** del header adopta ese alto y la cabecera se infla. |
| **Por qué** | En `components/button.css`, `height` (p. ej. **32px** en `sm`) está pensada como **alto total** del control. Los `<button>` suelen acabar comportándose como **`border-box`** en la práctica. Un `<a class="ubits-button">` puede seguir en **`content-box`**: entonces `height: 32px` aplica solo al **contenido** y el **padding vertical se suma** por fuera (~51px de alto real), no 32px. |
| **Corrección** | En `crear-contenido.css`, en el selector del cierre (p. ej. `.crear-contenido-shell__header > .ubits-button`), añadir **`box-sizing: border-box`** para que `height` y padding cuadren como en el drawer (que usa `<button>`). Alternativa: usar `<button type="button">` + navegación por JS si no debe ser enlace nativo. |
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
| 2026-04-14 | 6 | PM (pendiente firma) | `contenidos.html`: botón sec. «Vista página completa» → `crear-contenido.html`; drawer intacto. |
| 2026-04-14 | Corte | PM (pendiente firma) | Lista sin drawer; `crear-contenido.html` oficial; eliminado `crear-contenido-drawer.js`; hashes legacy redirigen; sub-nav/floating-menu mapean `crear-contenido.html`. |

---

*Documento generado como guía de implementación. Última actualización: corte aplicado (§4); checklist §6 post-corte.*
