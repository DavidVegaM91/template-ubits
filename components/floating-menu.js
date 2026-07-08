/* ========================================
   FLOATING MENU COMPONENT (MODAL)
   ======================================== */

/** Colaborador (módulos + LMS Creator en un acordeón; IA, etc.) */
const FLOATING_MENU_SECTIONS_DEFAULT = [
    {
        id: 'aprendizaje',
        title: 'Aprendizaje',
        icon: 'far fa-graduation-cap',
        accent: '#60a5fa',
        subitems: [
            { id: 'inicio', title: 'Inicio', icon: 'far fa-home', url: '../../ubits-colaborador/aprendizaje/home-learn.html' },
            { id: 'modo-estudio-ia', title: 'Modo estudio IA', icon: 'far fa-sparkles', url: '../../ubits-colaborador/aprendizaje/modo-estudio-ia.html' },
            { id: 'catalogo', title: 'Catálogo', icon: 'far fa-book', url: '../../ubits-colaborador/aprendizaje/catalogo.html' },
            { id: 'corporativa', title: 'U. Corporativa', icon: 'far fa-building-columns', url: '../../ubits-colaborador/aprendizaje/u-corporativa.html' },
            { id: 'zona-estudio', title: 'Zona de estudio', icon: 'far fa-books', url: '../../ubits-colaborador/aprendizaje/zona-estudio.html' },
            { id: 'mi-equipo', title: 'Mi equipo', icon: 'far fa-users', url: '../../ubits-colaborador/aprendizaje/mi-equipo/planes.html' }
        ]
    },
    {
        id: 'creator',
        title: 'LMS Creator',
        icon: 'far fa-bolt',
        accent: '#f59e0b',
        subitems: [
            { id: 'contenidos', title: 'Contenidos', icon: 'far fa-folder-open', url: '../../ubits-colaborador/lms-creator/contenidos.html' },
            { id: 'categorias', title: 'Categorías', icon: 'far fa-tags', url: '../../ubits-colaborador/lms-creator/categorias.html' },
            { id: 'planes-contenidos', title: 'Planes de contenidos', icon: 'far fa-layer-group', url: '../../ubits-colaborador/lms-creator/planes-formacion/planes-contenidos.html' },
            { id: 'planes-competencias', title: 'Planes de competencias', icon: 'far fa-bullseye', url: '../../ubits-colaborador/lms-creator/planes-formacion/planes-competencias.html' },
            { id: 'grupos', title: 'Grupos', icon: 'far fa-users', url: '../../ubits-colaborador/lms-creator/planes-formacion/grupos.html' },
            { id: 'certificados-descarga', title: 'Certificados (descarga)', icon: 'far fa-download', url: '../../ubits-colaborador/lms-creator/certificados/certificados.html' },
            { id: 'certificados-config', title: 'Certificados (configuración)', icon: 'far fa-sliders', url: '../../ubits-colaborador/lms-creator/certificados/certificados-configuracion.html' },
            { id: 'personalizacion-u-corporativa', title: 'Universidad corporativa', icon: 'far fa-building-columns', url: '../../ubits-colaborador/lms-creator/personalizacion/personalizacion-u-corporativa.html' },
            { id: 'personalizacion-seguimiento', title: 'Seguimiento (UC)', icon: 'far fa-chart-line', url: '../../ubits-colaborador/lms-creator/personalizacion/personalizacion-seguimiento.html' }
        ]
    },
    {
        id: 'diagnostico',
        title: 'Diagnóstico',
        icon: 'far fa-chart-mixed',
        accent: '#ec4899',
        url: '../../ubits-colaborador/diagnostico/diagnostico.html',
        isLink: true,
        clickable: true
    },
    {
        id: 'desempeno',
        title: 'Desempeño',
        icon: 'far fa-bars-progress',
        accent: '#10b981',
        subitems: [
            { id: 'evaluaciones-360', title: 'Evaluaciones 360', icon: 'far fa-chart-pie', url: '../../ubits-colaborador/desempeno/evaluaciones-360.html' },
            { id: 'objetivos', title: 'Objetivos', icon: 'far fa-bullseye', url: '../../ubits-colaborador/desempeno/objetivos.html' },
            { id: 'metricas', title: 'Métricas', icon: 'far fa-chart-line', url: '../../ubits-colaborador/desempeno/metricas.html' },
            { id: 'reportes', title: 'Reportes', icon: 'far fa-file-chart-line', url: '../../ubits-colaborador/desempeno/reportes.html' }
        ]
    },
            {
                id: 'encuestas',
                title: 'Encuestas',
                icon: 'far fa-clipboard-list-check',
                accent: '#14b8a6',
                url: '../../ubits-colaborador/encuestas/encuestas.html',
                isLink: true,
                clickable: false
            },
    {
        id: 'reclutamiento',
        title: 'Reclutamiento',
        icon: 'far fa-users',
        accent: '#06b6d4',
        url: '../../ubits-colaborador/reclutamiento/reclutamiento.html',
        isLink: true,
        clickable: true
    },
    {
        id: 'tareas',
        title: 'Tareas',
        icon: 'far fa-layer-group',
        accent: '#8b5cf6',
        subitems: [
            { id: 'planes', title: 'Planes', icon: 'far fa-calendar', url: '../../ubits-colaborador/tareas/planes.html' },
            { id: 'tareas', title: 'Tareas', icon: 'far fa-tasks', url: '../../ubits-colaborador/tareas/tareas.html' },
            { id: 'plantillas', title: 'Plantillas', icon: 'far fa-rectangle-history', url: '../../ubits-colaborador/tareas/plantilla.html' },
            { id: 'seguimiento', title: 'Seguimiento', icon: 'far fa-chart-line', url: '../../ubits-colaborador/tareas/seguimiento.html' }
        ]
    },
    {
        id: 'ia-para-hr',
        title: 'Agentes',
        icon: 'far fa-sparkles',
        accent: 'ia-gradient',
        url: '../../ubits-colaborador/ia-para-hr/ia-para-hr.html',
        isLink: true,
        clickable: true
    }
];

