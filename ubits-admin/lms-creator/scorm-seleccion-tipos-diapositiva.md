# SCORM con IA — Selección de tipos de diapositiva

Documento de **producto y UX** sobre cómo el usuario elige **qué tipos de diapositiva** incluir en el modal **«Agregar SCORM»** (pestaña **SCORM con IA**).

**Relacionado con:** `contexto-creacion-contenido.md` (experiencia general del paso Recursos y SCORM).

---

## Decisión acordada (implementada en playground)

| Regla | Detalle |
|-------|---------|
| **Sin control de “número de slides”** | Se elimina el stepper 5–15. La cantidad **sale sola** de cuántos tipos están marcados. |
| **Una diapositiva por tipo** | Si el tipo está marcado → entra **exactamente una** slide de esa plantilla. |
| **Por defecto** | Los **15 tipos** vienen **marcados**. Desmarcar = ese tipo **no** aparece. |
| **Portada** | Tipo **intro** siempre incluida (checkbox deshabilitado). |
| **Orden** | Sigue el **orden pedagógico fijo** del catálogo (no reordenar en el modal). |
| **Mínimo** | **Ninguno** (puede generar solo portada u otro subconjunto que elija). |
| **Preview** | El iframe muestra el mismo conjunto que se generará. |

**Por qué es KISS:** desaparece el conflicto “5 slides pero 15 tipos” o “bajar N y desmarcar al revés”. Una sola palanca: **qué tipos quiero**.

---

## 1. Contexto: cómo funcionaba antes (histórico)

| Elemento | Comportamiento actual |
|----------|------------------------|
| **Catálogo** | **15 tipos** de diapositiva, cada uno con **una plantilla** en el producto (intro, contenido, pasos, cita, dato clave, split, media con hotspots, acordeón, pestañas, flashcards, línea de tiempo, comparativa, quiz opción múltiple, emparejamiento, resumen). |
| **Orden pedagógico** | Orden **fijo** en una “cola” interna: siempre el mismo recorrido (intro primero, evaluación hacia el final, resumen al cierre, etc.). |
| **Número de slides** | El usuario elige **cuántas** diapositivas (entre **5 y 15**) con un control numérico. |
| **Generación** | El sistema toma las **primeras N** diapositivas de esa cola (N = número elegido). Con N = 15 aparecen los 15 tipos; con N = 5 solo las cinco primeras del recorrido. |
| **Vista previa** | El iframe del modal refleja **exactamente** esa lógica (misma cola, mismo N). |
| **Después de generar** | En **Editar presentación** el usuario ya puede **eliminar** diapositivas una a una (con confirmación) y editar textos. |

**Modelo mental actual (simple):** *“Quiero un módulo más corto o más largo”* → solo muevo el número. No elijo *qué* tipos entran.

---

## 2. Qué piden y por qué duele

**Pedido:** que el usuario pueda **elegir qué tipos de diapositiva** quiere (no solo cuántas).

**Valor real**

- Evitar tipos que no encajan (p. ej. sin evaluación en un micro-módulo).
- Alinear expectativa con el preview antes de gastar tokens.
- Diferenciar módulos “solo contenido” vs “con interactividad” vs “con cierre evaluativo”.

**Por qué se vuelve un chicharrón**

Dos dimensiones independientes chocan:

1. **Cuántas** diapositivas (5–15).
2. **Cuáles tipos** (hasta 15 checkboxes o equivalente).

Casos que hay que resolver sí o sí:

| Caso | Tensión |
|------|---------|
| Elige **5 slides** pero marca **8 tipos** | ¿Cuáles entran? ¿Orden? |
| Marca **15 tipos** y baja a **5 slides** | Hay que **quitar 10** sin sorpresa |
| Desmarca un tipo que ya estaba en el preview | Preview y contador deben **reaccionar al instante** |
| Intro / resumen / quiz | ¿Son **obligatorios** o opcionales? |
| IA y contenido | ¿La IA rellena solo los tipos elegidos o siempre genera las 15 y luego se filtran? |

Cada combinación multiplica **estados del preview**, mensajes de error y pruebas. Eso es lo que hay que **acotar con reglas de producto**, no solo con más UI.

---

## 3. Principios para mantener KISS

