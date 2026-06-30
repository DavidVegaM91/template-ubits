# Contexto — Módulo Tareas y Planes (Vanilla)

Documento de referencia para entender **cada vista HTML**, cómo se relacionan entre sí, qué datos consumen y qué reglas de producto/mock aplican. Evita duplicar lógica o confundir scopes (Mi lista vs Planes vs Seguimiento HR vs Seguimiento líder).

**Historial de cambios de producto:** `Changelog-planes-y-tareas.md`  
**Fuente de datos única:** `../../bd-master/bd-tareas-y-planes.js` → API global `TAREAS_PLANES_DB`  
**Colaboradores (55):** `../../bd-master/bd-master-colaboradores.js` → cargar **siempre antes** que `bd-tareas-y-planes.js`

---

## 1. Empresa y usuario simulado

| Concepto | Valor |
|----------|--------|
| Empresa | **Fiqsha Decoraciones S.A.S.** |
| Colaboradores | 55 (8 áreas + gerencia) |
| Usuario que abre el módulo | **María Alejandra Sánchez Pardo** — Jefe de Logística (`USUARIO_ACTUAL` en la BD) |
| Reportes directos de María | 6 colaboradores de Logística (ver `getReportesDirectos`) |

María es **jefe de área** en Mi lista y Planes. En **Seguimiento** (`seguimiento.html`) se simula rol **HR** (ve toda la empresa). En **Seguimiento líder** (`seguimiento-leader.html`) se simula otro jefe (p. ej. Fernando Castro) con scope de reportes.

---

## 2. Modelo mental: tres capas

```
┌─────────────────────────────────────────────────────────────┐
│  CAPA 1 — BD canónica (generación al cargar el script)      │
│  bd-tareas-y-planes.js: tareas, planes, actividadesSeguimiento │
└───────────────────────────┬─────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────────┐
│ Vista personal│   │ Vista planes  │   │ Vista seguimiento │
│ tareas.html   │   │ planes.html   │   │ seguimiento*.html │
│ plan-detail   │   │ plan-detail   │   │ (tabla densa)     │
│ task-detail   │   │               │   │                   │
└───────────────┘   └───────────────┘   └───────────────────┘
```

- **No hay APIs reales.** Todo es mock determinista (seeds).
- **No duplicar arrays** en JS de página: usar getters de `TAREAS_PLANES_DB`.
- **Estados en UI:** display `Por hacer` / `Finalizada` / `Vencida` (tareas); planes usan `Activo`/`Finalizado`/`Vencido` internamente en cards y se mapean a status tags.

---

## 3. Reglas de datos (implementación actual)

Documentadas en cabecera de `bd-tareas-y-planes.js`. Resumen operativo:

### 3.1 Tareas por persona y mes

| Tipo | Cantidad | ¿Aparece en seguimiento? | ¿Aparece en Mi lista? |
|------|----------|--------------------------|------------------------|
| Individuales | 10/mes | **No** | Sí |
| Grupales (asignadas a la persona) | ~3–5/mes* | Sí | Sí |
| Sueltas sin plan | ~0–1 | Depende | Sí |

\* Las **20 tareas grupales del mes** pertenecen al **plan del área** (`TAREAS_GRUPALES_POR_AREA_MES = 20`), repartidas round-robin entre miembros del área. Cada empleado recibe solo las suyas en `getTareasVistaTareas`, no 20 completas.

### 3.2 Planes

| Tipo | Regla |
|------|--------|
| **Individuales (María)** | 3/mes; tareas agrupadas **3 + 3 + 4 = 10** (`TAMANOS_GRUPOS_INDIVIDUALES`) |
| **Grupal de área** | 1/mes por área, nombre `Plan {Área} MM/YYYY`, **20 tareas totales** del equipo |
| **Empresa (RH)** | `Objetivos Qx 20xx`, `Encuestas Qx 20xx` — 1 tarea/persona/mes del trimestre |

### 3.3 Estados de tareas

- Reparto por mes: **70–85% Finalizadas**, **10–20% Por hacer**, **5–15% Vencidas** (`repartoEstadosCount`).
- **Fechas futuras:** ~95% Por hacer, ~5% Finalizada (realismo).
- En seguimiento el estado se llama **`Por hacer`**, no «Iniciada» (copy de producto).
- Status tag en seguimiento: `Por hacer` → variante **`info`**, `Finalizada` → `success`, `Vencida` → `error`.

