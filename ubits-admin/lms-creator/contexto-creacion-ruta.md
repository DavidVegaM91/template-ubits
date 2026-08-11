# Contexto: creación de ruta de aprendizaje (LMS Creator)

Documento de referencia sobre el flujo **Crear ruta de aprendizaje** en el módulo LMS Creator. Una **ruta** es un tipo de contenido que **agrupa otros contenidos** (cursos, shorts, etc.); no tiene secciones, páginas ni recursos propios como un curso.

**Para quién es:** producto, diseño y negocio (lenguaje conceptual).  
**Referencias técnicas en Playground:** `crear-ruta.html`, `crear-ruta.js`, `crear-ruta-certificado.js`, `crear-ruta-publicacion.js`, `crear-ruta-contenidos-drawer.js`, `contexto-creacion-contenido.md` (portada y certificado/visibilidad de referencia), `crear-plan-contenidos.html` (patrón drawer de catálogo).

---

## Visión general

| Paso | Nombre        | Qué hace |
|------|---------------|----------|
| 1    | Portada       | Título, imagen/tráiler, descripción y ficha técnica **reducida** |
| 2    | Contenidos    | Añadir y ordenar contenidos hijos de la ruta |
| 3    | Certificado   | Switch, plantillas mock Fiqsha, preview orientativa, empty state |
| 4    | Visibilidad   | 4 estados (Borrador, Público, Privado, Oculto); modales y drawer Privado |

**4 pasos** en el stepper lateral (misma estructura inmersiva que `crear-contenido.html`).

---

## Entrada desde Contenidos

- El botón principal de la lista deja de ser solo «Crear contenido» con icono `+` a la izquierda.
- Pasa a ser un **botón primario con chevron a la derecha** (`angle-down`) que abre un **menú desplegable** (dropdown UBITS):
  - **Crear contenido** → `crear-contenido.html`
  - **Crear ruta de aprendizaje** → `crear-ruta.html`
- Patrón documentado en `header-product.js` (botón primario + `dropdown-menu.js`).

---

## Paso 1 — Portada

Igual que **crear contenido**, salvo la ficha técnica:

| Campo | En ruta |
|-------|---------|
| Título | Sí |
| Imagen / tráiler (modal Añadir portada, IA, subir, tráiler) | Sí |
| Descripción (editor enriquecido) | Sí |
| Tipo de contenido | **No** (solo existe un tipo: ruta; no se muestra) |
| Nivel | Sí |
| Idioma | Sí |
| Tiempo aproximado / unidad | **No** (el tiempo lo calcula el sistema sumando los contenidos incluidos) |
| Categoría | Sí |

### Imagen de portada y tráiler (mismo componente y modal que crear contenido)

La miniatura usa el componente **`learn-content-img-trailer`** en `crear-ruta.html` (`#crear-ruta-img-trailer`). La imagen es **obligatoria** para avanzar; el **tráiler es opcional**.

**Hueco sin imagen (vacío oficial):** layout **vacío con IA** — icono, título (*Agrega una portada*), descripción breve y un solo **CTA primario** **«Agregar portada»** (ia-button). **No** hay variante vacía con dos botones («Generar portada con IA» + «Cargar imagen») ni atajos a panel de IA o modal de generación aparte; el único camino desde el hueco es abrir el modal unificado.

**Al pulsar «Agregar portada»** (o **«Editar»** cuando ya hay imagen) se abre el mismo modal **`portada-imagen-modal`** («Añadir portada») que en crear contenido, con tres pestañas: **Portada con IA**, **Subir portada** y **Tráiler (opcional)**. Detalle de pestañas, tokens, retoque con contexto guardado y reproducción del tráiler en la miniatura: ver **`contexto-creacion-contenido.md`** → *Imagen de portada y tráiler: modal «Añadir portada»*.

**Con imagen confirmada:** la cabecera muestra la foto; si vino de IA, puede verse la etiqueta **«Generado con IA»**; con tráiler, botón de play sobre la miniatura.

**Regla para avanzar:** mismos obligatorios que portada de contenido, **sin** tipo ni tiempo.

---

## Paso 2 — Contenidos

No hay índice, secciones ni recursos.

### Estado vacío

- Empty state que invita a **añadir el primer contenido**.
- CTA principal abre el **drawer «Añadir contenidos»**.

### Drawer «Añadir contenidos»

Patrón alineado con **Agregar asignación** / paso de contenidos en `crear-plan-contenidos.html`:

- Buscador (`createInput` tipo `search`).
- Filtro opcional por origen (catálogo UBITS / catálogo propio), mismo catálogo `CATALOGO_CURSOS_DRAWER`.
- **Exclusión:** no se listan contenidos de tipo **Ruta de aprendizaje** (una ruta no puede contener otra ruta).
- Selección **múltiple** en grid de **card content compact** (clic en card = toggle selección).
- Footer del drawer: **Cancelar** y **Agregar** (primario; deshabilitado si no hay selección).

