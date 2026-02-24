# Plan de reemplazo: panel viejo → task-detail (página nueva)

Documento temporal para ir conectando cada punto de acceso al detalle de tarea con la nueva página **task-detail.html** (vista inmersiva con subtareas, comentarios e historial), en lugar del panel lateral/modal viejo (**task-detail-overlay** + **task-detail-panel**).

---

## Estado actual

- **Panel viejo:** overlay + panel que se rellena con `getTaskDetailPanelHTML()` (componente `task-detail-panel.js`). Se usa en **tareas.html**, **plan-detail.html**, **seguimiento.html** y **seguimiento-leader.html** (este último usa el mismo JS que seguimiento).
- **Página nueva:** **task-detail.html** + **task-detail.js** (subtareas, comentarios, historial). Por ahora usa mocks; cuando se conecte, leerá `?id=X` y llamará a `TAREAS_PLANES_DB.getTaskDetail(X)`.

---

## Mapeo de puntos de acceso

| # | Vista / archivo | Cómo se abre el detalle hoy | Dónde está el código | Id de la tarea |
|---|-----------------|-----------------------------|----------------------|----------------|
| 1 | **tareas.html** | Clic en botón "Detalles" (chevron) o clic en la fila (nombre/etiqueta) de una tarea | `tareas.js`: `handleTaskClick(tareaId)` (línea ~2014); delegación en lista sobre `.tarea-action-btn--details` y `.tarea-item` | `tareaId` del `data-tarea-id` de la tarea en vencidas o porDia |
| 2 | **plan-detail.html** | Clic en botón "Detalles" o clic en la fila de una tarea del plan | `plan-detail.js`: `openTaskDetailPanel(task)` (línea ~83); en `handlePlanDetailListClick` (líneas ~569 y ~581-587) | `task.id` |
| 3 | **seguimiento.html** | Clic en el texto "Nombre de la tarea" (fila de la tabla) cuando la fila es tipo `tarea` | `seguimiento.js`: `openTaskDetailPanelSeguimiento(row)` (línea ~856); delegación en tabla que busca `row.tipo === 'tarea'` y llama con `row` (líneas ~1198-1206) | `row.id` (id de la tarea en actividadesSeguimiento) |
| 4 | **seguimiento-leader.html** | Mismo que seguimiento (usa el mismo `seguimiento.js`) | Mismo que #3 | `row.id` |

---

## Archivos implicados (resumen)

- **HTML con markup del panel viejo:** `tareas.html` (overlay + panel), `plan-detail.html` (overlay + panel), `seguimiento.html` (overlay + panel). `seguimiento-leader.html` no declara el overlay en el snippet que vi; revisar si lo incluye por fragmento o por JS.
- **CSS del panel viejo:** `components/task-detail-panel.css` (referenciado desde tareas, plan-detail, seguimiento).
- **JS del panel viejo:** `components/task-detail-panel.js` (getTaskDetailPanelHTML; usado por tareas.js, plan-detail.js, seguimiento.js para rellenar el panel).
- **Página nueva:** `ubits-colaborador/tareas/task-detail.html`, `task-detail.js`, `task-detail.css`.

---

## Plan de implementación (uno a uno)

Cada ítem es un paso independiente para que puedas revisar y dar feedback antes de seguir.

---

### Paso 1 — Conectar **tareas.html** / **tareas.js**

**Objetivo:** Que desde la vista Tareas, al hacer clic en "Detalles" o en la fila de la tarea, se abra la página **task-detail.html** con `?id=<tareaId>` en lugar de abrir el panel.

**Cambios:**

1. En **tareas.js**, en `handleTaskClick(tareaId)`:
   - En lugar de asignar `estadoTareas.selectedTask`, `estadoTareas.showTaskDetail = true`, etc. y llamar a `renderTaskDetailModal()`:
   - Navegar a `task-detail.html?id=` + `tareaId` (por ejemplo `window.location.href = 'task-detail.html?id=' + encodeURIComponent(tareaId)`; ajustar ruta si se invoca desde otra carpeta).
