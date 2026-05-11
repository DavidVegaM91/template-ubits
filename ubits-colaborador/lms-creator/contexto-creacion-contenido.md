# Contexto: creación de contenido (LMS Creator)

Documento de referencia sobre el flujo de **creación de contenido** en el módulo LMS Creator. Aquí **“contenido”** son los **formatos de aprendizaje** (curso, short, artículo, etc.), no un archivo suelto.

**Para quién es este documento:** personas de **producto, diseño, negocio** y cualquier lector que necesite entender **qué hace** el flujo y **cómo lo vive el usuario**, sin depender de nombres de código o archivos.

**Cómo está escrito:** lenguaje **conceptual** (pantallas, reglas, opciones, mensajes).  
**Excepción acordada:** dentro de **Recurso: PDF**, la subsección **«Implementación técnica del visor»** conserva el detalle técnico del renderizado para quien lo necesite en desarrollo.

**Objetivo:** que no queden dudas sobre el proceso de negocio y la experiencia en pantalla. Se irá ampliando con mensajes posteriores.

---

## Referencias de diseño

Los bocetos en herramienta de diseño fueron **exploratorios**. La referencia para alinear esfuerzos es **este documento**, la **documentación de componentes UBITS** y lo acordado con **producto**. No se enlazan archivos externos de diseño para evitar roturas cuando exista un diseño consolidado.

- **Creator (prototipo):** asistente por pasos (portada y recursos, entre otros) en una **pantalla dedicada** de creación.  
- **Paso Recursos (vacío):** panel izquierdo con índice + en el derecho un estado vacío que invita a crear la primera página.  
- **Paso Recursos (con página nueva):** a la derecha, **título editable** de la página y debajo el **bloque para elegir y configurar el tipo de recurso**.  
- **Índice:** interruptor de secciones (si aplica), listado de páginas, **Añadir página** / **Añadir sección**.  
- **Tarjetas de tipo de recurso** y **bloque de recurso:** el usuario elige entre tipos (video, PDF, texto, etc.) y completa el formulario que corresponda; si intenta avanzar sin haber completado una página, esa página puede mostrarse en **error** según las reglas del paso.  
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
| 2 | Recursos | Descrito en detalle (parcial: **contenido complementario** por recurso en mensajes futuros) |
| 3 | Certificado | Solo nombre de paso; detalle pendiente |
| 4 | Publicación | Solo nombre de paso; detalle pendiente |

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

Hoy el prototipo **no** reparte la configuración en varios botones sueltos dentro del hueco de la miniatura. Cuando **aún no hay imagen**, lo habitual es ver **un solo botón principal** del estilo **«Añadir portada»**. Al pulsarlo se abre un **modal grande** titulado **«Añadir portada»**, con el mismo **look & feel** que otros asistentes con IA del Creator (cabecera con gradiente, saldo de **tokens de IA** visible, pestañas claras).

**Tres formas de trabajar la portada (pestañas):**

1. **Portada con IA** — Mensaje inspirador (*tú lo imaginas…*) y un campo para **describir con palabras** la portada. El usuario pulsa **Generar portada**; cada generación **consume tokens**. La primera vez que genera, el modal **se ensancha** y aparece a un lado una **zona de vista previa**: primero un estado vacío amable, luego una **animación de “generando”**, después la **imagen resultante** (en el prototipo es una simulación con imagen de ejemplo y una espera corta). Puede **regenerar** otra imagen (de nuevo con coste en tokens) o pulsar **Usar esta imagen** para aplicarla a la portada.

2. **Subir portada** — El usuario **elige un archivo** de imagen desde su equipo. Los formatos y el **tamaño máximo** se comunican en la propia zona de carga. Confirma con **Usar esta imagen**.

3. **Tráiler (opcional)** — Campo para **pegar el enlace público** del video de promoción. Solo se admiten enlaces de ciertos proveedores (**YouTube, Vimeo, Google Drive, OneDrive**). El usuario puede **guardar el tráiler**; si ya tenía una imagen de portada, la miniatura se actualiza para poder **reproducir** el video sin tener que cerrar todo el flujo del modal principal.

