![UBITS](../../images/Ubits-logo-dark.svg)

# Backlog – Tareas y Planes

Ajustes pendientes sobre los archivos entregados por la PM Mafe para las páginas de **Tareas**, **Planes** y **Detalle de plan**.

**Archivos en scope:**
- `plan-detail.css`, `plan-detail.html`, `plan-detail.js`
- `planes.css`, `planes.html`, `planes.js`
- `tareas.css`, `tareas.html`, `tareas.js`

---

### 1. Datos y usuario

1. [x] **Base de datos unificada y empresa de ejemplo**  
   Todas las páginas de tareas (Tareas, Planes, Detalle de plan, Seguimiento y Seguimiento líder) comparten **una sola base de datos** (`tareas-base-unificada.js`) que simula una empresa real: **Fiqsha Decoraciones S.A.S.**, con 8 áreas, 1 gerente, 7 jefes y 51 empleados. Los datos están en español (nombres, cargos, áreas) y el usuario que abre la plataforma es **María Alejandra Sánchez Pardo** (Jefe de Logística).  
   - **Tareas:** en promedio ~30 por usuario por mes: ~10 individuales (solo en Mi lista) y ~20 grupales (además en seguimiento). La mayoría vinculadas a un plan; unas pocas sueltas.  
   - **Planes:** individuales (~3 por mes para María) y grupales por área; misma lógica de estados.  
   - **Estados (tareas y planes):** reparto tipo real: **Finalizadas 70–85%**, **Iniciadas 10–20%**, **Vencidas 5–15%**.  
   - **Rango de fechas** de los datos: desde el **1 ene 2025** hasta el **28 feb 2026**.  
   Las vistas (tareas, planes, detalle, seguimiento) consumen solo esta BD; los filtros de período en seguimiento usan la fecha actual para que los totales sean coherentes.

2. [x] **Indicadores de seguimiento con formato numérico**  
    En `seguimiento.html` y `seguimiento-leader.html` los indicadores (Total, Finalizadas, Iniciadas, Vencidas) y el contador del header usan `formatIndicatorNumber()` en `seguimiento.js`: **< 10.000** → 1,556; **≥ 10.000** → 10,5 K; **≥ 1.000.000** → 2,7 M.

### 2. Estructura de páginas

3. [x] **Header product en planes y tareas**  
   Implementar el componente **header product** oficial en `planes.html` con version mobile de boton flotante.

### 3. Componentes oficiales UBITS

5. [x] **Revisión general de botones e inputs**  
   Revisar que en los archivos de scope se usen **botones e inputs oficiales** de UBITS (componentes del template), y corregir donde no sea así.

6. [x] **Verificar uso del componente oficial Status Tag**  
   Revisar que `plan-detail.html`, `planes.html` y `tareas.html` usen el **componente oficial Status Tag** de UBITS (clases y variantes correctas). Corregir cualquier etiqueta de estado que no lo use. *Verificado: las tres páginas importan `status-tag.css` y usan `ubits-status-tag`, variantes `--success`/`--info`/`--error`/`--neutral`, `--sm`, `--icon-left` y `ubits-status-tag__text`; seguimiento.js también.*

7. [x] **Componentizar la tirilla de tareas**  
   La tirilla de tareas que está dentro de `tareas.html` debe convertirse en un **componente reutilizable** (CSS + JS, y opcionalmente HTML de referencia). Sin documentacion en html, pero si creado para reutilizarlo. Una vez componentizada, **implementarla** tanto en `tareas.html` como en `plan-detail.html`. Primero implementala en plan detail que es mas chiquis, si queda bien ahi si la implementas en tareas.

8. [ ] **Drawers de creación con componente oficial**  
   Asegurar que los drawers de **"Crear un plan"** y **"Crear una plantilla"** usen el **componente drawer oficial** UBITS.

9. [x] **Componentizar el detalle de tarea**  
   Crearlo e implementarlo en tareas, detalle de plan y paginas de seguimiento

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

19. [x] **Tareas: fecha de vencimiento como botón terciario con calendario oficial**  
    En la tirilla de tarea (`tareas.js`), la **fecha de vencimiento** es un **botón terciario oficial** (`ubits-button--tertiary`, `ubits-button--sm`). Al hacer clic se abre el **calendario oficial** UBITS (`createCalendar`) en un popover con clase `ubits-calendar-dropdown`, pegado al botón. El posicionamiento replica el del input calendar: alineación por la derecha del botón y despliegue **arriba o abajo** según espacio en el viewport (espacio inferior vs superior). Tras elegir fecha se actualiza la tarea, se mueve entre vencidas/porDia y se re-renderiza; toast de éxito.

---

*Última actualización: 14–19 implementados — 11 pendientes.*
