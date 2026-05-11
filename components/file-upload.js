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
 *
 * Opciones de createFileUpload():
 *   containerId       {string}   ID del contenedor donde inyectar el HTML (requerido)
 *   id                {string}   ID del elemento raíz generado (default: 'ubits-fu-{containerId}')
 *   title             {string}   Texto del encabezado (default: 'Importar archivo')
 *   accept            {string}   Atributo accept del <input type="file"> (p. ej. '.csv,text/csv')
 *   maxSizeMb         {number}   Tamaño máximo en MB (default: 5)
 *   maxLabel          {string}   Texto para mostrar el límite (default: '{maxSizeMb} MB')
 *   formats           {string}   Texto libre de formatos (default: derivado de accept + maxLabel)
 *   downloadButtons   {Array}    Hasta 3 objetos { label, icon?, onClick }; icon = clase FA sin 'fa-'
 *   hideHeader        {boolean}  true = oculta la fila .ubits-file-upload__header (título + acciones)
 *   onChange          {Function} Callback (file | null) al seleccionar o quitar el archivo
 *   onError           {Function} Callback ({ type: 'type'|'size', message }) al fallar validación
 *
 * Eventos custom (bubbles: true):
 *   'ubits-file-upload-change'  — detail: { file: File | null }
 *   'ubits-file-upload-error'   — detail: { type: 'type'|'size', message: string }
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

    function formatSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
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
        }).join(', ');
    }

    /* ─── construcción del HTML ──────────────────────── */

    function buildHtml(opts, id) {
        var title   = opts.title || 'Importar archivo';
        var accept  = opts.accept || '';
        var maxMb   = opts.maxSizeMb || 5;
        var maxLbl  = opts.maxLabel  || (maxMb + ' MB');
        var formats = opts.formats   || (acceptLabel(accept) + ' \u2022 Hasta ' + maxLbl);
        var btns    = (opts.downloadButtons || []).slice(0, 3);
        var hideHeader = opts.hideHeader === true;
        var rootExtraClass = hideHeader ? ' ubits-file-upload--hide-header' : '';

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
            '<div class="ubits-file-upload' + rootExtraClass + '" id="' + id + '" data-file-upload>' +
              '<div class="ubits-file-upload__header">' +
                '<h2 class="ubits-body-md-bold ubits-file-upload__title">' + title + '</h2>' +
                '<div class="ubits-file-upload__actions">' + actionBtnsHtml + '</div>' +
              '</div>' +
              '<div class="ubits-file-upload__dropzone" data-file-upload-dropzone>' +
                '<div class="ubits-file-upload__empty" data-file-upload-empty>' +
                  '<div class="ubits-file-upload__dropzone-inner">' +
                    '<div class="ubits-file-upload__icon-wrap"><i class="far fa-file-arrow-up"></i></div>' +
                    '<p class="ubits-body-md-semibold ubits-file-upload__dropzone-title">Subir archivo</p>' +
                    '<p class="ubits-body-sm-regular ubits-file-upload__dropzone-formats">' + formats + '</p>' +
                    '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm ubits-file-upload__select-btn" data-file-upload-select>' +
                      '<i class="far fa-arrow-up-from-bracket"></i><span>Seleccionar archivo</span>' +
                    '</button>' +
                  '</div>' +
                '</div>' +
                '<div class="ubits-file-upload__file-card" data-file-upload-card style="display:none" aria-live="polite">' +
                  '<div class="ubits-file-upload__file-icon-wrap" aria-hidden="true"><i class="far fa-file-lines"></i></div>' +
                  '<div class="ubits-file-upload__file-meta">' +
                    '<span class="ubits-body-sm-semibold ubits-file-upload__file-name" data-file-upload-name></span>' +
                    '<span class="ubits-body-sm-regular ubits-file-upload__file-size" data-file-upload-size></span>' +
                    '<div class="ubits-file-upload__progress-wrap">' +
                      '<div class="ubits-file-upload__progress-bar" data-file-upload-progress-bar>' +
                        '<div class="ubits-file-upload__progress-fill" data-file-upload-progress-fill></div>' +
                      '</div>' +
                      '<span class="ubits-body-sm-regular ubits-file-upload__progress-pct" data-file-upload-progress-pct>0%</span>' +
                    '</div>' +
                  '</div>' +
                  '<button type="button" class="ubits-button ubits-button--error-tertiary ubits-button--sm ubits-button--icon-only ubits-file-upload__remove-btn" data-file-upload-remove aria-label="Quitar archivo">' +
                    '<i class="far fa-trash-alt"></i>' +
                  '</button>' +
                '</div>' +
                '<div class="ubits-file-upload__processing" data-file-upload-processing style="display:none" aria-live="polite">' +
                  '<span class="ubits-body-sm-regular ubits-file-upload__processing-label">Procesando</span>' +
                  '<div class="ubits-file-upload__processing-bar">' +
                    '<div class="ubits-file-upload__processing-fill" data-file-upload-processing-fill></div>' +
                  '</div>' +
                  '<span class="ubits-body-sm-regular ubits-file-upload__processing-pct" data-file-upload-processing-pct>0%</span>' +
                '</div>' +
                '<input type="file" class="ubits-file-upload__input" data-file-upload-input' +
                  (accept ? ' accept="' + accept + '"' : '') + ' style="display:none">' +
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

        var accept   = (el.querySelector('[data-file-upload-input]') || {}).getAttribute ? el.querySelector('[data-file-upload-input]').getAttribute('accept') || '' : '';
        var maxMb    = opts.maxSizeMb || 5;
        var onChange = opts.onChange  || null;
        var onError  = opts.onError   || null;
        var successMessage = (Object.prototype.hasOwnProperty.call(opts, 'successMessage') ? opts.successMessage : 'Archivo validado. Puedes continuar.');

        var dropzone  = el.querySelector('[data-file-upload-dropzone]');
        var emptyEl   = el.querySelector('[data-file-upload-empty]');
        var cardEl    = el.querySelector('[data-file-upload-card]');
        var nameEl    = el.querySelector('[data-file-upload-name]');
        var sizeEl    = el.querySelector('[data-file-upload-size]');
        var helperEl  = el.querySelector('[data-file-upload-helper]');
        var inputEl   = el.querySelector('[data-file-upload-input]');
        var selectBtn = el.querySelector('[data-file-upload-select]');
        var removeBtn = el.querySelector('[data-file-upload-remove]');

        /* ── helpers de estado ── */

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

        function showFile(file) {
            clearError();
            if (nameEl) nameEl.textContent = file.name;
            if (sizeEl) sizeEl.textContent = formatSize(file.size);
            if (emptyEl) emptyEl.style.display = 'none';
            if (cardEl)  cardEl.style.display  = '';
            if (dropzone) {
                dropzone.classList.add('ubits-file-upload__dropzone--has-file');
                dropzone.classList.remove('ubits-file-upload__dropzone--dragover');
            }
        }

        function clearFile() {
            if (emptyEl) emptyEl.style.display = '';
            if (cardEl)  cardEl.style.display  = 'none';
            el.classList.remove('ubits-file-upload--processing');
            if (dropzone) dropzone.classList.remove('ubits-file-upload__dropzone--has-file', 'ubits-file-upload__dropzone--invalid');
            if (inputEl)  inputEl.value = '';
            clearError();
            fileUploadShowErrorReport(el, false, { placement: 'header' });
            fileUploadShowErrorReport(el, false, { placement: 'inline' });
            fileUploadClearProgress(el);
            fileUploadClearProcessing(el);
            if (onChange) onChange(null);
            el.dispatchEvent(new CustomEvent('ubits-file-upload-change', { bubbles: true, detail: { file: null } }));
        }

        function handleFile(file) {
            if (!file) return;
            /* validar tipo */
            if (accept && !fileMatchesAccept(file, accept)) {
                var extList = accept.split(',').map(function (s) { return s.trim(); }).join(', ');
                var msg = 'El archivo no es compatible. Solo se aceptan: ' + extList + '.';
                showError(msg);
                if (onError) onError({ type: 'type', message: msg });
                el.dispatchEvent(new CustomEvent('ubits-file-upload-error', { bubbles: true, detail: { type: 'type', message: msg } }));
                return;
            }
            /* validar peso */
            var maxBytes = maxMb * 1048576;
            if (file.size > maxBytes) {
                var msg = 'El archivo es demasiado grande. El límite es ' + maxMb + ' MB.';
                showError(msg);
                if (onError) onError({ type: 'size', message: msg });
                el.dispatchEvent(new CustomEvent('ubits-file-upload-error', { bubbles: true, detail: { type: 'size', message: msg } }));
                return;
            }
            showFile(file);
            if (successMessage !== false) showSuccess(successMessage);
            if (onChange) onChange(file);
            el.dispatchEvent(new CustomEvent('ubits-file-upload-change', { bubbles: true, detail: { file: file } }));
        }

        /* ── eventos ── */

        if (selectBtn && inputEl) {
            selectBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                inputEl.click();
            });
        }

        if (dropzone) {
            dropzone.addEventListener('click', function (e) {
                if (dropzone.classList.contains('ubits-file-upload__dropzone--has-file')) return;
                if (e.target.closest('[data-file-upload-select]')) return;
                if (inputEl) inputEl.click();
            });

            dropzone.addEventListener('dragover', function (e) {
                e.preventDefault();
                if (!dropzone.classList.contains('ubits-file-upload__dropzone--has-file')) {
                    dropzone.classList.add('ubits-file-upload__dropzone--dragover');
                }
            });

            dropzone.addEventListener('dragleave', function (e) {
                /* Solo colapsar si el cursor sale del dropzone de verdad */
                if (!dropzone.contains(e.relatedTarget)) {
                    dropzone.classList.remove('ubits-file-upload__dropzone--dragover');
                }
            });

            dropzone.addEventListener('drop', function (e) {
                e.preventDefault();
                dropzone.classList.remove('ubits-file-upload__dropzone--dragover');
                if (dropzone.classList.contains('ubits-file-upload__dropzone--has-file')) return;
                var file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
                if (file) handleFile(file);
            });
        }

        if (inputEl) {
            inputEl.addEventListener('change', function () {
                if (this.files && this.files[0]) handleFile(this.files[0]);
                /* Limpiar el value para que el mismo archivo se pueda volver a seleccionar */
                this.value = '';
            });
        }

        if (removeBtn) {
            removeBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                clearFile();
            });
        }
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
        var fill     = el.querySelector('[data-file-upload-progress-fill]');
        var pctEl    = el.querySelector('[data-file-upload-progress-pct]');

        if (card) card.classList.add('ubits-file-upload__file-card--uploading');
        if (dropzone) dropzone.classList.add('ubits-file-upload__dropzone--uploading');
        if (fill) {
            fill.style.width = pct + '%';
            if (pct >= 100) {
                fill.classList.add('ubits-file-upload__progress-fill--complete');
            } else {
                fill.classList.remove('ubits-file-upload__progress-fill--complete');
            }
        }
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
        var fill     = el.querySelector('[data-file-upload-progress-fill]');
        var pctEl    = el.querySelector('[data-file-upload-progress-pct]');

        if (card) card.classList.remove('ubits-file-upload__file-card--uploading');
        if (dropzone) dropzone.classList.remove('ubits-file-upload__dropzone--uploading');
        if (fill) {
            fill.style.width = '0%';
            fill.classList.remove('ubits-file-upload__progress-fill--complete');
        }
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
        var fill = el.querySelector('[data-file-upload-processing-fill]');
        var pctEl = el.querySelector('[data-file-upload-processing-pct]');
        el.classList.add('ubits-file-upload--processing');
        if (dropzone) dropzone.classList.add('ubits-file-upload__dropzone--processing');
        if (fill) {
            fill.style.width = pct + '%';
            if (pct >= 100) {
                fill.classList.add('ubits-file-upload__processing-fill--complete');
            } else {
                fill.classList.remove('ubits-file-upload__processing-fill--complete');
            }
        }
        if (pctEl) pctEl.textContent = pct + '%';
    }

    function fileUploadClearProcessing(idOrEl) {
        var el = typeof idOrEl === 'string' ? document.getElementById(idOrEl) : idOrEl;
        if (!el) return;
        var dropzone = el.querySelector('[data-file-upload-dropzone]');
        var fill = el.querySelector('[data-file-upload-processing-fill]');
        var pctEl = el.querySelector('[data-file-upload-processing-pct]');
        el.classList.remove('ubits-file-upload--processing');
        if (dropzone) dropzone.classList.remove('ubits-file-upload__dropzone--processing');
        if (fill) {
            fill.style.width = '0%';
            fill.classList.remove('ubits-file-upload__processing-fill--complete');
        }
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

    /* Auto-init sobre HTML estático */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { initFileUpload(); });
    } else {
        initFileUpload();
    }
}());
