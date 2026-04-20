# Contexto: creación de una evaluación 360

Documento de referencia para implementar o extender el flujo de **creación de una evaluación 360** dentro del módulo Desempeño (área Administrador). Describe el estado actual del prototipo, la lógica de negocio de cada sección y los detalles técnicos de implementación.

**Objetivo:** que al leerlo no queden dudas sobre el proceso de negocio ni sobre la pantalla, al construir o modificar cada vista.

---

## Referencias de implementación

| Qué | Ruta |
|-----|------|
| HTML principal | `ubits-admin/desempeno/360/crear-360.html` |
| CSS de página | `ubits-admin/desempeno/360/crear-360.css` |
| Tipos de evaluación, competencias base, helper `addEvaluacion` | `bd-master/bd-evaluaciones-360.js` |
| Colaboradores (tablas y validación de archivos) | `bd-master/bd-master-colaboradores.js` |
| Listado de evaluaciones (destino al activar / salir) | `ubits-admin/desempeno/360/admin-360.html` |
| Archivos demo (CSV de ejemplo) | `ubits-admin/desempeno/360/archivos-demo/` |

---

## Visión general del flujo

El flujo vive en una **página inmersiva dedicada** (`crear-360.html`). Funciona como un **hub con cuatro secciones independientes**: el usuario guarda primero los datos básicos y luego configura cada sección en sub-vistas. La evaluación solo se puede activar cuando las **cuatro secciones** están completadas.

### Layout

Usa la cáscara inmersiva transversal **`general-styles/layout-immersive.css`**:

- Clase raíz: `.ubits-layout-immersive`
- `<body>` lleva: `data-theme="light" class="no-subnav page-layout-immersive page-crear-360"`
- El scroll vive en `#crear360-main` (`.ubits-layout-immersive__main`)
- Header y footer son fijos (`__header` y `__footer`)

### Vistas (sub-páginas en memoria)

El flujo tiene **5 vistas** que se alternan dentro del mismo DOM. El cambio de vista está gestionado por `showView(viewId)` que:

1. Alterna la clase `crear360-view--hidden` en los `data-view="*"` del HTML
2. Actualiza el hash de la URL (`history.pushState`)
3. Renderiza el header dinámico
4. Intercambia el footer (hub vs sub-vista)
5. Inicializa el contenido de la vista
6. Hace scroll al tope de `#crear360-main`

| Vista | `viewId` | Hash URL |
|-------|----------|----------|
| Hub (pantalla principal) | `hub` | `#hub` |
| Tipo de evaluación | `tipo` | `#tipo` |
| Competencias y enunciados | `competencias` | `#competencias` |
| Evaluados | `evaluados` | `#evaluados` |
| Configuración de resultados | `resultados` | `#resultados` |

### Navegación con historial del navegador

- Las flechas «atrás» / «adelante» del navegador funcionan porque cada vista empuja al historial.
- El botón **←** del header de sub-vistas llama `history.back()`.
- El evento `popstate` intercepta cambios de hash y llama `showView` con `pushHistory: false` para no apilar duplicados.
- `cleanupCalendarPickers()` se llama antes de salir de `hub` para destruir los pickers flotantes de `calendar.js`.

### Estado en memoria (`draft`)

Todo el estado del formulario vive en un objeto `draft` (sin localStorage, se pierde al recargar — intencional en el prototipo):

```js
draft = {
    nombre:     '',
    fechaInicio: '',
    fechaFin:   '',
    guardado:   false,          // true tras "Confirmar" en el hub
    checks: {                   // true cuando se guarda cada sección
        tipo:         false,
        competencias: false,
        evaluados:    false,
        resultados:   false
    },
    tipo:         [],           // [{id, activo, peso}]
    competencias: [],           // [{id, nombre, descripcion, seleccionada, enunciados[]}]
    evaluados:    {},           // ver sección Evaluados
    resultados:   null          // {escala, cantidad, params, permitirLideres, permitirNoSabe, asegurarAnonimato}
}
```

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
- Si hay errores: inputs marcados con `setState('invalid')` y mensaje de error debajo (`#crear360-input-error`).
- Si es válido: `draft.guardado = true`, se oculta el botón «Confirmar», se desbloquean las cuatro tarjetas.

### Estado: bloqueado vs desbloqueado

- **Bloqueado** (`crear360-option-card--locked`): tarjetas con `tabindex="-1"`, no clicables. Aplica mientras `draft.guardado === false`.
- **Desbloqueado**: se quita `--locked` y el usuario puede entrar a cada sección.
- **Completado** (`crear360-option-card--done`): borde verde e ícono `fa-circle-check` cuando la sección cumple los requisitos (en **Competencias**, solo si además cada tipo activo en `#tipo` tiene al menos un enunciado en competencias seleccionadas).
- **Competencias incompleta** (`crear360-option-card--incomplete`): hay al menos una competencia seleccionada en `draft.competencias` pero falta enunciado en algún tipo activo → borde rojo, **sin** check. `draft.checks.competencias` permanece `false` hasta completar.

