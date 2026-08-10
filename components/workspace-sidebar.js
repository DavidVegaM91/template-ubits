/**
 * Workspace sidebar — paridad React AdminWorkspaceSidebar / colaborador.
 * API: loadWorkspaceSidebar(audience, activeId)
 *   audience: 'admin' | 'colaborador' (también alias 'default' → colaborador)
 *   activeId: id del árbol o data-section legacy (aprendizaje, desempeño, …)
 *
 * Requiere: workspace-sidebar.css, badge-tag.css (badge «Nuevo»), submenu.js (flyouts colapsado), ia-button (Agente IA).
 */
(function (global) {
  'use strict';

  var FLYOUT_ID = 'ubits-ws-sidebar-flyout';
  var STORAGE_COLLAPSED = 'ubits-ws-sidebar-collapsed';

  var LOGO_FULL =
    '<svg class="ws-sidebar__wordmark" viewBox="0 0 107 35" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
    '<path fill-rule="evenodd" clip-rule="evenodd" fill="currentColor" d="M16.0061 0V3.31624C12.6743 3.31624 9.47888 4.59096 7.1229 6.85997C4.76692 9.12899 3.44335 12.2064 3.44335 15.4153H0C0 11.3269 1.68636 7.40596 4.68809 4.51504C7.68982 1.62411 11.761 0 16.0061 0ZM16.0059 5.54403C13.2873 5.54403 10.6801 6.58411 8.75781 8.43545C6.83551 10.2868 5.75557 12.7978 5.75557 15.416H8.70054C8.70054 13.5498 9.47015 11.7601 10.8401 10.4404C12.2101 9.12065 14.0682 8.37901 16.0059 8.37855V5.54403ZM16.0064 10.5051V24.0301C16.0064 27.7304 17.8187 29.9139 21.494 29.9139C25.1059 29.9139 26.9109 27.7304 26.9109 24.5607V11.0584H32.0016V24.6969C32.0016 30.3572 28.638 34.2093 21.4904 34.2093C14.2684 34.2093 10.9048 30.3223 10.9048 24.73V15.4149C10.9048 14.1127 11.4419 12.8639 12.398 11.9431C13.354 11.0224 14.6507 10.5051 16.0028 10.5051H16.0064ZM73.742 33.8013V15.3211H66.839V11.0588H85.6723V15.3211H78.8037V33.8013H73.742ZM92.7625 29.19C91.4725 28.6625 90.3071 27.8884 89.337 26.9144L86.5805 30.5885C88.806 32.737 92.0681 34.2032 96.5988 34.2032C102.969 34.2032 106.05 31.0667 106.05 26.9074C106.05 21.8597 101.095 20.7357 97.2005 19.8822C94.4712 19.2766 92.4885 18.7983 92.4885 17.2641C92.4885 15.901 93.6919 14.9462 95.9572 14.9462C98.2588 14.9462 100.807 15.7299 102.719 17.4352L105.515 13.8885C103.179 11.8098 100.064 10.7189 96.3106 10.7189C90.7542 10.7189 87.3543 13.7873 87.3543 17.5713C87.3543 22.583 92.1768 23.6464 96.0111 24.4918L96.1693 24.5267C98.8949 25.1411 100.948 25.7206 100.948 27.4258C100.948 28.7209 99.6036 29.9828 96.8416 29.9828C95.4402 29.9871 94.0525 29.7174 92.7625 29.19ZM64.3091 11.0588H59.2819V33.7995H64.3091V11.0588ZM36.2262 11.0588V33.8013L49.0391 33.7961C53.5354 33.7961 55.9076 31.068 55.9076 27.6575C55.9076 24.8003 53.8906 22.4475 51.3769 22.0723C53.6078 21.6289 55.4491 19.7195 55.4491 16.8553C55.4491 13.82 53.1475 11.0588 48.6512 11.0588H36.2262ZM47.5548 20.196H41.2535V15.1849H47.5548C49.2529 15.1849 50.3149 16.2776 50.3149 17.6739C50.3149 19.14 49.2529 20.196 47.5548 20.196ZM47.7306 29.6752H41.2535V24.3221H47.7306C49.7132 24.3221 50.7753 25.5491 50.7753 26.9821C50.7753 28.6175 49.6426 29.6752 47.7306 29.6752Z"/>' +
    '</svg>';

  var LOGO_MARK =
    '<svg class="ws-sidebar__mark" width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
    '<path d="M12.0042 7.67725V17.5612C12.0042 20.2653 13.3633 21.8609 16.1197 21.8609C18.8284 21.8609 20.1821 20.2653 20.1821 17.9489V8.08158H23.9999V18.0484C23.9999 22.1849 21.4774 24.9999 16.1169 24.9999C10.7008 24.9999 8.17822 22.1594 8.17822 18.0727V11.2653C8.17822 10.3137 8.58103 9.40103 9.29803 8.72815C10.015 8.05527 10.9875 7.67725 12.0015 7.67725" fill="currentColor"/>' +
    '<path d="M12.0051 4.05078C9.96636 4.05078 8.01107 4.81086 6.56942 6.1638C5.12778 7.51674 4.31787 9.35172 4.31787 11.2651H6.52647C6.52647 9.90132 7.10364 8.5934 8.13105 7.62897C9.15847 6.66453 10.552 6.12255 12.0051 6.12221V4.05078Z" fill="currentColor"/>' +
    '<path d="M12.0044 2.42347V0C8.82076 0 5.76752 1.18688 3.51635 3.29953C1.26518 5.41218 0.000488281 8.27756 0.000488281 11.2653H2.58285C2.58285 8.9203 3.57547 6.67135 5.34235 5.01318C7.10923 3.35501 9.50564 2.42347 12.0044 2.42347" fill="currentColor"/>' +
    '</svg>';

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

  function href(rel) {
    if (!rel || rel === '#') return '#';
    return bp() + rel.replace(/^\.\.\//, '');
  }

  function adminNav() {
    return [
      { id: 'home', label: 'Inicio', icon: 'fa-house', href: 'ubits-admin/inicio/admin.html' },
      { type: 'group', id: 'group-productos', label: 'Productos' },
      {
        id: 'seleccion',
        label: 'Selección',
        icon: 'fa-user-plus',
        badge: 'Nuevo',
        children: [
          { id: 'seldash', label: 'Dashboard', href: '#' },
          { id: 'vacantes', label: 'Vacantes', href: '#' },
          { id: 'plantillasrecl', label: 'Plantillas', href: '#' },
          { id: 'creditos', label: 'Créditos', href: '#' },
        ],
      },
      {
        id: 'aprendizaje',
        label: 'Aprendizaje',
        icon: 'fa-graduation-cap',
        children: [
          {
            id: 'lms',
            label: 'LMS Creator',
            children: [
              { id: 'contenidos', label: 'Contenidos', href: 'ubits-colaborador/lms-creator/contenidos.html' },
              { id: 'categorias', label: 'Categorías', href: 'ubits-colaborador/lms-creator/categorias.html' },
              {
                id: 'u-corporativa',
                label: 'Universidad corporativa',
                href: 'ubits-colaborador/lms-creator/personalizacion/personalizacion-u-corporativa.html',
              },
              { id: 'lmsai', label: 'LMS AI', href: 'ubits-colaborador/lms-creator/ia-panel-demo.html' },
            ],
          },
          {
            id: 'planes',
            label: 'Planes de formación',
            children: [
              {
                id: 'planes-lista',
                label: 'Planes',
                href: 'ubits-colaborador/lms-creator/planes-formacion/planes-contenidos.html',
              },
              {
                id: 'grupos',
                label: 'Grupos',
                href: 'ubits-colaborador/lms-creator/planes-formacion/grupos.html',
              },
            ],
          },
          {
            id: 'certificados',
            label: 'Certificados',
            children: [
              {
                id: 'cert-descarga',
                label: 'Descarga',
                href: 'ubits-colaborador/lms-creator/certificados/certificados.html',
              },
              {
                id: 'cert-config',
                label: 'Configuración',
                href: 'ubits-colaborador/lms-creator/certificados/certificados-configuracion.html',
              },
            ],
          },
          { id: 'reportes', label: 'Reportes', href: '#' },
        ],
      },
      {
        id: 'desempeno',
        label: 'Desempeño',
        icon: 'fa-bars-progress',
        children: [
          {
            id: 'eval360',
            label: 'Evaluaciones 360',
            href: 'ubits-admin/desempeno/360/admin-360.html',
          },
          { id: 'objetivos', label: 'Objetivos', href: 'ubits-admin/desempeno/admin-objetivos.html' },
          {
            id: 'matriztalento',
            label: 'Matriz de talento',
            href: 'ubits-admin/desempeno/admin-matriz-talento.html',
          },
          {
            id: 'encuestas',
            label: 'Encuestas',
            href: 'ubits-admin/encuestas/admin-encuestas.html',
          },
        ],
      },
      {
        id: 'diagnostico',
        label: 'Diagnóstico',
        icon: 'fa-chart-mixed',
        href: 'ubits-admin/diagnostico/admin-diagnostico.html',
      },
      { type: 'group', id: 'group-herramientas', label: 'Herramientas' },
      {
        id: 'tareas',
        label: 'Tareas',
        icon: 'fa-layer-group',
        href: 'ubits-colaborador/tareas/tareas.html',
      },
      {
        id: 'avisos',
        label: 'Avisos',
        icon: 'fa-bullhorn',
        href: 'ubits-admin/empresa/comunicaciones.html',
      },
    ];
  }

  function colaboradorNav() {
    return [
      { id: 'home', label: 'Inicio', icon: 'fa-house', href: 'ubits-colaborador/aprendizaje/home-learn.html' },
      {
        id: 'aprendizaje',
        label: 'Aprendizaje',
        icon: 'fa-graduation-cap',
        children: [
          { id: 'catalogo', label: 'Catálogo', href: 'ubits-colaborador/aprendizaje/home-learn.html' },
          {
            id: 'modo-estudio-ia',
            label: 'Modo estudio IA',
            href: 'ubits-colaborador/aprendizaje/modo-estudio-ia.html',
          },
          {
            id: 'u-corporativa',
            label: 'U. Corporativa',
            href: 'ubits-colaborador/aprendizaje/u-corporativa.html',
          },
          {
            id: 'zona-estudio',
            label: 'Zona de estudio',
            href: 'ubits-colaborador/aprendizaje/zona-estudio.html',
          },
          { id: 'progreso', label: 'Progreso', href: 'ubits-colaborador/aprendizaje/progreso.html' },
        ],
      },
      {
        id: 'diagnostico',
        label: 'Diagnóstico',
        icon: 'fa-chart-mixed',
        href: 'ubits-colaborador/diagnostico/diagnostico.html',
      },
      {
        id: 'desempeno',
        label: 'Desempeño',
        icon: 'fa-bars-progress',
        children: [
          {
            id: 'eval360',
            label: 'Evaluaciones 360',
            href: 'ubits-colaborador/desempeno/evaluaciones-360.html',
          },
          { id: 'objetivos', label: 'Objetivos', href: 'ubits-colaborador/desempeno/objetivos.html' },
          { id: 'metricas', label: 'Métricas', href: 'ubits-colaborador/desempeno/metricas.html' },
          { id: 'reportes', label: 'Reportes', href: 'ubits-colaborador/desempeno/reportes.html' },
        ],
      },
      {
        id: 'encuestas',
        label: 'Encuestas',
        icon: 'fa-clipboard-list-check',
        href: 'ubits-colaborador/encuestas/encuestas.html',
      },
      {
        id: 'reclutamiento',
        label: 'Reclutamiento',
        icon: 'fa-users',
        href: 'ubits-colaborador/reclutamiento/reclutamiento.html',
      },
      {
        id: 'tareas',
        label: 'Tareas',
        icon: 'fa-layer-group',
        children: [
          { id: 'tareas-lista', label: 'Tareas', href: 'ubits-colaborador/tareas/tareas.html' },
          { id: 'planes', label: 'Planes', href: 'ubits-colaborador/tareas/planes.html' },
          { id: 'plantillas', label: 'Plantillas', href: 'ubits-colaborador/tareas/plantilla.html' },
          { id: 'seguimiento', label: 'Seguimiento', href: 'ubits-colaborador/tareas/seguimiento.html' },
        ],
      },
      {
        id: 'agentes',
        label: 'Agentes',
        icon: 'fa-sparkles',
        href: 'ubits-colaborador/ia-para-hr/ia-para-hr.html',
      },
    ];
  }

  var ADMIN_HISTORY = [
    { group: 'Hoy', items: ['Evaluaciones pendientes por equipo', 'Participación de Ventas Bogotá'] },
    { group: 'Ayer', items: ['Resumen encuesta de clima laboral', 'Plan de onboarding para operarios'] },
    {
      group: 'Últimos 7 días',
      items: ['Riesgo de rotación Q3', 'Cursos con baja satisfacción', 'Matriz de talento de liderazgo'],
    },
  ];

  var COLAB_HISTORY = [
    { group: 'Hoy', items: ['Mis tareas y evaluaciones pendientes', 'Cursos recomendados para mi rol'] },
    { group: 'Ayer', items: ['Resumen del curso de comunicación', 'Cómo preparar mi autoevaluación'] },
    {
      group: 'Últimos 7 días',
      items: [
        'Explícame el módulo de Excel',
        'Tips para mi evaluación 360',
        'Mi progreso de aprendizaje este mes',
      ],
    },
  ];

  var ACTIVE_ALIASES_SHARED = {
    inicio: 'home',
    home: 'home',
    contenidos: 'contenidos',
    categorias: 'categorias',
    lmsai: 'lmsai',
    'planes-formacion': 'planes-lista',
    'planes-contenidos': 'planes-lista',
    grupos: 'grupos',
    certificados: 'cert-descarga',
    personalizacion: 'u-corporativa',
    'u-corporativa': 'u-corporativa',
    seguimiento: 'u-corporativa',
    reportes: 'reportes',
    diagnostico: 'diagnostico',
    'diagnóstico': 'diagnostico',
    desempeno: 'desempeno',
    'desempeño': 'desempeno',
    eval360: 'eval360',
    'evaluaciones-360': 'eval360',
    objetivos: 'objetivos',
    metricas: 'metricas',
    matriztalento: 'matriztalento',
    encuestas: 'encuestas',
    seleccion: 'seleccion',
    reclutamiento: 'seleccion',
    recldash: 'seldash',
    seldash: 'seldash',
    vacantes: 'vacantes',
    plantillasrecl: 'plantillasrecl',
    creditos: 'creditos',
    tareas: 'tareas',
    avisos: 'avisos',
    comunicaciones: 'avisos',
    'ia-para-hr': 'agentes',
    agentes: 'agentes',
    catalogo: 'catalogo',
    'modo-estudio-ia': 'modo-estudio-ia',
    'zona-estudio': 'zona-estudio',
    progreso: 'progreso',
    'tareas-lista': 'tareas-lista',
    planes: 'planes',
    plantillas: 'plantillas',
    empresa: 'home',
    'lms-creator': 'contenidos',
  };

  /**
   * Archivo HTML → id de hoja del árbol.
   * Evita que páginas de una sección (ej. planes.html con activeSidebar "tareas")
   * marquen siempre la primera hoja (tareas-lista).
   */
  var FILE_TO_ACTIVE = {
    'admin.html': 'home',
    'admin-diagnostico.html': 'diagnostico',
    'admin-360.html': 'eval360',
    'admin-objetivos.html': 'objetivos',
    'admin-matriz-talento.html': 'matriztalento',
    'admin-encuestas.html': 'encuestas',
    'home-learn.html': 'home',
    'home-learn-legacy.html': 'home',
    'catalogo.html': 'catalogo',
    'modo-estudio-ia.html': 'modo-estudio-ia',
    'u-corporativa.html': 'u-corporativa',
    'zona-estudio.html': 'zona-estudio',
    'progreso.html': 'progreso',
    'resultados-busqueda.html': 'catalogo',
    'diagnostico.html': 'diagnostico',
    'evaluaciones-360.html': 'eval360',
    'objetivos.html': 'objetivos',
    'metricas.html': 'metricas',
    'reportes.html': 'reportes',
    'encuestas.html': 'encuestas',
    'reclutamiento.html': 'reclutamiento',
    'tareas.html': 'tareas-lista',
    'planes.html': 'planes',
    'plan-detail.html': 'planes',
    'plantilla.html': 'plantillas',
    'seguimiento.html': 'seguimiento',
    'ia-para-hr.html': 'agentes',
    'profile.html': 'home',
    'contenidos.html': 'contenidos',
    'categorias.html': 'categorias',
    'planes-contenidos.html': 'planes-lista',
    'grupos.html': 'grupos',
    'certificados.html': 'cert-descarga',
    'certificados-configuracion.html': 'cert-config',
    'personalizacion-u-corporativa.html': 'u-corporativa',
    'personalizacion-seguimiento.html': 'seguimiento',
    'ia-panel-demo.html': 'lmsai',
  };

  function fileNameFromPath(path) {
    var parts = String(path || '')
      .replace(/\\/g, '/')
      .split('/')
      .filter(Boolean);
    return parts.length ? parts[parts.length - 1] : '';
  }

  function inferActiveIdFromLocation(navTree) {
    var path = (window.location.pathname || '').replace(/\\/g, '/');
    var file = fileNameFromPath(path);
    if (file && FILE_TO_ACTIVE[file]) return FILE_TO_ACTIVE[file];

    var bestId = null;
    var bestScore = -1;
    function walk(items) {
      for (var i = 0; i < items.length; i++) {
        var it = items[i];
        if (it.href && it.href !== '#') {
          var rel = String(it.href).replace(/^\.\.\//, '');
          var score = -1;
          if (path.indexOf('/' + rel) !== -1 || path.endsWith(rel)) score = rel.length + 10;
          else {
            var fn = fileNameFromPath(rel);
            if (fn && file === fn) score = fn.length;
          }
          if (score > bestScore) {
            bestScore = score;
            bestId = it.id;
          }
        }
        if (it.children) walk(it.children);
      }
    }
    walk(navTree || []);
    return bestId;
  }

  function resolveActiveId(raw, audience) {
    if (!raw) return 'home';
    var key = String(raw);
    if (audience === 'colaborador') {
      var colab = {
        aprendizaje: 'catalogo',
        tareas: 'tareas-lista',
        planes: 'planes',
        desempeno: 'eval360',
        'desempeño': 'eval360',
      };
      if (colab[key]) return colab[key];
    } else {
      var admin = {
        aprendizaje: 'contenidos',
        planes: 'planes-lista',
        tareas: 'tareas',
        desempeno: 'eval360',
        'desempeño': 'eval360',
      };
      if (admin[key]) return admin[key];
    }
    return ACTIVE_ALIASES_SHARED[key] || key;
  }

  function getFirstNavigableLeaf(item) {
    if (item.href) return item;
    if (!item.children || !item.children.length) return null;
    for (var i = 0; i < item.children.length; i++) {
      var found = getFirstNavigableLeaf(item.children[i]);
      if (found) return found;
    }
    return null;
  }

  function getNavContext(navTree, activeId) {
    for (var r = 0; r < navTree.length; r++) {
      var root = navTree[r];
      if (root.type === 'group') continue;
      if (!root.children || !root.children.length) continue;
      for (var c = 0; c < root.children.length; c++) {
        var child = root.children[c];
        if (child.id === activeId) {
          return { rootSectionId: root.id, drillStack: [] };
        }
        var leaves = child.children;
        if (!leaves || !leaves.length) continue;
        for (var l = 0; l < leaves.length; l++) {
          if (leaves[l].id === activeId) {
            return {
              rootSectionId: root.id,
              drillStack: [{ title: child.label, items: leaves }],
            };
          }
        }
      }
    }
    return { drillStack: [] };
  }

  var state = {
    audience: 'admin',
    activeId: 'home',
    mode: 'workspace',
    collapsed: false,
    openSections: {},
    drillStack: [],
    activeChat: '',
    navTree: [],
    history: [],
    flyoutShowTimer: null,
    flyoutHideTimer: null,
  };

  function readCollapsed() {
    try {
      return sessionStorage.getItem(STORAGE_COLLAPSED) === '1';
    } catch (e) {
      return false;
    }
  }

  function writeCollapsed(v) {
    try {
      sessionStorage.setItem(STORAGE_COLLAPSED, v ? '1' : '0');
    } catch (e) { /* ignore */ }
  }

  function applyBodyLayoutClasses() {
    document.body.classList.add('workspace-layout');
    document.body.classList.toggle('workspace-sidebar-collapsed', state.collapsed);
  }

  function clearBodyLayoutClasses() {
    document.body.classList.remove(
      'workspace-layout',
      'workspace-sidebar-collapsed',
      'page-layout-workspace',
    );
  }

  function navigateTo(item) {
    if (!item || !item.href || item.href === '#') return;
    window.location.href = href(item.href);
  }

  function findInTree(id) {
    function walk(items) {
      for (var i = 0; i < items.length; i++) {
        if (items[i].type === 'group') continue;
        if (items[i].id === id) return items[i];
        if (items[i].children) {
          var f = walk(items[i].children);
          if (f) return f;
        }
      }
      return null;
    }
    return walk(state.navTree);
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function badgeHtml(badge) {
    if (!badge || state.collapsed) return '';
    return (
      '<span class="ubits-badge-tag ubits-badge-tag--outlined ubits-badge-tag--info ubits-badge-tag--xs ubits-badge-tag--text-only ws-sidebar__nav-badge">' +
      '<span class="ubits-badge-tag__text">' +
      esc(badge) +
      '</span></span>'
    );
  }

  function renderWorkspaceNavHtml() {
    if (state.drillStack.length > 0) {
      var level = state.drillStack[state.drillStack.length - 1];
      var html =
        '<div class="ws-sidebar__backhead">' +
        '<button type="button" data-ws-action="pop-drill" aria-label="Volver"><i class="far fa-chevron-left" aria-hidden="true"></i></button>' +
        '<span class="ws-sidebar__bh-title">' +
        esc(level.title) +
        '</span></div>';
      level.items.forEach(function (item) {
        var cur = state.activeId === item.id ? ' is-current' : '';
        html +=
          '<button type="button" class="ws-sidebar__nav-child' +
          cur +
          '" data-ws-nav="' +
          esc(item.id) +
          '"' +
          (cur ? ' aria-current="page"' : '') +
          '><span class="ws-sidebar__label">' +
          esc(item.label) +
          '</span></button>';
      });
      return html;
    }

    return state.navTree
      .map(function (item) {
        if (item.type === 'group') {
          return (
            '<div class="ws-sidebar__nav-group" role="presentation">' +
            esc(item.label) +
            '</div>'
          );
        }
        if (item.children && item.children.length) {
          var isOpen = !!state.openSections[item.id];
          var kids = item.children
            .map(function (child) {
              var hasKids = !!(child.children && child.children.length);
              var isCurrent = !hasKids && state.activeId === child.id;
              var isAncestor =
                hasKids &&
                child.children.some(function (leaf) {
                  return leaf.id === state.activeId;
                });
              var cls =
                'ws-sidebar__nav-child' +
                (isCurrent ? ' is-current' : '') +
                (isAncestor ? ' is-ancestor' : '');
              return (
                '<button type="button" class="' +
                cls +
                '" data-ws-child="' +
                esc(item.id) +
                '|' +
                esc(child.id) +
                '"' +
                (isCurrent ? ' aria-current="page"' : '') +
                '><span class="ws-sidebar__label">' +
                esc(child.label) +
                '</span>' +
                (hasKids
                  ? '<i class="far fa-chevron-right ws-sidebar__chev-right" aria-hidden="true"></i>'
                  : '') +
                '</button>'
              );
            })
            .join('');
          return (
            '<div class="ws-sidebar__section' +
            (isOpen ? ' is-open' : '') +
            '" data-ws-section="' +
            esc(item.id) +
            '">' +
            '<button type="button" class="ws-sidebar__nav-top" data-ws-toggle="' +
            esc(item.id) +
            '" aria-expanded="' +
            (isOpen ? 'true' : 'false') +
            '" aria-label="' +
            esc(item.label) +
            '" data-ws-flyout="' +
            esc(item.id) +
            '">' +
            '<i class="far ' +
            esc(item.icon) +
            ' ws-sidebar__nav-icon" aria-hidden="true"></i>' +
            '<span class="ws-sidebar__label">' +
            esc(item.label) +
            '</span>' +
            badgeHtml(item.badge) +
            '<i class="far fa-chevron-down ws-sidebar__chev" aria-hidden="true"></i>' +
            '</button>' +
            '<div class="ws-sidebar__nav-children">' +
            kids +
            '</div></div>'
          );
        }
        var isCurrent = state.activeId === item.id;
        return (
          '<button type="button" class="ws-sidebar__nav-top' +
          (isCurrent ? ' is-current' : '') +
          (item.id === 'home' ? ' is-home' : '') +
          '" data-ws-nav="' +
          esc(item.id) +
          '" data-ws-flyout="' +
          esc(item.id) +
          '"' +
          (isCurrent ? ' aria-current="page"' : '') +
          ' aria-label="' +
          esc(item.label) +
          '">' +
          '<i class="far ' +
          esc(item.icon) +
          ' ws-sidebar__nav-icon" aria-hidden="true"></i>' +
          '<span class="ws-sidebar__label">' +
          esc(item.label) +
          '</span>' +
          badgeHtml(item.badge) +
          '</button>'
        );
      })
      .join('');
  }

  function renderAgentHtml() {
    var html =
      '<div class="ws-sidebar__new-chat">' +
      '<button type="button" class="ubits-ia-button ubits-ia-button--secondary ubits-ia-button--sm' +
      (state.collapsed ? ' ubits-ia-button--icon-only ubits-ia-button--icon-only--sm' : '') +
      '" data-ws-action="new-chat" aria-label="Nuevo chat">' +
      '<i class="far fa-sparkles" aria-hidden="true"></i>' +
      (state.collapsed ? '' : '<span>Nuevo chat</span>') +
      '</button></div>';
    state.history.forEach(function (group) {
      html += '<div class="ws-sidebar__ch-group">' + esc(group.group) + '</div>';
      group.items.forEach(function (text) {
        html +=
          '<button type="button" class="ws-sidebar__ch-item' +
          (state.activeChat === text ? ' is-active' : '') +
          '" data-ws-chat="' +
          esc(text) +
          '">' +
          esc(text) +
          '</button>';
      });
    });
    return html;
  }

  function shellHtml() {
    var appearance = state.audience === 'colaborador' ? 'dark' : 'light';
    var ariaNav =
      state.audience === 'colaborador' ? 'Navegación colaborador' : 'Navegación admin';
    return (
      '<aside class="ws-sidebar ws-sidebar--' +
      appearance +
      (state.collapsed ? ' is-collapsed' : '') +
      '" id="sidebar" data-variant="' +
      (state.audience === 'colaborador' ? 'colaborador' : 'admin') +
      '-workspace" data-appearance="' +
      appearance +
      '">' +
      '<div class="ws-sidebar__top">' +
      '<div class="ws-sidebar__logo-row">' +
      '<div class="ws-sidebar__logo" aria-label="UBITS" role="img">' +
      LOGO_FULL +
      LOGO_MARK +
      '</div>' +
      '</div>' +
      '<div class="ws-sidebar__mode-tabs" role="tablist" aria-label="Modo del sidebar" data-mode="' +
      state.mode +
      '">' +
      '<span class="ws-sidebar__mode-thumb" aria-hidden="true"></span>' +
      '<button type="button" class="ws-sidebar__mode-btn' +
      (state.mode === 'workspace' ? ' is-active' : '') +
      '" data-ws-mode="workspace" role="tab">Workspace</button>' +
      '<button type="button" class="ws-sidebar__mode-btn' +
      (state.mode === 'agente-ia' ? ' is-active' : '') +
      '" data-ws-mode="agente-ia" role="tab">Agente IA</button>' +
      '</div></div>' +
      '<div class="ws-sidebar__nav-viewport"><nav class="ws-sidebar__sidenav" aria-label="' +
      ariaNav +
      '" data-ws-nav-root></nav></div>' +
      '<div class="ws-sidebar__footer">' +
      '<button type="button" class="ws-sidebar__footer-link" data-ws-action="feedback" aria-label="Feedback">' +
      '<i class="far fa-comment ws-sidebar__nav-icon" aria-hidden="true"></i>' +
      '<span class="ws-sidebar__label">Feedback</span></button>' +
      '</div></aside>'
    );
  }

  function paintNav() {
    var root = document.querySelector('[data-ws-nav-root]');
    if (!root) return;
    root.innerHTML = state.mode === 'workspace' ? renderWorkspaceNavHtml() : renderAgentHtml();
    if (typeof global.initUbitsIaButtons === 'function') {
      global.initUbitsIaButtons(root);
    }
  }

  function setCollapsed(collapsed) {
    state.collapsed = !!collapsed;
    writeCollapsed(state.collapsed);
    if (state.collapsed) state.drillStack = [];
    var el = document.getElementById('sidebar');
    if (el && el.classList.contains('ws-sidebar')) {
      el.classList.toggle('is-collapsed', state.collapsed);
    }
    applyBodyLayoutClasses();
    if (state.collapsed) closeFlyout();
    paintNav();
    /* Sync AppHeader toggle label */
    document.querySelectorAll('[data-ah-action="toggle-sidebar"]').forEach(function (btn) {
      var label = state.collapsed ? 'Expandir sidebar' : 'Colapsar sidebar';
      btn.setAttribute('aria-label', label);
      btn.setAttribute('aria-pressed', state.collapsed ? 'true' : 'false');
      btn.setAttribute('data-tooltip', label);
    });
  }

  function toggleCollapse() {
    setCollapsed(!state.collapsed);
  }

  function setMode(mode) {
    state.mode = mode === 'agente-ia' ? 'agente-ia' : 'workspace';
    var tabs = document.querySelector('.ws-sidebar__mode-tabs');
    if (tabs) {
      tabs.setAttribute('data-mode', state.mode);
      tabs.querySelectorAll('.ws-sidebar__mode-btn').forEach(function (btn) {
        btn.classList.toggle('is-active', btn.getAttribute('data-ws-mode') === state.mode);
      });
    }
    closeFlyout();
    paintNav();
  }

  function closeFlyout() {
    if (typeof global.closeSubmenu === 'function') {
      global.closeSubmenu(FLYOUT_ID);
    }
  }

  function flyoutOptionsFor(itemId) {
    var item = findInTree(itemId);
    if (!item || !item.children) return [];
    var opts = [];
    item.children.forEach(function (child) {
      var target = getFirstNavigableLeaf(child) || child;
      opts.push({
        text: child.label,
        value: target.href ? href(target.href) : '#',
      });
    });
    return opts;
  }

  function scheduleFlyout(itemId, anchorEl) {
    if (!state.collapsed || state.mode !== 'workspace') return;
    if (state.flyoutHideTimer) {
      clearTimeout(state.flyoutHideTimer);
      state.flyoutHideTimer = null;
    }
    if (state.flyoutShowTimer) clearTimeout(state.flyoutShowTimer);
    state.flyoutShowTimer = setTimeout(function () {
      ensureSubmenu(function () {
        var opts = flyoutOptionsFor(itemId);
        var item = findInTree(itemId);
        if (typeof global.openSubmenu !== 'function') return;
        global.openSubmenu({
          submenuId: FLYOUT_ID,
          anchorEl: anchorEl,
          placement: 'right',
          align: 'start',
          offset: 8,
          variant: 'light',
          title: item ? item.label : '',
          options: opts,
          closeOnClickOutside: true,
        });
      });
    }, 120);
  }

  function scheduleFlyoutHide() {
    if (state.flyoutShowTimer) {
      clearTimeout(state.flyoutShowTimer);
      state.flyoutShowTimer = null;
    }
    state.flyoutHideTimer = setTimeout(function () {
      closeFlyout();
    }, 180);
  }

  function ensureSubmenu(cb) {
    if (typeof global.openSubmenu === 'function') {
      cb();
      return;
    }
    var base = bp();
    if (!document.querySelector('link[href*="components/submenu.css"]')) {
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = base + 'components/submenu.css';
      document.head.appendChild(link);
    }
    var s = document.createElement('script');
    s.src = base + 'components/submenu.js';
    s.onload = function () {
      cb();
    };
    s.onerror = function () {
      cb();
    };
    document.head.appendChild(s);
  }

  var eventsBound = false;

  function bindEvents(container) {
    if (eventsBound) return;
    eventsBound = true;

    container.addEventListener('click', function (e) {
      var t = e.target;
      if (!t || !t.closest) return;

      var logoHit = t.closest('.ws-sidebar__logo');
      if (logoHit && state.collapsed) {
        setCollapsed(false);
        return;
      }

      var modeBtn = t.closest('[data-ws-mode]');
      if (modeBtn) {
        setMode(modeBtn.getAttribute('data-ws-mode'));
        return;
      }

      var action = t.closest('[data-ws-action]');
      if (action) {
        var act = action.getAttribute('data-ws-action');
        if (act === 'pop-drill') {
          state.drillStack = state.drillStack.slice(0, -1);
          paintNav();
        }
        if (act === 'new-chat') {
          state.activeChat = 'Nuevo chat';
          paintNav();
        }
        if (act === 'feedback') {
          if (typeof global.showToast === 'function') {
            global.showToast({ message: 'Gracias por tu feedback', type: 'info' });
          }
        }
        return;
      }

      var toggle = t.closest('[data-ws-toggle]');
      if (toggle && !state.collapsed) {
        var sid = toggle.getAttribute('data-ws-toggle');
        state.openSections[sid] = !state.openSections[sid];
        paintNav();
        return;
      }

      var childBtn = t.closest('[data-ws-child]');
      if (childBtn) {
        var parts = (childBtn.getAttribute('data-ws-child') || '').split('|');
        var parentId = parts[0];
        var childId = parts[1];
        var parent = findInTree(parentId);
        var child =
          parent && parent.children
            ? parent.children.filter(function (c) {
                return c.id === childId;
              })[0]
            : null;
        if (!child) return;
        if (child.children && child.children.length) {
          state.drillStack = state.drillStack.concat([{ title: child.label, items: child.children }]);
          var first = getFirstNavigableLeaf(child);
          paintNav();
          if (first) navigateTo(first);
        } else {
          navigateTo(child);
        }
        return;
      }

      var navBtn = t.closest('[data-ws-nav]');
      if (navBtn) {
        navigateTo(findInTree(navBtn.getAttribute('data-ws-nav')));
        return;
      }

      var chatBtn = t.closest('[data-ws-chat]');
      if (chatBtn) {
        state.activeChat = chatBtn.getAttribute('data-ws-chat') || '';
        paintNav();
      }
    });

    container.addEventListener('mouseover', function (e) {
      var fly = e.target && e.target.closest && e.target.closest('[data-ws-flyout]');
      if (!fly) return;
      scheduleFlyout(fly.getAttribute('data-ws-flyout'), fly);
    });

    container.addEventListener('mouseout', function (e) {
      var fly = e.target && e.target.closest && e.target.closest('[data-ws-flyout]');
      if (!fly) return;
      var related = e.relatedTarget;
      if (related && fly.contains(related)) return;
      scheduleFlyoutHide();
    });

    document.addEventListener('ubits-submenu-select', function (ev) {
      var detail = ev.detail || {};
      if (detail.value && detail.value !== '#') {
        window.location.href = detail.value;
      }
    });
  }

  function loadWorkspaceSidebar(audienceOrVariant, activeRaw) {
    var audience = audienceOrVariant;
    if (audience === 'default') audience = 'colaborador';
    if (audience !== 'admin' && audience !== 'colaborador') audience = 'colaborador';

    if (typeof global.prepareWorkspaceLayoutShell === 'function') {
      global.prepareWorkspaceLayoutShell();
    } else if (typeof global.upgradeDomToWorkspaceShell === 'function') {
      global.upgradeDomToWorkspaceShell();
    } else {
      document.body.classList.add('page-layout-workspace', 'no-subnav', 'workspace-layout');
    }

    var container = document.getElementById('sidebar-container');
    if (!container) {
      console.error('No se encontró sidebar-container');
      return;
    }

    state.audience = audience;
    state.navTree = audience === 'admin' ? adminNav() : colaboradorNav();
    state.history = audience === 'admin' ? ADMIN_HISTORY : COLAB_HISTORY;
    // Preferir URL (hoja real) sobre activeSidebar de sección (ej. "tareas" → planes.html).
    state.activeId =
      inferActiveIdFromLocation(state.navTree) || resolveActiveId(activeRaw, audience);
    state.activeChat =
      audience === 'colaborador'
        ? 'Mis tareas y evaluaciones pendientes'
        : 'Evaluaciones pendientes por equipo';
    state.mode = 'workspace';
    state.collapsed = readCollapsed();
    state.drillStack = state.collapsed ? [] : getNavContext(state.navTree, state.activeId).drillStack;

    var ctx = getNavContext(state.navTree, state.activeId);
    state.openSections = {
      aprendizaje: true,
      desempeno: ctx.rootSectionId === 'desempeno',
      seleccion: ctx.rootSectionId === 'seleccion',
    };
    if (ctx.rootSectionId) state.openSections[ctx.rootSectionId] = true;

    container.innerHTML = shellHtml();
    applyBodyLayoutClasses();
    paintNav();
    bindEvents(container);
    ensureWorkspaceAppHeader(audience);

    global._ubitsSidebarVariant = audience === 'admin' ? 'admin' : 'default';
    global._ubitsSidebarKind = 'workspace';
  }

  function ensureWorkspaceAppHeader(audience) {
    var mount = document.getElementById('top-nav-container');
    if (!mount) {
      var main = document.querySelector('main.main-content, .main-content');
      if (!main) return;
      mount = document.createElement('div');
      mount.id = 'top-nav-container';
      main.insertBefore(mount, main.firstChild);
    }
    /* Si la página llama loadSubNav después, reemplazará este mount con el mismo AppHeader. */
    function mountHeader() {
      if (typeof global.loadAppHeader !== 'function') return;
      if (mount.querySelector('.ubits-app-header')) return;
      var opts = {
        variant: audience === 'admin' ? 'admin' : 'colaborador',
        title: audience === 'admin' ? 'Home' : 'Inicio',
        borderless: true,
      };
      if (typeof global.resolveAppHeaderFromSubNavVariant === 'function') {
        var fromPage = global.resolveAppHeaderFromSubNavVariant(
          audience === 'admin' ? 'admin-aprendizaje' : 'aprendizaje',
        );
        opts = Object.assign({}, fromPage, { variant: opts.variant });
      }
      global.loadAppHeader(mount, opts);
    }
    if (typeof global.loadAppHeader === 'function') {
      mountHeader();
      return;
    }
    var base = bp();
    if (!document.querySelector('script[src*="components/app-header.js"]')) {
      var s = document.createElement('script');
      s.src = base + 'components/app-header.js';
      s.onload = mountHeader;
      document.head.appendChild(s);
    }
  }

  function unloadWorkspaceLayoutHints() {
    clearBodyLayoutClasses();
    global._ubitsSidebarKind = 'rail';
  }

  global.loadWorkspaceSidebar = loadWorkspaceSidebar;
  global.toggleWorkspaceSidebarCollapsed = toggleCollapse;
  global.setWorkspaceSidebarCollapsed = setCollapsed;
  global.unloadWorkspaceLayoutHints = unloadWorkspaceLayoutHints;
})(typeof window !== 'undefined' ? window : this);
