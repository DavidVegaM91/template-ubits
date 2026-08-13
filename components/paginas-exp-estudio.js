/**
 * PaginasExpEstudio — fila learner basada en Paginas Creator (sin drag ni menú).
 * A la derecha: Feedback Locked | Progress | Check (según estado).
 *
 * paginasExpEstudioHtml({ id, title, tipo, state, clickable, className })
 *
 * Estados (state):
 * - bloqueada          → no se puede abrir; feedback locked
 * - disponible         → libre: aún no visitada, se puede abrir; sin feedback
 * - activa             → en curso (primera visita); feedback progress (cosito azul)
 * - completada         → ya finalizada, no es la actual; feedback check
 * - completada-activa  → ya finalizada y es la actual al revisitar; check + resalte
 *
 * Completar recurso: al salir de la página (Continuar / índice). Eval: solo con
 * resultado aprobado. En libre, la visita actual cuenta para desbloquear Fin
 * aunque visualmente siga en `activa`.
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

  function paginasExpEstudioHtml(opts) {
    opts = opts || {};
    var state = normalizeState(opts.state);
    var title = opts.title != null ? String(opts.title) : '';
    var clickable = opts.clickable === true && state !== 'bloqueada';
    /* completada-activa reutiliza chrome de activa + class propia; feedback = check */
    var itemCls = ['ubits-paginas-exp__item'];
    if (state === 'completada-activa') {
      itemCls.push('is-completada', 'is-activa', 'is-completada-activa');
    } else {
      itemCls.push('is-' + state);
    }
    if (clickable) itemCls.push('is-clickable');
    if (opts.className) itemCls.push(opts.className);

    var feedbackType = feedbackTypeForState(state);
    var feedbackLabel =
      feedbackType === 'check' ? 'Visto' : feedbackType === 'progress' ? 'Pendiente' : 'Bloqueado';
    var feedbackHtml =
      feedbackType && typeof global.feedbackExpEstudioHtml === 'function'
        ? global.feedbackExpEstudioHtml({
            type: feedbackType,
            className: 'ubits-paginas-exp__feedback',
            ariaLabel: feedbackLabel,
            tooltip: feedbackLabel
          })
        : '';

    var idAttr = opts.id ? ' data-page-id="' + escapeHtml(opts.id) + '"' : '';
    var rowTag = clickable ? 'button' : 'div';
    var rowType = clickable ? ' type="button"' : '';
    var ariaCurrent =
      state === 'activa' || state === 'completada-activa' ? ' aria-current="true"' : '';
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
