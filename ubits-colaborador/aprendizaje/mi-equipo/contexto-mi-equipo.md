# Mi equipo — contexto de producto y playground

> Documento de referencia para implementar y migrar a React el flujo **Mi equipo** (planes de formación creados por líderes desde modo colaborador).

---

## 1. Problema de negocio

El administrador de una empresa puede activar un **permiso** para que los **líderes** creen **planes de formación** para las personas que tienen a cargo.

- Los líderes **no** entran al modo administrador ni al **LMS Creator**.
- Cuando el permiso está activo, en **modo colaborador → Aprendizaje** aparece una nueva experiencia: **Mi equipo**.
- Es una réplica funcional del módulo `lms-creator/planes-formacion/`, adaptada al alcance de un líder.

---

## 2. Dónde vive en el playground

| Aspecto | Valor |
|--------|--------|
| **Carpeta** | `ubits-colaborador/aprendizaje/mi-equipo/` |
| **Layout** | **Estándar colaborador** (Sidebar `default` + SubNav `aprendizaje` + TabBar + Floating menu) |
| **Entrada principal** | `mi-equipo/planes.html` |
| **SubNav** | Pestaña **Mi equipo** (`id: mi-equipo`), después de **Zona de estudio** |
| **Floating menu (móvil)** | Ítem **Mi equipo** en acordeón Aprendizaje, misma posición |

En producción el ítem solo se muestra si el permiso está activo. En el playground **asumimos permiso activo** para la usuaria demo.

---

## 3. Usuario demo y alcance de asignaciones

**Líder logueada (playground):** María Alejandra Sánchez Pardo (`E006`, Jefe de Logística).

Constante en JS: `MI_EQUIPO_CURRENT_LEADER` (`mi-equipo-context.js`).

**Subordinados directos** (campo `jefe === 'María Alejandra Sánchez Pardo'` en `bd-master-colaboradores.js`):

| ID | Nombre |
|----|--------|
| E035 | Luis Fernando Giraldo Ochoa |
| E036 | Lina María Salazar Bedoya |
| E037 | Hernán Darío Zapata Monsalve |
| E038 | Ángela Patricia Londoño Henao |
| E039 | Eduardo José Arango Uribe |
| E040 | Vanessa Alejandra Botero Ríos |

### Diferencia clave vs LMS Creator (admin)

En Creator, el drawer **Agregar asignación** ofrece **4 modos** (colaboradores, empresa, grupos, archivo).

En **Mi equipo**, el líder **solo** puede asignar **reportes directos**:

- Un único panel: lista filtrable de subordinados (`getMiEquipoSubordinadosDirectos()`).
- **Sin** pestañas empresa / grupos / carga masiva por archivo.
- Misma tabla de colaboradores que en Creator, pero `getData()` limitado a los 6 IDs anteriores.

Patrón de referencia parcial: drawer colaborador en `detalle-plan.html` (`drawer-usuarios-panel--colaborador`), no el wizard completo de `crear-plan-contenidos.html`.

---

## 4. Inventario de pantallas

Réplica del flujo `planes-formacion/` **sin** grupos, chat IA grupos ni certificados.

| Pantalla Mi equipo | Referente LMS Creator | Estado playground |
|--------------------|----------------------|-------------------|
| `planes.html` | `planes-contenidos.html` + `planes-competencias.html` **fusionados** | ✅ Lista con tabs |
| `crear-plan-contenidos.html` | `crear-plan-contenidos.html` | ✅ Completo |
| `crear-plan-competencias.html` | `crear-plan-competencias.html` | ✅ Completo |
| `editar-plan-contenidos.html` | `editar-plan-contenidos.html` | ✅ Completo |
| `editar-plan-competencias.html` | `editar-plan-competencias.html` | ✅ Completo |
| `detalle-plan.html` | `detalle-plan.html` (post-fix jun 2026) | ✅ Solo lectura Vigente |
| `detalle-plan-competencias.html` | `detalle-plan-competencias.html` | ✅ Solo lectura Vigente |

