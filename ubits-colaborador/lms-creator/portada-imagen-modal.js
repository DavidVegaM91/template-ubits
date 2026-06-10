/**
 * LMS Creator — Modal «Agregar portada» (Portada con IA · Subir portada · Enlace de tráiler opcional).
 * Estilo y tabs alineados a video-recurso-modal.js.
 * Portada con IA: al abrir, ancho `sm` o `md` si el viewport es >1440px; bloque de copy + textarea; al pulsar «Generar portada»
 * aparece la vista previa 16:9 arriba y el formulario debajo (columna única). Las tres pestañas comparten el mismo tamaño de modal.
 * El ancho sm/md (>1440px) se mantiene al redimensionar la ventana mientras el modal está abierto.
 * Depende: modal.js, button.css, chip.css, input.js (+ dropdown-menu.js antes de input) para pestaña tráiler,
 * file-upload.js, ia-loader.js, empty-state.js, ai-panel.css (+ general-styles/ubits-ia-chat.css), tab.css,
 * portada-imagen-modal.css.
 *
 * openPortadaImagenModal(opts) — opts opcionales al reabrir con portada ya aplicada en la página:
 *   editStartTab: 'ia' | 'subir'
 *   editIaPrompt + editIaPreviewSrc: pestaña IA con prompt y vista previa (misma imagen).
 *   editSubirDataUrl: pestaña Subir con file upload mostrando la imagen actual (data URL o http).
 */
