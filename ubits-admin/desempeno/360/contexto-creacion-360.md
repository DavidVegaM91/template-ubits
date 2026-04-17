# Contexto: creación de una evaluación 360

Documento de referencia para implementar o extender el flujo de **creación de una evaluación 360** dentro del módulo Desempeño (área Administrador). Aquí se documenta el estado actual del prototipo, la lógica de negocio de cada sección y los detalles técnicos de implementación.

**Objetivo de este archivo:** que, al leerlo, no queden dudas sobre el proceso de negocio ni sobre la pantalla al construir cada vista. Se irá ampliando con mensajes posteriores.

---

## Referencias de implementación

| Qué | Ruta |
|-----|------|
| HTML principal | `ubits-admin/desempeno/360/crear-360.html` |
| CSS de página | `ubits-admin/desempeno/360/crear-360.css` |
| Datos: tipos de evaluación y competencias | `bd-master/bd-evaluaciones-360.js` |
| Datos: colaboradores (para tablas y validación CSV) | `bd-master/bd-master-colaboradores.js` |
| Listado de evaluaciones (destino al activar / salir) | `ubits-admin/desempeno/360/admin-360.html` |

---

## Visión general del flujo

El flujo de creación vive en una **página inmersiva dedicada** (`crear-360.html`) y funciona como un **hub con secciones independientes**: el usuario primero guarda los datos básicos y luego configura cada sección en sub-vistas independientes. Sólo cuando las **cuatro secciones** están completadas puede activar la evaluación.

### Layout

Usa la cáscara inmersiva transversal **`general-styles/layout-immersive.css`**:

- Clase raíz: **`.ubits-layout-immersive`**
- `body` lleva: `no-subnav page-layout-immersive page-crear-360`
- El scroll vive en `#crear360-main` (`.ubits-layout-immersive__main`)
- El header y el footer son fijos (`__header` y `__footer`)

### Vistas (sub-páginas en memoria)

El flujo tiene **5 vistas** que se alternan dentro del mismo DOM. El cambio de vista está manejado por `showView(viewId)` que:

1. Alterna la clase `crear360-view--hidden` en los `data-view="*"` del HTML
2. Actualiza el hash de la URL (`history.pushState`)
3. Renderiza el header dinámico
4. Intercambia el footer (hub vs sub-vista)
5. Inicializa el contenido de la vista

| Vista | `viewId` | Hash URL |
|-------|----------|----------|
| Hub (pantalla principal) | `hub` | `#hub` |
| Tipo de evaluación | `tipo` | `#tipo` |
| Competencias y enunciados | `competencias` | `#competencias` |
| Evaluados | `evaluados` | `#evaluados` |
| Configuración de resultados | `resultados` | `#resultados` |

### Navegación con historial del navegador

- Las flechas «atrás» y «adelante» del navegador funcionan porque cada vista empuja al historial.
- El botón **←** del header de sub-vistas llama `history.back()`.
- El evento `popstate` intercepta cambios de hash y llama `showView` con `pushHistory: false` para no apilar duplicados.

### Estado en memoria (`draft`)

Todo el estado del formulario vive en un objeto `draft` (no hay localStorage):

```js
draft = {
    nombre: '',
    fechaInicio: '',
    fechaFin: '',
    guardado: false,                  // true tras "Confirmar" en el hub
    checks: {                         // true cuando se guarda cada sección
        tipo: false,
        competencias: false,
        evaluados: false,
        resultados: false
    },
    tipo: [],                         // array de {id, activo, peso}
    competencias: [],                 // array de {id, seleccionada}
    evaluados: {},                    // objeto con tipo y personas/grupos
    resultados: null                  // objeto con escala, params, toggles
}
```

**Importante:** el estado se pierde al recargar la página (intencional en el prototipo).

---

## Vista: Hub

### Propósito

Capturar los datos básicos de la evaluación y servir de punto de acceso a las cuatro secciones de configuración.

### Formulario básico

Tres campos obligatorios creados con `createInput()`:

