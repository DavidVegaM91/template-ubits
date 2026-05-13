/**
 * UBITS Modal Component
 * Crea modales con estructura oficial: overlay, header (título + cerrar), body, footer.
 * Una sola fuente de verdad para el markup; evita desincronización entre páginas.
 *
 * Footer: por defecto solo zona derecha (primary + secondary). Opcionalmente footerTertiary
 * para un botón terciario a la izquierda.
 *
 * Uso:
 *   openModal({
 *     overlayId: 'mi-modal',
 *     title: 'Título',
 *     bodyHtml: '<p>Contenido</p>',
 *     footerHtml: '<button class="ubits-button ubits-button--secondary ubits-button--md">Cancelar</button><button class="ubits-button ubits-button--primary ubits-button--md">Aceptar</button>',
 *     footerTertiary: { text: 'Eliminar', onClick: function() { } },  // opcional: botón a la izquierda
 *     size: 'sm',  // 'xs' | 'sm' | 'md' | 'lg' | null (default 560px)
 *     closeOnOverlayClick: true,
 *     onClose: function() { }
 *   });
 *
 * Variante IA (tokens + fondo con orbes):
 *   openModal({
 *     overlayId: 'mi-modal-ia',
 *     title: 'Generar con IA',
 *     bodyHtml: '...',
 *     variant: 'ia',
 *     iaTokensRemaining: 42,
 *     iaTokensBadgeId: 'mi-modal-ia-tokens-badge',  // opcional; por defecto overlayId + '-tokens-badge'
 *     iaTokensTooltip: 'Número de tokens restantes.'  // opcional
 *   });
 *   closeModal('mi-modal');
 *
 * Variante promo (anuncios / nuevas funcionalidades, sin cabecera ni pie ni botón X):
 *   Cierre: clic fuera (closeOnOverlayClick), Escape, o botones en bodyHtml.
 *   openModal({
 *     overlayId: 'promo-novedades',
 *     variant: 'promo',
 *     size: 'sm',   // solo 'xs' | 'sm' (cualquier otro se trata como 'sm')
 *     title: 'Nuevas funciones con IA',  // no se muestra; sirve de aria-label si no pasas promoAriaLabel
 *     promoAriaLabel: 'Nuevas funciones con IA',  // opcional; aria-label del diálogo
 *     bodyHtml:
 *       '<div class="ubits-modal-promo-media"><img src="..." alt="" /></div>' +
 *       '<div class="ubits-modal-promo-copy">' +
 *       '<p class="ubits-body-lg-semibold ubits-modal-promo-title" id="promo-novedades-heading">Título</p>' +
 *       '<p class="ubits-body-sm-regular">Descripción.</p>' +
 *       '<button class="ubits-button ubits-button--primary ubits-button--md" type="button"><span>CTA</span></button>' +
 *       '</div>',
 *     closeOnOverlayClick: true
 *   });
 */

