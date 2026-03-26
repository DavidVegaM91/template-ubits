![UBITS](../../images/Ubits-logo-dark.svg)

# Backlog – Tareas y Planes

Registro de cambios realizados en los archivos del módulo de Tareas y Planes (Planes, Detalle de plan, Mi lista de tareas, Detalle de tarea, Detalle de subtarea, Seguimiento, Seguimiento líder). Las entradas están ordenadas en orden cronológico, del más antiguo al más reciente.

**Archivos en scope (carpeta `ubits-colaborador/tareas/`):**
- **Planes:** `planes.css`, `planes.html`, `planes.js`
- **Detalle de plan:** `plan-detail.css`, `plan-detail.html`, `plan-detail.js`
- **Tareas (mi lista):** `tareas.css`, `tareas.html`, `tareas.js`
- **Detalle de tarea:** `task-detail.css`, `task-detail.html`, `task-detail.js`
- **Detalle de subtarea:** `subtask-detail.css`, `subtask-detail.html`, `subtask-detail.js`
- **Seguimiento:** `seguimiento.css`, `seguimiento.html`, `seguimiento.js`
- **Seguimiento líder:** `seguimiento-leader.css`, `seguimiento-leader.html`
- **Base de datos unificada:** `bd-master/bd-tareas-y-planes.js` (antes `tareas-base-unificada.js` en esta carpeta)
- **Plantilla:** `plantilla.html`, `plantilla.css`
- **Coachmark Seguimiento:** `coachmark-seguimiento.js`, `coachmark-seguimiento.css` (incluidos en `tareas.html` y `seguimiento.html` junto con `components/popover.*` y `components/coachmark.*`)

---

## Solicitudes 11 de febrero de 2026

---

### 1. Datos y usuario

1. [x] **Base de datos unificada y empresa de ejemplo**  
   Todas las páginas de tareas (Tareas, Planes, Detalle de plan, Seguimiento y Seguimiento líder) comparten **una sola base de datos** (`bd-master/bd-tareas-y-planes.js`, API `TAREAS_PLANES_DB`) que simula una empresa real: **Fiqsha Decoraciones S.A.S.**, con 8 áreas, 1 gerente, 8 jefes de área y 55 colaboradores en total. Los datos están en español (nombres, cargos, áreas) y el usuario que abre la plataforma es **María Alejandra Sánchez Pardo** (Jefe de Logística).  
   - **Tareas:** en promedio ~30 por usuario por mes: ~10 individuales (solo en Mi lista) y ~20 grupales (además en seguimiento). La mayoría vinculadas a un plan; unas pocas sueltas.  
   - **Planes:** individuales (~3 por mes para María) y grupales por área; misma lógica de estados.  
   - **Estados (tareas y planes):** reparto tipo real: **Finalizadas 70–85%**, **Iniciadas 10–20%**, **Vencidas 5–15%**.  
   - **Rango de fechas** de los datos: desde el **1 ene 2025** hasta el **28 feb 2026**.  
   Las vistas (tareas, planes, detalle, seguimiento) consumen solo esta BD; los filtros de período en seguimiento usan la fecha actual para que los totales sean coherentes.

2. [x] **Indicadores de seguimiento con formato numérico**  
    En `seguimiento.html` y `seguimiento-leader.html` los indicadores (Total, Finalizadas, Iniciadas, Vencidas) y el contador del header usan `formatIndicatorNumber()` en `seguimiento.js`: **< 10.000** → 1,556; **≥ 10.000** → 10,5 K; **≥ 1.000.000** → 2,7 M.

### 2. Estructura de páginas

3. [x] **Header product en planes y tareas**  
   Implementar el componente **header product** oficial en `planes.html` con version mobile de boton flotante.

### 3. Componentes oficiales UBITS

4. [x] **Revisión general de botones e inputs**  
   Revisar que en los archivos de scope se usen **botones e inputs oficiales** de UBITS (componentes del template), y corregir donde no sea así.

5. [x] **Verificar uso del componente oficial Status Tag**  
   Revisar que `plan-detail.html`, `planes.html` y `tareas.html` usen el **componente oficial Status Tag** de UBITS (clases y variantes correctas). Corregir cualquier etiqueta de estado que no lo use. *Verificado: las tres páginas importan `status-tag.css` y usan `ubits-status-tag`, variantes `--success`/`--info`/`--error`/`--neutral`, `--sm`, `--icon-left` y `ubits-status-tag__text`; seguimiento.js también.*

6. [x] **Componentizar la tirilla de tareas**  
   La tirilla de tareas que está dentro de `tareas.html` debe convertirse en un **componente reutilizable** (CSS + JS, y opcionalmente HTML de referencia). Sin documentacion en html, pero si creado para reutilizarlo. Una vez componentizada, **implementarla** tanto en `tareas.html` como en `plan-detail.html`. Primero implementala en plan detail que es mas chiquis, si queda bien ahi si la implementas en tareas.

7. [x] **Drawers de creación con componente oficial**  
   Asegurar que los drawers de **"Crear un plan"** y **"Crear una plantilla"** usen el **componente drawer oficial** UBITS.

8. [x] **Componentizar el detalle de tarea**  
   Crearlo e implementarlo en tareas, detalle de plan y paginas de seguimiento

### 4. Lógica e integración

9. [x] **Botón del header product: opciones y drawers**  
    Pasar la lógica del botón que actualmente despliega opciones (y cada opción abre el drawer flotante de creación correspondiente) en `planes.html` al **botón del header product**, de modo que ese botón sea el que despliegue las opciones y abra el drawer de crear plan o crear plantilla según corresponda.

10. [x] **En seguimiento: nombres clicables que abren detalle**  
    Una vez el detalle del plan (y detalle de tarea si aplica) esté verificado y pulido en `plan-detail.html`: en **seguimiento.html** y **seguimiento-leader.html**, hacer que los textos de las columnas **Nombre de la tarea** y **Nombre del plan** sean **clicables** (con subrayado / underline). Al hacer clic debe abrirse el **detalle de la tarea** o el **detalle del plan** correspondiente.

