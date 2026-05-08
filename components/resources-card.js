/**
 * Resources card — tarjeta para elegir tipo de recurso en el paso Recursos (LMS Creator).
 * Figma Learn-Components: https://www.figma.com/design/ZWcvS9Z7YQaz59GZIrnWM6/Learn-Components?node-id=247-5165
 *
 * API: resourcesCardHtml({ type, disabled?, className?, hoverClass? })
 *   Video, SCORM y Evaluación muestran distintivo IA (Badge Tag outlined IA, solo icono xs).
 *   Tras montar HTML en el DOM, initResourcesBlockFields (resources-block.js) cablea tooltip y stopPropagation en el distintivo.
 *   type: video | pdf | texto | embebido | scorm | evaluacion-final |
 *         encuesta-libre | encuesta | archivo-descargable | certificado | imagen
 *   hoverClass: si true, añade .is-hover (preview doc sin puntero).
 *
 * @see documentacion/componentes/resources-card.html
 */
(function (global) {
    'use strict';

    /** Texto del tooltip del distintivo IA (sobrescribible vía window.RESOURCES_CARD_IA_ASSIST_TOOLTIP antes de generar HTML). */
    var RESOURCES_CARD_IA_ASSIST_TOOLTIP_DEFAULT = 'Incluye asistencia con IA.';

    var RESOURCES_CARD_META = {
        video: { icon: 'fa-video', label: 'Video', aiAssist: true },
        pdf: { icon: 'fa-file-pdf', label: 'PDF' },
        texto: { icon: 'fa-text', label: 'Texto' },
        embebido: { icon: 'fa-code', label: 'Embebido' },
        scorm: { icon: 'fa-cube', label: 'SCORM', aiAssist: true },
        'evaluacion-final': { icon: 'fa-clipboard-check', label: 'Evaluación', aiAssist: true },
        'encuesta-libre': { icon: 'fa-list', label: 'Encuesta libre' },
        encuesta: { icon: 'fa-star', label: 'Encuesta de satisfacción' },
        'archivo-descargable': { icon: 'fa-download', label: 'Archivo descargable' },
        certificado: { icon: 'fa-award', label: 'Certificado' },
        imagen: { icon: 'fa-image', label: 'Imagen' }
    };

    /** Orden de columnas alineado al layout Figma 247:5165 */
    var RESOURCES_CARD_TYPES_ORDER = [
        'video',
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
        var iaTooltip =
            String(global.RESOURCES_CARD_IA_ASSIST_TOOLTIP || '').trim() || RESOURCES_CARD_IA_ASSIST_TOOLTIP_DEFAULT;
        var iaBadge =
            meta.aiAssist === true
                ? '<span class="ubits-resources-card__ia-assist ubits-badge-tag ubits-badge-tag--outlined ubits-badge-tag--ia ubits-badge-tag--xs ubits-badge-tag--with-icon ubits-badge-tag--icon-only" ' +
                  'data-tooltip="' +
                  escapeAttr(iaTooltip) +
                  '" data-tooltip-delay="500" data-tooltip-position="top" data-tooltip-align="center" ' +
                  'tabindex="-1" role="img" aria-hidden="true">' +
                  '<i class="far fa-sparkles"></i></span>'
                : '';
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
            iaBadge +
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
    if (global.RESOURCES_CARD_IA_ASSIST_TOOLTIP == null) {
        global.RESOURCES_CARD_IA_ASSIST_TOOLTIP = RESOURCES_CARD_IA_ASSIST_TOOLTIP_DEFAULT;
    }
    global.resourcesCardHtml = resourcesCardHtml;
})(typeof window !== 'undefined' ? window : this);
