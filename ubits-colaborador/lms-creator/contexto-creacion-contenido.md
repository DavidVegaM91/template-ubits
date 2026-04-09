# Contexto: creación de contenido (LMS Creator)

Documento de referencia para implementar el flujo de **creación de contenido** en el módulo LMS Creator. Aquí **“contenido”** designa los **formatos de aprendizaje** (curso, short, artículo, etc.), no un archivo suelto.

**Objetivo de este archivo:** que, al leerlo, no queden dudas sobre el proceso de negocio y de pantalla al construir cada vista. Se irá ampliando con mensajes posteriores.

---

## Referencia de diseño (Figma)

- **Archivo:** [Creator v3 (Figma)](https://www.figma.com/design/NxOcUG8QAVc44KYTQexH0b/%F0%9F%9F%A2-Creator-v3?node-id=40006338-29266&m=dev)  
- **Uso:** alinear layout, estados y jerarquía visual con el diseño oficial; las reglas de negocio de este documento tienen prioridad si hubiera discrepancia puntual (resolver en revisión con producto).

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
   - Si **hay** trailer: el preview muestra la imagen de portada con un **botón de reproducción (play)** encima (o el patrón que defina Figma).  
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

---

## Paso 2 — Recursos

### Propósito

Definir la **estructura del contenido** (secciones opcionales, páginas/lecciones) y **añadir recursos** dentro de cada página, con **previsualización** en tiempo real.

### Layout: dos paneles

| Panel | Ubicación | Rol |
|-------|-----------|-----|
| **Izquierda** | Configuración de la estructura | Secciones (opcional), páginas, acciones “Añadir página” / “Añadir sección”. |
| **Derecha** | Previsualizador de recursos | Empty state, selector de tipo de recurso, configuración del recurso activo, previews. |

Los dos paneles trabajan acoplados: la selección de página en la izquierda determina qué se edita/previsualiza a la derecha.

### Secciones (`sections-toggle`)

- Control tipo **interruptor** para **activar o desactivar** el uso de **secciones**.  
- **Secciones** = subdivisores de alto nivel del contenido (equivalente a lo que muchas veces se llama **módulos** en un curso).  
- **Por defecto: desactivado**, porque muchas empresas crean contenidos cortos sin módulos.  
- Si el usuario **activa** secciones:  
  - Se muestra un **título de bloque** relacionado con secciones (según copy/Figma).  
  - En la **parte inferior** del panel izquierdo aparece un botón **“Añadir sección”**.  
- La lógica exacta de anidación (página dentro de sección, orden, etc.) debe alinearse con Figma; lo aquí descrito es el comportamiento narrado por producto.

### Páginas

- Las **páginas** son las unidades que componen el contenido en el sentido de **lecciones** o pantallas de consumo.  
- En el **centro** del panel izquierdo hay un botón **“Añadir página”**.

### Panel derecho: empty state inicial

- Muestra un **empty state** que invita a **añadir una página**.  
- **Disparadores equivalentes:**  
  - Clic en el CTA del empty state **o**  
  - Clic en **“Añadir página”** en el panel izquierdo.  
- Efecto esperado:  
  - En el **panel izquierdo** se añade un **card de página** y queda en estado **activo/seleccionado**.  
  - En el **panel derecho** deja el empty y pasa a mostrar el **selector general de recursos** disponibles para esa página (lista de cards de tipos de recurso).

### Tipos de recurso (selector general)

Al configurar una página, el usuario puede añadir uno de estos tipos (presentados como cards u otro patrón según Figma):

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
   - Debajo del preview: botón **Eliminar** (quita este recurso de la página y vuelve al flujo coherente con diseño; alinear con Figma si hay confirmación).  
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
- Pasos **3 — Certificado** y **4 — Publicación**.  
- Reglas de validación global (publicar, borradores, etc.) si aplica.

---

## Notas para implementación

- Reutilizar componentes UBITS del template (`documentacion/componentes.html`) para botones, inputs, alerts, toasts, etc.  
- **Navegación lateral de pasos** (Resultados → Visibilidad): **Sidebar contenido creator** — misma pieza que el Sidebar global (`aside.sidebar`, `sidebar-body`, `nav-button` + `data-tooltip`), con modificador `sidebar--contenido-creator` para fondo claro (`bg-1`). Archivos: `components/sidebar-contenido-creator.css`, `components/sidebar-contenido-creator.js` (requiere `styles.css` por `.nav-button`). Doc: `documentacion/componentes/sidebar-contenido-creator.html`.  
- Mantener tokens y tipografía UBITS; CSS de página en archivo dedicado junto al HTML del Creator cuando corresponda.  
- Cualquier cambio a este documento debe reflejar acuerdos de producto y, si es posible, el nodo de Figma afectado.

*Última actualización: documento inicial + pasos 1–2 (parcial) y recursos Video/Texto.*
