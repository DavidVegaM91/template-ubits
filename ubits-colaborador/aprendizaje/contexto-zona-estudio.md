# Zona de estudio — contexto de producto y playground

> Documento de referencia para implementar, mantener y migrar a React la experiencia **Zona de estudio** del colaborador. Cubre las **4 pestañas**, reglas de negocio, composición de UI, fuentes de datos mock y comportamiento actual del vanilla (source of truth visual).

**Figma (referencia en código):** Learner v4 · nodos `40006050:5454` (plan de contenidos) y `40006073:17044` (plan de competencias).

---

## 1. Problema de negocio

La **Zona de estudio** es el espacio del colaborador donde **consume y da seguimiento** a su formación asignada, más contenidos personales y su historial.

| Necesidad | Qué resuelve la pantalla |
|-----------|--------------------------|
| Ver planes activos | Planes de **contenidos** y de **competencias** en los que el colaborador está asignado |
| Avanzar en lo asignado | Lista o carrusel de contenidos con progreso individual |
| Contenido privilegiado | Ítems habilitados solo para el usuario («Exclusivo para mi») |
| Trayectoria y certificación | Historial de consumo + descarga de certificados cuando aplique |

No es administración ni LMS Creator: es **vista learner** dentro de **Aprendizaje → Zona de estudio**.

---

## 2. Dónde vive en el playground

| Aspecto | Valor |
|--------|--------|
| **Carpeta** | `ubits-colaborador/aprendizaje/` |
| **Página** | `zona-estudio.html` |
| **Lógica** | `zona-estudio.js` |
| **Estilos página** | `zona-estudio.css` |
| **Layout** | **Estándar colaborador** — Sidebar `default` + SubNav `aprendizaje` + TabBar + Floating menu |
| **SubNav** | Pestaña **Zona de estudio** (`id: study-zone`) |
| **Floating menu (móvil)** | Ítem **Zona de estudio** en acordeón Aprendizaje |
| **React (playground)** | `Ubits-React/pages/ubits-colaborador/aprendizaje/zona-estudio.tsx` — **placeholder**; migrar cuando vanilla esté estable |

### Shell de página

```
body.page-zona-estudio
├── sidebar-container          → loadSidebar('aprendizaje')
├── top-nav-container          → loadSubNav('aprendizaje') — tab study-zone activo
├── content-sections
│   ├── section-single         → widget-tabs-zona-estudio (4 ubits-tab)
│   └── section-single         → widget-contenido-tabs (panel del tab activo)
├── tab-bar-container
├── floating-menu-container
└── profile-menu-container
```

**Inicialización:** `initZonaEstudioPage()` en `DOMContentLoaded` (después del shell global).

---

## 3. Usuario demo del playground

| Constante | Valor | Archivo |
|-----------|-------|---------|
| `PLAYGROUND_USER_ID` | `E006` — María Alejandra Sánchez Pardo | `zona-estudio.js` |
| Misma ID en BD planes | `PLAYGROUND_DEMO_USER_ID` | `bd-master/bd-planes-formacion.js` |
| **Hoy simulado** | `PLAYGROUND_TODAY` → `2026-06-19` | `bd-planes-formacion.js` |

### Demo de progreso en planes de contenidos

Tras generar la BD de planes, `applyPlaygroundDemoUserProgress()` marca **3 planes de contenidos** de María con **todos sus ítems al 100 %**:

| Plan ID | Área |
|---------|------|
| `pf-c-gerencia-general-2025-q1` | Gerencia General Q1 2025 |
| `pf-c-gerencia-general-2025-q2` | Gerencia General Q2 2025 |
| `pf-c-gerencia-general-2025-q3` | Gerencia General Q3 2025 |

El resto de planes asignados a `E006` conservan el progreso pseudoaleatorio generado por la BD (no forzado al 100 %).

> María también es líder demo en **Mi equipo** (`E006`). En Zona de estudio se evalúa siempre como **colaboradora asignada**, no como creadora de planes.

---

## 4. Arquitectura de tabs

### 4.1 Lista de pestañas

| `data-tab-id` | Label UI | Hash URL | Panel DOM |
|---------------|----------|----------|-----------|
| `contenidos` | Plan de contenidos | `#contenidos` | `#zona-estudio-panel-contenidos` |
| `competencias` | Plan de competencias | `#competencias` | `#zona-estudio-panel-competencias` |
| `exclusivo` | Exclusivo para mi | `#exclusivo` | `#zona-estudio-panel-exclusivo` |
| `historial` | Historial y certificados | `#historial` | `#zona-estudio-panel-historial` |
| `progreso` | Progreso | `#progreso` | `#zona-estudio-panel-progreso` |

