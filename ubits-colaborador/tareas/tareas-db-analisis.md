# Análisis de campos para la base de datos unificada (Tareas y Planes)

Este documento lista **todos los campos** que consumen las páginas y formularios de la carpeta `ubits-colaborador/tareas`, para diseñar una sola base de datos JS que alimente:

- `seguimiento.html` / `seguimiento-leader.html`
- `tareas.html`
- `planes.html`
- `plan-detail.html`

---

## 0. Decisiones de diseño (preguntas frecuentes)

### 1. ¿La BD tiene solo tareas de María Alejandra o de toda la empresa?
**De toda la empresa.** La base unificada contiene tareas y planes de todos los colaboradores/áreas. Así la página de **seguimiento** puede mostrar el panorama completo. La vista **tareas.html** filtra por “asignado a María Alejandra”; la vista **planes.html** filtra por “planes donde participa María Alejandra”.

### 2. ¿Qué debe mostrar tareas.html?
**Solo las tareas asignadas a María Alejandra.** Es decir: tareas donde ella es la asignada (assignee), ya sea de planes suyos, de planes grupales donde participa, o tareas sueltas asignadas a ella. El getter será algo tipo `getTareasVistaTareas()` = todas las tareas con `asignado.id === USUARIO_ACTUAL.id` (o equivalente por email/username).

### 3. ¿Fecha actual real y rango de datos?
- **Todas las vistas** usan la **fecha actual real** (`new Date()`), no un día estático simulado.
- **Rango de datos:** desde **1 de enero de 2025** hasta **31 de junio de 2026**. La generación o carga de actividades (seguimiento) y la existencia de planes/tareas deben cubrir ese rango para que el ejemplo sea realista en cualquier día “hoy” dentro del mismo.

### 4. ¿Cuándo una tarea sale en “vencidas”?
Solo cuando **la fecha de entrega ya pasó y la tarea no está completada**:  
`endDate < hoy && !done`. Si está marcada como hecha (`done === true`), no debe aparecer en vencidas aunque la fecha haya pasado.

### 5. ¿Hay planes individuales y grupales para toda la empresa?
**Sí.** La BD contempla:
- **Planes individuales:** un solo participante (el creador), para sí mismo. Existen para cualquier persona de la empresa, no solo María Alejandra.
- **Planes grupales:** varios participantes (equipo, pares, varias áreas). También para toda la empresa.

Las vistas de **planes.html** y **plan-detail.html** (cuando el usuario es María Alejandra) muestran solo los planes donde **ella participa** (individuales suyos o grupales donde está).

### 6. ¿Los planes siguen siendo agrupaciones de tareas?
**Sí.** La coherencia se mantiene: un **plan** es una agrupación de **tareas**. Cada tarea puede tener `planId` (o referencia al plan). Las tareas sin plan son “sueltas”. Al listar tareas por plan (`getTareasPorPlan(planId)`), la BD devuelve solo las tareas que pertenecen a ese plan.

### 7. ¿Los planes/tareas “solo para sí mismo” salen en seguimiento?
**No.** En la tabla de **seguimiento** solo aparecen actividades **grupales**: planes con más de un participante y tareas que pertenecen a esos planes (o asignadas en contexto grupal). Los planes y tareas creados por un usuario **solo para sí mismo, sin más participantes**, no deben listarse en seguimiento. La BD debe permitir distinguir (ej. flag `esIndividual` o `participantes.length === 1`) para que el getter `getActividadesSeguimiento()` excluya esos casos.

### 8. ¿Las vistas de detalle de plan y de tarea en seguimiento usarán esta BD?
**Sí.** Cuando se implementen las pantallas de **detalle del plan** y **detalle de la tarea** desde seguimiento, se llenarán con la misma base unificada: mismo `getPlanDetalle(planId)`, `getTareasPorPlan(planId)` y, para una tarea individual, los datos de la actividad correspondiente (por id de tarea/actividad). Así todo el ecosistema comparte una sola fuente de verdad.

