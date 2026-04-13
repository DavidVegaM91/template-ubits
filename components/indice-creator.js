/**
 * Índice Creator — panel izquierdo del paso Recursos (LMS Creator): interruptor de secciones,
 * índice de secciones + «Añadir sección» o una sola lista de páginas sin título de sección.
 * Carga previa: switch.css, paginas-creator.js, seccion-creator.js (dropdown-menu, tooltip).
 * Eventos: ubits-indice-creator-sections-toggle { sectionsEnabled, root }, ubits-indice-creator-add-section { root }
 * @see documentacion/componentes/indice-creator.html
 * Figma Learn-Components: nodo 242:5621
 */
(function (global) {
    function escapeHtml(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    function escapeAttr(s) {
        return escapeHtml(s).replace(/"/g, '&quot;');
    }

    function ensureRootId(root) {
        if (!root || root.id) return root;
        root.id = 'ubits-ic-root-' + String(Date.now()) + '-' + Math.floor(Math.random() * 1e6);
        return root;
    }

    /**
     * Fila inferior «Añadir sección» (solo si sectionsEnabled en la vista).
     */
    function indiceCreatorAddSectionRowHtml(opts) {
        opts = opts || {};
        var id = opts.addSectionButtonId ? ' id="' + escapeAttr(String(opts.addSectionButtonId).trim()) + '"' : '';
        return (
            '<div class="ubits-indice-creator__add-section">' +
            '<button type="button" class="ubits-button ubits-button--secondary ubits-button--md ubits-indice-creator__add-section-btn"' +
            id +
            '>' +
            '<i class="far fa-plus"></i>' +
            '<span>Añadir sección</span>' +
            '</button>' +
            '</div>'
        );
    }

    /**
     * @param {Object} opts
     * @param {boolean} [opts.sectionsEnabled] - true = varias secciones + botón añadir sección; false/omitido = lista única sin cabecera (por defecto producto: false).
     * @param {string} [opts.toggleId]
     * @param {string} [opts.toggleLabel]
     * @param {Array} [opts.sections] - para seccionCreatorIndexHtml cuando sectionsEnabled
     * @param {Object} [opts.indexOpts] - opciones extra para seccionCreatorIndexHtml (p. ej. sections ya compuestas)
     * @param {Array} [opts.pages] - páginas en modo lista única (hideTitle)
     * @param {Object} [opts.singleSection] - mezcla con defaults del bloque único (pages, sectionKey, addButtonId…)
     * @param {string} [opts.singleSectionKey]
     * @param {string} [opts.addSectionButtonId]
     */
    function indiceCreatorHtml(opts) {
        opts = opts || {};
        if (typeof global.seccionCreatorSectionHtml !== 'function' || typeof global.seccionCreatorIndexHtml !== 'function') {
            console.warn('UBITS: carga seccion-creator.js (y paginas-creator.js) antes de indice-creator.js');
            return '';
        }

        var sectionsEnabled = opts.sectionsEnabled === true;
        var toggleId = opts.toggleId != null ? String(opts.toggleId).trim() : 'ubits-indice-creator-toggle';
        var toggleLabel =
            opts.toggleLabel != null ? String(opts.toggleLabel) : 'Habilitar el uso de secciones';

        var bodyInner = '';
        if (sectionsEnabled) {
            var idxOpts = opts.indexOpts ? Object.assign({}, opts.indexOpts) : {};
            if (!idxOpts.sections && opts.sections) {
                idxOpts.sections = opts.sections;
            }
            idxOpts.sections = idxOpts.sections || [];
            bodyInner =
                '<div class="ubits-indice-creator__index-wrap">' +
                global.seccionCreatorIndexHtml(idxOpts) +
                '</div>' +
                indiceCreatorAddSectionRowHtml(opts);
        } else {
            var single = Object.assign(
                {
                    hideTitle: true,
                    active: true,
                    includeAddButton: true,
                    sectionKey: opts.singleSectionKey != null ? String(opts.singleSectionKey) : 'default',
                    pages: opts.pages || [],
                    addButtonLabel: opts.addPageLabel
                },
                opts.singleSection || {}
            );
            single.hideTitle = true;
            if (single.active !== false) {
                single.includeAddButton = true;
            }
            bodyInner =
                '<div class="ubits-indice-creator__single-wrap">' +
                global.seccionCreatorSectionHtml(single) +
                '</div>';
        }

        return (
            '<div class="ubits-indice-creator">' +
            '<div class="ubits-indice-creator__toggle-card">' +
            '<span class="ubits-body-sm-regular ubits-indice-creator__toggle-text">' +
            escapeHtml(toggleLabel) +
            '</span>' +
            '<label class="ubits-switch ubits-switch--md">' +
            '<input type="checkbox" class="ubits-switch__input ubits-indice-creator__toggle-input" id="' +
            escapeAttr(toggleId) +
            '" ' +
            (sectionsEnabled ? 'checked ' : '') +
            'aria-label="' +
            escapeAttr(toggleLabel) +
            '">' +
            '<span class="ubits-switch__track">' +
            '<span class="ubits-switch__thumb"></span>' +
            '</span>' +
            '</label>' +
            '</div>' +
            '<div class="ubits-indice-creator__body">' +
            bodyInner +
            '</div>' +
            '</div>'
        );
    }

    /**
     * Inicializa interacción (secciones/páginas, toggle, botón añadir sección). Llamar tras insertar HTML.
     */
    function initIndiceCreator(rootElOrSelector) {
        var root =
            typeof rootElOrSelector === 'string'
                ? document.querySelector(rootElOrSelector)
                : rootElOrSelector;
        if (!root) return;
        if (!root.classList.contains('ubits-indice-creator')) {
            var inner = root.querySelector && root.querySelector('.ubits-indice-creator');
            if (inner) root = inner;
        }
        if (!root || !root.classList.contains('ubits-indice-creator')) return;

        ensureRootId(root);
        if (typeof global.initSeccionCreator === 'function') {
            global.initSeccionCreator(root);
        }

        var toggle = root.querySelector('.ubits-indice-creator__toggle-input');
        if (toggle && toggle.getAttribute('data-ubits-indice-bound') !== '1') {
            toggle.setAttribute('data-ubits-indice-bound', '1');
            toggle.addEventListener('change', function () {
                var doc = global.document || document;
                doc.dispatchEvent(
                    new CustomEvent('ubits-indice-creator-sections-toggle', {
                        bubbles: true,
                        detail: { sectionsEnabled: toggle.checked, root: root }
                    })
                );
            });
        }

        var addSec = root.querySelector('.ubits-indice-creator__add-section-btn');
        if (addSec && addSec.getAttribute('data-ubits-indice-bound') !== '1') {
            addSec.setAttribute('data-ubits-indice-bound', '1');
            addSec.addEventListener('click', function () {
                var doc = global.document || document;
                doc.dispatchEvent(
                    new CustomEvent('ubits-indice-creator-add-section', {
                        bubbles: true,
                        detail: { root: root }
                    })
                );
            });
        }

        if (typeof global.initTooltip === 'function') {
            global.initTooltip('#' + root.id + ' [data-tooltip]');
        }
    }

    global.indiceCreatorHtml = indiceCreatorHtml;
    global.indiceCreatorAddSectionRowHtml = indiceCreatorAddSectionRowHtml;
    global.initIndiceCreator = initIndiceCreator;
})(typeof window !== 'undefined' ? window : this);
