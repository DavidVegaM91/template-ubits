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

En **planes de competencias**, al hacer **clic en una fila** de `planes-formacion.html` (tab **Planes de competencias**):

| Estado | Página que se abre (clic en fila en `planes-formacion`) |
|--------|---------------------|
| **Procesando** | `editar-plan-competencias.html?id=<id>` |
| **Planeado** | `editar-plan-competencias.html?id=<id>` |
| **Vigente**, **No vigente** | `detalle-plan-competencias.html?id=<id>` |

- En el prototipo, **`c0`** (Procesando) y **`c1`** (Planeado) abren **edición**; **`c2`** (Vigente) y **`c3`** (No vigente) abren **detalle** (consulta de progreso).

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

- En **crear**, puede mostrarse el **wizard por pasos** (tipo de asignación → participantes → contenidos). Ver **§ 6.5** (stepper, paso participantes, filtro y z-index).
- **Izquierda:** búsqueda por texto (título o competencia del curso) y filtro por origen (Todos / Solo catálogo UBITS / Solo catálogo propio). Grid de **cards compactos de contenido** (componente `card-content-compact`): miniatura, título, etc. Al hacer clic en una card se agrega a la selección y la card muestra borde azul (estado seleccionado). Scroll infinito: se cargan 12 contenidos inicialmente y más al hacer scroll.
- **Tabla derecha:** una fila por contenido seleccionado: celda con título del contenido y botón eliminar. Empty state cuando no hay ninguno ("No hay contenidos agregados").
- **Datos guardados por asignación:** array de ítems de curso (id, title, etc.). Origen: **`bd-master`** (`bd-contenidos-*` + maestros); la lista del drawer la arma **`catalogo-contenidos-drawer.js`** (en esta carpeta) → `window.CATALOGO_CURSOS_DRAWER`.

#### 3.2.2 Edición mientras el plan está en «Procesando» (`editar-plan-contenidos.html`)

Vista de edición del plan de contenidos **antes de salir de Procesando** (misma ruta que enlaza `planes-formacion` cuando el plan está en ese estado). Comportamiento **alineado al detalle por usuario** (como `detalle-plan.html` con asignaciones solo por colaborador), no al wizard completo de creación con todas las opciones de tipo de asignación.

