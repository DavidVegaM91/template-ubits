# Decisiones Q — Edición estructural de contenidos (LMS Creator)

**Estado:** T5 entregado; **T1 implementado** (2026-08-03); **T3+T4 implementados** (2026-08-03); pendiente T2.  
**Autor / dueño:** Hector David Vega  
**Audiencia:** Dave (UX), PM Learn, agentes Cursor  
**Fecha de apertura:** 2026-07-30  

**Documentos hermanos (estado actual del playground):**

- [`contexto-creacion-contenido.md`](./contexto-creacion-contenido.md) — creación (4 pasos).
- [`contexto-edicion-contenidos.md`](./contexto-edicion-contenidos.md) — edición publicada **hoy** (restricciones fuertes: no añadir/eliminar páginas).

Este archivo **no reemplaza** esos dos: describe el **cambio de producto del Q** y lo que hay que decidir antes (o mientras) se implementa. **Los contextos hermanos ya se actualizaron** (P22, 2026-07-30) con las decisiones cerradas; este MD sigue siendo la bitácora de cierre.

---

## 1. Por qué existe este Q (objetivo de negocio)

Hoy en edición publicada el LMS Creator es muy restrictivo: el creador casi solo puede **reemplazar** recursos y editar textos. **No puede añadir ni eliminar páginas** porque eso pega al progreso de estudiantes.

### Cascada de impacto (por qué duele)

1. Un estudiante **finalizó** un contenido de N páginas → progreso del contenido = 100 %.
2. Si el creador **añade** una página → ese estudiante ya **no** tiene el contenido completo → progreso del contenido baja.
3. En **rutas** y **planes de contenidos** el avance suele contar contenidos **completamente finalizados**.
4. Resultado: se “rompe” el progreso del **contenido**, de la **ruta** y del **plan**.
5. Riesgo de negocio: creadores dicen que sin poder agregar/quitar páginas el LMS **no les sirve** → riesgo de **churn**.

### Objetivo del Q

Permitir a creadores **editar de verdad** la estructura del contenido (añadir páginas, “quitar” páginas vía ocultar, etc.), pero **haciendo consciente** el impacto — con modales, opciones de política de avance e indicadores de afectados — y **evitando estados basura** (páginas vacías sin recurso principal).

---

## 2. Paquete de tareas del PM Learn (alcance pedido)

| # | Tarea | Aplica a |
|---|--------|----------|
| **T1** | Quitar el botón **Eliminar** del recurso principal renderizado | `crear-contenido` + `editar-contenido` |
| **T2** | Al **Añadir página**: modal elige tipo → flujo **hermano inmersivo** al estilo **Agregar video** (React: `/agregar-video` → revisar → editor) → página nace con recurso | `crear-contenido` + `editar-contenido` |
| **T3** | En edición: reemplazar **Eliminar página** por **Ocultar / Desocultar**; diseñar variante visual de **Páginas creator** | solo `editar-contenido` |
| **T4** | Validación: no se pueden ocultar **todas** las páginas; siempre ≥ 1 página visible para el learner | solo `editar-contenido` |
| **T5** | Modal de impacto al entrar a Recursos — **prioridad #1 del Q** (si no se entiende, fallamos) | solo `editar-contenido` |

Todas apuntan al mismo objetivo: **edición estructural segura + cero páginas vacías**.

---

## 3. Estado actual vs estado deseado (mapa de choque)

### 3.1 Recurso principal — Eliminar

| Hoy | Deseado (T1) |
|-----|----------------|
| **Crear:** Eliminar permitido → modal «La página quedará en blanco» → vuelve al selector de 8 tipos | **Sin** botón Eliminar bajo el recurso montado |
| **Editar:** Eliminar **disabled** (sigue visible) | **Sin** botón Eliminar (o no renderizarlo) |
| Existe estado «página sin recurso» (icono página en blanco + selector / `default-error` al validar) | Ideal: **no se puede** llegar a página sin recurso principal confirmado |

#### Decisión cerrada (Dave, 2026-07-30) — Eliminar recurso principal (T1)

- [x] **Ni en crear ni en editar** se muestra el botón **Eliminar** bajo el recurso principal ya montado.  
- Cambio de recurso → **Reemplazar** solo del **mismo** tipo (P2). Para cambiar de tipo: en crear **eliminar** página y crear otra; en editar **ocultar** y crear otra.

### 3.2 Añadir página

| Hoy | Deseado (T2) |
|-----|----------------|
| Añade fila al índice con recurso vacío → panel = Resources block selector | Modal **elige tipo** → **flujo hermano inmersivo** (mismo patrón que **Agregar video** en React) → al confirmar, la página nace **con recurso** |
| Video: modal legacy en vanilla; en React ya hay flujo nuevo | El patrón canónico es el de React (abajo), no el modal viejo |

#### Decisión cerrada (Dave, 2026-07-30) — qué significa «como el de video» / experiencia inmersiva

**Referente canónico (React, en construcción):** flujo **Agregar video**

| Pieza | Dónde |
|-------|--------|
| Setup | `/ubits-admin/lms-creator/agregar-video` → `AgregarVideoImmersive` |
| Revisar escenas | `/ubits-admin/lms-creator/agregar-video/revisar-escenas` |
| Editor | `/ubits-admin/lms-creator/agregar-video/editor` |
| Cáscara | **`ImmersiveLayout`** (layout Inmersivo) |
| Vuelta al padre | `returnTo` / session (`saveVideoFlowReturnPath`) → `crear-contenido` o `editar-contenido` `#recursos` |
| Resultado | `pending` en session + montaje del recurso en la página |

