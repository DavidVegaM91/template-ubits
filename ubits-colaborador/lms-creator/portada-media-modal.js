/**
 * LMS Creator — Modal «Subir imagen de portada y trailer» (Creator v3).
 * Depende: modal.js (openModal, closeModal), input.js (createInput), input.css,
 * learn-content-img-trailer.js, learn-content-img-trailer.css, button.css
 */
(function (global) {
    'use strict';

    var OVERLAY_ID = 'portada-media-modal-overlay';
    var PORTADA_MAX_IMAGE_BYTES = 3 * 1024 * 1024;

    var TRAILER_HELPER =
        'Solo se admiten enlaces de Vimeo, YouTube, Google Drive y OneDrive';

    /** Validación de URL de tráiler (dominios admitidos; vacío = válido). */
    function isAllowedTrailerUrl(value) {
        var v = String(value || '').trim();
        if (!v.length) return true;
        try {
            var u = new URL(v);
            if (u.protocol !== 'http:' && u.protocol !== 'https:') return false;
            var h = u.hostname.toLowerCase();
            if (h === 'youtu.be' || h.endsWith('.youtu.be')) return true;
            if (h.includes('youtube.com') || h.includes('youtube-nocookie.com')) return true;
            if (h.includes('vimeo.com')) return true;
            if (h.includes('drive.google.com') || h.includes('docs.google.com')) return true;
            if (h.includes('google.com') && u.pathname.indexOf('/drive') !== -1) return true;
            if (h.includes('onedrive.') || h.includes('1drv.ms') || h.includes('sharepoint.com')) return true;
            return false;
        } catch (e) {
            return false;
        }
    }

    /** Patrón documentación input URL: borde según valor (manual). */
    function wirePortadaTrailerUrlValidation(inputEl) {
        if (!inputEl) return;
        function sync() {
            var value = String(inputEl.value || '').trim();
            var ok = value.length === 0 || isAllowedTrailerUrl(value);
            if (ok) {
                inputEl.style.borderColor = 'var(--ubits-border-1)';
                inputEl.style.borderWidth = '1px';
            } else {
                inputEl.style.borderColor = 'var(--ubits-feedback-accent-error)';
                inputEl.style.borderWidth = '2px';
            }
        }
        inputEl.addEventListener('input', sync);
        inputEl.addEventListener('blur', sync);
        sync();
    }

    /** Misma descripción que el bloque exterior + límite de peso (solo imagen en esta zona). */
    function getPortadaModalImageHint() {
        var base =
            global.LEARN_CONTENT_IMG_TRAILER_DEFAULTS && global.LEARN_CONTENT_IMG_TRAILER_DEFAULTS.hint
                ? global.LEARN_CONTENT_IMG_TRAILER_DEFAULTS.hint
                : 'Imagen en JPG o PNG. Además, tienes la opción de agregar un tráiler de video';
        return base + ', peso máximo 3 MB.';
    }

    function buildFigureHtml(dataUrl, hasTrailer) {
        var scrim =
            '<div class="ubits-learn-img-trailer__trailer-scrim" aria-hidden="false">' +
            '<span class="ubits-learn-img-trailer__trailer-scrim-bg" aria-hidden="true"></span>' +
            '<button type="button" class="ubits-learn-img-trailer__play" aria-label="' +
            (global.LEARN_CONTENT_IMG_TRAILER_DEFAULTS
                ? global.LEARN_CONTENT_IMG_TRAILER_DEFAULTS.playAriaLabel
                : 'Reproducir tráiler') +
            '">' +
            '<i class="fas fa-play"></i></button></div>';
        return (
            '<figure class="ubits-learn-img-trailer__media">' +
            '<img class="ubits-learn-img-trailer__img" alt="" src="' +
            esc(dataUrl) +
            '">' +
            (hasTrailer ? scrim : '') +
            '</figure>'
        );
    }

    function esc(s) {
        if (s == null) return '';
        var d = document.createElement('div');
        d.textContent = s;
        return d.innerHTML;
    }

    function buildThumbInnerHtml(dataUrl, trailerUrl) {
        var hasImg = dataUrl && String(dataUrl).length > 0;
        var hasTrailer = !!(trailerUrl && String(trailerUrl).trim());
        if (!hasImg) {
            return (
                '<div class="portada-modal__thumb-wrap">' +
                '<div class="ubits-learn-img-trailer portada-modal__learn">' +
                global.getLearnContentImgTrailerEmptyHtml({
                    ctaId: 'portada-modal-cta',
                    hint: getPortadaModalImageHint()
                }) +
                '</div></div>'
            );
        }
        var rootClass =
            'ubits-learn-img-trailer ubits-learn-img-trailer--image portada-modal__learn' +
            (hasTrailer ? ' ubits-learn-img-trailer--trailer' : '');
        return (
            '<div class="portada-modal__thumb-wrap">' +
            '<div class="' +
            rootClass +
            '">' +
            global.getLearnContentImgTrailerEmptyHtml({ hint: getPortadaModalImageHint() }) +
            buildFigureHtml(dataUrl, hasTrailer) +
            global.getLearnContentImgTrailerEditHtml({ editButtonId: 'portada-modal-img-edit' }) +
            '</div></div>'
        );
    }

    function buildModalBodyHtml(dataUrl, trailerUrl) {
        var tv = trailerUrl != null ? String(trailerUrl) : '';
        return (
            '<div class="portada-modal__stack">' +
            '<input type="file" id="portada-modal-file" class="contenidos-creator-file-hidden" accept="image/jpeg,image/jpg,image/png" tabindex="-1" aria-hidden="true">' +
            '<div>' +
            '<p class="portada-modal__section-title ubits-body-xs-semibold">Imagen de portada</p>' +
            '<p class="portada-modal__intro ubits-body-xs-regular">Ajustaremos tu imagen para que tenga un formato rectangular panorámico (16:9) automáticamente.</p>' +
            '</div>' +
            '<div id="portada-modal-thumb-root">' +
            buildThumbInnerHtml(dataUrl, tv) +
            '</div>' +
            '<div class="portada-modal__trailer-host">' +
            '<div id="portada-modal-trailer-input-host"></div>' +
            '</div>' +
            '<div class="portada-modal__info">' +
            '<i class="far fa-circle-info" aria-hidden="true"></i>' +
            '<p class="ubits-body-xs-regular">Para previsualizar el tráiler debes dar clic en el botón «Confirmar» y verlo en la página de Información general.</p>' +
            '</div>' +
            '</div>'
        );
    }

    function wireThumbAndPlay(root) {
        var thumbHost = root.querySelector('#portada-modal-thumb-root .portada-modal__learn');
        if (thumbHost && global.initLearnContentImgTrailer) {
            thumbHost.removeAttribute('data-img-trailer-init');
            thumbHost.removeAttribute('data-learn-img-trailer-init');
            global.initLearnContentImgTrailer(thumbHost, {
                onPlay: function () {
                    if (typeof global.showToast === 'function') {
                        global.showToast(
                            'info',
                            'Vista previa del tráiler disponible tras confirmar en Información general.',
                            { containerId: 'ubits-toast-container', duration: 3500 }
                        );
                    }
                }
            });
        }
    }

    function setConfirmEnabled(overlay, enabled) {
        var btn = overlay.querySelector('#portada-modal-btn-confirm');
        if (btn) btn.disabled = !enabled;
    }

    /**
     * @param {{ dataUrl?: string|null, trailerUrl?: string, onConfirm?: function({ dataUrl: string|null, trailerUrl: string }), onCancel?: function() }} opts
     */
    function openPortadaTrailerModal(opts) {
        opts = opts || {};
        if (typeof global.openModal !== 'function') return;

        var dataUrl = opts.dataUrl != null ? opts.dataUrl : null;
        var trailerUrl = opts.trailerUrl != null ? String(opts.trailerUrl) : '';
        var trailerInputApi = null;

        var overlay = global.openModal({
            overlayId: OVERLAY_ID,
            title: 'Subir imagen de portada y trailer',
            bodyHtml: buildModalBodyHtml(dataUrl, trailerUrl),
            footerHtml:
                '<button type="button" class="ubits-button ubits-button--secondary ubits-button--md" id="portada-modal-btn-cancel"><span>Cancelar</span></button>' +
                '<button type="button" class="ubits-button ubits-button--primary ubits-button--md" id="portada-modal-btn-confirm"><span>Confirmar</span></button>',
            size: 'sm',
            closeOnOverlayClick: true,
            onClose: function () {
                if (typeof opts.onCancel === 'function') opts.onCancel();
            }
        });

        setConfirmEnabled(overlay, !!(dataUrl && String(dataUrl).length));

        function getTrailerUrlFromInput() {
            return trailerInputApi && typeof trailerInputApi.getValue === 'function'
                ? String(trailerInputApi.getValue() || '').trim()
                : '';
        }

        function mountPortadaModalTrailerInput() {
            trailerInputApi = null;
            var host = document.getElementById('portada-modal-trailer-input-host');
            if (!host || typeof global.createInput !== 'function') return;
            host.innerHTML = '';
            trailerInputApi = global.createInput({
                containerId: 'portada-modal-trailer-input-host',
                type: 'url',
                label: 'Trailer',
                mandatory: true,
                mandatoryType: 'Opcional',
                placeholder: 'Pega el link del video del trailer',
                helperText: TRAILER_HELPER,
                showHelper: true,
                size: 'sm',
                value: trailerUrl,
                onChange: function () {
                    refreshThumb();
                }
            });
            setTimeout(function () {
                var inputEl = document.querySelector('#portada-modal-trailer-input-host input');
                if (inputEl) wirePortadaTrailerUrlValidation(inputEl);
            }, 500);
        }

        function refreshThumb() {
            var rootEl = document.getElementById('portada-modal-thumb-root');
            var tv = getTrailerUrlFromInput();
            if (rootEl) {
                rootEl.innerHTML = buildThumbInnerHtml(dataUrl, tv);
                wireThumbAndPlay(document.getElementById(OVERLAY_ID));
                bindThumbCtas();
            }
            var ov = document.getElementById(OVERLAY_ID);
            if (ov) setConfirmEnabled(ov, !!(dataUrl && String(dataUrl).length));
        }

        function bindThumbCtas() {
            var fileEl = document.getElementById('portada-modal-file');
            var cta = document.getElementById('portada-modal-cta');
            var editBtn = document.getElementById('portada-modal-img-edit');
            if (fileEl && cta) {
                cta.onclick = function (e) {
                    e.preventDefault();
                    fileEl.click();
                };
            }
            if (fileEl && editBtn) {
                editBtn.onclick = function (e) {
                    e.preventDefault();
                    fileEl.click();
                };
            }
            if (fileEl) {
                fileEl.onchange = function () {
                    var f = fileEl.files && fileEl.files[0];
                    if (!f || !f.type || f.type.indexOf('image/') !== 0) return;
                    if (f.size > PORTADA_MAX_IMAGE_BYTES) {
                        if (typeof global.showToast === 'function') {
                            global.showToast('warning', 'La imagen supera el peso máximo de 3 MB.', {
                                containerId: 'ubits-toast-container',
                                duration: 4500
                            });
                        }
                        fileEl.value = '';
                        return;
                    }
                    var r = new FileReader();
                    r.onload = function () {
                        dataUrl = r.result;
                        fileEl.value = '';
                        refreshThumb();
                    };
                    r.readAsDataURL(f);
                };
            }
        }

        mountPortadaModalTrailerInput();

        bindThumbCtas();
        wireThumbAndPlay(document.getElementById(OVERLAY_ID));

        var btnCancel = document.getElementById('portada-modal-btn-cancel');
        var btnConfirm = document.getElementById('portada-modal-btn-confirm');
        if (btnCancel) {
            btnCancel.addEventListener('click', function () {
                var x = document.getElementById(OVERLAY_ID) && document.getElementById(OVERLAY_ID).querySelector('.ubits-modal-close');
                if (x) x.click();
            });
        }
        if (btnConfirm) {
            btnConfirm.addEventListener('click', function () {
                if (!dataUrl || !String(dataUrl).length) {
                    if (typeof global.showToast === 'function') {
                        global.showToast('warning', 'Selecciona una imagen de portada para continuar.', {
                            containerId: 'ubits-toast-container',
                            duration: 4000
                        });
                    }
                    return;
                }
                var tv = getTrailerUrlFromInput();
                if (tv.length > 0 && !isAllowedTrailerUrl(tv)) {
                    if (typeof global.showToast === 'function') {
                        global.showToast(
                            'warning',
                            'Introduce un enlace válido de Vimeo, YouTube, Google Drive u OneDrive.',
                            { containerId: 'ubits-toast-container', duration: 4500 }
                        );
                    }
                    return;
                }
                if (typeof opts.onConfirm === 'function') {
                    opts.onConfirm({ dataUrl: dataUrl, trailerUrl: tv });
                }
                if (typeof global.closeModal === 'function') global.closeModal(OVERLAY_ID);
            });
        }

        return overlay;
    }

    global.openPortadaTrailerModal = openPortadaTrailerModal;
})(typeof window !== 'undefined' ? window : this);