Al confirmar **Agregar**: se cierra el drawer y los ítems aparecen en la página del paso 2.

### Lista con contenidos agregados

- Cada ítem se muestra con **card content compact** en modo **fila de lista** (`listRow`):
  - **Menú ⋮** junto al título: **Mover arriba**, **Mover abajo**, **Eliminar**.
  - **Arrastrar y soltar** (asa de arrastre + reorden en DOM), como páginas del índice o preguntas de evaluación.
- Botón secundario **«Añadir contenidos»** visible cuando ya hay al menos uno (reabre el mismo drawer para sumar más).
- El menú ⋮ **no** aparece en las cards del drawer (solo en la lista del paso).

**Regla para avanzar al paso 3:** al menos **un contenido** en la ruta.

---

## Paso 3 — Certificado

**Archivos:** `crear-ruta-certificado.js`, `crear-contenido-certificado.css` (clases `certificado-paso__*` compartidas con crear contenido).

**Propósito:** activar o no un certificado para la ruta, elegir **plantilla** (mock Fiqsha) y ver **vista previa orientativa** con datos de la portada y duración estimada.

**Layout:** dos columnas — panel izquierdo (~400px) + preview derecha. En móvil (≤1023px) se apilan.

| Control | Comportamiento |
|---------|----------------|
| **Switch** «Habilitar certificado para esta ruta» | **ON por defecto.** OFF → oculta select y hint; empty state en preview. ON → restaura preview. |
| **Select** plantilla | Solo con switch ON. 3 plantillas mock Fiqsha; default «Cursos empresariales con doble firma». |
| **Vista previa orientativa** | Proporción 774×598; logo, firmas y textos según plantilla. |

#### Datos de la preview (ruta)

- **Título** — textarea de portada (`#crear-ruta-titulo`).
- **Categoría** — nombre legible Fiqsha desde ficha técnica.
- **Duración** — suma de minutos de los contenidos agregados (campo `duration` de cada card); si no hay datos, **30 minutos** por defecto. La ruta **no** tiene tiempo manual en portada.

Texto de preview adaptado a ruta: «Finalizó satisfactoriamente **la ruta:**» y pie «finalización de **esta ruta**».

#### Empty state (certificado deshabilitado)

| Elemento | Contenido |
|----------|-----------|
| **Título** | «No has habilitado un certificado» |
| **Descripción** | «Si deseas, puedes activar un certificado para esta ruta.» |

#### Plantillas mock

Mismas 3 plantillas que crear contenido (doble firma, estándar Fiqsha, onboarding). Ver `contexto-creacion-contenido.md` — Paso 3.

**Hash URL:** `#certificado`.

**Regla para avanzar al paso 4:** ninguna validación adicional en el prototipo.

---

## URLs por paso (hash)

| Paso | Hash canónico | Alias |
|------|---------------|-------|
| 1 Portada | `#portada` | — |
| 2 Contenidos | `#contenidos` | — |
| 3 Certificado | `#certificado` | — |
| 4 Visibilidad | `#visibilidad` | `#publicacion` (se normaliza a `#visibilidad`) |

Al cambiar de paso con el stepper o los botones Anterior/Siguiente, la URL se actualiza con `history.replaceState` (mismo patrón que `crear-contenido.html`).

---

## Deep link demo (prototipo)

Si abres la página **sin borrador previo** y el hash apunta a un paso posterior, se rellenan automáticamente los pasos anteriores con una **ruta demo de liderazgo**:

| Hash de entrada | Paso visible | Pasos previos rellenados |
|-----------------|--------------|---------------------------|
| `#portada` o vacío | Portada | Ninguno (formulario vacío) |
| `#contenidos` | Contenidos | Solo portada |
| `#certificado` | Certificado | Portada + 5 contenidos |
| `#visibilidad` / `#publicacion` | Visibilidad | Portada + contenidos + certificado (defaults) |

**Demo portada:** título «Ruta de liderazgo para equipos de alto rendimiento», imagen IA, categoría Fiqsha «Comunicación para líderes», nivel Intermedio.

**Demo contenidos (5 cursos, en orden):**

1. `u014` — Cómo ejercer el liderazgo inclusivo  
2. `u009` — Cambio en el estilo de liderazgo  
3. `u040` — Emplea los valores del liderazgo femenino  
4. `u063` — Liderazgo en planeación estrategica  
5. `u069` — Potencia tu liderazgo en entornos vuca  

La semilla solo corre **una vez** al cargar (`window._crDemoSeeded`); cambiar el hash después no vuelve a rellenar.

---

## Paso 4 — Visibilidad

**Archivos:** `crear-ruta-publicacion.js`, `crear-contenido-publicacion.css` (clases `publicacion-paso__*`).

**Propósito:** configurar visibilidad de la ruta (Borrador, Público, Privado, Oculto).

**Layout:** intro + cuadrícula 2×2 de `ubits-selection-card` + radios.

