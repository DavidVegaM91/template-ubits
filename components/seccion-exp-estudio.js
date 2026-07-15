/**
 * SeccionExpEstudio — tarjeta de sección learner (base = SeccionCreator).
 * Colapsable + info → modal solo lectura + PaginasExpEstudio.
 *
 * seccionExpEstudioHtml({ id, title, descriptionHtml?, pages?, collapsed? })
 * initSeccionExpEstudio(root, { section, onPageClick, onSectionToggle })
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
    if (typeof global.paginasExpEstudioHtml !== 'function') {
      console.warn('[seccion-exp-estudio] falta paginasExpEstudioHtml');
      return '';
    }
    return pages
      .map(function (p) {
        return global.paginasExpEstudioHtml(p);
      })
      .join('');
  }

  function openSectionInfoModal(title, descriptionHtml) {
    if (typeof global.openModal !== 'function') {
      console.warn('[seccion-exp-estudio] falta openModal');
      return;
    }
    var overlayId = 'seccion-exp-section-info-modal';
    global.openModal({
      overlayId: overlayId,
      title: title || '',
      size: 'sm',
      bodyHtml: '<div class="ubits-seccion-exp__description-body">' + descriptionHtml + '</div>',
      footerHtml:
        '<button type="button" class="ubits-button ubits-button--primary ubits-button--md" data-seccion-exp-entendido>' +
        '<span>Entendido</span></button>',
      closeOnOverlayClick: true
    });
    setTimeout(function () {
      var btn = document.querySelector('[data-seccion-exp-entendido]');
      if (btn) {
        btn.addEventListener(
          'click',
          function () {
            if (typeof global.closeModal === 'function') global.closeModal(overlayId);
          },
          { once: true }
        );
      }
    }, 0);
  }

  function seccionExpEstudioHtml(opts) {
    opts = opts || {};
    var id = String(opts.id || '');
    var expanded = !opts.collapsed;
    var showInfo = hasDescription(opts.descriptionHtml);
    var cls =
      'ubits-seccion-exp' + (expanded ? '' : ' is-collapsed') + (opts.className ? ' ' + opts.className : '');

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
      escapeHtml(opts.title || '') +
      '</span>' +
      '<span class="ubits-seccion-exp__actions">' +
      infoBtn +
      '<span class="ubits-seccion-exp__chevron" aria-hidden="true">' +
      '<i class="far fa-chevron-down"></i>' +
      '</span>' +
      '</span>' +
      '</div>' +
      '<div class="ubits-seccion-exp__pages" role="list">' +
      pagesHtml(opts.pages) +
      '</div>' +
      '</section>'
    );
  }

  function toggleSection(section, header) {
    var willExpand = section.classList.contains('is-collapsed');
    section.classList.toggle('is-collapsed', !willExpand);
    header.setAttribute('aria-expanded', willExpand ? 'true' : 'false');
    return willExpand;
  }

  function initSeccionExpEstudio(root, handlers) {
    if (!root) return null;
    handlers = handlers || {};
    var sectionMeta = handlers.section || {};

    function onClick(e) {
      var infoBtn = e.target.closest('[data-action="section-info"]');
      if (infoBtn && root.contains(infoBtn)) {
        e.preventDefault();
        e.stopPropagation();
        openSectionInfoModal(sectionMeta.title || '', sectionMeta.descriptionHtml || '');
        return;
      }

      var headerEl = e.target.closest('.ubits-seccion-exp__header');
      if (headerEl && root.contains(headerEl)) {
        var section = headerEl.closest('.ubits-seccion-exp') || root;
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
      var section = headerEl.closest('.ubits-seccion-exp') || root;
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

  global.seccionExpEstudioHtml = seccionExpEstudioHtml;
  global.initSeccionExpEstudio = initSeccionExpEstudio;
  global.openSeccionExpEstudioInfoModal = openSectionInfoModal;
})(typeof window !== 'undefined' ? window : this);
