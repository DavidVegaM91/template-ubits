/**
 * Modal «Agregar PDF» / «Agregar embebido» — LMS Creator T2.
 * PDF: File Upload oficial.
 * Embebido: mismo patrón UX que el tab «Enlace de video» del modal legacy
 * (título arriba + textarea lg + Cargar en el footer).
 * La página NO se crea aquí: el host confirma con onReady y entonces nace la página.
 *
 * API:
 *   openPdfRecursoModal({ onReady(payload), onDismiss? })
 *   openEmbebidoRecursoModal({ onReady(payload), onDismiss? })
 *
 * Depende: modal.js, file-upload.js; embebido: input.js
 * Estilos: pdf-embebido-recurso-modal.css
 */
(function (global) {
    'use strict';

    var PDF_OVERLAY_ID = 'cc-pdf-recurso-modal';
    var EMBED_OVERLAY_ID = 'cc-embebido-recurso-modal';
    var PDF_FU_MOUNT_ID = 'cc-pdf-recurso-fu';
    var EMBED_INPUT_MOUNT_ID = 'cc-embebido-enlace-input';

    var EMBED_HELPER =
        'La URL debe ser embebible y visible para los estudiantes. También puedes pegar el código iframe.';

    var _onReady = null;
    var _onDismiss = null;
    var _confirmed = false;
    var _kind = 'pdf'; /* 'pdf' | 'embebido' */
    var _embedValue = '';
    var _embedValid = false;

    function esc(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function closeOverlay(id) {
        if (typeof global.closeModal === 'function') global.closeModal(id);
    }

    function handleDismiss() {
        if (_confirmed) return;
        var cb = _onDismiss;
        _onReady = null;
        _onDismiss = null;
        if (typeof cb === 'function') cb();
    }

    function confirmReady(payload) {
        _confirmed = true;
        var cb = _onReady;
        _onReady = null;
        _onDismiss = null;
        closeOverlay(_kind === 'pdf' ? PDF_OVERLAY_ID : EMBED_OVERLAY_ID);
        if (typeof cb === 'function') cb(payload);
    }

    function parseEmbedInput(raw) {
        var val = String(raw || '').trim();
        if (!val) return null;

        if (/<iframe[\s>]/i.test(val) || /<(?:object|embed)[\s>]/i.test(val)) {
            var m = val.match(/\bsrc\s*=\s*["']([^"']+)["']/i);
            return m && m[1] ? String(m[1]).trim() : null;
        }

        var url = val;
        if (!/^https?:\/\//i.test(url)) {
            if (/^[\w.-]+\.[a-z]{2,}/i.test(url)) {
                url = 'https://' + url;
            } else {
                return null;
            }
        }
        return url;
    }

    function buildPdfBody() {
        return (
            '<div class="cc-pdf-embebido-modal__mount cc-pdf-embebido-modal__mount--pdf" id="cc-pdf-recurso-modal-mount">' +
            '<div id="' +
            esc(PDF_FU_MOUNT_ID) +
            '"></div>' +
            '</div>'
        );
    }

    function buildEmbedBody() {
        return (
            '<div class="cc-pdf-embebido-modal__mount" id="cc-embebido-recurso-modal-mount">' +
            '<div class="cc-embebido-enlace-layout">' +
            '<div class="cc-embebido-enlace-centered">' +
            '<p class="cc-embebido-enlace-title">Pega el <span class="cc-embebido-enlace-title-em">enlace o el código</span> que quieres embeber</p>' +
            '<div id="' +
            esc(EMBED_INPUT_MOUNT_ID) +
            '" class="cc-embebido-enlace-input-wrap"></div>' +
            '</div></div></div>'
        );
    }

    function footerCancelHtml(btnId) {
        return (
            '<button type="button" class="ubits-button ubits-button--secondary ubits-button--md" id="' +
            esc(btnId) +
            '"><span>Cancelar</span></button>'
        );
    }

    function footerEmbedHtml() {
        return (
            footerCancelHtml('cc-embebido-recurso-cancel') +
            '<button type="button" class="ubits-button ubits-button--secondary ubits-button--md" id="cc-embebido-btn-cargar" disabled>' +
            '<span>Cargar</span></button>'
        );
    }

    function syncEmbedCargarBtn(overlay) {
        var btn = overlay.querySelector('#cc-embebido-btn-cargar');
        if (!btn) return;
        btn.disabled = !_embedValid;
        btn.classList.toggle('ubits-button--primary', _embedValid);
        btn.classList.toggle('ubits-button--secondary', !_embedValid);
    }

    function wirePdfUpload(overlay) {
        var slot = overlay.querySelector('#' + PDF_FU_MOUNT_ID);
        if (!slot) return;
        if (typeof global.createFileUpload !== 'function') {
            slot.innerHTML =
                '<p class="ubits-body-md-regular" style="margin:0;color:var(--ubits-fg-1-medium);">' +
                'No se pudo cargar el cargador de PDF.</p>';
            return;
        }

        var fuRoot = global.createFileUpload({
            containerId: PDF_FU_MOUNT_ID,
            title: 'Subir PDF',
            hideHeader: true,
            accept: 'application/pdf,.pdf',
            maxSizeMb: 250,
            formats: 'PDF · Hasta 250 MB',
            successMessage: false,
            onChange: function (file) {
                if (!file) return;
                var steps = [12, 28, 45, 62, 78, 92, 100];
                var i = 0;
                function tick() {
                    if (!fuRoot) {
                        confirmReady({ type: 'pdf', file: file });
                        return;
                    }
                    if (typeof global.fileUploadSetProgress === 'function') {
                        global.fileUploadSetProgress(fuRoot, steps[i]);
                    }
                    i += 1;
                    if (i < steps.length) {
                        setTimeout(tick, 70);
                        return;
                    }
                    if (typeof global.fileUploadClearProgress === 'function') {
                        global.fileUploadClearProgress(fuRoot);
                    }
                    setTimeout(function () {
                        confirmReady({ type: 'pdf', file: file });
                    }, 120);
                }
                tick();
            }
        });
    }

    function wireEmbedForm(overlay) {
        var wrap = overlay.querySelector('#' + EMBED_INPUT_MOUNT_ID);
        if (!wrap) return;

        _embedValue = '';
        _embedValid = false;

        if (typeof global.createInput !== 'function') {
            wrap.innerHTML =
                '<p class="ubits-body-md-regular" style="margin:0;color:var(--ubits-fg-1-medium);">' +
                'No se pudo cargar el campo de embebido.</p>';
            return;
        }

        global.createInput({
            containerId: EMBED_INPUT_MOUNT_ID,
            type: 'textarea',
            size: 'lg',
            showLabel: false,
            placeholder: 'Pega el link o el código a embeber',
            value: '',
            state: 'default',
            showHelper: true,
            helperText: EMBED_HELPER,
            onChange: function (val) {
                _embedValue = String(val || '');
                var parsed = parseEmbedInput(_embedValue);
                _embedValid = !!parsed;
                var trimmed = _embedValue.trim();
                var field = wrap.querySelector('.ubits-input, textarea.ubits-input');
                var helper = wrap.querySelector('.ubits-input-helper');
                if (trimmed && !parsed) {
                    if (field) field.classList.add('ubits-input--invalid');
                    if (helper) helper.textContent = 'Este no es un enlace válido';
                } else {
                    if (field) field.classList.remove('ubits-input--invalid');
                    if (helper) helper.textContent = EMBED_HELPER;
                }
                syncEmbedCargarBtn(overlay);
            }
        });

        var cargarBtn = overlay.querySelector('#cc-embebido-btn-cargar');
        if (cargarBtn) {
            cargarBtn.addEventListener('click', function () {
                var parsed = parseEmbedInput(_embedValue);
                if (!parsed) return;
                confirmReady({ type: 'embebido', value: _embedValue.trim(), src: parsed });
            });
        }
        syncEmbedCargarBtn(overlay);
    }

    function openOfficialModal(opts) {
        if (typeof global.openModal !== 'function') {
            console.warn('[pdf-embebido-recurso-modal] modal.js no está cargado.');
            return null;
        }
        return global.openModal(opts);
    }

    function openAfterAnadirClose(openFn) {
        setTimeout(openFn, 0);
    }

    function openPdfRecursoModal(opts) {
        opts = opts || {};
        openAfterAnadirClose(function () {
            _kind = 'pdf';
            _confirmed = false;
            _onReady = typeof opts.onReady === 'function' ? opts.onReady : null;
            _onDismiss = typeof opts.onDismiss === 'function' ? opts.onDismiss : null;

            var overlay = openOfficialModal({
                overlayId: PDF_OVERLAY_ID,
                title: 'Agregar PDF',
                bodyHtml: buildPdfBody(),
                footerHtml: footerCancelHtml('cc-pdf-recurso-cancel'),
                size: 'md',
                closeOnOverlayClick: false,
                onClose: handleDismiss
            });

            if (!overlay) {
                overlay = document.getElementById(PDF_OVERLAY_ID);
            }
            if (!overlay) return;

            var cancelBtn = overlay.querySelector('#cc-pdf-recurso-cancel');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', function () {
                    closeOverlay(PDF_OVERLAY_ID);
                    handleDismiss();
                });
            }
            wirePdfUpload(overlay);
        });
    }

    function openEmbebidoRecursoModal(opts) {
        opts = opts || {};
        openAfterAnadirClose(function () {
            _kind = 'embebido';
            _confirmed = false;
            _embedValue = '';
            _embedValid = false;
            _onReady = typeof opts.onReady === 'function' ? opts.onReady : null;
            _onDismiss = typeof opts.onDismiss === 'function' ? opts.onDismiss : null;

            var overlay = openOfficialModal({
                overlayId: EMBED_OVERLAY_ID,
                title: 'Agregar embebido',
                bodyHtml: buildEmbedBody(),
                footerHtml: footerEmbedHtml(),
                size: 'md',
                closeOnOverlayClick: false,
                onClose: handleDismiss
            });

            if (!overlay) {
                overlay = document.getElementById(EMBED_OVERLAY_ID);
            }
            if (!overlay) return;

            var cancelBtn = overlay.querySelector('#cc-embebido-recurso-cancel');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', function () {
                    closeOverlay(EMBED_OVERLAY_ID);
                    handleDismiss();
                });
            }
            wireEmbedForm(overlay);
        });
    }

    global.openPdfRecursoModal = openPdfRecursoModal;
    global.openEmbebidoRecursoModal = openEmbebidoRecursoModal;
})(typeof window !== 'undefined' ? window : this);