**No incluido en Mi equipo:** `grupos.html`, `crear-grupo.html`, `detalle-grupo.html`, `chat-ia-grupos.html` (gestión de grupos es admin/Creator).

---

## 5. Lista unificada (`planes.html`)

### Header Product — variante tabs

`loadHeaderProduct` con `variant: 'tabs-with-actions'`:

| Tab | `id` | Contenido |
|-----|------|-----------|
| Planes de contenidos | `contenidos` | Filas con `tipo: 'contenidos'` |
| Planes de competencias | `competencias` | Filas con `tipo: 'competencias'` |

- **Primary:** «Crear plan» → `crear-plan-contenidos.html` o `crear-plan-competencias.html` según tab activo.
- **Sin** botón «Crear con IA» (alcance líder; opcional en producto real).
- Persistencia tab: `sessionStorage` clave `ubits-mi-equipo-list-tab` + query `?tab=competencias`.

### Tabla

Misma UX que Creator: `createUbitsDataTable`, columnas nombre / **asignados** / fechas / estado / progreso / acciones ⋮.

Navegación fila:

- **Planeado / Procesando** → editar.
- **Vigente / No vigente** → detalle (progreso).

Menú ⋮: Ver progreso, Editar, Eliminar (mismas reglas de visibilidad que Creator).

#### Columna **Asignados** (entre nombre del plan y fecha inicio)

Réplica del patrón **Seguimiento → tab Planes / columna Personas asignadas** y del drawer de asignaciones en Creator:

| Elemento | Comportamiento |
|----------|----------------|
| **Celda** | `renderProfileList` (máx. 3 avatares visibles) o avatar único si hay una sola persona. |
| **Hover** en avatar del profile list | Tooltip oficial (`data-tooltip`) con el nombre completo (delay 500 ms). |
| **Chip +N** | Clic abre popover fijo (`planes-asignados-popover`) con lista avatar + nombre de quienes no caben en la fila. Solo lectura. |
| **Filtro en encabezado** | Botón filtro (icono `fa-filter`) con dropdown tipo buscador — igual que **Seguimiento → Asignado**: autocomplete, **máx. 5 resultados visibles**, botones **Cancelar** / **Aplicar**. Opciones: los 6 subordinados directos (E035–E040). **Selección única** (una persona). |
| **Efecto del filtro** | La tabla muestra **solo planes donde esa persona está asignada**. La columna **Progreso** deja de ser el promedio del plan y pasa a mostrar el **avance individual de esa persona** en cada plan visible. |
| **Sin filtro de persona** | **Progreso** = promedio ponderado del avance de **todos** los asignados del plan (misma lógica que detalle del plan: media de % de contenidos o competencias por colaborador). |
| **Estados sin avance** | Planes **Planeado** o **Procesando…** → progreso `0` (agregado e individual). |
| **Chip «Filtros aplicados»** | Al aplicar: chip `Asignados: {nombre}` con ✕; se limpia con el chip o con **Limpiar filtros** de la tabla. Al cambiar de tab Contenidos ↔ Competencias el filtro de persona se resetea. |

**Helpers mock** (migración → `bd-planes-formacion.js`):

- `getMiEquipoPlanAsignados(planOrId)` → `[{ colaboradorId, nombre, avatar }]`
- `getMiEquipoProgresoAgregadoPlan(planOrId)` → promedio de todos los asignados
- `getMiEquipoProgresoColaboradorEnPlan(planOrId, colaboradorId)` → % de esa persona en ese plan

> Tras la migración a `BD_PLANES_FORMACION`, estas funciones delegan en los helpers globales de la BD (ver § 10 en este doc y § 7 en `contexto-planes-formacion-y-grupos.md`).

**Assets:** `avatar.css`, `avatar.js`, popover en `planes.html`, estilos en `planes.css`.

---

## 6. Detalle vs edición (regla acordada)

Copiada del ajuste reciente en `detalle-plan.html` del Creator:

