# HU Modo Estudio IA

**Historia de usuario: Modo Estudio IA**

---

## Historia

**Como** colaborador que quiere aprender o reforzar competencias,  
**quiero** un tutor en modo IA que me salude por nombre, me ofrezca practicar con quiz, flashcards y guías de estudio, y que opcionalmente me sugiera cursos y planes de UBITS,  
**para** aprender a mi ritmo con materiales interactivos y, cuando el tema esté en catálogo, con contenidos de mi empresa.

---

## Valor y contexto

- El tutor usa el **mismo motor** que asistentes tipo Gemini, pero con **contexto UBITS**: nombre, cargo, área, competencias asignadas, resultados de assessment y 360.
- Combina la **base de conocimiento UBITS** (miles de cursos) con conocimiento general; si lo que quiero aprender está en catálogo, puede sugerirme contenidos y armar un plan de formación (como valor añadido).
- La **función principal** es “ser mi tutor” (quiz, flashcards, guía de estudio); sugerir cursos y planes es **secundario**.

---

## Criterios de aceptación

- [ ] Al entrar, veo un saludo con mi nombre (ej. “Hola María Alejandra, ¿qué quieres aprender hoy?”) y acceso rápido a mis competencias asignadas (ej. Liderazgo, Comunicación, Inglés; **solo 3 chips** en “Recomendado para ti”). Japonés **no** aparece como recomendación (no está en UBITS); se accede solo escribiendo en el chat algo relacionado con japonés. Las **sugerencias** (chips “Recomendado para ti” o botones de sugerencias) **desaparecen** en cuanto el chat inicia (primer mensaje o clic en un chip).
- [ ] Puedo elegir tema por chip o escribiendo en el chat; para **Liderazgo, Comunicación e Inglés** la IA me ofrece Quiz, Flashcards o **Plan de estudio**; para **Japonés** (y temas fuera de catálogo) solo Quiz y Flashcards.
- [ ] Si elijo un tema que **no** está en catálogo UBITS (ej. japonés), la IA me indica que puede ser mi tutor y me ofrece Quiz y Flashcards (no Plan de estudio, porque no hay contenidos UBITS para ese tema).
- [ ] Si elijo un tema en catálogo, además puedo pedir cursos sugeridos y/o un plan de formación.
- [ ] El **panel derecho** está **oculto** al cargar; solo se muestra cuando la IA genera un recurso (quiz, flashcards, guía, cursos sugeridos o plan).
- [ ] El **panel derecho** usa fondo **bg-1** (no bg-2) cuando está abierto.
- [ ] Puedo cerrar el panel con un botón (X) y seguir chateando a ancho completo.
- [ ] El **panel derecho** tiene siempre **tres zonas**: **encabezado** (título del recurso y botón cerrar), **cuerpo** (contenido con scroll si aplica) y **pie** (acciones). En quiz y flashcards el pie muestra Anterior y Siguiente; en Plan de estudio el pie muestra "Cancelar" y "Crear plan". Cursos sugeridos y Plan de formación pueden tener pie vacío.
- [ ] En el panel se muestran correctamente: quiz (preguntas, opciones, resultado), flashcards (voltear, navegar, barajar), guía (secciones), cursos sugeridos y plan de formación.
- [ ] En el **quiz**, al elegir una respuesta obtengo **feedback inmediato**: si acierto se muestra la opción en verde con "¡Exacto!" y la explicación; si fallo se indica la respuesta correcta y la explicación (estilo Gemini).
- [ ] Cuando la IA genera un recurso (quiz, flashcards, guía), en el chat aparece el mensaje **“He creado un [quiz/flashcards/plan de estudio] para ti: {título}”** y un botón **“Abrir”** (primario, sm). El botón **solo es visible cuando el panel derecho está cerrado**; si el panel está abierto, solo se ve el texto del mensaje. Al pulsar “Abrir” se reabre el panel con ese recurso.
- [ ] En el quiz, el botón **“Más preguntas”** (en la pantalla de resultados) genera un **nuevo quiz** sobre el mismo tema **sin cerrar el panel**. En el chat aparece un nuevo mensaje: **“He creado un nuevo quiz para ti: {título}”**. Análogamente, desde resultados se puede pasar a Flashcards o Guía y en el chat aparece “He creado flashcards/guía para ti: {título}”.
- [ ] Bajo el área de escritura del chat hay un **mensaje de aviso**: que las conversaciones no se usan para mejorar modelos, que el tutor puede cometer errores (verificar respuestas) y referencia a privacidad y UBITS.
- [ ] La experiencia es usable en móvil (panel debajo del chat o adaptado).
- [ ] Cumplimiento de identidad UBITS (tokens, tipografía, componentes; validable con `validador-ubits.html`).

