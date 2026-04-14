/**
 * LMS Creator — Drawer «Crear contenido» (pasos 1 Portada, 2 Recursos — más pasos después).
 * Depende: openDrawer/closeDrawer, createInput, initRichTextEditor,
 * learn-content-img-trailer.js (getLearnContentImgTrailerEmptyHtml, getLearnContentImgTrailerEditHtml, initLearnContentImgTrailer),
 * portada-media-modal.js (openPortadaTrailerModal), modal.js (openModal),
 * initTooltip, renderSaveIndicator, setStepperStepStates, wireStepperVerticalCollapse, BD_MASTER_*,
 * indice-creator.js (+ paginas-creator, seccion-creator, switch), empty-state.js (loadEmptyState),
 * resources-card.js + resources-block.js (resourcesBlockHtml, initResourcesBlockFields).
 */
(function (global) {
    'use strict';

    var OVERLAY_ID = 'crear-contenido-drawer-overlay';
    /** Paso 1 — Portada (URL compartible). */
    var CREAR_CONTENIDO_URL_HASH = '#crear-contenido';
    /** Paso 2 — Recursos (prototipo / empty; sin paso 1 no se avanza por UI). */
    var CREAR_CONTENIDO_RECURSOS_URL_HASH = '#crear-contenido-recursos';
    /** Alias por si se comparte o enlaza con el nombre «step» en el hash. */
    var CREAR_CONTENIDO_STEP_RECURSOS_URL_HASH = '#crear-contenido-step-recursos';

    function isCrearContenidoRecursosUrlHash(h) {
        return h === CREAR_CONTENIDO_RECURSOS_URL_HASH || h === CREAR_CONTENIDO_STEP_RECURSOS_URL_HASH;
    }
    var crearContenidoOpenedWithHistoryPush = false;
    /** 0 = Portada, 1 = Recursos (índice + preview). */
    var crearContenidoCurrentStep = 0;
    /** Índice creator + empty state del paso 2 ya montados en este overlay. */
    var crearContenidoRecursosUiDone = false;
    /** Contador de keys para filas de página en el prototipo. */
    var crearContenidoRecursosPageSeq = 0;
    /** True tras intentar «Siguiente» en Recursos con alguna página sin título válido. */
    var crearContenidoRecursosTitlesValidationFlash = false;
    /**
     * ID sin guiones: empty-state.js define window.ubitsEmptyStatePrimary_${id}(); los guiones rompen el onclick.
     */
    var CREAR_CONTENIDO_RECURSOS_EMPTY_HOST_ID = 'ccCrearContenidoRecursosEmpty';
    /** Listeners de documento del paso 2 (add page, activate, etc.) — una sola vez por carga de contenidos.html. */
    var crearContenidoRecursosEventsBound = false;
    /** APIs devueltas por createInput (paso 1). */
    var crearContenidoInputApis = {};
    /** URL del tráiler (paso portada), persistido al confirmar el modal. */
    var crearContenidoPortadaTrailerUrl = '';
    /** Tras intentar ir a Recursos sin portada completa: mostrar bordes en obligatorios hasta completarlos. */
    var crearContenidoPortadaValidationFlash = false;
    var PORTADA_INVALID_CLASS = 'crear-contenido-portada-field--invalid';
    var CATEGORIA_SELECT_PLACEHOLDER_TEXT = 'Selecciona una opción';

    function syncUrlAfterCrearContenidoDrawerOpen() {
        if (location.hash !== CREAR_CONTENIDO_URL_HASH) {
            history.pushState(
                { ubitsLmsCreatorCrearContenido: true },
                '',
                location.pathname + location.search + CREAR_CONTENIDO_URL_HASH
            );
            crearContenidoOpenedWithHistoryPush = true;
        } else {
            crearContenidoOpenedWithHistoryPush = false;
        }
    }

    function syncUrlAfterCrearContenidoDrawerClose() {
        var h = location.hash || '';
        if (h !== CREAR_CONTENIDO_URL_HASH && !isCrearContenidoRecursosUrlHash(h)) {
            crearContenidoOpenedWithHistoryPush = false;
            return;
        }
        crearContenidoOpenedWithHistoryPush = false;
        history.replaceState(null, '', location.pathname + location.search);
    }

    function onPopStateCrearContenidoDrawer() {
        var overlay = document.getElementById(OVERLAY_ID);
        if (!overlay || overlay.getAttribute('aria-hidden') === 'true') return;
        var h = location.hash || '';
        if (h === CREAR_CONTENIDO_URL_HASH) {
            goToCrearContenidoStep(0, { skipUrl: true });
            return;
        }
        if (isCrearContenidoRecursosUrlHash(h)) {
            goToCrearContenidoStep(1, { skipUrl: true });
            return;
        }
        crearContenidoOpenedWithHistoryPush = false;
        if (typeof closeDrawer === 'function') {
            closeDrawer(OVERLAY_ID);
        }
        document.body.classList.remove('crear-contenido-drawer-abierto');
        crearContenidoInputApis = {};
        crearContenidoPortadaTrailerUrl = '';
        crearContenidoCurrentStep = 0;
        crearContenidoRecursosUiDone = false;
        syncUrlAfterCrearContenidoDrawerClose();
    }

    function onHashChangeCrearContenidoDrawer() {
        var h = location.hash || '';
        var overlay = document.getElementById(OVERLAY_ID);
        if (!overlay || overlay.getAttribute('aria-hidden') === 'true') {
            if (h === CREAR_CONTENIDO_URL_HASH || isCrearContenidoRecursosUrlHash(h)) {
                tryOpenCrearContenidoFromUrlHash();
            }
            return;
        }
        if (h === CREAR_CONTENIDO_URL_HASH) {
            goToCrearContenidoStep(0, { skipUrl: true });
        } else if (isCrearContenidoRecursosUrlHash(h)) {
            goToCrearContenidoStep(1, { skipUrl: true });
        }
    }

    if (typeof window !== 'undefined' && window.addEventListener) {
        window.addEventListener('popstate', onPopStateCrearContenidoDrawer);
        window.addEventListener('hashchange', onHashChangeCrearContenidoDrawer);
    }

    function tryOpenCrearContenidoFromUrlHash() {
        var h = location.hash || '';
        if (h !== CREAR_CONTENIDO_URL_HASH && !isCrearContenidoRecursosUrlHash(h)) return;
        if (document.body.classList.contains('crear-contenido-drawer-abierto')) return;
        openCrearContenidoDrawer({ initialStep: isCrearContenidoRecursosUrlHash(h) ? 1 : 0 });
    }

    function esc(s) {
        if (s == null) return '';
        var d = document.createElement('div');
        d.textContent = s;
        return d.innerHTML;
    }

    /**
     * Variante oficial horizontal compacta (solo CSS móvil ≤1023px la muestra; desktop usa el vertical).
     * Incluye li.ubits-stepper__rail entre pasos (estructura oficial del componente).
     */
    function getStepperHtmlMobile() {
        return (
            '<nav class="crear-contenido-stepper-mobile" aria-label="Pasos de creación">' +
            '  <ol class="ubits-stepper ubits-stepper--horizontal ubits-stepper--horizontal-compact" id="crear-contenido-stepper-ol-mobile">' +
            '    <li class="ubits-stepper__step ubits-stepper__step--active" data-step-label="Portada" aria-current="step">' +
            '      <span class="ubits-stepper__mark" aria-hidden="true"><span class="ubits-stepper__mark-num">1</span><i class="far fa-check" aria-hidden="true"></i></span>' +
            '      <span class="ubits-stepper__label">Portada</span>' +
            '    </li>' +
            '    <li class="ubits-stepper__rail" aria-hidden="true"></li>' +
            '    <li class="ubits-stepper__step ubits-stepper__step--pending" data-step-label="Recursos">' +
            '      <span class="ubits-stepper__mark" aria-hidden="true"><span class="ubits-stepper__mark-num">2</span><i class="far fa-check" aria-hidden="true"></i></span>' +
            '      <span class="ubits-stepper__label">Recursos</span>' +
            '    </li>' +
            '    <li class="ubits-stepper__rail" aria-hidden="true"></li>' +
            '    <li class="ubits-stepper__step ubits-stepper__step--pending" data-step-label="Certificado">' +
            '      <span class="ubits-stepper__mark" aria-hidden="true"><span class="ubits-stepper__mark-num">3</span><i class="far fa-check" aria-hidden="true"></i></span>' +
            '      <span class="ubits-stepper__label">Certificado</span>' +
            '    </li>' +
            '    <li class="ubits-stepper__rail" aria-hidden="true"></li>' +
            '    <li class="ubits-stepper__step ubits-stepper__step--pending" data-step-label="Publicación">' +
            '      <span class="ubits-stepper__mark" aria-hidden="true"><span class="ubits-stepper__mark-num">4</span><i class="far fa-check" aria-hidden="true"></i></span>' +
            '      <span class="ubits-stepper__label">Publicación</span>' +
            '    </li>' +
            '  </ol>' +
            '</nav>'
        );
    }

    function getStepperHtml() {
        return (
            '<div class="ubits-stepper__vertical-frame ubits-stepper__vertical-frame--creator-rail is-collapsed" id="crear-contenido-stepper-frame">' +
            '  <nav class="ubits-stepper__vertical-nav" aria-label="Pasos de creación">' +
            '    <ol class="ubits-stepper ubits-stepper--vertical" id="crear-contenido-stepper-ol">' +
            '      <li class="ubits-stepper__step ubits-stepper__step--active" data-step-label="Portada" aria-current="step">' +
            '        <span class="ubits-stepper__mark" aria-hidden="true"><span class="ubits-stepper__mark-num">1</span><i class="far fa-check" aria-hidden="true"></i></span>' +
            '        <span class="ubits-stepper__label">Portada</span>' +
            '      </li>' +
            '      <li class="ubits-stepper__step ubits-stepper__step--pending" data-step-label="Recursos">' +
            '        <span class="ubits-stepper__mark" aria-hidden="true"><span class="ubits-stepper__mark-num">2</span><i class="far fa-check" aria-hidden="true"></i></span>' +
            '        <span class="ubits-stepper__label">Recursos</span>' +
            '      </li>' +
            '      <li class="ubits-stepper__step ubits-stepper__step--pending" data-step-label="Certificado">' +
            '        <span class="ubits-stepper__mark" aria-hidden="true"><span class="ubits-stepper__mark-num">3</span><i class="far fa-check" aria-hidden="true"></i></span>' +
            '        <span class="ubits-stepper__label">Certificado</span>' +
            '      </li>' +
            '      <li class="ubits-stepper__step ubits-stepper__step--pending" data-step-label="Publicación">' +
            '        <span class="ubits-stepper__mark" aria-hidden="true"><span class="ubits-stepper__mark-num">4</span><i class="far fa-check" aria-hidden="true"></i></span>' +
            '        <span class="ubits-stepper__label">Publicación</span>' +
            '      </li>' +
            '    </ol>' +
            '  </nav>' +
            '  <div class="ubits-stepper__vertical-footer">' +
            '    <button type="button" class="nav-button ubits-stepper__vertical-toggle" id="crear-contenido-stepper-toggle" aria-expanded="false" aria-label="Expandir la lista de pasos">' +
            '      <i class="far fa-angles-right" aria-hidden="true"></i>' +
            '    </button>' +
            '  </div>' +
            '</div>'
        );
    }

    /**
     * @param {{ cabeceraUnica?: boolean }} [options] - Si true, sin tarjeta propia: va dentro de la franja única título+miniatura.
     */
    function getMiniaturaBlockHtml(options) {
        var o = options || {};
        var cardClass = 'contenidos-creator-card';
        if (o.cabeceraUnica) {
            cardClass += ' contenidos-creator-card--dentro-cabecera';
        }
        return (
            '<div class="' + cardClass + '">' +
            '  <div id="crear-contenido-img-trailer" class="ubits-learn-img-trailer" data-learn-img-trailer-init role="region" aria-label="Miniatura del contenido">' +
            getLearnContentImgTrailerEmptyHtml({ ctaId: 'crear-contenido-portada-cta' }) +
            '  </div>' +
            '</div>'
        );
    }

    function getRichTextCardHtml() {
        return (
            '<div class="contenidos-creator-card contenidos-creator-card--descripcion">' +
            '  <div id="crear-contenido-rte" class="ubits-rich-text-editor" data-rich-text-editor>' +
            '    <div class="ubits-rich-text-editor__label-row">' +
            '      <p class="ubits-rich-text-editor__label ubits-body-sm-semibold">Descripción</p>' +
            '      <p class="ubits-rich-text-editor__hint ubits-body-xs-regular">(Obligatorio)</p>' +
            '    </div>' +
            '    <div class="ubits-rich-text-editor__toolbar" role="toolbar" aria-label="Formato">' +
            '      <button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only" data-rich-cmd="bold" aria-label="Negrita"><i class="fas fa-bold"></i></button>' +
            '      <button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only" data-rich-cmd="italic" aria-label="Cursiva"><i class="fas fa-italic"></i></button>' +
            '      <button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only" data-rich-cmd="underline" aria-label="Subrayado"><i class="fas fa-underline"></i></button>' +
            '      <span class="ubits-rich-text-editor__sep" aria-hidden="true"></span>' +
            '      <button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only" data-rich-cmd="insertOrderedList" aria-label="Lista numerada"><i class="fas fa-list-ol"></i></button>' +
            '      <button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only" data-rich-cmd="insertUnorderedList" aria-label="Lista con viñetas"><i class="fas fa-list-ul"></i></button>' +
            '      <span class="ubits-rich-text-editor__sep" aria-hidden="true"></span>' +
            '      <button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only" data-rich-cmd="justifyLeft" aria-label="Alinear izquierda"><i class="fas fa-align-left"></i></button>' +
            '      <button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only" data-rich-cmd="justifyCenter" aria-label="Centrar"><i class="fas fa-align-center"></i></button>' +
            '      <button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only" data-rich-cmd="justifyRight" aria-label="Alinear derecha"><i class="fas fa-align-right"></i></button>' +
            '      <span class="ubits-rich-text-editor__sep" aria-hidden="true"></span>' +
            '      <button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only" data-rich-cmd="insertImage" aria-label="Imagen"><i class="far fa-image"></i></button>' +
            '      <button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only" data-rich-cmd="insertVideo" aria-label="Video"><i class="fas fa-film"></i></button>' +
            '      <button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only" data-rich-cmd="createLink" aria-label="Enlace"><i class="fas fa-link"></i></button>' +
            '      <span class="ubits-rich-text-editor__sep" aria-hidden="true"></span>' +
            '      <button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only" data-rich-cmd="formatCode" aria-label="Código"><i class="fas fa-code"></i></button>' +
            '      <button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only" data-rich-cmd="removeFormat" aria-label="Quitar formato"><i class="fas fa-remove-format"></i></button>' +
            '    </div>' +
            '    <input type="file" class="ubits-rich-text-editor__file" accept="image/*" tabindex="-1" aria-hidden="true">' +
            '    <div class="ubits-rich-text-editor__editor-shell">' +
            '      <div class="ubits-rich-text-editor__field ubits-body-md-regular is-empty" contenteditable="true" role="textbox" aria-multiline="true" data-placeholder="Añade una descripción para el contenido aquí" id="crear-contenido-rte-field"></div>' +
            '    </div>' +
            '  </div>' +
            '</div>'
        );
    }

    function getFichaTecnicaHostsHtml() {
        return (
            '<div class="contenidos-creator-card">' +
            '  <p class="contenidos-creator-field-label ubits-body-sm-semibold">Ficha técnica</p>' +
            '  <div id="crear-contenido-in-tipo"></div>' +
            '  <div class="contenidos-creator-ficha-row">' +
            '    <div id="crear-contenido-in-nivel"></div>' +
            '    <div id="crear-contenido-in-idioma"></div>' +
            '  </div>' +
            '  <div class="contenidos-creator-ficha-row contenidos-creator-ficha-row--tiempo-unidad">' +
            '    <div id="crear-contenido-in-tiempo"></div>' +
            '    <div id="crear-contenido-in-unidad"></div>' +
            '  </div>' +
            '  <div id="crear-contenido-in-categoria"></div>' +
            '</div>'
        );
    }

    function getCrearContenidoBodyHtml() {
        return (
            '<div class="crear-contenido-editor-workspace">' +
            '  <div class="crear-contenido-editor__rail">' +
            getStepperHtml() +
            getStepperHtmlMobile() +
            '  </div>' +
            '  <div class="crear-contenido-editor__main">' +
            '    <div id="crear-contenido-step-portada" class="crear-contenido-step crear-contenido-step--portada crear-contenido-step--visible" data-crear-step="portada">' +
            '      <div class="crear-contenido-portada__cabecera">' +
            '        <div class="crear-contenido-portada__cabecera-titulo">' +
            '          <label class="contenidos-creator-titulo-wrap">' +
            '            <input type="text" id="crear-contenido-titulo" class="contenidos-creator-titulo-input ubits-display-d3-bold" placeholder="Escribe aquí el título del contenido" autocomplete="off" maxlength="180" aria-label="Nombre del contenido">' +
            '            <span class="contenidos-creator-titulo-hint ubits-body-xs-regular">Máximo 180 caracteres.</span>' +
            '          </label>' +
            '        </div>' +
            '        <div class="crear-contenido-portada__cabecera-media">' +
            getMiniaturaBlockHtml({ cabeceraUnica: true }) +
            '        </div>' +
            '      </div>' +
            '      <div class="crear-contenido-portada__cuerpo">' +
            '        <div class="crear-contenido-portada__cuerpo-desc">' +
            getRichTextCardHtml() +
            '        </div>' +
            '        <div class="crear-contenido-portada__cuerpo-ficha">' +
            getFichaTecnicaHostsHtml() +
            '        </div>' +
            '      </div>' +
            '    </div>' +
            '    <div id="crear-contenido-step-recursos" class="crear-contenido-step crear-contenido-step--recursos" data-crear-step="recursos">' +
            '      <div class="crear-contenido-recursos__workspace">' +
            '        <aside class="crear-contenido-recursos__indice" aria-label="Índice del contenido">' +
            '          <div id="crear-contenido-recursos-indice-mount" class="crear-contenido-recursos__indice-mount"></div>' +
            '        </aside>' +
            '        <div id="crear-contenido-recursos-preview" class="crear-contenido-recursos__preview" role="region" aria-label="Vista previa de recursos">' +
            '          <div id="' +
            CREAR_CONTENIDO_RECURSOS_EMPTY_HOST_ID +
            '" class="crear-contenido-recursos__empty-host"></div>' +
            '          <div id="crear-contenido-recursos-page-title-section" class="crear-contenido-recursos__page-title-section" hidden>' +
            '            <label class="contenidos-creator-titulo-wrap crear-contenido-recursos__page-title-wrap">' +
            '              <input type="text" id="crear-contenido-recursos-page-title" class="contenidos-creator-titulo-input ubits-heading-h2" placeholder="Escribe el título de la página" autocomplete="off" maxlength="120" aria-label="Título de la página">' +
            '            </label>' +
            '          </div>' +
            '          <div id="crear-contenido-recursos-resources-mount" class="crear-contenido-recursos__resources-mount" hidden></div>' +
            '        </div>' +
            '      </div>' +
            '    </div>' +
            '  </div>' +
            '</div>'
        );
    }

    function wireCrearContenidoDrawerHeader(overlay) {
        if (!overlay) return;
        var titleSpan = overlay.querySelector('.ubits-drawer-header .ubits-drawer-title');
        if (!titleSpan || !titleSpan.parentNode) return;
        var headerText = titleSpan.parentNode;
        headerText.classList.add('contenido-borrador-editor__drawer-header-text');
        var row = document.createElement('div');
        row.className = 'contenido-borrador-editor__drawer-title-row';
        headerText.insertBefore(row, titleSpan);
        row.appendChild(titleSpan);
        var tag = document.createElement('span');
        tag.className = 'ubits-status-tag ubits-status-tag--sm ubits-status-tag--info';
        tag.innerHTML = '<span class="ubits-status-tag__text">Borrador</span>';
        row.appendChild(tag);
        var saveHost = document.createElement('span');
        saveHost.id = 'crear-contenido-save-indicator';
        saveHost.className = 'contenido-borrador-editor__drawer-save-host';
        row.appendChild(saveHost);
        if (typeof renderSaveIndicator === 'function') {
            renderSaveIndicator('crear-contenido-save-indicator', {
                state: 'idle',
                idleVariant: 'plain',
                size: 'xs'
            });
        }
        var closeBtn = overlay.querySelector('.ubits-drawer-close');
        if (closeBtn) {
            closeBtn.setAttribute('data-tooltip', 'Salir del proceso');
            closeBtn.setAttribute('data-tooltip-delay', '1000');
        }
    }

    function buildPortadaFigureHtml(hasTrailer) {
        var playLabel =
            global.LEARN_CONTENT_IMG_TRAILER_DEFAULTS && global.LEARN_CONTENT_IMG_TRAILER_DEFAULTS.playAriaLabel
                ? global.LEARN_CONTENT_IMG_TRAILER_DEFAULTS.playAriaLabel
                : 'Reproducir tráiler';
        var scrim =
            '<div class="ubits-learn-img-trailer__trailer-scrim" aria-hidden="false">' +
            '<span class="ubits-learn-img-trailer__trailer-scrim-bg" aria-hidden="true"></span>' +
            '<button type="button" class="ubits-learn-img-trailer__play" aria-label="' +
            esc(playLabel) +
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
        block.innerHTML =
            getLearnContentImgTrailerEmptyHtml({}) +
            buildPortadaFigureHtml(hasTrailer) +
            getLearnContentImgTrailerEditHtml({ editButtonId: 'crear-contenido-portada-cambiar' });
        var img = block.querySelector('.ubits-learn-img-trailer__img');
        if (img) img.src = dataUrl;
        if (hasTrailer) block.setAttribute('data-trailer-url', crearContenidoPortadaTrailerUrl);
        else block.removeAttribute('data-trailer-url');
        var cambiar = document.getElementById('crear-contenido-portada-cambiar');
        if (cambiar) {
            cambiar.addEventListener('click', function (e) {
                e.preventDefault();
                openCrearContenidoPortadaModal();
            });
        }
        if (typeof initLearnContentImgTrailer === 'function') {
            initLearnContentImgTrailer(block, {});
        }
    }

    function getDrawerPortadaDataUrl() {
        var block = document.getElementById('crear-contenido-img-trailer');
        var img = block && block.querySelector('.ubits-learn-img-trailer__img');
        if (!img || !img.getAttribute('src')) return null;
        return img.getAttribute('src');
    }

    function openCrearContenidoPortadaModal() {
        if (typeof openPortadaTrailerModal !== 'function') return;
        openPortadaTrailerModal({
            dataUrl: getDrawerPortadaDataUrl(),
            trailerUrl: crearContenidoPortadaTrailerUrl,
            onConfirm: function (payload) {
                if (payload && payload.dataUrl) {
                    applyPortadaImagenCargada(payload.dataUrl, payload.trailerUrl);
                }
                refreshCrearContenidoSiguienteState();
            }
        });
    }

    function wirePortadaFile() {
        var cta = document.getElementById('crear-contenido-portada-cta');
        if (cta) {
            cta.addEventListener('click', function (e) {
                e.preventDefault();
                openCrearContenidoPortadaModal();
            });
        }
    }

    function buildSelectOptionsFromMaster() {
        var tipos =
            global.BD_MASTER_TIPOS_CONTENIDO && global.BD_MASTER_TIPOS_CONTENIDO.tipos
                ? global.BD_MASTER_TIPOS_CONTENIDO.tipos.map(function (t) {
                      return { value: t.id, text: t.nombre };
                  })
                : [{ value: 'tct-001', text: 'Curso' }];
        var niveles =
            global.BD_MASTER_NIVELES_CONTENIDO && global.BD_MASTER_NIVELES_CONTENIDO.niveles
                ? global.BD_MASTER_NIVELES_CONTENIDO.niveles.map(function (n) {
                      return { value: n.id, text: n.nombre };
                  })
                : [{ value: 'niv-001', text: 'Básico' }];
        var cats =
            global.BD_MASTER_CATEGORIAS_FIQSHA && global.BD_MASTER_CATEGORIAS_FIQSHA.categorias
                ? global.BD_MASTER_CATEGORIAS_FIQSHA.categorias.map(function (c) {
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
            refreshCrearContenidoSiguienteState();
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
        refreshCrearContenidoSiguienteState();
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

    /**
     * @returns {{ complete: boolean, missing: string[] }}
     * missing: titulo | portada | descripcion | tipo | nivel | idioma | tiempo | unidad | categoria
     */
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
        if (typeof getRichTextHtml === 'function') {
            var h = getRichTextHtml('#crear-contenido-rte');
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

    function syncPortadaInvalidOutline() {
        if (!crearContenidoPortadaValidationFlash) {
            clearPortadaInvalidMarks();
            return;
        }
        var st = getCrearContenidoPortadaCompleteness();
        if (st.complete) {
            crearContenidoPortadaValidationFlash = false;
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

    function isCrearContenidoPortadaComplete() {
        return getCrearContenidoPortadaCompleteness().complete;
    }

    function getCrearContenidoRecursosIndiceMount() {
        return document.getElementById('crear-contenido-recursos-indice-mount');
    }

    function getCrearContenidoRecursosPaginasList() {
        var m = getCrearContenidoRecursosIndiceMount();
        return m ? m.querySelector('.ubits-paginas-creator') : null;
    }

    function clickCrearContenidoRecursosSeccionAddPage() {
        var b = document.querySelector(
            '#crear-contenido-recursos-indice-mount .ubits-seccion-creator__add-btn'
        );
        if (b) {
            b.click();
            return true;
        }
        return false;
    }

    function isValidCrearContenidoRecursosTitle(text) {
        var t = String(text != null ? text : '').trim();
        if (!t) return false;
        if (t.toLowerCase() === 'sin título') return false;
        return true;
    }

    function getPaginasItemTitleForValidation(item) {
        if (!item) return '';
        if (item.classList.contains('is-active')) {
            var inp = document.getElementById('crear-contenido-recursos-page-title');
            if (inp) return String(inp.value || '').trim();
        }
        var lab = item.querySelector('.ubits-paginas-creator__label');
        return lab ? String(lab.textContent || '').trim() : '';
    }

    function collectRecursosPageTitleValidation() {
        var list = getCrearContenidoRecursosPaginasList();
        if (!list) return { allValid: true, invalidItems: [] };
        var items = list.querySelectorAll(':scope > .ubits-paginas-creator__item');
        var invalidItems = [];
        items.forEach(function (item) {
            if (!isValidCrearContenidoRecursosTitle(getPaginasItemTitleForValidation(item))) {
                invalidItems.push(item);
            }
        });
        return { allValid: invalidItems.length === 0, invalidItems: invalidItems };
    }

    function clearRecursosTitleValidationVisuals() {
        var mount = getCrearContenidoRecursosIndiceMount();
        if (mount) {
            mount.querySelectorAll('.ubits-paginas-creator__item.ubits-paginas-creator__item--error').forEach(function (el) {
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
        if (!crearContenidoRecursosTitlesValidationFlash) return;
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
            crearContenidoRecursosTitlesValidationFlash = false;
        }
    }

    function loadCrearContenidoRecursosEmptyPanel() {
        if (typeof global.loadEmptyState !== 'function') return;
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
        global.loadEmptyState(CREAR_CONTENIDO_RECURSOS_EMPTY_HOST_ID, {
            icon: 'fa-file',
            title: 'Añade tu primera página',
            description:
                'Las páginas son las lecciones o pantallas de tu contenido. Usa «Añadir página» en el índice o el botón de abajo para empezar.',
            buttons: {
                secondary: {
                    text: 'Añadir página',
                    icon: 'fa-plus',
                    onClick: function () {
                        if (!clickCrearContenidoRecursosSeccionAddPage() && typeof global.showToast === 'function') {
                            global.showToast('info', 'No se pudo abrir el índice. Vuelve a abrir el paso Recursos.', {
                                containerId: 'ubits-toast-container',
                                duration: 2500
                            });
                        }
                    }
                }
            }
        });
        refreshCrearContenidoSiguienteState();
    }

    function setCrearContenidoRecursosEditorVisible(visible) {
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

    function syncCrearContenidoRecursosRightTitleFromActive() {
        var activeLabel = document.querySelector(
            '#crear-contenido-recursos-indice-mount .ubits-paginas-creator__item.is-active .ubits-paginas-creator__label'
        );
        var inp = document.getElementById('crear-contenido-recursos-page-title');
        if (inp && activeLabel) inp.value = (activeLabel.textContent || '').trim();
    }

    /** Título grande → etiqueta de la fila activa (en tiempo real; no durante edición inline en la fila). */
    function syncCrearContenidoRecursosActiveLabelFromPageTitleInput() {
        var inp = document.getElementById('crear-contenido-recursos-page-title');
        var label = document.querySelector(
            '#crear-contenido-recursos-indice-mount .ubits-paginas-creator__item.is-active .ubits-paginas-creator__label'
        );
        if (!inp || !label) return;
        var wrap = label.closest('.ubits-paginas-creator__label-wrap');
        if (wrap && wrap.classList.contains('ubits-paginas-creator__label-edit-wrap')) return;
        label.textContent = inp.value != null ? String(inp.value) : '';
    }

    function persistCrearContenidoRecursosRightTitleToActiveItem() {
        var inp = document.getElementById('crear-contenido-recursos-page-title');
        var activeLabel = document.querySelector(
            '#crear-contenido-recursos-indice-mount .ubits-paginas-creator__item.is-active .ubits-paginas-creator__label'
        );
        if (!inp || !activeLabel) return;
        var v = (inp.value || '').trim();
        /* Vacío permitido: el placeholder del panel derecho guía; la validación al avanzar exige título. */
        activeLabel.textContent = v;
    }

    function renderCrearContenidoRecursosResourcesBlock() {
        var mount = document.getElementById('crear-contenido-recursos-resources-mount');
        if (!mount || typeof global.resourcesBlockHtml !== 'function') return;
        mount.innerHTML = global.resourcesBlockHtml({ variant: 'default' });
        if (typeof global.initResourcesBlockFields === 'function') {
            global.initResourcesBlockFields(mount);
        }
    }

    function onCrearContenidoSecAddPage(ev) {
        var d = ev.detail || {};
        var anchor = d.anchor;
        var mount = getCrearContenidoRecursosIndiceMount();
        if (!anchor || !mount || !mount.contains(anchor)) return;

        var list = getCrearContenidoRecursosPaginasList();
        if (!list || typeof global.paginasCreatorItemHtml !== 'function') return;

        crearContenidoRecursosPageSeq += 1;
        var pageKey = 'cc-pg-' + crearContenidoRecursosPageSeq;
        /* Sin título inicial: el panel derecho muestra el placeholder «Escribe el título de la página». */
        var label = '';

        list.querySelectorAll('.ubits-paginas-creator__item.is-active').forEach(function (el) {
            el.classList.remove('is-active');
            var row = el.querySelector('.ubits-paginas-creator__row');
            if (row) row.removeAttribute('aria-current');
        });

        list.insertAdjacentHTML(
            'beforeend',
            global.paginasCreatorItemHtml({
                label: label,
                tipo: 'blank-page',
                active: true,
                pageKey: pageKey
            })
        );

        var newItem = list.querySelector('.ubits-paginas-creator__item[data-paginas-creator-key="' + pageKey + '"]');
        if (newItem && typeof global.setPaginasCreatorActiveItem === 'function') {
            global.setPaginasCreatorActiveItem(newItem);
        }

        var titInp = document.getElementById('crear-contenido-recursos-page-title');
        if (titInp) titInp.value = '';
        setCrearContenidoRecursosEditorVisible(true);
        renderCrearContenidoRecursosResourcesBlock();
        if (typeof global.initTooltip === 'function') {
            global.initTooltip('#crear-contenido-recursos-indice-mount [data-tooltip]');
        }
        refreshCrearContenidoSiguienteState();
    }

    function onCrearContenidoPaginasActivate(ev) {
        var item = ev.detail && ev.detail.item;
        var mount = getCrearContenidoRecursosIndiceMount();
        if (!item || !mount || !mount.contains(item)) return;
        syncCrearContenidoRecursosRightTitleFromActive();
        renderCrearContenidoRecursosResourcesBlock();
        if (crearContenidoRecursosTitlesValidationFlash) {
            syncRecursosTitleValidationVisuals();
        }
        refreshCrearContenidoSiguienteState();
    }

    function onCrearContenidoPaginasLabelSave(ev) {
        var d = ev.detail || {};
        var item = d.item;
        var mount = getCrearContenidoRecursosIndiceMount();
        if (!item || !mount || !mount.contains(item)) return;
        if (!item.classList.contains('is-active')) return;
        var inp = document.getElementById('crear-contenido-recursos-page-title');
        if (inp) inp.value = (d.newLabel != null ? String(d.newLabel) : '').trim();
        if (crearContenidoRecursosTitlesValidationFlash) {
            syncRecursosTitleValidationVisuals();
        }
        refreshCrearContenidoSiguienteState();
    }

    function onCrearContenidoPaginasAction(ev) {
        var d = ev.detail || {};
        var item = d.item;
        var mount = getCrearContenidoRecursosIndiceMount();
        if (!item || !mount || !mount.contains(item)) return;
        if (d.action === 'mover-arriba' || d.action === 'mover-abajo') {
            if (typeof global.initTooltip === 'function') {
                global.initTooltip('#crear-contenido-recursos-indice-mount [data-tooltip]');
            }
            if (crearContenidoRecursosTitlesValidationFlash) {
                syncRecursosTitleValidationVisuals();
            }
            refreshCrearContenidoSiguienteState();
            return;
        }
        if (d.action !== 'eliminar') return;
        item.remove();

        var list = getCrearContenidoRecursosPaginasList();
        var items = list ? list.querySelectorAll('.ubits-paginas-creator__item') : null;
        if (!list || !items || items.length === 0) {
            setCrearContenidoRecursosEditorVisible(false);
            loadCrearContenidoRecursosEmptyPanel();
            refreshCrearContenidoSiguienteState();
            return;
        }
        var first = list.querySelector('.ubits-paginas-creator__item');
        if (first && typeof global.setPaginasCreatorActiveItem === 'function') {
            global.setPaginasCreatorActiveItem(first);
        }
        syncCrearContenidoRecursosRightTitleFromActive();
        renderCrearContenidoRecursosResourcesBlock();
        if (crearContenidoRecursosTitlesValidationFlash) {
            syncRecursosTitleValidationVisuals();
        }
        refreshCrearContenidoSiguienteState();
    }

    function onCrearContenidoRecursosPageTitleFocusOut(ev) {
        if (!ev.target || ev.target.id !== 'crear-contenido-recursos-page-title') return;
        var ov = document.getElementById(OVERLAY_ID);
        if (!ov || ov.getAttribute('aria-hidden') === 'true') return;
        persistCrearContenidoRecursosRightTitleToActiveItem();
        if (crearContenidoRecursosTitlesValidationFlash) {
            syncRecursosTitleValidationVisuals();
        }
    }

    function bindCrearContenidoRecursosStepEventsOnce() {
        if (crearContenidoRecursosEventsBound) return;
        crearContenidoRecursosEventsBound = true;
        document.addEventListener('ubits-seccion-creator-add-page', onCrearContenidoSecAddPage);
        document.addEventListener('ubits-paginas-creator-activate', onCrearContenidoPaginasActivate);
        document.addEventListener('ubits-paginas-creator-action', onCrearContenidoPaginasAction);
        document.addEventListener('ubits-paginas-creator-label-save', onCrearContenidoPaginasLabelSave);
        document.addEventListener('focusout', onCrearContenidoRecursosPageTitleFocusOut, true);
        document.addEventListener('input', function (ev) {
            if (!ev.target || ev.target.id !== 'crear-contenido-recursos-page-title') return;
            syncCrearContenidoRecursosActiveLabelFromPageTitleInput();
            if (crearContenidoRecursosTitlesValidationFlash) {
                syncRecursosTitleValidationVisuals();
            }
        });
        document.addEventListener('ubits-paginas-creator-label-input', function (ev) {
            var d = ev.detail || {};
            var item = d.item;
            if (!item || !item.classList.contains('is-active')) return;
            var mount = getCrearContenidoRecursosIndiceMount();
            if (!mount || !mount.contains(item)) return;
            var ov = document.getElementById(OVERLAY_ID);
            if (!ov || ov.getAttribute('aria-hidden') === 'true') return;
            var inp = document.getElementById('crear-contenido-recursos-page-title');
            if (inp) inp.value = d.value != null ? String(d.value) : '';
            if (crearContenidoRecursosTitlesValidationFlash) {
                syncRecursosTitleValidationVisuals();
            }
        });
    }

    function initCrearContenidoRecursosStepOnce() {
        if (crearContenidoRecursosUiDone) return;
        crearContenidoRecursosUiDone = true;
        crearContenidoRecursosPageSeq = 0;
        var mount = document.getElementById('crear-contenido-recursos-indice-mount');
        if (mount && typeof global.indiceCreatorHtml === 'function') {
            mount.innerHTML = global.indiceCreatorHtml({
                sectionsEnabled: false,
                toggleId: 'crear-contenido-recursos-indice-sections-toggle',
                singleSectionKey: 'crear-contenido-recursos-default',
                singleSection: { pages: [] }
            });
            if (typeof global.initIndiceCreator === 'function') {
                global.initIndiceCreator(mount);
            }
            if (typeof global.initTooltip === 'function') {
                global.initTooltip('#crear-contenido-recursos-indice-mount [data-tooltip]');
            }
        }
        loadCrearContenidoRecursosEmptyPanel();
        bindCrearContenidoRecursosStepEventsOnce();
    }

    function syncCrearContenidoUrlForStep(stepIndex) {
        var path = location.pathname + location.search;
        var target = stepIndex >= 1 ? CREAR_CONTENIDO_RECURSOS_URL_HASH : CREAR_CONTENIDO_URL_HASH;
        if (location.hash === target) return;
        history.replaceState({ ubitsLmsCrearContenidoStep: stepIndex }, '', path + target);
    }

    function updateCrearContenidoFooterForStep() {
        var ant = document.getElementById('crear-contenido-btn-anterior');
        var sig = document.getElementById('crear-contenido-btn-siguiente');
        if (!sig) return;
        if (ant) {
            if (crearContenidoCurrentStep >= 1) {
                ant.style.display = '';
                ant.removeAttribute('aria-hidden');
            } else {
                ant.style.display = 'none';
                ant.setAttribute('aria-hidden', 'true');
            }
        }
        if (crearContenidoCurrentStep >= 1) {
            refreshCrearContenidoSiguienteState();
        }
    }

    function goToCrearContenidoStep(stepIndex, opts) {
        opts = opts || {};
        var overlay = document.getElementById(OVERLAY_ID);
        if (!overlay || overlay.getAttribute('aria-hidden') === 'true') return;
        var prevStep = crearContenidoCurrentStep;
        crearContenidoCurrentStep = stepIndex >= 1 ? 1 : 0;
        if (prevStep !== crearContenidoCurrentStep) {
            crearContenidoRecursosTitlesValidationFlash = false;
            clearRecursosTitleValidationVisuals();
        }
        var portadaEl = document.getElementById('crear-contenido-step-portada');
        var recursosEl = document.getElementById('crear-contenido-step-recursos');
        if (portadaEl) {
            portadaEl.classList.toggle('crear-contenido-step--visible', crearContenidoCurrentStep === 0);
        }
        if (recursosEl) {
            recursosEl.classList.toggle('crear-contenido-step--visible', crearContenidoCurrentStep === 1);
        }
        if (typeof global.setStepperStepStates === 'function') {
            var olDesk = overlay.querySelector('#crear-contenido-stepper-ol');
            var olMob = overlay.querySelector('#crear-contenido-stepper-ol-mobile');
            if (olDesk) global.setStepperStepStates(olDesk, crearContenidoCurrentStep);
            if (olMob) global.setStepperStepStates(olMob, crearContenidoCurrentStep);
        }
        if (crearContenidoCurrentStep === 1) {
            initCrearContenidoRecursosStepOnce();
        }
        updateCrearContenidoFooterForStep();
        refreshCrearContenidoSiguienteState();
        if (!opts.skipUrl) {
            syncCrearContenidoUrlForStep(crearContenidoCurrentStep);
        }
        if (typeof global.initTooltip === 'function') {
            global.initTooltip('#' + OVERLAY_ID + ' [data-tooltip]');
        }
    }

    function wireCrearContenidoStepperStepClicks(overlay) {
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
                        goToCrearContenidoStep(0);
                        return;
                    }
                    if (i === 1) {
                        if (!isCrearContenidoPortadaComplete()) {
                            crearContenidoPortadaValidationFlash = true;
                            syncPortadaInvalidOutline();
                            if (typeof global.showToast === 'function') {
                                global.showToast('warning', 'Completa la portada para ir a Recursos.', {
                                    containerId: 'ubits-toast-container',
                                    duration: 3500
                                });
                            }
                            return;
                        }
                        crearContenidoPortadaValidationFlash = false;
                        clearPortadaInvalidMarks();
                        goToCrearContenidoStep(1);
                        return;
                    }
                    if (typeof global.showToast === 'function') {
                        global.showToast('info', 'Este paso estará disponible pronto.', {
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
        bindOl(overlay.querySelector('#crear-contenido-stepper-ol'));
        bindOl(overlay.querySelector('#crear-contenido-stepper-ol-mobile'));
    }

    function refreshCrearContenidoSiguienteState() {
        var btn = document.getElementById('crear-contenido-btn-siguiente');
        if (!btn) return;
        if (crearContenidoCurrentStep >= 1) {
            var list = getCrearContenidoRecursosPaginasList();
            var n = list ? list.querySelectorAll(':scope > .ubits-paginas-creator__item').length : 0;
            btn.disabled = n === 0;
            return;
        }
        btn.disabled = !isCrearContenidoPortadaComplete();
        syncPortadaInvalidOutline();
    }

    function wireCrearContenidoInteractions(overlay) {
        wirePortadaFile();
        setTimeout(function () {
            initFichaInputs();
            if (typeof initRichTextEditor === 'function') {
                initRichTextEditor('#crear-contenido-rte');
            }
            var rte = document.getElementById('crear-contenido-rte-field');
            if (rte) {
                rte.addEventListener('input', function () {
                    refreshCrearContenidoSiguienteState();
                });
                rte.addEventListener('paste', function () {
                    setTimeout(function () {
                        refreshCrearContenidoSiguienteState();
                    }, 0);
                });
            }
            var titulo = document.getElementById('crear-contenido-titulo');
            if (titulo) {
                titulo.addEventListener('input', function () {
                    refreshCrearContenidoSiguienteState();
                });
            }
            var portadaStep = document.getElementById('crear-contenido-step-portada');
            if (portadaStep) {
                portadaStep.addEventListener('input', function () {
                    refreshCrearContenidoSiguienteState();
                });
                portadaStep.addEventListener('change', function () {
                    refreshCrearContenidoSiguienteState();
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
                    refreshCrearContenidoSiguienteState();
                }).observe(imgBlock, { attributes: true, attributeFilter: ['class'] });
            }
            var sig = document.getElementById('crear-contenido-btn-siguiente');
            if (sig) {
                sig.addEventListener('click', function () {
                    if (crearContenidoCurrentStep === 1) {
                        if (sig.disabled) {
                            if (typeof global.showToast === 'function') {
                                global.showToast('warning', 'Añade al menos una página para continuar.', {
                                    containerId: 'ubits-toast-container',
                                    duration: 3500
                                });
                            }
                            return;
                        }
                        var st = collectRecursosPageTitleValidation();
                        if (!st.allValid) {
                            crearContenidoRecursosTitlesValidationFlash = true;
                            var first = st.invalidItems[0];
                            if (first && typeof global.setPaginasCreatorActiveItem === 'function') {
                                global.setPaginasCreatorActiveItem(first);
                            }
                            syncCrearContenidoRecursosRightTitleFromActive();
                            syncRecursosTitleValidationVisuals();
                            var titInp = document.getElementById('crear-contenido-recursos-page-title');
                            if (titInp) titInp.focus();
                            if (typeof global.showToast === 'function') {
                                global.showToast('warning', 'Todas las páginas deben tener un título. Revisa las marcadas en rojo.', {
                                    containerId: 'ubits-toast-container',
                                    duration: 4000
                                });
                            }
                            return;
                        }
                        crearContenidoRecursosTitlesValidationFlash = false;
                        clearRecursosTitleValidationVisuals();
                        if (typeof global.showToast === 'function') {
                            global.showToast('info', 'Siguiente paso disponible próximamente.', {
                                containerId: 'ubits-toast-container',
                                duration: 2500
                            });
                        }
                        return;
                    }
                    if (crearContenidoCurrentStep !== 0) return;
                    if (sig.disabled) {
                        crearContenidoPortadaValidationFlash = true;
                        syncPortadaInvalidOutline();
                        if (typeof global.showToast === 'function') {
                            global.showToast('warning', 'Completa todos los campos obligatorios de la portada.', {
                                containerId: 'ubits-toast-container',
                                duration: 3500
                            });
                        }
                        return;
                    }
                    crearContenidoPortadaValidationFlash = false;
                    clearPortadaInvalidMarks();
                    goToCrearContenidoStep(1);
                });
            }
            var ant = document.getElementById('crear-contenido-btn-anterior');
            if (ant) {
                ant.addEventListener('click', function () {
                    if (crearContenidoCurrentStep >= 1) {
                        goToCrearContenidoStep(0);
                    }
                });
            }
            setTimeout(function () {
                refreshCrearContenidoSiguienteState();
            }, 500);
        }, 0);

        var frame = overlay.querySelector('#crear-contenido-stepper-frame');
        var toggle = overlay.querySelector('#crear-contenido-stepper-toggle');
        if (frame && toggle && typeof wireStepperVerticalCollapse === 'function') {
            wireStepperVerticalCollapse(frame, toggle, { creatorRail: true });
        }
        wireCrearContenidoStepperStepClicks(overlay);
        if (typeof initTooltip === 'function') {
            initTooltip('#' + OVERLAY_ID + ' [data-tooltip]');
        }
    }

    function openCrearContenidoDrawer(opts) {
        opts = opts || {};
        if (typeof openDrawer !== 'function') return;
        var existing = document.getElementById(OVERLAY_ID);
        if (existing) existing.remove();
        crearContenidoRecursosUiDone = false;
        crearContenidoRecursosPageSeq = 0;
        crearContenidoCurrentStep = 0;
        crearContenidoPortadaValidationFlash = false;
        crearContenidoRecursosTitlesValidationFlash = false;
        clearRecursosTitleValidationVisuals();
        document.body.classList.add('crear-contenido-drawer-abierto');
        var footerInner =
            '<div class="crear-contenido-drawer-footer-actions">' +
            '  <span class="crear-contenido-drawer-footer-actions__grow" aria-hidden="true"></span>' +
            '  <div class="crear-contenido-drawer-footer-actions__nav">' +
            '    <button type="button" class="ubits-button ubits-button--secondary ubits-button--md" id="crear-contenido-btn-anterior" style="display:none" aria-hidden="true"><span>Anterior</span></button>' +
            '    <button type="button" class="ubits-button ubits-button--primary ubits-button--md" id="crear-contenido-btn-siguiente" disabled><span>Siguiente</span></button>' +
            '  </div>' +
            '</div>';
        var overlay = openDrawer({
            overlayId: OVERLAY_ID,
            title: 'Crear contenido',
            bodyHtml: getCrearContenidoBodyHtml(),
            footerHtml: footerInner,
            size: 'full',
            closeOnOverlayClick: false,
            onClose: function () {
                document.body.classList.remove('crear-contenido-drawer-abierto');
                crearContenidoInputApis = {};
                crearContenidoPortadaTrailerUrl = '';
                crearContenidoCurrentStep = 0;
                crearContenidoRecursosUiDone = false;
                crearContenidoPortadaValidationFlash = false;
                crearContenidoRecursosTitlesValidationFlash = false;
                clearRecursosTitleValidationVisuals();
                clearPortadaInvalidMarks();
                syncUrlAfterCrearContenidoDrawerClose();
            }
        });
        if (overlay) {
            overlay.classList.add('crear-contenido-drawer-overlay');
            wireCrearContenidoDrawerHeader(overlay);
            wireCrearContenidoInteractions(overlay);
            var initialStep = opts.initialStep === 1 ? 1 : 0;
            /* goTo y sync URL deben ir después del setTimeout(0) de initFichaInputs / RTE, si no Siguiente queda deshabilitado (APIs vacías). */
            setTimeout(function () {
                goToCrearContenidoStep(initialStep, { skipUrl: true });
                if (initialStep === 0) {
                    syncUrlAfterCrearContenidoDrawerOpen();
                } else {
                    if (!isCrearContenidoRecursosUrlHash(location.hash)) {
                        history.replaceState(
                            { ubitsLmsCrearContenidoStep: 1 },
                            '',
                            location.pathname + location.search + CREAR_CONTENIDO_RECURSOS_URL_HASH
                        );
                    }
                    crearContenidoOpenedWithHistoryPush = false;
                }
                refreshCrearContenidoSiguienteState();
            }, 0);
        }
    }

    global.openCrearContenidoDrawer = openCrearContenidoDrawer;
    global.tryOpenCrearContenidoFromUrlHash = tryOpenCrearContenidoFromUrlHash;
})(typeof window !== 'undefined' ? window : this);
