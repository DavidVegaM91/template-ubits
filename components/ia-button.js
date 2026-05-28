/**
 * UBITS IA-BUTTON — sparkles SVG (mismo arte que ia-loader): primario blanco; secundario con gradiente Creator v3.
 * Sustituye <i class="far fa-sparkles"> en .ubits-ia-button--primary y .ubits-ia-button--secondary.
 * Animación a destiempo solo en hover (estático si no hay hover). Generando: ubits-loader blanco.
 *
 * Requiere: ia-button.css (keyframes y tamaños del wrap están ahí).
 */
(function () {
    'use strict';

    /** Sparkles IA 12×12 — mismos trazos que `ia-loader.js` (viewBox 12). */
    var UBITS_IA_SPARKLE_P1 =
        'M7.26489 1.91064L8.53125 1.42188L8.9978 0.177734C9.02002 0.0666504 9.1311 0 9.24219 0C9.33105 0 9.44214 0.0666504 9.46436 0.177734L9.95312 1.42188L11.1973 1.91064C11.3083 1.93286 11.375 2.04395 11.375 2.13281C11.375 2.2439 11.3083 2.35498 11.1973 2.3772L9.95312 2.84375L9.46436 4.11011C9.44214 4.19897 9.33105 4.26562 9.24219 4.26562C9.1311 4.26562 9.02002 4.19897 8.9978 4.11011L8.53125 2.84375L7.26489 2.3772C7.17603 2.35498 7.10938 2.2439 7.10938 2.13281C7.10938 2.04395 7.17603 1.93286 7.26489 1.91064Z';
    var UBITS_IA_SPARKLE_P2 =
        'M0.199951 5.33203L0.577637 5.17651L0.755371 5.08765H0.777588L2.73267 4.17676L3.64355 2.19946L3.73242 2.02173L3.91016 1.64404C3.95459 1.51074 4.08789 1.42188 4.22119 1.42188C4.35449 1.42188 4.48779 1.51074 4.55444 1.64404L4.73218 2.02173L4.79883 2.19946L4.82104 2.22168L5.70972 4.17676L7.68701 5.08765L7.86475 5.17651L8.24243 5.35425C8.37573 5.39868 8.4646 5.53198 8.4646 5.66528C8.4646 5.79858 8.37573 5.93188 8.24243 5.99854L7.86475 6.15405L7.68701 6.24292L5.70972 7.15381L4.79883 9.10889V9.1311L4.70996 9.30884L4.55444 9.68652C4.48779 9.81982 4.35449 9.90869 4.22119 9.90869C4.08789 9.90869 3.95459 9.81982 3.91016 9.68652L3.73242 9.30884L3.64355 9.1311V9.10889L2.73267 7.15381L0.777588 6.24292H0.755371L0.577637 6.15405L0.199951 5.99854C0.0666504 5.93188 0 5.79858 0 5.66528C0 5.53198 0.0666504 5.39868 0.199951 5.33203Z';
    var UBITS_IA_SPARKLE_P3 =
        'M2.04395 5.66528L3.177 6.19849C3.39917 6.28735 3.59912 6.4873 3.71021 6.70947L4.22119 7.84253L4.75439 6.70947C4.86548 6.4873 5.04321 6.28735 5.26538 6.19849L6.39844 5.66528L5.26538 5.13208C5.04321 5.04321 4.86548 4.84326 4.75439 4.62109L4.22119 3.48804L3.71021 4.62109C3.59912 4.84326 3.39917 5.04321 3.177 5.13208L2.04395 5.66528Z';
    var UBITS_IA_SPARKLE_P4 =
        'M8.53125 8.53125L8.9978 7.28711C9.02002 7.17603 9.1311 7.10938 9.24219 7.10938C9.33105 7.10938 9.44214 7.17603 9.46436 7.28711L9.95312 8.53125L11.1973 9.02002C11.3083 9.04224 11.375 9.15332 11.375 9.24219C11.375 9.35327 11.3083 9.46436 11.1973 9.48657L9.95312 9.95312L9.46436 11.2195C9.44214 11.3083 9.33105 11.375 9.24219 11.375C9.1311 11.375 9.02002 11.3083 8.9978 11.2195L8.53125 9.95312L7.26489 9.48657C7.17603 9.46436 7.10938 9.35327 7.10938 9.24219C7.10938 9.15332 7.17603 9.04224 7.26489 9.02002L8.53125 8.53125Z';

    var iaButtonSparklesGradSeq = 0;

    function nextIaButtonSparklesGradientId() {
        iaButtonSparklesGradSeq += 1;
        return 'ubits-ia-button-sparkles-grad-' + iaButtonSparklesGradSeq;
    }

    /** Mismo ángulo y paradas que --ubits-ia-button-gradient (-61.13deg, viewBox 12×12). */
    function getIaButtonSparklesGradientDefs(gradId) {
        return (
            '<defs><linearGradient id="' +
            gradId +
            '" gradientUnits="userSpaceOnUse" x1="0.74" y1="3.11" x2="11.26" y2="8.89">' +
            '<stop offset="6.07%" stop-color="rgb(255, 84, 22)"/>' +
            '<stop offset="35.59%" stop-color="rgb(234, 6, 111)"/>' +
            '<stop offset="67.19%" stop-color="rgb(136, 35, 234)"/>' +
            '<stop offset="92.55%" stop-color="rgb(12, 91, 239)"/>' +
            '</linearGradient></defs>'
        );
    }

    function iaButtonSparkleBigOutlinePathMarkup(fill) {
        return (
            '<path fill="' +
            fill +
            '" fill-rule="evenodd" clip-rule="evenodd" d="' +
            UBITS_IA_SPARKLE_P2 +
            ' ' +
            UBITS_IA_SPARKLE_P3 +
            '"/>'
        );
    }

    /**
     * @param {{ variant?: 'primary'|'secondary' }} [options]
     */
    function getIaButtonSparklesSvgInner(options) {
        options = options || {};
        var variant = options.variant === 'secondary' ? 'secondary' : 'primary';
        var fill = 'currentColor';
        var defs = '';
        if (variant === 'secondary') {
            var gradId = nextIaButtonSparklesGradientId();
            defs = getIaButtonSparklesGradientDefs(gradId);
            fill = 'url(#' + gradId + ')';
        }
        return (
            '<svg class="ubits-ia-button__sparkles-svg" viewBox="0 0 12 12" fill="none" focusable="false" xmlns="http://www.w3.org/2000/svg">' +
            defs +
            '<g class="ubits-ia-button__spark-g1"><path fill="' +
            fill +
            '" d="' +
            UBITS_IA_SPARKLE_P1 +
            '"/></g>' +
            '<g class="ubits-ia-button__spark-g2">' +
            iaButtonSparkleBigOutlinePathMarkup(fill) +
            '</g>' +
            '<g class="ubits-ia-button__spark-g3"><path fill="' +
            fill +
            '" d="' +
            UBITS_IA_SPARKLE_P4 +
            '"/></g>' +
            '</svg>'
        );
    }

    /**
     * @param {{ variant?: 'primary'|'secondary' }} [options]
     */
    function getIaButtonSparklesMarkup(options) {
        options = options || {};
        var extraClass =
            options.variant === 'secondary' ? ' ubits-ia-button__sparkles--gradient' : '';
        return (
            '<span class="ubits-ia-button__sparkles' +
            extraClass +
            '" aria-hidden="true">' +
            getIaButtonSparklesSvgInner(options) +
            '</span>'
        );
    }

    /**
     * Sufijo HTML con tokens: separador vertical + moneda + número (tras el texto del botón).
     * @param {string|number} tokenNumber
     */
    function getIaButtonTokenCostSuffix(tokenNumber) {
        return (
            '<span class="ubits-ia-button__token-divider" aria-hidden="true"></span>' +
            '<span class="ubits-ia-button__token-cost" aria-hidden="true">' +
            '<i class="far fa-coin-vertical"></i>' +
            '<span class="ubits-ia-button__token-number">' +
            String(tokenNumber) +
            '</span></span>'
        );
    }

    function isSparklesIcon(el) {
        if (!el || el.tagName !== 'I') return false;
        var c = (el.getAttribute('class') || '') + ' ' + (el.className || '');
        if (c.indexOf('fa-sparkles') === -1) return false;
        if (el.closest('.ubits-ia-button__token-cost')) return false;
        return true;
    }

    /**
     * Sustituye iconos sparkles FontAwesome por el SVG en botones IA primario y secundario.
     * @param {ParentNode} [root]
     */
    function initIaButtonSparkles(root) {
        root = root || document;
        var buttons = root.querySelectorAll('.ubits-ia-button--primary, .ubits-ia-button--secondary');
        for (var b = 0; b < buttons.length; b++) {
            var btn = buttons[b];
            if (btn.classList.contains('ubits-ia-button--generating')) continue;
            var variant = btn.classList.contains('ubits-ia-button--secondary') ? 'secondary' : 'primary';
            var icons = btn.querySelectorAll('i');
            for (var i = 0; i < icons.length; i++) {
                var ic = icons[i];
                if (!isSparklesIcon(ic)) continue;
                var wrap = document.createElement('span');
                wrap.className =
                    'ubits-ia-button__sparkles' +
                    (variant === 'secondary' ? ' ubits-ia-button__sparkles--gradient' : '');
                wrap.setAttribute('aria-hidden', 'true');
                wrap.innerHTML = getIaButtonSparklesSvgInner({ variant: variant });
                ic.parentNode.replaceChild(wrap, ic);
            }
        }
    }

    var UBITS_IA_BUTTON_IDLE_HTML = 'data-ubits-ia-button-idle-html';
    var UBITS_IA_BUTTON_IDLE_DISABLED = 'data-ubits-ia-button-idle-disabled';
    var UBITS_IA_BUTTON_IDLE_ARIA_BUSY = 'data-ubits-ia-button-idle-aria-busy';

    function getIaButtonGeneratingDotsHtml() {
        return (
            '<span class="ubits-ia-button__generating-dots" aria-hidden="true">' +
            '<span>.</span><span>.</span><span>.</span>' +
            '</span>'
        );
    }

    /**
     * Contenido del botón en estado Generando (<span class="ubits-loader"> blanco + texto + puntos).
     * Requiere components/loader.css (importado desde ia-button.css).
     * @param {string} label Texto antes de los puntos (sin «...»; los añade el markup).
     * @param {boolean} iconOnly
     */
    function getIaButtonGeneratingMarkup(label, iconOnly) {
        var loader =
            '<span class="ubits-loader ubits-ia-button__generating-loader" role="presentation" aria-hidden="true"></span>';
        if (iconOnly) return loader;
        var text = label != null && String(label).length ? String(label) : 'Generando';
        return (
            loader +
            '<span class="ubits-ia-button__generating-label">' +
            text +
            getIaButtonGeneratingDotsHtml() +
            '</span>'
        );
    }

    function isIaButtonIconOnly(btn) {
        if (!btn || !btn.classList) return false;
        return (
            btn.classList.contains('ubits-ia-button--icon-only') ||
            (btn.className && btn.className.indexOf('ubits-ia-button--icon-only') !== -1)
        );
    }

    /**
     * Activa o desactiva el estado «Generando» (ubits-loader blanco + puntos animados).
     * @param {HTMLButtonElement} button
     * @param {boolean} generating
     * @param {{ label?: string }} [options]
     */
    function setIaButtonGenerating(button, generating, options) {
        if (!button || !button.classList || button.className.indexOf('ubits-ia-button') === -1) return;
        options = options || {};

        if (generating) {
            if (button.getAttribute(UBITS_IA_BUTTON_IDLE_HTML)) return;
            button.setAttribute(UBITS_IA_BUTTON_IDLE_HTML, button.innerHTML);
            button.setAttribute(UBITS_IA_BUTTON_IDLE_DISABLED, button.disabled ? '1' : '0');
            button.setAttribute(
                UBITS_IA_BUTTON_IDLE_ARIA_BUSY,
                button.getAttribute('aria-busy') != null ? button.getAttribute('aria-busy') : ''
            );
            button.innerHTML = getIaButtonGeneratingMarkup(options.label, isIaButtonIconOnly(button));
            button.classList.add('ubits-ia-button--generating');
            button.disabled = true;
            button.setAttribute('aria-busy', 'true');
            button.setAttribute('aria-disabled', 'true');
            return;
        }

        if (!button.getAttribute(UBITS_IA_BUTTON_IDLE_HTML)) {
            button.classList.remove('ubits-ia-button--generating');
            button.removeAttribute('aria-busy');
            button.removeAttribute('aria-disabled');
            return;
        }

        button.innerHTML = button.getAttribute(UBITS_IA_BUTTON_IDLE_HTML);
        button.removeAttribute(UBITS_IA_BUTTON_IDLE_HTML);
        button.disabled = button.getAttribute(UBITS_IA_BUTTON_IDLE_DISABLED) === '1';
        button.removeAttribute(UBITS_IA_BUTTON_IDLE_DISABLED);
        var prevBusy = button.getAttribute(UBITS_IA_BUTTON_IDLE_ARIA_BUSY);
        button.removeAttribute(UBITS_IA_BUTTON_IDLE_ARIA_BUSY);
        if (prevBusy) button.setAttribute('aria-busy', prevBusy);
        else button.removeAttribute('aria-busy');
        button.removeAttribute('aria-disabled');
        button.classList.remove('ubits-ia-button--generating');
        initIaButtonSparkles(button);
    }

    if (typeof window !== 'undefined') {
        window.getIaButtonSparklesMarkup = getIaButtonSparklesMarkup;
        window.getIaButtonTokenCostSuffix = getIaButtonTokenCostSuffix;
        window.getIaButtonGeneratingMarkup = getIaButtonGeneratingMarkup;
        window.initIaButtonSparkles = initIaButtonSparkles;
        window.setIaButtonGenerating = setIaButtonGenerating;
        function runInit() {
            try {
                initIaButtonSparkles(document);
            } catch (e) {}
        }
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', runInit);
        } else {
            runInit();
        }
    }
})();
