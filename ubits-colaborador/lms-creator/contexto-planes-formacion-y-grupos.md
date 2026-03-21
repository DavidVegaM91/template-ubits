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

**Planeado:** al abrir un plan con estado Planeado se usa la **misma página de detalle** que para un plan Vigente (`detalle-plan.html`): misma vista, misma tabla de asignaciones y mismos drawers. La única diferencia es el **status tag** ("Planeado") y que el **progreso del plan y el de cada usuario se muestran en 0 %** (al no haber iniciado, no hay progreso). No se usa una vista 100 % editable para Planeado.

#### 2.1.1 Cómo se ve el detalle del plan según el estado

En **planes de contenidos**, al abrir un plan desde la lista:

| Estado       | Página que se abre      | Tag visible | Progreso        | Fecha de fin  | Botón principal     | Clic en fila / contenidos                    | Barra de acciones (varios seleccionados)     |
|-------------|--------------------------|-------------|-----------------|---------------|----------------------|----------------------------------------------|-----------------------------------------------|
| **Procesando** | Editar (p. ej. `editar-plan-contenidos`) | Procesando X% | —               | —             | —                    | —                                            | —                                              |
| **Planeado**   | `detalle-plan.html`      | Planeado    | 0 % (plan y por fila) | Editable      | "Agregar asignación" | Drawer **Agregar contenidos**                | Enviar recordatorio, **Asignar contenidos**, Eliminar del plan |
| **Vigente**    | `detalle-plan.html`      | Vigente     | Real (plan y por fila) | Editable      | "Agregar asignación" | Drawer **Agregar contenidos**                | Enviar recordatorio, **Asignar contenidos**, Eliminar del plan |
| **No vigente** | `detalle-plan.html`      | No vigente  | Congelado       | Solo lectura  | No (o no destacado)  | **Panel de solo lectura** (sin drawer agregar) | Solo Enviar recordatorio y Eliminar del plan (sin "Asignar contenidos") |

- **Planeado y Vigente:** misma pantalla; solo cambian el tag y si el progreso es 0 % o real. En ambos se puede agregar asignación, editar fecha de fin, abrir el drawer para agregar contenidos por fila y usar "Asignar contenidos" para varias personas a la vez.
- **No vigente:** no se puede agregar contenidos desde el drawer (el clic en fila abre un panel de solo lectura); la barra de acciones no muestra el botón "Asignar contenidos".

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

#### 3.2.1 Drawer "Agregar contenidos" (detalle)

- En **crear** (y el flujo equivalente en **editar** con el mismo drawer), puede mostrarse el **wizard por pasos** (tipo de asignación → participantes → contenidos). Ver **§ 6.5** (stepper, paso participantes, filtro y z-index).
- **Izquierda:** búsqueda por texto (título o competencia del curso) y filtro por origen (Todos / Solo catálogo UBITS / Solo catálogo propio). Grid de **cards compactos de contenido** (componente `card-content-compact`): miniatura, título, etc. Al hacer clic en una card se agrega a la selección y la card muestra borde azul (estado seleccionado). Scroll infinito: se cargan 12 contenidos inicialmente y más al hacer scroll.
- **Tabla derecha:** una fila por contenido seleccionado: celda con título del contenido y botón eliminar. Empty state cuando no hay ninguno ("No hay contenidos agregados").
- **Datos guardados por asignación:** array de ítems de curso (id, title, etc.). Origen: **`bd-master`** (`bd-contenidos-*` + maestros); la lista del drawer la arma **`catalogo-contenidos-drawer.js`** (en esta carpeta) → `window.CATALOGO_CURSOS_DRAWER`.

### 3.3 Detalle del plan – Tabla y drawer

- Para planes **Planeado** y **Vigente** (y No vigente) se usa la misma página **detalle-plan**. Solo **Procesando** redirige a editar (si aplica).
- Cada fila = un **estudiante** asignado.
- Columnas: usuario, último acceso, **contenidos**, **progreso**. Si el plan es Planeado, el progreso del plan y el de cada fila se muestran en 0 %.
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
- **Ubicación en la UI:** Junto a la vigencia (al lado de la fecha de finalización) en **crear-plan-competencias** y en **detalle-plan-competencias**.
- **En detalle del plan:** Si el plan es **Vigente** o **Planeado**, el campo es **editable** (input numérico; solo se admiten dígitos: teclado, pegado y validación en `input` filtran no numéricos). Si el plan es **No vigente**, se muestra como **texto** (solo lectura), igual que las fechas en planes no vigentes.

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

