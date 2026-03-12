![UBITS](../../images/Ubits-logo-dark.svg)

# Backlog – LMS Creator

La carpeta **lms-creator** fue creada por el PM como idea bocetada. Este backlog sirve para **pasar en limpio** el módulo, documentar decisiones y revisar que cumpla estándares UBITS.

**Archivos en scope:**
- `contenidos.html`
- `categorias.html`
- `grupos.html`, `crear-grupo.html`, `crear-grupo.css`
- `crear-plan-asistente.html`, `crear-plan-asistente.css`
- `detalle-plan.html`, `detalle-plan.css`
- `planes-formacion.html`, `planes-formacion.css`
- `crear-asignacion.html`, `crear-asignacion.css`
- `lms-creator.css`

---

## Cambios recientes

- **Empty state por búsqueda (planes-formación, grupos, detalle-plan):** Cuando la búsqueda no devuelve resultados (pero sí hay datos), se muestra un empty state con icono de búsqueda, título "No se encontraron resultados" y botón "Limpiar búsqueda" funcional que limpia la búsqueda, cierra el input y vuelve a aplicar visibilidad. Referencia: `ubits-colaborador/tareas/seguimiento.html`.
- **Búsqueda expandible – colapso al clic fuera:** Si el usuario abre el input de búsqueda (lupa) y hace clic fuera sin haber escrito nada, el input se contrae y vuelve a mostrarse solo el botón icon-only, igual que en seguimiento (`isSearchMode` + listener `document.click`).
- **Tooltips en tablas:** Botón de búsqueda, encabezados con botones (ordenar, filtrar) y columna de checkboxes (cabecera "Seleccionar todo" / "Deseleccionar todo" y celdas "Seleccionar" / "Deseleccionar") tienen `data-tooltip` y `data-tooltip-delay="1000"`. Tras aplicar visibilidad o cambios de selección se llama `initTooltip()` para los selectores correspondientes. Requiere `tooltip.css`, `tooltip.js` y contenedor `#tooltip`.
- **Checkbox "Seleccionar todo" con estado indeterminado:** Se mantiene `indeterminate` cuando hay filas seleccionadas pero no todas; el tooltip del `<th>` se actualiza a "Deseleccionar todo" o "Seleccionar todo" según el estado. Referencia: `seguimiento.js` → `updateSelectAll()`.
- **Regla documentada en Cursor:** En `.cursor/rules/cursor-rules.mdc` se añadió la sección "TABLAS: TOOLTIPS Y CHECKBOXES (OBLIGATORIO)" para que todas las tablas con botones en encabezados y/o columna de checkboxes sigan el patrón de seguimiento.
- **Ordenamiento con dropdown oficial:** En los encabezados de tabla, el botón de ordenar abre un **dropdown menu oficial** con opciones en lenguaje claro (igual que seguimiento): texto "A a Z" / "Z a A"; fechas "Más reciente primero" / "Más reciente al final"; progreso "Mayor avance primero" / "Mayor avance al final"; números "Mayor a menor" / "Menor a mayor". Al elegir una opción se aplica el orden y se cierra el menú. Implementado en planes-formación, grupos y detalle-plan; referencia: `seguimiento.js` → initSortMenu. En grupos y detalle-plan se añadió `dropdown-menu.js`.

---

## Revisión inicial (por definir fecha)

---

### 1. Estructura y navegación

1. [x] **SubNav variante Creator**  
   Verificar que todas las páginas de la carpeta usen la variante **creator** del SubNav oficial (Contenidos, Categorías, Planes de formación, Grupos) y que el tab activo coincida con la página actual.  
   *Implementado: variante `creator` en `components/sub-nav.js` con 4 tabs (Contenidos, Categorías, Planes de formación, Grupos). Las 8 páginas de la carpeta llaman a `loadSubNav('top-nav-container', 'creator')`. `PAGE_TO_TAB` configurado para que el tab activo coincida: contenidos/categorias/grupos/crear-grupo → tab correspondiente; planes-formacion/crear-plan-asistente/detalle-plan → Planes de formación; crear-asignacion → Contenidos.*

