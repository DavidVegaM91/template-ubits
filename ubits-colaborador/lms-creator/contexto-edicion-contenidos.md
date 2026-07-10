# Contexto: edición de contenido publicado (LMS Creator)

Documento de referencia sobre el flujo de **edición de contenido ya publicado** (o con visibilidad distinta de Borrador) en el módulo LMS Creator.

**Para quién es este documento:** personas de **producto, diseño, negocio** y cualquier lector que necesite entender **qué hace** el flujo y **cómo lo vive el usuario**, sin depender solo de nombres de código.

**Cómo está escrito:** lenguaje **conceptual** (pantallas, reglas, opciones, mensajes). Donde haga falta detalle técnico para implementación, se indica en subsecciones.

**Documento hermano:** [`contexto-creacion-contenido.md`](./contexto-creacion-contenido.md) — describe el asistente de **creación** (4 pasos con stepper vertical). Este documento describe la experiencia de **edición**, que reutiliza gran parte de la misma UI pero con reglas distintas.

**Objetivo:** dejar claro cuándo entra cada flujo, qué ve el usuario y qué **no** puede hacer en edición, antes de implementar la pantalla en vanilla y portarla a React.

---

## Resumen ejecutivo

| Visibilidad del contenido | Dónde entra el usuario | Experiencia |
|-------------------------|------------------------|-------------|
| **Borrador** | Lista **Contenidos** | **`crear-contenido.html`** con datos **prellenados** (misma vista de creación; paso Visibilidad con **Borrador** seleccionado). Sigue siendo un contenido **en construcción**, no la vista de edición publicada. |
| **Público**, **Privado** u **Oculto** | Lista **Contenidos** | **`editar-contenido.html`** — vista de edición con **sidebar lateral** (no stepper) y restricciones para no romper el progreso de estudiantes. |
| **Archivado** | Lista **Contenidos** | **`editar-contenido.html` en modo solo lectura** — misma estructura visual, sin permitir guardar cambios. |
| **Antiguo LMS** | Lista **Contenidos** | Flujo aparte ya prototipado (drawer + sidebar variante `publicado-antiguo-lms`). **Fuera de alcance** de este documento salvo notas de convivencia. |

---

## Entrada desde la lista de contenidos

### Crear contenido nuevo

- Botón **«Crear contenido»** → `crear-contenido.html` (flujo vacío, Borrador por defecto). Sin cambios respecto a [`contexto-creacion-contenido.md`](./contexto-creacion-contenido.md).

### Abrir un contenido existente

La decisión de flujo depende del campo de negocio **`visibilidadLms`** (en mock: `bd-contenidos-fiqsha.js`, clave `contentsCreatorOnly` / contenidos Creator).

| `visibilidadLms` | Acción al abrir desde Contenidos |
|------------------|----------------------------------|
| **Borrador** | Navegar a **`crear-contenido.html?id={contentId}`** y **precargar** portada, recursos, certificado y visibilidad = Borrador. El usuario continúa **creando** hasta publicar. |
| **Público** | **`editar-contenido.html?id={contentId}`** — edición completa (con restricciones de Recursos). |
| **Privado** | **`editar-contenido.html?id={contentId}`**. La audiencia (**colaboradores seleccionados**) ya debe venir **cargada** en Visibilidad. |
| **Oculto** | **`editar-contenido.html?id={contentId}`**. |
| **Archivado** | **`editar-contenido.html?id={contentId}&readonly=1`** (o flag equivalente) — **solo lectura**: se ve la información, recursos, certificado y visibilidad, pero **no** se pueden modificar ni guardar cambios. |

**Regla de enrutamiento (cuadrícula y tabla):** la misma lógica de clic aplica en **vista cuadrícula** y **vista tabla** en `contenidos.html` / `contenidos.tsx`: según `visibilidadLms` → `crear-contenido` (Borrador) o `editar-contenido` (resto, con readonly si Archivado).

