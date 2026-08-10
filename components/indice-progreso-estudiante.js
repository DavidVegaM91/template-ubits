/**
 * IndiceProgresoEstudiante — índice admin drawer Resultados.
 * Stack de secciones (chrome Seccion Exp) + Paginas Progreso Estudiante.
 *
 * createIndiceProgresoEstudiante({ container, sections, collapsedIds })
 */
(function (global) {
  'use strict';

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function hasDescription(html) {
    if (!html) return false;
    return String(html)
      .replace(/<[^>]*>/g, '')
      .trim().length > 0;
  }

  function pagesHtml(pages) {
    if (!pages || !pages.length) return '';
    if (typeof global.paginasProgresoEstudianteHtml !== 'function') {
      console.warn('[indice-progreso-estudiante] falta paginasProgresoEstudianteHtml');
      return '';
    }
    return pages
      .map(function (p) {
        return global.paginasProgresoEstudianteHtml(p);
      })
      .join('');
  }

  function sectionHtml(section, collapsed) {
    var id = String(section.id || '');
    var expanded = !collapsed;
    var showInfo = hasDescription(section.descriptionHtml);
    var cls = 'ubits-seccion-exp' + (expanded ? '' : ' is-collapsed');

    var infoBtn = showInfo
      ? '<button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only ubits-seccion-exp__info-btn"' +
        ' data-action="section-info"' +
        ' data-tooltip="Sección con descripción" data-tooltip-delay="1000"' +
        ' aria-label="Sección con descripción">' +
        '<i class="far fa-circle-info" aria-hidden="true"></i></button>'
      : '';

    return (
      '<section class="' +
      cls +
      '" data-section-id="' +
      escapeHtml(id) +
      '">' +
      '<div class="ubits-seccion-exp__header" role="button" tabindex="0" aria-expanded="' +
      (expanded ? 'true' : 'false') +
      '">' +
      '<span class="ubits-seccion-exp__title ubits-body-md-semibold">' +
      escapeHtml(section.title || '') +
      '</span>' +
      '<span class="ubits-seccion-exp__actions">' +
      infoBtn +
      '<span class="ubits-seccion-exp__chevron" aria-hidden="true">' +
      '<i class="far fa-chevron-down"></i>' +
      '</span>' +
      '</span>' +
      '</div>' +
      '<div class="ubits-seccion-exp__pages" role="list">' +
      pagesHtml(section.pages) +
      '</div>' +
      '</section>'
    );
  }

  function indiceProgresoEstudianteHtml(opts) {
    opts = opts || {};
    var sections = Array.isArray(opts.sections) ? opts.sections : [];
    var collapsed = {};
    (opts.collapsedIds || []).forEach(function (id) {
      collapsed[String(id)] = true;
    });

    var stack = sections
      .map(function (section) {
        var id = String(section.id || '');
        return sectionHtml(section, !!collapsed[id]);
      })
      .join('');

    return (
      '<div class="ubits-indice-progreso">' +
      '<div class="ubits-indice-progreso__stack">' +
      stack +
      '</div></div>'
    );
  }

  function buildSectionMap(sections) {
    var map = {};
    (sections || []).forEach(function (s) {
      if (s && s.id != null) map[String(s.id)] = s;
    });
    return map;
  }

  function toggleSection(section, header) {
    var willExpand = section.classList.contains('is-collapsed');
    section.classList.toggle('is-collapsed', !willExpand);
    header.setAttribute('aria-expanded', willExpand ? 'true' : 'false');
    return willExpand;
  }

  function initIndiceProgresoEstudiante(root, handlers) {
    if (!root) return null;
    handlers = handlers || {};
    var sectionMap = buildSectionMap(handlers.sections);

    function onClick(e) {
      var infoBtn = e.target.closest('[data-action="section-info"]');
      if (infoBtn && root.contains(infoBtn)) {
        e.preventDefault();
        e.stopPropagation();
        var sectionEl = infoBtn.closest('.ubits-seccion-exp');
        if (!sectionEl) return;
        var sid = sectionEl.getAttribute('data-section-id') || '';
        var meta = sectionMap[sid] || {};
        if (typeof global.openSeccionExpEstudioInfoModal === 'function') {
          global.openSeccionExpEstudioInfoModal(meta.title || '', meta.descriptionHtml || '');
        }
        return;
      }

      var headerEl = e.target.closest('.ubits-seccion-exp__header');
      if (headerEl && root.contains(headerEl)) {
        var section = headerEl.closest('.ubits-seccion-exp');
        if (!section) return;
        var expanded = toggleSection(section, headerEl);
        if (typeof handlers.onSectionToggle === 'function') {
          handlers.onSectionToggle(section.getAttribute('data-section-id'), expanded);
        }
      }
    }

    function onKeyDown(e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      if (e.target.closest('[data-action="section-info"]')) return;
      var headerEl = e.target.closest('.ubits-seccion-exp__header');
      if (!headerEl || !root.contains(headerEl)) return;
      e.preventDefault();
      var section = headerEl.closest('.ubits-seccion-exp');
      if (!section) return;
      var expanded = toggleSection(section, headerEl);
      if (typeof handlers.onSectionToggle === 'function') {
        handlers.onSectionToggle(section.getAttribute('data-section-id'), expanded);
      }
    }

    root.addEventListener('click', onClick);
    root.addEventListener('keydown', onKeyDown);

    return {
      destroy: function () {
        root.removeEventListener('click', onClick);
        root.removeEventListener('keydown', onKeyDown);
      }
    };
  }

  function createIndiceProgresoEstudiante(opts) {
    opts = opts || {};
    var container =
      opts.container ||
      (opts.containerId ? document.getElementById(opts.containerId) : null);
    if (!container) return null;
    container.innerHTML = indiceProgresoEstudianteHtml(opts);
    var root = container.querySelector('.ubits-indice-progreso') || container;
    var api = initIndiceProgresoEstudiante(root, {
      sections: opts.sections,
      onSectionToggle: opts.onSectionToggle
    });
    if (typeof global.initTooltip === 'function') {
      global.initTooltip(root.querySelectorAll('[data-tooltip]'));
    }
    return {
      root: root,
      destroy: function () {
        if (api) api.destroy();
        container.innerHTML = '';
      }
    };
  }

  global.indiceProgresoEstudianteHtml = indiceProgresoEstudianteHtml;
  global.initIndiceProgresoEstudiante = initIndiceProgresoEstudiante;
  global.createIndiceProgresoEstudiante = createIndiceProgresoEstudiante;
})(typeof window !== 'undefined' ? window : this);