### 3.4 Estados de planes (`derivePlanStatus`)

El estado del plan **depende del avance real** (`tasksDone/tasksTotal`) y la fecha límite. **Nunca** Finalizado con avance &lt; **65%**.

| Condición | Estado plan (UI) | `finished` (planes.html) |
|-----------|------------------|---------------------------|
| `end_date` &gt; hoy | Activo (Por hacer) | `false` → sección **En curso** |
| Avance &lt; 65% y fecha pasada | Vencido | `false` → **En curso** |
| Avance ≥ 100% | Finalizado | `true` → sección **Finalizado** |
| Avance 65–99%, fecha pasada | Reparto seed 70–85% Finalizado / 10–20% Activo / 5–15% Vencido | según resultado |

**Importante:** la sección «Finalizado» en `planes.html` solo lista planes con `finished: true`. Los **Vencidos** viven en **En curso** (no en Finalizado).

### 3.5 Fechas

- `INICIO_RANGO`: fijo (1 ene 2025).
- `FIN_RANGO`: **hoy + 5 días laborables** (lun–vie).
- Solo días laborables (`toWeekdayInMonth`).

### 3.6 Scope de `getPlanesVistaPlanes()` (vista Planes de María)

**No** devuelve todos los planes de Fiqsha. Solo:

1. Planes **individuales** de María (`planesIndividualesMaria`, ids `ind-*`).
2. Plan **grupal de Logística** (`Plan Logística MM/YYYY`).
3. Planes **Objetivos** y **Encuestas** (participación empresa).

Seguimiento HR sigue usando `getActividadesSeguimiento()` → **todos** los planes/tareas grupales de la empresa.

---

## 4. API pública `TAREAS_PLANES_DB`

| Método | Uso principal |
|--------|----------------|
| `getUsuarioActual()` | María; avatar, área, username |
| `getTareasVistaTareas()` | `{ vencidas, porDia }` para **tareas.html** |
| `getPlanesVistaPlanes()` | Lista de planes **scope María** → **planes.html**, dropdowns |
| `getPlanDetalle(planId)` | Metadatos del plan → **plan-detail.html** |
| `getTareasPorPlan(planId)` | Tareas del plan → **plan-detail.html** |
| `getActividadesSeguimiento()` | Filas tarea + plan → **seguimiento.html** (HR, empresa completa) |
| `getActividadesParaLider(nombre)` | Subset por reportes directos → **seguimiento-leader.html** |
| `getTaskDetail(taskId)` | `{ task, subtasks, comments, activities }` → **task-detail.html** |
| `getTodayString()` | Fecha «hoy» coherente en todo el módulo |
| `getEmpleadosEjemplo()` / `getJefesEjemplo()` | Assignees, drawers, autocompletados |
| `getReportesDirectos(nombre)` | Mi lista (vista líder) y filtros |
| `TASK_ID_PROTO_APRENDIZAJE*` | Tareas demo tipo aprendizaje en Mi lista |

---

## 5. Vistas HTML — detalle por pantalla

### 5.1 `tareas.html` — Mi lista

| | |
|--|--|
| **Layout** | Estándar producto: sidebar + SubNav + TabBar |
| **Clase body** | `page-tareas` |
| **JS/CSS** | `tareas.js`, `tareas.css` + **`planes.js`** (drawers crear plan/plantilla/tarea compartidos) |
| **BD** | `getTareasVistaTareas()` |
| **Rol simulado** | Colaborador/líder (**personal**) |

**Qué muestra**

- Bloque **vencidas** (6 fijas de semana anterior para María + otras del mock).
- Calendario **por día laborable** (hoy → `FIN_RANGO`): tareas del día.
- **Vista líder:** por día, ~1 tarea por reporte directo + 1 propia + 1 de la jefa (Patricia / Gerencia).
- Filtros (drawer), panel lateral de detalle rápido, tirilla `task-strip`.
- Tareas **individuales + grupales asignadas a María**; no incluye tareas grupales de otros empleados.
- Prototipos **aprendizaje** (`TASK_ID_PROTO_APRENDIZAJE*`) inyectados en días concretos.