---

## Referencia de diseño: comportamiento del panel (estilo Gemini)

- **Apertura:** El panel derecho **solo aparece** cuando la IA genera un recurso (quiz, flashcards, guía, cursos, plan). No es visible al entrar.
- **Cierre:** El usuario puede cerrar el panel y seguir usando solo el chat.
- **Reapertura:** Por cada recurso generado, en el chat aparece el mensaje **“He creado un [quiz/flashcards/plan de estudio] para ti: {título}”** y un botón **“Abrir”** (primario, sm). El botón **solo se muestra cuando el panel está cerrado**; si el panel está abierto, el mensaje no muestra el botón. Al pulsar “Abrir” se reabre el panel con ese recurso.
- **Más preguntas:** Desde la pantalla de resultados del quiz, “Más preguntas” genera un nuevo quiz sin cerrar el panel; en el chat se inserta “He creado un nuevo quiz para ti: {título}”. Mismo patrón para cambio a Flashcards o Plan de estudio desde resultados.
- Referencia visual: patrón tipo “Examen de Hiragana Básico” en Gemini (mensaje en el chat con botón “Abrir” visible solo con panel cerrado).

---

## Escenarios y datos de ejemplo

- **Usuario de prueba:** María Alejandra.
- **Competencias de acceso rápido (Recomendado para ti):** Liderazgo, Comunicación, Inglés (3 chips). Japonés no se recomienda; se accede escribiendo “japonés” o “japon” en el chat.
- **Tema fuera de catálogo (caso especial):** japonés → tutor sin contenidos UBITS; solo Quiz y Flashcards (no Plan de estudio). El **quiz de Japonés** incluye 5 preguntas de ejemplo (saludos Konnichiwa/Ohayou/Oyasumi nasai, posición del verbo, significado de Arigatou, número “ichi”, etc.).

---

## Casos de prueba (paso a paso)

Usar estas tablas para validar cada flujo al iterar.

### Caso 1: Entrada → elegir competencia por chip → ver recurso en panel

| Paso | Acción | Resultado esperado |
|------|--------|--------------------|
| 1 | Abrir Modo Tutor IA | Saludo con nombre y 3 chips (Liderazgo, Comunicación, Inglés) en “Recomendado para ti”. **Panel derecho no visible.** Sugerencias visibles. Japonés no aparece; se accede escribiendo en el chat. |
| 2 | Clic en **Liderazgo** | Sugerencias **desaparecen**. Mensaje de usuario “Liderazgo”. IA ofrece Quiz, Flashcards o Guía de estudio. |
| 3 | Escribir **quiz** y enviar | Panel **se abre** con quiz de Liderazgo. En el chat: “He creado un quiz para ti: Quiz de Liderazgo.” (botón Abrir no visible mientras el panel está abierto). |
| 4 | Cerrar el panel (X) | Panel se cierra; en el mensaje del chat **aparece el botón Abrir**. |
| 5 | Pulsar **Abrir** en el mensaje del chat | Panel se reabre con el mismo quiz. |

### Caso 2: Escribir tema en catálogo (Comunicación o Inglés)

| Paso | Acción | Resultado esperado |
|------|--------|--------------------|
| 1 | Escribir **comunicación** o **inglés** y enviar | IA ofrece Quiz / Flashcards / Guía y menciona contenidos UBITS. |
| 2 | Escribir **flashcards** y enviar | Panel se abre con flashcards del tema. |
| 3 | Cerrar panel | Panel se oculta. |

### Caso 3: Tema fuera de catálogo (japonés)

| Paso | Acción | Resultado esperado |
|------|--------|--------------------|
| 1 | Escribir **japonés** o **quiero aprender japonés** y enviar (no hay chip Japonés) | IA ofrece solo Quiz y Flashcards (no Plan de estudio). |
| 2 | Elegir **quiz** | Panel se abre con quiz de Japonés (5 preguntas: saludos, verbo al final, Arigatou, ichi=1, Oyasumi nasai). Mensaje en chat: “He creado un quiz para ti: Quiz de Japonés.” |
| 3 | Escribir **flashcards** y enviar | Panel se abre con flashcards de japonés básico. |

### Caso 4: Cursos sugeridos

| Paso | Acción | Resultado esperado |
|------|--------|--------------------|
| 1 | Pedir sugerencias de contenidos y tema **liderazgo** | IA sugiere cursos. Mensaje tipo “Te sugerí X cursos. Míralos en el panel de la derecha.” y **panel se abre** con las cards de cursos. |
| 2 | Escribir **agrega más** u **otros 3** | Panel se actualiza con más cursos. |

