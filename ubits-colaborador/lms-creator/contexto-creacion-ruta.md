# Contexto: creación de ruta de aprendizaje (LMS Creator)

Documento de referencia sobre el flujo **Crear ruta de aprendizaje** en el módulo LMS Creator. Una **ruta** es un tipo de contenido que **agrupa otros contenidos** (cursos, shorts, etc.); no tiene secciones, páginas ni recursos propios como un curso.

**Para quién es:** producto, diseño y negocio (lenguaje conceptual).  
**Referencias técnicas en Playground:** `crear-ruta.html`, `crear-ruta.js`, `crear-ruta-contenidos-drawer.js`, `contexto-creacion-contenido.md` (portada compartida), `crear-plan-contenidos.html` (patrón drawer de catálogo).

---

## Visión general

| Paso | Nombre        | Qué hace |
|------|---------------|----------|
| 1    | Portada       | Título, imagen/tráiler, descripción y ficha técnica **reducida** |
| 2    | Contenidos    | Añadir y ordenar contenidos hijos de la ruta |
| 3    | Certificado   | Misma lógica de flujo que crear contenido (navegable; detalle UI alineado al asistente general) |
| 4    | Publicación   | Misma lógica de flujo que crear contenido |

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

## Pasos 3 y 4 — Certificado y Publicación

Misma **navegación y expectativa de producto** que el asistente de crear contenido: el usuario puede recorrer los cuatro pasos; certificado y publicación siguen el roadmap del flujo general (en el prototipo, mismas reglas de avance y mensajes que en crear contenido cuando el detalle UI aún no está completo).

---

## Componente Card content compact (extensión)

Para el listado del paso 2:

- Opciones en `cardData`: `listRow`, `contentId`, `showActionsMenu`, `draggable`.
- API de inicialización: `initCardContentCompactList(container, options)` — menús, DnD y evento `ubits-card-content-compact-list-action` (`mover-arriba` | `mover-abajo` | `eliminar`).

El drawer de selección sigue usando `loadCardContentCompact` **sin** menú ni asa de arrastre.

---

## Datos mock

- Catálogo: `catalogo-contenidos-drawer.js` → `CATALOGO_CURSOS_DRAWER` con `refreshCatalogoContenidosDrawer({ excludeRutas: true })` en el flujo ruta.
- Estado de la ruta en sesión: array `rutaContenidosAgregados` en `crear-ruta.js` (prototipo; sin API).

---

## Archivos del flujo

| Archivo | Rol |
|---------|-----|
| `crear-ruta.html` | Shell inmersivo + 4 pasos |
| `crear-ruta.css` | Estilos paso Contenidos, lista, drawer |
| `crear-ruta.js` | Stepper, portada, validaciones, lista |
| `crear-ruta-contenidos-drawer.js` | Drawer catálogo y selección múltiple |
| `contenidos-crear-menu.js` | Menú Crear contenido / Crear ruta en lista |
| `contexto-creacion-ruta.md` | Este documento |

---

## Diferencias clave vs crear contenido

| Aspecto | Crear contenido | Crear ruta |
|---------|-----------------|------------|
| Paso 2 | Recursos (índice, páginas, recursos) | Contenidos (catálogo + lista ordenable) |
| Ficha técnica | Tipo, nivel, idioma, tiempo, categoría | Nivel, idioma, categoría |
| Tiempo | Manual | Calculado por el sistema |
| Agrupa otros contenidos | No | Sí |

---

*Última actualización: alineado con implementación Playground `crear-ruta.html`.*
