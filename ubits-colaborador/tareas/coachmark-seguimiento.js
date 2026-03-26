/**
 * Recorrido coachmark Seguimiento (UBITS_COACHMARK + popover.js).
 * Entrada: tareas.html#coachmark → paso 1; luego seguimiento.html#coachmark (pasos 2–6).
 */
(function () {
    'use strict';

    var HASH = '#coachmark';
    var STORAGE_KEY = 'ubitsCoachmarkSeguimiento';
    /** Si el hash se pierde en la navegación, aún recuperamos el tour si el storage es reciente. */
    var STORAGE_MAX_AGE_MS = 10 * 60 * 1000;
    var TOTAL_STEPS = 6;
    var POPOVER_ID = 'ubits-coachmark-seguimiento-popover';
    /** Mismo breakpoint que SubNav desktop: coachmark solo en ≥1280px */
    var MIN_COACHMARK_VIEWPORT_WIDTH = 1280;

    var globalViewportResizeTimer = null;

    var COPY = [
        {
            title: 'Seguimiento',
            body: 'Consulta y gestiona el progreso de tareas y planes desde un solo lugar.'
        },
        {
            title: 'Tareas',
            body: 'Lista completa de tareas con opciones para filtrar, ordenar y actuar en lote.'
        },
        {
            title: 'Planes',
            body: 'Lista completa de planes con el mismo enfoque: filtrar, ordenar y actuar en lote.'
        },
        {
            title: 'Período',
            body: 'Limita la información a fechas específicas antes de analizarla.'
        },
        {
            title: 'Indicadores',
            body: 'Consulta totales por estados (finalizadas, pendientes, vencidas) según el periodo elegido.'
        },
        {
            title: 'Tabla',
            body: 'Ordena y filtra los datos desde el encabezado de la tabla.'
        }
    ];

    function isTareasPage() {
        var p = (window.location.pathname || '').toLowerCase().replace(/\\/g, '/');
        return p.indexOf('tareas.html') !== -1;
    }

    function isSeguimientoPage() {
        var p = (window.location.pathname || '').toLowerCase().replace(/\\/g, '/');
        if (p.indexOf('seguimiento-leader') !== -1) return false;
        if (p.indexOf('seguimiento.html') !== -1) return true;
        var h = (window.location.href || '').toLowerCase();
        return h.indexOf('seguimiento.html') !== -1 && h.indexOf('seguimiento-leader') === -1;
    }

    function hasCoachmarkHash() {
        return window.location.hash === HASH;
    }

    /** Resuelve rutas relativas al documento actual (file://, Netlify, subcarpetas). */
    function hrefToSiblingHtml(filenameWithHash) {
        try {
            return new URL(filenameWithHash, window.location.href).href;
        } catch (e) {
            return filenameWithHash;
        }
    }

    function isRecentCoachmarkStorage(st) {
        if (!st || typeof st.ts !== 'number') return false;
        return (Date.now() - st.ts) < STORAGE_MAX_AGE_MS;
    }

    /**
     * Tras Siguiente en paso 1, a veces el hash #coachmark no llega a seguimiento (navegador/host).
     * Si hay paso 2+ reciente en sessionStorage, reinyectamos el hash (misma idea que planes-formacion + #competencias).
     */
    function ensureCoachmarkHashFromStorage() {
        if (hasCoachmarkHash()) return;
        if (!isSeguimientoPage()) return;
        var st = readStorage();
        if (!st || typeof st.step !== 'number' || st.step < 2 || st.step > TOTAL_STEPS) return;
        if (!isRecentCoachmarkStorage(st)) return;
        try {
            history.replaceState(null, '', window.location.pathname + window.location.search + HASH);
        } catch (e) { /* ignore */ }
    }

    function isDesktopCoachmarkViewport() {
        return typeof window.innerWidth === 'number' && window.innerWidth >= MIN_COACHMARK_VIEWPORT_WIDTH;
    }

    /** Hash + página válida + ancho desktop (el tour no corre en tablet/móvil). */
    function shouldBootCoachmark() {
        return shouldStart() && isDesktopCoachmarkViewport();
    }

    function readStorage() {
        try {
            var raw = sessionStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }

    function writeStorage(step) {
        try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ step: step, ts: Date.now() }));
        } catch (e) { /* ignore */ }
    }

    function clearStorage() {
        try {
            sessionStorage.removeItem(STORAGE_KEY);
        } catch (e) { /* ignore */ }
    }

    function clearCoachmarkHashIfPresent() {
        if (window.location.hash !== HASH) return;
        try {
            history.replaceState(null, '', window.location.pathname + window.location.search);
        } catch (e) { /* ignore */ }
    }

    function getTargetForStep(step) {
        if (step === 1) {
            var wrap = document.getElementById('top-nav-container');
            if (!wrap) return null;
            return wrap.querySelector('.nav-tab[data-tab="seguimiento"]')
                || wrap.querySelector('.module-selector-item[data-tab="seguimiento"]')
                || wrap.querySelector('[data-tab="seguimiento"]');
        }
        if (step === 2) return document.getElementById('seguimiento-tab-tareas');
        if (step === 3) return document.getElementById('seguimiento-tab-planes');
        if (step === 4) return document.getElementById('seguimiento-periodo-toggle');
        if (step === 5) return document.getElementById('seguimiento-indicadores');
        if (step === 6) {
            return document.getElementById('seguimiento-thead')
                || document.querySelector('#seguimiento-table thead')
                || document.getElementById('seguimiento-table');
        }
        return null;
    }

    function buildSteps() {
        return COPY.map(function (cfg, i) {
            var stepNum = i + 1;
            var align = 'center';
            if (stepNum === 2 || stepNum === 3) align = 'left';
            if (stepNum === 4) align = 'right';
            return {
                title: cfg.title,
                body: cfg.body,
                target: function () {
                    return getTargetForStep(stepNum);
                },
                placement: 'bottom',
                align: align
            };
        });
    }

    function coachmarkAvailable() {
        return typeof window.UBITS_COACHMARK !== 'undefined'
            && typeof window.UBITS_COACHMARK.start === 'function'
            && typeof window.openPopover === 'function';
    }

    function isCoachmarkActive() {
        return coachmarkAvailable() && window.UBITS_COACHMARK.isActive();
    }

    function startSeguimientoTour() {
        if (!coachmarkAvailable()) return;
        var steps = buildSteps();
        var oneBased = resolveInitialStep();
        var startIndex = Math.max(0, Math.min(TOTAL_STEPS - 1, oneBased - 1));

        window.UBITS_COACHMARK.start({
            popoverId: POPOVER_ID,
            steps: steps,
            startIndex: startIndex,
            showProgress: true,
            onStepChange: function (index) {
                writeStorage(index + 1);
            },
            onBeforeNext: function (index) {
                if (index === 0 && isTareasPage()) {
                    writeStorage(2);
                    window.location.href = hrefToSiblingHtml('seguimiento.html' + HASH);
                    return false;
                }
                return true;
            },
            onBeforePrev: function (index) {
                if (index === 1 && isSeguimientoPage()) {
                    writeStorage(1);
                    window.location.href = hrefToSiblingHtml('tareas.html' + HASH);
                    return false;
                }
                return true;
            },
            onComplete: function () {
                clearStorage();
                clearCoachmarkHashIfPresent();
            },
            onDismiss: function () {
                clearStorage();
                clearCoachmarkHashIfPresent();
            }
        });
    }

    function shouldStart() {
        if (!hasCoachmarkHash()) return false;
        if (isTareasPage()) return true;
        if (isSeguimientoPage()) return true;
        return false;
    }

    function resolveInitialStep() {
        var st = readStorage();
        if (isTareasPage()) {
            return 1;
        }
        if (isSeguimientoPage()) {
            if (st && typeof st.step === 'number' && st.step >= 2 && st.step <= TOTAL_STEPS) {
                return st.step;
            }
            return 2;
        }
        return 1;
    }

    function onGlobalViewportResize() {
        clearTimeout(globalViewportResizeTimer);
        globalViewportResizeTimer = setTimeout(function () {
            if (!isDesktopCoachmarkViewport()) {
                if (coachmarkAvailable() && window.UBITS_COACHMARK.isActive()) {
                    window.UBITS_COACHMARK.close('restart');
                }
                return;
            }
            if (shouldBootCoachmark() && !isCoachmarkActive()) {
                boot();
            }
        }, 150);
    }

    function boot() {
        ensureCoachmarkHashFromStorage();
        if (!shouldBootCoachmark()) return;
        if (isCoachmarkActive()) return;
        setTimeout(function () {
            if (!shouldBootCoachmark()) return;
            if (isCoachmarkActive()) return;
            startSeguimientoTour();
        }, isTareasPage() ? 500 : 400);
    }

    function initEntry() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', boot);
        } else {
            boot();
        }
    }

    initEntry();

    window.addEventListener('resize', onGlobalViewportResize);

    window.addEventListener('hashchange', function () {
        if (shouldBootCoachmark() && !isCoachmarkActive()) {
            boot();
        }
    });

    window.UBITS_COACHMARK_SEGUIMIENTO = {
        start: function () {
            window.location.hash = 'coachmark';
            setTimeout(function () {
                if (shouldBootCoachmark() && !isCoachmarkActive()) {
                    boot();
                }
            }, 0);
        }
    };
})();
