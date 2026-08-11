/**
 * Workspace footer — pie oficial del layout Workspace.
 * Va al final del main-wrap (flujo del documento). No es sticky.
 */
(function (global) {
  'use strict';

  function bp() {
    if (typeof global.getBasePath === 'function') return global.getBasePath();
    var path = (window.location.pathname || '').replace(/\\/g, '/');
    var markers = ['/ubits-colaborador/', '/ubits-admin/', '/documentacion/'];
    for (var i = 0; i < markers.length; i++) {
      if (!path.includes(markers[i])) continue;
      var after = path.split(markers[i])[1] || '';
      var parts = after.split('/').filter(Boolean);
      return '../'.repeat(Math.max(1, parts.length));
    }
    return '';
  }

  var WORDMARK =
    '<svg class="ubits-workspace-footer__wordmark" viewBox="0 0 107 35" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
    '<path fill-rule="evenodd" clip-rule="evenodd" fill="currentColor" d="M16.0061 0V3.31624C12.6743 3.31624 9.47888 4.59096 7.1229 6.85997C4.76692 9.12899 3.44335 12.2064 3.44335 15.4153H0C0 11.3269 1.68636 7.40596 4.68809 4.51504C7.68982 1.62411 11.761 0 16.0061 0ZM16.0059 5.54403C13.2873 5.54403 10.6801 6.58411 8.75781 8.43545C6.83551 10.2868 5.75557 12.7978 5.75557 15.416H8.70054C8.70054 13.5498 9.47015 11.7601 10.8401 10.4404C12.2101 9.12065 14.0682 8.37901 16.0059 8.37855V5.54403ZM16.0064 10.5051V24.0301C16.0064 27.7304 17.8187 29.9139 21.494 29.9139C25.1059 29.9139 26.9109 27.7304 26.9109 24.5607V11.0584H32.0016V24.6969C32.0016 30.3572 28.638 34.2093 21.4904 34.2093C14.2684 34.2093 10.9048 30.3223 10.9048 24.73V15.4149C10.9048 14.1127 11.4419 12.8639 12.398 11.9431C13.354 11.0224 14.6507 10.5051 16.0028 10.5051H16.0064ZM73.742 33.8013V15.3211H66.839V11.0588H85.6723V15.3211H78.8037V33.8013H73.742ZM92.7625 29.19C91.4725 28.6625 90.3071 27.8884 89.337 26.9144L86.5805 30.5885C88.806 32.737 92.0681 34.2032 96.5988 34.2032C102.969 34.2032 106.05 31.0667 106.05 26.9074C106.05 21.8597 101.095 20.7357 97.2005 19.8822C94.4712 19.2766 92.4885 18.7983 92.4885 17.2641C92.4885 15.901 93.6919 14.9462 95.9572 14.9462C98.2588 14.9462 100.807 15.7299 102.719 17.4352L105.515 13.8885C103.179 11.8098 100.064 10.7189 96.3106 10.7189C90.7542 10.7189 87.3543 13.7873 87.3543 17.5713C87.3543 22.583 92.1768 23.6464 96.0111 24.4918L96.1693 24.5267C98.8949 25.1411 100.948 25.7206 100.948 27.4258C100.948 28.7209 99.6036 29.9828 96.8416 29.9828C95.4402 29.9871 94.0525 29.7174 92.7625 29.19ZM64.3091 11.0588H59.2819V33.7995H64.3091V11.0588ZM36.2262 11.0588V33.8013L49.0391 33.7961C53.5354 33.7961 55.9076 31.068 55.9076 27.6575C55.9076 24.8003 53.8906 22.4475 51.3769 22.0723C53.6078 21.6289 55.4491 19.7195 55.4491 16.8553C55.4491 13.82 53.1475 11.0588 48.6512 11.0588H36.2262ZM47.5548 20.196H41.2535V15.1849H47.5548C49.2529 15.1849 50.3149 16.2776 50.3149 17.6739C50.3149 19.14 49.2529 20.196 47.5548 20.196ZM47.7306 29.6752H41.2535V24.3221H47.7306C49.7132 24.3221 50.7753 25.5491 50.7753 26.9821C50.7753 28.6175 49.6426 29.6752 47.7306 29.6752Z"/>' +
    '</svg>';

  function getWorkspaceFooterHtml(opts) {
    opts = opts || {};
    var termsHref = opts.termsHref || '#';
    var privacyHref = opts.privacyHref || '#';
    return (
      '<footer class="ubits-workspace-footer" data-workspace-footer>' +
      WORDMARK +
      '<span class="ubits-workspace-footer__sep" aria-hidden="true">|</span>' +
      '<a class="ubits-workspace-footer__link ubits-body-xs-regular" href="' +
      termsHref +
      '">Términos y condiciones de uso de la plataforma</a>' +
      '<span class="ubits-workspace-footer__sep" aria-hidden="true">|</span>' +
      '<a class="ubits-workspace-footer__link ubits-body-xs-regular" href="' +
      privacyHref +
      '">Política de privacidad</a>' +
      '</footer>'
    );
  }

  function ensureWorkspaceFooterCss() {
    if (document.querySelector('link[href*="workspace-footer.css"]')) return;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = bp() + 'components/workspace-footer.css';
    document.head.appendChild(link);
  }

  function mountWorkspaceFooter(container, opts) {
    if (!container) return null;
    ensureWorkspaceFooterCss();
    var existing = container.querySelector('[data-workspace-footer]');
    if (existing) return existing;
    var wrap = document.createElement('div');
    wrap.innerHTML = getWorkspaceFooterHtml(opts);
    var footer = wrap.firstElementChild;
    container.appendChild(footer);
    return footer;
  }

  global.getWorkspaceFooterHtml = getWorkspaceFooterHtml;
  global.mountWorkspaceFooter = mountWorkspaceFooter;
  global.ensureWorkspaceFooterCss = ensureWorkspaceFooterCss;
})(typeof window !== 'undefined' ? window : this);