11. [x] **Seguimiento: botones de filtro en encabezados de tabla con estado active**  
    En **seguimiento.html** y **seguimiento-leader.html**, los botones de filtro en los encabezados de la tabla (Estado, Prioridad, Asignado, Área del asignado, Área del creador, Creador, Plan) muestran **estado active** (estilo activo) cuando ese filtro tiene valores aplicados.

12. [x] **Seguimiento: filtros aplicados debajo de los indicadores**  
    Se eliminó el botón de filtros que estaba arriba (en la barra del header) y la barra de **filtros aplicados** (chips) se movió **debajo de los indicadores** (Total, Finalizadas, Iniciadas, Vencidas), de modo que los chips y "Limpiar filtros" aparecen ahí.

### 5. Tareas vencidas (tareas.html – tareas-overdue-container)

13. [x] **Ordenar tareas vencidas por fecha de vencimiento**  
    En `tareas.html`, en la sección **tareas-overdue-container**, mostrar las tareas vencidas ordenadas de la **fecha de vencimiento más antigua a la más reciente**.

14. [x] **Marcar tarea vencida como finalizada y animar movimiento**  
    Permitir **marcar como finalizada** una tarea vencida. Al hacerlo: (1) cambiar su **status tag a "Finalizada"**, (2) **moverla al final de la lista** de vencidas. El movimiento debe ser **visible**: que se vea la tarea desplazándose hacia abajo de forma rápida (animación/transición), no que desaparezca y reaparezca al final, para evitar la sensación de error.

### 6. Panel detalle de tarea y seguimiento

15. [x] **Detalle de tarea: Asignado a y Creada por en una sola fila**  
    En el panel de detalle de la tarea, poner **"Creada por"** al lado derecho de **"Asignado a"**, de modo que ambos queden uno al lado del otro.

16. [x] **Seguimiento: control de seguridad para eliminar**  
    En `seguimiento.html`, en el flujo de eliminar tareas/planes: añadir un **control de seguridad**: el usuario debe escribir **"eliminar"** en un input; solo entonces se **habilita el botón de eliminar** en el modal.

17. [x] **Seguimiento: menú cambiar estado con texto, no status tag**  
    En `seguimiento.html`, en el botón/menú desplegable de **"Cambiar estado"**, mostrar **texto** en las opciones en lugar de **status tag** (Iniciada, Vencida, Finalizada como texto plano).

18. [x] **Tareas: confirmación de eliminar con modal UBITS y toast**  
    En `tareas.html`, sustituir el `confirm()` nativo al eliminar una tarea por un **modal UBITS** (componente modal): título "Eliminar tarea", mensaje de advertencia y botones "Cancelar" (secondary) y "Eliminar" (error). Tras confirmar, mostrar **toast de éxito** "Tarea eliminada correctamente", alineado con el flujo de finalizar tarea.

19. [x] **Tareas: empty state en Comentarios y evidencias**  
    En el panel de detalle de tarea, sección **Comentarios y evidencias**: cuando no hay comentarios se muestra el **componente oficial Empty State** (icono, título "Aún no hay comentarios", descripción "Aquí podrás ver el historial de comentarios y evidencias de esta tarea. Agrega el primero para empezar." y botón secundario "Agregar comentarios"). El botón del header "Agregar comentarios" se oculta en ese caso y solo aparece cuando ya hay uno o más comentarios. Acción compartida `taskDetailOnAddComment` para el CTA (placeholder hasta implementar el flujo de agregar comentario).

20. [x] **Tareas: fecha de vencimiento como botón terciario con calendario oficial**  
    En la tirilla de tarea (`tareas.js`), la **fecha de vencimiento** es un **botón terciario oficial** (`ubits-button--tertiary`, `ubits-button--sm`). Al hacer clic se abre el **calendario oficial** UBITS (`createCalendar`) en un popover con clase `ubits-calendar-dropdown`, pegado al botón. El posicionamiento replica el del input calendar: alineación por la derecha del botón y despliegue **arriba o abajo** según espacio en el viewport (espacio inferior vs superior). Tras elegir fecha se actualiza la tarea, se mueve entre vencidas/porDia y se re-renderiza; toast de éxito.

---

## Solicitudes 19 de febrero de 2026

*Ámbito: todas las tareas de esta sección aplican a `tareas.html`, excepto la última que aplica a todos los HTML de la carpeta tareas. Numeración continuación del 11 feb (ítems 21 en adelante).*

21. [x] **Seguimiento: columna Área dividida en Área del asignado y Área del creador**  
    En las páginas de seguimiento (`seguimiento.html`, `seguimiento-leader.html`), la columna única **Área** se dividió en dos: **Área del asignado** (área de quien tiene la tarea) y **Área del creador** (área de quien creó la tarea). Incluye filtros independientes en el drawer y en cabeceras de tabla, datos en BD con `areaCreador`, y área HR con planes de compañía (Objetivos/Encuestas Q). Las columnas Creador y Área del creador quedan ocultas por defecto en la tabla.

22. [x] **Tareas: mostrar tareas asignadas a María y las que ella creó para otros**  
    En `tareas.html` no debe mostrarse solo las tareas que María tiene asignada, sino también las tareas que **ella creó para otros** (creadas por María, asignadas a otra persona).

