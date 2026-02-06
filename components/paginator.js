/* ========================================
   UBITS PAGINATOR COMPONENT
   Componente de paginador con navegación y selector de items por página
   ======================================== */

/**
 * UBITS PAGINATOR COMPONENT
 * 
 * Componente de paginación con navegación entre páginas y selector de items por página.
 * Incluye posicionamiento inteligente del dropdown según el espacio disponible en el viewport.
 * 
 * ⚠️ TROUBLESHOOTING - DROPDOWN CORTADO O SCROLL VERTICAL:
 * =========================================================
 * Si el dropdown del selector de items por página se ve cortado o genera un scroll
 * vertical en la sección, el problema está en los estilos de overflow de los contenedores.
 * 
 * CAUSA: Los contenedores padres (.content-area, .content-sections, .section-single)
 * tienen `overflow-x: hidden` que corta los elementos posicionados absolutamente.
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
 * NOTA: Los widgets específicos que necesitan ocultar overflow (como carruseles)
 * deben tener su propio `overflow-x: hidden` individual.
 * 
 * Fecha de fix: Enero 2026
 * =========================================================
 * 
 * REQUISITOS OBLIGATORIOS:
 * 1. CSS: <link rel="stylesheet" href="components/paginator.css">
 * 2. CSS: <link rel="stylesheet" href="components/button.css">
 * 3. CSS: <link rel="stylesheet" href="components/input.css">
 * 4. JS: <script src="components/paginator.js"></script>
 * 5. JS: <script src="components/button.js"></script> (para referencia)
 * 6. JS: <script src="components/input.js"></script>
 * 7. FontAwesome: <link rel="stylesheet" href="fontawesome-icons.css">
 * 8. UBITS Base: <link rel="stylesheet" href="ubits-colors.css">
 * 9. UBITS Typography: <link rel="stylesheet" href="ubits-typography.css">
 * 
 * IMPLEMENTACIÓN BÁSICA:
 * ```html
 * <!-- Container para el paginador -->
 * <div id="mi-paginador"></div>
 * 
 * <!-- JavaScript -->
 * <script>
 * loadPaginator('mi-paginador', {
 *     totalItems: 120,
 *     itemsPerPage: 16,
 *     currentPage: 1,
 *     onPageChange: function(page) {
 *         console.log('Página cambiada a:', page);
 *     },
 *     onItemsPerPageChange: function(itemsPerPage) {
 *         console.log('Items por página cambiados a:', itemsPerPage);
 *     }
 * });
 * </script>
 * ```
 * 
 * OPCIONES DISPONIBLES:
 * - totalItems: Número total de items a paginar (requerido)
 * - itemsPerPage: Items por página por defecto (default: 16)
 * - currentPage: Página inicial (default: 1)
 * - itemsPerPageOptions: Opciones del selector (default: [16, 20, 32, 48])
 * - onPageChange: Callback cuando cambia la página
 * - onItemsPerPageChange: Callback cuando cambia items por página
 * - showItemsSelector: Mostrar selector de items por página (default: true)
 * 
 * CARACTERÍSTICAS:
 * - Navegación con botones anterior/siguiente
 * - Números de página con elipses inteligentes
 * - Selector de items por página con dropdown inteligente
 * - Posicionamiento automático del dropdown (arriba/abajo según espacio)
 * - Responsive y adaptable
 * - Usa componentes oficiales UBITS (Button, Input)
 */

/**
 * Crea un paginador UBITS con todas las opciones de configuración
 * 
 * @param {string} containerId - ID del contenedor donde se renderizará el paginador
 * @param {Object} options - Opciones de configuración del paginador
 * @param {number} options.totalItems - Número total de items a paginar (requerido)
 * @param {number} [options.itemsPerPage=16] - Items por página por defecto
 * @param {number} [options.currentPage=1] - Página inicial
 * @param {Array<number>} [options.itemsPerPageOptions=[16, 20, 32, 48]] - Opciones del selector de items por página
 * @param {Function} [options.onPageChange] - Callback cuando cambia la página: function(page) {}
 * @param {Function} [options.onItemsPerPageChange] - Callback cuando cambia items por página: function(itemsPerPage) {}
 * @param {boolean} [options.showItemsSelector=true] - Mostrar selector de items por página
 * 
 * @example
 * // Paginador básico
 * loadPaginator('mi-paginador', {
 *     totalItems: 120,
 *     itemsPerPage: 16,
 *     currentPage: 1
 * });
 * 
 * @example
 * // Paginador con callbacks
 * loadPaginator('mi-paginador', {
 *     totalItems: 200,
 *     itemsPerPage: 20,
 *     currentPage: 1,
 *     onPageChange: function(page) {
 *         console.log('Página:', page);
 *         // Actualizar contenido aquí
 *     },
 *     onItemsPerPageChange: function(itemsPerPage) {
 *         console.log('Items por página:', itemsPerPage);
 *         // Recargar contenido aquí
 *     }
 * });
 */
