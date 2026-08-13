/**
 * Feedback Exp Estudio — Locked | Check | Progress (24px).
 * feedbackExpEstudioHtml({ type, className, ariaLabel, tooltip })
 * Tooltip por defecto: Bloqueado / Visto / Pendiente.
 */
(function (global) {
  'use strict';

  var TYPES = {
    locked: { icon: 'fa-lock', aria: 'Bloqueado' },
    check: { icon: 'fa-check', aria: 'Visto' },
    progress: { icon: 'fa-spinner', aria: 'Pendiente' }
  };

  function normalizeType(type) {
    var t = String(type || 'locked').toLowerCase();
    if (t === 'locked' || t === 'check' || t === 'progress') return t;
    return 'locked';
  }

  function feedbackExpEstudioHtml(opts) {
    opts = opts || {};
    var type = normalizeType(opts.type);
    var meta = TYPES[type];
    var cls = ['ubits-feedback-exp', 'ubits-feedback-exp--' + type];
    if (opts.className) cls.push(opts.className);
    var aria = opts.ariaLabel || meta.aria;
    var tooltip =
      opts.tooltip != null && String(opts.tooltip).trim() !== ''
        ? String(opts.tooltip).trim()
        : aria;
    var tooltipAttrs = tooltip
      ? ' data-tooltip="' +
        String(tooltip).replace(/"/g, '&quot;') +
        '" data-tooltip-delay="0" tabindex="0"'
      : '';
    var icon = 'far ' + meta.icon;
    if (type === 'check') icon = 'fas fa-check';
    if (type === 'progress') icon = 'fas fa-spinner';
    return (
      '<span class="' +
      cls.join(' ') +
      '" role="img" aria-label="' +
      String(aria).replace(/"/g, '&quot;') +
      '"' +
      tooltipAttrs +
      '>' +
      '<i class="' +
      icon +
      '" aria-hidden="true"></i>' +
      '</span>'
    );
  }

  global.feedbackExpEstudioHtml = feedbackExpEstudioHtml;
  global.FEEDBACK_EXP_ESTUDIO_TYPES = Object.keys(TYPES);
})(typeof window !== 'undefined' ? window : this);
