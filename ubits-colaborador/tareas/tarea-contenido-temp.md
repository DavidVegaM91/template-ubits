# Tarea «ver un contenido de Aprendizaje» — guía simple (borrador)

Este texto es para **cualquier persona**: no hace falta saber de programación. La idea es que se entienda **qué estamos armando** y **qué haría el usuario** en la pantalla.

---

## 1. De qué va esto (en dos frases)

Hoy las tareas son como un **pendiente con nombre**: escribes el título, lo marcas cuando quieres, y listo.

El **nuevo tipo** es distinto: es un pendiente que dice **«tienes que ver este curso o este material»** que ya existe en **Aprendizaje**. No basta con escribir un nombre suelto: hay que **elegir cuál contenido** es. Y cuando la persona **termina** ese contenido en Aprendizaje, la tarea debería **cerrarse sola** (no depender solo de un check manual).

---

## 2. Lo que ya acordamos (sin tecnicismos)

| Tema | Qué significa |
|------|----------------|
| **¿Hay que elegir un contenido real?** | **Sí.** No es una tarea “vacía”; va atada a **un** curso/material del catálogo. |
| **¿Se marca a mano como las tareas de siempre?** | La idea es **no**: que se complete **cuando el sistema sepa** que ya vio/terminó el contenido. El detalle fino de negocio puede afinarse después. |

---

## 3. Cómo funciona HOY (para comparar)

**Crear tarea normal:** suele ser **solo poner el nombre** y ya. Después puedes cambiar el nombre en la lista o en el detalle.

**Este nuevo tipo:** **solo el nombre no alcanza.** Primero hay que decir **qué contenido** de Aprendizaje es. Si no elegimos eso, no tiene sentido la tarea.

**Editar después:** hay que decidir con calma si el título que ves es **el mismo nombre del contenido** (y no se cambia a lo loco) o si permitimos un **apodo** corto. Eso es decisión de producto, no urgente para entender el flujo.

---

## 4. Qué debería ver y hacer una persona (flujo “anciano friendly”)

Imagina a alguien que solo usa el celular para WhatsApp y el correo. En pantalla tiene que ser **obvio**:

1. **“Quiero crear una tarea de ver un contenido”**  
   → Tiene que haber un camino claro: no es lo mismo que “crear tarea normal”.  
   → Después de elegir eso, **buscar o elegir el contenido** (como elegir una película en Netflix, pero con cursos/materiales de la empresa).

2. **“¿Qué me piden hacer?”**  
   → En la lista y en el detalle tiene que verse **el contenido** (nombre, y si se puede una imagen chiquita), no solo un texto misterioso.

3. **“¿Ya lo cumplí?”**  
   → No debería ser solo un cuadrito que uno marca porque sí. Tiene que quedar claro: **“esto se completa cuando terminas el contenido en Aprendizaje”** (aunque al principio la demo lo simule con datos de prueba).

4. **“Entro al detalle”**  
   → Tiene que haber **un camino para ir a Aprendizaje** a ver ese contenido (botón o enlace bien visible). Lo demás (fechas, prioridad, etc.) puede ajustarse después.

Si una persona mira la pantalla y **no entiende qué contenido es** o **cómo se completa**, el flujo falla: hay que simplificar.

---

## 5. Tres maneras de construirlo (simple y KISS)

Aquí “solución” = **cómo lo programamos por dentro**. Para el usuario final debería verse **casi igual** en las tres; cambia **qué tan fácil es de mantener** para quien codea.

### Opción A — Todo en el mismo sitio, con interruptores

**Idea:** Es la misma lista y la misma pantalla de detalle que ya existen, pero el sistema **pregunta**: ¿es tarea normal o tarea de contenido? Y muestra **cosas distintas** (sin el mismo check de “listo” que las normales).

- **Pros:** Rápido de tener algo funcionando. Poca duplicación.
- **Contras:** Si no se ordena bien, el código se llena de “si es esto, si es lo otro” y se vuelve difícil de leer.

**KISS:** Buena si queremos **salir pronto** y el diseño en pantalla es parecido al actual.

---

### Opción B — Lista y detalle “aparte” para este tipo

**Idea:** Las tareas normales siguen como están. Las de **contenido** usan **otra fila en la lista** y, si hace falta, **otra plantilla de detalle** solo para ellas, pero con el mismo estilo visual (mismos colores y botones de la marca).

- **Pros:** Lo normal **casi no se toca**; menos miedo a romper lo que ya funciona.
- **Contras:** Hay que **copiar con cuidado** lo que se repite (por ejemplo ir al detalle) para no tener dos versiones desordenadas.

**KISS:** Buena si este tipo de tarea **se va a ver muy distinto** en la lista o en el detalle.

---

### Opción C — Un “esqueleto” común y piezas intercambiables

**Idea:** La fila de la lista y la pantalla de detalle tienen **siempre la misma estructura** (título arriba, acciones a un lado, etc.), pero el **medio** cambia según el tipo: en uno va el check, en otro va el progreso o el enlace al contenido.

- **Pros:** Si mañana inventan **otro** tipo de tarea, encaja sin rehacer todo.
- **Contras:** Hay que **pensar bien el esqueleto** antes; es un poco más de trabajo al inicio.

**KISS:** Buena si creen que vendrán **más tipos** de tareas y no quieren ir añadiendo parches cada vez.

---

## 6. Cuál encaja con “mantenerlo simple”

| Si la prioridad es… | Tiende a… |
|---------------------|-----------|
| **Salir rápido** con poco riesgo de romper lo viejo | **A** o **B** (B si quieren aislar bien lo nuevo). |
| **Pocas sorpresas** para quien solo mantiene una parte del código | **B** (lista/detalle separados para contenido). |
| **Varios tipos de tareas en el futuro** sin volver a rediseñar todo | **C** (esqueleto + piezas). |

**Recomendación KISS honesta:** Para un primer paso, **A** o **B** suele bastar. **C** vale la pena si ya saben que vendrán más variantes; si no, puede ser matar moscas a cañonazos.

---

## 7. Qué falta decidir después (sin apuro)

- Textos exactos en pantalla (“Completa cuando termines el curso en Aprendizaje”).
- Si el nombre de la tarea se **edita** o solo muestra el del contenido.
- Cómo conecta con Aprendizaje “de verdad” cuando exista integración (eso puede ser **fase 2**).

---

## 8. Nota para quien sí programa (una sola caja)

Archivos que en algún momento tocarán: lista de tareas (`tareas.js`), componente de fila (`task-strip`), detalle (`task-detail`), datos de ejemplo (`bd-tareas-y-planes.js`), y a veces detalle de plan. Los nombres exactos están en el repo; este documento no depende de ellos para entender el producto.

---

*Documento temporal. Cuando el flujo esté cerrado, se puede borrar o pasar a documentación formal.*
