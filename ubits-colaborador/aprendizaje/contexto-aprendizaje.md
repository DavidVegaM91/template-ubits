# Aprendizaje (colaborador) — contexto general del módulo

> **Índice maestro** del módulo `ubits-colaborador/aprendizaje/` en el playground vanilla. Antes de implementar o documentar una pantalla de Aprendizaje, leer este archivo para saber **qué producto es**, **qué no es**, **qué usuario demo usar** y **qué documento profundizar**.

**Alcance:** vista **colaborador** (learner). Administración HR y LMS Creator tienen carpetas y contextos propios.

---

## 1. Usuario demo del playground (transversal)

En **todo** el playground UBITS (Aprendizaje, Tareas, Mi equipo, Modo estudio IA, Zona de estudio, etc.) el colaborador simulado es **siempre el mismo**:

| Campo | Valor |
|-------|-------|
| **Nombre** | **María Alejandra Sánchez Pardo** |
| **ID BD** | `E006` |
| **Cargo** | Jefe de Logística |
| **Empresa demo** | Fiqsha Decoraciones S.A.S. |
| **Avatar** | `images/Profile-image.jpg` |
| **Username** | `masanchez@fiqsha.demo` |

**Fuentes en código:**

| Constante / patrón | Archivo |
|--------------------|---------|
| `PLAYGROUND_USER_ID` / `E006` | `zona-estudio.js`, `bd-planes-formacion.js` |
| `MI_EQUIPO_CURRENT_LEADER` | `mi-equipo/mi-equipo-context.js` |
| `BD_MASTER_COLABORADORES` id `E006` | `bd-master/bd-master-colaboradores.js` |
| `USUARIO_ACTUAL` (tareas) | `bd-master/bd-tareas-y-planes.js` |

**Regla para agentes y devs:** no inventar otro usuario genérico («Usuario demo», «John Doe»). Si la pantalla necesita un colaborador, es **María Alejandra** salvo que el flujo sea explícitamente **vista líder de equipo** (otros colaboradores como subordinados) o **vista admin**.

---

## 2. Mapa de productos — qué es cada experiencia

Aprendizaje agrupa **varias experiencias distintas**. No mezclar conceptos, datos ni navegación entre ellas.

```
Aprendizaje (SubNav colaborador)
├── Inicio (home-learn)          → descubrir / buscar contenidos
├── Modo estudio IA              → chat IA libre (NO contenido estructurado)
├── U. Corporativa               → catálogo empresa
├── Zona de estudio              → seguimiento planes + historial
├── Mi equipo                    → líder: planes para su equipo
└── (entrada desde cards)        → Experiencia de estudio (exp-estudio)
```

### 2.1 Comparativa clave — Modo estudio IA vs Experiencia de estudio

| Aspecto | **Modo estudio IA** | **Experiencia de estudio (exp-estudio)** |
|---------|---------------------|------------------------------------------|
| **Página** | `modo-estudio-ia.html` | `exp-estudio/exp-estudio.html?id=` |
| **Qué es** | Chat con **agente IA** para aprender o pedir ayuda sobre **cualquier tema** | Consumo de un **contenido estructurado** (curso) creado en **LMS Creator** |
| **Origen del aprendizaje** | Conversación libre; puede ser UBITS o **fuera de UBITS** (ej. japonés, competencia no catalogada) | Secciones, páginas, recursos y evaluaciones **definidos por el autor** |
| **Catálogo UBITS** | Puede **sugerir** cursos del catálogo si el usuario lo pide | El contenido **ya está elegido** (card, tarea, historial, etc.) |
| **Formatos IA** | Quiz, flashcards, plan de estudio, podcast, explicaciones, etc. **generados en el chat** | Video, PDF, embebido, evaluación, complementarios — **renders fijos** del Creator |
| **Certificado** | **No** | **Sí** si `conCertificacion` (pantalla cierre § exp-estudio) |
| **Progreso estructurado** | No hay índice de curso ni % por páginas | Portada → Recursos → Cierre; barra de progreso por páginas |
| **Relación entre sí** | **Ninguna** — productos independientes | **Ninguna** |

**Modo estudio IA — ejemplos de uso (Dave):**

- Pedir sugerencias de cursos → el agente recomienda del **catálogo UBITS/Fiqsha**.
- Pedir un quiz, flashcards o plan de estudio sobre un tema.
- Pedir aprender algo **no** en catálogo (ej. japonés) — el agente enseña en el chat, **sin** certificado ni estructura LMS.