### Tarjetas completadas: resumen en lugar de la descripción

Cuando una tarjeta del hub está en estado **completado** (`--done`), el texto que antes actuaba como **descripción introductoria** de la sección debe sustituirse por un **resumen** de lo que el usuario configuró dentro de esa sección (datos legibles de un vistazo).

| Tarjeta | Contenido del resumen (ejemplo) |
|---------|----------------------------------|
| **Tipo de evaluación** | Lista de tipos **activos** con su **peso %** tal como quedaron en `#tipo`, en un solo renglón separado por comas. Ejemplo: `Autoevaluación (5%), Descendente (95%)`. |
| **Competencias y enunciados** | Prefijo **«Enunciados:»** seguido del desglose **por cada tipo de evaluación** (los mismos tipos que participan en la evaluación): cuántos enunciados tiene asignados cada uno. Ejemplo: `Enunciados: Autoevaluación (0), Descendente (10)`. Si un tipo tiene **0 enunciados**, debe mostrarse un **icono de advertencia** (p. ej. `fa-triangle-exclamation`) junto a ese tipo y tanto el **texto del tipo con (0)** como el **icono** deben ir en **color rojo** (feedback de error) para resaltar que falta contenido en esa perspectiva. |
| **Evaluados** | Conteo de asignaciones **por tipo de evaluación** (según la configuración vigente). Ejemplo: `Autoevaluación (15), Descendente (8)`. (Los números reflejan cuántas relaciones evaluador/evaluado o filas aplicables existen por tipo, según defina la implementación.) |
| **Configuración de resultados** | **Escala** elegida y **cantidad de parámetros**, más los **nombres** de los rangos entre paréntesis. Ejemplo: `Escala del 1 al 100, 5 parámetros (malo, aceptable, bueno, sobresaliente, excelente)`. |

**Notas de UX**

- El resumen sustituye a la descripción **solo** cuando la tarjeta está completada; en estados bloqueado o desbloqueado sin completar se mantiene el copy introductorio habitual.
- En **Competencias y enunciados**, el aviso en rojo con icono aplica **únicamente** a los tipos con conteo 0; el resto de tipos se muestran con estilo neutro o de éxito según el sistema de diseño.

**Implementación en código:** `updateHubChecksUI()` recalcula `draft.checks.competencias = hubCompetenciasCompleto()` en cada visita al hub. `refreshHubCardDescriptions()` (llamada al final de `updateHubChecksUI()`) actualiza los `<p class="crear360-hub-card-desc">`: en competencias muestra el resumen «Enunciados:…» tanto si está completo como si está incompleto (con avisos en rojo). En modo **Evaluados** por tabla (`por-colaborador`), el conteo por tipo usa el mismo número de evaluados seleccionados para cada tipo activo; en modo **libre** con `asignaciones[]`, los conteos se obtienen por tipo a partir de las filas importadas.

### Edición después de confirmar

Al editar los inputs cuando el formulario ya está guardado (`draft.guardado === true`), `_formModified` se pone en `true` y aparece el botón **«Guardar cambios»** en el footer. Ese botón llama al mismo `guardarEvaluacion()`.

### Footer hub

| Botón | Cuándo visible | Acción |
|-------|---------------|--------|
| «Guardar cambios» | Solo si `draft.guardado && _formModified` | Guarda los cambios del formulario |
| «Activar evaluación» | Siempre | Deshabilitado hasta que los 4 `checks` sean `true` |

### Activar evaluación

Al hacer clic en **«Activar evaluación»** se abre un modal de confirmación. Al confirmar:
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

Los tipos provienen de `BD_EVALUACIONES_360.tiposEvaluacion`:

```js
[{ id, nombre, descripcion, pesoSugerido }, ...]
```

IDs internos en la BD: `auto`, `jefe`, `pares`, `subalternos`, `cliente`.  
Nombres visibles: `Autoevaluación`, `Descendente`, `Paralela`, `Ascendente`, `Cliente interno`.

> **Importante:** para toda comparación con valores de archivos CSV/Excel se usa `t.nombre` (normalizado), nunca `t.id` (los ids internos no coinciden con los valores que escribe el usuario).

Al entrar a la vista por primera vez se inicializa `_tipos[]` combinando los datos base con los valores guardados en `draft.tipo` (si existen).

### Tarjetas de tipo

Cada tarjeta (`tipo360-card`) muestra dos filas:

