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
| `bd-contenidos-ubits.js` | `window.BDS_CONTENIDOS_UBITS` | Catálogo de contenidos UBITS (`contents[]`, ~85 ítems). |
| `bd-contenidos-fiqsha.js` | `window.BDS_CONTENIDOS_FIQSHA` | Catálogo de contenidos empresa Fiqsha (`contents[]`). |

---

## Mapa de uso por página

Ruta relativa típica desde HTML: `../../bd-master/nombre-archivo.js` (desde `ubits-colaborador/tareas/` o `ubits-colaborador/lms-creator/`).

### LMS Creator — `crear-plan-contenidos.html`

| Sección / flujo | Scripts `bd-master` | Para qué |
|-----------------|---------------------|----------|
| Drawer **Agregar contenidos** (cards UBITS y Fiqsha) | `bd-master-niveles-contenido.js` | Resolver **nombre** del nivel desde `nivelId` en cada card. |
| Mismo drawer | `bd-master-aliados.js` | Nombre y logo de **proveedores** (`providersAliadosIds` / `proveedorAliadoId`). |
| Mismo drawer (solo UBITS) | `bd-master-competencias.js`, `bd-master-habilidades.js` | Texto de **competencia** (y habilidades) en cards UBITS. |
| Mismo drawer (solo Fiqsha) | `bd-master-categorias-fiqsha.js` | **Categoría empresa** desde `categoriaFiqshaId`. |
| Mismo drawer | `bd-contenidos-ubits.js`, `bd-contenidos-fiqsha.js` | **Listas** `BDS_CONTENIDOS_UBITS.contents` + `BDS_CONTENIDOS_FIQSHA.contents` (merge en página). |
| Listas de colaboradores / equipo (con `tareas-base-unificada.js`) | `bd-master-colaboradores.js` | **55 personas**; debe cargarse **antes** de `../tareas/tareas-base-unificada.js`. |

**Orden de carga en esa página (recomendado):** maestros de resolución (niveles → aliados → competencias → habilidades → categorías Fiqsha) → catálogos de contenidos (UBITS → Fiqsha) → colaboradores → `tareas-base-unificada.js` → JS de la página.

### LMS Creator — resto de páginas

| Página | Sección | Scripts `bd-master` | Para qué |
|--------|---------|---------------------|----------|
| `crear-grupo.html` | Grupos / colaboradores | `bd-master-colaboradores.js` | Datos de personas vía `tareas-base-unificada.js`. |
| `detalle-grupo.html` | Detalle grupo | Igual | Igual. |
| `detalle-plan.html` | Detalle plan | Igual | Igual. |
| `editar-plan-contenidos.html` | Editar plan contenidos | Igual | Igual. |
| `crear-plan-competencias.html` | Plan por competencias | Igual | Igual. |
| `detalle-plan-competencias.html` | Detalle plan competencias | Igual | Igual. |

*(Ninguna de estas carga `bd-contenidos-*` ni los maestros de catálogo salvo colaboradores.)*

### Tareas — `ubits-colaborador/tareas/`

| Página | Sección | Scripts `bd-master` | Para qué |
|--------|---------|---------------------|----------|
| `tareas.html` | Lista y detalle de tareas | `bd-master-colaboradores.js` | Población de empleados/equipo; **antes** de `tareas-base-unificada.js`. |
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
- **`ubits-colaborador/tareas/tareas-base-unificada.js`** los clona en `EMPLEADOS_EJEMPLO`, `GERENTE_EJEMPLO` y `JEFES_EJEMPLO`. Sin el maestro cargado antes, la lista queda vacía y verás un aviso en consola.

---

## Esquema resumido `contents[]` (v2)

### UBITS (`BDS_CONTENIDOS_UBITS`)

`origen`, `titulo`, `descripcion`, `imagen`, `tipoContenido`, `nivelId`, `tiempoValor`, `unidadTiempo`, `idioma`, `competenciaPrincipalId`, `habilidadPrincipalId`, `habilidadesSecundariasIds`, `expertos`, `aliadoId`, `nivelIngles`, `providersAliadosIds`, más campos de compatibilidad (`id`, `fileName`, `title`, `imagePath`).

### Fiqsha (`BDS_CONTENIDOS_FIQSHA`)

`origen`, `titulo`, `descripcion`, `imagen`, `tipoContenido`, `nivelId`, `tiempoValor`, `unidadTiempo`, `idioma`, `categoriaFiqshaId`, `proveedorAliadoId`; sin bloque de competencias/habilidades UBITS del modelo empresa. Campos de compatibilidad: `id`, `title`, `imagePath`.

---

## Ejemplo de inclusión (desde `lms-creator/`)

```html
<script src="../../bd-master/bd-master-competencias.js"></script>
<script>
  var comps = window.BD_MASTER_COMPETENCIAS.competencias || [];
</script>
```

## Mantenimiento

- Editas el `.js` que corresponda o regeneras desde tu flujo interno.
- No hay JSON en esta carpeta: el playground no depende de archivos JSON externos.
