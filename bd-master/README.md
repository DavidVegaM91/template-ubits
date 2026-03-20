# BD master

Carpeta única de **bases de datos del playground** (JavaScript en `window`, sin `fetch` a JSON: funciona con `file://`).

---

## Inventario de archivos

| Archivo | Variable global | Rol |
|---------|-----------------|-----|
| `bd-master-aliados.js` | `window.BD_MASTER_ALIADOS` | Aliados / proveedores (nombre, logo). |
| `bd-master-competencias.js` | `window.BD_MASTER_COMPETENCIAS` | Competencias UBITS por id. |
| `bd-master-habilidades.js` | `window.BD_MASTER_HABILIDADES` | Habilidades UBITS por id. |
| `bd-master-niveles-contenido.js` | `window.BD_MASTER_NIVELES_CONTENIDO` | Niveles Básico / Intermedio / Avanzado (`niv-XXX`). |
| `bd-master-categorias-fiqsha.js` | `window.BD_MASTER_CATEGORIAS_FIQSHA` | Categorías corporativas Fiqsha (`cfq-XXX`). |
| `bd-master-colaboradores.js` | `window.BD_MASTER_COLABORADORES` | Empresa referencia + **55 colaboradores** Fiqsha (`colaboradores[]`). |
| `bd-tareas-y-planes.js` | `window.TAREAS_PLANES_DB` | Tareas, planes, seguimiento, datos generados; lee colaboradores del maestro. |
| `bd-contenidos-ubits.js` | `window.BDS_CONTENIDOS_UBITS` | Catálogo de contenidos UBITS (`contents[]`, ~85 ítems). |
| `bd-contenidos-fiqsha.js` | `window.BDS_CONTENIDOS_FIQSHA` | Catálogo de contenidos empresa Fiqsha (`contents[]`). |

---

## Mapa de uso por página

Ruta relativa típica desde HTML: `../../bd-master/nombre-archivo.js` (desde `ubits-colaborador/tareas/` o `ubits-colaborador/lms-creator/`).

### LMS Creator — páginas

| Página | Sección | Scripts `bd-master` | Para qué |
|--------|---------|---------------------|----------|
| `grupos.html` | Lista de grupos | `bd-master-colaboradores.js`, `bd-tareas-y-planes.js` | Conteo de **integrantes** por área / líderes / operativo vía `TAREAS_PLANES_DB.getEmpleadosEjemplo()`. |
| `crear-grupo.html` | Grupos / colaboradores | Igual | Listas de empleados en drawer. |
| `detalle-grupo.html` | Detalle grupo | Igual | Igual. |
| `crear-plan-competencias.html` | Drawer **Agregar competencias** | `bd-master-competencias.js`, `bd-master-habilidades.js` (antes del helper en `lms-creator/`) | Catálogo de competencias y habilidades. El helper `catalogo-competencias-drawer.js` arma `CATALOGO_COMPETENCIAS_DRAWER` en `window` (no es BD). |
| `detalle-plan-competencias.html` | Igual | Igual | Igual. |
| `crear-plan-contenidos.html`, `editar-plan-contenidos.html`, `detalle-plan.html` | Planes por contenidos | `bd-master-niveles-contenido.js`, `bd-master-aliados.js`, `bd-master-competencias.js`, `bd-master-habilidades.js`, `bd-master-categorias-fiqsha.js`, `bd-contenidos-ubits.js`, `bd-contenidos-fiqsha.js`; listas: `bd-master-colaboradores.js`, `bd-tareas-y-planes.js` | Maestros y catálogos de contenidos para el drawer y asignaciones (sin detallar helpers fuera de esta carpeta). |
| `planes-formacion.html` | Lista de planes | *(mock local en página; sin `bd-master` en el listado)* | Datos de ejemplo de planes LMS Creator. |
| `contenidos.html`, `categorias.html`, `chat-ia-grupos.html` | Placeholder | — | Sin BD aún. |