**«Inmersivo» aquí =** ese tipo de experiencia: **rutas/páginas propias** con layout Inmersivo, multi-paso si hace falta, salir con back/cancelar al flujo padre — **no** el modal legacy `VideoRecursoModal` ni “solo que use `layout-immersive` por dentro del panel derecho”.

| Sí es | No es |
|-------|--------|
| Patrón **Agregar video** (React) | Modal «Agregar video» viejo del vanilla |
| Flujo dedicado fuera del índice+preview | Solo cambiar el panel derecho de Recursos |
| Layout Inmersivo + return path al padre | Workspace |

**Implicación para T2:** al elegir tipo en el modal «Añadir página», se abre un flujo **del mismo estilo** que Agregar video (cáscara inmersiva, URL(s) propia(s), confirm → vuelve con recurso). PDF/SCORM/etc. reutilizan ese **patrón de navegación**; la UI interna cambia por tipo.

**P7b queda casi cerrada por este referente:** opción **A** (ruta/HTML hermano + return), como ya hace video. Variante `embed` de `AgregarVideoImmersive` (mismo árbol que crear/editar + history) es detalle de implementación, no otro producto.

### 3.3 Eliminar página vs ocultar (solo edición)

| Hoy (edición) | Deseado (T3 + T4) |
|---------------|-------------------|
| Añadir / eliminar página **ocultos** (no permitidos) | **Añadir** permitido (vía T2); **Eliminar** sustituido por **Ocultar / Desocultar** |
| No hay concepto de página oculta en índice | Variante visual nueva en **Páginas creator** (y posiblemente Secciones) |
| — | Siempre ≥ 1 página **visible** |

**Hueco (crear vs editar — páginas):** ver decisión cerrada abajo.

#### Decisión cerrada (Dave, 2026-07-30) — Eliminar vs Ocultar página

| Flujo | Eliminar página | Ocultar / Desocultar |
|-------|-----------------|----------------------|
| **`crear-contenido`** | **Sí** (se mantiene) | **No** existe |
| **`editar-contenido`** | **No** (se reemplaza) | **Sí** (T3 + T4) |

Motivo: en crear no hay progreso de estudiantes publicado; borrar de verdad está bien. Ocultar solo aplica cuando el contenido ya está en circulación.

### 3.4 Modal al entrar a Recursos (solo edición) — **pieza más crítica del Q**

| Hoy | Deseado (T5) |
|-----|----------------|
| Modal chico «Advertencia sobre edición» — *no puedes agregar/eliminar* | **Modal nuevo de punta a punta** (el copy viejo **muere**) |
| Solo **primera vez por sesión** (`sessionStorage`) | **Cada vez** que entran a Recursos (salen a otro paso y vuelven → sale otra vez) |
| Sin política de avance | El creador **elige** el tipo de impacto |
| Sin números | **4 indicadores** de afectados (obligatorios, bien visibles) |
| Sin video | Video explicativo (placeholder OK) |
| Sin checkbox | Checkbox de «entiendo el impacto» |

**Prioridad de producto (Dave):** si el creador **no entiende este modal**, el Q **falla completo** — da igual T1–T4. Es lo más vital del paquete.

#### Decisión cerrada (Dave, 2026-07-30) — política de impacto

Hay **dos** opciones. **Default al primer acceso / tras reload del prototipo = Proteger.** Si el creador ya eligió (misma sesión en prototipo, o persistido en prod), al reentrar a Recursos el modal muestra la **última elección**.

| Opción | Qué pasa con quien **ya llegó a 100 %** en este contenido |
|--------|----------------------------------------------------------|
| **Proteger** *(default)* | Conserva el **100 %** intacto. **No pierde** el avance del contenido. **Conserva certificados** emitidos por ese contenido. Las ediciones estructurales no le “revierten” el logro. |
| **No proteger / Afectar** | Se le **recalcula** el progreso: puede **bajar de 100 %**. Se jode el avance en **este contenido**, en las **rutas** y en los **planes de contenidos** donde esté ese contenido. El certificado se **revoca** y **deja de mostrarse** al estudiante (P12b). |

**Quién “ya finalizó”:** estudiantes con progreso del contenido al **100 %** al momento de aplicar la política.

**Implicación de diseño del modal:**

1. Las dos opciones deben leerse en **2 segundos** (títulos claros + consecuencia en una frase).  
2. **Proteger** preseleccionada en el **primer** acceso (o tras reload en prototipo). Si ya había elegido, al reentrar se muestra la **última** opción.   
3. Los **4 indicadores** no son decoración: anclan el miedo/respeto (“esto toca a N personas / N planes”).  
4. El video refuerza el mensaje; no sustituye a las opciones ni a los números.  
5. El checkbox + botón primario solo habilitados cuando hay entendimiento explícito.  
6. **Salir sin editar** debe seguir existiendo (no forzar a entrar a Recursos).

#### Contenido obligatorio del modal (checklist de UI)

| Bloque | Obligatorio | Notas |
|--------|-------------|--------|
| Título | Sí | `Antes de editar los recursos` |
| Intro corta | Sí | Ver copy cerrado abajo |
| **Selector de impacto** (2 opciones) | Sí | Default = Proteger |
| **Video** explicativo | Sí | Placeholder YouTube/banco hasta video real de Learn |
| **4 indicadores** | Sí | Finalizaron · En curso · Planes · Rutas |
| Checkbox de confirmación | Sí | En el **pie** del modal, zona izquierda. Bloquea CTA primario hasta marcar (P15) |
| CTA secundario | Sí | `Salir sin editar` |
| CTA primario | Sí | `Sí, editar` (deshabilitado hasta checkbox) |

