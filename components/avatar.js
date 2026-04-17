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
 * @returns {string} HTML del avatar, envuelto en .ubits-avatar-modo si hay mode activo
 */
function renderAvatar(persona, options) {
    const opts = options || {};
    const size = (opts.size && ['xs', 'sm', 'md', 'lg'].includes(opts.size)) ? opts.size : 'md';
    const sizeClass = `ubits-avatar--${size}`;
    const nombre = persona && (persona.nombre || persona.name);
    const avatarUrl = persona && (persona.avatar || persona.providerLogo);

    const inner = avatarUrl
        ? `<img src="${escapeAttr(avatarUrl)}" alt="${escapeAttr(opts.alt != null ? opts.alt : (nombre || 'Avatar'))}" class="ubits-avatar__img">`
        : `<span class="ubits-avatar__fallback"><i class="far fa-user"></i></span>`;

    const tooltipAttrs = opts.showTooltip && nombre
        ? ` data-tooltip="${escapeAttr(nombre)}" data-tooltip-delay="${Number(opts.tooltipDelay) || 1000}"`
        : '';
    const avatarHtml = `<span class="ubits-avatar ${sizeClass}"${tooltipAttrs}>${inner}</span>`;

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
 * @param {boolean} [options.showTooltip=false] - Si true, cada avatar muestra tooltip con el nombre (requiere initTooltip)
 * @param {number} [options.tooltipDelay=1000] - Delay en ms antes de mostrar el tooltip (solo si showTooltip es true)
 * @returns {string} HTML de la profile list
 */
function renderProfileList(personas, options) {
    const opts = options || {};
    const size = (opts.size && ['xs', 'sm', 'md', 'lg'].includes(opts.size)) ? opts.size : 'md';
    const maxVisible = typeof opts.maxVisible === 'number' && opts.maxVisible > 0 ? opts.maxVisible : 3;

    const list = Array.isArray(personas) ? personas : [];
    if (list.length === 0) {
        return `<div class="ubits-profile-list ubits-profile-list--${size}"></div>`;
    }

    const visibleCount = Math.min(list.length, maxVisible);
    const remainingCount = list.length > maxVisible ? list.length - maxVisible : 0;
    const avatarOpts = { size: size };

    const items = list.slice(0, visibleCount).map(function (persona, index) {
        const zIndex = visibleCount - index;
        const marginRight = (index < visibleCount - 1) || remainingCount > 0 ? '-5px' : '0';
        const avatarHtml = renderAvatar(persona, avatarOpts);
        const nombre = persona && (persona.nombre || persona.name);
        const tooltipAttrs = opts.showTooltip && nombre
            ? ` data-tooltip="${escapeAttr(nombre)}" data-tooltip-delay="${Number(opts.tooltipDelay) || 1000}"`
            : '';
        return `<span class="ubits-profile-list__avatar" style="z-index: ${zIndex}; margin-right: ${marginRight};"${tooltipAttrs}>${avatarHtml}</span>`;
    }).join('');

    const countHtml = remainingCount > 0
        ? `<span class="ubits-profile-list__count" style="z-index: 0; margin-right: 0;"><span class="ubits-profile-list__count-text">+${remainingCount}</span></span>`
        : '';

    return `<div class="ubits-profile-list ubits-profile-list--${size}">${items}${countHtml}</div>`;
}

// Exponer globalmente para uso en páginas HTML
if (typeof window !== 'undefined') {
    window.renderAvatar = renderAvatar;
    window.renderProfileList = renderProfileList;
}
