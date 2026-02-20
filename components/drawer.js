/**
 * UBITS Drawer Component
 * Panel lateral que se abre desde la derecha. Estructura: overlay, header (título + cerrar), body, footer.
 * Misma API conceptual que el Modal; uso típico: filtros, formularios laterales.
 *
 * Uso:
 *   openDrawer({ overlayId: 'mi-drawer', title: 'Filtros', bodyHtml: '...', footerHtml: '...', size: 'md' });
 *   closeDrawer('mi-drawer');
 *   getDrawerHtml({ overlayId, title, bodyHtml, footerHtml?, size?, closeButtonId? }) para inyectar en el DOM.
 *
 * Bugs conocidos / implementación: Ver documentación técnica en documentacion/componentes/drawer.html.
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
     * Abre un drawer (panel lateral derecho) con la estructura oficial UBITS.
     * @param {Object} options
     * @param {string} [options.overlayId] - ID del overlay. Si no se pasa, se genera uno.
     * @param {string} options.title - Título del header (se escapa HTML).
     * @param {string} options.bodyHtml - HTML del cuerpo.
     * @param {string} [options.footerHtml] - HTML del pie (botones). Opcional.
     * @param {string} [options.size] - 'xs' | 'sm' | 'md' | 'lg'. Ancho del panel.
     * @param {boolean} [options.closeOnOverlayClick=true] - Cerrar al clic fuera del contenido.
     * @param {function} [options.onClose] - Callback al cerrar.
     */
    function openDrawer(options) {
        options = options || {};
        var overlayId = options.overlayId || ('ubits-drawer-overlay-' + (++overlayCounter));
        var title = options.title != null ? String(options.title) : '';
        var bodyHtml = options.bodyHtml != null ? options.bodyHtml : '';
        var footerHtml = options.footerHtml != null ? options.footerHtml : '';
        var size = options.size || 'md';
        var subtitle = options.subtitle != null ? String(options.subtitle) : '';
        var closeOnOverlayClick = options.closeOnOverlayClick !== false;
        var onClose = options.onClose || null;

        var sizeClass = size && ['xs', 'sm', 'md', 'lg'].indexOf(size) >= 0
            ? ' ubits-drawer-content--' + size
            : ' ubits-drawer-content--md';

        var overlay = document.getElementById(overlayId);
        if (overlay) {
            overlay.remove();
        }

        overlay = document.createElement('div');
        overlay.id = overlayId;
        overlay.className = 'ubits-drawer-overlay';
        overlay.setAttribute('aria-hidden', 'false');
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-labelledby', overlayId + '-title');

        var headerContent = '<div class="ubits-drawer-header__text">' +
            '    <span id="' + overlayId + '-title" class="ubits-drawer-title ubits-body-md-bold">' + escapeHtml(title) + '</span>' +
            (subtitle ? ('    <p class="ubits-drawer-subtitle ubits-body-sm-regular">' + escapeHtml(subtitle) + '</p>') : '') +
            '  </div>' +
            '  <button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only ubits-drawer-close" aria-label="Cerrar">' +
            '    <i class="far fa-times"></i>' +
            '  </button>';
        overlay.innerHTML =
            '<div class="ubits-drawer-content' + sizeClass + '" onclick="event.stopPropagation();">' +
            '  <div class="ubits-drawer-header">' + headerContent + '</div>' +
            '  <div class="ubits-drawer-body">' + bodyHtml + '</div>' +
            (footerHtml ? ('  <div class="ubits-drawer-footer">' + footerHtml + '</div>') : '') +
            '</div>';

        function close() {
            overlay.style.display = 'none';
            overlay.setAttribute('aria-hidden', 'true');
            if (typeof onClose === 'function') onClose();
        }

        overlay.querySelector('.ubits-drawer-close').addEventListener('click', close);

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
     * Cierra un drawer por ID o por referencia al elemento overlay.
     * @param {string|HTMLElement} overlayIdOrElement
     */
    function closeDrawer(overlayIdOrElement) {
        var overlay = typeof overlayIdOrElement === 'string'
            ? document.getElementById(overlayIdOrElement)
            : overlayIdOrElement;
        if (overlay && overlay.classList.contains('ubits-drawer-overlay')) {
            overlay.style.display = 'none';
            overlay.setAttribute('aria-hidden', 'true');
        }
    }

    /**
     * Muestra un overlay de drawer que ya existe en el DOM.
     * @param {string} overlayId
     */
    function showDrawer(overlayId) {
        var overlay = document.getElementById(overlayId);
        if (overlay) {
            overlay.style.display = 'flex';
            overlay.setAttribute('aria-hidden', 'false');
        }
    }

    /**
     * Oculta un drawer por ID.
     * @param {string} overlayId
     */
    function hideDrawer(overlayId) {
        closeDrawer(overlayId);
    }

    /**
     * Devuelve el HTML del drawer para inyectar en el DOM (p. ej. en un contenedor).
     * Misma estructura que openDrawer. Incluir display:none y aria-hidden="true" por defecto.
     * @param {Object} options
     * @param {string} options.overlayId - ID del overlay.
     * @param {string} options.title - Título del header (se escapa HTML).
     * @param {string} options.bodyHtml - HTML del cuerpo.
     * @param {string} [options.footerHtml] - HTML del pie. Opcional.
     * @param {string} [options.size] - 'xs' | 'sm' | 'md' | 'lg'. Por defecto 'md'.
     * @param {string} [options.contentId] - ID opcional del div .ubits-drawer-content.
     * @param {string} [options.titleId] - ID opcional del span del título.
     * @param {string} [options.closeButtonId] - ID opcional del botón cerrar.
     * @returns {string} HTML del overlay completo.
     */
    function getDrawerHtml(options) {
        options = options || {};
        var overlayId = options.overlayId || '';
        var title = options.title != null ? String(options.title) : '';
        var subtitle = options.subtitle != null ? String(options.subtitle) : '';
        var bodyHtml = options.bodyHtml != null ? options.bodyHtml : '';
        var footerHtml = options.footerHtml != null ? options.footerHtml : '';
        var size = options.size && ['xs', 'sm', 'md', 'lg'].indexOf(options.size) >= 0 ? options.size : 'md';
        var contentId = options.contentId || '';
        var titleId = options.titleId || '';
        var closeButtonId = options.closeButtonId || '';

        var sizeClass = ' ubits-drawer-content--' + size;
        var contentIdAttr = contentId ? (' id="' + contentId + '"') : '';
        var titleIdAttr = titleId ? (' id="' + titleId + '"') : '';
        var closeIdAttr = closeButtonId ? (' id="' + closeButtonId + '"') : '';
        var headerContent = '<div class="ubits-drawer-header__text">' +
            '<span class="ubits-drawer-title ubits-body-md-bold"' + titleIdAttr + '>' + escapeHtml(title) + '</span>' +
            (subtitle ? ('<p class="ubits-drawer-subtitle ubits-body-sm-regular">' + escapeHtml(subtitle) + '</p>') : '') +
            '</div>' +
            '<button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only"' + closeIdAttr + ' aria-label="Cerrar">' +
            '<i class="far fa-times"></i>' +
            '</button>';

        return '<div class="ubits-drawer-overlay" id="' + overlayId + '" style="display: none;" aria-hidden="true">' +
            '<div class="ubits-drawer-content' + sizeClass + '"' + contentIdAttr + ' onclick="event.stopPropagation();">' +
            '<div class="ubits-drawer-header">' + headerContent + '</div>' +
            '<div class="ubits-drawer-body">' + bodyHtml + '</div>' +
            (footerHtml ? ('<div class="ubits-drawer-footer">' + footerHtml + '</div>') : '') +
            '</div>' +
            '</div>';
    }

    window.openDrawer = openDrawer;
    window.closeDrawer = closeDrawer;
    window.showDrawer = showDrawer;
    window.hideDrawer = hideDrawer;
    window.getDrawerHtml = getDrawerHtml;
})();
