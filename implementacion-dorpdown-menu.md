# Plan de implementación: Dropdown Menu UBITS (componente oficial en todo)

Objetivo: usar **solo** el componente oficial Dropdown Menu (`components/dropdown-menu.css` + `components/dropdown-menu.js`) en todo el proyecto. Cero dropdowns hardcodeados. Plan paso a paso, muy medido.

**Orden de implementación:**

1. **Componentes** que tienen dropdown (input, paginator)  
2. **Páginas de seguimiento** (colaborador)  
3. **Resto de páginas colaborador**  
4. **Páginas admin**  
5. **Páginas de documentación** + **añadir al validador**

---

## Fase 1 – Componentes con dropdown (input, paginator)

Aquí se modifica la *lógica interna* de los componentes para que sus menús desplegables sean el Dropdown Menu oficial (getDropdownMenuHtml + openDropdownMenu + closeDropdownMenu). Sin hardcode de HTML/CSS de menú.

### 1.1 Componente Input (`components/input.js` + `components/input.css`)

**Estado actual:** Para `type: 'select'` se usa `createSelectDropdown()` que construye un panel con clase `.ubits-select-dropdown` y opciones `.ubits-select-option` (HTML/CSS propio).

**Objetivo:** Que el select del Input use el Dropdown Menu oficial.

**Pasos (uno tras otro):**

1. **Dependencia:** En input.js asumir que `getDropdownMenuHtml`, `openDropdownMenu`, `closeDropdownMenu` existen (o cargar/verificar dropdown-menu.js antes de usarlo). Documentar que las páginas que usen createInput type select deben incluir también dropdown-menu.css y dropdown-menu.js.
2. **Contenedor del overlay:** createInput(type select) debe recibir o crear un contenedor global (ej. un div en body o junto al input) donde inyectar el overlay del menú. Por ejemplo un único `id="ubits-input-select-overlay-container"` en body o un contenedor por input.
3. **Generar menú con API oficial:** En lugar de crear `.ubits-select-dropdown`, construir `config` con overlayId único (ej. `overlayId + '-select-' + containerId`), options = selectOptions mapeados a `{ text, value }`, sin footer y sin autocomplete. Llamar a `getDropdownMenuHtml(config)` e inyectar el HTML en el contenedor del overlay.
4. **Abrir/cerrar:** Al hacer clic en el input (focus/click), llamar a `openDropdownMenu(overlayId, inputWrapper)`. Al elegir una opción: actualizar el valor (texto) del input, llamar a `closeDropdownMenu(overlayId)` y ejecutar `onChange(value)` si existe.
5. **Cerrar al clic fuera:** El componente Dropdown Menu ya cierra con clic en overlay; no añadir lógica extra.
6. **Eliminar código viejo:** Quitar o no ejecutar `createSelectDropdown()` para type select. Eliminar de input.css los estilos de `.ubits-select-dropdown` y `.ubits-select-option` (o dejarlos mínimos si algo los referencia hasta migrar todas las páginas).
7. **Probar:** En `documentacion/componentes/input.html` verificar todos los selects (size, state, mandatory, demos). Comprobar que el menú abre abajo/arriba según espacio.

**Checklist Fase 1.1**

- [x] input.js: type select usa getDropdownMenuHtml + openDropdownMenu + closeDropdownMenu.
- [x] input.js: overlay inyectado en contenedor definido; overlayId único por select.
- [x] input.css: sin estilos hardcode del dropdown de select (o solo compat temporal).
- [x] Docs: indicar que createInput(type select) requiere dropdown-menu.css y dropdown-menu.js.
- [x] Probar input.html (todos los selects).

### 1.2 Componente Paginator (`components/paginator.js` + `components/paginator.css`)

**Estado actual:** Usa createInput type select para “items por página”; el dropdown que abre es el del Input (o uno custom con posicionamiento “dropdown-up”).

**Objetivo:** Que ese dropdown sea el oficial. Si el Input ya usa Dropdown Menu (Fase 1.1), el paginator lo hereda. Si el paginator tiene lógica propia de posicionamiento, sustituirla por openDropdownMenu(overlayId, anchor).

**Pasos:**

