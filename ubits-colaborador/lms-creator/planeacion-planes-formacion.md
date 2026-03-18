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

**Planeado:** al abrir un plan con estado Planeado se usa la **misma página de detalle** que para un plan Vigente (`detalle-plan.html`): misma vista, misma tabla de asignaciones y mismos drawers. La única diferencia es el **status tag** (“Planeado”) y que el **progreso del plan y el de cada usuario se muestran en 0 %** (al no haber iniciado, no hay progreso). No se usa una vista 100 % editable para Planeado.

#### 2.1.1 Cómo se ve el detalle del plan según el estado

En **planes de contenidos**, al abrir un plan desde la lista:

| Estado       | Página que se abre      | Tag visible | Progreso        | Fecha de fin  | Botón principal     | Clic en fila / contenidos                    | Barra de acciones (varios seleccionados)     |
|-------------|--------------------------|-------------|-----------------|---------------|----------------------|----------------------------------------------|-----------------------------------------------|
| **Procesando** | Editar (p. ej. `editar-plan-contenidos`) | Procesando X% | —               | —             | —                    | —                                            | —                                              |
| **Planeado**   | `detalle-plan.html`      | Planeado    | 0 % (plan y por fila) | Editable      | “Agregar asignación” | Drawer **Agregar contenidos**                | Enviar recordatorio, **Asignar contenidos**, Eliminar del plan |
| **Vigente**    | `detalle-plan.html`      | Vigente     | Real (plan y por fila) | Editable      | “Agregar asignación” | Drawer **Agregar contenidos**                | Enviar recordatorio, **Asignar contenidos**, Eliminar del plan |
| **No vigente** | `detalle-plan.html`      | No vigente  | Congelado       | Solo lectura  | No (o no destacado)  | **Panel de solo lectura** (sin drawer agregar) | Solo Enviar recordatorio y Eliminar del plan (sin “Asignar contenidos”) |

- **Planeado y Vigente:** misma pantalla; solo cambian el tag y si el progreso es 0 % o real. En ambos se puede agregar asignación, editar fecha de fin, abrir el drawer para agregar contenidos por fila y usar “Asignar contenidos” para varias personas a la vez.
- **No vigente:** no se puede agregar contenidos desde el drawer (el clic en fila abre un panel de solo lectura); la barra de acciones no muestra el botón “Asignar contenidos”.

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

- Para planes **Planeado** y **Vigente** (y No vigente) se usa la misma página **detalle-plan**. Solo **Procesando** redirige a editar (si aplica).
- Cada fila = un **estudiante** asignado.
- Columnas: usuario, último acceso, **contenidos**, **progreso**. Si el plan es Planeado, el progreso del plan y el de cada fila se muestran en 0 %.
- Clic en fila (o contenidos) abre el **drawer** de ese estudiante con cards de contenidos y progreso por contenido.

#### 3.3.1 Barra de acciones y “Asignar contenidos” (solo Planeado y Vigente)

- Con **varias personas seleccionadas** (checkboxes) en la tabla de asignaciones aparece la barra de acciones con botones.
- **Solo para planes en estado Planeado o Vigente** (no para No vigente), entre “Enviar recordatorio” y “Eliminar del plan” hay un botón secundario **“Asignar contenidos”**.
- Al hacer clic se abre el **mismo drawer “Agregar contenidos”** (búsqueda, cards compactos, tabla de agregados). Los contenidos elegidos se **asignan a todas las personas seleccionadas**: se hace merge por curso (sin duplicar); no se borran los contenidos que cada uno ya tenía.

#### 3.3.2 Drawer “Agregar contenidos” en detalle-plan

- Mismo comportamiento que en crear-plan (ver 3.2.1): búsqueda, filtro por origen (si aplica), cards compactos y **scroll infinito** (12 contenidos iniciales, más al hacer scroll en la zona de resultados), de modo que se pueden cargar todos los contenidos del catálogo.

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
- **Ubicación en la UI:** Junto a la vigencia (al lado de la fecha de finalización) en **crear-plan-competencias** y en **detalle-plan-competencias**.
- **En detalle del plan:** Si el plan es **Vigente** o **Planeado**, el campo es **editable** (input numérico; solo se admiten dígitos: teclado, pegado y validación en `input` filtran no numéricos). Si el plan es **No vigente**, se muestra como **texto** (solo lectura), igual que las fechas en planes no vigentes.

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

### 4.4 Lista de planes y navegación (planes-formacion.html)

- En **planes-formacion.html** hay dos tabs: **Planes de contenidos** y **Planes de competencias**.
- En el tab **Planes de competencias** la tabla muestra solo planes de tipo competencias (ej. 3 planes: uno Planeado, uno Vigente, uno No vigente). Al hacer clic en una fila se navega a **detalle-plan-competencias.html?id=**`<id>` (ej. `c1`, `c2`, `c3`). El detalle muestra nombre, fechas, estado, progreso y **horas de estudio por competencia** coherentes con el plan elegido.

### 4.5 Detalle del plan de competencias (detalle-plan-competencias.html)

- Para planes de competencias en estado **Planeado**, **Vigente** o **No vigente** se usa la misma página **detalle-plan-competencias.html** (no hay redirección a editar como en contenidos con “Procesando”).
- Card de progreso: nombre del plan, **fechas** (inicio; fin editable solo si Vigente/Planeado, texto si No vigente), **horas de estudio por competencia** (editable si Vigente/Planeado, texto si No vigente), barra de progreso del plan.
- Tabla de asignaciones: columnas usuario, último acceso, competencias asignadas, progreso. Botón “Agregar competencias” / “X competencias” por fila. Clic en fila o en el botón abre el **drawer “Agregar competencias”** (mismo comportamiento que en crear-plan: cards de competencia, expansión con habilidades y checkboxes, tabla derecha con dos líneas por competencia).
- Con **varias personas seleccionadas**, barra de acciones con **“Asignar competencias”** (solo Planeado/Vigente): se abre el mismo drawer y los ítems elegidos se hacen **merge** en cada persona seleccionada (sin duplicar por id de competencia).

### 4.6 Diferencias resumidas frente a planes de contenidos

| Aspecto | Plan de contenidos | Plan de competencias |
|---------|--------------------|------------------------|
| Página de creación | `crear-plan-contenidos.html` | `crear-plan-competencias.html` |
| Página de detalle | `detalle-plan.html` | `detalle-plan-competencias.html` |
| Campo extra (crear y detalle) | — | **Horas por competencia** (junto a fechas; en detalle: editable Vigente/Planeado, solo lectura No vigente) |
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

*Última actualización: marzo 2025. Prototipo: LMS Creator. Drawer “Agregar contenidos” en 3.2.1 y en detalle-plan (3.3.2, con scroll infinito); botón “Asignar contenidos” en barra de acciones (3.3.1, solo Planeado/Vigente). Planes de competencias: lista por tab en planes-formacion (4.4), detalle en detalle-plan-competencias (4.5), horas por competencia en crear y en detalle (editable/lectura según estado); drawer “Agregar competencias” en 4.3.1 y en detalle-plan-competencias (mismo layout y merge multi).*
