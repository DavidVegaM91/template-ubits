/**
 * UBITS Coachmark — product tour: overlay + spotlight + openPopover por paso.
 * Depende de: popover.js (openPopover, closePopover, updatePopoverPosition), button.css.
 *
 * Uso:
 *   UBITS_COACHMARK.start({
 *     steps: [
 *       { target: '#btn', title: 'Paso 1', body: 'Texto…', placement: 'bottom', align: 'center' },
 *       { target: null, title: 'Sin ancla', body: 'Popover centrado; solo scrim, sin spotlight.' }
 *     ],
 *     popoverId: 'mi-tour-popover',
 *     startIndex: 0, // opcional: índice 0-based del primer paso (tours multi-página)
 *     onBeforeNext: function (index, step) { return true; }, // false = no avanzar (p. ej. location.href)
 *     onBeforePrev: function (index, step) { return true; }, // false = no retroceder
 *     onComplete: function () {},
 *     onDismiss: function (reason) {}, // 'close' | 'escape' | 'missing-target' | 'dismiss' (no se llama con 'restart')
 *     onStepChange: function (index, step) {},
 *     showProgress: true,
 *     padding: 8,
 *     zIndexLayer: 10050,
 *     zIndexPopover: 10060
 *   });
 *   UBITS_COACHMARK.close('dismiss');
 */

