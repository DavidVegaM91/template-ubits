/* ========================================
   Utilidad transversal — fechas humanizadas y estado de planes por fechas
   Expone funciones en window para cualquier vista (LMS Creator, tareas, etc.)
   ======================================== */

(function () {
    'use strict';

    var mesesCorto = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

    /**
     * Parsea DD/MM/YYYY o YYYY-MM-DD a Date
     */
    function parseDate(str) {
        if (!str || typeof str !== 'string') return null;
        var parts = str.trim().split(/[\/\-]/);
        if (parts.length < 3) return null;
        var d, m, y;
        if (parts[0].length === 4) {
            y = parseInt(parts[0], 10);
            m = parseInt(parts[1], 10) - 1;
            d = parseInt(parts[2], 10);
        } else {
            d = parseInt(parts[0], 10);
            m = parseInt(parts[1], 10) - 1;
            y = parseInt(parts[2], 10);
        }
        if (isNaN(d) || isNaN(m) || isNaN(y)) return null;
        var date = new Date(y, m, d);
        return isNaN(date.getTime()) ? null : date;
    }

    /**
     * Formato humanizado: "Hace X min", "Hace 2 h", "Hace 3 días" o "15 ene 2025"
     * dateStr: DD/MM/YYYY o Date
     */
    window.formatDateHumanized = function (dateStr) {
        var d = typeof dateStr === 'object' && dateStr instanceof Date ? dateStr : parseDate(String(dateStr || ''));
        if (!d) return '';
        var now = new Date();
        now.setHours(23, 59, 59, 999);
        var startOfToday = new Date(now);
        startOfToday.setHours(0, 0, 0, 0);
        var diffMs = now - d;
        var diffMins = Math.floor(diffMs / 60000);
        var diffHours = Math.floor(diffMs / 3600000);
        var diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 0) return d.getDate() + ' ' + mesesCorto[d.getMonth()] + ' ' + d.getFullYear();
        if (diffMins < 60) return 'Hace ' + (diffMins <= 1 ? 'un momento' : diffMins + ' min');
        if (diffHours < 24) return 'Hace ' + (diffHours === 1 ? '1 h' : diffHours + ' h');
        if (diffDays <= 7) return 'Hace ' + (diffDays === 1 ? '1 día' : diffDays + ' días');
        return d.getDate() + ' ' + mesesCorto[d.getMonth()] + ' ' + d.getFullYear();
    };

    /**
     * Formato DD mmm AAAA (igual que tabla de seguimiento), ej. "28 feb 2025"
     * dateStr: DD/MM/YYYY o YYYY-MM-DD
     */
    window.formatDateDDMmmAAAA = function (dateStr) {
        var d = parseDate(String(dateStr || ''));
        if (!d) return dateStr || '';
        return d.getDate() + ' ' + mesesCorto[d.getMonth()] + ' ' + d.getFullYear();
    };

    /**
     * Estado del plan según fechas: hoy < inicio → Planeado; hoy > fin → No vigente; si no → Vigente
     */
    window.getEstadoFromFechas = function (fechaInicio, fechaFin) {
        var inicio = parseDate(String(fechaInicio || ''));
        var fin = parseDate(String(fechaFin || ''));
        if (!inicio || !fin) return 'Vigente';
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        if (today < inicio) return 'Planeado';
        if (today > fin) return 'No vigente';
        return 'Vigente';
    };

    /**
     * Estado al terminar de procesar un plan recién creado: solo Planeado o Vigente (nunca No vigente).
     * fechaInicio en DD/MM/YYYY. Si hoy < fecha de inicio → Planeado; si no → Vigente.
     */
    window.getEstadoAlTerminarProcesando = function (fechaInicio, fechaFin) {
        var inicio = parseDate(String(fechaInicio || ''));
        if (!inicio) return 'Vigente';
        inicio.setHours(0, 0, 0, 0);
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        return today.getTime() < inicio.getTime() ? 'Planeado' : 'Vigente';
    };

    /**
     * Aplica formato humanizado a celdas con data-date (valor DD/MM/YYYY o YYYY-MM-DD)
     * tableId: id de la tabla
     * dateCols: ['fecha-inicio', 'fecha-fin'] (data-col de las celdas)
     */
    window.humanizeTableDates = function (tableId, dateCols) {
        dateCols = dateCols || ['fecha-inicio', 'fecha-fin'];
        var table = document.getElementById(tableId);
        if (!table) return;
        dateCols.forEach(function (col) {
            table.querySelectorAll('tbody td[data-col="' + col + '"]').forEach(function (td) {
                var span = td.querySelector('span.ubits-body-sm-regular');
                var raw = td.getAttribute('data-date') || (span && span.textContent) || '';
                if (!raw) return;
                var formatted = window.formatDateHumanized(raw);
                if (formatted && span) {
                    span.textContent = formatted;
                    td.setAttribute('data-date', raw.replace(/\//g, '-'));
                }
            });
        });
    };
})();
