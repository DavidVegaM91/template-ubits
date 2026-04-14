# 🎯 UBITS Playground - Crea interfaces en tiempo récord

> **Plantilla para crear interfaces UBITS con Cursor AI en tiempo récord**

**Creador y mantenedor:** [Hector David Vega](https://github.com/DavidVegaM91) — Desarrollo, documentación, reglas Cursor y sistema de componentes UBITS. Si usas o adaptas esta plantilla, mantén esta atribución.

---

## 🚀 ¿Qué es esto?

Una **plantilla lista para usar** que permite a **Product Managers**, **Diseñadores** y **Desarrolladores** crear interfaces UBITS auténticas usando **Cursor AI** sin conocimientos técnicos avanzados.

**El objetivo:** Validar ideas rápidamente, prototipar interfaces en tiempo récord y obtener feedback real de usuarios.

## 🚨 **ANTES DE EMPEZAR - LEE ESTO:**

1. **📋 Lee `.cursor/rules/cursor-rules.mdc`** - Reglas obligatorias para Cursor AI
2. **🎯 Edita `index.html`** - Tu página principal (se despliega en Netlify)
3. **📄 Usa `documentacion/plantilla-ubits.html`** - Para crear páginas nuevas
4. **👀 Mira `documentacion/componentes.html`** - Ve todos los componentes disponibles
5. **📖 LEE LA DOCUMENTACIÓN DEL COMPONENTE** - Antes de implementar cualquier componente, lee su página de documentación (ej: `documentacion/componentes/button.html`, `documentacion/componentes/alert.html`) para entender cómo usarlo correctamente
6. **🎨 Usa SOLO tokens UBITS** - `var(--ubits-...)` NUNCA colores hardcodeados
7. **📁 IMPORTANTE: Nueva estructura de carpetas** - El proyecto ahora está organizado en módulos (`ubits-admin/`, `ubits-colaborador/`, `documentacion/`)

## 🚀 Cómo usar esta plantilla

1. **Descarga:** Haz clon o descarga como ZIP
2. **Personaliza:** Modifica según tus necesidades
3. **Usa:** Despliega en tu propio hosting

> **Nota:** Esta es una plantilla de solo lectura. Para personalizarla, clona o haz fork del repositorio.

## 🧩 Componentes UBITS disponibles

### **Componentes de navegación:**
- **SubNav** - Navegación superior (variantes disponibles):
  - `template` - Plantilla personalizable
  - `aprendizaje` - Módulo de aprendizaje (inicio, catálogo, U. corporativa, zona de estudio)
  - `desempeno` - Módulo de desempeño (evaluaciones 360, objetivos, métricas, reportes)
  - `encuestas` - Módulo de encuestas
  - `tareas` - Módulo de tareas (planes, tareas)
  - `diagnostico` - Módulo de diagnóstico
  - `reclutamiento` - Módulo de reclutamiento
  - `empresa` - Gestión de empresa (gestión usuarios, organigrama, datos, personalización, roles, comunicaciones)
  - `admin-aprendizaje` - Administración de aprendizaje (planes de formación, universidad corporativa, certificados, seguimiento)
  - `admin-desempeño` - Administración de desempeño (evaluaciones 360, objetivos, matriz de talento)
  - `admin-diagnostico` - Administración de diagnóstico
  - `admin-encuestas` - Administración de encuestas
  - `documentacion` - Solo para páginas de documentación
  - `creator-lms` - LMS Creator: Contenidos, Categorías (`ubits-colaborador/lms-creator/`)
  - `creator-planes` - LMS Creator: Planes de formación, Grupos
  - `creator-certificados` - LMS Creator: Descarga, Configuración
  - `creator-personalizacion` - LMS Creator: Universidad corporativa, Seguimiento
- **Sidebar** - Navegación lateral con **3 variantes** (`components/sidebar.js`):
  - **Variante default:** (opciones: admin, aprendizaje, diagnóstico, desempeño, encuestas, reclutamiento, tareas, ia-para-hr, ninguno) — modo oscuro en footer. **No** incluye acceso directo en el rail a LMS Creator; el colaborador entra por el menú del avatar (**Modo LMS Creator**) o desde **Aprendizaje → Universidad corporativa** (botón *Acceder a LMS Creator* → `lms-creator/contenidos.html`).
  - **Variante admin:** (opciones: inicio, empresa, aprendizaje, diagnóstico, desempeño, encuestas; footer: api, centro-de-ayuda, modo-oscuro, perfil) - Incluye modo oscuro en footer
  - **Variante creator:** rail oscuro con cuatro módulos del producto LMS Creator — `lms-creator` (Contenidos), `planes-formacion`, `certificados`, `personalizacion`. Uso típico: `loadSidebar('creator', 'lms-creator')` (o la sección activa correspondiente). Detalle en [LMS Creator (producto aparte)](#lms-creator-producto-aparte-del-colaborador) más abajo.
- **Sidebar contenidos LMS** - Misma estructura que el Sidebar (`.sidebar` + `.nav-button` con iconos y tooltips), colores para superficie `--ubits-bg-1`; variantes **Publicado LMS Creator** (cinco pasos) y **Publicado Antiguo LMS** (sin Resultados; recursos como Módulos) vía `options.variant` - **RENDERIZADO: `loadSidebarContenidosLms()`**
- **TabBar** - Navegación móvil (primer tab abre el floating menu; opciones: modulos, perfil, modo-oscuro). **Variantes** (segundo argumento de `loadTabBar`): omitido o `'default'` → primer tab «Módulos» (colaborador); `'admin'` → «Admin» (páginas `ubits-admin/`); `'creator'` → «LMS Creator» (páginas `ubits-colaborador/lms-creator/`). Debe coincidir con `loadFloatingMenu(containerId, variant)` en la misma página.
- **Floating Menu** - Menú flotante modal para navegación móvil (acordeones con subitems). **Variantes** `'default' | 'admin' | 'creator'`: misma estructura de módulos que el README (colaborador / administración / LMS Creator).
- **Profile Menu** - Menú desplegable del perfil de usuario

**Páginas sin SubNav:** Si la página no usa SubNav (sin `#top-nav-container` ni `loadSubNav()`), añade **`class="no-subnav"`** al `<body>`. En `general-styles/styles.css` queda resuelto el espacio de **`.main-content`**: en **desktop (≥1024px)** se elimina el `padding-top` extra que reserva hueco al SubNav fijo; en **móvil/tablet (≤1023px)** se aplica **16px** de padding superior (`var(--gap-lg)`). Referencia: `ubits-colaborador/perfil/profile.html`, `ubits-colaborador/ia-para-hr/ia-para-hr.html`.

### LMS Creator (producto aparte del colaborador)

El **LMS Creator** es un producto de prototipo dentro del playground: vive en **`ubits-colaborador/lms-creator/`**, comparte shell UBITS (SubNav, TabBar, Floating menu, toasts) pero tiene **su propia barra lateral** (variante **`creator`** del Sidebar) y **SubNav por módulo** (no mezclar pestañas entre módulos).

#### **Cómo entra el usuario**

| Origen | Comportamiento |
|--------|----------------|
| Menú del avatar (sidebar default) | **Modo LMS Creator** → `lms-creator/contenidos.html` |
| `aprendizaje/u-corporativa.html` | Botón **Acceder a LMS Creator** → `../lms-creator/contenidos.html` |
| Floating menu (móvil) | Acordeón **LMS Creator** con enlaces a cada vista principal |

En el **rail del sidebar default** no hay icono dedicado al Creator (solo las rutas anteriores).

#### **Sidebar variante `creator`**

`loadSidebar('creator', '<sección>')` — si omites el segundo argumento, la sección activa por defecto es **`lms-creator`**.

| `data-section` (2.º arg) | Destino principal del ícono |
|--------------------------|------------------------------|
| `lms-creator` | `contenidos.html` |
| `planes-formacion` | `planes-formacion.html` |
| `certificados` | `certificados.html` |
| `personalizacion` | `personalizacion-u-corporativa.html` |

El logo UBITS en el header del sidebar es solo marca (sin enlace ni hover de interacción) en todas las variantes. El menú de perfil del Creator incluye **Modo colaborador** (vuelta al playground colaborador) y **Modo administrador**, además de documentación y sesión (ver `components/sidebar.js`).

#### **SubNav: un módulo = una variante**

Cada bloque de pestañas tiene su propia clave en **`components/sub-nav.js`**:

| Variante `loadSubNav(..., '…')` | Pestañas (IDs `data-tab`) | HTML de entrada típico |
|---------------------------------|---------------------------|-------------------------|
| `creator-lms` | Contenidos (`contenidos`), Categorías (`categorias`) | `contenidos.html`, `categorias.html` |
| `creator-planes` | Planes de formación (`planes`), Grupos (`grupos`) | `planes-formacion.html`, `grupos.html` y flujos hijos (crear/editar/detalle plan o grupo, chat IA grupos) — el mapeo de archivo → tab activo está en `sub-nav.js` (`PAGE_TO_TAB` con prefijo `lms-creator/`). |
| `creator-certificados` | Descarga (`descarga`), Configuración (`configuracion`) | `certificados.html`, `certificados-configuracion.html` |
| `creator-personalizacion` | Universidad corporativa (`universidad-corporativa`), Seguimiento (`seguimiento`) | `personalizacion-u-corporativa.html`, `personalizacion-seguimiento.html` |

Las páginas del Creator suelen cargar **`lms-creator.css`** más el **CSS homónimo** de la página (`contenidos.css`, `planes-formacion.css`, etc.).

#### **Inventario de HTML en `lms-creator/`**

- **LMS + Categorías:** `contenidos.html`, `categorias.html`, `crear-contenido.html` (mismo flujo de creación que el drawer de contenidos, en **página dedicada**; abrir `ubits-colaborador/lms-creator/crear-contenido.html` en el navegador, opcionalmente `#recursos` o `#portada`)
- **Planes y grupos:** `planes-formacion.html`, `grupos.html`, `crear-plan-contenidos.html`, `crear-plan-competencias.html`, `editar-plan-contenidos.html`, `editar-plan-competencias.html`, `detalle-plan.html`, `detalle-plan-competencias.html`, `crear-grupo.html`, `detalle-grupo.html`, `chat-ia-grupos.html`
- **Certificados:** `certificados.html`, `certificados-configuracion.html` (stubs alineados a la plantilla vacía tipo categorías + `header-product`)
- **Personalización UC:** `personalizacion-u-corporativa.html`, `personalizacion-seguimiento.html` (mismo patrón stub donde aplica)

**Vista colaborador** de universidad corporativa (catálogo consumo): sigue en **`aprendizaje/u-corporativa.html`**; la personalización en Creator es la pareja **`personalizacion-u-corporativa.html`**.

#### **Contexto en Markdown (no es UI)**

- `ubits-colaborador/lms-creator/contexto-creacion-contenido.md` — creación de contenidos / formatos (incluye **Implementación en página dedicada** y rutas QA)
- `ubits-colaborador/lms-creator/crear-contenido-plan.md` — plan por fases (drawer vs página, checklist)
- `ubits-colaborador/lms-creator/contexto-planes-formacion-y-grupos.md` — planes, grupos, estados, flujos

**Datos y utilidades:** muchas vistas enlazan **`bd-master/`** y **`general-utils/humanizador-fechas.js`**; el detalle por archivo está en **`bd-master/README.md`**.

### **Componentes de UI:**
- **Button** - Botones de acción (variantes: primary, secondary, tertiary; tamaños: sm, md, lg; iconos opcionales) - **RENDERIZADO: HTML directo**
- **IA-Button** - Botones especiales para casos de IA (variantes: primary con gradiente radial, secondary outlined; tamaños: sm, md, lg; badge siempre presente; pill shape) - **RENDERIZADO: HTML directo**
- **Header Product** - Encabezado de producto con breadcrumb, botones de acción (back, info, AI, secundarios, primario, menú) - **RENDERIZADO: loadHeaderProduct()**
- **Alert** - Notificaciones (tipos: success, info, warning, error; con/sin botón cerrar) - **RENDERIZADO: showAlert() o HTML directo**
- **Accordion** - Bloques expandibles/colapsables (tamaños: xs, sm, md, lg; título obligatorio; numeración y descripción opcionales) - **RENDERIZADO: HTML directo o createAccordion()**
- **Toast** - Notificaciones flotantes (tipos: success, info, warning, error; auto-cierre, pausa en hover) - **RENDERIZADO: showToast()**
- **Input** - Campos de entrada (11 tipos: text, email, password, number, tel, url, select, textarea, search, autocomplete, calendar; tamaños: sm, md, lg; estados: default, hover, focus, invalid, disabled; con iconos, contador, helper text, mandatory/optional, validación manual, scroll infinito automático) - **RENDERIZADO: createInput()**
- **Radio Button** - Opción circular para elegir una entre varias (tamaños: sm, md; sin JS; agrupar con mismo `name`) - **RENDERIZADO: HTML directo.** Requiere importar `radio-button.css` en la página o los radios se ven como nativos.
- **Checkbox** - Casilla de verificación (tamaños: sm, md, lg; variantes: round/cuadrado; sin JS; agrupar con mismo `name` para múltiple selección) - **RENDERIZADO: HTML directo.** Requiere importar `checkbox.css` en la página.
- **Chip** - Elemento compacto para filtros, selecciones o ítems removibles (tamaño xs; icono opcional; botón quitar opcional; estados: default, hover, pressed, active, focus, disabled) - **RENDERIZADO: HTML directo.** Requiere importar `chip.css`.
- **Switch** - Interruptor on/off (pista ovalada + thumb; tamaños: sm, md; estados: off, on, disabled) - **RENDERIZADO: HTML directo.** Requiere importar `switch.css` y `ubits-colors.css`.
- **Card Content** - Cards para contenidos de aprendizaje (11 tipos, 35 competencias, 18 aliados, estados de progreso) - **RENDERIZADO: loadCardContent()**
- **Card Content Compact** - Variante horizontal compacta de Card Content (misma funcionalidad, diseño optimizado para espacios reducidos, siempre horizontal) - **RENDERIZADO: loadCardContentCompact()**
- **Learn content imagen y tráiler** - Bloque de aprendizaje para cargar imagen y/o tráiler en video (estados vacío, hover, error, imagen, preview con play) - **RENDERIZADO: HTML + `learn-content-img-trailer.css`; JS opcional `initLearnContentImgTrailer()`**
- **Paginas creator** - Lista del panel (icono por tipo; 1 clic = activar; 2 clics / lápiz / menú «Cambiar nombre» = edición inline; menú ⋮: mover / eliminar) - **RENDERIZADO: HTML + `paginas-creator.css` + `dropdown-menu.css` + `button.css`; JS `dropdown-menu.js` + `tooltip.js` + `paginas-creator.js` (`paginasCreatorItemHtml`, `initPaginasCreator`, eventos `ubits-paginas-creator-action`, `ubits-paginas-creator-activate`, `ubits-paginas-creator-label-save`)**
- **Resources card** - Tarjeta compacta para elegir el tipo de recurso en el paso Recursos del LMS Creator (12 tipos; estados default, hover, focus y disabled) - **RENDERIZADO: HTML + `resources-card.css`; JS `resources-card.js` (`resourcesCardHtml`, `RESOURCES_CARD_META`, `RESOURCES_CARD_TYPES_ORDER`)**
- **Resources block** - Panel del paso Recursos (selector de 8 tipos o formularios video/PDF/mp4/SCORM/embebido + Cancelar; 15 variantes, incl. `default-error` sin recurso) - **RENDERIZADO: HTML + `resources-block.css` + `resources-card.css` + `button.css` + `input.css` + `dropdown-menu.css`; JS `dropdown-menu.js` + `input.js` + `resources-card.js` + `resources-block.js` (`resourcesBlockHtml`, `RESOURCES_BLOCK_VARIANTS_ORDER`, `initResourcesBlockFields` tras inyectar HTML)**
- **Seccion creator** - Bloque (anida Paginas creator): título siempre **body/md/bold** + fg alto; menú ⋮ **Editar sección** → `ubits-seccion-creator-edit-section` (modal en la pantalla); «Añadir página» si activa - **RENDERIZADO: HTML + `seccion-creator.css` + Paginas creator + `tooltip.js`; JS `seccion-creator.js` (`seccionCreatorHtml`, `initSeccionCreator`, eventos `ubits-seccion-creator-edit-section`, …)**
- **Índice creator** - Panel izquierdo paso Recursos (interruptor de secciones, índice de secciones o lista única sin cabecera de sección, «Añadir sección» si aplica) - **RENDERIZADO: HTML + `switch.css` + `indice-creator.css` + Sección/Páginas creator; JS `indice-creator.js` tras `seccion-creator.js` (`indiceCreatorHtml`, `initIndiceCreator`, eventos `ubits-indice-creator-sections-toggle`, `ubits-indice-creator-add-section`)**
- **Rich text editor** - Editor de texto enriquecido (contenteditable, barra de formato: negrita, listas, alineación, imagen, enlace, etc.) - **RENDERIZADO: HTML + `rich-text-editor.css` + `initRichTextEditor()` / `initAllRichTextEditors()`**
- **Carousel Contents** - Carruseles de contenido (navegación horizontal, flechas, responsive) - **RENDERIZADO: loadCarouselContents()**
- **Status Tag** - Etiquetas de estado (tipos: success, info, warning, error, neutral; tamaños: xs, sm, md, lg; iconos opcionales izquierda/derecha) - **RENDERIZADO: HTML directo**
- **Stepper** - Indicador de pasos de un flujo (horizontal, compacto, título bajo el círculo, combinación compacta, vertical colapsable clásico o **vertical rail creator** alineado al Sidebar contenidos LMS) - **RENDERIZADO: HTML directo**; demo con clic opcional vía `initStepper()`; colapso vertical con `wireStepperVerticalCollapse()` en **stepper.js**. **CSS:** `stepper.css`. **Vertical clásico:** `button.css`, `tooltip.css`, `tooltip.js`. **Rail creator:** `styles.css` (`.nav-button`) + tooltip.
- **Badge Tag** - Badge tipo pill con punto de color o icono (outlined/filled; success, info, warning, error; sm, md, lg; normalmente punto, opcionalmente icono FontAwesome) - **RENDERIZADO: HTML directo**
- **Tab** - Tabs de navegación (estados: active, inactive; tamaños: xs, sm, md, lg; variantes: con texto, icon-only; iconos opcionales) - **RENDERIZADO: HTML directo**
- **Empty State** - Estados vacíos (icono, título, descripción, botones opcionales; tamaños de icono: sm, md, lg; casos de uso: búsqueda sin resultados, contenido vacío, estados iniciales) - **RENDERIZADO: loadEmptyState()**
- **Paginator** - Paginación de resultados (navegación por páginas, items por página, callbacks de cambio) - **RENDERIZADO: loadPaginator()**
- **Popover** - Panel flotante contextual (título, cuerpo, acciones; colita opcional como Tooltip; lado + alineación: 12 combinaciones; `noArrow` o sin ancla = sin flecha; cierre con Escape y clic fuera) - **RENDERIZADO: openPopover() / closePopover()**
- **Submenu** - Panel flotante tipo submenú/flyout (sin colita): posicionamiento (top/bottom/left/right) + alineación (inicio/centro/fin), clamp al viewport, cierre con clic fuera o Escape; título opcional; variantes dark (default) y light - **RENDERIZADO: openSubmenu() / closeSubmenu()**
- **Coachmark** - Product tour (máscara + spotlight, texto del paso con Popover, pasos y navegación; `UBITS_COACHMARK.start` / `close`) - **RENDERIZADO: coachmark.js** (requiere `popover.js` + `button.css`)
- **Study Chat** - Chat de estudio con IA (interfaz especializada para aprendizaje) - **RENDERIZADO: loadStudyChat()**
- **Avatar** - Avatar de usuario (tamaños, estados) - **RENDERIZADO: HTML directo**
- **Calendar** - Selector de fechas (usado también por Input type calendar) - **RENDERIZADO: componente interno / HTML**
- **Drawer** - Panel lateral deslizante - **RENDERIZADO: JS del componente**
- **Dropdown Menu** - Menú desplegable (usado por Input select, Paginator, etc.) - **RENDERIZADO: getDropdownMenuHtml() + openDropdownMenu() / closeDropdownMenu()**
- **Loader** - Indicador de carga (spinner) - **RENDERIZADO: HTML directo**
- **Modal** - Diálogo modal - **RENDERIZADO: JS del componente**
- **Table** - Tablas de datos - **RENDERIZADO: HTML directo**
- **Tooltip** - Tooltips - **RENDERIZADO: HTML/JS del componente**

### **🔧 REQUISITOS DE RENDERIZADO:**
Todos los componentes UBITS requieren imports obligatorios:

```html
<!-- CSS OBLIGATORIO para cada componente usado -->
<!-- NOTA: Rutas relativas desde subcarpetas (ubits-admin/*, ubits-colaborador/*) -->
<link rel="stylesheet" href="../../components/button.css">
<link rel="stylesheet" href="../../components/ia-button.css">
<link rel="stylesheet" href="../../components/header-product.css">
<link rel="stylesheet" href="../../components/alert.css">
<link rel="stylesheet" href="../../components/accordion.css">
<link rel="stylesheet" href="../../components/toast.css">
<link rel="stylesheet" href="../../components/input.css">
<link rel="stylesheet" href="../../components/radio-button.css">
<link rel="stylesheet" href="../../components/checkbox.css">
<link rel="stylesheet" href="../../components/chip.css">
<link rel="stylesheet" href="../../components/switch.css">
<link rel="stylesheet" href="../../components/card-content.css">
<link rel="stylesheet" href="../../components/card-content-compact.css">
<link rel="stylesheet" href="../../components/carousel-contents.css">
<link rel="stylesheet" href="../../components/status-tag.css">
<link rel="stylesheet" href="../../components/stepper.css">
<link rel="stylesheet" href="../../components/badge-tag.css">
<link rel="stylesheet" href="../../components/tab.css">
<link rel="stylesheet" href="../../components/empty-state.css">
<link rel="stylesheet" href="../../components/paginator.css">
<link rel="stylesheet" href="../../components/popover.css">
<link rel="stylesheet" href="../../components/study-chat.css">
<link rel="stylesheet" href="../../components/floating-menu.css">
<link rel="stylesheet" href="../../components/profile-menu.css">
<link rel="stylesheet" href="../../components/sidebar.css">
<link rel="stylesheet" href="../../components/sidebar-contenidos-lms.css">
<link rel="stylesheet" href="../../components/sub-nav.css">
<link rel="stylesheet" href="../../components/tab-bar.css">
<link rel="stylesheet" href="../../components/avatar.css">
<link rel="stylesheet" href="../../components/calendar.css">
<link rel="stylesheet" href="../../components/drawer.css">
<link rel="stylesheet" href="../../components/dropdown-menu.css">
<link rel="stylesheet" href="../../components/loader.css">
<link rel="stylesheet" href="../../components/modal.css">
<link rel="stylesheet" href="../../components/table.css">
<link rel="stylesheet" href="../../components/tooltip.css">

<!-- JavaScript OBLIGATORIO para componentes dinámicos -->
<script src="../../components/header-product.js"></script>
<script src="../../components/alert.js"></script>
<script src="../../components/accordion.js"></script>
<script src="../../components/toast.js"></script>
<script src="../../components/input.js"></script>
<script src="../../components/card-content.js"></script>
<script src="../../components/card-content-compact.js"></script>
<script src="../../components/carousel-contents.js"></script>
<script src="../../components/empty-state.js"></script>
<script src="../../components/paginator.js"></script>
<script src="../../components/popover.js"></script>
<script src="../../components/study-chat.js"></script>
<script src="../../components/floating-menu.js"></script>
<script src="../../components/profile-menu.js"></script>
<script src="../../components/sidebar.js"></script>
<script src="../../components/sidebar-contenidos-lms.js"></script>
<script src="../../components/sub-nav.js"></script>
<script src="../../components/tab-bar.js"></script>
<script src="../../components/calendar.js"></script>
<script src="../../components/dropdown-menu.js"></script>
<script src="../../components/drawer.js"></script>
<script src="../../components/modal.js"></script>
<script src="../../components/stepper.js"></script>
<script src="../../components/tooltip.js"></script>

<!-- Base UBITS SIEMPRE REQUERIDA -->
<link rel="stylesheet" href="../../general-styles/ubits-colors.css">
<link rel="stylesheet" href="../../general-styles/ubits-typography.css">
<link rel="stylesheet" href="../../general-styles/fontawesome-icons.css">
<link rel="stylesheet" href="../../general-styles/styles.css">
```

### **🚨 PROBLEMAS COMUNES CON COMPONENTES:**

#### **Button Component - Errores Frecuentes:**
```html
<!-- ❌ INCORRECTO - Botones sin estilos -->
<button class="my-custom-button">Texto</button>
<button class="btn btn-primary">Texto</button>

<!-- ❌ INCORRECTO - Clases inventadas -->
<button class="ubits-button ubits-button--primary">
    <i class="ubits-button__icon far fa-check"></i>
    <span class="ubits-button__text">Texto</span>
</button>

<!-- ✅ CORRECTO - Estructura UBITS oficial -->
<button class="ubits-button ubits-button--primary ubits-button--md">
    <i class="far fa-check"></i>
    <span>Texto</span>
</button>
```

**REGLAS CRÍTICAS PARA BUTTONS:**
- ❌ **NUNCA crear botones custom** cuando existe `ubits-button`
- ❌ **NUNCA usar clases inventadas** como `ubits-button__icon`
- ✅ **SIEMPRE importar** `components/button.css` y `fontawesome-icons.css`
- ✅ **SIEMPRE usar estructura oficial** UBITS

### **📚 Componentes de documentación (solo para páginas de documentación):**
- **Docs Sidebar** - Navegación para páginas de documentación (ej: `button.html`, `alert.html`, `empty-state.html`). **NO usar en páginas de producto** (ej: `u-corporativa.html`, `catalogo.html`, etc.)

## 🎯 **LOS 3 GRANDES ENTREGABLES DE UBITS PLAYGROUND**

### **1. PÁGINAS PLANTILLA (Templates Listos para Usar)**

#### **🏠 Páginas Base:**
- **`index.html`** - Página principal (se deploya como homepage - 1 sección, ubicada en raíz)
- **`documentacion/plantilla-ubits.html`** - Template base para crear nuevas páginas (1 sección)

#### **🎓 Módulo de Aprendizaje (ubits-colaborador/aprendizaje/):**
- **`home-learn.html`** - Dashboard de aprendizaje (9 secciones)
- **`catalogo.html`** - Catálogo de contenidos (2 secciones)
- **`u-corporativa.html`** - Universidad corporativa (3 secciones)
- **`zona-estudio.html`** - Zona de estudio (2 secciones con tabs)
- **`modo-estudio-ia.html`** - Modo de estudio con IA

#### **📊 Módulo de Diagnóstico (ubits-colaborador/diagnostico/):**
- **`diagnostico.html`** - Página de diagnóstico (1 sección)

#### **📈 Módulo de Desempeño (ubits-colaborador/desempeno/):**
- **`evaluaciones-360.html`** - Evaluaciones 360 (1 sección)
- **`objetivos.html`** - Objetivos (1 sección)
- **`metricas.html`** - Métricas (1 sección)
- **`reportes.html`** - Reportes (1 sección)

#### **📋 Módulo de Encuestas (ubits-colaborador/encuestas/):**
- **`encuestas.html`** - Encuestas (1 sección)

#### **👥 Módulo de Reclutamiento (ubits-colaborador/reclutamiento/):**
- **`reclutamiento.html`** - Reclutamiento (1 sección, sin SubNav)

#### **📝 Módulo de Planes y Tareas (ubits-colaborador/tareas/):**
- **`planes.html`** - Planes (1 sección)
- **`tareas.html`** - Tareas (1 sección)

#### **👤 Perfil y AI (ubits-colaborador/):**
- **`perfil/profile.html`** - Perfil/Portal del colaborador
- **`ia-para-hr/ia-para-hr.html`** - IA para HR (página en blanco basada en plantilla)
- **`ubits-ai/ubits-ai.html`** - Redirección a `ia-para-hr/ia-para-hr.html` (compatibilidad con enlaces antiguos)

#### **⚙️ Módulo de Administración (ubits-admin/):**
- **`inicio/admin.html`** - Dashboard de administración (1 sección, sin SubNav)

**Módulo Empresa (ubits-admin/empresa/, SubNav: `empresa`):**
- **`gestion-de-usuarios.html`** - Gestión de usuarios (con header-product)
- **`organigrama.html`** - Organigrama (con header-product)
- **`datos-de-empresa.html`** - Datos de empresa (con header-product)
- **`personalizacion.html`** - Personalización (con header-product)
- **`roles-y-permisos.html`** - Roles y permisos (con header-product)
- **`comunicaciones.html`** - Comunicaciones (con header-product)

**Módulo Admin Aprendizaje (ubits-admin/aprendizaje/, SubNav: `admin-aprendizaje`):**
- **`planes-formacion.html`** - Planes de formación (con header-product)
- **`admin-u-corporativa.html`** - Universidad corporativa (con header-product)
- **`admin-certificados.html`** - Certificados (con header-product)
- **`seguimiento.html`** - Seguimiento (con header-product)

**Módulo Admin Desempeño (ubits-admin/desempeno/, SubNav: `admin-desempeno`):**
- **`admin-360.html`** - Evaluaciones 360 (con header-product)
- **`admin-objetivos.html`** - Objetivos (con header-product)
- **`admin-matriz-talento.html`** - Matriz de Talento (con header-product)

**Otros módulos admin:**
- **`diagnostico/admin-diagnostico.html`** - Administración de diagnóstico (SubNav: `admin-diagnostico`)
- **`encuestas/admin-encuestas.html`** - Administración de encuestas (SubNav: `admin-encuestas`)
- **`otros/admin-api.html`** - Gestión de API (sin SubNav, con header-product)
- **`otros/admin-help-center.html`** - Centro de ayuda (sin SubNav, con header-product)

### **2. PÁGINAS DE DOCUMENTACIÓN (Sistema de Componentes) - documentacion/**

#### ** Página Principal:**
- **`documentacion/documentacion.html`** - Home de documentación

#### **📖 Documentación de Componentes (documentacion/componentes/):**
- **`documentacion/componentes.html`** - Introducción y bienvenida a los componentes UBITS
- **`documentacion/componentes/sidebar.html`** - Documentación del componente Sidebar
- **`documentacion/componentes/sidebar-contenidos-lms.html`** - Documentación del Sidebar contenidos LMS (LMS Creator)
- **`documentacion/componentes/subnav.html`** - Documentación del componente SubNav
- **`documentacion/componentes/tab-bar.html`** - Documentación del componente TabBar
- **`documentacion/componentes/button.html`** - Documentación del componente Button
- **`documentacion/componentes/ia-button.html`** - Documentación del componente IA-Button
- **`documentacion/componentes/header-product.html`** - Documentación del componente Header Product
- **`documentacion/componentes/alert.html`** - Documentación del componente Alert
- **`documentacion/componentes/accordion.html`** - Documentación del componente Accordion
- **`documentacion/componentes/toast.html`** - Documentación del componente Toast
- **`documentacion/componentes/input.html`** - Documentación del componente Input
- **`documentacion/componentes/radio-button.html`** - Documentación del componente Radio Button
- **`documentacion/componentes/checkbox.html`** - Documentación del componente Checkbox
- **`documentacion/componentes/switch.html`** - Documentación del componente Switch
- **`documentacion/componentes/card-content.html`** - Documentación del componente Card Content
- **`documentacion/componentes/card-content-compact.html`** - Documentación del componente Card Content Compact
- **`documentacion/componentes/learn-content-img-trailer.html`** - Documentación Learn content imagen y tráiler (Figma Learn-Components)
- **`documentacion/componentes/indice-creator.html`** - Documentación Índice creator (Figma Learn-Components 242:5621)
- **`documentacion/componentes/paginas-creator.html`** - Documentación Paginas creator (Figma Learn-Components)
- **`documentacion/componentes/resources-card.html`** - Documentación Resources card (Figma Learn-Components 247:5165)
- **`documentacion/componentes/resources-block.html`** - Documentación Resources block (Figma Learn-Components 248:6265)
- **`documentacion/componentes/seccion-creator.html`** - Documentación Seccion creator (Figma Learn-Components 242:5368)
- **`documentacion/componentes/rich-text-editor.html`** - Documentación Rich text editor (Creator v3)
- **`documentacion/componentes/status-tag.html`** - Documentación del componente Status Tag
- **`documentacion/componentes/stepper.html`** - Documentación del componente Stepper
- **`documentacion/componentes/switch.html`** - Documentación del componente Switch
- **`documentacion/componentes/badge-tag.html`** - Documentación del componente Badge Tag
- **`documentacion/componentes/tab.html`** - Documentación del componente Tab
- **`documentacion/componentes/empty-state.html`** - Documentación del componente Empty State
- **`documentacion/componentes/paginator.html`** - Documentación del componente Paginator
- **`documentacion/componentes/avatar.html`** - Documentación del componente Avatar
- **`documentacion/componentes/calendar.html`** - Documentación del componente Calendar
- **`documentacion/componentes/drawer.html`** - Documentación del componente Drawer
- **`documentacion/componentes/dropdown-menu.html`** - Documentación del componente Dropdown Menu
- **`documentacion/componentes/loader.html`** - Documentación del componente Loader
- **`documentacion/componentes/modal.html`** - Documentación del componente Modal
- **`documentacion/componentes/popover.html`** - Documentación del componente Popover
- **`documentacion/componentes/submenu.html`** - Documentación del componente Submenu
- **`documentacion/componentes/coachmark.html`** - Documentación del componente Coachmark (product tour)
- **`documentacion/componentes/table.html`** - Documentación del componente Table
- **`documentacion/componentes/tooltip.html`** - Documentación del componente Tooltip

#### **🎨 Guías de Diseño (documentacion/guias/):**
- **`documentacion/guias/colores.html`** - Guía de colores UBITS
- **`documentacion/guias/tipografia.html`** - Guía de tipografía UBITS
- **`documentacion/guias/iconos.html`** - Galería de iconos FontAwesome

#### ** Herramientas de Documentación:**
- **`documentacion/guia-prompts.html`** - Prompts para personalización con Cursor AI
- **`documentacion/validador-ubits.html`** - Herramienta drag & drop que verifica tokens UBITS, tipografía y componentes, genera prompts para Cursor AI y otorga puntuación
- **`documentacion/plantilla-ubits.html`** - Template base para crear nuevas páginas

### **3. ✅ VALIDADOR (Control de Calidad Automático)**
- **`documentacion/validador-ubits.html`** - Herramienta drag & drop que verifica tokens UBITS, tipografía y componentes, genera prompts para Cursor AI y otorga puntuación

---

## 🛠️ **HERRAMIENTAS DE SOPORTE (Lo que hace que los 3 grandes funcionen)**

### **🧩 Estructura del proyecto (NUEVA ORGANIZACIÓN):**
```
├── 📁 general-styles/         # Estilos base del sistema (ver abajo qué contiene cada archivo)
│   ├── ubits-colors.css       # Tokens de color UBITS oficiales
│   ├── ubits-typography.css   # Clases de tipografía UBITS oficiales
│   ├── ubits-spacing-tokens.css # Tokens de espaciado, padding, gap, border-radius y size
│   ├── fontawesome-icons.css  # Iconos FontAwesome
│   └── styles.css             # Estilos globales compartidos (importa ubits-spacing-tokens)
├── 📁 general-utils/          # Utilidades JavaScript transversales (no son componentes UBITS)
│   └── humanizador-fechas.js   # Fechas humanizadas y estado de planes por fechas (window.*)
├── 📁 bd-master/              # “Bases de datos” de simulación del playground (JS en window, sin fetch)
│   ├── README.md              # Inventario, mapa por página y relaciones entre archivos
│   ├── bd-master-competencias.js, bd-master-habilidades.js, bd-master-colaboradores.js, …
│   ├── bd-contenidos-ubits.js, bd-contenidos-fiqsha.js
│   └── bd-tareas-y-planes.js  # Tareas, planes, seguimiento (usa colaboradores del maestro)
├── 📁 components/             # Componentes reutilizables UBITS
│   ├── sub-nav.css + sub-nav.js
│   ├── sidebar.css + sidebar.js
│   ├── sidebar-contenidos-lms.css + sidebar-contenidos-lms.js
│   ├── tab-bar.css + tab-bar.js
│   ├── floating-menu.css + floating-menu.js
│   ├── profile-menu.css + profile-menu.js
│   ├── button.css + button.js
│   ├── ia-button.css + ia-button.js
│   ├── header-product.css + header-product.js
│   ├── alert.css + alert.js
│   ├── accordion.css + accordion.js
│   ├── toast.css + toast.js
│   ├── input.css + input.js
│   ├── card-content.css + card-content.js
│   ├── card-content-compact.css + card-content-compact.js
│   ├── carousel-contents.css + carousel-contents.js
│   ├── status-tag.css
│   ├── radio-button.css
│   ├── checkbox.css
│   ├── chip.css
│   ├── badge-tag.css
│   ├── tab.css + tab.js
│   ├── empty-state.css + empty-state.js
│   ├── paginator.css + paginator.js
│   ├── study-chat.css + study-chat.js
│   ├── avatar.css + avatar.js
│   ├── calendar.css + calendar.js
│   ├── drawer.css + drawer.js
│   ├── dropdown-menu.css + dropdown-menu.js
│   ├── loader.css + loader.js
│   ├── modal.css + modal.js
│   ├── table.css
│   ├── tooltip.css + tooltip.js
├── 📁 ubits-admin/           # Módulo de administración
│   ├── inicio/
│   ├── empresa/                         # Módulo — SubNav empresa
│   │   ├── Gestión de usuarios
│   │   ├── Organigrama
│   │   ├── Datos de empresa
│   │   ├── Personalización
│   │   ├── Roles y permisos
│   │   └── Comunicaciones
│   ├── aprendizaje/                     # Módulo — SubNav admin-aprendizaje
│   │   ├── Planes de formación
│   │   ├── Universidad corporativa
│   │   ├── Certificados
│   │   └── Seguimiento
│   ├── diagnostico/                     # Módulo — SubNav admin-diagnostico
│   │   └── Diagnóstico
│   ├── desempeno/                       # Módulo — SubNav admin-desempeño
│   │   ├── Evaluaciones 360
│   │   ├── Objetivos
│   │   └── Matriz de Talento
│   ├── encuestas/                       # Módulo — SubNav admin-encuestas
│   │   └── Encuestas
│   └── otros/
├── 📁 ubits-colaborador/     # Módulo de colaborador
│   ├── inicio/
│   ├── aprendizaje/                    # Módulo — SubNav aprendizaje
│   │   ├── Inicio
│   │   ├── Modo estudio IA
│   │   ├── Catálogo
│   │   ├── U. Corporativa
│   │   └── Zona de estudio
│   ├── lms-creator/                    # Producto LMS Creator (carpeta del módulo)
│   │   ├── LMS Creator                 # SubNav creator-lms
│   │   │   ├── Contenidos
│   │   │   └── Categorías
│   │   ├── Planes de formación         # SubNav creator-planes
│   │   │   ├── Planes
│   │   │   └── Grupos
│   │   ├── Certificados                # SubNav creator-certificados
│   │   │   ├── Descarga
│   │   │   └── Configuración
│   │   └── Personalización             # SubNav creator-personalizacion
│   │       ├── Universidad corporativa
│   │       └── Seguimiento
│   ├── diagnostico/                     # Módulo — SubNav diagnostico
│   │   └── Diagnóstico
│   ├── desempeno/                       # Módulo — SubNav desempeno
│   │   ├── Evaluaciones 360
│   │   ├── Objetivos
│   │   ├── Métricas
│   │   └── Reportes
│   ├── encuestas/                       # Módulo — SubNav encuestas
│   │   └── Encuestas
│   ├── reclutamiento/                   # Módulo — SubNav reclutamiento
│   │   └── Reclutamiento
│   ├── tareas/                         # Módulo — SubNav tareas
│   │   ├── Tareas
│   │   ├── Planes
│   │   ├── Plantillas
│   │   └── Seguimiento
│   ├── ia-para-hr/                      # Módulo — sin SubNav (solo título)
│   ├── ubits-ai/
│   └── perfil/
├── 📁 documentacion/         # Sistema de documentación
│   ├── componentes.html      # Lista de componentes
│   ├── componentes/          # Documentación de cada componente
│   ├── guias/                # Guías de diseño (colores, tipografía, iconos)
│   ├── guia-prompts.html     # Prompts para Cursor AI
│   ├── validador-ubits.html  # Validador automático
│   └── plantilla-ubits.html  # Template base para nuevas páginas
├── 📁 docs/                  # Sistema de documentación (solo para páginas *.html de documentación)
│   ├── docs-sidebar.css + docs-sidebar.js
│   └── docstyles.css         # Estilos específicos de documentación
└── 📁 images/                # Recursos visuales
    ├── cards-learn/          # Imágenes para cards de aprendizaje (85+ imágenes)
    ├── Favicons/             # Logos de proveedores (18 proveedores)
    ├── vertical-cards/       # Imágenes verticales para libros (16 imágenes)
    ├── academias/            # Imágenes de academias (5 imágenes)
    ├── imagenes competencias/ # Imágenes de competencias (35 imágenes)
    └── empty-states/         # Estados vacíos (2 SVG)
```

*(En `lms-creator/` el árbol anterior resume **módulos y pestañas** del producto; hay más archivos en disco — flujos crear/editar/detalle, drawers, `lms-creator.css`, `contexto-*.md` —; ver [LMS Creator (producto aparte del colaborador)](#lms-creator-producto-aparte-del-colaborador) y `bd-master/README.md`.)*

### **📁 Contenido de `general-styles/` (qué encuentra en cada archivo):**
| Archivo | Contenido |
|--------|------------|
| **`ubits-colors.css`** | Tokens de color UBITS: fondos (`--ubits-bg-1`, `--ubits-bg-2`, …), texto (`--ubits-fg-1-high`, `--ubits-fg-1-medium`), bordes, botones, feedback, modo claro/oscuro. **Obligatorio** en todas las páginas. |
| **`ubits-typography.css`** | Clases de tipografía oficiales: display (d1–d4), headings (h1, h2), body (md/sm, regular/semibold/bold). **Obligatorio** para todo texto. |
| **`ubits-spacing-tokens.css`** | Tokens de espaciado: `--space-*` (0–96px), `--padding-xs/sm/md/lg/…`, `--gap-*`, `--border-radius-*`, `--size-*`. Usado por `styles.css` y componentes. |
| **`fontawesome-icons.css`** | Definición de iconos FontAwesome (clases `far`, `fas`, etc.). **Obligatorio** cuando uses componentes con iconos. |
| **`styles.css`** | Estilos globales: reset, body, scrollbar, layout (dashboard-container, content-area), import de `ubits-spacing-tokens.css`. Cargar en todas las páginas. |

### **📁 `bd-master/` — datos de simulación (playground)**

Carpeta de **scripts que exponen datos en `window`** (competencias, habilidades, colaboradores, catálogos de contenidos, tareas/planes, etc.). **No hay JSON externo ni `fetch`**: todo funciona abriendo HTML con `file://`, pensado para prototipos y demos.

- **Documentación completa:** [`bd-master/README.md`](bd-master/README.md) — inventario de archivos, variables globales, mapa de qué página carga qué, y relaciones (p. ej. contenidos → niveles, aliados, competencias).
- **Helpers fuera de esta carpeta:** algunas vistas (p. ej. LMS Creator) cargan scripts en `ubits-colaborador/lms-creator/` que **leen** estos maestros y arman listas para drawers (`catalogo-contenidos-drawer.js`, `catalogo-competencias-drawer.js`); esos helpers **no** son BD: solo transforman lo que ya está en `bd-master/`.

**Ruta típica desde HTML en subcarpetas:** `../../bd-master/nombre-archivo.js`.

### **📁 `general-utils/` — JavaScript transversal**

Scripts **reutilizables** que no son componentes UBITS ni datos de demo. Cualquier página puede enlazarlos con rutas relativas.

| Archivo | Rol |
|--------|-----|
| **`humanizador-fechas.js`** | Expone en `window` funciones como `formatDateHumanized`, `formatDateDDMmmAAAA`, `getEstadoFromFechas`, `getEstadoAlTerminarProcesando`, `humanizeTableDates` (fechas tipo “Hace 2 h”, “15 ene 2025”, y estado Planeado/Vigente/No vigente según fechas). Usado por vistas LMS Creator (`detalle-plan*.html`, `planes-formacion.html`, etc.). |

**Ruta típica desde `ubits-colaborador/*/*/`:** `../../general-utils/humanizador-fechas.js`.

### **📁 Nueva organización de archivos:**
- **`general-styles/`** - Estilos base compartidos (tokens, tipografía, espaciado, estilos globales)
- **`general-utils/`** - Utilidades JavaScript transversales (p. ej. humanización de fechas)
- **`bd-master/`** - Datos de simulación del playground (JS en `window`; ver `bd-master/README.md`)
- **`components/`** - Todos los componentes UBITS reutilizables
- **`ubits-admin/`** - Páginas del módulo de administración organizadas por subcarpetas
- **`ubits-colaborador/`** - Páginas del módulo de colaborador organizadas por subcarpetas
- **`documentacion/`** - Sistema de documentación completo
- **`docs/`** - Componentes de documentación (docs-sidebar, docstyles)
- **`images/`** - Todos los recursos visuales del proyecto

### **📄 Estructura HTML + CSS por página (OBLIGATORIO):**

**🚨 REGLA CRÍTICA:** Cada página HTML debe tener su archivo CSS correspondiente separado.

#### **Estructura correcta:**
```
ubits-colaborador/
├── aprendizaje/
│   ├── home-learn.html      ← Página HTML
│   ├── home-learn.css       ← Estilos específicos de la página
│   ├── catalogo.html
│   ├── catalogo.css
│   └── ...
├── desempeno/
│   ├── objetivos.html
│   ├── objetivos.css
│   └── ...
```

#### **Cómo crear una nueva página:**

1. **Ubicar en la carpeta correcta** según el módulo:
   - `ubits-colaborador/aprendizaje/` - Páginas de aprendizaje
   - `ubits-colaborador/desempeno/` - Páginas de desempeño
   - `ubits-admin/empresa/` - Páginas de administración de empresa
   - etc.

2. **Crear ambos archivos:**
   - `mi-pagina.html` - Estructura HTML
   - `mi-pagina.css` - Estilos específicos de la página

3. **Importar estilos generales en el HTML:**
```html
<!-- Estilos base UBITS (OBLIGATORIO) -->
<link rel="stylesheet" href="../../general-styles/ubits-colors.css">
<link rel="stylesheet" href="../../general-styles/styles.css">
<link rel="stylesheet" href="../../general-styles/fontawesome-icons.css">
<link rel="stylesheet" href="../../general-styles/ubits-typography.css">

<!-- Componentes que uses -->
<link rel="stylesheet" href="../../components/sidebar.css">
<link rel="stylesheet" href="../../components/sidebar-contenidos-lms.css">
<link rel="stylesheet" href="../../components/sub-nav.css">
<!-- ... otros componentes -->

<!-- Estilos específicos de la página (AL FINAL) -->
<link rel="stylesheet" href="./mi-pagina.css">
```

4. **En el CSS de la página:**
```css
/* ========================================
   ESTILOS ESPECÍFICOS PARA mi-pagina
   ======================================== */

/* Solo estilos únicos de esta página */
.mi-widget-especial {
    /* ... */
}
```

#### **❌ NUNCA hacer:**
- Poner estilos en `<style>` tags dentro del HTML
- Crear páginas sin su CSS correspondiente
- Mezclar estilos de diferentes páginas en un solo CSS
- Modificar `general-styles/styles.css` para estilos de una página específica

#### **✅ SIEMPRE hacer:**
- Separar HTML y CSS en archivos independientes
- Usar rutas relativas correctas (`../../` desde subcarpetas)
- Importar estilos generales antes que los específicos
- Nombrar el CSS igual que el HTML (ej: `catalogo.html` → `catalogo.css`)

## 🎯 Casos de uso reales

- **Product Managers:** Crear mockups de nuevas funcionalidades
- **Diseñadores:** Prototipar interfaces sin código
- **Equipos de producto:** Validar ideas con usuarios reales
- **Consultores:** Mostrar propuestas de interfaz a clientes
- **Desarrolladores:** Crear MVPs visuales rápidamente

## 🎨 Valor diferencial del proyecto

> **🚨 REGLA FUNDAMENTAL: SIEMPRE usar tokens de color UBITS y tipografía UBITS**

**Este es el valor diferencial del template.** Cualquiera puede usar Cursor AI, pero la ventaja de esta plantilla es que garantiza que todas las interfaces creadas mantengan la identidad visual oficial de UBITS con:

- **Tokens de color** que cambian automáticamente entre modo claro y oscuro
- **Tipografía oficial** UBITS con todas las variantes
- **Iconos FontAwesome** integrados y organizados
- **Consistencia visual** en todas las experiencias creadas

## 🤖 Instrucciones para Cursor AI

### **📋 Reglas Importantes**

#### ✅ **SIEMPRE Hacer (OBLIGATORIO):**
1. **📖 LEER LA DOCUMENTACIÓN DEL COMPONENTE** - Antes de implementar cualquier componente, lee su página de documentación (ej: `button.html`, `alert.html`, `empty-state.html`, `paginator.html`) para entender cómo usarlo correctamente, casos de uso comunes y problemas conocidos
2. **Usar tokens de color UBITS** - `var(--ubits-fg-1-high)`, `var(--ubits-bg-1)`, etc. NUNCA colores hardcodeados
3. **Usar la tipografía UBITS** - Aplicar clases como `ubits-h1`, `ubits-body-md-regular`
4. **Usar componentes existentes** - Revisar `componentes.html` antes de crear custom
5. **Usar `box-sizing: border-box`** - Para cálculos correctos de tamaño
6. **Usar iconos outline** - Usar `far` (FontAwesome Regular) para iconos outline
7. **Importar `ubits-colors.css`** - En cualquier nuevo archivo HTML que crees

#### ❌ **EVITAR:**
1. **Usar colores hardcodeados** - SIEMPRE usar tokens UBITS (`var(--ubits-...)`)
2. **Crear componentes custom** - Cuando existen componentes UBITS
3. **Usar headings h3, h4, h5, h6** - Solo existen h1 y h2, usar `ubits-body-md-bold` para subtítulos
4. **Crear interfaces sin tokens** - Esto elimina el valor diferencial del proyecto

## 🎨 Sistema de tokens UBITS

### **Tokens de color (OBLIGATORIO):**
```css
/* NUNCA usar colores hardcodeados, SIEMPRE usar estos tokens: */
var(--ubits-fg-1-high)        /* Texto principal */
var(--ubits-fg-1-medium)      /* Texto secundario */
var(--ubits-bg-1)             /* Fondo principal */
var(--ubits-bg-2)             /* Fondo secundario */
var(--ubits-accent-brand)     /* Azul UBITS */
var(--ubits-border-1)         /* Bordes */
```

### **Tipografía UBITS:**
```css
/* Display */
ubits-display-d1-regular, ubits-display-d1-semibold, ubits-display-d1-bold
ubits-display-d2-regular, ubits-display-d2-semibold, ubits-display-d2-bold
ubits-display-d3-regular, ubits-display-d3-semibold, ubits-display-d3-bold
ubits-display-d4-regular, ubits-display-d4-semibold, ubits-display-d4-bold

/* Headings (SOLO ESTOS DOS EXISTEN) */
ubits-heading-h1, ubits-heading-h2

/* Body */
ubits-body-md-regular, ubits-body-md-semibold, ubits-body-md-bold
ubits-body-sm-regular, ubits-body-sm-semibold, ubits-body-sm-bold

/* Para subtítulos usar: */
ubits-body-md-bold, ubits-body-sm-bold
```

### **Importar tokens (OBLIGATORIO en nuevos archivos):**
```html
<!-- Desde subcarpetas (ubits-admin/*, ubits-colaborador/*) -->
<link rel="stylesheet" href="../../general-styles/ubits-colors.css">
<link rel="stylesheet" href="../../general-styles/ubits-typography.css">
<link rel="stylesheet" href="../../general-styles/fontawesome-icons.css">
<link rel="stylesheet" href="../../general-styles/styles.css">

<!-- Desde la raíz del proyecto -->
<link rel="stylesheet" href="general-styles/ubits-colors.css">
<link rel="stylesheet" href="general-styles/ubits-typography.css">
<link rel="stylesheet" href="general-styles/fontawesome-icons.css">
<link rel="stylesheet" href="general-styles/styles.css">
```

## 🚀 Ejemplos de uso

### **Usar componentes existentes:**
```html
<!-- SubNav -->
<div id="top-nav-container"></div>
<script>
loadSubNav('top-nav-container', 'template');
</script>

<!-- Sidebar - Variante default -->
<div id="sidebar-container"></div>
<script>
loadSidebar('default', 'aprendizaje'); // Activa aprendizaje
</script>

<!-- Sidebar - Variante admin -->
<div id="sidebar-container"></div>
<script>
loadSidebar('admin', 'inicio'); // Activa inicio en sidebar admin
</script>

<!-- Button -->
<button class="ubits-button ubits-button--primary ubits-button--md">
    <i class="far fa-check"></i>
    <span>Botón primario</span>
</button>

<!-- IA-Button -->
<button class="ubits-ia-button ubits-ia-button--primary ubits-ia-button--md">
    <i class="far fa-sparkles"></i>
    <span>AI Assistant</span>
    <span class="ubits-ia-button__badge"></span>
</button>

<!-- Alert -->
<div class="ubits-alert ubits-alert--success">
    <div class="ubits-alert__icon">
        <i class="far fa-check-circle"></i>
    </div>
    <div class="ubits-alert__content">
        <div class="ubits-alert__text">Mensaje de éxito</div>
    </div>
    <button class="ubits-alert__close">
        <i class="far fa-times"></i>
    </button>
</div>

<!-- Header Product -->
<div id="header-product-container"></div>
<script>
loadHeaderProduct('header-product-container', {
    productName: 'Nombre del Producto',
    breadcrumbItems: [], // Array vacío para ocultar breadcrumb (versión light)
    aiButton: {
        text: 'AI button',
        onClick: function() {
            console.log('AI button clicked');
        }
    },
    secondaryButtons: [
        { text: 'Button text', icon: 'fa-th', onClick: function() { console.log('Secondary button clicked'); } }
    ],
    primaryButton: {
        text: 'Primary action',
        icon: 'fa-th',
        onClick: function() {
            console.log('Primary button clicked');
        }
    },
    menuButton: {
        onClick: function() {
            console.log('Menu button clicked');
        }
    }
});
</script>

<!-- Card Content -->
<div id="mi-contenedor-cards"></div>
<script>
loadCardContent('mi-contenedor-cards', [
    {
        type: 'Curso',
        title: 'Mi contenido',
        provider: 'UBITS',
        providerLogo: '../../images/Favicons/UBITS.jpg',  // ✅ Rutas relativas desde subcarpetas
        duration: '60 min',
        level: 'Intermedio',
        progress: 75,
        status: 'progress',
        image: '../../images/cards-learn/mi-imagen.jpg',  // ✅ Rutas relativas desde subcarpetas
        competency: 'Product design',
        language: 'Español'
    }
]);
</script>

<!-- Card Content Compact -->
<div id="mi-contenedor-compact"></div>
<script>
loadCardContentCompact('mi-contenedor-compact', [
    {
        type: 'Curso',
        title: 'Mi contenido compacto',
        provider: 'UBITS',
        providerLogo: '../../images/Favicons/UBITS.jpg',  // ✅ Rutas relativas desde subcarpetas
        duration: '60 min',
        level: 'Intermedio',
        progress: 50,
        status: 'progress',
        image: '../../images/cards-learn/mi-imagen.jpg',  // ✅ Rutas relativas desde subcarpetas
        competency: 'Product design',
        language: 'Español'
    }
]);
</script>
```

### **Prompts para Cursor AI:**
```
"Usa el componente Button de UBITS para crear un botón primario con el texto 'Guardar'"
"Agrega un Alert de éxito usando el componente UBITS con el mensaje 'Datos guardados'"
"Implementa el SubNav con la variante 'template' en la página principal"
"Implementa el header-product en esta página con el nombre 'Mi Producto'"
"Crea un catálogo de cursos usando el componente Card Content con diferentes tipos y estados"

"Crea una lista compacta de contenidos usando el componente Card Content Compact en [ubicación]"
```

## 📚 Documentación

- **`documentacion/componentes.html`** - Página principal con todos los componentes disponibles
- **`documentacion/componentes/button.html`** - Documentación del componente Button
- **`documentacion/componentes/ia-button.html`** - Documentación del componente IA-Button
- **`documentacion/componentes/header-product.html`** - Documentación del componente Header Product
- **`documentacion/componentes/alert.html`** - Documentación del componente Alert
- **`documentacion/componentes/accordion.html`** - Documentación del componente Accordion
- **`documentacion/componentes/toast.html`** - Documentación del componente Toast
- **`documentacion/componentes/input.html`** - Documentación del componente Input
- **`documentacion/componentes/radio-button.html`** - Documentación del componente Radio Button
- **`documentacion/componentes/checkbox.html`** - Documentación del componente Checkbox
- **`documentacion/componentes/switch.html`** - Documentación del componente Switch
- **`documentacion/componentes/card-content.html`** - Documentación del componente Card Content
- **`documentacion/componentes/card-content-compact.html`** - Documentación del componente Card Content Compact
- **`documentacion/componentes/learn-content-img-trailer.html`** - Documentación Learn content imagen y tráiler (Figma Learn-Components)
- **`documentacion/componentes/indice-creator.html`** - Documentación Índice creator (Figma Learn-Components 242:5621)
- **`documentacion/componentes/paginas-creator.html`** - Documentación Paginas creator (Figma Learn-Components)
- **`documentacion/componentes/resources-card.html`** - Documentación Resources card (Figma Learn-Components 247:5165)
- **`documentacion/componentes/resources-block.html`** - Documentación Resources block (Figma Learn-Components 248:6265)
- **`documentacion/componentes/seccion-creator.html`** - Documentación Seccion creator (Figma Learn-Components 242:5368)
- **`documentacion/componentes/rich-text-editor.html`** - Documentación Rich text editor (Creator v3)
- **`documentacion/componentes/status-tag.html`** - Documentación del componente Status Tag
- **`documentacion/componentes/stepper.html`** - Documentación del componente Stepper
- **`documentacion/componentes/switch.html`** - Documentación del componente Switch
- **`documentacion/componentes/badge-tag.html`** - Documentación del componente Badge Tag
- **`documentacion/componentes/tab.html`** - Documentación del componente Tab
- **`documentacion/componentes/empty-state.html`** - Documentación del componente Empty State
- **`documentacion/componentes/paginator.html`** - Documentación del componente Paginator
- **`documentacion/componentes/sidebar.html`** - Documentación del componente Sidebar
- **`documentacion/componentes/sidebar-contenidos-lms.html`** - Documentación del Sidebar contenidos LMS (LMS Creator)
- **`documentacion/componentes/subnav.html`** - Documentación del componente SubNav
- **`documentacion/componentes/tab-bar.html`** - Documentación del componente TabBar
- **`documentacion/componentes/avatar.html`** - Documentación del componente Avatar
- **`documentacion/componentes/calendar.html`** - Documentación del componente Calendar
- **`documentacion/componentes/drawer.html`** - Documentación del componente Drawer
- **`documentacion/componentes/dropdown-menu.html`** - Documentación del componente Dropdown Menu
- **`documentacion/componentes/loader.html`** - Documentación del componente Loader
- **`documentacion/componentes/modal.html`** - Documentación del componente Modal
- **`documentacion/componentes/popover.html`** - Documentación del componente Popover
- **`documentacion/componentes/submenu.html`** - Documentación del componente Submenu
- **`documentacion/componentes/coachmark.html`** - Documentación del componente Coachmark (product tour)
- **`documentacion/componentes/table.html`** - Documentación del componente Table
- **`documentacion/componentes/tooltip.html`** - Documentación del componente Tooltip
- **`documentacion/guias/colores.html`** - Guía de colores UBITS
- **`documentacion/guias/tipografia.html`** - Guía de tipografía UBITS
- **`documentacion/guias/iconos.html`** - Galería de iconos FontAwesome
- **`documentacion/validador-ubits.html`** - Validador automático de calidad UBITS

## 🎯 Características principales

### ✅ **Componentes listos para usar:**
- 20+ componentes UBITS completamente funcionales
- Documentación interactiva con ejemplos
- Código listo para copiar y pegar
- Variantes y opciones configurables

### ✅ **Identidad visual UBITS:**
- Tokens de color oficiales
- Tipografía consistente
- Iconos FontAwesome integrados
- Modo claro y oscuro automático

### ✅ **Fácil de personalizar:**
- Componentes modulares
- Código limpio y documentado
- Sin dependencias externas
- Responsive por defecto

### ✅ **Para usuarios no técnicos:**
- Instrucciones claras para Cursor AI
- Prompts listos para usar
- Ejemplos de código
- Guías paso a paso

### ✅ **Estructura modular (NUEVO):**
- Sistema de secciones y widgets fácil de personalizar
- Permite añadir, modificar y reorganizar contenido fácilmente
- Compatible con todas las páginas del template

## 🧩 Estructura modular - Fácil personalización

### **¿Qué es la estructura modular?**

Un sistema inspirado que permite a **cualquier usuario** (Product Managers, Diseñadores, etc.) personalizar páginas fácilmente usando **Cursor AI** con prompts simples.

### **🎯 Cómo funciona:**

#### **Secciones disponibles:**
- **`section-single`** - 1 columna (ancho completo)
- **`section-dual`** - 2 columnas (50% cada una)
- **`section-triple`** - 3 columnas (33% cada una)
- **`section-quad`** - 4 columnas (25% cada una)

#### **Widgets personalizables:**
- Cada widget tiene un **nombre descriptivo** (ej: `widget-dashboard`, `widget-estadisticas`)
- **Altura flexible** usando `<br>` (sin alturas mínimas forzadas)
- **Responsive automático** (columnas se apilan en móvil)
- **Estilos consistentes** con tokens UBITS

### **📝 Ejemplos de prompts que funcionan:**

```
"Añade una section-dual con widget-progreso y widget-estadisticas después de Banner principal"

"Cambia el nombre del widget-contenido a 'Dashboard personal'"

"Añade 5 br al widget-banner para hacerlo más alto"

"Reemplaza la section-single de 'Bienvenida' por una section-triple con widget-cursos, widget-progreso y widget-notificaciones"

"Elimina todas las secciones que están debajo de 'Contenido principal'"
```

### **🎯 Páginas con estructura modular:**

#### **Páginas completas:**
- **`home-learn.html`** - Ejemplo completo con 9 secciones variadas
- **`profile.html`** - Página original que inspiró el sistema

#### **Páginas básicas:**
- **`catalogo.html`** - 2 secciones (Encabezado + Lista competencias)
- **`u-corporativa.html`** - 3 secciones específicas
- **`zona-estudio.html`** - 2 secciones con tabs
- **`index.html`** - 1 sección base
- **`plantilla-ubits.html`** - Template base con estructura

#### **Páginas especializadas:**
- **`diagnostico.html`** - 1 sección enfocada (con header-product)
- **`evaluaciones-360.html`** - Contenido específico 360 (con header-product)
- **`objetivos.html`** - Contenido específico objetivos (con header-product)
- **`metricas.html`** - Contenido específico métricas (con header-product)
- **`reportes.html`** - Contenido específico reportes (con header-product)
- **`encuestas.html`** - Contenido específico encuestas (con header-product)
- **`reclutamiento.html`** - Contenido específico reclutamiento (con header-product, sin SubNav)
- **`planes.html`** - Contenido específico planes (con header-product)
- **`tareas.html`** - Contenido específico tareas (con header-product)

### **🚀 Ventajas del sistema:**

1. **Fácil de entender** - Nombres semánticos claros
2. **Flexible** - Cualquier combinación de columnas y alturas
3. **Reutilizable** - Widgets se pueden usar en cualquier página
4. **Escalable** - Fácil añadir nuevos tipos de secciones
5. **Consistente** - Misma experiencia en todas las páginas
6. **Sin conocimiento técnico** - Solo necesitas describir lo que quieres

## 🚨 MANDATORY: VERIFICAR RECURSOS DISPONIBLES

**ANTES de usar CUALQUIER imagen, competencia o proveedor:**

1. **SIEMPRE revisa `images/cards-learn/`** para imágenes de cursos (85 imágenes disponibles)
2. **SIEMPRE revisa `images/Favicons/`** para logos de proveedores (18 proveedores disponibles)
3. **SIEMPRE revisa `images/empty-states/`** para imágenes de estados vacíos (2 archivos SVG)
4. **SIEMPRE revisa `images/Profile-image.jpg`** para avatar de usuario
5. **SIEMPRE revisa `components/card-content.js` o `components/card-content-compact.js`** para lista oficial de competencias (35 competencias)
6. **NUNCA inventes nombres de recursos** que no existen
7. **SIEMPRE verifica** las rutas de recursos antes de implementar
8. **Para otras imágenes** - Usa servicios externos como Unsplash con atribución adecuada

**Esto previene imágenes rotas y datos inválidos.**

## 🎯 COMPETENCIAS OFICIALES UBITS (35 TOTAL)

### **Competencias disponibles:**
- `Accountability`
- `Administración de negocios`
- `Agilidad`
- `Comunicación`
- `Cumplimiento (Compliance)`
- `Data skills`
- `Desarrollo de software`
- `Desarrollo web`
- `Digital skills`
- `e-Commerce`
- `Emprendimiento`
- `Experiencia del cliente`
- `Gestión de procesos y operaciones`
- `Gestión de proyectos`
- `Gestión de recursos tecnológicos`
- `Gestión del cambio`
- `Gestión del riesgo`
- `Gestión financiera`
- `Herramientas tecnológicas`
- `Inglés`
- `Innovación`
- `Inteligencia emocional`
- `Lenguajes de Programación`
- `Liderazgo`
- `Marketing`
- `Marketing digital`
- `Negociación`
- `People management`
- `Product design`
- `Productividad`
- `Resolución de problemas`
- `Trabajo en equipo`
- `Ventas`
- `Wellness`

### **⚠️ REGLAS CRÍTICAS:**
- **NUNCA inventes competencias** que no existen
- **SIEMPRE usa** solo competencias de esta lista oficial
- **SIEMPRE verifica** la ortografía exacta de la competencia

## 🚨 Solución de problemas

### **Si los colores no coinciden:**
1. **Verificar que usas tokens UBITS** - `var(--ubits-fg-1-high)` en lugar de `#303a47`
2. **Importar `ubits-colors.css`** - En cualquier archivo HTML nuevo
3. **Usar las clases de tipografía UBITS** - `ubits-h1`, `ubits-body-md-regular`

### **Si un componente no funciona:**
1. **Verificar que importas los archivos correctos** - CSS y JS del componente
2. **Revisar la documentación** - En la página específica del componente
3. **Usar el código de ejemplo** - Copia exactamente como está documentado

### **Si las imágenes no cargan:**
1. **Verificar rutas de imágenes** - Usa solo recursos de las carpetas oficiales
2. **Revisar rutas relativas** - Desde subcarpetas usar `../../images/...`, desde raíz usar `images/...`
3. **Revisar nombres de archivos** - Respeta mayúsculas y minúsculas exactas
4. **Usar competencias oficiales** - Solo las 35 competencias de la lista oficial
5. **Verificar documentación** - Lee `documentacion/componentes/card-content.html` para guía completa de rutas

## 📝 Componente Input - Guía rápida

### **¿Qué es Input?**
Campos de entrada de texto con todas las variantes, estados, iconos y funcionalidades avanzadas. Incluye 6 tipos especiales: SELECT, TEXTAREA, SEARCH, AUTOCOMPLETE, CALENDAR, PASSWORD. **SELECT incluye scroll infinito automático** para listas largas (50+ opciones).

### **Cómo implementar:**

#### **1. Importar archivos necesarios:**
```html
<link rel="stylesheet" href="ubits-colors.css">
<link rel="stylesheet" href="ubits-typography.css">
<link rel="stylesheet" href="fontawesome-icons.css">
<link rel="stylesheet" href="components/input.css">
<script src="components/input.js"></script>
```

#### **2. Crear contenedor:**
```html
<div id="mi-input-container"></div>
```

#### **3. Usar la función:**
```javascript
// Input básico
createInput({
    containerId: 'mi-input-container',
    label: 'Nombre',
    placeholder: 'Escribe tu nombre'
});

// Input con iconos y helper text
createInput({
    containerId: 'mi-input-container',
    label: 'Email',
    placeholder: 'correo@ejemplo.com',
    type: 'email',
    leftIcon: 'fa-envelope',
    helperText: 'Ingresa tu email válido',
    showHelper: true
});

// Input con contador de caracteres
createInput({
    containerId: 'mi-input-container',
    label: 'Mensaje',
    placeholder: 'Escribe tu mensaje',
    helperText: 'Máximo 100 caracteres',
    showHelper: true,
    showCounter: true,
    maxLength: 100
});

// Input solo con contador (sin helper text)
createInput({
    containerId: 'mi-input-container',
    label: 'Comentario',
    placeholder: 'Escribe tu comentario',
    showCounter: true,
    maxLength: 200
});

// SELECT con opciones básicas
createInput({
    containerId: 'mi-select',
    type: 'select',
    label: 'Categoría',
    placeholder: 'Selecciona una opción...',
    selectOptions: [
        {value: '1', text: 'Opción 1'},
        {value: '2', text: 'Opción 2'}
    ]
});

// SELECT con scroll infinito automático (50+ opciones)
createInput({
    containerId: 'mi-select-large',
    type: 'select',
    label: 'País',
    placeholder: 'Selecciona un país...',
    selectOptions: generateLargeOptionsList() // 50+ opciones
    // Scroll infinito se activa automáticamente con loading visual
});

// VALIDACIÓN MANUAL (obligatoria)
const emailInput = createInput({
    containerId: 'mi-email',
    type: 'email',
    placeholder: 'correo@ejemplo.com',
    value: 'email-invalido'
});

// Agregar validación manual
setTimeout(() => {
    const input = document.querySelector('#mi-email input');
    if (input) {
        input.addEventListener('input', function() {
            const value = this.value;
            if (value.includes('@') && value.includes('.')) {
                this.style.borderColor = 'var(--ubits-border-1)';
                this.style.borderWidth = '1px';
            } else if (value.length > 0) {
                this.style.borderColor = 'red';
                this.style.borderWidth = '2px';
            } else {
                this.style.borderColor = 'var(--ubits-border-1)';
                this.style.borderWidth = '1px';
            }
        });
    }
}, 500);

// TEXTAREA multilínea
createInput({
    containerId: 'mi-textarea',
    type: 'textarea',
    label: 'Comentario',
    placeholder: 'Escribe tu comentario aquí...'
});

// SEARCH con limpiar
createInput({
    containerId: 'mi-search',
    type: 'search',
    label: 'Búsqueda',
    placeholder: 'Buscar...'
});

// AUTOCOMPLETE con sugerencias
createInput({
    containerId: 'mi-autocomplete',
    type: 'autocomplete',
    label: 'Lenguaje',
    placeholder: 'Escribe un lenguaje...',
    autocompleteOptions: [
        {value: '1', text: 'JavaScript'},
        {value: '2', text: 'TypeScript'}
    ]
});

// CALENDAR con date picker
createInput({
    containerId: 'mi-calendar',
    type: 'calendar',
    label: 'Fecha de nacimiento',
    placeholder: 'Selecciona una fecha...'
});

// PASSWORD con toggle mostrar/ocultar
createInput({
    containerId: 'mi-password',
    type: 'password',
    label: 'Contraseña',
    placeholder: 'Ingresa tu contraseña...'
});
```

### **Características:**
- **Tamaños**: sm (32px), md (40px), lg (48px) - iguales a botones UBITS
- **Estados**: default, hover, focus, active, invalid, disabled
- **Iconos**: FontAwesome con posicionamiento absoluto, padding automático
- **Contador**: Caracteres automático (independiente del helper text)
- **Mandatory**: Texto obligatorio/opcional
- **Tipos**: text, email, password, number, tel, url, select, textarea, search, autocomplete, calendar
- **Scroll Infinito**: SELECT con carga automática para listas largas (50+ opciones)
- **Validación Manual**: Implementación obligatoria para email, teléfono y URL
- **Callbacks**: onChange, onFocus, onBlur
- **Métodos**: getValue(), setValue(), focus(), blur(), disable(), enable(), setState()

## 🎯 Componente Header Product - Guía rápida

### **¿Qué es Header Product?**
Encabezado de producto con breadcrumb, nombre del producto y botones de acción (back, info, AI, secundarios, primario, menú). Disponible en dos versiones: **Full** (con todos los elementos) y **Light** (sin back/info/breadcrumb, usado en la plataforma actual).

### **Cómo implementar:**

#### **1. Importar archivos necesarios:**
```html
<link rel="stylesheet" href="ubits-colors.css">
<link rel="stylesheet" href="fontawesome-icons.css">
<link rel="stylesheet" href="components/button.css">
<link rel="stylesheet" href="components/ia-button.css">
<link rel="stylesheet" href="components/header-product.css">
<script src="components/header-product.js"></script>
```

#### **2. Crear contenedor en HTML:**
```html
<div class="content-sections">
    <!-- Sección header-product -->
    <div class="section-single">
        <div class="widget-header-product" id="header-product-container"></div>
    </div>
    
    <!-- Resto del contenido -->
</div>
```

#### **3. Agregar CSS para widget (si usas sistema modular):**
```css
.section-single > .widget-header-product {
    background-color: transparent !important;
    padding: 0 !important;
}
```

#### **4. Usar la función (Versión Light - Plataforma actual):**
```javascript
loadHeaderProduct('header-product-container', {
    productName: 'Nombre del Producto',
    breadcrumbItems: [], // Array vacío para ocultar breadcrumb
    aiButton: {
        text: 'AI button',
        onClick: function() {
            console.log('AI button clicked');
        }
    },
    secondaryButtons: [
        { text: 'Filtros', icon: 'fa-filter', onClick: function() { console.log('Filtros clicked'); } },
        { text: 'Exportar', icon: 'fa-download', onClick: function() { console.log('Exportar clicked'); } }
    ],
    primaryButton: {
        text: 'Guardar',
        icon: 'fa-save',
        onClick: function() {
            console.log('Guardar clicked');
        }
    },
    menuButton: {
        onClick: function() {
            console.log('Menu button clicked');
        }
    }
});
```

#### **5. Versión Full (Nuevas experiencias):**
```javascript
loadHeaderProduct('header-product-container', {
    productName: 'Nombre del Producto',
    breadcrumbItems: [
        { text: 'Inicio', active: false },
        { text: 'Categoría', active: false },
        { text: 'Producto Actual', active: true }
    ],
    backButton: {
        onClick: function() {
            window.history.back();
        }
    },
    infoButton: {
        onClick: function() {
            console.log('Info button clicked');
        }
    },
    aiButton: {
        text: 'AI button',
        onClick: function() {
            console.log('AI button clicked');
        }
    },
    secondaryButtons: [
        { text: 'Filtros', icon: 'fa-filter', onClick: function() { console.log('Filtros clicked'); } }
    ],
    primaryButton: {
        text: 'Guardar',
        icon: 'fa-save',
        onClick: function() {
            console.log('Guardar clicked');
        }
    },
    menuButton: {
        onClick: function() {
            console.log('Menu button clicked');
        }
    }
});
```

#### **6. Características:**
- ✅ **Versión Light** - Sin back button, sin info button, sin breadcrumb (usada en plataforma actual)
- ✅ **Versión Full** - Con todos los elementos (recomendada para nuevas experiencias)
- ✅ **Botones configurables** - AI, secundarios, primario, menú
- ✅ **Breadcrumb opcional** - Array vacío para ocultar
- ✅ **Responsive** - Se adapta a diferentes tamaños de pantalla

## 🤖 Componente IA-Button - Guía rápida

### **¿Qué es IA-Button?**
Botones especiales diseñados para casos de uso con IA. Incluyen un badge siempre presente y tienen forma pill (redondeada). Disponible en dos variantes: primary (con gradiente radial) y secondary (outlined).

### **Cómo implementar:**

#### **1. Importar archivos necesarios:**
```html
<link rel="stylesheet" href="ubits-colors.css">
<link rel="stylesheet" href="fontawesome-icons.css">
<link rel="stylesheet" href="components/ia-button.css">
```

#### **2. Usar en HTML:**
```html
<!-- IA-Button Primary -->
<button class="ubits-ia-button ubits-ia-button--primary ubits-ia-button--md">
    <i class="far fa-sparkles"></i>
    <span>AI Assistant</span>
    <span class="ubits-ia-button__badge"></span>
</button>

<!-- IA-Button Secondary -->
<button class="ubits-ia-button ubits-ia-button--secondary ubits-ia-button--sm">
    <i class="far fa-robot"></i>
    <span>Ask AI</span>
    <span class="ubits-ia-button__badge"></span>
</button>
```

#### **3. Variantes disponibles:**
- `ubits-ia-button--primary` - Con gradiente radial azul
- `ubits-ia-button--secondary` - Outlined con borde

#### **4. Tamaños disponibles:**
- `ubits-ia-button--sm` - Small (32px)
- `ubits-ia-button--md` - Medium (40px)
- `ubits-ia-button--lg` - Large (48px)

#### **5. Características:**
- ✅ **Badge siempre presente** - Indicador visual de IA
- ✅ **Forma pill** - Bordes completamente redondeados
- ✅ **Gradiente radial** - En variante primary
- ✅ **Iconos opcionales** - FontAwesome icons
- ✅ **Responsive** - Se adapta a diferentes tamaños

## 🍞 Componente Toast - Guía rápida

### **¿Qué es Toast?**
Notificaciones flotantes que aparecen arriba, al centro de la pantalla y se cierran automáticamente.

### **Cómo implementar:**

#### **1. Importar archivos necesarios:**
```html
<link rel="stylesheet" href="ubits-colors.css">
<link rel="stylesheet" href="fontawesome-icons.css">
<link rel="stylesheet" href="components/toast.css">
<script src="components/toast.js"></script>
```

#### **2. Crear contenedor:**
```html
<div id="ubits-toast-container"></div>
```

#### **3. Usar la función:**
```javascript
// Toast básico
showToast('success', '¡Operación exitosa!');

// Toast con opciones
showToast('info', 'Ya estás en la documentación 😆', {
    containerId: 'ubits-toast-container',
    duration: 3500,
    noClose: false
});
```

#### **4. Tipos disponibles:**
- `success` - Verde (3.5s)
- `info` - Azul (3.5s) 
- `warning` - Amarillo (5s)
- `error` - Rojo (6.5s)

#### **5. Características:**
- ✅ **Auto-cierre** - Se cierran solos después del tiempo especificado
- ✅ **Pausa en hover** - Se pausan si pasas el cursor por encima
- ✅ **Apilado** - Máximo 3 toasts visibles a la vez
- ✅ **Accesible** - Roles ARIA y navegación por teclado

## 📄 Licencia

Este proyecto está bajo la licencia MIT incluida en el archivo `LICENSE`.

## 👤 Autor

**Hector David Vega** — [@DavidVegaM91](https://github.com/DavidVegaM91)  
Creador de la plantilla UBITS Playground. No elimines ni ocultes esta atribución al usar o hacer fork del proyecto.

---

**¡Listo para crear interfaces UBITS increíbles! 🚀**