function loadPaginator(containerId, options = {}) {
    console.log('loadPaginator called with:', { containerId, options });
    
    // Validar parámetros requeridos
    if (!containerId) {
        console.error('UBITS Paginator: containerId es requerido');
        return;
    }
    
    if (!options.totalItems || options.totalItems <= 0) {
        console.error('UBITS Paginator: totalItems debe ser un número mayor a 0');
        return;
    }
    
    // Obtener contenedor
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`UBITS Paginator: No se encontró el contenedor con ID "${containerId}"`);
        return;
    }
    
    // Valores por defecto
    const config = {
        totalItems: options.totalItems,
        itemsPerPage: options.itemsPerPage || 16,
        currentPage: options.currentPage || 1,
        itemsPerPageOptions: options.itemsPerPageOptions || [16, 20, 32, 48],
        onPageChange: options.onPageChange || null,
        onItemsPerPageChange: options.onItemsPerPageChange || null,
        showItemsSelector: options.showItemsSelector !== false // default: true
    };
    
    // Estado interno del paginador
    let currentPage = config.currentPage;
    let itemsPerPage = config.itemsPerPage;
    
    // Función para calcular total de páginas
    function getTotalPages() {
        return Math.ceil(config.totalItems / itemsPerPage);
    }
    
    // Función para renderizar el paginador
    function renderPaginator() {
        const totalPages = getTotalPages();
        
        // Si los items totales son menores o iguales a itemsPerPage, ocultar el paginador completamente
        if (config.totalItems <= itemsPerPage) {
            container.innerHTML = '';
            container.style.display = 'none';
            return;
        }
        
        // Mostrar el contenedor si estaba oculto
        container.style.display = '';
        
        // Limpiar contenedor pero preservar el selector si existe
        const existingSelectContainer = document.getElementById(`${containerId}-items-select`);
        const selectContainerParent = existingSelectContainer ? existingSelectContainer.parentElement : null;
        
        container.innerHTML = '';
        container.className = 'ubits-paginator';
        
        let html = '';
        
        // Solo mostrar botones de navegación si hay más de una página
        if (totalPages > 1) {
            // Botón primera página (<<)
            html += `
                <button class="ubits-button ubits-button--secondary ubits-button--sm ubits-button--icon-only" ${currentPage === 1 ? 'disabled' : ''} onclick="window.ubitsPaginatorGoToPage('${containerId}', 1)" aria-label="Primera página">
                    <i class="far fa-chevrons-left"></i>
                </button>
            `;
            // Botón anterior (<)
            html += `
                <button class="ubits-button ubits-button--secondary ubits-button--sm ubits-button--icon-only" ${currentPage === 1 ? 'disabled' : ''} onclick="window.ubitsPaginatorGoToPage('${containerId}', ${currentPage - 1})" aria-label="Página anterior">
                    <i class="far fa-chevron-left"></i>
                </button>
            `;
            
            // Siempre mostrar 5 números de página (ventana deslizante)
            const visibleCount = Math.min(5, totalPages);
            let start = Math.max(1, Math.min(currentPage - Math.floor(visibleCount / 2), totalPages - visibleCount + 1));
            for (let i = 0; i < visibleCount; i++) {
                const pageNum = start + i;
                const isActive = pageNum === currentPage;
                html += `
                    <button class="ubits-button ubits-button--${isActive ? 'secondary' : 'tertiary'} ubits-button--sm" onclick="window.ubitsPaginatorGoToPage('${containerId}', ${pageNum})" ${isActive ? 'aria-current="page"' : ''}>
                        <span>${pageNum}</span>
                    </button>
                `;
            }
            
            // Botón siguiente (>)
            html += `
                <button class="ubits-button ubits-button--secondary ubits-button--sm ubits-button--icon-only" ${currentPage === totalPages ? 'disabled' : ''} onclick="window.ubitsPaginatorGoToPage('${containerId}', ${currentPage + 1})" aria-label="Página siguiente">
                    <i class="far fa-chevron-right"></i>
                </button>
            `;
            // Botón última página (>>)
            html += `
                <button class="ubits-button ubits-button--secondary ubits-button--sm ubits-button--icon-only" ${currentPage === totalPages ? 'disabled' : ''} onclick="window.ubitsPaginatorGoToPage('${containerId}', ${totalPages})" aria-label="Última página">
                    <i class="far fa-chevrons-right"></i>
                </button>
            `;
        }
        
        container.innerHTML = html;
        
        // Crear selector de items por página SIEMPRE (si está habilitado)
        // El selector siempre debe mostrarse, incluso cuando hay solo una página o cuando no hay botones de navegación
        if (config.showItemsSelector) {
            // Verificar si el selector ya existe para evitar duplicados
            let selectContainer = document.getElementById(`${containerId}-items-select`);
            
            if (!selectContainer) {
                selectContainer = document.createElement('div');
                selectContainer.className = 'ubits-paginator__items-select';
                selectContainer.id = `${containerId}-items-select`;
                container.appendChild(selectContainer);
            } else {
                // Si existe pero no está en el contenedor correcto, moverlo
                if (selectContainer.parentElement !== container) {
                    container.appendChild(selectContainer);
                }
                // Limpiar contenido anterior si existe
                selectContainer.innerHTML = '';
            }
            
            // Crear select usando UBITS Input component
            setTimeout(() => {
                if (typeof createInput === 'function') {
                    const selectContainerCheck = document.getElementById(`${containerId}-items-select`);
                    if (selectContainerCheck) {
                        // Convertir opciones numéricas a formato del selector
                        const selectOptions = config.itemsPerPageOptions.map(opt => ({
                            value: opt.toString(),
                            text: `${opt} por página`
                        }));
                        
                        createInput({
                            containerId: `${containerId}-items-select`,
                            type: 'select',
                            placeholder: `${itemsPerPage} por página`,
                            selectOptions: selectOptions,
                            value: itemsPerPage.toString(),
                            size: 'sm', // Tamaño sm para que coincida con los botones del paginador
                            onChange: function(newValue) {
                                changeItemsPerPage(parseInt(newValue));
                            }
                        });
                        
                        // Agregar lógica de posicionamiento inteligente del dropdown
                        setTimeout(() => {
                            setupSmartDropdownPositioning(`${containerId}-items-select`);
                        }, 100);
                    }
                }
            }, 50);
        }
    }
    
    // Función para cambiar de página
    window[`ubitsPaginatorGoToPage_${containerId}`] = function(page) {
        const totalPages = getTotalPages();
        if (page < 1 || page > totalPages) return;
        
        currentPage = page;
        renderPaginator();
        
        // Ejecutar callback
        if (config.onPageChange && typeof config.onPageChange === 'function') {
            config.onPageChange(currentPage);
        }
        
        // Scroll suave hacia arriba
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };
    
    // Función global para cambiar de página (compatible con onclick)
    window.ubitsPaginatorGoToPage = function(containerIdParam, page) {
        window[`ubitsPaginatorGoToPage_${containerIdParam}`](page);
    };
    
    // Función para cambiar items por página
    function changeItemsPerPage(newItemsPerPage) {
        itemsPerPage = newItemsPerPage;
        currentPage = 1; // Resetear a la primera página
        renderPaginator();
        
        // Ejecutar callback
        if (config.onItemsPerPageChange && typeof config.onItemsPerPageChange === 'function') {
            config.onItemsPerPageChange(itemsPerPage);
        }
    }
    
    // Función para posicionar el dropdown inteligentemente
    function setupSmartDropdownPositioning(selectContainerId) {
        const selectContainer = document.getElementById(selectContainerId);
        if (!selectContainer) return;
        
        const inputElement = selectContainer.querySelector('.ubits-input');
        const dropdown = selectContainer.querySelector('.ubits-select-dropdown');
        
        if (!inputElement || !dropdown) return;
        
        // Función para calcular y ajustar posición
        function adjustDropdownPosition() {
            if (dropdown.style.display === 'none' || dropdown.style.display === '') {
                return;
            }
            
            const inputRect = inputElement.getBoundingClientRect();
            const dropdownRect = dropdown.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            
            // Calcular espacio disponible hacia abajo y hacia arriba
            const spaceBelow = viewportHeight - inputRect.bottom;
            const spaceAbove = inputRect.top;
            const dropdownHeight = dropdownRect.height || 160; // max-height del dropdown
            
            // Si no hay suficiente espacio abajo pero sí arriba, posicionar hacia arriba
            if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
                dropdown.classList.add('dropdown-up');
            } else {
                dropdown.classList.remove('dropdown-up');
            }
        }
        
        // Observar cuando se abre el dropdown
        if (inputElement) {
            inputElement.addEventListener('click', function() {
                setTimeout(() => {
                    adjustDropdownPosition();
                }, 50);
            });
        }
        
        // Ajustar posición cuando cambia el tamaño de la ventana
        window.addEventListener('resize', function() {
            if (dropdown.style.display === 'block') {
                adjustDropdownPosition();
            }
        });
        
        // Ajustar posición cuando se hace scroll
        window.addEventListener('scroll', function() {
            if (dropdown.style.display === 'block') {
                adjustDropdownPosition();
            }
        }, true);
    }
    
    // Renderizar inicialmente
    renderPaginator();
    
    // Retornar objeto con métodos públicos
    return {
        goToPage: function(page) {
            window[`ubitsPaginatorGoToPage_${containerId}`](page);
        },
        setItemsPerPage: function(newItemsPerPage) {
            changeItemsPerPage(newItemsPerPage);
        },
        getCurrentPage: function() {
            return currentPage;
        },
        getItemsPerPage: function() {
            return itemsPerPage;
        },
        updateTotalItems: function(newTotalItems) {
            config.totalItems = newTotalItems;
            renderPaginator();
        }
    };
}

