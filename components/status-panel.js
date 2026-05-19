/**
 * UBITS Status Panel — panel flotante de operaciones en curso (cargas, transferencias, generación).
 *
 * API:
 *   renderStatusPanelHtml(opts) — HTML del panel (montar en body o contenedor)
 *   initStatusPanel(rootId | element, opts?) — cablea minimizar, cerrar y clics en ítems
 *   statusPanelAddItem(root, itemId, opts)
 *   statusPanelUpdateItem(root, itemId, patch)
 *   statusPanelRemoveItem(root, itemId)
 *   statusPanelClear(root)
 *   statusPanelSetTitle(root, title)
 *   statusPanelRefresh(root)
 *
 * opts ítem: { title, subtitle?, status?: 'loading'|'success'|'error'|'neutral', icon?, onClick? }
 * status loading → spinner; success → check; error → marca error; neutral → solo icono
 */
(function (global) {
    'use strict';

    var PANEL_STATE = typeof WeakMap !== 'undefined' ? new WeakMap() : null;
    var PANEL_STATE_FALLBACK = {};

    var DEFAULT_SUBTITLE = {
        loading: 'En curso…',
        success: 'Completado',
        error: 'Error',
        neutral: ''
    };

    function esc(s) {
        if (s == null) return '';
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function resolveRoot(root) {
        if (!root) return null;
        if (typeof root === 'string') return document.getElementById(root);
        if (root.nodeType === 1) return root;
        return null;
    }

    function panelKey(el) {
        return el.id || '__ubits-status-panel-' + Math.random().toString(36).slice(2);
    }

    function getState(el) {
        if (PANEL_STATE) {
            if (!PANEL_STATE.has(el)) {
                PANEL_STATE.set(el, {
                    items: [],
                    minimized: false,
                    hidden: true,
                    title: 'Actividad',
                    autoTitle: false,
                    titleLoading: 'En curso',
                    titleDone: 'Completado'
                });
            }
            return PANEL_STATE.get(el);
        }
        var k = panelKey(el);
        if (!PANEL_STATE_FALLBACK[k]) {
            PANEL_STATE_FALLBACK[k] = {
                items: [],
                minimized: false,
                hidden: true,
                title: 'Actividad',
                autoTitle: false,
                titleLoading: 'En curso',
                titleDone: 'Completado'
            };
        }
        return PANEL_STATE_FALLBACK[k];
    }

    function statusMarkup(status) {
        if (status === 'loading') {
            return '<div class="ubits-status-panel__spinner" role="status" aria-label="En curso"></div>';
        }
        if (status === 'success') {
            return '<div class="ubits-status-panel__check" aria-hidden="true"><i class="far fa-check"></i></div>';
        }
        if (status === 'error') {
            return '<div class="ubits-status-panel__error-mark" aria-hidden="true"><i class="far fa-times"></i></div>';
        }
        return '';
    }

    function iconClassForItem(item) {
        if (item.icon) return 'far ' + esc(item.icon).replace(/^far\s+|^fas\s+/, '');
        if (item.status === 'success') return 'far fa-check-circle';
        if (item.status === 'error') return 'far fa-times-circle';
        if (item.status === 'loading') return 'far fa-spinner';
        return 'far fa-file';
    }

    function iconWrapModifierClass(item) {
        if (item.status === 'success') return ' ubits-status-panel__item-icon-wrap--success';
        if (item.status === 'error') return ' ubits-status-panel__item-icon-wrap--error';
        if (item.status === 'neutral') return ' ubits-status-panel__item-icon-wrap--neutral';
        return '';
    }

    function renderItemHtml(item) {
        var interactive = item.status === 'success' || item.status === 'neutral';
        if (item.onClick) interactive = true;
        var tag = interactive ? 'button' : 'div';
        var typeAttr = interactive ? ' type="button"' : '';
        var cls =
            'ubits-status-panel__item' +
            (interactive ? ' ubits-status-panel__item--interactive' : '');
        var sub =
            item.subtitle != null && String(item.subtitle) !== ''
                ? item.subtitle
                : DEFAULT_SUBTITLE[item.status] || '';
        return (
            '<' +
            tag +
            ' class="' +
            cls +
            '" data-status-panel-item-id="' +
            esc(item.id) +
            '"' +
            typeAttr +
            '>' +
            '<span class="ubits-status-panel__item-icon-wrap' +
            iconWrapModifierClass(item) +
            '" aria-hidden="true"><i class="' +
            iconClassForItem(item) +
            '"></i></span>' +
            '<div class="ubits-status-panel__item-content">' +
            '<span class="ubits-status-panel__item-title ubits-body-sm-regular">' +
            esc(item.title) +
            '</span>' +
            (sub
                ? '<span class="ubits-status-panel__item-subtitle ubits-body-xs-regular">' +
                  esc(sub) +
                  '</span>'
                : '') +
            '</div>' +
            '<div class="ubits-status-panel__item-status">' +
            statusMarkup(item.status) +
            '</div>' +
            '</' +
            tag +
            '>'
        );
    }

    /**
     * HTML del panel vacío listo para montar.
     * @param {Object} opts — id, title, placement, titleIcon, useIaTitleIcon, hidden, embedded
     */
    function renderStatusPanelHtml(opts) {
        opts = opts || {};
        var id = opts.id || 'ubits-status-panel';
        var title = opts.title != null ? String(opts.title) : 'Actividad';
        var placement = opts.placement === 'bottom-right' ? 'bottom-right' : 'bottom-left';
        var titleIcon = opts.titleIcon || 'fa-list-check';
        var iaWrapCls = opts.useIaTitleIcon ? ' ubits-status-panel__title-icon-wrap--ia' : '';
        var hiddenAttr = opts.hidden !== false ? ' hidden' : '';
        var placementCls =
            placement === 'bottom-right'
                ? ' ubits-status-panel--bottom-right'
                : ' ubits-status-panel--bottom-left';
        var embeddedCls = opts.embedded ? ' ubits-status-panel--embedded' : '';

        return (
            '<aside id="' +
            esc(id) +
            '" class="ubits-status-panel' +
            placementCls +
            embeddedCls +
            '"' +
            hiddenAttr +
            ' role="region" aria-label="' +
            esc(title) +
            '" aria-live="polite">' +
            '<div class="ubits-status-panel__header">' +
            '<p class="ubits-status-panel__title ubits-body-sm-semibold">' +
            '<span class="ubits-status-panel__title-icon-wrap' +
            iaWrapCls +
            '" aria-hidden="true"><i class="far ' +
            esc(titleIcon) +
            '"></i></span>' +
            '<span class="ubits-status-panel__title-text">' +
            esc(title) +
            '</span>' +
            '</p>' +
            '<div class="ubits-status-panel__actions">' +
            '<button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only" data-status-panel-action="minimize" aria-label="Minimizar">' +
            '<i class="far fa-chevron-down"></i>' +
            '</button>' +
            '<button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only" data-status-panel-action="close" aria-label="Cerrar">' +
            '<i class="far fa-times"></i>' +
            '</button>' +
            '</div>' +
            '</div>' +
            '<div class="ubits-status-panel__body"></div>' +
            '</aside>'
        );
    }

    function syncVisibility(el, state) {
        if (!el) return;
        var show = state.items.length > 0 && !state.hidden;
        if (show) {
            el.removeAttribute('hidden');
            el.classList.remove('ubits-status-panel--hidden');
        } else {
            el.setAttribute('hidden', 'hidden');
            el.classList.add('ubits-status-panel--hidden');
        }
        el.classList.toggle('ubits-status-panel--minimized', !!state.minimized);
    }

    function statusPanelRefresh(root) {
        var el = resolveRoot(root);
        if (!el) return;
        var state = getState(el);
        var body = el.querySelector('.ubits-status-panel__body');
        var titleEl = el.querySelector('.ubits-status-panel__title-text');
        if (titleEl) {
            if (state.autoTitle) {
                var loadingCount = state.items.filter(function (it) {
                    return it.status === 'loading';
                }).length;
                titleEl.textContent =
                    loadingCount > 0 ? state.titleLoading : state.titleDone;
            } else {
                titleEl.textContent = state.title;
            }
        }
        if (body) {
            body.innerHTML = state.items.map(renderItemHtml).join('');
        }
        syncVisibility(el, state);
        wireItemClicks(el, state);
    }

    function findItem(state, itemId) {
        for (var i = 0; i < state.items.length; i++) {
            if (state.items[i].id === itemId) return state.items[i];
        }
        return null;
    }

    function wireItemClicks(el, state) {
        var body = el.querySelector('.ubits-status-panel__body');
        if (!body || body._ubitsStatusPanelItemsWired) return;
        body._ubitsStatusPanelItemsWired = true;
        body.addEventListener('click', function (ev) {
            var btn = ev.target.closest('[data-status-panel-item-id]');
            if (!btn || !body.contains(btn)) return;
            var id = btn.getAttribute('data-status-panel-item-id');
            var item = findItem(state, id);
            if (!item || typeof item.onClick !== 'function') return;
            if (item.status !== 'success' && item.status !== 'neutral') return;
            item.onClick(item, ev);
        });
    }

    function initStatusPanel(root, opts) {
        var el = resolveRoot(root);
        if (!el) return;
        opts = opts || {};
        var state = getState(el);
        if (opts.title != null) state.title = String(opts.title);
        if (opts.autoTitle != null) state.autoTitle = !!opts.autoTitle;
        if (opts.titleLoading != null) state.titleLoading = String(opts.titleLoading);
        if (opts.titleDone != null) state.titleDone = String(opts.titleDone);
        if (opts.hidden === false) state.hidden = false;

        if (el._ubitsStatusPanelWired) {
            statusPanelRefresh(el);
            return el;
        }
        el._ubitsStatusPanelWired = true;

        el.addEventListener('click', function (ev) {
            var actionBtn = ev.target.closest('[data-status-panel-action]');
            if (!actionBtn || !el.contains(actionBtn)) return;
            var action = actionBtn.getAttribute('data-status-panel-action');
            if (action === 'minimize') {
                state.minimized = !state.minimized;
                var minIcon = actionBtn.querySelector('i');
                if (minIcon) {
                    minIcon.className = state.minimized ? 'far fa-chevron-up' : 'far fa-chevron-down';
                }
                actionBtn.setAttribute(
                    'aria-label',
                    state.minimized ? 'Expandir' : 'Minimizar'
                );
                syncVisibility(el, state);
                return;
            }
            if (action === 'close') {
                state.items = [];
                state.hidden = false;
                state.minimized = false;
                statusPanelRefresh(el);
            }
        });

        statusPanelRefresh(el);
        return el;
    }

    function statusPanelAddItem(root, itemId, opts) {
        var el = resolveRoot(root);
        if (!el) return;
        opts = opts || {};
        var state = getState(el);
        state.items = state.items.filter(function (it) {
            return it.id !== itemId;
        });
        state.items.push({
            id: itemId,
            title: opts.title != null ? String(opts.title) : '…',
            subtitle: opts.subtitle,
            status: opts.status || 'loading',
            icon: opts.icon,
            onClick: typeof opts.onClick === 'function' ? opts.onClick : null
        });
        state.hidden = false;
        state.minimized = false;
        statusPanelRefresh(el);
    }

    function statusPanelUpdateItem(root, itemId, patch) {
        var el = resolveRoot(root);
        if (!el) return;
        patch = patch || {};
        var state = getState(el);
        var item = findItem(state, itemId);
        if (!item) return;
        if (patch.title != null) item.title = String(patch.title);
        if (patch.subtitle !== undefined) item.subtitle = patch.subtitle;
        if (patch.status != null) item.status = patch.status;
        if (patch.icon !== undefined) item.icon = patch.icon;
        if (patch.onClick !== undefined) {
            item.onClick = typeof patch.onClick === 'function' ? patch.onClick : null;
        }
        statusPanelRefresh(el);
    }

    function statusPanelRemoveItem(root, itemId) {
        var el = resolveRoot(root);
        if (!el) return;
        var state = getState(el);
        state.items = state.items.filter(function (it) {
            return it.id !== itemId;
        });
        statusPanelRefresh(el);
    }

    function statusPanelClear(root) {
        var el = resolveRoot(root);
        if (!el) return;
        var state = getState(el);
        state.items = [];
        state.minimized = false;
        statusPanelRefresh(el);
    }

    function statusPanelSetTitle(root, title) {
        var el = resolveRoot(root);
        if (!el) return;
        getState(el).title = title != null ? String(title) : '';
        statusPanelRefresh(el);
    }

    global.renderStatusPanelHtml = renderStatusPanelHtml;
    global.initStatusPanel = initStatusPanel;
    global.statusPanelAddItem = statusPanelAddItem;
    global.statusPanelUpdateItem = statusPanelUpdateItem;
    global.statusPanelRemoveItem = statusPanelRemoveItem;
    global.statusPanelClear = statusPanelClear;
    global.statusPanelSetTitle = statusPanelSetTitle;
    global.statusPanelRefresh = statusPanelRefresh;
})(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : this);
