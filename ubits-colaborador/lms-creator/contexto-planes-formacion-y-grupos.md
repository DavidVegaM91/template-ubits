# Planes de formación – Definición y reglas

Contexto de **planes de formación y grupos** en el LMS Creator (no cubre todo el módulo: contenidos y categorías tendrán su propio documento). Tipos de plan (contenidos vs competencias), estados, progreso y diferencias entre ambos flujos.

---

## 1. Dos tipos de plan

En el LMS Creator existen **dos tipos de plan de formación**:

| Tipo | Página de creación | Qué se asigna |
|------|--------------------|---------------|
| **Plan de contenidos** | `crear-plan-contenidos.html` | Contenidos (cursos, cápsulas, etc.) a grupos o personas. |
| **Plan de competencias** | `crear-plan-competencias.html` | Competencias (no contenidos) a grupos o personas. |

- **Planes de contenidos:** el administrador asigna **contenidos** (cursos, cápsulas, etc.) a estudiantes dentro de un rango de fechas. Cada asignación tiene "quiénes" y "qué contenidos".
- **Planes de competencias:** el administrador asigna **competencias** (no contenidos concretos) a estudiantes dentro de un rango de fechas. Cada asignación tiene "quiénes" y "qué competencias", más un campo exclusivo: **horas por competencia** (véase más abajo).

El resto de este documento se estructura en: reglas comunes (estados, progreso), luego **planes de contenidos** y luego **planes de competencias** con sus diferencias.

---

## 2. Reglas comunes (estados y progreso)

### 2.1 Estados del plan

| Estado | Tag | Significado |
|--------|-----|-------------|
| **Planeado** | Azul (info) | Plan creado para una **fecha futura**; aún no ha iniciado. Solo lo ve el administrador. |
| **Procesando X%** | Amarillo (warning) | El plan se está **creando** (cruce de datos, asignaciones). Transitorio. |
| **Vigente** | Verde (success) | El plan **está en curso**: fecha actual entre inicio y fin. Los estudiantes lo ven. |
| **No vigente** | Gris (neutral) | Pasó la **fecha de cierre**. Progreso congelado. |
| **Inactivo** | Rojo (error) | (Por definir.) |

Al salir de **Procesando**, el plan solo puede pasar a **Planeado** o **Vigente** según la fecha actual; el progreso mostrado es el de **estudio** (empieza en 0).

**Planeado:** en **`detalle-plan.html`** (si se entra por URL o flujos que abran esa pantalla) se usa la **misma plantilla** que para un plan Vigente: misma tabla de asignaciones y mismos drawers; el **status tag** es «Planeado» y el **progreso** del plan y por usuario se muestra en **0 %**. **Desde `planes-formacion`**, el **clic en fila** abre **`editar-plan-contenidos`** (priorizar edición mientras no hay progreso que consultar; ver **§ 4.4**).

#### 2.1.1 Cómo se ve el detalle del plan según el estado

En **planes de contenidos**, al abrir un plan desde la lista:

| Estado       | Página que se abre      | Tag visible | Progreso        | Fecha de fin en card | Botón tabla «Agregar asignación» | Clic en fila / contenidos                    | Barra de acciones (varios seleccionados)     |
|-------------|--------------------------|-------------|-----------------|----------------------|----------------------------------|----------------------------------------------|-----------------------------------------------|
| **Procesando** | Editar (p. ej. `editar-plan-contenidos`) | Procesando X% | —               | —             | —                    | —                                            | —                                              |
| **Planeado**   | Desde **`planes-formacion`** (clic en fila): **`editar-plan-contenidos.html`** | Planeado    | 0 % (plan y por fila) | Solo lectura en detalle | No | Drawer **Agregar contenidos**                | Enviar recordatorio, **Asignar contenidos**, Eliminar del plan |
| **Vigente**    | `detalle-plan.html`      | Vigente     | Real (plan y por fila) | Solo lectura (texto) | No | Drawer **Agregar contenidos**                | Enviar recordatorio, **Asignar contenidos**, Eliminar del plan |
| **No vigente** | `detalle-plan.html`      | No vigente  | Congelado       | Solo lectura  | No  | **Panel de solo lectura** (sin drawer agregar) | Solo Enviar recordatorio y Eliminar del plan (sin "Asignar contenidos") |

- **Planeado:** en la lista, el **clic en fila** abre **`editar-plan-contenidos`** (aún no hay progreso que valga una vista solo consulta). **`detalle-plan.html`** es la vista de **consulta de progreso** cuando el plan ya está **Vigente** o **No vigente** (p. ej. clic en fila desde la lista, o **⋮ → Ver progreso**).
- **Vigente:** **`detalle-plan.html`** como consulta de progreso; metadatos del card en solo lectura; edición ampliada en **`editar-plan-contenidos`**. En el detalle siguen el drawer por fila, "Asignar contenidos" masivo y la barra de acciones según estado.
- **No vigente:** no se puede agregar contenidos desde el drawer (el clic en fila abre un panel de solo lectura); la barra de acciones no muestra el botón "Asignar contenidos".

#### 2.1.2 Planes de competencias — página según el estado (desde la lista)

En **planes de competencias**, al hacer **clic en una fila** de **`planes-competencias.html`** (lista dedicada; ya no hay tab en la página de contenidos):

| Estado | Página que se abre (clic en fila en `planes-competencias.html`) |
|--------|---------------------|
| **Procesando** | `editar-plan-competencias.html?id=<id>` |
| **Planeado** | `editar-plan-competencias.html?id=<id>` |
| **Vigente**, **No vigente** | `detalle-plan-competencias.html?id=<id>` |

- En el prototipo, la tabla **Planes de competencias** en **`planes-competencias.html`** incluye **tres filas de ejemplo** (**`c1`** Planeado, **`c2`** Vigente, **`c3`** No vigente); no hay plan en **Procesando** en esa lista. Si existiera un plan en Procesando (datos reales), el criterio de fila sería el de la tabla: **edición**; **Planeado** → **edición**; **Vigente** / **No vigente** → **detalle**.

### 2.2 Progreso: estudio, no carga

- **Progreso en la tabla de planes:** agregado del avance de **todos los estudiantes** en lo asignado (contenidos o competencias).
- **Progreso por estudiante:** avance de **ese estudiante** en sus contenidos o competencias.
- La barra total del plan debe ser coherente con la suma/promedio de los progresos de los estudiantes.

---

## 3. Planes de contenidos

### 3.1 Definición

Un **plan de contenidos** es un conjunto de **contenidos** (cursos, cápsulas, etc.) que un administrador asigna a un grupo de personas dentro de un rango de fechas (vigencia). El plan tiene:

- Nombre
- **Fecha de inicio** y **fecha de fin**
- Listado de **asignaciones**: quiénes están asignados y **qué contenidos** tiene cada asignación.

No existe el campo "horas por competencia"; ese campo es exclusivo de planes de competencias.

### 3.2 Creación (crear-plan-contenidos)

- Formulario: nombre del plan, vigencia (fecha inicio, fecha fin).
- Tabla de asignaciones: columnas "Asignados" y "Contenidos asignados"; botón "Agregar contenidos" / "X contenidos" por fila.
- Drawer **"Agregar contenidos"** para elegir cursos/contenidos por asignación.
- Validación: todas las asignaciones deben tener al menos un contenido para poder guardar.

#### 3.2.1 Drawer "Agregar contenidos" (detalle) — crear-plan

- En **crear**, puede mostrarse el **wizard por pasos** (tipo de asignación → participantes → contenidos). Ver **§ 6.5** (stepper, paso participantes) y **§ 6.7** (catálogo: tabla/cuadrícula, filtros, selección).
- **Paso Contenidos (UI actual):** toolbar **«Buscar y agregar contenidos»** con contador de resultados, búsqueda, toggle **Tabla / Cuadrícula**, **Ver seleccionados** y catálogo unificado UBITS + Fiqsha. **Vista tabla (default):** columnas completas con filtros en encabezado; **vista cuadrícula:** cards `card-content-compact` + **modal «Filtros»** (no hay filtros por columna en cuadrícula). Scroll infinito: 12 ítems iniciales, más al hacer scroll.
- **Drawer legacy por fila** (sin toolbar de tabla): búsqueda simple + grid de cards; ver **§ 6.7.5** (`usesToolbarCatalog`).
- **Datos guardados por asignación:** array de ítems de curso (id, title, etc.). Origen: **`bd-master`** (`bd-contenidos-*` + maestros); la lista del drawer la arma **`catalogo-contenidos-drawer.js`** → `window.CATALOGO_CURSOS_DRAWER`.

#### 3.2.2 Edición mientras el plan está en «Procesando» (`editar-plan-contenidos.html`)

Vista de edición del plan de contenidos **antes de salir de Procesando** (misma ruta que enlaza **`planes-contenidos.html`** cuando el plan está en ese estado). Comportamiento **alineado al detalle por usuario** (como `detalle-plan.html` con asignaciones solo por colaborador), no al wizard completo de creación con todas las opciones de tipo de asignación.

