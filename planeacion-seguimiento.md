# 📋 PLANIFICACIÓN: Página de Seguimiento - UBITS Playground 🟢 85% COMPLETADO

## 🎯 OBJETIVO
Replicar el diseño de la página de seguimiento desde `https://elaborate-rugelach-b66229.netlify.app/?tab=seguimiento-v3` usando HTML, CSS y JavaScript en UBITS Playground, siguiendo todas las reglas de `.cursor/rules/cursor-rules.mdc`.

**Ubicación:** `ubits-colaborador/tareas/seguimiento.html` y `ubits-colaborador/tareas/seguimiento.css`

---

## 📊 ANÁLISIS DE LA INTERFAZ ORIGINAL

### **Estructura Principal:**
1. **Navegación Superior (SubNav)** - El SubNav de la variante "tareas" ya existe con:
   - Planes
   - Tareas
   - **NUEVO:** Seguimiento (a agregar)
   
   **NOTA:** Estamos replicando el contenido interno de la pestaña "Seguimiento V3" de la página original (`https://elaborate-rugelach-b66229.netlify.app/?tab=seguimiento-v3`), pero en nuestro SubNav solo aparecerá como un tab "Seguimiento" junto a "Planes" y "Tareas". No replicamos la navegación superior de la página original (Planes, Tareas, Plantillas, Seguimiento V1, V2, V3), solo el contenido interno de Seguimiento V3.

2. **Header Bar (Basado en Figma):**
   - **Lado izquierdo:**
     - Título: "Lista de elementos" (bold, tamaño md)
     - Contador: "32/206 resultados" (regular, tamaño sm, color medium)
   - **Lado derecho:**
     - Botón de búsqueda (icon-only) - `ubits-button--secondary`, icono `fa-magnifying-glass`
     - Botón de filtros (icon-only) - `ubits-button--secondary`, icono `fa-filter`
     - Botón de columnas (icon-only) - `ubits-button--secondary`, icono `fa-columns-3`
       - Al hacer clic, despliega menú flotante con lista de columnas y checkboxes
       - Permite mostrar/ocultar columnas (excepto Checkbox que siempre está visible)
       - Columnas visibles por defecto: Nombre, Asignado, Estado, Avance, Fecha de creación, Plan

3. **Action Bar (Aparece cuando hay elementos seleccionados en la tabla):**
   - **Lado izquierdo:**
     - **"Ver seleccionados"** - `ubits-button--secondary`, icono `fa-eye`, texto "Ver seleccionados"
       - Al hacer clic: muestra solo los items seleccionados (pueden ser de múltiples páginas, ej: 4 de pág.1 + 3 de pág.2 = 7)
       - El botón pasa a estado **active** y el texto cambia a: icono `fa-eye-slash` + "Dejar de ver seleccionados (X)" (X = número de seleccionados)
       - Al hacer clic de nuevo: vuelve a la vista normal y deja de mostrar solo los seleccionados
   - **Centro/Derecha:**
     - **Reasignar** - `ubits-button--secondary`, icono `fa-user-plus`
       - Al hacer clic, despliega autocomplete **dinámico** para buscar persona (con avatares en opciones)
       - Permite reasignar tareas seleccionadas a otra persona
     - **Cambiar prioridad** - `ubits-button--secondary`, icono `fa-sliders` (o el que se proponga)
       - Al hacer clic, despliega lista desplegable: Alta, Media, Baja
       - Aplica la prioridad seleccionada a todas las tareas seleccionadas
     - **Cambiar estado** - `ubits-button--secondary`, icono `fa-rotate` (o el que se proponga)
       - Al hacer clic, despliega lista desplegable: Iniciada, Vencida, Finalizada
       - Aplica el estado seleccionado a todas las tareas seleccionadas
     - **Descargar** - `ubits-button--secondary`, icono `fa-download`
       - Descarga CSV con **todas las columnas** (incluidas las no visibles). Formato a definir.
     - **Eliminar** - `ubits-button--secondary`, icono `fa-trash` (destacado en rojo)
       - Al hacer clic, abre modal de confirmación
       - Si confirma, muestra toast de confirmación (no elimina realmente, solo ejemplo)
   
4. **Modal de Filtros (Se abre al hacer clic en botón de filtros):**
   - **Tipo de actividad:** Selector con checkboxes (selección múltiple)
     - Opciones: Todos los tipos, Planes, Tareas
   - **Buscar plan:** Autocomplete para buscar planes
   - **Buscar personas:** Autocomplete para buscar personas asignadas
   - **Todas las áreas:** Autocomplete para buscar áreas de la empresa
   - **Estado:** Selector con checkboxes (selección múltiple)
     - Opciones: Iniciada, Vencida, Finalizada
   - **Prioridad:** Selector con checkboxes (selección múltiple)
     - Opciones: Alta, Media, Baja
   - **Fecha de creación desde/hasta**, **Fecha de vencimiento desde/hasta:** Date pickers (calendar)
   - Botones: "Limpiar filtros", "Aplicar filtros"
   - **Depuración de opciones:** Al aplicar filtros, las opciones de los demás se reducen según los datos ya filtrados (ej.: planes solo de personas filtradas; estados solo de personas+planes filtrados).

4. **Modal de Columnas (Se abre al hacer clic en botón de columnas):**
   - Menú flotante que aparece justo debajo del botón de columnas
   - Lista de todas las columnas (excepto Checkbox que siempre está visible)
   - Cada columna tiene un checkbox para mostrar/ocultar
   - Columnas visibles por defecto:
     - ✅ Nombre
     - ✅ Asignado
     - ✅ Estado
     - ✅ Avance
     - ✅ Fecha de creación
     - ✅ Plan
   - Columnas ocultas por defecto:
     - ❌ ID
     - ❌ ID Colaborador
     - ❌ Prioridad
     - ❌ Fecha de finalización
     - ❌ Creador
     - ❌ Comentario
   - Al cambiar checkboxes, se muestran/ocultan columnas en tiempo real
   - No requiere botones de "Aceptar" o "Cancelar" - cambios se aplican inmediatamente

5. **Indicador de Resultados:**
   - "Lista de elementos 50/1711"

6. **Tabla de Datos (Basado en Figma):**
   - **Estructura:**
     - Tabla con scroll horizontal (múltiples columnas)
     - Columnas fijas a la izquierda: Checkbox, primera columna de datos
     - Columnas scrollables en el centro: múltiples columnas de datos
     - Columna fija a la derecha: última columna de datos
   - **Header de tabla:**
     - Cada columna tiene:
       - Icono de reordenamiento (drag): `fa-grip-dots-vertical`
       - Título de columna (ID, Nombre, Asignado, ID Colaborador, Plan, Estado, Prioridad, Avance, Fecha de finalización, Fecha de creación, Creador, Comentario)
       - Botón de fijar columna: `fa-ellipsis` o icono de pin
       - Botones de ordenamiento (en columnas: Estado, Prioridad, Fecha de finalización, Fecha de creación):
         - Icono: `fa-ellipsis` (tres puntos horizontales)
         - Al hacer clic, abre menú flotante con opciones de ordenamiento
   - **Columnas (orden y visibilidad):**
     - Checkbox (columna fija izquierda) - Header con checkbox "seleccionar todo" (icono `fa-minus` cuando todas seleccionadas)
       - **SIEMPRE VISIBLE** - No aparece en lista de columnas para mostrar/ocultar
     - ID
     - Nombre (VISIBLE por defecto)
     - Asignado (VISIBLE por defecto - con avatar circular o iniciales + icono)
     - ID Colaborador (número de identificación de la persona)
     - Plan (VISIBLE por defecto - movido después de Asignado)
     - Estado (VISIBLE por defecto - con botón de ordenamiento - icono `fa-ellipsis` horizontal)
     - Prioridad (con botón de ordenamiento - icono `fa-ellipsis` horizontal)
     - Avance (VISIBLE por defecto)
     - Fecha de finalización (con botón de ordenamiento - icono `fa-ellipsis` horizontal)
     - Fecha de creación (VISIBLE por defecto - con botón de ordenamiento - icono `fa-ellipsis` horizontal)
     - Creador
     - Comentario (muestra "X comentarios" donde X es número aleatorio 0-5, ej: "5 comentarios", "0 comentarios")
   - **Filas de datos:**
     - Checkbox marcado (azul) en cada fila
     - Datos en cada columna según estructura
     - **Columna Estado:** usar Status Tag según valor:
       - **Iniciada** → `ubits-status-tag--info`
       - **Vencida** → `ubits-status-tag--error`
       - **Finalizada** → `ubits-status-tag--success`
     - **Columna Prioridad:** **NO usar Status Tag**. Usar icono + texto:
       - **Alta:** `fa-chevrons-up` + texto "Alta" — color `var(--ubits-feedback-accent-error)` o rojo de error
       - **Media:** `fa-chevron-up` + texto "Media" — color neutral (`var(--ubits-fg-1-medium)`)
       - **Baja:** `fa-chevron-down` + texto "Baja" — color azul (`var(--ubits-feedback-accent-info)` o `--ubits-accent-brand`)
     - **Columna Asignado:** solo imagen circular (28×28) o icono `fa-user` en círculo (28×28) si no hay avatar. **No usar iniciales/letras.**
     - **Datos de ejemplo:**
       - 100 filas de datos
       - Asignados: algunos con avatares Unsplash, otros sin avatar (mostrar `fa-user` en círculo 28×28)
       - Comentarios: números aleatorios 0–5 (ej: "5 comentarios", "0 comentarios")
   - **Scrollbar horizontal** al final de la tabla
   - **Menú flotante de ordenamiento (al hacer clic en botón ellipsis):**
     - Aparece justo debajo del botón de ordenamiento
     - Opciones:
       - "Ordenar A a la Z" (texto clickeable)
       - "Ordenar Z a la A" (texto clickeable)
     - Botones de acción:
       - "Cancelar" - `ubits-button--secondary`, cierra el menú sin aplicar cambios
       - "Aceptar" - `ubits-button--primary`, aplica el ordenamiento seleccionado y cierra el menú
     - Funcionalidad: Similar a Google Sheets - permite ordenar la columna de forma ascendente o descendente
     - **NOTA:** NO incluir opciones de: ordenar por color, filtrar por color, filtrar por condición, filtrar por valores

