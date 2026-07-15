/**
 * IndiceExpEstudio — stack de SeccionExpEstudio (tarjetas separadas, gap-md).
 *
 * Depende: seccion-exp-estudio.js, paginas-exp-estudio.js
 *
 * indiceExpEstudioHtml({ sections, collapsedIds, className })
 * initIndiceExpEstudio(root, { sections, onPageClick, onSectionToggle })
 *
 * sections: [{
 *   id, title, descriptionHtml?,
 *   pages: [{ id, title, tipo, state, clickable }]
 * }]
 */
(function (global) {
  'use strict';

  function buildSectionMap(sections) {
    var map = {};
    (sections || []).forEach(function (s) {
      if (s && s.id != null) map[String(s.id)] = s;
    });
    return map;
  }

  function indiceExpEstudioHtml(opts) {
    opts = opts || {};
    var sections = Array.isArray(opts.sections) ? opts.sections : [];
    var collapsed = {};
    (opts.collapsedIds || []).forEach(function (id) {
      collapsed[String(id)] = true;
    });

    if (typeof global.seccionExpEstudioHtml !== 'function') {
      console.warn('[indice-exp-estudio] falta seccionExpEstudioHtml');
      return '<div class="ubits-indice-exp"></div>';
    }

    var cls = ['ubits-indice-exp'];
    if (opts.className) cls.push(opts.className);

    var body = sections
      .map(function (section) {
        var id = String(section.id || '');
        return global.seccionExpEstudioHtml({
          id: id,
          title: section.title,
          descriptionHtml: section.descriptionHtml,
          pages: section.pages,
          collapsed: !!collapsed[id]
        });
      })
      .join('');

    return '<div class="' + cls.join(' ') + '">' + body + '</div>';
  }

  function toggleSection(section, header) {
    var willExpand = section.classList.contains('is-collapsed');
    section.classList.toggle('is-collapsed', !willExpand);
    header.setAttribute('aria-expanded', willExpand ? 'true' : 'false');
    return willExpand;
  }

  function initIndiceExpEstudio(root, handlers) {
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
        return;
      }

      var pageItem = e.target.closest('.ubits-paginas-exp__item.is-clickable');
      if (pageItem && root.contains(pageItem) && typeof handlers.onPageClick === 'function') {
        handlers.onPageClick(pageItem.getAttribute('data-page-id'), pageItem);
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

  function createIndiceExpEstudio(opts) {
    opts = opts || {};
    var container =
      opts.container ||
      (opts.containerId ? document.getElementById(opts.containerId) : null);
    if (!container) return null;
    container.innerHTML = indiceExpEstudioHtml(opts);
    var root = container.querySelector('.ubits-indice-exp') || container;
    var api = initIndiceExpEstudio(root, {
      sections: opts.sections,
      onPageClick: opts.onPageClick,
      onSectionToggle: opts.onSectionToggle
    });
    return {
      root: root,
      destroy: function () {
        if (api) api.destroy();
        container.innerHTML = '';
      }
    };
  }

  global.indiceExpEstudioHtml = indiceExpEstudioHtml;
  global.initIndiceExpEstudio = initIndiceExpEstudio;
  global.createIndiceExpEstudio = createIndiceExpEstudio;
})(typeof window !== 'undefined' ? window : this);
