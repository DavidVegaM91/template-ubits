# Ejemplo de correo — Zona de estudio · Recordatorio de plan

Referencia visual para backend / diseño. **Un solo HTML estático** con datos de ejemplo ya puestos (no hay plantilla dinámica ni placeholders en el playground).

| Archivo | Qué es |
|---------|--------|
| `mail-recordatorio-plan-formacion.html` | **Ejemplo listo para abrir en el navegador** — recordatorio masivo desde Progreso → «Enviar recordatorio». |

---

## Cómo verlo

Abrir `mail-recordatorio-plan-formacion.html` en el navegador (servir por **http** si la imagen hero no carga con `file://`).

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