function getDrawerIconCircleHTML(id, iconClass, extraClass) {
    extraClass = extraClass || '';
    return (
        '<div class="accordion-icon-circle' +
        extraClass +
        '" id="circle-' +
        id +
        '">' +
        '<i class="' +
        iconClass +
        '" id="icon-' +
        id +
        '"></i>' +
        '</div>'
    );
}

/** Administración — alineado con README / sidebar admin */
const FLOATING_MENU_SECTIONS_ADMIN = [
    {
        id: 'admin-inicio',
        title: 'Inicio',
        icon: 'far fa-house',
        url: '../../ubits-admin/inicio/admin.html',
        isLink: true,
        clickable: true
    },
    {
        id: 'admin-empresa',
        title: 'Empresa',
        icon: 'far fa-building',
        subitems: [
            { id: 'gestion-usuarios', title: 'Gestión de usuarios', icon: 'far fa-users', url: '../../ubits-admin/empresa/gestion-de-usuarios.html' },
            { id: 'organigrama', title: 'Organigrama', icon: 'far fa-sitemap', url: '../../ubits-admin/empresa/organigrama.html' },
            { id: 'datos-de-empresa', title: 'Datos de empresa', icon: 'far fa-building', url: '../../ubits-admin/empresa/datos-de-empresa.html' },
            { id: 'personalizacion-empresa', title: 'Personalización', icon: 'far fa-paint-brush', url: '../../ubits-admin/empresa/personalizacion.html' },
            { id: 'roles-permisos', title: 'Roles y permisos', icon: 'far fa-user-shield', url: '../../ubits-admin/empresa/roles-y-permisos.html' },
            { id: 'comunicaciones', title: 'Comunicaciones', icon: 'far fa-envelope', url: '../../ubits-admin/empresa/comunicaciones.html' }
        ]
    },
    {
        id: 'admin-aprendizaje',
        title: 'Aprendizaje',
        icon: 'far fa-graduation-cap',
        subitems: [
            { id: 'admin-lms-creator', title: 'LMS Creator', icon: 'far fa-bolt', adminLmsMigrate: true, adminMigrateRel: 'ubits-colaborador/lms-creator/contenidos-sin-migrar.html' },
            { id: 'admin-planes-formacion', title: 'Planes de formación', icon: 'far fa-clipboard-list-check', adminLmsMigrate: true, adminMigrateRel: 'ubits-colaborador/lms-creator/planes-formacion/planes-contenidos.html' },
            { id: 'admin-u-corporativa', title: 'Universidad corporativa', icon: 'far fa-building-columns', adminLmsMigrate: true, adminMigrateRel: 'ubits-colaborador/lms-creator/personalizacion/personalizacion-u-corporativa.html' },
            { id: 'admin-certificados', title: 'Certificados', icon: 'far fa-file-certificate', adminLmsMigrate: true, adminMigrateRel: 'ubits-colaborador/lms-creator/certificados/certificados.html' },
            { id: 'admin-seguimiento-aprendizaje', title: 'Seguimiento', icon: 'far fa-chart-line', adminLmsMigrate: true, adminMigrateRel: 'ubits-colaborador/lms-creator/personalizacion/personalizacion-seguimiento.html' }
        ]
    },
    {
        id: 'admin-diagnostico',
        title: 'Diagnóstico',
        icon: 'far fa-chart-mixed',
        url: '../../ubits-admin/diagnostico/admin-diagnostico.html',
        isLink: true,
        clickable: true
    },
    {
        id: 'admin-desempeno',
        title: 'Desempeño',
        icon: 'far fa-bars-progress',
        subitems: [
            { id: 'admin-eval-360', title: 'Evaluaciones 360', icon: 'far fa-chart-pie', url: '../../ubits-admin/desempeno/360/admin-360.html' },
            { id: 'admin-objetivos', title: 'Objetivos', icon: 'far fa-bullseye', url: '../../ubits-admin/desempeno/admin-objetivos.html' },
            { id: 'admin-matriz-talento', title: 'Matriz de Talento', icon: 'far fa-sitemap', url: '../../ubits-admin/desempeno/admin-matriz-talento.html' }
        ]
    },
    {
        id: 'admin-encuestas',
        title: 'Encuestas',
        icon: 'far fa-clipboard-list-check',
        url: '../../ubits-admin/encuestas/admin-encuestas.html',
        isLink: true,
        clickable: true
    },
    {
        id: 'admin-otros',
        title: 'Otros',
        icon: 'far fa-ellipsis-h',
        subitems: [
            { id: 'admin-api', title: 'API', icon: 'far fa-code', url: '../../ubits-admin/otros/admin-api.html' },
            { id: 'admin-help', title: 'Centro de ayuda', icon: 'far fa-circle-question', url: '../../ubits-admin/otros/admin-help-center.html' }
        ]
    }
];

