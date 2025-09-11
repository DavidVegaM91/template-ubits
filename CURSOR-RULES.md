# 🚨 REGLAS OBLIGATORIAS PARA CURSOR AI

## ⚠️ **LEE ESTO ANTES DE CREAR CUALQUIER INTERFAZ**

### **🎯 VALOR DIFERENCIAL DEL PROYECTO**
Este proyecto existe para garantizar que **TODAS** las interfaces creadas mantengan la identidad visual oficial de UBITS. Si no usas los tokens, estás eliminando el valor del proyecto.

---

## 🔥 **REGLAS NO NEGOCIABLES**

### **0. PRINCIPIO KISS (OBLIGATORIO)**
- **Keep It Simple, Stupid** - Siempre busca la solución más simple
- **Código limpio y directo** - Evita complejidad innecesaria
- **Funciones pequeñas** - Una función, una responsabilidad
- **Nombres claros** - `navigateToTab()` mejor que `handleNavigationEvent()`
- **Menos abstracciones** - `onclick` directo mejor que event listeners complejos
- **Debugging fácil** - Console.log simples para verificar funcionamiento

### **1. TOKENS DE COLOR (OBLIGATORIO)**
```css
/* ❌ NUNCA HAGAS ESTO: */
color: #303a47;
background: #ffffff;
border: 1px solid #d0d2d5;

/* ✅ SIEMPRE HAZ ESTO: */
color: var(--ubits-fg-1-high);
background: var(--ubits-bg-1);
border: 1px solid var(--ubits-border-1);
```

### **2. IMPORTAR TOKENS (OBLIGATORIO)**
```html
<!-- SIEMPRE incluir esto en cualquier HTML nuevo: -->
<link rel="stylesheet" href="ubits-colors.css">
<link rel="stylesheet" href="ubits-typography.css">
```

### **3. TIPOGRAFÍA UBITS (OBLIGATORIO)**
```html
<!-- ❌ NUNCA: -->
<h1>Mi Título</h1>
<p>Mi texto</p>

<!-- ✅ SIEMPRE: -->
<h1 class="ubits-h1">Mi Título</h1>
<p class="ubits-body-md-regular">Mi texto</p>
```

### **4. BORDES UBITS (OBLIGATORIO)**
```css
/* ❌ NUNCA HAGAS ESTO: */
border: 1px solid #d0d2d5;
border: 1px solid var(--ubits-fg-2-medium);
border: 1px solid var(--ubits-fg-1-medium);

/* ✅ SIEMPRE HAZ ESTO: */
border: 1px solid var(--ubits-border-1);
```

---

## 🎨 **TOKENS DISPONIBLES**

### **Textos:**
- `var(--ubits-fg-1-high)` - Texto principal
- `var(--ubits-fg-1-medium)` - Texto secundario
- `var(--ubits-fg-2-high)` - Texto destacado
- `var(--ubits-fg-2-medium)` - Texto gris

### **Fondos:**
- `var(--ubits-bg-1)` - Fondo principal (blanco/oscuro)
- `var(--ubits-bg-2)` - Fondo secundario
- `var(--ubits-sidebar-bg)` - Fondo del sidebar

### **Colores especiales:**
- `var(--ubits-accent-brand)` - Azul UBITS
- `var(--ubits-sidebar-button-fg-default)` - Iconos sidebar

### **Bordes (usar con moderación):**
- `var(--ubits-border-1)` - **BORDE PRINCIPAL** (USAR POR DEFECTO SIEMPRE)
- `var(--ubits-border-2)` - Borde secundario
- `var(--ubits-border-disabled)` - Borde deshabilitado
- `var(--ubits-border-blue)` - Borde azul
- `var(--ubits-border-gray)` - Borde gris
- `var(--ubits-border-green)` - Borde verde
- `var(--ubits-feedback-border-success)` - Borde éxito
- `var(--ubits-feedback-border-error)` - Borde error

**⚠️ IMPORTANTE:** Cuando necesites un borde, usa `var(--ubits-border-1)` por defecto. NO uses otros tokens que no sean de bordes.

---

## 🚀 **PLANTILLA BASE**

**USA ESTE ARCHIVO COMO BASE:** `index.html`

Este archivo ya tiene:
- ✅ Todos los tokens importados
- ✅ Estructura correcta
- ✅ Sidebar y top nav funcionando
- ✅ Content wrapper listo para usar

---

## ⚡ **PROMPTS PARA CURSOR**

### **Para crear nueva página:**
```
"Usa index.html como base y crea una página de [nombre] manteniendo todos los tokens UBITS"
```

### **Para modificar existente:**
```
"Modifica [archivo] usando SOLO tokens UBITS (var(--ubits-...)) y tipografía UBITS (ubits-h1, ubits-body-md-regular)"
```

### **Para agregar componente:**
```
"Agrega un componente de [nombre] usando tokens UBITS y la estructura de index.html"
```

---

## 🔍 **VERIFICACIÓN**

Antes de terminar, verifica que:
- [ ] No hay colores hardcodeados (#303a47, #ffffff, etc.)
- [ ] Todos los textos usan clases UBITS (ubits-h1, ubits-body-md-regular)
- [ ] Se importó ubits-colors.css
- [ ] Se importó ubits-typography.css
- [ ] Los colores cambian en modo oscuro
- [ ] Los bordes usan `var(--ubits-border-1)` por defecto
- [ ] NO se usan tokens de texto para bordes (fg-1-medium, fg-2-medium, etc.)

---

## 🎯 **RECUERDA**

**El valor de este proyecto es la consistencia visual UBITS.**
**Sin tokens = Sin valor.**
**Con tokens = Experiencia UBITS perfecta.**