- **Fila 1:** nombre del tipo (izquierda) + switch de activación (derecha, `ubits-switch--md`).
- **Fila 2:** descripción (izquierda) + input de peso `%` (derecha, `createInput` tipo `number`, tamaño `sm`, `rightIcon: 'fa-percent'`, ancho 60 px).

El input de peso está **deshabilitado** cuando el tipo está inactivo. Las tarjetas inactivas tienen opacidad `0.7`. Las activas mantienen fondo `bg-1` (sin cambio de color al activar).

### Indicador de total (header de la vista)

- Texto fijo: «El total debe ser 100%. Llevas»
- `#tipo360-total` muestra el valor en tiempo real con tipografía `ubits-heading-h2`.
- A su lado: «/100» también en `ubits-heading-h2`.
- El número cambia de color:
  - Verde (`--ubits-feedback-accent-success`) cuando el total es exactamente 100.
  - Rojo (`--ubits-feedback-accent-error`) cuando está entre 1 y 99 o supera 100.
  - Neutro (`--ubits-fg-1-high`) cuando es 0.

### Botón «Guardar»

Habilitado solo si: hay al menos un tipo activo **y** la suma es exactamente 100.

`saveTipo()` escribe en `draft.tipo = [{id, activo, peso}, ...]` y pone `draft.checks.tipo = true`.

---

## Vista: Competencias y enunciados (`competencias`)

### Propósito

El administrador crea desde cero las competencias que serán evaluadas, y para cada competencia define los enunciados (preguntas) que los evaluadores responderán.

> **Cambio de modelo:** las competencias ya **no** provienen de `BD_EVALUACIONES_360.competenciasBase`. Son 100% creadas por el usuario durante la sesión. `_competencias[]` almacena el estado en memoria; `draft.competencias` persiste entre sub-vistas.

### Estructura de datos de `_competencias`

```js
_competencias = [
    {
        id:          'comp-<timestamp>',  // o 'comp-imp-<timestamp>-<i>'
        nombre:      'Trabajo en equipo',
        descripcion: 'Breve descripción de la competencia.',
        seleccionada: true,
        expandida:   false,
        enunciados:  [
            {
                id:              'en-<timestamp>',
                texto:           'Colabora activamente...',
                tipoRespuesta:   'calificacion' | 'abierta',
                escala:          'desempeno' | 'regularidad' | null,
                obligatoria:     false | true,
                tiposEvaluacion: ['ascendente', 'paralela', ...]  // subconjunto de TIPO_IDS
            }
        ]
    }
]
```

### Modo empty state (sin competencias)

Cuando `_competencias.length === 0` se muestra el empty state (`loadEmptyState`) con:
- Icono: `fa-clipboard-list`
- Título: «Añade una competencia»
- Descripción breve
- Botón secundario: **«Añadir una por una»** → abre `openComp360Modal()`
- Botón primario: **«Añadir desde archivo»** → abre `openComp360ImportDrawer()`
- El footer sub-vistas se **oculta** en este estado.

### Modo lista (con al menos 1 competencia)

Header de la lista con dos botones:
- **«Añadir enunciados desde archivo»** → `openComp360ImportEnunciadosDrawer()`
- **«Añadir competencia»** → abre un dropdown (`comp360AddDropdown`) con dos opciones:
  - «Añadir una por una» → `openComp360Modal()`
  - «Añadir desde archivo» → `openComp360ImportDrawer()`

Cada ítem de competencia (`comp360-item`) muestra:
- Nombre en `ubits-body-md-bold`
- Descripción en `ubits-body-sm-regular`
- Número de enunciados
- Botón expandir/colapsar (`fa-chevron-down` / `fa-chevron-up`)
- Al expandir: lista de enunciados + botón secundario sm **«Añadir enunciado»** → `openComp360EnunciadoModal(compIdx)`

### Modal: Nueva competencia (`openComp360Modal`)

Campos obligatorios para habilitar el botón «Crear»:
- **Nombre** (`createInput` tipo `text`)
- **Descripción** (`createInput` tipo `textarea`)

Al crear: se añade a `_competencias[]` con `seleccionada: true` y se llama `renderCompetenciasView()`.

### Modal: Añadir enunciado (`openComp360EnunciadoModal`)

Para una competencia específica (por índice). Campos:

| Campo | Tipo | Notas |
|-------|------|-------|
| Enunciado | `textarea` | Obligatorio |
| Tipo de respuesta | `select` | Opciones: «Calificación del 1 al 5» / «Respuesta abierta» |
| Sub-opciones calificación | `select` (condicional) | Desempeño / Regularidad |
| Sub-opciones respuesta abierta | `select` (condicional) | Opcional / Obligatoria |
| Tipos de evaluación activos | switches `ubits-switch--md` | Uno por tipo activo en `_tipos`; todos marcados por defecto |

