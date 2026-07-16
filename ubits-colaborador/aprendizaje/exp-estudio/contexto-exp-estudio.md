# Experiencia de estudio (consumo de contenido) — contexto de producto y playground

> Documento de referencia para implementar y mantener en **Referente-Vanilla** la **experiencia del colaborador al estudiar un contenido** (curso demo y, en el futuro, otros tipos). Cubre la **portada**, la **navegación y consumo de recursos** y la **página de cierre** tras finalizar.

**Estado del documento:** experiencia demo `f007` orquestada en vanilla (`exp-estudio.html`) + React (`/ubits-colaborador/aprendizaje/exp-estudio`). Componentes § 11 ✅. Pendiente opcional: persistencia § 8.1.

**Alcance explícito:** vista **100 % colaborador** (learner). **No** es LMS Creator, **no** es administrador HR, **no** es creación/edición de contenido.

**Nota de alcance del doc:** este archivo describe **solo el referente vanilla** (`Referente-Vanilla/`). La migración a React es un mundo aparte y no se documenta aquí.

**Contexto del módulo:** leer primero [`../contexto-aprendizaje.md`](../contexto-aprendizaje.md) (usuario demo, mapa de productos Modo estudio IA vs exp-estudio).

---

## 1. Problema de negocio

En UBITS un **contenido** es la unidad de aprendizaje que el colaborador consume. No todos los contenidos son «cursos» en el sentido coloquial: el catálogo incluye varios **tipos de contenido** (ver § 3).

La **experiencia de estudio** es el flujo que vive el estudiante **después** de decidir entrar a un contenido y **mientras** (y al terminar) lo recorre: ver la portada, avanzar por los recursos pedagógicos y cerrar con una pantalla de felicitación.

| Necesidad | Qué debe resolver esta experiencia |
|-----------|-----------------------------------|
| Orientarse antes de empezar | **Portada** — contexto, expectativas, CTA para iniciar o continuar |
| Consumir el material | **Recursos** — secciones con páginas y el recurso principal de cada una |
| Cerrar el ciclo de aprendizaje | **Página de cierre** — reconocimiento al completar el contenido |

### 1.1 Puntos de entrada

El colaborador entra a `exp-estudio.html` desde **cualquier pantalla de `ubits-colaborador/`** que muestre un contenido clicable:

| Origen | Patrón de interacción |
|--------|----------------------|
| **Cards de contenido** (`card-content`, `card-content-compact`) | Clic en la card → experiencia de estudio del contenido asociado |
| **Tablas con contenidos** | Clic en la **celda del título** del contenido → experiencia de estudio |
| **Historial** (zona de estudio) | Card o fila de tabla: título clicable |
| **Tareas** | Tareas tipo contenido con card de contenido relacionado → card clicable |
| **Aprendizaje** (home, catálogo, zona de estudio, etc.) | Mismo criterio: card o título en tabla |

**Regla transversal:** no es exclusivo del módulo Aprendizaje; cualquier `ubits-colaborador/*` que renderice un contenido debe enlazar aquí.

**Excepción — Rutas de aprendizaje:** en cards se ven como otro tipo de contenido, pero por dentro son **agrupadores**. En BD ya están discriminadas (`tipoContenido: "Ruta de aprendizaje"`). **Por ahora**, clic en una ruta **no navega** a ningún lado; la experiencia de estudio de ruta se hará después.

### 1.2 Progreso parcial y reanudación

| Situación | Comportamiento |
|-----------|----------------|
| Usuario sale del flujo (sidebar, otra pestaña del producto, etc.) y **vuelve** sin refrescar | El estado del flujo se **mantiene en memoria** |
| Usuario vuelve a entrar al mismo contenido (misma sesión, sin refresh) | Llega a **portada** con CTA **«Continuar»** que retoma desde la **última página vista** |
| Usuario entra sin haber iniciado nunca | Portada con CTA **«Comenzar ahora»** → vista **Recursos**, página 1 (§ 5.4.2, § 6) |
| Usuario con progreso parcial | Portada con CTA **«Continuar»** (§ 5.6.1) → vista **Recursos**, última página vista |
| Usuario **refresca** la página (`F5`, recarga) | El flujo se reinicia según reglas de persistencia (§ 8 — pendiente screenshots) |

### 1.3 Alcance por tipo de contenido

| Tipo | ¿Usa exp-estudio? |
|------|-------------------|
| Curso, Short, Charla, Artículo, Podcast, Libro, Ideas de libro, Caso de estudio, Documento técnico, Ejercicios de práctica | **Sí** — misma experiencia (Portada → Recursos → Cierre) |
| Ruta de aprendizaje | **No** en v1 — clic sin destino; experiencia futura |
| Programa | Pendiente confirmar; no mencionado en alcance v1 |

El **primer demo** puede ser un contenido tipo **Curso**, pero la **shell y el flujo** aplican a todos los tipos consumibles del § 3 (salvo rutas).

---

## 2. Dónde vive en el playground

| Aspecto | Valor acordado |
|--------|----------------|
| **Carpeta** | `ubits-colaborador/aprendizaje/exp-estudio/` |
| **Página principal** | `exp-estudio.html` |
| **Layout** | **Estándar colaborador** — Sidebar + SubNav aprendizaje + contenido |
| **SubNav Aprendizaje** | **Visible** durante Portada, Recursos y Cierre |
| **Navegación producto** | **Sí** — el usuario puede usar sidebar y tab bar sin quedar «atrapado» en el contenido |

Referencia de layout: `zona-estudio.html`, `home-learn.html` (shell colaborador con SubNav).

### 2.1 Layout de página

**Definición cerrada:** layout **estándar colaborador** (tipo 1 del README vanilla):

- `loadSidebar('default', …)` + `loadSubNav(…, 'aprendizaje')` + área de contenido en `content-sections`
- **No** layout inmersivo (`page-layout-immersive`)
- El estudiante **no pierde** el chrome del producto: puede ir a Tareas, Perfil, etc. y volver

### 2.2 Chrome durante el estudio

Durante Portada / Recursos / Cierre el usuario **sí** puede navegar al resto del producto (sidebar, tab bar móvil). No hay modo «fullscreen obligatorio» ni bloqueo de salida.

### 2.3 URL y deep links

**Esquema acordado para vanilla:**

```
ubits-colaborador/aprendizaje/exp-estudio/exp-estudio.html?id=<contentId>#<vista>
```

| Pieza | Uso |
|-------|-----|
| `id` | Identificador del contenido en catálogo mock (`u001`, `f014`, etc.) |
| `#<vista>` | Deep link de pantalla/estado para QA (mismo espíritu que LMS Creator `#recursos` / `#certificado`) |

Sin hash → portada según progreso en sesión (o **sin iniciar** si no hay estado).

**Resolución de datos en portada (mínimo v1):**

1. Buscar `id` en `bd-master/bd-contenidos-ubits.js` → `BDS_CONTENIDOS_UBITS.contents`
2. Si no existe, buscar en `bd-master/bd-contenidos-fiqsha.js` → `contents` y `contentsCreatorOnly`
3. Con el registro encontrado, pintar en portada al menos: **imagen**, **título**, **descripción** y demás propiedades del objeto catálogo (`tipoContenido`, `tiempoValor`, `nivelId`, `conCertificacion`, etc.)

**Estado en sesión:** memoria JS para no perder avance al navegar el producto sin refrescar. Los hashes permiten **saltar** a cualquier vista con valores demo precargados (páginas anteriores = Completadas cuando haga falta). Semilla una vez por carga si la sesión está vacía (`window._expEstudioDemoSeeded` o equivalente). Cambiar el hash en caliente **sí** debe poder saltar entre vistas (QA).

#### 2.3.1 Catálogo de deep links (curso demo § 3.3)

IDs de página = mock § 11.1 (`p-1` … `p-6`). Alias cortos opcionales = misma vista.

##### Portada (§ 5)

| Hash | Vista | Seed demo al entrar directo |
|------|-------|-----------------------------|
| `#portada` o `#portada-sin-iniciar` | Portada **sin iniciar** | 0 %; índice todo Bloqueada; CTA **Comenzar ahora** |
| `#portada-en-progreso` | Portada **en progreso** | Ej. 2/5 completadas (video+PDF); CTA **Continuar**; índice con ✓ / activa / 🔒 |
| `#portada-completado` | Portada **completado** | 100 %; índice todo ✓; CTAs **Ver más contenidos** + **Descargar certificado** |

##### Recursos — páginas del índice (§ 6)

| Hash canónico | Alias | Página mock | Tipo | Seed demo |
|---------------|-------|-------------|------|-----------|
| `#pagina-p-1` | `#video` | `p-1` Comunicación… | Video + complementarios | Páginas anteriores: ninguna; fila Activa; % 0 o parcial según reglas |
| `#pagina-p-2` | `#pdf` | `p-2` Guía mapa… | PDF | `p-1` Completada |
| `#pagina-p-3` | `#scorm-1` | `p-3` Simulador… | SCORM | `p-1`–`p-2` Completadas |
| `#pagina-p-4` | `#scorm-2` | `p-4` Conversaciones… Thomas-Kilmann | SCORM | `p-1`–`p-3` Completadas |
| `#pagina-p-5` | `#evaluacion` | `p-5` Evaluación | Evaluación | Equivale a **`#eval-bienvenida`** (primera llegada a la fila) |
| `#pagina-p-6` | `#cierre` | `p-6` Fin del contenido | Cierre § 7 | Todas consumibles Completadas + confeti al montar |

Vista Recursos = layout § 6.1 (visor izq. + `TituloProgresoYNav` + índice).

##### Evaluación — subestados (§ 6.8)

Misma fila `p-5`; el hash elige la fase/variante **sin** obligar a contestar. Detalle copy/Figma: § 6.8.0.

| Hash | Estado | Seed demo |
|------|--------|-----------|
| `#eval-bienvenida` | Fase 1 Bienvenida | = primera entrada a Evaluación; intento no iniciado |
| `#eval-intento` | Fase 2 preguntas + sticky | Banco `collab`; respuestas vacías o parciales |
| `#eval-retomar` | APP: evaluación en pausa | Copy «Dejaste en pausa…»; CTA **Responder la evaluación** → `#eval-intento` |
| `#eval-resultado-aprobado` | Resultado aprobado | Score mock alto; CTA **Continuar** → cierre |
| `#eval-resultado-reprobado` | Resultado reprobado (quedan intentos) | Score bajo; CTA **Reintentar** |
| `#eval-resultado-tiempo` | Tiempo agotado | CTA **Reintentar** |
| `#eval-resultado-limite` | Límite de intentos | CTA **Ir al inicio** |

##### Ejemplos listos para copiar

```
…/exp-estudio/exp-estudio.html?id=<contentId>#portada-sin-iniciar
…/exp-estudio/exp-estudio.html?id=<contentId>#portada-en-progreso
…/exp-estudio/exp-estudio.html?id=<contentId>#portada-completado
…/exp-estudio/exp-estudio.html?id=<contentId>#video
…/exp-estudio/exp-estudio.html?id=<contentId>#pdf
…/exp-estudio/exp-estudio.html?id=<contentId>#scorm-1
…/exp-estudio/exp-estudio.html?id=<contentId>#scorm-2
…/exp-estudio/exp-estudio.html?id=<contentId>#eval-bienvenida
…/exp-estudio/exp-estudio.html?id=<contentId>#eval-intento
…/exp-estudio/exp-estudio.html?id=<contentId>#eval-retomar
…/exp-estudio/exp-estudio.html?id=<contentId>#eval-resultado-aprobado
…/exp-estudio/exp-estudio.html?id=<contentId>#eval-resultado-reprobado
…/exp-estudio/exp-estudio.html?id=<contentId>#eval-resultado-tiempo
…/exp-estudio/exp-estudio.html?id=<contentId>#eval-resultado-limite
…/exp-estudio/exp-estudio.html?id=<contentId>#cierre
```

**Enlaces desde el resto del playground** (entrada normal = portada, sin forzar hash):

```html
<a href="../aprendizaje/exp-estudio/exp-estudio.html?id=u014">…</a>
```

Rutas relativas según la página origen; el `id` siempre es el del catálogo.

---

## 3. Tipos de contenido (catálogo UBITS)

En datos mock del playground, los tipos viven en `bd-master/bd-master-tipos-contenido.js` y el campo de catálogo es **`tipoContenido`** (texto del nombre).

| ID | Nombre | Exp-estudio v1 |
|----|--------|----------------|
| tct-001 | Curso | ✅ |
| tct-002 | Short | ✅ |
| tct-003 | Charla | ✅ |
| tct-004 | Artículo | ✅ |
| tct-005 | Podcast | ✅ |
| tct-006 | Libro | ✅ |
| tct-007 | Ideas de libro | ✅ |
| tct-008 | Caso de estudio | ✅ |
| tct-009 | Documento técnico | ✅ |
| tct-010 | Ejercicios de práctica | ✅ |
| tct-011 | Ruta de aprendizaje | ❌ clic sin destino |
| tct-012 | Programa | Pendiente |

En `BDS_CONTENIDOS_UBITS` las rutas ya vienen con `tipoContenido: "Ruta de aprendizaje"` y descripción de agrupador.

### 3.1 Curso demo del playground

**Tipo:** `Curso` (contenido genérico de conflictos en equipos).

**ID catálogo:** **`f007`** — `bd-contenidos-fiqsha.js` · «Resolución efectiva de conflictos en equipos de trabajo» · `catalogo_fiqsha` · `conCertificacion: true`. La **estructura pedagógica** (índice) vive en `bd-exp-estudio-demo.js` — ver § 3.3 y § 11.1.

### 3.2 Estructura del flujo por tipo

**Definición cerrada:** la estructura **Portada → Recursos (secciones + páginas) → Cierre** es **la misma** para todos los tipos consumibles. No hay variantes tipo «Short sin portada» en v1.

**Excepción:** Rutas de aprendizaje — flujo distinto, fuera de alcance.

### 3.3 Índice del curso demo (playground) — definición cerrada

Curso genérico con **2 secciones** y **6 ítems** en el índice (`IndiceExpEstudio`). Copy **exacto** de títulos.

**Alineación con Creator:** mismos títulos y tipos de página que el seed de `crear-contenido.html` (video, PDF, **dos SCORM**, evaluación). En learner se añade el ítem fijo `Fin del contenido`.

**Fuera de alcance v1:** encuesta de satisfacción y sección índice `Cierre` con encuesta (existen en Figma producción, pero **no** se implementan hasta tener ese contenido creado).

```
Sección 1: Fundamentos                              ▾
  Comunicación para desescalar un conflicto         🔒
  Guía mapa de conflicto                           🔒

Sección 2: Herramientas para resolver conflictos    ▾
  Simulador de conversación difícil                 🔒
  Conversaciones difíciles según Thomas-Kilmann     🔒
  Evaluación                                        🔒
  Fin del contenido                                 🔒
```

> Cada sección = tarjeta separada (como Creator). Encabezado: título + chevron; botón info si hay descripción (§ 4.3.1). Sin contador ni `bg-3`.

| # | Sección | Título página | Tipo recurso (índice) | Notas |
|---|---------|---------------|----------------------|-------|
| 1 | `Sección 1: Fundamentos` | `Comunicación para desescalar un conflicto` | Video | Primera página al «Comenzar ahora»; **complementarios** descarga + texto en demo (§ 6.3) |
| 2 | `Sección 1: Fundamentos` | `Guía mapa de conflicto` | PDF | |
| 3 | `Sección 2: Herramientas para resolver conflictos` | `Simulador de conversación difícil` | SCORM | Mismo mount Creator (`.cc-scorm-resource` / `simulador-scorm.html`) |
| 4 | `Sección 2: Herramientas para resolver conflictos` | `Conversaciones difíciles según Thomas-Kilmann` | SCORM | Segundo SCORM del seed Creator (ruta IA en edición) |
| 5 | `Sección 2: Herramientas para resolver conflictos` | `Evaluación` | Evaluación | |
| 6 | `Sección 2: Herramientas para resolver conflictos` | `Fin del contenido` | Fin | Ítem fijo; al **`Continuar`** desde la evaluación → **pantalla de cierre** § 7 (confeti) |

- **Total páginas consumibles:** 5 (video, PDF, 2× SCORM, evaluación). `Fin del contenido` es marcador de cierre en el índice, no una página de recurso intermedio.
- **Encuesta / Embebido / Texto principal:** omitidos en el índice demo v1 (Embebido y Texto sí se pueden renderizar si un contenido futuro los trae — § 6.2).

---

## 4. Arquitectura de la experiencia

### 4.1 Flujo de alto nivel