6. **Paginador (Usar componente existente):**
   - **Componente:** `components/paginator.js` y `components/paginator.css`
   - **Función:** `loadPaginator(containerId, options)`
   - **Opciones:**
     - `totalItems`: Número total de items (ej: 1711)
     - `itemsPerPage`: Items por página (default: 16)
     - `currentPage`: Página actual (default: 1)
     - `onPageChange`: Callback cuando cambia la página
     - `onItemsPerPageChange`: Callback cuando cambia items por página

7. **Toasts de Confirmación (Componente oficial):**
   - **Componente:** `components/toast.js` y `components/toast.css`
   - **Función:** `showToast(type, message, options)`
   - **Uso:** Mostrar toast de confirmación cuando se completen acciones:
     - Reasignar: `showToast('success', 'Tareas reasignadas correctamente')`
     - Cambiar prioridad: `showToast('success', 'Prioridad actualizada correctamente')`
     - Cambiar estado: `showToast('success', 'Estado actualizado correctamente')`
     - Descargar: `showToast('success', 'CSV descargado correctamente')`
     - Eliminar: `showToast('success', 'Tareas eliminadas correctamente')`
   - **NOTA:** No mostrar toast si se cancela la acción

---

## 📐 ESPECIFICACIONES DETALLADAS (CASOS DE USO)

### **1. Estados y Prioridades en la tabla**
- **Estados (Status Tag):**
  - **Iniciada** → `ubits-status-tag--info`
  - **Vencida** → `ubits-status-tag--error`
  - **Finalizada** → `ubits-status-tag--success`
- **Prioridades (icono + texto, NO Status Tag):**
  - **Alta:** `fa-chevrons-up` + "Alta" — `var(--ubits-feedback-accent-error)`
  - **Media:** `fa-chevron-up` + "Media" — `var(--ubits-fg-1-medium)`
  - **Baja:** `fa-chevron-down` + "Baja" — `var(--ubits-feedback-accent-info)` o `--ubits-accent-brand`

### **2. Avatares en columna Asignado**
- **Solo** imagen circular **o** icono `fa-user` en círculo. **No usar iniciales/letras.**
- Tamaño fijo: **28×28 px** (avatar o círculo del icono).
- Si hay URL de avatar → `<img>` circular 28×28.
- Si no hay avatar → círculo 28×28 con `<i class="far fa-user"></i>` centrado.

### **3. Iconos de botones de acción (propuesta)**
- **Reasignar:** `fa-user-plus`
- **Cambiar prioridad:** `fa-sliders` o `fa-arrow-up-arrow-down`
- **Cambiar estado:** `fa-rotate` o `fa-arrows-rotate`
- **Descargar:** `fa-download`
- **Eliminar:** `fa-trash` (rojo cuando hay selección)
- **Ver seleccionados:** `fa-eye` → al activar: `fa-eye-slash` + "Dejar de ver seleccionados (X)"

### **4. CSV al descargar**
- Incluir **todas las columnas** (también las ocultas).
- Formato: separador `,`, encoding UTF-8, fila de cabeceras. Definir formato concreto en implementación.

### **5. Filtros combinados (depuración)**
- Los filtros **se combinan** (AND entre ellos).
- **Depuración de opciones:** cada filtro aplicado reduce las opciones del siguiente:
  1. Filtro por **personas** → la tabla se filtra al instante.
  2. Filtro por **planes** → solo se muestran planes que existan en las personas ya filtradas.
  3. Filtro por **estados** → solo estados que existan en (personas + planes) filtrados. Ej.: si solo hay Iniciada y En progreso, **no** se muestra Finalizada.

### **6. Ordenamiento**
- **Persiste entre navegaciones** (p. ej. cambiar de página en el paginador).
- Solo **una columna ordenada** a la vez (al ordenar otra, se reemplaza).

### **7. Responsive y scroll**
- **Desktop y mobile:** scroll horizontal. Mismas columnas que el usuario tenga activas en el selector de columnas.
- **Alert encima de la tabla** (sobre todo en mobile):  
  "Para una mejor experiencia revisa esta vista desde un computador" (o similar). Estilo: `ubits-alert--info` o equivalente.

### **8. Estilos de tabla (Figma + tokens)**
- **Hover de celdas/filas:** `var(--ubits-bg-2)`.
- Resto de colores según Figma, usando tokens UBITS.

### **9. "Ver seleccionados" / "Dejar de ver seleccionados"**
- **Ver seleccionados:** muestra **solo** los ítems seleccionados (pueden venir de varias páginas, ej: 4 de pág.1 + 3 de pág.2 = 7).
- Botón pasa a **active**, texto: `fa-eye-slash` + "Dejar de ver seleccionados (X)", X = cantidad seleccionada.
- **Dejar de ver seleccionados:** vuelve a la vista normal (tabla completa con filtros/paginación).

### **10. Autocomplete Reasignar**
- Lista de personas **dinámica** (datos de ejemplo o futura API).
- Incluir **avatares** en las opciones del autocomplete (28×28, mismo criterio que columna Asignado).

---

## ✅ TAREAS DESGLOSADAS

### **FASE 1: CONFIGURACIÓN INICIAL**

#### **Tarea 1.1: Actualizar SubNav - Agregar Tab "Seguimiento"** ✅ COMPLETADO
- [x] **Archivo:** `components/sub-nav.js`
- [x] **Acción:** Agregar tab "Seguimiento" a la variante `tareas`
- [x] **Detalles:**
  - ID: `seguimiento`
  - Label: `Seguimiento`
  - Icon: `far fa-chart-line` (o icono apropiado)
  - URL: `../../ubits-colaborador/tareas/seguimiento.html`
- [x] **Verificar:** Que el tab aparezca correctamente en desktop y móvil

#### **Tarea 1.2: Actualizar Floating Menu - Agregar Item "Seguimiento"** ✅ COMPLETADO
- [x] **Archivo:** `components/floating-menu.js`
- [x] **Acción:** Agregar subitem "Seguimiento" al acordeón "Tareas"
- [x] **Detalles:**
  - ID: `seguimiento`
  - Title: `Seguimiento`
  - Icon: `far fa-chart-line` (mismo que SubNav)
  - URL: `../../ubits-colaborador/tareas/seguimiento.html`
- [x] **Verificar:** Que el item aparezca en el floating menu dentro del acordeón "Tareas"

**Código de referencia para SubNav (`components/sub-nav.js`):**
```javascript
tareas: {
    name: 'Tareas',
    tabs: [
        { id: 'plans', label: 'Planes', icon: 'far fa-layer-group', url: '../../ubits-colaborador/tareas/planes.html' },
        { id: 'tasks', label: 'Tareas', icon: 'far fa-tasks', url: '../../ubits-colaborador/tareas/tareas.html' },
        { id: 'seguimiento', label: 'Seguimiento', icon: 'far fa-chart-line', url: '../../ubits-colaborador/tareas/seguimiento.html' } // NUEVO
    ]
}
```

**Código de referencia para Floating Menu (`components/floating-menu.js`):**
```javascript
{
    id: 'tareas',
    title: 'Tareas',
    icon: 'far fa-layer-group',
    subitems: [
        { id: 'planes', title: 'Planes', icon: 'far fa-calendar', url: '../../ubits-colaborador/tareas/planes.html' },
        { id: 'tareas', title: 'Tareas', icon: 'far fa-tasks', url: '../../ubits-colaborador/tareas/tareas.html' },
        { id: 'seguimiento', title: 'Seguimiento', icon: 'far fa-chart-line', url: '../../ubits-colaborador/tareas/seguimiento.html' } // NUEVO
    ]
}
```

---

### **FASE 2: ESTRUCTURA HTML BÁSICA** ✅ COMPLETADO

