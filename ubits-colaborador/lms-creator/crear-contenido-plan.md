# Plan: Crear contenido en página dedicada (réplica de la experiencia actual)

**Estado:** guía de trabajo — no sustituye acuerdos de producto.  
**Ubicación sugerida del plan:** `ubits-colaborador/lms-creator/crear-contenido-plan.md`

---

## 1. Objetivo y restricciones (lectura obligatoria)

### Objetivo
Tener **una página HTML aparte** (misma apariencia “pantalla completa” que hoy el drawer) para el flujo **Crear contenido**, **sin** usar el componente **drawer** (`openDrawer`), de modo que en el **paso 4** se pueda usar un **drawer real** sin anidar drawers.

### Restricción crítica (hasta nuevo aviso)
- **No modificar, no borrar ni “simplificar”** la experiencia actual embebida en `contenidos.html` + `crear-contenido-drawer.js` + estilos asociados en `contenidos.css` (y cualquier cable que abra el drawer desde lista).
- **Solo añadir archivos nuevos** y, cuando haga falta enlazar, preferir **nuevos enlaces o rutas** que apunten a la página nueva **sin quitar** el comportamiento viejo (hasta fase de corte acordada con PM).

### Meta final (fuera del alcance inmediato de este plan)
Eliminar por completo la experiencia drawer desde `contenidos.html` cuando PM/UX den el OK. Eso será **una fase posterior explícita**; **no** forma parte de las fases de réplica descritas aquí como obligatorias.

---

## 2. Principios de implementación

| Principio | Detalle |
|-----------|---------|
| Comparación | La experiencia “vieja” (drawer) sigue intacta para comparar lado a lado. |
| Réplica visual/funcional | La página nueva debe comportarse **igual** (pasos, portada, recursos, validaciones, índice, etc.) salvo decisiones explícitas documentadas abajo. |
| CSS por página | La página nueva tiene **su propio** `crear-contenido-page.css` (o nombre cerrado en Fase 0); **no** mezclar reglas nuevas dentro de `contenidos.css` si pueden vivir en el CSS de la página (salvo tokens/variables globales ya existentes). |
| JS | Preferir **nuevo archivo** que monte el flujo en modo “página” (`root` en DOM) sin tocar la API del drawer hasta una fase de refactor opcional. |
| Rutas | Desde subcarpeta `lms-creator/`, imports `../../components/...`, `../../general-styles/...` como el resto del Creator. |

### Nombres tentativos (ajustar en Fase 0 si PM prefiere otros)
- `ubits-colaborador/lms-creator/crear-contenido-page.html`
- `ubits-colaborador/lms-creator/crear-contenido-page.css`
- `ubits-colaborador/lms-creator/crear-contenido-page.js` (lógica de la vista página; puede importar o duplicar patrones de `crear-contenido-drawer.js` **sin editar** ese archivo al inicio)

---

## 3. Fases y puntos de aprobación (visto bueno)

**Regla:** al terminar cada fase marcada con **APROBACIÓN**, tú (PM/UX) abrís la página o el entorno indicado, validáis que coincide con la experiencia actual o con el criterio de esa fase, y solo entonces se continúa.

---

### Fase 0 — Acuerdos de alcance y nombres (sin código o solo esqueleto vacío)

**Entregables**
- [ ] Nombre final de archivos (`crear-contenido-page.*` vs `crear-contenido.*`).
- [ ] Decisión: ¿la página lleva **SubNav creator** + **Sidebar creator** igual que `contenidos.html`, o solo layout “focus” (solo contenido central)? (Afecta plantilla HTML.)
- [ ] Decisión: URL de entrada provisional: `crear-contenido-page.html` accesible por doble clic / Netlify; hashes `#crear-contenido` / `#crear-contenido-recursos` ¿se mantienen en la nueva URL?
- [ ] Confirmación explícita: **no se toca** `contenidos.html` ni `crear-contenido-drawer.js` en esta fase.

**Criterio de aprobación**  
Checklist verbal/documentado arriba completado.

**APROBACIÓN:** Sí / No — comentarios: _______________________

---

### Fase 1 — Esqueleto de página en blanco + CSS vacío (cero lógica de negocio)

**Entregables**
- [ ] Crear `crear-contenido-page.html` con:
  - DOCTYPE, `lang`, meta viewport, favicon coherente con LMS Creator.
  - Imports base UBITS: `ubits-colors.css`, `styles.css`, `fontawesome-icons.css`, `ubits-typography.css`.
  - Imports de navegación según decisión Fase 0 (SubNav, Sidebar, TabBar, etc. — solo si aplican).
  - Contenedor raíz vacío o con un título placeholder **sin** copiar aún el body del drawer.
  - Link a `crear-contenido-page.css` **al final** del `<head>`.