**Después de confirmar una imagen** (generada o subida): la cabecera muestra la **foto de portada**. Si la imagen vino de IA, puede mostrarse una **etiqueta** tipo **«Generado con IA»**.

**Cuando ya hay imagen y solo quiere ajustar:** un control del tipo **«Cambiar»** abre un **segundo modal**, más **pequeño y directo**: en una sola pantalla puede sustituir **imagen** y/o **enlace del tráiler**, con **Confirmar** o **Cancelar**. Es el camino rápido para “retocar” sin pasar otra vez por las tres pestañas del modal grande; los límites de peso del archivo pueden **mostrarse distintos** a los del modal grande — lo relevante para negocio es que **cambiar** sea simple y en un solo paso.

**Vista previa en la cabecera:** si **no** hay tráiler, solo se ve la imagen; si **hay** tráiler, aparece un **botón de play** sobre la imagen y el video se reproduce **en el mismo espacio**, con los controles habituales del reproductor embebido según el origen del enlace.

### Regla para pasar al siguiente paso

- Debe estar **completo** todo lo obligatorio.  
- Lo **único opcional** en este paso es el **trailer** (y, por tanto, el comportamiento play/embebido asociado).

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
| **Derecha** | Previsualizador de recursos | Estado vacío si no hay páginas; con una página activa: **título editable** y debajo el **selector y configuración del recurso** (formulario o vista previa según el tipo). |

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

### Páginas

- Las **páginas** son las unidades que componen el contenido en el sentido de **lecciones** o pantallas de consumo.  
- **Icono en el índice:** mientras la página **no tiene aún un recurso principal**, la fila muestra el icono de **página en blanco**. Cuando el usuario **elige y confirma un tipo de recurso**, el icono debe **cambiar** al que corresponda (por ejemplo video o PDF). En el prototipo actual eso ya ocurre al menos para **Video** (vía modal) y **PDF**; el resto de tipos deberían seguir la misma lógica cuando existan.  
- **Selección:** al hacer **clic en una página**, esa fila queda activa y su **sección** queda resaltada frente al resto. Solo hay **una página activa** (y una sección activa) a la vez.  
- **Añadir una página** (equivalente en resultado; dos entradas):  
  1. **Empty state del panel derecho** (CTA cuando no hay páginas), **o**  
  2. Botón **«Añadir página»** en la parte inferior de **cada sección** (solo en la sección activa cuando hay secciones; en modo sin secciones, el botón del bloque único).  
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
  1. **Título de la página**, **editable inline** en el panel derecho (mismo criterio que el nombre en la fila del índice: al guardar o al perder foco debe mantenerse alineado con la etiqueta de la página activa en Páginas creator).  
  2. Debajo, el **bloque para elegir el tipo de recurso** (tarjetas de video, PDF, texto, etc.) según el diseño UBITS.

### Paso 3 — Certificado (validación al salir del paso 2)

Antes de permitir avanzar al **paso 3**, debe cumplirse:

1. **Ninguna página vacía:** toda página debe tener **al menos un recurso** asignado (definición de “vacía” = sin recursos).  
2. **Ninguna sección vacía** (solo aplica si **uso de secciones** está activo): toda sección debe tener **al menos una página**.

Si no se cumple, la interfaz debe **bloquear el avance** al siguiente paso y **marcar en rojo** lo que incumple la regla:

| Caso | Qué debe verse marcado |
|------|-------------------------|
| **Página sin recurso** | La **fila de esa página** en el índice (borde de error visible). |
| **Sección sin ninguna página** (solo si las secciones están activas) | El **bloque de esa sección** en el índice (borde de error visible). |

Los componentes visuales del índice ya contemplan ese estado de error; la pantalla debe activarlo cuando corresponda.

### Tipos de recurso (selector general)

El usuario elige el tipo mediante **tarjetas** y completa el **panel** que corresponda (formulario o vista previa). La documentación de **Resources card** y **Resources block** en el design system describe las variantes y estados.

### Distintivo IA en las tarjetas del bloque de recursos

