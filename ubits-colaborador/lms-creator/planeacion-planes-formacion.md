# Planes de formación – Definición y reglas

Documento de referencia para el prototipo LMS Creator: tipos de plan (contenidos vs competencias), estados, progreso y diferencias entre ambos flujos.

---

## 1. Dos tipos de plan

En el LMS Creator existen **dos tipos de plan de formación**:

| Tipo | Página de creación | Qué se asigna |
|------|--------------------|----------------|
| **Plan de contenidos** | `crear-plan-contenidos.html` | Contenidos (cursos, cápsulas, etc.) a grupos o personas. |
| **Plan de competencias** | `crear-plan-competencias.html` | Competencias (no contenidos) a grupos o personas. |

- **Planes de contenidos:** el administrador asigna **contenidos** (cursos, cápsulas, etc.) a estudiantes dentro de un rango de fechas. Cada asignación tiene “quiénes” y “qué contenidos”.
- **Planes de competencias:** el administrador asigna **competencias** (no contenidos concretos) a estudiantes dentro de un rango de fechas. Cada asignación tiene “quiénes” y “qué competencias”, más un campo exclusivo: **horas por competencia** (véase más abajo).

El resto de este documento se estructura en: reglas comunes (estados, progreso), luego **planes de contenidos** y luego **planes de competencias** con sus diferencias.

---

## 2. Reglas comunes (estados y progreso)

### 2.1 Estados del plan

| Estado | Tag | Significado |
|--------|-----|-------------|
| **Planeado** | Azul (info) | Plan creado para una **fecha futura**; aún no ha iniciado. Solo lo ve el administrador. |
| **Procesando X%** | Amarillo (warning) | El plan se está **creando** (cruce de datos, asignaciones). Transitorio. |
| **Vigente** | Verde (success) | El plan **está en curso**: fecha actual entre inicio y fin. Los estudiantes lo ven. |
| **No vigente** | Gris (neutral) | Pasó la **fecha de cierre**. Progreso congelado. |
| **Inactivo** | Rojo (error) | (Por definir.) |

Al salir de **Procesando**, el plan solo puede pasar a **Planeado** o **Vigente** según la fecha actual; el progreso mostrado es el de **estudio** (empieza en 0).

### 2.2 Progreso: estudio, no carga

- **Progreso en la tabla de planes:** agregado del avance de **todos los estudiantes** en lo asignado (contenidos o competencias).
- **Progreso por estudiante:** avance de **ese estudiante** en sus contenidos o competencias.
- La barra total del plan debe ser coherente con la suma/promedio de los progresos de los estudiantes.

---

## 3. Planes de contenidos

### 3.1 Definición

Un **plan de contenidos** es un conjunto de **contenidos** (cursos, cápsulas, etc.) que un administrador asigna a un grupo de personas dentro de un rango de fechas (vigencia). El plan tiene:

- Nombre
- **Fecha de inicio** y **fecha de fin**
- Listado de **asignaciones**: quiénes están asignados y **qué contenidos** tiene cada asignación.

No existe el campo “horas por competencia”; ese campo es exclusivo de planes de competencias.

### 3.2 Creación (crear-plan-contenidos)

- Formulario: nombre del plan, vigencia (fecha inicio, fecha fin).
- Tabla de asignaciones: columnas “Asignados” y “Contenidos asignados”; botón “Agregar contenidos” / “X contenidos” por fila.
- Drawer **“Agregar contenidos”** para elegir cursos/contenidos por asignación.
- Validación: todas las asignaciones deben tener al menos un contenido para poder guardar.

#### 3.2.1 Drawer “Agregar contenidos” (detalle)

- **Izquierda:** búsqueda por texto (título o competencia del curso) y filtro por origen (Todos los cursos / Solo cursos UBITS / Solo cursos de mi empresa). Grid de **cards compactos de contenido** (componente `card-content-compact`): miniatura, título, etc. Al hacer clic en una card se agrega a la selección y la card muestra borde azul (estado seleccionado). Scroll infinito: se cargan 12 contenidos inicialmente y más al hacer scroll.
- **Tabla derecha:** una fila por contenido seleccionado: celda con título del contenido y botón eliminar. Empty state cuando no hay ninguno (“No hay contenidos agregados”).
- **Datos guardados por asignación:** array de ítems de curso (id, title, etc.). Origen de datos: `catalogo-cursos-drawer-data.js` (listado de contenidos/cursos disponibles).

### 3.3 Detalle del plan – Tabla y drawer

- Cada fila = un **estudiante** asignado.
- Columnas: usuario, último acceso, **contenidos**, **progreso**.
- Clic en fila (o contenidos) abre el **drawer** de ese estudiante con cards de contenidos y progreso por contenido.

---

## 4. Planes de competencias

### 4.1 Definición

Un **plan de competencias** asigna **competencias** (no contenidos concretos) a grupos o personas dentro de un rango de fechas. El plan tiene:

