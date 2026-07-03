# Experiencia de estudio (consumo de contenido) — contexto de producto y playground

> Documento de referencia para implementar y mantener en **Referente-Vanilla** la **experiencia del colaborador al estudiar un contenido** (curso demo y, en el futuro, otros tipos). Cubre la **portada**, la **navegación y consumo de recursos** y la **página de cierre** tras finalizar.

**Estado del documento:** § 6.8.4a–b cerrados (Bienvenida + Evaluación). Pendiente: Resultado § 6.8.4c, persistencia § 8.1, id catálogo § 3.1.

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
ubits-colaborador/aprendizaje/exp-estudio/exp-estudio.html?id=<contentId>
```

| Parámetro | Uso |
|-----------|-----|
| `id` | Identificador del contenido en catálogo mock (`u001`, `f014`, etc.) |

**Resolución de datos en portada (mínimo v1):**

1. Buscar `id` en `bd-master/bd-contenidos-ubits.js` → `BDS_CONTENIDOS_UBITS.contents`
2. Si no existe, buscar en `bd-master/bd-contenidos-fiqsha.js` → `contents` y `contentsCreatorOnly`
3. Con el registro encontrado, pintar en portada al menos: **imagen**, **título**, **descripción** y demás propiedades del objeto catálogo (`tipoContenido`, `tiempoValor`, `nivelId`, `conCertificacion`, etc.)

**Estado interno del flujo (portada / sección / página / cierre):** se maneja en **memoria de sesión** (JS) para no perder avance al navegar dentro del producto sin refrescar. Hash opcional en fases posteriores (`#portada`, `#cierre`) — no bloqueante para v1.

**Enlaces desde el resto del playground:**

```html
<!-- Ejemplo desde card-content o celda de tabla -->
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

**ID catálogo:** pendiente de enlazar con un registro de `bd-contenidos-fiqsha.js` o `bd-contenidos-ubits.js` (§ 2.3). La **estructura pedagógica** (índice) vive aparte del catálogo — ver § 3.3 y § 11.1.

### 3.2 Estructura del flujo por tipo

**Definición cerrada:** la estructura **Portada → Recursos (secciones + páginas) → Cierre** es **la misma** para todos los tipos consumibles. No hay variantes tipo «Short sin portada» en v1.

**Excepción:** Rutas de aprendizaje — flujo distinto, fuera de alcance.

### 3.3 Índice del curso demo (playground) — definición cerrada

Curso genérico con **2 secciones** y **5 ítems** en el índice (`IndiceExpEstudio`). Copy **exacto** de títulos.

**Fuera de alcance v1:** encuesta de satisfacción y sección índice `Cierre` con encuesta (existen en Figma producción, pero **no** se implementan hasta tener ese contenido creado).

```
Sección 1: Fundamentos                                    [i]
  Comunicación para desescalar un conflicto                 🔒
  Guía mapa de conflicto                                    🔒

Sección 2: Herramientas para resolver conflictos          [i]
  Simulador de conversación difícil                         🔒
  Evaluación                                                🔒
  Fin del contenido                                         🔒
```

| # | Sección | Título página | Tipo recurso (índice) | Notas |
|---|---------|---------------|----------------------|-------|
| 1 | `Sección 1: Fundamentos` | `Comunicación para desescalar un conflicto` | Video | Primera página al «Comenzar ahora»; **complementarios** descarga + texto en demo (§ 6.3) |
| 2 | `Sección 1: Fundamentos` | `Guía mapa de conflicto` | PDF | |
| 3 | `Sección 2: Herramientas para resolver conflictos` | `Simulador de conversación difícil` | Embebido | |
| 4 | `Sección 2: Herramientas para resolver conflictos` | `Evaluación` | Evaluación | |
| 5 | `Sección 2: Herramientas para resolver conflictos` | `Fin del contenido` | Fin | Ítem fijo; al **`Continuar`** desde la evaluación → **pantalla de cierre** § 7 (confeti) |

- **Total páginas consumibles:** 4 (video, PDF, embebido, evaluación). `Fin del contenido` es marcador de cierre en el índice, no una página de recurso intermedio.
- **Encuesta:** omitida en v1 — no aparece en el índice del playground.

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

- En Figma: componente **`IndiceExpEstudio`** + filas **`PaginasExpEstudio`** (ver § 5.7)
- Estados documentados: `Por iniciar` (§ 5.4.3), `En progreso` (§ 5.6.3), `Completado` (§ 5.6b.3)
- Candado: componente **`Feedback` Locked** (24px)

| Componente existente | Rol | ¿Usar en learner? |
|---------------------|-----|-------------------|
| `indice-creator` | Índice edición Creator | ❌ No directo |
| `sidebar-contenidos-lms` | Sidebar catálogo LMS | ❌ No directo |
| **`IndiceExpEstudio`** (nuevo) | Índice navegación consumo | ✅ Portar desde Figma |

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
| **Badge tipo** | Pill blanco con borde; dot azul info 8px + texto `tipoContenido` (ej. `Curso`) |
| **Título** | `display/d4/bold` — 28px, ej. «Resolución efectiva de conflictos en equipos de trabajo» |
| **Specs fila 1** | `SpecNivel` + `SpecText` tiempo + `SpecText` idioma |
| **Specs fila 2** | `SpecText` **Con certificado** + `SpecText` **Subtítulos** (solo UBITS; oculto en empresa) |

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

Card blanca, `border-radius-lg`, padding 12px. Lista de secciones y páginas **antes** de empezar.

**Encabezado de sección (`Seción`):**

- Título bold 16px — en demo: `Sección 1: Fundamentos`, `Sección 2: Herramientas para resolver conflictos`
- Botón icon-only **info** (`fa-circle-info`) a la derecha en cada sección
- **Sin** sección índice `Cierre` ni ítem de encuesta en el curso demo (§ 3.3)

**Fila de página (`PaginasExpEstudio`, `state: Bloqueada`):**

| Parte | Detalle |
|-------|---------|
| Ícono tipo | FA 16px, color `fg/on-disabled` — ver tabla abajo |
| Título | `body/sm/semibold` 13px, color disabled, ellipsis |
| Candado | Componente `Feedback` **Locked** — círculo 24px gris + `fa-lock` 12px |

**Tipos de página en índice (variantes Figma `PaginasExpEstudio`):**

| Tipo | Ícono FA (unicode en Figma) |
|------|----------------------------|
| Video | `\f03d` (fa-video) |
| Texto | `\f893` |
| PDF | `\f1c1` |
| Encuesta | `\e28d` | _No en curso demo v1_ |
| Embebido | `\e165` |
| Scorm | `\f1c6` |
| Evaluación | `\f733` |
| Fin | `\e31b` — texto fijo `Fin del contenido` |

**Índice del curso demo (playground)** — ver estructura completa § 3.3:

```
Sección 1: Fundamentos                          [i]
  ▶ Comunicación para desescalar un conflicto   🔒
  📕 Guía mapa de conflicto                     🔒
