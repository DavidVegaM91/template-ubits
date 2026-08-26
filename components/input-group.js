/**
 * UBITS Input Group — borde compartido + addons + token readonly.
 * Paridad React UbitsInputGroup / ReUI input-group P0.
 */
(function (global) {
    'use strict';

    function escapeHtml(text) {
        return String(text == null ? '' : text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function copyText(value) {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
            void navigator.clipboard.writeText(value).catch(function () { /* noop */ });
        }
    }

    /**
     * Token enmascarado con copy + reveal.
     * @param {Object} opts
     * @param {string} opts.containerId
     * @param {string} opts.value — valor real
     * @param {string} [opts.maskedValue]
     * @param {string} [opts.inputId='ig-token-input']
     * @param {boolean} [opts.disabled]
     * @param {'xs'|'sm'|'md'|'lg'} [opts.size='sm']
     * @param {Function} [opts.onCopy]
     */
    function createSecretTokenField(opts) {
        opts = opts || {};
        var container = document.getElementById(opts.containerId);
        if (!container) return null;

        if (container._ubitsSecretTokenDestroy) {
            container._ubitsSecretTokenDestroy();
        }

        var value = String(opts.value || '');
        var masked = opts.maskedValue || (value.length > 12 ? value.slice(0, 8) + '••••••••' + value.slice(-4) : '••••••••••');
        var revealed = false;
        var size = opts.size || 'sm';
        var disabled = !!opts.disabled;
        var inputId = opts.inputId || 'ig-token-input';

        function render() {
            container.innerHTML =
                '<div class="ubits-input-group ubits-input-group--' + escapeHtml(size) + (disabled ? ' ubits-input-group--disabled' : '') + '" role="group">' +
                    '<input type="text" class="ubits-input-group__control ubits-input-group__control--mono" id="' + escapeHtml(inputId) + '" readonly aria-label="Token" value="' + escapeHtml(revealed ? value : masked) + '"' + (disabled ? ' disabled' : '') + '>' +
                    '<div class="ubits-input-group__addon ubits-input-group__addon--end">' +
                        '<span class="ubits-input-group__actions">' +
                            '<button type="button" class="ubits-button ubits-button--tertiary ubits-button--xs ubits-button--icon-only" data-action="copy" aria-label="Copiar" data-tooltip="Copiar"' + (disabled ? ' disabled' : '') + '><i class="far fa-copy" aria-hidden="true"></i></button>' +
                            '<button type="button" class="ubits-button ubits-button--tertiary ubits-button--xs ubits-button--icon-only" data-action="reveal" aria-label="' + (revealed ? 'Ocultar' : 'Mostrar') + '" data-tooltip="' + (revealed ? 'Ocultar' : 'Mostrar') + '"' + (disabled ? ' disabled' : '') + '><i class="far ' + (revealed ? 'fa-eye-slash' : 'fa-eye') + '" aria-hidden="true"></i></button>' +
                        '</span>' +
                    '</div>' +
                '</div>';

            var copyBtn = container.querySelector('[data-action="copy"]');
            var revealBtn = container.querySelector('[data-action="reveal"]');
            var input = container.querySelector('#' + CSS.escape(inputId));

            if (copyBtn) {
                copyBtn.addEventListener('click', function () {
                    if (disabled) return;
                    copyText(value);
                    if (typeof opts.onCopy === 'function') opts.onCopy(value);
                });
            }
            if (revealBtn) {
                revealBtn.addEventListener('click', function () {
                    if (disabled) return;
                    revealed = !revealed;
                    render();
                    if (typeof initTooltip === 'function') initTooltip(container);
                });
            }
            if (typeof initTooltip === 'function') initTooltip(container);
        }

        render();

        var api = {
            setDisabled: function (next) {
                disabled = !!next;
                render();
            },
            destroy: function () {
                container.innerHTML = '';
                delete container._ubitsSecretTokenDestroy;
            }
        };
        container._ubitsSecretTokenDestroy = api.destroy;
        return api;
    }

    global.createSecretTokenField = createSecretTokenField;
})(typeof window !== 'undefined' ? window : this);
