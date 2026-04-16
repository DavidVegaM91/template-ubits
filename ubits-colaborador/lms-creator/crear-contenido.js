/**
 * LMS Creator — Página dedicada crear-contenido.html (modo página, sin drawer).
 * Un solo archivo: portada (inputs, RTE, miniatura), hashes URL, paso Recursos (índice + empty + eventos).
 * Lógica del flujo crear contenido (tras corte: antiguo drawer de lista sustituido por esta página).
 */
(function () {
    'use strict';

    var crearContenidoPortadaTrailerUrl = '';
    var crearContenidoInputApis = {};
    /** 0 = Portada, 1 = Recursos */
    var pageCurrentStep = 0;
    var portadaValidationFlash = false;
    var recursosTitlesValidationFlash = false;
    var PORTADA_INVALID_CLASS = 'crear-contenido-portada-field--invalid';
    var CATEGORIA_SELECT_PLACEHOLDER_TEXT = 'Selecciona una opción';

    function escAttr(s) {
        return String(s || '')
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;');
    }

    function getPortadaDataUrl() {
        var block = document.getElementById('crear-contenido-img-trailer');
        var img = block && block.querySelector('.ubits-learn-img-trailer__img');
        if (!img || !img.getAttribute('src')) return null;
        return img.getAttribute('src');
    }

    function buildPortadaFigureHtml(hasTrailer) {
        var playLabel =
            window.LEARN_CONTENT_IMG_TRAILER_DEFAULTS && window.LEARN_CONTENT_IMG_TRAILER_DEFAULTS.playAriaLabel
                ? window.LEARN_CONTENT_IMG_TRAILER_DEFAULTS.playAriaLabel
                : 'Reproducir tráiler';
        var scrim =
            '<div class="ubits-learn-img-trailer__trailer-scrim" aria-hidden="false">' +
            '<span class="ubits-learn-img-trailer__trailer-scrim-bg" aria-hidden="true"></span>' +
            '<button type="button" class="ubits-learn-img-trailer__play" aria-label="' +
            escAttr(playLabel) +
            '">' +
            '<i class="fas fa-play"></i></button></div>';
        return (
            '<figure class="ubits-learn-img-trailer__media">' +
            '<img class="ubits-learn-img-trailer__img" alt="">' +
            (hasTrailer ? scrim : '') +
            '</figure>'
        );
    }

    function applyPortadaImagenCargada(dataUrl, trailerUrl) {
        var block = document.getElementById('crear-contenido-img-trailer');
        if (!block || !dataUrl) return;
        crearContenidoPortadaTrailerUrl = trailerUrl != null ? String(trailerUrl).trim() : '';
        var hasTrailer = crearContenidoPortadaTrailerUrl.length > 0;
        block.classList.add('ubits-learn-img-trailer--image');
        if (hasTrailer) block.classList.add('ubits-learn-img-trailer--trailer');
        else block.classList.remove('ubits-learn-img-trailer--trailer');
        block.classList.remove('ubits-learn-img-trailer--playing');
        block.removeAttribute('data-img-trailer-init');
        block.removeAttribute('data-learn-img-trailer-init');
        if (typeof window.getLearnContentImgTrailerEmptyHtml !== 'function' || typeof window.getLearnContentImgTrailerEditHtml !== 'function') return;
        block.innerHTML =
            window.getLearnContentImgTrailerEmptyHtml({}) +
            buildPortadaFigureHtml(hasTrailer) +
            window.getLearnContentImgTrailerEditHtml({ editButtonId: 'crear-contenido-portada-cambiar' });
        var img = block.querySelector('.ubits-learn-img-trailer__img');
        if (img) img.src = dataUrl;
        if (hasTrailer) block.setAttribute('data-trailer-url', crearContenidoPortadaTrailerUrl);
        else block.removeAttribute('data-trailer-url');
        var cambiar = document.getElementById('crear-contenido-portada-cambiar');
        if (cambiar) {
            cambiar.addEventListener('click', function (e) {
                e.preventDefault();
                openPortadaModalPage();
            });
        }
        if (typeof window.initLearnContentImgTrailer === 'function') {
            window.initLearnContentImgTrailer(block, {});
        }
        refreshCrearContenidoPageSiguienteState();
    }

    function openPortadaModalPage() {
        if (typeof window.openPortadaTrailerModal !== 'function') return;
        window.openPortadaTrailerModal({
            dataUrl: getPortadaDataUrl(),
            trailerUrl: crearContenidoPortadaTrailerUrl,
            onConfirm: function (payload) {
                if (payload && payload.dataUrl) {
                    applyPortadaImagenCargada(payload.dataUrl, payload.trailerUrl);
                }
            }
        });
    }

    function wirePortadaCta() {
        var cta = document.getElementById('crear-contenido-portada-cta');
        if (cta) {
            cta.addEventListener('click', function (e) {
                e.preventDefault();
                openPortadaModalPage();
            });
        }
    }

    function buildSelectOptionsFromMaster() {
        var g = typeof window !== 'undefined' ? window : {};
        var tipos =
            g.BD_MASTER_TIPOS_CONTENIDO && g.BD_MASTER_TIPOS_CONTENIDO.tipos
                ? g.BD_MASTER_TIPOS_CONTENIDO.tipos.map(function (t) {
                      return { value: t.id, text: t.nombre };
                  })
                : [{ value: 'tct-001', text: 'Curso' }];
        var niveles =
            g.BD_MASTER_NIVELES_CONTENIDO && g.BD_MASTER_NIVELES_CONTENIDO.niveles
                ? g.BD_MASTER_NIVELES_CONTENIDO.niveles.map(function (n) {
                      return { value: n.id, text: n.nombre };
                  })
                : [{ value: 'niv-001', text: 'Básico' }];
        var cats =
            g.BD_MASTER_CATEGORIAS_FIQSHA && g.BD_MASTER_CATEGORIAS_FIQSHA.categorias
                ? g.BD_MASTER_CATEGORIAS_FIQSHA.categorias.map(function (c) {
                      return { value: c.id, text: c.nombre };
                  })
                : [{ value: '', text: 'Selecciona una opción' }];
        return { tipos: tipos, niveles: niveles, categorias: cats };
    }

    function initFichaInputs() {
        crearContenidoInputApis = {};
        var o = buildSelectOptionsFromMaster();
        if (typeof createInput !== 'function') return;
        var tick = function () {
            refreshCrearContenidoPageSiguienteState();
        };
        crearContenidoInputApis.tipo = createInput({
            containerId: 'crear-contenido-in-tipo',
            type: 'select',
            label: 'Tipo de contenido',
            size: 'sm',
            selectOptions: o.tipos,
            value: o.tipos[0] ? o.tipos[0].value : '',
            onChange: tick
        });
        crearContenidoInputApis.nivel = createInput({
            containerId: 'crear-contenido-in-nivel',
            type: 'select',
            label: 'Nivel',
            size: 'sm',
            selectOptions: o.niveles,
            value: o.niveles[0] ? o.niveles[0].value : '',
            onChange: tick
        });
        crearContenidoInputApis.idioma = createInput({
            containerId: 'crear-contenido-in-idioma',
            type: 'select',
            label: 'Idioma',
            size: 'sm',
            selectOptions: [
                { value: 'es', text: 'Español' },
                { value: 'en', text: 'Inglés' },
                { value: 'pt', text: 'Portugués' }
            ],
            value: 'es',
            onChange: tick
        });
        crearContenidoInputApis.tiempo = createInput({
            containerId: 'crear-contenido-in-tiempo',
            type: 'number',
            label: 'Tiempo aproximado',
            placeholder: 'Ej. 30',
            size: 'sm',
            value: '30',
            onChange: tick
        });
        crearContenidoInputApis.unidad = createInput({
            containerId: 'crear-contenido-in-unidad',
            type: 'select',
            label: 'Unidad de tiempo',
            size: 'sm',
            selectOptions: [
                { value: 'min', text: 'Minutos' },
                { value: 'h', text: 'Horas' }
            ],
            value: 'min',
            onChange: tick
        });
        var catOpts = [{ value: '', text: 'Selecciona una opción' }].concat(o.categorias);
        var firstRealCat = (o.categorias || []).filter(function (c) {
            return c && c.id != null && String(c.id).trim() !== '';
        })[0];
        var defaultCatId = firstRealCat ? String(firstRealCat.id) : '';
        crearContenidoInputApis.categoria = createInput({
            containerId: 'crear-contenido-in-categoria',
            type: 'select',
            label: 'Categoría',
            placeholder: CATEGORIA_SELECT_PLACEHOLDER_TEXT,
            size: 'sm',
            selectOptions: catOpts,
            value: defaultCatId,
            onChange: tick
        });
        refreshCrearContenidoPageSiguienteState();
    }

    function stripHtml(html) {
        var t = document.createElement('div');
        t.innerHTML = html || '';
        return (t.textContent || '').replace(/\u00a0/g, ' ').trim();
    }

    function parseTiempoPositive(raw) {
        if (raw == null) return NaN;
        var s = String(raw)
            .trim()
            .replace(/\s/g, '')
            .replace(',', '.');
        if (s === '') return NaN;
        var n = parseFloat(s);
        return isNaN(n) || n <= 0 ? NaN : n;
    }

    function clearPortadaInvalidMarks() {
        document.querySelectorAll('#crear-contenido-step-portada .' + PORTADA_INVALID_CLASS).forEach(function (el) {
            el.classList.remove(PORTADA_INVALID_CLASS);
        });
    }

    function getCrearContenidoPortadaCompleteness() {
        var missing = [];
        var titulo = document.getElementById('crear-contenido-titulo');
        var tituloOk = titulo && titulo.value.trim().length > 0;
        if (!tituloOk) missing.push('titulo');

        var block = document.getElementById('crear-contenido-img-trailer');
        var portadaOk =
            block &&
            (block.classList.contains('ubits-learn-img-trailer--image') ||
                block.classList.contains('ubits-learn-img-trailer--trailer'));
        if (!portadaOk && block) {
            var img = block.querySelector('.ubits-learn-img-trailer__img');
            var src = img && img.getAttribute('src');
            if (src && String(src).trim().length > 0) {
                portadaOk = true;
            }
        }
        if (!portadaOk) missing.push('portada');

        var descOk = false;
        if (typeof window.getRichTextHtml === 'function') {
            var h = window.getRichTextHtml('#crear-contenido-rte');
            descOk = stripHtml(h).length > 0;
        }
        var rteField = document.getElementById('crear-contenido-rte-field');
        if (!descOk && rteField) {
            var rtePlain = (rteField.innerText || '').replace(/\u00a0/g, ' ').trim();
            descOk = rtePlain.length > 0;
        }
        if (!descOk) missing.push('descripcion');

        var a = crearContenidoInputApis;
        if (!a.tipo || !String(a.tipo.getValue() || '').trim()) missing.push('tipo');
        if (!a.nivel || !String(a.nivel.getValue() || '').trim()) missing.push('nivel');
        if (!a.idioma || !String(a.idioma.getValue() || '').trim()) missing.push('idioma');
        var tv = a.tiempo ? String(a.tiempo.getValue()) : '';
        if (isNaN(parseTiempoPositive(tv))) missing.push('tiempo');
        if (!a.unidad || !String(a.unidad.getValue() || '').trim()) missing.push('unidad');
        var catDisp = a.categoria ? String(a.categoria.getValue() || '').trim() : '';
        var catOk =
            catDisp.length > 0 &&
            catDisp !== CATEGORIA_SELECT_PLACEHOLDER_TEXT &&
            catDisp !== 'Selecciona una opción...';
        if (!catOk) missing.push('categoria');

        return { complete: missing.length === 0, missing: missing };
    }

    function isCrearContenidoPortadaComplete() {
        return getCrearContenidoPortadaCompleteness().complete;
    }

    function syncPortadaInvalidOutline() {
        if (!portadaValidationFlash) {
            clearPortadaInvalidMarks();
            return;
        }
        var st = getCrearContenidoPortadaCompleteness();
        if (st.complete) {
            portadaValidationFlash = false;
            clearPortadaInvalidMarks();
            return;
        }
        clearPortadaInvalidMarks();
        st.missing.forEach(function (key) {
            if (key === 'titulo') {
                var t = document.getElementById('crear-contenido-titulo');
                var lab = t && t.closest('.contenidos-creator-titulo-wrap');
                if (lab) lab.classList.add(PORTADA_INVALID_CLASS);
            } else if (key === 'portada') {
                var mediaHost = document.querySelector(
                    '#crear-contenido-step-portada .crear-contenido-portada__cabecera-media'
                );
                if (mediaHost) mediaHost.classList.add(PORTADA_INVALID_CLASS);
            } else if (key === 'descripcion') {
                var rte = document.getElementById('crear-contenido-rte');
                if (rte) rte.classList.add(PORTADA_INVALID_CLASS);
            } else if (key === 'tipo') {
                var el = document.getElementById('crear-contenido-in-tipo');
                if (el) el.classList.add(PORTADA_INVALID_CLASS);
            } else if (key === 'nivel') {
                var n = document.getElementById('crear-contenido-in-nivel');
                if (n) n.classList.add(PORTADA_INVALID_CLASS);
            } else if (key === 'idioma') {
                var i = document.getElementById('crear-contenido-in-idioma');
                if (i) i.classList.add(PORTADA_INVALID_CLASS);
            } else if (key === 'tiempo') {
                var ti = document.getElementById('crear-contenido-in-tiempo');
                if (ti) ti.classList.add(PORTADA_INVALID_CLASS);
            } else if (key === 'unidad') {
                var u = document.getElementById('crear-contenido-in-unidad');
                if (u) u.classList.add(PORTADA_INVALID_CLASS);
            } else if (key === 'categoria') {
                var c = document.getElementById('crear-contenido-in-categoria');
                if (c) c.classList.add(PORTADA_INVALID_CLASS);
            }
        });
    }

    /* ---------- Paso Recursos ---------- */
    var CREAR_CONTENIDO_RECURSOS_EMPTY_HOST_ID = 'ccCrearContenidoRecursosEmpty';
    var recursosUiDone = false;
    var recursosPageSeq = 0;
    var recursosEventsBound = false;
    /** Uso de secciones (paso Recursos): interruptor Índice creator */
    var recursosSectionsEnabled = false;
    var recursosSectionIdSeq = 1;
    /** sectionKey -> { descriptionHtml: string } */
    var recursosSectionMeta = {};
    var CC_MODAL_DISABLE_SEC = 'cc-modal-deshabilitar-secciones';
    var CC_MODAL_EDIT_SEC = 'cc-modal-editar-seccion';

    function getRecursosIndiceMount() {
        return document.getElementById('crear-contenido-recursos-indice-mount');
    }

    function readTipoFromPaginasItem(item) {
        var icon = item && item.querySelector('.ubits-paginas-creator__drag-handle i');
        if (!icon) return 'blank-page';
        var cls = icon.className || '';
        var map = window.PAGINAS_CREATOR_TIPO_ICONS || {};
        for (var tipo in map) {
            if (Object.prototype.hasOwnProperty.call(map, tipo)) {
                var fa = 'fa-' + map[tipo];
                if (cls.indexOf(fa) !== -1) return tipo;
            }
        }
        return 'blank-page';
    }

    function collectPagesDataFromList(listEl) {
        if (!listEl) return [];
        var items = listEl.querySelectorAll(':scope > .ubits-paginas-creator__item');
        return Array.prototype.map.call(items, function (item) {
            var pk = item.getAttribute('data-paginas-creator-key') || '';
            var lab = item.querySelector('.ubits-paginas-creator__label');
            var label = lab ? String(lab.textContent || '').trim() : '';
            return {
                pageKey: pk,
                label: label,
                tipo: readTipoFromPaginasItem(item),
                active: item.classList.contains('is-active')
            };
        });
    }

    function recursosSerializeSectionsFromDom() {
        var mount = getRecursosIndiceMount();
        if (!mount) return [];
        var secs = mount.querySelectorAll('.ubits-seccion-creator-index__stack > .ubits-seccion-creator__section');
        return Array.prototype.map.call(secs, function (sec) {
            var key = sec.getAttribute('data-seccion-creator-key') || '';
            var titleEl = sec.querySelector('.ubits-seccion-creator__title');
            var title = titleEl ? String(titleEl.textContent || '').trim() : '';
            var list = sec.querySelector('.ubits-paginas-creator');
            return {
                key: key,
                title: title,
                pages: collectPagesDataFromList(list),
                active: sec.classList.contains('is-active')
            };
        });
    }

    function recursosSerializeSingleSectionFromDom() {
        var mount = getRecursosIndiceMount();
        if (!mount) return [];
        var list = mount.querySelector('.ubits-indice-creator__single-wrap .ubits-paginas-creator');
        return collectPagesDataFromList(list);
    }

    function recursosShouldShowDisableSectionsModal() {
        var model = recursosSerializeSectionsFromDom();
        if (model.length < 2) return false;
        var withPages = 0;
        model.forEach(function (s) {
            if ((s.pages || []).length > 0) withPages += 1;
        });
        return withPages >= 2;
    }

    function recursosMergeAllPagesFromDomInOrder() {
        var model = recursosSerializeSectionsFromDom();
        var all = [];
        model.forEach(function (s) {
            (s.pages || []).forEach(function (p) {
                all.push(p);
            });
        });
        var activeKey = '';
        model.forEach(function (s) {
            (s.pages || []).forEach(function (p) {
                if (p.active) activeKey = p.pageKey;
            });
        });
        return { pages: all, activePageKey: activeKey };
    }

    function recursosBuildIndiceMultiHtml(sectionsModel) {
        var idx = sectionsModel.map(function (s) {
            return {
                sectionKey: s.key,
                title: s.title,
                pages: (s.pages || []).map(function (p) {
                    return {
                        label: p.label,
                        pageKey: p.pageKey,
                        tipo: p.tipo,
                        active: !!p.active
                    };
                }),
                active: !!s.active,
                hideTitle: false
            };
        });
        return window.indiceCreatorHtml({
            sectionsEnabled: true,
            toggleId: 'crear-contenido-recursos-indice-sections-toggle',
            sections: idx,
            indexOpts: { sections: idx }
        });
    }

    function recursosMountHtmlAndInit(html) {
        var mount = getRecursosIndiceMount();
        if (!mount) return;
        delete mount._ccSecDblCapture;
        mount.innerHTML = html;
        if (typeof window.initIndiceCreator === 'function') {
            window.initIndiceCreator(mount);
        }
        if (typeof initTooltip === 'function') {
            initTooltip('#crear-contenido-recursos-indice-mount [data-tooltip]');
        }
        bindRecursosIndiceTitleDblClickCapture();
    }

    function recursosRestoreActivePagePreferred(preferredPageKey) {
        var mount = getRecursosIndiceMount();
        if (!mount) return;
        var sel = preferredPageKey
            ? mount.querySelector('.ubits-paginas-creator__item[data-paginas-creator-key="' + preferredPageKey.replace(/"/g, '\\"') + '"]')
            : null;
        if (!sel) {
            sel = mount.querySelector('.ubits-paginas-creator__item');
        }
        if (sel && typeof window.setPaginasCreatorActiveItem === 'function') {
            window.setPaginasCreatorActiveItem(sel);
        }
        syncRecursosRightTitleFromActive();
    }

    function recursosApplySectionsToggleOn() {
        var pages = recursosSerializeSingleSectionFromDom();
        var activePk = '';
        pages.forEach(function (p) {
            if (p.active) activePk = p.pageKey;
        });
        var key = 'cc-sec-' + recursosSectionIdSeq++;
        if (!recursosSectionMeta[key]) recursosSectionMeta[key] = { descriptionHtml: '' };
        pages.forEach(function (p) {
            p.active = false;
        });
        if (pages.length) {
            var pick = activePk || pages[0].pageKey;
            pages.forEach(function (p) {
                p.active = p.pageKey === pick;
            });
        }
        recursosSectionsEnabled = true;
        var sectionsModel = [
            {
                key: key,
                title: 'Sección 1',
                pages: pages,
                active: true
            }
        ];
        recursosMountHtmlAndInit(recursosBuildIndiceMultiHtml(sectionsModel));
        recursosRestoreActivePagePreferred(activePk || (pages[0] && pages[0].pageKey));
        refreshCrearContenidoPageSiguienteState();
    }

    function recursosApplySectionsToggleOff() {
        var merged = recursosMergeAllPagesFromDomInOrder();
        var pages = merged.pages.map(function (p) {
            return {
                pageKey: p.pageKey,
                label: p.label,
                tipo: p.tipo,
                active: false
            };
        });
        if (pages.length) {
            var pick = merged.activePageKey || pages[0].pageKey;
            pages.forEach(function (p) {
                p.active = p.pageKey === pick;
            });
        }
        recursosSectionsEnabled = false;
        recursosMountHtmlAndInit(
            window.indiceCreatorHtml({
                sectionsEnabled: false,
                toggleId: 'crear-contenido-recursos-indice-sections-toggle',
                singleSectionKey: 'crear-contenido-recursos-default',
                singleSection: { pages: pages }
            })
        );
        recursosRestoreActivePagePreferred(merged.activePageKey || (pages[0] && pages[0].pageKey));
        refreshCrearContenidoPageSiguienteState();
    }

    function openDisableSectionsModal() {
        if (typeof window.openModal !== 'function' || typeof window.closeModal !== 'function') return;
        window.openModal({
            overlayId: CC_MODAL_DISABLE_SEC,
            title: 'Deshabilitar secciones',
            bodyHtml:
                '<p class="ubits-body-md-regular" style="margin:0;color:var(--ubits-fg-1-medium);">' +
                'Estás a punto de deshabilitar el uso de secciones; al hacerlo, todas las páginas se moverán a una única sección. ' +
                'Esta acción no se puede deshacer. ¿Estás seguro de deshabilitar las secciones?' +
                '</p>',
            footerHtml:
                '<button type="button" class="ubits-button ubits-button--secondary ubits-button--md" id="cc-mod-disable-cancel"><span>Cancelar</span></button>' +
                '<button type="button" class="ubits-button ubits-button--primary ubits-button--md" id="cc-mod-disable-confirm"><span>Sí, deshabilitar</span></button>',
            size: 'sm',
            closeOnOverlayClick: true
        });
        var ov = document.getElementById(CC_MODAL_DISABLE_SEC);
        if (!ov) return;
        var cancel = ov.querySelector('#cc-mod-disable-cancel');
        var ok = ov.querySelector('#cc-mod-disable-confirm');
        function close() {
            window.closeModal(CC_MODAL_DISABLE_SEC);
        }
        if (cancel) {
            cancel.addEventListener('click', close);
        }
        if (ok) {
            ok.addEventListener('click', function () {
                close();
                recursosApplySectionsToggleOff();
                var tgl = document.getElementById('crear-contenido-recursos-indice-sections-toggle');
                if (tgl) tgl.checked = false;
            });
        }
    }

    function getRteModalBodyFragment() {
        return (
            '<div class="cc-sec-modal-rte-host ubits-rich-text-editor" id="cc-sec-modal-rte-root" data-rich-text-editor>' +
            '<div class="ubits-rich-text-editor__label-row">' +
            '<p class="ubits-rich-text-editor__label ubits-body-sm-semibold">Descripción</p>' +
            '<p class="ubits-rich-text-editor__hint ubits-body-xs-regular">(Opcional)</p>' +
            '</div>' +
            '<div class="ubits-rich-text-editor__toolbar" role="toolbar" aria-label="Formato">' +
            '<button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only" data-rich-cmd="bold" aria-label="Negrita"><i class="fas fa-bold"></i></button>' +
            '<button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only" data-rich-cmd="italic" aria-label="Cursiva"><i class="fas fa-italic"></i></button>' +
            '<button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only" data-rich-cmd="underline" aria-label="Subrayado"><i class="fas fa-underline"></i></button>' +
            '</div>' +
            '<input type="file" class="ubits-rich-text-editor__file" accept="image/*" tabindex="-1" aria-hidden="true">' +
            '<div class="ubits-rich-text-editor__editor-shell">' +
            '<div class="ubits-rich-text-editor__field ubits-body-md-regular is-empty" contenteditable="true" role="textbox" aria-multiline="true" data-placeholder="Descripción de la sección"></div>' +
            '</div></div>'
        );
    }

    function openCrearContenidoEditSectionModal(sectionKey, titleText, descriptionHtml) {
        if (typeof window.openModal !== 'function' || typeof window.closeModal !== 'function') return;
        var sk = String(sectionKey || '');
        var initialTitle = String(titleText != null ? titleText : '').trim();
        var initialDesc = String(descriptionHtml != null ? descriptionHtml : '');
        window.openModal({
            overlayId: CC_MODAL_EDIT_SEC,
            title: 'Editar sección',
            bodyHtml:
                '<div class="cc-sec-modal-fields" style="display:flex;flex-direction:column;gap:var(--gap-lg);">' +
                '<div>' +
                '<label class="ubits-body-sm-semibold" for="cc-sec-modal-title" style="display:block;margin-bottom:var(--gap-sm);color:var(--ubits-fg-1-high);">Título de la sección</label>' +
                '<input type="text" id="cc-sec-modal-title" class="cc-sec-modal-title-input ubits-body-md-regular" maxlength="180" autocomplete="off" aria-required="true" />' +
                '</div>' +
                '<div>' +
                getRteModalBodyFragment() +
                '</div></div>',
            footerHtml:
                '<button type="button" class="ubits-button ubits-button--secondary ubits-button--md" id="cc-sec-modal-cancel"><span>Cancelar</span></button>' +
                '<button type="button" class="ubits-button ubits-button--primary ubits-button--md" id="cc-sec-modal-save" disabled aria-disabled="true"><span>Guardar</span></button>',
            size: 'md',
            closeOnOverlayClick: true
        });
        var ov = document.getElementById(CC_MODAL_EDIT_SEC);
        if (!ov) return;
        var titleInp = ov.querySelector('#cc-sec-modal-title');
        var saveBtn = ov.querySelector('#cc-sec-modal-save');
        var cancelBtn = ov.querySelector('#cc-sec-modal-cancel');
        if (titleInp) titleInp.value = initialTitle;
        var rteRoot = ov.querySelector('#cc-sec-modal-rte-root');
        if (rteRoot) {
            rteRoot.removeAttribute('data-rich-text-initialized');
        }
        if (typeof window.setRichTextHtml === 'function' && rteRoot) {
            window.setRichTextHtml(rteRoot, initialDesc);
        }
        if (typeof window.initRichTextEditor === 'function' && rteRoot) {
            window.initRichTextEditor(rteRoot);
        }
        function currentDescHtml() {
            return typeof window.getRichTextHtml === 'function' && rteRoot
                ? window.getRichTextHtml(rteRoot)
                : '';
        }
        function updateSaveEnabled() {
            var t = titleInp ? String(titleInp.value || '').trim() : '';
            var dirty =
                t !== initialTitle ||
                String(currentDescHtml()).trim() !== String(initialDesc || '').trim();
            if (saveBtn) {
                var valid = t.length > 0;
                saveBtn.disabled = !dirty || !valid;
                saveBtn.setAttribute('aria-disabled', saveBtn.disabled ? 'true' : 'false');
            }
        }
        function closeEdit() {
            window.closeModal(CC_MODAL_EDIT_SEC);
        }
        if (titleInp) {
            titleInp.addEventListener('input', updateSaveEnabled);
        }
        if (rteRoot) {
            var ed = rteRoot.querySelector('.ubits-rich-text-editor__field');
            if (ed) {
                ed.addEventListener('input', updateSaveEnabled);
            }
        }
        updateSaveEnabled();
        if (cancelBtn) cancelBtn.addEventListener('click', closeEdit);
        if (saveBtn) {
            saveBtn.addEventListener('click', function () {
                var t = titleInp ? String(titleInp.value || '').trim() : '';
                if (!t) {
                    if (typeof window.showToast === 'function') {
                        window.showToast('warning', 'El título de la sección es obligatorio.', {
                            containerId: 'ubits-toast-container',
                            duration: 3000
                        });
                    }
                    return;
                }
                var desc = currentDescHtml();
                if (!recursosSectionMeta[sk]) recursosSectionMeta[sk] = {};
                recursosSectionMeta[sk].descriptionHtml = desc;
                var mount = getRecursosIndiceMount();
                var sec = mount && mount.querySelector('.ubits-seccion-creator__section[data-seccion-creator-key="' + sk + '"]');
                var titleSpan = sec && sec.querySelector('.ubits-seccion-creator__title');
                if (titleSpan) titleSpan.textContent = t;
                closeEdit();
            });
        }
    }

    function bindRecursosIndiceTitleDblClickCapture() {
        var mount = getRecursosIndiceMount();
        if (!mount || mount._ccSecDblCapture) return;
        mount._ccSecDblCapture = true;
        mount.addEventListener(
            'dblclick',
            function (e) {
                if (!recursosSectionsEnabled) return;
                if (e.target.closest('.ubits-seccion-creator__title-edit-btn')) return;
                var inner = e.target.closest('.ubits-seccion-creator__title-inner');
                if (!inner || !mount.contains(inner)) return;
                if (e.target.closest('.ubits-seccion-creator__title-edit-wrap')) return;
                e.preventDefault();
                e.stopPropagation();
                var sec = inner.closest('.ubits-seccion-creator__section');
                if (!sec) return;
                var sk = sec.getAttribute('data-seccion-creator-key') || '';
                var tEl = sec.querySelector('.ubits-seccion-creator__title');
                var title = tEl ? String(tEl.textContent || '').trim() : '';
                var meta = recursosSectionMeta[sk] || {};
                openCrearContenidoEditSectionModal(sk, title, meta.descriptionHtml || '');
            },
            true
        );
    }

    function onRecursosIndiceSectionsToggle(ev) {
        var d = ev.detail || {};
        var mount = getRecursosIndiceMount();
        if (!d.root || !mount || !mount.contains(d.root)) return;
        var want = !!d.sectionsEnabled;
        if (want === recursosSectionsEnabled) return;
        if (want) {
            recursosApplySectionsToggleOn();
        } else {
            if (recursosShouldShowDisableSectionsModal()) {
                var tgl2 = document.getElementById('crear-contenido-recursos-indice-sections-toggle');
                if (tgl2) tgl2.checked = true;
                openDisableSectionsModal();
            } else {
                recursosApplySectionsToggleOff();
            }
        }
    }

    function onRecursosIndiceAddSection(ev) {
        var d = ev.detail || {};
        var mount = getRecursosIndiceMount();
        if (!d.root || !mount || !mount.contains(d.root)) return;
        if (!recursosSectionsEnabled) return;
        var model = recursosSerializeSectionsFromDom();
        var n = model.length;
        model.forEach(function (s) {
            s.active = false;
        });
        var newKey = 'cc-sec-' + recursosSectionIdSeq++;
        if (!recursosSectionMeta[newKey]) recursosSectionMeta[newKey] = { descriptionHtml: '' };
        model.push({
            key: newKey,
            title: 'Sección ' + (n + 1),
            pages: [],
            active: true
        });
        recursosMountHtmlAndInit(recursosBuildIndiceMultiHtml(model));
        refreshCrearContenidoPageSiguienteState();
    }

    function onRecursosSeccionCreatorEditSection(ev) {
        var d = ev.detail || {};
        var mount = getRecursosIndiceMount();
        if (!d.section || !mount || !mount.contains(d.section)) return;
        if (!recursosSectionsEnabled) return;
        var sk = d.sectionKey != null ? String(d.sectionKey) : '';
        var meta = recursosSectionMeta[sk] || {};
        openCrearContenidoEditSectionModal(sk, d.title != null ? d.title : '', meta.descriptionHtml || '');
    }

    function getRecursosPaginasList() {
        var m = getRecursosIndiceMount();
        if (!m) return null;
        if (!recursosSectionsEnabled) {
            return m.querySelector('.ubits-paginas-creator');
        }
        var activeSec = m.querySelector('.ubits-seccion-creator__section.is-active');
        if (activeSec) {
            var pl = activeSec.querySelector('.ubits-paginas-creator');
            if (pl) return pl;
        }
        var first = m.querySelector('.ubits-seccion-creator-index__stack .ubits-seccion-creator__section .ubits-paginas-creator');
        return first || m.querySelector('.ubits-paginas-creator');
    }

    function isValidRecursosPageTitle(text) {
        var t = String(text != null ? text : '').trim();
        if (!t) return false;
        if (t.toLowerCase() === 'sin título') return false;
        return true;
    }

    function getRecursosPaginasItemTitleForValidation(item) {
        if (!item) return '';
        if (item.classList.contains('is-active')) {
            var inp = document.getElementById('crear-contenido-recursos-page-title');
            if (inp) return String(inp.value || '').trim();
        }
        var lab = item.querySelector('.ubits-paginas-creator__label');
        return lab ? String(lab.textContent || '').trim() : '';
    }

    function collectRecursosPageTitleValidation() {
        var mount = getRecursosIndiceMount();
        if (!mount) return { allValid: true, invalidItems: [] };
        var items = mount.querySelectorAll('.ubits-paginas-creator__item');
        var invalidItems = [];
        items.forEach(function (item) {
            if (!isValidRecursosPageTitle(getRecursosPaginasItemTitleForValidation(item))) {
                invalidItems.push(item);
            }
        });
        return { allValid: invalidItems.length === 0, invalidItems: invalidItems };
    }

    function clearRecursosTitleValidationVisuals() {
        var mount = getRecursosIndiceMount();
        if (mount) {
            mount.querySelectorAll('.ubits-paginas-creator__item').forEach(function (el) {
                el.classList.remove('ubits-paginas-creator__item--error');
            });
        }
        var wrap = document.querySelector(
            '#crear-contenido-recursos-page-title-section .crear-contenido-recursos__page-title-wrap'
        );
        if (wrap) wrap.classList.remove(PORTADA_INVALID_CLASS);
    }

    function syncRecursosTitleValidationVisuals() {
        clearRecursosTitleValidationVisuals();
        if (!recursosTitlesValidationFlash) return;
        var st = collectRecursosPageTitleValidation();
        st.invalidItems.forEach(function (item) {
            item.classList.add('ubits-paginas-creator__item--error');
        });
        var active = document.querySelector(
            '#crear-contenido-recursos-indice-mount .ubits-paginas-creator__item.is-active'
        );
        if (active && st.invalidItems.indexOf(active) !== -1) {
            var wrap = document.querySelector(
                '#crear-contenido-recursos-page-title-section .crear-contenido-recursos__page-title-wrap'
            );
            if (wrap) wrap.classList.add(PORTADA_INVALID_CLASS);
        }
        if (st.allValid) {
            recursosTitlesValidationFlash = false;
        }
    }

    function clickRecursosSeccionAddPage() {
        var b = document.querySelector(
            '#crear-contenido-recursos-indice-mount .ubits-seccion-creator__add-btn'
        );
        if (b) {
            b.click();
            return true;
        }
        return false;
    }

    function setRecursosEditorVisible(visible) {
        var prev = document.getElementById('crear-contenido-recursos-preview');
        var emptyHost = document.getElementById(CREAR_CONTENIDO_RECURSOS_EMPTY_HOST_ID);
        var titleSec = document.getElementById('crear-contenido-recursos-page-title-section');
        var rb = document.getElementById('crear-contenido-recursos-resources-mount');
        if (!prev || !titleSec || !rb) return;
        if (visible) {
            prev.classList.add('crear-contenido-recursos__preview--editor');
            if (emptyHost) emptyHost.style.display = 'none';
            titleSec.hidden = false;
            titleSec.removeAttribute('hidden');
            rb.hidden = false;
            rb.removeAttribute('hidden');
        } else {
            prev.classList.remove('crear-contenido-recursos__preview--editor');
            if (emptyHost) emptyHost.style.display = '';
            titleSec.hidden = true;
            titleSec.setAttribute('hidden', 'hidden');
            rb.hidden = true;
            rb.setAttribute('hidden', 'hidden');
        }
    }

    function syncRecursosRightTitleFromActive() {
        var activeLabel = document.querySelector(
            '#crear-contenido-recursos-indice-mount .ubits-paginas-creator__item.is-active .ubits-paginas-creator__label'
        );
        var inp = document.getElementById('crear-contenido-recursos-page-title');
        if (inp && activeLabel) inp.value = (activeLabel.textContent || '').trim();
    }

    function syncRecursosActiveLabelFromPageTitleInput() {
        var inp = document.getElementById('crear-contenido-recursos-page-title');
        var label = document.querySelector(
            '#crear-contenido-recursos-indice-mount .ubits-paginas-creator__item.is-active .ubits-paginas-creator__label'
        );
        if (!inp || !label) return;
        var wrap = label.closest('.ubits-paginas-creator__label-wrap');
        if (wrap && wrap.classList.contains('ubits-paginas-creator__label-edit-wrap')) return;
        label.textContent = inp.value != null ? String(inp.value) : '';
    }

    function persistRecursosRightTitleToActiveItem() {
        var inp = document.getElementById('crear-contenido-recursos-page-title');
        var activeLabel = document.querySelector(
            '#crear-contenido-recursos-indice-mount .ubits-paginas-creator__item.is-active .ubits-paginas-creator__label'
        );
        if (!inp || !activeLabel) return;
        activeLabel.textContent = (inp.value || '').trim();
    }

    function renderRecursosResourcesBlock() {
        var mount = document.getElementById('crear-contenido-recursos-resources-mount');
        if (!mount || typeof window.resourcesBlockHtml !== 'function') return;
        mount.innerHTML = window.resourcesBlockHtml({ variant: 'default' });
        if (typeof window.initResourcesBlockFields === 'function') {
            window.initResourcesBlockFields(mount);
        }
    }

    function loadRecursosEmptyPanel() {
        if (typeof window.loadEmptyState !== 'function') return;
        var prev = document.getElementById('crear-contenido-recursos-preview');
        var titleSec = document.getElementById('crear-contenido-recursos-page-title-section');
        var rb = document.getElementById('crear-contenido-recursos-resources-mount');
        if (prev) prev.classList.remove('crear-contenido-recursos__preview--editor');
        if (titleSec) {
            titleSec.hidden = true;
            titleSec.setAttribute('hidden', 'hidden');
        }
        if (rb) {
            rb.innerHTML = '';
            rb.hidden = true;
            rb.setAttribute('hidden', 'hidden');
        }
        var host = document.getElementById(CREAR_CONTENIDO_RECURSOS_EMPTY_HOST_ID);
        if (host) host.style.display = '';
        window.loadEmptyState(CREAR_CONTENIDO_RECURSOS_EMPTY_HOST_ID, {
            icon: 'fa-file',
            title: 'Añade tu primera página',
            description:
                'Agrega páginas para ofrecer a tus estudiantes una experiencia de aprendizaje única. Dentro de las páginas podrás agregar recursos de video, texto, o pdf.',
            buttons: {
                primary: {
                    text: 'Añadir página',
                    icon: 'fa-plus',
                    onClick: function () {
                        if (!clickRecursosSeccionAddPage() && typeof window.showToast === 'function') {
                            window.showToast('info', 'No se pudo abrir el índice. Vuelve a abrir el paso Recursos.', {
                                containerId: 'ubits-toast-container',
                                duration: 2500
                            });
                        }
                    }
                }
            }
        });
        refreshCrearContenidoPageSiguienteState();
    }

    function onRecursosSecAddPage(ev) {
        var d = ev.detail || {};
        var anchor = d.anchor;
        var mount = getRecursosIndiceMount();
        if (!anchor || !mount || !mount.contains(anchor)) return;

        var sec = anchor.closest('.ubits-seccion-creator__section');
        var list = sec ? sec.querySelector('.ubits-paginas-creator') : null;
        if (!list || !mount.contains(list)) {
            list = getRecursosPaginasList();
        }
        if (!list || typeof window.paginasCreatorItemHtml !== 'function') return;

        recursosPageSeq += 1;
        var pageKey = 'cc-pg-' + recursosPageSeq;
        var label = '';

        list.querySelectorAll('.ubits-paginas-creator__item.is-active').forEach(function (el) {
            el.classList.remove('is-active');
            var row = el.querySelector('.ubits-paginas-creator__row');
            if (row) row.removeAttribute('aria-current');
        });

        list.insertAdjacentHTML(
            'beforeend',
            window.paginasCreatorItemHtml({
                label: label,
                tipo: 'blank-page',
                active: true,
                pageKey: pageKey
            })
        );

        var newItem = list.querySelector('.ubits-paginas-creator__item[data-paginas-creator-key="' + pageKey + '"]');
        if (newItem && typeof window.setPaginasCreatorActiveItem === 'function') {
            window.setPaginasCreatorActiveItem(newItem);
        }

        var titInp = document.getElementById('crear-contenido-recursos-page-title');
        if (titInp) titInp.value = '';
        setRecursosEditorVisible(true);
        renderRecursosResourcesBlock();
        if (typeof initTooltip === 'function') {
            initTooltip('#crear-contenido-recursos-indice-mount [data-tooltip]');
        }
        refreshCrearContenidoPageSiguienteState();
    }

    function onRecursosPaginasActivate(ev) {
        var item = ev.detail && ev.detail.item;
        var mount = getRecursosIndiceMount();
        if (!item || !mount || !mount.contains(item)) return;
        syncRecursosRightTitleFromActive();
        renderRecursosResourcesBlock();
        refreshCrearContenidoPageSiguienteState();
    }

    function onRecursosPaginasLabelSave(ev) {
        var d = ev.detail || {};
        var item = d.item;
        var mount = getRecursosIndiceMount();
        if (!item || !mount || !mount.contains(item)) return;
        if (!item.classList.contains('is-active')) return;
        var inp = document.getElementById('crear-contenido-recursos-page-title');
        if (inp) inp.value = d.newLabel != null ? String(d.newLabel) : '';
        refreshCrearContenidoPageSiguienteState();
    }

    function onRecursosPaginasAction(ev) {
        var d = ev.detail || {};
        var item = d.item;
        var mount = getRecursosIndiceMount();
        if (!item || !mount || !mount.contains(item)) return;
        if (d.action === 'mover-arriba' || d.action === 'mover-abajo' || d.action === 'reordenar') {
            if (typeof initTooltip === 'function') {
                initTooltip('#crear-contenido-recursos-indice-mount [data-tooltip]');
            }
            refreshCrearContenidoPageSiguienteState();
            return;
        }
        if (d.action !== 'eliminar') return;
        item.remove();

        var list = getRecursosPaginasList();
        var items = list ? list.querySelectorAll('.ubits-paginas-creator__item') : null;
        if (!list || !items || items.length === 0) {
            setRecursosEditorVisible(false);
            loadRecursosEmptyPanel();
            return;
        }
        var first = list.querySelector('.ubits-paginas-creator__item');
        if (first && typeof window.setPaginasCreatorActiveItem === 'function') {
            window.setPaginasCreatorActiveItem(first);
        }
        syncRecursosRightTitleFromActive();
        renderRecursosResourcesBlock();
        refreshCrearContenidoPageSiguienteState();
    }

    function onRecursosPageTitleFocusOut(ev) {
        if (!ev.target || ev.target.id !== 'crear-contenido-recursos-page-title') return;
        if (!document.getElementById('crear-contenido-root')) return;
        persistRecursosRightTitleToActiveItem();
    }

    function bindRecursosEventsOnce() {
        if (recursosEventsBound) return;
        recursosEventsBound = true;
        document.addEventListener('ubits-seccion-creator-add-page', onRecursosSecAddPage);
        document.addEventListener('ubits-indice-creator-sections-toggle', onRecursosIndiceSectionsToggle);
        document.addEventListener('ubits-indice-creator-add-section', onRecursosIndiceAddSection);
        document.addEventListener('ubits-seccion-creator-edit-section', onRecursosSeccionCreatorEditSection);
        document.addEventListener('ubits-paginas-creator-activate', onRecursosPaginasActivate);
        document.addEventListener('ubits-paginas-creator-action', onRecursosPaginasAction);
        document.addEventListener('ubits-paginas-creator-label-save', onRecursosPaginasLabelSave);
        document.addEventListener('focusout', onRecursosPageTitleFocusOut, true);
        document.addEventListener('input', function (ev) {
            if (!ev.target || ev.target.id !== 'crear-contenido-recursos-page-title') return;
            syncRecursosActiveLabelFromPageTitleInput();
        });
        document.addEventListener('ubits-paginas-creator-label-input', function (ev) {
            var d = ev.detail || {};
            var item = d.item;
            if (!item || !item.classList.contains('is-active')) return;
            var m = getRecursosIndiceMount();
            if (!m || !m.contains(item)) return;
            if (!document.getElementById('crear-contenido-root')) return;
            var inp = document.getElementById('crear-contenido-recursos-page-title');
            if (inp) inp.value = d.value != null ? String(d.value) : '';
        });
    }

    function initCrearContenidoPageRecursosStepOnce() {
        if (recursosUiDone) return;
        recursosUiDone = true;
        recursosPageSeq = 0;
        recursosSectionsEnabled = false;
        recursosSectionIdSeq = 1;
        recursosSectionMeta = {};
        if (typeof window.indiceCreatorHtml === 'function') {
            recursosMountHtmlAndInit(
                window.indiceCreatorHtml({
                    sectionsEnabled: false,
                    toggleId: 'crear-contenido-recursos-indice-sections-toggle',
                    singleSectionKey: 'crear-contenido-recursos-default',
                    singleSection: { pages: [] }
                })
            );
        }
        loadRecursosEmptyPanel();
        bindRecursosEventsOnce();
    }

    function refreshCrearContenidoPageSiguienteState() {
        var btn = document.getElementById('crear-contenido-btn-siguiente');
        if (!btn) return;
        var portada = document.getElementById('crear-contenido-step-portada');
        var onRecursos = portada && !portada.classList.contains('crear-contenido-step--visible');
        if (onRecursos) {
            var list = getRecursosPaginasList();
            var n = list ? list.querySelectorAll(':scope > .ubits-paginas-creator__item').length : 0;
            btn.disabled = n === 0;
            btn.setAttribute('aria-disabled', n === 0 ? 'true' : 'false');
            return;
        }
        var ok = isCrearContenidoPortadaComplete();
        btn.disabled = !ok;
        btn.setAttribute('aria-disabled', ok ? 'false' : 'true');
        syncPortadaInvalidOutline();
    }

    function wireCrearContenidoPageStepperStepClicks() {
        function bindOl(ol) {
            if (!ol) return;
            var steps = ol.querySelectorAll(':scope > li.ubits-stepper__step');
            steps.forEach(function (li, i) {
                li.style.cursor = 'pointer';
                if (li.getAttribute('tabindex') == null) {
                    li.setAttribute('tabindex', '0');
                }
                function go() {
                    if (i === 0) {
                        goToCrearContenidoPageStep(0);
                        return;
                    }
                    if (i === 1) {
                        if (!isCrearContenidoPortadaComplete()) {
                            portadaValidationFlash = true;
                            syncPortadaInvalidOutline();
                            if (typeof window.showToast === 'function') {
                                window.showToast('warning', 'Completa la portada para ir a Recursos.', {
                                    containerId: 'ubits-toast-container',
                                    duration: 3500
                                });
                            }
                            return;
                        }
                        portadaValidationFlash = false;
                        clearPortadaInvalidMarks();
                        goToCrearContenidoPageStep(1);
                        return;
                    }
                    if (typeof window.showToast === 'function') {
                        window.showToast('info', 'Este paso estará disponible pronto.', {
                            containerId: 'ubits-toast-container',
                            duration: 2500
                        });
                    }
                }
                li.addEventListener('click', go);
                li.addEventListener('keydown', function (e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        go();
                    }
                });
            });
        }
        bindOl(document.getElementById('crear-contenido-stepper-ol'));
        bindOl(document.getElementById('crear-contenido-stepper-ol-mobile'));
    }

    function wireCrearContenidoPageInteractionsDeferred() {
        var rte = document.getElementById('crear-contenido-rte-field');
        if (rte) {
            rte.addEventListener('input', function () {
                refreshCrearContenidoPageSiguienteState();
            });
            rte.addEventListener('paste', function () {
                setTimeout(function () {
                    refreshCrearContenidoPageSiguienteState();
                }, 0);
            });
        }
        var titulo = document.getElementById('crear-contenido-titulo');
        if (titulo) {
            titulo.addEventListener('input', function () {
                refreshCrearContenidoPageSiguienteState();
            });
        }
        var portadaStep = document.getElementById('crear-contenido-step-portada');
        if (portadaStep) {
            portadaStep.addEventListener('input', function () {
                refreshCrearContenidoPageSiguienteState();
            });
            portadaStep.addEventListener('change', function () {
                refreshCrearContenidoPageSiguienteState();
            });
        }
        var imgBlock = document.getElementById('crear-contenido-img-trailer');
        if (imgBlock) {
            function portadaBlockHasImageOrTrailerClass(el) {
                var c = (el && el.getAttribute('class')) || '';
                return (
                    c.indexOf('ubits-learn-img-trailer--image') !== -1 ||
                    c.indexOf('ubits-learn-img-trailer--trailer') !== -1
                );
            }
            var lastPortadaMediaState = portadaBlockHasImageOrTrailerClass(imgBlock);
            new MutationObserver(function () {
                var next = portadaBlockHasImageOrTrailerClass(imgBlock);
                if (next === lastPortadaMediaState) return;
                lastPortadaMediaState = next;
                refreshCrearContenidoPageSiguienteState();
            }).observe(imgBlock, { attributes: true, attributeFilter: ['class'] });
        }
        var sig = document.getElementById('crear-contenido-btn-siguiente');
        if (sig) {
            sig.addEventListener('click', function () {
                if (pageCurrentStep === 1) {
                    if (sig.disabled) {
                        if (typeof window.showToast === 'function') {
                            window.showToast('warning', 'Añade al menos una página para continuar.', {
                                containerId: 'ubits-toast-container',
                                duration: 3500
                            });
                        }
                        return;
                    }
                    var st = collectRecursosPageTitleValidation();
                    if (!st.allValid) {
                        recursosTitlesValidationFlash = true;
                        var first = st.invalidItems[0];
                        if (first && typeof window.setPaginasCreatorActiveItem === 'function') {
                            window.setPaginasCreatorActiveItem(first);
                        }
                        syncRecursosRightTitleFromActive();
                        syncRecursosTitleValidationVisuals();
                        var titInp = document.getElementById('crear-contenido-recursos-page-title');
                        if (titInp) titInp.focus();
                        if (typeof window.showToast === 'function') {
                            window.showToast(
                                'warning',
                                'Todas las páginas deben tener un título. Revisa las marcadas en rojo.',
                                {
                                    containerId: 'ubits-toast-container',
                                    duration: 4000
                                }
                            );
                        }
                        return;
                    }
                    recursosTitlesValidationFlash = false;
                    clearRecursosTitleValidationVisuals();
                    if (typeof window.showToast === 'function') {
                        window.showToast('info', 'Siguiente paso disponible próximamente.', {
                            containerId: 'ubits-toast-container',
                            duration: 2500
                        });
                    }
                    return;
                }
                if (pageCurrentStep !== 0) return;
                if (sig.disabled) {
                    portadaValidationFlash = true;
                    syncPortadaInvalidOutline();
                    if (typeof window.showToast === 'function') {
                        window.showToast('warning', 'Completa todos los campos obligatorios de la portada.', {
                            containerId: 'ubits-toast-container',
                            duration: 3500
                        });
                    }
                    return;
                }
                portadaValidationFlash = false;
                clearPortadaInvalidMarks();
                goToCrearContenidoPageStep(1);
            });
        }
        var ant = document.getElementById('crear-contenido-btn-anterior');
        if (ant) {
            ant.addEventListener('click', function () {
                if (pageCurrentStep >= 1) {
                    goToCrearContenidoPageStep(0);
                }
            });
        }
        setTimeout(function () {
            refreshCrearContenidoPageSiguienteState();
        }, 500);
    }

    function initCrearContenidoPage() {
        if (typeof renderSaveIndicator === 'function') {
            renderSaveIndicator('crear-contenido-save-indicator', {
                state: 'idle',
                idleVariant: 'plain',
                size: 'xs'
            });
        }
        if (typeof initTooltip === 'function') {
            initTooltip('#crear-contenido-root [data-tooltip]');
        }
        if (typeof initRichTextEditor === 'function') {
            var rte = document.getElementById('crear-contenido-rte');
            if (rte) initRichTextEditor(rte);
        }
        var imgBlock = document.getElementById('crear-contenido-img-trailer');
        if (imgBlock && typeof initLearnContentImgTrailer === 'function') {
            initLearnContentImgTrailer(imgBlock, {});
        }
        var frame = document.getElementById('crear-contenido-stepper-frame');
        var toggle = document.getElementById('crear-contenido-stepper-toggle');
        if (frame && toggle && typeof wireStepperVerticalCollapse === 'function') {
            wireStepperVerticalCollapse(frame, toggle, { creatorRail: true });
        }
        initFichaInputs();
        wirePortadaCta();
        setTimeout(function () {
            wireCrearContenidoPageInteractionsDeferred();
        }, 0);
        wireCrearContenidoPageStepperStepClicks();
        applyCrearContenidoPageHash();
        window.addEventListener('hashchange', applyCrearContenidoPageHash);
    }

    /** Página dedicada: Portada `#portada`, Recursos `#recursos`. Alias legacy y del drawer documentados en applyCrearContenidoPageHash. */
    var HASH_PAGE_PORTADA = '#portada';
    var HASH_PAGE_RECURSOS = '#recursos';
    var HASH_PAGE_PORTADA_LEGACY = '#crear-contenido';
    var HASH_DRAWER_RECURSOS = '#crear-contenido-recursos';
    var HASH_DRAWER_RECURSOS_ALIAS = '#crear-contenido-step-recursos';

    function isRecursosUrlHash(h) {
        return (
            h === HASH_PAGE_RECURSOS ||
            h === HASH_DRAWER_RECURSOS ||
            h === HASH_DRAWER_RECURSOS_ALIAS
        );
    }

    function updateCrearContenidoPageFooterNav(stepIndex) {
        var ant = document.getElementById('crear-contenido-btn-anterior');
        if (ant) {
            if (stepIndex >= 1) {
                ant.style.display = '';
                ant.removeAttribute('aria-hidden');
                ant.disabled = false;
                ant.setAttribute('aria-disabled', 'false');
            } else {
                ant.style.display = 'none';
                ant.setAttribute('aria-hidden', 'true');
                ant.disabled = true;
                ant.setAttribute('aria-disabled', 'true');
            }
        }
        refreshCrearContenidoPageSiguienteState();
    }

    /**
     * @param {number} stepIndex 0 = Portada, 1 = Recursos
     * @param {{ skipUrl?: boolean }} [opts]
     */
    function goToCrearContenidoPageStep(stepIndex, opts) {
        opts = opts || {};
        var idx = stepIndex >= 1 ? 1 : 0;
        var prevStep = pageCurrentStep;
        pageCurrentStep = idx;
        if (prevStep !== pageCurrentStep) {
            recursosTitlesValidationFlash = false;
            clearRecursosTitleValidationVisuals();
        }
        var portadaEl = document.getElementById('crear-contenido-step-portada');
        var recursosEl = document.getElementById('crear-contenido-step-recursos');
        if (portadaEl) {
            portadaEl.classList.toggle('crear-contenido-step--visible', idx === 0);
        }
        if (recursosEl) {
            recursosEl.classList.toggle('crear-contenido-step--visible', idx === 1);
        }
        if (typeof window.setStepperStepStates === 'function') {
            var olDesk = document.getElementById('crear-contenido-stepper-ol');
            var olMob = document.getElementById('crear-contenido-stepper-ol-mobile');
            if (olDesk) window.setStepperStepStates(olDesk, idx);
            if (olMob) window.setStepperStepStates(olMob, idx);
        }
        if (idx === 1) {
            initCrearContenidoPageRecursosStepOnce();
        }
        updateCrearContenidoPageFooterNav(idx);
        if (typeof window.initTooltip === 'function') {
            window.initTooltip('#crear-contenido-root [data-tooltip]');
        }
        if (!opts.skipUrl) {
            var path = location.pathname + location.search;
            var target = idx >= 1 ? HASH_PAGE_RECURSOS : HASH_PAGE_PORTADA;
            if (location.hash !== target) {
                history.replaceState(null, '', path + target);
            }
        }
    }

    function applyCrearContenidoPageHash() {
        var h = location.hash || '';
        if (isRecursosUrlHash(h)) {
            goToCrearContenidoPageStep(1, { skipUrl: true });
            if (h === HASH_DRAWER_RECURSOS || h === HASH_DRAWER_RECURSOS_ALIAS) {
                var pathR = location.pathname + location.search;
                history.replaceState(null, '', pathR + HASH_PAGE_RECURSOS);
            }
        } else if (h === HASH_PAGE_PORTADA || h === HASH_PAGE_PORTADA_LEGACY || h === '') {
            goToCrearContenidoPageStep(0, { skipUrl: true });
            if (h === HASH_PAGE_PORTADA_LEGACY) {
                var pathP = location.pathname + location.search;
                history.replaceState(null, '', pathP + HASH_PAGE_PORTADA);
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCrearContenidoPage);
    } else {
        initCrearContenidoPage();
    }
})();