- **Tabla de asignaciones:** una **fila por colaborador** (sin filas de tipo grupo, toda la empresa ni importación por archivo). Columnas: **«Nombre de usuario»** (avatar + nombre) y **«Contenidos asignados»** (botón «Agregar contenidos» o «N contenidos»).
- **Drawer «Agregar asignación»:** solo **2 pasos** en el stepper — **1 · Participantes** → **2 · Contenidos** — mismo patrón que en **crear-plan-contenidos** cuando la asignación es por colaborador (tabla de colaboradores de la empresa con columnas username, nombre, correo, área, líder; luego catálogo de contenidos con búsqueda, filtro por origen, «Ver seleccionados» y cards compactas). No hay paso de «tipo de asignación» (radios toda empresa / colaborador / grupos / archivo). Los colaboradores que **ya tienen fila** en la tabla no se listan de nuevo en participantes.
- **Clic en «N contenidos» o «Agregar contenidos» (por fila):** se abre el **mismo tipo de UI que el paso de catálogo del wizard** (una columna: búsqueda, filtro, barra «Ver seleccionados», grid de cards con selección por clic/toggle), **sin stepper** (solo ese bloque). Pie: **Cancelar** + **Agregar**. En el prototipo el DOM de este drawer usa prefijo de ids **`drawer-editplan-`** para no colisionar con el wizard (`drawer-wiz-`) si coexistieran overlays; la lógica compartida es `attachWizardContenidosPaso2(..., { idPrefix: 'drawer-editplan' })`.
- **Datos por fila:** `colaboradorId`, `nombreUsuario`, `avatar`, `contenidos[]`, `contenidosCount`. Validación coherente con crear: guardar exige fechas de vigencia y al menos una asignación con contenidos.
- **Nombre del plan y tag de estado (misma fila que detalle):** en **`detalle-plan.html`** el nombre es un **`h1` de solo lectura**; en **`editar-plan-contenidos.html`** es **textarea** editable. Ambos usan **`.detalle-plan-progress-card__header`**: fila horizontal con nombre a la izquierda y **`#plan-estado-container`** + **`ubits-status-tag`** a la derecha. Import **`status-tag.css`**. **Importante (CSS):** en **`crear-plan-contenidos.css`**, **`.crear-plan-contenidos-form__field--nombre-plan`** usa **`flex-direction: column`**, lo que por defecto apilaría el tag **debajo** del título. **`editar-plan-contenidos.css`** añade la clase **`editar-plan-nombre-row`** y reglas con **mayor especificidad** (p. ej. **`.crear-plan-contenidos-form__field--nombre-plan.editar-plan-nombre-row`**) con **`flex-direction: row`**, **`align-items: center`**, **`justify-content: space-between`**, y el textarea con **`flex: 1`** / **`min-width: 0`**, alineado al header del detalle en **`detalle-plan.css`**. Ver **§ 6.2.1**.
- **Tag de estado en reposo (lectura «semántica» vs UI):** si el plan viene del catálogo con estado **Procesando** (p. ej. `Procesando 0%`), **no** se muestra ese texto en el tag: en **`editar-plan-contenidos`** y **`editar-plan-competencias`** el tag en reposo muestra **Planeado** (variante `info`, `sm`) con su tooltip, para no sugerir que el plan sigue «en cola» mientras el administrador ya está completando asignaciones. Los estados **Vigente** y **Planeado** «reales» se muestran tal cual.
- **Tras «Agregar asignación» (wizard 2 pasos, botón Agregar):** cuando se incorpora **al menos una fila nueva** a la tabla, el **status tag** (`warning`) muestra el mismo tipo de animación que en **`planes-formacion.html`** para planes en proceso: el texto **dentro de** `ubits-status-tag__text` pasa de **«Procesando 0%»** a **«Procesando 100%»** en **4 segundos** (incrementos de 1% cada 40 ms, sin barra aparte). Es feedback de «procesando la nueva asignación». Al llegar a 100%, el tag **vuelve al estado estable anterior**: **Planeado** o **Vigente**, según el plan en catálogo (si el catálogo era Procesando, en reposo se muestra **Planeado**). El toast de éxito solo se muestra si hubo filas realmente agregadas. **Misma** lógica en **`editar-plan-competencias.html`** (ver **§ 4.3.2**).

### 3.3 Detalle del plan – Tabla y drawer

- La página **`detalle-plan.html`** aplica a planes **Vigente**, **No vigente** y también puede mostrar un plan **Planeado** (misma UI; progreso 0 %). **Desde la lista** (`planes-formacion`), el **clic en fila** para **Planeado** abre **edición**, no el detalle (**§ 4.4**). **Procesando** desde la lista va a **editar**.
- **Vista de solo consulta:** no hay botón **Guardar** en el header product ni botón primario **«Agregar asignación»** en la tabla; el nombre del plan, fechas de vigencia y demás datos del card se muestran como **texto** (no textarea ni calendar). Para editar el plan o añadir asignaciones desde cero se usa **`editar-plan-contenidos.html`**.
- Cada fila = un **estudiante** asignado.
- Columnas: usuario, último acceso, **contenidos**, **progreso**. Si el plan es Planeado, el progreso del plan y el de cada fila se muestran en 0 %.
- **Búsqueda en la tabla de asignaciones:** la barra de búsqueda del componente **`ubits-data-table`** filtra por el texto visible en las columnas (nombre de usuario, fechas, «N contenidos», porcentaje, etc.). El texto del **nombre** se obtiene de la celda usuario (avatar + nombre) con la lógica documentada en **§ 6.6** (evita depender solo del primer `span` vacío del avatar).
- Clic en fila (o contenidos) abre el **drawer** de ese estudiante con cards de contenidos y progreso por contenido.

#### 3.3.1 Barra de acciones y "Asignar contenidos" (solo Planeado y Vigente)

- Con **varias personas seleccionadas** (checkboxes) en la tabla de asignaciones aparece la barra de acciones con botones.
- **Solo para planes en estado Planeado o Vigente** (no para No vigente), entre "Enviar recordatorio" y "Eliminar del plan" hay un botón secundario **"Asignar contenidos"**.
- Al hacer clic se abre el **mismo drawer "Agregar contenidos"** (búsqueda, cards compactos, tabla de agregados). Los contenidos elegidos se **asignan a todas las personas seleccionadas**: se hace merge por curso (sin duplicar); no se borran los contenidos que cada uno ya tenía.

#### 3.3.2 Drawer "Agregar contenidos" en detalle-plan

