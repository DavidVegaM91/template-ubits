# Contexto: edición de contenido publicado (LMS Creator)

Documento de referencia sobre el flujo de **edición de contenido ya publicado** (o con visibilidad distinta de Borrador) en el módulo LMS Creator.

**Para quién es este documento:** personas de **producto, diseño, negocio** y cualquier lector que necesite entender **qué hace** el flujo y **cómo lo vive el usuario**, sin depender solo de nombres de código.

**Cómo está escrito:** lenguaje **conceptual** (pantallas, reglas, opciones, mensajes). Donde haga falta detalle técnico para implementación, se indica en subsecciones.

**Documento hermano:** [`contexto-creacion-contenido.md`](./contexto-creacion-contenido.md) — describe el asistente de **creación** (4 pasos con stepper vertical). Este documento describe la experiencia de **edición**, que reutiliza gran parte de la misma UI pero con reglas distintas.

**Q edición estructural (fuente de decisiones):** [`decisiones-q-edicion-estructural-contenidos.md`](./decisiones-q-edicion-estructural-contenidos.md) — añadir páginas, ocultar/mostrar, modal de impacto (T5), flujos inmersivos tipo Agregar video. Este contexto refleja el **producto deseado** tras ese Q (no el playground viejo “solo textos / sin añadir páginas”).

**Objetivo:** dejar claro cuándo entra cada flujo, qué ve el usuario, qué **sí** puede cambiar en estructura publicada y cómo se gobierna el impacto en progreso / rutas / planes / certificados. La sección **Resultados** refleja el estado del playground (vanilla + React).

---

## Resumen ejecutivo

| Visibilidad del contenido | Dónde entra el usuario | Experiencia |
|-------------------------|------------------------|-------------|
| **Borrador** | Lista **Contenidos** | **`crear-contenido.html`** con datos **prellenados** (misma vista de creación; paso Visibilidad con **Borrador** seleccionado). Sigue siendo un contenido **en construcción**, no la vista de edición publicada. |
| **Público**, **Privado** u **Oculto** | Lista **Contenidos** | **`editar-contenido.html`** — vista de edición con **sidebar lateral** (no stepper). Puede **editar estructura** (añadir páginas, ocultar/mostrar) tras el **modal de impacto** en Recursos. |
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
| **Navegación lateral** | **Stepper vertical** (4 pasos: Portada → Recursos → Certificado → Visibilidad) | **Misma cáscara inmersiva** + navegación por hash (Resultados → Información → Recursos → Certificado → Visibilidad) |
| **Primer ítem lateral** | Portada | **Resultados** *(no existe en creación)* |
| **Siguiente ítem** | Recursos | **Información** *(equivalente funcional a Portada)* |
| **Resto de ítems** | Certificado, Visibilidad | Recursos, Certificado, Visibilidad |
| **Añadir página** | Modal tipo → flujo hermano inmersivo (patrón Agregar video); fila solo al confirmar | **Igual** (habilitado; hoy ya no está oculto) |
| **Eliminar página** | **Sí** (modal confirmación) | **No** — sustituido por **Ocultar / Mostrar** |
| **Ocultar / Mostrar página** | **No** existe | **Sí** (siempre ≥ 1 página visible) |
| **Añadir / ocultar sección** | Añadir / eliminar sección permitido | **Prohibido** en este Q (solo páginas) |
| **Reordenar páginas y secciones** | Permitido | **Sí** (incluye páginas **ocultas**) |
| **Interruptor «usar secciones»** | Visible y editable | **No se muestra** — el modo con/sin secciones queda **fijado** según cómo se publicó |
| **Eliminar recurso principal** | **No** se muestra bajo el recurso montado | **No** se muestra |
| **Reemplazar recurso principal** | Solo **mismo tipo**; cambiar tipo = nueva página | Igual |
| **Recursos complementarios** | Añadir / editar / eliminar | **Sí** — comportamiento actual |
| **Descargar recurso principal** | No aplica | Botón **Descargar** — un solo archivo por tipo (ver tabla abajo) |
| **Modal al entrar a Recursos** | No | **Sí**, **cada vez** que entran a Recursos (política Proteger / Afectar + impacto) |
| **Indicador de guardado** | `SaveIndicator` | **El mismo** `SaveIndicator` que en creación |
| **Cambios visibles para estudiantes** | No (aún no publicado) | **Sí** — gobernados por la política elegida en el modal T5 |
| **Archivado** | N/A en creación activa | Vista **solo lectura** |

