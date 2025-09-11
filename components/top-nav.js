/* ========================================
   TOP NAVIGATION COMPONENT
   ======================================== */

// Configuración de variantes del top-nav
const TOP_NAV_VARIANTS = {
    template: {
        name: 'Plantilla',
        tabs: [
            { id: 'section1', label: 'Sección 1', icon: 'far fa-home' },
            { id: 'section2', label: 'Sección 2', icon: 'far fa-book' },
            { id: 'section3', label: 'Sección 3', icon: 'far fa-chart-line' },
            { id: 'section4', label: 'Sección 4', icon: 'far fa-clipboard' },
            { id: 'section5', label: 'Sección 5', icon: 'far fa-layer-group' }
        ]
    },
    documentacion: {
        name: 'Documentación',
        tabs: [
            { id: 'section1', label: 'Inicio', icon: 'far fa-home', url: 'documentacion.html' },
            { id: 'section2', label: 'Sección 2', icon: 'far fa-book' },
            { id: 'section3', label: 'Sección 3', icon: 'far fa-chart-line' },
            { id: 'section4', label: 'Colores', icon: 'far fa-palette', url: 'colores.html' },
            { id: 'section5', label: 'Iconos', icon: 'far fa-icons', url: 'iconos.html' }
        ]
    },
    learning: {
        name: 'Aprendizaje',
        tabs: [
            { id: 'home', label: 'Home', icon: 'far fa-home' },
            { id: 'catalog', label: 'Catálogo', icon: 'far fa-book' },
            { id: 'university', label: 'Universidad Corporativa', icon: 'far fa-university' },
            { id: 'study', label: 'Zona de Estudio', icon: 'far fa-book-open' },
            { id: 'shorts', label: 'Shorts', icon: 'far fa-video' },
            { id: 'playlist', label: 'Playlist', icon: 'far fa-list' }
        ]
    },
    performance: {
        name: 'Desempeño',
        tabs: [
            { id: 'evaluations', label: 'Evaluaciones 360', icon: 'far fa-chart-pie' },
            { id: 'objectives', label: 'Objetivos', icon: 'far fa-bullseye' }
        ]
    },
    surveys: {
        name: 'Encuestas',
        tabs: [
            { id: 'surveys', label: 'Encuestas', icon: 'far fa-clipboard' }
        ]
    },
    tasks: {
        name: 'Tareas',
        tabs: [
            { id: 'plans', label: 'Planes', icon: 'far fa-layer-group' },
            { id: 'tasks', label: 'Tareas', icon: 'far fa-tasks' }
        ]
    }
};

/**
 * Genera el HTML del top-nav según la variante especificada
 * @param {string} variant - Variante del top-nav (template, learning, performance, surveys, tasks)
 * @param {Array} customTabs - Array opcional de tabs personalizados para la variante template
 * @returns {string} HTML del top-nav
 */
function getTopNavHTML(variant = 'template', customTabs = []) {
    const config = TOP_NAV_VARIANTS[variant];
    if (!config) {
        console.error(`Variante '${variant}' no encontrada`);
        return '';
    }

    // Para la variante template, usar customTabs si se proporcionan, sino usar tabs de ejemplo
    const tabs = variant === 'template' && customTabs.length > 0 ? customTabs : config.tabs;
    
    let tabsHTML = '';
    
    if (tabs.length > 0) {
        tabsHTML = tabs.map(tab => `
            <button class="nav-tab" data-tab="${tab.id}" onclick="navigateToTab('${tab.id}', '${variant}')">
                <i class="fa ${tab.icon}"></i>
                <span class="ubits-body-sm-regular">${tab.label}</span>
            </button>
        `).join('');
        
        // Para la variante template, agregar mensaje de personalización
        if (variant === 'template') {
            tabsHTML += `
                <div class="ubits-body-xs-regular" style="color: var(--ubits-fg-1-medium); font-style: italic; margin-left: 16px; margin-top: 4px;">
                    Personalizable - Indica a Cursor cuántos tabs necesitas
                </div>
            `;
        }
    } else {
        // Para otras variantes sin tabs, mostrar mensaje
        tabsHTML = `
            <div class="ubits-body-sm-regular" style="color: var(--ubits-fg-1-medium); font-style: italic;">
                Top-nav personalizable - Agrega tus tabs aquí
            </div>
        `;
    }

    return `
        <div class="top-nav" data-variant="${variant}">
            <div class="nav-tabs">
                ${tabsHTML}
            </div>
        </div>
    `;
}

