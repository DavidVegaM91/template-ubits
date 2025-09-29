/**
 * UBITS Input Component
 * Componente de input con todas las variantes y funcionalidades
 * 
 * @author UBITS
 * @version 1.0.0
 * 
 * ========================================
 * DOCUMENTACIÓN TÉCNICA UBITS INPUT
 * ========================================
 * 
 * ## 📋 ESTRUCTURA DEL COMPONENTE
 * 
 * ### HTML Base:
 * ```html
 * <div id="mi-input-container"></div>
 * ```
 * 
 * ### CSS Requerido:
 * ```html
 * <link rel="stylesheet" href="ubits-colors.css">
 * <link rel="stylesheet" href="ubits-typography.css">
 * <link rel="stylesheet" href="fontawesome-icons.css">
 * <link rel="stylesheet" href="components/input.css">
 * ```
 * 
 * ### JavaScript Requerido:
 * ```html
 * <script src="components/input.js"></script>
 * ```
 * 
 * ## 🎯 IMPLEMENTACIÓN BÁSICA
 * 
 * ### Input Simple:
 * ```javascript
 * createInput({
 *     containerId: 'mi-input',
 *     label: 'Nombre',
 *     placeholder: 'Escribe tu nombre'
 * });
 * ```
 * 
 * ### Input con Iconos:
 * ```javascript
 * createInput({
 *     containerId: 'mi-input',
 *     label: 'Email',
 *     placeholder: 'correo@ejemplo.com',
 *     type: 'email',
 *     leftIcon: 'fa-envelope',
 *     helperText: 'Ingresa tu email válido',
 *     showHelper: true
 * });
 * ```
 * 
 * **Nota:** Los iconos usan posicionamiento absoluto con FontAwesome. 
 * El padding del input se ajusta automáticamente según los iconos presentes.
 * 
 * ## 🔧 IMPLEMENTACIÓN TÉCNICA DE ICONOS
 * 
 * ### Posicionamiento:
 * - **Left icon:** `position: absolute; left: 12px; top: 50%; transform: translateY(-50%)`
 * - **Right icon:** `position: absolute; right: 12px; top: 50%; transform: translateY(-50%)`
 * - **Input padding:** Se ajusta automáticamente (`padding-left: 32px` / `padding-right: 32px`)
 * - **Iconos:** `pointer-events: none` para evitar interferencia
 * - **Color:** `var(--ubits-fg-1-medium)` para consistencia con UBITS
 * 
 * ### Input con Contador:
 * ```javascript
 * createInput({
 *     containerId: 'mi-input',
 *     label: 'Mensaje',
 *     placeholder: 'Escribe tu mensaje',
 *     helperText: 'Máximo 100 caracteres',
 *     showHelper: true,
 *     showCounter: true,
 *     maxLength: 100
 * });
 * ```
 * 
 * ### Input solo con Contador (sin helper text):
 * ```javascript
 * createInput({
 *     containerId: 'mi-input',
 *     label: 'Comentario',
 *     placeholder: 'Escribe tu comentario',
 *     showCounter: true,
 *     maxLength: 200
 * });
 * ```
 * 
 * ### Input tipo SELECT:
 * ```javascript
 * createInput({
 *     containerId: 'mi-input',
 *     label: 'País',
 *     placeholder: 'Selecciona tu país',
 *     type: 'select',
 *     selectOptions: [
 *         {value: 'co', text: 'Colombia'},
 *         {value: 'mx', text: 'México'},
 *         {value: 'ar', text: 'Argentina'}
 *     ],
 *     value: 'co'
 * });
 * ```
 * 
 * ## 🎨 VARIANTES DISPONIBLES
 * 
 * ### Tamaños:
 * - `sm` - 32px de altura (igual a ubits-button--sm)
 * - `md` - 40px de altura (igual a ubits-button--md) - **Por defecto**
 * - `lg` - 48px de altura (igual a ubits-button--lg)
 * 
 * ### Estados:
 * - `default` - Estado normal
 * - `hover` - Borde azul sólido
 * - `focus` - Borde azul + sombra externa
 * - `active` - Borde azul + fondo ligeramente diferente
 * - `invalid` - Borde rojo + sombra roja en focus
 * - `disabled` - Fondo gris + texto deshabilitado
 * 
 * ### Tipos de Input:
 * - `text` - Texto normal
 * - `email` - Email con validación
 * - `password` - Contraseña (oculto)
 * - `number` - Números
 * - `tel` - Teléfono
 * - `url` - URL
 * - `select` - Dropdown con opciones
 * - `textarea` - Campo multilínea
 * - `search` - Input con búsqueda
 * - `autocomplete` - Input con sugerencias
 * - `calendar` - Input con date picker
 * 
 * ## 🔧 API COMPLETA
 * 
 * ### Parámetros de Configuración:
 * | Parámetro | Tipo | Por Defecto | Descripción |
 * |-----------|------|-------------|-------------|
 * | `containerId` | string | **Requerido** | ID del contenedor donde se renderizará |
 * | `label` | string | `''` | Texto del label |
 * | `placeholder` | string | `''` | Texto del placeholder |
 * | `helperText` | string | `''` | Texto de ayuda |
 * | `size` | string | `'md'` | Tamaño: 'sm', 'md', 'lg' |
 * | `state` | string | `'default'` | Estado del input |
 * | `type` | string | `'text'` | Tipo de input |
 * | `showLabel` | boolean | `true` | Mostrar/ocultar label |
 * | `showHelper` | boolean | `false` | Mostrar/ocultar helper text (independiente del contador) |
 * | `showCounter` | boolean | `false` | Mostrar/ocultar contador (independiente del helper text) |
 * | `maxLength` | number | `50` | Máximo de caracteres |
 * | `mandatory` | boolean | `false` | Mostrar texto mandatory/optional |
 * | `mandatoryType` | string | `'obligatorio'` | Tipo: 'obligatorio', 'opcional' |
 * | `leftIcon` | string | `''` | Clase FontAwesome del icono izquierdo (ej: 'fa-user', se agrega 'far' automáticamente) |
 * | `rightIcon` | string | `''` | Clase FontAwesome del icono derecho (ej: 'fa-eye', se agrega 'far' automáticamente) |
 * | `selectOptions` | array | `[]` | Opciones para SELECT (ej: [{value: '1', text: 'Opción 1'}, {value: '2', text: 'Opción 2'}]) |
 * | `value` | string | `''` | Valor inicial del input |
 * | `onChange` | function | `null` | Callback cuando cambia el valor |
 * | `onFocus` | function | `null` | Callback cuando se enfoca |
 * | `onBlur` | function | `null` | Callback cuando se desenfoca |
 * 
 * ### Métodos Disponibles:
 * | Método | Descripción | Ejemplo |
 * |--------|-------------|---------|
 * | `getValue()` | Obtener valor actual | `input.getValue()` |
 * | `setValue(newValue)` | Establecer valor | `input.setValue('Nuevo texto')` |
 * | `focus()` | Enfocar el input | `input.focus()` |
 * | `blur()` | Desenfocar el input | `input.blur()` |
 * | `disable()` | Deshabilitar input | `input.disable()` |
 * | `enable()` | Habilitar input | `input.enable()` |
 * | `setState(newState)` | Cambiar estado | `input.setState('invalid')` |
 * 
 * ## 🎨 PERSONALIZACIÓN
 * 
 * ### Colores:
 * Todos los colores usan tokens UBITS oficiales:
 * - `--ubits-fg-1-high` - Texto principal
 * - `--ubits-fg-1-medium` - Texto secundario
 * - `--ubits-fg-1-low` - Placeholder
 * - `--ubits-accent-brand` - Borde activo
 * - `--ubits-fg-error` - Estado de error
 * - `--ubits-bg-1` - Fondo del input
 * - `--ubits-bg-3` - Fondo deshabilitado
 * 
 * ### Tipografía:
 * - **Label**: `ubits-input-label` (13px, semibold)
 * - **Helper text**: `ubits-input-helper` (13px, regular)
 * - **Mandatory text**: `ubits-input-mandatory` (11px, regular)
 * - **Counter**: `ubits-input-counter` (13px, regular)
 * 
 * ## 📱 RESPONSIVE
 * 
 * El componente se adapta automáticamente:
 * - **Desktop**: Layout completo con iconos
 * - **Tablet**: Mantiene funcionalidad
 * - **Móvil**: Helper text se apila verticalmente
 * 
 * ## 🔍 TROUBLESHOOTING
 * 
 * ### Problemas Comunes:
 * 1. **Input no se renderiza**: Verificar que `containerId` existe
 * 2. **Iconos no aparecen**: Importar `fontawesome-icons.css`
 * 3. **Estilos incorrectos**: Importar `components/input.css`
 * 4. **Contador no funciona**: Verificar `showCounter: true` y `maxLength`
 * 
 * ### Debug:
 * ```javascript
 * // Verificar que el componente se creó
 * console.log(input);
 * 
 * // Verificar valor actual
 * console.log(input.getValue());
 * 
 * // Verificar estado
 * console.log(inputElement.classList);
 * ```
 * 
 * ## 🎯 TIPOS DE INPUT DISPONIBLES
 * 
 * ### **1. TEXT (Básico)**
 * - Input de texto estándar
 * - Soporta iconos izquierdo y derecho
 * - Contador de caracteres opcional
 * 
 * ### **2. EMAIL**
 * - Input de email con validación manual obligatoria
 * - Requiere implementar validación con `input.addEventListener('input', validateEmail)`
 * - Ejemplo: `correo@ejemplo.com`
 * 
 * ### **3. PASSWORD**
 * - Input de contraseña con toggle mostrar/ocultar
 * - Icono de ojo que cambia al hacer clic
 * - Validación manual recomendada
 * 
 * ### **4. NUMBER**
 * - Input numérico con validación de tipo
 * - Soporta min/max values
 * - Formato automático de números
 * 
 * ### **5. TEL (Teléfono)**
 * - Input de teléfono con validación manual obligatoria
 * - Requiere implementar validación con regex
 * - Ejemplo: `+57 300 123 4567`
 * 
 * ### **6. URL**
 * - Input de URL con validación manual obligatoria
 * - Requiere implementar validación con `new URL()`
 * - Ejemplo: `https://ejemplo.com`
 * 
 * ### **7. SELECT (Dropdown)**
 * - Dropdown personalizado con opciones
 * - **Scroll infinito automático** para 50+ opciones
 * - Loading visual durante la carga
 * - Navegación con teclado
 * 
 * ### **8. TEXTAREA**
 * - Área de texto multilínea
 * - Redimensionamiento vertical automático
 * - Soporta contador de caracteres
 * - Estados disabled correctos
 * 
 * ### **9. SEARCH**
 * - Input de búsqueda con botón limpiar (X)
 * - El botón X aparece solo al escribir
 * - Oculta controles nativos del navegador
 * - Funcionalidad de limpiar integrada
 * 
 * ### **10. AUTOCOMPLETE**
 * - Input con sugerencias automáticas
 * - Botón limpiar (X) que aparece al escribir
 * - Navegación con teclado (↑↓ Enter)
 * - Filtrado en tiempo real
 * 
 * ### **11. CALENDAR**
 * - Date picker personalizado
 * - Navegación por mes y año
 * - Selector de año para fechas antiguas
 * - Formato de fecha configurable
 * 
 * ## 🔄 SCROLL INFINITO EN SELECT
 * 
 * ### Características:
 * - **Activación automática**: Se activa con 50+ opciones
 * - **Carga progresiva**: 10 opciones por vez
 * - **Loading visual**: Spinner animado durante la carga
 * - **Scroll automático**: Detecta cuando llegas al final
 * - **Rendimiento optimizado**: Solo renderiza lo necesario
 * 
 * ## ⚠️ VALIDACIÓN MANUAL (OBLIGATORIA)
 * 
 * ### IMPORTANTE:
 * El componente Input NO incluye validación automática.
 * SIEMPRE debes implementar validación manual para email, teléfono y URL.
 * 
 * ### Ejemplo de validación manual:
 * ```javascript
 * const emailInput = createInput({
 *     containerId: 'mi-email',
 *     type: 'email',
 *     placeholder: 'correo@ejemplo.com'
 * });
 * 
 * // Agregar validación manual OBLIGATORIA
 * setTimeout(() => {
 *     const input = document.querySelector('#mi-email input');
 *     if (input) {
 *         input.addEventListener('input', function() {
 *             const value = this.value;
 *             if (value.includes('@') && value.includes('.')) {
 *                 this.style.borderColor = 'var(--ubits-border-1)';
 *                 this.style.borderWidth = '1px';
 *             } else if (value.length > 0) {
 *                 this.style.borderColor = 'var(--ubits-feedback-accent-error)';
 *                 this.style.borderWidth = '2px';
 *             } else {
 *                 this.style.borderColor = 'var(--ubits-border-1)';
 *                 this.style.borderWidth = '1px';
 *             }
 *         });
 *     }
 * }, 500);
 * ```
 * 
 * ### Reglas de validación:
 * - ✅ **SIEMPRE** implementa validación manual para email, tel, url
 * - ✅ **USA estilos inline** - `input.style.borderColor` para garantizar que funcione
 * - ✅ **Timeout de 500ms** - Para asegurar que el input esté creado
 * - ✅ **Event listener 'input'** - Para validación en tiempo real
 * - ❌ **NO existe** validación automática en el componente
 * 
 * ## 🔧 POSICIONAMIENTO DE DROPDOWN (SELECT/AUTOCOMPLETE/CALENDAR)
 * 
 * ### Problema común:
 * Los dropdowns pueden aparecer en la parte inferior de la página
 * en lugar de debajo del input.
 * 
 * ### Solución automática:
 * El JavaScript automáticamente aplica `position: relative` al contenedor
 * para que los dropdowns se posicionen correctamente.
 * 
 * ### Si usas CSS manualmente:
 * Asegúrate de que el contenedor tenga `position: relative`:
 * ```css
 * #mi-contenedor {
 *     position: relative; // OBLIGATORIO para dropdowns
 * }
 * ```
 * 
 * ### Solución: Validación manual con estilos inline
 * ```javascript
 * // Crear input normalmente
 * const emailInput = createInput({
 *     containerId: 'mi-email',
 *     type: 'email',
 *     placeholder: 'correo@ejemplo.com',
 *     value: 'email-invalido'
 * });
 * 
 * // Agregar validación manual
 * setTimeout(() => {
 *     const input = document.querySelector('#mi-email input');
 *     if (input) {
 *         input.addEventListener('input', function() {
 *             const value = this.value;
 *             if (value.includes('@') && value.includes('.')) {
 *                 // Válido: borde normal
 *                 this.style.borderColor = 'var(--ubits-border-1)';
 *                 this.style.borderWidth = '1px';
 *             } else if (value.length > 0) {
 *                 // Inválido: borde rojo
 *                 this.style.borderColor = 'red';
 *                 this.style.borderWidth = '2px';
 *             } else {
 *                 // Vacío: borde normal
 *                 this.style.borderColor = 'var(--ubits-border-1)';
 *                 this.style.borderWidth = '1px';
 *             }
 *         });
 *     }
 * }, 500);
 * ```
 * 
 * ### Ventajas de la validación manual:
 * - **Funciona siempre**: No depende de la validación automática
 * - **Control total**: Puedes definir tus propias reglas
 * - **Estilos directos**: Usa estilos inline para garantizar que se apliquen
 * - **Fácil de debuggear**: Lógica simple y visible
 * 
 * ### Cuándo usar:
 * - **SIEMPRE** - Para cualquier input que necesite validación
 * - En previews de documentación
 * - En demos interactivos
 * - En formularios de producción
 * - Para cualquier caso de validación
 * 
 * ### Cómo funciona:
 * 1. **Click en SELECT** → Muestra "Cargando opciones..." con spinner
 * 2. **Carga primera página** → 10 opciones + observador de scroll
 * 3. **Scroll hacia abajo** → Aparece "Cargando más..." automáticamente
 * 4. **Carga siguiente página** → 10 opciones más aparecen
 * 5. **Repite automáticamente** → Hasta completar todas las opciones
 * 
 * ### Ejemplo de uso:
 * ```javascript
 * // Generar lista grande (50+ opciones)
 * const countries = Array.from({length: 50}, (_, i) => ({
 *     value: `country-${i + 1}`,
 *     text: `País ${i + 1}`
 * }));
 * 
 * // SELECT con scroll infinito automático
 * createInput({
 *     containerId: 'countries-select',
 *     type: 'select',
 *     label: 'País',
 *     placeholder: 'Selecciona un país...',
 *     selectOptions: countries
 *     // Scroll infinito se activa automáticamente
 * });
 * ```
 * 
 * ## 🚀 EJEMPLOS AVANZADOS
 * 
 * ### Formulario Completo:
 * ```javascript
 * // Input de nombre
 * const nameInput = createInput({
 *     containerId: 'name-input',
 *     label: 'Nombre completo',
 *     placeholder: 'Escribe tu nombre',
 *     mandatory: true,
 *     mandatoryType: 'obligatorio',
 *     onChange: (value) => console.log('Nombre:', value)
 * });
 * 
 * // Input de email
 * const emailInput = createInput({
 *     containerId: 'email-input',
 *     label: 'Email',
 *     placeholder: 'correo@ejemplo.com',
 *     type: 'email',
 *     leftIcon: 'fa-envelope',
 *     helperText: 'Ingresa tu email válido',
 *     showHelper: true,
 *     onChange: (value) => console.log('Email:', value)
 * });
 * 
 * // Input de contraseña
 * const passwordInput = createInput({
 *     containerId: 'password-input',
 *     label: 'Contraseña',
 *     placeholder: 'Escribe tu contraseña',
 *     type: 'password',
 *     leftIcon: 'fa-lock',
 *     rightIcon: 'fa-eye',
 *     mandatory: true,
 *     mandatoryType: 'obligatorio',
 *     onChange: (value) => console.log('Contraseña:', value)
 * });
 * ```
 * 
 * ### Validación en Tiempo Real:
 * ```javascript
 * const emailInput = createInput({
 *     containerId: 'email-input',
 *     label: 'Email',
 *     placeholder: 'correo@ejemplo.com',
 *     type: 'email',
 *     onChange: (value) => {
 *         const isValid = value.includes('@');
 *         emailInput.setState(isValid ? 'default' : 'invalid');
 *     }
 * });
 * ```
 * 
 * ### Control Dinámico:
 * ```javascript
 * const input = createInput({
 *     containerId: 'my-input',
 *     label: 'Mensaje',
 *     placeholder: 'Escribe algo...'
 * });
 * 
 * // Cambiar valor programáticamente
 * input.setValue('Nuevo texto');
 * 
 * // Cambiar estado
 * input.setState('invalid');
 * 
 * // Deshabilitar
 * input.disable();
 * 
 * // Habilitar
 * input.enable();
 * ```
 */

