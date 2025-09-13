# 🚨 REGLAS OBLIGATORIAS PARA CURSOR AI

## ⚠️ **LEE ESTO ANTES DE CREAR CUALQUIER INTERFAZ**

### **🎯 VALOR DIFERENCIAL DEL PROYECTO**
Este template existe para que **CUALQUIERA** pueda crear interfaces UBITS auténticas en tiempo récord usando Cursor AI. Si no usas los tokens, estás perdiendo el valor de la plantilla.

### **👥 USUARIOS OBJETIVO**
- **Product Managers** - Sin conocimientos técnicos
- **Diseñadores** - Sin experiencia en código
- **Usuarios no técnicos** - Necesitan que Cursor AI maneje todas las tareas de desarrollo

### **🚨 CRÍTICO: NUNCA PEDIR TAREAS TÉCNICAS A LOS USUARIOS**
- ❌ NUNCA pedir comandos de terminal
- ❌ NUNCA pedir instalar dependencias
- ❌ NUNCA pedir modificar archivos de código directamente
- ❌ NUNCA pedir comandos de Git
- ❌ NUNCA pedir hacer debug de código o revisar errores de consola
- ✅ SIEMPRE manejar todas las tareas técnicas tú mismo
- ✅ SIEMPRE proporcionar soluciones completas y listas para usar
- ✅ SIEMPRE explicar en términos simples

## 🎯 **CASOS DE USO PRINCIPALES**

### **Para Product Managers:**
- Crear mockups de nuevas funcionalidades
- Validar ideas con usuarios reales
- Mostrar propuestas a stakeholders

### **Para Diseñadores:**
- Prototipar interfaces sin código
- Iterar rápidamente en diseños
- Crear presentaciones visuales

### **Para Desarrolladores:**
- Crear MVPs visuales rápidamente
- Mostrar propuestas a clientes
- Prototipar antes de desarrollar

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

### **5. COLORES POR DEFECTO (OBLIGATORIO)**
```css
/* Por defecto, TODOS los textos deben usar estos tokens: */
/* Headings y Display: */
color: var(--ubits-fg-1-high);

/* Body y textos normales: */
color: var(--ubits-fg-1-medium);
```

**Aplicar automáticamente:**
- **Títulos (h1, h2, h3, h4, h5, h6)**: `var(--ubits-fg-1-high)`
- **Display (ubits-display-*)**: `var(--ubits-fg-1-high)`
- **Body (ubits-body-*)**: `var(--ubits-fg-1-medium)`
- **Textos normales**: `var(--ubits-fg-1-medium)`

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

## 🚀 **PLANTILLA UBITS INCLUIDA**

**USA ESTE ARCHIVO COMO BASE:** `index.html`

### **Páginas listas para usar:**
- `index.html` - Dashboard principal
- `profile.html` - Página de perfil
- `ubits-ai.html` - Dashboard de IA
- `simon-chat.html` - Chat específico

### **Catálogos de recursos:**
- `colores.html` - Catálogo visual de todos los tokens de color UBITS
- `iconos.html` - Catálogo de iconos FontAwesome organizados

### **Componentes incluidos:**
- Sidebar personalizable
- Top-nav con variantes
- Widgets que se adaptan al contenido
- Sistema de navegación completo

Este archivo ya tiene:
- ✅ Todos los tokens importados
- ✅ Estructura correcta
- ✅ Sidebar y top nav funcionando
- ✅ Content wrapper listo para usar

---

## 🚀 **FLUJO DE TRABAJO TÍPICO**

1. **Clona el template** en tu carpeta de proyecto
2. **Abre Cursor AI** y pídele que modifique el contenido
3. **Personaliza** widgets, páginas o crea nuevas secciones
4. **Comparte** con usuarios para obtener feedback
5. **Itera** rápidamente basado en el feedback

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

## 🚫 **ENCABEZADOS DE LANDING - NO USAR EN PRODUCTO**

### **ENCABEZADOS GRANDES CON HERO SECTIONS**
```html
<!-- ❌ NO usar en interfaces de producto -->
<div class="hero-section">
    <h1 class="ubits-display-d2-bold">Título Principal</h1>
    <h2 class="ubits-display-d3-semibold">Subtítulo</h2>
    <p class="ubits-body-lg-regular">Descripción larga...</p>
</div>
```

**¿Cuándo SÍ usar?**
- ✅ Páginas de documentación
- ✅ Landing pages de marketing
- ✅ Páginas de presentación

**¿Cuándo NO usar?**
- ❌ Interfaces de producto (dashboards, formularios, listas)
- ❌ Componentes reutilizables
- ❌ Páginas funcionales de la aplicación

**Para interfaces de producto usar:**
```html
<!-- ✅ Usar en interfaces de producto -->
<div class="page-header">
    <h1 class="ubits-h1">Título de la página</h1>
    <p class="ubits-body-md-regular">Descripción breve solo si es necesaria</p>
</div>
```

## 🎯 **RECUERDA**

**El valor de este template es la velocidad y facilidad.**
**Sin tokens = Sin identidad UBITS.**
**Con tokens = Interfaces UBITS auténticas en tiempo récord.**