**Quién puede editar:** en producto hay **3 roles principales** — **Admin**, **Creador** y **Estudiante**. Tanto **Admin** como **Creador** pueden abrir y editar contenidos en LMS Creator. **Estudiante** no tiene acceso a este flujo (solo consume contenidos). En el playground no hay RBAC real; se asume usuario con rol Admin o Creador.

**Pin al volver a Contenidos:** después de **crear** o **editar** un contenido y regresar a la lista, ese ítem debe aparecer **en primer lugar** (cuadrícula y tabla). Mismo patrón que hoy al publicar desde `crear-contenido` vía `sessionStorage` (`ubits-contenidos-pin-recien-creado` en `contenidos.html`); al salir de **`editar-contenido.html`** se debe aplicar la misma lógica de pin (reutilizar la clave existente o una equivalente `ubits-contenidos-pin-recien-editado` con el `id` del contenido).

**Nota playground (estado actual):** en `contenidos.html` los ítems en **Borrador** abren hoy un **drawer** de prototipo. La dirección acordada es **sustituir** ese atajo por la navegación a **`crear-contenido.html` prellenado** (no usar la vista de edición publicada para borradores).

---

## Visión general: edición vs creación

### Qué comparten

- Misma **familia visual**: layout inmersivo (cabecera fija, zona de trabajo, pie si aplica), tokens UBITS y componentes Creator (portada, índice de páginas, bloques de recurso, certificado, tarjetas de visibilidad).
- Al entrar a edición, el contenido ya está **completo** respecto al mínimo de publicación:
  - **Portada / información:** todos los campos **obligatorios** ya tienen valor.
  - **Recursos:** todas las **páginas** existen y **cada una tiene su recurso principal** montado (no hay páginas vacías en edición).
  - **Certificado:** el switch y la **plantilla** ya están elegidos (si el certificado estaba habilitado en creación).
  - **Visibilidad:** ya hay un estado seleccionado (**Público**, **Privado**, **Oculto** o **Archivado** en solo lectura); no Borrador.

### Qué cambia (diferencias cruciales)

| Aspecto | Creación (`crear-contenido`) | Edición (`editar-contenido`) |
|---------|------------------------------|------------------------------|
| **URL** | `crear-contenido.html` | **`editar-contenido.html?id={contentId}`** |
| **Navegación lateral** | **Stepper vertical** (4 pasos: Portada → Recursos → Certificado → Visibilidad) | **Sidebar contenidos LMS** (`loadSidebarContenidosLms`, variante **`publicado-lms-creator`**) |
| **Primer ítem lateral** | Portada | **Resultados** *(no existe en creación)* |
| **Siguiente ítem** | Recursos | **Información** *(equivalente funcional a Portada)* |
| **Resto de ítems** | Certificado, Visibilidad | Recursos, Certificado, Visibilidad |
| **Añadir / eliminar páginas y secciones** | Permitido (con confirmaciones) | **No permitido** — acciones **ocultas** |
| **Reordenar páginas y secciones** | Permitido | **Sí permitido** (solo reordenar; no eliminar) |
| **Interruptor «usar secciones»** | Visible y editable | **No se muestra** — el modo con/sin secciones queda **fijado** según cómo se publicó |
| **Eliminar recurso principal** | Permitido (modal) | Botón **Eliminar** **deshabilitado** en todos los recursos principales |
| **Reemplazar recurso principal** | Flujo de alta | **Mismos modales** que en creación (video, PDF, SCORM, etc.) |
| **Recursos complementarios** | Añadir / editar / eliminar | **Sí** — añadir, editar y eliminar permitidos |
| **Descargar recurso principal** | No aplica | Botón **Descargar** — un solo archivo por tipo (ver tabla abajo) |
| **Modal al entrar a Recursos** | No | **Sí**, solo la **primera vez por sesión** que entra a Recursos |
| **Indicador de guardado** | `SaveIndicator` | **El mismo** `SaveIndicator` que en creación |
| **Cambios visibles para estudiantes** | No (aún no publicado) | **Sí, de forma inmediata** al guardar (mensaje del modal) |
| **Archivado** | N/A en creación activa | Vista **solo lectura** |