23. [x] **Tareas: permitir ver días anteriores en el calendario**  
    En `tareas.html` ahora se pueden navegar y ver días anteriores a hoy. Al cargar la página el día de hoy sigue pre-seleccionado. Los días pasados se renderizan en orden cronológico (`loadPastDay` los inserta en el contenedor usando `insertBefore`) y son de **solo lectura**: no muestran el botón "Añadir tarea". La flecha ◀ del calendario ya no bloquea al llegar a hoy. El botón "Hoy" sigue volviendo al día actual.

    > ⚠️ **Pendiente de validación con PM.** Si se decide revertir, aplicar estos cambios en `tareas.js`:
    >
    > **1. `getDaysInMonth` — restaurar el guard que bloqueaba días anteriores a hoy.**  
    > Agregar de vuelta las variables `todayDate/todayYear/todayMonth/todayDayNum` y el bloque `if (startDate < todayDateObj)` tras calcular `startDay`. El bloque completo a restaurar, justo antes del `let currentDay = startDay;`:
    > ```js
    > const todayDate = parseDateString(today);
    > const todayYear = todayDate.getFullYear();
    > const todayMonth = todayDate.getMonth();
    > const todayDayNum = todayDate.getDate();
    > // ... (donde dice "Día de inicio: N días antes del seleccionado (ahora permite días anteriores a hoy)")
    > // cambiar el comentario a "Día de inicio (N días antes del seleccionado, pero no antes de hoy)"
    > // y agregar después del cálculo de startDay:
    > const startDate = new Date(startYear, startMonth, startDay);
    > const todayDateObj = new Date(todayYear, todayMonth, todayDayNum);
    > if (startDate < todayDateObj) {
    >     startDay = todayDayNum;
    >     startMonth = todayMonth;
    >     startYear = todayYear;
    > }
    > ```
    >
    > **2. `renderDaySection` — eliminar `esPasado` y restaurar el bloque "Añadir tarea" incondicional.**  
    > Quitar `const esPasado = fechaKey < today;`. Cambiar `${!esPasado ? (...) : ''}` de vuelta a `${estadoTareas.addingTaskForDate === fechaKey ? \`...\` : \`...\`}` sin condición exterior.
    >
    > **3. `loadMoreDays` / `ensureDayLoaded` — eliminar `loadPastDay` y restaurar el guard.**  
    > Eliminar la función `loadPastDay` completa. En `ensureDayLoaded`, volver a:
    > ```js
    > function ensureDayLoaded(fechaKey) {
    >     if (!fechaKey || fechaKey < today) return;
    >     // resto igual
    > }
    > ```
    >
    > **4. `scrollToDay` — restaurar el fallback a `today` cuando el día es pasado.**  
    > Cambiar `const daySection` por `let daySection` y agregar:
    > ```js
    > if (!daySection && fechaKey < today) {
    >     daySection = document.querySelector(`.tareas-day-container[data-date="${today}"]`);
    > }
    > ```
    >
    > **5. `handlePreviousDay` — restaurar el guard que bloqueaba navegar al pasado.**  
    > Agregar de vuelta antes de `estadoTareas.selectedDay = newDateString;`:
    > ```js
    > if (newDateString < today) { return; }
    > ```

24. [x] **Tareas: lógica del acordeón "Vencidas"**  
    En `tareas.html`, en el acordeón de **Vencidas**:  
    - Si tiene **más de 5** tareas vencidas: ir **colapsado** y mostrar un **badge rojo con letra blanca** (como el que está dentro del componente de botón) con el **número total** de tareas vencidas.  
    - Si tiene **5 o menos**: ir **desplegado**, pero igual debe tener el **badge** que indica la cantidad.

25. [x] **Tareas: botón de filtros y drawer**  
    Añadir un **botón de filtros** en `tareas.html` que abra un **drawer** con estos filtros: **Estado**, **Prioridad**, y un filtro para ver **solo lo que asigné a otros** o **solo lo asignado a mí**.

26. [x] **Base de datos y vistas: estado "Iniciada" → "Por hacer"**  
    Cambiado en todos los HTML y JS de la carpeta `tareas`, más los componentes `task-strip.js` y `task-detail-panel.js`. El valor interno en los objetos JavaScript (`.status = 'Activo'`) **no cambió** — solo los strings de display. Archivos modificados: `task-strip.js` (línea 24 `estadoTexto`), `tareas.js` (label del drawer de filtros + `statusDisplay` del panel de detalle), `plan-detail.js` (`statusDisplay`), `seguimiento.js` (checkbox del drawer, `optionsMap`, `statusClass`, `syncTaskToRow`, `updateIndicadores`, menú "Cambiar estado" y modales), `seguimiento.html` y `seguimiento-leader.html` (label del indicador), `plan-detail.html` (contador de tareas), `bd-master/bd-tareas-y-planes.js` (antes `tareas-base-unificada.js`; strings de generación de `row.estado` en `actividadesSeguimiento`).

---

### Seguimiento: carga progresiva "Cargar más" (sustituye paginador)

27. [x] **Seguimiento: carga inicial de 50 y botón "Cargar más"**  
    En **seguimiento.html** y **seguimiento-leader.html** se sustituyó el **paginador** (páginas 1, 2, 3… y selector de 10/20/50/100 por página) por una **carga progresiva**:
    - **Al entrar:** se muestran los **primeros 50** registros en la tabla.
    - **Debajo de la tabla** hay un botón **"Cargar más"**. Al hacer clic se cargan **50 registros más** (se muestran 100, luego 150, etc.).
    - Al cambiar de pestaña (Tareas/Planes), búsqueda o filtros, se **reinicia** a 50 registros visibles.
    - Implementación en `seguimiento.js`: variable `displayLimit` (inicial 50), constante `SEGUIMIENTO_LOAD_MORE_SIZE = 50`, función `initLoadMore()` que pinta el botón "Cargar más" en el contenedor que antes usaba el paginador (`#seguimiento-paginador`). El botón usa el componente oficial UBITS (secundario).

    **Cómo volver al paginador (por si se revierte):**
    - En `seguimiento.js`: restaurar variables `currentPage` y `itemsPerPage`; en `renderTable()` usar de nuevo `data.slice((currentPage - 1) * itemsPerPage, (currentPage - 1) * itemsPerPage + itemsPerPage)`; restaurar la función `initPaginator()` que llama a `loadPaginator('seguimiento-paginador', { totalItems, itemsPerPage, itemsPerPageOptions: [10, 20, 50, 100], currentPage, onPageChange, onItemsPerPageChange })`; reemplazar todas las llamadas a `initLoadMore()` y `displayLimit = 50` por `initPaginator()` y `currentPage = 1`.
    - En `seguimiento.html` y `seguimiento-leader.html`: asegurar que sigan enlazados `components/paginator.css` y `components/paginator.js` (se dejan enlazados aunque no se use el paginador, para facilitar la vuelta atrás).
    - Referencia: el paginador mostraba "X–Y de Z" y permitía cambiar de página y de tamaño de página (10, 20, 50, 100).

