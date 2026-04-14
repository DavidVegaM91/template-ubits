/* ========================================
   PROFILE MENU (tab-bar)
   En móvil el menú de cuenta va en el mismo panel flotante que Módulos (floating-menu.js → #floating-menu-profile).
   Este archivo solo mantiene compatibilidad con loadProfileMenu / hideProfileMenu en las páginas.
   ======================================== */

function loadProfileMenu(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Contenedor '${containerId}' no encontrado`);
        return;
    }
    container.innerHTML = '';
}

function hideProfileMenu() {
    if (typeof window.hideFloatingProfileMenu === 'function') {
        window.hideFloatingProfileMenu();
    }
}

window.loadProfileMenu = loadProfileMenu;
window.hideProfileMenu = hideProfileMenu;
