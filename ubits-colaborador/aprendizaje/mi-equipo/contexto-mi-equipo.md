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

Misma UX que Creator: `createUbitsDataTable`, columnas nombre / fechas / estado / progreso / acciones ⋮.

Navegación fila:

- **Planeado / Procesando** → editar.
- **Vigente / No vigente** → detalle (progreso).

Menú ⋮: Ver progreso, Editar, Eliminar (mismas reglas de visibilidad que Creator).

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
| `mi-equipo-planes-mock.js` | `MI_EQUIPO_PLANES_DB` + CRUD; snapshot en `sessionStorage` |
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

## 10. Datos mock (`mi-equipo-planes-mock.js`)

Planes de ejemplo del líder (logística), array único con campo `tipo`:

- **Contenidos:** `me-c1` (Vigente), `me-c2` (Planeado)
- **Competencias:** `me-k1` (Vigente), `me-k2` (No vigente)

Persistencia demo: `sessionStorage` clave `ubits-mi-equipo-planes-db`. Crear/editar/eliminar mutan el mismo objeto en memoria.

---

## 11. Validación manual rápida

1. Abrir `mi-equipo/planes.html` — SubNav **Mi equipo** activo; tabs Contenidos | Competencias.
2. `?tab=competencias` abre tab competencias; cambiar tab re-inicializa tooltips.
3. Crear plan (contenidos o competencias) → asignar solo E035–E040 → guardar → lista actualizada.
4. Detalle Vigente (`me-c1` / `me-k1`): clic fila = drawer solo lectura; **Acciones → Editar plan**.
5. Editar: Guardar disabled hasta dirty; modal salir sin guardar; eliminar plan con modal.
6. Floating menu móvil incluye Mi equipo en todas las pantallas.

---

**Autor del flujo:** extensión playground UBITS — Mi equipo (líderes con permiso admin).
