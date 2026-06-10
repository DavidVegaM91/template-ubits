/**
 * UBITS — Learn content: imagen y tráiler
 * Textos por defecto: LEARN_CONTENT_IMG_TRAILER_DEFAULTS / LEARN_CONTENT_IMG_TRAILER_EMPTY_IA_DEFAULTS
 * Vacío: layout IA (icono + título + descripción + CTA ia-button primario «Agregar portada»).
 * Requiere ia-button.css + ia-button.js (+ general-styles/ubits-ia-appearance.css recomendado).
 * Reproducir tráiler: data-trailer-url + clic en play → iframe inline (YouTube, Vimeo, Drive).
 *
 * @param {string|HTMLElement} rootSelector - .ubits-learn-img-trailer
 * @param {{ onPlay?: function(): void }} [options]
 */
(function () {
    'use strict';

    /** Copys oficiales del componente (única fuente de verdad). */
    var LEARN_CONTENT_IMG_TRAILER_DEFAULTS = {
        editButton: 'Editar',
        playAriaLabel: 'Reproducir tráiler',
        regionAriaLabel: 'Imagen o tráiler del contenido',
        toastPlayFallback: 'Añade un enlace de tráiler para reproducirlo.',
        iframeTitle: 'Tráiler'
    };

    /** Vacío — layout compacto (icono + título + descripción + un CTA IA). */
    var LEARN_CONTENT_IMG_TRAILER_EMPTY_IA_DEFAULTS = {
        /** Figma Learn-Components Cover 461:4729 — Image Iconly Pro (SVG, no Font Awesome). */
        emptyIaHeroIconClass: null,
        emptyIaTitle: 'Agrega una portada',
        emptyIaDescription: 'Además, tienes la opción de agregar un tráiler de video',
        emptyIaCta: 'Agregar portada',
        emptyIaCtaIconClass: 'far fa-sparkles'
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

    /** SVG hero vacío con IA — Figma 461:4729 Image Iconly Pro (20×20 en círculo 44px). */
    function getLearnContentImgTrailerEmptyIaHeroSvgInner() {
        return (
            '<svg class="ubits-learn-img-trailer__empty-ia-hero-svg" viewBox="0 0 20 20" focusable="false" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
            '<g><path fill-rule="evenodd" clip-rule="evenodd" fill="currentColor" d="M4.03374 4.10269C3.47006 4.70681 3.12826 5.59098 3.12826 6.68787V13.3098C3.12826 14.4076 3.46856 15.2919 4.03108 15.8958C4.58893 16.4947 5.41181 16.8686 6.48436 16.8686H13.5117C14.5839 16.8686 15.409 16.4946 15.9689 15.8952C16.5333 15.2909 16.8751 14.4067 16.8751 13.3098V6.68787C16.8751 5.591 16.5333 4.70701 15.969 4.10299C15.4091 3.50374 14.584 3.12988 13.5117 3.12988H6.48436C5.41622 3.12988 4.59296 3.50338 4.03374 4.10269ZM3.11981 3.24992C3.93979 2.37112 5.10708 1.87988 6.48436 1.87988H13.5117C14.8921 1.87988 16.0613 2.37076 16.8823 3.24962C17.699 4.12372 18.1251 5.33123 18.1251 6.68787V13.3098C18.1251 14.6664 17.699 15.8741 16.8824 16.7484C16.0613 17.6275 14.8922 18.1186 13.5117 18.1186H6.48436C5.10338 18.1186 3.93572 17.6274 3.11639 16.7478C2.30174 15.8732 1.87826 14.6656 1.87826 13.3098V6.68787C1.87826 5.33124 2.30429 4.12392 3.11981 3.24992Z"/>' +
            '<path fill-rule="evenodd" clip-rule="evenodd" fill="currentColor" d="M7.6628 6.94642C7.22021 6.94642 6.86238 7.30436 6.86238 7.74602C6.86238 8.18768 7.22021 8.54558 7.6628 8.54558C8.10434 8.54558 8.46242 8.18791 8.46242 7.74602C8.46242 7.30413 8.10434 6.94642 7.6628 6.94642ZM5.61238 7.74602C5.61238 6.61308 6.53078 5.69642 7.6628 5.69642C8.79425 5.69642 9.71242 6.61331 9.71242 7.74602C9.71242 8.87875 8.79425 9.79558 7.6628 9.79558C6.53078 9.79558 5.61238 8.879 5.61238 7.74602Z"/>' +
            '<path fill-rule="evenodd" clip-rule="evenodd" fill="currentColor" d="M18.1223 8.98858C18.1361 9.3335 17.8677 9.62425 17.5228 9.63808C14.0914 9.77525 11.1508 11.8398 9.7515 14.7734C9.34175 15.6393 9.06858 16.5718 8.95492 17.5657C8.91575 17.9087 8.60592 18.1548 8.26301 18.1157C7.92007 18.0764 7.67384 17.7667 7.71305 17.4237C7.84263 16.2903 8.15473 15.2252 8.62208 14.2378L8.62283 14.2363C10.214 10.8994 13.5603 8.54542 17.4728 8.38908C17.8178 8.37525 18.1086 8.64375 18.1223 8.98858Z"/>' +
            '<path fill-rule="evenodd" clip-rule="evenodd" fill="currentColor" d="M1.8771 10.9265C1.90513 10.5825 2.20675 10.3263 2.55079 10.3543C5.42302 10.5883 7.95863 11.999 9.67133 14.1097C9.88883 14.3778 9.84783 14.7713 9.57983 14.9888C9.31183 15.2063 8.91817 15.1653 8.70067 14.8973C7.19608 13.0431 4.97059 11.8057 2.44927 11.6002C2.10524 11.5722 1.84907 11.2706 1.8771 10.9265Z"/></g></svg>'
        );
    }

    function getLearnContentImgTrailerEmptyIaHeroMarkup(opts) {
        opts = opts || {};
        if (opts.emptyIaHeroIconSrc) {
            return (
                '<img class="ubits-learn-img-trailer__empty-ia-hero-icon" src="' +
                escapeHtml(opts.emptyIaHeroIconSrc) +
                '" alt="" width="20" height="20">'
            );
        }
        var heroIconClass =
            opts.emptyIaHeroIconClass != null
                ? opts.emptyIaHeroIconClass
                : LEARN_CONTENT_IMG_TRAILER_EMPTY_IA_DEFAULTS.emptyIaHeroIconClass;
        if (heroIconClass) {
            return '<i class="' + escapeHtml(heroIconClass) + '"></i>';
        }
        return getLearnContentImgTrailerEmptyIaHeroSvgInner();
    }

    /**
     * Bloque vacío: icono, título, descripción y CTA ia-button primario sm.
     * @param {{ ctaId?: string, emptyIaTitle?: string, emptyIaDescription?: string, emptyIaCta?: string, emptyIaHeroIconClass?: string, emptyIaHeroIconSrc?: string, emptyIaCtaIconClass?: string, includeErrorPlaceholder?: boolean, errorPlaceholder?: string }} [opts]
     */
    function getLearnContentImgTrailerEmptyIaHtml(opts) {
        opts = opts || {};
        var defs = LEARN_CONTENT_IMG_TRAILER_EMPTY_IA_DEFAULTS;
        var title = opts.emptyIaTitle != null ? opts.emptyIaTitle : defs.emptyIaTitle;
        var desc = opts.emptyIaDescription != null ? opts.emptyIaDescription : defs.emptyIaDescription;
        var cta = opts.emptyIaCta != null ? opts.emptyIaCta : defs.emptyIaCta;
        var heroInner = getLearnContentImgTrailerEmptyIaHeroMarkup(opts);
        var ctaIcon = opts.emptyIaCtaIconClass != null ? opts.emptyIaCtaIconClass : defs.emptyIaCtaIconClass;
        var ctaIdAttr = opts.ctaId ? ' id="' + escapeHtml(opts.ctaId) + '"' : '';
        var ctaLeading =
            typeof window.getIaButtonSparklesMarkup === 'function'
                ? window.getIaButtonSparklesMarkup()
                : '<i class="' + escapeHtml(ctaIcon) + '"></i>';
        var errLine = '';
        if (opts.includeErrorPlaceholder) {
            var em = opts.errorPlaceholder != null ? opts.errorPlaceholder : 'Mensaje de error';
            errLine = '<p class="ubits-learn-img-trailer__error-msg ubits-body-sm-regular">' + escapeHtml(em) + '</p>';
        }
        return (
            '<div class="ubits-learn-img-trailer__empty ubits-learn-img-trailer__empty--ia">' +
            '<div class="ubits-learn-img-trailer__empty-ia-stack" role="group" aria-label="' +
            escapeHtml(title) +
            '">' +
            '<div class="ubits-learn-img-trailer__empty-ia-icon-wrap">' +
            '<span class="ubits-learn-img-trailer__empty-ia-icon" aria-hidden="true">' +
            heroInner +
            '</span></div>' +
            '<p class="ubits-learn-img-trailer__empty-ia-title ubits-body-md-bold">' +
            escapeHtml(title) +
            '</p>' +
            '<p class="ubits-learn-img-trailer__empty-ia-desc ubits-body-sm-regular">' +
            escapeHtml(desc) +
            '</p>' +
            '<button type="button" class="ubits-ia-button ubits-ia-button--primary ubits-ia-button--sm ubits-learn-img-trailer__cta"' +
            ctaIdAttr +
            '>' +
            ctaLeading +
            '<span>' +
            escapeHtml(cta) +
            '</span></button>' +
            '</div>' +
            errLine +
            '</div>'
        );
    }

    /**
     * Bloque .ubits-learn-img-trailer__empty (única variante: vacío con IA).
     * @param {{ ctaId?: string, emptyIaTitle?: string, emptyIaDescription?: string, emptyIaCta?: string, includeErrorPlaceholder?: boolean, errorPlaceholder?: string }} [opts]
     */
    function getLearnContentImgTrailerEmptyHtml(opts) {
        return getLearnContentImgTrailerEmptyIaHtml(opts || {});
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

        if (
            root.hasAttribute('data-learn-img-trailer-init') &&
            !root.classList.contains('ubits-learn-img-trailer--image') &&
            !root.classList.contains('ubits-learn-img-trailer--trailer')
        ) {
            var existingCta = root.querySelector('.ubits-learn-img-trailer__cta');
            var ctaId =
                root.getAttribute('data-learn-img-trailer-cta-id') ||
                (existingCta && existingCta.id ? existingCta.id : '');
            root.innerHTML = getLearnContentImgTrailerEmptyHtml({
                ctaId: ctaId || undefined
            });
        }

        if (
            !root.classList.contains('ubits-learn-img-trailer--image') &&
            !root.classList.contains('ubits-learn-img-trailer--trailer')
        ) {
            root.classList.add('ubits-learn-img-trailer--empty-ia');
        } else {
            root.classList.remove('ubits-learn-img-trailer--empty-ia');
        }

        if (typeof window.initIaButtonSparkles === 'function') {
            window.initIaButtonSparkles(root);
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

    /**
     * Badge «Generado con IA» (variante outlined + IA, xs, icono sparkles).
     * Requiere: badge-tag.css, ubits-ia-appearance.css (o fallbacks en badge-tag), fontawesome-icons.css
     */
    function getGeneradoConIaBadgeHtml() {
        return (
            '<span class="ubits-badge-tag ubits-badge-tag--outlined ubits-badge-tag--ia ubits-badge-tag--xs ubits-badge-tag--with-icon ubits-generado-ia-badge" role="status">' +
            '<i class="far fa-sparkles"></i>' +
            '<span class="ubits-badge-tag__text">Generado con IA</span>' +
            '</span>'
        );
    }

    window.LEARN_CONTENT_IMG_TRAILER_DEFAULTS = LEARN_CONTENT_IMG_TRAILER_DEFAULTS;
    window.LEARN_CONTENT_IMG_TRAILER_EMPTY_IA_DEFAULTS = LEARN_CONTENT_IMG_TRAILER_EMPTY_IA_DEFAULTS;
    window.getLearnContentImgTrailerEmptyHtml = getLearnContentImgTrailerEmptyHtml;
    window.getLearnContentImgTrailerEmptyIaHtml = getLearnContentImgTrailerEmptyIaHtml;
    window.getLearnContentImgTrailerEmptyIaHeroMarkup = getLearnContentImgTrailerEmptyIaHeroMarkup;
    window.getLearnContentImgTrailerEditHtml = getLearnContentImgTrailerEditHtml;
    window.initLearnContentImgTrailer = initLearnContentImgTrailer;
    window.initAllLearnContentImgTrailers = initAllLearnContentImgTrailers;
    window.getTrailerEmbedUrl = getTrailerEmbedUrl;
    window.playLearnContentTrailerInline = playTrailerInline;
    window.playLearnContentTrailer = playTrailerVideo;
    window.getGeneradoConIaBadgeHtml = getGeneradoConIaBadgeHtml;
})();