Los tipos del modal se leen de `_tipos` (en memoria) → `draft.tipo` → BD completa (fallback).

Botón «Añadir» habilitado cuando el enunciado tiene texto. Al confirmar, el enunciado se añade al array `enunciados[]` de la competencia y se re-renderiza la vista.

### Drawer: Añadir competencias desde archivo (`openComp360ImportDrawer`)

- Drawer oficial (`openDrawer`), id: `comp360DrawerImport`
- Acepta: CSV, `.xlsx`, `.xls` (constante `ACCEPT_TABULAR`); máx. 2 MB
- **Plantilla descargable** (nombre: `plantilla-competencias-360.csv`):

| Nombre competencia | Descripcion |
|--------------------|-------------|
| Liderazgo | Inspira y motiva al equipo... |
| (ejemplos) | |

- **Validaciones por fila:**
  - `cols[0]` (nombre) no puede estar vacío
  - `cols[1]` (descripción) no puede estar vacío
- Si hay errores: modal con tabla Fila / Problema (`buildImportErrorTableHtml`).
- Si no hay errores: competencias añadidas a `_competencias[]` con `seleccionada: true`; toast de éxito; re-renderiza la vista.

### Drawer: Añadir enunciados desde archivo (`openComp360ImportEnunciadosDrawer`)

- Drawer oficial (`openDrawer`), id: `comp360DrawerImportEnum`
- Acepta: CSV, `.xlsx`, `.xls`; máx. 2 MB
- **Plantilla descargable** (nombre: `plantilla-enunciados-360.csv`): generada dinámicamente con los nombres de las primeras dos competencias existentes como ejemplos.

Estructura de la plantilla (8 columnas):

| competencia | enunciado | tipo_respuesta | ascendente | descendente | paralela | cliente | autoevaluacion |
|-------------|-----------|---------------|------------|-------------|---------|---------|---------------|
| Liderazgo | Inspira y motiva... | 1-5 Desempeño | 1 | 1 | 1 | 0 | 0 |
| (ejemplos) | | | | | | | |

**Valores válidos de `tipo_respuesta`:**

| Valor en CSV | `tipoRespuesta` | `escala` | `obligatoria` |
|-------------|----------------|----------|--------------|
| `1-5 Desempeño` | `calificacion` | `desempeno` | `false` |
| `1-5 Regularidad` | `calificacion` | `regularidad` | `false` |
| `Respuesta abierta - obligatoria` | `abierta` | `null` | `true` |
| `Respuesta abierta` | `abierta` | `null` | `false` |

**Validaciones por fila:**

| Regla | Mensaje |
|-------|---------|
| Nombre de competencia vacío | «Fila N: falta el nombre de la competencia.» |
| Competencia no existe en `_competencias` | «Fila N: la competencia "X" no existe.» |
| Texto del enunciado vacío | «Fila N: falta el texto del enunciado.» |
| `tipo_respuesta` no válido | «Fila N: tipo de respuesta "X" no válido.» |
| Ningún tipo de evaluación marcado (cols 3-7 ninguna `"1"`) | «Fila N: debe marcarse al menos un tipo de evaluación.» |

Si hay errores: modal con tabla Fila / Problema. Si no: enunciados añadidos a sus competencias; toast; re-renderiza.

**`TIPO_IDS` para enunciados:** `['ascendente', 'descendente', 'paralela', 'cliente', 'autoevaluacion']` — cols 3 a 7 del CSV.

### Botón «Guardar»

Deshabilitado si `_competencias.length === 0` (se oculta el footer en el empty state).

`saveCompetencias()` serializa cada competencia en `draft.competencias` con `id`, `nombre`, `descripcion`, `seleccionada` y **`enunciados[]`** (copia profunda), y pone `draft.checks.competencias = true`. Los enunciados son necesarios para el resumen del hub y para restaurar `_competencias` al volver a la vista.

---

## Vista: Evaluados (`evaluados`)

### Propósito

Seleccionar qué colaboradores serán evaluados en esta evaluación 360. La selección se hace mediante una tabla con checkboxes. Se puede complementar con importación desde archivo.

> **Modelo actual:** tabla única de todos los colaboradores. El antiguo wizard de 2 pasos con cards de tipo de selección fue eliminado.

### Tabla de colaboradores (`eval360InitColabTable`)

Creada con `createUbitsDataTable` en el contenedor `#eval360-colab-dt-container`.

| Columna | Campo | Características |
|---------|-------|----------------|
| Evaluado | `evaluado` (nombre) | Avatar + nombre; `sortable: true` |
| Username | `username` | Solo texto; `sortable: true` |
| Área | `area` | Solo texto; `sortable: true` |

