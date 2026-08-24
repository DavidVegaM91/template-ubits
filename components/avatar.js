/* ========================================
   UBITS Avatar Component
   Genera el HTML de un avatar único (imagen o icono de fallback)
   Requiere: avatar.css, fontawesome-icons.css (para fallback con icono)
   ======================================== */

/**
 * Escapa caracteres para uso en atributos HTML (alt, src).
 * @param {string} str
 * @returns {string}
 */
function formatAvatarInitials(value) {
    var trimmed = String(value == null ? '' : value).trim();
    if (!trimmed) return '';
    var parts = trimmed.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
        return ((parts[0].charAt(0) || '') + (parts[1].charAt(0) || '')).toUpperCase();
    }
    return trimmed.slice(0, 2).toUpperCase();
}

function escapeAttr(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

/**
 * Prefijo relativo hasta la raíz del playground según la URL actual.
 * Permite que rutas tipo "../../images/..." de la BD funcionen en cualquier carpeta.
 */
function getAvatarImagesPrefixForPage() {
    try {
        var path = (typeof window !== 'undefined' && window.location && window.location.pathname)
            ? String(window.location.pathname)
            : '';
        if (path.indexOf('/ubits-colaborador/aprendizaje/mi-equipo/') !== -1) return '../../../';
        if (path.indexOf('/ubits-colaborador/aprendizaje/exp-estudio/') !== -1) return '../../../';
        if (path.indexOf('/ubits-admin/lms-creator/planes-formacion/') !== -1) return '../../../';
        if (path.indexOf('/ubits-admin/lms-creator/') !== -1) return '../../';
        if (path.indexOf('/ubits-colaborador/') !== -1) return '../../';
        if (path.indexOf('/ubits-admin/') !== -1) return '../../';
        if (path.indexOf('/documentacion/') !== -1) return '../../';
    } catch (e) { /* noop */ }
    return '';
}

/**
 * Normaliza URL de avatar relativa (p. ej. Profile-image.jpg de E006) al depth de la página actual.
 * @param {string|null|undefined} avatar
 * @returns {string|null}
 */
function normalizeAvatarUrlForPage(avatar) {
    var a = String(avatar || '').trim();
    if (!a) return null;
    if (a.indexOf('http://') === 0 || a.indexOf('https://') === 0 || a.indexOf('data:') === 0) return a;
    a = a.replace(/^(\.\.\/)+/, '');
    if (a.indexOf('images/') === 0) return getAvatarImagesPrefixForPage() + a;
    return a;
}

/**
 * Genera el HTML de un avatar único.
 * - Si tiene avatar (URL): muestra la imagen.
 * - Si no tiene avatar: muestra icono de usuario (far fa-user).
 *
 * @param {Object} persona - Objeto con nombre/nombre y opcionalmente avatar
 * @param {string} [persona.nombre] - Nombre de la persona (también acepta persona.name)
 * @param {string} [persona.name] - Nombre (alternativo a nombre)
 * @param {string|null} [persona.avatar] - URL de la imagen del avatar
 * @param {Object} [options] - Opciones del avatar
 * @param {string} [options.size='md'] - Tamaño: '2xs' (14px), 'xs' (20px), 'sm' (28px), 'md' (32px), 'lg' (48px), 'xl' (64px)
 * @param {string} [options.alt] - Texto alternativo para la imagen (por defecto usa el nombre)
 * @param {string} [options.initials] - Letra(s) inicial(es) si no hay imagen. Máx. 2 caracteres.
 * @param {boolean} [options.showTooltip=false] - Si true, añade data-tooltip con el nombre (requiere initTooltip del componente tooltip)
 * @param {number} [options.tooltipDelay=1000] - Delay en ms antes de mostrar el tooltip (solo si showTooltip es true)
 * @param {boolean} [options.selectable=false] - Si true, hover/selección con borde brand (opt-in)
 * @param {boolean} [options.selected=false] - Estado seleccionado (solo si selectable es true)
 * @returns {string} HTML del avatar
 */
function renderAvatar(persona, options) {
    const opts = options || {};
    const size = (opts.size && ['2xs', 'xs', 'sm', 'md', 'lg', 'xl'].includes(opts.size)) ? opts.size : 'md';
    const sizeClass = `ubits-avatar--${size}`;
    const selectableClass = opts.selectable ? ' ubits-avatar--selectable' : '';
    const selectedClass = opts.selectable && opts.selected ? ' ubits-avatar--selected' : '';
    const tabIndexAttr = opts.selectable ? ' tabindex="0"' : '';
    const nombre = persona && (persona.nombre || persona.name);
    const forceNoImg = opts.initialsOnly === true;
    const avatarUrl = forceNoImg ? null : normalizeAvatarUrlForPage(persona && (persona.avatar || persona.providerLogo));
    const initials = formatAvatarInitials(opts.initials || (persona && persona.initials) || nombre || '');
    const status = opts.status && ['online', 'offline', 'busy', 'away'].includes(opts.status) ? opts.status : null;
    const statusPos = opts.statusPosition && ['bottom-right', 'top-right', 'bottom-left', 'top-left'].includes(opts.statusPosition)
        ? opts.statusPosition : 'bottom-right';
    const STATUS_LABEL = { online: 'En línea', offline: 'Desconectado', busy: 'Ocupado', away: 'Ausente' };
    const ring = opts.ring === true ? 'ring' : (opts.ring === 'pulse' || opts.ring === 'spin' || opts.ring === 'gradient') ? 'ring-' + opts.ring : '';
    const ringClass = ring ? ` ubits-avatar--${ring}` : '';
    const loading = opts.loading === true;
    const loadingClass = loading ? ' ubits-avatar--loading' : '';
    const grayscaleClass = opts.grayscale ? ' ubits-avatar--grayscale' : '';
    const shapeClass = opts.shape === 'rounded' ? ' ubits-avatar--rounded' : '';
    const tone = opts.fallbackTone && ['muted', 'brand', 'solid'].includes(opts.fallbackTone) ? opts.fallbackTone : null;
    const toneClass = (!avatarUrl && tone) ? ` ubits-avatar--tone-${tone}` : '';

    var badges = Array.isArray(opts.badges) ? opts.badges.slice() : [];
    if (!badges.length && opts.badgeIcon) {
        badges.push({ icon: opts.badgeIcon, position: opts.badgePosition || 'bottom-right' });
    }

    var inner;
    if (avatarUrl) {
        inner = `<img src="${escapeAttr(avatarUrl)}" alt="${escapeAttr(opts.alt != null ? opts.alt : (nombre || 'Avatar'))}" class="ubits-avatar__img">`;
    } else if (initials) {
        inner = `<span class="ubits-avatar__initials" aria-hidden="true">${escapeAttr(initials)}</span>`;
    } else {
        inner = `<span class="ubits-avatar__fallback"><i class="far fa-user"></i></span>`;
    }

    const tooltipAttrs = opts.showTooltip && nombre
        ? ` data-tooltip="${escapeAttr(nombre)}" data-tooltip-delay="${Number(opts.tooltipDelay) || 1000}"`
        : '';
    const avatarHtml = `<span class="ubits-avatar ${sizeClass}${selectableClass}${selectedClass}${ringClass}${loadingClass}${grayscaleClass}${shapeClass}${toneClass}"${tooltipAttrs}${tabIndexAttr}>${inner}</span>`;

    const needsShell = Boolean(status || badges.length || loading);
    if (!needsShell) return avatarHtml;

    var extras = '';
    if (status) {
        var statusLabel = STATUS_LABEL[status] || status;
        extras += `<span class="ubits-avatar__status ubits-avatar__status--${status} ubits-avatar__status--${statusPos}" title="${statusLabel}" aria-label="${statusLabel}"></span>`;
    }
    badges.forEach(function (b) {
        var pos = (b && b.position) || 'bottom-right';
        var icon = (b && b.icon) || '';
        if (!icon) return;
        extras += `<span class="ubits-avatar__badge ubits-avatar__badge--${pos}" aria-hidden="true"><i class="${escapeAttr(icon)}"></i></span>`;
    });
    if (loading) {
        extras += '<span class="ubits-avatar__loading-overlay" aria-hidden="true"><span class="ubits-avatar__loading-spinner"></span></span>';
    }
    return `<span class="ubits-avatar-shell ubits-avatar--${size}">${avatarHtml}${extras}</span>`;
}

/**
 * Genera el HTML de una profile list: varios avatares superpuestos, con +N si hay más de maxVisible.
 *
 * @param {Array<Object>} personas - Array de objetos { nombre/name, avatar }
 * @param {Object} [options] - Opciones
 * @param {string} [options.size='md'] - Tamaño: '2xs' (14px), 'xs' (20px), 'sm' (28px), 'md' (32px), 'lg' (48px), 'xl' (64px)
 * @param {number} [options.maxVisible=3] - Número de avatares visibles antes del chip +N
 * @param {boolean} [options.showTooltip=true] - Tooltip con nombre en cada avatar visible (requiere initTooltip o wireProfileLists)
 * @param {number} [options.tooltipDelay=300] - Delay en ms del tooltip
 * @param {boolean} [options.showOverflowPopover=true] - Popover al clic en +N con personas restantes (requiere initProfileLists una vez)
 * @param {'count'|'icon'} [options.overflowMode='count'] - Overflow numérico (+N) o con icono (far fa-users)
 * @param {string} [options.overflowIcon='far fa-users'] - Clase FA cuando overflowMode='icon'
 * @param {boolean} [options.selectable=false] - Si true, avatares clickeables con hover/selección (opt-in)
 * @returns {string} HTML de la profile list
 */
function renderProfileList(personas, options) {
    const opts = options || {};
    const size = (opts.size && ['2xs', 'xs', 'sm', 'md', 'lg', 'xl'].includes(opts.size)) ? opts.size : 'md';
    const maxVisible = typeof opts.maxVisible === 'number' && opts.maxVisible > 0 ? opts.maxVisible : 3;
    const selectable = opts.selectable === true;
    const showTooltip = opts.showTooltip !== false;
    const showOverflowPopover = opts.showOverflowPopover !== false;
    const overflowMode = opts.overflowMode === 'icon' ? 'icon' : 'count';
    const overflowIcon = typeof opts.overflowIcon === 'string' && opts.overflowIcon
        ? opts.overflowIcon
        : 'far fa-users';
    const tooltipDelay = Number(opts.tooltipDelay) || 300;
    const hoverLift = opts.hoverLift === true && !selectable;
    const hoverSpread = opts.hoverSpread === true && !selectable;
    const listModifier = (selectable ? ' ubits-profile-list--selectable' : '') + (hoverLift ? ' ubits-profile-list--hover-lift' : '') + (hoverSpread ? ' ubits-profile-list--hover-spread' : '');

    const list = Array.isArray(personas) ? personas : [];
    if (list.length === 0) {
        return `<div class="ubits-profile-list ubits-profile-list--${size}${listModifier}"></div>`;
    }

    const visibleCount = Math.min(list.length, maxVisible);
    const remainingCount = list.length > maxVisible ? list.length - maxVisible : 0;
    const avatarOpts = { size: size };

    const items = list.slice(0, visibleCount).map(function (persona, index) {
        const zIndex = visibleCount - index;
        const marginRight = (index < visibleCount - 1) || remainingCount > 0 ? '-5px' : '0';
        const isSelected = selectable && persona && persona.selected === true;
        const itemStatus = persona && persona.status && ['online', 'offline', 'busy', 'away'].includes(persona.status)
            ? persona.status
            : null;
        const avatarHtml = renderAvatar(persona, Object.assign({}, avatarOpts, itemStatus ? { status: itemStatus } : {}));
        const nombre = persona && (persona.nombre || persona.name);
        const tooltipAttrs = showTooltip && nombre
            ? ` data-tooltip="${escapeAttr(nombre)}" data-tooltip-delay="${tooltipDelay}"`
            : '';
        const selectedClass = isSelected ? ' ubits-profile-list__avatar--selected' : '';
        const tabIndexAttr = selectable ? ' tabindex="0" role="button"' : '';
        return `<span class="ubits-profile-list__avatar${selectedClass}" style="z-index: ${zIndex}; margin-right: ${marginRight};"${tooltipAttrs}${tabIndexAttr}>${avatarHtml}</span>`;
    }).join('');

    var overflowPayload = '';
    if (remainingCount > 0 && showOverflowPopover) {
        try {
            var overflowData = list.slice(maxVisible).map(function (persona) {
                var entry = {
                    nombre: (persona && (persona.nombre || persona.name)) || 'Sin asignar',
                    avatar: persona && persona.avatar ? persona.avatar : null
                };
                if (persona && persona.status) entry.status = persona.status;
                if (persona && persona._key) entry._key = persona._key;
                if (persona && persona.id) entry.id = persona.id;
                return entry;
            });
            overflowPayload = escapeAttr(encodeURIComponent(JSON.stringify(overflowData)));
        } catch (e) { /* noop */ }
    }

    const overflowInner = overflowMode === 'icon'
        ? `<i class="${escapeAttr(overflowIcon)} ubits-profile-list__count-icon" aria-hidden="true"></i>`
        : `<span class="ubits-profile-list__count-text">+${remainingCount}</span>`;

    const countHtml = remainingCount > 0
        ? (showOverflowPopover && overflowPayload
            ? `<button type="button" class="ubits-profile-list__count ubits-profile-list__count-btn" style="z-index: 0; margin-right: 0;" data-profile-list-overflow="${overflowPayload}" data-profile-list-size="${size}" aria-label="Ver ${remainingCount} más">${overflowInner}</button>`
            : `<span class="ubits-profile-list__count" style="z-index: 0; margin-right: 0;">${overflowInner}</span>`)
        : '';

    return `<div class="ubits-profile-list ubits-profile-list--${size}${listModifier}">${items}${countHtml}</div>`;
}

var PROFILE_LIST_OVERFLOW_OVERLAY_ID = 'ubits-profile-list-overflow-overlay';
var PROFILE_LIST_OVERFLOW_POPOVER_ID = 'ubits-profile-list-overflow-popover';
var PROFILE_LIST_OVERFLOW_LIST_ID = 'ubits-profile-list-overflow-popover-list';

function ensureProfileListOverflowDom() {
    if (typeof document === 'undefined') return;
    if (document.getElementById(PROFILE_LIST_OVERFLOW_POPOVER_ID)) return;
    var overlay = document.createElement('div');
    overlay.id = PROFILE_LIST_OVERFLOW_OVERLAY_ID;
    overlay.className = 'ubits-profile-list-overflow-overlay';
    overlay.style.display = 'none';
    overlay.setAttribute('aria-hidden', 'true');
    var popover = document.createElement('div');
    popover.id = PROFILE_LIST_OVERFLOW_POPOVER_ID;
    popover.className = 'ubits-profile-list-overflow-popover';
    popover.style.display = 'none';
    popover.setAttribute('role', 'dialog');
    popover.setAttribute('aria-label', 'Personas asignadas');
    var list = document.createElement('div');
    list.id = PROFILE_LIST_OVERFLOW_LIST_ID;
    list.className = 'ubits-profile-list-overflow-popover-list';
    popover.appendChild(list);
    document.body.appendChild(overlay);
    document.body.appendChild(popover);
    overlay.addEventListener('click', closeProfileListOverflowPopover);
}

function closeProfileListOverflowPopover() {
    if (typeof document === 'undefined') return;
    var overlay = document.getElementById(PROFILE_LIST_OVERFLOW_OVERLAY_ID);
    var popover = document.getElementById(PROFILE_LIST_OVERFLOW_POPOVER_ID);
    if (overlay) {
        overlay.style.display = 'none';
        overlay.setAttribute('aria-hidden', 'true');
    }
    if (popover) popover.style.display = 'none';
}

function openProfileListOverflowPopover(chip) {
    if (!chip || typeof document === 'undefined') return;
    ensureProfileListOverflowDom();
    var raw = chip.getAttribute('data-profile-list-overflow');
    if (!raw) return;
    var personas;
    try {
        personas = JSON.parse(decodeURIComponent(raw));
    } catch (e) {
        return;
    }
    if (!Array.isArray(personas) || !personas.length) return;
    var listEl = document.getElementById(PROFILE_LIST_OVERFLOW_LIST_ID);
    var popover = document.getElementById(PROFILE_LIST_OVERFLOW_POPOVER_ID);
    var overlay = document.getElementById(PROFILE_LIST_OVERFLOW_OVERLAY_ID);
    if (!listEl || !popover || !overlay) return;
    var size = chip.getAttribute('data-profile-list-size') || 'sm';
    listEl.innerHTML = personas.map(function (p) {
        var nombre = (p && (p.nombre || p.name)) || 'Sin asignar';
        var itemKey = (p && (p._key || p.id)) ? String(p._key || p.id) : '';
        var keyAttr = itemKey ? ' data-profile-list-overflow-item-key="' + escapeAttr(itemKey) + '"' : '';
        var avatarHtml = typeof renderAvatar === 'function'
            ? renderAvatar({ nombre: nombre, avatar: p.avatar }, {
                size: 'xs',
                status: p && p.status && ['online', 'offline', 'busy', 'away'].includes(p.status) ? p.status : undefined
            })
            : '';
        return '<div class="ubits-profile-list-overflow-popover-item"' + keyAttr + '>' + avatarHtml +
            '<span class="ubits-body-sm-regular">' + escapeAttr(nombre) + '</span></div>';
    }).join('');
    overlay.style.display = 'block';
    overlay.setAttribute('aria-hidden', 'false');
    popover.style.display = 'block';
    var rect = chip.getBoundingClientRect();
    var popoverH = popover.offsetHeight;
    var gap = 4;
    var margin = 8;
    var spaceBelow = window.innerHeight - rect.bottom - margin;
    var spaceAbove = rect.top - margin;
    if (spaceBelow >= popoverH + gap) {
        popover.style.top = (rect.bottom + gap) + 'px';
    } else if (spaceAbove >= popoverH + gap) {
        popover.style.top = (rect.top - popoverH - gap) + 'px';
    } else {
        popover.style.top = (spaceBelow >= spaceAbove ? (rect.bottom + gap) : (rect.top - popoverH - gap)) + 'px';
    }
    var left = rect.left;
    var maxLeft = window.innerWidth - popover.offsetWidth - margin;
    if (left > maxLeft) left = maxLeft;
    if (left < margin) left = margin;
    popover.style.left = left + 'px';
}

function initProfileLists() {
    if (typeof document === 'undefined' || window.__ubitsProfileListsInit) return;
    window.__ubitsProfileListsInit = true;
    ensureProfileListOverflowDom();
    document.addEventListener('click', function (e) {
        var chip = e.target.closest('.ubits-profile-list__count-btn');
        if (chip) {
            e.preventDefault();
            e.stopPropagation();
            openProfileListOverflowPopover(chip);
            return;
        }
        var popover = document.getElementById(PROFILE_LIST_OVERFLOW_POPOVER_ID);
        if (popover && popover.style.display === 'block') {
            if (!e.target.closest('#' + PROFILE_LIST_OVERFLOW_POPOVER_ID)) {
                closeProfileListOverflowPopover();
            }
        }
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeProfileListOverflowPopover();
    });
}

/**
 * Inicializa tooltips en profile lists dentro de root (o en todo el documento).
 * @param {Document|HTMLElement|string} [root]
 */
function wireProfileLists(root) {
    if (typeof initTooltip !== 'function') return;
    if (!root) {
        initTooltip('.ubits-profile-list [data-tooltip]');
        return;
    }
    if (typeof root === 'string') {
        initTooltip(root + ' .ubits-profile-list [data-tooltip], ' + root + '[data-tooltip]');
        return;
    }
    if (root.id) {
        initTooltip('#' + root.id + ' [data-tooltip]');
    }
}

if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initProfileLists);
    } else {
        initProfileLists();
    }
}