- En la **cuadrícula de tarjetas** del selector, los tipos que incluyen **asistencia con IA** en el Creator llevan un **badge pequeño de IA**: variante **outlined** del sistema de insignias, **solo icono** (el mismo lenguaje visual que otros puntos de IA del producto), situado en la tarjeta para **destacar** ese tipo frente al resto.
- El distintivo tiene un **tooltip** al pasar el cursor (con un **retardo breve** para no molestar en movimientos rápidos): el texto informa de forma explícita que ese tipo **incluye asistencia con IA** (en el prototipo el mensaje por defecto es del estilo *«Incluye asistencia con IA.»*; producto puede afinar la redacción manteniendo el criterio).
- Los tipos **sin** flujo asistido por IA **no** muestran ese badge.
- En la versión actual del playground, el distintivo aplica a **Video**, **SCORM** y **Evaluación**: son los que ya exponen generación o agente asistido; si en el futuro otro tipo incorpora IA, puede adoptarse la misma convención.

Al configurar una página, el usuario puede añadir uno de estos tipos (presentados como cards en el Resources block o el patrón que defina producto):

1. Video — un **modal** reúne las opciones **Video IA**, **enlace** y **subir archivo** (ver sección **Recurso: Video**).  
2. PDF  
3. Texto  
4. Embebido  
5. Scorm — modal **«Agregar SCORM»** con pestañas **SCORM con IA** y **Subir .zip** (ver **Recurso: SCORM**).  
6. Evaluación final — **panel de recurso** + **panel lateral de IA** para generar preguntas (ver **Recurso: Evaluación final**).  
7. Encuesta libre  

*(Detalle de **Video**, **PDF**, **SCORM**, **Texto** y **Evaluación final** más abajo; el resto de tipos se irá ampliando.)*

---

## Recurso: Video

### Cómo se entra al flujo

- En el **selector de tipo de recurso** de la página, la persona elige la tarjeta **Video**.
- **No** aparece primero un formulario fijo en el panel derecho: se abre un **modal** titulado **«Agregar video»**, con el mismo **criterio visual que otros flujos con IA** del Creator (cabecera con gradiente, **saldo de tokens** visible, modal ancho).
- Ese modal concentra **todas** las formas de aportar un video a la página: generación asistida por IA, enlace externo o archivo subido.

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
  - **Generar con IA** (opción por defecto): primero solo aparece el **contexto del tema** — área para describir de qué debe hablar el video y **adjuntos** (chips), más **Generar guión** con coste en tokens. **No** hay segundo campo de guión hasta que el usuario genera; entonces aparece **debajo** el **guión generado** en un campo amplio **editable** (mínimo y máximo de caracteres según reglas en pantalla). Ese texto **solo vive** en esta subsección; **no** se copia al modo manual.
  - **Escribir manualmente:** solo se muestra **un** campo amplio para escribir el guión completo (mismos límites de caracteres). Es **independiente** del guión de IA: al cambiar de modo **no** se rellena con lo generado por IA; lo que el usuario escriba a mano **solo** aplica cuando ese modo está seleccionado.
  - **Qué cuenta para «Generar video»:** solo el modo **activo** y su buffer correspondiente (IA vs manual). Si está en manual, el texto del campo manual es el definitivo; si está en IA, el definitivo es el del campo de guión **después** de generar (o tras editarlo). Si intenta generar el video **sin** haber generado antes el guión en modo IA, el sistema lo orienta a **generar el guión** o a **cambiar a manual**.
- **Contexto del tema** (solo flujo IA): área de texto libre para describir **de qué debe hablar** el video (tema, tono, público). Opcionalmente puede **adjuntar archivos de referencia** (aparecen como chips que puede quitar).
- **Duración / expectations:** el prototipo puede mostrar un **aviso informativo** sobre duración u orientación del formato (se puede cerrar).
- **Generar video:** botón principal con **coste alto en tokens** respecto al guión. Al iniciarlo:
  - El modal puede **cerrarse** y el usuario ve un **indicador de progreso flotante** (estilo “trabajo en segundo plano”) mientras el sistema simula la generación.
  - En el panel de la página, el espacio del recurso muestra **estado de carga** y, al terminar, un **reproductor** con el resultado. Si el video es **generado por IA**, puede mostrarse la **etiqueta «Generado con IA»** y, si aplica en el flujo, **logo o marca** opcional que el usuario haya podido asociar en el modal.
