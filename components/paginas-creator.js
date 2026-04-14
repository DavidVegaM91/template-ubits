/**
 * Paginas Creator — filas de lista (Learn Creator).
 * Comportamiento tipo task-strip: 1 clic = activar fila; 2 clics en el título = edición inline;
 * botón lápiz al hover; menú ⋮ si activa (dropdown-menu.js).
 *
 * En índice con varias secciones (Sección creator / Índice creator): al activar una página se desactivan
 * el resto de páginas del ámbito y la sección padre pasa a ser la única activa (borde de marca) vía
 * setSeccionCreatorActiveSection (seccion-creator.js).
 *
 * Eventos: ubits-paginas-creator-action, ubits-paginas-creator-activate, ubits-paginas-creator-label-save,
 * ubits-paginas-creator-label-input (solo durante edición inline: valor provisional para sincronizar panel derecho).
 * Menú ⋮: primera opción «Cambiar nombre» → edición inline (no emite action).
 * Estado validación: clase `ubits-paginas-creator__item--error` en la fila (p. ej. página sin recursos al ir a paso 3).
 * @see documentacion/componentes/paginas-creator.html
 */
(function (global) {
    /** Placeholder por defecto para título de página (lista + input inline). */
    var PAGINAS_CREATOR_PAGE_TITLE_PLACEHOLDER = 'Escribe el título de la página';

    var MENU_OVERLAY_ID = 'ubits-paginas-creator-menu-overlay';
    var _menuOpenAnchor = null;
    var ACTIVATE_DELAY_MS = 300;
    var DOUBLE_TAP_MS = 400;

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

    function getPaginasCreatorMenuOptions() {
        return [
            { text: 'Cambiar nombre', value: 'cambiar-nombre', leftIcon: 'pen-to-square' },
            { text: 'Mover arriba', value: 'mover-arriba', leftIcon: 'arrow-up' },
            { text: 'Mover abajo', value: 'mover-abajo', leftIcon: 'arrow-down' },
            { text: 'Eliminar', value: 'eliminar', leftIcon: 'trash' }
        ];
    }

    /** Ámbito de orden global: índice creator, índice de secciones, bloque sección o la lista sola. */
    function findPaginasNavigationScope(item) {
        if (!item) return null;
        return (
            item.closest('.ubits-indice-creator') ||
            item.closest('.ubits-seccion-creator-index') ||
            item.closest('.ubits-seccion-creator') ||
            item.closest('.ubits-paginas-creator')
        );
    }

    function getOrderedPaginasItemsInScope(scope) {
        if (!scope || !scope.querySelectorAll) return [];
        return Array.prototype.slice.call(scope.querySelectorAll('.ubits-paginas-creator__item'));
    }

    /**
     * Reordena la fila en el orden global del ámbito (incluye saltar entre secciones en índice con varias listas).
     * @param {HTMLElement} item
     * @param {number} delta -1 = arriba, +1 = abajo
     * @returns {boolean}
     */
    function movePaginasCreatorItem(item, delta) {
        var scope = findPaginasNavigationScope(item);
        if (!scope) return false;
        var items = getOrderedPaginasItemsInScope(scope);
        var i = items.indexOf(item);
        if (i < 0) return false;
        if (delta === -1 && i > 0) {
            var prev = items[i - 1];
            prev.parentNode.insertBefore(item, prev);
            return true;
        }
        if (delta === 1 && i < items.length - 1) {
            var next = items[i + 1];
            next.parentNode.insertBefore(item, next.nextSibling);
            return true;
        }
        return false;
    }

    function getPaginasCreatorMenuOptionsForItem(item) {
        var base = getPaginasCreatorMenuOptions();
        var scope = findPaginasNavigationScope(item);
        var ordered = scope ? getOrderedPaginasItemsInScope(scope) : [];
        var idx = ordered.indexOf(item);
        return base.filter(function (opt) {
            var v = opt.value;
            if (v === 'mover-arriba') return idx > 0;
            if (v === 'mover-abajo') return idx >= 0 && idx < ordered.length - 1;
            return true;
        });
    }

    function ensureRootId(root) {
        if (!root || root.id) return root;
        root.id = 'ubits-pc-root-' + String(Date.now()) + '-' + Math.floor(Math.random() * 1e6);
        return root;
    }

    function refreshTooltipsInRoot(root) {
        if (!root || typeof global.initTooltip !== 'function') return;
        ensureRootId(root);
        global.initTooltip('#' + root.id + ' [data-tooltip]');
    }

    function clearPaginasCreatorActiveInScope(scopeEl) {
        if (!scopeEl) return;
        scopeEl.querySelectorAll('.ubits-paginas-creator__item.is-active').forEach(function (el) {
            el.classList.remove('is-active');
            var r = el.querySelector('.ubits-paginas-creator__row');
            if (r) r.removeAttribute('aria-current');
        });
    }

    /**
     * Activa una fila y emite ubits-paginas-creator-activate.
     * Si la fila está dentro de un índice (Índice creator, índice de secciones o bloque Sección creator),
     * desactiva todas las demás páginas de ese ámbito y activa la sección padre (una sola página y una
     * sección activas a la tiempo).
     */
    function setPaginasCreatorActiveItem(item) {
        if (!item) return;
        var list = item.closest('.ubits-paginas-creator');
        if (!list) return;
        var pageKey = item.getAttribute('data-paginas-creator-key') || '';

        var scope =
            item.closest('.ubits-indice-creator') ||
            item.closest('.ubits-seccion-creator-index') ||
            item.closest('.ubits-seccion-creator');

        if (scope) {
            clearPaginasCreatorActiveInScope(scope);
        } else {
            clearPaginasCreatorActiveInScope(list);
        }

        item.classList.add('is-active');
        var row = item.querySelector('.ubits-paginas-creator__row');
        if (row) row.setAttribute('aria-current', 'true');

        var sectionEl = item.closest('.ubits-seccion-creator__section');
        if (sectionEl && typeof global.setSeccionCreatorActiveSection === 'function') {
            global.setSeccionCreatorActiveSection(sectionEl);
        }

        var doc = global.document || document;
        doc.dispatchEvent(
            new CustomEvent('ubits-paginas-creator-activate', {
                bubbles: true,
                detail: { pageKey: pageKey, item: item }
            })
        );
    }

    function clearActivateTimeout(root) {
        if (root && root._ubitsPaginasActivateT) {
            clearTimeout(root._ubitsPaginasActivateT);
            root._ubitsPaginasActivateT = null;
        }
    }

    function buildEditNameBtnHtml() {
        return (
            '<button type="button" class="ubits-button ubits-button--secondary ubits-button--xs ubits-button--icon-only ubits-paginas-creator__edit-name-btn" data-tooltip="Cambiar nombre" data-tooltip-delay="1000" aria-label="Cambiar nombre">' +
            '<i class="far fa-pen-to-square"></i>' +
            '</button>'
        );
    }

    /**
     * Edición inline del título de página (mismo patrón que startInlineEditTaskName en task-strip.js).
     */
    function startInlineEditPaginasCreatorLabel(item, pageKey, onSave) {
        var wrap = item && item.querySelector('.ubits-paginas-creator__label-wrap');
        var labelEl = wrap && wrap.querySelector('.ubits-paginas-creator__label');
        if (!wrap || !labelEl) return;
        var currentName = (labelEl.textContent || '').trim();
        var input = document.createElement('input');
        input.type = 'text';
        input.className = 'ubits-paginas-creator__label-edit-input';
        input.value = currentName;
        input.setAttribute('placeholder', PAGINAS_CREATOR_PAGE_TITLE_PLACEHOLDER);
        input.setAttribute('data-paginas-creator-key', pageKey != null ? String(pageKey) : '');
        var finished = false;

        function finishEdit(save) {
            if (finished) return;
            finished = true;
            wrap.classList.remove('ubits-paginas-creator__label-edit-wrap');
            var newName = input.value != null ? String(input.value) : '';
            var displayName = save ? newName : currentName;
            var span = document.createElement('span');
            span.className = 'ubits-paginas-creator__label ubits-body-sm-semibold';
            span.textContent = displayName;
            var temp = document.createElement('div');
            temp.innerHTML = buildEditNameBtnHtml();
            var btn = temp.firstElementChild;
            wrap.innerHTML = '';
            wrap.appendChild(span);
            wrap.appendChild(btn);
            var mount = item.closest('[id]');
            if (mount && typeof global.initTooltip === 'function') {
                ensureRootId(mount);
                global.initTooltip('#' + mount.id + ' [data-tooltip]');
            }
            if (save && typeof onSave === 'function') onSave(displayName.trim());
            if (save) {
                var doc = global.document || document;
                doc.dispatchEvent(
                    new CustomEvent('ubits-paginas-creator-label-save', {
                        bubbles: true,
                        detail: {
                            pageKey: pageKey,
                            newLabel: newName.trim(),
                            item: item
                        }
                    })
                );
            }
        }

        input.addEventListener('click', function (e) {
            e.stopPropagation();
        });
        input.addEventListener('mousedown', function (e) {
            e.stopPropagation();
        });
        input.addEventListener('blur', function () {
            finishEdit(true);
        });
        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                finishEdit(true);
            }
            if (e.key === 'Escape') {
                e.preventDefault();
                finishEdit(false);
            }
        });

        input.addEventListener('input', function () {
            var doc = global.document || document;
            doc.dispatchEvent(
                new CustomEvent('ubits-paginas-creator-label-input', {
                    bubbles: true,
                    detail: {
                        pageKey: pageKey,
                        item: item,
                        value: input.value != null ? String(input.value) : ''
                    }
                })
            );
        });

        wrap.classList.add('ubits-paginas-creator__label-edit-wrap');
        wrap.innerHTML = '';
        wrap.appendChild(input);
        input.focus();
        input.select();
    }

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

        var item = anchorEl.closest('.ubits-paginas-creator__item');
        if (!item) return;

        doc.body.insertAdjacentHTML(
            'beforeend',
            global.getDropdownMenuHtml({
                overlayId: MENU_OVERLAY_ID,
                options: getPaginasCreatorMenuOptionsForItem(item)
            })
        );

        var overlay = doc.getElementById(MENU_OVERLAY_ID);
        if (!overlay) return;

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
                if (val === 'cambiar-nombre') {
                    tearDown();
                    startInlineEditPaginasCreatorLabel(item, pageKey, null);
                    return;
                }
                if (val === 'mover-arriba') {
                    movePaginasCreatorItem(item, -1);
                    tearDown();
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
                    return;
                }
                if (val === 'mover-abajo') {
                    movePaginasCreatorItem(item, 1);
                    tearDown();
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
                    return;
                }
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

    function resolveRoot(rootElOrSelector) {
        return typeof rootElOrSelector === 'string'
            ? document.querySelector(rootElOrSelector)
            : rootElOrSelector;
    }

    /**
     * Inicializa menú ⋮, activación con clic, doble clic / botón lápiz para editar título, tooltips.
     */
    function initPaginasCreator(rootElOrSelector) {
        var root = resolveRoot(rootElOrSelector);
        if (!root || root._ubitsPaginasCreatorInit) return;
        root._ubitsPaginasCreatorInit = true;
        ensureRootId(root);

        root.addEventListener('click', function (e) {
            var t = e.target;
            if (!t || !t.closest) return;

            var editBtn = t.closest('.ubits-paginas-creator__edit-name-btn');
            if (editBtn && root.contains(editBtn)) {
                e.preventDefault();
                e.stopPropagation();
                clearActivateTimeout(root);
                var itemEdit = editBtn.closest('.ubits-paginas-creator__item');
                var pk =
                    itemEdit && itemEdit.getAttribute('data-paginas-creator-key')
                        ? itemEdit.getAttribute('data-paginas-creator-key')
                        : '';
                startInlineEditPaginasCreatorLabel(itemEdit, pk, null);
                return;
            }

            var menuBtn = t.closest('.ubits-paginas-creator__menu');
            if (menuBtn && root.contains(menuBtn)) {
                e.preventDefault();
                e.stopPropagation();
                clearActivateTimeout(root);
                openPaginasCreatorMenu(menuBtn);
                return;
            }

            var row = t.closest('.ubits-paginas-creator__row');
            if (!row || !root.contains(row)) return;
            if (t.closest('.ubits-paginas-creator__label-edit-wrap')) return;

            var item = row.closest('.ubits-paginas-creator__item');
            if (!item) return;

            var labelWrap = t.closest('.ubits-paginas-creator__label-wrap');
            if (labelWrap && root.contains(labelWrap)) {
                var now = Date.now();
                var last = root._ubitsPaginasLastTapEdit;
                if (
                    last &&
                    last.item === item &&
                    now - last.time < DOUBLE_TAP_MS
                ) {
                    root._ubitsPaginasLastTapEdit = null;
                    clearActivateTimeout(root);
                    e.preventDefault();
                    e.stopPropagation();
                    var pk2 =
                        item.getAttribute('data-paginas-creator-key') != null
                            ? item.getAttribute('data-paginas-creator-key')
                            : '';
                    startInlineEditPaginasCreatorLabel(item, pk2, null);
                    return;
                }
                root._ubitsPaginasLastTapEdit = { item: item, time: now };
            }

            clearActivateTimeout(root);
            root._ubitsPaginasActivateT = setTimeout(function () {
                root._ubitsPaginasActivateT = null;
                setPaginasCreatorActiveItem(item);
            }, ACTIVATE_DELAY_MS);
        });

        root.addEventListener('dblclick', function (e) {
            if (!e.target.closest('.ubits-paginas-creator__label-wrap')) return;
            var row = e.target.closest('.ubits-paginas-creator__row');
            if (!row || !root.contains(row)) return;
            e.preventDefault();
            e.stopPropagation();
            clearActivateTimeout(root);
            var item = row.closest('.ubits-paginas-creator__item');
            if (!item) return;
            var pk =
                item.getAttribute('data-paginas-creator-key') != null
                    ? item.getAttribute('data-paginas-creator-key')
                    : '';
            startInlineEditPaginasCreatorLabel(item, pk, null);
        });

        root.addEventListener('keydown', function (e) {
            var row = e.target.closest('.ubits-paginas-creator__row');
            if (!row || !root.contains(row) || row !== document.activeElement) return;
            if (e.key !== 'Enter' && e.key !== ' ') return;
            if (e.target.closest('.ubits-paginas-creator__edit-name-btn')) return;
            e.preventDefault();
            var item = row.closest('.ubits-paginas-creator__item');
            if (item) setPaginasCreatorActiveItem(item);
        });

        refreshTooltipsInRoot(root);
    }

    function initPaginasCreatorMenus(rootElOrSelector) {
        initPaginasCreator(rootElOrSelector);
    }

    /**
     * HTML de un ítem (lista). opts: { label, tipo, active, menuAriaLabel, pageKey }
     */
    function paginasCreatorItemHtml(opts) {
        opts = opts || {};
        /* '' explícito = fila sin título (placeholder en pantalla); omitir label sigue siendo «Sin título». */
        var label =
            opts.label === ''
                ? ''
                : opts.label != null
                  ? String(opts.label)
                  : 'Sin título';
        var labelTrim = label.trim();
        var tipo = normalizeTipo(opts.tipo);
        var active = !!opts.active;
        var menuLabel =
            opts.menuAriaLabel ||
            (labelTrim ? 'Más acciones para ' + labelTrim : 'Más acciones para esta página');
        var pageKey = opts.pageKey != null ? String(opts.pageKey) : '';
        var dataKeyAttr = pageKey ? ' data-paginas-creator-key="' + escapeAttr(pageKey) + '"' : '';
        var itemClass = 'ubits-paginas-creator__item' + (active ? ' is-active' : '');
        var rowAria =
            labelTrim.length > 0
                ? 'Seleccionar página ' + labelTrim
                : 'Seleccionar página (sin título)';
        var rowAttrs =
            ' tabindex="0" class="ubits-paginas-creator__row"' +
            (active ? ' aria-current="true"' : '') +
            ' aria-label="' +
            escapeAttr(rowAria) +
            '"';
        return (
            '<div class="' +
            itemClass +
            '"' +
            dataKeyAttr +
            ' role="listitem">' +
            '<div' +
            rowAttrs +
            '>' +
            '<span class="ubits-paginas-creator__rail" aria-hidden="true"></span>' +
            '<span class="ubits-paginas-creator__icon-wrap">' +
            '<i class="' +
            paginasCreatorIconClass(tipo) +
            '"></i></span>' +
            '<div class="ubits-paginas-creator__label-wrap">' +
            '<span class="ubits-paginas-creator__label ubits-body-sm-semibold">' +
            escapeHtml(labelTrim) +
            '</span>' +
            buildEditNameBtnHtml() +
            '</div>' +
            '</div>' +
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
    global.initPaginasCreator = initPaginasCreator;
    global.startInlineEditPaginasCreatorLabel = startInlineEditPaginasCreatorLabel;
    global.setPaginasCreatorActiveItem = setPaginasCreatorActiveItem;
    global.PAGINAS_CREATOR_TIPO_ICONS = TIPO_ICONS;
    global.PAGINAS_CREATOR_PAGE_TITLE_PLACEHOLDER = PAGINAS_CREATOR_PAGE_TITLE_PLACEHOLDER;
})(typeof window !== 'undefined' ? window : this);
