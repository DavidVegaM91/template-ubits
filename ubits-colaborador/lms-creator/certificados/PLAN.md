# Plan de implementación — Certificados (LMS Creator)

## Objetivo

Llevar el flujo de **Descarga de certificados** del Figma Creator v3 a Playground con look and feel UBITS, manteniendo la navegación integral de LMS Creator y deep links por hash para demos y QA (mismo patrón que `crear-contenido.html`).

**Figma de referencia:** [Creator v3 — Descarga](https://www.figma.com/design/NxOcUG8QAVc44KYTQexH0b/%F0%9F%9F%A2-Creator-v3?node-id=40008313-8362&m=dev) (sección `Descarga`: Global, Por contenido, Por colaborador).

---

## Alcance funcional

- Una sola página `certificados.html` con **3 modos de descarga** (no son pestañas del SubNav; viven dentro de la pestaña **Descarga**).
- Flujo completo: selección de modo → formulario → validación → confirmación o sin resultados → correo con `.zip`.
- Estados fuera del happy path accesibles por **hash URL** (validación, error, modales).
- **3 plantillas HTML de correo** en carpeta `mails/` (referencia: `ubits-colaborador/tareas/mails/`).

---

## Estructura de archivos

```
ubits-colaborador/lms-creator/certificados/
├── certificados.html          ← flujo principal (layout 1 LMS Creator)
├── certificados.css           ← estilos de página (cards, formulario, responsive)
├── certificados.js            ← tabs por hash, formularios, validación, modales, mocks
├── PLAN.md                    ← este documento
└── mails/
    ├── README.md              ← placeholders, imágenes, cómo previsualizar
    ├── mail-certificados-global.html
    ├── mail-certificados-contenido.html
    ├── mail-certificados-colaborador.html
    └── images/                ← ilustraciones extraídas del Figma (una por tipo de mail)
        ├── certificados-global.png
        ├── certificados-contenido.png
        └── certificados-colaborador.png
```

---

## Shell de página (sin `header-product`)

El Figma **no** incluye `header-product`. La cáscara es:

- `loadSidebar('creator', 'certificados')`
- `loadSubNav(..., 'creator-certificados')` → pestañas **Descarga** (activa) / **Configuración**
- `loadTabBar` + `loadFloatingMenu` variante `creator`
- Contenido en `content-sections` → `section-single` > `widget--transparent` (sin caja bg-1; equivalente a `<Widget transparent>` en React) con selection cards sueltas + formulario en `.certificados-form-card` (única caja blanca)

---

## Selector de modo: `selection-card` (obligatorio)

Las **3 opciones de descarga** usan el componente oficial **`ubits-selection-card`** + `radio-button` (no cards custom ni HTML inventado).

**Imports:** `selection-card.css`, `radio-button.css`, `button.css`.

**Grupo:** `ubits-selection-card-group ubits-selection-card-group--3` (3 columnas desktop; apilar en móvil según doc del componente).

| Modo | Icono FA | Título | Descripción |
|------|----------|--------|-------------|
| **Global** | `far fa-rectangle-history` | Descarga global | Todos los certificados emitidos dentro del rango de fechas seleccionado. |
| **Por contenido** | `far fa-book-open` | Descarga por contenido | Todos los certificados emitidos para el contenido seleccionado dentro de un rango de fechas. |
| **Por colaborador** | `far fa-user` | Descarga por colaborador | Todos los certificados emitidos para el colaborador seleccionado dentro de un rango de fechas. |

Al cambiar de card, se muestra el panel de formulario correspondiente (mismo patrón exclusivo que radios en `crear-ruta.html` / `crear-contenido.html`).

---

## Formularios por modo

**Campos comunes (los 3):**

- Fecha inicial / Fecha final (`createInput` + date picker o máscara `dd / mm / aaaa`, icono calendario)
- Correo de destino / Confirmar correo
- Toggle **Incluir usuarios inactivos**
- Botón primario **Solicitar certificados** (deshabilitado hasta formulario válido)

**Campos extra:**

| Modo | Campo adicional |
|------|-----------------|
| Global | — |
| Por contenido | **Buscar contenido** (`createInput` type search; mock desde `bd-master`) |
| Por colaborador | **Buscar colaborador** (search/combobox; mock `bd-master-colaboradores`) + **Tipo de contenidos** (`createInput` type `select` + `dropdown-menu.js` antes de `input.js`) |

**Imports según campos:** `input.css`, `input.js`, `dropdown-menu.css`, `dropdown-menu.js`, toggle si existe componente o patrón ya usado en LMS Creator.

---

## Modales

Usar **`modal` UBITS** (`modal.css`, `modal.js` — `openModal` / `closeModal`).

### Confirmación (hay certificados)

- **Título:** `Revisa y confirma tu solicitud`
- Cuerpo con iconos FA: certificados encontrados, rango de fechas, enviar a, tiempo de entrega (~[XX] min), nota importante (enlace válido 2 días).
- Footer: botón primario **Entendido** → cierra modal + `showToast` de éxito (opcional según Figma).

### Sin resultados

- **Título:** `No se encontraron certificados`
- Cuerpo contextual según modo (fechas; en contenido/colaborador incluir nombre del filtro).
- Bloque «¿Por qué puede estar pasando esto?» + explicación.
- Footer: **Entendido**

### Validación / error (fuera del happy path)

- Errores de campo: estado `invalid` en `createInput` + helper text (no modal salvo error global).
- Hash dedicado para demo de error de sistema o validación global si aplica (ver tabla de hashes).

---

## Deep links por hash (patrón `crear-contenido.html`)

Cada pantalla o estado del flujo tiene un **hash canónico** en `certificados.html`. En `certificados.js`:

1. Constantes `HASH_*` (como `HASH_PAGE_CERTIFICADO` en `crear-contenido.js`).
2. `applyCertificadosHash()` en `DOMContentLoaded` + listener `hashchange`.
3. Al cambiar modo/estado desde UI, actualizar `history.replaceState` o `pushState` sin recargar.
4. Modales demo: abrir automáticamente si el hash lo indica (igual que `#promo-modal` en crear contenido).

### Tabla de hashes

| Hash | Qué muestra |
|------|-------------|
| `#global` | Modo global — formulario vacío (default si hash vacío) |
| `#global-filled` | Modo global — formulario con datos de ejemplo |
| `#global-confirmacion` | Modo global — modal **Revisa y confirma tu solicitud** |
| `#global-sin-resultados` | Modo global — modal sin resultados |
| `#global-validacion` | Modo global — errores de validación en campos |
| `#global-error` | Modo global — error fuera del happy path (ej. fallo mock al solicitar) |
| `#contenido` | Modo por contenido — formulario vacío |
| `#contenido-filled` | Modo por contenido — formulario con datos |
| `#contenido-confirmacion` | Modal confirmación (contexto contenido) |
| `#contenido-sin-resultados` | Modal sin resultados (contexto contenido) |
| `#contenido-validacion` | Validación |
| `#contenido-error` | Error |
| `#colaborador` | Modo por colaborador — formulario vacío |
| `#colaborador-filled` | Modo por colaborador — formulario con datos |
| `#colaborador-confirmacion` | Modal confirmación (contexto colaborador) |
| `#colaborador-sin-resultados` | Modal sin resultados (contexto colaborador) |
| `#colaborador-validacion` | Validación |
| `#colaborador-error` | Error |

**Ejemplos de URL para demos:**

- `certificados.html#global-confirmacion`
- `certificados.html#contenido-sin-resultados`
- `certificados.html#colaborador-error`

---

## Correos (`mails/`)

### Referencia principal

Duplicar la estructura y convenciones de **`ubits-colaborador/tareas/mails/`**:

- Tablas + estilos inline para compatibilidad Gmail/Outlook.
- Ancho máximo 600px, borde superior brand `#0c5bef`.
- Ilustración hero en `images/` (ruta relativa desde cada `.html`).
- Comentario HTML con placeholders `{{...}}` para backend.
- `README.md` con tabla de placeholders y cómo previsualizar.

**Plantilla base a copiar:** `tareas/mails/mail-recordatorio-pre-vencimiento.html` (adaptar copy y CTA).

### Tres archivos

| Archivo | Uso |
|---------|-----|
| `mail-certificados-global.html` | Correo tras solicitud descarga global (.zip con todos los certificados del periodo) |
| `mail-certificados-contenido.html` | Correo tras solicitud por contenido |
| `mail-certificados-colaborador.html` | Correo tras solicitud por colaborador |

### Imágenes (Figma → `mails/images/`)

Extraer del Figma las ilustraciones de las plantillas **Plantilla email certificados - global / por contenido / por colaborador** (frames en la sección Descarga) y guardarlas como:

- `certificados-global.png`
- `certificados-contenido.png`
- `certificados-colaborador.png`

Herramienta: MCP Figma `download_assets` o export desde los nodos de plantilla email. **No** usar placeholders genéricos si el asset existe en Figma.

### Placeholders sugeridos (mail)

| Placeholder | Descripción |
|-------------|-------------|
| `{{nombre_destinatario}}` | Quien recibe el correo |
| `{{cantidad_certificados}}` | Número de certificados en el .zip |
| `{{rango_fechas}}` | Texto legible del periodo |
| `{{nombre_contenido}}` | Solo mail por contenido |
| `{{nombre_colaborador}}` | Solo mail por colaborador |
| `{{url_descarga}}` | Enlace al .zip (válido 2 días) |
| `{{url_plataforma}}` | URL base UBITS |

---

## Copy base

- Transversal: «Al finalizar el proceso, recibirás en tu correo un archivo .zip con los certificados.»
- Modal confirmación — nota: «El enlace de descarga estará disponible por 2 días. Después de ese tiempo, deberás volver a generar la solicitud desde esta plataforma.»
- Sin resultados (global): «Nadie ha finalizado contenidos en ese periodo.» (variantes por modo en modales de contenido/colaborador).

---

## Componentes UBITS (resumen)

| Pieza | Componente |
|-------|------------|
| 3 modos | `ubits-selection-card` + `ubits-radio` |
| Fechas, email, search, select | `createInput()` |
| Toggle inactivos | switch UBITS (mismo patrón que en Creator si existe) |
| CTA formulario | `ubits-button--primary` |
| Confirmación / sin resultados | `modal` UBITS |
| Éxito post-confirmación | `showToast()` |
| Navegación | `sidebar`, `sub-nav`, `tab-bar`, `floating-menu` |

**Tokens:** solo `var(--ubits-*)`. Sin colores hardcodeados en CSS de página (los mails pueden usar hex inline como en tareas, alineados a brand).

---

## Plan de ejecución

1. Actualizar `certificados.html`: quitar `header-product`; markup selection-card ×3 + 3 paneles de formulario + mounts de modal.
2. `certificados.css`: layout cards, formulario, responsive (referencia Figma + `selection-card.css`).
3. `certificados.js`: hashes, cambio de modo, validación, mocks BD, apertura de modales por hash.
4. Crear `mails/`: copiar plantilla tareas, extraer 3 imágenes Figma → `mails/images/`, adaptar 3 HTML + `README.md`.
5. QA: navegación LMS Creator, todos los hashes de la tabla, validador UBITS, contraste light/dark donde aplique.

---

## Criterios de aceptación

- [ ] Las 3 opciones usan **`selection-card`** oficial (no cards custom).
- [ ] Modal confirmación con título exacto: **Revisa y confirma tu solicitud**.
- [ ] Cada estado/pantalla accesible por **hash** (tabla anterior).
- [ ] Sin `header-product` en Descarga (alineado Figma).
- [ ] `mails/` con 3 HTML + `images/` desde Figma + `README.md` estilo tareas.
- [ ] Navegación creator completa (sidebar, sub-nav Descarga activo, tab-bar, floating menu).
- [ ] Solo componentes y tokens UBITS; mocks desde `bd-master` donde aplique.
- [ ] Flujo happy path + sin resultados + validación/error demostrables por URL.
