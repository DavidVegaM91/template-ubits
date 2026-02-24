# Plan de implementación: reemplazo de checkboxes hardcodeados por componente UBITS Checkbox

**Objetivo:** Sustituir todos los checkboxes nativos/hardcodeados por el componente oficial `ubits-checkbox` (o mantenerlos donde no aplique) **sin romper la funcionalidad** en cada archivo.

**Regla especial:** En la **tirilla de tareas** (task-strip) se reemplaza el **radio** actual por un **checkbox circular** UBITS; es el **único** caso donde un radio se convierte en checkbox. En el resto del proyecto los radios se mantienen como radios.

---

## Resumen por ubicación

| Área | Archivos con checkboxes | Acción |
|------|-------------------------|--------|
| **components/** | task-strip.js, task-strip.css, dropdown-menu.js, dropdown-menu.css | Tirilla: radio → checkbox circular. Dropdown: ver nota. |
| **ubits-colaborador/tareas/** | seguimiento.js, tareas.js, plan-detail.js, task-detail.js, tareas.css, seguimiento.css | Filtros, tabla, menú columnas → ubits-checkbox. Ajustar selectores JS donde toque. |
| **documentacion/componentes/** | Varios (table, empty-state, tooltip, input, tab, dropdown-menu, header-product, button, ia-button, checkbox) | Ver sección Doc: opcional / fase 2. |

---

## 1. Tirilla de tareas (radio → checkbox circular) — PRIORITARIO

**Contexto:** Hoy la tirilla usa markup de **radio** (`ubits-radio`, `ubits-radio__circle`) con `input type="checkbox"` para “marcar como finalizada” y mover la tarea al final con la lógica actual. Se pide reemplazar por **checkbox circular UBITS** sin cambiar ese comportamiento.

### 1.1 `components/task-strip.js`

- **Actual:** Genera algo como:
  ```html
  <span class="tarea-item__radio">
    <label class="ubits-radio ubits-radio--sm tarea-done-radio" ...>
      <input type="checkbox" class="ubits-radio__input" name="tarea-done-{id}" value="1" checked? data-tarea-id="{id}">
      <span class="ubits-radio__circle"></span>
      <span class="ubits-radio__label" aria-hidden="true">&nbsp;</span>
    </label>
  </span>
  ```
- **Objetivo:** Generar checkbox circular UBITS manteniendo **misma semántica** y **misma clase de delegación**:
  ```html
  <span class="tarea-item__radio">
    <label class="ubits-checkbox ubits-checkbox--sm ubits-checkbox--round tarea-done-radio" data-tarea-id="..." role="button" tabindex="0">
      <input type="checkbox" class="ubits-checkbox__input" name="tarea-done-{id}" value="1" checked? data-tarea-id="{id}">
      <span class="ubits-checkbox__box"><i class="fas fa-check"></i></span>
      <span class="ubits-checkbox__label" aria-hidden="true">&nbsp;</span>
    </label>
  </span>
  ```
- **Importante:** Mantener clase **`tarea-done-radio`** en el `<label>` para que la delegación en `tareas.js`, `plan-detail.js` y `task-detail.js` siga funcionando sin tocar los `closest('.tarea-done-radio')`.
- **Atributos del input:** Conservar `name`, `value="1"`, `checked` según estado, `data-tarea-id`.

### 1.2 Páginas que usan task-strip (cargar `checkbox.css`)

- **ubits-colaborador/tareas/tareas.html**  
  Añadir en `<head>`:  
  `<link rel="stylesheet" href="../../components/checkbox.css">`
- **ubits-colaborador/tareas/planes.html** (o la vista que use la tirilla en planes)  
  Idem si usa `renderTaskStrip`.
- **Vista detalle de tarea** (si usa tirilla de subtareas, p. ej. en task-detail)  
  Asegurar que esa página también cargue `checkbox.css`.

Comprobar que en todas ellas ya se carga `fontawesome-icons.css` (necesario para el icono `fas fa-check`).

### 1.3 JS que delega en la tirilla (actualizar selector del input)

- **ubits-colaborador/tareas/tareas.js**
  - Hoy: `control.querySelector('input.ubits-radio__input')`.
  - Cambiar a: `control.querySelector('input.ubits-checkbox__input')` (o `control.querySelector('input[type="checkbox"]')` para ser robusto).
  - Apariciones: ~líneas 885, 1045, 1053 (revisar contexto exacto en el archivo).
- **ubits-colaborador/tareas/plan-detail.js**
  - Hoy: `control.querySelector('input.ubits-radio__input')`.
  - Cambiar a: `control.querySelector('input.ubits-checkbox__input')` o `input[type="checkbox"]`.
  - Aparición: ~línea 205.
- **ubits-colaborador/tareas/task-detail.js**
  - Ya usa `radioWrap.querySelector('input[type="checkbox"]')` → **no requiere cambio**.

### 1.4 `components/task-strip.css`

- Eliminar o comentar reglas que estilizan **`.tarea-checkbox input[type="checkbox"]`** (líneas ~76–115), porque el aspecto pasará a llevarlo `components/checkbox.css`.
- Mantener/ajustar estilos de **`.tarea-item__radio`** si hace falta (espacio, alineación); el contenido del bloque será ahora un `label.ubits-checkbox` en lugar de `label.ubits-radio`.

---

## 2. ubits-colaborador/tareas/seguimiento.js

Checkboxes generados por JS (innerHTML/plantillas).

### 2.1 Filtros Estado y Prioridad

- **Actual (ejemplo):**  
  `'<label class="filtros-checkbox-option"><input type="checkbox" value="Por hacer"><span class="ubits-body-sm-regular">Por hacer</span></label>'`
- **Objetivo:** Misma estructura de filtro (label + input + texto) pero con clases UBITS:
  - Label: `class="ubits-checkbox ubits-checkbox--sm filtros-checkbox-option"` (mantener `filtros-checkbox-option` para CSS/JS existente).
  - Input: `class="ubits-checkbox__input"`, mismo `value` y sin `name` (o el que use la lógica actual).
  - Box: `<span class="ubits-checkbox__box"><i class="fas fa-check"></i></span>`.
  - Texto: `<span class="ubits-checkbox__label">Por hacer</span>` (o el que corresponda).
- **No tocar** la lógica que lee `#filtros-estado input`, `#filtros-prioridad input`, `input[value="..."]`, etc.; solo cambiar el HTML generado para que sea ubits-checkbox y que el `input` siga teniendo los mismos atributos que usa el JS.

### 2.2 Tabla: “Seleccionar todo” y checkbox por fila

- **Actual:**  
  `<th ...><input type="checkbox" id="seguimiento-select-all" ...></th>`  
  `<td ...><input type="checkbox" class="seguimiento-row-check" data-id="..." ...></td>`
- **Objetivo:** Envolver cada input en un label con checkbox UBITS (ej. `ubits-checkbox--sm`), manteniendo:
  - `id="seguimiento-select-all"` y `aria-label="Seleccionar todo"` en el input (o en el label).
  - `class="seguimiento-row-check"` y `data-id` en el input.
- Así el JS que usa `#seguimiento-select-all`, `.seguimiento-row-check`, `data-id` sigue funcionando. Revisar si hay listeners que asumen el input como hijo directo de `th`/`td`; si es así, usar `cell.querySelector('.seguimiento-row-check')` o equivalente.

### 2.3 Menú de columnas (columns-menu)

- **Actual:**  
  `` `<label class="columns-menu-option"><input type="checkbox" data-col="${col}"${checked}><span ...>${labels[col]}</span></label>` ``
- **Objetivo:** Mismo patrón: label con `ubits-checkbox ubits-checkbox--sm` + `columns-menu-option`, input con `ubits-checkbox__input` y mismo `data-col`, box con icono check, label de texto con `ubits-checkbox__label`. No cambiar la lógica que usa `input[data-col]`, `#columns-menu-list`, etc.

### 2.4 Página que carga seguimiento (HTML)

- **ubits-colaborador/tareas/seguimiento.html** (o la que corresponda):  
  Añadir en `<head>`:  
  `<link rel="stylesheet" href="../../components/checkbox.css">`  
  y asegurar `fontawesome-icons.css`.

### 2.5 CSS en tareas/seguimiento

- **seguimiento.css / tareas.css:**  
  Reglas como `.filtros-checkbox-option input`, `.columns-menu-option input` pueden quedar para compatibilidad o eliminarse si todo el estilo lo da `checkbox.css`. Revisar que no se pierdan alineación o espaciado del layout de filtros/columnas.

---

## 3. components/dropdown-menu.js y dropdown-menu.css

- **Uso actual:** Opción con checkbox a la izquierda:  
  `'<span class="ubits-dropdown-menu__option-left"><input type="checkbox" id="..." data-value="..." ...></span>'`
- **Complejidad:** El dropdown es un componente compartido; el checkbox va dentro de un overlay. Cambiar a ubits-checkbox implica inyectar un `<label>` con `ubits-checkbox__box` e icono, y que el `input` tenga `ubits-checkbox__input`.
- **Recomendación:** Incluirlo en el plan pero como **fase 2** o **opcional**: mantener por ahora el input nativo estilizado en dropdown (como en dropdown-menu.css) para no tocar overlay/posicionamiento, y en un segundo paso sustituir por ubits-checkbox si se quiere consistencia total. Si se hace el cambio, actualizar selectores en seguimiento.js que usan `.ubits-dropdown-menu__option-left input[type="checkbox"]` para que sigan encontrando el input (p. ej. `.ubits-dropdown-menu__option-left .ubits-checkbox__input`).

---

## 4. documentacion/componentes (preview / controles)

Checkboxes en estas páginas son **controles de documentación** (mostrar/ocultar, toggles de preview), no contenido de producto.

| Archivo | Uso | Decisión |
|---------|-----|----------|
| **checkbox.html** | Ya usa ubits-checkbox. | No tocar. |
| **table.html** | Controles “mostrar columna” + celdas de tabla (select-all, row-check). | Reemplazar por ubits-checkbox manteniendo id/class para el script de preview. |
| **empty-state.html** | Toggles de preview (header, title, icon, body, footer, botones). | Opcional: sustituir por ubits-checkbox para coherencia visual. |
| **tooltip.html** | Opciones “Normal”, “Sin flecha”. | Opcional. |
| **input.html** | Toggles (label, mandatory, helper, counter, iconos). | Opcional. |
| **tab.html** | Icon toggle, white-bg toggle. | Opcional. |
| **dropdown-menu.html** | preview-autocomplete, preview-footer. | Opcional. |
| **header-product.html** | Switches (label + input + slider). | **No reemplazar** por checkbox UBITS; son switches con slider, no checkboxes. |
| **button.html** | icon-toggle, icon-only-toggle, badge-toggle. | Opcional. |
| **ia-button.html** | icon-only-toggle. | Opcional. |

Para **table.html** conviene hacer el reemplazo en la misma fase que seguimiento (tablas con checkboxes). El resto puede dejarse como **fase 2** o “opcional” para no bloquear la implementación en producto.

---

## 5. ubits-admin

- **Búsqueda:** No se encontraron checkboxes en `ubits-admin`. Nada que hacer.

---

## 6. Orden sugerido de implementación

1. **Tirilla de tareas (radio → checkbox circular)**  
   - task-strip.js (markup).  
   - tareas.js, plan-detail.js (selector `ubits-checkbox__input`).  
   - task-strip.css (quitar estilos .tarea-checkbox).  
   - Cargar checkbox.css (y fontawesome) en tareas.html y vistas que usen la tirilla.
2. **Seguimiento (filtros + tabla + menú columnas)**  
   - seguimiento.js (generar HTML con ubits-checkbox).  
   - Cargar checkbox.css en la página de seguimiento.  
   - Ajustar seguimiento.css/tareas.css si hace falta.
3. **Documentación: table.html**  
   - Reemplazar checkboxes de preview y de celdas por ubits-checkbox; mantener id/class para el JS.
4. **Opcional / fase 2**  
   - dropdown-menu (checkbox en opción izquierda).  
   - Resto de doc (empty-state, tooltip, input, tab, dropdown-menu, button, ia-button).

---

## 7. Checklist antes de dar por cerrada cada zona

- [ ] No se rompe “marcar como finalizada” ni el movimiento al final en tareas/planes.
- [ ] Filtros estado/prioridad en seguimiento siguen filtrando igual.
- [ ] “Seleccionar todo” y selección por fila en la tabla siguen funcionando.
- [ ] Menú de columnas sigue mostrando/ocultando columnas.
- [ ] En cualquier página que use ubits-checkbox está cargado `checkbox.css` y `fontawesome-icons.css`.
- [ ] En la tirilla se mantiene la clase `tarea-done-radio` en el label para no romper delegación.

---

*Archivo temporal: se puede borrar o mover a `docs/` cuando la implementación esté terminada.*
