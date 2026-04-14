# Contexto: creación de contenido (LMS Creator)

Documento de referencia para implementar el flujo de **creación de contenido** en el módulo LMS Creator. Aquí **“contenido”** designa los **formatos de aprendizaje** (curso, short, artículo, etc.), no un archivo suelto.

**Objetivo de este archivo:** que, al leerlo, no queden dudas sobre el proceso de negocio y de pantalla al construir cada vista. Se irá ampliando con mensajes posteriores.

---

## Referencias de diseño

Los bocetos en herramienta de diseño fueron **exploratorios**; la fuente de verdad para implementación es **este documento**, la **documentación UBITS** de cada componente y lo acordado con **producto**. No se enlazan archivos externos de diseño para evitar roturas cuando se publique un diseño consolidado.

- **Creator v3 (prototipo):** flujo del asistente (portada, paso Recursos en drawer, etc.).  
- **Paso 2 Recursos (vacío):** índice + empty state del panel derecho cuando aún no hay páginas.  
- **Paso 2 — página recién añadida:** panel derecho con **título editable** arriba y **Resources block** debajo.  
- **Índice Creator:** panel izquierdo del paso Recursos (interruptor de secciones, listado, «Añadir sección»). Implementación: `components/indice-creator.css` + `indice-creator.js`, doc `documentacion/componentes/indice-creator.html`.  
- **Resources card** (selector de tipo de recurso): `components/resources-card.css` + `resources-card.js`, doc `documentacion/componentes/resources-card.html`.  
- **Resources block** (panel del recurso): `resources-block.css` + `resources-block.js` (requiere `resources-card`, `button`, `input`, `dropdown-menu`; tras `innerHTML` con `resourcesBlockHtml` llamar `initResourcesBlockFields(contenedor)`). Variante `default-error`: mismo selector que `default` con borde de error cuando la página quedó sin recurso al avanzar de paso. Doc `documentacion/componentes/resources-block.html`.  
- **Criterio:** layout, estados y jerarquía alineados al sistema UBITS y a las reglas aquí descritas; en discrepancia puntual, prioriza **negocio + producto** y la doc del componente.

---

## Fuentes de datos maestros (BD playground)

| Campo en la ficha técnica | Archivo en `bd-master/` |
|---------------------------|-------------------------|
| Tipo de contenido | `bd-master-tipos-contenido.js` |
| Nivel | `bd-master-niveles-contenido.js` |
| Categoría | `bd-master-categorias-fiqsha.js` |

Los selects del paso Portada deben alimentarse de estos catálogos (o de la API equivalente en un entorno real).

---

## Visión general del flujo

El asistente de creación tiene **4 pasos**, en este orden:

| Paso | Nombre | Estado en esta documentación |
|------|--------|------------------------------|
| 1 | Portada | Descrito en detalle |
| 2 | Recursos | Descrito en detalle (parcial: complementarios ampliados en mensajes futuros) |
| 3 | Certificado | Solo nombre de paso; detalle pendiente |
| 4 | Publicación | Solo nombre de paso; detalle pendiente |

### URL y cierre (playground `contenidos.html`)

- El flujo vive en el **drawer a pantalla completa** de la lista de contenidos; **cerrar el drawer** (cualquier paso) deja la URL en **`contenidos.html` sin hash** de creación (vuelta a la lista).
- **Hashes solo prototipo / compartir vista:**
  - `#crear-contenido` — abre el drawer en **paso 1 (Portada)**.
  - `#crear-contenido-recursos` — abre el drawer en **paso 2 (Recursos)** con índice creator + empty state (útil para diseño sin rellenar portada).
  - `#crear-contenido-step-recursos` — **mismo efecto** que `#crear-contenido-recursos` (alias por nombre de paso); al avanzar con «Siguiente» la URL pasa al hash canónico `#crear-contenido-recursos`.
- En producto real, validar que solo se permita el paso 2 si la portada cumple reglas de negocio (en el template, el stepper exige portada completa para ir a Recursos salvo entrada directa por URL de prototipo).

### Página dedicada (`crear-contenido.html`)

Además del flujo en **drawer** desde `contenidos.html`, existe una **página HTML propia** que replica el **cuerpo** del mismo flujo (misma estructura de pasos, portada, recursos, etc.) sin usar `openDrawer`. Plan de trabajo: `crear-contenido-plan.md`. Archivos: `crear-contenido.html`, `crear-contenido.css`, `crear-contenido.js`. La experiencia en drawer **sigue siendo la referencia** hasta un corte acordado con producto; no se elimina el drawer desde lista sin decisión explícita.