- **Datos:** `BD_MASTER_COLABORADORES.colaboradores` — 55 colaboradores. Todos tienen `username` (formato `inicial_4letrasPrimerApellido_inicialSegundoApellido@fiqsha.demo`, e.g. `cgarcl@fiqsha.demo`).
- **Orden por defecto:** A-Z por nombre del evaluado (`localeCompare('es', { sensitivity: 'base' })`).
- **Botón primario:** «Añadir desde archivo» (`fa-file-arrow-up`) → llama `openEval360ImportDrawer()`.
- **Búsqueda:** estándar del componente `ubits-data-table`.
- **Checkboxes:** selección múltiple estándar. El botón «Guardar» se habilita al seleccionar al menos 1.
- La selección previa de `draft.evaluados.personas` se restaura al volver a la vista.

### Drawer: Añadir desde archivo (`openEval360ImportDrawer`)

- Drawer oficial (`openDrawer`), id: `eval360DrawerImport`
- Dos modos radio (uno al lado del otro): **«Basado en organigrama»** y **«Libre»**
- Al cambiar el modo se re-monta el file uploader (`montarFileUploader()`) y actualiza la descripción (`actualizarDesc()`)

#### Modo: Basado en organigrama

El archivo solo lleva la columna `username`. El sistema asigna evaluadores automáticamente según el organigrama y los tipos activos configurados en `#tipo`.

**Plantilla** (`plantilla-evaluados-organigrama.csv`):

| username |
|----------|
| rospid@fiqsha.demo |
| fcastr@fiqsha.demo |
| (ejemplos) |

**Validaciones** (`eval360ValidarOrganigrama`):

| Regla | Mensaje |
|-------|---------|
| Archivo vacío (sin datos) | «El archivo está vacío o solo contiene la fila de encabezados.» |
| Más de 3.000 filas | «El archivo supera las 3.000 filas permitidas (N filas).» |
| Columna `username` no encontrada | «La columna requerida "username" no fue encontrada. Verifica que uses la plantilla correcta.» |
| Solo encabezado, sin datos | «El archivo no tiene filas de datos (solo tiene el encabezado).» |
| Campo `username` vacío en fila | «Fila N: el campo "username" está vacío.» |
| Username no existe en BD | «Fila N: el usuario "X" no existe en la base de datos de colaboradores.» |

Retorna `{ errores: [], filas: [{ username }] }`.

#### Modo: Libre

El archivo tiene 3 columnas: `evaluador`, `evaluado`, `tipo_evaluacion`. Permite asignaciones personalizadas fuera del organigrama.

**Plantilla** (`plantilla-evaluados-libre.csv`):

| evaluador | evaluado | tipo_evaluacion |
|-----------|----------|----------------|
| rospid@fiqsha.demo | cgarcl@fiqsha.demo | descendente |
| cgarcl@fiqsha.demo | rospid@fiqsha.demo | ascendente |
| cgarcl@fiqsha.demo | lrodrm@fiqsha.demo | paralela |
| pateleber@fiqsha.demo | pateleber@fiqsha.demo | autoevaluacion |
| asuarg@fiqsha.demo | cgarcl@fiqsha.demo | cliente |

**Valores válidos de `tipo_evaluacion`:** `descendente`, `ascendente`, `paralela`, `autoevaluacion`, `cliente` (normalizado, sin acento en autoevaluación).

**Validaciones** (`eval360ValidarLibre`):

| Regla | Mensaje |
|-------|---------|
| Archivo vacío | «El archivo está vacío o solo contiene la fila de encabezados.» |
| Más de 3.000 filas | «El archivo supera las 3.000 filas permitidas (N filas).» |
| Columnas requeridas faltantes | «Faltan columnas requeridas: "X", "Y". Usa la plantilla de modo Libre.» |
| Solo encabezado | «El archivo no tiene filas de datos (solo tiene el encabezado).» |
| Campo evaluador vacío | «Fila N: el campo "evaluador" está vacío.» |
| Campo evaluado vacío | «Fila N: el campo "evaluado" está vacío.» |
| Campo tipo_evaluacion vacío | «Fila N: el campo "tipo_evaluacion" está vacío.» |
| Tipo no válido | «Fila N: tipo de evaluación "X" no es válido. Valores admitidos: descendente, ascendente, paralela, autoevaluación, cliente.» |
| Tipo no activo en la configuración | «Fila N: el tipo "X" no está activo en la configuración de esta evaluación 360.» |
| Evaluador no existe en BD | «Fila N: el evaluador "X" no existe en la base de datos de colaboradores.» |
| Evaluado no existe en BD | «Fila N: el evaluado "X" no existe en la base de datos de colaboradores.» |
| Autoevaluación con personas distintas | «Fila N: en autoevaluación el evaluador y el evaluado deben ser la misma persona.» |
| Tipo ≠ autoevaluación con misma persona | «Fila N: evaluador y evaluado son la misma persona. Solo se permite en autoevaluación.» |