/**
 * Crea un input UBITS con todas las opciones de personalización
 * 
 * @param {Object} options - Opciones de configuración del input
 * @param {string} options.containerId - ID del contenedor donde se renderizará el input
 * @param {string} [options.label] - Texto del label (opcional)
 * @param {string} [options.placeholder] - Texto del placeholder
 * @param {string} [options.helperText] - Texto de ayuda (opcional)
 * @param {string} [options.size='md'] - Tamaño del input: 'sm', 'md', 'lg'
 * @param {string} [options.state='default'] - Estado del input: 'default', 'hover', 'focus', 'active', 'invalid', 'disabled'
 * @param {string} [options.type='text'] - Tipo de input: 'text', 'email', 'password', 'number', 'tel', 'url', 'select', 'textarea', 'search', 'autocomplete', 'calendar'
 *   - **text**: Input de texto básico
 *   - **email**: Input de email con validación manual
 *   - **password**: Input de contraseña con toggle mostrar/ocultar
 *   - **number**: Input numérico
 *   - **tel**: Input de teléfono con validación manual
 *   - **url**: Input de URL con validación manual
 *   - **select**: Dropdown personalizado con opciones (scroll infinito automático para 50+ opciones)
 *   - **textarea**: Área de texto multilínea con redimensionamiento vertical
 *   - **search**: Input de búsqueda con botón limpiar (X) que aparece al escribir
 *   - **autocomplete**: Input con sugerencias automáticas y botón limpiar
 *   - **calendar**: Input con date picker personalizado con navegación por mes/año
 * @param {boolean} [options.showLabel=true] - Mostrar/ocultar label
 * @param {boolean} [options.showHelper=false] - Mostrar/ocultar helper text (independiente del contador)
 * @param {boolean} [options.showCounter=false] - Mostrar/ocultar contador de caracteres (independiente del helper text)
 * @param {number} [options.maxLength=50] - Máximo de caracteres para el contador
 * @param {boolean} [options.mandatory=false] - Mostrar texto mandatory/optional
 * @param {string} [options.mandatoryType='obligatorio'] - Tipo de mandatory: 'obligatorio', 'opcional'
 * @param {string} [options.leftIcon] - Clase FontAwesome del icono izquierdo (ej: 'fa-user', se agrega 'far' automáticamente)
 * @param {string} [options.rightIcon] - Clase FontAwesome del icono derecho (ej: 'fa-eye', se agrega 'far' automáticamente)
 * @param {Array} [options.selectOptions] - Opciones para SELECT (ej: [{value: '1', text: 'Opción 1'}, {value: '2', text: 'Opción 2'}])
 *   - Soporta scroll infinito automático para listas largas (50+ opciones)
 *   - Carga 10 opciones por vez con loading visual automático
 * @param {Array} [options.autocompleteOptions] - Opciones para AUTOCOMPLETE (ej: [{value: '1', text: 'Opción 1'}, {value: '2', text: 'Opción 2'}])
 * @param {string} [options.value] - Valor inicial del input
 * @param {Function} [options.onChange] - Callback cuando cambia el valor
 * @param {Function} [options.onFocus] - Callback cuando se enfoca
 * @param {Function} [options.onBlur] - Callback cuando se desenfoca
 * 
 * @example
 * // Input básico
 * createInput({
 *     containerId: 'my-input',
 *     label: 'Nombre',
 *     placeholder: 'Escribe tu nombre'
 * });
 * 
 * @example
 * // Input con iconos y helper text
 * createInput({
 *     containerId: 'my-input',
 *     label: 'Email',
 *     placeholder: 'correo@ejemplo.com',
 *     type: 'email',
 *     leftIcon: 'fa-envelope',
 *     helperText: 'Ingresa tu email válido',
 *     showHelper: true
 * });
 * 
 * @example
 * // Input con contador de caracteres
 * createInput({
 *     containerId: 'my-input',
 *     label: 'Mensaje',
 *     placeholder: 'Escribe tu mensaje',
 *     helperText: 'Máximo 100 caracteres',
 *     showHelper: true,
 *     showCounter: true,
 *     maxLength: 100
 * });
 * 
 * @example
 * // SELECT con opciones básicas
 * createInput({
 *     containerId: 'my-select',
 *     type: 'select',
 *     label: 'Categoría',
 *     placeholder: 'Selecciona una opción...',
 *     selectOptions: [
 *         {value: '1', text: 'Opción 1'},
 *         {value: '2', text: 'Opción 2'}
 *     ]
 * });
 * 
 * @example
 * // SELECT con scroll infinito (50+ opciones)
 * createInput({
 *     containerId: 'my-select-large',
 *     type: 'select',
 *     label: 'País',
 *     placeholder: 'Selecciona un país...',
 *     selectOptions: generateLargeOptionsList() // 50+ opciones
 *     // Automáticamente activa scroll infinito con loading visual
 * });
 * 
 * // IMPORTANTE: El contenedor automáticamente recibe position: relative
 * // para que el dropdown se posicione correctamente
 * 
 * @example
 * // TEXTAREA multilínea
 * createInput({
 *     containerId: 'my-textarea',
 *     type: 'textarea',
 *     label: 'Comentario',
 *     placeholder: 'Escribe tu comentario aquí...'
 * });
 * 
 * @example
 * // SEARCH con limpiar
 * createInput({
 *     containerId: 'my-search',
 *     type: 'search',
 *     label: 'Búsqueda',
 *     placeholder: 'Buscar...'
 * });
 * 
 * @example
 * // AUTOCOMPLETE con sugerencias
 * createInput({
 *     containerId: 'my-autocomplete',
 *     type: 'autocomplete',
 *     label: 'Lenguaje',
 *     placeholder: 'Escribe un lenguaje...',
 *     autocompleteOptions: [
 *         {value: '1', text: 'JavaScript'},
 *         {value: '2', text: 'TypeScript'}
 *     ]
 * });
 * 
 * @example
 * // CALENDAR con date picker
 * createInput({
 *     containerId: 'my-calendar',
 *     type: 'calendar',
 *     label: 'Fecha de nacimiento',
 *     placeholder: 'Selecciona una fecha...'
 * });
 * 
 * @example
 * // PASSWORD con toggle mostrar/ocultar
 * createInput({
 *     containerId: 'my-password',
 *     type: 'password',
 *     label: 'Contraseña',
 *     placeholder: 'Ingresa tu contraseña...'
 * });
 */