2. [x] **Sidebar y rutas**  
   Revisar que el Sidebar tenga la opción correcta para esta sección (ej. `lms-creator` o `creator`) y que los enlaces entre páginas del módulo sean coherentes (relativos, mismo nivel o subcarpeta).  
   *Sidebar: ítem "LMS Creator" (data-section="creator", icono fa-bolt) debajo de Aprendizaje en variante default; enlace a `lms-creator/contenidos.html`. Las 8 páginas del módulo llaman a `loadSidebar('creator')` (un solo argumento, API antigua del sidebar) para que el ítem "LMS Creator" se marque activo, alineado con el patrón del resto del template (en aprendizaje usan `loadSidebar('sidebar-container', 'aprendizaje')` y un `setTimeout` que activa el botón manualmente; aquí el segundo parámetro no se usa, así que se usa la forma de un argumento). Rutas: todos los enlaces entre páginas del módulo usan rutas relativas al mismo nivel (ej. `planes-formacion.html`, `crear-grupo.html`, `detalle-plan.html?id=...`) sin `/` inicial; coherentes desde cualquier página de la carpeta.*

3. [x] **Floating menu (módulos)**  
   Verificar que el menú flotante de "Módulos" (abierto desde el Tab-bar en móvil) incluya LMS Creator y que en las páginas de lms-creator el ítem activo se marque según la página actual.  
   *Implementado: en `components/floating-menu.js` se añadió la sección "LMS Creator" (id: creator, icono fa-bolt) como acordeón después de Aprendizaje, con 4 subítems: Contenidos (contenidos.html), Categorías (categorias.html), Planes de formación (planes-formacion.html), Grupos (grupos.html). En `pageToElementMap` se mapean todas las páginas del módulo (contenidos, categorias, grupos; crear-grupo → grupos; planes-formacion, crear-plan-asistente, detalle-plan → planes-formacion; crear-asignacion → contenidos) para que `setActiveItemByCurrentPage()` marque el ítem correcto al abrir el menú. Las 8 páginas de lms-creator ya tenían `floating-menu-container`, `loadFloatingMenu('floating-menu-container')` y el CSS/JS del componente, igual que en aprendizaje.*

4. [x] **Estructura modular de contenido**  
   Revisar si las páginas siguen el patrón de **content-sections** y **section-single** / **section-dual** (widgets con nombres semánticos) como en el resto del template.  
   *Revisado: Todas las páginas de lms-creator usan `content-sections` como contenedor y `section-single` para cada bloque. La cabecera de producto va siempre en `widget-header-product`. Contenidos y Categorías usan `widget-contenido-lms`; crear-plan-asistente usa `widget-chat`. Se añadieron wrappers con nombres semánticos `widget-*` sin tocar clases ni lógica existente: grupos → `widget-grupos-lista`; crear-grupo → `widget-crear-grupo`; planes-formacion → `widget-planes-formacion`; crear-asignacion → `widget-crear-asignacion` y bloque lista de asignaciones → `section-single` + `widget-asignaciones-lista`; detalle-plan → `widget-detalle-plan-progress`, `widget-asignaciones-titulo`, `widget-asignaciones-detalle`. Las clases internas (grupos-list-wrapper, crear-grupo-form, asignaciones-tabs-wrapper, etc.) se mantienen para no romper estilos ni JS.*

### 2. Componentes oficiales UBITS

