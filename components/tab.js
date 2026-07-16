/* ========================================
   UBITS TAB COMPONENT - DOCUMENTACIÓN
   ======================================== */

/**
 * UBITS TAB COMPONENT
 * 
 * IMPORTANTE: Las pestañas (`.ubits-tab`) se renderizan con HTML + CSS.
 * Los contenedores de grupo (`.ubits-tabs-on-bg`, `.ubits-tabs-row`) añaden scroll horizontal,
 * scroll-snap y degradados de borde vía `tab.js` (auto-init + `initUbitsTabsScroll`).
 * 
 * REQUISITOS OBLIGATORIOS:
 * 1. CSS: <link rel="stylesheet" href="components/tab.css">
 * 2. FontAwesome: <link rel="stylesheet" href="fontawesome-icons.css">
 * 3. UBITS Base: <link rel="stylesheet" href="ubits-colors.css">
 * 4. UBITS Typography: <link rel="stylesheet" href="ubits-typography.css">
 * 5. Grupos con scroll/degradados: <script src="components/tab.js"></script>
 * 
 * IMPLEMENTACIÓN BÁSICA:
 * ```html
 * <!-- Tab inactivo sin icono (por defecto) -->
 * <button class="ubits-tab">
 *   <span>Label</span>
 * </button>
 * 
 * <!-- Tab activo sin icono -->
 * <button class="ubits-tab ubits-tab--active">
 *   <span>Label</span>
 * </button>
 * 
 * <!-- Tab inactivo con icono y texto -->
 * <button class="ubits-tab">
 *   <i class="far fa-grid"></i>
 *   <span>Label</span>
 * </button>
 * 
 * <!-- Tab activo con icono y texto -->
 * <button class="ubits-tab ubits-tab--active">
 *   <i class="far fa-grid"></i>
 *   <span>Label</span>
 * </button>
 * 
 * <!-- Tab solo con icono (icon-only) -->
 * <button class="ubits-tab ubits-tab--icon-only">
 *   <i class="far fa-grid"></i>
 * </button>
 * 
 * <!-- Tab activo solo con icono -->
 * <button class="ubits-tab ubits-tab--icon-only ubits-tab--active">
 *   <i class="far fa-grid"></i>
 * </button>
 * ```
 * 
 * NOTA IMPORTANTE: Los iconos son OPCIONALES. Por defecto, los tabs no incluyen iconos.
 * 
 * TAMAÑOS DISPONIBLES:
 * - ubits-tab--xs (extra pequeño - 28px de alto)
 * - ubits-tab--sm (pequeño - 32px de alto)
 * - ubits-tab (mediano - 40px de alto) - DEFAULT
 * - ubits-tab--lg (grande - 48px de alto)
 * 
 * ESTADOS DISPONIBLES:
 * - Default (inactivo): fondo gris claro (bg-2), texto e icono gris medio
 * - Active: fondo blanco (bg-1), texto e icono oscuro, texto bold
 * - Hover: cambio sutil en el fondo
 * - Disabled: fondo gris deshabilitado, cursor not-allowed
 * 
 * VARIANTES DISPONIBLES:
 * - ubits-tab--icon-only (solo icono, sin texto)
 * 
 * EJEMPLOS DE USO:
 * 
 * ```html
 * <!-- Tab pequeño con icono y texto -->
 * <button class="ubits-tab ubits-tab--sm">
 *   <i class="far fa-home"></i>
 *   <span>Inicio</span>
 * </button>
 * 
 * <!-- Tab grande activo -->
 * <button class="ubits-tab ubits-tab--lg ubits-tab--active">
 *   <i class="far fa-user"></i>
 *   <span>Perfil</span>
 * </button>
 * 
 * <!-- Tab extra pequeño solo icono -->
 * <button class="ubits-tab ubits-tab--xs ubits-tab--icon-only">
 *   <i class="far fa-gear"></i>
 * </button>
 * 
 * <!-- Tab con badge -->
 * <button class="ubits-tab ubits-tab--active">
 *   <i class="far fa-bell"></i>
 *   <span>Notificaciones</span>
 *   <span class="ubits-tab__badge"></span>
 * </button>
 * 
 * <!-- Grupo de tabs navegables sobre fondo bg-2 (por defecto) -->
 * <div style="display: flex; gap: 4px;">
 *   <button class="ubits-tab ubits-tab--active" onclick="setActiveTab(this)">
 *     <i class="far fa-home"></i>
 *     <span>Inicio</span>
 *   </button>
 *   <button class="ubits-tab" onclick="setActiveTab(this)">
 *     <i class="far fa-book"></i>
 *     <span>Cursos</span>
 *   </button>
 *   <button class="ubits-tab" onclick="setActiveTab(this)">
 *     <i class="far fa-chart-line"></i>
 *     <span>Métricas</span>
 *   </button>
 * </div>
 * 
 * <!-- Grupo de tabs sobre fondo blanco (dentro de secciones) -->
 * <div style="background: var(--ubits-bg-2); padding: var(--padding-xs); border-radius: var(--border-radius-full); display: inline-flex; gap: var(--gap-xs);">
 *   <button class="ubits-tab ubits-tab--active" onclick="setActiveTab(this)">
 *     <i class="far fa-home"></i>
 *     <span>Inicio</span>
 *   </button>
 *   <button class="ubits-tab" onclick="setActiveTab(this)">
 *     <i class="far fa-book"></i>
 *     <span>Cursos</span>
 *   </button>
 *   <button class="ubits-tab" onclick="setActiveTab(this)">
 *     <i class="far fa-chart-line"></i>
 *     <span>Métricas</span>
 *   </button>
 * </div>
 * ```
 * 
 * NOTAS IMPORTANTES:
 * - El componente tab usa los mismos altos que el componente button
 * - Los iconos son OPCIONALES - por defecto los tabs no tienen iconos
 * - Los iconos deben usar FontAwesome (preferiblemente outline: `far`) cuando se usen
 * - El texto usa tipografía UBITS (Inter)
 * - El estado activo cambia el font-weight a 700 (bold)
 * - Todos los colores usan tokens UBITS (var(--ubits-*))
 * - Para tabs sin icono, simplemente omite el elemento <i>
 * 
 * GRUPOS DE TABS:
 * - Por defecto, los tabs se usan sobre fondo bg-2 (layout normal)
 * - Cuando los tabs están dentro de secciones con fondo bg-1 (blanco), deben tener un contenedor
 *   con fondo bg-2 y padding de 4px para mantener el contraste visual
 * - Gap entre tabs: 4px
 * - El primer tab del grupo suele estar activo por defecto
 */