#### Copy UI del modal T5 (propuesta cerrada — iterar después si hace falta)

**Tamaño:** `lg` (modal UBITS estándar). Cabe video + 2 opciones + 4 indicadores + checkbox. Sin tamaño custom.

**Layout:** **dos columnas 50/50 arriba** (grid `repeat(2, minmax(0,1fr))`, gap `lg`) + **bloque de indicadores a ancho completo abajo**; una sola columna bajo 900px.

| Zona | Contenido |
|------|-----------|
| Izquierda (1fr) | Intro + selector de impacto (Proteger / Afectar) |
| Derecha (1fr) | Video explicativo 16:9 |
| Abajo (100 %) | Label `A quiénes afecta este contenido` + indicadores en fila: **3** con Proteger (En curso · Planes · Rutas); **4** con Recalcular (suma `Estudiantes que finalizaron`, porque solo entonces se les afecta) |
| **Pie del modal, zona izquierda** | Checkbox de entendimiento (`ubits-modal-footer__left`), igual que el checkbox «Aplicar a todas las escenas con avatar» del modal **Avatar del video** en `agregar-video/editor`. Los CTA siguen a la derecha del pie. |

**URL de prototipo (React):** `/ubits-admin/lms-creator/editar-contenido?id=f007&seccion=recursos` — entra al flujo real de edición con el modal encima de Recursos. «Sí, editar» deja en Recursos; «Salir sin editar» vuelve a **Portada** (entrada directa). También listada en `/design-system/sitemap` como «Editar · Recursos».

> El pie del modal vanilla acepta control libre a la izquierda vía la opción **`footerLeftHtml`** de `openModal` (añadida en `components/modal.js` para igualar la prop `footerLeft` que ya existía en el `UbitsModal` de React).

**Título:** `Antes de editar los recursos`

**Intro:**  
`Vas a poder añadir u ocultar páginas. Eso puede afectar el progreso de los estudiantes, las rutas, los planes de contenidos y los certificados. Elige cómo quieres manejar el impacto.`  
(En UI: negrita solo en `Vas a poder añadir u ocultar páginas.`)

**Indicador «Estudiantes que finalizaron»:** visible **solo** si la opción elegida es **Recalcular el progreso de todos**. Con Proteger no se muestra (esos estudiantes no se afectan).

**Opción A — Proteger (default)**  
Título: `Proteger a quienes ya finalizaron`  
Descripción: `Los estudiantes que ya completaron este contenido al 100 % mantienen su progreso y sus certificados. Los cambios estructurales no les quitan lo que ya lograron.`

**Opción B — Afectar**  
Título: `Recalcular el progreso de todos`  
Descripción: `El progreso se vuelve a calcular. Quienes habían finalizado pueden dejar de estar al 100 %, perder el certificado, y ver afectado su avance en rutas y planes de contenidos que incluyen este contenido.`

**Indicadores:**

| Dato | Label | Visibilidad |
|------|--------|-------------|
| N finalizaron | `Estudiantes que finalizaron` | Solo con **Recalcular** (con Proteger no se les afecta → no se muestra) |
| N en curso | `Estudiantes en curso` | Siempre |
| N planes | `Planes de contenidos` | Siempre |
| N rutas | `Rutas de aprendizaje` | Siempre |

**Checkbox (P15):**  
`Entiendo el impacto que pueden tener estas ediciones en el progreso de los estudiantes, rutas, planes y certificados.`

**Botones:** secundario `Salir sin editar` · primario `Sí, editar`

**Video (cerrado):** YouTube placeholder `https://www.youtube.com/watch?v=HXoFyBxwv7s` (P17). Video UBITS (tema no relacionado); no es el oficial del impacto estructural.

**Frecuencia (cerrada):** el modal sale **cada vez** que entran a Recursos. Si salen a Certificado, Portada/Información, Visibilidad, etc. y vuelven a Recursos → **vuelve a salir**.

---

## 4. Invariantes de producto

1. **Ninguna página “viva” en el índice existe sin recurso principal confirmado** (crear y editar). Si en el flujo inmersivo de alta de recurso el usuario **abandona sin finalizar**, la página **ni siquiera se crea** en el índice.
2. **Reemplazar** = mismo tipo de recurso. Para cambiar de tipo: **eliminar** página (crear) u **ocultar** + crear otra (editar).
3. En **edición**, las páginas no se **borran**: se **ocultan** al learner; el creador puede **desocultar**. En **creación**, sí se pueden **eliminar** páginas (no hay ocultar).
4. Siempre hay **al menos una página visible**.
5. **Antes de tocar Recursos en edición**, el creador pasa por el **modal T5**, elige política de impacto y confirma que entiende. **Si no entiende el modal, el Q falla.**
6. Política de impacto: **Proteger** (default) vs **Afectar** — semántica en §3.4.
---

## 5. Impacto por flujo (sin dejar huecos)

### 5.1 `crear-contenido` (Borrador / no publicado)