1. Asegurar que las páginas que usan loadPaginator incluyan dropdown-menu.css y dropdown-menu.js (o que paginator.js los cargue si está definido así).
2. Si paginator.js construye su propio dropdown (no solo createInput): reemplazar por getDropdownMenuHtml + openDropdownMenu + closeDropdownMenu. Reutilizar la posición “arriba/abajo” del componente oficial.
3. En paginator.css quitar estilos propios del dropdown de items por página (ej. `.ubits-paginator__items-select .ubits-select-dropdown`, `.dropdown-up`) si ya no aplican.
4. Probar en una página que use paginator (ej. documentacion/componentes/paginator.html).

**Checklist Fase 1.2**

- [ ] Paginator usa el mismo dropdown que Input (Dropdown Menu oficial) o se integra con getDropdownMenuHtml/open/close.
- [ ] Sin HTML/CSS hardcode de menú en paginator.
- [ ] Probar paginator en doc.

---

## Fase 2 – Páginas de seguimiento (colaborador)

**Archivos:** `ubits-colaborador/tareas/seguimiento.html`, `ubits-colaborador/tareas/seguimiento-leader.html`, `seguimiento.js`, `seguimiento.css`, `seguimiento-leader.css` (si aplica).

**Objetivo:** Todos los menús de estas páginas (ordenar, filtro con autocomplete, checkboxes, prioridad, estado, columnas, período, reasignar, descargar) deben generarse con getDropdownMenuHtml y abrir/cerrar con openDropdownMenu/closeDropdownMenu. Cero overlays/paneles custom hardcodeados.

**Pasos (por tipo de menú, uno a uno):**

1. **Imports:** En seguimiento.html y seguimiento-leader.html añadir en `<head>`: `components/dropdown-menu.css` y `components/dropdown-menu.js` (rutas relativas desde la carpeta tareas: `../../components/`).
2. **Contenedores:** En el HTML, sustituir cada bloque “overlay + panel” (sort-menu, filter-menu, checkbox-menu, priority-menu, status-menu, columns-menu, periodo-menu, reasignar-menu, descargar-menu) por un único contenedor por tipo (ej. `id="sort-dropdown-container"`) donde se inyecte el HTML del overlay.
3. **Ordenar columna:** En seguimiento.js, al abrir el menú de ordenar: construir config (options con leftIcon, footer Cancelar/Aceptar), getDropdownMenuHtml(config), insertar en contenedor, openDropdownMenu(overlayId, trigger). En opciones y footer: aplicar orden y closeDropdownMenu. Eliminar uso de sort-menu-overlay y sort-menu.
4. **Filtro con autocomplete:** Config con hasAutocomplete: true, autocompleteContainerId, footer. Tras inyectar, createInput en ese container. openDropdownMenu(overlayId, trigger). Al Aplicar: lógica de filtrado y closeDropdownMenu.
5. **Filtro checkboxes:** Config con options (checkbox/selected), footer. Generar options desde datos. Misma mecánica open/close y callbacks.
6. **Prioridad / Estado:** Config con options (iconos o solo texto), sin footer. openDropdownMenu al hacer clic en celda; al elegir opción, actualizar datos y closeDropdownMenu.
7. **Columnas visibles:** Config con options checkbox, footer opcional. Misma mecánica.
8. **Período / Reasignar / Descargar:** Cada uno con su config (options; autocomplete solo si aplica). Reemplazar overlays/paneles custom por inyección + open/close.
9. **CSS:** En seguimiento.css (y leader) eliminar o comentar estilos de los menús antiguos (sort-menu, filter-menu, checkbox-menu, priority-menu, status-menu, columns-menu, periodo-menu, reasignar-menu, descargar-menu) una vez migrados.
10. **Pruebas:** Probar cada menú en seguimiento y en seguimiento-leader; modo claro/oscuro; viewport pequeño (que abra hacia arriba cuando toque).

**Checklist Fase 2**

- [ ] seguimiento.html y seguimiento-leader.html con dropdown-menu.css y dropdown-menu.js.
- [ ] Todos los menús usan getDropdownMenuHtml + openDropdownMenu + closeDropdownMenu.
- [ ] HTML sin overlays/paneles custom; solo contenedores para inyectar.
- [ ] seguimiento.js (y leader si aplica) sin lógica de mostrar/ocultar/posicionar menús propios.
- [ ] CSS sin estilos de los menús viejos.
- [ ] Pruebas en ambas páginas.