---

## Layout de la vista de edición

### Shell

- Misma **cáscara inmersiva** que `crear-contenido.html` (`layout-immersive.css`, `body.page-layout-immersive`): cabecera con título del contenido, **tag de visibilidad** actual y **`SaveIndicator`** (mismo componente que creación).
- **No** usar el stepper vertical de creación en la columna izquierda.
- **Modo Archivado (solo lectura):** deshabilitar inputs, botones de guardado y acciones destructivas; la navegación por pasos sigue permitiendo **consultar** secciones.

### Navegación de pasos (edición)

Orden oficial de secciones en edición (cáscara inmersiva + hash; sin rail lateral de pasos):

| Orden | `id` interno | Etiqueta en UI | Icono (referencia) |
|-------|--------------|----------------|---------------------|
| 1 | `resultados` | **Resultados** | `fa-chart-mixed` |
| 2 | `informacion` | **Información** | `fa-circle-info` |
| 3 | `recursos` | **Recursos** | `fa-layer-group` |
| 4 | `certificado` | **Certificado** | `fa-award` |
| 5 | `visibilidad` | **Visibilidad** | `fa-eye` |

**Sección activa vía URL:** `editar-contenido.html?id={contentId}#recursos` (u `#informacion`, `#certificado`, `#visibilidad`). En **Resultados**, el hash incluye el tab: `#resultados-progreso`, `#resultados-evaluaciones`, `#resultados-gestion-intentos`, `#resultados-descargas` (ver [Resultados](#sección-resultados)).

**Primer ítem exclusivo de edición:** **Resultados** — dashboard de métricas y tablas por estudiante (spec completa en sección [Resultados](#sección-resultados)).

### Área principal

- Misma lógica de **dos paneles** en **Recursos** que en creación (índice izquierda + previsualizador derecha), con las **restricciones** de edición descritas abajo.
- **Información:** mismos campos que el paso **Portada** de creación, ya rellenos.
- **Certificado** y **Visibilidad:** mismos patrones que los pasos 3 y 4 de creación, con datos iniciales del contenido.

---

## Sección: Resultados

**Solo en edición** (no aparece en `crear-contenido`). Implementado en playground:

| | Vanilla | React |
|--|---------|-------|
| UI | `editar-contenido-resultados.js` + CSS de `editar-contenido` | `EditarContenidoResultados.tsx` |
| Datos | `bd-master/bd-resultados-contenido.js` | `lib/mockData/bd-resultados-contenido.ts` (sync desde vanilla) |

Componentes UBITS: **`Tab`**, **`UbitsDataTable`** / `createUbitsDataTable`, **`EmptyState`**, **`ProgressBar`**, **`UbitsDropdown`** (periodo), **`UbitsButton`**, **`UbitsAvatar`**, **`Tooltip`**, **`UbitsModal`**, toasts.

**Hash de tabs (URL):** al estar en Resultados la pestaña activa vive en el hash:

| Tab | Hash |
|-----|------|
| Progreso (default) | `#resultados-progreso` |
| Evaluaciones | `#resultados-evaluaciones` |
| Gestión de intentos | `#resultados-gestion-intentos` |
| Descargas | `#resultados-descargas` |

Si se entra a `editar-contenido` **sin** hash (p. ej. desde Contenidos), se escribe `#resultados-progreso` para que la URL y la UI coincidan.

### Cabecera de la sección

| Elemento | Copy / comportamiento |
|----------|----------------------|
| **Título** | Nombre del contenido (mismo título de la cabecera inmersiva o repetido en el panel). |
| **Descripción** | `Consulta los resultados, el progreso, las evaluaciones y encuestas de este contenido. La información se actualiza cada 3 horas.` |
| **Filtro de periodo** (derecha) | Dropdown. **Afecta el KPI de Finalización y las tablas de Progreso, Evaluaciones y Gestión de intentos** (no la tabla de Descargas). Valor por defecto **`Últimos 30 días`**. Opciones **actuales en código:** `Últimos 30 días`, `Últimos 3 meses`, `Últimos 6 meses`, `Último año`, `Año actual`. Icono `far fa-calendar`. |
| **Meta fila** | **`Estudiantes inscritos`** + número (`formatIndicatorNumber`). **`Publicado el`** + fecha larga en español (ej. `6 de julio de 2026`). **`Visibilidad actual:`** + **status tag** (Público / Privado / Oculto / Archivado) — el tag solo aquí en meta, **no** en celdas de tablas. |

**Regla de fechas:** la **fecha de inicio** de estudio de un estudiante **no puede ser posterior** a la **fecha de publicación** del contenido.

### Tarjeta KPI (fila superior)

**Una sola tarjeta** — no incluir «Índice de satisfacción».

| KPI | Copy label | Valor | Notas |
|-----|------------|-------|-------|
| **Finalización** | `Finalización` | `{completados}/{inscritos} \| {pct}%` + barra | Completados / inscritos en el **periodo seleccionado**. Icono info (`far fa-circle-info`) con tooltip (click): **`Mide el porcentaje de personas que completaron todo el contenido.`** |

### Tabs (orden y visibilidad)

Componente **`Tab`** UBITS. **Orden fijo:**

| # | `id` | Etiqueta en UI | Visible | Contenido |
|---|------|----------------|---------|-----------|
| 1 | `progreso` | **Progreso** | ✅ Sí | Tabla de progreso por estudiante. |
| 2 | `evaluaciones` | **Evaluaciones** | ✅ Sí | Tabla de notas por evaluación (columnas dinámicas + final ponderada). |
| 3 | `gestion-intentos` | **Gestión de intentos** | ✅ Sí | Tabla de bloqueos por evaluación + desbloqueo. |
| 4 | `encuestas` | **Encuestas** | ❌ **Oculto** | No renderizar tab ni panel hasta definir spec (distinto del tab **Descargas**). |
| 5 | `descargas` | **Descargas** | ✅ Sí | Tabla de reportes descargables por recurso (evaluaciones + encuesta). Última tab visible. |

**Tab activo por defecto al entrar:** **Progreso** (`#resultados-progreso`).

### Patrón común de tablas

- **`createUbitsDataTable`** / **`UbitsDataTable`** en cada tab visible.
- **Buscador** (tabs con lista de estudiantes): placeholder **`Busca un estudiante`**.
- **Contador de resultados** en toolbar (`resultsCount`) donde aplique.
- **Empty state** con **`EmptyState`** del DS cuando no hay filas.
- Celdas: **texto plano** (y tipografía) — **prohibido** status-tag / badges dentro de las tablas.
- Columna de usuario (tabs de estudiantes): **avatar + nombre** (no solo texto).
- Fechas de celda: formato corto tipo **`DD mmm. AAAA`** (`formatDateDDMmmAAAA` / helper equivalente).
- **Descargar (CSV) en toolbar** — solo en **Progreso**, **Evaluaciones** y **Gestión de intentos**: botón primario de toolbar label **`Descargar`** (`secondary` + `fa-download`). Exporta las **filas visibles** (búsqueda + periodo). **Nombre del archivo:** `{tab}-{id-contenido}-{rango}.csv` — ej. `progreso-f007-ultimos-30-dias.csv`. Prefijos `{tab}`: `progreso`, `evaluaciones`, `gestion-intentos`.
- El tab **Descargas** **no** lleva botón **Descargar** en el header/toolbar de la DataTable (la descarga va **por fila** en la columna Reporte).

---

### Tab 1 — Progreso

**Columnas (orden fijo, tal como está implementado):**

| # | Encabezado (`label`) | Contenido de la celda |
|---|----------------------|------------------------|
| 1 | **Nombre del usuario** | Avatar + nombre del estudiante. Ordenable. |
| 2 | **Email** | Correo del estudiante. |
| 3 | **Fecha de inicio** | Fecha en que comenzó el contenido (≤ fecha de publicación). Ordenable. |
| 4 | **Fecha de finalización** | Fecha en que terminó, o texto fijo **`No ha finalizado`** si aún no completó. Ordenable. |
| 5 | **Progreso** | **`ProgressBar`** UBITS con **porcentaje** visible en la barra. Ordenable (numérico). |

**Empty state (sin filas):**

| Campo | Copy |
|-------|------|
| **Título** | `No se encontraron resultados` |
| **Descripción** | `Aún no hay estudiantes inscritos en este contenido para el periodo seleccionado.` |
| **Icono** | `far fa-search` |

---

### Tab 2 — Evaluaciones

Las columnas de evaluación son **dinámicas**: una por cada evaluación definida en el contenido (mock curso demo: Evaluación Sección 1, Evaluación Sección 2; en producto vienen del recurso evaluación + su **peso %**).

**Columnas (orden):**

| # | Tipo | Encabezado | Contenido |
|---|------|------------|-----------|
| 1 | Fija | **Nombre del usuario** | Avatar + nombre. Ordenable. |
| 2…n | Dinámicas (1 por evaluación) | Ver patrón de encabezado abajo | Celda de resultado o `Pendiente`. |
| última | Fija | **Final ponderada** | `{n}%` si hay al menos una evaluación rendida; si no, `—`. Ordenable. |

#### Encabezado de cada columna de evaluación

En el **`<th>`** (patrón título + acción + meta; React: `DataTableHeaderWithMeta` / `TableHeaderWithMeta`; vanilla: `labelHtml` + `.ubits-dt-th-label*`):

| Parte | Qué es | Comportamiento |
|-------|--------|----------------|
| **Título** | Nombre de la evaluación | Truncable con `…` si no cabe. |
| **Botón info** | `far fa-circle-info`, `iconOnly`, variante tertiary xs | Tooltip **`Ver detalles`** (`delay` 1000). **No** dispara ordenar la columna. Clic → abre modal **Detalles de evaluación**. |
| **Meta (texto secundario)** | Peso, ej. `20%` | Siempre visible a la derecha; **no** se trunca. Clase tipográfica `ubits-body-xs-regular`. |

#### Modal «Detalles de evaluación»

| Elemento | Copy / valor |
|----------|----------------|
| **Título del modal** | `Detalles de evaluación` |
| **Título dentro del body** | Nombre de la evaluación (bold). |
| **Peso de esta evaluación:** | `{n}%` (debajo del título; valor de `peso` del mock). |
| **Porcentaje requerido para aprobar:** | `{n}%` o **`No aplica`** si el campo es `null`. |
| **Límite de intentos:** | `{n}` o **`No aplica`**. |
| **Tiempo límite:** | `{n} minutos` o **`No aplica`**. |
| **Total de preguntas:** | número entero (en mock siempre hay valor). |
| **Botón del footer** | **`Entendido`** (primary) — cierra el modal. |
| **Tamaño** | `sm` |

**Campos en el mock de evaluación** (`bd-resultados-contenido`): además de `id`, `nombre`, `peso` → `porcentajeAprobar`, `limiteIntentos`, `tiempoLimiteMinutos`, `totalPreguntas` (los tres primeros aceptan `null` = No aplica).

#### Celdas de resultado por evaluación

**Cuando el estudiante ya rindió:**

- Copy: **`{Estado} con {X}% ({correctas} de {total} preguntas)`**
- `{Estado}` = **`Aprobado`** o **`Fallido`** (tipografía en negrita del estado; **sin** status tag).
- Ejemplos: `Aprobado con 70% (7 de 10 preguntas)`, `Fallido con 58% (7 de 12 preguntas)`.

**Cuando aún no rindió:**

- Copy fijo: **`Pendiente`** (puede ir en negrita).

#### Final ponderada

Porcentaje ponderado **solo con evaluaciones ya rendidas**: nota % × peso de cada una rendida; el denominador es la **suma de pesos de las rendidas** (no las pendientes). Si no hay ninguna rendida → `—`. Formato: `{n}%` (puede llevar un decimal).

**Empty state (sin filas):** mensaje de tabla vacío con descripción del estilo *aún no hay datos de evaluaciones para el periodo*.

---

### Tab 3 — Gestión de intentos

**Texto descriptivo** (encima de la tabla, cuerpo regular):

`Desbloquear otorga 1 intento más a cada usuario.`

**Toolbar:**

| Elemento | Comportamiento |
|----------|----------------|
| **Buscador** | `Busca un estudiante` |
| **Descargar** | CSV de filas visibles (ver patrón común). |
| **Checkboxes** | Selección múltiple de filas (feature de DataTable). |

**Columnas (orden fijo, tal como está implementado):**

| # | Encabezado (`label`) | Contenido |
|---|----------------------|-----------|
| — | *(checkbox de fila)* | Selección; no es un `label` de columna de negocio. |
| 1 | **Nombre del usuario** | Avatar + nombre. Ordenable. |
| 2 | **Email** | Correo. |
| 3 | **Nombre de la evaluación** | Evaluación en la que agotó intentos y quedó bloqueado. |
| 4 | **Fecha de bloqueo** | Fecha del bloqueo. Ordenable. |
| 5 | **Acciones** | Botón **`Desbloquear`** (`secondary` xs). Abre modal de confirmación. |

**Barra de acciones por selección múltiple** (patrón action bar del DataTable / seguimiento):

- Al seleccionar **2 o más** filas → barra con **`Desbloquear ({N})`**.
- Misma familia UX que seguimiento.

**Modal de confirmación de desbloqueo** (fila o múltiple):

| Elemento | Copy |
|----------|------|
| **Título** (1 usuario) | `¿Desbloquear usuario?` |
| **Título** (varios) | `¿Desbloquear usuarios?` |
| **Descripción** (1) | `Al desbloquear, se otorgará 1 intento adicional y el usuario dejará de aparecer en esta lista.` |
| **Descripción** (varios) | `Al desbloquear, se otorgará 1 intento adicional a cada usuario y dejarán de aparecer en esta lista.` |
| **Botón secundario** | `Cancelar` |
| **Botón primario** | `Desbloquear` |

**Efecto al desbloquear:**

1. La(s) fila(s) **desaparecen** de la tabla.
2. Toast:
   - Un usuario: **`Usuario desbloqueado exitosamente`**
   - Varios: **`Usuarios desbloqueados exitosamente`**

**Empty state** (sin bloqueados) — **`EmptyState`**:

| Campo | Copy |
|-------|------|
| **Título** | `No hay estudiantes bloqueados` |
| **Descripción** | `No hay estudiantes que hayan alcanzado el límite de intentos en las evaluaciones de este contenido.` |
| **Icono** | `far fa-user-unlock` o `far fa-clipboard-check` |
| **Botón** | Ninguno |

---

### Tab 4 — Encuestas (resultados / analytics)

- **No visible** en v1 (sin tab en la barra, sin panel).
- Reservado para spec futura de resultados de encuestas (distinto del listado de descargas del tab **Descargas**).

---

### Tab 5 — Descargas

Tab visible para bajar **reportes por recurso** (evaluaciones del contenido + encuesta de satisfacción). Es la **última tab** en la barra. No confundir con el tab oculto **Encuestas** (spec futura de resultados de encuestas).

**Texto descriptivo** (encima de la tabla, cuerpo regular):

`Descarga los reportes por cada uno de los siguientes recursos.`

**Toolbar de la DataTable:**

| Elemento | Comportamiento |
|----------|----------------|
| **Botón Descargar / Exportar CSV del header** | **No** — este tab **no** tiene botón primario de descarga en el toolbar. |
| **Buscador** | Opcional en v1; si se incluye, busca por título del recurso. |
| **Checkboxes / action bar** | **No**. |

**Columnas (orden fijo):**

| # | Encabezado (`label`) | Contenido |
|---|----------------------|-----------|
| 1 | **Título del recurso** | Nombre del recurso evaluable o encuesta. |
| 2 | **Participantes** | Número de personas que **ya pasaron** por ese recurso (`formatIndicatorNumber`). Ordenable. |
| 3 | **Reporte** | Botón **`Descargar`** (`secondary` xs) por fila. **En playground v1 no descarga nada** (handler vacío / toast opcional de «próximamente» solo si producto lo pide; por defecto sin acción). |

**Filas mock (orden de aparición = orden del recorrido lineal del contenido):**

La navegación del contenido es **lineal**, así que el número de participantes **decrece** a medida que el recurso está más adelante en el programa.

| # | Título del recurso | Tipo | Participantes (ejemplo demo ~22 inscritos) |
|---|--------------------|------|--------------------------------------------|
| 1 | `Evaluación Sección 1` | Evaluación | `20` — casi todos ya lo vieron. |
| 2 | `Evaluación Sección 2` | Evaluación | `17` — un poco menos. |
| 3 | `Encuesta de satisfacción` | Encuesta | `10` — la que menos han completado. |

Las dos evaluaciones son las **mismas** del curso demo / mock de Resultados (`eval-seccion-1`, `eval-seccion-2`). La encuesta es un recurso adicional solo para este tab (no aparece como columna en Evaluaciones).

**Empty state** (si no hay recursos con reporte):

| Campo | Copy |
|-------|------|
| **Título** | `No hay reportes disponibles` |
| **Descripción** | `Cuando el contenido tenga evaluaciones o encuestas, podrás descargar sus reportes aquí.` |
| **Icono** | `far fa-download` o `far fa-file-export` |
| **Botón** | Ninguno |

**Hash:** `#resultados-descargas`.

---

### Mock data y playground

- Fuente: **`bd-master/bd-resultados-contenido.js`** (React: sync a `lib/mockData/bd-resultados-contenido.ts`).
- Evaluaciones demo traen metadata para el modal (aprobar, intentos, tiempo, total preguntas).
- Contenidos sin fila dedicada reutilizan demo (`f007` / seed) para que Resultados no salga vacío en playground.
- Incluir filas con progreso parcial, celdas `Pendiente`, bloqueos en Gestión de intentos, y filas del tab **Descargas** (3 evaluaciones + encuesta de satisfacción con participantes decrecientes).

---

## Sección: Información (portada precargada)

Equivalente al **paso 1 — Portada** de [`contexto-creacion-contenido.md`](./contexto-creacion-contenido.md).

Al abrir edición:

- **Imagen de portada** y **tráiler** (si existía) ya cargados.
- **Descripción** y **ficha técnica** (tipo, nivel, idioma, tiempo, categoría) **completos**.
- El usuario puede **editar textos** y los campos de metadata que el producto permita en contenido publicado. Los cambios **estructurales** (añadir / ocultar páginas) se gobiernan en **Recursos** tras el modal de impacto.

---

## Sección: Recursos (reglas de edición publicada)

Fuente de decisiones: [`decisiones-q-edicion-estructural-contenidos.md`](./decisiones-q-edicion-estructural-contenidos.md).

### Modal obligatorio al entrar a Recursos (T5 — pieza crítica)

Se muestra **cada vez** que el usuario entra a la sección **Recursos** (si sale a Información, Certificado, Visibilidad, Resultados, etc. y vuelve → **vuelve a salir**). **Ya no** aplica el `sessionStorage` “solo primera vez por sesión” del modal viejo «Advertencia sobre edición» (ese copy **muere**).

**Prioridad de producto:** si el creador **no entiende** este modal, el Q de edición estructural **falla**.

#### Política de impacto (obligatoria)

| Opción | Efecto para quien ya estaba al **100 %** en este contenido |
|--------|-------------------------------------------------------------|
| **Proteger** *(default al primer acceso / tras reload en prototipo)* | Conserva el **100 %** y los **certificados**. Las ediciones estructurales no le revierten el logro. |
| **Afectar** | Se **recalcula** el progreso (puede bajar de 100 %). Se afecta avance en **contenido**, **rutas** y **planes**. El certificado se **revoca** / **deja de mostrarse**. |

**Persistencia de la elección:**

- Al cambiar la opción, **esa** queda marcada.
- Si sale de Recursos y **vuelve**, el modal sale otra vez con la **última opción** ya seleccionada.
- **Producción:** la selección se **persiste** en el contenido.
- **Playground:** sin reload se respeta la sesión; si **recarga** la página → vuelve a **Proteger**.

#### Contenido del modal

**Layout:** modal `lg` con **dos columnas 50/50 arriba** (gap `lg`; una columna bajo 900px) + **bloque de indicadores a ancho completo abajo**.

| Zona | Bloques |
|------|---------|
| Izquierda | Intro + selector de impacto |
| Derecha | Video 16:9 |
| Abajo (100 %) | Label `A quiénes afecta este contenido` + indicadores: 3 con Proteger; 4 con Recalcular (incluye «Estudiantes que finalizaron») |
| Pie, zona izquierda | Checkbox de entendimiento — mismo patrón que el checkbox del pie del modal **Avatar del video** (`agregar-video/editor`); los CTA siguen a la derecha |

| Bloque | Obligatorio | Notas |
|--------|-------------|--------|
| Título | Sí | `Antes de editar los recursos` |
| Intro corta | Sí | `Vas a poder añadir u ocultar páginas. Eso puede…` — negrita solo en la primera oración |
| Selector de impacto (2 opciones) | Sí | Default = Proteger (o última elección). Copy de opciones abajo. |
| Video explicativo | Sí | YouTube placeholder: `https://www.youtube.com/watch?v=HXoFyBxwv7s` (UBITS; no es el oficial del impacto) |
| **Indicadores** | Sí | Hardcode en la page. Con Proteger: En curso · Planes · Rutas. Con Recalcular: suma **Estudiantes que finalizaron** (solo entonces se les afecta). |
| Checkbox | Sí | En el **pie** del modal (zona izquierda). Obliga a marcar para habilitar el CTA primario |
| CTA secundario | Sí | `Salir sin editar` — cierra **sin** activar Recursos; permanece en la sección previa (si entró directo a Recursos vía URL → **Información** por defecto). |
| CTA primario | Sí | `Sí, editar` — solo habilitado con checkbox marcado |

**Labels de indicadores (neutro, confirmados):**

| Dato | Label |
|------|--------|
| N finalizaron | `Estudiantes que finalizaron` | Solo visible con política **Recalcular** |
| N en curso | `Estudiantes en curso` |
| N planes | `Planes de contenidos` |
| N rutas | `Rutas de aprendizaje` |

**Checkbox (copy aprobado):**  
`Entiendo el impacto que pueden tener estas ediciones en el progreso de los estudiantes, rutas, planes y certificados.`

**Opciones de impacto:**

| Opción | Título | Descripción |
|--------|--------|-------------|
| **Proteger** (default) | `Proteger a quienes ya finalizaron` | `Los estudiantes que ya completaron este contenido al 100 % mantienen su progreso y sus certificados. Los cambios estructurales no les quitan lo que ya lograron.` |
| **Afectar** | `Recalcular el progreso de todos` | `El progreso se vuelve a calcular. Quienes habían finalizado pueden dejar de estar al 100 %, perder el certificado, y ver afectado su avance en rutas y planes de contenidos que incluyen este contenido.` |

Implementación: modal UBITS tamaño **`lg`**.

### Estructura ya existente

- Al abrir edición, el índice trae **páginas con recurso principal** (y **secciones** si se publicó con secciones).
- **Panel derecho:** recurso **montado** de la página activa (no la cuadrícula de 8 tipos como vía de alta).
- Tras el Q: se pueden **añadir** páginas nuevas (con recurso al confirmar) y **ocultar / mostrar** páginas existentes.

### Acciones estructurales (páginas / secciones / recurso principal)

| Acción | Edición publicada |
|--------|-------------------|
| Añadir página | **Permitido** — modal solo **tipo** (8 tarjetas) → flujo hermano inmersivo (patrón **Agregar video**) → fila en el índice **solo al confirmar**. Si abandona el flujo → **no se crea** la página. Nombre default: `Título de la página` (vacío → vuelve al default). |
| Eliminar página | **No** — sustituido por Ocultar / Mostrar |
| Ocultar página | **Sí** — menú ⋮ **Ocultar** |
| Mostrar página | **Sí** — menú ⋮ **Mostrar** (si estaba oculta) |
| Última página visible | **No** se puede ocultar → toast: `Debe haber al menos una página visible.` |
| Añadir / ocultar sección | **Prohibido** en este Q |
| Interruptor «usar secciones» | **No se muestra** |
| Reordenar páginas | **Permitido** (incluye **ocultas**) |
| Reordenar secciones | **Permitido** |
| Editar título de página (inline) | **Permitido** (mismo default / fallback que creación) |
| Editar título de sección (modal) | **Permitido** |
| Eliminar recurso principal | **No se muestra** el botón |
| Reemplazar recurso principal | **Permitido** — solo **mismo tipo**. Para cambiar de tipo: **ocultar** la página y **añadir** otra. |
| Recursos complementarios | **Añadir, editar y eliminar** — comportamiento actual |

### Página oculta — visual (Páginas creator) y learner

**En el índice del creador:**

- Opacidad baja + icono `fa-eye-slash` + label **«Oculta»** + **título tachado**.
- Menú ⋮: **sin Eliminar**; **Ocultar** / **Mostrar** según estado; Mover arriba/abajo como hoy.
- Se pueden **reordenar**.

**Para el estudiante (learner):**

- La página **no aparece** en su índice y **no se puede abrir**.
- El efecto en **avance / certificado** al ocultar lo gobierna la política del modal T5 (**Proteger** vs **Afectar**).

### Añadir página — los 8 tipos (flujo hermano inmersivo)

Mismo patrón de navegación que **Agregar video** en React (`/agregar-video` → revisar → editor, `ImmersiveLayout`, return al padre `#recursos`):

| Tipo | Flujo hermano inmersivo |
|------|-------------------------|
| Video | Sí (ya en React) |
| PDF | Sí |
| SCORM | Sí |
| Embebido | Sí |
| Texto | Sí |
| Evaluación final | Sí |
| Encuesta libre | Sí |
| Encuesta de satisfacción | Sí |

La UI **interna** puede diferir por tipo; el **patrón** (modal tipo → inmersivo → return con recurso) es el mismo. Detalle de alta compartido con creación: ver [`contexto-creacion-contenido.md`](./contexto-creacion-contenido.md).

### Botones en el recurso principal renderizado

Orden visual (izquierda → derecha):

| Orden | Botón | Variante | Comportamiento |
|-------|--------|----------|----------------|
| 1 | **Descargar** | `secondary` | Descarga **un solo archivo** según tipo (tabla siguiente). |
| 2 | **Reemplazar** | `secondary` | Solo **mismo tipo** — abre el flujo de reemplazo de ese tipo. |

**No hay botón Eliminar** bajo el recurso montado.

**Iconos (FontAwesome outline):** Descargar `fa-download`, Reemplazar `fa-arrows-rotate`.

### PDF — switch «Permitir descarga del PDF a los estudiantes»

Solo en páginas cuyo recurso principal es **PDF**, **encima** de la fila Descargar / Reemplazar:

| Elemento | Comportamiento |
|----------|----------------|
| Copy | **`Permitir descarga del PDF a los estudiantes`** |
| Control | Switch `ubits-switch` (md) |
| Default al añadir / reemplazar PDF | **ON** |
| Persistencia | Por página (`allowPdfDownload`) — mismo criterio que en creación |
| Efecto en learner | **ON** → botón **Descargar** debajo del PDF en experiencia de estudio; **OFF** → no se muestra |

Demo seed (`p2` / Guía mapa de conflicto): switch **ON**.

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
- **Añadir página** (modal tipo → flujo inmersivo → recurso confirmado).
- **Ocultar / Mostrar** página (con toast si intenta ocultar la última visible).
- **Reemplazar** recurso principal (**mismo tipo**).
- **Reordenar** páginas (incl. ocultas) y secciones; **editar títulos**.
- **Complementarios:** CRUD completo.
- **No:** eliminar página, añadir/ocultar sección, eliminar recurso principal, cambiar tipo vía Reemplazar.

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
| Hash opcional | `#recursos`, `#informacion`, `#certificado`, `#visibilidad`; Resultados: `#resultados-progreso`, `#resultados-evaluaciones`, `#resultados-gestion-intentos`, `#resultados-descargas` | Igual |
| Lista origen | `contenidos.html` | `contenidos.tsx` |
| Borrador | `crear-contenido.html?id={contentId}` | `crear-contenido.tsx?contentId=` |

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

1. Leer este documento, [`contexto-creacion-contenido.md`](./contexto-creacion-contenido.md) y [`decisiones-q-edicion-estructural-contenidos.md`](./decisiones-q-edicion-estructural-contenidos.md).
2. Reutilizar `ImmersiveLayout`, subvistas de `crear-contenido.tsx` / `editar-contenido.tsx` y el patrón **`AgregarVideoImmersive`** + return path para los 8 tipos.
3. Sidebar **`publicado-lms-creator`** con ítem **Resultados** primero.
4. Copy del modal T5 (checkbox, labels de indicadores): **carácter por carácter**.
5. Repo autocontenido — no importar desde `Referente-Vanilla/`.

---

## Notas para quien implemente

- Este documento **no** sustituye la documentación de **Sidebar contenidos LMS** ni la de componentes del paso Recursos.
- Cualquier cambio de copy del **modal de impacto (T5)** o toasts estructurales debe actualizarse aquí y en React (regla 13 del playground).
- Actualizar **`contenidos.html`** para enrutar **Público / Privado / Oculto / Archivado** a `editar-contenido.html` (hoy solo **Borrador** abre drawer al clic en card).
- Al salir de **`editar-contenido.html`** tras guardar: pin en lista (mismo patrón que `ubits-contenidos-pin-recien-creado`).
- Modal Recursos: **cada entrada** a la sección (no flag “una vez por sesión”). Política: última elección; prototipo pierde al reload → Proteger.
- Orden de implementación del Q (recomendado): **T5 → T1 → T3/T4 → T2**; vanilla + React en paralelo.

---

*Última revisión: 2026-07-30 — Q edición estructural: modal T5 cada vez + Proteger/Afectar; añadir página vía flujos inmersivos (8 tipos); ocultar/mostrar en edición; sin Eliminar bajo recurso montado.*
