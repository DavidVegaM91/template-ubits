/**
 * AppHeader — paridad React `components/ui/AppHeader`.
 *
 * API:
 *   loadAppHeader(containerIdOrEl, options)
 *   options: {
 *     variant: 'admin' | 'colaborador' | 'docs',
 *     title: string,
 *     breadcrumb: [{ label, href? }],
 *     borderless: boolean (default true),
 *     userName, userEmail, userRole, avatarSrc,
 *     companyLogoSrc, companyLogoAlt,
 *   }
 *
 * También: resolveAppHeaderFromSubNavVariant(variant) → options
 */
(function (global) {
  'use strict';

  var EMPRESA_LINKS = [
    { id: 'gestion-usuarios', label: 'Gestión de usuarios', href: 'ubits-admin/empresa/gestion-de-usuarios.html', icon: 'users' },
    { id: 'comunicaciones', label: 'Comunicaciones', href: 'ubits-admin/empresa/comunicaciones.html', icon: 'envelope' },
    { id: 'personalizacion', label: 'Personalización', href: 'ubits-admin/empresa/personalizacion.html', icon: 'paint-brush' },
    { id: 'organigrama', label: 'Organigrama', href: 'ubits-admin/empresa/organigrama.html', icon: 'sitemap' },
    { id: 'datos-empresa', label: 'Datos de empresa', href: 'ubits-admin/empresa/datos-de-empresa.html', icon: 'building' },
    { id: 'roles-permisos', label: 'Roles y permisos', href: 'ubits-admin/empresa/roles-y-permisos.html', icon: 'user-shield' },
  ];

  var PAGE_TITLES = {
    'admin.html': 'Home',
    'home-learn.html': 'Catálogo',
    'modo-estudio-ia.html': 'Modo estudio IA',
    'u-corporativa.html': 'Contenidos de mi Empresa',
    'zona-estudio.html': 'Zona de estudio',
    'progreso.html': 'Progreso',
    'diagnostico.html': 'Diagnóstico',
    'admin-diagnostico.html': 'Diagnóstico',
    'evaluaciones-360.html': 'Evaluaciones 360',
    'admin-360.html': 'Evaluaciones 360',
    'objetivos.html': 'Objetivos',
    'admin-objetivos.html': 'Objetivos',
    'metricas.html': 'Métricas',
    'reportes.html': 'Reportes',
    'admin-matriz-talento.html': 'Matriz de talento',
    'encuestas.html': 'Encuestas',
    'admin-encuestas.html': 'Encuestas',
    'reclutamiento.html': 'Reclutamiento',
    'tareas.html': 'Tareas',
    'planes.html': 'Planes',
    'plantilla.html': 'Plantillas',
    'seguimiento.html': 'Seguimiento',
    'plan-detail.html': 'Detalle del plan',
    'task-detail.html': 'Detalle de tarea',
    'subtask-detail.html': 'Detalle de subtarea',
    'ia-para-hr.html': 'Agentes',
    'contenidos.html': 'Contenidos',
    'categorias.html': 'Categorías',
    'certificados.html': 'Certificados',
    'certificados-configuracion.html': 'Configuración',
    'planes-contenidos.html': 'Planes',
    'planes-competencias.html': 'Planes',
    'grupos.html': 'Grupos',
    'personalizacion-u-corporativa.html': 'Universidad corporativa',
    'personalizacion-seguimiento.html': 'Seguimiento',
    'gestion-de-usuarios.html': 'Gestión de usuarios',
    'comunicaciones.html': 'Comunicaciones',
    'personalizacion.html': 'Personalización',
    'organigrama.html': 'Organigrama',
    'datos-de-empresa.html': 'Datos de empresa',
    'roles-y-permisos.html': 'Roles y permisos',
  };

  var VARIANT_META = {
    aprendizaje: { audience: 'colaborador', module: 'Aprendizaje' },
    desempeno: { audience: 'colaborador', module: 'Desempeño' },
    'desempeño': { audience: 'colaborador', module: 'Desempeño' },
    encuestas: { audience: 'colaborador', module: 'Encuestas' },
    tareas: { audience: 'colaborador', module: 'Tareas' },
    reclutamiento: { audience: 'colaborador', module: 'Reclutamiento' },
    diagnostico: { audience: 'colaborador', module: 'Diagnóstico' },
    'diagnóstico': { audience: 'colaborador', module: 'Diagnóstico' },
    'admin-aprendizaje': { audience: 'admin', module: 'Aprendizaje' },
    'admin-desempeño': { audience: 'admin', module: 'Desempeño' },
    'admin-desempeno': { audience: 'admin', module: 'Desempeño' },
    'admin-encuestas': { audience: 'admin', module: 'Encuestas' },
    'admin-diagnostico': { audience: 'admin', module: 'Diagnóstico' },
    'admin-empresa': { audience: 'admin', module: 'Empresa' },
    'creator-lms': { audience: 'admin', module: 'LMS Creator' },
    'creator-planes': { audience: 'admin', module: 'Planes de formación' },
    'creator-certificados': { audience: 'admin', module: 'Certificados' },
    'creator-personalizacion': { audience: 'admin', module: 'Personalización' },
    documentacion: { audience: 'docs', module: 'Design system' },
  };

  function bp() {
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

  function href(rel) {
    if (!rel || rel === '#') return '#';
    return bp() + String(rel).replace(/^\.\.\//, '');
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function currentFilename() {
    var path = (window.location.pathname || '').replace(/\\/g, '/');
    var parts = path.split('/').filter(Boolean);
    var last = parts.length ? parts[parts.length - 1] : '';
    return String(last).split('?')[0].split('#')[0].toLowerCase();
  }

  function resolveTitleFromPage(fallback) {
    var file = currentFilename();
    return PAGE_TITLES[file] || fallback || 'Home';
  }

  function isDark() {
    return document.body.getAttribute('data-theme') === 'dark';
  }

  function ensureAsset(tag, attr, hrefOrSrc, cb) {
    var file = hrefOrSrc.split('/').pop().split('?')[0];
    /* Match solo el archivo exacto (…/button.css), no substrings (ia-button.css). */
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

  function ensureAppHeaderAssets(callback) {
    var base = bp();
    ensureAsset('link', 'href', base + 'components/app-header.css');
    ensureAsset('link', 'href', base + 'components/button.css');
    ensureAsset('link', 'href', base + 'components/avatar.css');
    ensureAsset('link', 'href', base + 'components/switch.css');
    ensureAsset('link', 'href', base + 'components/attention-badge.css');
    ensureAsset('link', 'href', base + 'components/notifications-menu.css');
    ensureAsset('link', 'href', base + 'components/tooltip.css');
    ensureAsset('link', 'href', base + 'components/dropdown-menu.css');

    var pending = 2;
    function done() {
      pending -= 1;
      if (pending <= 0 && callback) callback();
    }
    ensureAsset('script', 'src', base + 'components/notifications-menu.js', done);
    ensureAsset('script', 'src', base + 'components/dropdown-menu.js', done);
  }

  function resolveAppHeaderFromSubNavVariant(variant) {
    var meta = VARIANT_META[variant] || { audience: 'colaborador', module: 'Workspace' };
    var title = resolveTitleFromPage(meta.module);
    var breadcrumb =
      title !== meta.module
        ? [{ label: meta.module }, { label: title }]
        : [{ label: title }];
    return {
      variant: meta.audience,
      title: title,
      breadcrumb: breadcrumb,
      borderless: true,
    };
  }

  function breadcrumbHtml(crumbs) {
    return crumbs
      .map(function (item, i) {
        var isLast = i === crumbs.length - 1;
        var sep =
          i > 0
            ? '<span class="ubits-app-header__sep" aria-hidden="true">/</span>'
            : '';
        var inner;
        if (isLast) {
          inner =
            '<span class="ubits-body-md-bold ubits-app-header__current" aria-current="page">' +
            esc(item.label) +
            '</span>';
        } else if (item.href) {
          inner =
            '<a href="' +
            esc(href(item.href)) +
            '" class="ubits-body-md-regular ubits-app-header__link">' +
            esc(item.label) +
            '</a>';
        } else {
          inner =
            '<span class="ubits-body-md-regular ubits-app-header__ancestor">' +
            esc(item.label) +
            '</span>';
        }
        return '<span class="ubits-app-header__crumb">' + sep + inner + '</span>';
      })
      .join('');
  }

  function buildHtml(opts) {
    var variant = opts.variant || 'admin';
    var isColab = variant === 'colaborador';
    var isDocs = variant === 'docs';
    var collapsed =
      typeof global.readWorkspaceSidebarCollapsed === 'function'
        ? global.readWorkspaceSidebarCollapsed()
        : document.body.classList.contains('workspace-sidebar-collapsed');
    var toggleLabel = collapsed ? 'Expandir sidebar' : 'Colapsar sidebar';
    var crumbs =
      opts.breadcrumb && opts.breadcrumb.length
        ? opts.breadcrumb
        : [{ label: opts.title || 'Home' }];
    var base = bp();
    var avatarSrc = opts.avatarSrc || base + 'images/Profile-image.jpg';
    var userName = opts.userName || 'María Alejandra Sánchez Pardo';
    var userEmail = opts.userEmail || 'masanchez@fiqsha.demo';
    var userRole = opts.userRole || (isDocs ? 'Design system' : isColab ? 'Colaborador' : 'Admin');
    var companyLogo = opts.companyLogoSrc || base + 'images/Client-logo.png';
    var companyAlt = opts.companyLogoAlt || 'Fiqsha';
    var borderless = opts.borderless !== false;
    var dark = isDark();

    var adminActions = '';
    if (!isDocs && !isColab) {
      adminActions =
        '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm ubits-button--pill" data-ah-action="novedades" aria-label="Novedades" data-tooltip="Novedades">' +
        '<i class="far fa-bullhorn" aria-hidden="true"></i>' +
        '<span class="ubits-app-header__label-desktop">Novedades</span></button>' +
        '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm ubits-button--pill" data-ah-action="empresa" aria-label="Empresa" aria-haspopup="menu" data-tooltip="Empresa">' +
        '<i class="far fa-building" aria-hidden="true"></i>' +
        '<span class="ubits-app-header__label-desktop">Empresa</span>' +
        '<i class="far fa-angle-down ubits-app-header__label-desktop" aria-hidden="true"></i></button>' +
        '<button type="button" class="ubits-app-header__icon-btn" data-ah-action="help" aria-label="Centro de ayuda" data-tooltip="Centro de ayuda">' +
        '<i class="far fa-circle-question" aria-hidden="true"></i></button>';
    }

    var company =
      isColab
        ? '<img class="ubits-app-header__company-logo" src="' +
          esc(companyLogo) +
          '" alt="' +
          esc(companyAlt) +
          '" />'
        : '';

    var notifMount = !isDocs ? '<div class="ubits-app-header__notif" data-ah-notif></div>' : '';

    var profileExtras = '';
    if (isDocs) {
      profileExtras =
        '<button type="button" class="ubits-app-header__menu-item" data-ah-nav="' +
        esc(href('ubits-admin/inicio/admin.html')) +
        '"><i class="far fa-laptop" aria-hidden="true"></i>Modo Administrador</button>' +
        '<button type="button" class="ubits-app-header__menu-item" data-ah-nav="' +
        esc(href('ubits-colaborador/aprendizaje/home-learn.html')) +
        '"><i class="far fa-user-gear" aria-hidden="true"></i>Modo Colaborador</button>';
    } else if (isColab) {
      profileExtras =
        '<button type="button" class="ubits-app-header__menu-item" data-ah-nav="' +
        esc(href('ubits-admin/inicio/admin.html')) +
        '"><i class="far fa-user-shield" aria-hidden="true"></i>Ver como admin</button>' +
        '<button type="button" class="ubits-app-header__menu-item" data-ah-action="design-system"><i class="far fa-book" aria-hidden="true"></i>Design system</button>' +
        '<button type="button" class="ubits-app-header__menu-item" data-ah-action="password"><i class="far fa-key" aria-hidden="true"></i>Cambio de contraseña</button>' +
        '<button type="button" class="ubits-app-header__menu-item" data-ah-action="conectores"><i class="far fa-plug" aria-hidden="true"></i>Conectores</button>';
    } else {
      profileExtras =
        '<button type="button" class="ubits-app-header__menu-item" data-ah-nav="' +
        esc(href('ubits-colaborador/aprendizaje/home-learn.html')) +
        '"><i class="far fa-user-gear" aria-hidden="true"></i>Ver como colaborador</button>' +
        '<button type="button" class="ubits-app-header__menu-item" data-ah-action="design-system"><i class="far fa-book" aria-hidden="true"></i>Design system</button>';
    }

    return (
      '<header class="ubits-app-header' +
      (borderless ? '' : ' ubits-app-header--bordered') +
      '" data-variant="' +
      esc(variant) +
      '">' +
      '<div class="ubits-app-header__left">' +
      '<button type="button" class="ubits-button ubits-button--secondary ubits-button--xs ubits-button--icon-only" data-ah-action="toggle-sidebar" aria-label="' +
      esc(toggleLabel) +
      '" aria-pressed="' +
      (collapsed ? 'true' : 'false') +
      '" data-tooltip="' +
      esc(toggleLabel) +
      '"><i class="far fa-sidebar" aria-hidden="true"></i></button>' +
      '<nav class="ubits-app-header__breadcrumb" aria-label="Breadcrumb">' +
      breadcrumbHtml(crumbs) +
      '</nav></div>' +
      '<div class="ubits-app-header__right">' +
      adminActions +
      company +
      notifMount +
      '<div class="ubits-app-header__menu-wrap">' +
      '<button type="button" class="ubits-app-header__avatar-btn" data-ah-action="avatar" aria-label="Menú de cuenta de ' +
      esc(userName) +
      '" aria-expanded="false">' +
      '<span class="ubits-avatar ubits-avatar--md"><img class="ubits-avatar__img" src="' +
      esc(avatarSrc) +
      '" alt="' +
      esc(userName) +
      '" /></span></button>' +
      '<div class="ubits-app-header__dropdown" role="menu" data-ah-dropdown>' +
      '<div class="ubits-app-header__user-block">' +
      '<div class="ubits-body-sm-bold ubits-app-header__user-name">' +
      esc(userName) +
      '</div>' +
      '<div class="ubits-body-xs-regular ubits-app-header__user-email">' +
      esc(userEmail) +
      '</div>' +
      '<span class="ubits-app-header__role-badge"><i class="far fa-laptop" aria-hidden="true"></i>' +
      esc(userRole) +
      '</span></div>' +
      profileExtras +
      '<div class="ubits-app-header__theme-row">' +
      '<i class="far ' +
      (dark ? 'fa-moon' : 'fa-sun') +
      '" aria-hidden="true"></i>' +
      '<span>' +
      (dark ? 'Modo oscuro' : 'Modo claro') +
      '</span>' +
      '<label class="ubits-switch ubits-switch--sm">' +
      '<input type="checkbox" class="ubits-switch__input" role="switch" data-ah-theme ' +
      (dark ? 'checked' : '') +
      ' aria-label="' +
      (dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro') +
      '" />' +
      '<span class="ubits-switch__track"><span class="ubits-switch__thumb"></span></span></label></div>' +
      '<button type="button" class="ubits-app-header__menu-item is-danger" data-ah-action="logout">' +
      '<i class="far fa-sign-out-alt" aria-hidden="true"></i>Cerrar sesión</button>' +
      '</div></div></div></header>'
    );
  }

  function bindHeader(root, opts) {
    var notifMount = root.querySelector('[data-ah-notif]');
    if (notifMount && typeof global.createNotificationsMenu === 'function') {
      notifMount.appendChild(
        global.createNotificationsMenu({
          hasUnread: true,
          items: [
            {
              id: '1',
              title: 'Nuevo Home operativo',
              description: 'Métricas clave, quick actions y pendientes en un solo lugar.',
              date: 'Hoy',
            },
            {
              id: '2',
              title: 'Agente IA de UBITS',
              description: 'Ábrelo desde el tab Agente IA en el sidebar.',
              date: 'Ayer',
            },
          ],
        }),
      );
    }

    function closeMenu() {
      var dd = root.querySelector('[data-ah-dropdown]');
      var btn = root.querySelector('[data-ah-action="avatar"]');
      if (dd) dd.classList.remove('is-open');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    }

    root.addEventListener('click', function (e) {
      var t = e.target;
      if (!t || !t.closest) return;

      var nav = t.closest('[data-ah-nav]');
      if (nav) {
        window.location.href = nav.getAttribute('data-ah-nav');
        return;
      }

      var actionEl = t.closest('[data-ah-action]');
      if (!actionEl) {
        if (!t.closest('[data-ah-dropdown]') && !t.closest('[data-ah-action="avatar"]')) {
          /* keep open only if inside */
        }
        return;
      }
      var action = actionEl.getAttribute('data-ah-action');

      if (action === 'toggle-sidebar') {
        if (typeof global.toggleWorkspaceSidebarCollapsed === 'function') {
          global.toggleWorkspaceSidebarCollapsed();
        }
        var collapsed = document.body.classList.contains('workspace-sidebar-collapsed');
        var label = collapsed ? 'Expandir sidebar' : 'Colapsar sidebar';
        actionEl.setAttribute('aria-label', label);
        actionEl.setAttribute('aria-pressed', collapsed ? 'true' : 'false');
        actionEl.setAttribute('data-tooltip', label);
        return;
      }

      if (action === 'avatar') {
        var dd = root.querySelector('[data-ah-dropdown]');
        var open = dd && !dd.classList.contains('is-open');
        closeMenu();
        if (open && dd) {
          dd.classList.add('is-open');
          actionEl.setAttribute('aria-expanded', 'true');
        }
        return;
      }

      if (action === 'empresa') {
        openEmpresaMenu(actionEl);
        return;
      }

      if (action === 'help') {
        window.location.href = href('ubits-admin/otros/admin-help-center.html');
        return;
      }

      if (action === 'novedades') {
        if (typeof global.showToast === 'function') {
          global.showToast({ message: 'Novedades del playground', type: 'info' });
        }
        return;
      }

      if (action === 'design-system') {
        window.location.href = href('documentacion/componentes.html');
        closeMenu();
        return;
      }

      if (action === 'password' || action === 'conectores' || action === 'logout') {
        closeMenu();
      }
    });

    var theme = root.querySelector('[data-ah-theme]');
    if (theme) {
      theme.addEventListener('change', function () {
        if (typeof global.toggleDarkMode === 'function') {
          global.toggleDarkMode();
        } else {
          document.body.setAttribute('data-theme', theme.checked ? 'dark' : 'light');
        }
        // Re-paint labels
        loadAppHeader(root.parentElement, opts);
      });
    }

    document.addEventListener('mousedown', function onDoc(ev) {
      if (!root.contains(ev.target)) closeMenu();
    });
  }

  function openEmpresaMenu(anchor) {
    if (typeof global.getDropdownMenuHtml !== 'function' || typeof global.openDropdownMenu !== 'function') {
      window.location.href = href(EMPRESA_LINKS[0].href);
      return;
    }
    var overlayId = 'ubits-app-header-empresa';
    var existing = document.getElementById(overlayId);
    if (existing && existing.parentNode) existing.parentNode.removeChild(existing);

    var options = EMPRESA_LINKS.map(function (link) {
      return {
        text: link.label,
        value: href(link.href),
        leftIcon: link.icon,
      };
    });

    var html = global.getDropdownMenuHtml({
      overlayId: overlayId,
      contentId: overlayId + '-content',
      options: options,
    });
    var wrap = document.createElement('div');
    wrap.innerHTML = html;
    var overlay = wrap.firstElementChild;
    document.body.appendChild(overlay);
    global.openDropdownMenu(overlayId, anchor, { alignRight: true });

    overlay.addEventListener('click', function (ev) {
      var opt = ev.target && ev.target.closest && ev.target.closest('[data-value]');
      if (!opt) return;
      var value = opt.getAttribute('data-value');
      if (typeof global.closeDropdownMenu === 'function') global.closeDropdownMenu(overlayId);
      if (value) window.location.href = value;
    });
  }

  function loadAppHeader(containerIdOrEl, options) {
    var container =
      typeof containerIdOrEl === 'string'
        ? document.getElementById(containerIdOrEl)
        : containerIdOrEl;
    if (!container) {
      console.error('AppHeader: contenedor no encontrado');
      return;
    }

    var opts = options || {};
    ensureAppHeaderAssets(function () {
      document.body.classList.add('no-subnav', 'has-app-header');
      container.innerHTML = buildHtml(opts);
      var header = container.querySelector('.ubits-app-header');
      if (header) bindHeader(header, opts);
      if (typeof global.initTooltips === 'function') {
        try {
          global.initTooltips(container);
        } catch (e) { /* ignore */ }
      }
    });
  }

  /** Expone lectura de collapsed si workspace-sidebar la define después. */
  function readWorkspaceSidebarCollapsed() {
    try {
      return sessionStorage.getItem('ubits-ws-sidebar-collapsed') === '1';
    } catch (e) {
      return false;
    }
  }

  global.loadAppHeader = loadAppHeader;
  global.resolveAppHeaderFromSubNavVariant = resolveAppHeaderFromSubNavVariant;
  global.readWorkspaceSidebarCollapsed = readWorkspaceSidebarCollapsed;
})(typeof window !== 'undefined' ? window : this);
