/**
 * Menú «Crear contenido» / «Crear ruta» en contenidos.html (header-product).
 */
(function () {
    'use strict';

    var MENU_OVERLAY_ID = 'contenidos-crear-menu-overlay';

    function ensureMenuOverlay() {
        if (document.getElementById(MENU_OVERLAY_ID)) return;
        if (typeof window.getDropdownMenuHtml !== 'function') return;
        document.body.insertAdjacentHTML(
            'beforeend',
            window.getDropdownMenuHtml({
                overlayId: MENU_OVERLAY_ID,
                options: [
                    { text: 'Crear contenido', value: 'contenido', leftIcon: 'book' },
                    { text: 'Crear ruta de aprendizaje', value: 'ruta', leftIcon: 'route' }
                ]
            })
        );
        var overlay = document.getElementById(MENU_OVERLAY_ID);
        if (!overlay) return;
        var content = overlay.querySelector('.ubits-dropdown-menu__content');
        if (content) {
            content.addEventListener('click', function (e) {
                var opt = e.target.closest('.ubits-dropdown-menu__option');
                if (!opt) return;
                var val = opt.getAttribute('data-value');
                if (typeof window.closeDropdownMenu === 'function') {
                    window.closeDropdownMenu(MENU_OVERLAY_ID);
                }
                if (val === 'contenido') {
                    try {
                        sessionStorage.setItem('ubits-cc-promo-agentes-pending', '1');
                    } catch (err) {}
                    window.location.href = 'crear-contenido.html';
                } else if (val === 'ruta') {
                    window.location.href = 'crear-ruta.html';
                }
            });
        }
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay && typeof window.closeDropdownMenu === 'function') {
                window.closeDropdownMenu(MENU_OVERLAY_ID);
            }
        });
    }

    function openContenidosCrearMenu(anchorElement) {
        if (!anchorElement) return;
        if (typeof window.openDropdownMenu !== 'function' || typeof window.closeDropdownMenu !== 'function') return;
        var overlay = document.getElementById(MENU_OVERLAY_ID);
        if (overlay && overlay.style.display === 'block') {
            window.closeDropdownMenu(MENU_OVERLAY_ID);
            return;
        }
        ensureMenuOverlay();
        window.openDropdownMenu(MENU_OVERLAY_ID, anchorElement, { alignRight: true });
        if (window.matchMedia('(max-width: 767px)').matches) {
            var ov = document.getElementById(MENU_OVERLAY_ID);
            if (!ov) return;
            var ct = ov.querySelector('.ubits-dropdown-menu__content');
            if (!ct) return;
            var rect = anchorElement.getBoundingClientRect();
            ct.style.top = rect.top - ct.offsetHeight - 4 + 'px';
        }
    }

    window.openContenidosCrearMenu = openContenidosCrearMenu;
})();