(function (global) {
    'use strict';

    var OVERLAY_ID = 'cc-portada-imagen-modal';
    var TOKEN_GENERATE = 2;
    var MAX_IMAGE_MB = 5;
    /** Si innerWidth es estrictamente mayor a este valor, `openModal` usa tamaño `md`; si no, `sm`. */
    var PIM_MODAL_WIDE_MIN_PX = 1440;
    var AI_IMAGES = [
        '../../images/cards-learn/portadas-ia/01-personas-en-oficina.jpg',
        '../../images/cards-learn/portadas-ia/02-personas-en-oficina.jpg',
        '../../images/cards-learn/portadas-ia/03-personas-en-oficina.jpg',
        '../../images/cards-learn/portadas-ia/04-personas-en-oficina.jpg',
        '../../images/cards-learn/portadas-ia/05-personas-en-oficina.jpg',
        '../../images/cards-learn/portadas-ia/06-personas-en-oficina.jpg',
        '../../images/cards-learn/portadas-ia/07-personas-en-oficina.jpg'
    ];

    var _onApply = null;
    var _onTrailerSaved = null;
    var _currentTab = 'ia';
    var _iaImageIndex = 0;
    var _iaResultSrc = '';
    var _uploadDataUrl = '';
    var _modalTrailerUrl = '';
    var _trailerInputInited = false;
    var _subirFuInited = false;
    /** Primera vez en la pestaña IA: modal pequeño, solo input; tras «Generar portada» se expande con preview. */
    var _pimIaLayoutExpanded = false;
    /** Referencias adjuntas en pestaña Portada con IA (mismo patrón que guión video / SCORM). */
    var _pimPendingImgs = [];
    var _pimPendingFiles = [];
    var _pimOnWindowResize = null;
    var _pimResizeRaf = null;

    function getTokens() {
        return global._ubitsAiTokenPool != null ? global._ubitsAiTokenPool : 200;
    }

    function syncPimTokensBadge() {
        var n = getTokens();
        var el = document.getElementById('cc-pim-modal-tokens-badge');
        if (!el) return;
        var num = el.querySelector('.ubits-badge-tag__token-number');
        if (num) num.textContent = String(n);
        el.setAttribute('aria-label', String(n) + ' tokens restantes');
        var show = _currentTab === 'ia';
        el.style.display = show ? '' : 'none';
        el.setAttribute('aria-hidden', show ? 'false' : 'true');
    }

    function trySpendTokens(cost) {
        var cur = getTokens();
        if (cur < cost) {
            if (typeof global.showToast === 'function') {
                global.showToast('warning', 'No tienes suficientes tokens (' + cost + ' requeridos).', {
                    containerId: 'ubits-toast-container'
                });
            }
            return false;
        }
        var next = Math.max(0, cur - cost);
        global._ubitsAiTokenPool = next;
        if (typeof global.setAIPanelTokensBadgeValue === 'function') {
            global.setAIPanelTokensBadgeValue(next);
        }
        syncPimTokensBadge();
        return true;
    }

    function esc(s) {
        if (s == null) return '';
        var d = document.createElement('div');
        d.textContent = s;
        return d.innerHTML;
    }

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

    function randomizeIaImageIndex() {
        var n = AI_IMAGES.length;
        if (n <= 1) return;
        var prev = _iaImageIndex;
        var next = Math.floor(Math.random() * n);
        var tries = 0;
        while (next === prev && tries < 16) {
            next = Math.floor(Math.random() * n);
            tries += 1;
        }
        if (next === prev) next = (prev + 1) % n;
        _iaImageIndex = next;
    }

    /** Clases y body específicos del modal portada (chrome IA base: openModal variant + modal.css). */
    function applyAiChrome(overlay) {
        var modalContent = overlay.querySelector('.ubits-modal-content');
        if (modalContent) {
            modalContent.classList.add('portada-ia-modal-content', 'cc-pim-modal-content');
        }

        var modalBody = overlay.querySelector('.ubits-modal-body');
        if (modalBody) {
            modalBody.style.padding = 'var(--padding-xl, 32px)';
            /* overflow: lo controla portada-imagen-modal.css (scroll en cuerpo si el contenido supera 90vh). */
            modalBody.style.overflow = '';
            modalBody.style.display = 'flex';
            modalBody.style.flexDirection = 'column';
        }

        syncPimTokensBadge();
    }

    function buildTabBar() {
        return (
            '<div id="cc-pim-tabbar" class="cc-vmodal-tabbar" role="tablist">' +
            '<div class="ubits-tabs-on-bg">' +
            '<button type="button" class="ubits-tab ubits-tab--sm ubits-tab--active" role="tab" aria-selected="true" data-cc-pim-tab="ia">' +
            '<span>Portada con IA</span></button>' +
            '<button type="button" class="ubits-tab ubits-tab--sm" role="tab" aria-selected="false" data-cc-pim-tab="subir">' +
            '<span>Subir portada</span></button>' +
            '<button type="button" class="ubits-tab ubits-tab--sm" role="tab" aria-selected="false" data-cc-pim-tab="trailer">' +
            '<span>Tráiler (opcional)</span></button>' +
            '</div></div>'
        );
    }

    function buildIaPanel() {
        return (
            '<div class="cc-vmodal-panel" id="cc-pim-tab-ia">' +
            '<div class="cc-vm-ia-layout" id="cc-pim-ia-layout">' +
            '<div class="cc-vm-left-col">' +
            '<div class="cc-vm-section">' +
            '<div class="cc-pim-idea-headline-intro" role="presentation">' +
            '<p class="cc-pim-idea-headline-intro__text">Tú lo imaginas, nosotros ' +
            '<span class="cc-pim-idea-headline-intro__gradient">lo generamos</span></p>' +
            '</div>' +
            '<div class="ubits-ia-chat-thread__input-area">' +
            '<div class="ai-panel__input-box" id="cc-pim-idea-input-box">' +
            '<input type="file" id="cc-pim-ref-files" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.ppt,.pptx" multiple hidden>' +
            '<div class="ai-panel__pending-images-strip" id="cc-pim-pending-imgs" style="display:none;"></div>' +
            '<div class="ai-panel__pending-files-strip" id="cc-pim-pending-files" style="display:none;"></div>' +
            '<textarea id="cc-pim-idea-input" class="ai-panel__input ubits-body-md-regular" rows="2" placeholder="Describe tu portada de forma específica"></textarea>' +
            '<div class="ai-panel__input-actions">' +
            '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm ubits-button--icon-only ai-panel__attach-btn" id="cc-pim-attach" aria-label="Adjuntar referencia">' +
            '<i class="far fa-plus"></i></button>' +
            '<div class="ai-panel__input-spacer" aria-hidden="true"></div>' +
            '<button type="button" class="ubits-ia-button ubits-ia-button--primary ubits-ia-button--sm ubits-ia-button--with-token-cost" id="cc-pim-btn-generar">' +
            '<span>Generar portada</span>' +
            '<span class="ubits-ia-button__token-divider" aria-hidden="true"></span>' +
            '<span class="ubits-ia-button__token-cost" aria-hidden="true">' +
            '<i class="far fa-coin-vertical"></i>' +
            '<span class="ubits-ia-button__token-number">' +
            TOKEN_GENERATE +
            '</span></span></button>' +
            '</div></div></div></div></div>' +
            '<div class="cc-vm-right-col">' +
            '<div class="cc-pim-preview-stage" id="cc-pim-preview-stage" aria-live="polite">' +
            '<div id="cc-pim-preview-empty-host"></div>' +
            '<div class="cc-pim-preview-loader-host" id="cc-pim-preview-loader" style="display:none" aria-busy="true"></div>' +
            '<div class="cc-pim-preview-result" id="cc-pim-preview-result" style="display:none"></div>' +
            '</div></div></div></div>'
        );
    }

    function buildSubirPanel() {
        return (
            '<div class="cc-vmodal-panel cc-vmodal-panel--hidden" id="cc-pim-tab-subir">' +
            '<div class="cc-vmodal-subir-layout">' +
            '<div class="cc-vmodal-subir-centered">' +
            '<div id="cc-pim-subir-fu-wrap"></div></div></div></div>'
        );
    }

    function buildTrailerPanel() {
        return (
            '<div class="cc-vmodal-panel cc-vmodal-panel--hidden" id="cc-pim-tab-trailer">' +
            '<div class="cc-vmodal-enlace-layout">' +
            '<div class="cc-vmodal-enlace-centered">' +
            '<p class="cc-vmodal-enlace-title">Pega el <span class="cc-vmodal-enlace-title-em">enlace del tráiler</span> que quieres cargar</p>' +
            '<div id="cc-pim-trailer-input-wrap"></div></div></div></div>'
        );
    }

    function buildBody() {
        return '<div class="cc-vmodal">' + buildTabBar() + buildIaPanel() + buildSubirPanel() + buildTrailerPanel() + '</div>';
    }

    function buildFooter() {
        return (
            '<div class="ubits-modal-footer__right">' +
            '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm" id="cc-pim-footer-cancel">' +
            '<span>Cancelar</span></button>' +
            '<button type="button" class="ubits-button ubits-button--primary ubits-button--sm" id="cc-pim-footer-use-ia" style="display:none">' +
            '<span>Usar esta imagen</span></button>' +
            '<button type="button" class="ubits-button ubits-button--primary ubits-button--sm" id="cc-pim-footer-use-upload" style="display:none">' +
            '<span>Usar esta imagen</span></button>' +
            '<button type="button" class="ubits-button ubits-button--primary ubits-button--sm" id="cc-pim-footer-save-trailer" style="display:none">' +
            '<span>Guardar tráiler</span></button>' +
            '</div>'
        );
    }

    function setPreviewState(mode) {
        var emptyHost = document.getElementById('cc-pim-preview-empty-host');
        var ld = document.getElementById('cc-pim-preview-loader');
        var rs = document.getElementById('cc-pim-preview-result');
        if (emptyHost) {
            emptyHost.style.display = mode === 'placeholder' ? 'flex' : 'none';
        }
        if (ld) ld.style.display = mode === 'loader' ? '' : 'none';
        if (rs) rs.style.display = mode === 'result' ? '' : 'none';
    }

    function initPimPreviewEmptyState() {
        var host = document.getElementById('cc-pim-preview-empty-host');
        if (!host || typeof global.loadEmptyState !== 'function') return;
        global.loadEmptyState('cc-pim-preview-empty-host', {
            icon: 'fa-image',
            iconSize: 'md',
            title: 'Vista previa de la portada',
            description: 'Aquí verás la portada cuando la generes con IA.'
        });
    }

    function renderIaResult(src) {
        var rs = document.getElementById('cc-pim-preview-result');
        if (!rs) return;
        rs.innerHTML =
            '<div class="cc-pim-result-surface">' +
            '<img id="cc-pim-result-img" class="cc-pim-result-img" src="' +
            esc(src) +
            '" alt="Portada generada">' +
            '<button type="button" class="ubits-button ubits-button--secondary ubits-button--xs ubits-button--icon-only cc-pim-result-download" id="cc-pim-btn-download" aria-label="Descargar portada">' +
            '<i class="far fa-download"></i></button></div>';
        wireDownload();
        refreshGenButtons();
    }

    function refreshGenButtons() {
        /* Sin bloqueo por tokens: trySpendTokens muestra toast al clic si no alcanza (como SCORM). */
        syncPimTokensBadge();
    }

    function pimDownloadFilename(src) {
        var s = String(src || '');
        var m = s.match(/\.(jpe?g|png|webp|gif)(\?|$)/i);
        if (m) return 'portada-generada.' + m[1].toLowerCase().replace('jpeg', 'jpg');
        return 'portada-generada.jpg';
    }

    function wireDownload() {
        var btn = document.getElementById('cc-pim-btn-download');
        if (!btn) return;
        btn.onclick = function () {
            var src = _iaResultSrc;
            var img = document.getElementById('cc-pim-result-img');
            if (!src && img) src = img.getAttribute('src') || '';
            if (!src) return;
            var a = document.createElement('a');
            a.href = src;
            a.download = pimDownloadFilename(src);
            a.rel = 'noopener';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            if (typeof global.showToast === 'function') {
                global.showToast('success', 'Descarga iniciada.', { containerId: 'ubits-toast-container' });
            }
        };
    }

    function getPimIdeaText() {
        var ta = document.getElementById('cc-pim-idea-input');
        return ta ? String(ta.value || '').trim() : '';
    }

    function getPimIdeaInputBox() {
        return document.getElementById('cc-pim-idea-input-box');
    }

    function clearPimIdeaError() {
        var box = getPimIdeaInputBox();
        if (box) box.classList.remove('ai-panel__input-box--context-error');
    }

    /** Texto en el área o al menos un adjunto (imagen o documento). */
    function pimHasIdeaMaterial() {
        if (getPimIdeaText().length) return true;
        return _pimPendingImgs.length > 0 || _pimPendingFiles.length > 0;
    }

    function renderPimPendingImgs() {
        var strip = document.getElementById('cc-pim-pending-imgs');
        if (!strip) return;
        if (!_pimPendingImgs.length) {
            strip.style.display = 'none';
            strip.innerHTML = '';
            return;
        }
        strip.style.display = 'flex';
        strip.innerHTML = _pimPendingImgs
            .map(function (img, i) {
                return (
                    '<div class="ai-panel__pending-img-wrap">' +
                    '<img src="' +
                    img.src +
                    '" alt="' +
                    esc(img.name) +
                    '">' +
                    '<button type="button" class="ai-panel__pending-img-remove" data-pim-rm-img="' +
                    i +
                    '" aria-label="Quitar imagen"><i class="far fa-times"></i></button>' +
                    '</div>'
                );
            })
            .join('');
        strip.querySelectorAll('[data-pim-rm-img]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                _pimPendingImgs.splice(parseInt(btn.getAttribute('data-pim-rm-img'), 10), 1);
                renderPimPendingImgs();
            });
        });
        if (_pimPendingImgs.length) clearPimIdeaError();
    }

    function renderPimPendingFiles() {
        var strip = document.getElementById('cc-pim-pending-files');
        if (!strip) return;
        if (!_pimPendingFiles.length) {
            strip.style.display = 'none';
            strip.innerHTML = '';
            return;
        }
        strip.style.display = 'flex';
        strip.innerHTML = _pimPendingFiles
            .map(function (f, i) {
                return (
                    '<span class="ubits-chip ubits-chip--sm ubits-chip--icon-left ubits-chip--close ai-panel__pending-file-chip">' +
                    '<i class="far fa-file-lines" aria-hidden="true"></i>' +
                    '<span class="ubits-chip__text">' +
                    esc(f.name) +
                    '</span>' +
                    '<button type="button" class="ubits-chip__close" data-pim-rm-file="' +
                    i +
                    '" aria-label="Quitar archivo">' +
                    '<i class="far fa-times"></i></button>' +
                    '</span>'
                );
            })
            .join('');
        strip.querySelectorAll('[data-pim-rm-file]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                _pimPendingFiles.splice(parseInt(btn.getAttribute('data-pim-rm-file'), 10), 1);
                renderPimPendingFiles();
            });
        });
        if (_pimPendingFiles.length) clearPimIdeaError();
    }

    function initPimAttach() {
        var attachBtn = document.getElementById('cc-pim-attach');
        var fileIn = document.getElementById('cc-pim-ref-files');
        if (!attachBtn || !fileIn || attachBtn._ccPimAttachWired) return;
        attachBtn._ccPimAttachWired = true;

        attachBtn.addEventListener('click', function () {
            fileIn.click();
        });

        fileIn.addEventListener('change', function () {
            if (!fileIn.files || !fileIn.files.length) return;
            Array.prototype.forEach.call(fileIn.files, function (f) {
                if (f.type && f.type.indexOf('image/') === 0) {
                    var reader = new FileReader();
                    reader.onload = function (ev) {
                        _pimPendingImgs.push({
                            name: f.name,
                            src: ev && ev.target ? ev.target.result : ''
                        });
                        renderPimPendingImgs();
                    };
                    reader.readAsDataURL(f);
                } else {
                    _pimPendingFiles.push({ name: f.name, type: f.type, size: f.size });
                    renderPimPendingFiles();
                }
            });
            fileIn.value = '';
        });
    }

    function formatPimApproxBytes(bytes) {
        var n = typeof bytes === 'number' && !isNaN(bytes) ? Math.max(0, bytes) : 0;
        if (n < 1024) return n + ' B';
        if (n < 1048576) return (n / 1024).toFixed(1) + ' KB';
        return (n / 1048576).toFixed(1) + ' MB';
    }

    /**
     * Tras createFileUpload en la pestaña Subir: muestra la tarjeta de archivo con la portada actual (data URL)
     * sin File nativo, para que «Usar esta imagen» siga el mismo flujo (_uploadDataUrl).
     */
    function hydrateSubirTabFromDataUrl(dataUrl) {
        if (!dataUrl || typeof dataUrl !== 'string') return;
        _uploadDataUrl = dataUrl;
        var root = document.getElementById('cc-pim-subir-fu');
        if (!root) return;
        var emptyEl = root.querySelector('[data-file-upload-empty]');
        var cardEl = root.querySelector('[data-file-upload-card]');
        var nameEl = root.querySelector('[data-file-upload-name]');
        var sizeEl = root.querySelector('[data-file-upload-size]');
        var dropzone = root.querySelector('[data-file-upload-dropzone]');
        if (nameEl) nameEl.textContent = 'Imagen de portada actual';
        if (sizeEl) {
            var approx = Math.floor((dataUrl.length * 3) / 4);
            sizeEl.textContent = formatPimApproxBytes(approx);
        }
        if (emptyEl) emptyEl.style.display = 'none';
        if (cardEl) cardEl.style.display = '';
        if (dropzone) {
            dropzone.classList.add('ubits-file-upload__dropzone--has-file');
            dropzone.classList.remove('ubits-file-upload__dropzone--dragover', 'ubits-file-upload__dropzone--invalid');
        }
        if (typeof global.fileUploadClearError === 'function') {
            global.fileUploadClearError(root);
        }
        if (typeof global.fileUploadClearSuccess === 'function') {
            global.fileUploadClearSuccess(root);
        }
        syncFooter();
    }

    var PIM_IDEA_TEXTAREA_AUTOSIZE_MAX_PX = 360;

    function autosizePimIdeaTextarea() {
        var ta = document.getElementById('cc-pim-idea-input');
        if (!ta) return;
        ta.style.height = 'auto';
        var sh = ta.scrollHeight;
        var cap = PIM_IDEA_TEXTAREA_AUTOSIZE_MAX_PX;
        var next = Math.min(sh, cap);
        ta.style.height = Math.max(40, next) + 'px';
        ta.style.overflowY = sh > cap ? 'auto' : 'hidden';
    }

    function initIdeaInput() {
        var ta = document.getElementById('cc-pim-idea-input');
        if (!ta || ta._ccPimIdeaWired) return;
        ta._ccPimIdeaWired = true;
        ta.addEventListener('input', function () {
            clearPimIdeaError();
            refreshGenButtons();
            autosizePimIdeaTextarea();
        });
        setTimeout(autosizePimIdeaTextarea, 0);
    }

    function initGenerarPortada() {
        var btn = document.getElementById('cc-pim-btn-generar');
        if (!btn || btn._ccPimWired) return;
        btn._ccPimWired = true;
        btn.addEventListener('click', function () {
            if (!pimHasIdeaMaterial()) {
                var box = getPimIdeaInputBox();
                if (box) box.classList.add('ai-panel__input-box--context-error');
                var taErr = document.getElementById('cc-pim-idea-input');
                if (taErr) taErr.focus();
                if (typeof global.showToast === 'function') {
                    global.showToast(
                        'warning',
                        'Adjunta referencias o escribe una descripción para generar la portada.',
                        { containerId: 'ubits-toast-container' }
                    );
                }
                return;
            }
            clearPimIdeaError();
            if (!trySpendTokens(TOKEN_GENERATE)) return;
            if (typeof global.setIaButtonGenerating === 'function') {
                global.setIaButtonGenerating(btn, true, { label: 'Generando' });
            } else {
                btn.disabled = true;
            }
            _iaResultSrc = '';
            var justExpanded = false;
            if (!_pimIaLayoutExpanded) {
                _pimIaLayoutExpanded = true;
                justExpanded = true;
                syncPimOverlayLayout();
            }
            syncFooter();
            randomizeIaImageIndex();
            function runLoader() {
                setPreviewState('loader');
                var ld = document.getElementById('cc-pim-preview-loader');
                if (ld) {
                    ld.innerHTML =
                        typeof global.getIaLoaderHTML === 'function'
                            ? global.getIaLoaderHTML({ label: 'Generando portada' })
                            : '<p class="ubits-body-sm-regular" role="status">Generando portada…</p>';
                }
            }
            if (justExpanded) {
                requestAnimationFrame(function () {
                    requestAnimationFrame(function () {
                        setTimeout(runLoader, 140);
                    });
                });
            } else {
                runLoader();
            }
            setTimeout(function () {
                _iaResultSrc = AI_IMAGES[_iaImageIndex];
                renderIaResult(_iaResultSrc);
                setPreviewState('result');
                if (typeof global.setIaButtonGenerating === 'function') {
                    global.setIaButtonGenerating(btn, false);
                } else {
                    btn.disabled = false;
                }
                syncFooter();
                refreshGenButtons();
            }, 3000);
        });
    }

    function initSubirFileUpload() {
        var wrap = document.getElementById('cc-pim-subir-fu-wrap');
        if (!wrap || _subirFuInited || typeof global.createFileUpload !== 'function') return;
        _subirFuInited = true;
        global.createFileUpload({
            containerId: 'cc-pim-subir-fu-wrap',
            id: 'cc-pim-subir-fu',
            title: 'Imagen de portada',
            accept: 'image/jpeg,image/png,.jpg,.jpeg,.png',
            maxSizeMb: MAX_IMAGE_MB,
            maxLabel: '5 MB',
            formats: 'JPG, PNG · Hasta 5 MB',
            successMessage: false,
            onChange: function (file) {
                _uploadDataUrl = '';
                if (!file) {
                    syncFooter();
                    return;
                }
                var reader = new FileReader();
                reader.onload = function (ev) {
                    _uploadDataUrl = ev && ev.target ? ev.target.result : '';
                    syncFooter();
                };
                reader.readAsDataURL(file);
            },
            onError: function (err) {
                _uploadDataUrl = '';
                if (typeof global.showToast === 'function' && err && err.message) {
                    global.showToast('warning', err.message, { containerId: 'ubits-toast-container' });
                }
                syncFooter();
            }
        });
        syncFooter();
    }

    function initTrailerInput() {
        var wrap = document.getElementById('cc-pim-trailer-input-wrap');
        if (!wrap || _trailerInputInited || typeof global.createInput !== 'function') return;
        _trailerInputInited = true;
        global.createInput({
            containerId: 'cc-pim-trailer-input-wrap',
            type: 'text',
            label: '',
            showLabel: false,
            placeholder: 'https://www.youtube.com/watch?v=...',
            size: 'lg',
            value: _modalTrailerUrl,
            helperText: 'Solo se admiten enlaces de YouTube, Vimeo, Google Drive y OneDrive.',
            showHelper: true,
            onChange: function (val) {
                _modalTrailerUrl = String(val || '').trim();
                var inp = wrap.querySelector('input');
                if (inp) {
                    var ok = !_modalTrailerUrl.length || isAllowedTrailerUrl(_modalTrailerUrl);
                    if (ok) {
                        inp.style.borderColor = 'var(--ubits-border-1)';
                        inp.style.borderWidth = '1px';
                    } else {
                        inp.style.borderColor = 'var(--ubits-feedback-accent-error)';
                        inp.style.borderWidth = '2px';
                    }
                }
                syncFooter();
            }
        });
        syncFooter();
    }

    function syncFooter() {
        var useIa = document.getElementById('cc-pim-footer-use-ia');
        var useUp = document.getElementById('cc-pim-footer-use-upload');
        var saveT = document.getElementById('cc-pim-footer-save-trailer');
        var hasIaResult = !!_iaResultSrc;
        var trailerSaveEnabled =
            _modalTrailerUrl.length > 0 && isAllowedTrailerUrl(_modalTrailerUrl);

        if (useIa) {
            useIa.style.display = _currentTab === 'ia' ? '' : 'none';
            useIa.disabled = !hasIaResult;
        }
        if (useUp) {
            useUp.style.display = _currentTab === 'subir' ? '' : 'none';
            useUp.disabled = !_uploadDataUrl;
        }
        if (saveT) {
            saveT.style.display = _currentTab === 'trailer' ? '' : 'none';
            saveT.disabled = !trailerSaveEnabled;
        }

        syncPimOverlayLayout();
    }

    function syncPimOverlayLayout() {
        var overlay = document.getElementById(OVERLAY_ID);
        if (!overlay) return;
        overlay.classList.toggle('cc-pim--ia-intro', _currentTab === 'ia' && !_pimIaLayoutExpanded);

        var mc = overlay.querySelector('.cc-pim-modal-content');
        if (mc) {
            mc.setAttribute(
                'data-cc-pim-ia-expanded',
                _currentTab === 'ia' && _pimIaLayoutExpanded ? 'true' : 'false'
            );
        }

        var stage = document.getElementById('cc-pim-preview-stage');
        if (stage) {
            var hidePreviewA11y = _currentTab !== 'ia' || !_pimIaLayoutExpanded;
            stage.setAttribute('aria-hidden', hidePreviewA11y ? 'true' : 'false');
        }
    }

    function wireFooterActions() {
        var cancel = document.getElementById('cc-pim-footer-cancel');
        if (cancel) {
            cancel.onclick = function () {
                if (typeof global.closeModal === 'function') global.closeModal(OVERLAY_ID);
            };
        }
        var useIa = document.getElementById('cc-pim-footer-use-ia');
        if (useIa) {
            useIa.onclick = function () {
                if (!_iaResultSrc || !_onApply) return;
                _onApply({
                    dataUrl: _iaResultSrc,
                    trailerUrl: _modalTrailerUrl,
                    fromAi: true,
                    iaPrompt: getPimIdeaText()
                });
                if (typeof global.closeModal === 'function') global.closeModal(OVERLAY_ID);
            };
        }
        var useUp = document.getElementById('cc-pim-footer-use-upload');
        if (useUp) {
            useUp.onclick = function () {
                if (!_uploadDataUrl || !_onApply) return;
                _onApply({ dataUrl: _uploadDataUrl, trailerUrl: _modalTrailerUrl, fromAi: false });
                if (typeof global.closeModal === 'function') global.closeModal(OVERLAY_ID);
            };
        }
        var saveT = document.getElementById('cc-pim-footer-save-trailer');
        if (saveT) {
            saveT.onclick = function () {
                if (saveT.disabled) return;
                if (!_modalTrailerUrl.length || !isAllowedTrailerUrl(_modalTrailerUrl)) return;
                if (_onTrailerSaved) _onTrailerSaved(_modalTrailerUrl);
                if (typeof global.showToast === 'function') {
                    global.showToast('success', 'Tráiler guardado. Se aplicará al confirmar la portada.', {
                        containerId: 'ubits-toast-container'
                    });
                }
            };
        }
    }

    function switchToTab(tab) {
        _currentTab = tab;

        var bar = document.getElementById('cc-pim-tabbar');
        if (bar) {
            bar.querySelectorAll('[data-cc-pim-tab]').forEach(function (btn) {
                var t = btn.getAttribute('data-cc-pim-tab');
                var on = t === tab;
                btn.classList.toggle('ubits-tab--active', on);
                btn.setAttribute('aria-selected', on ? 'true' : 'false');
            });
        }
        ['ia', 'subir', 'trailer'].forEach(function (p) {
            var el = document.getElementById('cc-pim-tab-' + p);
            if (el) el.classList.toggle('cc-vmodal-panel--hidden', p !== tab);
        });
        if (tab === 'trailer' && !_trailerInputInited) {
            initTrailerInput();
        }
        if (tab === 'subir' && !_subirFuInited) {
            initSubirFileUpload();
        }
        syncFooter();
        syncPimTokensBadge();
    }

    function wireTabBar() {
        var bar = document.getElementById('cc-pim-tabbar');
        if (!bar || bar._ccPimTabWired) return;
        bar._ccPimTabWired = true;
        bar.addEventListener('click', function (e) {
            var b = e.target.closest('[data-cc-pim-tab]');
            if (!b || !bar.contains(b)) return;
            switchToTab(b.getAttribute('data-cc-pim-tab'));
        });
    }

    function resetState(opts) {
        opts = opts || {};
        _onApply = typeof opts.onApply === 'function' ? opts.onApply : null;
        _onTrailerSaved = typeof opts.onTrailerSaved === 'function' ? opts.onTrailerSaved : null;
        _currentTab = 'ia';
        _iaImageIndex = 0;
        _iaResultSrc = '';
        _uploadDataUrl = '';
        _modalTrailerUrl = opts.initialTrailerUrl != null ? String(opts.initialTrailerUrl).trim() : '';
        _trailerInputInited = false;
        _subirFuInited = false;
        _pimIaLayoutExpanded = false;
        _pimPendingImgs = [];
        _pimPendingFiles = [];
    }

    function getPimModalSizeForViewport() {
        var w = 0;
        try {
            w =
                global.innerWidth ||
                (global.document && global.document.documentElement
                    ? global.document.documentElement.clientWidth
                    : 0) ||
                0;
        } catch (e) {
            w = 0;
        }
        return w > PIM_MODAL_WIDE_MIN_PX ? 'md' : 'sm';
    }

    function teardownPimModalResize() {
        if (_pimOnWindowResize) {
            global.removeEventListener('resize', _pimOnWindowResize);
            global.removeEventListener('orientationchange', _pimOnWindowResize);
            _pimOnWindowResize = null;
        }
        if (_pimResizeRaf != null) {
            global.cancelAnimationFrame(_pimResizeRaf);
            _pimResizeRaf = null;
        }
    }

    function syncPimModalContentSize() {
        var overlay = document.getElementById(OVERLAY_ID);
        if (!overlay) return;
        try {
            if (global.getComputedStyle(overlay).display === 'none') return;
        } catch (e) {
            return;
        }
        var content = overlay.querySelector('.ubits-modal-content');
        if (!content) return;
        var size = getPimModalSizeForViewport();
        ['xs', 'sm', 'md', 'lg'].forEach(function (s) {
            content.classList.remove('ubits-modal-content--' + s);
        });
        content.classList.add('ubits-modal-content--' + size);
    }

    function schedulePimModalResizeSync() {
        if (_pimResizeRaf != null) return;
        _pimResizeRaf = global.requestAnimationFrame(function () {
            _pimResizeRaf = null;
            syncPimModalContentSize();
        });
    }

    function wirePimModalResize() {
        if (_pimOnWindowResize) return;
        _pimOnWindowResize = function () {
            schedulePimModalResizeSync();
        };
        global.addEventListener('resize', _pimOnWindowResize, { passive: true });
        global.addEventListener('orientationchange', _pimOnWindowResize);
    }

    function openPortadaImagenModal(opts) {
        if (typeof global.openModal !== 'function') return;
        teardownPimModalResize();
        resetState(opts);

        var overlay = global.openModal({
            overlayId: OVERLAY_ID,
            title: 'Agregar portada',
            bodyHtml: buildBody(),
            size: getPimModalSizeForViewport(),
            closeOnOverlayClick: false,
            footerHtml: buildFooter(),
            variant: 'ia',
            iaTokensRemaining: getTokens(),
            iaTokensBadgeId: 'cc-pim-modal-tokens-badge',
            onClose: function () {
                teardownPimModalResize();
                _onApply = null;
                _onTrailerSaved = null;
            }
        });

        if (overlay) applyAiChrome(overlay);
        wirePimModalResize();

        setTimeout(function () {
            wireTabBar();
            initIdeaInput();
            initPimAttach();
            initGenerarPortada();
            wireFooterActions();

            var isIaReopen = !!(opts.editIaPreviewSrc && opts.editIaPrompt);
            var subirData = opts.editSubirDataUrl;

            if (isIaReopen) {
                _iaResultSrc = opts.editIaPreviewSrc;
                _pimIaLayoutExpanded = true;
            }

            if (!isIaReopen) {
                setPreviewState('placeholder');
                initPimPreviewEmptyState();
            }

            if (opts.editIaPrompt) {
                var ta0 = document.getElementById('cc-pim-idea-input');
                if (ta0) {
                    ta0.value = String(opts.editIaPrompt);
                    autosizePimIdeaTextarea();
                }
            }

            if (isIaReopen) {
                setPreviewState('result');
                renderIaResult(_iaResultSrc);
            }

            var startTab = opts.editStartTab || 'ia';
            if (subirData && !isIaReopen) {
                startTab = 'subir';
            }

            switchToTab(startTab);

            if (startTab === 'subir' && subirData) {
                setTimeout(function () {
                    hydrateSubirTabFromDataUrl(subirData);
                }, 0);
            }

            refreshGenButtons();
            syncFooter();
            if (typeof global.initTooltip === 'function') {
                global.initTooltip('#' + OVERLAY_ID + ' [data-tooltip]');
            }
        }, 0);
    }

    global.openPortadaImagenModal = openPortadaImagenModal;
})(window);
