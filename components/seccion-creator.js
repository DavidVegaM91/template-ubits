/**
 * Sección Creator — bloque de sección (título editable tipo task-strip, menú si activa, páginas, «Añadir página»).
 * Carga previa: dropdown-menu.js, tooltip.js (tooltips), paginas-creator.js.
 * Eventos: ubits-seccion-creator-add-page, ubits-seccion-creator-section-action, ubits-seccion-creator-edit-section (modal Editar sección),
 *   ubits-seccion-creator-activate, ubits-seccion-creator-title-save
 * Estado validación: clase `ubits-seccion-creator__section--error` en `.ubits-seccion-creator__section` (p. ej. sección sin páginas).
 * @see documentacion/componentes/seccion-creator.html
 */
(function (global) {
    var SECTION_MENU_OVERLAY_ID = 'ubits-seccion-creator-section-menu-overlay';
    var _sectionMenuOpenAnchor = null;
    var SEC_ACTIVATE_DELAY_MS = 300;
    var SEC_DOUBLE_TAP_MS = 400;

    function escapeHtml(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    function escapeAttr(s) {
        return escapeHtml(s).replace(/"/g, '&quot;');
    }

    function ensureRootId(root) {
        if (!root || root.id) return root;
        root.id = 'ubits-sc-root-' + String(Date.now()) + '-' + Math.floor(Math.random() * 1e6);
        return root;
    }

    function refreshTooltipsInRoot(root) {
        if (!root || typeof global.initTooltip !== 'function') return;
        ensureRootId(root);
        global.initTooltip('#' + root.id + ' [data-tooltip]');
    }

    function seccionTitleEditBtnHtml() {
        return (
            '<button type="button" class="ubits-button ubits-button--secondary ubits-button--xs ubits-button--icon-only ubits-seccion-creator__title-edit-btn" data-tooltip="Cambiar nombre" data-tooltip-delay="1000" aria-label="Cambiar nombre">' +
            '<i class="far fa-pen-to-square"></i>' +
            '</button>'
        );
    }

    /**
     * Activa una sección en un índice (quita is-active en hermanas).
     * También se llama desde paginas-creator al activar una página: la sección padre queda como única activa (borde de marca).
     */
    function setSeccionCreatorActiveSection(sectionEl) {
        if (!sectionEl) return;
        var stack = sectionEl.closest('.ubits-seccion-creator-index__stack');
        var sectionKey =
            sectionEl.getAttribute('data-seccion-creator-key') != null
                ? sectionEl.getAttribute('data-seccion-creator-key')
                : '';
        if (stack) {
            stack.querySelectorAll('.ubits-seccion-creator__section.is-active').forEach(function (s) {
                s.classList.remove('is-active');
                s.removeAttribute('aria-current');
            });
        }
        sectionEl.classList.add('is-active');
        sectionEl.setAttribute('aria-current', 'true');
        var doc = global.document || document;
        doc.dispatchEvent(
            new CustomEvent('ubits-seccion-creator-activate', {
                bubbles: true,
                detail: { sectionKey: sectionKey, section: sectionEl }
            })
        );
    }

    function clearSecActivateTimeout(root) {
        if (root && root._ubitsSeccionActivateT) {
            clearTimeout(root._ubitsSeccionActivateT);
            root._ubitsSeccionActivateT = null;
        }
    }

    /**
     * Edición inline del título de sección (patrón task-strip).
     */
    function startInlineEditSeccionCreatorTitle(sectionEl, sectionKey, onSave) {
        var inner = sectionEl && sectionEl.querySelector('.ubits-seccion-creator__title-inner');
        var titleEl = inner && inner.querySelector('.ubits-seccion-creator__title');
        if (!inner || !titleEl) return;
        var current = (titleEl.textContent || '').trim();
        var input = document.createElement('input');
        input.type = 'text';
        input.className = 'ubits-seccion-creator__title-edit-input';
        input.value = current;
        input.setAttribute('data-seccion-creator-key', sectionKey != null ? String(sectionKey) : '');
        var finished = false;

        function titleTypoClasses() {
            return 'ubits-body-md-bold';
        }

        function finishEdit(save) {
            if (finished) return;
            finished = true;
            inner.classList.remove('ubits-seccion-creator__title-edit-wrap');
            var newT = input.value != null ? String(input.value) : '';
            var display = save ? newT : current;
            var span = document.createElement('span');
            span.className = 'ubits-seccion-creator__title ' + titleTypoClasses();
            span.textContent = display;
            var temp = document.createElement('div');
            temp.innerHTML = seccionTitleEditBtnHtml();
            var btn = temp.firstElementChild;
            inner.innerHTML = '';
            inner.appendChild(span);
            inner.appendChild(btn);
            var mount = sectionEl.closest('[id]');
            if (mount && typeof global.initTooltip === 'function') {
                ensureRootId(mount);
                global.initTooltip('#' + mount.id + ' [data-tooltip]');
            }
            if (save && typeof onSave === 'function') onSave(display.trim());
            if (save) {
                var doc = global.document || document;
                doc.dispatchEvent(
                    new CustomEvent('ubits-seccion-creator-title-save', {
                        bubbles: true,
                        detail: {
                            sectionKey: sectionKey,
                            newTitle: newT.trim(),
                            section: sectionEl
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

        inner.classList.add('ubits-seccion-creator__title-edit-wrap');
        inner.innerHTML = '';
        inner.appendChild(input);
        input.focus();
        input.select();
    }

    function getSeccionCreatorSectionMenuOptions() {
        return [
            { text: 'Editar sección', value: 'editar-seccion', leftIcon: 'pen-to-square' },
            { text: 'Mover arriba', value: 'seccion-mover-arriba', leftIcon: 'arrow-up' },
            { text: 'Mover abajo', value: 'seccion-mover-abajo', leftIcon: 'arrow-down' },
            { text: 'Eliminar sección', value: 'seccion-eliminar', leftIcon: 'trash' }
        ];
    }

    /** Hermano sección en el stack (solo .ubits-seccion-creator__section). */
    function getSiblingSectionBlock(sectionEl, dir) {
        if (!sectionEl) return null;
        var s = dir === -1 ? sectionEl.previousElementSibling : sectionEl.nextElementSibling;
        while (s) {
            if (s.classList && s.classList.contains('ubits-seccion-creator__section')) return s;
            s = dir === -1 ? s.previousElementSibling : s.nextElementSibling;
        }
        return null;
    }

    /**
     * Reordena bloques de sección dentro de .ubits-seccion-creator-index__stack (solo índice multi-sección).
     * @param {number} delta -1 arriba, +1 abajo
     */
    function moveSeccionCreatorSectionInStack(sectionEl, delta) {
        var stack = sectionEl && sectionEl.closest('.ubits-seccion-creator-index__stack');
        if (!stack || !stack.contains(sectionEl)) return false;
        if (delta === -1) {
            var prev = getSiblingSectionBlock(sectionEl, -1);
            if (!prev) return false;
            stack.insertBefore(sectionEl, prev);
            return true;
        }
        if (delta === 1) {
            var next = getSiblingSectionBlock(sectionEl, 1);
            if (!next) return false;
            if (next.nextSibling) {
                stack.insertBefore(sectionEl, next.nextSibling);
            } else {
                stack.appendChild(sectionEl);
            }
            return true;
        }
        return false;
    }

    function getSeccionCreatorSectionMenuOptionsForSection(sectionEl) {
        var base = getSeccionCreatorSectionMenuOptions();
        var stack = sectionEl && sectionEl.closest('.ubits-seccion-creator-index__stack');
        if (!stack || !stack.contains(sectionEl)) {
            return base.filter(function (opt) {
                var v = opt.value;
                if (v === 'seccion-mover-arriba' || v === 'seccion-mover-abajo') return false;
                return true;
            });
        }
        return base.filter(function (opt) {
            var v = opt.value;
            if (v === 'seccion-mover-arriba') return !!getSiblingSectionBlock(sectionEl, -1);
            if (v === 'seccion-mover-abajo') return !!getSiblingSectionBlock(sectionEl, 1);
            return true;
        });
    }

    function openSeccionCreatorSectionMenu(anchorEl) {
        if (
            !anchorEl ||
            typeof global.getDropdownMenuHtml !== 'function' ||
            typeof global.openDropdownMenu !== 'function' ||
            typeof global.closeDropdownMenu !== 'function'
        ) {
            console.warn('UBITS: carga dropdown-menu.js para el menú de sección creator.');
            return;
        }
        if (_sectionMenuOpenAnchor && _sectionMenuOpenAnchor !== anchorEl) {
            _sectionMenuOpenAnchor.setAttribute('aria-expanded', 'false');
        }
        _sectionMenuOpenAnchor = anchorEl;

        var prev = document.getElementById(SECTION_MENU_OVERLAY_ID);
        if (prev) prev.remove();

        var doc = global.document || (typeof document !== 'undefined' ? document : null);
        if (!doc || !doc.body) return;

        var sectionEl = anchorEl.closest('.ubits-seccion-creator__section');

        doc.body.insertAdjacentHTML(
            'beforeend',
            global.getDropdownMenuHtml({
                overlayId: SECTION_MENU_OVERLAY_ID,
                options: getSeccionCreatorSectionMenuOptionsForSection(sectionEl)
            })
        );

        var overlay = doc.getElementById(SECTION_MENU_OVERLAY_ID);
        if (!overlay) return;

        var sectionKey =
            sectionEl && sectionEl.getAttribute('data-seccion-creator-key')
                ? sectionEl.getAttribute('data-seccion-creator-key')
                : '';
        var titleEl = sectionEl && sectionEl.querySelector('.ubits-seccion-creator__title');
        var titleText = titleEl ? String(titleEl.textContent || '').trim() : '';

        function tearDown() {
            global.closeDropdownMenu(SECTION_MENU_OVERLAY_ID);
            if (_sectionMenuOpenAnchor) {
                _sectionMenuOpenAnchor.setAttribute('aria-expanded', 'false');
                _sectionMenuOpenAnchor = null;
            }
            overlay.removeEventListener('click', onOverlayClick);
            if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        }

        function onOverlayClick(ev) {
            if (ev.target === overlay) tearDown();
        }

        overlay.addEventListener('click', onOverlayClick);

        overlay.querySelectorAll('.ubits-dropdown-menu__option[data-value]').forEach(function (row) {
            row.addEventListener('click', function (ev) {
                ev.stopPropagation();
                var val = row.getAttribute('data-value');
                if (val === 'editar-seccion') {
                    tearDown();
                    doc.dispatchEvent(
                        new CustomEvent('ubits-seccion-creator-edit-section', {
                            bubbles: true,
                            detail: {
                                sectionKey: sectionKey,
                                title: titleText,
                                anchor: anchorEl,
                                section: sectionEl
                            }
                        })
                    );
                    return;
                }
                if (val === 'seccion-mover-arriba') {
                    moveSeccionCreatorSectionInStack(sectionEl, -1);
                    var indUp = sectionEl && sectionEl.closest('.ubits-indice-creator');
                    if (indUp) refreshTooltipsInRoot(indUp);
                } else if (val === 'seccion-mover-abajo') {
                    moveSeccionCreatorSectionInStack(sectionEl, 1);
                    var indDown = sectionEl && sectionEl.closest('.ubits-indice-creator');
                    if (indDown) refreshTooltipsInRoot(indDown);
                }
                doc.dispatchEvent(
                    new CustomEvent('ubits-seccion-creator-section-action', {
                        bubbles: true,
                        detail: {
                            action: val,
                            sectionKey: sectionKey,
                            label: titleText,
                            anchor: anchorEl,
                            section: sectionEl
                        }
                    })
                );
                tearDown();
            });
        });

        anchorEl.setAttribute('aria-expanded', 'true');
        anchorEl.setAttribute('aria-haspopup', 'true');
        global.openDropdownMenu(SECTION_MENU_OVERLAY_ID, anchorEl, { alignRight: true });
    }

    /**
     * Bloque &lt;section&gt; (título, páginas, «Añadir página» por sección salvo includeAddButton: false).
     * @param {Object} s - { title, active?, sectionKey?, pages?, includeAddButton?, addButtonId?, addButtonLabel?, sectionMenuAriaLabel?, hideTitle? }
     *   hideTitle: si true, no se renderiza cabecera (título ⋮); uso en Índice creator sin secciones (una sola lista de páginas).
     */
    function seccionCreatorSectionHtml(s) {
        s = s || {};
        if (typeof global.paginasCreatorItemHtml !== 'function') {
            console.warn('UBITS: carga paginas-creator.js antes de seccion-creator.js');
            return '';
        }
        var hideTitle = !!s.hideTitle;
        var title = s.title != null ? String(s.title) : 'Sin título';
        var active = !!s.active;
        var key = s.sectionKey != null ? String(s.sectionKey) : '';
        var pages = s.pages || [];
        /* «Añadir página» en todas las secciones si includeAddButton no es false (índice multi-sección). */
        var includeAdd = s.includeAddButton !== false;
        var secClass =
            'ubits-seccion-creator__section' +
            (active ? ' is-active' : '') +
            (hideTitle ? ' ubits-seccion-creator__section--no-header' : '');
        var dataKey = key ? ' data-seccion-creator-key="' + escapeAttr(key) + '"' : '';
        var aria = active ? ' aria-current="true"' : '';
        var menuLabel =
            s.sectionMenuAriaLabel != null
                ? String(s.sectionMenuAriaLabel)
                : 'Más acciones de la sección';
        var pagesInner = pages
            .map(function (p) {
                return global.paginasCreatorItemHtml(p);
            })
            .join('');

        /* Título: siempre body/md/bold (misma fuente activa o no) */
        var titleTypo = 'ubits-body-md-bold';

        var addLabel = s.addButtonLabel != null ? String(s.addButtonLabel) : 'Añadir página';
        var addId = s.addButtonId != null ? String(s.addButtonId).trim() : '';
        var idAttr = addId ? ' id="' + escapeAttr(addId) + '"' : '';
        var addBlock = '';
        if (includeAdd) {
            addBlock =
                '<div class="ubits-seccion-creator__add-wrap">' +
                '<button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-seccion-creator__add-btn"' +
                idAttr +
                '>' +
                '<i class="far fa-plus"></i>' +
                '<span>' +
                escapeHtml(addLabel) +
                '</span>' +
                '</button>' +
                '</div>';
        }

        var headerBlock = '';
        if (!hideTitle) {
            headerBlock =
                '<div class="ubits-seccion-creator__header">' +
                '<div class="ubits-seccion-creator__title-wrap">' +
                '<div class="ubits-seccion-creator__title-inner">' +
                '<span class="ubits-seccion-creator__title ' +
                titleTypo +
                '">' +
                escapeHtml(title) +
                '</span>' +
                seccionTitleEditBtnHtml() +
                '</div>' +
                '</div>' +
                '<button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only ubits-seccion-creator__section-menu" aria-label="' +
                escapeAttr(menuLabel) +
                '">' +
                '<i class="far fa-ellipsis-vertical"></i>' +
                '</button>' +
                '</div>';
        }

        return (
            '<section class="' +
            secClass +
            '"' +
            dataKey +
            aria +
            '>' +
            headerBlock +
            '<div class="ubits-seccion-creator__pages">' +
            '<div class="ubits-paginas-creator" role="list">' +
            pagesInner +
            '</div>' +
            '</div>' +
            addBlock +
            '</section>'
        );
    }

    /**
     * Una sección completa (por defecto activa). «Añadir página» dentro del recuadro si está activa.
     * @param {Object} opts - { title, active? (default true), sectionKey?, pages?, addButtonId?, addButtonLabel? }
     */
    function seccionCreatorHtml(opts) {
        opts = opts || {};
        var o = Object.assign({}, opts);
        if (o.active === undefined) o.active = true;
        if (o.includeAddButton === undefined) o.includeAddButton = true;
        return '<div class="ubits-seccion-creator">' + seccionCreatorSectionHtml(o) + '</div>';
    }

    /**
     * Índice: varias secciones; «Añadir página» visible en cada sección (antes solo en la activa).
     * @param {Object} opts - { sections: Array, addButtonId?, addButtonLabel? }
     */
    function seccionCreatorIndexHtml(opts) {
        opts = opts || {};
        var sections = opts.sections || [];
        var addId = opts.addButtonId != null ? String(opts.addButtonId).trim() : '';
        var addLabel = opts.addButtonLabel != null ? String(opts.addButtonLabel) : 'Añadir página';
        var stackHtml = sections
            .map(function (sec) {
                var copy = Object.assign({}, sec);
                copy.includeAddButton = true;
                copy.addButtonLabel = addLabel;
                if (addId && sec.active) {
                    copy.addButtonId = addId;
                }
                return seccionCreatorSectionHtml(copy);
            })
            .join('');
        return (
            '<div class="ubits-seccion-creator-index">' +
            '<div class="ubits-seccion-creator-index__stack">' +
            stackHtml +
            '</div>' +
            '</div>'
        );
    }

    function initSeccionCreator(rootElOrSelector) {
        var root =
            typeof rootElOrSelector === 'string'
                ? document.querySelector(rootElOrSelector)
                : rootElOrSelector;
        if (!root) return;
        if (typeof global.initPaginasCreator === 'function') {
            global.initPaginasCreator(root);
        } else if (typeof global.initPaginasCreatorMenus === 'function') {
            global.initPaginasCreatorMenus(root);
        }
        if (root._ubitsSeccionCreatorInit) return;
        root._ubitsSeccionCreatorInit = true;
        ensureRootId(root);

        root.addEventListener('click', function (e) {
            var t = e.target;
            if (!t || !t.closest) return;

            var titleEditBtn = t.closest('.ubits-seccion-creator__title-edit-btn');
            if (titleEditBtn && root.contains(titleEditBtn)) {
                e.preventDefault();
                e.stopPropagation();
                clearSecActivateTimeout(root);
                var sectionEdit = titleEditBtn.closest('.ubits-seccion-creator__section');
                var sk =
                    sectionEdit && sectionEdit.getAttribute('data-seccion-creator-key') != null
                        ? sectionEdit.getAttribute('data-seccion-creator-key')
                        : '';
                startInlineEditSeccionCreatorTitle(sectionEdit, sk, null);
                return;
            }

            var secBtn = t.closest('.ubits-seccion-creator__section-menu');
            if (secBtn && root.contains(secBtn)) {
                e.preventDefault();
                e.stopPropagation();
                clearSecActivateTimeout(root);
                openSeccionCreatorSectionMenu(secBtn);
                return;
            }

            var addBtn = t.closest('.ubits-seccion-creator__add-btn');
            if (addBtn && root.contains(addBtn)) {
                e.preventDefault();
                clearSecActivateTimeout(root);
                var doc = global.document || (typeof document !== 'undefined' ? document : null);
                if (!doc) return;
                doc.dispatchEvent(
                    new CustomEvent('ubits-seccion-creator-add-page', {
                        bubbles: true,
                        detail: { anchor: addBtn }
                    })
                );
                return;
            }

            var header = t.closest('.ubits-seccion-creator__header');
            var titleInner = t.closest('.ubits-seccion-creator__title-inner');
            if (header && titleInner && root.contains(header) && !t.closest('.ubits-seccion-creator__section-menu')) {
                var section = header.closest('.ubits-seccion-creator__section');
                if (!section || !root.contains(section)) return;
                if (t.closest('.ubits-seccion-creator__title-edit-wrap')) return;
                var sk2 =
                    section.getAttribute('data-seccion-creator-key') != null
                        ? section.getAttribute('data-seccion-creator-key')
                        : '';
                var now = Date.now();
                var last = root._ubitsSeccionLastTapEdit;
                if (last && last.section === section && now - last.time < SEC_DOUBLE_TAP_MS) {
                    root._ubitsSeccionLastTapEdit = null;
                    clearSecActivateTimeout(root);
                    e.preventDefault();
                    e.stopPropagation();
                    startInlineEditSeccionCreatorTitle(section, sk2, null);
                    return;
                }
                root._ubitsSeccionLastTapEdit = { section: section, time: now };
                clearSecActivateTimeout(root);
                root._ubitsSeccionActivateT = setTimeout(function () {
                    root._ubitsSeccionActivateT = null;
                    setSeccionCreatorActiveSection(section);
                }, SEC_ACTIVATE_DELAY_MS);
            }
        });

        root.addEventListener('dblclick', function (e) {
            if (!e.target.closest('.ubits-seccion-creator__title-inner')) return;
            var header = e.target.closest('.ubits-seccion-creator__header');
            if (!header || !root.contains(header)) return;
            if (e.target.closest('.ubits-seccion-creator__section-menu')) return;
            e.preventDefault();
            e.stopPropagation();
            clearSecActivateTimeout(root);
            var section = header.closest('.ubits-seccion-creator__section');
            if (!section) return;
            var sk =
                section.getAttribute('data-seccion-creator-key') != null
                    ? section.getAttribute('data-seccion-creator-key')
                    : '';
            startInlineEditSeccionCreatorTitle(section, sk, null);
        });

        refreshTooltipsInRoot(root);
    }

    global.getSeccionCreatorSectionMenuOptions = getSeccionCreatorSectionMenuOptions;
    global.openSeccionCreatorSectionMenu = openSeccionCreatorSectionMenu;
    global.seccionCreatorSectionHtml = seccionCreatorSectionHtml;
    global.seccionCreatorHtml = seccionCreatorHtml;
    global.seccionCreatorIndexHtml = seccionCreatorIndexHtml;
    global.initSeccionCreator = initSeccionCreator;
    global.startInlineEditSeccionCreatorTitle = startInlineEditSeccionCreatorTitle;
    global.setSeccionCreatorActiveSection = setSeccionCreatorActiveSection;
})(typeof window !== 'undefined' ? window : this);