| Campo | Tipo | Validación para guardar |
|-------|------|------------------------|
| Nombre de la evaluación | `text` | Mínimo 3 caracteres |
| Fecha de inicio | `calendar` | Requerida |
| Fecha de fin | `calendar` | Requerida |

Al hacer clic en **«Confirmar»** (`#crear360-btn-save-inline`) se ejecuta `guardarEvaluacion()`:
- Si hay errores, se marcan los inputs con `setState('invalid')` y un mensaje de error (`crear360-input-error`) debajo.
- Si es válido, `draft.guardado = true`, se oculta el botón «Confirmar» y se desbloquean las cuatro tarjetas de configuración.

### Estado: bloqueado vs desbloqueado

- **Bloqueado** (`crear360-option-card--locked`): las tarjetas tienen `tabindex="-1"` y no son clicables. Aplica mientras `draft.guardado === false`.
- **Desbloqueado**: se quita `--locked` y el usuario puede entrar a cada sección.
- **Completado** (`crear360-option-card--done`): se añade al guardar cada sección; muestra el ícono `fa-circle-check` en la tarjeta.

### Edición después de confirmar

Al editar los inputs cuando el formulario ya está guardado (`draft.guardado === true`), `_formModified` se pone en `true` y aparece el botón **«Guardar cambios»** en el footer (oculto antes). Ese botón llama al mismo `guardarEvaluacion()`.

### Footer hub

| Botón | Cuándo visible | Acción |
|-------|---------------|--------|
| «Guardar cambios» | Solo si `draft.guardado && _formModified` | Guarda los cambios del formulario |
| «Activar evaluación» | Siempre | Deshabilitado hasta que los 4 `checks` sean `true` |

### Activar evaluación

Al hacer clic en **«Activar evaluación»** se abre un modal de confirmación (`openModal`). Al confirmar:
1. Se llama `BD_EVALUACIONES_360.addEvaluacion(...)` con los datos del `draft`.
2. Se cierra el modal.
3. Se redirige a `admin-360.html?toast=created`.

### Salir sin guardar

El botón ✕ del header llama `confirmarSalir()`:
- Si `draft.guardado === false`: abre modal de confirmación («Salir sin guardar»), con botones «Quedarse» y «Salir» (redirige a `admin-360.html`).
- Si `draft.guardado === true`: redirige directamente sin modal.

---

## Vista: Tipo de evaluación (`tipo`)

### Propósito

Activar qué tipos de evaluador participarán y asignarles un peso porcentual. La suma de los pesos activos debe ser exactamente **100** para poder guardar.

### Fuente de datos

Los tipos provienen de `BD_EVALUACIONES_360.tiposEvaluacion` (`bd-master/bd-evaluaciones-360.js`):

```js
[{ id, nombre, descripcion, pesoSugerido }, ...]
```

Al entrar a la vista por primera vez se inicializa `_tipos[]` combinando los datos base con los valores guardados en `draft.tipo` (si existen).

### Tarjetas de tipo

Cada tarjeta (`tipo360-card`) muestra dos filas:

- **Fila 1:** nombre del tipo (izquierda) + switch de activación (derecha, `ubits-switch--md`).
- **Fila 2:** descripción (izquierda) + input de peso `%` (derecha, `createInput` tipo `number`, tamaño `sm`, `rightIcon: 'fa-percent'`).

El input de peso está **deshabilitado** cuando el tipo está inactivo.

### Regla de suma y estado del botón «Guardar»

- El total se actualiza en tiempo real con cada `input` nativo en el campo de peso.
- El número del total (`#tipo360-total`) cambia de color:
  - Verde (`--ubits-feedback-accent-success`) cuando el total es exactamente 100.
  - Rojo (`--ubits-feedback-accent-error`) cuando está entre 1 y 99 o supera 100.
  - Color neutro (`--ubits-fg-1-high`) cuando es 0.
- **«Guardar» habilitado** solo si: hay al menos un tipo activo Y la suma es exactamente 100.

### Guardar

`saveTipo()` escribe en `draft.tipo` y pone `draft.checks.tipo = true`.

---

## Vista: Competencias y enunciados (`competencias`)

### Propósito

