/**
 * UBITS — File Upload
 *
 * API pública:
 *   createFileUpload(opts)                      — genera el HTML e inicializa en un contenedor
 *   initFileUpload(containerOrId?, opts?)       — inicializa HTML ya existente
 *   fileUploadShowErrorReport(idOrEl, visible)  — muestra / oculta el botón "Informe de errores"
 *   fileUploadSetError(idOrEl, message)         — muestra un error externo (p. ej. procesado en servidor)
 *   fileUploadClearError(idOrEl)               — limpia el error inline
 *   fileUploadSetProgress(idOrEl, percent)      — activa estado "cargando": oculta botón eliminar,
 *                                                 muestra barra de progreso (azul 0-99 %, verde 100 %)
 *   fileUploadClearProgress(idOrEl)             — vuelve al estado normal (con botón eliminar)
 *   fileUploadSetProcessing(idOrEl, percent)    — activa variante "Procesando" (barra debajo del card)
 *   fileUploadClearProcessing(idOrEl)           — limpia variante "Procesando"
 *   fileUploadAnimateProcessing(idOrEl, ms, cb) — anima 0→100 (default 5s) y ejecuta cb al terminar
 *   fileUploadSetHeaderVisible(idOrEl, visible) — muestra u oculta .ubits-file-upload__header (visible false = oculto)
 *   fileUploadSetFile(idOrEl, name, sizeKb)     — inyecta un mock (demos); en multiple reemplaza la lista con 1 ítem
 *   fileUploadSetFiles(idOrEl, items)           — inyecta mocks [{ name, sizeKb }, …] (modo multiple)
 *   fileUploadClearFile(idOrEl)                 — limpia archivo(s) y vuelve al vacío
 *
 * Opciones de createFileUpload():
 *   containerId       {string}   ID del contenedor donde inyectar el HTML (requerido)
 *   id                {string}   ID del elemento raíz generado (default: 'ubits-fu-{containerId}')
 *   title             {string}   Texto del encabezado (default: 'Importar archivo')
 *   accept            {string}   Atributo accept del <input type="file"> (p. ej. '.csv,text/csv')
 *   maxSizeMb         {number}   Tamaño máximo en MB (default: 5)
 *   maxLabel          {string}   Texto para mostrar el límite (default: '{maxSizeMb} MB')
 *   formats           {string}   Texto libre de formatos (default: derivado de accept + maxLabel)
 *   multiple          {boolean}  true = varios archivos; dropzone sigue disponible + lista debajo
 *   maxFiles          {number}   Tope opcional en modo multiple (sin valor = sin límite)
 *   downloadButtons   {Array}    Hasta 3 objetos { label, icon?, onClick }; icon = clase FA sin 'fa-'
 *   hideHeader        {boolean}  true = oculta la fila .ubits-file-upload__header (título + acciones)
 *   onChange          {Function} Callback (file | null) al seleccionar o quitar (modo simple)
 *   onFilesChange     {Function} Callback (File[]) con la lista (modo multiple; también se llama en simple)
 *   onError           {Function} Callback ({ type: 'type'|'size'|'max', message }) al fallar validación
 *
 * Eventos custom (bubbles: true):
 *   'ubits-file-upload-change'  — detail: { file: File | null, files?: File[] }
 *   'ubits-file-upload-error'   — detail: { type: 'type'|'size'|'max', message: string }
 *
 * Bugs / notas de implementación:
 *   - El click en el dropzone se delega al <input type="file"> oculto; si el usuario hace clic
 *     directamente en el botón "Seleccionar archivo", se usa stopPropagation para evitar doble
 *     apertura del diálogo del sistema.
 *   - pointer-events: none en .ubits-file-upload__dropzone-inner es necesario para que los
 *     eventos de drag/click burbujeen al dropzone sin ser interceptados por los hijos de texto.
 *     Los botones dentro usan pointer-events: auto para recuperar su interactividad.
 *   - dragleave detecta si el mouse sale realmente del dropzone comprobando e.relatedTarget;
 *     sin esto, mover el cursor sobre elementos hijos dispara dragleave prematuramente.
 */
