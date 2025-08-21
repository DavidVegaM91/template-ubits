# 🚀 Template UBITS - Dashboard Profesional

Un template completo y reutilizable para crear dashboards empresariales con sidebar responsive y navegación superior.

## ✨ Características

- **🎨 Diseño Figma**: Replica exactamente el diseño de UBITS
- **📱 Responsive**: Se adapta a cualquier tamaño de pantalla
- **🌙 Modo Oscuro**: Toggle completo con persistencia
- **🎯 Estados de Botones**: Default, Hover, Active, Focus, Pressed
- **🔧 Configurable**: Fácil personalización de colores y estilos
- **📚 FontAwesome 6 Pro**: Iconos profesionales incluidos
- **🎭 Tooltips**: Información contextual en hover

## 🚀 Instalación

1. **Clona el repositorio:**
```bash
git clone https://github.com/tu-usuario/template-ubits.git
cd template-ubits
```

2. **Abre en tu navegador:**
```bash
# Opción 1: Doble clic en index.html
# Opción 2: Servidor local
python -m http.server 8000
# Opción 3: Live Server (VS Code)
```

## 🎨 Personalización

### **Colores Principales:**
```javascript
// En config.js
colors: {
    primary: '#0c5bef',      // Azul principal
    secondary: '#5c646f',    // Gris secundario
    background: '#f3f3f4',   // Fondo principal
    white: '#ffffff',        // Superficies blancas
    dark: '#202837',         // Sidebar
    lightGray: '#98a6b3',    // Gris claro
    border: '#d0d2d5'        // Bordes
}
```

### **Navegación del Sidebar:**
```html
<!-- En index.html -->
<button class="nav-button" data-section="tu-seccion" data-tooltip="Tu Sección">
    <i class="far fa-tu-icono"></i>
</button>
```

### **Tabs Superiores:**
```html
<button class="nav-tab" data-tab="tu-tab">
    <i class="far fa-tu-icono"></i>
    <span>Tu Tab</span>
</button>
```

### **Contenido Personalizado:**
Para personalizar el contenido de cada sección, modifica la función `getCustomContent()` en `script.js`:

```javascript
function getCustomContent(section) {
    if (section === 'aprendizaje') {
        return `
            <div class="my-custom-content">
                <h2>Mi Dashboard Personalizado</h2>
                <div class="my-cards">
                    <div class="card">Mi Card 1</div>
                    <div class="card">Mi Card 2</div>
                </div>
            </div>
        `;
    }
    
    return null; // null = usar contenido por defecto
}
```

**Ver ejemplo completo en:** `examples/custom-content-example.js`

## 🔧 Funciones Disponibles

### **Exportar Configuración:**
```javascript
// En consola del navegador
exportConfig()
```

### **Personalizar Colores:**
```javascript
// En consola del navegador
customizeColors('#tu-color', '#tu-color-secundario')
```

### **Modo Oscuro:**
- Click en el botón luna del sidebar
- Se guarda automáticamente en localStorage
- Cambia todos los colores de la plataforma

## 📱 Responsive Breakpoints

- **Desktop**: > 768px (96px sidebar)
- **Mobile**: ≤ 768px (80px sidebar)
- **Baja altura**: ≤ 600px (padding reducido)

## 🎯 Estados de Botones

- **Default**: Estado normal
- **Hover**: Mouse encima
- **Active**: Seleccionado
- **Focus**: Navegación por teclado
- **Pressed**: Mouse presionado
- **Disabled**: Deshabilitado

## 🎨 Iconos Disponibles

### **Navegación Principal:**
- `fa-graduation-cap` - Aprendizaje
- `fa-chart-mixed` - Diagnóstico
- `fa-bars-progress` - Desempeño
- `fa-clipboard-list-check` - Encuestas
- `fa-users` - Reclutamiento
- `fa-layer-group` - Tareas

### **Footer:**
- `fa-user` - Perfil
- `fa-moon` - Modo oscuro

## 📁 Estructura de Archivos

```
├── index.html              # Estructura HTML principal
├── styles.css              # Estilos CSS completos
├── script.js               # Funcionalidad JavaScript
├── config.js               # Configuración centralizada
├── fontawesome-icons.css   # Definiciones de iconos
├── Fonts/                  # Fuentes FontAwesome locales
│   ├── Font Awesome 6 Pro-Thin.otf
│   ├── Font Awesome 6 Pro-Light.otf
│   ├── Font Awesome 6 Pro-Regular.otf
│   ├── Font Awesome 6 Pro-Solid.otf
│   └── Font Awesome 6 Pro-Brands.otf
├── images/                 # Imágenes del proyecto
│   └── Ubits-logo.svg     # Logo UBITS
└── README.md               # Esta documentación
```

## 🚀 Casos de Uso

### **Para Desarrolladores:**
- Base para dashboards empresariales
- Template de administración
- Panel de control de aplicaciones
- Sistema de gestión de usuarios

### **Para Diseñadores:**
- Referencia de componentes UI
- Sistema de diseño consistente
- Guía de espaciados y colores
- Patrones de navegación

## 🔧 Desarrollo

### **Agregar Nueva Sección:**
1. Agregar botón en sidebar con `data-section="nueva-seccion"`
2. Crear contenido en `updateContentArea()`
3. Personalizar estilos si es necesario

### **Modificar Colores:**
1. Editar variables en `config.js`
2. O usar `customizeColors()` en consola
3. Los cambios se aplican en tiempo real

### **Agregar Iconos:**
1. Verificar disponibilidad en `fontawesome-icons.css`
2. Usar clase `far fa-nombre-del-icono`
3. Tamaño recomendado: 16px

## 📚 Recursos

- [FontAwesome 6 Pro](https://fontawesome.com/pro) - Iconos profesionales
- [Noto Sans](https://fonts.google.com/specimen/Noto+Sans) - Tipografía
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS (opcional)

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 👥 Equipo

- **Desarrollo**: Tu Equipo
- **Diseño**: UBITS
- **Template**: Dashboard Profesional

## 📞 Soporte

- **Issues**: [GitHub Issues](https://github.com/tu-usuario/template-ubits/issues)
- **Documentación**: [Wiki del Repo](https://github.com/tu-usuario/template-ubits/wiki)
- **Contacto**: tu-email@empresa.com

---

**¡Construye algo increíble con este template! 🚀**

*Hecho con ❤️ por el equipo de UBITS*
