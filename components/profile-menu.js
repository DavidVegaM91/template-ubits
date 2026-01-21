/* ========================================
   PROFILE MENU COMPONENT (DROPDOWN)
   ======================================== */

function getProfileMenuHTML() {
    return `
        <div class="profile-menu" id="profile-menu">
            <a href="profile.html" class="profile-menu-item">
                <i class="far fa-user profile-menu-icon"></i>
                <span class="profile-menu-text ubits-body-sm-regular">Ver mi perfil</span>
            </a>
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
window.loadProfileMenu = loadProfileMenu;
window.showProfileMenu = showProfileMenu;
window.hideProfileMenu = hideProfileMenu;
window.handlePasswordChange = handlePasswordChange;
window.handleLogout = handleLogout;

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