// Funciones de validación
// Funciones de validación removidas - No funcionan confiablemente
// Usar validación manual en su lugar

// Función para crear toggle de contraseña
function createPasswordToggle(container, inputElement) {
    console.log('createPasswordToggle called with:', { container, inputElement });
    
    const toggleIcon = container.querySelector('i[class*="fa-eye"]');
    if (toggleIcon) {
        let isPasswordVisible = false;
        
        // Hacer el icono clickeable
        toggleIcon.style.pointerEvents = 'auto';
        toggleIcon.style.cursor = 'pointer';
        
        // Función para toggle de visibilidad
        function togglePasswordVisibility() {
            isPasswordVisible = !isPasswordVisible;
            
            if (isPasswordVisible) {
                inputElement.type = 'text';
                toggleIcon.className = 'far fa-eye-slash';
            } else {
                inputElement.type = 'password';
                toggleIcon.className = 'far fa-eye';
            }
        }
        
        // Event listener para el click en el icono
        toggleIcon.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            togglePasswordVisibility();
        });
    }
}

// Función para crear date picker
function createCalendarPicker(container, inputElement, onChange) {
    console.log('createCalendarPicker called with:', { container, inputElement, onChange });
    
    const calendar = document.createElement('div');
    calendar.className = 'ubits-calendar-picker';
    calendar.style.display = 'none';
    
    // Variables para el calendario
    let currentDate = new Date();
    let selectedDate = null;
    
    // Función para formatear fecha
    function formatDate(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }
    
    // Función para renderizar el calendario
    function renderCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        // Nombres de los meses
        const monthNames = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        
        // Nombres de los días
        const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        
        // Crear header del calendario con selectores
        let calendarHTML = `
            <div class="ubits-calendar-header">
                <button class="ubits-calendar-prev" type="button">
                    <i class="far fa-chevron-left"></i>
                </button>
                <div class="ubits-calendar-selectors">
                    <select class="ubits-calendar-month-select">
                        ${monthNames.map((name, index) => 
                            `<option value="${index}" ${index === month ? 'selected' : ''}>${name}</option>`
                        ).join('')}
                    </select>
                    <select class="ubits-calendar-year-select">
                        ${Array.from({length: 100}, (_, i) => {
                            const yearOption = currentDate.getFullYear() - 50 + i;
                            return `<option value="${yearOption}" ${yearOption === year ? 'selected' : ''}>${yearOption}</option>`;
                        }).join('')}
                    </select>
                </div>
                <button class="ubits-calendar-next" type="button">
                    <i class="far fa-chevron-right"></i>
                </button>
            </div>
            <div class="ubits-calendar-weekdays">
        `;
        
        // Agregar nombres de los días
        dayNames.forEach(day => {
            calendarHTML += `<div class="ubits-calendar-weekday">${day}</div>`;
        });
        calendarHTML += '</div><div class="ubits-calendar-days">';
        
        // Obtener primer día del mes y número de días
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();
        
        // Agregar días vacíos al inicio
        for (let i = 0; i < startingDay; i++) {
            calendarHTML += '<div class="ubits-calendar-day ubits-calendar-day--empty"></div>';
        }
        
        // Agregar días del mes
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const isToday = date.toDateString() === new Date().toDateString();
            const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
            
            let dayClass = 'ubits-calendar-day';
            if (isToday) dayClass += ' ubits-calendar-day--today';
            if (isSelected) dayClass += ' ubits-calendar-day--selected';
            
            calendarHTML += `<div class="${dayClass}" data-date="${formatDate(date)}">${day}</div>`;
        }
        
        calendarHTML += '</div></div>';
        calendar.innerHTML = calendarHTML;
        
        // Agregar event listeners
        const prevBtn = calendar.querySelector('.ubits-calendar-prev');
        const nextBtn = calendar.querySelector('.ubits-calendar-next');
        const monthSelect = calendar.querySelector('.ubits-calendar-month-select');
        const yearSelect = calendar.querySelector('.ubits-calendar-year-select');
        const dayElements = calendar.querySelectorAll('.ubits-calendar-day:not(.ubits-calendar-day--empty)');
        
        // Navegación del calendario
        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
        });
        
        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
        });
        
        // Selector de mes
        monthSelect.addEventListener('change', (e) => {
            e.stopPropagation();
            currentDate.setMonth(parseInt(e.target.value));
            renderCalendar();
        });
        
        // Selector de año
        yearSelect.addEventListener('change', (e) => {
            e.stopPropagation();
            currentDate.setFullYear(parseInt(e.target.value));
            renderCalendar();
        });
        
        // Selección de día
        dayElements.forEach(dayEl => {
            dayEl.addEventListener('click', (e) => {
                e.stopPropagation();
                const dateStr = dayEl.dataset.date;
                const [day, month, year] = dateStr.split('/');
                selectedDate = new Date(year, month - 1, day);
                
                inputElement.value = dateStr;
                calendar.style.display = 'none';
                
                if (onChange && typeof onChange === 'function') {
                    onChange(dateStr);
                }
            });
        });
    }
    
    // Event listener para mostrar/ocultar calendario
    inputElement.addEventListener('click', function() {
        if (calendar.style.display === 'none' || calendar.style.display === '') {
            calendar.style.display = 'block';
            renderCalendar();
        } else {
            calendar.style.display = 'none';
        }
    });
    
    // Cerrar calendario al hacer click fuera
    document.addEventListener('click', function(e) {
        if (!container.contains(e.target)) {
            calendar.style.display = 'none';
        }
    });
    
    container.appendChild(calendar);
    
    // Asegurar que el contenedor tenga position: relative
    if (getComputedStyle(container).position === 'static') {
        container.style.position = 'relative';
    }
}