- Mismo comportamiento que en crear-plan (ver 3.2.1): búsqueda, filtro por origen (si aplica), cards compactos y **scroll infinito** (12 contenidos iniciales, más al hacer scroll en la zona de resultados), de modo que se pueden cargar todos los contenidos del catálogo.

---

## 4. Planes de competencias

### 4.1 Definición

Un **plan de competencias** asigna **competencias** (no contenidos concretos) a grupos o personas dentro de un rango de fechas. El plan tiene:

- Nombre
- **Fecha de inicio** y **fecha de fin**
- **Horas por competencia** (campo exclusivo de este tipo de plan; ver 4.2)
- Listado de **asignaciones**: quiénes están asignados y **qué competencias** tiene cada asignación.

No se asignan "contenidos" (cursos/cápsulas); se asignan competencias. La carga de estudio se calcula a partir de las horas por competencia y el número de competencias.

### 4.2 Horas por competencia (intensidad horaria)

- **Nombre en UI (sugerido):** "Horas por competencia" (o "Intensidad horaria" si se prefiere copy más corto).
- **Significado:** Número de **horas que cada estudiante debe dedicar por cada competencia** asignada en el plan.
- **Ejemplo:** Si el administrador indica **4** horas por competencia y asigna **5 competencias** a un grupo de personas, **cada persona** de ese grupo debe estudiar **4 h × 5 = 20 horas** en total (4 h por cada una de las 5 competencias).
- **Tipo de campo:** Numérico (entero o decimal según reglas de negocio).
- **Ubicación en la UI:** Junto a la vigencia (al lado de la fecha de finalización) en **crear-plan-competencias** y en **editar-plan-competencias** (editable según estado). En **`detalle-plan-competencias.html`** el valor se muestra solo como **texto** (vista de consulta de progreso; la edición es en **editar-plan-competencias**).

Este valor es **por plan** (no por asignación): todas las asignaciones del plan comparten la misma "horas por competencia". El total de horas por persona = **horas por competencia × número de competencias asignadas a esa persona/grupo**.

### 4.3 Creación (crear-plan-competencias)

- Formulario: nombre del plan, vigencia (fecha inicio, fecha fin), **horas por competencia**.
- Tabla de asignaciones: columnas "Asignados" y "Competencias asignadas"; botón "Agregar competencias" / "X competencias" por fila.
- Drawer **"Agregar competencias"** para elegir competencias (y habilidades) por asignación; **no** drawer de contenidos/cursos.
- Validación: todas las asignaciones deben tener al menos una competencia para poder guardar.

#### 4.3.1 Drawer "Agregar competencias" (detalle)

- En **crear plan competencias**, el mismo drawer puede ser **wizard de 3 pasos** (tipo de asignación → participantes → competencias). Ver **§ 6.5** (el paso de catálogo aquí no usa el filtro UBITS/propio del plan de contenidos).
- **Izquierda:** cards de competencia (mismo estilo que en catalogo-v5: imagen + nombre + "X habilidades"), **sin** status tag "Asignado" ni botones a la derecha. Búsqueda por texto (competencia, academia o habilidad).
- **Selección:** al hacer clic en una card: (1) borde azul, (2) la card se expande y muestra la lista de **habilidades** hijas de esa competencia, cada una con un **checkbox** (todas marcadas por defecto); (3) la competencia se agrega a la tabla de la derecha.
- **Habilidades:** el usuario puede desmarcar las que no quiera. Si desmarca **todas** las habilidades, la competencia se deselecciona y se elimina de la tabla (no tiene sentido una competencia sin habilidades).
- **Tabla derecha:** una fila por competencia seleccionada. La celda de competencia tiene **dos líneas**: línea principal = nombre de la competencia, línea secundaria (estilo helper) = "X habilidad(es)". Botón eliminar quita la competencia de la selección.
- **Datos guardados por asignación:** array de ítems `{ id, title, habilidades: [] }` (`id` = id de competencia en BD, p. ej. `comp-001`; `title` = nombre; `habilidades` = nombres seleccionados). Origen: `bd-master-competencias.js` + `bd-master-habilidades.js` y el helper `catalogo-competencias-drawer.js` (expone `CATALOGO_COMPETENCIAS_DRAWER`, mismas globales que catalogo-v5).

#### 4.3.2 Edición de plan de competencias (`editar-plan-competencias.html`)

