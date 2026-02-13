# Análisis UX/UI – Módulo de tareas

Análisis del flujo de tareas (vista calendario + detalle de tarea) desde perspectiva de experiencia de usuario e interfaz. Oportunidades priorizadas por impacto y esfuerzo.

---

## 1. Panel de detalle de la tarea

### 1.1 Feedback al guardar cambios (alto impacto, bajo esfuerzo)
**Situación:** El subtítulo dice *"Si haces algún cambio, quedará aplicado inmediatamente"* pero no hay confirmación visual al editar. El usuario no sabe si lo que escribió se guardó.

**Mejora:**
- Hacer componente de autoguardado inspirado en el que ya esta en figma

---

### 1.3 Confirmación de eliminar (medio impacto, bajo esfuerzo)
**Situación:** Se usa `confirm()` nativo. Rompe la coherencia visual con el resto de la app y en móvil no siempre se ve bien.

**Mejora:**
- Modal o drawer con el componente UBITS (botones, alerta): título *"Eliminar tarea"*, mensaje *"¿Estás seguro? Esta acción no se puede deshacer y todos los datos de la tarea se perderán."*, botones *"Cancelar"* (secondary) y *"Eliminar"* (error/primary).


**Archivos:** `tareas.js`

---

### 1.4 Empty state en "Comentarios y evidencias" (medio impacto, bajo esfuerzo)
**Situación:** El sidebar muestra solo el título y *"Agregar comentarios"*. Si no hay comentarios, el contenido está vacío sin mensaje.

**Mejora:**
- Cuando no hay comentarios: mensaje corto + icono, ej. *"Aún no hay comentarios"* / *"Agrega el primero"* con tipografía UBITS y color `--ubits-fg-1-medium`.
- Mantener el botón *"Agregar comentarios"* como CTA.

**Archivos:** `tareas.js` (HTML del `task-detail-sidebar-content`: condicional con bloque vacío), `tareas.css` (clase para centrado/estilo si hace falta).

---

### 2.2 Indicador de “tarea con plan” en la lista (bajo impacto, medio esfuerzo)
**Situación:** En la lista no se ve si la tarea pertenece a un plan. Solo se ve en el detalle.

**Mejora:**
- Si la tarea tiene `planId`/`planNombre`, mostrar un icono pequeño (ej. `fa-layer-group`) o etiqueta discreta junto al nombre en la fila.
- Opcional: tooltip con el nombre del plan.

**Archivos:** `tareas.js` (template de `tarea-item`), `tareas.css` (estilo del icono/etiqueta).

---

## 3. Consistencia y accesibilidad

### 3.1 Etiquetas de formulario asociadas
**Situación:** Algunos controles (fecha, plan, prioridad) se generan por `createInput` o son custom; hay que asegurar que los labels estén asociados (`for`/`id`) o que los controles tengan `aria-label` donde no haya label visible.

**Mejora:**
- Revisar que cada input/control tenga label asociado o `aria-label`.
- El botón de prioridad ya tiene `aria-label="Prioridad: ..."`; mantener y revisar asignado a y rol.

**Archivos:** `tareas.js` (HTML del panel).