---

## Fase 3 – Resto de páginas colaborador

**Objetivo:** Cualquier otra página bajo `ubits-colaborador/` que tenga un dropdown o menú desplegable debe usar el componente oficial.

**Archivos conocidos con dropdown:**

- `ubits-colaborador/aprendizaje/catalogo-v5.html`, `catalogo-v6.html`: selector de academia (dropdown custom `.academia-selector-custom__dropdown-menu`).
- Revisar también: `catalogo.html`, `catalogo-v2` a `catalogo-v4` si tienen selectores o filtros desplegables.
- Cualquier otra página con `<select>` nativo o menú custom que se detecte al revisar.

**Pasos:**

1. Listar (o revisar) todos los HTML en ubits-colaborador que tengan dropdown/select/menú (grep o revisión manual).
2. **Catálogo v5/v6 (academia):** Sustituir la construcción manual del dropdown por getDropdownMenuHtml(options = academias) + contenedor + openDropdownMenu(overlayId, botón). Al elegir opción: actualizar trigger, closeDropdownMenu, ejecutar lógica actual (render competencias). Añadir dropdown-menu.css y dropdown-menu.js. Quitar CSS/JS del dropdown custom.
3. Para cada otra página listada: mismo patrón (imports, contenedor, config, getDropdownMenuHtml, open/close, quitar hardcode).
4. Probar cada página modificada.

**Checklist Fase 3**

- [ ] Inventario de páginas colaborador con dropdown actualizado.
- [ ] catalogo-v5 y catalogo-v6 (y otras que tengan dropdown) migradas al componente oficial.
- [ ] Sin dropdowns hardcodeados en colaborador (salvo los ya migrados en Fase 2).

---

## Fase 4 – Páginas admin

**Carpeta:** `ubits-admin/` (aprendizaje, desempeno, diagnostico, empresa, encuestas, inicio, otros).

**Objetivo:** Todas las páginas admin que tengan dropdown o menú desplegable usan el componente oficial.

**Pasos:**

1. Listar todos los HTML en ubits-admin que tengan `<select>`, overlays de menú, filtros desplegables, etc. (grep o revisión).
2. Para cada una: añadir dropdown-menu.css y dropdown-menu.js (rutas relativas desde su carpeta, ej. `../../components/`). Sustituir selects nativos o menús custom por flujo getDropdownMenuHtml + contenedor + openDropdownMenu/closeDropdownMenu. Quitar HTML/CSS propio del menú.
3. Probar cada página modificada.

**Checklist Fase 4**

- [ ] Inventario de páginas admin con dropdown.
- [ ] Todas migradas al Dropdown Menu oficial.
- [ ] Sin dropdowns hardcodeados en admin.

---

## Fase 5 – Documentación y validador

**Objetivo:** (1) Páginas bajo `documentacion/` que muestren o usen dropdowns deben usar el componente oficial. (2) El validador UBITS debe conocer el Dropdown Menu y comprobar su uso cuando corresponda.

### 5.1 Páginas de documentación

**Archivos relevantes:**

- `documentacion/componentes/input.html`: usa createInput type select; al terminar Fase 1 ya usará el componente por debajo. Solo verificar que incluye dropdown-menu.css y dropdown-menu.js.
- `documentacion/componentes/header-product.html`: tiene `<select id="select-active-tab">` nativo en el preview. Sustituir por flujo con getDropdownMenuHtml (options = tabs) + botón trigger + openDropdownMenu/closeDropdownMenu, o por createInput type select si se prefiere consistencia con otros controles de preview (en ambos casos componente oficial, no select nativo).
- `documentacion/componentes/ia-button.html`: createInput type select; tras Fase 1 ya usa el componente. Verificar imports.
- `documentacion/componentes/paginator.html`: tras Fase 1.2 ya usa el componente. Verificar imports.
- `documentacion/componentes/calendar.html`: createInput select para mes/año; tras Fase 1 usa el componente. Verificar imports.
- `documentacion/componentes/dropdown-menu.html`: ya es la doc del componente; no cambiar comportamiento, solo asegurar que pasa el validador.

