# UBITS Typography Guide

## 🎯 **PROPÓSITO**
Guía completa del sistema de tipografía UBITS con tokens de color, clases válidas y reglas de validación obligatoria para prevenir errores.

## 📋 **CLASES VÁLIDAS OFICIALES**

### **DISPLAY (Títulos principales solo para landings, procura no usarlas mucho)**
- `ubits-display-d1-regular` - Display D1 Regular (40px)
- `ubits-display-d1-semibold` - Display D1 Semibold (40px)
- `ubits-display-d1-bold` - Display D1 Bold (40px)
- `ubits-display-d2-regular` - Display D2 Regular (32px)
- `ubits-display-d2-semibold` - Display D2 Semibold (32px)
- `ubits-display-d2-bold` - Display D2 Bold (32px)
- `ubits-display-d3-regular` - Display D3 Regular (28px)
- `ubits-display-d3-semibold` - Display D3 Semibold (28px)
- `ubits-display-d3-bold` - Display D3 Bold (28px)
- `ubits-display-d4-regular` - Display D4 Regular (24px)
- `ubits-display-d4-semibold` - Display D4 Semibold (24px)
- `ubits-display-d4-bold` - Display D4 Bold (24px)

### **HEADINGS (Solo estos dos existen)**
- `ubits-heading-h1` - Heading H1 (20px)
- `ubits-heading-h2` - Heading H2 (18px)

### **BODY (Textos normales)**
- `ubits-body-md-regular` - Body Medium Regular (16px)
- `ubits-body-md-semibold` - Body Medium Semibold (16px)
- `ubits-body-md-bold` - Body Medium Bold (16px)
- `ubits-body-sm-regular` - Body Small Regular (14px)
- `ubits-body-sm-semibold` - Body Small Semibold (14px)
- `ubits-body-sm-bold` - Body Small Bold (14px)
- `ubits-body-lg-regular` - Body Large Regular (20px) - Solo para botones LG

## 🚨 **CLASES PROHIBIDAS (NUNCA USAR)**

### **❌ CLASES INVENTADAS QUE NO EXISTEN:**
- `ubits-h1` ❌
- `ubits-h2` ❌
- `ubits-h3` ❌
- `ubits-h4` ❌
- `ubits-h5` ❌
- `ubits-h6` ❌
- `ubits-title` ❌
- `ubits-subtitle` ❌
- `ubits-text` ❌
- `ubits-paragraph` ❌
- `ubits-label` ❌
- `ubits-caption` ❌

### **❌ CLASES HTML ESTÁNDAR (NO USAR):**
- `<h1>`, `<h2>`, `<h3>`, `<h4>`, `<h5>`, `<h6>` ❌
- `<p>` sin clase ❌
- `<span>` sin clase ❌

## 🔍 **SISTEMA DE VALIDACIÓN OBLIGATORIA**

### **ANTES DE USAR CUALQUIER CLASE:**
1. **VERIFICA** que esté en la lista de clases válidas
2. **NUNCA** inventes clases que no existan
3. **USA SOLO** las clases oficiales de UBITS
4. **SI NO ESTÁ** en la lista, NO la uses

### **REGLAS DE VALIDACIÓN:**
- ✅ **SOLO** clases de la lista oficial
- ✅ **VERIFICA** cada clase antes de usarla
- ✅ **USA** `ubits-body-md-bold` para subtítulos
- ✅ **USA** `ubits-body-sm-bold` para títulos pequeños
- ❌ **NUNCA** inventes clases
- ❌ **NUNCA** uses HTML tags sin clase UBITS

## 📝 **EJEMPLOS CORRECTOS**

### **Títulos principales:**
```html
<!-- ✅ CORRECTO -->
<h1 class="ubits-display-d2-bold">Mi título principal</h1>
<h2 class="ubits-display-d3-semibold">Mi subtítulo</h2>

<!-- ❌ INCORRECTO -->
<h1 class="ubits-h1">Mi título</h1>
<h2 class="ubits-h2">Mi subtítulo</h2>
```

### **Textos normales:**
```html
<!-- ✅ CORRECTO -->
<p class="ubits-body-md-regular">Mi texto normal</p>
<p class="ubits-body-md-bold">Mi texto en negrita</p>

<!-- ❌ INCORRECTO -->
<p class="ubits-text">Mi texto</p>
<p class="ubits-paragraph">Mi párrafo</p>
```

### **Subtítulos y títulos pequeños:**
```html
<!-- ✅ CORRECTO -->
<p class="ubits-body-md-bold">Subtítulo de sección</p>
<p class="ubits-body-sm-bold">Título pequeño</p>

<!-- ❌ INCORRECTO -->
<h3 class="ubits-h3">Subtítulo</h3>
<h4 class="ubits-h4">Título pequeño</h4>
```

## 🎨 **TOKENS DE COLOR**

### **Colores por defecto:**
```css
/* Títulos y Display */
color: var(--ubits-fg-1-high);

/* Body y textos normales */
color: var(--ubits-fg-1-medium);
```