5. [x] **Botones**  
   Revisar que en todos los HTML/JS del scope se usen **botones oficiales** (`ubits-button`, variantes y tamaños correctos). Sustituir cualquier botón custom.  
   *Revisado: Sustituidos todos los botones custom por el componente oficial. crear-grupo: eliminar integrante → `ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only` (clase js `js-crear-grupo-eliminar` para delegación). detalle-plan: eliminar fila y quitar contenido en panel → mismo patrón (`js-detalle-plan-eliminar`, `js-detalle-plan-contenido-remove`). crear-asignacion: eliminar card de asignación, quitar en drawer usuarios y eliminar en drawer cursos → mismo patrón (`js-asignacion-card-delete`, `js-drawer-usuarios-remove`, `js-drawer-cursos-delete`). Eliminado CSS custom de .crear-grupo-btn-eliminar, .detalle-plan-btn-eliminar, .detalle-plan-contenido-remove, .drawer-usuarios-btn-remove, .drawer-cursos-btn-delete. En crear-asignacion se mantiene solo posicionamiento (absolute, top, right) para el botón eliminar de la card. Los botones con texto (Agregar persona, Crear plan, etc.) ya usaban ubits-button.*

6. [x] **Inputs y formularios**  
   Revisar que los formularios (crear grupo, crear asignación, crear plan, etc.) usen el **componente Input oficial** (`createInput`) o los inputs del template donde aplique.  
   *Revisado: crear-grupo: descripción con `createInput({ type: 'textarea', containerId: 'grupo-descripcion-container' })`; input.css e input.js importados. crear-asignacion: vigencia con `createInput({ type: 'calendar' })` en fecha-inicio-container y fecha-fin-container; drawer agregar usuarios: dos `createInput({ type: 'search' })` (colaborador y grupos); drawer agregar cursos: `createInput({ type: 'search' })` en drawer-cursos-search-container; input.css e input.js importados. detalle-plan: búsqueda en panel de contenidos con `createInput({ type: 'search' })` en detalle-plan-contenidos-search-container; input.css e input.js importados. crear-plan-asistente: no tiene formularios clásicos (flujo por chat); input.css importado. Resto de controles: checkboxes en tablas usan componente oficial `ubits-checkbox__input`; opciones en drawer usan `ubits-radio__input`; campo oculto plan-tipo es `<input type="hidden">`; subida de archivo usa `<input type="file">` (el componente Input no define tipo file).*

7. [x] **Header product**  
   Verificar que las páginas que llevan cabecera usen el **header product** oficial con las opciones necesarias (título, breadcrumb, botones primario/secundario, menú, etc.).  
   *Revisado: Las 8 páginas con cabecera usan el componente oficial: contenedor `widget-header-product` con id `header-product-container`, `loadHeaderProduct('header-product-container', { ... })`, e importan header-product.css y header-product.js. Opciones usadas según contexto: contenidos/categorias (productName, aiButton, secondaryButtons, primaryButton, menuButton); grupos (productName, aiButton, primaryButton «Agregar grupo»); crear-grupo (breadcrumb Grupos > Nuevo grupo, backButton, secondaryButtons Guardar; título sustituido por textarea editable); planes-formacion (productName, aiButton «Crear con AI», primaryButton «Crear plan» con dropdown); crear-plan-asistente (productName, backButton); detalle-plan (productName dinámico, backButton); crear-asignacion (breadcrumb Planes > Nuevo plan, backButton, secondaryButtons Guardar, primaryButton Publicar; título sustituido por textarea editable). Corregido data-section del sidebar de "lms-creator" a "creator" en contenidos, categorias, grupos, crear-plan-asistente y crear-asignacion.*

8. [x] **Modales, drawers y dropdowns**  
   Revisar que cualquier modal, drawer o menú desplegable use los **componentes oficiales** (modal, drawer, dropdown-menu).  
   *Revisado: No hay modales en el módulo. Drawers: crear-asignacion usa el componente oficial (drawer.css, drawer.js, openDrawer/closeDrawer) para "Agregar asignación" (drawer-agregar-usuarios) y "Agregar cursos" (drawer-agregar-cursos); detalle-plan usa el mismo componente para el panel de contenidos del estudiante (drawer-contenidos-estudiante). Dropdowns: planes-formacion usa el componente oficial (dropdown-menu.css, dropdown-menu.js, getDropdownMenuHtml, openDropdownMenu, closeDropdownMenu) para el menú "Crear plan" (Plan de contenidos / Plan de competencias).*