**Layout (footer siempre visible):** en `general-styles/styles.css`, `body` lleva `overflow-y: auto !important`, lo que hace que **todo el documento** haga scroll y el **footer** del shell quede **al final del contenido** (hay que bajar para verlo). En `crear-contenido.css` la página usa `body.page-crear-contenido` con **alto fijo al viewport** (`100vh` / `100dvh`) y **`overflow: hidden !important`** para anular ese comportamiento. El **scroll** del contenido queda en la **columna central** (`.crear-contenido-editor__main`, reglas en `contenidos.css`), igual que dentro del drawer — no en el `main` del shell ni en el `body`.

**Footer — paso 1 (Portada):** no debe mostrarse el botón **Anterior** (no aplica “paso previo”). Mismo criterio que el drawer: botón `#crear-contenido-btn-anterior` con **`display: none`** y **`aria-hidden="true"`** mientras se está en Portada; **`#crear-contenido-btn-siguiente`** para **Siguiente**. Cuando la lógica de cambio de paso viva en `crear-contenido.js`, mostrar **Anterior** al pasar a pasos posteriores, alineado a `crear-contenido-drawer.js`.

**Enlaces directos al paso 2 (Recursos):**

| Entorno | URL (ruta relativa desde `lms-creator/`) |
|---------|------------------------------------------|
| Lista + drawer | `contenidos.html#crear-contenido-recursos` o `contenidos.html#crear-contenido-step-recursos` (alias) |
| Página dedicada | **`crear-contenido.html#recursos`** (canónico). Siguen admitiéndose como alias los hashes largos del drawer; la URL se normaliza a `#recursos`. |

**Paso 1 (Portada) en la página dedicada:** `crear-contenido.html#portada` o sin hash. El hash antiguo `#crear-contenido` se reconoce y se normaliza a `#portada`. El cableado vive en `crear-contenido.js` (sin overlay).

### Implementación en página dedicada (assets, QA y z-index)

Documentación técnica **sin** sustituir la descripción del prototipo **drawer** en `contenidos.html` (sigue siendo referencia hasta un corte acordado con producto).

| Qué | Detalle |
|-----|---------|
| **HTML** | `ubits-colaborador/lms-creator/crear-contenido.html` |
| **CSS de página** | `ubits-colaborador/lms-creator/crear-contenido.css` (carga **después** de `contenidos.css` para overrides del shell y tokens) |
| **JS de página** | `ubits-colaborador/lms-creator/crear-contenido.js` |
| **Modal portada (imagen / tráiler)** | `portada-media-modal.js`, `portada-media-modal.css` |
| **Maestros** | `bd-master/bd-master-*.js` (tipos, niveles, categorías), enlazados en el HTML de la página |

- **Abrir para QA:** doble clic en el archivo o `file:///…/crear-contenido.html`; rutas relativas desde la carpeta `lms-creator/`: `crear-contenido.html`, `crear-contenido.html#recursos`, `crear-contenido.html#portada`.
- **Body:** además de `page-crear-contenido` y `no-subnav`, la página usa `crear-contenido-drawer-overlay` **solo** para heredar en cascada las reglas de layout de `contenidos.css` (workspace, pasos, rail) **sin** instanciar el componente Drawer.
- **`crear-contenido-app-open`:** clase **exclusiva** de esta página. Sube el z-index de los menús **dropdown** del índice (⋮ en Páginas creator, montados en `body`) por encima del shell — mismo criterio que `body.crear-contenido-drawer-abierto` en la lista de contenidos.
- **Responsive:** el bloque móvil del stepper y rejillas del Resources block siguen los `@media` de `contenidos.css` bajo `.crear-contenido-drawer-overlay`; el header del shell reduce padding en **639px** (`crear-contenido.css`).
- **Modo oscuro / tokens:** colores y tipografía UBITS vía hojas globales; para probar tema oscuro, usar `data-theme="dark"` en `<html>` o `<body>` como en el resto del template.

---

## Paso 1 — Portada

### Propósito

Capturar la **identidad visual y la metadata** del contenido antes de construir la estructura pedagógica (recursos, páginas, etc.).