- Nombre
- **Fecha de inicio** y **fecha de fin**
- **Horas por competencia** (campo exclusivo de este tipo de plan; ver 4.2)
- Listado de **asignaciones**: quiénes están asignados y **qué competencias** tiene cada asignación.

No se asignan “contenidos” (cursos/cápsulas); se asignan competencias. La carga de estudio se calcula a partir de las horas por competencia y el número de competencias.

### 4.2 Horas por competencia (intensidad horaria)

- **Nombre en UI (sugerido):** “Horas por competencia” (o “Intensidad horaria” si se prefiere copy más corto).
- **Significado:** Número de **horas que cada estudiante debe dedicar por cada competencia** asignada en el plan.
- **Ejemplo:** Si el administrador indica **4** horas por competencia y asigna **5 competencias** a un grupo de personas, **cada persona** de ese grupo debe estudiar **4 h × 5 = 20 horas** en total (4 h por cada una de las 5 competencias).
- **Tipo de campo:** Numérico (entero o decimal según reglas de negocio).
- **Ubicación en la UI:** Junto a la vigencia (al lado de la fecha de finalización), solo en la pantalla de **crear/editar plan de competencias**.

Este valor es **por plan** (no por asignación): todas las asignaciones del plan comparten la misma “horas por competencia”. El total de horas por persona = **horas por competencia × número de competencias asignadas a esa persona/grupo**.

### 4.3 Creación (crear-plan-competencias)

- Formulario: nombre del plan, vigencia (fecha inicio, fecha fin), **horas por competencia**.
- Tabla de asignaciones: columnas “Asignados” y “Competencias asignadas”; botón “Agregar competencias” / “X competencias” por fila.
- Drawer **“Agregar competencias”** para elegir competencias (y habilidades) por asignación; **no** drawer de contenidos/cursos.
- Validación: todas las asignaciones deben tener al menos una competencia para poder guardar.

#### 4.3.1 Drawer “Agregar competencias” (detalle)

- **Izquierda:** cards de competencia (mismo estilo que en catalogo-v5: imagen + nombre + “X habilidades”), **sin** status tag “Asignado” ni botones a la derecha. Búsqueda por texto (competencia, academia o habilidad).
- **Selección:** al hacer clic en una card: (1) borde azul, (2) la card se expande y muestra la lista de **habilidades** hijas de esa competencia, cada una con un **checkbox** (todas marcadas por defecto); (3) la competencia se agrega a la tabla de la derecha.
- **Habilidades:** el usuario puede desmarcar las que no quiera. Si desmarca **todas** las habilidades, la competencia se deselecciona y se elimina de la tabla (no tiene sentido una competencia sin habilidades).
- **Tabla derecha:** una fila por competencia seleccionada. La celda de competencia tiene **dos líneas**: línea principal = nombre de la competencia, línea secundaria (estilo helper) = “X habilidad(es)”. Botón eliminar quita la competencia de la selección.
- **Datos guardados por asignación:** array de ítems `{ id, title, habilidades: [] }` (id/title = nombre de la competencia; habilidades = array de nombres de habilidades seleccionadas). Origen de datos: `catalogo-competencias-drawer-data.js` (academias → competencias → habilidades, mismo modelo que catalogo-v5).

### 4.4 Diferencias resumidas frente a planes de contenidos

| Aspecto | Plan de contenidos | Plan de competencias |
|---------|--------------------|------------------------|
| Página de creación | `crear-plan-contenidos.html` | `crear-plan-competencias.html` |
| Campo extra en formulario | — | **Horas por competencia** (junto a fechas) |
| Qué se asigna | Contenidos (cursos, etc.) | Competencias |
| Columna en tabla de asignaciones | “Contenidos asignados” | “Competencias asignadas” |
| Drawer de asignación | Agregar contenidos (ver 3.2.1: cards compactos, filtro por origen, scroll) | Agregar competencias (ver 4.3.1: cards competencia + habilidades con checkbox; tabla dos líneas) |
| Cálculo de carga | Según contenidos/contenidos asignados | Horas por competencia × nº de competencias por persona |

---

## 5. Resumen de coherencia de datos

- Plan recién creado (sale de Procesando): **estado** = Planeado o Vigente; **progreso** = 0 % (o bajo).
- Progreso en tabla de planes = agregado del avance de estudiantes.
- Progreso por fila (estudiante) = agregado del avance de ese estudiante en sus contenidos o competencias.
- **No vigente** solo para planes cuya fecha de fin ya pasó; nunca como resultado de “acabar de crear” un plan.
- En **planes de competencias**, el total de horas por estudiante = **horas por competencia** × **cantidad de competencias** asignadas a ese estudiante/grupo.

---

*Última actualización: marzo 2025. Prototipo: LMS Creator. Drawer “Agregar contenidos” documentado en 3.2.1; drawer “Agregar competencias” en 4.3.1.*
