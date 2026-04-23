# Plan de implementación — Certificados (LMS Creator)

## Objetivo
Llevar el flujo de certificados del Figma legado a Playground con nuevo look and feel UBITS, manteniendo la funcionalidad y navegación integral de LMS Creator.

## Alcance funcional
- Pantalla **Descarga por contenido**.
- Pantalla **Descarga por colaborador**.
- Nueva pestaña **Descarga global**.
- Flujo de solicitud: selección de filtros, validaciones, confirmación y envío por correo de archivo `.zip`.
- Estados de resultado: éxito, sin resultados y error de validación.

## Estructura de archivos
- Carpeta base: `ubits-colaborador/lms-creator/certificados/`
- Vistas y recursos:
  - `certificados.html` (entrada principal del flujo)
  - `certificados.css` (estilos específicos)
  - `certificados.js` (estado UI y lógica de tabs/formularios)
  - `PLAN.md` (este documento)

## Diseño y componentes UBITS a usar
- `header-product` para encabezado.
- `sub-nav` variante `creator-certificados` (Descarga / Configuración).
- `sidebar` variante `creator` con sección `certificados` activa.
- `tab-bar` y `floating-menu` variante `creator`.
- Inputs/selecciones oficiales UBITS para fechas, correo y filtros.
- `modal` UBITS para confirmación y para estado sin resultados.
- `alert` o `inline notifications` para feedback contextual.

## Propuesta de tabs
- **Descarga por contenido**: filtra contenidos + fechas + correo.
- **Descarga por colaborador**: filtra colaborador, contenidos vistos + fechas + correo.
- **Descarga global**: solo rango de fechas + correo (sin filtros por usuario/contenido).

## Copy base recomendado
- Mensaje transversal: "Al finalizar el proceso, recibirás en tu correo un archivo .zip con los certificados."
- Global: "Selecciona un rango de fechas y te enviaremos por correo un archivo .zip con todos los certificados generados en ese periodo."

## Estados a cubrir
- **Default vacío**: formulario listo para diligenciar.
- **Con datos válidos**: botón primario habilitado.
- **Validación**: campos obligatorios, formato de correo y rango máximo permitido.
- **Sin resultados**: modal con contexto del filtro aplicado.
- **Confirmación**: modal con resumen (cantidad estimada, fechas, correo, tiempo aprox).
- **Éxito**: notificación de solicitud creada.

## Plan de ejecución
1. Consolidar la arquitectura de tabs y formularios en `certificados.html`.
2. Implementar estilos en `certificados.css` usando solo tokens `var(--ubits-...)`.
3. Implementar lógica en `certificados.js` (estado activo de tab, validaciones, mock de resultados).
4. Integrar modales y notificaciones.
5. Verificar responsive y navegación cruzada completa con LMS Creator.
6. Ajustar copy final con negocio y QA visual contra Figma.

## Criterios de aceptación
- Navegación completa funcionando (sidebar, sub-nav, selector, tab-bar, floating menu).
- Ítem **Descarga** activo correctamente dentro de `creator-certificados`.
- Se puede llegar a esta página desde otras vistas de LMS Creator y salir a ellas.
- No se usan componentes inventados ni colores hardcodeados.
- Flujo de tabs y estados principales funcional con mocks.
