/* ========================================
   TAB BAR COMPONENT - RESPONSIVE
   ======================================== */

/**
 * Genera el HTML del tab-bar
 * @returns {string} HTML del tab-bar
 */
function getTabBarHTML() {
    return `
        <div class="tab-bar" id="tab-bar">
            <div class="tab-bar-content">
                <div class="tab-bar-item" data-tab="modulos" onclick="navigateToTab('modulos')">
                    <i class="far fa-th-large tab-bar-icon"></i>
                    <span class="tab-bar-text">Módulos</span>
                </div>
                <div class="tab-bar-item" data-tab="perfil" onclick="navigateToTab('perfil')">
                    <img src="images/Profile-image.jpg" alt="Mi perfil" class="tab-bar-avatar">
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
 */
function loadTabBar(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Contenedor '${containerId}' no encontrado`);
        return;
    }

    container.innerHTML = getTabBarHTML();
    
    // Agregar event listeners
    addTabBarEventListeners();
    
    // Activar el tab correcto basado en la página actual
    activateCurrentPageTab();
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
                if (typeof hideProfileMenu === 'function') {
                    hideProfileMenu();
                }
                // Cambiar tema
                if (typeof toggleDarkMode === 'function') {
                    toggleDarkMode();
                }
                return;
            }
            
            // Si es módulos, toggle floating menu
            if (tabId === 'modulos') {
                e.stopPropagation();
                const modulosMenu = document.getElementById('floating-menu');
                if (modulosMenu) {
                    if (modulosMenu.classList.contains('show')) {
                        modulosMenu.classList.remove('show');
                    } else {
                        modulosMenu.classList.add('show');
                    }
                }
                return;
            }
            
            // Si es perfil, toggle profile menu
            if (tabId === 'perfil') {
                e.stopPropagation();
                const perfilMenu = document.getElementById('profile-menu');
                if (perfilMenu) {
                    if (perfilMenu.classList.contains('show')) {
                        perfilMenu.classList.remove('show');
                    } else {
                        perfilMenu.classList.add('show');
                    }
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
function navigateToTab(tabId) {
    console.log('Navigating to:', tabId);
    
    switch(tabId) {
        default:
            console.log('Tab no reconocido:', tabId);
    }
}

/**
 * Activa el tab correcto basado en la página actual
 */
function activateCurrentPageTab() {
    // NO activar ningún tab por ahora (hasta que implementemos en otras páginas)
    // Los tabs solo abren/cierran modales o cambian tema
}

// Exportar funciones para uso global
window.getTabBarHTML = getTabBarHTML;
window.loadTabBar = loadTabBar;
window.addTabBarEventListeners = addTabBarEventListeners;
window.navigateToTab = navigateToTab;
window.activateCurrentPageTab = activateCurrentPageTab;