- [ ] Crear `crear-contenido-page.css` con solo comentario de sección y, si aplica, clase raíz `.crear-contenido-page` para el `body` o wrapper.
- [ ] **No** enlazar desde `contenidos.html` todavía (opcional: enlace oculto en comentario HTML solo para dev — mejor no tocar `contenidos.html` en absoluto en esta fase).

**Criterio de aprobación**  
Abrís `crear-contenido-page.html` en el navegador: carga sin errores 404 de CSS/JS críticos; página en blanco o mínima aceptable.

**APROBACIÓN:** Sí / No — comentarios: _______________________

---

### Fase 2 — Maquetación estática “tipo drawer fullscreen” (sin JS del flujo)

**Entregables**
- [ ] En `crear-contenido-page.html`, estructura **visual** equivalente a la pantalla completa del drawer:
  - Cabecera (título “Crear contenido”, acción cerrar/volver si aplica — puede ser `<button>` inerte o enlace a `contenidos.html` **solo en la página nueva**).
  - Área body scrollable.
  - Footer fijo con zona para botones “Anterior” / “Siguiente” (contenido puede ser estático o deshabilitado).
- [ ] En `crear-contenido-page.css`, layout con tokens UBITS (`var(--ubits-*)`, spacing): altura viewport, flex column, footer pegado abajo, **misma sensación** que `.crear-contenido-drawer-overlay` pero aplicado al wrapper de página (clases nuevas, p. ej. `.crear-contenido-page-shell`).
- [ ] **No** copiar aún stepper funcional ni pasos 1–2 con datos; puede ser un bloque “Paso 1 (placeholder)”.
- [ ] **No modificar** `contenidos.css` salvo que sea estrictamente necesario; preferir todo en `crear-contenido-page.css`.

**Criterio de aprobación**  
Comparación visual lado a lado: abrir drawer en `contenidos.html` y la nueva página — **marco general** (cabecera, proporciones, footer) alineado con tolerancia razonable de PM.

**APROBACIÓN:** Sí / No — comentarios: _______________________

---

### Fase 3 — Réplica HTML del contenido del drawer (markup + IDs en scope nuevo)

**Entregables**
- [ ] Pegar/adaptar en la página nueva el **mismo HTML** que genera el cuerpo del drawer (portada, stepper, paso recursos, etc.) desde `getCrearContenidoBodyHtml()` / estructura actual, con estos matices:
  - **Prefijos o IDs únicos** si hace falta evitar colisión al abrir `contenidos` en la misma sesión (ideal: namespace `cc-page-` para IDs en la página nueva).
  - Mismos componentes CSS/JS referenciados que ya usa el drawer (button, input, stepper, modal, etc.) vía rutas relativas.
- [ ] **No** eliminar ni alterar el string/HTML dentro de `crear-contenido-drawer.js`; la fuente de verdad para “copiar” es **lectura** del archivo o del DOM renderizado, pero el archivo drawer **permanece sin cambios**.

**Criterio de aprobación**  
La nueva página muestra **los mismos bloques** (stepper, formulario portada, área paso 2, etc.) que el drawer; puede estar sin cablear JS.

**APROBACIÓN:** Sí / No — comentarios: _______________________

---

### Fase 4 — JS dedicado: modo “página” (nuevo archivo, drawer intacto)

**Entregables**
- [ ] Crear `crear-contenido-page.js` que:
  - En `DOMContentLoaded`, inicialice el flujo montando listeners sobre el **root** de la página nueva (no sobre `openDrawer`).
  - Reutilice **lógica** equivalente a la de `crear-contenido-drawer.js` mediante **copia inicial** (duplicado controlado) o extracción a un tercer archivo **nuevo** (`crear-contenido-shared.js`) que **importen** tanto el drawer como la página — **solo si** se acuerda no editar `crear-contenido-drawer.js` en la primera iteración: entonces **duplicar** en `crear-contenido-page.js` y documentar deuda técnica para unificar después.
- [ ] Ajustar selectores/IDs al namespace de la página nueva (`OVERLAY_ID` → contenedor raíz de página, etc.).
- [ ] Comportamiento esperado: mismos pasos, mismo hash si se definió en Fase 0, mismas validaciones que ya tenéis en el drawer **en la medida replicable**.
- [ ] **Cero cambios** en `crear-contenido-drawer.js` en esta fase (salvo bug de seguridad acordado).

**Criterio de aprobación**  
Flujo usable en `crear-contenido-page.html` **igual** al del drawer (crear desde cero, pasos, recursos, títulos, etc.), comparando con el drawer en `contenidos.html`.

