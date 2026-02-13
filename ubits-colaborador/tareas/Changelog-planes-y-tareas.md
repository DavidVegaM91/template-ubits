![UBITS](../../images/Ubits-logo-dark.svg)

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

1. [x] **Base de datos unificada única**  
   **`tareas-base-unificada.js`** es la única fuente de datos. Se eliminaron `seguimiento-data.js` y `tareas-db-analisis.md`. Las páginas `tareas.html`, `planes.html`, `plan-detail.html`, `seguimiento.html` y `seguimiento-leader.html` solo cargan esta BD; no hay datos de fallback en `tareas.js`, `planes.js` ni `plan-detail.js`.

2. [x] **Estructura de empresa integrada**  
   La BD incluye la empresa de ejemplo **Fiqsha Decoraciones S.A.S.**: 8 áreas, 1 gerente, 7 jefes, 51 empleados (id, nombre, cargo, área, jefe, avatar, username). Expone `getReportesDirectos(nombreLider)`, `getEmpleadosEjemplo()`, `getJefesEjemplo()`, `getAreasEjemplo()`, `getEmpresaEjemplo()` para uso en seguimiento y filtros.

3. [x] **Usuario actual**  
   **María Alejandra Sánchez Pardo** (Jefe de Logística, id J005) como usuario que abre la plataforma: correo `masanchez@fiqsha.demo`, avatar alineado con el sidebar. `getUsuarioActual()` y el filtrado por asignado/participación usan este usuario.

4. [x] **Tareas: modelo y distribución**  
   - 30 tareas por usuario por mes: 10 individuales (no en seguimiento), 20 grupales (sí en seguimiento).  
   - Campos: id, name, done, status, endDate, priority, assignee_email, etiqueta, created_by, created_by_avatar_url, role, **planId**, **planNombre**, **description** (opcional).  
   - 95% con plan, 5% sueltas (solo las ve el creador en su lista).  
   - Estados por seed: Finalizadas 70–85%, Iniciadas 10–20%, Vencidas 5–15% (`repartoEstados`). Rango de fechas: constantes INICIO_RANGO – FIN_RANGO (ej. 1 ene 2025 – 28 feb 2026).

5. [x] **Planes: modelo único y distribución de estado**  
   - Una sola estructura de plan (lista y detalle usan el mismo objeto): id, name, description, end_date, status, tasksDone, tasksTotal, finished, hasMembers, created_by, fechaCreacion, progress.  
   - Estado del plan **asignado por distribución** (no derivado del avance de tareas): Finalizados 70–85%, Iniciados 10–20%, Vencidos 5–15% (`repartoEstadoPlan` por seed). El progreso (tasksDone/tasksTotal) sigue siendo el real; el estado refleja que el plan se puede finalizar manualmente y mover tareas pendientes a otro plan.  
   - Planes individuales (~3 por mes para María) + planes grupales (por área/mes); ambos con la misma distribución de estados.

6. [x] **Vistas conectadas solo a la BD unificada**  
   - **tareas.html:** `getTareasVistaTareas()` (vencidas + porDia); solo tareas asignadas a María Alejandra; fecha real para vencidas y calendario.  
   - **planes.html:** `getPlanesVistaPlanes()`; solo planes donde participa María (individuales + grupales).  
   - **plan-detail.html:** `getPlanDetalle(planId)` y `getTareasPorPlan(planId)`; misma estructura de plan.  
   - **seguimiento.html / seguimiento-leader.html:** `getActividadesSeguimiento()` y `getActividadesParaLider(nombre)`; solo actividades grupales (tareas y planes de área); sin `seguimiento-data.js`.

7. [x] **Seguimiento: filtro por período con fecha real**  
   En `seguimiento.js` el filtro "últimos 7 días", "último año", etc. usa la **fecha actual** (`new Date()`) para que los rangos y totales sean coherentes con la BD unificada.

8. [x] **Seguimiento – tab Planes con datos**  
   En `tareas-base-unificada.js` se agregó la generación de actividades `tipo: 'plan'` para seguimiento: se agrupan las tareas grupales por nombre de plan y se crea una fila de plan por grupo. Incluido en `getActividadesParaLider()` cuando algún asignado es reporte directo del líder.

9. [x] **tareas.html: vencidas alineadas con seguimiento (~6%)**  
   En `getTareasVistaTareas()` las vencidas se calculan con **`status === 'Vencido'`** (igual que en seguimiento), no por `endDate < hoy && !done`.

