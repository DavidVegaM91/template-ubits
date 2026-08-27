/**
 * Resources block — panel principal del paso Recursos (Learn-Components Figma 248:6265).
 *
 * API: resourcesBlockHtml({ variant?, className? })
 *   Variante: default (selector de tipos).
 *   Embebido / PDF / video van por modales o flujos hermanos (T2), no por variantes de este bloque.
 *   Tras insertar el HTML, llama initResourcesBlockFields(contenedorRaíz) para tooltips IA en cards.
 *
 * Depende de: resourcesCardHtml, button.css, resources-card.css.
 * Tarjetas con IA: badge-tag.css (+ gradientes IA opcionales). Tooltips: tooltip.js (initTooltip).
 *
 * @see documentacion/componentes/resources-block.html
 */
(function (global) {
    'use strict';

    /* Presentación interactiva y Asistencia se ocultan en vanilla (siguen en React).
       Ver diferencias-react-vs-vanilla.md. */
    var RESOURCES_BLOCK_SELECTOR_TYPES = [
        'video',
        'pdf',
        'texto',
        'embebido',
        'scorm',
        'evaluacion-final',
        'encuesta-libre',
        'encuesta'
    ];

    var RESOURCES_BLOCK_VARIANTS_ORDER = ['default'];

    var _rbIaAssistWireSeq = 0;

    function wireResourcesCardIaAssist(root) {
        if (!root || !root.querySelector || !root.querySelector('.ubits-resources-card__ia-assist')) return;

        root.querySelectorAll('.ubits-resources-card__ia-assist').forEach(function (badge) {
            if (badge._ubitsRcIaWired) return;
            badge._ubitsRcIaWired = true;
            function stopEv(ev) {
                ev.stopPropagation();
            }
            badge.addEventListener('mousedown', stopEv);
            badge.addEventListener('click', stopEv);
        });

        if (typeof global.initTooltip !== 'function') return;
        if (!root.querySelector('.ubits-resources-card__ia-assist[data-tooltip]')) return;
        var scopeId = root.id;
        if (!scopeId) {
            _rbIaAssistWireSeq += 1;
            scopeId = 'ubits-resources-block-mount-' + _rbIaAssistWireSeq;
            root.id = scopeId;
        }
        global.initTooltip('#' + scopeId + ' .ubits-resources-card__ia-assist[data-tooltip]');
    }

    function escapeHtml(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function escapeAttr(s) {
        return escapeHtml(s).replace(/'/g, '&#039;');
    }

    function rbVariantDataAttr(variantKey) {
        return ' data-rb-variant="' + escapeAttr(variantKey) + '"';
    }

    function cardHtml(type) {
        if (typeof global.resourcesCardHtml === 'function') {
            return global.resourcesCardHtml({ type: type });
        }
        return '';
    }

    function buildDefault(extra, variantKey) {
        var cards = RESOURCES_BLOCK_SELECTOR_TYPES.map(function (t) {
            return cardHtml(t);
        }).join('');
        return (
            '<div class="ubits-resources-block ubits-resources-block--default' +
            extra +
            rbVariantDataAttr(variantKey) +
            '">' +
            '<p class="ubits-resources-block__title ubits-body-md-regular">Selecciona el tipo de recurso principal que quieres añadir</p>' +
            '<div class="ubits-resources-block__grid">' +
            cards +
            '</div></div>'
        );
    }

    function normalizeVariant(v) {
        var s = String(v == null ? 'default' : v)
            .trim()
            .toLowerCase()
            .replace(/_/g, '-');
        return s;
    }

    /**
     * Cablea tooltips de badges IA en las cards del selector.
     * @param {HTMLElement} root
     */
    function initResourcesBlockFields(root) {
        if (!root) return;
        wireResourcesCardIaAssist(root);
    }

    /**
     * @param {{ variant?: string, className?: string }} opts
     * @returns {string}
     */
    function resourcesBlockHtml(opts) {
        opts = opts || {};
        var v = normalizeVariant(opts.variant);
        var extra = opts.className ? ' ' + String(opts.className).trim().replace(/\s+/g, ' ') : '';
        return buildDefault(extra, v === 'default' ? 'default' : 'default');
    }

    global.RESOURCES_BLOCK_SELECTOR_TYPES = RESOURCES_BLOCK_SELECTOR_TYPES;
    global.RESOURCES_BLOCK_VARIANTS_ORDER = RESOURCES_BLOCK_VARIANTS_ORDER;
    global.resourcesBlockHtml = resourcesBlockHtml;
    global.initResourcesBlockFields = initResourcesBlockFields;
})(typeof window !== 'undefined' ? window : this);
