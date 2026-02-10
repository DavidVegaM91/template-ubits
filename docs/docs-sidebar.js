/**
 * UBITS Docs Sidebar Component
 * Sidebar de navegación para páginas de documentación
 */

// Configuración del sidebar de documentación
// Orden: introducción, navegación (fijo), UI (alfabético por title)
const DOCS_SIDEBAR_SECTIONS = [
    { id: 'introduccion', title: 'Introducción', group: 'main' },
    { id: 'sidebar', title: 'Sidebar', group: 'navegacion' },
    { id: 'sub-nav', title: 'Sub-nav', group: 'navegacion' },
    { id: 'tab-bar', title: 'Tab-bar', group: 'navegacion' },
    // UI en orden alfabético
    { id: 'alert', title: 'Alert', group: 'ui' },
    { id: 'avatar', title: 'Avatar', group: 'ui' },
    { id: 'button', title: 'Button', group: 'ui' },
    { id: 'calendar', title: 'Calendar', group: 'ui' },
    { id: 'card-content', title: 'Card content', group: 'ui' },
    { id: 'card-content-compact', title: 'Card content compact', group: 'ui' },
    { id: 'empty-state', title: 'Empty State', group: 'ui' },
    { id: 'header-product', title: 'Header Product', group: 'ui' },
    { id: 'ia-button', title: 'IA-Button', group: 'ui' },
    { id: 'input', title: 'Input', group: 'ui' },
    { id: 'drawer', title: 'Drawer', group: 'ui' },
    { id: 'modal', title: 'Modal', group: 'ui' },
    { id: 'paginator', title: 'Paginator', group: 'ui' },
    { id: 'status-tag', title: 'Status Tag', group: 'ui' },
    { id: 'tab', title: 'Tab', group: 'ui' },
    { id: 'table', title: 'Tabla', group: 'ui' },
    { id: 'toast', title: 'Toast', group: 'ui' },
    { id: 'tooltip', title: 'Tooltip', group: 'ui' }
];

/**
 * Generar HTML del sidebar a partir de DOCS_SIDEBAR_SECTIONS
 */
function buildDocsSidebarHTML() {
    const main = DOCS_SIDEBAR_SECTIONS.filter(s => s.group === 'main');
    const nav = DOCS_SIDEBAR_SECTIONS.filter(s => s.group === 'navegacion');
    const ui = DOCS_SIDEBAR_SECTIONS.filter(s => s.group === 'ui').sort((a, b) => a.title.localeCompare(b.title));

    const mainItems = main.map(s => `
                <div class="docs-sidebar-item" data-section="${s.id}">
                    <span class="docs-sidebar-text">${s.title}</span>
                </div>`).join('');

    return `
    <div class="docs-sidebar">
        <div class="docs-sidebar-content">
            <div class="docs-sidebar-section">
                ${mainItems}
            </div>
            <div class="docs-sidebar-section">
                <div class="docs-sidebar-title">Componentes</div>
                <div class="docs-sidebar-subsection">
                    <div class="docs-sidebar-subtitle">NAVEGACIÓN</div>
                    ${nav.map(s => `
                    <div class="docs-sidebar-item" data-section="${s.id}">
                        <span class="docs-sidebar-text">${s.title}</span>
                    </div>`).join('')}
                </div>
                <div class="docs-sidebar-subsection">
                    <div class="docs-sidebar-subtitle">UI</div>
                    ${ui.map(s => `
                    <div class="docs-sidebar-item" data-section="${s.id}">
                        <span class="docs-sidebar-text">${s.title}</span>
                    </div>`).join('')}
                </div>
            </div>
        </div>
    </div>
`;
}

/**
 * Generar HTML del dropdown móvil a partir de DOCS_SIDEBAR_SECTIONS
 */
function buildDocsDropdownHTML() {
    const main = DOCS_SIDEBAR_SECTIONS.filter(s => s.group === 'main');
    const nav = DOCS_SIDEBAR_SECTIONS.filter(s => s.group === 'navegacion');
    const ui = DOCS_SIDEBAR_SECTIONS.filter(s => s.group === 'ui').sort((a, b) => a.title.localeCompare(b.title));

    const mainItems = main.map(s => `
            <div class="docs-dropdown-item" data-section="${s.id}">
                <span class="docs-dropdown-item-text ubits-body-md-regular">${s.title}</span>
            </div>`).join('');

    const navItems = nav.map(s => `
                    <div class="docs-dropdown-item" data-section="${s.id}">
                        <span class="docs-dropdown-item-text ubits-body-md-regular">${s.title}</span>
                    </div>`).join('');

    const uiItems = ui.map(s => `
                    <div class="docs-dropdown-item" data-section="${s.id}">
                        <span class="docs-dropdown-item-text ubits-body-md-regular">${s.title}</span>
                    </div>`).join('');

    return `
    <div class="docs-dropdown" id="docs-dropdown">
        <div class="docs-dropdown-trigger">
            <span class="docs-dropdown-text ubits-body-md-regular">Introducción</span>
            <i class="far fa-chevron-down docs-dropdown-icon"></i>
        </div>
        <div class="docs-dropdown-menu">
            ${mainItems}
            <div class="docs-dropdown-group">
                <div class="docs-dropdown-group-title ubits-body-sm-regular">Componentes</div>
                <div class="docs-dropdown-subgroup">
                    <div class="docs-dropdown-subgroup-title ubits-body-sm-regular">NAVEGACIÓN</div>
                    ${navItems}
                </div>
                <div class="docs-dropdown-subgroup">
                    <div class="docs-dropdown-subgroup-title ubits-body-sm-regular">UI</div>
                    ${uiItems}
                </div>
            </div>
        </div>
    </div>
`;
}

