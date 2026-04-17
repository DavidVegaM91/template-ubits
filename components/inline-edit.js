/* ========================================
   UBITS — Inline Edit
   Auto-resize para textarea.ubits-inline-edit.

   API pública:
     initInlineEdit(root?)
       Inicializa el auto-resize en todos los textarea.ubits-inline-edit
       dentro de `root` (HTMLElement o Document). Si se omite, usa document.
       Llamar tras renderizar HTML dinámico que contenga inline-edits.

     autoResizeInlineEdit(el)
       Ajusta la altura de un textarea individual al contenido actual.
       Útil si se cambia el valor por JS (input.value = '...').

   USO:
     // Al montar componente con inline-edits:
     initInlineEdit(miContenedor);

     // Al cambiar valor por código:
     input.value = 'Nuevo título';
     autoResizeInlineEdit(input);

   NOTA: inputs (no textarea) no necesitan auto-resize; el JS no hace
   nada con ellos, solo con los textarea.
   ======================================== */

(function () {
    'use strict';

    /**
     * Ajusta la altura de un textarea al contenido.
     * @param {HTMLTextAreaElement} el
     */
    function autoResizeInlineEdit(el) {
        if (!el || el.tagName !== 'TEXTAREA') return;
        el.style.height = 'auto';
        el.style.height = el.scrollHeight + 'px';
    }

    /**
     * Inicializa el auto-resize en todos los textarea.ubits-inline-edit
     * dentro de `root`.
     * @param {HTMLElement|Document} [root]
     */
    function initInlineEdit(root) {
        var container = root || document;
        var fields = container.querySelectorAll('textarea.ubits-inline-edit');
        fields.forEach(function (el) {
            // Evitar doble binding si ya está inicializado
            if (el.dataset.inlineEditInit) return;
            el.dataset.inlineEditInit = '1';

            el.addEventListener('input', function () {
                autoResizeInlineEdit(el);
            });

            // Resize inicial (el textarea puede tener valor pre-cargado)
            autoResizeInlineEdit(el);
        });
    }

    /* ── Exponer API global ── */
    window.initInlineEdit = initInlineEdit;
    window.autoResizeInlineEdit = autoResizeInlineEdit;

    /* ── Auto-init al cargar la página ── */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            initInlineEdit();
        });
    } else {
        initInlineEdit();
    }
})();
