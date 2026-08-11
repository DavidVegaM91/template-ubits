/**
 * Layout Workspace — paridad React WorkspaceLayout.
 *
 * Uso:
 *   initWorkspaceLayout({
 *     audience: 'colaborador' | 'admin' | 'docs',  // default: colaborador
 *     activeSidebar: 'aprendizaje',
 *     headerVariant: 'aprendizaje',      // legacy SubNav key → título AppHeader
 *     title: 'Catálogo',                 // opcional
 *     tabBar: true,
 *     floatingMenu: true,
 *     profileMenu: true,
 *     tabBarVariant: 'default' | 'admin',
 *     floatingMenuVariant: 'default' | 'admin',
 *   })
 *
 * También se activa al llamar loadSidebar('admin'|'default'|legacy active).
 */
(function (global) {
  'use strict';

  function getBasePath() {
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

  function ensureCss() {
    if (document.querySelector('link[href*="layout-workspace.css"]')) return;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = getBasePath() + 'general-styles/layout-workspace.css';
    document.head.appendChild(link);
  }

  /**
   * Reescribe el DOM clásico (dashboard-container + main-content + top-nav)
   * al shell Workspace (sidebar | main-wrap → header + main).
   */
  function upgradeDomToWorkspaceShell() {
    ensureCss();
    document.body.classList.add('page-layout-workspace', 'no-subnav', 'workspace-layout');

    var dash = document.querySelector('.dashboard-container');
    if (!dash) return null;

    dash.classList.add('ubits-layout-workspace');

    var existingWrap = dash.querySelector(':scope > .ubits-layout-workspace__main-wrap');
    if (existingWrap) {
      mountWorkspaceFooter(existingWrap);
      return dash;
    }

    var main =
      dash.querySelector(':scope > main.main-content') ||
      dash.querySelector(':scope > .main-content') ||
      dash.querySelector('main.main-content');
    if (!main) return dash;

    var wrap = document.createElement('div');
    wrap.className = 'ubits-layout-workspace__main-wrap';

    var header = document.getElementById('top-nav-container');
    if (!header) {
      header = document.createElement('div');
      header.id = 'top-nav-container';
    }
    header.classList.add('ubits-layout-workspace__header');

    main.classList.add('ubits-layout-workspace__main');

    /* Insertar wrap donde estaba main; mover header (si estaba dentro) + main */
    dash.insertBefore(wrap, main);
    wrap.appendChild(header);
    wrap.appendChild(main);
    mountWorkspaceFooter(wrap);

    return dash;
  }

  function mountWorkspaceFooter(wrap) {
    if (!wrap || wrap.querySelector('[data-workspace-footer]')) return;

    function go() {
      if (typeof global.mountWorkspaceFooter === 'function') {
        global.mountWorkspaceFooter(wrap);
      }
    }

    if (typeof global.mountWorkspaceFooter === 'function') {
      go();
      return;
    }

    var base = getBasePath();
    if (!document.querySelector('link[href*="workspace-footer.css"]')) {
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = base + 'components/workspace-footer.css';
      document.head.appendChild(link);
    }
    if (document.querySelector('script[src*="workspace-footer.js"]')) {
      var existing = document.querySelector('script[src*="workspace-footer.js"]');
      existing.addEventListener('load', go);
      return;
    }
    var s = document.createElement('script');
    s.src = base + 'components/workspace-footer.js';
    s.onload = go;
    document.head.appendChild(s);
  }

  function resolveAudience(opts) {
    opts = opts || {};
    if (opts.audience === 'docs' || opts.variant === 'docs') return 'docs';
    if (opts.audience === 'admin' || opts.variant === 'admin') return 'admin';
    if (opts.audience === 'colaborador' || opts.variant === 'colaborador' || opts.variant === 'default') {
      return 'colaborador';
    }
    /* Inferir por URL */
    var path = (window.location.pathname || '').replace(/\\/g, '/');
    if (path.includes('/documentacion/')) return 'docs';
    if (path.includes('/ubits-admin/')) return 'admin';
    return 'colaborador';
  }

  /**
   * @param {Object} [opts]
   */
  function initWorkspaceLayout(opts) {
    opts = opts || {};
    upgradeDomToWorkspaceShell();

    var audience = resolveAudience(opts);
    var activeSidebar = opts.activeSidebar != null ? opts.activeSidebar : opts.active || null;
    var headerVariant =
      opts.headerVariant ||
      opts.subNavVariant ||
      (audience === 'admin'
        ? 'admin-aprendizaje'
        : audience === 'docs'
          ? 'documentacion'
          : 'aprendizaje');
    var headerAudience =
      audience === 'admin' ? 'admin' : audience === 'docs' ? 'docs' : 'colaborador';

    function mountChrome() {
      if (typeof global.loadSidebar === 'function') {
        var sbVariant =
          audience === 'admin' ? 'admin' : audience === 'docs' ? 'docs' : 'default';
        global.loadSidebar(sbVariant, activeSidebar);
      } else if (typeof global.loadWorkspaceSidebar === 'function') {
        global.loadWorkspaceSidebar(audience, activeSidebar);
      }

      var headerMount = document.getElementById('top-nav-container');
      if (headerMount && typeof global.loadAppHeader === 'function') {
        var headerOpts =
          typeof global.resolveAppHeaderFromSubNavVariant === 'function'
            ? global.resolveAppHeaderFromSubNavVariant(headerVariant)
            : { variant: headerAudience, borderless: true };
        if (opts.title) {
          headerOpts.title = opts.title;
          headerOpts.breadcrumb = opts.breadcrumb || [{ label: opts.title }];
        }
        headerOpts.variant = headerAudience;
        global.loadAppHeader(headerMount, headerOpts);
      } else if (headerMount && typeof global.loadSubNav === 'function' && opts.headerVariant) {
        global.loadSubNav('top-nav-container', opts.headerVariant);
      }

      var tabBar = audience === 'docs' ? opts.tabBar === true : opts.tabBar !== false;
      var floating =
        audience === 'docs' ? opts.floatingMenu === true : opts.floatingMenu !== false;
      var profile =
        audience === 'docs' ? opts.profileMenu === true : opts.profileMenu !== false;
      var tabVar = opts.tabBarVariant || (audience === 'admin' ? 'admin' : 'default');
      var floatVar = opts.floatingMenuVariant || (audience === 'admin' ? 'admin' : 'default');

      if (tabBar && typeof global.loadTabBar === 'function' && document.getElementById('tab-bar-container')) {
        global.loadTabBar('tab-bar-container', tabVar);
      }
      if (floating && typeof global.loadFloatingMenu === 'function' && document.getElementById('floating-menu-container')) {
        global.loadFloatingMenu('floating-menu-container', floatVar);
      }
      if (profile && typeof global.loadProfileMenu === 'function' && document.getElementById('profile-menu-container')) {
        global.loadProfileMenu('profile-menu-container');
      }
    }

    /* Sidebar/AppHeader pueden necesitar scripts async */
    if (typeof global.loadSidebar === 'function' || typeof global.loadWorkspaceSidebar === 'function') {
      mountChrome();
    } else {
      var s = document.createElement('script');
      s.src = getBasePath() + 'components/sidebar.js';
      s.onload = mountChrome;
      document.head.appendChild(s);
    }

    return true;
  }

  /** Llamado desde loadWorkspaceSidebar antes de pintar el aside. */
  function prepareWorkspaceLayoutShell() {
    upgradeDomToWorkspaceShell();
  }

  global.initWorkspaceLayout = initWorkspaceLayout;
  global.upgradeDomToWorkspaceShell = upgradeDomToWorkspaceShell;
  global.prepareWorkspaceLayoutShell = prepareWorkspaceLayoutShell;
})(typeof window !== 'undefined' ? window : this);