Pantalla de **edición** para planes en **Planeado**, **Procesando** o **Vigente** (equivalente funcional a **`editar-plan-contenidos.html`** § 3.2.2, adaptada a competencias y horas). Entrada: lista (**§ 4.4**, clic en fila si **Procesando**, menú **⋮ → Editar** si Planeado/Procesando/Vigente) o URL **`?id=`** (catálogo alineado a **planes-formacion.html**). Objetivo: completar o ajustar asignaciones; si el plan aún está en **Procesando** en backend, completar antes de que pase a otro estado.

**Comportamiento compartido del status tag con contenidos:** ver **§ 3.2.2** (tag **Planeado** en reposo cuando el catálogo es **Procesando**; animación **«Procesando 0%»…«100%»** en el tag al agregar asignación nueva). Detalle específico de competencias en el siguiente listado.

**Qué incluye la página**

- **Cabecera:** nombre del plan (textarea editable), **vigencia** (fecha inicio, fecha fin) e **input «Horas de estudio por competencia»** (numérico; solo dígitos en teclado, pegado e `input`, igual que en `crear-plan-competencias.html`). Junto al nombre, **en la misma fila**, **status tag** y **`#plan-estado-container`** como en **`detalle-plan.html`** / **`editar-plan-contenidos`** (prototipo: **Planeado**); **`status-tag.css`**; clase **`editar-plan-nombre-row`** y **`editar-plan-competencias.css`** sobrescriben **`flex-direction: column`** de **`.crear-plan-competencias-form__field--nombre-plan`** con **`flex-direction: row`** (mismo patrón que § 3.2.2 y **§ 6.2.1**).
- **Tabla de asignaciones:** una **fila por colaborador** (sin toda la empresa, grupos ni importación por archivo). Columnas: **Nombre de usuario** y **Competencias asignadas** (botón «Agregar competencias» o «N competencias»).
- **Drawer «Agregar asignación»** (`#drawer-agregar-usuarios`): stepper de **2 pasos** — **1 · Participantes** → **2 · Competencias**. Misma idea que en editar contenidos: tabla de colaboradores disponibles (excluye quienes ya tienen fila); luego catálogo de competencias (búsqueda, grid de cards en varias columnas, habilidades con checkbox y orden por drag). HTML generado en JS: `getDrawerAgregarAsignacionEditarPlanHtml()` — paso catálogo `#drawer-wizard-step3`, búsqueda `#drawer-wiz-comp-search-container`, resultados `#drawer-wiz-competencias-cards-container`, empty search `#drawer-wiz-competencias-empty-search`.
- **Tag de estado y animación (alineado a § 3.2.2 y `planes-formacion.html`):** en reposo, si el catálogo trae **Procesando**, el tag muestra **Planeado**; **Vigente** y **Planeado** se muestran tal cual. Tras confirmar **Agregar** en el wizard con **al menos una fila nueva**, el texto **dentro** del `ubits-status-tag` anima **«Procesando 0%»** → **«Procesando 100%»** en **4 s** (incrementos de 1% cada 40 ms); al terminar, vuelve al estado estable (**Planeado** o **Vigente**). Toast solo si hubo filas agregadas.
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
| `editar-plan-competencias.html` | Marcado, tabla, drawers y scripts inline (catálogo ids **`c0`–`c3`**, query **`?id=`**). JS: **`getEstadoTagEstableVisual`**, **`iniciarAnimacionEstadoProcesandoAsignacion`** (mismo criterio que **editar-plan-contenidos** / lista **planes-formacion**). |
| `editar-plan-competencias.css` | Estilos propios mínimos + **fila título + status tag** (ver **§ 6.2.1**); el layout reutiliza **`crear-plan-competencias.css`** y **`crear-plan-contenidos.css`**. |
| `catalogo-competencias-drawer.js` | Catálogo global `CATALOGO_COMPETENCIAS_DRAWER` (+ imágenes / iconos de habilidades vía globales del drawer). |
| `bd-master-competencias.js`, `bd-master-habilidades.js` | Datos maestros de competencias y habilidades. |

**Navegación desde la lista:** ver **§ 2.1.2** y **§ 4.4** (tab Competencias → Procesando abre esta página).

### 4.4 Lista de planes y navegación (planes-formacion.html)

