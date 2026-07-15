/**
 * UBITS Docs Sidebar Component
 * Sidebar de navegación para páginas de documentación
 */

// Configuración del sidebar de documentación
// Orden: introducción, navegación (fijo), UI general (alfabético), aprendizaje (alfabético), IA (alfabético), operations (alfabético)
const DOCS_SIDEBAR_SECTIONS = [
    { id: 'introduccion', title: 'Introducción', group: 'main' },
    { id: 'sidebar', title: 'Sidebar', group: 'navegacion' },
    { id: 'sub-nav', title: 'Sub-nav', group: 'navegacion' },
    { id: 'submenu', title: 'Submenu', group: 'navegacion' },
    { id: 'tab', title: 'Tab', group: 'navegacion' },
    { id: 'tab-bar', title: 'Tab-bar', group: 'navegacion' },
    { id: 'header-product', title: 'Header Product', group: 'navegacion' },
    { id: 'stepper', title: 'Stepper', group: 'navegacion' },
    { id: 'paginator', title: 'Paginator', group: 'navegacion' },
    // Aprendizaje (alfabético por title)
    { id: 'card-content', title: 'Card content', group: 'aprendizaje' },
    { id: 'card-content-compact', title: 'Card content compact', group: 'aprendizaje' },
    { id: 'card-plan-formacion', title: 'Card plan formación', group: 'aprendizaje' },
    { id: 'complementary-resources', title: 'Complementary resources', group: 'aprendizaje' },
    { id: 'hero-search', title: 'Hero search', group: 'aprendizaje' },
    { id: 'learn-question', title: 'Learn question', group: 'aprendizaje' },
    { id: 'learn-content-img-trailer', title: 'Learn content imagen y tráiler', group: 'aprendizaje' },
    { id: 'cierre-exp-estudio', title: 'Cierre Exp Estudio', group: 'aprendizaje' },
    { id: 'eval-sticky-bar-exp-estudio', title: 'Eval Sticky Bar Exp Estudio', group: 'aprendizaje' },
    { id: 'feedback-exp-estudio', title: 'Feedback Exp Estudio', group: 'aprendizaje' },
    { id: 'indice-creator', title: 'Indice creator', group: 'aprendizaje' },
    { id: 'indice-exp-estudio', title: 'Indice Exp Estudio', group: 'aprendizaje' },
    { id: 'paginas-creator', title: 'Paginas creator', group: 'aprendizaje' },
    { id: 'paginas-exp-estudio', title: 'Paginas Exp Estudio', group: 'aprendizaje' },
    { id: 'progreso-exp-estudio', title: 'Progreso Exp Estudio', group: 'aprendizaje' },
    { id: 'resources-card', title: 'Resources card', group: 'aprendizaje' },
    { id: 'resources-block', title: 'Resources block', group: 'aprendizaje' },
    { id: 'seccion-creator', title: 'Seccion creator', group: 'aprendizaje' },
    { id: 'seccion-exp-estudio', title: 'Seccion Exp Estudio', group: 'aprendizaje' },
    { id: 'sidebar-contenidos-lms', title: 'Sidebar contenidos LMS', group: 'aprendizaje' },
    { id: 'titulo-progreso-y-nav-exp-estudio', title: 'Titulo Progreso y Nav Exp Estudio', group: 'aprendizaje' },
    { id: 'titulo-specs-cta-exp-estudio', title: 'Titulo Specs CTA Exp Estudio', group: 'aprendizaje' },
    // UI general (alfabético por title)
    { id: 'accordion', title: 'Accordion', group: 'ui' },
    { id: 'alert', title: 'Alert', group: 'ui' },
    { id: 'attention-badge', title: 'Attention badge', group: 'ui' },
    { id: 'save-indicator', title: 'Save Indicator', group: 'ui' },
    { id: 'selection-card', title: 'Selection Card', group: 'ui' },
    { id: 'skeleton', title: 'Skeleton', group: 'ui' },
    { id: 'avatar', title: 'Avatar', group: 'ui' },
    { id: 'badge-tag', title: 'Badge Tag', group: 'ui' },
    { id: 'button', title: 'Button', group: 'ui' },
    { id: 'button-group', title: 'Button group', group: 'ui' },
    { id: 'calendar', title: 'Calendar', group: 'ui' },
    { id: 'checkbox', title: 'Checkbox', group: 'ui' },
    { id: 'chip', title: 'Chip', group: 'ui' },
    { id: 'coachmark', title: 'Coachmark', group: 'ui' },
    { id: 'carousel-indicators', title: 'Carousel indicators', group: 'ui' },
    { id: 'color-picker', title: 'Color picker', group: 'ui' },
    { id: 'empty-state', title: 'Empty State', group: 'ui' },
    { id: 'file-upload', title: 'File Upload', group: 'ui' },
    { id: 'file-upload-compact', title: 'File Upload Compact', group: 'ui' },
    { id: 'inline-edit', title: 'Inline Edit', group: 'ui' },
    { id: 'input', title: 'Input', group: 'ui' },
    { id: 'loader', title: 'Loader', group: 'ui' },
    { id: 'dropdown-menu', title: 'Dropdown Menu', group: 'ui' },
    { id: 'date-picker-modal', title: 'Date picker modal', group: 'ui' },
    { id: 'drawer', title: 'Drawer', group: 'ui' },
    { id: 'ubits-data-table', title: 'Data Table', group: 'ui' },
    { id: 'modal', title: 'Modal', group: 'ui' },
    { id: 'number-stepper', title: 'Number stepper', group: 'ui' },
    { id: 'popover', title: 'Popover', group: 'ui' },
    { id: 'progress-bar', title: 'Progress bar', group: 'ui' },
    { id: 'segmented-progress', title: 'Segmented progress', group: 'ui' },
    { id: 'radio-button', title: 'Radio Button', group: 'ui' },
    { id: 'rich-text-editor', title: 'Rich text editor', group: 'ui' },
    { id: 'status-panel', title: 'Status panel', group: 'ui' },
    { id: 'status-tag', title: 'Status Tag', group: 'ui' },
    { id: 'switch', title: 'Switch', group: 'ui' },
    { id: 'table', title: 'Tabla', group: 'ui' },
    { id: 'toast', title: 'Toast', group: 'ui' },
    { id: 'toolbar-panel', title: 'Toolbar panel', group: 'ui' },
    { id: 'tooltip', title: 'Tooltip', group: 'ui' },
    { id: 'video-player', title: 'Video player', group: 'ui' },
    // IA (alfabético por title)
    { id: 'ia-panel', title: 'IA panel', group: 'ia' },
    { id: 'ia-button', title: 'IA-Button', group: 'ia' },
    { id: 'ia-input', title: 'IA Input', group: 'ia' },
    { id: 'ia-loader', title: 'IA Loader', group: 'ia' },
    // Operations (alfabético por title)
    { id: 'task-strip', title: 'Task strip', group: 'operations' }
];

