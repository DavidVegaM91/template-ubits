/* ========================================
   UBITS EMPTY STATE COMPONENT - DOCUMENTACIÓN
   ======================================== */

/**
 * UBITS EMPTY STATE COMPONENT
 *
 * Este componente renderiza un estado vacío con icono, título, descripción y dos botones de acción.
 * Útil para mostrar cuando no hay contenido disponible, resultados de búsqueda, o estados iniciales.
 *
 * REQUISITOS OBLIGATORIOS:
 * 1. CSS: <link rel="stylesheet" href="components/empty-state.css">
 * 2. CSS: <link rel="stylesheet" href="components/button.css"> (para los botones)
 * 3. FontAwesome: <link rel="stylesheet" href="fontawesome-icons.css"> (para el icono)
 * 4. UBITS Base: <link rel="stylesheet" href="ubits-colors.css">
 * 5. UBITS Typography: <link rel="stylesheet" href="ubits-typography.css">
 *
 * IMPLEMENTACIÓN BÁSICA:
 * ```html
 * <div id="mi-empty-state-container"></div>
 * <script>
 *    document.addEventListener('DOMContentLoaded', function() {
 *        loadEmptyState('mi-empty-state-container', {
 *            icon: 'fa-grid',
 *            title: 'No se encontraron resultados',
 *            description: 'Intenta ajustar los filtros de búsqueda para encontrar lo que buscas.',
 *            buttons: {
 *                secondary: {
 *                    text: 'Cancelar',
 *                    icon: 'fa-times',
 *                    onClick: function() {
 *                        console.log('Cancelar');
 *                    }
 *                },
 *                primary: {
 *                    text: 'Buscar',
 *                    icon: 'fa-search',
 *                    onClick: function() {
 *                        console.log('Buscar');
 *                    }
 *                }
 *            }
 *        });
 *    });
 * </script>
 * ```
 *
 * IMPLEMENTACIÓN SIN BOTONES:
 * ```html
 * <div id="mi-empty-state-container"></div>
 * <script>
 *    document.addEventListener('DOMContentLoaded', function() {
 *        loadEmptyState('mi-empty-state-container', {
 *            icon: 'fa-inbox',
 *            title: 'No hay contenido disponible',
 *            description: 'Aún no hay contenido en esta sección.'
 *        });
 *    });
 * </script>
 * ```
 *
 * IMPLEMENTACIÓN PARA OCUPAR TODO EL ANCHO DISPONIBLE:
 * Para que el empty state ocupe todo el ancho de una sección (como un encabezado o widget completo):
 * 
 * 1. Coloca el contenedor directamente en la sección, no dentro de grids o contenedores con ancho limitado:
 * ```html
 * <div class="section-single">
 *     <div id="mi-empty-state-container"></div>
 * </div>
 * ```
 * 
 * 2. Asegúrate de que la sección tenga flex-direction: column:
 * ```css
 * .section-single {
 *     display: flex;
 *     flex-direction: column;
 *     width: 100%;
 * }
 * ```
 * 
 * 3. El contenedor solo necesita width: 100% (el componente maneja sus propios paddings):
 * ```css
 * #mi-empty-state-container {
 *     width: 100%;
 * }
 * ```
 * 
 * El componente `.ubits-empty-state` automáticamente ocupará todo el ancho disponible y mantendrá
 * sus paddings originales (20px en desktop, 16px en mobile).
 *
 * ⚠️ IMPORTANTE - DISPLAY Y GAP:
 * El componente usa `display: flex` y `gap` para el espaciado. Si necesitas mostrar/ocultar el
 * contenedor, usa `display: 'flex'` en lugar de `display: 'block'`, de lo contrario el `gap` no funcionará:
 * 
 * ```javascript
 * // ✅ CORRECTO
 * emptyStateContainer.style.display = 'flex';
 * 
 * // ❌ INCORRECTO - El gap no funcionará
 * emptyStateContainer.style.display = 'block';
 * ```
 * 
 * El componente automáticamente aplica `display: flex` al contenedor cuando se renderiza, pero si
 * necesitas controlar el display manualmente, asegúrate de usar `flex` para mantener el espaciado correcto.
 *
 * ⚠️ IMPORTANTE - ONCLICK Y FUNCIONES GLOBALES:
 * El componente crea funciones globales para manejar los onClick de los botones. Si necesitas que
 * el onClick acceda a funciones definidas en tu código, asegúrate de que esas funciones estén disponibles
 * en el scope global (window) o captura la referencia directamente:
 * 
 * ```javascript
 * // ✅ CORRECTO - Función global
 * window.miFuncionLimpiar = function() {
 *     // Tu código aquí
 * };
 * 
 * loadEmptyState('mi-container', {
 *     title: 'No hay resultados',
 *     description: 'Descripción',
 *     buttons: {
 *         primary: {
 *             text: 'Limpiar',
 *             onClick: function() {
 *                 window.miFuncionLimpiar(); // Acceder a función global
 *             }
 *         }
 *     }
 * });
 * ```
 * 
 * ```javascript
 * // ✅ CORRECTO - Capturar referencia directa
 * const miFuncion = function() {
 *     // Tu código aquí
 * };
 * 
 * loadEmptyState('mi-container', {
 *     title: 'No hay resultados',
 *     description: 'Descripción',
 *     buttons: {
 *         primary: {
 *             text: 'Limpiar',
 *             onClick: miFuncion // Pasar referencia directa
 *         }
 *     }
 * });
 * ```
 * 
 * El componente automáticamente limpia las funciones globales anteriores cuando se renderiza de nuevo,
 * así que puedes llamar a `loadEmptyState` múltiples veces sin problemas.
 *
 * ⚠️ SOLUCIÓN PARA CASOS DE BÚSQUEDA (Empty State de "No se encontraron resultados"):
 * Si el onClick no funciona (problema común en casos de búsqueda), usa un event listener directo:
 * 
 * ```javascript
 * // 1. Define la función global ANTES de renderizar
 * window.limpiarBusqueda = function() {
 *     // Tu código para limpiar búsqueda
 *     filterCourses('');
 * };
 * 
 * // 2. Renderiza el empty state
 * loadEmptyState('empty-state-container', {
 *     title: 'No se encontraron resultados',
 *     description: 'Intenta ajustar tu búsqueda.',
 *     buttons: {
 *         primary: {
 *             text: 'Limpiar búsqueda',
 *             icon: 'fa-times',
 *             onClick: function() {
 *                 // Placeholder, manejaremos el click directamente
 *             }
 *         }
 *     }
 * });
 * 
 * // 3. Agregar event listener directo al botón (KISS approach)
 * setTimeout(() => {
 *     const container = document.getElementById('empty-state-container');
 *     const clearBtn = container.querySelector('.ubits-button--primary');
 *     if (clearBtn) {
 *         clearBtn.onclick = function(e) {
 *             e.preventDefault();
 *             e.stopPropagation();
 *             if (typeof window.limpiarBusqueda === 'function') {
 *                 window.limpiarBusqueda();
 *             }
 *         };
 *     }
 * }, 50);
 * ```
 * 
 * Esta solución es más simple y directa, especialmente útil para casos de búsqueda donde el onClick
 * del componente puede no funcionar correctamente debido a problemas de scope o timing.
 *
 * @param {string} containerId - ID del contenedor donde se renderizará el empty state.
 * @param {object} options - Opciones de configuración del empty state.
 * @param {string} options.icon - Clase FontAwesome del icono (ej: 'fa-grid', se agrega 'far' automáticamente).
 * @param {string} [options.iconSize] - Tamaño del contenedor del icono: 'sm' (28x28px, icono 12px), 'md' (32x32px, icono 16px), 'lg' (36x36px, icono 20px). Default: 'lg'.
 * @param {string} options.title - Título del empty state (requerido).
 * @param {string} options.description - Descripción del empty state (requerido).
 * @param {object} [options.buttons] - Configuración de los botones (opcional).
 * @param {object} [options.buttons.secondary] - Configuración del botón secondary (opcional).
 * @param {string} [options.buttons.secondary.text] - Texto del botón secondary.
 * @param {string} [options.buttons.secondary.icon] - Clase FontAwesome del icono (ej: 'fa-times').
 * @param {function} [options.buttons.secondary.onClick] - Callback que se ejecuta al hacer clic.
 * @param {object} [options.buttons.primary] - Configuración del botón primary (opcional).
 * @param {string} [options.buttons.primary.text] - Texto del botón primary.
 * @param {string} [options.buttons.primary.icon] - Clase FontAwesome del icono (ej: 'fa-search').
 * @param {function} [options.buttons.primary.onClick] - Callback que se ejecuta al hacer clic.
 */