- Componente: `ubits-tabs-on-bg` + `ubits-tab` (ver `components/tab.css`).
- Tab por defecto: **Plan de contenidos** (`contenidos`).
- Navegación: clic en tab → `setActiveTab()`; `hashchange` sincroniza tab desde URL.
- Persistencia URL: `history.replaceState` / `location.hash` con `#<tab-id>`.

### 4.2 Estado global (`zona-estudio.js`)

| Campo | Uso |
|-------|-----|
| `activeTab` | Tab visible |
| `selectedPlanByTab.contenidos` / `.competencias` | Plan elegido en el selector de cada tab |
| `planesContenidos` / `planesCompetencias` | Planes filtrados para el usuario demo |
| `filteredContents` | Cards del plan de contenidos tras búsqueda |
| `exclusivoContents` / `exclusivoFilteredContents` | Lista exclusivo + filtro búsqueda |
| `historialContents` / `historialFilteredContents` | Lista historial + filtro búsqueda |
| `historialViewMode` | `'grid'` \| `'list'` (solo tab historial) |
| `progresoSelectedColaboradorId` | En `zona-estudio-progreso.js`: persona activa del profile list (default `E006`) |
| `searchQuery` / `exclusivoSearchQuery` / `historialSearchQuery` | Texto de búsqueda por tab |

---

## 5. Inventario de archivos

| Archivo | Rol |
|---------|-----|
| `zona-estudio.html` | Markup de los 4 paneles |
| `zona-estudio.js` | Toda la lógica de tabs, filtros, render |
| `zona-estudio.css` | Grid responsive, bloques competencias, tabla historial |
| `bd-master/bd-planes-formacion.js` | Planes asignados, progreso por usuario |
| `bd-master/bd-contenidos-ubits.js` | Catálogo UBITS (~85 ítems) |
| `bd-master/bd-contenidos-fiqsha.js` | Catálogo Fiqsha publicado (~20 ítems) |
| `bd-master/catalogo-proveedores-helpers.js` | Resolución de aliados / `buildCardFromCatalogoContent` |
| `bd-master/bd-master-niveles-contenido.js` | Nombres de nivel |
| `bd-master/bd-master-competencias.js` | Metadatos competencias (tab competencias) |
| `bd-master/bd-master-aliados.js` | Logos y nombres proveedor |
| `bd-master/scripts/patch-contenidos-catalogo-fields.mjs` | `conCertificacion`, plantillas certificado |
| `components/card-content.js` | Render de `course-card` en cuadrículas |
| `components/progress-bar.js` | Barras plan, tabla historial (`tableProgressCellHtml`) |
| `zona-estudio-progreso.js` | Tab Progreso (vista líder, rankings, carrusel, drawers) |
| `mi-equipo/mi-equipo-context.js` | Subordinados directos de María (`getMiEquipoSubordinadosDirectos`) |
| `mi-equipo/mi-equipo-plan-competencias-shared.js` | Drawer competencias read-only + `formatMinutosEstudioVsMeta` |
| `components/carousel-contents.js` | Carrusel `study-zone` (cards de plan) |
| `components/drawer.js` + `card-content-compact.js` | Drawer progreso subordinado (contenidos) |
| `components/empty-state.js` | Sin resultados |
| `components/input.js` | Select de plan, búsquedas inline |
| `components/alert.js` | Alerta plan vencido |
| `components/toolbar-panel.css` | Barra lista de contenidos |
| `components/table.css` | Vista tabla historial |

### React

| Archivo | Estado |
|---------|--------|
| `Ubits-React/pages/ubits-colaborador/aprendizaje/zona-estudio.tsx` | Placeholder |
| `Ubits-React/lib/mockData/bd-contenidos-*.ts` | Sincronizados vía `npm run sync:bd-master` |

---

## 6. Reglas transversales (todos los tabs con lista)

### 6.1 Visibilidad de planes en tabs Plan de contenidos / Plan de competencias

Función `planVisibleEnZonaEstudio(plan)`:

| Estado del plan | ¿Visible en Zona de estudio? |
|-----------------|------------------------------|
| **Vigente** | Sí |
| **No vigente** | Sí (con alerta de vencimiento) |
| **Planeado** | **No** |
| **Procesando…** | **No** |

Fuente: `getPlanesParaColaborador(PLAYGROUND_USER_ID, { tipo })` + filtro anterior.

Orden de planes: estado (Vigente → No vigente → …) y luego **fecha fin** descendente.

### 6.2 Contador de resultados

Todos los toolbars muestran `{N} resultados` con `formatIndicatorNumber(n)`:

- `< 10.000` → separador miles locale `es-CO` (`1.556`)
- `≥ 10.000` → `K` con 1 decimal (`10,5 K`)
- `≥ 1.000.000` → `M` con 1 decimal (`2,7 M`)

### 6.3 Búsqueda inline (patrón toolbar)

Presente en: **Plan de contenidos**, **Exclusivo**, **Historial**.

