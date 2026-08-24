# Agente de conocimiento — contexto de producto

> Documento de referencia para diseñar, prototipar e implementar el **Agente de conocimiento** en el Playground (vanilla + React) y alinear producto / diseño / frontend.
>
> **Estado:** definición post-ideación con usuarios (jul 2026). Aún no hay pantallas en el playground.
>
> **Autor / mantenedor del playground:** Hector David Vega.

---

## 1. Problema de negocio

Cada empresa acumula conocimiento operativo que hoy vive en PDFs, carpetas, Wikis o “en la cabeza de alguien”: normas de vacaciones, protocolos de acoso, procesos de bodega, sales playbooks, almacenamiento de contratos, etc.

El colaborador necesita **preguntar en lenguaje natural** y obtener respuestas **ancladas a documentos oficiales de su empresa**, no a un tutor de catálogo UBITS ni a un LMS.

**Agente de conocimiento** es ese asistente: **uno por empresa**, alimentado por **colecciones** de documentos con **visibilidad** controlada por el admin.

---

## 2. Naming (vocabulario fijo)

| Capa | Nombre en UI (español neutro) | Notas |
|------|-------------------------------|--------|
| **Producto** | **Agente de conocimiento** | Nombre del módulo / ítem de menú |
| **Instancia** | Un solo agente por empresa | No hay “varios agentes” en v1 |
| **Unidad con docs + visibilidad** | **Colección** | Plural: **Colecciones** |
| **Archivos dentro de una colección** | **Documentos** / **archivos** | v1: solo texto |
| **Respuestas con evidencia** | **Fuentes** | Chips clicables → panel del documento |
| **Prohibido en UI** | Notebook, RAG, vector store, “cuaderno”, “base de conocimiento” como nombre de producto | El producto se llama **Agente de conocimiento**; la unidad visible/gestionable es la **colección** |

**CTA / acciones típicas (neutro):**

- Admin: `Crear colección`, `Editar colección`, `Subir documentos`, `Probar agente`
- Colaborador: `Agente de conocimiento` (entrada) → chat libre

---

## 3. Modelo mental

```
Empresa
└── 1 Agente de conocimiento          ← con quien se chatea
        └── alimentado por Colecciones
                ├── Colección A  → documentos + visibilidad
                ├── Colección B  → documentos + visibilidad
                └── …
```

### Reglas de oro

1. **Un agente por empresa** — el colaborador no elige “cuál agente”; entra al producto y chatea.
2. **Las colecciones alimentan al agente** — el RAG solo usa documentos de colecciones **visibles para ese usuario**.
3. **La visibilidad vive en la colección**, no en el agente.
4. Si el colaborador **no tiene ninguna colección visible**, el **ítem del agente desaparece** de su navegación (no ve historial ni acceso vacío engañoso).

---

## 4. Dónde vive en el producto

**No** vive en Aprendizaje / LMS Creator / Recursos IA / Modo estudio IA.  
Es **transversal** (políticas, operaciones, compliance, ventas…), no formación de catálogo.

| Rol | Ubicación | Qué hace ahí |
|-----|-----------|--------------|
| **Admin** | **Empresa → Agente de conocimiento** | Gestionar colecciones, subir docs, visibilidad, chat de prueba |
| **Colaborador** | **Ítem propio en el sidebar** (mismo nivel que Aprendizaje, Tareas, etc.) | Abrir el chat del agente (si tiene ≥1 colección visible) |

### Relación con productos vecinos

| Producto | Relación |
|----------|----------|
| **Modo estudio IA** | Hermano de **UX** (chat + historial + panel derecho), **distinto de negocio** (tutor de aprendizaje vs docs de empresa) |
| **IA para HR** | Otro producto de herramientas IA; no mezclar ni anidar el agente ahí |
| **LMS Creator / contenidos** | Se **reutiliza el patrón de visibilidad** (mismos estados); no se reutiliza el catálogo de cursos |

### Playground (rutas previstas — por implementar)

| Rol | Carpeta / rutas tentativas |
|-----|----------------------------|
| Admin | `ubits-admin/empresa/agente-conocimiento/` (o pantallas bajo `empresa/` con SubNav `empresa` + pestaña nueva) |
| Colaborador | `ubits-colaborador/agente-conocimiento/` |
| React admin | `pages/ubits-admin/empresa/agente-conocimiento/` |
| React colaborador | `pages/ubits-colaborador/agente-conocimiento/` |

**SubNav Empresa (admin):** añadir pestaña **Agente de conocimiento** junto a Gestión de usuarios, Organigrama, etc. (detalle de orden: pendiente de diseño).

**Sidebar colaborador:** ítem **Agente de conocimiento** (icono tentativo: `far fa-sparkles` o `far fa-book-open` — definir en diseño). Visible **solo** si hay colecciones aplicables.

---

## 5. Visibilidad de colecciones

Misma familia que contenidos LMS Creator (`visibilidadLms`): se configura al **crear** y al **editar** la colección.

