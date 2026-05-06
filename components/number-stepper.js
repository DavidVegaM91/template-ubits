/**
 * Number Stepper Component
 *
 * createNumberStepper({ containerId, label, value, min, max, step, size, onChange })
 * Returns: { getValue, setValue, setDisabled } o null si no existe el contenedor.
 *
 * Bugs / notas al implementar en producto:
 * - containerId puede ser string (id) o el propio elemento DOM (p. ej. un div recién creado en un modal).
 * - Evita llamar createNumberStepper dos veces sobre el mismo contenedor sin vaciarlo: comprobar
 *   !wrap.querySelector('.ubits-number-stepper') antes de montar (patrón en scorm-recurso-modal.js).
 * - El valor central no es editable con teclado; solo botones +/−. Para entrada libre usar Input type number.
 * - setDisabled(true) bloquea ambos botones; al volver a false se recalcula el estado según min/max.
 *
 * @example
 * const stepper = createNumberStepper({
 *     containerId: 'my-wrap',
 *     label: 'Número de slides',
 *     value: 6, min: 5, max: 15,
 *     size: 'md',
 *     onChange: (v) => console.log(v)
 * });
 * stepper.getValue(); // 6
 * stepper.setValue(10);
 */
(function (global) {
    'use strict';

    function createNumberStepper(opts) {
        opts = opts || {};
        var container = typeof opts.containerId === 'string'
            ? document.getElementById(opts.containerId)
            : opts.containerId;
        if (!container) return null;

        var value = (typeof opts.value === 'number' ? opts.value : parseInt(opts.value, 10)) || 0;
        var min   = opts.min != null ? opts.min : 0;
        var max   = opts.max != null ? opts.max : 99;
        var step  = opts.step  || 1;
        var size  = opts.size  || 'md';

        var fieldEl = document.createElement('div');
        fieldEl.className = 'ubits-number-stepper-field';

        if (opts.label) {
            var labelEl = document.createElement('label');
            labelEl.className = 'ubits-number-stepper-label';
            labelEl.textContent = opts.label;
            fieldEl.appendChild(labelEl);
        }

        var stepperEl = document.createElement('div');
        stepperEl.className = 'ubits-number-stepper ubits-number-stepper--' + size;
        stepperEl.setAttribute('role', 'group');
        stepperEl.innerHTML =
            '<button type="button" class="ubits-number-stepper__btn ubits-number-stepper__btn--minus" aria-label="Disminuir"><i class="far fa-minus"></i></button>' +
            '<div class="ubits-number-stepper__divider"></div>' +
            '<span class="ubits-number-stepper__val"></span>' +
            '<div class="ubits-number-stepper__divider"></div>' +
            '<button type="button" class="ubits-number-stepper__btn ubits-number-stepper__btn--plus" aria-label="Aumentar"><i class="far fa-plus"></i></button>';

        fieldEl.appendChild(stepperEl);
        container.appendChild(fieldEl);

        var minusBtn = stepperEl.querySelector('.ubits-number-stepper__btn--minus');
        var plusBtn  = stepperEl.querySelector('.ubits-number-stepper__btn--plus');
        var valEl    = stepperEl.querySelector('.ubits-number-stepper__val');

        function update() {
            valEl.textContent  = String(value);
            minusBtn.disabled  = value <= min;
            plusBtn.disabled   = value >= max;
        }

        minusBtn.addEventListener('click', function () {
            if (value > min) {
                value -= step;
                update();
                if (opts.onChange) opts.onChange(value);
            }
        });

        plusBtn.addEventListener('click', function () {
            if (value < max) {
                value += step;
                update();
                if (opts.onChange) opts.onChange(value);
            }
        });

        update();

        return {
            getValue:    function ()  { return value; },
            setValue:    function (v) { value = Math.max(min, Math.min(max, v)); update(); },
            setDisabled: function (d) { minusBtn.disabled = d || value <= min; plusBtn.disabled = d || value >= max; }
        };
    }

    global.createNumberStepper = createNumberStepper;

}(window));
