/**
 * LMS Creator — editar-contenido.html (orquestador)
 */
(function () {
    'use strict';

    var SS_PIN_KEY = 'ubits-contenidos-pin-recien-creado';
    var SS_IMPACTO_POLICY = 'ubits-lms-edit-recursos-impacto-policy';
    var RECURSOS_IMPACTO_VIDEO_EMBED = 'https://www.youtube.com/embed/HXoFyBxwv7s';
    var RECURSOS_IMPACTO_STATS = {
        finalizaron: 156,
        enCurso: 842,
        planes: 12,
        rutas: 5
    };

    var editState = {
        contentId: '',
        record: null,
        readonly: false,
        activeSection: 'resultados',
        previousSectionBeforeRecursos: 'informacion',
        recursosUnlocked: false
    };

    var SECTION_TO_STEP = {
        informacion: 0,
        recursos: 1,
        certificado: 2,
        visibilidad: 3
    };

    var HASH_SECTION = {
        resultados: '#resultados',
        informacion: '#informacion',
        recursos: '#recursos',
        certificado: '#certificado',
        visibilidad: '#ajustes'
    };

    function getQueryParam(name) {
        try {
            return new URLSearchParams(window.location.search).get(name);
        } catch (e) {
            return null;
        }
    }

    function findContentRecord(id) {
        var db = window.BDS_CONTENIDOS_FIQSHA || {};
        var lists = [db.contentsCreatorOnly, db.contents].filter(Boolean);
        for (var i = 0; i < lists.length; i++) {
            var found = lists[i].find(function (c) {
                return String(c.id) === String(id);
            });
            if (found) return found;
        }
        return null;
    }

    function visibilidadLabelFromRecord(record) {
        if (!record) return 'Público';
        var v = record.visibilidadLms || 'Público';
        if (v === 'Borrador') return 'Borrador';
        if (v === 'Privado') return 'Privado';
        if (v === 'Oculto') return 'Oculto';
        if (v === 'Archivado') return 'Archivado';
        return 'Público';
    }

    function visibilidadToTagModifier(label) {
        var v = String(label || '').toLowerCase();
        if (v === 'público' || v === 'publico' || v === 'publicado') return 'success';
        if (v === 'privado') return 'warning';
        if (v === 'oculto' || v === 'archivado') return 'neutral';
        return 'info';
    }

    function updateHeaderTag(label) {
        var tag = document.getElementById('crear-contenido-visibilidad-header-tag');
        if (!tag) return;
        var mod = visibilidadToTagModifier(label);
        tag.className = 'ubits-status-tag ubits-status-tag--sm ubits-status-tag--' + mod;
        var txt = tag.querySelector('.ubits-status-tag__text');
        if (txt) txt.textContent = label === 'Publicado' ? 'Público' : label;
    }

    function applyEditSection(sectionId) {
        if (sectionId !== 'recursos') {
            editState.recursosUnlocked = false;
        }
        var resultados = document.getElementById('editar-contenido-step-resultados');
        var steps = document.querySelectorAll('#editar-contenido-root .crear-contenido-step[data-crear-step]');
        if (resultados) {
            resultados.classList.toggle('editar-contenido-step--visible', sectionId === 'resultados');
        }
        steps.forEach(function (el) {
            var map = {
                informacion: 'portada',
                recursos: 'recursos',
                certificado: 'certificado',
                visibilidad: 'publicacion'
            };
            var step = el.getAttribute('data-crear-step');
            var visible = map[sectionId] === step;
            el.classList.toggle('crear-contenido-step--visible', visible);
        });
        syncEditarContenidoStepper(sectionId);
        editState.activeSection = sectionId;

        if (sectionId === 'recursos') {
            enterRecursosSection();
        } else if (sectionId === 'visibilidad') {
            if (window.CrearContenidoPageApi) {
                window.CrearContenidoPageApi.goToCrearContenidoPageStep(3, { skipUrl: true });
            }
            applyVisibilidadEditRules();
            var configPanel =
                typeof window.panelFromCrearContenidoConfigHash === 'function'
                    ? window.panelFromCrearContenidoConfigHash(location.hash)
                    : null;
            if (typeof window.initCrearContenidoConfiguracionHub === 'function') {
                window.initCrearContenidoConfiguracionHub({
                    readonly: !!(document.body && document.body.classList.contains('page-editar-contenido--readonly')),
                    panel: configPanel || 'hub',
                    skipUrl: true
                });
            } else if (typeof window.showCrearContenidoConfiguracionHub === 'function') {
                window.showCrearContenidoConfiguracionHub();
            }
        } else if (sectionId === 'resultados') {
            document.querySelectorAll('#editar-contenido-root .crear-contenido-step[data-crear-step]').forEach(function (el) {
                el.classList.remove('crear-contenido-step--visible');
            });
        } else if (SECTION_TO_STEP[sectionId] != null && window.CrearContenidoPageApi) {
            window.CrearContenidoPageApi.goToCrearContenidoPageStep(SECTION_TO_STEP[sectionId], { skipUrl: true });
        }

        var hash;
        if (sectionId === 'resultados' && typeof window.resolveEditarContenidoHashForSection === 'function') {
            hash = window.resolveEditarContenidoHashForSection(sectionId, window.location.hash);
        } else if (sectionId === 'visibilidad') {
            if (
                typeof window.panelFromCrearContenidoConfigHash === 'function' &&
                window.panelFromCrearContenidoConfigHash(location.hash)
            ) {
                hash =
                    typeof window.hashForCrearContenidoConfigPanel === 'function'
                        ? window.hashForCrearContenidoConfigPanel(
                              window.panelFromCrearContenidoConfigHash(location.hash)
                          )
                        : HASH_SECTION.visibilidad;
            } else {
                hash = HASH_SECTION.visibilidad;
            }
        } else {
            hash = HASH_SECTION[sectionId];
        }
        if (hash) {
            history.replaceState(null, '', location.pathname + location.search + hash);
        }
    }

    function syncEditarContenidoStepper(sectionId) {
        var ols = [
            document.getElementById('editar-contenido-stepper-ol'),
            document.getElementById('editar-contenido-stepper-ol-mobile')
        ];
        ols.forEach(function (ol) {
            if (!ol) return;
            var idx =
                typeof window.getStepperIndexByStepId === 'function'
                    ? window.getStepperIndexByStepId(ol, sectionId)
                    : -1;
            if (idx < 0) idx = 0;
            if (typeof window.setStepperActiveOnly === 'function') {
                window.setStepperActiveOnly(ol, idx);
            }
        });
    }

    function wireEditarContenidoStepper() {
        var frame = document.getElementById('editar-contenido-stepper-frame');
        var toggle = document.getElementById('editar-contenido-stepper-toggle');
        if (frame && toggle && typeof window.wireStepperVerticalCollapse === 'function') {
            window.wireStepperVerticalCollapse(frame, toggle, { creatorRail: true });
        }

        function onStepActivate(stepId) {
            if (!stepId) return;
            showEditSection(stepId);
        }

        function wireOl(ol) {
            if (!ol) return;
            ol.querySelectorAll(':scope > .ubits-stepper__step').forEach(function (el) {
                el.style.cursor = 'pointer';
                el.setAttribute('tabindex', '0');
                el.setAttribute('role', 'button');
                function go() {
                    onStepActivate(el.getAttribute('data-step-id'));
                }
                el.addEventListener('click', go);
                el.addEventListener('keydown', function (e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        go();
                    }
                });
            });
        }

        wireOl(document.getElementById('editar-contenido-stepper-ol'));
        wireOl(document.getElementById('editar-contenido-stepper-ol-mobile'));
    }

    function formatIndicatorNumber(n) {
        if (n >= 1000000) return (Math.round((n / 1000000) * 10) / 10).toLocaleString('es-CO') + ' M';
        if (n >= 10000) return (Math.round((n / 1000) * 10) / 10).toLocaleString('es-CO') + ' K';
        return Number(n).toLocaleString('es-CO');
    }

    function impactoPolicyStorageKey() {
        return SS_IMPACTO_POLICY + ':' + String(editState.contentId || 'default');
    }

    function getSavedImpactoPolicy() {
        try {
            var v = sessionStorage.getItem(impactoPolicyStorageKey());
            if (v === 'afectar' || v === 'proteger') return v;
        } catch (e) {}
        return 'proteger';
    }

    function saveImpactoPolicy(policy) {
        try {
            sessionStorage.setItem(impactoPolicyStorageKey(), policy === 'afectar' ? 'afectar' : 'proteger');
        } catch (e) {}
    }

    function shouldShowRecursosWarning() {
        if (editState.readonly) return false;
        if (editState.activeSection === 'recursos' && editState.recursosUnlocked) return false;
        return typeof window.openModal === 'function';
    }

    function dismissRecursosWarningModal(previousSection) {
        var target = previousSection || editState.previousSectionBeforeRecursos || 'informacion';
        if (target === 'recursos') target = 'informacion';
        editState.recursosUnlocked = false;
        applyEditSection(target);
    }

    function showEditSection(sectionId, opts) {
        opts = opts || {};
        if (sectionId === 'recursos' && shouldShowRecursosWarning()) {
            var dismissTo =
                opts.dismissTo ||
                (editState.activeSection !== 'recursos' ? editState.activeSection : 'informacion');
            if (dismissTo === 'recursos') dismissTo = 'informacion';
            editState.previousSectionBeforeRecursos = dismissTo;
            /* Modal siempre encima de la página de Recursos. */
            applyEditSection('recursos');
            openRecursosWarningModal(dismissTo);
            return;
        }
        applyEditSection(sectionId);
    }

    function buildRecursosImpactoBodyHtml(policy) {
        var stats = RECURSOS_IMPACTO_STATS;
        var videoHtml =
            typeof window.videoPlayerHtml === 'function'
                ? window.videoPlayerHtml({
                      type: 'youtube',
                      src: RECURSOS_IMPACTO_VIDEO_EMBED,
                      className: 'ec-recursos-impacto__video'
                  })
                : '<iframe class="ubits-video-player ec-recursos-impacto__video" src="' +
                  RECURSOS_IMPACTO_VIDEO_EMBED +
                  '" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>';

        function card(value, title, desc, checked) {
            return (
                '<label class="ubits-selection-card ubits-radio ubits-radio--md' +
                (checked ? ' is-selected' : '') +
                '">' +
                '<input type="radio" class="ubits-radio__input" name="ec-recursos-impacto-policy" value="' +
                value +
                '"' +
                (checked ? ' checked' : '') +
                ' />' +
                '<span class="ubits-radio__circle"></span>' +
                '<div class="ubits-selection-card__body">' +
                '<div class="ubits-selection-card__header">' +
                '<span class="ubits-selection-card__title ubits-body-md-bold">' +
                title +
                '</span></div>' +
                '<p class="ubits-body-sm-regular ubits-selection-card__desc">' +
                desc +
                '</p></div></label>'
            );
        }

        function stat(label, value) {
            return (
                '<div class="ec-recursos-impacto__stat">' +
                '<div class="ec-recursos-impacto__stat-value ubits-heading-h2">' +
                formatIndicatorNumber(value) +
                '</div>' +
                '<div class="ec-recursos-impacto__stat-label ubits-body-sm-regular">' +
                label +
                '</div></div>'
            );
        }

        return (
            '<div class="ec-recursos-impacto">' +
            '<div class="ec-recursos-impacto__cols">' +
            '<div class="ec-recursos-impacto__left">' +
            '<p class="ubits-body-md-regular ec-recursos-impacto__intro"><strong class="ubits-weight-bold">Vas a poder añadir u ocultar páginas.</strong> Eso puede afectar el progreso de los estudiantes, las rutas, los planes de contenidos y los certificados. Elige cómo quieres manejar el impacto.</p>' +
            '<div class="ubits-selection-card-group ubits-selection-card-group--1 ec-recursos-impacto__policies" role="radiogroup" aria-label="Política de impacto">' +
            card(
                'proteger',
                'Proteger a quienes ya finalizaron',
                'Los estudiantes que ya completaron este contenido al 100 % mantienen su progreso y sus certificados. Los cambios estructurales no les quitan lo que ya lograron.',
                policy !== 'afectar'
            ) +
            card(
                'afectar',
                'Recalcular el progreso de todos',
                'El progreso se vuelve a calcular. Quienes habían finalizado pueden dejar de estar al 100 %, perder el certificado, y ver afectado su avance en rutas y planes de contenidos que incluyen este contenido.',
                policy === 'afectar'
            ) +
            '</div>' +
            '</div>' +
            '<div class="ec-recursos-impacto__right">' +
            '<div class="ec-recursos-impacto__video-wrap">' +
            videoHtml +
            '</div>' +
            '</div>' +
            '</div>' +
            '<div class="ec-recursos-impacto__bottom">' +
            '<p class="ubits-body-sm-semibold ec-recursos-impacto__stats-label">A quiénes afecta este contenido</p>' +
            '<div class="ec-recursos-impacto__stats' +
            (policy === 'afectar' ? ' ec-recursos-impacto__stats--afectar' : '') +
            '" role="group" aria-label="Indicadores de afectados">' +
            '<div class="ec-recursos-impacto__stat ec-recursos-impacto__stat--finalizaron"' +
            (policy === 'afectar' ? '' : ' hidden') +
            '>' +
            '<div class="ec-recursos-impacto__stat-value ubits-heading-h2">' +
            formatIndicatorNumber(stats.finalizaron) +
            '</div>' +
            '<div class="ec-recursos-impacto__stat-label ubits-body-sm-regular">Estudiantes que finalizaron</div>' +
            '</div>' +
            stat('Estudiantes en curso', stats.enCurso) +
            stat('Planes de contenidos', stats.planes) +
            stat('Rutas de aprendizaje', stats.rutas) +
            '</div>' +
            '</div>' +
            '</div>'
        );
    }

    function openRecursosWarningModal(dismissTo) {
        var OVERLAY_ID = 'ec-recursos-warn-modal';
        var sectionBeforePrompt =
            dismissTo ||
            editState.previousSectionBeforeRecursos ||
            (editState.activeSection !== 'recursos' ? editState.activeSection : 'informacion');
        if (sectionBeforePrompt === 'recursos') sectionBeforePrompt = 'informacion';
        var policy = getSavedImpactoPolicy();
        var modalCtl = { skipDismiss: false };

        var existing = document.getElementById(OVERLAY_ID);
        if (existing && typeof window.closeModal === 'function') {
            window.closeModal(existing);
        }

        var overlay = window.openModal({
            overlayId: OVERLAY_ID,
            title: 'Antes de editar los recursos',
            bodyHtml: buildRecursosImpactoBodyHtml(policy),
            size: 'lg',
            closeOnOverlayClick: false,
            onClose: function () {
                if (modalCtl.skipDismiss) return;
                dismissRecursosWarningModal(sectionBeforePrompt);
            },
            footerLeftHtml:
                '<label class="ubits-checkbox ubits-checkbox--sm ec-recursos-impacto__check">' +
                '<input type="checkbox" class="ubits-checkbox__input" id="ec-recursos-impacto-ack" />' +
                '<span class="ubits-checkbox__box" aria-hidden="true"><i class="fas fa-check"></i><i class="fas fa-minus"></i></span>' +
                '<span class="ubits-checkbox__label ubits-body-sm-regular">Entiendo el impacto que pueden tener estas ediciones en el progreso de los estudiantes, rutas, planes y certificados.</span>' +
                '</label>',
            footerHtml:
                '<button type="button" class="ubits-button ubits-button--secondary ubits-button--md" id="' +
                OVERLAY_ID +
                '-secondary"><span>Salir sin editar</span></button>' +
                '<button type="button" class="ubits-button ubits-button--primary ubits-button--md" id="' +
                OVERLAY_ID +
                '-primary" disabled><span>Sí, editar</span></button>'
        });

        if (!overlay) return;

        function closeOverlayOnly() {
            if (typeof window.closeModal === 'function') {
                window.closeModal(overlay);
            }
        }

        function selectedPolicy() {
            var checked = overlay.querySelector('input[name="ec-recursos-impacto-policy"]:checked');
            return checked && checked.value === 'afectar' ? 'afectar' : 'proteger';
        }

        function syncPrimaryEnabled() {
            var ackInput = overlay.querySelector('#ec-recursos-impacto-ack');
            var primary = overlay.querySelector('#' + OVERLAY_ID + '-primary');
            if (primary) primary.disabled = !(ackInput && ackInput.checked);
        }

        function confirmRecursosEdit() {
            var ackInput = overlay.querySelector('#ec-recursos-impacto-ack');
            if (!ackInput || !ackInput.checked) return;
            saveImpactoPolicy(selectedPolicy());
            editState.recursosUnlocked = true;
            modalCtl.skipDismiss = true;
            closeOverlayOnly();
            applyEditSection('recursos');
        }

        function dismissRecursosEdit() {
            modalCtl.skipDismiss = true;
            closeOverlayOnly();
            dismissRecursosWarningModal(sectionBeforePrompt);
        }

        var primaryBtn = overlay.querySelector('#' + OVERLAY_ID + '-primary');
        var secondaryBtn = overlay.querySelector('#' + OVERLAY_ID + '-secondary');
        var ack = overlay.querySelector('#ec-recursos-impacto-ack');

        if (ack) {
            ack.addEventListener('change', syncPrimaryEnabled);
        }
        syncPrimaryEnabled();

        overlay.querySelectorAll('input[name="ec-recursos-impacto-policy"]').forEach(function (inp) {
            inp.addEventListener('change', function () {
                overlay.querySelectorAll('.ec-recursos-impacto__policies .ubits-selection-card').forEach(function (card) {
                    var radio = card.querySelector('input[type="radio"]');
                    card.classList.toggle('is-selected', !!(radio && radio.checked));
                });
                var isAfectar = selectedPolicy() === 'afectar';
                var finalizaronStat = overlay.querySelector('.ec-recursos-impacto__stat--finalizaron');
                var statsWrap = overlay.querySelector('.ec-recursos-impacto__stats');
                if (finalizaronStat) finalizaronStat.hidden = !isAfectar;
                if (statsWrap) statsWrap.classList.toggle('ec-recursos-impacto__stats--afectar', isAfectar);
            });
        });

        if (primaryBtn) {
            primaryBtn.addEventListener('click', function (ev) {
                ev.preventDefault();
                ev.stopPropagation();
                confirmRecursosEdit();
            });
        }

        if (secondaryBtn) {
            secondaryBtn.addEventListener('click', function (ev) {
                ev.preventDefault();
                ev.stopPropagation();
                dismissRecursosEdit();
            });
        }
    }

    function enterRecursosSection() {
        if (window.CrearContenidoPageApi) {
            window.CrearContenidoPageApi.goToCrearContenidoPageStep(1, { skipUrl: true });
        }
    }

    function applyReadonlyMode() {
        if (!editState.readonly) return;
        document.body.classList.add('page-editar-contenido--readonly');
    }

    function wireClosePin() {
        var closeBtn = document.getElementById('editar-contenido-close-to-contenidos');
        if (!closeBtn) return;
        closeBtn.addEventListener('click', function () {
            try {
                sessionStorage.setItem(
                    SS_PIN_KEY,
                    JSON.stringify({
                        id: editState.contentId,
                        titulo: editState.record && editState.record.titulo,
                        visibilidad: editState.record && editState.record.visibilidadLms
                    })
                );
            } catch (e) {}
        });
    }

    function applyVisibilidadEditRules() {
        var vis = editState.record && editState.record.visibilidadLms ? editState.record.visibilidadLms : 'Público';
        if (typeof window.applyCrearContenidoVisibilidadForEdit === 'function') {
            window.applyCrearContenidoVisibilidadForEdit(vis);
            return;
        }
        var borradorCard = document.querySelector('[data-visibilidad="borrador"]');
        if (borradorCard) {
            borradorCard.classList.add('ubits-selection-card--disabled');
            var borradorInp = borradorCard.querySelector('input[type="radio"]');
            if (borradorInp) {
                borradorInp.disabled = true;
                borradorInp.checked = false;
            }
        }
        var map = {
            Público: 'publico',
            Publico: 'publico',
            Publicado: 'publico',
            Privado: 'privado',
            Oculto: 'oculto',
            Archivado: 'oculto'
        };
        var val = map[vis] || 'publico';
        document.querySelectorAll('input[name="crear-contenido-visibilidad"]').forEach(function (inp) {
            inp.checked = inp.value === val;
        });
    }

    function hashToSection() {
        if (typeof window.parseEditarContenidoHash === 'function') {
            return window.parseEditarContenidoHash(window.location.hash).section;
        }
        var h = (location.hash || '').replace(/^#/, '');
        if (h === 'informacion' || h === 'portada') return 'informacion';
        if (h === 'recursos') return 'recursos';
        if (h === 'certificado') return 'certificado';
        if (
            h === 'ajustes' ||
            h === 'ajustes-visibilidad' ||
            h === 'ajustes-pesos' ||
            h === 'configuracion' ||
            h === 'configuracion-visibilidad' ||
            h === 'configuracion-pesos' ||
            h === 'visibilidad' ||
            h === 'publicacion'
        ) {
            return 'visibilidad';
        }
        if (h === 'resultados' || h.indexOf('resultados-') === 0) return 'resultados';
        return 'resultados';
    }

    function initEditarContenidoPage() {
        window.CC_PUBLISHED_EDIT_MODE = true;

        editState.contentId = getQueryParam('id') || 'f007';
        editState.readonly = getQueryParam('readonly') === '1';
        editState.record = findContentRecord(editState.contentId);

        if (!editState.record) {
            if (typeof window.showToast === 'function') {
                window.showToast('error', 'No se encontró el contenido.');
            }
            return;
        }

        var titleEl = document.getElementById('editar-contenido-title');
        if (titleEl) titleEl.textContent = editState.record.titulo || editState.record.title || 'Editar contenido';

        var visLabel = visibilidadLabelFromRecord(editState.record);
        updateHeaderTag(visLabel);
        window.CC_EDIT_INITIAL_VISIBILIDAD = visLabel;

        if (window.CrearContenidoPageApi && typeof window.CrearContenidoPageApi.initCrearContenidoEditorCore === 'function') {
            window.CrearContenidoPageApi.initCrearContenidoEditorCore();
        } else if (window.CrearContenidoPageApi) {
            window.CrearContenidoPageApi.initCrearContenidoPage();
        }

        applyVisibilidadEditRules();

        if (window.CrearContenidoPageApi && typeof window.CrearContenidoPageApi.hydrateFromContentRecord === 'function') {
            window.CrearContenidoPageApi.hydrateFromContentRecord(editState.record, function () {
                applyVisibilidadEditRules();
            });
        }

        if (typeof window.initEditarContenidoResultados === 'function') {
            window.initEditarContenidoResultados({
                contentId: editState.contentId,
                contentTitle: editState.record.titulo || editState.record.title,
                visibilidadLabel: visLabel
            });
        }

        wireEditarContenidoStepper();

        applyReadonlyMode();
        wireClosePin();

        var initial = hashToSection();
        if (initial === 'recursos' && !editState.readonly) {
            showEditSection('recursos', { dismissTo: 'informacion' });
        } else {
            showEditSection(initial);
        }
        if (
            initial === 'resultados' &&
            typeof window.syncEditarContenidoResultadosTab === 'function' &&
            typeof window.parseResultadosTabFromHash === 'function'
        ) {
            window.syncEditarContenidoResultadosTab(window.parseResultadosTabFromHash(window.location.hash));
        }

        window.addEventListener('hashchange', function () {
            if (document.getElementById('ec-recursos-warn-modal')) return;
            var section = hashToSection();
            showEditSection(section);
            if (
                section === 'resultados' &&
                typeof window.syncEditarContenidoResultadosTab === 'function' &&
                typeof window.parseResultadosTabFromHash === 'function'
            ) {
                window.syncEditarContenidoResultadosTab(window.parseResultadosTabFromHash(window.location.hash));
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initEditarContenidoPage);
    } else {
        initEditarContenidoPage();
    }
})();
