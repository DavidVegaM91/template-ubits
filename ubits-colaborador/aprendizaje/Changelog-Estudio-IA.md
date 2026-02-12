# Lista de actionables – Modo estudio IA (Sync Design AI – 9 feb 2026)

Lista completa de cambios sugeridos en la reunión. Marca con `[x]` lo que ya esté hecho y con `[ ]` lo pendiente.

**Fuentes:** Notas de Gemini (resumen y detalles) + Transcripción completa de la reunión.

---

## 1. Interfaz visual y contenedores

|`[x]`|  **Integrar visualmente las columnas** (chat / canvas) para que se sientan "familia" poniendole fondo blanco al chat - Solicitud de Carlos.
|`[ ]`|  Diferenciar las burbujas de chat del usuario: no solo bordes y una punta, algo más elaborado - Solicitud de Carlos.
|`[x]`|  Mejorar **input del mensaje** solo en la bienvenida: cajita más trabajada visualmente, puede ser poniendo un resplandor al rededor con una leve gradiente de azules en la pestaña de bienvenida - Solicitud de Carlos.

---

## 2. Subnav item de llegada a la pagina

|`[x]`|  Mover el item de subnav para que sea el primero de la izquierda en la sección de aprendizaje, así como lo tiene Google", es decir, que apesar de que cuando el usuario entre a la seccion de aprendizaje siga viendo el Inicio (que en este caso seria el segundo item) el primer item siempre debe ser el de Modo estudio IA. - Solicitud de Esteban.

---

## 3. Pantalla de bienvenida e input

|`[x]`|  Estructura bienvenida: **input arriba**, **recomendaciones + enviar abajo** dentro del mismo cuadro blanco  - Solicitud de Carlos.

---

## 4. Historial y nuevo chat

|`[x]`|  **Mostrar los botones de "Nuevo chat" e "Historial" solo si ya existen conversaciones**; si es primera vez no mostrarlo (porque no tiene sentido) - Solicitud de Luisa
|`[x]`|  **Hacer un poco menos ancho el historial** - Solicitud de Luisa

---

## 5. Recomendación de contenido en el plan de estudio

|`[x]`|  **Priorizar** el plan de estudio sobre el Quiz y los Flashcards, asi que debe ir de primero antes del quiz - Solicitud de Esteban
|`[x]`|  Definir **formato visual** de las tareas de tipo contenido: ¿solo duración, se puede añadir otra cosa? algun dato de valor para el usuario - Solicitud de Esteban

---

## 6. Quiz – diseño e interacción

|`[x]`|  Hacer el **quiz más dinámico y atractivo** por ejemplo **Opciones (A, B, C) sin color de borde, solo color de relleno bg-2 y al hover bg-3 (conservar border radius) - Solicitud de Luisa
|`[x]`|  **Mostrar feedback de respuesta correcta e incorrecta dentro de la misma interfaz de respuestas** (no abajo), para que el usuario entienda el porqué de cada opción. Tambien quitarle el color de borde, pero conservar el border radius - Solicitud de Luisa
|`[ ]`|  **Ser más atrevidos con el diseño** del Modo estudio IA dentro del design system actual | "Podemos ser más atrevidos en el diseño"; "bajo los parámetros que puedan hacerlo" |
|`[ ]`|  Permitir **crear componentes nuevos solo para Modo estudio IA** si hace falta - Solicitud Luisa
|`[ ]`|  Valorar **"mostrar pista"** en el quiz (referencia Gemini) para que el usuario pueda pedir ayuda | Luisa (00:07): "tiene mostrar pista; que se vea así" – ref. experiencia en Gemini |

---

## 7. Quiz – resultados y rendimiento

|`[x]`|  **Visualización de resultados** Referencia de Gemini, quitar color de bordes, más limpio

---

## 9. Otros componentes e ideas de producto