| Estado plan | Clic en fila de asignación | Edición de contenidos/competencias |
|-------------|----------------------------|-------------------------------------|
| **Vigente** | Drawer **solo lectura** (cards compact + progreso) | Solo vía **Acciones → Editar plan** |
| **No vigente** | Drawer solo lectura | No editable |
| **Planeado / Procesando** | Drawer edición (en pantalla editar) | En flujo editar |

---

## 7. Archivos compartidos

| Archivo | Rol |
|---------|-----|
| `mi-equipo-context.js` | Líder demo, `getMiEquipoSubordinadosDirectos()`, helpers de URL |
| `mi-equipo-planes-mock.js` | ⚠️ **Legacy** — sustituir por `bd-master/bd-planes-formacion.js` |
| `bd-master/bd-planes-formacion.js` | **Fuente única** de planes (Mi equipo + Creator); ver § 10 |
| `mi-equipo-layout.js` | `initMiEquipoLayout()` — shell colaborador + tab Mi equipo activo |
| `mi-equipo-planes-formacion.css` | `@import` Creator + checklist de dependencias (fase 9) |
| `mi-equipo-plan-competencias-shared.js` | Drawers y helpers compartidos crear/editar/detalle competencias |
| `planes.css` | Estilos lista |
| `catalogo-contenidos-drawer.js` | **Reutilizar** desde `../../lms-creator/planes-formacion/` (no duplicar) |
| `catalogo-competencias-drawer.js` | Idem competencias |
| `humanizador-fechas.js` | Fechas y estados Planeado/Vigente/No vigente |
| `bd-master-colaboradores.js` | Fuente de jerarquía (E035–E040 subordinados de E006) |

---

## 8. Navegación global tocada

- `components/sub-nav.js` → tab `mi-equipo` en variante `aprendizaje`; `PAGE_TO_TAB` con prefijo `mi-equipo/`.
- `components/floating-menu.js` → ítem Mi equipo en acordeón Aprendizaje.
- `getPageKeyForSubNav()` → rutas bajo `/mi-equipo/` mapean a tab activo.

---

## 9. Migración a React (notas)

- Ruta sugerida: `/ubits-colaborador/aprendizaje/mi-equipo/planes` (+ subrutas crear/editar/detalle).
- Layout: `ColaboradorLayout` + SubNav aprendizaje extendido.
- `HeaderProduct` con variante tabs (ya portado en playground React).
- Mock: filtrar `BD_MASTER_COLABORADORES` por `jefe === currentLeader`.
- Flag permiso: en producción vendría de API/rol; en playground `true` fijo o variable `window.MI_EQUIPO_ENABLED`.
- **No** mezclar con rutas LMS Creator (`/lms-creator/planes-formacion/`).

---

## 10. Base de datos única — `bd-planes-formacion.js`

> **Decisión acordada (jun 2026):** reemplazar **todo** el mock local (`mi-equipo-planes-mock.js` + catálogos inline del Creator) por una sola fuente en `bd-master/bd-planes-formacion.js` (`window.BD_PLANES_FORMACION`). Mi equipo y LMS Creator consumen la misma BD; **no** mezclar con `bd-tareas-y-planes.js` (tareas/seguimiento).

### 10.1 «Hoy» del playground y rango temporal

| Constante | Valor |
|-----------|--------|
| **Fecha de referencia («hoy»)** | **19 jun 2026** |
| **Primer trimestre con planes** | **Q1 2025** |
| **Último trimestre con planes** | **Q3 2026** |

Trimestres incluidos (7): `2025-Q1` … `2025-Q4`, `2026-Q1` … `2026-Q3`.

Los estados **Planeado / Vigente / No vigente** se calculan **automáticamente** comparando `fechaInicio` y `fechaFin` del plan con el «hoy» del playground (no se persisten como fuente de verdad).

### 10.2 Planes de contenidos — reglas de seed

