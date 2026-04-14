// Función para calcular la ruta base según la profundidad de la página
function getBasePath() {
    const path = window.location.pathname;
    
    // Detectar la profundidad basándose en patrones de carpetas del proyecto
    // Páginas en subcarpetas de segundo nivel (ubits-colaborador/*, ubits-admin/*)
    if (path.includes('/ubits-colaborador/') || path.includes('/ubits-admin/')) {
        return '../../';
    }
    
    // Páginas en subcarpetas de documentacion (documentacion/componentes/, documentacion/guias/, etc.)
    if (path.includes('/documentacion/') && path.split('/documentacion/')[1].includes('/')) {
        return '../../';
    }
    
    // Páginas en primer nivel de carpeta (documentacion/*.html)
    if (path.includes('/documentacion/')) {
        return '../';
    }
    
    // Página en la raíz (index.html) o cualquier otra ubicación
    return '';
}

// Función para ajustar la altura del sidebar
function adjustSidebarHeight() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    
    const windowHeight = window.innerHeight;
    const topMargin = 16; // Margen superior
    const bottomMargin = 16; // Margen inferior
    const availableHeight = windowHeight - topMargin - bottomMargin;
    
    // El sidebar debe tener al menos 578px de alto
    const sidebarHeight = Math.max(578, availableHeight);
    
    sidebar.style.height = sidebarHeight + 'px';
    sidebar.style.top = topMargin + 'px';
}

/** Submenu al hover: mismo ID siempre para no acumular paneles (avatar incluido: mismo patrón que módulos / modo oscuro) */
const UBITS_SIDEBAR_HOVER_SUBMENU_ID = 'ubits-sidebar-hover-submenu';

/**
 * Distancia rail → panel submenu (placement right). Usa token --gap-4xl (general-styles/ubits-spacing-tokens.css).
 * Fallback 32px (= --space-8) si el token no está disponible.
 */
function getSidebarSubmenuOffsetPx() {
    var fallback = 32;
    try {
        var raw = getComputedStyle(document.documentElement).getPropertyValue('--gap-4xl').trim();
        if (!raw) return fallback;
        var n = parseFloat(raw);
        if (isNaN(n) || n < 0) return fallback;
        return n;
    } catch (e) {
        return fallback;
    }
}

/** data-section del rail → clave en TOP_NAV_VARIANTS (null = solo título con data-sidebar-label) */
const SIDEBAR_SECTION_TO_SUBNAV = {
    default: {
        'aprendizaje': 'aprendizaje',
        'diagnóstico': 'diagnostico',
        'desempeño': 'desempeno',
        'encuestas': 'encuestas',
        'reclutamiento': 'reclutamiento',
        'tareas': 'tareas',
        'ia-para-hr': null
    },
    admin: {
        'inicio': null,
        'empresa': 'empresa',
        'aprendizaje': 'admin-aprendizaje',
        'diagnóstico': 'admin-diagnostico',
        'desempeño': 'admin-desempeño',
        'encuestas': 'admin-encuestas'
    },
    creator: {
        'lms-creator': 'creator-lms',
        'planes-formacion': 'creator-planes',
        'certificados': 'creator-certificados',
        'personalizacion': 'creator-personalizacion'
    }
};