/** LMS Creator — cuatro bloques como SubNav creator-* (README) */
const FLOATING_MENU_SECTIONS_CREATOR = [
    {
        id: 'creator-lms',
        title: 'LMS Creator',
        icon: 'far fa-bolt',
        subitems: [
            { id: 'contenidos', title: 'Contenidos', icon: 'far fa-folder-open', url: '../../ubits-colaborador/lms-creator/contenidos.html' },
            { id: 'categorias', title: 'Categorías', icon: 'far fa-tags', url: '../../ubits-colaborador/lms-creator/categorias.html' }
        ]
    },
    {
        id: 'creator-planes',
        title: 'Planes de formación',
        icon: 'far fa-clipboard-list',
        subitems: [
            { id: 'planes-contenidos', title: 'Planes de contenidos', icon: 'far fa-layer-group', url: '../../ubits-colaborador/lms-creator/planes-formacion/planes-contenidos.html' },
            { id: 'planes-competencias', title: 'Planes de competencias', icon: 'far fa-bullseye', url: '../../ubits-colaborador/lms-creator/planes-formacion/planes-competencias.html' },
            { id: 'grupos', title: 'Grupos', icon: 'far fa-users', url: '../../ubits-colaborador/lms-creator/planes-formacion/grupos.html' }
        ]
    },
    {
        id: 'creator-certificados',
        title: 'Certificados',
        icon: 'far fa-award',
        subitems: [
            { id: 'certificados-descarga', title: 'Descarga', icon: 'far fa-download', url: '../../ubits-colaborador/lms-creator/certificados/certificados.html' },
            { id: 'certificados-config', title: 'Configuración', icon: 'far fa-sliders', url: '../../ubits-colaborador/lms-creator/certificados/certificados-configuracion.html' }
        ]
    },
    {
        id: 'creator-personalizacion',
        title: 'Personalización',
        icon: 'far fa-palette',
        subitems: [
            { id: 'personalizacion-u-corporativa', title: 'Universidad corporativa', icon: 'far fa-building-columns', url: '../../ubits-colaborador/lms-creator/personalizacion/personalizacion-u-corporativa.html' },
            { id: 'personalizacion-seguimiento', title: 'Seguimiento', icon: 'far fa-chart-line', url: '../../ubits-colaborador/lms-creator/personalizacion/personalizacion-seguimiento.html' }
        ]
    }
];

function getFloatingMenuBasePath() {
    if (typeof getBasePath === 'function') {
        return getBasePath();
    }
    const path = (window.location.pathname || '').replace(/\\/g, '/');
    const markers = ['/ubits-colaborador/', '/ubits-admin/', '/documentacion/'];
    for (const marker of markers) {
        if (!path.includes(marker)) continue;
        const afterMarker = path.split(marker)[1] || '';
        const parts = afterMarker.split('/').filter(Boolean);
        const depth = Math.max(1, parts.length);
        return '../'.repeat(depth);
    }
    return '';
}