### Tareas — `ubits-colaborador/tareas/`

| Página | Sección | Scripts `bd-master` | Para qué |
|--------|---------|---------------------|----------|
| `tareas.html` | Lista y detalle de tareas | `bd-master-colaboradores.js`, `bd-tareas-y-planes.js` | Colaboradores primero; luego tareas/planes/seguimiento simulados (`TAREAS_PLANES_DB`). |
| `planes.html` | Planes | Igual | Igual. |
| `plan-detail.html` | Detalle de plan | Igual | Igual. |
| `seguimiento.html` | Tabla seguimiento | Igual | Igual. |
| `seguimiento-leader.html` | Seguimiento líder | Igual | Igual. |
| `task-detail.html` | Detalle tarea | Igual | Igual. |
| `subtask-detail.html` | Detalle subtarea | Igual | Igual. |
| `plantilla.html` | Plantilla tareas | Igual | Igual. |

---

## Relaciones entre archivos (contenidos)

- **`bd-contenidos-ubits.js`** y **`bd-contenidos-fiqsha.js`**: ítems con `nivelId` → nombres en **`bd-master-niveles-contenido.js`**.
- **UBITS:** `providersAliadosIds` → **`bd-master-aliados.js`**. Rutas de aprendizaje pueden listar varios aliados; el resto suele usar `aly-001` (UBITS).
- **UBITS:** `competenciaPrincipalId`, `habilidadPrincipalId`, `habilidadesSecundariasIds` → **`bd-master-competencias.js`** / **`bd-master-habilidades.js`**.
- **Fiqsha:** `categoriaFiqshaId` → **`bd-master-categorias-fiqsha.js`**. `proveedorAliadoId` (`aly-018`) → **`bd-master-aliados.js`**.

## Colaboradores y tareas

- **`bd-master-colaboradores.js`** es la fuente de **`colaboradores[]`** (55 registros).
- **`bd-tareas-y-planes.js`** los clona en `EMPLEADOS_EJEMPLO`, `GERENTE_EJEMPLO` y `JEFES_EJEMPLO` y expone **`TAREAS_PLANES_DB`**. Sin el maestro de colaboradores cargado antes, la lista queda vacía y verás un aviso en consola.

---

## Esquema resumido `contents[]` (v2)

### UBITS (`BDS_CONTENIDOS_UBITS`)

`origen`, `titulo`, `descripcion`, `imagen`, `tipoContenido`, `nivelId`, `tiempoValor`, `unidadTiempo`, `idioma`, `competenciaPrincipalId`, `habilidadPrincipalId`, `habilidadesSecundariasIds`, `expertos`, `aliadoId`, `nivelIngles`, `providersAliadosIds`, más campos de compatibilidad (`id`, `fileName`, `title`, `imagePath`).

### Fiqsha (`BDS_CONTENIDOS_FIQSHA`)

`origen`, `titulo`, `descripcion`, `imagen`, `tipoContenido`, `nivelId`, `tiempoValor`, `unidadTiempo`, `idioma`, `categoriaFiqshaId`, `proveedorAliadoId`; sin bloque de competencias/habilidades UBITS del modelo empresa. Campos de compatibilidad: `id`, `title`, `imagePath`.

---

## Ejemplo de inclusión (desde `lms-creator/` o `tareas/`)

**Maestro de competencias:**

```html
<script src="../../bd-master/bd-master-competencias.js"></script>
<script>
  var comps = window.BD_MASTER_COMPETENCIAS.competencias || [];
</script>
```

**Tareas y planes (siempre colaboradores primero):**

```html
<script src="../../bd-master/bd-master-colaboradores.js"></script>
<script src="../../bd-master/bd-tareas-y-planes.js"></script>
```

## Mantenimiento

- Editas el `.js` que corresponda o regeneras desde tu flujo interno.
- No hay JSON en esta carpeta: el playground no depende de archivos JSON externos.
