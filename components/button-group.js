/**
 * UBITS Button group — init selectable / neutral sobre markup con .ubits-button[data-value].
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
        return Array.prototype.slice.call(root.querySelectorAll('.ubits-button[data-value]'));
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
     * @param {{ variant?: 'neutral'|'selectable', value?: string, onChange?: function(string): void }} [options]
     */
    function initButtonGroup(rootElOrSelector, options) {
        options = options || {};
        var root = resolveRoot(rootElOrSelector);
        if (!root || root.getAttribute('data-button-group-init') === '1') return root;

        var variant = options.variant || root.getAttribute('data-variant') || 'neutral';
        var value = options.value != null ? String(options.value) : root.getAttribute('data-value') || '';
        var buttons = getGroupButtons(root);
        var onChange = options.onChange;

        if (variant === 'selectable' && buttons.length) {
            if (!value) value = buttons[0].getAttribute('data-value') || '';
            applySelectableValue(root, buttons, value, null);
        }

        buttons.forEach(function (btn) {
            btn.addEventListener('click', function () {
                if (variant !== 'selectable') return;
                var next = btn.getAttribute('data-value');
                if (next != null) applySelectableValue(root, buttons, next, onChange);
            });
        });

        if (variant === 'selectable') {
            root.addEventListener('keydown', function (e) {
                if (e.key !== 'ArrowRight' && e.key !== 'ArrowDown' && e.key !== 'ArrowLeft' && e.key !== 'ArrowUp') {
                    return;
                }
                var active = document.activeElement;
                if (buttons.indexOf(active) === -1) return;
                e.preventDefault();
                var dir = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1;
                var nextBtn = focusSibling(buttons, active, dir);
                if (!nextBtn) return;
                nextBtn.focus();
                var nextVal = nextBtn.getAttribute('data-value');
                if (nextVal != null) applySelectableValue(root, buttons, nextVal, onChange);
            });
        }

        root.setAttribute('data-button-group-init', '1');
        return root;
    }

    function setButtonGroupValue(rootElOrSelector, value) {
        var root = resolveRoot(rootElOrSelector);
        if (!root) return;
        var buttons = getGroupButtons(root);
        applySelectableValue(root, buttons, String(value), null);
    }

    global.initButtonGroup = initButtonGroup;
    global.setButtonGroupValue = setButtonGroupValue;
})(typeof window !== 'undefined' ? window : this);