```
[Entrada: card-content / título en tabla / tarea con contenido]
        │
        ▼
   ┌─────────┐
   │ PORTADA │  ← Metadata del catálogo + CTA Comenzar / Continuar
   └────┬────┘
        │
        ▼
   ┌─────────┐
   │RECURSOS │  ← Secciones → páginas → visor del recurso activo
   │         │     + índice lateral learner (componente nuevo)
   │         │     + barra de progreso global
   └────┬────┘
        │
        ▼ (última página consumible + Continuar)
   ┌─────────┐
   │ CIERRE  │  ← «Fin del contenido» — felicitación + confeti (§ 7)
   └────┬────┘
        │ (Regresar a portada / reentrada)
        ▼
   Portada estado **Completado** (§ 5.6b) — mismos CTAs de salida
```

### 4.2 Secciones y páginas (Recursos)

**Definición cerrada:** después de la portada existen **secciones**; cada sección contiene **páginas**.

Es la **misma jerarquía pedagógica** que en Creator (`crear-contenido.html` + `indice-creator` + `paginas-creator`), pero en **vista de consumo** (solo lectura, sin edición).

```
Contenido
├── Portada (pantalla única, no es sección del índice)
└── Recursos
    ├── Sección 1
    │   ├── Página 1.1  → recurso principal (+ complementarios)
    │   └── Página 1.2
    └── Sección 2
        └── Página 2.1
```

Referencia autor: `lms-creator/contexto-creacion-contenido.md`, `lms-creator/crear-contenido.html`.

### 4.3 Índice lateral (componente nuevo)

**Definición cerrada:** **no** reutilizar tal cual `indice-creator` ni `sidebar-contenidos-lms`.

- Componente **`SeccionExpEstudio`** — tarjeta por sección (misma base visual que `seccion-creator`)
- Componente **`IndiceExpEstudio`** — stack de secciones + filas de página (ver § 5.4.3 / § 5.7)
- Estados de progreso: `Por iniciar` (§ 5.4.3), `En progreso` (§ 5.6.3), `Completado` (§ 5.6b.3)
- Candado / check / progress: **`Feedback`** 24px (`Locked` \| `Check` \| `Progress`)

**UX visual (acordado — alineado a Creator):** cada sección es una **tarjeta separada** (`bg-1`, borde `border-1`, `border-radius-lg`). El índice es un **stack** con `gap-md` — **sin** card envolvente ni cabecera `bg-3`. Las secciones son **colapsables** (chevron animado). **Sin** contador de páginas. Si la sección tiene descripción en Creator, se muestra el botón **info** (`fa-circle-info`) como en `seccion-creator`.

