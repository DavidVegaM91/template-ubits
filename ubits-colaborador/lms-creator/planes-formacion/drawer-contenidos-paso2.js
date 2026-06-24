/**
 * Catálogo de contenidos — paso Contenidos del drawer «Agregar asignación».
 * Toolbar panel + vista tabla (default) + vista cuadrícula (cards).
 * opts.idPrefix: drawer-wiz | drawer-editplan | '' (ids drawer-cursos-*)
 */
(function (window) {
    'use strict';

    var PAGE_SIZE = 12;

    var CHECKBOX_I18N = {
        selectAll: 'Seleccionar todo',
        deselectAll: 'Deseleccionar todo',
        selectRow: 'Seleccionar',
        deselectRow: 'Deseleccionar'
    };

    function resolveId(idPrefix, suffix) {
        if (idPrefix) return idPrefix + '-' + suffix;
        return 'drawer-' + suffix;
    }

    function escapeHtml(t) {
        if (t == null) return '';
        return String(t)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function normalizeText(text) {
        if (!text) return '';
        return String(text)
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
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

        var tableWrap = overlay.querySelector('#' + I('cursos-table-wrap'));
        var usesToolbarCatalog = !!tableWrap;

        var searchInput = null;
        var searchOpen = false;
        var searchQuery = '';

        if (usesToolbarCatalog) {
            overlay._drawerContenidosViewMode = overlay._drawerContenidosViewMode || 'list';
            overlay._drawerContenidosColumnFilters = overlay._drawerContenidosColumnFilters || {
                tipo: [],
                level: [],
                provider: []
            };
        } else {
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
            searchInput = overlay.querySelector('#' + idSearch + ' input');
        }

        var cardsContainer = overlay.querySelector('#' + I('cursos-cards-container'));
        var emptySearchContainer = overlay.querySelector('#' + I('contenidos-empty-search'));
        var tbody = overlay.querySelector('#' + I('cursos-catalog-tbody'));
        var theadRow = overlay.querySelector('#' + I('cursos-catalog-thead-row'));
        var metaCountEl = overlay.querySelector('#' + I('cursos-meta-count'));
        var drawerCursosVisibleCount = PAGE_SIZE;
        var drawerCursosFiltros = DCF ? DCF.createEmptyFilters() : { tipo: '', categoriaId: '', nivelId: '', idioma: '', catalogo: '' };
        overlay[viewOnlyProp] = false;

        function getSearchQuery() {
            if (usesToolbarCatalog) return searchQuery;
            return searchInput && searchInput.value ? searchInput.value.trim() : '';
        }

        function applyColumnFilters(cursos) {
            if (!usesToolbarCatalog) return cursos;
            var cf = overlay._drawerContenidosColumnFilters || { tipo: [], level: [], provider: [] };
            return (cursos || []).filter(function (c) {
                if (cf.tipo.length && cf.tipo.indexOf(c.type || '') === -1) return false;
                if (cf.level.length && cf.level.indexOf(c.level || '') === -1) return false;
                if (cf.provider.length && cf.provider.indexOf(c.provider || '') === -1) return false;
                return true;
            });
        }

        function getFiltradosDrawerCursos() {
            var q = getSearchQuery();
            var base;
            if (DCF && typeof DCF.filterCursosBySearchAndFilters === 'function') {
                base = DCF.filterCursosBySearchAndFilters(catalogoCursos, q, drawerCursosFiltros);
            } else {
                base = catalogoCursos.filter(function (c) {
                    var ql = q.toLowerCase();
                    return (
                        !ql ||
                        (c.title && c.title.toLowerCase().includes(ql)) ||
                        (c.competency && c.competency.toLowerCase().includes(ql)) ||
                        (c.categoria && String(c.categoria).toLowerCase().includes(ql))
                    );
                });
            }
            return applyColumnFilters(base);
        }

        function getFiltradosParaVista() {
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

        function isCourseSelected(courseId) {
            return (overlay[selectionProp] || []).some(function (x) {
                return String(x.id) === String(courseId);
            });
        }

        function toggleCourseSelection(course) {
            if (!course) return;
            var list = overlay[selectionProp] || [];
            var ix = list.findIndex(function (x) { return String(x.id) === String(course.id); });
            if (ix !== -1) {
                list.splice(ix, 1);
            } else {
                list.push(course);
                if (usesToolbarCatalog) {
                    searchQuery = '';
                    var inline = overlay.querySelector('#' + I('cursos-search-inline'));
                    var inp = inline ? inline.querySelector('input') : null;
                    if (inp) {
                        inp.value = '';
                        inp.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                } else if (searchInput) {
                    searchInput.value = '';
                    searchInput.dispatchEvent(new Event('input'));
                }
            }
        }

        function updateMetaCount(visible, total) {
            if (!metaCountEl) return;
            metaCountEl.textContent = visible + '/' + total;
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
                btn.classList.remove('ubits-button--active');
                return;
            }
            bar.classList.add('is-visible');
            if (overlay[viewOnlyProp]) {
                if (icon) icon.className = 'far fa-eye-slash';
                if (span) span.textContent = 'Dejar de ver seleccionados (' + n + ')';
                btn.classList.add('ubits-button--active');
            } else {
                if (icon) icon.className = 'far fa-eye';
                if (span) span.textContent = 'Ver seleccionados (' + n + ')';
                btn.classList.remove('ubits-button--active');
            }
        }

        function notifySync() {
            if (typeof onSync === 'function') onSync();
        }

        function showEmptySearchState(options) {
            options = options || {};
            var emptyId = I('contenidos-empty-search');
            if (!emptySearchContainer) return;
            emptySearchContainer.style.display = 'block';
            emptySearchContainer.innerHTML = '';
            if (typeof loadEmptyState !== 'function') return;
            loadEmptyState(emptyId, {
                icon: 'fa-search',
                iconSize: 'lg',
                title: 'No se encontraron resultados',
                description: 'Intenta ajustar tu búsqueda o filtros para encontrar lo que buscas.',
                buttons: { secondary: { text: 'Limpiar búsqueda', icon: 'fa-times', onClick: function () {} } }
            });
            setTimeout(function () {
                var btn = emptySearchContainer.querySelector('.ubits-button--secondary');
                if (!btn) return;
                btn.onclick = function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (options.onClearViewOnly) overlay[viewOnlyProp] = false;
                    searchQuery = '';
                    var inline = overlay.querySelector('#' + I('cursos-search-inline'));
                    var inp = inline ? inline.querySelector('input') : null;
                    if (inp) {
                        inp.value = '';
                        inp.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                    if (searchInput) {
                        searchInput.value = '';
                        searchInput.dispatchEvent(new Event('input'));
                    }
                    updateVerSeleccionadosBar();
                    renderCatalog();
                };
            }, 50);
        }

        function hideEmptySearchState() {
            if (!emptySearchContainer) return;
            emptySearchContainer.className = 'drawer-contenidos-empty-search-wrap';
            emptySearchContainer.style.display = 'none';
            emptySearchContainer.innerHTML = '';
        }

        function setViewMode(mode) {
            if (!usesToolbarCatalog) return;
            overlay._drawerContenidosViewMode = mode === 'grid' ? 'grid' : 'list';
            if (tableWrap) tableWrap.style.display = mode === 'grid' ? 'none' : '';
            if (cardsContainer) cardsContainer.style.display = mode === 'grid' ? '' : 'none';
            var filterBtnWrap = overlay.querySelector(
                '#' + I('cursos-search-group') + ' .drawer-cursos-filtros-btn-wrap'
            );
            if (filterBtnWrap) {
                filterBtnWrap.style.display = mode === 'grid' ? '' : 'none';
            }
        }

        function uniqueColumnValues(field) {
            var set = {};
            catalogoCursos.forEach(function (c) {
                var v = c[field];
                if (v != null && String(v).trim() !== '') set[String(v)] = true;
            });
            return Object.keys(set).sort(function (a, b) { return a.localeCompare(b, 'es'); });
        }

        function isColFilterActive(col) {
            var cf = overlay._drawerContenidosColumnFilters || {};
            var arr = cf[col] || [];
            return arr.length > 0;
        }

        function updateRowCheckboxTooltip(checkbox) {
            var td = checkbox.closest('td.ubits-table__td--checkbox');
            if (td) {
                td.setAttribute('data-tooltip', checkbox.checked ? CHECKBOX_I18N.deselectRow : CHECKBOX_I18N.selectRow);
            }
        }

        function updateSelectAllCheckbox() {
            var selectAll = overlay.querySelector('#' + I('cursos-select-all'));
            if (!selectAll || !tbody) return;
            var rows = Array.prototype.slice.call(tbody.querySelectorAll('.drawer-contenidos-table-row'));
            var checkedCount = rows.filter(function (r) {
                var cb = r.querySelector('.drawer-contenidos-row-check');
                return cb && cb.checked;
            }).length;
            selectAll.checked = rows.length > 0 && checkedCount === rows.length;
            selectAll.indeterminate = checkedCount > 0 && checkedCount < rows.length;
            var th = selectAll.closest('th');
            if (th) {
                th.setAttribute('data-tooltip', checkedCount > 0 ? CHECKBOX_I18N.deselectAll : CHECKBOX_I18N.selectAll);
            }
        }

        function initCheckboxTooltips() {
            if (typeof initTooltip !== 'function') return;
            var tableId = I('cursos-catalog-table');
            initTooltip('#' + tableId + ' thead [data-tooltip]');
            initTooltip('#' + tableId + ' tbody .ubits-table__td--checkbox[data-tooltip]');
        }

        function buildTableHeader() {
            if (!theadRow) return;
            var cols = [
                { id: 'checkbox', label: '', filter: false },
                { id: 'contenido', label: 'Contenido', filter: false },
                { id: 'tipo', label: 'Tipo', filter: 'tipo' },
                { id: 'nivel', label: 'Nivel', filter: 'level' },
                { id: 'proveedor', label: 'Proveedor', filter: 'provider' },
                { id: 'duracion', label: 'Duración', filter: false }
            ];
            var html = '';
            cols.forEach(function (col) {
                if (col.id === 'checkbox') {
                    html +=
                        '<th class="ubits-table__th--checkbox" data-col="checkbox" data-tooltip="' + escapeHtml(CHECKBOX_I18N.selectAll) + '" data-tooltip-delay="1000">' +
                        '<label class="ubits-checkbox ubits-checkbox--sm" style="display:inline-flex;">' +
                        '<input type="checkbox" class="ubits-checkbox__input" id="' + I('cursos-select-all') + '" aria-label="' + escapeHtml(CHECKBOX_I18N.selectAll) + '">' +
                        '<span class="ubits-checkbox__box"><i class="fas fa-check"></i><i class="fas fa-minus"></i></span>' +
                        '<span class="ubits-checkbox__label sr-only" aria-hidden="true">&nbsp;</span></label></th>';
                    return;
                }
                if (col.filter) {
                    var activeClass = isColFilterActive(col.filter) ? ' drawer-contenidos-col-filter-btn--active' : '';
                    html +=
                        '<th class="drawer-contenidos-th-filterable ubits-body-sm-semibold" data-col="' + col.id + '">' +
                        escapeHtml(col.label) +
                        ' <button type="button" class="ubits-button ubits-button--tertiary ubits-button--xs ubits-button--icon-only drawer-contenidos-col-filter-btn' + activeClass + '" data-col-filter="' + col.filter + '" aria-label="Filtrar por ' + escapeHtml(col.label) + '" data-tooltip="Filtrar por ' + escapeHtml(col.label) + '" data-tooltip-delay="1000"><i class="far fa-filter"></i></button></th>';
                } else {
                    html += '<th class="ubits-body-sm-semibold" data-col="' + col.id + '">' + escapeHtml(col.label) + '</th>';
                }
            });
            theadRow.innerHTML = html;

            var selectAll = overlay.querySelector('#' + I('cursos-select-all'));
            if (selectAll) {
                selectAll.addEventListener('change', function () {
                    var rows = tbody
                        ? Array.prototype.slice.call(tbody.querySelectorAll('.drawer-contenidos-table-row'))
                        : [];
                    var checkedCount = rows.filter(function (r) {
                        var cb = r.querySelector('.drawer-contenidos-row-check');
                        return cb && cb.checked;
                    }).length;
                    var paraVista = getFiltradosParaVista().slice(0, drawerCursosVisibleCount);
                    var list = overlay[selectionProp] || [];
                    if (this.checked && checkedCount > 0 && checkedCount < rows.length) {
                        this.checked = false;
                        this.indeterminate = false;
                        var removeIdsPartial = {};
                        paraVista.forEach(function (c) { removeIdsPartial[String(c.id)] = true; });
                        overlay[selectionProp] = list.filter(function (x) { return !removeIdsPartial[String(x.id)]; });
                    } else if (this.checked) {
                        paraVista.forEach(function (c) {
                            if (!isCourseSelected(c.id)) list.push(c);
                        });
                    } else {
                        var removeIds = {};
                        paraVista.forEach(function (c) { removeIds[String(c.id)] = true; });
                        overlay[selectionProp] = list.filter(function (x) { return !removeIds[String(x.id)]; });
                    }
                    renderCatalog();
                    notifySync();
                });
            }
        }

        function buildTableRowHtml(course) {
            var selected = isCourseSelected(course.id);
            var rowTooltip = selected ? CHECKBOX_I18N.deselectRow : CHECKBOX_I18N.selectRow;
            return (
                '<tr class="drawer-contenidos-table-row' + (selected ? ' is-selected' : '') + '" data-course-id="' + escapeHtml(course.id) + '">' +
                '<td class="ubits-table__td--checkbox" data-col="checkbox" data-tooltip="' + escapeHtml(rowTooltip) + '" data-tooltip-delay="1000">' +
                '<label class="ubits-checkbox ubits-checkbox--sm" style="display:inline-flex;">' +
                '<input type="checkbox" class="ubits-checkbox__input drawer-contenidos-row-check" ' + (selected ? 'checked' : '') + ' aria-label="' + escapeHtml(rowTooltip) + '">' +
                '<span class="ubits-checkbox__box"><i class="fas fa-check"></i></span>' +
                '<span class="ubits-checkbox__label sr-only" aria-hidden="true">&nbsp;</span></label></td>' +
                '<td data-col="contenido"><span class="ubits-body-sm-regular">' + escapeHtml(course.title || '') + '</span></td>' +
                '<td data-col="tipo"><span class="ubits-body-sm-regular">' + escapeHtml(course.type || '-') + '</span></td>' +
                '<td data-col="nivel"><span class="ubits-body-sm-regular">' + escapeHtml(course.level || '-') + '</span></td>' +
                '<td data-col="proveedor"><span class="ubits-body-sm-regular">' + escapeHtml(course.provider || '-') + '</span></td>' +
                '<td data-col="duracion"><span class="ubits-body-sm-regular">' + escapeHtml(course.duration || '-') + '</span></td>' +
                '</tr>'
            );
        }

        function renderTable() {
            if (!tbody) return;
            var filtrados = getFiltradosDrawerCursos();
            var paraVista = getFiltradosParaVista();
            updateMetaCount(paraVista.length, filtrados.length);

            if (filtrados.length === 0 && catalogoCursos.length > 0) {
                tbody.innerHTML = '';
                if (tableWrap) tableWrap.style.display = 'none';
                if (cardsContainer) cardsContainer.style.display = 'none';
                showEmptySearchState({});
                updateSelectAllCheckbox();
                updateVerSeleccionadosBar();
                return;
            }
            if (overlay[viewOnlyProp] && paraVista.length === 0 && (overlay[selectionProp] || []).length > 0) {
                tbody.innerHTML = '';
                if (tableWrap) tableWrap.style.display = 'none';
                showEmptySearchState({ onClearViewOnly: true });
                updateSelectAllCheckbox();
                updateVerSeleccionadosBar();
                return;
            }

            hideEmptySearchState();
            setViewMode('list');
            var aMostrar = paraVista.slice(0, drawerCursosVisibleCount);
            tbody.innerHTML = aMostrar.map(buildTableRowHtml).join('');
            updateSelectAllCheckbox();
            initCheckboxTooltips();
            updateVerSeleccionadosBar();
        }

        function renderCards() {
            if (!cardsContainer || typeof loadCardContentCompact !== 'function') return;
            var filtrados = getFiltradosDrawerCursos();
            var paraVista = getFiltradosParaVista();
            updateMetaCount(paraVista.length, filtrados.length);

            if (filtrados.length === 0 && catalogoCursos.length > 0) {
                cardsContainer.style.display = 'none';
                if (tableWrap) tableWrap.style.display = 'none';
                showEmptySearchState({});
                updateVerSeleccionadosBar();
                return;
            }
            if (overlay[viewOnlyProp] && paraVista.length === 0 && (overlay[selectionProp] || []).length > 0) {
                cardsContainer.style.display = 'none';
                showEmptySearchState({ onClearViewOnly: true });
                updateVerSeleccionadosBar();
                return;
            }

            hideEmptySearchState();
            setViewMode('grid');
            var aMostrar = paraVista.slice(0, drawerCursosVisibleCount);
            loadCardContentCompact(I('cursos-cards-container'), aMostrar);
            aMostrar.forEach(function (course, idx) {
                var cardEls = cardsContainer.querySelectorAll('.course-card-compact');
                var cardEl = cardEls[idx];
                if (!cardEl) return;
                cardEl.style.cursor = 'pointer';
                cardEl.dataset.courseId = course.id;
                cardEl.classList.toggle('course-card-compact--selected', isCourseSelected(course.id));
            });
            updateVerSeleccionadosBar();
        }

        function renderCatalog() {
            if (usesToolbarCatalog && overlay._drawerContenidosViewMode === 'grid') {
                renderCards();
            } else if (usesToolbarCatalog) {
                renderTable();
            } else {
                renderCards();
            }
            notifySync();
        }

        function maybeLoadMore() {
            var paraVista = getFiltradosParaVista();
            if (drawerCursosVisibleCount >= paraVista.length) return;
            drawerCursosVisibleCount += PAGE_SIZE;
            renderCatalog();
        }

        var filterBtnRef = overlay.querySelector('#' + I('cursos-filter-btn'));
        var filterBadgeId = filterBtnRef ? filterBtnRef.id + '-badge' : I('cursos-filter-btn') + '-badge';

        function refreshFiltrosAplicados() {
            if (!DCF) return;
            DCF.renderFiltrosAplicados({
                overlay: overlay,
                idPrefix: idPrefix,
                filters: drawerCursosFiltros,
                filterBtn: filterBtnRef,
                badgeId: filterBadgeId,
                columnFilters: usesToolbarCatalog ? overlay._drawerContenidosColumnFilters : null,
                columnFilterLabels: { tipo: 'Tipo', level: 'Nivel', provider: 'Proveedor' },
                onFiltersChange: function (updated) {
                    drawerCursosFiltros = DCF.cloneFilters(updated);
                    DCF.updateFilterButtonBadge(filterBtnRef, drawerCursosFiltros, filterBadgeId);
                    drawerCursosVisibleCount = PAGE_SIZE;
                    renderCatalog();
                    refreshFiltrosAplicados();
                },
                onColumnFilterRemove: function (colKey, value) {
                    var cf = overlay._drawerContenidosColumnFilters || { tipo: [], level: [], provider: [] };
                    cf[colKey] = (cf[colKey] || []).filter(function (v) { return v !== value; });
                    drawerCursosVisibleCount = PAGE_SIZE;
                    buildTableHeader();
                    renderCatalog();
                    refreshFiltrosAplicados();
                },
                onColumnFiltersClear: function () {
                    overlay._drawerContenidosColumnFilters = { tipo: [], level: [], provider: [] };
                    buildTableHeader();
                }
            });
        }

        function openColumnFilterMenu(colKey, btn) {
            if (typeof window.getDropdownMenuHtml !== 'function' || typeof window.openDropdownMenu !== 'function') return;
            var fieldMap = { tipo: 'type', level: 'level', provider: 'provider' };
            var field = fieldMap[colKey] || colKey;
            var overlayId = I('cursos-col-filter-' + colKey);
            var existing = document.getElementById(overlayId);
            if (existing) existing.remove();

            var cf = overlay._drawerContenidosColumnFilters;
            var current = cf[colKey] || [];
            var allOptions = uniqueColumnValues(field);
            var options = allOptions.map(function (v) {
                return { text: v, value: v, checkbox: true, selected: current.indexOf(v) >= 0 };
            });
            var labels = { tipo: 'Tipo', level: 'Nivel', provider: 'Proveedor' };
            var label = labels[colKey] || colKey;

            document.body.insertAdjacentHTML(
                'beforeend',
                window.getDropdownMenuHtml({
                    overlayId: overlayId,
                    contentId: overlayId + '-content',
                    hasAutocomplete: true,
                    autocompletePlaceholder: 'Filtrar por ' + label + '...',
                    autocompleteContainerId: overlayId + '-autocomplete',
                    options: options,
                    footerSecondaryLabel: 'Cancelar',
                    footerPrimaryLabel: 'Aplicar',
                    footerSecondaryId: overlayId + '-cancel',
                    footerPrimaryId: overlayId + '-apply'
                })
            );

            var overlayEl = document.getElementById(overlayId);
            if (!overlayEl) return;

            overlayEl.classList.add('drawer-contenidos-col-filter-overlay', 'ubits-dt-filter-overlay');

            var content = overlayEl.querySelector('.ubits-dropdown-menu__content');
            var searchInput = document.getElementById(overlayId + '-autocomplete-input');
            var searchClear = document.getElementById(overlayId + '-autocomplete-clear');
            var optionsWrap = overlayEl.querySelector('.ubits-dropdown-menu__options');

            function stopMenuEvent(ev) {
                ev.stopPropagation();
            }
            if (content) {
                content.addEventListener('mousedown', stopMenuEvent);
                content.addEventListener('click', stopMenuEvent);
            }
            if (optionsWrap) {
                optionsWrap.classList.add('ubits-dropdown-menu__options--filter-scroll');
                optionsWrap.addEventListener('mousedown', stopMenuEvent);
                optionsWrap.addEventListener('click', stopMenuEvent);
            }

            function normalizeFilterText(t) {
                if (!t) return '';
                return String(t)
                    .toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '');
            }

            function filterOptionsBySearch() {
                var q = searchInput && searchInput.value ? searchInput.value.trim() : '';
                var nq = normalizeFilterText(q);
                if (searchClear) searchClear.style.display = nq ? 'block' : 'none';
                if (!optionsWrap) return;
                optionsWrap.querySelectorAll('.ubits-dropdown-menu__option').forEach(function (opt) {
                    var labelEl = opt.querySelector('.ubits-checkbox__label');
                    var text = (labelEl ? labelEl.textContent : '') || opt.getAttribute('data-value') || '';
                    opt.style.display = !nq || normalizeFilterText(text).indexOf(nq) >= 0 ? '' : 'none';
                });
            }

            if (searchInput) {
                searchInput.addEventListener('mousedown', stopMenuEvent);
                searchInput.addEventListener('input', filterOptionsBySearch);
                searchInput.addEventListener('keyup', filterOptionsBySearch);
                setTimeout(function () { searchInput.focus(); }, 80);
            }
            if (searchClear) {
                searchClear.style.pointerEvents = 'auto';
                searchClear.addEventListener('mousedown', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                });
                searchClear.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (searchInput) {
                        searchInput.value = '';
                        searchInput.focus();
                    }
                    filterOptionsBySearch();
                });
            }
            filterOptionsBySearch();

            var cancelBtn = document.getElementById(overlayId + '-cancel');
            var applyBtn = document.getElementById(overlayId + '-apply');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (typeof window.closeDropdownMenu === 'function') window.closeDropdownMenu(overlayId);
                    else overlayEl.remove();
                });
            }
            if (applyBtn) {
                applyBtn.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    var selected = [];
                    overlayEl.querySelectorAll('.ubits-dropdown-menu__options .ubits-checkbox__input:checked').forEach(function (cb) {
                        var v = cb.getAttribute('data-value');
                        if (v) selected.push(v);
                    });
                    cf[colKey] = selected;
                    drawerCursosVisibleCount = PAGE_SIZE;
                    buildTableHeader();
                    renderCatalog();
                    refreshFiltrosAplicados();
                    if (typeof window.closeDropdownMenu === 'function') window.closeDropdownMenu(overlayId);
                    else overlayEl.remove();
                });
            }
            overlayEl.addEventListener('mousedown', function (ev) {
                if (ev.target === overlayEl) {
                    if (typeof window.closeDropdownMenu === 'function') window.closeDropdownMenu(overlayId);
                    else overlayEl.remove();
                }
            });

            window.openDropdownMenu(overlayId, btn);
        }

        function initToolbarSearch() {
            var toggle = overlay.querySelector('#' + I('cursos-search-toggle'));
            var inline = overlay.querySelector('#' + I('cursos-search-inline'));
            var filterBtn = overlay.querySelector('#' + I('cursos-filter-btn'));
            var searchGroup = overlay.querySelector('#' + I('cursos-search-group'));
            if (!toggle || !inline) return;

            function collapseSearch() {
                searchOpen = false;
                searchQuery = '';
                toggle.style.display = '';
                inline.style.display = 'none';
                inline.setAttribute('aria-hidden', 'true');
                inline.innerHTML = '';
                if (typeof initTooltip === 'function') {
                    initTooltip('#' + I('cursos-toolbar') + ' [data-tooltip]');
                }
            }

            toggle.addEventListener('click', function (e) {
                e.stopPropagation();
                if (searchOpen) return;
                toggle.style.display = 'none';
                inline.style.display = 'flex';
                inline.setAttribute('aria-hidden', 'false');
                if (typeof createInput === 'function') {
                    createInput({
                        containerId: I('cursos-search-inline'),
                        type: 'search',
                        placeholder: 'Buscar contenidos...',
                        size: 'sm',
                        showLabel: false,
                        onChange: function (value) {
                            searchQuery = value || '';
                            drawerCursosVisibleCount = PAGE_SIZE;
                            renderCatalog();
                        }
                    });
                    setTimeout(function () {
                        var inp = inline.querySelector('input');
                        if (inp) inp.focus();
                    }, 80);
                }
                searchOpen = true;
            });

            if (overlay._drawerContenidosOutsideSearchHandler) {
                document.removeEventListener('click', overlay._drawerContenidosOutsideSearchHandler);
            }
            overlay._drawerContenidosOutsideSearchHandler = function (e) {
                if (!searchOpen) return;
                if (inline.contains(e.target) || toggle.contains(e.target)) return;
                if (filterBtn && filterBtn.contains(e.target)) return;
                if (!searchQuery.trim()) collapseSearch();
            };
            document.addEventListener('click', overlay._drawerContenidosOutsideSearchHandler);
        }

        function initViewToggle() {
            var viewGroup = overlay.querySelector('#' + I('cursos-view-group'));
            if (!viewGroup || typeof initButtonGroup !== 'function') return;
            initButtonGroup(viewGroup, {
                variant: 'selectable',
                value: overlay._drawerContenidosViewMode || 'list',
                onChange: function (val) {
                    overlay._drawerContenidosViewMode = val === 'grid' ? 'grid' : 'list';
                    drawerCursosVisibleCount = PAGE_SIZE;
                    renderCatalog();
                }
            });
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
                if (el.scrollTop + el.clientHeight >= el.scrollHeight - threshold) maybeLoadMore();
                var scrollTarget = overlay._drawerContenidosViewMode === 'grid' ? cardsContainer : tableWrap;
                if (typeof syncDrawerResultadosScrollPadding === 'function') syncDrawerResultadosScrollPadding(el, scrollTarget);
            };
            resultadosBg.addEventListener('scroll', overlay._wizContenidosScrollHandler);
            if (typeof observeDrawerResultadosScrollPadding === 'function') {
                observeDrawerResultadosScrollPadding(resultadosBg, tableWrap || cardsContainer);
            }
        }

        var catalogTable = overlay.querySelector('#' + I('cursos-catalog-table'));
        if (catalogTable) {
            if (overlay._drawerContenidosTableClickHandler) {
                catalogTable.removeEventListener('click', overlay._drawerContenidosTableClickHandler);
            }
            if (overlay._drawerContenidosTableChangeHandler) {
                catalogTable.removeEventListener('change', overlay._drawerContenidosTableChangeHandler);
            }
            overlay._drawerContenidosTableClickHandler = function (e) {
                var filterBtn = e.target.closest('.drawer-contenidos-col-filter-btn');
                if (filterBtn) {
                    e.preventDefault();
                    e.stopPropagation();
                    openColumnFilterMenu(filterBtn.getAttribute('data-col-filter'), filterBtn);
                    return;
                }
                if (e.target.closest('.ubits-checkbox') || e.target.closest('label.ubits-checkbox')) return;
                var row = e.target.closest('.drawer-contenidos-table-row');
                if (!row || !row.dataset.courseId) return;
                var course = catalogoCursos.find(function (c) {
                    return String(c.id) === String(row.dataset.courseId);
                });
                if (!course) return;
                toggleCourseSelection(course);
                renderCatalog();
                notifySync();
            };
            overlay._drawerContenidosTableChangeHandler = function (e) {
                var cb = e.target.closest('.drawer-contenidos-row-check');
                if (!cb) return;
                var row = cb.closest('.drawer-contenidos-table-row');
                if (!row || !row.dataset.courseId) return;
                var course = catalogoCursos.find(function (c) {
                    return String(c.id) === String(row.dataset.courseId);
                });
                if (!course) return;
                var list = overlay[selectionProp] || [];
                var ix = list.findIndex(function (x) { return String(x.id) === String(course.id); });
                if (cb.checked && ix === -1) list.push(course);
                if (!cb.checked && ix !== -1) list.splice(ix, 1);
                updateRowCheckboxTooltip(cb);
                row.classList.toggle('is-selected', cb.checked);
                updateSelectAllCheckbox();
                updateVerSeleccionadosBar();
                notifySync();
            };
            catalogTable.addEventListener('click', overlay._drawerContenidosTableClickHandler);
            catalogTable.addEventListener('change', overlay._drawerContenidosTableChangeHandler);
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
                toggleCourseSelection(course);
                renderCatalog();
            };
            cardsContainer.addEventListener('click', overlay._wizContenidosCardsClickHandler);
        }

        if (searchInput) {
            var onSearch = function () {
                drawerCursosVisibleCount = PAGE_SIZE;
                renderCatalog();
            };
            searchInput.addEventListener('input', onSearch);
            searchInput.addEventListener('keyup', onSearch);
        }

        if (filterBtnRef && DCF) {
            if (overlay._wizContenidosFilterClickHandler) {
                filterBtnRef.removeEventListener('click', overlay._wizContenidosFilterClickHandler);
            }
            var modalId = I('contenidos-filtros-modal');
            function applyDrawerFilters(newFilters) {
                drawerCursosFiltros = DCF.cloneFilters(newFilters);
                DCF.updateFilterButtonBadge(filterBtnRef, drawerCursosFiltros, filterBadgeId);
                drawerCursosVisibleCount = PAGE_SIZE;
                renderCatalog();
                refreshFiltrosAplicados();
            }
            overlay._wizContenidosFilterClickHandler = function (e) {
                e.preventDefault();
                e.stopPropagation();
                DCF.openFiltrosModal(drawerCursosFiltros, applyDrawerFilters, modalId);
            };
            filterBtnRef.addEventListener('click', overlay._wizContenidosFilterClickHandler);
            applyDrawerFilters(drawerCursosFiltros);
        } else if (DCF && usesToolbarCatalog) {
            refreshFiltrosAplicados();
        }

        var btnVerSel = overlay.querySelector('#' + I('cursos-ver-seleccionados'));
        if (btnVerSel) {
            btnVerSel.onclick = function () {
                var sel = overlay[selectionProp] || [];
                if (!sel.length) return;
                overlay[viewOnlyProp] = !overlay[viewOnlyProp];
                drawerCursosVisibleCount = PAGE_SIZE;
                renderCatalog();
            };
        }

        if (usesToolbarCatalog) {
            initToolbarSearch();
            initViewToggle();
            buildTableHeader();
            setViewMode('list');
            if (typeof initTooltip === 'function') {
                initTooltip('#' + I('cursos-toolbar') + ' [data-tooltip]');
            }
        }

        renderCatalog();
        overlay._wizContenidosAttached = true;
    }

    window.attachWizardContenidosPaso2 = attachWizardContenidosPaso2;
})(window);