- **Tabla de asignaciones:** una **fila por colaborador** (sin filas de tipo grupo, toda la empresa ni importación por archivo). Columnas: **«Nombre de usuario»** (avatar + nombre) y **«Contenidos asignados»** (botón «Agregar contenidos» o «N contenidos»).
- **Drawer «Agregar asignación»:** solo **2 pasos** en el stepper — **1 · Participantes** → **2 · Contenidos** — mismo patrón que en **crear-plan-contenidos** cuando la asignación es por colaborador (tabla de colaboradores de la empresa con columnas username, nombre, correo, área, líder; luego catálogo de contenidos con búsqueda, filtro por origen, «Ver seleccionados» y cards compactas). No hay paso de «tipo de asignación» (radios toda empresa / colaborador / grupos / archivo). Los colaboradores que **ya tienen fila** en la tabla no se listan de nuevo en participantes.
- **Clic en «N contenidos» o «Agregar contenidos» (por fila):** se abre el **mismo catálogo del paso Contenidos** (toolbar + tabla/cuadrícula; ver **§ 6.7**), **sin stepper**. Pie: **Cancelar** + **Agregar**. Prefijo de ids **`drawer-editplan-`**; lógica **`attachWizardContenidosPaso2(..., { idPrefix: 'drawer-editplan' })`**.
- **Datos por fila:** `colaboradorId`, `nombreUsuario`, `avatar`, `contenidos[]`, `contenidosCount`. Validación coherente con crear: guardar exige fechas de vigencia y al menos una asignación con contenidos.
- **Nombre del plan y tag de estado (misma fila que detalle):** en **`detalle-plan.html`** el nombre es un **`h1` de solo lectura**; en **`editar-plan-contenidos.html`** es **textarea** editable. Ambos usan **`.detalle-plan-progress-card__header`**: fila horizontal con nombre a la izquierda y **`#plan-estado-container`** + **`ubits-status-tag`** a la derecha. Import **`status-tag.css`**. **Importante (CSS):** en **`crear-plan-contenidos.css`**, **`.crear-plan-contenidos-form__field--nombre-plan`** usa **`flex-direction: column`**, lo que por defecto apilaría el tag **debajo** del título. **`editar-plan-contenidos.css`** añade la clase **`editar-plan-nombre-row`** y reglas con **mayor especificidad** (p. ej. **`.crear-plan-contenidos-form__field--nombre-plan.editar-plan-nombre-row`**) con **`flex-direction: row`**, **`align-items: center`**, **`justify-content: space-between`**, y el textarea con **`flex: 1`** / **`min-width: 0`**, alineado al header del detalle en **`detalle-plan.css`**. Ver **§ 6.2.1**.
- **Tag de estado en reposo (lectura «semántica» vs UI):** si el plan viene del catálogo con estado **Procesando** (p. ej. `Procesando 0%`), **no** se muestra ese texto en el tag: en **`editar-plan-contenidos`** y **`editar-plan-competencias`** el tag en reposo muestra **Planeado** (variante `info`, `sm`) con su tooltip, para no sugerir que el plan sigue «en cola» mientras el administrador ya está completando asignaciones. Los estados **Vigente** y **Planeado** «reales» se muestran tal cual.
- **Tras «Agregar asignación» (wizard 2 pasos, botón Agregar):** cuando se incorpora **al menos una fila nueva** a la tabla, el **status tag** (`warning`) muestra el mismo tipo de animación que en **`planes-contenidos.html`** para planes en proceso: el texto **dentro de** `ubits-status-tag__text` pasa de **«Procesando 0%»** a **«Procesando 100%»** en **4 segundos** (incrementos de 1% cada 40 ms, sin barra aparte). Es feedback de «procesando la nueva asignación». Al llegar a 100%, el tag **vuelve al estado estable anterior**: **Planeado** o **Vigente**, según el plan en catálogo (si el catálogo era Procesando, en reposo se muestra **Planeado**). El toast de éxito solo se muestra si hubo filas realmente agregadas. **Misma** lógica en **`editar-plan-competencias.html`** (ver **§ 4.3.2**).

### 3.3 Detalle del plan – Tabla y drawer

- La página **`detalle-plan.html`** aplica a planes **Vigente**, **No vigente** y también puede mostrar un plan **Planeado** (misma UI; progreso 0 %). **Desde la lista** (`planes-contenidos.html`), el **clic en fila** para **Planeado** abre **edición**, no el detalle (**§ 4.4**). **Procesando** desde la lista va a **editar**.
- **Vista de solo consulta:** no hay botón **Guardar** en el header product ni botón primario **«Agregar asignación»** en la tabla; el nombre del plan, fechas de vigencia y demás datos del card se muestran como **texto** (no textarea ni calendar). Para editar el plan o añadir asignaciones desde cero se usa **`editar-plan-contenidos.html`**. El **botón «Opciones»** en la card del plan (junto al status tag) ofrece acciones por estado (**§ 6.2.2**).
- Cada fila = un **estudiante** asignado.
- Columnas: usuario, último acceso, **contenidos**, **progreso**. Si el plan es Planeado, el progreso del plan y el de cada fila se muestran en 0 %.
- **Búsqueda en la tabla de asignaciones:** la barra de búsqueda del componente **`ubits-data-table`** filtra por el texto visible en las columnas (nombre de usuario, fechas, «N contenidos», porcentaje, etc.). El texto del **nombre** se obtiene de la celda usuario (avatar + nombre) con la lógica documentada en **§ 6.6** (evita depender solo del primer `span` vacío del avatar).
- **Descarga CSV (Vigente / No vigente):** botón **«Descargar»** a la derecha del buscador en la barra de la tabla; exporta todas las asignaciones con progreso por contenido. Ver **§ 3.3.3**.
- Clic en fila (o contenidos) abre el **drawer** de ese estudiante con cards de contenidos y progreso por contenido.

#### 3.3.1 Barra de acciones y "Asignar contenidos" (solo Planeado y Vigente)

- Con **varias personas seleccionadas** (checkboxes) en la tabla de asignaciones aparece la barra de acciones con botones.
- **Solo para planes en estado Planeado o Vigente** (no para No vigente), entre "Enviar recordatorio" y "Eliminar del plan" hay un botón secundario **"Asignar contenidos"**.
- Al hacer clic se abre el **mismo drawer "Agregar contenidos"** (búsqueda, cards compactos, tabla de agregados). Los contenidos elegidos se **asignan a todas las personas seleccionadas**: se hace merge por curso (sin duplicar); no se borran los contenidos que cada uno ya tenía.

#### 3.3.2 Drawer "Agregar contenidos" en detalle-plan

- Mismo catálogo que en crear-plan (**§ 6.7**): toolbar, vista **Tabla** (default) o **Cuadrícula**, búsqueda, filtros y scroll infinito (12 + carga al scroll).

#### 3.3.3 Descarga CSV de asignaciones (Vigente y No vigente)

- **Cuándo aparece:** en **`detalle-plan.html`**, si el plan está en estado **Vigente** o **No vigente**, la tabla **Lista de asignaciones** (`ubits-data-table`) muestra en la barra superior un botón secundario **«Descargar»** (`primaryButton` del data table), **a la derecha del botón de búsqueda** (icono lupa). **No** se muestra en **Planeado** ni **Procesando**.
- **Acción:** al hacer clic se genera y descarga un archivo **`.csv`** (UTF-8 con BOM) con **todas las filas** de asignaciones del plan (no solo las visibles tras filtrar en la UI).
- **Columnas del CSV:**

| Columna | Origen / formato |
|---------|------------------|
| **Nombre del usuario** | Texto de la columna usuario de la tabla |
| **Último acceso** | Valor de `ultimoAcceso` (ej. «Hace 2 días») |
| **Última fecha de progreso** | Misma fecha formateada que en la tabla (`formatDateDDMmmAAAA`) |
| **Contenidos** | Lista de contenidos asignados al usuario, separados por **`; `**. Cada ítem: **`{título del contenido} ({porcentaje}%)`**, p. ej. `Comunicación efectiva (75%); Liderazgo situacional (40%)`. El porcentaje es el avance en ese contenido (`contenidoPorUsuario`). |
| **Progreso total acumulado** | Promedio de avance de sus contenidos, igual que la columna **Progreso** de la tabla (ej. `68%`) |

- **Nombre del archivo:** `asignaciones-{nombre-del-plan-normalizado}.csv` (slug del nombre del plan).
- **Feedback:** toast de éxito **«Archivo descargado»** tras la descarga (demo).
- **Implementación:** helpers `escapeCsvCell`, `descargarCsv` y `buildAndDownloadAsignacionesDetalleCsv` en el script inline de **`detalle-plan.html`**; datos desde `asignacionesDetalleData` + `contenidoPorUsuario` (misma fuente que la tabla y el drawer por estudiante).

---

## 4. Planes de competencias

### 4.1 Definición

Un **plan de competencias** asigna **competencias** (no contenidos concretos) a grupos o personas dentro de un rango de fechas. El plan tiene:

- Nombre
- **Fecha de inicio** y **fecha de fin**
- **Horas por competencia** (campo exclusivo de este tipo de plan; ver 4.2)
- Listado de **asignaciones**: quiénes están asignados y **qué competencias** tiene cada asignación.

No se asignan "contenidos" (cursos/cápsulas); se asignan competencias. La carga de estudio se calcula a partir de las horas por competencia y el número de competencias.

### 4.2 Horas meta de estudio (playground — seed `bd-planes-formacion.js`)

En el **formulario de producto** el campo sigue llamándose «Horas de estudio por competencia» (`crear-plan-competencias`, `editar-plan-competencias`). En la **BD del playground** (decisión acordada jun 2026):

| Aspecto | Valor en seed |
|---------|----------------|
| **Meta por plan** | **2 horas en total** para todo el plan (no 2 h × cada competencia asignada). |
| **Campo en BD** | `horasEstudioMeta: 2` |
| **Cálculo de progreso** | Suma de duración de contenidos vistos de **la competencia del plan** dentro de la vigencia ÷ 2 h → cap 100 %. |

**Significado en UI genérica (fuera del seed):** el campo numérico junto a la vigencia indica cuántas horas debe dedicar cada estudiante; en planes reales podría ser «por competencia». En el mock corporativo de Fiqsha se fija **2 h plan completas** para simplificar demos.

**Ejemplo seed:** plan «Empresa Liderazgo 2025» con `horasEstudioMeta: 2`. Si un colaborador consume 1 h de contenidos con `competenciaPrincipalId: comp-024` entre el 1 ene y el 31 dic 2025, su progreso en ese plan ≈ 50 %.

Este valor es **por plan** en el seed: todas las asignaciones del plan comparten la misma meta de 2 h (no se multiplica por número de competencias asignadas a la persona).

### 4.3 Creación (crear-plan-competencias)

- Formulario: nombre del plan, vigencia (fecha inicio, fecha fin), **horas por competencia**.
- Tabla de asignaciones: columnas "Asignados" y "Competencias asignadas"; botón "Agregar competencias" / "X competencias" por fila.
- Drawer **"Agregar competencias"** para elegir competencias (y habilidades) por asignación; **no** drawer de contenidos/cursos.
- Validación: todas las asignaciones deben tener al menos una competencia para poder guardar.

