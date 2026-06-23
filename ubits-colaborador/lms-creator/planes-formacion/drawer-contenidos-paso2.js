/**
 * Catálogo de contenidos en paso 2 del wizard / drawer solo contenidos (Agregar asignación).
 * opts.idPrefix: drawer-wiz | drawer-editplan | '' (ids drawer-cursos-*)
 * opts.selectionProp / viewOnlyProp: props del overlay para selección y «ver seleccionados»
 */
(function (window) {
    'use strict';

    function resolveId(idPrefix, suffix) {
        if (idPrefix) return idPrefix + '-' + suffix;
        return 'drawer-' + suffix;
    }

    function attachWizardContenidosPaso2(overlay, onSync, opts) {
        opts = opts || {};
        var idPrefix = opts.idPrefix != null ? opts.idPrefix : 'drawer-wiz';
        var selectionProp = opts.selectionProp || '_wizCursosSeleccionados';
        var viewOnlyProp = opts.viewOnlyProp || '_wizViewOnlySeleccionados';
        var DCF = window.DrawerContenidosFiltros;

        function I(suffix) {
            return resolveId(idPrefix, suffix);
        }

        if (!overlay[selectionProp]) overlay[selectionProp] = [];
        var catalogoCursos = window.CATALOGO_CURSOS_DRAWER || [];

        var idSearch = I('cursos-search-container');
        var searchWrap = overlay.querySelector('#' + idSearch);
        if (searchWrap) searchWrap.innerHTML = '';
        if (typeof createInput === 'function') {
            createInput({
                containerId: idSearch,
                type: 'search',
                placeholder: 'Buscar contenidos...',
                size: 'sm',
                showLabel: false
            });
        }
        var searchContainer = overlay.querySelector('#' + idSearch);
        var searchInput = searchContainer ? searchContainer.querySelector('input') : null;
        var cardsContainer = overlay.querySelector('#' + I('cursos-cards-container'));
        var emptySearchContainer = overlay.querySelector('#' + I('contenidos-empty-search'));
        var DRAWER_CURSOS_PAGE_SIZE = 12;
        var drawerCursosVisibleCount = DRAWER_CURSOS_PAGE_SIZE;
        var drawerCursosFiltros = DCF ? DCF.createEmptyFilters() : { tipo: '', categoriaId: '', nivelId: '', idioma: '', catalogo: '' };
        overlay[viewOnlyProp] = false;

        function getFiltradosDrawerCursos() {
            var q = searchInput && searchInput.value ? searchInput.value.trim() : '';
            if (DCF && typeof DCF.filterCursosBySearchAndFilters === 'function') {
                return DCF.filterCursosBySearchAndFilters(catalogoCursos, q, drawerCursosFiltros);
            }
            return catalogoCursos.filter(function (c) {
                var ql = q.toLowerCase();
                return (
                    !ql ||
                    (c.title && c.title.toLowerCase().includes(ql)) ||
                    (c.competency && c.competency.toLowerCase().includes(ql)) ||
                    (c.categoria && String(c.categoria).toLowerCase().includes(ql))
                );
            });
        }

        function getFiltradosParaGrid() {
            var filtrados = getFiltradosDrawerCursos();
            var sel = overlay[selectionProp] || [];
            if (!overlay[viewOnlyProp] || !sel.length) return filtrados;
            var idSet = {};
            sel.forEach(function (c) {
                if (c && c.id != null) idSet[String(c.id)] = true;
            });
            return filtrados.filter(function (c) {
                return idSet[String(c.id)];
            });
        }

        function updateVerSeleccionadosBar() {
            var bar = overlay.querySelector('#' + I('cursos-action-bar'));
            var btn = overlay.querySelector('#' + I('cursos-ver-seleccionados'));
            if (!bar || !btn) return;
            var sel = overlay[selectionProp] || [];
            var n = sel.length;
            var icon = btn.querySelector('i');
            var span = btn.querySelector('span');
            if (n === 0) {
                overlay[viewOnlyProp] = false;
                bar.classList.remove('is-visible');
                if (icon) icon.className = 'far fa-eye';
                if (span) span.textContent = 'Ver seleccionados';
                btn.classList.remove('active');
                return;
            }
            bar.classList.add('is-visible');
            if (overlay[viewOnlyProp]) {
                if (icon) icon.className = 'far fa-eye-slash';
                if (span) span.textContent = 'Dejar de ver seleccionados (' + n + ')';
                btn.classList.add('active');
            } else {
                if (icon) icon.className = 'far fa-eye';
                if (span) span.textContent = 'Ver seleccionados (' + n + ')';
                btn.classList.remove('active');
            }
        }

        function notifySync() {
            if (typeof onSync === 'function') onSync();
        }

        function filtrarYRenderizarCards() {
            if (!cardsContainer || typeof loadCardContentCompact !== 'function') return;
            var filtrados = getFiltradosDrawerCursos();
            var paraGrid = getFiltradosParaGrid();
            var q = searchInput && searchInput.value ? searchInput.value.trim() : '';
            var emptyId = I('contenidos-empty-search');

            if (filtrados.length === 0 && catalogoCursos.length > 0) {
                if (emptySearchContainer) {
                    emptySearchContainer.style.display = 'block';
                    emptySearchContainer.innerHTML = '';
                    if (typeof loadEmptyState === 'function') {
                        loadEmptyState(emptyId, {
                            icon: 'fa-search',
                            iconSize: 'lg',
                            title: 'No se encontraron resultados',
                            description: 'Intenta ajustar tu búsqueda o filtros para encontrar lo que buscas.',
                            buttons: { secondary: { text: 'Limpiar búsqueda', icon: 'fa-times', onClick: function () {} } }
                        });
                        setTimeout(function () {
                            var btn = emptySearchContainer.querySelector('.ubits-button--secondary');
                            if (btn) {
                                btn.onclick = function (e) {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (searchInput) {
                                        searchInput.value = '';
                                        searchInput.dispatchEvent(new Event('input'));
                                    }
                                    filtrarYRenderizarCards();
                                };
                            }
                        }, 50);
                    }
                }
                cardsContainer.style.display = 'none';
                updateVerSeleccionadosBar();
                return;
            }
            if (overlay[viewOnlyProp] && paraGrid.length === 0 && (overlay[selectionProp] || []).length > 0) {
                if (emptySearchContainer) {
                    emptySearchContainer.style.display = 'block';
                    emptySearchContainer.innerHTML = '';
                    if (typeof loadEmptyState === 'function') {
                        loadEmptyState(emptyId, {
                            icon: 'fa-search',
                            iconSize: 'lg',
                            title: 'No se encontraron resultados',
                            description: 'Intenta ajustar tu búsqueda o filtros para encontrar lo que buscas.',
                            buttons: { secondary: { text: 'Limpiar búsqueda', icon: 'fa-times', onClick: function () {} } }
                        });
                        setTimeout(function () {
                            var btn = emptySearchContainer.querySelector('.ubits-button--secondary');
                            if (btn) {
                                btn.onclick = function (e) {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    overlay[viewOnlyProp] = false;
                                    if (searchInput) {
                                        searchInput.value = '';
                                        searchInput.dispatchEvent(new Event('input'));
                                    }
                                    updateVerSeleccionadosBar();
                                    filtrarYRenderizarCards();
                                };
                            }
                        }, 50);
                    }
                }
                cardsContainer.style.display = 'none';
                updateVerSeleccionadosBar();
                return;
            }
            if (emptySearchContainer) {
                emptySearchContainer.className = 'drawer-contenidos-empty-search-wrap';
                emptySearchContainer.style.display = 'none';
                emptySearchContainer.innerHTML = '';
            }
            cardsContainer.style.display = '';
            var aMostrar = paraGrid.slice(0, drawerCursosVisibleCount);
            loadCardContentCompact(I('cursos-cards-container'), aMostrar);
            var listSel = overlay[selectionProp] || [];
            aMostrar.forEach(function (course, idx) {
                var cardEls = cardsContainer.querySelectorAll('.course-card-compact');
                var cardEl = cardEls[idx];
                if (cardEl) {
                    cardEl.style.cursor = 'pointer';
                    cardEl.dataset.courseId = course.id;
                    if (listSel.some(function (x) { return String(x.id) === String(course.id); })) {
                        cardEl.classList.add('course-card-compact--selected');
                    } else {
                        cardEl.classList.remove('course-card-compact--selected');
                    }
                }
            });
            updateVerSeleccionadosBar();
        }

        function maybeLoadMoreDrawerCursos() {
            var paraGrid = getFiltradosParaGrid();
            if (drawerCursosVisibleCount >= paraGrid.length) return;
            drawerCursosVisibleCount += DRAWER_CURSOS_PAGE_SIZE;
            filtrarYRenderizarCards();
        }

        var resultadosBg =
            overlay.querySelector('#drawer-wizard-step3 .drawer-cursos-resultados-bg') ||
            overlay.querySelector('.drawer-agregar-cursos--single-col .drawer-cursos-resultados-bg--paso2-full') ||
            overlay.querySelector('.drawer-cursos-resultados-bg');
        if (resultadosBg) {
            if (overlay._wizContenidosScrollHandler) {
                resultadosBg.removeEventListener('scroll', overlay._wizContenidosScrollHandler);
            }
            overlay._wizContenidosScrollHandler = function () {
                var el = resultadosBg;
                var threshold = 120;
                if (el.scrollTop + el.clientHeight >= el.scrollHeight - threshold) maybeLoadMoreDrawerCursos();
                if (typeof syncDrawerResultadosScrollPadding === 'function') syncDrawerResultadosScrollPadding(el);
            };
            resultadosBg.addEventListener('scroll', overlay._wizContenidosScrollHandler);
            if (typeof observeDrawerResultadosScrollPadding === 'function') {
                observeDrawerResultadosScrollPadding(resultadosBg, cardsContainer);
            }
        }

        if (cardsContainer) {
            if (overlay._wizContenidosCardsClickHandler) {
                cardsContainer.removeEventListener('click', overlay._wizContenidosCardsClickHandler);
            }
            overlay._wizContenidosCardsClickHandler = function (e) {
                var cardEl = e.target.closest('.course-card-compact');
                if (!cardEl || !cardEl.dataset.courseId) return;
                var course = catalogoCursos.find(function (c) {
                    return String(c.id) === String(cardEl.dataset.courseId);
                });
                if (!course) return;
                var list = overlay[selectionProp] || [];
                var ix = list.findIndex(function (x) { return String(x.id) === String(course.id); });
                if (ix !== -1) {
                    list.splice(ix, 1);
                } else {
                    list.push(course);
                    if (searchInput) {
                        searchInput.value = '';
                        searchInput.dispatchEvent(new Event('input'));
                    }
                }
                filtrarYRenderizarCards();
                notifySync();
            };
            cardsContainer.addEventListener('click', overlay._wizContenidosCardsClickHandler);
        }

        if (searchInput) {
            var onSearch = function () {
                drawerCursosVisibleCount = DRAWER_CURSOS_PAGE_SIZE;
                filtrarYRenderizarCards();
            };
            searchInput.addEventListener('input', onSearch);
            searchInput.addEventListener('keyup', onSearch);
        }

        var filterBtn = overlay.querySelector('#' + I('cursos-filter-btn'));
        if (filterBtn && DCF) {
            if (overlay._wizContenidosFilterClickHandler) {
                filterBtn.removeEventListener('click', overlay._wizContenidosFilterClickHandler);
            }
            var badgeId = I('cursos-filter-btn') + '-badge';
            var modalId = I('contenidos-filtros-modal');
            function applyDrawerFilters(newFilters) {
                drawerCursosFiltros = DCF.cloneFilters(newFilters);
                DCF.updateFilterButtonBadge(filterBtn, drawerCursosFiltros, badgeId);
                DCF.renderFiltrosAplicados({
                    overlay: overlay,
                    idPrefix: idPrefix,
                    filters: drawerCursosFiltros,
                    filterBtn: filterBtn,
                    badgeId: badgeId,
                    onFiltersChange: function (updated) {
                        applyDrawerFilters(updated);
                    }
                });
                drawerCursosVisibleCount = DRAWER_CURSOS_PAGE_SIZE;
                filtrarYRenderizarCards();
            }
            overlay._wizContenidosFilterClickHandler = function (e) {
                e.preventDefault();
                e.stopPropagation();
                DCF.openFiltrosModal(drawerCursosFiltros, applyDrawerFilters, modalId);
            };
            filterBtn.addEventListener('click', overlay._wizContenidosFilterClickHandler);
            if (typeof initTooltip === 'function') initTooltip('#' + filterBtn.id);
            applyDrawerFilters(drawerCursosFiltros);
        }

        var btnVerSel = overlay.querySelector('#' + I('cursos-ver-seleccionados'));
        if (btnVerSel) {
            btnVerSel.onclick = function () {
                var sel = overlay[selectionProp] || [];
                if (!sel.length) return;
                overlay[viewOnlyProp] = !overlay[viewOnlyProp];
                drawerCursosVisibleCount = DRAWER_CURSOS_PAGE_SIZE;
                filtrarYRenderizarCards();
            };
        }

        filtrarYRenderizarCards();
        notifySync();
        overlay._wizContenidosAttached = true;
    }

    window.attachWizardContenidosPaso2 = attachWizardContenidosPaso2;
})(window);