| Área | Impacto si implementamos el paquete |
|------|-------------------------------------|
| Índice + «Añadir página» | Modal tipo → flujo hermano; **índice sin fila** hasta confirmar recurso. Si abandona el flujo → **no se crea** la página. |
| Panel derecho Resources block (cuadrícula 8 tipos) | **Fuera** como vía de alta (P8). Panel derecho = recurso montado / preview. Selector de tipos solo en modal T2. |
| Cancelar en formulario intermedio (PDF vacío, etc.) | **Obsoleto** con T2: no hay formularios intermedios en panel derecho que dejen página sin recurso. Abandonar inmersivo = no se crea página (P6). |
| Eliminar recurso principal | Se quita (T1) |
| Eliminar página / sección | **Crear:** Eliminar página **sí**. **Editar:** no eliminar → Ocultar/Desocultar (T3). Sin ocultar en crear. |
| Validación al publicar | Menos casos `default-error` por página vacía; puede simplificarse |
| Status panel (IA video/SCORM) | Texto «Se eliminó el recurso» al eliminar principal — **revisar** si ya no hay Eliminar |
| Complementarios | Siguen debajo del principal; sin Eliminar principal, ¿cómo se “resetea” la página? Solo Reemplazar / Eliminar página |
| Vanilla + React | Mismo comportamiento en ambos |

### 5.2 `editar-contenido` (Público / Privado / Oculto)

| Área | Impacto |
|------|---------|
| Modal entrada Recursos | Sustituir por modal T5; sale **cada vez** que entran a Recursos (no sessionStorage de “solo 1 vez”) |
| Añadir página | Se habilita (hoy oculto) + flujo T2 |
| Eliminar página | Se reemplaza por Ocultar/Desocultar (T3) |
| Páginas creator | Nueva variante visual (oculta / visible) |
| Validación T4 | Bloquear ocultar la última visible (toast/modal) |
| Reordenar | ¿Se puede reordenar ocultas? ¿van al final? |
| Learner / exp-estudio | Páginas ocultas **no** cuentan en navegación ni en % de avance (definir con política T5) |
| Resultados (sección edición) | ¿Métricas se recalculan al guardar? ¿async 30 min como planes? |
| Archivado readonly | Sin cambios estructurales |
| Borrador vía `crear-contenido?id=` | Sigue reglas de **crear**, no de editar |

### 5.3 Experiencia del estudiante (centro del Q — gobernado por T5)

| Tema | Con **Proteger** (default) | Con **Afectar** |
|------|----------------------------|-----------------|
| Quien ya estaba al **100 %** | Sigue al 100 %; progreso intacto | Se recalcula; puede bajar de 100 % |
| **Certificado** de ese contenido | Lo **conserva** | Se **revoca** / **deja de mostrarse** (P12b) |
| Rutas / planes que incluyen el contenido | No se le “rompe” el logro por este contenido | El avance en ruta/plan se puede **joder** porque el contenido ya no cuenta como finalizado |
| Quien **aún no** había finalizado | Sigue la estructura nueva (páginas añadidas/ocultas) en su % | Igual: estructura nueva; además los ex-finalizados dejan de estar completos |

Páginas ocultas (T3): **no aparecen** en el índice del learner y **no se pueden abrir** (P10). El efecto en **avance** al ocultar lo gobierna la política T5 (P11).

### 5.4 Design system / componentes

| Componente | Cambio |
|------------|--------|
| **Resources block** | Menos uso del selector embebido; pie sin Eliminar en recurso montado |
| **Páginas creator** | Variante **oculta** (estilo + menú ⋮ Ocultar/Desocultar) — T3 |
| **Modal** | Nuevo layout ampliado (video + radios/cards de impacto + stats + checkbox) — tamaño **`lg`** |
| **Selection card / Resources card** | Reuso en modal «elegir tipo de recurso» al añadir página |
| Doc de componentes | Actualizar demos de Páginas creator + Resources block |

### 5.5 Datos mock / playground

Para T5, los 4 números en playground son **hardcode** en la page de editar (P16) — solo prototipo visual.

---

## 6. Cómo trabajar esta ocasión (recomendación + decisión)

### Opción A — Documento primero, luego código (recomendada para este Q)

1. Cerrar preguntas de la sección 8 en este MD.  
2. Actualizar `contexto-edicion-contenidos.md` + trozos de `contexto-creacion-contenido.md`.  
3. Implementar en **vanilla** (source of truth visual).  
4. Portar a **React**.  
5. Refinar UI con Dave en local / Vercel.

**Pros:** menos retrabajo en un cambio que toca progreso, rutas, planes y DS.  
**Contras:** más lento al “ver algo en pantalla”.

### Opción B — Como siempre: vanilla + React en paralelo y refinar

**Pros:** feedback visual rápido.  
**Contras:** con T5 (política de avance) y T2 (inmersivo por tipo) es fácil construir la UI equivocada 2–3 veces.

### Opción C — Híbrido

Cerrar solo las decisiones **bloqueantes** (sección 7) → prototipar T1 + T3 + T4 en vanilla → en paralelo definir T2/T5 en este doc → luego el resto.

---

### Decisión de proceso (elige una)

| Opción | Tu elección |
|--------|-------------|
| A — Doc cerrado → vanilla → React | ☐ |
| B — Código ya y refinamos | ☐ |
| C — Híbrido (bloqueantes ya; T2/T5 después) | ☐ |

**Cerrado vía P21:** vanilla + React juntos; orden T5 → T1 → T3/T4 → T2.

---

## 7. Decisiones bloqueantes vs diferibles

### Bloqueantes (sin esto el Q no tiene sentido)