/**
 * Cargar sidebar de documentación
 * @param {string} activeSection - Sección activa por defecto
 */
function loadDocsSidebar(activeSection = 'introduccion') {
    // Cargar sidebar lateral (generado desde config, orden UI alfabético)
    const sidebarContainer = document.getElementById('docs-sidebar-container');
    if (sidebarContainer) {
        sidebarContainer.innerHTML = buildDocsSidebarHTML();
    }
    
    // Cargar dropdown móvil
    const dropdownContainer = document.getElementById('docs-dropdown-container');
    if (dropdownContainer) {
        dropdownContainer.innerHTML = buildDocsDropdownHTML();
    }
    
    // Inicializar funcionalidad
    initDocsSidebar(activeSection);
    
    // Hacer scroll en el sidebar para que el ítem activo sea visible al entrar a la página
    scrollSidebarToActiveItem(activeSection);
    
    // Inicializar scroll listener
    initScrollListener();
}

/**
 * Inicializar funcionalidad del sidebar de documentación
 * @param {string} activeSection - Sección activa
 */
function initDocsSidebar(activeSection) {
    const sidebarItems = document.querySelectorAll('.docs-sidebar-item');
    const dropdownItems = document.querySelectorAll('.docs-dropdown-item');
    const dropdown = document.getElementById('docs-dropdown');
    const dropdownTrigger = document.querySelector('.docs-dropdown-trigger');
    const dropdownMenu = document.querySelector('.docs-dropdown-menu');
    
    // Función para obtener la ruta correcta según la ubicación actual
    function getCorrectDocsPath(filename) {
        const currentPath = window.location.pathname;
        
        // Si estamos en documentacion/componentes/ - ruta relativa simple
        if (currentPath.includes('/componentes/')) {
            return filename;
        }
        // Si estamos en documentacion/ (raíz) - agregar componentes/
        else if (currentPath.includes('/documentacion/')) {
            return 'componentes/' + filename;
        }
        // Fallback
        return filename;
    }
    
    // Función para obtener la ruta a componentes.html según ubicación
    function getComponentesPath() {
        const currentPath = window.location.pathname;
        
        // Si estamos en documentacion/componentes/ - subir un nivel
        if (currentPath.includes('/componentes/')) {
            return '../componentes.html';
        }
        // Si estamos en documentacion/ (raíz) - ruta directa
        return 'componentes.html';
    }
    
    // Función para manejar navegación
    function handleDocsNavigation(section) {
        // Debug: verificar que la función se está llamando
        console.log('handleDocsNavigation called with section:', section);
        
        // Cerrar dropdown
        if (dropdownTrigger && dropdownMenu) {
            dropdownTrigger.classList.remove('active');
            dropdownMenu.classList.remove('open');
        }
        
        const currentPath = window.location.pathname;
        
        // Mapeo de secciones a archivos
        const sectionToFile = {
            'introduccion': 'componentes.html',
            'sidebar': 'sidebar.html',
            'sub-nav': 'subnav.html',
            'tab-bar': 'tab-bar.html',
            'button': 'button.html',
            'ia-button': 'ia-button.html',
            'alert': 'alert.html',
            'avatar': 'avatar.html',
            'card-content': 'card-content.html',
            'card-content-compact': 'card-content-compact.html',
            'input': 'input.html',
            'toast': 'toast.html',
            'status-tag': 'status-tag.html',
            'tab': 'tab.html',
            'paginator': 'paginator.html',
            'empty-state': 'empty-state.html',
            'header-product': 'header-product.html',
            'drawer': 'drawer.html',
            'modal': 'modal.html',
            'table': 'table.html',
            'tooltip': 'tooltip.html',
            'calendar': 'calendar.html'
        };
        
        const targetFile = sectionToFile[section];
        if (!targetFile) {
            console.log('Unknown section:', section);
            return;
        }
        
        // Verificar si ya estamos en la página destino
        const isCurrentPage = currentPath.includes(targetFile);
        
        // Caso especial para button vs ia-button
        if (section === 'button' && currentPath.includes('ia-button.html')) {
            // No estamos en button.html, estamos en ia-button.html
        } else if (section === 'card-content' && currentPath.includes('card-content-compact.html')) {
            // No estamos en card-content.html, estamos en card-content-compact.html
        } else if (isCurrentPage) {
            // Ya estamos en la página, solo scroll al top
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        
        // Navegar a la página
        if (section === 'introduccion') {
            window.location.href = getComponentesPath();
        } else {
            window.location.href = getCorrectDocsPath(targetFile);
        }
    }
    
    // Event listeners para sidebar
    sidebarItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation(); // CRITICAL: Prevenir que otros listeners capturen este evento
            const section = this.getAttribute('data-section');
            console.log('Sidebar item clicked, section:', section);
            if (section) {
                handleDocsNavigation(section);
            }
            return false; // Prevenir propagación adicional
        }, true); // Usar capture phase para capturar antes que otros listeners
    });
    
    // Event listeners para dropdown
    if (dropdownTrigger && dropdownMenu) {
        dropdownTrigger.addEventListener('click', function() {
            dropdownTrigger.classList.toggle('active');
            dropdownMenu.classList.toggle('open');
        });
    }
    
    dropdownItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation(); // CRITICAL: Prevenir que otros listeners capturen este evento
            const section = this.getAttribute('data-section');
            console.log('Dropdown item clicked, section:', section);
            if (section) {
                handleDocsNavigation(section);
            }
            return false; // Prevenir propagación adicional
        }, true); // Usar capture phase para capturar antes que otros listeners
    });
    
    // Cerrar dropdown al hacer click fuera
    if (dropdown) {
        document.addEventListener('click', function(event) {
            if (!dropdown.contains(event.target)) {
                if (dropdownTrigger && dropdownMenu) {
                    dropdownTrigger.classList.remove('active');
                    dropdownMenu.classList.remove('open');
                }
            }
        });
    }
    
    // Activar sección por defecto
    setActiveDocsSection(activeSection);
}

