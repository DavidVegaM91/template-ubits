# Ejemplos de correo — Zona de estudio

Referencia visual para backend / diseño. **HTML estático** con datos de ejemplo ya puestos.

| Archivo | Qué es |
|---------|--------|
| `mail-recordatorio-plan-formacion.html` | Recordatorio masivo desde Progreso → «Enviar recordatorio» (envía el líder). |
| `mail-progreso-estudio-mensual.html` | Reporte mensual automático del sistema — tiempo de estudio + progreso por plan. |

---

## Cómo verlo

Abrir el `.html` en el navegador (servir por **http** si las imágenes no cargan con `file://`).

---

## Contenido del ejemplo

- **Destinatario:** Ana Lucía Torres  
- **Líder:** María Alejandra Sánchez Pardo  
- **Planes:** Onboarding logística 2026 (45 % · contenidos · 30/06/2026) y Seguridad en bodega (72 % · competencias · 15/08/2026)  
- **Saludo:** ¡Hola, Ana Lucía Torres! (negrilla `#303a47`)  
- **CTA:** Continuar mi formación  

---

## Comportamiento en producto (referencia)

Desde **Zona de estudio → Progreso → Enviar recordatorio**, el líder confirma en modal y el sistema envía **un correo por cada subordinado directo** con al menos un plan Vigente incompleto. Cada mail puede listar **varios planes** (repetir el bloque gris por plan).

En el playground solo se simula el toast «Recordatorios enviados»; el HTML de esta carpeta es la **referencia visual** del mail.

---

## Bloque por plan (HTML inline)

Fondo `#f3f3f4`, `border-radius: 10px`, padding 18px 20px:

1. Fila: título del plan (izq) + **%** grande en brand (der)  
2. Fila: tipo de plan (izq) + «Vence el …» (der)  

- **16px** de separación entre bloques

---

## Imagen hero

`imagen-mail-recordatorio-lider-zona-de-estudio.png` — banner «Recordatorio de tu plan de formación» (Zona de estudio · vista líder). En envío real, el backend sustituye por URL absoluta del CDN.

---

## Relacionado

Recordatorio por **un solo plan** en Mi equipo / LMS (`detalle-plan.html`) — otro flujo y otro mail.

---

## Mail mensual — `mail-progreso-estudio-mensual.html`

Correo **automático del sistema** (no lo envía el líder). Resumen del mes:

- **Destinatario de ejemplo:** Yully  
- **Mes:** junio  
- **Indicador:** Tiempo de estudio → `1 hora y 17 minutos`  
- **CTA:** Ir a mi zona de estudio  

### Imagen hero

`tu-ptogreso-de-estudio-este-mes.png` — banner «Tu progreso de estudio este mes». En envío real, el backend sustituye por URL absoluta del CDN.

### Encabezado (logo)

Igual que `lms-creator/certificados/mails/`: logo UBITS centrado (`images/ubits-logo.png`, 90×30) + línea `#e7e8ea` + hero debajo.

### Bloque por plan (card rediseñado)

Mismo contenedor que el recordatorio: fondo `#f3f3f4`, `border-radius: 10px`, padding 18px 20px. **Una sola fila** con dos columnas:

| Izquierda (apilado) | Derecha (`valign: middle`) |
|---------------------|----------------------------|
| Nombre del plan (15px, semibold) | Progreso del mes |
| Tipo: «Plan de competencias» o «Plan de contenidos» (13px, gris) | |

**Progreso según tipo:**

- **Competencias:** tiempo acumulado vs meta — ej. `30 minutos de 1 día y 4 horas`. Sin avance → color `#cf0e34`; con avance → `#5c646f`.
- **Contenidos:** conteo — ej. `2 de 5 contenidos` (gris `#5c646f`).

- **16px** de separación entre cards
