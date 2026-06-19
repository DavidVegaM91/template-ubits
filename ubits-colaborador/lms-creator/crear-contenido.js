/**
 * LMS Creator — Página dedicada crear-contenido.html.
 * Un solo archivo: portada (inputs, RTE, miniatura), hashes URL, paso Recursos (índice + empty + eventos).
 * Lógica del flujo crear contenido (solo esta página; la lista solo enlaza aquí).
 */
(function () {
    'use strict';

    var crearContenidoPortadaTrailerUrl = '';
    /** Último prompt de portada con IA (para reabrir modal en edición). */
    var crearContenidoPortadaLastIaPrompt = '';
    /** 'ai' | 'upload' | null — cómo se aplicó la portada actual (reapertura modal). */
    var crearContenidoPortadaLastSource = null;
    var crearContenidoInputApis = {};
    /** 0 = Portada, 1 = Recursos, 2 = Certificado, 3 = Visibilidad */
    var pageCurrentStep = 0;
    var portadaValidationFlash = false;
    var recursosTitlesValidationFlash = false;
    // Validación progresiva de títulos de páginas (paso Recursos):
    // - No marcamos error al crear una página.
    // - Marcamos error cuando el usuario "deja" una página (cambia a otra) y el título sigue inválido.
    // - También marcamos todas al intentar avanzar al siguiente paso (recursosTitlesValidationFlash).
    var recursosPageTitleTouched = {}; // pageKey -> true (se validó al perder foco / cambio de página)
    var recursosPageResourceTouched = {}; // pageKey -> true (cambio de página con selector sin recurso)
    var recursosResourcesValidationFlash = false;
    var PORTADA_INVALID_CLASS = 'crear-contenido-portada-field--invalid';
    var CATEGORIA_SELECT_PLACEHOLDER_TEXT = 'Selecciona una opción';

    // Portada: CTA «Agregar portada» y «Editar» abren `openPortadaImagenModal` (IA · Subir · Tráiler).
    // ----- FAKE SAVE INDICATOR -----
    var saveIndicatorTimeout;
    function triggerFakeSaveCreator() {
        if (typeof renderSaveIndicator !== 'function') return;
        clearTimeout(saveIndicatorTimeout);
        renderSaveIndicator('crear-contenido-save-indicator', { state: 'saving', size: 'xs', idleVariant: 'plain' });
        saveIndicatorTimeout = setTimeout(function () {
            renderSaveIndicator('crear-contenido-save-indicator', { state: 'saved', size: 'xs', idleVariant: 'plain' });
            setTimeout(function () {
                renderSaveIndicator('crear-contenido-save-indicator', { state: 'idle', size: 'xs', idleVariant: 'plain' });
            }, 2500);
        }, 800);
    }
    window.triggerCrearContenidoFakeSave = triggerFakeSaveCreator;
    
    function wireAutoSave() {
        var debouncedSave;
        function handleInteraction(ev) {
            if (!ev.target || !ev.target.closest) return;
            var isInsideMain = ev.target.closest('#crear-contenido-main') || ev.target.closest('.ubits-modal') || ev.target.closest('.ubits-dropdown-menu');
            if (!isInsideMain) return;
            
            clearTimeout(debouncedSave);
            debouncedSave = setTimeout(triggerFakeSaveCreator, 600);
        }
        
        document.addEventListener('input', handleInteraction);
        document.addEventListener('change', handleInteraction);
        
        // Clics específicos que cambian el estado
        document.addEventListener('click', function(ev) {
            if (!ev.target || !ev.target.closest) return;
            var btn = ev.target.closest('.ubits-button');
            var isCard = ev.target.closest('.ubits-resources-card');
            var isMenuItem = ev.target.closest('.ubits-dropdown-menu__option');
            if (btn || isCard || isMenuItem) {
                handleInteraction(ev);
            }
        });
        
        // Eventos personalizados
        document.addEventListener('ubits-paginas-creator-action', handleInteraction);
        document.addEventListener('ubits-seccion-creator-add-page', handleInteraction);
        // Recursos inyectados / guardados desde paneles o modales (video, evaluación, etc.)
        document.addEventListener('ubits-recursos-changed', function () {
            clearTimeout(debouncedSave);
            debouncedSave = setTimeout(triggerFakeSaveCreator, 0);
        });
    }
    // -------------------------------

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

    function buildPortadaFigureHtml(hasTrailer, figureOpts) {
        figureOpts = figureOpts || {};
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
        var generadoHost = '';
        if (figureOpts.aiGenerated && typeof window.getGeneradoConIaBadgeHtml === 'function') {
            generadoHost =
                '<div class="ubits-learn-img-trailer__generado-ia-host">' +
                window.getGeneradoConIaBadgeHtml() +
                '</div>';
        }
        return (
            '<figure class="ubits-learn-img-trailer__media">' +
            generadoHost +
            '<img class="ubits-learn-img-trailer__img" alt="">' +
            (hasTrailer ? scrim : '') +
            '</figure>'
        );
    }

    function applyPortadaImagenCargada(dataUrl, trailerUrl, loadOpts) {
        loadOpts = loadOpts || {};
        var fromAi = !!loadOpts.fromAi;
        var promptIn = loadOpts.iaPrompt != null ? String(loadOpts.iaPrompt).trim() : '';
        if (!loadOpts.skipMetaUpdate) {
            if (fromAi) {
                crearContenidoPortadaLastSource = 'ai';
                if (promptIn) crearContenidoPortadaLastIaPrompt = promptIn;
            } else {
                crearContenidoPortadaLastIaPrompt = '';
                crearContenidoPortadaLastSource = 'upload';
            }
        }
        var block = document.getElementById('crear-contenido-img-trailer');
        if (!block || !dataUrl) return;
        crearContenidoPortadaTrailerUrl = trailerUrl != null ? String(trailerUrl).trim() : '';
        var hasTrailer = crearContenidoPortadaTrailerUrl.length > 0;
        block.classList.add('ubits-learn-img-trailer--image');
        block.classList.remove('ubits-learn-img-trailer--empty-ia');
        if (hasTrailer) block.classList.add('ubits-learn-img-trailer--trailer');
        else block.classList.remove('ubits-learn-img-trailer--trailer');
        block.classList.remove('ubits-learn-img-trailer--playing');
        block.classList.toggle('ubits-learn-img-trailer--ai-generated', fromAi);
        block.removeAttribute('data-img-trailer-init');
        block.removeAttribute('data-learn-img-trailer-init');
        if (typeof window.getLearnContentImgTrailerEmptyHtml !== 'function' || typeof window.getLearnContentImgTrailerEditHtml !== 'function') return;
        block.innerHTML =
            window.getLearnContentImgTrailerEmptyHtml() +
            buildPortadaFigureHtml(hasTrailer, { aiGenerated: fromAi }) +
            window.getLearnContentImgTrailerEditHtml({ editButtonId: 'crear-contenido-portada-cambiar' });
        var img = block.querySelector('.ubits-learn-img-trailer__img');
        if (img) img.src = dataUrl;
        if (hasTrailer) block.setAttribute('data-trailer-url', crearContenidoPortadaTrailerUrl);
        else block.removeAttribute('data-trailer-url');
        var cambiar = document.getElementById('crear-contenido-portada-cambiar');
        if (cambiar) {
            cambiar.addEventListener('click', function (e) {
                e.preventDefault();
                openCrearContenidoPortadaImagenModal();
            });
        }
        if (typeof window.initLearnContentImgTrailer === 'function') {
            window.initLearnContentImgTrailer(block, {});
        }
        refreshCrearContenidoPageSiguienteState();
    }

    /** Modal único de portada (IA · Subir · Tráiler), mismo para hueco vacío y para «Editar». */
    function openCrearContenidoPortadaImagenModal() {
        if (typeof window.openPortadaImagenModal !== 'function') return;
        var d = getPortadaDataUrl();
        var reopen = {};
        if (d) {
            if (crearContenidoPortadaLastSource === 'ai' && crearContenidoPortadaLastIaPrompt) {
                reopen.editStartTab = 'ia';
                reopen.editIaPrompt = crearContenidoPortadaLastIaPrompt;
                reopen.editIaPreviewSrc = d;
            } else {
                reopen.editStartTab = 'subir';
                reopen.editSubirDataUrl = d;
            }
        }
        window.openPortadaImagenModal({
            initialTrailerUrl: crearContenidoPortadaTrailerUrl,
            onTrailerSaved: function (url) {
                crearContenidoPortadaTrailerUrl = url != null ? String(url).trim() : '';
                var d2 = getPortadaDataUrl();
                if (d2) {
                    applyPortadaImagenCargada(d2, crearContenidoPortadaTrailerUrl, {
                        fromAi: crearContenidoPortadaLastSource === 'ai',
                        iaPrompt: crearContenidoPortadaLastIaPrompt,
                        skipMetaUpdate: true
                    });
                }
            },
            onApply: function (payload) {
                if (!payload || !payload.dataUrl) return;
                var tv =
                    payload.trailerUrl != null && String(payload.trailerUrl).trim() !== ''
                        ? String(payload.trailerUrl).trim()
                        : crearContenidoPortadaTrailerUrl;
                applyPortadaImagenCargada(payload.dataUrl, tv, {
                    fromAi: !!payload.fromAi,
                    iaPrompt: payload.iaPrompt
                });
                triggerFakeSaveCreator();
                clearPortadaInvalidMarks();
            },
            editStartTab: reopen.editStartTab,
            editIaPrompt: reopen.editIaPrompt,
            editIaPreviewSrc: reopen.editIaPreviewSrc,
            editSubirDataUrl: reopen.editSubirDataUrl
        });
    }

    function wirePortadaCta() {
        var cta = document.getElementById('crear-contenido-portada-cta');
        if (!cta || cta._ccPortadaCtaWired) return;
        cta._ccPortadaCtaWired = true;
        cta.addEventListener('click', function (e) {
            e.preventDefault();
            openCrearContenidoPortadaImagenModal();
        });
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
            return c && c.value != null && String(c.value).trim() !== '';
        })[0];
        var defaultCatId = firstRealCat ? String(firstRealCat.value) : '';
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
    var CC_SECTION_TITLE_MIN_LEN = 2;
    var CC_SECTION_TITLE_MAX_LEN = 60;
    var CC_SECTION_TITLE_HELPER_INVALID = 'Mínimo 2 caracteres';
    var CC_MODAL_DELETE_SEC = 'cc-modal-eliminar-seccion';
    var CC_MODAL_DELETE_RECURSO = 'cc-modal-eliminar-recurso';
    var CC_MODAL_DELETE_PAGINA = 'cc-modal-eliminar-pagina';

    /**
     * Persistencia de recursos por página.
     * pageKey -> { html: string, pdfBlobUrl?: string } con el innerHTML del resources-mount
     * y opcionalmente la object URL del PDF local (sesión del navegador).
     * Las páginas de evaluación quedan excluidas (las gestiona evaluaciones-recurso.js).
     */
    var CC_RECURSOS_PAGE_STATE = {};
    /** Clave de la página actualmente visible en el resources-mount. */
    var CC_RECURSOS_CURRENT_PAGE_KEY = null;

    function getRecursosComplementaryMount() {
        return document.getElementById('crear-contenido-recursos-complementary-mount');
    }

    function isRecursosPrimarySelectorVisible(mainMount) {
        if (!mainMount) return true;
        if (mainMount.querySelector('.ubits-resources-block--default')) return true;
        if (mainMount.querySelector('.ubits-resources-block--default-error')) return true;
        if (mainMount.querySelector('.ubits-resources-block__grid')) return true;
        /* Formularios intermedios (video/pdf/embebido vacíos) aún no son recurso principal montado */
        if (mainMount.querySelector('[data-rb-slot]')) return true;
        return false;
    }

    function detectRecursosPrimaryType(mainMount, pageKey) {
        if (!mainMount || isRecursosPrimarySelectorVisible(mainMount)) return null;
        var pk = pageKey != null ? String(pageKey) : '';
        if (pk && isEvalPageKey(pk)) return 'evaluacion-final';
        if (mainMount.querySelector('[data-cc-eval-root], .cc-eval-root')) return 'evaluacion-final';
        if (mainMount.querySelector('.cc-video-resource')) return 'video';
        if (mainMount.querySelector('[data-cc-pdf-js-viewer]')) return 'pdf';
        if (mainMount.querySelector('.cc-scorm-resource')) return 'scorm';
        if (mainMount.querySelector('.cc-embed-resource')) return 'embebido';
        if (mainMount.querySelector('[data-cc-text-resource]')) return 'texto';
        var st = pk ? CC_RECURSOS_PAGE_STATE[pk] : null;
        if (st && st.primaryType) return st.primaryType;
        return null;
    }

    function ensureRecursosPageState(pageKey) {
        var pk = pageKey != null ? String(pageKey) : '';
        if (!pk) return null;
        if (!CC_RECURSOS_PAGE_STATE[pk]) {
            CC_RECURSOS_PAGE_STATE[pk] = {};
        }
        return CC_RECURSOS_PAGE_STATE[pk];
    }

    function clearRecursosComplementaryState(pageKey) {
        var st = ensureRecursosPageState(pageKey);
        if (!st) return;
        st.hasComplementaryText = false;
        st.hasComplementaryDownload = false;
        st.complementaryOrder = [];
        delete st.complementaryMountHtml;
    }

    function syncComplementaryFlagsFromOrder(st) {
        if (!st) return;
        var order = Array.isArray(st.complementaryOrder) ? st.complementaryOrder : [];
        st.hasComplementaryText = order.indexOf('texto') !== -1;
        st.hasComplementaryDownload = order.indexOf('archivo-descargable') !== -1;
    }

    function pushComplementaryToOrder(st, kind) {
        if (!st || !kind) return;
        if (!Array.isArray(st.complementaryOrder)) st.complementaryOrder = [];
        if (st.complementaryOrder.indexOf(kind) === -1) {
            st.complementaryOrder.push(kind);
        }
        syncComplementaryFlagsFromOrder(st);
    }

    function removeComplementaryFromOrder(st, kind) {
        if (!st || !kind) return;
        if (!Array.isArray(st.complementaryOrder)) st.complementaryOrder = [];
        st.complementaryOrder = st.complementaryOrder.filter(function (k) {
            return k !== kind;
        });
        syncComplementaryFlagsFromOrder(st);
    }

    function getComplementaryRenderOrder(st) {
        if (!st) return [];
        var order = Array.isArray(st.complementaryOrder) ? st.complementaryOrder.slice() : [];
        if (!order.length) {
            if (st.hasComplementaryText) order.push('texto');
            if (st.hasComplementaryDownload) order.push('archivo-descargable');
        }
        return order;
    }

    function setRecursosPrimaryType(pageKey, type) {
        var st = ensureRecursosPageState(pageKey);
        if (st) st.primaryType = type != null ? String(type) : null;
        syncRecursosTitleValidationVisuals();
    }

    function initComplementaryFilledFields(compMount) {
        if (!compMount) return;
        if (typeof window.initRichTextEditor === 'function') {
            compMount.querySelectorAll('[data-rich-text-editor]').forEach(function (rteRoot) {
                if (rteRoot.id) {
                    window.initRichTextEditor('#' + rteRoot.id);
                }
            });
        }
        /* File upload complementario: initComplementaryResources → initComplementaryDownloadFileUpload */
    }

    function renderCrearContenidoComplementary() {
        var mainMount = document.getElementById('crear-contenido-recursos-resources-mount');
        var compMount = getRecursosComplementaryMount();
        if (!mainMount || !compMount) return;

        if (mainMount.hidden || isRecursosPrimarySelectorVisible(mainMount)) {
            compMount.hidden = true;
            compMount.setAttribute('hidden', 'hidden');
            compMount.innerHTML = '';
            return;
        }

        var pk = CC_RECURSOS_CURRENT_PAGE_KEY != null ? String(CC_RECURSOS_CURRENT_PAGE_KEY) : '';
        if (!pk) {
            compMount.hidden = true;
            compMount.setAttribute('hidden', 'hidden');
            compMount.innerHTML = '';
            return;
        }

        if (isComplementaryDisabledForPage(mainMount, pk)) {
            clearRecursosComplementaryState(pk);
            hideRecursosComplementaryMount();
            return;
        }

        var primaryType = detectRecursosPrimaryType(mainMount, pk);
        if (primaryType) setRecursosPrimaryType(pk, primaryType);

        var st = ensureRecursosPageState(pk) || {};
        syncComplementaryFlagsFromOrder(st);
        var hasText = st.hasComplementaryText === true;
        var hasDownload = st.hasComplementaryDownload === true;
        var parts = [];
        var safeKey = pk.replace(/[^a-zA-Z0-9_-]/g, '_');
        var renderOrder = getComplementaryRenderOrder(st);

        renderOrder.forEach(function (kind) {
            if (kind === 'texto' && hasText && typeof window.complementaryResourcesTextFilledHtml === 'function') {
                parts.push(
                    window.complementaryResourcesTextFilledHtml({ editorRootId: 'cc-comp-text-' + safeKey })
                );
            }
            if (
                kind === 'archivo-descargable' &&
                hasDownload &&
                typeof window.complementaryResourcesDownloadFilledHtml === 'function'
            ) {
                parts.push(
                    window.complementaryResourcesDownloadFilledHtml({
                        uploadContainerId: 'cc-comp-dl-' + safeKey
                    })
                );
            }
        });

        var inviteVariant =
            typeof window.resolveComplementaryInviteVariant === 'function'
                ? window.resolveComplementaryInviteVariant({
                      primaryType: primaryType || st.primaryType || '',
                      hasText: hasText,
                      hasDownload: hasDownload
                  })
                : null;

        if (inviteVariant && typeof window.complementaryResourcesInviteHtml === 'function') {
            parts.push(window.complementaryResourcesInviteHtml({ variant: inviteVariant }));
        }

        if (!parts.length) {
            compMount.hidden = true;
            compMount.setAttribute('hidden', 'hidden');
            compMount.innerHTML = '';
            return;
        }

        compMount.innerHTML = parts.join('');
        compMount.hidden = false;
        compMount.removeAttribute('hidden');
        if (typeof window.initComplementaryResources === 'function') {
            window.initComplementaryResources(compMount);
        }
        initComplementaryFilledFields(compMount);
    }

    function hideRecursosComplementaryMount() {
        var compMount = getRecursosComplementaryMount();
        if (!compMount) return;
        compMount.hidden = true;
        compMount.setAttribute('hidden', 'hidden');
        compMount.innerHTML = '';
    }

    function revokeRecursosPdfBlobFromState(pageKey) {
        var pk = pageKey != null ? String(pageKey) : '';
        if (!pk) return;
        var st = CC_RECURSOS_PAGE_STATE[pk];
        if (st && st.pdfBlobUrl) {
            try {
                URL.revokeObjectURL(st.pdfBlobUrl);
            } catch (e) {
                /* noop */
            }
        }
    }

    /** Antes de sustituir el mount: no revocar blob del estado (se reutiliza al volver a la página PDF). */
    function beforeReplaceRecursosMountIfPdfShowing(mount) {
        if (!mount || !mount.querySelector('[data-cc-pdf-js-viewer]')) return;
    }

    function ensureRecursosPdfBlobUrl(saved) {
        if (!saved) return '';
        var existing = saved.pdfBlobUrl != null ? String(saved.pdfBlobUrl).trim() : '';
        if (existing.indexOf('blob:') === 0) return existing;
        if (typeof Blob !== 'undefined' && saved.pdfFileBlob instanceof Blob) {
            saved.pdfBlobUrl = URL.createObjectURL(saved.pdfFileBlob);
            return saved.pdfBlobUrl;
        }
        return existing;
    }

    function pdfFileBaseName(fileName) {
        var s = String(fileName || '').trim();
        var dot = s.lastIndexOf('.');
        if (dot <= 0) return s || 'Documento';
        var base = s.slice(0, dot).trim();
        return base || 'Documento';
    }

    /** Shell estable para persistencia (sin canvases): PDF.js pinta en .cc-pdf-resource__pdfjs-pages. */
    function escapeCrearContenidoEmbedAttr(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    /** Heurísticas para URLs publicables (Google Slides, Docs, etc.). */
    function normalizeCrearContenidoEmbedUrl(url) {
        var u = String(url || '').trim();
        if (!u) return u;
        if (u.indexOf('docs.google.com/presentation') !== -1) {
            u = u.replace(/\/edit(\?[^#]*)?(\#.*)?$/i, '/embed$1$2');
            if (u.indexOf('/pub') !== -1 && u.indexOf('/embed') === -1) {
                u = u.replace(/\/pub(\?|#|$)/i, '/embed$1');
            }
        } else if (u.indexOf('docs.google.com/document') !== -1) {
            u = u.replace(/\/edit(\?[^#]*)?(\#.*)?$/i, '/preview$1$2');
        } else if (u.indexOf('drive.google.com/file') !== -1) {
            u = u.replace(/\/view(\?[^#]*)?/i, '/preview$1');
        }
        return u;
    }

    function parseCrearContenidoEmbedInput(raw) {
        var val = String(raw || '').trim();
        if (!val) return null;

        if (/<iframe[\s>]/i.test(val) || /<(?:object|embed)[\s>]/i.test(val)) {
            var cleaned = val.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
            return {
                html:
                    '<div class="cc-embed-resource__raw">' + cleaned + '</div>'
            };
        }

        var url = val;
        if (!/^https?:\/\//i.test(url)) {
            if (/^[\w.-]+\.[a-z]{2,}/i.test(url)) {
                url = 'https://' + url;
            } else {
                return null;
            }
        }
        url = normalizeCrearContenidoEmbedUrl(url);
        return {
            html:
                '<iframe class="cc-embed-resource__iframe" src="' +
                escapeCrearContenidoEmbedAttr(url) +
                '" title="Contenido embebido" loading="lazy" allow="fullscreen; autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>'
        };
    }

    function buildCrearContenidoEmbedResourceHtml(innerHtml) {
        return (
            '<div class="ubits-resources-block ubits-resources-block--stack">' +
            '<div class="ubits-resources-block__surface cc-embed-resource__surface" style="padding:0;">' +
            '<div class="cc-embed-resource" role="region" aria-label="Contenido embebido">' +
            '<div class="cc-embed-resource__frame-wrap">' +
            innerHtml +
            '</div></div></div>' +
            '<div class="ubits-resources-block__footer">' +
            '<button type="button" class="ubits-button ubits-button--error-secondary ubits-button--sm" id="cc-eliminar-recurso">' +
            '<i class="far fa-trash-alt"></i><span>Eliminar</span>' +
            '</button>' +
            '</div></div>'
        );
    }

    function syncRecursosEmbedPageIcon() {
        var activeItem = document.querySelector(
            '#crear-contenido-recursos-indice-mount .ubits-paginas-creator__item.is-active'
        );
        if (!activeItem) return;
        var iconEl = activeItem.querySelector('.ubits-paginas-creator__drag-handle i');
        if (iconEl && typeof window.paginasCreatorIconClass === 'function') {
            iconEl.className = window.paginasCreatorIconClass('embebido');
        }
    }

    function finishCrearContenidoEmbedRender(embedInnerHtml, mount) {
        beforeReplaceRecursosMountIfPdfShowing(mount);
        var html = buildCrearContenidoEmbedResourceHtml(embedInnerHtml);
        mount.innerHTML = html;
        if (CC_RECURSOS_CURRENT_PAGE_KEY) {
            var pkEmb = String(CC_RECURSOS_CURRENT_PAGE_KEY);
            var prevEmb = CC_RECURSOS_PAGE_STATE[pkEmb] || {};
            CC_RECURSOS_PAGE_STATE[pkEmb] = Object.assign({}, prevEmb, { html: html, primaryType: 'embebido' });
        }
        syncRecursosEmbedPageIcon();
        renderCrearContenidoComplementary();
    }

    function syncRecursosCargarButtonFromField(fieldInline, value) {
        if (!fieldInline) return;
        var cargarBtn = fieldInline.querySelector('button');
        if (!cargarBtn) return;
        var hasVal = String(value != null ? value : '').trim() !== '';
        if (hasVal) {
            cargarBtn.classList.remove('ubits-button--secondary');
            cargarBtn.classList.add('ubits-button--primary');
            cargarBtn.disabled = false;
        } else {
            cargarBtn.classList.remove('ubits-button--primary');
            cargarBtn.classList.add('ubits-button--secondary');
            cargarBtn.disabled = true;
        }
    }

    function getRecursosBlockUrlInputValue(fieldInline, slotName) {
        if (!fieldInline) return '';
        var slot = fieldInline.querySelector('[data-rb-slot="' + slotName + '"]');
        if (!slot) return '';
        var field = slot.querySelector('input, textarea');
        return field ? String(field.value || '').trim() : '';
    }

    function buildCrearContenidoPdfViewerShellHtml() {
        return (
            '<div class="ubits-resources-block ubits-resources-block--stack">' +
            '<div class="ubits-resources-block__surface cc-pdf-resource__surface" style="padding:0;">' +
            '<div class="cc-pdf-resource__viewer-wrap cc-pdf-resource__viewer-wrap--pdfjs" data-cc-pdf-js-viewer="1" role="region" aria-label="Vista previa del PDF">' +
            '<p class="cc-pdf-resource__pdfjs-loading ubits-body-sm-regular" aria-live="polite">Cargando vista previa…</p>' +
            '<div class="cc-pdf-resource__pdfjs-pages"></div>' +
            '</div></div>' +
            '<div class="ubits-resources-block__footer">' +
            '<button type="button" class="ubits-button ubits-button--error-secondary ubits-button--sm" id="cc-eliminar-recurso">' +
            '<i class="far fa-trash-alt"></i><span>Eliminar</span>' +
            '</button>' +
            '</div></div>'
        );
    }

    function syncRecursosPdfPageTitle(newTitle) {
        var activeItem = document.querySelector(
            '#crear-contenido-recursos-indice-mount .ubits-paginas-creator__item.is-active'
        );
        if (!activeItem) return;
        var labelEl = activeItem.querySelector('.ubits-paginas-creator__label');
        if (labelEl) labelEl.textContent = newTitle;
        var titleInp = document.getElementById('crear-contenido-recursos-page-title');
        if (titleInp) {
            titleInp.value = newTitle;
            if (typeof window.autoResizeInlineEdit === 'function') {
                window.autoResizeInlineEdit(titleInp);
            }
        }
        var pk = CC_RECURSOS_CURRENT_PAGE_KEY != null ? String(CC_RECURSOS_CURRENT_PAGE_KEY) : '';
        document.dispatchEvent(
            new CustomEvent('ubits-paginas-creator-label-save', {
                bubbles: true,
                detail: { pageKey: pk, newLabel: newTitle }
            })
        );
    }

    function finishCrearContenidoPdfRender(file, mainMount) {
        if (CC_RECURSOS_CURRENT_PAGE_KEY) {
            revokeRecursosPdfBlobFromState(CC_RECURSOS_CURRENT_PAGE_KEY);
        }
        var url = URL.createObjectURL(file);
        var html = buildCrearContenidoPdfViewerShellHtml();
        mainMount.innerHTML = html;
        if (CC_RECURSOS_CURRENT_PAGE_KEY) {
            var pkPdf = String(CC_RECURSOS_CURRENT_PAGE_KEY);
            var prevPdf = CC_RECURSOS_PAGE_STATE[pkPdf] || {};
            CC_RECURSOS_PAGE_STATE[pkPdf] = Object.assign({}, prevPdf, {
                html: html,
                pdfBlobUrl: url,
                pdfFileBlob: file,
                primaryType: 'pdf'
            });
        }
        var viewerRoot = mainMount.querySelector('[data-cc-pdf-js-viewer]');
        if (viewerRoot) {
            viewerRoot.setAttribute('aria-label', 'Vista previa: ' + String(file.name || 'PDF'));
        }
        if (viewerRoot && typeof window.mountCrearContenidoPdfViewer === 'function') {
            window.mountCrearContenidoPdfViewer(viewerRoot, file, { allowNativeFallback: false });
        } else if (viewerRoot) {
            var le = viewerRoot.querySelector('.cc-pdf-resource__pdfjs-loading');
            if (le) {
                le.textContent = 'No se pudo cargar el visor PDF.';
                le.classList.add('cc-pdf-resource__pdfjs-loading--error');
            }
        }
        syncRecursosPdfPageTitle(pdfFileBaseName(file.name));
        var activeItem = document.querySelector(
            '#crear-contenido-recursos-indice-mount .ubits-paginas-creator__item.is-active'
        );
        if (activeItem) {
            var iconEl = activeItem.querySelector('.ubits-paginas-creator__drag-handle i');
            if (iconEl && typeof window.paginasCreatorIconClass === 'function') {
                iconEl.className = window.paginasCreatorIconClass('pdf');
            }
        }
        renderCrearContenidoComplementary();
    }

    function runCrearContenidoPdfUploadProgressAndRender(fuRoot, file, mainMount) {
        if (typeof window.fileUploadSetProgress !== 'function') {
            finishCrearContenidoPdfRender(file, mainMount);
            return;
        }
        window.fileUploadSetProgress(fuRoot, 0);
        var pct = 0;
        var timer = setInterval(function () {
            pct += 14;
            if (pct > 100) pct = 100;
            if (typeof window.fileUploadSetProgress === 'function') {
                window.fileUploadSetProgress(fuRoot, pct);
            }
            if (pct >= 100) {
                clearInterval(timer);
                setTimeout(function () {
                    finishCrearContenidoPdfRender(file, mainMount);
                }, 160);
            }
        }, 65);
    }

    var crearContenidoPdfChangeBound = false;
    function bindCrearContenidoResourcesBlockPdfChangeOnce() {
        if (crearContenidoPdfChangeBound) return;
        crearContenidoPdfChangeBound = true;
        document.addEventListener('ubits-resources-block-pdf-change', function (ev) {
            var mainMount = document.getElementById('crear-contenido-recursos-resources-mount');
            if (!mainMount || !ev.target || !mainMount.contains(ev.target)) return;
            var d = ev.detail || {};
            var file = d.file;
            if (!file) return;
            var cid = d.containerId;
            var fuRoot = cid ? document.getElementById('ubits-fu-' + cid) : null;
            if (!fuRoot) fuRoot = mainMount.querySelector('[data-file-upload]');
            if (!fuRoot) return;
            runCrearContenidoPdfUploadProgressAndRender(fuRoot, file, mainMount);
        });
    }

    /**
     * API pública para que video-recurso-modal.js guarde el HTML del video
     * generado por IA en el estado de la página correspondiente.
     */
    window.ccRecursosSetPageHtml = function (pageKey, html) {
        if (!pageKey) return;
        var key = String(pageKey);
        revokeRecursosPdfBlobFromState(key);
        var prevSet = CC_RECURSOS_PAGE_STATE[key] || {};
        var primaryFromHtml = 'video';
        if (html.indexOf('cc-scorm-resource') !== -1) primaryFromHtml = 'scorm';
        CC_RECURSOS_PAGE_STATE[key] = Object.assign({}, prevSet, { html: html, primaryType: primaryFromHtml });
        /* Si la página activa en el mount es la misma, actualizar el DOM */
        if (CC_RECURSOS_CURRENT_PAGE_KEY === key) {
            var rb = document.getElementById('crear-contenido-recursos-resources-mount');
            if (rb) rb.innerHTML = html;
            renderCrearContenidoComplementary();
        }
    };

    window.renderCrearContenidoComplementary = renderCrearContenidoComplementary;

    function isEvalPageKey(pageKey) {
        return !!(window._ccEvalPageKeys && pageKey && window._ccEvalPageKeys[String(pageKey)]);
    }

    /** Complementary resources no aplican a páginas con recurso Evaluación final. */
    function isComplementaryDisabledForPage(mainMount, pageKey) {
        var pk = pageKey != null ? String(pageKey) : '';
        if (pk && isEvalPageKey(pk)) return true;
        if (mainMount && mainMount.querySelector('[data-cc-eval-root], .cc-eval-root')) return true;
        var detected =
            mainMount && typeof detectRecursosPrimaryType === 'function'
                ? detectRecursosPrimaryType(mainMount, pk)
                : null;
        if (detected === 'evaluacion-final') return true;
        var st = pk ? CC_RECURSOS_PAGE_STATE[pk] : null;
        if (st && String(st.primaryType || '') === 'evaluacion-final') return true;
        return false;
    }

    function readComplementaryOrderFromDom() {
        var compMount = getRecursosComplementaryMount();
        if (!compMount || compMount.hidden) return [];
        var order = [];
        compMount.querySelectorAll('[data-complementary-filled]').forEach(function (el) {
            var kind = el.getAttribute('data-complementary-filled');
            if (kind && order.indexOf(kind) === -1) order.push(kind);
        });
        return order;
    }

    function readComplementaryFlagsFromDom() {
        var order = readComplementaryOrderFromDom();
        return {
            complementaryOrder: order,
            hasComplementaryText: order.indexOf('texto') !== -1,
            hasComplementaryDownload: order.indexOf('archivo-descargable') !== -1
        };
    }

    function snapshotCurrentRecursosPage() {
        var pk = CC_RECURSOS_CURRENT_PAGE_KEY;
        if (!pk) return;
        if (isEvalPageKey(pk)) {
            var prevEval = CC_RECURSOS_PAGE_STATE[pk] || {};
            CC_RECURSOS_PAGE_STATE[pk] = Object.assign({}, prevEval, {
                primaryType: 'evaluacion-final',
                hasComplementaryText: false,
                hasComplementaryDownload: false,
                complementaryOrder: []
            });
            return;
        }
        var compFlags = readComplementaryFlagsFromDom();
        var rb = document.getElementById('crear-contenido-recursos-resources-mount');
        if (!rb) return;
        var prev = CC_RECURSOS_PAGE_STATE[pk] || {};
        var html = rb.innerHTML;
        var pdfBlobUrl = prev.pdfBlobUrl;
        if (pdfBlobUrl && html.indexOf('data-cc-pdf-js-viewer') !== -1) {
            html = buildCrearContenidoPdfViewerShellHtml();
        }
        CC_RECURSOS_PAGE_STATE[pk] = Object.assign({}, prev, compFlags, {
            html: html,
            pdfBlobUrl: pdfBlobUrl,
            pdfFileBlob: prev.pdfFileBlob,
            pdfArrayBuffer: prev.pdfArrayBuffer,
            pdfSourcePath: prev.pdfSourcePath,
            primaryType: prev.primaryType || detectRecursosPrimaryType(rb, pk)
        });
    }

    function resolveRecursosPdfFetchUrl(pathOrBlob) {
        var s = String(pathOrBlob || '').trim();
        if (!s || s.indexOf('blob:') === 0) return s;
        try {
            return new URL(s, window.location.href).href;
        } catch (e) {
            return s;
        }
    }

    function getRecursosPdfMountFallbackUrl(saved) {
        if (saved && saved.pdfSourcePath) return String(saved.pdfSourcePath).trim();
        return './demo-assets/guia-mapa-conflicto.pdf';
    }

    function buildRecursosPdfFileFromBuffer(buf, name) {
        var fileName = name || 'guia-mapa-conflicto.pdf';
        if (typeof File !== 'undefined') {
            return new File([buf], fileName, { type: 'application/pdf' });
        }
        return new Blob([buf], { type: 'application/pdf' });
    }

    /** Bytes del PDF demo embebidos en demo-assets/guia-mapa-conflicto.embed.js (sin fetch). */
    function getCrearContenidoDemoPdfEmbeddedArrayBuffer() {
        if (typeof window.CC_DEMO_PDF_GET_ARRAY_BUFFER === 'function') {
            try {
                return window.CC_DEMO_PDF_GET_ARRAY_BUFFER();
            } catch (e) {
                return null;
            }
        }
        return null;
    }

    function resolveRecursosPdfFileFromSaved(saved) {
        if (!saved) return null;
        if (saved.pdfFileBlob && typeof Blob !== 'undefined' && saved.pdfFileBlob instanceof Blob) {
            return saved.pdfFileBlob;
        }
        if (saved.pdfArrayBuffer) {
            saved.pdfFileBlob = buildRecursosPdfFileFromBuffer(saved.pdfArrayBuffer);
            return saved.pdfFileBlob;
        }
        var embedded = getCrearContenidoDemoPdfEmbeddedArrayBuffer();
        if (embedded && embedded.byteLength) {
            saved.pdfArrayBuffer = embedded;
            saved.pdfFileBlob = buildRecursosPdfFileFromBuffer(embedded);
            return saved.pdfFileBlob;
        }
        return null;
    }

    function mountRecursosPdfViewerWithFile(rb, file) {
        if (!rb || !file) return;
        var vr = rb.querySelector('[data-cc-pdf-js-viewer]');
        if (!vr || typeof window.mountCrearContenidoPdfViewer !== 'function') return;
        /* Igual que subida manual: solo PDF.js (canvas); sin visor nativo del navegador */
        window.mountCrearContenidoPdfViewer(vr, file, { allowNativeFallback: false });
    }

    function mountRecursosPdfViewerFromState(rb, saved) {
        if (!rb || !saved) return;
        var file = resolveRecursosPdfFileFromSaved(saved);
        if (file) {
            mountRecursosPdfViewerWithFile(rb, file);
            return;
        }

        var pathFallback = getRecursosPdfMountFallbackUrl(saved);
        var path = saved.pdfSourcePath != null ? String(saved.pdfSourcePath).trim() : pathFallback;
        var fetchUrl = resolveRecursosPdfFetchUrl(path);
        fetch(fetchUrl)
            .then(function (res) {
                if (!res.ok) throw new Error('pdf-fetch-' + res.status);
                return res.arrayBuffer();
            })
            .then(function (buf) {
                saved.pdfArrayBuffer = buf;
                saved.pdfFileBlob = buildRecursosPdfFileFromBuffer(buf);
                mountRecursosPdfViewerWithFile(rb, saved.pdfFileBlob);
            })
            .catch(function () {
                return loadRecursosPdfBinaryViaXhr(fetchUrl).then(function (buf) {
                    saved.pdfArrayBuffer = buf;
                    saved.pdfFileBlob = buildRecursosPdfFileFromBuffer(buf);
                    mountRecursosPdfViewerWithFile(rb, saved.pdfFileBlob);
                });
            })
            .catch(function () {
                var embedded = getCrearContenidoDemoPdfEmbeddedArrayBuffer();
                if (embedded && embedded.byteLength) {
                    saved.pdfArrayBuffer = embedded;
                    saved.pdfFileBlob = buildRecursosPdfFileFromBuffer(embedded);
                    mountRecursosPdfViewerWithFile(rb, saved.pdfFileBlob);
                    return;
                }
                var vr = rb.querySelector('[data-cc-pdf-js-viewer]');
                var loadingEl = vr && vr.querySelector('.cc-pdf-resource__pdfjs-loading');
                if (loadingEl) {
                    loadingEl.style.display = '';
                    loadingEl.textContent = 'No se pudo mostrar el PDF.';
                    loadingEl.classList.add('cc-pdf-resource__pdfjs-loading--error');
                }
            });
    }

  /** XHR suele funcionar en file:// cuando fetch() no precarga el PDF del demo. */
    function loadRecursosPdfBinaryViaXhr(url) {
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.responseType = 'arraybuffer';
            xhr.onload = function () {
                var ok = xhr.status === 0 || (xhr.status >= 200 && xhr.status < 300);
                if (ok && xhr.response) {
                    resolve(xhr.response);
                } else {
                    reject(new Error('xhr-' + xhr.status));
                }
            };
            xhr.onerror = function () {
                reject(new Error('xhr-error'));
            };
            xhr.send();
        });
    }

    function scheduleMountRecursosPdfViewerFromState(rb, saved) {
        var attempts = 0;
        function tryMount() {
            var vr = rb && rb.querySelector('[data-cc-pdf-js-viewer]');
            if (vr && vr.clientWidth < 8 && attempts < 12) {
                attempts += 1;
                requestAnimationFrame(tryMount);
                return;
            }
            mountRecursosPdfViewerFromState(rb, saved);
        }
        requestAnimationFrame(function () {
            requestAnimationFrame(tryMount);
        });
    }

    function syncRecursosPaginasItemIconForPage(pageKey, tipo) {
        if (!pageKey) return;
        var mount = getRecursosIndiceMount();
        if (!mount) return;
        var item = mount.querySelector('.ubits-paginas-creator__item[data-paginas-creator-key="' + pageKey + '"]');
        if (!item || typeof window.paginasCreatorIconClass !== 'function') return;
        var iconEl = item.querySelector('.ubits-paginas-creator__drag-handle i');
        if (iconEl) iconEl.className = window.paginasCreatorIconClass(tipo);
    }

    function mountRecursosEvalPage(pageKey) {
        if (!isEvalPageKey(pageKey)) return false;
        var rb = document.getElementById('crear-contenido-recursos-resources-mount');
        if (!rb) return false;
        beforeReplaceRecursosMountIfPdfShowing(rb);
        if (typeof window.rcMountEvalForm === 'function') {
            window.rcMountEvalForm(rb);
        }
        syncRecursosPaginasItemIconForPage(pageKey, 'evaluacion');
        hideRecursosComplementaryMount();
        return true;
    }

    function restoreRecursosPage(pageKey) {
        var rb = document.getElementById('crear-contenido-recursos-resources-mount');
        if (!rb) return false;
        var saved = CC_RECURSOS_PAGE_STATE[pageKey];
        if (!saved) return false;
        if (isEvalPageKey(pageKey)) {
            return mountRecursosEvalPage(pageKey);
        }
        if (!saved.html) return false;
        rb.innerHTML = saved.html;
        if (typeof window.initResourcesBlockFields === 'function') {
            window.initResourcesBlockFields(rb);
        }
        scheduleMountRecursosPdfViewerFromState(rb, saved);
        renderCrearContenidoComplementary();
        return true;
    }

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

    function recursosSectionHasDescription(sectionKey) {
        var meta = recursosSectionMeta[sectionKey] || {};
        var html = String(meta.descriptionHtml || '').trim();
        if (!html) return false;
        var tmp = document.createElement('div');
        tmp.innerHTML = html;
        return String(tmp.textContent || '').trim().length > 0;
    }

    function recursosRefreshIndiceFromDom() {
        if (!recursosSectionsEnabled) return;
        var preferredPageKey = CC_RECURSOS_CURRENT_PAGE_KEY;
        var model = recursosSerializeSectionsFromDom();
        recursosMountHtmlAndInit(recursosBuildIndiceMultiHtml(model));
        recursosRestoreActivePagePreferred(preferredPageKey);
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
                hideTitle: false,
                hasDescription: recursosSectionHasDescription(s.key)
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

    function openCrearContenidoDeleteSectionModal(sectionKey) {
        var sk = String(sectionKey || '');
        function runDelete() {
            recursosApplyDeleteSection(sk);
        }
        if (typeof window.openModal !== 'function' || typeof window.closeModal !== 'function') {
            runDelete();
            return;
        }
        window.openModal({
            overlayId: CC_MODAL_DELETE_SEC,
            title: 'Eliminar sección',
            bodyHtml:
                '<p class="ubits-body-md-regular" style="margin:0;color:var(--ubits-fg-1-medium);">' +
                'Estás a punto de eliminar esta sección, <strong class="ubits-body-md-bold">al hacerlo también eliminarás todas las páginas que esta contenga</strong>, esta acción no se puede deshacer, ¿estás seguro de eliminarla?' +
                '</p>',
            footerHtml:
                '<button type="button" class="ubits-button ubits-button--secondary ubits-button--md" id="cc-mod-delete-sec-cancel"><span>Cancelar</span></button>' +
                '<button type="button" class="ubits-button ubits-button--error ubits-button--md" id="cc-mod-delete-sec-confirm"><span>Sí, eliminar</span></button>',
            size: 'sm',
            closeOnOverlayClick: true
        });
        var ov = document.getElementById(CC_MODAL_DELETE_SEC);
        if (!ov) return;
        var cancel = ov.querySelector('#cc-mod-delete-sec-cancel');
        var ok = ov.querySelector('#cc-mod-delete-sec-confirm');
        function close() {
            window.closeModal(CC_MODAL_DELETE_SEC);
        }
        if (cancel) {
            cancel.addEventListener('click', close);
        }
        if (ok) {
            ok.addEventListener('click', function () {
                close();
                runDelete();
            });
        }
    }

    function recursosApplyDeletePage(item) {
        if (!item || !item.parentNode) return;
        var deletedKey = item.getAttribute('data-paginas-creator-key');
        if (deletedKey) {
            var pageState = CC_RECURSOS_PAGE_STATE[deletedKey];
            if (
                pageState &&
                pageState.html &&
                typeof window.ccGenWidget !== 'undefined' &&
                typeof window.ccGenWidget.markJobDeletedForPage === 'function'
            ) {
                if (pageState.html.indexOf('cc-scorm-resource') !== -1) {
                    window.ccGenWidget.markJobDeletedForPage(deletedKey, 'scorm');
                } else if (pageState.html.indexOf('cc-video-resource') !== -1) {
                    window.ccGenWidget.markJobDeletedForPage(deletedKey, 'video');
                }
            }
            delete CC_RECURSOS_PAGE_STATE[deletedKey];
            delete recursosPageTitleTouched[deletedKey];
            if (CC_RECURSOS_CURRENT_PAGE_KEY === deletedKey) {
                CC_RECURSOS_CURRENT_PAGE_KEY = null;
            }
        }
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
        refreshCrearContenidoPageSiguienteState();
        syncRecursosTitleValidationVisuals();
    }

    function openCrearContenidoDeletePageModal(item) {
        function runDelete() {
            recursosApplyDeletePage(item);
        }
        if (typeof window.openModal !== 'function' || typeof window.closeModal !== 'function') {
            runDelete();
            return;
        }
        window.openModal({
            overlayId: CC_MODAL_DELETE_PAGINA,
            title: 'Eliminar página',
            bodyHtml:
                '<p class="ubits-body-md-regular" style="margin:0;color:var(--ubits-fg-1-medium);">' +
                '¿Seguro que deseas eliminar esta página? Al hacerlo se perderán todos los recursos que esta contenga.' +
                '</p>',
            footerHtml:
                '<button type="button" class="ubits-button ubits-button--secondary ubits-button--md" id="cc-mod-delete-pagina-cancel"><span>Cancelar</span></button>' +
                '<button type="button" class="ubits-button ubits-button--error ubits-button--md" id="cc-mod-delete-pagina-confirm"><span>Sí, eliminar</span></button>',
            size: 'sm',
            closeOnOverlayClick: true
        });
        var ov = document.getElementById(CC_MODAL_DELETE_PAGINA);
        if (!ov) return;
        var cancel = ov.querySelector('#cc-mod-delete-pagina-cancel');
        var ok = ov.querySelector('#cc-mod-delete-pagina-confirm');
        function close() {
            window.closeModal(CC_MODAL_DELETE_PAGINA);
        }
        if (cancel) {
            cancel.addEventListener('click', close);
        }
        if (ok) {
            ok.addEventListener('click', function () {
                close();
                runDelete();
            });
        }
    }

    function recursosApplyDeleteCurrentResource(mount) {
        if (!mount) return;
        beforeReplaceRecursosMountIfPdfShowing(mount);
        if (
            CC_RECURSOS_CURRENT_PAGE_KEY &&
            typeof window.ccGenWidget !== 'undefined' &&
            typeof window.ccGenWidget.markJobDeletedForPage === 'function'
        ) {
            var mountHtml = mount.innerHTML;
            if (mountHtml.indexOf('cc-scorm-resource') !== -1) {
                window.ccGenWidget.markJobDeletedForPage(CC_RECURSOS_CURRENT_PAGE_KEY, 'scorm');
            } else if (mountHtml.indexOf('cc-video-resource') !== -1) {
                window.ccGenWidget.markJobDeletedForPage(CC_RECURSOS_CURRENT_PAGE_KEY, 'video');
            }
        }
        if (CC_RECURSOS_CURRENT_PAGE_KEY) {
            delete CC_RECURSOS_PAGE_STATE[CC_RECURSOS_CURRENT_PAGE_KEY];
        }
        mount.innerHTML = window.resourcesBlockHtml({ variant: 'default' });
        if (typeof window.initResourcesBlockFields === 'function') {
            window.initResourcesBlockFields(mount);
        }
        hideRecursosComplementaryMount();
        var activeItemDel = document.querySelector(
            '#crear-contenido-recursos-indice-mount .ubits-paginas-creator__item.is-active'
        );
        if (activeItemDel) {
            var iconElDel = activeItemDel.querySelector('.ubits-paginas-creator__drag-handle i');
            if (iconElDel && typeof window.paginasCreatorIconClass === 'function') {
                iconElDel.className = window.paginasCreatorIconClass('blank-page');
            }
        }
    }

    function openCrearContenidoDeleteResourceModal(mount) {
        function runDelete() {
            recursosApplyDeleteCurrentResource(mount);
        }
        if (typeof window.openModal !== 'function' || typeof window.closeModal !== 'function') {
            runDelete();
            return;
        }
        window.openModal({
            overlayId: CC_MODAL_DELETE_RECURSO,
            title: 'Eliminar recurso',
            bodyHtml:
                '<p class="ubits-body-md-regular" style="margin:0;color:var(--ubits-fg-1-medium);">' +
                '¿Seguro que deseas eliminar este recurso? La página quedará en blanco.' +
                '</p>',
            footerHtml:
                '<button type="button" class="ubits-button ubits-button--secondary ubits-button--md" id="cc-mod-delete-recurso-cancel"><span>Cancelar</span></button>' +
                '<button type="button" class="ubits-button ubits-button--error ubits-button--md" id="cc-mod-delete-recurso-confirm"><span>Sí, eliminar</span></button>',
            size: 'sm',
            closeOnOverlayClick: true
        });
        var ov = document.getElementById(CC_MODAL_DELETE_RECURSO);
        if (!ov) return;
        var cancel = ov.querySelector('#cc-mod-delete-recurso-cancel');
        var ok = ov.querySelector('#cc-mod-delete-recurso-confirm');
        function close() {
            window.closeModal(CC_MODAL_DELETE_RECURSO);
        }
        if (cancel) {
            cancel.addEventListener('click', close);
        }
        if (ok) {
            ok.addEventListener('click', function () {
                close();
                runDelete();
            });
        }
    }

    function recursosApplyDeleteSection(sectionKey) {
        var sk = String(sectionKey || '');
        var model = recursosSerializeSectionsFromDom();
        if (model.length <= 1) return;

        var removed = null;
        model = model.filter(function (s) {
            if (s.key === sk) {
                removed = s;
                return false;
            }
            return true;
        });
        if (!removed) return;

        snapshotCurrentRecursosPage();

        (removed.pages || []).forEach(function (p) {
            var pk = p.pageKey;
            if (!pk) return;
            delete CC_RECURSOS_PAGE_STATE[pk];
            delete recursosPageTitleTouched[pk];
            if (CC_RECURSOS_CURRENT_PAGE_KEY === pk) {
                CC_RECURSOS_CURRENT_PAGE_KEY = null;
            }
        });
        delete recursosSectionMeta[sk];

        var deletedWasActiveSection = !!removed.active;
        var hasActiveSection = model.some(function (s) {
            return s.active;
        });
        if (deletedWasActiveSection || !hasActiveSection) {
            model.forEach(function (s) {
                s.active = false;
            });
            if (model.length) model[0].active = true;
        }

        var activePageKey = '';
        model.forEach(function (s) {
            (s.pages || []).forEach(function (p) {
                if (p.active) activePageKey = p.pageKey;
            });
        });

        var activePageInRemaining = false;
        if (activePageKey) {
            model.forEach(function (s) {
                (s.pages || []).forEach(function (p) {
                    if (p.pageKey === activePageKey) activePageInRemaining = true;
                });
            });
        }

        if (!activePageInRemaining) {
            model.forEach(function (s) {
                (s.pages || []).forEach(function (p) {
                    p.active = false;
                });
            });
            var activeSec =
                model.find(function (s) {
                    return s.active;
                }) || model[0];
            if (activeSec && activeSec.pages && activeSec.pages.length) {
                activeSec.pages[0].active = true;
                activePageKey = activeSec.pages[0].pageKey;
            } else {
                activePageKey = '';
            }
        }

        recursosMountHtmlAndInit(recursosBuildIndiceMultiHtml(model));

        if (activePageKey) {
            recursosRestoreActivePagePreferred(activePageKey);
            setRecursosEditorVisible(true);
        } else {
            CC_RECURSOS_CURRENT_PAGE_KEY = null;
            setRecursosEditorVisible(false);
            loadRecursosEmptyPanel();
        }

        refreshCrearContenidoPageSiguienteState();
        syncRecursosTitleValidationVisuals();
    }

    function getRteModalBodyFragment() {
        var toolbarHtml =
            typeof window.richTextEditorToolbarAndFileInputHtml === 'function'
                ? window.richTextEditorToolbarAndFileInputHtml()
                : '';
        return (
            '<div class="contenidos-creator-card contenidos-creator-card--descripcion">' +
            '<div id="cc-sec-modal-rte-root" class="ubits-rich-text-editor" data-rich-text-editor>' +
            '<div class="ubits-rich-text-editor__label-row">' +
            '<p class="ubits-rich-text-editor__label ubits-body-sm-semibold">Descripción</p>' +
            '<p class="ubits-rich-text-editor__hint ubits-body-xs-regular">(Opcional)</p>' +
            '</div>' +
            toolbarHtml +
            '<div class="ubits-rich-text-editor__editor-shell">' +
            '<div class="ubits-rich-text-editor__field ubits-body-md-regular is-empty" contenteditable="true" role="textbox" aria-multiline="true" data-placeholder="Añade una descripción para la sección aquí"></div>' +
            '</div></div></div>'
        );
    }

    function isCcSectionTitleValid(raw) {
        return String(raw || '').trim().length >= CC_SECTION_TITLE_MIN_LEN;
    }

    function syncCcEditSecTitleInputChrome(overlayEl, valid, titleInputApi) {
        var mount = overlayEl && overlayEl.querySelector('#cc-sec-modal-title-mount');
        if (!mount || !titleInputApi || typeof titleInputApi.setState !== 'function') return;
        if (!valid) {
            titleInputApi.setState('invalid');
            var helperTextEl = mount.querySelector('.ubits-input-helper-text');
            if (helperTextEl) helperTextEl.textContent = CC_SECTION_TITLE_HELPER_INVALID;
        } else {
            titleInputApi.setState('default');
        }
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
                '<div id="cc-sec-modal-title-mount"></div>' +
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
        var saveBtn = ov.querySelector('#cc-sec-modal-save');
        var cancelBtn = ov.querySelector('#cc-sec-modal-cancel');
        var titleInputApi = null;
        if (typeof window.createInput === 'function') {
            titleInputApi = window.createInput({
                containerId: 'cc-sec-modal-title-mount',
                label: 'Título de la sección',
                placeholder: 'Escribe el título de la sección',
                size: 'md',
                mandatory: true,
                mandatoryType: 'obligatorio',
                showHelper: false,
                showCounter: true,
                maxLength: CC_SECTION_TITLE_MAX_LEN,
                value: initialTitle,
                onChange: function () {
                    syncCcEditSecModalForm();
                }
            });
        }
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
        function syncCcEditSecModalForm() {
            var t = titleInputApi ? String(titleInputApi.getValue() || '') : '';
            var trimmed = t.trim();
            var valid = isCcSectionTitleValid(t);
            var dirty =
                trimmed !== initialTitle ||
                String(currentDescHtml()).trim() !== String(initialDesc || '').trim();
            syncCcEditSecTitleInputChrome(ov, valid, titleInputApi);
            if (saveBtn) {
                saveBtn.disabled = !dirty || !valid;
                saveBtn.setAttribute('aria-disabled', saveBtn.disabled ? 'true' : 'false');
            }
        }
        function closeEdit() {
            window.closeModal(CC_MODAL_EDIT_SEC);
        }
        if (rteRoot) {
            var ed = rteRoot.querySelector('.ubits-rich-text-editor__field');
            if (ed) {
                ed.addEventListener('input', syncCcEditSecModalForm);
            }
        }
        syncCcEditSecModalForm();
        if (cancelBtn) cancelBtn.addEventListener('click', closeEdit);
        if (saveBtn) {
            saveBtn.addEventListener('click', function () {
                var t = titleInputApi ? String(titleInputApi.getValue() || '').trim() : '';
                if (!isCcSectionTitleValid(t)) {
                    syncCcEditSecModalForm();
                    return;
                }
                var desc = currentDescHtml();
                if (!recursosSectionMeta[sk]) recursosSectionMeta[sk] = {};
                recursosSectionMeta[sk].descriptionHtml = desc;
                closeEdit();
                // Persistir título: recursosRefreshIndiceFromDom solo re-lee el DOM (título viejo).
                var preferredPageKey = CC_RECURSOS_CURRENT_PAGE_KEY;
                var model = recursosSerializeSectionsFromDom();
                model.forEach(function (s) {
                    if (s.key === sk) {
                        s.title = t;
                    }
                });
                recursosMountHtmlAndInit(recursosBuildIndiceMultiHtml(model));
                recursosRestoreActivePagePreferred(preferredPageKey);
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
        var titleEl = d.section.querySelector('.ubits-seccion-creator__title');
        var title =
            d.title != null
                ? String(d.title)
                : titleEl
                  ? String(titleEl.textContent || '').trim()
                  : '';
        var meta = recursosSectionMeta[sk] || {};
        openCrearContenidoEditSectionModal(sk, title, meta.descriptionHtml || '');
    }

    function onRecursosSeccionCreatorSectionAction(ev) {
        var d = ev.detail || {};
        var action = d.action != null ? String(d.action) : '';
        var mount = getRecursosIndiceMount();
        if (!d.section || !mount || !mount.contains(d.section)) return;
        if (!recursosSectionsEnabled) return;

        if (action === 'seccion-mover-arriba' || action === 'seccion-mover-abajo') {
            if (typeof initTooltip === 'function') {
                initTooltip('#crear-contenido-recursos-indice-mount [data-tooltip]');
            }
            return;
        }

        if (action !== 'seccion-eliminar') return;

        var model = recursosSerializeSectionsFromDom();
        if (model.length <= 1) {
            if (typeof showToast === 'function') {
                showToast('warning', 'Debe haber al menos una sección.');
            }
            return;
        }

        var sk = d.sectionKey != null ? String(d.sectionKey) : '';
        openCrearContenidoDeleteSectionModal(sk);
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

    function recursosPageHasResource(pageKey) {
        var pk = pageKey != null ? String(pageKey) : '';
        if (!pk) return false;
        if (isEvalPageKey(pk)) return true;
        var st = CC_RECURSOS_PAGE_STATE[pk];
        if (!st) return false;
        var pt = st.primaryType;
        return pt != null && String(pt).trim() !== '';
    }

    function collectRecursosPageResourceValidation() {
        var mount = getRecursosIndiceMount();
        if (!mount) return { allValid: true, invalidItems: [] };
        var items = mount.querySelectorAll('.ubits-paginas-creator__item');
        var invalidItems = [];
        items.forEach(function (item) {
            var key = item.getAttribute('data-paginas-creator-key') || '';
            if (!recursosPageHasResource(key)) invalidItems.push(item);
        });
        return { allValid: invalidItems.length === 0, invalidItems: invalidItems };
    }

    function collectRecursosEmptySectionValidation() {
        if (!recursosSectionsEnabled) return { allValid: true, invalidSections: [] };
        var mount = getRecursosIndiceMount();
        if (!mount) return { allValid: true, invalidSections: [] };
        var invalidSections = [];
        mount.querySelectorAll('.ubits-seccion-creator__section').forEach(function (sec) {
            var n = sec.querySelectorAll('.ubits-paginas-creator__item').length;
            if (n === 0) invalidSections.push(sec);
        });
        return { allValid: invalidSections.length === 0, invalidSections: invalidSections };
    }

    function clearRecursosTitleValidationVisuals() {
        var mount = getRecursosIndiceMount();
        if (mount) {
            mount.querySelectorAll('.ubits-paginas-creator__item').forEach(function (el) {
                el.classList.remove('ubits-paginas-creator__item--error');
            });
            mount.querySelectorAll('.ubits-seccion-creator__section').forEach(function (el) {
                el.classList.remove('ubits-seccion-creator__section--error');
            });
        }
        var wrap = document.querySelector(
            '#crear-contenido-recursos-page-title-section .crear-contenido-recursos__page-title-wrap'
        );
        if (wrap) wrap.classList.remove(PORTADA_INVALID_CLASS);
    }

    function shouldShowRecursosResourcesBlockError(pageKey) {
        var pk = pageKey != null ? String(pageKey) : '';
        if (!pk || isEvalPageKey(pk) || recursosPageHasResource(pk)) return false;
        if (recursosResourcesValidationFlash) return true;
        return !!recursosPageResourceTouched[pk];
    }

    function syncRecursosActiveResourcesBlockVariant() {
        var pk = CC_RECURSOS_CURRENT_PAGE_KEY != null ? String(CC_RECURSOS_CURRENT_PAGE_KEY) : '';
        if (!pk || isEvalPageKey(pk)) return;
        var mount = document.getElementById('crear-contenido-recursos-resources-mount');
        if (!mount || mount.hidden) return;
        if (!isRecursosPrimarySelectorVisible(mount)) return;
        var needError = shouldShowRecursosResourcesBlockError(pk);
        var hasError = !!mount.querySelector('.ubits-resources-block--default-error');
        if (needError && !hasError) {
            renderRecursosResourcesBlock({ variant: 'default-error' });
        } else if (!needError && hasError) {
            renderRecursosResourcesBlock({ variant: 'default' });
        }
    }

    function syncRecursosTitleValidationVisuals() {
        clearRecursosTitleValidationVisuals();
        var mount = getRecursosIndiceMount();
        if (!mount) return;

        var items = mount.querySelectorAll('.ubits-paginas-creator__item');
        var invalidTitleItems = [];

        if (recursosTitlesValidationFlash) {
            invalidTitleItems = collectRecursosPageTitleValidation().invalidItems;
        } else {
            items.forEach(function (item) {
                var key = item.getAttribute('data-paginas-creator-key') || '';
                if (!recursosPageTitleTouched[key]) return;
                if (!isValidRecursosPageTitle(getRecursosPaginasItemTitleForValidation(item))) {
                    invalidTitleItems.push(item);
                }
            });
        }

        var invalidResourceItems = [];
        if (recursosResourcesValidationFlash) {
            invalidResourceItems = collectRecursosPageResourceValidation().invalidItems;
        } else {
            items.forEach(function (item) {
                var key = item.getAttribute('data-paginas-creator-key') || '';
                if (!recursosPageResourceTouched[key]) return;
                if (!recursosPageHasResource(key)) invalidResourceItems.push(item);
            });
        }

        var invalidItems = invalidTitleItems.slice();
        invalidResourceItems.forEach(function (item) {
            if (invalidItems.indexOf(item) === -1) invalidItems.push(item);
        });

        invalidItems.forEach(function (item) {
            item.classList.add('ubits-paginas-creator__item--error');
        });

        if (recursosResourcesValidationFlash) {
            var sectionSt = collectRecursosEmptySectionValidation();
            sectionSt.invalidSections.forEach(function (sec) {
                sec.classList.add('ubits-seccion-creator__section--error');
            });
        }

        var active = document.querySelector(
            '#crear-contenido-recursos-indice-mount .ubits-paginas-creator__item.is-active'
        );
        if (active && invalidTitleItems.indexOf(active) !== -1) {
            var wrap = document.querySelector(
                '#crear-contenido-recursos-page-title-section .crear-contenido-recursos__page-title-wrap'
            );
            if (wrap) wrap.classList.add(PORTADA_INVALID_CLASS);
        }

        if (recursosTitlesValidationFlash && invalidTitleItems.length === 0) {
            recursosTitlesValidationFlash = false;
        }
        if (recursosResourcesValidationFlash && invalidResourceItems.length === 0) {
            var emptySec = collectRecursosEmptySectionValidation();
            if (emptySec.allValid) recursosResourcesValidationFlash = false;
        }

        syncRecursosActiveResourcesBlockVariant();
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

    function recursosIndiceHasPages() {
        var mount = getRecursosIndiceMount();
        return !!(mount && mount.querySelector('.ubits-paginas-creator__item'));
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
            
            var inp = document.getElementById('crear-contenido-recursos-page-title');
            if (inp && typeof window.autoResizeInlineEdit === 'function') {
                window.autoResizeInlineEdit(inp);
            }
        } else {
            prev.classList.remove('crear-contenido-recursos__preview--editor');
            if (emptyHost) emptyHost.style.display = '';
            titleSec.hidden = true;
            titleSec.setAttribute('hidden', 'hidden');
            rb.hidden = true;
            rb.setAttribute('hidden', 'hidden');
        }
        syncRecursosPageCounter();
    }

    function getRecursosActivePageList() {
        var mount = getRecursosIndiceMount();
        if (!mount) return null;
        var activeItem = mount.querySelector('.ubits-paginas-creator__item.is-active');
        if (activeItem) {
            var listFromItem = activeItem.closest('.ubits-paginas-creator');
            if (listFromItem && mount.contains(listFromItem)) return listFromItem;
        }
        if (!recursosSectionsEnabled) {
            return (
                mount.querySelector('.ubits-indice-creator__single-wrap .ubits-paginas-creator') ||
                mount.querySelector('.ubits-paginas-creator')
            );
        }
        var activeSec = mount.querySelector('.ubits-seccion-creator__section.is-active');
        if (activeSec) {
            var pl = activeSec.querySelector('.ubits-paginas-creator');
            if (pl) return pl;
        }
        return mount.querySelector('.ubits-paginas-creator');
    }

    function syncRecursosPageCounter() {
        var counter = document.getElementById('crear-contenido-recursos-page-counter');
        var titleSec = document.getElementById('crear-contenido-recursos-page-title-section');
        if (!counter) return;
        if (!titleSec || titleSec.hidden) {
            counter.hidden = true;
            counter.setAttribute('hidden', 'hidden');
            counter.textContent = '';
            return;
        }
        var list = getRecursosActivePageList();
        var activeItem = list ? list.querySelector(':scope > .ubits-paginas-creator__item.is-active') : null;
        if (!list || !activeItem) {
            counter.hidden = true;
            counter.setAttribute('hidden', 'hidden');
            counter.textContent = '';
            return;
        }
        var items = list.querySelectorAll(':scope > .ubits-paginas-creator__item');
        var index = 0;
        var total = items.length;
        for (var i = 0; i < items.length; i++) {
            if (items[i] === activeItem) {
                index = i + 1;
                break;
            }
        }
        if (!index || !total) {
            counter.hidden = true;
            counter.setAttribute('hidden', 'hidden');
            counter.textContent = '';
            return;
        }
        counter.textContent = 'Página ' + index + ' de ' + total;
        counter.hidden = false;
        counter.removeAttribute('hidden');
    }

    function syncRecursosRightTitleFromActive() {
        var activeLabel = document.querySelector(
            '#crear-contenido-recursos-indice-mount .ubits-paginas-creator__item.is-active .ubits-paginas-creator__label'
        );
        var inp = document.getElementById('crear-contenido-recursos-page-title');
        if (inp && activeLabel) {
            inp.value = (activeLabel.textContent || '').trim();
            if (typeof window.autoResizeInlineEdit === 'function') {
                window.autoResizeInlineEdit(inp);
            }
        }
        syncRecursosPageCounter();
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

    function persistRecursosRightTitleToItemKey(pageKey) {
        var key = pageKey != null ? String(pageKey) : '';
        if (!key) return;
        var inp = document.getElementById('crear-contenido-recursos-page-title');
        if (!inp) return;
        var label = document.querySelector(
            '#crear-contenido-recursos-indice-mount .ubits-paginas-creator__item[data-paginas-creator-key="' +
                key +
                '"] .ubits-paginas-creator__label'
        );
        if (!label) return;
        var wrap = label.closest('.ubits-paginas-creator__label-wrap');
        if (wrap && wrap.classList.contains('ubits-paginas-creator__label-edit-wrap')) return;
        label.textContent = (inp.value || '').trim();
    }

    function renderRecursosResourcesBlock(opts) {
        opts = opts || {};
        var variant = opts.variant === 'default-error' ? 'default-error' : 'default';
        var mount = document.getElementById('crear-contenido-recursos-resources-mount');
        if (!mount || typeof window.resourcesBlockHtml !== 'function') return;
        mount.innerHTML = window.resourcesBlockHtml({ variant: variant });
        if (typeof window.initResourcesBlockFields === 'function') {
            window.initResourcesBlockFields(mount);
        }
        hideRecursosComplementaryMount();
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
        hideRecursosComplementaryMount();
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

        var nextPageKey = ev.detail && ev.detail.pageKey != null ? String(ev.detail.pageKey) : null;

        // Antes de salir de la página actual, persistir su título (si estaba editándose)
        // y hacer validación progresiva al perder foco.
        var prevKey = CC_RECURSOS_CURRENT_PAGE_KEY != null ? String(CC_RECURSOS_CURRENT_PAGE_KEY) : null;
        if (prevKey) {
            // Ojo: el evento ubits-paginas-creator-activate se emite DESPUÉS de cambiar el .is-active,
            // así que NO podemos persistir al "active" actual (sería la página nueva). Persistimos por key.
            persistRecursosRightTitleToItemKey(prevKey);
            recursosPageTitleTouched[prevKey] = true;
            recursosPageResourceTouched[prevKey] = true;
        }

        // Guardar estado del resources-mount de la página que se va (si no es evaluación)
        snapshotCurrentRecursosPage();

        // Actualizar la clave activa
        CC_RECURSOS_CURRENT_PAGE_KEY = nextPageKey;

        syncRecursosRightTitleFromActive();

        // Restaurar estado guardado de la nueva página, o mostrar el selector por defecto.
        if (isEvalPageKey(nextPageKey)) {
            mountRecursosEvalPage(nextPageKey);
        } else if (!restoreRecursosPage(nextPageKey)) {
            renderRecursosResourcesBlock();
        }

        if (nextPageKey) {
            setRecursosEditorVisible(true);
        }

        refreshCrearContenidoPageSiguienteState();
        // Refrescar bordes rojos (quita si ya quedó válido; marca si la anterior quedó inválida).
        syncRecursosTitleValidationVisuals();
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
        syncRecursosTitleValidationVisuals();
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
            syncRecursosPageCounter();
            refreshCrearContenidoPageSiguienteState();
            return;
        }
        if (d.action !== 'eliminar') return;
        openCrearContenidoDeletePageModal(item);
    }

    function onRecursosPageTitleFocusOut(ev) {
        if (!ev.target || ev.target.id !== 'crear-contenido-recursos-page-title') return;
        if (!document.getElementById('crear-contenido-root')) return;
        persistRecursosRightTitleToActiveItem();
        // El usuario "salió" del campo: marcar página activa como tocada y actualizar visuales.
        var key = CC_RECURSOS_CURRENT_PAGE_KEY != null ? String(CC_RECURSOS_CURRENT_PAGE_KEY) : '';
        if (key) recursosPageTitleTouched[key] = true;
        syncRecursosTitleValidationVisuals();
    }

    var recursosBlockInteractionsBound = false;
    function bindRecursosBlockInteractions() {
        if (recursosBlockInteractionsBound) return;
        recursosBlockInteractionsBound = true;

        document.addEventListener('click', function (ev) {
            var mount = document.getElementById('crear-contenido-recursos-resources-mount');
            if (!mount || !mount.contains(ev.target)) return;

            // 0. Click en tarjeta Evaluación final → flujo de evaluación + panel IA
            var evalCard = ev.target.closest('[data-resources-card-type="evaluacion-final"]');
            if (evalCard && !evalCard.disabled) {
                beforeReplaceRecursosMountIfPdfShowing(mount);
                if (typeof window.rcMountEvalForm === 'function') {
                    window.rcMountEvalForm(mount);
                    if (CC_RECURSOS_CURRENT_PAGE_KEY) {
                        setRecursosPrimaryType(CC_RECURSOS_CURRENT_PAGE_KEY, 'evaluacion-final');
                    }
                    // Actualizar icono en el índice a "evaluacion" (sin pasos intermedios)
                    var activeItemEval = document.querySelector('#crear-contenido-recursos-indice-mount .ubits-paginas-creator__item.is-active');
                    if (activeItemEval) {
                        var iconElEval = activeItemEval.querySelector('.ubits-paginas-creator__drag-handle i');
                        if (iconElEval && typeof window.paginasCreatorIconClass === 'function') {
                            iconElEval.className = window.paginasCreatorIconClass('evaluacion');
                        }
                    }
                    renderCrearContenidoComplementary();
                } else {
                    beforeReplaceRecursosMountIfPdfShowing(mount);
                    mount.innerHTML =
                        '<div class="ubits-empty-state">' +
                        '<div class="ubits-empty-state__icon"><i class="far fa-triangle-exclamation"></i></div>' +
                        '<p class="ubits-empty-state__title ubits-body-md-bold">No se pudo cargar la evaluación</p>' +
                        '<p class="ubits-empty-state__description ubits-body-md-regular">Vuelve a intentarlo.</p>' +
                        '</div>';
                }
                return;
            }

            // 1. Click en tarjeta Video → modal legacy (ganador test A/B).
            var videoCard = ev.target.closest('[data-resources-card-type="video"]');
            if (videoCard && !videoCard.disabled) {
                if (typeof window.openVideoRecursoModal === 'function') {
                    window.openVideoRecursoModal({
                        ui:           'legacy',
                        pageKey:      CC_RECURSOS_CURRENT_PAGE_KEY,
                        onVideoReady: function (html) {
                            beforeReplaceRecursosMountIfPdfShowing(mount);
                            /* Guardar en el estado de la página y renderizar */
                            if (CC_RECURSOS_CURRENT_PAGE_KEY) {
                                var pkVid = String(CC_RECURSOS_CURRENT_PAGE_KEY);
                                var prevVid = CC_RECURSOS_PAGE_STATE[pkVid] || {};
                                CC_RECURSOS_PAGE_STATE[pkVid] = Object.assign({}, prevVid, {
                                    html: html,
                                    primaryType: 'video'
                                });
                            }
                            mount.innerHTML = html;
                            /* Actualizar icono en el índice a "video" */
                            var activeItem = document.querySelector('#crear-contenido-recursos-indice-mount .ubits-paginas-creator__item.is-active');
                            if (activeItem) {
                                var iconEl = activeItem.querySelector('.ubits-paginas-creator__drag-handle i');
                                if (iconEl && typeof window.paginasCreatorIconClass === 'function') {
                                    iconEl.className = window.paginasCreatorIconClass('video');
                                }
                            }
                            renderCrearContenidoComplementary();
                        }
                    });
                } else {
                    /* Fallback si el modal no está disponible */
                    beforeReplaceRecursosMountIfPdfShowing(mount);
                    mount.innerHTML = window.resourcesBlockHtml({ variant: 'video-empty' });
                    if (typeof window.initResourcesBlockFields === 'function') {
                        window.initResourcesBlockFields(mount);
                    }
                }
                return;
            }

            // Encuesta de satisfacción: sin flujo aún (solo tarjeta visible en el selector).

            // 1b. Tarjeta PDF → subida local + vista previa (sin IA ni modales)
            var pdfCard = ev.target.closest('[data-resources-card-type="pdf"]');
            if (pdfCard && !pdfCard.disabled) {
                beforeReplaceRecursosMountIfPdfShowing(mount);
                mount.innerHTML = window.resourcesBlockHtml({ variant: 'pdf-empty' });
                if (typeof window.initResourcesBlockFields === 'function') {
                    window.initResourcesBlockFields(mount);
                }
                if (CC_RECURSOS_CURRENT_PAGE_KEY) {
                    CC_RECURSOS_PAGE_STATE[String(CC_RECURSOS_CURRENT_PAGE_KEY)] = { html: mount.innerHTML };
                }
                var activePdfItem = document.querySelector(
                    '#crear-contenido-recursos-indice-mount .ubits-paginas-creator__item.is-active'
                );
                if (activePdfItem) {
                    var iconPdf = activePdfItem.querySelector('.ubits-paginas-creator__drag-handle i');
                    if (iconPdf && typeof window.paginasCreatorIconClass === 'function') {
                        iconPdf.className = window.paginasCreatorIconClass('pdf');
                    }
                }
                return;
            }

            // 1c. Tarjeta Embebido → variante embed-empty (enlace o código iframe)
            var embebidoCard = ev.target.closest('[data-resources-card-type="embebido"]');
            if (embebidoCard && !embebidoCard.disabled) {
                beforeReplaceRecursosMountIfPdfShowing(mount);
                mount.innerHTML = window.resourcesBlockHtml({ variant: 'embed-empty' });
                if (typeof window.initResourcesBlockFields === 'function') {
                    window.initResourcesBlockFields(mount);
                }
                if (CC_RECURSOS_CURRENT_PAGE_KEY) {
                    if (typeof window.ccRecursosSetPageHtml === 'function') {
                        window.ccRecursosSetPageHtml(CC_RECURSOS_CURRENT_PAGE_KEY, mount.innerHTML);
                    } else {
                        CC_RECURSOS_PAGE_STATE[String(CC_RECURSOS_CURRENT_PAGE_KEY)] = {
                            html: mount.innerHTML,
                            primaryType: 'embebido'
                        };
                    }
                }
                syncRecursosEmbedPageIcon();
                return;
            }

            // 2b. Click en tarjeta de SCORM → abrir modal de SCORM
            var scormCard = ev.target.closest('[data-resources-card-type="scorm"]');
            if (scormCard && !scormCard.disabled) {
                if (typeof window.openScormRecursoModal === 'function') {
                    window.openScormRecursoModal({
                        pageKey:      CC_RECURSOS_CURRENT_PAGE_KEY,
                        onScormReady: function (html) {
                            beforeReplaceRecursosMountIfPdfShowing(mount);
                            if (CC_RECURSOS_CURRENT_PAGE_KEY) {
                                if (typeof window.ccRecursosSetPageHtml === 'function') {
                                    window.ccRecursosSetPageHtml(CC_RECURSOS_CURRENT_PAGE_KEY, html);
                                } else {
                                    CC_RECURSOS_PAGE_STATE[CC_RECURSOS_CURRENT_PAGE_KEY] = {
                                        html: html,
                                        primaryType: 'scorm'
                                    };
                                }
                            }
                            mount.innerHTML = html;
                            var activeItem = document.querySelector('#crear-contenido-recursos-indice-mount .ubits-paginas-creator__item.is-active');
                            if (activeItem) {
                                var iconEl = activeItem.querySelector('.ubits-paginas-creator__drag-handle i');
                                if (iconEl && typeof window.paginasCreatorIconClass === 'function') {
                                    iconEl.className = window.paginasCreatorIconClass('scorm');
                                }
                            }
                        }
                    });
                }
                return;
            }

            // 2c. Click en botón «Editar SCORM» del bloque ya generado
            var editScormBtn = ev.target.closest('#cc-editar-scorm-recurso');
            if (editScormBtn) {
                if (typeof window.openScormEditModal === 'function') {
                    window.openScormEditModal(CC_RECURSOS_CURRENT_PAGE_KEY);
                }
                return;
            }

            // 5. Click en botón Eliminar recurso cargado (evaluar antes de Cancelar)
            var eliminarBtn = ev.target.closest('#cc-eliminar-recurso');
            if (eliminarBtn) {
                openCrearContenidoDeleteResourceModal(mount);
                return;
            }

            // 2. Click en botón Cancelar (vuelve al selector sin recurso asignado)
            var cancelBtn = ev.target.closest('.ubits-resources-block__footer .ubits-button--error-secondary');
            if (cancelBtn && !ev.target.closest('#cc-eliminar-recurso')) {
                beforeReplaceRecursosMountIfPdfShowing(mount);
                if (CC_RECURSOS_CURRENT_PAGE_KEY) {
                    delete CC_RECURSOS_PAGE_STATE[CC_RECURSOS_CURRENT_PAGE_KEY];
                }
                mount.innerHTML = window.resourcesBlockHtml({ variant: 'default' });
                if (typeof window.initResourcesBlockFields === 'function') {
                    window.initResourcesBlockFields(mount);
                }
                hideRecursosComplementaryMount();
                syncRecursosTitleValidationVisuals();
                return;
            }

            // 4. Click en botón Cargar (video por enlace o embebido)
            var cargarBtn = ev.target.closest('.ubits-resources-block__field-inline .ubits-button--primary');
            if (cargarBtn && !cargarBtn.disabled) {
                var fieldInline = cargarBtn.closest('.ubits-resources-block__field-inline');
                var embedSlot = fieldInline ? fieldInline.querySelector('[data-rb-slot="embed-url"]') : null;
                if (embedSlot) {
                    var embedVal = getRecursosBlockUrlInputValue(fieldInline, 'embed-url');
                    var parsedEmbed = parseCrearContenidoEmbedInput(embedVal);
                    if (parsedEmbed && parsedEmbed.html) {
                        finishCrearContenidoEmbedRender(parsedEmbed.html, mount);
                    } else if (embedVal) {
                        beforeReplaceRecursosMountIfPdfShowing(mount);
                        mount.innerHTML = window.resourcesBlockHtml({ variant: 'embed-error' });
                        if (typeof window.initResourcesBlockFields === 'function') {
                            window.initResourcesBlockFields(mount);
                        }
                    }
                    return;
                }

                var inputSlot = fieldInline ? fieldInline.querySelector('[data-rb-slot="video-url"] input') : null;
                if (inputSlot) {
                    var val = inputSlot.value.trim();
                    var lowerVal = val.toLowerCase();
                    var isValid = lowerVal.indexOf('vimeo.com') !== -1 ||
                                  lowerVal.indexOf('youtube.com') !== -1 ||
                                  lowerVal.indexOf('youtu.be') !== -1 ||
                                  lowerVal.indexOf('drive.google.com') !== -1 ||
                                  lowerVal.indexOf('onedrive.live.com') !== -1;
                    
                    if (isValid) {
                        // A. Camino feliz
                        var pType = 'html5';
                        var pSrc = val;
                        
                        if (val.indexOf('vimeo.com') !== -1) {
                            pType = 'vimeo';
                            var mV = val.match(/vimeo\.com\/(\d+)/);
                            if (mV) pSrc = 'https://player.vimeo.com/video/' + mV[1];
                        } else if (val.indexOf('youtube.com') !== -1 || val.indexOf('youtu.be') !== -1) {
                            pType = 'youtube';
                            var mY = val.match(/(?:v=|youtu\.be\/)([^&\?]+)/);
                            if (mY) pSrc = 'https://www.youtube.com/embed/' + mY[1];
                        } else if (val.indexOf('drive.google.com') !== -1) {
                            pType = 'google-drive';
                            pSrc = val.replace('/view', '/preview'); // Heurística simple para Drive
                        } else if (val.indexOf('onedrive.live.com') !== -1) {
                            pType = 'onedrive';
                            pSrc = val.replace('view.aspx', 'embed'); // Heurística simple para OneDrive
                        }

                        // Reemplazar el workspace del recurso por el reproductor, forzando 16/9
                        if (typeof window.videoPlayerHtml === 'function') {
                            var playerHtml = window.videoPlayerHtml({ type: pType, src: pSrc, className: 'is-forced-16-9' });
                            beforeReplaceRecursosMountIfPdfShowing(mount);
                            mount.innerHTML = 
                                '<div class="ubits-resources-block ubits-resources-block--stack">' +
                                    '<div class="ubits-resources-block__surface" style="padding: 0;">' +
                                        playerHtml +
                                    '</div>' +
                                    '<div class="ubits-resources-block__footer">' +
                                        '<button type="button" class="ubits-button ubits-button--error-secondary ubits-button--sm" id="cc-eliminar-recurso">' +
                                            '<i class="far fa-trash-alt"></i><span>Eliminar</span>' +
                                        '</button>' +
                                    '</div>' +
                                '</div>';
                        }
                        
                        if (CC_RECURSOS_CURRENT_PAGE_KEY) {
                            var pkVl = String(CC_RECURSOS_CURRENT_PAGE_KEY);
                            var prevVl = CC_RECURSOS_PAGE_STATE[pkVl] || {};
                            CC_RECURSOS_PAGE_STATE[pkVl] = Object.assign({}, prevVl, {
                                html: mount.innerHTML,
                                primaryType: 'video'
                            });
                        }
                        // Actualizar icono en el índice a "video"
                        var activeItem = document.querySelector('#crear-contenido-recursos-indice-mount .ubits-paginas-creator__item.is-active');
                        if (activeItem) {
                            var iconEl = activeItem.querySelector('.ubits-paginas-creator__drag-handle i');
                            if (iconEl && typeof window.paginasCreatorIconClass === 'function') {
                                iconEl.className = window.paginasCreatorIconClass('video');
                            }
                        }
                        renderCrearContenidoComplementary();

                    } else {
                        // B. Enlace inválido -> variante error
                        beforeReplaceRecursosMountIfPdfShowing(mount);
                        mount.innerHTML = window.resourcesBlockHtml({ variant: 'video-error', value: val });
                        if (typeof window.initResourcesBlockFields === 'function') {
                            window.initResourcesBlockFields(mount);
                        }
                    }
                }
                return;
            }
        });

        // 3. Escribir en el input enciende el botón Cargar (video o embebido)
        document.addEventListener('input', function (ev) {
            var mount = document.getElementById('crear-contenido-recursos-resources-mount');
            if (!mount || !mount.contains(ev.target)) return;

            var slotEl = ev.target.closest('[data-rb-slot="video-url"], [data-rb-slot="embed-url"]');
            if (!slotEl) return;
            var fieldInline = ev.target.closest('.ubits-resources-block__field-inline');
            syncRecursosCargarButtonFromField(fieldInline, ev.target.value);
        });
    }

    function bindRecursosEventsOnce() {
        if (recursosEventsBound) return;
        recursosEventsBound = true;
        document.addEventListener('ubits-seccion-creator-add-page', onRecursosSecAddPage);
        document.addEventListener('ubits-indice-creator-sections-toggle', onRecursosIndiceSectionsToggle);
        document.addEventListener('ubits-indice-creator-add-section', onRecursosIndiceAddSection);
        document.addEventListener('ubits-seccion-creator-edit-section', onRecursosSeccionCreatorEditSection);
        document.addEventListener('ubits-seccion-creator-section-action', onRecursosSeccionCreatorSectionAction);
        document.addEventListener('ubits-paginas-creator-activate', onRecursosPaginasActivate);
        document.addEventListener('ubits-paginas-creator-action', onRecursosPaginasAction);
        document.addEventListener('ubits-paginas-creator-label-save', onRecursosPaginasLabelSave);
        document.addEventListener('focusout', onRecursosPageTitleFocusOut, true);
        document.addEventListener('input', function (ev) {
            if (!ev.target || ev.target.id !== 'crear-contenido-recursos-page-title') return;
            syncRecursosActiveLabelFromPageTitleInput();
            // Si el usuario corrige el título, quitar el borde rojo en tiempo real
            // (solo aplica si ya hubo validación flash o si la página ya fue tocada).
            syncRecursosTitleValidationVisuals();
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
        
        bindRecursosBlockInteractions();
        bindCrearContenidoResourcesBlockPdfChangeOnce();
        bindCrearContenidoComplementaryInteractionsOnce();
    }

    var complementaryInteractionsBound = false;
    function bindCrearContenidoComplementaryInteractionsOnce() {
        if (complementaryInteractionsBound) return;
        complementaryInteractionsBound = true;

        document.addEventListener('ubits-complementary-resources-invite', function (ev) {
            if (!document.getElementById('crear-contenido-root')) return;
            var compMount = getRecursosComplementaryMount();
            if (!compMount || !ev.target || !compMount.contains(ev.target)) return;
            var d = ev.detail || {};
            var pk = CC_RECURSOS_CURRENT_PAGE_KEY != null ? String(CC_RECURSOS_CURRENT_PAGE_KEY) : '';
            if (!pk) return;
            var mainMount = document.getElementById('crear-contenido-recursos-resources-mount');
            if (isComplementaryDisabledForPage(mainMount, pk)) return;
            var st = ensureRecursosPageState(pk);
            if (!st) return;
            if (d.type === 'texto' || d.type === 'archivo-descargable') {
                pushComplementaryToOrder(st, d.type);
            }
            renderCrearContenidoComplementary();
        });

        document.addEventListener('click', function (ev) {
            var btn = ev.target.closest('[data-cc-eliminar-complementario]');
            if (!btn || !document.getElementById('crear-contenido-root')) return;
            var compMount = getRecursosComplementaryMount();
            if (!compMount || !compMount.contains(btn)) return;
            var pk = CC_RECURSOS_CURRENT_PAGE_KEY != null ? String(CC_RECURSOS_CURRENT_PAGE_KEY) : '';
            if (!pk) return;
            var st = ensureRecursosPageState(pk);
            if (!st) return;
            var kind = btn.getAttribute('data-cc-eliminar-complementario');
            removeComplementaryFromOrder(st, kind);
            renderCrearContenidoComplementary();
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

    function canNavigateFromRecursosToCertificado() {
        snapshotCurrentRecursosPage();
        var mount = getRecursosIndiceMount();
        var n = mount ? mount.querySelectorAll('.ubits-paginas-creator__item').length : 0;
        if (n === 0) return { ok: false, code: 'no-pages' };
        var titleSt = collectRecursosPageTitleValidation();
        if (!titleSt.allValid) return { ok: false, code: 'invalid-titles', validation: titleSt };
        var resourceSt = collectRecursosPageResourceValidation();
        if (!resourceSt.allValid) return { ok: false, code: 'missing-resources', validation: resourceSt };
        var sectionSt = collectRecursosEmptySectionValidation();
        if (!sectionSt.allValid) return { ok: false, code: 'empty-sections', validation: sectionSt };
        return { ok: true };
    }

    function applyRecursosToCertificadoBlockers(showToast) {
        if (pageCurrentStep < 1) goToCrearContenidoPageStep(1, { skipUrl: true });
        var nav = canNavigateFromRecursosToCertificado();
        if (nav.ok) return true;
        if (nav.code === 'no-pages') {
            if (showToast && typeof window.showToast === 'function') {
                window.showToast('warning', 'Añade al menos una página para continuar.', {
                    containerId: 'ubits-toast-container',
                    duration: 3500
                });
            }
            return false;
        }
        if (nav.code === 'invalid-titles') {
            recursosTitlesValidationFlash = true;
            var firstTitle = nav.validation && nav.validation.invalidItems[0];
            if (firstTitle && typeof window.setPaginasCreatorActiveItem === 'function') {
                window.setPaginasCreatorActiveItem(firstTitle);
            }
            syncRecursosRightTitleFromActive();
            syncRecursosTitleValidationVisuals();
            var titInp = document.getElementById('crear-contenido-recursos-page-title');
            if (titInp) titInp.focus();
            if (showToast && typeof window.showToast === 'function') {
                window.showToast(
                    'warning',
                    'Todas las páginas deben tener un título. Revisa las marcadas en rojo.',
                    { containerId: 'ubits-toast-container', duration: 4000 }
                );
            }
            return false;
        }
        if (nav.code === 'missing-resources') {
            recursosResourcesValidationFlash = true;
            var firstRes = nav.validation && nav.validation.invalidItems[0];
            if (firstRes && typeof window.setPaginasCreatorActiveItem === 'function') {
                window.setPaginasCreatorActiveItem(firstRes);
            }
            syncRecursosRightTitleFromActive();
            if (!restoreRecursosPage(CC_RECURSOS_CURRENT_PAGE_KEY)) {
                renderRecursosResourcesBlock({ variant: 'default-error' });
            }
            syncRecursosTitleValidationVisuals();
            if (showToast && typeof window.showToast === 'function') {
                window.showToast(
                    'warning',
                    'Todas las páginas deben tener al menos un recurso. Revisa las marcadas en rojo.',
                    { containerId: 'ubits-toast-container', duration: 4000 }
                );
            }
            return false;
        }
        if (nav.code === 'empty-sections') {
            recursosResourcesValidationFlash = true;
            syncRecursosTitleValidationVisuals();
            if (showToast && typeof window.showToast === 'function') {
                window.showToast(
                    'warning',
                    'Toda sección debe tener al menos una página. Revisa las secciones marcadas en rojo.',
                    { containerId: 'ubits-toast-container', duration: 4000 }
                );
            }
            return false;
        }
        return false;
    }

    function refreshCrearContenidoPageSiguienteState() {
        var btn = document.getElementById('crear-contenido-btn-siguiente');
        if (!btn) return;
        var labelSpan = btn.querySelector('span');
        if (labelSpan) {
            labelSpan.textContent = pageCurrentStep === 3 ? 'Finalizar' : 'Siguiente';
        }
        if (pageCurrentStep === 1) {
            var list = getRecursosPaginasList();
            var n = list ? list.querySelectorAll(':scope > .ubits-paginas-creator__item').length : 0;
            btn.disabled = n === 0;
            btn.setAttribute('aria-disabled', n === 0 ? 'true' : 'false');
            return;
        }
        if (pageCurrentStep === 2) {
            btn.disabled = false;
            btn.setAttribute('aria-disabled', 'false');
            return;
        }
        if (pageCurrentStep >= 3) {
            btn.disabled = false;
            btn.setAttribute('aria-disabled', 'false');
            return;
        }
        var ok = isCrearContenidoPortadaComplete();
        btn.disabled = !ok;
        btn.setAttribute('aria-disabled', ok ? 'false' : 'true');
        syncPortadaInvalidOutline();
    }

    function finalizeCrearContenidoFlow() {
        try {
            sessionStorage.setItem(
                'ubits-toast-pending',
                JSON.stringify({ type: 'success', message: 'Contenido creado exitosamente' })
            );
            var visibilidad =
                typeof window.getCrearContenidoVisibilidad === 'function'
                    ? window.getCrearContenidoVisibilidad()
                    : 'borrador';
            sessionStorage.setItem(
                'ubits-contenidos-pin-recien-creado',
                JSON.stringify({ id: 'f007', visibilidad: visibilidad })
            );
        } catch (e) {}
        window.location.href = 'contenidos.html';
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
                    if (i === 2) {
                        if (!isCrearContenidoPortadaComplete()) {
                            portadaValidationFlash = true;
                            syncPortadaInvalidOutline();
                            if (typeof window.showToast === 'function') {
                                window.showToast('warning', 'Completa la portada para continuar.', {
                                    containerId: 'ubits-toast-container',
                                    duration: 3500
                                });
                            }
                            return;
                        }
                        portadaValidationFlash = false;
                        clearPortadaInvalidMarks();
                        if (pageCurrentStep < 1) goToCrearContenidoPageStep(1, { skipUrl: true });
                        if (!applyRecursosToCertificadoBlockers(true)) return;
                        recursosTitlesValidationFlash = false;
                        clearRecursosTitleValidationVisuals();
                        goToCrearContenidoPageStep(2);
                        return;
                    }
                    if (i === 3) {
                        if (!isCrearContenidoPortadaComplete()) {
                            portadaValidationFlash = true;
                            syncPortadaInvalidOutline();
                            if (typeof window.showToast === 'function') {
                                window.showToast('warning', 'Completa la portada para continuar.', {
                                    containerId: 'ubits-toast-container',
                                    duration: 3500
                                });
                            }
                            return;
                        }
                        portadaValidationFlash = false;
                        clearPortadaInvalidMarks();
                        if (pageCurrentStep < 1) goToCrearContenidoPageStep(1, { skipUrl: true });
                        if (!applyRecursosToCertificadoBlockers(true)) return;
                        recursosTitlesValidationFlash = false;
                        clearRecursosTitleValidationVisuals();
                        if (pageCurrentStep < 2) goToCrearContenidoPageStep(2, { skipUrl: true });
                        goToCrearContenidoPageStep(3);
                        return;
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
                    if (!applyRecursosToCertificadoBlockers(true)) return;
                    recursosTitlesValidationFlash = false;
                    clearRecursosTitleValidationVisuals();
                    goToCrearContenidoPageStep(2);
                    return;
                }
                if (pageCurrentStep === 2) {
                    goToCrearContenidoPageStep(3);
                    return;
                }
                if (pageCurrentStep === 3) {
                    finalizeCrearContenidoFlow();
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
                if (pageCurrentStep === 2) {
                    goToCrearContenidoPageStep(1);
                    return;
                }
                if (pageCurrentStep === 3) {
                    goToCrearContenidoPageStep(2);
                    return;
                }
                if (pageCurrentStep === 1) {
                    goToCrearContenidoPageStep(0);
                }
            });
        }
        setTimeout(function () {
            refreshCrearContenidoPageSiguienteState();
        }, 500);
    }

    /**
     * Calcula el alto disponible del __main (entre header y footer)
     * y lo expone como --cc-main-h en :root para que el rail sticky
     * pueda usarlo como height sin pixels hardcodeados.
     */
    function syncRailHeight() {
        var main = document.getElementById('crear-contenido-main');
        if (!main) return;
        document.documentElement.style.setProperty('--cc-main-h', main.clientHeight + 'px');
    }

    function initCrearContenidoPage() {
        if (typeof renderSaveIndicator === 'function') {
            renderSaveIndicator('crear-contenido-save-indicator', {
                state: 'idle',
                idleVariant: 'plain',
                size: 'xs'
            });
        }
        wireAutoSave();
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
        var initialHashForPromo = location.hash || '';
        var deepDemoSeed =
            isRecursosUrlHash(initialHashForPromo) ||
            initialHashForPromo === HASH_PAGE_CERTIFICADO ||
            initialHashForPromo === HASH_PAGE_VISIBILIDAD ||
            initialHashForPromo === HASH_PAGE_PUBLICACION;
        if (deepDemoSeed && isCrearContenidoEmptyForDemo()) {
            seedCrearContenidoDemo(function () {
                applyCrearContenidoPageHash();
                refreshCrearContenidoPageSiguienteState();
                setTimeout(function () {
                    tryOfferCrearContenidoPromoAgentesModal(initialHashForPromo);
                }, 0);
            });
        } else {
            applyCrearContenidoPageHash();
            setTimeout(function () {
                tryOfferCrearContenidoPromoAgentesModal(initialHashForPromo);
            }, 0);
        }
        window.addEventListener('hashchange', function onCrearContenidoHashChange() {
            var hc = location.hash || '';
            applyCrearContenidoPageHash();
            tryOfferCrearContenidoPromoAgentesModal(hc);
        });
        /* Rail height: leer el alto real del __main y exponerlo como CSS var */
        syncRailHeight();
        window.addEventListener('resize', syncRailHeight);
    }

    /** Portada `#portada`, Recursos `#recursos`. Alias legacy en applyCrearContenidoPageHash. */
    var HASH_PAGE_PORTADA = '#portada';
    var HASH_PAGE_RECURSOS = '#recursos';
    var HASH_PAGE_CERTIFICADO = '#certificado';
    var HASH_PAGE_VISIBILIDAD = '#visibilidad';
    /** Alias legacy del paso 4 */
    var HASH_PAGE_PUBLICACION = '#publicacion';
    var HASH_PAGE_PORTADA_LEGACY = '#crear-contenido';
    var HASH_DRAWER_RECURSOS = '#crear-contenido-recursos';
    var HASH_DRAWER_RECURSOS_ALIAS = '#crear-contenido-step-recursos';
    /** Deep link demo / instrucciones: abre modal promo y normaliza la URL a #portada */
    var HASH_PROMO_MODAL = '#promo-modal';
    var PROMO_AGENTES_IA_OVERLAY_ID = 'crear-contenido-promo-agentes-ia';
    /** sessionStorage: pending = clic en «Crear contenido» en contenidos.html; shown = ya se mostró el promo en esta pestaña */
    var SS_PROMO_PENDING_KEY = 'ubits-cc-promo-agentes-pending';
    var SS_PROMO_SHOWN_KEY = 'ubits-cc-promo-agentes-shown-session';

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

    function clampCrearContenidoPageStep(stepIndex) {
        var n = parseInt(stepIndex, 10);
        if (isNaN(n) || n < 0) return 0;
        if (n > 3) return 3;
        return n;
    }

    function hashForCrearContenidoPageStep(idx) {
        if (idx === 1) return HASH_PAGE_RECURSOS;
        if (idx === 2) return HASH_PAGE_CERTIFICADO;
        if (idx === 3) return HASH_PAGE_VISIBILIDAD;
        return HASH_PAGE_PORTADA;
    }

    /**
     * @param {number} stepIndex 0 = Portada, 1 = Recursos, 2 = Certificado, 3 = Visibilidad
     * @param {{ skipUrl?: boolean }} [opts]
     */
    function goToCrearContenidoPageStep(stepIndex, opts) {
        opts = opts || {};
        var idx = clampCrearContenidoPageStep(stepIndex);
        var prevStep = pageCurrentStep;
        pageCurrentStep = idx;
        if (prevStep !== pageCurrentStep && prevStep === 1 && idx !== 1) {
            recursosTitlesValidationFlash = false;
            recursosResourcesValidationFlash = false;
            clearRecursosTitleValidationVisuals();
        }
        var portadaEl = document.getElementById('crear-contenido-step-portada');
        var recursosEl = document.getElementById('crear-contenido-step-recursos');
        var certificadoEl = document.getElementById('crear-contenido-step-certificado');
        var publicacionEl = document.getElementById('crear-contenido-step-publicacion');
        if (portadaEl) {
            portadaEl.classList.toggle('crear-contenido-step--visible', idx === 0);
        }
        if (recursosEl) {
            recursosEl.classList.toggle('crear-contenido-step--visible', idx === 1);
        }
        if (certificadoEl) {
            certificadoEl.classList.toggle('crear-contenido-step--visible', idx === 2);
        }
        if (publicacionEl) {
            publicacionEl.classList.toggle('crear-contenido-step--visible', idx === 3);
        }
        if (typeof window.setStepperStepStates === 'function') {
            var olDesk = document.getElementById('crear-contenido-stepper-ol');
            var olMob = document.getElementById('crear-contenido-stepper-ol-mobile');
            if (olDesk) window.setStepperStepStates(olDesk, idx);
            if (olMob) window.setStepperStepStates(olMob, idx);
        }
        if (idx === 1) {
            initCrearContenidoPageRecursosStepOnce();
            if (recursosIndiceHasPages()) {
                setRecursosEditorVisible(true);
                var activePk =
                    CC_RECURSOS_CURRENT_PAGE_KEY != null ? String(CC_RECURSOS_CURRENT_PAGE_KEY) : '';
                if (!activePk) {
                    var activeItem = document.querySelector(
                        '#crear-contenido-recursos-indice-mount .ubits-paginas-creator__item.is-active'
                    );
                    if (activeItem) {
                        activePk = activeItem.getAttribute('data-paginas-creator-key') || '';
                        if (activePk) CC_RECURSOS_CURRENT_PAGE_KEY = activePk;
                    }
                }
                if (activePk) {
                    syncRecursosRightTitleFromActive();
                    if (isEvalPageKey(activePk)) {
                        mountRecursosEvalPage(activePk);
                    } else {
                        restoreRecursosPage(activePk);
                    }
                    syncRecursosPageCounter();
                }
            }
        }
        if (idx === 2 && typeof window.initCrearContenidoCertificadoStepOnce === 'function') {
            window.initCrearContenidoCertificadoStepOnce();
        }
        if (idx === 3 && typeof window.initCrearContenidoPublicacionStepOnce === 'function') {
            window.initCrearContenidoPublicacionStepOnce();
        }
        updateCrearContenidoPageFooterNav(idx);
        if (typeof window.initTooltip === 'function') {
            window.initTooltip('#crear-contenido-root [data-tooltip]');
        }
        if (!opts.skipUrl) {
            var path = location.pathname + location.search;
            var target = hashForCrearContenidoPageStep(idx);
            if (location.hash !== target) {
                history.replaceState(null, '', path + target);
            }
        }
    }

    function markCrearContenidoPromoAgentesModalShownThisSession() {
        try {
            sessionStorage.setItem(SS_PROMO_SHOWN_KEY, '1');
        } catch (e) {}
    }

    /**
     * Modal promo (variante `promo` en modal.js): imagen + copy + CTA.
     */
    function openCrearContenidoPromoAgentesModal() {
        if (typeof window.openModal !== 'function' || typeof window.closeModal !== 'function') return;
        var tit = 'Presentamos agentes AI para Creator';
        var desc =
            'Diseña imágenes, crea videos con avatar, configura y redacta evaluaciones y genera presentaciones SCORM. ' +
            'Solo describe lo que necesitas y nuestra plataforma se encarga del resto.';
        var imgSrc = '../../images/promo/modal-ia-lms.jpg';
        var bodyHtml =
            '<div class="ubits-modal-promo-media">' +
            '<img src="' +
            imgSrc +
            '" alt="Imágenes, videos con avatar, evaluaciones y presentaciones SCORM con IA en Creator." />' +
            '</div>' +
            '<div class="ubits-modal-promo-copy">' +
            '<p class="ubits-body-lg-semibold ubits-modal-promo-title" id="' +
            PROMO_AGENTES_IA_OVERLAY_ID +
            '-heading">' +
            tit +
            '</p>' +
            '<p class="ubits-body-sm-regular">' +
            desc +
            '</p>' +
            '<button type="button" class="ubits-button ubits-button--primary ubits-button--md" id="crear-contenido-promo-agentes-cta"><span>Descúbrelos ahora</span></button>' +
            '</div>';
        var overlay = window.openModal({
            overlayId: PROMO_AGENTES_IA_OVERLAY_ID,
            variant: 'promo',
            size: 'sm',
            title: tit,
            promoAriaLabel: tit,
            bodyHtml: bodyHtml,
            closeOnOverlayClick: true
        });
        var cta = overlay.querySelector('#crear-contenido-promo-agentes-cta');
        if (cta) {
            cta.addEventListener('click', function () {
                window.closeModal(PROMO_AGENTES_IA_OVERLAY_ID);
            });
        }
    }

    /**
     * Promo Agentes IA: una vez por pestaña si llegas desde el botón Crear contenido en contenidos.html;
     * o al usar #promo-modal (demo). Tras recargar contenidos.html se puede volver a ver una vez.
     * @param {string} hashAtNavigation — hash capturado antes de applyCrearContenidoPageHash o location.hash en hashchange
     */
    function tryOfferCrearContenidoPromoAgentesModal(hashAtNavigation) {
        var h = hashAtNavigation != null ? String(hashAtNavigation) : '';
        var fromHashDemo = h === HASH_PROMO_MODAL;
        var pending = false;
        var alreadyShown = false;
        try {
            pending = sessionStorage.getItem(SS_PROMO_PENDING_KEY) === '1';
        } catch (e1) {}
        try {
            alreadyShown = sessionStorage.getItem(SS_PROMO_SHOWN_KEY) === '1';
        } catch (e2) {}

        if (fromHashDemo) {
            goToCrearContenidoPageStep(0, { skipUrl: true });
            openCrearContenidoPromoAgentesModal();
            markCrearContenidoPromoAgentesModalShownThisSession();
            try {
                sessionStorage.removeItem(SS_PROMO_PENDING_KEY);
            } catch (e3) {}
            return;
        }

        if (pending) {
            try {
                sessionStorage.removeItem(SS_PROMO_PENDING_KEY);
            } catch (e4) {}
            if (!alreadyShown) {
                openCrearContenidoPromoAgentesModal();
                markCrearContenidoPromoAgentesModalShownThisSession();
            }
        }
    }

    var CC_DEMO_TITLE = 'Resolución efectiva de conflictos en equipos de trabajo';
    var CC_DEMO_COVER_SRC = '../../images/cards-learn/portadas-ia/02-personas-en-oficina.jpg';
    /** Rutas candidatas: copia ASCII junto a esta página (fiable) + original en /pdf (NFD/NFC). */
    var CC_DEMO_PDF_PATH_CANDIDATES = [
        './demo-assets/guia-mapa-conflicto.pdf',
        '../../pdf/Gui\u0301a mapa del conflicto.pdf',
        '../../pdf/Guía mapa del conflicto.pdf'
    ];
    var CC_DEMO_PDF_PATH = CC_DEMO_PDF_PATH_CANDIDATES[0];
    var CC_DEMO_SEC1 = 'cc-demo-sec-1';
    var CC_DEMO_SEC2 = 'cc-demo-sec-2';
    var CC_DEMO_PG_VIDEO = 'cc-demo-pg-1';
    var CC_DEMO_PG_PDF = 'cc-demo-pg-2';
    var CC_DEMO_PG_SCORM_MANUAL = 'cc-demo-pg-3';
    var CC_DEMO_PG_SCORM_IA = 'cc-demo-pg-4';
    var CC_DEMO_PG_EVAL = 'cc-demo-pg-5';

    function isCrearContenidoEmptyForDemo() {
        if (window._ccDemoSeeded) return false;
        var titulo = document.getElementById('crear-contenido-titulo');
        if (titulo && String(titulo.value || '').trim()) return false;
        var block = document.getElementById('crear-contenido-img-trailer');
        if (
            block &&
            (block.classList.contains('ubits-learn-img-trailer--image') ||
                block.classList.contains('ubits-learn-img-trailer--trailer'))
        ) {
            return false;
        }
        if (Object.keys(CC_RECURSOS_PAGE_STATE).length > 0) return false;
        return true;
    }

    function findCrearContenidoDemoCategoryId() {
        var cats =
            window.BD_MASTER_CATEGORIAS_FIQSHA && window.BD_MASTER_CATEGORIAS_FIQSHA.categorias
                ? window.BD_MASTER_CATEGORIAS_FIQSHA.categorias
                : [];
        for (var i = 0; i < cats.length; i++) {
            var c = cats[i];
            if (!c) continue;
            var nombre = String(c.nombre || '').toLowerCase();
            if (nombre.indexOf('gestión de conflictos') !== -1 || nombre.indexOf('gestion de conflictos') !== -1) {
                return String(c.id);
            }
        }
        return 'cfq-006';
    }

    /** Id cfq-XXX → nombre visible; si ya es nombre, se devuelve tal cual. */
    function resolveCategoriaFiqshaLabel(valueOrId) {
        var raw = String(valueOrId || '').trim();
        if (!raw) return '';
        var cats =
            window.BD_MASTER_CATEGORIAS_FIQSHA && window.BD_MASTER_CATEGORIAS_FIQSHA.categorias
                ? window.BD_MASTER_CATEGORIAS_FIQSHA.categorias
                : [];
        for (var i = 0; i < cats.length; i++) {
            var c = cats[i];
            if (!c) continue;
            if (String(c.id) === raw) return String(c.nombre || raw);
            if (String(c.nombre) === raw) return String(c.nombre);
        }
        return raw;
    }

    window.resolveCategoriaFiqshaLabel = resolveCategoriaFiqshaLabel;

    /** Select UBITS: el input muestra `text`; onChange recibe `value` (id). */
    function setCrearContenidoSelectDisplayByValue(inputApi, valueId, selectOptions) {
        if (!inputApi || typeof inputApi.setValue !== 'function') return;
        var label = resolveCategoriaFiqshaLabel(valueId);
        (selectOptions || []).forEach(function (opt) {
            if (opt && String(opt.value) === String(valueId)) {
                label = String(opt.text || label);
            }
        });
        inputApi.setValue(label);
    }

    function seedCrearContenidoDemoPortada() {
        var titulo = document.getElementById('crear-contenido-titulo');
        if (titulo) titulo.value = CC_DEMO_TITLE;
        var rteRoot = document.getElementById('crear-contenido-rte');
        var descHtml =
            '<p class="ubits-body-md-regular">Aprende a identificar las causas del conflicto en equipos, comunicarte con calma y aplicar herramientas prácticas para transformar tensiones en acuerdos sostenibles.</p>';
        if (typeof window.setRichTextHtml === 'function' && rteRoot) {
            window.setRichTextHtml(rteRoot, descHtml);
        }
        applyPortadaImagenCargada(CC_DEMO_COVER_SRC, '', { fromAi: true, iaPrompt: CC_DEMO_TITLE, skipMetaUpdate: false });
        var catId = findCrearContenidoDemoCategoryId();
        var catOpts = buildSelectOptionsFromMaster().categorias;
        setCrearContenidoSelectDisplayByValue(crearContenidoInputApis.categoria, catId, catOpts);
    }

    function buildCrearContenidoDemoScormManualHtml() {
        return (
            '<div class="ubits-resources-block ubits-resources-block--stack">' +
            '<div class="ubits-resources-block__surface cc-scorm-resource__surface" style="padding:0;">' +
            '<div class="cc-scorm-resource__embed-wrap">' +
            '<div class="cc-scorm-iframe-container">' +
            '<iframe src="simulador-scorm.html" allowfullscreen></iframe>' +
            '</div></div></div>' +
            '<div class="ubits-resources-block__footer" style="display:flex;align-items:center;gap:var(--gap-sm);flex-wrap:wrap;">' +
            '<button type="button" class="ubits-button ubits-button--error-secondary ubits-button--sm" id="cc-eliminar-recurso">' +
            '<i class="far fa-trash-alt"></i><span>Eliminar</span></button></div></div>'
        );
    }

    function packCrearContenidoDemoPdfBinary(buf, sourcePath) {
        var file = buildRecursosPdfFileFromBuffer(buf);
        return {
            arrayBuffer: buf,
            blob: file,
            sourcePath: sourcePath
        };
    }

    /**
     * Precarga el PDF del demo (fetch; si falla, XHR — útil en file://).
     * @returns {Promise<{ arrayBuffer: ArrayBuffer, blob: Blob|File, sourcePath: string }>}
     */
    function fetchCrearContenidoDemoPdfBinary() {
        var embedded = getCrearContenidoDemoPdfEmbeddedArrayBuffer();
        if (embedded && embedded.byteLength) {
            return Promise.resolve(packCrearContenidoDemoPdfBinary(embedded, CC_DEMO_PDF_PATH));
        }

        var candidates = CC_DEMO_PDF_PATH_CANDIDATES;
        var fetchIdx = 0;
        var xhrIdx = 0;

        function tryFetchNext() {
            if (fetchIdx >= candidates.length) {
                return tryXhrNext();
            }
            var rel = candidates[fetchIdx++];
            var url = resolveRecursosPdfFetchUrl(rel);
            return fetch(url)
                .then(function (res) {
                    if (!res.ok) return tryFetchNext();
                    return res.arrayBuffer().then(function (buf) {
                        return packCrearContenidoDemoPdfBinary(buf, rel);
                    });
                })
                .catch(function () {
                    return tryFetchNext();
                });
        }

        function tryXhrNext() {
            if (xhrIdx >= candidates.length) {
                var emb = getCrearContenidoDemoPdfEmbeddedArrayBuffer();
                if (emb && emb.byteLength) {
                    return Promise.resolve(packCrearContenidoDemoPdfBinary(emb, CC_DEMO_PDF_PATH));
                }
                return Promise.reject(new Error('demo-pdf-not-found'));
            }
            var rel = candidates[xhrIdx++];
            var url = resolveRecursosPdfFetchUrl(rel);
            return loadRecursosPdfBinaryViaXhr(url)
                .then(function (buf) {
                    return packCrearContenidoDemoPdfBinary(buf, rel);
                })
                .catch(function () {
                    return tryXhrNext();
                });
        }

        return tryFetchNext();
    }

    function seedCrearContenidoDemoRecursosPageStates(pdfBin) {
        if (!pdfBin || !pdfBin.arrayBuffer) {
            var embBuf = getCrearContenidoDemoPdfEmbeddedArrayBuffer();
            if (embBuf && embBuf.byteLength) {
                pdfBin = packCrearContenidoDemoPdfBinary(embBuf, CC_DEMO_PDF_PATH);
            }
        }
        var videoHtml =
            typeof window.ccVideoBuildAiRenderedHtml === 'function'
                ? window.ccVideoBuildAiRenderedHtml()
                : '';
        var pdfHtml = buildCrearContenidoPdfViewerShellHtml();
        var scormManualHtml = buildCrearContenidoDemoScormManualHtml();
        var scormIaHtml =
            typeof window.ccScormBuildDemoAiRenderedBlock === 'function'
                ? window.ccScormBuildDemoAiRenderedBlock(
                      CC_DEMO_PG_SCORM_IA,
                      'Conversaciones difíciles según Thomas-Kilmann'
                  )
                : '';

        CC_RECURSOS_PAGE_STATE[CC_DEMO_PG_VIDEO] = { html: videoHtml, primaryType: 'video' };
        var pdfState = {
            html: pdfHtml,
            pdfSourcePath: (pdfBin && pdfBin.sourcePath) || CC_DEMO_PDF_PATH,
            primaryType: 'pdf',
            pdfBlobUrl: ''
        };
        if (pdfBin && pdfBin.arrayBuffer) {
            pdfState.pdfArrayBuffer = pdfBin.arrayBuffer;
        }
        if (pdfBin && pdfBin.blob) {
            pdfState.pdfFileBlob = pdfBin.blob;
            try {
                pdfState.pdfBlobUrl = URL.createObjectURL(pdfBin.blob);
            } catch (eUrl) {
                pdfState.pdfBlobUrl = '';
            }
        }
        CC_RECURSOS_PAGE_STATE[CC_DEMO_PG_PDF] = pdfState;
        CC_RECURSOS_PAGE_STATE[CC_DEMO_PG_SCORM_MANUAL] = { html: scormManualHtml, primaryType: 'scorm' };
        CC_RECURSOS_PAGE_STATE[CC_DEMO_PG_SCORM_IA] = { html: scormIaHtml, primaryType: 'scorm' };
        if (typeof window.ccEvalSeedStandardPage === 'function') {
            window.ccEvalSeedStandardPage(CC_DEMO_PG_EVAL);
        }
        CC_RECURSOS_PAGE_STATE[CC_DEMO_PG_EVAL] = {
            primaryType: 'evaluacion-final',
            hasComplementaryText: false,
            hasComplementaryDownload: false,
            complementaryOrder: []
        };
    }

    function seedCrearContenidoDemoRecursosIndice() {
        recursosUiDone = true;
        recursosSectionsEnabled = true;
        recursosSectionIdSeq = 3;
        recursosPageSeq = 5;
        recursosSectionMeta[CC_DEMO_SEC1] = { descriptionHtml: '' };
        recursosSectionMeta[CC_DEMO_SEC2] = {
            descriptionHtml:
                '<p class="ubits-body-md-regular">Simulaciones, marcos de referencia y evaluación para aplicar lo aprendido en situaciones reales de conflicto en el trabajo.</p>'
        };
        bindRecursosEventsOnce();
        var sectionsModel = [
            {
                key: CC_DEMO_SEC1,
                title: 'Sección 1: Fundamentos',
                pages: [
                    {
                        label: 'Comunicación para desescalar un conflicto',
                        pageKey: CC_DEMO_PG_VIDEO,
                        tipo: 'video',
                        active: true
                    },
                    {
                        label: 'Guía mapa de conflicto',
                        pageKey: CC_DEMO_PG_PDF,
                        tipo: 'pdf',
                        active: false
                    }
                ],
                active: true
            },
            {
                key: CC_DEMO_SEC2,
                title: 'Sección 2: Herramientas para resolver conflictos',
                pages: [
                    {
                        label: 'Simulador de conversación difícil',
                        pageKey: CC_DEMO_PG_SCORM_MANUAL,
                        tipo: 'scorm',
                        active: false
                    },
                    {
                        label: 'Conversaciones difíciles según Thomas-Kilmann',
                        pageKey: CC_DEMO_PG_SCORM_IA,
                        tipo: 'scorm',
                        active: false
                    },
                    { label: 'Evaluación', pageKey: CC_DEMO_PG_EVAL, tipo: 'evaluacion', active: false }
                ],
                active: false
            }
        ];
        recursosMountHtmlAndInit(recursosBuildIndiceMultiHtml(sectionsModel));
        var tgl = document.getElementById('crear-contenido-recursos-indice-sections-toggle');
        if (tgl) tgl.checked = true;
        recursosRestoreActivePagePreferred(CC_DEMO_PG_VIDEO);
        setRecursosEditorVisible(true);
        syncRecursosPaginasItemIconForPage(CC_DEMO_PG_EVAL, 'evaluacion');
        syncRecursosPageCounter();
        refreshCrearContenidoPageSiguienteState();
    }

    function seedCrearContenidoDemo(done) {
        if (!isCrearContenidoEmptyForDemo()) {
            if (typeof done === 'function') done();
            return;
        }
        window._ccDemoSeeded = true;
        seedCrearContenidoDemoPortada();
        fetchCrearContenidoDemoPdfBinary()
            .then(function (pdfBin) {
                seedCrearContenidoDemoRecursosPageStates(pdfBin);
                seedCrearContenidoDemoRecursosIndice();
                if (typeof done === 'function') done();
            })
            .catch(function () {
                seedCrearContenidoDemoRecursosPageStates(null);
                seedCrearContenidoDemoRecursosIndice();
                if (typeof done === 'function') done();
            });
    }

    function applyCrearContenidoPageHash() {
        var h = location.hash || '';
        if (h === HASH_PROMO_MODAL) {
            goToCrearContenidoPageStep(0, { skipUrl: true });
            var pathPromo = location.pathname + location.search;
            if (typeof history.replaceState === 'function') {
                history.replaceState(null, '', pathPromo + HASH_PAGE_PORTADA);
            }
            return;
        }
        if (isRecursosUrlHash(h)) {
            goToCrearContenidoPageStep(1, { skipUrl: true });
            if (h === HASH_DRAWER_RECURSOS || h === HASH_DRAWER_RECURSOS_ALIAS) {
                var pathR = location.pathname + location.search;
                history.replaceState(null, '', pathR + HASH_PAGE_RECURSOS);
            }
        } else if (h === HASH_PAGE_CERTIFICADO) {
            goToCrearContenidoPageStep(2, { skipUrl: true });
        } else if (h === HASH_PAGE_VISIBILIDAD || h === HASH_PAGE_PUBLICACION) {
            goToCrearContenidoPageStep(3, { skipUrl: true });
            if (h === HASH_PAGE_PUBLICACION && typeof history.replaceState === 'function') {
                history.replaceState(null, '', location.pathname + location.search + HASH_PAGE_VISIBILIDAD);
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