- En **planes-formacion.html** hay dos tabs: **Planes de contenidos** y **Planes de competencias**.
- **Tab Planes de contenidos — clic en fila:** **Procesando** o **Planeado** → **`editar-plan-contenidos.html?id=`**; **Vigente** o **No vigente** → **`detalle-plan.html?id=`** (consulta de progreso). El menú **⋮ → Editar** sigue llevando a edición cuando el estado lo permite (ver siguiente punto).
- **Tab Planes de competencias — clic en fila:** **Procesando** o **Planeado** → **`editar-plan-competencias.html?id=`**; **Vigente** o **No vigente** → **`detalle-plan-competencias.html?id=`**.
- **Menú de acciones (⋮) por fila:**  
  - **Ver progreso:** solo si el estado es **Vigente** o **No vigente**. Navega a **contenidos** → `detalle-plan.html?id=`; **competencias** → `detalle-plan-competencias.html?id=`.  
  - **Editar:** solo si el estado es **Planeado**, **Procesando** (cualquier %) o **Vigente**. **No** se muestra para **No vigente** (el plan ya cerró; no tiene sentido editarlo). Navega a **`editar-plan-contenidos.html?id=`** o **`editar-plan-competencias.html?id=`** según el tab activo.  
  - **Eliminar:** abre el **mismo modal** que la barra de acciones al eliminar varios (confirmar escribiendo «eliminar»); aplica a la fila actual en contenidos o competencias.  
- **Plantillas de edición (`editar-plan-contenidos.html`, `editar-plan-competencias.html`):** reciben **`?id=`** del plan. Los datos mostrados (nombre, fechas, estado en tag, asignaciones de ejemplo, horas por competencia en competencias) se cargan desde un **catálogo local alineado** con los mismos ids y metadatos que la lista en **planes-formacion.html**. Si alguien abre la URL de edición con un plan **No vigente**, la página **redirige** al detalle correspondiente (`detalle-plan.html` o `detalle-plan-competencias.html`), igual que si entrara solo a “ver” el plan cerrado.

### 4.5 Detalle del plan de competencias (detalle-plan-competencias.html)

- **Detalle (consulta de progreso):** **`detalle-plan-competencias.html`** para planes **Vigente** o **No vigente** (p. ej. clic en fila desde la lista o **⋮ → Ver progreso**). **Procesando** y **Planeado** entran por **`editar-plan-competencias.html`** desde la lista (§ 4.4); § 4.3.2 describe la edición mientras está en Procesando.
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
| Drawer de asignación | Agregar contenidos (ver 3.2.1: cards compactos, filtro por origen, scroll) | Agregar competencias (ver 4.3.1: cards competencia + habilidades con checkbox; tabla dos líneas) |
| Cálculo de carga | Según contenidos/contenidos asignados | Horas por competencia × nº de competencias por persona |

---

## 5. Resumen de coherencia de datos

- Plan recién creado (sale de Procesando): **estado** = Planeado o Vigente; **progreso** = 0 % (o bajo).
- Progreso en tabla de planes = agregado del avance de estudiantes.
- Progreso por fila (estudiante) = agregado del avance de ese estudiante en sus contenidos o competencias.
- **No vigente** solo para planes cuya fecha de fin ya pasó; nunca como resultado de "acabar de crear" un plan.
- En **planes de competencias**, el total de horas por estudiante = **horas por competencia** × **cantidad de competencias** asignadas a ese estudiante/grupo.

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
- **`editar-plan-contenidos.html`** y **`editar-plan-competencias.html`** repiten ese patrón: **`#asignacion-nombre`** + **`#plan-estado-container`** dentro del campo de nombre, clase adicional **`editar-plan-nombre-row`**. Componente **`status-tag.css`**. En **ambas** pantallas de edición, el estado **Procesando** del catálogo se **muestra como Planeado** en el tag en reposo (ver **§ 3.2.2** y **§ 4.3.2**). Tras **agregar asignación** nueva (wizard 2 pasos), en **ambas** páginas la animación es la misma: texto **`Procesando N%`** dentro del **`ubits-status-tag`** durante 4 s, como en **`planes-formacion.html`**.
- **Por qué hace falta CSS extra:** en **`crear-plan-contenidos.css`** y **`crear-plan-competencias.css`**, **`.…-form__field--nombre-plan`** define **`flex-direction: column`** (apila hijos). Si solo se añadiera el tag como segundo hijo **sin** sobrescribir la dirección, el tag quedaría **debajo** del título. Los archivos **`editar-plan-contenidos.css`** y **`editar-plan-competencias.css`** declaran selectores **más específicos** — p. ej. **`.crear-plan-contenidos-form__field--nombre-plan.editar-plan-nombre-row`** / **`.crear-plan-competencias-form__field--nombre-plan.editar-plan-nombre-row`** — con **`flex-direction: row`**, **`align-items: center`**, **`justify-content: space-between`**, **`gap`**, y el textarea con **`flex: 1`** y **`min-width: 0`**, equivalentes a **`.detalle-plan-progress-card__header`** en **`detalle-plan.css`**.