#### **Tarea 2.1: Crear archivo `seguimiento.html`** ✅ COMPLETADO
- [x] **Ubicación:** `ubits-colaborador/tareas/seguimiento.html`
- [x] **Basarse en:** `ubits-colaborador/tareas/tareas.html`
- [x] **Estructura:**
  - Head con todos los imports necesarios (seguir estructura de `tareas.html`)
  - Body con estructura modular:
    - `dashboard-container`
    - Sidebar container
    - Main content con SubNav
    - Content area con `content-sections`
    - Tab bar container
    - Floating menu container
    - Profile menu container
  - Scripts al final

**Imports necesarios:**
```html
<!-- Estilos base UBITS -->
<link rel="stylesheet" href="../../general-styles/ubits-colors.css">
<link rel="stylesheet" href="../../general-styles/styles.css">
<link rel="stylesheet" href="../../general-styles/fontawesome-icons.css">
<link rel="stylesheet" href="../../general-styles/ubits-typography.css">

<!-- Componentes de navegación -->
<link rel="stylesheet" href="../../components/sub-nav.css">
<link rel="stylesheet" href="../../components/sidebar.css">
<link rel="stylesheet" href="../../components/tab-bar.css">
<link rel="stylesheet" href="../../components/floating-menu.css">
<link rel="stylesheet" href="../../components/profile-menu.css">

<!-- Componentes UI que usaremos -->
<link rel="stylesheet" href="../../components/button.css">
<link rel="stylesheet" href="../../components/input.css">
<link rel="stylesheet" href="../../components/status-tag.css">
<link rel="stylesheet" href="../../components/paginator.css">
<link rel="stylesheet" href="../../components/toast.css">

<!-- Estilos específicos -->
<link rel="stylesheet" href="./profile.css">
<link rel="stylesheet" href="./seguimiento.css">
```

#### **Tarea 2.2: Crear estructura de secciones con widgets** ✅ COMPLETADO
- [x] **Sección 1:** Widget de barra de acciones (búsqueda, filtros, exportar, columnas) + indicador de resultados
- [x] **Sección 2:** Widget de tabla de datos
- [x] **NOTA:** No usar header-product (revisar diseño de Figma para confirmar)

**Estructura propuesta (Basada en Figma):**
```html
<div class="content-sections">
    <!-- Sección de header y acciones -->
    <div class="section-single">
        <div class="widget-header-seguimiento">
            <!-- Header Bar (Título + Contador + Botones) -->
            <div class="seguimiento-header-bar">
                <div class="seguimiento-header-left">
                    <h1 class="ubits-heading-h1">Lista de elementos</h1>
                    <span class="ubits-body-sm-regular">32/206 resultados</span>
                </div>
                <div class="seguimiento-header-right">
                    <button class="ubits-button ubits-button--secondary ubits-button--md ubits-button--icon-only" id="seguimiento-search-toggle">
                        <i class="far fa-magnifying-glass"></i>
                    </button>
                    <div id="seguimiento-search-container" style="display: none;"></div>
                    <button class="ubits-button ubits-button--secondary ubits-button--md ubits-button--icon-only" id="seguimiento-filters-toggle">
                        <i class="far fa-filter"></i>
                    </button>
                    <button class="ubits-button ubits-button--secondary ubits-button--md ubits-button--icon-only">
                        <i class="far fa-columns-3"></i>
                    </button>
                </div>
            </div>
            
            <!-- Action Bar (Botones de acción) -->
            <div class="seguimiento-action-bar">
                <button class="ubits-button ubits-button--secondary ubits-button--md">
                    <i class="far fa-eye"></i>
                    <span>Ver seleccionados</span>
                </button>
                <div class="seguimiento-action-buttons">
                    <button class="ubits-button ubits-button--secondary ubits-button--md ubits-button--icon-only">
                        <i class="far fa-bell"></i>
                    </button>
                    <button class="ubits-button ubits-button--secondary ubits-button--md ubits-button--icon-only">
                        <i class="far fa-copy"></i>
                    </button>
                    <button class="ubits-button ubits-button--secondary ubits-button--md ubits-button--icon-only">
                        <i class="far fa-pen"></i>
                    </button>
                    <button class="ubits-button ubits-button--secondary ubits-button--md ubits-button--icon-only">
                        <i class="far fa-arrow-down-to-line"></i>
                    </button>
                    <button class="ubits-button ubits-button--secondary ubits-button--md ubits-button--icon-only seguimiento-delete-btn">
                        <i class="far fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Sección de tabla -->
    <div class="section-single">
        <div class="widget-tabla-seguimiento">
            <!-- Tabla de datos aquí -->
        </div>
    </div>
    
    <!-- Sección de paginador -->
    <div class="section-single">
        <div class="widget-paginador-seguimiento">
            <!-- Paginador aquí -->
        </div>
    </div>
</div>

<!-- Modal de filtros (fuera de content-sections) -->
<div class="filtros-modal-overlay" id="filtros-modal-overlay" style="display: none;">
    <div class="filtros-modal-content">
        <!-- Contenido del modal de filtros -->
    </div>
</div>
```

#### **Tarea 2.3: Configurar JavaScript de carga de componentes** ✅ COMPLETADO
- [x] Cargar `loadSidebar('tareas')`
- [x] Cargar `loadSubNav('tareas')`
- [x] Cargar `loadTabBar()`
- [x] Cargar `loadFloatingMenu()`
- [x] Cargar `loadProfileMenu()`
- [x] Activar tab "Seguimiento" en SubNav (desktop y móvil) usando `data-tab="seguimiento"`
- [x] Activar opción "Seguimiento" en floating menu usando `setActiveAccordionLink('seguimiento')`
- [x] Activar botón "Tareas" en sidebar (debe estar activo por defecto)
- [x] Activar botón "Módulos" en Tab-bar móvil

---

### **FASE 3: BARRA DE BÚSQUEDA Y FILTROS (DISEÑO LIMPIO - INSPIRADO EN FIGMA)** ✅ COMPLETADO

**Referencia:** Basarse en `u-corporativa.html` para el botón de búsqueda desplegable (líneas 608-747)

#### **Tarea 3.1: Crear barra de acciones (búsqueda, filtros, exportar, columnas)** ✅ COMPLETADO
- [x] Crear contenedor horizontal para botones de acción
- [x] Botón de búsqueda - `ubits-button--secondary`, `ubits-button--md`, `ubits-button--icon-only`
  - Icono: `fa-search`
  - Al hacer clic, despliega input de búsqueda (similar a `u-corporativa.html`)
- [x] Botón de filtros - `ubits-button--secondary`, `ubits-button--md`, `ubits-button--icon-only`
  - Icono: `fa-filter`
  - Al hacer clic, abre modal de filtros
  - Badge opcional para mostrar cantidad de filtros activos
- [x] Botón "Columnas" - `ubits-button--secondary`, `ubits-button--md`, `ubits-button--icon-only`
  - Icono: `fa-columns-3`
  - Al hacer clic, despliega menú flotante con lista de columnas y checkboxes
  - Permite mostrar/ocultar columnas (excepto Checkbox que siempre está visible)

#### **Tarea 3.2: Implementar botón de búsqueda desplegable** ✅ COMPLETADO
- [x] Basarse en implementación de `u-corporativa.html` (líneas 608-747)
- [x] Botón inicial: `ubits-button--secondary`, `ubits-button--md`, `ubits-button--icon-only`
- [x] Al hacer clic, ocultar botón y mostrar contenedor de input
- [x] Crear input usando `createInput()` tipo `search`
  - Placeholder: "Buscar actividad..."
  - Container ID: `seguimiento-search-container`
  - Tamaño: `md`
- [x] Agregar botón "X" para cerrar búsqueda (similar a u-corporativa)
- [x] Funcionalidad: mantener input abierto si hay texto, cerrar si está vacío y se hace clic fuera

#### **Tarea 3.3: Crear estructura de modal de filtros** ✅ COMPLETADO
- [x] Crear contenedor de modal (overlay + contenido)
- [x] Usar tokens UBITS para fondo: `var(--ubits-bg-1)` para contenido, overlay con `rgba` o token apropiado
- [x] Estructura del modal:
  - Header con título "Filtros" y botón cerrar
  - Body con todos los filtros (scroll si es necesario)
  - Footer con botones "Limpiar filtros" y "Aplicar filtros"
- [x] Funcionalidad: abrir/cerrar modal, cerrar con botón X o clic fuera

#### **Tarea 3.4: Implementar filtros en el modal - Selectores con checkboxes** ✅ COMPLETADO
- [x] **Tipo de actividad:**
  - Label: "Tipo de actividad"
  - **Crear selector custom con radio buttons** (cambio de checkboxes a radio buttons por requerimiento)
  - Estructura: Contenedor con lista de radio buttons
  - Opciones: 
    - `{ value: 'all', text: 'Todos los tipos' }`
    - `{ value: 'plan', text: 'Planes' }`
    - `{ value: 'tarea', text: 'Tareas' }`
  - Container ID: `filtro-tipo-actividad`
  - Usar tokens UBITS para estilos: `var(--ubits-bg-1)`, `var(--ubits-border-1)`, etc.
  
- [x] **Estado:**
  - Label: "Estado"
  - Selector custom con checkboxes (similar al anterior)
  - Opciones:
    - `{ value: 'iniciada', text: 'Iniciada' }`
    - `{ value: 'vencida', text: 'Vencida' }`
    - `{ value: 'finalizada', text: 'Finalizada' }`
  - Container ID: `filtro-estado`
  
