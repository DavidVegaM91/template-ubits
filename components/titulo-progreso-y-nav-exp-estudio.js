/**
 * TituloProgresoYNav — Recursos / Cierre (columna derecha).
 * Figma Learn-Components 89:2653 — estados: No progress | En progreso | Completado
 *
 * tituloProgresoYNavExpEstudioHtml({
 *   title,
 *   mode: 'no-progress' | 'en-progreso' | 'completado',
 *   progressValue, progressStatus,
 *   primaryLabel, // override opcional
 *   primaryDisabled
 * })
 * initTituloProgresoYNavExpEstudio(root, { onRegresar, onPrimary })
 *
 * Completado → «Ver más contenidos» (sin ícono, a diferencia de TituloSpecsCta).
 * No progress / En progreso → «Continuar» (sin ícono).
 */
(function (global) {
  'use strict';

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function normalizeMode(mode) {
    var m = String(mode || '').toLowerCase().replace(/_/g, '-');
    if (m === 'completado' || m === 'completed') return 'completado';
    if (m === 'en-progreso' || m === 'en progreso' || m === 'in-progress') return 'en-progreso';
    if (m === 'no-progress' || m === 'no progress') return 'no-progress';
    return '';
  }

  function tituloProgresoYNavExpEstudioHtml(opts) {
    opts = opts || {};
    var mode = normalizeMode(opts.mode);
    var primaryLabel =
      opts.primaryLabel != null
        ? String(opts.primaryLabel)
        : mode === 'completado'
          ? 'Ver más contenidos'
          : 'Continuar';
    var primaryDisabled = opts.primaryDisabled === true;
    var cls = ['ubits-titulo-progreso-nav-exp'];
    if (opts.className) cls.push(opts.className);

    var progressValue = opts.progressValue;
    var progressStatus = opts.progressStatus;
    if (mode === 'completado') {
      if (progressValue == null) progressValue = 100;
      if (!progressStatus) progressStatus = 'completed';
    } else if (mode === 'no-progress') {
      if (progressValue == null) progressValue = 0;
      if (!progressStatus) progressStatus = 'no-progress';
    } else if (mode === 'en-progreso') {
      if (progressValue == null) progressValue = 50;
      if (!progressStatus) progressStatus = 'in-progress';
    } else if (progressValue == null) {
      progressValue = 0;
    }

    var progress = '';
    if (typeof global.progresoExpEstudioHtml === 'function') {
      progress = global.progresoExpEstudioHtml({
        value: progressValue,
        status: progressStatus
      });
    }

    return (
      '<div class="' +
      cls.join(' ') +
      '"' +
      (mode ? ' data-mode="' + escapeHtml(mode) + '"' : '') +
      '>' +
      '<h2 class="ubits-titulo-progreso-nav-exp__title ubits-display-d4-bold">' +
      escapeHtml(opts.title || '') +
      '</h2>' +
      '<div class="ubits-titulo-progreso-nav-exp__nav">' +
      '<button type="button" class="ubits-button ubits-button--secondary ubits-button--md" data-action="regresar">' +
      '<span>Regresar</span></button>' +
      '<button type="button" class="ubits-button ubits-button--primary ubits-button--md" data-action="primary"' +
      (primaryDisabled ? ' disabled' : '') +
      '>' +
      '<span>' +
      escapeHtml(primaryLabel) +
      '</span></button>' +
      '</div>' +
      progress +
      '</div>'
    );
  }

  function initTituloProgresoYNavExpEstudio(root, handlers) {
    if (!root) return null;
    handlers = handlers || {};
    function onClick(e) {
      var btn = e.target.closest('[data-action]');
      if (!btn || !root.contains(btn) || btn.disabled) return;
      var action = btn.getAttribute('data-action');
      if (action === 'regresar' && typeof handlers.onRegresar === 'function') handlers.onRegresar(e);
      if (action === 'primary' && typeof handlers.onPrimary === 'function') handlers.onPrimary(e);
    }
    root.addEventListener('click', onClick);
    return {
      setPrimaryDisabled: function (disabled) {
        var btn = root.querySelector('[data-action="primary"]');
        if (btn) btn.disabled = !!disabled;
      },
      setPrimaryLabel: function (label) {
        var span = root.querySelector('[data-action="primary"] span');
        if (span) span.textContent = label;
      },
      destroy: function () {
        root.removeEventListener('click', onClick);
      }
    };
  }

  global.tituloProgresoYNavExpEstudioHtml = tituloProgresoYNavExpEstudioHtml;
  global.initTituloProgresoYNavExpEstudio = initTituloProgresoYNavExpEstudio;
})(typeof window !== 'undefined' ? window : this);