> **Evaluador y evaluado:** en modo Libre, ambos usernames deben existir en `BD_MASTER_COLABORADORES` para **todos** los tipos de evaluación, incluido `cliente` (no se admiten evaluadores externos ficticios como `cliente_externo`).

> **Check de tipo activo:** se usa `eval360GetTiposActivos().map(t => eval360Norm(t.nombre))`. Se usa `.nombre` (no `.id`) porque los IDs internos (`jefe`, `pares`, etc.) no coinciden con los valores del CSV.

Retorna `{ errores: [], filas: [{ evaluador, evaluado, tipo }] }`.

#### Flujo de error reporting en el file uploader

El file uploader de evaluados sigue el patrón oficial del componente `file-upload.js`:

1. Si hay errores de validación: `fileUploadSetError(fuEl, 'N error(es)...')` + `fileUploadShowErrorReport(fuEl, true)` + se conecta el botón «Informe de errores» → `eval360MostrarErroresImport(errores)`.
2. Si no hay errores: `fileUploadClearError(fuEl)` + `fileUploadShowErrorReport(fuEl, false)` + botón «Importar» habilitado.

`eval360MostrarErroresImport(errores)` abre un modal con `buildImportErrorTableHtml(errores)`.

#### Aplicar importación (`eval360AplicarImport`)

- **Organigrama:** resuelve usernames a IDs de colaboradores → combina con la selección manual existente en la tabla (`_eval360ColabTablaRef.getSelectedIds()`) → actualiza `draft.evaluados` y re-renderiza la tabla.
- **Libre:** guarda en `draft.evaluados = { tipo: 'libre', asignaciones: filas, personas: [ids únicos de evaluados] }` → re-renderiza la tabla.

Después de aplicar: toast de éxito con el número de evaluados importados.

### Estado de memoria (evaluados)

```js
var _eval360ColabTablaRef  = null;  // ref al ubits-data-table de colaboradores
var _eval360ImportFilas    = null;  // filas válidas del último archivo parseado
```

### Guardar evaluados (`saveEvaluados`)

Lee los IDs seleccionados de `_eval360ColabTablaRef.getSelectedIds()`.  
`draft.evaluados = { tipo: 'por-colaborador', personas: ids, grupos: [] }`.  
`draft.checks.evaluados = ids.length > 0`.  
Toast de éxito + vuelve al hub.

### Footer sub-vista evaluados

| Botón secundario | Botón primario |
|-----------------|----------------|
| «Cancelar» (vuelve al hub) | «Guardar» (deshabilitado si ningún colaborador seleccionado) |

---

## Vista: Configuración de resultados (`resultados`)

### Propósito

Definir la escala de calificación, los parámetros de resultado con sus rangos, y tres opciones de comportamiento de la evaluación.

### Campos

**Selects** (`createInput` tipo `select`):

| Select | Opciones | Variable |
|--------|----------|----------|
| Escala | «De 1 a 5» / «De 1 a 4» / «De 1 a 10» | `_resEscala` (default: `'5'`) |
| Cantidad de parámetros | «3 Parámetros» / «4 Parámetros» / «5 Parámetros» | `_resCantidad` (default: `4`) |

Al cambiar cualquiera de estos selects, los rangos se recalculan con `buildDefaultParams(cantidad, escalaMax)` que distribuye los rangos uniformemente y usa nombres predefinidos:

```js
RES_PARAM_DEFAULTS = {
    3: ['Por mejorar', 'En desarrollo', 'Destacado'],
    4: ['Por mejorar', 'Regular', 'Bueno', 'Destacado'],
    5: ['Crítico', 'Por mejorar', 'Regular', 'Bueno', 'Destacado']
}
```

**Tabla de parámetros** (`#res360-params-list`):

Cada parámetro tiene 3 campos inline (`createInput` tamaño `sm`): Nombre, Desde, Hasta. El usuario puede ajustar libremente cada rango.

**Switches (columna derecha)**:

| ID | Label | Descripción en tooltip |
|----|-------|----------------------|
| `res360-toggle-lideres` | Permitir vista de resultados a los líderes | Los líderes podrán ver los resultados de sus equipos. |
| `res360-toggle-nosabe` | Permitir respuesta de "No sabe / No responde" | Habilita una opción adicional para indicar falta de información. |
| `res360-toggle-anonimato` | Asegurar anonimato (No aplica para descendente y autoevaluación) | Las respuestas de pares, clientes y ascendentes serán anónimas. |

### Botón «Guardar»