Seleccionar las competencias que serán evaluadas. Cada competencia incluye 3 enunciados (preguntas) que los evaluadores responderán.

### Fuente de datos

`BD_EVALUACIONES_360.competenciasBase` → `{ id, nombre, enunciados: string[] }`.

Al entrar, se inicializa `_competencias[]` combinando con `draft.competencias`.

### Lista de competencias

Cada ítem (`comp360-item`) muestra:

- Checkbox de selección.
- Nombre en `ubits-body-md-bold`.
- Conteo de enunciados (ej: «3 enunciados»).
- Botón expandir/colapsar (`fa-chevron-down` / `fa-chevron-up`).
- Lista de enunciados (oculta por defecto), numerada.

El ítem seleccionado añade la clase `comp360-item--selected`.

### Contador en el header

`#comp360-selected-count` muestra «N seleccionada(s)» y se actualiza en cada cambio.

### Botón «Guardar»

Deshabilitado si no hay ninguna competencia seleccionada.

`saveCompetencias()` escribe en `draft.competencias` y pone `draft.checks.competencias = true`.

---

## Vista: Evaluados (`evaluados`)

### Propósito

Definir qué colaboradores serán evaluados en esta evaluación 360. El flujo usa un **wizard de 2 pasos** con stepper horizontal compacto (`ubits-stepper--horizontal-compact`).

### Paso 1 — Tipo de selección

Cuatro cards con radio buttons (`drawer-option-card`), estructuradas igual que en el drawer de `crear-plan-contenidos.html`:

| Opción | Valor | Descripción |
|--------|-------|-------------|
| Toda la empresa | `toda-empresa` | Selecciona automáticamente todos los colaboradores |
| Por colaborador | `por-colaborador` | Tabla `ubits-data-table` de colaboradores (paso 2) |
| Por grupos | `por-grupos` | Tabla `ubits-data-table` de grupos (paso 2) |
| Desde archivo | `desde-archivo` | Sube un CSV; panel de file-upload en el mismo paso 1 |

Cada card muestra un contador de seleccionados que se actualiza con `eval360UpdateCardCounts()`.

**Comportamiento del footer según opción:**

| Opción seleccionada | Botón primario | Botón secundario |
|--------------------|----------------|-----------------|
| `toda-empresa` | «Guardar» | «Cancelar» |
| `por-colaborador` o `por-grupos` | «Siguiente» | «Cancelar» |
| `desde-archivo` | «Importar» (deshabilitado hasta archivo válido) | «Cancelar» |

El clic sobre el paso 1 del stepper (cuando se está en el paso 2) vuelve al paso 1.

### Paso 2 — Selección (solo `por-colaborador` y `por-grupos`)

El panel visible depende de la opción elegida en el paso 1:

**Panel colaboradores** (`#eval360-panel-colaborador`):
- Tabla `createUbitsDataTable`, id `eval360-colab-table`.
- Título: «Lista de colaboradores».
- Columnas: Nombre (avatar + correo), Área, Líder.
- Datos: `BD_MASTER_COLABORADORES.colaboradores` → campos `nombre`, `username` (como correo), `area`, `jefe` (como líder), `avatar`.

**Panel grupos** (`#eval360-panel-grupos`):
- Tabla `createUbitsDataTable`, id `eval360-grupos-table`.
- Título: «Lista de grupos».
- Columnas: Nombre, Descripción, Integrantes.
- Datos: `_eval360GruposMock` (10 grupos de ejemplo definidos en el JS de la página).

Ambas tablas tienen: checkboxes, búsqueda, «Ver seleccionados», contador de resultados.

**Botón «Guardar» en paso 2:** deshabilitado si no hay filas seleccionadas. El botón cancelar en paso 2 dice «Anterior» y vuelve al paso 1.

### Opción: Desde archivo (panel inline en paso 1)

El panel `#eval360-panel-archivo` se muestra/oculta según la opción radio activa, dentro del paso 1 (no avanza al paso 2).

Componente: `createFileUpload` (`components/file-upload.css` + `file-upload.js`).

Configuración:

