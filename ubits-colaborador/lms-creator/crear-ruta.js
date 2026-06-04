/**
 * LMS Creator — crear-ruta.html (ruta de aprendizaje: agrupa contenidos).
 */
(function () {
    'use strict';

    var pageCurrentStep = 0;
    var portadaValidationFlash = false;
    var crearRutaInputApis = {};
    var crearRutaPortadaTrailerUrl = '';
    var crearRutaPortadaLastIaPrompt = '';
    var crearRutaPortadaLastSource = null;
    /** @type {Array<object>} */
    var rutaContenidosItems = [];

    var PORTADA_INVALID_CLASS = 'crear-contenido-portada-field--invalid';
    var CATEGORIA_SELECT_PLACEHOLDER_TEXT = 'Selecciona una opción';
    var STEP_IDS = ['portada', 'contenidos', 'certificado', 'publicacion'];

    /** Hashes URL por paso (misma convención que crear contenido). */
    var HASH_PAGE_PORTADA = '#portada';
    var HASH_PAGE_CONTENIDOS = '#contenidos';
    var HASH_PAGE_CERTIFICADO = '#certificado';
    var HASH_PAGE_VISIBILIDAD = '#visibilidad';
    /** Alias legacy del paso 4 */
    var HASH_PAGE_PUBLICACION = '#publicacion';

    /** Demo deep link — ruta de liderazgo */
    var CR_DEMO_TITLE = 'Ruta de liderazgo para equipos de alto rendimiento';
    var CR_DEMO_COVER_SRC = '../../images/cards-learn/portadas-ia/01-personas-en-oficina.jpg';
    var CR_DEMO_CATEGORIA_ID = 'cfq-015';
    var CR_DEMO_NIVEL_ID = 'niv-002';
    var CR_DEMO_CURSO_IDS = ['u014', 'u009', 'u040', 'u063', 'u069'];
    var CR_PUBLISH_CARD_ID = '24004';
    var CR_PUBLISH_COVER_PATH = 'images/cards-learn/portadas-ia/01-personas-en-oficina.jpg';

    function toast(type, msg, duration) {
        if (typeof window.showToast !== 'function') return;
        window.showToast(type, msg, { containerId: 'ubits-toast-container', duration: duration || 3500 });
    }

    function triggerFakeSave() {
        if (typeof window.renderSaveIndicator !== 'function') return;
        window.renderSaveIndicator('crear-ruta-save-indicator', { state: 'saving', size: 'xs', idleVariant: 'plain' });
        setTimeout(function () {
            window.renderSaveIndicator('crear-ruta-save-indicator', { state: 'saved', size: 'xs', idleVariant: 'plain' });
            setTimeout(function () {
                window.renderSaveIndicator('crear-ruta-save-indicator', { state: 'idle', size: 'xs', idleVariant: 'plain' });
            }, 2000);
        }, 600);
    }

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

    window.triggerCrearRutaFakeSave = triggerFakeSave;
    window.resolveCategoriaFiqshaLabel = resolveCategoriaFiqshaLabel;
    window.getCrearRutaContenidosItems = function () {
        return rutaContenidosItems.slice();
    };

    function stripHtml(html) {
        var t = document.createElement('div');
        t.innerHTML = html || '';
        return (t.textContent || '').replace(/\u00a0/g, ' ').trim();
    }

    function getPortadaDataUrl() {
        var block = document.getElementById('crear-ruta-img-trailer');
        var img = block && block.querySelector('.ubits-learn-img-trailer__img');
        if (!img || !img.getAttribute('src')) return null;
        return img.getAttribute('src');
    }

    function escAttr(s) {
        return String(s || '')
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;');
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
            '"><i class="fas fa-play"></i></button></div>';
        var generadoHost = '';
        if (figureOpts.aiGenerated && typeof window.getGeneradoConIaBadgeHtml === 'function') {
            generadoHost =
                '<div class="ubits-learn-img-trailer__generado-ia-host">' + window.getGeneradoConIaBadgeHtml() + '</div>';
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
        if (!loadOpts.skipMetaUpdate) {
            if (fromAi) {
                crearRutaPortadaLastSource = 'ai';
                if (loadOpts.iaPrompt) crearRutaPortadaLastIaPrompt = loadOpts.iaPrompt;
            } else {
                crearRutaPortadaLastIaPrompt = '';
                crearRutaPortadaLastSource = 'upload';
            }
        }
        var block = document.getElementById('crear-ruta-img-trailer');
        if (!block || !dataUrl) return;
        crearRutaPortadaTrailerUrl = trailerUrl != null ? String(trailerUrl).trim() : '';
        var hasTrailer = crearRutaPortadaTrailerUrl.length > 0;
        block.classList.add('ubits-learn-img-trailer--image');
        block.classList.toggle('ubits-learn-img-trailer--trailer', hasTrailer);
        block.classList.remove('ubits-learn-img-trailer--playing');
        block.classList.toggle('ubits-learn-img-trailer--ai-generated', fromAi);
        block.removeAttribute('data-img-trailer-init');
        block.removeAttribute('data-learn-img-trailer-init');
        if (typeof window.getLearnContentImgTrailerEditHtml !== 'function') return;
        block.innerHTML =
            (typeof window.getLearnContentImgTrailerEmptyHtml === 'function'
                ? window.getLearnContentImgTrailerEmptyHtml({ emptyVariant: 'ia' })
                : '') +
            buildPortadaFigureHtml(hasTrailer, { aiGenerated: fromAi }) +
            window.getLearnContentImgTrailerEditHtml({ editButtonId: 'crear-ruta-portada-edit' });
        var img = block.querySelector('.ubits-learn-img-trailer__img');
        if (img) img.setAttribute('src', dataUrl);
        if (hasTrailer) block.setAttribute('data-trailer-url', crearRutaPortadaTrailerUrl);
        else block.removeAttribute('data-trailer-url');
        wirePortadaCta();
        var editBtn = document.getElementById('crear-ruta-portada-edit');
        if (editBtn && !editBtn._crPortadaEditWired) {
            editBtn._crPortadaEditWired = true;
            editBtn.addEventListener('click', function (e) {
                e.preventDefault();
                openPortadaModal();
            });
        }
        if (typeof window.initLearnContentImgTrailer === 'function') {
            window.initLearnContentImgTrailer(block, {});
        }
        refreshSiguienteState();
    }

    function openPortadaModal() {
        if (typeof window.openPortadaImagenModal !== 'function') return;
        var d = getPortadaDataUrl();
        var reopen = {};
        if (d) {
            if (crearRutaPortadaLastSource === 'ai' && crearRutaPortadaLastIaPrompt) {
                reopen.editStartTab = 'ia';
                reopen.editIaPrompt = crearRutaPortadaLastIaPrompt;
                reopen.editIaPreviewSrc = d;
            } else {
                reopen.editStartTab = 'subir';
                reopen.editSubirDataUrl = d;
            }
        }
        window.openPortadaImagenModal({
            initialTrailerUrl: crearRutaPortadaTrailerUrl,
            onTrailerSaved: function (url) {
                crearRutaPortadaTrailerUrl = url != null ? String(url).trim() : '';
                var d2 = getPortadaDataUrl();
                if (d2) {
                    applyPortadaImagenCargada(d2, crearRutaPortadaTrailerUrl, {
                        fromAi: crearRutaPortadaLastSource === 'ai',
                        skipMetaUpdate: true
                    });
                }
            },
            onApply: function (payload) {
                if (!payload || !payload.dataUrl) return;
                var tv =
                    payload.trailerUrl != null && String(payload.trailerUrl).trim() !== ''
                        ? String(payload.trailerUrl).trim()
                        : crearRutaPortadaTrailerUrl;
                applyPortadaImagenCargada(payload.dataUrl, tv, {
                    fromAi: !!payload.fromAi,
                    iaPrompt: payload.iaPrompt
                });
                triggerFakeSave();
                clearPortadaInvalidMarks();
            },
            editStartTab: reopen.editStartTab,
            editIaPrompt: reopen.editIaPrompt,
            editIaPreviewSrc: reopen.editIaPreviewSrc,
            editSubirDataUrl: reopen.editSubirDataUrl
        });
    }

    function wirePortadaCta() {
        var cta = document.getElementById('crear-ruta-portada-cta');
        if (!cta || cta._crPortadaCtaWired) return;
        cta._crPortadaCtaWired = true;
        cta.addEventListener('click', function (e) {
            e.preventDefault();
            openPortadaModal();
        });
    }

    function buildSelectOptionsFromMaster() {
        var g = typeof window !== 'undefined' ? window : {};
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
                : [];
        return { niveles: niveles, categorias: cats };
    }

    function setCrearRutaSelectByValueId(inputApi, valueId, selectOptions, resolveLabel) {
        if (!inputApi || typeof inputApi.setValue !== 'function') return;
        var label = typeof resolveLabel === 'function' ? resolveLabel(valueId) : String(valueId || '');
        (selectOptions || []).forEach(function (opt) {
            if (opt && String(opt.value) === String(valueId)) {
                label = String(opt.text || label);
            }
        });
        inputApi.setValue(label);
    }

    function hashForCrearRutaPageStep(idx) {
        if (idx === 1) return HASH_PAGE_CONTENIDOS;
        if (idx === 2) return HASH_PAGE_CERTIFICADO;
        if (idx === 3) return HASH_PAGE_VISIBILIDAD;
        return HASH_PAGE_PORTADA;
    }

    function getDemoSeedLevelForHash(h) {
        if (h === HASH_PAGE_CONTENIDOS) return 1;
        if (h === HASH_PAGE_CERTIFICADO) return 2;
        if (h === HASH_PAGE_VISIBILIDAD || h === HASH_PAGE_PUBLICACION) return 3;
        return 0;
    }

    function isCrearRutaEmptyForDemo() {
        if (window._crDemoSeeded) return false;
        var titulo = document.getElementById('crear-ruta-titulo');
        if (titulo && String(titulo.value || '').trim()) return false;
        var block = document.getElementById('crear-ruta-img-trailer');
        if (
            block &&
            (block.classList.contains('ubits-learn-img-trailer--image') ||
                block.classList.contains('ubits-learn-img-trailer--trailer'))
        ) {
            return false;
        }
        if (rutaContenidosItems.length > 0) return false;
        return true;
    }

    function findDemoLiderazgoCourses() {
        if (typeof window.refreshCatalogoContenidosDrawer === 'function') {
            window.refreshCatalogoContenidosDrawer({ excludeRutas: true });
        }
        var catalog = window.CATALOGO_CURSOS_DRAWER || [];
        var out = [];
        CR_DEMO_CURSO_IDS.forEach(function (id) {
            var found = catalog.find(function (c) {
                return String(c.id) === String(id);
            });
            if (found) out.push(Object.assign({}, found));
        });
        return out;
    }

    function seedCrearRutaDemoPortada() {
        var titulo = document.getElementById('crear-ruta-titulo');
        if (titulo) titulo.value = CR_DEMO_TITLE;
        var rteRoot = document.getElementById('crear-ruta-rte');
        var descHtml =
            '<p class="ubits-body-md-regular">Secuencia formativa para desarrollar habilidades de liderazgo inclusivo, estratégico y adaptativo. Ideal para mandos medios y líderes de equipo que buscan impacto sostenible en la organización.</p>';
        if (typeof window.setRichTextHtml === 'function' && rteRoot) {
            window.setRichTextHtml(rteRoot, descHtml);
        }
        applyPortadaImagenCargada(CR_DEMO_COVER_SRC, '', {
            fromAi: true,
            iaPrompt: CR_DEMO_TITLE,
            skipMetaUpdate: false
        });
        var o = buildSelectOptionsFromMaster();
        var idiomaOpts = [
            { value: 'es', text: 'Español' },
            { value: 'en', text: 'Inglés' },
            { value: 'pt', text: 'Portugués' }
        ];
        setCrearRutaSelectByValueId(crearRutaInputApis.nivel, CR_DEMO_NIVEL_ID, o.niveles);
        setCrearRutaSelectByValueId(crearRutaInputApis.idioma, 'es', idiomaOpts);
        setCrearRutaSelectByValueId(
            crearRutaInputApis.categoria,
            CR_DEMO_CATEGORIA_ID,
            o.categorias,
            resolveCategoriaFiqshaLabel
        );
    }

    /**
     * Rellena pasos previos según deep link: 1 = portada; 2 = +contenidos; 3 = +certificado.
     * @param {1|2|3} level
     * @param {function} [done]
     */
    function seedCrearRutaDemo(level, done) {
        if (!isCrearRutaEmptyForDemo()) {
            if (typeof done === 'function') done();
            return;
        }
        window._crDemoSeeded = true;
        seedCrearRutaDemoPortada();
        if (level >= 2) {
            rutaContenidosItems = findDemoLiderazgoCourses();
            syncContenidosStepUi();
        }
        if (level >= 3 && typeof window.initCrearRutaCertificadoStepOnce === 'function') {
            window.initCrearRutaCertificadoStepOnce();
        }
        if (typeof done === 'function') done();
    }

    function applyCrearRutaPageHash() {
        var h = location.hash || '';
        if (h === HASH_PAGE_CONTENIDOS) {
            goToStep(1, { skipUrl: true });
        } else if (h === HASH_PAGE_CERTIFICADO) {
            goToStep(2, { skipUrl: true });
        } else if (h === HASH_PAGE_VISIBILIDAD || h === HASH_PAGE_PUBLICACION) {
            goToStep(3, { skipUrl: true });
            if (h === HASH_PAGE_PUBLICACION && typeof history.replaceState === 'function') {
                history.replaceState(null, '', location.pathname + location.search + HASH_PAGE_VISIBILIDAD);
            }
        } else if (h === HASH_PAGE_PORTADA || h === '') {
            goToStep(0, { skipUrl: true });
        } else {
            goToStep(0, { skipUrl: true });
        }
    }

    function initFichaInputs() {
        crearRutaInputApis = {};
        var o = buildSelectOptionsFromMaster();
        if (typeof window.createInput !== 'function') return;
        var tick = function () {
            refreshSiguienteState();
        };
        crearRutaInputApis.nivel = window.createInput({
            containerId: 'crear-ruta-in-nivel',
            type: 'select',
            label: 'Nivel',
            size: 'sm',
            selectOptions: o.niveles,
            value: o.niveles[0] ? o.niveles[0].value : '',
            onChange: tick
        });
        crearRutaInputApis.idioma = window.createInput({
            containerId: 'crear-ruta-in-idioma',
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
        var catOpts = [{ value: '', text: 'Selecciona una opción' }].concat(o.categorias);
        crearRutaInputApis.categoria = window.createInput({
            containerId: 'crear-ruta-in-categoria',
            type: 'select',
            label: 'Categoría',
            placeholder: CATEGORIA_SELECT_PLACEHOLDER_TEXT,
            size: 'sm',
            selectOptions: catOpts,
            value: '',
            onChange: tick
        });
        refreshSiguienteState();
    }

    function clearPortadaInvalidMarks() {
        document.querySelectorAll('#crear-ruta-step-portada .' + PORTADA_INVALID_CLASS).forEach(function (el) {
            el.classList.remove(PORTADA_INVALID_CLASS);
        });
    }

    function getPortadaCompleteness() {
        var missing = [];
        var titulo = document.getElementById('crear-ruta-titulo');
        if (!titulo || !titulo.value.trim()) missing.push('titulo');
        var block = document.getElementById('crear-ruta-img-trailer');
        var portadaOk =
            block &&
            (block.classList.contains('ubits-learn-img-trailer--image') ||
                block.classList.contains('ubits-learn-img-trailer--trailer'));
        if (!portadaOk) missing.push('portada');
        var descOk = false;
        if (typeof window.getRichTextHtml === 'function') {
            descOk = stripHtml(window.getRichTextHtml('#crear-ruta-rte')).length > 0;
        }
        if (!descOk) missing.push('descripcion');
        var a = crearRutaInputApis;
        if (!a.nivel || !String(a.nivel.getValue() || '').trim()) missing.push('nivel');
        if (!a.idioma || !String(a.idioma.getValue() || '').trim()) missing.push('idioma');
        var catDisp = a.categoria ? String(a.categoria.getValue() || '').trim() : '';
        var catOk =
            catDisp.length > 0 &&
            catDisp !== CATEGORIA_SELECT_PLACEHOLDER_TEXT &&
            catDisp !== 'Selecciona una opción...';
        if (!catOk) missing.push('categoria');
        return { complete: missing.length === 0, missing: missing };
    }

    function syncPortadaInvalidOutline() {
        if (!portadaValidationFlash) {
            clearPortadaInvalidMarks();
            return;
        }
        var st = getPortadaCompleteness();
        if (st.complete) {
            portadaValidationFlash = false;
            clearPortadaInvalidMarks();
            return;
        }
        clearPortadaInvalidMarks();
        st.missing.forEach(function (key) {
            if (key === 'titulo') {
                var lab = document.getElementById('crear-ruta-titulo');
                if (lab && lab.closest('.contenidos-creator-titulo-wrap')) {
                    lab.closest('.contenidos-creator-titulo-wrap').classList.add(PORTADA_INVALID_CLASS);
                }
            } else if (key === 'portada') {
                var media = document.querySelector('#crear-ruta-step-portada .crear-contenido-portada__cabecera-media');
                if (media) media.classList.add(PORTADA_INVALID_CLASS);
            } else if (key === 'descripcion') {
                var rte = document.getElementById('crear-ruta-rte');
                if (rte) rte.classList.add(PORTADA_INVALID_CLASS);
            } else if (key === 'nivel') {
                var n = document.getElementById('crear-ruta-in-nivel');
                if (n) n.classList.add(PORTADA_INVALID_CLASS);
            } else if (key === 'idioma') {
                var i = document.getElementById('crear-ruta-in-idioma');
                if (i) i.classList.add(PORTADA_INVALID_CLASS);
            } else if (key === 'categoria') {
                var c = document.getElementById('crear-ruta-in-categoria');
                if (c) c.classList.add(PORTADA_INVALID_CLASS);
            }
        });
    }

    function isPortadaComplete() {
        return getPortadaCompleteness().complete;
    }

    function getRutaContenidosIds() {
        return rutaContenidosItems.map(function (c) {
            return String(c.id);
        });
    }

    function getActiveStepId() {
        for (var i = 0; i < STEP_IDS.length; i++) {
            var sid = STEP_IDS[i];
            var el = document.getElementById('crear-ruta-step-' + sid);
            if (el && el.classList.contains('crear-ruta-step--visible')) return sid;
        }
        return STEP_IDS[pageCurrentStep] || 'portada';
    }

    function syncPageCurrentStepFromDom() {
        var sid = getActiveStepId();
        var idx = STEP_IDS.indexOf(sid);
        if (idx >= 0) pageCurrentStep = idx;
    }

    function setFooterSiguienteEnabled(enabled) {
        var sig = document.getElementById('crear-ruta-btn-siguiente');
        if (!sig) return;
        if (enabled) {
            sig.disabled = false;
            sig.removeAttribute('disabled');
            sig.setAttribute('aria-disabled', 'false');
        } else {
            sig.disabled = true;
            sig.setAttribute('disabled', 'disabled');
            sig.setAttribute('aria-disabled', 'true');
        }
    }

    function syncContenidosStepUi() {
        var emptyHost = document.getElementById('crear-ruta-contenidos-empty');
        var lista = document.getElementById('crear-ruta-contenidos-lista');
        var toolbar = document.getElementById('crear-ruta-contenidos-toolbar');
        var has = rutaContenidosItems.length > 0;
        if (toolbar) {
            toolbar.classList.toggle('crear-ruta-contenidos__toolbar--visible', has);
            if (has) {
                toolbar.removeAttribute('hidden');
            } else {
                toolbar.setAttribute('hidden', 'hidden');
            }
        }
        if (lista) {
            lista.hidden = !has;
            if (has) lista.removeAttribute('hidden');
            else lista.setAttribute('hidden', 'hidden');
        }
        if (emptyHost) emptyHost.style.display = has ? 'none' : '';
        try {
            if (!has) loadContenidosEmpty();
            else renderContenidosLista();
        } catch (err) {
            console.error('crear-ruta: error al renderizar contenidos', err);
        } finally {
            if (typeof window.refreshCrearRutaCertificadoUI === 'function') {
                window.refreshCrearRutaCertificadoUI();
            }
            refreshSiguienteState();
        }
    }

    function loadContenidosEmpty() {
        if (typeof window.loadEmptyState !== 'function') return;
        window.loadEmptyState('crear-ruta-contenidos-empty', {
            icon: 'fa-layer-group',
            iconSize: 'lg',
            title: 'Añade contenidos a tu ruta',
            description:
                'Busca cursos y otros formatos del catálogo para armar la secuencia de aprendizaje. El tiempo total de la ruta se calculará automáticamente.',
            buttons: {
                primary: {
                    text: 'Añadir contenido',
                    icon: 'fa-plus',
                    onClick: openContenidosDrawer
                }
            }
        });
    }

    function renderContenidosLista() {
        var lista = document.getElementById('crear-ruta-contenidos-lista');
        if (!lista || typeof window.loadCardContentCompact !== 'function') return;
        var cards = rutaContenidosItems.map(function (c) {
            return Object.assign({}, c, {
                listRow: true,
                contentId: String(c.id),
                showActionsMenu: true,
                draggable: true,
                progress: 0,
                status: 'default'
            });
        });
        window.loadCardContentCompact('crear-ruta-contenidos-lista', cards);
        if (typeof window.initCardContentCompactList === 'function') {
            window.initCardContentCompactList(lista, {
                menuOverlayIdPrefix: 'crear-ruta-card-menu',
                onAction: function (detail) {
                    if (detail.action === 'eliminar') {
                        rutaContenidosItems = rutaContenidosItems.filter(function (x) {
                            return String(x.id) !== String(detail.contentId);
                        });
                        syncContenidosStepUi();
                        triggerFakeSave();
                    }
                },
                onReorder: syncOrdenFromDom
            });
        }
        if (!lista._crReorderBound) {
            lista._crReorderBound = true;
            lista.addEventListener('ubits-card-content-compact-list-reorder', syncOrdenFromDom);
        }
    }

    function syncOrdenFromDom() {
        var lista = document.getElementById('crear-ruta-contenidos-lista');
        if (!lista) return;
        var ordered = [];
        lista.querySelectorAll('.course-card-compact[data-content-id]').forEach(function (el) {
            var id = el.getAttribute('data-content-id');
            var found = rutaContenidosItems.find(function (c) {
                return String(c.id) === String(id);
            });
            if (found) ordered.push(found);
        });
        if (ordered.length === rutaContenidosItems.length) rutaContenidosItems = ordered;
    }

    function openContenidosDrawer() {
        if (typeof window.openCrearRutaContenidosDrawer !== 'function') return;
        window.openCrearRutaContenidosDrawer({
            alreadyAddedIds: getRutaContenidosIds(),
            onConfirm: function (selected) {
                var agregados = 0;
                selected.forEach(function (c) {
                    if (
                        !rutaContenidosItems.some(function (x) {
                            return String(x.id) === String(c.id);
                        })
                    ) {
                        rutaContenidosItems.push(c);
                        agregados += 1;
                    }
                });
                syncContenidosStepUi();
                triggerFakeSave();
                requestAnimationFrame(refreshSiguienteState);
                return agregados;
            }
        });
    }

    function refreshSiguienteState() {
        var sig = document.getElementById('crear-ruta-btn-siguiente');
        if (!sig) return;
        syncPageCurrentStepFromDom();
        var stepId = getActiveStepId();
        var enabled = false;
        if (stepId === 'portada') {
            enabled = isPortadaComplete();
        } else if (stepId === 'contenidos') {
            enabled = rutaContenidosItems.length > 0;
        } else {
            enabled = true;
        }
        setFooterSiguienteEnabled(enabled);
        if (stepId === 'publicacion') {
            var span = sig.querySelector('span');
            if (span) span.textContent = 'Publicar';
        } else {
            var span2 = sig.querySelector('span');
            if (span2) span2.textContent = 'Siguiente';
        }
        syncPortadaInvalidOutline();
    }

    window.refreshCrearRutaSiguienteState = refreshSiguienteState;

    function updateFooterNav(stepIndex) {
        var ant = document.getElementById('crear-ruta-btn-anterior');
        if (ant) {
            if (stepIndex >= 1) {
                ant.style.display = '';
                ant.removeAttribute('aria-hidden');
                ant.disabled = false;
            } else {
                ant.style.display = 'none';
                ant.setAttribute('aria-hidden', 'true');
                ant.disabled = true;
            }
        }
        refreshSiguienteState();
    }

    function goToStep(stepIndex, opts) {
        opts = opts || {};
        var idx = Math.max(0, Math.min(3, stepIndex));
        pageCurrentStep = idx;
        STEP_IDS.forEach(function (sid, i) {
            var el = document.getElementById('crear-ruta-step-' + sid);
            if (!el) return;
            var visible = i === idx;
            el.classList.toggle('crear-ruta-step--visible', visible);
            el.classList.toggle('crear-contenido-step--visible', visible);
        });
        if (typeof window.setStepperStepStates === 'function') {
            var olDesk = document.getElementById('crear-ruta-stepper-ol');
            var olMob = document.getElementById('crear-ruta-stepper-ol-mobile');
            if (olDesk) window.setStepperStepStates(olDesk, idx);
            if (olMob) window.setStepperStepStates(olMob, idx);
        }
        if (idx === 1) syncContenidosStepUi();
        if (idx === 2 && typeof window.initCrearRutaCertificadoStepOnce === 'function') {
            window.initCrearRutaCertificadoStepOnce();
        }
        if (idx === 3 && typeof window.initCrearRutaPublicacionStepOnce === 'function') {
            window.initCrearRutaPublicacionStepOnce();
        }
        updateFooterNav(idx);
        if (typeof window.initTooltip === 'function') {
            window.initTooltip('#crear-ruta-root [data-tooltip]');
        }
        if (!opts.skipUrl) {
            var target = hashForCrearRutaPageStep(idx);
            if (location.hash !== target) {
                history.replaceState(null, '', location.pathname + location.search + target);
            }
        }
        requestAnimationFrame(syncRailHeight);
    }

    function onSiguienteClick() {
        syncPageCurrentStepFromDom();
        var stepId = getActiveStepId();
        var sig = document.getElementById('crear-ruta-btn-siguiente');
        if (sig && sig.disabled) {
            if (stepId === 'portada') {
                portadaValidationFlash = true;
                syncPortadaInvalidOutline();
                toast('warning', 'Completa todos los campos obligatorios de la portada.');
            } else if (stepId === 'contenidos') {
                toast('warning', 'Añade al menos un contenido a la ruta.');
            }
            return;
        }
        if (stepId === 'portada') {
            portadaValidationFlash = false;
            clearPortadaInvalidMarks();
            goToStep(1);
            return;
        }
        if (stepId === 'contenidos') {
            goToStep(2);
            return;
        }
        if (stepId === 'certificado') {
            goToStep(3);
            return;
        }
        if (stepId === 'publicacion') {
            finalizeCrearRutaFlow();
            return;
        }
    }

    function getRutaDurationMinutesForPublish() {
        var total = 0;
        rutaContenidosItems.forEach(function (c) {
            var raw = c.duration != null ? String(c.duration) : '';
            var match = raw.match(/(\d+)/);
            if (match) total += parseInt(match[1], 10);
        });
        return total > 0 ? total : 30;
    }

    function getCrearRutaCategoriaFiqshaIdFromForm() {
        var catDisp = crearRutaInputApis.categoria
            ? String(crearRutaInputApis.categoria.getValue() || '').trim()
            : '';
        if (!catDisp || catDisp === CATEGORIA_SELECT_PLACEHOLDER_TEXT || catDisp === 'Selecciona una opción...') {
            return '';
        }
        var cats =
            window.BD_MASTER_CATEGORIAS_FIQSHA && window.BD_MASTER_CATEGORIAS_FIQSHA.categorias
                ? window.BD_MASTER_CATEGORIAS_FIQSHA.categorias
                : [];
        for (var i = 0; i < cats.length; i++) {
            var c = cats[i];
            if (!c) continue;
            if (String(c.nombre) === catDisp || String(c.id) === catDisp) return String(c.id);
        }
        return '';
    }

    function finalizeCrearRutaFlow() {
        try {
            var tituloEl = document.getElementById('crear-ruta-titulo');
            var titulo =
                tituloEl && String(tituloEl.value || '').trim()
                    ? String(tituloEl.value).trim()
                    : CR_DEMO_TITLE;
            var visibilidad =
                typeof window.getCrearRutaVisibilidad === 'function'
                    ? window.getCrearRutaVisibilidad()
                    : 'borrador';
            var categoriaFiqshaId = getCrearRutaCategoriaFiqshaIdFromForm() || CR_DEMO_CATEGORIA_ID;
            sessionStorage.setItem(
                'ubits-toast-pending',
                JSON.stringify({ type: 'success', message: 'Ruta creada exitosamente' })
            );
            sessionStorage.setItem(
                'ubits-contenidos-pin-recien-creado',
                JSON.stringify({
                    id: CR_PUBLISH_CARD_ID,
                    visibilidad: visibilidad,
                    titulo: titulo,
                    imagen: CR_PUBLISH_COVER_PATH,
                    tiempoValor: getRutaDurationMinutesForPublish(),
                    categoriaFiqshaId: categoriaFiqshaId
                })
            );
        } catch (e) {}
        window.location.href = 'contenidos.html';
    }

    function wireStepperClicks() {
        ['crear-ruta-stepper-ol', 'crear-ruta-stepper-ol-mobile'].forEach(function (olId) {
            var ol = document.getElementById(olId);
            if (!ol) return;
            ol.querySelectorAll('.ubits-stepper__step').forEach(function (li, idx) {
                li.style.cursor = 'pointer';
                li.addEventListener('click', function () {
                    if (idx > pageCurrentStep && idx === 1 && !isPortadaComplete()) {
                        portadaValidationFlash = true;
                        syncPortadaInvalidOutline();
                        toast('warning', 'Completa la portada antes de continuar.');
                        return;
                    }
                    if (idx > 1 && rutaContenidosItems.length === 0) {
                        toast('warning', 'Añade al menos un contenido antes de avanzar.');
                        return;
                    }
                    goToStep(idx);
                });
            });
        });
    }

    function syncRailHeight() {
        var main = document.getElementById('crear-ruta-main');
        if (!main) return;
        document.documentElement.style.setProperty('--cc-main-h', main.clientHeight + 'px');
    }

    function init() {
        if (typeof window.renderSaveIndicator === 'function') {
            window.renderSaveIndicator('crear-ruta-save-indicator', { state: 'idle', size: 'xs', idleVariant: 'plain' });
        }
        syncRailHeight();
        window.addEventListener('resize', syncRailHeight);
        if (typeof window.initTooltip === 'function') {
            window.initTooltip('#crear-ruta-root [data-tooltip]');
        }
        if (typeof window.initRichTextEditor === 'function') {
            var rte = document.getElementById('crear-ruta-rte');
            if (rte) window.initRichTextEditor(rte);
        }
        var imgBlock = document.getElementById('crear-ruta-img-trailer');
        if (imgBlock && typeof window.initLearnContentImgTrailer === 'function') {
            window.initLearnContentImgTrailer(imgBlock, {});
        }
        wirePortadaCta();
        initFichaInputs();
        var frame = document.getElementById('crear-ruta-stepper-frame');
        var toggle = document.getElementById('crear-ruta-stepper-toggle');
        if (frame && toggle && typeof window.wireStepperVerticalCollapse === 'function') {
            window.wireStepperVerticalCollapse(frame, toggle, { creatorRail: true });
        }
        var portadaStep = document.getElementById('crear-ruta-step-portada');
        if (portadaStep) {
            portadaStep.addEventListener('input', refreshSiguienteState);
            portadaStep.addEventListener('change', refreshSiguienteState);
        }
        document.getElementById('crear-ruta-btn-anadir-contenidos') &&
            document.getElementById('crear-ruta-btn-anadir-contenidos').addEventListener('click', openContenidosDrawer);
        document.getElementById('crear-ruta-btn-siguiente') &&
            document.getElementById('crear-ruta-btn-siguiente').addEventListener('click', onSiguienteClick);
        document.getElementById('crear-ruta-btn-anterior') &&
            document.getElementById('crear-ruta-btn-anterior').addEventListener('click', function () {
                if (pageCurrentStep > 0) goToStep(pageCurrentStep - 1);
            });
        wireStepperClicks();
        var initialHash = location.hash || '';
        var seedLevel = getDemoSeedLevelForHash(initialHash);
        if (seedLevel > 0 && isCrearRutaEmptyForDemo()) {
            seedCrearRutaDemo(seedLevel, function () {
                applyCrearRutaPageHash();
                setTimeout(refreshSiguienteState, 0);
            });
        } else {
            applyCrearRutaPageHash();
            syncContenidosStepUi();
            setTimeout(refreshSiguienteState, 400);
        }
        window.addEventListener('hashchange', applyCrearRutaPageHash);
    }

    document.addEventListener('DOMContentLoaded', init);
})();
