# Lista de actionables – Modo estudio IA (Sync Design AI – 9 feb 2026)

Lista completa de cambios sugeridos en la reunión. Marca con `[x]` lo que ya esté hecho y con `[ ]` lo pendiente.

**Fuentes:** Notas de Gemini (resumen y detalles) + Transcripción completa de la reunión.

---

## 1. Interfaz visual y contenedores

|`[x]`|  **Integrar visualmente las dos columnas** (chat + plan de estudio / canvas) para que se sientan "familia" poniendole fondo blanco al chat - Solicitud de Carlos.
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
|`[x]`|  Definir **formato visual** de las tareas de tipo contenido: ¿solo duración, se puede añadir otra cosa, puede ser el nivel? (ver componenteCard content compact) para implementar esto y consultar la documentacion del componente Card content para ver las opciones de nivel que hay - Solicitud de Esteban

---

## 6. Quiz – diseño e interacción

|`[ ]`|  Hacer el **quiz más dinámico y atractivo** por ejemplo **Opciones (A, B, C) sin borde, solo color de relleno bg-2 y al hover bg-3 (referencia Gemini)
|`[ ]`|  **Mostrar respuesta correcta e incorrecta dentro de la misma interfaz de respuesta** (no abajo), para que el usuario entienda el porqué de cada opción. Luisa: "ese tipo de interacción en donde te da la respuesta correcta dentro de la respuesta y te muestra que la tuya es incorrecta, más que salir abajo, que adentro es donde se muestra" |
|`[ ]`|  **Ser más atrevidos con el diseño** del Modo estudio IA dentro del design system actual | "Podemos ser más atrevidos en el diseño"; "bajo los parámetros que puedan hacerlo" |
|`[ ]`|  Permitir **crear componentes nuevos solo para Modo estudio IA** si hace falta; luego valorar llevarlos al design system | Luisa (00:10): "si podemos crear un así to que crear un nuevo componente, solo lo vamos a usar acá" |
|`[ ]`|  Valorar **"mostrar pista"** en el quiz (referencia Gemini) para que el usuario pueda pedir ayuda | Luisa (00:07): "tiene mostrar pista; que se vea así" – ref. experiencia en Gemini |

---

## 7. Quiz – resultados y rendimiento

|`[ ]`|  **Visualización de resultados** (puntuación, rendimiento) en **cuadros con información super puntual y números** (estilo "Analyse My Performance" / Gemini) | Luisa: "cómo lo muestra en los cuadritos; lo más importante; hace que el ojo sea mucho más fácil porque no es texto, sino cosas super puntuales que la mayor parte siempre van a ser números" |
|`[ ]`|  Mostrar **puntuación y datos clave** de forma escaneable (cuadritos, números), no solo texto | Relacionado con 7.1 |

---

## 8. Tareas y subtareas (versión 2)

|`[ ]`|  Considerar **tareas como alternativa** dado que estudiantes no pueden crear planes de formación (restricción de roles) | Luisa: "la funcionalidad de tareas y subtareas sería una alternativa valiosa" |
|`[ ]`|  **V2**: agente genera **subtareas a partir del plan de contenido**; usuario con una tarea principal y subtareas (ej. "aprender japonés" + subtareas) | "Como versión dos, el agente podría generar subtareas basadas en el plan de contenido" |
|`[ ]`|  Conectar con **Planes y tareas** existente para que tengan sus "planes" ahí | "Se podría usar planes y tareas para que ellos tengan como sus planes ahí" |

---

## 9. Otros componentes e ideas de producto

|`[ ]`|  Valorar **componente de audio / podcast** (ej. podcast básico de liderazgo) para usuarios que hacen otras cosas | David: "un componente de audio o podcast sería útil; generarme un podcast de liderazgo básico" |
|`[ ]`|  Lanzar **versiones sencillas** de quiz, mapa mental, short de video y **refinar según demanda** en pruebas | `[ ]` | Esteban: "hacer unos en varias direcciones bien sencillos y cuando los usuarios estén hundiendo mucho un tab, ahí sí refinémoslo" |
|`[ ]`|  **Hipótesis a validar**: quiz puede no ser tan demandado (soft skills, respuestas matizadas); validar con pruebas | Esteban (00:12): "hay una gran posibilidad en que no termine siendo tan demandado" |
|`[ ]`|  **Diseño con visión a largo plazo**: pensar no solo Q1 sino todo el año para que las siguientes versiones estén alineadas | Luisa (00:17): "piensen siempre el diseño a todo lo que quisiéramos hacer durante todo el año para que las siguientes versiones estén tiradas a donde empezamos versus donde terminamos el año" |

---

## 10. Proceso de diseño y calidad

|`[ ]`|  **Llevar primera respuesta / home a Figma** para iteración manual y refinamiento antes de codificar | Carlos: "pasemos algo a Figma y en Figma lo iteramos y después eso volvemos y lo codeamos con ese refinamiento" |
|`[ ]`|  **No depender solo de web coding por prompts**; incluir refinamiento manual en Figma para llegar a la solución deseada | "Si le tiras y le tiras prompts con la interfaz que tienes y los estilos del design system, no creo que llegues a la solución que nos estamos imaginando" |
|`[ ]`|  **Subir el nivel de calidad** del entregable (alineado con lo que pide Luisa en diseño) | Carlos: "mejorar la interfaz", "subir un poquitico más el nivel de esa calidad del entregable" |

---

## 11. Pruebas con usuarios y priorización

|`[ ]`|  **Pruebas de usuario pequeñas antes del lanzamiento** (ej. 10 usuarios reales) para validar dirección del producto | Carlos: "por qué no hacerlo antes; testearía con 10 personas" |
|`[ ]`|  **Planificar pruebas** para tercera semana de febrero (ya en curso; incluye agente "Aprende con IA") | Esteban: "ya estamos planificando unas pruebas con usuarios para la tercera semana de febrero".
|`[ ]`|  **Rotar boceto** del agente "Aprende con IA" con Carlos y planificar pruebas (Esteban + Carlos) | Pasos siguientes del doc |
|`[ ]`|  **Agentes a priorizar para pruebas**: quiz, planes y tareas, recomendador, organizativa | Luisa: "quiz, planes y tareas, el recomendador, y organizativa" |
|`[ ]`|  **Reunión con Javi** para definir qué agentes deberían funcionar (Esteban + Luisa) | Luisa (00:17): "Esteban y yo nos llevamos con Javi entonces los agentes que deberían funcionar" |
|`[ ]`|  **Evitar "datos vanidosos"** en pruebas: diseñar pruebas para sacar información que realmente sirva | Carlos (00:15): "que no sean data… datos vanidosos que no nos sirven de nada"; Esteban: "pensemos muy bien esas pruebas para sacar la información que más nos sirve" |

---

## 12. Seguimiento y entrega

|`[ ]`|  **Pre-entrega de avances en Slack**; con base en esa revisión, agendar reunión de seguimiento | Carlos: "puede ser como una preentrega y que lo veamos en Slack" |
|`[ ]`|  **Reunión de seguimiento** (ej. jueves antes del almuerzo, media hora) | David: "el jueves antes del almuerzo" |
|`[ ]`|  **Llevar interfaz a Figma** para iterar y refinar (David + Carlos) | Pasos siguientes del doc |