**Texto introductorio:** «Configura la visibilidad que tendrá **la ruta** al publicarla…»

#### Estados

| Estado | Comportamiento |
|--------|----------------|
| **Borrador** *(default)* | Aplicación inmediata; tag header `#crear-ruta-visibilidad-header-tag`. |
| **Público** / **Privado** | Modal «Publicar ruta» → confirmar aplica estado. |
| **Oculto** | Modal «Ocultar ruta» → confirmar aplica estado. |

**Privado:** tras confirmar, botón **«Seleccionar colaboradores»** abre drawer con `createUbitsDataTable` (mismo patrón que crear contenido; datos `TAREAS_PLANES_DB.getEmpleadosEjemplo()`). Requiere en `crear-ruta.html`: **`bd-master-colaboradores.js`** + **`bd-tareas-y-planes.js`**, y CSS **`table.css`**, **`checkbox.css`**, **`ubits-data-table.css`**, **`avatar.css`**, **`drawer.css`**, **`chip.css`** (filtros aplicados).

Limitaciones post-publicación en copy de las tarjetas: **orden de contenidos o reemplazar contenidos** (no secciones/páginas como en curso).

**Hash URL:** `#visibilidad` (alias `#publicacion`).

**Siguiente** en Visibilidad: botón **Publicar** → redirige a `contenidos.html` con card anclada (`id` `24004`), imagen `portadas-ia/01-personas-en-oficina.jpg` y tag según la visibilidad elegida (Borrador, Público, Privado u Oculto). Toast: «Ruta creada exitosamente».

---

## Componente Card content compact (extensión)

Para el listado del paso 2:

- Opciones en `cardData`: `listRow`, `contentId`, `showActionsMenu`, `draggable`.
- API de inicialización: `initCardContentCompactList(container, options)` — menús, DnD y evento `ubits-card-content-compact-list-action` (`mover-arriba` | `mover-abajo` | `eliminar`).

El drawer de selección sigue usando `loadCardContentCompact` **sin** menú ni asa de arrastre (mismo layout compact por defecto). La lista del paso Contenidos usa `listRow` + menú/arrastre y ancho máximo **600px**.

---

## Datos mock

- Catálogo: `catalogo-contenidos-drawer.js` → `CATALOGO_CURSOS_DRAWER` con `refreshCatalogoContenidosDrawer({ excludeRutas: true })` en el flujo ruta.
- Estado de la ruta en sesión: array `rutaContenidosItems` en `crear-ruta.js` (prototipo; sin API).

---

## Archivos del flujo

| Archivo | Rol |
|---------|-----|
| `crear-ruta.html` | Shell inmersivo + 4 pasos |
| `crear-ruta.css` | Estilos paso Contenidos, lista y drawer catálogo |
| `crear-ruta.js` | Stepper, portada, validaciones, lista, navegación, hashes URL y demo deep link |
| `crear-ruta-certificado.js` | Paso Certificado (plantillas, preview) |
| `crear-ruta-publicacion.js` | Paso Visibilidad (radios, modales, drawer Privado) |
| `crear-ruta-contenidos-drawer.js` | Drawer catálogo y selección múltiple |
| `crear-contenido-certificado.css` | Layout y preview certificado (compartido) |
| `crear-contenido-publicacion.css` | Layout tarjetas Visibilidad y drawer colaboradores (`.page-crear-ruta` + `.page-crear-contenido`) |
| `contenidos-crear-menu.js` | Menú Crear contenido / Crear ruta en lista |
| `contexto-creacion-ruta.md` | Este documento |

---

## Migración a React (`Ubits-React`)

Misma regla que en **`contexto-creacion-contenido.md` → Migración a React**: al portar `crear-ruta` al playground React, **solo lo vigente en vanilla**.

- **Portada:** `#crear-ruta-img-trailer` con vacío IA + CTA → **`portada-imagen-modal`** (igual que crear contenido). Sin vacío de dos botones, sin `#portada-ai-modal` ni panel IA standalone de portada.
- **Componente:** `UbitsLearnContentImgTrailer` del catálogo React; sin `emptyVariant` ni flujos paralelos eliminados del referente.
- **Fuente de verdad:** `crear-ruta.html` / `crear-ruta.js` actuales + sección *Imagen de portada y tráiler* de este documento y del contexto de crear contenido.

---

## Diferencias clave vs crear contenido

| Aspecto | Crear contenido | Crear ruta |
|---------|-----------------|------------|
| Paso 2 | Recursos (índice, páginas, recursos) | Contenidos (catálogo + lista ordenable) |
| Ficha técnica | Tipo, nivel, idioma, tiempo, categoría | Nivel, idioma, categoría |
| Tiempo | Manual | Calculado por el sistema |
| Agrupa otros contenidos | No | Sí |

---

*Última actualización: **Portada** documentada (vacío IA + modal único); sección **Migración a React**. Hashes URL por paso y deep link demo progresivo (ruta de liderazgo); pasos Certificado y Visibilidad implementados.*
