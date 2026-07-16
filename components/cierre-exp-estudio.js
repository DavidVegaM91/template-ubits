/**
 * CierreExpEstudio — felicitación APP + cert card + carrusel «Sigue el camino».
 *
 * cierreExpEstudioHtml({
 *   contentTitle, showCertificate, certificateSubtitle,
 *   iconSrc, certThumbSrc, carouselMountId, className
 * })
 * initCierreExpEstudio(root, {
 *   onDownloadCertificate,
 *   carouselSlides // opcional: monta createCarouselContents (content-cards)
 * })
 *
 * Assets:
 *   iconSrc → images/icons/success-icon.svg (set compartido: success/error/info/warning/time)
 *   certThumbSrc → assets/cierre-cert-thumb.png
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

  function cierreExpEstudioHtml(opts) {
    opts = opts || {};
    var title = opts.contentTitle || '';
    var showCert = opts.showCertificate !== false;
    var iconSrc = opts.iconSrc || 'images/icons/success-icon.svg';
    var certThumbSrc =
      opts.certThumbSrc ||
      'assets/cierre-cert-thumb.png';
    var mountId = opts.carouselMountId || 'cierre-exp-carousel-mount';
    var cls = ['ubits-cierre-exp'];
    if (opts.className) cls.push(opts.className);
    var certSub = opts.certificateSubtitle != null ? opts.certificateSubtitle : title;

    var certBlock = '';
    if (showCert) {
      certBlock =
        '<div class="ubits-cierre-exp__cert">' +
        '<div class="ubits-cierre-exp__cert-thumb" aria-hidden="true">' +
        '<img src="' +
        escapeHtml(certThumbSrc) +
        '" alt="" width="64" height="44" />' +
        '</div>' +
        '<div class="ubits-cierre-exp__cert-body">' +
        '<p class="ubits-cierre-exp__cert-title">Certificado disponible</p>' +
        '<p class="ubits-cierre-exp__cert-sub">' +
        escapeHtml(certSub) +
        '</p></div>' +
        '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm ubits-button--icon-only ubits-cierre-exp__cert-download" data-action="download-cert" aria-label="Descargar certificado" data-tooltip="Descargar certificado">' +
        '<i class="far fa-arrow-down-to-line" aria-hidden="true"></i></button>' +
        '</div>';
    }

    return (
      '<div class="' +
      cls.join(' ') +
      '">' +
      '<div class="ubits-cierre-exp__hero">' +
      '<img class="ubits-cierre-exp__icon" src="' +
      escapeHtml(iconSrc) +
      '" alt="" width="80" height="80" />' +
      '<div class="ubits-cierre-exp__copy">' +
      '<h2 class="ubits-cierre-exp__heading">¡Felicidades!</h2>' +
      '<p class="ubits-cierre-exp__lead">Has culminado con éxito el curso</p>' +
      '<p class="ubits-cierre-exp__course-title">' +
      escapeHtml(title) +
      '</p>' +
      '</div></div>' +
      certBlock +
      '<div class="ubits-cierre-exp__suggest">' +
      '<div class="ubits-cierre-exp__carousel-mount" id="' +
      escapeHtml(mountId) +
      '"></div>' +
      '</div></div>'
    );
  }

  function mountCarousel(mountEl, slides) {
    if (!mountEl || !slides || !slides.length) return null;
    if (typeof global.createCarouselContents !== 'function') {
      console.warn('[cierre-exp-estudio] falta createCarouselContents');
      return null;
    }
    var id = mountEl.id || 'cierre-exp-carousel-mount';
    if (!mountEl.id) mountEl.id = id;
    return global.createCarouselContents({
      containerId: id,
      type: 'content-cards',
      sectionTitle: 'Sigue el camino',
      sectionDescription:
        'Este contenido es parte de estas rutas de aprendizaje. Explóralas y sigue avanzando.',
      slides: slides,
      /* Columna estrecha de Cierre: 2 cards visibles (home-learn usa 4) */
      cardsPerView: 2
    });
  }

  function initCierreExpEstudio(root, handlers) {
    if (!root) return null;
    handlers = handlers || {};
    var carouselApi = null;

    if (handlers.carouselSlides && handlers.carouselSlides.length) {
      var mount = root.querySelector('.ubits-cierre-exp__carousel-mount');
      carouselApi = mountCarousel(mount, handlers.carouselSlides);
    }

    function onClick(e) {
      var btn = e.target.closest('[data-action="download-cert"]');
      if (!btn || !root.contains(btn)) return;
      if (typeof handlers.onDownloadCertificate === 'function') handlers.onDownloadCertificate(e);
    }
    root.addEventListener('click', onClick);
    return {
      getCarouselMount: function () {
        return root.querySelector('.ubits-cierre-exp__carousel-mount');
      },
      mountCarousel: function (slides) {
        var mount = root.querySelector('.ubits-cierre-exp__carousel-mount');
        carouselApi = mountCarousel(mount, slides);
        return carouselApi;
      },
      destroy: function () {
        root.removeEventListener('click', onClick);
      }
    };
  }

  global.cierreExpEstudioHtml = cierreExpEstudioHtml;
  global.initCierreExpEstudio = initCierreExpEstudio;
})(typeof window !== 'undefined' ? window : this);