```js
createFileUpload({
    containerId:     'eval360-archivo-fu-container',
    id:              'eval360-archivo-fu',
    title:           'Importar evaluados',
    accept:          '.csv,text/csv',
    maxSizeMb:       1,
    formats:         'CSV • Hasta 1 MB • Máx. 3.000 filas',
    downloadButtons: [{ label: 'Descargar plantilla', icon: 'file-arrow-down', onClick: eval360DescargarPlantilla }],
    onChange:        /* → eval360ValidarCSV(file) */,
    onError:         /* limpia estado y deshabilita botón */
})
```

#### Plantilla descargable

`eval360DescargarPlantilla()` genera y descarga un CSV con BOM UTF-8 (compatible Excel):

| Evaluador username | Evaluado username | Tipo de evaluacion |
|--------------------|-------------------|--------------------|
| (usuario 0) | (usuario 1) | descendente |
| (usuario 1) | (usuario 0) | ascendente |
| (usuario 2) | (usuario 3) | paralela |
| (usuario 4) | (usuario 4) | autoevaluación |
| (usuario 2) | (usuario 0) | cliente |

Los usernames se toman de `BD_MASTER_COLABORADORES.colaboradores[i].username`.

#### Validaciones del archivo

**Generales** (previas a validar filas):
1. El componente valida tipo (`.csv`, `text/csv`) y tamaño (≤ 1 MB) de forma nativa.
2. El archivo no puede estar vacío ni tener solo la fila de títulos → error inline.
3. No puede superar 3.000 filas de datos → error inline.

**Por fila** (ejecutadas en `eval360ValidarCSV`):

| Regla | Mensaje |
|-------|---------|
| Campos faltantes | Lista qué columna/s están vacías en esa fila |
| Tipo de evaluación inválido | Solo se aceptan: `descendente`, `ascendente`, `paralela`, `autoevaluación`, `cliente` (comparación normalizada sin acentos) |
| Misma persona, tipo ≠ autoevaluación | «Evaluador y evaluado son la misma persona, pero el tipo no es autoevaluación.» |
| `autoevaluación` con personas distintas | «El tipo es autoevaluación, pero evaluador y evaluado son personas distintas.» |
| Evaluador no en BD (excepto tipo `cliente`) | «El evaluador "X" no está registrado en la empresa.» |
| Evaluado no en BD | «El evaluado "X" no está registrado en la empresa.» |

Si hay errores se activa el botón «Informe de errores» (`.ubits-file-upload__error-report-btn`) y se muestra un modal con tabla Fila / Problema (máx. 50 visibles). El botón «Importar» permanece deshabilitado.

Si no hay errores, `_eval360ArchivoListo = true` y el botón «Importar» se habilita.

#### Variables de estado del wizard evaluados

```js
_eval360Step           = 1;             // paso actual (1 o 2)
_eval360ColabTablaRef  = null;          // ref al ubits-data-table de colaboradores
_eval360GruposTablaRef = null;          // ref al ubits-data-table de grupos
_eval360ArchivoListo   = false;         // true si el CSV pasó todas las validaciones
_eval360ArchivoErrores = [];            // [{fila, mensaje}] del último CSV cargado
_eval360GruposMock     = [...];         // 10 grupos de ejemplo (datos del playground)
```

### Guardar evaluados

`saveEvaluados()` construye `draft.evaluados` según la opción:

| Opción | Qué guarda |
|--------|-----------|
| `toda-empresa` | `{ tipo, personas: [todos los ids] }` |
| `por-colaborador` | `{ tipo, personas: [ids seleccionados en la tabla] }` |
| `por-grupos` | `{ tipo, grupos: [{id, nombre}] }` |
| `desde-archivo` | `{ tipo, archivoImportado: true }` |

Luego `draft.checks.evaluados = true`, muestra toast de éxito y vuelve al hub.

---

## Vista: Configuración de resultados (`resultados`)

### Propósito

Definir la escala de calificación, la cantidad de parámetros de resultado y sus rangos; además configurar tres opciones de comportamiento.

### Campos

**Selects** (creados con `createInput` tipo `select`):

