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
 * ⚠️ TROUBLESHOOTING - SCROLL VERTICAL NO DESEADO:
 * =========================================================
 * Si la sección que contiene el header-product genera un scroll vertical no deseado,
 * el problema está en los estilos de overflow de los contenedores padres.
 * 
 * CAUSA: Los contenedores padres (.content-area, .content-sections, .section-single)
 * tienen `overflow-x: hidden` que puede causar comportamientos extraños de scroll
 * cuando hay elementos con sombras o que se extienden fuera del contenedor.
 * 
 * SOLUCIÓN (aplicada en general-styles/styles.css):
 * Cambiar `overflow-x: hidden` a `overflow: visible` en los contenedores:
 * 
 * ```css
 * .content-area,
 * .content-sections,
 * .section-single,
 * .section-dual,
 * .section-triple,
 * .section-quad {
 *     overflow: visible;
 * }
 * ```
 * 
 * NOTA: El CSS del componente (header-product.css) ya tiene `overflow: visible`
 * en .ubits-header-product y .widget-header-product, pero si los contenedores
 * padres tienen overflow hidden, el problema persiste.
 * 
 * Fecha de fix: Enero 2026
 * =========================================================
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
 *   - El título cambia de `ubits-heading-h2` a `ubits-body-md-bold` (16px, 700 weight)
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
 *     <div class="widget-header-product" id="header-product-container"></div>
 * </div>
 * ```
 * 
 * El componente automáticamente ocupará todo el ancho disponible y se ajustará
 * a su contenido sin alturas fijas.
 *
 * 🚨 REGLA OBLIGATORIA - EL HEADER NUNCA DEBE TENER CAJA:
 * Cuando el contenedor del header-product está dentro de .section-single (o .section-dual, etc.),
 * el sistema modular suele aplicar a los hijos fondo y padding (estilo "caja"). Para este
 * componente eso no debe aplicarse: el header debe verse plano, sin caja. En la página
 * que use el componente hay que añadir SIEMPRE esta regla CSS:
 *
 * ```css
 * .section-single > .widget-header-product {
 *     background-color: transparent !important;
 *     padding: 0 !important;
 * }
 * ```
 * (Desde subcarpetas usar el selector que corresponda al contenedor padre, por ejemplo
 * .section-single > .widget-header-product en el CSS de la página.)
 * Sin esta regla el header se verá como un bloque con fondo y padding, lo cual no es
 * el diseño deseado.
 *
 * ⚠️ ALINEACIÓN DE ACCIONES CUANDO SE OCULTA TÍTULO O BOTÓN ATRÁS:
 * Si en una página se oculta .ubits-header-product__product-info (por CSS, ej. display: none)
 * para no mostrar el título ni la flecha atrás, las acciones (botones) deben seguir
 * alineadas a la derecha como en el diseño oficial. Causa del fallo: product-info tiene
 * flex: 1 y empuja las acciones a la derecha; al ocultarlo, la fila solo tiene __actions
 * y en un flex sin más reglas los hijos quedan al inicio (izquierda). Solución en el
 * componente (header-product.css): .ubits-header-product__actions tiene margin-left: auto,
 * de modo que las acciones siempre se alinean a la derecha con o sin product-info visible.
 * No es necesario añadir justify-content: flex-end en la página.
 *
 * @param {string} containerId - ID del contenedor donde se renderizará el header-product.
 * @param {object} options - Opciones de configuración del header-product.
 * @param {string} [options.productName='Name product'] - Nombre del producto (título principal).
 * @param {Array} [options.breadcrumbItems] - Array de items del breadcrumb. Cada item debe tener {text: string, active: boolean}. Default: 3 items de ejemplo.
 * @param {Object} [options.backButton] - Configuración del botón de retroceso. {onClick: function}.
 * @param {Object} [options.infoButton] - Configuración del botón de información. {onClick: function}.
 * @param {Object} [options.aiButton] - Configuración del botón IA. {text: string, onClick: function}.
 * @param {Array} [options.secondaryButtons] - Botones secundarios. Cada uno: {text, icon?, onClick, iconRight?}. Si iconRight es true, el icono va a la derecha del texto.
 * @param {Object} [options.primaryButton] - Configuración del botón primario. {text: string, icon: string, onClick: function}.
 * @param {Object} [options.menuButton] - Configuración del botón menú. {onClick: function}.
 *
 * ========================================
 * IMPLEMENTACIÓN EN PÁGINAS - GUÍA COMPLETA
 * ========================================
 *
 * Hay dos enfoques para implementar el header-product en páginas:
 *
 * 1. VERSIÓN COMPLETA (Recomendada para nuevas experiencias):
 *    Incluye todos los elementos: back button, info button, breadcrumb, y todos los botones.
 *    Ideal para compañeros que están creando nuevas experiencias desde cero.
 *
 * 2. VERSIÓN LIGHT (Usada en la plataforma actual):
 *    Versión simplificada sin back button, sin info button, y sin breadcrumb.
 *    Refleja mejor el estado actual de la plataforma UBITS.
 *
 * ========================================
 * PASOS PARA IMPLEMENTAR EN UNA PÁGINA
 * ========================================
 *
 * PASO 1: Agregar los CSS imports necesarios en el <head>:
 * ```html
 * <link rel="stylesheet" href="components/button.css">
 * <link rel="stylesheet" href="components/ia-button.css">
 * <link rel="stylesheet" href="components/header-product.css">
 * ```
 *
 * PASO 2: OBLIGATORIO - Sin caja en el header. Agregar el estilo CSS para que el header
 * no tenga caja (fondo transparente, sin padding). Ver "REGLA OBLIGATORIA - EL HEADER NUNCA DEBE TENER CAJA" arriba.
 * ```css
 * .section-single > .widget-header-product {
 *     background-color: transparent !important;
 *     padding: 0 !important;
 * }
 * ```
 *
 * PASO 3: Agregar el contenedor en el HTML dentro de content-sections:
 * ```html
 * <div class="content-sections">
 *     <!-- Sección header-product -->
 *     <div class="section-single">
 *         <div class="widget-header-product" id="header-product-container"></div>
 *     </div>
 *     
 *     <!-- Resto del contenido -->
 *     <div class="section-single">
 *         <div class="widget-contenido">
 *             <!-- Tu contenido aquí -->
 *         </div>
 *     </div>
 * </div>
 * ```
 *
 * PASO 4: Agregar el script JavaScript antes de </body>:
 * ```html
 * <script src="components/header-product.js"></script>
 * ```
 *
 * PASO 5: Llamar a loadHeaderProduct en DOMContentLoaded (ver ejemplos abajo)
 *
 * ========================================
 * EJEMPLO 1: VERSIÓN COMPLETA (Nuevas experiencias)
 * ========================================
 * 
 * Esta versión incluye TODOS los elementos disponibles:
 * - Back button (navegación hacia atrás)
 * - Info button (información del producto)
 * - Breadcrumb (navegación jerárquica)
 * - AI button, Secondary buttons, Primary button, Menu button
 *
 * ```html
 * <script>
 *     document.addEventListener('DOMContentLoaded', function() {
 *         // ... otros componentes ...
 *         
 *         // Cargar header-product - VERSIÓN COMPLETA
 *         if (typeof loadHeaderProduct === 'function') {
 *             loadHeaderProduct('header-product-container', {
 *                 productName: 'Nombre del Producto',
 *                 breadcrumbItems: [
 *                     { text: 'Inicio', active: false },
 *                     { text: 'Categoría', active: false },
 *                     { text: 'Producto Actual', active: true }
 *                 ],
 *                 backButton: {
 *                     onClick: function() {
 *                         window.history.back();
 *                         // O redirigir a una página específica:
 *                         // window.location.href = 'pagina-anterior.html';
 *                     }
 *                 },
 *                 infoButton: {
 *                     onClick: function() {
 *                         console.log('Info button clicked');
 *                         // Mostrar información del producto
 *                     }
 *                 },
 *                 aiButton: {
 *                     text: 'AI button',
 *                     onClick: function() {
 *                         console.log('AI button clicked');
 *                     }
 *                 },
 *                 secondaryButtons: [
 *                     { text: 'Filtros', icon: 'fa-filter', onClick: function() { console.log('Filtros clicked'); } },
 *                     { text: 'Exportar', icon: 'fa-download', onClick: function() { console.log('Exportar clicked'); } }
 *                 ],
 *                 primaryButton: {
 *                     text: 'Guardar',
 *                     icon: 'fa-save',
 *                     onClick: function() {
 *                         console.log('Guardar clicked');
 *                     }
 *                 },
 *                 menuButton: {
 *                     onClick: function() {
 *                         console.log('Menu button clicked');
 *                     }
 *                 }
 *             });
 *         }
 *     });
 * </script>
 * ```
 *
 * ========================================
 * EJEMPLO 2: VERSIÓN LIGHT (Plataforma actual)
 * ========================================
 * 
 * Esta versión es más simple y refleja mejor el estado actual de la plataforma:
 * - Sin back button
 * - Sin info button
 * - Sin breadcrumb
 * - Solo botones de acción: AI button, Secondary buttons, Primary button, Menu button
 *
 * ```html
 * <script>
 *     document.addEventListener('DOMContentLoaded', function() {
 *         // ... otros componentes ...
 *         
 *         // Cargar header-product - VERSIÓN LIGHT
 *         if (typeof loadHeaderProduct === 'function') {
 *             loadHeaderProduct('header-product-container', {
 *                 productName: 'Nombre del Producto',
 *                 breadcrumbItems: [], // Array vacío para ocultar breadcrumb
 *                 aiButton: {
 *                     text: 'AI button',
 *                     onClick: function() {
 *                         console.log('AI button clicked');
 *                     }
 *                 },
 *                 secondaryButtons: [
 *                     { text: 'Button text', icon: 'fa-th', onClick: function() { console.log('Secondary button clicked'); } }
 *                 ],
 *                 primaryButton: {
 *                     text: 'Primary action',
 *                     icon: 'fa-th',
 *                     onClick: function() {
 *                         console.log('Primary button clicked');
 *                     }
 *                 },
 *                 menuButton: {
 *                     onClick: function() {
 *                         console.log('Menu button clicked');
 *                     }
 *                 }
 *             });
 *         }
 *     });
 * </script>
 * ```
 *
 * ========================================
 * CUÁNDO USAR CADA VERSIÓN
 * ========================================
 *
 * ✅ USAR VERSIÓN COMPLETA cuando:
 * - Estás creando una nueva experiencia desde cero
 * - Necesitas navegación jerárquica (breadcrumb)
 * - Necesitas botón de retroceso para navegar
 * - Necesitas botón de información para mostrar detalles
 * - Quieres aprovechar todas las funcionalidades del componente
 *
 * ✅ USAR VERSIÓN LIGHT cuando:
 * - Estás replicando el estado actual de la plataforma UBITS
 * - No necesitas navegación jerárquica
 * - No necesitas botón de retroceso
 * - Quieres un header más limpio y minimalista
 * - Solo necesitas botones de acción (AI, secundarios, primario, menú)
 *
 * ========================================
 * EJEMPLOS REALES EN EL PROYECTO
 * ========================================
 *
 * VERSIÓN COMPLETA:
 * - (No hay ejemplos actualmente, pero se puede usar en nuevas páginas)
 *
 * VERSIÓN LIGHT:
 * - evaluaciones-360.html
 * - objetivos.html
 * - modo-estudio-ia.html (tiene back button pero sin info button ni breadcrumb)
 *
 * ========================================
 * PATRÓN: BOTÓN PRIMARIO CON DROPDOWN MENU
 * ========================================
 *
 * Cuando el botón primario del header-product necesita abrir un menú desplegable
 * (en vez de una acción directa), se usa el componente oficial dropdown-menu.js
 * junto con openDropdownMenu({ alignRight: true }).
 *
 * ⚠️ IMPORTANTE - POSICIONAMIENTO EN MOBILE:
 * En mobile (≤ 767px), el botón primario se convierte en un FAB fijo (position:fixed,
 * bottom: ~92px, right: 16px). El componente openDropdownMenu calcula que hay espacio
 * debajo del FAB y posiciona el dropdown ahí, pero queda tapado por la tab-bar.
 * Por eso, SIEMPRE hay que forzar el dropdown ARRIBA del FAB en mobile.
 *
 * REQUISITOS ADICIONALES al patrón normal del header-product:
 * 1. CSS: <link rel="stylesheet" href="components/dropdown-menu.css">
 * 2. JS:  <script src="components/dropdown-menu.js"></script>
 *
 * PATRÓN COMPLETO (copiar y adaptar):
 * ```html
 * <script>
 * /* Menú dropdown del botón Crear – patrón oficial header-product * /
 * (function () {
 *     'use strict';
 *     var MENU_OVERLAY_ID = 'mi-pagina-crear-menu-overlay'; // ID único por página
 *     var menuOptions = [
 *         { text: 'Opción A', value: 'a', leftIcon: 'layer-group' },
 *         { text: 'Opción B', value: 'b', leftIcon: 'bullseye' }
 *     ];
 *     function ensureMenuOverlay() {
 *         if (document.getElementById(MENU_OVERLAY_ID)) return;
 *         if (typeof window.getDropdownMenuHtml !== 'function') return;
 *         var html = window.getDropdownMenuHtml({ overlayId: MENU_OVERLAY_ID, options: menuOptions });
 *         document.body.insertAdjacentHTML('beforeend', html);
 *         var overlay = document.getElementById(MENU_OVERLAY_ID);
 *         if (!overlay) return;
 *         var content = overlay.querySelector('.ubits-dropdown-menu__content');
 *         if (content) {
 *             content.addEventListener('click', function (e) {
 *                 var opt = e.target.closest('.ubits-dropdown-menu__option');
 *                 if (!opt) return;
 *                 var val = opt.getAttribute('data-value');
 *                 if (val === null || val === '') return;
 *                 if (typeof window.closeDropdownMenu === 'function') window.closeDropdownMenu(MENU_OVERLAY_ID);
 *                 // --- Aquí va la acción de cada opción ---
 *                 if (val === 'a') window.location.href = 'pagina-a.html';
 *                 if (val === 'b') window.location.href = 'pagina-b.html';
 *             });
 *         }
 *         overlay.addEventListener('click', function (e) {
 *             if (e.target === overlay && typeof window.closeDropdownMenu === 'function') {
 *                 window.closeDropdownMenu(MENU_OVERLAY_ID);
 *             }
 *         });
 *     }
 *     function openCrearMenu(anchorElement) {
 *         if (!anchorElement || !anchorElement.getBoundingClientRect) return;
 *         if (typeof window.openDropdownMenu !== 'function' || typeof window.closeDropdownMenu !== 'function') return;
 *         var overlay = document.getElementById(MENU_OVERLAY_ID);
 *         if (overlay && overlay.style.display === 'block') {
 *             window.closeDropdownMenu(MENU_OVERLAY_ID);
 *             return;
 *         }
 *         ensureMenuOverlay();
 *         window.openDropdownMenu(MENU_OVERLAY_ID, anchorElement, { alignRight: true });
 *         // ── MOBILE FIX: forzar dropdown ARRIBA del FAB ──
 *         // Sin esto el dropdown queda debajo del FAB, tapado por la tab-bar.
 *         if (window.matchMedia('(max-width: 767px)').matches) {
 *             var ov = document.getElementById(MENU_OVERLAY_ID);
 *             if (!ov) return;
 *             var ct = ov.querySelector('.ubits-dropdown-menu__content');
 *             if (!ct) return;
 *             var rect = anchorElement.getBoundingClientRect();
 *             ct.style.top = (rect.top - ct.offsetHeight - 4) + 'px';
 *         }
 *     }
 *     window.openCrearMenu = openCrearMenu;
 * })();
 * </script>
 * ```
 *
 * Luego, en la configuración del header-product, conectar el onClick del primaryButton:
 * ```javascript
 * loadHeaderProduct('header-product-container', {
 *     productName: 'Mi Producto',
 *     breadcrumbItems: [],
 *     primaryButton: {
 *         text: 'Crear',
 *         icon: 'fa-plus',
 *         onClick: function(e) {
 *             e.preventDefault();
 *             e.stopPropagation();
 *             if (typeof window.openCrearMenu === 'function') window.openCrearMenu(e.currentTarget);
 *         }
 *     }
 * });
 * ```
 *
 * CSS RECOMENDADO en la página (z-index del dropdown por encima del FAB y tab-bar):
 * ```css
 * .mi-pagina #mi-pagina-crear-menu-overlay.ubits-dropdown-menu__overlay { z-index: 1102; }
 * .mi-pagina #mi-pagina-crear-menu-overlay .ubits-dropdown-menu__content { z-index: 1103; }
 * /* Evitar que los items del dropdown se partan en 2 líneas * /
 * .mi-pagina .ubits-dropdown-menu__option-text { white-space: nowrap; }
 * ```
 *
 * PÁGINAS DE REFERENCIA:
 * - tareas/planes.html + tareas/planes.js (4 opciones: plan, tarea, plantilla, IA)
 * - lms-creator/planes-formacion.html (2 opciones: plan contenidos, plan competencias)
 *
 * ========================================
 * NOTAS IMPORTANTES
 * ========================================
 *
 * - El componente es completamente flexible: puedes incluir o excluir cualquier elemento
 * - Si no pasas una opción (ej: backButton), ese elemento no se renderiza
 * - Para ocultar breadcrumb, pasa breadcrumbItems: [] (array vacío)
 * - Todos los botones son opcionales excepto productName (requerido)
 * - El componente se adapta automáticamente a móvil y desktop
 */

