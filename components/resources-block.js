/**
 * Resources block — panel principal del paso Recursos (Learn-Components Figma 248:6265).
 *
 * API: resourcesBlockHtml({ variant?, className? })
 *   variant incluye default, default-error (mismo selector que default + borde error, página sin recurso),
 *   video/pdf/mp4/scorm/embed… Tras insertar el HTML, llama initResourcesBlockFields(contenedorRaíz)
 *   para montar createInput (sm) en [data-rb-slot].
 *
 * Depende de: resourcesCardHtml, createInput (input.js), button.css, input.css, dropdown-menu.css.
 *
 * @see documentacion/componentes/resources-block.html
 */
(function (global) {
    'use strict';

    var RESOURCES_BLOCK_SELECTOR_TYPES = [
        'video',
        'video-desktop',
        'pdf',
        'texto',
        'embebido',
        'scorm',
        'evaluacion-final',
        'encuesta-libre'
    ];

    var RESOURCES_BLOCK_VARIANTS_ORDER = [
        'default',
        'default-error',
        'video-empty',
        'video-filled',
        'video-error',
        'pdf-empty',
        'pdf-error',
        'mp4-empty',
        'mp4-error',
        'scorm-empty',
        'scorm-error',
        'embed-empty',
        'embed-filled',
        'embed-error',
        'embed-blocked'
    ];

    var EMBED_URL_HELPER_TEXT = 'La URL debe ser embebible y visible para los estudiantes';

    var _rbFieldSeq = 0;

    function nextRbFieldId() {
        _rbFieldSeq += 1;
        return 'rb-fld-' + _rbFieldSeq;
    }

    /** Mueve el helper oficial del Input debajo de la fila input+botón (layout Figma 248:6265). */
    function rbRelocateInputHelper(slotEl) {
        if (!slotEl) return;
        var helper = slotEl.querySelector(':scope > .ubits-input-helper');
        var stack = slotEl.closest('.ubits-resources-block__field-stack');
        if (!helper || !stack) return;
        stack.appendChild(helper);
    }

    var VIDEO_HELPER_TEXT =
        'Solo se admiten enlaces de Vimeo, YouTube, Google Drive y OneDrive. Asegúrate de que el enlace esté disponible para cualquiera con el vínculo. Si está privado, los estudiantes no podrán acceder al contenido.';

    function escapeHtml(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function escapeAttr(s) {
        return escapeHtml(s).replace(/'/g, '&#039;');
    }

    function rbVariantDataAttr(variantKey) {
        return ' data-rb-variant="' + escapeAttr(variantKey) + '"';
    }

    function cardHtml(type) {
        if (typeof global.resourcesCardHtml === 'function') {
            return global.resourcesCardHtml({ type: type });
        }
        return '';
    }

    function cancelFooter() {
        return (
            '<div class="ubits-resources-block__footer">' +
            '<button type="button" class="ubits-button ubits-button--error-secondary ubits-button--sm">' +
            '<i class="far fa-times"></i><span>Cancelar</span></button></div>'
        );
    }

    /** Hueco para createInput text sm (initResourcesBlockFields) */
    function videoUrlSlot(mode) {
        var id = nextRbFieldId();
        return (
            '<div id="' +
            id +
            '" class="ubits-resources-block__input-mount" data-rb-slot="video-url" data-rb-video-mode="' +
            escapeAttr(mode) +
            '"></div>'
        );
    }

    function videoRow(opts) {
        var state = opts.state;
        var invalid = state === 'error';
        var filled = state === 'filled';
        var empty = state === 'empty';
        var mode = empty ? 'empty' : filled ? 'filled' : 'error';
        var btn =
            empty
                ? '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm" disabled><span>Cargar</span></button>'
                : '<button type="button" class="ubits-button ubits-button--primary ubits-button--sm"><span>Cargar</span></button>';
        return (
            '<div class="ubits-resources-block__field-stack' +
            (invalid ? ' ubits-resources-block__field-stack--error' : '') +
            '">' +
            '<div class="ubits-resources-block__field-inline">' +
            '<div class="ubits-resources-block__input-cell">' +
            videoUrlSlot(mode) +
            '</div>' +
            btn +
            '</div></div>'
        );
    }

    function fileSecondaryBtn() {
        return (
            '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm">' +
            '<i class="far fa-file-arrow-up"></i><span>Selecciona un archivo</span></button>'
        );
    }

    function uploadPdfMp4(kind, err) {
        var lines =
            kind === 'mp4'
                ? 'Selecciona o arrastra aquí un archivo .mp4'
                : 'Selecciona o arrastra aquí un archivo PDF';
        var hint =
            '<p class="ubits-resources-block__hint ubits-body-xs-regular">' +
            lines +
            '<br>Peso máximo: 250 MB' +
            (err ? '<br><span class="ubits-resources-block__hint--error">Mensaje de error</span>' : '') +
            '</p>';
        return '<div class="ubits-resources-block__upload">' + fileSecondaryBtn() + hint + '</div>';
    }

    function uploadScorm(err) {
        return (
            '<div class="ubits-resources-block__upload">' +
            fileSecondaryBtn() +
            '<p class="ubits-resources-block__hint ubits-body-xs-regular">' +
            'Selecciona o arrastra aquí un archivo SCORM<br>Peso máximo: 250 MB</p>' +
            (err
                ? '<p class="ubits-resources-block__hint ubits-body-xs-regular ubits-resources-block__hint--error">Mensaje de error</p>'
                : '') +
            '</div>'
        );
    }

    function embedUrlSlot(mode) {
        var id = nextRbFieldId();
        return (
            '<div id="' +
            id +
            '" class="ubits-resources-block__input-mount" data-rb-slot="embed-url" data-rb-embed-mode="' +
            escapeAttr(mode) +
            '"></div>'
        );
    }

    function embedVariant(state) {
        var err = state === 'error';
        var filled = state === 'filled';
        var btnCargar =
            filled
                ? '<button type="button" class="ubits-button ubits-button--primary ubits-button--sm"><span>Cargar</span></button>'
                : '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm" disabled><span>Cargar</span></button>';
        var stackInner =
            '<div class="ubits-resources-block__field-stack' +
            (err ? ' ubits-resources-block__field-stack--error' : '') +
            '">' +
            '<div class="ubits-resources-block__field-inline">' +
            '<div class="ubits-resources-block__input-cell">' +
            embedUrlSlot(state) +
            '</div>' +
            btnCargar +
            '</div>' +
            '</div>';
        return '<div class="ubits-resources-block__embed-stack">' + stackInner + '</div>';
    }

    function embedBlocked() {
        return (
            '<div class="ubits-resources-block__blocked">' +
            '<div class="ubits-resources-block__blocked-icon-wrap"><i class="far fa-lock" aria-hidden="true"></i></div>' +
            '<p class="ubits-resources-block__blocked-title ubits-body-md-bold">Enlace no embebible</p>' +
            '<p class="ubits-resources-block__blocked-text ubits-body-md-regular">Por razones de seguridad, no es posible embeber este enlace. Comunícate con soporte para asistencia.</p>' +
            '</div>'
        );
    }

    function buildDefault(extra, variantKey) {
        var cards = RESOURCES_BLOCK_SELECTOR_TYPES.map(function (t) {
            return cardHtml(t);
        }).join('');
        var validationMod = variantKey === 'default-error' ? ' ubits-resources-block--default-error' : '';
        return (
            '<div class="ubits-resources-block ubits-resources-block--default' +
            validationMod +
            extra +
            rbVariantDataAttr(variantKey) +
            '">' +
            '<p class="ubits-resources-block__title ubits-body-md-regular">Selecciona el tipo de recurso principal que quieres añadir</p>' +
            '<div class="ubits-resources-block__grid">' +
            cards +
            '</div></div>'
        );
    }

    function buildStack(surfaceInner, extra, variantKey) {
        return (
            '<div class="ubits-resources-block ubits-resources-block--stack' +
            extra +
            rbVariantDataAttr(variantKey) +
            '">' +
            '<div class="ubits-resources-block__surface ubits-resources-block__surface--embed">' +
            surfaceInner +
            '</div>' +
            cancelFooter() +
            '</div>'
        );
    }

    function buildStackPlain(surfaceInner, extra, variantKey) {
        return (
            '<div class="ubits-resources-block ubits-resources-block--stack' +
            extra +
            rbVariantDataAttr(variantKey) +
            '">' +
            '<div class="ubits-resources-block__surface">' +
            surfaceInner +
            '</div>' +
            cancelFooter() +
            '</div>'
        );
    }

    function normalizeVariant(v) {
        var s = String(v == null ? 'default' : v)
            .trim()
            .toLowerCase()
            .replace(/_/g, '-');
        if (s === 'embedblocked') return 'embed-blocked';
        if (s === 'defaulterror') return 'default-error';
        return s;
    }

    /**
     * Monta createInput (sm, sin etiqueta en fila video/url embebido) en los nodos data-rb-slot.
     * @param {HTMLElement} root — contenedor donde se insertó resourcesBlockHtml (p. ej. #rb-preview-mount)
     */
    function initResourcesBlockFields(root) {
        if (!root || typeof global.createInput !== 'function') return;

        root.querySelectorAll('[data-rb-slot]').forEach(function (el) {
            var id = el.id;
            if (!id) return;
            var slot = el.getAttribute('data-rb-slot');
            if (slot === 'video-url') {
                var mode = el.getAttribute('data-rb-video-mode') || 'empty';
                if (mode === 'empty') {
                    global.createInput({
                        containerId: id,
                        type: 'text',
                        size: 'sm',
                        showLabel: false,
                        placeholder: 'Pega el link del video',
                        value: '',
                        state: 'default',
                        showHelper: true,
                        helperText: VIDEO_HELPER_TEXT
                    });
                } else if (mode === 'filled') {
                    global.createInput({
                        containerId: id,
                        type: 'text',
                        size: 'sm',
                        showLabel: false,
                        placeholder: '',
                        value: 'https://vimeo.com/402202999',
                        state: 'default',
                        showHelper: true,
                        helperText: VIDEO_HELPER_TEXT
                    });
                } else {
                    global.createInput({
                        containerId: id,
                        type: 'text',
                        size: 'sm',
                        showLabel: false,
                        placeholder: '',
                        value: 'https://vimeodromo.com/402202999',
                        state: 'invalid',
                        showHelper: true,
                        helperText: 'Este no es un enlace válido'
                    });
                }
                rbRelocateInputHelper(el);
                return;
            }
            if (slot === 'embed-url') {
                var em = el.getAttribute('data-rb-embed-mode') || 'empty';
                if (em === 'empty') {
                    global.createInput({
                        containerId: id,
                        type: 'text',
                        size: 'sm',
                        showLabel: false,
                        placeholder: 'Pega el link o el código a embeber',
                        value: '',
                        state: 'default',
                        showHelper: true,
                        helperText: EMBED_URL_HELPER_TEXT
                    });
                    rbRelocateInputHelper(el);
                } else if (em === 'filled') {
                    global.createInput({
                        containerId: id,
                        type: 'text',
                        size: 'sm',
                        showLabel: false,
                        placeholder: '',
                        value: 'https://view.genially.com/631868230b60760012b66c9a',
                        state: 'default',
                        showHelper: true,
                        helperText: EMBED_URL_HELPER_TEXT
                    });
                    rbRelocateInputHelper(el);
                } else {
                    global.createInput({
                        containerId: id,
                        type: 'text',
                        size: 'sm',
                        showLabel: false,
                        placeholder: '',
                        value: 'https://view.pruebaland.com/631868230b60760012b66c9a',
                        state: 'invalid',
                        showHelper: true,
                        helperText: 'Este no es un enlace válido'
                    });
                    rbRelocateInputHelper(el);
                }
            }
        });
    }

    /**
     * @param {{ variant?: string, className?: string }} opts
     * @returns {string}
     */
    function resourcesBlockHtml(opts) {
        opts = opts || {};
        var v = normalizeVariant(opts.variant);
        var extra = opts.className ? ' ' + String(opts.className).trim().replace(/\s+/g, ' ') : '';

        if (v === 'default' || v === 'default-error') {
            return buildDefault(extra, v);
        }

        if (v === 'video-empty') return buildStackPlain(videoRow({ state: 'empty' }), extra, v);
        if (v === 'video-filled') return buildStackPlain(videoRow({ state: 'filled' }), extra, v);
        if (v === 'video-error') return buildStackPlain(videoRow({ state: 'error' }), extra, v);

        if (v === 'pdf-empty') return buildStackPlain(uploadPdfMp4('pdf', false), extra, v);
        if (v === 'pdf-error') return buildStackPlain(uploadPdfMp4('pdf', true), extra, v);
        if (v === 'mp4-empty') return buildStackPlain(uploadPdfMp4('mp4', false), extra, v);
        if (v === 'mp4-error') return buildStackPlain(uploadPdfMp4('mp4', true), extra, v);

        if (v === 'scorm-empty') return buildStackPlain(uploadScorm(false), extra, v);
        if (v === 'scorm-error') return buildStackPlain(uploadScorm(true), extra, v);

        if (v === 'embed-empty') return buildStack(embedVariant('empty'), extra, v);
        if (v === 'embed-filled') return buildStack(embedVariant('filled'), extra, v);
        if (v === 'embed-error') return buildStack(embedVariant('error'), extra, v);

        if (v === 'embed-blocked') {
            return (
                '<div class="ubits-resources-block ubits-resources-block--stack' +
                extra +
                rbVariantDataAttr(v) +
                '">' +
                '<div class="ubits-resources-block__surface ubits-resources-block__surface--embed">' +
                embedBlocked() +
                '</div>' +
                cancelFooter() +
                '</div>'
            );
        }

        return buildDefault(extra, 'default');
    }

    global.RESOURCES_BLOCK_SELECTOR_TYPES = RESOURCES_BLOCK_SELECTOR_TYPES;
    global.RESOURCES_BLOCK_VARIANTS_ORDER = RESOURCES_BLOCK_VARIANTS_ORDER;
    global.resourcesBlockHtml = resourcesBlockHtml;
    global.initResourcesBlockFields = initResourcesBlockFields;
})(typeof window !== 'undefined' ? window : this);
