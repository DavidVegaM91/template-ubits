/**
 * UBITS Docs Sidebar Component
 * Sidebar de navegación para páginas de documentación
 */

// Configuración del sidebar de documentación
const DOCS_SIDEBAR_SECTIONS = [
    {
        id: 'introduccion',
        title: 'Introducción',
        group: 'main'
    },
    {
        id: 'sidebar',
        title: 'Sidebar',
        group: 'navegacion'
    },
    {
        id: 'sub-nav',
        title: 'Sub-nav',
        group: 'navegacion'
    },
    {
        id: 'tab-bar',
        title: 'Tab-bar',
        group: 'navegacion'
    },
    {
        id: 'button',
        title: 'Button',
        group: 'ui'
    },
    {
        id: 'alert',
        title: 'Alert',
        group: 'ui'
    },
    {
        id: 'card-content',
        title: 'Card content',
        group: 'ui'
    },
    {
        id: 'input',
        title: 'Input',
        group: 'ui'
    },
    {
        id: 'toast',
        title: 'Toast',
        group: 'ui'
    }
];

// HTML del sidebar de documentación
const docsSidebarHTML = `
    <div class="docs-sidebar">
        <div class="docs-sidebar-content">
            <div class="docs-sidebar-section">
                <div class="docs-sidebar-item" data-section="introduccion">
                    <span class="docs-sidebar-text">Introducción</span>
                </div>
            </div>
            
            <div class="docs-sidebar-section">
                <div class="docs-sidebar-title">Componentes</div>
                <div class="docs-sidebar-subsection">
                    <div class="docs-sidebar-subtitle">NAVEGACIÓN</div>
                    <div class="docs-sidebar-item" data-section="sidebar">
                        <span class="docs-sidebar-text">Sidebar</span>
                    </div>
                    <div class="docs-sidebar-item" data-section="sub-nav">
                        <span class="docs-sidebar-text">Sub-nav</span>
                    </div>
                    <div class="docs-sidebar-item" data-section="tab-bar">
                        <span class="docs-sidebar-text">Tab-bar</span>
                    </div>
                </div>
                <div class="docs-sidebar-subsection">
                    <div class="docs-sidebar-subtitle">UI</div>
                    <div class="docs-sidebar-item" data-section="button">
                        <span class="docs-sidebar-text">Button</span>
                    </div>
                    <div class="docs-sidebar-item" data-section="alert">
                        <span class="docs-sidebar-text">Alert</span>
                    </div>
                    <div class="docs-sidebar-item" data-section="card-content">
                        <span class="docs-sidebar-text">Card content</span>
                    </div>
                    <div class="docs-sidebar-item" data-section="input">
                        <span class="docs-sidebar-text">Input</span>
                    </div>
                    <div class="docs-sidebar-item" data-section="toast">
                        <span class="docs-sidebar-text">Toast</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
`;

// HTML del dropdown móvil
const docsDropdownHTML = `
    <div class="docs-dropdown" id="docs-dropdown">
        <div class="docs-dropdown-trigger">
            <span class="docs-dropdown-text ubits-body-md-regular">Introducción</span>
            <i class="far fa-chevron-down docs-dropdown-icon"></i>
        </div>
        <div class="docs-dropdown-menu">
            <div class="docs-dropdown-item" data-section="introduccion">
                <span class="docs-dropdown-item-text ubits-body-md-regular">Introducción</span>
            </div>
            <div class="docs-dropdown-group">
                <div class="docs-dropdown-group-title ubits-body-sm-regular">Componentes</div>
                <div class="docs-dropdown-subgroup">
                    <div class="docs-dropdown-subgroup-title ubits-body-sm-regular">NAVEGACIÓN</div>
                    <div class="docs-dropdown-item" data-section="sidebar">
                        <span class="docs-dropdown-item-text ubits-body-md-regular">Sidebar</span>
                    </div>
                    <div class="docs-dropdown-item" data-section="sub-nav">
                        <span class="docs-dropdown-item-text ubits-body-md-regular">Sub-nav</span>
                    </div>
                    <div class="docs-dropdown-item" data-section="tab-bar">
                        <span class="docs-dropdown-item-text ubits-body-md-regular">Tab-bar</span>
                    </div>
                </div>
                <div class="docs-dropdown-subgroup">
                    <div class="docs-dropdown-subgroup-title ubits-body-sm-regular">UI</div>
                    <div class="docs-dropdown-item" data-section="button">
                        <span class="docs-dropdown-item-text ubits-body-md-regular">Button</span>
                    </div>
                    <div class="docs-dropdown-item" data-section="alert">
                        <span class="docs-dropdown-item-text ubits-body-md-regular">Alert</span>
                    </div>
                    <div class="docs-dropdown-item" data-section="card-content">
                        <span class="docs-dropdown-item-text ubits-body-md-regular">Card content</span>
                    </div>
                    <div class="docs-dropdown-item" data-section="input">
                        <span class="docs-dropdown-item-text ubits-body-md-regular">Input</span>
                    </div>
                    <div class="docs-dropdown-item" data-section="toast">
                        <span class="docs-dropdown-item-text ubits-body-md-regular">Toast</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
`;

