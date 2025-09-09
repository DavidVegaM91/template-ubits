# 🎯 UBITS Design System Template

> **Plantilla completa para crear interfaces UBITS con Cursor AI**

## 🚀 ¿Qué es esto?

Una plantilla completa que permite a **Product Managers**, **Diseñadores** y **Desarrolladores** crear nuevas interfaces UBITS usando **Cursor AI** con la garantía de que mantendrán el estilo y funcionalidad correctos.

## 📁 Estructura del Proyecto

```
Template UBITS/
├── 📄 index.html              # Dashboard principal
├── 📄 profile.html            # Página de perfil (vacía)
├── 🎨 styles.css              # Estilos del dashboard principal
├── 🎨 profile.css             # Estilos de la página de perfil
├── 🎨 ubits-typography.css    # Sistema de tipografía UBITS
├── 🎨 fontawesome-icons.css   # Iconos FontAwesome
├── ⚙️ script.js               # Funcionalidad JavaScript
├── 🖼️ images/                 # Recursos visuales
│   ├── Ubits-logo.svg
│   ├── Profile-image.jpg
│   ├── cards-learn/
│   └── empty-states/
├── 📚 Fonts/                  # Fuentes FontAwesome
├── 📖 iconos-ubits-fontawesome.html  # Catálogo de iconos
├── 📋 WIDGET-GUIDE.md         # Guía para llenar widgets
├── 📝 UBITS-TYPOGRAPHY-GUIDE.md      # Guía de tipografía
└── 📄 LICENSE                 # Licencia MIT
```

## 🎨 Componentes Disponibles

### **Páginas Listas para Usar:**
- **`index.html`** - Dashboard principal con sidebar y navegación
- **`profile.html`** - Página de perfil con widgets vacíos

### **Sistema de Diseño:**
- **Tipografía UBITS** - Clases predefinidas para todos los textos
- **Iconos FontAwesome** - Catálogo completo con búsqueda
- **Widgets Flexibles** - Se adaptan automáticamente al contenido
- **Modo Oscuro** - Soporte completo para tema oscuro

## 🤖 Instrucciones para Cursor AI

### **📋 Reglas Importantes**

#### ✅ **SIEMPRE Hacer:**
1. **Usar las clases CSS existentes** - No crear estilos nuevos innecesariamente
2. **Mantener la estructura de widgets** - Respetar las clases `.widget-[nombre]`
3. **Usar la tipografía UBITS** - Aplicar clases como `ubits-h3`, `ubits-body-md-regular`
4. **Probar en `profile.html`** - Usar este archivo como referencia
5. **Mantener el padding de 16px** - No cambiar el espaciado interno
6. **Usar `box-sizing: border-box`** - Para cálculos correctos de tamaño

#### ❌ **NUNCA Hacer:**
1. **Cambiar las clases principales** - No modificar `.widget-[nombre]`
2. **Usar `position: absolute`** - A menos que sea absolutamente necesario
3. **Romper el layout flex** - Mantener `display: flex` y `flex-direction: column`
4. **Cambiar colores base** - Usar los colores oficiales de UBITS
5. **Eliminar `overflow: hidden`** - Es crucial para el control de contenido

## 🎨 Sistema de Clases

### **Widgets Principales:**
```css
.widget-user-info     /* Información Personal */
.widget-org          /* Organización */
.widget-learn        /* Aprendizaje */
.widget-objectives   /* Objetivos */
.widget-surveys      /* Encuestas */
.widget-assessments  /* Assessments */
.widget-evaluations  /* Evaluaciones */
.right-sidebar-fixed /* Sidebar Derecho */
```

### **Tipografía UBITS:**
```css
ubits-h1, ubits-h2, ubits-h3     /* Títulos */
ubits-body-md-regular            /* Texto normal */
ubits-body-sm-regular            /* Texto pequeño */
ubits-body-xs-regular            /* Texto muy pequeño */
```

### **Colores Oficiales:**
```css
#303a47  /* Texto principal */
#0a243f  /* Texto oscuro */
#62717e  /* Texto secundario */
#febe24  /* Amarillo UBITS */
#6b7b8a  /* Gris medio */
```

## 🛠️ Cómo Usar con Cursor AI

### **1. Para Product Managers:**
```bash
# Abre Cursor en esta carpeta
# Usa el prompt:
"Llena el widget de [nombre] en profile.html con [tu contenido]"
```

### **2. Para Diseñadores:**
```bash
# Consulta los estilos disponibles:
# - Abre UBITS-TYPOGRAPHY-GUIDE.md
# - Abre iconos-ubits-fontawesome.html
# - Usa las clases predefinidas
```