#### 4.3.1 Drawer "Agregar competencias" (detalle)

- En **crear plan competencias**, el mismo drawer puede ser **wizard de 3 pasos** (tipo de asignación → participantes → competencias). Ver **§ 6.5** (el paso de catálogo aquí no usa el filtro UBITS/propio del plan de contenidos).
- **Izquierda:** cards de competencia (mismo estilo que en catalogo.html: imagen + nombre + "X habilidades"), **sin** status tag "Asignado" ni botones a la derecha. Búsqueda por texto (competencia, academia o habilidad).
- **Selección:** al hacer clic en una card: (1) borde azul, (2) la card se expande y muestra la lista de **habilidades** hijas de esa competencia, cada una con un **checkbox** (todas marcadas por defecto); (3) la competencia se agrega a la tabla de la derecha.
- **Habilidades:** el usuario puede desmarcar las que no quiera. Si desmarca **todas** las habilidades, la competencia se deselecciona y se elimina de la tabla (no tiene sentido una competencia sin habilidades).
- **Tabla derecha:** una fila por competencia seleccionada. La celda de competencia tiene **dos líneas**: línea principal = nombre de la competencia, línea secundaria (estilo helper) = "X habilidad(es)". Botón eliminar quita la competencia de la selección.
- **Datos guardados por asignación:** array de ítems `{ id, title, habilidades: [] }` (`id` = id de competencia en BD, p. ej. `comp-001`; `title` = nombre; `habilidades` = nombres seleccionados). Origen: `bd-master-competencias.js` + `bd-master-habilidades.js` y el helper `catalogo-competencias-drawer.js` (expone `CATALOGO_COMPETENCIAS_DRAWER`, mismas globales que catalogo.html).

#### 4.3.2 Edición de plan de competencias (`editar-plan-competencias.html`)

Pantalla de **edición** para planes en **Planeado**, **Procesando** o **Vigente** (equivalente funcional a **`editar-plan-contenidos.html`** § 3.2.2, adaptada a competencias y horas). Entrada: lista (**§ 4.4**, clic en fila si **Procesando**, menú **⋮ → Editar** si Planeado/Procesando/Vigente) o URL **`?id=`** (catálogo alineado a **`planes-competencias.html`**). Objetivo: completar o ajustar asignaciones; si el plan aún está en **Procesando** en backend, completar antes de que pase a otro estado.

**Comportamiento compartido del status tag con contenidos:** ver **§ 3.2.2** (tag **Planeado** en reposo cuando el catálogo es **Procesando**; animación **«Procesando 0%»…«100%»** en el tag al agregar asignación nueva). Detalle específico de competencias en el siguiente listado.

**Qué incluye la página**

- **Cabecera:** nombre del plan (textarea editable), **vigencia** (fecha inicio, fecha fin) e **input «Horas de estudio por competencia»** (numérico; solo dígitos en teclado, pegado e `input`, igual que en `crear-plan-competencias.html`). Junto al nombre, **en la misma fila**, **status tag** y **`#plan-estado-container`** como en **`detalle-plan.html`** / **`editar-plan-contenidos`** (prototipo: **Planeado**); **`status-tag.css`**; clase **`editar-plan-nombre-row`** y **`editar-plan-competencias.css`** sobrescriben **`flex-direction: column`** de **`.crear-plan-competencias-form__field--nombre-plan`** con **`flex-direction: row`** (mismo patrón que § 3.2.2 y **§ 6.2.1**).
- **Tabla de asignaciones:** una **fila por colaborador** (sin toda la empresa, grupos ni importación por archivo). Columnas: **Nombre de usuario** y **Competencias asignadas** (botón «Agregar competencias» o «N competencias»).
- **Drawer «Agregar asignación»** (`#drawer-agregar-usuarios`): stepper de **2 pasos** — **1 · Participantes** → **2 · Competencias**. Misma idea que en editar contenidos: tabla de colaboradores disponibles (excluye quienes ya tienen fila); luego catálogo de competencias (búsqueda, grid de cards en varias columnas, habilidades con checkbox y orden por drag). HTML generado en JS: `getDrawerAgregarAsignacionEditarPlanHtml()` — paso catálogo `#drawer-wizard-step3`, búsqueda `#drawer-wiz-comp-search-container`, resultados `#drawer-wiz-competencias-cards-container`, empty search `#drawer-wiz-competencias-empty-search`.
- **Tag de estado y animación (alineado a § 3.2.2 y `planes-contenidos.html`):** en reposo, si el catálogo trae **Procesando**, el tag muestra **Planeado**; **Vigente** y **Planeado** se muestran tal cual. Tras confirmar **Agregar** en el wizard con **al menos una fila nueva**, el texto **dentro** del `ubits-status-tag` anima **«Procesando 0%»** → **«Procesando 100%»** en **4 s** (incrementos de 1% cada 40 ms); al terminar, vuelve al estado estable (**Planeado** o **Vigente**). Toast solo si hubo filas agregadas.
- **Drawer por fila «Editar competencias»** (`#drawer-agregar-competencias`, título en UI coherente con edición): **sin stepper**; solo bloque de catálogo. Ids con prefijo **`drawer-editplan-`** (`comp-search-container`, `competencias-cards-container`, `competencias-empty-search`) para no chocar con el wizard si ambos overlays pudieran coexistir en el mismo documento.

**Lógica JS compartida**

- **`attachWizardCompetenciasPaso2(overlay, onSync, opts)`** — tercer argumento opcional **`opts.idPrefix`**: por defecto **`drawer-wiz`** (wizard «Agregar asignación»); en el drawer por fila **`drawer-editplan`**. Misma semántica que en `crear-plan-competencias.html` (cards, habilidades, `CATALOGO_COMPETENCIAS_DRAWER`).
- Tras adjuntar el paso, se marca **`overlay._wizCompetenciasAttached`** (no aplica filtro UBITS/propio ni `card-content-compact`; es el flujo de competencias).

**Datos y validación**

- Por fila: `colaboradorId`, `nombreUsuario`, `avatar`, **`contenidos[]`** (array de ítems de competencia `{ id, title, habilidades, habilidadesDesactivadas }`) y **`contenidosCount`**. Se mantiene el nombre de propiedades **`contenidos` / `contenidosCount`** por alineación con **crear-plan-competencias** y el resto del prototipo (no son contenidos de curso).
- **Guardar** (header): exige fechas válidas, **horas ≥ 1** y **al menos una asignación con al menos una competencia**; si falta competencia en alguna fila, toast de error coherente con crear.

**Archivos del prototipo**

| Archivo | Uso |
|---------|-----|
| `editar-plan-competencias.html` | Marcado, tabla, drawers y scripts inline (catálogo local con ids **`c0`–`c3`** para demos; la lista en **`planes-competencias.html`** solo muestra **`c1`–`c3`**). Query **`?id=`**. JS: **`getEstadoTagEstableVisual`**, **`iniciarAnimacionEstadoProcesandoAsignacion`**, menú **Opciones** del plan (**§ 6.2.2**). |
| `editar-plan-competencias.css` | Estilos propios mínimos + **fila título + status tag** (ver **§ 6.2.1**); el layout reutiliza **`crear-plan-competencias.css`** y **`crear-plan-contenidos.css`**. |
| `catalogo-competencias-drawer.js` | Catálogo global `CATALOGO_COMPETENCIAS_DRAWER` (+ imágenes / iconos de habilidades vía globales del drawer). |
| `bd-master-competencias.js`, `bd-master-habilidades.js` | Datos maestros de competencias y habilidades. |

**Navegación desde la lista:** ver **§ 2.1.2** y **§ 4.4** (página **Planes de competencias** → Procesando abre esta página).

### 4.4 Listas de planes y navegación (`planes-contenidos.html` y `planes-competencias.html`)

El SubNav del Creator enlaza **dos páginas** (más **Grupos**): **`planes-contenidos.html`** solo lista planes de **contenidos**; **`planes-competencias.html`** solo lista planes de **competencias**. No hay tabs dentro de cada lista.

- **`planes-contenidos.html` — clic en fila:** **Procesando** o **Planeado** → **`editar-plan-contenidos.html?id=`**; **Vigente** o **No vigente** → **`detalle-plan.html?id=`** (consulta de progreso). El menú **⋮ → Editar** sigue llevando a edición cuando el estado lo permite (ver siguiente punto).
- **`planes-competencias.html` — clic en fila:** **Procesando** o **Planeado** → **`editar-plan-competencias.html?id=`**; **Vigente** o **No vigente** → **`detalle-plan-competencias.html?id=`**.
- **Menú de acciones (⋮) por fila** (en la lista que corresponda):  
  - **Ver progreso:** solo si el estado es **Vigente** o **No vigente**. En la lista de contenidos → `detalle-plan.html?id=`; en la lista de competencias → `detalle-plan-competencias.html?id=`.  
  - **Editar:** solo si el estado es **Planeado**, **Procesando** (cualquier %) o **Vigente**. **No** se muestra para **No vigente**. Navega a **`editar-plan-contenidos.html?id=`** o **`editar-plan-competencias.html?id=`** según la página de lista.  
  - **Eliminar:** abre el **mismo modal** que la barra de acciones al eliminar varios (confirmar escribiendo «eliminar»); aplica a la fila actual.  
- **Plantillas de edición (`editar-plan-contenidos.html`, `editar-plan-competencias.html`):** reciben **`?id=`** del plan. Los datos mostrados se cargan desde un **catálogo local alineado** con los mismos ids y metadatos que la lista correspondiente (**`planes-contenidos.html`** o **`planes-competencias.html`**). Si alguien abre la URL de edición con un plan **No vigente**, la página **redirige** al detalle correspondiente (`detalle-plan.html` o `detalle-plan-competencias.html`), igual que si entrara solo a “ver” el plan cerrado.

### 4.5 Detalle del plan de competencias (detalle-plan-competencias.html)