---

## 1. Usuario actual (quien abre la plataforma)

| Campo        | Uso                    | Origen actual        |
|-------------|------------------------|----------------------|
| `nombre`    | Creador, asignado, UI  | María Alejandra Sánchez Pardo |
| `username`  | Filtros, búsqueda      | masanchez@fiqsha.demo |
| `avatar`    | Sidebar, tablas, cards | ../../images/Profile-image.jpg |
| `id` / `idColaborador` | Asignación, plan miembros | Ej. J005 o id numérico |

Debe ser **consistente** con el empleado en seguimiento-data (ella es Jefe de Logística).

---

## 2. Tabla de seguimiento – TAREAS (seguimiento.js)

Columnas: `id`, `nombre`, `asignado`, `creador`, `area`, `estado`, `prioridad`, `plan`, `fechaCreacion`, `fechaFinalizacion`, `comentarios`.

| Campo              | Tipo   | Uso en seguimiento |
|--------------------|--------|---------------------|
| `id`               | number | Fila, checkbox, acciones |
| `tipo`             | string | `'tarea'`          |
| `nombre`           | string | Nombre de la tarea |
| `plan`             | string | Nombre del plan al que pertenece |
| `asignado`         | object | `{ nombre, avatar, username }` |
| `idColaborador`    | string | Opcional, para reasignar |
| `area`             | string | Área del asignado   |
| `lider`            | string | Jefe del área (para vista líder) |
| `cargo`            | string | Cargo del asignado  |
| `estado`           | string | Iniciada, Vencida, Finalizada |
| `prioridad`        | string | Alta, Media, Baja   |
| `avance`           | number | 0–100 (por consistencia con plan; en tarea suele ser 0 o 100) |
| `fechaCreacion`    | string | Ej. "1 ene 2026"    |
| `fechaFinalizacion`| string | Fecha de vencimiento |
| `creador`          | string | Nombre de quien creó la tarea |
| `comentarios`      | number | Cantidad de comentarios |

Solo actividades **grupales** (donde participan otros además de María Alejandra) deben aparecer aquí.

---

## 3. Tabla de seguimiento – PLANES (seguimiento.js)

Columnas: `id`, `nombre`, `asignados`, `creador`, `estado`, `avance`, `fechaCreacion`, `fechaFinalizacion`.

| Campo              | Tipo   | Uso en seguimiento |
|--------------------|--------|---------------------|
| `id`               | number | Fila, checkbox, acciones |
| `tipo`             | string | `'plan'`           |
| `nombre`           | string | Nombre del plan     |
| `plan`             | string | Mismo que nombre    |
| `asignado`         | object | Primer asignado (para celda) |
| `asignados`        | array  | `[{ id, nombre, avatar, username }]` |
| `idColaborador`    | string | Creador del plan    |
| `area`             | string | Área del plan       |
| `lider`            | string | Jefe del área       |
| `cargo`            | string | Cargo del creador   |
| `estado`           | string | Iniciada, Vencida, Finalizada |
| `prioridad`        | string | Opcional            |
| `avance`           | number | 0–100               |
| `fechaCreacion`    | string |                     |
| `fechaFinalizacion`| string |                     |
| `creador`          | string | Nombre del creador  |
| `comentarios`      | number | Opcional            |

Solo planes **grupales** (varios participantes) en seguimiento.

---

## 4. Vista Tareas – calendario (tareas.js)

Estructura actual: `tareasEjemplo = { vencidas: [], porDia: { 'YYYY-MM-DD': [] } }`.

**Criterio de filtro:** en tareas.html solo se muestran tareas **asignadas al usuario actual** (María Alejandra). **Vencidas:** una tarea entra en `vencidas` solo si `endDate < hoy` y `!done` (no completada).

Cada **tarea** en vencidas o porDia:

