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
        aiCtaModal: 'Modal',
        aiCtaPanel: 'Panel',
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
                u.searchParams.set('playsinline', '1');
            }
            return u.toString();
        } catch (e) {
            var sep = embed.indexOf('?') >= 0 ? '&' : '?';
            return embed + sep + 'autoplay=1';
        }
    }

    var EDIT_HITLAYER_CLASS = 'ubits-learn-img-trailer__edit-hitlayer';

    function wireEditHitlayer(root) {
        var existing = root.querySelector('.' + EDIT_HITLAYER_CLASS);
        if (existing) existing.remove();
        var editWrap = root.querySelector('.ubits-learn-img-trailer__edit');
        var btn = editWrap && editWrap.querySelector('button');
        if (!btn) return;
        var btnLabel = '';
        try {
            btnLabel = (btn.textContent || '').trim();
        } catch (e) {}
        if (!btnLabel) btnLabel = LEARN_CONTENT_IMG_TRAILER_DEFAULTS.editButton;
        var layer = document.createElement('button');
        layer.type = 'button';
        layer.className = EDIT_HITLAYER_CLASS;
        layer.setAttribute('aria-label', btnLabel);
        layer.setAttribute('title', btnLabel);
        layer.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            btn.click();
        });
        btn.setAttribute('tabindex', '-1');
        btn.setAttribute('aria-hidden', 'true');
        root.appendChild(layer);
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
        wireEditHitlayer(root);
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
     * @param {{ cta?: string, aiCtaModal?: string, aiCtaPanel?: string, hint?: string, ctaId?: string, aiCtaModalId?: string, aiCtaPanelId?: string, iconClass?: string, includeErrorPlaceholder?: boolean, errorPlaceholder?: string }} [opts]
     */
    function getLearnContentImgTrailerEmptyHtml(opts) {
        opts = opts || {};
        var cta = opts.cta != null ? opts.cta : LEARN_CONTENT_IMG_TRAILER_DEFAULTS.cta;
        var aiCtaModal =
            opts.aiCtaModal != null ? opts.aiCtaModal : LEARN_CONTENT_IMG_TRAILER_DEFAULTS.aiCtaModal;
        var aiCtaPanel =
            opts.aiCtaPanel != null ? opts.aiCtaPanel : LEARN_CONTENT_IMG_TRAILER_DEFAULTS.aiCtaPanel;
        var hint = opts.hint != null ? opts.hint : LEARN_CONTENT_IMG_TRAILER_DEFAULTS.hint;
        var icon = opts.iconClass || 'far fa-image';
        var ctaIdAttr = opts.ctaId ? ' id="' + escapeHtml(opts.ctaId) + '"' : '';
        var aiModalIdAttr = opts.aiCtaModalId ? ' id="' + escapeHtml(opts.aiCtaModalId) + '"' : '';
        var aiPanelIdAttr = opts.aiCtaPanelId ? ' id="' + escapeHtml(opts.aiCtaPanelId) + '"' : '';
        var errLine = '';
        if (opts.includeErrorPlaceholder) {
            var em = opts.errorPlaceholder != null ? opts.errorPlaceholder : 'Mensaje de error';
            errLine = '<p class="ubits-learn-img-trailer__error-msg ubits-body-sm-regular">' + escapeHtml(em) + '</p>';
        }
        return (
            '<div class="ubits-learn-img-trailer__empty">' +
            '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm ubits-learn-img-trailer__cta"' +
            ctaIdAttr +
            '><i class="' +
            escapeHtml(icon) +
            '"></i><span>' +
            escapeHtml(cta) +
            '</span></button>' +
            '<div class="ubits-learn-img-trailer__ai-row" role="group" aria-label="Acciones de IA">' +
            '<button type="button" class="ubits-ia-button ubits-ia-button--secondary ubits-ia-button--sm"' +
            aiModalIdAttr +
            '><i class="far fa-sparkles"></i><span>' +
            escapeHtml(aiCtaModal) +
            '</span></button>' +
            '<button type="button" class="ubits-ia-button ubits-ia-button--secondary ubits-ia-button--sm"' +
            aiPanelIdAttr +
            '><i class="far fa-sparkles"></i><span>' +
            escapeHtml(aiCtaPanel) +
            '</span></button>' +
            '</div>' +
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

    /**
     * Botón flotante «Eliminar» (variante de estado imagen / tráiler).
     * Mismo slot que Editar, pero con botón error-secondary.
     * @param {{ deleteLabel?: string, deleteButtonId?: string }} [opts]
     */
    function getLearnContentImgTrailerDeleteHtml(opts) {
        opts = opts || {};
        var label = opts.deleteLabel != null ? opts.deleteLabel : 'Eliminar';
        var btnId = opts.deleteButtonId ? ' id="' + escapeHtml(opts.deleteButtonId) + '"' : '';
        return (
            '<div class="ubits-learn-img-trailer__edit">' +
            '<button type="button" class="ubits-button ubits-button--error-secondary ubits-button--sm"' +
            btnId +
            '><i class="far fa-trash-alt"></i><span>' +
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

        /*
         * Fuente de verdad del estado vacío:
         * - Si el root tiene data-learn-img-trailer-init y NO está en estado imagen/tráiler,
         *   renderizamos el vacío desde getLearnContentImgTrailerEmptyHtml().
         * - Preservamos IDs (p. ej. CTA en crear-contenido.js) leyendo:
         *   1) data-learn-img-trailer-cta-id / data-learn-img-trailer-ai-cta-id en el root, o
         *   2) ids presentes en el markup existente (para migraciones).
         */
        if (
            root.hasAttribute('data-learn-img-trailer-init') &&
            !root.classList.contains('ubits-learn-img-trailer--image') &&
            !root.classList.contains('ubits-learn-img-trailer--trailer')
        ) {
            var existingCta = root.querySelector('.ubits-learn-img-trailer__cta');
            var existingAis = root.querySelectorAll('.ubits-learn-img-trailer__empty .ubits-ia-button');
            var ctaId =
                root.getAttribute('data-learn-img-trailer-cta-id') ||
                (existingCta && existingCta.id ? existingCta.id : '');
            var existingAiModal = existingAis && existingAis.length ? existingAis[0] : null;
            var existingAiPanel = existingAis && existingAis.length > 1 ? existingAis[1] : null;
            var aiCtaModalId =
                root.getAttribute('data-learn-img-trailer-ai-modal-id') ||
                (existingAiModal && existingAiModal.id ? existingAiModal.id : '');
            var aiCtaPanelId =
                root.getAttribute('data-learn-img-trailer-ai-panel-id') ||
                (existingAiPanel && existingAiPanel.id ? existingAiPanel.id : '');
            root.innerHTML = getLearnContentImgTrailerEmptyHtml({
                ctaId: ctaId || undefined,
                aiCtaModalId: aiCtaModalId || undefined,
                aiCtaPanelId: aiCtaPanelId || undefined
            });
        }

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
    window.getLearnContentImgTrailerDeleteHtml = getLearnContentImgTrailerDeleteHtml;
    window.initLearnContentImgTrailer = initLearnContentImgTrailer;
    window.initAllLearnContentImgTrailers = initAllLearnContentImgTrailers;
    window.getTrailerEmbedUrl = getTrailerEmbedUrl;
    window.playLearnContentTrailerInline = playTrailerInline;
    window.playLearnContentTrailer = playTrailerVideo;
})();
