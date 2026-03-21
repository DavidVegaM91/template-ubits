/**
 * UBITS Stepper — estados de paso y colapso vertical opcional.
 *
 * Bugs / notas al implementar:
 * - Paso completado: el número sigue visible en el círculo (color éxito); el <i class="far fa-check"> en el mark queda oculto por CSS (puede permanecer en el HTML por compatibilidad).
 * - Horizontal en viewport ≤1023px: solo el paso activo muestra .ubits-stepper__label; el resto solo el número (ver stepper.css).
 * - wireStepperVerticalCollapse: tras colapsar, re-inicializar tooltips del marco si usas initTooltip (ver documentación).
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
     * Colapsar / expandir títulos en stepper vertical (marco + botón terciario oficial).
     * @param {HTMLElement} frameEl - .ubits-stepper__vertical-frame (con id recomendado para tooltips)
     * @param {HTMLButtonElement} toggleBtn - botón con clase .ubits-stepper__vertical-toggle
     */
    function wireStepperVerticalCollapse(frameEl, toggleBtn) {
        if (!frameEl || !toggleBtn) return;
        var collapsed = false;

        function apply() {
            var labels = frameEl.querySelectorAll('.ubits-stepper__label');
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
    }

    global.setStepperStepStates = setStepperStepStates;
    global.initStepper = initStepper;
    global.wireStepperVerticalCollapse = wireStepperVerticalCollapse;
})(typeof window !== 'undefined' ? window : this);
