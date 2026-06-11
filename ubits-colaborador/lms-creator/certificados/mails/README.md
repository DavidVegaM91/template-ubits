# Plantillas de correo — descarga de certificados (LMS Creator)

Tres variantes según el tipo de solicitud en `certificados.html`. **Copy y estructura alineados a Figma Creator v3** (plantillas email de la sección Descarga).

| Archivo | Figma (node) | Uso |
|---------|--------------|-----|
| `mail-certificados-global.html` | [40008333:35148](https://www.figma.com/design/NxOcUG8QAVc44KYTQexH0b?node-id=40008333-35148) | Descarga global |
| `mail-certificados-contenido.html` | [40008334:39359](https://www.figma.com/design/NxOcUG8QAVc44KYTQexH0b?node-id=40008334-39359) | Descarga por contenido |
| `mail-certificados-colaborador.html` | [40008335:3220](https://www.figma.com/design/NxOcUG8QAVc44KYTQexH0b?node-id=40008335-3220) | Descarga por colaborador |

**Estructura del mail (las 3 variantes):**

1. Borde superior brand `#0c5bef` (4px) + card 600px (estilo `tareas/mails/`)
2. Logo UBITS (`ubits-logo.png`) centrado
3. Ilustración hero (zorro + «¡Tus certificados están listos!»)
4. Cuerpo: **copy Figma** + CTA **Descargar certificados** (`#0c5bef`)
5. Nota 📌 Importante (enlace válido **2 días**) + «Gracias por usar UBITS.»
6. Footer texto: «Este correo fue enviado por UBITS LMS Creator.» + **Ir a la plataforma**

> **Copy** = Figma. **Estilos** = patrón playground (`#0c5bef`, `#5c646f`, paddings de `tareas/mails/`). Sin saludo «Hola {nombre}» ni bloque resumen.

---

## Placeholders para el backend

| Placeholder | Global | Contenido | Colaborador | Descripción |
|-------------|:------:|:---------:|:-----------:|-------------|
| `{{fecha_inicio}}` | ✅ | ✅ | ✅ | Fecha inicial legible (ej. 1 de enero de 2026) |
| `{{fecha_final}}` | ✅ | ✅ | ✅ | Fecha final legible |
| `{{nombre_contenido}}` | — | ✅ | — | Título del contenido filtrado |
| `{{nombre_colaborador}}` | — | — | ✅ | Nombre del colaborador filtrado |
| `{{url_descarga}}` | ✅ | ✅ | ✅ | Enlace al .zip (válido 2 días) |
| `{{url_plataforma}}` | ✅ | ✅ | ✅ | URL base UBITS (footer «Ir a la plataforma») |

---

## Imágenes (`images/`)

| Archivo | Uso |
|---------|-----|
| `ubits-logo.png` | Header (90×30) |
| `certificados-global.png` | Hero global (600×273) |
| `certificados-contenido.png` | Hero por contenido |
| `certificados-colaborador.png` | Hero por colaborador |
| `social-footer.png` | *(opcional / no usado)* — Figma tiene redes; playground usa footer texto |

Extraídas del Figma Creator v3 (hero + logo). En envío real, el backend sustituye rutas relativas por URLs absolutas del CDN.

---

## Cómo previsualizar

### Automático (playground)

Tras confirmar una solicitud en `certificados.html` (**Entendido** en el modal), a los **3 segundos** se abre la plantilla real del modo activo (`mail-certificados-global.html`, `mail-certificados-contenido.html` o `mail-certificados-colaborador.html`) con placeholders rellenados desde el formulario.

Requiere servir la carpeta por **http** (Live Server, `npx serve`, etc.); con `file://` el `fetch` del template puede fallar y solo abrirá el HTML sin datos.

### Manual

1. Abrir cada `.html` en el navegador desde esta carpeta.
2. Sustituir manualmente los `{{...}}` por valores de ejemplo.
3. Para prueba en cliente de correo: Mailtrap, Putsmail o envío de prueba del backend.