function resolveFloatingUrl(url) {
    if (!url) return url;
    const basePath = getFloatingMenuBasePath();
    /* Enlaces ya resueltos con getFloatingMenuBasePath() (p. ej. perfil tab-bar: base + ubits-colaborador/...).
       Si volvemos a aplicar el reemplazo de ../../, en rutas profundas (certificados/, planes-formacion/*)
       se duplican ../ y el href queda roto (../../../../...). */
    if (basePath && url.startsWith(basePath)) {
        return url;
    }
    const stdPrefix = '../../';
    if (url.startsWith(stdPrefix) && basePath !== stdPrefix) {
        return basePath + url.slice(stdPrefix.length);
    }
    return url;
}

function getSectionsForVariant(variant) {
    if (variant === 'admin') return FLOATING_MENU_SECTIONS_ADMIN;
    if (variant === 'creator') return FLOATING_MENU_SECTIONS_CREATOR;
    return FLOATING_MENU_SECTIONS_DEFAULT;
}

function getFloatingMenuHeaderTitle(variant) {
    if (variant === 'admin') return 'Administración';
    if (variant === 'creator') return 'LMS Creator';
    return 'Módulos';
}

function getCurrentFloatingMenuSections() {
    return window.currentFloatingMenuSections || FLOATING_MENU_SECTIONS_DEFAULT;
}

/**
 * Panel tab-bar «Mi perfil»: mismo layout que Módulos / Admin / LMS Creator (acordeón flotante).
 */
function getFloatingProfileMenuHTML(variant) {
    variant = variant || 'default';
    const base = getFloatingMenuBasePath();
    const parts = [];

    function rowLink(id, title, iconClass, href, anchorExtra, iconExtraClass) {
        anchorExtra = anchorExtra || '';
        return (
            '<a href="' + resolveFloatingUrl(href) + '" class="accordion-link direct-link" id="link-' + id + '"' + anchorExtra + '>' +
            '<div class="accordion-title">' +
            getDrawerIconCircleHTML(id, iconClass, iconExtraClass) +
            '<span class="ubits-body-md-regular">' + title + '</span>' +
            '</div>' +
            '<i class="far fa-chevron-right accordion-chevron"></i>' +
            '</a>'
        );
    }

    parts.push(rowLink('fp-ver-perfil', 'Ver mi perfil', 'far fa-user', base + 'ubits-colaborador/perfil/profile.html'));

    if (variant === 'admin') {
        parts.push(rowLink('fp-modo-colab', 'Modo Colaborador', 'far fa-user-gear', base + 'ubits-colaborador/aprendizaje/home-learn.html'));
        parts.push(rowLink('fp-modo-creator', 'Modo LMS Creator', 'far fa-bolt', base + 'ubits-colaborador/lms-creator/contenidos.html'));
    } else if (variant === 'creator') {
        parts.push(rowLink('fp-modo-colab', 'Modo Colaborador', 'far fa-user-gear', base + 'ubits-colaborador/aprendizaje/home-learn.html'));
        parts.push(rowLink('fp-modo-admin', 'Modo Administrador', 'far fa-laptop', base + 'ubits-admin/inicio/admin.html'));
    } else {
        parts.push(rowLink('fp-modo-admin', 'Modo Administrador', 'far fa-laptop', base + 'ubits-admin/inicio/admin.html'));
        parts.push(rowLink('fp-modo-creator', 'Modo LMS Creator', 'far fa-bolt', base + 'ubits-colaborador/lms-creator/contenidos.html'));
    }

    parts.push(rowLink('fp-doc', 'Documentación', 'far fa-book', base + 'documentacion/documentacion.html', ' target="_blank" rel="noopener noreferrer"'));

    parts.push(
        '<a href="#" class="accordion-link direct-link" id="link-fp-pwd" onclick="handleProfileFloatingPassword(event); return false;">' +
        '<div class="accordion-title">' +
        getDrawerIconCircleHTML('fp-pwd', 'far fa-key') +
        '<span class="ubits-body-md-regular">Cambio de contraseña</span>' +
        '</div>' +
        '<i class="far fa-chevron-right accordion-chevron"></i>' +
        '</a>'
    );
    parts.push(
        '<a href="#" class="accordion-link direct-link" id="link-fp-logout" onclick="handleProfileFloatingLogout(event); return false;">' +
        '<div class="accordion-title">' +
        getDrawerIconCircleHTML('fp-logout', 'far fa-sign-out-alt', ' icon-error') +
        '<span class="ubits-body-md-regular">Cerrar sesión</span>' +
        '</div>' +
        '</a>'
    );

    return (
        '<div class="floating-menu" id="floating-menu-profile">' +
        '<div class="floating-menu-header">' +
        '<h2 class="floating-menu-title">Perfil</h2>' +
        '<button type="button" class="floating-menu-close" onclick="hideFloatingProfileMenu()" aria-label="Cerrar">' +
        '<i class="far fa-times"></i>' +
        '</button>' +
        '</div>' +
        '<div class="floating-menu-content">' +
        '<div class="floating-menu-profile-user">' +
        '<img class="floating-menu-profile-avatar" src="' + base + 'images/Profile-image.jpg" alt="María Alejandra" />' +
        '<div class="floating-menu-profile-info">' +
        '<span class="floating-menu-profile-name">María Alejandra</span>' +
        '<span class="floating-menu-profile-role">Colaborador</span>' +
        '</div>' +
        '</div>' +
        '<hr class="floating-menu-divider" />' +
        parts.join('') +
        '</div>' +
        '</div>'
    );
}