**Navegación**

- Clic tarea → `task-detail.html?id=…`
- Drawers crear → lógica en `planes.js`
- Coachmark primera visita: `coachmark-seguimiento.js`

**Reglas UX**

- Vencidas ordenadas de más antigua a más reciente.
- Marcar vencida como finalizada → animación al final de la lista.
- Checkbox tarea: pendientes arriba, finalizadas abajo.

---

### 5.2 `planes.html` — Listado de planes

| | |
|--|--|
| **Layout** | Estándar producto |
| **Clase body** | `page-planes` |
| **JS/CSS** | `planes.js`, `planes.css` |
| **BD** | `getPlanesVistaPlanes()` |
| **Rol simulado** | María — **solo sus planes** (ver §3.6) |

**Qué muestra**

- Dos bloques: **En curso** y **Finalizado**.
- Tabs **Grupales / Individuales** en cada bloque.
- Cards con status tag, `tasksDone/tasksTotal`, barra de progreso.
- Paginación client-side.

**Contadores En curso**

- Por hacer (`status === 'Activo'`)
- Vencidos (`status === 'Vencido'`) — ojo: siguen en En curso, no en Finalizado.

**Navegación**

- Clic card → `plan-detail.html?id={planId}`
- Header product → Crear plan / plantilla / tarea (drawers en `planes.js`)

**IDs de plan**

- Individuales: `ind-*`
- Grupales/empresa: numéricos ≥ `50000`

---

### 5.3 `plan-detail.html` — Detalle de un plan

| | |
|--|--|
| **Layout** | Estándar producto |
| **JS/CSS** | `plan-detail.js`, `plan-detail.css`, `planes.js` (drawers) |
| **BD** | `getPlanDetalle(id)` + `getTareasPorPlan(id)` |
| **URL** | `?id={planId}` |

**Qué muestra**

- Card plan: título, descripción, creador, avatars asignados, vencimiento, status, progreso.
- Lista de tareas (`task-strip`): contadores Por hacer / Vencidas / Finalizadas.
- Filtro por asignado (planes grupales), búsqueda, agregar tarea inline.
- Botón **Finalizar plan** (oculto si plan ya Finalizado).

**Orden de tareas**

- Pendientes primero; **finalizadas al final** (animación al marcar checkbox).

**Navegación**

- Clic tarea → `task-detail.html?id=…&from=plan-detail`
- Volver → `planes.html`

---

### 5.4 `task-detail.html` — Detalle de tarea

| | |
|--|--|
| **Layout** | **Inmersivo** (`layout-immersive`) — header fijo, scroll en main |
| **JS/CSS** | `task-detail.js`, `task-detail.css` |
| **BD** | `getTaskDetail(id)` |
| **URL** | `?id={taskId}` (+ `&from=plan-detail` opcional) |

**Qué muestra**

- Info tarea: asignado, fechas, prioridad, plan, tipo (incl. **aprendizaje** con card contenido).
- **Subtareas** (lista + enlace a subtarea).
- Timeline **comentarios + historial** mezclados.
- Drawers: cambiar plan, assignee, etc.

**Navegación**

- Subtarea → `subtask-detail.html`
- Plan → `plan-detail.html`
- Volver según `from` o historial

**Datos ricos**

- Subtareas, comentarios y actividades solo si la tarea está en `taskDetallePorId` (generadas en BD). Si no, fallback desde `actividadesSeguimiento` sin subtareas/comentarios.

---

### 5.5 `subtask-detail.html` — Detalle de subtarea

| | |
|--|--|
| **Layout** | Inmersivo |
| **JS/CSS** | `subtask-detail.js`, `subtask-detail.css` |
| **BD** | `getTaskDetail(taskId)` → busca subtarea por id en `subtasks` |
| **URL** | Parámetros de tarea + subtarea |

Subtareas **no** son tareas ni planes independientes en seguimiento; solo existen colgadas de la tarea madre.

---

### 5.6 `seguimiento.html` — Seguimiento HR

