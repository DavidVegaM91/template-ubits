/**
 * UBITS IA Input — createUbitsIAInput()
 * Paridad con Ubits-React/components/ui/IAInput (panel + chat).
 *
 * Requiere: ia-input.css, button.css, ia-button.css, chip.css, tooltip.js (opcional)
 */
(function (global) {
    'use strict';

    var IA_INPUT_SEQ = 0;
    var DEFAULT_ATTACH_ACCEPT =
        'image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.ppt,.pptx';

    function esc(str) {
        return String(str == null ? '' : str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function formatCounterNumber(value) {
        return Number(value).toLocaleString('en-US');
    }

    function countPromptWords(text) {
        var t = String(text || '').trim();
        if (!t) return 0;
        return t.split(/\s+/).filter(Boolean).length;
    }

    function trimPromptToMaxWords(text, maxWords) {
        var parts = String(text || '').trim().split(/\s+/).filter(Boolean);
        if (parts.length <= maxWords) return String(text || '');
        return parts.slice(0, maxWords).join(' ');
    }

    function getCounterCurrent(value, unit) {
        return unit === 'palabras' ? countPromptWords(value) : String(value || '').length;
    }

    function nextId(prefix) {
        IA_INPUT_SEQ += 1;
        return (prefix || 'ubits-ia-input') + '-' + IA_INPUT_SEQ;
    }

    /**
     * @param {object} options
     * @returns {object} API del input montado
     */
    function createUbitsIAInput(options) {
        options = options || {};
        var variant = options.variant === 'chat' ? 'chat' : 'panel';
        var textareaId = options.id || nextId('ubits-ia-input-ta');
        var boxId = options.inputBoxId || nextId('ubits-ia-input-box');
        var fileInputId = nextId('ubits-ia-input-files');
        var autosizeMaxPx =
            options.autosizeMaxPx != null
                ? options.autosizeMaxPx
                : variant === 'chat'
                  ? 120
                  : 360;
        var rows = options.rows != null ? options.rows : variant === 'chat' ? 1 : 2;
        var action = options.action || { type: 'none' };
        if (!action.type) action = { type: 'none' };
        var counter = options.counter === false ? false : options.counter || false;
        var contextErrorMessage =
            options.contextErrorMessage != null
                ? options.contextErrorMessage
                : 'Mensaje de error';
        var wrapInInputArea = options.wrapInInputArea !== false;

        var state = {
            value: options.value != null ? String(options.value) : '',
            hasContextError: !!options.hasContextError,
            disabled: !!options.disabled,
            pendingImages: Array.isArray(options.pendingImages)
                ? options.pendingImages.slice()
                : [],
            pendingFiles: Array.isArray(options.pendingFiles)
                ? options.pendingFiles.slice()
                : [],
            actionDisabled: action.disabled === true,
            isGenerating: !!action.isGenerating,
        };

        var root = document.createElement('div');
        root.className = [
            'ubits-ia-input',
            variant === 'chat' ? 'ubits-ia-input--chat' : 'ubits-ia-input--panel',
            options.className || '',
        ]
            .filter(Boolean)
            .join(' ');

        var fileInput = null;
        if (options.attach && !options.onAttachClick) {
            fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.id = fileInputId;
            fileInput.className = 'ubits-ia-input__file-input';
            fileInput.accept = options.attachAccept || DEFAULT_ATTACH_ACCEPT;
            fileInput.multiple = true;
            fileInput.hidden = true;
        }

        var pendingImagesEl = document.createElement('div');
        pendingImagesEl.className = 'ubits-ia-input__pending-images';

        var pendingFilesEl = document.createElement('div');
        pendingFilesEl.className = 'ubits-ia-input__pending-files';

        var textarea = document.createElement('textarea');
        textarea.id = textareaId;
        textarea.className = 'ubits-ia-input__textarea ubits-body-md-regular';
        textarea.placeholder = options.placeholder || '';
        textarea.rows = rows;
        textarea.value = state.value;
        textarea.disabled = state.disabled;
        if (options.ariaLabel) textarea.setAttribute('aria-label', options.ariaLabel);
        else if (options.placeholder) textarea.setAttribute('aria-label', options.placeholder);
        if (counter && counter.unit === 'caracteres') {
            textarea.maxLength = counter.max;
        }

        var actionsEl = document.createElement('div');
        actionsEl.className =
            variant === 'chat' ? 'ubits-ia-input__chat-actions' : 'ubits-ia-input__actions';

        var attachBtn = null;
        if (options.attach) {
            attachBtn = document.createElement('button');
            attachBtn.type = 'button';
            attachBtn.className =
                'ubits-button ubits-button--secondary ubits-button--sm ubits-button--icon-only ubits-ia-input__attach';
            attachBtn.setAttribute(
                'aria-label',
                options.attachAriaLabel || 'Adjuntar'
            );
            attachBtn.setAttribute(
                'data-tooltip',
                options.attachTooltip || options.attachAriaLabel || 'Adjuntar'
            );
            attachBtn.innerHTML = '<i class="far fa-plus" aria-hidden="true"></i>';
        }

        var spacer = document.createElement('div');
        spacer.className =
            variant === 'chat' ? 'ubits-ia-input__chat-spacer' : 'ubits-ia-input__spacer';
        spacer.setAttribute('aria-hidden', 'true');

        var actionSlot = document.createElement('div');
        actionSlot.className = 'ubits-ia-input__action-slot';

        var footerEl = document.createElement('div');
        footerEl.className = ['ubits-ia-input__footer', options.counterClassName || '']
            .filter(Boolean)
            .join(' ');

        var slotEl = null;
        if (options.slotElement) {
            slotEl = options.slotElement;
        } else if (options.slotHTML) {
            slotEl = document.createElement('div');
            slotEl.className = 'ubits-ia-input__slot';
            slotEl.innerHTML = options.slotHTML;
        }

        var boxEl = document.createElement('div');
        boxEl.id = boxId;
        boxEl.className = [
            variant === 'chat' ? 'ubits-ia-input__chat-container' : 'ubits-ia-input__box',
            options.inputBoxClassName || '',
        ]
            .filter(Boolean)
            .join(' ');

        if (variant === 'chat') {
            boxEl.appendChild(pendingImagesEl);
            boxEl.appendChild(pendingFilesEl);
            var chatWrapper = document.createElement('div');
            chatWrapper.className = 'ubits-ia-input__chat-wrapper';
            chatWrapper.appendChild(textarea);
            boxEl.appendChild(chatWrapper);
            if (options.attach || action.type !== 'none') {
                if (attachBtn) actionsEl.appendChild(attachBtn);
                actionsEl.appendChild(spacer);
                actionsEl.appendChild(actionSlot);
                boxEl.appendChild(actionsEl);
            }
        } else {
            boxEl.appendChild(pendingImagesEl);
            boxEl.appendChild(pendingFilesEl);
            boxEl.appendChild(textarea);
            if (options.attach || action.type !== 'none') {
                if (attachBtn) actionsEl.appendChild(attachBtn);
                actionsEl.appendChild(spacer);
                actionsEl.appendChild(actionSlot);
                boxEl.appendChild(actionsEl);
            }
        }

        var panelInner = document.createElement('div');
        panelInner.className = 'ubits-ia-input__panel';
        if (fileInput) panelInner.appendChild(fileInput);
        panelInner.appendChild(boxEl);
        panelInner.appendChild(footerEl);

        var inputArea = document.createElement('div');
        inputArea.className = [
            'ubits-ia-input__input-area',
            options.inputAreaClassName || '',
        ]
            .filter(Boolean)
            .join(' ');
        inputArea.appendChild(panelInner);
        if (slotEl) inputArea.appendChild(slotEl);

        if (wrapInInputArea) root.appendChild(inputArea);
        else {
            if (fileInput) root.appendChild(fileInput);
            root.appendChild(boxEl);
            root.appendChild(footerEl);
            if (slotEl) root.appendChild(slotEl);
        }

        function autosize() {
            textarea.style.height = 'auto';
            var sh = textarea.scrollHeight;
            var next = Math.min(sh, autosizeMaxPx);
            var minH = variant === 'chat' ? 24 : 40;
            textarea.style.height = Math.max(minH, next) + 'px';
            textarea.style.overflowY = sh > autosizeMaxPx ? 'auto' : 'hidden';
        }

        function renderActionButton() {
            actionSlot.innerHTML = '';
            if (action.type === 'none') return;

            if (action.type === 'send') {
                var sendLabel = action.ariaLabel || 'Enviar';
                var sendBtn = document.createElement('button');
                sendBtn.type = 'button';
                sendBtn.className =
                    'ubits-ia-button ubits-ia-button--primary ubits-ia-button--sm ubits-ia-button--icon-only--sm ubits-ia-input__send';
                sendBtn.setAttribute('aria-label', sendLabel);
                sendBtn.setAttribute('data-tooltip', sendLabel);
                sendBtn.innerHTML = '<i class="far fa-arrow-right" aria-hidden="true"></i>';
                if (state.actionDisabled || state.disabled) {
                    sendBtn.disabled = true;
                    sendBtn.setAttribute('aria-disabled', 'true');
                }
                sendBtn.addEventListener('click', function (e) {
                    e.preventDefault();
                    if (state.actionDisabled || state.disabled) return;
                    if (typeof action.onClick === 'function') action.onClick();
                });
                actionSlot.appendChild(sendBtn);
                return;
            }

            if (action.type === 'ia') {
                var iaBtn = document.createElement('button');
                iaBtn.type = 'button';
                iaBtn.className =
                    'ubits-ia-button ubits-ia-button--' +
                    (action.variant === 'secondary' ? 'secondary' : 'primary') +
                    ' ubits-ia-button--sm' +
                    (action.tokenCost != null ? ' ubits-ia-button--with-token-cost' : '');
                if (state.actionDisabled || state.disabled) {
                    iaBtn.disabled = true;
                    iaBtn.setAttribute('aria-disabled', 'true');
                }
                var labelSpan = document.createElement('span');
                labelSpan.className = 'ubits-ia-input__action-label';
                labelSpan.textContent = action.label || 'Generar';
                iaBtn.appendChild(labelSpan);
                if (
                    action.tokenCost != null &&
                    typeof global.getIaButtonTokenCostSuffix === 'function'
                ) {
                    iaBtn.insertAdjacentHTML(
                        'beforeend',
                        global.getIaButtonTokenCostSuffix(action.tokenCost)
                    );
                }
                iaBtn.addEventListener('click', function (e) {
                    e.preventDefault();
                    if (state.actionDisabled || state.disabled || state.isGenerating) return;
                    if (typeof action.onClick === 'function') action.onClick();
                });
                actionSlot.appendChild(iaBtn);
                if (typeof global.initIaButtonSparkles === 'function') {
                    global.initIaButtonSparkles(iaBtn);
                }
                if (state.isGenerating && typeof global.setIaButtonGenerating === 'function') {
                    global.setIaButtonGenerating(iaBtn, true, {
                        label: action.generatingLabel || 'Generando',
                    });
                }
            }
        }

        function renderPendingImages() {
            if (options.filesOnly) {
                pendingImagesEl.innerHTML = '';
                return;
            }
            pendingImagesEl.innerHTML = state.pendingImages
                .map(function (img, idx) {
                    return (
                        '<div class="ubits-ia-input__pending-img-wrap">' +
                        '<img class="ubits-ia-input__pending-img" src="' +
                        esc(img.src) +
                        '" alt="' +
                        esc(img.alt || 'Imagen adjunta') +
                        '">' +
                        '<button type="button" class="ubits-ia-input__pending-img-remove" data-ia-input-rm-img="' +
                        idx +
                        '" aria-label="Eliminar imagen"><i class="far fa-times" aria-hidden="true"></i></button>' +
                        '</div>'
                    );
                })
                .join('');
            pendingImagesEl.querySelectorAll('[data-ia-input-rm-img]').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    var i = parseInt(btn.getAttribute('data-ia-input-rm-img'), 10);
                    if (Number.isNaN(i)) return;
                    state.pendingImages.splice(i, 1);
                    renderPendingImages();
                    if (typeof options.onRemovePendingImage === 'function') {
                        options.onRemovePendingImage(i);
                    }
                });
            });
        }

        function renderPendingFiles() {
            pendingFilesEl.innerHTML = state.pendingFiles
                .map(function (file, idx) {
                    return (
                        '<span class="ubits-chip ubits-chip--sm ubits-chip--icon-left ubits-chip--close ubits-ia-input__pending-file-chip">' +
                        '<i class="far fa-file-lines" aria-hidden="true"></i>' +
                        '<span class="ubits-chip__text">' +
                        esc(file.name || 'Archivo') +
                        '</span>' +
                        '<button type="button" class="ubits-chip__close" data-ia-input-rm-file="' +
                        idx +
                        '" aria-label="Quitar archivo"><i class="far fa-times" aria-hidden="true"></i></button>' +
                        '</span>'
                    );
                })
                .join('');
            pendingFilesEl.querySelectorAll('[data-ia-input-rm-file]').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    var i = parseInt(btn.getAttribute('data-ia-input-rm-file'), 10);
                    if (Number.isNaN(i)) return;
                    state.pendingFiles.splice(i, 1);
                    renderPendingFiles();
                    if (typeof options.onRemovePendingFile === 'function') {
                        options.onRemovePendingFile(i);
                    }
                });
            });
        }

        function renderFooter() {
            var parts = [];
            var current =
                counter !== false
                    ? getCounterCurrent(textarea.value, counter.unit)
                    : 0;

            if (counter !== false) {
                parts.push(
                    '<div class="ubits-ia-input__counter-row">' +
                        '<span class="ubits-ia-input__counter-text ubits-body-sm-regular">Mínimo ' +
                        formatCounterNumber(counter.min) +
                        ' · Máximo ' +
                        formatCounterNumber(counter.max) +
                        ' ' +
                        esc(counter.unit) +
                        '</span>' +
                        '<span class="ubits-ia-input__counter-value ubits-body-sm-regular">' +
                        formatCounterNumber(current) +
                        '/' +
                        formatCounterNumber(counter.max) +
                        '</span>' +
                        '</div>'
                );
            }

            if (state.hasContextError && contextErrorMessage) {
                parts.push(
                    '<span class="ubits-ia-input__error-text ubits-body-sm-regular">' +
                        esc(contextErrorMessage) +
                        '</span>'
                );
            }

            if (options.disclaimer) {
                parts.push(
                    '<span class="ubits-ia-input__disclaimer ubits-body-xs-regular">' +
                        esc(options.disclaimer) +
                        '</span>'
                );
            }

            footerEl.innerHTML = parts.join('');
            footerEl.style.display = parts.length ? '' : 'none';
        }

        function syncContextErrorClass() {
            var errClass =
                variant === 'chat'
                    ? 'ubits-ia-input__chat-container--context-error'
                    : 'ubits-ia-input__box--context-error';
            if (state.hasContextError) boxEl.classList.add(errClass);
            else boxEl.classList.remove(errClass);
            textarea.setAttribute('aria-invalid', state.hasContextError ? 'true' : 'false');
        }

        function applyValue(next, silent) {
            var v = String(next == null ? '' : next);
            if (counter && counter.unit === 'palabras') {
                v = trimPromptToMaxWords(v, counter.max);
            } else if (counter && counter.unit === 'caracteres') {
                v = v.slice(0, counter.max);
            }
            state.value = v;
            textarea.value = v;
            autosize();
            renderFooter();
            if (!silent && typeof options.onChange === 'function') {
                options.onChange(v);
            }
        }

        textarea.addEventListener('input', function () {
            applyValue(textarea.value);
            if (state.hasContextError) {
                state.hasContextError = false;
                syncContextErrorClass();
                renderFooter();
            }
        });

        textarea.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && !e.shiftKey && options.onEnterSubmit) {
                e.preventDefault();
                options.onEnterSubmit();
            }
        });

        if (attachBtn) {
            attachBtn.addEventListener('click', function (e) {
                e.preventDefault();
                if (state.disabled) return;
                if (typeof options.onAttachClick === 'function') {
                    options.onAttachClick();
                    return;
                }
                if (fileInput) fileInput.click();
            });
        }

        if (fileInput) {
            fileInput.addEventListener('change', function () {
                if (!fileInput.files || !fileInput.files.length) return;
                var files = Array.prototype.slice.call(fileInput.files);
                if (typeof options.onAttachFiles === 'function') {
                    options.onAttachFiles(files);
                }
                fileInput.value = '';
            });
        }

        renderActionButton();
        renderPendingImages();
        renderPendingFiles();
        renderFooter();
        syncContextErrorClass();
        requestAnimationFrame(autosize);

        function focusTextarea() {
            if (!textarea || textarea.disabled) return;
            try {
                textarea.focus({ preventScroll: true });
            } catch (e) {
                textarea.focus();
            }
        }

        function scheduleAutoFocus() {
            if (!options.autoFocus) return;
            var delay =
                options.autoFocusDelay != null ? options.autoFocusDelay : 0;
            setTimeout(focusTextarea, delay);
        }

        var api = {
            element: root,
            getTextarea: function () {
                return textarea;
            },
            getBox: function () {
                return boxEl;
            },
            getFooter: function () {
                return footerEl;
            },
            getValue: function () {
                return state.value;
            },
            setValue: function (v, silent) {
                applyValue(v, silent);
            },
            setContextError: function (on, message) {
                state.hasContextError = !!on;
                if (message != null) contextErrorMessage = message;
                syncContextErrorClass();
                renderFooter();
            },
            setDisabled: function (on) {
                state.disabled = !!on;
                textarea.disabled = state.disabled;
                renderActionButton();
            },
            setActionDisabled: function (on) {
                state.actionDisabled = !!on;
                renderActionButton();
            },
            setGenerating: function (on, generatingLabel) {
                state.isGenerating = !!on;
                var iaBtn = actionSlot.querySelector('.ubits-ia-button');
                if (iaBtn && typeof global.setIaButtonGenerating === 'function') {
                    global.setIaButtonGenerating(iaBtn, state.isGenerating, {
                        label: generatingLabel || action.generatingLabel || 'Generando',
                    });
                }
            },
            setPendingImages: function (images) {
                state.pendingImages = Array.isArray(images) ? images.slice() : [];
                renderPendingImages();
            },
            setPendingFiles: function (files) {
                state.pendingFiles = Array.isArray(files) ? files.slice() : [];
                renderPendingFiles();
            },
            getPendingImages: function () {
                return state.pendingImages.slice();
            },
            getPendingFiles: function () {
                return state.pendingFiles.slice();
            },
            updateCounter: function () {
                renderFooter();
            },
            focus: focusTextarea,
            mount: function (parent) {
                if (!parent) return api;
                if (typeof parent === 'string') {
                    parent = document.getElementById(parent);
                }
                if (parent) {
                    parent.appendChild(root);
                    scheduleAutoFocus();
                }
                return api;
            },
            destroy: function () {
                if (root.parentNode) root.parentNode.removeChild(root);
            },
        };

        return api;
    }

    global.createUbitsIAInput = createUbitsIAInput;
    global.formatCounterNumber = formatCounterNumber;
    global.countPromptWords = countPromptWords;
    global.trimPromptToMaxWords = trimPromptToMaxWords;
})(typeof window !== 'undefined' ? window : this);