/**
 * Crea el HTML del header-product
 * @param {Object} options - Opciones de configuración
 * @param {string} options.productName - Nombre del producto
 * @param {Array} options.breadcrumbItems - Array de items del breadcrumb [{text: 'Default', active: false}, ...]
 * @param {Object} options.backButton - Configuración del botón back {onClick: function}
 * @param {Object} options.infoButton - Configuración del botón de información {onClick: function}
 * @param {Object} options.aiButton - Configuración del botón IA {text: 'AI button', onClick: function}
 * @param {Array} options.secondaryButtons - [{text, icon?, onClick, iconRight?}, ...]
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
        menuButton = null,
        variant = 'default', // 'default' | 'tabs-with-actions'
        tabs = [], // Para variant tabs-with-actions: [{ id: string, label: string }, ...]
        activeTabId = null, // Para variant tabs-with-actions: id del tab activo
        _containerId = '' // Uso interno: ID del contenedor para generar ID del save-indicator
    } = options;
    const saveIndicatorId = _containerId ? _containerId + '-save-indicator' : 'header-product-save-indicator';
    
    // Si breadcrumbItems no se pasó o es undefined, usar array vacío
    const finalBreadcrumbItems = breadcrumbItems !== undefined ? breadcrumbItems : [];
    const isTabsVariant = variant === 'tabs-with-actions' && tabs && tabs.length > 0;

    // --- Variante tabs-with-actions: solo una fila (tabs + acciones), sin breadcrumb ---
    if (isTabsVariant) {
        const tabsHTML = tabs.map(t => {
            const isActive = activeTabId === t.id;
            return `<button type="button" class="ubits-tab ${isActive ? 'ubits-tab--active' : ''}" data-tab-id="${t.id}" data-tab="${t.id}" role="tab" aria-selected="${isActive}">
                <span>${t.label}</span>
            </button>`;
        }).join('');

        const saveIndicatorHTML = `<div class="ubits-header-product__save-indicator-wrap" id="${saveIndicatorId}"></div>`;
        const aiButtonHTML = aiButton ? `
            <button class="ubits-ia-button ubits-ia-button--secondary ubits-ia-button--md" ${aiButton.onClick ? `onclick="${aiButton.onClick}"` : ''}>
                <i class="far fa-sparkles"></i>
                <span>${aiButton.text || 'AI button'}</span>
            </button>
        ` : '';
        const secondaryButtonsHTML = secondaryButtons.map(btn => {
            const iconHtml = btn.icon ? `<i class="far ${btn.icon}"></i>` : '';
            const textHtml = `<span>${btn.text || 'Button text'}</span>`;
            const inner = btn.iconRight && btn.icon ? `${textHtml}${iconHtml}` : `${iconHtml}${textHtml}`;
            return `
            <button class="ubits-button ubits-button--secondary ubits-button--md" ${btn.onClick ? `onclick="${btn.onClick}"` : ''}>
                ${inner}
            </button>`;
        }).join('');
        const primaryButtonHTML = primaryButton ? `
            <button class="ubits-button ubits-button--primary ubits-button--md ubits-header-product__primary-action" ${primaryButton.onClick ? `onclick="${primaryButton.onClick}"` : ''}>
                ${primaryButton.icon ? `<i class="far ${primaryButton.icon}"></i>` : ''}
                <span>${primaryButton.text || 'Primary action'}</span>
            </button>
        ` : '';
        const menuButtonHTML = menuButton ? `
            <button class="ubits-button ubits-button--tertiary ubits-button--md ubits-button--icon-only" ${menuButton.onClick ? `onclick="${menuButton.onClick}"` : ''}>
                <i class="far fa-ellipsis-v"></i>
            </button>
        ` : '';
        const actionsHTML = (saveIndicatorHTML || aiButtonHTML || secondaryButtonsHTML || primaryButtonHTML || menuButtonHTML) ? `
            <div class="ubits-header-product__actions">
                ${saveIndicatorHTML}
                ${aiButtonHTML}
                ${secondaryButtonsHTML}
                ${primaryButtonHTML}
                ${menuButtonHTML}
            </div>
        ` : '';

        return `
        <div class="ubits-header-product ubits-header-product--tabs-with-actions">
            <div class="ubits-header-product__primary-row">
                <div class="ubits-header-product__tabs" role="tablist">
                    ${tabsHTML}
                </div>
                ${actionsHTML}
            </div>
        </div>
        `;
    }

    // --- Variante default ---

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

    // Contenedor save-indicator (a la izquierda del botón IA). Por defecto vacío (apagado); la página puede llamar renderSaveIndicator(containerId + '-save-indicator', options).
    const saveIndicatorHTML = `<div class="ubits-header-product__save-indicator-wrap" id="${saveIndicatorId}"></div>`;

    // Botón IA
    const aiButtonHTML = aiButton ? `
        <button class="ubits-ia-button ubits-ia-button--secondary ubits-ia-button--md" ${aiButton.onClick ? `onclick="${aiButton.onClick}"` : ''}>
            <i class="far fa-sparkles"></i>
            <span>${aiButton.text || 'AI button'}</span>
        </button>
    ` : '';

    // Botones secundarios (iconRight: true → texto antes del icono, ej. selector tipo dropdown)
    const secondaryButtonsHTML = secondaryButtons.map(btn => {
        const iconHtml = btn.icon ? `<i class="far ${btn.icon}"></i>` : '';
        const textHtml = `<span>${btn.text || 'Button text'}</span>`;
        const inner = btn.iconRight && btn.icon ? `${textHtml}${iconHtml}` : `${iconHtml}${textHtml}`;
        return `
        <button class="ubits-button ubits-button--secondary ubits-button--md" ${btn.onClick ? `onclick="${btn.onClick}"` : ''}>
            ${inner}
        </button>`;
    }).join('');

    // Botón primario
    const primaryButtonHTML = primaryButton ? `
        <button class="ubits-button ubits-button--primary ubits-button--md ubits-header-product__primary-action" ${primaryButton.onClick ? `onclick="${primaryButton.onClick}"` : ''}>
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

    // Renderizar acciones solo si hay botones (save-indicator está en product-title, a la derecha del info)
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
                    
                    <!-- Título del producto, botón info y save indicator (save indicator a la derecha del info) -->
                    <div class="ubits-header-product__product-title">
                        <h2 class="ubits-heading-h2">${productName}</h2>
                        ${infoButtonHTML}
                        <div class="ubits-header-product__save-indicator-wrap" id="${saveIndicatorId}"></div>
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
 * @param {Array} [options.secondaryButtons] - Botones secundarios. Cada uno: {text, icon?, onClick, iconRight?}. Si iconRight es true, el icono va a la derecha del texto.
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

    const html = createHeaderProductHTML({ ...options, _containerId: containerId });
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
        const primaryBtn = container.querySelector('.ubits-header-product__actions .ubits-header-product__primary-action');
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

    // Variante tabs-with-actions: listeners para tabs
    if (options.variant === 'tabs-with-actions' && options.tabs && options.tabs.length > 0 && typeof options.onTabChange === 'function') {
        const tabButtons = container.querySelectorAll('.ubits-header-product__tabs .ubits-tab');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const tabId = this.getAttribute('data-tab-id');
                if (!tabId) return;
                tabButtons.forEach(b => {
                    b.classList.remove('ubits-tab--active');
                    b.setAttribute('aria-selected', 'false');
                });
                this.classList.add('ubits-tab--active');
                this.setAttribute('aria-selected', 'true');
                options.onTabChange(tabId);
            });
        });
    }
}

// Exportar funciones para uso global
window.createHeaderProductHTML = createHeaderProductHTML;
window.loadHeaderProduct = loadHeaderProduct;

