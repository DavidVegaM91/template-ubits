# Plan de acción: componente UBITS Data Table

Documento de planificación para unificar tablas con encabezados configurables, checkboxes, búsqueda, filtros, empty states y barra de acciones. Referencia: tabla de seguimiento y tablas del drawer "Agregar asignación".

---

## 1. Objetivo

- **Problema:** Cada tabla nueva implica repetir configuración de encabezados (botones ordenar/filtrar, tooltips), dropdowns, lógica de checkboxes (select all / deselect all), empty states, búsqueda, filtros, "Ver seleccionados" y barra de acciones.
- **Solución:** Un componente reutilizable que centralice todo eso. Crear una tabla = definir configuración + una llamada al componente.

---

## 2. Alcance del componente

El componente debe cubrir:

| Funcionalidad | Descripción |
|---------------|-------------|
| Encabezados | Checkbox "Seleccionar todo", columnas con botones de ordenar y/o filtrar, tooltips en todos los controles. |
| Dropdowns | Orden (A–Z / Z–A u otro) y filtros por columna (checkboxes, listas, etc.). |
| Checkboxes | Lógica como en seguimiento: si hay selección (parcial o total), clic en encabezado = deseleccionar todo; si no hay ninguna = seleccionar todo. Estado indeterminado y tooltip "Deseleccionar todo" / "Seleccionar todo". |
| Empty states | Sin datos (mensaje + icono) y sin resultados de búsqueda (mensaje distinto). |
| Búsqueda | Campo/botón de búsqueda, integrado con filtros. |
| Filtros | Chips "Filtros aplicados", botón "Limpiar filtros", persistencia de filtros por columna. |
| Barra de acciones | Visible cuando hay selección; botones configurables (ej. Eliminar, Exportar). |
| Ver seleccionados | Botón que filtra la tabla para mostrar solo filas seleccionadas; texto "Dejar de ver seleccionados (N)". |
| Contador de resultados | Texto tipo "X/Y resultados" (visibles/total). |

---

## 3. Ubicación de archivos

| Archivo | Ubicación | Notas |
|---------|-----------|--------|
| JS del componente | `components/ubits-data-table.js` | API pública: `createUbitsDataTable(options)`. |
| CSS del componente | `components/ubits-data-table.css` | Estilos de tabla, empty state, barra de acciones, chips. Reutilizar tokens UBITS. |
| Documentación | `documentacion/componentes/ubits-data-table.html` o sección en `documentacion/componentes.html` | Uso, opciones del config, ejemplo completo. |

Las páginas que usen el componente incluirán:

```html
<link rel="stylesheet" href="../../components/ubits-data-table.css">
<script src="../../components/ubits-data-table.js"></script>
```

---

## 4. API propuesta (configuración)

```javascript
var table = createUbitsDataTable({
  containerId: 'mi-tabla-container',   // Contenedor donde se renderiza la tabla
  tableId: 'mi-tabla',                 // id del <table> (para accesibilidad y estilos)
  columns: [
    { id: 'nombre', label: 'Nombre', sortable: true, filterable: true },
    { id: 'estado', label: 'Estado', filterable: true, filterType: 'checkbox' }
  ],
  getData: function() { return myDataArray; },
  rowIdField: 'id',
  buildRowHtml: function(row) { return '<tr data-id="' + row.id + '">...</tr>'; },
  features: {
    checkboxes: true,
    search: true,
    filters: true,
    verSeleccionados: true,
    actionBar: true,
    resultsCount: true
  },
  emptyState: {
    message: 'No hay elementos.',
    icon: 'far fa-folder-open'
  },
  emptySearchState: {
    message: 'No hay resultados para tu búsqueda.'
  },
  actionBarButtons: [
    { id: 'eliminar', label: 'Eliminar', icon: 'far fa-trash', onClick: function(selectedIds) { ... } }
  ],
  i18n: {
    selectAll: 'Seleccionar todo',
    deselectAll: 'Deseleccionar todo',
    verSeleccionados: 'Ver seleccionados',
    clearFilters: 'Limpiar filtros',
    filtrosAplicados: 'Filtros aplicados'
  }
});

// API para la página
table.getSelectedIds();
table.getVisibleRows();
table.setFilter(col, values);
table.refresh();
```

---

## 5. Plan de acción paso a paso

**Principio:** No tocar las tablas que ya funcionan (drawer colaboradores, drawer grupos, seguimiento) hasta que el componente esté validado en otro sitio. La migración de tablas existentes es la **última fase**.

