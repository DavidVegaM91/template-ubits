/**
 * Drawer lateral "Mis chats" en móvil (≤1023px) para chat-ia-grupos y modo-estudio-ia.
 * Requiere: backdrop #ia-chat-mobile-drawer-backdrop, body.ia-chat-mobile-drawer-open al abrir.
 */
(function () {
    'use strict';

    var MQ = '(max-width: 1023px)';

    function matchesMobile() {
        return typeof window.matchMedia === 'function' && window.matchMedia(MQ).matches;
    }

    function openDrawer() {
        if (!matchesMobile()) return;
        document.body.classList.add('ia-chat-mobile-drawer-open');
        var backdrop = document.getElementById('ia-chat-mobile-drawer-backdrop');
        if (backdrop) backdrop.setAttribute('aria-hidden', 'false');
        document.body.classList.add('ia-chat-mobile-drawer-scroll-lock');
    }

    function closeDrawer() {
        document.body.classList.remove('ia-chat-mobile-drawer-open');
        var backdrop = document.getElementById('ia-chat-mobile-drawer-backdrop');
        if (backdrop) backdrop.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('ia-chat-mobile-drawer-scroll-lock');
    }

    function onResize() {
        if (!matchesMobile()) closeDrawer();
    }

    function onEscape(e) {
        if (e.key !== 'Escape') return;
        if (!matchesMobile() || !document.body.classList.contains('ia-chat-mobile-drawer-open')) return;
        closeDrawer();
    }

    /**
     * @param {Object} options
     * @param {string} [options.backdropId='ia-chat-mobile-drawer-backdrop']
     * @param {string} options.closeButtonId - id botón X del panel historial
     * @param {string} [options.closeListSelector] - selector del contenedor lista; clic en ítem cierra
     * @param {string} [options.nuevoChatButtonId] - id botón nuevo chat en footer panel
     */
    window.initIaChatMobileDrawer = function (options) {
        options = options || {};
        var backdropId = options.backdropId || 'ia-chat-mobile-drawer-backdrop';
        var closeBtnId = options.closeButtonId;
        var closeListSelector = options.closeListSelector || '';
        var nuevoChatButtonId = options.nuevoChatButtonId || '';

        var backdrop = document.getElementById(backdropId);
        if (closeBtnId) {
            var closeBtn = document.getElementById(closeBtnId);
            if (closeBtn) {
                closeBtn.addEventListener('click', function () {
                    if (matchesMobile()) closeDrawer();
                });
            }
        }
        if (backdrop) {
            backdrop.addEventListener('click', function () {
                closeDrawer();
            });
        }

        if (closeListSelector) {
            document.addEventListener('click', function (ev) {
                if (!matchesMobile() || !document.body.classList.contains('ia-chat-mobile-drawer-open')) return;
                var item = ev.target.closest(closeListSelector + ' .ubits-ia-chat-historial-item');
                if (item && !ev.target.closest('.ubits-ia-chat-historial-item__delete')) {
                    closeDrawer();
                }
            }, true);
        }

        if (nuevoChatButtonId) {
            var nuevoBtn = document.getElementById(nuevoChatButtonId);
            if (nuevoBtn) {
                nuevoBtn.addEventListener('click', function () {
                    if (matchesMobile()) closeDrawer();
                });
            }
        }

        window.addEventListener('resize', onResize);
        document.addEventListener('keydown', onEscape);

        window.closeIaChatMobileDrawer = closeDrawer;
        window.openIaChatMobileDrawer = openDrawer;
    };
})();
