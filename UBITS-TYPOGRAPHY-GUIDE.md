# 🎨 Sistema de Tipografía UBITS

## 📋 Descripción
Sistema de tipografía oficial de UBITS basado en Figma, con Noto Sans como fuente principal y tokens de color UBITS.

## 🎯 Características
- **Fuente**: Noto Sans
- **Colores**: Tokens UBITS (--ubits-fg-1-high, --ubits-fg-1-medium, etc.)
- **Responsive**: Ajustes automáticos para móviles
- **Modo oscuro**: Colores adaptados automáticamente
- **Consistencia**: Todas las clases usan `!important` para sobrescribir estilos existentes

## 📱 DISPLAY STYLES (Títulos grandes solo para landing-pages)

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

**CRITICAL:** Solo existen H1 y H2. Para subheadings usa `ubits-body-md-bold` o `ubits-body-sm-bold`.

## 📝 BODY STYLES (Texto de contenido)

### Body/md (16px)
```html
<p class="ubits-body-md-regular">Texto regular mediano</p>
<p class="ubits-body-md-semibold">Texto semibold mediano</p>
<p class="ubits-body-md-bold">Texto bold mediano</p>
```

### Body/lg (20px) - Solo para botones LG
```html
<p class="ubits-body-lg-semibold">Texto semibold grande (solo botones)</p>
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

### Tokens UBITS (Recomendado)
```html
<!-- Color por defecto (--ubits-fg-1-high para títulos, --ubits-fg-1-medium para texto) -->
<h1 class="ubits-heading-h1">Título (fg-1-high)</h1>
<p class="ubits-body-md-regular">Texto normal (fg-1-medium)</p>

<!-- Color claro (--ubits-fg-1-medium) -->
<p class="ubits-body-md-regular ubits-text-light">Texto claro</p>

<!-- Color oscuro (--ubits-fg-2-high) -->
<p class="ubits-body-md-regular ubits-text-dark">Texto oscuro</p>

<!-- Color blanco (--ubits-fg-bold) -->
<p class="ubits-body-md-regular ubits-text-white">Texto blanco</p>
```

### Color personalizado (Solo si es necesario)
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
<p class="ubits-body-md-regular ubits-size-d4">Texto que se vuelve tamaño d4 (28px)</p>
<span class="ubits-body-sm-regular ubits-size-h1">Texto pequeño que se vuelve h1 (24px)</span>
<span class="ubits-body-sm-regular ubits-size-h2">Texto pequeño que se vuelve h2 (20px)</span>
<span class="ubits-body-sm-regular ubits-size-md">Texto pequeño que se vuelve md (16px)</span>
<span class="ubits-body-sm-regular ubits-size-sm">Texto pequeño que se vuelve sm (13px)</span>
<span class="ubits-body-sm-regular ubits-size-xs">Texto pequeño que se vuelve xs (11px)</span>
```

## 🌙 MODO OSCURO

El sistema se adapta automáticamente al modo oscuro usando tokens UBITS:
```html
<body data-theme="dark">
    <h1 class="ubits-heading-h1">Título (--ubits-fg-1-high)</h1>
    <p class="ubits-body-md-regular">Texto normal (--ubits-fg-1-medium)</p>
</body>
```

**Los tokens de color se adaptan automáticamente:**
- `--ubits-fg-1-high` cambia según el tema
- `--ubits-fg-1-medium` cambia según el tema
- `--ubits-fg-2-high` cambia según el tema
- `--ubits-fg-bold` cambia según el tema

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
    <h1 class="ubits-heading-h1">Juan Pérez</h1>
    <p class="ubits-body-md-regular ubits-text-light">Desarrollador Frontend</p>
    <p class="ubits-body-sm-regular">Experiencia: 5 años</p>
</div>
```

### Dashboard
```html
<div class="dashboard">
    <h1 class="ubits-heading-h1">Mi Dashboard</h1>
    <h2 class="ubits-heading-h2">Estadísticas</h2>
    <p class="ubits-body-md-regular">Aquí puedes ver tus métricas...</p>
    <span class="ubits-body-xs-regular ubits-text-light">Última actualización: hoy</span>
</div>
```

### Landing Page
```html
<div class="hero-section">
    <h1 class="ubits-display-d1-bold">Bienvenido a UBITS</h1>
    <h2 class="ubits-display-d2-semibold">Plataforma de aprendizaje</h2>
    <p class="ubits-body-md-regular">Descubre cursos increíbles</p>
</div>
```

## 🔄 MIGRACIÓN

Para migrar texto existente:
1. Reemplaza las clases de texto existentes
2. Usa las nuevas clases UBITS
3. Ajusta colores usando tokens UBITS
4. Prueba en modo oscuro

## 📝 NOTAS IMPORTANTES

- **Todas las clases usan `!important`** para sobrescribir estilos existentes
- **Solo existen H1 y H2** - Para subheadings usa `ubits-body-md-bold` o `ubits-body-sm-bold`
- **Display styles** son solo para landing pages, no para interfaces de producto
- **Body/lg** es solo para botones LG, no usar en layouts
- **Los colores se adaptan automáticamente** usando tokens UBITS
- **Siempre importa** `ubits-typography.css` en tus archivos HTML

## 🚨 REGLAS CRÍTICAS

- ❌ **NUNCA uses** `<h3>`, `<h4>`, `<h5>`, `<h6>` - No existen en UBITS
- ❌ **NUNCA uses** colores hardcodeados - Usa tokens UBITS
- ❌ **NUNCA uses** Display styles en interfaces de producto
- ✅ **SIEMPRE usa** clases UBITS para todo el texto
- ✅ **SIEMPRE verifica** que las clases existan en `ubits-typography.css`