- **Detalle (consulta de progreso):** **`detalle-plan-competencias.html`** para planes **Vigente** o **No vigente** (p. ej. clic en fila desde la lista o **⋮ → Ver progreso**). **Procesando** y **Planeado** entran por **`editar-plan-competencias.html`** desde la lista (§ 4.4); § 4.3.2 describe la edición mientras está en Procesando.
- **Botón «Opciones»** en la card del plan (junto al status tag): menú contextual por estado (**Editar plan** en Vigente, envío de recordatorio, certificados, eliminar, etc.). Detalle completo en **§ 6.2.2** (mismo patrón que **`detalle-plan.html`**).
- **Vista de solo consulta:** igual que **`detalle-plan.html`**: sin **Guardar** en el header, sin botón primario **«Agregar asignación»** en la tabla; nombre del plan (**`h1`**), fechas y **horas de estudio por competencia** como **texto** (no inputs). Edición en **`editar-plan-competencias.html`**.
- Card de progreso: nombre del plan, fechas de vigencia (inicio y fin como texto), horas por competencia como texto, barra de progreso del plan.
- Tabla de asignaciones: columnas usuario, último acceso, competencias asignadas, progreso. Botón "Agregar competencias" / "X competencias" por fila. Clic en fila o en el botón abre el **drawer "Agregar competencias"** (mismo comportamiento que en crear-plan: cards de competencia, expansión con habilidades y checkboxes, tabla derecha con dos líneas por competencia).
- **Búsqueda en la tabla de asignaciones:** misma implementación que en **detalle-plan** (contenidos): **`ubits-data-table`** + reglas de texto de celda en **§ 6.6**.
- Con **varias personas seleccionadas**, barra de acciones con **"Asignar competencias"** (solo Planeado/Vigente): se abre el mismo drawer y los ítems elegidos se hacen **merge** en cada persona seleccionada (sin duplicar por id de competencia).

### 4.6 Diferencias resumidas frente a planes de contenidos

| Aspecto | Plan de contenidos | Plan de competencias |
|---------|--------------------|------------------------|
| Página de creación | `crear-plan-contenidos.html` | `crear-plan-competencias.html` |
| Página de edición (Procesando) | `editar-plan-contenidos.html` | `editar-plan-competencias.html` |
| Página de detalle | `detalle-plan.html` | `detalle-plan-competencias.html` |
| Campo extra (crear / editar / detalle) | — | **Horas por competencia**: editable en crear y **editar-plan-competencias**; en **detalle-plan-competencias** solo texto |
| Qué se asigna | Contenidos (cursos, etc.) | Competencias |
| Columna en tabla de asignaciones | "Contenidos asignados" | "Competencias asignadas" |
| Drawer de asignación | Agregar contenidos — catálogo tabla/cuadrícula (**§ 6.7.5**) | Agregar competencias (ver 4.3.1: cards competencia + habilidades con checkbox; tabla dos líneas) |
| Cálculo de carga | Promedio % avance de 3 cursos/persona | Suma horas de contenidos de la competencia en vigencia ÷ meta 2 h |

---

## 5. Resumen de coherencia de datos

- Plan recién creado (sale de Procesando): **estado** = Planeado o Vigente; **progreso** = 0 % (o bajo).
- Progreso en tabla de planes = agregado del avance de estudiantes.
- Progreso por fila (estudiante) = agregado del avance de ese estudiante en sus contenidos o competencias.
- **No vigente** solo para planes cuya fecha de fin ya pasó; nunca como resultado de "acabar de crear" un plan.
- En **planes de competencias (seed playground)**, la meta es **2 h por plan** (`horasEstudioMeta`); el progreso suma duración de contenidos de la competencia del plan consumidos **dentro de la vigencia** (ver § 7.4).

---

## 7. Base de datos única — `bd-master/bd-planes-formacion.js`

> **Decisión acordada (jun 2026):** una sola BD alimenta **LMS Creator** (`planes-contenidos.html`, `planes-competencias.html`, crear/editar/detalle) y **Mi equipo** (`mi-equipo/planes.html` y derivados). Reemplaza mocks inline del Creator y `mi-equipo-planes-mock.js`. **No** compartir datos con `bd-tareas-y-planes.js`.

**Global:** `window.BD_PLANES_FORMACION`

**Documentación espejo (Mi equipo):** `ubits-colaborador/aprendizaje/mi-equipo/contexto-mi-equipo.md` § 10.

### 7.1 Fecha de referencia y estados

| Constante | Valor |
|-----------|--------|
| **«Hoy» del playground** | **19 jun 2026** |
| **Rango de planes** | Q1 2025 → Q3 2026 |

**Estados automáticos** (no persistir como fuente de verdad; calcular con helper `getEstadoPlan(plan, hoy)`):

| Estado | Condición |
|--------|-----------|
| **Planeado** | `hoy < fechaInicio` |
| **Vigente** | `fechaInicio ≤ hoy ≤ fechaFin` |
| **No vigente** | `hoy > fechaFin` |

El estado **Procesando X%** sigue siendo **transitorio de UI** al crear o agregar asignaciones (no forma parte del seed estático).

### 7.2 Planes de contenidos — seed

| Regla | Valor |
|-------|--------|
| Granularidad | **1 plan / área / trimestre** |
| Total planes | **63** (9 áreas × 7 trimestres) |
| Creador | Líder del área (`esJefe: true`) |
| Asignados | Reportes directos del líder |
| Cursos por persona | **3 contenidos distintos** (siempre); pueden variar entre personas del mismo plan; **rotan cada trimestre** |
| Origen contenidos | `bd-contenidos-ubits.js` (+ catálogo propio si aplica) |
| Progreso persona | Promedio del **% de avance** de sus 3 cursos |
| Progreso plan | Promedio del progreso de todos los asignados |

**Áreas y líderes:** Ventas (E002), Instalaciones (E003), Reparaciones (E004), Atención al Cliente (E005), Logística (E006), Administración (E007), Marketing (E008), Recursos Humanos (E052), Gerencia General (E001).

**Nombre tipo:** `{Área} capacitación {Qx yyyy}`.

### 7.3 Planes de competencias — seed

| Regla | Valor |
|-------|--------|
| Granularidad | **1 plan corporativo / competencia / año** |
| Total planes | **6** (3 competencias × años 2025 y 2026) |
| Vigencia | Año calendario completo |
| Nombre tipo | `Empresa {Competencia} {año}` |
| Competencias | Solo **`comp-024` Liderazgo**, **`comp-020` Inglés**, **`comp-004` Comunicación** (únicas con contenidos suficientes en el playground) |
| Asignación por persona | **3 competencias** al año (una de cada una de las tres anteriores); la mezcla puede cambiar respecto al año anterior |
| Horas meta | **`horasEstudioMeta: 2`** — **2 h por plan en total** (ver § 4.2) |
| Creador(es) | **E052** Carmen (Jefa RRHH) como principal; **E053** (OKRs) y **E054** (Encuestas) como creadores secundarios plausibles en el seed |

### 7.4 Progreso competencias — regla de ventana

El progreso **no** es «porcentaje de competencias completadas» ni acumulado vitalicio:

1. Solo cuenta consumo de contenidos cuya **`competenciaPrincipalId`** coincide con la del plan.
2. Solo cuenta consumo con **fecha dentro de** `[fechaInicio, fechaFin]` del plan.
3. Se **suman horas** (`tiempoValor` convertido a horas) hacia la meta de **2 h** del plan.
4. Fórmula: `progresoPct = min(100, (horasEstudiadas / horasEstudioMeta) × 100)`.
5. **No arrastra** entre planes: un curso visto en «Empresa Inglés 2025» **no** suma al plan «Empresa Inglés 2026»; en el nuevo año hay que consumir **otros** contenidos de Inglés dentro de la vigencia 2026.

**Ejemplo:** En 2025 estudió el curso X (Inglés) → suma solo a «Empresa Inglés 2025». En 2026 está en «Empresa Inglés 2026» → debe estudiar cursos distintos (o no contados en 2025) dentro de ene–dic 2026 para avanzar ese plan.

### 7.5 Visibilidad por rol

| Rol | Qué ve |
|-----|--------|
| **LMS Creator (admin)** | **Todos** los planes de la BD |
| **Mi equipo — líder demo (María E006)** | **Cualquier plan** donde aparezca al menos un subordinado directo (E035–E040), **incluidos planes corporativos de HR** |

Filtro opcional en lista Mi equipo: una persona → solo sus planes y progreso individual (§ 5 de `contexto-mi-equipo.md`).

### 7.6 Esquema y helpers

Estructura mínima de un plan:

```js
{
  id, tipo, nombre, fechaInicio, fechaFin,
  horasEstudioMeta,      // solo competencias; 2 en seed
  area, trimestre,       // solo contenidos
  anio, competenciaId,   // solo competencias
  creadorId,
  asignaciones: [{ colaboradorId, contenidos?, competencias? }],
  progresoPorColaborador, progresoAgregado  // precalculados en seed
}
```

**Helpers previstos:** `getPlanById`, `getPlanesByTipo`, `getEstadoPlan`, `getProgresoColaboradorEnPlan`, `getProgresoAgregadoPlan`, `getPlanesVisiblesParaLider`, `getPlanesVisiblesCreator`, `getAsignadosFromPlan`.

### 7.7 Implementación

| Paso | Acción |
|------|--------|
| 1 | Crear `bd-master/bd-planes-formacion.js` con seed + helpers |
| 2 | Actualizar `bd-master/README.md` (inventario) |
| 3 | Sustituir mocks en Creator y Mi equipo |
| 4 | Mantener `sessionStorage` solo para mutaciones demo (crear/editar/eliminar en sesión), opcional |

---

## 6. Detalles de implementación actual (prototipo)

Resumen de decisiones de UI y comportamiento implementado en el prototipo, para mantener coherencia al seguir trabajando en el módulo.

### 6.1 Planes de competencias – Drawers

- **Clic en fila (un usuario):**
  - **Vigente / Planeado:** se abre el drawer **"Usuario – Agregar competencias"** (tamaño **lg**). Una columna de resultados con **varias columnas de cards** (grid de 3 columnas). Permite buscar, seleccionar/deseleccionar competencias y ordenar habilidades por prioridad (drag).
  - **No vigente:** se abre el drawer **"Usuario – competencias y progreso"** (tamaño **sm**). **Una sola columna** de cards; solo se muestran las competencias asignadas y su progreso (sin búsqueda ni catálogo).

