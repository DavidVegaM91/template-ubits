/* ========================================
   PROFILE MENU
   Stub de compatibilidad: loadProfileMenu / hideProfileMenu.
   La cuenta en móvil vive en el AppHeader (avatar).
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
