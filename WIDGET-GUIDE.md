# 🎯 Guía para Product Managers - Widgets UBITS

## 📋 Cómo llenar los widgets correctamente

### ✅ **Reglas generales para TODOS los widgets:**

1. **Siempre usar la estructura de contenedor:**
   ```html
   <div class="widget-[nombre]">
       <!-- Tu contenido aquí -->
   </div>
   ```

2. **Sistema de estados automático:**
   - ✅ **Estado vacío:** Altura fija (207px o 392px) con contenido centrado
   - ✅ **Estado lleno:** Se adapta automáticamente al contenido
   - ✅ **Transición suave** entre estados
   - ✅ **Detección automática** de contenido real

3. **Los widgets se adaptan automáticamente al contenido:**
   - ✅ Altura mínima garantizada
   - ✅ Padding interno de 16px
   - ✅ Overflow controlado
   - ✅ Box-sizing correcto

3. **Tipografía recomendada:**
   - Títulos: `ubits-h2` o `ubits-h3`
   - Texto normal: `ubits-body-md-regular`
   - Texto pequeño: `ubits-body-sm-regular`

### 🎨 **Widgets disponibles:**

#### 1. **Información Personal** (`.widget-user-info`)
```html
<div class="widget-user-info">
    <h3 class="ubits-h3">Datos del Usuario</h3>
    <p class="ubits-body-md-regular">Nombre: Juan Pérez</p>
    <p class="ubits-body-md-regular">Email: juan@empresa.com</p>
    <!-- Más contenido... -->
</div>
```

#### 2. **Organización** (`.widget-org`)
```html
<div class="widget-org">
    <h3 class="ubits-h3">Mi Empresa</h3>
    <p class="ubits-body-md-regular">Departamento: Marketing</p>
    <!-- Más contenido... -->
</div>
```

#### 3. **Aprendizaje** (`.widget-learn`)
```html
<div class="widget-learn">
    <h2 class="ubits-h2">¿Qué quieres aprender hoy?</h2>
    <!-- Tu contenido de aprendizaje aquí -->
</div>
```

#### 4. **Objetivos** (`.widget-objectives`)
```html
<div class="widget-objectives">
    <h3 class="ubits-h3">Mis Objetivos</h3>
    <ul class="ubits-body-md-regular">
        <li>Objetivo 1</li>
        <li>Objetivo 2</li>
    </ul>
</div>
```

#### 5. **Encuestas** (`.widget-surveys`)
```html
<div class="widget-surveys">
    <h3 class="ubits-h3">Encuestas Pendientes</h3>
    <!-- Contenido de encuestas -->
</div>
```

#### 6. **Assessments** (`.widget-assessments`)
```html
<div class="widget-assessments">
    <h3 class="ubits-h3">Evaluaciones</h3>
    <!-- Contenido de assessments -->
</div>
```

#### 7. **Evaluaciones** (`.widget-evaluations`)
```html
<div class="widget-evaluations">
    <h3 class="ubits-h3">Resultados</h3>
    <!-- Contenido de evaluaciones -->
</div>
```

#### 8. **Sidebar Derecho** (`.right-sidebar-fixed`)
```html
<div class="right-sidebar-fixed">
    <h3 class="ubits-h3">Panel Lateral</h3>
    <!-- Contenido del sidebar -->
</div>
```

### 🚀 **Ejemplos de contenido que funciona bien:**

#### **Imágenes:**
```html
<div class="widget-learn">
    <img src="images/mi-imagen.jpg" alt="Descripción" style="width: 100%; max-width: 100%; height: auto; border-radius: 8px;">
    <h3 class="ubits-h3">Título de la imagen</h3>
</div>
```

#### **Botones:**
```html
<div class="widget-objectives">
    <h3 class="ubits-h3">Acciones</h3>
    <button style="background: #febe24; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer;">
        Mi Botón
    </button>
</div>
```

#### **Listas:**
```html
<div class="widget-surveys">
    <h3 class="ubits-h3">Lista de Tareas</h3>
    <ul style="list-style: none; padding: 0;">
        <li style="padding: 8px 0; border-bottom: 1px solid #e3e6ea;">✓ Tarea completada</li>
        <li style="padding: 8px 0; border-bottom: 1px solid #e3e6ea;">○ Tarea pendiente</li>
    </ul>
</div>
```

### ⚠️ **Qué NO hacer:**

- ❌ NO cambiar las clases de los contenedores principales
- ❌ NO usar `position: absolute` sin necesidad
- ❌ NO poner contenido que exceda mucho la altura mínima
- ❌ NO usar `overflow: visible` en el contenido

### ✅ **Qué SÍ hacer:**

- ✅ Usar las clases de tipografía UBITS
- ✅ Mantener el padding interno
- ✅ Usar `width: 100%` para imágenes
- ✅ Usar `box-sizing: border-box` si necesitas controlar el tamaño
- ✅ Probar el contenido en diferentes tamaños de pantalla

### 🎯 **Proceso recomendado:**

1. **Abre `profile-demo.html`**
2. **Identifica el widget que quieres llenar**
3. **Reemplaza el contenido placeholder con tu contenido**
4. **Usa las clases de tipografía UBITS**
5. **Prueba que se vea bien en diferentes tamaños**
6. **Guarda y verifica el resultado**

¡Listo! Ahora puedes llenar cualquier widget sin que se rompa el diseño. 🚀
