/**
 * UBITS Popover — panel flotante con título, cuerpo y zona de acciones.
 * No incluye overlay de página completa ni spotlight (eso es responsabilidad de tours / otros patrones).
 *
 * Uso:
 *   openPopover({
 *     popoverId: 'mi-popover',
 *     anchorEl: document.getElementById('btn'), // opcional: sin ancla = centrado en viewport
 *     placement: 'bottom', // 'bottom' | 'top' | 'left' | 'right'
 *     align: 'center', // Con top/bottom: 'left' | 'center' | 'right'. Con left/right: 'top' | 'center' | 'bottom' (misma idea que Tooltip)
 *     offset: 8,
 *     title: 'Título',
 *     bodyHtml: '<p class="ubits-body-sm-regular ubits-popover__text">...</p>',
 *     bodyText: 'Texto plano (alternativa a bodyHtml; se escapa)',
 *     showCloseButton: true, // default: botón X en cabecera (arriba derecha)
 *     closeButtonTooltip: 'Cerrar', // tooltip del botón X
 *     actionsStartHtml: '', // opcional, columna izquierda (si necesitas contenido extra)
 *     actionsEndHtml: '<button class="ubits-button ...">OK</button>',
 *     titleRowHtml: '', // opcional: reemplaza el bloque de título por defecto (incluir id="[popoverId]-title" en el título si aplica)
 *     size: 'md', // 'sm' | 'md' | 'lg'
 *     closeOnEscape: true,
 *     closeOnClickOutside: true,
 *     zIndex: 10040,
 *     noArrow: false, // true = sin colita (como Tooltip noArrow)
 *     ariaModal: false, // true = aria-modal="true" (p. ej. Coachmark / product tour)
 *     onClose: function () {}
 *   });
 *   closePopover('mi-popover');
 *   updatePopoverPosition(document.getElementById('mi-popover')); // tras cambios de layout
 *
 * Notas de implementación:
 * - El listener de clic fuera se registra en setTimeout(0) para no cerrar con el mismo evento que abrió el popover.
 * - Para product tour con máscara y spotlight, usar el componente **Coachmark** (`coachmark.js` + `coachmark.css`), que compone este Popover por paso.
 * - La colita usa 9px de hueco como Tooltip; si el borde 1px del panel se nota junto a la punta, es el mismo trade-off que al añadir borde a tooltips con flecha.
 */

