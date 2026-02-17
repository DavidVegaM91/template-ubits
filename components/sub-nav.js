/* ========================================
   TOP NAVIGATION COMPONENT
   ======================================== */

// Función para calcular la ruta base según la profundidad de la página
function getSubNavBasePath() {
    const path = window.location.pathname;
    
    // Detectar la profundidad basándose en patrones de carpetas del proyecto
    // Páginas en subcarpetas de segundo nivel (ubits-colaborador/*, ubits-admin/*)
    if (path.includes('/ubits-colaborador/') || path.includes('/ubits-admin/')) {
        return '../../';
    }
    
    // Páginas en subcarpetas de documentacion (documentacion/componentes/, documentacion/guias/, etc.)
    if (path.includes('/documentacion/') && path.split('/documentacion/')[1].includes('/')) {
        return '../../';
    }
    
    // Páginas en primer nivel de carpeta (documentacion/*.html)
    if (path.includes('/documentacion/')) {
        return '../';
    }
    
    // Página en la raíz (index.html) o cualquier otra ubicación
    return '';
}

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
            { id: 'section1', label: 'Inicio', icon: 'far fa-home', url: 'documentacion.html', urlFromGuias: '../documentacion.html', urlFromComponentes: '../documentacion.html' },
            { id: 'section2', label: 'Guía de prompts', icon: 'far fa-comments', url: 'guia-prompts.html', urlFromGuias: '../guia-prompts.html', urlFromComponentes: '../guia-prompts.html' },
            { id: 'section3', label: 'Componentes', icon: 'far fa-cube', url: 'componentes.html', urlFromGuias: '../componentes.html', urlFromComponentes: '../componentes.html' },
            { id: 'section4', label: 'Colores', icon: 'far fa-palette', url: 'guias/colores.html', urlFromGuias: 'colores.html', urlFromComponentes: '../guias/colores.html' },
            { id: 'section5', label: 'Iconos', icon: 'far fa-icons', url: 'guias/iconos.html', urlFromGuias: 'iconos.html', urlFromComponentes: '../guias/iconos.html' },
            { id: 'section6', label: 'Tipografía', icon: 'far fa-text-size', url: 'guias/tipografia.html', urlFromGuias: 'tipografia.html', urlFromComponentes: '../guias/tipografia.html' }
        ]
    },
    aprendizaje: {
        name: 'Aprendizaje',
        tabs: [
            { id: 'modo-estudio-ia', label: 'Modo estudio IA', icon: 'far fa-sparkles', url: '../../ubits-colaborador/aprendizaje/modo-estudio-ia.html' },
            { id: 'home', label: 'Inicio', icon: 'far fa-home', url: '../../ubits-colaborador/aprendizaje/home-learn.html' },
            { id: 'corporate', label: 'U. Corporativa', icon: 'far fa-building-columns', url: '../../ubits-colaborador/aprendizaje/u-corporativa.html' },
            { id: 'study-zone', label: 'Zona de estudio', icon: 'far fa-books', url: '../../ubits-colaborador/aprendizaje/zona-estudio.html' }
        ]
    },
    desempeno: {
        name: 'Desempeño',
        tabs: [
            { id: 'evaluations', label: 'Evaluaciones 360', icon: 'far fa-chart-pie', url: '../../ubits-colaborador/desempeno/evaluaciones-360.html' },
            { id: 'objectives', label: 'Objetivos', icon: 'far fa-bullseye', url: '../../ubits-colaborador/desempeno/objetivos.html' },
            { id: 'metrics', label: 'Métricas', icon: 'far fa-chart-line', url: '../../ubits-colaborador/desempeno/metricas.html' },
            { id: 'reports', label: 'Reportes', icon: 'far fa-file-chart-line', url: '../../ubits-colaborador/desempeno/reportes.html' }
        ]
    },
    encuestas: {
        name: 'Encuestas',
        tabs: [
            { id: 'encuestas', label: 'Encuestas', icon: 'far fa-clipboard-list-check', url: '../../ubits-colaborador/encuestas/encuestas.html' }
        ]
    },
    tareas: {
        name: 'Tareas',
        tabs: [
            { id: 'plans', label: 'Planes', icon: 'far fa-layer-group', url: '../../ubits-colaborador/tareas/planes.html' },
            { id: 'tasks', label: 'Tareas', icon: 'far fa-tasks', url: '../../ubits-colaborador/tareas/tareas.html' },
            { id: 'plantillas', label: 'Plantillas', icon: 'far fa-rectangle-history', url: '../../ubits-colaborador/tareas/plantilla.html' },
            { id: 'seguimiento', label: 'Seguimiento', icon: 'far fa-chart-line', url: '../../ubits-colaborador/tareas/seguimiento.html' }
        ]
    },
    empresa: {
        name: 'Empresa',
        tabs: [
            { id: 'gestion-usuarios', label: 'Gestión de usuarios', icon: 'far fa-users', url: '../../ubits-admin/empresa/gestion-de-usuarios.html' },
            { id: 'organigrama', label: 'Organigrama', icon: 'far fa-sitemap', url: '../../ubits-admin/empresa/organigrama.html' },
            { id: 'datos-empresa', label: 'Datos de empresa', icon: 'far fa-building', url: '../../ubits-admin/empresa/datos-de-empresa.html' },
            { id: 'personalizacion', label: 'Personalización', icon: 'far fa-paint-brush', url: '../../ubits-admin/empresa/personalizacion.html' },
            { id: 'roles-permisos', label: 'Roles y permisos', icon: 'far fa-user-shield', url: '../../ubits-admin/empresa/roles-y-permisos.html' },
            { id: 'comunicaciones', label: 'Comunicaciones', icon: 'far fa-envelope', url: '../../ubits-admin/empresa/comunicaciones.html' }
        ]
    },
    'admin-aprendizaje': {
        name: 'Aprendizaje',
        tabs: [
            { id: 'planes-formacion', label: 'Planes de formación', icon: 'far fa-clipboard-list-check', url: '../../ubits-admin/aprendizaje/planes-formacion.html' },
            { id: 'u-corporativa', label: 'Universidad corporativa', icon: 'far fa-building-columns', url: '../../ubits-admin/aprendizaje/admin-u-corporativa.html' },
            { id: 'certificados', label: 'Certificados', icon: 'far fa-file-certificate', url: '../../ubits-admin/aprendizaje/admin-certificados.html' },
            { id: 'seguimiento', label: 'Seguimiento', icon: 'far fa-chart-line', url: '../../ubits-admin/aprendizaje/seguimiento.html' }
        ]
    },
    'admin-desempeño': {
        name: 'Desempeño',
        tabs: [
            { id: 'evaluations', label: 'Evaluaciones 360', icon: 'far fa-chart-pie', url: '../../ubits-admin/desempeno/admin-360.html' },
            { id: 'objectives', label: 'Objetivos', icon: 'far fa-bullseye', url: '../../ubits-admin/desempeno/admin-objetivos.html' },
            { id: 'matriz-talento', label: 'Matriz de Talento', icon: 'far fa-sitemap', url: '../../ubits-admin/desempeno/admin-matriz-talento.html' }
        ]
    },
    diagnostico: {
        name: 'Diagnóstico',
        tabs: [
            { id: 'diagnostico', label: 'Diagnostico', icon: 'far fa-stethoscope', url: '../../ubits-colaborador/diagnostico/diagnostico.html' }
        ]
    },
    reclutamiento: {
        name: 'Reclutamiento',
        tabs: [
            { id: 'reclutamiento', label: 'Reclutamiento', icon: 'far fa-user-plus', url: '../../ubits-colaborador/reclutamiento/reclutamiento.html' }
        ]
    },
    'admin-diagnostico': {
        name: 'Diagnóstico',
        tabs: [
            { id: 'diagnostico', label: 'Diagnostico', icon: 'far fa-stethoscope', url: '../../ubits-admin/diagnostico/admin-diagnostico.html' }
        ]
    },
    'admin-encuestas': {
        name: 'Encuestas',
        tabs: [
            { id: 'encuestas', label: 'Encuestas', icon: 'far fa-clipboard-list-check', url: '../../ubits-admin/encuestas/admin-encuestas.html' }
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

    // Logo del cliente antes de los tabs (solo para variantes que NO sean documentacion)
    const basePath = getSubNavBasePath();
    const clientLogo = variant !== 'documentacion' ? `
        <div class="sub-nav-logo">
            <img src="${basePath}images/Client-logo.png" alt="Client Logo" class="sub-nav-logo-img">
        </div>
    ` : '';

    return `
        <div class="sub-nav" data-variant="${variant}">
            ${clientLogo}
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
        // Detectar overflow y activar selector si es necesario
        checkAndActivateSelector(container, variant, customTabs);
    }, 200);
    
    // También verificar después de que todo esté renderizado
    setTimeout(() => {
        checkAndActivateSelector(container, variant, customTabs);
    }, 500);
    
    // Detectar cambios de tamaño de ventana
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            checkAndActivateSelector(container, variant, customTabs);
        }, 100);
    });
}

// Mapeo simple: página -> tab ID
const PAGE_TO_TAB = {
    // Aprendizaje
    'home-learn.html': 'home',
    'catalogo.html': 'catalog',
    'catalogo-v2.html': 'catalog',
    'catalogo-v3.html': 'catalog',
    'catalogo-v4.html': 'catalog',
    'catalogo-v5.html': 'catalog',
    'catalogo-v6.html': 'catalog',
    'modo-estudio-ia.html': 'modo-estudio-ia',
    'u-corporativa.html': 'corporate',
    'zona-estudio.html': 'study-zone',
    // Desempeño
    'evaluaciones-360.html': 'evaluations',
    'objetivos.html': 'objectives',
    'metricas.html': 'metrics',
    'reportes.html': 'reports',
    // Tareas
    'planes.html': 'plans',
    'tareas.html': 'tasks',
    'plantilla.html': 'plantillas',
    // Documentación
    'documentacion.html': 'section1',
    'guia-prompts.html': 'section2',
    'componentes.html': 'section3',
    'sidebar.html': 'section3',
    'subnav.html': 'section3',
    'tab-bar.html': 'section3',
    'alert.html': 'section3',
    'avatar.html': 'section3',
    'badge-tag.html': 'section3',
    'button.html': 'section3',
    'calendar.html': 'section3',
    'card-content.html': 'section3',
    'card-content-compact.html': 'section3',
    'dropdown-menu.html': 'section3',
    'drawer.html': 'section3',
    'empty-state.html': 'section3',
    'header-product.html': 'section3',
    'ia-button.html': 'section3',
    'input.html': 'section3',
    'loader.html': 'section3',
    'modal.html': 'section3',
    'paginator.html': 'section3',
    'radio-button.html': 'section3',
    'save-indicator.html': 'section3',
    'status-tag.html': 'section3',
    'tab.html': 'section3',
    'table.html': 'section3',
    'toast.html': 'section3',
    'tooltip.html': 'section3',
    'colores.html': 'section4',
    'iconos.html': 'section5',
    'tipografia.html': 'section6',
    // Encuestas
    'encuestas.html': 'encuestas',
    // Diagnóstico
    'diagnostico.html': 'diagnostico',
    // Reclutamiento
    'reclutamiento.html': 'reclutamiento',
    // Admin empresa
    'gestion-de-usuarios.html': 'gestion-usuarios',
    'organigrama.html': 'organigrama',
    'datos-de-empresa.html': 'datos-empresa',
    'personalizacion.html': 'personalizacion',
    'roles-y-permisos.html': 'roles-permisos',
    'comunicaciones.html': 'comunicaciones',
    // Admin aprendizaje
    'planes-formacion.html': 'planes-formacion',
    'admin-u-corporativa.html': 'u-corporativa',
    'admin-certificados.html': 'certificados',
    'seguimiento.html': 'seguimiento',
    // Admin desempeño
    'admin-360.html': 'evaluations',
    'admin-objetivos.html': 'objectives',
    'admin-matriz-talento.html': 'matriz-talento',
    // Admin diagnóstico
    'admin-diagnostico.html': 'diagnostico',
    // Admin encuestas
    'admin-encuestas.html': 'encuestas'
};

function activateCurrentPageTab(container, variant) {
    const currentPage = window.location.pathname.split('/').pop();
    const tabId = PAGE_TO_TAB[currentPage];
    
    if (tabId) {
        // Activar en nav-tab
        const navTab = container.querySelector(`.nav-tab[data-tab="${tabId}"]`);
        if (navTab) navTab.classList.add('active');
        
        // Activar en hamburger-item
        const hamburgerItem = container.querySelector(`.hamburger-item[data-tab="${tabId}"]`);
        if (hamburgerItem) hamburgerItem.classList.add('active');
        
        // Activar en module-selector-item
        const selectorItem = container.querySelector(`.module-selector-item[data-tab="${tabId}"]`);
        if (selectorItem) selectorItem.classList.add('active');
    }
    
    // Si no se activó ningún tab, activar el primero
    if (!container.querySelector('.nav-tab.active')) {
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
                const targetUrl = getCorrectTabUrl(tabConfig, variant);
                if (targetUrl) {
                    // Navegar a la URL
                    window.location.href = targetUrl;
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
                    const targetUrl = getCorrectTabUrl(tabConfig, variant);
                    if (targetUrl) {
                        console.log('Navigating to:', targetUrl);
                        // Navegar a la URL
                        window.location.href = targetUrl;
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
 * Obtiene la URL correcta para un tab según la ubicación actual
 * @param {Object} tabConfig - Configuración del tab
 * @param {string} variant - Variante del top-nav
 * @returns {string} URL correcta para navegar
 */
function getCorrectTabUrl(tabConfig, variant) {
    if (!tabConfig) return null;
    
    let targetUrl = tabConfig.url;
    
    if (variant === 'documentacion') {
        const currentPath = window.location.pathname;
        
        // Si estamos en documentacion/guias/
        if (currentPath.includes('/guias/')) {
            targetUrl = tabConfig.urlFromGuias || tabConfig.url;
        }
        // Si estamos en documentacion/componentes/
        else if (currentPath.includes('/componentes/')) {
            targetUrl = tabConfig.urlFromComponentes || tabConfig.url;
        }
        // Si estamos en documentacion/ (raíz)
        else {
            targetUrl = tabConfig.url;
        }
    }
    
    return targetUrl;
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
        const targetUrl = getCorrectTabUrl(tabConfig, variant);
        
        if (targetUrl) {
            console.log('Going to:', targetUrl);
            window.location.href = targetUrl;
            return;
        }
    }
    console.log('No URL found for tab:', tabId);
};

/**
 * Detecta si los tabs no caben y activa el selector automáticamente
 * @param {HTMLElement} container - Contenedor del sub-nav
 * @param {string} variant - Variante del top-nav
 * @param {Array} customTabs - Array opcional de tabs personalizados
 */
function checkAndActivateSelector(container, variant, customTabs = []) {
    // Regla simple: >= 1280px = items, < 1280px = selector (excepto documentación)
    if (variant === 'documentacion') {
        // Documentación siempre usa su propio sistema
        return;
    }
    
    const subNav = container.querySelector('.sub-nav');
    if (!subNav) return;
    
    if (window.innerWidth >= 1280) {
        // Desktop (>= 1280px): siempre mostrar items
        if (subNav.classList.contains('use-selector')) {
            subNav.classList.remove('use-selector');
            restoreOriginalTabs(container, variant, customTabs);
        } else {
            // Asegurarse de que los tabs estén presentes
            const navTabs = container.querySelector('.nav-tabs');
            if (navTabs && !navTabs.querySelector('.nav-tab')) {
                restoreOriginalTabs(container, variant, customTabs);
            }
        }
    } else {
        // Mobile/Tablet (< 1280px): siempre mostrar selector
        if (!subNav.classList.contains('use-selector')) {
            activateSelector(container, variant, customTabs);
        }
    }
}

/**
 * Restaura los tabs originales cuando se desactiva el selector
 * @param {HTMLElement} container - Contenedor del sub-nav
 * @param {string} variant - Variante del top-nav
 * @param {Array} customTabs - Array opcional de tabs personalizados
 */
function restoreOriginalTabs(container, variant, customTabs = []) {
    const config = TOP_NAV_VARIANTS[variant];
    if (!config) return;
    
    const tabs = variant === 'template' && customTabs.length > 0 ? customTabs : config.tabs;
    
    // Obtener el tab activo basado en la página actual (KISS)
    const currentPage = window.location.pathname.split('/').pop();
    const activeTabId = PAGE_TO_TAB[currentPage] || null;
    
    // Regenerar HTML de los tabs originales
    let tabsHTML = '';
    if (tabs.length > 0) {
        tabsHTML = tabs.map(tab => {
            const isActive = tab.id === activeTabId;
            return `
                <button class="nav-tab ${isActive ? 'active' : ''}" data-tab="${tab.id}" onclick="navigateToTab('${tab.id}', '${variant}')">
                <i class="fa ${tab.icon}"></i>
                <span class="ubits-body-sm-regular">${tab.label}</span>
            </button>
            `;
        }).join('');
    }
    
    // Restaurar el contenido de nav-tabs
    const navTabs = container.querySelector('.nav-tabs');
    if (navTabs) {
        navTabs.innerHTML = tabsHTML;
        // Re-agregar event listeners
        addTopNavEventListeners(container);
        // Si no se encontró tab activo, intentar activar basado en la página actual
        if (!activeTabId) {
        activateCurrentPageTab(container, variant);
        }
    }
}

/**
 * Activa el selector mobile
 * @param {HTMLElement} container - Contenedor del sub-nav
 * @param {string} variant - Variante del top-nav
 * @param {Array} customTabs - Array opcional de tabs personalizados
 */
function activateSelector(container, variant, customTabs = []) {
    const subNav = container.querySelector('.sub-nav');
    if (!subNav) return;
    
    subNav.classList.add('use-selector');
    
    const config = TOP_NAV_VARIANTS[variant];
    if (!config) return;
    
    const tabs = variant === 'template' && customTabs.length > 0 ? customTabs : config.tabs;
    
    // Obtener el tab activo basado en la página actual (KISS)
    const currentPage = window.location.pathname.split('/').pop();
    let activeTabId = PAGE_TO_TAB[currentPage] || null;
    let activeTabLabel = '';
    
    // Buscar el label del tab activo
    if (activeTabId) {
        const activeTabConfig = tabs.find(t => t.id === activeTabId);
        if (activeTabConfig) {
            activeTabLabel = activeTabConfig.label;
        }
    }
    
    // Si no se encontró, usar el primero
    if (!activeTabLabel && tabs.length > 0) {
        activeTabId = tabs[0].id;
        activeTabLabel = tabs[0].label;
    }
    
    // Crear HTML del selector
    const moduleNameHTML = `
        <div class="module-name">
            <div class="module-name-label">${config.name}</div>
        </div>
    `;
    
    const selectorItemsHTML = tabs.map(tab => {
        const isActive = tab.id === activeTabId;
        return `
            <a href="${tab.url || '#'}" class="module-selector-item ${isActive ? 'active' : ''}" data-tab="${tab.id}">
                <i class="fa ${tab.icon}"></i>
                <span>${tab.label}</span>
            </a>
        `;
    }).join('');
    
    const selectorHTML = `
        <div class="module-selector">
            <button class="module-selector-button" id="module-selector-btn">
                <span class="module-selector-button-text">${activeTabLabel}</span>
                <i class="far fa-chevron-down module-selector-button-chevron"></i>
            </button>
            <div class="module-selector-dropdown" id="module-selector-dropdown">
                ${selectorItemsHTML}
            </div>
        </div>
    `;
    
    // Insertar el selector después del logo
    const navTabs = subNav.querySelector('.nav-tabs');
    if (navTabs) {
        navTabs.innerHTML = moduleNameHTML + selectorHTML;
    }
    
    // Agregar event listeners al selector
    const selectorButton = subNav.querySelector('#module-selector-btn');
    const selectorDropdown = subNav.querySelector('#module-selector-dropdown');
    const selectorItems = subNav.querySelectorAll('.module-selector-item');
    
    if (selectorButton && selectorDropdown) {
        selectorButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            selectorButton.classList.toggle('open');
            selectorDropdown.classList.toggle('show');
        });
        
        // Cerrar al hacer click fuera
        document.addEventListener('click', function closeDropdown(e) {
            if (!subNav.contains(e.target)) {
                selectorButton.classList.remove('open');
                selectorDropdown.classList.remove('show');
                document.removeEventListener('click', closeDropdown);
            }
        });
    }
    
    // Manejar clicks en los items del selector
    selectorItems.forEach(item => {
        item.addEventListener('click', function(e) {
            const tabId = this.getAttribute('data-tab');
            const tabConfig = tabs.find(t => t.id === tabId);
            
            if (tabConfig && tabConfig.url) {
                window.location.href = tabConfig.url;
            } else {
                // Disparar evento personalizado
                const event = new CustomEvent('topNavTabClick', {
                    detail: { tabId: tabId, tabElement: this }
                });
                document.dispatchEvent(event);
            }
            
            // Actualizar el botón con el texto seleccionado
            const buttonText = selectorButton.querySelector('.module-selector-button-text');
            if (buttonText) {
                buttonText.textContent = tabConfig.label;
            }
            
            // Remover active de todos y agregar al seleccionado
            selectorItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            // Cerrar dropdown
            selectorButton.classList.remove('open');
            selectorDropdown.classList.remove('show');
        });
    });
}

// Exportar funciones para uso global
window.getTopNavHTML = getTopNavHTML;
window.loadSubNav = loadSubNav;
window.getTopNavVariant = getTopNavVariant;
window.getAllTopNavVariants = getAllTopNavVariants;
window.addTopNavEventListeners = addTopNavEventListeners;
window.activateCurrentPageTab = activateCurrentPageTab;
window.checkAndActivateSelector = checkAndActivateSelector;
window.activateSelector = activateSelector;
window.restoreOriginalTabs = restoreOriginalTabs;
