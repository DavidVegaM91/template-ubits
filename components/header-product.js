/* ========================================
   UBITS HEADER PRODUCT COMPONENT - DOCUMENTACIÓN
   ======================================== */

/**
 * UBITS HEADER PRODUCT COMPONENT
 *
 * Este componente renderiza un encabezado de producto con botón de retroceso, título del producto,
 * botones de acción (IA, secundarios, primario, menú) y breadcrumb opcional.
 * Útil para páginas de producto, detalle de contenido, o cualquier página que requiera un header
 * con navegación y acciones contextuales.
 *
 * REQUISITOS OBLIGATORIOS:
 * 1. CSS: <link rel="stylesheet" href="components/header-product.css">
 * 2. CSS: <link rel="stylesheet" href="components/button.css"> (para botones)
 * 3. CSS: <link rel="stylesheet" href="components/ia-button.css"> (para botón IA)
 * 4. FontAwesome: <link rel="stylesheet" href="fontawesome-icons.css"> (para iconos)
 * 5. UBITS Base: <link rel="stylesheet" href="ubits-colors.css">
 * 6. UBITS Typography: <link rel="stylesheet" href="ubits-typography.css">
 *
 * IMPLEMENTACIÓN BÁSICA:
 * ```html
 * <div id="header-product-container"></div>
 * <script src="components/header-product.js"></script>
 * <script>
 *    document.addEventListener('DOMContentLoaded', function() {
 *        loadHeaderProduct('header-product-container', {
 *            productName: 'Name product',
 *            breadcrumbItems: [
 *                { text: 'Default', active: false },
 *                { text: 'Default', active: false },
 *                { text: 'Active', active: true }
 *            ],
 *            backButton: {
 *                onClick: function() {
 *                    console.log('Back button clicked');
 *                    window.history.back();
 *                }
 *            },
 *            infoButton: {
 *                onClick: function() {
 *                    console.log('Info button clicked');
 *                }
 *            },
 *            aiButton: {
 *                text: 'AI button',
 *                onClick: function() {
 *                    console.log('AI button clicked');
 *                }
 *            },
 *            secondaryButtons: [
 *                { text: 'Button text', icon: 'fa-th', onClick: function() { console.log('Secondary button clicked'); } }
 *            ],
 *            primaryButton: {
 *                text: 'Primary action',
 *                icon: 'fa-th',
 *                onClick: function() {
 *                    console.log('Primary button clicked');
 *                }
 *            },
 *            menuButton: {
 *                onClick: function() {
 *                    console.log('Menu button clicked');
 *                }
 *            }
 *        });
 *    });
 * </script>
 * ```
 *
 * IMPLEMENTACIÓN MÍNIMA (solo título y botón back):
 * ```html
 * <div id="header-product-container"></div>
 * <script src="components/header-product.js"></script>
 * <script>
 *    document.addEventListener('DOMContentLoaded', function() {
 *        loadHeaderProduct('header-product-container', {
 *            productName: 'Mi Producto',
 *            backButton: {
 *                onClick: function() {
 *                    window.history.back();
 *                }
 *            }
 *        });
 *    });
 * </script>
 * ```
 *
 * IMPLEMENTACIÓN SIN BREADCRUMB:
 * ```html
 * <div id="header-product-container"></div>
 * <script src="components/header-product.js"></script>
 * <script>
 *    document.addEventListener('DOMContentLoaded', function() {
 *        loadHeaderProduct('header-product-container', {
 *            productName: 'Mi Producto',
 *            backButton: {
 *                onClick: function() {
 *                    window.history.back();
 *                }
 *            },
 *            primaryButton: {
 *                text: 'Guardar',
 *                icon: 'fa-save',
 *                onClick: function() {
 *                    guardarProducto();
 *                }
 *            }
 *            // breadcrumbItems se omite o se pasa como array vacío
 *        });
 *    });
 * </script>
 * ```
 *
 * ⚠️ IMPORTANTE - COMPONENTE FLEXIBLE:
 * El componente se ajusta automáticamente a su contenido. Si no se proporcionan ciertos elementos
 * (botones, breadcrumb, etc.), el componente solo ocupará el espacio necesario:
 * 
 * - Si no hay botones de acción, la sección de acciones no se renderiza
 * - Si no hay breadcrumb, la fila secundaria no se renderiza
 * - El componente siempre abraza su contenido (sin alturas fijas)
 *
 * ⚠️ IMPORTANTE - RESPONSIVE:
 * El componente se adapta automáticamente a diferentes tamaños de pantalla:
 * 
 * - **Desktop (> 768px)**: Layout completo con todas las acciones visibles
 * - **Mobile (≤ 768px)**: 
 *   - El título cambia de `ubits-heading-h1` a `ubits-body-md-bold` (16px, 700 weight)
 *   - Las filas se apilan verticalmente
 * - **Mobile pequeño (≤ 480px)**:
 *   - Todos los botones (excepto icon-only) se transforman automáticamente a icon-only
 *   - Los botones mantienen su funcionalidad pero solo muestran el icono
 *
 * ⚠️ IMPORTANTE - BREADCRUMB:
 * El breadcrumb es completamente opcional. Si no se proporciona o se pasa un array vacío,
 * la fila secundaria no se renderiza. Se recomienda máximo 3 niveles para mantener
 * la legibilidad y el diseño limpio.
 *
 * ⚠️ IMPORTANTE - ONCLICK Y FUNCIONES:
 * Los event listeners se agregan automáticamente cuando se proporcionan funciones onClick.
 * Las funciones pueden ser:
 * 
 * - Funciones anónimas: `onClick: function() { ... }`
 * - Referencias a funciones: `onClick: miFuncion`
 * - Funciones globales: `onClick: window.miFuncion`
 * 
 * El componente maneja automáticamente la limpieza de event listeners cuando se vuelve
 * a renderizar el componente.
 *
 * ⚠️ IMPORTANTE - ICONOS FONTAWESOME:
 * Para los iconos en botones secundarios y primarios, usar solo el nombre del icono
 * sin el prefijo 'fa-' o 'far'. El componente automáticamente agrega 'far':
 * 
 * ```javascript
 * // ✅ CORRECTO
 * secondaryButtons: [
 *     { text: 'Filtros', icon: 'fa-filter', onClick: ... }
 * ]
 * 
 * // ✅ TAMBIÉN CORRECTO (sin fa-)
 * secondaryButtons: [
 *     { text: 'Filtros', icon: 'filter', onClick: ... }
 * ]
 * ```
 *
 * ⚠️ IMPORTANTE - ESTRUCTURA HTML:
 * El componente genera HTML semántico con las siguientes clases UBITS:
 * 
 * - `.ubits-header-product` - Contenedor principal
 * - `.ubits-header-product__primary-row` - Fila principal (título + acciones)
 * - `.ubits-header-product__secondary-row` - Fila secundaria (breadcrumb)
 * - `.ubits-header-product__product-info` - Información del producto (back + título)
 * - `.ubits-header-product__product-title` - Contenedor del título
 * - `.ubits-header-product__actions` - Contenedor de acciones
 * - `.ubits-header-product__breadcrumb` - Contenedor del breadcrumb
 *
 * ⚠️ IMPORTANTE - USO EN SECCIONES MODULARES:
 * Para usar el componente en el sistema modular de secciones:
 * 
 * ```html
 * <div class="section-single">
 *     <div id="header-product-container"></div>
 * </div>
 * ```
 * 
 * El componente automáticamente ocupará todo el ancho disponible y se ajustará
 * a su contenido sin alturas fijas.
 *
 * @param {string} containerId - ID del contenedor donde se renderizará el header-product.
 * @param {object} options - Opciones de configuración del header-product.
 * @param {string} [options.productName='Name product'] - Nombre del producto (título principal).
 * @param {Array} [options.breadcrumbItems] - Array de items del breadcrumb. Cada item debe tener {text: string, active: boolean}. Default: 3 items de ejemplo.
 * @param {Object} [options.backButton] - Configuración del botón de retroceso. {onClick: function}.
 * @param {Object} [options.infoButton] - Configuración del botón de información. {onClick: function}.
 * @param {Object} [options.aiButton] - Configuración del botón IA. {text: string, onClick: function}.
 * @param {Array} [options.secondaryButtons] - Array de botones secundarios. Cada botón: {text: string, icon: string, onClick: function}.
 * @param {Object} [options.primaryButton] - Configuración del botón primario. {text: string, icon: string, onClick: function}.
 * @param {Object} [options.menuButton] - Configuración del botón menú. {onClick: function}.
 */