### **Variantes de color:**
```css
/* Texto principal */
color: var(--ubits-fg-1-high);

/* Texto secundario */
color: var(--ubits-fg-1-medium);

/* Texto terciario */
color: var(--ubits-fg-1-low);

/* Texto deshabilitado */
color: var(--ubits-fg-2-medium);
```

## 📱 **RESPONSIVE Y TAMAÑOS**

### **Tamaños disponibles:**
- **Display D1:** 40px (títulos muy grandes)
- **Display D2:** 32px (títulos grandes)
- **Display D3:** 28px (títulos medianos)
- **Display D4:** 24px (títulos pequeños)
- **Heading H1:** 20px (subtítulos grandes)
- **Heading H2:** 18px (subtítulos medianos)
- **Body Large:** 20px (botones LG)
- **Body Medium:** 16px (texto normal)
- **Body Small:** 14px (texto pequeño)

### **Cambiar tamaño:**
```css
/* Cambiar tamaño de texto */
font-size: 18px; /* Tamaño personalizado */
line-height: 1.5; /* Interlineado personalizado */
```

## 🌙 **MODO OSCURO**

### **Adaptación automática:**
Los tokens de color se adaptan automáticamente:
- **Modo claro:** Colores claros
- **Modo oscuro:** Colores oscuros
- **Sin configuración adicional** necesaria

### **Ejemplo:**
```html
<!-- Se adapta automáticamente -->
<h1 class="ubits-display-d2-bold">Título que cambia de color</h1>
<p class="ubits-body-md-regular">Texto que se adapta al tema</p>
```

## 🎯 **CASOS DE USO**

### **Landing Page:**
```html
<h1 class="ubits-display-d1-bold">Bienvenido a UBITS</h1>
<h2 class="ubits-display-d3-semibold">Transforma tu aprendizaje</h2>
<p class="ubits-body-md-regular">Descubre una nueva forma de aprender</p>
```

### **Interfaz de producto:**
```html
<h1 class="ubits-heading-h1">Dashboard</h1>
<p class="ubits-body-md-bold">Resumen de actividades</p>
<p class="ubits-body-md-regular">Tienes 3 tareas pendientes</p>
```

### **Formularios:**
```html
<label class="ubits-body-md-bold">Nombre completo</label>
<input type="text" class="ubits-body-md-regular">
<p class="ubits-body-sm-regular">Campo obligatorio</p>
```

## ⚠️ **NOTAS IMPORTANTES**

### **CRÍTICO:**
- **NUNCA** inventes clases que no existan
- **VERIFICA** cada clase antes de usarla
- **USA SOLO** las clases oficiales de UBITS
- **SI NO ESTÁ** en la lista, NO la uses

### **REGLAS CRÍTICAS:**
1. **SOLO** clases de la lista oficial
2. **VERIFICA** cada clase antes de usarla
3. **USA** `ubits-body-md-bold` para subtítulos
4. **USA** `ubits-body-sm-bold` para títulos pequeños
5. **NUNCA** inventes clases como `ubits-h1`, `ubits-h2`, etc.

### **CONSECUENCIAS DE INVENTAR CLASES:**
- ❌ **Fuente por defecto del navegador** (serifada horrible)
- ❌ **Pérdida de identidad visual UBITS**
- ❌ **Inconsistencia en el diseño**
- ❌ **Experiencia de usuario degradada**

## 🔧 **VERIFICACIÓN OBLIGATORIA**

### **ANTES DE FINALIZAR CUALQUIER TAREA:**
1. **REVISA** cada clase de tipografía usada
2. **VERIFICA** que esté en la lista oficial
3. **CONFIRMA** que no hay clases inventadas
4. **ASEGÚRATE** de que todas las fuentes se rendericen correctamente

### **CHECKLIST DE VALIDACIÓN:**
- [ ] **TODAS** las clases están en la lista oficial
- [ ] **NO HAY** clases inventadas como `ubits-h1`, `ubits-h2`
- [ ] **NO HAY** HTML tags sin clase UBITS
- [ ] **TODAS** las fuentes se renderizan correctamente
- [ ] **IDENTIDAD** visual UBITS mantenida

## 📚 **REFERENCIAS**

### **Archivos relacionados:**
- `ubits-typography.css` - Estilos de tipografía
- `ubits-colors.css` - Tokens de color
- `cursor-rules.mdc` - Reglas para AI agents

### **Componentes que usan tipografía:**
- **Button:** `ubits-body-lg-regular` (LG), `ubits-body-md-regular` (MD), `ubits-body-sm-regular` (SM)
- **Alert:** `ubits-body-md-regular` para texto
- **Sidebar:** `ubits-body-md-regular` para opciones
- **SubNav:** `ubits-body-md-regular` para secciones

---

**¡RECUERDA!** Esta guía es **OBLIGATORIA** para mantener la identidad visual de UBITS. **NUNCA** inventes clases que no existan.