| Elemento | Comportamiento |
|----------|----------------|
| Botón lupa | Oculta el botón, expande `createInput` type `search` en la barra |
| Placeholder | `Buscar contenidos...` |
| Filtrado | Tiempo real en `onChange` |
| Campos buscados | `title`, `competency`, `type`, `level` (case-insensitive, substring) |
| Cerrar sin texto | Clic fuera cierra y limpia búsqueda |
| Empty state con búsqueda | Título `No se encontraron resultados`; descripción `Intenta ajustar tu búsqueda.`; botón `Limpiar búsqueda` (`fa-times`) |

Funciones globales de limpieza: `clearZonaEstudioSearch`, `clearZonaEstudioExclusivoSearch`, `clearZonaEstudioHistorialSearch`.

### 6.4 Botón Filtrar (`fa-filter`)

El botón **Filtrar** aparece en el toolbar de contenidos, exclusivo e historial con tooltip `Filtrar`.

**Estado actual en playground:** solo es **UI shell** — **no** abre modal ni aplica criterios adicionales. Reservado para filtros futuros (tipo, nivel, idioma, etc.).

### 6.5 Cards de contenido (`course-card`)

Todas las cuadrículas usan `loadCardContent(containerId, cards[])`.

Objeto card típico (mapeado desde catálogo):

| Campo | Origen / notas |
|-------|----------------|
| `type` | `tipoContenido` |
| `title` | `titulo` |
| `provider` / `providerLogo` | Aliado principal o «Varios» en rutas multi-proveedor |
| `providers` | Opcional — rutas/programas con varios aliados |
| `duration` | `{tiempoValor} min` |
| `level` | `nivelId` → nombre en maestro niveles |
| `progress` | 0–100 |
| `status` | `default` (0 %), `progress` (1–99 %), `completed` (100 %) |
| `image` | Portada del contenido |
| `competency` | Competencia UBITS o mapeo categoría Fiqsha |
| `language` | `idioma` |

Solo en **historial** se añaden además: `contentId`, `conCertificacion`, `plantillaCertificadoId`, `plantillaCertificado`.

### 6.6 Grid responsive (cuadrículas)

Clase `.grid-cards-container`:

| Breakpoint | Columnas |
|------------|----------|
| Desktop (>1365px) | 4 |
| ≤1365px | 3 |
| ≤1023px | 2 |

---

# 7. Tab 1 — Plan de contenidos

## 7.1 Copy fijo

| Elemento | Texto |
|----------|-------|
| Descripción bajo widget plan | `Contenidos que hacen parte de este plan de formación.` |

## 7.2 Composición de pantalla (de arriba a abajo)

### A) Widget plan (`#zona-estudio-plan-widget`)

| Bloque | ID / detalle |
|--------|----------------|
| Selector plan | `#zona-estudio-plan-select` — `createInput` type `select`, label `Filtrar por plan` |
| Vigencia | `#zona-estudio-plan-vigencia` — «Del {inicio} al {fin} - tu plan termina en **{N} días**» |
| Estado | `#zona-estudio-plan-status` — `ubits-status-tag` según estado del plan |
| Alerta vencido | `#zona-estudio-plan-vencido-alert` — solo si `estado === 'No vigente'` |
| Progreso meta | `#zona-estudio-plan-progress-count` — `{completados} de {total} contenidos` |
| Progreso % | `#zona-estudio-plan-progress-pct` — `{pct} %` |
| Barra | `#zona-estudio-plan-progress-bar` — `progressBarHtml` size `lg`, track `subtle` |

#### Opciones del selector

Cada opción (`buildPlanSelectOption`):

- **Texto:** nombre del plan
- **Meta:** `{done} de {total} contenidos` (contenidos completados al 100 % / total asignados)
- **Status tag:** estado del plan (variante por `getEstadoTagVariant`)

#### Cálculo de progreso del plan (contenidos)

| Métrica | Regla |
|---------|-------|
| Contador `X de Y` | `Y` = ítems en `plan.contenidoPorUsuario[E006]`; `X` = ítems con `progress >= 100` |
| Porcentaje barra | `BD_PLANES_FORMACION.getProgresoColaboradorEnPlan(plan, E006)` → **promedio** de % de los ítems del usuario |

#### Alerta plan vencido

Solo **No vigente**. Copy:

> **Recordatorio:** Lo que completes después de la fecha límite no se suma al progreso del plan. Este plan se venció hace {haceText}.

`haceText` humanizado: días → semanas → meses (`formatPlanVencidoHace`).

#### Status tag colores

| Estado | Variant |
|--------|---------|
| Planeado | `info` |
| Procesando… | `warning` |
| Vigente | `success` |
| No vigente | `neutral` |

### B) Toolbar lista (`#zona-estudio-toolbar`)

Variante `ubits-toolbar-panel--plain`:

- Título: `Lista de contenidos`
- Meta: contador resultados
- Acciones: búsqueda + botón filtrar (sin lógica aún)

### C) Cuadrícula (`#zona-estudio-cards-grid`)

Contenidos del **plan seleccionado** para `E006`:

1. Leer `plan.contenidoPorUsuario[E006]` → array `{ id, progress, status, … }`
2. Resolver cada `id` en `BDS_CONTENIDOS_UBITS`
3. Mapear con `mapCatalogoToCard(c, item.progress)`

**Regla de negocio:** solo se listan contenidos **explícitamente asignados** al usuario en ese plan (no todo el catálogo).

### D) Empty state (`#zona-estudio-empty-state`)

Mismas reglas transversales de búsqueda (§6.3).

---

# 8. Tab 2 — Plan de competencias

## 8.1 Copy fijo

| Elemento | Texto |
|----------|-------|
| Descripción | `Sugerencias de contenidos para este plan de formación.` |

## 8.2 Composición

### A) Widget plan (`#zona-estudio-comp-plan-widget`)

Misma estructura que tab contenidos con prefijo `zona-estudio-comp-*`.

| Diferencia | Tab competencias |
|------------|------------------|
| Selector | `#zona-estudio-comp-plan-select` |
| Contador progreso | `{doneMin} de {totalMin} minutos` |
| Meta opción select | `{pct}% de avance` |
| % barra | Progreso por **horas de estudio** vs meta (`HORAS_META_COMPETENCIAS`, default 2 h) |

Progreso: `getCompetenciaProgressMinutes(plan)` → `consumoPorUsuario[E006].horas` vs meta.

### B) Lista de bloques (`#zona-estudio-competencias-list`)

Por cada **plan de competencias seleccionado** se renderiza **un bloque** (`.zona-estudio-competencia-block`):

| Zona del bloque | Contenido |
|-----------------|-----------|
| Cabecera | Icono competencia (50×50), nombre, minutos + %, barra progreso competencia |
| Navegación | Botones chevron prev/next (desktop); ocultos ≤768px |
| Carrusel | `#zona-estudio-comp-track-{i}` — scroll horizontal de cards |
| Indicadores | `#zona-estudio-comp-indicators-{i}` — dots (ocultos en CSS por defecto en desktop; lógica carousel-indicators activa) |

### C) Origen de cards del carrusel (`buildCardsForCompetenciaBlock`)

Orden de construcción (máx. **12** cards):

1. **Contenidos ya consumidos** del usuario en el plan (`consumoPorUsuario[E006].items`) — el primero lleva el % del plan; el resto 0 %.
2. **Sugerencias del catálogo UBITS** con la misma `competenciaPrincipalId` que el plan, sin duplicar IDs, hasta completar 12.

**Regla de negocio:** mezcla **historial de consumo** + **recomendaciones** alineadas a la competencia del plan. No son asignaciones obligatorias como en plan de contenidos.

### D) Carrusel — comportamiento

| Viewport | Cards por «página» al navegar |
|----------|-------------------------------|
| >1365px | 4 |
| ≤1365px | 3 |
| ≤768px | 2 |
| ≤480px | 1 |

Ancho card en carrusel: misma fórmula que `carousel-contents--content-cards` (gap 24px).

### E) Empty (`#zona-estudio-competencias-empty`)

Si no hay plan seleccionable:

- Icono `fa-bullseye`
- Título: `Sin competencias en este plan`
- Descripción: `Selecciona un plan de competencias para ver su contenido asignado.`

---

# 9. Tab 3 — Exclusivo para mi

## 9.1 Copy fijo

| Elemento | Texto |
|----------|-------|
| Descripción | `Contenidos habilitados solo para ti. No tienen fecha límite para ser completados.` |

## 9.2 Composición

1. Párrafo descriptivo (`#zona-estudio-exclusivo-desc`)
2. Toolbar lista (igual patrón §6.3, sin toggle vista)
3. Cuadrícula `#zona-estudio-exclusivo-cards-grid`
4. Empty state `#zona-estudio-exclusivo-empty-state`

## 9.3 Reglas de negocio y datos

**No** usa planes de formación. Lista **hardcodeada** en `EXCLUSIVO_FIQSHA_ITEMS`:

| ID contenido | Progreso demo | Estado card |
|--------------|---------------|-------------|
| `f001` | 100 % | Completado |
| `f002` | 100 % | Completado |
| `f003` | 65 % | En progreso |
| `f004` | 0 % | Sin iniciar |

Fuente catálogo: `BDS_CONTENIDOS_FIQSHA.contents` vía `getFiqshaContenidoById`.

Mapeo card: `mapFiqshaContenidoToCard` — proveedor Fiqsha, competencia derivada de `categoriaFiqshaId` (`COMPETENCIA_POR_CATEGORIA_FIQSHA`).