| Regla | Definición |
|-------|------------|
| **Granularidad** | **1 plan por área por trimestre** — todos los reportes directos del líder del área van en el **mismo** plan. |
| **Volumen estimado** | **9 áreas × 7 trimestres = 63 planes** |
| **Creador** | El **líder del área** (`esJefe: true` en `bd-master-colaboradores.js`) |
| **Asignados** | Solo **reportes directos** de ese líder (campo `jefe`) |
| **Cursos por persona** | **Siempre 3 contenidos distintos por persona** dentro del mismo plan/Q; pueden **diferir** entre personas del área. Los 3 cursos **cambian cada trimestre**. |
| **Nombre sugerido** | `{Área} capacitación {Qx yyyy}` — p. ej. «Logística capacitación Q1 2025» |

**Áreas con líder y plan trimestral** (9 jefes en BD Fiqsha):

| Área | Líder (ID) |
|------|------------|
| Ventas | Ricardo Ospina Duque (E002) |
| Instalaciones | Fernando Castro Restrepo (E003) |
| Reparaciones | Claudia Vargas Mendoza (E004) |
| Atención al Cliente | Andrea Suárez Gómez (E005) |
| Logística | María Alejandra Sánchez Pardo (E006) |
| Administración | Mónica Jiménez Pérez (E007) |
| Marketing | Alejandro Moreno Ruiz (E008) |
| Recursos Humanos | Carmen Rosa Díaz Herrera (E052) |
| Gerencia General | Patricia Elena Bermúdez Ríos (E001) |

**Progreso contenidos:** por persona, **promedio del % de avance** de sus 3 cursos asignados. Progreso agregado del plan = **promedio** del progreso de todos los asignados del plan.

### 10.3 Planes de competencias — reglas de seed

| Regla | Definición |
|-------|------------|
| **Granularidad** | **1 plan corporativo por competencia por año** — muchas personas en el mismo plan. |
| **Volumen estimado** | **3 competencias × 2 años (2025, 2026) = 6 planes** |
| **Nombre sugerido** | `Empresa {Competencia} {año}` — p. ej. «Empresa Liderazgo 2025» |
| **Competencias usables** | Solo las **3 del catálogo acordadas para el playground**: **Liderazgo** (`comp-024`), **Inglés** (`comp-020`), **Comunicación** (`comp-004`). No asignar otras competencias en el seed. *(En `bd-contenidos-ubits.js` hoy hay más ítems ligados a Liderazgo y Comunicación que a Inglés; el seed usará los contenidos disponibles por competencia.)* |
| **Competencias por persona/año** | Cada colaborador recibe **exactamente 3 competencias** (una de cada una de las tres anteriores) dentro del año. La combinación puede **rotar** respecto al año anterior. |
| **Ventana de vigencia** | Todo el **año calendario** (p. ej. 2025-01-01 → 2025-12-31). |
| **Horas meta** | **2 h por plan** (valor **único** a nivel plan; no multiplicar por número de competencias). Campo: `horasEstudioMeta` (o equivalente en la BD). |
| **Creador(es)** | Perfiles de **Recursos Humanos** según cargos en `bd-master-colaboradores.js`: **primario** Carmen Rosa Díaz Herrera (E052, Jefa de RRHH); **secundarios** del área HR que tienen sentido operativo para formación: Roberto Carlos Méndez Soto (E053, Encargado de Objetivos y OKRs) y Adriana Lucía Ríos Calle (E054, Encargada de Encuestas). El seed puede repartir `creadorId` entre E052–E054; E055 (Nómina) no crea planes en el mock. |

**Progreso competencias (regla de negocio):**

- Cuenta **cualquier contenido de esa competencia** consumido en la plataforma **durante las fechas del plan**.
- La duración estudiada (campo `tiempoValor` + `unidadTiempo` del contenido en `bd-contenidos-ubits.js`) se **suma** hacia la meta de **2 h** del plan → `min(100, horasEstudiadas / 2 × 100)`.
- El progreso es **por ventana del plan**, no acumulativo entre planes: si en **2025** estudió un curso de Inglés y en **2026** hay otro plan «Empresa Inglés 2026», **ese curso solo sumó al plan 2025**; para 2026 debe consumir **otros** contenidos de Inglés dentro de las fechas de 2026.
- Progreso agregado del plan = promedio del progreso de todos los asignados.

### 10.4 Visibilidad en Mi equipo (María E006)