/**
 * Scroll horizontal en `.ubits-tabs-scroll-strip` (hijo inyectado); degradados en el
 * shell `.ubits-tabs-on-bg` / `.ubits-tabs-row` (fijos al borde visible). Auto-init +
 * MutationObserver; opcional: `initUbitsTabsScroll(modalRoot)`.
 */
(function (global) {
    'use strict';

    var GROUP_SELECTOR = '.ubits-tabs-on-bg, .ubits-tabs-row';
    var EDGE_EPS = 4;
    var MO_DEBOUNCE_MS = 60;
    var moTimer = null;

    function getScrollStrip(shell) {
        return shell && shell.querySelector ? shell.querySelector(':scope > .ubits-tabs-scroll-strip') : null;
    }

    /**
     * El scroll vive en .ubits-tabs-scroll-strip; el degradado en el shell (no se mueve con el scroll).
     */
    function ensureScrollStrip(shell) {
        if (!shell || shell.nodeType !== 1) return;
        if (getScrollStrip(shell)) return;
        var tabs = Array.prototype.filter.call(shell.children || [], function (n) {
            return n.nodeType === 1 && n.classList && n.classList.contains('ubits-tab');
        });
        if (!tabs.length) return;
        var strip = document.createElement('div');
        strip.className = 'ubits-tabs-scroll-strip';
        var role = shell.getAttribute('role');
        if (role) {
            strip.setAttribute('role', role);
            shell.removeAttribute('role');
        }
        tabs.forEach(function (t) {
            strip.appendChild(t);
        });
        shell.appendChild(strip);
    }

    function updateScrollFades(shell) {
        var scrollEl = getScrollStrip(shell) || shell;
        var sw = scrollEl.scrollWidth;
        var cw = scrollEl.clientWidth;
        var overflow = sw > cw + 1;
        shell.classList.toggle('ubits-tabs-scroll--overflow', overflow);
        if (!overflow) {
            shell.classList.remove('ubits-tabs-scroll--left-fade');
            shell.classList.remove('ubits-tabs-scroll--right-fade');
            return;
        }
        var sl = scrollEl.scrollLeft;
        var atStart = sl <= EDGE_EPS;
        var atEnd = sl + cw >= sw - EDGE_EPS;
        shell.classList.toggle('ubits-tabs-scroll--left-fade', !atStart);
        shell.classList.toggle('ubits-tabs-scroll--right-fade', !atEnd);
    }

    var SCROLLBAR_HIDE_MS = 900;

    function wireGroup(shell) {
        if (!shell || shell.nodeType !== 1) return;
        if (shell._ubitsTabsScrollCleanup) {
            shell._ubitsTabsScrollCleanup();
            shell._ubitsTabsScrollCleanup = null;
        }
        ensureScrollStrip(shell);
        var scrollEl = getScrollStrip(shell) || shell;
        var hideTimer = null;
        var onResize = function () {
            updateScrollFades(shell);
        };
        var onScroll = function () {
            updateScrollFades(shell);
            scrollEl.classList.add('ubits-tabs-scroll--active');
            if (scrollEl === shell) {
                shell.classList.add('ubits-tabs-scroll--active');
            }
            if (hideTimer) clearTimeout(hideTimer);
            hideTimer = setTimeout(function () {
                scrollEl.classList.remove('ubits-tabs-scroll--active');
                shell.classList.remove('ubits-tabs-scroll--active');
                hideTimer = null;
            }, SCROLLBAR_HIDE_MS);
        };
        scrollEl.addEventListener('scroll', onScroll, { passive: true });
        global.addEventListener('resize', onResize, { passive: true });
        var ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(onResize) : null;
        if (ro) ro.observe(scrollEl);
        updateScrollFades(shell);
        shell._ubitsTabsScrollCleanup = function () {
            scrollEl.removeEventListener('scroll', onScroll);
            global.removeEventListener('resize', onResize);
            if (ro) ro.disconnect();
            if (hideTimer) clearTimeout(hideTimer);
            scrollEl.classList.remove('ubits-tabs-scroll--active');
            shell.classList.remove(
                'ubits-tabs-scroll--overflow',
                'ubits-tabs-scroll--left-fade',
                'ubits-tabs-scroll--right-fade',
                'ubits-tabs-scroll--active'
            );
            shell._ubitsTabsScrollCleanup = null;
        };
    }

    function collectGroupRoots(root) {
        var out = [];
        var seen = Object.create(null);
        function push(el) {
            if (!el || seen[el]) return;
            seen[el] = true;
            out.push(el);
        }
        if (!root || root === document || root === document.documentElement) {
            Array.prototype.forEach.call(document.querySelectorAll(GROUP_SELECTOR), push);
            return out;
        }
        if (root.nodeType === 1) {
            if (root.matches && root.matches(GROUP_SELECTOR)) push(root);
            Array.prototype.forEach.call(root.querySelectorAll(GROUP_SELECTOR), push);
        }
        return out;
    }

    function initUbitsTabsScroll(root) {
        collectGroupRoots(root || document).forEach(wireGroup);
    }

    function scheduleInitFromMutations() {
        if (moTimer) clearTimeout(moTimer);
        moTimer = setTimeout(function () {
            moTimer = null;
            initUbitsTabsScroll(document.documentElement);
        }, MO_DEBOUNCE_MS);
    }

    function mutationMayAddGroups(mutations) {
        for (var i = 0; i < mutations.length; i++) {
            var m = mutations[i];
            if (!m.addedNodes || !m.addedNodes.length) continue;
            for (var j = 0; j < m.addedNodes.length; j++) {
                var n = m.addedNodes[j];
                if (n.nodeType !== 1) continue;
                if (n.matches && n.matches(GROUP_SELECTOR)) return true;
                if (n.querySelector && n.querySelector(GROUP_SELECTOR)) return true;
            }
        }
        return false;
    }

    global.initUbitsTabsScroll = initUbitsTabsScroll;

    function boot() {
        initUbitsTabsScroll(document.documentElement);
        if (typeof MutationObserver === 'undefined' || !document.body) return;
        var mo = new MutationObserver(function (mutations) {
            if (mutationMayAddGroups(mutations)) scheduleInitFromMutations();
        });
        mo.observe(document.body, { childList: true, subtree: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})(typeof window !== 'undefined' ? window : this);
