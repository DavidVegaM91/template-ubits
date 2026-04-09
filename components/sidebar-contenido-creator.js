/**
 * UBITS — Sidebar contenido creator
 * Misma estructura que el Sidebar global (aside.sidebar + sidebar-main + sidebar-body + nav-button).
 * Iconos + data-tooltip como en sidebar.js; fondo claro vía .sidebar--contenido-creator en CSS.
 *
 * Bugs / notas:
 * - Requiere styles.css (nav-button) + sidebar-contenido-creator.css.
 * - Sin tooltip.js + tooltip.css los tooltips no funcionan.
 * - Inicialización alineada con sidebar.js: posición derecha, sin flecha, delay 200ms, setTimeout 50ms antes de initTooltip.
 * - Footer “Expandir”: ensancha el rail y muestra el texto del paso; con data-tooltip vacío no se muestra tooltip al hover.
 */
(function () {
    'use strict';

    var STEPS = [
        { id: 'resultados', tooltip: 'Resultados', icon: 'fa-chart-mixed' },
        { id: 'informacion', tooltip: 'Información', icon: 'fa-circle-info' },
        { id: 'recursos', tooltip: 'Recursos', icon: 'fa-layer-group' },
        { id: 'certificado', tooltip: 'Certificado', icon: 'fa-award' },
        { id: 'visibilidad', tooltip: 'Visibilidad', icon: 'fa-eye' }
    ];

    var lastRoot = null;

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
            '<button type="button" class="nav-button"' + activeClass +
            ' data-step="' + escapeAttr(step.id) + '"' +
            ' aria-label="' + escapeAttr(step.tooltip) + '"' +
            ' data-tooltip="' + escapeAttr(step.tooltip) + '"' +
            ariaCurrent + '>' +
            '<i class="far ' + escapeAttr(step.icon) + '" aria-hidden="true"></i>' +
            '<span class="sidebar-contenido-creator__step-label ubits-body-sm-regular">' +
            escapeAttr(step.tooltip) +
            '</span>' +
            '</button>'
        );
    }

    function getStepTooltipById(stepId) {
        for (var i = 0; i < STEPS.length; i++) {
            if (STEPS[i].id === stepId) return STEPS[i].tooltip;
        }
        return '';
    }

    function applyContenidoCreatorExpandedState(root, expanded) {
        root.classList.toggle('sidebar--contenido-creator--expanded', expanded);
        root.querySelectorAll('.sidebar-body .nav-button[data-step]').forEach(function (btn) {
            var id = btn.getAttribute('data-step');
            if (expanded) {
                btn.setAttribute('data-tooltip', '');
            } else if (id) {
                btn.setAttribute('data-tooltip', getStepTooltipById(id));
            }
        });
        var toggleBtn = root.querySelector('.sidebar-contenido-creator__toggle');
        if (toggleBtn) {
            toggleBtn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
            toggleBtn.setAttribute('data-tooltip', expanded ? '' : 'Expandir');
        }
    }

    function wireExpandToggle(root, containerId) {
        var toggleBtn = root.querySelector('.sidebar-contenido-creator__toggle');
        if (!toggleBtn) return;
        toggleBtn.addEventListener('click', function () {
            var expanded = !root.classList.contains('sidebar--contenido-creator--expanded');
            applyContenidoCreatorExpandedState(root, expanded);
            scheduleContenidoCreatorTooltips(containerId);
        });
    }

    function wireClicks(root, onSelect) {
        root.querySelectorAll('.sidebar-body .nav-button[data-step]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var stepId = btn.getAttribute('data-step');
                if (!stepId) return;
                setSidebarContenidoCreatorActive(root, stepId);
                if (typeof onSelect === 'function') onSelect(stepId);
            });
        });
    }

    /**
     * @param {string} containerId
     * @param {{ activeStep?: string, onSelect?: function(string): void }} [options]
     */
    function loadSidebarContenidoCreator(containerId, options) {
        options = options || {};
        var activeStep = options.activeStep || STEPS[0].id;
        var onSelect = options.onSelect;

        var el = document.getElementById(containerId);
        if (!el) {
            console.error('loadSidebarContenidoCreator: no existe #' + containerId);
            return;
        }

        var buttonsHtml = STEPS.map(function (s) {
            return renderButton(s, s.id === activeStep);
        }).join('');

        el.innerHTML =
            '<aside id="' + escapeAttr(containerId) + '-aside" class="sidebar sidebar--contenido-creator" aria-label="Pasos de creación de contenido">' +
            '<div class="sidebar-main">' +
            '<div class="sidebar-body">' +
            buttonsHtml +
            '</div></div>' +
            '<div class="sidebar-contenido-creator__footer">' +
            '<button type="button" class="nav-button sidebar-contenido-creator__toggle" aria-expanded="false" aria-label="Expandir o contraer la lista de pasos" data-tooltip="Expandir">' +
            '<i class="far fa-angles-right sidebar-contenido-creator__toggle-icon-collapsed" aria-hidden="true"></i>' +
            '<i class="far fa-angles-left sidebar-contenido-creator__toggle-icon-expanded" aria-hidden="true"></i>' +
            '<span class="sidebar-contenido-creator__toggle-label-collapsed ubits-body-sm-regular">Expandir</span>' +
            '<span class="sidebar-contenido-creator__toggle-label-expanded ubits-body-sm-regular">Contraer</span>' +
            '</button></div></aside>';

        lastRoot = el.querySelector('.sidebar.sidebar--contenido-creator');
        if (lastRoot) {
            wireClicks(lastRoot, onSelect);
            wireExpandToggle(lastRoot, containerId);
        }

        scheduleContenidoCreatorTooltips(containerId);
    }

    /**
     * Misma configuración que initSidebarTooltips en sidebar.js (posición derecha, sin cola, 200ms).
     */
    function applyContenidoCreatorTooltipAttrs(root) {
        if (!root) return;
        root.querySelectorAll('.nav-button[data-tooltip]').forEach(function (btn) {
            btn.setAttribute('data-tooltip-no-arrow', '');
            btn.setAttribute('data-tooltip-position', 'right');
            btn.setAttribute('data-tooltip-align', 'center');
            btn.setAttribute('data-tooltip-delay', '200');
        });
    }

    function tryInitContenidoCreatorTooltips(containerId) {
        if (typeof window.initTooltip !== 'function') return false;
        var el = document.getElementById(containerId);
        if (!el) return false;
        var root = el.querySelector('.sidebar.sidebar--contenido-creator');
        if (!root) return false;
        applyContenidoCreatorTooltipAttrs(root);
        var sel = '#' + containerId + ' .sidebar--contenido-creator .nav-button[data-tooltip]';
        try {
            window.initTooltip(sel);
        } catch (e) {
            return false;
        }
        return true;
    }

    function scheduleContenidoCreatorTooltips(containerId) {
        setTimeout(function () {
            if (!tryInitContenidoCreatorTooltips(containerId)) {
                setTimeout(function () {
                    tryInitContenidoCreatorTooltips(containerId);
                }, 400);
            }
        }, 50);
    }

    /**
     * @param {HTMLElement|string} rootOrContainerId
     * @param {string} stepId
     */
    function setSidebarContenidoCreatorActive(rootOrContainerId, stepId) {
        var root =
            typeof rootOrContainerId === 'string'
                ? document.querySelector('#' + rootOrContainerId + ' .sidebar.sidebar--contenido-creator')
                : rootOrContainerId;
        if (!root || !root.classList.contains('sidebar--contenido-creator')) {
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

    window.loadSidebarContenidoCreator = loadSidebarContenidoCreator;
    window.setSidebarContenidoCreatorActive = setSidebarContenidoCreatorActive;
})();
