# Plan de implementación — Mi equipo (temporal)

> Checklist ordenado para completar el flujo sin cascarones rotos. Borrar o archivar cuando el módulo esté terminado y migrado a React.

**Referencia de calidad:** cada paso debe dejar navegación, drawers, modales y toasts funcionando de punta a punta antes de pasar al siguiente.

---

## Fase 0 — Fundación ✅

- [x] Carpeta `mi-equipo/` creada.
- [x] `mi-equipo-context.js` con líder demo y `getMiEquipoSubordinadosDirectos()`.
- [x] SubNav + Floating menu: ítem **Mi equipo** después de Zona de estudio.
- [x] `PAGE_TO_TAB` y `getPageKeyForSubNav()` para rutas `mi-equipo/*`.
- [x] `contexto-mi-equipo.md` (este documento hermano).

---

## Fase 1 — Lista unificada ✅

**Archivo:** `planes.html` + `planes.css`

- [x] Layout colaborador estándar.
- [x] Header Product `tabs-with-actions`: Contenidos | Competencias.
- [x] `createUbitsDataTable` con `getData()` filtrado por tab.
- [x] Empty state distinto por tab.
- [x] Crear plan → URL según tab.
- [x] Clic fila / menú ⋮ con reglas Creator (editar vs detalle).
- [x] Stubs enlazados (no 404).

**Verificar:**

- [x] Cambiar tab no deja tooltips rotos (re-init tooltip tras refresh).
- [x] `?tab=competencias` abre tab correcto.
- [x] Eliminar plan actualiza tabla y toast.

---

## Fase 2 — Mock data compartido ✅

**Archivo nuevo:** `mi-equipo-planes-mock.js`

1. Exportar en `window.MI_EQUIPO_PLANES_DB`:
   - Array único de planes (contenidos + competencias).
   - Por plan: asignaciones limitadas a subordinados E035–E040.
   - Por asignación: contenidos o competencias mock (índices catálogo).
2. Helpers: `getPlanById(id)`, `getPlanesByTipo(tipo)`, mutaciones en memoria para demo.
3. Importar en **todas** las páginas del módulo (sustituir arrays inline de `planes.html`).

**Criterio de done:** editar un plan en memoria se refleja al volver a la lista sin recargar (opcional: `sessionStorage` snapshot).

---

## Fase 3 — Crear plan de contenidos ✅

**Archivo:** `crear-plan-contenidos.html` + `crear-plan-contenidos.css`

**Referente:** `lms-creator/planes-formacion/crear-plan-contenidos.html`

### 3.1 Estructura

- Header Product: título «Crear plan de contenidos», back → `planes.html`.
- Secciones: nombre, fechas (calendar + `createInput`), tabla asignaciones.

### 3.2 Asignaciones (DIFF crítico)

- Drawer **Agregar asignación** con stepper **Participantes → Contenidos** (mismo patrón que LMS Creator y `editar-plan-contenidos.html`):
  - Paso 1: solo `drawer-usuarios-panel--colaborador`; lista **todos** los subordinados (`getMiEquipoColaboradoresParaDrawer()`), incluidos ya asignados.
  - Paso 2: catálogo de contenidos (`attachWizardContenidosPaso2`, `idPrefix` `drawer-wiz`).
  - Al confirmar: nuevas filas con contenidos **o** `mergeContenidosEnAsignacion()` si la persona ya tenía fila → refresh tabla → toast.
- Primary en tabla: «Agregar asignación» → `abrirDrawerAgregarUsuarios()`.
- **Eliminar** tabs empresa / grupos / archivo del HTML y JS.
- **Eliminar** drawer monopaso `drawer-mi-equipo-agregar-asignacion` (UX antigua).

### 3.3 Contenidos por fila (edición puntual)

- Clic en botón «X contenidos» / «Agregar contenidos» de una fila → drawer solo contenidos (`drawer-editplan`, sin stepper).
- Reutilizar `abrirDrawerAgregarCursos` + preload de contenidos ya asignados (mismo patrón que editar).

### 3.4 Guardar

- Botón primary «Crear plan» (Header o footer widget).
- Validaciones mínimas: nombre, fechas, ≥1 asignación.
- Toast éxito → redirect `planes.html` o `editar-plan-contenidos.html?id=nuevo` si estado Procesando.

### 3.5 Checklist conexiones

- [x] Drawer colaboradores lista solo 6 personas Fiqsha logística.
- [x] Wizard stepper Participantes → Contenidos al agregar asignación (paridad Creator / editar).
- [x] Editar contenidos por fila abre drawer y persiste en mock.
- [x] Volver atrás no pierde datos (opcional dirty modal).
- [x] Links desde `planes.html` «Crear plan» abren esta página completa.

---

## Fase 4 — Crear plan de competencias ✅

**Archivo:** `crear-plan-competencias.html` + `crear-plan-competencias.css`

**Referente:** `lms-creator/planes-formacion/crear-plan-competencias.html`

Misma estructura que Fase 3, con:

- [x] Campo horas por competencia si aplica en referente.
- [x] Drawer competencias (`catalogo-competencias-drawer.js`).
- [x] Drawer asignación: **solo subordinados directos**.
- [x] Back → `planes.html?tab=competencias`.
- [x] Guardar en `MI_EQUIPO_PLANES_DB` (`competenciaPorUsuario`, E035–E040).

---

## Fase 5 — Editar plan de contenidos ✅

