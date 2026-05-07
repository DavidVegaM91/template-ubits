/**
 * LMS Creator — Modal «Agregar video» (tres pestañas: Video IA · Enlace · Subir)
 * + Widget flotante de generación de video (estilo Google Drive).
 *
 * Depende:
 *   modal.js  (openModal, closeModal)
 *   input.js  (createInput)
 *   file-upload.js (createFileUpload, fileUploadSetProgress, fileUploadClearProgress, fileUploadSetSuccess)
 *   video-player.js (videoPlayerHtml) — opcional, usa fallback si no está
 *   tab.css, file-upload.css, video-recurso-modal.css
 */
(function (global) {
    'use strict';

    var OVERLAY_ID = 'cc-video-recurso-modal';

    var VIDEO_GUION_IA_TOKEN_COST = 2;
    var VIDEO_GEN_TOKEN_COST      = 20;

    function getVideoAiTokens() {
        return global._ubitsAiTokenPool != null ? global._ubitsAiTokenPool : 50;
    }

    /** Sincroniza el badge de tokens del header del modal de video (además del pool global). */
    function syncVideoModalTokensBadge() {
        var n = getVideoAiTokens();
        var el = document.getElementById('cc-video-modal-tokens-badge');
        if (!el) return;
        var num = el.querySelector('.ubits-badge-tag__token-number');
        if (num) num.textContent = String(n);
        el.setAttribute('aria-label', String(n) + ' tokens restantes');
    }

    /**
     * Descuenta tokens como evaluaciones / portada: pool global + badge del panel IA + badge del modal video.
     */
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

    function emitRecursosChanged(detail) {
        try {
            document.dispatchEvent(new CustomEvent('ubits-recursos-changed', { detail: detail || {} }));
        } catch (e) { /* noop */ }
    }

    function refreshStep2TokenButtons() {
        var g = getVideoAiTokens();
        var genGuion = document.getElementById('cc-via-btn-gen-guion');
        var genVid = document.getElementById('cc-via-btn-generar');
        var ta = document.getElementById('cc-via-guion-ta');
        var scriptOk = ta && String(ta.value || '').trim().length > 0;
        if (genGuion) {
            genGuion.disabled = g < VIDEO_GUION_IA_TOKEN_COST;
            if (g < VIDEO_GUION_IA_TOKEN_COST) {
                genGuion.setAttribute(
                    'title',
                    'No tienes suficientes tokens (' + VIDEO_GUION_IA_TOKEN_COST + ' requeridos).'
                );
            } else {
                genGuion.removeAttribute('title');
            }
        }
        if (genVid) {
            genVid.disabled = !scriptOk || g < VIDEO_GEN_TOKEN_COST;
            if (scriptOk && g < VIDEO_GEN_TOKEN_COST) {
                genVid.setAttribute('title', 'No tienes suficientes tokens (' + VIDEO_GEN_TOKEN_COST + ' requeridos).');
            } else {
                genVid.removeAttribute('title');
            }
        }
    }

    /* ── Estado del modal ── */
    var _onVideoReady   = null;   // callback(html) → html del bloque renderizado
    var _currentPageKey = null;
    var _currentTab     = 'ia';
    var _iaStep         = 1;
    var _selectedAvatar = null;
    var _guionText      = '';
    var _enlaceValue    = '';
    var _enlaceValid    = false;
    var _fileBlob       = null;
    var _fileBlobUrl    = null;

    /* ══════════════════════════════════════
       DATOS: 50 AVATARES
    ══════════════════════════════════════ */
    var AVATARS = [
        { id:  1, name: 'Andrea',     g: 'women', n: 1  },
        { id:  2, name: 'Carlos',     g: 'men',   n: 1  },
        { id:  3, name: 'Sofía',      g: 'women', n: 2  },
        { id:  4, name: 'Miguel',     g: 'men',   n: 2  },
        { id:  5, name: 'Emily',      g: 'women', n: 3  },
        { id:  6, name: 'Rodrigo',    g: 'men',   n: 3  },
        { id:  7, name: 'Valentina',  g: 'women', n: 4  },
        { id:  8, name: 'Diego',      g: 'men',   n: 4  },
        { id:  9, name: 'María',      g: 'women', n: 5  },
        { id: 10, name: 'Sebastián',  g: 'men',   n: 5  },
        { id: 11, name: 'Camila',     g: 'women', n: 6  },
        { id: 12, name: 'Andrés',     g: 'men',   n: 6  },
        { id: 13, name: 'Isabella',   g: 'women', n: 7  },
        { id: 14, name: 'Felipe',     g: 'men',   n: 7  },
        { id: 15, name: 'Natalia',    g: 'women', n: 8  },
        { id: 16, name: 'Mateo',      g: 'men',   n: 8  },
        { id: 17, name: 'Daniela',    g: 'women', n: 9  },
        { id: 18, name: 'Alejandro',  g: 'men',   n: 9  },
        { id: 19, name: 'Paula',      g: 'women', n: 10 },
        { id: 20, name: 'Julián',     g: 'men',   n: 10 },
        { id: 21, name: 'Laura',      g: 'women', n: 11 },
        { id: 22, name: 'Santiago',   g: 'men',   n: 11 },
        { id: 23, name: 'Gabriela',   g: 'women', n: 12 },
        { id: 24, name: 'Tomás',      g: 'men',   n: 12 },
        { id: 25, name: 'Sara',       g: 'women', n: 13 },
        { id: 26, name: 'Nicolás',    g: 'men',   n: 13 },
        { id: 27, name: 'Mariana',    g: 'women', n: 14 },
        { id: 28, name: 'Samuel',     g: 'men',   n: 14 },
        { id: 29, name: 'Fernanda',   g: 'women', n: 15 },
        { id: 30, name: 'Roberto',    g: 'men',   n: 15 },
        { id: 31, name: 'Luciana',    g: 'women', n: 16 },
        { id: 32, name: 'Esteban',    g: 'men',   n: 16 },
        { id: 33, name: 'Renata',     g: 'women', n: 17 },
        { id: 34, name: 'Cristian',   g: 'men',   n: 17 },
        { id: 35, name: 'Ana',        g: 'women', n: 18 },
        { id: 36, name: 'Manuel',     g: 'men',   n: 18 },
        { id: 37, name: 'Stephanie',  g: 'women', n: 19 },
        { id: 38, name: 'Rafael',     g: 'men',   n: 19 },
        { id: 39, name: 'Claudia',    g: 'women', n: 20 },
        { id: 40, name: 'Javier',     g: 'men',   n: 20 },
        { id: 41, name: 'Patricia',   g: 'women', n: 21 },
        { id: 42, name: 'Leonardo',   g: 'men',   n: 21 },
        { id: 43, name: 'Marcela',    g: 'women', n: 22 },
        { id: 44, name: 'Guillermo',  g: 'men',   n: 22 },
        { id: 45, name: 'Verónica',   g: 'women', n: 23 },
        { id: 46, name: 'Fernando',   g: 'men',   n: 23 },
        { id: 47, name: 'Lorena',     g: 'women', n: 24 },
        { id: 48, name: 'Álvaro',     g: 'men',   n: 24 },
        { id: 49, name: 'Ana María',  g: 'women', n: 25 },
        { id: 50, name: 'Héctor',     g: 'men',   n: 25 },
    ];

    /* YouTube IDs para preview (cycling) — embeds estables; algunos TED viejos dejan de permitir embed */
    var PREVIEW_IDS = [
        'UF8uR6Z6KLc',   // Stanford — Steve Jobs (embed estable)
        'iG9CE55wbtY',   // Simon Sinek
        '8S0FDjFBj8o',   // Brené Brown
        'nnR0fzM8BiA',   // Susan Cain — TED (embed estable)
        '_mG-hhWL_ug',   // Amy Cuddy
        'UyyjU8fzEYU',   // Shawn Achor
        'H14bBuluwB8',   // Malcolm Gladwell
        'eIho2S0ZahI',   // Tim Urban
        'RcGyVTAoXEU',   // Carol Dweck
        'lmyZMtPVodo',   // Kelly McGonigal
    ];

    /**
     * Previews que fallaban con el ciclo por índice (IDs rotos o embed deshabilitado).
     * Andrea, Miguel, Camila, Felipe, Laura, Tomás, Luciana, Cristian, Patricia, Guillermo.
     */
    var PREVIEW_ID_OVERRIDE_BY_AVATAR_ID = {
        1:  'UF8uR6Z6KLc',  // Andrea — Stanford / Jobs
        4:  'nnR0fzM8BiA',  // Miguel — Susan Cain TED
        11: 'aqz-KE-bpKQ',  // Camila — Big Buck Bunny (Blender, embed fiable)
        14: 'eRsGyueVLvQ',  // Felipe — Sintel (Blender)
        21: 'RnrKZnT56iY',  // Laura — Tears of Steel (Blender)
        24: 'jNQXAC9IVRw',  // Tomás — primer video YouTube (siempre embeddable)
        31: 'ScMzIvxwBn8',  // Luciana — clip de prueba habitual embed
        34: 'y8Yv4pnO7qc',  // Cristian — TED-Ed típico embeddable
        41: 'I7g1m-eDgCE',  // Patricia — charla pública estable
        44: 'dGCctGr0Hu8',  // Guillermo — TED corto embeddable
    };

    function avatarImg(av) {
        return 'https://randomuser.me/api/portraits/' + av.g + '/' + av.n + '.jpg';
    }
    function avatarVideoId(av) {
        if (av && PREVIEW_ID_OVERRIDE_BY_AVATAR_ID[av.id]) {
            return PREVIEW_ID_OVERRIDE_BY_AVATAR_ID[av.id];
        }
        return PREVIEW_IDS[(av.id - 1) % PREVIEW_IDS.length];
    }
    function avatarPreviewSrc(av) {
        return 'https://www.youtube.com/embed/' + avatarVideoId(av) + '?rel=0&modestbranding=1';
    }

    /* ══════════════════════════════════════
       HELPERS
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
        return v.indexOf('vimeo.com')           !== -1 ||
               v.indexOf('youtube.com')         !== -1 ||
               v.indexOf('youtu.be')            !== -1 ||
               v.indexOf('drive.google.com')    !== -1 ||
               v.indexOf('onedrive.live.com')   !== -1;
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
        if (v.indexOf('vimeo.com')        !== -1) return 'vimeo';
        if (v.indexOf('youtube.com')      !== -1 || v.indexOf('youtu.be') !== -1) return 'youtube';
        if (v.indexOf('drive.google.com') !== -1) return 'google-drive';
        if (v.indexOf('onedrive.live.com')!== -1) return 'onedrive';
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

    function buildRenderedBlock(type, src, isLocal) {
        return (
            '<div class="ubits-resources-block ubits-resources-block--stack">' +
                '<div class="ubits-resources-block__surface" style="padding:0;">' +
                    buildPlayerHtml(type, src, isLocal) +
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
       GENERADOR DE GUION (simulado)
    ══════════════════════════════════════ */
    function generateGuion(tema) {
        var t   = String(tema  || 'este tema').trim();
        var nom = _selectedAvatar ? _selectedAvatar.name : 'el presentador';
        var txt = (
            'Hola, soy ' + nom + ' y hoy te hablaré sobre ' + t + '.\n\n' +
            'En el entorno actual, ' + t + ' ha tomado un papel protagónico tanto en el ámbito ' +
            'profesional como en el personal. Las organizaciones líderes reconocen su valor y están ' +
            'invirtiendo para incorporarlo de manera estratégica en sus procesos.\n\n' +
            'Para entender el impacto de ' + t + ', analicemos tres dimensiones clave:\n\n' +
            '1. Contexto actual: las tendencias globales están redefiniendo la forma en que trabajamos, ' +
            'aprendemos y nos relacionamos. ' + t + ' es parte central de esta transformación.\n\n' +
            '2. Impacto humano: las personas que desarrollan competencias en ' + t + ' reportan mayor ' +
            'confianza, mejores resultados y más oportunidades de crecimiento. No se trata solo de ' +
            'conocimiento técnico, sino de una mentalidad que se cultiva con práctica y reflexión.\n\n' +
            '3. Dimensión estratégica: las organizaciones que integran ' + t + ' en su cultura ven ' +
            'mejoras medibles en compromiso, retención de talento y desempeño. Los datos son claros.\n\n' +
            'Mi invitación es que reflexiones: ¿cómo puedes aplicar hoy lo que aprendiste sobre ' + t + '? ' +
            'El cambio comienza con un primer paso. ¡Muchas gracias y hasta la próxima!'
        );
        return txt.length > 1700 ? txt.slice(0, 1697) + '...' : txt;
    }

    /* ══════════════════════════════════════
       CONSTRUIR HTML DEL MODAL
    ══════════════════════════════════════ */
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

    function buildStepperHtml(active) {
        /* Siempre número en el círculo (componente stepper: --done muestra número, no check en <i>). */
        function step(num, label, state) {
            var markClass = 'ubits-stepper__mark';
            var stepClass = 'ubits-stepper__step ubits-stepper__step--' + state;
            var a11y =
                num === 1 && state === 'done'
                    ? ' tabindex="0" role="button" aria-label="Volver a seleccionar avatar"'
                    : '';
            return (
                '<li class="' + stepClass + '"' + a11y + '>' +
                    '<div class="' + markClass + '">' +
                        '<span class="ubits-stepper__mark-num">' + num + '</span>' +
                    '</div>' +
                    '<span class="ubits-stepper__label ubits-body-sm-regular">' + label + '</span>' +
                '</li>'
            );
        }
        return (
            '<div class="cc-vmodal-stepper-wrap' + (active === 2 ? ' cc-via-stepper--step2-active' : '') + '">' +
                '<ol class="ubits-stepper ubits-stepper--horizontal ubits-stepper--horizontal-compact">' +
                    step(1, 'Seleccionar avatar', active === 1 ? 'active' : 'done') +
                    '<li class="ubits-stepper__rail" aria-hidden="true"></li>' +
                    step(2, 'Definir guion', active === 2 ? 'active' : 'pending') +
                '</ol>' +
            '</div>'
        );
    }

    function buildAvatarGridHtml() {
        return AVATARS.map(function (av) {
            var sel = _selectedAvatar && _selectedAvatar.id === av.id;
            return (
                '<button type="button" class="cc-via-avatar-card' + (sel ? ' cc-via-avatar-card--selected' : '') + '"' +
                    ' data-avatar-id="' + av.id + '" aria-pressed="' + (sel ? 'true' : 'false') + '">' +
                    '<div class="cc-via-avatar-photo">' +
                        '<img src="' + avatarImg(av) + '" alt="' + esc(av.name) + '" loading="lazy" width="48" height="48">' +
                    '</div>' +
                    '<span class="cc-via-avatar-name">' + esc(av.name) + '</span>' +
                '</button>'
            );
        }).join('');
    }

    function buildStep1Html() {
        var av  = _selectedAvatar || AVATARS[0];
        return (
            '<div class="cc-via-step" id="cc-via-step1">' +
                '<div class="cc-via-avatar-layout">' +
                    '<div class="cc-via-avatar-left">' +
                        '<div id="cc-via-search-wrap" class="cc-via-search-wrap"></div>' +
                        '<div class="cc-via-avatar-grid" id="cc-via-grid">' +
                            buildAvatarGridHtml() +
                        '</div>' +
                    '</div>' +
                    '<div class="cc-via-avatar-right">' +
                        '<div class="cc-via-preview-column">' +
                            '<div class="cc-via-preview-frame">' +
                                '<iframe id="cc-via-preview-iframe"' +
                                    ' src="' + avatarPreviewSrc(av) + '"' +
                                    ' frameborder="0"' +
                                    ' allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture"' +
                                    ' allowfullscreen' +
                                    ' title="Vista previa de ' + esc(av.name) + '">' +
                                '</iframe>' +
                            '</div>' +
                            '<p class="ubits-body-xs-regular cc-via-preview-hint">Vista previa representativa. El video final usará tu guion</p>' +
                            '<button type="button" class="ubits-button ubits-button--primary ubits-button--md" id="cc-via-btn-siguiente">' +
                                '<span>Siguiente</span>' +
                            '</button>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>'
        );
    }

    function buildStep2Html() {
        var n = _guionText.length;
        return (
            '<div class="cc-via-step cc-via-step--hidden" id="cc-via-step2">' +
                '<div class="cc-via-guion-layout">' +
                    '<div class="cc-via-guion-ia-row">' +
                        '<div id="cc-via-tema-wrap" class="cc-via-tema-wrap"></div>' +
                        '<button type="button" class="ubits-button ubits-button--secondary ubits-button--md ubits-button--with-token-cost" id="cc-via-btn-gen-guion">' +
                            '<span class="ubits-button__token-cost" aria-hidden="true">' +
                                '<span class="ubits-button__token-number">' + String(VIDEO_GUION_IA_TOKEN_COST) + '</span>' +
                                '<i class="far fa-coin-vertical"></i>' +
                            '</span>' +
                            '<span class="cc-via-btn-label">Generar guion con IA</span>' +
                        '</button>' +
                    '</div>' +
                    '<div class="cc-via-guion-editor-wrap">' +
                        '<textarea class="cc-via-guion-textarea" id="cc-via-guion-ta" maxlength="1700"' +
                            ' placeholder="Escribe el guion que dirá el avatar. Máximo 1 700 caracteres."' +
                            ' aria-label="Guion del avatar">' + esc(_guionText) + '</textarea>' +
                        '<div class="cc-via-guion-counter"><span id="cc-via-char-count">' + n + '</span> / 1 700</div>' +
                    '</div>' +
                    '<div class="cc-via-guion-generar-wrap">' +
                        '<button type="button" class="ubits-button ubits-button--primary ubits-button--md ubits-button--with-token-cost" id="cc-via-btn-generar"' +
                            (n > 0 ? '' : ' disabled') + '>' +
                            '<span class="ubits-button__token-cost" aria-hidden="true">' +
                                '<span class="ubits-button__token-number">' + String(VIDEO_GEN_TOKEN_COST) + '</span>' +
                                '<i class="far fa-coin-vertical"></i>' +
                            '</span>' +
                            '<span class="cc-via-btn-label">Generar video</span>' +
                        '</button>' +
                    '</div>' +
                '</div>' +
            '</div>'
        );
    }

    function buildIaPanel() {
        return (
            '<div class="cc-vmodal-panel" id="cc-vtab-ia">' +
                buildStepperHtml(1) +
                buildStep1Html() +
                buildStep2Html() +
            '</div>'
        );
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

    /* ── Paso IA ── */
    function switchToStep(step) {
        _iaStep = step;
        var s1 = document.getElementById('cc-via-step1');
        var s2 = document.getElementById('cc-via-step2');
        if (s1) s1.classList.toggle('cc-via-step--hidden', step !== 1);
        if (s2) s2.classList.toggle('cc-via-step--hidden', step !== 2);

        /* Actualizar stepper */
        var wrap = document.querySelector('#cc-vtab-ia .cc-vmodal-stepper-wrap');
        if (wrap) {
            var tmp = document.createElement('div');
            tmp.innerHTML = buildStepperHtml(step);
            var newWrap = tmp.firstElementChild;
            if (newWrap) wrap.parentNode.replaceChild(newWrap, wrap);
        }
        if (step === 2) {
            initTemaInput();
            wireStep2Inputs();
            refreshStep2TokenButtons();
        }
    }

    /* ── Avatar ── */
    function selectAvatar(id) {
        var av = AVATARS.find(function (a) { return a.id === id; });
        if (!av) return;
        _selectedAvatar = av;
        var grid = document.getElementById('cc-via-grid');
        if (grid) {
            grid.querySelectorAll('.cc-via-avatar-card').forEach(function (card) {
                var sel = parseInt(card.getAttribute('data-avatar-id')) === id;
                card.classList.toggle('cc-via-avatar-card--selected', sel);
                card.setAttribute('aria-pressed', sel ? 'true' : 'false');
            });
        }
        var iframe = document.getElementById('cc-via-preview-iframe');
        if (iframe) {
            iframe.src = avatarPreviewSrc(av);
            iframe.setAttribute('title', 'Vista previa de ' + av.name);
        }
    }

    /* ── Filtro de avatares ── */
    function filterAvatars(q) {
        var grid = document.getElementById('cc-via-grid');
        if (!grid) return;
        grid.querySelectorAll('.cc-via-avatar-card').forEach(function (card) {
            var nm = (card.querySelector('.cc-via-avatar-name') || {}).textContent || '';
            card.style.display = (!q || nm.toLowerCase().indexOf(q) !== -1) ? '' : 'none';
        });
    }

    /* ── Init de inputs ── */
    function initSearchInput() {
        var wrap = document.getElementById('cc-via-search-wrap');
        if (!wrap || typeof global.createInput !== 'function') return;
        global.createInput({
            containerId: 'cc-via-search-wrap',
            type: 'search',
            placeholder: 'Buscar avatar...',
            size: 'sm',
            onChange: function (val) {
                filterAvatars(String(val || '').trim().toLowerCase());
            }
        });
    }

    function initTemaInput() {
        var wrap = document.getElementById('cc-via-tema-wrap');
        if (!wrap || wrap.querySelector('input') || typeof global.createInput !== 'function') return;
        global.createInput({
            containerId: 'cc-via-tema-wrap',
            type:        'text',
            placeholder: 'Escribe el tema del guion...',
            size:        'md',
        });
    }

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
                /* Simular progreso de carga: 0→100% en ~2 s */
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
    function wireStep1() {
        var grid   = document.getElementById('cc-via-grid');
        var sigBtn = document.getElementById('cc-via-btn-siguiente');
        if (grid) {
            grid.addEventListener('click', function (e) {
                var card = e.target.closest('.cc-via-avatar-card');
                if (card) selectAvatar(parseInt(card.getAttribute('data-avatar-id')));
            });
        }
        if (sigBtn) {
            sigBtn.addEventListener('click', function () {
                if (!_selectedAvatar) _selectedAvatar = AVATARS[0];
                switchToStep(2);
            });
        }
    }

    function wireStep2Inputs() {
        var ta        = document.getElementById('cc-via-guion-ta');
        var counter   = document.getElementById('cc-via-char-count');
        var genBtn    = document.getElementById('cc-via-btn-generar');
        var genGuion  = document.getElementById('cc-via-btn-gen-guion');

        if (ta && !ta._ccWired) {
            ta._ccWired = true;
            if (_guionText) ta.value = _guionText;
            ta.addEventListener('input', function () {
                _guionText = ta.value;
                if (counter) counter.textContent = _guionText.length;
                refreshStep2TokenButtons();
            });
        }

        if (genBtn && !genBtn._ccWired) {
            genBtn._ccWired = true;
            genBtn.addEventListener('click', function () {
                _guionText = ta ? ta.value : _guionText;
                onGenerarVideo();
            });
        }

        if (genGuion && !genGuion._ccWired) {
            genGuion._ccWired = true;
            genGuion.addEventListener('click', function () {
                var temaWrap  = document.getElementById('cc-via-tema-wrap');
                var temaInput = temaWrap ? temaWrap.querySelector('input') : null;
                var tema      = temaInput ? temaInput.value.trim() : '';
                if (!tema) {
                    if (temaInput) {
                        temaInput.style.borderColor = 'var(--ubits-feedback-accent-error)';
                        temaInput.style.borderWidth = '2px';
                    }
                    return;
                }
                if (!trySpendVideoAiTokens(VIDEO_GUION_IA_TOKEN_COST)) return;

                if (temaInput) {
                    temaInput.style.borderColor = 'var(--ubits-border-1)';
                    temaInput.style.borderWidth = '1px';
                }
                var labelEl = genGuion.querySelector('.cc-via-btn-label');
                genGuion.disabled = true;
                if (labelEl) labelEl.textContent = 'Generando...';
                if (ta) { ta.disabled = true; ta.style.opacity = '0.5'; }

                setTimeout(function () {
                    var guion = generateGuion(tema);
                    _guionText = guion;
                    if (ta) {
                        ta.value    = guion;
                        ta.disabled = false;
                        ta.style.opacity = '';
                        ta.dispatchEvent(new Event('input'));
                    }
                    genGuion.disabled = false;
                    if (labelEl) labelEl.textContent = 'Generar guion con IA';
                    refreshStep2TokenButtons();
                }, 1800);
            });
        }

        refreshStep2TokenButtons();
    }

    function wireEnlaceCargar() {
        var cargarBtn = document.getElementById('cc-venlace-btn-cargar');
        if (!cargarBtn || cargarBtn._ccWired) return;
        cargarBtn._ccWired = true;
        cargarBtn.addEventListener('click', function () {
            if (!_enlaceValid || !_enlaceValue) return;
            var src  = buildEmbedSrc(_enlaceValue);
            var type = embedType(_enlaceValue);
            var html = buildRenderedBlock(type, src, false);
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
            var html = buildRenderedBlock('local', _fileBlobUrl, true);
            closeModal(OVERLAY_ID);
            if (_onVideoReady) _onVideoReady(html);
            emitRecursosChanged({ type: 'video', pageKey: _currentPageKey, source: 'upload' });
        });
    }

    function onGenerarVideo() {
        if (!trySpendVideoAiTokens(VIDEO_GEN_TOKEN_COST)) return;

        var avatarName = _selectedAvatar ? _selectedAvatar.name : 'Avatar';
        var videoId    = _selectedAvatar ? avatarVideoId(_selectedAvatar) : PREVIEW_IDS[0];
        var generatedSrc = 'https://www.youtube.com/embed/' + videoId + '?rel=0&modestbranding=1';
        var pageKey    = _currentPageKey;

        closeModal(OVERLAY_ID);
        startWidgetJob({ pageKey: pageKey, avatarName: avatarName, src: generatedSrc });
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

    /** Paso 1 del stepper: volver desde el paso 2 haciendo clic en el paso completado */
    function wireStepperBackOnIaPanel() {
        var panel = document.getElementById('cc-vtab-ia');
        if (!panel || panel._ccStepperBackWired) return;
        panel._ccStepperBackWired = true;
        function goBackIfStep1(e) {
            if (_iaStep !== 2) return;
            var wrap = e.target.closest('.cc-vmodal-stepper-wrap');
            if (!wrap) return;
            var clicked = e.target.closest('.ubits-stepper__step');
            if (!clicked) return;
            var steps = wrap.querySelectorAll('.ubits-stepper__step');
            if (steps[0] === clicked) {
                if (e.type === 'keydown') {
                    if (e.key !== 'Enter' && e.key !== ' ') return;
                    e.preventDefault();
                }
                switchToStep(1);
            }
        }
        panel.addEventListener('click', goBackIfStep1);
        panel.addEventListener('keydown', goBackIfStep1);
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

    function initModalInteractions() {
        wireTabBar();
        wireStepperBackOnIaPanel();
        wireVolverIaButtons();
        initSearchInput();
        wireStep1();
    }

    /* ══════════════════════════════════════
       Chrome IA del modal (orbes + header + badge, como «Generar portada»)
    ══════════════════════════════════════ */
    /**
     * Chrome IA del modal: mismos orbes + header transparente + body que «Generar portada»
     * (crear-contenido.js initPortadaAiModal).
     */
    function applyAiModalChrome(overlay) {
        var titleSpan = overlay.querySelector('.ubits-modal-title');
        if (titleSpan) {
            titleSpan.textContent = 'Agregar video';
        }

        /* Fondo con orbes (mismas capas radiales que portada IA) */
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
            modalBody.style.overflow = 'auto';
            modalBody.style.display = 'flex';
            modalBody.style.flexDirection = 'column';
            /* max-height y flex: en video-recurso-modal.css (evita modal estirado casi a 90vh por flex:1) */
            modalBody.style.maxHeight = '';
            modalBody.style.flex = '';
        }

        /* Badge de tokens a la izquierda del botón cerrar */
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
       ABRIR MODAL
    ══════════════════════════════════════ */
    function openVideoRecursoModal(opts) {
        _onVideoReady   = (opts && opts.onVideoReady) || null;
        _currentPageKey = (opts && opts.pageKey)      || null;
        _currentTab     = 'ia';
        _iaStep         = 1;
        _selectedAvatar = AVATARS[0];
        _guionText      = '';
        _enlaceValue    = '';
        _enlaceValid    = false;
        _fileBlob       = null;
        if (_fileBlobUrl) { URL.revokeObjectURL(_fileBlobUrl); _fileBlobUrl = null; }

        /* Sin footer del modal (igual que openModal de «Generar portada»: no se pasa footerHtml). */
        var overlay = openModal({
            overlayId:           OVERLAY_ID,
            title:               'Agregar video',
            bodyHtml:            buildModalBody(),
            size:                'md',
            closeOnOverlayClick: false,
        });

        /* Orbes + header IA + badge (mismo patrón que «Generar portada») */
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
        var label = 'Video de ' + job.avatarName;

        if (typeof global.ccGenWidget !== 'undefined') {
            global.ccGenWidget.addJob(jobId, { type: 'video', label: label, pageKey: job.pageKey });
        }

        var innerLoader = typeof global.getIaLoaderHTML === 'function'
            ? global.getIaLoaderHTML({ label: 'Generando video' })
            : '<p role="status" aria-live="polite">Generando video…</p>';
        if (_onVideoReady) _onVideoReady('<div class="cc-video-ia-loader-host">' + innerLoader + '</div>');

        setTimeout(function () {
            var html = buildRenderedBlock('youtube', job.src, false);
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

    /* ══════════════════════════════════════
       API PÚBLICA
    ══════════════════════════════════════ */
    global.openVideoRecursoModal = openVideoRecursoModal;

}(window));
