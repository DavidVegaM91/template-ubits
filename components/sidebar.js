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

// Sidebar Component Loader
// Función para cargar el sidebar UBITS
// Parámetros: activeButton (string, opcional) - Sección a activar ('aprendizaje', 'diagnóstico', 'desempeño', 'encuestas', 'reclutamiento', 'tareas', 'ubits-ai')
// La función busca automáticamente el contenedor 'sidebar-container'
// Ejemplo: loadSidebar('aprendizaje') - Activa la sección aprendizaje
// Ejemplo: loadSidebar() - Carga sidebar sin sección activa
function loadSidebar(activeButton = null) {
    console.log('loadSidebar llamado con activeButton:', activeButton);
    
    // Buscar el contenedor del sidebar
    const sidebarContainer = document.getElementById('sidebar-container');
    console.log('Sidebar container encontrado:', sidebarContainer);
    
    if (!sidebarContainer) {
        console.error('No se encontró el contenedor sidebar-container');
        return;
    }
    
    // HTML del sidebar embebido para evitar problemas de CORS
    const sidebarHTML = `
        <aside class="sidebar" id="sidebar">
            <!-- Contenedor principal para header y body -->
            <div class="sidebar-main">
                <!-- Header -->
                <div class="sidebar-header">
                    <div class="logo" onclick="window.location.href='index.html'" style="cursor: pointer;">
                        <img src="images/Ubits-logo.svg" alt="UBITS Logo" />
                    </div>
                </div>
                
                <!-- Body -->
                <div class="sidebar-body">
                    <button class="nav-button" data-section="aprendizaje" data-tooltip="Aprendizaje" onclick="window.location.href='home-learn.html'" style="cursor: pointer;">
                        <i class="far fa-graduation-cap"></i>
                    </button>
                    <button class="nav-button" data-section="diagnóstico" data-tooltip="Diagnóstico" onclick="window.location.href='diagnostico.html'" style="cursor: pointer;">
                        <i class="far fa-chart-mixed"></i>
                    </button>
                    <button class="nav-button" data-section="desempeño" data-tooltip="Desempeño" onclick="window.location.href='evaluaciones-360.html'" style="cursor: pointer;">
                        <i class="far fa-bars-progress"></i>
                    </button>
                    <button class="nav-button" data-section="encuestas" data-tooltip="Encuestas" onclick="window.location.href='encuestas.html'" style="cursor: pointer;">
                        <i class="far fa-clipboard"></i>
                    </button>
                    <button class="nav-button" data-section="reclutamiento" data-tooltip="Reclutamiento" onclick="window.location.href='reclutamiento.html'" style="cursor: pointer;">
                        <i class="far fa-users"></i>
                    </button>
                    <button class="nav-button" data-section="tareas" data-tooltip="Tareas" onclick="window.location.href='planes.html'" style="cursor: pointer;">
                        <i class="far fa-layer-group"></i>
                    </button>
                    <button class="nav-button" data-section="ubits-ai" data-tooltip="UBITS AI" onclick="window.location.href='ubits-ai.html'" style="cursor: pointer;">
                        <i class="far fa-sparkles"></i>
                    </button>
                </div>
            </div>
            
            <!-- Footer -->
            <div class="sidebar-footer">
                <div class="user-avatar-container">
                    <div class="user-avatar" onmouseenter="showSidebarProfileMenu(this)" onmouseleave="hideSidebarProfileMenu()" onclick="window.location.href='profile.html'">
                        <img src="images/Profile-image.jpg" alt="Usuario" class="avatar-image">
                    </div>
                </div>
                <button class="nav-button" id="darkmode-toggle" data-tooltip="Modo oscuro" data-theme="light">
                    <i class="far fa-moon"></i>
                </button>
            </div>
        </aside>
        
        <!-- Profile menu para sidebar -->
        <div class="sidebar-profile-menu" id="sidebar-profile-menu" onmouseenter="showSidebarProfileMenu(this)" onmouseleave="hideSidebarProfileMenu()">
            <div class="profile-menu-item" onclick="window.location.href='profile.html'">
                <i class="far fa-user"></i>
                <span>Ver mi perfil</span>
            </div>
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
    
    // Insertar el HTML
    sidebarContainer.innerHTML = sidebarHTML;
    console.log('HTML insertado en sidebar container');
    
    
    // Ajustar altura del sidebar dinámicamente
    adjustSidebarHeight();
    
    // Activar el botón especificado
    if (activeButton) {
        const button = document.querySelector(`[data-section="${activeButton}"]`);
        if (button) {
            button.classList.add('active');
            console.log('Botón activado:', activeButton);
        }
    }
    
    // Re-inicializar tooltips y funcionalidad
    if (typeof initProfileTooltips === 'function') {
        console.log('Inicializando tooltips...');
        initProfileTooltips();
    }
    
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
