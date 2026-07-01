# Contexto: creación de contenido (LMS Creator)

Documento de referencia sobre el flujo de **creación de contenido** en el módulo LMS Creator. Aquí **“contenido”** son los **formatos de aprendizaje** (curso, short, artículo, etc.), no un archivo suelto.

**Para quién es este documento:** personas de **producto, diseño, negocio** y cualquier lector que necesite entender **qué hace** el flujo y **cómo lo vive el usuario**, sin depender de nombres de código o archivos.

**Cómo está escrito:** lenguaje **conceptual** (pantallas, reglas, opciones, mensajes).  
**Excepciones acordadas:** en **Recurso: PDF**, la subsección **«Implementación técnica del visor»**; en **Recurso: Video**, **«Implementación técnica del placeholder de generación»** — conservan detalle técnico del renderizado para quien lo necesite en desarrollo.

**Objetivo:** que no queden dudas sobre el proceso de negocio y la experiencia en pantalla. Se irá ampliando con mensajes posteriores.

---

## Referencias de diseño

Los bocetos en herramienta de diseño fueron **exploratorios**. La referencia para alinear esfuerzos es **este documento**, la **documentación de componentes UBITS** y lo acordado con **producto**. No se enlazan archivos externos de diseño para evitar roturas cuando exista un diseño consolidado.

- **Creator (prototipo):** asistente por pasos (portada y recursos, entre otros) en una **pantalla dedicada** de creación.  
- **Paso Recursos (vacío):** panel izquierdo con índice + en el derecho un estado vacío que invita a crear la primera página.  
- **Paso Recursos (con página nueva):** a la derecha, **título editable** de la página y debajo el **bloque para elegir y configurar el tipo de recurso**.  
- **Índice:** interruptor de secciones (si aplica), listado de páginas, **Añadir página** / **Añadir sección**.  
- **Tarjetas de tipo de recurso** y **bloque de recurso:** el usuario elige entre **ocho tipos** (video, PDF, texto, etc.) y completa el formulario que corresponda; si intenta avanzar sin **título válido** o sin **recurso** en alguna página, esa página (o sección vacía) puede mostrarse en **error** según las reglas del paso.  
- **Orden de páginas:** desde el menú de cada fila (**Mover arriba / abajo**) o **arrastrando** la página por el icono.  
- **Criterio:** misma identidad visual y patrones UBITS que el resto del producto; si hay duda puntual, ganan **negocio + producto** y la documentación del componente.

---

## Datos de la ficha técnica (origen)

En el prototipo, **tipo de contenido**, **nivel** y **categoría** salen de **listas maestras** definidas en el proyecto (en un entorno real equivaldrían a los catálogos o API de la empresa).

Los desplegables del paso Portada deben reflejar esos valores de forma coherente.

---

## Visión general del flujo

El asistente de creación tiene **4 pasos**, en este orden:

| Paso | Nombre | Estado en esta documentación |
|------|--------|------------------------------|
| 1 | Portada | Descrito en detalle |
| 2 | Recursos | Descrito en detalle (incl. **recursos complementarios** bajo el principal) |
| 3 | Certificado | Descrito en detalle (switch, plantillas mock Fiqsha, preview orientativa, empty state) |
| 4 | Visibilidad | Descrito en detalle (4 estados; lógica de cambio y publicación pendiente) |

**Navegación real en el playground:** desde **Recursos**, con al menos una página y **títulos válidos** en todas (y el resto de reglas del paso Recursos), **Siguiente** o el paso **3** del stepper llevan a **Certificado** (`#certificado`). Desde Certificado, **Siguiente** lleva a **Visibilidad** (`#visibilidad`). **Anterior** en Certificado vuelve a Recursos; **Anterior** en Visibilidad vuelve a Certificado. Ver también **Deep link demo** en los pasos Certificado y Visibilidad.

### Créditos de IA (saldo y costos)

En el flujo **crear contenido**, el cliente **nace con un saldo inicial de 500.000 créditos** (tokens de IA) al cargar la pantalla. Ese saldo es **único y compartido** entre portada, video, evaluación, SCORM y el resto de acciones con IA del Creator en la misma sesión: cada consumo **descuenta** del mismo pool y el **badge de saldo** en modales y panel de IA refleja el **restante**.

| Acción | Créditos consumidos | Dónde se muestra el costo |
|--------|---------------------|---------------------------|
| **Generar portada** (imagen con IA) | **50** | Botón **Generar portada** / **Regenerar portada** en modal «Añadir portada» |
| **Generar guión** (video con avatar, pestaña Video IA) | **80** | Botón **Generar guión** |
| **Generar video** (video con avatar, pestaña Video IA) | **320** | Botón **Generar video** (pie del modal) |
| **Generar evaluación** (agente de evaluaciones) | **80** | Botón **Generar evaluación** en el hilo del panel de IA |
| **Generar presentación SCORM** (pestaña SCORM con IA) | **15** | Botón **Generar presentación** (sin cambio respecto al prototipo anterior) |

**Reglas de producto:**

- Si el saldo **no alcanza** para una acción, el sistema **no ejecuta** la generación y muestra un **aviso** (toast) indicando cuántos créditos se requieren.
- **Subir** portada, **enlace/subida** de video, **subir .zip** SCORM y el resto de flujos **sin IA** **no consumen** créditos.
- Regenerar portada o volver a generar guión/video/evaluación **vuelve a cobrar** el costo de esa acción.

**Referencia en código (playground vanilla):** saldo inicial en `crear-contenido.js` (`window._ubitsAiTokenPool`); costos en `portada-imagen-modal.js` (portada), `video-recurso-modal.js` (guión y video), `evaluaciones-recurso.js` (evaluación), `scorm-recurso-modal.js` (SCORM). En React: `Ubits-React/lib/lms-creator/creatorAiTokens.ts` y pool compartido en `crear-contenido.tsx`.

### Desde la lista de contenidos

- El **asistente de creación** vive en una **pantalla propia** a casi pantalla completa, separada de la lista. No hay un “mini creador” embebido en la tabla de contenidos.
- Desde la lista, el usuario entra con **«Crear contenido»** y llega a esa pantalla.
- Si alguien usa **enlaces antiguos** guardados (marcadores con rutas o anclas viejas), el sistema los lleva al mismo flujo moderno (paso portada o paso recursos según corresponda).

### Experiencia de la pantalla de creación

- **Barra superior:** título del flujo, estado tipo borrador y acción para **salir** y volver a la lista.
- **Columna lateral (rail):** lista de **pasos** del asistente (Portada, Recursos, etc.) en formato vertical; en móvil puede verse como pasos compactos en horizontal.
- **Zona central:** el contenido del paso activo (portada con título y miniatura, o recursos con índice + panel derecho).
- **Pie de página:** **Siguiente** y, cuando aplica, **Anterior**. En el primer paso **no** tiene sentido “paso anterior”; el botón correspondiente **no se muestra**.

---

## Paso 1 — Portada

### Propósito

Capturar la **identidad visual y la metadata** del contenido antes de construir la estructura pedagógica (recursos, páginas, etc.).

### Campos y comportamiento

1. **Imagen de portada y tráiler (miniatura)** — Ver subsección siguiente; la imagen es **obligatoria** para avanzar; el **tráiler es opcional**.

2. **Descripción**  
   - Texto descriptivo del contenido (obligatorio para avanzar).

3. **Ficha técnica** (todos obligatorios para avanzar, salvo que se indique lo contrario más adelante)  
   - **Tipo de contenido**, **nivel**, **idioma** (español / inglés / portugués), **tiempo aproximado** con **unidad** (minutos u horas), **categoría** — según listas de negocio descritas arriba.

### Imagen de portada y tráiler: modal «Añadir portada» (experiencia actual)

Hoy el prototipo **no** reparte la configuración en varios botones sueltos dentro del hueco de la miniatura. Cuando **aún no hay imagen**, el hueco muestra el **vacío con IA** del componente `learn-content-img-trailer`: icono, título (*Agrega una portada*), descripción breve y un **CTA primario** **«Agregar portada»** (ia-button). Al pulsarlo se abre un **modal grande** titulado **«Añadir portada»**, con el mismo **look & feel** que otros asistentes con IA del Creator (cabecera con gradiente, saldo de **tokens de IA** visible junto a un **icono de información** que explica el saldo al pasar el cursor o al pulsar en táctil, pestañas claras).

**Tres formas de trabajar la portada (pestañas):**

1. **Portada con IA** — Mensaje inspirador (*tú lo imaginas…*) y un campo para **describir con palabras** la portada. El usuario pulsa **Generar portada**; cada generación **consume 50 créditos** del saldo compartido. La primera vez que genera, el modal **se ensancha** y aparece a un lado una **zona de vista previa**: primero un estado vacío amable, luego una **animación de “generando”**, después la **imagen resultante** (en el prototipo es una simulación con imagen de ejemplo y una espera corta). Puede **regenerar** otra imagen (de nuevo con **50 créditos**) o pulsar **Usar esta imagen** para aplicarla a la portada.

2. **Subir portada** — El usuario **elige un archivo** de imagen desde su equipo. Los formatos y el **tamaño máximo** se comunican en la propia zona de carga. Confirma con **Usar esta imagen**.

3. **Tráiler (opcional)** — Campo para **pegar el enlace público** del video de promoción. Solo se admiten enlaces de ciertos proveedores (**YouTube, Vimeo, Google Drive, OneDrive**). El usuario puede **guardar el tráiler**; si ya tenía una imagen de portada, la miniatura se actualiza para poder **reproducir** el video sin tener que cerrar todo el flujo del modal principal.

**Después de confirmar una imagen** (generada o subida): la cabecera muestra la **foto de portada**. Si la imagen vino de IA, puede mostrarse una **etiqueta** tipo **«Generado con IA»**.