### 4.4 Lista de planes y navegación (planes-formacion.html)

- En **planes-formacion.html** hay dos tabs: **Planes de contenidos** y **Planes de competencias**.
- En el tab **Planes de competencias** la tabla muestra solo planes de tipo competencias (ej. 3 planes: uno Planeado, uno Vigente, uno No vigente). Al hacer clic en una fila se navega a **detalle-plan-competencias.html?id=**`<id>` (ej. `c1`, `c2`, `c3`). El detalle muestra nombre, fechas, estado, progreso y **horas de estudio por competencia** coherentes con el plan elegido.

### 4.5 Detalle del plan de competencias (detalle-plan-competencias.html)

- Para planes de competencias en estado **Planeado**, **Vigente** o **No vigente** se usa la misma página **detalle-plan-competencias.html** (no hay redirección a editar como en contenidos con "Procesando").
- Card de progreso: nombre del plan, **fechas** (inicio; fin editable solo si Vigente/Planeado, texto si No vigente), **horas de estudio por competencia** (editable si Vigente/Planeado, texto si No vigente), barra de progreso del plan.
- Tabla de asignaciones: columnas usuario, último acceso, competencias asignadas, progreso. Botón "Agregar competencias" / "X competencias" por fila. Clic en fila o en el botón abre el **drawer "Agregar competencias"** (mismo comportamiento que en crear-plan: cards de competencia, expansión con habilidades y checkboxes, tabla derecha con dos líneas por competencia).
- Con **varias personas seleccionadas**, barra de acciones con **"Asignar competencias"** (solo Planeado/Vigente): se abre el mismo drawer y los ítems elegidos se hacen **merge** en cada persona seleccionada (sin duplicar por id de competencia).

### 4.6 Diferencias resumidas frente a planes de contenidos

| Aspecto | Plan de contenidos | Plan de competencias |
|---------|--------------------|------------------------|
| Página de creación | `crear-plan-contenidos.html` | `crear-plan-competencias.html` |
| Página de detalle | `detalle-plan.html` | `detalle-plan-competencias.html` |
| Campo extra (crear y detalle) | — | **Horas por competencia** (junto a fechas; en detalle: editable Vigente/Planeado, solo lectura No vigente) |
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

### 6.2 Cards de competencias – Estilo y progreso

- **Bordes:** borde por defecto con token **`--ubits-border-1`** (nunca blanco/transparente). En contextos con selección: **hover** = borde azul (`--ubits-accent-brand`); **seleccionado** = borde azul **2 px**. Aplica en `detalle-plan-competencias` y `crear-plan-competencias`.
- **Barra de progreso:** se renderiza **siempre** en cada card (con o sin progreso) para mantener **altura fija**. La barra va en **overlay** (position absolute, bottom 0) para no cambiar la altura del card (referente: `card-content-compact`).
- **Planeado:** el progreso mostrado en los cards es **0 %** (no hay avance antes de que inicie el plan).
- **Vigente:** si el usuario deselecciona una competencia y vuelve a seleccionarla, se **conserva el progreso** que ya tenía (no se resetea a 0). El progreso se toma de `competenciaPorUsuario` al añadir de nuevo la competencia.

### 6.3 Habilidades (filas arrastrables)

- El icono de **drag** (grip vertical) en las filas de habilidades usa el color **`--ubits-fg-1-medium-inverted`** en `crear-plan-competencias` y `detalle-plan-competencias`.

### 6.4 Archivos HTML del módulo LMS Creator

| Archivo | Rol |
|---------|-----|
| `planes-formacion.html` | Lista de planes (tabs Contenidos / Competencias). Navega a crear-plan-*, detalle-plan*, editar-plan-contenidos según tipo y estado. |
| `crear-plan-contenidos.html` | Creación de plan de contenidos: nombre, vigencia, tabla de asignaciones, drawer Agregar contenidos. |
| `crear-plan-competencias.html` | Creación de plan de competencias: nombre, vigencia, horas por competencia, tabla de asignaciones, drawer Agregar competencias (cards + habilidades). |
| `editar-plan-contenidos.html` | Vista de edición mientras el plan está en estado Procesando (contenidos). |
| `detalle-plan.html` | Detalle de plan de **contenidos**: card de progreso, tabla de asignaciones, drawer Agregar contenidos por fila y por acciones masivas. |
| `detalle-plan-competencias.html` | Detalle de plan de **competencias**: card de progreso + horas por competencia, tabla de asignaciones, drawer por fila (Agregar competencias o solo ver progreso según estado) y drawer "Asignar competencias" para varios. |
| `grupos.html`, `detalle-grupo.html`, `crear-grupo.html` | Gestión de grupos. |
| `contenidos.html`, `categorias.html`, `chat-ia-grupos.html` | Contenidos, categorías y chat IA (otros flujos del LMS Creator). |