Sección 2: Herramientas para resolver conflictos [i]
  ⧉ Simulador de conversación difícil           🔒
  ☑ Evaluación                                  🔒
  🎉 Fin del contenido                          🔒
```

> Figma Learner v4 muestra más páginas y una sección `Cierre` con encuesta; el **playground** usa solo § 3.3 hasta que exista ese contenido.

**Reglas estado Por iniciar:**

- Todas las páginas: `state: Bloqueada`, candado visible, texto gris
- Páginas **no clicables** hasta pulsar `Comenzar ahora`

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

Card blanca, `border-radius` 10px, padding horizontal 16px / vertical 8px, ancho ~471px (full width columna derecha).

| Parte | Detalle |
|-------|---------|
| Ícono | `fa-flag` (`\f024`), 16px, `fg-1-medium` |
| Label | **`Tu progreso:`** — `display/bold` 16px |
| Barra | Track `bg-4-static` (#dbdde0), indicador `bg-blue-bold` (#0c5bef), altura **8px**, `border-radius-full` |
| Porcentaje | Texto **`NN %`** a la derecha de la barra — `semibold` 13px (ej. `50 %` en Figma) |

**Cálculo playground (curso demo § 3.3):**

```
% = (páginas completadas) / (páginas consumibles) × 100
```

- **Páginas consumibles:** las 4 de recurso (video, PDF, embebido, evaluación). **`Fin del contenido`** no cuenta para el % hasta completarse el flujo (confirmar en finalizado).
- Redondear para UI como en Figma (entero, ej. `50 %`).

#### 5.6.3 `IndiceExpEstudio` — `state: En progreso`

Misma card estructura que § 5.4.3, pero cada fila `PaginasExpEstudio` adopta uno de **tres estados**:

##### Estado `Completada`

| Aspecto | Detalle |
|---------|---------|
| Fondo fila | `bg-1` blanco |
| Título | `fg-1-high`, **bold** 13px |
| Ícono tipo | Color normal (no disabled) |
| Feedback derecho | **`Check`** — círculo 24px verde (`feedback/bg/success/subtle`) + borde success + ícono check 12px |

##### Estado `Activa` (página actual / última vista)

| Aspecto | Detalle |
|---------|---------|
| Fondo fila | `bg-2` (#f3f3f4) |
| Barra lateral | Franja **5px** `accent-brand` (#0c5bef) a la izquierda |
| Título + ícono tipo | Color **`accent-brand`**, bold 13px |
| Feedback derecho | **`Progress`** — círculo 24px fondo info subtle + borde brand + **spinner** 12px |

> En Figma el ejemplo activo usa tipo Scorm; el **patrón visual aplica a cualquier tipo** de página (video, PDF, embebido, evaluación, etc.).

##### Estado `Bloqueada` (pendiente)

Igual que § 5.4.3 sin iniciar: texto `fg/on-disabled`, Feedback **`Locked`**.

##### Ejemplo mapeado al curso demo (§ 3.3)

Usuario completó sección 1 y está en el simulador (50 %):

```
Sección 1: Fundamentos                          [i]
  ▶ Comunicación para desescalar un conflicto   ✓
  📕 Guía mapa de conflicto                     ✓
