/**
 * UBITS Modal Component
 * Crea modales con estructura oficial: overlay, header (título + cerrar), body, footer.
 * Una sola fuente de verdad para el markup; evita desincronización entre páginas.
 *
 * Uso:
 *   openModal({
 *     overlayId: 'mi-modal',
 *     title: 'Título',
 *     bodyHtml: '<p>Contenido</p>',
 *     footerHtml: '<button class="ubits-button ubits-button--primary ubits-button--md"><span>Aceptar</span></button>',
 *     size: 'sm',  // 'xs' | 'sm' | 'md' | 'lg' | null (default 560px)
 *     closeOnOverlayClick: true,
 *     onClose: function() { }
 *   });
 *   closeModal('mi-modal');
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
     * Abre un modal con la estructura oficial UBITS.
     * @param {Object} options
     * @param {string} [options.overlayId] - ID del overlay. Si no se pasa, se genera uno.
     * @param {string} options.title - Título del header (se escapa HTML).
     * @param {string} options.bodyHtml - HTML del cuerpo del modal.
     * @param {string} [options.footerHtml] - HTML del pie (botones). Opcional.
     * @param {string} [options.size] - 'xs' | 'sm' | 'md' | 'lg'. Ancho del contenido.
     * @param {boolean} [options.closeOnOverlayClick=true] - Cerrar al clic fuera del contenido.
     * @param {function} [options.onClose] - Callback al cerrar el modal.
     */
    function openModal(options) {
        options = options || {};
        var overlayId = options.overlayId || ('ubits-modal-overlay-' + (++overlayCounter));
        var title = options.title != null ? String(options.title) : '';
        var bodyHtml = options.bodyHtml != null ? options.bodyHtml : '';
        var footerHtml = options.footerHtml != null ? options.footerHtml : '';
        var size = options.size || '';
        var closeOnOverlayClick = options.closeOnOverlayClick !== false;
        var onClose = options.onClose || null;

        var sizeClass = size && ['xs', 'sm', 'md', 'lg'].indexOf(size) >= 0
            ? ' ubits-modal-content--' + size
            : '';

        var overlay = document.getElementById(overlayId);
        if (overlay) {
            overlay.remove();
        }

        overlay = document.createElement('div');
        overlay.id = overlayId;
        overlay.className = 'ubits-modal-overlay';
        overlay.setAttribute('aria-hidden', 'false');
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-labelledby', overlayId + '-title');

        overlay.innerHTML =
            '<div class="ubits-modal-content' + sizeClass + '" onclick="event.stopPropagation();">' +
            '  <div class="ubits-modal-header">' +
            '    <span id="' + overlayId + '-title" class="ubits-modal-title ubits-body-md-bold">' + escapeHtml(title) + '</span>' +
            '    <button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only ubits-modal-close" aria-label="Cerrar">' +
            '      <i class="far fa-times"></i>' +
            '    </button>' +
            '  </div>' +
            '  <div class="ubits-modal-body">' + bodyHtml + '</div>' +
            (footerHtml ? ('  <div class="ubits-modal-footer">' + footerHtml + '</div>') : '') +
            '</div>';

        function close() {
            overlay.style.display = 'none';
            overlay.setAttribute('aria-hidden', 'true');
            if (typeof onClose === 'function') onClose();
        }

        overlay.querySelector('.ubits-modal-close').addEventListener('click', close);

        if (closeOnOverlayClick) {
            overlay.addEventListener('click', function (e) {
                if (e.target === overlay) close();
            });
        }

        overlay.style.display = 'flex';
        document.body.appendChild(overlay);
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
     * @param {string} [options.footerHtml] - HTML del pie. Opcional.
     * @param {string} [options.size] - 'xs' | 'sm' | 'md' | 'lg'.
     * @param {string} [options.contentId] - ID opcional del div .ubits-modal-content (para date-picker-modal, etc.).
     * @param {string} [options.titleId] - ID opcional del span del título (ej. reabrir-plan-title).
     * @param {string} [options.closeButtonId] - ID opcional del botón cerrar (ej. filtros-modal-close).
     * @param {string} [options.overlayClass] - Clases extra para el overlay (ej. date-picker-overlay).
     * @param {string} [options.contentClass] - Clases extra para el contenido (ej. date-picker-modal-content).
     * @param {string} [options.headerClass] - Clases extra para el header (ej. date-picker-modal-header).
     * @param {string} [options.bodyClass] - Clases extra para el body (ej. date-picker-modal-body).
     * @param {string} [options.footerClass] - Clases extra para el footer (ej. date-picker-modal-footer).
     * @returns {string} HTML del overlay completo (display:none; aria-hidden="true").
     */
    function getModalHtml(options) {
        options = options || {};
        var overlayId = options.overlayId || '';
        var title = options.title != null ? String(options.title) : '';
        var bodyHtml = options.bodyHtml != null ? options.bodyHtml : '';
        var footerHtml = options.footerHtml != null ? options.footerHtml : '';
        var size = options.size || '';
        var contentId = options.contentId || '';
        var titleId = options.titleId || '';
        var closeButtonId = options.closeButtonId || '';
        var overlayClass = options.overlayClass || '';
        var contentClass = options.contentClass || '';
        var headerClass = options.headerClass || '';
        var bodyClass = options.bodyClass || '';
        var footerClass = options.footerClass || '';

        var sizeClass = size && ['xs', 'sm', 'md', 'lg'].indexOf(size) >= 0
            ? ' ubits-modal-content--' + size
            : '';

        var contentIdAttr = contentId ? (' id="' + contentId + '"') : '';
        var titleIdAttr = titleId ? (' id="' + titleId + '"') : '';
        var closeIdAttr = closeButtonId ? (' id="' + closeButtonId + '"') : '';
        var overlayClassAttr = overlayClass ? (' ' + overlayClass) : '';
        var contentClassAttr = contentClass ? (' ' + contentClass) : '';
        var headerClassAttr = headerClass ? (' ' + headerClass) : '';
        var bodyClassAttr = bodyClass ? (' ' + bodyClass) : '';
        var footerClassAttr = footerClass ? (' ' + footerClass) : '';

        return '<div class="ubits-modal-overlay' + overlayClassAttr + '" id="' + overlayId + '" style="display: none;" aria-hidden="true">' +
            '<div class="ubits-modal-content' + sizeClass + contentClassAttr + '"' + contentIdAttr + ' onclick="event.stopPropagation();">' +
            '<div class="ubits-modal-header' + headerClassAttr + '">' +
            '<span class="ubits-modal-title ubits-body-md-bold"' + titleIdAttr + '>' + escapeHtml(title) + '</span>' +
            '<button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only"' + closeIdAttr + ' aria-label="Cerrar">' +
            '<i class="far fa-times"></i>' +
            '</button>' +
            '</div>' +
            '<div class="ubits-modal-body' + bodyClassAttr + '">' + bodyHtml + '</div>' +
            (footerHtml ? ('<div class="ubits-modal-footer' + footerClassAttr + '">' + footerHtml + '</div>') : '') +
            '</div>' +
            '</div>';
    }

    window.openModal = openModal;
    window.closeModal = closeModal;
    window.showModal = showModal;
    window.hideModal = hideModal;
    window.getModalHtml = getModalHtml;
})();