| Estado | Tag (variante DS) | Comportamiento para el agente |
|--------|-------------------|--------------------------------|
| **Borrador** | info | Solo creadores / admins. **No** alimenta respuestas a colaboradores. Sirve para armar la colección y probar en admin. |
| **Público** | success | Visible para **todos** los colaboradores de la empresa → entra al RAG de cualquiera. |
| **Privado** | warning | Solo colaboradores **seleccionados** → RAG solo para ellos. |
| **Oculto** | neutral | La colección **deja de estar disponible** para colaboradores: no alimenta el chat ni aparece en su “universo” del agente. Quien ya no tiene **ninguna** colección visible **pierde el ítem** del agente (y no consulta historial desde la UI). |

### Regla de aparición del ítem colaborador

```
coleccionesVisibles(usuario).length === 0  →  ocultar “Agente de conocimiento” en nav
coleccionesVisibles(usuario).length >= 1   →  mostrar ítem → chat con RAG filtrado
```

**Ocultar** una colección no es “soft hide en catálogo de cursos”: para este producto, **oculta = no usable** por el colaborador en el agente.

---

## 6. Alcance v1

### Incluido

| Capacidad | Detalle |
|-----------|---------|
| Un agente por empresa | Sin multi-agente |
| Colecciones | CRUD admin; nombre, descripción opcional, documentos, visibilidad |
| Documentos | **Solo archivos de texto** (texto plano / `.txt` y equivalentes de texto en el prototipo) |
| Chat admin | Panel de prueba del agente (validar respuestas con las colecciones) |
| Chat colaborador | Experiencia principal; **historial** persistente (como Modo estudio IA) |
| Fuentes / citas | Chips en la respuesta; clic abre **panel derecho** con el documento (patrón Modo estudio IA / definiciones de concepto) |
| Visibilidad | Borrador / Público / Privado / Oculto al crear o editar colección |

### Fuera de alcance v1 (explícito)

- Audio Overview, presentaciones, mind maps u otros artefactos tipo NotebookLM
- Quiz, flashcards, planes de formación generados (eso es Modo estudio IA)
- PDF / Word / imágenes / video como fuentes (ampliar después)
- Varios agentes por empresa o “agentes por área” como entidades distintas
- Edición colaborativa tipo wiki dentro del chat

---

## 7. Experiencias por rol

### 7.1 Admin — Empresa → Agente de conocimiento

**Objetivo:** alimentar y gobernar el agente.

#### Pantallas (propuesta)

