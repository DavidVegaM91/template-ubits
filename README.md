# 🎯 UBITS Playground - Crea interfaces en tiempo récord

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
- **Button** - Botones de acción (variantes: primary, secondary, tertiary; tamaños: sm, md, lg) - **RENDERIZADO: HTML directo**
- **Alert** - Notificaciones (tipos: success, info, warning, error; con/sin botón cerrar) - **RENDERIZADO: showAlert() o HTML directo**
- **Toast** - Notificaciones flotantes (tipos: success, info, warning, error; auto-cierre, pausa en hover) - **RENDERIZADO: showToast()**
- **Input** - Campos de entrada (11 tipos: text, email, password, number, tel, url, select, textarea, search, autocomplete, calendar; tamaños: sm, md, lg; estados: default, hover, focus, invalid, disabled; con iconos, contador, helper text, mandatory/optional, validación manual, scroll infinito automático) - **RENDERIZADO: createInput()**
- **Card Content** - Cards para contenidos de aprendizaje (11 tipos, 35 competencias, 18 aliados, estados de progreso) - **RENDERIZADO: loadCardContent()**

### **🔧 REQUISITOS DE RENDERIZADO:**
Todos los componentes UBITS requieren imports obligatorios:

```html
<!-- CSS OBLIGATORIO para cada componente usado -->
<link rel="stylesheet" href="components/button.css">
<link rel="stylesheet" href="components/alert.css">
<link rel="stylesheet" href="components/toast.css">
<link rel="stylesheet" href="components/input.css">
<link rel="stylesheet" href="components/card-content.css">

<!-- JavaScript OBLIGATORIO para componentes dinámicos -->
<script src="components/alert.js"></script>
<script src="components/toast.js"></script>
<script src="components/input.js"></script>
<script src="components/card-content.js"></script>

<!-- Base UBITS SIEMPRE REQUERIDA -->
<link rel="stylesheet" href="ubits-colors.css">
<link rel="stylesheet" href="ubits-typography.css">
<link rel="stylesheet" href="fontawesome-icons.css">
```

### **🚨 PROBLEMAS COMUNES CON COMPONENTES:**

#### **Button Component - Errores Frecuentes:**
```html
<!-- ❌ INCORRECTO - Botones sin estilos -->
<button class="my-custom-button">Texto</button>
<button class="btn btn-primary">Texto</button>

<!-- ❌ INCORRECTO - Clases inventadas -->
<button class="ubits-button ubits-button--primary">
    <i class="ubits-button__icon far fa-check"></i>
    <span class="ubits-button__text">Texto</span>
</button>

<!-- ✅ CORRECTO - Estructura UBITS oficial -->
<button class="ubits-button ubits-button--primary ubits-button--md">
    <i class="far fa-check"></i>
    <span>Texto</span>
</button>
```

**REGLAS CRÍTICAS PARA BUTTONS:**
- ❌ **NUNCA crear botones custom** cuando existe `ubits-button`
- ❌ **NUNCA usar clases inventadas** como `ubits-button__icon`
- ✅ **SIEMPRE importar** `components/button.css` y `fontawesome-icons.css`
- ✅ **SIEMPRE usar estructura oficial** UBITS

### **Componentes de documentación:**
- **Docs Sidebar** - Navegación para documentación (secciones: introduccion, sidebar, sub-nav, tab-bar, button, alert, card-content)

## 🎯 **LOS 3 GRANDES ENTREGABLES DE UBITS PLAYGROUND**

### **1. PÁGINAS PLANTILLA (Templates Listos para Usar)**

#### **🏠 Páginas Base:**
- **`index.html`** - Página principal (se deploya como homepage - 1 sección)
- **`plantilla-ubits.html`** - Template base para crear nuevas páginas (1 sección)

#### **🎓 Módulo de Aprendizaje:**
- **`home-learn.html`** - Dashboard de aprendizaje (9 secciones)
- **`catalogo.html`** - Catálogo de contenidos (2 secciones)
- **`u-corporativa.html`** - Universidad corporativa (3 secciones)
- **`zona-estudio.html`** - Zona de estudio (2 secciones con tabs)

