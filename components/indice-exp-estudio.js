/**
 * IndiceExpEstudio — stack de SeccionExpEstudio (tarjetas separadas, gap-md).
 *
 * Depende: seccion-exp-estudio.js, paginas-exp-estudio.js, modal.js (móvil)
 *
 * indiceExpEstudioHtml({ sections, collapsedIds, className, modalTitle })
 * initIndiceExpEstudio(root, { sections, onPageClick, onSectionToggle, modalTitle })
 *
 * Desktop (≥1024): índice inline.
 * ≤1023px: botón «Ver índice» → openModal sin footer.
 *
 * sections: [{
 *   id, title, descriptionHtml?,
 *   pages: [{ id, title, tipo, state, clickable }]
 * }]
 */
(function (global) {
  'use strict';

  var INDICE_MODAL_ID = 'ubits-indice-exp-modal';

  function buildSectionMap(sections) {
    var map = {};
    (sections || []).forEach(function (s) {
      if (s && s.id != null) map[String(s.id)] = s;
    });
    return map;
  }

  function sectionsStackHtml(sections, collapsed) {
    if (typeof global.seccionExpEstudioHtml !== 'function') {
      console.warn('[indice-exp-estudio] falta seccionExpEstudioHtml');
      return '';
    }
    return sections
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
  }

  function indiceExpEstudioHtml(opts) {
    opts = opts || {};
    var sections = Array.isArray(opts.sections) ? opts.sections : [];
    var collapsed = {};
    (opts.collapsedIds || []).forEach(function (id) {
      collapsed[String(id)] = true;
    });

    var cls = ['ubits-indice-exp'];
    if (opts.className) cls.push(opts.className);

    var stack = sectionsStackHtml(sections, collapsed);

    return (
      '<div class="' +
      cls.join(' ') +
      '">' +
      '<div class="ubits-indice-exp__desktop">' +
      '<div class="ubits-indice-exp__stack">' +
      stack +
      '</div></div>' +
      '<div class="ubits-indice-exp__mobile">' +
      '<button type="button" class="ubits-button ubits-button--secondary ubits-button--md ubits-indice-exp__trigger" data-action="open-indice-modal">' +
      '<i class="far fa-list" aria-hidden="true"></i><span>Ver índice</span>' +
      '</button>' +
      '</div></div>'
    );
  }

  function toggleSection(section, header) {
    var willExpand = section.classList.contains('is-collapsed');
    section.classList.toggle('is-collapsed', !willExpand);
    header.setAttribute('aria-expanded', willExpand ? 'true' : 'false');
    return willExpand;
  }

  function bindIndiceInteractions(root, handlers) {
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

  function openIndiceModal(handlers) {
    handlers = handlers || {};
    if (typeof global.openModal !== 'function') {
      console.warn('[indice-exp-estudio] falta openModal');
      return;
    }
    var sections = handlers.sections || [];
    var collapsed = {};
    var bodyHtml =
      '<div class="ubits-indice-exp__stack ubits-indice-exp__stack--modal">' +
      sectionsStackHtml(sections, collapsed) +
      '</div>';
    var title = handlers.modalTitle != null ? String(handlers.modalTitle) : 'Índice';
    var modalApi = null;

    global.openModal({
      overlayId: INDICE_MODAL_ID,
      title: title,
      bodyHtml: bodyHtml,
      size: 'md',
      showFooter: false,
      closeOnOverlayClick: true,
      onClose: function () {
        if (modalApi && typeof modalApi.destroy === 'function') modalApi.destroy();
        modalApi = null;
      }
    });

    var overlay = document.getElementById(INDICE_MODAL_ID);
    var body = overlay ? overlay.querySelector('.ubits-modal-body') : null;
    if (!body) return;

    modalApi = bindIndiceInteractions(body, {
      sections: sections,
      onSectionToggle: handlers.onSectionToggle,
      onPageClick: function (pageId, pageItem) {
        if (typeof global.closeModal === 'function') global.closeModal(INDICE_MODAL_ID);
        if (typeof handlers.onPageClick === 'function') handlers.onPageClick(pageId, pageItem);
      }
    });
  }

  function initIndiceExpEstudio(root, handlers) {
    if (!root) return null;
    handlers = handlers || {};

    var desktop = root.querySelector('.ubits-indice-exp__desktop') || root;
    var desktopApi = bindIndiceInteractions(desktop, handlers);

    function onRootClick(e) {
      var trigger = e.target.closest('[data-action="open-indice-modal"]');
      if (!trigger || !root.contains(trigger)) return;
      e.preventDefault();
      openIndiceModal(handlers);
    }
    root.addEventListener('click', onRootClick);

    return {
      destroy: function () {
        root.removeEventListener('click', onRootClick);
        if (desktopApi) desktopApi.destroy();
        if (typeof global.closeModal === 'function') {
          var existing = document.getElementById(INDICE_MODAL_ID);
          if (existing) global.closeModal(INDICE_MODAL_ID);
        }
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
      onSectionToggle: opts.onSectionToggle,
      modalTitle: opts.modalTitle
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