Siempre habilitado (ningún campo es obligatorio para guardar).

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

Visible en las 4 sub-vistas. Botones:

| Vista | Botón secundario | Botón primario |
|-------|-----------------|----------------|
| `tipo` | «Cancelar» → `history.back()` | «Guardar» (dis. si suma ≠ 100 o ningún tipo activo) |
| `competencias` | «Cancelar» → `history.back()` | «Guardar» (dis. si `_competencias.length === 0`) |
| `evaluados` | «Cancelar» → `history.back()` | «Guardar» (dis. si ningún colaborador seleccionado) |
| `resultados` | «Cancelar» → `history.back()` | «Guardar» (siempre habilitado) |

El botón primario llama `saveCurrentSubView()`, que despacha a la función `save*` de la vista activa.

---

## Utilidades compartidas

### `leerArchivoComoFilas(file, callback)`

Lee un archivo CSV o Excel y llama `callback(err, filas)` (convención **error-first**):
- **Excel (`.xlsx` / `.xls`):** usa SheetJS (`XLSX.read`) con `header: 1, defval: ''`.
- **CSV:** `FileReader.readAsText`, quita BOM, divide por `\r?\n`, parsea columnas con comillas.
- `filas` es un array de arrays: `filas[0]` = cabeceras, `filas[1..n]` = datos.

> SheetJS se carga via CDN: `https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js`

**Constantes para los file uploaders:**

```js
ACCEPT_TABULAR  = '.csv,text/csv,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.xls,application/vnd.ms-excel'
FORMATS_TABULAR = 'CSV, Excel (.xlsx / .xls) · máx. 2 MB'
```

### `eval360Norm(s)`

Normaliza un string para comparación: minúsculas + quita tildes (NFD) + trim.

```js
eval360Norm('Autoevaluación') // → 'autoevaluacion'
eval360Norm('  Descendente ') // → 'descendente'
```

### `eval360GetTiposActivos()`

Retorna los tipos activos (con `activo: true`) del estado en memoria. Fallback en orden:
1. `_tipos.filter(t => t.activo)` (estado de la vista Tipo)
2. `draft.tipo.filter(t => t.activo)` (guardado en draft)
3. Todos los tipos de `BD_EVALUACIONES_360.tiposEvaluacion` con `activo: true` (fallback total)

### `buildImportErrorTableHtml(errores)`

Genera HTML con una tabla `ubits-table` de dos columnas (Fila / Problema) a partir de un array de strings con formato `"Fila N: mensaje"`. Muestra máximo 50 errores. Los errores sin prefijo «Fila N» muestran «—» en la columna Fila. El texto de la columna Problema hace wrap (`white-space: normal`).

### `TIPOS_NORM_MAP` y `TIPOS_VALIDOS_360`

```js
TIPOS_VALIDOS_360 = ['descendente', 'ascendente', 'paralela', 'autoevaluacion', 'cliente']

TIPOS_NORM_MAP = {
    'autoevaluación': 'autoevaluacion',
    'autoevaluacion': 'autoevaluacion',
    'descendente':    'descendente',
    'ascendente':     'ascendente',
    'paralela':       'paralela',
    'cliente':        'cliente'
}
```

Usados en `eval360ValidarLibre` para normalizar el valor de `tipo_evaluacion` del CSV antes de validarlo.

---

## Fuentes de datos maestros (`bd-master/`)

| Archivo | Qué expone | Usado en |
|---------|-----------|----------|
| `bd-evaluaciones-360.js` | `BD_EVALUACIONES_360.tiposEvaluacion` (5 tipos con ids internos: `auto`, `jefe`, `pares`, `subalternos`, `cliente`) | Vista Tipo |
| `bd-evaluaciones-360.js` | `BD_EVALUACIONES_360.competenciasBase` (8 competencias con enunciados; solo referencia, no se usa en la vista Competencias) | — |
| `bd-evaluaciones-360.js` | `BD_EVALUACIONES_360.addEvaluacion(datos)` | Al activar |
| `bd-master-colaboradores.js` | `BD_MASTER_COLABORADORES.colaboradores[]` — 55 colaboradores con `username` completo | Tabla evaluados; validación de archivos |

**Formato de `username`:** `inicial_4letrasPrimerApellido_inicialSegundoApellido@fiqsha.demo`  
Ejemplo: Carlos García López → `cgarcl@fiqsha.demo`

Los **líderes** (9) también tienen `username` y sirven como datos de ejemplo en las plantillas descargables.

---

## Componentes UBITS usados