| # | Pantalla | Contenido |
|---|----------|-----------|
| A1 | **Home / Colecciones** | Lista o cards de colecciones (nombre, # docs, tag de visibilidad, acciones). CTA **Crear colección**. Acceso a **Probar agente**. |
| A2 | **Crear / editar colección** | Datos de la colección + **visibilidad** + zona de **carga de documentos de texto** (izquierda o bloque superior) + opcional chat de prueba acotado. |
| A3 | **Probar agente** (puede ser vista dedicada o split en home) | Chat de prueba a la derecha; a la izquierda o en drawer el contexto de colecciones activas para el admin. |

**Layout admin:** Workspace (`AdminLayout` / sidebar admin + SubNav `empresa`).

**Mock playground:** asumir empresa Fiqsha; admin puede ver y probar con todas las colecciones no borrador o con selector “ver como…” (detalle pendiente).

### 7.2 Colaborador — Agente de conocimiento

**Objetivo:** resolver dudas operativas con respuestas citadas.

#### Pantallas (propuesta)

| # | Pantalla | Contenido |
|---|----------|-----------|
| C1 | **Chat del agente** | Entrada única: historial + hilo + input. **Sin** UI de carga de documentos. |
| C2 | **Panel de fuente** | Al clic en un chip de fuente: panel derecho con el documento (lectura). Cerrar (X) vuelve al chat a ancho completo. |

**No hay home de “varios agentes”.** Si en el futuro se listan colecciones al colaborador, sería informativo; v1 prioriza **solo chat**.

**Layout colaborador:**

- Opción preferida v1: shell **parecido a Modo estudio IA** (chat + panel derecho bajo demanda), sin SubNav de Aprendizaje.
- Ítem de sidebar **condicional** (regla § 5).

**Referencia UX obligatoria:** `ubits-colaborador/aprendizaje/modo-estudio-ia.html` + `HU-modo-estudio-IA.md` (historial, panel derecho tipo Gemini, cards/chips que reabren el panel).

---

## 8. Chat, historial y fuentes

### Historial

- **Sí se mantiene**, patrón Modo estudio IA (conversaciones previas del usuario con el agente).
- Si el usuario **deja de tener colecciones visibles**, **no** puede abrir el producto → no consulta historial desde la UI (el dato puede existir en backend; fuera de alcance del prototipo).
- Al **ocultar** colecciones: el ítem desaparece; no se muestra empty state del agente “sin colecciones” en nav.

### Fuentes (citas)

1. La respuesta del agente incluye **chips / “madres” de fuente** (nombre del documento o colección + documento).
2. Clic → abre **panel derecho** con el contenido del archivo de texto.
3. Mismo patrón mental que en Modo estudio IA al abrir un recurso / definición en el canvas (ej. conceptos como liderazgo): clic en el chat → evidencia a la derecha.

### RAG (comportamiento de producto, no técnico)

- Recuperación **solo** sobre documentos de colecciones visibles para el usuario.
- Si la pregunta no está en las fuentes: respuesta honesta de “no encontrado en los documentos de tu empresa” (copy exacto: pendiente).
- Disclaimer de IA (errores posibles): alinear tono con Modo estudio IA.

---

## 9. Casos de uso (ejemplos para demos / mock)

Usar estos temas en datos de ejemplo del playground (colecciones + `.txt` mock):

| Colección ejemplo | Preguntas demo |
|-------------------|----------------|
| Normas de vacaciones | “¿Cuántos días me tocan el primer año?” |
| Protocolo de acoso laboral | “¿A quién reporto y en cuánto tiempo?” |
| Bodega — sucursal X | “¿Cómo se almacena el producto refrigerado?” |
| Proceso de ventas — contratos | “¿Dónde guardo el contrato firmado?” |

---

## 10. Layouts y componentes (playground)

| Necesidad | Componente / patrón |
|-----------|---------------------|
| Admin lista | Workspace + `HeaderProduct` / `ToolbarPanel` + cards o `UbitsDataTable` |
| Carga de archivos texto | `FileUpload` / `FileUploadCompact` (aceptar solo texto en v1) |
| Visibilidad | Selection cards / radios como paso Visibilidad de crear contenido LMS |
| Chat | Reutilizar patrones de Study Chat / IA panel / Modo estudio IA |
| Fuentes → panel | Panel derecho (canvas) como Modo estudio IA |
| Toasts | Éxito al guardar colección, error al subir tipo no permitido |
| Empty admin | Sin colecciones → empty state + CTA Crear colección |
| Empty chat | Primer mensaje / chips de sugerencia (opcional, como Modo estudio) |

**Tokens React:** `--color-*`. **Vanilla:** `--ubits-*`.

---

## 11. Inventario de pantallas (checklist implementación)

| ID | Rol | Pantalla | Estado |
|----|-----|----------|--------|
| A1 | Admin | Home colecciones | 📄 Por hacer |
| A2 | Admin | Crear colección | 📄 Por hacer |
| A3 | Admin | Editar colección | 📄 Por hacer |
| A4 | Admin | Probar agente (chat) | 📄 Por hacer |
| C1 | Colaborador | Chat agente + historial | 📄 Por hacer |
| C2 | Colaborador | Panel documento (fuente) | 📄 Por hacer |

---

## 12. Decisiones cerradas (sesión jul 2026)

| # | Decisión |
|---|----------|
| 1 | Producto = **Agente de conocimiento**; unidad = **Colección**. |
| 2 | **Un** agente por empresa; se alimenta de colecciones. |
| 3 | Visibilidad = misma familia LMS; se configura al **crear/editar** la colección. |
| 4 | **Oculto** → colección no usable por colaborador; si no queda ninguna visible → **desaparece el ítem** del agente. |
| 5 | Colaborador: experiencia tipo **Modo estudio IA** (chat + historial + fuentes → panel derecho). |
| 6 | Archivos v1: **solo texto**. |
| 7 | Sin artefactos NotebookLM (audio, slides, etc.) en v1. |
| 8 | Admin vive en **Empresa**; colaborador en **sidebar propio** (no Aprendizaje). |

---

## 13. Pendientes de producto / diseño

- [ ] Orden exacto de la pestaña en SubNav **Empresa**
- [ ] Icono del ítem en sidebar colaborador
- [ ] Privado: UX del selector de colaboradores (reusar patrón LMS)
- [ ] ¿Admin en “Probar agente” ve todas las colecciones o puede “ver como” un colaborador?
- [ ] Copy exacto de empty / “no encontrado en documentos”
- [ ] ¿Mostrar al colaborador qué colecciones alimentan su respuesta (además de la fuente archivo)?
- [ ] Persistencia de historial al volver a tener colecciones visibles (¿se recuperan hilos viejos?)
- [ ] Nombre técnico de rutas y feature flag en producción
- [ ] Ampliar tipos de archivo post-v1 (PDF, etc.)

---

## 14. Referencias cruzadas

| Recurso | Para qué |
|---------|----------|
| `ubits-colaborador/aprendizaje/HU-modo-estudio-IA.md` | Chat, historial, panel derecho, apertura por clic |
| `ubits-admin/lms-creator/contexto-creacion-contenido.md` § Visibilidad | Estados Borrador / Público / Privado / Oculto |
| `ubits-admin/empresa/*` | Shell admin Empresa + SubNav |
| `documentacion/componentes/file-upload*.html` | Carga de archivos |
| Este archivo | Fuente de verdad de producto del Agente de conocimiento |

---

## 15. Historial del documento

| Fecha | Cambio |
|-------|--------|
| 2026-07-31 | Alta: naming, modelo 1 agente + colecciones, ubicación Empresa / sidebar, visibilidad, v1, pantallas propuestas, referencias Modo estudio IA. |