**Regla de producto:** contenidos corporativos **asignados individualmente** al colaborador, **sin vigencia** del plan. En producción vendría de permisos/segmentación; en playground son 4 ítems fijos.

---

# 10. Tab 4 — Historial y certificados

## 10.1 Copy fijo

| Elemento | Texto |
|----------|-------|
| Descripción | `Consulta lo que has visto y descarga certificados de contenidos finalizados que lo incluyan.` |

## 10.2 Composición

1. Párrafo descriptivo (`#zona-estudio-historial-desc`)
2. Toolbar con búsqueda + **Ver como: Cuadrícula / Tabla**
3. Vista activa:
   - Cuadrícula: `#zona-estudio-historial-cards-grid`
   - Tabla: `#zona-estudio-historial-table-wrap` + `ubits-table`
4. Empty state `#zona-estudio-historial-empty-state`

### Toolbar — toggle vista

| Valor `data-value` | Label | Vista |
|--------------------|-------|-------|
| `grid` | Cuadrícula | Cards (`course-card`) — **default** |
| `list` | Tabla | `ubits-table` |

Implementación: `initButtonGroup('#zona-estudio-historial-view-group')` — patrón idéntico a drawer catálogo / `contenidos.html`.

## 10.3 Origen de datos del historial

Constantes:

| Constante | Valor |
|-----------|-------|
| `HISTORIAL_COUNT` | 40 ítems |
| `HISTORIAL_IN_PROGRESS_PCT` | `[75, 25, 42, 88, 53, 31, 67, 18, 92, 48, 61, 36]` |

### Pool de contenidos (`getHistorialSourcePool`)

1. Toma todos los ítems de `BDS_CONTENIDOS_UBITS` y `BDS_CONTENIDOS_FIQSHA`
2. Ordena cada lista con seed determinista (`historialSeed`)
3. **Intercala** UBITS y Fiqsha hasta 40 ítems (round-robin)
4. Mezcla catálogo global — **no** filtra por planes ni por usuario

### Progreso simulado (`buildHistorialCards`)

| Regla | Detalle |
|-------|---------|
| Completados | ~90 % de ítems → `progress = 100` |
| En progreso | ~10 % (`Math.round(40 * 0.1)` = 4 ítems) → % de `HISTORIAL_IN_PROGRESS_PCT` |
| Selección en progreso | Índices elegidos por seed estable por `id` |
| Orden final | **En progreso primero**, luego completados |

### Enriquecimiento certificado (`enrichHistorialFromCatalogo`)

Por cada fila/card se copian desde el ítem de catálogo:

- `contentId`
- `conCertificacion` (boolean)
- `plantillaCertificadoId` / `plantillaCertificado` (si aplica)

## 10.4 Vista tabla — columnas

| Columna | Contenido | Notas |
|---------|-----------|-------|
| **Nombre del contenido** | `row.title` | `ubits-body-sm-regular`, max-width 320px |
| **Tipo de contenido** | `row.type` | ej. Curso, Ruta, Podcast |
| **Nivel** | `row.level` | Básico / Intermedio / Avanzado |
| **Progreso** | Barra + % | `tableProgressCellHtml(row.progress)` — patrón `mi-equipo/planes.html` |
| **Certificado** | Ver §10.5 | Lógica exclusiva de este tab |

La cuadrícula muestra la **misma información** en formato card (progreso en overlay). Los contenidos **completados con certificado** muestran además el botón de opciones (`card-content` → `certificadoRowActions`) con acción **Descargar certificado** en el dropdown.

### Variante card — `certificadoRowActions`

| Campo card | Cuándo |
|------------|--------|
| `certificadoRowActions: true` | `conCertificacion` + `progress >= 100` |
| `certificadoCardId` | `contentId` del ítem de catálogo |

Componente: `card-content.js` → `initCardContentCertificadoRowActions()`, menú vía `dropdown-menu.js` (una opción: Descargar certificado, ícono `down-to-line`).

## 10.5 Columna Certificado — reglas de negocio

Evaluación en `historialCertificadoCellHtml(row)`:

| Condición | UI | Acción |
|-----------|-----|--------|
| `conCertificacion === false` | Texto **No aplica** | — |
| `conCertificacion === true` y `progress < 100` | Texto **Pendiente** | Certificado existe pero el contenido no está finalizado |
| `conCertificacion === true` y `progress >= 100` | Botón secondary **Descargar** (`fa-down-to-line`) en tabla; en cuadrícula botón **Opciones** (`certificadoRowActions`) → menú **Descargar certificado** | Toast info: *Esta acción aún no está disponible en el Playground.* |

El clic en **Descargar** (tabla) o **Descargar certificado** (menú de la card) dispara toast `info` y no descarga archivo.

> La plantilla concreta (`plantillaCertificado`) **no** se muestra en la columna; vive en BD para futura generación del PDF/certificado.

