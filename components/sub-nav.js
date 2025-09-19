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
            { id: 'section4', label: 'Sección 4', icon: 'far fa-cog' },
            { id: 'section5', label: 'Sección 5', icon: 'far fa-star' }
        ]
    },
    documentacion: {
        name: 'Documentación',
        tabs: [
            { id: 'section1', label: 'Inicio', icon: 'far fa-home', url: 'documentacion.html' },
            { id: 'section2', label: 'Guía de prompts', icon: 'far fa-comments', url: 'guia-prompts.html' },
            { id: 'section3', label: 'Componentes', icon: 'far fa-cube', url: 'componentes.html' },
            { id: 'section4', label: 'Colores', icon: 'far fa-palette', url: 'colores.html' },
            { id: 'section5', label: 'Iconos', icon: 'far fa-icons', url: 'iconos.html' },
            { id: 'section6', label: 'Tipografía', icon: 'far fa-text-size', url: 'tipografia.html' }
        ]
    },
    aprendizaje: {
        name: 'Aprendizaje',
        tabs: [
            { id: 'home', label: 'Inicio', icon: 'far fa-home', url: 'home-learn.html' },
            { id: 'catalog', label: 'Catálogo', icon: 'far fa-book', url: 'catalogo.html' },
            { id: 'corporate', label: 'U. Corporativa', icon: 'far fa-building-columns', url: 'u-corporativa.html' },
            { id: 'study-zone', label: 'Zona de estudio', icon: 'far fa-books', url: 'zona-estudio.html' }
        ]
    },
    desempeno: {
        name: 'Desempeño',
        tabs: [
            { id: 'evaluations', label: 'Evaluaciones 360', icon: 'far fa-chart-pie', url: 'evaluaciones-360.html' },
            { id: 'objectives', label: 'Objetivos', icon: 'far fa-bullseye', url: 'objetivos.html' },
            { id: 'metrics', label: 'Métricas', icon: 'far fa-chart-line', url: 'metricas.html' },
            { id: 'reports', label: 'Reportes', icon: 'far fa-file-chart-line', url: 'reportes.html' }
        ]
    },
    encuestas: {
        name: 'Encuestas',
        tabs: [
            { id: 'encuestas', label: 'Encuestas', icon: 'far fa-clipboard-list-check', url: 'encuestas.html' }
        ]
    },
    tareas: {
        name: 'Tareas',
        tabs: [
            { id: 'plans', label: 'Planes', icon: 'far fa-layer-group', url: 'planes.html' },
            { id: 'tasks', label: 'Tareas', icon: 'far fa-tasks', url: 'tareas.html' }
        ]
    }
};