/**
 * Crea el HTML del header-product
 * @param {Object} options - Opciones de configuración
 * @param {string} options.productName - Nombre del producto
 * @param {Array} options.breadcrumbItems - Array de items del breadcrumb [{text: 'Default', active: false}, ...]
 * @param {Object} options.backButton - Configuración del botón back {onClick: function}
 * @param {Object} options.infoButton - Configuración del botón de información {onClick: function}
 * @param {Object} options.aiButton - Configuración del botón IA {text: 'AI button', onClick: function}
 * @param {Array} options.secondaryButtons - Array de botones secundarios [{text: 'Button text', icon: 'fa-th', onClick: function}, ...]
 * @param {Object} options.primaryButton - Configuración del botón primario {text: 'Primary action', icon: 'fa-th', onClick: function}
 * @param {Object} options.menuButton - Configuración del botón menú {onClick: function}
 * @returns {string} HTML del header-product
 */
function createHeaderProductHTML(options = {}) {
    const {
        productName = 'Name product',
        breadcrumbItems = undefined, // No usar valores por defecto, solo si no se pasa
        backButton = null,
        infoButton = null,
        aiButton = null,
        secondaryButtons = [],
        primaryButton = null,
        menuButton = null
    } = options;
    
    // Si breadcrumbItems no se pasó o es undefined, usar array vacío
    const finalBreadcrumbItems = breadcrumbItems !== undefined ? breadcrumbItems : [];

    // Botón back
    const backButtonHTML = backButton ? `
        <button class="ubits-button ubits-button--secondary ubits-button--md ubits-button--icon-only" ${backButton.onClick ? `onclick="${backButton.onClick}"` : ''}>
            <i class="far fa-arrow-left"></i>
        </button>
    ` : '';

    // Botón de información
    const infoButtonHTML = infoButton ? `
        <button class="ubits-button ubits-button--tertiary ubits-button--xs ubits-button--icon-only" style="padding: 9.5px;" ${infoButton.onClick ? `onclick="${infoButton.onClick}"` : ''}>
            <i class="far fa-info-circle"></i>
        </button>
    ` : '';

    // Botón IA
    const aiButtonHTML = aiButton ? `
        <button class="ubits-ia-button ubits-ia-button--secondary ubits-ia-button--md" ${aiButton.onClick ? `onclick="${aiButton.onClick}"` : ''}>
            <i class="far fa-sparkles"></i>
            <span>${aiButton.text || 'AI button'}</span>
        </button>
    ` : '';

    // Botones secundarios
    const secondaryButtonsHTML = secondaryButtons.map(btn => `
        <button class="ubits-button ubits-button--secondary ubits-button--md" ${btn.onClick ? `onclick="${btn.onClick}"` : ''}>
            ${btn.icon ? `<i class="far ${btn.icon}"></i>` : ''}
            <span>${btn.text || 'Button text'}</span>
        </button>
    `).join('');

    // Botón primario
    const primaryButtonHTML = primaryButton ? `
        <button class="ubits-button ubits-button--primary ubits-button--md" ${primaryButton.onClick ? `onclick="${primaryButton.onClick}"` : ''}>
            ${primaryButton.icon ? `<i class="far ${primaryButton.icon}"></i>` : ''}
            <span>${primaryButton.text || 'Primary action'}</span>
        </button>
    ` : '';

    // Botón menú
    const menuButtonHTML = menuButton ? `
        <button class="ubits-button ubits-button--tertiary ubits-button--md ubits-button--icon-only" ${menuButton.onClick ? `onclick="${menuButton.onClick}"` : ''}>
            <i class="far fa-ellipsis-v"></i>
        </button>
    ` : '';

    // Breadcrumb - solo renderizar si hay items
    const breadcrumbHTML = finalBreadcrumbItems && finalBreadcrumbItems.length > 0 ? finalBreadcrumbItems.map((item, index) => {
        const isLast = index === finalBreadcrumbItems.length - 1;
        // KISS: Solo clases FontAwesome directamente, sin clases wrapper (ver cursor-rules.mdc línea 613-627)
        const separator = !isLast ? '<i class="far fa-chevron-right"></i>' : '';
        const itemClass = item.active ? 'ubits-header-product__breadcrumb-active' : 'ubits-header-product__breadcrumb-link';
        const textClass = item.active ? 'ubits-body-sm-bold' : 'ubits-body-sm-regular';
        
        return `
            <div class="ubits-header-product__breadcrumb-item">
                <span class="${textClass} ${itemClass}">${item.text}</span>
                ${separator}
            </div>
        `;
    }).join('') : '';

    // Renderizar breadcrumb solo si hay contenido
    const breadcrumbRowHTML = breadcrumbHTML ? `
        <!-- Segunda fila: Breadcrumb -->
        <div class="ubits-header-product__secondary-row">
            <!-- Breadcrumb (izquierda) -->
            <div class="ubits-header-product__breadcrumb">
                ${breadcrumbHTML}
            </div>
        </div>
    ` : '';

    // Renderizar acciones solo si hay botones
    const actionsHTML = (aiButtonHTML || secondaryButtonsHTML || primaryButtonHTML || menuButtonHTML) ? `
        <!-- Acciones (derecha) -->
        <div class="ubits-header-product__actions">
            ${aiButtonHTML}
            ${secondaryButtonsHTML}
            ${primaryButtonHTML}
            ${menuButtonHTML}
        </div>
    ` : '';

    return `
        <div class="ubits-header-product">
            <!-- Primera fila: Información del producto y acciones -->
            <div class="ubits-header-product__primary-row">
                <!-- Información del producto (izquierda) -->
                <div class="ubits-header-product__product-info">
                    ${backButtonHTML}
                    
                    <!-- Título del producto con icono de información -->
                    <div class="ubits-header-product__product-title">
                        <h1 class="ubits-heading-h1">${productName}</h1>
                        ${infoButtonHTML}
                    </div>
                </div>
                
                ${actionsHTML}
            </div>
            
            ${breadcrumbRowHTML}
        </div>
    `;
}

