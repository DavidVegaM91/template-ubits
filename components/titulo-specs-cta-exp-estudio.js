/**
 * TituloSpecsCtaExpEstudio — portada derecha.
 * Figma Learn-Components 83:2754 — estados: Default | En progreso | Completado
 *
 * tituloSpecsCtaExpEstudioHtml({
 *   contentType, title, level, duration, language,
 *   hasCertificate, subtitles, // string | false
 *   mode: 'por-iniciar' | 'en-progreso' | 'completado',
 *   progressValue
 * })
 * initTituloSpecsCtaExpEstudio(root, { onPrimary, onSecondary })
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

  function specHtml(icon, text) {
    if (!text) return '';
    return (
      '<span class="ubits-titulo-specs-cta-exp__spec">' +
      '<i class="far ' +
      icon +
      '" aria-hidden="true"></i>' +
      '<span>' +
      escapeHtml(text) +
      '</span></span>'
    );
  }

  function primaryCopy(mode) {
    if (mode === 'completado') return { label: 'Ver más contenidos', icon: 'fa-plus' };
    if (mode === 'en-progreso') return { label: 'Continuar', icon: 'fa-play' };
    return { label: 'Comenzar ahora', icon: 'fa-play' };
  }

  function tituloSpecsCtaExpEstudioHtml(opts) {
    opts = opts || {};
    var mode = String(opts.mode || 'por-iniciar').toLowerCase();
    if (mode === 'por_iniciar' || mode === 'default') mode = 'por-iniciar';
    if (mode === 'en_progreso') mode = 'en-progreso';

    var primary = primaryCopy(mode);
    var cls = ['ubits-titulo-specs-cta-exp'];
    if (opts.className) cls.push(opts.className);

    var row1 =
      specHtml('fa-gauge-min', opts.level) +
      specHtml('fa-clock', opts.duration) +
      specHtml('fa-globe', opts.language);

    var row2 = '';
    if (opts.hasCertificate) row2 += specHtml('fa-file-certificate', 'Con certificado');
    if (opts.subtitles) row2 += specHtml('fa-closed-captioning', opts.subtitles);

    var actions =
      '<div class="ubits-titulo-specs-cta-exp__actions">' +
      '<button type="button" class="ubits-button ubits-button--primary ubits-button--md" data-action="primary">' +
      '<i class="far ' +
      primary.icon +
      '" aria-hidden="true"></i><span>' +
      escapeHtml(primary.label) +
      '</span></button>';

    if (mode === 'completado') {
      actions +=
        '<button type="button" class="ubits-button ubits-button--secondary ubits-button--md" data-action="secondary">' +
        '<i class="far fa-file-arrow-down" aria-hidden="true"></i><span>Descargar certificado</span></button>';
    }
    actions += '</div>';

    var progress = '';
    if (mode === 'en-progreso' || mode === 'completado') {
      if (typeof global.progresoExpEstudioHtml === 'function') {
        var pValue =
          opts.progressValue != null
            ? opts.progressValue
            : mode === 'completado'
              ? 100
              : 50;
        progress = global.progresoExpEstudioHtml({
          value: pValue,
          status: mode === 'completado' ? 'completed' : 'in-progress'
        });
      }
    }

    return (
      '<div class="' +
      cls.join(' ') +
      '" data-mode="' +
      escapeHtml(mode) +
      '">' +
      '<div class="ubits-titulo-specs-cta-exp__heading">' +
      '<span class="ubits-badge-tag ubits-badge-tag--outlined ubits-badge-tag--info ubits-badge-tag--sm">' +
      '<span class="ubits-badge-tag__indicator" aria-hidden="true"></span>' +
      '<span class="ubits-badge-tag__text">' +
      escapeHtml(opts.contentType || 'Curso') +
      '</span></span>' +
      '<h2 class="ubits-titulo-specs-cta-exp__title ubits-display-d4-bold">' +
      escapeHtml(opts.title || '') +
      '</h2>' +
      '<div class="ubits-titulo-specs-cta-exp__specs">' +
      '<div class="ubits-titulo-specs-cta-exp__specs-row">' +
      row1 +
      '</div>' +
      (row2
        ? '<div class="ubits-titulo-specs-cta-exp__specs-row">' + row2 + '</div>'
        : '') +
      '</div></div>' +
      actions +
      progress +
      '</div>'
    );
  }

  function initTituloSpecsCtaExpEstudio(root, handlers) {
    if (!root) return null;
    handlers = handlers || {};
    function onClick(e) {
      var btn = e.target.closest('[data-action]');
      if (!btn || !root.contains(btn)) return;
      var action = btn.getAttribute('data-action');
      if (action === 'primary' && typeof handlers.onPrimary === 'function') handlers.onPrimary(e);
      if (action === 'secondary' && typeof handlers.onSecondary === 'function') handlers.onSecondary(e);
    }
    root.addEventListener('click', onClick);
    return {
      destroy: function () {
        root.removeEventListener('click', onClick);
      }
    };
  }

  global.tituloSpecsCtaExpEstudioHtml = tituloSpecsCtaExpEstudioHtml;
  global.initTituloSpecsCtaExpEstudio = initTituloSpecsCtaExpEstudio;
})(typeof window !== 'undefined' ? window : this);
