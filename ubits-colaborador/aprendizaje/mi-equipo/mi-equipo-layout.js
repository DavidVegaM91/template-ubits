/**
 * Mi equipo — layout colaborador Workspace (sidebar aprendizaje + tab mi-equipo activo).
 */
(function () {
    window.initMiEquipoLayout = function initMiEquipoLayout() {
        if (typeof loadSidebar === 'function') loadSidebar('default', 'aprendizaje');
if (typeof loadProfileMenu === 'function') loadProfileMenu('profile-menu-container');

        setTimeout(function () {
            if (typeof setActiveAccordionLink === 'function') setActiveAccordionLink('mi-equipo');
        }, 200);
    };
})();