| Select | Opciones | Variable |
|--------|----------|----------|
| Escala | «De 1 a 5» / «De 1 a 4» / «De 1 a 10» | `_resEscala` |
| Cantidad de parámetros | «3 Parámetros» / «4 Parámetros» / «5 Parámetros» | `_resCantidad` |

Al cambiar cualquiera de estos selects, los rangos se recalculan con `buildDefaultParams(cantidad, escalaMax)` que distribuye los rangos uniformemente y usa nombres predefinidos (`RES_PARAM_DEFAULTS`).

**Tabla de parámetros** (`#res360-params-list`):

Cada parámetro tiene 3 campos inline (`createInput` tamaño `sm`): Nombre, Desde, Hasta. El usuario puede ajustar libremente cada rango.

**Switches (opciones de comportamiento)**:

| Switch | ID | Descripción |
|--------|----|-------------|
| Permitir que los líderes vean los resultados antes de publicar | `res360-toggle-lideres` | |
| Habilitar «No sé» como opción de respuesta | `res360-toggle-nosabe` | Permite que el evaluador indique desconocimiento |
| Asegurar anonimato | `res360-toggle-anonimato` | No aplica a descendente ni autoevaluación |

### Botón «Guardar»

Siempre habilitado en esta vista (ningún campo es obligatorio para guardar).

`saveResultados()` escribe en `draft.resultados = { escala, cantidad, params, permitirLideres, permitirNoSabe, asegurarAnonimato }` y pone `draft.checks.resultados = true`.

---

## Footer dinámico

### Hub (`#crear360-footer-hub`)

Visible solo en la vista `hub`.

| Botón | ID | Estado inicial |
|-------|----|---------------|
| «Guardar cambios» | `crear360-btn-save-changes` | Oculto; aparece tras editar campos confirmados |
| «Activar evaluación» | `crear360-btn-activate` | Deshabilitado hasta que los 4 checks sean `true` |

### Sub-vistas (`#crear360-footer-sub`)

Visible en las 4 sub-vistas. El texto de los botones cambia según la vista y el estado:

| Vista / estado | Botón primario | Botón secundario |
|----------------|----------------|-----------------|
| `tipo` | «Guardar» | «Cancelar» |
| `competencias` | «Guardar» | «Cancelar» |
| `evaluados` paso 1, opción `toda-empresa` | «Guardar» | «Cancelar» |
| `evaluados` paso 1, opción `por-colaborador` / `por-grupos` | «Siguiente» | «Cancelar» |
| `evaluados` paso 1, opción `desde-archivo` | «Importar» (dis. hasta CSV válido) | «Cancelar» |
| `evaluados` paso 2 | «Guardar» (dis. sin selección) | «Anterior» |
| `resultados` | «Guardar» | «Cancelar» |

El botón «Cancelar» en sub-vistas llama `history.back()` (equivalente al botón ← del header). **Excepción:** en `evaluados` paso 2, hace `eval360GoToStep(1)` en lugar de volver al hub.

El botón primario llama `saveCurrentSubView()`, que despacha a la función `save*` de la vista activa.

---

## Fuentes de datos maestros (`bd-master/`)

| Archivo | Qué expone | Usado en |
|---------|-----------|----------|
| `bd-evaluaciones-360.js` | `BD_EVALUACIONES_360.tiposEvaluacion` (tipos y pesos sugeridos) | Vista Tipo |
| `bd-evaluaciones-360.js` | `BD_EVALUACIONES_360.competenciasBase` (competencias y enunciados) | Vista Competencias |
| `bd-evaluaciones-360.js` | `BD_EVALUACIONES_360.addEvaluacion(datos)` | Al activar |
| `bd-master-colaboradores.js` | `BD_MASTER_COLABORADORES.colaboradores[]` | Tabla evaluados; validación CSV |

Los tipos de evaluación en el CSV (para validación y para la plantilla descargable) son: **descendente**, **ascendente**, **paralela**, **autoevaluación**, **cliente**. La validación normaliza tildes y capitalización.

---

## Componentes UBITS usados