function handleProfileFloatingPassword(event) {
    if (event) event.preventDefault();
    hideFloatingProfileMenu();
    alert('Próximamente: Cambio de contraseña');
}

function handleProfileFloatingLogout(event) {
    if (event) event.preventDefault();
    hideFloatingProfileMenu();
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        alert('Sesión cerrada');
    }
}

function handleAdminLmsMigrateFloatingClick(event) {
    if (event) event.preventDefault();
    if (typeof hideFloatingMenu === 'function') {
        hideFloatingMenu();
    }
    var bp = typeof getFloatingMenuBasePath === 'function' ? getFloatingMenuBasePath() : '';
    var anchor = event && event.currentTarget;
    var rel = anchor && anchor.getAttribute('data-admin-migrate-rel');
    var targetUrl =
        rel && typeof rel === 'string'
            ? bp + rel
            : bp + 'ubits-colaborador/lms-creator/contenidos-sin-migrar.html';
    if (typeof window.openAdminLmsMigrateConfirm === 'function') {
        window.openAdminLmsMigrateConfirm(bp, targetUrl);
    }
}

window.handleAdminLmsMigrateFloatingClick = handleAdminLmsMigrateFloatingClick;

function syncFloatingMenusBodyOverflow() {
    const fm = document.getElementById('floating-menu');
    const fp = document.getElementById('floating-menu-profile');
    const anyOpen = (fm && fm.classList.contains('show')) || (fp && fp.classList.contains('show'));
    document.body.style.overflow = anyOpen ? 'hidden' : '';
    setFloatingBackdropVisible(anyOpen);
}

function getFloatingMenuHTML(variant) {
    variant = variant || 'default';
    const sections = getSectionsForVariant(variant);
    const headerTitle = getFloatingMenuHeaderTitle(variant);
    const sectionsHTML = sections.map(section => {
        // Si es un enlace directo (no acordeón)
        if (section.isLink) {
            const disabledClass = section.clickable === false ? ' disabled' : '';
            return (
                '<a href="' + resolveFloatingUrl(section.url) + '" class="accordion-link direct-link' + disabledClass + '" id="link-' + section.id + '">' +
                '<div class="accordion-title">' +
                getDrawerIconCircleHTML(section.id, section.icon) +
                '<span class="ubits-body-md-regular">' + section.title + '</span>' +
                '</div>' +
                '<i class="far fa-chevron-right accordion-chevron"></i>' +
                '</a>'
            );
        }
        
        // Si es acordeón normal
        const subitemsHTML = section.subitems.map(subitem => {
            if (subitem.adminLmsMigrate && subitem.adminMigrateRel) {
                return (
                    '<a href="#" class="accordion-link" id="link-' + subitem.id + '" data-admin-migrate-rel="' + subitem.adminMigrateRel + '" onclick="handleAdminLmsMigrateFloatingClick(event); return false;">' +
                    getDrawerIconCircleHTML(subitem.id, subitem.icon) +
                    '<span class="ubits-body-sm-regular">' + subitem.title + '</span>' +
                    '</a>'
                );
            }
            return (
                '<a href="' + resolveFloatingUrl(subitem.url) + '" class="accordion-link" id="link-' + subitem.id + '">' +
                getDrawerIconCircleHTML(subitem.id, subitem.icon) +
                '<span class="ubits-body-sm-regular">' + subitem.title + '</span>' +
                '</a>'
            );
        }).join('');

        return (
            '<div class="accordion-item" id="accordion-item-' + section.id + '">' +
            '<div class="accordion-header" id="header-' + section.id + '" onclick="toggleAccordion(\'' + section.id + '\')">' +
            '<div class="accordion-title">' +
            getDrawerIconCircleHTML(section.id, section.icon) +
            '<span class="ubits-body-md-regular">' + section.title + '</span>' +
            '</div>' +
            '<i class="far fa-chevron-down accordion-chevron" id="chevron-' + section.id + '"></i>' +
            '</div>' +
            '<div class="accordion-body" id="body-' + section.id + '">' +
            subitemsHTML +
            '</div>' +
            '</div>'
        );
    }).join('');

    return `
        <div class="floating-menu" id="floating-menu">
            <div class="floating-menu-header">
                <h2 class="floating-menu-title">${headerTitle}</h2>
                <button type="button" class="floating-menu-close" onclick="hideFloatingMenu()" aria-label="Cerrar">
                    <i class="far fa-times"></i>
                </button>
            </div>
            <div class="floating-menu-content">
                ${sectionsHTML}
            </div>
        </div>
    `;
}