### 6.3 Habilidades (filas arrastrables)

- El icono de **drag** (grip vertical) en las filas de habilidades usa el color **`--ubits-fg-1-medium-inverted`** en `crear-plan-competencias` y `detalle-plan-competencias`.

### 6.4 Archivos HTML del módulo LMS Creator

| Archivo | Rol |
|---------|-----|
| `planes-formacion.html` | Lista de planes (tabs Contenidos / Competencias). Clic en fila: **Procesando** o **Planeado** → **editar-plan-***; **Vigente** o **No vigente** → **detalle-plan-***. Menú **⋮:** Ver progreso, **Editar** (Planeado/Procesando/Vigente), Eliminar (**§ 4.4**). Animación en tabla: tag **Procesando N%** en planes en proceso (**§ 2.1** / lista). |
| `crear-plan-contenidos.html` | Creación de plan de contenidos: nombre, vigencia, tabla de asignaciones, drawer Agregar contenidos. |
| `crear-plan-competencias.html` | Creación de plan de competencias: nombre, vigencia, horas por competencia, tabla de asignaciones, drawer Agregar competencias (cards + habilidades). |
| `editar-plan-contenidos.html` | Edición con **`?id=`** (Planeado / Procesando / Vigente). Tabla una fila por usuario; «Agregar asignación» = wizard 2 pasos (participantes → contenidos); por fila, drawer catálogo (`drawer-editplan`). Tag: **Planeado** en reposo si catálogo Procesando; animación **Procesando N%** en el tag al **agregar** asignación (**§ 3.2.2**). Título + tag en fila (**§ 6.2.1**). |
| `editar-plan-contenidos.css` | Fila título + tag: sobrescribe **`flex-direction: column`** del bloque nombre en crear-plan-contenidos (alineado a `detalle-plan`). |
| `editar-plan-competencias.html` | Misma idea que la fila anterior con competencias y **horas por competencia**; wizard 2 pasos, `attachWizardCompetenciasPaso2`, drawer fila `#drawer-agregar-competencias`. Mismo criterio de **tag en reposo** y **animación al agregar asignación** que contenidos (**§ 4.3.2**, **§ 6.2.1**). |
| `editar-plan-competencias.css` | Incluye la misma lógica de fila título + tag que `editar-plan-contenidos.css` + estilos mínimos propios. |
| `detalle-plan.html` | Detalle de plan de **contenidos** (solo consulta de progreso: sin Guardar ni «Agregar asignación» en tabla; card en texto). Drawers y barra de acciones según estado. Búsqueda de tabla: **§ 6.6**. |
| `detalle-plan-competencias.html` | Detalle de plan de **competencias** (mismo criterio de solo lectura en card). Tabla, drawers y **§ 6.6**. |
| `grupos.html`, `detalle-grupo.html`, `crear-grupo.html` | Gestión de grupos. |
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
- **Paso 3 — Catálogo:** en **contenidos**, búsqueda + filtro por origen + grid de cards de contenido; en **competencias**, búsqueda + grid de cards de competencia (sin el mismo filtro de catálogo UBITS/propio que en contenidos).

#### Reglas de UI acordadas (no duplicar ni líneas extra)

- **Sin título duplicado en paso 2:** el stepper ya muestra la etiqueta **«Participantes»**; **no** se añade un encabezado de texto ni un separador adicional encima de las tablas (el contenido del paso es solo el panel visible).
- **Sin borde superior en paneles de participantes:** la clase **`.drawer-usuarios-panel`** en `crear-plan-contenidos.css` y `crear-plan-competencias.css` define solo `display: flex`, `flex-direction: column` y `gap` — **sin** `border-top`, **sin** `margin-top` / `padding-top` extra que dibujaran una línea entre las cards del paso 1 y la tabla (vale tanto para colaboradores como para grupos).

