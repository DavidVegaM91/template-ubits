# Auditoría: ubits-colors.css vs tokens.css oficial UBITS (v3)

**Fuente oficial:** https://ubits-test-s3-lxp-assets.sandteck.com/assets/styles/css/v3/tokens.css  
**Convención:** En el DS oficial usan `--color-*` (y `--color-light-*` / `--color-dark-*`). En nuestro template usamos `--ubits-*`. Los **hex** deben coincidir.

---

## 1. Coinciden (hex igual)

| Nuestro token | Oficial (nombre) | Light | Dark |
|---------------|------------------|-------|------|
| --ubits-fg-1-high | color-light-fg-1-high / color-fg-1-high | #303a47 ✓ | #edeeef (dark) ✓ |
| --ubits-fg-1-medium | color-light-fg-1-medium | #5c646f ✓ | #d0d2d5 ✓ |
| --ubits-fg-2-high | color-light-fg-2-high | #2a303f ✓ | #ffffff ✓ |
| --ubits-fg-2-medium | color-light-fg-2-medium | #5a5e6a ✓ | #d0d2d5 ✓ |
| --ubits-bg-1 | color-light-bg-1 | #ffffff ✓ | #202837 ✓ |
| --ubits-bg-2 | color-light-bg-2 | #f3f3f4 ✓ | #0e1825 ✓ |
| --ubits-bg-3 | color-light-bg-3 | #e7e8ea ✓ | #0c121c ✓ |
| --ubits-bg-4 | color-light-bg-4 | #dbdde0 ✓ | #050b15 ✓ |
| --ubits-border-1 | color-light-border-1 | #d0d2d5 ✓ | #4f5561 ✓ |
| --ubits-border-2 | color-light-border-2 | #b9bbc1 ✓ | #404754 (dark border-2) ✓ |
| --ubits-accent-brand (light) | color-light-accent-brand | #0c5bef ✓ | — |
| --ubits-button-primary-bg-default (light) | btn primary bg default | #0c5bef ✓ | #3865f5 ✓ |
| --ubits-feedback-accent-error | color-light-feedback-accent-error | #e9343c ✓ | — |
| --ubits-fg-disabled | color-light-fg-disabled | #a2a6ad ✓ | #777c86 ✓ |
| --ubits-fg-bold | color-light-fg-bold | #ffffff ✓ | — |
| --ubits-logo | brand-ubits-logo | #0d1f57 ✓ | #ffffff (dark) ✓ |
| --ubits-sidebar-bg | sidebar-color-bg | #202837 ✓ | — |
| --ubits-scroll-bar-color-bg-default | scroll-bar-color-bg-default | #c5c6cb ✓ | #979ba3 ✓ |
| Feedback borders (success, info, warning, error) | color-*-feedback-border-* | Coinciden con oficial ✓ | ✓ |

---

## 2. Diferencias (ajustar para alinear con oficial)

### 2.1 Feedback accent (semánticos)

| Token nuestro | Nuestro valor | Oficial (light) | Oficial (dark) | Acción |
|---------------|----------------|------------------|----------------|--------|
| --ubits-feedback-accent-success | #4ab028 | **#328e2c** (pec-lime-52) | #4ab028 (lime-64) | En **light** el oficial es #328e2c. Nosotros tenemos #4ab028. Corregir light a #328e2c. |
| --ubits-feedback-accent-info | #7397fe | **#4a74ee** (pec-indigo-52) | #7397fe (indigo-64) | En **light** el oficial es #4a74ee. Nosotros tenemos #7397fe. Corregir light a #4a74ee. |
| --ubits-feedback-accent-warning | #d68b0d | **#b16c19** (pec-orange-52) | #d68b0d (orange-64) | En **light** el oficial es #b16c19. Nosotros tenemos #d68b0d. Corregir light a #b16c19. |
| --ubits-feedback-accent-error | #e9343c | #e9343c ✓ | #f96f6f | Ok en light; dark ya tenemos #f96f6f en -inverted. |

### 2.2 Backgrounds

| Token nuestro | Nuestro valor | Oficial | Nota |
|---------------|----------------|---------|------|
| --ubits-bg-2 (light) | #F3F3F4 | #f3f3f4 (pec-gray-96) | Mismo valor, solo mayúscula en hex (F3 vs f3). Opcional normalizar a minúscula. |
| --ubits-bg-5 (light) | #ced0d5 | color-light-bg-5: #ced0d5 ✓ | Ok. |
| --ubits-bg-active (light) | rgba(12, 91, 239, 0.15) | color-light-bg-active: #0c5bef26 (15%) | Mismo concepto; oficial usa hex con alpha 0x26 ≈ 15%. Nosotros 0.15. Equivalente. |
| --ubits-bg-dim (dark) | #000000b2 | color-dark-bg-dim: #000000b2 ✓ | Ok. |