**Experiencia de estudio — ejemplos de uso:**

- El colaborador abre un curso desde home, catálogo, zona de estudio, tarea tipo aprendizaje, etc.
- Recorre portada, páginas del índice y pantalla de felicitación al terminar.
- Contenido creado por UBITS/aliados **o** por la empresa en LMS Creator.

> **Regla de oro:** Modo estudio IA **≠** estudiar un contenido. No redirigir de uno al otro como si fueran el mismo flujo.

### 2.2 Otras pantallas del módulo (resumen)

| Experiencia | Página | Documento de contexto |
|-------------|--------|----------------------|
| **Inicio Aprendizaje** | `home-learn.html` | README — [Patrón búsqueda en Inicio](README.md#patrón-búsqueda-en-inicio-aprendizaje-home-learnhtml) |
| **Catálogo legacy** | `catalogo.html` | Integrado en home-learn (browse) |
| **U. Corporativa** | `u-corporativa.html` | — |
| **Zona de estudio** | `zona-estudio.html` | [`contexto-zona-estudio.md`](contexto-zona-estudio.md) |
| **Mi equipo (líder)** | `mi-equipo/*.html` | [`mi-equipo/contexto-mi-equipo.md`](mi-equipo/contexto-mi-equipo.md) |
| **Modo estudio IA** | `modo-estudio-ia.html` | [`HU-modo-estudio-IA.md`](HU-modo-estudio-IA.md), [`Changelog-Estudio-IA.md`](Changelog-Estudio-IA.md) |
| **Experiencia de estudio** | `exp-estudio/exp-estudio.html` | [`exp-estudio/contexto-exp-estudio.md`](exp-estudio/contexto-exp-estudio.md) |

### 2.3 LMS Creator (autor) vs consumo (learner)

| Rol | Carpeta | Qué hace |
|-----|---------|----------|
| **Autor** | `ubits-colaborador/lms-creator/` | Crear/editar contenidos, portada, recursos, evaluaciones |
| **Learner** | `exp-estudio/` | **Solo lectura** — render de lo que el autor montó |

Ver [`lms-creator/contexto-creacion-contenido.md`](../lms-creator/contexto-creacion-contenido.md).

---

## 3. SubNav Aprendizaje (pestañas visibles)

Variante `aprendizaje` en `loadSubNav`:

| Tab | Id | Página principal |
|-----|-----|------------------|
| Inicio | `home` | `home-learn.html` |
| Modo estudio IA | `modo-estudio-ia` | `modo-estudio-ia.html` |
| U. Corporativa | `u-corporativa` | `u-corporativa.html` |
| Zona de estudio | `study-zone` | `zona-estudio.html` |
| Mi equipo | `mi-equipo` | `mi-equipo/planes.html` |

**Catálogo** (`catalogo.html`) existe pero **no** tiene pestaña en SubNav — la búsqueda vive en **Inicio**.

**Experiencia de estudio** no es pestaña: se entra desde **cards**, títulos en tablas o tareas.

---

## 4. Datos mock compartidos

| BD / archivo | Uso en Aprendizaje |
|--------------|-------------------|
| `bd-contenidos-ubits.js`, `bd-contenidos-fiqsha.js` | Catálogo, cards, metadata exp-estudio |
| `bd-planes-formacion.js` | Planes zona de estudio, Mi equipo |
| `bd-master-colaboradores.js` | María Alejandra (`E006`) y equipo |
| `bd-tareas-y-planes.js` | Tareas tipo aprendizaje con contenido |
| `exp-estudio/bd-exp-estudio-demo.js` | Índice pedagógico demo curso exp-estudio (§ exp-estudio) |

---

## 5. Cuándo leer qué documento

| Si trabajas en… | Lee primero |
|-----------------|-------------|
| Cualquier pantalla de Aprendizaje | **Este archivo** (§ 1–2) |
| Zona de estudio, historial, planes asignados | `contexto-zona-estudio.md` |
| Mi equipo, planes líder | `mi-equipo/contexto-mi-equipo.md` |
| Modo estudio IA, chat tutor | `HU-modo-estudio-IA.md` |
| Consumir un curso (portada, recursos, cierre) | `exp-estudio/contexto-exp-estudio.md` |
| Crear contenido (autor) | `lms-creator/contexto-creacion-contenido.md` |

---

## 6. Changelog de este índice

| Fecha | Cambio |
|-------|--------|
| jul 2026 | Creación — usuario demo unificado, mapa Modo estudio IA vs exp-estudio, índice de contextos |