**Regla acordada:** María ve **cualquier plan** (contenidos o competencias) donde aparezca **al menos una persona de su equipo** (E035–E040), **incluidos planes corporativos de HR** donde sus reportes estén asignados.

| Filtro | Qué muestra |
|--------|-------------|
| **Sin filtro de persona** | Todos los planes con algún E035–E040 en `asignaciones` |
| **Con filtro de persona** (columna Asignados) | Solo planes donde está esa persona; progreso = individual |

María **no** ve planes de otras áreas donde **ningún** subordinado suyo esté asignado (p. ej. «Ventas capacitación Q2 2025» si solo tiene gente de Ventas).

**Crear/editar desde Mi equipo:** sigue limitado a reportes directos (E035–E040) y a planes cuyo `creadorId` sea el líder logueado (María solo crea/edita planes de contenidos de Logística que ella haya creado).

### 10.5 Esquema de datos (campos del plan)

```js
{
  id: string,
  tipo: 'contenidos' | 'competencias',
  nombre: string,
  fechaInicio: 'YYYY-MM-DD',
  fechaFin: 'YYYY-MM-DD',
  // Solo competencias:
  horasEstudioMeta: 2,
  // Metadatos seed:
  area: string | null,           // contenidos: área del plan
  trimestre: '2025-Q1' | …,      // contenidos
  anio: 2025 | 2026,             // competencias
  competenciaId: string | null,  // competencias: comp-024 | comp-020 | comp-004
  creadorId: string,             // colaboradorId del creador (E006, E052, …)
  asignaciones: [
    {
      colaboradorId: string,
      // contenidos — siempre 3 ítems distintos por persona:
      contenidos: [{ id, title, progresoPct }],
      // competencias — subconjunto de las 3 competencias del año:
      competencias: [{ id, title, habilidades, progresoPct }]
    }
  ],
  // Progreso precalculado en seed (opcional, derivable):
  progresoPorColaborador: { [colaboradorId]: number },
  progresoAgregado: number
}
```

**Helpers previstos en la BD:** `getPlanById`, `getPlanesByTipo`, `getEstadoPlan(plan, hoy)`, `getProgresoColaboradorEnPlan`, `getProgresoAgregadoPlan`, `getPlanesVisiblesParaLider(leaderId)`, `getPlanesVisiblesCreator()`.

### 10.6 Migración desde mock actual

| Antes | Después |
|-------|---------|
| `mi-equipo-planes-mock.js` + `sessionStorage` `ubits-mi-equipo-planes-db` | Capa fina sobre `BD_PLANES_FORMACION` o eliminación del mock |
| Arrays inline en `planes-contenidos.html` / `planes-competencias.html` | Misma BD + filtros Creator (todos los planes) |
| Progreso vía `_contenidoIndices` / `_competenciaIndices` | Progreso por duración (competencias) y % curso (contenidos) según § 10.2–10.3 |

La columna **Asignados** y el filtro por persona en `planes.html` (§ 5) se mantienen; cambian solo las funciones de datos subyacentes.

---

## 11. Validación manual rápida

1. Abrir `mi-equipo/planes.html` — SubNav **Mi equipo** activo; tabs Contenidos | Competencias.
2. Columna **Asignados**: hover en avatars (tooltip), clic en +N (popover), filtro por persona (progreso individual vs promedio sin filtro).
3. `?tab=competencias` abre tab competencias; cambiar tab re-inicializa tooltips y limpia filtro de asignado.
3. Crear plan (contenidos o competencias) → asignar solo E035–E040 → guardar → lista actualizada.
4. Detalle Vigente (`me-c1` / `me-k1`): clic fila = drawer solo lectura; **Acciones → Editar plan**.
5. Editar: Guardar disabled hasta dirty; modal salir sin guardar; eliminar plan con modal.
6. Floating menu móvil incluye Mi equipo en todas las pantallas.

---

**Autor del flujo:** extensión playground UBITS — Mi equipo (líderes con permiso admin).

**Última actualización:** jun 2026 — definición BD única `bd-planes-formacion.js` (§ 10).
