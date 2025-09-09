# 🎯 UBITS Design System Template

> **Plantilla completa para crear interfaces UBITS con Cursor AI**

## 🚀 ¿Qué es esto?

Una plantilla completa que permite a **Product Managers**, **Diseñadores** y **Desarrolladores** crear nuevas interfaces UBITS usando **Cursor AI** con la garantía de que mantendrán el estilo y funcionalidad correctos.

## 📁 Estructura del Proyecto

```
Template UBITS/
├── 📄 index.html              # Dashboard principal
├── 📄 profile.html            # Página de perfil (vacía)
├── 📄 profile-demo.html       # Página de perfil para demos
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
└── 📝 UBITS-TYPOGRAPHY-GUIDE.md      # Guía de tipografía
```

## 🎨 Componentes Disponibles

### **Páginas Listas para Usar:**
- **`index.html`** - Dashboard principal con sidebar y navegación
- **`profile.html`** - Página de perfil con widgets vacíos
- **`profile-demo.html`** - Página de perfil para demostraciones

### **Sistema de Diseño:**
- **Tipografía UBITS** - Clases predefinidas para todos los textos
- **Iconos FontAwesome** - Catálogo completo con búsqueda
- **Widgets Flexibles** - Se adaptan automáticamente al contenido
- **Modo Oscuro** - Soporte completo para tema oscuro

## 🛠️ Cómo Usar con Cursor AI

### **1. Para Product Managers:**
```bash
# Abre Cursor en esta carpeta
# Usa el prompt:
"Llena el widget de [nombre] en profile-demo.html con [tu contenido]"
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
- Altura mínima garantizada
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
    <button class="ubits-button">Ver Detalles</button>
</div>
```

### **Agregar una Imagen:**
```html
<div class="widget-learn">
    <img src="images/mi-imagen.jpg" alt="Curso" style="width: 100%; border-radius: 8px;">
    <h3 class="ubits-h3">Nuevo Curso</h3>
</div>
```

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
- **Ejemplos:** Usa `profile-demo.html` como referencia
- **Iconos:** Consulta `iconos-ubits-fontawesome.html`
- **Estilos:** Revisa `ubits-typography.css`

## 📄 Licencia

Este proyecto está bajo la licencia incluida en el archivo `LICENSE`.

---

**¡Listo para crear interfaces UBITS increíbles! 🚀**