| Componente | Importación | Uso en el flujo |
|-----------|-------------|----------------|
| `input.css` + `input.js` | `components/input.*` | Todos los campos del formulario y tablas |
| `calendar.css` + `calendar.js` | `components/calendar.*` | Fechas de inicio y fin |
| `modal.css` + `modal.js` | `components/modal.*` | Confirmación de activación, confirmación de salida, informe de errores CSV |
| `toast.css` + `toast.js` | `components/toast.*` | Confirmación al guardar cada sección |
| `switch.css` | `components/switch.css` | Toggles en tipos y en configuración de resultados |
| `stepper.css` + `stepper.js` | `components/stepper.*` | Wizard de evaluados (horizontal compacto) |
| `radio-button.css` | `components/radio-button.css` | Option cards del wizard evaluados |
| `ubits-data-table.css` + `.js` | `components/ubits-data-table.*` | Tablas de colaboradores y grupos |
| `avatar.css` | `components/avatar.css` | Avatares en la tabla de colaboradores |
| `file-upload.css` + `.js` | `components/file-upload.*` | Opción «Desde archivo» en evaluados |
| `checkbox.css` | `components/checkbox.css` | Checkboxes en las tablas |
| `status-tag.css` | `components/status-tag.css` | Tag «Borrador» en el header del hub |
| `tooltip.css` + `.js` | `components/tooltip.*` | Tooltips en botones del header y switches |
| `empty-state.css` + `.js` | `components/empty-state.*` | Tablas sin resultados |
| `dropdown-menu.js` | `components/dropdown-menu.js` | Requerido por `input.js` para selects |
| `layout-immersive.css` | `general-styles/layout-immersive.css` | Shell de la página |

---

## Estructura de archivos del flujo 360

```
ubits-admin/desempeno/360/
├── crear-360.html          ← Flujo completo de creación (esta página)
├── crear-360.css           ← Estilos específicos del flujo
├── admin-360.html          ← Lista de evaluaciones (destino al activar / salir)
├── contexto-creacion-360.md ← Este documento
└── (otros archivos del módulo 360)

bd-master/
├── bd-evaluaciones-360.js  ← Tipos, competencias, helpers
└── bd-master-colaboradores.js ← Colaboradores de la empresa (Fiqsha demo)
```

---

## Notas para implementación

- **Reset de calendario al cambiar vista:** `cleanupCalendarPickers()` elimina los pickers flotantes de `calendar.js` antes de cambiar de vista para evitar que queden huérfanos en el DOM.
- **Restaurar estado al volver:** cada `render*View()` recupera los valores guardados de `draft.*` para no mostrar la vista vacía cuando el usuario vuelve a editar una sección ya guardada.
- **Stepper del wizard evaluados:** se inicializa con HTML estático en el HTML; `setStepperStepStates(ol, stepIndex)` (de `stepper.js`) controla el estado visual de los pasos. El paso 1 del stepper es clickeable para volver desde el paso 2.
- **File upload re-entrada:** el file upload de «Desde archivo» se crea solo si el contenedor está vacío (primer acceso); en accesos posteriores solo se re-enlaza el botón de informe de errores para no duplicar el componente.
- **Modales overlays:** los overlays de los modales de confirmación tienen contenedores fijos en el HTML (`#crear360-cancel-modal-overlay`, `#crear360-activate-modal-overlay`). El modal del informe de errores CSV usa `overlayId: 'modal-eval360-errores-csv'` (generado dinámicamente por `openModal`).
- **Sin servidor:** el template es puramente HTML/CSS/JS. Abrir con doble clic o `file:///…/crear-360.html`.

---

## Secciones pendientes de documentar

- Flujo de **edición** de una evaluación 360 existente (si aplica una página `editar-360.html`).
- Vista de **detalle y seguimiento** del proceso de evaluación una vez activado.
- Lógica de **notificaciones a evaluadores** (actualmente simulada con toast al activar).
- Gestión de la evaluación desde la perspectiva del **evaluador** (módulo Colaborador).

---

*Última actualización: mayo 2026. Flujo implementado: hub, tipo, competencias, evaluados (wizard 2 pasos + CSV), resultados. Activación con llamada a `BD_EVALUACIONES_360.addEvaluacion`.*
