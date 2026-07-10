/**
 * LMS Creator — editar-contenido.html (orquestador)
 */
(function () {
    'use strict';

    var SS_RECURSOS_WARN = 'ubits-lms-edit-recursos-warning-dismissed';
    var SS_PIN_KEY = 'ubits-contenidos-pin-recien-creado';

    var editState = {
        contentId: '',
        record: null,
        readonly: false,
        activeSection: 'resultados',
        previousSectionBeforeRecursos: 'informacion'
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
        visibilidad: '#visibilidad'
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
        if (typeof window.setSidebarContenidosLmsActive === 'function') {
            window.setSidebarContenidosLmsActive('editar-contenido-sidebar-host', sectionId);
        }
        editState.activeSection = sectionId;

        if (sectionId === 'recursos') {
            enterRecursosSection();
        } else if (sectionId === 'visibilidad') {
            if (window.CrearContenidoPageApi) {
                window.CrearContenidoPageApi.goToCrearContenidoPageStep(3, { skipUrl: true });
            }
            applyVisibilidadEditRules();
        } else if (sectionId === 'resultados') {
            document.querySelectorAll('#editar-contenido-root .crear-contenido-step[data-crear-step]').forEach(function (el) {
                el.classList.remove('crear-contenido-step--visible');
            });
        } else if (SECTION_TO_STEP[sectionId] != null && window.CrearContenidoPageApi) {
            window.CrearContenidoPageApi.goToCrearContenidoPageStep(SECTION_TO_STEP[sectionId], { skipUrl: true });
        }

        var hash = HASH_SECTION[sectionId];
        if (hash) {
            history.replaceState(null, '', location.pathname + location.search + hash);
        }
    }

    function shouldShowRecursosWarning() {
        if (editState.readonly) return false;
        try {
            if (sessionStorage.getItem(SS_RECURSOS_WARN) === '1') return false;
        } catch (e) {}
        return typeof window.openModal === 'function';
    }

    function dismissRecursosWarningModal(previousSection) {
        applyEditSection(previousSection || editState.activeSection || 'informacion');
    }

    function showEditSection(sectionId) {
        if (sectionId === 'recursos' && shouldShowRecursosWarning()) {
            if (editState.activeSection !== 'recursos') {
                editState.previousSectionBeforeRecursos = editState.activeSection;
            }
            openRecursosWarningModal();
            return;
        }
        applyEditSection(sectionId);
    }

    function openRecursosWarningModal() {
        var OVERLAY_ID = 'ec-recursos-warn-modal';
        var sectionBeforePrompt = editState.activeSection;

        var existing = document.getElementById(OVERLAY_ID);
        if (existing && typeof window.closeModal === 'function') {
            window.closeModal(existing);
        }

        var overlay = window.openModal({
            overlayId: OVERLAY_ID,
            title: 'Advertencia sobre edición',
            bodyHtml:
                '<p class="ubits-body-md-regular">Este contenido ya ha sido publicado. Solo puedes realizar cambios limitados, como editar textos. No es posible eliminar ni agregar nuevos elementos. Las modificaciones que realices serán visibles para los estudiantes de forma inmediata.</p>',
            size: 'md',
            closeOnOverlayClick: false,
            onClose: function () {
                dismissRecursosWarningModal(sectionBeforePrompt);
            },
            footerHtml:
                '<button type="button" class="ubits-button ubits-button--secondary ubits-button--md" id="' +
                OVERLAY_ID +
                '-secondary"><span>Salir sin editar</span></button>' +
                '<button type="button" class="ubits-button ubits-button--primary ubits-button--md" id="' +
                OVERLAY_ID +
                '-primary"><span>Sí, editar</span></button>'
        });

        if (!overlay) return;

        function closeOverlayOnly() {
            if (typeof window.closeModal === 'function') {
                window.closeModal(overlay);
            }
        }

        function confirmRecursosEdit() {
            try {
                sessionStorage.setItem(SS_RECURSOS_WARN, '1');
            } catch (e) {}
            closeOverlayOnly();
            applyEditSection('recursos');
        }

        function dismissRecursosEdit() {
            closeOverlayOnly();
            dismissRecursosWarningModal(sectionBeforePrompt);
        }

        var primaryBtn = overlay.querySelector('#' + OVERLAY_ID + '-primary');
        var secondaryBtn = overlay.querySelector('#' + OVERLAY_ID + '-secondary');

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
        var h = (location.hash || '').replace(/^#/, '');
        if (h === 'informacion' || h === 'portada') return 'informacion';
        if (h === 'recursos') return 'recursos';
        if (h === 'certificado') return 'certificado';
        if (h === 'visibilidad' || h === 'publicacion') return 'visibilidad';
        if (h === 'resultados') return 'resultados';
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

        if (typeof window.loadSidebarContenidosLms === 'function') {
            window.loadSidebarContenidosLms('editar-contenido-sidebar-host', {
                variant: 'publicado-lms-creator',
                activeStep: 'resultados',
                onSelect: function (stepId) {
                    showEditSection(stepId);
                }
            });
        }

        applyReadonlyMode();
        wireClosePin();

        var initial = hashToSection();
        showEditSection(initial);

        window.addEventListener('hashchange', function () {
            showEditSection(hashToSection());
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initEditarContenidoPage);
    } else {
        initEditarContenidoPage();
    }
})();
