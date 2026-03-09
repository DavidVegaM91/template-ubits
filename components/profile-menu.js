/* ========================================
   PROFILE MENU COMPONENT (DROPDOWN)
   Misma estructura que sidebar-profile-menu: perfil, modo admin/colaborador, documentación, contraseña, cerrar sesión.
   ======================================== */

function getProfileMenuBasePath() {
    const pathname = window.location.pathname || '';
    const segments = pathname.split('/').filter(Boolean);
    const depth = segments.length - (segments[segments.length - 1] && segments[segments.length - 1].indexOf('.') !== -1 ? 1 : 0);
    return depth > 0 ? '../'.repeat(depth) + '/' : './';
}

function getProfileMenuHTML() {
    const basePath = getProfileMenuBasePath();
    const isAdminContext = (window.location.pathname || '').indexOf('ubits-admin') !== -1;
    const modoItem = isAdminContext
        ? { href: basePath + 'index.html', icon: 'fa-user-gear', text: 'Modo colaborador' }
        : { href: basePath + 'ubits-admin/inicio/admin.html', icon: 'fa-laptop', text: 'Modo Administrador' };

    return `
        <div class="profile-menu" id="profile-menu">
            <a href="${basePath}ubits-colaborador/perfil/profile.html" class="profile-menu-item">
                <i class="far fa-user profile-menu-icon"></i>
                <span class="profile-menu-text ubits-body-sm-regular">Ver mi perfil</span>
            </a>
            <div class="profile-menu-divider"></div>
            <a href="${modoItem.href}" class="profile-menu-item">
                <i class="far ${modoItem.icon} profile-menu-icon"></i>
                <span class="profile-menu-text ubits-body-sm-regular">${modoItem.text}</span>
            </a>
            <div class="profile-menu-divider"></div>
            <a href="#" class="profile-menu-item" onclick="handleDocumentacion(event)">
                <i class="far fa-book profile-menu-icon"></i>
                <span class="profile-menu-text ubits-body-sm-regular">Documentación</span>
            </a>
            <div class="profile-menu-divider"></div>
            <a href="#" class="profile-menu-item" onclick="handlePasswordChange(event)">
                <i class="far fa-key profile-menu-icon"></i>
                <span class="profile-menu-text ubits-body-sm-regular">Cambio de contraseña</span>
            </a>
            <a href="#" class="profile-menu-item" onclick="handleLogout(event)">
                <i class="far fa-sign-out-alt profile-menu-icon"></i>
                <span class="profile-menu-text ubits-body-sm-regular">Cerrar sesión</span>
            </a>
        </div>
    `;
}

function handleDocumentacion(event) {
    event.preventDefault();
    hideProfileMenu();
    const basePath = getProfileMenuBasePath();
    window.open(basePath + 'documentacion/documentacion.html', '_blank');
}

function loadProfileMenu(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Contenedor '${containerId}' no encontrado`);
        return;
    }

    container.innerHTML = getProfileMenuHTML();
    addProfileMenuEventListeners();
}

function addProfileMenuEventListeners() {
    // Cerrar con ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            hideProfileMenu();
        }
    });

    // Cerrar al hacer click fuera del dropdown
    document.addEventListener('click', function(e) {
        const profileMenu = document.getElementById('profile-menu');
        const perfilTab = document.querySelector('[data-tab="perfil"]');
        
        if (profileMenu && profileMenu.classList.contains('show')) {
            if (!profileMenu.contains(e.target) && !perfilTab.contains(e.target)) {
                hideProfileMenu();
            }
        }
    });
}

function showProfileMenu() {
    const profileMenu = document.getElementById('profile-menu');
    if (profileMenu) {
        profileMenu.classList.add('show');
    }
}

function hideProfileMenu() {
    const profileMenu = document.getElementById('profile-menu');
    if (profileMenu) {
        profileMenu.classList.remove('show');
    }
}

function handlePasswordChange(event) {
    event.preventDefault();
    hideProfileMenu();
    alert('Próximamente: Cambio de contraseña');
}

function handleLogout(event) {
    event.preventDefault();
    hideProfileMenu();
    
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        alert('Sesión cerrada');
    }
}

// Exportar funciones al window global
window.getProfileMenuHTML = getProfileMenuHTML;
window.getProfileMenuBasePath = getProfileMenuBasePath;
window.loadProfileMenu = loadProfileMenu;
window.showProfileMenu = showProfileMenu;
window.hideProfileMenu = hideProfileMenu;
window.handlePasswordChange = handlePasswordChange;
window.handleLogout = handleLogout;
window.handleDocumentacion = handleDocumentacion;

// También exportar como funciones globales
function showProfileMenu() {
    const profileMenu = document.getElementById('profile-menu');
    if (profileMenu) {
        profileMenu.classList.add('show');
    }
}

function hideProfileMenu() {
    const profileMenu = document.getElementById('profile-menu');
    if (profileMenu) {
        profileMenu.classList.remove('show');
    }
}