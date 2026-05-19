/**
 * Tour coachmark tras migración desde Admin (submenú Aprendizaje).
 * Requiere: popover.js, coachmark.js, tooltip.js (sidebar creator montado).
 * sessionStorage 'ubits-start-lms-creator-tour' === '1' → arranca el tour y se limpia.
 * Opción { always: true } → arranca en cada visita (p. ej. contenidos-sin-migrar.html).
 */
(function () {
    'use strict';

    var STORAGE_KEY = 'ubits-start-lms-creator-tour';

    /** Misma regla que el layout: sidebar oculto por debajo de 1024px; el tour ancla al rail y no debe mostrarse en móvil. */
    function isDesktopSidebarViewport() {
        try {
            return window.matchMedia('(min-width: 1024px)').matches;
        } catch (e) {
            return typeof window.innerWidth === 'number' && window.innerWidth >= 1024;
        }
    }

    window.initUbitsLmsCreatorAdminMigrationTour = function (delayMs, options) {
        var d = typeof delayMs === 'number' ? delayMs : 450;
        var opts = options && typeof options === 'object' ? options : {};
        var alwaysRun = opts.always === true;
        setTimeout(function () {
            if (!isDesktopSidebarViewport()) {
                return;
            }

            var runTour = alwaysRun;
            if (!runTour) {
                try {
                    if (sessionStorage.getItem(STORAGE_KEY) === '1') {
                        sessionStorage.removeItem(STORAGE_KEY);
                        runTour = true;
                    }
                } catch (e) { /* ignore */ }
            }
            if (!runTour) return;
            if (typeof UBITS_COACHMARK === 'undefined' || typeof UBITS_COACHMARK.start !== 'function') return;
            if (typeof window.openPopover !== 'function') return;

            UBITS_COACHMARK.start({
                popoverId: 'ubits-lms-creator-migration-tour',
                showProgress: true,
                steps: [
                    {
                        target: '.sidebar .nav-button[data-section="lms-creator"]',
                        title: 'LMS',
                        body: 'Creación y edición de contenidos y rutas de aprendizaje, seguimiento a los contenidos, gestión de categorías y todo lo necesario para administrar el portafolio de tu compañía.',
                        placement: 'right',
                        align: 'center'
                    },
                    {
                        target: '.sidebar .nav-button[data-section="planes-formacion"]',
                        title: 'Planes de formación',
                        body: 'Establece metas de estudio a tus colaboradores individuales, grupos específicos o toda la empresa a través de planes de formación tanto de contenidos como competencias.',
                        placement: 'right',
                        align: 'center'
                    },
                    {
                        target: '.sidebar .nav-button[data-section="certificados"]',
                        title: 'Certificados',
                        body: 'Configura cómo lucirán los certificados, crea diferentes plantillas o simplemente descarga los certificados de tus colaboradores.',
                        placement: 'right',
                        align: 'center'
                    },
                    {
                        target: '.sidebar .nav-button[data-section="personalizacion"]',
                        title: 'Personalización',
                        body: 'Gestiona el aspecto de la Universidad corporativa y los correos de seguimiento de estudio mensuales.',
                        placement: 'right',
                        align: 'center'
                    }
                ]
            });
        }, d);
    };
})();