// Exponer globalmente para uso en páginas HTML
if (typeof window !== 'undefined') {

/**
 * Prueba social: grupo de avatares + etiqueta.
 * @param {Array<Object>} personas
 * @param {Object} [options]
 * @param {string} [options.label='']
 * @param {string} [options.size='sm']
 * @param {number} [options.maxVisible=3]
 * @param {boolean} [options.initialsOnly=false]
 * @returns {string}
 */
function renderAvatarSocialProof(personas, options) {
    const opts = options || {};
    const label = opts.label != null ? String(opts.label) : '';
    const listHtml = renderProfileList(personas, {
        size: opts.size || 'sm',
        maxVisible: typeof opts.maxVisible === 'number' ? opts.maxVisible : 3,
        showTooltip: opts.showTooltip !== false,
        showOverflowPopover: false,
        selectable: false
    });
    // Si initialsOnly, re-render items sin avatar url
    var html = listHtml;
    if (opts.initialsOnly === true) {
        var compact = (Array.isArray(personas) ? personas : []).map(function (p) {
            return { nombre: p && (p.nombre || p.name), initials: p && p.initials };
        });
        html = compact.map(function () { return ''; }).join(''); // rebuilt below
        html = renderProfileList(
            (Array.isArray(personas) ? personas : []).map(function (p) {
                return { nombre: p && (p.nombre || p.name), avatar: null, initials: (p && p.initials) || undefined };
            }),
            {
                size: opts.size || 'sm',
                maxVisible: typeof opts.maxVisible === 'number' ? opts.maxVisible : 3,
                showTooltip: opts.showTooltip !== false,
                showOverflowPopover: false
            }
        );
        // force initialsOnly on each avatar by replacing — simpler: custom loop
        var size = opts.size || 'sm';
        var maxVisible = typeof opts.maxVisible === 'number' ? opts.maxVisible : 3;
        var list = Array.isArray(personas) ? personas : [];
        var visible = list.slice(0, maxVisible);
        var remaining = Math.max(0, list.length - maxVisible);
        var items = visible.map(function (p, index) {
            var z = visible.length - index;
            var mr = (index < visible.length - 1) || remaining > 0 ? '-5px' : '0';
            var av = renderAvatar(p, { size: size, initialsOnly: true, initials: p && p.initials });
            return `<span class="ubits-profile-list__avatar" style="z-index:${z};margin-right:${mr};">${av}</span>`;
        }).join('');
        var count = remaining > 0
            ? `<span class="ubits-profile-list__count" style="z-index:0;"><span class="ubits-profile-list__count-text">+${remaining}</span></span>`
            : '';
        html = `<div class="ubits-profile-list ubits-profile-list--${size}">${items}${count}</div>`;
    }
    return `<span class="ubits-avatar-social-proof">${html}<span class="ubits-avatar-social-proof__label ubits-body-sm-regular">${escapeAttr(label)}</span></span>`;
}

/**
 * Avatar + título + descripción (paridad React UbitsAvatarLabel).
 * @param {Object} persona
 * @param {Object} [options]
 * @param {string} options.title
 * @param {string} [options.description]
 * @returns {string}
 */
function renderAvatarLabel(persona, options) {
    const opts = options || {};
    const title = opts.title != null ? String(opts.title) : (persona && (persona.nombre || persona.name)) || '';
    const description = opts.description != null ? String(opts.description) : '';
    const avatarHtml = renderAvatar(persona, {
        size: opts.size,
        alt: opts.alt != null ? opts.alt : title,
        initials: opts.initials,
        initialsOnly: opts.initialsOnly,
        status: opts.status,
        statusPosition: opts.statusPosition,
        shape: opts.shape,
        fallbackTone: opts.fallbackTone,
        grayscale: opts.grayscale,
        loading: opts.loading,
        ring: opts.ring,
        badgeIcon: opts.badgeIcon,
        badgePosition: opts.badgePosition,
        badges: opts.badges
    });
    const descHtml = description
        ? `<span class="ubits-avatar-label__description ubits-body-xs-regular">${escapeAttr(description)}</span>`
        : '';
    return `<span class="ubits-avatar-label">${avatarHtml}<span class="ubits-avatar-label__text"><span class="ubits-avatar-label__title ubits-body-sm-bold">${escapeAttr(title)}</span>${descHtml}</span></span>`;
}

    window.renderAvatar = renderAvatar;
    window.renderAvatarLabel = renderAvatarLabel;
    window.renderAvatarSocialProof = renderAvatarSocialProof;
    window.formatAvatarInitials = formatAvatarInitials;
    window.renderProfileList = renderProfileList;
    window.normalizeAvatarUrlForPage = normalizeAvatarUrlForPage;
    window.initProfileLists = initProfileLists;
    window.wireProfileLists = wireProfileLists;
    window.closeProfileListOverflowPopover = closeProfileListOverflowPopover;
}