function loadFloatingMenu(containerId, variant) {
    variant = variant || 'default';
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Contenedor '${containerId}' no encontrado`);
        return;
    }

    window.currentFloatingMenuSections = getSectionsForVariant(variant);
    window._floatingMenuVariant = variant;
    container.innerHTML =
        '<div id="floating-menu-backdrop" class="floating-menu-backdrop" onclick="hideAllFloatingMenus()" aria-hidden="true"></div>' +
        getFloatingMenuHTML(variant) +
        getFloatingProfileMenuHTML(variant);
    addFloatingMenuEventListeners();
}

function setFloatingBackdropVisible(visible) {
    const backdrop = document.getElementById('floating-menu-backdrop');
    if (backdrop) {
        if (visible) {
            backdrop.classList.add('is-visible');
            backdrop.setAttribute('aria-hidden', 'false');
        } else {
            backdrop.classList.remove('is-visible');
            backdrop.setAttribute('aria-hidden', 'true');
        }
    }
}

function hideAllFloatingMenus() {
    hideFloatingMenu();
    hideFloatingProfileMenu();
}

function addFloatingMenuEventListeners() {
    if (window._ubitsFloatingMenuListenersBound) {
        return;
    }
    window._ubitsFloatingMenuListenersBound = true;

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            hideFloatingMenu();
            hideFloatingProfileMenu();
        }
    });

    document.addEventListener('click', function (e) {
        const floatingMenu = document.getElementById('floating-menu');
        const fmp = document.getElementById('floating-menu-profile');
        const modulosTab = document.querySelector('[data-tab="modulos"]');
        const perfilTab = document.querySelector('[data-tab="perfil"]');

        if (floatingMenu && floatingMenu.classList.contains('show')) {
            if (!floatingMenu.contains(e.target) && modulosTab && !modulosTab.contains(e.target)) {
                hideFloatingMenu();
            }
        }
        if (fmp && fmp.classList.contains('show')) {
            if (!fmp.contains(e.target) && perfilTab && !perfilTab.contains(e.target)) {
                hideFloatingProfileMenu();
            }
        }
    });
}

function showFloatingMenu() {
    const fp = document.getElementById('floating-menu-profile');
    if (fp) {
        fp.classList.remove('show');
    }
    const floatingMenu = document.getElementById('floating-menu');
    if (floatingMenu) {
        floatingMenu.classList.add('show');
        syncFloatingMenusBodyOverflow();
        setActiveItemByCurrentPage();
    }
}

function hideFloatingMenu() {
    const floatingMenu = document.getElementById('floating-menu');
    if (floatingMenu) {
        floatingMenu.classList.remove('show');
    }
    syncFloatingMenusBodyOverflow();
}

function hideFloatingProfileMenu() {
    const el = document.getElementById('floating-menu-profile');
    if (el) {
        el.classList.remove('show');
    }
    syncFloatingMenusBodyOverflow();
}

function findParentSectionIdForLinkId(linkId) {
    const sections = getCurrentFloatingMenuSections();
    for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        if (section.subitems && section.subitems.some(function (sub) { return sub.id === linkId; })) {
            return section.id;
        }
    }
    return null;
}

function expandAccordion(sectionId) {
    const item = document.getElementById('accordion-item-' + sectionId);
    const header = document.getElementById('header-' + sectionId);
    const circle = document.getElementById('circle-' + sectionId);

    if (!item) return;

    closeAllAccordions();
    item.classList.add('is-open');
    if (header) header.classList.add('expanded-header');
    if (circle) circle.classList.add('active-circle');
}

function toggleAccordion(sectionId) {
    const item = document.getElementById('accordion-item-' + sectionId);
    const header = document.getElementById('header-' + sectionId);
    const circle = document.getElementById('circle-' + sectionId);

    if (!item) return;

    const isCurrentlyOpen = item.classList.contains('is-open');
    closeAllAccordions();

    if (!isCurrentlyOpen) {
        item.classList.add('is-open');
        if (header) header.classList.add('expanded-header');
        if (circle) circle.classList.add('active-circle');
    }
}

function closeAllAccordions() {
    document.querySelectorAll('.accordion-item.is-open').forEach(function (item) {
        item.classList.remove('is-open');
        const header = item.querySelector('.accordion-header');
        const circle = item.querySelector('.accordion-icon-circle');
        if (header) header.classList.remove('expanded-header');
        if (circle) circle.classList.remove('active-circle');
    });
}

// Función para activar elemento según la página actual
function setActiveItemByCurrentPage() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const variant = window._floatingMenuVariant || 'default';

    const pageToElementMapDefault = {
        'ia-para-hr.html': 'ia-para-hr',
        'ubits-ai.html': 'ia-para-hr',
        'diagnostico.html': 'diagnostico',
        'reclutamiento.html': 'reclutamiento',
        'home-learn.html': 'inicio',
        'modo-estudio-ia.html': 'modo-estudio-ia',
        'catalogo.html': 'catalogo',
        'u-corporativa.html': 'corporativa',
        'zona-estudio.html': 'zona-estudio',
        'evaluaciones-360.html': 'evaluaciones-360',
        'objetivos.html': 'objetivos',
        'metricas.html': 'metricas',
        'reportes.html': 'reportes',
        'encuestas.html': 'encuestas',
        'planes.html': 'planes',
        'tareas.html': 'tareas',
        'plantilla.html': 'plantillas',
        'contenidos.html': 'contenidos',
        'categorias.html': 'categorias',
        'certificados.html': 'certificados-descarga',
        'grupos.html': 'grupos',
        'crear-grupo.html': 'grupos',
        'chat-ia-grupos.html': 'grupos',
        'detalle-plan.html': 'planes-contenidos',
        'planes-contenidos.html': 'planes-contenidos',
        'planes-competencias.html': 'planes-competencias',
        'crear-plan-contenidos.html': 'planes-contenidos',
        'crear-plan-competencias.html': 'planes-competencias',
        'editar-plan-contenidos.html': 'planes-contenidos',
        'editar-plan-competencias.html': 'planes-competencias',
        'detalle-plan-competencias.html': 'planes-competencias',
        'planes-formacion/planes-formacion.html': 'planes-contenidos',
        'planes-formacion/planes-contenidos.html': 'planes-contenidos',
        'planes-formacion/planes-competencias.html': 'planes-competencias',
        'planes-formacion/grupos.html': 'grupos',
        'planes-formacion/crear-grupo.html': 'grupos',
        'planes-formacion/detalle-grupo.html': 'grupos',
        'planes-formacion/chat-ia-grupos.html': 'grupos',
        'planes-formacion/detalle-plan.html': 'planes-contenidos',
        'planes-formacion/crear-plan-contenidos.html': 'planes-contenidos',
        'planes-formacion/crear-plan-competencias.html': 'planes-competencias',
        'planes-formacion/editar-plan-contenidos.html': 'planes-contenidos',
        'planes-formacion/editar-plan-competencias.html': 'planes-competencias',
        'planes-formacion/detalle-plan-competencias.html': 'planes-competencias',
        'certificados-configuracion.html': 'certificados-config',
        'personalizacion-seguimiento.html': 'personalizacion-seguimiento',
        'personalizacion-u-corporativa.html': 'personalizacion-u-corporativa',
        'lms-creator/personalizacion/personalizacion-seguimiento.html': 'personalizacion-seguimiento',
        'lms-creator/personalizacion/personalizacion-u-corporativa.html': 'personalizacion-u-corporativa'
    };

    const pageToElementMapAdmin = {
        'admin.html': 'admin-inicio',
        'gestion-de-usuarios.html': 'gestion-usuarios',
        'organigrama.html': 'organigrama',
        'datos-de-empresa.html': 'datos-de-empresa',
        'personalizacion.html': 'personalizacion-empresa',
        'roles-y-permisos.html': 'roles-permisos',
        'comunicaciones.html': 'comunicaciones',
        'admin-diagnostico.html': 'admin-diagnostico',
        'admin-360.html': 'admin-eval-360',
        'admin-objetivos.html': 'admin-objetivos',
        'admin-matriz-talento.html': 'admin-matriz-talento',
        'admin-encuestas.html': 'admin-encuestas',
        'admin-api.html': 'admin-api',
        'admin-help-center.html': 'admin-help'
    };

    const pageToElementMapCreator = {
        'contenidos.html': 'contenidos',
        'crear-contenido.html': 'contenidos',
        'categorias.html': 'categorias',
        'planes-contenidos.html': 'planes-contenidos',
        'planes-competencias.html': 'planes-competencias',
        'grupos.html': 'grupos',
        'crear-grupo.html': 'grupos',
        'chat-ia-grupos.html': 'grupos',
        'detalle-grupo.html': 'grupos',
        'detalle-plan.html': 'planes-contenidos',
        'crear-plan-contenidos.html': 'planes-contenidos',
        'crear-plan-competencias.html': 'planes-competencias',
        'editar-plan-contenidos.html': 'planes-contenidos',
        'editar-plan-competencias.html': 'planes-competencias',
        'detalle-plan-competencias.html': 'planes-competencias',
        'certificados.html': 'certificados-descarga',
        'certificados-configuracion.html': 'certificados-config',
        'personalizacion-u-corporativa.html': 'personalizacion-u-corporativa',
        'personalizacion-seguimiento.html': 'personalizacion-seguimiento',
        'personalizacion/personalizacion-u-corporativa.html': 'personalizacion-u-corporativa',
        'personalizacion/personalizacion-seguimiento.html': 'personalizacion-seguimiento'
    };

    let pageToElementMap = pageToElementMapDefault;
    if (variant === 'admin') pageToElementMap = pageToElementMapAdmin;
    else if (variant === 'creator') pageToElementMap = pageToElementMapCreator;

    const activeElementId = pageToElementMap[currentPage];

    if (activeElementId) {
        setTimeout(function () {
            const sections = getCurrentFloatingMenuSections();
            const section = sections.find(function (s) { return s.id === activeElementId; });

            if (section && section.isLink) {
                setActiveDirectLink(activeElementId);
            } else if (section && section.subitems && section.subitems.length) {
                expandAccordion(section.id);
            } else {
                setActiveAccordionLink(activeElementId);
            }
        }, 100);
    }
}

// Función para activar un link directo
function setActiveDirectLink(linkId) {
    // Remover activo de todos los links directos
    document.querySelectorAll('.accordion-link.direct-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelectorAll('.accordion-link.direct-link .accordion-icon-circle').forEach(circle => {
        circle.classList.remove('active');
    });
    document.querySelectorAll('.accordion-link.direct-link .accordion-icon-circle i').forEach(icon => {
        icon.classList.remove('active');
    });
    
    // Activar el link directo específico
    const link = document.getElementById(`link-${linkId}`);
    const circle = document.getElementById(`circle-${linkId}`);
    const icon = document.getElementById(`icon-${linkId}`);
    
    if (link && circle && icon) {
        link.classList.add('active');
        circle.classList.add('active');
        icon.classList.add('active');
    }
}

// Función para activar un accordion-link específico
function setActiveAccordionLink(linkId) {
    const sectionId = findParentSectionIdForLinkId(linkId);
    if (sectionId) {
        expandAccordion(sectionId);
    }

    document.querySelectorAll('.accordion-link').forEach(function (link) {
        link.classList.remove('active');
    });
    document.querySelectorAll('.accordion-link .accordion-icon-circle').forEach(function (circle) {
        circle.classList.remove('active');
    });
    document.querySelectorAll('.accordion-link .accordion-icon-circle i').forEach(function (icon) {
        icon.classList.remove('active');
    });

    const link = document.getElementById('link-' + linkId);
    const circle = document.getElementById('circle-' + linkId);
    const icon = document.getElementById('icon-' + linkId);

    if (link && circle && icon) {
        link.classList.add('active');
        circle.classList.add('active');
        icon.classList.add('active');
    }
}

// Exportar funciones al window global
window.getFloatingMenuHTML = getFloatingMenuHTML;
window.loadFloatingMenu = loadFloatingMenu;
window.showFloatingMenu = showFloatingMenu;
window.hideFloatingMenu = hideFloatingMenu;
window.hideFloatingProfileMenu = hideFloatingProfileMenu;
window.hideAllFloatingMenus = hideAllFloatingMenus;
window.setFloatingBackdropVisible = setFloatingBackdropVisible;
window.syncFloatingMenusBodyOverflow = syncFloatingMenusBodyOverflow;
window.handleProfileFloatingPassword = handleProfileFloatingPassword;
window.handleProfileFloatingLogout = handleProfileFloatingLogout;
window.toggleAccordion = toggleAccordion;
window.expandAccordion = expandAccordion;
window.closeAllAccordions = closeAllAccordions;
window.setActiveAccordionLink = setActiveAccordionLink;
window.setActiveItemByCurrentPage = setActiveItemByCurrentPage;
window.setActiveDirectLink = setActiveDirectLink;

// Funciones duplicadas eliminadas - ya están definidas arriba