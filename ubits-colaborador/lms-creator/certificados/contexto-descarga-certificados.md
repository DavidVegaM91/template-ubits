# Contexto — Descarga de certificados (LMS Creator)

Documento de referencia para **QA, backend y migración a React**. Describe el flujo implementado en vanilla y cómo portarlo al playground React sin perder fidelidad con Figma Creator v3.

**Figma pantalla:** [Creator v3 — Descarga](https://www.figma.com/design/NxOcUG8QAVc44KYTQexH0b/%F0%9F%9F%A2-Creator-v3?node-id=40008313-8362&m=dev)

---

## Objetivo

Flujo de **Descarga de certificados** con 3 modos (global / contenido / colaborador), validación, modales, anti-duplicado 48 h y plantillas de correo. Deep links por hash para demos (patrón `crear-contenido.html`).

---

## Estructura de archivos (vanilla — source of truth)

```
ubits-colaborador/lms-creator/certificados/
├── certificados.html
├── certificados.css
├── certificados.js
├── contexto-descarga-certificados.md   ← este documento
└── mails/
    ├── README.md
    ├── mail-certificados-global.html
    ├── mail-certificados-contenido.html
    ├── mail-certificados-colaborador.html
    └── images/
        ├── ubits-logo.png
        ├── certificados-global.png
        ├── certificados-contenido.png
        └── certificados-colaborador.png
```

> `social-footer.png` existe en repo pero no se usa; footer = texto + `{{url_plataforma}}`.

---

## Shell de página (sin `header-product`)

- `loadSidebar('creator', 'certificados')`
- `loadSubNav(..., 'creator-certificados')` → **Descarga** (activa) / **Configuración**
- `loadTabBar` + `loadFloatingMenu` variante `creator`
- `content-sections` → `section-single` > `widget--transparent` + selection cards + `.certificados-form-card`

**React equivalente:** `ColaboradorLayout` o `ProductLayout` con sidebar `variant="creator"`, SubNav manual con pestañas Descarga/Configuración, `SectionSingle` + `Widget transparent`.

---

## Selector de modo — `selection-card`

| Modo | Icono | Título | Descripción |
|------|-------|--------|-------------|
| **Global** | `far fa-rectangle-history` | Descarga global | Todos los certificados emitidos dentro del rango de fechas seleccionado. |
| **Por contenido** | `far fa-book-open` | Descarga por contenido | Todos los certificados emitidos para el contenido seleccionado dentro de un rango de fechas. |
| **Por colaborador** | `far fa-user` | Descarga por colaborador | Todos los certificados emitidos para el colaborador seleccionado dentro de un rango de fechas. |

**React:** `UbitsSelectionCard` + radio group `ubits-selection-card-group--3`. No cards custom.

---

## Formularios por modo

**Comunes:** fecha inicial, fecha final, correo, confirmar correo, toggle inactivos, CTA **Solicitar certificados** (disabled hasta válido).

| Modo | Campo extra |
|------|-------------|
| Global | — |
| Contenido | Autocomplete contenido (~105 ítems UBITS + Fiqsha) |
| Colaborador | Autocomplete colaborador (55 de `bd-master-colaboradores`) + select **Tipo de contenidos** (`ubits` / `propios` / `ambos`) |

**Mock data React:** `BDS_CONTENIDOS_UBITS`, `BDS_CONTENIDOS_FIQSHA`, `BD_MASTER_COLABORADORES` desde `@/lib/mockData`.

**React:** `UbitsInput` (date, email, autocomplete, select). Toggle → `UbitsSwitch`. Botón → `UbitsButton variant="primary"`.

---

## Modales y estados

| Estado | UI | Componente |
|--------|-----|------------|
| Confirmación | Modal «Revisa y confirma tu solicitud» | `UbitsModal` + `UbitsAlert` (`textBlock` + `emphasis`) |
| Sin resultados | Modal «No se encontraron certificados» | `UbitsModal` |
| Validación | Errores en campos | `UbitsInput` `invalid` + helper |
| Solicitud duplicada | Alert `warning` inline (no modal) | `UbitsAlert` en mount de página |
| Éxito | Toast tras «Entendido» | `showToast` / equivalente React |

### Anti-duplicado (48 h)

- **Playground vanilla:** memoria en variable JS (`lastSubmittedRequest`); recargar página resetea.
- **Producción:** backend persiste huella 48 h (modo, fechas, correo, filtros, toggle inactivos).
- Copy alert: «Esta solicitud ya está en proceso… inténtalo de nuevo en **48 horas**.» Cambiar cualquier campo del formulario limpia el alert.

**React:** replicar lógica de `buildRequestFingerprint()`, `isDuplicateRequest()`, `registerSubmittedRequest()`; en producción delegar al API.

---

## Deep links por hash

Implementados en `certificados.js` (`HASH_SPECS`, `applyUiState`, `hashchange`).

| Hash | Qué muestra |
|------|-------------|
| `#global` | Modo global — formulario vacío (default) |
| `#global-filled` | Formulario con datos demo |
| `#global-confirmacion` | Modal confirmación |
| `#global-sin-resultados` | Modal sin resultados |
| `#global-validacion` | Errores de validación |
| `#global-error` | Error fuera del happy path |
| `#global-solicitud-duplicada` | Alert solicitud duplicada |
| `#contenido` … `#contenido-solicitud-duplicada` | Misma tabla para modo contenido |
| `#colaborador` … `#colaborador-solicitud-duplicada` | Misma tabla para modo colaborador |

**React:** replicar con `useEffect` + `router` hash o query; útil para Storybook/demos en `/ubits-colaborador/lms-creator/certificados`.

---

## Correos (`mails/`) — copy Figma

Las 3 plantillas siguen **texto exacto** de Figma Creator v3. Ver `mails/README.md` para placeholders e imágenes.

| Archivo | Figma node |
|---------|------------|
| `mail-certificados-global.html` | [40008333:35148](https://www.figma.com/design/NxOcUG8QAVc44KYTQexH0b?node-id=40008333-35148) |
| `mail-certificados-contenido.html` | [40008334:39359](https://www.figma.com/design/NxOcUG8QAVc44KYTQexH0b?node-id=40008334-39359) |
| `mail-certificados-colaborador.html` | [40008335:3220](https://www.figma.com/design/NxOcUG8QAVc44KYTQexH0b?node-id=40008335-3220) |

### Estructura visual (las 3)

1. Borde superior `#0c5bef` 4px (estilo playground, no `#00256e` de Figma)
2. Logo UBITS (`ubits-logo.png`)
3. Hero «¡Tus certificados están listos!»
4. Cuerpo — **copy Figma** (fechas/nombres en negrita)
5. CTA ancho completo `#0c5bef` — **Descargar certificados**
6. 📌 Importante + «Gracias por usar UBITS.»
7. Footer texto + **Ir a la plataforma** (patrón `tareas/mails/`)

### Copy global (referencia)

```
Tu solicitud fue procesada con éxito.

Hemos generado un archivo con todos los certificados emitidos entre el [fecha_inicio] y el [fecha_final].

Puedes descargarlos en el siguiente enlace:

[Descargar certificados]

📌 Importante: Este enlace estará disponible por 2 días. Después de ese tiempo, será necesario volver a generar la solicitud desde la plataforma.

Gracias por usar UBITS.
```

**Contenido:** sustituir párrafo 2 por «…para el contenido **[nombre_contenido]** entre el…»  
**Colaborador:** «…para el colaborador **[nombre_colaborador]** entre el…»

### Placeholders backend

| Placeholder | Global | Contenido | Colaborador |
|-------------|:------:|:---------:|:-----------:|
| `{{fecha_inicio}}` | ✅ | ✅ | ✅ |
| `{{fecha_final}}` | ✅ | ✅ | ✅ |
| `{{nombre_contenido}}` | — | ✅ | — |
| `{{nombre_colaborador}}` | — | — | ✅ |
| `{{url_descarga}}` | ✅ | ✅ | ✅ |
| `{{url_plataforma}}` | ✅ | ✅ | ✅ |

> **No usar** en el cuerpo: `{{nombre_destinatario}}`, `{{cantidad_certificados}}`, `{{rango_fechas}}`, bloque resumen. Footer con `{{url_plataforma}}` sí (preferencia playground vs. redes Figma).

**React / backend:** las plantillas viven en el servicio de correo; el playground puede enlazar a los HTML vanilla como referencia o copiarlos a `public/emails/` si hace falta preview local.

---

## Copy base (pantalla, no mail)

- Transversal formulario: «Al finalizar el proceso, recibirás en tu correo un archivo .zip con los certificados.»
- Modal confirmación: enlace válido **2 días**; tiempo de entrega ~[XX] min.
- Sin resultados global: «Nadie ha finalizado contenidos en ese periodo.»

---

## Guía de migración vanilla → React

Usar junto con la skill **`ubits-component-migration`**. Orden recomendado:

### 1. Auditar vanilla (leer antes de codificar)

| Vanilla | React destino |
|---------|---------------|
| `certificados.html` | `pages/ubits-colaborador/lms-creator/certificados.tsx` |
| `certificados.css` | `certificados-page.module.css` (o CSS de página junto al `.tsx`) |
| `certificados.js` | Lógica en page + hooks (`useCertificadosForm`, `useCertificadosHash`) |
| `contexto-descarga-certificados.md` | Este doc (no portar; referencia) |
| `mails/*.html` | Referencia backend; opcional preview en `public/` |

### 2. Layout y navegación

- Layout **tipo 1** LMS Creator: sidebar creator + SubNav Descarga/Configuración.
- **Sin** `HeaderProduct`.
- Ruta sugerida: `/ubits-colaborador/lms-creator/certificados`

### 3. Componentes obligatorios (no HTML crudo)

| Pieza vanilla | Componente React |
|---------------|------------------|
| `ubits-selection-card` | `UbitsSelectionCard` |
| `createInput` fechas/email | `UbitsInput` |
| `createInput` autocomplete | `UbitsInput` con autocomplete |
| `createInput` select tipo contenidos | `UbitsInput type="select"` (`text` en options, no `label`) |
| Toggle inactivos | `UbitsSwitch` |
| Modal confirmación / sin resultados | `UbitsModal` |
| Alert duplicado / bloques modal | `UbitsAlert` (`textBlock`, `emphasis`) |
| CTA | `UbitsButton` |
| Toast | patrón toast del playground |

### 4. Lógica de negocio a portar

De `certificados.js`:

- `HASH_SPECS` + sincronización URL ↔ estado UI
- `validateForm()` — emails coinciden, fechas válidas, campos requeridos por modo
- `mockHasResults()` — demo sin resultados vía hash o criterios mock
- `buildRequestFingerprint` / anti-duplicado 48 h (memoria sesión en playground; API en prod)
- Autocomplete: contenidos UBITS + Fiqsha; colaboradores `BD_MASTER_COLABORADORES`
- Demo filled: E006 `masanchez@fiqsha.demo` prellenado en modo colaborador

### 5. Tokens

- Vanilla página: `--ubits-*`
- React: `--color-*` (mapeo 1:1)
- Mails: hex inline `#0c5bef`, `#5c646f` (patrón `tareas/mails/`); copy según Figma

### 6. Verificación

- [ ] 3 modos con selection-card oficial
- [ ] Todos los hashes de la tabla funcionan
- [ ] Modal confirmación título exacto
- [ ] Alert duplicado 48 h (no modal)
- [ ] Copy mails = Figma (fechas separadas, sin saludo)
- [ ] `npx tsc --noEmit` sin errores
- [ ] Fast Refresh; no reiniciar dev server salvo deps nuevas

---

## Criterios de aceptación (vanilla — estado actual)

- [x] Selection-card oficial ×3
- [x] Modal confirmación «Revisa y confirma tu solicitud»
- [x] Hashes demo completos
- [x] Sin `header-product`
- [x] `mails/` con copy Figma + imágenes exportadas
- [x] Anti-duplicado 48 h inline
- [x] Navegación creator completa
- [ ] Migración React (pendiente — usar sección anterior)
