/**
 * Paginas Creator — helpers para filas de lista (Learn Creator).
 * Menú de opciones: dropdown UBITS (dropdown-menu.js + dropdown-menu.css).
 * @see documentacion/componentes/paginas-creator.html
 */
(function (global) {
    var MENU_OVERLAY_ID = 'ubits-paginas-creator-menu-overlay';
    var _menuOpenAnchor = null;

    var TIPO_ICONS = {
        'blank-page': 'fa-file',
        video: 'fa-video',
        texto: 'fa-align-left',
        pdf: 'fa-file-pdf',
        encuesta: 'fa-clipboard-list',
        embebido: 'fa-code',
        scorm: 'fa-cube',
        evaluacion: 'fa-clipboard-check',
        fin: 'fa-flag-checkered'
    };

    function normalizeTipo(tipo) {
        var t = (tipo || 'blank-page').toString().trim().toLowerCase();
        t = t.replace(/\s+/g, '-');
        return TIPO_ICONS[t] ? t : 'blank-page';
    }

    function paginasCreatorIconClass(tipo) {
        var key = normalizeTipo(tipo);
        return 'far ' + (TIPO_ICONS[key] || 'fa-file');
    }

    function escapeHtml(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    function escapeAttr(s) {
        return escapeHtml(s).replace(/"/g, '&quot;');
    }

    /** Opciones del menú contextual (leftIcon = sufijo tras `far fa-`, ver dropdown-menu.js). */
    function getPaginasCreatorMenuOptions() {
        return [
            { text: 'Mover arriba', value: 'mover-arriba', leftIcon: 'arrow-up' },
            { text: 'Mover abajo', value: 'mover-abajo', leftIcon: 'arrow-down' },
            { text: 'Eliminar', value: 'eliminar', leftIcon: 'trash' }
        ];
    }

    /**
     * Abre el menú de acciones junto al botón ellipsis. Requiere dropdown-menu.js cargado antes.
     * Tras elegir una opción se emite `ubits-paginas-creator-action` (bubbles) con detail:
     * { action, pageKey, label, anchor }.
     */
    function openPaginasCreatorMenu(anchorEl) {
        if (
            !anchorEl ||
            typeof global.getDropdownMenuHtml !== 'function' ||
            typeof global.openDropdownMenu !== 'function' ||
            typeof global.closeDropdownMenu !== 'function'
        ) {
            console.warn('UBITS: carga dropdown-menu.js para el menú de páginas creator.');
            return;
        }
        if (_menuOpenAnchor && _menuOpenAnchor !== anchorEl) {
            _menuOpenAnchor.setAttribute('aria-expanded', 'false');
        }
        _menuOpenAnchor = anchorEl;

        var prev = document.getElementById(MENU_OVERLAY_ID);
        if (prev) prev.remove();

        var doc = global.document || (typeof document !== 'undefined' ? document : null);
        if (!doc || !doc.body) return;

        doc.body.insertAdjacentHTML(
            'beforeend',
            global.getDropdownMenuHtml({
                overlayId: MENU_OVERLAY_ID,
                options: getPaginasCreatorMenuOptions()
            })
        );

        var overlay = doc.getElementById(MENU_OVERLAY_ID);
        if (!overlay) return;

        var item = anchorEl.closest('.ubits-paginas-creator__item');
        var pageKey = item && item.getAttribute('data-paginas-creator-key') ? item.getAttribute('data-paginas-creator-key') : '';
        var labelEl = item && item.querySelector('.ubits-paginas-creator__label');
        var labelText = labelEl ? labelEl.textContent.trim() : '';

        function tearDown() {
            global.closeDropdownMenu(MENU_OVERLAY_ID);
            if (_menuOpenAnchor) {
                _menuOpenAnchor.setAttribute('aria-expanded', 'false');
                _menuOpenAnchor = null;
            }
            overlay.removeEventListener('click', onOverlayClick);
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        }

        function onOverlayClick(ev) {
            if (ev.target === overlay) tearDown();
        }

        overlay.addEventListener('click', onOverlayClick);

        overlay.querySelectorAll('.ubits-dropdown-menu__option[data-value]').forEach(function (row) {
            row.addEventListener('click', function (ev) {
                ev.stopPropagation();
                var val = row.getAttribute('data-value');
                doc.dispatchEvent(
                    new CustomEvent('ubits-paginas-creator-action', {
                        bubbles: true,
                        detail: {
                            action: val,
                            pageKey: pageKey,
                            label: labelText,
                            anchor: anchorEl,
                            item: item
                        }
                    })
                );
                tearDown();
            });
        });

        anchorEl.setAttribute('aria-expanded', 'true');
        anchorEl.setAttribute('aria-haspopup', 'true');
        global.openDropdownMenu(MENU_OVERLAY_ID, anchorEl, { alignRight: true });
    }

    /**
     * Delegación de clic en botones `.ubits-paginas-creator__menu` dentro de root (estable; el HTML del listado puede sustituirse).
     * @param {HTMLElement|string} rootElOrSelector - Contenedor estable, p. ej. `#mi-sidebar-paginas`.
     */
    function initPaginasCreatorMenus(rootElOrSelector) {
        var root =
            typeof rootElOrSelector === 'string'
                ? document.querySelector(rootElOrSelector)
                : rootElOrSelector;
        if (!root || root._ubitsPaginasCreatorMenusBound) return;
        root._ubitsPaginasCreatorMenusBound = true;
        root.addEventListener('click', function (e) {
            var t = e.target;
            if (!t || !t.closest) return;
            var btn = t.closest('.ubits-paginas-creator__menu');
            if (!btn || !root.contains(btn)) return;
            e.preventDefault();
            e.stopPropagation();
            openPaginasCreatorMenu(btn);
        });
    }

    /**
     * HTML de un ítem (lista). opts: { label, tipo, active, menuAriaLabel, pageKey }
     */
    function paginasCreatorItemHtml(opts) {
        opts = opts || {};
        var label = opts.label != null ? String(opts.label) : 'Sin título';
        var tipo = normalizeTipo(opts.tipo);
        var active = !!opts.active;
        var menuLabel = opts.menuAriaLabel || ('Más acciones para ' + label);
        var pageKey = opts.pageKey != null ? String(opts.pageKey) : '';
        var dataKeyAttr = pageKey ? ' data-paginas-creator-key="' + escapeAttr(pageKey) + '"' : '';
        var itemClass = 'ubits-paginas-creator__item' + (active ? ' is-active' : '');
        var rowAttrs =
            ' type="button" class="ubits-paginas-creator__row"' +
            (active ? ' aria-current="true"' : '');
        return (
            '<div class="' +
            itemClass +
            '"' +
            dataKeyAttr +
            ' role="listitem">' +
            '<button' +
            rowAttrs +
            '>' +
            '<span class="ubits-paginas-creator__rail" aria-hidden="true"></span>' +
            '<span class="ubits-paginas-creator__icon"><i class="' +
            paginasCreatorIconClass(tipo) +
            '"></i></span>' +
            '<span class="ubits-paginas-creator__label ubits-body-sm-semibold">' +
            escapeHtml(label) +
            '</span>' +
            '</button>' +
            '<button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only ubits-paginas-creator__menu" aria-label="' +
            escapeAttr(menuLabel) +
            '">' +
            '<i class="far fa-ellipsis-vertical"></i>' +
            '</button>' +
            '</div>'
        );
    }

    global.paginasCreatorIconClass = paginasCreatorIconClass;
    global.paginasCreatorItemHtml = paginasCreatorItemHtml;
    global.getPaginasCreatorMenuOptions = getPaginasCreatorMenuOptions;
    global.openPaginasCreatorMenu = openPaginasCreatorMenu;
    global.initPaginasCreatorMenus = initPaginasCreatorMenus;
    global.PAGINAS_CREATOR_TIPO_ICONS = TIPO_ICONS;
})(typeof window !== 'undefined' ? window : this);