### 6.5 Wizard por pasos — drawer «Agregar asignación»

En **crear-plan-contenidos** y **crear-plan-competencias**, al añadir filas a la tabla de asignaciones se usa el drawer **`#drawer-agregar-usuarios`** (título típico **«Agregar asignación»**). El cuerpo incluye un **stepper** horizontal compacto (`components/stepper.css` / `stepper.js`) y bloques por paso generados en JS (`drawer-asignacion-wizard-root`).

#### Variantes de flujo (2 vs 3 pasos en el stepper)

| Stepper | Pasos visibles | Cuándo aplica |
|--------|----------------|----------------|
| **2 pasos** | 1 · Tipo de asignación → 2 · **Contenidos** o **Competencias** | Flujos que omiten la selección explícita de participantes en el wizard (p. ej. opción acortada según tipo de asignación; ver lógica `soloPaso2` / `getOpcionAsignacion()` en cada HTML). |
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

- **Textos de las opciones** (UI): **Todos**, **Solo catálogo UBITS**, **Solo catálogo propio**. Valores internos: `all`, `ubits`, `empresa` (filtran por `courseSource` en el catálogo). Mismas etiquetas donde se reutiliza el mismo patrón en **`editar-plan-contenidos.html`** (drawer de contenidos sin wizard de 3 pasos).
- **Visibilidad del menú:** el overlay del dropdown en el wizard usa id **`#drawer-wiz-cursos-filter-overlay`**. El componente dropdown tiene `z-index` por defecto inferior al **drawer** (1100–1101). En **`crear-plan-contenidos.css`** debe incluirse este id **junto** a `#drawer-cursos-filter-overlay` con `z-index` 1102 (overlay) / 1103 (contenido), para que el menú no quede **detrás** del panel lateral.
- **Alineación:** el panel del menú debe quedar con el **borde derecho alineado al botón** de filtro (icono); en JS, tras `openDropdownMenu`, se fuerza `left: auto` y `right` en px respecto al ancho del viewport (`window.innerWidth - getBoundingClientRect().right` del botón), y un segundo ajuste en `requestAnimationFrame` por si cambia el ancho tras el layout.

#### Archivos tocados por este flujo

| Archivo | Rol |
|---------|-----|
| `crear-plan-contenidos.html` | HTML/JS del wizard: steppers 2 y 3 pasos, pasos DOM `#drawer-wizard-step1` … `step3`, filtro wizard `#drawer-wiz-cursos-filter-btn` / overlay `#drawer-wiz-cursos-filter-overlay`. |
| `crear-plan-competencias.html` | Mismo patrón de wizard; paso 3 es competencias (`#drawer-wiz-comp-search-container`, etc.), sin filtro de catálogo UBITS/propio. |
| `crear-plan-contenidos.css` | Estilos stepper en drawer, paneles `.drawer-usuarios-panel`, z-index filtros `#drawer-wiz-cursos-filter-overlay` / `#drawer-cursos-filter-overlay`. |
| `crear-plan-competencias.css` | Igual para paneles `.drawer-usuarios-panel` y layout del wizard. |
| `editar-plan-contenidos.html` | Drawer «Agregar contenidos» (sin wizard de 3 pasos): mismas etiquetas de filtro y patrón de alineación del dropdown al botón. |

---

*Última actualización: marzo 2025. Prototipo: LMS Creator. Drawer "Agregar contenidos" en 3.2.1 y en detalle-plan (3.3.2, con scroll infinito); botón "Asignar contenidos" en barra de acciones (3.3.1, solo Planeado/Vigente). Planes de competencias: lista por tab en planes-formacion (4.4), detalle en detalle-plan-competencias (4.5), horas por competencia en crear y en detalle (editable/lectura según estado); drawer "Agregar competencias" en 4.3.1 y en detalle-plan-competencias (mismo layout y merge multi). Sección 6: detalles de implementación actual (drawers lg/sm, columnas, progress, bordes, altura fija, icono drag, tabla de archivos). **6.5:** wizard «Agregar asignación» (2 vs 3 pasos, participantes sin título duplicado, `.drawer-usuarios-panel` sin borde superior, filtro catálogo en paso contenidos: textos, z-index, alineación a la derecha del botón).*
