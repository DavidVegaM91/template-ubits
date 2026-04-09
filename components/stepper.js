/**
 * UBITS Stepper — estados de paso y colapso vertical opcional.
 *
 * Bugs / notas al implementar:
 * - Paso completado: el número sigue visible en el círculo (color éxito); el <i class="far fa-check"> en el mark queda oculto por CSS (puede permanecer en el HTML por compatibilidad).
 * - Horizontal en viewport ≤1023px: solo el paso activo muestra .ubits-stepper__label; el resto solo el número (ver stepper.css).
 * - wireStepperVerticalCollapse: tras colapsar, re-inicializar tooltips del marco si usas initTooltip (ver documentación).
 * - Marco con clase ubits-stepper__vertical-frame--creator-rail: rail tipo sidebar creator (bg-1, borde), toggle nav-button con fa-angles-right/left y “Contraer” (mismo patrón que Sidebar contenidos LMS).
 *
 * @fileoverview stepper.js
 */

(function (global) {
    'use strict';

    /**
     * Aplica clases done / active / pending según el índice activo (0-based).
     * @param {HTMLElement} root - <ol class="ubits-stepper"> (solo hijos directos .ubits-stepper__step)
     * @param {number} activeIndex
     */
    function setStepperStepStates(root, activeIndex) {
        if (!root) return;
        var steps = root.querySelectorAll(':scope > .ubits-stepper__step');
        steps.forEach(function (el, i) {
            el.classList.remove('ubits-stepper__step--done', 'ubits-stepper__step--active', 'ubits-stepper__step--pending');
            var label = el.getAttribute('data-step-label') || '';
            el.setAttribute('aria-label', 'Paso ' + (i + 1) + (label ? ': ' + label : ''));

            if (i < activeIndex) {
                el.classList.add('ubits-stepper__step--done');
                el.removeAttribute('aria-current');
            } else if (i === activeIndex) {
                el.classList.add('ubits-stepper__step--active');
                el.setAttribute('aria-current', 'step');
            } else {
                el.classList.add('ubits-stepper__step--pending');
                el.removeAttribute('aria-current');
            }
        });
    }

    /**
     * Demo: clic o Enter/Espacio en cada paso cambia el activo (prototipos / docs).
     * @param {HTMLElement} root
     */
    function initStepper(root) {
        if (!root) return;
        var steps = root.querySelectorAll(':scope > .ubits-stepper__step');
        var activeIx = -1;
        steps.forEach(function (s, i) {
            if (s.classList.contains('ubits-stepper__step--active')) activeIx = i;
            s.style.cursor = 'pointer';
            s.setAttribute('tabindex', '0');
            s.addEventListener('click', function () {
                setStepperStepStates(root, i);
            });
            s.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setStepperStepStates(root, i);
                }
            });
        });
        if (activeIx < 0) activeIx = 0;
        setStepperStepStates(root, activeIx);
    }

    /**
     * Colapsar / expandir títulos en stepper vertical (marco + botón).
     * Variante creator-rail: clase ubits-stepper__vertical-frame--creator-rail en el marco y nav-button en el toggle (mismo icono y comportamiento que Sidebar contenidos LMS).
     * @param {HTMLElement} frameEl - .ubits-stepper__vertical-frame (con id recomendado para tooltips)
     * @param {HTMLButtonElement} toggleBtn - .ubits-stepper__vertical-toggle (ubits-button terciario clásico, o nav-button en creator-rail)
     * @param {Object} [options]
     * @param {boolean} [options.creatorRail] - forzar variante creator aunque falte la clase en el marco
     */
    function wireStepperVerticalCollapse(frameEl, toggleBtn, options) {
        if (!frameEl || !toggleBtn) return;
        options = options || {};
        var creatorRail =
            options.creatorRail === true ||
            frameEl.classList.contains('ubits-stepper__vertical-frame--creator-rail');
        var collapsed = frameEl.classList.contains('is-collapsed');

        function applyCreatorTooltipAttrs() {
            if (!creatorRail) return;
            if (collapsed) {
                toggleBtn.setAttribute('data-tooltip-no-arrow', '');
                toggleBtn.setAttribute('data-tooltip-position', 'right');
                toggleBtn.setAttribute('data-tooltip-align', 'center');
                toggleBtn.setAttribute('data-tooltip-delay', '200');
            } else {
                toggleBtn.removeAttribute('data-tooltip-no-arrow');
                toggleBtn.removeAttribute('data-tooltip-position');
                toggleBtn.removeAttribute('data-tooltip-align');
                toggleBtn.removeAttribute('data-tooltip-delay');
            }
        }

        function apply() {
            var labels = frameEl.querySelectorAll('.ubits-stepper__label');
            if (creatorRail) {
                if (collapsed) {
                    frameEl.classList.add('is-collapsed');
                    toggleBtn.setAttribute('aria-expanded', 'false');
                    toggleBtn.setAttribute('aria-label', 'Expandir la lista de pasos');
                    toggleBtn.setAttribute('data-tooltip', 'Expandir');
                    toggleBtn.innerHTML = '<i class="far fa-angles-right" aria-hidden="true"></i>';
                } else {
                    frameEl.classList.remove('is-collapsed');
                    toggleBtn.setAttribute('aria-expanded', 'true');
                    toggleBtn.setAttribute('aria-label', 'Contraer la lista de pasos');
                    toggleBtn.setAttribute('data-tooltip', '');
                    toggleBtn.innerHTML =
                        '<i class="far fa-angles-left" aria-hidden="true"></i>' +
                        '<span class="ubits-body-sm-regular">Contraer</span>';
                }
                applyCreatorTooltipAttrs();
            } else {
                if (collapsed) {
                    frameEl.classList.add('is-collapsed');
                    toggleBtn.classList.add('ubits-button--icon-only');
                    toggleBtn.setAttribute('aria-expanded', 'false');
                    toggleBtn.setAttribute('aria-label', 'Expandir');
                    toggleBtn.setAttribute('data-tooltip', 'Expandir');
                    toggleBtn.setAttribute('data-tooltip-delay', '1000');
                    toggleBtn.innerHTML = '<i class="far fa-chevron-right" aria-hidden="true"></i>';
                } else {
                    frameEl.classList.remove('is-collapsed');
                    toggleBtn.classList.remove('ubits-button--icon-only');
                    toggleBtn.setAttribute('aria-expanded', 'true');
                    toggleBtn.removeAttribute('aria-label');
                    toggleBtn.removeAttribute('data-tooltip');
                    toggleBtn.removeAttribute('data-tooltip-delay');
                    toggleBtn.innerHTML = '<i class="far fa-chevron-left" aria-hidden="true"></i><span>Colapsar</span>';
                }
            }
            labels.forEach(function (el) {
                if (collapsed) el.setAttribute('aria-hidden', 'true');
                else el.removeAttribute('aria-hidden');
            });
            if (typeof global.initTooltip === 'function' && frameEl.id) {
                global.initTooltip('#' + frameEl.id + ' [data-tooltip]');
            }
        }

        toggleBtn.addEventListener('click', function () {
            collapsed = !collapsed;
            apply();
        });
        apply();
    }

    global.setStepperStepStates = setStepperStepStates;
    global.initStepper = initStepper;
    global.wireStepperVerticalCollapse = wireStepperVerticalCollapse;
})(typeof window !== 'undefined' ? window : this);
