/**
 * UBITS Button group — init neutral / selectable / multi sobre markup con .ubits-button[data-value].
 * @see documentacion/componentes/button-group.html
 */
(function (global) {
    'use strict';

    function resolveRoot(rootElOrSelector) {
        if (!rootElOrSelector) return null;
        if (typeof rootElOrSelector === 'string') {
            return document.querySelector(rootElOrSelector);
        }
        return rootElOrSelector;
    }

    function getGroupButtons(root) {
        return Array.prototype.slice.call(root.querySelectorAll(':scope > .ubits-button[data-value]'));
    }

    function applySelectableValue(root, buttons, value, onChange) {
        root.setAttribute('data-value', value);
        buttons.forEach(function (btn) {
            var isActive = btn.getAttribute('data-value') === value;
            btn.classList.toggle('ubits-button--active', isActive);
            btn.classList.toggle('ubits-button--secondary', !isActive);
            btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });
        if (typeof onChange === 'function') onChange(value);
    }

    function applyMultiValues(root, buttons, values, onValuesChange) {
        var list = Array.isArray(values) ? values.map(String) : [];
        root.setAttribute('data-values', list.join(','));
        buttons.forEach(function (btn) {
            var v = btn.getAttribute('data-value');
            var isActive = list.indexOf(v) !== -1;
            btn.classList.toggle('ubits-button--active', isActive);
            btn.classList.toggle('ubits-button--secondary', !isActive);
            btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });
        if (typeof onValuesChange === 'function') onValuesChange(list.slice());
    }

    function focusSibling(buttons, currentBtn, direction) {
        var idx = buttons.indexOf(currentBtn);
        if (idx === -1) return null;
        for (var step = 1; step <= buttons.length; step += 1) {
            var nextIdx = (idx + direction * step + buttons.length) % buttons.length;
            var next = buttons[nextIdx];
            if (next && !next.disabled) return next;
        }
        return null;
    }

    /**
     * @param {HTMLElement|string} rootElOrSelector
     * @param {{
     *   variant?: 'neutral'|'selectable'|'multi',
     *   orientation?: 'horizontal'|'vertical',
     *   separated?: boolean,
     *   value?: string,
     *   values?: string[],
     *   onChange?: function(string): void,
     *   onValuesChange?: function(string[]): void
     * }} [options]
     */
    function initButtonGroup(rootElOrSelector, options) {
        options = options || {};
        var root = resolveRoot(rootElOrSelector);
        if (!root || root.getAttribute('data-button-group-init') === '1') return root;

        var variant = options.variant || root.getAttribute('data-variant') || 'neutral';
        var orientation = options.orientation || root.getAttribute('data-orientation') || 'horizontal';
        var separated = options.separated != null
            ? !!options.separated
            : root.classList.contains('ubits-button-group--separated');
        var value = options.value != null ? String(options.value) : root.getAttribute('data-value') || '';
        var valuesAttr = root.getAttribute('data-values') || '';
        var values = options.values != null
            ? options.values.map(String)
            : (valuesAttr ? valuesAttr.split(',').map(function (s) { return s.trim(); }).filter(Boolean) : []);
        var buttons = getGroupButtons(root);
        var onChange = options.onChange;
        var onValuesChange = options.onValuesChange;

        if (orientation === 'vertical') {
            root.classList.add('ubits-button-group--vertical');
            root.setAttribute('data-orientation', 'vertical');
        }
        if (separated) {
            root.classList.add('ubits-button-group--separated');
        }

        if (variant === 'selectable' && buttons.length) {
            root.setAttribute('role', 'radiogroup');
            if (!value) value = buttons[0].getAttribute('data-value') || '';
            applySelectableValue(root, buttons, value, null);
        } else if (variant === 'multi' && buttons.length) {
            root.setAttribute('role', 'group');
            applyMultiValues(root, buttons, values, null);
        }

        buttons.forEach(function (btn) {
            btn.addEventListener('click', function () {
                if (variant === 'selectable') {
                    var next = btn.getAttribute('data-value');
                    if (next != null) applySelectableValue(root, buttons, next, onChange);
                } else if (variant === 'multi') {
                    var v = btn.getAttribute('data-value');
                    if (v == null) return;
                    var current = (root.getAttribute('data-values') || '')
                        .split(',')
                        .map(function (s) { return s.trim(); })
                        .filter(Boolean);
                    var idx = current.indexOf(v);
                    if (idx === -1) current.push(v);
                    else current.splice(idx, 1);
                    applyMultiValues(root, buttons, current, onValuesChange);
                }
            });
        });

        if (variant === 'selectable' || variant === 'multi') {
            root.addEventListener('keydown', function (e) {
                var isVertical = orientation === 'vertical';
                var nextKeys = isVertical ? ['ArrowDown', 'ArrowRight'] : ['ArrowRight', 'ArrowDown'];
                var prevKeys = isVertical ? ['ArrowUp', 'ArrowLeft'] : ['ArrowLeft', 'ArrowUp'];
                var dir = 0;
                if (nextKeys.indexOf(e.key) !== -1) dir = 1;
                else if (prevKeys.indexOf(e.key) !== -1) dir = -1;
                else return;

                var active = document.activeElement;
                if (buttons.indexOf(active) === -1) return;
                e.preventDefault();
                var nextBtn = focusSibling(buttons, active, dir);
                if (!nextBtn) return;
                nextBtn.focus();
                if (variant !== 'selectable') return;
                var nextVal = nextBtn.getAttribute('data-value');
                if (nextVal != null) applySelectableValue(root, buttons, nextVal, onChange);
            });
        }

        root.setAttribute('data-button-group-init', '1');
        root.setAttribute('data-variant', variant);
        return root;
    }

    function setButtonGroupValue(rootElOrSelector, value) {
        var root = resolveRoot(rootElOrSelector);
        if (!root) return;
        var buttons = getGroupButtons(root);
        applySelectableValue(root, buttons, String(value), null);
    }

    function setButtonGroupValues(rootElOrSelector, values) {
        var root = resolveRoot(rootElOrSelector);
        if (!root) return;
        var buttons = getGroupButtons(root);
        applyMultiValues(root, buttons, Array.isArray(values) ? values : [], null);
    }

    global.initButtonGroup = initButtonGroup;
    global.setButtonGroupValue = setButtonGroupValue;
    global.setButtonGroupValues = setButtonGroupValues;
})(typeof window !== 'undefined' ? window : this);