---

## Cambios 20 de febrero de 2026

28. [x] **Filtros en tareas: de drawer a dropdown**  
    En **tareas.html** los filtros (Estado, Prioridad, Asignación) dejaron de abrirse en un **drawer** y pasaron a mostrarse en un **dropdown** (componente dropdown-menu con `customBodyHtml`). El cuerpo del dropdown contiene **tres inputs select oficiales** (createInput type: 'select', size: 'sm'). Implementación en `tareas.js`: `openFiltrosDropdown()`, contenedores inyectados y createInput para cada select; botones Limpiar y Aplicar en el footer del dropdown.

29. [x] **Botón de refrescar datos en seguimiento**  
    En **seguimiento.html** y **seguimiento-leader.html** se añadió un **botón de refrescar** (icono `fa-arrows-rotate`) entre búsqueda y columnas visibles. Al hacer clic se muestra un toast "Datos refrescados".

30. [x] **Tooltips en seguimiento (botones de la barra superior, botones de encabezado y checkboxes)**  
    Se añadieron tooltips con **delay de 1 s** (`data-tooltip`, `data-tooltip-delay="1000"`) a todos los elementos interactivos de la vista de seguimiento:  
    - **Barra:** Buscar, Refrescar, Columnas visibles, Período.  
    - **Encabezado de tabla:** botones de filtro por columna, ordenar y celda **Seleccionar todo**. Tras cada `buildTableHeader()` se llama a `initTooltip('#seguimiento-table thead [data-tooltip]')`. El tooltip de la celda de selección cambia a **"Deseleccionar todo"** cuando hay filas seleccionadas (se actualiza en `updateSelectAll()`).  
    - **Checkboxes de filas:** cada celda de checkbox muestra **"Seleccionar"** o **"Deseleccionar"** según el estado de la fila; el texto se actualiza al marcar/desmarcar y tras pintar la tabla se llama a `initTooltip('#seguimiento-table tbody .ubits-table__td--checkbox[data-tooltip]')`.

---

## Cambios 23 - 25 de febrero de 2026

31. [x] **Tabs oficiales en Planes (Individuales / Grupales)**  
    En **planes.html** (contenido generado en **planes.js**) los botones "Individuales" y "Grupales" dentro de las secciones **En curso** y **Finalizado** se reemplazaron por **tabs oficiales UBITS** (componente tab, variante sobre fondo blanco). Contenedor con clase `ubits-tabs-on-bg` (fondo `var(--ubits-bg-2)`, padding 4px, border-radius 8px); botones con `ubits-tab ubits-tab--sm` y `ubits-tab--active` según el filtro activo. Se mantienen `data-filter` y `data-filter-finished` para que los listeners existentes sigan funcionando. En **planes.html** se añadió el enlace a `components/tab.css`; en **planes.css** se definió la clase del wrapper.

32. [x] **Detalle de tarea: feed cronológico de actividad y trazabilidad completa**

    En **task-detail** (`task-detail.js`, `task-detail.css`) se implementó un sistema de **registro de actividad automático** que mezcla comentarios y eventos del sistema en un único timeline cronológico con separadores de fecha inteligentes.

    **Arquitectura del sistema:**
    - `pushActivity(icon, author, text)` — helper que añade un evento a `estado.activities` con timestamp, icono FA y texto en español.
    - `toDateKey(isoStr)` — extrae `YYYY-MM-DD` de un ISO string para agrupar por día.
    - `dateKeyLabel(dateKey)` — retorna `'Hoy'`, `'Ayer'` o `'13 feb 2026'` según la diferencia con hoy.
    - `renderCommentsBlock()` — mezcla `estado.comments` y `estado.activities` en `allItems[]`, los ordena cronológicamente y renderiza con separadores de fecha automáticos al cambiar de día.

    **Eventos que se registran en la columna Comentarios (task-detail.js):**

    | Acción | Icono | Ejemplo de texto | Origen |
    |--------|-------|------------------|--------|
    | Cambiar asignado (asignar a persona) | `fa-user-pen` | `[Usuario] asignó la tarea a [nombre].` | Código: clic en “Asignado a” y elegir persona |
    | Cambiar asignado (quitar asignación) | `fa-user-pen` | `[Usuario] dejó la tarea sin asignar.` | Código: clic en “Asignado a” y elegir “Sin asignar” |
    | Añadir subtarea individual | `fa-plus-circle` | `[Usuario] añadió la subtarea “[nombre]”.` | Código: botón “Agregar una subtarea” |
    | Añadir subtareas en lote (varias líneas) | `fa-list-plus` | `[Usuario] añadió N subtareas en lote.` | Código: creación a partir de lista |
    | Añadir una subtarea desde lista (1 línea) | `fa-plus-circle` | `[Usuario] añadió la subtarea “[texto]”.` | Código: creación a partir de lista con una línea |
    | Completar subtarea | `fa-circle-check` | `[Usuario] marcó “[nombre]” como completada.` | Código: marcar checkbox en tirilla |
    | Reabrir subtarea | `fa-circle-xmark` | `[Usuario] reabrió la subtarea “[nombre]”.` | Código: desmarcar checkbox en tirilla |
    | Eliminar subtarea | `fa-trash` | `[Usuario] eliminó la subtarea “[nombre]”.` | Código: botón Eliminar en tirilla → modal confirmación |
    | Cambiar fecha límite | `fa-calendar-pen` | `[Usuario] cambió la fecha límite al [fecha].` | Código: calendario en bloque de info |
    | Cambiar prioridad | `fa-chevrons-up` | `[Usuario] cambió la prioridad a [Alta|Media|Baja].` | Código: clic en Prioridad y elegir opción |
    | Marcar tarea como finalizada | `fa-circle-check` | `[Usuario] marcó la tarea como finalizada.` | Código: clic en Estado y elegir “Finalizada” |
    | Reabrir tarea | `fa-circle-xmark` | `[Usuario] reabrió la tarea.` | Código: clic en Estado y elegir “Reabrir tarea” |

    **Solo en mocks (getMockActivities):** crear tarea (`fa-circle-plus`).

