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
    
    const parsedItemsPerPage = Number(options.itemsPerPage);
    // Valores por defecto (10 ítems/página si no se indica)
    const config = {
        totalItems: options.totalItems,
        itemsPerPage: Number.isFinite(parsedItemsPerPage) && parsedItemsPerPage > 0 ? parsedItemsPerPage : 10,
        currentPage: options.currentPage || 1,
        itemsPerPageOptions: options.itemsPerPageOptions || [10, 16, 20, 32, 48],
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
        let totalPages = getTotalPages();
        if (totalPages < 1) totalPages = 1;
        if (currentPage > totalPages) currentPage = totalPages;
        if (currentPage < 1) currentPage = 1;

        // Mostrar siempre el contenedor si hay selector o navegación (no ocultar cuando cabe en una página:
        // el usuario debe ver "20 por página" u otra opción configurada).
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
                    <button class="ubits-button ubits-button--secondary ${isActive ? 'ubits-button--active' : ''} ubits-button--sm" onclick="window.ubitsPaginatorGoToPage('${containerId}', ${pageNum})" ${isActive ? 'aria-current="page"' : ''}>
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
                selectContainer.innerHTML = '';
            }
            
            // Botón terciario que abre el dropdown de "X por página"
            const buttonLabel = itemsPerPage + ' por página';
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'ubits-button ubits-button--tertiary ubits-button--sm';
            btn.setAttribute('aria-haspopup', 'listbox');
            btn.setAttribute('aria-expanded', 'false');
            btn.innerHTML = '<span class="ubits-paginator__items-label">' + buttonLabel + '</span><i class="far fa-angle-down"></i>';
            selectContainer.appendChild(btn);
            
            const optionsData = config.itemsPerPageOptions.map(function (n) {
                return { value: n.toString(), text: n + ' por página', selected: n === itemsPerPage };
            });
            
            if (typeof window.getDropdownMenuHtml === 'function' && typeof window.openDropdownMenu === 'function' && typeof window.closeDropdownMenu === 'function') {
                var overlayId = 'ubits-paginator-items-' + containerId;
                var existingOverlay = document.getElementById(overlayId);
                if (existingOverlay) existingOverlay.remove();
                var configDropdown = { overlayId: overlayId, options: optionsData };
                var overlayHtml = window.getDropdownMenuHtml(configDropdown);
                document.body.insertAdjacentHTML('beforeend', overlayHtml);
                var overlayEl = document.getElementById(overlayId);
                if (overlayEl) {
                    overlayEl.querySelectorAll('.ubits-dropdown-menu__option').forEach(function (optionBtn) {
                        optionBtn.addEventListener('click', function () {
                            var val = this.getAttribute('data-value') || '';
                            var textEl = this.querySelector('.ubits-dropdown-menu__option-text');
                            var text = textEl ? textEl.textContent : buttonLabel;
                            var labelSpan = selectContainer.querySelector('.ubits-paginator__items-label');
                            if (labelSpan) labelSpan.textContent = text;
                            btn.setAttribute('aria-expanded', 'false');
                            window.closeDropdownMenu(overlayId);
                            changeItemsPerPage(parseInt(val, 10));
                        });
                    });
                    overlayEl.addEventListener('click', function (e) {
                        if (e.target === overlayEl) {
                            window.closeDropdownMenu(overlayId);
                            btn.setAttribute('aria-expanded', 'false');
                        }
                    });
                }
                btn.addEventListener('click', function (e) {
                    e.preventDefault();
                    var isOpen = btn.getAttribute('aria-expanded') === 'true';
                    if (isOpen) {
                        window.closeDropdownMenu(overlayId);
                        btn.setAttribute('aria-expanded', 'false');
                    } else {
                        window.openDropdownMenu(overlayId, btn);
                        btn.setAttribute('aria-expanded', 'true');
                    }
                });
            } else {
                var dropdownFallback = document.createElement('div');
                dropdownFallback.className = 'ubits-select-dropdown ubits-paginator__items-dropdown';
                dropdownFallback.style.display = 'none';
                optionsData.forEach(function (opt) {
                    var div = document.createElement('div');
                    div.className = 'ubits-select-option' + (opt.selected ? ' ubits-select-option--selected' : '');
                    div.textContent = opt.text;
                    div.setAttribute('data-value', opt.value);
                    div.addEventListener('click', function () {
                        var labelSpan = selectContainer.querySelector('.ubits-paginator__items-label');
                        if (labelSpan) labelSpan.textContent = this.textContent;
                        dropdownFallback.style.display = 'none';
                        changeItemsPerPage(parseInt(this.getAttribute('data-value'), 10));
                    });
                    dropdownFallback.appendChild(div);
                });
                selectContainer.appendChild(dropdownFallback);
                selectContainer.style.position = 'relative';
                btn.addEventListener('click', function (e) {
                    e.preventDefault();
                    var isVisible = dropdownFallback.style.display === 'block';
                    dropdownFallback.style.display = isVisible ? 'none' : 'block';
                    if (!isVisible) setTimeout(function () { setupPaginatorDropdownPosition(selectContainer, btn, dropdownFallback); }, 10);
                });
                document.addEventListener('click', function (e) {
                    if (!selectContainer.contains(e.target)) dropdownFallback.style.display = 'none';
                }, true);
            }
        }
    }
    
    function setupPaginatorDropdownPosition(selectContainer, triggerBtn, dropdown) {
        if (dropdown.style.display !== 'block') return;
        var triggerRect = triggerBtn.getBoundingClientRect();
        var dropdownRect = dropdown.getBoundingClientRect();
        var viewportHeight = window.innerHeight;
        var spaceBelow = viewportHeight - triggerRect.bottom;
        var spaceAbove = triggerRect.top;
        var dropdownHeight = dropdownRect.height || 160;
        if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
            dropdown.classList.add('dropdown-up');
        } else {
            dropdown.classList.remove('dropdown-up');
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

