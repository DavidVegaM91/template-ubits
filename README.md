# 🎯 Template UBITS - Crea interfaces en tiempo récord

> **Plantilla para crear interfaces UBITS con Cursor AI en tiempo récord**

## 🚀 ¿Qué es esto?

Una **plantilla lista para usar** que permite a **Product Managers**, **Diseñadores** y **Desarrolladores** crear interfaces UBITS auténticas usando **Cursor AI** sin conocimientos técnicos avanzados.

**El objetivo:** Validar ideas rápidamente, prototipar interfaces en tiempo récord y obtener feedback real de usuarios.

## 🚨 **ANTES DE EMPEZAR - LEE ESTO:**

1. **📋 Lee `.cursor/rules/cursor-rules.mdc`** - Reglas obligatorias para Cursor AI
2. **🎯 Edita `index.html`** - Tu página principal (se despliega en Netlify)
3. **📄 Usa `plantilla-ubits.html`** - Para crear páginas nuevas
4. **👀 Mira `componentes.html`** - Ve todos los componentes disponibles
5. **🎨 Usa SOLO tokens UBITS** - `var(--ubits-...)` NUNCA colores hardcodeados

## 🚀 Cómo usar esta plantilla

1. **Descarga:** Haz clon o descarga como ZIP
2. **Personaliza:** Modifica según tus necesidades
3. **Usa:** Despliega en tu propio hosting

> **Nota:** Esta es una plantilla de solo lectura. Para personalizarla, clona o haz fork del repositorio.

## 🧩 Componentes UBITS disponibles

### **Componentes de navegación:**
- **SubNav** - Navegación superior (variantes: template, aprendizaje, desempeno, encuestas, tareas, documentacion)
- **Sidebar** - Navegación lateral (opciones: aprendizaje, diagnóstico, desempeño, encuestas, reclutamiento, tareas, ubits-ai, ninguno)
- **TabBar** - Navegación móvil (opciones: modulos, perfil, modo-oscuro)

### **Componentes de UI:**
- **Button** - Botones de acción (variantes: primary, secondary, tertiary; tamaños: sm, md, lg)
- **Alert** - Notificaciones (tipos: success, info, warning, error; con/sin botón cerrar)
- **Card Content** - Cards para contenidos de aprendizaje (11 tipos, 35 competencias, 18 aliados, estados de progreso)

### **Componentes de documentación:**
- **Docs Sidebar** - Navegación para documentación (secciones: introduccion, sidebar, sub-nav, tab-bar, button, alert, card-content)

## 📁 Estructura del proyecto

```
Template UBITS/
├── 📄 index.html              # Página principal (edita aquí tu proyecto)
├── 📄 plantilla-ubits.html    # Plantilla base para crear nuevas páginas
├── 📄 componentes.html        # Documentación de componentes
├── 📄 button.html             # Documentación del componente Button
├── 📄 alert.html              # Documentación del componente Alert
├── 📄 card-content.html       # Documentación del componente Card Content
├── 📄 sidebar.html            # Documentación del componente Sidebar
├── 📄 subnav.html             # Documentación del componente SubNav
├── 📄 tab-bar.html            # Documentación del componente TabBar
├── 📁 components/             # Componentes reutilizables
│   ├── sub-nav.css + sub-nav.js
│   ├── sidebar.js + components-sidebar.css
│   ├── tab-bar.css + tab-bar.js
│   ├── alert.css + alert.js
│   ├── card-content.css + card-content.js
│   └── button.css
├── 📁 docs/                   # Sistema de documentación
│   ├── docs-sidebar.css + docs-sidebar.js
├── 🎨 ubits-colors.css        # Tokens de color UBITS
├── 🎨 ubits-typography.css    # Sistema de tipografía UBITS
├── 🎨 styles.css              # Estilos globales
└── 📚 Fonts/                  # Fuentes FontAwesome
```

## 🎯 Casos de uso reales

- **Product Managers:** Crear mockups de nuevas funcionalidades
- **Diseñadores:** Prototipar interfaces sin código
- **Equipos de producto:** Validar ideas con usuarios reales
- **Consultores:** Mostrar propuestas de interfaz a clientes
- **Desarrolladores:** Crear MVPs visuales rápidamente

## 🎨 Valor diferencial del proyecto

> **🚨 REGLA FUNDAMENTAL: SIEMPRE usar tokens de color UBITS y tipografía UBITS**

**Este es el valor diferencial del template.** Cualquiera puede usar Cursor AI, pero la ventaja de esta plantilla es que garantiza que todas las interfaces creadas mantengan la identidad visual oficial de UBITS con:

- **Tokens de color** que cambian automáticamente entre modo claro y oscuro
- **Tipografía oficial** UBITS con todas las variantes
- **Iconos FontAwesome** integrados y organizados
- **Consistencia visual** en todas las experiencias creadas

## 🤖 Instrucciones para Cursor AI

### **📋 Reglas Importantes**

#### ✅ **SIEMPRE Hacer (OBLIGATORIO):**
1. **Usar tokens de color UBITS** - `var(--ubits-fg-1-high)`, `var(--ubits-bg-1)`, etc. NUNCA colores hardcodeados
2. **Usar la tipografía UBITS** - Aplicar clases como `ubits-h1`, `ubits-body-md-regular`
3. **Usar componentes existentes** - Revisar `componentes.html` antes de crear custom
4. **Usar `box-sizing: border-box`** - Para cálculos correctos de tamaño
5. **Usar iconos outline** - Usar `far` (FontAwesome Regular) para iconos outline
6. **Importar `ubits-colors.css`** - En cualquier nuevo archivo HTML que crees