## Implementación de la nueva versión de task-detail

33. [x] **Implementación de la nueva versión de task-detail**  
    Sustitución del panel lateral/modal viejo (overlay + `task-detail-panel`) por la **página dedicada** **task-detail.html** (vista inmersiva con subtareas, comentarios e historial). Desde **tareas.html**, **plan-detail.html**, **seguimiento.html** y **seguimiento-leader.html**, al hacer clic en una tarea se navega a `task-detail.html?id=<id>`. La página carga datos con `TAREAS_PLANES_DB.getTaskDetail(id)`, con fallback en `sessionStorage` para IDs sintéticos (vista líder) y mocks si no hay datos. Eliminados el markup del overlay/panel, las referencias a `task-detail-panel.css`/`.js` y el código asociado en `tareas.js`, `plan-detail.js` y `seguimiento.js`. Eliminados los componentes `components/task-detail-panel.js` y `components/task-detail-panel.css`.

34. [x] **Detalle de tarea: dropdowns de Estado y Prioridad (como filtros de seguimiento)**

    En el panel de detalle de tarea (**task-detail**), al hacer clic en **Estado** o **Prioridad** se abre un **dropdown** similar a los de los encabezados de la tabla en seguimiento (lista de opciones con texto, sin checkboxes), que permite **cambiar** el estado o la prioridad de la tarea. Los cambios se registran en la sección Comentarios (ver ítem 32).

    **Estado:**
    - Si la tarea está **Finalizada**: el dropdown ofrece **“Reabrir tarea”**. Al elegirla, la tarea pasa a Por hacer y se registra “reabrió la tarea.”.
    - Si la tarea está **Por hacer**: el dropdown ofrece **“Finalizar tarea”**. Al elegirla, la tarea se marca como finalizada y se registra “marcó la tarea como finalizada.”.
    - Si la tarea está **Vencida**: no se abre dropdown (el estado depende de la fecha). Se muestra el **tooltip oficial UBITS** (`data-tooltip`, `initTooltip`) con el texto: *“Para reabrir la tarea cambia la fecha de vencimiento.”* El trigger no muestra chevron y tiene cursor por defecto. Si el usuario cambia la fecha de vencimiento a una fecha **posterior a hoy**, la tarea pasa automáticamente a **Por hacer**.

    **Prioridad:**
    - El dropdown ofrece **Alta**, **Media** y **Baja**. Al elegir una, se actualiza la prioridad de la tarea y se registra “cambió la prioridad a [Alta|Media|Baja].”.

    Implementación en `task-detail.js` (triggers con id `task-detail-estado-trigger` y `task-detail-prioridad-trigger`, componente dropdown-menu) y estilos en `task-detail.css` (`.task-detail-estado-trigger`, `.task-detail-prioridad-trigger`, `.task-detail-trigger-chevron`, `.task-detail-estado-trigger--vencida`).

35. [x] **Panel de comentarios: adjuntar imágenes y archivos**

    En el **panel de comentarios** de la página de detalle de tarea (**task-detail**), el usuario puede **adjuntar imágenes y documentos** antes de enviar el comentario. Tras enviar, las imágenes se muestran en el feed y son clicables (se abren en un overlay a pantalla completa con botón cerrar). Los documentos se muestran como **chips** (componente Chip oficial, tamaño SM); al hacer hover aparece el tooltip *"Descargar archivo"* y al hacer clic se descarga el archivo cuando hay URL disponible. Los archivos seleccionados desde el equipo se guardan con blob URL (`URL.createObjectURL`) para permitir la descarga en la misma sesión.     Implementación en `task-detail.js` (strip de pendientes, feed de comentarios, overlay de imagen, chips con tooltip y descarga) y estilos en `task-detail.css`; import de `status-tag.css` para el estado de la tarea.

36. [x] **Implementación de subtask-detail**

    Página dedicada **subtask-detail.html** para ver y editar una **subtarea** en vista inmersiva (sin bloque de comentarios ni lista de subtareas). Desde **task-detail.html**, al hacer clic en una subtarea de la lista se navega a `subtask-detail.html?taskId=<id>&id=<subtaskId>`. Carga datos desde el estado de la tarea padre o desde `sessionStorage`; incluye header product con "Detalle de la subtarea", botón atrás a task-detail, bloque de información (título y descripción editables, asignado, creado por, estado, prioridad, vencimiento), botón de opciones (dropdown Enviar recordatorio / Eliminar) y modal de confirmación al eliminar con redirección a task-detail y toast. Archivos: `subtask-detail.html`, `subtask-detail.css`, `subtask-detail.js` (reutilizando estilos y lógica de task-detail donde aplica).

37. [x] **Homologación de encabezados de plan-detail.html tomando como referente task-detail.html**

    En **plan-detail.html** se homologó la estructura y estilos del encabezado y de la card de información del plan tomando como referente **task-detail.html**: (1) **Header product** solo con título "Detalle del plan" y save indicator funcional (idle). (2) **Dentro de plan-detail-card**: título y descripción del plan **editables inline** (mismos textareas y estilos que task-detail), botón de opciones (⋮) con dropdown Enviar recordatorio / Eliminar, línea divisora, bloque "Creado por" con avatar y nombre usando el mismo estilo de label (meta-label: xs, semibold, fg-1-medium). (3) Labels "Tareas finalizadas", "Vencimiento" y el número XXX/XXX con peso regular usando tokens oficiales; porcentaje del progress bar en peso regular. (4) Selector de **fecha de vencimiento** con el mismo componente calendar que task-detail (createInput type calendar), ancho 125px; label "Vencimiento" en lugar de "Finalización". (5) Modal de eliminación de tarea desde la tirilla en plan-detail (modal UBITS + toast "Tarea eliminada exitosamente"). (6) Iconos de contadores (Por hacer, Vencidas, Finalizadas) en fas fa-circle (relleno). Avatar del creador del plan resuelto con getCreatorDisplay cuando la BD no aporta URL.

---

## 10 de marzo de 2026