2. Opcional en este paso: ocultar o no cargar el markup del panel en **tareas.html** (dejar el overlay/panel comentado o eliminado cuando confirmes que ya no se usa).
3. Opcional: dejar de incluir `task-detail-panel.js` y `task-detail-panel.css` en tareas.html cuando ya no se use el panel.

**Criterio de revisión:** Desde tareas.html, al hacer clic en una tarea (botón Detalles o fila), se abre task-detail.html con el id correcto en la URL. Revisar que el id sea el correcto (vencidas y porDia).

---

### Paso 2 — Conectar **plan-detail.html** / **plan-detail.js**

**Objetivo:** Que desde Detalle de plan, al hacer clic en "Detalles" o en la fila de una tarea, se abra **task-detail.html?id=&lt;task.id&gt;** en lugar del panel.

**Cambios:**

1. En **plan-detail.js**, donde se llama a `openTaskDetailPanel(task)` (botón Detalles y clic en fila):
   - Reemplazar por navegación a `task-detail.html?id=` + `task.id` (misma consideración de ruta relativa: plan-detail está en la misma carpeta que task-detail.html, por tanto `'task-detail.html?id=' + encodeURIComponent(task.id)`).
2. Opcional en este paso: comentar o eliminar el markup del overlay/panel en **plan-detail.html** y las referencias a `task-detail-panel.js` / `task-detail-panel.css` cuando confirmes que ya no se usa.

**Criterio de revisión:** Desde plan-detail, al hacer clic en una tarea del plan, se abre task-detail.html con el id de esa tarea en la URL.

---

### Paso 3 — Conectar **seguimiento.html** (y **seguimiento-leader.html**) / **seguimiento.js**

**Objetivo:** Que desde la tabla de seguimiento, al hacer clic en la fila de una **tarea** (Nombre de la tarea), se abra **task-detail.html?id=&lt;row.id&gt;** en lugar del panel.

**Cambios:**

1. En **seguimiento.js**, en el handler que hace `openTaskDetailPanelSeguimiento(row)` cuando `row.tipo === 'tarea'` (alrededor de líneas 1204-1206):
   - Reemplazar la llamada por navegación a `task-detail.html?id=` + `row.id` (desde seguimiento.html la ruta a task-detail es `task-detail.html?id=...` si están en la misma carpeta).
2. Todas las demás llamadas a `openTaskDetailPanelSeguimiento(row)` en seguimiento.js (tras cerrar dropdowns de prioridad, asignado, rol, etc.): en lugar de reabrir el panel, pueden:
   - O bien navegar de nuevo a task-detail.html?id=row.id (para que se vea el detalle actualizado),  
   - O bien simplemente cerrar el dropdown y no abrir nada (el usuario puede volver a hacer clic en la fila si quiere ver el detalle). Decidir según el flujo que prefieras.
3. Opcional: comentar o eliminar el markup del overlay/panel en **seguimiento.html** y **seguimiento-leader.html** (si lo tienen) y las referencias a task-detail-panel cuando ya no se use.

**Criterio de revisión:** Desde seguimiento (y seguimiento-leader), al hacer clic en el nombre de una tarea, se abre task-detail.html con el id de esa tarea. Comportamiento después de cambiar prioridad/asignado/rol según lo que hayas elegido en el punto 2.

---

### Paso 4 — Conectar **task-detail.html** / **task-detail.js** con la BD

**Objetivo:** Que al abrir task-detail.html con `?id=X`, la página cargue los datos con `TAREAS_PLANES_DB.getTaskDetail(X)` y rellene la vista (tarea, subtareas, comentarios, actividades). Si no hay id o no hay datos, mantener el comportamiento actual con mocks o mostrar un mensaje.

**Cambios:**