/**
 * Genera el HTML del top-nav según la variante especificada
 * @param {string} variant - Variante del top-nav (template, documentacion, aprendizaje, desempeno, encuestas, tareas)
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
        if (variant === 'documentacion') {
            // Para documentación, crear AMBOS: tabs normales Y hamburger menu
            const normalTabs = tabs.map(tab => `
                <button class="nav-tab" data-tab="${tab.id}" onclick="navigateToTab('${tab.id}', '${variant}')">
                    <i class="fa ${tab.icon}"></i>
                    <span class="ubits-body-sm-regular">${tab.label}</span>
                </button>
            `).join('');
            
            const hamburgerMenu = `
                <button class="hamburger-menu" id="hamburger-btn">
                    <i class="fa fa-bars"></i>
                </button>
                <div class="hamburger-dropdown" id="hamburger-dropdown">
                    ${tabs.map(tab => `
                        <button class="hamburger-item" data-tab="${tab.id}" onclick="navigateToTab('${tab.id}', '${variant}')">
                            <i class="fa ${tab.icon}"></i>
                            <span class="ubits-body-sm-regular">${tab.label}</span>
                        </button>
                    `).join('')}
                </div>
            `;
            
            tabsHTML = normalTabs + hamburgerMenu;
        } else {
            // Para otras variantes, usar solo tabs normales
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
        }
    } else {
        // Para otras variantes sin tabs, mostrar mensaje
        tabsHTML = `
            <div class="ubits-body-sm-regular" style="color: var(--ubits-fg-1-medium); font-style: italic;">
                Top-nav personalizable - Agrega tus tabs aquí
            </div>
        `;
    }

    // Añadir texto de título para la variante documentacion
    const titleText = variant === 'documentacion' ? 
        `<div class="nav-title ubits-heading-h3" style="color: var(--ubits-accent-brand);">DOCUMENTACIÓN</div>` : '';

    // Para documentación, separar hamburger del resto
    let leftContent = titleText + tabsHTML;
    let rightContent = '';
    
    if (variant === 'documentacion') {
        // Extraer hamburger menu y ponerlo a la derecha
        const hamburgerMatch = tabsHTML.match(/<button class="hamburger-menu.*?<\/div>/s);
        if (hamburgerMatch) {
            rightContent = hamburgerMatch[0];
            leftContent = titleText + tabsHTML.replace(hamburgerMatch[0], '');
        }
    }

    return `
        <div class="sub-nav" data-variant="${variant}">
            <div class="nav-tabs">
                ${leftContent}
            </div>
            ${rightContent ? `<div class="nav-right">${rightContent.replace(/<div class="hamburger-dropdown.*?<\/div>/s, '')}</div>` : ''}
            ${rightContent && rightContent.includes('hamburger-dropdown') ? rightContent.match(/<div class="hamburger-dropdown.*?<\/div>/s)[0] : ''}
        </div>
    `;
}

/**
 * Carga el top-nav en el contenedor especificado
 * @param {string} containerId - ID del contenedor donde cargar el top-nav
 * @param {string} variant - Variante del top-nav
 * @param {Array} customTabs - Array opcional de tabs personalizados
 */