38. [x] **Scroll-spy en vista de tareas: día visible reflejado en el calendario horizontal**

    En **tareas.html**, al hacer scroll en la lista de días, el día que queda visible en pantalla se refleja automáticamente como **seleccionado** en el **calendario horizontal** (y, si aplica, se actualiza el indicador de mes/año). Así se mantiene la sincronización en ambos sentidos: (1) clic en un día del calendario → scroll hasta ese día (comportamiento existente); (2) scroll manual → el día que entra en vista se marca como activo en el calendario. Implementación en `tareas.js`: función `updateSelectedDayFromScroll()` (detecta el último `.tareas-day-container` cuyo borde superior está dentro del umbral de 80px desde el top del `#tareas-scroll-container`), listener de scroll con throttle de 80 ms y `setupScrollSpy()` llamada en `initTareasView()`.

39. [x] **Doble clic en el nombre de la tarea/subtarea: edición inline del nombre**

    En las tirillas que usan el componente **task-strip**, **doble clic solo en el nombre** (`.tarea-titulo` / `.tarea-titulo-wrap`) abre la **edición inline del nombre** (misma acción que la opción "Cambiar nombre" del menú ⋮). Un solo clic en el nombre sigue llevando al detalle, con un retraso breve (300 ms) para poder distinguir el doble clic.

    **Dónde aplica:**
    - **tareas.html** (`tareas.js`): lista de tareas por día; clic retrasado + `dblclick` en el nombre → `startInlineEditTaskName` con actualización y toast "Nombre actualizado".
    - **plan-detail.html** (`plan-detail.js`): lista de tareas del plan; misma lógica; opción "Cambiar nombre" añadida implícitamente vía doble clic (el menú ⋮ de plan-detail solo tiene Enviar recordatorio / Eliminar).
    - **task-detail.html** (`task-detail.js`): lista de **subtasks**; misma lógica de clic retrasado y doble clic; además el menú ⋮ de cada subtarea incluye **"Cambiar nombre"** como primera opción (icono pen), con el mismo comportamiento que el doble clic.

    Implementación: variable de timeout por contexto (`estadoTareas.pendingTaskClickTimeout`, `planDetailPendingTaskClickTimeout`, `taskDetailSubtaskPendingClickTimeout`), listener `dblclick` delegado en el contenedor de la lista, y en task-detail opción "Cambiar nombre" en el dropdown de opciones de la subtarea.

40. [x] **Task-detail: enviar recordatorio registrado en el historial de actividades**

    En **task-detail.html**, al elegir **"Enviar recordatorio"** (desde las opciones ⋮ del título de la tarea o desde las opciones de cada subtarea en la tirilla), además del toast de éxito se registra un **evento en el historial de actividades** con el formato: *"[Usuario actual] envió al asignado un recordatorio sobre \"[Nombre de la tarea o subtarea]\"."* (icono `fa-bell`). Se llama a `pushActivity`, `renderCommentsBlock()` y `triggerFakeSave()` para que la entrada aparezca de inmediato en la sección de comentarios/actividades.

---

## 11 de marzo de 2026

41. [x] **Plan-detail: personas asignadas, filtro por asignado, filtros aplicados y ajustes de UI**

    Cambio único en **plan-detail** que agrupa varias mejoras en la card del plan y en la sección de tareas:

    - **Personas asignadas al lado del creador:** En la card de información del plan, junto a "Creado por", se muestra **"Personas asignadas"** con un **avatar profile list** (componente oficial, `renderProfileList`) con tooltips en los nombres. Cuando hay más de tres asignados, el avatar **+X** es clicable y abre un **dropdown/popover** con el resto de personas (mismo patrón que la columna "Personas asignadas" en la tabla de planes en seguimiento). Los asignados se obtienen de las tareas del plan (únicos por email/nombre).

    - **Clic en avatar = filtrar tareas por esa persona:** Al hacer clic en un avatar (en la lista o en el popover), se filtran las tareas del plan para mostrar solo las de ese asignado. El avatar seleccionado tiene **borde azul 2px** (token `--ubits-accent-brand`).

    - **Filtros aplicados:** Debajo del header "Tareas del plan" aparece la barra **"Filtros aplicados"** (chips + botón "Limpiar filtros") cuando hay filtro por asignado activo, con el mismo aspecto que en seguimiento. Al quitar el chip o pulsar "Limpiar filtros" se vuelve a mostrar toda la lista.

    - **Botón de filtros:** El botón de filtros de la sección de tareas pasó a ser **solo icono** (variante tertiary, xs, icono `fa-filter`), igual que los botones de filtro en los encabezados de tabla de seguimiento. Sin implementar acción (ya en producción).

    - **Botón "Configurar miembros":** Junto al profile list de asignados se añadió un botón con icono `fa-users` y texto "Configurar miembros". Sin acción ni disabled (reservado para producción).

    - **Ajustes de UI:** Se aumentó el espacio entre la barra de filtros aplicados y los counters (Por hacer, Vencidas, Finalizadas), y se redujo el **font-size** de esos counters de **md** a **xs**.

    Archivos: `plan-detail.html`, `plan-detail.js`, `plan-detail.css`; popover de asignados; import de `chip.css` para los chips de filtros aplicados.

---

## 12 de marzo de 2026

42. [x] **Task-detail: input vencimiento sm, barra de progreso subtareas, botón Filtrar y "Historial de cambios"**

    Cambios en **task-detail** (detalle de tarea):

    - **Input fecha de vencimiento en tamaño sm:** El campo de fecha de vencimiento en el bloque de información de la tarea usa ahora el tamaño `sm` del componente input/calendar.

    - **Barra de progreso en subtareas:** Entre el título "Subtareas" y el texto "X de Y completadas" se añadió una barra de progreso (progress bar) con los mismos estilos que en plan-detail, mostrando visualmente el avance de subtareas completadas.

    - **Botón de filtros de comentarios:** El botón que abre el menú de filtro del feed (Todo / Solo comentarios / Solo historial de cambios) pasó a ser **secundario, tamaño xs**, y muestra el texto **"Filtrar"** además del icono (ya no es icon-only).

    - **"Historial de eventos" → "Historial de cambios":** En el menú de filtro del feed de comentarios, la opción se renombró a **"Solo historial de cambios"** para mayor claridad.

    - **Nueva versión del formulario de agregar subtareas:** Un solo bloque con textarea + botón "Añadir" + checkbox **"Agregar múltiples subtareas a partir de lista"**. Si el checkbox está desmarcado: una subtarea por envío; **Enter** envía el formulario. Si está marcado: el texto se interpreta como una subtarea por línea (split por `\n`) y **Enter** inserta salto de línea. El textarea **crece en alto** con el contenido (auto-resize); el botón "Añadir" queda **alineado abajo**. El formulario no se cierra al hacer clic en el checkbox (solo al hacer clic fuera o al enviar).

    Archivos: `task-detail.js`, `task-detail.css`.

