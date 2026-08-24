/**
 * Mock fechas de finalización por página (drawer Progreso del estudiante).
 * ~8 min entre páginas; seed estable. Paridad React pageCompletionTimestamps.ts
 */
(function (global) {
  'use strict';

  var MESES_CORTO = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  var AVG_MINUTES = 8;

  function parseDateOnly(str) {
    if (!str || typeof str !== 'string') return null;
    var parts = str.trim().split(/[/-]/);
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

  function stableHash(seed, mod) {
    var m = Math.max(1, Math.floor(mod));
    var h = 0;
    var s = String(seed || '');
    for (var i = 0; i < s.length; i++) {
      h = (h * 31 + s.charCodeAt(i)) >>> 0;
    }
    return h % m;
  }

  function pad2(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function formatCompletedAtLabel(date) {
    return (
      date.getDate() +
      ' ' +
      MESES_CORTO[date.getMonth()] +
      ' ' +
      date.getFullYear() +
      ' · ' +
      pad2(date.getHours()) +
      ':' +
      pad2(date.getMinutes())
    );
  }

  function buildPageCompletionDates(opts) {
    opts = opts || {};
    var n = Math.max(0, Math.floor(opts.completedCount || 0));
    if (n === 0) return [];

    var seed = String(opts.seed || 'student');
    var startDay = parseDateOnly(opts.fechaInicio) || new Date();
    var startHour = 8 + stableHash(seed + ':h', 4);
    var startMin = stableHash(seed + ':m', 60);
    var cursor = new Date(
      startDay.getFullYear(),
      startDay.getMonth(),
      startDay.getDate(),
      startHour,
      startMin,
      0,
      0
    );

    var dates = [];
    for (var i = 0; i < n; i++) {
      if (i === 0) {
        dates.push(new Date(cursor.getTime()));
      } else {
        var jitter = 1 + stableHash(seed + ':j:' + i, 2);
        var sign = stableHash(seed + ':s:' + i, 2) === 0 ? -1 : 1;
        cursor.setMinutes(cursor.getMinutes() + AVG_MINUTES + sign * jitter);
        dates.push(new Date(cursor.getTime()));
      }
    }

    var finDay = parseDateOnly(opts.fechaFin);
    if (finDay && n > 0) {
      var endHour = 12 + stableHash(seed + ':eh', 6);
      var endMin = stableHash(seed + ':em', 60);
      var targetEnd = new Date(
        finDay.getFullYear(),
        finDay.getMonth(),
        finDay.getDate(),
        endHour,
        endMin,
        0,
        0
      );
      if (n === 1) {
        dates[0] = targetEnd;
      } else if (targetEnd.getTime() > dates[0].getTime()) {
        var span = targetEnd.getTime() - dates[0].getTime();
        for (var j = 1; j < n; j++) {
          dates[j] = new Date(dates[0].getTime() + Math.round((span * j) / (n - 1)));
        }
        dates[n - 1] = targetEnd;
      } else if (dates[n - 1].getTime() > targetEnd.getTime()) {
        var span2 = Math.max(
          AVG_MINUTES * 60 * 1000 * (n - 1),
          targetEnd.getTime() - dates[0].getTime()
        );
        var start = new Date(targetEnd.getTime() - span2);
        dates[0] = start;
        for (var k = 1; k < n; k++) {
          dates[k] = new Date(start.getTime() + Math.round((span2 * k) / (n - 1)));
        }
        dates[n - 1] = targetEnd;
      }
    }

    return dates;
  }

  function buildPageCompletionLabels(opts) {
    return buildPageCompletionDates(opts).map(formatCompletedAtLabel);
  }

  function addDaysToDateStr(dateStr, days) {
    var d = parseDateOnly(dateStr);
    if (!d) return null;
    d.setDate(d.getDate() + (Number(days) || 0));
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }

  global.ubitsBuildPageCompletionDates = buildPageCompletionDates;
  global.ubitsBuildPageCompletionLabels = buildPageCompletionLabels;
  global.ubitsFormatCompletedAtLabel = formatCompletedAtLabel;
  global.ubitsAddDaysToDateStr = addDaysToDateStr;
})(typeof window !== 'undefined' ? window : this);
