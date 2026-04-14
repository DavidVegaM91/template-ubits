/* ========================================
   TAB BAR COMPONENT - RESPONSIVE
   ======================================== */

/**
 * Genera el HTML del tab-bar
 * @param {string} variant - 'default' | 'admin' | 'creator' (primer tab + menú flotante alineados con README)
 * @returns {string} HTML del tab-bar
 */
function getTabBarHTML(variant) {
    variant = variant || 'default';
    let firstLabel = 'Módulos';
    let firstIconClass = 'far fa-grid-2 tab-bar-icon';
    if (variant === 'admin') {
        firstLabel = 'Admin';
        firstIconClass = 'far fa-laptop tab-bar-icon';
    } else if (variant === 'creator') {
        firstLabel = 'LMS Creator';
        firstIconClass = 'far fa-bolt tab-bar-icon';
    }
    return `
        <div class="tab-bar" id="tab-bar">
            <div class="tab-bar-content">
                <div class="tab-bar-item" data-tab="modulos" onclick="navigateToTab('modulos')">
                    <i class="${firstIconClass}"></i>
                    <span class="tab-bar-text">${firstLabel}</span>
                </div>
                <div class="tab-bar-item" data-tab="perfil" onclick="navigateToTab('perfil')">
                    <img src="../../images/Profile-image.jpg" alt="Mi perfil" class="tab-bar-avatar">
                    <span class="tab-bar-text">Mi perfil</span>
                </div>
                <div class="tab-bar-item" data-tab="modo-oscuro" onclick="navigateToTab('modo-oscuro')">
                    <i class="far fa-moon tab-bar-icon"></i>
                    <span class="tab-bar-text">Modo oscuro</span>
                </div>
            </div>
        </div>
    `;
}

/**
 * Carga el tab-bar en el contenedor especificado
 * @param {string} containerId - ID del contenedor donde cargar el tab-bar
 * @param {string} variant - 'default' | 'admin' | 'creator'
 */