(function () {
    'use strict';

    var overlayCounter = 0;

    function escapeHtml(text) {
        if (text == null) return '';
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Markup del badge de tokens en header (variante IA). Mismo orden que el panel IA:
     * icono moneda → número → icono info.
     * Requiere badge-tag.css y fontawesome-icons.css en la página.
     */
    function buildIaTokensBadgeHtml(overlayId, tokensValue, badgeIdOpt, tooltipText) {
        var id = badgeIdOpt || (overlayId + '-tokens-badge');
        var tip = tooltipText != null ? String(tooltipText) : 'Número de tokens restantes.';
        var n = tokensValue != null && tokensValue !== '' ? String(tokensValue) : '0';
        var aria = n + ' tokens restantes';
        return '<span id="' + id + '" class="ubits-badge-tag ubits-badge-tag--outlined ubits-badge-tag--ia ubits-badge-tag--xs" tabindex="0" ' +
            'data-tooltip="' + escapeHtml(tip) + '" data-tooltip-delay="0" data-tooltip-tap-toggle="" ' +
            'aria-label="' + escapeHtml(aria) + '">' +
            '<span class="ubits-badge-tag__token-cost" aria-hidden="true">' +
            '<i class="far fa-coin-vertical"></i>' +
            '<span class="ubits-badge-tag__token-number">' + escapeHtml(n) + '</span>' +
            '<span class="ubits-ia-tokens-badge-info" aria-hidden="true"><i class="far fa-info-circle"></i></span>' +
            '</span></span>';
    }

    /**
     * Promo: sin barra de título ni botón cerrar; solo cuerpo (imagen + bloque con padding vía clases utilitarias).
     * Cierre: clic fuera (si closeOnOverlayClick), tecla Escape, o botones en bodyHtml.
     */
    function buildPromoModalInnerHtml(overlayId, bodyHtml) {
        return (
            '<div class="ubits-modal-promo">' +
            '  <div class="ubits-modal-body ubits-modal-body--promo">' + (bodyHtml != null ? bodyHtml : '') + '</div>' +
            '</div>'
        );
    }

    function buildModalHeaderHtml(overlayId, title, options) {
        if (options && options.variant === 'promo') {
            return '';
        }
        var isIa = options && options.variant === 'ia';
        if (!isIa) {
            return (
                '  <div class="ubits-modal-header">' +
                '    <span id="' + overlayId + '-title" class="ubits-modal-title ubits-body-md-bold">' + escapeHtml(title) + '</span>' +
                '    <button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only ubits-modal-close" aria-label="Cerrar">' +
                '      <i class="far fa-times"></i>' +
                '    </button>' +
                '  </div>'
            );
        }
        var badge = '';
        if (options.iaTokensRemaining != null && options.iaTokensRemaining !== '') {
            badge = buildIaTokensBadgeHtml(
                overlayId,
                options.iaTokensRemaining,
                options.iaTokensBadgeId,
                options.iaTokensTooltip
            );
        }
        return (
            '  <div class="ubits-modal-header ubits-modal-header--ia">' +
            '    <span id="' + overlayId + '-title" class="ubits-modal-title ubits-body-md-bold">' + escapeHtml(title) + '</span>' +
            '    <div class="ubits-modal-header__actions">' +
            badge +
            '      <button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only ubits-modal-close" aria-label="Cerrar">' +
            '        <i class="far fa-times"></i>' +
            '      </button>' +
            '    </div>' +
            '  </div>'
        );
    }

    function maybeInitIaTokensTooltip(overlayId, options) {
        if (!options || options.variant !== 'ia') return;
        var bid = options.iaTokensBadgeId || (overlayId + '-tokens-badge');
        if (!document.getElementById(bid)) return;
        if (typeof window.initTooltip === 'function') {
            window.initTooltip('#' + bid);
        }
    }

    /**
     * Abre un modal con la estructura oficial UBITS.
     * @param {Object} options
     * @param {string} [options.overlayId] - ID del overlay. Si no se pasa, se genera uno.
     * @param {string} options.title - Título del header (se escapa HTML).
     * @param {string} options.bodyHtml - HTML del cuerpo del modal.
     * @param {string} [options.footerHtml] - HTML del pie (botones a la derecha: secundario + primario). Opcional.
     * @param {Object} [options.footerTertiary] - Botón terciario a la izquierda. { text: string, onClick: function }. Opcional.
     * @param {string} [options.size] - 'xs' | 'sm' | 'md' | 'lg'. Ancho del contenido.
     * @param {boolean} [options.closeOnOverlayClick=true] - Cerrar al clic fuera del contenido.
     * @param {function} [options.onClose] - Callback al cerrar el modal.
     * @param {string} [options.variant] - 'ia' para modal con fondo orbes + header con badge de tokens opcional. 'promo' para modal sin cabecera ni pie ni botón X (cierre: overlay, Escape, CTA en body); tamaños solo xs | sm.
     * @param {number|string} [options.iaTokensRemaining] - Valor mostrado en el badge (omitir para no mostrar badge).
     * @param {string} [options.iaTokensBadgeId] - ID del span badge (sync desde tu página).
     * @param {string} [options.iaTokensTooltip] - Texto data-tooltip del badge.
     * @param {string} [options.promoAriaLabel] - Con variant 'promo': aria-label del diálogo (si falta, se usa title).
     */
    function openModal(options) {
        options = options || {};
        var overlayId = options.overlayId || ('ubits-modal-overlay-' + (++overlayCounter));
        var title = options.title != null ? String(options.title) : '';
        var bodyHtml = options.bodyHtml != null ? options.bodyHtml : '';
        var footerHtml = options.footerHtml != null ? options.footerHtml : '';
        var footerTertiary = options.footerTertiary || null;
        var size = options.size || '';
        var closeOnOverlayClick = options.closeOnOverlayClick !== false;
        var onClose = options.onClose || null;

        var isPromo = options.variant === 'promo';
        var promoSize = isPromo && (size === 'xs' || size === 'sm') ? size : (isPromo ? 'sm' : null);

        var sizeClass = '';
        if (isPromo) {
            sizeClass = ' ubits-modal-content--' + promoSize;
        } else if (size && ['xs', 'sm', 'md', 'lg'].indexOf(size) >= 0) {
            sizeClass = ' ubits-modal-content--' + size;
        }

        var contentIaClass = options.variant === 'ia' ? ' ubits-modal-content--ia' : '';
        var contentPromoClass = isPromo ? ' ubits-modal-content--promo' : '';

        var         overlay = document.getElementById(overlayId);
        if (overlay) {
            if (overlay._ubitsModalPromoEscape) {
                document.removeEventListener('keydown', overlay._ubitsModalPromoEscape);
                overlay._ubitsModalPromoEscape = null;
            }
            overlay.remove();
        }

        overlay = document.createElement('div');
        overlay.id = overlayId;
        overlay.className = 'ubits-modal-overlay';
        overlay.setAttribute('aria-hidden', 'false');
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');

        if (isPromo) {
            var promoLabel = options.promoAriaLabel != null && String(options.promoAriaLabel).trim()
                ? String(options.promoAriaLabel).trim()
                : (title ? title.trim() : '');
            if (!promoLabel) promoLabel = 'Anuncio';
            overlay.setAttribute('aria-label', promoLabel);
        } else {
            overlay.setAttribute('aria-labelledby', overlayId + '-title');
        }

        var innerContent;
        if (isPromo) {
            innerContent =
                '<div class="ubits-modal-content' + sizeClass + contentPromoClass + '" onclick="event.stopPropagation();">' +
                buildPromoModalInnerHtml(overlayId, bodyHtml) +
                '</div>';
        } else {
            innerContent =
                '<div class="ubits-modal-content' + sizeClass + contentIaClass + '" onclick="event.stopPropagation();">' +
                buildModalHeaderHtml(overlayId, title, options) +
                '  <div class="ubits-modal-body">' + bodyHtml + '</div>' +
                (footerHtml ? ('  <div class="ubits-modal-footer">' +
                    '<div class="ubits-modal-footer__left">' +
                    (footerTertiary ? ('<button type="button" class="ubits-button ubits-button--tertiary ubits-button--md" id="' + overlayId + '-footer-tertiary"><span>' + escapeHtml(footerTertiary.text || '') + '</span></button>') : '') +
                    '</div>' +
                    '<div class="ubits-modal-footer__right">' + footerHtml + '</div>' +
                    '</div>') : '') +
                '</div>';
        }

        overlay.innerHTML = innerContent;

        function close() {
            if (overlay._ubitsModalPromoEscape) {
                document.removeEventListener('keydown', overlay._ubitsModalPromoEscape);
                overlay._ubitsModalPromoEscape = null;
            }
            overlay.style.display = 'none';
            overlay.setAttribute('aria-hidden', 'true');
            if (typeof onClose === 'function') onClose();
        }

        var closeBtn = overlay.querySelector('.ubits-modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', close);
        }

        if (isPromo) {
            overlay._ubitsModalPromoEscape = function (e) {
                if (e.key !== 'Escape') return;
                e.preventDefault();
                close();
            };
            document.addEventListener('keydown', overlay._ubitsModalPromoEscape);
        }

        if (!isPromo && footerTertiary && footerTertiary.onClick && typeof footerTertiary.onClick === 'function') {
            var tertiaryBtn = overlay.querySelector('#' + overlayId + '-footer-tertiary');
            if (tertiaryBtn) tertiaryBtn.addEventListener('click', footerTertiary.onClick);
        }

        if (closeOnOverlayClick) {
            overlay.addEventListener('click', function (e) {
                if (e.target === overlay) close();
            });
        }

        overlay.style.display = 'flex';
        document.body.appendChild(overlay);
        maybeInitIaTokensTooltip(overlayId, options);
        return overlay;
    }

    /**
     * Cierra un modal por ID o por referencia al elemento overlay.
     * @param {string|HTMLElement} overlayIdOrElement
     */
    function closeModal(overlayIdOrElement) {
        var overlay = typeof overlayIdOrElement === 'string'
            ? document.getElementById(overlayIdOrElement)
            : overlayIdOrElement;
        if (overlay && overlay.classList.contains('ubits-modal-overlay')) {
            if (overlay._ubitsModalPromoEscape) {
                document.removeEventListener('keydown', overlay._ubitsModalPromoEscape);
                overlay._ubitsModalPromoEscape = null;
            }
            overlay.style.display = 'none';
            overlay.setAttribute('aria-hidden', 'true');
        }
    }

    /**
     * Muestra un overlay que ya existe en el DOM (p. ej. modal hardcodeado en el HTML).
     * Útil para páginas que prefieren definir el modal en el HTML pero quieren mostrar/ocultar por JS.
     * @param {string} overlayId
     */
    function showModal(overlayId) {
        var overlay = document.getElementById(overlayId);
        if (overlay) {
            overlay.style.display = 'flex';
            overlay.setAttribute('aria-hidden', 'false');
        }
    }

    /**
     * Oculta un overlay por ID.
     * @param {string} overlayId
     */
    function hideModal(overlayId) {
        closeModal(overlayId);
    }

    /**
     * Devuelve el HTML del modal (misma estructura que openModal). Fuente de verdad para inyectar
     * modales en el DOM sin abrirlos (p. ej. para que la lógica existente los muestre/oculte por ID).
     * @param {Object} options
     * @param {string} options.overlayId - ID del overlay.
     * @param {string} options.title - Título del header (se escapa HTML).
     * @param {string} options.bodyHtml - HTML del cuerpo.
     * @param {string} [options.footerHtml] - HTML del pie (botones derecha). Opcional.
     * @param {Object} [options.footerTertiary] - Botón terciario izquierda. { text: string }. Opcional (onClick se asocia por id en la página).
     * @param {string} [options.size] - 'xs' | 'sm' | 'md' | 'lg'.
     * @param {string} [options.contentId] - ID opcional del div .ubits-modal-content (para date-picker-modal, etc.).
     * @param {string} [options.titleId] - ID opcional del span del título (ej. reabrir-plan-title).
     * @param {string} [options.closeButtonId] - ID opcional del botón cerrar (ej. filtros-modal-close).
     * @param {string} [options.overlayClass] - Clases extra para el overlay (ej. date-picker-overlay).
     * @param {string} [options.contentClass] - Clases extra para el contenido (ej. date-picker-modal-content).
     * @param {string} [options.headerClass] - Clases extra para el header (ej. date-picker-modal-header).
     * @param {string} [options.bodyClass] - Clases extra para el body (ej. date-picker-modal-body).
     * @param {string} [options.footerClass] - Clases extra para el footer (ej. date-picker-modal-footer).
     * @param {string} [options.variant] - 'ia' | 'promo' (promo: sin header/footer ni X; size solo xs|sm; cierre vía overlay/Escape/CTA).
     * @param {number|string} [options.iaTokensRemaining]
     * @param {string} [options.iaTokensBadgeId]
     * @param {string} [options.iaTokensTooltip]
     * @param {string} [options.promoAriaLabel]
     * @returns {string} HTML del overlay completo (display:none; aria-hidden="true").
     */
    function getModalHtml(options) {
        options = options || {};
        var overlayId = options.overlayId || '';
        var title = options.title != null ? String(options.title) : '';
        var bodyHtml = options.bodyHtml != null ? options.bodyHtml : '';
        var footerHtml = options.footerHtml != null ? options.footerHtml : '';
        var footerTertiary = options.footerTertiary || null;
        var size = options.size || '';
        var contentId = options.contentId || '';
        var titleId = options.titleId || '';
        var closeButtonId = options.closeButtonId || '';
        var overlayClass = options.overlayClass || '';
        var contentClass = options.contentClass || '';
        var headerClass = options.headerClass || '';
        var bodyClass = options.bodyClass || '';
        var footerClass = options.footerClass || '';

        var overlayClassAttr = overlayClass ? (' ' + overlayClass) : '';
        var contentClassAttr = options.contentClass ? (' ' + options.contentClass) : '';
        var contentIdAttr = contentId ? (' id="' + contentId + '"') : '';

        if (options.variant === 'promo') {
            var pSize = size === 'xs' || size === 'sm' ? size : 'sm';
            var pLabel = options.promoAriaLabel != null && String(options.promoAriaLabel).trim()
                ? String(options.promoAriaLabel).trim()
                : (title ? title.trim() : '');
            if (!pLabel) pLabel = 'Anuncio';
            return '<div class="ubits-modal-overlay' + overlayClassAttr + '" id="' + overlayId + '" style="display: none;" aria-hidden="true" role="dialog" aria-modal="true" aria-label="' + escapeHtml(pLabel) + '">' +
                '<div class="ubits-modal-content ubits-modal-content--' + pSize + ' ubits-modal-content--promo' + contentClassAttr + '"' + contentIdAttr + ' onclick="event.stopPropagation();">' +
                buildPromoModalInnerHtml(overlayId, bodyHtml) +
                '</div></div>';
        }

        var sizeClass = size && ['xs', 'sm', 'md', 'lg'].indexOf(size) >= 0
            ? ' ubits-modal-content--' + size
            : '';

        var contentIaClass = options.variant === 'ia' ? ' ubits-modal-content--ia' : '';

        var titleSpanId = titleId || (options.variant === 'ia' && overlayId ? overlayId + '-title' : '');
        var titleIdAttr = titleSpanId ? (' id="' + titleSpanId + '"') : '';
        var closeIdAttr = closeButtonId ? (' id="' + closeButtonId + '"') : '';
        contentClassAttr = contentClass ? (' ' + contentClass) : '';
        var headerClassAttr = headerClass ? (' ' + headerClass) : '';
        var bodyClassAttr = bodyClass ? (' ' + bodyClass) : '';
        var footerClassAttr = footerClass ? (' ' + footerClass) : '';

        var headerInner;
        if (options.variant === 'ia') {
            var badge = '';
            if (options.iaTokensRemaining != null && options.iaTokensRemaining !== '') {
                badge = buildIaTokensBadgeHtml(
                    overlayId,
                    options.iaTokensRemaining,
                    options.iaTokensBadgeId,
                    options.iaTokensTooltip
                );
            }
            headerInner =
                '<div class="ubits-modal-header ubits-modal-header--ia' + headerClassAttr + '">' +
                '<span class="ubits-modal-title ubits-body-md-bold"' + titleIdAttr + '>' + escapeHtml(title) + '</span>' +
                '<div class="ubits-modal-header__actions">' +
                badge +
                '<button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only ubits-modal-close"' + closeIdAttr + ' aria-label="Cerrar">' +
                '<i class="far fa-times"></i></button>' +
                '</div></div>';
        } else {
            headerInner =
                '<div class="ubits-modal-header' + headerClassAttr + '">' +
                '<span class="ubits-modal-title ubits-body-md-bold"' + titleIdAttr + '>' + escapeHtml(title) + '</span>' +
                '<button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only ubits-modal-close"' + closeIdAttr + ' aria-label="Cerrar">' +
                '<i class="far fa-times"></i>' +
                '</button>' +
                '</div>';
        }

        return '<div class="ubits-modal-overlay' + overlayClassAttr + '" id="' + overlayId + '" style="display: none;" aria-hidden="true">' +
            '<div class="ubits-modal-content' + sizeClass + contentIaClass + contentClassAttr + '"' + contentIdAttr + ' onclick="event.stopPropagation();">' +
            headerInner +
            '<div class="ubits-modal-body' + bodyClassAttr + '">' + bodyHtml + '</div>' +
            (footerHtml ? ('<div class="ubits-modal-footer' + footerClassAttr + '">' +
            '<div class="ubits-modal-footer__left">' +
            (footerTertiary ? ('<button type="button" class="ubits-button ubits-button--tertiary ubits-button--md" id="' + overlayId + '-footer-tertiary"><span>' + escapeHtml(footerTertiary.text || '') + '</span></button>') : '') +
            '</div>' +
            '<div class="ubits-modal-footer__right">' + footerHtml + '</div>' +
            '</div>') : '') +
            '</div>' +
            '</div>';
    }

    window.openModal = openModal;
    window.closeModal = closeModal;
    window.showModal = showModal;
    window.hideModal = hideModal;
    window.getModalHtml = getModalHtml;
})();