| Componente | Importación | Uso |
|-----------|-------------|-----|
| `input.css` + `input.js` | `components/input.*` | Campos del hub, pesos en Tipo, rangos en Resultados |
| `calendar.css` + `calendar.js` | `components/calendar.*` | Fechas de inicio y fin |
| `modal.css` + `modal.js` | `components/modal.*` | Activación, salida, Nueva competencia, Añadir enunciado, errores CSV |
| `drawer.css` + `drawer.js` | `components/drawer.*` | Import drawers (competencias, enunciados, evaluados) |
| `toast.css` + `toast.js` | `components/toast.*` | Confirmación al guardar cada sección y al importar |
| `switch.css` | `components/switch.css` | Tipos en vista Tipo, toggles en Resultados, tipos en modal enunciado |
| `file-upload.css` + `file-upload.js` | `components/file-upload.*` | Todos los drawers de importación |
| `ubits-data-table.css` + `.js` | `components/ubits-data-table.*` | Tabla de evaluados |
| `table.css` | `components/table.css` | Tabla de errores en modales |
| `avatar.css` | `components/avatar.css` | Avatares en la tabla de evaluados |
| `empty-state.css` + `.js` | `components/empty-state.*` | Vista Competencias sin datos |
| `dropdown-menu.js` + `.css` | `components/dropdown-menu.*` | Dropdown «Añadir competencia»; requerido por `input.js` |
| `status-tag.css` | `components/status-tag.css` | Tag «Borrador» en el header del hub |
| `tooltip.css` + `.js` | `components/tooltip.*` | Tooltips en botones del header e iconos de info |
| `selection-card.css` | `components/selection-card.css` | Importado (componente `ubits-selection-card`) |
| `chip.css` | `components/chip.css` | Importado |
| `stepper.css` + `.js` | `components/stepper.*` | Importado (no activo actualmente) |
| `radio-button.css` | `components/radio-button.css` | Radio buttons del drawer de evaluados (modos organigrama / libre) |
| `checkbox.css` | `components/checkbox.css` | Checkboxes en la tabla |
| `layout-immersive.css` | `general-styles/layout-immersive.css` | Shell de la página |
| **SheetJS** | CDN (`xlsx.full.min.js` v0.18.5) | Parseo de archivos `.xlsx` / `.xls` |

---

## Estructura de archivos del flujo 360

```
ubits-admin/desempeno/360/
├── crear-360.html              ← Flujo completo de creación (esta página)
├── crear-360.css               ← Estilos específicos del flujo
├── admin-360.html              ← Lista de evaluaciones (destino al activar / salir)
├── contexto-creacion-360.md    ← Este documento
└── archivos-demo/
    ├── competencias-fiqsha.csv ← 8 competencias de ejemplo para Fiqsha
    └── enunciados-fiqsha.csv   ← 30 enunciados de ejemplo para Fiqsha

bd-master/
├── bd-evaluaciones-360.js      ← Tipos, competencias base (referencia), helper addEvaluacion
└── bd-master-colaboradores.js  ← 55 colaboradores Fiqsha con username completo
```

---

## Notas para implementación

- **Reset de calendar al cambiar vista:** `cleanupCalendarPickers()` destruye los pickers flotantes antes de cambiar de vista.
- **Restaurar estado al volver:** cada `render*View()` recupera los valores de `draft.*` para no mostrar la vista vacía cuando el usuario vuelve a editar una sección ya guardada. `_tipos` y `_competencias` persisten en la sesión.
- **File upload re-entrada (evaluados):** `montarFileUploader()` limpia siempre el contenedor antes de crear un nuevo uploader (para el cambio de modo). El estado `_fileReady` y `_eval360ImportFilas` se resetean al cambiar de modo.
- **Modales overlay:** los overlays de confirmación tienen contenedores fijos en el HTML (`#crear360-cancel-modal-overlay`, `#crear360-activate-modal-overlay`). Los modales de errores CSV y de competencias son generados dinámicamente por `openModal`.
- **Comparación de tipos en validación:** siempre usar `t.nombre` (normalizado), nunca `t.id`. Los IDs internos (`jefe`, `pares`, `auto`, `subalternos`) no coinciden con los valores del CSV.
- **Sin servidor:** el template es puramente HTML/CSS/JS. Abrir con doble clic o `file:///…/crear-360.html`.

---

## Secciones pendientes de documentar

- Flujo de **edición** de una evaluación 360 existente (si aplica `editar-360.html`).
- Vista de **detalle y seguimiento** del proceso una vez activado.
- Lógica de **notificaciones a evaluadores** (actualmente simulada con toast al activar).
- Gestión desde la perspectiva del **evaluador** (módulo Colaborador).

---

*Última actualización: abril 2026. Flujo implementado: hub, tipo, competencias (sistema propio de creación + importación CSV/Excel), evaluados (tabla única + drawer de importación organigrama/libre), resultados. Activación con llamada a `BD_EVALUACIONES_360.addEvaluacion`.*