---

## Layout de la vista de edición

### Shell

- Misma **cáscara inmersiva** que `crear-contenido.html` (`layout-immersive.css`, `body.page-layout-immersive`): cabecera con título del contenido, **tag de visibilidad** actual y **`SaveIndicator`** (mismo componente que creación).
- **No** usar el stepper vertical de creación en la columna izquierda.
- **Modo Archivado (solo lectura):** deshabilitar inputs, botones de guardado y acciones destructivas; el sidebar sigue permitiendo **navegar** entre secciones para **consultar**.

### Sidebar lateral — Sidebar contenidos LMS

Componente: **Sidebar contenidos LMS** (`components/sidebar-contenidos-lms.js` + CSS).

**Variante:** `publicado-lms-creator` (orden oficial del componente):

| Orden | `id` interno | Etiqueta en UI | Icono (referencia) |
|-------|--------------|----------------|---------------------|
| 1 | `resultados` | **Resultados** | `fa-chart-mixed` |
| 2 | `informacion` | **Información** | `fa-circle-info` |
| 3 | `recursos` | **Recursos** | `fa-layer-group` |
| 4 | `certificado` | **Certificado** | `fa-award` |
| 5 | `visibilidad` | **Visibilidad** | `fa-eye` |

**Comportamiento:** rail colapsable, tooltips, botón **Expandir** en el pie. Cambio de sección **solo por el sidebar** (sin pie Anterior/Siguiente entre pasos, como en el drawer Antiguo LMS).

**Sección activa vía URL (opcional):** `editar-contenido.html?id={contentId}#recursos` para abrir directo en Recursos (el modal de advertencia aplica igual si es la primera visita a Recursos en la sesión).