1. En **task-detail.html**, asegurar que se carga **tareas-base-unificada.js** antes de **task-detail.js** (para tener `TAREAS_PLANES_DB.getTaskDetail` disponible).
2. En **task-detail.js**, en `initTaskDetailPage()` (o antes de renderizar):
   - Leer el id de la URL (por ejemplo `window.location.search`, parámetro `id`).
   - Si hay id y existe `window.TAREAS_PLANES_DB` y `TAREAS_PLANES_DB.getTaskDetail(id)` devuelve datos, usar ese objeto para rellenar `estado.task`, `estado.subtasks`, `estado.comments`, `estado.activities`.
   - Si no hay id o no hay datos, seguir usando los mocks como hasta ahora (o mostrar empty state / mensaje “Tarea no encontrada” si lo defines).
3. Ajustar si hace falta la forma del objeto que devuelve `getTaskDetail` para que coincida con lo que esperan los render (nombre de campos: p. ej. `created_at` en task, etc.).

**Criterio de revisión:** Abrir task-detail.html?id=10001 (o un id que exista en la BD) y ver la tarea, subtareas, comentarios e historial cargados desde la BD. Abrir sin id o con id inexistente y ver el fallback acordado.

---

### Paso 5 — Limpieza del panel viejo (opcional y al final)

**Objetivo:** Quitar código y recursos del panel viejo cuando todas las vistas estén usando task-detail.html.

**Cambios:**

1. Quitar de **tareas.html**, **plan-detail.html**, **seguimiento.html** (y **seguimiento-leader.html** si aplica):
   - El markup `<div id="task-detail-overlay">` y `<div id="task-detail-panel">`.
   - Las referencias a `task-detail-panel.css` y `task-detail-panel.js`.
2. En **tareas.js**, **plan-detail.js**, **seguimiento.js**:
   - Eliminar o comentar las funciones que solo servían al panel: `renderTaskDetailModal`, `openTaskDetailPanel`, `openTaskDetailPanelSeguimiento`, `closeTaskDetailPanelSeguimiento`, y la lógica de rellenado del panel (getTaskDetailPanelHTML, listeners del panel).
   - Eliminar estado asociado al panel (por ejemplo `estadoTareas.showTaskDetail`, `planDetailTaskDetailState`, `seguimientoTaskDetailState`) si ya no se usa para nada más.
3. Decisión de producto: si se mantiene el componente **task-detail-panel.js** (y su CSS) para otro uso futuro o se elimina. Si se elimina, borrar o archivar `components/task-detail-panel.js` y `components/task-detail-panel.css`.

**Criterio de revisión:** No queden referencias rotas al panel; las cuatro vistas solo abren task-detail.html; no queden scripts ni estilos huérfanos que afecten al resto de la app.

---

## Orden sugerido

1. **Paso 4** (opcional hacerlo antes): Conectar task-detail con la BD para que al probar los pasos 1–3 la página nueva ya muestre datos reales.
2. **Paso 1** — Tareas.
3. **Paso 2** — Plan detail.
4. **Paso 3** — Seguimiento (y seguimiento-leader).
5. **Paso 5** — Limpieza cuando todo esté validado.

Si prefieres probar solo la navegación primero, se pueden hacer los pasos 1, 2 y 3 antes que el 4; task-detail seguiría mostrando mocks hasta conectar la BD.

---

## Rutas a task-detail.html

- Desde **tareas.html** (ubits-colaborador/tareas/): `task-detail.html?id=...` (misma carpeta).
- Desde **plan-detail.html** (ubits-colaborador/tareas/): `task-detail.html?id=...` (misma carpeta).
- Desde **seguimiento.html** (ubits-colaborador/tareas/): `task-detail.html?id=...` (misma carpeta).
- Desde **seguimiento-leader.html** (ubits-colaborador/tareas/): `task-detail.html?id=...` (misma carpeta).

Todas están en la misma carpeta, así que la ruta relativa es siempre `task-detail.html?id=...`.

---

*Documento temporal. Se puede borrar o archivar cuando el reemplazo esté cerrado y la limpieza hecha.*