### Campos y comportamiento

1. **Imagen de portada**  
   - Carga de imagen (obligatoria para avanzar).

2. **Trailer del contenido (opcional)**  
   - El usuario puede pegar un **enlace** al trailer.  
   - Si **no** hay trailer: el preview muestra solo la imagen de portada.  
   - Si **hay** trailer: el preview muestra la imagen de portada con un **botón de reproducción (play)** encima (o el patrón que defina producto / diseño final).  
   - Al hacer clic en play, el trailer se reproduce **en ese mismo espacio**, usando los **controles nativos del reproductor embebido** según el origen del video.  
   - Orígenes soportados (el enlace debe tener **visibilidad pública**):  
     - Vimeo  
     - YouTube  
     - Google Drive  
     - OneDrive  

3. **Descripción**  
   - Texto descriptivo del contenido (obligatorio para avanzar).

4. **Ficha técnica** (todos obligatorios para avanzar, salvo que se indique lo contrario en ampliaciones futuras)  
   - **Tipo de contenido:** selector alimentado por `bd-master-tipos-contenido.js`.  
   - **Nivel:** selector alimentado por `bd-master-niveles-contenido.js`.  
   - **Idioma:** selector con opciones fijas: **español**, **inglés**, **portugués**.  
   - **Tiempo aproximado:** campo numérico.  
   - **Unidad de tiempo:** selector **minutos** u **horas** (acompaña al tiempo aproximado).  
   - **Categoría:** selector alimentado por `bd-master-categorias-fiqsha.js`.

### Regla para pasar al siguiente paso

- Debe estar **completo** todo lo obligatorio.  
- Lo **único opcional** en este paso es el **trailer** (y, por tanto, el comportamiento play/embebido asociado).

### Validación en pantalla y resaltado en rojo (playground)

Cuando el usuario intenta avanzar sin tener la portada completa, la interfaz **indica qué falta** con **toast** y **borde rojo** en los obligatorios incompletos (mismo criterio visual que inputs en error: token **`--ubits-feedback-accent-error`**, borde **2px**).

**Disparadores (comportamiento actual en `contenidos.html` + `crear-contenido-drawer.js`):**

1. **Stepper — clic en el paso 2 «Recursos»** estando aún en Portada sin cumplir la regla de completitud → toast de aviso (*«Completa la portada para ir a Recursos.»*) y se activa el modo de **resaltado** hasta que todo quede válido.  
2. **Botón «Siguiente»** con el CTA **deshabilitado** (misma portada incompleta) → toast (*«Completa todos los campos obligatorios de la portada.»*) y el mismo resaltado.

**Qué se marca en rojo (según lo que falte):**

| Área | Qué se resalta |
|------|----------------|
| Título | Input del título |
| Imagen de portada | Borde del bloque **Learn content imagen y tráiler** (`.ubits-learn-img-trailer`); la clase de aviso de validación vive en el contenedor `.crear-contenido-portada__cabecera-media` para no interferir con la lógica interna del componente |
| Descripción | Contenedor del **rich text editor** (shell del editor) |
| Ficha técnica | Cada campo **createInput** afectado (tipo, nivel, idioma, tiempo, unidad, categoría) |

**Comportamiento del resaltado:**

- Los bordes se **actualizan** conforme el usuario corrige cada campo (desaparece el rojo en lo ya válido).  
- Al **completar** todo lo obligatorio, se limpia el resaltado y el toast deja de aplicarse para ese intento.  
- Al **cerrar el drawer** o **abrir de nuevo** el flujo de creación, se resetea el estado de aviso/resaltado.

**Valores por defecto en el prototipo** (para que cuenten como «rellenos» sin tocar el control, salvo que el usuario los cambie):

- **Tiempo aproximado:** `30`.  
- **Categoría:** primera categoría del maestro si existe **id** no vacío; no cuenta como elegida la opción solo visual *«Selecciona una opción»*.  
- **Tipo, nivel, idioma, unidad:** primera opción / valor fijo según ya definía el drawer.

**Implementación de referencia:** `ubits-colaborador/lms-creator/crear-contenido-drawer.js` (completitud, flags, stepper, «Siguiente»), estilos en `ubits-colaborador/lms-creator/contenidos.css` (clase `crear-contenido-portada-field--invalid`). Estado de error del componente de miniatura: `components/learn-content-img-trailer.css` (`.ubits-learn-img-trailer--error` alineado al rojo intenso de validación).