- [x] **Prioridad:**
  - Label: "Prioridad"
  - Selector custom con checkboxes (similar al anterior)
  - Opciones:
    - `{ value: 'alta', text: 'Alta' }`
    - `{ value: 'media', text: 'Media' }`
    - `{ value: 'baja', text: 'Baja' }`
  - Container ID: `filtro-prioridad`

#### **Tarea 3.5: Implementar filtros en el modal - Autocompletes** ✅ COMPLETADO
- [x] **Buscar plan:**
  - Label: "Buscar plan"
  - Usar componente `createInput()` tipo `autocomplete`
  - Placeholder: "Buscar plan..."
  - Container ID: `filtro-buscar-plan`
  - Opciones: Lista de planes (datos de ejemplo o dinámicos)
  
- [x] **Buscar personas:**
  - Label: "Buscar personas"
  - Usar componente `createInput()` tipo `autocomplete`
  - Placeholder: "Buscar persona..."
  - Container ID: `filtro-buscar-personas`
  - Opciones: Lista de personas (datos de ejemplo o dinámicos)
  
- [x] **Todas las áreas:**
  - Label: "Todas las áreas"
  - Usar componente `createInput()` tipo `autocomplete`
  - Placeholder: "Buscar área..."
  - Container ID: `filtro-buscar-areas`
  - Opciones: Lista de áreas (datos de ejemplo o dinámicos)

#### **Tarea 3.6: Implementar filtros en el modal - Date Pickers** ✅ COMPLETADO
- [x] **Fecha de creación desde:**
  - Label: "Fecha de creación desde"
  - Usar componente `createInput()` tipo `calendar`
  - Placeholder: "Selecciona fecha..."
  - Container ID: `filtro-fecha-creacion-desde`
  
- [x] **Fecha de creación hasta:**
  - Label: "Fecha de creación hasta"
  - Usar componente `createInput()` tipo `calendar`
  - Placeholder: "Selecciona fecha..."
  - Container ID: `filtro-fecha-creacion-hasta`
  
- [x] **Fecha de vencimiento desde:**
  - Label: "Fecha de vencimiento desde"
  - Usar componente `createInput()` tipo `calendar`
  - Placeholder: "Selecciona fecha..."
  - Container ID: `filtro-fecha-vencimiento-desde`
  
- [x] **Fecha de vencimiento hasta:**
  - Label: "Fecha de vencimiento hasta"
  - Usar componente `createInput()` tipo `calendar`
  - Placeholder: "Selecciona fecha..."
  - Container ID: `filtro-fecha-vencimiento-hasta`

#### **Tarea 3.7: Implementar botones del modal** ✅ COMPLETADO
- [x] Botón "Limpiar filtros" - `ubits-button--secondary`, `ubits-button--md`
  - Limpia todos los filtros y cierra el modal
- [x] Botón "Aplicar filtros" - `ubits-button--primary`, `ubits-button--md`
  - Aplica los filtros seleccionados y cierra el modal

#### **Tarea 3.8: Crear selector custom con checkboxes (para múltiple selección)** ✅ COMPLETADO
- [x] **NOTA:** El componente Input estándar no soporta selección múltiple con checkboxes visibles
- [x] Crear componente custom siguiendo diseño de tokens UBITS
- [x] Usar estructura similar a input pero con lista de checkboxes
- [x] Estilos: usar tokens UBITS (`var(--ubits-bg-1)`, `var(--ubits-border-1)`, etc.)
- [x] Funcionalidad: permitir selección múltiple, mostrar seleccionados
- [x] Aplicar a: Estado, Prioridad (Tipo de actividad usa radio buttons)

#### **Tarea 3.9: Crear indicador de resultados** ✅ COMPLETADO
- [x] Texto: "Lista de elementos 50/1711"
- [x] Usar tipografía UBITS: `ubits-body-md-bold`
- [x] Color: `var(--ubits-fg-1-medium)`
- [x] Actualizar dinámicamente según filtros aplicados

#### **Tarea 3.10: Implementar modal de columnas** ✅ COMPLETADO
- [x] Crear menú flotante que aparece al hacer clic en botón de columnas
- [x] Posicionar justo debajo del botón (`position: absolute`)
- [x] Lista de columnas con checkboxes (excepto Checkbox que no aparece en la lista)
- [x] Columnas visibles por defecto: Nombre, Asignado, Estado, Avance, Fecha de creación, Plan
- [x] Columnas ocultas por defecto: ID, ID Colaborador, Prioridad, Fecha de finalización, Creador, Comentario
- [x] Funcionalidad: al cambiar checkboxes, mostrar/ocultar columnas en tiempo real
- [x] Cerrar menú al hacer clic fuera
- [x] Estilos: usar tokens UBITS para fondo, bordes, tipografía

---

### **FASE 4: TABLA DE DATOS** ✅ COMPLETADO

#### **Tarea 4.1: Crear estructura HTML de tabla** ✅ COMPLETADO
- [x] Usar `<table>` semántica HTML
- [x] Crear `<thead>` con fila de encabezados
- [x] Crear `<tbody>` para datos
- [x] Aplicar clases UBITS para tipografía

**Columnas del thead (en orden):**
1. Checkbox (th con checkbox "Seleccionar todo") - SIEMPRE VISIBLE
2. ID (th) - OCULTA por defecto
3. Nombre (th) - VISIBLE por defecto
4. Asignado (th) - VISIBLE por defecto
5. ID Colaborador (th) - OCULTA por defecto
6. Plan (th) - VISIBLE por defecto
7. Estado (th con botones de ordenamiento) - VISIBLE por defecto
8. Prioridad (th con botones de ordenamiento) - OCULTA por defecto
9. Avance (th) - VISIBLE por defecto
10. Fecha de finalización (th con botones de ordenamiento) - OCULTA por defecto
11. Fecha de creación (th con botones de ordenamiento) - VISIBLE por defecto
12. Creador (th) - OCULTA por defecto
13. Comentario (th) - OCULTA por defecto (muestra "X comentarios")

#### **Tarea 4.2: Estilizar tabla con CSS** ✅ COMPLETADO
- [x] Crear estilos en `seguimiento.css`
- [x] Usar tokens UBITS para colores y bordes
- [x] Hacer tabla responsive (scroll horizontal en móvil o apilar)
- [x] Estilos para hover en filas: `var(--ubits-bg-2)`
- [x] Estilos para header de tabla: `body-md-semibold`, `fg-1-medium`, fondo transparente
- [x] Bordes y espaciados consistentes: borde `border-1`, `border-radius: 8px`
- [x] Altura de filas y encabezados: 45px

#### **Tarea 4.3: Implementar checkboxes** ✅ COMPLETADO
- [x] Checkbox "Seleccionar todo" en header
- [x] Checkboxes en cada fila
- [x] Funcionalidad: seleccionar/deseleccionar todo
- [x] Usar inputs HTML nativos estilizados con UBITS tokens

#### **Tarea 4.4: Implementar botones de ordenamiento** ✅ COMPLETADO
- [x] Botones en columnas: Fecha de creación, Fecha de finalización (fechas)
- [x] Botones en columnas: Nombre, Asignado, Plan, Creador (filtros autocomplete)
- [x] Botones en columnas: Estado, Prioridad (filtros checkbox)
- [x] Usar icono FontAwesome: `fa-ellipsis` (tres puntos horizontales)
- [x] Estilos: `ubits-button--tertiary`, `ubits-button--sm`, `ubits-button--icon-only`
- [x] Al hacer clic, abre menú flotante justo debajo del botón

#### **Tarea 4.4.1: Implementar menú flotante de ordenamiento** ✅ COMPLETADO
- [x] Crear menú flotante que aparece al hacer clic en botón de ordenamiento
- [x] Posicionar justo debajo del botón (usar `position: absolute`) con detección de viewport
- [x] Estructura del menú para fechas:
  - Opción "Más reciente primero" (texto clickeable)
  - Opción "Más reciente al final" (texto clickeable)
- [x] Funcionalidad:
  - Al hacer clic en una opción, se aplica inmediatamente (sin botones Aceptar/Cancelar)
  - Cerrar menú al hacer clic fuera del menú
- [x] Estilos: usar tokens UBITS para fondo, bordes, tipografía
- [x] Posicionamiento inteligente: detecta viewport para evitar cortes

#### **Tarea 4.5: Implementar datos de ejemplo** ✅ COMPLETADO
- [x] Crear array de datos de ejemplo (100 filas)
- [x] Renderizar filas dinámicamente con JavaScript
- [x] Usar datos realistas:
  - ID numérico (ej: 12562, 12563, etc.)
  - Nombre de tarea (variado)
  - Persona asignada:
    - Algunos con `avatar: 'https://images.unsplash.com/...'` (imagen 28×28)
    - Otros con `avatar: null` → mostrar `fa-user` en círculo 28×28. **No usar iniciales.**
    - **Avatares consistentes por persona** (mismo avatar para misma persona)
  - ID Colaborador (número de identificación, ej: "1234567890")
  - Plan (nombre de plan)
  - Estado (ej: "Iniciada", "Vencida", "Finalizada")
  - Prioridad (ej: "Alta", "Media", "Baja")
  - Avance (0-100%, nunca "-", siempre mostrar porcentaje)
  - Fecha de finalización (formato: "28 feb 2026")
  - Fecha de creación (formato: "5 dic 2025")
  - Creador (iniciales + nombre, ej: "DS Daniel Sanchez Restrepo")
  - Comentario: número aleatorio entre 0 y 5 (ej: "5 comentarios", "0 comentarios", "3 comentarios")

