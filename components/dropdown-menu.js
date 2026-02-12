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
     * @param {Array<Object>} config.options - Opciones. Cada item: { text, value?, leftIcon?, rightIcon?, checkbox?, switch?, selected? }.
     * @param {boolean} [config.hasAutocomplete=false] - Incluir bloque de autocomplete arriba.
     * @param {string} [config.autocompletePlaceholder] - Placeholder del input autocomplete.
     * @param {string} [config.autocompleteContainerId] - ID del contenedor donde crear el autocomplete (si se usa createInput después).
     * @param {string} [config.footerSecondaryLabel] - Texto del botón secundario del footer (ej. "Cancelar").
     * @param {string} [config.footerPrimaryLabel] - Texto del botón primario del footer (ej. "Aplicar").
     * @param {string} [config.footerSecondaryId] - ID del botón secundario.
     * @param {string} [config.footerPrimaryId] - ID del botón primario.
     * @returns {string} HTML del overlay + content.
     */
    function getDropdownMenuHtml(config) {
        config = config || {};
        var overlayId = config.overlayId || 'ubits-dropdown-menu-overlay';
        var contentId = config.contentId || overlayId + '-content';
        var options = config.options || [];
        var hasAutocomplete = config.hasAutocomplete === true;
        var autocompletePlaceholder = config.autocompletePlaceholder != null ? config.autocompletePlaceholder : 'Buscar...';
        var autocompleteContainerId = config.autocompleteContainerId || overlayId + '-autocomplete';
        var footerSecondaryLabel = config.footerSecondaryLabel != null ? config.footerSecondaryLabel : '';
        var footerPrimaryLabel = config.footerPrimaryLabel != null ? config.footerPrimaryLabel : '';
        var footerSecondaryId = config.footerSecondaryId || overlayId + '-footer-secondary';
        var footerPrimaryId = config.footerPrimaryId || overlayId + '-footer-primary';

        var optionsHtml = options.map(function (opt) {
            var value = opt.value != null ? escapeHtml(String(opt.value)) : '';
            var text = escapeHtml(opt.text != null ? String(opt.text) : '');
            var selectedClass = opt.selected ? ' ubits-dropdown-menu__option--selected' : '';
            var left = '';
            if (opt.leftIcon) {
                left = '<span class="ubits-dropdown-menu__option-left"><i class="far fa-' + escapeHtml(opt.leftIcon) + '"></i></span>';
            } else if (opt.checkbox) {
                var checked = opt.selected ? ' checked' : '';
                left = '<span class="ubits-dropdown-menu__option-left"><input type="checkbox" data-value="' + value + '"' + checked + '></span>';
            }
            var right = '';
            if (opt.rightIcon) {
                right = '<span class="ubits-dropdown-menu__option-right"><i class="far fa-' + escapeHtml(opt.rightIcon) + '"></i></span>';
            } else if (opt.switch) {
                var checkedSwitch = opt.selected ? ' checked' : '';
                right = '<span class="ubits-dropdown-menu__option-right"><input type="checkbox" role="switch" data-value="' + value + '"' + checkedSwitch + '></span>';
            }
            return '<button type="button" class="ubits-dropdown-menu__option' + selectedClass + '" data-value="' + value + '">' +
                left +
                '<span class="ubits-dropdown-menu__option-text">' + text + '</span>' +
                right +
                '</button>';
        }).join('');

        var autocompleteBlock = hasAutocomplete
            ? '<div class="ubits-dropdown-menu__autocomplete-wrap"><div id="' + escapeHtml(autocompleteContainerId) + '"></div></div>'
            : '';

        var footerBlock = (footerSecondaryLabel || footerPrimaryLabel)
            ? '<div class="ubits-dropdown-menu__footer">' +
            (footerSecondaryLabel ? '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm" id="' + footerSecondaryId + '"><span>' + escapeHtml(footerSecondaryLabel) + '</span></button>' : '') +
            (footerPrimaryLabel ? '<button type="button" class="ubits-button ubits-button--primary ubits-button--sm" id="' + footerPrimaryId + '"><span>' + escapeHtml(footerPrimaryLabel) + '</span></button>' : '') +
            '</div>'
            : '';

        return '<div class="ubits-dropdown-menu__overlay" id="' + escapeHtml(overlayId) + '" style="display: none;" aria-hidden="true">' +
            '<div class="ubits-dropdown-menu__content" id="' + escapeHtml(contentId) + '" onclick="event.stopPropagation();">' +
            autocompleteBlock +
            '<div class="ubits-dropdown-menu__options">' + optionsHtml + '</div>' +
            footerBlock +
            '</div>' +
            '</div>';
    }

    /**
     * Abre el menú desplegable y lo posiciona. Si no hay espacio suficiente abajo en el viewport,
     * lo despliega hacia arriba.
     * @param {string} overlayId - ID del overlay.
     * @param {Object|HTMLElement} position - { top, left } en px, o elemento ancla (se usa getBoundingClientRect()).
     */
    function openDropdownMenu(overlayId, position) {
        var overlay = document.getElementById(overlayId);
        if (!overlay) return;
        var content = overlay.querySelector('.ubits-dropdown-menu__content');
        if (!content) return;

        var gap = 4;
        var viewportPadding = 8;
        var top = 0;
        var left = 0;
        var rect = null;

        if (position && typeof position.getBoundingClientRect === 'function') {
            rect = position.getBoundingClientRect();
            top = rect.bottom + gap;
            left = rect.left;
        } else if (position && typeof position.top !== 'undefined' && typeof position.left !== 'undefined') {
            top = position.top;
            left = position.left;
        }

        content.style.top = top + 'px';
        content.style.left = left + 'px';
        content.style.bottom = 'auto';
        overlay.style.display = 'block';
        overlay.setAttribute('aria-hidden', 'false');

        if (rect) {
            var contentHeight = content.offsetHeight;
            var spaceBelow = window.innerHeight - rect.bottom - gap - viewportPadding;
            if (spaceBelow < contentHeight) {
                var spaceAbove = rect.top - gap - viewportPadding;
                if (spaceAbove >= contentHeight || spaceAbove >= spaceBelow) {
                    top = rect.top - contentHeight - gap;
                    content.style.top = top + 'px';
                } else {
                    top = Math.max(viewportPadding, window.innerHeight - contentHeight - viewportPadding);
                    content.style.top = top + 'px';
                }
            }
        }
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