#### **📊 Módulo de Diagnóstico:**
- **`diagnostico.html`** - Página de diagnóstico (1 sección)

#### **📈 Módulo de Desempeño:**
- **`evaluaciones-360.html`** - Evaluaciones 360 (1 sección)
- **`objetivos.html`** - Objetivos (1 sección)
- **`metricas.html`** - Métricas (1 sección)
- **`reportes.html`** - Reportes (1 sección)

#### **📋 Módulo de Encuestas:**
- **`encuestas.html`** - Encuestas (1 sección)

#### **👥 Módulo de Reclutamiento:**
- **`reclutamiento.html`** - Reclutamiento (1 sección, sin SubNav)

#### **📝 Módulo de Planes y Tareas:**
- **`planes.html`** - Planes (1 sección)
- **`tareas.html`** - Tareas (1 sección)

#### **👤 Perfil:**
- **`profile.html`** - Perfil/Portal del colaborador

### **2. PÁGINAS DE DOCUMENTACIÓN (Sistema de Componentes)**

#### ** Página Principal:**
- **`documentacion.html`** - Home de documentación

#### **📖 Documentación de Componentes:**
- **`componentes.html`** - Introducción y bienvenida a los componentes UBITS
- **`sidebar.html`** - Documentación del componente Sidebar
- **`subnav.html`** - Documentación del componente SubNav
- **`tab-bar.html`** - Documentación del componente TabBar
- **`button.html`** - Documentación del componente Button
- **`alert.html`** - Documentación del componente Alert
- **`card-content.html`** - Documentación del componente Card Content

#### **🎨 Guías de Diseño:**
- **`colores.html`** - Guía de colores UBITS
- **`tipografia.html`** - Guía de tipografía UBITS
- **`iconos.html`** - Galería de iconos FontAwesome

#### ** Herramientas de Documentación:**
- **`guia-prompts.html`** - Prompts para personalización con Cursor AI

### **3. ✅ VALIDADOR (Control de Calidad Automático)**
- **`validador-ubits.html`** - Herramienta drag & drop que verifica tokens UBITS, tipografía y componentes, genera prompts para Cursor AI y otorga puntuación

---

## 🛠️ **HERRAMIENTAS DE SOPORTE (Lo que hace que los 3 grandes funcionen)**

### **🧩 Componentes del sistema:**
```
├── 📁 components/             # Componentes reutilizables
│   ├── sub-nav.css + sub-nav.js
│   ├── sidebar.js + components-sidebar.css
│   ├── tab-bar.css + tab-bar.js
│   ├── floating-menu.css + floating-menu.js
│   ├── profile-menu.css + profile-menu.js
│   ├── alert.css + alert.js
│   ├── toast.css + toast.js
│   ├── input.css + input.js
│   ├── button.css
│   └── card-content.css + card-content.js
├── 📁 docs/                   # Sistema de documentación
│   ├── docs-sidebar.css + docs-sidebar.js
└── 📁 images/                 # Recursos visuales
    ├── cards-learn/           # Imágenes para cards de aprendizaje
    ├── Favicons/              # Logos de proveedores
    └── empty-states/          # Estados vacíos
```

### **🎨 Archivos de diseño:**
```
├── 📄 ubits-colors.css        # Tokens de color UBITS oficiales
├── 📄 ubits-typography.css    # Clases de tipografía UBITS oficiales
├── 📄 fontawesome-icons.css   # Iconos FontAwesome
├── 📄 styles.css              # Estilos globales del template
├── 📄 profile.css             # Estilos específicos del perfil
└── 📄 script.js               # JavaScript principal
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

### ✅ **Estructura modular (NUEVO):**
- Sistema de secciones y widgets fácil de personalizar
- Permite añadir, modificar y reorganizar contenido fácilmente
- Compatible con todas las páginas del template

## 🧩 Estructura modular - Fácil personalización

### **¿Qué es la estructura modular?**

Un sistema inspirado que permite a **cualquier usuario** (Product Managers, Diseñadores, etc.) personalizar páginas fácilmente usando **Cursor AI** con prompts simples.

### **🎯 Cómo funciona:**

#### **Secciones disponibles:**
- **`section-single`** - 1 columna (ancho completo)
- **`section-dual`** - 2 columnas (50% cada una)
- **`section-triple`** - 3 columnas (33% cada una)
- **`section-quad`** - 4 columnas (25% cada una)

#### **Widgets personalizables:**
- Cada widget tiene un **nombre descriptivo** (ej: `widget-dashboard`, `widget-estadisticas`)
- **Altura flexible** usando `<br>` (sin alturas mínimas forzadas)
- **Responsive automático** (columnas se apilan en móvil)
- **Estilos consistentes** con tokens UBITS

### **📝 Ejemplos de prompts que funcionan:**

```
"Añade una section-dual con widget-progreso y widget-estadisticas después de Banner principal"