- En el **playground**, la generación es **simulada** (tiempo de espera y video de ejemplo), pero la experiencia debe leerse como **producto real**: tokens, preview y widget de progreso.

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
- **Eliminar** quita el recurso y devuelve al **selector de tipos** de esa página.

### Si el modal no estuviera disponible (caso excepcional)

- El prototipo puede **degradarse** a un formulario **solo por enlace** embebido en el panel; es un respaldo, no el camino principal.

### Próximos pasos de producto

- **Contenido complementario** debajo del video (p. ej. tarjetas para añadir texto o archivo descargable), cuando producto lo defina.

---

## Recurso: SCORM

### Cómo se entra al flujo

- En el selector de tipo de recurso, la persona elige **SCORM**.
- Se abre un **modal** titulado **«Agregar SCORM»**, con el mismo **criterio visual que otros flujos con IA** del Creator (cabecera con gradiente, **saldo de tokens**, modal ancho).
- No hay formulario intermedio en el panel: **todo pasa por este modal** (o por la variante de subida de paquete en la segunda pestaña).

### Dos pestañas dentro del modal

| Pestaña | Qué permite |
|---------|-------------|
| **SCORM con IA** | Definir título, contexto para la IA, número de diapositivas, color corporativo y **generar** una presentación interactiva (consume tokens). |
| **Subir .zip** | Adjuntar un **paquete SCORM** ya existente (.zip) desde el equipo. |

El pie del modal muestra **Generar presentación** en la pestaña IA o **Cargar SCORM** en la pestaña de subida.

### Pestaña «SCORM con IA»

- **Título de la presentación** — obligatorio; en el prototipo, al generar, ese texto también puede **alinear el título de la página** en el índice con el mismo nombre.
- **Contexto para la IA** — área de texto obligatoria: la persona describe **equipo, industria o matiz** que debe considerar la generación. Puede **adjuntar archivos** (imágenes u otros documentos habituales); los adjuntos aparecen como **vistas previas** o **chips** que puede quitar.
- **Número de slides** — control tipo “pasos” con un **mínimo y máximo** permitidos en pantalla (el prototipo trabaja en un rango acotado, p. ej. entre **5 y 15** diapositivas).
- **Color principal** — selector visual (**muestra de color**); al pulsarlo se abre el **selector de color** del sistema de diseño para acentuar la presentación.
- **Vista previa orientativa** — a la derecha, un **iframe** muestra cómo podría verse la navegación (barra de progreso, paso anterior/siguiente). El texto aclara que es **orientativa**: el contenido final usará el contexto y la estructura definidos al generar.

**Generar presentación** — botón con **coste en tokens**. Si falta título o contexto, los campos se marcan para corrección. Al confirmar:

1. El modal se **cierra**.
2. Aparece un **indicador de progreso flotante** (misma familia que video IA) mientras el sistema procesa.
3. En el panel del recurso se muestra primero una **fase de carga** y, al terminar, el **SCORM embebido** (presentación a pantalla con navegación entre diapositivas).
4. En el prototipo, la generación es **simulada** en tiempo; el contenido base sigue una **plantilla pedagógica interna** (en el demo: narrativa tipo presentación sobre **conversaciones y estilos de afrontamiento al conflicto**, inspirada en el modelo **Thomas-Kilmann**). Producto puede sustituir o ampliar esa plantilla en una implementación real.

Si la generación es por IA, puede mostrarse la **etiqueta «Generado con IA»** sobre el embed.

### Pestaña «Subir .zip»

- Zona para elegir un archivo **.zip** con límites de **tamaño** indicados en la UI (en el prototipo se admite un volumen grande tipo paquete corporativo).
- Tras la lectura del archivo, el usuario pulsa **Cargar SCORM** y el modal cierra; el panel muestra el paquete **embebido**. En el playground la vista puede apuntar a un **simulador** de ejemplo mientras no exista backend real.

### Una vez creado el recurso en el panel

