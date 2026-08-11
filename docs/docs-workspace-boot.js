/**
 * Arranca el chrome Workspace en páginas de documentacion/.
 * Sustituye SubNav `documentacion` + docs-sidebar (legacy).
 *
 * Uso: bootDocsWorkspace()
 */
(function (global) {
  'use strict';

  function docsBasePath() {
    var path = (window.location.pathname || '').replace(/\\/g, '/');
    if (path.indexOf('/documentacion/') === -1) return '../';
    var after = path.split('/documentacion/')[1] || '';
    var parts = after.split('/').filter(Boolean);
    return '../'.repeat(Math.max(1, parts.length));
  }

  function ensureEl(id, parent) {
    var el = document.getElementById(id);
    if (el) return el;
    el = document.createElement('div');
    el.id = id;
    var dash = parent || document.querySelector('.dashboard-container');
    if (dash) dash.insertBefore(el, dash.firstChild);
    else document.body.insertBefore(el, document.body.firstChild);
    return el;
  }

  function ensureAsset(tag, attr, hrefOrSrc, cb) {
    var file = hrefOrSrc.split('/').pop().split('?')[0];
    var re = new RegExp('(?:^|/)' + file.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?:\\?|$)');
    var already = Array.prototype.some.call(document.querySelectorAll(tag + '[' + attr + ']'), function (el) {
      var v = el.getAttribute(attr) || '';
      return v === hrefOrSrc || re.test(v);
    });
    if (already) {
      if (cb) cb();
      return;
    }
    var el = document.createElement(tag);
    if (tag === 'link') {
      el.rel = 'stylesheet';
      el.href = hrefOrSrc;
      document.head.appendChild(el);
      if (cb) cb();
    } else {
      el.src = hrefOrSrc;
      el.onload = function () {
        if (cb) cb();
      };
      el.onerror = function () {
        if (cb) cb();
      };
      document.head.appendChild(el);
    }
  }

  function hideLegacyDocsChrome() {
    ['docs-sidebar-container', 'docs-dropdown-container'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.setAttribute('hidden', '');
    });
    document.querySelectorAll('.docs-sidebar, .docs-dropdown').forEach(function (el) {
      el.setAttribute('hidden', '');
    });
  }

  function loadChain(urls, done) {
    var i = 0;
    function next() {
      if (i >= urls.length) {
        if (done) done();
        return;
      }
      var item = urls[i];
      i += 1;
      ensureAsset(item.tag, item.attr, item.href, next);
    }
    next();
  }

  function bootDocsWorkspace(activeId) {
    var base = docsBasePath();
    ensureEl('sidebar-container');
    if (!document.getElementById('top-nav-container')) {
      var main = document.querySelector('main.main-content, .main-content');
      var header = document.createElement('div');
      header.id = 'top-nav-container';
      if (main) main.insertBefore(header, main.firstChild);
    }
    hideLegacyDocsChrome();

    var assets = [
      { tag: 'link', attr: 'href', href: base + 'general-styles/layout-workspace.css' },
      { tag: 'link', attr: 'href', href: base + 'components/workspace-sidebar.css' },
      { tag: 'link', attr: 'href', href: base + 'components/app-header.css' },
      { tag: 'script', attr: 'src', href: base + 'docs/docs-sidebar.js' },
      { tag: 'script', attr: 'src', href: base + 'components/layout-workspace.js' },
      { tag: 'script', attr: 'src', href: base + 'components/workspace-sidebar.js' },
      { tag: 'script', attr: 'src', href: base + 'components/app-header.js' },
      { tag: 'script', attr: 'src', href: base + 'components/sidebar.js' },
    ];

    loadChain(assets, function () {
      hideLegacyDocsChrome();
      function start() {
        if (typeof global.initWorkspaceLayout === 'function') {
          global.initWorkspaceLayout({
            audience: 'docs',
            activeSidebar: activeId || undefined,
            headerVariant: 'documentacion',
            tabBar: false,
            floatingMenu: false,
            profileMenu: false,
          });
        } else if (typeof global.loadWorkspaceSidebar === 'function') {
          global.loadWorkspaceSidebar('docs', activeId || undefined);
        }
      }
      if (global.DOCS_SIDEBAR_SECTIONS && global.DOCS_SIDEBAR_SECTIONS.length) {
        start();
        return;
      }
      /* docs-sidebar.js en el HTML pero aún no asignó el catálogo */
      var wait = 0;
      var timer = setInterval(function () {
        wait += 1;
        if ((global.DOCS_SIDEBAR_SECTIONS && global.DOCS_SIDEBAR_SECTIONS.length) || wait > 20) {
          clearInterval(timer);
          start();
        }
      }, 50);
    });
  }

  global.bootDocsWorkspace = bootDocsWorkspace;
})(typeof window !== 'undefined' ? window : this);
