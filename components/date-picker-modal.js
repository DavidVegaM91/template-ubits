/**
 * UBITS Date Picker Modal
 * Modal tamaño SM + calendario oficial (createCalendar) en modo fecha única o rango.
 *
 * Requiere (orden):
 *   CSS:  modal.css, button.css, input.css, calendar.css, date-picker-modal.css
 *   JS:   input.js, calendar.js, modal.js (getModalHtml / showModal / hideModal)
 *
 * API:
 *   createDatePickerModal(options) → { overlayId, open, close, cancel, destroy, setTitle, getState }
 *   openDatePickerModal(overlayId, openOptions?)
 *   closeDatePickerModal(overlayId)
 */
(function (global) {
    'use strict';

    var counter = 0;
    var registry = {};

    function escapeHtml(text) {
        if (text == null) return '';
        var div = document.createElement('div');
        div.textContent = String(text);
        return div.innerHTML;
    }

    function parseDateValue(val) {
        if (!val) return null;
        if (val instanceof Date) {
            var d = new Date(val.getTime());
            d.setHours(0, 0, 0, 0);
            return d;
        }
        var raw = String(val).trim();
        var match = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (!match) return null;
        var dia = parseInt(match[1], 10);
        var mes = parseInt(match[2], 10) - 1;
        var anio = parseInt(match[3], 10);
        if (dia < 1 || dia > 31 || mes < 0 || mes > 11 || anio < 1900 || anio > 2100) return null;
        var fecha = new Date(anio, mes, dia);
        if (fecha.getDate() !== dia || fecha.getMonth() !== mes || fecha.getFullYear() !== anio) return null;
        fecha.setHours(0, 0, 0, 0);
        return fecha;
    }

    function formatDateInput(fecha) {
        if (!fecha) return '';
        var d = fecha.getDate();
        var m = fecha.getMonth() + 1;
        var y = fecha.getFullYear();
        return (d < 10 ? '0' : '') + d + '/' + (m < 10 ? '0' : '') + m + '/' + y;
    }

    function dateTime(fecha) {
        if (!fecha) return null;
        var d = new Date(fecha.getTime());
        d.setHours(0, 0, 0, 0);
        return d.getTime();
    }

    function resolveMount(options) {
        if (options.mountEl) return options.mountEl;
        if (options.containerId) return document.getElementById(options.containerId);
        return document.body;
    }

    function buildBodyHtml(opts) {
        var isRange = opts.mode === 'range';
        if (isRange) {
            return (
                '<div class="date-picker-inputs">' +
                '<div class="date-picker-input-group">' +
                '<label class="ubits-body-sm-regular date-picker-label">' + escapeHtml(opts.startLabel || 'Fecha de inicio') + '</label>' +
                '<div class="date-picker-input-wrapper">' +
                '<input type="text" class="date-picker-input" id="' + opts.startInputId + '" placeholder="DD/MM/YYYY">' +
                '</div></div>' +
                '<span class="date-picker-separator">-</span>' +
                '<div class="date-picker-input-group">' +
                '<label class="ubits-body-sm-regular date-picker-label">' + escapeHtml(opts.endLabel || 'Fecha de fin') + '</label>' +
                '<div class="date-picker-input-wrapper">' +
                '<input type="text" class="date-picker-input" id="' + opts.endInputId + '" placeholder="DD/MM/YYYY">' +
                '</div></div></div>' +
                '<div class="date-picker-calendar" id="' + opts.calendarContainerId + '"></div>'
            );
        }
        return (
            '<div class="date-picker-input-group">' +
            '<label class="ubits-body-sm-regular date-picker-label">' + escapeHtml(opts.singleLabel || 'Fecha') + '</label>' +
            '<div class="date-picker-input-wrapper">' +
            '<input type="text" class="date-picker-input" id="' + opts.singleInputId + '" placeholder="DD/MM/YYYY">' +
            '</div></div>' +
            '<div class="date-picker-calendar" id="' + opts.calendarContainerId + '"></div>'
        );
    }

    function buildFooterHtml(opts) {
        return (
            '<button type="button" class="ubits-button ubits-button--secondary ubits-button--md" id="' + opts.cancelButtonId + '"><span>' + escapeHtml(opts.cancelLabel || 'Cancelar') + '</span></button>' +
            '<button type="button" class="ubits-button ubits-button--primary ubits-button--md" id="' + opts.applyButtonId + '"><span>' + escapeHtml(opts.applyLabel || 'Aplicar') + '</span></button>'
        );
    }

    function showToastWarning(message) {
        if (typeof global.showToast === 'function') global.showToast('warning', message);
    }

    function createDatePickerModal(options) {
        options = options || {};
        if (typeof global.getModalHtml !== 'function') {
            console.warn('[date-picker-modal] Requiere modal.js (getModalHtml).');
            return null;
        }

        var overlayId = options.overlayId || ('ubits-date-picker-overlay-' + (++counter));
        var isRange = options.mode === 'range';
        var ids = {
            overlayId: overlayId,
            contentId: options.contentId || overlayId + '-content',
            titleId: options.titleId || overlayId + '-title',
            closeButtonId: options.closeButtonId || overlayId + '-close',
            cancelButtonId: options.cancelButtonId || overlayId + '-cancel',
            applyButtonId: options.applyButtonId || overlayId + '-apply',
            startInputId: options.startInputId || overlayId + '-start',
            endInputId: options.endInputId || overlayId + '-end',
            singleInputId: options.singleInputId || overlayId + '-single',
            calendarContainerId: options.calendarContainerId || overlayId + '-calendar'
        };

        var mount = resolveMount(options);
        if (!mount) return null;

        var existing = document.getElementById(overlayId);
        if (existing) existing.remove();

        var modalHtml = global.getModalHtml({
            overlayId: overlayId,
            title: options.title != null ? String(options.title) : (isRange ? 'Fecha personalizada' : 'Seleccionar fecha'),
            bodyHtml: buildBodyHtml({
                mode: isRange ? 'range' : 'single',
                startInputId: ids.startInputId,
                endInputId: ids.endInputId,
                singleInputId: ids.singleInputId,
                calendarContainerId: ids.calendarContainerId,
                startLabel: options.startLabel,
                endLabel: options.endLabel,
                singleLabel: options.singleLabel
            }),
            footerHtml: buildFooterHtml({
                cancelButtonId: ids.cancelButtonId,
                applyButtonId: ids.applyButtonId,
                cancelLabel: options.cancelLabel,
                applyLabel: options.applyLabel
            }),
            size: 'sm',
            contentId: ids.contentId,
            titleId: ids.titleId,
            closeButtonId: ids.closeButtonId,
            overlayClass: 'date-picker-overlay',
            contentClass: 'date-picker-modal-content',
            headerClass: 'date-picker-modal-header',
            bodyClass: 'date-picker-modal-body',
            footerClass: 'date-picker-modal-footer'
        });

        if (mount === document.body) {
            document.body.insertAdjacentHTML('beforeend', modalHtml);
        } else {
            mount.insertAdjacentHTML('beforeend', modalHtml);
        }

        var overlay = document.getElementById(overlayId);
        var startInput = document.getElementById(ids.startInputId);
        var endInput = document.getElementById(ids.endInputId);
        var singleInput = document.getElementById(ids.singleInputId);
        var calendarEl = document.getElementById(ids.calendarContainerId);
        var closeBtn = document.getElementById(ids.closeButtonId);
        var cancelBtn = document.getElementById(ids.cancelButtonId);
        var applyBtn = document.getElementById(ids.applyButtonId);
        var titleEl = document.getElementById(ids.titleId);

        var minDate = parseDateValue(options.minDate);
        var maxDate = parseDateValue(options.maxDate);
        var requireBothDates = options.requireBothDates !== false;
        var validateMessage = options.validateMessage || (isRange ? 'Por favor selecciona ambas fechas' : 'Selecciona una fecha en el calendario o escríbela en el campo (DD/MM/YYYY)');
        var maxDateMessage = options.maxDateMessage || 'La fecha no puede superar el límite permitido';

        var startDate = null;
        var endDate = null;
        var selectedDate = null;
        var currentMonth = parseDateValue(options.initialMonth) || new Date();

        function exceedsMax(fecha) {
            return !!(fecha && maxDate && dateTime(fecha) > dateTime(maxDate));
        }

        function belowMin(fecha) {
            return !!(fecha && minDate && dateTime(fecha) < dateTime(minDate));
        }

        function syncInputs() {
            if (isRange) {
                if (startInput) startInput.value = formatDateInput(startDate);
                if (endInput) endInput.value = formatDateInput(endDate);
            } else if (singleInput) {
                singleInput.value = formatDateInput(selectedDate);
            }
        }

        function applyOpenOptions(openOpts) {
            openOpts = openOpts || {};
            if (openOpts.initialMonth != null) {
                var m = parseDateValue(openOpts.initialMonth);
                if (m) currentMonth = new Date(m.getFullYear(), m.getMonth(), 1);
            }
            if (isRange) {
                startDate = parseDateValue(openOpts.startDate != null ? openOpts.startDate : options.startDate);
                endDate = parseDateValue(openOpts.endDate != null ? openOpts.endDate : options.endDate);
                if (startDate) currentMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
            } else {
                selectedDate = parseDateValue(openOpts.selectedDate != null ? openOpts.selectedDate : options.selectedDate);
                if (selectedDate) currentMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
            }
            syncInputs();
        }

        function renderCalendar() {
            if (!calendarEl || typeof global.createCalendar !== 'function') return;
            calendarEl.innerHTML = '';
            var initialDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
            var calOpts = { containerId: ids.calendarContainerId, initialDate: initialDate };
            if (minDate) calOpts.minDate = minDate;
            if (maxDate) calOpts.maxDate = maxDate;

            if (isRange) {
                calOpts.range = true;
                if (startDate) calOpts.selectedStartDate = startDate;
                if (endDate) calOpts.selectedEndDate = endDate;
                calOpts.onRangeSelect = function (startStr, endStr) {
                    if (!startStr) return;
                    startDate = parseDateValue(startStr);
                    endDate = endStr ? parseDateValue(endStr) : null;
                    if (endDate) endDate.setHours(23, 59, 59, 999);
                    syncInputs();
                    renderCalendar();
                };
            } else {
                if (selectedDate) calOpts.selectedDate = selectedDate;
                calOpts.onDateSelect = function (dateStr) {
                    selectedDate = parseDateValue(dateStr);
                    syncInputs();
                    renderCalendar();
                };
            }
            global.createCalendar(calOpts);
        }

        function handleInputBlur(input, isEnd) {
            if (!input) return;
            var texto = input.value.trim();
            if (texto === '') {
                if (isRange) {
                    if (isEnd) endDate = null;
                    else startDate = null;
                } else selectedDate = null;
                renderCalendar();
                return;
            }
            var fecha = parseDateValue(texto);
            if (!fecha) {
                input.value = formatDateInput(isRange ? (isEnd ? endDate : startDate) : selectedDate);
                return;
            }
            if (exceedsMax(fecha) || belowMin(fecha)) {
                showToastWarning(maxDateMessage);
                if (isRange) {
                    if (isEnd) endDate = null;
                    else startDate = null;
                } else selectedDate = null;
                input.value = '';
                renderCalendar();
                return;
            }
            if (isRange) {
                if (isEnd) {
                    fecha.setHours(23, 59, 59, 999);
                    endDate = fecha;
                } else startDate = fecha;
            } else selectedDate = fecha;
            input.value = formatDateInput(fecha);
            currentMonth = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
            renderCalendar();
        }

        function wireInput(input, isEnd) {
            if (!input) return;
            input.addEventListener('blur', function () { handleInputBlur(input, isEnd); });
            input.addEventListener('keypress', function (e) { if (e.key === 'Enter') input.blur(); });
        }

        function showOverlay() {
            if (typeof global.showModal === 'function') global.showModal(overlayId);
            else if (overlay) {
                overlay.style.display = 'flex';
                overlay.setAttribute('aria-hidden', 'false');
            }
        }

        function hideOverlay() {
            if (typeof global.hideModal === 'function') global.hideModal(overlayId);
            else if (overlay) {
                overlay.style.display = 'none';
                overlay.setAttribute('aria-hidden', 'true');
            }
        }

        function cancel() {
            if (typeof options.onCancel === 'function') options.onCancel();
            hideOverlay();
        }

        function close() { hideOverlay(); }

        function open(openOpts) {
            openOpts = openOpts || {};
            startDate = null;
            endDate = null;
            selectedDate = null;
            applyOpenOptions(openOpts);
            showOverlay();
            renderCalendar();
            if (typeof options.onOpen === 'function') options.onOpen();
        }

        function destroy() {
            if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
            delete registry[overlayId];
        }

        function setTitle(title) {
            if (titleEl) titleEl.textContent = title;
        }

        function getState() {
            return isRange ? { startDate: startDate, endDate: endDate } : { date: selectedDate };
        }

        function apply() {
            if (isRange) {
                if (requireBothDates && (!startDate || !endDate)) {
                    showToastWarning(validateMessage);
                    return;
                }
                if (exceedsMax(startDate) || exceedsMax(endDate)) {
                    showToastWarning(maxDateMessage);
                    return;
                }
                if (typeof options.onApply === 'function') options.onApply({ startDate: startDate, endDate: endDate });
            } else {
                if (!selectedDate) {
                    showToastWarning(validateMessage);
                    return;
                }
                if (exceedsMax(selectedDate) || belowMin(selectedDate)) {
                    showToastWarning(maxDateMessage);
                    return;
                }
                if (typeof options.onApply === 'function') options.onApply({ date: selectedDate });
            }
            close();
        }

        if (overlay) overlay.addEventListener('click', function (e) { if (e.target === overlay) cancel(); });
        if (closeBtn) closeBtn.addEventListener('click', cancel);
        if (cancelBtn) cancelBtn.addEventListener('click', cancel);
        if (applyBtn) applyBtn.addEventListener('click', apply);
        wireInput(startInput, false);
        wireInput(endInput, true);
        wireInput(singleInput, false);
        applyOpenOptions(options);

        var api = { overlayId: overlayId, open: open, close: close, cancel: cancel, destroy: destroy, setTitle: setTitle, getState: getState, renderCalendar: renderCalendar };
        registry[overlayId] = api;
        return api;
    }

    function openDatePickerModal(overlayId, openOptions) {
        var api = registry[overlayId];
        if (api) api.open(openOptions);
    }

    function closeDatePickerModal(overlayId) {
        var api = registry[overlayId];
        if (api) api.close();
    }

    global.createDatePickerModal = createDatePickerModal;
    global.openDatePickerModal = openDatePickerModal;
    global.closeDatePickerModal = closeDatePickerModal;
})(typeof window !== 'undefined' ? window : this);