- **Acciones masivas – "Asignar competencias" (varios usuarios):** se abre el **mismo drawer "Agregar competencias"** que a nivel de plan (búsqueda, cards, habilidades). Los cards de competencia tienen **ancho 100 %** de la columna para aprovechar bien el espacio (igual que en el drawer por usuario).

- **Plan en estado Procesando — `editar-plan-competencias.html`:** no es detalle; es la pantalla de edición previa a salir de Procesando. Los drawers de catálogo (wizard 2 pasos y **Editar competencias** por fila) reutilizan la misma lógica de cards/habilidades que en crear; ver **§ 4.3.2**.

### 6.2 Cards de competencias – Estilo y progreso

- **Bordes:** borde por defecto con token **`--ubits-border-1`** (nunca blanco/transparente). En contextos con selección: **hover** = borde azul (`--ubits-accent-brand`); **seleccionado** = borde azul **2 px**. Aplica en `detalle-plan-competencias` y `crear-plan-competencias`.
- **Barra de progreso:** se renderiza **siempre** en cada card (con o sin progreso) para mantener **altura fija**. La barra va en **overlay** (position absolute, bottom 0) para no cambiar la altura del card (referente: `card-content-compact`).
- **Planeado:** el progreso mostrado en los cards es **0 %** (no hay avance antes de que inicie el plan).
- **Vigente:** si el usuario deselecciona una competencia y vuelve a seleccionarla, se **conserva el progreso** que ya tenía (no se resetea a 0). El progreso se toma de `competenciaPorUsuario` al añadir de nuevo la competencia.

#### 6.2.1 Pantallas `editar-plan-*` — título y status tag (misma fila que `detalle-plan`)

- **Referencia de layout (detalle = solo lectura):** **`detalle-plan.html`** / **`detalle-plan-competencias.html`**: en la card de progreso, **`.detalle-plan-progress-card__header`** es un **flex en fila**: a la izquierda un **`h1.ubits-heading-h1.detalle-plan-title-display`** (`#plan-nombre`) con el nombre y a la derecha **`#plan-estado-container`** con **`ubits-status-tag`**. En **`editar-plan-*.html`** se usa **textarea** editable para el nombre en la misma disposición.
- **`editar-plan-contenidos.html`** y **`editar-plan-competencias.html`** repiten ese patrón: **`#asignacion-nombre`** + **`#plan-estado-container`** dentro del campo de nombre, clase adicional **`editar-plan-nombre-row`**. Componente **`status-tag.css`**. En **ambas** pantallas de edición, el estado **Procesando** del catálogo se **muestra como Planeado** en el tag en reposo (ver **§ 3.2.2** y **§ 4.3.2**). Tras **agregar asignación** nueva (wizard 2 pasos), en **ambas** páginas la animación es la misma: texto **`Procesando N%`** dentro del **`ubits-status-tag`** durante 4 s, como en **`planes-contenidos.html`**.
- **Por qué hace falta CSS extra:** en **`crear-plan-contenidos.css`** y **`crear-plan-competencias.css`**, **`.…-form__field--nombre-plan`** define **`flex-direction: column`** (apila hijos). Si solo se añadiera el tag como segundo hijo **sin** sobrescribir la dirección, el tag quedaría **debajo** del título. Los archivos **`editar-plan-contenidos.css`** y **`editar-plan-competencias.css`** declaran selectores **más específicos** — p. ej. **`.crear-plan-contenidos-form__field--nombre-plan.editar-plan-nombre-row`** / **`.crear-plan-competencias-form__field--nombre-plan.editar-plan-nombre-row`** — con **`flex-direction: row`**, **`align-items: center`**, **`justify-content: space-between`**, **`gap`**, y el textarea con **`flex: 1`** y **`min-width: 0`**, equivalentes a **`.detalle-plan-progress-card__header`** en **`detalle-plan.css`**.

#### 6.2.2 Botón «Opciones» del plan (card) — menú por estado

En la **card de progreso del plan** (junto al **status tag**), hay un botón **tertiary** **icon-only** con icono **ellipsis vertical** (`far fa-ellipsis-vertical`), **`aria-label`** y tooltip **«Opciones»**. Abre un **dropdown** (`components/dropdown-menu.css` / `.js`: **`getDropdownMenuHtml`**, **`openDropdownMenu`**, **`closeDropdownMenu`**) con **`alignRight: true`**; tras abrir, se ajusta la posición del panel para alinearlo al **borde derecho** del botón (evitar que quede fuera de pantalla).

**Páginas que lo implementan**