- ~~Política proteger vs afectar~~ → **cerrada** en §3.4: default **Proteger** (100 % + certificados intactos); **Afectar** = se jode progreso del contenido + rutas + planes + se queda sin certificado.  
- **Modal T5** (comprensión del creador) = **prioridad #1** del Q. Si no se entiende, fallamos.  
- ~~«Como el de video»~~ → patrón Agregar video React.  
- ~~Eliminar vs ocultar página~~ → P9.  
- ~~Modal T5 copy + tamaño~~ → **cerrado** (propuesta §3.4: título/intro/botones + `lg`; se itera en UI si hace falta).  
- ~~P7~~ → **todos** los 8 tipos con flujo hermano inmersivo.  
- ~~P15~~ → checkbox obligatorio + copy aprobado.  
- ~~P14 / P17 / P22~~ cerradas.

### Diferibles (placeholder OK)

- Video **real** del modal (URL placeholder primero).  
- Números exactos de afectados (mock fijo primero).  
- Pixel-perfect variante oculta Páginas creator.  
- Comunicaciones al estudiante en producción.

---

## 8. Preguntas abiertas + opciones de respuesta

Marca con `[x]` la opción elegida o escribe una variante en **Otra**. Si una pregunta no aplica, marca **N/A** y di por qué.

---

### P1 — Alcance de T1 (quitar Eliminar recurso principal) (CERRADA)

**Cerrado (Dave, 2026-07-30):**

- [x] **A.** Sí: ni crear ni editar muestran **Eliminar** bajo el recurso montado.

**Notas:**

> _

---

### P2 — ¿Cómo se cambia de tipo de recurso (video → PDF) sin Eliminar? (CERRADA)

**Cerrado (Dave, 2026-07-30):**

- [x] **A.** Solo **Reemplazar** del **mismo** tipo; para cambiar de tipo hay que **ocultar** (editar) o **eliminar** (crear) la página y crear otra.

**Notas:**

> _

---

### P3 — Complementarios al Reemplazar / cambiar tipo (N/A en gran parte)

**Con P2 = A:**

- **Cambiar tipo** ya no pasa por Reemplazar → esta parte de P3 **no aplica**.
- **Reemplazar mismo tipo** sí puede existir (PDF→otro PDF, etc.).

**Cerrado para este Q (Dave, 2026-07-30):** no diseñamos regla nueva. Se **mantiene el comportamiento actual** del playground/product (complementarios según reglas ya documentadas en creación; p. ej. excepción Evaluación). Fuera de alcance inventar política nueva de complementarios.

- [x] **N/A / comportamiento actual** — no es decisión nueva de este Q.

**Notas:**

> _

---

### P4 — Modal «Añadir página» (T2): ¿qué elige el usuario? (CERRADA)

**Cerrado (Dave, 2026-07-30):**

- [x] **A.** En el modal solo el **tipo** de recurso (8 tarjetas).  
- **Nombre de página:** todas nacen con **`Título de la página`**. El usuario puede cambiarlo; si lo deja **vacío**, vuelve a **`Título de la página`** (no se permite título vacío).

El nombre **no** se pide en el modal de tipo; se edita en el flujo / índice como hoy (inline), con ese default y fallback.

**Notas:**

> _

---

### P5 — ¿Cuándo aparece la fila en el índice? (CERRADA)

**Cerrado (Dave, 2026-07-30):**

- [x] **A.** La fila aparece **solo al confirmar** el recurso en el flujo inmersivo. Antes **no** hay fila.

---

### P6 — Cancelar / abandonar a mitad del flujo inmersivo (CERRADA)

**Cerrado (Dave, 2026-07-30):**

- [x] **A.** Si abandona sin finalizar, la página **ni siquiera se crea** (como si no hubiera pulsado Añadir página).

**Notas:**

> _

---

### P7 — Flujos hermanos tipo Agregar video — alcance MVP por tipo (CERRADA)

**Cerrado (Dave, 2026-07-30):**

- Referente: flujo React **Agregar video** (`/agregar-video` → revisar → editor).  
- [x] **Todos** los tipos del selector (8) van por el **mismo patrón** de flujo hermano inmersivo (modal tipo → experiencia inmersiva → return al padre). No hay excepciones “panel derecho” / “fuera de MVP” en este Q.

| Tipo | ¿Flujo hermano inmersivo? |
|------|---------------------------|
| Video | [x] Sí (ya en React) |
| PDF | [x] Sí |
| SCORM | [x] Sí |
| Embebido | [x] Sí |
| Texto | [x] Sí |
| Evaluación final | [x] Sí |
| Encuesta libre | [x] Sí |
| Encuesta satisfacción | [x] Sí |

La UI **interna** de cada flujo puede diferir; el **patrón de navegación** es el mismo.

**Notas:**

> _

---

### P7b — Navegación padre ↔ flujo recurso (CERRADA)

**Cerrado por el patrón Agregar video:**

- [x] **A.** Rutas hermanas inmersivas + `returnTo` / session al padre (`crear-contenido` / `editar-contenido` `#recursos`).  
- [ ] ~~B. Misma URL, solo cambia stage~~  
- [ ] ~~C. Overlay fullscreen~~  

Detalle de implementación ya usado en video: variante `embed` vs `page` de `AgregarVideoImmersive`. Otros tipos deberían reutilizar el mismo contrato (`save*FlowReturnPath` + pending result).

**Notas:**

> _

---

### P8 — ¿El selector de 8 tipos en el panel derecho sobrevive? (CERRADA — ya estaba decidido)

**Cerrado / redundante con T2 + P5/P6:**

