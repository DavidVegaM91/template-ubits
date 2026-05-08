/**
 * LMS Creator — Modal «Agregar video» (tres pestañas: Video IA · Enlace · Subir)
 * + Widget flotante de generación de video (estilo Google Drive).
 *
 * Depende:
 *   modal.js  (openModal, closeModal)
 *   input.js  (createInput)
 *   file-upload.js (createFileUpload, fileUploadSetProgress, fileUploadClearProgress, fileUploadSetSuccess)
 *   video-player.js (videoPlayerHtml) — opcional, usa fallback si no está
 *   tab.css, file-upload.css, checkbox.css, video-recurso-modal.css
 *   Avatares: ../../images/avatars/* · previews opcionales: ../../videos/avatars/{mismo-base-que-foto}.mp4
 *   Contexto tema del guión: textarea nativa `.ai-panel__input` dentro de `ai-panel__input-box` (como SCORM). Guión: createInput textarea.
 */
(function (global) {
    'use strict';

    var OVERLAY_ID = 'cc-video-recurso-modal';

    var VIDEO_GUION_IA_TOKEN_COST = 2;
    var VIDEO_GEN_TOKEN_COST      = 20;
    /** Guión para «Generar video»: longitud mínima/máxima (coincide con contador createInput). */
    var VIDEO_GUION_MIN_CHARS = 500;
    var VIDEO_GUION_MAX_CHARS = 1700;

    /* ══════════════════════════════════════
       TOKEN HELPERS
    ══════════════════════════════════════ */
    function getVideoAiTokens() {
        return global._ubitsAiTokenPool != null ? global._ubitsAiTokenPool : 50;
    }

    function syncVideoModalTokensBadge() {
        var n = getVideoAiTokens();
        var el = document.getElementById('cc-video-modal-tokens-badge');
        if (!el) return;
        var num = el.querySelector('.ubits-badge-tag__token-number');
        if (num) num.textContent = String(n);
        el.setAttribute('aria-label', String(n) + ' tokens restantes');
    }

    function trySpendVideoAiTokens(cost) {
        var cur = getVideoAiTokens();
        if (cur < cost) {
            if (typeof global.showToast === 'function') {
                global.showToast('warning', 'No tienes suficientes tokens (' + cost + ' requeridos).', {
                    containerId: 'ubits-toast-container'
                });
            }
            return false;
        }
        var next = Math.max(0, cur - cost);
        global._ubitsAiTokenPool = next;
        if (typeof global.setAIPanelTokensBadgeValue === 'function') {
            global.setAIPanelTokensBadgeValue(next);
        }
        syncVideoModalTokensBadge();
        return true;
    }

    /* ══════════════════════════════════════
       ESTADO DEL MODAL
    ══════════════════════════════════════ */
    var _onVideoReady   = null;
    var _currentPageKey = null;
    var _currentTab     = 'ia';
    var _selectedAvatar = null;
    var _guionText      = '';
    var _enlaceValue    = '';
    var _enlaceValid    = false;
    var _fileBlob       = null;
    var _fileBlobUrl    = null;
    var _logoDataUrl    = null;
    var _pendingFiles   = [];
    var _currentCat     = 'staff';
    /** API createInput (textarea guión); contexto tema = textarea nativa .ai-panel__input como SCORM. */
    var _guionInputApi   = null;

    /* ══════════════════════════════════════
       DATOS: AVATARES (images/avatars) + CATEGORÍAS
       Prefijos en nombre de archivo → categoría del selector:
       agro, serv, cons, ener, gob, ind, prop, ret, sal, fin, tech, log, sec, host, staff, urb
       Patrón: {prefijo}_{f|m}{edad}_{nombre}[.jpg]  (f/m y edad solo para catálogo; la imagen es la fuente de verdad)
    ══════════════════════════════════════ */
    var PREFIX_TO_CAT = {
        agro: 'agro',
        serv: 'servicios',
        cons: 'consumo',
        ener: 'energia',
        gob: 'gobierno',
        ind: 'industria',
        prop: 'propiedad',
        ret: 'retail',
        sal: 'salud',
        fin: 'seguros',
        tech: 'tech',
        log: 'transporte',
        sec: 'seguridad',
        host: 'hosteleria',
        staff: 'staff',
        urb: 'creatividad'
    };

    /** Archivos en images/avatars (orden alfabético; coincide con `ls | sort`). */
    var AVATAR_FILES_SORTED = [
        'agro_f27_helena.jpg',
        'agro_f45_marta.jpg',
        'agro_m27_juan.jpg',
        'agro_m45_roberto.jpg',
        'cons_f27_sofia.jpg',
        'cons_f45_lucia.jpg',
        'cons_m27_luis.jpg',
        'cons_m45_fernando.jpg',
        'ener_f27_valentina.jpg',
        'ener_f45_gabriela.jpg',
        'ener_m27_diego.jpg',
        'ener_m45_javier.jpg',
        'fin_f27_andrea.jpg',
        'fin_f45_beatriz.jpg',
        'fin_m27_lucas.jpg',
        'fin_m45_joaquin.jpg',
        'gob_f27_isabella.jpg',
        'gob_f45_carmen.jpg',
        'gob_m27_mateo.jpg',
        'gob_m45_francisco.jpg',
        'host_f27_blanca.jpg',
        'host_m27_raul.jpg',
        'ind_f27_camila.jpg',
        'ind_f45_victoria.jpg',
        'ind_m27_alejandro.jpg',
        'ind_m45_eduardo.jpg',
        'log_f27_julieta.jpg',
        'log_f45_silvia.jpg',
        'log_m27_rodrigo.jpg',
        'log_m45_manuel.jpg',
        'prop_f27_mariana.jpg',
        'prop_f45_paula.jpg',
        'prop_m27_santiago.jpg',
        'prop_m45_hugo.jpg',
        'ret_f27_martina.jpg',
        'ret_f45_daniela.jpg',
        'ret_m27_leonardo.jpg',
        'ret_m45_miguel.jpg',
        'sal_f27_natalia.jpg',
        'sal_f45_claudia.jpg',
        'sal_m27_gabriel.jpg',
        'sal_m45_arturo.jpg',
        'sec_f35_rosa.jpg',
        'sec_m35_alberto.jpg',
        'serv_f27_ana.jpg',
        'serv_f45_patricia.jpg',
        'serv_m27_carlos.jpg',
        'serv_m45_ricardo.jpg',
        'staff_f23_antonia.jpg',
        'staff_f30_alicia.jpg',
        'staff_f30_monica.jpg',
        'staff_f32_maria.jpg',
        'staff_f35_graciela.jpg',
        'staff_m23_benjamin.jpg',
        'staff_m30_esteban.jpg',
        'staff_m30_rafael.jpg',
        'staff_m32_jorge.jpg',
        'staff_m35_david.jpg',
        'tech_f27_sara.jpg',
        'tech_f45_fernanda.jpg',
        'tech_m27_felipe.jpg',
        'tech_m45_gonzalo.jpg',
        'urb_f27_lorena.jpg',
        'urb_m27_oscar.jpg',
        'urb_m30_enrique.jpg',
        'urb_m30_julian.jpg'
    ];

    function buildAvatarsCatalog() {
        return AVATAR_FILES_SORTED.map(function (file, i) {
            var base = file.replace(/\.(jpe?g|png|webp)$/i, '');
            var m = /^([a-z]+)_([fm])(\d+)_(.+)$/.exec(base);
            if (!m) {
                throw new Error('[video-recurso-modal] Nombre de avatar inválido: ' + file);
            }
            var prefix = m[1];
            var cat = PREFIX_TO_CAT[prefix];
            if (!cat) {
                throw new Error('[video-recurso-modal] Prefijo de categoría desconocido: ' + prefix + ' (' + file + ')');
            }
            var rawName = m[4];
            var label = rawName.charAt(0).toUpperCase() + rawName.slice(1);
            return {
                id: i + 1,
                cat: cat,
                file: file,
                label: label,
                gender: m[2],
                age: parseInt(m[3], 10)
            };
        });
    }

    var AVATARS = buildAvatarsCatalog();

    var CATEGORY_ORDER = [
        { id: 'staff', label: 'Staff & Oficina' },
        { id: 'agro', label: 'Agroindustria' },
        { id: 'servicios', label: 'Compañía de Servicios' },
        { id: 'consumo', label: 'Consumo Masivo' },
        { id: 'creatividad', label: 'Creatividad' },
        { id: 'energia', label: 'Energía & Minería' },
        { id: 'gobierno', label: 'Gobierno' },
        { id: 'hosteleria', label: 'Hostelería' },
        { id: 'industria', label: 'Industria & Manufactura' },
        { id: 'propiedad', label: 'Propiedad & Construcción' },
        { id: 'retail', label: 'Retail' },
        { id: 'salud', label: 'Salud & Farmacéuticos' },
        { id: 'seguridad', label: 'Seguridad' },
        { id: 'seguros', label: 'Seguros & Finanzas' },
        { id: 'tech', label: 'Tecnología' },
        { id: 'transporte', label: 'Transporte & Logística' }
    ];

    function countAvatarsByCategory() {
        var counts = {};
        AVATARS.forEach(function (a) {
            counts[a.cat] = (counts[a.cat] || 0) + 1;
        });
        return counts;
    }

    var _avatarCatCounts = countAvatarsByCategory();
    var CATEGORIES = CATEGORY_ORDER.map(function (c) {
        return { id: c.id, label: c.label, count: _avatarCatCounts[c.id] || 0 };
    }).concat([{ id: 'all', label: 'Todos', count: AVATARS.length }]);

    /* ══════════════════════════════════════
       AVATAR HELPERS
    ══════════════════════════════════════ */
    var AVATAR_IMG_BASE = '../../images/avatars/';
    /** Base name (sin extensión) de avatar con archivo en ../../videos/avatars/{base}.mp4 — ampliar al subir nuevos previews. */
    var AVATAR_PREVIEW_VIDEO_BASES = [
        'staff_f23_antonia',
        'staff_f32_maria',
        'staff_f30_monica',
        'staff_f35_graciela',
        'staff_m23_benjamin',
        'staff_m30_rafael',
        'staff_m30_esteban',
        'staff_m32_jorge',
        'staff_m35_david'
    ];

    var AVATAR_VIDEO_BASE = '../../videos/avatars/';
    /** MP4 local que simula el resultado de «Generar video» con IA (prototipo Playground). */
    var AI_GENERATED_RESULT_MP4 = AVATAR_VIDEO_BASE + 'preview-video-generado.mp4';

    function avatarImg(av) {
        return AVATAR_IMG_BASE + av.file;
    }

    function avatarFileBasename(av) {
        return String(av.file || '').replace(/\.(jpe?g|png|webp)$/i, '');
    }

    function avatarHasPreviewMp4(av) {
        return AVATAR_PREVIEW_VIDEO_BASES.indexOf(avatarFileBasename(av)) !== -1;
    }

    function avatarPreviewMp4Src(av) {
        if (!avatarHasPreviewMp4(av)) return null;
        return AVATAR_VIDEO_BASE + avatarFileBasename(av) + '.mp4';
    }

    /* ══════════════════════════════════════
       HELPERS GENÉRICOS
    ══════════════════════════════════════ */
    function esc(s) {
        if (s == null) return '';
        var d = document.createElement('div');
        d.textContent = s;
        return d.innerHTML;
    }

    function isValidVideoUrl(url) {
        var v = String(url || '').trim();
        if (!v) return false;
        return v.indexOf('vimeo.com')          !== -1 ||
               v.indexOf('youtube.com')        !== -1 ||
               v.indexOf('youtu.be')           !== -1 ||
               v.indexOf('drive.google.com')   !== -1 ||
               v.indexOf('onedrive.live.com')  !== -1;
    }

    function buildEmbedSrc(url) {
        var v = String(url || '').trim();
        if (v.indexOf('vimeo.com') !== -1) {
            var mV = v.match(/vimeo\.com\/(\d+)/);
            return mV ? 'https://player.vimeo.com/video/' + mV[1] : v;
        }
        if (v.indexOf('youtube.com') !== -1 || v.indexOf('youtu.be') !== -1) {
            var mY = v.match(/(?:v=|youtu\.be\/)([^&\?]+)/);
            return mY ? 'https://www.youtube.com/embed/' + mY[1] : v;
        }
        if (v.indexOf('drive.google.com') !== -1) return v.replace('/view', '/preview');
        if (v.indexOf('onedrive.live.com') !== -1) return v.replace('view.aspx', 'embed');
        return v;
    }

    function embedType(url) {
        var v = String(url || '');
        if (v.indexOf('vimeo.com')         !== -1) return 'vimeo';
        if (v.indexOf('youtube.com')       !== -1 || v.indexOf('youtu.be') !== -1) return 'youtube';
        if (v.indexOf('drive.google.com')  !== -1) return 'google-drive';
        if (v.indexOf('onedrive.live.com') !== -1) return 'onedrive';
        return 'html5';
    }

    function buildPlayerHtml(type, src, isLocal) {
        if (isLocal) {
            return (
                '<video class="cc-video-local-player" src="' + esc(src) + '" controls playsinline ' +
                'style="width:100%;aspect-ratio:16/9;background:#000;display:block;border-radius:var(--border-radius-md)"></video>'
            );
        }
        if (typeof global.videoPlayerHtml === 'function') {
            return global.videoPlayerHtml({ type: type, src: src, className: 'is-forced-16-9' });
        }
        return (
            '<iframe src="' + esc(src) + '" frameborder="0" style="width:100%;aspect-ratio:16/9;display:block" ' +
            'allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowfullscreen></iframe>'
        );
    }

    function buildRenderedBlock(type, src, isLocal, blockOpts) {
        blockOpts = blockOpts || {};
        var aiHost =
            blockOpts.aiGenerated && typeof global.getGeneradoConIaBadgeHtml === 'function'
                ? '<div class="cc-video-resource__generado-ia-host">' + global.getGeneradoConIaBadgeHtml() + '</div>'
                : '';
        var logoSrc = blockOpts.logoSrc || blockOpts.logoDataUrl || '';
        var logoOverlay =
            logoSrc
                ? '<div class="cc-video-resource__logo-overlay" aria-hidden="true">' +
                    '<img src="' + esc(logoSrc) + '" alt="">' +
                    '</div>'
                : '';
        return (
            '<div class="ubits-resources-block ubits-resources-block--stack">' +
                '<div class="ubits-resources-block__surface cc-video-resource__surface" style="padding:0;">' +
                    '<div class="cc-video-resource__player-wrap">' +
                    aiHost +
                    buildPlayerHtml(type, src, isLocal) +
                    logoOverlay +
                    '</div>' +
                '</div>' +
                '<div class="ubits-resources-block__footer">' +
                    '<button type="button" class="ubits-button ubits-button--error-secondary ubits-button--sm" id="cc-eliminar-recurso">' +
                        '<i class="far fa-trash-alt"></i><span>Eliminar</span>' +
                    '</button>' +
                '</div>' +
            '</div>'
        );
    }

    /* ══════════════════════════════════════
       GENERADOR DE GUIÓN (simulado)
    ══════════════════════════════════════ */
    function generateGuion() {
        var txt =
            'La forma en que hablas durante un conflicto puede empeorar la situación o ayudarte a resolverla. Hoy veremos cómo desescalar tensiones en el trabajo.\n\n' +
            'Cuando una conversación se pone tensa, el objetivo no es ganar la discusión. El objetivo es recuperar claridad y mantener el respeto.\n\n' +
            'El primer paso es regular tu tono. Respira, baja la velocidad y evita responder con la misma intensidad emocional de la otra persona.\n\n' +
            'En lugar de reaccionar de inmediato, puedes usar una frase simple como: Dame un segundo para entenderte bien antes de responder.\n\n' +
            'También ayuda describir la situación sin atacar. Habla sobre lo que percibes, no sobre las intenciones o defectos de la otra persona.\n\n' +
            'Por ejemplo, funciona mejor decir siento tensión en esta conversación, que lanzar acusaciones o usar frases absolutas como tú siempre haces esto.\n\n' +
            'Otra técnica útil es validar la emoción sin validar el conflicto. Puedes reconocer frustración sin aceptar agresiones o malos tratos.\n\n' +
            'Una frase sencilla puede cambiar completamente el tono de la conversación. Por ejemplo: entiendo que esto te está frustrando en este momento.\n\n' +
            'Las preguntas abiertas también ayudan a bajar la tensión porque cambian el enfoque del problema hacia una posible solución compartida.\n\n' +
            'Puedes preguntar qué es lo más importante para ti ahora, o qué resultado te gustaría lograr con esta conversación.\n\n' +
            'Finalmente, resume lo que entendiste y propone un siguiente paso pequeño, claro y fácil de ejecutar para ambas personas.\n\n' +
            'Las conversaciones difíciles no se resuelven con más presión. Se resuelven con claridad, regulación emocional y escucha activa.';
        return txt.length > VIDEO_GUION_MAX_CHARS ? txt.slice(0, VIDEO_GUION_MAX_CHARS - 3) + '...' : txt;
    }

    /* ══════════════════════════════════════
       CONSTRUIR HTML — PANEL IA
    ══════════════════════════════════════ */
    function buildAvatarGridItemsHtml(cat) {
        var list = (!cat || cat === 'all') ? AVATARS : AVATARS.filter(function (av) { return av.cat === cat; });
        return list.map(function (av) {
            var sel = _selectedAvatar && _selectedAvatar.id === av.id;
            return '<div role="button" tabindex="0" class="cc-vm-avatar-card' + (sel ? ' cc-vm-avatar-card--selected' : '') + '" ' +
                'data-avatar-id="' + av.id + '" aria-pressed="' + (sel ? 'true' : 'false') + '" ' +
                'aria-label="' + esc(av.label) + '">' +
                '<span class="cc-vm-avatar-card__checkbox" aria-hidden="true">' +
                    '<span class="ubits-checkbox ubits-checkbox--sm">' +
                        '<input type="checkbox" class="ubits-checkbox__input" tabindex="-1" ' + (sel ? 'checked ' : '') + '>' +
                        '<span class="ubits-checkbox__box"><i class="far fa-check"></i></span>' +
                    '</span>' +
                '</span>' +
                '<img src="' + avatarImg(av) + '" alt="' + esc(av.label) + '" loading="lazy">' +
            '</div>';
        }).join('');
    }

    function buildIaPanel() {
        var av = _selectedAvatar || AVATARS[0];
        var avSrc = avatarImg(av);
        var mp4 = avatarPreviewMp4Src(av);
        var hasVid = !!mp4;
        var stageClass = 'cc-vm-preview-stage' + (hasVid ? '' : ' cc-vm-preview-stage--placeholder');

        return '<div class="cc-vmodal-panel" id="cc-vtab-ia">' +
            '<div class="cc-vm-ia-layout">' +

                // ── Left column ──
                '<div class="cc-vm-left-col">' +

                    // Section 1: Avatar
                    '<div class="cc-vm-section">' +
                        '<div class="cc-vm-avatar-header">' +
                            '<span class="cc-vm-avatar-header-label ubits-body-sm-semibold" style="color:var(--ubits-fg-1-medium);">Avatar</span>' +
                            '<div id="cc-vm-cat-select-wrap" style="width:200px;"></div>' +
                        '</div>' +
                        '<div class="cc-vm-avatar-grid" id="cc-vm-grid">' +
                            buildAvatarGridItemsHtml(_currentCat) +
                        '</div>' +
                    '</div>' +

                    '<div class="cc-vm-section-divider"></div>' +

                    // Section 2: Guión
                    '<div class="cc-vm-section">' +
                        '<p class="cc-vm-section-label">Guión</p>' +
                        // IA input-box (always visible, no mini-tabs)
                        '<div class="ubits-ia-chat-thread__input-area">' +
                            '<div class="ai-panel__input-box" id="cc-vm-ia-input-box">' +
                                '<input type="file" id="cc-vm-files" accept=".txt,.pdf,.doc,.docx,text/plain,application/pdf" multiple hidden>' +
                                '<div class="ai-panel__pending-files-strip" id="cc-vm-pending-files" style="display:none;"></div>' +
                                '<textarea id="cc-vm-context-input" class="ai-panel__input ubits-body-md-regular" rows="2" placeholder="Adjunta un archivo o describe el tema del guión"></textarea>' +
                                '<div class="ai-panel__input-actions">' +
                                    '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm ubits-button--icon-only ai-panel__attach-btn" id="cc-vm-attach" aria-label="Adjuntar">' +
                                        '<i class="far fa-plus"></i>' +
                                    '</button>' +
                                    '<button type="button" class="ubits-button ubits-button--primary ubits-button--sm ubits-button--with-token-cost" id="cc-vm-btn-gen-guion">' +
                                        '<span class="ubits-button__token-cost" aria-hidden="true">' +
                                            '<span class="ubits-button__token-number">' + VIDEO_GUION_IA_TOKEN_COST + '</span>' +
                                            '<i class="far fa-coin-vertical"></i>' +
                                        '</span>' +
                                        '<span id="cc-vm-gen-guion-label">Generar guión</span>' +
                                    '</button>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                        // Guión: Input UBITS textarea + contador (createInput)
                        '<div class="cc-vm-guion-editor-wrap">' +
                            '<div id="cc-vm-guion-create-input-wrap" class="cc-vm-guion-input-mount"></div>' +
                        '</div>' +
                    '</div>' +

                    '<div class="cc-vm-section-divider"></div>' +

                    // Section 3: Logo
                    '<div class="cc-vm-section">' +
                        '<p class="cc-vm-section-label">Logo de empresa <span class="cc-vm-optional">(opcional)</span></p>' +
                        '<div class="cc-vm-logo-row">' +
                            '<input type="file" accept="image/png,.png" id="cc-vm-logo-file" tabindex="-1" aria-hidden="true" style="display:none">' +
                            '<button type="button" class="ubits-button ubits-button--secondary" id="cc-vm-logo-drop-zone">' +
                                '<i class="far fa-image" aria-hidden="true"></i>' +
                                '<span>Subir logo PNG</span>' +
                            '</button>' +
                            '<div id="cc-vm-logo-chip-wrap"></div>' +
                        '</div>' +
                    '</div>' +

                '</div>' +

                // ── Right column: avatar preview stage ──
                '<div class="cc-vm-right-col">' +
                    '<p class="cc-via-preview-hint">Vista previa orientativa. El video final usará tu guión y avatar seleccionado.</p>' +
                    '<div class="' + stageClass + '" id="cc-vm-preview-stage">' +
                        '<img id="cc-vm-av-bg" class="cc-vm-av-bg" src="' + avSrc + '" alt="">' +
                        '<video id="cc-vm-av-preview-video" class="cc-vm-av-preview-video" playsinline controls preload="metadata" ' +
                            'poster="' + esc(avSrc) + '" ' +
                            (hasVid ? 'src="' + esc(mp4) + '" ' : '') +
                            'style="display:' + (hasVid ? 'block' : 'none') + '"></video>' +
                        '<img id="cc-vm-av-portrait" class="cc-vm-av-portrait" src="' + avSrc + '" alt=""' +
                            (hasVid ? ' style="display:none"' : '') + '>' +
                        '<div class="cc-vm-preview-unavailable" id="cc-vm-preview-unavailable" role="status" style="display:' + (hasVid ? 'none' : 'flex') + '">' +
                            '<span class="ubits-body-md-regular cc-vm-preview-unavailable__text">Vista previa de video no disponible aún</span>' +
                        '</div>' +
                        '<div class="cc-vm-logo-overlay" id="cc-vm-logo-overlay" style="display:none;">' +
                            '<img id="cc-vm-logo-preview-img" src="" alt="Logo">' +
                        '</div>' +
                    '</div>' +
                '</div>' +

            '</div>' +
        '</div>';
    }

    function buildEnlacePanel() {
        return (
            '<div class="cc-vmodal-panel cc-vmodal-panel--hidden" id="cc-vtab-enlace">' +
                '<div class="cc-vmodal-enlace-layout">' +
                    '<div id="cc-venlace-input-wrap"></div>' +
                    '<div class="cc-vmodal-enlace-info">' +
                        '<i class="far fa-circle-info" aria-hidden="true"></i>' +
                        '<span class="ubits-body-sm-regular">Se admiten enlaces de YouTube, Vimeo, Google Drive y OneDrive.</span>' +
                    '</div>' +
                '</div>' +
                '<div class="cc-vmodal-actions-row">' +
                    '<button type="button" class="ubits-button ubits-button--secondary ubits-button--md" id="cc-venlace-volver-ia">' +
                        '<span>Volver</span>' +
                    '</button>' +
                    '<button type="button" class="ubits-button ubits-button--secondary ubits-button--md" id="cc-venlace-btn-cargar" disabled>' +
                        '<i class="far fa-link"></i><span>Cargar video</span>' +
                    '</button>' +
                '</div>' +
            '</div>'
        );
    }

    function buildSubirPanel() {
        return (
            '<div class="cc-vmodal-panel cc-vmodal-panel--hidden" id="cc-vtab-subir">' +
                '<div class="cc-vmodal-subir-layout">' +
                    '<div id="cc-vsubir-fu-wrap"></div>' +
                '</div>' +
                '<div class="cc-vmodal-actions-row">' +
                    '<button type="button" class="ubits-button ubits-button--secondary ubits-button--md" id="cc-subir-volver-ia">' +
                        '<span>Volver</span>' +
                    '</button>' +
                    '<button type="button" class="ubits-button ubits-button--primary ubits-button--md" id="cc-vsubir-btn-confirmar" disabled>' +
                        '<i class="far fa-check"></i><span>Usar video</span>' +
                    '</button>' +
                '</div>' +
            '</div>'
        );
    }

    function buildTabBar() {
        return (
            '<div id="cc-vmodal-tabbar" class="cc-vmodal-tabbar" role="tablist">' +
                '<div class="cc-vmodal-tabbar__group">' +
                    '<button type="button" class="ubits-tab ubits-tab--sm ubits-tab--active" role="tab" aria-selected="true" data-cc-vtab="ia">' +
                        '<span>Video IA</span>' +
                    '</button>' +
                    '<button type="button" class="ubits-tab ubits-tab--sm" role="tab" aria-selected="false" data-cc-vtab="enlace">' +
                        '<span>Enlace de video</span>' +
                    '</button>' +
                    '<button type="button" class="ubits-tab ubits-tab--sm" role="tab" aria-selected="false" data-cc-vtab="subir">' +
                        '<span>Subir video</span>' +
                    '</button>' +
                '</div>' +
            '</div>'
        );
    }

    function buildModalBody() {
        return (
            '<div class="cc-vmodal">' +
                buildTabBar() +
                buildIaPanel() +
                buildEnlacePanel() +
                buildSubirPanel() +
            '</div>'
        );
    }

    /* ══════════════════════════════════════
       LÓGICA DE INTERACCIONES
    ══════════════════════════════════════ */

    /* ── Tab switching ── */
    function switchToTab(tab) {
        _currentTab = tab;
        var bar = document.getElementById('cc-vmodal-tabbar');
        if (bar) {
            bar.querySelectorAll('[data-cc-vtab]').forEach(function (btn) {
                var t = btn.getAttribute('data-cc-vtab');
                var on = t === tab;
                btn.classList.toggle('ubits-tab--active', on);
                btn.setAttribute('aria-selected', on ? 'true' : 'false');
            });
        }
        ['ia', 'enlace', 'subir'].forEach(function (p) {
            var el = document.getElementById('cc-vtab-' + p);
            if (el) el.classList.toggle('cc-vmodal-panel--hidden', p !== tab);
        });
        if (tab === 'enlace' && !document.querySelector('#cc-venlace-input-wrap .ubits-input')) {
            initEnlaceInput();
        }
        if (tab === 'subir' && !document.getElementById('cc-vsubir-fu')) {
            initSubirFileUpload();
        }
    }

    /* ── Botones IA ── */
    function refreshIaButtons() {
        var g = getVideoAiTokens();
        var genGuion = document.getElementById('cc-vm-btn-gen-guion');
        var genVid   = document.getElementById('cc-vm-btn-generar');
        if (genGuion) genGuion.disabled = g < VIDEO_GUION_IA_TOKEN_COST;
        if (genVid)   genVid.disabled   = g < VIDEO_GEN_TOKEN_COST;
    }

    /* ── Avatar ── */
    function updatePreviewStage(av) {
        if (!av) return;
        var src = avatarImg(av);
        var mp4 = avatarPreviewMp4Src(av);
        var stage = document.getElementById('cc-vm-preview-stage');
        var bg = document.getElementById('cc-vm-av-bg');
        var portrait = document.getElementById('cc-vm-av-portrait');
        var videoEl = document.getElementById('cc-vm-av-preview-video');
        var unavail = document.getElementById('cc-vm-preview-unavailable');

        if (bg) bg.src = src;
        if (portrait) portrait.src = src;
        if (videoEl) videoEl.setAttribute('poster', src);

        if (mp4 && videoEl && stage) {
            stage.classList.remove('cc-vm-preview-stage--placeholder');
            if (unavail) unavail.style.display = 'none';
            if (portrait) portrait.style.display = 'none';
            videoEl.style.display = 'block';
            if (videoEl.getAttribute('src') !== mp4) {
                videoEl.setAttribute('src', mp4);
            }
            videoEl.muted = false;
            videoEl.loop = false;
            videoEl.load();
            var p = videoEl.play();
            if (p && typeof p.catch === 'function') {
                p.catch(function () { /* autoplay puede bloquearse; el usuario usa controls */ });
            }
        } else {
            if (stage) stage.classList.add('cc-vm-preview-stage--placeholder');
            if (videoEl) {
                videoEl.pause();
                videoEl.removeAttribute('src');
                videoEl.load();
                videoEl.style.display = 'none';
            }
            if (portrait) portrait.style.display = '';
            if (unavail) unavail.style.display = '';
        }
    }

    function selectAvatar(id) {
        var av = AVATARS.filter(function (a) { return a.id === id; })[0];
        if (!av) return;
        _selectedAvatar = av;
        var grid = document.getElementById('cc-vm-grid');
        if (grid) {
            grid.querySelectorAll('.cc-vm-avatar-card').forEach(function (card) {
                var sel = parseInt(card.getAttribute('data-avatar-id'), 10) === id;
                card.classList.toggle('cc-vm-avatar-card--selected', sel);
                card.setAttribute('aria-pressed', sel ? 'true' : 'false');
                var inp = card.querySelector('.ubits-checkbox__input');
                if (inp) inp.checked = sel;
            });
        }
        updatePreviewStage(av);
    }

    function filterAvatarsByCategory(cat) {
        _currentCat = cat || 'staff';
        var grid = document.getElementById('cc-vm-grid');
        if (grid) {
            grid._ccWired = false;
            grid.innerHTML = buildAvatarGridItemsHtml(_currentCat);
        }
        wireAvatarGrid();
    }

    function wireAvatarGrid() {
        var grid = document.getElementById('cc-vm-grid');
        if (!grid || grid._ccWired) return;
        grid._ccWired = true;
        grid.addEventListener('click', function (e) {
            var card = e.target.closest('.cc-vm-avatar-card');
            if (card) selectAvatar(parseInt(card.getAttribute('data-avatar-id'), 10));
        });
        grid.addEventListener('keydown', function (e) {
            if (e.key !== 'Enter' && e.key !== ' ') return;
            var card = e.target.closest('.cc-vm-avatar-card');
            if (!card || !grid.contains(card)) return;
            e.preventDefault();
            selectAvatar(parseInt(card.getAttribute('data-avatar-id'), 10));
        });
    }

    /* ── Category select (via createInput) ── */
    function initCategorySelect() {
        var wrap = document.getElementById('cc-vm-cat-select-wrap');
        if (!wrap || wrap._ccWired || typeof global.createInput !== 'function') return;
        wrap._ccWired = true;

        var selectOptions = CATEGORIES.map(function (c) {
            /* createInput select usa `text`, no `label` (ver input.js / setupSelectWithDropdownMenu). */
            return { value: c.id, text: c.label + ' (' + c.count + ')' };
        });

        global.createInput({
            containerId:   'cc-vm-cat-select-wrap',
            type:          'select',
            size:          'sm',
            value:         'staff',
            selectOptions: selectOptions,
            onChange: function (val) {
                filterAvatarsByCategory(val);
            }
        });
    }

    /* ── Attach files (pending files strip pattern) ── */
    function renderPendingFilesStrip() {
        var strip = document.getElementById('cc-vm-pending-files');
        if (!strip) return;
        if (_pendingFiles.length === 0) {
            strip.style.display = 'none';
            strip.innerHTML = '';
            return;
        }
        strip.style.display = 'flex';
        strip.innerHTML = _pendingFiles.map(function (f, idx) {
            return '<span class="ubits-chip ubits-chip--sm ubits-chip--icon-left ubits-chip--close ai-panel__pending-file-chip">' +
                '<i class="far fa-file-lines ubits-chip__icon" aria-hidden="true"></i>' +
                '<span class="ubits-chip__text">' + esc(f.name) + '</span>' +
                '<button type="button" class="ubits-chip__close" data-rm-file="' + idx + '" aria-label="Quitar archivo">' +
                    '<i class="far fa-times"></i>' +
                '</button>' +
            '</span>';
        }).join('');
        // Wire remove buttons
        strip.querySelectorAll('[data-rm-file]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var i = parseInt(btn.getAttribute('data-rm-file'));
                _pendingFiles.splice(i, 1);
                renderPendingFilesStrip();
            });
        });
        if (_pendingFiles.length > 0) {
            clearContextTemaError();
        }
    }

    function initInsumoAttach() {
        var attachBtn = document.getElementById('cc-vm-attach');
        var filesInput = document.getElementById('cc-vm-files');
        if (!attachBtn || !filesInput || attachBtn._ccWired) return;
        attachBtn._ccWired = true;

        attachBtn.addEventListener('click', function () {
            filesInput.click();
        });

        filesInput.addEventListener('change', function () {
            var files = filesInput.files;
            if (!files || !files.length) return;
            for (var i = 0; i < files.length; i++) {
                _pendingFiles.push(files[i]);
            }
            filesInput.value = '';
            renderPendingFilesStrip();
        });
    }

    function getContextTemaBox() {
        return document.getElementById('cc-vm-ia-input-box');
    }

    function getContextTemaTextarea() {
        return document.getElementById('cc-vm-context-input');
    }

    function contextTemaValue() {
        var ta = getContextTemaTextarea();
        return ta ? String(ta.value || '').trim() : '';
    }

    function clearContextTemaError() {
        var box = getContextTemaBox();
        if (box) box.classList.remove('ai-panel__input-box--context-error');
    }

    /** Mismo patrón que SCORM: textarea `.ai-panel__input` (sin borde propio; el borde es el `ai-panel__input-box`). */
    function initContextTemaField() {
        var ta = getContextTemaTextarea();
        if (!ta || ta._ccVmCtxWired) return;
        ta._ccVmCtxWired = true;
        ta.addEventListener('input', function () {
            clearContextTemaError();
        });
    }

    function initGuionCreateInput() {
        var wrap = document.getElementById('cc-vm-guion-create-input-wrap');
        if (!wrap || wrap._ccVmGuionWired || typeof global.createInput !== 'function') return;
        wrap._ccVmGuionWired = true;
        _guionInputApi = global.createInput({
            containerId: 'cc-vm-guion-create-input-wrap',
            type: 'textarea',
            showLabel: false,
            label: '',
            placeholder: 'El guión aparecerá aquí, o puedes escribirlo directamente',
            size: 'md',
            maxLength: VIDEO_GUION_MAX_CHARS,
            showCounter: true,
            value: _guionText || '',
            onChange: function (val) {
                _guionText = String(val != null ? val : '');
                if (_guionInputApi && typeof _guionInputApi.setState === 'function') {
                    _guionInputApi.setState('default');
                }
                var w = document.getElementById('cc-vm-guion-create-input-wrap');
                var ht = w && w.querySelector('.ubits-input-helper-text');
                if (ht) {
                    ht.textContent = '';
                    ht.style.display = 'none';
                }
                autosizeGuionTextarea();
                refreshIaButtons();
            }
        });
        // Ajustar alto inicial según contenido + asegurar contador inicial.
        setTimeout(function () {
            autosizeGuionTextarea();
            // Fuerza actualizar contador sin requerir focus/click.
            syncGuionTextareaAfterProgrammaticValue();
        }, 0);
    }

    function getGuionTextareaEl() {
        var w = document.getElementById('cc-vm-guion-create-input-wrap');
        return w ? w.querySelector('textarea.ubits-input') : null;
    }

    function autosizeGuionTextarea() {
        var ta = getGuionTextareaEl();
        if (!ta) return;
        var maxPx = 500;
        ta.style.height = 'auto';
        var next = Math.min(ta.scrollHeight, maxPx);
        ta.style.height = next + 'px';
        ta.style.overflowY = ta.scrollHeight > maxPx ? 'auto' : 'hidden';
    }

    function syncGuionTextareaAfterProgrammaticValue() {
        // createInput actualiza contador en setValue(), pero esto asegura reflow + autoheight.
        var ta = getGuionTextareaEl();
        if (!ta) return;
        try {
            ta.dispatchEvent(new Event('input', { bubbles: true }));
        } catch (e) {}
        autosizeGuionTextarea();
    }

    function setGuionValueProgrammatically(nextValue) {
        var ta = getGuionTextareaEl();
        if (!ta) return;
        var v = String(nextValue != null ? nextValue : '');
        _guionText = v;
        // Evitar usar _guionInputApi.setValue(): en `components/input.js` el contador tiene
        // un bug de scope con `updateCounter` y puede no actualizarse hasta interacción del usuario.
        ta.value = v;
        syncGuionTextareaAfterProgrammaticValue();
        refreshIaButtons();
    }

    function resetContextTemaAfterGuionGeneration() {
        var ta = getContextTemaTextarea();
        if (ta) ta.value = '';
        var filesInput = document.getElementById('cc-vm-files');
        if (filesInput) filesInput.value = '';
        _pendingFiles = [];
        renderPendingFilesStrip();
        clearContextTemaError();
    }

    function setGuionLoading(isLoading) {
        var mount = document.getElementById('cc-vm-guion-create-input-wrap');
        if (!mount) return;
        var hostId = 'cc-vm-guion-loader-host';
        var host = document.getElementById(hostId);

        if (isLoading) {
            if (mount) mount.style.display = 'none';
            if (!host) {
                host = document.createElement('div');
                host.id = hostId;
                host.className = 'cc-vm-guion-loader-host';
                mount.parentNode.insertBefore(host, mount);
            }
            host.style.display = '';
            host.innerHTML = typeof global.getIaLoaderHTML === 'function'
                ? global.getIaLoaderHTML({ label: 'Generando guión' })
                : '<p class="ubits-body-sm-regular" role="status" aria-live="polite">Generando guión...</p>';
            return;
        }

        if (host) host.style.display = 'none';
        if (mount) mount.style.display = '';
    }

    /** Mensaje de error bajo el textarea del guión (createInput invalid + helper oficial). */
    function setGuionValidationInvalid(message) {
        if (!_guionInputApi || typeof _guionInputApi.setState !== 'function') return;
        _guionInputApi.setState('invalid');
        var wrap = document.getElementById('cc-vm-guion-create-input-wrap');
        var ht = wrap && wrap.querySelector('.ubits-input-helper-text');
        if (ht) {
            ht.style.display = '';
            ht.textContent = message || 'Campo requerido';
        }
    }

    function focusGuionFieldAfterError() {
        var mount = document.getElementById('cc-vm-guion-create-input-wrap');
        if (mount) mount.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (_guionInputApi && typeof _guionInputApi.focus === 'function') {
            setTimeout(function () { _guionInputApi.focus(); }, 300);
        }
    }

    /* ── Generate guión button ── */
    function initGenGuionButton() {
        var btn = document.getElementById('cc-vm-btn-gen-guion');
        if (!btn || btn._ccWired) return;
        btn._ccWired = true;
        btn.addEventListener('click', function () {
            var tema = contextTemaValue();
            if (!tema && _pendingFiles.length > 0) {
                tema = _pendingFiles.map(function (f) { return f.name; }).join(', ');
            }
            if (!tema) {
                var boxCtx = getContextTemaBox();
                if (boxCtx) boxCtx.classList.add('ai-panel__input-box--context-error');
                var taCtx = getContextTemaTextarea();
                if (taCtx) taCtx.focus();
                return;
            }
            if (!trySpendVideoAiTokens(VIDEO_GUION_IA_TOKEN_COST)) return;
            clearContextTemaError();
            var labelEl = document.getElementById('cc-vm-gen-guion-label');
            btn.disabled = true;
            if (labelEl) labelEl.textContent = 'Generando...';
            setGuionLoading(true);
            setTimeout(function () {
                var guion = generateGuion();
                setGuionLoading(false);
                setGuionValueProgrammatically(guion);
                resetContextTemaAfterGuionGeneration();
                btn.disabled = false;
                if (labelEl) labelEl.textContent = 'Generar guión';
                refreshIaButtons();
            }, 3000);
        });
    }

    /* ── Logo upload ── */
    function initLogoUpload() {
        var input = document.getElementById('cc-vm-logo-file');
        var trigger = document.getElementById('cc-vm-logo-drop-zone');
        if (!input || input._ccWired) return;
        input._ccWired = true;
        if (trigger && !trigger._ccLogoTriggerWired) {
            trigger._ccLogoTriggerWired = true;
            trigger.addEventListener('click', function () {
                input.click();
            });
        }
        input.addEventListener('change', function () {
            var file = input.files && input.files[0];
            if (!file) return;
            var reader = new FileReader();
            reader.onload = function (e) {
                _logoDataUrl = e.target.result;
                // Show in preview overlay
                var previewImg = document.getElementById('cc-vm-logo-preview-img');
                if (previewImg) previewImg.src = _logoDataUrl;
                var overlay = document.getElementById('cc-vm-logo-overlay');
                if (overlay) overlay.style.display = '';
                // Hide upload button, show chip in its place
                var dropZone = document.getElementById('cc-vm-logo-drop-zone');
                if (dropZone) dropZone.style.display = 'none';
                var chipWrap = document.getElementById('cc-vm-logo-chip-wrap');
                if (chipWrap) {
                    chipWrap.innerHTML =
                        '<div class="cc-vm-insumo-chip">' +
                            '<i class="far fa-image" aria-hidden="true"></i>' +
                            '<span>' + esc(file.name) + '</span>' +
                            '<button type="button" id="cc-vm-logo-remove" aria-label="Quitar logo"><i class="far fa-times"></i></button>' +
                        '</div>';
                    var removeBtn = document.getElementById('cc-vm-logo-remove');
                    if (removeBtn) {
                        removeBtn.addEventListener('click', function () {
                            _logoDataUrl = null;
                            input.value = '';
                            chipWrap.innerHTML = '';
                            var ov = document.getElementById('cc-vm-logo-overlay');
                            if (ov) ov.style.display = 'none';
                            if (dropZone) dropZone.style.display = '';
                        });
                    }
                }
            };
            reader.readAsDataURL(file);
        });
    }

    /* ── Generate video button ── */
    function initGenVideoButton() {
        var btn = document.getElementById('cc-vm-btn-generar');
        if (!btn || btn._ccWired) return;
        btn._ccWired = true;
        btn.addEventListener('click', function () {
            _guionText = _guionInputApi && typeof _guionInputApi.getValue === 'function'
                ? String(_guionInputApi.getValue() || '')
                : _guionText;
            var trimmedGuion = _guionText.trim();
            if (!trimmedGuion.length) {
                setGuionValidationInvalid('Campo requerido');
                focusGuionFieldAfterError();
                return;
            }
            if (trimmedGuion.length < VIDEO_GUION_MIN_CHARS) {
                setGuionValidationInvalid('Escribe al menos 500 caracteres');
                focusGuionFieldAfterError();
                return;
            }
            if (!trySpendVideoAiTokens(VIDEO_GEN_TOKEN_COST)) return;
            var generatedSrc = AI_GENERATED_RESULT_MP4;
            var pageKey = _currentPageKey;
            var logoSnapshot = _logoDataUrl;
            closeModal(OVERLAY_ID);
            startWidgetJob({
                pageKey: pageKey,
                src: generatedSrc,
                logoDataUrl: logoSnapshot
            });
        });
    }

    /* ── Enlace input ── */
    function initEnlaceInput() {
        var wrap = document.getElementById('cc-venlace-input-wrap');
        if (!wrap || typeof global.createInput !== 'function') return;
        global.createInput({
            containerId: 'cc-venlace-input-wrap',
            type:        'text',
            label:       'Enlace de video',
            placeholder: 'https://www.youtube.com/watch?v=...',
            size:        'md',
            helperText:  'Solo se admiten enlaces de YouTube, Vimeo, Google Drive y OneDrive.',
            showHelper:  true,
            onChange: function (val) {
                _enlaceValue = String(val || '').trim();
                _enlaceValid = isValidVideoUrl(_enlaceValue);
                var btn = document.getElementById('cc-venlace-btn-cargar');
                if (btn) {
                    btn.disabled = !_enlaceValid;
                    btn.classList.toggle('ubits-button--primary',   _enlaceValid);
                    btn.classList.toggle('ubits-button--secondary', !_enlaceValid);
                }
                var inp = wrap.querySelector('input');
                if (inp) {
                    if (!_enlaceValue || _enlaceValid) {
                        inp.style.borderColor = 'var(--ubits-border-1)';
                        inp.style.borderWidth = '1px';
                    } else {
                        inp.style.borderColor = 'var(--ubits-feedback-accent-error)';
                        inp.style.borderWidth = '2px';
                    }
                }
            }
        });
        wireEnlaceCargar();
    }

    /* ── Subir file upload ── */
    function initSubirFileUpload() {
        var wrap = document.getElementById('cc-vsubir-fu-wrap');
        if (!wrap || typeof global.createFileUpload !== 'function') return;
        global.createFileUpload({
            containerId: 'cc-vsubir-fu-wrap',
            id:          'cc-vsubir-fu',
            title:       'Video del recurso',
            accept:      'video/mp4,video/webm,video/ogg,video/quicktime,.mp4,.webm,.ogg,.mov',
            maxSizeMb:   250,
            maxLabel:    '250 MB',
            formats:     'MP4, WEBM, MOV · Hasta 250 MB',
            onChange: function (file) {
                _fileBlob = file || null;
                if (_fileBlobUrl) { URL.revokeObjectURL(_fileBlobUrl); _fileBlobUrl = null; }
                var confirmBtn = document.getElementById('cc-vsubir-btn-confirmar');
                if (!file) {
                    if (confirmBtn) confirmBtn.disabled = true;
                    return;
                }
                _fileBlobUrl = URL.createObjectURL(file);
                var fuEl = document.getElementById('cc-vsubir-fu');
                if (fuEl && typeof global.fileUploadSetProgress === 'function') {
                    var pct      = 0;
                    var interval = setInterval(function () {
                        pct += 5;
                        global.fileUploadSetProgress(fuEl, pct);
                        if (pct >= 100) {
                            clearInterval(interval);
                            setTimeout(function () {
                                if (typeof global.fileUploadClearProgress === 'function') global.fileUploadClearProgress(fuEl);
                                if (typeof global.fileUploadSetSuccess    === 'function') global.fileUploadSetSuccess(fuEl, 'Video listo. Haz clic en «Usar video» para continuar.');
                                if (confirmBtn) confirmBtn.disabled = false;
                            }, 200);
                        }
                    }, 80);
                } else {
                    if (confirmBtn) confirmBtn.disabled = false;
                }
            }
        });
        wireSubirConfirmar();
    }

    /* ── Wiring de eventos ── */
    function wireEnlaceCargar() {
        var cargarBtn = document.getElementById('cc-venlace-btn-cargar');
        if (!cargarBtn || cargarBtn._ccWired) return;
        cargarBtn._ccWired = true;
        cargarBtn.addEventListener('click', function () {
            if (!_enlaceValid || !_enlaceValue) return;
            var src  = buildEmbedSrc(_enlaceValue);
            var type = embedType(_enlaceValue);
            var html = buildRenderedBlock(type, src, false, { logoSrc: _logoDataUrl });
            closeModal(OVERLAY_ID);
            if (_onVideoReady) _onVideoReady(html);
            emitRecursosChanged({ type: 'video', pageKey: _currentPageKey, source: 'link' });
        });
    }

    function wireSubirConfirmar() {
        var btn = document.getElementById('cc-vsubir-btn-confirmar');
        if (!btn || btn._ccWired) return;
        btn._ccWired = true;
        btn.addEventListener('click', function () {
            if (!_fileBlobUrl) return;
            var html = buildRenderedBlock('local', _fileBlobUrl, true, { logoSrc: _logoDataUrl });
            closeModal(OVERLAY_ID);
            if (_onVideoReady) _onVideoReady(html);
            emitRecursosChanged({ type: 'video', pageKey: _currentPageKey, source: 'upload' });
        });
    }

    function wireVolverIaButtons() {
        var a = document.getElementById('cc-venlace-volver-ia');
        if (a && !a._ccWired) {
            a._ccWired = true;
            a.addEventListener('click', function () { switchToTab('ia'); });
        }
        var b = document.getElementById('cc-subir-volver-ia');
        if (b && !b._ccWired) {
            b._ccWired = true;
            b.addEventListener('click', function () { switchToTab('ia'); });
        }
    }

    function wireTabBar() {
        var bar = document.getElementById('cc-vmodal-tabbar');
        if (!bar || bar._ccTabBarWired) return;
        bar._ccTabBarWired = true;
        bar.addEventListener('click', function (e) {
            var b = e.target.closest('[data-cc-vtab]');
            if (!b || !bar.contains(b)) return;
            switchToTab(b.getAttribute('data-cc-vtab'));
        });
    }

    function initModalInteractions() {
        wireTabBar();
        wireVolverIaButtons();
        initCategorySelect();
        wireAvatarGrid();
        initInsumoAttach();
        initContextTemaField();
        initGuionCreateInput();
        initGenGuionButton();
        initGenVideoButton();
        initLogoUpload();
        refreshIaButtons();
        updatePreviewStage(_selectedAvatar || AVATARS[0]);
    }

    /* ══════════════════════════════════════
       Chrome IA del modal
    ══════════════════════════════════════ */
    function applyAiModalChrome(overlay) {
        var titleSpan = overlay.querySelector('.ubits-modal-title');
        if (titleSpan) {
            titleSpan.textContent = 'Agregar video';
        }

        var modalContent = overlay.querySelector('.ubits-modal-content');
        if (modalContent) {
            modalContent.classList.add('portada-ia-modal-content', 'cc-video-ia-modal-content');
            modalContent.style.backgroundColor = 'var(--surface-default, #FFFFFF)';
            modalContent.style.backgroundImage =
                'radial-gradient(ellipse 100% 80% at 10% 0%, rgba(var(--modo-ia-glow-orb-rgb-1, 26, 107, 255), 0.15) 0%, transparent 50%),' +
                'radial-gradient(ellipse 95% 78% at 50% 0%, rgba(var(--modo-ia-glow-orb-rgb-2, 76, 230, 255), 0.15) 0%, transparent 48%),' +
                'radial-gradient(ellipse 95% 75% at 90% 0%, rgba(var(--modo-ia-glow-orb-rgb-3, 255, 84, 22), 0.15) 0%, transparent 50%)';
        }

        var modalHeader = overlay.querySelector('.ubits-modal-header');
        if (modalHeader) {
            modalHeader.style.background = 'transparent';
            modalHeader.style.borderBottom = '';
        }

        var modalBody = overlay.querySelector('.ubits-modal-body');
        if (modalBody) {
            modalBody.style.padding = 'var(--padding-xl, 32px)';
            modalBody.style.overflow = 'hidden';
            modalBody.style.display = 'flex';
            modalBody.style.flexDirection = 'column';
            modalBody.style.maxHeight = '';
            modalBody.style.flex = '';
        }

        var closeBtn = overlay.querySelector('.ubits-modal-close');
        var tokensLeft = getVideoAiTokens();
        if (modalHeader && closeBtn) {
            var wrap = document.createElement('div');
            wrap.style.display = 'inline-flex';
            wrap.style.alignItems = 'center';
            wrap.style.gap = 'var(--gap-sm)';

            var badge = document.createElement('span');
            badge.id = 'cc-video-modal-tokens-badge';
            badge.className = 'ubits-badge-tag ubits-badge-tag--outlined ubits-badge-tag--ia ubits-badge-tag--xs';
            badge.setAttribute('tabindex', '0');
            badge.setAttribute('data-tooltip', 'Número de tokens restantes.');
            badge.setAttribute('data-tooltip-delay', '0');
            badge.setAttribute('data-tooltip-tap-toggle', '');
            badge.setAttribute('aria-label', tokensLeft + ' tokens restantes');
            badge.innerHTML =
                '<span class="ubits-badge-tag__token-cost" aria-hidden="true">' +
                '<i class="far fa-coin-vertical"></i>' +
                '<span class="ubits-badge-tag__token-number">' + String(tokensLeft) + '</span>' +
                '</span>';

            wrap.appendChild(badge);
            wrap.appendChild(closeBtn);
            modalHeader.appendChild(wrap);

            if (typeof global.initTooltip === 'function') {
                global.initTooltip('#' + badge.id);
            }
            syncVideoModalTokensBadge();
        }
    }

    /* ══════════════════════════════════════
       FOOTER DEL MODAL
    ══════════════════════════════════════ */
    function buildVideoFooterHtml() {
        return '<div class="ubits-modal-footer__right">' +
            '<button type="button" class="ubits-button ubits-button--primary ubits-button--md ubits-button--with-token-cost" id="cc-vm-btn-generar">' +
                '<span class="ubits-button__token-cost" aria-hidden="true">' +
                    '<span class="ubits-button__token-number">' + VIDEO_GEN_TOKEN_COST + '</span>' +
                    '<i class="far fa-coin-vertical"></i>' +
                '</span>' +
                '<span>Generar video</span>' +
            '</button>' +
        '</div>';
    }

    /* ══════════════════════════════════════
       ABRIR MODAL
    ══════════════════════════════════════ */
    function openVideoRecursoModal(opts) {
        _onVideoReady   = (opts && opts.onVideoReady) || null;
        _currentPageKey = (opts && opts.pageKey)      || null;
        _currentTab     = 'ia';
        _currentCat     = 'staff';
        _selectedAvatar = AVATARS.filter(function (a) { return a.cat === 'staff'; })[0] || AVATARS[0];
        _guionText        = '';
        _guionInputApi    = null;
        _enlaceValue    = '';
        _enlaceValid    = false;
        _fileBlob       = null;
        _logoDataUrl    = null;
        _pendingFiles   = [];
        if (_fileBlobUrl) { URL.revokeObjectURL(_fileBlobUrl); _fileBlobUrl = null; }

        var overlay = openModal({
            overlayId:           OVERLAY_ID,
            title:               'Agregar video',
            bodyHtml:            buildModalBody(),
            size:                'lg',
            closeOnOverlayClick: false,
            footerHtml:          buildVideoFooterHtml(),
        });

        if (overlay) applyAiModalChrome(overlay);

        setTimeout(function () {
            initModalInteractions();
        }, 0);
    }

    /* ══════════════════════════════════════
       GENERACIÓN + WIDGET UNIFICADO
    ══════════════════════════════════════ */
    function startWidgetJob(job) {
        var jobId = (job.pageKey || 'video') + '-video';
        var label = 'Video de avatar IA';

        if (typeof global.ccGenWidget !== 'undefined') {
            global.ccGenWidget.addJob(jobId, { type: 'video', label: label, pageKey: job.pageKey });
        }

        var innerLoader = typeof global.getIaLoaderHTML === 'function'
            ? global.getIaLoaderHTML({ label: 'Generando video' })
            : '<p role="status" aria-live="polite">Generando video…</p>';
        if (_onVideoReady) _onVideoReady('<div class="cc-video-ia-loader-host">' + innerLoader + '</div>');

        setTimeout(function () {
            var html = buildRenderedBlock('local', job.src, true, {
                aiGenerated: true,
                logoSrc: job.logoDataUrl || ''
            });
            if (_onVideoReady) { _onVideoReady(html); _onVideoReady = null; }
            if (typeof global.ccGenWidget !== 'undefined') global.ccGenWidget.finishJob(jobId);
            updateIndexIcon(job.pageKey);
            emitRecursosChanged({ type: 'video', pageKey: job.pageKey, source: 'ai' });
        }, 8000);
    }

    function updateIndexIcon(pageKey) {
        if (!pageKey) return;
        var item = document.querySelector('[data-paginas-creator-key="' + pageKey + '"]');
        if (!item) return;
        var iconEl = item.querySelector('.ubits-paginas-creator__drag-handle i');
        if (iconEl && typeof global.paginasCreatorIconClass === 'function') {
            iconEl.className = global.paginasCreatorIconClass('video');
        }
    }

    function emitRecursosChanged(detail) {
        try {
            document.dispatchEvent(new CustomEvent('ubits-recursos-changed', { detail: detail || {} }));
        } catch (e) { /* noop */ }
    }

    /* Tras llegar al final (autoplay o reproducción manual), volver a 0:00 para no quedar en el último frame (gris). */
    document.addEventListener(
        'ended',
        function (ev) {
            var v = ev.target;
            if (!v || v.tagName !== 'VIDEO') return;
            var cn = typeof v.className === 'string' ? v.className : '';
            var matchPreview = v.id === 'cc-vm-av-preview-video';
            var matchLocal =
                cn.indexOf('cc-video-local-player') !== -1 || cn.indexOf('ubits-video-player') !== -1;
            if (!matchPreview && !matchLocal) return;
            try {
                v.pause();
                v.currentTime = 0;
            } catch (err) { /* noop */ }
        },
        true
    );

    /* ══════════════════════════════════════
       API PÚBLICA
    ══════════════════════════════════════ */
    global.openVideoRecursoModal = openVideoRecursoModal;

}(window));