| Página | Contenedor del tag + botón | Destino «Editar plan» (solo detalle, Vigente) |
|--------|----------------------------|-----------------------------------------------|
| `detalle-plan.html` | `.detalle-plan-header-actions` (#`plan-estado-container` + #`plan-actions-btn`) | `editar-plan-contenidos.html?id=` |
| `detalle-plan-competencias.html` | Igual patrón | `editar-plan-competencias.html?id=` |
| `editar-plan-contenidos.html` | `.editar-plan-header-actions` dentro de `.editar-plan-nombre-row` | — (no aplica; ver tabla abajo) |
| `editar-plan-competencias.html` | Igual que contenidos | — |

**Opciones mostradas según el estado del plan** (misma lógica en contenidos y competencias; en **edición** se usa el **estado visual estable** del tag: **`getEstadoTagEstableVisual()`** — p. ej. catálogo **Procesando** se muestra como **Planeado** en el tag, y el menú sigue las reglas de ese estado visual).

| Estado | Opciones del menú (orden) | Comportamiento |
|--------|---------------------------|----------------|
| **Vigente** | **Solo en vistas de detalle** (`detalle-plan.html`, `detalle-plan-competencias.html`): **1.** **Editar plan** → navega a **`editar-plan-contenidos.html?id=`** o **`editar-plan-competencias.html?id=`** según el tipo. **2.** **Enviar recordatorio** → **modal** de confirmación (texto: correo a quienes no completaron el plan, avance y fecha de vencimiento); **Confirmar** → toast **«Recordatorio enviado»**; **Cancelar** / cierre → sin enviar. **3.** **Eliminar** → modal de eliminación. | En **edición** (`editar-plan-*.html`), en Vigente **no** se muestra «Editar plan» (el usuario ya está en la pantalla de edición): solo **Enviar recordatorio** (en prototipo: toast **«Recordatorio enviado»** directo) y **Eliminar**. |
| **No vigente** | **Descargar certificados** → toast de éxito (prototipo). **Eliminar** → modal. | Mismo menú en detalle y en edición (si se llegara a una edición con ese estado; el flujo normal redirige al detalle). |
| **Planeado**, **Procesando** u otro (rama `else` en código) | Solo **Eliminar** → modal. | Sin envío de recordatorio ni certificados en esta rama. |

**Modal de eliminar plan** (desde el menú **Eliminar**)

- **Texto base:** aviso de que se pierde la data asociada (asignaciones, avances, historial).
- Si el estado usado para el modal es **Planeado** (incluido el caso «visual Planeado» cuando el backend era Procesando): título **«Eliminar plan planeado»**, un solo botón de acción **Eliminar plan** (sin campo de confirmación por texto).
- Si el estado es **Vigente** o **No vigente** (u otro no planeado): título **«Confirmar eliminación»**, texto de irreversibilidad, campo para escribir **`eliminar`**, botones **Cancelar** y **Eliminar plan** (este último deshabilitado hasta escribir la palabra correctamente).
- Tras confirmar: cierre del modal, **`sessionStorage`** con toast pendiente de éxito («Plan eliminado correctamente.») y redirección a **`planes-contenidos.html`**.

**Implementación (referencia)**

- Funciones típicas en el script inline: **`getPlanActionOptionsByStatus(estado)`**, **`getDeletePlanModalConfig(estado)`**, **`openDeletePlanModal(...)`**, **`initPlanActions()`** (listener en `#plan-actions-btn`).
- Los modales se apilan en **`#asignaciones-modals-container`** (`innerHTML +=` para no pisar otros modales de la misma página).
- IDs de overlay del dropdown y del modal pueden variar por archivo (p. ej. `detalle-plan-actions-overlay` vs `detalle-plan-comp-actions-overlay`, `editar-plan-actions-overlay` vs `editar-plan-comp-actions-overlay`) para evitar colisiones si se reutilizan patrones.

### 6.3 Habilidades (filas arrastrables)

- El icono de **drag** (grip vertical) en las filas de habilidades usa el color **`--ubits-fg-1-medium-inverted`** en `crear-plan-competencias` y `detalle-plan-competencias`.

### 6.4 Archivos HTML del módulo LMS Creator

| Archivo | Rol |
|---------|-----|
| `planes-contenidos.html` | Lista solo de planes de **contenidos**. Clic en fila: **Procesando** o **Planeado** → **`editar-plan-contenidos.html`**; **Vigente** o **No vigente** → **`detalle-plan.html`**. Menú **⋮:** Ver progreso, **Editar** (Planeado/Procesando/Vigente), Eliminar (**§ 4.4**). Animación en tabla: tag **Procesando N%** en planes en proceso (**§ 2.1** / lista). |
| `planes-competencias.html` | Lista solo de planes de **competencias**. Clic en fila: **Procesando** o **Planeado** → **`editar-plan-competencias.html`**; **Vigente** o **No vigente** → **`detalle-plan-competencias.html`**. Mismo menú **⋮** y criterios (**§ 4.4**, **§ 2.1.2**). |
| `crear-plan-contenidos.html` | Creación de plan de contenidos: nombre, vigencia, tabla de asignaciones, drawer Agregar contenidos. |
| `crear-plan-competencias.html` | Creación de plan de competencias: nombre, vigencia, horas por competencia, tabla de asignaciones, drawer Agregar competencias (cards + habilidades). |
| `editar-plan-contenidos.html` | Edición con **`?id=`** (Planeado / Procesando / Vigente). Tabla una fila por usuario; «Agregar asignación» = wizard 2 pasos (participantes → contenidos); por fila, drawer catálogo (`drawer-editplan`). Tag: **Planeado** en reposo si catálogo Procesando; animación **Procesando N%** en el tag al **agregar** asignación (**§ 3.2.2**). Título + tag + **Opciones** en fila (**§ 6.2.1**, **§ 6.2.2**). |
| `editar-plan-contenidos.css` | Fila título + tag + acciones: sobrescribe **`flex-direction: column`** del bloque nombre en crear-plan-contenidos (alineado a `detalle-plan`); **`.editar-plan-header-actions`** (**§ 6.2.2**). |
| `editar-plan-competencias.html` | Misma idea que la fila anterior con competencias y **horas por competencia**; wizard 2 pasos, `attachWizardCompetenciasPaso2`, drawer fila `#drawer-agregar-competencias`. Mismo criterio de **tag en reposo**, **animación al agregar asignación** y menú **Opciones** (**§ 4.3.2**, **§ 6.2.1**, **§ 6.2.2**). |
| `editar-plan-competencias.css` | Incluye la misma lógica de fila título + tag que `editar-plan-contenidos.css` + estilos mínimos propios. |
| `detalle-plan.html` | Detalle de plan de **contenidos** (solo consulta de progreso: sin Guardar ni «Agregar asignación» en tabla; card en texto). Drawers, barra de acciones de tabla y **botón Opciones** del plan en card (**§ 6.2.2**). Búsqueda de tabla: **§ 6.6**. |
| `detalle-plan-competencias.html` | Detalle de plan de **competencias** (mismo criterio). Tabla, drawers, **§ 6.2.2**, **§ 6.6**. |
| `grupos.html`, `detalle-grupo.html`, `crear-grupo.html` | Gestión de grupos: lista, crear y detalle; drawer **Agregar integrantes** reutiliza **`drawer-participantes-colab-table.js`** (**§ 6.7.6**). |
| `contenidos.html`, `categorias.html`, `chat-ia-grupos.html` | Contenidos, categorías y chat IA (otros flujos del LMS Creator). |

### 6.5 Wizard por pasos — drawer «Agregar asignación»

En **crear-plan-contenidos** y **crear-plan-competencias**, al añadir filas a la tabla de asignaciones se usa el drawer **`#drawer-agregar-usuarios`** (título típico **«Agregar asignación»**). El cuerpo incluye un **stepper** horizontal compacto (`components/stepper.css` / `stepper.js`) y bloques por paso generados en JS (`drawer-asignacion-wizard-root`).

En **`editar-plan-contenidos.html`** el mismo drawer **solo** implementa **2 pasos** en el stepper (**Participantes** → **Contenidos**): no hay paso inicial de tipo de asignación (cards toda empresa / colaborador / grupos / archivo). El HTML del cuerpo es `getDrawerAgregarAsignacionEditarPlanHtml()` (stepper `#drawer-wiz-stepper-ol-edit`, pasos `#drawer-wizard-step2` participantes, `#drawer-wizard-step3` catálogo). El catálogo de contenidos reutiliza **`attachWizardContenidosPaso2(overlay, onSync, opts)`** con prefijo por defecto **`drawer-wiz`**.

En **`editar-plan-competencias.html`** el patrón es el mismo con **Participantes** → **Competencias**; el catálogo usa **`attachWizardCompetenciasPaso2(overlay, onSync, opts)`** (misma firma de `idPrefix` que en crear-plan-competencias).

#### Variantes de flujo (2 vs 3 pasos en el stepper)

| Stepper | Pasos visibles | Cuándo aplica |
|--------|----------------|----------------|
| **2 pasos** | 1 · Tipo de asignación → 2 · **Contenidos** o **Competencias** | En **crear** (y competencias): flujos que omiten la selección explícita de participantes en el wizard (p. ej. opción acortada según tipo de asignación; ver lógica `soloPaso2` / `getOpcionAsignacion()` en cada HTML). |
| **2 pasos (editar plan)** | 1 · **Participantes** → 2 · **Contenidos** o **Competencias** | **`editar-plan-contenidos.html`** / **`editar-plan-competencias.html`**: no hay paso «tipo de asignación»; equivale al tramo participantes + catálogo del flujo por colaborador en crear. |
| **3 pasos** | 1 · Tipo de asignación → 2 · **Participantes** → 3 · **Contenidos** (plan de contenidos) o **Competencias** (plan de competencias) | Asignación por **colaborador** o por **grupos** (no solo «importar archivo» en un paso intermedio): hace falta elegir personas/grupos antes del catálogo. |

- **Paso 1 — Tipo de asignación:** fila de **cards** (Agregar colaborador, Agregar por grupos, Importar archivo, etc.). El usuario debe completar lo requerido para habilitar **Siguiente**.
- **Paso 2 — Participantes** (solo flujo de 3 pasos): se muestra **una** de las tablas según la opción del paso 1:
  - Panel **`.drawer-usuarios-panel--colaborador`** — tabla de colaboradores.
  - Panel **`.drawer-usuarios-panel--grupos`** — tabla de grupos.
- **Paso 3 — Catálogo:** en **contenidos**, toolbar + tabla/cuadrícula (**§ 6.7**); en **competencias**, búsqueda + grid de cards de competencia (sin catálogo de contenidos).

#### Reglas de UI acordadas (no duplicar ni líneas extra)

- **Sin título duplicado en paso 2:** el stepper ya muestra la etiqueta **«Participantes»**; **no** se añade un encabezado de texto ni un separador adicional encima de las tablas (el contenido del paso es solo el panel visible).
- **Sin borde superior en paneles de participantes:** la clase **`.drawer-usuarios-panel`** en `crear-plan-contenidos.css` y `crear-plan-competencias.css` define solo `display: flex`, `flex-direction: column` y `gap` — **sin** `border-top`, **sin** `margin-top` / `padding-top` extra que dibujaran una línea entre las cards del paso 1 y la tabla (vale tanto para colaboradores como para grupos).

#### Paso 3 en plan de contenidos — catálogo (toolbar, tabla, cuadrícula)

Sustituye al antiguo dropdown «Todos / Solo catálogo UBITS / Solo catálogo propio». La especificación completa está en **§ 6.7**. Resumen:

- **Vista Tabla:** filtros por **encabezado de columna** (dropdown con checkboxes; autocomplete solo si hay **más de 3** valores únicos en esa columna).
- **Vista Cuadrícula:** botón **Filtrar** en toolbar → **modal «Filtros»** (selects + switch «Con certificación»). El botón de modal **solo es visible en cuadrícula**; en tabla los criterios equivalentes van por columna cuando aplica.
- **Z-index:** overlays de filtros de columna y modal por encima del drawer (`crear-plan-contenidos.css`: `[id*="-cursos-col-filter-"]`, `.drawer-contenidos-filtros-modal`, etc.).

#### Archivos tocados por este flujo

| Archivo | Rol |
|---------|-----|
| `crear-plan-contenidos.html` | HTML/JS del wizard: steppers 2 y 3 pasos, pasos DOM `#drawer-wizard-step1` … `step3`, catálogo paso 3 vía `getDrawerContenidosCatalogSectionHtml('drawer-wiz')` (**§ 6.7.5**). |
| `crear-plan-competencias.html` | Mismo patrón de wizard; paso 3 es competencias (`#drawer-wiz-comp-search-container`, etc.), sin filtro de catálogo UBITS/propio. |
| `crear-plan-contenidos.css` | Estilos stepper en drawer, paneles `.drawer-usuarios-panel`, catálogo contenidos (**§ 6.7.5**): tabla ancha, filtros columna/modal, switch certificación, z-index overlays. |
| `drawer-contenidos-catalog-section.js` | Markup toolbar + tabla/cuadrícula del paso Contenidos (**§ 6.7.5**). |
| `drawer-contenidos-paso2.js` | Lógica catálogo: vistas Tabla/Cuadrícula, filtros encabezado, selección, scroll (**§ 6.7.5**). |
| `drawer-contenidos-filtros.js` | Modal Filtros (cuadrícula), chips, badge, `filterCursosBySearchAndFilters` (**§ 6.7.5**). |
| `catalogo-contenidos-drawer.js` | Fusiona UBITS + Fiqsha → `CATALOGO_CURSOS_DRAWER`. |
| `drawer-participantes-colab-table.js` | Tabla colaboradores paso Participantes (**§ 6.7.4**) y drawer **Agregar integrantes** de grupos (**§ 6.7.6**). |
| `crear-plan-competencias.css` | Igual para paneles `.drawer-usuarios-panel` y layout del wizard. |
| `editar-plan-contenidos.html` | Wizard **2 pasos** (Participantes → Contenidos) para «Agregar asignación»; tabla solo usuarios; drawer por fila «Editar contenidos» = catálogo una columna (`attachWizardContenidosPaso2` con `idPrefix: 'drawer-editplan'`). Título + tag en fila: **§ 6.2.1**. |
| `editar-plan-competencias.html` | Igual estructura de wizard que `editar-plan-contenidos`, con competencias: **§ 4.3.2**, **§ 6.4**, **§ 6.2.1** (tag + animación compartidos con contenidos). |

### 6.6 Tabla de asignaciones (`createUbitsDataTable`) — búsqueda por texto

Las tablas de **asignaciones** en detalle y edición (`detalle-plan.html`, `detalle-plan-competencias.html`, `editar-plan-contenidos.html`, `editar-plan-competencias.html`) y el drawer **«Agregar asignación»** (lista de colaboradores) usan el componente **`createUbitsDataTable`** (`components/ubits-data-table.js` + `components/ubits-data-table.css`).

#### Problema que se evitó

En columnas tipo **usuario** (avatar + nombre), un selector genérico del estilo «primer `span` de la celda» puede devolver el **`span` del avatar** (vacío o sin el nombre), de modo que la búsqueda **no encontraba** filas aunque el nombre se viera en pantalla.

#### Comportamiento actual (`getRowCellText`)

Para **búsqueda**, **orden** y **filtros** por valor de celda, el componente obtiene el texto así:

1. **Recorre** todos los nodos `.ubits-body-sm-regular` y `.ubits-body-md-regular` **dentro** de la celda `td[data-col="…"]`.
2. **Omite** los que están dentro de **`.ubits-avatar`** (el nombre no vive ahí; evita ruido o texto vacío).
3. Concatena los fragmentos **no vacíos** con un espacio (`join(' ')`).
4. Si no hay ninguno (p. ej. columna solo con botón «N contenidos» sin clases de tipografía en el texto), usa **`td.textContent.trim()`** como respaldo.

La normalización del término buscado sigue siendo **`normalizeText`** (minúsculas, sin tildes) para coincidencias tipo «maria» / «María».

#### i18n (prototipo)

En las tablas de asignaciones del detalle y en el drawer de colaboradores se alinearon los textos de búsqueda con **`editar-plan-*`**:

- **`buscar`:** p. ej. «Buscar usuarios» (tooltip del botón lupa y aria).
- **`buscarPlaceholder`:** p. ej. «Buscar por nombre de usuario…» (placeholder del input tipo search del componente Input).

**Archivos donde aplica** (entre otros): `detalle-plan.html`, `detalle-plan-competencias.html`, y las configuraciones equivalentes en edición cuando la tabla expone búsqueda.

#### Imports obligatorios del componente

En páginas que usen `createUbitsDataTable` con orden o filtros en columnas: **dropdown-menu** + **table** + **checkbox** + **empty-state** + **input** + **tooltip**, según indica el comentario de cabecera de `ubits-data-table.js`. Ver también la lista de **§ 6.4** y ejemplos en `crear-plan-contenidos.html` / `planes-contenidos.html`.

### 6.7 Tablas del módulo — columnas, filtros y acciones

Inventario de **todas las tablas** relevantes en planes de formación (LMS Creator). Componente estándar: **`createUbitsDataTable`** (`components/ubits-data-table.js`). **Excepción:** catálogo de contenidos del drawer usa tabla **custom** en `drawer-contenidos-paso2.js` (no es `createUbitsDataTable`).

#### 6.7.1 Lista de planes (`planes-contenidos.html` / `planes-competencias.html`)

| Columna | Orden | Filtro encabezado | Notas |
|---------|-------|-------------------|--------|
| Nombre del plan | Sí | No | Clic en fila → edición o detalle (**§ 4.4**) |
| Fecha inicio | Sí (fecha) | No | |
| Fecha fin | Sí (fecha) | No | |
| Estado | No | **Sí** | Valores únicos de la columna (Planeado, Vigente, No vigente, Procesando X%, etc.) |
| Progreso | Sí (número) | No | Celda con barra + % |
| Acciones | No | No | Botón **⋮** (Ver progreso, Editar, Eliminar) |

**Features:** checkboxes, búsqueda global, filtros (solo columna Estado), Ver seleccionados, contador de resultados, barra de acciones.

**Barra de acciones (varias filas seleccionadas):** **Eliminar** → modal de confirmación (escribir «eliminar»).

**Filtros encabezado (`ubits-data-table`):** dropdown con checkboxes multi-selección; **Cancelar** / **Aplicar**; chips «Filtros aplicados» + **Limpiar filtros**.

---

#### 6.7.2 Tabla de asignaciones — crear / editar plan (`crear-plan-contenidos.html`, `editar-plan-contenidos.html`)

| Columna | Filtro | Notas |
|---------|--------|--------|
| Asignados | No | Avatar/lista según tipo (toda empresa, grupos, colaboradores, archivo) |
| Contenidos asignados | No | Botón **Agregar contenidos** / **N contenidos** → drawer catálogo (**§ 6.7.5**) |

**Features:** checkboxes, Ver seleccionados, contador, barra de acciones. **Sin** búsqueda ni filtros por columna.

**Botón primario toolbar:** **Agregar asignación** → wizard drawer (**§ 6.5**).

**Barra de acciones:** **Eliminar** → modal (escribir «eliminar»).

**Editar plan:** mismas columnas pero solo filas **por colaborador** (sin toda empresa / grupos / archivo en tabla).

---

#### 6.7.3 Tabla de asignaciones — detalle plan (`detalle-plan.html`, `detalle-plan-competencias.html`)

**Contenidos:**

| Columna | Orden | Filtro | Notas |
|---------|-------|--------|--------|
| Nombre del usuario | Sí | No | Avatar + nombre (**§ 6.6**) |
| Último acceso | No | No | |
| Última fecha de progreso | Sí (fecha) | No | |
| Contenidos | No | No | Botón **N contenidos** → drawer/panel según estado |
| Progreso | Sí (número) | No | |

**Competencias:** columnas equivalentes con **Competencias** en lugar de Contenidos.

**Features:** checkboxes, búsqueda (**Buscar usuarios** / placeholder **Buscar por nombre de usuario…**), Ver seleccionados, contador, barra de acciones. **Sin** filtros por columna.

**Barra de acciones (varias filas):**

| Botón | Cuándo |
|-------|--------|
| Enviar recordatorio | Siempre (demo toast) |
| Asignar contenidos / Asignar competencias | Solo **Planeado** o **Vigente** (no **No vigente**) |
| Eliminar del plan | Siempre → modal «eliminar» |

**Sin** botón primario **Agregar asignación** en detalle (solo consulta); edición en `editar-plan-*.html`.

---

#### 6.7.4 Tabla participantes — wizard «Agregar asignación» (`drawer-participantes-colab-table.js`)

Paso **Participantes** (flujo 3 pasos o editar-plan 2 pasos). Datos: colaboradores de empresa (`bd-master-colaboradores.js`).

| Columna | Visible default | Filtro encabezado |
|---------|-----------------|-------------------|
| Username | Sí | Sí |
| Nombre del usuario | Sí | Sí |
| Correo electrónico | Sí | Sí |
| Área | Sí | Sí |
| Líder | Sí | Sí |
| Cargo, DNI, País, Ciudad, Nivel en empresa, Columna A, Columna B | No (toggle) | Sí (si visible) |

**Features:** checkboxes, búsqueda, **filtros por columna** (`createUbitsDataTable`), Ver seleccionados, contador, **Columnas visibles** (toggle).

**Reutilización:** el mismo módulo y las mismas columnas/features se montan en el drawer **Agregar integrantes** / **Gestionar integrantes** de **`crear-grupo.html`** y **`detalle-grupo.html`** (**§ 6.7.6**).

**Tabla grupos** (mismo wizard, opción por grupos): columnas propias del HTML de crear-plan; búsqueda + selección; ver `drawer-grupos-data-table-container`.

---

#### 6.7.5 Catálogo de contenidos — drawer paso Contenidos (**§ 6.7 detalle**)

**Archivos:** `drawer-contenidos-catalog-section.js` (markup), `drawer-contenidos-paso2.js` (tabla/cuadrícula/selección), `drawer-contenidos-filtros.js` (modal + chips), `catalogo-contenidos-drawer.js` (datos → `CATALOGO_CURSOS_DRAWER`).

**Dónde se monta:** wizard paso 3 (`getDrawerContenidosCatalogSectionHtml('drawer-wiz')`), editar por fila (`drawer-editplan`), detalle-plan drawer agregar contenidos. Prefijos de id: `drawer-wiz-`, `drawer-editplan-`, etc.

##### Toolbar («Buscar y agregar contenidos»)

El **`ubits-toolbar-panel`** (variante `--plain`) incluye en **`__title-block`**: título **«Lista de contenidos»** (`ubits-toolbar-panel__title`) + meta **N/M resultados**, alineado a **`u-corporativa.html`** y al componente toolbar-panel.

| Control | Comportamiento |
|---------|----------------|
| Contador | **`N/M resultados`** — `N` = filas/cards visibles tras filtros + «Ver seleccionados»; `M` = total filtrado por búsqueda + filtros modal/columna |
| **Ver seleccionados** | Visible si hay ≥1 contenido seleccionado. Alterna filtrar la vista solo a la selección (**Dejar de ver seleccionados (N)**) |
| **Buscar** (lupa) | Despliega input inline **Buscar contenidos…**; filtra título, competencia/categoría, tipo, nivel, habilidad, experto, aliado, catálogo |
| **Filtrar** (icono) | **Solo en vista Cuadrícula** → abre modal **Filtros** |
| **Ver como: Tabla / Cuadrícula** | Default **Tabla**. Cambiar vista resetea paginación (12 ítems) |

##### Vista Tabla (default)

Tabla ancha con scroll horizontal (`drawer-contenidos-catalog-table`).

| Columna | Filtro encabezado | Valor mostrado / notas |
|---------|-------------------|-------------------------|
| Checkbox | — | Selección múltiple; header con seleccionar/deseleccionar todo (solo página visible) |
| Catálogo | **Sí** | Catálogo UBITS / Catálogo Fiqsha |
| Contenido | No | Título |
| Tipo | **Sí** | Curso, Podcast, Ruta, etc. |
| Competencia / Categoría | **Sí** | UBITS: competencia; Fiqsha: categoría (`competency \|\| categoria`) |
| Habilidad | **Sí** | UBITS: habilidad; Fiqsha: suele ser **—** |
| Aliado | **Sí** | UI dice **Aliado** (dato proveedor/aliado) |
| Nivel | **Sí** | Básico / Intermedio / Avanzado |
| Experto | **Sí** | UBITS; Fiqsha: **—** |
| Idioma | **Sí** | Español, Inglés, Portugués, … |
| Nivel de inglés | **Sí** | CEFR A1–C2; vacío → **—** |
| Con certificación | **Sí** | **Sí** / **No** (texto en celda) |

**Filtro encabezado (UX):**

- Botón **tertiary** icon-only con `fa-filter` junto al título de columna; clase activa **`drawer-contenidos-col-filter-btn--active`** si hay criterios.
- Dropdown (`getDropdownMenuHtml`): lista con **checkboxes** multi-selección, **Cancelar** / **Aplicar**.
- **Autocomplete** en el dropdown **solo si la columna tiene más de 3 valores únicos** en el catálogo cargado. Placeholder **Buscar…** en Aliado, Experto, Competencia/Categoría, Habilidad; en otras columnas largas: **Filtrar por {columna}…**.
- Valores vacíos se normalizan a **—** en tabla y en opciones de filtro.
- Overlay id: `{idPrefix}-cursos-col-filter-{colKey}`; z-index por encima del drawer (**§ 6.5**).

**Acciones fila:** checkbox o clic en fila → añade/quita de selección; al añadir desde tabla se limpia búsqueda inline.

##### Vista Cuadrícula

- Grid de **`card-content-compact`**: miniatura, título, metadatos compactos.
- Clic en card → toggle selección; borde/clase **`course-card-compact--selected`**.
- **No** hay filtros por encabezado (no hay tabla visible).
- Botón **Filtrar** en toolbar → **modal «Filtros»** (ver abajo).

##### Modal «Filtros» (vista Cuadrícula)

Título **Filtros**; tamaño `sm`; **`z-index` 1200** (`.drawer-contenidos-filtros-modal`).

| Campo (orden) | Control | Criterio |
|---------------|---------|----------|
| Catálogo | Select | Todos / **Catálogo UBITS** / **Catálogo Fiqsha** (`ubits` / `empresa` → `courseSource`) |
| Tipo de contenido | Select | Maestro tipos |
| Competencia | Select | Maestro competencias (id) |
| Habilidad | Select | Maestro habilidades (id) |
| Categoría | Select | Maestro categorías Fiqsha (id) |
| Aliado | Select | Maestro aliados (id) |
| Nivel | Select | Maestro niveles |
| Experto | Select | Valores únicos del catálogo |
| Idioma | Select | Español, Inglés, Portugués |
| Nivel de inglés | Select | A1–C2 |
| Con certificación | **Switch** (`ubits-switch`) | **Apagado (default):** sin filtro (muestra con y sin certificado). **Prendido:** solo contenidos **con** certificación. **No** filtra «sin certificación» desde el modal; eso solo vía filtro de columna **Con certificación → No** en vista Tabla |

Pie modal: **Borrar filtros** (terciario, estilo secondary) + **Aplicar**.

**Badge del botón Filtrar:** cuenta **solo criterios del modal** (`getAppliedCount`), no filtros de columna.

##### Filtros aplicados (chips)

Debajo del toolbar (`drawer-filtros-aplicados`):

- Chips de filtros **modal** (ej. **Catálogo: Catálogo UBITS**, **Con certificación: Sí**).
- Chips de filtros **columna** (ej. **Aliado: Coursera**).
- Cada chip tiene **×** para quitar ese criterio.
- **Limpiar filtros** → borra modal **y** columnas; reconstruye encabezado de tabla.

##### Pipeline de filtrado

1. `filterCursosBySearchAndFilters` — búsqueda + criterios **modal**.
2. `applyColumnFilters` — criterios **encabezado** (solo vista Tabla; estado en `overlay._drawerContenidosColumnFilters`).

##### Paginación / scroll

- **`PAGE_SIZE = 12`**; al llegar al final del scroll en `.drawer-cursos-resultados-bg` se cargan 12 más (`maybeLoadMore`).

##### Empty state

Sin resultados (con catálogo no vacío): **No se encontraron resultados**, icono búsqueda, botón **Limpiar búsqueda** (resetea búsqueda y «Ver seleccionados»).

##### Selección y pie del drawer

- La selección vive en `overlay._wizCursosSeleccionados` (o prop configurable).
- El wizard sincroniza contadores y tabla derecha de «contenidos agregados» vía callback `onSync`.
- Drawer por fila / detalle: **Cancelar** + **Agregar** confirman la selección al usuario asignado.

##### Datos por catálogo (campos en fila)

| Campo | Catálogo UBITS | Catálogo Fiqsha |
|-------|----------------|-----------------|
| Competencia / Categoría | `competency` | `categoria` |
| Habilidad, Experto, Nivel inglés | Sí (maestros) | No (celda **—**) |
| Aliado | Todos los aliados del maestro | Proveedor corporativo |
| Con certificación | `conCertificacion` → Sí/No | Igual |

##### Drawer legacy (sin toolbar tabla)

Si el HTML **no** incluye `#…-cursos-table-wrap`, `usesToolbarCatalog = false`: solo búsqueda + **cuadrícula** de cards (sin tabla ni filtros de columna). Usado en algunos drawers antiguos con prefijo vacío.

##### CSS e imports

- `crear-plan-contenidos.css` / `detalle-plan.css`: tabla ancha, filtros columna, modal, switch (`switch.css`).
- Overlays columna: `[id*="-cursos-col-filter-"]` con z-index 1102–1103.

---

#### 6.7.6 Grupos — tabla integrantes y drawer «Agregar integrantes» (`crear-grupo.html`, `detalle-grupo.html`)

Pantallas de **crear** y **detalle** de un grupo de colaboradores. No forman parte del wizard «Agregar asignación» de planes (**§ 6.5**), pero el **drawer de selección de personas** comparte el mismo módulo de tabla que el paso **Participantes** (**§ 6.7.4**).

##### Tabla principal — «Lista de integrantes»

Montada en `#crear-grupo-integrantes-data-table-container` / `#detalle-grupo-integrantes-data-table-container` con **`createUbitsDataTable`**.

| Columna | Filtro encabezado | Notas |
|---------|-------------------|--------|
| Nombre del usuario | No | Avatar + nombre (`detalle-plan-usuario-cell`) |
| Correo | No | |
| Área | No | |

**Features:** búsqueda, contador de resultados. **Sin** checkboxes, **sin** filtros por columna, **sin** Columnas visibles.

**Botón primario toolbar:**

| Estado | Texto del botón | Acción |
|--------|-----------------|--------|
| Grupo vacío | **Agregar integrantes** | Abre drawer en modo alta |
| Con integrantes | **Gestionar integrantes** | Abre drawer en modo gestión (pre-selección) |

**Empty state:** «Aún no hay integrantes» (crear) / «No hay integrantes en este grupo» (detalle); icono `fa-user-plus`; descripción con copy de producto.

##### Drawer `#drawer-agregar-integrantes`

| Aspecto | Detalle |
|---------|---------|
| Título | **Agregar integrantes** (alta) / **Gestionar integrantes** (edición de membresía) |
| Cuerpo | Panel `.drawer-usuarios-panel--colaborador` con contenedor `#drawer-integrantes-colab-data-table-container.drawer-colab-dt-wrapper` |
| Tabla | **`DrawerParticipantesColabTable.createDrawerParticipantesColabDataTable()`** — `tableId`: `drawer-integrantes-colab-table` |
| Datos | `TAREAS_PLANES_DB.getEmpleadosEjemplo()` → **`mapEmpleadoParaDrawerColab(e, idx)`** (misma fila que § 6.7.4; campos extendidos en `bd-master-colaboradores.js`) |
| Columnas / features | **Idénticas a § 6.7.4** (5 visibles + 7 opcionales vía **Columnas visibles**; filtros por columna, Ver seleccionados, etc.) |
| Pre-selección | Modo **Gestionar:** `initialSelectedIds` = ids actuales de `integrantesData` |
| Footer | **Cancelar** + **Agregar** (alta) / **Guardar** (gestionar) |

**Al confirmar:** lee `getSelectedIds()` del data-table del drawer y actualiza el array local `integrantesData` (campos persistidos en la tabla principal: `id`, `nombre`, `correo`, `area`, `avatar`). Modo gestionar **reemplaza** la lista; modo agregar **añade** sin duplicar por `id` o par `correo`+`nombre`. Refresca la tabla principal y cierra el drawer.

##### Archivos

| Archivo | Rol |
|---------|-----|
| `crear-grupo.html` | Formulario nombre/descripción + tabla integrantes + drawer |
| `detalle-grupo.html` | Igual patrón; importa `crear-grupo.css` |
| `crear-grupo.css` | Panel drawer (`.drawer-usuarios-panel`, `.drawer-colab-dt-wrapper`), celda usuario, **z-index** de dropdowns de filtros/columnas sobre el drawer (`body.page-crear-grupo` y `body.page-detalle-grupo` → overlay 1200 / content 1201) |
| `drawer-participantes-colab-table.js` | Módulo compartido con paso Participantes (**§ 6.7.4**) |

**Scripts del drawer:** `drawer-participantes-colab-table.js` → `ubits-data-table.js` → `dropdown-menu.js` → `drawer.js` (orden en ambos HTML).

---

*Última actualización: jun 2026. **BD única `bd-planes-formacion.js` (§ 7):** 63 planes contenidos (9 áreas × 7Q), 6 planes competencias (3 competencias × 2 años), meta 2 h/plan, progreso competencias por ventana de fechas, «hoy» = 19 jun 2026, visibilidad Mi equipo = cualquier plan con subordinado. Prototipo: LMS Creator. **Listas `planes-contenidos.html` y `planes-competencias.html` (§ 4.4):** menú ⋮ (**Ver progreso**, **Editar**, **Eliminar**), plantillas **`?id=`**, redirección edición si No vigente; en **competencias** tres planes de ejemplo (Planeado / Vigente / No vigente), sin fila Procesando. **Card del plan (`detalle-plan-*` / `editar-plan-*`):** botón **Opciones** y menú por estado (**§ 6.2.2**). **Catálogo drawer contenidos:** § 3.2.1, 3.3.2, **§ 6.7.5** (tabla/cuadrícula, filtros modal + columna, switch certificación). **Grupos (`crear-grupo.html`, `detalle-grupo.html`):** drawer **Agregar integrantes** reutiliza **`drawer-participantes-colab-table.js`** — mismas columnas/features que paso Participantes (**§ 6.7.6**). **Editar plan contenidos y competencias (`editar-plan-*.html`):** § 3.2.2 y § 4.3.2 — catálogo **`?id=`**; tag en reposo **Planeado** si backend **Procesando**; animación **Procesando 0%…100%** en status tag al agregar asignación; toast solo si hubo filas nuevas. Competencias: horas por competencia, `attachWizardCompetenciasPaso2`, prefijos `drawer-wiz` / `drawer-editplan`. **§ 6.2.1** título + tag en fila; **§ 6.2.2** menú Opciones; **§ 6.4** tabla de archivos; **§ 6.5** wizard 2 vs 3 pasos; **§ 6.6** búsqueda `ubits-data-table`; **§ 6.7** inventario tablas/filtros/acciones. Enlaces antiguos `#competencias` / `?tab=competencias`: redirect JS a `planes-competencias.html`.*
