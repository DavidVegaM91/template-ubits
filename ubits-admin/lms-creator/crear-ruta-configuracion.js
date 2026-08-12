/**
 * Paso Ajustes — hub Visibilidad + Tipo de navegación (crear ruta).
 * Sin pesos de evaluación (las rutas no tienen evaluaciones propias).
 */
(function (global) {
    'use strict';

    var PANEL = 'hub'; // hub | visibilidad | navegacion
    var TIPO_NAVEGACION = 'lineal'; // lineal | libre
    var wired = false;

    var TIPO_NAVEGACION_LABEL = {
        lineal: 'Lineal',
        libre: 'Libre'
    };

    function getVisibilidadSummary() {
        if (typeof global.getCrearRutaVisibilidad === 'function') {
            var v = global.getCrearRutaVisibilidad();
            var map = {
                borrador: 'Borrador',
                publico: 'Público',
                privado: 'Privado',
                oculto: 'Oculto'
            };
            return map[v] || 'Borrador';
        }
        var checked = document.querySelector('input[name="crear-ruta-visibilidad"]:checked');
        if (!checked) return 'Borrador';
        var map2 = {
            borrador: 'Borrador',
            publico: 'Público',
            privado: 'Privado',
            oculto: 'Oculto'
        };
        return map2[checked.value] || 'Borrador';
    }

    function hashForConfigPanel(panel) {
        if (panel === 'visibilidad') return '#ajustes-visibilidad';
        if (panel === 'navegacion') return '#ajustes-navegacion';
        return '#ajustes';
    }

    function panelFromConfigHash(hash) {
        var h = String(hash || '').replace(/^#/, '');
        if (h === 'ajustes-visibilidad') return 'visibilidad';
        if (h === 'ajustes-navegacion') return 'navegacion';
        if (
            h === 'ajustes' ||
            h === 'visibilidad' ||
            h === 'publicacion'
        ) {
            return 'hub';
        }
        return null;
    }

    function isAjustesHash(hash) {
        var h = String(hash || '').replace(/^#/, '');
        return (
            h === 'ajustes' ||
            h === 'ajustes-visibilidad' ||
            h === 'ajustes-navegacion' ||
            h === 'visibilidad' ||
            h === 'publicacion'
        );
    }

    function syncNavegacionRadios() {
        document
            .querySelectorAll('input[name="crear-ruta-tipo-navegacion"]')
            .forEach(function (input) {
                input.checked = input.value === TIPO_NAVEGACION;
            });
    }

    function refreshHubCards() {
        var visDesc = document.getElementById('cr-config-card-visibilidad-desc');
        var navDesc = document.getElementById('cr-config-card-navegacion-desc');
        if (visDesc) visDesc.textContent = getVisibilidadSummary();
        if (navDesc) navDesc.textContent = TIPO_NAVEGACION_LABEL[TIPO_NAVEGACION] || 'Lineal';
    }

    function setPanel(next, opts) {
        opts = opts || {};
        var hub = document.getElementById('cr-config-hub');
        var pVis = document.getElementById('cr-config-panel-visibilidad');
        var pNav = document.getElementById('cr-config-panel-navegacion');
        var title = document.getElementById('cr-config-step-title');
        if (next === 'navegacion' && !pNav) next = 'hub';
        if (next === 'visibilidad' && !pVis) next = 'hub';
        PANEL = next;
        if (hub) hub.hidden = next !== 'hub';
        if (pVis) pVis.hidden = next !== 'visibilidad';
        if (pNav) pNav.hidden = next !== 'navegacion';
        if (title) title.hidden = next !== 'hub';
        if (next === 'hub') refreshHubCards();
        if (next === 'navegacion') syncNavegacionRadios();
        if (!opts.skipUrl && typeof history.replaceState === 'function') {
            history.replaceState(null, '', location.pathname + location.search + hashForConfigPanel(next));
        }
        if (typeof global.initTooltip === 'function') {
            global.initTooltip('#crear-ruta-root [data-tooltip]');
        }
    }

    function wireOnce() {
        if (wired) return;
        if (!document.getElementById('cr-config-hub')) return;
        wired = true;

        var cardVis = document.getElementById('cr-config-card-visibilidad');
        var cardNav = document.getElementById('cr-config-card-navegacion');
        var backVis = document.getElementById('cr-config-back-visibilidad');
        var backNav = document.getElementById('cr-config-back-navegacion');

        function bindCard(el, panel) {
            if (!el) return;
            el.addEventListener('click', function () {
                setPanel(panel);
            });
            el.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setPanel(panel);
                }
            });
        }

        bindCard(cardVis, 'visibilidad');
        bindCard(cardNav, 'navegacion');

        if (backVis) {
            backVis.addEventListener('click', function () {
                setPanel('hub');
            });
        }
        if (backNav) {
            backNav.addEventListener('click', function () {
                setPanel('hub');
            });
        }

        document.addEventListener('change', function (e) {
            var t = e.target;
            if (!t || !t.name) return;
            if (t.name === 'crear-ruta-visibilidad') {
                if (PANEL === 'hub') refreshHubCards();
                else refreshHubCards();
            }
            if (t.name === 'crear-ruta-tipo-navegacion') {
                if (t.value === 'lineal' || t.value === 'libre') {
                    TIPO_NAVEGACION = t.value;
                    try {
                        sessionStorage.setItem('ubits-crear-ruta-tipo-navegacion', TIPO_NAVEGACION);
                    } catch (err) { /* noop */ }
                    refreshHubCards();
                }
            }
        });
    }

    function initCrearRutaConfiguracionHub(options) {
        options = options || {};
        if (options.tipoNavegacion === 'lineal' || options.tipoNavegacion === 'libre') {
            TIPO_NAVEGACION = options.tipoNavegacion;
        } else {
            try {
                var stored = sessionStorage.getItem('ubits-crear-ruta-tipo-navegacion');
                if (stored === 'lineal' || stored === 'libre') TIPO_NAVEGACION = stored;
            } catch (e) { /* noop */ }
        }
        wireOnce();
        syncNavegacionRadios();
        var panel =
            options.panel != null
                ? options.panel
                : panelFromConfigHash(location.hash) || 'hub';
        setPanel(panel, { skipUrl: !!options.skipUrl });
        refreshHubCards();
    }

    function showCrearRutaConfiguracionHub(opts) {
        setPanel('hub', opts || {});
        refreshHubCards();
    }

    function applyCrearRutaConfigHash(hash, opts) {
        opts = opts || {};
        var panel = panelFromConfigHash(hash);
        if (!panel) return false;
        setPanel(panel, { skipUrl: !!opts.skipUrl });
        return true;
    }

    function getCrearRutaTipoNavegacion() {
        return TIPO_NAVEGACION === 'libre' ? 'libre' : 'lineal';
    }

    global.initCrearRutaConfiguracionHub = initCrearRutaConfiguracionHub;
    global.showCrearRutaConfiguracionHub = showCrearRutaConfiguracionHub;
    global.applyCrearRutaConfigHash = applyCrearRutaConfigHash;
    global.getCrearRutaTipoNavegacion = getCrearRutaTipoNavegacion;
    global.isCrearRutaAjustesHash = isAjustesHash;
    global.crearRutaConfigHashForPanel = hashForConfigPanel;
    global.crearRutaConfigPanelFromHash = panelFromConfigHash;
})(typeof window !== 'undefined' ? window : this);