// Función para crear dropdown de autocompletado
function createAutocompleteDropdown(container, inputElement, autocompleteOptions, onChange) {
    console.log('createAutocompleteDropdown called with:', { container, inputElement, autocompleteOptions, onChange });
    
    const dropdown = document.createElement('div');
    dropdown.className = 'ubits-autocomplete-dropdown';
    dropdown.style.display = 'none';
    
    // Función para filtrar opciones basado en el texto del input
    function filterOptions(searchText) {
        if (!searchText || searchText.length < 1) {
            dropdown.style.display = 'none';
            return;
        }
        
        const filteredOptions = autocompleteOptions.filter(option => 
            option.text.toLowerCase().includes(searchText.toLowerCase())
        );
        
        // Limpiar dropdown anterior
        dropdown.innerHTML = '';
        
        if (filteredOptions.length === 0) {
            dropdown.style.display = 'none';
            return;
        }
        
        // Mostrar máximo 5 opciones
        const optionsToShow = filteredOptions.slice(0, 5);
        
        optionsToShow.forEach(option => {
            const optionElement = document.createElement('div');
            optionElement.className = 'ubits-autocomplete-option';
            optionElement.textContent = option.text;
            optionElement.dataset.value = option.value;
            
            // Resaltar texto coincidente
            const regex = new RegExp(`(${searchText})`, 'gi');
            optionElement.innerHTML = option.text.replace(regex, '<strong>$1</strong>');
            
            optionElement.addEventListener('mouseenter', function() {
                this.style.backgroundColor = 'var(--ubits-bg-2)';
            });
            optionElement.addEventListener('mouseleave', function() {
                this.style.backgroundColor = 'transparent';
            });
            
            optionElement.addEventListener('click', function() {
                const selectedValue = this.dataset.value;
                const selectedText = this.textContent;
                inputElement.value = selectedText;
                dropdown.style.display = 'none';
                if (onChange && typeof onChange === 'function') {
                    onChange(selectedValue);
                }
            });
            dropdown.appendChild(optionElement);
        });
        
        dropdown.style.display = 'block';
    }
    
    // Event listener para el input
    inputElement.addEventListener('input', function() {
        filterOptions(this.value);
    });
    
    // Event listener para focus
    inputElement.addEventListener('focus', function() {
        if (this.value.length > 0) {
            filterOptions(this.value);
        }
    });
    
    // Event listener para blur (ocultar dropdown)
    inputElement.addEventListener('blur', function() {
        // Delay para permitir clicks en las opciones
        setTimeout(() => {
            dropdown.style.display = 'none';
        }, 150);
    });
    
    // Cerrar dropdown al hacer click fuera
    document.addEventListener('click', function(e) {
        if (!container.contains(e.target)) {
            dropdown.style.display = 'none';
        }
    });
    
    container.appendChild(dropdown);
    
    // Asegurar que el contenedor tenga position: relative
    if (getComputedStyle(container).position === 'static') {
        container.style.position = 'relative';
    }
}

