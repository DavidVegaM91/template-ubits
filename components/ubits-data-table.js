/**
 * UBITS Data Table - Componente reutilizable de tabla con checkboxes, búsqueda, filtros, orden y barra de acciones.
 * Referencia: tabla de seguimiento y tablas del drawer "Agregar asignación".
 *
 * Uso: createUbitsDataTable({ containerId, tableId, columns, getData, rowIdField, buildRowHtml, features, ... })
 * API: table.getSelectedIds(), table.getVisibleRows(), table.setFilter(), table.refresh()
 *
 * -----------------------------------------------------------------------------
 * TABLA TIPO SEGUIMIENTO (cuando el producto pide algo que va más allá del componente)
 * -----------------------------------------------------------------------------
 * Si en algún momento se requiere una tabla que se parezca a la de seguimiento
 * (tabs, indicadores, período, "Cargar más", drawer de filtros, etc.), seguir este paso a paso:
 *
 * 1) Lo que YA da este componente (activar con features y options):
 *    - Checkboxes, búsqueda, filtros por columna, orden, botón Columnas, barra de acciones,
 *      Ver seleccionados, contador X/Y, empty "sin datos" y empty "sin resultados" con Limpiar búsqueda.
 *    - Ejemplo de uso: documentacion/ejemplos/tabla-data-table-ejemplo.html
 *
 * 2) Lo que hay que AÑADIR en la página (fuera del componente):
 *    - Tabs (ej. Tareas | Planes): dos instancias de createUbitsDataTable o una con getData/columns que cambien por tab.
 *    - Indicadores (Total, Por hacer, etc.): HTML propio; calcular con getVisibleRows() o datos filtrados; actualizar al cambiar filtros/tab.
 *    - Rango de fechas / período: selector en la página; filtrar getData() por fecha y refresh().
 *    - Empty "nada en este período": lógica en página; mensaje + botón "Cambiar período".
 *    - "Cargar más": limitar filas en getData y botón que aumente el límite y llame refresh().
 *    - Celdas con dropdown (estado, prioridad): implementar en buildRowHtml.
 *    - Drawer de filtros (opcional): panel lateral "Filtros"; referente en seguimiento (getDrawerHtml, filtros-modal-overlay en ubits-colaborador/tareas/seguimiento.js, aprox. líneas 10-38).
 *
 * 3) Referencia visual y de comportamiento: ubits-colaborador/tareas/seguimiento.html y seguimiento.js.
 *    No modificar ese código; usarlo solo como referencia.
 */