---

### Fase 1: Crear el componente y validar en una página de ejemplo

| Paso | Acción | Entregable / Criterio de éxito |
|------|--------|--------------------------------|
| 1.1 | Crear `components/ubits-data-table.js` con la función `createUbitsDataTable(options)`. Definir el esquema de opciones (columns, getData, rowIdField, buildRowHtml, features, emptyState, emptySearchState, actionBarButtons, i18n). | Archivo JS con API clara y comentarios. |
| 1.2 | Implementar en el componente: generación del `<thead>` con checkbox de encabezado, columnas con botones ordenar/filtrar según config, y tooltips (data-tooltip / initTooltip si existe). | Thead renderizado según columns. |
| 1.3 | Implementar renderizado del `<tbody>`: llamar a getData(), filtrar/ordenar según estado interno, generar filas con buildRowHtml(row). Enlazar checkbox de fila a estado de selección. | Tbody correcto y checkboxes por fila funcionando. |
| 1.4 | Implementar lógica del checkbox del encabezado igual que en seguimiento: en el evento `change`, calcular checkedCount (filas visibles seleccionadas). Si `this.checked && checkedCount > 0 && checkedCount < visible.length` → deseleccionar todo; si `this.checked` → seleccionar todas; si no → deseleccionar todas. Actualizar tooltip "Seleccionar todo" / "Deseleccionar todo". | Clic en encabezado con selección parcial deselecciona todo. |
| 1.5 | Implementar empty state "sin datos" (getData().length === 0) y empty state "sin resultados" (búsqueda/filtros activos y 0 filas visibles). Usar emptyState.message/icon y emptySearchState.message. | Dos mensajes distintos visibles en los dos casos. |
| 1.6 | Implementar búsqueda: campo o botón que abre campo, aplicar filtro de texto a filas visibles, actualizar resultados y empty state de búsqueda. | Búsqueda filtra filas y muestra empty search si no hay resultados. |
| 1.7 | Implementar filtros por columna: dropdown por columna filterable, opciones según filterType (checkbox, lista). Chips "Filtros aplicados" y botón "Limpiar filtros". | Filtros aplicados, chips visibles y limpiar restaura vista. |
| 1.8 | Implementar orden: dropdown o botones por columna sortable (ej. A–Z / Z–A). Actualizar orden de filas visibles. | Ordenar cambia el orden de las filas. |
| 1.9 | Implementar barra de acciones: visible cuando hay al menos una fila seleccionada; botones definidos en actionBarButtons; onClick(selectedIds). | Barra visible con selección y botones ejecutan callback. |
| 1.10 | Implementar "Ver seleccionados": botón que filtra la tabla a solo filas seleccionadas; texto "Dejar de ver seleccionados (N)" cuando está activo. | Ver seleccionados muestra solo seleccionadas y permite volver. |
| 1.11 | Implementar contador de resultados (features.resultsCount): texto "X/Y" (visibles/total). | Contador actualizado al filtrar/ordenar/seleccionar. |
| 1.12 | Crear `components/ubits-data-table.css` con estilos para tabla, empty state, barra de acciones, chips. Usar solo tokens UBITS (colores, tipografía, espaciado). | CSS sin colores hardcodeados. |
| 1.13 | Crear una **página de ejemplo** (por ejemplo `documentacion/ejemplos/tabla-data-table-ejemplo.html` o similar) que use `createUbitsDataTable` con **datos de prueba**: columnas con orden y filtros, checkboxes, búsqueda, ver seleccionados, barra de acciones. Validar ahí que todo funciona (select all/deselect all, empty states, filtros, chips) **sin tocar** crear-asignacion ni seguimiento. | Componente renderizado y probado en una página dedicada; tablas existentes siguen igual. |

**Criterio de cierre Fase 1:** El componente existe, se ve y se comporta correctamente en una página de ejemplo. Las tablas actuales (drawer, seguimiento) no se modifican.

---

### Fase 2: Documentación y mantenimiento