**APROBACIÓN:** Sí / No — comentarios: _______________________

---

### Fase 5 — Paridad fina (QA) y documentación

**Entregables**
- [ ] Lista de verificación manual (marcar en este archivo o en issue):
  - [ ] Portada: campos obligatorios, miniatura, RTE, ficha.
  - [ ] Paso Recursos: índice, páginas, título grande, Resources block, validación títulos, empty state, tooltips.
  - [ ] Footer Anterior/Siguiente, stepper clickeable, URL/hash.
  - [ ] Modo oscuro / tokens.
  - [ ] Responsive (breakpoints críticos acordados).
  - [ ] Z-index: dropdowns/menús por encima del shell de página (equivalente a lo resuelto con `body.crear-contenido-drawer-abierto` → nueva clase `body.crear-contenido-page` o similar **solo en la página nueva**).
- [ ] Actualizar `contexto-creacion-contenido.md` con una subsección **“Implementación en página dedicada”** (ruta del HTML, nombre del JS/CSS) **sin** borrar la descripción del prototipo drawer hasta corte final.
- [ ] **Opcional (no tocar contenidos):** añadir en README del creator o en doc interna **cómo abrir** la página nueva para QA (ruta relativa).

**Criterio de aprobación**  
PM firma lista de verificación; no hay regresiones respecto al drawer en los ítems marcados.

**APROBACIÓN:** Sí / No — comentarios: _______________________

---

### Fase 6 — Entrada de usuario (solo cuando PM lo pida; sigue sin borrar drawer)

**Entregables**
- [ ] Desde la UI que corresponda (p. ej. botón “Crear contenido” en `contenidos.html`), **añadir** enlace o segunda acción que abra `crear-contenido-page.html` **en la misma pestaña o nueva** — **sin** quitar el comportamiento actual del drawer hasta decisión explícita.
- [ ] O mantener **solo** documentación para abrir la página manualmente hasta el corte.

**Nota:** Si esta fase **modifica** `contenidos.html`, debe ser **solo adición** (nuevo botón o menú “Probar nueva experiencia”) para no romper la comparación. PM puede pedir **no tocar** `contenidos.html` hasta después de Fase 5.

**Criterio de aprobación**  
Navegación clara hacia la página nueva; la experiencia drawer sigue disponible.

**APROBACIÓN:** Sí / No — comentarios: _______________________

---

## 4. Fase futura (explícita — NO ejecutar hasta acuerdo)

### “Corte” — eliminar drawer de `contenidos.html`

**Cuándo:** después de aprobación PM y de que la página nueva sea la ruta oficial.

**Tareas típicas (referencia, no ejecutar ahora)**
- [ ] Redirigir botón “Crear contenido” solo a la página nueva.
- [ ] Eliminar HTML/JS/CSS del drawer en `contenidos.html` y reglas solo usadas por el drawer en `contenidos.css`.
- [ ] Deprecar o eliminar `crear-contenido-drawer.js` o fusionar con `crear-contenido-page.js` / shared.
- [ ] Actualizar enlaces en sidebar/sub-nav si apuntaban al flujo viejo.

---

## 5. Riesgos y mitigación

| Riesgo | Mitigación |
|--------|------------|
| Duplicación de JS (drawer vs página) | Aceptado hasta corte; documentar deuda; unificar en fase posterior. |
| IDs duplicados si misma sesión abre ambas vistas | Namespace `cc-page-*` en la página nueva. |
| Reglas CSS conflictivas | Todo lo nuevo bajo `.crear-contenido-page` / shell propio. |
| Paso 4 con drawer anidado | Resuelto al no usar drawer en el contenedor principal de esta experiencia. |

---

## 6. Checklist rápido “no romper lo existente”

Antes de cada PR/commit de este plan, verificar:

- [ ] `contenidos.html` — sin eliminaciones de la experiencia drawer (salvo Fase 6 explícita y acordada).
- [ ] `crear-contenido-drawer.js` — sin cambios no acordados.
- [ ] `contenidos.css` — sin borrar bloques `crear-contenido-drawer-*` / `crear-contenido-recursos-*` usados por el drawer.
- [ ] Nuevos archivos referenciados correctamente desde la página nueva.

---

## 7. Historial de aprobaciones (rellenar)

| Fecha | Fase | Aprobado por | Notas |
|-------|------|----------------|-------|
| | 0 | | |
| | 1 | | |
| | 2 | | |
| | 3 | | |
| | 4 | | |
| | 5 | | |
| | 6 | | |

---

*Documento generado como guía de implementación. Última actualización: creación del archivo.*