**Cuando ya hay imagen y la persona quiere retocar («Cambiar» / editar):** se vuelve a abrir **el mismo modal «Añadir portada»**, no un segundo modal distinto. El sistema **recuerda el contexto** para que el retoque sea coherente:
- Si la portada actual se obtuvo **con IA** y hay **prompt guardado**, al abrir se muestra la pestaña **Portada con IA** con el **texto que usó** y la **vista previa** ya mostrando la imagen actual; puede afinar el texto, regenerar o confirmar de nuevo.
- Si la portada se **subió a mano** (o no hay prompt de IA guardado), al abrir se va directamente a la pestaña **Subir portada**, con la **zona de carga** mostrando la **imagen actual** como archivo ya listo (puede sustituir el archivo o volver a **Usar esta imagen**).

**Vista previa en la cabecera:** si **no** hay tráiler, solo se ve la imagen; si **hay** tráiler, aparece un **botón de play** sobre la imagen y el video se reproduce **en el mismo espacio**, con los controles habituales del reproductor embebido según el origen del enlace.

### Regla para pasar al siguiente paso

- Debe estar **completo** todo lo obligatorio.  
- Lo **único opcional** en este paso es el **tráiler** (y, por tanto, el comportamiento play/embebido asociado).

### Validación y ayuda cuando falta algo

Si la persona intenta **ir a Recursos** (por el paso lateral o por **Siguiente**) sin tener la portada completa:

- Aparece un **mensaje breve** (toast) explicando que debe completar la portada.
- Los campos obligatorios que falten se marcan con **borde rojo** para guiar la mirada.

**Qué puede quedar marcado:** título del contenido, **bloque de la miniatura** si no hay imagen aún, **descripción**, y cada campo de la **ficha técnica** que esté incompleto.

**Comportamiento:** en cuanto el usuario corrige un campo, **deja de marcarse** ese campo. Cuando todo está bien, desaparece el modo de aviso. Si sale del flujo y vuelve a entrar, el estado de aviso se reinicia según corresponda.

**Nota de prototipo:** algunos valores de la ficha pueden iniciar ya rellenados para facilitar pruebas (por ejemplo tiempo sugerido); la **categoría** no cuenta como “elegida” si solo está el texto genérico del desplegable sin una opción real.

---

## Paso 2 — Recursos

### Propósito

Definir la **estructura del contenido** (secciones opcionales, páginas/lecciones) y **añadir recursos** dentro de cada página, con **previsualización** en tiempo real.

### Layout: dos paneles

| Panel | Ubicación | Rol |
|-------|-----------|-----|
| **Izquierda** | Configuración de la estructura | Secciones (opcional), lista **Páginas creator** (selección, menú ⋮, **reordenar arrastrando** el icono de tipo), acciones “Añadir página” / “Añadir sección”. |
| **Derecha** | Previsualizador de recursos | Estado vacío si no hay páginas; con una página activa: **título editable**, **indicador «Página X de X»** (posición dentro de la sección activa) y debajo el **selector y configuración del recurso** (formulario o vista previa según el tipo). |

Los dos paneles trabajan acoplados: la selección de página en la izquierda determina qué se edita/previsualiza a la derecha.

### Secciones

**Ámbito:** el interruptor y el índice de páginas viven en el **paso Recursos**, solo ahí.

- Control tipo **interruptor** para **activar o desactivar** el uso de **secciones**.  
- **Secciones** = subdivisores de alto nivel del contenido (equivalente a lo que muchas veces se llama **módulos** en un curso).  
- **Por defecto: desactivado**, porque muchas empresas crean contenidos cortos sin módulos.  

**Cabecera y nombre de cada sección (componente Sección creator)**  
- El **título visible** de cada bloque es el del componente **Sección creator**.  
- **Nombre por defecto** al crear una sección: **«Sección 1»**, **«Sección 2»**, … según el **orden de creación** de esa sección en el contenido (el usuario puede personalizarlo después).  

**Cómo editar título y descripción de una sección**  
- **Doble clic** en el nombre de la sección en el índice, **o** menú **⋮** → **«Editar sección»**.  
- Se abre un **modal** con campos claros:  
  - **Título de la sección** — **obligatorio**.  
  - **Descripción** — **opcional**, editor de texto enriquecido.  
- **Footer del modal:**  
  - Botón **primario «Guardar»**: **deshabilitado** hasta que se detecte **algún cambio** en cualquiera de los campos respecto al valor al abrir el modal.  
  - Botón **«Cancelar»**: cierra el modal sin guardar.  

Si el usuario **activa** secciones:  
- Cada sección muestra **siempre** su nombre en la cabecera del bloque **Sección creator** (no ocultar el título con el modo secciones encendido).  
- En la **parte inferior** del panel izquierdo aparece el botón **«Añadir sección»**.  

Si el usuario **desactiva** secciones (o nunca las activa): **todas las páginas** quedan en **una única sección lógica** **sin** cabecera de nombre visible; solo se listan las páginas y el botón **«Añadir página»** al pie. El detalle visual debe coincidir con la documentación del **Índice creator** en el design system.

**Modal al deshabilitar secciones** (cuando ya hay **varias secciones con páginas repartidas**):  
- **Título:** «Deshabilitar secciones»  
- **Cuerpo:** «Estás a punto de deshabilitar el uso de secciones; al hacerlo, todas las páginas se moverán a una única sección. Esta acción no se puede deshacer. ¿Estás seguro de deshabilitar las secciones?»  
- **Botones:** primario **«Sí, deshabilitar»** (confirma y aplica el colapso); secundario **«Cancelar»** (cierra y el interruptor vuelve a **activado** / uso de secciones sigue).  

**Excepción sin modal:** si hay **varias secciones** pero **solo la primera** tiene páginas y el resto está vacío, se puede **activar y desactivar** el uso de secciones **sin** modal.

**Eliminar una sección** (menú **⋮** de la cabecera de sección → **«Eliminar sección»**):  
- Se abre un **modal** titulado **«Eliminar sección»**.  
- **Cuerpo:** avisa de que se eliminará la sección **y todas las páginas que contenga**, que la acción **no se puede deshacer**, y pregunta confirmación.  
- **Botones:** **Cancelar** (cierra sin cambios) y **Sí, eliminar** (aplica el borrado).  
- Tras confirmar: desaparece el bloque de esa sección del índice junto con sus páginas; el panel derecho se alinea con la **primera página** que quede en el contenido (o vuelve al empty state si no queda ninguna).

### Páginas

- Las **páginas** son las unidades que componen el contenido en el sentido de **lecciones** o pantallas de consumo.  
- **Icono en el índice:** mientras la página **no tiene aún un recurso principal**, la fila muestra el icono de **página en blanco**. Cuando el usuario **elige y confirma un tipo de recurso**, el icono pasa al del tipo (**video**, **PDF**, **SCORM**, **embebido**, **evaluación**, etc.) según lo implementado en el prototipo.  
- **Selección:** al hacer **clic en una página**, esa fila queda activa y su **sección** queda resaltada frente al resto. Solo hay **una página activa** (y una sección activa) a la vez.  
- **Añadir una página** (equivalente en resultado; dos entradas):  
  1. **Empty state del panel derecho** (CTA cuando no hay páginas), **o**  
  2. Botón **«Añadir página»** en la parte inferior de **cada sección** (solo en la sección activa cuando hay secciones; en modo sin secciones, el botón del bloque único).  
- **Menú ⋮ de cada página:** **Mover arriba**, **Mover abajo** (con las reglas de orden global) y **Eliminar** (ver **Confirmación al eliminar una página**).  
- **Orden — menú (⋮) y arrastrar y soltar:** cada fila puede **reordenarse** de dos formas:  
  1. **Arrastrar y soltar** usando el **icono de tipo** como asa: el usuario arrastra la fila y la suelta donde quiera (alternativa importante para accesibilidad frente al solo arrastre libre).  
  2. **Menú ⋮ — «Mover arriba» / «Mover abajo»** con las mismas reglas de orden global.  
  - Si la página es la **primera del contenido completo** (primera fila del índice global), **no** se ofrece **«Mover arriba»**.  
  - Si la página es la **última del contenido completo**, **no** se ofrece **«Mover abajo»**.  
  - **Entre secciones:** una página que es la **primera de la sección 2** puede subir con **«Mover arriba»** (o arrastrando) hasta ser la **última de la sección 1** (y así sucesivamente); solo deja de poder **subir** al llegar a ser la primera del contenido. Simétricamente para **bajar** hasta ser la última del contenido.

### Panel derecho: empty state sin páginas

- Se muestra **solo cuando no existe ninguna página** en el contenido (lista vacía en el índice).  
- **Textos en pantalla:** título del estilo *«Añade tu primera página»*, texto que explica que podrá añadir recursos (video, texto, PDF, etc.) y un botón principal **«Añadir página»**. Los textos exactos son los que muestre la pantalla de creación en el prototipo.  
- **En cuanto se añade la primera página**, el panel derecho deja ese empty y pasa al flujo de **selector de tipo de recurso** (u otra vista según el tipo de recurso); **no** debe volver a mostrarse este empty salvo que el usuario **elimine todas las páginas** y vuelva a quedar el índice en cero páginas.  
- **Disparadores equivalentes** para crear la primera (y siguientes) páginas: CTA del empty state **o** **«Añadir página»** en el panel izquierdo (según sección activa).  
- Efecto esperado al añadir: en el **panel izquierdo** aparece la **fila de página** (Páginas creator) y queda **activa/seleccionada**; en el **derecho** se muestra el **selector general de recursos** para esa página.

### Panel derecho: página recién añadida

- **Orden vertical:**  
  1. **Fila de título:** a la izquierda, **título de la página** **editable inline** (mismo criterio que el nombre en la fila del índice: al guardar o al perder foco debe mantenerse alineado con la etiqueta de la página activa en Páginas creator). A la **derecha** de esa fila, texto auxiliar en tipografía pequeña: **«Página X de X»** (por ejemplo *Página 1 de 3*).  
  2. Debajo, el **bloque para elegir el tipo de recurso** (tarjetas de video, PDF, texto, etc.) según el diseño UBITS.

