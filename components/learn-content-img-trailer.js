/**
 * UBITS — Learn content: imagen y tráiler
 * Textos por defecto: LEARN_CONTENT_IMG_TRAILER_DEFAULTS
 * Marcado vacío: getLearnContentImgTrailerEmptyHtml({ ... })
 * Demo: al hacer clic en play (estado tráiler) muestra toast o dispara callback.
 *
 * @param {string|HTMLElement} rootSelector - .ubits-learn-img-trailer
 * @param {{ onPlay?: function(): void }} [options]
 */
(function () {
    'use strict';

    /** Copys oficiales del componente (única fuente de verdad). */
    var LEARN_CONTENT_IMG_TRAILER_DEFAULTS = {
        cta: 'Subir imagen de portada',
        hint: 'Imagen en JPG o PNG. Además, tienes la opción de agregar un tráiler de video',
        editButton: 'Editar',
        playAriaLabel: 'Reproducir tráiler',
        regionAriaLabel: 'Imagen o tráiler del contenido',
        toastPlayFallback: 'Reproducir tráiler (conecta tu reproductor o URL).'
    };

    function escapeHtml(s) {
        if (s == null) return '';
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    /**
     * Bloque .ubits-learn-img-trailer__empty con CTA + hint (y opcional fila de error para demos).
     * @param {{ cta?: string, hint?: string, ctaId?: string, iconClass?: string, includeErrorPlaceholder?: boolean, errorPlaceholder?: string }} [opts]
     */
    function getLearnContentImgTrailerEmptyHtml(opts) {
        opts = opts || {};
        var cta = opts.cta != null ? opts.cta : LEARN_CONTENT_IMG_TRAILER_DEFAULTS.cta;
        var hint = opts.hint != null ? opts.hint : LEARN_CONTENT_IMG_TRAILER_DEFAULTS.hint;
        var icon = opts.iconClass || 'far fa-image';
        var ctaIdAttr = opts.ctaId ? ' id="' + escapeHtml(opts.ctaId) + '"' : '';
        var errLine = '';
        if (opts.includeErrorPlaceholder) {
            var em = opts.errorPlaceholder != null ? opts.errorPlaceholder : 'Mensaje de error';
            errLine = '<p class="ubits-learn-img-trailer__error-msg ubits-body-sm-regular">' + escapeHtml(em) + '</p>';
        }
        return (
            '<div class="ubits-learn-img-trailer__empty">' +
            '<button type="button" class="ubits-button ubits-button--secondary ubits-button--md ubits-learn-img-trailer__cta"' +
            ctaIdAttr +
            '><i class="' +
            escapeHtml(icon) +
            '"></i><span>' +
            escapeHtml(cta) +
            '</span></button>' +
            '<p class="ubits-learn-img-trailer__hint ubits-body-sm-regular">' +
            escapeHtml(hint) +
            '</p>' +
            errLine +
            '</div>'
        );
    }

    /**
     * Botón flotante «Editar» (estado imagen / tráiler).
     * @param {{ editLabel?: string, editButtonId?: string }} [opts]
     */
    function getLearnContentImgTrailerEditHtml(opts) {
        opts = opts || {};
        var label = opts.editLabel != null ? opts.editLabel : LEARN_CONTENT_IMG_TRAILER_DEFAULTS.editButton;
        var btnId = opts.editButtonId ? ' id="' + escapeHtml(opts.editButtonId) + '"' : '';
        return (
            '<div class="ubits-learn-img-trailer__edit">' +
            '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm"' +
            btnId +
            '><i class="far fa-pen"></i><span>' +
            escapeHtml(label) +
            '</span></button></div>'
        );
    }

    function queryRoot(rootSelector) {
        if (!rootSelector) return null;
        if (typeof rootSelector === 'string') return document.querySelector(rootSelector);
        return rootSelector.classList && rootSelector.classList.contains('ubits-learn-img-trailer')
            ? rootSelector
            : null;
    }

    function initLearnContentImgTrailer(rootSelector, options) {
        options = options || {};
        var root = queryRoot(rootSelector);
        if (!root || root.getAttribute('data-img-trailer-init') === 'true') return;
        root.setAttribute('data-img-trailer-init', 'true');

        var playBtn = root.querySelector('.ubits-learn-img-trailer__play');
        if (playBtn) {
            playBtn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                if (typeof options.onPlay === 'function') {
                    options.onPlay();
                } else if (typeof window.showToast === 'function') {
                    window.showToast('info', LEARN_CONTENT_IMG_TRAILER_DEFAULTS.toastPlayFallback);
                }
            });
        }
    }

    function initAllLearnContentImgTrailers(options) {
        document.querySelectorAll('.ubits-learn-img-trailer[data-learn-img-trailer-init]').forEach(function (el) {
            initLearnContentImgTrailer(el, options);
        });
    }

    window.LEARN_CONTENT_IMG_TRAILER_DEFAULTS = LEARN_CONTENT_IMG_TRAILER_DEFAULTS;
    window.getLearnContentImgTrailerEmptyHtml = getLearnContentImgTrailerEmptyHtml;
    window.getLearnContentImgTrailerEditHtml = getLearnContentImgTrailerEditHtml;
    window.initLearnContentImgTrailer = initLearnContentImgTrailer;
    window.initAllLearnContentImgTrailers = initAllLearnContentImgTrailers;
})();