---

## Paso 2 — Recursos

### Propósito

Definir la **estructura del contenido** (secciones opcionales, páginas/lecciones) y **añadir recursos** dentro de cada página, con **previsualización** en tiempo real.

### Layout: dos paneles

| Panel | Ubicación | Rol |
|-------|-----------|-----|
| **Izquierda** | Configuración de la estructura | Secciones (opcional), páginas, acciones “Añadir página” / “Añadir sección”. |
| **Derecha** | Previsualizador de recursos | Empty state sin páginas; con página activa: **título editable** + **Resources block** (`default`); luego formularios / previews según tipo. |

Los dos paneles trabajan acoplados: la selección de página en la izquierda determina qué se edita/previsualiza a la derecha.

### Secciones (`sections-toggle`)

- Control tipo **interruptor** para **activar o desactivar** el uso de **secciones**.  
- **Secciones** = subdivisores de alto nivel del contenido (equivalente a lo que muchas veces se llama **módulos** en un curso).  
- **Por defecto: desactivado**, porque muchas empresas crean contenidos cortos sin módulos.  
- Si el usuario **activa** secciones:  
  - Se muestra un **título de bloque** relacionado con secciones (según copy acordado).  
  - Cada sección muestra **siempre su nombre** en la cabecera del bloque **Sección creator** (no ocultar el título cuando el modo secciones está encendido).  
  - **Nombre por defecto al crear una sección:** **«Sección N»**, donde **N** es el **ordinal de esa sección** dentro del contenido (1 para la primera sección creada, 2 para la segunda, etc.). La implementación que monte el índice debe generar ese título inicial al añadir sección; el usuario puede renombrarlo después (edición inline ya prevista en el componente).  
  - En la **parte inferior** del panel izquierdo aparece un botón **“Añadir sección”**.  
- Si el usuario **desactiva** secciones (o nunca las activa): **todas las páginas** se representan **en una sola sección lógica**, **sin mostrar cabecera de título de sección** (no aporta valor si no hay más de una sección). Sigue existiendo la lista tipo **Páginas creator** y **«Añadir página»** dentro del mismo bloque.  
- **Desactivar secciones cuando ya hay varias secciones con páginas repartidas:** debe mostrarse un **modal de advertencia** explicando que **todas las páginas pasarán a una única sección** (orden global según reglas de producto / implementación). Si el usuario confirma, se aplica el colapso; si cancela, el interruptor vuelve al estado **activado**.  
- **Excepción sin modal:** si existen **varias secciones** pero **solo la primera** tiene páginas y el resto está vacío, el usuario puede **activar y desactivar** el uso de secciones **sin** modal ni fricción (no hay riesgo de reorganizar páginas entre secciones con contenido).  
- **Componente UBITS:** **Índice Creator** (`indiceCreatorHtml` / `initIndiceCreator`) compone el interruptor, el índice de **Sección creator** cuando aplica y el contenedor del botón **«Añadir sección»**. Documentación: `documentacion/componentes/indice-creator.html`.  
- La lógica exacta de anidación (página dentro de sección, orden, etc.) debe alinearse con diseño y producto; lo aquí descrito es el comportamiento acordado.

### Páginas

- Las **páginas** son las unidades que componen el contenido en el sentido de **lecciones** o pantallas de consumo.  
- **Icono en el índice (Páginas creator) hasta elegir recurso:** mientras la página **no tenga aún un recurso principal** asignado, la fila en el índice debe **seguir mostrando el icono de página en blanco** (`blank-page` / `far fa-file` en `paginas-creator.js`), el mismo que al crear la página. **Al seleccionar un tipo de recurso** (y completar el flujo que defina producto), el icono de la fila debe **actualizarse** al que corresponda al tipo (video, PDF, embebido, etc.). *Esta sincronización índice ↔ recurso aún no está implementada en el playground;* la UI actual añade páginas en blanco y el panel derecho con **Resources block** en variante `default`; cuando exista estado de recurso por página, enlazarlo con `tipo` en `paginasCreatorItemHtml` / datos del índice.  
- **Selección:** al hacer **clic en una página**, esa fila queda activa y su **sección padre** pasa a ser la única sección activa (p. ej. borde de acento); el resto de páginas y secciones dejan de estar activas. Solo puede haber **una página activa y una sección activa** a la vez en el índice (comportamiento en `paginas-creator.js` + `seccion-creator.js`).  
- **Añadir una página** (equivalente en resultado; dos entradas):  
  1. **Empty state del panel derecho** (CTA cuando no hay páginas), **o**  
  2. Botón **«Añadir página»** en la parte inferior de **cada sección** (solo en la sección activa cuando hay secciones; en modo sin secciones, el botón del bloque único).  