"Cambia el nombre del widget-contenido a 'Dashboard personal'"

"Añade 5 br al widget-banner para hacerlo más alto"

"Reemplaza la section-single de 'Bienvenida' por una section-triple con widget-cursos, widget-progreso y widget-notificaciones"

"Elimina todas las secciones que están debajo de 'Contenido principal'"
```

### **🎯 Páginas con estructura modular:**

#### **Páginas completas:**
- **`home-learn.html`** - Ejemplo completo con 9 secciones variadas
- **`profile.html`** - Página original que inspiró el sistema

#### **Páginas básicas:**
- **`catalogo.html`** - 2 secciones (Encabezado + Lista competencias)
- **`u-corporativa.html`** - 3 secciones específicas
- **`zona-estudio.html`** - 2 secciones con tabs
- **`index.html`** - 1 sección base
- **`plantilla-ubits.html`** - Template base con estructura

#### **Páginas especializadas:**
- **`diagnostico.html`** - 1 sección enfocada
- **`evaluaciones-360.html`** - Contenido específico 360
- **`objetivos.html`** - Contenido específico objetivos
- **`metricas.html`** - Contenido específico métricas
- **`reportes.html`** - Contenido específico reportes
- **`encuestas.html`** - Contenido específico encuestas
- **`reclutamiento.html`** - Contenido específico reclutamiento
- **`planes.html`** - Contenido específico planes
- **`tareas.html`** - Contenido específico tareas

### **🚀 Ventajas del sistema:**

1. **Fácil de entender** - Nombres semánticos claros
2. **Flexible** - Cualquier combinación de columnas y alturas
3. **Reutilizable** - Widgets se pueden usar en cualquier página
4. **Escalable** - Fácil añadir nuevos tipos de secciones
5. **Consistente** - Misma experiencia en todas las páginas
6. **Sin conocimiento técnico** - Solo necesitas describir lo que quieres

## 🚨 MANDATORY: VERIFICAR RECURSOS DISPONIBLES

**ANTES de usar CUALQUIER imagen, competencia o proveedor:**

1. **SIEMPRE revisa `images/cards-learn/`** para imágenes de cursos (85 imágenes disponibles)
2. **SIEMPRE revisa `images/Favicons/`** para logos de proveedores (18 proveedores disponibles)
3. **SIEMPRE revisa `images/empty-states/`** para imágenes de estados vacíos (2 archivos SVG)
4. **SIEMPRE revisa `images/Profile-image.jpg`** para avatar de usuario
5. **SIEMPRE revisa `components/card-content.js`** para lista oficial de competencias (35 competencias)
6. **NUNCA inventes nombres de recursos** que no existen
7. **SIEMPRE verifica** las rutas de recursos antes de implementar
8. **Para otras imágenes** - Usa servicios externos como Unsplash con atribución adecuada

**Esto previene imágenes rotas y datos inválidos.**

## 🎯 COMPETENCIAS OFICIALES UBITS (35 TOTAL)

### **Competencias disponibles:**
- `Accountability`
- `Administración de negocios`
- `Agilidad`
- `Comunicación`
- `Cumplimiento (Compliance)`
- `Data skills`
- `Desarrollo de software`
- `Desarrollo web`
- `Digital skills`
- `e-Commerce`
- `Emprendimiento`
- `Experiencia del cliente`
- `Gestión de procesos y operaciones`
- `Gestión de proyectos`
- `Gestión de recursos tecnológicos`
- `Gestión del cambio`
- `Gestión del riesgo`
- `Gestión financiera`
- `Herramientas tecnológicas`
- `Inglés`
- `Innovación`
- `Inteligencia emocional`
- `Lenguajes de Programación`
- `Liderazgo`
- `Marketing`
- `Marketing digital`
- `Negociación`
- `People management`
- `Product design`
- `Productividad`
- `Resolución de problemas`
- `Trabajo en equipo`
- `Ventas`
- `Wellness`

### **⚠️ REGLAS CRÍTICAS:**
- **NUNCA inventes competencias** que no existen
- **SIEMPRE usa** solo competencias de esta lista oficial
- **SIEMPRE verifica** la ortografía exacta de la competencia

## 🚨 Solución de problemas

### **Si los colores no coinciden:**
1. **Verificar que usas tokens UBITS** - `var(--ubits-fg-1-high)` en lugar de `#303a47`
2. **Importar `ubits-colors.css`** - En cualquier archivo HTML nuevo
3. **Usar las clases de tipografía UBITS** - `ubits-h1`, `ubits-body-md-regular`

