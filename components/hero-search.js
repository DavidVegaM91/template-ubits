/**
 * UBITS — Hero search (APP v3)
 * Buscador pill sobre gradiente para Inicio Aprendizaje y pantallas similares.
 * Campo nativo type="search" (no createInput) según diseño Figma.
 *
 * API:
 *   heroSearchHtml(options) — markup del bloque
 *   mountHeroSearch(options) — inyecta en containerId y devuelve refs
 *   setHeroSearchBarActive(barEl|barId, active) — borde reforzado al enfocar/buscar
 *
 * Referencia producto: ubits-colaborador/aprendizaje/home-learn.html + home-learn-search.js
 */
(function () {
    'use strict';

    var SEARCH_ICON_SVG =
        '<svg class="ubits-hero-search__submit-icon" viewBox="0 0 16.2499 16.2499" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
        '<path d="M14.1667 7.70833C14.1667 4.1415 11.2752 1.25 7.70833 1.25C4.14149 1.25 1.25 4.14149 1.25 7.70833C1.25 11.2752 4.1415 14.1667 7.70833 14.1667C9.45282 14.1667 11.0343 13.4735 12.1965 12.3494C12.217 12.3203 12.2404 12.2925 12.2664 12.2664C12.292 12.2409 12.3193 12.2183 12.3478 12.1981C13.4728 11.0358 14.1667 9.45365 14.1667 7.70833ZM15.4167 7.70833C15.4167 9.6119 14.7251 11.353 13.5815 12.6978L16.0669 15.1831C16.311 15.4272 16.311 15.8228 16.0669 16.0669C15.8228 16.311 15.4272 16.311 15.1831 16.0669L12.6978 13.5815C11.353 14.7251 9.6119 15.4167 7.70833 15.4167C3.45114 15.4167 0 11.9655 0 7.70833C0 3.45114 3.45114 0 7.70833 0C11.9655 0 15.4167 3.45114 15.4167 7.70833Z" fill="currentColor"/>' +
        '</svg>';

    var HERO_SEARCH_DEFAULTS = {
        title: '¿Qué quieres aprender hoy?',
        placeholder: 'Buscar contenidos o competencias',
        sectionAriaLabel: 'Buscar contenidos',
        inputAriaLabel: 'Buscar contenidos o competencias',
        submitAriaLabel: 'Buscar',
        sectionId: '',
        barId: 'hero-search-bar',
        inputId: 'hero-search-input',
        submitId: 'hero-search-submit'
    };

    function escapeHtml(value) {
        if (value == null) return '';
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function resolveBarEl(barElOrId) {
        if (!barElOrId) return null;
        if (typeof barElOrId === 'string') return document.getElementById(barElOrId);
        return barElOrId;
    }

    /**
     * @param {object} [options]
     * @returns {string}
     */
    function heroSearchHtml(options) {
        var o = Object.assign({}, HERO_SEARCH_DEFAULTS, options || {});
        var sectionIdAttr = o.sectionId ? ' id="' + escapeHtml(o.sectionId) + '"' : '';

        return (
            '<section class="ubits-hero-search"' +
            sectionIdAttr +
            ' aria-label="' +
            escapeHtml(o.sectionAriaLabel) +
            '">' +
            '<p class="ubits-hero-search__title ubits-heading-h1">' +
            escapeHtml(o.title) +
            '</p>' +
            '<div class="ubits-hero-search__bar" id="' +
            escapeHtml(o.barId) +
            '" role="search">' +
            '<input type="search" class="ubits-hero-search__field ubits-body-md-regular" id="' +
            escapeHtml(o.inputId) +
            '" placeholder="' +
            escapeHtml(o.placeholder) +
            '" autocomplete="off" enterkeyhint="search" aria-label="' +
            escapeHtml(o.inputAriaLabel) +
            '">' +
            '<button type="button" class="ubits-hero-search__submit" id="' +
            escapeHtml(o.submitId) +
            '" aria-label="' +
            escapeHtml(o.submitAriaLabel) +
            '">' +
            SEARCH_ICON_SVG +
            '</button>' +
            '</div>' +
            '</section>'
        );
    }

    /**
     * @param {object} options — containerId obligatorio; resto como heroSearchHtml
     * @returns {{ section: HTMLElement|null, bar: HTMLElement|null, input: HTMLInputElement|null, submit: HTMLButtonElement|null }}
     */
    function mountHeroSearch(options) {
        var o = Object.assign({}, HERO_SEARCH_DEFAULTS, options || {});
        var container =
            typeof o.containerId === 'string'
                ? document.getElementById(o.containerId)
                : o.container;

        if (!container) {
            return { section: null, bar: null, input: null, submit: null };
        }

        container.innerHTML = heroSearchHtml(o);

        return {
            section: o.sectionId ? document.getElementById(o.sectionId) : container.querySelector('.ubits-hero-search'),
            bar: document.getElementById(o.barId),
            input: document.getElementById(o.inputId),
            submit: document.getElementById(o.submitId)
        };
    }

    function setHeroSearchBarActive(barElOrId, active) {
        var bar = resolveBarEl(barElOrId);
        if (!bar) return;
        bar.classList.toggle('ubits-hero-search__bar--active', !!active);
    }

    window.HERO_SEARCH_DEFAULTS = HERO_SEARCH_DEFAULTS;
    window.heroSearchHtml = heroSearchHtml;
    window.mountHeroSearch = mountHeroSearch;
    window.setHeroSearchBarActive = setHeroSearchBarActive;
})();