- **Orden y menú de opciones (⋮):** cada fila de página puede **moverse** con acciones **«Mover arriba»** / **«Mover abajo»** desde el menú de opciones.  
  - Si la página es la **primera del contenido completo** (primera fila del índice global), **no** se ofrece **«Mover arriba»**.  
  - Si la página es la **última del contenido completo**, **no** se ofrece **«Mover abajo»**.  
  - **Entre secciones:** una página que es la **primera de la sección 2** puede subir con **«Mover arriba»** hasta ser la **última de la sección 1** (y así sucesivamente); solo deja de poder **subir** al llegar a ser la primera del contenido. Simétricamente para **bajar** hasta ser la última del contenido.

### Panel derecho: empty state sin páginas

- Se muestra **solo cuando no existe ninguna página** en el contenido (lista vacía en el índice).  
- **Copy (página dedicada `crear-contenido.html`):** título *«Añade tu primera página»*, descripción sobre añadir páginas y recursos (video, texto, PDF) y CTA **primario** «Añadir página»; en el **drawer** puede seguir el texto anterior hasta alineación explícita.  
- **En cuanto se añade la primera página**, el panel derecho deja ese empty y pasa al flujo de **selector de tipo de recurso** (u otra vista según el tipo de recurso); **no** debe volver a mostrarse este empty salvo que el usuario **elimine todas las páginas** y vuelva a quedar el índice en cero páginas.  
- **Disparadores equivalentes** para crear la primera (y siguientes) páginas: CTA del empty state **o** **«Añadir página»** en el panel izquierdo (según sección activa).  
- Efecto esperado al añadir: en el **panel izquierdo** aparece la **fila de página** (Páginas creator) y queda **activa/seleccionada**; en el **derecho** se muestra el **selector general de recursos** para esa página.

### Panel derecho: página recién añadida

- **Orden vertical:**  
  1. **Título de la página**, **editable inline** en el panel derecho (mismo criterio que el nombre en la fila del índice: al guardar o al perder foco debe mantenerse alineado con la etiqueta de la página activa en Páginas creator).  
  2. Debajo, el componente **Resources block** en variante **`default`** (selector de ocho tipos de recurso), con las dependencias UBITS ya definidas para ese bloque.  
- **Implementación de referencia en el playground:** `crear-contenido-drawer.js` (montaje del índice, evento `ubits-seccion-creator-add-page`, título `#crear-contenido-recursos-page-title`, contenedor `#crear-contenido-recursos-resources-mount`) y estilos en `contenidos.css` (prefijo `crear-contenido-recursos__page-editor`, `__preview--editor`).

### Paso 3 — Certificado (validación al salir del paso 2)

Antes de permitir avanzar al **paso 3**, debe cumplirse:

1. **Ninguna página vacía:** toda página debe tener **al menos un recurso** asignado (definición de “vacía” = sin recursos).  
2. **Ninguna sección vacía** (solo aplica si **uso de secciones** está activo): toda sección debe tener **al menos una página**.

Si no se cumple, la UI debe **bloquear el avance** y marcar en **rojo** los elementos incumplidos:

| Caso | Componente / clase (CSS en `components/`) |
|------|---------------------------------------------|
| Página sin recursos | **Páginas creator** — añadir clase **`ubits-paginas-creator__item--error`** en la fila (`.ubits-paginas-creator__item`). Borde: **2px** sólido, color **`var(--ubits-feedback-accent-error)`** (mismo criterio que portada incompleta en el paso 1). |
| Sección sin páginas | **Sección creator** — añadir clase **`ubits-seccion-creator__section--error`** en el bloque (`.ubits-seccion-creator__section`). Mismo token y grosor. |

La lógica que añade o quita estas clases vive en la pantalla que orqueste el drawer / stepper (p. ej. `crear-contenido-drawer.js` cuando exista el paso 3); los componentes solo exponen el **estado visual** documentado aquí.