### **Si un componente no funciona:**
1. **Verificar que importas los archivos correctos** - CSS y JS del componente
2. **Revisar la documentación** - En la página específica del componente
3. **Usar el código de ejemplo** - Copia exactamente como está documentado

### **Si las imágenes no cargan:**
1. **Verificar rutas de imágenes** - Usa solo recursos de las carpetas oficiales
2. **Revisar nombres de archivos** - Respeta mayúsculas y minúsculas exactas
3. **Usar competencias oficiales** - Solo las 35 competencias de la lista oficial

## 📝 Componente Input - Guía rápida

### **¿Qué es Input?**
Campos de entrada de texto con todas las variantes, estados, iconos y funcionalidades avanzadas. Incluye 6 tipos especiales: SELECT, TEXTAREA, SEARCH, AUTOCOMPLETE, CALENDAR, PASSWORD. **SELECT incluye scroll infinito automático** para listas largas (50+ opciones).

### **Cómo implementar:**

#### **1. Importar archivos necesarios:**
```html
<link rel="stylesheet" href="ubits-colors.css">
<link rel="stylesheet" href="ubits-typography.css">
<link rel="stylesheet" href="fontawesome-icons.css">
<link rel="stylesheet" href="components/input.css">
<script src="components/input.js"></script>
```

#### **2. Crear contenedor:**
```html
<div id="mi-input-container"></div>
```

