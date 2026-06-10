# Plantillas de correo — descarga de certificados (LMS Creator)

Tres variantes según el tipo de solicitud en `certificados.html`:

| Archivo | Uso |
|---------|-----|
| `mail-certificados-global.html` | Descarga global — todos los certificados del periodo |
| `mail-certificados-contenido.html` | Descarga por contenido seleccionado |
| `mail-certificados-colaborador.html` | Descarga por colaborador seleccionado |

**Referencia de estructura:** `ubits-colaborador/tareas/mails/` (tablas, estilos inline, ancho 600px).

**Ilustraciones:** extraídas del Figma Creator v3 (sección Descarga → plantillas email), en `images/`.

---

## Placeholders para el backend

| Placeholder | Descripción |
|-------------|-------------|
| `{{nombre_destinatario}}` | Nombre de quien solicitó la descarga |
| `{{cantidad_certificados}}` | Número de certificados en el .zip |
| `{{rango_fechas}}` | Periodo legible (ej. 1 de enero de 2026 – 30 de junio de 2026) |
| `{{nombre_contenido}}` | Solo mail por contenido |
| `{{nombre_colaborador}}` | Solo mail por colaborador |
| `{{url_descarga}}` | Enlace al archivo .zip (válido 2 días) |
| `{{url_plataforma}}` | URL base de la plataforma |

---

## Imágenes

| Archivo | Mail |
|---------|------|
| `images/certificados-global.png` | Global |
| `images/certificados-contenido.png` | Por contenido |
| `images/certificados-colaborador.png` | Por colaborador |

En envío real, el backend puede sustituir rutas relativas por URLs absolutas del CDN.

---

## Cómo previsualizar

1. Abrir cada `.html` en el navegador desde esta carpeta.
2. Sustituir manualmente los `{{...}}` por valores de ejemplo.
3. Para prueba en cliente de correo: Mailtrap, Putsmail o envío de prueba del backend con URLs absolutas para imágenes.