**Indicador «Página X de X»**

- Muestra la **posición de la página activa dentro de la sección en la que está**, no el total global del contenido si hay varias secciones.  
- **Con secciones desactivadas:** todas las páginas cuentan en una sola lista → *Página 2 de 5* si hay cinco páginas y la segunda está seleccionada.  
- **Con secciones activadas:** solo cuentan las páginas **de la sección a la que pertenece la página activa**. Ejemplo: en la **sección 2** hay tres páginas y el usuario está en la primera → *Página 1 de 3* (aunque en el contenido completo haya más páginas en otras secciones).  
- El contador **se actualiza** al cambiar de página, al **añadir** o **eliminar** páginas en esa sección, y al **reordenar** (menú ⋮ o arrastre).  
- **No se muestra** cuando el panel derecho está en empty state (sin páginas).  
- Copy fijo en español: **«Página»** + número actual + **«de»** + total (numeración desde **1**).

### Título obligatorio de cada página (validación en paso Recursos)

Para poder **avanzar** desde Recursos (botón **Siguiente** o equivalente), **cada página** del índice debe tener un **título válido**:

- **Válido:** texto con contenido tras quitar espacios en blanco.  
- **No válido:** campo vacío o el texto genérico **«Sin título»** (sin distinguir mayúsculas/minúsculas).

**Cómo se comunica el error:**

| Momento | Comportamiento |
|---------|----------------|
| **Progresivo** | Si el usuario **edita el título** y **sale del campo** (pierde foco) con un valor inválido, la **fila de esa página** en el índice muestra **borde de error**. |
| **Al intentar avanzar** | Si aún hay páginas inválidas, aparece un **toast** del estilo *«Todas las páginas deben tener un título. Revisa las marcadas en rojo.»* y se marcan **todas** las filas inválidas de una vez (modo “flash”). |
| **Corrección** | En cuanto el título pasa a ser válido, la fila **deja** el estado de error. |

Esta regla es **independiente** de si la página ya tiene recurso asignado: una página puede tener video montado y aun así bloquear el avance si el título sigue siendo inválido.

### Persistencia del panel derecho al cambiar de página

Cada **página del índice** guarda **su propio estado** del panel derecho (selector de tipos, recurso montado, evaluación, etc.). Al **activar otra fila** en el índice:

1. Se **guarda** lo que había en la página que se abandona.  
2. Se **restaura** lo correspondiente a la página nueva (o el selector vacío si aún no tiene recurso).

En el prototipo esto aplica, entre otros, a **video**, **PDF** (vista previa con el archivo ya subido), **SCORM**, **embebido** y **evaluación final**. El usuario puede alternar entre lecciones sin perder el trabajo de cada una en la misma sesión de creación.

### Paso 3 — Certificado

**Archivos:** `crear-contenido-certificado.js`, `crear-contenido-certificado.css` (clases `certificado-paso__*`).

**Propósito:** permitir **activar o no** un certificado para el contenido, elegir una **plantilla** (mock Fiqsha en el prototipo) y ver una **vista previa orientativa** de cómo se vería el diploma, usando datos ya capturados en la portada.

**Layout:** dos columnas como Recursos — panel izquierdo fijo (~400px) con la configuración y columna derecha con la vista previa. En **móvil/tablet** (≤1023px) las columnas se apilan: primero configuración, después preview.

| Control | Comportamiento |
|---------|----------------|
| **Switch** «Habilitar certificado para este contenido» | **Activado por defecto.** Si se apaga, se ocultan el **select de plantilla** y el texto **«Vista previa orientativa.»**; la columna derecha muestra un **empty state** (ver abajo). Si se vuelve a activar, la vista previa del certificado **se restaura** con la plantilla seleccionada. |
| **Select** «Seleccionar plantilla de certificado» | Solo visible con switch **ON**. Mock **Fiqsha** con **3 plantillas** (tabla siguiente); por defecto la **más reciente** («Cursos empresariales con doble firma»). Al cambiar plantilla, la preview se actualiza al instante. |
| **Texto «Vista previa orientativa.»** | Aparece encima del certificado solo con switch **ON**. Aclara que la preview es **referencial**, no el PDF final. |
| **Vista previa del certificado** | Render orientativo con fondo de plantilla Fiqsha, logo de cliente, textos de ejemplo y firmas según la plantilla elegida. Proporción de diseño **774×598** (referencia Figma Creator). |

#### Empty state (certificado deshabilitado)

Cuando el switch está **OFF**, la columna derecha muestra el componente **Empty state** UBITS:

| Elemento | Contenido |
|----------|-----------|
| **Icono** | Medalla / certificado (misma familia visual que certificados en el producto). |
| **Título** | «No has habilitado un certificado» |
| **Descripción** | «Si deseas, puedes activar un certificado para este contenido.» |

**Desktop (≥1024px):** el empty state **ocupa todo el alto disponible** en la columna de preview (misma lógica de viewport que el índice del paso Recursos), con el contenido **centrado** dentro del bloque. **Móvil:** altura según contenido, sin forzar pantalla completa.

#### Plantillas mock Fiqsha (prototipo)

Las plantillas viven en memoria en el playground; en producción deberían salir del módulo **LMS Creator → Certificados**.

