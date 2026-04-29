/**
 * LMS Creator — Página dedicada crear-contenido.html.
 * Un solo archivo: portada (inputs, RTE, miniatura), hashes URL, paso Recursos (índice + empty + eventos).
 * Lógica del flujo crear contenido (solo esta página; la lista solo enlaza aquí).
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

    function initPortadaAiPanel() {
        if (typeof initAIPanel !== 'function') return;
        initAIPanel({
            title: 'Asistente IA',
            placeholder: 'Escribe tu solicitud…',
            welcomeSubtitle: '¿Qué quieres generar o ajustar?',
            onSend: function (text) {
                if (!text) return;
                var removeTyping = typeof showAIPanelTyping === 'function' ? showAIPanelTyping() : null;
                window.setTimeout(function () {
                    try {
                        if (typeof removeTyping === 'function') removeTyping();
                        if (typeof addAIPanelMessage === 'function') {
                            addAIPanelMessage('Demo: recibí “' + String(text).trim() + '”.', 'ai');
                        }
                    } catch (e) {}
                }, 650);
            }
        });
    }

    function wirePortadaAiPanelButton() {
        var btn = document.getElementById('crear-contenido-portada-ai-panel');
        if (!btn) return;
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            initPortadaAiPanel();
            if (typeof openAIPanel === 'function') openAIPanel();
        });
    }

    var portadaiAImagesIndex = 0;
    var AI_IMAGES = [
        'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
        'https://images.unsplash.com/photo-1517048676732-d65bc937f952?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
        'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
        'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
        'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
        'https://images.unsplash.com/photo-1515169067868-5387ec356754?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
        'https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
        'https://images.unsplash.com/photo-1556761175-4b46a572b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
        'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
        'https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80'
    ];

    function initPortadaAiModal() {
        if (typeof openModal !== 'function') return;
        var svgIcon = '<svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right:8px;"><path fill-rule="evenodd" clip-rule="evenodd" d="M10.4932 0.613375C12.0444 -0.204461 13.9557 -0.204455 15.5068 0.613375L23.4932 4.82431C25.0444 5.64213 26 7.15351 26 8.78916V17.211C25.9999 18.8466 25.0444 20.3581 23.4932 21.1759L15.5068 25.3868C13.9557 26.2046 12.0444 26.2046 10.4932 25.3868L2.50684 21.1759C0.955703 20.3581 6.05295e-05 18.8466 0 17.211V8.78916C4.65813e-05 7.15351 0.955692 5.64213 2.50684 4.82431L10.4932 0.613375ZM10.2285 9.45322C9.78152 9.45322 9.38147 9.70709 9.22656 10.0899L9.08301 10.4454C8.64869 11.5189 7.72346 12.3649 6.55078 12.7618L6.16211 12.8927C5.74356 13.0343 5.46604 13.3991 5.46582 13.8067C5.46582 14.2144 5.74338 14.5801 6.16211 14.7218L6.55078 14.8526C7.7235 15.2495 8.6487 16.0956 9.08301 17.169L9.22656 17.5245C9.38147 17.9073 9.78152 18.1612 10.2285 18.1612C10.6752 18.1611 11.0746 17.9072 11.2295 17.5245L11.373 17.169C11.8073 16.0957 12.7327 15.2496 13.9053 14.8526L14.2939 14.7218C14.7126 14.5801 14.9912 14.2145 14.9912 13.8067C14.991 13.3991 14.7125 13.0343 14.2939 12.8927L13.9053 12.7618C12.7327 12.365 11.8073 11.5187 11.373 10.4454L11.373 10.4454L11.2295 10.0899C11.0745 9.7072 10.6752 9.45332 10.2285 9.45322ZM10.2285 12.5733C10.6087 13.0436 11.0643 13.4592 11.5791 13.8067C11.0643 14.1543 10.6087 14.5707 10.2285 15.0411C9.84818 14.5706 9.39278 14.1543 8.87793 13.8067C9.39262 13.4592 9.84827 13.0436 10.2285 12.5733ZM17.7881 7.83798C17.3182 7.83817 16.9032 8.11882 16.7666 8.52939C16.6257 8.95299 16.2636 9.28369 15.8018 9.4122C15.3527 9.53734 15.046 9.91603 15.0459 10.3448C15.0459 10.7736 15.3527 11.1523 15.8018 11.2774C16.2634 11.4058 16.6256 11.7369 16.7666 12.1602C16.9032 12.5708 17.3182 12.8515 17.7881 12.8517C18.2581 12.8517 18.6739 12.5709 18.8105 12.1602C18.9516 11.7369 19.3137 11.4058 19.7754 11.2774C20.2244 11.1523 20.5312 10.7736 20.5312 10.3448C20.5311 9.91605 20.2244 9.53736 19.7754 9.4122C19.3136 9.28369 18.9515 8.95299 18.8105 8.52939C18.6739 8.11868 18.2581 7.83798 17.7881 7.83798Z" fill="url(#ai-modal-icon-grad)"/><defs><linearGradient id="ai-modal-icon-grad" x1="24.8936" y1="20.8" x2="-0.0945594" y2="17.5486" gradientUnits="userSpaceOnUse"><stop stop-color="#FF5416"/><stop offset="0.341346" stop-color="#EA066F"/><stop offset="0.706731" stop-color="#8823EA"/><stop offset="1" stop-color="#0C5BEF"/></linearGradient></defs></svg>';
        
        var bodyHtml = '<div class="ai-modal-wrapper" style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding: 0; flex:1; width:100%;">' +
            '<div id="ai-modal-input-view" style="width:100%; max-width:600px; transition: opacity 0.3s; z-index:1; padding: 0;">' +
                '<div style="display:flex; flex-direction:column; align-items:center; gap:16px; margin-bottom:32px;">' +
                    '<div style="font-size:32px; animation: ubits-ia-chat-sparkles-float 2.5s ease-in-out infinite;">' +
                        '<i class="far fa-sparkles" style="background: linear-gradient(135deg, var(--modo-ia-gradient-a) 0%, var(--modo-ia-gradient-b) 35.59%, var(--modo-ia-gradient-c) 67.19%, var(--modo-ia-gradient-d) 100%); -webkit-background-clip: text; color: transparent;"></i>' +
                    '</div>' +
                    '<p style="text-align:center; margin:0; font-size:1.5rem; color:var(--text-primary);">Tú lo imaginas, nosotros <span style="font-weight:600; background: linear-gradient(90deg, var(--modo-ia-gradient-a), var(--modo-ia-gradient-b), var(--modo-ia-gradient-c), var(--modo-ia-gradient-d)); -webkit-background-clip: text; color: transparent;">lo generamos</span></p>' +
                '</div>' +
                '<div class="ai-panel__input-box">' +
                    '<textarea class="ai-panel__input" id="portada-ai-modal-input" placeholder="Describe la portada que imaginas..." rows="1" style="flex:1; width:100%; min-height:24px; line-height:24px; resize:none; padding:8px 0; outline:none; border:none; background:transparent; font-family:inherit;"></textarea>' +
                    '<div class="ai-panel__input-actions" style="display:flex; align-items:center; justify-content:flex-end; width:100%; gap:8px;">' +
                        '<button type="button" class="ubits-ia-button ubits-ia-button--primary ubits-ia-button--sm ubits-ia-button--icon-only" id="portada-ai-modal-send" aria-label="Enviar">' +
                            '<i class="far fa-arrow-right"></i>' +
                        '</button>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<div id="ai-modal-loader-view" class="ubits-loader-wrap" style="display:none; z-index:1; padding: 40px 0;">' +
                '<div class="ubits-loader"></div>' +
                '<p class="ubits-loader-text ubits-body-md-regular">Generando portada…</p>' +
            '</div>' +
            '<div id="ai-modal-result-view" style="display:none; width:100%; text-align:center; flex-direction:column; align-items:center; z-index:1; padding: 0;">' +
                '<img id="portada-ai-modal-img" src="" alt="Portada generada" style="width:100%; max-width:600px; aspect-ratio:16/9; object-fit:cover; border-radius:12px; margin-bottom:24px; border: 1px solid var(--border-subtle);" />' +
                '<div class="portada-ia-modal-actions">' +
                    '<button type="button" id="portada-ai-modal-regenerate" class="ubits-button ubits-button--secondary ubits-button--md" style="flex:1;">' +
                        '<i class="far fa-rotate-right"></i><span>Regenerar</span>' +
                    '</button>' +
                    '<button type="button" id="portada-ai-modal-use" class="ubits-button ubits-button--primary ubits-button--md" style="flex:1;">' +
                        '<i class="far fa-check"></i><span>Usar como portada</span>' +
                    '</button>' +
                '</div>' +
            '</div>' +
        '</div>';

        var overlay = openModal({
            overlayId: 'portada-ai-modal',
            title: 'Generar portada',
            bodyHtml: bodyHtml,
            size: 'md'
        });

        // Customizar header y orbes
        var titleSpan = overlay.querySelector('.ubits-modal-title');
        if (titleSpan) {
            titleSpan.innerHTML = '<div style="display:flex; align-items:center;">' + svgIcon + 'Generar portada</div>';
        }
        
        var modalContent = overlay.querySelector('.ubits-modal-content');
        if (modalContent) {
            modalContent.classList.add('portada-ia-modal-content');
            modalContent.style.backgroundColor = 'var(--surface-default, #FFFFFF)';
            modalContent.style.backgroundImage = 'radial-gradient(ellipse 100% 80% at 10% 0%, rgba(var(--modo-ia-glow-orb-rgb-1, 26, 107, 255), 0.15) 0%, transparent 50%),' +
            'radial-gradient(ellipse 95% 78% at 50% 0%, rgba(var(--modo-ia-glow-orb-rgb-2, 76, 230, 255), 0.15) 0%, transparent 48%),' +
            'radial-gradient(ellipse 95% 75% at 90% 0%, rgba(var(--modo-ia-glow-orb-rgb-3, 255, 84, 22), 0.15) 0%, transparent 50%)';
            
            var modalHeader = overlay.querySelector('.ubits-modal-header');
            if (modalHeader) {
                modalHeader.style.background = 'transparent';
                // Restored default border bottom
                modalHeader.style.borderBottom = '';
            }
            
            var modalBody = overlay.querySelector('.ubits-modal-body');
            if (modalBody) {
                modalBody.style.padding = 'var(--padding-xl, 32px)';
                modalBody.style.overflow = 'visible';
                modalBody.style.display = 'flex';
                modalBody.style.flexDirection = 'column';
            }
        }

        var inputView = overlay.querySelector('#ai-modal-input-view');
        var loaderView = overlay.querySelector('#ai-modal-loader-view');
        var resultView = overlay.querySelector('#ai-modal-result-view');
        var inputEl = overlay.querySelector('#portada-ai-modal-input');
        var sendBtn = overlay.querySelector('#portada-ai-modal-send');
        var imgEl = overlay.querySelector('#portada-ai-modal-img');
        var regenBtn = overlay.querySelector('#portada-ai-modal-regenerate');
        var useBtn = overlay.querySelector('#portada-ai-modal-use');

        function generate() {
            var val = inputEl.value.trim();
            if (!val) return;
            inputView.style.display = 'none';
            loaderView.style.display = 'flex';
            
            setTimeout(function() {
                loaderView.style.display = 'none';
                imgEl.src = AI_IMAGES[portadaiAImagesIndex];
                resultView.style.display = 'flex';
            }, 5000);
        }

        sendBtn.addEventListener('click', generate);
        inputEl.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                generate();
            }
        });

        regenBtn.addEventListener('click', function() {
            portadaiAImagesIndex = (portadaiAImagesIndex + 1) % AI_IMAGES.length;
            imgEl.src = AI_IMAGES[portadaiAImagesIndex];
        });

        useBtn.addEventListener('click', function() {
            if (typeof applyPortadaImagenCargada === 'function') {
                applyPortadaImagenCargada(imgEl.src, '');
                if (typeof triggerFakeSaveCreator === 'function') triggerFakeSaveCreator();
                if (typeof clearPortadaInvalidMarks === 'function') clearPortadaInvalidMarks();
            }
            if (typeof closeModal === 'function') closeModal('portada-ai-modal');
        });
        
        setTimeout(function() {
            if (inputEl) inputEl.focus();
        }, 100);
    }

    function wirePortadaAiModalButton() {
        var btn = document.getElementById('crear-contenido-portada-ai-modal');
        if (!btn) return;
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            initPortadaAiModal();
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

    var recursosBlockInteractionsBound = false;
    function bindRecursosBlockInteractions() {
        if (recursosBlockInteractionsBound) return;
        recursosBlockInteractionsBound = true;

        document.addEventListener('click', function (ev) {
            var mount = document.getElementById('crear-contenido-recursos-resources-mount');
            if (!mount || !mount.contains(ev.target)) return;

            // 1. Click en tarjeta de Video
            var videoCard = ev.target.closest('[data-resources-card-type="video"]');
            if (videoCard && !videoCard.disabled) {
                mount.innerHTML = window.resourcesBlockHtml({ variant: 'video-empty' });
                if (typeof window.initResourcesBlockFields === 'function') {
                    window.initResourcesBlockFields(mount);
                }
                return;
            }

            // 5. Click en botón Eliminar recurso cargado (evaluar antes de Cancelar)
            var eliminarBtn = ev.target.closest('#cc-eliminar-recurso');
            if (eliminarBtn) {
                mount.innerHTML = window.resourcesBlockHtml({ variant: 'default' });
                if (typeof window.initResourcesBlockFields === 'function') {
                    window.initResourcesBlockFields(mount);
                }
                
                // Restaurar icono en el índice a "blank-page"
                var activeItemDel = document.querySelector('#crear-contenido-recursos-indice-mount .ubits-paginas-creator__item.is-active');
                if (activeItemDel) {
                    var iconElDel = activeItemDel.querySelector('.ubits-paginas-creator__drag-handle i');
                    if (iconElDel && typeof window.paginasCreatorIconClass === 'function') {
                        iconElDel.className = window.paginasCreatorIconClass('blank-page');
                    }
                }
                return;
            }

            // 2. Click en botón Cancelar
            var cancelBtn = ev.target.closest('.ubits-resources-block__footer .ubits-button--error-secondary');
            if (cancelBtn) {
                mount.innerHTML = window.resourcesBlockHtml({ variant: 'default' });
                if (typeof window.initResourcesBlockFields === 'function') {
                    window.initResourcesBlockFields(mount);
                }
                return;
            }

            // 4. Click en botón Cargar
            var cargarBtn = ev.target.closest('.ubits-resources-block__field-inline .ubits-button--primary');
            if (cargarBtn && !cargarBtn.disabled) {
                var fieldInline = cargarBtn.closest('.ubits-resources-block__field-inline');
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
                        
                        // Actualizar icono en el índice a "video"
                        var activeItem = document.querySelector('#crear-contenido-recursos-indice-mount .ubits-paginas-creator__item.is-active');
                        if (activeItem) {
                            var iconEl = activeItem.querySelector('.ubits-paginas-creator__drag-handle i');
                            if (iconEl && typeof window.paginasCreatorIconClass === 'function') {
                                iconEl.className = window.paginasCreatorIconClass('video');
                            }
                        }

                    } else {
                        // B. Enlace inválido -> variante error
                        mount.innerHTML = window.resourcesBlockHtml({ variant: 'video-error', value: val });
                        if (typeof window.initResourcesBlockFields === 'function') {
                            window.initResourcesBlockFields(mount);
                        }
                    }
                }
                return;
            }
        });

        // 3. Escribir en el input enciende el botón Cargar
        document.addEventListener('input', function (ev) {
            var mount = document.getElementById('crear-contenido-recursos-resources-mount');
            if (!mount || !mount.contains(ev.target)) return;

            var inputSlotContainer = ev.target.closest('[data-rb-slot="video-url"]');
            if (inputSlotContainer) {
                var fieldInline = ev.target.closest('.ubits-resources-block__field-inline');
                if (fieldInline) {
                    var cargarBtn = fieldInline.querySelector('button');
                    if (cargarBtn) {
                        var val = ev.target.value.trim();
                        if (val !== '') {
                            cargarBtn.classList.remove('ubits-button--secondary');
                            cargarBtn.classList.add('ubits-button--primary');
                            cargarBtn.disabled = false;
                        } else {
                            cargarBtn.classList.remove('ubits-button--primary');
                            cargarBtn.classList.add('ubits-button--secondary');
                            cargarBtn.disabled = true;
                        }
                    }
                }
            }
        });
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
        
        bindRecursosBlockInteractions();
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
        wirePortadaAiPanelButton();
        wirePortadaAiModalButton();
        setTimeout(function () {
            wireCrearContenidoPageInteractionsDeferred();
        }, 0);
        wireCrearContenidoPageStepperStepClicks();
        applyCrearContenidoPageHash();
        window.addEventListener('hashchange', applyCrearContenidoPageHash);
        /* Rail height: leer el alto real del __main y exponerlo como CSS var */
        syncRailHeight();
        window.addEventListener('resize', syncRailHeight);
    }

    /** Portada `#portada`, Recursos `#recursos`. Alias legacy en applyCrearContenidoPageHash. */
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