El alta de recurso **no** pasa por el panel derecho (cuadrícula Resources block embebida). Flujo canónico:

1. Modal «Añadir página» → elige tipo (8 tarjetas)  
2. Flujo hermano inmersivo (patrón Agregar video)  
3. Al confirmar → página en el índice **con** recurso  

- [x] **A.** Se **elimina** como vía de alta en crear y editar: no hay selector vacío en el panel derecho.

El componente Resources block puede seguir existiendo en **doc/demos** del design system; en el producto Creator el panel derecho muestra el **recurso montado** (o vacío solo si no hay página activa), no la cuadrícula de 8 para “empezar”.

**Notas:**

> _

---

### P9 — Crear vs editar: Eliminar página vs Ocultar (CERRADA)

**Cerrado (Dave, 2026-07-30):**

- [x] **C.** En **crear:** se mantiene **Eliminar** página. En **editar:** **Ocultar / Desocultar** (sin Eliminar). En crear **no** hay ocultar.

**Notas:**

> _

---

### P10 — Ocultar página (editar): semántica para el learner (CERRADA)

**Cerrado (Dave, 2026-07-30):**

- [x] **A.** La página **no aparece** en el índice del estudiante; **no se puede abrir**.

**Notas:**

> _

---

### P11 — Avance del estudiante en una página que luego se oculta (CERRADA)

**Cerrado (Dave, 2026-07-30):**

- [x] **C.** Depende de la política del modal T5 (proteger vs afectar).

| Política | Efecto tentativo al ocultar (alineado a §3.4) |
|----------|-----------------------------------------------|
| **Proteger** | Quien ya estaba al 100 % **conserva** su logro (progreso/certificado intactos). |
| **Afectar** | Se **recalcula**: ocultar puede bajar el % (esa página ya no cuenta / deja de estar disponible) y cascada a rutas/planes/certificado según §3.4. |

Detalle fino de “¿se conserva el avance de esa página si desocultan?” puede refinarse en implementación; la **regla de gobierno** es la política T5.

**Notas:**

> _

---

### P12 — Política proteger vs afectar (CERRADA en lo esencial)

**Cerrado (Dave, 2026-07-30)** — detalle en §3.4:

| | |
|--|--|
| **Default** | Siempre **Proteger** |
| **Proteger** | Quien ya estaba al **100 %** conserva progreso **intacto** y **certificados** |
| **Afectar** | Se recalcula: se jode progreso del **contenido**, de **rutas** y **planes**; se queda **sin certificado** |

**Persistencia de la elección (cerrada — Dave, 2026-07-30):**

- [x] Al cambiar la opción, **esa** queda como la elegida.  
- [x] Si sale de Recursos y **vuelve a entrar**, el modal sale otra vez (P14) con la **última opción seleccionada** ya marcada (no fuerza Proteger otra vez si ya había elegido Afectar).  
- [x] **Producción:** la selección se **persiste** en el contenido y se vuelve a mostrar cada vez que entra a Recursos.  
- [x] **Playground / prototipo:** igual que el resto de demos — si **recarga** la página, se pierde el estado → el modal vuelve a abrir con **Proteger** por defecto. Sin reload, se respeta la última elección de la sesión.

**P12b — wording “sin certificado” (CERRADA)**

**Cerrado (Dave, 2026-07-30):**

- [x] **A.** El certificado se **revoca** / **deja de mostrarse** al estudiante.

**Notas:**

> _

---

### P13 — ¿Ocultar dispara otro modal? (N/A)

**N/A (Dave, 2026-07-30):** con P14 el modal T5 sale al **entrar a Recursos**, no al pulsar Ocultar/Añadir. No hay modal aparte para ocultar.

Lo que sí aplica: **ocultar afecta al estudiante según la política** elegida en ese modal (Proteger / Afectar) — ya cerrado en **P11**.

- [x] **N/A** — redundante con P14 + P11.

**Notas:**

> _

---

### P14 — Frecuencia del modal ampliado (T5) (CERRADA)

**Cerrado (Dave, 2026-07-30):**

- [x] **C.** **Cada vez** que entran a Recursos. Si salen a otro paso (Certificado, Portada/Información, Visibilidad, Resultados, etc.) y vuelven → el modal **vuelve a salir**.

Ya **no** aplica el `sessionStorage` “solo primera vez por sesión” del modal viejo.

**Notas:**

> _

---

### P15 — Checkbox de confirmación (T5) (CERRADA)

**Cerrado (Dave, 2026-07-30):**

- [x] **A.** Obliga a marcar para habilitar el botón primario («Continuar» / «Sí, editar»).  
- [x] Copy aprobado:  
  `Entiendo el impacto que pueden tener estas ediciones en el progreso de los estudiantes, rutas, planes y certificados.`

**Notas:**

> _

---

### P16 — Indicadores de afectados (mock) (CERRADA)

**Cerrado (Dave, 2026-07-30):**

- [x] **C.** Hardcode en la page de editar (solo prototipo visual). No hace falta BD mock nueva en este Q.

**Labels exactos (neutro) — confirmados OK (Dave, 2026-07-30):**

| Indicador | Label |
|-----------|--------|
| Finalizaron | `Estudiantes que finalizaron` |
| En curso | `Estudiantes en curso` |
| Planes | `Planes de contenidos` |
| Rutas | `Rutas de aprendizaje` |

- [x] OK

**Notas:**

> _

---

### P17 — Video del modal T5 (CERRADA)

