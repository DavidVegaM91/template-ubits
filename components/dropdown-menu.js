/**
 * UBITS Dropdown Menu Component
 * Menú desplegable unificado: padding sm, fondo bg-1, elevation, texto regular alineado a la izquierda.
 * Opcional: autocomplete (p. ej. encabezados de tabla), opciones con icono/checkbox/switch a izquierda o derecha.
 * Footer: dos botones a la derecha (secundario + primario).
 *
 * Uso:
 *   getDropdownMenuHtml({ overlayId, contentId, options, hasAutocomplete?, autocompletePlaceholder?, footerSecondaryLabel?, footerPrimaryLabel? })
 *   openDropdownMenu(overlayId, { top, left }) o openDropdownMenu(overlayId, anchorElement)
 *   closeDropdownMenu(overlayId)
 */

(function () {
    'use strict';

    function escapeHtml(text) {
        if (text == null) return '';
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Genera el HTML de un menú desplegable UBITS.
     * @param {Object} config
     * @param {string} config.overlayId - ID del overlay (cierre al clic fuera).
     * @param {string} [config.contentId] - ID del panel contenido (para posicionar).
     * @param {Array<Object>} config.options - Opciones. Cada item: { text, value?, leftIcon?, rightIcon?, checkbox?, switch?, selected?, avatar?, radio? }.
     *   - avatar: URL de imagen (avatar) a mostrar a la izquierda; si se define, tiene prioridad sobre leftIcon para esa opción.
     *   - radio: si config.radioGroup es true, cada opción se renderiza como radio oficial (ubits-radio--sm) con texto.
     * @param {boolean} [config.radioGroup=false] - Si true, las opciones se muestran como lista de radios (componente oficial ubits-radio). Requiere radio-button.css.
     * @param {string} [config.radioName] - name del grupo de radios (por defecto overlayId + '-radio').
     * @param {boolean} [config.hasAutocomplete=false] - Incluir bloque de autocomplete arriba.
     * @param {string} [config.autocompletePlaceholder] - Placeholder del input autocomplete.
     * @param {string} [config.autocompleteContainerId] - ID del contenedor donde crear el autocomplete (si se usa createInput después).
     * @param {string} [config.footerSecondaryLabel] - Texto del botón secundario del footer (ej. "Cancelar").
     * @param {string} [config.footerPrimaryLabel] - Texto del botón primario del footer (ej. "Aplicar").
     * @param {string} [config.footerSecondaryId] - ID del botón secundario.
     * @param {string} [config.footerPrimaryId] - ID del botón primario.
     * @param {string} [config.customBodyHtml] - HTML personalizado para el cuerpo (inputs, formularios). Si se define, se muestra en lugar de la lista de opciones.
     * @returns {string} HTML del overlay + content.
     */
    function getDropdownMenuHtml(config) {
        config = config || {};
        var overlayId = config.overlayId || 'ubits-dropdown-menu-overlay';
        var contentId = config.contentId || overlayId + '-content';
        var options = config.options || [];
        var customBodyHtml = config.customBodyHtml != null ? config.customBodyHtml : '';
        var radioGroup = config.radioGroup === true;
        var radioName = config.radioName != null ? String(config.radioName) : overlayId + '-radio';
        var hasAutocomplete = config.hasAutocomplete === true;
        var autocompletePlaceholder = config.autocompletePlaceholder != null ? config.autocompletePlaceholder : 'Buscar...';
        var autocompleteContainerId = config.autocompleteContainerId || overlayId + '-autocomplete';
        var footerSecondaryLabel = config.footerSecondaryLabel != null ? config.footerSecondaryLabel : '';
        var footerPrimaryLabel = config.footerPrimaryLabel != null ? config.footerPrimaryLabel : '';
        var footerSecondaryId = config.footerSecondaryId || overlayId + '-footer-secondary';
        var footerPrimaryId = config.footerPrimaryId || overlayId + '-footer-primary';

        var optionsHtml = options.map(function (opt, index) {
            var value = opt.value != null ? escapeHtml(String(opt.value)) : '';
            var text = escapeHtml(opt.text != null ? String(opt.text) : '');
            var selectedClass = opt.selected ? ' ubits-dropdown-menu__option--selected' : '';
            if (radioGroup) {
                var radioChecked = opt.selected ? ' checked' : '';
                return '<label class="ubits-dropdown-menu__option ubits-dropdown-menu__option--radio ubits-radio ubits-radio--sm' + selectedClass + '" data-value="' + value + '">' +
                    '<input type="radio" class="ubits-radio__input" name="' + escapeHtml(radioName) + '" value="' + value + '"' + radioChecked + '>' +
                    '<span class="ubits-radio__circle"></span>' +
                    '<span class="ubits-radio__label">' + text + '</span>' +
                    '</label>';
            }
            var left = '';
            var checkboxId = '';
            if (opt.avatar !== undefined) {
                var nombre = opt.text != null ? String(opt.text) : '';
                var avatarUrl = (opt.avatar && String(opt.avatar).trim()) ? String(opt.avatar).trim() : null;
                left = '<span class="ubits-dropdown-menu__option-left">' +
                    (typeof renderAvatar === 'function'
                        ? renderAvatar({ nombre: nombre, avatar: avatarUrl }, { size: 'sm' })
                        : (avatarUrl ? '<img class="ubits-dropdown-menu__option-avatar" src="' + escapeHtml(avatarUrl) + '" alt="">' : '<i class="far fa-user"></i>')) +
                    '</span>';
            } else if (opt.leftIcon) {
                left = '<span class="ubits-dropdown-menu__option-left"><i class="far fa-' + escapeHtml(opt.leftIcon) + '"></i></span>';
            } else if (opt.checkbox) {
                checkboxId = overlayId + '-opt-' + index;
                var checked = opt.selected ? ' checked' : '';
                left = '<span class="ubits-dropdown-menu__option-left"><input type="checkbox" id="' + escapeHtml(checkboxId) + '" data-value="' + value + '"' + checked + '></span>';
            }
            var right = '';
            if (opt.rightIcon) {
                right = '<span class="ubits-dropdown-menu__option-right"><i class="far fa-' + escapeHtml(opt.rightIcon) + '"></i></span>';
            } else if (opt.switch) {
                var checkedSwitch = opt.selected ? ' checked' : '';
                right = '<span class="ubits-dropdown-menu__option-right"><input type="checkbox" role="switch" data-value="' + value + '"' + checkedSwitch + '></span>';
            }
            var inner = left + '<span class="ubits-dropdown-menu__option-text">' + text + '</span>' + right;
            if (opt.checkbox && checkboxId) {
                return '<label class="ubits-dropdown-menu__option' + selectedClass + '" for="' + escapeHtml(checkboxId) + '" data-value="' + value + '">' + inner + '</label>';
            }
            return '<button type="button" class="ubits-dropdown-menu__option' + selectedClass + '" data-value="' + value + '">' + inner + '</button>';
        }).join('');

        var searchInputId = overlayId + '-autocomplete-input';
        var searchClearId = overlayId + '-autocomplete-clear';
        var autocompleteBlock = hasAutocomplete
            ? '<div class="ubits-dropdown-menu__autocomplete-wrap"><div id="' + escapeHtml(autocompleteContainerId) + '">' +
            '<div class="ubits-input-wrapper ubits-dropdown-menu__search-wrapper">' +
            '<input type="text" id="' + escapeHtml(searchInputId) + '" class="ubits-input ubits-input--sm" placeholder="' + escapeHtml(autocompletePlaceholder) + '" autocomplete="off" aria-label="Buscar" style="width:100%;padding-left:36px;padding-right:36px;box-sizing:border-box;">' +
            '<i class="far fa-search" aria-hidden="true" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--ubits-fg-1-medium);pointer-events:none;"></i>' +
            '<i class="far fa-times" id="' + escapeHtml(searchClearId) + '" aria-hidden="true" style="position:absolute;right:12px;top:50%;transform:translateY(-50%);color:var(--ubits-fg-1-medium);cursor:pointer;display:none;"></i>' +
            '</div></div></div>'
            : '';

        var footerBlock = (footerSecondaryLabel || footerPrimaryLabel)
            ? '<div class="ubits-dropdown-menu__footer">' +
            (footerSecondaryLabel ? '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm" id="' + footerSecondaryId + '"><span>' + escapeHtml(footerSecondaryLabel) + '</span></button>' : '') +
            (footerPrimaryLabel ? '<button type="button" class="ubits-button ubits-button--primary ubits-button--sm" id="' + footerPrimaryId + '"><span>' + escapeHtml(footerPrimaryLabel) + '</span></button>' : '') +
            '</div>'
            : '';

        var bodyBlock = customBodyHtml
            ? '<div class="ubits-dropdown-menu__custom-body">' + customBodyHtml + '</div>'
            : '<div class="ubits-dropdown-menu__options">' + optionsHtml + '</div>';
        return '<div class="ubits-dropdown-menu__overlay" id="' + escapeHtml(overlayId) + '" style="display: none;" aria-hidden="true">' +
            '<div class="ubits-dropdown-menu__content" id="' + escapeHtml(contentId) + '" onclick="event.stopPropagation();">' +
            autocompleteBlock +
            bodyBlock +
            footerBlock +
            '</div>' +
            '</div>';
    }

    /**
     * Abre el menú desplegable y lo posiciona dentro del viewport.
     * Vertical: debajo del ancla; si no hay espacio, arriba; si no cabe, se recorta con padding.
     * Horizontal: alineado al ancla; si se sale por la derecha o izquierda, se ajusta para no salir nunca.
     * @param {string} overlayId - ID del overlay.
     * @param {Object|HTMLElement} position - { top, left } en px, o elemento ancla (getBoundingClientRect()).
     * @param {Object} [options] - { alignRight: true } para alinear siempre la derecha del dropdown con la derecha del botón.
     */
    function openDropdownMenu(overlayId, position, options) {
        var overlay = document.getElementById(overlayId);
        if (!overlay) return;
        var content = overlay.querySelector('.ubits-dropdown-menu__content');
        if (!content) return;

        options = options || {};
        var alignRight = options.alignRight === true;
        var minWidthFromAnchor = options.minWidthFromAnchor === true;

        var gap = 4;
        var viewportPadding = 8;
        var vw = window.innerWidth;
        var vh = window.innerHeight;
        var top = 0;
        var left = 0;
        var rect = null;

        if (position && typeof position.getBoundingClientRect === 'function') {
            rect = position.getBoundingClientRect();
            top = rect.bottom + gap;
            left = rect.left;
        } else {
            if (position && typeof position.top !== 'undefined' && typeof position.left !== 'undefined') {
                top = position.top;
                left = position.left;
            }
        }

        if (rect && minWidthFromAnchor && rect.width > 0) {
            content.style.minWidth = rect.width + 'px';
        }
        content.style.top = top + 'px';
        content.style.left = left + 'px';
        content.style.bottom = 'auto';
        overlay.style.display = 'block';
        overlay.setAttribute('aria-hidden', 'false');

        var contentWidth = content.offsetWidth;
        var contentHeight = content.offsetHeight;

        if (rect) {
            var spaceBelow = vh - rect.bottom - gap - viewportPadding;
            var spaceAbove = rect.top - gap - viewportPadding;
            if (spaceBelow < contentHeight && spaceAbove >= contentHeight) {
                top = rect.top - contentHeight - gap;
            } else if (spaceBelow < contentHeight && spaceAbove < contentHeight) {
                top = Math.max(viewportPadding, vh - contentHeight - viewportPadding);
            }
            content.style.top = Math.max(viewportPadding, Math.min(vh - contentHeight - viewportPadding, top)) + 'px';
            if (alignRight || left + contentWidth > vw - viewportPadding) {
                left = rect.right - contentWidth;
            }
        }

        left = Math.max(viewportPadding, Math.min(vw - contentWidth - viewportPadding, left));
        content.style.left = left + 'px';
    }

    /**
     * Cierra el menú desplegable.
     * @param {string} overlayId - ID del overlay.
     */
    function closeDropdownMenu(overlayId) {
        var overlay = document.getElementById(overlayId);
        if (!overlay) return;
        overlay.style.display = 'none';
        overlay.setAttribute('aria-hidden', 'true');
    }

    if (typeof window !== 'undefined') {
        window.getDropdownMenuHtml = getDropdownMenuHtml;
        window.openDropdownMenu = openDropdownMenu;
        window.closeDropdownMenu = closeDropdownMenu;
    }
})();