/**
 * Carga el top-nav en el contenedor especificado
 * @param {string} containerId - ID del contenedor donde cargar el top-nav
 * @param {string} variant - Variante del top-nav
 * @param {Array} customTabs - Array opcional de tabs personalizados
 */
function loadTopNav(containerId, variant = 'template', customTabs = []) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Contenedor '${containerId}' no encontrado`);
        return;
    }

    container.innerHTML = getTopNavHTML(variant, customTabs);
    
    // Agregar event listeners a los tabs
    addTopNavEventListeners(container);
    
    // Activar el tab correcto basado en la página actual
    activateCurrentPageTab(container, variant);
}

function activateCurrentPageTab(container, variant) {
    const currentPage = window.location.pathname.split('/').pop();
    
    // Activar tab basado en la página actual
    if (currentPage === 'iconos.html') {
        const iconosTab = container.querySelector('[data-tab="section5"]');
        if (iconosTab) iconosTab.classList.add('active');
    } else if (currentPage === 'colores.html') {
        const coloresTab = container.querySelector('[data-tab="section4"]');
        if (coloresTab) coloresTab.classList.add('active');
    } else if (currentPage === 'documentacion.html') {
        const inicioTab = container.querySelector('[data-tab="section1"]');
        if (inicioTab) inicioTab.classList.add('active');
    } else {
        // Activar el primero por defecto
        const firstTab = container.querySelector('.nav-tab');
        if (firstTab) firstTab.classList.add('active');
    }
}

/**
 * Agrega event listeners a los tabs del top-nav
 * @param {HTMLElement} container - Contenedor del top-nav
 */
function addTopNavEventListeners(container) {
    const tabs = container.querySelectorAll('.nav-tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            
            console.log('Tab clicked:', this.getAttribute('data-tab'));
            
            // Remover clase active de todos los tabs
            tabs.forEach(t => t.classList.remove('active'));
            
            // Agregar clase active al tab clickeado
            this.classList.add('active');
            
            // Obtener la configuración del tab
            const tabId = this.getAttribute('data-tab');
            const variant = container.closest('.top-nav')?.getAttribute('data-variant') || 'template';
            const variantConfig = getTopNavVariant(variant);
            
            console.log('Variant:', variant, 'Config:', variantConfig);
            
            // Buscar el tab en la configuración para obtener la URL
            if (variantConfig && variantConfig.tabs) {
                const tabConfig = variantConfig.tabs.find(t => t.id === tabId);
                console.log('Tab config:', tabConfig);
                if (tabConfig && tabConfig.url) {
                    console.log('Navigating to:', tabConfig.url);
                    // Navegar a la URL
                    window.location.href = tabConfig.url;
                    return;
                }
            }
            
            console.log('No URL found, dispatching event');
            
            // Disparar evento personalizado si no hay URL
            const event = new CustomEvent('topNavTabClick', {
                detail: { tabId: tabId, tabElement: this }
            });
            document.dispatchEvent(event);
        });
    });
}

/**
 * Obtiene la configuración de una variante específica
 * @param {string} variant - Variante del top-nav
 * @returns {Object} Configuración de la variante
 */
function getTopNavVariant(variant) {
    return TOP_NAV_VARIANTS[variant] || null;
}

/**
 * Obtiene todas las variantes disponibles
 * @returns {Object} Todas las variantes del top-nav
 */
function getAllTopNavVariants() {
    return TOP_NAV_VARIANTS;
}

// Función simple para navegación
window.navigateToTab = function(tabId, variant) {
    console.log('Navigating:', tabId, variant);
    
    const variantConfig = getTopNavVariant(variant);
    if (variantConfig && variantConfig.tabs) {
        const tabConfig = variantConfig.tabs.find(t => t.id === tabId);
        if (tabConfig && tabConfig.url) {
            console.log('Going to:', tabConfig.url);
            window.location.href = tabConfig.url;
            return;
        }
    }
    console.log('No URL found for tab:', tabId);
};

// Exportar funciones para uso global
window.getTopNavHTML = getTopNavHTML;
window.loadTopNav = loadTopNav;
window.getTopNavVariant = getTopNavVariant;
window.getAllTopNavVariants = getAllTopNavVariants;
window.addTopNavEventListeners = addTopNavEventListeners;
window.activateCurrentPageTab = activateCurrentPageTab;