/**
 * Generar HTML del sidebar a partir de DOCS_SIDEBAR_SECTIONS
 */
function buildDocsSidebarHTML() {
    const main = DOCS_SIDEBAR_SECTIONS.filter(s => s.group === 'main');
    const nav = DOCS_SIDEBAR_SECTIONS.filter(s => s.group === 'navegacion');
    const aprendizaje = DOCS_SIDEBAR_SECTIONS.filter(s => s.group === 'aprendizaje').sort((a, b) => a.title.localeCompare(b.title));
    const ui = DOCS_SIDEBAR_SECTIONS.filter(s => s.group === 'ui').sort((a, b) => a.title.localeCompare(b.title));
    const ia = DOCS_SIDEBAR_SECTIONS.filter(s => s.group === 'ia').sort((a, b) => a.title.localeCompare(b.title));
    const operations = DOCS_SIDEBAR_SECTIONS.filter(s => s.group === 'operations').sort((a, b) => a.title.localeCompare(b.title));

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
                    <div class="docs-sidebar-subtitle">UI GENERAL</div>
                    ${ui.map(s => `
                    <div class="docs-sidebar-item" data-section="${s.id}">
                        <span class="docs-sidebar-text">${s.title}</span>
                    </div>`).join('')}
                </div>
                <div class="docs-sidebar-subsection">
                    <div class="docs-sidebar-subtitle">APRENDIZAJE</div>
                    ${aprendizaje.map(s => `
                    <div class="docs-sidebar-item" data-section="${s.id}">
                        <span class="docs-sidebar-text">${s.title}</span>
                    </div>`).join('')}
                </div>
                <div class="docs-sidebar-subsection">
                    <div class="docs-sidebar-subtitle">IA</div>
                    ${ia.map(s => `
                    <div class="docs-sidebar-item" data-section="${s.id}">
                        <span class="docs-sidebar-text">${s.title}</span>
                    </div>`).join('')}
                </div>
                <div class="docs-sidebar-subsection">
                    <div class="docs-sidebar-subtitle">OPERATIONS</div>
                    ${operations.map(s => `
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
    const aprendizaje = DOCS_SIDEBAR_SECTIONS.filter(s => s.group === 'aprendizaje').sort((a, b) => a.title.localeCompare(b.title));
    const ui = DOCS_SIDEBAR_SECTIONS.filter(s => s.group === 'ui').sort((a, b) => a.title.localeCompare(b.title));
    const ia = DOCS_SIDEBAR_SECTIONS.filter(s => s.group === 'ia').sort((a, b) => a.title.localeCompare(b.title));
    const operations = DOCS_SIDEBAR_SECTIONS.filter(s => s.group === 'operations').sort((a, b) => a.title.localeCompare(b.title));

    const mainItems = main.map(s => `
            <div class="docs-dropdown-item" data-section="${s.id}">
                <span class="docs-dropdown-item-text ubits-body-md-regular">${s.title}</span>
            </div>`).join('');

    const navItems = nav.map(s => `
                    <div class="docs-dropdown-item" data-section="${s.id}">
                        <span class="docs-dropdown-item-text ubits-body-md-regular">${s.title}</span>
                    </div>`).join('');

    const aprendizajeItems = aprendizaje.map(s => `
                    <div class="docs-dropdown-item" data-section="${s.id}">
                        <span class="docs-dropdown-item-text ubits-body-md-regular">${s.title}</span>
                    </div>`).join('');

    const iaItems = ia.map(s => `
                    <div class="docs-dropdown-item" data-section="${s.id}">
                        <span class="docs-dropdown-item-text ubits-body-md-regular">${s.title}</span>
                    </div>`).join('');

    const operationsItems = operations.map(s => `
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
                    <div class="docs-dropdown-subgroup-title ubits-body-sm-regular">UI GENERAL</div>
                    ${uiItems}
                </div>
                <div class="docs-dropdown-subgroup">
                    <div class="docs-dropdown-subgroup-title ubits-body-sm-regular">APRENDIZAJE</div>
                    ${aprendizajeItems}
                </div>
                <div class="docs-dropdown-subgroup">
                    <div class="docs-dropdown-subgroup-title ubits-body-sm-regular">IA</div>
                    ${iaItems}
                </div>
                <div class="docs-dropdown-subgroup">
                    <div class="docs-dropdown-subgroup-title ubits-body-sm-regular">OPERATIONS</div>
                    ${operationsItems}
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
            'sidebar-contenidos-lms': 'sidebar-contenidos-lms.html',
            'sub-nav': 'subnav.html',
            'tab-bar': 'tab-bar.html',
            'accordion': 'accordion.html',
            'ia-panel': 'ia-panel.html',
            'button': 'button.html',
            'button-group': 'button-group.html',
            'ia-button': 'ia-button.html',
            'ia-input': 'ia-input.html',
            'ia-loader': 'ia-loader.html',
            'loader': 'loader.html',
            'alert': 'alert.html',
            'attention-badge': 'attention-badge.html',
            'save-indicator': 'save-indicator.html',
            'selection-card': 'selection-card.html',
            'skeleton': 'skeleton.html',
            'avatar': 'avatar.html',
            'badge-tag': 'badge-tag.html',
            'card-content': 'card-content.html',
            'card-content-compact': 'card-content-compact.html',
            'card-plan-formacion': 'card-plan-formacion.html',
            'learn-question': 'learn-question.html',
            'learn-content-img-trailer': 'learn-content-img-trailer.html',
            'indice-creator': 'indice-creator.html',
            'indice-exp-estudio': 'indice-exp-estudio.html',
            'paginas-creator': 'paginas-creator.html',
            'paginas-exp-estudio': 'paginas-exp-estudio.html',
            'progreso-exp-estudio': 'progreso-exp-estudio.html',
            'resources-card': 'resources-card.html',
            'complementary-resources': 'complementary-resources.html',
            'hero-search': 'hero-search.html',
            'resources-block': 'resources-block.html',
            'seccion-creator': 'seccion-creator.html',
            'seccion-exp-estudio': 'seccion-exp-estudio.html',
            'feedback-exp-estudio': 'feedback-exp-estudio.html',
            'cierre-exp-estudio': 'cierre-exp-estudio.html',
            'eval-sticky-bar-exp-estudio': 'eval-sticky-bar-exp-estudio.html',
            'titulo-specs-cta-exp-estudio': 'titulo-specs-cta-exp-estudio.html',
            'titulo-progreso-y-nav-exp-estudio': 'titulo-progreso-y-nav-exp-estudio.html',
            'checkbox': 'checkbox.html',
            'chip': 'chip.html',
            'coachmark': 'coachmark.html',
            'carousel-indicators': 'carousel-indicators.html',
            'color-picker': 'color-picker.html',
            'file-upload': 'file-upload.html',
            'file-upload-compact': 'file-upload-compact.html',
            'inline-edit': 'inline-edit.html',
            'input': 'input.html',
            'toast': 'toast.html',
            'toolbar-panel': 'toolbar-panel.html',
            'status-panel': 'status-panel.html',
            'status-tag': 'status-tag.html',
            'stepper': 'stepper.html',
            'switch': 'switch.html',
            'tab': 'tab.html',
            'paginator': 'paginator.html',
            'popover': 'popover.html',
            'progress-bar': 'progress-bar.html',
            'segmented-progress': 'segmented-progress.html',
            'radio-button': 'radio-button.html',
            'rich-text-editor': 'rich-text-editor.html',
            'empty-state': 'empty-state.html',
            'header-product': 'header-product.html',
            'dropdown-menu': 'dropdown-menu.html',
            'date-picker-modal': 'date-picker-modal.html',
            'drawer': 'drawer.html',
            'ubits-data-table': 'ubits-data-table.html',
            'modal': 'modal.html',
            'number-stepper': 'number-stepper.html',
            'table': 'table.html',
            'tooltip': 'tooltip.html',
            'video-player': 'video-player.html',
            'calendar': 'calendar.html',
            'submenu': 'submenu.html',
            'task-strip': 'task-strip.html'
        };
        
        let targetFile = sectionToFile[section];
        if (!targetFile) {
            return;
        }
        
        // Verificar si ya estamos en la página destino (nombre de archivo exacto: includes('loader.html') sería true en ia-loader.html)
        const pathNorm = currentPath.replace(/\\/g, '/');
        const currentFile = pathNorm.split('/').filter(Boolean).pop() || '';
        const isCurrentPage = currentFile === targetFile;

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