## 10.6 Certificación en catálogos (BD)

Script: `bd-master/scripts/patch-contenidos-catalogo-fields.mjs`  
Regenerar React: `cd Ubits-React && npm run sync:bd-master`

### Campos por ítem de contenido

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `conCertificacion` | boolean | Si el contenido emite certificado |
| `plantillaCertificadoId` | string \| null | ID plantilla |
| `plantillaCertificado` | string \| null | Nombre legible plantilla |

### Distribución ~80 % / 20 %

`hasCertificado(id, salt)` → `(numericSeed(id) + salt) % 5 !== 0` → **4 de cada 5** con certificado.

Conteo actual (tras patch): **UBITS 85** → 68 con / 17 sin · **Fiqsha 20** → 16 con / 4 sin.

### Plantillas asignadas

| Catálogo | `plantillaCertificadoId` | `plantillaCertificado` |
|----------|--------------------------|-------------------------|
| **Fiqsha** | `tpl-doble-firma` | Cursos empresariales con doble firma |
| **Fiqsha** | `tpl-estandar` | Certificado estándar Fiqsha |
| **Fiqsha** | `tpl-onboarding` | Onboarding colaboradores |
| **UBITS** (todos los aliados) | `tpl-ubits` | UBITS |

Rotación Fiqsha: `numericSeed(item.id) % 3`.  
Referencia plantillas Creator: `lms-creator/crear-contenido-certificado.js`.

Si `conCertificacion === false` → `plantillaCertificadoId` y `plantillaCertificado` en `null`.

---

# 11. Tab 5 — Progreso (vista líder)

## 11.1 Alcance y usuario

Pestaña para **María Alejandra (E006)** como **líder de Logística** con permiso de ver progreso de su equipo (mismo universo que **Mi equipo**).

| Constante | Valor |
|-----------|--------|
| Líder demo | `E006` — María Alejandra Sánchez Pardo |
| Área resaltada en ranking | `Logística` |
| Subordinados | `E035`–`E040` vía `getMiEquipoSubordinadosDirectos()` |

## 11.2 Jerarquía visual

| Bloque | Comportamiento al cambiar persona |
|--------|-----------------------------------|
| Hero unificado (`zona-estudio-progreso-hero`) | **Sí** — identidad, barra, KPIs y carrusel |
| Recordatorio de estudio (`zona-estudio-progreso-recordatorio-widget`) | **No** — widget fijo de líder |
| Rankings (`zona-estudio-progreso-rankings`) | **No** — dos columnas fijas |

## 11.3 Composición de pantalla (de arriba a abajo)

### A) Hero unificado

Un solo widget `.zona-estudio-progreso-hero` con:

#### A.1 Cabecera + profile list

| Elemento | Detalle |
|----------|---------|
| Nombre | `#zona-estudio-progreso-hero-name` — nombre completo del colaborador seleccionado |
| Profile list | `#zona-estudio-progreso-profile` — María primero + subordinados; clic cambia solo el hero |

#### A.2 Cumplimiento promedio

Promedio de `getProgresoColaboradorEnPlan(plan, personaId)` en planes **`Vigente`** de la persona seleccionada.

| Elemento | Contenido |
|----------|-----------|
| Label | «Cumplimiento promedio» (sin repetir «planes vigentes») |
| % | `#zona-estudio-progreso-general-pct` — `{pct} %` |
| Barra | `progressBarHtml` lg, track subtle |

#### A.3 KPIs en fila (`#zona-estudio-progreso-kpis`)

Cuatro stats cards; gap entre cards = `var(--gap-2xl)` (igual que cards del carrusel de planes).

| KPI | Regla |
|-----|--------|
| Planes vigentes | Count de planes `Vigente` asignados |
| Completados | Progreso ≥ 100 % |
| En curso | Progreso &gt; 0 % y &lt; 100 % |
| Sin iniciar | Progreso = 0 % (sin avance registrado) · icono `fa-triangle-exclamation` |

#### A.4 Carrusel planes activos (`#zona-estudio-progreso-planes-carousel`)

| Regla | Detalle |
|-------|---------|
| Componente | `createCarouselContents({ type: 'study-zone' })` — **misma card** que home-learn |
| Título sección | «Planes activos» |
| Datos | Solo planes **`Vigente`** de la persona seleccionada |
| Label progreso card | Contenidos: `{done}/{total} contenidos` · Competencias: minutos abreviados (`X hrs. X min. de X hrs. X min.`) |
| Cierre | `Cierre: {Mes} {día}` desde `fechaFinIso` |

#### Clic en card de plan

| Persona seleccionada | Acción |
|---------------------|--------|
| **María (E006)** | `zonaEstudioNavigateToPlan(planId, tipo)` → tab **Plan de contenidos** o **Plan de competencias** con ese plan en el selector |
| **Subordinado** | Drawer oficial de progreso individual (§11.6) |

