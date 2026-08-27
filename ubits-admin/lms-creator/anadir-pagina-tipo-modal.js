/**
 * Modal «Añadir página» — Selector de tipo de recurso para nueva página (LMS Creator T2).
 * Muestra grid de Resources Cards (8 tipos) para elegir el recurso principal de la página.
 *
 * API:
 *   openAnadirPaginaTipoModal({ onSelect(type), onCancel? })
 *     - onSelect(type): callback al elegir tipo; recibe 'video' | 'pdf' | 'texto' | 'embebido' | 'scorm' | 'evaluacion-final' | 'encuesta-libre' | 'encuesta'
 *     - onCancel: callback opcional al cancelar (botón o overlay)
 *
 * Depende: modal.js, resources-card.js, tooltip.js
 */
(function (global) {
    'use strict';

    var OVERLAY_ID = 'cc-anadir-pagina-tipo-modal';

    /**
     * Cards del selector (paridad Resources block vanilla).
     * Presentación interactiva y Asistencia se ocultan en vanilla (siguen en React).
     * Se hardcodean aquí para no depender de que resources-block.js esté cargado.
     */
    var ANADIR_PAGINA_TIPOS = [
        'video',
        'pdf',
        'texto',
        'embebido',
        'scorm',
        'evaluacion-final',
        'encuesta-libre',
        'encuesta'
    ];

    /** Tipos aún no disponibles — cards disabled (paridad ResourcesBlock selector). */
    var ANADIR_PAGINA_DISABLED = {
        texto: true,
        'encuesta-libre': true,
        encuesta: true
    };

    var _onSelectCallback = null;
    var _onCancelCallback = null;
    /** Evita que onClose del modal dispare cancel al elegir una card. */
    var _selectingType = false;

    function escapeHtml(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    /**
     * Genera HTML del grid de cards.
     * Cards al 100% del ancho de celda (paridad React AnadirPaginaModal + fillCell).
     * @returns {string}
     */
    function buildCardsGridHtml() {
        var cards = ANADIR_PAGINA_TIPOS.map(function (type) {
            var isDisabled = !!ANADIR_PAGINA_DISABLED[type];
            if (typeof global.resourcesCardHtml === 'function') {
                return global.resourcesCardHtml({ type: type, disabled: isDisabled });
            }
            var meta = (global.RESOURCES_CARD_META && global.RESOURCES_CARD_META[type]) || { icon: 'fa-file', label: type };
            return (
                '<button type="button" class="ubits-resources-card' + (isDisabled ? ' ubits-resources-card--disabled' : '') + '" data-resources-card-type="' + escapeHtml(type) + '" aria-label="' + escapeHtml(meta.label) + '"' + (isDisabled ? ' disabled aria-disabled="true"' : '') + '>' +
                '<span class="ubits-resources-card__inner">' +
                '<span class="ubits-resources-card__icon-wrap" aria-hidden="true"><i class="far ' + escapeHtml(meta.icon) + '"></i></span>' +
                '<span class="ubits-resources-card__label">' + escapeHtml(meta.label) + '</span>' +
                '</span>' +
                '</button>'
            );
        }).join('');

        return (
            '<p class="ubits-body-md-regular cc-anadir-pagina-tipo-modal__hint">' +
            'Selecciona el tipo de recurso principal que quieres añadir' +
            '</p>' +
            '<div class="cc-anadir-pagina-tipo-grid" role="list">' +
            cards +
            '</div>' +
            '<style>' +
            '#cc-anadir-pagina-tipo-modal.ubits-modal-overlay{z-index:1200;}' +
            '#cc-anadir-pagina-tipo-modal .ubits-modal-content{z-index:1201;}' +
            '.cc-anadir-pagina-tipo-modal__hint{margin:0 0 var(--gap-lg,16px) 0;color:var(--ubits-fg-1-medium);}' +
            '.cc-anadir-pagina-tipo-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:var(--gap-md,12px);width:100%;box-sizing:border-box;}' +
            '.cc-anadir-pagina-tipo-grid .ubits-resources-card{width:100%;max-width:100%;justify-self:stretch;}' +
            '@media(max-width:900px){.cc-anadir-pagina-tipo-grid{grid-template-columns:repeat(2,minmax(0,1fr));}}' +
            '@media(max-width:520px){.cc-anadir-pagina-tipo-grid{grid-template-columns:minmax(0,1fr);}}' +
            '</style>'
        );
    }

    /**
     * Manejador de click dentro del body del modal.
     * Importante: NO escuchar en el overlay — `.ubits-modal-content` hace stopPropagation.
     * @param {MouseEvent} ev
     */
    function handleModalClick(ev) {
        var card = ev.target.closest('[data-resources-card-type]');
        if (!card) return;
        if (card.disabled || card.getAttribute('aria-disabled') === 'true') return;

        var type = card.getAttribute('data-resources-card-type');
        if (!type || ANADIR_PAGINA_DISABLED[type]) return;

        var cb = _onSelectCallback;
        _selectingType = true;
        closeAnadirPaginaTipoModal();
        _selectingType = false;

        if (typeof cb === 'function') {
            cb(type);
        }
    }

    /**
     * Cierra el modal.
     */
    function closeAnadirPaginaTipoModal() {
        if (typeof global.closeModal === 'function') {
            global.closeModal(OVERLAY_ID);
        }
    }

    /**
     * Callback al cancelar (overlay, X o botón Cancelar).
     */
    function handleCancel() {
        if (_selectingType) return;
        closeAnadirPaginaTipoModal();
        if (typeof _onCancelCallback === 'function') {
            _onCancelCallback();
        }
    }

    /**
     * Abre el modal «Añadir página».
     * @param {{ onSelect?: (type: string) => void, onCancel?: () => void }} opts
     */
    function openAnadirPaginaTipoModal(opts) {
        opts = opts || {};
        _onSelectCallback = typeof opts.onSelect === 'function' ? opts.onSelect : null;
        _onCancelCallback = typeof opts.onCancel === 'function' ? opts.onCancel : null;
        _selectingType = false;

        if (typeof global.openModal !== 'function') {
            console.warn('[anadir-pagina-tipo-modal] modal.js no está cargado.');
            return;
        }

        global.openModal({
            overlayId: OVERLAY_ID,
            title: 'Añadir página',
            bodyHtml: buildCardsGridHtml(),
            footerHtml:
                '<button type="button" class="ubits-button ubits-button--secondary ubits-button--md" id="cc-anadir-pagina-cancel">' +
                '<span>Cancelar</span>' +
                '</button>',
            size: 'md',
            closeOnOverlayClick: true,
            onClose: handleCancel
        });

        var overlay = document.getElementById(OVERLAY_ID);
        if (!overlay) return;

        var cancelBtn = overlay.querySelector('#cc-anadir-pagina-cancel');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', handleCancel);
        }

        /* Listener en el body: el content del modal corta el bubble hacia el overlay. */
        var body = overlay.querySelector('.ubits-modal-body');
        if (body) {
            body.addEventListener('click', handleModalClick);
        }

        if (typeof global.initTooltip === 'function') {
            global.initTooltip('#' + OVERLAY_ID + ' [data-tooltip]');
        }
    }

    global.openAnadirPaginaTipoModal = openAnadirPaginaTipoModal;
    global.closeAnadirPaginaTipoModal = closeAnadirPaginaTipoModal;

})(typeof window !== 'undefined' ? window : this);