- El bloque muestra el **SCORM a pantalla** y, si la ruta fue **generada con IA**, también el botón secundario **«Editar presentación»**.
- **Editar presentación** abre un **segundo modal** a pantalla completa con la misma experiencia dentro de un **iframe**: la persona puede **cambiar textos** en las diapositivas y el **color principal** desde controles integrados; **Guardar** vuelve al panel con los cambios; **Cancelar** descarta.
- **Eliminar** quita el SCORM y devuelve al **selector de tipos**.
- En el **índice**, el icono de la página pasa a **SCORM**.

### Nota de producto

- La experiencia actual une **IA + plantilla de contenido + edición inline** para demos; una versión enterprise podría **importar ZIP reales**, validar manifiestos o enlazar con un **empaquetador SCORM** externo sin cambiar la narrativa de este documento.

---

## Recurso: PDF

### Experiencia de usuario

- El usuario **sube un PDF** desde el panel de recurso; ve una **barra de progreso** mientras se procesa y luego una **vista previa** donde las **páginas aparecen una debajo de otra** (lectura vertical), **sin** el panel lateral de miniaturas del visor nativo del navegador.
- Puede **eliminar** el recurso y volver al selector de tipos.
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

### Comportamiento del panel derecho

- El panel derecho pasa a ser un **editor de texto enriquecido** (rich text).  
- Debajo del editor: botón **Eliminar** (coherente con el resto de recursos).  
- Debajo: sección de **contenido complementario**; en este recurso **solo** se ofrece **Archivo descargable** (no la card de Texto, para evitar anidaciones no deseadas o según regla de producto ya definida).

---

## Recurso: Evaluación final

### Cómo se entra al flujo

- En el **selector de tipo de recurso**, la persona elige **Evaluación final**.
- **No** se abre antes un modal de datos: el **panel derecho** pasa directamente al **constructor de evaluación** de esa página (barra superior + lista de preguntas o estado vacío).
- En el **índice de páginas**, el icono de la fila activa pasa a **evaluación** en cuanto se confirma el tipo de recurso.

### Barra superior del recurso

- Título de bloque: **Contenido de la evaluación**.
- **Eliminar** — quita el recurso de evaluación de esa página y vuelve al selector de tipos (coherente con otros recursos).
- **Configuración** — abre un **modal** con los **ajustes de la evaluación**: porcentaje mínimo para aprobar, orden aleatorio de preguntas y de opciones, límites de intentos, tiempo máximo y número de preguntas por intento (cada uno con su interruptor y campos asociados cuando aplica). **Guardar** aplica los cambios y cierra; **Cancelar** descarta.
- **Generar con IA** — no genera dentro del panel central: abre el **panel lateral de IA** (misma familia visual que otros agentes del Creator: saldo de **tokens**, hilo de mensajes, campo de envío). Ahí arranca el **agente de evaluaciones** guiado por mensajes y controles interactivos.

### Experiencia dentro del panel de IA

Al abrirse, el agente se presenta con un mensaje de bienvenida y pregunta **cómo** quiere crearse la evaluación. La persona elige entre dos caminos mediante **tarjetas**:

| Camino | Qué implica |
|--------|-------------|
| **Configuración estándar** | Valores por defecto del producto (p. ej. nota mínima habitual, sin límite de tiempo ni de intentos, cantidad y nivel predefinidos, orden aleatorio activado). A continuación el agente pide el **tema o material** (texto en el chat). |
| **Configurar desde cero** | Primero pide el **nombre de la evaluación**; ese nombre puede **sincronizarse** con el **título de la página** en el índice y con el campo de título del panel. Luego aparece un **asistente por pasos** (tipo “hoja inferior” con preguntas encadenadas) para **nota mínima**, **límite de tiempo** (o sin límite), **número de preguntas** y **nivel de dificultad**. Después el agente pide el **tema o material** como en el otro camino. |

En la ruta larga, cuando ya hay material, el agente puede pedir **qué tipos de pregunta** incluir (varias opciones a la vez: opción múltiple con una o varias correctas, verdadero/falso, texto cerrado, ensayo, emparejamiento, etc.).