function loadTabBar(containerId, variant) {
    variant = variant || 'default';
    window._tabBarVariant = variant;
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Contenedor '${containerId}' no encontrado`);
        return;
    }

    // Usar directamente el HTML generado - tab-bar.html es una página completa, no un componente
    // CRITICAL: No hacer fetch de tab-bar.html porque es una página HTML completa con DOCTYPE, head, body, etc.
    // Usar getTabBarHTML() que genera solo el HTML del componente
    container.innerHTML = getTabBarHTML(variant);
    
    // Agregar event listeners
    addTabBarEventListeners();
    
    // Activar el tab correcto basado en la página actual
    activateCurrentPageTab();
    
    console.log('Tab bar component loaded successfully');
}

/**
 * Agrega event listeners a los items del tab-bar
 */
function addTabBarEventListeners() {
    const tabItems = document.querySelectorAll('.tab-bar-item');
    
    tabItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            const tabId = this.getAttribute('data-tab');
            console.log('Tab clicked:', tabId);
            
            // Si es modo oscuro, cerrar cualquier floating menu y cambiar tema
            if (tabId === 'modo-oscuro') {
                e.stopPropagation();
                // Cerrar cualquier floating menu abierto
                if (typeof hideFloatingMenu === 'function') {
                    hideFloatingMenu();
                }
                if (typeof hideFloatingProfileMenu === 'function') {
                    hideFloatingProfileMenu();
                }
                if (typeof hideProfileMenu === 'function') {
                    hideProfileMenu();
                }
                // Cambiar tema
                if (typeof toggleDarkMode === 'function') {
                    toggleDarkMode();
                }
                return;
            }
            
            // Si es módulos, toggle floating menu (mismo patrón que Admin / LMS Creator)
            if (tabId === 'modulos') {
                e.stopPropagation();
                const perfilPanel = document.getElementById('floating-menu-profile');
                if (perfilPanel && perfilPanel.classList.contains('show')) {
                    perfilPanel.classList.remove('show');
                }
                const modulosMenu = document.getElementById('floating-menu');
                if (modulosMenu) {
                    if (modulosMenu.classList.contains('show')) {
                        modulosMenu.classList.remove('show');
                    } else {
                        modulosMenu.classList.add('show');
                        if (typeof setActiveItemByCurrentPage === 'function') {
                            setActiveItemByCurrentPage();
                        }
                    }
                }
                if (typeof syncFloatingMenusBodyOverflow === 'function') {
                    syncFloatingMenusBodyOverflow();
                }
                return;
            }
            
            // Si es perfil, mismo tipo de panel flotante que Módulos (no submenu)
            if (tabId === 'perfil') {
                e.stopPropagation();
                const modulosMenu = document.getElementById('floating-menu');
                if (modulosMenu && modulosMenu.classList.contains('show')) {
                    modulosMenu.classList.remove('show');
                }
                const perfilPanel = document.getElementById('floating-menu-profile');
                if (perfilPanel) {
                    if (perfilPanel.classList.contains('show')) {
                        perfilPanel.classList.remove('show');
                    } else {
                        perfilPanel.classList.add('show');
                    }
                }
                if (typeof syncFloatingMenusBodyOverflow === 'function') {
                    syncFloatingMenusBodyOverflow();
                }
                return;
            }
            
            
            // Navegación normal para otros tabs
            const result = navigateToTab(tabId);
            
            // Si navigateToTab retorna false, no activar el tab
            if (result === false) {
                return;
            }
            
            // NO activar ningún tab por ahora (hasta que implementemos en otras páginas)
            // Los tabs solo abren/cierran modales o cambian tema
        });
    });
}

/**
 * Navega a la página correspondiente
 * @param {string} tabId - ID del tab clickeado
 */
// Función navigateToTab removida - usar la del subnav

/**
 * Activa el tab correcto basado en la página actual
 */
function activateCurrentPageTab() {
    // Obtener la URL actual
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop().replace('.html', '');
    
    console.log('Current page detected:', currentPage);
    
    // Remover clase active de todos los tabs
    const allTabs = document.querySelectorAll('.tab-bar-item');
    allTabs.forEach(tab => {
        tab.classList.remove('active');
    });

    const variant = window._tabBarVariant || 'default';
    if (variant === 'admin' || variant === 'creator') {
        const modulosTab = document.querySelector('[data-tab="modulos"]');
        if (modulosTab) {
            modulosTab.classList.add('active');
            console.log('Tab activado (variante producto):', variant);
        }
        return;
    }
    
    // Activar el tab correspondiente a la página actual
    let tabToActivate = null;
    
    switch(currentPage) {
        case 'profile':
            tabToActivate = document.querySelector('[data-tab="perfil"]');
            break;
        case 'ia-para-hr':
        case 'ubits-ai':
        case 'home-learn':
        case 'catalogo':
        case 'u-corporativa':
        case 'personalizacion-u-corporativa':
        case 'personalizacion-seguimiento':
        case 'zona-estudio':
        case 'diagnostico':
        case 'evaluaciones-360':
        case 'objetivos':
        case 'metricas':
        case 'reportes':
        case 'encuestas':
        case 'reclutamiento':
        case 'planes':
        case 'tareas':
            // Todas las páginas de módulos activan el tab de módulos
            tabToActivate = document.querySelector('[data-tab="modulos"]');
            break;
        case 'index':
        case '':
            // Página principal - no activar ningún tab específico
            break;
        default:
            console.log('Página no reconocida para activación de tab:', currentPage);
            break;
    }
    
    // Activar el tab si se encontró
    if (tabToActivate) {
        tabToActivate.classList.add('active');
        console.log('Tab activado:', tabToActivate.getAttribute('data-tab'));
    }
}

// Exportar funciones para uso global
window.getTabBarHTML = getTabBarHTML;
window.loadTabBar = loadTabBar;
window.addTabBarEventListeners = addTabBarEventListeners;
// window.navigateToTab removido - usar la del subnav
window.activateCurrentPageTab = activateCurrentPageTab;