|`[ ]`|  Valorar **componente de audio / podcast** (ej. podcast básico de liderazgo) para usuarios que hacen otras cosas | Propuesta de David
|`[ ]`|  **Diseño con visión a largo plazo**: pensar no solo Q1 sino todo el año para que las siguientes versiones estén alineadas | 

---

## 10. Bienvenida y hero "¿Qué quieres aprender hoy?"

|`[ ]`|  Hacer que la **gradación del "aprender hoy" se mueva**: solo el color, no la letra (animación sutil de la gradiente). |

---

## 11. Encabezado del chat

|`[ ]`|  **Añadir encabezado al chat** con el nombre del chat (el mismo que sale en el historial). |
|`[ ]`|  El nombre del chat debe ser **editable inline** en el encabezado; si se edita ahí, también debe actualizarse en el historial (sincronizado). |
|`[ ]`|  En ese encabezado del chat, **botón "Recursos generados"** que abra un canvas a la derecha (similar a los otros canvas) con el listado de recursos/cursos generados. |
|`[ ]`|  Si no hay recursos generados, el canvas debe usar el **componente oficial de empty state**. |

---

## 12. Generación de recursos por palabra clave

|`[ ]`|  Si el usuario escribe una **variación con palabra clave del recurso** (ej. "quiero hacer un quiz", "quiero un quiz", "dame un quiz", o cualquier frase que contenga "quiz"), debe **generar ese recurso directamente**, no solo cuando escriba exactamente "quiz". Aplicar la misma lógica para **todos los tipos de recurso** (plan, flashcards, quiz, etc.). |

---

## 13. Competencias UBITS: ofrecer subtemas antes de recursos

|`[ ]`|  Si el usuario escribe una **competencia de UBITS** (ej. "Liderazgo", "Inglés", "Comunicación"), en vez de sugerir recursos de una vez, **ofrecerle primero** si quiere alguna de las habilidades/subtemas de esa competencia en UBITS (consultar estructura en `ubits-colaborador/aprendizaje/catalogo.html`), con un mensaje tipo: "¿Te interesa alguno de estos temas de [competencia]: [lista] o prefieres otra cosa?" |
|`[ ]`|  **Una vez seleccione el tema** (ej. "Fundamentos de liderazgo"), o si dice algo como "no, simplemente quiero aprender sobre fundamentos de liderazgo", **ahí sí** sugerir la generación de recursos. |
|`[ ]`|  Para **competencias que no están en UBITS** (ej. Japonés): no sugerir subtemas basados en habilidades UBITS, pero sí **otras sugerencias** genéricas (ej. "Escritura y alfabeto", "Saludos", "Estructura básica de una oración", "Partículas gramaticales", u otras similares). |

---

## 14. Sets de recursos por subtema

|`[ ]`|  **Ampliar los sets**: asegurar **3 sets de cada tipo de recurso** (excepto podcast) para cada uno de los **subtemas sugeridos** para Inglés, Japonés, Liderazgo y Comunicación. Los de Inglés, Liderazgo y Comunicación se consultan en el catálogo (`catalogo.html`). |

---

## 15. Respuesta "Definición" y citas con contenido

|`[ ]`|  Si el usuario escribe la palabra clave **"definición"** (ej. "definición de liderazgo"), mostrar una **respuesta en el chat** con la definición del tema (ej. liderazgo). |
|`[ ]`|  En la respuesta de definición, **añadir tags "Contenido"** al lado de ciertas frases; al hacer **clic** en un tag, abrir un **canvas a la derecha** con la ficha del contenido, con este orden: |
|`[ ]`|  **Contenido del canvas:** imagen del curso arriba, badge de tipo de contenido, nombre del contenido, nivel / tiempo / idioma, botón primario "Ver contenido", botón secundario "Ver descripción", competencia, **3 habilidades** (solo una de la competencia principal, ej. Liderazgo, y las otras dos de Comunicación o soft skills según la frase citada), **imagen y nombre del proveedor** (según lista de aliados en componente card-content), **imagen y nombre de experto** (avatar + nombre genérico inventado). |

---