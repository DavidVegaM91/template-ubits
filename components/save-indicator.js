/**
 * UBITS Save Indicator Component
 * Muestra el estado del guardado: Saved, Hover, Focus, Saving, Failed, Recently saved.
 * Inspirado en Figma Components. Usa tokens UBITS.
 *
 * Uso:
 *   renderSaveIndicator('mi-contenedor', { state: 'saving' });
 *   renderSaveIndicator('mi-contenedor', { state: 'idle', idleVariant: 'subtle', size: 'md' });
 *
 * Requisitos: save-indicator.css, fontawesome-icons.css, ubits-colors.css, ubits-typography.css
 *
 * @param {string} containerId - ID del contenedor donde se renderiza el componente.
 * @param {Object} options - Opciones.
 * @param {string} options.state - 'idle' | 'saving' | 'saved' | 'error'.
 * @param {string} [options.idleVariant] - Para state 'idle': 'plain' | 'subtle' | 'highlighted'. Default: 'plain'.
 * @param {string} [options.size] - 'xs' | 'sm' | 'md' | 'lg'. Default: 'md'. Solo icono: xs 28px, sm 32px, md 40px, lg 48px (1:1).
 * @param {string} [options.savingText] - Texto en estado saving. Default: 'Guardando'.
 * @param {string} [options.savedText] - Texto en estado saved. Default: 'Cambios guardados'.
 * @param {string} [options.errorText] - Texto opcional en estado error.
 *
 * IMPLEMENTACIÓN / BUGS CONOCIDOS:
 * - Siempre importar save-indicator.css y fontawesome-icons.css en la página donde se use; si hay alertas, importar también alert.css para que no se vean rotas.
 * - El contenedor debe existir en el DOM antes de llamar a renderSaveIndicator (ej. después de DOMContentLoaded).
 * - Para autoguardado: llamar con state 'saving' al enviar, luego 'saved' al terminar (y tras 2-3 s volver a 'idle') o 'error' si falla.
 */
function renderSaveIndicator(containerId, options) {
    options = options || {};
    var state = (options.state || 'idle').toLowerCase();
    var idleVariant = (options.idleVariant || 'plain').toLowerCase();
    var size = (options.size || 'md').toLowerCase();
    if (size !== 'xs' && size !== 'sm' && size !== 'lg') size = 'md';
    var savingText = options.savingText != null ? options.savingText : 'Guardando';
    var savedText = options.savedText != null ? options.savedText : 'Cambios guardados';
    var errorText = options.errorText != null ? options.errorText : '';

    var container = document.getElementById(containerId);
    if (!container) {
        console.warn('UBITS Save Indicator: no se encontró el contenedor "' + containerId + '"');
        return;
    }

    var variantClass = 'ubits-save-indicator--idle-plain';
    if (state === 'idle') {
        if (idleVariant === 'subtle') variantClass = 'ubits-save-indicator--idle-subtle';
        else if (idleVariant === 'highlighted') variantClass = 'ubits-save-indicator--idle-highlighted';
    } else if (state === 'saving') {
        variantClass = 'ubits-save-indicator--saving';
    } else if (state === 'saved') {
        variantClass = 'ubits-save-indicator--saved';
    } else if (state === 'error') {
        variantClass = 'ubits-save-indicator--error';
    }

    var iconClass = 'ubits-save-indicator__icon';
    var iconContent = '';
    var textContent = '';

    if (state === 'idle') {
        iconContent = '<i class="far fa-cloud-check"></i>';
    } else if (state === 'saved') {
        iconContent = '<i class="far fa-cloud-check"></i>';
    } else if (state === 'saving') {
        iconClass += ' ubits-save-indicator__icon--spin';
        iconContent = '<i class="far fa-arrows-rotate"></i>';
        textContent = '<span class="ubits-save-indicator__text">' + escapeSaveIndicatorHtml(savingText) + '</span><span class="ubits-save-indicator__dots" aria-hidden="true"><span>.</span><span>.</span><span>.</span></span>';
    } else if (state === 'error') {
        iconContent = '<i class="far fa-cloud-xmark"></i>';
        if (errorText) {
            textContent = '<span class="ubits-save-indicator__text">' + escapeSaveIndicatorHtml(errorText) + '</span>';
        }
    }

    if (state === 'saved') {
        textContent = '<span class="ubits-save-indicator__text">' + escapeSaveIndicatorHtml(savedText) + '</span>';
    }

    var sizeClass = 'ubits-save-indicator--' + size;
    var tooltipAttr = (state === 'idle' || state === 'saved') ? ' data-tooltip="Cambios guardados"' : '';
    container.innerHTML =
        '<div class="ubits-save-indicator ' + sizeClass + ' ' + variantClass + '" role="status" aria-live="polite" aria-label="' + getSaveIndicatorAriaLabel(state, savingText, savedText, errorText) + '"' + tooltipAttr + '>' +
        '<span class="' + iconClass + '">' + iconContent + '</span>' +
        textContent +
        '</div>';
    if (tooltipAttr && typeof initTooltip === 'function') {
        var selector = '#' + containerId + ' .ubits-save-indicator';
        initTooltip(selector);
    }
}

function escapeSaveIndicatorHtml(text) {
    if (text == null) return '';
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getSaveIndicatorAriaLabel(state, savingText, savedText, errorText) {
    if (state === 'saving') return savingText + '…';
    if (state === 'saved') return savedText;
    if (state === 'error' && errorText) return errorText;
    if (state === 'error') return 'Error al guardar';
    return 'Guardado';
}

/* Alias para compatibilidad con código que use el nombre anterior */
function renderAutosaveFeedback(containerId, options) {
    renderSaveIndicator(containerId, options);
}