### Caso 5: Plan de formación

| Paso | Acción | Resultado esperado |
|------|--------|--------------------|
| 1 | Pedir crear plan de formación y tema **liderazgo** | IA arma plan. Mensaje corto en chat y **panel se abre** con el plan (título, fechas, cursos). |
| 2 | Escribir **modificar** | Plan se regenera y panel se actualiza. |
| 3 | Escribir **acepto** | IA confirma creación del plan. |

### Caso 6: Mensaje genérico (recordar competencias)

| Paso | Acción | Resultado esperado |
|------|--------|--------------------|
| 1 | Escribir **ayuda** o **no sé qué aprender** | IA recuerda competencias asignadas y sugiere elegir una o escribir otro tema. |

### Caso 7: Cerrar panel y reabrir con “Abrir”

| Paso | Acción | Resultado esperado |
|------|--------|--------------------|
| 1 | Tener un recurso abierto (ej. quiz). Cerrar panel. | Panel cerrado. |
| 2 | En el chat, localizar el mensaje “He creado un quiz para ti: …” con botón **Abrir**. | Botón Abrir visible (solo cuando el panel está cerrado). |
| 3 | Clic en **Abrir** | Panel se reabre con el mismo recurso. |

### Caso 8: Más preguntas (quiz)

| Paso | Acción | Resultado esperado |
|------|--------|--------------------|
| 1 | Completar un quiz y llegar a la pantalla de resultados. | Se muestra resultado y botón “Más preguntas”. |
| 2 | Clic en **Más preguntas** | Panel **permanece abierto** con un nuevo quiz del mismo tema. En el chat aparece un nuevo mensaje: “He creado un nuevo quiz para ti: {título}”. |

---

### Caso 9: Maratón de hiragana

| Paso | Acción | Resultado esperado |
|------|--------|--------------------|
| 1 | Escribir **maratón de hiragana**, **50 preguntas de hiragana** o similar y enviar | La IA abre **directamente** el panel con el quiz "Maratón Hiragana" (50 preguntas: vocales, series ka-wa, ん, が, ぱ, きゃ, tsu pequeño). |
| 2 | En el chat | Mensaje "He creado un quiz para ti: Quiz de Maratón Hiragana." y botón Abrir (visible si se cierra el panel). |

---

## Recursos del panel (contenido simulado)

- **Quiz:** Preguntas de opción múltiple; **feedback inmediato** al elegir (correcto: verde + "¡Exacto!" + explicación; incorrecto: se muestra la respuesta correcta y explicación); navegación libre (Atrás/Siguiente sin obligar a contestar), botón de avanzar siempre primario; barra de progreso: 1–19 preguntas = barras a ancho completo, 20+ = slider con puntito; resultado al final; **“Más preguntas”** en resultados genera nuevo quiz sin cerrar el panel y añade mensaje “He creado un nuevo quiz para ti: {título}” en el chat.
- **Flashcards:** Tarjetas frente/dorso; Voltear, Anterior, Siguiente, Barajar.
- **Plan de estudio:** Solo para Liderazgo, Comunicación e Inglés (y Japonés con tareas del chat). Panel editable: título (input UBITS), prioridad (menú desplegable con **iconos dentro de cada opción**: Alta, Media, Baja, mismos iconos/colores que en seguimiento), **solo fecha fin** (date picker UBITS; la fecha de inicio la fija el backend como hoy). Tareas como cards (curso o actividad) con editar nombre, eliminar, Cambiar/Rehacer. Pie del panel: "Cancelar" y "Crear plan". Se relaciona con el módulo de planes y tareas (seguimiento).
- **Cursos sugeridos:** Cards compactas de cursos (catálogo UBITS).
- **Plan de formación:** Título, fechas, lista de cursos del plan.

Temas de ejemplo en datos: liderazgo, comunicacion, ingles, japones, hiragana. Quiz de **japonés**: 5 preguntas. Quiz **Maratón Hiragana** (tema `hiragana`): 50 preguntas; se activa al escribir frases como "maratón de hiragana" o "50 preguntas de hiragana".

---

## Próximas iteraciones (backlog)

1. ~~**Mensaje + botón “Abrir” en el chat:**~~ Implementado: mensaje “He creado un [recurso] para ti: {título}” y botón “Abrir” visible solo cuando el panel está cerrado.
2. **Opcional:** Enlace tipo “Reintentar sin [recurso interactivo]” para obtener el contenido en otro formato (solo texto en el chat).

