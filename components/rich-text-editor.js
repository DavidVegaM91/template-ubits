/**
 * UBITS Rich text editor — contenteditable + barra de formato (document.execCommand).
 * Inicializar tras insertar el HTML: initRichTextEditor('#id') o initAllRichTextEditors().
 *
 * Nota: execCommand está obsoleto en el estándar pero sigue siendo la vía práctica
 * en HTML/JS puro sin dependencias; en producción se puede sustituir por una capa
 * basada en Selection/Range o un editor ligero.
 */
(function (global) {
    'use strict';

    function getEditor(root) {
        return root.querySelector('.ubits-rich-text-editor__field');
    }

    function syncEmptyState(editor) {
        if (!editor) return;
        var text = (editor.innerText || '').replace(/\u00a0/g, ' ').trim();
        var html = (editor.innerHTML || '').replace(/<br\s*\/?>/gi, '').trim();
        var empty = text.length === 0 && (html === '' || html === '<br>');
        editor.classList.toggle('is-empty', empty);
    }

    function syncToolbarStates(root, editor) {
        if (!editor) return;
        var map = {
            bold: 'bold',
            italic: 'italic',
            underline: 'underline'
        };
        root.querySelectorAll('[data-rich-cmd]').forEach(function (btn) {
            var cmd = btn.getAttribute('data-rich-cmd');
            if (map[cmd]) {
                try {
                    var on = document.queryCommandState(map[cmd]);
                    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
                } catch (e) {
                    btn.setAttribute('aria-pressed', 'false');
                }
            }
        });
    }

    function exec(editor, command, value) {
        editor.focus();
        try {
            document.execCommand(command, false, value);
        } catch (err) {
            /* noop */
        }
        syncEmptyState(editor);
        syncToolbarStates(editor.closest('[data-rich-text-editor]'), editor);
    }

    function bindToolbar(root, editor) {
        var fileInput = root.querySelector('.ubits-rich-text-editor__file');

        root.querySelectorAll('[data-rich-cmd]').forEach(function (btn) {
            btn.addEventListener('mousedown', function (e) {
                e.preventDefault();
            });
            btn.addEventListener('click', function () {
                var cmd = btn.getAttribute('data-rich-cmd');
                if (!cmd) return;

                if (cmd === 'createLink') {
                    var url = window.prompt('URL del enlace (https://…)', 'https://');
                    if (url) exec(editor, 'createLink', url);
                    return;
                }
                if (cmd === 'insertImage') {
                    if (fileInput) fileInput.click();
                    return;
                }
                if (cmd === 'insertVideo') {
                    var vurl = window.prompt('URL del video (YouTube, Vimeo o archivo .mp4)', 'https://');
                    if (!vurl) return;
                    editor.focus();
                    var embed =
                        '<p class="ubits-body-md-regular"><a href="' +
                        vurl.replace(/"/g, '&quot;') +
                        '" target="_blank" rel="noopener noreferrer">Ver video</a></p>';
                    try {
                        document.execCommand('insertHTML', false, embed);
                    } catch (e2) {
                        /* noop */
                    }
                    syncEmptyState(editor);
                    return;
                }
                if (cmd === 'formatCode') {
                    editor.focus();
                    try {
                        document.execCommand('formatBlock', false, 'pre');
                    } catch (e3) {
                        try {
                            document.execCommand('insertHTML', false, '<code></code>');
                        } catch (e4) {
                            /* noop */
                        }
                    }
                    syncEmptyState(editor);
                    return;
                }

                exec(editor, cmd, null);
            });
        });

        if (fileInput) {
            fileInput.addEventListener('change', function () {
                var file = fileInput.files && fileInput.files[0];
                if (!file || file.type.indexOf('image/') !== 0) {
                    fileInput.value = '';
                    return;
                }
                var reader = new FileReader();
                reader.onload = function () {
                    var dataUrl = reader.result;
                    exec(editor, 'insertImage', dataUrl);
                    fileInput.value = '';
                };
                reader.onerror = function () {
                    fileInput.value = '';
                };
                reader.readAsDataURL(file);
            });
        }

        editor.addEventListener('input', function () {
            syncEmptyState(editor);
        });
        editor.addEventListener('keyup', function () {
            syncToolbarStates(root, editor);
        });
        editor.addEventListener('mouseup', function () {
            syncToolbarStates(root, editor);
        });
        document.addEventListener('selectionchange', function () {
            if (!document.activeElement || document.activeElement !== editor) return;
            syncToolbarStates(root, editor);
        });
    }

    /**
     * @param {string|HTMLElement} rootSelector - Contenedor [data-rich-text-editor]
     */
    function initRichTextEditor(rootSelector) {
        var root =
            typeof rootSelector === 'string'
                ? document.querySelector(rootSelector)
                : rootSelector;
        if (!root || !root.getAttribute || root.getAttribute('data-rich-text-initialized') === 'true') {
            return;
        }
        var editor = getEditor(root);
        if (!editor) return;

        root.setAttribute('data-rich-text-initialized', 'true');
        syncEmptyState(editor);
        bindToolbar(root, editor);
        syncToolbarStates(root, editor);
    }

    function initAllRichTextEditors() {
        document.querySelectorAll('[data-rich-text-editor]').forEach(function (root) {
            if (root.getAttribute('data-rich-text-initialized') !== 'true') {
                initRichTextEditor(root);
            }
        });
    }

    /**
     * HTML interno del editor (para guardar en backend).
     * @param {string|HTMLElement} rootSelector
     * @returns {string}
     */
    function getRichTextHtml(rootSelector) {
        var root =
            typeof rootSelector === 'string'
                ? document.querySelector(rootSelector)
                : rootSelector;
        var editor = root ? getEditor(root) : null;
        return editor ? editor.innerHTML : '';
    }

    /**
     * @param {string|HTMLElement} rootSelector
     * @param {string} html
     */
    function setRichTextHtml(rootSelector, html) {
        var root =
            typeof rootSelector === 'string'
                ? document.querySelector(rootSelector)
                : rootSelector;
        var editor = root ? getEditor(root) : null;
        if (!editor) return;
        editor.innerHTML = html || '';
        syncEmptyState(editor);
    }

    global.initRichTextEditor = initRichTextEditor;
    global.initAllRichTextEditors = initAllRichTextEditors;
    global.getRichTextHtml = getRichTextHtml;
    global.setRichTextHtml = setRichTextHtml;
})(typeof window !== 'undefined' ? window : this);
