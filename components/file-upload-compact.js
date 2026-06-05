/**
 * UBITS — File Upload Compact
 * Variante en línea del File Upload: tile compacto para modales y formularios estrechos.
 *
 * API pública:
 *   createFileUploadCompact(opts)
 *   initFileUploadCompact(containerOrId?, opts?)
 *   fileUploadCompactSetError(idOrEl, message)
 *   fileUploadCompactClearError(idOrEl)
 *   fileUploadCompactSetSuccess(idOrEl, message)
 *   fileUploadCompactClearSuccess(idOrEl)
 *   fileUploadCompactShowErrorReport(idOrEl, visible, opts?)
 *   fileUploadCompactSetProgress(idOrEl, percent)
 *   fileUploadCompactClearProgress(idOrEl)
 *   fileUploadCompactSetProcessing(idOrEl, percent)
 *   fileUploadCompactClearProcessing(idOrEl)
 *   fileUploadCompactAnimateProcessing(idOrEl, ms, cb)
 *   fileUploadCompactSetProcessingError(idOrEl, opts)
 *
 * Eventos custom (bubbles: true):
 *   'ubits-file-upload-compact-change' — detail: { file: File | null, previewUrl: string | null }
 *   'ubits-file-upload-compact-error'  — detail: { type: 'type'|'size', message: string }
 *
 *   fileUploadCompactSetHeaderVisible(idOrEl, visible) — muestra u oculta .ubits-file-upload-compact__header
 *
 * Opciones createFileUploadCompact:
 *   containerId, id, title (default: 'Importar archivo'), accept, maxSizeMb, maxLabel, formats,
 *   icon (FA sin fa-), uploadButtonLabel, changeButtonLabel, previewThumbnail (bool),
 *   downloadButtons {Array} hasta 3 { label, icon?, onClick },
 *   hideHeader {boolean} true = oculta título + acciones,
 *   onChange(file, detail), onError({ type, message })
 */
