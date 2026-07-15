/**
 * PaginasExpEstudio — fila learner basada en Paginas Creator (sin drag ni menú).
 * A la derecha: Feedback Locked | Progress | Check.
 *
 * paginasExpEstudioHtml({ id, title, tipo, state, clickable, className })
 * state: 'bloqueada' | 'activa' | 'completada'
 */
(function (global) {
  'use strict';

  var TIPO_ICONS =
    global.PAGINAS_CREATOR_TIPO_ICONS ||
    {
      'blank-page': 'fa-file',
      video: 'fa-video',
      texto: 'fa-align-left',
      pdf: 'fa-file-pdf',
      encuesta: 'fa-clipboard-list',
      embebido: 'fa-code',
      scorm: 'fa-cube',
      evaluacion: 'fa-clipboard-check',
      fin: 'fa-flag-checkered'
    };

  function normalizeTipo(tipo) {
    if (typeof global.paginasExpEstudioNormalizeTipo === 'function') {
      /* self — avoid recursion; use local */
    }
    var t = String(tipo || 'blank-page')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-');
    if (t === 'evaluacion-final') t = 'evaluacion';
    return TIPO_ICONS[t] ? t : 'blank-page';
  }

  function iconClass(tipo) {
    if (typeof global.paginasCreatorIconClass === 'function') {
      return global.paginasCreatorIconClass(tipo);
    }
    return 'far ' + (TIPO_ICONS[normalizeTipo(tipo)] || 'fa-file');
  }

  function normalizeState(state) {
    var s = String(state || 'bloqueada').toLowerCase();
    if (s === 'activa' || s === 'active') return 'activa';
    if (s === 'completada' || s === 'completed') return 'completada';
    return 'bloqueada';
  }

  function feedbackTypeForState(state) {
    if (state === 'completada') return 'check';
    if (state === 'activa') return 'progress';
    return 'locked';
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function paginasExpEstudioHtml(opts) {
    opts = opts || {};
    var state = normalizeState(opts.state);
    var title = opts.title != null ? String(opts.title) : '';
    var clickable = opts.clickable === true && state !== 'bloqueada';
    var itemCls = [
      'ubits-paginas-exp__item',
      'is-' + state
    ];
    if (clickable) itemCls.push('is-clickable');
    if (opts.className) itemCls.push(opts.className);

    var feedbackHtml =
      typeof global.feedbackExpEstudioHtml === 'function'
        ? global.feedbackExpEstudioHtml({
            type: feedbackTypeForState(state),
            className: 'ubits-paginas-exp__feedback'
          })
        : '';

    var idAttr = opts.id ? ' data-page-id="' + escapeHtml(opts.id) + '"' : '';
    var rowTag = clickable ? 'button' : 'div';
    var rowType = clickable ? ' type="button"' : '';
    var ariaCurrent = state === 'activa' ? ' aria-current="true"' : '';
    var ariaLabel =
      state === 'bloqueada'
        ? 'Página bloqueada: ' + title
        : clickable
          ? 'Ir a página ' + title
          : title;

    return (
      '<div class="' +
      itemCls.join(' ') +
      '"' +
      idAttr +
      ' role="listitem">' +
      '<' +
      rowTag +
      rowType +
      ' class="ubits-paginas-exp__row"' +
      ariaCurrent +
      ' aria-label="' +
      escapeHtml(ariaLabel) +
      '">' +
      '<span class="ubits-paginas-exp__rail" aria-hidden="true"></span>' +
      '<span class="ubits-paginas-exp__type-icon-wrap" aria-hidden="true"><i class="' +
      iconClass(opts.tipo) +
      '"></i></span>' +
      '<div class="ubits-paginas-exp__label-wrap">' +
      '<span class="ubits-paginas-exp__label ubits-body-sm-semibold">' +
      escapeHtml(title) +
      '</span></div>' +
      '</' +
      rowTag +
      '>' +
      feedbackHtml +
      '</div>'
    );
  }

  global.paginasExpEstudioHtml = paginasExpEstudioHtml;
  global.paginasExpEstudioNormalizeTipo = normalizeTipo;
  global.paginasExpEstudioNormalizeState = normalizeState;
  global.PAGINAS_EXP_ESTUDIO_TIPO_ICONS = TIPO_ICONS;
})(typeof window !== 'undefined' ? window : this);