### B) Recordatorio de estudio (`#zona-estudio-progreso-recordatorio`)

Segundo widget, **encima de los rankings**. Sin sección «Acciones» — el título vive dentro del widget.

| Elemento | Contenido |
|----------|-----------|
| Título | «Recordatorio de estudio» |
| Descripción | «Enviar recordatorio a quienes no hayan completado sus planes de formación asignados.» |
| Botón | Secondary «Enviar recordatorio» → toast info del playground |

Siempre visible (acción de líder); no cambia al seleccionar otra persona en el profile list.

### C) Rankings — dos columnas (`zona-estudio-progreso-rankings`)

Sin título de sección intermedio. **Izquierda:** Top de estudio · **Derecha:** Ranking entre áreas.

#### C.1 Top de estudio (`#zona-estudio-progreso-ranking-equipo`)

Button-group **Equipo / Empresa** (`#zona-estudio-progreso-equipo-scope-group`, `initButtonGroup`).

| Modo | Datos | Descripción | Columna valor |
|------|-------|-------------|-----------------|
| **Equipo** (default) | María + subordinados | «De mayor a menor avance.» | Barra + % |
| **Empresa** | Todos los colaboradores (`BD_MASTER_COLABORADORES`) | «De mayor a menor tiempo de estudio.» | `X hrs. X min.` (sin barra) |

Tiempo de estudio empresa: suma en planes **Vigente** — competencias (`consumoPorUsuario.horas`) + contenidos (duración × progreso de cada ítem).

Top 3: medallas con borde. **Nombre completo** + «(Tú)» solo en María. **Resaltada** la fila de la persona seleccionada en el hero (Equipo y Empresa). Filas sin gap.

Listas con **máximo 10 filas visibles**; el resto con scroll.

Modo **Empresa:** top 3 sticky; **autoscroll** a la persona seleccionada en el hero debajo del podio (si puesto &gt; 3). Línea divisora separada bajo el 3.º lugar (no borde del card).

#### C.2 Ranking entre áreas (`#zona-estudio-progreso-ranking-areas`)

- Planes de **contenidos** **`Vigente`** (`getPlanesVisiblesCreator()`, `tipo === 'contenidos'`).
- Por `plan.area`: promedio de `getProgresoAgregadoPlan(plan)`.
- Orden descendente por %.
- **Top 3:** medallas (trofeo / medal / award).
- **Tu área:** badge «Tu área» en fila de `Logística` + fondo resaltado.
- Lista con **máx. 10 filas visibles** y scroll para el resto. **Gap 0** entre filas.

## 11.6 Drawers de progreso (subordinados)

Réplica de **Mi equipo → detalle plan** (solo lectura).

### Plan de contenidos

| Aspecto | Valor |
|---------|--------|
| Overlay | `drawer-zona-estudio-progreso-contenidos` |
| Título | `{nombre} – contenidos y progreso` |
| Body | `loadCardContentCompact` con ítems de `getDetalleContenidoPorUsuario(plan)[colaboradorId]` |
| Referencia | `mi-equipo/detalle-plan.html` → `abrirPanelContenidos` |

### Plan de competencias

| Aspecto | Valor |
|---------|--------|
| Función | `MiEquipoPlanCompetenciasShared.openPanelCompetenciasReadOnly` |
| Overlay | `drawer-zona-estudio-progreso-competencias` |
| Título | `{nombre} – competencias y progreso` |
| Subcopy card | **Minutos estudiados vs meta** — no «X habilidades» |

## 11.7 Fix transversal — drawer competencias (minutos, no habilidades)

En vista **progreso de estudiante** (read-only), el subtítulo de la card de competencia debe ser:

**«{done} de {meta}»** en formato horas/minutos — ej. `1 hora 20 min. de 2 horas`.

Helper compartido en `mi-equipo-plan-competencias-shared.js`:

- `formatMinutosEstudioVsMeta(doneMin, totalMin)`
- `getCompetenciaMinutosLabelForPlanPerson(plan, colaboradorId)` — usa `consumoPorUsuario[id].horas` vs `horasEstudioMeta` (default 2 h).

**Archivos corregidos:**

| Archivo | Cambio |
|---------|--------|
| `mi-equipo/mi-equipo-plan-competencias-shared.js` | `openPanelCompetenciasReadOnly` acepta `plan` + `colaboradorId` |
| `mi-equipo/detalle-plan-competencias.html` | Pasa `planRawBd` y `rowId` al drawer |
| `lms-creator/planes-formacion/detalle-plan-competencias.html` | `initPanelCompetencias` read-only usa minutos |
| `zona-estudio-progreso.js` | Drawer subordinado competencias con mismos helpers |