**Referencia Figma APP (colapso):** [Content course — secciones colapsables](https://www.figma.com/design/zHCCbQamZeiZJPlT7GEKDs/APP-v3.0.0?node-id=1756-11404&m=dev) (`1756:11404`). Base visual de tarjeta: Creator (`seccion-creator`). Botón info: patrón Creator / seed `crear-contenido.js`.

| Aspecto | Comportamiento |
|---------|----------------|
| Contenedor índice | Stack transparente + `gap-md` (como `indice-creator` / `seccion-creator-index__stack`) |
| Cada sección | Tarjeta propia (`SeccionExpEstudio`) — no un único card con varias cabeceras |
| Encabezado sección | Título a la izquierda; a la derecha **info** (si hay descripción) + **chevron**; fondo transparente / `bg-1` (**sin** `bg-3`) |
| Expandida / colapsada | Chevron `fa-chevron-down` con rotación 180° |
| Toggle | Clic en el encabezado (excepto el botón info) |
| Botón info `[i]` | Solo si la sección trae `descriptionHtml` no vacío (igual criterio Creator `hasDescription`) |
| Contenido demo | Títulos § 3.3; **Sección 2** tiene descripción del seed Creator (§ 4.3.1) |

#### 4.3.1 Modal «descripción de sección» (botón info)

Misma intención que el ⓘ de Creator, pero **solo lectura** para el colaborador (no editar).

| Parte | Valor |
|-------|--------|
| Trigger | Botón icon-only `fa-circle-info` en el encabezado — tooltip / `aria-label`: **`Sección con descripción`** (igual Creator) |
| Cuándo se muestra | Solo secciones con descripción (demo: **Sección 2**; Sección 1 sin descripción → sin botón) |
| Título del modal | Título de la sección (ej. `Sección 2: Herramientas para resolver conflictos`) |
| Cuerpo | HTML/texto de descripción de Creator — **no editable**, solo lectura |
| Footer | Un solo botón primario: **`Entendido`** (cierra el modal) |
| Componente | Modal DS (`openModal` / `UbitsModal`) tamaño `sm` |

**Copy descripción demo (Sección 2)** — exacto seed Creator:

```
Simulaciones, marcos de referencia y evaluación para aplicar lo aprendido en situaciones reales de conflicto en el trabajo.
```

(HTML seed: `<p class="ubits-body-md-regular">…</p>` en `crear-contenido.js` → `recursosSectionMeta[CC_DEMO_SEC2]`.)

| Componente existente | Rol | ¿Usar en learner? |
|---------------------|-----|-------------------|
| `indice-creator` | Índice edición Creator | ❌ No directo |
| `sidebar-contenidos-lms` | Sidebar catálogo LMS | ❌ No directo |
| **`IndiceExpEstudio`** (nuevo) | Índice navegación consumo | ✅ Portar patrón APP + tokens UBITS |

### 4.4 Barra de progreso global

**Definición cerrada:** **sí** hay indicador de progreso del contenido.

| Ubicación | Componente | Cuándo |
|-----------|------------|--------|
| **Portada sin iniciar** | — | No visible (§ 5.4.4) |
| **Portada en progreso** | `ProgresoExpEstudio` `In Progress` (§ 5.6.2) | Barra azul, `NN %` |
| **Portada finalizado** | `ProgresoExpEstudio` `Completed` (§ 5.6b.2) | Barra verde, `100 %` |
| **Vista Recursos** | `ProgresoExpEstudio` dentro de `TituloProgresoYNav` (§ 6.4) | Misma barra 8px; estados `No progress` / `In Progress` / `Completed` |

Detalle visual portada documentado en § 5.6.2 y § 5.6b.2. Métrica: % páginas consumibles completadas (§ 3.3).

---

## 5. Bloque 1 — Portada

**Propósito:** pantalla de bienvenida al contenido antes de consumir recursos. Equivalente conceptual al **paso Portada del Creator**, pero en modo **solo lectura** para el estudiante.

**Datos:** catálogo vía `?id=` (§ 2.3) + estructura pedagógica (secciones/páginas) desde mock de consumo (§ 11 — pendiente).

**Deep links QA:** `#portada-sin-iniciar` · `#portada-en-progreso` · `#portada-completado` (§ 2.3.1).

**Fuente de verdad visual:** Figma **Learner v4** (archivo `ivTgxM9bL6vcvGU90P8oGg`). Las capturas LXP sirven como referencia complementaria; ante discrepancia, **prevalece Figma**.

### 5.0 Referencias Figma — portada

| Estado | Variante | Frame Figma | Node ID | URL Dev Mode |
|--------|----------|-------------|---------|--------------|
| Sin iniciar | **UBITS** | `Home contenido - Version UBITS - sin iniciar` | `40006351:17931` | [Figma](https://www.figma.com/design/ivTgxM9bL6vcvGU90P8oGg/Learner-v4--Deprecated--mejor-ver-Playground?node-id=40006351-17931&m=dev) |
| Sin iniciar | **FIQSHA / Empresa** | `Home contenido - Version empresa - sin iniciar` | `40006352:22481` | [Figma](https://www.figma.com/design/ivTgxM9bL6vcvGU90P8oGg/Learner-v4--Deprecated--mejor-ver-Playground?node-id=40006352-22481&m=dev) |
| **En progreso** | **UBITS** (referencia columna derecha; FIQSHA igual) | `Home de contenido versión UBITS - en progreso` | `40006338:44692` | [Figma](https://www.figma.com/design/ivTgxM9bL6vcvGU90P8oGg/Learner-v4--Deprecated--mejor-ver-Playground?node-id=40006338-44692&m=dev) |
| **Finalizado / Completado** | **UBITS** (FIQSHA igual en columna derecha) | `Home de contenido versión UBITS - completado` | `40006350:2730` | [Figma](https://www.figma.com/design/ivTgxM9bL6vcvGU90P8oGg/Learner-v4--Deprecated--mejor-ver-Playground?node-id=40006350-2730&m=dev) |

Discriminación en BD: `origen` / `catalogoId` — `catalogo_fiqsha` vs `catalogo_ubits`.

**Capturas LXP complementarias (jul 2026):**

| Origen | Archivo local |
|--------|---------------|
| FIQSHA en producción | `assets/Captura_de_pantalla_2026-07-03_…png` |
| UBITS en producción | `assets/screencapture-lxp-ubitslearning-learner-content-200842-…png` |

### 5.1 Layout general de portada

Dentro del **layout estándar colaborador** (sidebar + SubNav), el área de contenido usa **dos columnas** en desktop (gap 24px):

```
┌─────────────────────────────────────────────────────────────────┐
│ SubNav (logo cliente en empresa; tabs aprendizaje)               │
├──────────────────────────────┬──────────────────────────────────┤
│  COLUMNA IZQUIERDA (703px)   │  COLUMNA DERECHA (flex ~471px)   │
│  bg-2, cards apiladas gap 20 │  gap 20 entre bloques            │
│                              │                                  │
│  · Hero video/tráiler        │  · TituloSpecsCtaExpEstudio       │
│  · Bloques informativos      │  · IndiceExpEstudio (preview)    │
│    (varían por origen)       │                                  │
└──────────────────────────────┴──────────────────────────────────┘
```

- **Columna izquierda:** **igual** en todos los estados (sin iniciar / en progreso / finalizado). Solo cambia § 5.2 vs § 5.3 por origen catálogo.
- **Columna derecha (portada):** cambia según progreso del usuario — ver § 5.4 (sin iniciar), § 5.6 (en progreso), § 5.6b (finalizado).
- **Columna derecha (Recursos):** layout distinto — ver § 6.4 (`TituloProgresoYNav` + índice navegable).

**Hero / tráiler (Figma):** bloque `Video` — imagen 396px alto, `border-radius-lg`. Overlay central **play** (fondo `rgba(0,0,0,0.7)`, ícono play sólido). Equivalente playground: `learn-content-img-trailer` con tráiler reproducible.

### 5.2 Columna izquierda — **FIQSHA / Empresa** (`catalogo_fiqsha`)

Frame: `Home contenido - Version empresa - sin iniciar`.

| Orden | Componente Figma | Contenido | Fuente mock |
|-------|------------------|-----------|-------------|
| 1 | `Video` | Hero con play de tráiler | `imagen` + URL tráiler si aplica |
| 2 | `FichaCompetenciasYHabilidades` **tipo `Empresa`** | Label **`Categoría`** + un chip (ej. `Trabajo en equipo`) | Categoría corporativa / competencia simplificada |
| 3 | `DescripcionExpEstudio` | Título `Descripción` + párrafos con **negritas inline** en frases clave | `descripcion` (puede ser copy enriquecido del autor) |

**No aparecen** en Figma empresa: bloque `Competencia` + `Habilidades de este contenido` separados, `Aliados`, `Expertos`.

**Ejemplo copy (Figma):** descripción larga en varios párrafos con bold en «comprender mejor los conflictos…», «qué es un conflicto…», «herramientas prácticas», etc.

### 5.3 Columna izquierda — **UBITS** (`catalogo_ubits`)

Frame: `Home contenido - Version UBITS - sin iniciar`.

| Orden | Componente Figma | Contenido | Fuente mock |
|-------|------------------|-----------|-------------|
| 1 | `Video` | Hero con play de tráiler | `imagen` del catálogo |
| 2 | `FichaCompetenciasYHabilidades` **tipo `Contenido Ubits`** | **`Competencia`** (avatar 28px + nombre) + **`Habilidades de este contenido`** (chips) | `competenciaPrincipalId`, `habilidadPrincipalId`, `habilidadesSecundariasIds` |
| 3 | `DescripcionExpEstudio` | Título `Descripción` + texto (puede incluir negritas) | `descripcion` |
| 4 | `AliadosExpEstudio` | Label `Aliados` + logo + nombre/enlace + párrafo | `aliadoId` / `providersAliadosIds` |
| 5 | `ExpertosExpEstudio` | Label `Expertos` + lista (avatar 96px, LinkedIn, cargo, bio) | campo `expertos[]` del catálogo |

**Ejemplo Figma (curso conflictos):**

- **Competencia:** Trabajo en equipo
- **Habilidades:** `Gestión del conflicto`, `Relacionamiento`, `Autoconocimiento`, `Comunicación`
- **Aliado:** WOBI
- **Expertos:** Laura Huang (+ opcionalmente más con divider)

### 5.4 Columna derecha — estado **SIN INICIAR** (común FIQSHA y UBITS)

Dos bloques apilados (no una sola card que los envuelva):

1. **`TituloSpecsCtaExpEstudio`**
2. **`IndiceExpEstudio`** — `state: Por iniciar`

#### 5.4.1 `TituloSpecsCtaExpEstudio`

| Elemento | Detalle Figma |
|----------|---------------|
| **Badge tipo** | **Badge Tag** oficial (§ 5.4.1a) — encima del título; texto = `tipoContenido` (ej. `Curso`) |
| **Título** | `display/d4/bold` — 28px, ej. «Resolución efectiva de conflictos en equipos de trabajo» |
| **Specs fila 1** | `SpecNivel` + `SpecText` tiempo + `SpecText` idioma |
| **Specs fila 2** | `SpecText` **Con certificado** + `SpecText` **Subtítulos** (solo UBITS; oculto en empresa) |
| **CTAs** | Botón oficial UBITS (`primary` / `secondary`, `md`) — § 5.4.2 / § 5.6 / § 5.6b |
| **Progreso** | Solo en *En progreso* / *Completado*: componente **`ProgresoExpEstudio`** (§ 5.6.2) |

##### 5.4.1a Badge de tipo de contenido — Badge Tag oficial (obligatorio)

El pill encima del título del curso **no** se inventa con CSS/HTML suelto. Es el componente **Badge Tag** del design system.

| Aspecto | Valor |
|---------|--------|
| Componente | **Badge Tag** — Vanilla: `components/badge-tag.css` · React: `UbitsBadge` (`@/components/ui/Badge`) |
| Variante | `outlined` |
| Color | `info` (punto azul / indicador info) |
| Tamaño | `sm` |
| Contenido | Texto de `tipoContenido` del catálogo (ej. `Curso`, `Ruta de aprendizaje`) — **sin** ícono FontAwesome (solo el **dot** del badge) |
| Layout | El badge **abraza el texto** (`align-items: flex-start` en el heading); **no** estirar a full width |

**React (playground):**

```tsx
<UbitsBadge color="info" variant="outlined" size="sm">
  {contentType}
</UbitsBadge>
```

**Vanilla (markup):**

```html
<span class="ubits-badge-tag ubits-badge-tag--outlined ubits-badge-tag--info ubits-badge-tag--sm">
  <span class="ubits-badge-tag__indicator" aria-hidden="true"></span>
  <span class="ubits-badge-tag__text">Curso</span>
</span>
```

**Prohibido:** reimplementar el pill con clases locales tipo `__badge` / `__badge-dot` dentro de `titulo-specs-cta-exp-estudio`. Si hace falta otro color/variante, se cambia en Badge Tag; no se forkear estilos.

**Metadata — componentes `SpecNivel` / `SpecText`:**

| Spec | Ícono FA (light) | Texto ejemplo | Campo BD |
|------|------------------|---------------|----------|
| Nivel | `gauge-min` | `Básico` | `nivelId` |
| Tiempo | `fa-clock` (`\f017`) | `60 min` | `tiempoValor` + unidad |
| Idioma | `fa-globe` (`\f0ac`) | `Español` | `idioma` |
| Certificado | `fa-file-certificate` (`\f5f3`) | `Con certificado` | `conCertificacion === true` |
| Subtítulos | `fa-closed-captioning` (`\f20a`) | `Subtítulos: Español, Inglés, Portugués` | metadato contenido (solo UBITS en Figma) |

**Diferencia empresa vs UBITS en specs:** frame empresa usa `subtitulos={false}` — no muestra fila de subtítulos.

#### 5.4.2 CTA principal — sin iniciar

| Propiedad | Valor Figma |
|-----------|-------------|
| **Texto exacto** | `Comenzar ahora` |
| **Ícono** | Play blanco 16px a la izquierda |
| **Estilo** | Botón primario `#0c5bef`, full width, `border-radius` 8px |
| **Acción** | Inicia contenido → primera página de recursos |

> Estado **iniciado** cambia CTA → § 5.6 (pendiente Figma).

#### 5.4.3 `IndiceExpEstudio` — preview en portada (`state: Por iniciar`)

Stack de **`SeccionExpEstudio`** (una tarjeta por sección, como Creator): cada una con tokens `bg-1`, borde `border-1`, `border-radius-lg`. Separadas con `gap-md`. **Sin** card envolvente del índice ni cabecera `bg-3`. Secciones colapsables (sin contador) + filas de página (§ 4.3).

**Encabezado de sección (colapsable — base Creator):**

| Parte | Detalle |
|-------|---------|
| Contenedor | Cada sección = tarjeta propia; índice = stack con gap |
| Fondo cabecera | Transparente / `bg-1` — **no** `bg-3` |
| Padding cabecera | `padding-sm` / `padding-md`, `min-height: space-12` (como Creator) |
| Izquierda | Título sección, semibold ~16px, `fg-1-high` — demo: `Sección 1: Fundamentos`, `Sección 2: Herramientas para resolver conflictos` |
| Derecha | **Info** (`fa-circle-info`) si hay descripción + **chevron** animado. **Sin** contador `{N}` |
| Interacción | Toggle expand/collapse; info abre modal § 4.3.1 (demo: solo Sección 2) |

**Sin** sección índice `Cierre` ni encuesta en el curso demo (§ 3.3) — aunque el frame APP las muestre como ejemplo.

**Fila de página (`PaginasExpEstudio`) — base = Páginas Creator:**

Misma fila de lista que `paginas-creator` / `PaginasCreator`: borde inferior, rail izquierdo, icono tipo 24×24, título ellipsis. **Sin** drag handle ni menú ⋮.

| Parte | Detalle |
|-------|---------|
| Ícono tipo | Igual Creator (`far fa-video`, `fa-cube`, etc.) en wrap 24×24 |
| Título | `ubits-body-sm-semibold`; colores como Creator (medium / brand si Activa / on-disabled si Bloqueada) |
| Trailing | En lugar del menú: **Feedback** **Locked** / **Progress** / **Check** (24px), siempre visible |
| Rail activa | Franja brand `--space-1` (igual Creator `is-active`) |

**Tipos de página en índice (íconos):**

| Tipo | Ícono (FA / patrón) |
|------|---------------------|
| Video | `fa-video` / camera |
| Texto | Doc texto |
| PDF | `fa-file-pdf` |
| Encuesta | — _No en curso demo v1_ |
| Embebido | Embed |
| SCORM | `fa-cube` |
| Evaluación | Checklist / test |
| Fin | Party / cierre — texto fijo `Fin del contenido` |

**Índice del curso demo (playground)** — § 3.3:

```
Sección 1: Fundamentos                              ▾
  ▶ Comunicación para desescalar un conflicto       🔒
  📕 Guía mapa de conflicto                         🔒
Sección 2: Herramientas para resolver conflictos    ▾
  📦 Simulador de conversación difícil               🔒
  📦 Conversaciones difíciles según Thomas-Kilmann   🔒
  ☑ Evaluación                                      🔒
  🎉 Fin del contenido                              🔒
```

> Default playground: secciones **expandidas** al cargar portada. El usuario puede colapsar cualquiera.

**Reglas estado Por iniciar:**

- Todas las páginas: `state: Bloqueada`, candado visible, texto disabled
- Páginas **no clicables** hasta pulsar `Comenzar ahora`
- Colapsar/expandir sección **sí** permitido en todos los estados de portada/recursos

#### 5.4.4 Lo que NO aparece en columna derecha (sin iniciar)

- Widget **`ProgresoExpEstudio`** — solo en estados **en progreso** (§ 5.6.2) y **finalizado** (§ 5.6b.2)
- CTAs secundarios

### 5.6 Columna derecha — estado **EN PROGRESO** (delta vs § 5.4)

**Alcance:** solo documenta **qué cambia en la columna derecha** respecto a sin iniciar. La columna izquierda **no cambia**. El patrón es **idéntico** para UBITS y FIQSHA/empresa (mismos componentes; en FIQSHA el bloque `TituloSpecsCtaExpEstudio` puede omitir subtítulos — § 5.5).

**Referencia Figma:** `Home de contenido versión UBITS - en progreso` — node `40006338:44692`.

#### 5.6.1 Resumen de cambios (sin iniciar → en progreso)

| Elemento | Sin iniciar (§ 5.4) | En progreso (§ 5.6) | Finalizado (§ 5.6b) |
|----------|---------------------|---------------------|---------------------|
| `TituloSpecsCtaExpEstudio` | `Por iniciar` | `En progreso` | **`Completado`** |
| CTA principal | `Comenzar ahora` | `Continuar` | **`Ver más contenidos`** |
| CTA secundario | — | — | **`Descargar certificado`** |
| `ProgresoExpEstudio` | No | Sí (barra azul, `NN %`) | Sí (**barra verde, `100 %`**) |
| `IndiceExpEstudio` | `Por iniciar` | `En progreso` | **`Completado`** |

**Acción `Continuar`:** abre la **última página vista** (§ 1.2), no necesariamente la primera pendiente.

#### 5.6.2 `ProgresoExpEstudio` (widget nuevo en portada)

Componente Figma: **`ProgresoExpEstudio`** — `state: In Progress`.

Card blanca (`bg-1`), borde gris `border-1` 1px, `border-radius` 10px, padding horizontal 16px / vertical 8px. **Layout en una sola fila** (Figma Learn-Components). Se ve igual dentro de `TituloSpecsCtaExpEstudio` y `TituloProgresoYNav`:

`[fa-flag] [Tu progreso:] [======== barra ========] [NN %]`

| Parte | Detalle |
|-------|---------|
| Ícono | `fa-flag` (`\f024`), 16px, `fg-1-medium` |
| Label | **`Tu progreso:`** — `body/md/bold` 16px |
| Barra | Track `bg-4-static` (#dbdde0), indicador azul (o **verde** si Completed), altura **8px**, `border-radius-full`, `flex: 1` |
| Porcentaje | Texto **`NN %`** a la derecha de la barra — `semibold` 13px (ej. `50 %`) |

**Cálculo playground (curso demo § 3.3):**

```
% = (páginas completadas) / (páginas consumibles) × 100
```

- **Páginas consumibles:** las 5 de recurso (video, PDF, 2× SCORM, evaluación). **`Fin del contenido`** no cuenta para el % hasta completarse el flujo (confirmar en finalizado).
- Redondear para UI como en Figma (entero, ej. `40 %` = 2/5).

#### 5.6.3 `IndiceExpEstudio` — `state: En progreso`

Mismo stack de tarjetas que § 5.4.3 (secciones colapsables). Cada fila adopta uno de **cuatro estados**:

##### Estado `Completada`

| Aspecto | Detalle |
|---------|---------|
| Fondo fila | `bg-1` blanco |
| Título | `fg-1-high`, **bold** 13px |
| Ícono tipo | Color normal (no disabled) |
| Feedback derecho | **`Check`** — círculo 24px verde (`feedback/bg/success/subtle`) + borde success + ícono check 12px |

##### Estado `Activa` (página actual / última vista — aún no completada)

| Aspecto | Detalle |
|---------|---------|
| Fondo fila | `bg-2` (#f3f3f4) |
| Barra lateral | Franja **5px** `accent-brand` (#0c5bef) a la izquierda |
| Título + ícono tipo | Color **`accent-brand`**, bold 13px |
| Feedback derecho | **`Progress`** — círculo 24px fondo info subtle + borde brand + **spinner** 12px |

> En Figma el ejemplo activo usa tipo Scorm; el **patrón visual aplica a cualquier tipo** de página (video, PDF, embebido, evaluación, etc.).

##### Estado `Completada-activa` (completada **y** es la página actual)

Cuando el estudiante **vuelve** a una página que ya marcó como completada, el índice debe resaltarla para saber dónde está parado:

| Aspecto | Detalle |
|---------|---------|
| Fondo fila | `bg-2` (igual que Activa) |
| Barra lateral | Franja brand (igual que Activa) |
| Título + ícono tipo | Color **`accent-brand`** (igual que Activa) |
| Feedback derecho | **`Check`** (igual que Completada — **no** Progress) |

Estado en código: `completada-activa` (clases Vanilla `is-completada` + `is-activa` + `is-completada-activa`).

##### Estado `Bloqueada` (pendiente)

Igual que § 5.4.3 sin iniciar: texto `fg/on-disabled`, Feedback **`Locked`**.

##### Ejemplo mapeado al curso demo (§ 3.3)

Usuario completó sección 1 y está en el primer SCORM (2/5 → **40 %**):

```
Sección 1: Fundamentos                              ▾
  ▶ Comunicación para desescalar un conflicto       ✓
  📕 Guía mapa de conflicto                         ✓
Sección 2: Herramientas para resolver conflictos    ▾
  📦 Simulador de conversación difícil               ⟳  ← Activa
  📦 Conversaciones difíciles según Thomas-Kilmann   🔒
  ☑ Evaluación                                      🔒
  🎉 Fin del contenido                              🔒

Tu progreso: [████████░░░░░░░░] 40 %
[ Continuar ▶ ]
```

**Nota playground:** no mostrar sección `Cierre` ni encuesta en el índice (§ 3.3), aunque Figma producción las incluya en el frame de referencia.

#### 5.6.4 Orden vertical columna derecha (en progreso)

```
TituloSpecsCtaExpEstudio (En progreso)
  ├── badge + título + specs
  ├── botón Continuar
  └── ProgresoExpEstudio
IndiceExpEstudio (En progreso)
```

### 5.6b Columna derecha — estado **FINALIZADO / COMPLETADO** (delta vs § 5.4–5.6)

**Alcance:** solo cambia la **columna derecha**. Columna izquierda **igual**. Patrón **idéntico** UBITS y FIQSHA/empresa.

**Referencia Figma:** `Home de contenido versión UBITS - completado` — node `40006350:2730`.

**Disparador:** el usuario **terminó** el contenido (todas las páginas consumibles + pantalla cierre § 7). Si vuelve a la **portada** del mismo `?id=`, la portada muestra este estado.

#### 5.6b.1 CTAs

| Orden | Botón | Estilo Figma | Copy exacto | Acción playground |
|-------|-------|--------------|-------------|-------------------|
| 1 | Primario | `ubits-button--primary`, full width | **`Ver más contenidos`** | Navega a **`home-learn.html`** con **foco en el buscador** |
| 2 | Secundario | `ubits-button--secondary`, full width | **`Descargar certificado`** | Descarga certificado si `conCertificacion === true`; si no, toast «no disponible» (patrón zona de estudio) |

**Botón primario — detalle Figma:**

- Ícono **`fa-plus`** (más) 16px a la izquierda del texto
- Texto: **`Ver más contenidos`** (sentence case como en Figma)

**Navegación «Ver más contenidos»:**

| Destino | Ruta relativa desde `exp-estudio.html` |
|---------|----------------------------------------|
| Home Aprendizaje | `../home-learn.html#buscar` |

**Comportamiento al llegar a home-learn:**

1. Cargar `ubits-colaborador/aprendizaje/home-learn.html`
2. **Enfocar** el input del hero: `#home-learn-search-input` (componente `hero-search`, bar `#home-learn-hero-search`)
3. Activar estado visual de búsqueda (`setHeroSearchBarActive` / panel browse) — implementar en `home-learn-search.js` al detectar hash `#buscar`

**Botón secundario — detalle Figma (Learn-Components `83:2754`):**

- Ícono **`fa-file-arrow-down`** a la izquierda
- Texto: **`Descargar certificado`**
- Visible cuando el contenido tiene certificado; en demo § 3.1 usar contenido con `conCertificacion: true`

#### 5.6b.2 `ProgresoExpEstudio` — `state: Completed`

Mismo widget que § 5.6.2, con variante **completado**:

| Parte | En progreso | Finalizado |
|-------|-------------|------------|
| Label | `Tu progreso:` | Igual |
| Barra indicador | `#0c5bef` (azul brand) | **`#1e8d58` (verde `accent/green`)** |
| Fill | Parcial (ej. 50 %) | **100 %** ancho completo |
| Texto % | `50 %` | **`100 %`** |

#### 5.6b.3 `IndiceExpEstudio` — `state: Completado`

Todas las filas del índice (§ 3.3, **sin encuesta**):

| Aspecto | Valor |
|---------|-------|
| Estado fila | **`Completada`** en todas (incl. `Fin del contenido`) |
| Título | Bold, `fg-1-high` |
| Feedback | **`Check`** verde en todas (sin candado ni spinner) |
| Navegación | Páginas consumibles pueden ser **clicables** para repaso (confirmar en implementación) |

**Ejemplo curso demo § 3.3 — todo completado:**

```
Sección 1: Fundamentos                              ▾
  ▶ Comunicación para desescalar un conflicto       ✓
  📕 Guía mapa de conflicto                         ✓
Sección 2: Herramientas para resolver conflictos    ▾
  📦 Simulador de conversación difícil               ✓
  📦 Conversaciones difíciles según Thomas-Kilmann   ✓
  ☑ Evaluación                                      ✓
  🎉 Fin del contenido                              ✓

[ + Ver más contenidos ]
[ Descargar certificado ]
Tu progreso: [████████████████████] 100 %
```

#### 5.6b.4 Orden vertical columna derecha (finalizado)

```
TituloSpecsCtaExpEstudio (Completado)
  ├── badge + título + specs
  ├── botón Ver más contenidos (primario)
  ├── botón Descargar certificado (secundario)
  └── ProgresoExpEstudio (Completed, verde 100 %)
IndiceExpEstudio (Completado)
```

> **Nota orden:** en progreso el widget va **debajo de un solo CTA**; en finalizado van **dos CTAs** y luego el progreso al 100 %.

### 5.5 Resumen — diferencias FIQSHA vs UBITS (Figma)

| Aspecto | FIQSHA / Empresa | UBITS |
|---------|------------------|-------|
| Columna izquierda | Video + **Categoría** (chip) + Descripción | Video + Competencia + Habilidades + Descripción + Aliados + Expertos |
| Specs subtítulos | No | Sí (`Subtítulos: Español, Inglés, Portugués`) |
| Spec certificado | Sí (`Con certificado`) | Sí |
| Columna derecha | TituloSpecsCta + IndiceExpEstudio | Igual |
| Índice | 2 secciones, 6 ítems (§ 3.3); sin encuesta | Igual |
| CTA sin iniciar | `Comenzar ahora` | `Comenzar ahora` |
| CTA en progreso | **`Continuar`** | **`Continuar`** |
| CTA finalizado | **`Ver más contenidos`** + **`Descargar certificado`** | Igual |
| Widget progreso en portada | No / azul parcial / **verde 100 %** | Igual |

**Regla implementación:** `catalogo_fiqsha` → layout empresa; `catalogo_ubits` → layout UBITS. Columna derecha comparte componentes y estados de progreso; variar specs según origen.

### 5.7 Componentes Figma a portar (playground)

Nombres del archivo Learner v4 — base para `components/` vanilla:

| Componente Figma | Rol | Notas playground |
|------------------|-----|------------------|
| `SeccionExpEstudio` | Tarjeta sección (§ 4.3) | Base Creator; colapsable; info → modal (§ 4.3.1) |
| `IndiceExpEstudio` | Índice learner (§ 4.3) | Stack de `SeccionExpEstudio` (gap-md); sin card envolvente ni `bg-3`. Estados `Por iniciar` \| `En progreso` \| **`Completado`** |
| `PaginasExpEstudio` | Fila de página en índice | Base visual = `paginas-creator` (sin drag/menú) + Feedback; `Bloqueada` \| `Activa` \| `Completada` |
| `TituloSpecsCtaExpEstudio` | Badge Tag oficial (§ 5.4.1a) + título + specs + CTAs oficiales + `ProgresoExpEstudio` | `Por iniciar` \| `En progreso` \| **`Completado`** |
| `ProgresoExpEstudio` | Widget «Tu progreso:» + barra + % | `In Progress` (azul) \| **`Completed`** (verde 100 %) |
| `DescripcionExpEstudio` | Card descripción | Soporta rich text / bold inline |
| `FichaCompetenciasYHabilidades` | Competencia/habilidades o categoría | Variante `Contenido Ubits` \| `Empresa` |
| `AliadosExpEstudio` | Card aliados | Solo UBITS |
| `ExpertosExpEstudio` | Card expertos | Solo UBITS |
| `Feedback` | Icono estado fila índice | Tipos: `Locked` \| `Check` \| `Progress` (24px) |
| **`TituloProgresoYNav`** | Título curso + nav + progreso | Recursos § 6.4 \| Cierre § 7.3 (`Ver más contenidos`) |
| **`CierreExpEstudio`** | Felicitación + certificado | Solo columna izquierda § 7 |
| **`EvalExpEstudio`** (orquestador) | 3 fases consumo evaluación | `bienvenida` \| `evaluacion` \| `resultado` (+ 4 kinds) — § 6.8 |
| **`EvalStickyBarExpEstudio`** | Sticky APP v3: tiempo + intentos | Solo fase 2 § 6.8.4b; Figma `2387:41633` |
| **`learn-question`** | Preguntas fase 2 | **Solo** `mode: 'collab'` — § 6.8.4b |
| **`DescargarArchivo`** | Tarjeta archivo descargable complementario (learner) | Solo lectura + CTA **`Descargar archivo`** |
| **`DescripcionExpEstudio`** (bloque texto página) | Texto complementario o cuerpo de página | Card blanca bajo recursos complementarios |

Tokens Figma usan prefijo `--color-*` (alineado con playground React; en vanilla mapear a `--ubits-*`).

### 5.8 Preguntas cerradas (portada)

| # | Pregunta | Respuesta |
|---|----------|-----------|
| 5.1 | Hero portada | Tráiler con overlay **play** (componente `Video`) |
| 5.2 | Bloques izquierda | Empresa: Categoría + Descripción. UBITS: + Competencia, Habilidades, Aliados, Expertos |
| 5.3 | Certificado en portada | Sí — spec `Con certificado` en columna derecha |
| 5.4 | CTA sin iniciar | `Comenzar ahora` + play, primario full width |
| 5.5 | CTAs secundarios | Ninguno en portada |
| 5.9 | CTA en progreso | `Continuar` + play; retoma última página vista |
| 5.10 | Widget progreso portada | `ProgresoExpEstudio`: «Tu progreso:» + barra 8px + `NN %` |
| 5.11 | Estados fila índice | `Completada` / `Activa` / `Bloqueada` |
| 5.12 | CTA finalizado | `Ver más contenidos` → `home-learn.html#buscar` + focus input |
| 5.13 | Certificado finalizado | `Descargar certificado` (secundario, bajo primario) |
| 5.14 | Progreso finalizado | Barra **verde** 100 %; índice todo ✓ |

---

## 6. Bloque 2 — Recursos (vista consumo)

**Propósito:** zona donde el estudiante **consume** cada página del contenido. Tras pulsar **`Comenzar ahora`** (portada sin iniciar) o **`Continuar`** (portada en progreso), la pantalla cambia de **portada** a **Recursos**: columna izquierda = visor del recurso activo; columna derecha = navegación + progreso + índice.

**Deep links QA por página:** `#video` / `#pdf` / `#scorm-1` / `#scorm-2` / `#evaluacion`… (§ 2.3.1).

**Referencia Figma (ejemplo página 1 — video):** frame `Video` — node `40006360:4608` — [Figma Dev Mode](https://www.figma.com/design/ivTgxM9bL6vcvGU90P8oGg/Learner-v4--Deprecated--mejor-ver-Playground?node-id=40006360-4608&m=dev).

**Layout shell:** igual que portada (§ 2) — layout estándar colaborador, sidebar + SubNav, área principal en **dos columnas** desktop (gap 24px). La columna izquierda **ya no** muestra metadata del catálogo (competencia, aliados, etc.); solo el recurso de la página activa.

### 6.0 Referencias Figma — Recursos

| Ejemplo | Frame Figma | Node ID | URL Dev Mode |
|---------|-------------|---------|--------------|
| Página 1 — **Video** (+ complementarios descarga + texto) | `Video` | `40006360:4608` | [Figma](https://www.figma.com/design/ivTgxM9bL6vcvGU90P8oGg/Learner-v4--Deprecated--mejor-ver-Playground?node-id=40006360-4608&m=dev) |

> Frames adicionales por tipo (PDF, SCORM, embebido, evaluación) — pendiente Dave. El patrón de **columna derecha** (`TituloProgresoYNav` + índice) se mantiene en todos.

### 6.1 Layout general — Recursos

```
┌─────────────────────────────────────────────────────────────────┐
│ SubNav (aprendizaje / zona de estudio según entrada)             │
├──────────────────────────────┬──────────────────────────────────┤
│  COLUMNA IZQUIERDA (703px)   │  COLUMNA DERECHA (~479px)        │
│  Visor página activa         │  · TituloProgresoYNav             │
│                              │  · IndiceExpEstudio (navegable)  │
│  · Recurso principal         │                                  │
│  · Complementarios (0–2)     │                                  │
│    (orden de alta Creator)   │                                  │
└──────────────────────────────┴──────────────────────────────────┘
```

| Columna | Portada (§ 5) | Recursos (§ 6) |
|---------|---------------|----------------|
| Izquierda | Hero tráiler + ficha catálogo | **Solo** recurso principal + complementarios de la página |
| Derecha | `TituloSpecsCtaExpEstudio` + índice preview | **`TituloProgresoYNav`** + índice interactivo |

### 6.2 Columna izquierda — render del recurso (todos los tipos)

**Regla de implementación:** la columna izquierda **reutiliza los mismos bloques ya montados en Creator** cuando el autor terminó de cargar el recurso (`crear-contenido.html`, paso Recursos). Es la **misma UI de contenido**, en modo **solo consumo**:

| Incluir | Excluir (solo Creator) |
|---------|------------------------|
| Superficie del recurso principal (video, PDF, embebido, texto, SCORM, evaluación) | `.ubits-resources-block__footer` (Eliminar, Reemplazar, etc.) |
| Complementarios montados (texto RTE, archivo descargable) | Invite «Añade un recurso complementario» |
| Visores ya existentes (PDF.js, iframe, reproductor) | Botones de edición / subida / IA |

**Referencia técnica Creator → learner:**

| Tipo principal | Marcador DOM / módulo | Archivos playground |
|----------------|----------------------|---------------------|
| Video | `.cc-video-resource` | Shell en `crear-contenido.js`; CSS `crear-contenido.css` |
| PDF | `[data-cc-pdf-js-viewer]` + `mountCrearContenidoPdfViewer` | `crear-contenido-pdf-viewer.js`, `vendor/pdfjs/` |
| Embebido | `.cc-embed-resource` | `buildCrearContenidoEmbedResourceHtml` |
| Texto | `[data-cc-text-resource]` | RTE solo lectura (sin toolbar edición) |
| SCORM | `.cc-scorm-resource` | Mismo mount que Creator |
| Evaluación | Tres fases § 6.8; preguntas con `learn-question` **`collab`** | Specs/banco desde Creator; **sin** modos read/edit/`collab_feedback`; **sin** complementarios |
| Complementario texto | `.ubits-complementary-resources--filled-stack[data-complementary-filled="texto"]` | `complementary-resources.js` — ocultar `__footer` |
| Complementario descarga | `[data-complementary-filled="archivo-descargable"]` o patrón **`DescargarArchivo`** learner | Card consumo § 6.3 |

**Scope CSS:** importar/reglas equivalentes a `.page-crear-contenido .crear-contenido-recursos__resources-mount` bajo clase de página **`page-exp-estudio`** (o contenedor `#exp-estudio-recurso-mount`). **No** duplicar estilos del visor; **sí** ocultar footers de edición.

**Datos:** el mock § 11.1 guarda por página el HTML montado o referencias (URL video, blob PDF, embed snippet) **copiados del patrón Creator**, no el flujo de subida.

**Progreso:** al marcar páginas consumibles como completadas, `ProgresoExpEstudio` en columna derecha sube el **%** (ej. 1/5 → 20 %, 5/5 + cierre → 100 % verde).

### 6.2b Ejemplo Figma — página 1 video (§ 3.3)

Orden vertical (gap 20px), ancho **703px** — coincide con frame `40006360:4608`:

| Orden | Bloque Figma | Contenido | Notas |
|-------|--------------|-----------|-------|
| 1 | `Video` | Reproductor **396px** alto, `border-radius-lg`, overlay **play** central | Recurso **principal** de la página |
| 2 | `DescargarArchivo` | Tarjeta archivo complementario (si el autor lo añadió en Creator) | Ver § 6.3 |
| 3 | `DescripcionExpEstudio` | Card con párrafo(s) de texto complementario | Ver § 6.3 |

**Ejemplo Figma (página 1):** video + **`Documento de ejemplo.pdf`** (2,1 MB) + texto «Un conflicto es una diferencia de intereses…».

**Curso demo § 3.3 — página 1** (`Comunicación para desescalar un conflicto`, tipo video): incluir en mock **ambos** complementarios (descarga + texto) para validar el layout completo.

### 6.3 Recursos complementarios (consumo)

**Origen de datos:** lo que el autor montó en Creator paso Recursos (`crear-contenido.html`, § Complementary resources en `contexto-creacion-contenido.md`).

| Tipo complementario (Creator) | Vista learner (Figma) | Comportamiento playground |
|------------------------------|----------------------|---------------------------|
| **Archivo descargable** | Componente **`DescargarArchivo`** | Tarjeta blanca: ícono archivo + nombre + peso + botón **`Descargar archivo`** (terciario, ícono `fa-file-arrow-down`) |
| **Texto** | Card **`DescripcionExpEstudio`** | Párrafo(s) `body/md/regular`, color `fg-1-medium`; soporta negritas inline del RTE autor |

**Reglas (alineadas con Creator):**

| Regla | Detalle |
|-------|---------|
| Opcionalidad | 0, 1 o 2 complementarios por página |
| Orden visual | **Orden de alta** en Creator (`complementaryOrder`), no fijo |
| Máximo | Texto + descargable (nunca dos del mismo tipo) |
| Excepción texto principal | Si la página principal es **Texto**, solo puede haber complementario **descargable** |
| Excepción evaluación | Páginas tipo **Evaluación** **sin** complementarios |
| Obligatoriedad consumo | Complementarios **no** bloquean **`Continuar`** — solo el recurso principal cuenta para avance |

**Copy exacto CTA descarga (Figma):** **`Descargar archivo`**

**Componente vanilla (Creator):** `components/complementary-resources.js` — en learner **no** invite ni **Eliminar**; solo superficie de lectura (§ 6.2).

### 6.4 Columna derecha — `TituloProgresoYNav` + índice

Sustituye por completo el bloque `TituloSpecsCtaExpEstudio` de la portada.

#### 6.4.1 `TituloProgresoYNav`

Componente Figma: título del **curso** (no de la página) + fila de navegación + widget progreso.

| Parte | Detalle |
|-------|---------|
| Título | Nombre del contenido, `display/d4/bold` 28px, `fg-1-high`, ellipsis |
| Nav | Fila gap 16px, **dos botones 50 % / 50 %** |
| Botón **`Regresar`** | `ubits-button--secondary`, copy exacto **`Regresar`** |
| Botón primario nav | **`Continuar`** (sin ícono) en No progress / En progreso; **`Ver más contenidos`** (sin ícono) en Completado / cierre § 7 |
| `ProgresoExpEstudio` | Debajo de Nav — fila Figma con flag + label + barra + **`NN %`** |

**Estados `ProgresoExpEstudio` en Recursos:**

| Estado Figma | Cuándo | Barra |
|--------------|--------|-------|
| `No progress` | Primera visita a página 1 (aún no completada) | 0 %, track gris, indicador azul mínimo |
| `In Progress` | Al menos una página completada, curso no terminado | Azul brand, % parcial |
| `Completed` | Curso finalizado (vuelve a Recursos en repaso) | Verde 100 % (§ 5.6b.2) |

#### 6.4.2 Navegación `Regresar` / `Continuar`

| Acción | Comportamiento |
|--------|----------------|
| **`Continuar`** | Avanza a la **siguiente** página del índice (orden § 3.3) — **excepto** en página **Evaluación**: ver § 6.8 (fases Bienvenida → Evaluación → Resultado). Tras **resultado positivo** en evaluación → siguiente ítem (`Fin del contenido` § 7) |
| **`Regresar`** en **página 1** | Vuelve a la **portada** del curso (mismo `?id=`, vista Portada) |
| **`Regresar`** en página 2+ | Va a la **página anterior** del índice |
| Índice lateral | Páginas **`Completada`**: clicables (repaso). **`Activa`**: página actual. **`Bloqueada`**: no clicable (secuencia) |

**Secuencia:** v1 **bloqueada** — solo la página activa y las ya completadas son accesibles; el resto muestra candado (igual Figma frame `40006360:4608`).

#### 6.4.3 `IndiceExpEstudio` en vista Recursos

Mismo componente que portada (§ 4.3 / § 5.4.3): secciones **colapsables** + chevron. Estado de progreso **`En progreso`**, página actual en fila **`Activa`**:

| Estado fila | Visual |
|-------------|--------|
| **`Activa`** | Tint brand / barra lateral, título e ícono en **brand**, `Feedback` **Progress** (spinner) |
| **`Completada`** | Check verde, título bold |
| **`Bloqueada`** | Texto disabled, `Feedback` **Locked** |

**Índice demo § 3.3:** 2 secciones, 6 ítems; **sin** sección `Cierre` ni encuesta. Expand/collapse disponible también en Recursos.

#### 6.4.4 Orden vertical columna derecha (Recursos)

```
TituloProgresoYNav
  ├── título curso
  ├── [ Regresar ] [ Continuar ]
  └── ProgresoExpEstudio
IndiceExpEstudio (En progreso)
```

### 6.5 Tipos de recurso principal — curso demo (§ 3.3)

**No hay frames Figma adicionales por tipo:** PDF, SCORM, embebido, evaluación y texto usan **la misma estructura de página** que el video (§ 6.1): columna izquierda = render Creator § 6.2; columna derecha = `TituloProgresoYNav` + índice.

| Tipo | En curso demo v1 | Columna izquierda |
|------|------------------|-------------------|
| Video | ✅ p.1 | `.cc-video-resource` + complementarios demo |
| PDF | ✅ p.2 | Visor del PDF + acciones debajo (§ 6.5.1 / § 6.5.2) |
| SCORM | ✅ p.3 y p.4 | `.cc-scorm-resource` + **Ver en pantalla completa** (§ 6.5.2) |
| Evaluación | ✅ p.5 | **Tres fases** en la misma fila del índice (§ 6.8); sin complementarios |
| Fin (índice) | ✅ p.6 | **No** es recurso Creator — pantalla cierre § 7 |
| Embebido | ❌ demo | Render § 6.2 + **Ver en pantalla completa** (§ 6.5.2) cuando el contenido lo traiga |
| Texto / Encuesta | ❌ | Texto sí tiene render § 6.2; encuesta fuera de v1 |

#### 6.5.1 PDF — descarga del recurso principal (desde Creator)

En LMS Creator (`crear-contenido` / `editar-contenido`), cada página PDF tiene el switch **«Permitir descarga del PDF a los estudiantes»** (ON por defecto al subir el PDF).

| Valor en Creator (`allowPdfDownload`) | En experiencia de estudio |
|---------------------------------------|---------------------------|
| **ON** (default / demo `p-2`) | Debajo del PDF renderizado: botón **`Descargar`** (`secondary` sm, `fa-download`) que descarga el mismo archivo |
| **OFF** | Sin botón de descarga del recurso principal |

No confundir con el complementario **archivo descargable** (§ 6.3), cuyo CTA es **`Descargar archivo`**.

#### 6.5.2 Pantalla completa (PDF / Embebido / SCORM)

Debajo del recurso principal renderizado, estos tipos llevan un botón:

| Campo | Valor |
|-------|--------|
| Label | **`Ver en pantalla completa`** |
| Variante | `secondary` sm |
| Icono | `far fa-expand` |

**Fila de acciones (debajo de la superficie, fuera de la card):**

Mismo patrón de alineación que el footer del Resources block en Creator (`.ubits-resources-block--stack` + `align-items: flex-end`): recurso renderizado **sin card blanca envolvente**; los botones van **abajo a la derecha**, debajo del recurso.

**Prohibido:** poner el nombre de la página (`h2` / título) **encima** del recurso renderizado (video, PDF, embebido, SCORM). En Creator el título de página va en el índice / inline-edit del panel, no sobre el visor. En SCORM IA el título vive **solo dentro** del paquete (barra interna). El título de página en learner sí aparece en el **header del lightbox** de pantalla completa.

| Tipo | Orden (derecha, de izquierda a derecha en la fila) |
|------|---------------------------|
| **PDF** (con descarga ON) | **`Descargar`** · **`Ver en pantalla completa`** |
| **PDF** (descarga OFF) | Solo **`Ver en pantalla completa`** |
| **Embebido** / **SCORM** | Solo **`Ver en pantalla completa`** |

**Al hacer clic:** se abre un **lightbox** a viewport completo con el **mismo elemento renderizado** (mismo `src` del iframe: PDF / embebido / SCORM), en solo lectura.

**Chrome del lightbox (learner):**

| Zona | Contenido |
|------|-----------|
| Header | **Título de la página** + botón icon-only **Cerrar** (`fa-times`, tooltip «Cerrar») |
| Centro | iframe / superficie del recurso a pantalla casi completa |
| Footer | **Ninguno** (no es el lightbox de edición de Creator) |

**Patrón visual:** mismo overlay / bandas / acotado a 1440px que el lightbox **«Editar presentación»** del LMS Creator (SCORM IA). En learner **no** hay Cancelar/Guardar ni herramientas de edición.

**Cierre:** botón Cerrar, clic en el scrim (fuera del contenido), o tecla `Escape`.

**Por qué SCORM en learner:** el seed de creación/edición en LMS Creator ya monta **dos páginas SCORM** (`Simulador de conversación difícil`, `Conversaciones difíciles según Thomas-Kilmann`). El estudiante debe ver el **mismo tipo de recurso** en consumo (solo lectura, sin «Editar presentación» / Eliminar).

### 6.6 Reglas de «página completada» (v1 playground)

**Regla general:** la mayoría de tipos de recurso se marcan **Completada** solo con pulsar **`Continuar`** en la columna derecha — **sin** exigir consumir el recurso (ver, leer, terminar diapositivas, etc.).

**Únicas excepciones con obligatoriedad de consumo / completar flujo interno:**

| Tipo | ¿Obligatoriedad? | Criterio |
|------|------------------|----------|
| **Evaluación** | **Sí** | Debe recorrer las 3 fases y **aprobar** (§ 6.8) antes de que **`Continuar`** avance al siguiente ítem del índice |
| **Encuesta** | **Sí** (futuro) | Habrá flujo propio de respuesta; **no** se pinta en el índice demo v1 — Dave aún no la diseñó (§ 3.3) |

| Tipo | Criterio mock v1 | Notas |
|------|------------------|-------|
| Video | Solo **`Continuar`** | Sin umbral de % reproducido — § 6.6b |
| PDF | Solo **`Continuar`** | No exige leer / llegar al final del documento |
| SCORM | Solo **`Continuar`** | No exige completar diapositivas / quizzes internos del paquete |
| Embebido | Solo **`Continuar`** | No en índice demo § 3.3 |
| Texto | Solo **`Continuar`** | No en índice demo § 3.3 |
| **Evaluación** | Fases + **aprobado** + **`Continuar`** | § 6.8 — no basta un solo `Continuar` |
| **Encuesta** | _(pendiente diseño)_ | Fuera de v1 — misma familia de «debe completar» que Evaluación |
| Complementarios | **No** afectan % ni bloqueo | Opcionales para el alumno |

#### 6.6b Umbral de video (% reproducido) — **cerrado**

**Respuesta:** **No** hay umbral de reproducción.

El colaborador puede pulsar **`Continuar`** en la columna derecha (`TituloProgresoYNav`) y **avanzar** sin haber reproducido el video (ni un %). La página queda **Completada** con ese clic. Es el mismo criterio «solo Continuar» que PDF, SCORM, embebido y texto — la **única** excepción activa en v1 es **Evaluación**.

### 6.8 Página tipo **Evaluación** — tres fases (misma fila del índice)

**Regla clave:** una página de **Evaluación** en el índice **no** es una sola pantalla estática. El alumno vive **tres fases** en la **misma fila activa** del índice. **`Continuar`** en la columna derecha **no** avanza al siguiente ítem del índice hasta completar el ciclo con **resultado positivo**.

**Origen de datos (specs / preguntas):** configuración y banco montados en Creator (`evaluaciones-recurso.js`, `.cc-eval-root`, modal **Configuración** en `contexto-creacion-contenido.md` § Evaluación final).

**Vista de preguntas en consumo (fase 2):** el componente oficial **`learn-question`** en modo **Colaborador** (`mode: 'collab'`). El alumno **responde** (selecciona / escribe) — **no** es vista de solo lectura (`read` / `read_error`).

| Permitido | Prohibido |
|-----------|-----------|
| **`collab`** (label doc: **Colaborador**) | **`collab_feedback`** (Colaborador con feedback) |
| | `read`, `read_error`, `edit`, `edit_error` |
| | Chrome de Creator: Eliminar, Generar con IA, edición del banco |

Detalle de UX y criterio «todas contestadas»: § 6.8.4b.

#### 6.8.1 Las tres fases

| # | Fase | Id interno sugerido | Columna izquierda (visor) | Al pulsar **`Continuar`** |
|---|------|---------------------|---------------------------|---------------------------|
| **1** | **Bienvenida** | `bienvenida` | Pantalla de bienvenida con **specs** (§ 6.8.4a) | **No** va a la siguiente página del índice → pasa a fase **2 Evaluación** |
| **2** | **Evaluación** | `evaluacion` | Barra sticky timer + intento (§ 6.8.4b) + **10 preguntas** `learn-question` | **No** va a la siguiente página del índice → fase **3 Resultado** |
| **3** | **Resultado** | `resultado` | 4 variantes § 6.8.4c: aprobado / reprobado / tiempo / límite | **Aprobado + Continuar** → siguiente ítem (`Fin del contenido`). **Reprobado / tiempo** → **Reintentar**. **Límite** → **Ir al inicio**. |

**Primera llegada:** al entrar por primera vez a una fila **Evaluación** (desde índice, **`Continuar`** global o **`Comenzar ahora`** en secuencia), la fase inicial es siempre **1 Bienvenida** — **no** se muestran las preguntas de golpe.

#### 6.8.0 Fuente visual (APP v3) y deep links por estado

**Qué tomar de Figma APP v3.0.0** (`zHCCbQamZeiZJPlT7GEKDs`):

| Sí (fuente de verdad) | No |
|------------------------|-----|
| **Textos / copy** exactos | Colores hex del frame (`#e7effd`, `#0c5bef`, etc.) |
| **Imágenes / ilustraciones / íconos** de estado (check, X, reloj, warning, info) | Gradientes o fondos “aproximados” del export |
| Jerarquía de contenido (título → cuerpo → CTA) | Layout mobile a ciegas sin adaptar a § 6.1 / § 6.4 |

**Colores e implementación:** usar **solo tokens UBITS** (`var(--ubits-*)` en vanilla; mapa semántico: brand, feedback info/success/error/warning, `bg-*`, `fg-*`, `border-*`). El playground / design system tiene la **versión final** de la paleta — Figma APP es guía de producto para **imagen + texto**, no para hardcodear estilos.

Los frames son **mobile** (sin columna derecha); en playground web el contenido de cada fase vive en la **columna izquierda** y la nav sigue en **`TituloProgresoYNav`** (§ 6.4). Ante discrepancia de **copy/imagen** con capturas LXP antiguas, **prevalece APP v3**.

| Estado | Frame Figma | Node ID | URL Dev Mode |
|--------|-------------|---------|--------------|
| Bienvenida | Course evaluation | `2369:36043` | [Figma](https://www.figma.com/design/zHCCbQamZeiZJPlT7GEKDs/APP-v3.0.0?node-id=2369-36043&m=dev) |
| Intento (preguntas) | Evaluation-type answers | `2389:42852` | [Figma](https://www.figma.com/design/zHCCbQamZeiZJPlT7GEKDs/APP-v3.0.0?node-id=2389-42852&m=dev) |
| Sticky tiempo + intentos | Description (widget) | `2387:41633` | [Figma](https://www.figma.com/design/zHCCbQamZeiZJPlT7GEKDs/APP-v3.0.0?node-id=2387-41633&m=dev) |
| Resultado aprobatorio | Evaluation-success | `2389:46663` | [Figma](https://www.figma.com/design/zHCCbQamZeiZJPlT7GEKDs/APP-v3.0.0?node-id=2389-46663&m=dev) |
| Resultado reprobatorio | Evaluation-Failed | `2389:47137` | [Figma](https://www.figma.com/design/zHCCbQamZeiZJPlT7GEKDs/APP-v3.0.0?node-id=2389-47137&m=dev) |
| Resultado tiempo agotado | Evaluation-Time out | `2389:47261` | [Figma](https://www.figma.com/design/zHCCbQamZeiZJPlT7GEKDs/APP-v3.0.0?node-id=2389-47261&m=dev) |
| Resultado límite de intentos | Evaluation-Attempt limit | `2389:47401` | [Figma](https://www.figma.com/design/zHCCbQamZeiZJPlT7GEKDs/APP-v3.0.0?node-id=2389-47401&m=dev) |
| Retomar (APP — evaluación en pausa) | Evaluation-resuming evaluation | `3341:13137` | [Figma](https://www.figma.com/design/zHCCbQamZeiZJPlT7GEKDs/APP-v3.0.0?node-id=3341-13137&m=dev) |

##### Deep links de evaluación

Catálogo maestro de **toda** la experiencia (portada, cada página, cierre + evaluación): **§ 2.3.1**.

Hashes de esta fase: `#eval-bienvenida`, `#eval-intento`, `#eval-retomar`, `#eval-resultado-aprobado`, `#eval-resultado-reprobado`, `#eval-resultado-tiempo`, `#eval-resultado-limite`. Al abrir uno con sesión vacía, precargar páginas `p-1`…`p-4` como Completadas + fila Evaluación activa (mismo espíritu que Creator con `#recursos`).

#### 6.8.2 Diagrama de flujo (fase × nav)

```
Índice: fila «Evaluación» ACTIVA (misma fila en todas las fases)
        │
        ▼
┌───────────────┐
│ 1 BIENVENIDA  │  Recordatorio (tiempo / intentos / Importante)
└───────┬───────┘
        │ Continuar (nav derecha) → inicia intento
        ▼
┌───────────────┐
│ 2 EVALUACIÓN  │  sticky + preguntas collab
└───────┬───────┘
        │
        ├── Continuar (todas contestadas) ──► 3 RESULTADO (score)
        ├── Timer llega a 0 ──► resultado-tiempo
        └── Salida / recarga / cierre a mitad ──► consume intento (§ 6.8.3b)
                │
                ▼
┌───────────────────────────────┐
│ 3 RESULTADO (variantes)       │
├───────────────────────────────┤
│ aprobado  → Continuar → Fin   │
│ reprobado → Reintentar        │
│ tiempo    → Reintentar        │
│ límite    → Ir al inicio      │
└───────────────────────────────┘
```

#### 6.8.3 Columna derecha durante evaluación

| Aspecto | Comportamiento |
|---------|----------------|
| Shell | Igual § 6.4 — `TituloProgresoYNav` + `IndiceExpEstudio` |
| Fila índice | **`Evaluación`** permanece **`Activa`** en fases 1–3 |
| Botones nav | **`Regresar`** + CTA primario (`Continuar` / **`Reintentar`** / **`Ir al inicio`** según fase y variante de resultado) |
| **`Continuar`** fase **`evaluacion`** | **`disabled`** hasta que **todas** las preguntas del intento tengan respuesta (§ 6.8.4b). Habilitado → envía intento → fase **3 Resultado** (aprobado o reprobado según score) |
| **`Continuar`** fase **`bienvenida`** | Inicia intento → fase 2 |
| CTA en resultado | Ver § 6.8.4c — copy exacto por variante |
| Progreso % | La evaluación cuenta como página consumible completada **solo** tras **aprobado** en fase 3 (alinea § 8.3) |

##### 6.8.3b Salida a mitad de un intento (sin enviar respuestas)

**Cuándo cuenta como intento consumido** (copy Bienvenida → «Importante»):

- Cualquier **salida** del contenido / flujo mientras la fase es **`evaluacion`** (sidebar, otra pestaña del producto, cerrar ventana).
- **Recarga** (`F5`) o cierre de pestaña durante el intento.
- **Abandonar** el intento **sin** haber pulsado **`Continuar`** habilitado en la columna derecha (es decir, sin enviar el intento completo).

**Qué no es envío válido:** pulsar **`Continuar`** con el botón **disabled** (faltan respuestas) — no avanza ni cierra el intento.

**Efecto:** se descuenta 1 del cupo de intentos; al volver, mostrar Bienvenida o Resultado límite si ya no quedan intentos (mismas reglas que timeout / reprobado). Deep link útil para QA de sticky post-consumo: `#eval-resultado-limite`.

**APP — evaluación dejada en pausa (sin cerrar el intento en servidor):** al reabrir el contenido desde la **app móvil**, APP v3 muestra la pantalla **Evaluation-resuming evaluation** (`3341:13137`): invita a retomar **desde el sitio web**. En playground: deep link **`#eval-retomar`** (demo). CTA **`Responder la evaluación`** → fase 2 (`#eval-intento`). Copy exacto § 6.8.4a-bis.

#### 6.8.4 Contenido por fase

##### 6.8.4a Fase 1 — **Bienvenida** (copy cerrado — APP v3)

**Referencia Figma:** § 6.8.0 — node `2369:36043`. Deep link: `#eval-bienvenida`.

**Ubicación playground:** columna izquierda (703px), contenido **centrado**. (En app el CTA **Continuar** va al pie; en web el CTA primario de avance es el de **`TituloProgresoYNav`**.)

**Estructura (APP v3):**

| Orden | Elemento | Copy / detalle |
|-------|----------|----------------|
| 1 | Ícono | Info (círculos azules + «i») — asset Figma / equivalente playground |
| 2 | Título | **`Vas a iniciar una evaluación`** |
| 3 | Subtítulo | **`Antes de hacerlo, ten en cuenta lo siguiente:`** |
| 4 | Card **Recordatorio** | Fondo token feedback info subtle (`var(--ubits-feedback-bg-info-subtle)` o el token oficial equivalente del alert/toast info); título **`Recordatorio`**; texto `var(--ubits-feedback-fg-info-subtle)` (o tokens fg del DS) |
| 5 | Lista (3 bullets) | Ver plantilla abajo |

**Copy exacto — lista Recordatorio** (valores `{…}` de config Creator / mock):

```
Recordatorio
• Tiempo límite: ({M}) minutos para completar la evaluación.
• Intentos: Tienes ({N}) intentos disponibles.
• Importante: Una vez inicies la evaluación, cualquier salida, recarga o cierre de esta ventana, contará como un intento.
```

> En Figma los placeholders aparecen como `(x)`. En playground sustituir por número real, sin paréntesis si queda mejor tipográficamente — **mantener el copy de etiqueta** (`Tiempo límite:`, `Intentos:`, `Importante:`).

| Línea | Tipo | Fuente |
|-------|------|--------|
| Título + subtítulo | Fijo | APP v3 — no parametrizar |
| `Tiempo límite: ({M}) minutos…` | Dinámico | `timeLimitMinutes`. Si **sin** límite de tiempo → **ocultar** este bullet |
| `Intentos: Tienes ({N}) intentos disponibles.` | Dinámico | `maxAttempts`. Intentos ilimitados → _pendiente copy alternativo_ |
| `Importante:…` | Fijo | APP v3 — cuenta salida / recarga / cierre (§ 6.8.3b) |

**Qué NO aparece en Bienvenida APP v3:** nota mínima para aprobar, número de preguntas, aleatoriedad.

**Nav:** **`Continuar`** → fase 2 (inicia el intento; desde aquí aplica «Importante»).

##### 6.8.4a-bis — **Retomar** (APP — evaluación en pausa)

**Referencia Figma:** § 6.8.0 — node `3341:13137` (*Evaluation-resuming evaluation*). Deep link: `#eval-retomar`.

**Cuándo (producto APP):** el estudiante inició el intento y dejó la evaluación **en pausa**; al volver desde la **app**, se muestra esta pantalla intermedia (no las preguntas) y se le invita a retomar en el **sitio web**.

**Ubicación playground:** columna izquierda, contenido centrado (mismo patrón que Bienvenida / Resultado). En APP el CTA va al pie; en web el CTA primario es el de **`TituloProgresoYNav`**.

| Orden | Elemento | Copy / detalle |
|-------|----------|----------------|
| 1 | Ícono | Info (mismo asset que Bienvenida) — `info-icon.svg` |
| 2 | Título | **`Evaluación de conocimientos`** |
| 3 | Cuerpo | **`Dejaste en pausa la evaluación, te invitamos a retomarla desde nuestro sitio web.`** |
| 4 | CTA primario | **`Responder la evaluación`** → fase 2 (`#eval-intento`) |

> El copy habla de «sitio web» porque el frame es de **APP**. En el playground web se muestra tal cual para QA visual / copy.

##### 6.8.4b Fase 2 — **Evaluación** (copy y banco demo cerrados)

Al pulsar **`Continuar`** en Bienvenida, la columna izquierda pasa a la **UI de preguntas**. Arranca el **intento** (cuenta para la regla «Importante» § 6.8.4a) y el **cronómetro** si hay límite de tiempo.

**Referencia Figma frame completo:** § 6.8.0 — `2389:42852`. Deep link: `#eval-intento`.  
**Referencia sticky (widget actualizado):** § 6.8.0 — `2387:41633` (**reemplaza** la captura LXP antigua `eval-widget-timer-ref.png`).

#### Barra sticky `EvalStickyBarExpEstudio` (APP v3)

| Aspecto | Detalle |
|---------|---------|
| **Posición** | **Sticky** — bajo el SubNav (o bajo el título de página en el frame app); visible al scrollear preguntas |
| **Contenedor** | Fondo con token de superficie info / subtle del DS (p. ej. familia feedback info bg); `border-radius` con `--border-radius-md`; padding con tokens `--padding-*` / `--space-*` |
| **Layout** | Una fila: **tiempo** · separador `|` · **intentos** |
| **Cuándo** | Solo fase **`evaluacion`** (oculta en Bienvenida y Resultado) |

**Tiempo restante**

| Parte | Copy APP v3 / estilo tokens |
|-------|-----------------------------|
| Ícono | Reloj dashed outline (`far fa-clock` / asset Figma clock-dash) — color `var(--ubits-fg-1-high)` vía padre |
| Label | **`Tiempo restante:`** — `var(--ubits-fg-1-high)`, tipografía medium |
| Valor | **`{M}:{SS} min`** — `var(--ubits-accent-brand)`; ejemplo copy Figma: **`9:58 min`** |
| Color ≤ 1 min | `var(--ubits-feedback-accent-error)` (u otro token error oficial) |
| Origen | Countdown desde `timeLimitMinutes` al iniciar fase 2 |

**Intentos**

| Copy plantilla | **`Intentos: {A} de {T}`** — tipografía/color con tokens fg (`var(--ubits-fg-1-high)`), sin hex |
|----------------|-----------------------------------------------------------------------------------------------|
| Ejemplo Figma (copy) | **`Intentos: 2 de 2`** |
| `{A}` | Intento actual |
| `{T}` | `maxAttempts` |

> **Diff vs doc anterior:** ya no es «Intento 1 de 3» ni valor verde «29:13 minutos». Usar copy APP v3 de arriba.

**Debajo de la barra sticky:** listado de preguntas `learn-question` **`collab`** (scroll en columna izquierda). El frame APP muestra tipos varios (checkbox, radio, estrellas, texto); **el playground demo** sigue el banco § 6.8.4b.1 (10 preguntas del curso conflictos) — no hay que portar el copy comercial del frame APP.

#### Preguntas — componente `learn-question` (solo modo Colaborador)

| Aspecto | Detalle |
|---------|---------|
| Componente | **`learn-question`** — `components/learn-question.js` + `learn-question.css` |
| **Modo obligatorio** | **`collab`** (documentación componente: **Colaborador**) vía `createLearnQuestion({ mode: 'collab', … })` o `setMode('collab')` |
| **Prohibido en exp-estudio** | `read`, `read_error`, `edit`, `edit_error`, **`collab_feedback`** (Colaborador con feedback), y cualquier otro modo |
| UX Colaborador | Enunciado + controles de respuesta **vacíos** (ninguna opción preseleccionada, sin texto en respuesta corta); el alumno **solo selecciona o escribe** — **sin** revelar cuál es la correcta ni feedback inmediato por opción |
| Tipos demo § 6.8.4b.1 | `multiple_choice_single`, `multiple_choice_multiple`, `true_false`, `short_answer`, `matching` |
| Orden | **10 preguntas** apiladas en columna izquierda (debajo de barra sticky) |

**Regla estricta (Dave):** en fase Evaluación **solo** la variante **Colaborador** (`collab`). **No** usar **Colaborador (feedback)** ni modos de lectura/edición Creator.

**Implementación playground — `matching`:** modo **`collab`** implementado en `learn-question.js` / `LearnQuestion.tsx` — spec UI § **6.8.4b.2**.

**Validación «todas contestadas»** (habilita **`Continuar`** en columna derecha):

| Tipo | Criterio «contestada» |
|------|------------------------|
| `multiple_choice_single` | Una opción radio seleccionada |
| `multiple_choice_multiple` | Al menos una checkbox marcada _(confirmar si producto exige todas las que aplican — por defecto: al menos una selección)_ |
| `true_false` | Verdadero o Falso seleccionado |
| `short_answer` | Input con texto no vacío (trim) |
| `matching` | **Cada** bloque `Pareja N` tiene un valor en el select (≠ placeholder «Selecciona el par») — § 6.8.4b.2 |

`exp-estudio.js` escucha cambios en el mount de preguntas y actualiza estado global; **`Continuar`** en `TituloProgresoYNav` lleva clase/atributo **`disabled`** hasta `todasContestadas === true`.

**Al pulsar `Continuar` habilitado:** transición a fase **3 Resultado** (§ 6.8.4c) — **no** avanza índice.

**Doc componente:** `documentacion/componentes/learn-question.html` — botón preview **Colaborador** (= `collab`).

#### 6.8.4b.2 Tipo `matching` — modo Colaborador (`collab`)

**Referencia visual:** captura producto jul 2026 → `exp-estudio/assets/learn-question-matching-collab-ref.png`

En Creator (modo **edición**), cada fila de emparejamiento tiene dos inputs de texto:

| Campo en edición (`learn-question.js`) | Placeholder Creator | Rol en datos |
|----------------------------------------|---------------------|--------------|
| Input A | **«Escribe una opción»** | `pair.a` — concepto / estilo fijo que el alumno debe relacionar |
| Input B | **«Escribe su par»** | `pair.b` — descripción correcta asociada a ese concepto |

En **modo Colaborador** (`collab`) **no** se muestran esos dos inputs editables. La UI de consumo es una **lista vertical de bloques** (uno por cada ítem de `model.pairs[]`):

```
┌─ .learn-question__match-pair ─────────────────────┐
│  Pareja 1                    (ubits-body-xs-semibold)
│  Competitivo                 ← label = pair.a (semibold, solo lectura)
│  [ Selecciona el par      ▼ ] ← createInput type select
└───────────────────────────────────────────────────┘
┌─ .learn-question__match-pair ─────────────────────┐
│  Pareja 2
│  Acomodador
│  [ Selecciona el par      ▼ ]
└───────────────────────────────────────────────────┘
```

##### Estructura por bloque `Pareja N`

| Elemento | Implementación | Detalle |
|----------|----------------|---------|
| Contenedor | Reutilizar `.learn-question__match-pair` + `.learn-question__match-pair-header` (`learn-question.css`) | Sin botón eliminar pareja (solo edición) |
| Encabezado | `<span class="ubits-body-xs-semibold">Pareja {N}</span>` | `{N}` = índice 1-based |
| **Label (opción fija)** | Texto visible de **`pair.a`** — **no** es un input | Equivalente al valor del campo **«Escribe una opción»** en Creator. Tipografía: semibold (como captura ref.) |
| **Select** | `createInput({ type: 'select', … })` montado en contenedor del bloque | Placeholder: **`Selecciona el par`** |
| Opciones del dropdown | Textos de **`pair.b`** de **todas** las parejas del modelo | Equivalente a los valores **«Escribe su par»** en Creator. Misma lista en cada select de la pregunta (pool compartido) |
| Valor inicial | Vacío — placeholder visible | Estado vacío collab; sin preselección |
| Feedback | **Ninguno** en fase 2 | Corrección solo en fase **Resultado** (§ 6.8.4c) |

##### Mapeo datos → UI (ejemplo pregunta 9 § 6.8.4b.1)

Modelo Creator (`pairs`):

```js
pairs: [
  { a: 'Competitivo', b: 'Prioriza el resultado sobre la relación y puede generar resistencia.' },
  { a: 'Acomodador', b: 'Prioriza la relación sobre el resultado y ayuda a mantener la armonía.' }
]
```

Render collab:

| Bloque | Label (`pair.a`) | Opciones en select (`selectOptions`) |
|--------|------------------|--------------------------------------|
| Pareja 1 | Competitivo | Las dos cadenas `pair.b` (orden según reglas eval — ver abajo) |
| Pareja 2 | Acomodador | **Las mismas** dos opciones `pair.b` |

El alumno elige en cada dropdown cuál descripción corresponde a cada estilo. La respuesta correcta sigue siendo la pareja `{ a, b }` definida en el modelo.

##### API sugerida en `renderCollab` (`matching`)

```js
// Pool de opciones (texto visible = pair.b)
var matchOptions = (model.pairs || [])
  .map(function (p, i) {
    return { value: String(i), text: String(p.b || '').trim() };
  })
  .filter(function (o) { return o.text; });

// Por cada pair idx:
global.createInput({
  containerId: 'learn-collab-match-' + qId + '-' + pairNum,
  type: 'select',
  label: String(pair.a || '').trim(),   // label visible = «Escribe una opción»
  size: 'md',
  showLabel: true,                      // label encima del select (captura ref.)
  placeholder: 'Selecciona el par',
  selectOptions: matchOptions,          // textos = «Escribe su par»
  value: '',
  onChange: function (v) { /* notificar exp-estudio / getCollabAnswer */ }
});
```

**Alternativa markup:** si el label va fuera del input API, renderizar `pair.a` como `<p class="ubits-body-sm-semibold">` y montar el select con `showLabel: false` — el resultado visual debe coincidir con la captura ref.

##### Respuesta del alumno y validación

| Aspecto | Regla |
|---------|--------|
| `getCollabAnswer()` (nuevo branch) | Array `{ pairIndex, selectedBIndex }` o mapa índice → texto `b` elegido |
| «Contestada» | **Todos** los selects tienen valor ≠ vacío |
| Duplicados | Si el alumno elige la misma `b` en dos bloques, la pregunta sigue «contestada» (todos los selects llenos); la **corrección** en Resultado marcará el error — no bloquear el select en fase 2 salvo decisión producto contraria |
| Orden opciones | Mezclar `selectOptions` si la config de evaluación lo exige (`randomizeOptions` — alinear con § Creator cuando exista); si no, orden del modelo |

##### Archivos a tocar

| Archivo | Cambio |
|---------|--------|
| `components/learn-question.js` | Rama `matching` en `renderCollab`; `getCollabAnswer` / evento `change` para validación padre |
| `components/learn-question.css` | Opcional: clase label collab (`.learn-question__match-pair-label`) si no basta tipografía del input |
| `documentacion/componentes/learn-question.html` | Demo tipo `matching` en preview **Colaborador** con datos de § 6.8.4b.1 preguntas 9–10 |

**Prohibido en exp-estudio:** modo `collab_feedback` para matching (sin feedback por par hasta Resultado).

#### 6.8.4b.1 Banco de preguntas — curso demo (copy exacto)

> Respuestas correctas documentadas para mock / corrección en **fase Resultado** (§ 6.8.4c). En fase 2 el alumno responde con **`learn-question` modo `collab`** — **sin** indicar acierto/error por pregunta.

**1. Opción múltiple, única respuesta** (`multiple_choice_single`)

- **Enunciado:** ¿Qué es un conflicto en el contexto de un equipo de trabajo?
- **Opciones:**  
  A) Una discusión sin solución  
  B) Una situación de tensión entre personas con intereses distintos  
  C) Un problema técnico del proyecto  
  D) Una falta de recursos  
- **Respuesta correcta:** B

**2. Opción múltiple, única respuesta** (`multiple_choice_single`)

- **Enunciado:** La comunicación no violenta (CNV) en conflictos incluye:
- **Opciones:**  
  A) Observación, sentimiento, necesidad, petición  
  B) Acusación, demanda, sanción, archivo  
  C) Juicio, evaluación, corrección, archivo  
  D) Amenaza, negación, imposición, cierre  
- **Respuesta correcta:** A

**3. Verdadero / Falso** (`true_false`)

- **Enunciado:** ¿Verdadero o falso? La escucha activa es clave para resolver conflictos.
- **Opciones:** Verdadero · Falso  
- **Respuesta correcta:** Verdadero

**4. Verdadero / Falso** (`true_false`)

- **Enunciado:** ¿Verdadero o falso? Los conflictos de proceso (cómo se realiza el trabajo) pueden ser beneficiosos si se gestionan bien.
- **Opciones:** Verdadero · Falso  
- **Respuesta correcta:** Verdadero

**5. Opción múltiple, múltiple respuesta** (`multiple_choice_multiple`)

- **Enunciado:** Selecciona todas las afirmaciones que describen correctamente el estilo evitativo:
- **Opciones:**  
  A) No cuida ni el resultado ni la relación.  
  B) Aplaza el problema y, aunque a veces sirve para enfriar, suele empeorarlo.  
  C) Prioriza el resultado sobre la relación y puede generar resistencia.  
  D) Ayuda a mantener la armonía, pero si se usa siempre genera frustración.  
- **Respuestas correctas:** A y B

**6. Opción múltiple, múltiple respuesta** (`multiple_choice_multiple`)

- **Enunciado:** Selecciona todas las que son beneficios potenciales del conflicto de tarea bien gestionado:
- **Opciones:**  
  A) Mayor creatividad y calidad de decisiones.  
  B) Siempre elimina el conflicto de relación.  
  C) Mejor detección temprana de errores en el trabajo.  
  D) Reduce por completo las tensiones interpersonales.  
- **Respuestas correctas:** A y C

**7. Texto cerrado (pregunta corta)** (`short_answer`)

- **Enunciado:** Según el modelo de Thomas-Kilmann ¿Cuántos estilos de manejo de conflictos hay?
- **Opciones:** respuesta libre — sin opciones predefinidas  
- **Respuesta correcta:** `5`

**8. Texto cerrado (pregunta corta)** (`short_answer`)

- **Enunciado:** Escribe la sigla en inglés que significa “mejor alternativa si no hay acuerdo” en una negociación.
- **Opciones:** respuesta libre — sin opciones predefinidas  
- **Respuesta correcta:** `BATNA`

**9. Emparejamiento** (`matching`)

- **Enunciado:** Relaciona cada estilo con su descripción principal:
- **Columna A:** Competitivo · Acomodador  
- **Columna B:**  
  - Prioriza el resultado sobre la relación y puede generar resistencia.  
  - Prioriza la relación sobre el resultado y ayuda a mantener la armonía.  
- **Respuesta correcta:**  
  - Competitivo → Prioriza el resultado sobre la relación y puede generar resistencia.  
  - Acomodador → Prioriza la relación sobre el resultado y ayuda a mantener la armonía.
- **UI collab:** § 6.8.4b.2 — bloque «Competitivo» + select; bloque «Acomodador» + select; opciones = textos columna B.

**10. Emparejamiento** (`matching`)

- **Enunciado:** Relaciona cada estilo de Thomas-Kilmann con su postura típica respecto al resultado y la relación:
- **Columna A:** Evitativo · Colaborativo  
- **Columna B:**  
  - Ni alto interés en resultado ni en relación en el corto plazo; aplaza el enfrentamiento.  
  - Alto interés en resultado y en relación; busca integración de intereses.  
- **Respuesta correcta:**  
  - Evitativo → Ni alto interés en resultado ni en relación en el corto plazo; aplaza el enfrentamiento.  
  - Colaborativo → Alto interés en resultado y en relación; busca integración de intereses.
- **UI collab:** § 6.8.4b.2 — bloque «Evitativo» + select; bloque «Colaborativo» + select; opciones = textos columna B.

##### 6.8.4c Fase 3 — **Resultado** (4 variantes — APP v3)

**Layout común (columna izquierda, centrado):** ícono de estado (~80px) + título + cuerpos + CTA en nav derecha (en app el CTA va al pie). Deep links § 6.8.0.

**Placeholders dinámicos** (demo / Creator): `{PUNTATE_MIN}` (ej. `10` o `%`), `{CORRECTAS}`, `{TOTAL}`, `{PCT}` / umbral en texto de límite.

###### A) Aprobatorio — `#eval-resultado-aprobado`

**Figma:** `2389:46663`

| Elemento | Copy exacto |
|----------|-------------|
| Ícono | Tick / check verde (glass APP) |
| Título | **`¡Aprobaste!`** |
| Línea 1 | **`El puntaje requerido para aprobar es {PUNTAJE_MIN}`** (ej. Figma: `10`) |
| Línea 2 (bold) | **`Respuestas correctas {CORRECTAS} de {TOTAL}`** (ej.: `11 de 12`) |
| Línea 3 | **`Sigue aprendiendo,`** / **`¡puedes continuar a la siguiente página!`** |
| CTA primario | **`Continuar`** → siguiente ítem del índice (`Fin del contenido` § 7) |

###### B) Reprobatorio (quedan intentos) — `#eval-resultado-reprobado`

**Figma:** `2389:47137`

| Elemento | Copy exacto |
|----------|-------------|
| Ícono | Close / X magenta-rosa |
| Título | **`¡No aprobaste!`** |
| Línea 1 | **`El puntaje requerido para aprobar es {PUNTAJE_MIN}`** |
| Línea 2 (bold) | **`Respuestas correctas {CORRECTAS} de {TOTAL}`** (ej.: `7 de 12`) |
| Línea 3 | **`Inténtalo de nuevo para poder continuar`** |
| CTA primario | **`Reintentar`** → vuelve a **Bienvenida** (o directo a fase 2 si producto unifica; playground: **Bienvenida**) y consume el cupo al iniciar de nuevo |

> Mientras queden intentos, **no** avanzar índice ni marcar Evaluación como Completada.

###### C) Tiempo agotado — `#eval-resultado-tiempo`

**Figma:** `2389:47261`

| Elemento | Copy exacto |
|----------|-------------|
| Ícono | Reloj azul (glass Clock) |
| Título | **`¡Tiempo agotado!`** |
| Cuerpo | **`Se ha agotado el tiempo para responder la evaluación correctamente. Inténtalo de nuevo para poder continuar`** |
| CTA primario | **`Reintentar`** → misma regla que reprobatorio (consume intento al reentrar) |

###### D) Límite de intentos — `#eval-resultado-limite`

**Figma:** `2389:47401`

| Elemento | Copy exacto |
|----------|-------------|
| Ícono | Warning / danger naranja (¡) |
| Título | **`¡Alcanzaste el límite de intentos permitidos!`** |
| Línea 1 | **`Para aprobar necesitas {PCT}%, es decir, al menos {MIN_ACIERTOS} de las {TOTAL} preguntas`** (ej. Figma: `70%` / `3.5` / `5` — usar valores del mock demo; si el umbral es “nota 10”, alinear wording con Creator) |
| Línea 2 (bold) | **`Respuestas correctas {CORRECTAS} de {TOTAL}`** |
| Cuerpo | **`Has agotado todos tus intentos y no alcanzaste la puntuación mínima para aprobar. Comunícate con el administrador de capacitación de tu empresa para solicitar un nuevo intento.`** |
| CTA primario | **`Ir al inicio`** → `../home-learn.html` (o portada del curso si producto lo define; playground: **home-learn**) |

**Cuándo mostrar D vs B:** si tras un intento (score bajo **o** timeout **o** salida mid-intento) `evalIntentoActual > maxAttempts` → variante **límite**; si aún quedan intentos → **reprobado** o **tiempo**.

**Referencia autor (config):** `contexto-creacion-contenido.md` — modal Configuración (% mínimo, orden aleatorio, nº preguntas, etc.).

#### 6.8.5 Estado en sesión (implementación)

Por cada página `tipo: 'evaluacion'` en el mock § 11.1:

```js
{
  evalFase: 'bienvenida' | 'evaluacion' | 'resultado',
  evalResultadoKind: null | 'aprobado' | 'reprobado' | 'tiempo' | 'limite',
  evalIntentoActual: 1,
  evalUltimoResultado: null | {
    aprobado: boolean,
    correctas: number,
    total: number,
    puntajeMin: number
  }
}
```

Al abrir un hash `#eval-*` (§ 6.8.0), setear `evalFase` / `evalResultadoKind` y precargar score mock. Persistencia tras refresh real: § 8.1 (_pendiente_).

#### 6.8.6 Relación con cierre § 7

Solo tras **resultado `aprobado` + `Continuar`**, el flujo avanza a **`Fin del contenido`** (§ 7). Reprobado / tiempo / límite **no** abren el cierre.

---

### 6.7 Preguntas cerradas (Recursos)

| # | Pregunta | Respuesta |
|---|----------|-----------|
| 6.1 | ¿Entrada a Recursos? | `Comenzar ahora` o `Continuar` desde portada → página 1 o última vista |
| 6.2 | Layout Recursos | Dos columnas: visor 703px + nav/índice ~479px (§ 6.1) |
| 6.3 | Complementarios al alumno | Sí — descarga (`DescargarArchivo`) + texto (card); orden Creator; § 6.3 |
| 6.4 | Navegación principal | **`Regresar`** + **`Continuar`** en `TituloProgresoYNav` |
| 6.5 | Regresar en página 1 | Vuelve a **portada** del curso |
| 6.6 | Secuencia | Bloqueada — candado en páginas futuras |
| 6.6b | Umbral % video | **No** — basta **`Continuar`** (§ 6.6b) |
| 6.6c | ¿Qué tipos exigen consumo? | Solo **Evaluación** (y **Encuesta** en el futuro); resto = solo Continuar |
| 6.7 | Progreso en Recursos | Mismo `ProgresoExpEstudio` bajo botones nav |
| 6.8 | Header visor aparte | **No** — título curso va en columna derecha, no en chrome extra |
| 6.9 | Modo oscuro | Sigue `[data-theme="dark"]` del producto |
| 6.10 | Evaluación | Tres fases § 6.8; `learn-question` **solo `collab`**; **`Continuar` disabled** hasta responder todas |
| 6.12 | Resultado eval | 4 variantes APP v3 + hashes § 2.3.1 / § 6.8.4c |
| 6.13 | Salida mid-intento | Cuenta como intento (§ 6.8.3b) |
| 6.11 | Render recursos | Reutilizar mounts Creator § 6.2; sin footers edición |

---

## 7. Bloque 3 — Cierre del contenido (`Fin del contenido`)

**Propósito:** felicitar al colaborador por **terminar** el contenido, ofrecer certificado y sugerir siguientes contenidos.

**Referencia Figma APP (copy + ilustración + atmósfera):** [Thank you / Fin de contenido](https://www.figma.com/design/zHCCbQamZeiZJPlT7GEKDs/APP-v3.0.0?node-id=2389-47632&m=dev) (`2389:47632`).

> **OJO — APP ≠ desktop:** el frame es **móvil** (una sola columna, CTA inferior sticky, sin índice). En **desktop playground** el cierre sigue el **layout de dos columnas** (§ 6.1 / § 7.1): izquierda = `CierreExpEstudio`; **derecha siempre visible** = `TituloProgresoYNav` + `IndiceExpEstudio` completado. De Figma se toma **contenido visual y copy** de la zona de felicitación + el patrón de “siguientes contenidos”; **no** se copia el shell móvil ni se oculta el índice.

**Regla de tokens (§ 6.8.0):** de Figma — ilustración, textos, estructura y gradiente de atmósfera. **Colores de UI** con tokens `--ubits-*` (no hex del frame).

**Cuándo se muestra:** tras **evaluación aprobada** (§ 6.8 fase 3 + **`Continuar`**) → ítem **`Fin del contenido`** → pantalla de cierre.

**Deep link QA:** `#cierre` o `#pagina-p-6` (§ 2.3.1) — monta cierre con consumibles Completadas + confeti, sin recorrer el flujo.

**Efecto al entrar:** **`launchUbitsConfetti()`** — `components/ubits-confetti.js`. Pantalla completa, `pointer-events: none`, respeta `prefers-reduced-motion`.

### 7.1 Layout desktop — dos columnas (obligatorio)

```
┌────────────────────────────────────┬──────────────────────────────────┐
│  COLUMNA IZQUIERDA                 │  COLUMNA DERECHA (siempre)       │
│  CierreExpEstudio                  │  TituloProgresoYNav (Completed)  │
│  · wash verde superior             │  · Regresar / Ver más contenidos │
│  · ícono éxito + copy APP          │  · ProgresoExpEstudio 100 %      │
│  · card Certificado disponible     │  · IndiceExpEstudio Completado   │
│  · carrusel «Sigue el camino»      │    (secciones colapsables § 4.3) │
│    (createCarouselContents)        │                                  │
└────────────────────────────────────┴──────────────────────────────────┘
```

| Superficie | APP (referencia) | Desktop playground |
|------------|------------------|--------------------|
| Shell | Fullscreen móvil, CTA sticky **`Ir al inicio`** | Shell dos columnas Recursos/Cierre |
| Índice | No visible | **Siempre** a la derecha, estado Completado |
| Salida catálogo | Botón **`Ir al inicio`** → home Aprende | Nav derecha: **`Ver más contenidos`** → `../home-learn.html#buscar` (§ 5.6b.1). Mismo destino; **copy desktop** de nav permanece |
| Carrusel sugeridos | Cards horizontales APP | **`createCarouselContents`** como en `home-learn` (§ 7.2.5) — no portar cards APP a mano |

### 7.2 Columna izquierda — `CierreExpEstudio`

Orden vertical (de APP, adaptado a columna scrollable desktop):

#### 7.2.1 Atmósfera — gradación verde superior

Wash suave **verde éxito** que nace arriba y se disuelve hacia abajo (APP: gradiente diagonal / radial verde traslúcido sobre fondo claro).

| Aspecto | Implementación playground |
|---------|---------------------------|
| Base | Fondo página/columna con token superficie (`bg-1` / página) |
| Wash | Gradiente superior con **verde success / accent-green del DS** a baja opacidad (p. ej. `color-mix` / alpha sobre `--ubits-feedback-accent-success` o `--ubits-accent-green`) — **no** hardcodear el verdoso del frame APP |
| Alcance | Solo columna izquierda del cierre (o stage del bloque felicitación); no pintar encima del índice derecho |

#### 7.2.2 Ícono / ilustración de éxito

| Aspecto | Detalle |
|---------|---------|
| Motivo APP | Dos cuadrados redondeados verdes apilados (efecto 3D) + **check** blanco al centro |
| Nodo Figma | Ícono `2389:47693` dentro de Thank you `2389:47632` ([APP](https://www.figma.com/design/zHCCbQamZeiZJPlT7GEKDs/APP-v3.0.0?node-id=2389-47632&m=dev)) |
| Asset playground | SVG export Figma en set compartido **`images/icons/`** (también `Ubits-React/public/images/icons/`): `success-icon.svg`, `error-icon.svg`, `info-icon.svg`, `warning-icon.svg`, `time-icon.svg`. Cierre usa `success-icon.svg`. **No** high-five LXP |
| Cert thumb | **`cierre-cert-thumb.png`** — miniatura de la card certificado (mismo frame APP) |
| Tamaño ref. | Ícono ~80×80 px |

#### 7.2.3 Copy felicitación (APP — exacto)

```
¡Felicidades!
Has culminado con éxito el curso
{Nombre del contenido}
```

| Línea | Tipografía / tokens |
|-------|---------------------|
| **`¡Felicidades!`** | Semibold / heading corto, `fg-1-high`, centrado |
| **`Has culminado con éxito el curso`** | Medium, `fg-1-medium` — **sin** dos puntos al final; copy APP (demo = curso) |
| **`{Nombre del contenido}`** | Semibold, `fg-1-high` — `titulo` del catálogo (`?id=`). **Sin** comillas tipográficas |

> **Retirado** el mensaje largo LXP (*«Tu dedicación es una inspiración…»*). Fuente de verdad: APP.

#### 7.2.4 Card certificado — `Certificado disponible`

Sustituye el botón primario suelto «Descargar certificado» de la captura LXP antigua.

| Parte | Detalle |
|-------|---------|
| Contenedor | Card redondeada; fondo token **info subtle** (familia feedback info bg — no hex del frame) |
| Thumb izq. | Miniatura certificado APP → `cierre-cert-thumb.png` |
| Título | **`Certificado disponible`** — color **brand** |
| Subtítulo | Nombre del contenido truncado con ellipsis |
| Acción | Botón **icon-only** descarga (`fa-arrow-down-to-line`) + tooltip / `aria-label` «Descargar certificado» |
| Visibilidad | Si `conCertificacion === true`; si no, ocultar card |

#### 7.2.5 Carrusel «Sigue el camino»

**Intención APP:** sugerir siguientes contenidos tras cerrar.

**Implementación playground (acordado):** reutilizar **nuestros carruseles** de `home-learn` — componente **`createCarouselContents`** (`components/carousel-contents.js` + CSS), **no** reimplementar las cards horizontales del frame móvil.

| Aspecto | Valor |
|---------|-------|
| Título sección | **`Sigue el camino`** |
| Descripción | **`Este contenido es parte de estas rutas de aprendizaje. Explóralas y sigue avanzando.`** |
| API | `createCarouselContents` / `UbitsCarouselContents` `type: 'content-cards'` — mismo patrón que `initContinuaAprendiendoCarousel` en `home-learn.js` |
| Título/desc | Viven en `CierreExpEstudio` (no duplicar el `sectionTitle` del carrusel; vacío o oculto) |
| Datos | Slides mock desde `BDS_CONTENIDOS_UBITS` / `CONTINUA_APRENDIENDO_SLIDES` (mismo pipeline que home-learn). Si aún no hay “rutas padre” del curso demo, mostrar **sugeridos de catálogo** |
| Mount | `initCierreExpEstudio(root, { carouselSlides })` monta el carrusel en el slot; React pasa `<UbitsCarouselContents …>` como `carousel` |
| Layout en columna | Ancho de la columna izquierda; `cardsPerView: 2` (no 4 de home-learn); flechas/indicadores desktop de `carousel-contents` (no dots móviles APP). Doc vanilla: cargar `avatar.css` + `avatar.js` con `card-content` |
| Clic slide | Navegar a portada del contenido (`exp-estudio.html?id=…`) o destino equivalente home-learn |

### 7.3 Columna derecha — nav + progreso + índice completado

Mismo shell que Recursos (§ 6.4), variante **post-cierre** — **no** eliminar ni colapsar en desktop:

| Parte | Valor |
|-------|-------|
| Título curso | Nombre del contenido (igual Recursos) |
| **`Regresar`** | Secundario — vuelve a la **última página consumible** (evaluación) |
| **`Ver más contenidos`** | Primario — **`../home-learn.html#buscar`** + focus buscador (§ 5.6b.1). Equivale funcionalmente al **`Ir al inicio`** del APP |
| `ProgresoExpEstudio` | **`Completed`** — barra **verde**, **`100 %`** |
| `IndiceExpEstudio` | **`Completado`** — ✓ en todas; fila **`Fin del contenido`** **`Activa`**; secciones colapsables (§ 4.3) |

> **Portada** completada (§ 5.6b): CTAs `Ver más contenidos` + `Descargar certificado` en `TituloSpecsCtaExpEstudio`. **Cierre § 7:** certificado = **card** en izquierda (§ 7.2.4); salida catálogo = nav derecha.

### 7.4 Confeti

| Aspecto | Detalle |
|---------|---------|
| Script | `../../components/ubits-confetti.js` en `exp-estudio.html` |
| API | `launchUbitsConfetti()` al montar vista cierre (primera llegada tras completar) |
| Referencias | `study-chat.js`, `scorm-recurso-modal.js`, `modo-estudio-ia.html` |
| Accesibilidad | Sin confeti si `prefers-reduced-motion: reduce` |

### 7.5 Relación portada completada (§ 5.6b)

| Vista | Cuándo | Columna izquierda | CTAs salida |
|-------|--------|-------------------|-------------|
| **Cierre § 7** | Tras `Continuar` en evaluación aprobada | Felicitación APP + cert card + carrusel | Nav derecha: `Ver más contenidos` |
| **Portada § 5.6b** | Vuelve a portada con curso terminado | Hero + ficha catálogo | `Ver más contenidos` + `Descargar certificado` |

Ambas marcan el contenido como **100 %** en índice y progreso.

### 7.6 Preguntas cerradas (cierre)

| # | Pregunta | Respuesta |
|---|----------|-----------|
| 7.1 | ¿Pantalla aparte? | **Sí** — § 7, ítem `Fin del contenido` |
| 7.2 | Copy / ilustración | APP `2389:47632` — § 7.2.2–7.2.3 |
| 7.3 | Gradiente verde | **Sí** — wash superior success (§ 7.2.1), tokens |
| 7.4 | Certificado | Card **`Certificado disponible`** + icon-download (§ 7.2.4) |
| 7.5 | Sugeridos | Carrusel **`Sigue el camino`** vía `createCarouselContents` / home-learn (§ 7.2.5) |
| 7.6 | Layout desktop | **Dos columnas**; índice derecho siempre (§ 7.1) |
| 7.7 | Confeti | **Sí** — `launchUbitsConfetti()` |
| 7.8 | Volver a recursos | Índice: páginas Completadas clicables (repaso) |

---

## 8. Progreso, persistencia y reglas de negocio

**Parcialmente cerrado (§ 1.2):** en sesión sin refresh, el flujo y la última página vista se mantienen; portada muestra **Continuar**.

### 8.1 Persistencia tras refresh

> _Pendiente implementación_ (`sessionStorage`, mock en `bd-exp-estudio-demo.js`, etc.).

### 8.2 ¿El progreso de exp-estudio se refleja en Zona de estudio / Historial?

**No** — en el playground v1, **completar** un contenido en `exp-estudio.html` **no** actualiza automáticamente las pestañas **Historial** ni el progreso de **Zona de estudio** (`zona-estudio.html`).

| Aspecto | Comportamiento playground v1 |
|---------|------------------------------|
| Terminar curso en exp-estudio | Estado vive en **sesión / mock local** de exp-estudio |
| Tab Historial (zona de estudio) | **Sin sync** con exp-estudio al cerrar un curso |
| Planes asignados / KPIs zona de estudio | **Sin sync** con exp-estudio en v1 |

> Zona de estudio tiene su propio universo de datos (`bd-planes-formacion.js`, etc.) — ver [`contexto-zona-estudio.md`](../contexto-zona-estudio.md). No asumir que exp-estudio escribe ahí.

**Pregunta futura (producción):** si LXP sincroniza consumo real con historial — fuera de alcance del mock actual.

### 8.3 Regla de «completado» del contenido

**Sí:** para marcar el contenido como **completado** (100 %, pantalla cierre § 7, portada § 5.6b), el colaborador debe haber **completado todas las páginas consumibles** del índice (§ 3.3).

| Regla | Detalle |
|-------|---------|
| Obligatoriedad de recorrido | Debe **pasar** por todas las páginas consumibles del índice (video, PDF, 2× SCORM, evaluación en demo) |
| Criterio por tipo | Video / PDF / SCORM (y equivalentes): basta **`Continuar`**. **Evaluación**: debe **aprobar** (§ 6.8). **Encuesta**: misma idea de completar flujo, pero **fuera de v1** (§ 6.6) |
| Ítem `Fin del contenido` | Pantalla de cierre § 7 — corona el 100 % |
| Complementarios | **No** cuentan para completado (§ 6.3) |

**§ 8.3b — Detalle por fase y resultado negativo:**

Cerrado en § 6.8.4c: reprobado / tiempo → **Reintentar**; límite de intentos → **Ir al inicio**; solo **aprobado** desbloquea avance al cierre.

### 8.4 Formato de números

En pantallas con contadores visibles del módulo Aprendizaje, usar `formatIndicatorNumber` (regla transversal playground — ver `CLAUDE.md` / vanilla `seguimiento.js`). Exp-estudio: % de progreso en barra (no requiere formato K/M).

---

## 9. Usuario demo del playground

Ver **[`contexto-aprendizaje.md` § 1](../contexto-aprendizaje.md#1-usuario-demo-del-playground-transversal)** — usuario **único** en todo el playground.

| Pregunta | Respuesta |
|----------|-----------|
| **9.1 Usuario simulado** | **María Alejandra Sánchez Pardo** (`E006`, Jefe de Logística, Fiqsha). **No** usar otro nombre genérico. |
| **9.2 Estado inicial del demo exp-estudio** | **Desde cero** — al abrir el curso demo por primera vez: portada **sin iniciar** (§ 5.4), índice con candados, CTA **`Comenzar ahora`**. No precargar progreso parcial ni completado en el mock v1. |

**Implementación:** progreso de exp-estudio en memoria de sesión (§ 1.2); usuario identidad fija vía catálogo/colaborador demo — no parametrizar otro `userId` en URL.

---

## 10. Relación con otros flujos (referencias cruzadas)

| Tema | Documento / componente | Relación |
|------|------------------------|----------|
| Estructura pedagógica (autor) | `lms-creator/contexto-creacion-contenido.md` | Creator **define** secciones/páginas + **complementarios**; exp-estudio **consume** (§ 6.3) |
| Jerarquía secciones/páginas | `crear-contenido.html`, `indice-creator`, `paginas-creator` | Misma estructura, vista learner |
| Índice learner | **Nuevos** `SeccionExpEstudio` + `IndiceExpEstudio` (§ 4.3) | Tarjetas separadas como Creator (sin `bg-3`); colapsables; no reutilizar `indice-creator` |
| Portada visual | `learn-content-img-trailer` | Candidato para imagen/tráiler en portada |
| Catálogo | `bd-contenidos-ubits.js`, `bd-contenidos-fiqsha.js` | Metadata portada vía `?id=` |
| Cards y tablas | `card-content.js`, tablas historial/tareas | **Puntos de entrada** → `exp-estudio.html?id=` |
| Home Aprendizaje (salida finalizado) | `home-learn.html`, `#home-learn-search-input` | CTA `Ver más contenidos` → `../home-learn.html#buscar` |
| Renders Recursos | `lms-creator/crear-contenido.js`, `crear-contenido-pdf-viewer.js`, `crear-contenido.css` | **Reutilizar** mounts § 6.2; sin footers edición |
| Confeti cierre | `components/ubits-confetti.js` | `launchUbitsConfetti()` en § 7.4 |
| Seguimiento learner | `aprendizaje/contexto-zona-estudio.md` | **Sin sync** progreso exp-estudio → historial (§ 8.2) |
| Rutas de aprendizaje | `lms-creator/contexto-creacion-ruta.md` | **Fuera de v1** — clic sin destino |
| **Modo estudio IA** | `modo-estudio-ia.html`, `HU-modo-estudio-IA.md` | **Producto distinto** — ver § 10.1 y [`contexto-aprendizaje.md` § 2.1](../contexto-aprendizaje.md#21-comparativa-clave--modo-estudio-ia-vs-experiencia-de-estudio) |
| Contexto módulo Aprendizaje | `contexto-aprendizaje.md` | Índice maestro — **leer antes** de cualquier pantalla del módulo |

### 10.1 Modo estudio IA vs Experiencia de estudio — productos distintos

**Respuesta cerrada: Sí, son productos totalmente distintos. No comparten flujo, progreso ni certificados.**

Documentación canónica: [`contexto-aprendizaje.md` § 2.1](../contexto-aprendizaje.md#21-comparativa-clave--modo-estudio-ia-vs-experiencia-de-estudio).

| | **Modo estudio IA** | **Experiencia de estudio (este doc)** |
|---|---------------------|---------------------------------------|
| Naturaleza | Chat IA — aprender **cualquier cosa** o pedir sugerencias | Consumir **contenido estructurado** del LMS Creator |
| Catálogo | Puede sugerir cursos UBITS si el usuario lo pide | Contenido **ya elegido** al entrar (`?id=`) |
| Fuera de UBITS | Sí (ej. enseñar japonés — competencia no en catálogo) | No — solo lo publicado en el contenido |
| Entregables IA | Quiz, flashcards, plan, podcast **en el chat** | Páginas fijas: video, PDF, evaluación, etc. |
| Certificado | No | Sí (si aplica) |
| Índice / % páginas | No | Sí (§ 4–7) |

**PREGUNTA 10.2 — Referencia Figma exp-estudio.**

> **Learner v4** — `ivTgxM9bL6vcvGU90P8oGg`. Portada y Recursos video: § 5.0, § 6.0. Cierre: captura LXP § 7 (sin Figma).

---

## 11. Inventario de archivos

| Archivo | Rol | Estado |
|---------|-----|--------|
| `exp-estudio/contexto-exp-estudio.md` | Este documento | ✅ |
| `components/feedback-exp-estudio.*` | Feedback Locked/Check/Progress 24px | ✅ Vanilla + React `Feedback` + doc |
| `components/paginas-exp-estudio.*` | Fila de página índice | ✅ Vanilla + React `PaginasExpEstudio` + doc |
| `components/seccion-exp-estudio.*` | Tarjeta sección índice (base Creator) | ✅ Vanilla + React `SeccionExpEstudio` + doc |
| `components/indice-exp-estudio.*` | Stack de secciones learner | ✅ Vanilla + React `IndiceExpEstudio` + doc |
| `documentacion/componentes/*-exp-estudio.html` | Previews en catálogo vanilla | ✅ 9 páginas en sidebar Aprendizaje |
| `components/progreso-exp-estudio.*` | Widget «Tu progreso:» | ✅ Vanilla + React `ProgresoExpEstudio` |
| `components/titulo-specs-cta-exp-estudio.*` | Portada derecha | ✅ Vanilla + React `TituloSpecsCtaExpEstudio` |
| `components/titulo-progreso-y-nav-exp-estudio.*` | Recursos/Cierre derecha | ✅ Vanilla + React `TituloProgresoYNavExpEstudio` |
| `components/cierre-exp-estudio.*` | Columna izquierda cierre § 7 | ✅ Vanilla + React `CierreExpEstudio` |
| `components/eval-sticky-bar-exp-estudio.*` | Sticky timer + intentos | ✅ Vanilla + React `EvalStickyBarExpEstudio` |
| `images/icons/{success,error,info,warning,time}-icon.svg` | Set feedback Figma (eval + cierre); React: `public/images/icons/` | ✅ |
| `exp-estudio/assets/cierre-cert-thumb.png` | Thumb card certificado Figma APP | ✅ |
| `exp-estudio/exp-estudio.html` + `.js` + `.css` | Página principal | ✅ Vanilla |
| `exp-estudio/bd-exp-estudio-demo.js` | Mock § 3.3 (`f007`) | ✅ |
| React `pages/.../exp-estudio.tsx` + `lib/aprendizaje/expEstudioDemo.ts` | Misma experiencia en playground React | ✅ |
| `../../components/carousel-contents.js` | Carrusel «Sigue el camino» | ✅ Reutilizar |
| `../../components/ubits-confetti.js` | Confeti cierre | ✅ Reutilizar |
| `components/learn-question.js` | Eval fase 2 — solo `collab` | ✅ Reutilizar |
| Creator CSS/JS / pdfjs | Renders § 6.2 | ✅ Reutilizar |

**§ 11.1 — Mock estructura pedagógica (cerrado):**

Archivo `exp-estudio/bd-exp-estudio-demo.js` — objeto JS con secciones, páginas, `tipoRecurso`, títulos copy-exactos de § 3.3. `exp-estudio.js` lo carga junto al catálogo (`?id=`). No extender `bd-master/` hasta que el demo se oficialice en catálogo global.

```js
// Esquema orientativo
window.BD_EXP_ESTUDIO_DEMO = {
  contentId: 'f007', // § 3.1 — Fiqsha conflictos
  secciones: [
    {
      id: 'sec-1',
      titulo: 'Sección 1: Fundamentos',
      paginas: [
        { id: 'p-1', titulo: 'Comunicación para desescalar un conflicto', tipo: 'video',
          complementarios: [
            { tipo: 'archivo-descargable', nombre: 'Documento de ejemplo.pdf', pesoBytes: 2200000, url: '…' },
            { tipo: 'texto', html: '<p>Un conflicto es una diferencia de intereses…</p>' }
          ]
        },
        { id: 'p-2', titulo: 'Guía mapa de conflicto', tipo: 'pdf',
          pdfSrc: '…/guia-mapa-conflicto.pdf', allowPdfDownload: true }
      ]
    },
    {
      id: 'sec-2',
      titulo: 'Sección 2: Herramientas para resolver conflictos',
      paginas: [
        { id: 'p-3', titulo: 'Simulador de conversación difícil', tipo: 'scorm' },
        { id: 'p-4', titulo: 'Conversaciones difíciles según Thomas-Kilmann', tipo: 'scorm' },
        { id: 'p-5', titulo: 'Evaluación', tipo: 'evaluacion',
          evalConfig: {
            maxAttempts: 2, /* Figma sticky ejemplo «Intentos: 2 de 2»; ajustable */
            timeLimitMinutes: 10,
            timeLimitEnabled: true,
            minPassScore: 10 /* copy resultado; o % — alinear con Creator */
          },
          evalFase: 'bienvenida',
          evalResultadoKind: null,
          evalIntentoActual: 1,
          preguntas: '/* array 10 ítems — copy § 6.8.4b.1 */'
        },
        { id: 'p-6', titulo: 'Fin del contenido', tipo: 'fin' }
      ]
    }
  ]
};
```

---

## 12. Preguntas abiertas — checklist

### Cerrado ✅
- [x] 1.1 Puntos de entrada al flujo
- [x] 1.2 Progreso parcial / Continuar
- [x] 1.3 Tipos de contenido (salvo rutas)
- [x] 2.1 Layout estándar colaborador
- [x] 2.2 Chrome visible (sidebar, tab bar)
- [x] 2.3 URL `exp-estudio.html?id=`
- [x] 2.3.1 Deep links: portada ×3, páginas `p-1`…`p-6` / alias, eval ×6, `#cierre`
- [x] 3.2 Misma estructura Portada → Recursos → Cierre
- [x] 4.1 Secciones con páginas
- [x] 4.2 / 4.3 Índice learner: `SeccionExpEstudio` tarjetas separadas (como Creator, sin `bg-3`) + stack `IndiceExpEstudio`; colapsables (APP `1756:11404`; sin contador)
- [x] 4.4 Barra de progreso global (sí)
- [x] 5.1–5.8 Portada sin iniciar (Figma UBITS + FIQSHA)
- [x] 10.2 Figma Learner v4 (nodes § 5.0)

- [x] 3.3 Índice curso demo (2 secciones, 6 ítems: video, PDF, 2× SCORM, evaluación, fin; sin encuesta)
- [x] 6.1 / 6.5 Tipos recurso curso demo (incluye SCORM alineado a Creator)
- [x] 6.6b Umbral % video — **No**; basta `Continuar` sin reproducir
- [x] 11.1 Mock `bd-exp-estudio-demo.js`

### Pendiente (Figma / siguiente ronda)
- [x] 3.1 ID contenido en catálogo (`f007`)
- [x] 5.6 Portada en progreso — delta columna derecha (Figma `40006338:44692`)
- [x] 5.6b Portada finalizada — delta columna derecha (Figma `40006350:2730`)
- [x] 7.1–7.6 Cierre APP `2389:47632` — wash verde, copy, cert card, carrusel home-learn; desktop 2 cols + índice
- [x] 6.1–6.10 Recursos — vista consumo (Figma video `40006360:4608`, § 6)
- [x] 6.8 Evaluación — 3 fases (Bienvenida → Evaluación → Resultado)
- [x] 6.8.0 Figma APP v3 (copy/assets); deep links eval → § 2.3.1
- [x] 6.8.3b Salida mid-intento cuenta como intento
- [x] 6.8.4a Bienvenida APP v3 (Recordatorio)
- [x] 6.8.4b Sticky APP v3 (`Tiempo restante: … min` \| `Intentos: A de T`) + 10 preguntas demo
- [x] 6.8.4c Resultado — 4 variantes (aprobado / reprobado / tiempo / límite)
- [ ] 8.1 Persistencia tras refresh
- [x] 8.2 Sin sync exp-estudio → zona de estudio / historial
- [x] 8.3 Completado = todas las páginas + eval **aprobada** (§ 6.8)
- [x] 9.1 María Alejandra Sánchez Pardo (`E006`)
- [x] 9.2 Demo desde cero
- [x] 10.1 Modo estudio IA ≠ exp-estudio ([`contexto-aprendizaje.md`](../contexto-aprendizaje.md))

---

## 13. Próximo paso acordado

1. ~~Figma portada sin iniciar (UBITS + FIQSHA)~~ ✅ § 5.0–5.8.
2. ~~Figma portada en progreso (UBITS)~~ ✅ § 5.6.
3. ~~Figma portada finalizada (UBITS)~~ ✅ § 5.6b.
4. ~~Vista Recursos + reutilizar renders Creator~~ ✅ § 6.2, § 6.0–6.7.
5. ~~Página cierre (`Fin del contenido`)~~ ✅ § 7 — APP copy/atmósfera + carrusel home-learn; desktop 2 cols.
6. ~~Evaluación — 3 fases + resultados APP v3 + deep links~~ ✅ § 6.8.0–6.8.4c.
7. Implementación vanilla: `exp-estudio.html` + componentes + eval + confeti + **deep links § 2.3.1** (portada / páginas / eval / cierre).

---

*Última actualización: jul 2026 — Componentes § 11 creados en vanilla + React (Feedback, Paginas, Indice, Progreso, TituloSpecsCta, TituloProgresoYNav, Cierre, EvalStickyBar). Página exp-estudio pendiente.*
