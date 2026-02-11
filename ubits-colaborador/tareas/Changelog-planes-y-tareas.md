# Backlog – Tareas y Planes

Ajustes pendientes sobre los archivos entregados por la PM para las páginas de **Tareas**, **Planes** y **Detalle de plan**. Los ítems se irán agregando aquí y luego se implementarán en orden.

**Archivos en scope:**
- `plan-detail.css`, `plan-detail.html`, `plan-detail.js`
- `planes.css`, `planes.html`, `planes.js`
- `tareas.css`, `tareas.html`, `tareas.js`

---

## Pendientes

Orden sugerido: primero datos y usuario, luego estructura de páginas, después componentes oficiales y por último la lógica del botón del header.

### 1. Datos y usuario

1. [x] **Base de datos (seguimiento-data.js)**  
   Agregar a **María Alejandra Sánchez Pardo** como el usuario que abre la plataforma: mismo avatar que usa el componente sidebar. Hacerla **líder de un área** (reemplazar a uno de los líderes actuales; idealmente un área de operaciones).

2. [ ] **Tareas y planes propios de María Alejandra**  
   Objetivo: datos realistas de tareas y planes **individuales** de María Alejandra que aparezcan en `planes.html` y `tareas.html` pero **no** en seguimiento. Implementación subdividida en:

   - 2.1 [ ] **Fuente de datos y usuario actual**  
     Usar la base unificada (`tareas-base-unificada.js`). Asegurar que el usuario actual sea **María Alejandra** con correo y avatar alineados con la base (ej. `masanchez@fiqsha.demo`, avatar del sidebar). Si `tareas.js` tiene datos propios de tareas, reemplazarlos por la fuente unificada.

   - 2.2 [ ] **Tareas sueltas individuales (~30 por mes)**  
     Poblar en la BD unificada tareas sueltas (sin plan), creadas y asignadas a María Alejandra, en volumen ~30 por mes y rango 1 ene 2025 – 30 jun 2026. Formato compatible con `tareas.html` (vencidas + porDia). Criterio vencidas: `endDate < hoy && !done`. Estas tareas **no** deben incluirse en las actividades de seguimiento.

   - 2.3 [ ] **Planes individuales (~3 por mes)**  
     Poblar en la BD unificada planes donde **solo** está María Alejandra como participante (~3 por mes, mismo rango de fechas). Cada plan con sus tareas (plan = agrupación de tareas). No deben aparecer en seguimiento; **sí** en `planes.html` y en detalle al abrir un plan.

   - 2.4 [ ] **Vista tareas.html: conectar y filtrar por asignado**  
     Conectar `tareas.html` a la base unificada para que muestre **solo tareas asignadas a María Alejandra**. En `tareas.js`, sustituir la fuente actual (ej. `tareasEjemplo`) por el getter de la BD (ej. `getTareasVistaTareas()`). Usar fecha actual real para vencidas y calendario.

   - 2.5 [ ] **Vista planes.html: conectar y filtrar por participación**  
     Conectar `planes.html` a la base unificada para que muestre **solo planes donde participa María Alejandra** (individuales + grupales). En `planes.js`, sustituir la fuente actual (ej. `planesEjemplo`) por el getter correspondiente (ej. `getPlanesVistaPlanes()`).

   - 2.6 [ ] **Seguimiento: excluir actividades individuales**  
     Asegurar que en `seguimiento.html` y `seguimiento-leader.html` la lista de actividades **excluya** planes y tareas “solo para sí mismo” (mostrar solo actividades **grupales**). La BD unificada debe exponer esto en `getActividadesSeguimiento()` (o la fuente que use seguimiento).

### 2. Estructura de páginas

3. [ ] **Header product en planes y tareas**  
   Implementar el componente **header product** oficial en `planes.html` y `tareas.html`.

4. [ ] **Plan detail: tres secciones reales**  
   En `plan-detail` la PM pintó las 3 secciones dentro de una sola. Corregir para que haya **3 secciones independientes** (no todo dentro de una). Al hacerlo, no romper la lógica actual de llenado de datos.

### 3. Componentes oficiales UBITS

5. [ ] **Revisión general de botones e inputs**  
   Revisar que en los archivos de scope se usen **botones e inputs oficiales** de UBITS (componentes del template), y corregir donde no sea así.

6. [ ] **Verificar uso del componente oficial Status Tag**  
   Revisar que `plan-detail.html`, `planes.html` y `tareas.html` usen el **componente oficial Status Tag** de UBITS (clases y variantes correctas). Corregir cualquier etiqueta de estado que no lo use.

7. [ ] **Componentizar la tirilla de tareas**  
   La tirilla de tareas que está dentro de `tareas.html` debe convertirse en un **componente reutilizable** (CSS + JS, y opcionalmente HTML de referencia). Una vez componentizada, **implementarla** tanto en `tareas.html` como en `planes.html`.

8. [ ] **Drawers de creación con componente oficial**  
   Asegurar que los drawers de **"Crear un plan"** y **"Crear una plantilla"** usen el **componente drawer oficial** UBITS.

9. [ ] **Componentizar el detalle del plan como variante del drawer oficial**  
   El detalle del plan debe ser una **variante del drawer oficial** UBITS en modo **pantalla completa**. Asegurar que comparta estilos importantes con el drawer oficial (encabezado y footer, entre otros) para mantener consistencia.

### 4. Lógica e integración

10. [ ] **Botón del header product: opciones y drawers**  
    Pasar la lógica del botón que actualmente despliega opciones (y cada opción abre el drawer flotante de creación correspondiente) en `planes.html` al **botón del header product**, de modo que ese botón sea el que despliegue las opciones y abra el drawer de crear plan o crear plantilla según corresponda.

11. [ ] **En seguimiento: nombres clicables que abren detalle**  
    Una vez el detalle del plan (y detalle de tarea si aplica) esté verificado y pulido en `plan-detail.html`: en **seguimiento.html** y **seguimiento-leader.html**, hacer que los textos de las columnas **Nombre de la tarea** y **Nombre del plan** sean **clicables** (con subrayado / underline). Al hacer clic debe abrirse el **detalle de la tarea** o el **detalle del plan** correspondiente.

---

## Hechos

*(Se moverán aquí los ítems ya implementados)*

---

*Última actualización: agregados drawer full-screen para detalle del plan e integración en seguimiento (nombres clicables) — 11 pendientes.*