#### **Tarea 4.6: Estilizar celdas especiales** ✅ COMPLETADO
- [x] Celda de "Avance": mostrar progress bar (8px alto, 60px ancho) + porcentaje
  - Progress bar: fondo `var(--ubits-bg-4-static)`, barra `var(--ubits-feedback-accent-info)`
- [x] Celda de "Estado": usar Status Tag — Iniciada=info, Vencida=error, Finalizada=success
  - Status Tag con ancho fijo: 76px
- [x] Celda de "Prioridad": **NO** Status Tag. Icono + texto:
  - Alta: `fa-chevrons-up` + "Alta" (color error)
  - Media: `fa-chevron-up` + "Media" (neutral)
  - Baja: `fa-chevron-down` + "Baja" (azul)
- [x] Celda de "Asignado": solo imagen circular 28×28 **o** icono `fa-user` en círculo 28×28 (sin iniciales)
- [x] Celda de "Comentario": mostrar texto "X comentarios" (no botón, solo texto)
- [x] Texto truncado con ellipsis (no partir en dos líneas)

#### **Tarea 4.7: Implementar paginador** ✅ COMPLETADO
- [x] Importar CSS: `components/paginator.css`
- [x] Importar JS: `components/paginator.js`
- [x] Crear contenedor: `<div id="seguimiento-paginador"></div>` (en misma sección que tabla)
- [x] Llamar función: `loadPaginator('seguimiento-paginador', { ... })`
- [x] Configurar opciones:
  - `totalItems`: Total de items (ej: 100)
  - `itemsPerPage`: Items por página (default: 10)
  - `itemsPerPageOptions`: [10, 20, 50, 100]
  - `currentPage`: Página actual (default: 1)
  - `onPageChange`: Callback para actualizar tabla cuando cambia página
  - `onItemsPerPageChange`: Callback para actualizar tabla cuando cambia items por página

---

### **FASE 5: COMPONENTES Y ESTILOS** ✅ COMPLETADO

#### **Tarea 5.1: Crear archivo `seguimiento.css`** ✅ COMPLETADO
- [x] **Ubicación:** `ubits-colaborador/tareas/seguimiento.css`
- [x] **Basarse en:** `ubits-colaborador/tareas/tareas.css`
- [x] **Estructura:** Completa con todos los estilos específicos

#### **Tarea 5.2: Implementar estilos de barra de acciones (búsqueda, filtros, exportar, columnas)** ✅ COMPLETADO
- [x] Layout flexbox horizontal para botones
- [x] Espaciado consistente entre botones (gap: 8px o 12px)
- [x] Alineación vertical centrada
- [x] Responsive: ajustar en móvil si es necesario

#### **Tarea 5.3: Implementar estilos de tabla** ✅ COMPLETADO
- [x] **Usar tokens de Figma** - Tokens específicos aplicados
- [x] Tabla con bordes usando `var(--ubits-border-1)`, `border-radius: 8px`
- [x] Headers con fondo transparente
- [x] Hover en filas: `var(--ubits-bg-2)`
- [x] Padding consistente en celdas: `padding: 0 16px`
- [x] Tipografía: headers `body-md-semibold` `fg-1-medium`, datos `body-sm-regular` `fg-1-medium`
- [x] Altura fija: 45px para headers y filas
- [x] Sin doble borde en última fila

#### **Tarea 5.5: Implementar estilos de modal de filtros** ✅ COMPLETADO
- [x] Overlay del modal: fondo semitransparente usando tokens UBITS
- [x] Contenedor del modal: `var(--ubits-bg-1)`, bordes redondeados, sombra (si aplica)
- [x] Header del modal: fondo `var(--ubits-bg-2)`, padding consistente
- [x] Body del modal: padding consistente, scroll si es necesario
- [x] Footer del modal: borde superior `var(--ubits-border-1)`, padding, botones alineados
- [x] Responsive: modal debe adaptarse a móvil (ancho completo, altura máxima)

#### **Tarea 5.6: Implementar responsive** ✅ COMPLETADO
- [x] **Desktop y mobile:** scroll horizontal en la tabla; mismas columnas activas que el usuario tenga en el selector
- [x] **Alert encima de la tabla** (sobre todo en mobile): texto tipo "Para una mejor experiencia revisa esta vista desde un computador" — usando `ubits-alert--info`
- [x] Modal de filtros: adaptar a móvil (ancho completo, altura máxima, scroll interno)
- [x] Botones de acción: ajustar tamaños en móvil si es necesario

---

### **FASE 6: VALIDACIÓN Y COMPONENTES UBITS** ✅ COMPLETADO

#### **Tarea 6.1: Verificar uso de componentes UBITS** ✅ COMPLETADO
- [x] ✅ Usar `ubits-button` para todos los botones
- [x] ✅ Usar `createInput()` para:
  - Input de búsqueda (tipo `search`)
  - Autocompletes (tipo `autocomplete`)
  - Date pickers (tipo `calendar`)
- [x] ✅ Usar `loadPaginator()` para el paginador (componente existente)
- [x] ✅ Usar `showToast()` para confirmaciones de acciones (componente existente)
- [x] ✅ Crear selector custom con checkboxes para selección múltiple (Estado, Prioridad)
- [x] ✅ Crear selector custom con radio buttons para selección única (Tipo de actividad)
- [x] ✅ Crear modal custom usando tokens UBITS (no existe componente modal oficial)
- [x] ✅ Crear menú flotante de ordenamiento custom usando tokens UBITS
- [x] ✅ Crear menú flotante de columnas custom usando tokens UBITS
- [x] ✅ Crear dropdowns custom para prioridad/estado usando tokens UBITS
- [x] ✅ Crear modal de confirmación de eliminación custom usando tokens UBITS
- [x] ✅ Usar tokens UBITS para todos los colores (incluyendo tabla con tokens de Figma)
- [x] ✅ Usar tipografía UBITS para todos los textos
- [x] ✅ Importar CSS de cada componente usado (button, input, status-tag, paginator, toast)