function loadEmptyState(containerId, options = {}) {
    console.log('loadEmptyState called with:', { containerId, options });
    
    // Validar parámetros requeridos
    if (!containerId) {
        console.error('UBITS Empty State: containerId es requerido');
        return;
    }
    
    if (!options.title) {
        console.error('UBITS Empty State: options.title es requerido');
        return;
    }
    
    if (!options.description) {
        console.error('UBITS Empty State: options.description es requerido');
        return;
    }
    
    // Obtener contenedor
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`UBITS Empty State: No se encontró el contenedor con ID "${containerId}"`);
        return;
    }
    
    // Valores por defecto
    const config = {
        icon: options.icon || 'fa-grid',
        iconSize: options.iconSize || 'lg', // sm, md, lg (default: lg)
        title: options.title,
        description: options.description,
        buttons: options.buttons || null
    };
    
    // Validar iconSize
    if (!['sm', 'md', 'lg'].includes(config.iconSize)) {
        console.warn(`UBITS Empty State: iconSize "${config.iconSize}" no es válido. Usando 'lg' por defecto.`);
        config.iconSize = 'lg';
    }
    
    // Función para renderizar el empty state
    function renderEmptyState() {
        // Limpiar contenedor
        container.innerHTML = '';
        container.className = 'ubits-empty-state';
        
        let html = '';
        
        // Header (icono + título)
        html += `
            <div class="ubits-empty-state__header">
                <div class="ubits-empty-state__icon-container ubits-empty-state__icon-container--${config.iconSize}">
                    <div class="ubits-empty-state__icon">
                        <i class="far ${config.icon.startsWith('fa-') ? config.icon : 'fa-' + config.icon}"></i>
                    </div>
                </div>
                <h3 class="ubits-empty-state__title ubits-body-md-bold">${config.title}</h3>
            </div>
        `;
        
        // Descripción
        html += `
            <p class="ubits-empty-state__description ubits-body-sm-regular">${config.description}</p>
        `;
        
        // Footer con botones (si están configurados)
        if (config.buttons && (config.buttons.secondary || config.buttons.primary)) {
            html += `
                <div class="ubits-empty-state__footer">
            `;
            
            // Botón Secondary
            if (config.buttons.secondary && config.buttons.secondary.text) {
                const secondaryIcon = config.buttons.secondary.icon || '';
                const secondaryIconClass = secondaryIcon ? (secondaryIcon.startsWith('fa-') ? `far ${secondaryIcon}` : `far fa-${secondaryIcon}`) : '';
                
                html += `
                    <button class="ubits-button ubits-button--secondary ubits-button--md" onclick="window.ubitsEmptyStateSecondary_${containerId}()">
                        ${secondaryIconClass ? `<i class="${secondaryIconClass}"></i>` : ''}
                        <span>${config.buttons.secondary.text}</span>
                    </button>
                `;
            }
            
            // Botón Primary
            if (config.buttons.primary && config.buttons.primary.text) {
                const primaryIcon = config.buttons.primary.icon || '';
                const primaryIconClass = primaryIcon ? (primaryIcon.startsWith('fa-') ? `far ${primaryIcon}` : `far fa-${primaryIcon}`) : '';
                
                html += `
                    <button class="ubits-button ubits-button--primary ubits-button--md" onclick="window.ubitsEmptyStatePrimary_${containerId}()">
                        ${primaryIconClass ? `<i class="${primaryIconClass}"></i>` : ''}
                        <span>${config.buttons.primary.text}</span>
                    </button>
                `;
            }
            
            html += `
                </div>
            `;
        }
        
        container.innerHTML = html;
        
        // Limpiar funciones globales anteriores para evitar conflictos
        const secondaryFuncName = `ubitsEmptyStateSecondary_${containerId}`;
        const primaryFuncName = `ubitsEmptyStatePrimary_${containerId}`;
        if (window[secondaryFuncName]) {
            delete window[secondaryFuncName];
        }
        if (window[primaryFuncName]) {
            delete window[primaryFuncName];
        }
        
        // Crear funciones globales para los botones
        // IMPORTANTE: Capturar directamente la referencia al onClick, no a través de config
        if (config.buttons) {
            if (config.buttons.secondary && config.buttons.secondary.onClick) {
                const secondaryOnClick = config.buttons.secondary.onClick; // Capturar referencia directa
                window[secondaryFuncName] = function() {
                    if (typeof secondaryOnClick === 'function') {
                        secondaryOnClick();
                    }
                };
            }
            
            if (config.buttons.primary && config.buttons.primary.onClick) {
                const primaryOnClick = config.buttons.primary.onClick; // Capturar referencia directa
                window[primaryFuncName] = function() {
                    if (typeof primaryOnClick === 'function') {
                        primaryOnClick();
                    }
                };
            }
        }
    }
    
    // Renderizar empty state
    renderEmptyState();
    
    // Métodos públicos
    return {
        update: function(newOptions) {
            if (newOptions.icon !== undefined) config.icon = newOptions.icon;
            if (newOptions.iconSize !== undefined) {
                if (['sm', 'md', 'lg'].includes(newOptions.iconSize)) {
                    config.iconSize = newOptions.iconSize;
                } else {
                    console.warn(`UBITS Empty State: iconSize "${newOptions.iconSize}" no es válido. Usando 'lg' por defecto.`);
                    config.iconSize = 'lg';
                }
            }
            if (newOptions.title) config.title = newOptions.title;
            if (newOptions.description) config.description = newOptions.description;
            if (newOptions.buttons !== undefined) config.buttons = newOptions.buttons;
            renderEmptyState();
        },
        getConfig: function() {
            return { ...config };
        }
    };
}
