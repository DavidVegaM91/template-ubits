/**
 * Duration Input — duración mm:ss con “:” fijo (no editable).
 * Hermano visual de Input. createDurationInput({ ... })
 *
 * @example
 * const api = createDurationInput({
 *     containerId: 'duration-wrap',
 *     label: 'Duración',
 *     valueSec: 65,
 *     minSec: 1,
 *     maxSec: 600,
 *     size: 'sm',
 *     onChange: function (sec) { console.log(sec); }
 * });
 * api.getValue(); // 65
 * api.setValue(90);
 */
(function (global) {
    'use strict';

    function clamp(n, min, max) {
        return Math.min(max, Math.max(min, n));
    }

    function splitSec(totalSec) {
        var t = Math.max(0, Math.round(totalSec));
        return { min: Math.floor(t / 60), sec: t % 60 };
    }

    function digitsOnly(raw, maxLen) {
        return String(raw || '').replace(/\D/g, '').slice(0, maxLen);
    }

    function formatDurationClock(totalSec) {
        var parts = splitSec(totalSec);
        return parts.min + ':' + String(parts.sec).padStart(2, '0');
    }

    function createDurationInput(opts) {
        opts = opts || {};
        var container = typeof opts.containerId === 'string'
            ? document.getElementById(opts.containerId)
            : opts.containerId;
        if (!container) return null;

        var minSec = opts.minSec != null ? opts.minSec : 1;
        var maxSec = opts.maxSec != null ? opts.maxSec : 600;
        var valueSec = clamp(
            typeof opts.valueSec === 'number' ? opts.valueSec : (parseInt(opts.valueSec, 10) || minSec),
            minSec,
            maxSec
        );
        var size = opts.size || 'md';
        var showIcon = opts.showIcon !== false;
        var disabled = !!opts.disabled;
        var labelPosNorm = String(opts.labelPosition || 'top').toLowerCase();
        var useLabelLeft = labelPosNorm === 'left' && opts.label;
        var maxMinDigits = String(Math.floor(maxSec / 60)).length;
        var uid = 'ubits-duration-' + Math.random().toString(36).slice(2, 9);
        var focusedWhich = null;
        var draft = { min: '', sec: '' };

        var fieldEl = document.createElement('div');
        fieldEl.className = 'ubits-duration-input-field';
        if (opts.fullWidth) fieldEl.classList.add('ubits-duration-input-field--full-width');
        if (useLabelLeft) fieldEl.classList.add('ubits-duration-input-field--label-left');

        var labelEl = null;
        if (opts.label) {
            labelEl = document.createElement('label');
            labelEl.className = 'ubits-duration-input-label' + (useLabelLeft ? ' ubits-duration-input-label--left' : '');
            labelEl.id = uid + '-label';
            labelEl.htmlFor = uid + '-min';
            labelEl.textContent = opts.label;
            fieldEl.appendChild(labelEl);
        }

        var mount = fieldEl;
        if (useLabelLeft) {
            var bodyEl = document.createElement('div');
            bodyEl.className = 'ubits-duration-input-field__body';
            fieldEl.appendChild(bodyEl);
            mount = bodyEl;
        }

        var controlEl = document.createElement('div');
        controlEl.className =
            'ubits-duration-input ubits-duration-input--' + size +
            (showIcon ? ' ubits-duration-input--with-icon' : '') +
            (disabled ? ' ubits-duration-input--disabled' : '');
        controlEl.setAttribute('role', 'group');
        if (labelEl) controlEl.setAttribute('aria-labelledby', labelEl.id);

        if (showIcon) {
            controlEl.innerHTML = '<i class="far fa-clock ubits-duration-input__icon" aria-hidden="true"></i>';
        }

        var minInput = document.createElement('input');
        minInput.type = 'text';
        minInput.inputMode = 'numeric';
        minInput.autocomplete = 'off';
        minInput.spellcheck = false;
        minInput.id = uid + '-min';
        minInput.className = 'ubits-duration-input__segment ubits-duration-input__segment--min';
        minInput.setAttribute('aria-label', 'Minutos');
        minInput.placeholder = '0';
        minInput.disabled = disabled;

        var colonEl = document.createElement('span');
        colonEl.className = 'ubits-duration-input__colon';
        colonEl.setAttribute('aria-hidden', 'true');
        colonEl.textContent = ':';

        var secInput = document.createElement('input');
        secInput.type = 'text';
        secInput.inputMode = 'numeric';
        secInput.autocomplete = 'off';
        secInput.spellcheck = false;
        secInput.id = uid + '-sec';
        secInput.className = 'ubits-duration-input__segment ubits-duration-input__segment--sec';
        secInput.setAttribute('aria-label', 'Segundos');
        secInput.placeholder = '00';
        secInput.disabled = disabled;

        controlEl.appendChild(minInput);
        controlEl.appendChild(colonEl);
        controlEl.appendChild(secInput);
        mount.appendChild(controlEl);

        var helperEl = null;
        if (opts.helperText) {
            helperEl = document.createElement('div');
            helperEl.className = 'ubits-duration-input-helper';
            helperEl.innerHTML = '<p></p>';
            helperEl.querySelector('p').textContent = opts.helperText;
            mount.appendChild(helperEl);
        }

        container.innerHTML = '';
        container.appendChild(fieldEl);

        function paintFromValue() {
            var parts = splitSec(valueSec);
            draft.min = String(parts.min);
            draft.sec = String(parts.sec).padStart(2, '0');
            if (!focusedWhich) {
                minInput.value = draft.min;
                secInput.value = draft.sec;
            }
        }

        function commitDraft() {
            var m = Number(digitsOnly(draft.min, maxMinDigits) || '0');
            var s = Number(digitsOnly(draft.sec, 2) || '0');
            if (s > 59) s = 59;
            var next = clamp(m * 60 + s, minSec, maxSec);
            var changed = next !== Math.round(valueSec);
            valueSec = next;
            paintFromValue();
            if (changed && typeof opts.onChange === 'function') {
                opts.onChange(valueSec);
            }
        }

        function nudge(delta) {
            if (disabled) return;
            var next = clamp(Math.round(valueSec) + delta, minSec, maxSec);
            if (next === Math.round(valueSec)) return;
            valueSec = next;
            paintFromValue();
            if (typeof opts.onChange === 'function') opts.onChange(valueSec);
        }

        function onSegmentKeyDown(e, which) {
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                nudge(1);
                return;
            }
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                nudge(-1);
                return;
            }
            if (e.key === 'Enter') {
                e.preventDefault();
                e.currentTarget.blur();
                return;
            }
            if (
                which === 'min' &&
                (e.key === ':' || e.key === 'ArrowRight') &&
                e.currentTarget.selectionStart === e.currentTarget.value.length
            ) {
                e.preventDefault();
                secInput.focus();
                secInput.select();
                return;
            }
            if (which === 'sec' && e.key === 'ArrowLeft' && (e.currentTarget.selectionStart || 0) === 0) {
                e.preventDefault();
                minInput.focus();
                minInput.select();
                return;
            }
            if (which === 'sec' && e.key === 'Backspace' && e.currentTarget.value === '') {
                e.preventDefault();
                minInput.focus();
            }
        }

        minInput.addEventListener('focus', function () {
            focusedWhich = 'min';
            minInput.select();
        });
        secInput.addEventListener('focus', function () {
            focusedWhich = 'sec';
            secInput.select();
        });

        minInput.addEventListener('input', function () {
            draft.min = digitsOnly(minInput.value, maxMinDigits);
            minInput.value = draft.min;
            if (draft.min.length >= maxMinDigits) {
                secInput.focus();
                secInput.select();
            }
        });
        secInput.addEventListener('input', function () {
            draft.sec = digitsOnly(secInput.value, 2);
            secInput.value = draft.sec;
        });

        minInput.addEventListener('blur', function () {
            focusedWhich = null;
            window.setTimeout(function () {
                if (focusedWhich) return;
                draft.min = minInput.value;
                draft.sec = secInput.value;
                commitDraft();
            }, 0);
        });
        secInput.addEventListener('blur', function () {
            focusedWhich = null;
            window.setTimeout(function () {
                if (focusedWhich) return;
                draft.min = minInput.value;
                draft.sec = secInput.value;
                commitDraft();
            }, 0);
        });

        minInput.addEventListener('keydown', function (e) { onSegmentKeyDown(e, 'min'); });
        secInput.addEventListener('keydown', function (e) { onSegmentKeyDown(e, 'sec'); });

        paintFromValue();

        return {
            getValue: function () { return valueSec; },
            setValue: function (next) {
                valueSec = clamp(Number(next) || minSec, minSec, maxSec);
                paintFromValue();
            },
            setDisabled: function (flag) {
                disabled = !!flag;
                minInput.disabled = disabled;
                secInput.disabled = disabled;
                controlEl.classList.toggle('ubits-duration-input--disabled', disabled);
            },
            format: function () { return formatDurationClock(valueSec); }
        };
    }

    global.createDurationInput = createDurationInput;
    global.formatDurationClock = formatDurationClock;
})(typeof window !== 'undefined' ? window : this);