| | |
|--|--|
| **Layout** | Estándar producto |
| **JS/CSS** | `seguimiento.js`, `seguimiento.css`, **`planes.js`** (drawers) |
| **BD** | `getActividadesSeguimiento()` — **empresa completa** |
| **Scope** | Sin `SEGUIMIENTO_SCOPE` → HR / visión global |

**Qué muestra**

- Indicadores: Total, Finalizadas/Finalizados, Por hacer, Vencidas/Vencidos (`formatIndicatorNumber`).
- Tabs **Tareas | Planes** (misma tabla, columnas distintas).
- Tabla densa con filtros por columna, chips bajo indicadores, selección múltiple, acciones masivas.
- Paginación «Cargar más» (`SEGUIMIENTO_LOAD_MORE_SIZE = 50`).

**Filas**

| `tipo` | Origen | Ejemplo |
|--------|--------|---------|
| `tarea` | Tareas **grupales** (+ Objetivos/Encuestas) | Una fila por tarea asignada |
| `plan` | Agregado por nombre de plan | Avance = % tareas finalizadas del plan |

**Estados en tabla (status tag)**

```js
// seguimiento.js — alineado con componente status-tag
{ 'Por hacer': 'info', 'Vencida': 'error', 'Finalizada': 'success' }
```

**Navegación**

- Nombre tarea → `task-detail.html`
- Nombre plan → `plan-detail.html`

**No incluye**

- Tareas **individuales** privadas (solo las grupales van a seguimiento).

---

### 5.7 `seguimiento-leader.html` — Seguimiento jefe de área

| | |
|--|--|
| **Misma UI** | Idéntica a `seguimiento.html` (mismo `seguimiento.js`) |
| **CSS extra** | `seguimiento-leader.css` (si aplica overrides) |
| **BD** | `getActividadesParaLider(SEGUIMIENTO_CURRENT_LEADER)` |

**Configuración antes de scripts**

```html
<script>
  window.SEGUIMIENTO_SCOPE = 'leader';
  window.SEGUIMIENTO_CURRENT_LEADER = 'Fernando Castro Restrepo'; // demo: jefe Ventas
</script>
```

**Scope**

- Tareas asignadas a **reportes directos** del líder.
- Planes donde **algún asignado** es reporte directo.
- **No** es el mismo scope que Planes de María ni que Seguimiento HR.

---

### 5.8 `plantilla.html` — Plantillas de plan

| | |
|--|--|
| **Layout** | Estándar producto |
| **JS/CSS** | `plantilla.css`, reutiliza **`planes.js`** |
| **BD** | Empleados para miembros; plantillas en cliente |

Pantalla auxiliar del flujo **Crear plantilla** (drawer compartido). Mismos drawers de creación que Planes/Seguimiento.

---

### 5.9 `mails/` — Recordatorios (HTML estático)

Plantillas de correo de recordatorio (`mail-recordatorio-*.html`). **No** consumen `TAREAS_PLANES_DB`; son referencia visual para el flujo de «Enviar recordatorio» en tirillas y seguimiento.

---

## 6. JS compartidos (no son «vistas», pero acoplan todo)

| Archivo | Rol |
|---------|-----|
| **`planes.js`** | Drawers **Crear plan**, **Crear plantilla**, **Nueva tarea**; usado en tareas, planes, plan-detail, seguimiento, plantilla. Exporta helpers (`getPlanesParaTaskCreateDrawer`, etc.). |
| **`components/task-strip.js`** | Tirilla de tarea (checkbox, fecha, prioridad, opciones). Usado en tareas, plan-detail. |
| **`coachmark-seguimiento.js`** | Onboarding primera visita (tareas + seguimiento). |

**Orden típico de scripts**

1. `bd-master-colaboradores.js`
2. `bd-tareas-y-planes.js`
3. `planes.js` (si hay drawers)
4. JS de la página (`tareas.js`, `seguimiento.js`, …)

---

## 7. Mapa de navegación

```
tareas.html ──task──► task-detail.html ──subtask──► subtask-detail.html
     │                      │
     │                      └──plan──► plan-detail.html
     │
planes.html ──card──► plan-detail.html ──task──► task-detail.html
                           │
                           └──back──► planes.html

seguimiento.html ──nombre──► task-detail.html | plan-detail.html
seguimiento-leader.html (mismo JS, distinto scope BD)
```

