/**
 * Home Learn — buscador del hero (componente hero-search): exploración catálogo + resultados en grid.
 * Busca en bd-contenidos-ubits.js y bd-contenidos-fiqsha.js (vía catalogo-contenidos-drawer).
 *
 * Búsqueda con debounce + skeleton (patrón producción): no re-renderiza en cada tecla;
 * mientras el usuario escribe se mantiene el grid de skeleton; al dejar de escribir ~450ms
 * se pintan los resultados. Con API real el debounce sería mayor (600–800ms) y el skeleton
 * cubriría la latencia de red.
 */
(function () {
    'use strict';

    var SEARCH_STATE = 'idle'; // idle | browse | results
    var catalogItems = [];
    var browseInitialized = false;
    var searchDebounceTimer = null;
    var pendingQuery = '';

    /** Tiempo tras dejar de escribir antes de buscar (playground local). Producción: 600–800ms+ */
    var SEARCH_DEBOUNCE_MS = 450;
    var SKELETON_CARD_COUNT = 8;

    var COMPETENCIA_POR_CATEGORIA_FIQSHA = {
        'cfq-001': 'Liderazgo',
        'cfq-002': 'Comunicación',
        'cfq-003': 'Trabajo en equipo',
        'cfq-004': 'Gestión de proyectos',
        'cfq-005': 'Innovación',
        'cfq-006': 'Marketing digital',
        'cfq-007': 'Experiencia del cliente',
        'cfq-008': 'Gestión financiera',
        'cfq-009': 'People management',
        'cfq-010': 'Inteligencia emocional',
        'cfq-011': 'Resolución de problemas',
        'cfq-012': 'Productividad',
        'cfq-013': 'Negociación',
        'cfq-014': 'Ventas',
        'cfq-015': 'Marketing',
        'cfq-016': 'Gestión del cambio',
        'cfq-017': 'Desarrollo de software',
        'cfq-018': 'Data skills',
        'cfq-019': 'Wellness'
    };

    function $(id) {
        return document.getElementById(id);
    }

    function getSearchInput() {
        return $('home-learn-search-input');
    }

    function getSearchQuery() {
        var input = getSearchInput();
        return input ? String(input.value || '').trim() : '';
    }

    function setSearchQuery(value) {
        var input = getSearchInput();
        if (!input) return;
        input.value = value;
        scheduleSearch(value);
    }

    function cancelPendingSearch() {
        if (searchDebounceTimer) {
            clearTimeout(searchDebounceTimer);
            searchDebounceTimer = null;
        }
        pendingQuery = '';
    }

    function refreshCatalogItems() {
        if (typeof refreshCatalogoContenidosDrawer === 'function') {
            catalogItems = refreshCatalogoContenidosDrawer();
        } else if (window.CATALOGO_CURSOS_DRAWER) {
            catalogItems = window.CATALOGO_CURSOS_DRAWER.slice();
        } else {
            catalogItems = [];
        }

        catalogItems = catalogItems.map(function (item) {
            if (item.courseSource !== 'empresa' || !item.categoriaFiqshaId) {
                return item;
            }
            var comp = COMPETENCIA_POR_CATEGORIA_FIQSHA[item.categoriaFiqshaId];
            if (!comp) return item;
            return Object.assign({}, item, { competency: comp });
        });
    }

    function buildSearchHaystack(item) {
        return [
            item.title,
            item.descripcion,
            item.type,
            item.competency,
            item.provider,
            item.categoria,
            item.level,
            item.language
        ].filter(Boolean).join(' ').toLowerCase();
    }

    function filterCatalogByQuery(query) {
        var q = String(query || '').toLowerCase().trim();
        if (!q) return [];

        var terms = q.split(/\s+/).filter(Boolean);
        return catalogItems.filter(function (item) {
            var haystack = buildSearchHaystack(item);
            for (var i = 0; i < terms.length; i++) {
                if (haystack.indexOf(terms[i]) === -1) return false;
            }
            return true;
        });
    }

    function toCardPayload(item) {
        var card = {
            type: item.type,
            title: item.title,
            provider: item.provider,
            providerLogo: item.providerLogo,
            duration: item.duration,
            level: item.level,
            progress: item.progress || 0,
            status: item.status || 'default',
            image: item.image,
            competency: item.competency,
            language: item.language
        };
        if (item.providers && item.providers.length) {
            card.providers = item.providers.map(function (p) {
                return {
                    name: p.name || p.provider,
                    logo: p.logo || p.providerLogo
                };
            });
        }
        return card;
    }

    function setSearchState(state) {
        SEARCH_STATE = state;
        var root = document.querySelector('.content-sections');
        if (root) {
            root.classList.remove('home-learn--search-idle', 'home-learn--search-browse', 'home-learn--search-results');
            root.classList.add('home-learn--search-' + state);
        }

        document.querySelectorAll('.home-learn-home-section').forEach(function (section) {
            section.hidden = state !== 'idle';
        });

        var chipsWrap = $('home-learn-trending-panel');
        var browsePanel = $('home-learn-browse-panel');
        var resultsPanel = $('home-learn-results-panel');
        var searchShell = $('home-learn-hero-search');

        if (chipsWrap) chipsWrap.hidden = state !== 'browse';
        if (browsePanel) browsePanel.hidden = state !== 'browse';
        if (resultsPanel) resultsPanel.hidden = state !== 'results';
        if (typeof setHeroSearchBarActive === 'function') {
            setHeroSearchBarActive(searchShell, state !== 'idle');
        } else if (searchShell) {
            searchShell.classList.toggle('ubits-hero-search__bar--active', state !== 'idle');
        }
    }

    function ensureBrowseContent() {
        if (browseInitialized || typeof initCatalogoBrowse !== 'function') return;
        browseInitialized = true;
        initCatalogoBrowse({
            onChipClick: function (term) {
                setSearchQuery(term);
                var input = getSearchInput();
                if (input) input.focus();
            }
        });
    }

    function buildResultsSkeletonHtml() {
        var cards = '';
        for (var i = 0; i < SKELETON_CARD_COUNT; i++) {
            cards +=
                '<div class="ubits-skeleton-card home-learn-results-skeleton-card" aria-hidden="true">' +
                    '<span class="ubits-skeleton ubits-skeleton--rect ubits-skeleton-card__media"></span>' +
                    '<div class="ubits-skeleton-stack">' +
                        '<span class="ubits-skeleton ubits-skeleton--line ubits-skeleton--sm ubits-skeleton--w-1-2"></span>' +
                        '<span class="ubits-skeleton ubits-skeleton--line ubits-skeleton--lg ubits-skeleton--w-full"></span>' +
                        '<span class="ubits-skeleton ubits-skeleton--line ubits-skeleton--md ubits-skeleton--w-2-3"></span>' +
                        '<span class="ubits-skeleton ubits-skeleton--line ubits-skeleton--sm ubits-skeleton--w-3-4"></span>' +
                    '</div>' +
                '</div>';
        }
        return cards;
    }

    function setResultsLoading(isLoading) {
        var countEl = $('home-learn-results-count');
        if (countEl) {
            countEl.textContent = isLoading ? '…' : countEl.textContent;
        }
    }

    function showResultsSkeleton() {
        var grid = $('home-learn-results-grid');
        var emptyEl = $('home-learn-empty-state');

        if (emptyEl) {
            emptyEl.style.display = 'none';
            emptyEl.innerHTML = '';
        }

        if (!grid) return;

        if (grid.getAttribute('data-search-loading') !== 'true') {
            grid.innerHTML = buildResultsSkeletonHtml();
            grid.setAttribute('data-search-loading', 'true');
            grid.setAttribute('aria-busy', 'true');
        }

        grid.style.display = 'grid';
        setResultsLoading(true);
    }

    function renderSearchResults(query) {
        var grid = $('home-learn-results-grid');
        var emptyEl = $('home-learn-empty-state');
        var countEl = $('home-learn-results-count');

        if (getSearchQuery() !== query) return;

        var results = filterCatalogByQuery(query);

        if (countEl) countEl.textContent = String(results.length);

        if (!grid) return;

        grid.removeAttribute('data-search-loading');
        grid.removeAttribute('aria-busy');

        if (!results.length) {
            grid.style.display = 'none';
            grid.innerHTML = '';
            if (emptyEl) {
                emptyEl.style.display = 'flex';
                emptyEl.innerHTML = '';
                if (typeof loadEmptyState === 'function') {
                    loadEmptyState('home-learn-empty-state', {
                        icon: 'fa-search',
                        iconSize: 'lg',
                        title: 'No se encontraron resultados',
                        description: 'Intenta ajustar tu búsqueda.',
                        buttons: {
                            secondary: {
                                text: 'Limpiar búsqueda',
                                icon: 'fa-times',
                                onClick: function () {}
                            }
                        }
                    });
                    setTimeout(function () {
                        var btn = emptyEl.querySelector('.ubits-button--secondary');
                        if (btn) {
                            btn.onclick = function (e) {
                                e.preventDefault();
                                clearSearchAndBrowse();
                            };
                        }
                    }, 50);
                }
            }
            return;
        }

        if (emptyEl) {
            emptyEl.style.display = 'none';
            emptyEl.innerHTML = '';
        }

        grid.style.display = 'grid';
        if (typeof loadCardContent === 'function') {
            loadCardContent('home-learn-results-grid', results.map(toCardPayload));
        }
    }

    function scheduleSearch(rawQuery) {
        var q = String(rawQuery || '').trim();

        cancelPendingSearch();

        if (!q) {
            if (SEARCH_STATE !== 'idle') {
                setSearchState('browse');
                var emptyEl = $('home-learn-empty-state');
                var grid = $('home-learn-results-grid');
                if (emptyEl) {
                    emptyEl.style.display = 'none';
                    emptyEl.innerHTML = '';
                }
                if (grid) {
                    grid.style.display = 'none';
                    grid.innerHTML = '';
                    grid.removeAttribute('data-search-loading');
                    grid.removeAttribute('aria-busy');
                }
                var countEl = $('home-learn-results-count');
                if (countEl) countEl.textContent = '0';
            }
            return;
        }

        pendingQuery = q;
        setSearchState('results');
        showResultsSkeleton();

        searchDebounceTimer = setTimeout(function () {
            searchDebounceTimer = null;
            if (pendingQuery !== getSearchQuery()) return;
            renderSearchResults(pendingQuery);
        }, SEARCH_DEBOUNCE_MS);
    }

    function flushSearchNow() {
        var q = getSearchQuery();
        cancelPendingSearch();
        if (!q) {
            scheduleSearch('');
            return;
        }
        pendingQuery = q;
        setSearchState('results');
        showResultsSkeleton();
        renderSearchResults(q);
    }

    function clearSearchAndBrowse() {
        cancelPendingSearch();
        var input = getSearchInput();
        if (input) input.value = '';
        scheduleSearch('');
        if (input) input.focus();
    }

    function exitSearchMode() {
        cancelPendingSearch();
        var input = getSearchInput();
        if (input) input.value = '';
        setSearchState('idle');
        var grid = $('home-learn-results-grid');
        if (grid) {
            grid.innerHTML = '';
            grid.removeAttribute('data-search-loading');
            grid.removeAttribute('aria-busy');
        }
    }

    function activateSearchMode() {
        if (SEARCH_STATE === 'idle') {
            setSearchState('browse');
            ensureBrowseContent();
        }
    }

    function handleDocumentClick(e) {
        if (SEARCH_STATE === 'idle') return;

        var searchRoot = $('home-learn-hero-search');
        var trendingPanel = $('home-learn-trending-panel');
        var browsePanel = $('home-learn-browse-panel');
        var resultsPanel = $('home-learn-results-panel');

        var inside =
            (searchRoot && searchRoot.contains(e.target)) ||
            (trendingPanel && trendingPanel.contains(e.target)) ||
            (browsePanel && browsePanel.contains(e.target)) ||
            (resultsPanel && resultsPanel.contains(e.target)) ||
            e.target.closest('.ubits-dropdown-menu__content') ||
            e.target.closest('.ubits-input-select-panel');

        if (!inside && !getSearchQuery()) {
            exitSearchMode();
        }
    }

    function wireHeroSearch() {
        var input = getSearchInput();
        var searchShell = $('home-learn-hero-search');
        var submitBtn = $('home-learn-search-submit');

        if (!input) return;

        input.addEventListener('focus', function () {
            activateSearchMode();
        });

        input.addEventListener('click', function () {
            activateSearchMode();
        });

        input.addEventListener('input', function () {
            if (SEARCH_STATE === 'idle') activateSearchMode();
            scheduleSearch(input.value);
        });

        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                flushSearchNow();
                return;
            }
            if (e.key === 'Escape') {
                e.preventDefault();
                if (getSearchQuery()) {
                    clearSearchAndBrowse();
                } else {
                    exitSearchMode();
                    input.blur();
                }
            }
        });

        if (submitBtn) {
            submitBtn.addEventListener('click', function () {
                activateSearchMode();
                input.focus();
                flushSearchNow();
            });
        }

        if (searchShell) {
            searchShell.addEventListener('click', function (e) {
                if (e.target === searchShell) {
                    activateSearchMode();
                    input.focus();
                }
            });
        }
    }

    function mountHomeLearnHeroSearch() {
        if (typeof mountHeroSearch !== 'function') return;
        mountHeroSearch({
            containerId: 'home-learn-hero-mount',
            title: '¿Qué quieres aprender hoy?',
            placeholder: 'Buscar contenidos o competencias',
            barId: 'home-learn-hero-search',
            inputId: 'home-learn-search-input',
            submitId: 'home-learn-search-submit'
        });
    }

    function initHomeLearnSearch() {
        mountHomeLearnHeroSearch();
        refreshCatalogItems();
        setSearchState('idle');
        wireHeroSearch();
        document.addEventListener('click', handleDocumentClick);
    }

    document.addEventListener('DOMContentLoaded', initHomeLearnSearch);
})();