#### Paso 3 en plan de contenidos — filtro del catálogo (dropdown)

- **Textos de las opciones** (UI): **Todos**, **Solo catálogo UBITS**, **Solo catálogo propio**. Valores internos: `all`, `ubits`, `empresa` (filtran por `courseSource` en el catálogo). Mismas etiquetas en **`crear-plan-contenidos.html`**, **`editar-plan-contenidos.html`** (wizard de 2 pasos y drawer solo catálogo por fila).
- **Visibilidad del menú (z-index):** el overlay del dropdown debe quedar **por encima** del drawer (el drawer usa `z-index` 1100–1101 en `components/drawer.css`; el dropdown por defecto en `dropdown-menu.css` está por debajo). En **`crear-plan-contenidos.css`** se listan explícitamente los IDs de overlay del filtro con **`z-index` 1102** (overlay) y **1103** (`.ubits-dropdown-menu__content`), entre otros:
  - `#drawer-cursos-filter-overlay`, `#drawer-wiz-cursos-filter-overlay` (crear / wizard),
  - **`#drawer-editplan-cursos-filter-overlay`** (drawer «Editar contenidos» por fila en `editar-plan-contenidos`, prefijo `drawer-editplan-`).
- **Id del overlay:** en JS el id debe ser **`…-cursos-filter-overlay`** (p. ej. `drawer-wiz-cursos-filter-overlay`), **no** `…-cursos-filter-overlay-edit`, para que coincida con las reglas CSS anteriores; el prefijo `drawer-editplan` cubre el drawer de edición por fila.
- **Alineación:** el panel del menú debe quedar con el **borde derecho alineado al botón** de filtro (icono); en JS, tras `openDropdownMenu`, se fuerza `left: auto` y `right` en px respecto al ancho del viewport (`window.innerWidth - getBoundingClientRect().right` del botón), y un segundo ajuste en `requestAnimationFrame` por si cambia el ancho tras el layout.

#### Archivos tocados por este flujo

| Archivo | Rol |
|---------|-----|
| `crear-plan-contenidos.html` | HTML/JS del wizard: steppers 2 y 3 pasos, pasos DOM `#drawer-wizard-step1` … `step3`, filtro wizard `#drawer-wiz-cursos-filter-btn` / overlay `#drawer-wiz-cursos-filter-overlay`. |
| `crear-plan-competencias.html` | Mismo patrón de wizard; paso 3 es competencias (`#drawer-wiz-comp-search-container`, etc.), sin filtro de catálogo UBITS/propio. |
| `crear-plan-contenidos.css` | Estilos stepper en drawer, paneles `.drawer-usuarios-panel`, z-index filtros (`#drawer-cursos-filter-overlay`, `#drawer-wiz-cursos-filter-overlay`, **`#drawer-editplan-cursos-filter-overlay`**). |
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

En páginas que usen `createUbitsDataTable` con orden o filtros en columnas: **dropdown-menu** + **table** + **checkbox** + **empty-state** + **input** + **tooltip**, según indica el comentario de cabecera de `ubits-data-table.js`. Ver también la lista de **§ 6.4** y ejemplos en `crear-plan-contenidos.html` / `planes-formacion.html`.

---

*Última actualización: marzo 2026. Prototipo: LMS Creator. **Lista `planes-formacion.html` (§ 4.4):** menú ⋮ (**Ver progreso**, **Editar**, **Eliminar**), plantillas **`?id=`**, redirección edición si No vigente. **Crear contenidos / detalle:** § 3.2.1, 3.3. **Editar plan contenidos y competencias (`editar-plan-*.html`):** § 3.2.2 y § 4.3.2 — catálogo **`?id=`**; tag en reposo **Planeado** si backend **Procesando**; al **agregar asignación** (wizard 2 pasos): texto **«Procesando 0%»…«100%»** **dentro** del **status tag** en 4 s (como la lista en `planes-formacion.html`); vuelta a **Planeado** o **Vigente**; toast solo si hubo filas nuevas. Competencias: horas por competencia, `attachWizardCompetenciasPaso2`, prefijos `drawer-wiz` / `drawer-editplan`, planes semilla **§ 2.1.2**. **§ 6.2.1** título + tag en fila; **§ 6.4** tabla de archivos; **§ 6.5** wizard 2 vs 3 pasos y filtros; **§ 6.6** búsqueda en `ubits-data-table` (texto de celda por columnas usuario/avatar).*