function sidebarResolveTabUrl(tabUrl, basePath) {
    if (!tabUrl) return '#';
    const rel = String(tabUrl).replace(/^\.\.\/\.\.\//, '');
    return basePath + rel;
}

function sidebarTabIconToLeftIcon(iconClass) {
    if (!iconClass) return '';
    const parts = String(iconClass).trim().split(/\s+/);
    const fa = parts.filter(function (p) { return p.indexOf('fa-') === 0; }).pop();
    if (!fa) return '';
    return fa.replace(/^fa-/, '');
}

function sidebarBuildModuleSubmenu(dataSection, variant, basePath) {
    const map = SIDEBAR_SECTION_TO_SUBNAV[variant] || {};
    const navKey = map[dataSection];
    const btn = document.querySelector('.sidebar .nav-button[data-section="' + dataSection + '"]');
    const labelFallback = (btn && btn.getAttribute('data-sidebar-label')) || '';

    if (navKey == null) {
        return { title: labelFallback, options: [] };
    }
    if (!window.TOP_NAV_VARIANTS) {
        return { title: labelFallback || '', options: [] };
    }
    const cfg = window.TOP_NAV_VARIANTS[navKey];
    if (!cfg) {
        return { title: labelFallback || '', options: [] };
    }
    const title = cfg.name || labelFallback;
    const options = [];
    (cfg.tabs || []).forEach(function (tab) {
        if (!tab) return;
        options.push({
            text: tab.label,
            value: sidebarResolveTabUrl(tab.url, basePath),
            leftIcon: sidebarTabIconToLeftIcon(tab.icon)
        });
    });
    return { title: title, options: options };
}

function ensureSidebarHoverAssets(basePath, callback) {
    if (!document.querySelector('link[href*="components/submenu.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = basePath + 'components/submenu.css';
        document.head.appendChild(link);
    }

    function loadSubmenuJsThenCb() {
        if (typeof window.openSubmenu === 'function') {
            callback();
            return;
        }
        const s = document.createElement('script');
        s.src = basePath + 'components/submenu.js';
        s.onload = function () { callback(); };
        s.onerror = function () { callback(); };
        document.head.appendChild(s);
    }

    function ensureTopNavThenSubmenu() {
        if (window.TOP_NAV_VARIANTS) {
            loadSubmenuJsThenCb();
            return;
        }
        const existing = document.querySelector('script[src*="components/sub-nav.js"]');
        if (existing) {
            if (window.TOP_NAV_VARIANTS) {
                loadSubmenuJsThenCb();
            } else {
                existing.addEventListener('load', function onSubNavLoad() {
                    existing.removeEventListener('load', onSubNavLoad);
                    loadSubmenuJsThenCb();
                });
            }
            return;
        }
        const sn = document.createElement('script');
        sn.src = basePath + 'components/sub-nav.js';
        sn.onload = function () { loadSubmenuJsThenCb(); };
        sn.onerror = function () { loadSubmenuJsThenCb(); };
        document.head.appendChild(sn);
    }

    ensureTopNavThenSubmenu();
}

function cleanupSidebarHoverBindings(root) {
    if (!root) return;
    root.querySelectorAll('[data-sidebar-hover]').forEach(function (el) {
        if (typeof el._ubitsSidebarHoverClear === 'function') {
            el._ubitsSidebarHoverClear();
            el._ubitsSidebarHoverClear = null;
        }
    });
}

function wireSidebarSubmenuHover(anchorEl, openFn) {
    const showDelay = 200;
    const hideDelay = 180;
    let showTimer = null;
    let hideTimer = null;
    let submenuEl = null;

    function clearShow() {
        if (showTimer) {
            clearTimeout(showTimer);
            showTimer = null;
        }
    }
    function clearHide() {
        if (hideTimer) {
            clearTimeout(hideTimer);
            hideTimer = null;
        }
    }
    function scheduleHide() {
        clearHide();
        hideTimer = setTimeout(function () {
            if (typeof window.closeSubmenu === 'function') {
                window.closeSubmenu(UBITS_SIDEBAR_HOVER_SUBMENU_ID);
            }
            submenuEl = null;
        }, hideDelay);
    }
    function cancelHide() {
        clearHide();
    }

    function onSubmenuPointerEnter() {
        cancelHide();
    }
    function onSubmenuPointerLeave() {
        scheduleHide();
    }

    const onEnter = function () {
        if (window.innerWidth < 1024) return;
        clearHide();
        clearShow();
        showTimer = setTimeout(function () {
            showTimer = null;
            if (window.innerWidth < 1024) return;
            openFn(function (el) {
                submenuEl = el;
                if (submenuEl) {
                    submenuEl.addEventListener('mouseenter', onSubmenuPointerEnter);
                    submenuEl.addEventListener('mouseleave', onSubmenuPointerLeave);
                }
            });
        }, showDelay);
    };
    const onLeave = function () {
        clearShow();
        scheduleHide();
    };

    anchorEl.addEventListener('mouseenter', onEnter);
    anchorEl.addEventListener('mouseleave', onLeave);

    anchorEl._ubitsSidebarHoverClear = function () {
        clearShow();
        clearHide();
        anchorEl.removeEventListener('mouseenter', onEnter);
        anchorEl.removeEventListener('mouseleave', onLeave);
        if (submenuEl) {
            submenuEl.removeEventListener('mouseenter', onSubmenuPointerEnter);
            submenuEl.removeEventListener('mouseleave', onSubmenuPointerLeave);
        }
    };
}

function initSidebarSubmenuHover(variant, basePath) {
    if (window.innerWidth < 1024) {
        if (typeof window.hideTooltip === 'function') window.hideTooltip();
        if (typeof window.closeSubmenu === 'function') window.closeSubmenu(UBITS_SIDEBAR_HOVER_SUBMENU_ID);
        return;
    }

    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    cleanupSidebarHoverBindings(sidebar);

    if (typeof window.openSubmenu !== 'function') {
        return;
    }

    const openForAnchor = function (anchor, cfg) {
        if (typeof window.closeSubmenu === 'function') {
            window.closeSubmenu(UBITS_SIDEBAR_HOVER_SUBMENU_ID);
        }
        const title = cfg.title || '';
        const options = cfg.options || [];
        const showTitle = Boolean(title);
        const el = window.openSubmenu({
            submenuId: UBITS_SIDEBAR_HOVER_SUBMENU_ID,
            anchorEl: anchor,
            placement: 'right',
            align: 'start',
            offset: getSidebarSubmenuOffsetPx(),
            variant: 'dark',
            title: title,
            showTitle: showTitle,
            options: options,
            closeOnEscape: true,
            closeOnClickOutside: true
        });
        return el;
    };

    sidebar.querySelectorAll('.sidebar-body .nav-button[data-section]').forEach(function (btn) {
        const section = btn.getAttribute('data-section');
        if (!section) return;
        wireSidebarSubmenuHover(btn, function (done) {
            const cfg = sidebarBuildModuleSubmenu(section, variant, basePath);
            const el = openForAnchor(btn, cfg);
            if (typeof done === 'function') done(el);
        });
        btn.setAttribute('data-sidebar-hover', 'module');
    });

    sidebar.querySelectorAll('.sidebar-footer .nav-button[data-sidebar-hover="simple"]').forEach(function (btn) {
        const t = btn.getAttribute('data-sidebar-title') || '';
        wireSidebarSubmenuHover(btn, function (done) {
            const el = openForAnchor(btn, { title: t, options: [] });
            if (typeof done === 'function') done(el);
        });
    });

    const darkBtn = document.getElementById('darkmode-toggle');
    if (darkBtn) {
        wireSidebarSubmenuHover(darkBtn, function (done) {
            const currentTheme = document.body.getAttribute('data-theme') || 'light';
            const themeTitle = currentTheme === 'dark' ? 'Modo claro' : 'Modo oscuro';
            const el = openForAnchor(darkBtn, { title: themeTitle, options: [] });
            if (typeof done === 'function') done(el);
        });
        darkBtn.setAttribute('data-sidebar-hover', 'theme');
    }

    sidebar.querySelectorAll('.sidebar-footer .user-avatar').forEach(function (avatarEl) {
        wireSidebarSubmenuHover(avatarEl, function (done) {
            const el = openForAnchor(avatarEl, {
                title: 'Perfil',
                options: buildSidebarAvatarSubmenuOptions(variant, basePath)
            });
            if (typeof done === 'function') done(el);
        });
        avatarEl.setAttribute('data-sidebar-hover', 'profile');
    });
}

function bindSidebarSubmenuSelectOnce() {
    if (window._ubitsSidebarSubmenuNavBound) return;
    window._ubitsSidebarSubmenuNavBound = true;
    document.addEventListener('ubits-submenu-select', function (e) {
        const d = e.detail;
        if (!d || !d.anchor || !d.anchor.closest) return;
        if (!d.anchor.closest('.sidebar')) return;
        const v = d.value;
        if (v == null || v === '' || v === '#') return;

        if (typeof v === 'string' && v.indexOf('action:') === 0) {
            const action = v.replace(/^action:/, '');
            if (action === 'documentacion') {
                const basePath = getBasePath();
                window.open(basePath + 'documentacion/documentacion.html', '_blank');
                return;
            }
            if (action === 'password') {
                alert('Próximamente: Cambio de contraseña');
                return;
            }
            if (action === 'logout') {
                if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
                    alert('Sesión cerrada');
                }
                return;
            }
        }

        window.location.href = v;
    });
}

// ========================================
//   SIDEBAR COMPONENT - DOCUMENTACIÓN
// ========================================
//
// FUNCIÓN: loadSidebar(variantOrActiveButton, activeButton)
//
// ----------------------------------------
// FORMA CORRECTA DE IMPLEMENTAR (módulo activo visible)
// ----------------------------------------
// Para que el ítem del sidebar se marque activo automáticamente, usa una de estas formas:
//
// 1) Un solo argumento (recomendado para variante default o creator):
//    loadSidebar('aprendizaje')   → sidebar default, ítem "Aprendizaje" activo
//    loadSidebar('tareas')        → sidebar default, ítem "Tareas" activo
//    loadSidebar('diagnóstico')   → sidebar default, ítem "Diagnóstico" activo
//    loadSidebar('creator')       → variante Creator; sin segundo arg activa "lms-creator" (ver variante Creator abajo)
//
// 2) Dos argumentos con variante explícita:
//    loadSidebar('default', 'aprendizaje')  → default, ítem "Aprendizaje" activo
//    (En default ya no hay botón LMS Creator en el rail; el acceso es por menú de perfil → "Modo LMS Creator".)
//    loadSidebar('admin', 'inicio')          → admin, ítem "Inicio" activo
//    loadSidebar('admin', 'empresa')         → admin, ítem "Empresa" activo
//    loadSidebar('creator', 'lms-creator')  → Creator: ítem "LMS Creator" activo
//    loadSidebar('creator', 'planes-formacion') → Creator: "Planes de formación" activo
//    loadSidebar('creator', 'certificados')  → Creator: "Certificados" activo
//    loadSidebar('creator', 'personalizacion') → Creator: "Personalización" activo
//
// NO usar loadSidebar('sidebar-container', 'aprendizaje'): el primer argumento
// 'sidebar-container' no es un data-section, por tanto ningún botón recibe la
// clase .active. Las páginas que usan ese patrón (ej. aprendizaje) deben
// activar el botón manualmente en un setTimeout (querySelector por data-section,
// quitar .active de todos los .nav-button, añadir .active al botón correcto).
//
// ----------------------------------------
// PARÁMETROS
// ----------------------------------------
//   - variantOrActiveButton (string): 'default' | 'admin' | 'creator' | o bien la sección a activar (API de un argumento en default)
//   - activeButton (string, opcional): Sección a activar cuando el primer parámetro es 'default', 'admin' o 'creator'
//
// VARIANTE DEFAULT (data-section en el HTML):
//   'inicio' (solo admin), 'empresa' (solo admin), 'aprendizaje', 'diagnóstico',
//   'desempeño', 'encuestas', 'reclutamiento', 'tareas', 'ia-para-hr', 'ninguno'
//
// VARIANTE ADMIN:
//   Body: 'inicio', 'empresa', 'aprendizaje', 'diagnóstico', 'desempeño', 'encuestas'
//   Uso: loadSidebar('admin', 'inicio')
//
// VARIANTE CREATOR (LMS Creator / planes / certificados / UC):
//   Body: 'lms-creator', 'planes-formacion', 'certificados', 'personalizacion'
//   Uso: loadSidebar('creator', 'planes-formacion')
//   Un solo argumento loadSidebar('creator') activa 'lms-creator' por defecto.
//
// ----------------------------------------
// EJEMPLOS
// ----------------------------------------
//   loadSidebar('creator', 'lms-creator')   // Variante Creator, LMS Creator activo
//   loadSidebar('creator')                  // Igual: default interno lms-creator
//   loadSidebar('aprendizaje')              // Aprendizaje activo (sidebar default)
//   loadSidebar('default', 'aprendizaje')
//   loadSidebar('admin', 'inicio')
//   loadSidebar()                       // Sin sección activa
//
// CONTENEDOR REQUERIDO:
//   <div id="sidebar-container"></div>
//
// FILES REQUIRED:
//   - components-sidebar.css (o components/sidebar.css)
//   - components/sidebar.js
function loadSidebar(variantOrActiveButton = 'default', activeButton = null) {
    // Compatibilidad hacia atrás: si el primer parámetro no es una variante conocida,
    // se usa la API antigua (sidebar default + ese data-section como activo).
    const VARIANT_KEYS = ['default', 'admin', 'creator'];
    let variant = 'default';
    let actualActiveButton = activeButton;

    if (!VARIANT_KEYS.includes(variantOrActiveButton)) {
        variant = 'default';
        actualActiveButton = variantOrActiveButton;
    } else {
        variant = variantOrActiveButton;
        actualActiveButton = activeButton;
    }

    if (variant === 'creator' && !actualActiveButton) {
        actualActiveButton = 'lms-creator';
    }

    window._ubitsSidebarVariant = variant;

    console.log('loadSidebar llamado con variant:', variant, 'activeButton:', actualActiveButton);
    
    // Buscar el contenedor del sidebar
    const sidebarContainer = document.getElementById('sidebar-container');
    console.log('Sidebar container encontrado:', sidebarContainer);
    
    if (!sidebarContainer) {
        console.error('No se encontró el contenedor sidebar-container');
        return;
    }
    
    // Obtener la ruta base dinámica
    const basePath = getBasePath();
    console.log('Base path calculado:', basePath);
    
    // Determinar qué HTML usar según la variante
    let sidebarHTML = '';
    
    if (variant === 'admin') {
        // Variante Admin
        sidebarHTML = `
        <aside class="sidebar" id="sidebar">
            <!-- Contenedor principal para header y body -->
            <div class="sidebar-main">
                <!-- Header -->
                <div class="sidebar-header">
                    <div class="logo" aria-hidden="true">
                        <img src="${basePath}images/Ubits-logo.svg" alt="" />
                    </div>
                </div>
                
                <!-- Body -->
                <div class="sidebar-body">
                    <button class="nav-button" data-section="inicio" data-sidebar-label="Inicio" onclick="window.location.href='${basePath}ubits-admin/inicio/admin.html'" style="cursor: pointer;">
                        <i class="far fa-house"></i>
                    </button>
                    <button class="nav-button" data-section="empresa" onclick="window.location.href='${basePath}ubits-admin/empresa/gestion-de-usuarios.html'" style="cursor: pointer;">
                        <i class="far fa-building"></i>
                    </button>
                    <button class="nav-button" data-section="aprendizaje" onclick="window.location.href='${basePath}ubits-admin/aprendizaje/planes-formacion.html'" style="cursor: pointer;">
                        <i class="far fa-graduation-cap"></i>
                    </button>
                    <button class="nav-button" data-section="diagnóstico" onclick="window.location.href='${basePath}ubits-admin/diagnostico/admin-diagnostico.html'" style="cursor: pointer;">
                        <i class="far fa-chart-mixed"></i>
                    </button>
                    <button class="nav-button" data-section="desempeño" onclick="window.location.href='${basePath}ubits-admin/desempeno/admin-360.html'" style="cursor: pointer;">
                        <i class="far fa-bars-progress"></i>
                    </button>
                    <button class="nav-button" data-section="encuestas" onclick="window.location.href='${basePath}ubits-admin/encuestas/admin-encuestas.html'" style="cursor: pointer;">
                        <i class="far fa-clipboard"></i>
                    </button>
                </div>
            </div>
            
            <!-- Footer -->
            <div class="sidebar-footer">
                <button class="nav-button" data-sidebar-hover="simple" data-sidebar-title="API" onclick="window.location.href='${basePath}ubits-admin/otros/admin-api.html'" style="cursor: pointer;">
                    <i class="far fa-code"></i>
                </button>
                <button class="nav-button" data-sidebar-hover="simple" data-sidebar-title="Centro de ayuda" onclick="window.location.href='${basePath}ubits-admin/otros/admin-help-center.html'" style="cursor: pointer;">
                    <i class="far fa-circle-question"></i>
                </button>
                <button class="nav-button" id="darkmode-toggle" data-theme="light">
                    <i class="far fa-moon"></i>
                </button>
                <div class="user-avatar-container">
                    <div class="user-avatar" id="sidebar-avatar-admin" role="button" tabindex="0" aria-label="Menú de cuenta">
                        <img src="${basePath}images/Profile-image.jpg" alt="Usuario" class="avatar-image">
                    </div>
                </div>
            </div>
        </aside>
    `;
    } else if (variant === 'creator') {
        // Variante Creator: accesos a LMS Creator, planes, certificados y universidad corporativa (mismo pie que colaborador)
        sidebarHTML = `
        <aside class="sidebar" id="sidebar">
            <div class="sidebar-main">
                <div class="sidebar-header">
                    <div class="logo" aria-hidden="true">
                        <img src="${basePath}images/Ubits-logo.svg" alt="" />
                    </div>
                </div>
                <div class="sidebar-body">
                    <button class="nav-button" data-section="lms-creator" onclick="window.location.href='${basePath}ubits-colaborador/lms-creator/contenidos.html'" style="cursor: pointer;">
                        <i class="far fa-bolt"></i>
                    </button>
                    <button class="nav-button" data-section="planes-formacion" onclick="window.location.href='${basePath}ubits-colaborador/lms-creator/planes-formacion.html'" style="cursor: pointer;">
                        <i class="far fa-clipboard-list"></i>
                    </button>
                    <button class="nav-button" data-section="certificados" onclick="window.location.href='${basePath}ubits-colaborador/lms-creator/certificados.html'" style="cursor: pointer;">
                        <i class="far fa-award"></i>
                    </button>
                    <button class="nav-button" data-section="personalizacion" onclick="window.location.href='${basePath}ubits-colaborador/lms-creator/personalizacion-u-corporativa.html'" style="cursor: pointer;">
                        <i class="far fa-palette"></i>
                    </button>
                </div>
            </div>
            <div class="sidebar-footer">
                <button class="nav-button" id="darkmode-toggle" data-theme="light">
                    <i class="far fa-moon"></i>
                </button>
                <div class="user-avatar-container">
                    <div class="user-avatar" id="sidebar-avatar-creator" role="button" tabindex="0" aria-label="Menú de cuenta">
                        <img src="${basePath}images/Profile-image.jpg" alt="Usuario" class="avatar-image">
                    </div>
                </div>
            </div>
        </aside>
    `;
    } else {
        // Variante Default
        sidebarHTML = `
        <aside class="sidebar" id="sidebar">
            <!-- Contenedor principal para header y body -->
            <div class="sidebar-main">
                <!-- Header -->
                <div class="sidebar-header">
                    <div class="logo" aria-hidden="true">
                        <img src="${basePath}images/Ubits-logo.svg" alt="" />
                    </div>
                </div>
                
                <!-- Body -->
                <div class="sidebar-body">
                    <button class="nav-button" data-section="aprendizaje" onclick="window.location.href='${basePath}ubits-colaborador/aprendizaje/home-learn.html'" style="cursor: pointer;">
                        <i class="far fa-graduation-cap"></i>
                    </button>
                    <button class="nav-button" data-section="diagnóstico" onclick="window.location.href='${basePath}ubits-colaborador/diagnostico/diagnostico.html'" style="cursor: pointer;">
                        <i class="far fa-chart-mixed"></i>
                    </button>
                    <button class="nav-button" data-section="desempeño" onclick="window.location.href='${basePath}ubits-colaborador/desempeno/evaluaciones-360.html'" style="cursor: pointer;">
                        <i class="far fa-bars-progress"></i>
                    </button>
                    <button class="nav-button" data-section="encuestas" onclick="window.location.href='${basePath}ubits-colaborador/encuestas/encuestas.html'" style="cursor: pointer;">
                        <i class="far fa-clipboard"></i>
                    </button>
                    <button class="nav-button" data-section="reclutamiento" onclick="window.location.href='${basePath}ubits-colaborador/reclutamiento/reclutamiento.html'" style="cursor: pointer;">
                        <i class="far fa-users"></i>
                    </button>
                    <button class="nav-button" data-section="tareas" onclick="window.location.href='${basePath}ubits-colaborador/tareas/tareas.html'" style="cursor: pointer;">
                        <i class="far fa-layer-group"></i>
                    </button>
                    <button class="nav-button" data-section="ia-para-hr" data-sidebar-label="IA para HR" onclick="window.location.href='${basePath}ubits-colaborador/ia-para-hr/ia-para-hr.html'" style="cursor: pointer;">
                        <i class="far fa-sparkles"></i>
                    </button>
                </div>
            </div>
            
            <!-- Footer -->
            <div class="sidebar-footer">
                <button class="nav-button" id="darkmode-toggle" data-theme="light">
                    <i class="far fa-moon"></i>
                </button>
                <div class="user-avatar-container">
                    <div class="user-avatar" id="sidebar-avatar-default" role="button" tabindex="0" aria-label="Menú de cuenta">
                        <img src="${basePath}images/Profile-image.jpg" alt="Usuario" class="avatar-image">
                    </div>
                </div>
            </div>
        </aside>
    `;
    }
    
    // Insertar el HTML
    sidebarContainer.innerHTML = sidebarHTML;
    console.log('HTML insertado en sidebar container');
    
    // Ajustar altura del sidebar dinámicamente
    adjustSidebarHeight();
    
    // Activar el botón especificado
    if (actualActiveButton) {
        const button = document.querySelector(`[data-section="${actualActiveButton}"]`);
        if (button) {
            button.classList.add('active');
            console.log('Botón activado:', actualActiveButton);
        }
    }
    
    // Tras cambiar tema: cerrar tooltip/submenú (el título del hover se recalcula al abrir)
    function updateDarkModeTooltip() {
        if (typeof hideTooltip === 'function') {
            hideTooltip();
        }
        if (typeof window.closeSubmenu === 'function') {
            window.closeSubmenu(UBITS_SIDEBAR_HOVER_SUBMENU_ID);
        }
    }

    window.updateDarkModeTooltip = updateDarkModeTooltip;

    bindSidebarSubmenuSelectOnce();

    setTimeout(function () {
        ensureSidebarHoverAssets(basePath, function () {
            try {
                initSidebarSubmenuHover(variant, basePath);
            } catch (err) {
                console.warn('Sidebar submenu hover:', err);
            }
            updateDarkModeTooltip();
        });
    }, 50);

    let resizeTimeoutSubmenu;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimeoutSubmenu);
        resizeTimeoutSubmenu = setTimeout(function () {
            const bp = getBasePath();
            const v = window._ubitsSidebarVariant || 'default';
            if (window.innerWidth >= 1024) {
                ensureSidebarHoverAssets(bp, function () {
                    initSidebarSubmenuHover(v, bp);
                });
            } else {
                if (typeof hideTooltip === 'function') hideTooltip();
                if (typeof window.closeSubmenu === 'function') {
                    window.closeSubmenu(UBITS_SIDEBAR_HOVER_SUBMENU_ID);
                }
            }
        }, 250);
    });
    
    // Re-inicializar dark mode toggle
    if (typeof initDarkModeToggle === 'function') {
        console.log('Inicializando dark mode...');
        initDarkModeToggle();
    } else {
        console.log('initDarkModeToggle no está disponible, intentando inicializar directamente...');
        // Fallback: inicializar directamente si la función no está disponible
        const darkModeButton = document.querySelector('#darkmode-toggle');
        if (darkModeButton) {
            darkModeButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                if (typeof toggleDarkMode === 'function') {
                    toggleDarkMode();
                }
            });
        }
    }
    
    console.log('Sidebar cargado completamente');
    
    // Ajustar cuando cambie el tamaño de la ventana
    window.addEventListener('resize', adjustSidebarHeight);
}

