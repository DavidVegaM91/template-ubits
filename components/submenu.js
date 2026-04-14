/**
 * UBITS Submenu — panel flotante tipo submenú/flyout sin colita.
 *
 * API:
 *   openSubmenu({
 *     submenuId: 'mi-submenu',
 *     anchorEl: document.getElementById('btn'),
 *     placement: 'right',        // 'top' | 'bottom' | 'left' | 'right'
 *     align: 'start',            // 'start' | 'center' | 'end' (inicio/centro/fin)
 *     offset: 8,
 *     variant: 'dark',           // 'dark' (default) | 'light'
 *     title: 'Sección',
 *     showTitle: true,           // default: true
 *     options: [{ text, value, leftIcon? }],
 *     closeOnEscape: true,       // default: true
 *     closeOnClickOutside: true, // default: true
 *     zIndex: 10020,
 *     onClose: function () {}
 *   });
 *
 * Eventos:
 *   document.dispatchEvent(new CustomEvent('ubits-submenu-select', { detail: { value, text, anchor, submenu } }))
 *
 * Requiere: submenu.css (+ fontawesome-icons.css si hay iconos).
 */

(function () {
    'use strict';

    var submenuCounter = 0;

    function escapeHtml(text) {
        if (text == null) return '';
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function normalizePlacement(p) {
        return (p === 'top' || p === 'bottom' || p === 'left' || p === 'right') ? p : 'bottom';
    }

    function normalizeAlign(a) {
        return (a === 'start' || a === 'center' || a === 'end') ? a : 'center';
    }

    function alignToAxis(placement, align) {
        /* Devuelve alineación concreta según el eje */
        if (placement === 'top' || placement === 'bottom') {
            if (align === 'start') return 'left';
            if (align === 'end') return 'right';
            return 'center';
        }
        if (align === 'start') return 'top';
        if (align === 'end') return 'bottom';
        return 'center';
    }

    function detachSubmenuListeners(el) {
        if (!el) return;
        if (el._ubitsSubmenuResizeHandler) {
            window.removeEventListener('resize', el._ubitsSubmenuResizeHandler);
            window.removeEventListener('scroll', el._ubitsSubmenuResizeHandler, true);
            el._ubitsSubmenuResizeHandler = null;
        }
        if (el._ubitsSubmenuKeyHandler) {
            document.removeEventListener('keydown', el._ubitsSubmenuKeyHandler, true);
            el._ubitsSubmenuKeyHandler = null;
        }
        if (el._ubitsSubmenuOutsideHandler) {
            document.removeEventListener('mousedown', el._ubitsSubmenuOutsideHandler, true);
            el._ubitsSubmenuOutsideHandler = null;
        }
    }

    function positionSubmenuElement(el, anchorEl, placement, offset, align) {
        if (!el || !anchorEl || !anchorEl.getBoundingClientRect) return;
        placement = normalizePlacement(placement);
        align = normalizeAlign(align);

        var rect = anchorEl.getBoundingClientRect();
        var vw = window.innerWidth;
        var vh = window.innerHeight;
        var margin = 8;

        var pw = el.offsetWidth || 260;
        var ph = el.offsetHeight || 160;

        var axisAlign = alignToAxis(placement, align);
        var top;
        var left;
        var effectivePlacement = placement;

        function computeFor(p) {
            var a = alignToAxis(p, align);
            var t, l;
            if (p === 'top') {
                t = rect.top - offset - ph;
                if (a === 'left') l = rect.left;
                else if (a === 'center') l = rect.left + rect.width / 2 - pw / 2;
                else l = rect.right - pw;
                return { top: t, left: l };
            }
            if (p === 'bottom') {
                t = rect.bottom + offset;
                if (a === 'left') l = rect.left;
                else if (a === 'center') l = rect.left + rect.width / 2 - pw / 2;
                else l = rect.right - pw;
                return { top: t, left: l };
            }
            if (p === 'left') {
                l = rect.left - offset - pw;
                if (a === 'top') t = rect.top;
                else if (a === 'center') t = rect.top + rect.height / 2 - ph / 2;
                else t = rect.bottom - ph;
                return { top: t, left: l };
            }
            /* right */
            l = rect.right + offset;
            if (a === 'top') t = rect.top;
            else if (a === 'center') t = rect.top + rect.height / 2 - ph / 2;
            else t = rect.bottom - ph;
            return { top: t, left: l };
        }

        var base = computeFor(placement);
        top = base.top;
        left = base.left;

        /* Flip solo si se sale del viewport (respeta placement mientras quepa) */
        if (placement === 'top' && top < margin) {
            effectivePlacement = 'bottom';
            base = computeFor(effectivePlacement);
            top = base.top;
            left = base.left;
        } else if (placement === 'bottom' && top + ph > vh - margin) {
            effectivePlacement = 'top';
            base = computeFor(effectivePlacement);
            top = base.top;
            left = base.left;
        } else if (placement === 'left' && left < margin) {
            effectivePlacement = 'right';
            base = computeFor(effectivePlacement);
            top = base.top;
            left = base.left;
        } else if (placement === 'right' && left + pw > vw - margin) {
            effectivePlacement = 'left';
            base = computeFor(effectivePlacement);
            top = base.top;
            left = base.left;
        }

        /* Clamp final: nunca fuera del viewport */
        left = Math.max(margin, Math.min(left, vw - pw - margin));
        top = Math.max(margin, Math.min(top, vh - ph - margin));

        el.style.top = Math.round(top) + 'px';
        el.style.left = Math.round(left) + 'px';

        /* Metadata útil para debug / update */
        el.setAttribute('data-ubits-submenu-placement', effectivePlacement);
        el.setAttribute('data-ubits-submenu-align', String(axisAlign));
    }

    function buildOptionHtml(opt) {
        var text = opt && opt.text != null ? String(opt.text) : '';
        var value = opt && opt.value != null ? String(opt.value) : '';
        var leftIcon = opt && opt.leftIcon ? String(opt.leftIcon) : '';
        var left = leftIcon
            ? '<span class="ubits-submenu__option-left" aria-hidden="true"><i class="far fa-' + escapeHtml(leftIcon) + '"></i></span>'
            : '<span class="ubits-submenu__option-left" aria-hidden="true"></span>';
        return (
            '<button type="button" class="ubits-submenu__option" role="menuitem" data-value="' +
            escapeHtml(value) +
            '" data-text="' +
            escapeHtml(text) +
            '">' +
            left +
            '<span class="ubits-submenu__option-text ubits-body-sm-regular">' +
            escapeHtml(text) +
            '</span>' +
            '</button>'
        );
    }

    function openSubmenu(options) {
        options = options || {};

        var submenuId = options.submenuId || ('ubits-submenu-' + (++submenuCounter));
        var anchorEl = options.anchorEl || null;
        if (!anchorEl) return null;

        var placement = normalizePlacement(options.placement || 'right');
        var align = normalizeAlign(options.align || 'start');
        var offset = typeof options.offset === 'number' ? options.offset : 8;

        var variant = options.variant === 'light' ? 'light' : 'dark';
        var title = options.title != null ? String(options.title) : '';
        var showTitle = options.showTitle !== false;
        var zIndex = typeof options.zIndex === 'number' ? options.zIndex : 10020;

        var closeOnEscape = options.closeOnEscape !== false;
        var closeOnClickOutside = options.closeOnClickOutside !== false;
        var onClose = typeof options.onClose === 'function' ? options.onClose : null;

        var opts = options.options || [];

        /* Cierra uno existente con el mismo ID */
        closeSubmenu(submenuId);

        var el = document.createElement('div');
        el.id = submenuId;
        el.className = 'ubits-submenu' + (variant === 'light' ? ' ubits-submenu--light' : '');
        el.style.zIndex = String(zIndex);
        el._ubitsSubmenuAnchor = anchorEl;
        el._ubitsSubmenuPlacement = placement;
        el._ubitsSubmenuAlign = align;
        el._ubitsSubmenuOffset = offset;
        el._ubitsSubmenuOnClose = onClose;

        var titleBlock = (showTitle && title)
            ? '<div class="ubits-submenu__header"><p class="ubits-submenu__title ubits-body-md-bold" id="' + escapeHtml(submenuId) + '-title">' + escapeHtml(title) + '</p></div>'
            : '';

        var optionsHtml = (opts || []).map(buildOptionHtml).join('');
        el.innerHTML =
            '<div class="ubits-submenu__surface" role="menu" aria-labelledby="' +
            (showTitle && title ? escapeHtml(submenuId) + '-title' : '') +
            '">' +
            titleBlock +
            '<div class="ubits-submenu__options">' +
            optionsHtml +
            '</div>' +
            '</div>';

        document.body.appendChild(el);
        positionSubmenuElement(el, anchorEl, placement, offset, align);

        /* Click en opción */
        el.addEventListener('click', function (e) {
            var t = e.target;
            if (!t || !t.closest) return;
            var btn = t.closest('.ubits-submenu__option');
            if (!btn || !el.contains(btn)) return;
            e.preventDefault();
            e.stopPropagation();
            var value = btn.getAttribute('data-value') || '';
            var text = btn.getAttribute('data-text') || '';
            document.dispatchEvent(
                new CustomEvent('ubits-submenu-select', {
                    bubbles: true,
                    detail: { value: value, text: text, anchor: anchorEl, submenu: el }
                })
            );
            closeSubmenu(submenuId);
        });

        /* Reposicionar al hacer resize/scroll */
        var resizeHandler = function () {
            positionSubmenuElement(el, anchorEl, el._ubitsSubmenuPlacement, el._ubitsSubmenuOffset, el._ubitsSubmenuAlign);
        };
        el._ubitsSubmenuResizeHandler = resizeHandler;
        window.addEventListener('resize', resizeHandler);
        window.addEventListener('scroll', resizeHandler, true);

        if (closeOnEscape) {
            var keyHandler = function (e) {
                if (e.key === 'Escape') {
                    e.preventDefault();
                    closeSubmenu(submenuId);
                }
            };
            document.addEventListener('keydown', keyHandler, true);
            el._ubitsSubmenuKeyHandler = keyHandler;
        }

        if (closeOnClickOutside) {
            var outsideHandler = function (e) {
                if (el.contains(e.target)) return;
                if (anchorEl && anchorEl.contains(e.target)) return;
                closeSubmenu(submenuId);
            };
            setTimeout(function () {
                document.addEventListener('mousedown', outsideHandler, true);
            }, 0);
            el._ubitsSubmenuOutsideHandler = outsideHandler;
        }

        return el;
    }

    function closeSubmenu(submenuIdOrElement) {
        var el = typeof submenuIdOrElement === 'string'
            ? document.getElementById(submenuIdOrElement)
            : submenuIdOrElement;
        if (!el || !el.classList || !el.classList.contains('ubits-submenu')) return;
        var cb = el._ubitsSubmenuOnClose;
        detachSubmenuListeners(el);
        if (el.parentNode) el.parentNode.removeChild(el);
        if (typeof cb === 'function') {
            try { cb(); } catch (err) { /* ignore */ }
        }
    }

    function updateSubmenuPosition(submenuIdOrElement) {
        var el = typeof submenuIdOrElement === 'string'
            ? document.getElementById(submenuIdOrElement)
            : submenuIdOrElement;
        if (!el || !el.classList || !el.classList.contains('ubits-submenu')) return;
        var anchor = el._ubitsSubmenuAnchor;
        if (!anchor) return;
        positionSubmenuElement(el, anchor, el._ubitsSubmenuPlacement, el._ubitsSubmenuOffset, el._ubitsSubmenuAlign);
    }

    window.openSubmenu = openSubmenu;
    window.closeSubmenu = closeSubmenu;
    window.updateSubmenuPosition = updateSubmenuPosition;
})();