| Plantilla | Firmas | Duración en preview | Línea «Documento» |
|-----------|--------|---------------------|-------------------|
| **Cursos empresariales con doble firma** *(default)* | **Dos:** Patricia Elena Bermúdez Ríos (Gerente General) y Carmen Rosa Díaz Herrera (Jefa de Recursos Humanos), con imagen de firma en la preview | Sí | No |
| **Certificado estándar Fiqsha** | **Una:** Patricia Elena Bermúdez Ríos | Sí | Sí *(placeholder «Documento: ##########»)* |
| **Onboarding colaboradores** | **Una:** Carmen Rosa Díaz Herrera | No | No |

#### Contenido de la vista previa orientativa

**Datos que vienen de la portada** (se actualizan **en vivo** mientras el usuario está en el paso Certificado si edita título, tiempo, unidad o categoría en Portada):

- **Título del contenido** (textarea de portada).
- **Categoría** — se muestra el **nombre legible** de la categoría Fiqsha (p. ej. «Gestión de conflictos»), no el identificador interno.
- **Duración** — línea del tipo «Con una duración de 30 minutos» (o horas si la unidad es «h»), según tiempo y unidad de la ficha técnica.

**Placeholders fijos en la preview** (no editables en este paso):

- **Fecha** — fecha del día en formato español (p. ej. «29 de mayo de 2026»).
- **Nombre del estudiante** — texto fijo «Nombre del estudiante».
- **Código** — «Código No. ##########».
- **Pie legal** — «UBITS confirma la identidad de la persona y su finalización de este contenido».

**Elementos visuales:** logo Fiqsha en la zona superior del certificado; fondo gráfico de plantilla; bloques de firma con imagen cuando la plantilla lo incluye.

**Preview estrecha:** si el ancho del certificado en pantalla es reducido, las **dos firmas** pueden **apilarse** en columna para mantener legibilidad (comportamiento responsive del bloque de preview).

#### Deep link demo (playground)

Para **demos y pruebas**, si se abre `crear-contenido.html` con hash **`#recursos`**, **`#certificado`** o **`#visibilidad`** (alias legacy **`#publicacion`**) y el borrador está **vacío** (sin título, sin portada cargada, sin páginas en Recursos), el prototipo **precarga** un curso de ejemplo:

- **Portada:** título «Resolución efectiva de conflictos en equipos de trabajo», imagen de portada, descripción, categoría **Gestión de conflictos**.
- **Recursos:** dos secciones con video IA, PDF, dos SCORM y evaluación estándar (tema conflictos en equipo).

Al ir a **Certificado** (`#certificado` o stepper paso 3), la vista previa del certificado usa esos datos de portada (título, categoría, duración). Sirve para mostrar el flujo completo sin rellenar manualmente.

**Hash URL del paso:** `#certificado`.

#### Requisitos para llegar a Certificado (validación al salir de Recursos)

Desde **Recursos**, **Siguiente** o el paso **3** del stepper solo llevan a Certificado si se cumple:

1. Al menos **una página** en el índice.  
2. **Título válido en todas las páginas**.  
3. **Al menos un recurso principal** en cada página (evaluación final cuenta como recurso). Páginas sin recurso: borde rojo en el índice; en la página activa el **resources block** pasa a variante `default-error`.  
4. Con **secciones activas:** ninguna sección vacía (borde rojo en el bloque de sección).

Desde Certificado, **Siguiente** lleva a **Visibilidad**. **Anterior** vuelve a Recursos.

**Pendiente de producto:** integración real con plantillas del módulo **LMS Creator → Certificados** (hoy mock Fiqsha en memoria).

### Paso 4 — Visibilidad

**Archivos:** `crear-contenido-publicacion.js`, `crear-contenido-publicacion.css` (clases `publicacion-paso__*`; nombre técnico legacy del paso).

**Propósito:** configurar la **visibilidad** del contenido (Borrador, Público, Privado, Oculto) antes de publicarlo. Es el paso más sencillo del flujo: **una sola columna** en el cuerpo de la página (sin índice lateral ni panel de configuración extra).

**Layout:** texto introductorio + **cuadrícula 2×2** de tarjetas de selección (`ubits-selection-card` + radio). En **tablet** (≤900px) la cuadrícula pasa a 2 columnas; en **móvil** (≤600px) se apila en **1 columna**.

**Texto introductorio:** «Configura la visibilidad que tendrá el contenido al publicarlo, ten presente que puede haber limitantes de edición dependiendo del estado.»

#### Estados de visibilidad (4 opciones)

Cada tarjeta muestra un **status tag** con el nombre del estado y una **descripción** debajo. El radio queda a la derecha según el patrón UBITS de selection card.

| Estado | Tag (variante) | Descripción (resumen) |
|--------|----------------|------------------------|
| **Borrador** *(default)* | info | En construcción; visible **solo para ti y otros creadores**; **todos** los cambios permitidos. |
| **Público** | success | Visible para **todos los colaboradores** de la empresa; publicado → solo editar títulos de secciones/páginas o **reemplazar recursos**. |
| **Privado** | warning | Solo colaboradores **seleccionados**; mismas limitaciones post-publicación que Público. |
| **Oculto** | neutral | **No** en catálogo; visible para quien lo **completó** o tiene **en progreso**; mismas limitaciones post-publicación. |

**Estado inicial:** al crear contenido nuevo, el contenido **nace en Borrador**. La tarjeta **Borrador** viene **preseleccionada** (radio checked). El tag **«Borrador»** del header de la pantalla de creación refleja el mismo estado.

**Comportamiento actual en el prototipo:**

| Estado | Al seleccionar |
|--------|----------------|
| **Borrador** | Se aplica de inmediato (sin modal). |
| **Público** / **Privado** | Modal **«Publicar contenido»** → **Cancelar** mantiene el estado anterior; **Sí, publicar** aplica la selección. |
| **Oculto** | Modal **«Ocultar contenido»** → **Cancelar** mantiene el estado anterior; **Sí, ocultar** aplica la selección. |

Al confirmar, el **radio** del card queda marcado y el **status tag** del header (`#crear-contenido-visibilidad-header-tag`) se actualiza con la variante y etiqueta del estado (info / success / warning / neutral).

**Pendiente de producto:** selector de colaboradores en **Privado**, flujo de publicación final desde **Siguiente**, reglas de edición post-publicación en backend.

**Hash URL del paso:** `#visibilidad` (alias legacy `#publicacion` redirige al canónico).

#### Requisitos para llegar a Visibilidad

Desde **Certificado**, **Siguiente** lleva a Visibilidad sin validación adicional en este prototipo.

Desde el **stepper** (paso **4**), aplican las mismas reglas que para ir a Certificado: portada completa + Recursos válidos (páginas, títulos, recursos por página, secciones no vacías). Si el usuario aún no pasó por Certificado, el flujo lo lleva por los pasos intermedios antes de mostrar Visibilidad.

**Anterior** en Visibilidad vuelve a Certificado. **Siguiente** en Visibilidad aún **no** ejecuta la publicación final (acción pendiente de producto).

#### Deep link demo (playground)

El hash **`#visibilidad`** participa del mismo **deep link demo** que `#recursos` y `#certificado`: con borrador vacío se precarga el curso de ejemplo y se abre directamente en el paso Visibilidad.

### Tipos de recurso (selector general)

El usuario elige el tipo mediante **tarjetas** y completa el **panel** que corresponda (formulario o vista previa). La documentación de **Resources card** y **Resources block** en el design system describe las variantes y estados.

### Distintivo IA en las tarjetas del bloque de recursos

- En la **cuadrícula de tarjetas** del selector, los tipos que incluyen **asistencia con IA** en el Creator llevan un **badge pequeño de IA**: variante **outlined** del sistema de insignias, **solo icono** (el mismo lenguaje visual que otros puntos de IA del producto), situado en la tarjeta para **destacar** ese tipo frente al resto.
- El distintivo tiene un **tooltip** al pasar el cursor (con un **retardo breve** para no molestar en movimientos rápidos): el texto informa de forma explícita que ese tipo **incluye asistencia con IA** (en el prototipo el mensaje por defecto es del estilo *«Incluye asistencia con IA.»*; producto puede afinar la redacción manteniendo el criterio).
- Los tipos **sin** flujo asistido por IA **no** muestran ese badge.
- En la versión actual del playground, el distintivo aplica a **Video**, **SCORM** y **Evaluación**: son los que ya exponen generación o agente asistido; si en el futuro otro tipo incorpora IA, puede adoptarse la misma convención.

### Panel de operaciones en curso (Status panel)

Cuando el usuario **genera con IA** un **video** o un **SCORM** (o tiene varias generaciones seguidas), el Creator muestra un **panel flotante** en la **esquina inferior izquierda** (misma familia que el componente **Status panel** del design system).

| Aspecto | Comportamiento |
|---------|----------------|
| **Cabecera** | Título con icono de IA: **«Generando recursos»** mientras hay trabajos en curso; **«Recursos generados»** cuando todos terminaron. Se puede **minimizar** o **cerrar** el panel. |
| **Cada trabajo** | Una fila con icono del tipo (video / SCORM), **título del recurso** (p. ej. título de la presentación SCORM) y subtítulo **«Generando…»** con spinner. |
| **Al terminar** | La fila pasa a **completado** (marca verde): subtítulo **«Listo · Haz clic para ver»**. Al pulsar la fila, el sistema **activa la página** correspondiente en el índice para que el usuario vea el resultado. |
| **Si elimina el recurso** en el panel derecho (ver **Confirmación al eliminar recurso**) **sin cerrar** este panel, la fila **no desaparece**: pasa a estado **error** (marca roja), el subtítulo bajo el título se muestra en **rojo** con el texto **«Se eliminó el recurso»** y ya **no** es clicable para navegar. |

Solo aplica a generaciones **Video IA** y **SCORM con IA** que dispararon ese indicador; otros tipos (PDF subido, evaluación manual, etc.) no añaden filas salvo que producto lo extienda.

### Confirmación al eliminar un recurso ya añadido

**Ámbito:** todo recurso que ya está montado en la página y muestra el botón **Eliminar** en el pie del bloque (video, SCORM, PDF, evaluación, texto, etc.).

- Al pulsar **Eliminar**, **no** se borra al instante: se abre un **modal pequeño** titulado **«Eliminar recurso»**.
- **Mensaje:** «¿Seguro que deseas eliminar este recurso? La página quedará en blanco.»
- **Botones:** **Cancelar** (cierra sin cambios) y **Sí, eliminar** (confirma).
- Tras confirmar: el panel derecho vuelve al **selector de tipos de recurso**, el icono de la página en el índice pasa a **página en blanco** y, si había una fila en el **panel de operaciones** para ese video o SCORM generado por IA, esa fila queda en **error** con **«Se eliminó el recurso»** (ver tabla anterior).

### Confirmación al eliminar una página del índice

**Ámbito:** cualquier fila de **Páginas creator** con al menos una página en el contenido.

- Menú **⋮** de la fila → **Eliminar**.  
- **No** se borra al instante: modal titulado **«Eliminar página»**.  
- **Mensaje:** confirma que se eliminará la página y que **se perderán todos los recursos** que contenga.  
- **Botones:** **Cancelar** y **Sí, eliminar**.  
- Tras confirmar: la fila desaparece del índice; si era la activa, el sistema selecciona otra página (habitualmente la **primera** que quede) o vuelve al **empty state** del panel derecho si no quedan páginas.

### Tipos en el selector (orden y estado en el prototipo)

Al configurar una página, el usuario ve **ocho tarjetas** en este orden (cuadrícula del **Resources block**):

| # | Tipo en pantalla | Entrada al flujo en el prototipo |
|---|------------------|----------------------------------|
| 1 | **Video** | Modal **«Agregar video»** con pestañas **Video IA**, **enlace** y **subir** (ver **Recurso: Video**). |
| 2 | **PDF** | Panel: subida de archivo y vista previa (ver **Recurso: PDF**). |
| 3 | **Texto** | Tarjeta visible; **clic aún no abre** el editor (flujo **pendiente** — ver **Recurso: Texto**). |
| 4 | **Embebido** | Panel enlace o código embebible (ver **Recurso: Embebido**). |
| 5 | **SCORM** | Modal **«Agregar SCORM»** (ver **Recurso: SCORM**). |
| 6 | **Evaluación final** | Constructor + panel IA (ver **Recurso: Evaluación final**). |
| 7 | **Encuesta libre** | Tarjeta visible; **clic sin flujo** (pendiente de producto). |
| 8 | **Encuesta de satisfacción** | Tarjeta visible; **clic sin flujo** (pendiente de producto; ver nota abajo). |

**Nota:** en el catálogo de tarjetas del design system pueden existir **otros tipos** (archivo descargable, certificado, imagen, etc.) que **no** forman parte de esta cuadrícula de ocho en el paso Recursos del prototipo actual.

*(Detalle de flujos implementados más abajo; encuestas y texto principal en estado **pendiente** o parcial.)*

---

## Recursos complementarios (secundarios)

### Relación con el recurso principal

- El **Resources block** (selector y formularios de la cuadrícula de ocho tipos) define el **recurso principal** de la página: al confirmarlo, el **icono de la fila** en el índice pasa al tipo correspondiente (video, PDF, SCORM, etc.).
- Los **recursos complementarios** son **opcionales** y **no cambian** ese icono: solo enriquecen la lección con material adicional.
- Tipos complementarios en el prototipo:
  - **Texto** — **Rich text editor** oficial (misma barra de herramientas que la descripción de portada: negrita, cursiva, subrayado, listas, alineación, imagen, video/enlace, código, quitar formato). **Sin título** encima del editor (ni «Contenido» ni «Texto complementario»).
  - **Archivo descargable** — **File Upload** oficial (`createFileUpload`, `successMessage: false`): PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, ZIP, RAR, TXT, CSV; hasta **256 MB**. **Sin título** sobre el uploader.

### Dónde aparece en pantalla

- Solo cuando la página ya tiene un **recurso principal montado** (no en el selector vacío ni en formularios intermedios tipo «PDF vacío» / «Video enlace» sin confirmar).
- El bloque vive **debajo** del área del recurso principal (`#crear-contenido-recursos-resources-mount`), en **`#crear-contenido-recursos-complementary-mount`**.
- Orden vertical:
  1. Recurso principal (video, PDF, SCORM, evaluación, etc.).
  2. Bloques complementarios **ya añadidos**, en el **orden en que se añadieron** (p. ej. primero descargable y luego texto, o al revés). Cada bloque: superficie blanca (contenido) + botón **Eliminar** **fuera** de esa superficie (mismo patrón que el recurso principal apilado).
  3. Bloque de invitación **«Añade un recurso complementario (opcional)»** con una o dos tarjetas según lo que aún falte.

### Variantes del bloque de invitación (componente Complementary resources)

| Variante | Cuándo se muestra |
|----------|-------------------|
| **Ambos** (`both`) | No hay texto ni descargable complementario; el principal **no** es Texto. |
| **Solo descargable** (`download-only`) | Ya hay texto complementario y falta el descargable; o el principal es **Texto** (no se ofrece otro texto). |
| **Solo texto** (`text-only`) | Ya hay descargable y falta el texto; el principal **no** es Texto. |
| *(ninguna)* | Ya están **ambos** complementarios → desaparece por completo la sección de invitación (solo quedan los bloques montados con su Eliminar). |

### Comportamiento al interactuar

| Acción | Resultado |
|--------|-----------|
| Clic en tarjeta **Texto** (invite) | Monta el bloque de texto (RTE completo, sin títulos) + **Eliminar** debajo. El bloque queda en la posición según orden de alta (`complementaryOrder` por página). Debajo sigue el invite si falta el otro tipo. |
| Clic en tarjeta **Archivo descargable** (invite) | Monta **File Upload** (dropzone, sin mensaje «Archivo validado…») + **Eliminar** debajo. Mismo criterio de orden. Debajo sigue el invite si falta texto. |
| **Eliminar** en un complementario | Quita solo ese bloque; el invite vuelve a ofrecer ese tipo. |
| **Eliminar recurso principal** | Vuelve el selector de tipos; **se ocultan** los complementarios de esa página. |
| Cambiar de página en el índice | Se **guardan** por página qué complementarios había y su **orden**; al volver se **restauran** (`CC_RECURSOS_PAGE_STATE`: `complementaryOrder`, flags derivados). |

### Reglas de producto (resumen)

- Ningún complementario es **obligatorio** para avanzar de paso (solo el **principal** cuenta para «página con recurso»).
- **Orden de bloques:** el orden visual es el de **alta**, no fijo «texto arriba, descargable abajo».
- **Sin títulos** en bloques montados (solo contenido + Eliminar externo).
- **Excepción texto:** si el principal de la página es **Texto**, el invite **nunca** muestra la tarjeta Texto complementario (solo descargable, hasta que se añada o se elimine el principal).
- **Excepción evaluación:** en páginas con recurso principal **Evaluación final** **no** se muestra nunca Complementary resources (ni invite ni bloques montados). El mount `#crear-contenido-recursos-complementary-mount` queda oculto; no se persisten flags complementarios en el estado de esa página.
- Referencia visual: Figma Creator v3 — *Secondary resources block* (node 40008346:29625); componente UBITS **Complementary resources** (`components/complementary-resources.js`, `documentacion/componentes/complementary-resources.html`).

---

## Recurso: Video

### Cómo se entra al flujo

- En el **selector de tipo de recurso** de la página, la persona elige la tarjeta **Video**.
- **No** aparece primero un formulario fijo en el panel derecho: se abre un **modal** titulado **«Agregar video»**, con el mismo **criterio visual que otros flujos con IA** del Creator (cabecera con gradiente, **saldo de tokens** con icono de información, modal ancho).
- Ese modal concentra **todas** las formas de aportar un video a la página: generación asistida por IA, enlace externo o archivo subido.

### Variante de modal en producción (decisión de producto)

Tras un **test A/B** entre dos experiencias de modal de video, el prototipo **cerró** a favor del modal **clásico** descrito en esta sección (**tres pestañas**: Video IA, enlace, subir; guión con modo **Generar con IA** / **Escribir manualmente** en la pestaña IA).

- **En pantalla hoy:** solo la tarjeta **Video** abre esa variante. **No** hay segunda tarjeta «Video 2» ni atajo desde **Encuesta de satisfacción**.  
- **Reserva:** existe en el repositorio una **variante alternativa** tipo **asistente por pasos** (avatar, guión en wizard, logo en pasos). Queda **sin disparador** en el selector hasta que producto la reactive. No debe documentarse como flujo activo para usuarios finales.

### Tres pestañas dentro del modal

El usuario puede cambiar en cualquier momento entre:

| Pestaña | Qué permite |
|---------|-------------|
| **Video IA** | Configurar un video **presentado por un avatar** y un **guión**, con ayuda de IA (tokens). |
| **Enlace de video** | Pegar la **URL** de un video ya publicado en internet. |
| **Subir video** | Elegir un **archivo de video** desde el equipo. |

El pie del modal muestra el botón que corresponde a la pestaña activa (por ejemplo **Generar video** en IA, **Cargar video** en enlace o subida).

### Pestaña «Video IA» (experiencia)

- **Presentador / avatar:** el usuario elige un **sector o categoría** (lista desplegable) y luego un **personaje** entre avatares disponibles; al seleccionar, ve una **vista previa** grande (imagen o clip de ejemplo según lo disponible en el prototipo).
- **Guión — cómo se define:** antes del texto largo del guión, la persona elige **un modo** mediante **dos tarjetas con radio** (mismo patrón que otros flujos del producto, p. ej. asignación en tareas): solo **icono + título + radio**, sin descripción debajo.
  - **Generar con IA** (opción por defecto): primero solo aparece el **contexto del tema** — área para describir de qué debe hablar el video y **adjuntos** (chips), más **Generar guión** (**80 créditos**). **No** hay segundo campo de guión hasta que el usuario genera; entonces aparece **debajo** el **guión generado** en un campo amplio **editable** (mínimo y máximo de caracteres según reglas en pantalla). Ese texto **solo vive** en esta subsección; **no** se copia al modo manual.
  - **Escribir manualmente:** solo se muestra **un** campo amplio para escribir el guión completo (mismos límites de caracteres). Es **independiente** del guión de IA: al cambiar de modo **no** se rellena con lo generado por IA; lo que el usuario escriba a mano **solo** aplica cuando ese modo está seleccionado.
  - **Qué cuenta para «Generar video»:** solo el modo **activo** y su buffer correspondiente (IA vs manual). Si está en manual, el texto del campo manual es el definitivo; si está en IA, el definitivo es el del campo de guión **después** de generar (o tras editarlo). Si intenta generar el video **sin** haber generado antes el guión en modo IA, el sistema lo orienta a **generar el guión** o a **cambiar a manual**.
- **Contexto del tema** (solo flujo IA): área de texto libre para describir **de qué debe hablar** el video (tema, tono, público). Opcionalmente puede **adjuntar archivos de referencia** (aparecen como chips que puede quitar).
- **Duración / expectations:** el prototipo puede mostrar un **aviso informativo** sobre duración u orientación del formato (se puede cerrar).
- **Logo de la empresa (opcional):** en la pestaña **Video IA**, zona de carga para un **PNG** (tamaño máximo comunicado en pantalla, p. ej. **2 MB**). Si se sube, el logo puede verse en la **vista previa** del modal y, tras generar, **superpuesto** en el reproductor del recurso. Quitar el archivo limpia el logo.
- **Generar video:** botón principal con **320 créditos** (cuatro veces el costo del guión). Al iniciarlo:
  - El modal puede **cerrarse** y el usuario ve el **panel de operaciones en curso** (esquina inferior izquierda) mientras el sistema procesa la generación.
  - En el **panel de la página** (no dentro del modal), el espacio del recurso muestra un **video placeholder en bucle** mientras dura la generación — **no** el componente **IA Loader**. Motivo de producto/backend: en la vista del recurso montado en la lección **no puede persistirse ni renderizarse un IA Loader**; debe mostrarse un **MP4 estático** hasta que llegue el video real.
  - Ese placeholder ocupa el **mismo hueco 16:9** que tendrá el reproductor final: **reproduce solo** (`autoplay`), **en loop**, **sin controles** visibles y **sin sonido** (política habitual de autoplay en navegadores). Para accesibilidad lleva etiqueta del tipo *«Generando video»*.
  - **Dentro del modal**, la generación del **guión** con IA **sí** sigue usando el **IA Loader** habitual (animación + texto *«Generando guión»*); la restricción aplica **solo** al estado de espera del video **ya montado en la página**.
  - Al terminar, el placeholder se sustituye por el **reproductor** con el resultado. Si el video es **generado por IA**, puede mostrarse la **etiqueta «Generado con IA»** y, si se cargó, el **logo** en el video.
- En el **playground**, la generación es **simulada** (tiempo de espera y video de ejemplo), pero la experiencia debe leerse como **producto real**: tokens, preview y panel de operaciones.

### Pestaña «Enlace de video»

- Campo para **pegar la URL** del video.
- Solo se aceptan enlaces de **proveedores compatibles** (los mismos que el producto defina para embed público, p. ej. YouTube, Vimeo, Google Drive, OneDrive).
- Validación en línea: si el enlace **no es válido**, el campo se marca en **error** y no se habilita **Cargar video** hasta corregirlo.
- **Cargar video** cierra el modal e inserta el **reproductor embebido** en el panel del recurso (formato panorámico **16:9**, esquinas redondeadas, controles del servicio).

### Pestaña «Subir video»

- Zona de **carga de archivo** con reglas de **formato y peso** máximo comunicadas en la propia UI.
- **Cargar video** confirma y cierra el modal; el panel muestra el **reproductor** con el archivo local.

### Después de confirmar (cualquier pestaña)

- El **panel derecho** deja de mostrar el selector de tipos y pasa a mostrar el **video** con el patrón de bloque apilado del Creator (**superficie** + pie con **Eliminar**).
- En el **índice de páginas**, el icono de la fila activa pasa a **video**.
- **Eliminar** abre el **modal de confirmación** (ver **Confirmación al eliminar un recurso ya añadido**); solo tras **Sí, eliminar** se quita el recurso y la página vuelve al selector de tipos.

### Si el modal no estuviera disponible (caso excepcional)

- El prototipo puede **degradarse** a un formulario **solo por enlace** embebido en el panel; es un respaldo, no el camino principal.

### Recursos complementarios

- Tras montar el video, debajo puede mostrarse el bloque **Complementary resources** (ver sección **Recursos complementarios**).

### Implementación técnica del placeholder de generación (playground)

> Detalle para desarrollo y port a React. Describe **solo** la fase «generando video IA» en el mount de la página (`#crear-contenido-recursos-resources-mount`), no el IA Loader del guión dentro del modal.

#### Restricción

- **En página:** prohibido usar `getIaLoaderHTML` / componente **IA Loader** como estado intermedio del recurso video IA.
- **En modal (guión):** el IA Loader **sí** se mantiene en `.cc-vm-guion-loader-host` mientras se genera el texto del guión.

#### Asset

| Recurso | Ruta en repo | Ruta relativa desde `lms-creator/` |
|---------|--------------|-------------------------------------|
| Video placeholder | `videos/ia-loaders/ia-loader-video.mp4` | `../../videos/ia-loaders/ia-loader-video.mp4` |

#### Markup y atributos

- Contenedor: `.cc-video-ia-loader-host` (aspect-ratio **16 / 9**, fondo `--ubits-bg-2`, esquinas redondeadas).
- Elemento: `<video class="cc-video-ia-placeholder-video">` con `src` al MP4 anterior.
- Atributos: **`autoplay`**, **`loop`**, **`muted`**, **`playsinline`**, **`preload="auto"`** — **sin** atributo **`controls`**.
- Accesibilidad: `aria-label="Generando video"` y `role="status"`.

#### Flujo en código (vanilla)

1. **`crear-contenido.js`** — clic en tarjeta **Video** → `openVideoRecursoModal({ ui: 'legacy', onVideoReady })`.
2. **`video-recurso-modal.js`** — al confirmar **Generar video**, `startWidgetJob()`:
   - Registra el trabajo en el **Status panel** (`ccGenWidget.addJob`).
   - Llama `onVideoReady` con el HTML del placeholder (`getVideoIaPlaceholderHTML()` envuelto en `.cc-video-ia-loader-host`).
   - Tras el timeout simulado (~15 s en playground), `onVideoReady` recibe el bloque final con reproductor (`buildRenderedBlock`).
3. **`crear-contenido.js`** — callback `onVideoReady`: `mount.innerHTML = html` y, si hay `.cc-video-ia-placeholder-video`, **`play()`** como respaldo (Safari tras insertar vía `innerHTML`).
4. **Estilos:** `video-recurso-modal.css` — `.cc-video-ia-loader-host` y `.cc-video-ia-placeholder-video` (`object-fit: cover`, `pointer-events: none`).

#### Persistencia al cambiar de página

- Mientras genera, el HTML del placeholder queda en **`CC_RECURSOS_PAGE_STATE[pageKey].html`** igual que cualquier otro recurso montado; al volver a esa fila del índice se restaura el placeholder o el video final según el momento del flujo.

#### Port a React

- Sustituir IA Loader en la **vista de página** por `<video>` con el mismo MP4 (copiado dentro de `Ubits-React/public/` o equivalente).
- Mantener **IA Loader** solo en la UX de **generación de guión** dentro del modal de video, salvo que backend indique lo contrario.

---

## Recurso: SCORM

### Cómo se entra al flujo

- En el selector de tipo de recurso, la persona elige **SCORM**.
- Se abre un **modal** titulado **«Agregar SCORM»**, con el mismo **criterio visual que otros flujos con IA** del Creator (cabecera con gradiente, **saldo de tokens** con icono de información, modal ancho).
- No hay formulario intermedio en el panel: **todo pasa por este modal** (o por la variante de subida de paquete en la segunda pestaña).

### Dos pestañas dentro del modal

| Pestaña | Qué permite |
|---------|-------------|
| **SCORM con IA** | Definir título, contexto para la IA, **tipos de diapositiva** a incluir, color corporativo y **generar** una presentación interactiva (consume tokens). |
| **Subir .zip** | Adjuntar un **paquete SCORM** ya existente (.zip) desde el equipo. |

El pie del modal muestra **Generar presentación** en la pestaña IA o **Cargar SCORM** en la pestaña de subida.

### Pestaña «SCORM con IA»

- **Título de la presentación** — obligatorio; en el prototipo, al generar, ese texto también puede **alinear el título de la página** en el índice con el mismo nombre.
- **Contexto para la IA** — área de texto obligatoria: la persona describe **equipo, industria o matiz** que debe considerar la generación. Puede **adjuntar archivos** (imágenes u otros documentos habituales); los adjuntos aparecen como **vistas previas** o **chips** que puede quitar.
- **Tipos de diapositiva** — lista en **dos columnas** (checkbox UBITS), en el **mismo orden** que el preview: **columna izquierda** = los **8 primeros** tipos (portada → … → pestañas); **columna derecha** = los **7 últimos** (tarjetas → … → **resumen** al cierre). Las **15** vienen **marcadas por defecto**; desmarcar = ese tipo no entra. **Portada** siempre incluida. **Una diapositiva por tipo** seleccionado, en ese orden. **Sin mínimo** de tipos (puede quedar solo portada). Los nombres visibles en el modal coinciden con las **etiquetas por defecto** de cada tipo en la presentación (ver siguiente subsección).
- **Color principal** — **muestra de color** (borde fino visible); al pulsarla se abre el **selector de color** UBITS para acentuar la presentación.
- **Logo de la empresa (opcional)** — carga de **PNG** (máximo indicado en UI, p. ej. **2 MB**). Tras generar, el logo aparece en la **primera diapositiva (portada)**, anclado a la **esquina superior derecha de la imagen de portada** (posición fija respecto al recorte 16:9, sin “bailar” al cambiar el ancho de pantalla).
- **Vista previa orientativa** — a la derecha, un **iframe** muestra cómo podría verse la navegación (barra de progreso, paso anterior/siguiente). El texto aclara que es **orientativa**: el contenido final usará el contexto, logo y estructura definidos al generar.

**Generar presentación** — botón con **15 créditos**. Si falta título o contexto, los campos se marcan para corrección. Al confirmar:

1. El modal se **cierra**.
2. Aparece el **panel de operaciones en curso** (misma familia que video IA) mientras el sistema procesa.
3. En el panel del recurso se muestra primero una **fase de carga** y, al terminar, el **SCORM embebido** (presentación a pantalla con navegación entre diapositivas).
4. En el prototipo, la generación es **simulada** en tiempo; el contenido base sigue una **plantilla pedagógica interna** (en el demo: narrativa tipo presentación sobre **conversaciones y estilos de afrontamiento al conflicto**, inspirada en el modelo **Thomas-Kilmann**). Producto puede sustituir o ampliar esa plantilla en una implementación real.

Si la generación es por IA, puede mostrarse la **etiqueta «Generado con IA»** sobre el embed. El **logo** y el **color** elegidos en el modal se **persisten** al guardar ediciones posteriores.

### Etiquetas (tags) en cada diapositiva

En casi todas las diapositivas (salvo la **portada**, que usa su propia **pastilla** bajo el título — p. ej. *Presentación interactiva · …* — editable aparte) aparece arriba una **pastilla pequeña** con **icono + texto**: es la **etiqueta del slide**.

| Nombre en el modal (checkbox) | Etiqueta por defecto en la diapositiva |
|-------------------------------|----------------------------------------|
| Portada | *(chip de portada, no la pastilla estándar)* |
| Lista viñetas | Lista viñetas |
| Lista ordenada | Lista ordenada |
| Cita | Cita |
| Dato clave | Dato clave |
| Texto e imagen | Texto e imagen |
| Imagen interactiva | Imagen interactiva |
| Acordeón | Acordeón |
| Pestañas | Pestañas |
| Tarjetas | Tarjetas |
| Línea de tiempo | Línea de tiempo |
| Comparativa | Comparativa |
| Quiz | Quiz |
| Emparejamiento | Emparejamiento |
| Resumen | Resumen |

**Reglas de producto:**

1. **Alineación modal ↔ presentación:** el texto del checkbox en **«Agregar SCORM»** es el mismo criterio que la etiqueta **por defecto** en la diapositiva de ese tipo (antes se usaban nombres distintos en pantalla — p. ej. «Contenido», «Multimedia», «Cronología» — y generaba confusión).
2. **Etiqueta temática en el contenido generado:** al generar con IA, cada diapositiva puede llevar una etiqueta **adaptada al tema** del demo o del contexto (p. ej. en una presentación sobre conflictos: **«Preparación»** en una slide de lista ordenada, **«Fundamentos»** en lista viñetas, **«Mapa del equipo»** en imagen interactiva). Eso **no** sustituye el tipo de slide: solo hace más legible el hilo narrativo. Si no hay etiqueta temática guardada, se muestra la **etiqueta del tipo** de la tabla.
3. **Vista consumo:** el alumno ve la etiqueta que quedó guardada (temática o por tipo).
4. **Edición:** en **«Editar presentación»**, la pastilla es **editable** (clic y escribir). Al **Guardar**, el texto se conserva en la presentación y en futuras ediciones. Si el usuario **borra** todo el texto de la etiqueta y guarda, al volver a mostrarse se **restaura la etiqueta del tipo** (la de la tabla).

En diapositivas **interactivas** (imagen con puntos, acordeón, pestañas, tarjetas, línea de tiempo, comparativa, quiz, emparejamiento), la pastilla comparte fila con el control **«Slide interactivo»** (icono de información con instrucciones de uso).

### Pestaña «Subir .zip»

- Zona para elegir un archivo **.zip** con límites de **tamaño** indicados en la UI (en el prototipo se admite un volumen grande tipo paquete corporativo).
- Tras la lectura del archivo, el usuario pulsa **Cargar SCORM** y el modal cierra; el panel muestra el paquete **embebido**. En el playground la vista puede apuntar a un **simulador** de ejemplo mientras no exista backend real.

### Una vez creado el recurso en el panel

- El bloque muestra el **SCORM a pantalla** y, si la ruta fue **generada con IA**, también el botón secundario **«Editar presentación»**.
- **Editar presentación** abre un **lightbox** a pantalla completa con la misma experiencia dentro de un **iframe** en **modo edición**:
  - **Etiqueta (tag)** de cada diapositiva — **editable** en la pastilla superior (icono + texto); ver **Etiquetas (tags) en cada diapositiva**.
  - **Textos** editables en las diapositivas (título, cuerpo, ítems, preguntas, hotspots, etc., según el tipo de slide).
  - **Color principal** modificable desde la cabecera del visor (muestra de color + selector UBITS).
  - **Cambiar imagen** en diapositivas que llevan imagen (control sobre la imagen de portada u otras según plantilla).
  - **Eliminar diapositiva:** en cada slide, botón de **papelera** en la esquina superior derecha del contenido (icono con tooltip **«Eliminar diapositiva»**). Al pulsarlo se abre un **modal de confirmación** («¿Estás seguro de eliminar la diapositiva **N**? Esta acción no se puede deshacer.»). **Cancelar** cierra; **Sí, eliminar** quita esa diapositiva y **renumera** el recorrido. Debe quedar **al menos una** diapositiva: si solo queda una, el botón de eliminar diapositiva queda **deshabilitado** (y un aviso breve si se intenta borrar la última).
  - **Guardar** aplica cambios (incluidas etiquetas, textos, color e imágenes) y vuelve al panel con el SCORM actualizado; **Cancelar** descarta lo editado en esa sesión del lightbox.
- **Eliminar** (pie del bloque en el panel de la página) usa el **modal de confirmación de recurso** (ver sección transversal); no borra el SCORM sin confirmar.
- En el **índice**, el icono de la página pasa a **SCORM**.

### Nota de producto

- La experiencia actual une **IA + plantilla de contenido + edición inline** para demos; una versión enterprise podría **importar ZIP reales**, validar manifiestos o enlazar con un **empaquetador SCORM** externo sin cambiar la narrativa de este documento.

---

## Recurso: Embebido

### Cómo se entra al flujo

- En el **selector de tipo de recurso**, la persona elige la tarjeta **Embebido**.
- El **Resources block** pasa a la variante oficial **Embebido · vacío**: campo para pegar un **enlace** o un **código embebible** (p. ej. `<iframe …>` de Google Slides, Genially, Canva, etc.) y botón **Cargar** deshabilitado hasta que haya texto.

### Comportamiento

| Paso | Qué ocurre |
|------|------------|
| **Pegar enlace o código** | Al escribir o pegar contenido, **Cargar** se habilita (mismo patrón que Embebido · relleno en el design system). |
| **Cargar** | Se renderiza el contenido en el panel de la página: si es **URL**, se muestra en un **iframe** a pantalla ancha; si es **código** con `<iframe>` (u objeto embebido), se inserta tal cual (sin scripts). Soporta distintos tamaños y proveedores (presentaciones, interactives, etc.). |
| **Cancelar** | Vuelve al selector de tipos sin recurso asignado. |
| **Eliminar** | Modal de confirmación; la página queda en blanco (igual que otros recursos). |

- En el **índice**, el icono de la página pasa a **embebido** al elegir el tipo o tras cargar.
- El estado del recurso **se guarda por página** al cambiar de lección en el índice (mismo criterio que PDF o video).

### Nota de producto

- No hay lista cerrada de dominios: cualquier URL o snippet **iframe** que el proveedor permita embeber puede mostrarse. Si el enlace no es embebible por políticas del sitio, el usuario verá el fallo del propio proveedor en el recuadro (variante **Embebido · no embebible** reservada para validaciones futuras).

---

## Recurso: PDF

### Experiencia de usuario

- El usuario **sube un PDF** desde el panel de recurso; ve una **barra de progreso** mientras se procesa y luego una **vista previa** donde las **páginas aparecen una debajo de otra** (lectura vertical), **sin** el panel lateral de miniaturas del visor nativo del navegador.
- **Eliminar** abre el **modal de confirmación** antes de volver al selector de tipos (la página queda en blanco tras confirmar).
- Si cambia de **página** en el índice del contenido y vuelve, la vista previa del PDF se **restaura** de forma coherente.

### Implementación técnica del visor (playground)

> Esta subsección es la **única parte técnica** de este documento: describe **cómo** se implementó la vista previa para desarrollo y mantenimiento.

#### Renderizador

- **PDF.js** (Mozilla **pdf.js**), no el visor PDF nativo del navegador ni un `<iframe src="blob:…">` sobre el archivo.
- Motivos: control total de la UI (sin panel lateral de miniaturas ni chrome propio del navegador), páginas **apiladas en vertical** y aplicación de **tokens UBITS** en fondos y bordes.

**Binarios en el repo:**

| Archivo | Rol |
|---------|-----|
| `vendor/pdfjs/pdf.min.js` | Biblioteca principal (expone `pdfjsLib` en `globalThis`). |
| `vendor/pdfjs/pdf.worker.min.js` | Worker; la ruta se resuelve en runtime (`GlobalWorkerOptions.workerSrc`) respecto a la página. |

**Orden de scripts en `crear-contenido.html`:** `pdf.min.js` → `crear-contenido-pdf-viewer.js` → `crear-contenido.js`.

#### Creación y montaje (playground)

1. **Resources block** — variante PDF + **file upload**; al elegir archivo se emite `ubits-resources-block-pdf-change` → el listener en `crear-contenido.js` llama a `finishCrearContenidoPdfRender` tras la barra de progreso simulada (`runCrearContenidoPdfUploadProgressAndRender`).
2. **`finishCrearContenidoPdfRender`** crea un `blob:` con `URL.createObjectURL`, pinta el **shell** HTML (`buildCrearContenidoPdfViewerShellHtml`) en `#crear-contenido-recursos-resources-mount` y guarda estado en `CC_RECURSOS_PAGE_STATE` para la página activa: `{ html: shell, pdfBlobUrl }`. Revoca el blob anterior si el usuario sube **otro PDF** en la misma página.
3. **`mountCrearContenidoPdfViewer(viewerRoot, blobUrl)`** (`crear-contenido-pdf-viewer.js`) ejecuta `pdfjsLib.getDocument({ url: blobUrl })` y renderiza **página a página en serie** cada `getPage(n)` en un `<canvas>` dentro de `.cc-pdf-resource__pdfjs-pages`, con escala según el ancho del contenedor (tope de escala para legibilidad).

#### Persistencia al cambiar de página del índice

- El HTML guardado es siempre el **shell** (loading + contenedor vacío de páginas), no el DOM con canvases ya rasterizados.
- Al hacer **snapshot** al salir de una página con PDF, si el mount contiene `[data-cc-pdf-js-viewer]`, se normaliza el HTML al shell y se conserva `pdfBlobUrl`.
- **`restoreRecursosPage`** vuelve a inyectar el HTML guardado, `initResourcesBlockFields` y **`mountCrearContenidoPdfViewer`** con el `blob:` almacenado.
- Antes de sustituir el mount por otro recurso, **`beforeReplaceRecursosMountIfPdfShowing`** revoca el `blob:` del estado de la página actual si había visor PDF (Eliminar / cambio de tipo).

#### Personalización visual UBITS (`crear-contenido.css`)

| Elemento | Tratamiento |
|----------|----------------|
| Área scroll del visor (`.cc-pdf-resource__viewer-wrap--pdfjs`) | Fondo **`var(--ubits-bg-3)`** para superficie de lectura coherente con el sistema. |
| Cada **canvas** (hoja renderizada) | Fondo **`var(--ubits-bg-3)`** para zonas transparentes del PDF; borde **`1px solid var(--ubits-border-1)`**; **`border-radius: var(--border-radius-lg)`** (16px en la escala de tokens). |
| Texto de carga / error | Tipografía y color de error UBITS en el shell. |
| Pie | Botón **Eliminar** alineado al mismo patrón que otros recursos apilados (video). |

#### Sincronización con el índice (técnico)

- Tras cargar el PDF, el título de la página puede alinearse con el **nombre del archivo**; el icono del índice pasa a **PDF**.

---

## Recurso: Texto

### Estado en el prototipo

- La tarjeta **Texto** aparece en el **selector de ocho tipos**, pero **pulsarla aún no monta** el flujo en el panel derecho.  
- Lo siguiente describe el **comportamiento objetivo** cuando el tipo esté cableado (alineado al design system).

### Comportamiento del panel derecho (objetivo)

- El panel derecho pasa a ser un **editor de texto enriquecido** (rich text).  
- Debajo del editor: botón **Eliminar** con **modal de confirmación** (mismo patrón que el resto de recursos).  
- Al cablear el flujo principal, el invite complementario usará variante **solo descargable** (no se ofrece otro texto en la misma página).  
- En el **índice**, el icono de la página pasa a **texto** al confirmar el recurso.

---

## Recurso: Encuesta libre

### Estado en el prototipo

- Tarjeta **Encuesta libre** en el selector (posición 7 de la cuadrícula).  
- **Clic sin acción:** no abre modal ni panel; flujo **pendiente** de definición de producto.

### Comportamiento objetivo (cuando exista)

- Misma familia que otros recursos: panel o modal según diseño, **Eliminar** con confirmación, icono de encuesta en el índice, estado **persistido por página** al cambiar de lección.

---

## Recurso: Encuesta de satisfacción

### Estado en el prototipo

- Tarjeta **Encuesta de satisfacción** en el selector (posición 8). Vuelve a mostrarse tras cerrar el test A/B de video (ya **no** abre la variante wizard de video).  
- **Clic sin acción:** flujo **pendiente** (antes se probó enlazarla a otra UI de video; descartado al ganar el modal clásico).

### Comportamiento objetivo (cuando exista)

- Encuesta específica de **satisfacción** (distinta de **Encuesta libre** en reglas y plantilla). Detalle de pantallas y validación por definir con producto.

---

## Recurso: Evaluación final

### Cómo se entra al flujo

- En el **selector de tipo de recurso**, la persona elige **Evaluación final**.
- **No** se abre antes un modal de datos: el **panel derecho** pasa directamente al **constructor de evaluación** de esa página (barra superior + lista de preguntas o estado vacío).
- En el **índice de páginas**, el icono de la fila activa pasa a **evaluación** en cuanto se confirma el tipo de recurso.
- El **panel lateral de IA** muestra el saldo de **tokens** con el mismo patrón que otros flujos Creator: **icono de información** asociado a la ayuda del saldo.
- **Sin recursos complementarios:** debajo del constructor **no** aparece el bloque Complementary resources (texto ni archivo descargable). Ver regla en **Recursos complementarios (secundarios)**.

### Barra superior del recurso

- Título de bloque: **Contenido de la evaluación**.
- **Eliminar** — abre el **modal de confirmación**; al confirmar, quita la evaluación de esa página y vuelve al selector de tipos.
- **Configuración** — abre un **modal** con los **ajustes de la evaluación**: porcentaje mínimo para aprobar, orden aleatorio de preguntas y de opciones, límites de intentos, tiempo máximo y número de preguntas por intento (cada uno con su interruptor y campos asociados cuando aplica). **Guardar** aplica los cambios y cierra; **Cancelar** descarta.
- **Generar con IA** — no genera dentro del panel central: abre el **panel lateral de IA** (misma familia visual que otros agentes del Creator: saldo de **tokens** con icono de información, hilo de mensajes, campo de envío). Ahí arranca el **agente de evaluaciones** guiado por mensajes y controles interactivos.

### Experiencia dentro del panel de IA

Al abrirse, el agente se presenta con un mensaje de bienvenida y pregunta **cómo** quiere crearse la evaluación. La persona elige entre dos caminos mediante **tarjetas**:

| Camino | Qué implica |
|--------|-------------|
| **Configuración estándar** | Valores por defecto del producto (p. ej. nota mínima habitual, sin límite de tiempo ni de intentos, cantidad y nivel predefinidos, orden aleatorio activado). A continuación el agente pide el **tema o material** (texto en el chat). |
| **Configurar desde cero** | Primero pide el **nombre de la evaluación**; ese nombre puede **sincronizarse** con el **título de la página** en el índice y con el campo de título del panel. Luego aparece un **asistente por pasos** (tipo “hoja inferior” con preguntas encadenadas) para **nota mínima**, **límite de tiempo** (o sin límite), **número de preguntas** y **nivel de dificultad**. Después el agente pide el **tema o material** como en el otro camino. |

En la ruta larga, cuando ya hay material, el agente puede pedir **qué tipos de pregunta** incluir (varias opciones a la vez: opción múltiple con una o varias correctas, verdadero/falso, texto cerrado, ensayo, emparejamiento, etc.).

Cuando el usuario termina el **asistente por pasos** de configuración (nota mínima, tiempo, cantidad de preguntas, nivel), el agente muestra en el hilo un mensaje que empieza por **«Configuración seleccionada:»** y debajo un **resumen en una línea** (porcentaje mínimo, tiempo si aplica, número de preguntas y nivel), antes de pedir el tema o material.

Tras recoger tema y reglas, el flujo llega a un **paso de confirmación** en el hilo: resumen de lo que se va a generar y un botón de acción con **80 créditos** (**Generar evaluación**). Si no hay créditos suficientes, el botón queda deshabilitado con el mensaje correspondiente.

### Qué ocurre al generar

- Se **cierra** el panel de IA (y cualquier modal auxiliar de ese flujo).
- En el área de preguntas aparece un **estado de carga** (misma línea visual que otros generadores con IA del Creator, p. ej. portada).
- Tras un tiempo de proceso (en el prototipo es **simulado**), el sistema **rellena la lista de preguntas** a partir de un **banco interno** de ítems alineados con un tema de negocio de referencia (en el demo: **resolución de conflictos y trabajo en equipo**), filtrados por **dificultad** y **tipos** elegidos. Las nuevas preguntas se **añaden después** de las que el usuario ya hubiera escrito a mano.
- Aparece un **aviso reversible** (`ubits-alert--ia`, con acción): texto del tipo «N preguntas generadas por IA» y botón **Deshacer**, que restaura solo el estado **previo** a esa generación. **No** se muestra badge «Generado con IA» en cada tarjeta de pregunta (el alert basta).

### Edición manual del builder

- El panel permite **añadir** preguntas con **Añadir pregunta** y **reordenarlas** con el menú **⋮** de cada tarjeta (**Mover arriba**, **Mover abajo**, **Eliminar**), mismo patrón que las páginas del índice creator.
- **Solo una pregunta está “abierta” para editar** a la vez; el resto se muestra de forma más compacta hasta que el usuario la selecciona.

### Cuándo se marca una pregunta como incompleta

- Una pregunta **no** aparece en error solo por estar vacía al crearla.
- La aplicación **valida cuando la persona deja de editar esa pregunta** (por ejemplo al pasar a otra pregunta o al añadir una nueva). Si faltan datos obligatorios, la tarjeta muestra **mensajes de error** y bordes de aviso según el diseño del componente de preguntas.
- Mientras la persona **corrige** la pregunta activa que estaba en error, el sistema puede **quitar el error** en cuanto los datos son válidos.

### Persistencia y cambio de página

- Cada **página del índice** tiene **su propia evaluación**: preguntas y configuración **no se mezclan** entre páginas.
- Al **cambiar de página** en el índice, si se abandona una página de evaluación, el prototipo **cierra el panel de IA** y el modal de configuración de evaluación si estaban abiertos, y **guarda** el estado de la página que se deja. Si se vuelve a una página que ya era de evaluación, se **reconstruye** el formulario con lo guardado.

### Nota de producto

- El prototipo combina **agente conversacional**, **formularios embebidos en el hilo** y **coste en créditos** compartido con el resto del Creator (ver tabla en **Créditos de IA**); una implementación con backend real sustituiría la simulación y el banco fijo por generación o catálogo remotos **sin cambiar** la narrativa de pantalla descrita.

---

## Pendiente de documentar (próximos mensajes)

- **Flujos a cablear en prototipo:** **Texto** (editor en panel), **Encuesta libre**, **Encuesta de satisfacción**.  
- **Visibilidad (paso 4):** lógica de cambio de estado, selección de colaboradores (Privado), acción **Publicar** y reglas de edición post-publicación.  
- Integración real con plantillas de **LMS Creator → Certificados** (hoy mock Fiqsha en memoria; el paso Certificado ya está documentado en detalle de producto).  
- Reglas de validación global (publicar, borradores, etc.) si aplica.  
- Detalle de **consumo** SCORM por tipo de diapositiva (quizzes, hotspots, emparejamiento) más allá del **costo fijo de 15 créditos** por generación ya descrito en **Recurso: SCORM**.  
- Si producto **reactiva** la variante wizard de video: documentar aquí como flujo alternativo o sustituto (hoy **reservada**, no expuesta).

---

## Migración a React (`Ubits-React`)

Al portar este flujo a páginas del playground React (`pages/ubits-colaborador/lms-creator/…`), **solo entra lo vigente en vanilla hoy**. No reutilizar variantes, modales ni props que ya se eliminaron del referente.

| Portar (oficial) | No portar (legacy eliminado) |
|------------------|------------------------------|
| `learn-content-img-trailer` con **vacío IA** (icono + título + descripción + CTA «Agregar portada») | Vacío clásico con **dos botones** («Generar portada con IA» + «Cargar imagen») |
| Modal único **`portada-imagen-modal`** (pestañas IA · Subir · Tráiler) desde el CTA y desde «Editar» | Modal `#portada-ai-modal`, panel IA standalone de portada, atajos directos a generar sin el modal con pestañas |
| Componente React `UbitsLearnContentImgTrailer` (catálogo `/componentes`) | Prop `emptyVariant` / `empty-variant`, variante delete del componente, componente `IAModal` de portada (retirado del playground React) |

**Fuente de verdad para el port:** `Referente-Vanilla/` en `main` (template-ubits), este documento, `documentacion/componentes/learn-content-img-trailer.html` y los archivos `crear-contenido.*` / `portada-imagen-modal.*` actuales — **no** commits antiguos, bocetos ni texto tachado de versiones previas.

**Regla:** si un patrón solo aparece en historial git o en conversaciones de migración, **no** debe contaminar el layout React.

---

## Notas para quien implemente

Este documento **no** sustituye la **documentación de componentes UBITS** ni las reglas del repositorio para desarrollo. Quien construya pantallas debe partir del catálogo oficial de componentes y de los patrones del Creator ya definidos en código.

- Cualquier cambio en **producto o UX** (incluidos **saldo inicial** y **costos por acción IA**) debe reflejarse aquí y en los archivos de constantes del playground para que PM, diseño y negocio sigan alineados.

---

*Última revisión: **Créditos de IA** — saldo inicial **500.000**; portada **50**, guión **80**, video **320**, evaluación **80**, SCORM **15** (pool compartido). **Video IA** — placeholder MP4 en página (sin IA Loader) + subsección técnica; IA Loader conservado solo para guión en modal. **Portada** — vacío IA + modal `portada-imagen-modal`. Paso **Visibilidad** / **Certificado**. **Complementary resources** (excluido en Evaluación final). **Recursos:** 8 tipos; persistencia por página.*
