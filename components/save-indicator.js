/**
 * UBITS Save Indicator Component
 * Muestra el estado del guardado: idle, saving, saved, error.
 * Componente solo informativo (role="status") — sin hover, focus ni tooltip.
 * Inspirado en Figma Components. Usa tokens UBITS.
 *
 * Uso:
 *   renderSaveIndicator('mi-contenedor', { state: 'saving' });
 *   renderSaveIndicator('mi-contenedor', { state: 'idle', size: 'md' });
 *
 * Requisitos: save-indicator.css, fontawesome-icons.css, ubits-colors.css, ubits-typography.css
 *
 * @param {string} containerId - ID del contenedor donde se renderiza el componente.
 * @param {Object} options - Opciones.
 * @param {string} options.state - 'idle' | 'saving' | 'saved' | 'error'.
 * @param {string} [options.size] - 'xs' | 'sm' | 'md' | 'lg'. Default: 'md'. Solo icono: xs 28px, sm 32px, md 40px, lg 48px (1:1).
 * @param {string} [options.savingText] - Texto en estado saving. Default: 'Guardando'.
 * @param {string} [options.savedText] - Texto en estado saved. Default: 'Cambios guardados'.
 * @param {string} [options.errorText] - Texto opcional en estado error.
 *
 * IMPLEMENTACIÓN / BUGS CONOCIDOS:
 * - Siempre importar save-indicator.css y fontawesome-icons.css en la página donde se use; si hay alertas, importar también alert.css para que no se vean rotas.
 * - El contenedor debe existir en el DOM antes de llamar a renderSaveIndicator (ej. después de DOMContentLoaded).
 * - Estado inicial de pantalla con autoguardado: state 'idle' (icono «guardado», sin texto).
 * - Flujo al persistir un cambio: idle → saving → saved («Cambios guardados») → idle (tras ~2,5 s).
 *   Usar triggerSaveIndicatorFeedback(containerId, options) — no saltar directo de saving a idle.
 * - Si falla el guardado: renderSaveIndicator(..., { state: 'error' }) y luego volver a idle cuando corresponda.
 */
function renderSaveIndicator(containerId, options) {
    options = options || {};
    var state = (options.state || 'idle').toLowerCase();
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

    var variantClass = 'ubits-save-indicator--idle';
    if (state === 'saving') {
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
    container.innerHTML =
        '<div class="ubits-save-indicator ' + sizeClass + ' ' + variantClass + '" role="status" aria-live="polite" aria-label="' + getSaveIndicatorAriaLabel(state, savingText, savedText, errorText) + '">' +
        '<span class="' + iconClass + '">' + iconContent + '</span>' +
        textContent +
        '</div>';
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

/**
 * Ciclo completo de autoguardado: saving → saved (recently saved) → idle.
 * @param {string} containerId
 * @param {Object} [options]
 * @param {string} [options.size='md']
 * @param {number} [options.savingDelay=800] ms en «Guardando…» antes de «Cambios guardados»
 * @param {number} [options.savedDelay=2500] ms mostrando «Cambios guardados» antes de volver a idle
 */
function triggerSaveIndicatorFeedback(containerId, options) {
    options = options || {};
    var size = options.size || 'md';
    var savingDelay = options.savingDelay != null ? options.savingDelay : 800;
    var savedDelay = options.savedDelay != null ? options.savedDelay : 2500;
    if (typeof renderSaveIndicator !== 'function') return;
    renderSaveIndicator(containerId, { state: 'saving', size: size });
    setTimeout(function () {
        renderSaveIndicator(containerId, { state: 'saved', size: size });
        setTimeout(function () {
            renderSaveIndicator(containerId, { state: 'idle', size: size });
        }, savedDelay);
    }, savingDelay);
}
