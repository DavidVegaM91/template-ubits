/**
 * LMS Creator — Modal «Agregar video» (tres pestañas: Video IA · Enlace · Subir)
 * + Widget flotante de generación de video (estilo Google Drive).
 *
 * Restyling en curso: la UI actual sigue siendo esta. Copia congelada (no cargada en HTML):
 *   video-recurso-modal.legacy.js · video-recurso-modal.legacy.css
 *
 * Depende:
 *   modal.js  (openModal, closeModal)
 *   input.js  (createInput)
 *   file-upload.js (createFileUpload, fileUploadSetProgress, fileUploadClearProgress, fileUploadSetSuccess)
 *   video-player.js (videoPlayerHtml) — opcional, usa fallback si no está
 *   tab.css, file-upload.css, checkbox.css, chip.css, ai-panel.css, video-recurso-modal.css
 *   Avatares (grid): ../../images/avatars/* · preview 16:9: ../../images/avatar-temp-thumbs/thumb_*.jpg
 *   · videos opcionales: ../../videos/avatars/{mismo-base}.mp4
 *   Guión: selector modo IA/manual (Figma 644:1611 — icono arriba, título abajo). IA: solo contexto hasta «Generar guión»; luego textarea editable. Manual: un solo textarea.
 */
(function (global) {
    'use strict';

    var OVERLAY_ID = 'cc-video-recurso-modal';

    /** 'v2' = wizard con stepper (3 pasos). 'legacy' = UI anterior (ver *.legacy.js). */
    var CC_VIDEO_MODAL_UI = 'v2';

    /** Pestaña Video Avatar IA (v2): sm por debajo de este ancho, md en pantallas mayores. */
    var CC_VIDEO_MODAL_IA_BREAKPOINT = 1366;

    var IA_WIZARD_STEP_LABELS = ['Selección avatar', 'Generación de guión', 'Logo compañía'];

    var MODAL_SIZE_CLASSES = ['xs', 'sm', 'md', 'lg'];

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
        var show = _currentTab === 'ia';
        el.style.display = show ? '' : 'none';
        el.setAttribute('aria-hidden', show ? 'false' : 'true');
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
    /** Guión solo del flujo IA (bloque editable bajo «Generar guión»). */
    var _guionTextIa     = '';
    /** Guión solo del modo manual; nunca se rellena desde la IA. */
    var _guionTextManual = '';
    var _enlaceValue    = '';
    var _enlaceValid    = false;
    var _fileBlob       = null;
    var _fileBlobUrl    = null;
    var _logoDataUrl    = null;
    var _pendingFiles   = [];
    var _currentCat     = 'staff';
    /** API createInput (textarea guión); contexto tema = textarea nativa .ai-panel__input como SCORM. */
    var _guionInputApi   = null;
    /** 'ia' | 'manual' — fuente del guión para «Generar video» (solo el modo activo cuenta). */
    var _guionMode       = 'ia';
    /** En modo IA: si ya hubo generación (o se importó texto desde manual), se muestra el editor bajo el contexto. */
    var _guionIaEditorVisible = false;
    /** Paso del wizard IA (v2): 0 avatar · 1 guión · 2 logo */
    var _iaWizardStep = 0;

    /* ══════════════════════════════════════
       DATOS: AVATARES (images/avatars) + CATEGORÍAS
       Prefijos en nombre de archivo → categoría del selector:
       agro, serv, cmas, crea, ener, gob, ind, cons, ret, sal, fin, tech, log, sec, host, staff
       (cmas = consumo masivo; cons = construcción / propiedad en UI; crea = creatividad)
       Patrón: {prefijo}_{f|m}{edad}_{nombre}[.jpg]  (f/m y edad solo para catálogo; la imagen es la fuente de verdad)
    ══════════════════════════════════════ */
    var PREFIX_TO_CAT = {
        agro: 'agro',
        serv: 'servicios',
        cmas: 'consumo',
        ener: 'energia',
        gob: 'gobierno',
        ind: 'industria',
        cons: 'propiedad',
        ret: 'retail',
        sal: 'salud',
        fin: 'seguros',
        tech: 'tech',
        log: 'transporte',
        sec: 'seguridad',
        host: 'hosteleria',
        staff: 'staff',
        crea: 'creatividad'
    };

    /** Archivos en images/avatars (orden alfabético; coincide con `ls | sort`). */
    var AVATAR_FILES_SORTED = [
        'agro_f27_helena.jpg',
        'agro_f45_marta.jpg',
        'agro_m27_juan.jpg',
        'agro_m45_roberto.jpg',
        'cmas_f27_sofia.jpg',
        'cmas_f45_lucia.jpg',
        'cmas_m27_luis.jpg',
        'cmas_m45_fernando.jpg',
        'cons_f27_mariana.jpg',
        'cons_f45_patricia.jpg',
        'cons_f45_paula.jpg',
        'cons_m27_santiago.jpg',
        'cons_m45_hugo.jpg',
        'crea_f27_lorena.jpg',
        'crea_m27_oscar.jpg',
        'crea_m30_enrique.jpg',
        'crea_m30_julian.jpg',
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
        'tech_m45_gonzalo.jpg'
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
        { id: 'propiedad', label: 'Construcción' },
        { id: 'consumo', label: 'Consumo Masivo' },
        { id: 'creatividad', label: 'Creatividad' },
        { id: 'energia', label: 'Energía & Minería' },
        { id: 'gobierno', label: 'Gobierno' },
        { id: 'hosteleria', label: 'Hostelería' },
        { id: 'industria', label: 'Industria & Manufactura' },
        { id: 'retail', label: 'Retail' },
        { id: 'salud', label: 'Salud & Farmacéuticos' },
        { id: 'seguridad', label: 'Seguridad' },
        { id: 'seguros', label: 'Seguros & Finanzas' },
        { id: 'servicios', label: 'Servicios' },
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
        'staff_f30_alicia',
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

    /** Miniatura 16:9 del preview (images/avatar-temp-thumbs); no usar images/avatars en el stage. */
    var AVATAR_TEMP_THUMB_BASE = '../../images/avatar-temp-thumbs/';
    function avatarTempThumbSrc(av) {
        return AVATAR_TEMP_THUMB_BASE + 'thumb_' + avatarFileBasename(av) + '.jpg';
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
                'style="width:100%;height:100%;display:block;object-fit:contain;background-color:var(--ubits-bg-2)"></video>'
            );
        }
        if (typeof global.videoPlayerHtml === 'function') {
            return global.videoPlayerHtml({ type: type, src: src, className: 'is-forced-16-9' });
        }
        return (
            '<iframe src="' + esc(src) + '" frameborder="0" style="width:100%;height:100%;display:block;border:none" ' +
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

    function buildAvatarPickItemsHtml(cat) {
        var list = (!cat || cat === 'all') ? AVATARS : AVATARS.filter(function (av) { return av.cat === cat; });
        return list
            .map(function (av) {
                var sel = _selectedAvatar && _selectedAvatar.id === av.id;
                return (
                    '<button type="button" class="cc-vm-avatar-pick__item' +
                    (sel ? ' cc-vm-avatar-pick__item--selected' : '') +
                    '" data-avatar-id="' +
                    av.id +
                    '" aria-pressed="' +
                    (sel ? 'true' : 'false') +
                    '" aria-label="' +
                    esc(av.label) +
                    '">' +
                    '<img src="' +
                    avatarImg(av) +
                    '" alt="" loading="lazy" width="64" height="64">' +
                    '</button>'
                );
            })
            .join('');
    }

    function buildPreviewStageHtml(av) {
        var thumbSrc = avatarTempThumbSrc(av);
        var mp4 = avatarPreviewMp4Src(av);
        var hasVid = !!mp4;
        var stageClass =
            'cc-vm-preview-stage' +
            (hasVid ? ' cc-vm-preview-stage--has-thumb' : ' cc-vm-preview-stage--placeholder');

        return (
            '<div class="' +
            stageClass +
            '" id="cc-vm-preview-stage">' +
            '<img id="cc-vm-av-bg" class="cc-vm-av-bg" src="' +
            thumbSrc +
            '" alt="">' +
            '<video id="cc-vm-av-preview-video" class="cc-vm-av-preview-video" playsinline controls preload="metadata" ' +
            'poster="' +
            esc(thumbSrc) +
            '" ' +
            (hasVid ? 'src="' + esc(mp4) + '" ' : '') +
            'style="display:' +
            (hasVid ? 'block' : 'none') +
            '"></video>' +
            '<img id="cc-vm-av-thumb" class="cc-vm-av-thumb" src="' +
            thumbSrc +
            '" alt="Vista previa del avatar" style="display:' +
            (hasVid ? 'block' : 'none') +
            '">' +
            '<img id="cc-vm-av-portrait" class="cc-vm-av-portrait" src="" alt="" style="display:none" aria-hidden="true">' +
            '<div class="cc-vm-preview-unavailable" id="cc-vm-preview-unavailable" role="status" style="display:' +
            (hasVid ? 'none' : 'flex') +
            '">' +
            '<span class="ubits-body-md-regular cc-vm-preview-unavailable__text">Vista previa de video no disponible aún</span>' +
            '</div>' +
            '<div class="cc-vm-logo-overlay" id="cc-vm-logo-overlay" style="display:none;">' +
            '<img id="cc-vm-logo-preview-img" src="" alt="Logo">' +
            '</div>' +
            '</div>'
        );
    }

    /** Selector modo guión (Figma AI-Capabilities 644:1611 — icono arriba, título abajo). */
    function buildGuionModeSelectHtml() {
        return (
            '<div class="cc-vm-guion-mode-select" role="radiogroup" aria-label="Cómo quieres definir el guión">' +
            '<label class="cc-vm-guion-mode-option ubits-radio cc-vm-guion-mode-option--ia">' +
            '<input type="radio" name="cc-vm-guion-mode" class="ubits-radio__input" value="ia" checked>' +
            '<span class="cc-vm-guion-mode-option__box" aria-hidden="true"><img class="cc-vm-guion-mode-option__icon" src="../../images/lms-creator/guion-mode/icon-generar-ia.svg" alt="" width="32" height="32"></span>' +
            '<span class="cc-vm-guion-mode-option__label ubits-body-sm-semibold">Generar con IA</span>' +
            '</label>' +
            '<label class="cc-vm-guion-mode-option ubits-radio cc-vm-guion-mode-option--manual">' +
            '<input type="radio" name="cc-vm-guion-mode" class="ubits-radio__input" value="manual">' +
            '<span class="cc-vm-guion-mode-option__box" aria-hidden="true"><img class="cc-vm-guion-mode-option__icon" src="../../images/lms-creator/guion-mode/icon-escribir-manual.svg" alt="" width="32" height="32"></span>' +
            '<span class="cc-vm-guion-mode-option__label ubits-body-sm-regular">Escribir manualmente</span>' +
            '</label></div>'
        );
    }

    function buildLogoSectionHtml() {
        return (
            '<div class="cc-vm-section cc-vm-logo-section">' +
            '<p class="ubits-body-md-bold cc-vm-logo-section__label">Logo de la empresa <span class="cc-vm-optional">(opcional)</span></p>' +
            '<div class="cc-vm-logo-upload" id="cc-vm-logo-upload">' +
            '<div class="cc-vm-logo-tile cc-vm-logo-tile--empty" data-cc-vm-logo-empty>' +
            '<span class="cc-vm-logo-tile__icon" aria-hidden="true"><i class="far fa-image"></i></span>' +
            '<span class="cc-vm-logo-tile__copy">' +
            '<span class="ubits-body-xs-regular">PNG · hasta 2 MB</span></span>' +
            '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm cc-vm-logo-tile__upload-btn" data-cc-vm-logo-trigger><span>Subir</span></button></div>' +
            '<div class="cc-vm-logo-tile cc-vm-logo-tile--filled" data-cc-vm-logo-filled hidden>' +
            '<div class="cc-vm-logo-tile__thumb"><img data-cc-vm-logo-img src="" alt="Vista previa del logo"></div>' +
            '<div class="cc-vm-logo-tile__copy">' +
            '<span class="ubits-body-sm-semibold cc-vm-logo-tile__filename" data-cc-vm-logo-name></span>' +
            '<span class="ubits-body-xs-regular cc-vm-logo-tile__filesize" data-cc-vm-logo-size></span></div>' +
            '<div class="cc-vm-logo-tile__actions">' +
            '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm cc-vm-logo-tile__upload-btn" data-cc-vm-logo-change><span>Cambiar</span></button>' +
            '<button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only" data-cc-vm-logo-remove aria-label="Quitar logo">' +
            '<i class="far fa-times"></i></button></div></div>' +
            '<input type="file" data-cc-vm-logo-input accept="image/png,.png" hidden>' +
            '<p class="ubits-body-xs-regular cc-vm-logo-upload__error" data-cc-vm-logo-error hidden role="alert"></p>' +
            '</div></div>'
        );
    }

    function buildGuionSectionHtml() {
        return (
            '<div class="cc-vm-section cc-vm-wizard-guion">' +
            buildGuionModeSelectHtml() +
            '<div id="cc-vm-guion-panel-ia" class="cc-vm-guion-panel">' +
            '<div class="cc-vm-guion-ia-context">' +
            '<div class="ubits-ia-chat-thread__input-area">' +
            '<div class="ai-panel__input-box" id="cc-vm-ia-input-box">' +
            '<input type="file" id="cc-vm-files" accept=".txt,.pdf,.doc,.docx,text/plain,application/pdf" multiple hidden>' +
            '<div class="ai-panel__pending-files-strip" id="cc-vm-pending-files" style="display:none;"></div>' +
            '<textarea id="cc-vm-context-input" class="ai-panel__input ubits-body-md-regular" rows="2" placeholder="Adjunta un archivo o describe el tema del guión"></textarea>' +
            '<div class="ai-panel__input-actions">' +
            '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm ubits-button--icon-only ai-panel__attach-btn" id="cc-vm-attach" aria-label="Adjuntar">' +
            '<i class="far fa-plus"></i></button>' +
            '<div class="ai-panel__input-spacer" aria-hidden="true"></div>' +
            '<button type="button" class="ubits-ia-button ubits-ia-button--primary ubits-ia-button--sm ubits-ia-button--with-token-cost" id="cc-vm-btn-gen-guion">' +
            '<span id="cc-vm-gen-guion-label">Generar guión</span>' +
            '<span class="ubits-ia-button__token-divider" aria-hidden="true"></span>' +
            '<span class="ubits-ia-button__token-cost" aria-hidden="true">' +
            '<i class="far fa-coin-vertical"></i>' +
            '<span class="ubits-ia-button__token-number">' +
            VIDEO_GUION_IA_TOKEN_COST +
            '</span></span></button></div></div></div></div>' +
            '<div id="cc-vm-guion-ia-editor-block" class="cc-vm-guion-ia-editor-block" style="display:none">' +
            '<p class="ubits-body-sm-semibold cc-vm-guion-ia-editor-heading">Guión generado</p>' +
            '<div id="cc-vm-guion-ia-editor-wrap" class="cc-vm-guion-input-mount"></div></div></div>' +
            '<div id="cc-vm-guion-panel-manual" class="cc-vm-guion-panel" style="display:none">' +
            '<div id="cc-vm-guion-manual-wrap" class="cc-vm-guion-input-mount"></div></div></div>'
        );
    }

    function buildIaWizardStepperHtml() {
        var steps = IA_WIZARD_STEP_LABELS;
        var parts = [];
        steps.forEach(function (label, i) {
            if (i > 0) parts.push('<li class="ubits-stepper__rail" aria-hidden="true"></li>');
            parts.push(
                '<li class="ubits-stepper__step' +
                (i === 0 ? ' ubits-stepper__step--active' : ' ubits-stepper__step--pending') +
                '" data-step-label="' +
                esc(label) +
                '"' +
                (i === 0 ? ' aria-current="step"' : '') +
                '>' +
                '<span class="ubits-stepper__mark" aria-hidden="true">' +
                '<span class="ubits-stepper__mark-num">' +
                (i + 1) +
                '</span><i class="far fa-check" aria-hidden="true"></i></span>' +
                '<span class="ubits-stepper__label">' +
                esc(label) +
                '</span></li>'
            );
        });
        return (
            '<nav class="cc-vm-wizard-stepper" aria-label="Pasos para crear video con IA">' +
            '<ol class="ubits-stepper ubits-stepper--horizontal ubits-stepper--horizontal-stacked" id="cc-vm-ia-stepper">' +
            parts.join('') +
            '</ol></nav>'
        );
    }

    function buildIaPanelV2() {
        var av = _selectedAvatar || AVATARS[0];
        return (
            '<div class="cc-vmodal-panel" id="cc-vtab-ia">' +
            '<div class="cc-vm-wizard">' +
            buildIaWizardStepperHtml() +
            '<div class="cc-vm-wizard-body">' +
            '<div class="cc-vm-wizard-step" id="cc-vm-wizard-step-0" data-cc-vm-wizard-step="0">' +
            '<div class="cc-vm-wizard-preview-wrap">' +
            buildPreviewStageHtml(av) +
            '</div>' +
            '<div class="cc-vm-wizard-meta-row">' +
            '<p class="ubits-body-xs-regular cc-vm-wizard-duration-copy">Videos de hasta 2 min.</p>' +
            '<div id="cc-vm-cat-select-wrap" class="cc-vm-wizard-cat-select"></div>' +
            '</div>' +
            '<div class="cc-vm-avatar-pick' +
            (_currentCat === 'staff' ? ' cc-vm-avatar-pick--staff-5x2' : '') +
            '" id="cc-vm-avatar-pick" role="listbox" aria-label="Seleccionar avatar">' +
            buildAvatarPickItemsHtml(_currentCat) +
            '</div></div>' +
            '<div class="cc-vm-wizard-step cc-vm-wizard-step--hidden" id="cc-vm-wizard-step-1" data-cc-vm-wizard-step="1">' +
            buildGuionSectionHtml() +
            '</div>' +
            '<div class="cc-vm-wizard-step cc-vm-wizard-step--hidden" id="cc-vm-wizard-step-2" data-cc-vm-wizard-step="2">' +
            buildLogoSectionHtml() +
            '</div></div></div></div>'
        );
    }

    function buildIaPanelLegacy() {
        var av = _selectedAvatar || AVATARS[0];
        var thumbSrc = avatarTempThumbSrc(av);
        var mp4 = avatarPreviewMp4Src(av);
        var hasVid = !!mp4;
        var stageClass =
            'cc-vm-preview-stage' +
            (hasVid ? ' cc-vm-preview-stage--has-thumb' : ' cc-vm-preview-stage--placeholder');

        return '<div class="cc-vmodal-panel" id="cc-vtab-ia">' +
            '<div class="cc-vm-ia-layout">' +

                // ── Left column ──
                '<div class="cc-vm-left-col">' +
                    '<div class="cc-vm-ia-duration-alert ubits-alert ubits-alert--info">' +
                        '<div class="ubits-alert__icon">' +
                            '<i class="far fa-info-circle"></i>' +
                        '</div>' +
                        '<div class="ubits-alert__content">' +
                            '<div class="ubits-alert__text">Los videos generados tienen máximo 2 minutos de duración.</div>' +
                        '</div>' +
                        '<button type="button" class="ubits-alert__close" aria-label="Cerrar alerta">' +
                            '<i class="far fa-times"></i>' +
                        '</button>' +
                    '</div>' +

                    // Section 1: Avatar
                    '<div class="cc-vm-section">' +
                        '<div class="cc-vm-avatar-header">' +
                            '<span class="cc-vm-avatar-header-label ubits-body-md-bold">Avatar</span>' +
                            '<div id="cc-vm-cat-select-wrap" style="width:200px;"></div>' +
                        '</div>' +
                        '<div class="cc-vm-avatar-grid" id="cc-vm-grid">' +
                            buildAvatarGridItemsHtml(_currentCat) +
                        '</div>' +
                    '</div>' +

                    '<div class="cc-vm-section-divider"></div>' +

                    // Section 2: Guión (selector + panel IA o manual)
                    '<div class="cc-vm-section">' +
                        '<p class="cc-vm-section-label ubits-body-md-bold">Guión</p>' +
                        buildGuionModeSelectHtml() +

                        '<div id="cc-vm-guion-panel-ia" class="cc-vm-guion-panel">' +
                            '<div class="cc-vm-guion-ia-context">' +
                                '<div class="ubits-ia-chat-thread__input-area">' +
                                    '<div class="ai-panel__input-box" id="cc-vm-ia-input-box">' +
                                        '<input type="file" id="cc-vm-files" accept=".txt,.pdf,.doc,.docx,text/plain,application/pdf" multiple hidden>' +
                                        '<div class="ai-panel__pending-files-strip" id="cc-vm-pending-files" style="display:none;"></div>' +
                                        '<textarea id="cc-vm-context-input" class="ai-panel__input ubits-body-md-regular" rows="2" placeholder="Adjunta un archivo o describe el tema del guión"></textarea>' +
                                        '<div class="ai-panel__input-actions">' +
                                            '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm ubits-button--icon-only ai-panel__attach-btn" id="cc-vm-attach" aria-label="Adjuntar">' +
                                                '<i class="far fa-plus"></i>' +
                                            '</button>' +
                                            '<div class="ai-panel__input-spacer" aria-hidden="true"></div>' +
                                            '<button type="button" class="ubits-ia-button ubits-ia-button--primary ubits-ia-button--sm ubits-ia-button--with-token-cost" id="cc-vm-btn-gen-guion">' +
                                                '<span id="cc-vm-gen-guion-label">Generar guión</span>' +
                                                '<span class="ubits-ia-button__token-divider" aria-hidden="true"></span>' +
                                                '<span class="ubits-ia-button__token-cost" aria-hidden="true">' +
                                                    '<i class="far fa-coin-vertical"></i>' +
                                                    '<span class="ubits-ia-button__token-number">' + VIDEO_GUION_IA_TOKEN_COST + '</span>' +
                                                '</span>' +
                                            '</button>' +
                                        '</div>' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                            '<div id="cc-vm-guion-ia-editor-block" class="cc-vm-guion-ia-editor-block" style="display:none">' +
                                '<p class="ubits-body-sm-semibold cc-vm-guion-ia-editor-heading">Guión generado</p>' +
                                '<div id="cc-vm-guion-ia-editor-wrap" class="cc-vm-guion-input-mount"></div>' +
                            '</div>' +
                        '</div>' +

                        '<div id="cc-vm-guion-panel-manual" class="cc-vm-guion-panel" style="display:none">' +
                            '<div id="cc-vm-guion-manual-wrap" class="cc-vm-guion-input-mount"></div>' +
                        '</div>' +
                    '</div>' +

                    '<div class="cc-vm-section-divider"></div>' +

                    // Section 3: Logo
                    buildLogoSectionHtml() +

                '</div>' +

                // ── Right column: avatar preview stage ──
                '<div class="cc-vm-right-col">' +
                    '<p class="cc-via-preview-hint">Vista previa orientativa. El video final usará tu guión y avatar seleccionado.</p>' +
                    '<div class="' + stageClass + '" id="cc-vm-preview-stage">' +
                        '<img id="cc-vm-av-bg" class="cc-vm-av-bg" src="' + thumbSrc + '" alt="">' +
                        '<video id="cc-vm-av-preview-video" class="cc-vm-av-preview-video" playsinline controls preload="metadata" ' +
                            'poster="' + esc(thumbSrc) + '" ' +
                            (hasVid ? 'src="' + esc(mp4) + '" ' : '') +
                            'style="display:' + (hasVid ? 'block' : 'none') + '"></video>' +
                        '<img id="cc-vm-av-thumb" class="cc-vm-av-thumb" src="' + thumbSrc + '" alt="Vista previa del avatar" style="display:' + (hasVid ? 'block' : 'none') + '">' +
                        '<img id="cc-vm-av-portrait" class="cc-vm-av-portrait" src="" alt="" style="display:none" aria-hidden="true">' +
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
                    '<div class="cc-vmodal-enlace-centered">' +
                        '<p class="cc-vmodal-enlace-title">Pega el <span class="cc-vmodal-enlace-title-em">enlace del video</span> que quieres cargar</p>' +
                        '<div id="cc-venlace-input-wrap"></div>' +
                    '</div>' +
                '</div>' +
            '</div>'
        );
    }

    function buildSubirPanel() {
        return (
            '<div class="cc-vmodal-panel cc-vmodal-panel--hidden" id="cc-vtab-subir">' +
                '<div class="cc-vmodal-subir-layout">' +
                    '<div class="cc-vmodal-subir-centered">' +
                        '<div id="cc-vsubir-fu-wrap"></div>' +
                    '</div>' +
                '</div>' +
            '</div>'
        );
    }

    function buildTabBar() {
        return (
            '<div id="cc-vmodal-tabbar" class="cc-vmodal-tabbar" role="tablist">' +
                '<div class="ubits-tabs-on-bg">' +
                    '<button type="button" class="ubits-tab ubits-tab--sm ubits-tab--active" role="tab" aria-selected="true" data-cc-vtab="ia">' +
                        '<span>Video Avatar IA</span>' +
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

    function buildIaPanel() {
        return CC_VIDEO_MODAL_UI === 'legacy' ? buildIaPanelLegacy() : buildIaPanelV2();
    }

    function buildModalBody() {
        var rootCls = CC_VIDEO_MODAL_UI === 'legacy' ? 'cc-vmodal cc-vmodal--legacy' : 'cc-vmodal cc-vmodal-v2';
        return (
            '<div class="' +
            rootCls +
            '">' +
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

    function getVideoModalIaSizeForViewport() {
        return global.innerWidth <= CC_VIDEO_MODAL_IA_BREAKPOINT ? 'sm' : 'md';
    }

    /** v2 + pestaña IA: sm (≤1366) / md (>1366). Otras pestañas: md. Legacy IA: lg. */
    function applyVideoModalContentSize() {
        var overlay = document.getElementById(OVERLAY_ID);
        if (!overlay) return;
        var modalContent = overlay.querySelector('.ubits-modal-content');
        if (!modalContent) return;

        var size;
        if (_currentTab !== 'ia') {
            size = 'md';
        } else if (CC_VIDEO_MODAL_UI === 'v2') {
            size = getVideoModalIaSizeForViewport();
        } else {
            size = 'lg';
        }

        MODAL_SIZE_CLASSES.forEach(function (s) {
            modalContent.classList.remove('ubits-modal-content--' + s);
        });
        modalContent.classList.add('ubits-modal-content--' + size);
    }

    function wireVideoModalResponsiveSize(overlay) {
        if (!overlay || overlay._ccVmSizeResize) return;
        var onResize = function () {
            if (_currentTab !== 'ia') return;
            if (CC_VIDEO_MODAL_UI === 'v2') {
                applyVideoModalContentSize();
            } else if (CC_VIDEO_MODAL_UI === 'legacy') {
                applyLegacyModalBodyOverflow(overlay.querySelector('.ubits-modal-body'));
            }
        };
        overlay._ccVmSizeResize = onResize;
        global.addEventListener('resize', onResize, { passive: true });
    }

    function unwireVideoModalResponsiveSize(overlay) {
        if (!overlay || !overlay._ccVmSizeResize) return;
        global.removeEventListener('resize', overlay._ccVmSizeResize);
        overlay._ccVmSizeResize = null;
    }

    /* ── Tab switching ── */
    function switchToTab(tab) {
        _currentTab = tab;
        // Si sales de Video IA, detener el preview para que no siga sonando en background.
        if (tab !== 'ia') stopAvatarPreviewPlayback();
        var overlay = document.getElementById(OVERLAY_ID);
        if (overlay) overlay.classList.toggle('cc-vm--compact', tab !== 'ia');
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
        applyVideoModalContentSize();
        syncFooterCta();
        syncVideoModalTokensBadge();
    }

    function pauseAvatarPreviewVideo() {
        var v = document.getElementById('cc-vm-av-preview-video');
        if (!v) return;
        try {
            v.pause();
        } catch (e) { /* noop */ }
    }

    function stopAvatarPreviewPlayback() {
        pauseAvatarPreviewVideo();
        var v = document.getElementById('cc-vm-av-preview-video');
        if (!v) return;
        try {
            v.currentTime = 0;
        } catch (e) { /* noop */ }
    }

    function syncFooterCtaV2() {
        var gen = document.getElementById('cc-vm-btn-generar');
        var sig = document.getElementById('cc-vm-btn-siguiente');
        var ant = document.getElementById('cc-vm-btn-anterior');
        var link = document.getElementById('cc-venlace-btn-cargar');
        var up = document.getElementById('cc-vsubir-btn-confirmar');

        if (link) link.style.display = 'none';
        if (up) up.style.display = 'none';
        if (gen) gen.style.display = 'none';
        if (sig) sig.style.display = 'none';
        if (ant) ant.style.display = 'none';

        if (_currentTab !== 'ia') {
            if (link) link.style.display = _currentTab === 'enlace' ? '' : 'none';
            if (up) up.style.display = _currentTab === 'subir' ? '' : 'none';
            syncVideoModalTokensBadge();
            return;
        }

        if (_iaWizardStep === 0) {
            if (sig) {
                sig.style.display = '';
                sig.disabled = false;
            }
        } else if (_iaWizardStep === 1) {
            if (ant) ant.style.display = '';
            if (sig) {
                sig.style.display = '';
                sig.disabled = !hasValidGuionForWizardNext();
            }
        } else if (_iaWizardStep === 2) {
            if (ant) ant.style.display = '';
            if (gen) gen.style.display = '';
        }
        syncVideoModalTokensBadge();
    }

    function setIaWizardStep(step) {
        var max = IA_WIZARD_STEP_LABELS.length - 1;
        _iaWizardStep = Math.max(0, Math.min(max, step));

        /* El preview MP4 vive en el paso 0; al avanzar sigue en el DOM y puede seguir sonando. */
        if (_iaWizardStep !== 0) {
            pauseAvatarPreviewVideo();
        }

        for (var i = 0; i <= max; i++) {
            var panel = document.getElementById('cc-vm-wizard-step-' + i);
            if (panel) panel.classList.toggle('cc-vm-wizard-step--hidden', i !== _iaWizardStep);
        }

        var stepper = document.getElementById('cc-vm-ia-stepper');
        if (stepper && typeof global.setStepperStepStates === 'function') {
            global.setStepperStepStates(stepper, _iaWizardStep);
        }

        if (_iaWizardStep === 1) {
            applyGuionModeUi();
            initContextTemaField();
            initInsumoAttach();
            wireGuionModeRadios();
            initGenGuionButton();
        }
        if (_iaWizardStep === 2) {
            initLogoUpload();
        }

        var overlay = document.getElementById(OVERLAY_ID);
        var modalBody = overlay && overlay.querySelector('.ubits-modal-body');
        if (modalBody) modalBody.scrollTop = 0;

        updateIaWizardStepperNav();
        syncFooterCta();
    }

    function canAdvanceOneWizardStepFrom(stepIndex) {
        if (stepIndex === 0) return true;
        if (stepIndex === 1) return hasValidGuionForWizardNext();
        return false;
    }

    function canNavigateToWizardStep(targetIndex) {
        if (targetIndex === _iaWizardStep) return false;
        if (targetIndex < _iaWizardStep) return true;
        if (targetIndex === _iaWizardStep + 1) return canAdvanceOneWizardStepFrom(_iaWizardStep);
        return false;
    }

    function updateIaWizardStepperNav() {
        var stepper = document.getElementById('cc-vm-ia-stepper');
        if (!stepper) return;
        var steps = stepper.querySelectorAll(':scope > .ubits-stepper__step');
        steps.forEach(function (stepEl, i) {
            var canNavigate = canNavigateToWizardStep(i);
            stepEl.style.cursor = canNavigate ? 'pointer' : '';
            stepEl.setAttribute('tabindex', canNavigate ? '0' : '-1');
            if (canNavigate) {
                stepEl.setAttribute('role', 'button');
                stepEl.removeAttribute('aria-disabled');
            } else {
                stepEl.removeAttribute('role');
                if (i > _iaWizardStep) {
                    stepEl.setAttribute('aria-disabled', 'true');
                } else {
                    stepEl.removeAttribute('aria-disabled');
                }
            }
        });
    }

    function wireIaWizardStepper() {
        var stepper = document.getElementById('cc-vm-ia-stepper');
        if (!stepper || stepper._ccVmWizardStepperWired) return;
        stepper._ccVmWizardStepperWired = true;

        var steps = stepper.querySelectorAll(':scope > .ubits-stepper__step');
        steps.forEach(function (stepEl, i) {
            function goToStep() {
                if (!canNavigateToWizardStep(i)) return;
                if (i < _iaWizardStep && _iaWizardStep === 1) persistGuionFromMountedInput();
                if (i > _iaWizardStep && _iaWizardStep === 1) persistGuionFromMountedInput();
                setIaWizardStep(i);
            }
            stepEl.addEventListener('click', goToStep);
            stepEl.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    goToStep();
                }
            });
        });
        updateIaWizardStepperNav();
    }

    function wireIaWizardFooter() {
        var sig = document.getElementById('cc-vm-btn-siguiente');
        var ant = document.getElementById('cc-vm-btn-anterior');
        if (sig && !sig._ccVmWizardWired) {
            sig._ccVmWizardWired = true;
            sig.addEventListener('click', function () {
                if (_iaWizardStep === 0) {
                    setIaWizardStep(1);
                    return;
                }
                if (_iaWizardStep === 1) {
                    if (!hasValidGuionForWizardNext()) return;
                    persistGuionFromMountedInput();
                    setIaWizardStep(2);
                }
            });
        }
        if (ant && !ant._ccVmWizardWired) {
            ant._ccVmWizardWired = true;
            ant.addEventListener('click', function () {
                if (_iaWizardStep === 1) {
                    persistGuionFromMountedInput();
                    setIaWizardStep(0);
                    return;
                }
                if (_iaWizardStep === 2) {
                    setIaWizardStep(1);
                }
            });
        }
    }

    function syncAvatarPickLayout(cat) {
        var pick = document.getElementById('cc-vm-avatar-pick');
        if (!pick) return;
        pick.classList.toggle('cc-vm-avatar-pick--staff-5x2', cat === 'staff');
    }

    function wireAvatarPick() {
        var root = document.getElementById('cc-vm-avatar-pick');
        if (!root || root._ccWired) return;
        root._ccWired = true;

        root.addEventListener('click', function (e) {
            var item = e.target.closest('.cc-vm-avatar-pick__item');
            if (!item || !root.contains(item)) return;
            selectAvatar(parseInt(item.getAttribute('data-avatar-id'), 10));
        });
    }

    function syncFooterCta() {
        if (CC_VIDEO_MODAL_UI === 'v2') {
            syncFooterCtaV2();
            return;
        }
        var gen  = document.getElementById('cc-vm-btn-generar');
        var link = document.getElementById('cc-venlace-btn-cargar');
        var up   = document.getElementById('cc-vsubir-btn-confirmar');

        if (gen)  gen.style.display  = _currentTab === 'ia' ? '' : 'none';
        if (link) link.style.display = _currentTab === 'enlace' ? '' : 'none';
        if (up)   up.style.display   = _currentTab === 'subir' ? '' : 'none';
    }

    /** Paso guión (wizard índice 1): permite «Siguiente» solo con guión IA generado o texto manual. */
    function hasValidGuionForWizardNext() {
        persistGuionFromMountedInput();
        if (_guionMode === 'manual') {
            return _guionTextManual.trim().length > 0;
        }
        return _guionIaEditorVisible && _guionTextIa.trim().length > 0;
    }

    /* ── Botones IA ── */
    function refreshIaButtons() {
        /* No deshabilitar por tokens insuficientes: al clic, trySpendVideoAiTokens muestra toast (mismo patrón que SCORM). */
        syncVideoModalTokensBadge();
        if (CC_VIDEO_MODAL_UI === 'v2' && _currentTab === 'ia') {
            if (_iaWizardStep === 1) {
                var sig = document.getElementById('cc-vm-btn-siguiente');
                if (sig) sig.disabled = !hasValidGuionForWizardNext();
            }
            updateIaWizardStepperNav();
        }
    }

    /* ── Avatar ── */
    function updatePreviewStage(av) {
        if (!av) return;
        var thumbSrc = avatarTempThumbSrc(av);
        var mp4 = avatarPreviewMp4Src(av);
        var stage = document.getElementById('cc-vm-preview-stage');
        var bg = document.getElementById('cc-vm-av-bg');
        var thumb = document.getElementById('cc-vm-av-thumb');
        var portrait = document.getElementById('cc-vm-av-portrait');
        var videoEl = document.getElementById('cc-vm-av-preview-video');
        var unavail = document.getElementById('cc-vm-preview-unavailable');

        /* Preview 16:9: solo avatar-temp-thumbs; las fotos cuadradas van en el grid. */
        if (bg) bg.src = thumbSrc;
        if (portrait) {
            portrait.style.display = 'none';
            portrait.removeAttribute('src');
        }
        if (thumb) {
            thumb.alt = av.label ? 'Vista previa de ' + av.label : 'Vista previa del avatar';
        }

        function showThumbLayer() {
            if (!thumb || !stage) return;
            if (thumb.getAttribute('src') !== thumbSrc) thumb.setAttribute('src', thumbSrc);
            thumb.style.display = 'block';
            stage.classList.add('cc-vm-preview-stage--has-thumb');
        }

        function hideThumbLayer() {
            if (!thumb || !stage) return;
            thumb.style.display = 'none';
            stage.classList.remove('cc-vm-preview-stage--has-thumb');
        }

        if (mp4 && videoEl && stage) {
            stage.classList.remove('cc-vm-preview-stage--placeholder');
            if (unavail) unavail.style.display = 'none';
            videoEl.setAttribute('poster', thumbSrc);
            showThumbLayer();
            videoEl.style.display = 'block';

            videoEl.onloadeddata = function () {
                hideThumbLayer();
            };
            videoEl.onerror = function () {
                hideThumbLayer();
                stage.classList.add('cc-vm-preview-stage--placeholder');
                if (unavail) unavail.style.display = '';
            };

            var sameMp4 = videoEl.getAttribute('src') === mp4;
            videoEl.setAttribute('src', mp4);
            videoEl.muted = false;
            videoEl.loop = false;
            if (!sameMp4) {
                videoEl.load();
            }
            var p = videoEl.play();
            if (p && typeof p.catch === 'function') {
                p.catch(function () { /* autoplay puede bloquearse; el usuario usa controls */ });
            }
            if (videoEl.readyState >= 2) {
                hideThumbLayer();
            }
        } else {
            if (stage) stage.classList.add('cc-vm-preview-stage--placeholder');
            if (videoEl) {
                videoEl.onloadeddata = null;
                videoEl.onerror = null;
                videoEl.pause();
                videoEl.removeAttribute('src');
                videoEl.load();
                videoEl.style.display = 'none';
            }
            if (thumb && stage) {
                thumb.onload = function () {
                    showThumbLayer();
                    if (unavail) unavail.style.display = '';
                };
                thumb.onerror = function () {
                    hideThumbLayer();
                    if (unavail) unavail.style.display = '';
                };
                if (thumb.getAttribute('src') !== thumbSrc) thumb.setAttribute('src', thumbSrc);
                else if (thumb.complete && thumb.naturalWidth > 0) showThumbLayer();
            } else if (unavail) {
                unavail.style.display = '';
            }
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
        var pick = document.getElementById('cc-vm-avatar-pick');
        if (pick) {
            pick.querySelectorAll('.cc-vm-avatar-pick__item').forEach(function (item) {
                var sel = parseInt(item.getAttribute('data-avatar-id'), 10) === id;
                item.classList.toggle('cc-vm-avatar-pick__item--selected', sel);
                item.setAttribute('aria-pressed', sel ? 'true' : 'false');
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
            wireAvatarGrid();
        }
        var pick = document.getElementById('cc-vm-avatar-pick');
        if (pick) {
            pick.innerHTML = buildAvatarPickItemsHtml(_currentCat);
            syncAvatarPickLayout(_currentCat);
            pick._ccWired = false;
            wireAvatarPick();
        }
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
                '<i class="far fa-file-lines" aria-hidden="true"></i>' +
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

    /** Alto según contenido (tope para no desbordar el modal). */
    var VM_CONTEXT_TEXTAREA_AUTOSIZE_MAX_PX = 360;

    function autosizeContextTemaTextarea() {
        var ta = getContextTemaTextarea();
        if (!ta) return;
        ta.style.height = 'auto';
        var sh = ta.scrollHeight;
        var cap = VM_CONTEXT_TEXTAREA_AUTOSIZE_MAX_PX;
        var next = Math.min(sh, cap);
        ta.style.height = Math.max(40, next) + 'px';
        ta.style.overflowY = sh > cap ? 'auto' : 'hidden';
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
            autosizeContextTemaTextarea();
        });
        setTimeout(autosizeContextTemaTextarea, 0);
    }

    function getActiveGuionContainerId() {
        if (_guionMode === 'manual') return 'cc-vm-guion-manual-wrap';
        if (_guionMode === 'ia' && _guionIaEditorVisible) return 'cc-vm-guion-ia-editor-wrap';
        return null;
    }

    function getGuionWrapEl() {
        var id = getActiveGuionContainerId();
        return id ? document.getElementById(id) : null;
    }

    function persistGuionFromMountedInput() {
        if (!_guionInputApi || typeof _guionInputApi.getValue !== 'function') return;
        var v = String(_guionInputApi.getValue() || '');
        var mw = document.getElementById('cc-vm-guion-manual-wrap');
        var iw = document.getElementById('cc-vm-guion-ia-editor-wrap');
        if (mw && mw._ccVmGuionWired) _guionTextManual = v;
        else if (iw && iw._ccVmGuionWired) _guionTextIa = v;
    }

    function destroyGuionInput() {
        persistGuionFromMountedInput();
        ['cc-vm-guion-ia-editor-wrap', 'cc-vm-guion-manual-wrap'].forEach(function (id) {
            var w = document.getElementById(id);
            if (w) {
                w.innerHTML = '';
                delete w._ccVmGuionWired;
            }
        });
        var host = document.getElementById('cc-vm-guion-loader-host');
        if (host && host.parentNode) {
            host.parentNode.removeChild(host);
        }
        _guionInputApi = null;
    }

    function applyGuionModeUi() {
        var panelIa = document.getElementById('cc-vm-guion-panel-ia');
        var panelMan = document.getElementById('cc-vm-guion-panel-manual');
        var iaEditorBlock = document.getElementById('cc-vm-guion-ia-editor-block');
        document.querySelectorAll('#cc-vtab-ia input[name="cc-vm-guion-mode"]').forEach(function (r) {
            var v = r.getAttribute('value');
            r.checked = (v === 'ia' && _guionMode === 'ia') || (v === 'manual' && _guionMode === 'manual');
        });
        if (panelIa) panelIa.style.display = _guionMode === 'ia' ? '' : 'none';
        if (panelMan) panelMan.style.display = _guionMode === 'manual' ? '' : 'none';
        destroyGuionInput();
        if (_guionMode === 'manual') {
            if (iaEditorBlock) iaEditorBlock.style.display = 'none';
            initGuionCreateInput('cc-vm-guion-manual-wrap');
        } else {
            if (iaEditorBlock) iaEditorBlock.style.display = _guionIaEditorVisible ? '' : 'none';
            if (_guionIaEditorVisible) {
                initGuionCreateInput('cc-vm-guion-ia-editor-wrap');
            }
        }
        refreshIaButtons();
    }

    function wireGuionModeRadios() {
        var panel = document.getElementById('cc-vtab-ia');
        if (!panel || panel._ccGuionModeWired) return;
        panel._ccGuionModeWired = true;
        panel.addEventListener('change', function (e) {
            var t = e.target;
            if (!t || t.name !== 'cc-vm-guion-mode') return;
            var next = String(t.value || 'ia') === 'manual' ? 'manual' : 'ia';
            if (next === _guionMode) return;
            persistGuionFromMountedInput();
            _guionMode = next;
            applyGuionModeUi();
            refreshIaButtons();
        });
    }

    function applyGuionIaEditorInputChrome() {
        var mount = document.getElementById('cc-vm-guion-ia-editor-wrap');
        if (!mount) return;
        var shell = mount.querySelector('.ubits-input-wrapper');
        var ta = mount.querySelector('textarea.ubits-input');
        if (shell) shell.classList.add('cc-vm-guion-ia-input-shell');
        if (ta) {
            ta.style.resize = 'none';
            ta.style.border = 'none';
        }
    }

    function initGuionCreateInput(containerId) {
        var wrap = document.getElementById(containerId);
        if (!wrap || wrap._ccVmGuionWired || typeof global.createInput !== 'function') return;
        wrap._ccVmGuionWired = true;
        var placeholder =
            containerId === 'cc-vm-guion-manual-wrap'
                ? 'Escribe el guión completo del video'
                : 'Revisa y edita el guión antes de generar el video';
        _guionInputApi = global.createInput({
            containerId: containerId,
            type: 'textarea',
            showLabel: false,
            label: '',
            placeholder: placeholder,
            size: 'md',
            maxLength: VIDEO_GUION_MAX_CHARS,
            showCounter: true,
            value: (containerId === 'cc-vm-guion-manual-wrap' ? _guionTextManual : _guionTextIa) || '',
            onChange: function (val) {
                var s = String(val != null ? val : '');
                if (containerId === 'cc-vm-guion-manual-wrap') _guionTextManual = s;
                else _guionTextIa = s;
                if (_guionInputApi && typeof _guionInputApi.setState === 'function') {
                    _guionInputApi.setState('default');
                }
                var w = document.getElementById(containerId);
                var ht = w && w.querySelector('.ubits-input-helper-text');
                if (ht) {
                    ht.textContent = 'Máximo ' + VIDEO_GUION_MAX_CHARS + ' caracteres';
                    ht.style.display = '';
                }
                var counter = w && w.querySelector('.ubits-input-counter');
                if (counter) counter.style.display = '';
                autosizeGuionTextarea();
                refreshIaButtons();
            }
        });
        if (containerId === 'cc-vm-guion-ia-editor-wrap') {
            applyGuionIaEditorInputChrome();
        }
        setTimeout(function () {
            if (containerId === 'cc-vm-guion-ia-editor-wrap') {
                applyGuionIaEditorInputChrome();
            }
            autosizeGuionTextarea();
            syncGuionTextareaAfterProgrammaticValue();
        }, 0);
    }

    function getGuionTextareaEl() {
        var w = getGuionWrapEl();
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
        _guionTextIa = v;
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
        autosizeContextTemaTextarea();
    }

    /** Tras generar el guión IA, desplaza el scroll del modal hasta el bloque editable. */
    function scrollGuionIaEditorIntoView() {
        var block = document.getElementById('cc-vm-guion-ia-editor-block');
        if (!block || block.style.display === 'none') return;
        var overlay = document.getElementById(OVERLAY_ID);
        var scroller =
            (overlay && overlay.querySelector('.ubits-modal-body')) ||
            block.closest('.ubits-modal-body');
        if (scroller && scroller.scrollHeight > scroller.clientHeight + 1) {
            var blockRect = block.getBoundingClientRect();
            var scrollRect = scroller.getBoundingClientRect();
            var top = blockRect.top - scrollRect.top + scroller.scrollTop - 16;
            scroller.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
            return;
        }
        block.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    /** Mensaje de error bajo el textarea del guión (createInput invalid + helper oficial). */
    function setGuionValidationInvalid(message) {
        if (!_guionInputApi || typeof _guionInputApi.setState !== 'function') return;
        _guionInputApi.setState('invalid');
        var wrap = getGuionWrapEl();
        var ht = wrap && wrap.querySelector('.ubits-input-helper-text');
        if (ht) {
            ht.style.display = '';
            ht.textContent = message || 'Campo requerido';
        }
        var counter = wrap && wrap.querySelector('.ubits-input-counter');
        if (counter) counter.style.display = 'none';
    }

    function focusGuionFieldAfterError() {
        var mount = getGuionWrapEl();
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
            if (typeof global.setIaButtonGenerating === 'function') {
                global.setIaButtonGenerating(btn, true, { label: 'Generando' });
            }
            setTimeout(function () {
                var guion = generateGuion();
                _guionIaEditorVisible = true;
                var edBlock = document.getElementById('cc-vm-guion-ia-editor-block');
                if (edBlock) edBlock.style.display = '';
                destroyGuionInput();
                initGuionCreateInput('cc-vm-guion-ia-editor-wrap');
                setGuionValueProgrammatically(guion);
                resetContextTemaAfterGuionGeneration();
                if (typeof global.setIaButtonGenerating === 'function') {
                    global.setIaButtonGenerating(btn, false);
                }
                refreshIaButtons();
                setTimeout(scrollGuionIaEditorIntoView, 120);
            }, 3000);
        });
    }

    function formatLogoFileSize(bytes) {
        if (!bytes && bytes !== 0) return '';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1).replace(/\.0$/, '') + ' MB';
    }

    function validateLogoPngFile(file) {
        if (!file) return null;
        var isPng = file.type === 'image/png' || /\.png$/i.test(file.name || '');
        if (!isPng) return 'Solo se permite PNG.';
        if (file.size > 2 * 1024 * 1024) return 'El archivo supera 2 MB.';
        return null;
    }

    function setLogoUploadError(errorEl, msg) {
        if (!errorEl) return;
        if (msg) {
            errorEl.textContent = msg;
            errorEl.hidden = false;
        } else {
            errorEl.textContent = '';
            errorEl.hidden = true;
        }
    }

    function syncLogoPreviewOverlay(dataUrl) {
        var previewImg = document.getElementById('cc-vm-logo-preview-img');
        var overlay = document.getElementById('cc-vm-logo-overlay');
        if (dataUrl) {
            if (previewImg) previewImg.src = dataUrl;
            if (overlay) overlay.style.display = '';
        } else {
            if (previewImg) previewImg.removeAttribute('src');
            if (overlay) overlay.style.display = 'none';
        }
    }

    function wireLogoCompactUpload(root, cfg) {
        if (!root || root._ccLogoUploadWired) return;
        root._ccLogoUploadWired = true;

        var input = root.querySelector(cfg.inputSel);
        var emptyEl = root.querySelector(cfg.emptySel);
        var filledEl = root.querySelector(cfg.filledSel);
        var errorEl = root.querySelector(cfg.errorSel);
        if (!input || !emptyEl || !filledEl) return;

        function showEmpty() {
            emptyEl.hidden = false;
            filledEl.hidden = true;
            setLogoUploadError(errorEl, null);
            input.value = '';
            if (typeof cfg.onClear === 'function') cfg.onClear();
        }

        function showFilled(file, dataUrl) {
            if (typeof cfg.onFilled === 'function') {
                cfg.onFilled(file, dataUrl);
            }
            emptyEl.hidden = true;
            filledEl.hidden = false;
            setLogoUploadError(errorEl, null);
        }

        function openPicker() {
            input.click();
        }

        root.querySelectorAll(cfg.triggerSel).forEach(function (btn) {
            btn.addEventListener('click', openPicker);
        });

        var changeBtn = root.querySelector(cfg.changeSel);
        if (changeBtn) changeBtn.addEventListener('click', openPicker);

        var removeBtn = root.querySelector(cfg.removeSel);
        if (removeBtn) removeBtn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            showEmpty();
        });

        input.addEventListener('change', function () {
            var file = input.files && input.files[0];
            if (!file) return;
            var err = validateLogoPngFile(file);
            if (err) {
                setLogoUploadError(errorEl, err);
                input.value = '';
                if (typeof global.showToast === 'function') {
                    global.showToast('warning', err, { containerId: 'ubits-toast-container' });
                }
                return;
            }
            var reader = new FileReader();
            reader.onload = function (e) {
                showFilled(file, e && e.target ? e.target.result : null);
            };
            reader.readAsDataURL(file);
        });
    }

    /* ── Logo upload (tile compacto) ── */
    function initLogoUpload() {
        var root = document.getElementById('cc-vm-logo-upload');
        if (!root) return;

        wireLogoCompactUpload(root, {
            inputSel: '[data-cc-vm-logo-input]',
            emptySel: '[data-cc-vm-logo-empty]',
            filledSel: '[data-cc-vm-logo-filled]',
            errorSel: '[data-cc-vm-logo-error]',
            triggerSel: '[data-cc-vm-logo-trigger]',
            changeSel: '[data-cc-vm-logo-change]',
            removeSel: '[data-cc-vm-logo-remove]',
            onFilled: function (file, dataUrl) {
                _logoDataUrl = dataUrl || null;
                syncLogoPreviewOverlay(_logoDataUrl);
                var img = root.querySelector('[data-cc-vm-logo-img]');
                var name = root.querySelector('[data-cc-vm-logo-name]');
                var size = root.querySelector('[data-cc-vm-logo-size]');
                if (img && dataUrl) img.src = dataUrl;
                if (name) name.textContent = file.name;
                if (size) size.textContent = formatLogoFileSize(file.size);
            },
            onClear: function () {
                _logoDataUrl = null;
                syncLogoPreviewOverlay(null);
                var img = root.querySelector('[data-cc-vm-logo-img]');
                if (img) img.removeAttribute('src');
            }
        });
    }

    /* ── Generate video button ── */
    function initGenVideoButton() {
        var btn = document.getElementById('cc-vm-btn-generar');
        if (!btn || btn._ccWired) return;
        btn._ccWired = true;
        btn.addEventListener('click', function () {
            persistGuionFromMountedInput();
            var trimmedGuion =
                _guionMode === 'manual' ? _guionTextManual.trim() : _guionTextIa.trim();
            if (!trimmedGuion.length) {
                if (_guionMode === 'ia' && !_guionIaEditorVisible) {
                    if (typeof global.showToast === 'function') {
                        global.showToast(
                            'warning',
                            'Genera el guión con IA o cambia a «Escribir manualmente».',
                            { containerId: 'ubits-toast-container' }
                        );
                    }
                    var boxCtx = getContextTemaBox();
                    if (boxCtx) boxCtx.classList.add('ai-panel__input-box--context-error');
                    var taCtx = getContextTemaTextarea();
                    if (taCtx) taCtx.focus();
                } else {
                    setGuionValidationInvalid('Campo requerido');
                    focusGuionFieldAfterError();
                }
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
            showLabel:   false,
            label:       '',
            placeholder: 'https://www.youtube.com/watch?v=...',
            size:        'lg',
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

    function wireDurationInfoAlertClose() {
        var panel = document.getElementById('cc-vtab-ia');
        if (!panel || panel._ccDurationAlertCloseWired) return;
        panel._ccDurationAlertCloseWired = true;
        panel.addEventListener('click', function (e) {
            var btn = e.target.closest('.cc-vm-ia-duration-alert .ubits-alert__close');
            if (!btn || !panel.contains(btn)) return;
            var alertEl = btn.closest('.cc-vm-ia-duration-alert');
            if (alertEl) alertEl.remove();
        });
    }

    function initIaButtonChromeInModal() {
        var root = document.getElementById(OVERLAY_ID);
        if (!root) return;
        if (typeof global.initIaButtonChrome === 'function') {
            global.initIaButtonChrome(root);
        } else {
            if (typeof global.initIaButtonPrimaryGlowWrap === 'function') {
                global.initIaButtonPrimaryGlowWrap(root);
            }
            if (typeof global.initIaButtonSparkles === 'function') {
                global.initIaButtonSparkles(root);
            }
        }
    }

    function initModalInteractions() {
        initIaButtonChromeInModal();
        wireTabBar();
        initGenVideoButton();

        if (CC_VIDEO_MODAL_UI === 'v2') {
            wireIaWizardFooter();
            wireIaWizardStepper();
            initCategorySelect();
            wireAvatarPick();
            updatePreviewStage(_selectedAvatar || AVATARS[0]);
            setIaWizardStep(0);
            refreshIaButtons();
            return;
        }

        wireDurationInfoAlertClose();
        initCategorySelect();
        wireAvatarGrid();
        initInsumoAttach();
        initContextTemaField();
        wireGuionModeRadios();
        applyGuionModeUi();
        initGenGuionButton();
        initLogoUpload();
        refreshIaButtons();
        updatePreviewStage(_selectedAvatar || AVATARS[0]);
        syncFooterCta();
    }

    /* ══════════════════════════════════════
       Chrome IA del modal
    ══════════════════════════════════════ */
    function applyLegacyModalBodyOverflow(modalBody) {
        if (!modalBody || CC_VIDEO_MODAL_UI !== 'legacy') return;
        modalBody.style.flex = '1 1 auto';
        modalBody.style.minHeight = '0';
        modalBody.style.overflowX = 'hidden';
        modalBody.style.overflowY = 'auto';
    }

    function applyAiModalChrome(overlay) {
        var modalContent = overlay.querySelector('.ubits-modal-content');
        if (modalContent) {
            modalContent.classList.add('portada-ia-modal-content', 'cc-video-ia-modal-content');
        }

        var modalBody = overlay.querySelector('.ubits-modal-body');
        if (modalBody) {
            modalBody.style.padding = 'var(--padding-xl, 32px)';
            modalBody.style.display = 'flex';
            modalBody.style.flexDirection = 'column';
            modalBody.style.maxHeight = '';
            if (CC_VIDEO_MODAL_UI === 'v2') {
                modalBody.style.flex = '1 1 auto';
                modalBody.style.minHeight = '0';
                modalBody.style.overflowX = 'hidden';
                modalBody.style.overflowY = 'auto';
            } else {
                applyLegacyModalBodyOverflow(modalBody);
            }
        }

        applyVideoModalContentSize();
        syncVideoModalTokensBadge();
    }

    /* ══════════════════════════════════════
       FOOTER DEL MODAL
    ══════════════════════════════════════ */
    function buildVideoFooterHtml() {
        if (CC_VIDEO_MODAL_UI === 'legacy') {
            return (
                '<div class="ubits-modal-footer__right">' +
                '<button type="button" class="ubits-button ubits-button--secondary ubits-button--md" id="cc-venlace-btn-cargar" disabled style="display:none"><span>Cargar video</span></button>' +
                '<button type="button" class="ubits-button ubits-button--primary ubits-button--md" id="cc-vsubir-btn-confirmar" disabled style="display:none"><span>Cargar video</span></button>' +
                '<button type="button" class="ubits-ia-button ubits-ia-button--primary ubits-ia-button--md ubits-ia-button--with-token-cost" id="cc-vm-btn-generar">' +
                '<span>Generar video</span>' +
                '<span class="ubits-ia-button__token-divider" aria-hidden="true"></span>' +
                '<span class="ubits-ia-button__token-cost" aria-hidden="true"><i class="far fa-coin-vertical"></i><span class="ubits-ia-button__token-number">' +
                VIDEO_GEN_TOKEN_COST +
                '</span></span></button></div>'
            );
        }
        return (
            '<div class="ubits-modal-footer__right cc-vm-footer-v2">' +
            '<button type="button" class="ubits-button ubits-button--secondary ubits-button--md" id="cc-venlace-btn-cargar" disabled style="display:none"><span>Cargar video</span></button>' +
            '<button type="button" class="ubits-button ubits-button--primary ubits-button--md" id="cc-vsubir-btn-confirmar" disabled style="display:none"><span>Cargar video</span></button>' +
            '<button type="button" class="ubits-button ubits-button--secondary ubits-button--md" id="cc-vm-btn-anterior" style="display:none"><span>Anterior</span></button>' +
            '<button type="button" class="ubits-button ubits-button--primary ubits-button--md" id="cc-vm-btn-siguiente" style="display:none"><span>Siguiente</span></button>' +
            '<button type="button" class="ubits-ia-button ubits-ia-button--primary ubits-ia-button--md ubits-ia-button--with-token-cost" id="cc-vm-btn-generar" style="display:none">' +
            '<span>Generar video</span>' +
            '<span class="ubits-ia-button__token-divider" aria-hidden="true"></span>' +
            '<span class="ubits-ia-button__token-cost" aria-hidden="true"><i class="far fa-coin-vertical"></i><span class="ubits-ia-button__token-number">' +
            VIDEO_GEN_TOKEN_COST +
            '</span></span></button></div>'
        );
    }

    /* ══════════════════════════════════════
       ABRIR MODAL
    ══════════════════════════════════════ */
    function openVideoRecursoModal(opts) {
        opts = opts || {};
        if (opts.ui === 'legacy' || opts.ui === 'v2') {
            CC_VIDEO_MODAL_UI = opts.ui;
        }
        _onVideoReady   = opts.onVideoReady || null;
        _currentPageKey = opts.pageKey != null ? opts.pageKey : null;
        _currentTab     = 'ia';
        _currentCat     = 'staff';
        _selectedAvatar = AVATARS.filter(function (a) { return a.cat === 'staff'; })[0] || AVATARS[0];
        _guionTextIa           = '';
        _guionTextManual       = '';
        _guionInputApi         = null;
        _guionMode             = 'ia';
        _guionIaEditorVisible  = false;
        _iaWizardStep          = 0;
        _enlaceValue    = '';
        _enlaceValid    = false;
        _fileBlob       = null;
        _logoDataUrl    = null;
        _pendingFiles   = [];
        if (_fileBlobUrl) { URL.revokeObjectURL(_fileBlobUrl); _fileBlobUrl = null; }

        var initialSize = 'lg';
        if (CC_VIDEO_MODAL_UI === 'v2') {
            initialSize = getVideoModalIaSizeForViewport();
        }

        var overlay = openModal({
            overlayId:           OVERLAY_ID,
            title:               'Agregar video',
            bodyHtml:            buildModalBody(),
            size:                initialSize,
            closeOnOverlayClick: false,
            footerHtml:          buildVideoFooterHtml(),
            variant:             'ia',
            iaTokensRemaining:   getVideoAiTokens(),
            iaTokensBadgeId:     'cc-video-modal-tokens-badge',
            onClose: function () {
                stopAvatarPreviewPlayback();
                var el = document.getElementById(OVERLAY_ID);
                if (el) unwireVideoModalResponsiveSize(el);
            }
        });

        if (overlay) {
            overlay.classList.toggle('cc-video-modal-ui-v2', CC_VIDEO_MODAL_UI === 'v2');
            overlay.classList.toggle('cc-video-modal-ui-legacy', CC_VIDEO_MODAL_UI === 'legacy');
            applyAiModalChrome(overlay);
            wireVideoModalResponsiveSize(overlay);
        }

        setTimeout(function () {
            initModalInteractions();
            switchToTab(_currentTab || 'ia');
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

    /** Bloque de video generado por IA (demo deep link). */
    global.ccVideoBuildAiRenderedHtml = function () {
        return buildRenderedBlock('local', AI_GENERATED_RESULT_MP4, true, { aiGenerated: true });
    };

}(window));