Antes de elegir UI, conviene acordar estas reglas:

1. **Una decisión principal por pantalla** — Si el usuario debe pensar en 15 casillas + un número, ya perdió KISS.
2. **Orden fijo en v1** — No dejar **reordenar** tipos en el modal (el editor post-generación ya permite quitar slides; reordenar es otra fase).
3. **Intro siempre** — La portada (`intro`) debe estar **siempre** en el módulo generado (identidad del SCORM).
4. **Un solo número que manda** — O bien el **número de slides** manda y los tipos son un **filtro del catálogo**, o bien un **preset** fija ambos. Evitar dos controles “libres” sin sincronización automática.
5. **Preview = verdad** — Lo que se ve en el iframe antes de **Generar presentación** debe ser **idéntico** a lo que se generará (misma lista filtrada, mismo N).
6. **Post-generación como válvula de escape** — Eliminar diapositivas en **Editar presentación** sigue siendo la forma “quirúrgica” de afinar; el modal no tiene que resolver el 100 % de los casos.

---

## 4. Alternativas

### A — No hacer nada en el modal (solo educar)

**Qué es:** Mantener solo **número de slides**; documentar que para quitar tipos concretos usen **Editar presentación** después de generar.

| Pros | Contras |
|------|---------|
| Cero complejidad nueva | No cumple el pedido explícito de “elegir tipos antes” |
| Ya existe eliminar slide | Gasto de tokens en slides que luego borran |

**Cuándo tiene sentido:** si el pedido es “nice to have” y el costo de tokens no es crítico.

---

### B — Presets de módulo (recomendada como v1)

**Qué es:** Sustituir (o acompañar) la pregunta “¿cuántas?” por **plantillas de módulo** con nombre de negocio. El número de slides y los tipos vienen **empaquetados**.

Ejemplos posibles:

| Preset | Slides (aprox.) | Idea |
|--------|-----------------|------|
| **Express** | 5 | Intro + contenido esencial + cierre (sin evaluación ni interactividad pesada) |
| **Estándar** | 10 | Recorrido equilibrado sin todos los interactivos |
| **Completo** | 15 | Los 15 tipos del catálogo |
| **Con evaluación** | 8–10 | Intro, contenido, quiz o match, resumen (sin obligar los 15) |
| **Solo contenido** | 6–7 | Intro, content, steps, quote o keypoint, summary (sin quiz/media complejos) |

**UI sugerida**

- Control principal: **tarjetas o radio** con preset (icono + título + una línea: “5 diapositivas · sin quiz”).
- **Opcional:** enlace **“Personalizar número (avanzado)”** que muestra el stepper actual **solo** si el preset lo permite, con tope = slides del preset.
- Preview: se actualiza al cambiar preset (sin checklist).

| Pros | Contras |
|------|---------|
| KISS para el 90 % de usuarios | Menos granularidad (no “solo acordeón + quiz”) |
| Cero conflicto N vs tipos | Hay que definir y mantener presets con negocio |
| Preview trivial de mapear | PM debe validar nombres y composición |

---

### C — Filtro por familias (compromiso medio)

**Qué es:** No 15 checkboxes; **4–5 grupos** con switch o checkbox:

| Familia | Tipos que agrupa (ejemplo) |
|---------|----------------------------|
| **Inicio y cierre** | intro, summary (intro bloqueado ON) |
| **Contenido narrativo** | content, steps, quote, keypoint, split |
| **Interactividad** | media, accordion, tabs, flashcards, timeline, compare |
| **Evaluación** | quiz_mc, match |

**Regla de generación:** se construye la cola filtrando familias activas **en el orden pedagógico original**; luego `slice(0, N)` con el número de slides.

**Sincronización con N**

- `N máximo` = cantidad de slides disponibles tras filtrar familias.
- Si el usuario **baja N** → no hace falta desmarcar familias.
- Si **desmarca una familia** y quedan menos slides que N → **bajar N automáticamente** al nuevo máximo y mostrar aviso breve: *“Ajustamos el número de diapositivas al contenido seleccionado (ahora X).”*

| Pros | Contras |
|------|---------|
| Más control que presets sin 15 casillas | Sigue habiendo casos “quiero 5 slides pero 4 familias ON” |
| Preview sigue siendo determinista | Definición de familias debe ser clara en UI |

