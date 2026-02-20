![UBITS](../../images/Ubits-logo-dark.svg)

# Backlog – Tareas y Planes

Ajustes pendientes sobre los archivos entregados por la PM Mafe para las páginas de **Tareas**, **Planes** y **Detalle de plan**.

**Archivos en scope:**
- `plan-detail.css`, `plan-detail.html`, `plan-detail.js`
- `planes.css`, `planes.html`, `planes.js`
- `tareas.css`, `tareas.html`, `tareas.js`

---

## Solicitudes 11 de febrero de 2026

---

### 1. Datos y usuario

1. [x] **Base de datos unificada y empresa de ejemplo**  
   Todas las páginas de tareas (Tareas, Planes, Detalle de plan, Seguimiento y Seguimiento líder) comparten **una sola base de datos** (`tareas-base-unificada.js`) que simula una empresa real: **Fiqsha Decoraciones S.A.S.**, con 8 áreas, 1 gerente, 7 jefes y 51 empleados. Los datos están en español (nombres, cargos, áreas) y el usuario que abre la plataforma es **María Alejandra Sánchez Pardo** (Jefe de Logística).  
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
    Cambiado en todos los HTML y JS de la carpeta `tareas`, más los componentes `task-strip.js` y `task-detail-panel.js`. El valor interno en los objetos JavaScript (`.status = 'Activo'`) **no cambió** — solo los strings de display. Archivos modificados: `task-strip.js` (línea 24 `estadoTexto`), `tareas.js` (label del drawer de filtros + `statusDisplay` del panel de detalle), `plan-detail.js` (`statusDisplay`), `seguimiento.js` (checkbox del drawer, `optionsMap`, `statusClass`, `syncTaskToRow`, `updateIndicadores`, menú "Cambiar estado" y modales), `seguimiento.html` y `seguimiento-leader.html` (label del indicador), `plan-detail.html` (contador de tareas), `tareas-base-unificada.js` (strings de generación de `row.estado` en `actividadesSeguimiento`).

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

*Última actualización: ítems 1–20 (11 feb), 21–26 (19 feb) implementados; ítem 27 (seguimiento Cargar más) implementado.*
