// Función para calcular la ruta base según la profundidad de la página
function getBasePath() {
    const path = window.location.pathname;
    
    // Detectar la profundidad basándose en patrones de carpetas del proyecto
    // Páginas en subcarpetas de segundo nivel (ubits-colaborador/*, ubits-admin/*)
    if (path.includes('/ubits-colaborador/') || path.includes('/ubits-admin/')) {
        return '../../';
    }
    
    // Páginas en primer nivel de carpeta (documentacion/)
    if (path.includes('/documentacion/')) {
        return '../';
    }
    
    // Página en la raíz (index.html) o cualquier otra ubicación
    return '';
}

// Función para ajustar la altura del sidebar
function adjustSidebarHeight() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    
    const windowHeight = window.innerHeight;
    const topMargin = 16; // Margen superior
    const bottomMargin = 16; // Margen inferior
    const availableHeight = windowHeight - topMargin - bottomMargin;
    
    // El sidebar debe tener al menos 578px de alto
    const sidebarHeight = Math.max(578, availableHeight);
    
    sidebar.style.height = sidebarHeight + 'px';
    sidebar.style.top = topMargin + 'px';
}

// ========================================
//   SIDEBAR COMPONENT - DOCUMENTACIÓN
// ========================================
//
// FUNCIÓN: loadSidebar(variant, activeButton)
//
// PARÁMETROS:
//   - variant (string, opcional): 'default' o 'admin' - Variante del sidebar
//   - activeButton (string, opcional): Sección a activar según la variante
//
// VARIANTE DEFAULT:
//   - Opciones disponibles: 'admin', 'aprendizaje', 'diagnóstico', 'desempeño', 
//     'encuestas', 'reclutamiento', 'tareas', 'ubits-ai', 'ninguno'
//   - Uso: loadSidebar('default', 'aprendizaje')
//
// VARIANTE ADMIN:
//   - Opciones disponibles en body: 'inicio', 'empresa', 'aprendizaje', 'diagnóstico', 
//     'desempeño', 'encuestas'
//   - Footer incluye: modo-oscuro, perfil, api, centro-de-ayuda
//   - Uso: loadSidebar('admin', 'inicio')
//
// EJEMPLOS:
//   - Sidebar default con aprendizaje activo:
//     loadSidebar('default', 'aprendizaje')
//
//   - Sidebar admin con empresa activa:
//     loadSidebar('admin', 'empresa')
//
//   - Sidebar default sin sección activa:
//     loadSidebar()
//
//   - Compatibilidad hacia atrás (API antigua):
//     loadSidebar('aprendizaje')  // Igual a loadSidebar('default', 'aprendizaje')
//
// CONTENEDOR REQUERIDO:
//   <div id="sidebar-container"></div>
//
// FILES REQUIRED:
//   - components-sidebar.css
//   - components/sidebar.js
function loadSidebar(variantOrActiveButton = 'default', activeButton = null) {
    // Compatibilidad hacia atrás: si el primer parámetro es una opción de sección (no 'default' ni 'admin'), 
    // significa que se está usando la API antigua (sin variante)
    let variant = 'default';
    let actualActiveButton = activeButton;
    
    if (variantOrActiveButton !== 'default' && variantOrActiveButton !== 'admin') {
        // Es la API antigua: primer parámetro es activeButton
        variant = 'default';
        actualActiveButton = variantOrActiveButton;
    } else {
        variant = variantOrActiveButton;
        actualActiveButton = activeButton;
    }
    
    console.log('loadSidebar llamado con variant:', variant, 'activeButton:', actualActiveButton);
    
    // Buscar el contenedor del sidebar
    const sidebarContainer = document.getElementById('sidebar-container');
    console.log('Sidebar container encontrado:', sidebarContainer);
    
    if (!sidebarContainer) {
        console.error('No se encontró el contenedor sidebar-container');
        return;
    }
    
    // Obtener la ruta base dinámica
    const basePath = getBasePath();
    console.log('Base path calculado:', basePath);
    
    // Determinar qué HTML usar según la variante
    let sidebarHTML = '';
    
    if (variant === 'admin') {
        // Variante Admin
        sidebarHTML = `
        <aside class="sidebar" id="sidebar">
            <!-- Contenedor principal para header y body -->
            <div class="sidebar-main">
                <!-- Header -->
                <div class="sidebar-header">
                    <div class="logo" onclick="window.location.href='${basePath}ubits-admin/inicio/admin.html'" style="cursor: pointer;">
                        <img src="${basePath}images/Ubits-logo.svg" alt="UBITS Logo" />
                    </div>
                </div>
                
                <!-- Body -->
                <div class="sidebar-body">
                    <button class="nav-button" data-section="inicio" data-tooltip="Inicio" onclick="window.location.href='${basePath}ubits-admin/inicio/admin.html'" style="cursor: pointer;">
                        <i class="far fa-house"></i>
                    </button>
                    <button class="nav-button" data-section="empresa" data-tooltip="Empresa" onclick="window.location.href='${basePath}ubits-admin/empresa/gestion-de-usuarios.html'" style="cursor: pointer;">
                        <i class="far fa-building"></i>
                    </button>
                    <button class="nav-button" data-section="aprendizaje" data-tooltip="Aprendizaje" onclick="window.location.href='${basePath}ubits-admin/aprendizaje/planes-formacion.html'" style="cursor: pointer;">
                        <i class="far fa-graduation-cap"></i>
                    </button>
                    <button class="nav-button" data-section="diagnóstico" data-tooltip="Diagnóstico" onclick="window.location.href='${basePath}ubits-admin/diagnostico/admin-diagnostico.html'" style="cursor: pointer;">
                        <i class="far fa-chart-mixed"></i>
                    </button>
                    <button class="nav-button" data-section="desempeño" data-tooltip="Desempeño" onclick="window.location.href='${basePath}ubits-admin/desempeno/admin-360.html'" style="cursor: pointer;">
                        <i class="far fa-bars-progress"></i>
                    </button>
                    <button class="nav-button" data-section="encuestas" data-tooltip="Encuestas" onclick="window.location.href='${basePath}ubits-admin/encuestas/admin-encuestas.html'" style="cursor: pointer;">
                        <i class="far fa-clipboard"></i>
                    </button>
                </div>
            </div>
            
            <!-- Footer -->
            <div class="sidebar-footer">
                <button class="nav-button" data-tooltip="API" onclick="window.location.href='${basePath}ubits-admin/otros/admin-api.html'" style="cursor: pointer;">
                    <i class="far fa-code"></i>
                </button>
                <button class="nav-button" data-tooltip="Centro de ayuda" onclick="window.location.href='${basePath}ubits-admin/otros/admin-help-center.html'" style="cursor: pointer;">
                    <i class="far fa-circle-question"></i>
                </button>
                <button class="nav-button" id="darkmode-toggle" data-tooltip="Modo oscuro" data-theme="light">
                    <i class="far fa-moon"></i>
                </button>
                <div class="user-avatar-container">
                    <div class="user-avatar" onmouseenter="showSidebarProfileMenu(this)" onmouseleave="hideSidebarProfileMenu()" onclick="window.location.href='${basePath}ubits-colaborador/perfil/profile.html'">
                        <img src="${basePath}images/Profile-image.jpg" alt="Usuario" class="avatar-image">
                    </div>
                </div>
            </div>
        </aside>
        
        <!-- Profile menu para sidebar admin -->
        <div class="sidebar-profile-menu" id="sidebar-profile-menu" onmouseenter="showSidebarProfileMenu(this)" onmouseleave="hideSidebarProfileMenu()">
            <div class="profile-menu-item" onclick="window.location.href='${basePath}ubits-colaborador/perfil/profile.html'">
                <i class="far fa-user"></i>
                <span>Ver mi perfil</span>
            </div>
            <div class="profile-menu-divider"></div>
            <div class="profile-menu-item" onclick="window.location.href='${basePath}index.html'">
                <i class="far fa-user-gear"></i>
                <span>Modo colaborador</span>
            </div>
            <div class="profile-menu-divider"></div>
            <div class="profile-menu-item" onclick="handlePasswordChange()">
                <i class="far fa-key"></i>
                <span>Cambio de contraseña</span>
            </div>
            <div class="profile-menu-item" onclick="handleLogout()">
                <i class="far fa-sign-out"></i>
                <span>Cerrar sesión</span>
            </div>
        </div>
    `;
    } else {
        // Variante Default
        sidebarHTML = `
        <aside class="sidebar" id="sidebar">
            <!-- Contenedor principal para header y body -->
            <div class="sidebar-main">
                <!-- Header -->
                <div class="sidebar-header">
                    <div class="logo" onclick="window.location.href='${basePath}index.html'" style="cursor: pointer;">
                        <img src="${basePath}images/Ubits-logo.svg" alt="UBITS Logo" />
                    </div>
                </div>
                
                <!-- Body -->
                <div class="sidebar-body">
                    <button class="nav-button" data-section="admin" data-tooltip="Administrador" onclick="window.location.href='${basePath}ubits-admin/inicio/admin.html'" style="cursor: pointer;">
                        <i class="far fa-laptop"></i>
                    </button>
                    <button class="nav-button" data-section="aprendizaje" data-tooltip="Aprendizaje" onclick="window.location.href='${basePath}ubits-colaborador/aprendizaje/home-learn.html'" style="cursor: pointer;">
                        <i class="far fa-graduation-cap"></i>
                    </button>
                    <button class="nav-button" data-section="diagnóstico" data-tooltip="Diagnóstico" onclick="window.location.href='${basePath}ubits-colaborador/diagnostico/diagnostico.html'" style="cursor: pointer;">
                        <i class="far fa-chart-mixed"></i>
                    </button>
                    <button class="nav-button" data-section="desempeño" data-tooltip="Desempeño" onclick="window.location.href='${basePath}ubits-colaborador/desempeno/evaluaciones-360.html'" style="cursor: pointer;">
                        <i class="far fa-bars-progress"></i>
                    </button>
                    <button class="nav-button" data-section="encuestas" data-tooltip="Encuestas" onclick="window.location.href='${basePath}ubits-colaborador/encuestas/encuestas.html'" style="cursor: pointer;">
                        <i class="far fa-clipboard"></i>
                    </button>
                    <button class="nav-button" data-section="reclutamiento" data-tooltip="Reclutamiento" onclick="window.location.href='${basePath}ubits-colaborador/reclutamiento/reclutamiento.html'" style="cursor: pointer;">
                        <i class="far fa-users"></i>
                    </button>
                    <button class="nav-button" data-section="tareas" data-tooltip="Tareas" onclick="window.location.href='${basePath}ubits-colaborador/tareas/planes.html'" style="cursor: pointer;">
                        <i class="far fa-layer-group"></i>
                    </button>
                    <button class="nav-button" data-section="ubits-ai" data-tooltip="UBITS AI" onclick="window.location.href='${basePath}ubits-colaborador/ubits-ai/ubits-ai.html'" style="cursor: pointer;">
                        <i class="far fa-sparkles"></i>
                    </button>
                </div>
            </div>
            
            <!-- Footer -->
            <div class="sidebar-footer">
                <button class="nav-button" id="darkmode-toggle" data-tooltip="Modo oscuro" data-theme="light">
                    <i class="far fa-moon"></i>
                </button>
                <div class="user-avatar-container">
                    <div class="user-avatar" onmouseenter="showSidebarProfileMenu(this)" onmouseleave="hideSidebarProfileMenu()" onclick="window.location.href='${basePath}ubits-colaborador/perfil/profile.html'">
                        <img src="${basePath}images/Profile-image.jpg" alt="Usuario" class="avatar-image">
                    </div>
                </div>
            </div>
        </aside>
        
        <!-- Profile menu para sidebar default -->
        <div class="sidebar-profile-menu" id="sidebar-profile-menu" onmouseenter="showSidebarProfileMenu(this)" onmouseleave="hideSidebarProfileMenu()">
            <div class="profile-menu-item" onclick="window.location.href='${basePath}ubits-colaborador/perfil/profile.html'">
                <i class="far fa-user"></i>
                <span>Ver mi perfil</span>
            </div>
            <div class="profile-menu-divider"></div>
            <div class="profile-menu-item" onclick="window.location.href='${basePath}ubits-admin/inicio/admin.html'">
                <i class="far fa-laptop"></i>
                <span>Modo Administrador</span>
            </div>
            <div class="profile-menu-divider"></div>
            <div class="profile-menu-item" onclick="handlePasswordChange()">
                <i class="far fa-key"></i>
                <span>Cambio de contraseña</span>
            </div>
            <div class="profile-menu-item" onclick="handleLogout()">
                <i class="far fa-sign-out"></i>
                <span>Cerrar sesión</span>
            </div>
        </div>
    `;
    }
    
    // Insertar el HTML
    sidebarContainer.innerHTML = sidebarHTML;
    console.log('HTML insertado en sidebar container');
    
    
    // Ajustar altura del sidebar dinámicamente
    adjustSidebarHeight();
    
    // Activar el botón especificado
    if (actualActiveButton) {
        const button = document.querySelector(`[data-section="${actualActiveButton}"]`);
        if (button) {
            button.classList.add('active');
            console.log('Botón activado:', actualActiveButton);
        }
    }
    
    // Función para actualizar el tooltip del botón de modo oscuro/claro
    function updateDarkModeTooltip() {
        const darkModeButton = document.getElementById('darkmode-toggle');
        if (!darkModeButton) return;
        
        const currentTheme = document.body.getAttribute('data-theme') || 'light';
        const tooltipText = currentTheme === 'dark' ? 'Modo claro' : 'Modo oscuro';
        
        // Ocultar tooltip actual si está visible
        if (typeof hideTooltip === 'function') {
            hideTooltip();
        }
        
        // Actualizar el atributo data-tooltip
        darkModeButton.setAttribute('data-tooltip', tooltipText);
        
        // Reinicializar tooltip para este botón (initTooltip ahora maneja la limpieza de listeners)
        if (typeof initTooltip === 'function') {
            setTimeout(() => {
                initTooltip('#darkmode-toggle');
            }, 50);
        }
    }
    
    // Exportar función globalmente para que pueda ser llamada desde script.js
    window.updateDarkModeTooltip = updateDarkModeTooltip;
    
    // Inicializar tooltips DESPUÉS de que el HTML esté insertado
    // Usar setTimeout para asegurar que el DOM esté completamente renderizado
    setTimeout(() => {
        initSidebarTooltips();
        updateDarkModeTooltip(); // Actualizar tooltip del botón de modo oscuro
    }, 50);
    
    // Inicializar tooltips oficiales UBITS para los botones del sidebar
    // Solo en desktop (pantallas >= 1024px) y excluyendo logo y avatar
    function initSidebarTooltips() {
        // Verificar si estamos en desktop
        if (window.innerWidth < 1024) {
            return; // No mostrar tooltips en móvil
        }
        
        // Seleccionar todos los botones con data-tooltip (excluyendo logo y avatar)
        // El logo no tiene data-tooltip y el avatar tampoco, así que están excluidos automáticamente
        const tooltipButtons = document.querySelectorAll('.sidebar .nav-button[data-tooltip]');
        
        if (tooltipButtons.length === 0) {
            console.log('No se encontraron botones con data-tooltip en el sidebar');
            return;
        }
        
        console.log('Inicializando tooltips para', tooltipButtons.length, 'botones del sidebar');
        
        tooltipButtons.forEach(button => {
            // Remover listeners anteriores si existen (para evitar duplicados)
            if (button._tooltipShowHandler) {
                button.removeEventListener('mouseenter', button._tooltipShowHandler);
                button.removeEventListener('mouseleave', button._tooltipHideHandler);
            }
            
            // Configurar atributos para tooltips sin cola, posición derecha
            button.setAttribute('data-tooltip-no-arrow', '');
            button.setAttribute('data-tooltip-position', 'right');
            button.setAttribute('data-tooltip-align', 'center');
            button.setAttribute('data-tooltip-delay', '200');
        });
        
        // Inicializar tooltips si la función está disponible
        if (typeof initTooltip === 'function') {
            console.log('Usando initTooltip() para inicializar tooltips');
            initTooltip('.sidebar .nav-button[data-tooltip]');
        } else if (typeof showTooltip === 'function') {
            // Fallback: inicializar manualmente con showTooltip
            console.log('Usando showTooltip() manualmente para inicializar tooltips');
            tooltipButtons.forEach(button => {
                const tooltipText = button.getAttribute('data-tooltip');
                
                let tooltipTimeout;
                let currentTooltip = null;
                
                const showTooltipHandler = function() {
                    // Verificar que sigamos en desktop antes de mostrar
                    if (window.innerWidth < 1024) {
                        return;
                    }
                    tooltipTimeout = setTimeout(() => {
                        if (typeof showTooltip === 'function') {
                            currentTooltip = showTooltip(button, tooltipText, {
                                position: 'right',
                                align: 'center',
                                delay: 0,
                                duration: 0,
                                noArrow: true
                            });
                        }
                    }, 200);
                };
                
                const hideTooltipHandler = function() {
                    if (tooltipTimeout) clearTimeout(tooltipTimeout);
                    if (typeof hideTooltip === 'function') {
                        hideTooltip();
                    }
                    currentTooltip = null;
                };
                
                button.addEventListener('mouseenter', showTooltipHandler);
                button.addEventListener('mouseleave', hideTooltipHandler);
                
                // Guardar handlers para poder limpiarlos si es necesario
                button._tooltipShowHandler = showTooltipHandler;
                button._tooltipHideHandler = hideTooltipHandler;
            });
        } else {
            console.warn('Tooltip component no está disponible. Asegúrate de importar tooltip.js');
            // Intentar de nuevo después de un breve delay
            setTimeout(() => {
                if (typeof initTooltip === 'function' || typeof showTooltip === 'function') {
                    initSidebarTooltips();
                }
            }, 500);
        }
    }
    
    // Re-inicializar tooltips en resize (por si cambia de móvil a desktop)
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            // Si cambiamos de móvil a desktop, inicializar tooltips
            if (window.innerWidth >= 1024) {
                initSidebarTooltips();
            } else {
                // Si cambiamos a móvil, ocultar tooltips activos
                if (typeof hideTooltip === 'function') {
                    hideTooltip();
                }
            }
        }, 250);
    });
    
    // Re-inicializar dark mode toggle
    if (typeof initDarkModeToggle === 'function') {
        console.log('Inicializando dark mode...');
        initDarkModeToggle();
    } else {
        console.log('initDarkModeToggle no está disponible, intentando inicializar directamente...');
        // Fallback: inicializar directamente si la función no está disponible
        const darkModeButton = document.querySelector('#darkmode-toggle');
        if (darkModeButton) {
            darkModeButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                if (typeof toggleDarkMode === 'function') {
                    toggleDarkMode();
                }
            });
        }
    }
    
    console.log('Sidebar cargado completamente');
    
    // Ajustar cuando cambie el tamaño de la ventana
    window.addEventListener('resize', adjustSidebarHeight);
}

// Función para actualizar el botón activo
function updateActiveSidebarButton(activeButton) {
    // Remover active de todos los botones
    document.querySelectorAll('.nav-button').forEach(button => {
        button.classList.remove('active');
    });
    
    // Activar el botón especificado
    if (activeButton) {
        const button = document.querySelector(`[data-section="${activeButton}"]`);
        if (button) {
            button.classList.add('active');
        }
    }
}

// Funciones para el profile menu del sidebar
function showSidebarProfileMenu(avatarElement) {
    const menu = document.getElementById('sidebar-profile-menu');
    if (menu) {
        menu.classList.add('show');
    }
}

function hideSidebarProfileMenu() {
    const menu = document.getElementById('sidebar-profile-menu');
    if (menu) {
        menu.classList.remove('show');
    }
}

// Exportar funciones globalmente
window.showSidebarProfileMenu = showSidebarProfileMenu;
window.hideSidebarProfileMenu = hideSidebarProfileMenu;
