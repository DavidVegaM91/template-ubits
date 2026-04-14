/**
 * Resources card — tarjeta para elegir tipo de recurso en el paso Recursos (LMS Creator).
 * Figma Learn-Components: https://www.figma.com/design/ZWcvS9Z7YQaz59GZIrnWM6/Learn-Components?node-id=247-5165
 *
 * API: resourcesCardHtml({ type, disabled?, className?, hoverClass? })
 *   type: video | video-desktop | pdf | texto | embebido | scorm | evaluacion-final |
 *         encuesta-libre | encuesta | archivo-descargable | certificado | imagen
 *   hoverClass: si true, añade .is-hover (preview doc sin puntero).
 *
 * @see documentacion/componentes/resources-card.html
 */
(function (global) {
    'use strict';

    var RESOURCES_CARD_META = {
        video: { icon: 'fa-video', label: 'Video' },
        'video-desktop': { icon: 'fa-desktop', label: 'Video desde el computador' },
        pdf: { icon: 'fa-file-pdf', label: 'PDF' },
        texto: { icon: 'fa-text', label: 'Texto' },
        embebido: { icon: 'fa-code', label: 'Embebido' },
        scorm: { icon: 'fa-cube', label: 'SCORM' },
        'evaluacion-final': { icon: 'fa-clipboard-check', label: 'Evaluación final' },
        'encuesta-libre': { icon: 'fa-list', label: 'Encuesta libre' },
        encuesta: { icon: 'fa-star', label: 'Encuesta de satisfacción' },
        'archivo-descargable': { icon: 'fa-download', label: 'Archivo descargable' },
        certificado: { icon: 'fa-award', label: 'Certificado' },
        imagen: { icon: 'fa-image', label: 'Imagen' }
    };

    /** Orden de columnas alineado al layout Figma 247:5165 */
    var RESOURCES_CARD_TYPES_ORDER = [
        'video',
        'video-desktop',
        'pdf',
        'texto',
        'embebido',
        'scorm',
        'evaluacion-final',
        'encuesta-libre',
        'encuesta',
        'archivo-descargable',
        'certificado',
        'imagen'
    ];

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

    /**
     * @param {{ type?: string, disabled?: boolean, className?: string, hoverClass?: boolean, ariaLabel?: string }} opts
     * @returns {string}
     */
    function resourcesCardHtml(opts) {
        opts = opts || {};
        var type = opts.type != null ? String(opts.type) : 'video';
        var meta = RESOURCES_CARD_META[type] || RESOURCES_CARD_META.video;
        var disabled = opts.disabled === true;
        var classes = ['ubits-resources-card'];
        if (opts.className) {
            String(opts.className)
                .trim()
                .split(/\s+/)
                .forEach(function (c) {
                    if (c) classes.push(c);
                });
        }
        if (opts.hoverClass === true && !disabled) {
            classes.push('is-hover');
        }
        var aria =
            opts.ariaLabel != null && String(opts.ariaLabel).trim()
                ? String(opts.ariaLabel).trim()
                : meta.label + (disabled ? ' (no disponible)' : '');
        var disabledAttr = disabled ? ' disabled' : '';
        return (
            '<button type="button" class="' +
            classes.join(' ') +
            '" data-resources-card-type="' +
            escapeAttr(type) +
            '"' +
            disabledAttr +
            ' aria-label="' +
            escapeAttr(aria) +
            '">' +
            '<span class="ubits-resources-card__inner">' +
            '<span class="ubits-resources-card__icon-wrap" aria-hidden="true">' +
            '<i class="far ' +
            escapeHtml(meta.icon) +
            '"></i>' +
            '</span>' +
            '<span class="ubits-resources-card__label">' +
            escapeHtml(meta.label) +
            '</span>' +
            '</span>' +
            '</button>'
        );
    }

    global.RESOURCES_CARD_META = RESOURCES_CARD_META;
    global.RESOURCES_CARD_TYPES_ORDER = RESOURCES_CARD_TYPES_ORDER;
    global.resourcesCardHtml = resourcesCardHtml;
})(typeof window !== 'undefined' ? window : this);