### Tipos de recurso (selector general)

**Componentes UBITS:** tarjetas del selector — `resources-card.css` / `resources-card.js` (`documentacion/componentes/resources-card.html`). Panel completo (selector, formularios por tipo, cancelar) — `resources-block.css` / `resources-block.js` + `input`/`dropdown-menu` y `initResourcesBlockFields` (`documentacion/componentes/resources-block.html`).

Al configurar una página, el usuario puede añadir uno de estos tipos (presentados como cards en el Resources block o el patrón que defina producto):

1. Video (por enlace)  
2. Video desde el computador  
3. PDF  
4. Texto  
5. Embebido  
6. Scorm  
7. Evaluación final  
8. Encuesta libre  

*(Los detalles de cada tipo se irán documentando; abajo: Video y Texto según lo acordado hasta ahora.)*

---

## Recurso: Video (por enlace)

### Estados del panel derecho

1. **Configuración inicial**  
   - Input para **pegar el enlace** del video.  
   - Botón **“Cargar”** al lado: **deshabilitado** hasta que el usuario introduzca un enlace no vacío (validación mínima según producto).  
   - Botón **“Eliminar”** debajo del bloque:  
     - En esta **primera etapa** (aún sin video cargado/válido), **Eliminar** descarta el recurso y **vuelve** al **selector general de recursos** de la página (no borra la página, solo este intento de recurso).

2. **Tras añadir/cargar el video con éxito**  
   - Se muestra el **preview del video** embebido.  
   - Debajo del preview: botón **Eliminar** (quita este recurso de la página y vuelve al flujo coherente; definir con producto si hace falta confirmación).  
   - Debajo de Eliminar: bloque **“Contenido complementario”** (nombre orientativo): invita a añadir material extra con **dos** opciones en formato **cards**:  
     - **Texto**  
     - **Archivo descargable**  

Este patrón de **contenido complementario** (Texto / Archivo descargable) aparece en **varios** tipos de recurso, no solo en Video; el detalle de cada caso se documentará en mensajes siguientes.

---

## Recurso: Texto

### Comportamiento del panel derecho

- El panel derecho pasa a ser un **editor de texto enriquecido** (rich text).  
- Debajo del editor: botón **Eliminar** (coherente con el resto de recursos).  
- Debajo: sección de **contenido complementario**; en este recurso **solo** se ofrece **Archivo descargable** (no la card de Texto, para evitar anidaciones no deseadas o según regla de producto ya definida).

---

## Pendiente de documentar (próximos mensajes)

- Detalle de **contenido complementario** en todos los recursos donde aplique.  
- Flujos de: Video desde computador, PDF, Embebido, Scorm, Evaluación final, Encuesta libre.  
- Paso **3 — Certificado** (contenido de pantalla más allá de la regla de bloqueo desde paso 2).  
- Paso **4 — Publicación**.  
- Reglas de validación global (publicar, borradores, etc.) si aplica.

---

## Notas para implementación

- Reutilizar componentes UBITS del template (`documentacion/componentes.html`) para botones, inputs, alerts, toasts, etc.  
- **Navegación lateral de pasos**: **Sidebar contenidos LMS** — misma pieza que el Sidebar global (`aside.sidebar`, `sidebar-body`, `nav-button` + `data-tooltip`), con modificador `sidebar--contenidos-lms` para fondo claro (`bg-1`). **Variante Publicado LMS Creator** (por defecto): cinco pasos de Resultados a Visibilidad. **Variante Publicado Antiguo LMS** (`options.variant: 'publicado-antiguo-lms'`): sin Resultados; el paso con `data-step="recursos"` se etiqueta **Módulos** (mismo icono). Archivos: `components/sidebar-contenidos-lms.css`, `components/sidebar-contenidos-lms.js` (requiere `styles.css` por `.nav-button`). Doc: `documentacion/componentes/sidebar-contenidos-lms.html`.  
- Mantener tokens y tipografía UBITS; CSS de página en archivo dedicado junto al HTML del Creator cuando corresponda.  
- Cualquier cambio a este documento debe reflejar acuerdos de producto y, cuando aplique, la documentación UBITS del componente tocado.

*Última actualización: hash Portada `#portada` (legacy `#crear-contenido`); empty state título «Añade tu primera página» y CTA primario.*