(function () {
    'use strict';

    var popoverCounter = 0;

    function escapeHtml(text) {
        if (text == null) return '';
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Alineación válida según lado (misma semántica que Tooltip: 12 combinaciones).
     * @param {string} placement
     * @param {string} [align]
     * @returns {string}
     */
    function normalizeAlign(placement, align) {
        if (placement === 'top' || placement === 'bottom') {
            if (align === 'left' || align === 'center' || align === 'right') return align;
            return 'center';
        }
        if (align === 'top' || align === 'center' || align === 'bottom') return align;
        return 'center';
    }

    var PLACEMENT_CLASS = ['top', 'bottom', 'left', 'right'];
    var ALIGN_CLASS = ['left', 'center', 'right', 'top', 'bottom'];

    function stripPopoverPlacementClasses(popoverEl) {
        if (!popoverEl) return;
        var i;
        for (i = 0; i < PLACEMENT_CLASS.length; i++) {
            popoverEl.classList.remove('ubits-popover--' + PLACEMENT_CLASS[i]);
        }
        for (i = 0; i < ALIGN_CLASS.length; i++) {
            popoverEl.classList.remove('ubits-popover--align-' + ALIGN_CLASS[i]);
        }
        popoverEl.classList.remove('ubits-popover--no-arrow');
    }

    /**
     * Clases de colita (misma convención que Tooltip: ubits-popover--{lado} + ubits-popover--align-{alineación}).
     */
    function syncPopoverArrowClasses(popoverEl, placement, align, showArrow) {
        stripPopoverPlacementClasses(popoverEl);
        if (!showArrow) {
            popoverEl.classList.add('ubits-popover--no-arrow');
            return;
        }
        popoverEl.classList.add('ubits-popover--' + placement);
        popoverEl.classList.add('ubits-popover--align-' + align);
    }

    /**
     * Posiciona el popover respecto al ancla. Incluye hueco para la colita (9px) como Tooltip.
     * Tras un flip por viewport, actualiza clases para que la flecha apunte bien.
     */
    function positionPopoverElement(popoverEl, anchorEl, placement, offset, align, showArrow) {
        if (!popoverEl || !anchorEl || !anchorEl.getBoundingClientRect) return;
        align = normalizeAlign(placement, align);
        var rect = anchorEl.getBoundingClientRect();
        var vw = window.innerWidth;
        var vh = window.innerHeight;
        var margin = 8;
        var arrowSize = showArrow ? 9 : 0;
        popoverEl.classList.remove('ubits-popover--centered');
        popoverEl.style.transform = '';

        var pw = popoverEl.offsetWidth || 280;
        var ph = popoverEl.offsetHeight || 120;

        var top;
        var left;
        var effectivePlacement = placement;

        if (placement === 'top') {
            top = rect.top - offset - ph - arrowSize;
            if (align === 'left') left = rect.left;
            else if (align === 'center') left = rect.left + rect.width / 2 - pw / 2;
            else left = rect.right - pw;
            if (top < margin) {
                effectivePlacement = 'bottom';
                top = rect.bottom + offset + arrowSize;
                if (align === 'left') left = rect.left;
                else if (align === 'center') left = rect.left + rect.width / 2 - pw / 2;
                else left = rect.right - pw;
            }
        } else if (placement === 'bottom') {
            top = rect.bottom + offset + arrowSize;
            if (align === 'left') left = rect.left;
            else if (align === 'center') left = rect.left + rect.width / 2 - pw / 2;
            else left = rect.right - pw;
            if (top + ph > vh - margin) {
                effectivePlacement = 'top';
                top = rect.top - offset - ph - arrowSize;
                if (align === 'left') left = rect.left;
                else if (align === 'center') left = rect.left + rect.width / 2 - pw / 2;
                else left = rect.right - pw;
            }
        } else if (placement === 'left') {
            left = rect.left - offset - pw - arrowSize;
            if (align === 'top') top = rect.top;
            else if (align === 'center') top = rect.top + rect.height / 2 - ph / 2;
            else top = rect.bottom - ph;
            if (left < margin) {
                effectivePlacement = 'right';
                left = rect.right + offset + arrowSize;
                if (align === 'top') top = rect.top;
                else if (align === 'center') top = rect.top + rect.height / 2 - ph / 2;
                else top = rect.bottom - ph;
            }
        } else {
            /* right */
            left = rect.right + offset + arrowSize;
            if (align === 'top') top = rect.top;
            else if (align === 'center') top = rect.top + rect.height / 2 - ph / 2;
            else top = rect.bottom - ph;
            if (left + pw > vw - margin) {
                effectivePlacement = 'left';
                left = rect.left - offset - pw - arrowSize;
                if (align === 'top') top = rect.top;
                else if (align === 'center') top = rect.top + rect.height / 2 - ph / 2;
                else top = rect.bottom - ph;
            }
        }

        left = Math.max(margin, Math.min(left, vw - pw - margin));
        top = Math.max(margin, Math.min(top, vh - ph - margin));

        popoverEl.style.top = Math.round(top) + 'px';
        popoverEl.style.left = Math.round(left) + 'px';

        syncPopoverArrowClasses(popoverEl, effectivePlacement, align, showArrow);
    }

    function centerPopoverInViewport(popoverEl) {
        if (!popoverEl) return;
        popoverEl.style.top = '';
        popoverEl.style.left = '';
        stripPopoverPlacementClasses(popoverEl);
        popoverEl.classList.add('ubits-popover--centered');
        popoverEl.classList.add('ubits-popover--no-arrow');
    }

    function detachPopoverListeners(popoverEl) {
        if (!popoverEl) return;
        if (popoverEl._ubitsPopoverResizeHandler) {
            window.removeEventListener('resize', popoverEl._ubitsPopoverResizeHandler);
            window.removeEventListener('scroll', popoverEl._ubitsPopoverResizeHandler, true);
            popoverEl._ubitsPopoverResizeHandler = null;
        }
        if (popoverEl._ubitsPopoverKeyHandler) {
            document.removeEventListener('keydown', popoverEl._ubitsPopoverKeyHandler, true);
            popoverEl._ubitsPopoverKeyHandler = null;
        }
        if (popoverEl._ubitsPopoverOutsideHandler) {
            document.removeEventListener('mousedown', popoverEl._ubitsPopoverOutsideHandler, true);
            popoverEl._ubitsPopoverOutsideHandler = null;
        }
    }

    /**
     * @param {Object} options
     * @returns {HTMLElement|null}
     */
    function openPopover(options) {
        options = options || {};
        var popoverId = options.popoverId || ('ubits-popover-' + (++popoverCounter));
        var anchorEl = options.anchorEl || null;
        var placement = options.placement || 'bottom';
        if (['bottom', 'top', 'left', 'right'].indexOf(placement) < 0) placement = 'bottom';
        var align = normalizeAlign(placement, options.align);
        var offset = typeof options.offset === 'number' ? options.offset : 8;
        var title = options.title != null ? String(options.title) : '';
        var titleRowHtml = options.titleRowHtml != null ? String(options.titleRowHtml) : '';
        var showCloseButton = options.showCloseButton !== false && !titleRowHtml;
        var closeButtonTooltip = options.closeButtonTooltip != null ? String(options.closeButtonTooltip) : 'Cerrar';
        var bodyHtml = options.bodyHtml != null ? String(options.bodyHtml) : '';
        var bodyText = options.bodyText != null ? String(options.bodyText) : '';
        if (!bodyHtml && bodyText) {
            bodyHtml = '<p class="ubits-body-sm-regular ubits-popover__text">' + escapeHtml(bodyText) + '</p>';
        }
        var actionsStartHtml = options.actionsStartHtml != null ? String(options.actionsStartHtml) : '';
        var actionsEndHtml = options.actionsEndHtml != null ? String(options.actionsEndHtml) : '';
        var size = options.size || 'md';
        var sizeClass = ['sm', 'md', 'lg'].indexOf(size) >= 0 ? (' ubits-popover--' + size) : ' ubits-popover--md';
        var closeOnEscape = options.closeOnEscape !== false;
        var closeOnClickOutside = options.closeOnClickOutside !== false;
        var zIndex = typeof options.zIndex === 'number' ? options.zIndex : 10040;
        var onClose = options.onClose || null;
        var ariaLabel = options.ariaLabel != null ? String(options.ariaLabel) : '';
        var showArrow = options.noArrow !== true && !!anchorEl;

        var existing = document.getElementById(popoverId);
        if (existing) {
            detachPopoverListeners(existing);
            if (existing.parentNode) existing.parentNode.removeChild(existing);
        }

        var el = document.createElement('div');
        el.id = popoverId;
        el.className = 'ubits-popover' + sizeClass;
        el.setAttribute('role', 'dialog');
        el.setAttribute('aria-modal', options.ariaModal === true ? 'true' : 'false');
        if (titleRowHtml || title) {
            el.setAttribute('aria-labelledby', popoverId + '-title');
        } else if (ariaLabel) {
            el.setAttribute('aria-label', ariaLabel);
        } else {
            el.setAttribute('aria-label', 'Panel');
        }
        el.style.zIndex = String(zIndex);

        var titleBlock = '';
        if (titleRowHtml) {
            titleBlock = titleRowHtml;
        } else if (title) {
            var headerClose = '';
            if (showCloseButton) {
                headerClose =
                    '<div class="ubits-popover__header-actions">' +
                    '<button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only ubits-popover__close-btn" aria-label="' + escapeHtml(closeButtonTooltip) + '" data-tooltip="' + escapeHtml(closeButtonTooltip) + '" data-tooltip-delay="1000" data-tooltip-position="top">' +
                    '<i class="far fa-times"></i>' +
                    '</button>' +
                    '</div>';
            }
            titleBlock =
                '<div class="ubits-popover__header-row">' +
                '<p class="ubits-body-md-semibold ubits-popover__title" id="' + popoverId + '-title">' + escapeHtml(title) + '</p>' +
                headerClose +
                '</div>';
        } else if (showCloseButton) {
            titleBlock =
                '<div class="ubits-popover__header-row ubits-popover__header-row--close-only">' +
                '<div class="ubits-popover__header-actions">' +
                '<button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only ubits-popover__close-btn" aria-label="' + escapeHtml(closeButtonTooltip) + '" data-tooltip="' + escapeHtml(closeButtonTooltip) + '" data-tooltip-delay="1000" data-tooltip-position="top">' +
                '<i class="far fa-times"></i>' +
                '</button>' +
                '</div>' +
                '</div>';
        }

        var actionsBlock = '';
        if (actionsStartHtml || actionsEndHtml) {
            actionsBlock =
                '<div class="ubits-popover__actions">' +
                '<div class="ubits-popover__actions-start">' + actionsStartHtml + '</div>' +
                '<div class="ubits-popover__actions-end">' + actionsEndHtml + '</div>' +
                '</div>';
        }

        var surfaceInner = titleBlock + bodyHtml + actionsBlock;
        var arrowHtml = showArrow ? '<div class="ubits-popover__arrow" aria-hidden="true"></div>' : '';
        el.innerHTML = '<div class="ubits-popover__surface">' + surfaceInner + arrowHtml + '</div>';

        document.body.appendChild(el);

        var closeBtn = el.querySelector('.ubits-popover__close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                closePopover(popoverId);
            });
            if (typeof window.initTooltip === 'function') {
                try {
                    window.initTooltip('#' + popoverId + ' .ubits-popover__close-btn');
                } catch (err) { /* ignore */ }
            }
        }

        el._ubitsPopoverAnchor = anchorEl;
        el._ubitsPopoverPlacement = placement;
        el._ubitsPopoverAlign = align;
        el._ubitsPopoverOffset = offset;
        el._ubitsPopoverShowArrow = showArrow;
        el._ubitsPopoverOnClose = onClose;

        function reposition() {
            if (anchorEl) {
                positionPopoverElement(el, anchorEl, placement, offset, el._ubitsPopoverAlign, el._ubitsPopoverShowArrow);
            } else {
                centerPopoverInViewport(el);
            }
        }

        reposition();
        requestAnimationFrame(function () {
            reposition();
        });

        var resizeHandler = function () {
            reposition();
        };
        window.addEventListener('resize', resizeHandler);
        window.addEventListener('scroll', resizeHandler, true);
        el._ubitsPopoverResizeHandler = resizeHandler;

        if (closeOnEscape) {
            var keyHandler = function (e) {
                if (e.key === 'Escape') {
                    e.preventDefault();
                    closePopover(popoverId);
                }
            };
            document.addEventListener('keydown', keyHandler, true);
            el._ubitsPopoverKeyHandler = keyHandler;
        }

        if (closeOnClickOutside) {
            var outsideHandler = function (e) {
                if (el.contains(e.target)) return;
                if (anchorEl && anchorEl.contains(e.target)) return;
                closePopover(popoverId);
            };
            setTimeout(function () {
                document.addEventListener('mousedown', outsideHandler, true);
            }, 0);
            el._ubitsPopoverOutsideHandler = outsideHandler;
        }

        return el;
    }

    /**
     * @param {string|HTMLElement} popoverIdOrElement
     */
    function closePopover(popoverIdOrElement) {
        var el = typeof popoverIdOrElement === 'string'
            ? document.getElementById(popoverIdOrElement)
            : popoverIdOrElement;
        if (!el || el.classList.contains('ubits-popover') === false) return;

        var cb = el._ubitsPopoverOnClose;
        detachPopoverListeners(el);
        if (el.parentNode) el.parentNode.removeChild(el);
        if (typeof cb === 'function') {
            try {
                cb();
            } catch (err) { /* ignore */ }
        }
    }

    /**
     * Recalcula posición si el ancla o el contenido cambió de tamaño.
     * @param {string|HTMLElement} popoverIdOrElement
     */
    function updatePopoverPosition(popoverIdOrElement) {
        var el = typeof popoverIdOrElement === 'string'
            ? document.getElementById(popoverIdOrElement)
            : popoverIdOrElement;
        if (!el || !el.classList.contains('ubits-popover')) return;
        var anchor = el._ubitsPopoverAnchor;
        var placement = el._ubitsPopoverPlacement || 'bottom';
        var align = normalizeAlign(placement, el._ubitsPopoverAlign);
        var offset = typeof el._ubitsPopoverOffset === 'number' ? el._ubitsPopoverOffset : 8;
        var showArrow = el._ubitsPopoverShowArrow === true;
        if (anchor) {
            positionPopoverElement(el, anchor, placement, offset, align, showArrow);
        } else {
            centerPopoverInViewport(el);
        }
    }

    window.openPopover = openPopover;
    window.closePopover = closePopover;
    window.updatePopoverPosition = updatePopoverPosition;
})();