#### **3. Usar la función:**
```javascript
// Input básico
createInput({
    containerId: 'mi-input-container',
    label: 'Nombre',
    placeholder: 'Escribe tu nombre'
});

// Input con iconos y helper text
createInput({
    containerId: 'mi-input-container',
    label: 'Email',
    placeholder: 'correo@ejemplo.com',
    type: 'email',
    leftIcon: 'fa-envelope',
    helperText: 'Ingresa tu email válido',
    showHelper: true
});

// Input con contador de caracteres
createInput({
    containerId: 'mi-input-container',
    label: 'Mensaje',
    placeholder: 'Escribe tu mensaje',
    helperText: 'Máximo 100 caracteres',
    showHelper: true,
    showCounter: true,
    maxLength: 100
});

// Input solo con contador (sin helper text)
createInput({
    containerId: 'mi-input-container',
    label: 'Comentario',
    placeholder: 'Escribe tu comentario',
    showCounter: true,
    maxLength: 200
});

// SELECT con opciones básicas
createInput({
    containerId: 'mi-select',
    type: 'select',
    label: 'Categoría',
    placeholder: 'Selecciona una opción...',
    selectOptions: [
        {value: '1', text: 'Opción 1'},
        {value: '2', text: 'Opción 2'}
    ]
});

// SELECT con scroll infinito automático (50+ opciones)
createInput({
    containerId: 'mi-select-large',
    type: 'select',
    label: 'País',
    placeholder: 'Selecciona un país...',
    selectOptions: generateLargeOptionsList() // 50+ opciones
    // Scroll infinito se activa automáticamente con loading visual
});

// VALIDACIÓN MANUAL (obligatoria)
const emailInput = createInput({
    containerId: 'mi-email',
    type: 'email',
    placeholder: 'correo@ejemplo.com',
    value: 'email-invalido'
});

// Agregar validación manual
setTimeout(() => {
    const input = document.querySelector('#mi-email input');
    if (input) {
        input.addEventListener('input', function() {
            const value = this.value;
            if (value.includes('@') && value.includes('.')) {
                this.style.borderColor = 'var(--ubits-border-1)';
                this.style.borderWidth = '1px';
            } else if (value.length > 0) {
                this.style.borderColor = 'red';
                this.style.borderWidth = '2px';
            } else {
                this.style.borderColor = 'var(--ubits-border-1)';
                this.style.borderWidth = '1px';
            }
        });
    }
}, 500);

// TEXTAREA multilínea
createInput({
    containerId: 'mi-textarea',
    type: 'textarea',
    label: 'Comentario',
    placeholder: 'Escribe tu comentario aquí...'
});

// SEARCH con limpiar
createInput({
    containerId: 'mi-search',
    type: 'search',
    label: 'Búsqueda',
    placeholder: 'Buscar...'
});

// AUTOCOMPLETE con sugerencias
createInput({
    containerId: 'mi-autocomplete',
    type: 'autocomplete',
    label: 'Lenguaje',
    placeholder: 'Escribe un lenguaje...',
    autocompleteOptions: [
        {value: '1', text: 'JavaScript'},
        {value: '2', text: 'TypeScript'}
    ]
});

// CALENDAR con date picker
createInput({
    containerId: 'mi-calendar',
    type: 'calendar',
    label: 'Fecha de nacimiento',
    placeholder: 'Selecciona una fecha...'
});

// PASSWORD con toggle mostrar/ocultar
createInput({
    containerId: 'mi-password',
    type: 'password',
    label: 'Contraseña',
    placeholder: 'Ingresa tu contraseña...'
});
```

### **Características:**
- **Tamaños**: sm (32px), md (40px), lg (48px) - iguales a botones UBITS
- **Estados**: default, hover, focus, active, invalid, disabled
- **Iconos**: FontAwesome con posicionamiento absoluto, padding automático
- **Contador**: Caracteres automático (independiente del helper text)
- **Mandatory**: Texto obligatorio/opcional
- **Tipos**: text, email, password, number, tel, url, select, textarea, search, autocomplete, calendar
- **Scroll Infinito**: SELECT con carga automática para listas largas (50+ opciones)
- **Validación Manual**: Implementación obligatoria para email, teléfono y URL
- **Callbacks**: onChange, onFocus, onBlur
- **Métodos**: getValue(), setValue(), focus(), blur(), disable(), enable(), setState()

## 🍞 Componente Toast - Guía rápida

### **¿Qué es Toast?**
Notificaciones flotantes que aparecen arriba, al centro de la pantalla y se cierran automáticamente.

### **Cómo implementar:**

#### **1. Importar archivos necesarios:**
```html
<link rel="stylesheet" href="ubits-colors.css">
<link rel="stylesheet" href="fontawesome-icons.css">
<link rel="stylesheet" href="components/toast.css">
<script src="components/toast.js"></script>
```

#### **2. Crear contenedor:**
```html
<div id="ubits-toast-container"></div>
```

#### **3. Usar la función:**
```javascript
// Toast básico
showToast('success', '¡Operación exitosa!');

// Toast con opciones
showToast('info', 'Ya estás en la documentación 😆', {
    containerId: 'ubits-toast-container',
    duration: 3500,
    noClose: false
});
```

#### **4. Tipos disponibles:**
- `success` - Verde (3.5s)
- `info` - Azul (3.5s) 
- `warning` - Amarillo (5s)
- `error` - Rojo (6.5s)

#### **5. Características:**
- ✅ **Auto-cierre** - Se cierran solos después del tiempo especificado
- ✅ **Pausa en hover** - Se pausan si pasas el cursor por encima
- ✅ **Apilado** - Máximo 3 toasts visibles a la vez
- ✅ **Accesible** - Roles ARIA y navegación por teclado

## 📄 Licencia

Este proyecto está bajo la licencia MIT incluida en el archivo `LICENSE`.

---

**¡Listo para crear interfaces UBITS increíbles! 🚀**