/* ========================================
   DOCUMENTACIÓN DE RENDERIZADO UBITS
   ======================================== */

/**
 * RENDERIZADO DEL COMPONENTE PAGINATOR
 * 
 * REQUISITOS OBLIGATORIOS:
 * 1. CSS: <link rel="stylesheet" href="components/paginator.css">
 * 2. CSS: <link rel="stylesheet" href="components/button.css">
 * 3. CSS: <link rel="stylesheet" href="components/input.css">
 * 4. JS: <script src="components/paginator.js"></script>
 * 5. JS: <script src="components/input.js"></script>
 * 6. FontAwesome: <link rel="stylesheet" href="fontawesome-icons.css">
 * 7. UBITS Base: <link rel="stylesheet" href="ubits-colors.css">
 * 8. UBITS Typography: <link rel="stylesheet" href="ubits-typography.css">
 * 
 * IMPLEMENTACIÓN BÁSICA:
 * ```html
 * <div id="mi-paginador"></div>
 * <script>
 * loadPaginator('mi-paginador', {
 *     totalItems: 120,
 *     itemsPerPage: 16,
 *     currentPage: 1
 * });
 * </script>
 * ```
 * 
 * FEATURES:
 * - Navegación con botones anterior/siguiente
 * - Números de página con elipses inteligentes
 * - Selector de items por página con dropdown inteligente
 * - Posicionamiento automático del dropdown (arriba/abajo según espacio)
 * - Callbacks para cambios de página e items por página
 * - Métodos públicos para control programático
 */