/**
 * Cargar sidebar de documentación
 * @param {string} activeSection - Sección activa por defecto
 */
function loadDocsSidebar(activeSection = 'introduccion') {
    // Cargar sidebar lateral
    const sidebarContainer = document.getElementById('docs-sidebar-container');
    if (sidebarContainer) {
        sidebarContainer.innerHTML = docsSidebarHTML;
    }
    
    // Cargar dropdown móvil
    const dropdownContainer = document.getElementById('docs-dropdown-container');
    if (dropdownContainer) {
        dropdownContainer.innerHTML = docsDropdownHTML;
    }
    
    // Inicializar funcionalidad
    initDocsSidebar(activeSection);
    
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
    
    // Función para manejar navegación
    function handleDocsNavigation(section) {
        // Cerrar dropdown
        if (dropdownTrigger && dropdownMenu) {
            dropdownTrigger.classList.remove('active');
            dropdownMenu.classList.remove('open');
        }
        
        // Navegación según la sección
        if (section === 'introduccion') {
            // Si ya estamos en componentes.html, solo hacer scroll al top
            if (window.location.pathname.includes('componentes.html')) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                // Si estamos en otra página, navegar a componentes.html
                window.location.href = 'componentes.html';
            }
        } else if (section === 'sidebar') {
            // Si ya estamos en sidebar.html, solo hacer scroll al top
            if (window.location.pathname.includes('sidebar.html')) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                // Si estamos en otra página, navegar a sidebar.html
                window.location.href = 'sidebar.html';
            }
        } else if (section === 'sub-nav') {
            // Si ya estamos en subnav.html, solo hacer scroll al top
            if (window.location.pathname.includes('subnav.html')) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                // Si estamos en otra página, navegar a subnav.html
                window.location.href = 'subnav.html';
            }
        } else if (section === 'tab-bar') {
            // Si ya estamos en tab-bar.html, solo hacer scroll al top
            if (window.location.pathname.includes('tab-bar.html')) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                // Si estamos en otra página, navegar a tab-bar.html
                window.location.href = 'tab-bar.html';
            }
        } else if (section === 'button') {
            // Si ya estamos en button.html, solo hacer scroll al top
            if (window.location.pathname.includes('button.html')) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                // Si estamos en otra página, navegar a button.html
                window.location.href = 'button.html';
            }
        } else if (section === 'alert') {
            // Si ya estamos en alert.html, solo hacer scroll al top
            if (window.location.pathname.includes('alert.html')) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                // Si estamos en otra página, navegar a alert.html
                window.location.href = 'alert.html';
            }
        } else if (section === 'card-content') {
            // Si ya estamos en card-content.html, solo hacer scroll al top
            if (window.location.pathname.includes('card-content.html')) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                // Si estamos en otra página, navegar a card-content.html
                window.location.href = 'card-content.html';
            }
        } else if (section === 'input') {
            // Si ya estamos en input.html, solo hacer scroll al top
            if (window.location.pathname.includes('input.html')) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                // Si estamos en otra página, navegar a input.html
                window.location.href = 'input.html';
            }
        } else if (section === 'toast') {
            // Si ya estamos en toast.html, solo hacer scroll al top
            if (window.location.pathname.includes('toast.html')) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                // Si estamos en otra página, navegar a toast.html
                window.location.href = 'toast.html';
            }
        }
    }
    
    // Event listeners para sidebar
    sidebarItems.forEach(item => {
        item.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            handleDocsNavigation(section);
        });
    });
    
    // Event listeners para dropdown
    if (dropdownTrigger && dropdownMenu) {
        dropdownTrigger.addEventListener('click', function() {
            dropdownTrigger.classList.toggle('active');
            dropdownMenu.classList.toggle('open');
        });
    }
    
    dropdownItems.forEach(item => {
        item.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            handleDocsNavigation(section);
        });
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
