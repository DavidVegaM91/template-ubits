/**
 * Feedback Exp Estudio — Locked | Check | Progress (24px).
 * feedbackExpEstudioHtml({ type, className, ariaLabel })
 */
(function (global) {
  'use strict';

  var TYPES = {
    locked: { icon: 'fa-lock', aria: 'Bloqueada' },
    check: { icon: 'fa-check', aria: 'Completada' },
    progress: { icon: 'fa-spinner', aria: 'En progreso' }
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
    var icon = 'far ' + meta.icon;
    if (type === 'check') icon = 'fas fa-check';
    if (type === 'progress') icon = 'fas fa-spinner';
    return (
      '<span class="' +
      cls.join(' ') +
      '" role="img" aria-label="' +
      String(aria).replace(/"/g, '&quot;') +
      '">' +
      '<i class="' +
      icon +
      '" aria-hidden="true"></i>' +
      '</span>'
    );
  }

  global.feedbackExpEstudioHtml = feedbackExpEstudioHtml;
  global.FEEDBACK_EXP_ESTUDIO_TYPES = Object.keys(TYPES);
})(typeof window !== 'undefined' ? window : this);
