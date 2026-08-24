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
 *   fileUploadCompactSetHeaderVisible(idOrEl, visible)
 *   fileUploadCompactSetFile(idOrEl, name, sizeKb)
 *   fileUploadCompactSetFiles(idOrEl, items)   — [{ name, sizeKb }, …]
 *   fileUploadCompactClearFile(idOrEl)
 *
 * Eventos custom (bubbles: true):
 *   'ubits-file-upload-compact-change' — detail: { file: File | null, previewUrl: string | null, files?: File[] }
 *   'ubits-file-upload-compact-error'  — detail: { type: 'type'|'size'|'max', message: string }
 *
 * Opciones createFileUploadCompact:
 *   containerId, id, title (default: 'Importar archivo'), accept, maxSizeMb, maxLabel, formats,
 *   icon (FA sin fa-), uploadButtonLabel, changeButtonLabel, previewThumbnail (bool),
 *   multiple {boolean}, maxFiles {number},
 *   downloadButtons {Array} hasta 3 { label, icon?, onClick },
 *   hideHeader {boolean} true = oculta título + acciones,
 *   onChange(file, detail), onFilesChange(File[]), onError({ type, message })
 */
(function () {
    'use strict';

    function formatSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1).replace(/\.0$/, '') + ' KB';
        return (bytes / 1048576).toFixed(1).replace(/\.0$/, '') + ' MB';
    }

    function fileUploadCompactProgressMarkup(pct) {
        var value = Math.max(0, Math.min(100, Math.round(Number(pct) || 0)));
        var opts = { value: value, size: 'sm', rounded: true, track: 'subtle', autoComplete: true };
        if (typeof progressBarHtml === 'function') return progressBarHtml(opts);
        var cls = 'ubits-progress-bar ubits-progress-bar--sm ubits-progress-bar--rounded ubits-progress-bar--track-subtle';
        if (value >= 100) cls += ' ubits-progress-bar--complete';
        return '<div class="' + cls + '" role="progressbar" aria-valuenow="' + value + '" aria-valuemin="0" aria-valuemax="100">' +
            '<div class="ubits-progress-bar__track"><div class="ubits-progress-bar__fill" style="width:' + value + '%"></div></div></div>';
    }

    function resolveFileUploadCompactProgressRoot(el, pct, mountSelector) {
        var mount = el.querySelector(mountSelector);
        if (!mount) return null;
        var root = mount.querySelector('.ubits-progress-bar');
        if (!root) {
            mount.innerHTML = fileUploadCompactProgressMarkup(pct);
            root = mount.querySelector('.ubits-progress-bar');
        }
        return root;
    }

    function applyFileUploadCompactProgressRoot(root, pct) {
        if (!root) return;
        if (typeof setProgressBarValue === 'function') {
            setProgressBarValue(root, pct, { autoComplete: true });
            return;
        }
        var value = Math.max(0, Math.min(100, Math.round(Number(pct) || 0)));
        var fill = root.querySelector('.ubits-progress-bar__fill');
        if (fill) fill.style.width = value + '%';
        root.classList.toggle('ubits-progress-bar--complete', value >= 100);
        root.setAttribute('aria-valuenow', String(value));
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

    function maxFilesMessage(maxFiles) {
        return 'Puedes adjuntar hasta ' + maxFiles + ' archivos.';
    }

    var _fucIdSeq = 0;
    function nextCompactFileId() {
        _fucIdSeq += 1;
        return 'fuc-' + _fucIdSeq;
    }

    function escapeCompactHtml(str) {
        return String(str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
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
        var multiple = opts.multiple === true;
        var maxFiles = opts.maxFiles;
        var hasFileCap = typeof maxFiles === 'number' && maxFiles > 0;
        var formats = opts.formats || (
            multiple && hasFileCap
                ? (acceptLabel(accept) + ' \u2022 Hasta ' + maxLbl + ' · Máximo ' + maxFiles)
                : (acceptLabel(accept) + ' \u2022 Hasta ' + maxLbl)
        );
        var icon = opts.icon || 'file-lines';
        var uploadLabel = multiple ? 'Subir archivos' : (opts.uploadButtonLabel || 'Subir');
        var changeLabel = opts.changeButtonLabel || 'Cambiar';
        var fileIcon = opts.fileIcon || 'file-lines';
        var btns = (opts.downloadButtons || []).slice(0, 3);
        var hideHeader = opts.hideHeader === true;
        var rootExtraClass = hideHeader ? ' ubits-file-upload-compact--hide-header' : '';
        if (multiple) rootExtraClass += ' ubits-file-upload-compact--multiple';

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
            '<div class="ubits-file-upload-compact' + rootExtraClass + '" id="' + id + '" data-file-upload-compact' +
              (multiple ? ' data-file-upload-compact-multiple="true"' : '') + '>' +
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
                    '<div class="ubits-file-upload-compact__progress-mount" data-file-upload-compact-progress-mount></div>' +
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
              '<div class="ubits-file-upload-compact__file-list" data-file-upload-compact-file-list hidden>' +
                '<div class="ubits-file-upload-compact__file-list-head">' +
                  '<span class="ubits-body-sm-bold ubits-file-upload-compact__file-list-title" data-file-upload-compact-file-list-title>Archivos (0)</span>' +
                  '<span class="ubits-file-upload-compact__file-list-grow"></span>' +
                  '<button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm" data-file-upload-compact-clear-all>Limpiar todo</button>' +
                '</div>' +
                '<div class="ubits-file-upload-compact__file-list-items" data-file-upload-compact-file-list-items></div>' +
              '</div>' +
              '<div class="ubits-file-upload-compact__processing" data-file-upload-compact-processing hidden aria-live="polite">' +
                '<span class="ubits-body-sm-regular ubits-file-upload-compact__processing-label">Procesando</span>' +
                '<div class="ubits-file-upload-compact__processing-mount" data-file-upload-compact-processing-mount></div>' +
                '<span class="ubits-body-sm-regular ubits-file-upload-compact__processing-pct" data-file-upload-compact-processing-pct>0%</span>' +
              '</div>' +
              '<input type="file" class="ubits-file-upload-compact__input" data-file-upload-compact-input' +
                (accept ? ' accept="' + accept + '"' : '') +
                (multiple ? ' multiple' : '') + '>' +
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
        var multiple = opts.multiple === true || el.getAttribute('data-file-upload-compact-multiple') === 'true';
        var maxFiles = opts.maxFiles;
        var hasFileCap = typeof maxFiles === 'number' && maxFiles > 0;
        var previewThumbnail = opts.previewThumbnail !== false && !multiple;
        var fileIcon = opts.fileIcon || 'file-lines';
        var onFilesChange = opts.onFilesChange || null;

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
        var listEl = el.querySelector('[data-file-upload-compact-file-list]');
        var listTitleEl = el.querySelector('[data-file-upload-compact-file-list-title]');
        var listItemsEl = el.querySelector('[data-file-upload-compact-file-list-items]');
        var clearAllBtn = el.querySelector('[data-file-upload-compact-clear-all]');

        /** @type {Array<{ id: string, name: string, size: number, real: File|null, previewUrl: string|null }>} */
        var files = [];

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

        function atMax() {
            return Boolean(multiple && hasFileCap && files.length >= maxFiles);
        }

        function syncEmptyVisibility() {
            if (!emptyEl) return;
            if (multiple) {
                emptyEl.hidden = atMax();
                emptyEl.classList.toggle('ubits-file-upload-compact__tile--disabled', atMax());
            } else {
                emptyEl.hidden = files.length > 0;
                emptyEl.classList.remove('ubits-file-upload-compact__tile--disabled');
            }
        }

        function emitChange(previewUrl) {
            var real = files.map(function (f) { return f.real; }).filter(Boolean);
            var detail = {
                file: real[0] || null,
                previewUrl: previewUrl != null ? previewUrl : (files[0] && files[0].previewUrl) || null
            };
            if (multiple) detail.files = real.slice();
            el.dispatchEvent(new CustomEvent('ubits-file-upload-compact-change', {
                bubbles: true,
                detail: detail
            }));
            if (onFilesChange) onFilesChange(real.slice());
            if (typeof opts.onChange === 'function') {
                opts.onChange(detail.file, detail);
            }
        }

        function renderFileList() {
            if (!multiple || !listEl || !listItemsEl) return;
            if (files.length === 0) {
                listEl.hidden = true;
                listItemsEl.innerHTML = '';
                if (listTitleEl) listTitleEl.textContent = 'Archivos (0)';
                syncEmptyVisibility();
                return;
            }
            listEl.hidden = false;
            if (listTitleEl) {
                listTitleEl.textContent = 'Archivos (' + files.length.toLocaleString('es-CO') + ')';
            }
            listItemsEl.innerHTML = files.map(function (item) {
                return (
                    '<div class="ubits-file-upload-compact__tile ubits-file-upload-compact__tile--filled" data-file-upload-compact-list-item="' + item.id + '" aria-live="polite">' +
                      '<span class="ubits-file-upload-compact__icon-wrap" aria-hidden="true">' +
                        '<i class="far fa-' + fileIcon + '"></i></span>' +
                      '<div class="ubits-file-upload-compact__meta">' +
                        '<span class="ubits-body-sm-semibold ubits-file-upload-compact__name">' + escapeCompactHtml(item.name) + '</span>' +
                        '<span class="ubits-body-sm-regular ubits-file-upload-compact__size">' + formatSize(item.size) + '</span>' +
                      '</div>' +
                      '<div class="ubits-file-upload-compact__actions">' +
                        '<button type="button" class="ubits-button ubits-button--error-tertiary ubits-button--sm ubits-button--icon-only ubits-file-upload-compact__remove-btn" ' +
                          'data-file-upload-compact-list-remove="' + item.id + '" aria-label="Quitar ' + escapeCompactHtml(item.name) + '">' +
                          '<i class="far fa-trash-alt"></i></button>' +
                      '</div>' +
                    '</div>'
                );
            }).join('');
            syncEmptyVisibility();
        }

        function showEmpty(emit) {
            files = [];
            if (emptyEl) {
                emptyEl.hidden = false;
                emptyEl.classList.remove('ubits-file-upload-compact__tile--invalid', 'ubits-file-upload-compact__tile--disabled');
            }
            if (filledEl) {
                filledEl.hidden = true;
                filledEl.classList.remove('ubits-file-upload-compact__tile--invalid');
            }
            if (input) input.value = '';
            if (previewImg) previewImg.removeAttribute('src');
            if (thumbEl) thumbEl.hidden = true;
            if (fileIconEl) fileIconEl.hidden = false;
            if (listEl) listEl.hidden = true;
            if (listItemsEl) listItemsEl.innerHTML = '';
            el._fileUploadCompactPreviewUrl = null;
            setHelper(null);
            fileUploadCompactShowErrorReport(el, false, { placement: 'header' });
            fileUploadCompactShowErrorReport(el, false, { placement: 'inline' });
            fileUploadCompactClearProgress(el);
            fileUploadCompactClearProcessing(el);
            var rem = el.querySelector('[data-file-upload-compact-remove]');
            if (rem) rem.style.display = '';
            if (emit !== false) emitChange(null);
        }

        function showSingleFilled(file, previewUrl) {
            if (emptyEl) emptyEl.hidden = true;
            if (filledEl) filledEl.hidden = false;
            if (nameEl) nameEl.textContent = file.name;
            if (sizeEl) sizeEl.textContent = formatSize(file.size);
            if (emptyEl) emptyEl.classList.remove('ubits-file-upload-compact__tile--invalid');
            setHelper(null);

            el._fileUploadCompactPreviewUrl = previewUrl || null;
            el._fileUploadCompactPreviewThumbnail = previewThumbnail;
            syncCompactUploadThumbnail(el);
        }

        function removeAt(id) {
            files = files.filter(function (f) { return f.id !== id; });
            setHelper(null);
            if (input) input.value = '';
            if (!multiple) {
                showEmpty(true);
                return;
            }
            if (files.length === 0) {
                showEmpty(true);
                return;
            }
            renderFileList();
            emitChange(null);
        }

        function validateOne(file) {
            if (!fileMatchesAccept(file, accept)) {
                var typeMsg = 'El archivo no es compatible. Solo se aceptan: ' + accept + '.';
                return { type: 'type', message: typeMsg };
            }
            if (file.size > maxMb * 1048576) {
                return { type: 'size', message: 'El archivo es demasiado grande. El límite es ' + maxMb + ' MB.' };
            }
            return null;
        }

        function fireError(err) {
            if (emptyEl && !emptyEl.hidden) emptyEl.classList.add('ubits-file-upload-compact__tile--invalid');
            setHelper(err.message);
            el.dispatchEvent(new CustomEvent('ubits-file-upload-compact-error', {
                bubbles: true,
                detail: err
            }));
            if (typeof opts.onError === 'function') opts.onError(err);
        }

        function finishApplyMultiple(accepted, lastError, incomingLen, room) {
            files = files.concat(accepted);
            if (filledEl) filledEl.hidden = true;
            renderFileList();
            setHelper(null);
            if (accepted.length === 1) {
                setHelper('Archivo validado. Puedes continuar.', 'success');
            } else {
                setHelper(accepted.length + ' archivos validados. Puedes continuar.', 'success');
            }
            emitChange(null);
            if (lastError) fireError(lastError);
            else if (hasFileCap && incomingLen > room) {
                fireError({ type: 'max', message: maxFilesMessage(maxFiles) });
            }
        }

        function applyIncoming(incoming) {
            if (!incoming || !incoming.length) return;

            if (!multiple) {
                var f = incoming[0];
                var err = validateOne(f);
                if (err) {
                    if (input) input.value = '';
                    fireError(err);
                    return;
                }
                files = [{ id: nextCompactFileId(), name: f.name, size: f.size, real: f, previewUrl: null }];
                if (previewThumbnail && isImageFile(f)) {
                    var reader = new FileReader();
                    reader.onload = function (ev) {
                        var url = ev && ev.target ? ev.target.result : null;
                        files[0].previewUrl = url;
                        showSingleFilled(f, url);
                        emitChange(url);
                    };
                    reader.readAsDataURL(f);
                } else {
                    showSingleFilled(f, null);
                    emitChange(null);
                }
                return;
            }

            var room = hasFileCap ? Math.max(0, maxFiles - files.length) : Number.POSITIVE_INFINITY;
            if (hasFileCap && room === 0) {
                fireError({ type: 'max', message: maxFilesMessage(maxFiles) });
                return;
            }

            var existingKeys = {};
            files.forEach(function (item) {
                existingKeys[item.name + '::' + item.size] = true;
            });
            var accepted = [];
            var lastError = null;

            for (var i = 0; i < incoming.length; i++) {
                if (accepted.length >= room) break;
                var file = incoming[i];
                var key = file.name + '::' + file.size;
                if (existingKeys[key]) continue;
                var vErr = validateOne(file);
                if (vErr) {
                    lastError = vErr;
                    continue;
                }
                existingKeys[key] = true;
                accepted.push({
                    id: nextCompactFileId(),
                    name: file.name,
                    size: file.size,
                    real: file,
                    previewUrl: null
                });
            }

            if (accepted.length === 0) {
                if (lastError) fireError(lastError);
                return;
            }

            finishApplyMultiple(accepted, lastError, incoming.length, room);
        }

        function injectMocks(items) {
            fileUploadCompactClearProgress(el);
            fileUploadCompactClearProcessing(el);
            fileUploadCompactShowErrorReport(el, false, { placement: 'header' });
            fileUploadCompactShowErrorReport(el, false, { placement: 'inline' });
            setHelper(null);
            if (input) input.value = '';
            var rem = el.querySelector('[data-file-upload-compact-remove]');
            if (rem) rem.style.display = '';

            files = (items || []).map(function (item) {
                return {
                    id: nextCompactFileId(),
                    name: item.name,
                    size: (typeof item.sizeKb === 'number' ? item.sizeKb : 0) * 1024,
                    real: null,
                    previewUrl: null
                };
            });

            if (!multiple) {
                if (files.length === 0) {
                    showEmpty(false);
                    return;
                }
                showSingleFilled(files[0], null);
                if (listEl) listEl.hidden = true;
                return;
            }

            if (filledEl) filledEl.hidden = true;
            renderFileList();
        }

        function openPicker() {
            if (atMax()) return;
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
                showEmpty(true);
            });
        }

        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                showEmpty(true);
            });
        }

        if (listItemsEl) {
            listItemsEl.addEventListener('click', function (e) {
                var btn = e.target.closest('[data-file-upload-compact-list-remove]');
                if (!btn) return;
                e.preventDefault();
                e.stopPropagation();
                removeAt(btn.getAttribute('data-file-upload-compact-list-remove'));
            });
        }

        if (input) {
            input.addEventListener('change', function () {
                var list = input.files ? Array.prototype.slice.call(input.files) : [];
                if (list.length) applyIncoming(list);
                input.value = '';
            });
        }

        el._fileUploadCompactShowEmpty = function () { showEmpty(true); };
        el._fileUploadCompactInjectMocks = injectMocks;
        el._fileUploadCompactClearAll = function () { showEmpty(true); };
        el._fileUploadCompactIsMultiple = multiple;
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
        var root = resolveFileUploadCompactProgressRoot(el, pct, '[data-file-upload-compact-progress-mount]');
        var pctEl = el.querySelector('[data-file-upload-compact-progress-pct]');
        if (filledEl) filledEl.classList.add('ubits-file-upload-compact__tile--uploading');
        applyFileUploadCompactProgressRoot(root, pct);
        if (pctEl) pctEl.textContent = Math.round(pct) + '%';
        syncCompactUploadThumbnail(el);
    }

    function fileUploadCompactClearProgress(idOrEl) {
        var el = resolveEl(idOrEl);
        if (!el) return;
        var filledEl = el.querySelector('[data-file-upload-compact-filled]');
        var mount = el.querySelector('[data-file-upload-compact-progress-mount]');
        var pctEl = el.querySelector('[data-file-upload-compact-progress-pct]');
        if (filledEl) filledEl.classList.remove('ubits-file-upload-compact__tile--uploading');
        if (mount) mount.innerHTML = '';
        if (pctEl) pctEl.textContent = '0%';
        syncCompactUploadThumbnail(el);
    }

    function fileUploadCompactSetProcessing(idOrEl, percent) {
        var el = resolveEl(idOrEl);
        if (!el) return;
        var pct = Math.max(0, Math.min(100, percent));
        var block = el.querySelector('[data-file-upload-compact-processing]');
        var root = resolveFileUploadCompactProgressRoot(el, pct, '[data-file-upload-compact-processing-mount]');
        var pctEl = el.querySelector('[data-file-upload-compact-processing-pct]');
        el.classList.add('ubits-file-upload-compact--processing');
        if (block) block.hidden = false;
        applyFileUploadCompactProgressRoot(root, pct);
        if (pctEl) pctEl.textContent = Math.round(pct) + '%';
        syncCompactUploadThumbnail(el);
    }

    function fileUploadCompactClearProcessing(idOrEl) {
        var el = resolveEl(idOrEl);
        if (!el) return;
        var block = el.querySelector('[data-file-upload-compact-processing]');
        var mount = el.querySelector('[data-file-upload-compact-processing-mount]');
        var pctEl = el.querySelector('[data-file-upload-compact-processing-pct]');
        el.classList.remove('ubits-file-upload-compact--processing');
        if (block) block.hidden = true;
        if (mount) mount.innerHTML = '';
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
        /* En multiple, ocultar quitar de cada ítem de la lista */
        el.querySelectorAll('[data-file-upload-compact-list-remove]').forEach(function (btn) {
            btn.style.display = 'none';
        });
    }

    function fileUploadCompactSetFile(idOrEl, name, sizeKb) {
        var el = resolveEl(idOrEl);
        if (!el || typeof el._fileUploadCompactInjectMocks !== 'function') return;
        el._fileUploadCompactInjectMocks([{ name: name, sizeKb: sizeKb }]);
    }

    function fileUploadCompactSetFiles(idOrEl, items) {
        var el = resolveEl(idOrEl);
        if (!el || typeof el._fileUploadCompactInjectMocks !== 'function') return;
        el._fileUploadCompactInjectMocks(items || []);
    }

    function fileUploadCompactClearFile(idOrEl) {
        var el = resolveEl(idOrEl);
        if (!el) return;
        if (typeof el._fileUploadCompactClearAll === 'function') {
            el._fileUploadCompactClearAll();
            return;
        }
        if (typeof el._fileUploadCompactShowEmpty === 'function') el._fileUploadCompactShowEmpty();
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
        window.fileUploadCompactSetFile = fileUploadCompactSetFile;
        window.fileUploadCompactSetFiles = fileUploadCompactSetFiles;
        window.fileUploadCompactClearFile = fileUploadCompactClearFile;
    }
})();