**Pasos:**

1. Añadir en cada página de documentación que use select o dropdown los imports de dropdown-menu.css y dropdown-menu.js (si no están ya).
2. header-product.html: reemplazar el `<select>` nativo del preview por componente oficial (Dropdown Menu o createInput select).
3. Probar todas las páginas de documentación tocadas.

**Checklist Fase 5.1**

- [ ] Todas las páginas de documentación que tengan dropdown usan el componente oficial.
- [ ] header-product sin select nativo.
- [ ] Imports correctos en input, ia-button, paginator, calendar, etc.

### 5.2 Validador UBITS

**Archivo:** `documentacion/validador-ubits.html`

**Objetivo:** Que el validador reconozca el componente Dropdown Menu y compruebe que, cuando en una página se use un menú desplegable (p. ej. getDropdownMenuHtml, openDropdownMenu, closeDropdownMenu o clases del dropdown menu), estén declarados los CSS/JS del componente.

**Pasos:**

1. En el objeto de componentes del validador (donde están 'createInput', 'loadHeaderProduct', etc.), añadir una entrada para el Dropdown Menu, por ejemplo:
   - clave: `'getDropdownMenuHtml'` o `'ubits-dropdown-menu'`,
   - css: `'components/dropdown-menu.css'`,
   - js: `'components/dropdown-menu.js'`,
   - type: `'getDropdownMenuHtml() / openDropdownMenu() / closeDropdownMenu()'`,
   - classCheck: `'ubits-dropdown-menu__overlay'` o null si se detecta por uso de la función.
2. Definir la regla de detección: si en el HTML o en scripts inline hay uso de `getDropdownMenuHtml`, `openDropdownMenu` o `closeDropdownMenu`, o la clase `ubits-dropdown-menu__overlay` (o `ubits-dropdown-menu__content`), entonces el validador exige que dropdown-menu.css y dropdown-menu.js estén en la lista de enlaces/scripts de la página.
3. Incluir en los mensajes de error/ayuda del validador un texto que indique añadir dropdown-menu.css y dropdown-menu.js cuando se use el Dropdown Menu.
4. Probar el validador con una página que use el componente y con una que no; verificar que solo pide los recursos cuando corresponde.

**Checklist Fase 5.2**

- [ ] Validador tiene entrada para el componente Dropdown Menu (css + js).
- [ ] Detección por getDropdownMenuHtml/openDropdownMenu/closeDropdownMenu o clases del componente.
- [ ] Mensaje claro cuando falte dropdown-menu.css o dropdown-menu.js.
- [ ] Pruebas de validación OK.

---

## Resumen del orden (medido, paso a paso)

| Fase | Alcance | Entregable |
|------|---------|------------|
| **1** | Componentes: Input + Paginator | Select y “items por página” usan Dropdown Menu oficial; sin dropdown hardcode en input.css/input.js ni paginator. |
| **2** | Páginas seguimiento (colaborador) | seguimiento.html, seguimiento-leader.html y su JS/CSS usan solo getDropdownMenuHtml + open/close para todos los menús. |
| **3** | Resto colaborador | Catálogos (v5, v6 y los que tengan dropdown) y cualquier otra página colaborador con menú migrada. |
| **4** | Admin | Todas las páginas admin con dropdown migradas al componente oficial. |
| **5** | Documentación + Validador | Docs sin selects/dropdowns hardcode; validador incluye Dropdown Menu y valida sus recursos. |

---

## Referencia rápida del componente

- **CSS:** `components/dropdown-menu.css`
- **JS:** `components/dropdown-menu.js`
- **API:** `getDropdownMenuHtml(config)`, `openDropdownMenu(overlayId, position)`, `closeDropdownMenu(overlayId)`
- **config:** overlayId, contentId?, options[], hasAutocomplete?, autocompletePlaceholder?, autocompleteContainerId?, footerSecondaryLabel?, footerPrimaryLabel?, footerSecondaryId?, footerPrimaryId?
- **options[].:** text, value?, leftIcon?, rightIcon?, checkbox?, switch?, selected?

Archivo temporal; se puede borrar o mover a `docs/` cuando la implementación esté cerrada.