43. [x] **Task-detail: marca "- editado" en comentarios editados**

    En el panel de comentarios del detalle de tarea, cuando un comentario del usuario se edita (desde el menú de opciones del comentario), junto a la fecha del comentario se muestra la etiqueta **"- editado"**. La fecha del comentario se mantiene igual (fecha de publicación original). En producción ya existía el botón de opciones y la edición; este cambio añade únicamente la indicación visual de que el comentario fue editado.

    Archivos: `task-detail.js`.

---

## 18 de marzo de 2026

44. [x] **Tareas: filtro "Asignado específico" cuando se elige "Solo lo que yo asigné a otros"**

    En **tareas.html**, en el dropdown de **filtros** (Estado, Prioridad, Asignación), cuando en **Asignación** se selecciona **"Solo lo que yo asigné a otros"** aparece un nuevo filtro opcional **"Asignado específico"**:

    - **Disparador:** Input oficial (`createInput` type: `select`, size: `sm`) que muestra "Seleccionar asignados" o "N asignado(s)" según la cantidad elegida.
    - **Contenido:** Dropdown oficial (componente **dropdown-menu**) con opciones en formato **checkbox** (`getDropdownMenuHtml` con `options` con `checkbox: true` y `selected` según el estado). La lista se construye con los **asignados únicos** a los que el usuario actual (María Alejandra Sánchez Pardo) les asignó al menos una tarea (`getAssigneesAsignadosPorMi()` recorre tareas vencidas y por día).
    - Si no se elige ningún asignado, se muestran todas las tareas "que yo asigné a otros"; si se eligen uno o más, el listado se filtra por esos asignados. Al hacer clic fuera del dropdown de asignados se cierra; al pulsar **Aplicar** en el panel de filtros se leen los checkboxes marcados y se guardan en `estadoTareas.filtros.asignadosEspecificos`. **Limpiar** resetea también este filtro.
    - Archivos: `tareas.js` (estado `asignadosEspecificos`, `getAssigneesAsignadosPorMi`, `openAsignadosEspecificosDropdown`, integración con dropdown oficial e Input oficial), `tareas.css` (estilos solo del wrap del bloque "Asignado específico").

45. [x] **Tirilla de tareas en celulares: status, fecha y prioridad (solo breakpoint 600px)**

    En el componente **task-strip**, únicamente en el breakpoint de **celulares** (`max-width: 600px`), se ajustó la fila meta (estado, fecha, prioridad) que va encima del título:

    - **Status tag:** Sin borde, sin padding lateral y sin color de fondo; icono reemplazado por un círculo pequeño (circle-small vía `::before`); colores por estado: Por hacer → `--ubits-accent-brand`, Vencida → `--ubits-feedback-accent-error`, Finalizada → `--ubits-feedback-accent-success`. El texto del estado se muestra.
    - **Botón de fecha:** Estilo terciario (fondo transparente, sin borde, hover/active con tokens terciarios).
    - **Badge de prioridad:** Sin borde, fondo transparente, texto visible de nuevo (ya no icon-only).
    - Archivo: `components/task-strip.css` (reglas dentro de `@media (max-width: 600px)`). Tablet y desktop no se modifican.

---

## 20 de marzo de 2026

46. [x] **Seguimiento (Planes): "Añadir colaborador" con dropdown oficial, multiselección y posición en viewport**

    En la pestaña **Planes**, la acción **Añadir colaborador** usa el mismo patrón que el filtro de columna (**dropdown-menu**): búsqueda arriba, hasta **5 opciones visibles** filtradas al escribir, **multiselección con checkbox y texto** (sin avatares en la lista), footer **Cancelar / Aplicar**. Se pueden marcar **varias personas** y al **Aplicar** se añaden a **todos los planes** seleccionados en la tabla (evitando duplicados por nombre).     La lista de personas combina `TAREAS_PLANES_DB.getEmpleadosEjemplo()` con asignados ya presentes en `SEGUIMIENTO_DATA`. **Deduplicación por nombre normalizado** (`normalizeText`), para no repetir la misma persona si aparece en empleados y en seguimiento con `username` distinto o vacío. El posicionamiento usa **`openDropdownMenu`** (arriba/abajo y ajuste horizontal al viewport). En el filtro por columna con checkboxes se corrigió la lectura del texto para filtrar usando también **`.ubits-checkbox__label`**.

    Archivos: `seguimiento.js`, `seguimiento.html`, `seguimiento-leader.html`, `seguimiento.css`, `Changelog-planes-y-tareas.md`.

    **Filtros encabezado Área del asignado / Área del creador:** lista **sin tope de 5 ítems**; todas las áreas que coincidan con el texto van en un bloque con **scroll** (`dropdown-menu.css`: `.ubits-dropdown-menu__options--filter-scroll`). No usa “Ver seleccionados”.

    **Barra de acciones “Ver seleccionados”:** con selección en tabla y **sin** modo “solo seleccionados”, el texto del botón pasa a **Ver seleccionados (N)** con el contador entre paréntesis (Tareas y Planes).