**Archivo:** `editar-plan-contenidos.html` + `editar-plan-contenidos.css`

**Referente:** `lms-creator/planes-formacion/editar-plan-contenidos.html`

- [x] Cargar plan por `?id=` desde `MI_EQUIPO_PLANES_DB`.
- [x] Header: «Editar plan de contenidos», back → lista, primary **Guardar** (disabled hasta dirty).
- [x] Menú Acciones ⋮ (eliminar plan, etc.) como referente.
- [x] Asignaciones: mismo drawer subordinados-only.
- [x] Animación «Procesando X%» en tag si aplica al guardar nuevas asignaciones.
- [x] Regla salir sin guardar (modal) si hay cambios.
- [x] Guardar con `updateMiEquipoPlan` + `persistMiEquipoPlanesDb`.

---

## Fase 6 — Editar plan de competencias ✅

**Archivo:** `editar-plan-competencias.html` + `editar-plan-competencias.css`

**Referente:** `lms-creator/planes-formacion/editar-plan-competencias.html`

- [x] Paridad con Fase 5 + drawers de competencias/habilidades del referente.
- [x] Back → `planes.html?tab=competencias`.
- [x] Carga/guarda vía `MI_EQUIPO_PLANES_DB`; Guardar disabled hasta dirty; modal salir sin guardar.
- [x] Menú ⋮ (recordatorio, eliminar plan); redirect a detalle si No vigente.

---

## Fase 7 — Detalle plan contenidos (vista progreso) ✅

**Archivo:** `detalle-plan.html` + `detalle-plan.css`

**Referente:** `lms-creator/planes-formacion/detalle-plan.html` **post-fix** (jun 2026):

- [x] Card progreso + botón Acciones (`fa-angle-down`).
- [x] Tabla asignaciones: recordatorio masivo; **sin** asignar/eliminar contenidos en Vigente/No vigente.
- [x] Clic fila → drawer **solo lectura** (`abrirPanelContenidos`) si Vigente o No vigente.
- [x] Acciones → Editar plan → Fase 5.
- [x] Asignaciones mock solo con nombres/avatares de subordinados reales (BD).

---

## Fase 8 — Detalle plan competencias ✅

**Archivo:** `detalle-plan-competencias.html` + `detalle-plan-competencias.css`

**Referente:** `detalle-plan-competencias.html` con mismas reglas de solo lectura en detalle.

- [x] Card progreso + Acciones (Editar plan, recordatorio, eliminar).
- [x] Vigente/No vigente: clic fila → drawer solo lectura con progreso por competencia.
- [x] Sin asignar/eliminar competencias en detalle Vigente/No vigente.
- [x] Recordatorio masivo en action bar; datos desde `competenciaPorUsuario` (E035–E040).

---

## Fase 9 — CSS y dependencias ✅

1. [x] `mi-equipo-planes-formacion.css` — `@import` de `lms-creator.css` + `planes-formacion.css` + checklist en cabecera (no duplicar CSS Creator completo).
2. [x] Comentario checklist en `planes.html` + documentación en `contexto-mi-equipo.md` §7.
3. [x] `catalogo-*-drawer.js` importados desde `../../lms-creator/planes-formacion/` en todas las pantallas que los usan.
4. [x] `initMiEquipoLayout()` + mock en las 8 páginas HTML del módulo.

---

## Fase 10 — Documentación y navegación ✅

- [x] Actualizar `Referente-Vanilla/README.md` (sección Aprendizaje + patrón Mi equipo).
- [x] Entrada en `bd-master/README.md` mapa de páginas Mi equipo.
- [ ] Validador UBITS: pasar `planes.html` y una página editar (manual — `documentacion/validador-ubits.html`).

---

## Fase 11 — Migración React (fuera de vanilla)

Ver `contexto-mi-equipo.md` §9. Orden sugerido en `Ubits-React/`:

1. SubNav aprendizaje + ruta `/mi-equipo/planes`.
2. Página lista con tabs HeaderProduct.
3. Hook `useMiEquipoSubordinados(leaderId)`.
4. Portar flujos crear → editar → detalle reutilizando componentes ya portados de LMS Creator.

---

## Orden de ejecución recomendado

```
Fase 2 → 3 → 5 → 7 → 4 → 6 → 8 → 9 → 10
```

(Creator contenidos primero porque competencias reutiliza el patrón de asignaciones.)

---

## Anti-patrones (no hacer)

- ❌ Reutilizar Sidebar/SubNav **creator** en Mi equipo.
- ❌ Mostrar las 4 opciones de asignación del admin.
- ❌ Dos HTML de lista separados (contenidos vs competencias).
- ❌ Copiar JS sin cablear drawers (cascarón con placeholder permanente).
- ❌ Hardcodear nombres de colaboradores: siempre filtrar desde `BD_MASTER_COLABORADORES`.
- ❌ Edición inline en detalle Vigente (solo lectura + Acciones → Editar).

---

## Definition of Done (módulo completo)

- [x] Líder demo crea plan contenidos, asigna solo a E035–E040, asigna cursos, guarda, ve progreso en detalle.
- [x] Mismo flujo competencias.
- [x] Editar plan Vigente desde Acciones; detalle fila solo lectura.
- [x] Eliminar plan/asignaciones con modal «eliminar».
- [x] Recordatorio demo (toast) en detalle.
- [x] SubNav + floating menu coherentes en todas las pantallas.
- [x] `contexto-mi-equipo.md` actualizado con cualquier desviación documentada.