// Función para crear dropdown personalizado para SELECT
function createSelectDropdown(container, inputElement, selectOptions, value, placeholder, onChange) {
    console.log('createSelectDropdown called with:', { container, inputElement, selectOptions, value, placeholder, onChange });
    
    // Crear dropdown (vacío inicialmente para lazy loading)
    const dropdown = document.createElement('div');
    dropdown.className = 'ubits-select-dropdown';
    dropdown.style.display = 'none';
    
    // Variables para paginación
    const itemsPerPage = 10;
    let currentPage = 0;
    let loadedOptions = [];
    let isLoading = false;
    
    // Función para cargar opciones con scroll infinito
    function loadOptions(page = 0, append = false) {
        if (isLoading) return;
        
        isLoading = true;
        
        // Mostrar loading si es la primera página
        if (page === 0 && !append) {
            dropdown.innerHTML = '<div class="ubits-select-loading"><i class="far fa-spinner fa-spin"></i> Cargando opciones...</div>';
        } else if (page > 0) {
            // Agregar loading al final si es scroll infinito
            const loadingEl = document.createElement('div');
            loadingEl.className = 'ubits-select-loading';
            loadingEl.innerHTML = '<i class="far fa-spinner fa-spin"></i> Cargando más...';
            dropdown.appendChild(loadingEl);
        }
        
        // Simular delay de carga (más rápido para scroll infinito)
        setTimeout(() => {
            const startIndex = page * itemsPerPage;
            const endIndex = Math.min(startIndex + itemsPerPage, selectOptions.length);
            const pageOptions = selectOptions.slice(startIndex, endIndex);
            
            // Remover loading
            const loadingEl = dropdown.querySelector('.ubits-select-loading');
            if (loadingEl) {
                loadingEl.remove();
            }
            
            // Limpiar dropdown si es la primera página
            if (page === 0 && !append) {
                dropdown.innerHTML = '';
                loadedOptions = [];
            }
            
            // Crear opciones de la página actual
            pageOptions.forEach(option => {
                const optionElement = document.createElement('div');
                optionElement.className = 'ubits-select-option';
                optionElement.textContent = option.text;
                optionElement.dataset.value = option.value;
                
                // Click handler
                optionElement.addEventListener('click', function() {
                    const selectedValue = this.dataset.value;
                    const selectedText = this.textContent;
                    
                    // Actualizar input
                    inputElement.value = selectedText;
                    
                    // Cerrar dropdown
                    dropdown.style.display = 'none';
                    
                    // Trigger onChange
                    if (onChange && typeof onChange === 'function') {
                        onChange(selectedValue);
                    }
                });
                
                dropdown.appendChild(optionElement);
                loadedOptions.push(option);
            });
            
            // Verificar si hay más páginas para scroll infinito
            const hasMorePages = endIndex < selectOptions.length;
            if (hasMorePages) {
                // Agregar observador de scroll para cargar automáticamente
                setupScrollObserver();
            }
            
            isLoading = false;
        }, 150); // 150ms delay más rápido para scroll infinito
    }
    
    // Función para configurar observador de scroll
    function setupScrollObserver() {
        // Remover observador anterior si existe
        if (dropdown.scrollObserver) {
            dropdown.scrollObserver.disconnect();
        }
        
        // Crear nuevo observador
        dropdown.scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !isLoading) {
                    // Cargar siguiente página automáticamente
                    currentPage++;
                    loadOptions(currentPage, true);
                }
            });
        }, {
            root: dropdown,
            rootMargin: '50px', // Cargar cuando esté a 50px del final
            threshold: 0.1
        });
        
        // Crear elemento observador al final del dropdown
        const observerEl = document.createElement('div');
        observerEl.className = 'ubits-select-observer';
        observerEl.style.height = '1px';
        observerEl.style.width = '100%';
        dropdown.appendChild(observerEl);
        
        // Observar el elemento
        dropdown.scrollObserver.observe(observerEl);
    }
    
    // Agregar dropdown al container
    container.appendChild(dropdown);
    
    // Asegurar que el contenedor tenga position: relative
    if (getComputedStyle(container).position === 'static') {
        container.style.position = 'relative';
    }
    
    // Click handler para abrir/cerrar dropdown
    inputElement.addEventListener('click', function(e) {
        e.preventDefault();
        if (dropdown.style.display === 'none' || dropdown.style.display === '') {
            // Lazy loading: cargar primera página solo cuando se abre
            currentPage = 0;
            loadOptions(0, false);
            dropdown.style.display = 'block';
        } else {
            dropdown.style.display = 'none';
        }
    });
    
    // Cerrar dropdown al hacer click fuera
    document.addEventListener('click', function(e) {
        if (!container.contains(e.target)) {
            dropdown.style.display = 'none';
        }
    });
}

