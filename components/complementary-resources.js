/**
 * Complementary resources — recursos secundarios opcionales bajo el recurso principal (LMS Creator).
 * Figma Creator v3: Secondary resources block (40008346:29625).
 *
 * API:
 *   complementaryResourcesInviteHtml({ variant, className? })
 *     variant: 'both' | 'download-only' | 'text-only'
 *   complementaryResourcesTextFilledHtml({ editorRootId? })
 *   complementaryResourcesDownloadFilledHtml({ uploadContainerId? })
 *   resolveComplementaryInviteVariant({ primaryType, hasText, hasDownload })
 *   initComplementaryResources(root) — invite + createFileUpload en descargable
 *   initComplementaryDownloadFileUpload(containerId) — solo uploader (PDF, Office, zip, txt, csv · 256 MB)
 *
 * Depende de: resources-card.js, file-upload.js, rich-text-editor.js, button.css, resources-card.css, file-upload.css, rich-text-editor.css
 *
 * @see documentacion/componentes/complementary-resources.html
 */
(function (global) {
    'use strict';

    var INVITE_VARIANTS = ['both', 'download-only', 'text-only'];

    /** Tipos aceptados para archivo descargable complementario (LMS Creator). */
    var COMPLEMENTARY_DOWNLOAD_ACCEPT =
        '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.txt,.csv,' +
        'application/pdf,application/msword,' +
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document,' +
        'application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,' +
        'application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,' +
        'application/zip,application/x-zip-compressed,' +
        'application/vnd.rar-compressed,application/x-rar-compressed,application/x-rar,' +
        'text/plain,text/csv';

    var COMPLEMENTARY_DOWNLOAD_FORMATS_LABEL =
        'PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, ZIP, RAR, TXT, CSV · Hasta 256 MB';

    var COMPLEMENTARY_DOWNLOAD_MAX_MB = 256;

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

    function normalizeInviteVariant(v) {
        var s = String(v == null ? 'both' : v)
            .trim()
            .toLowerCase()
            .replace(/_/g, '-');
        if (s === 'downloadonly' || s === 'solo-descargable') return 'download-only';
        if (s === 'textonly' || s === 'solo-texto') return 'text-only';
        if (INVITE_VARIANTS.indexOf(s) === -1) return 'both';
        return s;
    }

    /**
     * Decide si mostrar invite y con qué variantes. null = ocultar sección invite (ambos añadidos o sin principal).
     * @param {{ primaryType?: string, hasText?: boolean, hasDownload?: boolean }} opts
     * @returns {'both'|'download-only'|'text-only'|null}
     */
    function resolveComplementaryInviteVariant(opts) {
        opts = opts || {};
        var primary = String(opts.primaryType != null ? opts.primaryType : '').trim().toLowerCase();
        var hasText = opts.hasText === true;
        var hasDownload = opts.hasDownload === true;

        if (hasText && hasDownload) return null;

        var canOfferText = primary !== 'texto' && !hasText;
        var canOfferDownload = !hasDownload;

        if (!canOfferText && !canOfferDownload) return null;
        if (canOfferText && canOfferDownload) return 'both';
        if (canOfferDownload) return 'download-only';
        return 'text-only';
    }

    /**
     * @param {{ variant?: string, className?: string }} opts
     * @returns {string}
     */
    function complementaryResourcesInviteHtml(opts) {
        opts = opts || {};
        var variant = normalizeInviteVariant(opts.variant);
        var extra = opts.className ? ' ' + escapeAttr(String(opts.className).trim()) : '';
        var cards = [];

        if (variant === 'both' || variant === 'text-only') {
            if (typeof global.resourcesCardHtml === 'function') {
                cards.push(
                    global.resourcesCardHtml({
                        type: 'texto',
                        className: 'ubits-complementary-resources__card',
                        ariaLabel: 'Añadir texto complementario'
                    })
                );
            }
        }
        if (variant === 'both' || variant === 'download-only') {
            if (typeof global.resourcesCardHtml === 'function') {
                cards.push(
                    global.resourcesCardHtml({
                        type: 'archivo-descargable',
                        className: 'ubits-complementary-resources__card',
                        ariaLabel: 'Añadir archivo descargable'
                    })
                );
            }
        }

        return (
            '<section class="ubits-complementary-resources ubits-complementary-resources--invite' +
            extra +
            '" data-complementary-invite data-complementary-variant="' +
            escapeAttr(variant) +
            '" aria-label="Recursos complementarios opcionales">' +
            '<p class="ubits-complementary-resources__title ubits-body-sm-regular">Añade un recurso complementario (opcional)</p>' +
            '<div class="ubits-complementary-resources__grid">' +
            cards.join('') +
            '</div></section>'
        );
    }

    /**
     * @param {{ editorRootId?: string }} opts
     * @returns {string}
     */
    function complementaryResourcesTextFilledHtml(opts) {
        opts = opts || {};
        var rootId = opts.editorRootId != null ? String(opts.editorRootId) : 'cc-comp-text-rte';
        var fieldId = rootId + '-field';
        var toolbarHtml =
            typeof global.richTextEditorToolbarAndFileInputHtml === 'function'
                ? global.richTextEditorToolbarAndFileInputHtml()
                : '';
        return (
            '<article class="ubits-complementary-resources ubits-complementary-resources--filled-stack" data-complementary-filled="texto">' +
            '<div class="ubits-complementary-resources__surface">' +
            '<div class="ubits-complementary-resources__filled-body">' +
            '<div id="' +
            escapeAttr(rootId) +
            '" class="ubits-rich-text-editor" data-rich-text-editor>' +
            toolbarHtml +
            '<div class="ubits-rich-text-editor__editor-shell">' +
            '<div id="' +
            escapeAttr(fieldId) +
            '" class="ubits-rich-text-editor__field ubits-body-md-regular is-empty" contenteditable="true" role="textbox" aria-multiline="true" data-placeholder="Escribe el texto complementario"></div>' +
            '</div></div></div></div>' +
            '<div class="ubits-complementary-resources__footer">' +
            '<button type="button" class="ubits-button ubits-button--error-secondary ubits-button--sm" data-cc-eliminar-complementario="texto">' +
            '<i class="far fa-trash-alt"></i><span>Eliminar</span></button>' +
            '</div></article>'
        );
    }

    /**
     * @param {{ uploadContainerId?: string }} opts
     * @returns {string}
     */
    function complementaryResourcesDownloadFilledHtml(opts) {
        opts = opts || {};
        var cid = opts.uploadContainerId != null ? String(opts.uploadContainerId) : 'cc-comp-download-fu';
        return (
            '<article class="ubits-complementary-resources ubits-complementary-resources--filled-stack" data-complementary-filled="archivo-descargable">' +
            '<div class="ubits-complementary-resources__surface">' +
            '<div class="ubits-complementary-resources__filled-body">' +
            '<div id="' +
            escapeAttr(cid) +
            '" class="ubits-complementary-resources__upload-mount" data-cc-comp-download-upload></div>' +
            '</div></div>' +
            '<div class="ubits-complementary-resources__footer">' +
            '<button type="button" class="ubits-button ubits-button--error-secondary ubits-button--sm" data-cc-eliminar-complementario="archivo-descargable">' +
            '<i class="far fa-trash-alt"></i><span>Eliminar</span></button>' +
            '</div></article>'
        );
    }

    /**
     * Monta el File Upload oficial en el contenedor del bloque descargable complementario.
     * @param {string} containerId — id del nodo [data-cc-comp-download-upload]
     * @returns {HTMLElement|null}
     */
    function initComplementaryDownloadFileUpload(containerId) {
        var slot = document.getElementById(containerId);
        if (!slot || slot.getAttribute('data-comp-fu-bound') === '1') return null;
        if (typeof global.createFileUpload !== 'function') return null;
        slot.setAttribute('data-comp-fu-bound', '1');
        return global.createFileUpload({
            containerId: containerId,
            title: 'Subir archivo',
            hideHeader: true,
            accept: COMPLEMENTARY_DOWNLOAD_ACCEPT,
            maxSizeMb: COMPLEMENTARY_DOWNLOAD_MAX_MB,
            formats: COMPLEMENTARY_DOWNLOAD_FORMATS_LABEL,
            successMessage: false
        });
    }

    function initComplementaryResources(root) {
        if (!root) return;
        root.querySelectorAll('[data-cc-comp-download-upload]').forEach(function (slot) {
            if (slot.id) {
                initComplementaryDownloadFileUpload(slot.id);
            }
        });
        root.querySelectorAll('[data-complementary-invite] .ubits-resources-card').forEach(function (card) {
            if (card.getAttribute('data-comp-invite-bound') === '1') return;
            card.setAttribute('data-comp-invite-bound', '1');
            card.addEventListener('click', function () {
                if (card.disabled) return;
                var type = card.getAttribute('data-resources-card-type') || '';
                root.dispatchEvent(
                    new CustomEvent('ubits-complementary-resources-invite', {
                        bubbles: true,
                        detail: { type: type, inviteRoot: root }
                    })
                );
            });
        });
    }

    global.COMPLEMENTARY_RESOURCES_INVITE_VARIANTS = INVITE_VARIANTS;
    global.complementaryResourcesInviteHtml = complementaryResourcesInviteHtml;
    global.complementaryResourcesTextFilledHtml = complementaryResourcesTextFilledHtml;
    global.complementaryResourcesDownloadFilledHtml = complementaryResourcesDownloadFilledHtml;
    global.resolveComplementaryInviteVariant = resolveComplementaryInviteVariant;
    global.initComplementaryResources = initComplementaryResources;
    global.initComplementaryDownloadFileUpload = initComplementaryDownloadFileUpload;
    global.COMPLEMENTARY_DOWNLOAD_ACCEPT = COMPLEMENTARY_DOWNLOAD_ACCEPT;
    global.COMPLEMENTARY_DOWNLOAD_MAX_MB = COMPLEMENTARY_DOWNLOAD_MAX_MB;
})(typeof window !== 'undefined' ? window : this);
