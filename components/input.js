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
 * | `variant` | string | `'default'` | Apariencia: 'default' (borde visible) o 'subtle' (sin borde visible) |
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
 * @param {string} [options.variant='default'] - Apariencia: 'default' (borde visible) o 'subtle' (sin borde visible)
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
        toggleIcon.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            togglePasswordVisibility();
        });
    }
}

// Función para normalizar texto (eliminar tildes y convertir a minúsculas)
function normalizeTextForSearch(text) {
    if (!text) return '';
    return String(text)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, ''); // Elimina diacríticos (tildes)
}

// Función para crear dropdown de autocompletado
function createAutocompleteDropdown(container, inputElement, autocompleteOptions, onChange, multiple = false, showCheckboxes = false) {
    console.log('createAutocompleteDropdown called with:', { container, inputElement, autocompleteOptions, onChange, multiple, showCheckboxes });

    const dropdown = document.createElement('div');
    dropdown.className = 'ubits-autocomplete-dropdown';
    dropdown.style.display = 'none';

    // Si es múltiple, mantener un Set de valores seleccionados
    const selectedValues = new Set();

    // Función para filtrar opciones basado en el texto del input - sin tildes
    function filterOptions(searchText) {
        // Si tiene checkboxes y está vacío, mostrar las primeras 5 opciones por defecto
        if (showCheckboxes && (!searchText || searchText.length < 1)) {
            const defaultOptions = autocompleteOptions.slice(0, 5);
            dropdown.innerHTML = '';

            defaultOptions.forEach(option => {
                const optionElement = document.createElement('div');
                optionElement.className = 'ubits-autocomplete-option';
                optionElement.dataset.value = option.value;

                // Agregar checkbox
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.className = 'ubits-autocomplete-checkbox';
                checkbox.checked = selectedValues.has(option.value);
                checkbox.dataset.value = option.value;

                optionElement.appendChild(checkbox);

                checkbox.addEventListener('click', function (e) {
                    e.stopPropagation();
                });

                checkbox.addEventListener('change', function () {
                    if (this.checked) {
                        selectedValues.add(option.value);
                    } else {
                        selectedValues.delete(option.value);
                    }
                });

                // Contenedor para el texto
                const textElement = document.createElement('span');
                textElement.className = 'ubits-autocomplete-option-text';
                textElement.textContent = option.text;
                optionElement.appendChild(textElement);

                optionElement.addEventListener('mouseenter', function () {
                    this.style.backgroundColor = 'var(--ubits-bg-2)';
                });
                optionElement.addEventListener('mouseleave', function () {
                    this.style.backgroundColor = 'transparent';
                });

                optionElement.addEventListener('click', function (e) {
                    if (e.target !== checkbox) {
                        checkbox.checked = !checkbox.checked;
                        checkbox.dispatchEvent(new Event('change'));
                    }
                });

                dropdown.appendChild(optionElement);
            });

            dropdown.style.display = 'block';
            return;
        }

        // Si no tiene checkboxes y está vacío: mostrar primeras opciones al hacer foco (máx. 10)
        if (!searchText || searchText.length < 1) {
            if (autocompleteOptions.length === 0) {
                dropdown.style.display = 'none';
                return;
            }
            const defaultOptions = autocompleteOptions.slice(0, 10);
            dropdown.innerHTML = '';
            defaultOptions.forEach(option => {
                const optionElement = document.createElement('div');
                optionElement.className = 'ubits-autocomplete-option';
                optionElement.dataset.value = option.value;
                const textElement = document.createElement('span');
                textElement.className = 'ubits-autocomplete-option-text';
                textElement.textContent = option.text;
                optionElement.appendChild(textElement);
                optionElement.addEventListener('mouseenter', function () {
                    this.style.backgroundColor = 'var(--ubits-bg-2)';
                });
                optionElement.addEventListener('mouseleave', function () {
                    this.style.backgroundColor = 'transparent';
                });
                optionElement.addEventListener('click', function (e) {
                    const selectedValue = this.dataset.value;
                    const selectedText = this.textContent.replace(/<[^>]*>/g, '');
                    inputElement.value = selectedText;
                    dropdown.style.display = 'none';
                    if (onChange && typeof onChange === 'function') {
                        onChange(selectedValue);
                    }
                });
                dropdown.appendChild(optionElement);
            });
            dropdown.style.display = 'block';
            return;
        }

        const filteredOptions = autocompleteOptions.filter(option =>
            normalizeTextForSearch(option.text).includes(normalizeTextForSearch(searchText))
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
            optionElement.dataset.value = option.value;

            // Si tiene checkboxes, agregar checkbox
            if (showCheckboxes) {
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.className = 'ubits-autocomplete-checkbox';
                checkbox.checked = selectedValues.has(option.value);
                checkbox.dataset.value = option.value;

                optionElement.appendChild(checkbox);

                // Prevenir que el click en el checkbox propague al optionElement
                checkbox.addEventListener('click', function (e) {
                    e.stopPropagation();
                });

                checkbox.addEventListener('change', function () {
                    if (this.checked) {
                        selectedValues.add(option.value);
                    } else {
                        selectedValues.delete(option.value);
                    }
                });
            }

            // Contenedor para el texto
            const textElement = document.createElement('span');
            textElement.className = 'ubits-autocomplete-option-text';
            textElement.textContent = option.text;

            // Resaltar texto coincidente (usar texto original para resaltar, no normalizado)
            if (searchText) {
                // Crear regex que busque tanto con tildes como sin tildes
                const normalizedSearch = normalizeTextForSearch(searchText);
                const normalizedOption = normalizeTextForSearch(option.text);
                if (normalizedOption.includes(normalizedSearch)) {
                    // Encontrar la posición en el texto original
                    const regex = new RegExp(`(${searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
                    textElement.innerHTML = option.text.replace(regex, '<strong>$1</strong>');
                } else {
                    textElement.textContent = option.text;
                }
            }

            optionElement.appendChild(textElement);

            optionElement.addEventListener('mouseenter', function () {
                this.style.backgroundColor = 'var(--ubits-bg-2)';
            });
            optionElement.addEventListener('mouseleave', function () {
                this.style.backgroundColor = 'transparent';
            });

            optionElement.addEventListener('click', function (e) {
                // Si tiene checkboxes, toggle el checkbox
                if (showCheckboxes) {
                    const checkbox = this.querySelector('.ubits-autocomplete-checkbox');
                    if (checkbox) {
                        checkbox.checked = !checkbox.checked;
                        checkbox.dispatchEvent(new Event('change'));
                    }
                    return; // No cerrar el dropdown en modo múltiple
                }

                // Modo simple: seleccionar y cerrar
                const selectedValue = this.dataset.value;
                const selectedText = this.textContent.replace(/<[^>]*>/g, ''); // Remover HTML
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
    inputElement.addEventListener('input', function () {
        filterOptions(this.value);
    });

    // Event listener para focus: mostrar opciones (primeras 10 si vacío, o filtradas si hay texto)
    inputElement.addEventListener('focus', function () {
        filterOptions(this.value);
    });

    // Event listener para blur (ocultar dropdown)
    // Si tiene checkboxes, no ocultar automáticamente al perder focus
    if (!showCheckboxes) {
        inputElement.addEventListener('blur', function () {
            // Delay para permitir clicks en las opciones
            setTimeout(() => {
                dropdown.style.display = 'none';
            }, 150);
        });
    }

    // Cerrar dropdown al hacer click fuera (capture para que funcione dentro de drawer/modal con stopPropagation)
    document.addEventListener('click', function (e) {
        if (!container.contains(e.target)) {
            dropdown.style.display = 'none';
        }
    }, true);

    container.appendChild(dropdown);

    // Asegurar que el contenedor tenga position: relative
    if (getComputedStyle(container).position === 'static') {
        container.style.position = 'relative';
    }
}

/**
 * Configura el select del Input usando el componente oficial Dropdown Menu.
 * Requiere que dropdown-menu.css y dropdown-menu.js estén cargados.
 * @param {string} containerId - ID del contenedor del input
 * @param {HTMLElement} container - Elemento contenedor (ancla para posicionar el menú)
 * @param {HTMLInputElement} inputElement - Input readonly que muestra el valor seleccionado
 * @param {Array<{value: string, text: string}>} selectOptions - Opciones del select
 * @param {string} value - Valor inicial seleccionado
 * @param {string} placeholder - Texto cuando no hay selección
 * @param {function} onChange - Callback al cambiar valor
 */
var INPUT_SELECT_ITEMS_PER_PAGE = 50;
var INPUT_SELECT_LOAD_MORE_DELAY_MS = 333;

function setupSelectWithDropdownMenu(containerId, container, inputElement, selectOptions, value, placeholder, onChange) {
    var overlayId = 'ubits-input-select-' + containerId;
    var existing = document.getElementById(overlayId);
    if (existing) existing.remove();

    var valueStr = value != null ? String(value) : '';
    var allOptions = selectOptions || [];
    var initialCount = allOptions.length > INPUT_SELECT_ITEMS_PER_PAGE ? INPUT_SELECT_ITEMS_PER_PAGE : allOptions.length;
    var initialSlice = allOptions.slice(0, initialCount);

    // Create the dropdown content div directly (no overlay wrapper)
    // Mimics Calendar component: direct body child, fixed position, high z-index
    var dropdown = document.createElement('div');
    dropdown.id = overlayId;
    dropdown.className = 'ubits-dropdown-menu__content';
    // Force styles to match Calendar's success: fixed, max z-index, initially hidden
    // Note: removed max-height and overflow-y from here because inner ubits-dropdown-menu__options handles it.
    // Added overflow: visible !important to override class overflow: hidden which might clip shadows.
    dropdown.style.cssText = 'position:fixed;display:none;z-index:2147483647; overflow: visible !important; box-shadow: var(--ubits-elevation-overlay) !important; border-radius: var(--border-radius-sm); background: var(--ubits-bg-1);';

    // Build internal HTML manually (options)
    var optionsHtml = initialSlice.map(function (opt) {
        var optVal = opt.value != null ? String(opt.value) : '';
        var text = opt.text != null ? String(opt.text) : '';
        var selectedClass = optVal === valueStr ? ' ubits-dropdown-menu__option--selected' : '';

        // Escape HTML for safety
        var safeText = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
        var safeVal = optVal.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");

        return '<button type="button" class="ubits-dropdown-menu__option' + selectedClass + '" data-value="' + safeVal + '">' +
            '<span class="ubits-dropdown-menu__option-text">' + safeText + '</span>' +
            '</button>';
    }).join('');

    dropdown.innerHTML = '<div class="ubits-dropdown-menu__options">' + optionsHtml + '</div>';
    document.body.appendChild(dropdown);

    // Option click handler
    function onOptionClick(btn) {
        var val = btn.getAttribute('data-value') || '';
        var textEl = btn.querySelector('.ubits-dropdown-menu__option-text');
        var text = textEl ? textEl.textContent : '';
        inputElement.value = text;
        dropdown.style.display = 'none';
        if (typeof onChange === 'function') onChange(val);
    }

    // Attach event listeners via delegation
    dropdown.addEventListener('click', function (e) {
        e.stopPropagation(); // Prevent closing when clicking inside
        var btn = e.target.closest('.ubits-dropdown-menu__option');
        if (btn) {
            onOptionClick(btn);
        }
    });

    // Positioning logic (adapted from manual calculation to mimic overlay behavior but without the wrapper)
    function positionDropdown() {
        var gap = 4;
        var viewportPadding = 8;
        var vw = window.innerWidth;
        var vh = window.innerHeight;
        var rect = inputElement.getBoundingClientRect(); // Anchor to input

        // Reset display to measure
        dropdown.style.display = 'flex'; // dropdown-menu__content needs flex

        var contentWidth = dropdown.offsetWidth;
        // If content is too narrow, match input width
        if (rect.width > contentWidth) {
            dropdown.style.minWidth = rect.width + 'px';
            contentWidth = rect.width;
        }
        var contentHeight = dropdown.offsetHeight;

        // Default position: below-left
        var top = rect.bottom + gap;
        var left = rect.left;

        // Align right logic (optional, lets stick to left)
        if (left + contentWidth > vw - viewportPadding) {
            left = Math.max(viewportPadding, rect.right - contentWidth);
        }

        // Vertical positioning with flip
        var spaceBelow = vh - rect.bottom - gap - viewportPadding;
        var spaceAbove = rect.top - gap - viewportPadding;

        if (spaceBelow < contentHeight && spaceAbove >= contentHeight) {
            top = rect.top - contentHeight - gap; // Flip up
        } else if (spaceBelow < contentHeight && spaceAbove < contentHeight) {
            // Not enough space either way, prefer where there is MORE space
            if (spaceAbove > spaceBelow) {
                top = Math.max(viewportPadding, rect.top - contentHeight - gap);
            } else {
                top = Math.min(vh - contentHeight - viewportPadding, rect.bottom + gap);
            }
        }

        // Final viewport bounds check
        left = Math.max(viewportPadding, Math.min(vw - contentWidth - viewportPadding, left));

        dropdown.style.top = top + 'px';
        dropdown.style.left = left + 'px';
        dropdown.style.bottom = 'auto'; // Reset
    }

    // Input click handler
    inputElement.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();

        if (dropdown.style.display === 'none' || dropdown.style.display === '') {
            // Move to end of body to ensure top z-index (paint order)
            if (dropdown.parentNode) dropdown.parentNode.appendChild(dropdown);

            positionDropdown();
            // Double check position after render
            requestAnimationFrame(positionDropdown);
        } else {
            dropdown.style.display = 'none';
        }
    });

    // Close on click outside
    document.addEventListener('click', function (e) {
        // Checking if click is outside container AND outside dropdown
        if (!container.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.style.display = 'none';
        }
    }, true);

    // Lazy loading equivalent (simplified for this manual implementation)
    if (allOptions.length > INPUT_SELECT_ITEMS_PER_PAGE) {
        var optionsContainer = dropdown.querySelector('.ubits-dropdown-menu__options');
        var loadedCount = initialCount;
        var isLoading = false;
        if (optionsContainer) {
            optionsContainer.addEventListener('scroll', function () {
                if (isLoading || loadedCount >= allOptions.length) return;
                var el = optionsContainer;
                var threshold = 80;
                var nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - threshold;
                if (!nearBottom) return;
                isLoading = true;

                var loadingRow = document.createElement('div');
                loadingRow.className = 'ubits-dropdown-menu__loading';
                loadingRow.innerHTML = '<i class="far fa-spinner fa-spin"></i> Cargando items...';
                optionsContainer.appendChild(loadingRow);

                setTimeout(function () {
                    var nextSlice = allOptions.slice(loadedCount, loadedCount + INPUT_SELECT_ITEMS_PER_PAGE);
                    var newHtml = nextSlice.map(function (opt) {
                        var safeVal = (opt.value != null ? String(opt.value) : '').replace(/&/g, "&amp;").replace(/"/g, "&quot;");
                        var safeText = (opt.text != null ? String(opt.text) : '').replace(/&/g, "&amp;").replace(/</g, "&lt;");
                        return '<button type="button" class="ubits-dropdown-menu__option" data-value="' + safeVal + '">' +
                            '<span class="ubits-dropdown-menu__option-text">' + safeText + '</span></button>';
                    }).join('');

                    loadingRow.insertAdjacentHTML('beforebegin', newHtml);
                    loadingRow.remove();

                    loadedCount += nextSlice.length;
                    isLoading = false;
                }, INPUT_SELECT_LOAD_MORE_DELAY_MS);
            });
        }
    }
}

// Función para crear dropdown personalizado para SELECT (fallback si dropdown-menu.js no está cargado)
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

    // Crear y añadir una opción al dropdown (reutilizado por loadOptions y carga inicial)
    function appendOptionElement(option) {
        const optionElement = document.createElement('div');
        optionElement.className = 'ubits-select-option';
        optionElement.textContent = option.text;
        optionElement.dataset.value = option.value;
        optionElement.addEventListener('click', function () {
            const selectedValue = this.dataset.value;
            const selectedText = this.textContent;
            inputElement.value = selectedText;
            dropdown.style.display = 'none';
            if (onChange && typeof onChange === 'function') {
                onChange(selectedValue);
            }
        });
        dropdown.appendChild(optionElement);
        loadedOptions.push(option);
    }

    // Carga inicial al abrir: incluye la opción seleccionada y hace scroll hasta ella
    function loadInitialAndScrollToSelected() {
        const selectedIndex = value ? selectOptions.findIndex(opt => opt.value === value) : 0;
        const safeIndex = selectedIndex >= 0 ? selectedIndex : 0;
        const initialCount = Math.min(selectOptions.length, Math.max(itemsPerPage, safeIndex + 5));
        dropdown.innerHTML = '';
        loadedOptions = [];
        selectOptions.slice(0, initialCount).forEach(appendOptionElement);
        currentPage = Math.ceil(initialCount / itemsPerPage);
        dropdown.style.display = 'block';
        if (initialCount < selectOptions.length) {
            setupScrollObserver();
        }
        requestAnimationFrame(function () {
            const selectedEl = dropdown.querySelector('[data-value="' + (value || '') + '"]');
            if (selectedEl) {
                selectedEl.scrollIntoView({ block: 'nearest', behavior: 'auto' });
            }
        });
    }

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
            pageOptions.forEach(option => appendOptionElement(option));

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
    inputElement.addEventListener('click', function (e) {
        e.preventDefault();
        if (dropdown.style.display === 'none' || dropdown.style.display === '') {
            // Cargar hasta la opción seleccionada y hacer scroll hasta ella (ej. año 2026 visible sin scroll)
            loadInitialAndScrollToSelected();
        } else {
            dropdown.style.display = 'none';
        }
    });

    // Cerrar dropdown al hacer click fuera (capture para que funcione dentro de drawer/modal con stopPropagation)
    document.addEventListener('click', function (e) {
        if (!container.contains(e.target)) {
            dropdown.style.display = 'none';
        }
    }, true);
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
        variant = 'default',
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
        onBlur = null,
        multiple = false,
        showCheckboxes = false,
        calendarMaxDate = undefined,
        calendarMinDate = undefined
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

    function escapeAttr(str) {
        if (str == null) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }
    var safeValue = escapeAttr(value);
    var safePlaceholder = escapeAttr(placeholder);

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
    if (variant === 'subtle') {
        inputClasses.push('ubits-input--subtle');
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
        // SELECT - usar input normal pero readonly y con rightIcon angle-down (siempre, no chevron-down)
        const selectValue = value ? selectOptions.find(opt => opt.value === value)?.text || placeholder : placeholder;
        inputHTML += `<input type="text" class="${inputClasses.join(' ')}" style="${inputStyle}" value="${escapeAttr(selectValue)}" readonly>`;

        // Siempre usar angle-down en selects (icono desplegable)
        finalRightIcon = 'fa-angle-down';
        finalHasRightIcon = true;
    } else if (type === 'textarea') {
        console.log('Rendering TEXTAREA');
        // TEXTAREA - campo multilínea con redimensionamiento
        let textareaStyle = `width: 100%; min-height: 80px; resize: vertical; ${paddingLeft} ${paddingRight}`;
        if (state === 'disabled') {
            textareaStyle += `; background: var(--ubits-bg-3) !important; color: var(--ubits-fg-1-low) !important; border-color: var(--ubits-border-2) !important;`;
        }
        inputHTML += `<textarea class="${inputClasses.join(' ')}" style="${textareaStyle}" placeholder="${safePlaceholder}"${disabledAttr}${maxLengthAttr}>${safeValue}</textarea>`;
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
        inputHTML += `<input type="text" class="${inputClasses.join(' ')}" style="${searchStyle}" placeholder="${safePlaceholder}" value="${safeValue}" autocomplete="off"${disabledAttr}${maxLengthAttr}>`;
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
        inputHTML += `<input type="text" class="${inputClasses.join(' ')}" style="${autocompleteStyle}" placeholder="${safePlaceholder}" value="${safeValue}" autocomplete="off"${disabledAttr}${maxLengthAttr}>`;
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
        inputHTML += `<input type="text" class="${inputClasses.join(' ')}" style="${calendarStyle}" placeholder="${safePlaceholder}" value="${safeValue}" readonly${disabledAttr}>`;
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
        inputHTML += `<input type="password" class="${inputClasses.join(' ')}" style="${passwordStyle}" placeholder="${safePlaceholder}" value="${safeValue}"${disabledAttr}${maxLengthAttr}>`;
    } else {
        console.log('Rendering normal INPUT');
        // INPUT normal
        inputHTML += `<input type="${type}" class="${inputClasses.join(' ')}" style="${inputStyle}" placeholder="${safePlaceholder}" value="${safeValue}"${disabledAttr}${maxLengthAttr}>`;
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
            inputHTML += `<span class="ubits-input-helper-text">${helperText}</span>`;
        }

        if (showCounter) {
            inputHTML += '<div class="ubits-input-helper-row">';
            inputHTML += '<span class="ubits-input-counter-label">Máximo de caracteres</span>';
            inputHTML += `<span class="ubits-input-counter">0/${maxLength}</span>`;
            inputHTML += '</div>';
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

    // Si es SELECT, usar la nueva implementación con inyección en body (setupSelectWithDropdownMenu)
    // Ya no depende de dropdown-menu.js porque la función es autónoma.
    if (isSelect) {
        inputElement.style.cursor = 'pointer';
        setupSelectWithDropdownMenu(containerId, container, inputElement, selectOptions, value, placeholder, onChange);
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
            clearIcon.addEventListener('click', function (e) {
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
            clearIcon.addEventListener('click', function (e) {
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
        createAutocompleteDropdown(container, inputElement, autocompleteOptions, onChange, multiple, showCheckboxes);
    }

    // Si es CALENDAR, popup con el componente Calendar (createCalendar)
    if (type === 'calendar') {
        if (typeof window.createCalendar === 'function') {
            (function () {
                var pickerId = 'ubits-calendar-picker-' + (window._ubitsCalendarPickerId = (window._ubitsCalendarPickerId || 0) + 1);
                var wrapper = document.createElement('div');
                wrapper.id = pickerId;
                wrapper.className = 'ubits-calendar-dropdown';
                wrapper.style.cssText = 'position:fixed;display:none;z-index:10100;';
                document.body.appendChild(wrapper);
                function positionWrapper() {
                    var pad = 16;
                    /* Usar dimensiones reales del wrapper para alineación correcta (evita calendario "chueco") */
                    var w = wrapper.offsetWidth || 312;
                    var h = wrapper.offsetHeight || 382;
                    var rect = inputElement.getBoundingClientRect();
                    var vw = window.innerWidth;
                    var vh = window.innerHeight;
                    /* Alinear derecha del calendario con derecha del input */
                    var left = rect.right - w;
                    left = Math.max(pad, Math.min(vw - w - pad, left));
                    var top;
                    var spaceBelow = vh - rect.bottom - pad;
                    var spaceAbove = rect.top - pad;
                    var gapDown = 4;
                    var gapUp = 0; /* Pegado al input cuando abre hacia arriba (no "lejos") */
                    if (spaceBelow >= h) {
                        top = rect.bottom + gapDown;
                    } else if (spaceAbove >= h) {
                        top = rect.top - h - gapUp;
                    } else {
                        top = spaceBelow >= spaceAbove ? rect.bottom + gapDown : rect.top - h - gapUp;
                    }
                    top = Math.max(pad, Math.min(vh - h - pad, top));
                    wrapper.style.left = left + 'px';
                    wrapper.style.top = top + 'px';
                }
                var calendarOpts = {
                    containerId: pickerId,
                    onDateSelect: function (dateStr) {
                        inputElement.value = dateStr;
                        wrapper.style.display = 'none';
                        if (typeof onChange === 'function') onChange(dateStr);
                    }
                };
                if (calendarMaxDate != null) calendarOpts.maxDate = calendarMaxDate;
                if (calendarMinDate != null) calendarOpts.minDate = calendarMinDate;
                window.createCalendar(calendarOpts);
                inputElement.addEventListener('click', function () {
                    if (wrapper.style.display === 'none' || wrapper.style.display === '') {
                        wrapper.style.display = 'block';
                        positionWrapper();
                        /* Segundo pase tras layout: dimensiones reales = alineación correcta */
                        requestAnimationFrame(function () {
                            positionWrapper();
                        });
                    } else {
                        wrapper.style.display = 'none';
                    }
                });
                document.addEventListener('click', function (e) {
                    if (!container.contains(e.target) && !wrapper.contains(e.target)) {
                        wrapper.style.display = 'none';
                    }
                }, true);
            })();
        } else {
            console.warn('UBITS Input type calendar: carga components/calendar.js y components/calendar.css.');
        }
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