function createInput(options = {}) {
    console.log('createInput called with:', options);
    
        const {
            containerId,
            label = '',
            placeholder = '',
            helperText = '',
            size = 'md',
            state = 'default',
            type = 'text',
            showLabel = true,
            showHelper = false,
            showCounter = false,
            maxLength = 50,
            mandatory = false,
            mandatoryType = 'obligatorio',
            leftIcon = '',
            rightIcon = '',
            selectOptions = [],
            autocompleteOptions = [],
            value = '',
            onChange = null,
            onFocus = null,
            onBlur = null
        } = options;

    // Validar parámetros requeridos
    if (!containerId) {
        console.error('UBITS Input: containerId es requerido');
        return;
    }

    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`UBITS Input: No se encontró el contenedor con ID "${containerId}"`);
        return;
    }

    // Crear estructura HTML
    let inputHTML = '';

    // Label
    if (showLabel && label) {
        const mandatoryText = mandatory ? ` <span class="ubits-input-mandatory">(${mandatoryType})</span>` : '';
        inputHTML += `<label class="ubits-input-label">${label}${mandatoryText}</label>`;
    }

    // Input wrapper con iconos - IMPLEMENTACIÓN REAL
    const hasLeftIcon = leftIcon && leftIcon.trim() !== '';
    const hasRightIcon = rightIcon && rightIcon.trim() !== '';
    
    // Agregar 'far' automáticamente si no está presente
    const leftIconClass = hasLeftIcon && leftIcon.startsWith('fa-') ? `far ${leftIcon}` : leftIcon;
    const rightIconClass = hasRightIcon && rightIcon.startsWith('fa-') ? `far ${rightIcon}` : rightIcon;

    inputHTML += `<div style="position: relative; display: inline-block; width: 100%;">`;
    
    // Icono izquierdo con posicionamiento absoluto
    if (hasLeftIcon) {
        inputHTML += `<i class="${leftIconClass}" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--ubits-fg-1-medium); pointer-events: none;"></i>`;
    }
    
    // Input con padding dinámico
    const inputClasses = ['ubits-input', `ubits-input--${size}`];
    if (state !== 'default') {
        inputClasses.push(`ubits-input--${state}`);
    }
    
    const disabledAttr = state === 'disabled' ? ' disabled' : '';
    const maxLengthAttr = showCounter ? ` maxlength="${maxLength}"` : '';
    const paddingLeft = hasLeftIcon ? 'padding-left: 32px;' : '';
    const paddingRight = hasRightIcon ? 'padding-right: 32px;' : '';
    const inputStyle = `width: 100%; ${paddingLeft} ${paddingRight}`;
    
    // Variables temporales para iconos
    let finalRightIcon = rightIcon;
    let finalHasRightIcon = hasRightIcon;
    let finalLeftIcon = leftIcon;
    let finalHasLeftIcon = hasLeftIcon;
    
    // Renderizar input, select, textarea o search según el tipo
    console.log('Rendering type:', type, 'isSelect:', type === 'select', 'isTextarea:', type === 'textarea', 'isSearch:', type === 'search');
    
    if (type === 'select') {
        console.log('Rendering SELECT with options:', selectOptions);
        // SELECT - usar input normal pero readonly y con rightIcon de chevron
        const selectValue = value ? selectOptions.find(opt => opt.value === value)?.text || placeholder : placeholder;
        inputHTML += `<input type="text" class="${inputClasses.join(' ')}" style="${inputStyle}" value="${selectValue}" readonly>`;
        
        // Forzar rightIcon a chevron-down si no hay rightIcon personalizado
        if (!hasRightIcon) {
            finalRightIcon = 'fa-chevron-down';
            finalHasRightIcon = true;
        }
    } else if (type === 'textarea') {
        console.log('Rendering TEXTAREA');
        // TEXTAREA - campo multilínea con redimensionamiento
        let textareaStyle = `width: 100%; min-height: 80px; resize: vertical; ${paddingLeft} ${paddingRight}`;
        if (state === 'disabled') {
            textareaStyle += `; background: var(--ubits-bg-3) !important; color: var(--ubits-fg-1-low) !important; border-color: var(--ubits-border-2) !important;`;
        }
        inputHTML += `<textarea class="${inputClasses.join(' ')}" style="${textareaStyle}" placeholder="${placeholder}"${disabledAttr}${maxLengthAttr}>${value}</textarea>`;
        } else if (type === 'search') {
            console.log('Rendering SEARCH');
            // SEARCH - input con icono de búsqueda y botón de limpiar
            // Actualizar padding para iconos
            let searchPaddingLeft = paddingLeft;
            let searchPaddingRight = paddingRight;
            
            // Forzar leftIcon a search si no hay leftIcon personalizado
            if (!hasLeftIcon) {
                finalLeftIcon = 'fa-search';
                finalHasLeftIcon = true;
                searchPaddingLeft = 'padding-left: 32px;';
            }
            
            // Siempre agregar rightIcon de limpiar para search
            finalRightIcon = 'fa-times';
            finalHasRightIcon = true;
            searchPaddingRight = 'padding-right: 32px;';
            
            let searchStyle = `width: 100%; ${searchPaddingLeft} ${searchPaddingRight}`;
            if (state === 'disabled') {
                searchStyle += `; background: var(--ubits-bg-3) !important; color: var(--ubits-fg-1-low) !important; border-color: var(--ubits-border-2) !important;`;
            }
            inputHTML += `<input type="text" class="${inputClasses.join(' ')}" style="${searchStyle}" placeholder="${placeholder}" value="${value}" autocomplete="off"${disabledAttr}${maxLengthAttr}>`;
        } else if (type === 'autocomplete') {
            console.log('Rendering AUTOCOMPLETE');
            // AUTOCOMPLETE - input con dropdown de sugerencias
            // Actualizar padding para iconos
            let autocompletePaddingLeft = paddingLeft;
            let autocompletePaddingRight = paddingRight;
            
            // Forzar leftIcon de búsqueda para autocomplete
            if (!hasLeftIcon) {
                finalLeftIcon = 'fa-search';
                finalHasLeftIcon = true;
                autocompletePaddingLeft = 'padding-left: 32px;';
            }
            
            // Forzar rightIcon de limpiar para autocomplete
            finalRightIcon = 'fa-times';
            finalHasRightIcon = true;
            autocompletePaddingRight = 'padding-right: 32px;';
            
            let autocompleteStyle = `width: 100%; ${autocompletePaddingLeft} ${autocompletePaddingRight}`;
            if (state === 'disabled') {
                autocompleteStyle += `; background: var(--ubits-bg-3) !important; color: var(--ubits-fg-1-low) !important; border-color: var(--ubits-border-2) !important;`;
            }
            inputHTML += `<input type="text" class="${inputClasses.join(' ')}" style="${autocompleteStyle}" placeholder="${placeholder}" value="${value}" autocomplete="off"${disabledAttr}${maxLengthAttr}>`;
        } else if (type === 'calendar') {
            console.log('Rendering CALENDAR');
            // CALENDAR - input con date picker
            // Actualizar padding para iconos
            let calendarPaddingLeft = paddingLeft;
            let calendarPaddingRight = paddingRight;
            
            // Forzar rightIcon de calendario para calendar
            finalRightIcon = 'fa-calendar';
            finalHasRightIcon = true;
            calendarPaddingRight = 'padding-right: 32px;';
            
            let calendarStyle = `width: 100%; ${calendarPaddingLeft} ${calendarPaddingRight}`;
            if (state === 'disabled') {
                calendarStyle += `; background: var(--ubits-bg-3) !important; color: var(--ubits-fg-1-low) !important; border-color: var(--ubits-border-2) !important;`;
            }
            inputHTML += `<input type="text" class="${inputClasses.join(' ')}" style="${calendarStyle}" placeholder="${placeholder}" value="${value}" readonly${disabledAttr}>`;
        } else if (type === 'password') {
            console.log('Rendering PASSWORD');
            // PASSWORD - input con toggle de mostrar/ocultar
            // Actualizar padding para iconos
            let passwordPaddingLeft = paddingLeft;
            let passwordPaddingRight = paddingRight;
            
            // Forzar rightIcon de ojo para password
            finalRightIcon = 'fa-eye';
            finalHasRightIcon = true;
            passwordPaddingRight = 'padding-right: 32px;';
            
            let passwordStyle = `width: 100%; ${passwordPaddingLeft} ${passwordPaddingRight}`;
            if (state === 'disabled') {
                passwordStyle += `; background: var(--ubits-bg-3) !important; color: var(--ubits-fg-1-low) !important; border-color: var(--ubits-border-2) !important;`;
            }
            inputHTML += `<input type="password" class="${inputClasses.join(' ')}" style="${passwordStyle}" placeholder="${placeholder}" value="${value}"${disabledAttr}${maxLengthAttr}>`;
        } else {
        console.log('Rendering normal INPUT');
        // INPUT normal
        inputHTML += `<input type="${type}" class="${inputClasses.join(' ')}" style="${inputStyle}" placeholder="${placeholder}" value="${value}"${disabledAttr}${maxLengthAttr}>`;
    }
    
    // Icono izquierdo con posicionamiento absoluto
    if (finalHasLeftIcon) {
        const leftIconClass = `far ${finalLeftIcon}`;
        inputHTML += `<i class="${leftIconClass}" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--ubits-fg-1-medium); pointer-events: none;"></i>`;
    }
    
    // Icono derecho con posicionamiento absoluto
    if (finalHasRightIcon) {
        const rightIconClass = `far ${finalRightIcon}`;
        inputHTML += `<i class="${rightIconClass}" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); color: var(--ubits-fg-1-medium); pointer-events: none;"></i>`;
    }
    
    inputHTML += '</div>';

    // Helper text y character counter (independientes)
    if (showHelper || showCounter) {
        inputHTML += '<div class="ubits-input-helper">';
        
        if (showHelper && helperText) {
            inputHTML += `<span>${helperText}</span>`;
        }
        
        if (showCounter) {
            inputHTML += `<span class="ubits-input-counter">0/${maxLength}</span>`;
        }
        
        inputHTML += '</div>';
    }

    // Renderizar HTML
    container.innerHTML = inputHTML;

    // Obtener elementos del DOM
    const inputElement = container.querySelector('.ubits-input');
    const counterElement = container.querySelector('.ubits-input-counter');
    
    // Determinar si es input, select o search
    const isSelect = type === 'select';
    const isSearch = type === 'search';
    
    // Si es SELECT, crear dropdown personalizado
    if (isSelect) {
        console.log('SELECT detected, options:', selectOptions);
        inputElement.style.cursor = 'pointer';
        // Crear dropdown personalizado
        createSelectDropdown(container, inputElement, selectOptions, value, placeholder, onChange);
    }
    
    // Si es SEARCH, agregar funcionalidad de limpiar
    if (isSearch) {
        console.log('SEARCH detected, adding clear functionality');
        const clearIcon = container.querySelector('i[class*="fa-times"]');
        if (clearIcon) {
            // Ocultar inicialmente el icono de limpiar
            clearIcon.style.display = 'none';
            clearIcon.style.pointerEvents = 'auto';
            clearIcon.style.cursor = 'pointer';
            
            // Función para mostrar/ocultar el icono de limpiar
            function toggleClearIcon() {
                if (inputElement.value.length > 0) {
                    clearIcon.style.display = 'block';
                } else {
                    clearIcon.style.display = 'none';
                }
            }
            
            // Mostrar/ocultar icono al escribir
            inputElement.addEventListener('input', toggleClearIcon);
            
            // Click en el icono para limpiar
            clearIcon.addEventListener('click', function(e) {
                e.preventDefault();
                inputElement.value = '';
                inputElement.focus();
                clearIcon.style.display = 'none';
                if (onChange && typeof onChange === 'function') {
                    onChange('');
                }
            });
            
            // Mostrar/ocultar al cargar la página
            toggleClearIcon();
        }
    }
    
    // Si es AUTOCOMPLETE, agregar funcionalidad de sugerencias y limpiar
    if (type === 'autocomplete') {
        console.log('AUTOCOMPLETE detected, adding suggestions and clear functionality');
        
        // Funcionalidad de limpiar (similar a SEARCH)
        const clearIcon = container.querySelector('i[class*="fa-times"]');
        if (clearIcon) {
            // Ocultar inicialmente el icono de limpiar
            clearIcon.style.display = 'none';
            clearIcon.style.pointerEvents = 'auto';
            clearIcon.style.cursor = 'pointer';
            
            // Función para mostrar/ocultar el icono de limpiar
            function toggleClearIcon() {
                if (inputElement.value.length > 0) {
                    clearIcon.style.display = 'block';
                } else {
                    clearIcon.style.display = 'none';
                }
            }
            
            // Mostrar/ocultar icono al escribir
            inputElement.addEventListener('input', toggleClearIcon);
            
            // Click en el icono para limpiar
            clearIcon.addEventListener('click', function(e) {
                e.preventDefault();
                inputElement.value = '';
                inputElement.focus();
                clearIcon.style.display = 'none';
                // Ocultar dropdown si está abierto
                const dropdown = container.querySelector('.ubits-autocomplete-dropdown');
                if (dropdown) {
                    dropdown.style.display = 'none';
                }
                if (onChange && typeof onChange === 'function') {
                    onChange('');
                }
            });
            
            // Mostrar/ocultar al cargar la página
            toggleClearIcon();
        }
        
        // Funcionalidad de sugerencias
        createAutocompleteDropdown(container, inputElement, autocompleteOptions, onChange);
    }
    
    // Si es CALENDAR, agregar funcionalidad de date picker
    if (type === 'calendar') {
        console.log('CALENDAR detected, adding date picker functionality');
        createCalendarPicker(container, inputElement, onChange);
    }
    
    // Si es PASSWORD, agregar funcionalidad de toggle mostrar/ocultar
    if (type === 'password') {
        console.log('PASSWORD detected, adding toggle functionality');
        createPasswordToggle(container, inputElement);
    }

    // Agregar event listeners
    if (onChange && typeof onChange === 'function') {
        const eventType = isSelect ? 'change' : 'input';
        inputElement.addEventListener(eventType, (e) => {
            onChange(e.target.value, e);
        });
    }

    if (onFocus && typeof onFocus === 'function') {
        inputElement.addEventListener('focus', (e) => {
            onFocus(e.target.value, e);
        });
    }

    if (onBlur && typeof onBlur === 'function') {
        inputElement.addEventListener('blur', (e) => {
            onBlur(e.target.value, e);
        });
    }

    // Actualizar contador de caracteres con validación
    if (showCounter && counterElement) {
        const updateCounter = () => {
            const currentLength = inputElement.value.length;
            counterElement.textContent = `${currentLength}/${maxLength}`;
            
            // Validación de límite de caracteres
            if (currentLength >= maxLength) {
                // Cambiar color a rojo cuando se alcanza el límite
                counterElement.style.color = 'var(--ubits-feedback-accent-error)';
                counterElement.style.fontWeight = '600';
                
                // Prevenir escribir más caracteres
                if (currentLength > maxLength) {
                    inputElement.value = inputElement.value.substring(0, maxLength);
                }
            } else {
                // Color normal
                counterElement.style.color = 'var(--ubits-fg-1-medium)';
                counterElement.style.fontWeight = '400';
            }
        };

        inputElement.addEventListener('input', updateCounter);
        updateCounter(); // Inicializar contador
    }

    // Validación automática removida - No funciona confiablemente
    // Usar validación manual en su lugar

    // Retornar métodos útiles
    return {
        getValue: () => inputElement.value,
        setValue: (newValue) => {
            inputElement.value = newValue;
            if (showCounter && counterElement) {
                updateCounter();
            }
            // Validación automática removida - Usar validación manual
        },
        focus: () => inputElement.focus(),
        blur: () => inputElement.blur(),
        disable: () => {
            inputElement.disabled = true;
            inputElement.classList.add('ubits-input--disabled');
        },
        enable: () => {
            inputElement.disabled = false;
            inputElement.classList.remove('ubits-input--disabled');
        },
        setState: (newState) => {
            // Remover estado anterior
            const stateClasses = ['ubits-input--hover', 'ubits-input--focus', 'ubits-input--active', 'ubits-input--invalid', 'ubits-input--disabled'];
            stateClasses.forEach(cls => inputElement.classList.remove(cls));
            
            // Agregar nuevo estado
            if (newState !== 'default') {
                inputElement.classList.add(`ubits-input--${newState}`);
            }
            
            // Manejar disabled
            if (newState === 'disabled') {
                inputElement.disabled = true;
            } else {
                inputElement.disabled = false;
            }
        }
    };
}