47. [x] **Dropdown Menu: resumen multiselect "Ver seleccionados" + uso en Añadir colaborador y filtros de encabezado**

    En **components/dropdown-menu** (`getDropdownMenuHtml` + `initDropdownMultiSelectSummary`): **`hasMultiSelectSummary`** añade botón **secondary xs** (ojo / ojo tachado), **visible solo si hay ≥1 marcado**, que alterna la lista entre filtro y **solo seleccionados**; en ese modo la lista usa **`max-height` ~5 filas** (clase `selected-only-scroll`) y el resto con scroll. Si se desmarcan todos, se oculta el botón y vuelve el modo filtro. **Clic, focus o input** en el buscador = salir de solo seleccionados. Callback **`applyListVisibility('filter'|'selected-only')`**.

    - **Añadir colaborador** (tab Planes).
    - **Filtros de encabezado de tabla (seguimiento):** tab **Tareas** → columnas **Asignado**, **Creador**, **Plan al que pertenece**; tab **Planes** → **Creador del plan** (mismo `data-filter="creador"`). Los filtros de **área** siguen solo con scroll de lista completa, sin este bloque.

    Doc: `documentacion/componentes/dropdown-menu.html`.

    Archivos: `components/dropdown-menu.js`, `components/dropdown-menu.css`, `seguimiento.js`, `documentacion/componentes/dropdown-menu.html`, `Changelog-planes-y-tareas.md`.

---

## 25 de marzo de 2026

48. [x] **Mi lista de tareas y detalle de tarea: controles "Añadir" encima de la lista; nuevas tareas y subtareas arriba**

    - **tareas.html (`tareas.js`, `tareas.css`):** En cada bloque de día, el botón **«Añadir tarea»** y el formulario inline de creación se muestran **encima** de la lista de tirillas de ese día. Las **tareas nuevas** se insertan al **inicio** del array del día (`unshift`), de modo que aparecen **por encima** del resto (respetando el orden existente entre pendientes y finalizadas).

    - **Detalle de tarea (`task-detail.js`):** En el bloque **Subtareas**, el botón **«Añadir subtarea»** y el formulario de alta quedan **encima** de la lista de subtareas. Al **añadir** una o varias subtareas (incluido el modo varias líneas), las nuevas se insertan al **inicio** de la lista pendiente (`unshift` en orden inverso para lotes multilínea), de modo que la recién creada queda **arriba**.

    Archivos: `tareas.js`, `tareas.css`, `task-detail.js`.

49. [x] **Coachmark Seguimiento: textos del tour, URLs robustas y recuperación del hash**

    Recorrido guiado **Seguimiento** (`coachmark-seguimiento.js`, `coachmark-seguimiento.css` en `tareas.html` y `seguimiento.html`):

    - **Textos de los 6 pasos:** Se actualizaron título y cuerpo del array `COPY` con las descripciones acordadas (paso 1: consulta y gestión unificada; pasos 2–3: listas de tareas y planes con filtrar, ordenar y lote; paso 4: período/fechas; paso 5: totales por estado según período; paso 6: orden y filtros desde el encabezado de la tabla). Los títulos de los pasos 2 y 3 quedaron en **Tareas** y **Planes**.

    - **Navegación paso 1 ↔ paso 2:** Los saltos `tareas.html` ↔ `seguimiento.html` con `#coachmark` usan **`hrefToSiblingHtml()`**, que resuelve la URL con `new URL(..., window.location.href)` para que el destino sea correcto en **file://**, subcarpetas y despliegues (Netlify u otros), no solo con rutas relativas simples.

    - **Recuperación del hash (patrón similar a planes-formación + `#competencias`):** Si al llegar a **seguimiento** el fragmento `#coachmark` no está presente pero en **sessionStorage** hay un paso **2–6** reciente (marca de tiempo &lt; **10 minutos**, clave `ubitsCoachmarkSeguimiento`), al iniciar el boot se hace **`history.replaceState`** para inyectar `#coachmark` y el tour puede continuar. Así se mitiga la pérdida ocasional del hash tras **Siguiente** en el paso 1.

50. [x] **Coachmark Seguimiento: componente oficial `UBITS_COACHMARK`**

    Se sustituyó el overlay/popover hardcodeado (`#coachmark-root`) por **`components/coachmark.js`** + **`popover.js`**, con **`startIndex`** (primer paso según página/storage) y **`onBeforeNext` / `onBeforePrev`** para los saltos **tareas ↔ seguimiento** sin romper el flujo (paso 1 solo en `tareas.html`, pasos 2–6 en `seguimiento.html`). Se mantienen **`hrefToSiblingHtml`**, **`ensureCoachmarkHashFromStorage`**, hash `#coachmark`, viewport ≥1280px y cierre con **`UBITS_COACHMARK.close('restart')`** al redimensionar por debajo del umbral (sin limpiar storage, como antes).

    Archivos: `components/coachmark.js` (opciones nuevas), `coachmark-seguimiento.js`, `coachmark-seguimiento.css` (solo refuerzo responsive), `tareas.html`, `seguimiento.html`, `Changelog-planes-y-tareas.md`.

---

*Última actualización: ítems 1–20 (11 feb), 21–26 (19 feb), 27 (Cargar más), 28–30 (20 feb), 31 (21 feb), 32 (23 feb), 33 (nueva versión task-detail), 34 (dropdowns Estado y Prioridad en task-detail), 35 (panel de comentarios: adjuntar imágenes y archivos), 36 (implementación de subtask-detail), 37 (homologación encabezados plan-detail con task-detail), 38 (scroll-spy calendario horizontal, 10 mar), 39 (doble clic para cambio de nombre en tirillas y opción Cambiar nombre en subtareas), 40 (recordatorio registrado en historial en task-detail), 41 (plan-detail: asignados, filtro por persona, filtros aplicados y UI, 11 mar), 42 (task-detail: vencimiento sm, progress bar subtareas, botón Filtrar, Historial de cambios, nueva versión formulario subtareas, 12 mar), 43 (marca "- editado" en comentarios editados, 12 mar), 44 (filtro Asignado específico en tareas, 18 mar), 45 (estilos tirilla en celulares, 18 mar), 46 (Añadir colaborador seguimiento, 20 mar), 47 (resumen multiselect dropdown, 20 mar), 48 (añadir tarea/subtarea encima de listas y orden nuevo arriba, 25 mar), 49 (coachmark Seguimiento: copy, URLs y hash, 25 mar), 50 (coachmark oficial multi-página, 25 mar) implementados.*
