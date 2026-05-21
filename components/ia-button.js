/**
 * UBITS IA-BUTTON — icono sparkles Figma (571:8065): animación en hover (primario) + estado Generando (ubits-loader blanco).
 * El gradiente del botón primario es solo CSS (estático); este script reemplaza
 * <i class="far fa-sparkles"> (y fas) dentro de .ubits-ia-button--primary por el SVG.
 *
 * Requiere: ia-button.css (keyframes y tamaños del wrap están ahí).
 * Orden recomendado: ia-button.js antes de learn-content-img-trailer.js si usas vacío con IA.
 */
(function () {
    'use strict';

    /** Cuatro subtrazos Figma 571:8065 (alineados con `ia-loader.js`). */
    var UBITS_IA_SPARKLE_P1 = 'M8.07739 2.72314L9.34375 2.23438L9.8103 0.990234C9.83252 0.87915 9.9436 0.8125 10.0547 0.8125C10.1436 0.8125 10.2546 0.87915 10.2769 0.990234L10.7656 2.23438L12.0098 2.72314C12.1208 2.74536 12.1875 2.85645 12.1875 2.94531C12.1875 3.0564 12.1208 3.16748 12.0098 3.1897L10.7656 3.65625L10.2769 4.92261C10.2546 5.01147 10.1436 5.07812 10.0547 5.07812C9.9436 5.07812 9.83252 5.01147 9.8103 4.92261L9.34375 3.65625L8.07739 3.1897C7.98853 3.16748 7.92188 3.0564 7.92188 2.94531C7.92188 2.85645 7.98853 2.74536 8.07739 2.72314Z';
    var UBITS_IA_SPARKLE_P2 = 'M1.01245 6.14453L1.39014 5.98901L1.56787 5.90015H1.59009L3.54517 4.98926L4.45605 3.01196L4.54492 2.83423L4.72266 2.45654C4.76709 2.32324 4.90039 2.23438 5.03369 2.23438C5.16699 2.23438 5.30029 2.32324 5.36694 2.45654L5.54468 2.83423L5.61133 3.01196L5.63354 3.03418L6.52222 4.98926L8.49951 5.90015L8.67725 5.98901L9.05493 6.16675C9.18823 6.21118 9.2771 6.34448 9.2771 6.47778C9.2771 6.61108 9.18823 6.74438 9.05493 6.81104L8.67725 6.96655L8.49951 7.05542L6.52222 7.96631L5.61133 9.92139V9.9436L5.52246 10.1213L5.36694 10.499C5.30029 10.6323 5.16699 10.7212 5.03369 10.7212C4.90039 10.7212 4.76709 10.6323 4.72266 10.499L4.54492 10.1213L4.45605 9.9436V9.92139L3.54517 7.96631L1.59009 7.05542H1.56787L1.39014 6.96655L1.01245 6.81104C0.87915 6.74438 0.8125 6.61108 0.8125 6.47778C0.8125 6.34448 0.87915 6.21118 1.01245 6.14453Z';
    var UBITS_IA_SPARKLE_P3 = 'M2.85645 6.47778L3.9895 7.01099C4.21167 7.09985 4.41162 7.2998 4.52271 7.52197L5.03369 8.65503L5.56689 7.52197C5.67798 7.2998 5.85571 7.09985 6.07788 7.01099L7.21094 6.47778L6.07788 5.94458C5.85571 5.85571 5.67798 5.65576 5.56689 5.43359L5.03369 4.30054L4.52271 5.43359C4.41162 5.65576 4.21167 5.85571 3.9895 5.94458L2.85645 6.47778Z';
    var UBITS_IA_SPARKLE_P4 = 'M9.34375 9.34375L9.8103 8.09961C9.83252 7.98853 9.9436 7.92188 10.0547 7.92188C10.1436 7.92188 10.2546 7.98853 10.2769 8.09961L10.7656 9.34375L12.0098 9.83252C12.1208 9.85474 12.1875 9.96582 12.1875 10.0547C12.1875 10.1658 12.1208 10.2769 12.0098 10.2991L10.7656 10.7656L10.2769 12.032C10.2546 12.1208 10.1436 12.1875 10.0547 12.1875C9.9436 12.1875 9.83252 12.1208 9.8103 12.032L9.34375 10.7656L8.07739 10.2991C7.98853 10.2769 7.92188 10.1658 7.92188 10.0547C7.92188 9.96582 7.98853 9.85474 8.07739 9.83252L9.34375 9.34375Z';

    function getIaButtonSparklesSvgInner() {
        return (
            '<svg class="ubits-ia-button__sparkles-svg" viewBox="0 0 13 13" focusable="false" xmlns="http://www.w3.org/2000/svg">' +
            '<g class="ubits-ia-button__spark-g1"><path fill="currentColor" d="' +
            UBITS_IA_SPARKLE_P1 +
            '"/></g>' +
            '<g class="ubits-ia-button__spark-g2"><path fill="currentColor" d="' +
            UBITS_IA_SPARKLE_P2 +
            '"/></g>' +
            '<g class="ubits-ia-button__spark-g3"><path fill="currentColor" d="' +
            UBITS_IA_SPARKLE_P3 +
            '"/></g>' +
            '<g class="ubits-ia-button__spark-g4"><path fill="currentColor" d="' +
            UBITS_IA_SPARKLE_P4 +
            '"/></g>' +
            '</svg>'
        );
    }

    /**
     * Markup del icono sparkles (Figma 571:8065; cuatro piezas animadas a destiempo en hover en primario).
     */
    function getIaButtonSparklesMarkup() {
        return '<span class="ubits-ia-button__sparkles" aria-hidden="true">' + getIaButtonSparklesSvgInner() + '</span>';
    }

    /**
     * Sufijo HTML con tokens: separador vertical + número + moneda (tras el texto del botón).
     * @param {string|number} tokenNumber
     */
    function getIaButtonTokenCostSuffix(tokenNumber) {
        return (
            '<span class="ubits-ia-button__token-divider" aria-hidden="true"></span>' +
            '<span class="ubits-ia-button__token-cost" aria-hidden="true">' +
            '<span class="ubits-ia-button__token-number">' +
            String(tokenNumber) +
            '</span><i class="far fa-coin-vertical"></i></span>'
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
     * Sustituye iconos sparkles FontAwesome por el SVG animado en botones IA primarios.
     * @param {ParentNode} [root]
     */
    function initIaButtonSparkles(root) {
        root = root || document;
        var buttons = root.querySelectorAll('.ubits-ia-button--primary');
        for (var b = 0; b < buttons.length; b++) {
            var btn = buttons[b];
            if (btn.classList.contains('ubits-ia-button--generating')) continue;
            var icons = btn.querySelectorAll('i');
            for (var i = 0; i < icons.length; i++) {
                var ic = icons[i];
                if (!isSparklesIcon(ic)) continue;
                var wrap = document.createElement('span');
                wrap.className = 'ubits-ia-button__sparkles';
                wrap.setAttribute('aria-hidden', 'true');
                wrap.innerHTML = getIaButtonSparklesSvgInner();
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