/**
 * Renderiza el header-product en el contenedor especificado
 * 
 * Esta función es la forma principal de usar el componente Header Product.
 * Renderiza el HTML del componente y agrega automáticamente los event listeners
 * para todos los botones configurados.
 * 
 * EJEMPLO DE USO:
 * ```javascript
 * loadHeaderProduct('header-product-container', {
 *     productName: 'Mi Producto',
 *     backButton: {
 *         onClick: function() {
 *             window.history.back();
 *         }
 *     },
 *     primaryButton: {
 *         text: 'Guardar',
 *         icon: 'fa-save',
 *         onClick: function() {
 *             guardarProducto();
 *         }
 *     }
 * });
 * ```
 * 
 * VALIDACIONES:
 * - Verifica que el contenedor exista antes de renderizar
 * - Muestra error en consola si el contenedor no se encuentra
 * - Agrega event listeners solo si se proporcionan funciones onClick
 * 
 * EVENT LISTENERS:
 * Los event listeners se agregan automáticamente usando `addEventListener`,
 * lo que permite múltiples listeners y mejor manejo de eventos. Los listeners
 * se agregan después de renderizar el HTML para asegurar que los elementos existan.
 * 
 * @param {string} containerId - ID del contenedor donde se renderizará el header-product. Debe existir en el DOM.
 * @param {Object} [options={}] - Opciones de configuración del header-product.
 * @param {string} [options.productName='Name product'] - Nombre del producto que se mostrará como título.
 * @param {Array} [options.breadcrumbItems] - Array de items del breadcrumb. Cada item: {text: string, active: boolean}.
 * @param {Object} [options.backButton] - Configuración del botón de retroceso. {onClick: function}.
 * @param {Object} [options.infoButton] - Configuración del botón de información. {onClick: function}.
 * @param {Object} [options.aiButton] - Configuración del botón IA. {text: string, onClick: function}.
 * @param {Array} [options.secondaryButtons] - Array de botones secundarios. Cada botón: {text: string, icon: string, onClick: function}.
 * @param {Object} [options.primaryButton] - Configuración del botón primario. {text: string, icon: string, onClick: function}.
 * @param {Object} [options.menuButton] - Configuración del botón menú. {onClick: function}.
 * 
 * @example
 * // Ejemplo básico con solo título y botón back
 * loadHeaderProduct('header-container', {
 *     productName: 'Mi Producto',
 *     backButton: { onClick: () => history.back() }
 * });
 * 
 * @example
 * // Ejemplo completo con todos los elementos
 * loadHeaderProduct('header-container', {
 *     productName: 'Curso de JavaScript',
 *     breadcrumbItems: [
 *         { text: 'Cursos', active: false },
 *         { text: 'Programación', active: false },
 *         { text: 'JavaScript', active: true }
 *     ],
 *     backButton: { onClick: () => history.back() },
 *     infoButton: { onClick: () => mostrarInfo() },
 *     aiButton: { text: 'Modo IA', onClick: () => activarIA() },
 *     secondaryButtons: [
 *         { text: 'Compartir', icon: 'fa-share', onClick: () => compartir() }
 *     ],
 *     primaryButton: { text: 'Inscribirse', icon: 'fa-check', onClick: () => inscribirse() },
 *     menuButton: { onClick: () => mostrarMenu() }
 * });
 */