| Paso | Acción | Entregable / Criterio de éxito |
|------|--------|--------------------------------|
| 2.1 | Añadir el componente a `documentacion/componentes.html` (enlace o sección). | Componente listado en la documentación de componentes. |
| 2.2 | Crear página de documentación del componente (por ejemplo `documentacion/componentes/ubits-data-table.html` o sección en componentes.html) con: descripción, opciones del config (columns, features, emptyState, actionBarButtons, i18n), ejemplo de uso completo (tabla con checkboxes, búsqueda, filtros, ver seleccionados), y referencia a la tabla de seguimiento como ejemplo de comportamiento. | Cualquier desarrollador o Cursor puede crear una tabla nueva siguiendo la doc. |
| 2.3 | Incluir en la documentación una "checklist de tabla nueva": incluir ubits-data-table.js y .css, definir config, implementar buildRowHtml, probar checkboxes, empty states, búsqueda y filtros. | Checklist reutilizable para nuevas tablas. |

**Criterio de cierre Fase 2:** Documentación suficiente para que crear una tabla nueva sea configurar + opcionalmente buildRowHtml, sin reimplementar lógica.

---

### Fase 3: Migrar tablas existentes (último paso)

Solo cuando el componente esté validado en la página de ejemplo y documentado, se tocan las tablas que ya funcionan.

| Paso | Acción | Entregable / Criterio de éxito |
|------|--------|--------------------------------|
| 3.1 | Migrar la tabla del **drawer de colaboradores** (crear-asignacion.html) al componente. Configurar columns, getData, buildRowHtml y features. Eliminar código duplicado. Probar que el comportamiento es idéntico. | Drawer colaboradores usa createUbitsDataTable. |
| 3.2 | Migrar la tabla del **drawer de grupos** (crear-asignacion.html) al componente. Configurar columnas (nombre, descripción, integrantes), orden, checkboxes, ver seleccionados, empty states. | Drawer grupos usa createUbitsDataTable. |
| 3.3 | Revisar si la **tabla principal de seguimiento** (tareas/planes) puede usar el componente. Si la complejidad (paginación, load more, múltiples pestañas) lo permite, definir config y migrar en pasos; si no, dejar para una fase posterior y documentar la decisión. | Decisión documentada y, si aplica, seguimiento usando el componente o plan para hacerlo más adelante. |
| 3.4 | **Cierre:** Cuando todo esté listo (componente en uso, documentación publicada, migraciones hechas), eliminar este archivo temporal: `documentacion/planeacion-data-table.md`. | Archivo eliminado; el plan ya no es necesario. |

**Criterio de cierre Fase 3:** Las tablas del drawer (y opcionalmente seguimiento) usan el componente; no se migra nada hasta que Fase 1 y 2 estén cerradas. Al terminar, se borra este documento de planificación.

---

## 6. Referencias de código actual

- **Lógica checkbox encabezado (referencia obligatoria):** `ubits-colaborador/tareas/seguimiento.js` — en `renderTable()` el listener `change` del `#seguimiento-select-all` que usa `checkedCount` para decidir deseleccionar todo vs seleccionar todo. No depender de flags de click; decidir por estado actual de filas.
- **Tablas a migrar (solo en Fase 3, cuando el componente esté validado):**  
  - Drawer colaboradores: `ubits-colaborador/lms-creator/crear-asignacion.html` (drawer con tabla de empleados, filtros, búsqueda, ver seleccionados).  
  - Drawer grupos: mismo archivo, segunda tabla del drawer (grupos, orden A–Z / Z–A).  
  - Seguimiento: `ubits-colaborador/tareas/seguimiento.js` + HTML correspondiente (tabla principal tareas/planes).

---

## 7. Resumen

| Fase | Contenido |
|------|-----------|
| **Fase 1** | Crear `ubits-data-table.js` y `.css`, implementar thead/tbody, checkboxes (lógica seguimiento), empty states, búsqueda, filtros, orden, barra de acciones, ver seleccionados, contador; **validar en una página de ejemplo** (ej. `documentacion/ejemplos/tabla-data-table-ejemplo.html`). No tocar tablas existentes. |
| **Fase 2** | Documentar componente en `documentacion/componentes.html` y página propia; checklist para tablas nuevas. |
| **Fase 3** | Migrar drawer colaboradores, drawer grupos y (si aplica) tabla de seguimiento al componente; por último, eliminar `documentacion/planeacion-data-table.md`. Solo después de tener el componente probado y documentado. |

Al final, las tablas quedarán uniformes y el coste de una tabla nueva será solo definir la configuración (y opcionalmente `buildRowHtml`), sin repetir tooltips, dropdowns, lógica de checkboxes ni empty states. Las tablas que ya funcionan no se tocan hasta la Fase 3. Cuando todo esté listo, se elimina este archivo de planificación.