#### **Tarea 6.2: Verificar tokens UBITS** ✅ COMPLETADO
- [x] ✅ No usar colores hardcodeados (#fff, #000, etc.)
- [x] ✅ Usar `var(--ubits-fg-*)` para textos
- [x] ✅ Usar `var(--ubits-bg-*)` para fondos
- [x] ✅ Usar `var(--ubits-border-*)` para bordes
- [x] ✅ Verificar contraste de textos

#### **Tarea 6.3: Verificar tipografía UBITS** ✅ COMPLETADO
- [x] ✅ Usar solo clases oficiales: `ubits-heading-h1`, `ubits-heading-h2`, `ubits-body-*-*`
- [x] ❌ NO usar clases inventadas: `ubits-h1`, `ubits-title`, etc.
- [x] ✅ Para subtítulos usar: `ubits-body-md-bold`
- [x] ✅ Títulos alineados a la izquierda (NO centrados)

---

### **FASE 7: FUNCIONALIDADES ADICIONALES** ✅ COMPLETADO

#### **Tarea 7.1: Implementar funcionalidad de checkboxes** ✅ COMPLETADO
- [x] Checkbox "Seleccionar todo" selecciona/deselecciona todas las filas
- [x] Cuando todas las filas están seleccionadas, checkbox "Seleccionar todo" se marca
- [x] Actualizar contador si es necesario

#### **Tarea 7.2: Implementar ordenamiento básico** ✅ COMPLETADO
- [x] Funcionalidad de ordenamiento ascendente/descendente (Más reciente primero/al final para fechas)
- [x] **Persistir** ordenamiento entre navegaciones (p. ej. al cambiar de página en paginador)
- [x] Solo **una columna ordenada** a la vez (al ordenar otra, se reemplaza la anterior)

#### **Tarea 7.3: Implementar búsqueda básica** ✅ COMPLETADO
- [x] Filtrar filas por texto ingresado en búsqueda
- [x] Buscar en columnas: Nombre, Asignado, Plan, Creador
- [x] Actualizar indicador de resultados (ej: "Lista de elementos 5/100")

#### **Tarea 7.4: Implementar filtros básicos (combinados + depuración)** ✅ COMPLETADO
- [x] Filtro por tipo (Plan/Tarea) con radio buttons
- [x] Filtros por planes, personas, áreas, estados, prioridades
- [x] **Combinar** filtros (AND entre ellos)
- [x] Filtros interconectados: encabezados de tabla ↔ modal de filtros
- [x] Actualizar tabla e indicador de resultados según filtros

#### **Tarea 7.5: Implementar funcionalidad de mostrar/ocultar columnas** ✅ COMPLETADO
- [x] Al cambiar checkboxes en modal de columnas, mostrar/ocultar columnas en tiempo real
- [x] Aplicar visibilidad por defecto según especificación
- [x] Columna Checkbox siempre visible (no aparece en lista)

#### **Tarea 7.6: Implementar "Ver seleccionados" / "Dejar de ver seleccionados"** ✅ COMPLETADO
- [x] Botón "Ver seleccionados" (icono `fa-eye`): al hacer clic, mostrar **solo** los ítems seleccionados (pueden ser de varias páginas)
- [x] Botón pasa a estado **active**; texto cambia a `fa-eye-slash` + "Dejar de ver seleccionados (X)" (X = cantidad seleccionada)
- [x] Al hacer clic de nuevo: volver a vista normal (tabla completa con filtros/paginación)

#### **Tarea 7.7: Implementar botones de acción cuando hay selección** ✅ COMPLETADO
- [x] Mostrar Action Bar solo cuando hay elementos seleccionados
- [x] **Reasignar:** icono `fa-user-plus`
  - Autocomplete **dinámico** para buscar persona, **con avatares** en opciones (28×28)
  - Al seleccionar persona, reasignar tareas seleccionadas → toast `'Tareas reasignadas correctamente'`
- [x] **Cambiar prioridad:** icono `fa-flag`
  - Dropdown: Alta, Media, Baja → aplicar a seleccionadas → toast `'Prioridad actualizada correctamente'`
- [x] **Cambiar estado:** icono `fa-rotate`
  - Dropdown: Iniciada, Vencida, Finalizada → aplicar a seleccionadas → toast `'Estado actualizado correctamente'`
- [x] **Descargar:** icono `fa-download`
  - CSV con **todas las columnas** (incluidas no visibles), filas seleccionadas → toast `'CSV descargado correctamente'`
- [x] **Eliminar:** icono `fa-trash` (rojo cuando hay selección)
  - Modal confirmación → si confirma, toast `'Tareas eliminadas correctamente'`; **no** eliminar datos realmente

#### **Tarea 7.8: Implementar toasts de confirmación** ✅ COMPLETADO
- [x] Importar Toast: `components/toast.js` y `components/toast.css`
- [x] Crear contenedor: `<div id="ubits-toast-container"></div>`
- [x] Mostrar toast tras cada acción completada (Reasignar, Cambiar prioridad, Cambiar estado, Descargar, Eliminar)
- [x] **NOTA:** No mostrar toast si se cancela la acción

---

### **FASE 8: REVISAR Y ACTUALIZAR VALIDADOR UBITS** ⏳ PENDIENTE

**NOTA IMPORTANTE:** El validador no se ha actualizado hace tiempo y puede no incluir todos los componentes actuales. Debe revisarse y actualizarse ANTES de validar la página.

#### **Tarea 8.1: Revisar validador actual** ⏳ PENDIENTE
- [ ] Abrir `documentacion/validador-ubits.html` en browser
- [ ] Revisar qué componentes detecta actualmente
- [ ] Identificar componentes faltantes:
  - ¿Detecta componente Paginator?
  - ¿Detecta componente Toast?
  - ¿Detecta componente Status Tag?
  - ¿Detecta todos los tipos de Input (search, autocomplete, calendar)?
  - ¿Detecta correctamente los tokens UBITS?
  - ¿Detecta correctamente la tipografía UBITS?
- [ ] Documentar componentes y reglas faltantes

#### **Tarea 8.2: Actualizar validador con componentes faltantes** ⏳ PENDIENTE
- [ ] Agregar detección de componente Paginator (`loadPaginator()`)
- [ ] Agregar detección de componente Toast (`showToast()`)
- [ ] Agregar detección de componente Status Tag (clases `ubits-status-tag`)
- [ ] Verificar detección de todos los tipos de Input
- [ ] Actualizar reglas de validación si es necesario
- [ ] Probar validador con páginas existentes para verificar que funciona correctamente

#### **Tarea 8.3: Verificar validador actualizado** ⏳ PENDIENTE
- [ ] Probar validador con `tareas.html` (página de referencia)
- [ ] Verificar que detecta correctamente todos los componentes
- [ ] Verificar que no genera falsos positivos
- [ ] Asegurar que el validador está listo para usar

---

### **FASE 9: VALIDAR PÁGINA CON VALIDADOR ACTUALIZADO** ⏳ PENDIENTE

**NOTA:** Esta fase solo debe ejecutarse DESPUÉS de actualizar el validador en la Fase 8.

#### **Tarea 9.1: Validar página con validador actualizado** ⏳ PENDIENTE
- [ ] Abrir `documentacion/validador-ubits.html` en browser (validador actualizado)
- [ ] Drag & drop `seguimiento.html`
- [ ] Revisar todos los errores y warnings detectados
- [ ] Documentar problemas encontrados

#### **Tarea 9.2: Corregir problemas detectados por validador** ⏳ PENDIENTE
- [ ] Corregir todos los errores críticos
- [ ] Corregir todos los warnings
- [ ] Re-validar después de cada corrección
- [ ] Repetir hasta alcanzar 100% score o máximo score posible

---

## 🎯 CHECKLIST FINAL

### **Antes de considerar completo:**
- [x] ✅ Archivo `seguimiento.html` creado y funcional
- [x] ✅ Archivo `seguimiento.css` creado y estilizado
- [x] ✅ Archivo `seguimiento.js` creado y funcional
- [x] ✅ SubNav actualizado con tab "Seguimiento"
- [x] ✅ Floating Menu actualizado con item "Seguimiento"
- [x] ✅ Tab "Seguimiento" se activa correctamente
- [x] ✅ Todos los componentes UBITS importados (button, input, status-tag, paginator, toast)
- [x] ✅ Todos los tokens UBITS usados (sin colores hardcodeados)
- [x] ✅ Tipografía UBITS usada correctamente
- [x] ✅ Tabla renderiza 100 filas de datos correctamente
- [x] ✅ Columnas visibles/ocultas funcionan correctamente
- [x] ✅ Modal de columnas funcional
- [x] ✅ Modal de filtros funcional con radio buttons y checkboxes
- [x] ✅ Filtros en encabezados de tabla interconectados con modal
- [x] ✅ Botones de acción (Reasignar, Cambiar prioridad, Cambiar estado, Descargar, Eliminar) funcionales
- [x] ✅ Toasts de confirmación funcionan correctamente
- [x] ✅ Ordenamiento funcional (fechas: Más reciente primero/al final)
- [x] ✅ Filtros funcionales (interconectados)
- [x] ✅ Búsqueda funcional
- [x] ✅ Checkboxes funcionales (seleccionar todo, selección individual)
- [x] ✅ Ver seleccionados funcional
- [x] ✅ Progress bar en columna Avance
- [x] ✅ Status tags con ancho fijo (76px)
- [x] ✅ Avatares consistentes por persona
- [x] ✅ Responsive funciona en móvil (alert para mejor experiencia en desktop)
- [x] ✅ Menús desplegables con detección de viewport
- [x] ✅ Paginador funcional (10, 20, 50, 100 items por página)
- [x] ✅ Sin scroll vertical no deseado en secciones
- [x] ✅ Sin doble borde en tabla
- [ ] ⏳ Validador UBITS revisado y actualizado (Fase 8) - **PENDIENTE**
- [ ] ⏳ Página validada con validador actualizado (Fase 9) - **PENDIENTE**
- [x] ✅ Sin errores en consola del browser

---

## 📝 NOTAS IMPORTANTES

### **Diseño basado en Figma:**
- Ver diseño oficial en: `https://www.figma.com/design/Y9vtQWt1G1UbzSVrqg7h3w/%F0%9F%8E%A8-Planes-y-Tareas-R4?node-id=207-38546&m=dev`
- **Tabla:** Usar tokens específicos del Figma para estilos de tabla
- **Modal de filtros:** Seguir el diseño del modal en Figma
- **Botón de búsqueda:** Desplegable como en `u-corporativa.html` (líneas 608-747)

### **Componentes UBITS a usar:**
1. **Button** - Para todos los botones (búsqueda, filtros, acciones, comentarios, ordenamiento)
2. **Input** - Para:
   - **Búsqueda:** tipo `search` (desplegable desde botón)
   - **Autocompletes:** tipo `autocomplete` - Para buscar plan, personas, áreas
   - **Date pickers:** tipo `calendar` - Para fechas de creación y vencimiento (desde/hasta)
3. **Status Tag** - Para estados y prioridades en la tabla (si aplica)
4. **Paginator** - Componente existente `components/paginator.js` y `components/paginator.css`
   - Función: `loadPaginator(containerId, options)`
   - Incluye navegación de páginas y selector de items por página
5. **Toast** - Componente existente `components/toast.js` y `components/toast.css`
   - Función: `showToast(type, message, options)`
   - Usar para confirmaciones de acciones: Reasignar, Cambiar prioridad, Cambiar estado, Descargar, Eliminar
   - Tipos: `success`, `info`, `warning`, `error`

### **Componentes Input - Detalles de uso:**
- ✅ **Autocomplete:** `createInput({ type: 'autocomplete' })` - Para buscar plan, personas, áreas
- ✅ **Calendar:** `createInput({ type: 'calendar' })` - Para fechas (desde/hasta)
- ⚠️ **Selectores múltiples:** NO usar `createInput({ type: 'select' })` - Crear custom con checkboxes
  - El select estándar no soporta selección múltiple con checkboxes visibles
  - Crear componente custom siguiendo tokens UBITS
  - Aplicar a: Tipo de actividad, Estado, Prioridad

### **Componentes que NO existen (crear estilos custom):**
1. **Tabla** - Usar HTML `<table>` nativo con estilos UBITS (tokens de Figma)
2. **Modal** - Crear modal custom usando tokens UBITS (overlay + contenido)
3. **Selector con checkboxes múltiple** - Crear componente custom para:
   - Tipo de actividad (Planes, Tareas)
   - Estado (Iniciada, Vencida, Finalizada)
   - Prioridad (Alta, Media, Baja)
   - **NOTA:** El componente Input select estándar no soporta selección múltiple con checkboxes visibles
4. **Menú flotante de ordenamiento** - Crear menú flotante custom usando tokens UBITS:
   - Aparece al hacer clic en botón de ordenamiento (icono `fa-ellipsis`)
   - Opciones: "Ordenar A a la Z", "Ordenar Z a la A"
   - Botones: "Cancelar", "Aceptar"
   - Posicionar justo debajo del botón (`position: absolute`)
   - Cerrar al hacer clic fuera o en botones
5. **Menú flotante de columnas** - Crear menú flotante custom usando tokens UBITS:
   - Aparece al hacer clic en botón de columnas (icono `fa-columns-3`)
   - Lista de columnas con checkboxes (excepto Checkbox que no aparece)
   - Cambios se aplican en tiempo real
   - Cerrar al hacer clic fuera
6. **Dropdown de prioridad/estado** - Crear dropdown custom usando tokens UBITS:
   - Aparece al hacer clic en botones "Cambiar prioridad" o "Cambiar estado"
   - Lista desplegable con opciones (Alta/Media/Baja o Iniciada/Vencida/Finalizada)
   - Cerrar al seleccionar opción o hacer clic fuera
7. **Modal de confirmación de eliminación** - Crear modal custom usando tokens UBITS:
   - Aparece al hacer clic en botón "Eliminar"
   - Mensaje: "¿Estás seguro de eliminar las tareas seleccionadas?"
   - Botones: "Cancelar" y "Eliminar"
   - Cerrar al hacer clic fuera, en Cancelar o en Eliminar

### **Estructura modular:**
- Usar sistema de secciones: `section-single`, `section-dual`, etc.
- Usar widgets: `widget-filtros-seguimiento`, `widget-tabla-seguimiento`
- Seguir estructura de `tareas.html` como referencia

### **Datos de ejemplo:**
Usar estructura con 100 filas:
```javascript
const datosEjemplo = [
    {
        id: 12562,
        nombre: 'People Management-Gestión del desempeño 70% práctico',
        asignado: {
            nombre: 'RC Rosario Del Carmen Caballero Villa',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop' // URL Unsplash o null → si null, mostrar fa-user en círculo 28×28
        },
        idColaborador: '1234567890',
        plan: 'Rosario Del Carmen Caballero Villa PDI HII 2025',
        estado: 'Iniciada',
        prioridad: 'Media',
        avance: '-',
        fechaFinalizacion: '28 feb 2026',
        fechaCreacion: '5 dic 2025',
        creador: 'DS Daniel Sanchez Restrepo',
        comentarios: 3 // Aleatorio 0–5, mostrar "X comentarios"
    },
    // ... 99 más
];
```

**Notas sobre datos:**
- **Asignados:** Algunos con `avatar: 'https://images.unsplash.com/...'` (imagen 28×28), otros con `avatar: null` → círculo 28×28 con `fa-user`. **No usar iniciales/letras.**
- **Comentarios:** Aleatorio 0–5 → "X comentarios"
- **Estados:** "Iniciada", "Vencida", "Finalizada"
- **Prioridades:** "Alta", "Media", "Baja"

### **Implementación de Modal Custom:**
**Como no existe componente modal oficial, crear uno usando tokens UBITS:**

```html
<!-- Overlay del modal -->
<div class="filtros-modal-overlay" id="filtros-modal-overlay">
    <!-- Contenedor del modal -->
    <div class="filtros-modal-content">
        <!-- Header -->
        <div class="filtros-modal-header">
            <h2 class="ubits-heading-h2">Filtros</h2>
            <button class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only" id="filtros-modal-close">
                <i class="far fa-times"></i>
            </button>
        </div>
        <!-- Body -->
        <div class="filtros-modal-body">
            <!-- Todos los filtros aquí -->
        </div>
        <!-- Footer -->
        <div class="filtros-modal-footer">
            <button class="ubits-button ubits-button--secondary ubits-button--md">Limpiar filtros</button>
            <button class="ubits-button ubits-button--primary ubits-button--md">Aplicar filtros</button>
        </div>
    </div>
</div>
```

**Estilos del modal (usar tokens UBITS):**
```css
.filtros-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5); /* Overlay semitransparente */
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
}

.filtros-modal-content {
    background: var(--ubits-bg-1);
    border-radius: 8px;
    max-width: 600px;
    width: 90%;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
}

.filtros-modal-header {
    padding: 16px 20px;
    border-bottom: 1px solid var(--ubits-border-1);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.filtros-modal-body {
    padding: 20px;
    overflow-y: auto;
    flex: 1;
}

.filtros-modal-footer {
    padding: 16px 20px;
    border-top: 1px solid var(--ubits-border-1);
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}
```

### **Implementación de Selector Custom con Checkboxes:**
**Para Tipo de actividad, Estado y Prioridad (selección múltiple):**

```html
<div class="custom-checkbox-selector" id="filtro-tipo-actividad">
    <label class="ubits-body-sm-semibold">Tipo de actividad</label>
    <div class="checkbox-selector-options">
        <label class="checkbox-option">
            <input type="checkbox" value="all">
            <span class="ubits-body-sm-regular">Todos los tipos</span>
        </label>
        <label class="checkbox-option">
            <input type="checkbox" value="plan">
            <span class="ubits-body-sm-regular">Planes</span>
        </label>
        <label class="checkbox-option">
            <input type="checkbox" value="tarea">
            <span class="ubits-body-sm-regular">Tareas</span>
        </label>
    </div>
</div>
```

**Estilos del selector custom (usar tokens UBITS):**
```css
.custom-checkbox-selector {
    margin-bottom: 20px;
}

.checkbox-selector-options {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 8px;
}

.checkbox-option {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
}

.checkbox-option input[type="checkbox"] {
    width: 16px;
    height: 16px;
    cursor: pointer;
    accent-color: var(--ubits-accent-brand); /* Color del checkbox cuando está marcado */
}
```

### **Implementación de Menú Flotante de Ordenamiento:**
**Para columnas ordenables (Estado, Prioridad, Fecha de finalización, Fecha de creación):**

```html
<!-- Botón de ordenamiento en header de tabla -->
<th>
    <div class="table-header-content">
        <span class="ubits-body-sm-semibold">Estado</span>
        <button class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only sort-btn" data-column="estado">
            <i class="far fa-ellipsis"></i>
        </button>
    </div>
    <!-- Menú flotante (inicialmente oculto) -->
    <div class="sort-menu" id="sort-menu-estado" style="display: none;">
        <div class="sort-menu-options">
            <button class="sort-option" data-sort="asc">Ordenar A a la Z</button>
            <button class="sort-option" data-sort="desc">Ordenar Z a la A</button>
        </div>
        <div class="sort-menu-footer">
            <button class="ubits-button ubits-button--secondary ubits-button--md sort-cancel">Cancelar</button>
            <button class="ubits-button ubits-button--primary ubits-button--md sort-accept">Aceptar</button>
        </div>
    </div>
</th>
```

**Estilos del menú flotante (usar tokens UBITS):**
```css
.sort-menu {
    position: absolute;
    top: 100%;
    right: 0;
    background: var(--ubits-bg-1);
    border: 1px solid var(--ubits-border-1);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    min-width: 200px;
    margin-top: 4px;
}

.sort-menu-options {
    padding: 8px 0;
}

.sort-option {
    width: 100%;
    padding: 8px 16px;
    text-align: left;
    background: transparent;
    border: none;
    color: var(--ubits-fg-1-medium);
    cursor: pointer;
    font-family: 'Noto Sans', sans-serif;
    font-size: 14px;
}

.sort-option:hover {
    background: var(--ubits-bg-2);
}

.sort-option.selected {
    color: var(--ubits-accent-brand);
    font-weight: 600;
}

.sort-menu-footer {
    padding: 8px 12px;
    border-top: 1px solid var(--ubits-border-1);
    display: flex;
    justify-content: flex-end;
    gap: 8px;
}
```

**JavaScript para funcionalidad:**
```javascript
// Abrir menú al hacer clic en botón de ordenamiento
document.querySelectorAll('.sort-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        const column = this.dataset.column;
        const menu = document.getElementById(`sort-menu-${column}`);
        // Cerrar otros menús abiertos
        document.querySelectorAll('.sort-menu').forEach(m => {
            if (m !== menu) m.style.display = 'none';
        });
        // Toggle menú actual
        menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    });
});

// Cerrar menú al hacer clic fuera
document.addEventListener('click', function(e) {
    if (!e.target.closest('.sort-btn') && !e.target.closest('.sort-menu')) {
        document.querySelectorAll('.sort-menu').forEach(m => {
            m.style.display = 'none';
        });
    }
});

// Seleccionar opción de ordenamiento
document.querySelectorAll('.sort-option').forEach(option => {
    option.addEventListener('click', function() {
        // Remover selección previa
        this.parentElement.querySelectorAll('.sort-option').forEach(o => {
            o.classList.remove('selected');
        });
        // Marcar como seleccionado
        this.classList.add('selected');
    });
});

// Botones Cancelar y Aceptar
document.querySelectorAll('.sort-cancel').forEach(btn => {
    btn.addEventListener('click', function() {
        const menu = this.closest('.sort-menu');
        menu.style.display = 'none';
        // Limpiar selección
        menu.querySelectorAll('.sort-option').forEach(o => {
            o.classList.remove('selected');
        });
    });
});

document.querySelectorAll('.sort-accept').forEach(btn => {
    btn.addEventListener('click', function() {
        const menu = this.closest('.sort-menu');
        const selected = menu.querySelector('.sort-option.selected');
        if (selected) {
            const sortType = selected.dataset.sort;
            const column = menu.id.replace('sort-menu-', '');
            // Aplicar ordenamiento
            sortTable(column, sortType);
        }
        menu.style.display = 'none';
    });
});
```

### **Implementación de Modal de Columnas:**
**Para mostrar/ocultar columnas:**

```html
<!-- Botón de columnas en header -->
<button class="ubits-button ubits-button--secondary ubits-button--md ubits-button--icon-only" id="columns-toggle-btn">
    <i class="far fa-columns-3"></i>
</button>

<!-- Menú flotante de columnas (inicialmente oculto) -->
<div class="columns-menu" id="columns-menu" style="display: none;">
    <div class="columns-menu-list">
        <label class="column-option">
            <input type="checkbox" value="id" checked>
            <span class="ubits-body-sm-regular">ID</span>
        </label>
        <label class="column-option">
            <input type="checkbox" value="nombre" checked>
            <span class="ubits-body-sm-regular">Nombre</span>
        </label>
        <label class="column-option">
            <input type="checkbox" value="asignado" checked>
            <span class="ubits-body-sm-regular">Asignado</span>
        </label>
        <!-- ... más columnas (excepto Checkbox) -->
    </div>
</div>
```

**JavaScript para funcionalidad:**
```javascript
// Abrir/cerrar menú de columnas
document.getElementById('columns-toggle-btn').addEventListener('click', function(e) {
    e.stopPropagation();
    const menu = document.getElementById('columns-menu');
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
});

// Mostrar/ocultar columnas en tiempo real
document.querySelectorAll('#columns-menu input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
        const columnId = this.value;
        const columnIndex = getColumnIndex(columnId);
        const column = document.querySelectorAll('th, td').forEach((cell, index) => {
            if (index % totalColumns === columnIndex) {
                cell.style.display = this.checked ? '' : 'none';
            }
        });
    });
});

// Cerrar menú al hacer clic fuera
document.addEventListener('click', function(e) {
    if (!e.target.closest('#columns-toggle-btn') && !e.target.closest('#columns-menu')) {
        document.getElementById('columns-menu').style.display = 'none';
    }
});
```

### **Implementación de Dropdowns de Prioridad/Estado:**
**Para botones "Cambiar prioridad" y "Cambiar estado":**

```html
<!-- Botón Cambiar prioridad -->
<button class="ubits-button ubits-button--secondary ubits-button--md" id="change-priority-btn">
    <i class="far fa-flag"></i>
    <span>Cambiar prioridad</span>
</button>

<!-- Dropdown de prioridad (inicialmente oculto) -->
<div class="action-dropdown" id="priority-dropdown" style="display: none;">
    <button class="dropdown-option" data-value="alta">Alta</button>
    <button class="dropdown-option" data-value="media">Media</button>
    <button class="dropdown-option" data-value="baja">Baja</button>
</div>
```

**JavaScript para funcionalidad:**
```javascript
// Abrir dropdown de prioridad
document.getElementById('change-priority-btn').addEventListener('click', function(e) {
    e.stopPropagation();
    const dropdown = document.getElementById('priority-dropdown');
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
});

// Seleccionar prioridad
document.querySelectorAll('#priority-dropdown .dropdown-option').forEach(option => {
    option.addEventListener('click', function() {
        const priority = this.dataset.value;
        const selectedRows = getSelectedRows();
        selectedRows.forEach(row => {
            updatePriority(row, priority);
        });
        showToast('success', 'Prioridad actualizada correctamente');
        document.getElementById('priority-dropdown').style.display = 'none';
    });
});
```

### **Implementación de Modal de Confirmación de Eliminación:**
**Para botón "Eliminar":**

```html
<!-- Modal de confirmación (inicialmente oculto) -->
<div class="delete-modal-overlay" id="delete-modal-overlay" style="display: none;">
    <div class="delete-modal-content">
        <h2 class="ubits-heading-h2">Confirmar eliminación</h2>
        <p class="ubits-body-md-regular">¿Estás seguro de eliminar las tareas seleccionadas?</p>
        <div class="delete-modal-footer">
            <button class="ubits-button ubits-button--secondary ubits-button--md" id="delete-cancel">Cancelar</button>
            <button class="ubits-button ubits-button--primary ubits-button--md" id="delete-confirm">Eliminar</button>
        </div>
    </div>
</div>
```

**JavaScript para funcionalidad:**
```javascript
// Abrir modal de eliminación
document.getElementById('delete-btn').addEventListener('click', function() {
    document.getElementById('delete-modal-overlay').style.display = 'flex';
});

// Cancelar eliminación
document.getElementById('delete-cancel').addEventListener('click', function() {
    document.getElementById('delete-modal-overlay').style.display = 'none';
});

// Confirmar eliminación
document.getElementById('delete-confirm').addEventListener('click', function() {
    // NO eliminar realmente (solo ejemplo)
    showToast('success', 'Tareas eliminadas correctamente');
    document.getElementById('delete-modal-overlay').style.display = 'none';
});
```

---

## 🚀 ORDEN DE IMPLEMENTACIÓN RECOMENDADO

1. **Fase 1:** Actualizar SubNav (rápido, permite navegar)
2. **Fase 2:** Crear estructura HTML básica (base del proyecto)
3. **Fase 3:** Implementar barra de filtros (visual principal)
4. **Fase 4:** Implementar tabla (contenido principal)
5. **Fase 5:** Aplicar estilos y responsive (pulir diseño)
6. **Fase 6:** Verificar componentes y tokens UBITS (revisión manual)
7. **Fase 7:** Agregar funcionalidades (mejorar UX)
8. **Fase 8:** Revisar y actualizar validador UBITS (CRÍTICO - hacer antes de validar)
9. **Fase 9:** Validar página con validador actualizado (último paso)

---

**Documento creado:** 2026-01-21
**Última actualización:** 2026-01-22
**Estado:** 🟢 Fases 1-7 COMPLETADAS | 🟡 Fases 8-9 PENDIENTES
**Próximo paso:** Fase 8 - Revisar y actualizar validador UBITS

---

## 📊 RESUMEN DE PROGRESO

| Fase | Descripción | Estado |
|------|-------------|--------|
| 1 | Configuración inicial (SubNav, Floating Menu) | ✅ COMPLETADO |
| 2 | Estructura HTML básica | ✅ COMPLETADO |
| 3 | Barra de búsqueda y filtros | ✅ COMPLETADO |
| 4 | Tabla de datos | ✅ COMPLETADO |
| 5 | Componentes y estilos | ✅ COMPLETADO |
| 6 | Validación y componentes UBITS | ✅ COMPLETADO |
| 7 | Funcionalidades adicionales | ✅ COMPLETADO |
| 8 | Revisar y actualizar validador | ⏳ PENDIENTE |
| 9 | Validar página con validador | ⏳ PENDIENTE |

### **Archivos creados/modificados:**
- ✅ `ubits-colaborador/tareas/seguimiento.html`
- ✅ `ubits-colaborador/tareas/seguimiento.css`
- ✅ `ubits-colaborador/tareas/seguimiento.js`
- ✅ `components/sub-nav.js` (agregado tab "Seguimiento")
- ✅ `components/floating-menu.js` (agregado item "Seguimiento")
- ✅ `components/paginator.js` (documentación de troubleshooting)
- ✅ `components/header-product.js` (documentación de troubleshooting)
- ✅ `general-styles/styles.css` (fix overflow para dropdowns)
- ✅ `documentacion/documentacion.html` (fix link roto)
- ✅ `index.html` (movido a raíz)
- ✅ `index.css` (movido a raíz)
- ✅ `components/sidebar.js` (actualizado rutas a index.html)