| Campo                 | Tipo   | Uso en tareas.html      |
|-----------------------|--------|---------------------------|
| `id`                  | number | Único, checkbox, detalle |
| `name`                | string | Título de la tarea        |
| `done`                | boolean| Checkbox completada       |
| `status`              | string | Activo, Vencido, Finalizado |
| `endDate`             | string | null o 'YYYY-MM-DD'       |
| `priority`            | string | alta, media, baja        |
| `assignee_email`      | string | null o email              |
| `etiqueta`            | string | null o etiqueta           |
| `created_by`          | string | Nombre del creador        |
| `created_by_avatar_url`| string | Avatar del creador        |
| `role`                | string | colaborador, administrador |

Alcance: solo **tareas de María Alejandra** (individuales, sin plan o dentro de sus planes). No deben mezclarse con actividades de seguimiento.

---

## 5. Vista Planes – cards (planes.js)

Estructura actual: array de planes con:

| Campo         | Tipo   | Uso en planes.html / cards |
|---------------|--------|-----------------------------|
| `id`          | string | Identificador del plan      |
| `name`        | string | Nombre del plan             |
| `end_date`     | string | null o 'YYYY-MM-DD'         |
| `status`      | string | Activo, Vencido, Finalizado |
| `tasksDone`   | number | Tareas completadas          |
| `tasksTotal`  | number | Total de tareas             |
| `finished`    | boolean| true si 100% o cerrado      |
| `hasMembers`  | boolean| Si es grupal (varios) o solo ella |

Alcance: **planes individuales** (solo María Alejandra) + **planes grupales** (ella + otros). La vista puede filtrar por “individual” / “grupal”.

---

## 6. Plan detail (plan-detail.js)

**Plan (metadata):**

| Campo         | Tipo   | Uso en plan-detail         |
|---------------|--------|-----------------------------|
| `name`        | string | Título del plan             |
| `description` | string | Descripción                 |
| `created_by`  | string | Nombre del creador          |
| `end_date`    | string | null o 'YYYY-MM-DD'         |
| `status`      | string | Activo, Vencido, Finalizado |

**Tareas del plan** (array por planId):

| Campo            | Tipo   | Uso en plan-detail          |
|------------------|--------|------------------------------|
| `id`             | number | Checkbox, prioridad, eliminar |
| `name`           | string | Título                       |
| `done`           | boolean| Completada                   |
| `status`         | string | Activo, Vencido, Finalizado  |
| `endDate`        | string | null o 'YYYY-MM-DD'          |
| `priority`       | string | alta, media, baja           |
| `assignee_email`  | string | null o email                 |
| `etiqueta`       | string | null o etiqueta              |

---

## 7. Formulario “Crear plan” (planes.js – planDrawerState)

| Campo / estado      | Tipo   | Uso                         |
|---------------------|--------|-----------------------------|
| `title`             | string | Título del plan             |
| `description`       | string | Descripción                 |
| `endDate`           | string | Fecha de finalización       |
| `useTemplate`       | 'yes' \| 'no' | Si usa plantilla    |
| `selectedTemplateId`| string | ID plantilla                |
| `planConfiguration` | 'everyone' \| 'individual' | Tipo de plan |
| `userAssignmentMode`| 'platform' \| 'excel'     | Origen de usuarios |
| `members`           | array  | [{ id, email, name? }]     |
| `taskCreationMode`  | 'manual' \| 'excel'        | Cómo se agregan tareas |
| `tasks`             | array  | [{ title, description, priority }] |
| `csvTasks` / `csvFile` | -   | Si taskCreationMode === 'excel' |

Al guardar, la base unificada debe poder representar: plan con título, descripción, fecha fin, lista de miembros, lista de tareas (título, descripción, prioridad, y luego endDate/assignee si se definen).

---

## 8. Formulario “Crear tarea” (tareas.js – por día; planes.js – tarea dentro de plan)

| Campo        | Tipo   | Uso                         |
|--------------|--------|-----------------------------|
| `title` / `name` | string | Título de la tarea      |
| `description`| string | Opcional                    |
| `priority`   | string | alta, media, baja           |
| `endDate`    | string | Fecha (en calendario = día elegido) |
| `assignee_email` | string | Opcional                |
| `etiqueta`   | string | Opcional                    |