### **3. Para Desarrolladores:**
```bash
# Personaliza los estilos:
# - Modifica profile.css para nuevos widgets
# - Usa ubits-typography.css para textos
# - Agrega funcionalidad en script.js
```

## 📋 Widgets Disponibles

| Widget | Clase CSS | Descripción |
|--------|-----------|-------------|
| **Información Personal** | `.widget-user-info` | Datos del usuario |
| **Organización** | `.widget-org` | Información de la empresa |
| **Aprendizaje** | `.widget-learn` | Contenido educativo |
| **Objetivos** | `.widget-objectives` | Metas y objetivos |
| **Encuestas** | `.widget-surveys` | Formularios y encuestas |
| **Assessments** | `.widget-assessments` | Evaluaciones |
| **Evaluaciones** | `.widget-evaluations` | Resultados |
| **Sidebar Derecho** | `.right-sidebar-fixed` | Panel lateral |

## 🎯 Características Principales

### ✅ **Robusto y Flexible:**
- Los widgets se adaptan automáticamente al contenido
- No se rompe sin importar qué pongas dentro
- Altura mínima garantizada con `<br>` tags
- Overflow controlado

### ✅ **Mantiene el Estilo UBITS:**
- Colores oficiales de UBITS
- Tipografía consistente
- Espaciado correcto
- Bordes y sombras apropiados

### ✅ **Fácil de Personalizar:**
- Clases CSS claras y descriptivas
- Documentación completa
- Ejemplos de código
- Guías paso a paso

## 🚀 Ejemplos de Uso

### **Llenar un Widget Simple:**
```html
<div class="widget-objectives">
    <h3 class="ubits-h3">Mis Objetivos</h3>
    <p class="ubits-body-md-regular">Completar el curso de liderazgo</p>
    <button class="btn-secondary">Ver Detalles</button>
</div>
```

### **Agregar una Imagen:**
```html
<div class="widget-learn">
    <img src="images/cards-learn/image-course.jpg" 
         alt="Curso" 
         style="width: 100%; height: 162px; object-fit: cover; border-radius: 10px;">
    <h3 class="ubits-h3">Nuevo Curso</h3>
</div>
```

### **Agregar un Botón:**
```html
<button class="btn-secondary">
    Ver más
    <i class="fas fa-arrow-up-right" style="margin-left: 8px;"></i>
</button>
```

## 🎯 Ejemplos de Prompts para Cursor

### **Llenar un Widget:**
```
"Llena el widget de objetivos en profile.html con una lista de 3 objetivos usando las clases UBITS"
```

### **Agregar una Imagen:**
```
"Agrega una imagen del curso en el widget de aprendizaje de profile.html usando la imagen de cards-learn"
```

### **Crear un Botón:**
```
"Agrega un botón 'Ver más' en el widget de encuestas de profile.html con el estilo UBITS"
```

## 🚨 Solución de Problemas

### **Si un widget se ve mal:**
1. Verificar que tiene `display: flex` y `flex-direction: column`
2. Asegurar que tiene `padding: 16px`
3. Confirmar que tiene `box-sizing: border-box`
4. Revisar que no hay `height` fija, solo `<br>` tags para espacio

### **Si el contenido se sale:**
1. Agregar `overflow: hidden` al widget
2. Verificar que las imágenes tienen `width: 100%`
3. Asegurar que el texto no es demasiado largo

### **Si los colores no coinciden:**
1. Usar las clases de tipografía UBITS
2. Verificar que estás usando los colores oficiales
3. Revisar el archivo `ubits-typography.css`

## 📚 Documentación

- **`WIDGET-GUIDE.md`** - Guía completa para llenar widgets
- **`UBITS-TYPOGRAPHY-GUIDE.md`** - Sistema de tipografía
- **`iconos-ubits-fontawesome.html`** - Catálogo de iconos

## 🎨 Personalización Avanzada

### **Agregar Nuevos Widgets:**
1. Crea el HTML en `profile.html`
2. Agrega los estilos en `profile.css`
3. Sigue el patrón de los widgets existentes

### **Modificar Colores:**
1. Busca las variables CSS en `profile.css`
2. Cambia los valores de color
3. Aplica a todos los widgets

### **Agregar Funcionalidad:**
1. Modifica `script.js`
2. Agrega event listeners
3. Mantén la compatibilidad con el sistema

## 🤝 Soporte

- **Documentación:** Revisa las guías incluidas
- **Ejemplos:** Usa `profile.html` como referencia
- **Iconos:** Consulta `iconos-ubits-fontawesome.html`
- **Estilos:** Revisa `ubits-typography.css`

## 📄 Licencia

Este proyecto está bajo la licencia MIT incluida en el archivo `LICENSE`.

---

**¡Listo para crear interfaces UBITS increíbles! 🚀**