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
            <button class="nav-tab" data-tab="${tab.id}">
                <i class="fa ${tab.icon}"></i>
                <span>${tab.label}</span>
            </button>
        `).join('');
        
        // Para la variante template, agregar mensaje de personalización
        if (variant === 'template') {
            tabsHTML += `
                <div style="color: #5c646f; font-size: 12px; font-style: italic; margin-left: 16px; margin-top: 4px;">
                    Personalizable - Indica a Cursor cuántos tabs necesitas
                </div>
            `;
        }
    } else {
        // Para otras variantes sin tabs, mostrar mensaje
        tabsHTML = `
            <div style="color: #5c646f; font-size: 14px; font-style: italic;">
                Top-nav personalizable - Agrega tus tabs aquí
            </div>
        `;
    }

    return `
        <div class="top-nav">
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
    
    // Activar el primer tab por defecto
    const firstTab = container.querySelector('.nav-tab');
    if (firstTab) {
        firstTab.classList.add('active');
    }
}

/**
 * Agrega event listeners a los tabs del top-nav
 * @param {HTMLElement} container - Contenedor del top-nav
 */
function addTopNavEventListeners(container) {
    const tabs = container.querySelectorAll('.nav-tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remover clase active de todos los tabs
            tabs.forEach(t => t.classList.remove('active'));
            
            // Agregar clase active al tab clickeado
            this.classList.add('active');
            
            // Disparar evento personalizado
            const tabId = this.getAttribute('data-tab');
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

// Exportar funciones para uso global
window.getTopNavHTML = getTopNavHTML;
window.loadTopNav = loadTopNav;
window.getTopNavVariant = getTopNavVariant;
window.getAllTopNavVariants = getAllTopNavVariants;
