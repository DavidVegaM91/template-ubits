/**
 * PaginasProgresoEstudiante — fila admin (drawer Resultados).
 * Solo lectura; meta de fecha de finalización. No es Paginas Exp Estudio.
 *
 * paginasProgresoEstudianteHtml({ id, title, tipo, state, completedAtLabel })
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
    var s = String(state || 'bloqueada')
      .toLowerCase()
      .replace(/_/g, '-');
    if (s === 'completada-activa' || s === 'activa-completada') return 'completada-activa';
    if (s === 'activa' || s === 'active') return 'activa';
    if (s === 'completada' || s === 'completed') return 'completada';
    if (s === 'disponible' || s === 'available') return 'disponible';
    return 'bloqueada';
  }

  function feedbackTypeForState(state) {
    if (state === 'completada' || state === 'completada-activa') return 'check';
    if (state === 'activa') return 'progress';
    if (state === 'disponible') return null;
    return 'locked';
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function paginasProgresoEstudianteHtml(opts) {
    opts = opts || {};
    var state = normalizeState(opts.state);
    var title = opts.title != null ? String(opts.title) : '';
    var completedAtLabel =
      opts.completedAtLabel != null ? String(opts.completedAtLabel).trim() : '';
    var showMeta =
      !!completedAtLabel && (state === 'completada' || state === 'completada-activa');

    var itemCls = ['ubits-paginas-progreso__item'];
    if (state === 'completada-activa') {
      itemCls.push('is-completada', 'is-activa', 'is-completada-activa');
    } else {
      itemCls.push('is-' + state);
    }
    if (opts.className) itemCls.push(opts.className);

    var feedbackHtml =
      feedbackTypeForState(state) && typeof global.feedbackExpEstudioHtml === 'function'
        ? global.feedbackExpEstudioHtml({
            type: feedbackTypeForState(state),
            className: 'ubits-paginas-progreso__feedback'
          })
        : '';

    var idAttr = opts.id ? ' data-page-id="' + escapeHtml(opts.id) + '"' : '';
    var ariaCurrent =
      state === 'activa' || state === 'completada-activa' ? ' aria-current="true"' : '';

    return (
      '<div class="' +
      itemCls.join(' ') +
      '"' +
      idAttr +
      ' role="listitem">' +
      '<div class="ubits-paginas-progreso__row"' +
      ariaCurrent +
      ' aria-label="' +
      escapeHtml(title) +
      '">' +
      '<span class="ubits-paginas-progreso__rail" aria-hidden="true"></span>' +
      '<span class="ubits-paginas-progreso__type-icon-wrap" aria-hidden="true"><i class="' +
      iconClass(opts.tipo) +
      '"></i></span>' +
      '<div class="ubits-paginas-progreso__label-wrap">' +
      '<span class="ubits-paginas-progreso__label ubits-body-sm-semibold">' +
      escapeHtml(title) +
      '</span>' +
      (showMeta
        ? '<span class="ubits-paginas-progreso__meta ubits-body-xs-regular">' +
          escapeHtml(completedAtLabel) +
          '</span>'
        : '') +
      '</div></div>' +
      feedbackHtml +
      '</div>'
    );
  }

  global.paginasProgresoEstudianteHtml = paginasProgresoEstudianteHtml;
})(typeof window !== 'undefined' ? window : this);
