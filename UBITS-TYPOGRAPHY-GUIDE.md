# 🎨 Sistema de Tipografía UBITS

## 📋 Descripción
Sistema de tipografía oficial de UBITS basado en Figma, con Noto Sans como fuente principal y colores personalizables.

## 🎯 Características
- **Fuente**: Noto Sans
- **Color por defecto**: `#303a47` (gris azulado oscuro)
- **Colores personalizables**: Claro, oscuro, blanco
- **Responsive**: Ajustes automáticos para móviles
- **Modo oscuro**: Colores adaptados automáticamente

## 📱 DISPLAY STYLES (Títulos grandes)

### Display/d1 (40px)
```html
<h1 class="ubits-display-d1-regular">Título grande regular</h1>
<h1 class="ubits-display-d1-semibold">Título grande semibold</h1>
<h1 class="ubits-display-d1-bold">Título grande bold</h1>
```

### Display/d2 (36px)
```html
<h2 class="ubits-display-d2-regular">Título mediano regular</h2>
<h2 class="ubits-display-d2-semibold">Título mediano semibold</h2>
<h2 class="ubits-display-d2-bold">Título mediano bold</h2>
```

### Display/d3 (32px)
```html
<h3 class="ubits-display-d3-regular">Título pequeño regular</h3>
<h3 class="ubits-display-d3-semibold">Título pequeño semibold</h3>
<h3 class="ubits-display-d3-bold">Título pequeño bold</h3>
```

### Display/d4 (28px)
```html
<h4 class="ubits-display-d4-regular">Título extra pequeño regular</h4>
<h4 class="ubits-display-d4-semibold">Título extra pequeño semibold</h4>
<h4 class="ubits-display-d4-bold">Título extra pequeño bold</h4>
```

## 📋 HEADING STYLES (Encabezados)

```html
<h1 class="ubits-heading-h1">Heading H1 (24px)</h1>
<h2 class="ubits-heading-h2">Heading H2 (20px)</h2>
```

## 📝 BODY STYLES (Texto de contenido)

### Body/md (16px)
```html
<p class="ubits-body-md-regular">Texto regular mediano</p>
<p class="ubits-body-md-semibold">Texto semibold mediano</p>
<p class="ubits-body-md-bold">Texto bold mediano</p>
```

### Body/sm (13px)
```html
<p class="ubits-body-sm-regular">Texto regular pequeño</p>
<p class="ubits-body-sm-semibold">Texto semibold pequeño</p>
<p class="ubits-body-sm-bold">Texto bold pequeño</p>
```

### Body/xs (11px)
```html
<span class="ubits-body-xs-regular">Texto regular extra pequeño</span>
<span class="ubits-body-xs-semibold">Texto semibold extra pequeño</span>
<span class="ubits-body-xs-bold">Texto bold extra pequeño</span>
```

## 🎨 VARIANTES DE COLOR

### Colores predefinidos
```html
<!-- Color por defecto (#303a47) -->
<p class="ubits-body-md-regular">Texto normal</p>

<!-- Color claro (#6b7280) -->
<p class="ubits-body-md-regular ubits-text-light">Texto claro</p>

<!-- Color oscuro (#1f2937) -->
<p class="ubits-body-md-regular ubits-text-dark">Texto oscuro</p>

<!-- Color blanco (#ffffff) -->
<p class="ubits-body-md-regular ubits-text-white">Texto blanco</p>
```

### Color personalizado
```html
<!-- Para usar un color específico -->
<p class="ubits-body-md-regular" style="color: #ff0000;">Texto rojo personalizado</p>
```

## 🔧 UTILIDADES ADICIONALES

### Cambiar peso de fuente
```html
<p class="ubits-body-md-regular ubits-weight-bold">Texto que se vuelve bold</p>
<p class="ubits-display-d1-regular ubits-weight-semibold">Display que se vuelve semibold</p>
```

### Cambiar tamaño
```html
<p class="ubits-body-md-regular ubits-size-d4">Texto que se vuelve tamaño d4</p>
<span class="ubits-body-sm-regular ubits-size-h1">Texto pequeño que se vuelve h1</span>
```

## 🌙 MODO OSCURO

El sistema se adapta automáticamente al modo oscuro:
```html
<body data-theme="dark">
    <p class="ubits-body-md-regular">Este texto será claro en modo oscuro</p>
</body>
```

## 📱 RESPONSIVE

Los estilos se ajustan automáticamente en pantallas pequeñas:
- Display/d1: 40px → 32px
- Display/d2: 36px → 28px
- Display/d3: 32px → 24px
- Display/d4: 28px → 20px

## 🎯 EJEMPLOS DE USO

### Tarjeta de perfil
```html
<div class="profile-card">
    <h1 class="ubits-display-d2-bold">Juan Pérez</h1>
    <p class="ubits-body-md-regular ubits-text-light">Desarrollador Frontend</p>
    <p class="ubits-body-sm-regular">Experiencia: 5 años</p>
</div>
```

### Dashboard
```html
<div class="dashboard">
    <h1 class="ubits-display-d1-semibold">Mi Dashboard</h1>
    <h2 class="ubits-heading-h2">Estadísticas</h2>
    <p class="ubits-body-md-regular">Aquí puedes ver tus métricas...</p>
    <span class="ubits-body-xs-regular ubits-text-light">Última actualización: hoy</span>
</div>
```

## 🔄 MIGRACIÓN

Para migrar texto existente:
1. Reemplaza las clases de texto existentes
2. Usa las nuevas clases UBITS
3. Ajusta colores si es necesario
4. Prueba en modo oscuro

## 📝 NOTAS

- Todas las clases usan `!important` para sobrescribir estilos existentes
- El color por defecto se puede cambiar modificando `--ubits-text-color`
- Los estilos son compatibles con el sistema existente
- Se incluye soporte completo para modo oscuro
