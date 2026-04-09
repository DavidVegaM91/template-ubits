/**
 * UBITS — Sidebar contenidos LMS
 * Misma estructura que el Sidebar global (aside.sidebar + sidebar-main + sidebar-body + nav-button).
 * Iconos + data-tooltip como en sidebar.js; fondo claro vía .sidebar--contenidos-lms en CSS.
 *
 * Bugs / notas:
 * - Requiere styles.css (nav-button) + sidebar-contenidos-lms.css.
 * - Sin tooltip.js + tooltip.css los tooltips no funcionan.
 * - Inicialización alineada con sidebar.js: posición derecha, sin flecha, delay 200ms, setTimeout 50ms antes de initTooltip.
 * - Footer “Expandir”: ensancha el rail y muestra el texto del paso; con data-tooltip vacío no se muestra tooltip al hover.
 *
 * Variantes (options.variant):
 * - publicado-lms-creator (default): Resultados → Información → Recursos → Certificado → Visibilidad.
 * - publicado-antiguo-lms: sin Resultados; paso recursos con icono fa-layer-group y etiqueta “Módulos” (id interno sigue siendo recursos).
 */
(function () {
    'use strict';

    /** @type {Record<string, Array<{ id: string, tooltip: string, icon: string }>>} */
    var VARIANT_STEPS = {
        'publicado-lms-creator': [
            { id: 'resultados', tooltip: 'Resultados', icon: 'fa-chart-mixed' },
            { id: 'informacion', tooltip: 'Información', icon: 'fa-circle-info' },
            { id: 'recursos', tooltip: 'Recursos', icon: 'fa-layer-group' },
            { id: 'certificado', tooltip: 'Certificado', icon: 'fa-award' },
            { id: 'visibilidad', tooltip: 'Visibilidad', icon: 'fa-eye' }
        ],
        'publicado-antiguo-lms': [
            { id: 'informacion', tooltip: 'Información', icon: 'fa-circle-info' },
            { id: 'recursos', tooltip: 'Módulos', icon: 'fa-layer-group' },
            { id: 'certificado', tooltip: 'Certificado', icon: 'fa-award' },
            { id: 'visibilidad', tooltip: 'Visibilidad', icon: 'fa-eye' }
        ]
    };

    var DEFAULT_VARIANT = 'publicado-lms-creator';

    var lastRoot = null;

    function getStepsForVariant(variant) {
        var key = variant && VARIANT_STEPS[variant] ? variant : DEFAULT_VARIANT;
        return VARIANT_STEPS[key].slice();
    }

    function stepTooltipById(steps, stepId) {
        for (var i = 0; i < steps.length; i++) {
            if (steps[i].id === stepId) return steps[i].tooltip;
        }
        return '';
    }

    function normalizeActiveStep(steps, activeStep) {
        for (var i = 0; i < steps.length; i++) {
            if (steps[i].id === activeStep) return activeStep;
        }
        return steps.length ? steps[0].id : '';
    }

    function escapeAttr(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;');
    }

    function renderButton(step, isActive) {
        var activeClass = isActive ? ' active' : '';
        var ariaCurrent = isActive ? ' aria-current="page"' : '';
        return (
            '<button type="button" class="nav-button' + activeClass + '"' +
            ' data-step="' + escapeAttr(step.id) + '"' +
            ' aria-label="' + escapeAttr(step.tooltip) + '"' +
            ' data-tooltip="' + escapeAttr(step.tooltip) + '"' +
            ariaCurrent + '>' +
            '<i class="far ' + escapeAttr(step.icon) + '" aria-hidden="true"></i>' +
            '<span class="sidebar-contenidos-lms__step-label ubits-body-sm-regular">' +
            escapeAttr(step.tooltip) +
            '</span>' +
            '</button>'
        );
    }

    function applyContenidosLmsExpandedState(root, expanded) {
        var steps = root._sclSteps || getStepsForVariant(root.getAttribute('data-variant') || DEFAULT_VARIANT);
        root.classList.toggle('sidebar--contenidos-lms--expanded', expanded);
        root.querySelectorAll('.sidebar-body .nav-button[data-step]').forEach(function (btn) {
            var id = btn.getAttribute('data-step');
            if (expanded) {
                btn.setAttribute('data-tooltip', '');
            } else if (id) {
                btn.setAttribute('data-tooltip', stepTooltipById(steps, id));
            }
        });
        var toggleBtn = root.querySelector('.sidebar-contenidos-lms__toggle');
        if (toggleBtn) {
            toggleBtn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
            toggleBtn.setAttribute('data-tooltip', expanded ? '' : 'Expandir');
        }
    }

    function wireExpandToggle(root, containerId) {
        var toggleBtn = root.querySelector('.sidebar-contenidos-lms__toggle');
        if (!toggleBtn) return;
        toggleBtn.addEventListener('click', function () {
            var expanded = !root.classList.contains('sidebar--contenidos-lms--expanded');
            applyContenidosLmsExpandedState(root, expanded);
            scheduleContenidosLmsTooltips(containerId);
        });
    }

    function wireClicks(root, onSelect) {
        root.querySelectorAll('.sidebar-body .nav-button[data-step]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var stepId = btn.getAttribute('data-step');
                if (!stepId) return;
                setSidebarContenidosLmsActive(root, stepId);
                if (typeof onSelect === 'function') onSelect(stepId);
            });
        });
    }

    /**
     * @param {string} containerId
     * @param {{ activeStep?: string, onSelect?: function(string): void, variant?: 'publicado-lms-creator'|'publicado-antiguo-lms' }} [options]
     */
    function loadSidebarContenidosLms(containerId, options) {
        options = options || {};
        var variant = options.variant && VARIANT_STEPS[options.variant] ? options.variant : DEFAULT_VARIANT;
        var steps = getStepsForVariant(variant);
        var activeStep = normalizeActiveStep(steps, options.activeStep || (steps[0] && steps[0].id) || '');
        var onSelect = options.onSelect;

        var el = document.getElementById(containerId);
        if (!el) {
            console.error('loadSidebarContenidosLms: no existe #' + containerId);
            return;
        }

        var buttonsHtml = steps.map(function (s) {
            return renderButton(s, s.id === activeStep);
        }).join('');

        el.innerHTML =
            '<aside id="' + escapeAttr(containerId) + '-aside" class="sidebar sidebar--contenidos-lms" data-variant="' + escapeAttr(variant) + '" aria-label="Pasos de creación de contenido">' +
            '<div class="sidebar-main">' +
            '<div class="sidebar-body">' +
            buttonsHtml +
            '</div></div>' +
            '<div class="sidebar-contenidos-lms__footer">' +
            '<button type="button" class="nav-button sidebar-contenidos-lms__toggle" aria-expanded="false" aria-label="Expandir o contraer la lista de pasos" data-tooltip="Expandir">' +
            '<i class="far fa-angles-right sidebar-contenidos-lms__toggle-icon-collapsed" aria-hidden="true"></i>' +
            '<i class="far fa-angles-left sidebar-contenidos-lms__toggle-icon-expanded" aria-hidden="true"></i>' +
            '<span class="sidebar-contenidos-lms__toggle-label-collapsed ubits-body-sm-regular">Expandir</span>' +
            '<span class="sidebar-contenidos-lms__toggle-label-expanded ubits-body-sm-regular">Contraer</span>' +
            '</button></div></aside>';

        lastRoot = el.querySelector('.sidebar.sidebar--contenidos-lms');
        if (lastRoot) {
            lastRoot._sclSteps = steps;
            wireClicks(lastRoot, onSelect);
            wireExpandToggle(lastRoot, containerId);
        }

        scheduleContenidosLmsTooltips(containerId);
    }

    /**
     * Misma configuración que initSidebarTooltips en sidebar.js (posición derecha, sin cola, 200ms).
     */
    function applyContenidosLmsTooltipAttrs(root) {
        if (!root) return;
        root.querySelectorAll('.nav-button[data-tooltip]').forEach(function (btn) {
            btn.setAttribute('data-tooltip-no-arrow', '');
            btn.setAttribute('data-tooltip-position', 'right');
            btn.setAttribute('data-tooltip-align', 'center');
            btn.setAttribute('data-tooltip-delay', '200');
        });
    }

    function tryInitContenidosLmsTooltips(containerId) {
        if (typeof window.initTooltip !== 'function') return false;
        var el = document.getElementById(containerId);
        if (!el) return false;
        var root = el.querySelector('.sidebar.sidebar--contenidos-lms');
        if (!root) return false;
        applyContenidosLmsTooltipAttrs(root);
        var sel = '#' + containerId + ' .sidebar--contenidos-lms .nav-button[data-tooltip]';
        try {
            window.initTooltip(sel);
        } catch (e) {
            return false;
        }
        return true;
    }

    function scheduleContenidosLmsTooltips(containerId) {
        setTimeout(function () {
            if (!tryInitContenidosLmsTooltips(containerId)) {
                setTimeout(function () {
                    tryInitContenidosLmsTooltips(containerId);
                }, 400);
            }
        }, 50);
    }

    /**
     * @param {HTMLElement|string} rootOrContainerId
     * @param {string} stepId
     */
    function setSidebarContenidosLmsActive(rootOrContainerId, stepId) {
        var root =
            typeof rootOrContainerId === 'string'
                ? document.querySelector('#' + rootOrContainerId + ' .sidebar.sidebar--contenidos-lms')
                : rootOrContainerId;
        if (!root || !root.classList.contains('sidebar--contenidos-lms')) {
            root = lastRoot;
        }
        if (!root) return;

        root.querySelectorAll('.sidebar-body .nav-button[data-step]').forEach(function (btn) {
            var id = btn.getAttribute('data-step');
            var active = id === stepId;
            btn.classList.toggle('active', active);
            if (active) btn.setAttribute('aria-current', 'page');
            else btn.removeAttribute('aria-current');
        });
    }

    window.loadSidebarContenidosLms = loadSidebarContenidosLms;
    window.setSidebarContenidosLmsActive = setSidebarContenidosLmsActive;
    window.SIDEBAR_CONTENIDOS_LMS_VARIANTS = Object.keys(VARIANT_STEPS);
})();