### 2.3 Botones error (destructivos)

| Token nuestro | Nuestro valor | Oficial | Nota |
|---------------|----------------|---------|------|
| --ubits-btn-error-primary-bg-default (light) | #CF0E34 | color-light-feedback-bg-error-bold-default: #cf0e34 ✓ | Ok. |
| --ubits-btn-error-primary-bg-hover (light) | #B00C2E | oficial hover: #a41f22 | Diferente. Oficial #a41f22 (red-36). Nosotros #B00C2E. Revisar si queremos alinear a #a41f22. |
| --ubits-btn-error-primary-bg-pressed (light) | #9A0A28 | oficial pressed: #801b21 | Diferente. Oficial #801b21. Nosotros #9A0A28. Revisar. |

### 2.4 Success feedback (fondos sutles)

| Token nuestro | Nuestro valor | Oficial | Nota |
|---------------|----------------|---------|------|
| --ubits-feedback-bg-success-subtle (light) | #e8f8e4 | color-light-feedback-bg-success-subtle-default: #e8f8e4 ✓ | Ok. |
| --ubits-feedback-bg-success-subtle-hover (light) | #d4f0d0 | oficial: #bde9ac (lime-88) | Diferente. Oficial #bde9ac. Nosotros #d4f0d0. Opcional alinear. |

---

## 3. Resumen de correcciones recomendadas

1. **Alinear con la “fuente de verdad” (solo hex):**
   - **Light:**  
     - `--ubits-feedback-accent-success` → **#328e2c**  
     - `--ubits-feedback-accent-info` → **#4a74ee**  
     - `--ubits-feedback-accent-warning` → **#b16c19**
2. **Opcional (botones error):**  
   - Revisar hover/pressed de error primary con oficial (#a41f22, #801b21).
3. **Opcional (success subtle hover):**  
   - Revisar si usar #bde9ac en lugar de #d4f0d0 para success subtle hover.

---

## 4. Estructura del archivo oficial (referencia rápida)

- **:root** define todo; no hay un bloque aparte “solo dark”.
- Los tokens “light” son por ejemplo: `--color-light-fg-1-high`, `--color-light-bg-1`, etc.
- Los tokens “dark” son por ejemplo: `--color-dark-fg-1-high`, `--color-dark-bg-1`, etc.
- Hay un **alias** sin prefijo: `--color-fg-1-high: var(--color-light-fg-1-high, #303a47)` (light por defecto).
- Las paletas base son **--pec-*** (pec-gray-24, pec-blue-44, pec-lime-52, etc.); los semánticos **--color-*** referencian a esas o a otros --color-*.

En nuestro template usamos **--ubits-*** y cambiamos por tema con `[data-theme="dark"]`. Los **nombres** no tienen por qué ser iguales al DS; lo importante es que los **hex (y rgba equivalentes)** coincidan con el archivo oficial cuando el rol del token es el mismo (fg-1-high, bg-1, accent-success, etc.).

---

## 5. Tokens importados desde el DS oficial (última actualización)

Se añadieron a `ubits-colors.css` los siguientes tokens que faltaban (nombres oficiales → nuestros):

| Uso | Token nuestro | Light | Dark |
|-----|----------------|-------|------|
| Focus (focus ring) | --ubits-focus | #1953d766 | #6a7bf799 |
| Focus ring bordes | --ubits-focus-ring-inner, --ubits-focus-ring-outer | #ffffff, #000000 | — |
| Sub-surface (tertiary, chips) | --ubits-bg-sub-surface-hover, --ubits-bg-sub-surface-pressed | #2028371a, #20283733 | #ffffff1a, #ffffff33 |
| Toggle activo | --ubits-toggle-bg-active | #13bd74 | #1aa566 |
| Accent decorativos | --ubits-accent-blue, gray, yellow, teal, purple, pink, rose | pec-52/64 valores | dark-accent-* |
| Chart | --ubits-chart-fg-subtle, --ubits-chart-fg-bold, --ubits-chart-bg-neutral-blue-1/2/3 | #000, #fff, neutral-blue | — |

**Valores corregidos para coincidir con oficial:**
- Botón error primary hover/pressed (light): #a41f22, #801b21
- Botón error primary hover/pressed (dark): #b62221, #a41f22
- Success subtle hover: #bde9ac
- Tertiary bg hover/pressed: #2028371a, #20283733 (light); #ffffff1a, #ffffff33 (dark)