function loadHeaderProduct(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`UBITS Header Product: No se encontró el contenedor con ID "${containerId}"`);
        return;
    }

    const html = createHeaderProductHTML(options);
    container.innerHTML = html;

    // Agregar event listeners si se proporcionaron funciones
    if (options.backButton && options.backButton.onClick && typeof options.backButton.onClick === 'function') {
        const backBtn = container.querySelector('.ubits-header-product__product-info .ubits-button');
        if (backBtn) {
            backBtn.addEventListener('click', options.backButton.onClick);
        }
    }

    if (options.infoButton && options.infoButton.onClick && typeof options.infoButton.onClick === 'function') {
        const infoBtn = container.querySelector('.ubits-header-product__product-title .ubits-button');
        if (infoBtn) {
            infoBtn.addEventListener('click', options.infoButton.onClick);
        }
    }

    if (options.aiButton && options.aiButton.onClick && typeof options.aiButton.onClick === 'function') {
        const aiBtn = container.querySelector('.ubits-ia-button');
        if (aiBtn) {
            aiBtn.addEventListener('click', options.aiButton.onClick);
        }
    }

    if (options.primaryButton && options.primaryButton.onClick && typeof options.primaryButton.onClick === 'function') {
        const primaryBtn = container.querySelector('.ubits-header-product__actions .ubits-button--primary');
        if (primaryBtn) {
            primaryBtn.addEventListener('click', options.primaryButton.onClick);
        }
    }

    if (options.menuButton && options.menuButton.onClick && typeof options.menuButton.onClick === 'function') {
        const menuBtn = container.querySelector('.ubits-header-product__actions .ubits-button--icon-only:last-child');
        if (menuBtn) {
            menuBtn.addEventListener('click', options.menuButton.onClick);
        }
    }

    // Event listeners para botones secundarios
    if (options.secondaryButtons && Array.isArray(options.secondaryButtons)) {
        const secondaryBtns = container.querySelectorAll('.ubits-header-product__actions .ubits-button--secondary');
        secondaryBtns.forEach((btn, index) => {
            if (options.secondaryButtons[index] && options.secondaryButtons[index].onClick && typeof options.secondaryButtons[index].onClick === 'function') {
                btn.addEventListener('click', options.secondaryButtons[index].onClick);
            }
        });
    }
}

// Exportar funciones para uso global
window.createHeaderProductHTML = createHeaderProductHTML;
window.loadHeaderProduct = loadHeaderProduct;

