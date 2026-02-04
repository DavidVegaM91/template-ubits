/**
 * UBITS Calendar Component
 * Soporta selección de una fecha (modo simple) o de un rango de fechas (modo rango).
 *
 * Requiere: input.js (createInput) y input.css. CSS: components/calendar.css
 *
 * Uso modo simple (una fecha):
 *   createCalendar({
 *     containerId: 'id-del-contenedor',
 *     initialDate?: Date | string,
 *     selectedDate?: Date | string,
 *     onDateSelect?: function(dateStr)  // 'dd/mm/yyyy'
 *   });
 *
 * Uso modo rango (inicio y fin):
 *   createCalendar({
 *     containerId: 'id-del-contenedor',
 *     range: true,
 *     initialDate?: Date | string,
 *     selectedStartDate?: Date | string,
 *     selectedEndDate?: Date | string,
 *     onRangeSelect?: function(startStr, endStr)  // endStr puede ser null si solo hay inicio
 *   });
 */
(function () {
    'use strict';

    var idCounter = 0;
    var monthShortNames = [
        'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
        'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
    ];

    function formatDate(date) {
        var d = date.getDate();
        var m = date.getMonth() + 1;
        var y = date.getFullYear();
        return (d < 10 ? '0' : '') + d + '/' + (m < 10 ? '0' : '') + m + '/' + y;
    }

    function parseDate(val) {
        if (!val) return null;
        if (val instanceof Date) return val;
        var parts = String(val).split('/');
        if (parts.length !== 3) return null;
        return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
    }

    function dateToTime(d) {
        d.setHours(0, 0, 0, 0);
        return d.getTime();
    }

    function createCalendar(options) {
        options = options || {};
        var containerId = options.containerId;
        if (!containerId) return null;

        var container = document.getElementById(containerId);
        if (!container) return null;

        idCounter += 1;
        var monthContainerId = 'ubits-cal-month-' + idCounter;
        var yearContainerId = 'ubits-cal-year-' + idCounter;

        var isRange = options.range === true;
        var currentDate = options.initialDate ? parseDate(options.initialDate) : new Date();
        if (!currentDate) currentDate = new Date();

        var selectedDate = options.selectedDate ? parseDate(options.selectedDate) : null;
        var selectedStartDate = options.selectedStartDate ? parseDate(options.selectedStartDate) : null;
        var selectedEndDate = options.selectedEndDate ? parseDate(options.selectedEndDate) : null;

        var onDateSelect = typeof options.onDateSelect === 'function' ? options.onDateSelect : null;
        var onRangeSelect = typeof options.onRangeSelect === 'function' ? options.onRangeSelect : null;

        var calendar = document.createElement('div');
        calendar.className = 'ubits-calendar-picker';

        function render() {
            var year = currentDate.getFullYear();
            var month = currentDate.getMonth();
            var dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

            var html = '<div class="ubits-calendar-header">' +
                '<button class="ubits-calendar-prev" type="button"><i class="far fa-chevron-left"></i></button>' +
                '<div class="ubits-calendar-selectors">' +
                '<div id="' + monthContainerId + '" class="ubits-calendar-select-container ubits-calendar-select-month"></div>' +
                '<div id="' + yearContainerId + '" class="ubits-calendar-select-container ubits-calendar-select-year"></div>' +
                '</div>' +
                '<button class="ubits-calendar-next" type="button"><i class="far fa-chevron-right"></i></button>' +
                '</div>' +
                '<div class="ubits-calendar-weekdays">';
            for (var i = 0; i < dayNames.length; i++) {
                html += '<div class="ubits-calendar-weekday">' + dayNames[i] + '</div>';
            }
            html += '</div><div class="ubits-calendar-days">';

            var firstDay = new Date(year, month, 1);
            var lastDay = new Date(year, month + 1, 0);
            var daysInMonth = lastDay.getDate();
            var startingDay = firstDay.getDay();

            var startTime = selectedStartDate ? dateToTime(new Date(selectedStartDate.getTime())) : null;
            var endTime = selectedEndDate ? dateToTime(new Date(selectedEndDate.getTime())) : null;
            if (isRange && startTime && endTime && startTime > endTime) {
                var t = startTime;
                startTime = endTime;
                endTime = t;
            }

            for (var e = 0; e < startingDay; e++) {
                html += '<div class="ubits-calendar-day ubits-calendar-day--empty"></div>';
            }
            for (var day = 1; day <= daysInMonth; day++) {
                var date = new Date(year, month, day);
                var dateTime = dateToTime(new Date(date.getTime()));
                var isToday = date.toDateString() === new Date().toDateString();
                var dayClass = 'ubits-calendar-day';

                if (isRange) {
                    var isRangeStart = startTime && dateTime === startTime;
                    var isRangeEnd = endTime && dateTime === endTime;
                    var isInRange = startTime && endTime && dateTime > startTime && dateTime < endTime;
                    if (isRangeStart) dayClass += ' ubits-calendar-day--range-start';
                    if (isRangeEnd) dayClass += ' ubits-calendar-day--range-end';
                    if (isInRange) dayClass += ' ubits-calendar-day--in-range';
                } else {
                    var isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
                    if (isSelected) dayClass += ' ubits-calendar-day--selected';
                }

                if (isToday) dayClass += ' ubits-calendar-day--today';
                html += '<div class="' + dayClass + '" data-date="' + formatDate(date) + '">' + day + '</div>';
            }
            html += '</div></div>';
            calendar.innerHTML = html;

            if (!calendar.parentNode) {
                container.innerHTML = '';
                container.appendChild(calendar);
            }

            if (typeof window.createInput === 'function') {
                window.createInput({
                    containerId: monthContainerId,
                    type: 'select',
                    variant: 'subtle',
                    size: 'sm',
                    showLabel: false,
                    selectOptions: monthShortNames.map(function (name, index) {
                        return { value: String(index), text: name };
                    }),
                    value: String(month),
                    onChange: function (val) {
                        currentDate.setMonth(parseInt(val, 10));
                        render();
                    }
                });
                window.createInput({
                    containerId: yearContainerId,
                    type: 'select',
                    variant: 'subtle',
                    size: 'sm',
                    showLabel: false,
                    selectOptions: Array.from({ length: 100 }, function (_, i) {
                        var y = currentDate.getFullYear() - 50 + i;
                        return { value: String(y), text: String(y) };
                    }),
                    value: String(year),
                    onChange: function (val) {
                        currentDate.setFullYear(parseInt(val, 10));
                        render();
                    }
                });
            }

            var prevBtn = calendar.querySelector('.ubits-calendar-prev');
            var nextBtn = calendar.querySelector('.ubits-calendar-next');
            var dayEls = calendar.querySelectorAll('.ubits-calendar-day:not(.ubits-calendar-day--empty)');

            prevBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                currentDate.setMonth(currentDate.getMonth() - 1);
                render();
            });
            nextBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                currentDate.setMonth(currentDate.getMonth() + 1);
                render();
            });
            dayEls.forEach(function (dayEl) {
                dayEl.addEventListener('click', function (e) {
                    e.stopPropagation();
                    var dateStr = dayEl.getAttribute('data-date');
                    var parts = dateStr.split('/').map(Number);
                    var clicked = new Date(parts[2], parts[1] - 1, parts[0]);

                    if (isRange) {
                        if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
                            selectedStartDate = new Date(clicked.getTime());
                            selectedEndDate = null;
                        } else {
                            selectedEndDate = new Date(clicked.getTime());
                            var t0 = dateToTime(new Date(selectedStartDate.getTime()));
                            var t1 = dateToTime(new Date(selectedEndDate.getTime()));
                            if (t1 < t0) {
                                var tmp = selectedStartDate;
                                selectedStartDate = selectedEndDate;
                                selectedEndDate = tmp;
                            }
                        }
                        if (onRangeSelect) onRangeSelect(formatDate(selectedStartDate), selectedEndDate ? formatDate(selectedEndDate) : null);
                    } else {
                        selectedDate = clicked;
                        if (onDateSelect) onDateSelect(dateStr);
                    }
                    render();
                });
            });
        }

        render();
        return calendar;
    }

    window.createCalendar = createCalendar;
})();