(function () {
    'use strict';

    var defaultI18n = {
        selectAll: 'Seleccionar todo',
        deselectAll: 'Deseleccionar todo',
        selectRow: 'Seleccionar',
        deselectRow: 'Deseleccionar',
        verSeleccionados: 'Ver seleccionados',
        clearFilters: 'Limpiar filtros',
        filtrosAplicados: 'Filtros aplicados',
        buscar: 'Buscar',
        columnasVisibles: 'Columnas visibles'
    };

    function normalizeText(t) {
        if (t == null) return '';
        return String(t).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    function getRowCellText(tr, colId) {
        var td = tr.querySelector('td[data-col="' + colId + '"]');
        if (!td) return '';
        var span = td.querySelector('.ubits-body-sm-regular, .ubits-body-md-regular, span');
        return span ? span.textContent.trim() : td.textContent.trim();
    }

    /**
     * @param {Object} options
     * @param {string} options.containerId - ID del contenedor donde se renderiza la tabla
     * @param {string} [options.tableId] - id del <table>
     * @param {Array<{id: string, label: string, sortable?: boolean, filterable?: boolean}>} options.columns
     * @param {function(): Array} options.getData
     * @param {string} options.rowIdField - clave del row para el id (ej. 'id')
     * @param {function(Object): string} options.buildRowHtml - devuelve HTML de celdas (sin checkbox); si checkboxes, el componente añade la columna
     * @param {Object} [options.features] - { checkboxes, search, filters, verSeleccionados, actionBar, resultsCount, columnsToggle }
     * @param {Object} [options.emptyState] - { message, icon }
     * @param {Object} [options.emptySearchState] - { message, description, buttonText } (empty de búsqueda; por defecto igual que seguimiento: título "No se encontraron resultados", botón "Limpiar búsqueda")
     * @param {Array} [options.actionBarButtons] - [{ id, label, icon, onClick(selectedIds) }]
     * @param {Object} [options.primaryButton] - { text: string, icon?: string, onClick: function() } botón primario en el header (al lado del botón Columnas)
     * @param {Object} [options.i18n]
     * @param {string} [options.title] - título opcional en la barra superior
     */
    function createUbitsDataTable(options) {
        options = options || {};
        var containerId = options.containerId;
        var tableId = options.tableId || 'ubits-data-table';
        var columns = options.columns || [];
        var getData = typeof options.getData === 'function' ? options.getData : function () { return []; };
        var rowIdField = options.rowIdField || 'id';
        var buildRowHtml = typeof options.buildRowHtml === 'function' ? options.buildRowHtml : function () { return ''; };
        var features = options.features || {};
        var emptyState = options.emptyState || { message: 'No hay elementos.', icon: 'far fa-folder-open' };
        var emptySearchState = options.emptySearchState || {
            message: 'No se encontraron resultados',
            description: 'Intenta ajustar tu búsqueda o filtros para encontrar lo que buscas.',
            buttonText: 'Limpiar búsqueda'
        };
        var actionBarButtons = options.actionBarButtons || [];
        var primaryButton = options.primaryButton || null;
        var i18n = Object.assign({}, defaultI18n, options.i18n || {});
        var title = options.title || '';

        var searchQuery = '';
        var filters = {};
        var sortColumn = null;
        var sortDirection = 'asc';
        var viewOnlySelected = false;
        var selectedIds = new Set();
        var columnVisibility = {};
        columns.forEach(function (c) { columnVisibility[c.id] = true; });

        var container = document.getElementById(containerId);
        if (!container) {
            console.error('UBITS Data Table: contenedor no encontrado:', containerId);
            return null;
        }

        var instanceId = tableId.replace(/[^a-z0-9-_]/gi, '-');
        var selectAllId = 'ubits-dt-select-all-' + instanceId;
        var rowCheckClass = 'ubits-dt-row-check-' + instanceId;
        var searchContainerId = 'ubits-dt-search-' + instanceId;
        var emptyStateId = 'ubits-dt-empty-' + instanceId;
        var filterOverlayPrefix = 'ubits-dt-filter-' + instanceId;
        var sortOverlayPrefix = 'ubits-dt-sort-' + instanceId;

        columns.forEach(function (c) { filters[c.id] = filters[c.id] || []; });

        function getTableEl() {
            return container.querySelector('#' + tableId) || container.querySelector('table');
        }
        function getTbody() {
            var t = getTableEl();
            return t ? t.querySelector('tbody') : null;
        }
        function getSelectAllCheckbox() {
            return container.querySelector('#' + selectAllId) || container.querySelector('.ubits-table__th--checkbox input[type="checkbox"]');
        }

        function getTableRows() {
            var tbody = getTbody();
            return tbody ? Array.from(tbody.querySelectorAll('tr')) : [];
        }

        function getVisibleRows() {
            var rows = getTableRows();
            if (features.search && searchQuery.trim()) {
                var q = normalizeText(searchQuery);
                rows = rows.filter(function (r) {
                    return columns.some(function (c) {
                        return normalizeText(getRowCellText(r, c.id)).indexOf(q) >= 0;
                    });
                });
            }
            columns.forEach(function (c) {
                if (c.filterable && filters[c.id] && filters[c.id].length > 0) {
                    var vals = filters[c.id];
                    rows = rows.filter(function (r) {
                        var v = getRowCellText(r, c.id);
                        return vals.indexOf(v) >= 0;
                    });
                }
            });
            if (features.verSeleccionados && viewOnlySelected && features.checkboxes) {
                rows = rows.filter(function (r) {
                    var cb = r.querySelector('.' + rowCheckClass);
                    return cb && cb.checked;
                });
            }
            if (sortColumn) {
                var col = columns.find(function (c) { return c.id === sortColumn; });
                var isNum = col && (col.sortType === 'number' || col.id === 'integrantes');
                rows = rows.slice().sort(function (a, b) {
                    var va = getRowCellText(a, sortColumn);
                    var vb = getRowCellText(b, sortColumn);
                    if (isNum) {
                        var na = parseInt(va, 10) || 0;
                        var nb = parseInt(vb, 10) || 0;
                        return sortDirection === 'asc' ? na - nb : nb - na;
                    }
                    var cmp = (va || '').localeCompare(vb || '', 'es');
                    return sortDirection === 'asc' ? cmp : -cmp;
                });
            } else {
                // Sin orden de columna: mantener orden original de los datos (evita que "Dejar de ver seleccionados" desordene)
                rows = rows.slice().sort(function (a, b) {
                    var ia = parseInt(a.getAttribute('data-row-index'), 10) || 0;
                    var ib = parseInt(b.getAttribute('data-row-index'), 10) || 0;
                    return ia - ib;
                });
            }
            return rows;
        }

        function renderStructure() {
            var html = '<div class="ubits-data-table">';
            if (features.search || features.resultsCount || features.columnsToggle || title || primaryButton) {
                html += '<div class="ubits-dt-header-bar">';
                html += '<div class="ubits-dt-header-left">';
                if (title) html += '<span class="ubits-body-md-bold">' + escapeHtml(title) + '</span>';
                if (features.resultsCount) html += '<span class="ubits-body-sm-regular ubits-dt-results-count" id="' + instanceId + '-results-count">0/0</span>';
                html += '</div>';
                html += '<div class="ubits-dt-header-right">';
                if (features.search) {
                    html += '<button type="button" class="ubits-button ubits-button--secondary ubits-button--md ubits-button--icon-only ubits-dt-search-toggle" aria-label="' + escapeHtml(i18n.buscar) + '" data-tooltip="' + escapeHtml(i18n.buscar) + '" data-tooltip-delay="1000"><i class="far fa-magnifying-glass"></i></button>';
                    html += '<div id="' + searchContainerId + '" class="ubits-dt-search-inline" style="display:none;"></div>';
                }
                if (features.columnsToggle && columns.length > 0) {
                    html += '<button type="button" class="ubits-button ubits-button--secondary ubits-button--md ubits-button--icon-only ubits-dt-columns-toggle" id="' + instanceId + '-columns-toggle" aria-label="' + escapeHtml(i18n.columnasVisibles) + '" data-tooltip="' + escapeHtml(i18n.columnasVisibles) + '" data-tooltip-delay="1000"><i class="far fa-columns-3"></i></button>';
                }
                if (primaryButton && primaryButton.text) {
                    html += '<button type="button" class="ubits-button ubits-button--primary ubits-button--md ubits-dt-primary-btn" id="' + instanceId + '-primary-btn">';
                    if (primaryButton.icon) html += '<i class="far ' + escapeHtml(String(primaryButton.icon).replace(/^fa-/, 'fa-')) + '"></i>';
                    html += '<span>' + escapeHtml(primaryButton.text) + '</span></button>';
                }
                html += '</div></div>';
            }
            if (features.filters) {
                html += '<div class="widget-filtros-aplicados ubits-dt-filtros-aplicados" id="' + instanceId + '-filtros" style="display:none;">';
                html += '<span class="ubits-body-sm-regular">' + escapeHtml(i18n.filtrosAplicados) + ':</span>';
                html += '<div class="filtros-chips-container" id="' + instanceId + '-filtros-chips"></div>';
                html += '<button type="button" class="ubits-button ubits-button--tertiary ubits-button--xs ubits-dt-clear-filters" aria-label="' + escapeHtml(i18n.clearFilters) + '"><i class="far fa-filter-slash"></i><span>' + escapeHtml(i18n.clearFilters) + '</span></button>';
                html += '</div>';
            }
            if (features.actionBar || features.verSeleccionados) {
                html += '<div class="ubits-dt-action-bar" id="' + instanceId + '-action-bar">';
                if (features.verSeleccionados) {
                    html += '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm ubits-dt-ver-seleccionados">';
                    html += '<i class="far fa-eye"></i><span>' + escapeHtml(i18n.verSeleccionados) + '</span></button>';
                }
                if (features.actionBar && actionBarButtons.length) {
                    html += '<div class="ubits-dt-action-buttons">';
                    actionBarButtons.forEach(function (btn) {
                        var btnVariant = (btn.variant === 'error-secondary') ? 'ubits-button--error-secondary' : 'ubits-button--secondary';
                        html += '<button type="button" class="ubits-button ' + btnVariant + ' ubits-button--sm ubits-dt-action-btn" data-action="' + escapeHtml(btn.id) + '"' + '>';
                        if (btn.icon) html += '<i class="far ' + escapeHtml(btn.icon.replace(/^fa-/, 'fa-')) + '"></i>';
                        html += '<span>' + escapeHtml(btn.label) + '</span></button>';
                    });
                    html += '</div>';
                }
                html += '</div>';
            }
            html += '<div class="ubits-dt-table-wrapper">';
            html += '<div class="ubits-table-wrapper ubits-table-wrapper--min-width">';
            html += '<table class="ubits-table" id="' + tableId + '"><thead><tr id="' + instanceId + '-thead-row"></tr></thead><tbody id="' + instanceId + '-tbody"></tbody></table>';
            html += '</div>';
            html += '<div id="' + emptyStateId + '" class="ubits-dt-empty-state" style="display:none;"></div>';
            html += '</div></div>';
            container.innerHTML = html;
        }

        function escapeHtml(text) {
            if (text == null) return '';
            var div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        function renderThead() {
            var tr = container.querySelector('#' + instanceId + '-thead-row');
            if (!tr) return;
            var html = '';
            if (features.checkboxes) {
                html += '<th class="ubits-table__th--checkbox" data-col="checkbox" data-tooltip="' + escapeHtml(i18n.selectAll) + '" data-tooltip-delay="1000">';
                html += '<label class="ubits-checkbox ubits-checkbox--sm" style="display:inline-flex;">';
                html += '<input type="checkbox" class="ubits-checkbox__input" id="' + selectAllId + '" aria-label="' + escapeHtml(i18n.selectAll) + '">';
                html += '<span class="ubits-checkbox__box"><i class="fas fa-check"></i><i class="fas fa-minus"></i></span>';
                html += '<span class="ubits-checkbox__label sr-only" aria-hidden="true">&nbsp;</span></label></th>';
            }
            columns.forEach(function (c) {
                var thClass = 'ubits-dt-th';
                if (c.sortable) thClass += ' ubits-dt-th-sortable';
                if (c.filterable) thClass += ' ubits-dt-th-filterable';
                html += '<th class="' + thClass + '" data-col="' + escapeHtml(c.id) + '">' + escapeHtml(c.label);
                if (c.sortable) {
                    html += ' <button type="button" class="ubits-button ubits-button--tertiary ubits-button--xs ubits-button--icon-only ubits-dt-sort-btn" data-sort="' + escapeHtml(c.id) + '" aria-label="Ordenar por ' + escapeHtml(c.label) + '" data-tooltip="Ordenar por ' + escapeHtml(c.label) + '" data-tooltip-delay="1000"><i class="far fa-arrow-up-arrow-down"></i></button>';
                }
                if (c.filterable) {
                    var filterActive = (filters[c.id] && filters[c.id].length > 0);
                    var filterBtnClass = 'ubits-button ubits-button--tertiary ubits-button--xs ubits-button--icon-only ubits-dt-filter-btn' + (filterActive ? ' ubits-dt-filter-btn--active' : '');
                    html += ' <button type="button" class="' + filterBtnClass + '" data-filter="' + escapeHtml(c.id) + '" aria-label="Filtrar por ' + escapeHtml(c.label) + '" data-tooltip="Filtrar por ' + escapeHtml(c.label) + '" data-tooltip-delay="1000"><i class="far fa-filter"></i></button>';
                }
                html += '</th>';
            });
            tr.innerHTML = html;
            applyColumnVisibility();
        }

        function applyColumnVisibility() {
            if (!features.columnsToggle) return;
            var theadRow = container.querySelector('#' + instanceId + '-thead-row');
            if (theadRow) {
                theadRow.querySelectorAll('th[data-col]').forEach(function (th) {
                    var col = th.getAttribute('data-col');
                    if (col && col !== 'checkbox') {
                        th.style.display = columnVisibility[col] === false ? 'none' : '';
                    }
                });
            }
            getTableRows().forEach(function (tr) {
                tr.querySelectorAll('td[data-col]').forEach(function (td) {
                    var col = td.getAttribute('data-col');
                    if (col && col !== 'checkbox') {
                        td.style.display = columnVisibility[col] === false ? 'none' : '';
                    }
                });
            });
        }

        function renderTbody() {
            var tbody = container.querySelector('#' + instanceId + '-tbody');
            if (!tbody) return;
            var data = getData();
            tbody.innerHTML = '';
            data.forEach(function (row, rowIndex) {
                var id = row[rowIdField] != null ? String(row[rowIdField]) : '';
                var tr = document.createElement('tr');
                tr.setAttribute('data-id', id);
                tr.setAttribute('data-row-index', String(rowIndex));
                var rowHtml = '';
                if (features.checkboxes) {
                    var rowTooltip = selectedIds.has(id) ? i18n.deselectRow : i18n.selectRow;
                    rowHtml += '<td class="ubits-table__td--checkbox" data-col="checkbox" data-tooltip="' + escapeHtml(rowTooltip) + '" data-tooltip-delay="1000">';
                    rowHtml += '<label class="ubits-checkbox ubits-checkbox--sm" style="display:inline-flex;">';
                    rowHtml += '<input type="checkbox" class="ubits-checkbox__input ' + rowCheckClass + '" data-id="' + escapeHtml(id) + '">';
                    rowHtml += '<span class="ubits-checkbox__box"><i class="fas fa-check"></i></span>';
                    rowHtml += '<span class="ubits-checkbox__label sr-only" aria-hidden="true">&nbsp;</span></label></td>';
                }
                rowHtml += buildRowHtml(row);
                tr.innerHTML = rowHtml;
                tbody.appendChild(tr);
                var cb = tr.querySelector('.' + rowCheckClass);
                if (cb) {
                    if (selectedIds.has(id)) cb.checked = true;
                    cb.addEventListener('change', function () {
                        var rid = this.getAttribute('data-id');
                        if (this.checked) selectedIds.add(rid);
                        else selectedIds.delete(rid);
                        var td = this.closest('td.ubits-table__td--checkbox');
                        if (td) td.setAttribute('data-tooltip', this.checked ? i18n.deselectRow : i18n.selectRow);
                        updateSelectAll();
                        updateResultsCount();
                        updateActionBar();
                        updateVerSeleccionadosBtn();
                    });
                }
            });
            applyColumnVisibility();
        }

        function applyVisibility() {
            var tbody = getTbody();
            if (!tbody) return;
            var visible = getVisibleRows();
            var visibleSet = new Set(visible);
            var allRows = getTableRows();
            allRows.forEach(function (r) {
                r.style.display = visibleSet.has(r) ? '' : 'none';
            });
            var fragment = document.createDocumentFragment();
            visible.forEach(function (r) { fragment.appendChild(r); });
            allRows.forEach(function (r) {
                if (!visibleSet.has(r)) fragment.appendChild(r);
            });
            tbody.innerHTML = '';
            tbody.appendChild(fragment);
            updateResultsCount();
            updateEmptyState();
            updateSelectAll();
        }

        function updateSelectAll() {
            var all = getSelectAllCheckbox();
            if (!all) return;
            var visible = getVisibleRows();
            var checkedCount = visible.filter(function (r) {
                var cb = r.querySelector('.' + rowCheckClass);
                return cb && cb.checked;
            }).length;
            all.checked = visible.length > 0 && checkedCount === visible.length;
            all.indeterminate = checkedCount > 0 && checkedCount < visible.length;
            var th = all.closest('th');
            if (th) th.setAttribute('data-tooltip', checkedCount > 0 ? i18n.deselectAll : i18n.selectAll);
        }

        function updateResultsCount() {
            var el = container.querySelector('.ubits-dt-results-count');
            if (!el) return;
            var total = getTableRows().length;
            var visible = getVisibleRows().length;
            el.textContent = visible + '/' + total;
        }

        function updateActionBar() {
            var bar = container.querySelector('.ubits-dt-action-bar');
            if (!bar) return;
            var n = selectedIds.size;
            bar.classList.toggle('is-visible', n > 0);
        }

        function updateVerSeleccionadosBtn() {
            var btn = container.querySelector('.ubits-dt-ver-seleccionados');
            if (!btn) return;
            var n = selectedIds.size;
            var icon = btn.querySelector('i');
            var span = btn.querySelector('span');
            if (n === 0) {
                viewOnlySelected = false;
                if (icon) icon.className = 'far fa-eye';
                if (span) span.textContent = i18n.verSeleccionados;
                btn.classList.remove('active');
            } else {
                if (viewOnlySelected) {
                    if (icon) icon.className = 'far fa-eye-slash';
                    if (span) span.textContent = 'Dejar de ver seleccionados (' + n + ')';
                    btn.classList.add('active');
                } else {
                    if (icon) icon.className = 'far fa-eye';
                    if (span) span.textContent = i18n.verSeleccionados;
                    btn.classList.remove('active');
                }
            }
        }

        function updateEmptyState() {
            var wrapper = container.querySelector('.ubits-dt-table-wrapper');
            var tableWrap = wrapper ? wrapper.querySelector('.ubits-table-wrapper') : null;
            var emptyEl = container.querySelector('#' + emptyStateId);
            if (!wrapper || !emptyEl) return;
            var visible = getVisibleRows();
            var hasData = getTableRows().length > 0;
            var hasSearchOrFilter = (features.search && searchQuery.trim()) || (features.filters && Object.keys(filters).some(function (k) { return (filters[k] || []).length > 0; }));
            if (!hasData) {
                if (tableWrap) tableWrap.style.display = 'none';
                emptyEl.style.display = 'flex';
                if (typeof loadEmptyState === 'function') {
                    loadEmptyState(emptyStateId, {
                        icon: (emptyState.icon || 'fa-folder-open').replace(/^far\s+/, ''),
                        iconSize: 'lg',
                        title: emptyState.message || 'No hay elementos.',
                        description: emptyState.description || ' '
                    });
                } else {
                    emptyEl.innerHTML = '<p class="ubits-body-md-regular">' + escapeHtml(emptyState.message) + '</p>';
                }
            } else if (visible.length === 0 && hasSearchOrFilter) {
                if (tableWrap) tableWrap.style.display = 'none';
                emptyEl.style.display = 'flex';
                if (typeof loadEmptyState === 'function') {
                    var searchEmptyOpts = {
                        icon: 'fa-search',
                        iconSize: 'lg',
                        title: emptySearchState.message || 'No se encontraron resultados',
                        description: emptySearchState.description || 'Intenta ajustar tu búsqueda o filtros para encontrar lo que buscas.',
                        buttons: {
                            secondary: {
                                text: emptySearchState.buttonText || 'Limpiar búsqueda',
                                icon: 'fa-times',
                                onClick: function () { /* se asigna con listener abajo */ }
                            }
                        }
                    };
                    loadEmptyState(emptyStateId, searchEmptyOpts);
                    setTimeout(function () {
                        var clearBtn = emptyEl.querySelector('.ubits-empty-state__footer .ubits-button--secondary');
                        if (clearBtn) {
                            clearBtn.addEventListener('click', function (e) {
                                e.preventDefault();
                                e.stopPropagation();
                                searchQuery = '';
                                columns.forEach(function (c) { filters[c.id] = []; });
                                var searchCont = document.getElementById(searchContainerId);
                                if (searchCont) {
                                    searchCont.innerHTML = '';
                                    searchCont.style.display = 'none';
                                }
                                var toggle = container.querySelector('.ubits-dt-search-toggle');
                                if (toggle) toggle.style.display = 'flex';
                                refresh();
                            });
                        }
                    }, 50);
                } else {
                    emptyEl.innerHTML = '<p class="ubits-body-md-regular">' + escapeHtml(emptySearchState.message) + '</p>';
                }
            } else {
                if (tableWrap) tableWrap.style.display = '';
                emptyEl.style.display = 'none';
                emptyEl.innerHTML = '';
            }
        }

        function renderFiltrosAplicados() {
            var wrap = container.querySelector('#' + instanceId + '-filtros');
            var chipsCont = container.querySelector('#' + instanceId + '-filtros-chips');
            if (!wrap || !chipsCont) return;
            var chips = [];
            if (features.search && searchQuery.trim()) {
                chips.push({
                    type: 'search',
                    label: 'Búsqueda',
                    value: searchQuery,
                    remove: function () {
                        searchQuery = '';
                        var searchCont = document.getElementById(searchContainerId);
                        if (searchCont) { searchCont.innerHTML = ''; searchCont.style.display = 'none'; }
                        var toggle = container.querySelector('.ubits-dt-search-toggle');
                        if (toggle) toggle.style.display = 'flex';
                        refresh();
                    }
                });
            }
            columns.forEach(function (c) {
                if (!c.filterable) return;
                (filters[c.id] || []).forEach(function (val, idx) {
                    chips.push({
                        type: c.id,
                        label: c.label,
                        value: val,
                        remove: function () {
                            filters[c.id] = filters[c.id].filter(function (_, i) { return i !== idx; });
                            refresh();
                        }
                    });
                });
            });
            if (chips.length > 0) {
                wrap.style.display = 'flex';
                chipsCont.innerHTML = chips.map(function (chip, index) {
                    var labelVal = (chip.label + ': ' + chip.value).replace(/"/g, '&quot;');
                    return '<span class="ubits-chip ubits-chip--xs ubits-chip--close ubits-dt-chip" data-chip-index="' + index + '" data-tooltip="' + labelVal + '">' +
                        '<span class="ubits-chip__text">' + escapeHtml(chip.label + ': ' + chip.value) + '</span>' +
                        '<button type="button" class="ubits-chip__close" data-chip-index="' + index + '" aria-label="Quitar filtro"><i class="far fa-times"></i></button></span>';
                }).join('');
                chipsCont.querySelectorAll('.ubits-chip__close').forEach(function (btn) {
                    btn.addEventListener('click', function () {
                        var idx = parseInt(this.getAttribute('data-chip-index'), 10);
                        if (!isNaN(idx) && chips[idx] && typeof chips[idx].remove === 'function') chips[idx].remove();
                    });
                });
                if (typeof initTooltip === 'function') initTooltip('#' + instanceId + '-filtros-chips .ubits-chip[data-tooltip]');
            } else {
                wrap.style.display = 'none';
                chipsCont.innerHTML = '';
            }
        }

        function attachSelectAllListener() {
            var all = getSelectAllCheckbox();
            if (!all) return;
            all.addEventListener('change', function () {
                var visible = getVisibleRows();
                var checkedCount = visible.filter(function (r) {
                    var cb = r.querySelector('.' + rowCheckClass);
                    return cb && cb.checked;
                }).length;
                if (this.checked && checkedCount > 0 && checkedCount < visible.length) {
                    this.checked = false;
                    this.indeterminate = false;
                    visible.forEach(function (r) {
                        var cb = r.querySelector('.' + rowCheckClass);
                        if (cb) { cb.checked = false; selectedIds.delete(cb.getAttribute('data-id')); }
                    });
                } else if (this.checked) {
                    visible.forEach(function (r) {
                        var cb = r.querySelector('.' + rowCheckClass);
                        if (cb) { cb.checked = true; selectedIds.add(cb.getAttribute('data-id')); }
                    });
                } else {
                    visible.forEach(function (r) {
                        var cb = r.querySelector('.' + rowCheckClass);
                        if (cb) { cb.checked = false; selectedIds.delete(cb.getAttribute('data-id')); }
                    });
                }
                updateResultsCount();
                updateSelectAll();
                updateActionBar();
                updateVerSeleccionadosBtn();
            });
        }

        function attachHeaderDelegation() {
            var thead = container.querySelector('thead');
            if (!thead) return;
            thead.addEventListener('click', function (e) {
                var sortBtn = e.target.closest('.ubits-dt-sort-btn');
                if (sortBtn && typeof window.getDropdownMenuHtml === 'function' && typeof window.openDropdownMenu === 'function') {
                    e.preventDefault();
                    e.stopPropagation();
                    var col = sortBtn.getAttribute('data-sort');
                    var c = columns.find(function (x) { return x.id === col; });
                    var isNum = c && (c.sortType === 'number' || c.id === 'integrantes');
                    var currentDir = (sortColumn === col) ? sortDirection : null;
                    var options = [
                        { text: isNum ? 'Mayor a menor' : 'Z a A', value: 'desc', leftIcon: 'arrow-up', selected: currentDir === 'desc' },
                        { text: isNum ? 'Menor a mayor' : 'A a Z', value: 'asc', leftIcon: 'arrow-down', selected: currentDir === 'asc' }
                    ];
                    var overlayId = sortOverlayPrefix + '-' + col;
                    var existing = document.getElementById(overlayId);
                    if (existing) existing.remove();
                    var sortHtml = window.getDropdownMenuHtml({ overlayId: overlayId, options: options });
                    document.body.insertAdjacentHTML('beforeend', sortHtml);
                    var sortOverlayEl = document.getElementById(overlayId);
                    if (sortOverlayEl) {
                        sortOverlayEl.querySelectorAll('.ubits-dropdown-menu__option').forEach(function (opt) {
                            opt.addEventListener('click', function () {
                                var val = this.getAttribute('data-value');
                                sortColumn = col;
                                sortDirection = val || 'asc';
                                refresh();
                                if (typeof window.closeDropdownMenu === 'function') window.closeDropdownMenu(overlayId);
                            });
                        });
                        sortOverlayEl.addEventListener('click', function (ev) {
                            if (ev.target === sortOverlayEl && typeof window.closeDropdownMenu === 'function') window.closeDropdownMenu(overlayId);
                        });
                    }
                    window.openDropdownMenu(overlayId, sortBtn);
                }
                var filterBtn = e.target.closest('.ubits-dt-filter-btn');
                if (filterBtn && typeof window.getDropdownMenuHtml === 'function' && typeof window.openDropdownMenu === 'function') {
                    e.preventDefault();
                    e.stopPropagation();
                    var col = filterBtn.getAttribute('data-filter');
                    var currentVals = filters[col] || [];
                    var allVals = [];
                    getTableRows().forEach(function (r) {
                        var v = getRowCellText(r, col);
                        if (v && allVals.indexOf(v) === -1) allVals.push(v);
                    });
                    allVals.sort(function (a, b) { return (a || '').localeCompare(b || '', 'es'); });
                    var options = allVals.map(function (v) {
                        return { text: v, value: v, checkbox: true, selected: currentVals.indexOf(v) >= 0 };
                    });
                    var overlayId = filterOverlayPrefix + '-' + col;
                    var contentId = overlayId + '-content';
                    var existing = document.getElementById(overlayId);
                    if (existing) existing.remove();
                    var filterHtml = window.getDropdownMenuHtml({
                        overlayId: overlayId,
                        contentId: contentId,
                        options: options,
                        footerPrimaryLabel: 'Aplicar',
                        footerSecondaryLabel: 'Cancelar',
                        footerPrimaryId: overlayId + '-footer-primary',
                        footerSecondaryId: overlayId + '-footer-secondary'
                    });
                    document.body.insertAdjacentHTML('beforeend', filterHtml);
                    var overlayEl = document.getElementById(overlayId);
                    if (overlayEl) {
                        var content = overlayEl.querySelector('.ubits-dropdown-menu__content');
                        if (content) content.addEventListener('click', function (ev) { ev.stopPropagation(); });
                        var footerPrimary = document.getElementById(overlayId + '-footer-primary');
                        if (footerPrimary) {
                            footerPrimary.addEventListener('click', function () {
                                var inputs = overlayEl.querySelectorAll('.ubits-dropdown-menu__option input.ubits-checkbox__input:checked');
                                filters[col] = Array.from(inputs).map(function (inp) { return inp.getAttribute('data-value'); }).filter(Boolean);
                                refresh();
                                if (typeof window.closeDropdownMenu === 'function') window.closeDropdownMenu(overlayId);
                            });
                        }
                        var footerSecondary = document.getElementById(overlayId + '-footer-secondary');
                        if (footerSecondary) {
                            footerSecondary.addEventListener('click', function () {
                                if (typeof window.closeDropdownMenu === 'function') window.closeDropdownMenu(overlayId);
                            });
                        }
                        overlayEl.addEventListener('click', function (ev) {
                            if (ev.target === overlayEl && typeof window.closeDropdownMenu === 'function') window.closeDropdownMenu(overlayId);
                        });
                    }
                    window.openDropdownMenu(overlayId, filterBtn);
                }
            });
        }

        function attachClearFilters() {
            var btn = container.querySelector('.ubits-dt-clear-filters');
            if (!btn) return;
            btn.addEventListener('click', function () {
                columns.forEach(function (c) { filters[c.id] = []; });
                searchQuery = '';
                var searchCont = document.getElementById(searchContainerId);
                if (searchCont) { searchCont.innerHTML = ''; searchCont.style.display = 'none'; }
                var toggle = container.querySelector('.ubits-dt-search-toggle');
                if (toggle) toggle.style.display = 'flex';
                refresh();
            });
        }

        function attachVerSeleccionados() {
            var btn = container.querySelector('.ubits-dt-ver-seleccionados');
            if (!btn) return;
            btn.addEventListener('click', function () {
                if (selectedIds.size === 0) return;
                viewOnlySelected = !viewOnlySelected;
                applyVisibility();
                updateVerSeleccionadosBtn();
            });
        }

        function attachActionButtons() {
            container.querySelectorAll('.ubits-dt-action-btn').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    var actionId = this.getAttribute('data-action');
                    var btnConfig = actionBarButtons.find(function (b) { return b.id === actionId; });
                    if (btnConfig && typeof btnConfig.onClick === 'function') {
                        btnConfig.onClick(Array.from(selectedIds));
                    }
                });
            });
        }

        function attachPrimaryButton() {
            if (!primaryButton || !primaryButton.text) return;
            var btn = container.querySelector('#' + instanceId + '-primary-btn');
            if (!btn || typeof primaryButton.onClick !== 'function') return;
            btn.addEventListener('click', function () {
                primaryButton.onClick();
            });
        }

        function attachColumnsToggle() {
            if (!features.columnsToggle || columns.length === 0) return;
            var btn = document.getElementById(instanceId + '-columns-toggle');
            if (!btn || typeof window.getDropdownMenuHtml !== 'function' || typeof window.openDropdownMenu !== 'function') return;
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                var overlayId = instanceId + '-columns-overlay';
                var overlayEl = document.getElementById(overlayId);
                if (overlayEl && overlayEl.style.display === 'block') {
                    if (typeof window.closeDropdownMenu === 'function') window.closeDropdownMenu(overlayId);
                    return;
                }
                var options = columns.map(function (c) {
                    return { text: c.label, value: c.id, checkbox: true, selected: columnVisibility[c.id] !== false };
                });
                if (document.getElementById(overlayId)) document.getElementById(overlayId).remove();
                var html = window.getDropdownMenuHtml({ overlayId: overlayId, options: options });
                document.body.insertAdjacentHTML('beforeend', html);
                overlayEl = document.getElementById(overlayId);
                if (overlayEl) {
                    var content = overlayEl.querySelector('.ubits-dropdown-menu__content');
                    if (content) content.addEventListener('click', function (ev) { ev.stopPropagation(); });
                    overlayEl.querySelectorAll('.ubits-dropdown-menu__option input.ubits-checkbox__input').forEach(function (cb) {
                        cb.addEventListener('change', function () {
                            var col = this.getAttribute('data-value');
                            if (col) {
                                columnVisibility[col] = this.checked;
                                applyColumnVisibility();
                            }
                        });
                    });
                    overlayEl.addEventListener('click', function (ev) {
                        if (ev.target === overlayEl && typeof window.closeDropdownMenu === 'function') window.closeDropdownMenu(overlayId);
                    });
                    window.openDropdownMenu(overlayId, btn);
                }
            });
        }

        function attachSearch() {
            var toggle = container.querySelector('.ubits-dt-search-toggle');
            var searchCont = document.getElementById(searchContainerId);
            if (!toggle || !searchCont) return;
            toggle.addEventListener('click', function () {
                if (searchCont.style.display === 'none' || !searchCont.innerHTML.trim()) {
                    toggle.style.display = 'none';
                    searchCont.style.display = 'flex';
                    if (typeof createInput === 'function') {
                        createInput({
                            containerId: searchContainerId,
                            type: 'search',
                            placeholder: 'Buscar...',
                            showLabel: false
                        });
                        setTimeout(function () {
                            var input = searchCont.querySelector('input');
                            if (input) {
                                input.focus();
                                input.addEventListener('input', function () {
                                    searchQuery = this.value || '';
                                    refresh();
                                });
                            }
                        }, 100);
                    }
                }
            });
        }

        function refresh() {
            renderThead();
            renderTbody();
            applyVisibility();
            renderFiltrosAplicados();
            updateSelectAll();
            updateResultsCount();
            updateActionBar();
            updateVerSeleccionadosBtn();
            attachSelectAllListener();
            if (typeof initTooltip === 'function') {
                initTooltip('#' + tableId + ' thead [data-tooltip]');
                initTooltip('#' + instanceId + '-tbody .ubits-table__td--checkbox[data-tooltip]');
            }
        }

        renderStructure();
        renderThead();
        renderTbody();
        applyVisibility();
        renderFiltrosAplicados();
        updateSelectAll();
        updateResultsCount();
        updateActionBar();
        updateVerSeleccionadosBtn();
        attachSelectAllListener();
        attachHeaderDelegation();
        attachClearFilters();
        attachVerSeleccionados();
        attachActionButtons();
        attachColumnsToggle();
        attachPrimaryButton();
        attachSearch();
        if (typeof initTooltip === 'function') {
            initTooltip('#' + tableId + ' thead [data-tooltip]');
            initTooltip('#' + instanceId + '-tbody .ubits-table__td--checkbox[data-tooltip]');
            if (features.columnsToggle) initTooltip('#' + instanceId + '-columns-toggle');
        }

        return {
            getSelectedIds: function () { return Array.from(selectedIds); },
            getVisibleRows: function () { return getVisibleRows(); },
            setFilter: function (col, values) {
                if (filters[col] !== undefined) filters[col] = values || [];
                refresh();
            },
            refresh: refresh
        };
    }

    window.createUbitsDataTable = createUbitsDataTable;
})();
