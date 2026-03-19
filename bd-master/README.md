# BD master

Esta carpeta contiene las **bases maestras del playground** (solo template local, no producción).

## Formato

Todo está en **JavaScript** para que funcione al abrir HTML por `file://` sin `fetch` a JSON.

Cada archivo asigna un objeto global en `window`:

| Archivo | Variable global |
|---------|-----------------|
| `bd-master-aliados.js` | `window.BD_MASTER_ALIADOS` |
| `bd-master-competencias.js` | `window.BD_MASTER_COMPETENCIAS` |
| `bd-master-habilidades.js` | `window.BD_MASTER_HABILIDADES` |
| `bd-master-categorias-fiqsha.js` | `window.BD_MASTER_CATEGORIAS_FIQSHA` |
| `bd-master-niveles-contenido.js` | `window.BD_MASTER_NIVELES_CONTENIDO` |
| `bd-master-colaboradores.js` | `window.BD_MASTER_COLABORADORES` |

Los catálogos de **contenidos** (UBITS + Fiqsha/empresa, rutas incluidas) están consolidados en `bds-implementadas/bd-contenidos-ubits.js` y `bds-implementadas/bd-contenidos-fiqsha.js`; ya no hay maestros separados en esta carpeta.

## Uso en una página (ej. desde `ubits-colaborador/lms-creator/`)

```html
<script src="../../bd-master/bd-master-competencias.js"></script>
<script>
  var comps = window.BD_MASTER_COMPETENCIAS.competencias || [];
</script>
```

## Relación con `bds-implementadas/`

- **`bd-master`**: datos maestros por dominio (referencia del playground).
- **`bds-implementadas`**: catálogos ya listos para un flujo concreto (ej. drawer de contenidos).
- Los ítems de `bd-contenidos-ubits.js` y `bd-contenidos-fiqsha.js` usan **`nivelId`** apuntando a `bd-master-niveles-contenido.js`; al cambiar el `nombre` de un nivel en el maestro, la UI que resuelve el id mostrará el nuevo texto sin editar los catálogos.
- **Proveedores:** UBITS usa **`providersAliadosIds`** y Fiqsha **`proveedorAliadoId`** (`aly-018`), ambos contra `bd-master-aliados.js` (nombre + logo). Fiqsha es el **último id** (`aly-018`) y el último ítem del array.
- **Competencias y habilidades (UBITS):** el catálogo usa solo **`competenciaPrincipalId`**, **`habilidadPrincipalId`** y **`habilidadesSecundariasIds`** frente a `bd-master-competencias.js` y `bd-master-habilidades.js` (el nombre de la competencia en UI sale del maestro).
- **Categorías empresa (Fiqsha):** `bd-contenidos-fiqsha.js` usa **`categoriaFiqshaId`** (`cfq-XXX`) contra **`bd-master-categorias-fiqsha.js`**.

## Regla de mantenimiento

- Editas el `.js` que toque o regeneras desde tu propio flujo interno.
- No hay JSON en esta carpeta: el playground no depende de ellos.
