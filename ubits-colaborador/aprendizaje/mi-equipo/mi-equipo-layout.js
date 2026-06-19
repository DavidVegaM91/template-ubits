/**
 * Mi equipo — layout colaborador estándar (sidebar + SubNav aprendizaje + tab mi-equipo activo).
 */
(function () {
    window.initMiEquipoLayout = function initMiEquipoLayout() {
        if (typeof loadSidebar === 'function') loadSidebar('default', 'aprendizaje');
        if (typeof loadSubNav === 'function') loadSubNav('top-nav-container', 'aprendizaje');
        if (typeof loadTabBar === 'function') loadTabBar('tab-bar-container');
        if (typeof loadFloatingMenu === 'function') loadFloatingMenu('floating-menu-container');
        if (typeof loadProfileMenu === 'function') loadProfileMenu('profile-menu-container');

        setTimeout(function () {
            var tab = document.querySelector('.nav-tab[data-tab="mi-equipo"]');
            if (tab) {
                document.querySelectorAll('.nav-tab, .hamburger-item').forEach(function (item) {
                    item.classList.remove('active');
                });
                tab.classList.add('active');
            }
            if (typeof setActiveAccordionLink === 'function') setActiveAccordionLink('mi-equipo');
        }, 200);
    };
})();
