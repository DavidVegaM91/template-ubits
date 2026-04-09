/**
 * UBITS — Learn content: imagen y tráiler
 * Textos por defecto: LEARN_CONTENT_IMG_TRAILER_DEFAULTS
 * Marcado vacío: getLearnContentImgTrailerEmptyHtml({ ... })
 * Reproducir tráiler: data-trailer-url en la raíz + clic en play carga el iframe en el mismo bloque
 * (YouTube, Vimeo, Drive). Sin embed: nueva pestaña. Opcional onPlay() sustituye el comportamiento.
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
        toastPlayFallback: 'Añade un enlace de tráiler para reproducirlo.',
        iframeTitle: 'Tráiler'
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
     * Devuelve URL lista para iframe si es soportada; si no, null (abrir página en nueva pestaña).
     */
    function getTrailerEmbedUrl(raw) {
        if (!raw || !String(raw).trim()) return null;
        try {
            var u = new URL(String(raw).trim());
            if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
            var h = u.hostname.toLowerCase();
            if (h.includes('youtube.com') || h.includes('youtube-nocookie.com')) {
                if (u.pathname.indexOf('/embed/') === 0) {
                    return u.origin + u.pathname + u.search;
                }
                var v = u.searchParams.get('v');
                if (v) return 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(v) + '?rel=0';
                var shorts = u.pathname.split('/').filter(Boolean);
                var si = shorts.indexOf('shorts');
                if (si >= 0 && shorts[si + 1]) {
                    return 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(shorts[si + 1].split('?')[0]) + '?rel=0';
                }
            }
            if (h === 'youtu.be') {
                var yid = u.pathname.replace(/^\//, '').split('/')[0];
                if (yid) return 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(yid.split('?')[0]) + '?rel=0';
            }
            if (h.includes('vimeo.com')) {
                if (h.indexOf('player.') === 0 || u.pathname.indexOf('/video/') !== -1) {
                    var pv = u.pathname.match(/\/video\/(\d+)/);
                    if (pv) return 'https://player.vimeo.com/video/' + pv[1];
                }
                var vm = u.pathname.match(/\/(\d+)(?:\/|$)/);
                if (vm) return 'https://player.vimeo.com/video/' + vm[1];
            }
            if (h.includes('drive.google.com') && u.pathname.indexOf('/file/d/') !== -1) {
                var dm = u.pathname.match(/\/file\/d\/([^/]+)/);
                if (dm) return 'https://drive.google.com/file/d/' + dm[1] + '/preview';
            }
            return null;
        } catch (e) {
            return null;
        }
    }

    /**
     * Añade autoplay (tras clic del usuario) y, en YouTube, controls=1 explícito.
     */
    function finalizeEmbedSrc(embed) {
        if (!embed) return '';
        try {
            var u = new URL(embed);
            u.searchParams.set('autoplay', '1');
            var h = u.hostname.toLowerCase();
            if (h.includes('youtube.com') || h.includes('youtube-nocookie.com')) {
                u.searchParams.set('controls', '1');
            }
            return u.toString();
        } catch (e) {
            var sep = embed.indexOf('?') >= 0 ? '&' : '?';
            return embed + sep + 'autoplay=1';
        }
    }

    /**
     * Inserta iframe de reproducción en el bloque (misma caja 16:9), encima de la imagen.
     */
    function playTrailerInline(root, pageUrl) {
        var url = pageUrl != null ? String(pageUrl).trim() : '';
        if (!url) {
            if (typeof window.showToast === 'function') {
                window.showToast('info', LEARN_CONTENT_IMG_TRAILER_DEFAULTS.toastPlayFallback, {
                    containerId: 'ubits-toast-container',
                    duration: 3500
                });
            }
            return;
        }
        var embed = getTrailerEmbedUrl(url);
        if (!embed) {
            try {
                window.open(url, '_blank', 'noopener,noreferrer');
            } catch (err) {}
            return;
        }
        var iframeTitle = LEARN_CONTENT_IMG_TRAILER_DEFAULTS.iframeTitle || 'Tráiler';
        var src = finalizeEmbedSrc(embed);
        var host = root.querySelector('.ubits-learn-img-trailer__embed-host');
        if (!host) {
            host = document.createElement('div');
            host.className = 'ubits-learn-img-trailer__embed-host';
            var edit = root.querySelector('.ubits-learn-img-trailer__edit');
            if (edit) root.insertBefore(host, edit);
            else root.appendChild(host);
        }
        host.innerHTML =
            '<iframe title="' +
            escapeHtml(iframeTitle) +
            '" src="' +
            escapeHtml(src) +
            '" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"></iframe>';
        root.classList.add('ubits-learn-img-trailer--playing');
    }

    /** Sin nodo raíz: abre el enlace del tráiler en una pestaña nueva. */
    function playTrailerVideo(pageUrl) {
        var url = pageUrl != null ? String(pageUrl).trim() : '';
        if (!url) {
            if (typeof window.showToast === 'function') {
                window.showToast('info', LEARN_CONTENT_IMG_TRAILER_DEFAULTS.toastPlayFallback, {
                    containerId: 'ubits-toast-container',
                    duration: 3500
                });
            }
            return;
        }
        try {
            window.open(url, '_blank', 'noopener,noreferrer');
        } catch (err) {}
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
                    return;
                }
                var dataUrl = root.getAttribute('data-trailer-url');
                playTrailerInline(root, dataUrl);
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
    window.getTrailerEmbedUrl = getTrailerEmbedUrl;
    window.playLearnContentTrailerInline = playTrailerInline;
    window.playLearnContentTrailer = playTrailerVideo;
})();
