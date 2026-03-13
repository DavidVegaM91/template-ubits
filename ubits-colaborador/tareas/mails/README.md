# Plantillas de correo: recordatorios de tareas

Tres variantes de correo para el módulo de tareas/subtareas:

| Archivo | Uso |
|--------|-----|
| `mail-recordatorio-pre-vencimiento.html` | Envío manual ("Enviar notificación") o recordatorio programado antes del vencimiento. |
| `mail-recordatorio-dia-vencimiento.html` | Envío automático el día que vence la tarea. "Tu tarea vence hoy". |
| `mail-recordatorio-vencida.html` | Envío **automático** después del vencimiento o **manual** ("Enviar notificación" sobre tarea vencida). "Tu tarea se venció". |

---

## Placeholders para el backend

El backend debe reemplazar estos placeholders antes de enviar. Usar el mismo nombre en las tres plantillas donde aplique.

| Placeholder | Descripción | Ejemplo |
|-------------|-------------|--------|
| `{{nombre_destinatario}}` | Nombre de quien recibe el correo | María Alejandra |
| `{{nombre_remitente}}` | Quien envía: en **pre-vencimiento** y en **vencida** (manual = nombre de la persona; automático = "UBITS") | Carlos Ruiz / UBITS |
| `{{nombre_tarea}}` | Título de la tarea o subtarea | Revisar contratos vigentes |
| `{{fecha_vencimiento}}` | Fecha límite formateada | 15 mar 2026 |
| `{{url_ver_tarea}}` | URL absoluta al detalle de la tarea en la app | https://app.ubits.com/tarea?id=123 |
| `{{url_plataforma}}` | URL base de la plataforma | https://app.ubits.com |
| `{{es_subtarea}}` | Opcional: "true" si es subtarea (para variar copy si se desea) | true |

---

## Prompts para imágenes (Gemini)

Prompts opcionales en Gemini (o similar) por si quieren regenerar o variar las ilustraciones. Las plantillas usan **una sola imagen por correo** (ilustración que incluye el logo UBITS).

### 1. Ilustración “Recordatorio – pendiente” (opcional)

Para pre-vencimiento, si más adelante quieren una imagen debajo del headline:

**Prompt para Gemini:**
```
Ilustración flat para email de recordatorio de tarea pendiente. Escena amigable: persona frente a laptop o checklist con un ícono de calendario o reloj suave. Colores: azul (#0c5bef), grises (#303a47, #5c646f) y blanco. Sin texto dentro de la imagen. Estilo minimalista, apto para correo electrónico. Proporción horizontal 16:9 o 2:1, ancho recomendado 600px.
```

---

### 2. Ilustración “Vence hoy” (opcional)

**Prompt para Gemini:**
```
Ilustración flat para email “tu tarea vence hoy”. Calendario o reloj destacado de forma amigable, sin sensación de alarma. Colores: azul (#0c5bef), amarillo suave (#fff8e6) y grises. Sin texto en la imagen. Estilo minimalista para correo. Proporción horizontal, ancho ~600px.
```

---

### 3. Ilustración “Tarea vencida” (opcional)

**Prompt para Gemini:**
```
Ilustración flat para email “tu tarea se venció”. Persona revisando una lista o calendario, tono de “pendiente por revisar” pero no dramático. Acento en rojo suave (#cf0e34 o #fff0ee) y azul (#0c5bef). Sin texto en la imagen. Minimalista, para correo. Proporción horizontal, ancho ~600px.
```

---

## Imágenes por plantilla

Cada correo lleva una sola imagen: la **ilustración** (que incluye el logo UBITS), desde `mails/images/`:
- Pre-vencimiento: `images/recordatorio-tarea-pendiente.png`
- Día vencimiento: `images/tu-tarea-vence-hoy.png`
- Vencida: `images/tu-tarea-vencio.png`

En envío real, el backend puede reemplazar estas rutas por URLs absolutas si los correos se sirven desde otro dominio.

## Cómo previsualizar los mails

1. Abrir cada `.html` en el navegador (doble clic o desde el proyecto).
2. Las ilustraciones deberían verse (rutas relativas a la carpeta del proyecto).
3. Reemplazar manualmente los `{{...}}` por valores de ejemplo para ver el texto.
4. Para probar en cliente de correo: usar un servicio tipo Mailtrap, Putsmail o el envío de prueba del backend sustituyendo los placeholders y usando URLs absolutas para las imágenes.

## Notas técnicas

- Estilos **inline** y **tablas** para mejor compatibilidad en clientes de correo (Gmail, Outlook, Apple Mail).
- Ancho máximo del contenido: **600px** (desktop).
- **Responsive:** por debajo de 620px (móvil) se aplican media queries: contenedor al 100%, menos padding (16px), título 18px, cuerpo 15px, botón CTA a ancho completo. Compatible con Gmail y Apple Mail en móvil; Outlook desktop puede ignorar las media queries y mostrar la versión fija.
- Colores UBITS usados: `#0c5bef` (botón/acento), `#303a47` (texto principal), `#5c646f` (texto secundario), `#cf0e34` (vencida, borde/caja).
