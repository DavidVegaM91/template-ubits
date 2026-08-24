/* ========================================
   Badge Tag — createUbitsBadgeTag + gasto de tokens IA
   API alineada a Ubits-React Badge (avatar / imagen / removable / href / radius / soft / invert).
   spendUbitsBadgeTokens(el, nextValue, { sound })
   Oficial: silencio. Opción B: { sound: 'cascade' } (Cascada pin-pin).
   ======================================== */
(function (global) {
    'use strict';

    var SQUASH_MS = 850;
    var NAV_DELAY_MS = 1000;
    var spendAudioCtx = null;

    var AVATAR_SIZE = { xs: 'xs', sm: 'xs', md: 'sm', lg: 'sm', xl: 'sm' };

    function escapeHtml(str) {
        if (str == null) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function escapeAttr(str) {
        return escapeHtml(str);
    }

    function resolveVariant(variant) {
        if (variant === 'subtle') return 'outlined';
        if (variant === 'bold') return 'filled';
        if (variant === 'outlined' || variant === 'filled' || variant === 'soft' || variant === 'invert') {
            return variant;
        }
        return 'outlined';
    }

    function formatTokens(n) {
        if (typeof global.formatIaTokensBadgeNumber === 'function') {
            return global.formatIaTokensBadgeNumber(n);
        }
        if (typeof global.formatCounterNumber === 'function') {
            return global.formatCounterNumber(n);
        }
        return Number(n).toLocaleString('en-US');
    }

    function ariaTokens(n) {
        if (typeof global.formatIaTokensBadgeAriaLabel === 'function') {
            return global.formatIaTokensBadgeAriaLabel(n);
        }
        return formatTokens(n) + ' tokens restantes';
    }

    /**
     * Genera HTML del Badge Tag (paridad con UbitsBadge React).
     * @param {Object} [opts]
     * @param {string} [opts.color='success']
     * @param {string} [opts.variant='outlined'] outlined|filled|soft|invert (subtle→outlined, bold→filled)
     * @param {string} [opts.size='sm'] xs|sm|md|lg|xl
     * @param {string} [opts.radius='full'] full|md
     * @param {boolean} [opts.dot]
     * @param {string} [opts.icon] clase FA, ej. "far fa-check-circle"
     * @param {boolean} [opts.iconOnly]
     * @param {boolean} [opts.textOnly]
     * @param {string} [opts.avatarSrc]
     * @param {string} [opts.avatarAlt]
     * @param {string} [opts.imageSrc]
     * @param {string} [opts.imageAlt]
     * @param {string} [opts.href]
     * @param {string} [opts.target]
     * @param {string} [opts.rel]
     * @param {boolean} [opts.removable]
     * @param {number} [opts.tokenCost]
     * @param {string} [opts.text] / opts.children — texto visible
     * @param {string} [opts.className]
     * @param {string} [opts.ariaLabel]
     * @returns {string}
     */
    function createUbitsBadgeTag(opts) {
        opts = opts || {};
        var color = opts.color || 'success';
        var styleVariant = resolveVariant(opts.variant || 'outlined');
        var size = opts.size || 'sm';
        var radius = opts.radius === 'md' ? 'md' : 'full';
        var icon = opts.icon || '';
        var iconOnly = !!opts.iconOnly;
        var textOnly = !!opts.textOnly;
        var avatarSrc = opts.avatarSrc || '';
        var avatarAlt = opts.avatarAlt || '';
        var imageSrc = opts.imageSrc || '';
        var imageAlt = opts.imageAlt || '';
        var href = opts.href || '';
        var removable = !!opts.removable;
        var tokenCost = opts.tokenCost;
        var text = opts.text != null ? opts.text : (opts.children != null ? opts.children : '');
        var className = opts.className || '';
        var ariaLabel = opts.ariaLabel;

        var hasAvatar = !!avatarSrc;
        var hasImage = !!imageSrc && !hasAvatar;
        var showTokenCost =
            typeof tokenCost === 'number' &&
            color === 'ia' &&
            !iconOnly &&
            !textOnly &&
            !hasAvatar &&
            !hasImage;

        var showIndicator =
            !icon &&
            !textOnly &&
            !showTokenCost &&
            !hasAvatar &&
            !hasImage &&
            !iconOnly &&
            opts.dot !== false;

        var classes = [
            'ubits-badge-tag',
            'ubits-badge-tag--' + styleVariant,
            'ubits-badge-tag--' + color,
            'ubits-badge-tag--' + size,
            radius === 'md' ? 'ubits-badge-tag--radius-md' : 'ubits-badge-tag--radius-full',
        ];
        if (icon || hasAvatar || hasImage) classes.push('ubits-badge-tag--with-icon');
        if (iconOnly) classes.push('ubits-badge-tag--icon-only');
        if (textOnly) classes.push('ubits-badge-tag--text-only');
        if (hasAvatar) classes.push('ubits-badge-tag--with-avatar');
        if (hasImage) classes.push('ubits-badge-tag--with-image');
        if (removable) classes.push('ubits-badge-tag--removable');
        if (href) classes.push('ubits-badge-tag--link');
        if (className) classes.push(className);

        var inner = '';

        if (showTokenCost) {
            inner +=
                '<span class="ubits-badge-tag__token-cost" aria-hidden="true">' +
                '<i class="far fa-coin-vertical"></i>' +
                '<span class="ubits-badge-tag__token-number">' +
                escapeHtml(formatTokens(tokenCost)) +
                '</span></span>';
        }

        if (hasAvatar && !textOnly && !showTokenCost) {
            var avatarSize = AVATAR_SIZE[size] || 'xs';
            if (typeof global.renderAvatar === 'function') {
                inner += global.renderAvatar(
                    { nombre: avatarAlt || 'Avatar', avatar: avatarSrc },
                    { size: avatarSize, alt: avatarAlt || 'Avatar' }
                );
            } else {
                inner +=
                    '<span class="ubits-avatar ubits-avatar--' +
                    avatarSize +
                    '"><img class="ubits-avatar__img" src="' +
                    escapeAttr(avatarSrc) +
                    '" alt="' +
                    escapeAttr(avatarAlt || '') +
                    '"></span>';
            }
        }

        if (hasImage && !textOnly && !showTokenCost) {
            inner +=
                '<img class="ubits-badge-tag__image" src="' +
                escapeAttr(imageSrc) +
                '" alt="' +
                escapeAttr(imageAlt || '') +
                '">';
        }

        if (showIndicator && !iconOnly) {
            inner += '<span class="ubits-badge-tag__indicator" aria-hidden="true"></span>';
        }

        if (icon && !textOnly && !showTokenCost && !hasAvatar && !hasImage) {
            inner += '<i class="' + escapeAttr(icon) + '" aria-hidden="true"></i>';
        }

        if (text && !showTokenCost) {
            inner += '<span class="ubits-badge-tag__text">' + escapeHtml(text) + '</span>';
        }

        if (removable) {
            inner +=
                '<button type="button" class="ubits-button ubits-button--tertiary ubits-button--xs ubits-button--icon-only ubits-badge-tag__close" aria-label="Quitar" data-tooltip="Quitar" data-badge-remove="true">' +
                '<i class="far fa-times" aria-hidden="true"></i>' +
                '</button>';
        }

        var ariaAttr = '';
        if (ariaLabel) {
            ariaAttr = ' aria-label="' + escapeAttr(ariaLabel) + '"';
        } else if (showTokenCost) {
            ariaAttr = ' aria-label="' + escapeAttr(ariaTokens(tokenCost)) + '"';
        }

        var dataToken = showTokenCost ? ' data-token-value="' + escapeAttr(String(tokenCost)) + '"' : '';

        var tag;
        if (href) {
            var target = opts.target ? ' target="' + escapeAttr(opts.target) + '"' : '';
            var rel =
                opts.rel != null
                    ? ' rel="' + escapeAttr(opts.rel) + '"'
                    : opts.target === '_blank'
                      ? ' rel="noopener noreferrer"'
                      : '';
            tag =
                '<a class="' +
                classes.join(' ') +
                '" href="' +
                escapeAttr(href) +
                '"' +
                target +
                rel +
                ariaAttr +
                dataToken +
                '>' +
                inner +
                '</a>';
        } else {
            tag =
                '<span class="' +
                classes.join(' ') +
                '"' +
                ariaAttr +
                dataToken +
                '>' +
                inner +
                '</span>';
        }

        if (!showTokenCost) return tag;
        return '<span class="ubits-badge-tag-host">' + tag + '</span>';
    }

    /**
     * Monta el badge en un contenedor y enlaza onRemove si aplica.
     * @param {HTMLElement|string} container
     * @param {Object} opts — mismas opciones que createUbitsBadgeTag + onRemove
     * @returns {HTMLElement|null}
     */
    function mountUbitsBadgeTag(container, opts) {
        opts = opts || {};
        var el =
            typeof container === 'string' ? document.getElementById(container) : container;
        if (!el) return null;
        el.innerHTML = createUbitsBadgeTag(opts);
        var closeBtn = el.querySelector('[data-badge-remove]');
        if (closeBtn && typeof opts.onRemove === 'function') {
            closeBtn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                opts.onRemove();
            });
        }
        return el.querySelector('.ubits-badge-tag');
    }

    function getAudioCtx() {
        try {
            var Ctor = global.AudioContext || global.webkitAudioContext;
            if (!Ctor) return null;
            if (!spendAudioCtx) spendAudioCtx = new Ctor();
            if (spendAudioCtx.state === 'suspended') spendAudioCtx.resume();
            return spendAudioCtx;
        } catch (e) {
            return null;
        }
    }

    function playCascade() {
        var ac = getAudioCtx();
        if (!ac) return;
        var t = ac.currentTime + 0.01;
        function tone(freq, start, dur, gain) {
            var o = ac.createOscillator();
            var g = ac.createGain();
            o.type = 'sine';
            o.frequency.setValueAtTime(freq, start);
            g.gain.setValueAtTime(0.0001, start);
            g.gain.exponentialRampToValueAtTime(gain, start + 0.003);
            g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
            o.connect(g);
            g.connect(ac.destination);
            o.start(start);
            o.stop(start + dur + 0.02);
        }
        function ping(off) {
            tone(1175, t + off, 0.07, 0.032);
            tone(1568, t + off + 0.018, 0.08, 0.03);
        }
        ping(0);
        ping(0.11);
    }

    function readValue(el) {
        var raw = el.getAttribute('data-token-value');
        if (raw != null && raw !== '') {
            var parsed = parseInt(raw, 10);
            if (!isNaN(parsed)) return parsed;
        }
        var numEl = el.querySelector('.ubits-badge-tag__token-number');
        if (!numEl) return 0;
        var text = String(numEl.textContent || '').replace(/[^\d]/g, '');
        var n = parseInt(text, 10);
        return isNaN(n) ? 0 : n;
    }

    function paintValue(el, n) {
        var numEl = el.querySelector('.ubits-badge-tag__token-number');
        if (numEl) numEl.textContent = formatTokens(n);
        el.setAttribute('data-token-value', String(n));
        el.setAttribute('aria-label', ariaTokens(n));
    }

    function ensureHost(badge) {
        var parent = badge.parentElement;
        if (parent && parent.classList.contains('ubits-badge-tag-host')) return parent;
        var host = document.createElement('span');
        host.className = 'ubits-badge-tag-host';
        if (badge.parentNode) {
            badge.parentNode.insertBefore(host, badge);
            host.appendChild(badge);
        }
        return host;
    }

    function spendUbitsBadgeTokens(el, nextValue, opts) {
        if (!el) return;
        var next = parseInt(nextValue, 10);
        if (isNaN(next) || next < 0) next = 0;
        var prev = readValue(el);
        opts = opts || {};

        if (el._ubitsSpendTimer) {
            global.clearInterval(el._ubitsSpendTimer);
            el._ubitsSpendTimer = 0;
        }
        if (el._ubitsSpendSquash) {
            global.clearTimeout(el._ubitsSpendSquash);
            el._ubitsSpendSquash = 0;
        }

        if (next >= prev) {
            paintValue(el, next);
            return;
        }

        var amt = prev - next;
        var host = ensureHost(el);
        var minus = host.querySelector('.ubits-badge-tag__spend-minus');
        if (!minus) {
            minus = document.createElement('span');
            minus.className = 'ubits-badge-tag__spend-minus';
            minus.setAttribute('aria-hidden', 'true');
            host.insertBefore(minus, el);
        }
        minus.textContent = '−' + formatTokens(amt);

        el.classList.add('is-spending');
        host.classList.add('is-spending');
        if (opts.sound === 'cascade') playCascade();

        var current = prev;
        var stepMs = amt <= 20 ? Math.max(45, Math.min(140, 320 / amt)) : Math.max(32, Math.min(80, 700 / amt));
        var step = amt <= 20 ? 1 : Math.max(1, Math.ceil(amt / 18));
        el._ubitsSpendTimer = global.setInterval(function () {
            current -= step;
            if (current <= next) {
                paintValue(el, next);
                global.clearInterval(el._ubitsSpendTimer);
                el._ubitsSpendTimer = 0;
            } else {
                paintValue(el, current);
            }
        }, stepMs);

        el._ubitsSpendSquash = global.setTimeout(function () {
            el.classList.remove('is-spending');
            host.classList.remove('is-spending');
            el._ubitsSpendSquash = 0;
        }, SQUASH_MS);
    }

    function ubitsBadgeSpendAnimationMs(amount) {
        var amt = Math.max(0, Math.floor(amount));
        if (amt <= 0) return 0;
        var stepMs = amt <= 20 ? Math.max(45, Math.min(140, 320 / amt)) : Math.max(32, Math.min(80, 700 / amt));
        var step = amt <= 20 ? 1 : Math.max(1, Math.ceil(amt / 18));
        var steps = Math.ceil(amt / step);
        return Math.max(steps * stepMs, SQUASH_MS);
    }

    function ubitsBadgeSpendThenNavigateMs(amount) {
        return ubitsBadgeSpendAnimationMs(amount) + NAV_DELAY_MS;
    }

    global.createUbitsBadgeTag = createUbitsBadgeTag;
    global.mountUbitsBadgeTag = mountUbitsBadgeTag;
    global.spendUbitsBadgeTokens = spendUbitsBadgeTokens;
    global.playUbitsBadgeCascadeSound = playCascade;
    global.ubitsBadgeSpendAnimationMs = ubitsBadgeSpendAnimationMs;
    global.ubitsBadgeSpendThenNavigateMs = ubitsBadgeSpendThenNavigateMs;
})(typeof window !== 'undefined' ? window : this);