---

### D — Checklist de 15 tipos (la opción “cabrona”)

**Qué es:** Lista de los 15 tipos con checkbox; el usuario marca libremente.

**Reglas mínimas obligatorias** (si se elige esta vía):

```
tiposActivos = conjunto marcado (intro siempre marcado y disabled)
N = número de slides (5 … 15)

N_max = tiposActivos.length
N_efectivo = min(N, N_max)

slides = ordenFijo.filter(tipo ∈ tiposActivos).slice(0, N_efectivo)
```

| Evento | Comportamiento |
|--------|----------------|
| Usuario sube N por encima de `tiposActivos.length` | **Cap** N a `tiposActivos.length` + helper: *“Solo hay X tipos seleccionados.”* |
| Usuario baja N | OK; preview muestra las primeras N del subconjunto filtrado |
| Usuario desmarca un tipo | Si `tiposActivos.length < N`, **bajar N** al nuevo máximo + toast |
| Menos de 5 tipos activos | **Bloquear Generar** + mensaje: mínimo 5 tipos (o mínimo 5 slides — acordar con negocio) |
| Preview | Regenerar iframe con `slides` resultante |

| Pros | Contras |
|------|---------|
| Máximo control | 15 ítems en modal ya cargado (titulo, contexto, logo, color…) |
| Transparente para power users | Muchos edge cases y copy |
| | Difícil de explicar “por qué no puedo marcar 15 y poner 5” sin la regla del slice |

**Mitigación UI:** agrupar los 15 en las **mismas familias que C** con “Seleccionar todos / ninguno” por grupo; intro no desmarcable.

---

### E — Dos pasos en el modal

**Qué es:** Paso 1: “¿Cuántas diapositivas?” Paso 2: “Elige exactamente N tipos” (deshabilitar checkboxes cuando ya hay N marcados).

| Pros | Contras |
|------|---------|
| La matemática es obvia (N casillas) | Dos pantallas o scroll largo; más fricción |
| Evita “15 tipos y 5 slides” | Cambiar N obliga a paso 2 otra vez |

Útil si negocio **insiste** en checklist literal; si no, es más pesado que C o B.

---

### F — Solo “excluir” tipos (opt-out)

**Qué es:** Por defecto **todos los tipos activos** (como hoy con 15). El usuario **desactiva** lo que no quiere (toggle “Incluir evaluación”, “Incluir interactividad”, etc. o lista corta de exclusiones).

Misma lógica de filtro + `slice(0, N)` que D, pero el estado mental es *“quitar lo que no quiero”* en lugar de *“armar desde cero”*.

| Pros | Contras |
|------|---------|
| Menos miedo a pantalla vacía | Sigue necesitando reglas al bajar N |
| Alineado con “módulo completo por defecto” | Menos útil si quieren módulo mínimo desde cero |

---

## 5. Comparación rápida

| Criterio | A | B Presets | C Familias | D 15 checks | E 2 pasos | F Opt-out |
|----------|---|-----------|------------|-------------|-----------|-----------|
| KISS | ★★★★★ | ★★★★★ | ★★★★ | ★★ | ★★★ | ★★★★ |
| Cumple pedido | ★ | ★★★★ | ★★★★ | ★★★★★ | ★★★★★ | ★★★★ |
| Preview simple | ★★★★★ | ★★★★★ | ★★★★ | ★★★ | ★★★ | ★★★ |
| Mantenimiento | ★★★★★ | ★★★★ | ★★★ | ★★ | ★★ | ★★★ |
| Flexibilidad | ★★ | ★★★ | ★★★★ | ★★★★★ | ★★★★★ | ★★★★ |

---

## 6. Recomendación (enfrentar el chicharrón)

### Fase 1 — Entregar valor sin matar KISS: **B + atajo opcional C**

1. **Control principal:** **Presets** (Express / Estándar / Completo / Con evaluación — validar nombres con negocio).
2. Cada preset define internamente:
   - lista ordenada de tipos,
   - `N` por defecto (y `N_min` / `N_max` si se deja stepper).