// Exportar documentación para referencia
window.UBITS_PAGINATOR_DOCS = {
    options: {
        totalItems: 'number (requerido) - Número total de items a paginar',
        itemsPerPage: 'number (default: 16) - Items por página por defecto',
        currentPage: 'number (default: 1) - Página inicial',
        itemsPerPageOptions: 'array (default: [16, 20, 32, 48]) - Opciones del selector',
        onPageChange: 'function(page) - Callback cuando cambia la página',
        onItemsPerPageChange: 'function(itemsPerPage) - Callback cuando cambia items por página',
        showItemsSelector: 'boolean (default: true) - Mostrar selector de items por página'
    },
    methods: {
        goToPage: 'function(page) - Ir a una página específica',
        setItemsPerPage: 'function(itemsPerPage) - Cambiar items por página',
        getCurrentPage: 'function() - Obtener página actual',
        getItemsPerPage: 'function() - Obtener items por página actual',
        updateTotalItems: 'function(newTotalItems) - Actualizar total de items'
    }
};

console.log(`
🚀 UBITS Paginator Component cargado exitosamente!

📋 OPCIONES DISPONIBLES:
• totalItems: Número total de items (requerido)
• itemsPerPage: Items por página (default: 16)
• currentPage: Página inicial (default: 1)
• itemsPerPageOptions: Opciones del selector (default: [16, 20, 32, 48])
• onPageChange: Callback cuando cambia la página
• onItemsPerPageChange: Callback cuando cambia items por página
• showItemsSelector: Mostrar selector (default: true)

💡 USO BÁSICO:
loadPaginator('mi-paginador', {
    totalItems: 120,
    itemsPerPage: 16,
    currentPage: 1
});

🔍 VER TODAS LAS OPCIONES:
console.log(window.UBITS_PAGINATOR_DOCS);
`);