> Los drawers de **edición** (agregar competencias, ordenar habilidades) siguen mostrando habilidades — solo cambia la vista **progreso estudiante**.

---

# 12. Mapa de fuentes de datos por tab

| Tab | Fuente principal | Progreso |
|-----|------------------|----------|
| Plan de contenidos | `BD_PLANES_FORMACION` → `contenidoPorUsuario[E006]` + `BDS_CONTENIDOS_UBITS` | Real (BD planes) + demo 3 planes al 100 % |
| Plan de competencias | `BD_PLANES_FORMACION` → `consumoPorUsuario[E006]` + sugerencias `BDS_CONTENIDOS_UBITS` por `competenciaId` | Horas consumidas vs meta |
| Exclusivo para mi | `EXCLUSIVO_FIQSHA_ITEMS` + `BDS_CONTENIDOS_FIQSHA` | Hardcode por ítem |
| Historial y certificados | Mezcla `BDS_CONTENIDOS_UBITS` + `BDS_CONTENIDOS_FIQSHA` | Simulado (seed); certificado desde catálogo |
| Progreso | `BD_PLANES_FORMACION` + `BD_MASTER_COLABORADORES` + `mi-equipo-context` | Planes `Vigente`; progreso real por persona/área |

---

# 13. Deep links y QA rápido

| URL | Tab esperado |
|-----|--------------|
| `zona-estudio.html` | Plan de contenidos |
| `zona-estudio.html#competencias` | Plan de competencias |
| `zona-estudio.html#exclusivo` | Exclusivo para mi |
| `zona-estudio.html#historial` | Historial y certificados |
| `zona-estudio.html#progreso` | Progreso (vista líder) |

### Checklist Historial y certificados

- [ ] Toggle Cuadrícula ↔ Tabla conserva búsqueda activa
- [ ] Tabla: barra de progreso lg 60px + porcentaje
- [ ] Certificado: mezcla visible de No aplica / Pendiente / Descargar según BD y progreso simulado
- [ ] Descargar muestra toast informativo (sin descarga real)
- [ ] ~4 filas «en progreso» aparecen antes que completados
- [ ] Contador resultados respeta `formatIndicatorNumber`

### Checklist Plan de contenidos

- [ ] Selector lista solo planes Vigente / No vigente asignados a E006
- [ ] Cambiar plan actualiza widget + grid
- [ ] Plan No vigente muestra alerta error con «hace X días/semanas/meses»
- [ ] Búsqueda filtra por título, competencia, tipo, nivel

---

# 14. Pendientes conocidos (playground)

| Ítem | Tab | Notas |
|------|-----|-------|
| Modal / filtros avanzados | Contenidos, Exclusivo, Historial | Botón Filtrar sin handler |
| Envío recordatorio estudio | Progreso | Toast placeholder |
| Migración React completa | Todos | `zona-estudio.tsx` es placeholder |
| Historial real por usuario | Historial | Hoy es muestra del catálogo, no tracking LMS real |

---

# 15. Guía de migración a React

1. **Layout:** `ColaboradorLayout` `activeTab="study-zone"` (layout estándar con SubNav aprendizaje).
2. **Tabs:** componente Tab oficial + estado URL (`useRouter` hash o query).
3. **Planes:** importar `TAREAS_PLANES_DB` / helpers desde `@/lib/mockData` — usar misma API que `getPlanesParaColaborador`.
4. **Cards:** `<CardContent />` — nunca HTML crudo `course-card`.
5. **Toolbar:** composición `HeaderProduct` / toolbar-panel; historial añade `ButtonGroup` para vista.
6. **Tabla historial:** `UbitsTable` + `ProgressBar` + `UbitsButton` secondary xs para Descargar.
7. **Tokens:** solo `var(--color-*)` en CSS Modules.
8. **Copy:** textos **exactos** del vanilla (§7–10).
9. **Números:** `formatIndicatorNumber` en contadores.
10. **Sincronizar BD:** tras editar `bd-master/`, correr `npm run sync:bd-master` en `Ubits-React/`.

---

# 16. Referencias cruzadas

| Tema | Documento / archivo |
|------|---------------------|
| Planes de formación (modelo BD) | `lms-creator/contexto-planes-formacion-y-grupos.md` |
| Mi equipo (líder vs learner) | `aprendizaje/mi-equipo/contexto-mi-equipo.md` |
| Descarga certificados (Creator) | `lms-creator/certificados/contexto-descarga-certificados.md` |
| Toolbar + Ver como | `documentacion/componentes/toolbar-panel.html` |
| Empty state sin resultados | Regla producto en `CLAUDE.md` / cursor-rules |
| Progreso en tabla | `aprendizaje/mi-equipo/planes.html` + `progress-bar.js` → `tableProgressCellHtml` |

---

*Última actualización: documentación alineada con vanilla post-implementación de vista tabla + certificados en Historial (jul 2026).*
