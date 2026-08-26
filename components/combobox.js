/**
 * UBITS Combobox — multi-select con chips removibles + autocomplete.
 * Paridad React UbitsCombobox / ReUI ComboboxChips (owners, recipients).
 */
(function (global) {
    'use strict';

    function escapeHtml(text) {
        return String(text == null ? '' : text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function findOption(options, value) {
        return (options || []).find(function (o) { return String(o.value) === String(value); });
    }

    function optionMatchesQuery(opt, query) {
        var q = String(query || '').trim().toLowerCase();
        if (!q) return true;
        var haystack = [opt.label, opt.text, opt.description, opt.value]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
        return haystack.indexOf(q) !== -1;
    }

    function buildChipHtml(opt, size) {
        var chipSize = size === 'lg' ? 'sm' : 'xs';
        var avatarHtml = opt.avatar
            ? '<img class="ubits-combobox-chip-avatar" src="' + escapeHtml(opt.avatar) + '" alt="">'
            : (opt.icon ? '<i class="' + escapeHtml(opt.icon) + '" aria-hidden="true"></i>' : '');
        var iconClass = avatarHtml ? ' ubits-chip--icon-left' + (opt.avatar ? ' ubits-chip--avatar' : '') : '';
        return '<span class="ubits-chip ubits-chip--' + chipSize + iconClass + ' ubits-chip--close" data-chip-value="' + escapeHtml(opt.value) + '">' +
            avatarHtml +
            '<span class="ubits-chip__text">' + escapeHtml(opt.label || opt.text || '') + '</span>' +
            '<button type="button" class="ubits-chip__close" aria-label="Quitar" data-remove-chip="' + escapeHtml(opt.value) + '"><i class="far fa-times" aria-hidden="true"></i></button>' +
            '</span>';
    }

    function buildOptionHtml(opt, selectedValues) {
        if (typeof renderDropdownMenuOptionRowHtml === 'function') {
            var copy = Object.assign({}, opt, {
                text: opt.label || opt.text || '',
                selected: selectedValues.indexOf(String(opt.value)) !== -1,
                rightIcon: selectedValues.indexOf(String(opt.value)) !== -1 ? 'check' : undefined
            });
            return renderDropdownMenuOptionRowHtml(copy, null, {});
        }
        var selected = selectedValues.indexOf(String(opt.value)) !== -1;
        return '<button type="button" class="ubits-dropdown-menu__option' + (selected ? ' ubits-dropdown-menu__option--selected' : '') + '" data-value="' + escapeHtml(opt.value) + '">' +
            '<span class="ubits-dropdown-menu__option-text">' + escapeHtml(opt.label || opt.text || '') + '</span></button>';
    }

    /**
     * @param {Object} opts
     * @param {string} opts.containerId
     * @param {string} [opts.label]
     * @param {boolean} [opts.showLabel=true]
     * @param {string} [opts.placeholder='Buscar…']
     * @param {string[]} [opts.values]
     * @param {Array} [opts.options]
     * @param {Function} [opts.onChange]
     * @param {'xs'|'sm'|'md'|'lg'} [opts.size='md']
     * @param {boolean} [opts.disabled]
     * @param {string|string[]} [opts.error]
     * @param {string} [opts.helperText]
     * @param {boolean} [opts.showHelper]
     * @param {string} [opts.emptyMessage='No se encontraron resultados']
     */
    function createCombobox(opts) {
        opts = opts || {};
        var container = document.getElementById(opts.containerId);
        if (!container) return null;

        if (container._ubitsComboboxDestroy) {
            container._ubitsComboboxDestroy();
        }

        var options = (opts.options || []).map(function (o) {
            return {
                value: o.value,
                label: o.label || o.text || '',
                text: o.label || o.text || '',
                description: o.description,
                icon: o.icon,
                avatar: o.avatar,
                disabled: o.disabled
            };
        });

        var size = opts.size || 'md';
        var placeholder = opts.placeholder || 'Buscar…';
        var currentValues = Array.isArray(opts.values) ? opts.values.slice() : [];
        var query = '';
        var disabled = !!opts.disabled;
        var emptyMessage = opts.emptyMessage || 'No se encontraron resultados';
        var overlayId = 'ubits-combobox-' + opts.containerId;

        var labelHtml = '';
        if (opts.showLabel !== false && opts.label) {
            labelHtml = '<div class="ubits-input-label-row"><label class="ubits-input-label">' + escapeHtml(opts.label) + '</label></div>';
        }

        container.innerHTML =
            '<div class="ubits-combobox-field ubits-input-field">' +
            labelHtml +
            '<div class="ubits-combobox-trigger-wrap ubits-input-wrapper" data-size="' + escapeHtml(size) + '">' +
            '<div class="ubits-combobox-trigger ubits-input ubits-input--' + size + '" role="combobox" aria-haspopup="listbox"' + (disabled ? ' aria-disabled="true"' : '') + '>' +
            '<div class="ubits-combobox-chips-inner"></div>' +
            '</div>' +
            '</div>' +
            '<div class="ubits-input-helper"></div></div>';

        var field = container.querySelector('.ubits-combobox-field');
        var triggerWrap = container.querySelector('.ubits-combobox-trigger-wrap');
        var trigger = container.querySelector('.ubits-combobox-trigger');
        var chipsInner = container.querySelector('.ubits-combobox-chips-inner');
        var helperEl = container.querySelector('.ubits-input-helper');

        var existing = document.getElementById(overlayId);
        if (existing) existing.remove();

        var dropdown = document.createElement('div');
        dropdown.id = overlayId;
        dropdown.className = 'ubits-combobox-dropdown ubits-dropdown-menu__content';
        dropdown.style.cssText = 'position:fixed;display:none;z-index:2147483647;box-shadow:var(--ubits-elevation-overlay);border-radius:var(--border-radius-sm);background:var(--ubits-bg-1);';
        dropdown.innerHTML = '<div class="ubits-combobox-options ubits-dropdown-menu__options"></div>';
        document.body.appendChild(dropdown);

        var optionsContainer = dropdown.querySelector('.ubits-combobox-options');

        function filteredOptions() {
            var q = String(query || '').trim();
            var pool = q
                ? options.filter(function (o) { return o.value && !o.disabled; })
                : options.filter(function (o) {
                    return o.value && !o.disabled && currentValues.indexOf(String(o.value)) === -1;
                });
            return pool.filter(function (o) { return optionMatchesQuery(o, q); });
        }

        function renderHelper() {
            if (!helperEl) return;
            var err = opts.error;
            if (Array.isArray(err) && err.length) {
                helperEl.innerHTML = err.map(function (m) { return escapeHtml(m); }).join('<br>');
                helperEl.className = 'ubits-input-helper ubits-input-helper--error';
                return;
            }
            if (err) {
                helperEl.textContent = String(err);
                helperEl.className = 'ubits-input-helper ubits-input-helper--error';
                return;
            }
            if (opts.showHelper && opts.helperText) {
                helperEl.textContent = opts.helperText;
                helperEl.className = 'ubits-input-helper';
                return;
            }
            helperEl.textContent = '';
            helperEl.className = 'ubits-input-helper';
        }

        function renderTrigger() {
            var chipsHtml = currentValues.map(function (v) {
                var opt = findOption(options, v);
                return opt ? buildChipHtml(opt, size) : '';
            }).join('');
            var inputDisabled = disabled ? ' disabled' : '';
            chipsInner.innerHTML = chipsHtml +
                '<input type="text" class="ubits-combobox-query" autocomplete="off" placeholder="' + escapeHtml(placeholder) + '" value="' + escapeHtml(query) + '"' + inputDisabled + '>';
        }

        function renderMenu() {
            var list = filteredOptions();
            if (!list.length) {
                optionsContainer.innerHTML = '<div class="ubits-combobox-empty">' + escapeHtml(emptyMessage) + '</div>';
                return;
            }
            optionsContainer.innerHTML = list.map(function (opt) {
                return buildOptionHtml(opt, currentValues);
            }).join('');
        }

        function positionDropdown() {
            var gap = 4;
            var viewportPadding = 8;
            var vw = window.innerWidth;
            var vh = window.innerHeight;
            var rect = triggerWrap.getBoundingClientRect();
            dropdown.style.display = 'flex';
            dropdown.style.minWidth = rect.width + 'px';
            dropdown.style.width = rect.width + 'px';
            dropdown.style.maxWidth = rect.width + 'px';
            var contentHeight = dropdown.offsetHeight;
            var top = rect.bottom + gap;
            var left = rect.left;
            var spaceBelow = vh - rect.bottom - gap - viewportPadding;
            var spaceAbove = rect.top - gap - viewportPadding;

            if (spaceBelow < contentHeight && spaceAbove >= contentHeight) {
                top = rect.top - contentHeight - gap;
            } else if (spaceBelow < contentHeight && spaceAbove < contentHeight) {
                top = spaceAbove > spaceBelow
                    ? rect.top - contentHeight - gap
                    : rect.bottom + gap;
            }

            left = Math.max(viewportPadding, Math.min(vw - rect.width - viewportPadding, left));
            top = Math.max(viewportPadding, Math.min(vh - contentHeight - viewportPadding, top));

            var menuBottom = top + contentHeight;
            if (menuBottom > rect.top - gap && top < rect.bottom + gap) {
                top = rect.top - contentHeight - gap;
                top = Math.max(viewportPadding, Math.min(vh - contentHeight - viewportPadding, top));
            }

            dropdown.style.top = top + 'px';
            dropdown.style.left = left + 'px';
        }

        function openMenu() {
            if (disabled) return;
            if (dropdown.parentNode) dropdown.parentNode.appendChild(dropdown);
            renderMenu();
            positionDropdown();
            requestAnimationFrame(positionDropdown);
            trigger.setAttribute('aria-expanded', 'true');
        }

        function closeMenu() {
            dropdown.style.display = 'none';
            trigger.setAttribute('aria-expanded', 'false');
        }

        function emitChange() {
            if (typeof opts.onChange === 'function') opts.onChange(currentValues.slice());
        }

        function toggleValue(val) {
            var idx = currentValues.indexOf(val);
            if (idx === -1) currentValues.push(val);
            else currentValues.splice(idx, 1);
            query = '';
            renderTrigger();
            renderMenu();
            emitChange();
            var input = chipsInner.querySelector('.ubits-combobox-query');
            if (input) input.focus();
        }

        function removeValue(val) {
            currentValues = currentValues.filter(function (v) { return String(v) !== String(val); });
            renderTrigger();
            renderMenu();
            emitChange();
        }

        renderTrigger();
        renderHelper();

        triggerWrap.addEventListener('mousedown', function (e) {
            if (disabled) return;
            if (e.target.closest('.ubits-chip__close')) return;
            if (!e.target.closest('.ubits-combobox-query')) {
                e.preventDefault();
            }
            var input = chipsInner.querySelector('.ubits-combobox-query');
            if (input && !e.target.closest('.ubits-combobox-query')) {
                input.focus();
            }
            openMenu();
        });

        chipsInner.addEventListener('input', function (e) {
            var input = e.target.closest('.ubits-combobox-query');
            if (!input) return;
            query = input.value;
            renderMenu();
            if (dropdown.style.display === 'none' || dropdown.style.display === '') {
                openMenu();
            } else {
                positionDropdown();
                requestAnimationFrame(positionDropdown);
            }
        });

        chipsInner.addEventListener('keydown', function (e) {
            var input = e.target.closest('.ubits-combobox-query');
            if (!input) return;
            if (e.key === 'Backspace' && query === '' && currentValues.length) {
                e.preventDefault();
                removeValue(currentValues[currentValues.length - 1]);
            }
            if (e.key === 'Escape') {
                closeMenu();
                query = '';
                renderTrigger();
            }
        });

        chipsInner.addEventListener('click', function (e) {
            var rm = e.target.closest('[data-remove-chip]');
            if (!rm) return;
            e.preventDefault();
            e.stopPropagation();
            removeValue(rm.getAttribute('data-remove-chip'));
        });

        dropdown.addEventListener('click', function (e) {
            e.stopPropagation();
            var btn = e.target.closest('button.ubits-dropdown-menu__option');
            if (!btn) return;
            toggleValue(btn.getAttribute('data-value') || '');
        });

        function onDocClick(e) {
            if (!field.contains(e.target) && !dropdown.contains(e.target)) {
                closeMenu();
            }
        }

        document.addEventListener('click', onDocClick, true);

        if (disabled) {
            trigger.classList.add('ubits-input--disabled');
        }

        function destroy() {
            document.removeEventListener('click', onDocClick, true);
            closeMenu();
            if (dropdown.parentNode) dropdown.parentNode.removeChild(dropdown);
            container.innerHTML = '';
            delete container._ubitsComboboxDestroy;
        }

        var api = {
            getValues: function () { return currentValues.slice(); },
            setValues: function (next) {
                currentValues = Array.isArray(next) ? next.slice() : [];
                renderTrigger();
                renderMenu();
            },
            destroy: destroy
        };

        container._ubitsComboboxDestroy = destroy;
        return api;
    }

    global.createCombobox = createCombobox;
})(typeof window !== 'undefined' ? window : this);