/**
 * Hacer scroll en el sidebar para que el ítem activo sea visible al cargar la página
 * @param {string} activeSection - ID de la sección activa
 */
function scrollSidebarToActiveItem(activeSection) {
    requestAnimationFrame(function() {
        const sidebar = document.querySelector('.docs-sidebar');
        const activeItem = document.querySelector('.docs-sidebar-item[data-section="' + activeSection + '"]');
        if (sidebar && activeItem) {
            activeItem.scrollIntoView({ block: 'nearest', behavior: 'auto', inline: 'nearest' });
        }
    });
}

/**
 * Establecer sección activa en el sidebar de documentación
 * @param {string} section - Sección a activar
 */
function setActiveDocsSection(section) {
    // Activar en sidebar lateral
    const sidebarItems = document.querySelectorAll('.docs-sidebar-item');
    sidebarItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-section') === section) {
            item.classList.add('active');
        }
    });
    
    // Actualizar dropdown
    const dropdownText = document.querySelector('.docs-dropdown-text');
    if (dropdownText) {
        const sectionData = DOCS_SIDEBAR_SECTIONS.find(s => s.id === section);
        if (sectionData) {
            dropdownText.textContent = sectionData.title;
        }
    }
}

/**
 * Agregar nueva sección al sidebar de documentación
 * @param {Object} sectionData - Datos de la nueva sección
 */
function addDocsSection(sectionData) {
    // Agregar a la configuración
    DOCS_SIDEBAR_SECTIONS.push(sectionData);
    
    // Recargar sidebar si ya está cargado
    const sidebarContainer = document.getElementById('docs-sidebar-container');
    if (sidebarContainer && sidebarContainer.innerHTML.trim() !== '') {
        loadDocsSidebar();
    }
}

/**
 * Inicializar scroll listener para el sidebar
 */
function initScrollListener() {
    let lastScrollTop = 0;
    const scrollThreshold = 20; // Píxeles de scroll para activar el cambio (más sensible)
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const sidebar = document.querySelector('.docs-sidebar');
        const subNav = document.querySelector('.sub-nav');
        
        if (!sidebar) return;
        
        // Detectar si el sub-nav está visible
        let subNavVisible = true;
        if (subNav) {
            const subNavRect = subNav.getBoundingClientRect();
            subNavVisible = subNavRect.bottom > 0; // Si el bottom está por encima de 0, está visible
        }
        
        // Ajustar posición del sidebar basado en la visibilidad real del sub-nav
        if (subNavVisible) {
            // Sub-nav visible - posición normal
            sidebar.classList.remove('scrolled');
            sidebar.style.top = '80px';
            sidebar.style.height = 'calc(100vh - 80px - 16px)';
        } else {
            // Sub-nav no visible - posición ajustada
            sidebar.classList.add('scrolled');
            sidebar.style.top = '16px';
            sidebar.style.height = 'calc(100vh - 16px - 16px)';
        }
        
        lastScrollTop = scrollTop;
    });
}
