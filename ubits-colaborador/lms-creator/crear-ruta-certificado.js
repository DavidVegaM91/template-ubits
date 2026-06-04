/**
 * LMS Creator — Paso Certificado (crear-ruta.html).
 * Mock plantillas Fiqsha, switch, select y vista previa orientativa.
 */
(function () {
    'use strict';

    var STEP_INITED = false;
    var certificadoEnabled = true;
    var selectedTemplateId = '';
    var templateSelectApi = null;

    var CERTIFICADO_REPRESENTANTES = {
        patricia: {
            name: 'Patricia Elena Bermúdez Ríos',
            role: 'Gerente General',
            imageSrc: '../../images/lms-creator/certificados/firma-patricia.webp'
        },
        carmenRosa: {
            name: 'Carmen Rosa Díaz Herrera',
            role: 'Jefa de Recursos Humanos',
            imageSrc: '../../images/lms-creator/certificados/firma-carmen.webp'
        }
    };

    var FIQSHA_CERTIFICATE_TEMPLATES = [
        {
            id: 'tpl-doble-firma',
            name: 'Cursos empresariales con doble firma',
            secondSignature: true,
            studyTime: true,
            documentId: false,
            signatoryPrimary: 'patricia',
            signatorySecondary: 'carmenRosa'
        },
        {
            id: 'tpl-estandar',
            name: 'Certificado estándar Fiqsha',
            secondSignature: false,
            studyTime: true,
            documentId: true,
            signatoryPrimary: 'patricia',
            signatorySecondary: null
        },
        {
            id: 'tpl-onboarding',
            name: 'Onboarding colaboradores',
            secondSignature: false,
            studyTime: false,
            documentId: false,
            signatoryPrimary: 'carmenRosa',
            signatorySecondary: null
        }
    ];

    var MONTHS_ES = [
        'enero',
        'febrero',
        'marzo',
        'abril',
        'mayo',
        'junio',
        'julio',
        'agosto',
        'septiembre',
        'octubre',
        'noviembre',
        'diciembre'
    ];

    function escapeHtml(str) {
        return String(str == null ? '' : str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function getDefaultTemplateId() {
        return FIQSHA_CERTIFICATE_TEMPLATES.length ? FIQSHA_CERTIFICATE_TEMPLATES[0].id : '';
    }

    function getTemplateById(id) {
        for (var i = 0; i < FIQSHA_CERTIFICATE_TEMPLATES.length; i++) {
            if (FIQSHA_CERTIFICATE_TEMPLATES[i].id === id) return FIQSHA_CERTIFICATE_TEMPLATES[i];
        }
        return FIQSHA_CERTIFICATE_TEMPLATES[0] || null;
    }

    function readContainerSelectText(containerId) {
        var root = document.getElementById(containerId);
        if (!root) return '';
        var inp = root.querySelector('input[type="text"][readonly], input.ubits-input__field');
        if (inp && inp.value) return String(inp.value).trim();
        var hidden = root.querySelector('input:not([type="hidden"])');
        return hidden ? String(hidden.value || '').trim() : '';
    }

    function formatCertificadoDate(d) {
        return d.getDate() + ' de ' + MONTHS_ES[d.getMonth()] + ' de ' + d.getFullYear();
    }

    function formatDuracionLine(minutes) {
        var t = parseInt(minutes, 10);
        if (isNaN(t) || t <= 0) t = 30;
        var unitWord = t === 1 ? 'minuto' : 'minutos';
        return 'Con una duración de ' + t + ' ' + unitWord;
    }

    function parseDurationMinutesFromItem(item) {
        if (!item) return 0;
        var raw = item.duration != null ? String(item.duration) : '';
        var match = raw.match(/(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
    }

    function getRutaDurationMinutes() {
        var items =
            typeof window.getCrearRutaContenidosItems === 'function'
                ? window.getCrearRutaContenidosItems()
                : [];
        var total = 0;
        items.forEach(function (c) {
            total += parseDurationMinutesFromItem(c);
        });
        return total > 0 ? total : 30;
    }

    function getContentPreviewSnapshot() {
        var tituloEl = document.getElementById('crear-ruta-titulo');
        var title =
            tituloEl && tituloEl.value.trim()
                ? tituloEl.value.trim()
                : 'Ruta de aprendizaje';
        var categoriaRaw =
            readContainerSelectText('crear-ruta-in-categoria') || 'Gestión de conflictos';
        if (categoriaRaw === 'Selecciona una opción') categoriaRaw = 'Gestión de conflictos';
        var categoria =
            typeof window.resolveCategoriaFiqshaLabel === 'function'
                ? window.resolveCategoriaFiqshaLabel(categoriaRaw)
                : categoriaRaw;
        return {
            title: title,
            studentName: 'Nombre del estudiante',
            dateLabel: formatCertificadoDate(new Date()),
            durationLine: formatDuracionLine(getRutaDurationMinutes()),
            categoryLabel: categoria
        };
    }

    function getCertificadoRepresentante(key) {
        var rep = key && CERTIFICADO_REPRESENTANTES[key] ? CERTIFICADO_REPRESENTANTES[key] : null;
        if (rep) return rep;
        return {
            name: 'Nombre del representante',
            role: 'Cargo del representante',
            imageSrc: null
        };
    }

    function buildSignatureBlock(signatoryKey) {
        var rep = getCertificadoRepresentante(signatoryKey);
        var visual = rep.imageSrc
            ? '<img class="certificado-paso__preview-signature-img" src="' +
              escapeHtml(rep.imageSrc) +
              '" alt="" loading="lazy" />'
            : '<div class="certificado-paso__preview-signature-line" aria-hidden="true"></div>';
        return (
            '<div class="certificado-paso__preview-signature">' +
            visual +
            '<p class="certificado-paso__preview-signature-name">' +
            escapeHtml(rep.name) +
            '</p>' +
            '<p class="certificado-paso__preview-signature-role">' +
            escapeHtml(rep.role) +
            '</p>' +
            '</div>'
        );
    }

    function renderCertificatePreviewHtml(template, snap) {
        var tpl = template || {};
        var sigMod =
            tpl.secondSignature && tpl.signatorySecondary
                ? ' certificado-paso__preview-signatures--double'
                : ' certificado-paso__preview-signatures--single';
        var signatures =
            '<div class="certificado-paso__preview-signatures' +
            sigMod +
            '">' +
            buildSignatureBlock(tpl.signatoryPrimary || 'patricia');
        if (tpl.secondSignature && tpl.signatorySecondary) {
            signatures += buildSignatureBlock(tpl.signatorySecondary);
        }
        signatures += '</div>';

        var docLine =
            template && template.documentId
                ? '<p class="certificado-paso__preview-doc">Documento: ##########</p>'
                : '';

        var durationHtml =
            template && template.studyTime !== false
                ? '<p class="certificado-paso__preview-meta">' + escapeHtml(snap.durationLine) + '</p>'
                : '';

        return (
            '<div class="certificado-paso__preview-frame">' +
            '<article class="certificado-paso__preview-sheet" aria-label="Vista previa del certificado">' +
            '<img class="certificado-paso__preview-logo" src="../../images/Client-logo.png" alt="Fiqsha" />' +
            '<div class="certificado-paso__preview-main">' +
            '<div class="certificado-paso__preview-section certificado-paso__preview-section--identity">' +
            '<p class="certificado-paso__preview-date">' +
            escapeHtml(snap.dateLabel) +
            '</p>' +
            '<p class="certificado-paso__preview-student">' +
            escapeHtml(snap.studentName) +
            '</p>' +
            '</div>' +
            '<div class="certificado-paso__preview-section certificado-paso__preview-section--course">' +
            '<p class="certificado-paso__preview-lead">Finalizó satisfactoriamente la ruta:</p>' +
            '<p class="certificado-paso__preview-course-title">' +
            escapeHtml(snap.title) +
            '</p>' +
            '</div>' +
            '<div class="certificado-paso__preview-section certificado-paso__preview-section--meta">' +
            durationHtml +
            '<p class="certificado-paso__preview-meta">' +
            '<span class="certificado-paso__preview-category-label">Categoría:</span> ' +
            escapeHtml(snap.categoryLabel) +
            '</p>' +
            '</div>' +
            '</div>' +
            signatures +
            '<div class="certificado-paso__preview-footer">' +
            '<p class="certificado-paso__preview-code">Código No. ##########</p>' +
            '<p class="certificado-paso__preview-disclaimer">UBITS confirma la identidad de la persona y su finalización de esta ruta</p>' +
            docLine +
            '</div>' +
            '</article>' +
            '</div>'
        );
    }

    function renderDisabledEmptyState() {
        var host = document.getElementById('certificado-paso-preview-host');
        if (!host) return;
        host.className = 'certificado-paso__preview-host';
        host.innerHTML = '<div id="certificado-paso-preview-empty"></div>';
        if (typeof window.loadEmptyState === 'function') {
            window.loadEmptyState('certificado-paso-preview-empty', {
                icon: 'fa-award',
                iconSize: 'md',
                title: 'No has habilitado un certificado',
                description: 'Si deseas, puedes activar un certificado para esta ruta.'
            });
        }
    }

    function renderEnabledPreview() {
        var host = document.getElementById('certificado-paso-preview-host');
        if (!host) return;
        host.className = 'certificado-paso__preview-host';
        var tpl = getTemplateById(selectedTemplateId);
        var snap = getContentPreviewSnapshot();
        host.innerHTML = renderCertificatePreviewHtml(tpl, snap);
    }

    function syncTemplateFieldVisibility() {
        var field = document.getElementById('certificado-paso-template-field');
        var hint = document.getElementById('certificado-paso-preview-hint');
        if (field) field.hidden = !certificadoEnabled;
        if (hint) hint.hidden = !certificadoEnabled;
    }

    function refreshCrearRutaCertificadoUI() {
        syncTemplateFieldVisibility();
        var toggle = document.getElementById('certificado-paso-toggle');
        if (toggle) toggle.checked = certificadoEnabled;
        if (!certificadoEnabled) {
            renderDisabledEmptyState();
            return;
        }
        renderEnabledPreview();
    }

    function mountTemplateSelect() {
        var mount = document.getElementById('certificado-paso-template-mount');
        if (!mount || typeof window.createInput !== 'function') return;
        if (!selectedTemplateId) selectedTemplateId = getDefaultTemplateId();
        var opts = FIQSHA_CERTIFICATE_TEMPLATES.map(function (t) {
            return { value: t.id, text: t.name };
        });
        mount.innerHTML = '';
        templateSelectApi = window.createInput({
            containerId: 'certificado-paso-template-mount',
            type: 'select',
            label: 'Seleccionar plantilla de certificado',
            placeholder: 'Selecciona una plantilla…',
            size: 'sm',
            selectOptions: opts,
            value: selectedTemplateId,
            onChange: function (val) {
                selectedTemplateId = val || getDefaultTemplateId();
                if (certificadoEnabled) renderEnabledPreview();
            }
        });
    }

    function pageIsCertificadoVisible() {
        var el = document.getElementById('crear-ruta-step-certificado');
        return el && el.classList.contains('crear-contenido-step--visible');
    }

    function wireCertificadoInteractions() {
        var toggle = document.getElementById('certificado-paso-toggle');
        if (toggle && !toggle.dataset.certificadoWired) {
            toggle.dataset.certificadoWired = '1';
            toggle.addEventListener('change', function () {
                certificadoEnabled = !!toggle.checked;
                refreshCrearRutaCertificadoUI();
            });
        }
        var titulo = document.getElementById('crear-ruta-titulo');
        if (titulo && !titulo.dataset.certificadoPreviewWired) {
            titulo.dataset.certificadoPreviewWired = '1';
            titulo.addEventListener('input', function () {
                if (certificadoEnabled && pageIsCertificadoVisible()) renderEnabledPreview();
            });
        }
        var catRoot = document.getElementById('crear-ruta-in-categoria');
        if (catRoot && !catRoot.dataset.certificadoPreviewWired) {
            catRoot.dataset.certificadoPreviewWired = '1';
            catRoot.addEventListener('change', function () {
                if (certificadoEnabled && pageIsCertificadoVisible()) renderEnabledPreview();
            });
            catRoot.addEventListener('input', function () {
                if (certificadoEnabled && pageIsCertificadoVisible()) renderEnabledPreview();
            });
        }
    }

    function initCrearRutaCertificadoStepOnce() {
        wireCertificadoInteractions();
        if (STEP_INITED) {
            refreshCrearRutaCertificadoUI();
            return;
        }
        STEP_INITED = true;
        certificadoEnabled = true;
        selectedTemplateId = getDefaultTemplateId();
        mountTemplateSelect();
        refreshCrearRutaCertificadoUI();
    }

    window.initCrearRutaCertificadoStepOnce = initCrearRutaCertificadoStepOnce;
    window.refreshCrearRutaCertificadoUI = refreshCrearRutaCertificadoUI;
    window.getCrearRutaCertificadoEnabled = function () {
        return certificadoEnabled;
    };
})();
