/**
 * ProgresoExpEstudio — flag + «Tu progreso:» + ProgressBar lg + %.
 * progresoExpEstudioHtml({ value, status, label, className })
 * status: 'in-progress' | 'completed' | 'no-progress'
 *
 * Figma: Learn-Components · ProgresoExpEstudio (fila horizontal).
 */
(function (global) {
  'use strict';

  function clamp(value) {
    var n = Math.round(Number(value));
    if (isNaN(n)) return 0;
    return Math.max(0, Math.min(100, n));
  }

  function normalizeStatus(status, value) {
    var s = String(status || '').toLowerCase();
    if (s === 'completed' || s === 'complete' || s === 'completado') return 'completed';
    if (s === 'no-progress' || s === 'no_progress') return 'no-progress';
    if (value >= 100) return 'completed';
    return 'in-progress';
  }

  function progresoExpEstudioHtml(opts) {
    opts = opts || {};
    var value = clamp(opts.value);
    var status = normalizeStatus(opts.status, value);
    if (status === 'completed') value = 100;
    if (status === 'no-progress' && opts.value == null) value = 0;
    var label = opts.label != null ? String(opts.label) : 'Tu progreso:';
    var cls = ['ubits-progreso-exp'];
    if (status === 'completed') cls.push('ubits-progreso-exp--completed');
    if (status === 'no-progress') cls.push('ubits-progreso-exp--no-progress');
    if (opts.className) cls.push(opts.className);

    var barOpts = {
      value: value,
      size: 'lg',
      rounded: true,
      status: status === 'completed' ? 'complete' : undefined,
      ariaLabel: label
    };
    var barHtml =
      typeof global.progressBarHtml === 'function'
        ? global.progressBarHtml(barOpts)
        : '<div class="ubits-progress-bar ubits-progress-bar--lg" role="progressbar" aria-valuenow="' +
          value +
          '"><div class="ubits-progress-bar__track"><div class="ubits-progress-bar__fill" style="width:' +
          value +
          '%"></div></div></div>';

    return (
      '<div class="' +
      cls.join(' ') +
      '" data-status="' +
      status +
      '">' +
      '<i class="far fa-flag ubits-progreso-exp__flag" aria-hidden="true"></i>' +
      '<p class="ubits-progreso-exp__label ubits-body-md-bold">' +
      escapeHtml(label) +
      '</p>' +
      '<div class="ubits-progreso-exp__bar">' +
      barHtml +
      '</div>' +
      '<p class="ubits-progreso-exp__percent">' +
      value +
      ' %</p>' +
      '</div>'
    );
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  global.progresoExpEstudioHtml = progresoExpEstudioHtml;
})(typeof window !== 'undefined' ? window : this);