**Primer ítem exclusivo de edición:** **Resultados** — dashboard de métricas y tablas por estudiante (spec completa en sección [Resultados](#sección-resultados)).

### Área principal

- Misma lógica de **dos paneles** en **Recursos** que en creación (índice izquierda + previsualizador derecha), con las **restricciones** de edición descritas abajo.
- **Información:** mismos campos que el paso **Portada** de creación, ya rellenos.
- **Certificado** y **Visibilidad:** mismos patrones que los pasos 3 y 4 de creación, con datos iniciales del contenido.

---

## Sección: Resultados

**Solo en edición** (no aparece en `crear-contenido`). Rehacer la UI de producción (referencia visual fea en screenshot legacy) usando componentes UBITS del playground: **`Tab`**, **`UbitsDataTable`** / `createUbitsDataTable`, **`EmptyState`**, **`ProgressBar`**, **`UbitsInput`**, **`UbitsButton`**, **`UbitsChip`** (filtro de periodo si aplica), indicadores tipo seguimiento, **`showToast`** para confirmaciones.

**Referencia producción (solo estructura y copy, no estilos):** pantalla «Testing evaluaciones» con sidebar Resultados activo, cabecera de contenido, KPIs, tabs y tablas.

### Cabecera de la sección

| Elemento | Copy / comportamiento |
|----------|----------------------|
| **Título** | Nombre del contenido (ej. `Testing evaluaciones`) — mismo título que en cabecera inmersiva o repetido en el panel. |
| **Descripción** | `Consulta los resultados, el progreso, las evaluaciones y encuestas de este contenido. La información se actualiza cada 3 horas.` |
| **Filtro de periodo** (derecha) | Dropdown con rango temporal. **Afecta el KPI de Finalización y las tres tablas visibles** (Progreso, Evaluaciones, Gestión de intentos). Valor por defecto **`Últimos 30 días`**. Opciones (mismas que seguimiento): `Últimos 7 días`, `Últimos 15 días`, `Últimos 30 días`, `Últimos 3 meses`, `Últimos 6 meses` (+ rango personalizado si el componente lo soporta). Icono calendario `far fa-calendar`. |
| **Meta fila** | **`Estudiantes inscritos`** + número (`formatIndicatorNumber`). **`Publicado el`** + fecha larga en español (ej. `6 de julio de 2026`). **`Visibilidad actual:`** + **status tag** del estado (Público / Privado / Oculto / Archivado) — el tag solo aquí en meta, **no** en celdas de tablas. |

**Regla de fechas:** la **fecha de inicio** de estudio de un estudiante **no puede ser posterior** a la **fecha de publicación** del contenido.

### Tarjeta KPI (fila superior)

**Una sola tarjeta** — no incluir «Índice de satisfacción» (recurso legacy eliminado del producto; las encuestas pasan a ser recursos libres del autor).

| KPI | Copy label | Valor ejemplo | Notas |
|-----|------------|---------------|-------|
| **Finalización** | `Finalización` | `0/1 \| 0%` | Completados / inscritos en el **periodo seleccionado** + barra de progreso agregada + icono info (`far fa-circle-info`) con tooltip si producto lo define. |

### Tabs (orden y visibilidad)

Componente **`Tab`** UBITS. **Orden fijo:**

| # | `id` sugerido | Etiqueta en UI | Visible | Contenido |
|---|---------------|----------------|---------|-----------|
| 1 | `progreso` | **Progreso** | ✅ Sí | Data table de progreso por estudiante *(en producción legacy se llamaba «Estudiantes»; renombrar a **Progreso**)*. |
| 2 | `evaluaciones` | **Evaluaciones** | ✅ Sí | Data table de notas por evaluación del contenido. |
| 3 | `encuestas` | **Encuestas** | ❌ **Oculto** | No renderizar tab ni panel hasta definir spec. |
| 4 | `gestion-intentos` | **Gestión de intentos** | ✅ Sí | Data table de bloqueos por evaluación + acciones de desbloqueo. |

**Tab activo por defecto al entrar:** **Progreso**.

### Patrón común de tablas

- **`createUbitsDataTable`** (o composición equivalente) en cada tab visible.
- **Buscador** arriba de la tabla; placeholder por tab: **`Busca un estudiante`** (mismo copy en los tres tabs visibles salvo que producto indique otro).
- **Empty state** cuando no hay filas (curso de prueba sin estudiantes): componente **`EmptyState`** del DS — **no** reutilizar el empty feo de producción.
- Celdas de datos: **texto plano** en `<td>` — **prohibido** `status-tag` / badges dentro de las tablas (solo texto; el estado «Aprobado» / «Fallido» / «Pendiente» va como copy en la celda).
- Números en KPI y columnas numéricas: **`formatIndicatorNumber`** donde aplique cantidades; porcentajes y fechas según reglas abajo.
- **Exportar CSV** (alcance v1): botón en la toolbar de cada tab visible que exporta las **filas visibles** de esa tabla (respetando búsqueda + filtro de periodo). Label: **`Exportar CSV`** (`secondary` + icono `far fa-file-export` o equivalente DS). **Nombre del archivo:** `{tab}-{id-contenido}-{rango-de-fechas}.csv` — ej. `progreso-f007-ultimos-30-dias.csv`. Prefijo `{tab}`: `progreso`, `evaluaciones`, `gestion-intentos`. `{rango-de-fechas}`: slug del periodo activo (`ultimos-7-dias`, `ultimos-30-dias`, `ultimos-3-meses`, …) o `YYYY-MM-DD_YYYY-MM-DD` si es rango personalizado.

---

### Tab 1 — Progreso

**Columnas:**

| Columna | Contenido de la celda |
|---------|------------------------|
| **Nombre** | Nombre del estudiante. |
| **Email** | Correo del estudiante. |
| **Fecha de inicio** | Fecha en que comenzó el contenido. ≤ fecha de publicación del curso. |
| **Fecha de finalización** | Fecha en que terminó el contenido, o el texto fijo **`No ha finalizado`** si aún no completó. |
| **Progreso** | **`ProgressBar`** UBITS + **porcentaje numérico al lado** (ej. barra al 45% y texto `45%`). |

---

### Tab 2 — Evaluaciones

Las columnas de evaluación son **dinámicas**: una por cada evaluación definida en el contenido (en el ejemplo de producción: Parcial 1, Parcial 2, Final — en Creator vendrán del título de cada recurso evaluación + su **peso %**).

**Columnas fijas:**

| Columna | Contenido |
|---------|-----------|
| **Nombre** | Nombre del estudiante. |

**Columnas dinámicas (una por evaluación):**

| Encabezado | Formato |
|------------|---------|
| `{Nombre evaluación}` + peso | En el **`<th>`**: nombre de la evaluación y, debajo o junto, el **peso** sobre el total (ej. `Parcial 1` + `20%`). El peso sale del contenido (suma de pesos = 100%). |

**Celda cuando el estudiante ya rindió la evaluación:**

- Copy: **`{Estado} con {X}% ({correctas} de {total} preguntas)`**
- `{Estado}` = **`Aprobado`** o **`Fallido`** (texto; en UI puede ir en negrita vía tipografía, sin status tag).
- Ejemplos de producción: `Aprobado con 70% (7 de 10 preguntas)`, `Fallido con 58% (7 de 12 preguntas)`.

**Celda cuando aún no rindió esa evaluación** (curso en progreso):

- Copy fijo: **`Pendiente`**

**Columna final:**

| Columna | Contenido |
|---------|-----------|
| **Final ponderada** | Porcentaje ponderado calculado **solo con las evaluaciones ya rendidas**: para cada evaluación completada se usa su nota % y su peso; el denominador es la **suma de los pesos de las evaluaciones rendidas** (no las pendientes). Ej.: si solo rindió Parcial 1 (20%) y Parcial 2 (30%), la final ponderada usa pesos 20 y 30 sobre 50. Formato celda: `{n}%`. |

---

### Tab 3 — Encuestas

- **No visible** en v1 (sin tab en la barra, sin panel).
- Reservado para spec futura.

---

### Tab 4 — Gestión de intentos

**Texto descriptivo** (encima de la tabla, cuerpo regular):

`Desbloquear otorga 1 intento más a cada usuario.`

**Toolbar de tabla:**

| Elemento | Comportamiento |
|----------|----------------|
| **Buscador** | `Busca un estudiante` |
| **Exportar CSV** | Exporta filas visibles del tab (ver patrón común). |

**Columnas:**

| Columna | Contenido |
|---------|-----------|
| **Checkbox** | Selección múltiple (como seguimiento). |
| **Nombre** | Estudiante. |
| **Email** | Correo. |
| **Nombre de la evaluación** | Evaluación que no aprobó y en la que **agotó todos los intentos**. |
| **Fecha de bloqueo** | Fecha en que consumió el último intento y quedó bloqueado. |
| **Acciones** | Botón **`Desbloquear`** por fila (`secondary` xs o tamaño tabla). Al clic abre **modal de confirmación** (mismo flujo que selección múltiple). |

**Barra de acciones por selección múltiple** (patrón **`seguimiento-action-bar`** en `seguimiento.html` / `seguimiento.js`):

- Al seleccionar **2 o más** filas, aparece barra con botón **`Desbloquear ({N})`** donde `{N}` = cantidad seleccionada.
- Misma familia UX que seguimiento al seleccionar varias personas (acciones extra contextuales).

**Modal de confirmación de desbloqueo** (fila individual o **`Desbloquear ({N})`**):

| Elemento | Copy |
|----------|------|
| **Título** (1 usuario) | `¿Desbloquear usuario?` |
| **Título** (varios) | `¿Desbloquear usuarios?` |
| **Descripción** (1 usuario) | `Al desbloquear, se otorgará 1 intento adicional y el usuario dejará de aparecer en esta lista.` |
| **Descripción** (varios) | `Al desbloquear, se otorgará 1 intento adicional a cada usuario y dejarán de aparecer en esta lista.` |
| **Botón secundario** | `Cancelar` |
| **Botón primario** | `Desbloquear` |

Implementación: `openModal` UBITS. Tras confirmar → quitar fila(s) + toast (abajo).

**Efecto al desbloquear:**

1. La fila **desaparece** de la tabla (el usuario ya no está bloqueado).
2. Toast de confirmación:
   - Un usuario: **`Usuario desbloqueado exitosamente`**
   - Varios: **`Usuarios desbloqueados exitosamente`**

**Empty state** (sin filas bloqueadas) — componente **`EmptyState`**:

| Campo | Copy |
|-------|------|
| **Título** | `No hay estudiantes bloqueados` |
| **Descripción** | `No hay estudiantes que hayan alcanzado el límite de intentos en las evaluaciones de este contenido.` |
| **Icono** | `far fa-user-unlock` o `far fa-clipboard-check` (según catálogo empty states). |
| **Botón** | Ninguno (solo informativo). |

---

### Mock data y playground

- Datos en `bd-contenidos-fiqsha.js` o módulo dedicado `bd-resultados-contenido.js` cuando se implemente.
- El curso de prueba del screenshot puede tener **0 estudiantes** → empty state en Progreso/Evaluaciones; Gestión de intentos vacía.
- Incluir al menos un juego de filas mock para validar tablas con datos (progreso parcial, evaluaciones Pendiente, bloqueos).

---

## Sección: Información (portada precargada)

Equivalente al **paso 1 — Portada** de [`contexto-creacion-contenido.md`](./contexto-creacion-contenido.md).

Al abrir edición:

- **Imagen de portada** y **tráiler** (si existía) ya cargados.
- **Descripción** y **ficha técnica** (tipo, nivel, idioma, tiempo, categoría) **completos**.
- El usuario puede **editar textos** y los campos de metadata que el producto permita en contenido publicado (alineado al modal: «cambios limitados, como editar textos»).

---

## Sección: Recursos (reglas de edición publicada)

### Modal obligatorio al entrar a Recursos

Se muestra **solo la primera vez en la sesión** que el usuario entra a la sección **Recursos** (flag en `sessionStorage` o equivalente; si recarga la página en la misma sesión del navegador, **no** vuelve a mostrarse).

| Elemento | Copy obligatorio |
|----------|------------------|
| **Título** | `Advertencia sobre edición` |
| **Descripción** | `Este contenido ya ha sido publicado. Solo puedes realizar cambios limitados, como editar textos. No es posible eliminar ni agregar nuevos elementos. Las modificaciones que realices serán visibles para los estudiantes de forma inmediata.` |
| **Botón secundario** | `Salir sin editar` — cierra el modal **sin activar** Recursos; el usuario **permanece en la sección del sidebar en la que estaba** antes de intentar abrir Recursos (si entró directo a Recursos vía URL, volver a la sección previa o **Información** por defecto). |
| **Botón primario** | `Sí, editar` — cierra el modal y muestra Recursos con las restricciones de esta sección. |

**Interpretación del copy del modal:** «no agregar nuevos elementos» se refiere a **páginas, secciones y recursos principales** (la estructura del curso). Los **recursos complementarios** sí se pueden gestionar (excepción confirmada por producto).

Implementación: **`openModal`** UBITS (`components/modal.js`), tamaño `sm` o `md`.

### Estructura ya existente

- **Índice** solo con **páginas que ya tienen recurso principal** (y **secciones** si el contenido se publicó con secciones). No puede haber páginas vacías en edición.
- **Panel derecho** con el **recurso principal** renderizado por página (video, PDF, SCORM, evaluación, etc.).

### Restricciones estructurales (páginas / secciones / recurso principal)

| Acción | Edición publicada |
|--------|-------------------|
| Añadir página | **Oculto** |
| Eliminar página | **Oculto** / no disponible |
| Añadir sección | **Oculto** |
| Eliminar sección | **Oculto** / no disponible |
| Interruptor «usar secciones» | **No se muestra** |
| Reordenar páginas | **Permitido** (menú ⋮ o drag, igual que creación) |
| Reordenar secciones | **Permitido** |
| Editar título de página (inline) | **Permitido** |
| Editar título de sección (modal) | **Permitido** |
| Eliminar recurso principal | Botón **Eliminar** **`disabled`** |
| Reemplazar recurso principal | **Permitido** — **mismos modales** que en `crear-contenido` |
| Recursos complementarios | **Añadir, editar y eliminar** permitidos |

### Botones en el recurso principal renderizado

Orden visual en la fila de acciones (de izquierda a derecha):

| Orden | Botón | Variante | Comportamiento |
|-------|--------|----------|----------------|
| 1 | **Descargar** | `secondary` | Descarga **un solo archivo** según tipo de recurso (tabla siguiente). |
| 2 | **Reemplazar** | `secondary` | Abre el **mismo modal** que en creación para ese tipo de recurso. |
| 3 | **Eliminar** | `error-secondary` | Siempre **`disabled`**. |

**Iconos (FontAwesome outline):** Descargar `fa-download`, Reemplazar `fa-arrows-rotate`, Eliminar `fa-trash`.

### Descargar — comportamiento por tipo de recurso

En el playground, generar la descarga en cliente a partir de los datos mock guardados del contenido:

| Tipo de recurso principal | Archivo descargado |
|---------------------------|-------------------|
| **Video** (subido o URL persistida) | El **archivo de video** (p. ej. `.mp4`) — `fetch` + blob + `download` con nombre derivado del título de la página o del archivo original. |
| **PDF** | El **PDF** subido o la URL del documento. |
| **Evaluación** | Un **`.txt` o `.md`** generado con todas las preguntas, opciones y metadata de la evaluación (texto plano legible fuera de la plataforma). |
| **SCORM** | Un **HTML standalone** empaquetado o un `.html` autocontenido que represente el paquete para uso externo (en producción sería el zip SCORM; en playground basta un export mínimo coherente). |

Si el tipo no tiene archivo físico, la descarga debe ser igualmente **un único archivo** derivado del contenido editable (nunca un zip arbitrario de varios archivos salvo SCORM en producción real).

### Ediciones permitidas en Recursos (resumen)

- Textos editables en recursos (RTE, enunciados de evaluación, etc.).
- **Reemplazar** recurso principal (modales de creación).
- **Reordenar** páginas y secciones; **editar títulos** de página y sección.
- **Complementarios:** CRUD completo.

---

## Sección: Certificado

- Mismo patrón que el **paso 3 — Certificado** en creación.
- Al entrar: switch **Habilitar certificado** y **plantilla** reflejan lo guardado al publicar.
- **Sí se puede** desactivar el certificado o **cambiar la plantilla** en edición (salvo modo Archivado solo lectura).

---

## Sección: Visibilidad

- Mismo patrón que el **paso 4 — Visibilidad** en creación (4 tarjetas: Borrador, Público, Privado, Oculto).
- Estado inicial: el que tenga el contenido (**Público**, **Privado** u **Oculto**).
- **Borrador:** tarjeta **visible pero `disabled`**, igual que tras publicar en creación — **no** se puede volver a Borrador desde edición.
- Si es **Privado**, colaboradores ya asignados visibles y editables vía **«Seleccionar colaboradores»**.
- Modales de confirmación al cambiar a Público / Privado / Oculto: reutilizar `crear-contenido-publicacion.js` donde aplique.
- **Guardado:** mismo **`SaveIndicator`** / autoguardado que creación (sin botón «Publicar» adicional; los cambios de visibilidad se persisten como el resto de la edición).

---

## Pie de página

- **Sin** botones globales Anterior / Siguiente entre secciones del sidebar.
- Navegación entre **Resultados**, **Información**, **Recursos**, etc. **solo** por el sidebar lateral.

---

## Rutas y archivos (playground)

| Concepto | Vanilla | React |
|----------|---------|-------|
| Página de edición | **`editar-contenido.html`** + CSS/JS dedicados | `pages/ubits-colaborador/lms-creator/editar-contenido.tsx` |
| Query | `?id={contentId}`; `&readonly=1` si Archivado | Igual |
| Hash opcional | `#recursos`, `#informacion`, etc. | Igual |
| Lista origen | `contenidos.html` | `contenidos.tsx` |
| Borrador | `crear-contenido.html?id={contentId}` | `crear-contenido.tsx?contentId=` |
| Sidebar | `sidebar-contenidos-lms.js` | `SidebarContenidosLMS` |

---

## Relación con otros flujos

| Flujo | Relación |
|-------|----------|
| **Creación** | Fuente de verdad de UI de pasos; edición **reutiliza** bloques y modales, no duplica markup divergente sin motivo. |
| **Drawer borrador en Contenidos** | Prototipo a **retirar** en favor de `crear-contenido` prellenado para Borrador. |
| **Antiguo LMS** | Sidebar variante `publicado-antiguo-lms`. No mezclar con edición Creator estándar. |
| **Crear ruta** | Fuera de alcance (`contexto-creacion-ruta.md`). |

---

## Pin en lista Contenidos (tras crear o editar)

Comportamiento acordado de producto:

1. El usuario termina **crear** (`crear-contenido`) o **editar** (`editar-contenido`) y vuelve a **`contenidos.html`**.
2. El contenido trabajado aparece **primero** en la lista (cuadrícula y tabla), igual que hoy al finalizar creación.
3. Opcionalmente se refrescan en el card datos recientes (título, imagen, tag de visibilidad) vía el payload del pin en `sessionStorage`.

**Implementación de referencia (creación):** `finalizeCrearContenidoFlow()` en `crear-contenido.js` escribe `ubits-contenidos-pin-recien-creado`; `contenidos.html` lee esa clave y llama `pinContenidosCardFirst()`.

**Edición:** al guardar y salir de `editar-contenido.html`, escribir pin con el **`id`** del contenido editado para que `contenidos.html` lo mueva al tope. El pin **no cambia** la regla de enrutamiento al hacer clic: sigue dependiendo de `visibilidadLms` (Borrador → crear; publicado → editar; Archivado → editar readonly).

---

## Roles y permisos

| Rol | LMS Creator — Contenidos | Crear | Editar |
|-----|--------------------------|-------|--------|
| **Admin** | ✅ | ✅ | ✅ |
| **Creador** | ✅ | ✅ | ✅ |
| **Estudiante** | ❌ | ❌ | ❌ |

En el **playground** no se simula login por rol; se documenta la regla de producto para cuando exista auth real. **Archivado** en solo lectura aplica a Admin y Creador por igual (pueden **ver**, no **modificar**).

---

## Migración a React (`Ubits-React`)

1. Leer este documento y [`contexto-creacion-contenido.md`](./contexto-creacion-contenido.md).
2. Reutilizar `ImmersiveLayout`, subvistas de `crear-contenido.tsx` y **los mismos modales** de reemplazo de recurso.
3. Sidebar **`publicado-lms-creator`** con ítem **Resultados** primero.
4. Copy del modal: **carácter por carácter**.
5. Repo autocontenido — no importar desde `Referente-Vanilla/`.

---

## Notas para quien implemente

- Este documento **no** sustituye la documentación de **Sidebar contenidos LMS** ni la de componentes del paso Recursos.
- Cualquier cambio de copy del **modal de advertencia** debe actualizarse aquí y en React (regla 13 del playground).
- Actualizar **`contenidos.html`** para enrutar **Público / Privado / Oculto / Archivado** a `editar-contenido.html` (hoy solo **Borrador** abre drawer al clic en card).
- Al salir de **`editar-contenido.html`** tras guardar: pin en lista (mismo patrón que `ubits-contenidos-pin-recien-creado`).
- Modal Recursos: clave `sessionStorage` sugerida p. ej. `ubits-lms-edit-recursos-warning-dismissed` — **una vez por sesión de navegador** al entrar a Recursos (confirmado).

---

*Última revisión: empty Gestión de intentos, patrón nombre CSV `{tab}-{id}-{rango}.csv`.*