// Función para actualizar el botón activo
function updateActiveSidebarButton(activeButton) {
    // Remover active de todos los botones
    document.querySelectorAll('.nav-button').forEach(button => {
        button.classList.remove('active');
    });
    
    // Activar el botón especificado
    if (activeButton) {
        const button = document.querySelector(`[data-section="${activeButton}"]`);
        if (button) {
            button.classList.add('active');
        }
    }
}

function buildSidebarAvatarSubmenuOptions(variant, basePath) {
    const options = [];

    options.push({
        text: 'Ver mi perfil',
        value: basePath + 'ubits-colaborador/perfil/profile.html',
        leftIcon: 'user'
    });

    if (variant === 'admin') {
        options.push({ text: 'Modo colaborador', value: basePath + 'index.html', leftIcon: 'user-gear' });
        options.push({ text: 'Modo LMS Creator', value: basePath + 'ubits-colaborador/lms-creator/contenidos.html', leftIcon: 'bolt' });
    } else if (variant === 'creator') {
        options.push({ text: 'Modo colaborador', value: basePath + 'index.html', leftIcon: 'user-gear' });
        options.push({ text: 'Modo administrador', value: basePath + 'ubits-admin/inicio/admin.html', leftIcon: 'laptop' });
    } else {
        options.push({ text: 'Modo administrador', value: basePath + 'ubits-admin/inicio/admin.html', leftIcon: 'laptop' });
        options.push({ text: 'Modo LMS Creator', value: basePath + 'ubits-colaborador/lms-creator/contenidos.html', leftIcon: 'bolt' });
    }

    options.push({ text: 'Documentación', value: 'action:documentacion', leftIcon: 'book' });
    options.push({ text: 'Cambio de contraseña', value: 'action:password', leftIcon: 'key' });
    options.push({ text: 'Cerrar sesión', value: 'action:logout', leftIcon: 'sign-out-alt' });

    return options;
}