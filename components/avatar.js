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
        if (path.indexOf('/ubits-colaborador/lms-creator/planes-formacion/') !== -1) return '../../../';
        if (path.indexOf('/ubits-colaborador/lms-creator/') !== -1) return '../../';
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
 * - Si mode es 'admin' o 'lms': envuelve el avatar en .ubits-avatar-modo
 *   con un badge-tag text-only indicando el rol activo.
 *   Requiere badge-tag.css cuando se usa con mode.
 *
 * @param {Object} persona - Objeto con nombre/nombre y opcionalmente avatar
 * @param {string} [persona.nombre] - Nombre de la persona (también acepta persona.name)
 * @param {string} [persona.name] - Nombre (alternativo a nombre)
 * @param {string|null} [persona.avatar] - URL de la imagen del avatar
 * @param {Object} [options] - Opciones del avatar
 * @param {string} [options.size='md'] - Tamaño: 'xs' (20px), 'sm' (28px), 'md' (36px), 'lg' (40px)
 * @param {string} [options.alt] - Texto alternativo para la imagen (por defecto usa el nombre)
 * @param {boolean} [options.showTooltip=false] - Si true, añade data-tooltip con el nombre (requiere initTooltip del componente tooltip)
 * @param {number} [options.tooltipDelay=1000] - Delay en ms antes de mostrar el tooltip (solo si showTooltip es true)
 * @param {string|null} [options.mode=null] - Modo activo: null (Colaborador, sin badge), 'admin' (badge "Admin"), 'lms' (badge "LMS")
 * @param {boolean} [options.selectable=false] - Si true, hover/selección con borde brand (opt-in)
 * @param {boolean} [options.selected=false] - Estado seleccionado (solo si selectable es true)
 * @returns {string} HTML del avatar, envuelto en .ubits-avatar-modo si hay mode activo
 */
function renderAvatar(persona, options) {
    const opts = options || {};
    const size = (opts.size && ['xs', 'sm', 'md', 'lg'].includes(opts.size)) ? opts.size : 'md';
    const sizeClass = `ubits-avatar--${size}`;
    const selectableClass = opts.selectable ? ' ubits-avatar--selectable' : '';
    const selectedClass = opts.selectable && opts.selected ? ' ubits-avatar--selected' : '';
    const tabIndexAttr = opts.selectable ? ' tabindex="0"' : '';
    const nombre = persona && (persona.nombre || persona.name);
    const avatarUrl = normalizeAvatarUrlForPage(persona && (persona.avatar || persona.providerLogo));

    const inner = avatarUrl
        ? `<img src="${escapeAttr(avatarUrl)}" alt="${escapeAttr(opts.alt != null ? opts.alt : (nombre || 'Avatar'))}" class="ubits-avatar__img">`
        : `<span class="ubits-avatar__fallback"><i class="far fa-user"></i></span>`;

    const tooltipAttrs = opts.showTooltip && nombre
        ? ` data-tooltip="${escapeAttr(nombre)}" data-tooltip-delay="${Number(opts.tooltipDelay) || 1000}"`
        : '';
    const avatarHtml = `<span class="ubits-avatar ${sizeClass}${selectableClass}${selectedClass}"${tooltipAttrs}${tabIndexAttr}>${inner}</span>`;

    // Variante Modo: badge de rol sobre el avatar (solo Admin y LMS Creator)
    const modeConfig = {
        admin: { icon: 'laptop', color: 'info' },
        lms:   { icon: 'bolt',   color: 'info' }
    };
    const mode = opts.mode && modeConfig[opts.mode] ? opts.mode : null;
    if (!mode) return avatarHtml;

    const cfg = modeConfig[mode];
    const badgeHtml = `<span class="ubits-avatar-modo__badge ubits-badge-tag ubits-badge-tag--outlined ubits-badge-tag--${cfg.color} ubits-badge-tag--xs ubits-badge-tag--with-icon ubits-badge-tag--icon-only"><i class="far fa-${cfg.icon}"></i></span>`;
    return `<span class="ubits-avatar-modo">${avatarHtml}${badgeHtml}</span>`;
}

/**
 * Genera el HTML de una profile list: varios avatares superpuestos, con +N si hay más de maxVisible.
 *
 * @param {Array<Object>} personas - Array de objetos { nombre/name, avatar }
 * @param {Object} [options] - Opciones
 * @param {string} [options.size='md'] - Tamaño: 'xs' (20px), 'sm' (28px), 'md' (36px), 'lg' (40px)
 * @param {number} [options.maxVisible=3] - Número de avatares visibles antes del chip +N
 * @param {boolean} [options.showTooltip=true] - Tooltip con nombre en cada avatar visible (requiere initTooltip o wireProfileLists)
 * @param {number} [options.tooltipDelay=300] - Delay en ms del tooltip
 * @param {boolean} [options.showOverflowPopover=true] - Popover al clic en +N con personas restantes (requiere initProfileLists una vez)
 * @param {boolean} [options.selectable=false] - Si true, avatares clickeables con hover/selección (opt-in)
 * @returns {string} HTML de la profile list
 */
function renderProfileList(personas, options) {
    const opts = options || {};
    const size = (opts.size && ['xs', 'sm', 'md', 'lg'].includes(opts.size)) ? opts.size : 'md';
    const maxVisible = typeof opts.maxVisible === 'number' && opts.maxVisible > 0 ? opts.maxVisible : 3;
    const selectable = opts.selectable === true;
    const showTooltip = opts.showTooltip !== false;
    const showOverflowPopover = opts.showOverflowPopover !== false;
    const tooltipDelay = Number(opts.tooltipDelay) || 300;
    const listModifier = selectable ? ' ubits-profile-list--selectable' : '';

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
        const avatarHtml = renderAvatar(persona, avatarOpts);
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
                if (persona && persona._key) entry._key = persona._key;
                if (persona && persona.id) entry.id = persona.id;
                return entry;
            });
            overflowPayload = escapeAttr(encodeURIComponent(JSON.stringify(overflowData)));
        } catch (e) { /* noop */ }
    }

    const countHtml = remainingCount > 0
        ? (showOverflowPopover && overflowPayload
            ? `<button type="button" class="ubits-profile-list__count ubits-profile-list__count-btn" style="z-index: 0; margin-right: 0;" data-profile-list-overflow="${overflowPayload}" data-profile-list-size="${size}" aria-label="Ver ${remainingCount} más"><span class="ubits-profile-list__count-text">+${remainingCount}</span></button>`
            : `<span class="ubits-profile-list__count" style="z-index: 0; margin-right: 0;"><span class="ubits-profile-list__count-text">+${remainingCount}</span></span>`)
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
            ? renderAvatar({ nombre: nombre, avatar: p.avatar }, { size: size })
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
    window.renderAvatar = renderAvatar;
    window.renderProfileList = renderProfileList;
    window.normalizeAvatarUrlForPage = normalizeAvatarUrlForPage;
    window.initProfileLists = initProfileLists;
    window.wireProfileLists = wireProfileLists;
    window.closeProfileListOverflowPopover = closeProfileListOverflowPopover;
}