**Cerrado (Dave, 2026-07-30):**

- [x] **A.** YouTube embebido (Video player UBITS) con URL placeholder.  
- Cualquier video externo sirve; Dave no define cuál.

**URL placeholder (playground):**  
`https://www.youtube.com/watch?v=HXoFyBxwv7s`  
(Video UBITS de otro tema — placeholder visual; se cambia cuando Learn entregue el video oficial del impacto estructural)

**Notas:**

> _

---

### P18 — Variante visual Páginas creator (ocultar)

**Aspecto visual (cerrado — Dave, 2026-07-30):**

- [x] **Otra:** Opacidad baja + icono `fa-eye-slash` + label **«Oculta»** + **texto tachado** (título de la página).

Menú ⋮ en edición *(cerrado — Dave, 2026-07-30)*:

- [x] Quitar **Eliminar**; añadir **Ocultar** / **Mostrar** (según estado).

**¿Las páginas ocultas se pueden reordenar?** *(cerrado — Dave, 2026-07-30)*

- [x] Sí  

**Notas:**

> _

---

### P19 — Última página visible (T4)

**Si intenta ocultar la última visible (cerrado — Dave, 2026-07-30):**

- [x] **A.** Toast error: `Debe haber al menos una página visible.`

**¿Se puede ocultar una sección entera si eso deja 0 páginas visibles?** *(cerrado — Dave, 2026-07-30)*

- [x] **No aplica** — en este Q **no se ocultan secciones**. Solo páginas. La regla de ≥ 1 visible es a nivel contenido (T4 / toast P19).

**Notas:**

> _

---

### P20 — Añadir / ocultar sección en edición (CERRADA)

**Cerrado (Dave, 2026-07-30):**

- [x] **A.** Sigue **prohibido** en este Q (solo páginas: añadir, ocultar/mostrar). No añadir ni ocultar sección.

**Notas:**

> _

---

### P21 — Orden de implementación + repos (CERRADA)

**Cerrado (Dave, 2026-07-30):** orden el que más convenga al agente; **vanilla + React** en el mismo esfuerzo (paridad).

**Orden cómodo (recomendado / aplicado):**

1. **T5** — modal de impacto (sin esto el Q no tiene sentido)  
2. **T1** — quitar Eliminar bajo recurso montado (crear + editar)  
3. **T3 + T4** — ocultar/mostrar + toast última visible + variante Páginas creator  
4. **T2** — añadir página: modal tipo → flujos tipo Agregar video (el más gordo)

- [x] Orden a criterio del agente (arriba)  
- [x] **Vanilla y React** en el mismo sprint (paridad)

**Notas:**

> _

---

### P22 — ¿Cuándo actualizamos los contextos hermanos?

**Qué pregunta:**  
Cuando cerremos este MD, hay que actualizar también:

- `contexto-edicion-contenidos.md`  
- `contexto-creacion-contenido.md`  

(hoy dicen cosas viejas, tipo “no puedes agregar/eliminar páginas” y el modal chiquito).

**Opciones:**

- **A.** Actualizar esos docs **ya**, antes de codear.  
- **B.** Ir actualizando **trozo a trozo** cada vez que cerremos una tarea (T1…T5).  
- **C.** Dejarlos para el **final** del Q, cuando todo esté implementado.

**No es código de producto** — solo documentación de contexto para no mentirle al siguiente agente/PM.

**Cerrado (Dave, 2026-07-30):**

- [x] **A.** Actualizar `contexto-edicion-contenidos.md` y `contexto-creacion-contenido.md` **antes** de codear (a partir de este MD de decisiones).

**Notas:**

> _

---

## 9. Matriz de riesgos (si codeamos sin cerrar X)

| Si no cerramos… | Riesgo |
|-----------------|--------|
| P5/P6 (cuándo nace la página) | **Cerrada** — solo al confirmar; abandonar = no se crea |
| P7 (qué tipos además de video) | **Cerrada** — los 8 tipos con patrón Agregar video |
| P7b | **Cerrada** — patrón Agregar video (rutas hermanas + return) |
| P12 (proteger vs afectar) | **Cerrada** (semántica + persistencia + certificado se revoca / no se muestra) |
| **Modal T5 mal entendido** | **Falla el Q completo** — prioridad de diseño #1 |
| P10 (ocultar vs learner) | **Cerrada** — no aparece en índice / no se abre |
| P11 (ocultar vs avance) | **Cerrada** — depende de política T5 (Proteger / Afectar) |
| P8 (destino del selector) | **Cerrada** — no va en panel derecho; solo modal T2 → inmersivo |
| P20 (secciones) | **Cerrada** — solo páginas; no añadir/ocultar sección |

---

## 10. Checklist de “aterrizaje completo” (antes de decir “listo para codear”)

- [x] Sección 6 (proceso A/B/C) elegida — vía P21 (vanilla + React; orden T5→T1→T3/T4→T2)  
- [x] P1–P22 respondidas o marcadas N/A con motivo  
- [x] Copy UI del modal T5 (título, intro, opciones, checkbox, labels, botones) — §3.4  
- [x] Persistencia de la política (P12): última elección al reentrar; prod guarda; prototipo pierde al reload → Proteger  
- [x] P12b: certificado se revoca / deja de mostrarse  
- [ ] Ref Figma o wire del modal ampliado — **opcional**; se prototipa directo en código  
- [x] Tamaño modal T5 = `lg`  
- [x] Referente «como el de video» = flujo React **Agregar video** (`AgregarVideoImmersive` + `/agregar-video/*`)  
- [x] Navegación = rutas hermanas + return (P7b)  
- [x] Los 8 tipos con el mismo patrón (P7)   
- [x] Vanilla + React en paralelo (P21)  
- [x] Actualizados `contexto-edicion-contenidos.md` y `contexto-creacion-contenido.md` (P22)  