Al guardar en vista tareas: se añade a `porDia[fecha]` o a `vencidas` con `created_by` y `created_by_avatar_url` del usuario actual (María Alejandra).

---

## 9. Formulario “Crear plantilla” (planes.js – templateDrawerState)

| Campo                | Tipo   | Uso                    |
|----------------------|--------|------------------------|
| `templateName`       | string | Nombre de la plantilla |
| `description`        | string | Descripción            |
| `templatePermission` | 'empresarial' \| 'individual' |
| `taskCreationMode`   | 'excel' \| 'manual'    |
| `tasks`              | array  | [{ title, description, priority, etiqueta? }] |
| `csvTasks`           | array  | Si modo excel          |

La base unificada puede tener un listado de **plantillas** (nombre, descripción, permiso, lista de tareas plantilla) para reutilizar al crear planes.

---

## 10. Resumen de entidades en la base unificada

1. **Empresa, áreas, jefes, empleados**  
   Igual que en `seguimiento-data.js` (para seguimiento y para asignar responsables con nombre/avatar/username).

2. **Usuario actual**  
   María Alejandra Sánchez Pardo (nombre, username, avatar, id/idColaborador). Debe coincidir con un empleado/jefe en la base.

3. **Actividades de seguimiento**  
   Lista única de actividades (tareas y planes) **grupales** con todos los campos de las tablas de seguimiento (id, tipo, nombre, plan, asignado/asignados, area, lider, cargo, estado, prioridad, avance, fechas, creador, comentarios). Pueden generarse como hoy a partir de empleados/áreas o leerse de un array.

4. **Tareas individuales de María Alejandra**  
   Tareas sueltas (sin plan) para la vista tareas: formato compatible con tareas.js (vencidas + porDia), con `created_by` y avatar de María Alejandra, y opcionalmente `assignee_email` tipo fiqsha.

5. **Planes individuales de María Alejandra**  
   Planes donde solo está ella: id, name, description, end_date, status, tasksDone, tasksTotal, finished, hasMembers: false (o flag `individual: true`). Con lista de tareas del plan en formato plan-detail.

6. **Planes grupales (donde participa María Alejandra)**  
   Planes con varios miembros (hasMembers: true). Pueden ser los mismos que en seguimiento o un subconjunto. Cada uno con lista de tareas.

7. **Plantillas** (opcional)  
   Si se desea que “crear plan con plantilla” use la base: nombre, descripción, permiso, lista de tareas plantilla.

---

## 11. Getters que la base unificada debe exponer

- `getActividadesSeguimiento()` → **solo actividades grupales de toda la empresa** (planes con más de un participante y sus tareas; excluye planes/tareas “solo para sí mismo”). Para seguimiento.html / seguimiento-leader.html. Datos en el rango 2025-01-01 … 2026-06-30; las vistas usan fecha actual real para filtrar/ordenar.
- `getTareasVistaTareas()` → estructura `{ vencidas, porDia }` para **tareas.html**: solo tareas **asignadas a** el usuario actual (María Alejandra). Incluye tareas sueltas asignadas a ella y tareas de planes (individuales o grupales) donde ella está asignada. Criterio “vencidas” = `endDate < hoy && !done`. Fecha “hoy” = real.
- `getPlanesVistaPlanes()` → array de planes para planes.html: **planes donde participa el usuario actual** (individuales suyos + grupales donde está), con formato de card (id, name, end_date, status, tasksDone, tasksTotal, finished, hasMembers).
- `getPlanDetalle(planId)` → metadata del plan para plan-detail y para detalle desde seguimiento (name, description, created_by, end_date, status).
- `getTareasPorPlan(planId)` → array de tareas del plan (coherencia plan = agrupación de tareas). Formato plan-detail/seguimiento (id, name, done, status, endDate, priority, assignee_email, etiqueta, etc.).
- `getUsuarioActual()` → { nombre, username, avatar, id }.
- (Opcional) `getPlantillas()` para el drawer de crear plan.

