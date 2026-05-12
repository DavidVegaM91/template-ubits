/**
 * Tour coachmark tras migración desde Admin (submenú Aprendizaje).
 * Requiere: popover.js, coachmark.js, tooltip.js (sidebar creator montado).
 * sessionStorage 'ubits-start-lms-creator-tour' === '1' → arranca el tour y se limpia.
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

    window.initUbitsLmsCreatorAdminMigrationTour = function (delayMs) {
        var d = typeof delayMs === 'number' ? delayMs : 450;
        setTimeout(function () {
            if (!isDesktopSidebarViewport()) {
                return;
            }

            var runTour = false;
            try {
                if (sessionStorage.getItem(STORAGE_KEY) === '1') {
                    sessionStorage.removeItem(STORAGE_KEY);
                    runTour = true;
                }
            } catch (e) { /* ignore */ }
            if (!runTour) return;
            if (typeof UBITS_COACHMARK === 'undefined' || typeof UBITS_COACHMARK.start !== 'function') return;
            if (typeof window.openPopover !== 'function') return;

            UBITS_COACHMARK.start({
                popoverId: 'ubits-lms-creator-migration-tour',
                showProgress: true,
                steps: [
                    {
                        target: '.sidebar .nav-button[data-section="lms-creator"]',
                        title: 'LMS Creator',
                        body: 'Aquí gestionas los contenidos de formación de tu empresa y sus categorías.',
                        placement: 'right',
                        align: 'center'
                    },
                    {
                        target: '.sidebar .nav-button[data-section="planes-formacion"]',
                        title: 'Planes de formación',
                        body: 'Crea planes para tus colaboradores por competencias o por contenidos concretos, según lo que necesites impulsar.',
                        placement: 'right',
                        align: 'center'
                    },
                    {
                        target: '.sidebar .nav-button[data-section="certificados"]',
                        title: 'Certificados',
                        body: 'Descarga los certificados de estudio de tus colaboradores y ajusta el diseño de los certificados de tu empresa.',
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