10. [x] **Indicadores de seguimiento con formato numérico**  
    En `seguimiento.html` y `seguimiento-leader.html` los indicadores (Total, Finalizadas, Iniciadas, Vencidas) y el contador del header usan `formatIndicatorNumber()` en `seguimiento.js`: **< 10.000** → 1,556; **≥ 10.000** → 10,5 K; **≥ 1.000.000** → 2,7 M.

### 2. Estructura de páginas

3. [x] **Header product en planes y tareas**  
   Implementar el componente **header product** oficial en `planes.html` y `tareas.html`.

4. [x] **Plan detail: tres secciones reales**  
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

10. [x] **Botón del header product: opciones y drawers**  
    Pasar la lógica del botón que actualmente despliega opciones (y cada opción abre el drawer flotante de creación correspondiente) en `planes.html` al **botón del header product**, de modo que ese botón sea el que despliegue las opciones y abra el drawer de crear plan o crear plantilla según corresponda.

11. [ ] **En seguimiento: nombres clicables que abren detalle**  
    Una vez el detalle del plan (y detalle de tarea si aplica) esté verificado y pulido en `plan-detail.html`: en **seguimiento.html** y **seguimiento-leader.html**, hacer que los textos de las columnas **Nombre de la tarea** y **Nombre del plan** sean **clicables** (con subrayado / underline). Al hacer clic debe abrirse el **detalle de la tarea** o el **detalle del plan** correspondiente.

### 5. Tareas vencidas (tareas.html – tareas-overdue-container)

12. [x] **Ordenar tareas vencidas por fecha de vencimiento**  
    En `tareas.html`, en la sección **tareas-overdue-container**, mostrar las tareas vencidas ordenadas de la **fecha de vencimiento más antigua a la más reciente**.

13. [x] **Marcar tarea vencida como finalizada y animar movimiento**  
    Permitir **marcar como finalizada** una tarea vencida. Al hacerlo: (1) cambiar su **status tag a "Finalizada"**, (2) **moverla al final de la lista** de vencidas. El movimiento debe ser **visible**: que se vea la tarea desplazándose hacia abajo de forma rápida (animación/transición), no que desaparezca y reaparezca al final, para evitar la sensación de error.

### 6. Panel detalle de tarea y seguimiento

14. [x] **Detalle de tarea: Asignado a y Creada por en una sola fila**  
    En el panel de detalle de la tarea, poner **"Creada por"** al lado derecho de **"Asignado a"**, de modo que ambos queden uno al lado del otro.

15. [x] **Seguimiento: control de seguridad para eliminar**  
    En `seguimiento.html`, en el flujo de eliminar tareas/planes: añadir un **control de seguridad**: el usuario debe escribir **"eliminar"** en un input; solo entonces se **habilita el botón de eliminar** en el modal.

16. [x] **Seguimiento: menú cambiar estado con texto, no status tag**  
    En `seguimiento.html`, en el botón/menú desplegable de **"Cambiar estado"**, mostrar **texto** en las opciones en lugar de **status tag** (Iniciada, Vencida, Finalizada como texto plano).

17. [x] **Tareas: confirmación de eliminar con modal UBITS y toast**  
    En `tareas.html`, sustituir el `confirm()` nativo al eliminar una tarea por un **modal UBITS** (componente modal): título "Eliminar tarea", mensaje de advertencia y botones "Cancelar" (secondary) y "Eliminar" (error). Tras confirmar, mostrar **toast de éxito** "Tarea eliminada correctamente", alineado con el flujo de finalizar tarea.

18. [x] **Tareas: empty state en Comentarios y evidencias**  
    En el panel de detalle de tarea, sección **Comentarios y evidencias**: cuando no hay comentarios se muestra el **componente oficial Empty State** (icono, título "Aún no hay comentarios", descripción "Aquí podrás ver el historial de comentarios y evidencias de esta tarea. Agrega el primero para empezar." y botón secundario "Agregar comentarios"). El botón del header "Agregar comentarios" se oculta en ese caso y solo aparece cuando ya hay uno o más comentarios. Acción compartida `taskDetailOnAddComment` para el CTA (placeholder hasta implementar el flujo de agregar comentario).

---

*Última actualización: 14–18 implementados — 11 pendientes.*