---

## 8. Matriz vista ↔ getter BD

| Vista | Getter(s) | Alcance datos |
|-------|-----------|---------------|
| `tareas.html` | `getTareasVistaTareas` | Solo María (+ lógica líder por día) |
| `planes.html` | `getPlanesVistaPlanes` | María: individuales + Logística + Objetivos/Encuestas |
| `plan-detail.html` | `getPlanDetalle`, `getTareasPorPlan` | Un plan por `id` (aunque HR llegue desde seguimiento) |
| `task-detail.html` | `getTaskDetail` | Una tarea por `id` |
| `seguimiento.html` | `getActividadesSeguimiento` | **Toda Fiqsha** (tareas grupales + planes) |
| `seguimiento-leader.html` | `getActividadesParaLider` | Reportes del líder configurado |

---

## 9. Errores comunes (lecciones aprendidas)

1. **Confundir scope Planes vs Seguimiento:** Planes ≠ catálogo HR. `getPlanesVistaPlanes` filtra por María; seguimiento no.
2. **Plan grupal ≠ 20 × empleados:** Un plan de área tiene **20 tareas totales** repartidas; el card debe mostrar ~20, no 140–180.
3. **Estado plan vs avance:** No asignar Finalizado por seed ignorando `tasksDone/tasksTotal`. Usar `derivePlanStatus`.
4. **Finalizado al 5%:** Prohibido en mock; mínimo **65%** para cerrar como Finalizado.
5. **100% estricto dejó 0 planes finalizados en seguimiento:** Con avance típico 70–85%, hace falta reparto seed **después** de validar avance mínimo, no exigir 100% siempre.
6. **«Iniciadas» vs «Por hacer»:** En datos y UI del módulo el estado es **`Por hacer`**; status tag **`info`**.
7. **Vencidos en Planes:** Van en sección **En curso**, no en Finalizado (`finished: false`).
8. **Tareas individuales en seguimiento:** No deben aparecer; si aparecen, bug de generación o filtro.
9. **Duplicar BD en React:** Portar cambios en `bd-tareas-y-planes.js` y ejecutar `npm run sync:bd-master` en `Ubits-React`.

---

## 10. Equivalente React (referencia cruzada)

| Vanilla | React (`Ubits-React/pages/ubits-colaborador/tareas/`) |
|---------|------------------------------------------------------|
| `tareas.html` | `index.tsx` |
| `planes.html` | `planes.tsx` |
| `plan-detail.html` | `plan-detail.tsx` |
| `task-detail.html` | `task-detail.tsx` |
| `subtask-detail.html` | `subtask-detail.tsx` |
| `seguimiento.html` | `seguimiento.tsx` |
| `seguimiento-leader.html` | *(pendiente o misma ruta con prop scope)* |

Mock: `Ubits-React/lib/mockData/bd-tareas-y-planes.ts` (generado/sync desde vanilla).

---

## 11. Archivos del módulo (inventario)

| Archivos | Tipo |
|----------|------|
| `tareas.html`, `tareas.js`, `tareas.css` | Mi lista |
| `planes.html`, `planes.js`, `planes.css` | Planes |
| `plan-detail.html`, `plan-detail.js`, `plan-detail.css` | Detalle plan |
| `task-detail.html`, `task-detail.js`, `task-detail.css` | Detalle tarea |
| `subtask-detail.html`, `subtask-detail.js`, `subtask-detail.css` | Detalle subtarea |
| `seguimiento.html`, `seguimiento.js`, `seguimiento.css` | Seguimiento HR |
| `seguimiento-leader.html`, `seguimiento-leader.css` | Seguimiento líder |
| `plantilla.html`, `plantilla.css` | Plantillas |
| `coachmark-seguimiento.js`, `coachmark-seguimiento.css` | Onboarding |
| `Changelog-planes-y-tareas.md` | Backlog/historial |
| **`contexto-tareas-planes.md`** | **Este documento** |
| `tarea-contenido-temp.md` | Notas tareas tipo aprendizaje |
| `mails/*` | HTML recordatorios |

---

*Última revisión alineada con generador BD post-fix: planes scope María, 20 tareas/plan grupal, `derivePlanStatus` con piso 65%.*
