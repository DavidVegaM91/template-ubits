# CURSOR RULES - TEMPLATE UBITS

## 🎯 ESTRUCTURA MODULAR (NUEVO SISTEMA)

### **IMPORTANTE: TODAS LAS PÁGINAS USAN ESTRUCTURA MODULAR**
Todas las páginas del template (excepto documentación) ahora usan un sistema modular de secciones y widgets inspirado en `profile.html`.

### **SISTEMA DE SECCIONES:**
```html
<div class="content-sections">
    <!-- Sección de 1 columna -->
    <div class="section-single">
        <div class="widget-nombre">
            <p class="ubits-body-md-regular">Nombre del widget</p>
            <br><br><br> <!-- Ajustar altura según necesidad -->
        </div>
    </div>
    
    <!-- Sección de 2 columnas -->
    <div class="section-dual">
        <div class="widget-nombre1">
            <p class="ubits-body-md-regular">Widget 1</p>
            <br><br><br><br><br>
        </div>
        <div class="widget-nombre2">
            <p class="ubits-body-md-regular">Widget 2</p>
            <br><br><br><br><br>
        </div>
    </div>
    
    <!-- Sección de 3 columnas -->
    <div class="section-triple">
        <div class="widget-a">...</div>
        <div class="widget-b">...</div>
        <div class="widget-c">...</div>
    </div>
    
    <!-- Sección de 4 columnas -->
    <div class="section-quad">
        <div class="widget-a">...</div>
        <div class="widget-b">...</div>
        <div class="widget-c">...</div>
        <div class="widget-d">...</div>
    </div>
</div>
```

### **PROMPTS PARA PERSONALIZACIÓN:**

#### **Añadir secciones:**
- "Añade una section-dual con widget-estadisticas y widget-progreso después de Banner principal"
- "Añade una section-single llamada widget-anuncios con 8 br de altura al final"

#### **Modificar secciones:**
- "Cambia el nombre del widget-contenido a 'Dashboard principal'"
- "Añade 5 br al widget-banner para hacerlo más alto"
- "Quita 3 br al widget-busqueda para hacerlo más compacto"

#### **Reemplazar secciones:**
- "Reemplaza la section-single de 'Banner' por una section-dual con widget-hero y widget-stats"

#### **Eliminar secciones:**
- "Elimina la sección de 'Aliados destacados'"
- "Elimina todas las secciones que están debajo de 'Contenido principal'"

### **CARACTERÍSTICAS DEL SISTEMA:**
- **Sin altura mínima forzada**: Los widgets se adaptan a su contenido
- **Responsive**: Las secciones multi-columna se apilan en móvil
- **Espaciados consistentes**: 16px entre secciones, 20px entre columnas
- **Paddings**: 16px desktop, 12px mobile
- **Sin elevaciones**: Diseño plano sin box-shadow

### **ARCHIVOS CON ESTRUCTURA MODULAR:**
- `home-learn.html` - 9 secciones variadas (ejemplo completo)
- `catalogo.html` - 2 secciones básicas
- `u-corporativa.html` - 3 secciones específicas
- `zona-estudio.html` - 2 secciones con tabs
- `diagnostico.html` - 1 sección enfocada
- `evaluaciones-360.html` - 1 sección específica
- `objetivos.html` - 1 sección específica
- `metricas.html` - 1 sección específica
- `reportes.html` - 1 sección específica
- `encuestas.html` - 1 sección específica
- `reclutamiento.html` - 1 sección específica
- `planes.html` - 1 sección específica
- `tareas.html` - 1 sección específica
- `index.html` - 1 sección básica
- `plantilla-ubits.html` - 1 sección base (template)

### **EJEMPLO DE PERSONALIZACIÓN EXITOSA:**
El líder Kike Peña personalizó `profile.html` fácilmente:
- Añadió sección "Aliados principales" entre "Información personal" y "Aprendizaje"
- Llenó el sidebar derecho con 3 banners con imagen, título y botón compartir
- Cursor entendió perfectamente y cumplió sus deseos

### **VENTAJAS DEL SISTEMA:**
1. **Fácil de entender**: Nombres semánticos claros
2. **Flexible**: Cualquier combinación de columnas y alturas
3. **Reutilizable**: Widgets se pueden usar en cualquier página
4. **Escalable**: Fácil añadir nuevos tipos de secciones
5. **Consistente**: Misma experiencia en todas las páginas

### **REGLAS IMPORTANTES:**
- **SIEMPRE** usar `content-sections` como contenedor principal
- **SIEMPRE** usar nombres descriptivos para widgets (widget-dashboard, widget-stats, etc.)
- **NUNCA** usar alturas mínimas forzadas
- **SIEMPRE** mantener tokens UBITS y navegación correcta
- **SIEMPRE** verificar responsive y modo oscuro