function loadSubNav(containerId, variant = 'template', customTabs = []) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Contenedor '${containerId}' no encontrado`);
        return;
    }

    container.innerHTML = getTopNavHTML(variant, customTabs);
    
    // Agregar event listeners a los tabs
    addTopNavEventListeners(container);
    
    // Activar el tab correcto basado en la página actual
    setTimeout(() => {
        activateCurrentPageTab(container, variant);
    }, 100);
}

function activateCurrentPageTab(container, variant) {
    const currentPage = window.location.pathname.split('/').pop();
    
    // Función para activar tab tanto en nav-tab como en hamburger-item
    const activateTab = (tabId) => {
        const navTab = container.querySelector(`.nav-tab[data-tab="${tabId}"]`);
        const hamburgerItem = container.querySelector(`.hamburger-item[data-tab="${tabId}"]`);
        
        if (navTab) navTab.classList.add('active');
        if (hamburgerItem) hamburgerItem.classList.add('active');
    };
    
    // Activar tab basado en la página actual
    if (currentPage === 'home-learn.html') {
        activateTab('home');
    } else if (currentPage === 'tipografia.html') {
        activateTab('section6');
    } else if (currentPage === 'iconos.html') {
        activateTab('section5');
    } else if (currentPage === 'colores.html') {
        activateTab('section4');
    } else if (currentPage === 'componentes.html') {
        activateTab('section3');
    } else if (currentPage === 'sidebar.html') {
        activateTab('section3');
    } else if (currentPage === 'subnav.html') {
        activateTab('section3');
    } else if (currentPage === 'tab-bar.html') {
        activateTab('section3');
    } else if (currentPage === 'button.html') {
        activateTab('section3');
    } else if (currentPage === 'guia-prompts.html') {
        activateTab('section2');
    } else if (currentPage === 'documentacion.html') {
        activateTab('section1');
    }
    
    // Siempre activar el primero por defecto si no se activó ninguno
    const activeNavTab = container.querySelector('.nav-tab.active');
    const activeHamburgerItem = container.querySelector('.hamburger-item.active');
    
    if (!activeNavTab && !activeHamburgerItem) {
        const firstNavTab = container.querySelector('.nav-tab');
        const firstHamburgerItem = container.querySelector('.hamburger-item');
        
        if (firstNavTab) firstNavTab.classList.add('active');
        if (firstHamburgerItem) firstHamburgerItem.classList.add('active');
    }
}

/**
 * Agrega event listeners a los tabs del top-nav
 * @param {HTMLElement} container - Contenedor del top-nav
 */
function addTopNavEventListeners(container) {
    const tabs = container.querySelectorAll('.nav-tab');
    const hamburgerBtn = container.querySelector('.hamburger-menu');
    const hamburgerDropdown = container.querySelector('.hamburger-dropdown');
    const hamburgerItems = container.querySelectorAll('.hamburger-item');
    
    // Event listeners para tabs normales
    tabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remover clase active de todos los tabs
            tabs.forEach(t => t.classList.remove('active'));
            
            // Agregar clase active al tab clickeado
            this.classList.add('active');
            
            // Obtener la configuración del tab
            const tabId = this.getAttribute('data-tab');
            const subNavElement = container.closest('.sub-nav');
            const variant = subNavElement?.getAttribute('data-variant') || 'template';
            const variantConfig = getTopNavVariant(variant);
            
            // Buscar el tab en la configuración para obtener la URL
            if (variantConfig && variantConfig.tabs) {
                const tabConfig = variantConfig.tabs.find(t => t.id === tabId);
                if (tabConfig && tabConfig.url) {
                    // Navegar a la URL
                    window.location.href = tabConfig.url;
                    return;
                }
            }
            
            // Disparar evento personalizado si no hay URL
            const event = new CustomEvent('topNavTabClick', {
                detail: { tabId: tabId, tabElement: this }
            });
            document.dispatchEvent(event);
        });
    });
    
    // Event listener para hamburger menu
    if (hamburgerBtn && hamburgerDropdown) {
        hamburgerBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Toggle dropdown
            hamburgerDropdown.classList.toggle('show');
        });
        
        // Event listeners para hamburger items
        hamburgerItems.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                
                console.log('Hamburger item clicked:', this.getAttribute('data-tab'));
                
                // Remover clase active de todos los items
                hamburgerItems.forEach(i => i.classList.remove('active'));
                
                // Agregar clase active al item clickeado
                this.classList.add('active');
                
                // Cerrar dropdown
                hamburgerDropdown.classList.remove('show');
                
                // Obtener la configuración del tab
                const tabId = this.getAttribute('data-tab');
                const variant = container.closest('.sub-nav')?.getAttribute('data-variant') || 'template';
                const variantConfig = getTopNavVariant(variant);
                
                // Buscar el tab en la configuración para obtener la URL
                if (variantConfig && variantConfig.tabs) {
                    const tabConfig = variantConfig.tabs.find(t => t.id === tabId);
                    if (tabConfig && tabConfig.url) {
                        console.log('Navigating to:', tabConfig.url);
                        // Navegar a la URL
                        window.location.href = tabConfig.url;
                        return;
                    }
                }
                
                // Disparar evento personalizado si no hay URL
                const event = new CustomEvent('topNavTabClick', {
                    detail: { tabId: tabId, tabElement: this }
                });
                document.dispatchEvent(event);
            });
        });
        
        // Cerrar dropdown al hacer click fuera
        document.addEventListener('click', function(e) {
            if (!container.contains(e.target)) {
                hamburgerDropdown.classList.remove('show');
            }
        });
    }
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
window.loadSubNav = loadSubNav;
window.getTopNavVariant = getTopNavVariant;
window.getAllTopNavVariants = getAllTopNavVariants;
window.addTopNavEventListeners = addTopNavEventListeners;
window.activateCurrentPageTab = activateCurrentPageTab;