#### ❌ **EVITAR:**
1. **Usar colores hardcodeados** - SIEMPRE usar tokens UBITS (`var(--ubits-...)`)
2. **Crear componentes custom** - Cuando existen componentes UBITS
3. **Usar headings h3, h4, h5, h6** - Solo existen h1 y h2, usar `ubits-body-md-bold` para subtítulos
4. **Crear interfaces sin tokens** - Esto elimina el valor diferencial del proyecto

## 🎨 Sistema de tokens UBITS

### **Tokens de color (OBLIGATORIO):**
```css
/* NUNCA usar colores hardcodeados, SIEMPRE usar estos tokens: */
var(--ubits-fg-1-high)        /* Texto principal */
var(--ubits-fg-1-medium)      /* Texto secundario */
var(--ubits-bg-1)             /* Fondo principal */
var(--ubits-bg-2)             /* Fondo secundario */
var(--ubits-accent-brand)     /* Azul UBITS */
var(--ubits-border-1)         /* Bordes */
```

### **Tipografía UBITS:**
```css
/* Display */
ubits-display-d1-regular, ubits-display-d1-semibold, ubits-display-d1-bold
ubits-display-d2-regular, ubits-display-d2-semibold, ubits-display-d2-bold
ubits-display-d3-regular, ubits-display-d3-semibold, ubits-display-d3-bold
ubits-display-d4-regular, ubits-display-d4-semibold, ubits-display-d4-bold

/* Headings (SOLO ESTOS DOS EXISTEN) */
ubits-heading-h1, ubits-heading-h2

/* Body */
ubits-body-md-regular, ubits-body-md-semibold, ubits-body-md-bold
ubits-body-sm-regular, ubits-body-sm-semibold, ubits-body-sm-bold

/* Para subtítulos usar: */
ubits-body-md-bold, ubits-body-sm-bold
```

### **Importar tokens (OBLIGATORIO en nuevos archivos):**
```html
<link rel="stylesheet" href="ubits-colors.css">
<link rel="stylesheet" href="ubits-typography.css">
```

## 🚀 Ejemplos de uso

### **Usar componentes existentes:**
```html
<!-- SubNav -->
<div id="top-nav-container"></div>
<script>
loadSubNav('top-nav-container', 'template');
</script>

<!-- Sidebar -->
<div id="sidebar-container"></div>
<script>
loadSidebar('sidebar-container', 'ninguno');
</script>

<!-- Button -->
<button class="ubits-button ubits-button--primary ubits-button--md">
    <i class="far fa-check"></i>
    <span>Botón primario</span>
</button>

<!-- Alert -->
<div class="ubits-alert ubits-alert--success">
    <div class="ubits-alert__icon">
        <i class="far fa-check-circle"></i>
    </div>
    <div class="ubits-alert__content">
        <div class="ubits-alert__text">Mensaje de éxito</div>
    </div>
    <button class="ubits-alert__close">
        <i class="far fa-times"></i>
    </button>
</div>

<!-- Card Content -->
<div id="mi-contenedor-cards"></div>
<script>
loadCardContent('mi-contenedor-cards', [
    {
        type: 'Curso',
        title: 'Mi contenido',
        provider: 'UBITS',
        providerLogo: 'images/Favicons/UBITS.jpg',
        duration: '60 min',
        level: 'Intermedio',
        progress: 75,
        status: 'progress',
        image: 'images/cards-learn/mi-imagen.jpg',
        competency: 'Product design',
        language: 'Español'
    }
]);
</script>
```

### **Prompts para Cursor AI:**
```
"Usa el componente Button de UBITS para crear un botón primario con el texto 'Guardar'"
"Agrega un Alert de éxito usando el componente UBITS con el mensaje 'Datos guardados'"
"Implementa el SubNav con la variante 'template' en la página principal"
"Crea un catálogo de cursos usando el componente Card Content con diferentes tipos y estados"
```

## 📚 Documentación

- **`componentes.html`** - Página principal con todos los componentes disponibles
- **`button.html`** - Documentación del componente Button
- **`alert.html`** - Documentación del componente Alert
- **`card-content.html`** - Documentación del componente Card Content
- **`sidebar.html`** - Documentación del componente Sidebar
- **`subnav.html`** - Documentación del componente SubNav
- **`tab-bar.html`** - Documentación del componente TabBar

## 🎯 Características principales

### ✅ **Componentes listos para usar:**
- 7 componentes UBITS completamente funcionales
- Documentación interactiva con ejemplos
- Código listo para copiar y pegar
- Variantes y opciones configurables

### ✅ **Identidad visual UBITS:**
- Tokens de color oficiales
- Tipografía consistente
- Iconos FontAwesome integrados
- Modo claro y oscuro automático

### ✅ **Fácil de personalizar:**
- Componentes modulares
- Código limpio y documentado
- Sin dependencias externas
- Responsive por defecto

### ✅ **Para usuarios no técnicos:**
- Instrucciones claras para Cursor AI
- Prompts listos para usar
- Ejemplos de código
- Guías paso a paso

## 🚨 Solución de problemas

### **Si los colores no coinciden:**
1. **Verificar que usas tokens UBITS** - `var(--ubits-fg-1-high)` en lugar de `#303a47`
2. **Importar `ubits-colors.css`** - En cualquier archivo HTML nuevo
3. **Usar las clases de tipografía UBITS** - `ubits-h1`, `ubits-body-md-regular`

### **Si un componente no funciona:**
1. **Verificar que importas los archivos correctos** - CSS y JS del componente
2. **Revisar la documentación** - En la página específica del componente
3. **Usar el código de ejemplo** - Copia exactamente como está documentado

## 📄 Licencia

Este proyecto está bajo la licencia MIT incluida en el archivo `LICENSE`.

---

**¡Listo para crear interfaces UBITS increíbles! 🚀**