Tras recoger tema y reglas, el flujo llega a un **paso de confirmación** en el hilo: resumen de lo que se va a generar y un botón de acción con **coste en tokens** (**Generar evaluación**). Si no hay tokens suficientes, el botón queda deshabilitado con el mensaje correspondiente.

### Qué ocurre al generar

- Se **cierra** el panel de IA (y cualquier modal auxiliar de ese flujo).
- En el área de preguntas aparece un **estado de carga** (misma línea visual que otros generadores con IA del Creator, p. ej. portada).
- Tras un tiempo de proceso (en el prototipo es **simulado**), el sistema **rellena la lista de preguntas** a partir de un **banco interno** de ítems alineados con un tema de negocio de referencia (en el demo: **resolución de conflictos y trabajo en equipo**), filtrados por **dificultad** y **tipos** elegidos. Las nuevas preguntas se **añaden después** de las que el usuario ya hubiera escrito a mano.
- Aparece un **aviso reversible** (banner) del estilo “preguntas generadas por IA” con acción **Deshacer**, que restaura solo el estado **previo** a esa generación.

### Edición manual del builder

- El panel permite **añadir** preguntas con **Añadir pregunta** y **ordenar** según el diseño del componente de preguntas.
- **Solo una pregunta está “abierta” para editar** a la vez; el resto se muestra de forma más compacta hasta que el usuario la selecciona.

### Cuándo se marca una pregunta como incompleta

- Una pregunta **no** aparece en error solo por estar vacía al crearla.
- La aplicación **valida cuando la persona deja de editar esa pregunta** (por ejemplo al pasar a otra pregunta o al añadir una nueva). Si faltan datos obligatorios, la tarjeta muestra **mensajes de error** y bordes de aviso según el diseño del componente de preguntas.
- Mientras la persona **corrige** la pregunta activa que estaba en error, el sistema puede **quitar el error** en cuanto los datos son válidos.

### Persistencia y cambio de página

- Cada **página del índice** tiene **su propia evaluación**: preguntas y configuración **no se mezclan** entre páginas.
- Al **cambiar de página** en el índice, si se abandona una página de evaluación, el prototipo **cierra el panel de IA** y el modal de configuración de evaluación si estaban abiertos, y **guarda** el estado de la página que se deja. Si se vuelve a una página que ya era de evaluación, se **reconstruye** el formulario con lo guardado.

### Nota de producto

- El prototipo combina **agente conversacional**, **formularios embebidos en el hilo** y **coste en tokens** compartido con el resto del Creator; una implementación con backend real sustituiría la simulación y el banco fijo por generación o catálogo remotos **sin cambiar** la narrativa de pantalla descrita.

---

## Pendiente de documentar (próximos mensajes)

- Detalle de **contenido complementario** en todos los recursos donde aplique.  
- Flujos de: **Embebido**, **Encuesta libre**. (**Video**, **PDF**, **SCORM** y **Evaluación final** documentados arriba.)  
- Paso **3 — Certificado** (contenido de pantalla más allá de la regla de bloqueo desde paso 2).  
- Paso **4 — Publicación**.  
- Reglas de validación global (publicar, borradores, etc.) si aplica.

---

## Notas para quien implemente

Este documento **no** sustituye la **documentación de componentes UBITS** ni las reglas del repositorio para desarrollo. Quien construya pantallas debe partir del catálogo oficial de componentes y de los patrones del Creator ya definidos en código.

- Cualquier cambio en **producto o UX** debe reflejarse aquí para que PM, diseño y negocio sigan alineados.

---

*Última revisión: documento pasado a tono **conceptual** (sin rutas de archivo ni código, salvo la subsección técnica acordada). Detalle de implementación **solo** en **Recurso: PDF → Implementación técnica del visor**. Secciones **SCORM** y **Evaluación final** ampliadas: la evaluación entra por tarjeta al panel del recurso y la **IA** se opera desde el **panel lateral** (agente, rutas estándar / avanzada, tokens y generación simulada desde banco temático). Añadido **distintivo IA + tooltip** en el selector de tipos de recurso (Video, SCORM, Evaluación).*