// Exportar función para uso global
window.createInput = createInput;

/* ========================================
   DOCUMENTACIÓN DE RENDERIZADO UBITS
   ======================================== */

/**
 * RENDERIZADO DEL COMPONENTE INPUT
 * 
 * REQUISITOS OBLIGATORIOS:
 * 1. CSS: <link rel="stylesheet" href="components/input.css">
 * 2. JS: <script src="components/input.js"></script>
 * 3. FontAwesome: <link rel="stylesheet" href="fontawesome-icons.css">
 * 4. UBITS Base: <link rel="stylesheet" href="ubits-colors.css">
 * 5. UBITS Typography: <link rel="stylesheet" href="ubits-typography.css">
 * 
 * IMPLEMENTACIÓN BÁSICA:
 * ```html
 * <!-- Container para el input -->
 * <div id="mi-input-container"></div>
 * 
 * <!-- JavaScript -->
 * <script>
 * createInput({
 *   containerId: 'mi-input-container',
 *   label: 'Nombre',
 *   placeholder: 'Escribe tu nombre',
 *   type: 'text',
 *   size: 'md',
 *   leftIcon: 'fa-user',
 *   helperText: 'Ingresa tu nombre completo',
 *   showHelper: true
 * });
 * </script>
 * ```
 * 
 * TIPOS DISPONIBLES: text, email, password, number, tel, url, select, textarea, search, autocomplete, calendar
 * TAMAÑOS: sm (32px), md (40px), lg (48px)
 * ESTADOS: default, hover, focus, invalid, disabled
 * FEATURES: iconos, contador, helper text, validación manual, scroll infinito (SELECT)
 */
