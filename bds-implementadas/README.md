# BDs implementadas

Esta carpeta contiene las **bases de contenidos ya aterrizadas en paginas** para uso directo y lectura rapida.

## Que contiene

- `bd-contenidos-ubits.js`: base de contenidos UBITS para consumo local en `file://` (`window.BDS_CONTENIDOS_UBITS`).
- `bd-contenidos-fiqsha.js`: base de contenidos Fiqsha/empresa para consumo local en `file://` (`window.BDS_CONTENIDOS_FIQSHA`).

## Para que existe esta carpeta

- Tener claro cuales BDs de contenido ya estan implementadas en vistas.
- Separar las BDs "listas para consumo funcional" de las BDs maestras separadas por dominio (`bd-master`).
- Facilitar handoff a diseno/producto sin tener que navegar muchos archivos tecnicos.

## Indice de implementacion (actual)

### `bd-contenidos-ubits.js`
- **Pagina:** `ubits-colaborador/lms-creator/crear-plan-contenidos.html`
- **Uso:** drawer "Agregar contenidos" (fuente UBITS para cards de seleccion).
- **Objetivo:** proveer contenidos UBITS al flujo de armado de plan.

### `bd-contenidos-fiqsha.js`
- **Pagina:** `ubits-colaborador/lms-creator/crear-plan-contenidos.html`
- **Uso:** drawer "Agregar contenidos" (fuente empresa/Fiqsha).
- **Objetivo:** incluir contenidos corporativos dentro del mismo flujo de seleccion.

## Nota de orden

Aqui solo viven las BDs de contenidos implementadas y su contexto de uso.  
Las bases separadas por dominio viven en `bd-master`.

## Consumo tecnico actual

`crear-plan-contenidos` consume esta carpeta con:

- script (antes que los catálogos): `../../bd-master/bd-master-niveles-contenido.js` — resuelve el **nombre** del nivel desde `nivelId`.
- script: `../../bd-master/bd-master-aliados.js` — resuelve **nombre y logo** del proveedor desde ids de aliado.
- script: `../../bd-master/bd-master-competencias.js` y `../../bd-master/bd-master-habilidades.js` — nombre de competencia para cards UBITS desde ids.
- script: `../../bd-master/bd-master-categorias-fiqsha.js` — nombre de categoría empresa para Fiqsha desde `categoriaFiqshaId`.
- script: `../../bds-implementadas/bd-contenidos-ubits.js`
- script: `../../bds-implementadas/bd-contenidos-fiqsha.js`
- combinacion en pagina: merge de `window.BDS_CONTENIDOS_UBITS.contents` + `window.BDS_CONTENIDOS_FIQSHA.contents`

## Esquema de datos (v2)

### UBITS (`contents[]`)

Esquema consolidado (antes referenciaba maestros en `bd-master`; ahora la fuente de verdad es este archivo):

- `origen`, `titulo`, `descripcion`, `imagen`, `tipoContenido`, `nivelId` (`niv-001` / `niv-002` / `niv-003`; nombres en `bd-master/bd-master-niveles-contenido.js`), `tiempoValor`, `unidadTiempo`, `idioma`
- `competenciaPrincipalId`, `habilidadPrincipalId`, `habilidadesSecundariasIds` (nombres en `bd-master-competencias.js` / `bd-master-habilidades.js`)
- `expertos`, `aliadoId`, `nivelIngles` (null si no aplica)
- `providersAliadosIds`: ids de `bd-master/bd-master-aliados.js`; en **Ruta de aprendizaje** hay varios aliados; en el resto suele ser `["aly-001"]` (UBITS)
- Campos de compatibilidad: `id`, `fileName`, `title`, `imagePath` (sin `provider` en texto: se deriva del maestro)

### Fiqsha (`contents[]`)

Modelo empresa/Fiqsha consolidado en este archivo:

- `origen`, `titulo`, `descripcion`, `imagen`, `tipoContenido`, `nivelId` (mismo maestro que UBITS), `tiempoValor`, `unidadTiempo`, `idioma`, `categoriaFiqshaId` (`cfq-XXX` en `bd-master/bd-master-categorias-fiqsha.js`), `proveedorAliadoId` (`aly-018`, nombre del aliado en `bd-master-aliados.js`)
- **No** incluye competencias UBITS, habilidades, expertos, nivel de ingles ni aliados multiples en el modelo de datos.
- Campos de compatibilidad: `id`, `title`, `imagePath`