---

## 11. Resumen en una frase (para alinear con el PM)

> **Queremos que el creador pueda cambiar la estructura del contenido publicado sin páginas vacías, pero solo después de entender —en un modal imposible de malinterpretar— si protege a quienes ya finalizaron (default: progreso + certificados intactos) o recalcula todo (se jode contenido, rutas, planes y certificados). Ocultar reemplaza eliminar en edición; añadir página usa flujos tipo Agregar video.**

---

## 12. Bitácora de respuestas (Dave)

| Fecha | Qué cerró | Link / nota |
|-------|-----------|-------------|
| 2026-07-30 | Documento abierto | — |
| 2026-07-30 | «Como el de video» = flujo React **Agregar video** (`/agregar-video` → revisar → editor), no modal legacy | §3.2 + P7/P7b |
| 2026-07-30 | Crear = Eliminar página; Editar = Ocultar/Desocultar (sin ocultar en crear) | §3.3 + P9 |
| 2026-07-30 | Modal T5 = pieza más vital; Proteger (default) vs Afectar (progreso+rutas+planes+certificado); indicadores obligatorios | §3.4 + P12 |
| 2026-07-30 | Página solo al confirmar recurso; abandonar flujo inmersivo = no se crea | invariante 1 + P5/P6 |
| 2026-07-30 | Modal T5 **cada vez** que entran a Recursos (no una vez por sesión) | §3.4 + P14 |
| 2026-07-30 | T1: sin Eliminar bajo recurso montado en **crear y editar** | P1 |
| 2026-07-30 | Reemplazar = mismo tipo; cambiar tipo = nueva página (ocultar/eliminar la vieja) | P2 |
| 2026-07-30 | P3 N/A (cambiar tipo fuera); Reemplazar mismo tipo = comportamiento actual de complementarios | P3 |
| 2026-07-30 | Modal añadir = solo tipo; default nombre `Título de la página`; vacío → vuelve al default | P4 |
| 2026-07-30 | Selector 8 tipos **no** en panel derecho (ya implícito en T2); solo modal → inmersivo | P8 |
| 2026-07-30 | Página oculta: no aparece en índice learner ni se puede abrir | P10 |
| 2026-07-30 | Avance al ocultar página = según política T5 (Proteger / Afectar) | P11 |
| 2026-07-30 | Política T5: última elección se recuerda al reentrar; prod persiste; prototipo pierde al reload → Proteger | P12 persistencia |
| 2026-07-30 | Con Afectar: certificado se **revoca** / deja de mostrarse | P12b |
| 2026-07-30 | P13 N/A (modal no se dispara al ocultar); ocultar sí afecta según política T5 (P11) | P13 |
| 2026-07-30 | Indicadores T5: hardcode en page editar (prototipo visual) | P16 |
| 2026-07-30 | Labels indicadores T5 confirmados | P16 labels |
| 2026-07-30 | Video T5 placeholder YouTube: `aqz-KE-bpKQ` (Big Buck Bunny) | P17 |
| 2026-07-31 | Video T5 placeholder → `HXoFyBxwv7s` (video UBITS; no oficial del impacto) | P17 |
| 2026-07-30 | Página oculta: opacidad baja + `fa-eye-slash` + label «Oculta» + título tachado | P18 visual |
| 2026-07-30 | Menú ⋮ edición: sin Eliminar; Ocultar / Mostrar según estado | P18 menú |
| 2026-07-30 | Páginas ocultas **sí** se pueden reordenar | P18 reorder |
| 2026-07-30 | Última visible: toast `Debe haber al menos una página visible.` | P19 |
| 2026-07-30 | Este Q **no** oculta secciones (N/A) | P19 sección |
| 2026-07-30 | Secciones en edición: sigue prohibido añadir/ocultar (solo páginas) | P20 |
| 2026-07-30 | Orden T5→T1→T3/T4→T2; vanilla + React en paralelo | P21 |
| 2026-07-30 | Contextos hermanos se actualizan **antes** de codear | P22 |
| 2026-07-30 | Los **8 tipos** van a flujo hermano inmersivo (patrón Agregar video) | P7 |
| 2026-07-30 | Checkbox T5 obligatorio + copy aprobado | P15 |
| 2026-07-30 | Contextos hermanos actualizados con decisiones cerradas | P22 hecho |
| 2026-07-31 | Copy + tamaño modal T5 propuestos y cerrados (`lg`; título `Antes de editar los recursos`; CTA `Sí, editar`) | §3.4 |
| 2026-08-03 | **T1 implementado** (vanilla + React): sin botón Eliminar bajo recurso principal montado (crear + editar). Editar publicado: footer Descargar / Reemplazar. SCORM crear: solo Editar SCORM. | T1 |
| 2026-08-03 | **T3+T4 implementados** (vanilla + React): menú ⋮ en edición con Ocultar/Mostrar; variante visual (opacidad + tachado + badge «Oculta»); toast si intenta ocultar la última visible. Crear sigue con Eliminar (sin Ocultar). | T3 / T4 |

---

**Próximo paso:** implementar **T2** (añadir página vía flujos inmersivos tipo Agregar video). Vanilla + React.