3. **Vista previa** solo depende del preset (+ título, color, logo, contexto como hoy).
4. **Stepper de número:** visible como **“Duración del módulo”** con rango acotado al preset (ej. Estándar 8–12, Express fijo 5). Si el rango es un solo valor, ocultar stepper.
5. Pie de página: misma acción **Generar presentación**.

**Opcional “Personalizar contenido”** (colapsado, off por defecto):

- Mismos **grupos familias** que alternativa C (no 15 filas).
- Al abrir: recalcula preset más cercano o pasa a modo “personalizado”.
- Aplicar reglas de sincronización de la tabla en sección 4D (cap N, auto-bajar N, intro fija).

Así el usuario medio **nunca ve** el conflicto 5 vs 15; el avanzado sí tiene palanca sin checklist infinita.

### Fase 2 — Solo si métricas lo piden

- Checklist por tipo (D) dentro del colapsable, con agrupación y reglas estrictas.
- O reordenar slides en editor (otro proyecto).

### No recomendar para v1

- Reordenar tipos en el modal.
- Elegir “exactamente N tipos” sin relación con familias o presets (E puro), salvo audiencia 100 % power user.

---

## 7. Reglas de copy y UX (cualquier alternativa con selección)

Textos que evitan confusión:

| Situación | Mensaje sugerido |
|-----------|------------------|
| N ajustado solo | *“Mostraremos 5 diapositivas según el orden del módulo y los tipos que elegiste.”* |
| N bajado automáticamente | *“Ajustamos el número a 6 porque solo tienes 6 tipos activos.”* |
| No puede generar | *“Selecciona al menos 5 tipos de diapositiva”* (o *“…al menos 5 diapositivas”* — una sola regla, no dos mínimos distintos). |
| Intro | *“La portada siempre se incluye.”* (checkbox deshabilitado si hay lista). |
| Preview desactualizado | Evitar: preview debe actualizarse en cada cambio de preset/familia/N (debounce corto si el iframe es pesado). |

**Accesibilidad:** si hay muchos toggles, preferir **familias** con descripción de una línea (*“Preguntas, emparejamientos”*) antes que nombres técnicos (`quiz_mc`).

---

## 8. Impacto en preview y generación (para desarrollo)

Resumen no técnico de lo que cambiaría respecto a hoy:

| Pieza | Hoy | Con selección de tipos |
|-------|-----|-------------------------|
| Función que arma la lista | “Primeras N de 15 fijas” | “Filtrar por tipos activos (o preset), luego primeras N” |
| Preview iframe | `generateSlides(N)` | Misma función con **filtro** previo |
| Tokens / IA | Simula con plantilla fija | La IA debería generar **solo** slides del subconjunto (o generar 15 y descartar — **peor**; acordar con backend futuro) |
| Guardado / edición | Store por página | Store debe recordar **qué tipos** se usaron si el editor permite añadir slides de tipos nuevos más adelante (v2) |

**Clave de implementación:** una sola función pura del estilo:

`buildSlideList({ count, enabledTypes | presetId }) → slides[]`

Usada **tanto** en preview como en generación. Así no divergen.

---

## 9. Preguntas para producto (cerrar antes de diseñar UI)

1. ¿El pedido es **no generar** ciertos tipos (ahorro tokens) o solo **no mostrarlos** en la estructura?
2. ¿**Intro** y **resumen** son siempre obligatorios?
3. ¿Con **5 slides** el negocio acepta un preset fijo (Express) sin checklist?
4. ¿Hace falta **evaluación** (quiz/match) en el mismo módulo o preset aparte?
5. ¿El preview debe mostrar **contenido placeholder** de todos los tipos elegidos o un resumen tipo “5 diapositivas · incluye quiz”?
6. ¿Post-MVP: **añadir** un tipo de slide desde el editor que no estaba en el preset?

---

## 10. Alternativas descartadas (referencia)

Las opciones **presets**, **familias** y **stepper + checklist con tope N** quedaron en las secciones 4–6 como referencia si producto pide más adelante **presets rápidos** (“Módulo corto” = desmarca evaluación e interactividad pesada) sin volver al stepper.

---

*Exploración inicial + decisión final. Playground: modal «Agregar SCORM» → pestaña SCORM con IA.*
