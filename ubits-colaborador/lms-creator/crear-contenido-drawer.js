/**
 * LMS Creator — Drawer «Crear contenido» (paso 1 Portada).
 * Depende: openDrawer/closeDrawer, createInput, initRichTextEditor,
 * learn-content-img-trailer.js (getLearnContentImgTrailerEmptyHtml, getLearnContentImgTrailerEditHtml, initLearnContentImgTrailer),
 * portada-media-modal.js (openPortadaTrailerModal), modal.js (openModal),
 * initTooltip, renderSaveIndicator, setStepperStepStates, wireStepperVerticalCollapse, BD_MASTER_*.
 */
(function (global) {
    'use strict';

    var OVERLAY_ID = 'crear-contenido-drawer-overlay';
    /** Hash en la URL al tener abierto el drawer (compartir / atrás del navegador). */
    var CREAR_CONTENIDO_URL_HASH = '#crear-contenido';
    var crearContenidoOpenedWithHistoryPush = false;
    /** APIs devueltas por createInput (paso 1). */
    var crearContenidoInputApis = {};
    /** URL del tráiler (paso portada), persistido al confirmar el modal. */
    var crearContenidoPortadaTrailerUrl = '';

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
        if (location.hash !== CREAR_CONTENIDO_URL_HASH) {
            crearContenidoOpenedWithHistoryPush = false;
            return;
        }
        if (crearContenidoOpenedWithHistoryPush) {
            crearContenidoOpenedWithHistoryPush = false;
            history.back();
            return;
        }
        history.replaceState(null, '', location.pathname + location.search);
    }

    function onPopStateCrearContenidoDrawer() {
        var overlay = document.getElementById(OVERLAY_ID);
        if (!overlay || overlay.getAttribute('aria-hidden') === 'true') return;
        if (location.hash === CREAR_CONTENIDO_URL_HASH) return;
        crearContenidoOpenedWithHistoryPush = false;
        if (typeof closeDrawer === 'function') {
            closeDrawer(OVERLAY_ID);
        }
        document.body.classList.remove('crear-contenido-drawer-abierto');
        crearContenidoInputApis = {};
        crearContenidoPortadaTrailerUrl = '';
    }

    if (typeof window !== 'undefined' && window.addEventListener) {
        window.addEventListener('popstate', onPopStateCrearContenidoDrawer);
    }

    function tryOpenCrearContenidoFromUrlHash() {
        if (location.hash !== CREAR_CONTENIDO_URL_HASH) return;
        if (document.body.classList.contains('crear-contenido-drawer-abierto')) return;
        openCrearContenidoDrawer();
    }

    function esc(s) {
        if (s == null) return '';
        var d = document.createElement('div');
        d.textContent = s;
        return d.innerHTML;
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
            '  </div>' +
            '  <div class="crear-contenido-editor__main">' +
            '    <div class="crear-contenido-portada__cabecera">' +
            '      <div class="crear-contenido-portada__cabecera-titulo">' +
            '        <label class="contenidos-creator-titulo-wrap">' +
            '          <input type="text" id="crear-contenido-titulo" class="contenidos-creator-titulo-input ubits-display-d3-bold" placeholder="Escribe aquí el título del contenido" autocomplete="off" maxlength="180" aria-label="Nombre del contenido">' +
            '          <span class="contenidos-creator-titulo-hint ubits-body-xs-regular">Máximo 180 caracteres.</span>' +
            '        </label>' +
            '      </div>' +
            '      <div class="crear-contenido-portada__cabecera-media">' +
            getMiniaturaBlockHtml({ cabeceraUnica: true }) +
            '      </div>' +
            '    </div>' +
            '    <div class="crear-contenido-portada__cuerpo">' +
            '      <div class="crear-contenido-portada__cuerpo-desc">' +
            getRichTextCardHtml() +
            '      </div>' +
            '      <div class="crear-contenido-portada__cuerpo-ficha">' +
            getFichaTecnicaHostsHtml() +
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
            value: '',
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
        crearContenidoInputApis.categoria = createInput({
            containerId: 'crear-contenido-in-categoria',
            type: 'select',
            label: 'Categoría',
            placeholder: 'Selecciona una opción',
            size: 'sm',
            selectOptions: catOpts,
            value: '',
            onChange: tick
        });
    }

    function stripHtml(html) {
        var t = document.createElement('div');
        t.innerHTML = html || '';
        return (t.textContent || '').replace(/\u00a0/g, ' ').trim();
    }

    function refreshCrearContenidoSiguienteState() {
        var btn = document.getElementById('crear-contenido-btn-siguiente');
        if (!btn) return;
        var titulo = document.getElementById('crear-contenido-titulo');
        var tituloOk = titulo && titulo.value.trim().length > 0;
        var block = document.getElementById('crear-contenido-img-trailer');
        var portadaOk =
            block &&
            (block.classList.contains('ubits-learn-img-trailer--image') ||
                block.classList.contains('ubits-learn-img-trailer--trailer'));
        var descOk = false;
        if (typeof getRichTextHtml === 'function') {
            var h = getRichTextHtml('#crear-contenido-rte');
            descOk = stripHtml(h).length > 0;
        }
        var a = crearContenidoInputApis;
        var tipoOk = a.tipo && String(a.tipo.getValue()).length > 0;
        var nivelOk = a.nivel && String(a.nivel.getValue()).length > 0;
        var idiomaOk = a.idioma && String(a.idioma.getValue()).length > 0;
        var tv = a.tiempo ? String(a.tiempo.getValue()) : '';
        var tiempoOk = tv !== '' && !isNaN(Number(tv)) && Number(tv) > 0;
        var unidadOk = a.unidad && String(a.unidad.getValue()).length > 0;
        var cv = a.categoria ? String(a.categoria.getValue()) : '';
        var catOk = cv.length > 0;
        var allOk =
            tituloOk && portadaOk && descOk && tipoOk && nivelOk && idiomaOk && tiempoOk && unidadOk && catOk;
        btn.disabled = !allOk;
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
            }
            var titulo = document.getElementById('crear-contenido-titulo');
            if (titulo) {
                titulo.addEventListener('input', function () {
                    refreshCrearContenidoSiguienteState();
                });
            }
            var imgBlock = document.getElementById('crear-contenido-img-trailer');
            if (imgBlock) {
                new MutationObserver(function () {
                    refreshCrearContenidoSiguienteState();
                }).observe(imgBlock, { attributes: true, attributeFilter: ['class'] });
            }
            var sig = document.getElementById('crear-contenido-btn-siguiente');
            if (sig) {
                sig.addEventListener('click', function () {
                    if (typeof showToast === 'function') {
                        showToast('info', 'Siguiente paso (Recursos) — pendiente de implementar.', {
                            containerId: 'ubits-toast-container',
                            duration: 3000
                        });
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
        if (typeof setStepperStepStates === 'function') {
            var ol = overlay.querySelector('#crear-contenido-stepper-ol');
            if (ol) setStepperStepStates(ol, 0);
        }
        if (typeof initTooltip === 'function') {
            initTooltip('#' + OVERLAY_ID + ' [data-tooltip]');
        }
    }

    function openCrearContenidoDrawer() {
        if (typeof openDrawer !== 'function') return;
        var existing = document.getElementById(OVERLAY_ID);
        if (existing) existing.remove();
        document.body.classList.add('crear-contenido-drawer-abierto');
        var overlay = openDrawer({
            overlayId: OVERLAY_ID,
            title: 'Crear contenido',
            bodyHtml: getCrearContenidoBodyHtml(),
            footerHtml:
                '<button type="button" class="ubits-button ubits-button--primary ubits-button--md" id="crear-contenido-btn-siguiente" disabled><span>Siguiente</span></button>',
            size: 'full',
            closeOnOverlayClick: false,
            onClose: function () {
                document.body.classList.remove('crear-contenido-drawer-abierto');
                crearContenidoInputApis = {};
                crearContenidoPortadaTrailerUrl = '';
                syncUrlAfterCrearContenidoDrawerClose();
            }
        });
        if (overlay) {
            overlay.classList.add('crear-contenido-drawer-overlay');
            wireCrearContenidoDrawerHeader(overlay);
            wireCrearContenidoInteractions(overlay);
            syncUrlAfterCrearContenidoDrawerOpen();
        }
    }

    global.openCrearContenidoDrawer = openCrearContenidoDrawer;
    global.tryOpenCrearContenidoFromUrlHash = tryOpenCrearContenidoFromUrlHash;
})(typeof window !== 'undefined' ? window : this);