---

## Alcance técnico (referencia)

- Página: `ubits-colaborador/aprendizaje/modo-estudio-ia.html` (Modo Tutor IA).
- Estilos: `modo-estudio-ia.css` (layout chat + panel).
- Lógica y datos: `components/study-chat.js` y `study-chat.css` (empty state, flujos, panel quiz/flashcards/plan de estudio/cursos/plan).
- Identidad: tokens y componentes UBITS; validación con `documentacion/validador-ubits.html`.

---

## Registro de cambios

*Actualizar esta sección en cada iteración.*

| Fecha | Cambio |
|-------|--------|
| 2026-02-05 | Redacción inicial como HU. Panel derecho oculto por defecto; solo visible al generar recurso. Empty state con nombre y 3 competencias; flujos simulados para quiz, flashcards, guía, cursos y plan. Casos de prueba documentados. Card “Abrir” pendiente. |
| 2026-02-05 | Ajuste CSS: panel oculto al recargar (selector `.modo-tutor-ia-chat-section > .modo-tutor-ia-canvas-panel` con `display: none !important` para ganar sobre `.section-single > div`). Botón cerrar (X) en header de todos los recursos del panel (quiz, flashcards, guía, cursos, plan). Renombrado documento a HU Modo Estudio IA. |
| 2026-02-05 | Panel derecho: fondo bg-1 (antes bg-2). Quiz: feedback inmediato al elegir respuesta (correcto = verde + "¡Exacto!" + explicación; incorrecto = se muestra respuesta correcta y explicación, estilo Gemini). Disclaimer bajo el chat: "Tus conversaciones no se usan para mejorar nuestros modelos. El tutor puede cometer errores; verifica sus respuestas. Tu privacidad y UBITS." HU actualizada con criterios y recursos del panel. |
| 2026-02-05 | Sugerencias (chips/botones) se ocultan cuando el chat inicia (primer mensaje o clic en chip). Mensaje de recurso: "He creado un quiz/flashcards/plan de estudio para ti: {título}" con botón "Abrir" (visible solo si el panel está cerrado). "Más preguntas" en quiz: nuevo quiz sin cerrar panel + mensaje "He creado un nuevo quiz para ti: {título}" en el chat. Quiz de Japonés: 5 preguntas (Konnichiwa, verbo al final, Arigatou, ichi=1, Oyasumi nasai). Cuarta competencia: Japonés. HU actualizada (criterios, casos 1–3 y 7–8, referencia de diseño, backlog). |
| 2026-02-05 | **Maratón Hiragana:** si el usuario escribe "maratón de hiragana", "50 preguntas de hiragana" o similar, se abre directamente el quiz de 50 preguntas (vocales, series ka–wa, ん, が, ぱ, きゃ, tsu pequeño). Tema `hiragana` en datos; Caso 9 y recursos del panel actualizados en la HU. |
| 2026-02-05 | **Quiz:** navegación libre (se puede cambiar de pregunta sin contestar); botón Siguiente/Hecho siempre primario. **Progreso:** con 1–19 preguntas las barras ocupan todo el ancho; con 20+ preguntas se muestra un slider (barra única con puntito de avance). HU actualizada en Recursos del panel. |
| 2026-02-05 | **Plan de estudio (sustituye Guía de estudio):** Solo para Liderazgo, Comunicación e Inglés. Al elegir "Plan de estudio" se abre en el panel una propuesta con nombre, fechas inicio/fin, prioridad Media y lista de tareas (ver contenido UBITS). Relación con módulo planes y tareas. Para Japonés/hiragana no se muestra la opción; si el usuario pide "plan de estudio" se indica que solo está para las 3 competencias en catálogo. HU actualizada; backlog: qué hacer con Japonés (contenidos no UBITS). |
| 2026-02-05 | **Recomendado para ti:** solo 3 chips (Liderazgo, Comunicación, Inglés). Japonés no aparece porque no está en UBITS; se accede únicamente escribiendo en el chat algo como "japonés" o "japon". HU actualizada. |
| 2026-02-05 | **Panel derecho:** estructura fija encabezado + cuerpo + pie. Quiz y flashcards: pie con Anterior y Siguiente. Plan de estudio: pie con Cancelar y Crear plan. **Plan de estudio editable:** título y fecha fin con inputs UBITS; prioridad con menú desplegable (iconos en cada opción: Alta/Media/Baja); sin fecha de inicio (backend = hoy); cards de tareas (curso/actividad) con editar, eliminar, Cambiar/Rehacer. HU actualizada. |