(function () {
    'use strict';

    var DEFAULT_POPOVER_ID = 'ubits-coachmark-popover';
    var active = null;

    function blockDocumentClicks(e) {
        if (!active) return;
        var pop = document.getElementById(active.popoverId);
        if (pop && pop.contains(e.target)) return;
        e.preventDefault();
        e.stopPropagation();
    }

    function onKeydown(e) {
        if (!active) return;
        if (e.key === 'Escape') {
            e.preventDefault();
            closeCoachmark('escape');
        }
    }

    function onResizeScroll() {
        if (!active) return;
        clearTimeout(active._layoutTimer);
        active._layoutTimer = setTimeout(function () {
            layoutActive();
        }, 60);
    }

    function layoutActive() {
        if (!active) return;
        var step = active.steps[active.index];
        var anchor = resolveStepTarget(step);
        var pad = typeof active.padding === 'number' ? active.padding : 8;

        if (anchor && active.spotlightEl && shouldShowSpotlight(step)) {
            try {
                anchor.scrollIntoView({ block: 'nearest', behavior: 'instant' });
            } catch (err) { /* ignore */ }
            var rect = anchor.getBoundingClientRect();
            var top = Math.max(0, rect.top - pad);
            var left = Math.max(0, rect.left - pad);
            var w = Math.min(window.innerWidth - left, rect.width + pad * 2);
            var h = Math.min(window.innerHeight - top, rect.height + pad * 2);
            active.spotlightEl.style.top = top + 'px';
            active.spotlightEl.style.left = left + 'px';
            active.spotlightEl.style.width = w + 'px';
            active.spotlightEl.style.height = h + 'px';
        }

        if (typeof window.updatePopoverPosition === 'function') {
            window.updatePopoverPosition(active.popoverId);
        }
    }

    function shouldShowSpotlight(step) {
        if (step.showSpotlight === false) return false;
        return step.target != null;
    }

    function resolveStepTarget(step) {
        if (step == null || step.target == null) return null;
        var t = step.target;
        if (typeof t === 'string') return document.querySelector(t);
        if (typeof t === 'function') {
            try {
                return t();
            } catch (err) {
                return null;
            }
        }
        if (t && t.nodeType === 1) return t;
        return null;
    }

    function ensureRoot() {
        if (active && active.rootEl) return;
        var root = document.createElement('div');
        root.id = 'ubits-coachmark-root';
        root.className = 'ubits-coachmark';
        root.setAttribute('role', 'presentation');
        root.style.zIndex = String((active && active.zIndexLayer) || 10050);

        var scrim = document.createElement('div');
        scrim.className = 'ubits-coachmark__scrim';
        scrim.setAttribute('aria-hidden', 'true');

        var spotlight = document.createElement('div');
        spotlight.className = 'ubits-coachmark__spotlight';
        spotlight.setAttribute('aria-hidden', 'true');

        root.appendChild(scrim);
        root.appendChild(spotlight);
        document.body.appendChild(root);

        active.rootEl = root;
        active.scrimEl = scrim;
        active.spotlightEl = spotlight;
    }

    /**
     * @param {Object|null} state copia de `active` antes de ponerlo a null
     */
    function removeRoot(state) {
        document.removeEventListener('keydown', onKeydown, true);
        window.removeEventListener('resize', onResizeScroll);
        window.removeEventListener('scroll', onResizeScroll, true);
        if (state && state.clickBlocker) {
            document.removeEventListener('click', state.clickBlocker, true);
        }
        document.body.classList.remove('ubits-coachmark-active');
        if (state && state.rootEl && state.rootEl.parentNode) {
            state.rootEl.parentNode.removeChild(state.rootEl);
        }
    }

    function buildActionsParts(index, total) {
        var isFirst = index === 0;
        var isLast = index === total - 1;
        var start = '';
        if (!isLast) {
            start =
                '<button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm" id="ubits-coachmark-btn-dismiss"><span>Cerrar</span></button>';
        }
        var end = '';
        if (!isFirst) {
            end +=
                '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm" id="ubits-coachmark-btn-prev"><span>Anterior</span></button>';
        }
        if (!isLast) {
            end +=
                '<button type="button" class="ubits-button ubits-button--primary ubits-button--sm" id="ubits-coachmark-btn-next"><span>Siguiente</span></button>';
        } else {
            end +=
                '<button type="button" class="ubits-button ubits-button--primary ubits-button--sm" id="ubits-coachmark-btn-finish"><span>Finalizar</span></button>';
        }
        return { start: start, end: end };
    }

    function buildBodyHtml(step, index, total, showProgress) {
        var parts = [];
        if (showProgress && total > 1) {
            parts.push(
                '<p class="ubits-body-sm-regular ubits-popover__text" style="margin-bottom:var(--gap-sm);opacity:0.85;">Paso ' +
                    (index + 1) +
                    ' de ' +
                    total +
                    '</p>'
            );
        }
        if (step.bodyHtml) {
            parts.push(step.bodyHtml);
        } else {
            parts.push(
                '<p class="ubits-body-sm-regular ubits-popover__text">' +
                    escapeHtml(step.body != null ? String(step.body) : '') +
                    '</p>'
            );
        }
        return parts.join('');
    }

    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function wirePopoverButtons() {
        if (!active) return;
        var pop = document.getElementById(active.popoverId);
        if (!pop) return;
        var d = pop.querySelector('#ubits-coachmark-btn-dismiss');
        var p = pop.querySelector('#ubits-coachmark-btn-prev');
        var n = pop.querySelector('#ubits-coachmark-btn-next');
        var f = pop.querySelector('#ubits-coachmark-btn-finish');
        if (d) d.addEventListener('click', function () { closeCoachmark('close'); });
        if (p) p.addEventListener('click', function () { goPrev(); });
        if (n) n.addEventListener('click', function () { goNext(); });
        if (f) f.addEventListener('click', function () { closeCoachmark('end'); });
    }

    function goNext() {
        if (!active) return;
        if (active.index >= active.steps.length - 1) return;
        var step = active.steps[active.index];
        if (typeof active.onBeforeNext === 'function') {
            try {
                if (active.onBeforeNext(active.index, step) === false) return;
            } catch (err) { /* ignore */ }
        }
        showStepAt(active.index + 1);
    }

    function goPrev() {
        if (!active) return;
        if (active.index <= 0) return;
        var step = active.steps[active.index];
        if (typeof active.onBeforePrev === 'function') {
            try {
                if (active.onBeforePrev(active.index, step) === false) return;
            } catch (err) { /* ignore */ }
        }
        showStepAt(active.index - 1);
    }

    function showStepAt(index) {
        if (!active) return;
        var steps = active.steps;
        if (index < 0 || index >= steps.length) {
            closeCoachmark('end');
            return;
        }

        var step = steps[index];
        active.index = index;

        if (typeof active.onStepChange === 'function') {
            try {
                active.onStepChange(index, step);
            } catch (err) { /* ignore */ }
        }

        var anchor = resolveStepTarget(step);
        var requireTarget = step.requireTarget === true;
        if (shouldShowSpotlight(step) && !anchor) {
            var attempts = typeof active._resolveAttempts === 'number' ? active._resolveAttempts : 0;
            if (attempts < 45) {
                active._resolveAttempts = attempts + 1;
                setTimeout(function () {
                    showStepAt(index);
                }, 100);
                return;
            }
            active._resolveAttempts = 0;
            if (requireTarget) {
                closeCoachmark('missing-target');
                return;
            }
        }
        active._resolveAttempts = 0;

        var popoverId = active.popoverId;
        if (typeof window.closePopover === 'function') {
            window.closePopover(popoverId);
        }

        var placement = step.placement || 'bottom';
        if (['bottom', 'top', 'left', 'right'].indexOf(placement) < 0) placement = 'bottom';
        var align = step.align != null ? step.align : 'center';
        var offset = typeof step.offset === 'number' ? step.offset : 8;
        var size = step.size || 'md';
        var title = step.title != null ? String(step.title) : '';
        var total = steps.length;
        var bodyInner = buildBodyHtml(step, index, total, active.showProgress === true);
        var actionParts = buildActionsParts(index, total);

        var scrim = active.scrimEl;
        var spotlight = active.spotlightEl;
        if (scrim && spotlight) {
            if (anchor && shouldShowSpotlight(step)) {
                scrim.classList.remove('ubits-coachmark__scrim--visible');
                spotlight.classList.add('ubits-coachmark__spotlight--visible');
            } else {
                scrim.classList.add('ubits-coachmark__scrim--visible');
                spotlight.classList.remove('ubits-coachmark__spotlight--visible');
            }
        }

        if (typeof window.openPopover === 'function') {
            try {
                window.openPopover({
                    popoverId: popoverId,
                    anchorEl: anchor,
                    placement: placement,
                    align: align,
                    offset: offset,
                    title: title,
                    bodyHtml: bodyInner,
                    actionsStartHtml: actionParts.start,
                    actionsEndHtml: actionParts.end,
                    size: size,
                    closeOnClickOutside: false,
                    closeOnEscape: false,
                    ariaModal: true,
                    zIndex: active.zIndexPopover || 10060,
                    onClose: function () {
                        /* noop: cierre lo controla coachmark */
                    }
                });
            } catch (err) {
                if (typeof console !== 'undefined' && console.error) {
                    console.error('[UBITS_COACHMARK] openPopover falló:', err);
                }
                closeCoachmark('dismiss');
                return;
            }
        }

        wirePopoverButtons();

        requestAnimationFrame(function () {
            layoutActive();
            requestAnimationFrame(function () {
                layoutActive();
            });
        });
    }

    /**
     * @param {Object} options
     * @returns {boolean}
     */
    function startCoachmark(options) {
        options = options || {};
        var steps = options.steps;
        if (!steps || !steps.length) {
            return false;
        }

        if (typeof window.openPopover !== 'function') {
            return false;
        }

        closeCoachmark('restart');

        var popoverId = options.popoverId || DEFAULT_POPOVER_ID;

        var startIdx = typeof options.startIndex === 'number' ? options.startIndex : 0;
        if (startIdx < 0) startIdx = 0;
        if (startIdx >= steps.length) startIdx = steps.length - 1;

        active = {
            steps: steps,
            index: 0,
            popoverId: popoverId,
            padding: typeof options.padding === 'number' ? options.padding : 8,
            zIndexLayer: typeof options.zIndexLayer === 'number' ? options.zIndexLayer : 10050,
            zIndexPopover: typeof options.zIndexPopover === 'number' ? options.zIndexPopover : 10060,
            showProgress: options.showProgress === true,
            onComplete: options.onComplete || null,
            onDismiss: options.onDismiss || null,
            onStepChange: options.onStepChange || null,
            onBeforeNext: typeof options.onBeforeNext === 'function' ? options.onBeforeNext : null,
            onBeforePrev: typeof options.onBeforePrev === 'function' ? options.onBeforePrev : null,
            clickBlocker: blockDocumentClicks,
            rootEl: null,
            scrimEl: null,
            spotlightEl: null,
            _layoutTimer: null,
            _resolveAttempts: 0
        };

        active.rootEl = null;
        ensureRoot();
        active.rootEl.style.zIndex = String(active.zIndexLayer);

        document.addEventListener('keydown', onKeydown, true);
        window.addEventListener('resize', onResizeScroll);
        window.addEventListener('scroll', onResizeScroll, true);
        document.addEventListener('click', active.clickBlocker, true);
        document.body.classList.add('ubits-coachmark-active');

        showStepAt(startIdx);
        return true;
    }

    /**
     * @param {string} [reason]
     */
    function closeCoachmark(reason) {
        reason = reason || 'dismiss';
        if (!active && reason !== 'restart') return;

        var prev = active;
        var cb = prev ? prev.onDismiss : null;
        var wasEnd = reason === 'end';

        if (typeof window.closePopover === 'function' && prev) {
            window.closePopover(prev.popoverId);
        }

        removeRoot(prev);
        active = null;

        if (wasEnd && prev && typeof prev.onComplete === 'function') {
            try {
                prev.onComplete();
            } catch (err) { /* ignore */ }
        } else if (prev && typeof cb === 'function' && reason !== 'restart') {
            try {
                cb(reason);
            } catch (err) { /* ignore */ }
        }
    }

    window.UBITS_COACHMARK = {
        start: startCoachmark,
        close: closeCoachmark,
        next: goNext,
        prev: goPrev,
        layout: layoutActive,
        isActive: function () {
            return !!active;
        }
    };
})();