9. [x] **Otros componentes**  
   Revisar uso de Status Tag, Alert, Toast, Card, Tab, etc. donde aplique; sustituir por componentes UBITS si hoy hay markup o estilos custom.  
   *Revisado: Status Tag: planes-formacion usa ubits-status-tag (success, warning, neutral) con status-tag.css. Table: todas las tablas usan ubits-table, ubits-table-wrapper, ubits-table__progress-bar y table.css (planes-formacion, grupos, crear-grupo, detalle-plan). Checkbox: ubits-checkbox y checkbox.css en planes-formacion, grupos, detalle-plan. Card: crear-asignacion usa loadCardContentCompact y card-content-compact (drawer de cursos). Tab: tabs en header-product (planes-formacion) usan ubits-tab del componente; tab.css importado. No hay Alert ni Toast en el módulo; no se encontró markup custom de tag, card o tabla que deba sustituirse.*

### 3. Estilos y tokens

10. [x] **Tokens de color**  
   Revisar que no haya colores hardcodeados (#hex, rgb, etc.). Usar solo **tokens UBITS** (`var(--ubits-*)`).  
   *Revisado: búsqueda en lms-creator (.html, .css, .js). Un único hallazgo: en detalle-plan.css el hover del enlace usaba fallback `#0056b3` en `var(--ubits-accent-brand-hover, #0056b3)`. Corregido a `var(--ubits-accent-brand)` (token oficial; no existe --ubits-accent-brand-hover en ubits-colors). Resto de archivos ya usan solo var(--ubits-*).*

11. [x] **Tipografía**  
    Revisar que todos los textos usen **clases de tipografía oficiales** (`ubits-heading-h1`, `ubits-body-md-regular`, etc.) y no clases inventadas ni etiquetas sin clase.  
    *Revisado: añadidas clases UBITS donde faltaban. Botones: spans con ubits-body-sm-regular (Enviar recordatorio, Agregar cursos, Agregar asignación, Agregar persona, Cancelar, Agregar, Cerrar). Tablas: th con ubits-body-sm-semibold (detalle-plan, crear-grupo, planes-formacion, grupos, drawer Contenido/Acciones). Stats: asignacion-plan-card__stat-value con ubits-body-md-bold (números) o ubits-body-md-regular (Por definir). Resto de páginas ya usaba ubits-body-*, ubits-heading-h2.*

12. [x] **Espaciado y bordes**  
    Revisar uso de **tokens de espaciado** (`--gap-*`, `--padding-*`, `--border-radius-*`) y bordes con `var(--ubits-border-1)`.  
    *Revisado: todos los bordes con color usan ya var(--ubits-border-1), var(--ubits-border-2) o var(--ubits-accent-brand). margin-bottom: 16px en lms-creator.css sustituido por var(--gap-lg). Valores fuera de escala (14px, 2px, min-width/max-height en px) se mantienen en px según reglas del proyecto.*

13. [x] **CSS por página**  
    Verificar que cada página tenga su **archivo CSS homónimo** (ej. `contenidos.html` → `contenidos.css` si aplica) y que no se mezclen estilos de varias páginas en un solo archivo ni en `<style>` inline.  
    *Comprobado: las 8 páginas tienen CSS homónimo (contenidos.css y categorias.css se crearon y enlazan desde sus HTML). No hay `<style>` inline en ningún HTML. `lms-creator.css` es layout compartido del módulo (content-sections, section-single, etc.), no mezcla estilos de páginas distintas.*

### 4. Contenido y copy

14. [x] **Títulos y etiquetas**  
    Revisar que títulos y labels estén en **sentence case** (solo primera mayúscula, salvo nombres propios y siglas).  
    *Revisado: títulos, botones y labels en planes-formación, grupos, detalle-plan, crear-grupo, crear-asignacion y crear-plan-asistente ya estaban en sentence case. Corregido en grupos: "Crear a partir de Organigrama" → "Crear a partir de organigrama". Contenidos y categorías quedan pendientes para cuando se desarrollen.*

15. [x] **Empty states y mensajes**  
    Definir o revisar textos cuando no hay datos (listas vacías, sin resultados de búsqueda) y usar el **componente Empty State** oficial.  
    *Revisado: planes-formación, grupos y detalle-plan usan `loadEmptyState()` con empty-state.css y empty-state.js. Se distingue: (1) Sin datos — planes "Aún no hay planes" + botón Crear plan; grupos "Aún no hay grupos" + botón Agregar grupo; detalle-plan "No hay asignaciones" sin botón. (2) Sin resultados de búsqueda — los tres muestran "No se encontraron resultados" + descripción + botón "Limpiar búsqueda" conectado a clearSearch/clearFilters. Contenedores `#planes-empty-state`, `#grupos-empty-state`, `#asignaciones-empty-state`; clase `.is-empty` en el wrapper para ocultar tabla y mostrar el empty state.*

### 5. Datos y lógica

16. [x] **Origen de datos**  
    Decidir si el módulo usará **datos mock** en JS (similar a `tareas-base-unificada.js`), solo HTML estático o una combinación; documentar aquí.  
    *Decisión: **HTML estático + JS inline por página.** Las tablas de planes-formación, grupos y detalle-plan tienen las filas definidas en el HTML (`<tbody>` con `<tr>`); el JS de cada página obtiene `table.querySelectorAll('tbody tr')`, guarda la referencia en `tableRows` y aplica orden, filtro, búsqueda y eliminación sobre el DOM. No existe un archivo de datos mock central (como `tareas-base-unificada.js`). El archivo `lms-creator-tables.js` solo aporta utilidades (formatDateHumanized, applyHumanizedDates) y lo usan planes-formación y detalle-plan. Formularios (crear-grupo, crear-asignacion) construyen filas dinámicamente en JS al agregar integrantes/cursos. Si más adelante se quiere una única fuente de datos mock, se podría añadir un `lms-creator-data.js` y generar las filas por JS.*

17. [x] **Navegación entre páginas**  
    Revisar que los enlaces (ej. de listado a detalle, de “crear” a listado) y parámetros de URL (ej. `?id=`) sean coherentes y probarlos.  
    *Revisado: Planes → fila a detalle-plan.html?id=; Crear con AI → crear-plan-asistente; Crear plan → crear-asignacion.html?tipo=. Detalle plan lee ?id= (URLSearchParams); Atrás → planes-formacion. Crear asignación/crear plan asistente: Atrás y Guardar → planes-formacion. Grupos ↔ crear-grupo. Rutas relativas.*

18. [x] **Accesibilidad y comportamiento**  
    Revisar labels de botones/iconos (`aria-label`), orden de foco y que los controles interactivos tengan feedback claro (hover, focus, disabled).  
    *Revisado: Botones solo icono tienen `aria-label` (Buscar, Ordenar por..., Filtrar por estado, Eliminar, Quitar, Seleccionar todo). Añadido `aria-label="Cerrar búsqueda"` al botón X de búsqueda creado dinámicamente en planes-formación, grupos y detalle-plan. Checkboxes de cabecera tienen `aria-label="Seleccionar todo"`. Tooltips (`data-tooltip`) en búsqueda, ordenar, filtrar y celdas de checkbox. Botón "Eliminar" en modales de confirmación arranca `disabled` y se habilita al escribir "eliminar" (planes, grupos, detalle-plan). Hover/focus provienen de componentes UBITS (button.css, input.css).*

### 6. Validación y documentación

19. [x] **Validador UBITS**  
    Pasar todas las páginas del scope por **validador-ubits.html** y corregir hasta alcanzar 100 % en las reglas que apliquen.

20. [ ] **Documentación de componentes custom**  
    Si se crean componentes o patrones específicos de LMS Creator (ej. cards de contenido, listas de planes), documentar uso y variantes en documentación o en este changelog.

---

## Próximas solicitudes (fechas por definir)

*Se irán añadiendo bloques por fecha (ej. "## Cambios DD de mes de 2026") con ítems numerados en continuación.*

---

*Última actualización: creado el changelog en blanco con ideas de revisión. Pendiente de que el equipo complemente ítems y fechas.*
