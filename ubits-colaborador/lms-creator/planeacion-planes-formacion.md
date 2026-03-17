# Planes de formación – Definición y reglas

Documento de referencia para el prototipo LMS Creator: qué es un plan de formación, estados, progreso y comportamiento del detalle/drawer.

---

## 1. Qué es un plan de formación

Un **plan de formación** es un conjunto de contenidos (cursos, cápsulas, etc.) que un administrador asigna a un grupo de personas (estudiantes) dentro de un rango de fechas (vigencia). El plan tiene un nombre, fecha de inicio, fecha de fin y un listado de asignaciones (quiénes están asignados y qué contenidos tiene cada uno).

- **Progreso del plan:** refleja cuánto han avanzado **los estudiantes** en el estudio de los contenidos asignados. No es un "progreso de carga" ni de procesamiento técnico.
- **Una vez creado**, un plan nunca puede tener 100 % de completitud de golpe: la gente no termina todo al instante. El progreso sube conforme los estudiantes completan contenidos.

---

## 2. Estados del plan

| Estado | Tag | Significado |
|--------|-----|-------------|
| **Planeado** | Azul (info) | Plan creado para una **fecha futura**; aún no ha iniciado. Solo lo ve el administrador; no les aparece a los estudiantes. |
| **Procesando X%** | Amarillo (warning) | El plan se está **creando**: cruce de bases de datos, asignación de contenidos, etc. En el prototipo se simula en ~4 s; en real puede ser ~5 min. Es un estado **transitorio**. No requiere tooltip. |
| **Vigente** | Verde (success) | El plan **está en curso**: la fecha actual está entre fecha de inicio y fecha de fin. Los estudiantes lo ven y su avance cuenta. |
| **No vigente** | Gris (neutral) | Ya pasó la **fecha de cierre**. El progreso del plan quedó congelado; lo que estudien después no suma al plan (aunque sí pueden ver finalizados los contenidos que sigan haciendo). |
| **Inactivo** | Rojo (error) | (Por definir: cuándo se usa este estado.) |

### Regla crítica al salir de Procesando

Cuando el plan **termina de procesar** (Procesando 100 %):

- **Solo** puede pasar a **Planeado** o **Vigente**, según la fecha actual:
  - Si **hoy < fecha de inicio** → **Planeado**
  - Si **hoy está entre inicio y fin** → **Vigente**
- **Nunca** puede quedar **No vigente** al terminar de procesar: no tiene sentido "crear" un plan que ya venció. En el prototipo, si las fechas fueran pasadas, se puede tratar como Vigente o ajustar datos de ejemplo.
- El **progreso del plan** al salir de Procesando debe ser **0 %** (o el valor que ya tuviera de "avance de estudiantes"). El porcentaje de "Procesando" es solo de carga; al pasar a Planeado/Vigente, el progreso mostrado es el de **estudio**, que empieza en 0 (o bajo).

---

## 3. Progreso: estudio, no carga

- **Progreso en la tabla de planes:** promedio (o agregado) del avance de **todos los estudiantes** en los contenidos del plan.
- **Progreso en la fila de un estudiante (detalle del plan):** avance de **ese estudiante** en los contenidos que tiene asignados (por curso/contenido).
- **Progreso en cada card (drawer):** avance de ese estudiante en **ese curso/contenido**. La suma o promedio de esos avances debe **coincidir** con el progreso mostrado en la fila de ese estudiante.
- La **barra total del plan** (card "Progreso del plan") debe ser el **agregado** de todos los progresos de los estudiantes (p. ej. promedio o suma ponderada).

Los datos del prototipo (planes-formacion y detalle-plan) deben respetar esta lógica para que tenga sentido.

---

## 4. Detalle del plan – Tabla de asignaciones

- Cada fila = un **estudiante** asignado al plan.
- Columnas relevantes: usuario, último acceso, última fecha de progreso, **contenidos** (botón/acción), **progreso** (avance de ese estudiante en sus contenidos).
- **Clic en la fila** (o en el botón de contenidos) debe abrir el **drawer** de ese estudiante.

---

## 5. Drawer al hacer clic en una fila (estudiante)

Al abrir el drawer de un estudiante se muestra:

1. **Card content compact (arriba)**  
   - Una card compacta **por cada curso/contenido** asignado a ese estudiante.  
   - Cada card tiene **barra de progreso interna**: el progreso de **ese estudiante en ese curso**.  
   - El **progreso total de la fila** del estudiante debe **concordar** con el agregado (p. ej. promedio) de los progresos de estas cards.

2. **Cards de contenidos (debajo)**  
   - Misma lista de contenidos en formato **card colapsado**.  
   - Cada card muestra el **progreso de estudio** de ese estudiante en ese contenido.  
   - Deben ser colapsables para no saturar la vista.

3. **Cierre**  
   - Botón Cerrar (y opcionalmente "Agregar contenidos" si se mantiene esa acción en el drawer).

La **barra total del plan** (fuera del drawer) debe reflejar la **suma/agregado de todos los progresos de los estudiantes** (las filas de la tabla).

---

## 6. Resumen de coherencia de datos

- Plan recién creado (sale de Procesando): **estado** = Planeado o Vigente; **progreso** = 0 % (o bajo).  
- Progreso en tabla de planes = agregado del avance de estudiantes.  
- Progreso por fila (estudiante) = agregado del avance de ese estudiante en sus contenidos.  
- Progreso en cada card del drawer = avance de ese estudiante en ese contenido; debe cuadrar con la fila.  
- No vigente solo para planes cuya **fecha de fin ya pasó**; nunca como resultado de "acabar de crear" un plan.

---

*Última actualización: marzo 2025. Prototipo: LMS Creator (planes-formacion, detalle-plan, drawer de contenidos por estudiante).*