Sección 2: Herramientas para resolver conflictos [i]
  ⧉ Simulador de conversación difícil           ⟳  ← Activa (spinner)
  ☑ Evaluación                                  🔒
  🎉 Fin del contenido                          🔒

Tu progreso: [████████░░░░░░░░] 50 %
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

**Botón secundario — detalle Figma:**

- Ícono certificado (`fa-file-certificate` o equivalente) a la izquierda
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
Sección 1: Fundamentos                          [i]
  ▶ Comunicación para desescalar un conflicto   ✓
  📕 Guía mapa de conflicto                     ✓
Sección 2: Herramientas para resolver conflictos [i]
  ⧉ Simulador de conversación difícil           ✓
  ☑ Evaluación                                  ✓
  🎉 Fin del contenido                          ✓

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
| Índice | 2 secciones, 5 ítems (§ 3.3); sin encuesta | Igual |
| CTA sin iniciar | `Comenzar ahora` | `Comenzar ahora` |
| CTA en progreso | **`Continuar`** | **`Continuar`** |
| CTA finalizado | **`Ver más contenidos`** + **`Descargar certificado`** | Igual |
| Widget progreso en portada | No / azul parcial / **verde 100 %** | Igual |

**Regla implementación:** `catalogo_fiqsha` → layout empresa; `catalogo_ubits` → layout UBITS. Columna derecha comparte componentes y estados de progreso; variar specs según origen.

### 5.7 Componentes Figma a portar (playground)

Nombres del archivo Learner v4 — base para `components/` vanilla:

| Componente Figma | Rol | Notas playground |
|------------------|-----|------------------|
| `IndiceExpEstudio` | Índice learner (§ 4.3) | `Por iniciar` \| `En progreso` \| **`Completado`** |
| `PaginasExpEstudio` | Fila de página en índice | `Bloqueada` \| `Activa` \| `Completada` |
| `TituloSpecsCtaExpEstudio` | Badge + título + specs + CTAs + progreso | `Por iniciar` \| `En progreso` \| **`Completado`** |
| `ProgresoExpEstudio` | Widget «Tu progreso:» + barra + % | `In Progress` (azul) \| **`Completed`** (verde 100 %) |
| `DescripcionExpEstudio` | Card descripción | Soporta rich text / bold inline |
| `FichaCompetenciasYHabilidades` | Competencia/habilidades o categoría | Variante `Contenido Ubits` \| `Empresa` |
| `AliadosExpEstudio` | Card aliados | Solo UBITS |
| `ExpertosExpEstudio` | Card expertos | Solo UBITS |
| `Feedback` | Icono estado fila índice | Tipos: `Locked` \| `Check` \| `Progress` (24px) |
| **`TituloProgresoYNav`** | Título curso + nav + progreso | Recursos § 6.4 \| Cierre § 7.3 (`Ver más contenidos`) |
| **`CierreExpEstudio`** | Felicitación + certificado | Solo columna izquierda § 7 |
| **`EvalExpEstudio`** (orquestador) | 3 fases consumo evaluación | `bienvenida` \| `evaluacion` \| `resultado` — § 6.8 |
| **`EvalStickyBarExpEstudio`** | Barra sticky timer + intento | Solo fase 2 § 6.8.4b |
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