(function () {
    'use strict';

    function formatSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1).replace(/\.0$/, '') + ' KB';
        return (bytes / 1048576).toFixed(1).replace(/\.0$/, '') + ' MB';
    }

    function fileMatchesAccept(file, accept) {
        if (!accept) return true;
        var parts = accept.split(',').map(function (s) { return s.trim().toLowerCase(); }).filter(Boolean);
        var name = file.name.toLowerCase();
        var mime = (file.type || '').toLowerCase();
        return parts.some(function (p) {
            if (p.startsWith('.')) return name.endsWith(p);
            if (p.endsWith('/*')) return mime.startsWith(p.slice(0, -2));
            return mime === p;
        });
    }

    function acceptLabel(accept) {
        if (!accept) return 'Archivos';
        return accept.split(',').map(function (s) {
            return s.trim().replace(/^\./, '').toUpperCase();
        }).filter(function (s) { return s.indexOf('/') === -1; }).join(', ');
    }

    function isImageFile(file) {
        if (!file) return false;
        if ((file.type || '').indexOf('image/') === 0) return true;
        return /\.(png|jpe?g|gif|webp|svg)$/i.test(file.name || '');
    }

    function resolveEl(idOrEl) {
        if (!idOrEl) return null;
        return typeof idOrEl === 'string' ? document.getElementById(idOrEl) : idOrEl;
    }

    function compactHelperIconHtml(type) {
        if (type === 'success') {
            return '<i class="far fa-check-circle" aria-hidden="true"></i>';
        }
        return '<i class="far fa-circle-exclamation" aria-hidden="true"></i>';
    }

    function setCompactHelperMessage(msgEl, message, type) {
        if (!msgEl) return;
        var text = String(message || '').trim();
        if (!text) {
            msgEl.innerHTML = '';
            return;
        }
        msgEl.innerHTML = compactHelperIconHtml(type) + '<span></span>';
        var span = msgEl.querySelector('span');
        if (span) span.textContent = text;
    }

    function compactUploadIsBusy(el) {
        if (!el) return false;
        var filledEl = el.querySelector('[data-file-upload-compact-filled]');
        return (
            (filledEl && filledEl.classList.contains('ubits-file-upload-compact__tile--uploading')) ||
            el.classList.contains('ubits-file-upload-compact--processing')
        );
    }

    /** Miniatura solo cuando no hay carga ni procesamiento en curso. */
    function syncCompactUploadThumbnail(el) {
        if (!el) return;
        var previewUrl = el._fileUploadCompactPreviewUrl;
        var previewThumbnail = el._fileUploadCompactPreviewThumbnail !== false;
        var thumbEl = el.querySelector('[data-file-upload-compact-thumb]');
        var fileIconEl = el.querySelector('[data-file-upload-compact-file-icon]');
        var previewImg = el.querySelector('[data-file-upload-compact-preview]');
        var showThumb = previewThumbnail && previewUrl && !compactUploadIsBusy(el);
        if (thumbEl) thumbEl.hidden = !showThumb;
        if (fileIconEl) fileIconEl.hidden = !!showThumb;
        if (previewImg) {
            if (showThumb) previewImg.src = previewUrl;
            else previewImg.removeAttribute('src');
        }
    }

    function buildHtml(opts, id) {
        var title = opts.title || 'Importar archivo';
        var accept = opts.accept || '';
        var maxMb = opts.maxSizeMb || 5;
        var maxLbl = opts.maxLabel || (maxMb + ' MB');
        var formats = opts.formats || (acceptLabel(accept) + ' \u2022 Hasta ' + maxLbl);
        var icon = opts.icon || 'file-lines';
        var uploadLabel = opts.uploadButtonLabel || 'Subir';
        var changeLabel = opts.changeButtonLabel || 'Cambiar';
        var fileIcon = opts.fileIcon || 'file-lines';
        var btns = (opts.downloadButtons || []).slice(0, 3);
        var hideHeader = opts.hideHeader === true;
        var rootExtraClass = hideHeader ? ' ubits-file-upload-compact--hide-header' : '';

        var actionBtnsHtml = btns.map(function (b) {
            return '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm ubits-file-upload-compact__download-btn" data-file-upload-compact-download>' +
                '<i class="far ' + (b.icon ? 'fa-' + b.icon : 'fa-arrow-down-to-line') + '"></i>' +
                '<span>' + b.label + '</span></button>';
        }).join('');

        actionBtnsHtml +=
            '<button type="button" class="ubits-button ubits-button--error-secondary ubits-button--sm ubits-file-upload-compact__error-report-btn" ' +
            'data-file-upload-compact-error-report-header style="display:none" aria-live="polite">' +
            '<i class="far fa-circle-exclamation"></i><span>Informe de errores</span></button>';

        return (
            '<div class="ubits-file-upload-compact' + rootExtraClass + '" id="' + id + '" data-file-upload-compact>' +
              '<div class="ubits-file-upload-compact__header">' +
                '<h2 class="ubits-body-md-bold ubits-file-upload-compact__title">' + title + '</h2>' +
                '<div class="ubits-file-upload-compact__header-actions">' + actionBtnsHtml + '</div>' +
              '</div>' +
              '<div class="ubits-file-upload-compact__tile ubits-file-upload-compact__tile--empty" data-file-upload-compact-empty>' +
                '<span class="ubits-file-upload-compact__icon-wrap" aria-hidden="true">' +
                  '<i class="far fa-' + icon + '"></i></span>' +
                '<span class="ubits-file-upload-compact__meta">' +
                  '<span class="ubits-body-sm-regular ubits-file-upload-compact__hint" data-file-upload-compact-hint">' + formats + '</span>' +
                '</span>' +
                '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm ubits-file-upload-compact__trigger-btn" data-file-upload-compact-trigger>' +
                  '<span>' + uploadLabel + '</span></button>' +
              '</div>' +
              '<div class="ubits-file-upload-compact__tile ubits-file-upload-compact__tile--filled" data-file-upload-compact-filled hidden aria-live="polite">' +
                '<div class="ubits-file-upload-compact__thumb" data-file-upload-compact-thumb hidden>' +
                  '<img data-file-upload-compact-preview src="" alt="Vista previa del archivo">' +
                '</div>' +
                '<span class="ubits-file-upload-compact__icon-wrap ubits-file-upload-compact__file-icon" data-file-upload-compact-file-icon aria-hidden="true">' +
                  '<i class="far fa-' + fileIcon + '"></i></span>' +
                '<div class="ubits-file-upload-compact__meta">' +
                  '<span class="ubits-body-sm-semibold ubits-file-upload-compact__name" data-file-upload-compact-name></span>' +
                  '<span class="ubits-body-sm-regular ubits-file-upload-compact__size" data-file-upload-compact-size></span>' +
                  '<div class="ubits-file-upload-compact__progress-wrap">' +
                    '<div class="ubits-file-upload-compact__progress-bar" data-file-upload-compact-progress-bar>' +
                      '<div class="ubits-file-upload-compact__progress-fill" data-file-upload-compact-progress-fill></div>' +
                    '</div>' +
                    '<span class="ubits-body-sm-regular ubits-file-upload-compact__progress-pct" data-file-upload-compact-progress-pct>0%</span>' +
                  '</div>' +
                '</div>' +
                '<div class="ubits-file-upload-compact__actions">' +
                  '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm" data-file-upload-compact-change>' +
                    '<span>' + changeLabel + '</span></button>' +
                  '<button type="button" class="ubits-button ubits-button--error-tertiary ubits-button--sm ubits-button--icon-only ubits-file-upload-compact__remove-btn" data-file-upload-compact-remove aria-label="Quitar archivo">' +
                    '<i class="far fa-trash-alt"></i></button>' +
                '</div>' +
              '</div>' +
              '<div class="ubits-file-upload-compact__processing" data-file-upload-compact-processing hidden aria-live="polite">' +
                '<span class="ubits-body-sm-regular ubits-file-upload-compact__processing-label">Procesando</span>' +
                '<div class="ubits-file-upload-compact__processing-bar">' +
                  '<div class="ubits-file-upload-compact__processing-fill" data-file-upload-compact-processing-fill></div>' +
                '</div>' +
                '<span class="ubits-body-sm-regular ubits-file-upload-compact__processing-pct" data-file-upload-compact-processing-pct>0%</span>' +
              '</div>' +
              '<input type="file" class="ubits-file-upload-compact__input" data-file-upload-compact-input' +
                (accept ? ' accept="' + accept + '"' : '') + '>' +
              '<div class="ubits-body-sm-regular ubits-file-upload-compact__helper" data-file-upload-compact-helper style="display:none">' +
                '<span class="ubits-file-upload-compact__helper-msg" data-file-upload-compact-helper-msg></span>' +
                '<button type="button" class="ubits-button ubits-button--error-secondary ubits-button--sm ubits-file-upload-compact__error-report-btn-inline" data-file-upload-compact-error-report-inline style="display:none" aria-live="polite">' +
                  '<i class="far fa-circle-exclamation"></i><span>Informe de errores</span></button>' +
              '</div>' +
            '</div>'
        );
    }

    function wireCompactUpload(el, opts) {
        if (!el || el._ubitsFileUploadCompactWired) return el;
        el._ubitsFileUploadCompactWired = true;

        opts = opts || {};
        var accept = opts.accept || (el.querySelector('[data-file-upload-compact-input]') || {}).accept || '';
        var maxMb = opts.maxSizeMb || 5;
        var previewThumbnail = opts.previewThumbnail !== false;

        var input = el.querySelector('[data-file-upload-compact-input]');
        var emptyEl = el.querySelector('[data-file-upload-compact-empty]');
        var filledEl = el.querySelector('[data-file-upload-compact-filled]');
        var helperEl = el.querySelector('[data-file-upload-compact-helper]');
        var helperMsg = el.querySelector('[data-file-upload-compact-helper-msg]');
        var thumbEl = el.querySelector('[data-file-upload-compact-thumb]');
        var previewImg = el.querySelector('[data-file-upload-compact-preview]');
        var fileIconEl = el.querySelector('[data-file-upload-compact-file-icon]');
        var nameEl = el.querySelector('[data-file-upload-compact-name]');
        var sizeEl = el.querySelector('[data-file-upload-compact-size]');

        function setHelper(message, type) {
            if (!helperEl) return;
            if (!message) {
                helperEl.style.display = 'none';
                if (helperMsg) helperMsg.innerHTML = '';
                helperEl.classList.remove('ubits-file-upload-compact__helper--success');
                fileUploadCompactShowErrorReport(el, false, { placement: 'inline' });
                return;
            }
            helperEl.classList.toggle('ubits-file-upload-compact__helper--success', type === 'success');
            setCompactHelperMessage(helperMsg, message, type === 'success' ? 'success' : 'error');
            helperEl.style.display = 'flex';
        }

        function showEmpty() {
            if (emptyEl) emptyEl.hidden = false;
            if (filledEl) filledEl.hidden = true;
            if (emptyEl) emptyEl.classList.remove('ubits-file-upload-compact__tile--invalid');
            if (input) input.value = '';
            if (previewImg) previewImg.removeAttribute('src');
            if (thumbEl) thumbEl.hidden = true;
            if (fileIconEl) fileIconEl.hidden = false;
            el._fileUploadCompactPreviewUrl = null;
            setHelper(null);
            fileUploadCompactShowErrorReport(el, false, { placement: 'header' });
            fileUploadCompactShowErrorReport(el, false, { placement: 'inline' });
            fileUploadCompactClearProgress(el);
            fileUploadCompactClearProcessing(el);
            el.dispatchEvent(new CustomEvent('ubits-file-upload-compact-change', {
                bubbles: true,
                detail: { file: null, previewUrl: null }
            }));
            if (typeof opts.onChange === 'function') opts.onChange(null, { file: null, previewUrl: null });
        }

        function showFilled(file, previewUrl) {
            if (emptyEl) emptyEl.hidden = true;
            if (filledEl) filledEl.hidden = false;
            if (nameEl) nameEl.textContent = file.name;
            if (sizeEl) sizeEl.textContent = formatSize(file.size);
            if (emptyEl) emptyEl.classList.remove('ubits-file-upload-compact__tile--invalid');
            setHelper(null);

            el._fileUploadCompactPreviewUrl = previewUrl || null;
            el._fileUploadCompactPreviewThumbnail = previewThumbnail;
            syncCompactUploadThumbnail(el);

            el.dispatchEvent(new CustomEvent('ubits-file-upload-compact-change', {
                bubbles: true,
                detail: { file: file, previewUrl: previewUrl || null }
            }));
            if (typeof opts.onChange === 'function') {
                opts.onChange(file, { file: file, previewUrl: previewUrl || null });
            }
        }

        function openPicker() {
            if (input) input.click();
        }

        el.querySelectorAll('[data-file-upload-compact-trigger]').forEach(function (btn) {
            btn.addEventListener('click', openPicker);
        });

        var changeBtn = el.querySelector('[data-file-upload-compact-change]');
        if (changeBtn) changeBtn.addEventListener('click', openPicker);

        var removeBtn = el.querySelector('[data-file-upload-compact-remove]');
        if (removeBtn) {
            removeBtn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                showEmpty();
            });
        }

        if (input) {
            input.addEventListener('change', function () {
                var file = input.files && input.files[0];
                if (!file) return;

                if (!fileMatchesAccept(file, accept)) {
                    var typeMsg = 'El archivo no es compatible. Solo se aceptan: ' + accept + '.';
                    if (emptyEl) emptyEl.classList.add('ubits-file-upload-compact__tile--invalid');
                    setHelper(typeMsg);
                    input.value = '';
                    el.dispatchEvent(new CustomEvent('ubits-file-upload-compact-error', {
                        bubbles: true,
                        detail: { type: 'type', message: typeMsg }
                    }));
                    if (typeof opts.onError === 'function') opts.onError({ type: 'type', message: typeMsg });
                    return;
                }

                if (file.size > maxMb * 1048576) {
                    var sizeMsg = 'El archivo es demasiado grande. El límite es ' + maxMb + ' MB.';
                    if (emptyEl) emptyEl.classList.add('ubits-file-upload-compact__tile--invalid');
                    setHelper(sizeMsg);
                    input.value = '';
                    el.dispatchEvent(new CustomEvent('ubits-file-upload-compact-error', {
                        bubbles: true,
                        detail: { type: 'size', message: sizeMsg }
                    }));
                    if (typeof opts.onError === 'function') opts.onError({ type: 'size', message: sizeMsg });
                    return;
                }

                if (previewThumbnail && isImageFile(file)) {
                    var reader = new FileReader();
                    reader.onload = function (ev) {
                        showFilled(file, ev && ev.target ? ev.target.result : null);
                    };
                    reader.readAsDataURL(file);
                } else {
                    showFilled(file, null);
                }
            });
        }

        el._fileUploadCompactShowEmpty = showEmpty;
        el._fileUploadCompactShowFilled = showFilled;
        el._fileUploadCompactSetHelper = setHelper;
        return el;
    }

    function createFileUploadCompact(opts) {
        opts = opts || {};
        if (!opts.containerId) {
            console.warn('[ubits-file-upload-compact] containerId es requerido');
            return null;
        }
        var container = document.getElementById(opts.containerId);
        if (!container) {
            console.warn('[ubits-file-upload-compact] Contenedor no encontrado:', opts.containerId);
            return null;
        }
        var id = opts.id || ('ubits-fuc-' + opts.containerId);
        container.innerHTML = buildHtml(opts, id);
        var el = document.getElementById(id);
        var wired = wireCompactUpload(el, opts);

        var dlBtns = (opts.downloadButtons || []).slice(0, 3);
        var downloadEls = el.querySelectorAll('[data-file-upload-compact-download]');
        dlBtns.forEach(function (b, i) {
            if (downloadEls[i] && typeof b.onClick === 'function') {
                downloadEls[i].addEventListener('click', b.onClick);
            }
        });

        return wired;
    }

    function initFileUploadCompact(containerOrId, opts) {
        var root = typeof containerOrId === 'string'
            ? document.getElementById(containerOrId)
            : containerOrId;
        if (!root) return null;
        var targets = root.hasAttribute && root.hasAttribute('data-file-upload-compact')
            ? [root]
            : root.querySelectorAll('[data-file-upload-compact]');
        var last = null;
        for (var i = 0; i < targets.length; i++) {
            var target = targets[i];
            last = wireCompactUpload(target, opts || {});
            var o = opts || {};
            if (o.hideHeader === true) {
                target.classList.add('ubits-file-upload-compact--hide-header');
            } else if (o.hideHeader === false) {
                target.classList.remove('ubits-file-upload-compact--hide-header');
            }
        }
        return last;
    }

    function fileUploadCompactSetError(idOrEl, message) {
        var el = resolveEl(idOrEl);
        if (!el) return;
        var emptyEl = el.querySelector('[data-file-upload-compact-empty]');
        var filledEl = el.querySelector('[data-file-upload-compact-filled]');
        var helperEl = el.querySelector('[data-file-upload-compact-helper]');
        var helperMsg = el.querySelector('[data-file-upload-compact-helper-msg]');
        if (emptyEl && !emptyEl.hidden) emptyEl.classList.add('ubits-file-upload-compact__tile--invalid');
        if (filledEl && !filledEl.hidden) filledEl.classList.add('ubits-file-upload-compact__tile--invalid');
        if (helperEl) {
            helperEl.classList.remove('ubits-file-upload-compact__helper--success');
            setCompactHelperMessage(helperMsg, message, 'error');
            helperEl.style.display = 'flex';
        }
    }

    function fileUploadCompactClearError(idOrEl) {
        var el = resolveEl(idOrEl);
        if (!el) return;
        var emptyEl = el.querySelector('[data-file-upload-compact-empty]');
        var filledEl = el.querySelector('[data-file-upload-compact-filled]');
        var helperEl = el.querySelector('[data-file-upload-compact-helper]');
        var helperMsg = el.querySelector('[data-file-upload-compact-helper-msg]');
        if (emptyEl) emptyEl.classList.remove('ubits-file-upload-compact__tile--invalid');
        if (filledEl) filledEl.classList.remove('ubits-file-upload-compact__tile--invalid');
        if (helperEl && !helperEl.classList.contains('ubits-file-upload-compact__helper--success')) {
            helperEl.style.display = 'none';
            if (helperMsg) helperMsg.innerHTML = '';
            fileUploadCompactShowErrorReport(el, false, { placement: 'inline' });
        }
    }

    function fileUploadCompactSetSuccess(idOrEl, message) {
        var el = resolveEl(idOrEl);
        if (!el) return;
        var emptyEl = el.querySelector('[data-file-upload-compact-empty]');
        var filledEl = el.querySelector('[data-file-upload-compact-filled]');
        var helperEl = el.querySelector('[data-file-upload-compact-helper]');
        var helperMsg = el.querySelector('[data-file-upload-compact-helper-msg]');
        var msg = String(message || '').trim();
        if (!msg) return;
        if (emptyEl) emptyEl.classList.remove('ubits-file-upload-compact__tile--invalid');
        if (filledEl) filledEl.classList.remove('ubits-file-upload-compact__tile--invalid');
        if (helperEl) {
            helperEl.classList.add('ubits-file-upload-compact__helper--success');
            setCompactHelperMessage(helperMsg, msg, 'success');
            helperEl.style.display = 'flex';
        }
    }

    function fileUploadCompactClearSuccess(idOrEl) {
        var el = resolveEl(idOrEl);
        if (!el) return;
        var helperEl = el.querySelector('[data-file-upload-compact-helper]');
        var helperMsg = el.querySelector('[data-file-upload-compact-helper-msg]');
        if (helperEl && helperEl.classList.contains('ubits-file-upload-compact__helper--success')) {
            helperEl.style.display = 'none';
            if (helperMsg) helperMsg.innerHTML = '';
            helperEl.classList.remove('ubits-file-upload-compact__helper--success');
            fileUploadCompactShowErrorReport(el, false, { placement: 'inline' });
        }
    }

    function fileUploadCompactShowErrorReport(idOrEl, visible, opts) {
        var el = resolveEl(idOrEl);
        if (!el) return;
        var placement = (opts && opts.placement === 'inline') ? 'inline' : 'header';
        var headerBtn = el.querySelector('[data-file-upload-compact-error-report-header]');
        var inlineBtn = el.querySelector('[data-file-upload-compact-error-report-inline]');
        if (headerBtn) headerBtn.style.display = (visible && placement === 'header') ? '' : 'none';
        if (inlineBtn) inlineBtn.style.display = (visible && placement === 'inline') ? '' : 'none';
    }

    function fileUploadCompactSetHeaderVisible(idOrEl, visible) {
        var el = resolveEl(idOrEl);
        if (!el || !el.hasAttribute || !el.hasAttribute('data-file-upload-compact')) return;
        el.classList.toggle('ubits-file-upload-compact--hide-header', visible === false);
    }

    function fileUploadCompactSetProgress(idOrEl, percent) {
        var el = resolveEl(idOrEl);
        if (!el) return;
        var pct = Math.max(0, Math.min(100, percent));
        var filledEl = el.querySelector('[data-file-upload-compact-filled]');
        var fill = el.querySelector('[data-file-upload-compact-progress-fill]');
        var pctEl = el.querySelector('[data-file-upload-compact-progress-pct]');
        if (filledEl) filledEl.classList.add('ubits-file-upload-compact__tile--uploading');
        if (fill) {
            fill.style.width = pct + '%';
            fill.classList.toggle('ubits-file-upload-compact__progress-fill--complete', pct >= 100);
        }
        if (pctEl) pctEl.textContent = Math.round(pct) + '%';
        syncCompactUploadThumbnail(el);
    }

    function fileUploadCompactClearProgress(idOrEl) {
        var el = resolveEl(idOrEl);
        if (!el) return;
        var filledEl = el.querySelector('[data-file-upload-compact-filled]');
        var fill = el.querySelector('[data-file-upload-compact-progress-fill]');
        var pctEl = el.querySelector('[data-file-upload-compact-progress-pct]');
        if (filledEl) filledEl.classList.remove('ubits-file-upload-compact__tile--uploading');
        if (fill) {
            fill.style.width = '0%';
            fill.classList.remove('ubits-file-upload-compact__progress-fill--complete');
        }
        if (pctEl) pctEl.textContent = '0%';
        syncCompactUploadThumbnail(el);
    }

    function fileUploadCompactSetProcessing(idOrEl, percent) {
        var el = resolveEl(idOrEl);
        if (!el) return;
        var pct = Math.max(0, Math.min(100, percent));
        var block = el.querySelector('[data-file-upload-compact-processing]');
        var fill = el.querySelector('[data-file-upload-compact-processing-fill]');
        var pctEl = el.querySelector('[data-file-upload-compact-processing-pct]');
        el.classList.add('ubits-file-upload-compact--processing');
        if (block) block.hidden = false;
        if (fill) {
            fill.style.width = pct + '%';
            fill.classList.toggle('ubits-file-upload-compact__processing-fill--complete', pct >= 100);
        }
        if (pctEl) pctEl.textContent = Math.round(pct) + '%';
        syncCompactUploadThumbnail(el);
    }

    function fileUploadCompactClearProcessing(idOrEl) {
        var el = resolveEl(idOrEl);
        if (!el) return;
        var block = el.querySelector('[data-file-upload-compact-processing]');
        var fill = el.querySelector('[data-file-upload-compact-processing-fill]');
        var pctEl = el.querySelector('[data-file-upload-compact-processing-pct]');
        el.classList.remove('ubits-file-upload-compact--processing');
        if (block) block.hidden = true;
        if (fill) {
            fill.style.width = '0%';
            fill.classList.remove('ubits-file-upload-compact__processing-fill--complete');
        }
        if (pctEl) pctEl.textContent = '0%';
        syncCompactUploadThumbnail(el);
    }

    function fileUploadCompactAnimateProcessing(idOrEl, ms, cb) {
        var el = resolveEl(idOrEl);
        if (!el) return null;
        var duration = typeof ms === 'number' ? ms : 5000;
        var start = Date.now();
        fileUploadCompactSetProcessing(el, 0);
        var timer = setInterval(function () {
            var elapsed = Date.now() - start;
            var pct = Math.min(100, (elapsed / duration) * 100);
            fileUploadCompactSetProcessing(el, pct);
            if (pct >= 100) {
                clearInterval(timer);
                if (typeof cb === 'function') cb();
            }
        }, 50);
        return timer;
    }

    function fileUploadCompactSetProcessingError(idOrEl, opts) {
        var el = resolveEl(idOrEl);
        if (!el) return;
        var ok = opts && typeof opts.processedOk === 'number' ? opts.processedOk : 0;
        var failed = opts && typeof opts.failed === 'number' ? opts.failed : 0;
        var baseMsg = 'Se procesaron ' + ok + ' fila(s). ' + failed + ' no se pudieron procesar.';
        var msg = (opts && typeof opts.message === 'string' && opts.message.trim() !== '')
            ? opts.message.trim()
            : baseMsg;
        fileUploadCompactSetError(el, msg);
        fileUploadCompactShowErrorReport(el, true, { placement: 'inline' });
        fileUploadCompactShowErrorReport(el, false, { placement: 'header' });
        var helperEl = el.querySelector('[data-file-upload-compact-helper]');
        var inlineBtn = el.querySelector('[data-file-upload-compact-error-report-inline]');
        if (helperEl) helperEl.style.display = 'flex';
        if (inlineBtn) inlineBtn.style.display = '';
        var removeBtn = el.querySelector('[data-file-upload-compact-remove]');
        if (removeBtn) removeBtn.style.display = 'none';
    }

    if (typeof window !== 'undefined') {
        window.createFileUploadCompact = createFileUploadCompact;
        window.initFileUploadCompact = initFileUploadCompact;
        window.fileUploadCompactSetError = fileUploadCompactSetError;
        window.fileUploadCompactClearError = fileUploadCompactClearError;
        window.fileUploadCompactSetSuccess = fileUploadCompactSetSuccess;
        window.fileUploadCompactClearSuccess = fileUploadCompactClearSuccess;
        window.fileUploadCompactShowErrorReport = fileUploadCompactShowErrorReport;
        window.fileUploadCompactSetProgress = fileUploadCompactSetProgress;
        window.fileUploadCompactClearProgress = fileUploadCompactClearProgress;
        window.fileUploadCompactSetProcessing = fileUploadCompactSetProcessing;
        window.fileUploadCompactClearProcessing = fileUploadCompactClearProcessing;
        window.fileUploadCompactAnimateProcessing = fileUploadCompactAnimateProcessing;
        window.fileUploadCompactSetProcessingError = fileUploadCompactSetProcessingError;
        window.fileUploadCompactSetHeaderVisible = fileUploadCompactSetHeaderVisible;
    }
})();
