# 🤖 Instrucciones para Cursor AI

## 🎯 Propósito del Proyecto

Este es un **sistema de diseño UBITS** que permite crear interfaces consistentes usando **Cursor AI**. El objetivo es que cualquier PM, diseñador o desarrollador pueda personalizar widgets sin romper el diseño.

## 📋 Reglas Importantes

### ✅ **SIEMPRE Hacer:**
1. **Usar las clases CSS existentes** - No crear estilos nuevos innecesariamente
2. **Mantener la estructura de widgets** - Respetar las clases `.widget-[nombre]`
3. **Usar la tipografía UBITS** - Aplicar clases como `ubits-h3`, `ubits-body-md-regular`
4. **Probar en `profile-demo.html`** - Siempre usar este archivo para pruebas
5. **Mantener el padding de 16px** - No cambiar el espaciado interno
6. **Usar `box-sizing: border-box`** - Para cálculos correctos de tamaño

### ❌ **NUNCA Hacer:**
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

## 🛠️ Proceso de Personalización

### **1. Para Llenar Widgets:**
```html
<!-- Reemplaza el contenido placeholder -->
<div class="widget-[nombre]">
    <h3 class="ubits-h3">Tu Título</h3>
    <p class="ubits-body-md-regular">Tu contenido</p>
    <!-- Más contenido... -->
</div>
```

### **2. Para Agregar Imágenes:**
```html
<img src="images/tu-imagen.jpg" 
     alt="Descripción" 
     style="width: 100%; max-width: 100%; height: auto; border-radius: 8px;">
```

### **3. Para Agregar Botones:**
```html
<button style="background: #febe24; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer;">
    Mi Botón
</button>
```

## 📁 Archivos Importantes

- **`profile-demo.html`** - Usar para todas las pruebas
- **`profile.css`** - Estilos principales (NO modificar sin necesidad)
- **`ubits-typography.css`** - Sistema de tipografía
- **`WIDGET-GUIDE.md`** - Guía completa de widgets
- **`iconos-ubits-fontawesome.html`** - Catálogo de iconos

## 🚨 Solución de Problemas

### **Si un widget se ve mal:**
1. Verificar que tiene `display: flex` y `flex-direction: column`
2. Asegurar que tiene `padding: 16px`
3. Confirmar que tiene `box-sizing: border-box`
4. Revisar que no hay `height` fija, solo `min-height`

### **Si el contenido se sale:**
1. Agregar `overflow: hidden` al widget
2. Verificar que las imágenes tienen `width: 100%`
3. Asegurar que el texto no es demasiado largo

### **Si los colores no coinciden:**
1. Usar las clases de tipografía UBITS
2. Verificar que estás usando los colores oficiales
3. Revisar el archivo `ubits-typography.css`

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

### **IMPORTANTE - Después de llenar cualquier widget:**
```
"Después de agregar el contenido, ejecuta en la consola: forceUpdateAllWidgets() para que el widget se expanda correctamente"
```

## 📚 Recursos Adicionales

- **Iconos:** Abre `iconos-ubits-fontawesome.html` para ver todos los iconos disponibles
- **Tipografía:** Consulta `UBITS-TYPOGRAPHY-GUIDE.md` para ver todos los estilos
- **Widgets:** Revisa `WIDGET-GUIDE.md` para ejemplos detallados

---

**¡Recuerda: Mantén la consistencia con el diseño UBITS! 🎨**