(function () {
    'use strict';

    /* ─── utilidades ─────────────────────────────────── */

    function fileUploadProgressMarkup(pct) {
        var value = Math.max(0, Math.min(100, Math.round(Number(pct) || 0)));
        var opts = {
            value: value,
            size: 'sm',
            rounded: true,
            track: 'subtle',
            autoComplete: true
        };
        if (typeof progressBarHtml === 'function') return progressBarHtml(opts);
        var cls = 'ubits-progress-bar ubits-progress-bar--sm ubits-progress-bar--rounded ubits-progress-bar--track-subtle';
        if (value >= 100) cls += ' ubits-progress-bar--complete';
        return '<div class="' + cls + '" role="progressbar" aria-valuenow="' + value + '" aria-valuemin="0" aria-valuemax="100">' +
            '<div class="ubits-progress-bar__track"><div class="ubits-progress-bar__fill" style="width:' + value + '%"></div></div></div>';
    }

    function resolveFileUploadProgressRoot(el, pct, mountSelector) {
        var mount = el.querySelector(mountSelector);
        if (!mount) return null;
        var root = mount.querySelector('.ubits-progress-bar');
        if (!root) {
            mount.innerHTML = fileUploadProgressMarkup(pct);
            root = mount.querySelector('.ubits-progress-bar');
        }
        return root;
    }

    function applyFileUploadProgressRoot(root, pct) {
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

    function maxFilesMessage(maxFiles) {
        return 'Puedes adjuntar hasta ' + maxFiles + ' archivos.';
    }

    var _fuIdSeq = 0;
    function nextFileId() {
        _fuIdSeq += 1;
        return 'fu-' + _fuIdSeq;
    }

    function resolveUploadEl(idOrEl) {
        if (!idOrEl) return null;
        return typeof idOrEl === 'string' ? document.getElementById(idOrEl) : idOrEl;
    }

    /* ─── construcción del HTML ──────────────────────── */

    function buildHtml(opts, id) {
        var title   = opts.title || 'Importar archivo';
        var accept  = opts.accept || '';
        var maxMb   = opts.maxSizeMb || 5;
        var maxLbl  = opts.maxLabel  || (maxMb + ' MB');
        var multiple = opts.multiple === true;
        var maxFiles = opts.maxFiles;
        var hasFileCap = typeof maxFiles === 'number' && maxFiles > 0;
        var formats = opts.formats || (
            multiple && hasFileCap
                ? (acceptLabel(accept) + ' \u2022 Hasta ' + maxLbl + ' · Máximo ' + maxFiles)
                : (acceptLabel(accept) + ' \u2022 Hasta ' + maxLbl)
        );
        var btns    = (opts.downloadButtons || []).slice(0, 3);
        var hideHeader = opts.hideHeader === true;
        var rootExtraClass = hideHeader ? ' ubits-file-upload--hide-header' : '';
        if (multiple) rootExtraClass += ' ubits-file-upload--multiple';
        var dropTitle = multiple ? 'Subir archivos' : 'Subir archivo';
        var selectLabel = multiple ? 'Seleccionar archivos' : 'Seleccionar archivo';

        var actionBtnsHtml = btns.map(function (b) {
            return '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm ubits-file-upload__download-btn" data-file-upload-download>' +
                '<i class="far ' + (b.icon ? 'fa-' + b.icon : 'fa-arrow-down-to-line') + '"></i>' +
                '<span>' + b.label + '</span></button>';
        }).join('');

        actionBtnsHtml +=
            '<button type="button" class="ubits-button ubits-button--error-secondary ubits-button--sm ubits-file-upload__error-report-btn" ' +
            'data-file-upload-error-report style="display:none" aria-live="polite">' +
            '<i class="far fa-circle-exclamation"></i><span>Informe de errores</span></button>';

        return (
            '<div class="ubits-file-upload' + rootExtraClass + '" id="' + id + '" data-file-upload' +
              (multiple ? ' data-file-upload-multiple="true"' : '') + '>' +
              '<div class="ubits-file-upload__header">' +
                '<h2 class="ubits-body-md-bold ubits-file-upload__title">' + title + '</h2>' +
                '<div class="ubits-file-upload__actions">' + actionBtnsHtml + '</div>' +
              '</div>' +
              '<div class="ubits-file-upload__dropzone" data-file-upload-dropzone>' +
                '<div class="ubits-file-upload__empty" data-file-upload-empty>' +
                  '<div class="ubits-file-upload__dropzone-inner">' +
                    '<div class="ubits-file-upload__icon-wrap"><i class="far fa-file-arrow-up"></i></div>' +
                    '<p class="ubits-body-md-semibold ubits-file-upload__dropzone-title">' + dropTitle + '</p>' +
                    '<p class="ubits-body-sm-regular ubits-file-upload__dropzone-formats">' + formats + '</p>' +
                    '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm ubits-file-upload__select-btn" data-file-upload-select>' +
                      '<i class="far fa-arrow-up-from-bracket"></i><span>' + selectLabel + '</span>' +
                    '</button>' +
                  '</div>' +
                '</div>' +
                '<div class="ubits-file-upload__file-card" data-file-upload-card style="display:none" aria-live="polite">' +
                  '<div class="ubits-file-upload__file-icon-wrap" aria-hidden="true"><i class="far fa-file-lines"></i></div>' +
                  '<div class="ubits-file-upload__file-meta">' +
                    '<span class="ubits-body-sm-semibold ubits-file-upload__file-name" data-file-upload-name></span>' +
                    '<span class="ubits-body-sm-regular ubits-file-upload__file-size" data-file-upload-size></span>' +
                    '<div class="ubits-file-upload__progress-wrap">' +
                      '<div class="ubits-file-upload__progress-mount" data-file-upload-progress-mount></div>' +
                      '<span class="ubits-body-sm-regular ubits-file-upload__progress-pct" data-file-upload-progress-pct>0%</span>' +
                    '</div>' +
                  '</div>' +
                  '<button type="button" class="ubits-button ubits-button--error-tertiary ubits-button--sm ubits-button--icon-only ubits-file-upload__remove-btn" data-file-upload-remove aria-label="Quitar archivo">' +
                    '<i class="far fa-trash-alt"></i>' +
                  '</button>' +
                '</div>' +
                '<div class="ubits-file-upload__processing" data-file-upload-processing style="display:none" aria-live="polite">' +
                  '<span class="ubits-body-sm-regular ubits-file-upload__processing-label">Procesando</span>' +
                  '<div class="ubits-file-upload__processing-mount" data-file-upload-processing-mount></div>' +
                  '<span class="ubits-body-sm-regular ubits-file-upload__processing-pct" data-file-upload-processing-pct>0%</span>' +
                '</div>' +
                '<input type="file" class="ubits-file-upload__input" data-file-upload-input' +
                  (accept ? ' accept="' + accept + '"' : '') +
                  (multiple ? ' multiple' : '') + ' style="display:none">' +
              '</div>' +
              '<div class="ubits-file-upload__file-list" data-file-upload-file-list style="display:none">' +
                '<div class="ubits-file-upload__file-list-head">' +
                  '<span class="ubits-body-sm-bold ubits-file-upload__file-list-title" data-file-upload-file-list-title>Archivos (0)</span>' +
                  '<span class="ubits-file-upload__file-list-grow"></span>' +
                  '<button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm" data-file-upload-clear-all>Limpiar todo</button>' +
                '</div>' +
                '<div class="ubits-file-upload__file-list-items" data-file-upload-file-list-items></div>' +
              '</div>' +
              '<div class="ubits-body-sm-regular ubits-file-upload__helper" data-file-upload-helper style="display:none">' +
                '<span class="ubits-file-upload__helper-msg" data-file-upload-helper-msg></span>' +
                '<button type="button" class="ubits-button ubits-button--error-secondary ubits-button--sm ubits-file-upload__error-report-btn-inline" ' +
                  'data-file-upload-error-report-inline style="display:none" aria-live="polite">' +
                  '<i class="far fa-circle-exclamation"></i><span>Informe de errores</span></button>' +
              '</div>' +
            '</div>'
        );
    }

    /* ─── binding de eventos ─────────────────────────── */

    function bindFileUpload(el, opts) {
        if (!el || el.dataset.fileUploadInit) return;
        el.dataset.fileUploadInit = '1';

        var inputEl = el.querySelector('[data-file-upload-input]');
        var accept = (inputEl && inputEl.getAttribute('accept')) || opts.accept || '';
        var maxMb = opts.maxSizeMb || 5;
        var multiple = opts.multiple === true || el.getAttribute('data-file-upload-multiple') === 'true';
        var maxFiles = opts.maxFiles;
        var hasFileCap = typeof maxFiles === 'number' && maxFiles > 0;
        var onChange = opts.onChange || null;
        var onFilesChange = opts.onFilesChange || null;
        var onError = opts.onError || null;
        var successMessage = (Object.prototype.hasOwnProperty.call(opts, 'successMessage') ? opts.successMessage : 'Archivo validado. Puedes continuar.');

        var dropzone = el.querySelector('[data-file-upload-dropzone]');
        var emptyEl = el.querySelector('[data-file-upload-empty]');
        var cardEl = el.querySelector('[data-file-upload-card]');
        var nameEl = el.querySelector('[data-file-upload-name]');
        var sizeEl = el.querySelector('[data-file-upload-size]');
        var helperEl = el.querySelector('[data-file-upload-helper]');
        var selectBtn = el.querySelector('[data-file-upload-select]');
        var removeBtn = el.querySelector('[data-file-upload-remove]');
        var listEl = el.querySelector('[data-file-upload-file-list]');
        var listTitleEl = el.querySelector('[data-file-upload-file-list-title]');
        var listItemsEl = el.querySelector('[data-file-upload-file-list-items]');
        var clearAllBtn = el.querySelector('[data-file-upload-clear-all]');

        /** @type {Array<{ id: string, name: string, size: number, real: File|null }>} */
        var files = [];

        function setHelper(type, msg) {
            if (!helperEl) return;
            var msgEl = helperEl.querySelector('[data-file-upload-helper-msg]');
            if (!msgEl) return;
            var message = String(msg || '').trim();
            if (!message) {
                helperEl.style.display = 'none';
                msgEl.innerHTML = '';
                helperEl.classList.remove('ubits-file-upload__helper--success');
                fileUploadShowErrorReport(el, false, { placement: 'inline' });
                return;
            }

            helperEl.classList.toggle('ubits-file-upload__helper--success', type === 'success');

            var iconHtml = type === 'success'
                ? '<i class="far fa-check-circle" aria-hidden="true"></i>'
                : '<i class="far fa-circle-exclamation" aria-hidden="true"></i>';

            msgEl.innerHTML = iconHtml + '<span></span>';
            var span = msgEl.querySelector('span');
            if (span) span.textContent = message;
            helperEl.style.display = '';
        }

        function showError(msg) {
            if (dropzone) dropzone.classList.add('ubits-file-upload__dropzone--invalid');
            setHelper('error', msg);
        }

        function clearError() {
            if (dropzone) dropzone.classList.remove('ubits-file-upload__dropzone--invalid');
            setHelper('', '');
        }

        function showSuccess(msg) {
            if (dropzone) dropzone.classList.remove('ubits-file-upload__dropzone--invalid');
            setHelper('success', msg);
        }

        function atMax() {
            return Boolean(multiple && hasFileCap && files.length >= maxFiles);
        }

        function syncDropzoneDisabled() {
            if (!dropzone) return;
            dropzone.classList.toggle('ubits-file-upload__dropzone--disabled', atMax());
        }

        function emitChange() {
            var real = files.map(function (f) { return f.real; }).filter(Boolean);
            var detail = { file: real[0] || null };
            if (multiple) detail.files = real.slice();
            el.dispatchEvent(new CustomEvent('ubits-file-upload-change', { bubbles: true, detail: detail }));
            if (onFilesChange) onFilesChange(real.slice());
            if (!multiple && onChange) onChange(real[0] || null);
        }

        function renderFileList() {
            if (!multiple || !listEl || !listItemsEl) return;
            if (files.length === 0) {
                listEl.style.display = 'none';
                listItemsEl.innerHTML = '';
                if (listTitleEl) listTitleEl.textContent = 'Archivos (0)';
                syncDropzoneDisabled();
                return;
            }
            listEl.style.display = '';
            if (listTitleEl) {
                listTitleEl.textContent = 'Archivos (' + files.length.toLocaleString('es-CO') + ')';
            }
            listItemsEl.innerHTML = files.map(function (item) {
                return (
                    '<div class="ubits-file-upload__file-list-card" data-file-upload-list-item="' + item.id + '" aria-live="polite">' +
                      '<div class="ubits-file-upload__file-icon-wrap" aria-hidden="true"><i class="far fa-file-lines"></i></div>' +
                      '<div class="ubits-file-upload__file-meta">' +
                        '<span class="ubits-body-sm-semibold ubits-file-upload__file-name">' + escapeHtml(item.name) + '</span>' +
                        '<span class="ubits-body-sm-regular ubits-file-upload__file-size">' + formatSize(item.size) + '</span>' +
                      '</div>' +
                      '<button type="button" class="ubits-button ubits-button--error-tertiary ubits-button--sm ubits-button--icon-only ubits-file-upload__remove-btn" ' +
                        'data-file-upload-list-remove="' + item.id + '" aria-label="Quitar archivo">' +
                        '<i class="far fa-trash-alt"></i>' +
                      '</button>' +
                    '</div>'
                );
            }).join('');
            syncDropzoneDisabled();
        }

        function escapeHtml(str) {
            return String(str || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;');
        }

        function showSingleFile(fileLike) {
            clearError();
            if (nameEl) nameEl.textContent = fileLike.name;
            if (sizeEl) sizeEl.textContent = formatSize(fileLike.size);
            if (emptyEl) emptyEl.style.display = 'none';
            if (cardEl) cardEl.style.display = '';
            if (dropzone) {
                dropzone.classList.add('ubits-file-upload__dropzone--has-file');
                dropzone.classList.remove('ubits-file-upload__dropzone--dragover');
            }
        }

        function resetUiToEmpty(optsClear) {
            optsClear = optsClear || {};
            if (emptyEl) emptyEl.style.display = '';
            if (cardEl) cardEl.style.display = 'none';
            el.classList.remove('ubits-file-upload--processing');
            if (dropzone) {
                dropzone.classList.remove(
                    'ubits-file-upload__dropzone--has-file',
                    'ubits-file-upload__dropzone--invalid',
                    'ubits-file-upload__dropzone--disabled'
                );
            }
            if (inputEl) inputEl.value = '';
            if (listEl) listEl.style.display = 'none';
            if (listItemsEl) listItemsEl.innerHTML = '';
            clearError();
            fileUploadShowErrorReport(el, false, { placement: 'header' });
            fileUploadShowErrorReport(el, false, { placement: 'inline' });
            fileUploadClearProgress(el);
            fileUploadClearProcessing(el);
            var rem = el.querySelector('[data-file-upload-remove]');
            if (rem) rem.style.display = '';
            if (!optsClear.silent) {
                /* emit handled by caller */
            }
        }

        function clearAll(emit) {
            files = [];
            resetUiToEmpty();
            if (emit !== false) emitChange();
        }

        function removeAt(id) {
            files = files.filter(function (f) { return f.id !== id; });
            clearError();
            if (inputEl) inputEl.value = '';
            if (!multiple) {
                clearAll(true);
                return;
            }
            if (files.length === 0) {
                clearAll(true);
                return;
            }
            renderFileList();
            emitChange();
        }

        function validateOne(file) {
            if (accept && !fileMatchesAccept(file, accept)) {
                var extList = accept.split(',').map(function (s) { return s.trim(); })
                    .filter(function (s) { return s.charAt(0) === '.' || s.indexOf('/') === -1; })
                    .join(', ');
                return { type: 'type', message: 'El archivo no es compatible. Solo se aceptan: ' + (extList || accept) + '.' };
            }
            var maxBytes = maxMb * 1048576;
            if (file.size > maxBytes) {
                return { type: 'size', message: 'El archivo es demasiado grande. El límite es ' + maxMb + ' MB.' };
            }
            return null;
        }

        function fireError(err) {
            showError(err.message);
            if (onError) onError(err);
            el.dispatchEvent(new CustomEvent('ubits-file-upload-error', { bubbles: true, detail: err }));
        }

        function applyIncoming(incoming) {
            if (!incoming || !incoming.length) return;

            if (!multiple) {
                var f = incoming[0];
                var err = validateOne(f);
                if (err) {
                    fireError(err);
                    return;
                }
                files = [{ id: nextFileId(), name: f.name, size: f.size, real: f }];
                showSingleFile(f);
                if (successMessage !== false) showSuccess(successMessage);
                emitChange();
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
                accepted.push({ id: nextFileId(), name: file.name, size: file.size, real: file });
            }

            if (accepted.length === 0) {
                if (lastError) fireError(lastError);
                return;
            }

            files = files.concat(accepted);
            if (emptyEl) emptyEl.style.display = '';
            if (cardEl) cardEl.style.display = 'none';
            if (dropzone) {
                dropzone.classList.remove('ubits-file-upload__dropzone--has-file', 'ubits-file-upload__dropzone--dragover');
            }
            renderFileList();
            clearError();
            if (successMessage !== false) {
                if (accepted.length === 1) showSuccess(successMessage);
                else showSuccess(accepted.length + ' archivos validados. Puedes continuar.');
            }
            emitChange();
            if (lastError) {
                fireError(lastError);
            } else if (hasFileCap && incoming.length > room) {
                fireError({ type: 'max', message: maxFilesMessage(maxFiles) });
            }
        }

        function injectMocks(items) {
            files = (items || []).map(function (item) {
                return {
                    id: nextFileId(),
                    name: item.name,
                    size: (typeof item.sizeKb === 'number' ? item.sizeKb : 0) * 1024,
                    real: null
                };
            });
            fileUploadClearProgress(el);
            fileUploadClearProcessing(el);
            fileUploadShowErrorReport(el, false, { placement: 'header' });
            fileUploadShowErrorReport(el, false, { placement: 'inline' });
            clearError();
            if (inputEl) inputEl.value = '';
            var rem = el.querySelector('[data-file-upload-remove]');
            if (rem) rem.style.display = '';

            if (!multiple) {
                if (files.length === 0) {
                    resetUiToEmpty();
                    return;
                }
                showSingleFile(files[0]);
                if (listEl) listEl.style.display = 'none';
                return;
            }

            if (emptyEl) emptyEl.style.display = '';
            if (cardEl) cardEl.style.display = 'none';
            if (dropzone) dropzone.classList.remove('ubits-file-upload__dropzone--has-file');
            renderFileList();
        }

        /* ── eventos ── */

        if (selectBtn && inputEl) {
            selectBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                if (atMax()) return;
                inputEl.click();
            });
        }

        if (dropzone) {
            dropzone.addEventListener('click', function (e) {
                if (!multiple && dropzone.classList.contains('ubits-file-upload__dropzone--has-file')) return;
                if (atMax()) return;
                if (e.target.closest('[data-file-upload-select]')) return;
                if (e.target.closest('[data-file-upload-remove]')) return;
                if (inputEl) inputEl.click();
            });

            dropzone.addEventListener('dragover', function (e) {
                e.preventDefault();
                if ((!multiple && dropzone.classList.contains('ubits-file-upload__dropzone--has-file')) || atMax()) return;
                dropzone.classList.add('ubits-file-upload__dropzone--dragover');
            });

            dropzone.addEventListener('dragleave', function (e) {
                if (!dropzone.contains(e.relatedTarget)) {
                    dropzone.classList.remove('ubits-file-upload__dropzone--dragover');
                }
            });

            dropzone.addEventListener('drop', function (e) {
                e.preventDefault();
                dropzone.classList.remove('ubits-file-upload__dropzone--dragover');
                if ((!multiple && dropzone.classList.contains('ubits-file-upload__dropzone--has-file')) || atMax()) return;
                var list = e.dataTransfer && e.dataTransfer.files ? Array.prototype.slice.call(e.dataTransfer.files) : [];
                if (list.length) applyIncoming(list);
            });
        }

        if (inputEl) {
            inputEl.addEventListener('change', function () {
                var list = this.files ? Array.prototype.slice.call(this.files) : [];
                if (list.length) applyIncoming(list);
                this.value = '';
            });
        }

        if (removeBtn) {
            removeBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                clearAll(true);
            });
        }

        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                clearAll(true);
            });
        }

        if (listItemsEl) {
            listItemsEl.addEventListener('click', function (e) {
                var btn = e.target.closest('[data-file-upload-list-remove]');
                if (!btn) return;
                e.stopPropagation();
                removeAt(btn.getAttribute('data-file-upload-list-remove'));
            });
        }

        el._fileUploadInjectMocks = injectMocks;
        el._fileUploadClearAll = function () { clearAll(true); };
        el._fileUploadIsMultiple = multiple;
    }

    /* ─── API pública ────────────────────────────────── */

    /**
     * Crea un ubits-file-upload e inyecta el HTML en el contenedor indicado.
     * Devuelve el elemento raíz creado o null si no se encuentra el contenedor.
     */
    function createFileUpload(opts) {
        var container = document.getElementById(opts.containerId);
        if (!container) { console.warn('[ubits-file-upload] Contenedor no encontrado:', opts.containerId); return null; }

        var id = opts.id || ('ubits-fu-' + opts.containerId);
        container.innerHTML = buildHtml(opts, id);

        var el = document.getElementById(id);
        if (!el) return null;

        bindFileUpload(el, opts);

        /* Enlazar callbacks de los botones de descarga */
        var btns = (opts.downloadButtons || []).slice(0, 3);
        var downloadBtns = el.querySelectorAll('[data-file-upload-download]');
        btns.forEach(function (b, i) {
            if (downloadBtns[i] && typeof b.onClick === 'function') {
                downloadBtns[i].addEventListener('click', b.onClick);
            }
        });

        return el;
    }

    /**
     * Inicializa uno o varios ubits-file-upload ya presentes en el DOM.
     * Si no se pasa container, busca en todo el document.
     */
    function initFileUpload(containerOrId, opts) {
        var root;
        if (!containerOrId) {
            root = document;
        } else if (typeof containerOrId === 'string') {
            root = document.getElementById(containerOrId);
        } else {
            root = containerOrId;
        }
        if (!root) return;

        var targets = root.hasAttribute && root.hasAttribute('data-file-upload')
            ? [root]
            : root.querySelectorAll('[data-file-upload]');

        targets.forEach(function (el) {
            bindFileUpload(el, opts || {});
            var o = opts || {};
            if (o.hideHeader === true) {
                el.classList.add('ubits-file-upload--hide-header');
            } else if (o.hideHeader === false) {
                el.classList.remove('ubits-file-upload--hide-header');
            }
        });
    }

    /**
     * Muestra u oculta la cabecera (título + acciones) del componente.
     * @param {string|HTMLElement} idOrEl — ID del .ubits-file-upload o el elemento raíz
     * @param {boolean} visible — false oculta el header
     */
    function fileUploadSetHeaderVisible(idOrEl, visible) {
        var el = typeof idOrEl === 'string' ? document.getElementById(idOrEl) : idOrEl;
        if (!el || !el.hasAttribute || !el.hasAttribute('data-file-upload')) return;
        el.classList.toggle('ubits-file-upload--hide-header', visible === false);
    }

    /**
     * Muestra u oculta el botón "Informe de errores" dentro del componente.
     * Llamar cuando el servidor devuelve errores en el contenido del archivo.
     */
    function fileUploadShowErrorReport(idOrEl, visible, opts) {
        var el = typeof idOrEl === 'string' ? document.getElementById(idOrEl) : idOrEl;
        if (!el) return;
        var placement = (opts && opts.placement === 'inline') ? 'inline' : 'header';
        var headerBtn = el.querySelector('[data-file-upload-error-report]');
        var inlineBtn = el.querySelector('[data-file-upload-error-report-inline]');

        if (headerBtn) headerBtn.style.display = (visible && placement === 'header') ? '' : 'none';
        if (inlineBtn) inlineBtn.style.display = (visible && placement === 'inline') ? '' : 'none';
    }

    /**
     * Muestra un error externo (p. ej. devuelto por el servidor tras procesar el archivo).
     * Pone borde rojo en el dropzone y muestra el mensaje de helper.
     */
    function fileUploadSetError(idOrEl, message) {
        var el = typeof idOrEl === 'string' ? document.getElementById(idOrEl) : idOrEl;
        if (!el) return;
        var dropzone = el.querySelector('[data-file-upload-dropzone]');
        var helperEl = el.querySelector('[data-file-upload-helper]');
        var msgEl = helperEl ? helperEl.querySelector('[data-file-upload-helper-msg]') : null;
        if (dropzone) dropzone.classList.add('ubits-file-upload__dropzone--invalid');
        if (helperEl) {
            helperEl.classList.remove('ubits-file-upload__helper--success');
            if (msgEl) {
                msgEl.innerHTML = '<i class="far fa-circle-exclamation" aria-hidden="true"></i><span></span>';
                var span = msgEl.querySelector('span');
                if (span) span.textContent = String(message || '');
            }
            helperEl.style.display = '';
        }
    }

    /**
     * Limpia el error inline (borde rojo + helper text).
     */
    function fileUploadClearError(idOrEl) {
        var el = typeof idOrEl === 'string' ? document.getElementById(idOrEl) : idOrEl;
        if (!el) return;
        var dropzone = el.querySelector('[data-file-upload-dropzone]');
        var helperEl = el.querySelector('[data-file-upload-helper]');
        var msgEl = helperEl ? helperEl.querySelector('[data-file-upload-helper-msg]') : null;
        if (dropzone) dropzone.classList.remove('ubits-file-upload__dropzone--invalid');
        if (helperEl) {
            helperEl.style.display = 'none';
            if (msgEl) msgEl.innerHTML = '';
            helperEl.classList.remove('ubits-file-upload__helper--success');
            fileUploadShowErrorReport(el, false, { placement: 'inline' });
        }
    }

    /**
     * Muestra un mensaje de éxito debajo del dropzone (p. ej. validación ok).
     */
    function fileUploadSetSuccess(idOrEl, message) {
        var el = typeof idOrEl === 'string' ? document.getElementById(idOrEl) : idOrEl;
        if (!el) return;
        var dropzone = el.querySelector('[data-file-upload-dropzone]');
        var helperEl = el.querySelector('[data-file-upload-helper]');
        var msgEl = helperEl ? helperEl.querySelector('[data-file-upload-helper-msg]') : null;
        if (dropzone) dropzone.classList.remove('ubits-file-upload__dropzone--invalid');
        if (helperEl) {
            var msg = String(message || '').trim();
            if (!msg) return;
            helperEl.classList.add('ubits-file-upload__helper--success');
            if (msgEl) {
                msgEl.innerHTML = '<i class="far fa-check-circle" aria-hidden="true"></i><span></span>';
                var span = msgEl.querySelector('span');
                if (span) span.textContent = msg;
            }
            helperEl.style.display = '';
        }
    }

    function fileUploadClearSuccess(idOrEl) {
        var el = typeof idOrEl === 'string' ? document.getElementById(idOrEl) : idOrEl;
        if (!el) return;
        var helperEl = el.querySelector('[data-file-upload-helper]');
        var msgEl = helperEl ? helperEl.querySelector('[data-file-upload-helper-msg]') : null;
        if (helperEl && helperEl.classList.contains('ubits-file-upload__helper--success')) {
            helperEl.style.display = 'none';
            if (msgEl) msgEl.innerHTML = '';
            helperEl.classList.remove('ubits-file-upload__helper--success');
            fileUploadShowErrorReport(el, false, { placement: 'inline' });
        }
    }

    /**
     * Variante "Error: procesado" (archivo pasó validación inicial pero falló el procesamiento).
     * Muestra mensaje con conteo y deja el botón "Informe de errores" al lado del mensaje.
     *
     * opts:
     *  - processedOk {number} filas procesadas correctamente
     *  - failed      {number} filas no procesadas / con error
     *  - message?    {string} override del texto base
     */
    function fileUploadSetProcessingError(idOrEl, opts) {
        var el = typeof idOrEl === 'string' ? document.getElementById(idOrEl) : idOrEl;
        if (!el) return;
        var ok = opts && typeof opts.processedOk === 'number' ? opts.processedOk : 0;
        var failed = opts && typeof opts.failed === 'number' ? opts.failed : 0;
        var baseMsg = 'Se procesaron ' + ok + ' fila(s). ' + failed + ' no se pudieron procesar.';
        var msg = (opts && typeof opts.message === 'string' && opts.message.trim() !== '') ? opts.message.trim() : baseMsg;

        fileUploadSetError(el, msg);
        /* Forzar botón inline (estado "procesado"): debe ir al lado del helper */
        fileUploadShowErrorReport(el, true, { placement: 'inline' });
        fileUploadShowErrorReport(el, false, { placement: 'header' });

        /* Asegurar visibilidad incluso si el layout del helper fue reseteado externamente */
        var helperEl = el.querySelector('[data-file-upload-helper]');
        var inlineBtn = el.querySelector('[data-file-upload-error-report-inline]');
        if (helperEl) helperEl.style.display = '';
        if (inlineBtn) inlineBtn.style.display = '';

        /* En "Error: procesado" ya se procesaron registros parcialmente → no se puede
           eliminar el archivo; ocultar el botón de quitar para no confundir al usuario. */
        var removeBtn = el.querySelector('[data-file-upload-remove]');
        if (removeBtn) removeBtn.style.display = 'none';
        el.querySelectorAll('[data-file-upload-list-remove]').forEach(function (btn) {
            btn.style.display = 'none';
        });
    }

    /**
     * Activa el estado "cargando" en el componente.
     * Oculta el botón eliminar y muestra una barra de progreso en su lugar.
     *   percent: 0-100
     *   0-99 → barra azul (accent-brand)
     *   100  → barra verde (feedback-success)
     *
     * Uso típico:
     *   fileUploadSetProgress(el, 0);           // inicia carga
     *   fileUploadSetProgress(el, 45);          // actualiza
     *   fileUploadSetProgress(el, 100);         // completo (verde)
     *   fileUploadClearProgress(el);            // vuelve al estado normal
     */
    function fileUploadSetProgress(idOrEl, percent) {
        var el = typeof idOrEl === 'string' ? document.getElementById(idOrEl) : idOrEl;
        if (!el) return;
        var pct = Math.max(0, Math.min(100, percent));
        var card     = el.querySelector('[data-file-upload-card]');
        var dropzone = el.querySelector('[data-file-upload-dropzone]');
        var root     = resolveFileUploadProgressRoot(el, pct, '[data-file-upload-progress-mount]');
        var pctEl    = el.querySelector('[data-file-upload-progress-pct]');

        if (card) card.classList.add('ubits-file-upload__file-card--uploading');
        if (dropzone) dropzone.classList.add('ubits-file-upload__dropzone--uploading');
        applyFileUploadProgressRoot(root, pct);
        if (pctEl) pctEl.textContent = pct + '%';
    }

    /**
     * Vuelve al estado normal del card (con botón eliminar, sin barra de progreso).
     * Llamar cuando la carga termina o falla.
     */
    function fileUploadClearProgress(idOrEl) {
        var el = typeof idOrEl === 'string' ? document.getElementById(idOrEl) : idOrEl;
        if (!el) return;
        var card     = el.querySelector('[data-file-upload-card]');
        var dropzone = el.querySelector('[data-file-upload-dropzone]');
        var mount    = el.querySelector('[data-file-upload-progress-mount]');
        var pctEl    = el.querySelector('[data-file-upload-progress-pct]');

        if (card) card.classList.remove('ubits-file-upload__file-card--uploading');
        if (dropzone) dropzone.classList.remove('ubits-file-upload__dropzone--uploading');
        if (mount) mount.innerHTML = '';
        if (pctEl) pctEl.textContent = '0%';
    }

    /**
     * Activa la variante "Procesando":
     * - Conserva el file-card visible
     * - Muestra barra de progreso debajo del card con label "Procesando"
     * - Bloquea interacción del dropzone durante el procesamiento
     */
    function fileUploadSetProcessing(idOrEl, percent) {
        var el = typeof idOrEl === 'string' ? document.getElementById(idOrEl) : idOrEl;
        if (!el) return;
        var pct = Math.max(0, Math.min(100, percent));
        var dropzone = el.querySelector('[data-file-upload-dropzone]');
        var root = resolveFileUploadProgressRoot(el, pct, '[data-file-upload-processing-mount]');
        var pctEl = el.querySelector('[data-file-upload-processing-pct]');
        el.classList.add('ubits-file-upload--processing');
        if (dropzone) dropzone.classList.add('ubits-file-upload__dropzone--processing');
        applyFileUploadProgressRoot(root, pct);
        if (pctEl) pctEl.textContent = pct + '%';
    }

    function fileUploadClearProcessing(idOrEl) {
        var el = typeof idOrEl === 'string' ? document.getElementById(idOrEl) : idOrEl;
        if (!el) return;
        var dropzone = el.querySelector('[data-file-upload-dropzone]');
        var mount = el.querySelector('[data-file-upload-processing-mount]');
        var pctEl = el.querySelector('[data-file-upload-processing-pct]');
        el.classList.remove('ubits-file-upload--processing');
        if (dropzone) dropzone.classList.remove('ubits-file-upload__dropzone--processing');
        if (mount) mount.innerHTML = '';
        if (pctEl) pctEl.textContent = '0%';
    }

    function fileUploadAnimateProcessing(idOrEl, durationMs, onDone) {
        var el = typeof idOrEl === 'string' ? document.getElementById(idOrEl) : idOrEl;
        if (!el) return null;
        var totalMs = (typeof durationMs === 'number' && durationMs > 0) ? durationMs : 5000;
        var start = Date.now();
        fileUploadSetProcessing(el, 0);
        var timer = setInterval(function () {
            var elapsed = Date.now() - start;
            var pct = Math.min(100, Math.round((elapsed / totalMs) * 100));
            fileUploadSetProcessing(el, pct);
            if (pct >= 100) {
                clearInterval(timer);
                if (typeof onDone === 'function') onDone();
            }
        }, 50);
        return timer;
    }

    /**
     * Inyecta un archivo mock (demos/docs). En multiple, deja 1 ítem en la lista.
     */
    function fileUploadSetFile(idOrEl, name, sizeKb) {
        var el = resolveUploadEl(idOrEl);
        if (!el || typeof el._fileUploadInjectMocks !== 'function') return;
        el._fileUploadInjectMocks([{ name: name, sizeKb: sizeKb }]);
    }

    /**
     * Inyecta varios mocks [{ name, sizeKb }, …] (variante multiple / demos).
     */
    function fileUploadSetFiles(idOrEl, items) {
        var el = resolveUploadEl(idOrEl);
        if (!el || typeof el._fileUploadInjectMocks !== 'function') return;
        el._fileUploadInjectMocks(items || []);
    }

    /**
     * Limpia archivo(s) y vuelve al estado vacío.
     */
    function fileUploadClearFile(idOrEl) {
        var el = resolveUploadEl(idOrEl);
        if (!el) return;
        if (typeof el._fileUploadClearAll === 'function') {
            el._fileUploadClearAll();
            return;
        }
        /* Fallback DOM si aún no está wired */
        var dropzone = el.querySelector('[data-file-upload-dropzone]');
        var emptyEl = el.querySelector('[data-file-upload-empty]');
        var cardEl = el.querySelector('[data-file-upload-card]');
        var listEl = el.querySelector('[data-file-upload-file-list]');
        var listItems = el.querySelector('[data-file-upload-file-list-items]');
        if (emptyEl) emptyEl.style.display = '';
        if (cardEl) cardEl.style.display = 'none';
        if (dropzone) dropzone.classList.remove('ubits-file-upload__dropzone--has-file', 'ubits-file-upload__dropzone--invalid', 'ubits-file-upload__dropzone--disabled');
        if (listEl) listEl.style.display = 'none';
        if (listItems) listItems.innerHTML = '';
        fileUploadClearError(el);
        fileUploadClearProgress(el);
        fileUploadClearProcessing(el);
    }

    /* ─── exposición global ──────────────────────────── */

    window.createFileUpload          = createFileUpload;
    window.initFileUpload            = initFileUpload;
    window.fileUploadShowErrorReport = fileUploadShowErrorReport;
    window.fileUploadSetError        = fileUploadSetError;
    window.fileUploadClearError      = fileUploadClearError;
    window.fileUploadSetSuccess      = fileUploadSetSuccess;
    window.fileUploadClearSuccess    = fileUploadClearSuccess;
    window.fileUploadSetProcessingError = fileUploadSetProcessingError;
    window.fileUploadSetProgress     = fileUploadSetProgress;
    window.fileUploadClearProgress   = fileUploadClearProgress;
    window.fileUploadSetProcessing   = fileUploadSetProcessing;
    window.fileUploadClearProcessing = fileUploadClearProcessing;
    window.fileUploadAnimateProcessing = fileUploadAnimateProcessing;
    window.fileUploadSetHeaderVisible  = fileUploadSetHeaderVisible;
    window.fileUploadSetFile         = fileUploadSetFile;
    window.fileUploadSetFiles        = fileUploadSetFiles;
    window.fileUploadClearFile       = fileUploadClearFile;

    /* Auto-init sobre HTML estático */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { initFileUpload(); });
    } else {
        initFileUpload();
    }
}());