**Referencia Figma (ejemplo página 1 — video):** frame `Video` — node `40006360:4608` — [Figma Dev Mode](https://www.figma.com/design/ivTgxM9bL6vcvGU90P8oGg/Learner-v4--Deprecated--mejor-ver-Playground?node-id=40006360-4608&m=dev).

**Layout shell:** igual que portada (§ 2) — layout estándar colaborador, sidebar + SubNav, área principal en **dos columnas** desktop (gap 24px). La columna izquierda **ya no** muestra metadata del catálogo (competencia, aliados, etc.); solo el recurso de la página activa.

### 6.0 Referencias Figma — Recursos

| Ejemplo | Frame Figma | Node ID | URL Dev Mode |
|---------|-------------|---------|--------------|
| Página 1 — **Video** (+ complementarios descarga + texto) | `Video` | `40006360:4608` | [Figma](https://www.figma.com/design/ivTgxM9bL6vcvGU90P8oGg/Learner-v4--Deprecated--mejor-ver-Playground?node-id=40006360-4608&m=dev) |

> Frames adicionales por tipo (PDF, embebido, evaluación) — pendiente Dave. El patrón de **columna derecha** (`TituloProgresoYNav` + índice) se mantiene en todos.

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
| Evaluación | `[data-cc-eval-root]`, `.cc-eval-root` | Flujo eval Creator; **sin** complementarios |
| Complementario texto | `.ubits-complementary-resources--filled-stack[data-complementary-filled="texto"]` | `complementary-resources.js` — ocultar `__footer` |
| Complementario descarga | `[data-complementary-filled="archivo-descargable"]` o patrón **`DescargarArchivo`** learner | Card consumo § 6.3 |

**Scope CSS:** importar/reglas equivalentes a `.page-crear-contenido .crear-contenido-recursos__resources-mount` bajo clase de página **`page-exp-estudio`** (o contenedor `#exp-estudio-recurso-mount`). **No** duplicar estilos del visor; **sí** ocultar footers de edición.

**Datos:** el mock § 11.1 guarda por página el HTML montado o referencias (URL video, blob PDF, embed snippet) **copiados del patrón Creator**, no el flujo de subida.

**Progreso:** al marcar páginas consumibles como completadas, `ProgresoExpEstudio` en columna derecha sube el **%** (ej. 1/4 → 25 %, 4/4 + cierre → 100 % verde).

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
| Botón primario nav | **`Continuar`** mientras hay páginas consumibles pendientes; **`Ver más contenidos`** en vista **cierre § 7** (misma acción que § 5.6b) |
| `ProgresoExpEstudio` | Debajo de Nav — label **`Tu progreso:`** + barra 8px + **`NN %`** (avanza al completar páginas) |

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

Mismo componente que portada, estado **`En progreso`**, con la página actual en fila **`Activa`**:

| Estado fila | Visual (Figma) |
|-------------|----------------|
| **`Activa`** | Fondo `bg-2`, barra azul **5px** izquierda, título e ícono tipo en **brand**, `Feedback` **Progress** (spinner) |
| **`Completada`** | Check verde, título bold |
| **`Bloqueada`** | Texto disabled, `Feedback` **Locked** |

**Índice demo § 3.3:** 2 secciones, 5 ítems; **sin** sección `Cierre` ni encuesta (Figma producción las muestra; playground las omite).

#### 6.4.4 Orden vertical columna derecha (Recursos)

```
TituloProgresoYNav
  ├── título curso
  ├── [ Regresar ] [ Continuar ]
  └── ProgresoExpEstudio
IndiceExpEstudio (En progreso)
```

### 6.5 Tipos de recurso principal — curso demo (§ 3.3)

**No hay frames Figma adicionales:** PDF, embebido, evaluación y texto usan **la misma estructura de página** que el video (§ 6.1): columna izquierda = render Creator § 6.2; columna derecha = `TituloProgresoYNav` + índice.

| Tipo | En curso demo v1 | Columna izquierda |
|------|------------------|-------------------|
| Video | ✅ p.1 | `.cc-video-resource` + complementarios demo |
| PDF | ✅ p.2 | Visor PDF.js (`mountCrearContenidoPdfViewer`) |
| Embebido | ✅ p.3 | `.cc-embed-resource` |
| Evaluación | ✅ p.4 | **Tres fases** en la misma fila del índice (§ 6.8); sin complementarios |
| Fin (índice) | ✅ p.5 | **No** es recurso Creator — pantalla cierre § 7 |
| Encuesta / Texto / SCORM | ❌ | No en índice demo |

En Creator el autor puede montar más tipos; el playground demo implementa solo la tabla.

### 6.6 Reglas de «página completada» (v1 playground)

| Tipo | Criterio mock v1 | Notas |
|------|------------------|-------|
| Video | Al pulsar **`Continuar`** (o % visionado — _pendiente producto_) | Figma muestra 0 % en primera visita |
| PDF | **`Continuar`** tras abrir visor | |
| Embebido | **`Continuar`** tras interacción mínima mock | |
| **Evaluación** | Fase **Resultado** con **aprobado** + **`Continuar`** → recién ahí la fila cuenta como **Completada** y se puede avanzar en el índice (§ 6.8) | No basta un solo `Continuar` como en video/PDF |
| Complementarios | **No** afectan % ni bloqueo | Opcionales para el alumno |

**PREGUNTA 6.6b — ¿Umbral de video (% reproducido) para marcar completada?**

> _Pendiente producto / LXP._

### 6.8 Página tipo **Evaluación** — tres fases (misma fila del índice)

**Regla clave:** una página de **Evaluación** en el índice **no** es una sola pantalla estática. El alumno vive **tres fases** en la **misma fila activa** del índice. **`Continuar`** en la columna derecha **no** avanza al siguiente ítem del índice hasta completar el ciclo con **resultado positivo**.

**Origen de datos (specs / preguntas):** configuración y banco montados en Creator (`evaluaciones-recurso.js`, `.cc-eval-root`, modal **Configuración** en `contexto-creacion-contenido.md` § Evaluación final). En consumo: **solo lectura** — sin barra Eliminar / Generar con IA.

#### 6.8.1 Las tres fases

| # | Fase | Id interno sugerido | Columna izquierda (visor) | Al pulsar **`Continuar`** |
|---|------|---------------------|---------------------------|---------------------------|
| **1** | **Bienvenida** | `bienvenida` | Pantalla de bienvenida con **specs** (§ 6.8.4a) | **No** va a la siguiente página del índice → pasa a fase **2 Evaluación** |
| **2** | **Evaluación** | `evaluacion` | Barra sticky timer + intento (§ 6.8.4b) + **10 preguntas** `learn-question` | **No** va a la siguiente página del índice → fase **3 Resultado** |
| **3** | **Resultado** | `resultado` | Pantalla de **resultado** del intento (aprobado / no aprobado — **contenido detallado pendiente Dave § 6.8.4**) | **Si resultado positivo (aprobado):** **sí** avanza al **siguiente ítem del índice** (en demo § 3.3 → `Fin del contenido` § 7). **Si no aprobado:** _pendiente Dave_ (reintentar, quedarse en resultado, etc.) |

**Primera llegada:** al entrar por primera vez a una fila **Evaluación** (desde índice, **`Continuar`** global o **`Comenzar ahora`** en secuencia), la fase inicial es siempre **1 Bienvenida** — **no** se muestran las preguntas de golpe.

#### 6.8.2 Diagrama de flujo (fase × nav)

```
Índice: fila «Evaluación» ACTIVA (misma fila en las 3 fases)
        │
        ▼
┌───────────────┐
│ 1 BIENVENIDA  │  specs evaluación
└───────┬───────┘
        │ Continuar (nav derecha)
        ▼
┌───────────────┐
│ 2 EVALUACIÓN  │  preguntas / intento
└───────┬───────┘
        │ Continuar (nav derecha)
        ▼
┌───────────────┐
│ 3 RESULTADO   │  aprobado / no aprobado
└───────┬───────┘
        │ Continuar
        ├── resultado POSITIVO ──► siguiente ítem índice (Fin del contenido)
        └── resultado NEGATIVO ──► _pendiente Dave_
```

#### 6.8.3 Columna derecha durante evaluación

| Aspecto | Comportamiento |
|---------|----------------|
| Shell | Igual § 6.4 — `TituloProgresoYNav` + `IndiceExpEstudio` |
| Fila índice | **`Evaluación`** permanece **`Activa`** en fases 1–3 |
| Botones nav | **`Regresar`** + **`Continuar`** visibles en las tres fases (_comportamiento de Regresar por fase — pendiente Dave_) |
| **`Continuar`** fase **`evaluacion`** | **`disabled`** hasta que **todas** las preguntas del intento tengan respuesta (§ 6.8.4b). Habilitado → fase **3 Resultado** |
| **`Continuar`** otras fases | Bienvenida → fase 2; Resultado aprobado → siguiente ítem índice (§ 6.8.1) |
| **`Continuar`** (regla general) | Significado **depende de la fase** — no equivale a «siguiente página del curso» hasta fase 3 aprobada |
| Progreso % | La evaluación cuenta como página consumible completada **solo** tras **aprobado** en fase 3 (alinea § 8.3) |

#### 6.8.4 Contenido por fase

##### 6.8.4a Fase 1 — **Bienvenida** (copy cerrado)

**Referencia visual:** captura LXP jul 2026 → `exp-estudio/assets/eval-bienvenida-ref.png`

**Ubicación:** columna izquierda (703px), contenido **centrado** en card / bloque sobre fondo claro.

**Layout tipográfico:**

| Elemento | Estilo (referencia captura) |
|----------|----------------------------|
| Título principal | Grande, bold, `fg-1-high` / navy, centrado |
| Cuerpo | Párrafos centrados, `body/md/regular` |
| Números dinámicos | **Bold** inline (ej. cantidad de intentos) |
| Etiquetas spec | **Bold** inline (`Tiempo límite:`, `Importante:`) |
| Ícono tiempo | Emoji reloj de arena **⌛** antes de «Tiempo límite» |

**Copy exacto (plantilla — valores `{…}` vienen de config Creator / mock):**

```
Estás a punto de iniciar la evaluación

Antes de comenzar, ten en cuenta lo siguiente:

Tienes {N} intentos disponibles.

⌛ Tiempo límite: {M} minutos para completar la evaluación.

Importante: Una vez inicies la evaluación, cualquier salida, recarga o cierre de esta ventana contará como un intento.
```

**Ejemplo captura bienvenida:** `{N} = 5`. **Demo § 11.1 (alineado con widget «Intento 1 de 3»):** `{N} = 3`, `{M} = 30`.

| Línea | Tipo | Fuente mock / Creator |
|-------|------|------------------------|
| Título + intro | Fijo | Copy producto — no parametrizar |
| `Tienes {N} intentos disponibles.` | Dinámico | Config evaluación — **límite de intentos** (`maxAttempts` o equivalente en `evaluaciones-recurso.js`). Si intentos ilimitados en config → _pendiente copy alternativo_ |
| `⌛ Tiempo límite: {M} minutos…` | Dinámico | Config — **tiempo máximo** activado. Si **sin** límite de tiempo → **ocultar** esta línea |
| Párrafo **Importante** | Fijo | Copy producto — advertencia de intento consumido |

**Qué NO aparece en esta pantalla (captura actual):** nota mínima para aprobar, número de preguntas, aleatoriedad — no documentados en bienvenida hasta que producto los incluya en otra ronda.

**Nav columna derecha:** **`Regresar`** + **`Continuar`** (§ 6.8.3). **`Continuar`** → fase 2 **Evaluación** (inicia el intento; desde aquí aplica la regla del párrafo Importante).

##### 6.8.4b Fase 2 — **Evaluación** (copy y banco demo cerrados)

Al pulsar **`Continuar`** en Bienvenida, la columna izquierda pasa a la **UI de preguntas**. Arranca el **intento** (cuenta para la regla «Importante» § 6.8.4a) y el **cronómetro** si hay límite de tiempo.

**Referencia visual widget:** `exp-estudio/assets/eval-widget-timer-ref.png`

#### Barra sticky `EvalStickyBarExpEstudio`

| Aspecto | Detalle |
|---------|---------|
| **Posición** | **Sticky** — pegada **justo debajo del SubNav**, ancho del área de contenido (entre sidebar y borde derecho). Permanece visible al hacer scroll de preguntas |
| **Layout** | Fila horizontal: **izquierda** contador tiempo · **derecha** número de intento |
| **Cuándo** | Solo en fase **`evaluacion`** (oculta en Bienvenida y Resultado) |

**Lado izquierdo — tiempo restante**

| Parte | Copy / estilo |
|-------|---------------|
| Ícono | Reloj despertador outline (`far fa-alarm-clock` o equivalente captura) |
| Label | **`Tiempo restante:`** — bold, `fg-1-medium` |
| Valor | **`{MM}:{SS} minutos`** — bold; ejemplo captura: **`29:13 minutos`** |
| Color valor | **Verde** (mint/teal feedback success) mientras queden **> 1 minuto** |
| Color valor ≤ 1 min | Cambia a **rojo** (`feedback-accent-error`) cuando el tiempo restante es **≤ 1:00** |
| Origen | Countdown desde `timeLimitMinutes` de config al **iniciar** fase 2 |

**Lado derecho — intento**

| Copy plantilla | **`Intento {A} de {T}`** |
|----------------|---------------------------|
| Ejemplo captura | **`Intento 1 de 3`** |
| `{A}` | Intento actual (`evalIntentoActual`) |
| `{T}` | Máximo intentos (`maxAttempts` de config) |

**Debajo de la barra sticky:** listado de preguntas (scroll en columna izquierda).

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

##### 6.8.4c Fase 3 — **Resultado** (pendiente)

> _Pendiente Dave — copy aprobado / reprobado, nota, reintentos, `Continuar` si no aprueba._

**Referencia autor (resto de config Creator):** `contexto-creacion-contenido.md` — modal Configuración (% mínimo aprobar, orden aleatorio, nº preguntas por intento, etc.) — aplica en fases 2–3, no todos los campos se muestran en bienvenida § 6.8.4a.

#### 6.8.5 Estado en sesión (implementación)

Por cada página `tipo: 'evaluacion'` en el mock § 11.1:

```js
{
  evalFase: 'bienvenida' | 'evaluacion' | 'resultado',
  evalIntentoActual: 1,
  evalUltimoResultado: null | { aprobado: boolean, puntaje: number /* … */ }
}
```

Al cambiar de fila en el índice y volver, restaurar fase según reglas de persistencia § 8.1 (_pendiente_).

#### 6.8.6 Relación con cierre § 7

Solo tras **fase 3 + resultado positivo + `Continuar`**, el flujo avanza a **`Fin del contenido`** (pantalla felicitación + confeti § 7). No antes.

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
| 6.7 | Progreso en Recursos | Mismo `ProgresoExpEstudio` bajo botones nav |
| 6.8 | Header visor aparte | **No** — título curso va en columna derecha, no en chrome extra |
| 6.9 | Modo oscuro | Sigue `[data-theme="dark"]` del producto |
| 6.10 | Evaluación | Tres fases § 6.8; `learn-question` **solo `collab`**; **`Continuar` disabled** hasta responder todas |
| 6.11 | Render recursos | Reutilizar mounts Creator § 6.2; sin footers edición |

---

## 7. Bloque 3 — Cierre del contenido (`Fin del contenido`)

**Propósito:** felicitar al colaborador por **terminar** el contenido y ofrecer certificado + siguiente paso en el catálogo.

**Referencia visual:** captura LXP jul 2026 (no hay Figma). Dave sustituirá la **ilustración** por asset definitivo.

| Recurso | Ruta |
|---------|------|
| Captura referencia | `exp-estudio/assets/cierre-exp-estudio-ref.png` (copiar desde captura producto; placeholder hasta arte final) |

**Cuándo se muestra:** tras **evaluación aprobada** (§ 6.8 fase 3 + **`Continuar`**) → ítem **`Fin del contenido`** → pantalla de cierre (columna izquierda § 7.2; columna derecha nav + índice completado).

**Efecto al entrar:** **`launchUbitsConfetti()`** — mismo confeti del playground (`components/ubits-confetti.js`, usado en modo estudio IA, SCORM quiz, etc.). Pantalla completa, `pointer-events: none`, respeta `prefers-reduced-motion`.

### 7.1 Layout — misma estructura dos columnas (§ 6.1)

```
┌──────────────────────────────┬──────────────────────────────────┐
│  COLUMNA IZQUIERDA         │  COLUMNA DERECHA                 │
│  CierreExpEstudio          │  TituloProgresoYNav (Completed)  │
│  (felicitación)            │  + IndiceExpEstudio (Completado) │
└──────────────────────────────┴──────────────────────────────────┘
```

### 7.2 Columna izquierda — `CierreExpEstudio`

Card centrada sobre fondo `bg-2` / blanco según captura:

| Orden | Elemento | Copy / comportamiento |
|-------|----------|----------------------|
| 1 | **Ilustración** | Imagen celebración (high-five). **Placeholder** en v1 — Dave entrega PNG/SVG definitivo |
| 2 | Título | **`¡Felicidades!`** |
| 3 | Línea 1 | **`Has culminado con éxito el contenido:`** |
| 4 | Título contenido | **`“{Nombre del contenido}”`** — comillas tipográficas; `{Nombre}` = `titulo` del catálogo (`?id=`) |
| 5 | Mensaje | **`Tu dedicación es una inspiración. ¡Sigue construyendo tu camino hacia el conocimiento!`** |
| 6 | CTA | **`Descargar certificado`** — botón primario, ícono descarga; mock PDF (no obligatorio funcional en v1) |

**Copy exacto (bloque completo):**

```
¡Felicidades!
Has culminado con éxito el contenido:
“{Nombre del contenido}”
Tu dedicación es una inspiración. ¡Sigue construyendo tu camino hacia el conocimiento!
[ Descargar certificado ]
```

**Certificado:** visible si `conCertificacion === true` en catálogo; si no, ocultar botón o toast «no disponible» (alinear con § 5.6b).

### 7.3 Columna derecha — nav + progreso + índice completado

Mismo shell que Recursos (§ 6.4), variante **post-cierre**:

| Parte | Valor |
|-------|-------|
| Título curso | Nombre del contenido (igual Recursos) |
| **`Regresar`** | Secundario — vuelve a la **última página consumible** (evaluación) o a portada según implementación; captura LXP: página anterior del flujo |
| **`Ver más contenidos`** | Primario — **`../home-learn.html#buscar`** + focus `#home-learn-search-input` (§ 5.6b.1) |
| `ProgresoExpEstudio` | **`Completed`** — barra **verde**, **`100 %`** |
| `IndiceExpEstudio` | **`Completado`** — todas las filas ✓ verde; fila **`Fin del contenido`** en estado **`Activa`** (barra azul + check, según captura) |

> En **portada** completada (§ 5.6b) los dos CTAs (`Ver más contenidos` + `Descargar certificado`) viven en **`TituloSpecsCtaExpEstudio`**. En **cierre § 7**, el certificado va en la **columna izquierda** y `Ver más contenidos` en la **nav derecha**.

### 7.4 Confeti

| Aspecto | Detalle |
|---------|---------|
| Script | `../../components/ubits-confetti.js` en `exp-estudio.html` |
| API | `launchUbitsConfetti()` al montar vista cierre (primera llegada tras completar) |
| Referencias | `study-chat.js`, `scorm-recurso-modal.js`, `modo-estudio-ia.html` |
| Accesibilidad | Sin confeti si `prefers-reduced-motion: reduce` (ya en `ubits-confetti.js`) |

### 7.5 Relación portada completada (§ 5.6b)

| Vista | Cuándo | Columna izquierda | CTAs salida |
|-------|--------|-------------------|-------------|
| **Cierre § 7** | Tras `Continuar` en última consumible | Felicitación + certificado | Nav derecha: `Ver más contenidos` |
| **Portada § 5.6b** | Usuario vuelve a portada con curso ya terminado | Hero + ficha catálogo (sin cambio) | `Ver más contenidos` + `Descargar certificado` |

Ambas marcan el contenido como **100 %** en índice y progreso.

### 7.6 Preguntas cerradas (cierre)

| # | Pregunta | Respuesta |
|---|----------|-----------|
| 7.1 | ¿Pantalla aparte? | **Sí** — § 7, ítem `Fin del contenido` |
| 7.2 | Copy felicitación | § 7.2 — copy exacto arriba |
| 7.3 | Ilustración | Placeholder v1; asset definitivo pendiente Dave |
| 7.4 | CTAs | Izq: **`Descargar certificado`**. Der: **`Regresar`** + **`Ver más contenidos`** |
| 7.5 | Confeti | **Sí** — `launchUbitsConfetti()` |
| 7.6 | Volver a recursos | Índice con páginas completadas clicables (repaso) |

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
| Obligatoriedad | **Todas** las páginas consumibles (video, PDF, embebido, evaluación en demo) |
| **Evaluación** | Debe **aprobar** (fase 3 resultado positivo) para contar como página completada — § 6.8 |
| Ítem `Fin del contenido` | Pantalla de cierre § 7 — corona el 100 % |
| Complementarios | **No** cuentan para completado (§ 6.3) |

**§ 8.3b — Detalle por fase (Bienvenida / Evaluación / Resultado) y resultado negativo:**

> _Pendiente Dave — estructura de fases cerrada en § 6.8; copy y reglas de reintento en § 6.8.4._

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
| Índice learner | **Nuevo componente** (§ 4.3) | Inspirado en Creator, no es reutilización directa |
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

## 11. Inventario de archivos (pendiente de implementación)

| Archivo | Rol |
|---------|-----|
| `exp-estudio/contexto-exp-estudio.md` | Este documento |
| `exp-estudio/exp-estudio.html` | Página principal (layout estándar colaborador) |
| `exp-estudio/exp-estudio.js` | Lógica portada / recursos / cierre, estado de sesión |
| `exp-estudio/exp-estudio.css` | Estilos de página |
| `components/indice-exp-estudio.*` (desde Figma `IndiceExpEstudio`) | Índice lateral learner |
| `components/titulo-progreso-y-nav-exp-estudio.*` (`TituloProgresoYNav`) | Columna derecha vista Recursos § 6.4 |
| `components/cierre-exp-estudio.*` (`CierreExpEstudio`) | Columna izquierda pantalla cierre § 7 |
| `exp-estudio/assets/cierre-illustration.png` | Ilustración felicitación — **placeholder** hasta asset Dave |
| `../../components/ubits-confetti.js` | Confeti al entrar a cierre § 7.4 |
| Reutiliza preguntas | `components/learn-question.js` | **Solo** `mode: 'collab'` — § 6.8.4b; matching § 6.8.4b.2 |
| `components/eval-sticky-bar-exp-estudio.*` | Barra sticky timer + intento | § 6.8.4b |
| Reutiliza CSS/JS Creator | `crear-contenido.css`, `crear-contenido-pdf-viewer.js`, `vendor/pdfjs/` | Renders § 6.2 |
| `exp-estudio/bd-exp-estudio-demo.js` | Mock índice + páginas del curso demo (§ 3.3) |

**§ 11.1 — Mock estructura pedagógica (cerrado):**

Archivo `exp-estudio/bd-exp-estudio-demo.js` — objeto JS con secciones, páginas, `tipoRecurso`, títulos copy-exactos de § 3.3. `exp-estudio.js` lo carga junto al catálogo (`?id=`). No extender `bd-master/` hasta que el demo se oficialice en catálogo global.

```js
// Esquema orientativo
window.BD_EXP_ESTUDIO_DEMO = {
  contentId: null, // enlazar al id de catálogo cuando se defina § 3.1
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
        { id: 'p-2', titulo: 'Guía mapa de conflicto', tipo: 'pdf' }
      ]
    },
    {
      id: 'sec-2',
      titulo: 'Sección 2: Herramientas para resolver conflictos',
      paginas: [
        { id: 'p-3', titulo: 'Simulador de conversación difícil', tipo: 'embebido' },
        { id: 'p-4', titulo: 'Evaluación', tipo: 'evaluacion',
          evalConfig: {
            maxAttempts: 3,
            timeLimitMinutes: 30,
            timeLimitEnabled: true,
            minPassPercent: null /* § 8.3b / fase Resultado */
          },
          evalFase: 'bienvenida',
          evalIntentoActual: 1,
          preguntas: '/* array 10 ítems — copy § 6.8.4b.1 */'
        },
        { id: 'p-5', titulo: 'Fin del contenido', tipo: 'fin' }
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
- [x] 3.2 Misma estructura Portada → Recursos → Cierre
- [x] 4.1 Secciones con páginas
- [x] 4.2 Componente índice nuevo (learner)
- [x] 4.3 Barra de progreso global (sí)
- [x] 5.1–5.8 Portada sin iniciar (Figma UBITS + FIQSHA)
- [x] 10.2 Figma Learner v4 (nodes § 5.0)

- [x] 3.3 Índice curso demo (2 secciones, sin encuesta)
- [x] 6.1 Tipos recurso curso demo
- [x] 11.1 Mock `bd-exp-estudio-demo.js`

### Pendiente (Figma / siguiente ronda)
- [ ] 3.1 ID contenido en catálogo (`?id=`)
- [x] 5.6 Portada en progreso — delta columna derecha (Figma `40006338:44692`)
- [x] 5.6b Portada finalizada — delta columna derecha (Figma `40006350:2730`)
- [x] 7.1–7.6 Cierre — felicitación, confeti, captura LXP (§ 7)
- [x] 6.1–6.10 Recursos — vista consumo (Figma video `40006360:4608`, § 6)
- [x] 6.8 Evaluación — 3 fases (Bienvenida → Evaluación → Resultado)
- [x] 6.8.4b Evaluación — sticky bar + 10 preguntas demo
- [ ] 6.8.4c Resultado evaluación (Dave)
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
5. ~~Página cierre (`Fin del contenido`)~~ ✅ § 7.
6. ~~Evaluación — 3 fases en misma página~~ ✅ § 6.8 (detalle UI/copy por fase: siguiente ronda Dave).
7. Implementación vanilla: `exp-estudio.html` + componentes + eval consumo + confeti.

---

*Última actualización: jul 2026 — § 6.8.4b.2 matching collab (select + label pair.a).*