Todas las vistas que dependan de “hoy” o de vencidas deben usar **fecha actual real**; el conjunto de datos de ejemplo cubre **1 ene 2025 – 30 jun 2026**. Con esto la base unificada cubre todos los campos y consumidores sin que falte ninguno.

---

## 12. Archivo creado: `tareas-base-unificada.js`

- **Dependencia:** `seguimiento-data.js` debe estar cargado antes (para `SEGUIMIENTO_DATABASE.generarActividades` y `getActividadesParaLider`).
- **Usuario actual:** María Alejandra Sánchez Pardo (id J005), coherente con seguimiento-data.
- **API global:** `TAREAS_PLANES_DB` con:
  - `getUsuarioActual()`
  - `getTareasVistaTareas()` → `{ vencidas, porDia }`
  - `getPlanesVistaPlanes()` → array de planes para cards
  - `getPlanDetalle(planId)` → metadata del plan
  - `getTareasPorPlan(planId)` → tareas del plan
  - `getActividadesSeguimiento()` → delega a `SEGUIMIENTO_DATABASE.generarActividades()`
  - `getActividadesParaLider(nombreLider)` → delega a `SEGUIMIENTO_DATABASE.getActividadesParaLider(nombreLider)`
- **Estado:** Archivo creado; **no** está conectado a las páginas todavía.
- **Pendiente de alinear con decisiones de diseño (sección 0):**  
  - Datos de toda la empresa; `getTareasVistaTareas()` debe filtrar por “asignado a usuario actual”.  
  - Rango 1 ene 2025 – 30 jun 2026 y uso de **fecha real** en todas las vistas.  
  - `getActividadesSeguimiento()` debe excluir planes/tareas solo para sí mismo (solo grupales).  
  - Criterio vencidas: `endDate < hoy && !done`.  
  Cuando se implemente la BD (o en una siguiente iteración), aplicar estas reglas en el código.

---

## 13. Checklist para implementación (cuando se conecte)

- [ ] **planes.html:** Cargar `tareas-base-unificada.js` después de `seguimiento-data.js` y `planes.js`. En `planes.js`, sustituir `planesEjemplo` por `TAREAS_PLANES_DB.getPlanesVistaPlanes()` (o asignar `estadoPlanes.plans = TAREAS_PLANES_DB.getPlanesVistaPlanes()` al iniciar).
- [ ] **tareas.html:** Cargar la base unificada. En `tareas.js`, sustituir `tareasEjemplo` por `TAREAS_PLANES_DB.getTareasVistaTareas()` (atención: si las páginas mutan el objeto, habrá que decidir si la base expone mutaciones o se reasigna desde la base en cada carga).
- [ ] **plan-detail.html:** Sustituir `planesDetalle` y `tareasPorPlan` por `TAREAS_PLANES_DB.getPlanDetalle(planId)` y `TAREAS_PLANES_DB.getTareasPorPlan(planId)` según el `planId` de la URL.
- [ ] **seguimiento.html / seguimiento-leader.html:** Cargar la base unificada; sustituir llamadas a `SEGUIMIENTO_DATABASE.generarActividades()` y `SEGUIMIENTO_DATABASE.getActividadesParaLider(nombre)` por `TAREAS_PLANES_DB.getActividadesSeguimiento()` y `TAREAS_PLANES_DB.getActividadesParaLider(nombre)` (comportamiento igual mientras sigan delegando a seguimiento-data).
- [ ] **Mutaciones:** Hoy `tareas.js` y `planes.js` modifican en memoria (crear/editar/eliminar tareas y planes). Al implementar, decidir si la base unificada expone funciones de escritura (ej. `addTareaVencida`, `addTareaPorDia(fecha, tarea)`, `updatePlan`, etc.) o si las páginas siguen mutando un objeto que se inicializa con los getters (y luego se puede persistir en localStorage o API).
