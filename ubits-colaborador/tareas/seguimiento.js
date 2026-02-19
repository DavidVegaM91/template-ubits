/* ========================================
   SEGUIMIENTO - Página de seguimiento
   Empresa: Fiqsha Decoraciones S.A.S.
   Base de datos: tareas-base-unificada.js (TAREAS_PLANES_DB) — única fuente
   ======================================== */

(function() {
    'use strict';

    // Inyectar drawer de filtros (componente oficial) y modales (modal.js getModalHtml)
    var modalsContainer = document.getElementById('seguimiento-modals-container');
    if (modalsContainer) {
        var filtrosBody = '<div class="filtros-group"><label class="ubits-body-sm-bold filtros-label">Buscar asignados</label><div id="filtros-buscar-personas"></div></div>' +
            '<div class="filtros-group"><label class="ubits-body-sm-bold filtros-label">Área del asignado</label><div id="filtros-area-asignado"></div></div>' +
            '<div class="filtros-group"><label class="ubits-body-sm-bold filtros-label">Área del creador</label><div id="filtros-area-creador"></div></div>' +
            '<div class="filtros-group filtros-group-row" id="filtros-group-row">' +
            '<div class="filtros-select-wrap" data-filter-type="estado">' +
            '<label class="ubits-body-sm-bold filtros-label" for="filtros-estado-trigger">Estado</label>' +
            '<div class="filtros-select-trigger ubits-input ubits-input--md" id="filtros-estado-trigger" role="combobox" aria-expanded="false" aria-haspopup="listbox" aria-controls="filtros-estado-dropdown" tabindex="0">' +
            '<span class="filtros-select-trigger-text" id="filtros-estado-trigger-text">Seleccionar estado</span><i class="far fa-chevron-down filtros-select-chevron"></i></div>' +
            '<div class="filtros-select-dropdown" id="filtros-estado-dropdown" role="listbox" aria-hidden="true">' +
            '<div class="filtros-checkbox-list" id="filtros-estado">' +
            '<label class="filtros-checkbox-option"><input type="checkbox" value="Iniciada"><span class="ubits-body-sm-regular">Iniciada</span></label>' +
            '<label class="filtros-checkbox-option"><input type="checkbox" value="Vencida"><span class="ubits-body-sm-regular">Vencida</span></label>' +
            '<label class="filtros-checkbox-option"><input type="checkbox" value="Finalizada"><span class="ubits-body-sm-regular">Finalizada</span></label></div></div></div>' +
            '<div class="filtros-select-wrap" id="filtros-prioridad-wrap" data-filter-type="prioridad">' +
            '<label class="ubits-body-sm-bold filtros-label" for="filtros-prioridad-trigger">Prioridad</label>' +
            '<div class="filtros-select-trigger ubits-input ubits-input--md" id="filtros-prioridad-trigger" role="combobox" aria-expanded="false" aria-haspopup="listbox" aria-controls="filtros-prioridad-dropdown" tabindex="0">' +
            '<span class="filtros-select-trigger-text" id="filtros-prioridad-trigger-text">Seleccionar prioridad</span><i class="far fa-chevron-down filtros-select-chevron"></i></div>' +
            '<div class="filtros-select-dropdown" id="filtros-prioridad-dropdown" role="listbox" aria-hidden="true">' +
            '<div class="filtros-checkbox-list" id="filtros-prioridad">' +
            '<label class="filtros-checkbox-option"><input type="checkbox" value="Alta"><span class="ubits-body-sm-regular">Alta</span></label>' +
            '<label class="filtros-checkbox-option"><input type="checkbox" value="Media"><span class="ubits-body-sm-regular">Media</span></label>' +
            '<label class="filtros-checkbox-option"><input type="checkbox" value="Baja"><span class="ubits-body-sm-regular">Baja</span></label></div></div></div></div>';
        var filtrosFooter = '<button type="button" class="ubits-button ubits-button--secondary ubits-button--md" id="filtros-limpiar">Limpiar filtros</button>' +
            '<button type="button" class="ubits-button ubits-button--primary ubits-button--md" id="filtros-aplicar">Aplicar filtros</button>';
        if (typeof getDrawerHtml === 'function') {
            modalsContainer.innerHTML += getDrawerHtml({ overlayId: 'filtros-modal-overlay', title: 'Filtros', bodyHtml: filtrosBody, footerHtml: filtrosFooter, size: 'md', closeButtonId: 'filtros-modal-close' });
        }

        if (typeof getModalHtml === 'function') {
            var datePickerBody = '<div class="date-picker-inputs"><div class="date-picker-input-group"><label class="ubits-body-sm-regular date-picker-label">Fecha de inicio</label><div class="date-picker-input-wrapper"><input type="text" class="date-picker-input" id="date-picker-fecha-inicio" placeholder="DD/MM/YYYY"></div></div>' +
                '<span class="date-picker-separator">-</span><div class="date-picker-input-group"><label class="ubits-body-sm-regular date-picker-label">Fecha de fin</label><div class="date-picker-input-wrapper"><input type="text" class="date-picker-input" id="date-picker-fecha-fin" placeholder="DD/MM/YYYY"></div></div></div>' +
                '<div class="date-picker-calendar" id="date-picker-calendar"></div>';
            var datePickerFooter = '<button type="button" class="ubits-button ubits-button--secondary ubits-button--md" id="date-picker-cancelar"><span>Cancelar</span></button>' +
                '<button type="button" class="ubits-button ubits-button--primary ubits-button--md" id="date-picker-aplicar"><span>Aplicar</span></button>';
            modalsContainer.innerHTML += getModalHtml({ overlayId: 'date-picker-overlay', title: 'Fecha personalizada', bodyHtml: datePickerBody, footerHtml: datePickerFooter, size: 'sm', contentId: 'date-picker-modal', closeButtonId: 'date-picker-close', overlayClass: 'date-picker-overlay', contentClass: 'date-picker-modal-content', headerClass: 'date-picker-modal-header', bodyClass: 'date-picker-modal-body', footerClass: 'date-picker-modal-footer' });

            var deleteBody = '<p class="ubits-body-md-regular">¿Estás seguro de que deseas eliminar <strong id="delete-count">0</strong> elemento(s) seleccionado(s)?</p><p class="ubits-body-sm-regular" style="color: var(--ubits-fg-1-medium);">Esta acción no se puede deshacer.</p><div class="delete-confirm-group" style="margin-top: var(--gap-lg, 16px);"><label class="ubits-body-sm-regular" for="delete-modal-type-input">Escriba <strong>eliminar</strong> para habilitar el botón:</label><input type="text" id="delete-modal-type-input" class="ubits-input delete-modal-type-input" placeholder="Escriba la palabra de confirmación" autocomplete="off" style="margin-top: var(--gap-sm, 8px); width: 100%; padding: var(--padding-sm, 8px) var(--padding-md, 12px); border: 1px solid var(--ubits-border-1); border-radius: var(--border-radius-sm, 8px); font-size: var(--font-size-sm, 13px); color: var(--ubits-fg-1-high); box-sizing: border-box;"></div>';
            var deleteFooter = '<button type="button" class="ubits-button ubits-button--secondary ubits-button--md" id="delete-modal-cancel">Cancelar</button><button type="button" class="ubits-button ubits-button--error ubits-button--md" id="delete-modal-confirm" disabled>Eliminar</button>';
            modalsContainer.innerHTML += getModalHtml({ overlayId: 'delete-modal-overlay', title: 'Confirmar eliminación', bodyHtml: deleteBody, footerHtml: deleteFooter, size: 'sm', closeButtonId: 'delete-modal-close' });

            var reabrirBody = '<p class="ubits-body-md-regular" id="reabrir-plan-message">Al reabrir este(s) plan(es), las tareas en estado Iniciada se marcarán como Finalizadas. ¿Continuar?</p>';
            var reabrirFooter = '<button type="button" class="ubits-button ubits-button--secondary ubits-button--md" id="reabrir-plan-cancel">Cancelar</button><button type="button" class="ubits-button ubits-button--primary ubits-button--md" id="reabrir-plan-confirm">Continuar</button>';
            modalsContainer.innerHTML += getModalHtml({ overlayId: 'reabrir-plan-overlay', title: 'Cambiar estado del plan', bodyHtml: reabrirBody, footerHtml: reabrirFooter, size: 'xs', titleId: 'reabrir-plan-title', closeButtonId: 'reabrir-plan-close' });

            var planFechaBody = '<div class="date-picker-input-group"><label class="ubits-body-sm-regular date-picker-label">Nueva fecha de finalización</label><div class="date-picker-input-wrapper"><input type="text" class="date-picker-input" id="plan-fecha-input" placeholder="DD/MM/YYYY"></div></div><div class="date-picker-calendar" id="plan-fecha-calendar"></div>';
            var planFechaFooter = '<button type="button" class="ubits-button ubits-button--secondary ubits-button--md" id="plan-fecha-cancel"><span>Cancelar</span></button><button type="button" class="ubits-button ubits-button--primary ubits-button--md" id="plan-fecha-aplicar"><span>Aplicar</span></button>';
            modalsContainer.innerHTML += getModalHtml({ overlayId: 'plan-fecha-overlay', title: 'Cambiar fecha de finalización', bodyHtml: planFechaBody, footerHtml: planFechaFooter, size: 'sm', contentId: 'plan-fecha-modal', titleId: 'plan-fecha-modal-title', closeButtonId: 'plan-fecha-close', overlayClass: 'date-picker-overlay', contentClass: 'date-picker-modal-content', headerClass: 'date-picker-modal-header', bodyClass: 'date-picker-modal-body', footerClass: 'date-picker-modal-footer' });
        }
    }

    // Los datos se cargan desde TAREAS_PLANES_DB (tareas-base-unificada.js)
    // 3.2.2 Columnas disponibles en tab Tareas (selector con checkboxes 3.2.1)
    const COLUMN_IDS_TAREAS = ['id', 'nombre', 'asignado', 'creador', 'areaAsignado', 'areaCreador', 'estado', 'prioridad', 'plan', 'fechaCreacion', 'fechaFinalizacion', 'comentarios'];
    // 3.2.3 Por defecto mostrar: Nombre, Asignado, Área asignado, Estado, Prioridad, Fecha de vencimiento. Ocultas por defecto: Creador, Área del creador.
    const VISIBLE_BY_DEFAULT_TAREAS = ['nombre', 'asignado', 'areaAsignado', 'estado', 'prioridad', 'fechaFinalizacion'];
    const COLUMN_IDS_PLANES = ['id', 'nombre', 'asignados', 'creador', 'estado', 'avance', 'fechaCreacion', 'fechaFinalizacion'];
    const VISIBLE_BY_DEFAULT_PLANES = ['nombre', 'asignados', 'estado', 'avance', 'fechaCreacion', 'fechaFinalizacion'];

    // Permisos (demo: todos habilitados; en producción vendrían del backend)
    const TASK_EDIT = true;
    const TASK_DELETE = true;

    // Límite de fechas en calendarios: máximo 3 años en el futuro (solo páginas de seguimiento)
    function getSeguimientoCalendarMaxDate() {
        var d = new Date();
        d.setFullYear(d.getFullYear() + 3);
        d.setHours(23, 59, 59, 999);
        return d;
    }

    // Formato de números para indicadores: < 10k con comas (1,556); >= 10k en K (10,5 K); >= 1M en M (2,7 M)
    function formatIndicatorNumber(n) {
        if (n == null || typeof n !== 'number' || isNaN(n)) return '0';
        if (n >= 1000000) {
            var val = n / 1000000;
            return (val % 1 === 0 ? val : val.toFixed(1).replace('.', ',')) + ' M';
        }
        if (n >= 10000) {
            var val = n / 1000;
            return (val % 1 === 0 ? val : val.toFixed(1).replace('.', ',')) + ' K';
        }
        return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    // Estado global
    let activeTab = 'tareas'; // 'tareas' | 'planes'
    let SEGUIMIENTO_DATA = [];
    let filteredData = [];
    let columnVisibility = {};
    let currentPage = 1;
    let itemsPerPage = 10;
    let viewOnlySelected = false;
    let selectedIds = new Set();
    let currentSort = { column: 'fechaCreacion', direction: 'desc' }; // Por defecto: más reciente primero
    // Filtros por tab: cada tab (Tareas / Planes) tiene su propio estado de filtros
    function getDefaultFilters() {
        return {
            tipoActividad: [],
            plan: [],
            persona: [],
            username: [],
            areaAsignado: [],
            areaCreador: [],
            lider: [],
            nombre: [],
            creador: [],
            estado: [],
            prioridad: [],
            fechaCreacionDesde: null,
            fechaCreacionHasta: null,
            fechaVencimientoDesde: null,
            fechaVencimientoHasta: null,
            periodo: '7'
        };
    }
    let filtersByTab = {
        tareas: getDefaultFilters(),
        planes: getDefaultFilters()
    };
    let currentFilters = filtersByTab.tareas; // Referencia al filtro del tab activo
    let searchQuery = '';
    let isSearchMode = false; // estado del buscador (lupa) para poder resetearlo al limpiar desde empty state o chip

    // Posicionar menú detectando viewport
    function positionMenuSmartly(menu, buttonRect, menuWidth = 200, menuHeight = 150) {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const padding = 16; // Padding mínimo desde los bordes
        
        // Calcular posición inicial (debajo del botón)
        let left = buttonRect.left;
        let top = buttonRect.bottom + 4;
        
        // Asegurar que el menú no se salga por la derecha
        if (left + menuWidth > viewportWidth - padding) {
            // Intentar alinear a la derecha del botón
            left = buttonRect.right - menuWidth;
            
            // Si aún se sale, pegarlo al borde derecho con padding
            if (left < padding) {
                left = viewportWidth - menuWidth - padding;
            }
        }
        
        // Asegurar que el menú no se salga por la izquierda
        if (left < padding) {
            left = padding;
        }
        
        // Asegurar que el menú no se salga por abajo
        if (top + menuHeight > viewportHeight - padding) {
            // Intentar mostrar arriba del botón
            const spaceAbove = buttonRect.top - padding;
            const spaceBelow = viewportHeight - buttonRect.bottom - padding;
            
            if (spaceAbove >= menuHeight || spaceAbove > spaceBelow) {
                // Mostrar arriba
                top = buttonRect.top - menuHeight - 4;
            } else {
                // Ajustar altura si es necesario (limitar al espacio disponible)
                top = viewportHeight - menuHeight - padding;
            }
        }
        
        // Asegurar que el menú no se salga por arriba
        if (top < padding) {
            top = padding;
        }
        
        // Aplicar posición
        menu.style.left = Math.max(padding, Math.min(left, viewportWidth - menuWidth - padding)) + 'px';
        menu.style.top = Math.max(padding, Math.min(top, viewportHeight - menuHeight - padding)) + 'px';
    }

    // Generar datos: única fuente TAREAS_PLANES_DB (tareas-base-unificada.js).
    function generateData() {
        if (typeof TAREAS_PLANES_DB === 'undefined') {
            console.warn('tareas-base-unificada.js no cargado.');
            return [];
        }
        if (typeof SEGUIMIENTO_SCOPE !== 'undefined' && SEGUIMIENTO_SCOPE === 'leader' && typeof SEGUIMIENTO_CURRENT_LEADER !== 'undefined') {
            return TAREAS_PLANES_DB.getActividadesParaLider(SEGUIMIENTO_CURRENT_LEADER);
        }
        return TAREAS_PLANES_DB.getActividadesSeguimiento();
    }

    // Obtener IDs de columnas y visibilidad por defecto según tab activo
    function getColumnIds() {
        return activeTab === 'planes' ? COLUMN_IDS_PLANES : COLUMN_IDS_TAREAS;
    }
    function getVisibleByDefault() {
        return activeTab === 'planes' ? VISIBLE_BY_DEFAULT_PLANES : VISIBLE_BY_DEFAULT_TAREAS;
    }
    function getDataForCurrentTab() {
        if (!SEGUIMIENTO_DATA.length) return [];
        const tipo = activeTab === 'planes' ? 'plan' : 'tarea';
        return SEGUIMIENTO_DATA.filter(r => r.tipo === tipo);
    }

    // Inicializar visibilidad de columnas (según tab activo)
    function initColumnVisibility() {
        const ids = getColumnIds();
        const visible = getVisibleByDefault();
        columnVisibility = {};
        ids.forEach(col => {
            columnVisibility[col] = visible.includes(col);
        });
    }

    // Indica si el filtro de una columna está activo (tiene valores seleccionados)
    function isColumnFilterActive(col, buttonType) {
        if (buttonType === 'checkbox') {
            if (col === 'estado') return currentFilters.estado.length > 0;
            if (col === 'prioridad') return currentFilters.prioridad.length > 0;
            return false;
        }
        if (buttonType === 'filter') {
            if (col === 'asignado') return currentFilters.persona.length > 0;
            if (['areaAsignado', 'areaCreador', 'creador', 'plan'].indexOf(col) >= 0) return currentFilters[col].length > 0;
            return false;
        }
        return false;
    }

    // Construir cabecera de tabla según tab activo (Tareas o Planes)
    function buildTableHeader() {
        const theadRow = document.getElementById('seguimiento-thead-row');
        if (!theadRow) return;
        const cols = getColumnIds();
        const labelsTareas = {
            id: 'ID de la tarea',
            nombre: 'Nombre de la tarea',
            asignado: 'Asignado',
            creador: 'Creador',
            areaAsignado: 'Área del asignado',
            areaCreador: 'Área del creador',
            estado: 'Estado',
            prioridad: 'Prioridad',
            plan: 'Plan al que pertenece',
            fechaCreacion: 'Fecha de creación',
            fechaFinalizacion: 'Fecha de vencimiento',
            comentarios: 'Número de comentarios'
        };
        const labelsPlanes = {
            id: 'ID del plan',
            nombre: 'Nombre del plan',
            asignados: 'Personas asignadas',
            creador: 'Creador del plan',
            estado: 'Estado del plan',
            avance: 'Progreso del plan',
            fechaCreacion: 'Fecha de creación',
            fechaFinalizacion: 'Fecha de finalización'
        };
        const labels = activeTab === 'planes' ? labelsPlanes : labelsTareas;
        let html = '<th class="ubits-table__th--checkbox" data-col="checkbox"><input type="checkbox" id="seguimiento-select-all" aria-label="Seleccionar todo"></th>';
        cols.forEach(col => {
            const label = labels[col] || col;
            const visible = columnVisibility[col] !== false;
            const style = visible ? '' : ' style="display:none;"';
            if (col === 'estado' && activeTab === 'tareas') {
                var activeClass = isColumnFilterActive('estado', 'checkbox') ? ' seguimiento-checkbox-btn--active' : '';
                html += `<th class="seguimiento-th-filterable" data-col="${col}"${style}>${label} <button type="button" class="ubits-button ubits-button--tertiary ubits-button--xs ubits-button--icon-only seguimiento-checkbox-btn${activeClass}" data-checkbox="estado" aria-label="Filtrar por estado"><i class="far fa-filter"></i></button></th>`;
            } else if (col === 'prioridad' && activeTab === 'tareas') {
                var activeClass = isColumnFilterActive('prioridad', 'checkbox') ? ' seguimiento-checkbox-btn--active' : '';
                html += `<th class="seguimiento-th-filterable" data-col="${col}"${style}>${label} <button type="button" class="ubits-button ubits-button--tertiary ubits-button--xs ubits-button--icon-only seguimiento-checkbox-btn${activeClass}" data-checkbox="prioridad" aria-label="Filtrar por prioridad"><i class="far fa-filter"></i></button></th>`;
            } else if ((col === 'fechaCreacion' || col === 'fechaFinalizacion') && (activeTab === 'tareas' || activeTab === 'planes')) {
                html += `<th class="seguimiento-th-sortable" data-col="${col}"${style}>${label} <button type="button" class="ubits-button ubits-button--tertiary ubits-button--xs ubits-button--icon-only seguimiento-date-sort-btn" data-sort="${col}" aria-label="Ordenar por ${label}"><i class="far fa-arrow-up-arrow-down"></i></button></th>`;
            } else if (activeTab === 'tareas' && ['asignado', 'areaAsignado', 'areaCreador', 'creador', 'plan'].indexOf(col) >= 0) {
                var activeClass = isColumnFilterActive(col, 'filter') ? ' seguimiento-filter-btn--active' : '';
                html += `<th class="seguimiento-th-filterable" data-col="${col}"${style}>${label} <button type="button" class="ubits-button ubits-button--tertiary ubits-button--xs ubits-button--icon-only seguimiento-filter-btn${activeClass}" data-filter="${col}" aria-label="Filtrar por ${label}"><i class="far fa-filter"></i></button></th>`;
            } else if (activeTab === 'planes' && col === 'creador') {
                var activeClass = isColumnFilterActive('creador', 'filter') ? ' seguimiento-filter-btn--active' : '';
                html += `<th class="seguimiento-th-filterable" data-col="${col}"${style}>${label} <button type="button" class="ubits-button ubits-button--tertiary ubits-button--xs ubits-button--icon-only seguimiento-filter-btn${activeClass}" data-filter="${col}" aria-label="Filtrar por ${label}"><i class="far fa-filter"></i></button></th>`;
            } else if (activeTab === 'planes' && col === 'estado') {
                var activeClass = isColumnFilterActive('estado', 'checkbox') ? ' seguimiento-checkbox-btn--active' : '';
                html += `<th class="seguimiento-th-filterable" data-col="${col}"${style}>${label} <button type="button" class="ubits-button ubits-button--tertiary ubits-button--xs ubits-button--icon-only seguimiento-checkbox-btn${activeClass}" data-checkbox="estado" aria-label="Filtrar por estado"><i class="far fa-filter"></i></button></th>`;
            } else if (activeTab === 'planes' && col === 'avance') {
                html += `<th class="seguimiento-th-sortable" data-col="${col}"${style}>${label} <button type="button" class="ubits-button ubits-button--tertiary ubits-button--xs ubits-button--icon-only seguimiento-date-sort-btn" data-sort="${col}" aria-label="Ordenar por ${label}"><i class="far fa-arrow-up-arrow-down"></i></button></th>`;
            } else {
                html += `<th data-col="${col}"${style}>${label}</th>`;
            }
        });
        theadRow.innerHTML = html;
        // Re-attach select-all checkbox
        const selectAll = document.getElementById('seguimiento-select-all');
        if (selectAll) {
            selectAll.addEventListener('change', function() {
                const data = getDisplayData();
                const start = (currentPage - 1) * itemsPerPage;
                const pageData = data.slice(start, start + itemsPerPage);
                if (this.checked) {
                    pageData.forEach(r => selectedIds.add(r.id));
                } else {
                    pageData.forEach(r => selectedIds.delete(r.id));
                }
                renderTable();
                toggleActionBar();
            });
        }
    }

    // Función para normalizar texto (eliminar tildes y convertir a minúsculas)
    function normalizeText(text) {
        if (!text) return '';
        return String(text)
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, ''); // Elimina diacríticos (tildes)
    }

    // Aplicar filtros y búsqueda
    function applyFiltersAndSearch() {
        let data = [...getDataForCurrentTab()];

        // Búsqueda general (searchQuery) - sin tildes. En Planes: nombre del plan (+ creador, id). En Tareas: solo nombre de la tarea (3.1.1)
        if (searchQuery) {
            const q = normalizeText(searchQuery);
            if (activeTab === 'planes') {
                data = data.filter(row =>
                    normalizeText(row.nombre).includes(q) ||
                    normalizeText(row.creador).includes(q) ||
                    String(row.id).includes(q)
                );
            } else {
                data = data.filter(row => normalizeText(row.nombre).includes(q));
            }
        }

        // Filtro nombre (actividad) - sin tildes
        if (currentFilters.nombre.length > 0) {
            data = data.filter(row => 
                currentFilters.nombre.some(nombre => 
                    normalizeText(row.nombre).includes(normalizeText(nombre))
                )
            );
        }

        // Filtro creador - sin tildes
        if (currentFilters.creador.length > 0) {
            data = data.filter(row => 
                currentFilters.creador.some(creador => 
                    normalizeText(row.creador).includes(normalizeText(creador))
                )
            );
        }

        // Filtro plan - busca en nombre del plan Y nombre de la actividad - sin tildes
        if (currentFilters.plan.length > 0) {
            data = data.filter(row => 
                currentFilters.plan.some(plan => 
                    normalizeText(row.plan).includes(normalizeText(plan)) ||
                    normalizeText(row.nombre).includes(normalizeText(plan))
                )
            );
        }

        // Filtro persona - sin tildes
        if (currentFilters.persona.length > 0) {
            data = data.filter(row => 
                currentFilters.persona.some(persona => 
                    normalizeText(row.asignado.nombre).includes(normalizeText(persona))
                )
            );
        }

        // Filtro username - sin tildes
        if (currentFilters.username.length > 0) {
            data = data.filter(row => 
                currentFilters.username.some(username => 
                    row.asignado.username && normalizeText(row.asignado.username).includes(normalizeText(username))
                )
            );
        }

        // Filtro área del asignado - sin tildes
        if (currentFilters.areaAsignado.length > 0) {
            data = data.filter(row => 
                currentFilters.areaAsignado.some(area => 
                    normalizeText(row.area || '').includes(normalizeText(area))
                )
            );
        }
        // Filtro área del creador - sin tildes
        if (currentFilters.areaCreador.length > 0) {
            data = data.filter(row => 
                currentFilters.areaCreador.some(area => 
                    normalizeText((row.areaCreador != null ? row.areaCreador : row.area) || '').includes(normalizeText(area))
                )
            );
        }

        // Filtro lider - sin tildes
        if (currentFilters.lider.length > 0) {
            data = data.filter(row => 
                currentFilters.lider.some(lider => 
                    row.lider && normalizeText(row.lider).includes(normalizeText(lider))
                )
            );
        }

        // Filtro estado
        if (currentFilters.estado.length > 0) {
            data = data.filter(row => currentFilters.estado.includes(row.estado));
        }

        // Filtro prioridad (solo tab Tareas)
        if (activeTab === 'tareas' && currentFilters.prioridad.length > 0) {
            data = data.filter(row => currentFilters.prioridad.includes(row.prioridad));
        }

        // Filtro fecha de creación
        if (currentFilters.fechaCreacionDesde || currentFilters.fechaCreacionHasta) {
            data = data.filter(row => {
                const fechaRow = parseFecha(row.fechaCreacion);
                if (!fechaRow) return false;
                
                if (currentFilters.fechaCreacionDesde && currentFilters.fechaCreacionHasta) {
                    const fechaDesde = parseFecha(currentFilters.fechaCreacionDesde);
                    const fechaHasta = parseFecha(currentFilters.fechaCreacionHasta);
                    if (!fechaDesde || !fechaHasta) return false;
                    return fechaRow >= fechaDesde && fechaRow <= fechaHasta;
                } else if (currentFilters.fechaCreacionDesde) {
                    const fechaDesde = parseFecha(currentFilters.fechaCreacionDesde);
                    if (!fechaDesde) return false;
                    return fechaRow >= fechaDesde;
                } else if (currentFilters.fechaCreacionHasta) {
                    const fechaHasta = parseFecha(currentFilters.fechaCreacionHasta);
                    if (!fechaHasta) return false;
                    return fechaRow <= fechaHasta;
                }
                return false;
            });
        }

        // Filtro fecha de vencimiento
        if (currentFilters.fechaVencimientoDesde || currentFilters.fechaVencimientoHasta) {
            data = data.filter(row => {
                const fechaRow = parseFecha(row.fechaFinalizacion);
                if (!fechaRow) return false;
                
                if (currentFilters.fechaVencimientoDesde && currentFilters.fechaVencimientoHasta) {
                    const fechaDesde = parseFecha(currentFilters.fechaVencimientoDesde);
                    const fechaHasta = parseFecha(currentFilters.fechaVencimientoHasta);
                    if (!fechaDesde || !fechaHasta) return false;
                    return fechaRow >= fechaDesde && fechaRow <= fechaHasta;
                } else if (currentFilters.fechaVencimientoDesde) {
                    const fechaDesde = parseFecha(currentFilters.fechaVencimientoDesde);
                    if (!fechaDesde) return false;
                    return fechaRow >= fechaDesde;
                } else if (currentFilters.fechaVencimientoHasta) {
                    const fechaHasta = parseFecha(currentFilters.fechaVencimientoHasta);
                    if (!fechaHasta) return false;
                    return fechaRow <= fechaHasta;
                }
                return false;
            });
        }

        // Filtro por período (últimos X días desde hoy) - solo si no hay filtro personalizado
        if (currentFilters.periodo && !currentFilters.fechaCreacionDesde && !currentFilters.fechaCreacionHasta) {
            const hoy = new Date(); // Fecha real para que los totales coincidan con la BD
            hoy.setHours(23, 59, 59, 999); // Fin del día de hoy
            
            // Calcular fecha límite: "últimos X días" incluyendo hoy = desde (X-1) días atrás
            const periodoDias = parseInt(currentFilters.periodo);
            if (isNaN(periodoDias)) return; // Si no es un número válido, no aplicar filtro
            
            const diasAtras = periodoDias - 1; // Para incluir el día de hoy: restar (periodoDias - 1) días
            
            const hoyInicio = new Date(hoy);
            hoyInicio.setHours(0, 0, 0, 0);
            const milisegundosPorDia = 24 * 60 * 60 * 1000;
            const fechaLimiteTimestamp = hoyInicio.getTime() - (diasAtras * milisegundosPorDia);
            const fechaLimite = new Date(fechaLimiteTimestamp);
            
            data = data.filter(row => {
                const fechaRow = parseFecha(row.fechaCreacion);
                if (!fechaRow) return false;
                
                // Comparar usando getTime() para evitar problemas de comparación
                const fechaRowTime = fechaRow.getTime();
                const fechaLimiteTime = fechaLimite.getTime();
                const hoyTime = hoy.getTime();
                
                // Incluir actividades desde fechaLimite (inclusive) hasta hoy (inclusive)
                return fechaRowTime >= fechaLimiteTime && fechaRowTime <= hoyTime;
            });
        }

        filteredData = data;
    }

    // Devuelve datos filtrados solo por búsqueda y filtros de columna (sin período ni fechas).
    // Sirve para detectar si el vacío se debe solo al período/fechas (empty state distinto).
    function getDataFilteredExcludingPeriodAndDateRange() {
        let data = [...getDataForCurrentTab()];

        if (searchQuery) {
            const q = normalizeText(searchQuery);
            if (activeTab === 'planes') {
                data = data.filter(row =>
                    normalizeText(row.nombre).includes(q) ||
                    normalizeText(row.creador).includes(q) ||
                    String(row.id).includes(q)
                );
            } else {
                data = data.filter(row => normalizeText(row.nombre).includes(q));
            }
        }
        if (currentFilters.nombre.length > 0) {
            data = data.filter(row =>
                currentFilters.nombre.some(nombre =>
                    normalizeText(row.nombre).includes(normalizeText(nombre))
                )
            );
        }
        if (currentFilters.creador.length > 0) {
            data = data.filter(row =>
                currentFilters.creador.some(creador =>
                    normalizeText(row.creador).includes(normalizeText(creador))
                )
            );
        }
        if (currentFilters.plan.length > 0) {
            data = data.filter(row =>
                currentFilters.plan.some(plan =>
                    normalizeText(row.plan).includes(normalizeText(plan)) ||
                    normalizeText(row.nombre).includes(normalizeText(plan))
                )
            );
        }
        if (currentFilters.persona.length > 0) {
            data = data.filter(row => {
                const nombreAsignado = row.asignado && row.asignado.nombre;
                if (!nombreAsignado && !(row.asignados && row.asignados.length)) return false;
                return currentFilters.persona.some(persona =>
                    normalizeText(nombreAsignado || (row.asignados[0] && row.asignados[0].nombre) || '').includes(normalizeText(persona))
                );
            });
        }
        if (currentFilters.username.length > 0) {
            data = data.filter(row =>
                currentFilters.username.some(username =>
                    row.asignado && row.asignado.username && normalizeText(row.asignado.username).includes(normalizeText(username))
                )
            );
        }
        if (currentFilters.areaAsignado.length > 0) {
            data = data.filter(row =>
                currentFilters.areaAsignado.some(area =>
                    normalizeText(row.area || '').includes(normalizeText(area))
                )
            );
        }
        if (currentFilters.areaCreador.length > 0) {
            data = data.filter(row =>
                currentFilters.areaCreador.some(area =>
                    normalizeText((row.areaCreador != null ? row.areaCreador : row.area) || '').includes(normalizeText(area))
                )
            );
        }
        if (currentFilters.lider.length > 0) {
            data = data.filter(row =>
                currentFilters.lider.some(lider =>
                    row.lider && normalizeText(row.lider).includes(normalizeText(lider))
                )
            );
        }
        if (currentFilters.estado.length > 0) {
            data = data.filter(row => currentFilters.estado.includes(row.estado));
        }
        if (activeTab === 'tareas' && currentFilters.prioridad.length > 0) {
            data = data.filter(row => currentFilters.prioridad.includes(row.prioridad));
        }
        return data;
    }

    // Datos ya filtrados solo por período y búsqueda (sin filtros de columna). Usado para que las opciones
    // de los filtros de encabezado (Nombre, Asignado, etc.) muestren solo valores que existen en la vista actual.
    function getDataFilteredByPeriodAndSearchOnly() {
        let data = [...getDataForCurrentTab()];

        if (searchQuery) {
            const q = normalizeText(searchQuery);
            if (activeTab === 'planes') {
                data = data.filter(row =>
                    normalizeText(row.nombre).includes(q) ||
                    normalizeText(row.creador).includes(q) ||
                    String(row.id).includes(q)
                );
            } else {
                data = data.filter(row => normalizeText(row.nombre).includes(q));
            }
        }

        if (currentFilters.fechaCreacionDesde || currentFilters.fechaCreacionHasta) {
            data = data.filter(row => {
                const fechaRow = parseFecha(row.fechaCreacion);
                if (!fechaRow) return false;
                if (currentFilters.fechaCreacionDesde && currentFilters.fechaCreacionHasta) {
                    const fechaDesde = parseFecha(currentFilters.fechaCreacionDesde);
                    const fechaHasta = parseFecha(currentFilters.fechaCreacionHasta);
                    if (!fechaDesde || !fechaHasta) return false;
                    return fechaRow >= fechaDesde && fechaRow <= fechaHasta;
                } else if (currentFilters.fechaCreacionDesde) {
                    const fechaDesde = parseFecha(currentFilters.fechaCreacionDesde);
                    return fechaDesde ? fechaRow >= fechaDesde : false;
                } else if (currentFilters.fechaCreacionHasta) {
                    const fechaHasta = parseFecha(currentFilters.fechaCreacionHasta);
                    return fechaHasta ? fechaRow <= fechaHasta : false;
                }
                return false;
            });
        }

        if (currentFilters.fechaVencimientoDesde || currentFilters.fechaVencimientoHasta) {
            data = data.filter(row => {
                const fechaRow = parseFecha(row.fechaFinalizacion);
                if (!fechaRow) return false;
                if (currentFilters.fechaVencimientoDesde && currentFilters.fechaVencimientoHasta) {
                    const fechaDesde = parseFecha(currentFilters.fechaVencimientoDesde);
                    const fechaHasta = parseFecha(currentFilters.fechaVencimientoHasta);
                    if (!fechaDesde || !fechaHasta) return false;
                    return fechaRow >= fechaDesde && fechaRow <= fechaHasta;
                } else if (currentFilters.fechaVencimientoDesde) {
                    const fechaDesde = parseFecha(currentFilters.fechaVencimientoDesde);
                    return fechaDesde ? fechaRow >= fechaDesde : false;
                } else if (currentFilters.fechaVencimientoHasta) {
                    const fechaHasta = parseFecha(currentFilters.fechaVencimientoHasta);
                    return fechaHasta ? fechaRow <= fechaHasta : false;
                }
                return false;
            });
        }

        if (currentFilters.periodo && !currentFilters.fechaCreacionDesde && !currentFilters.fechaCreacionHasta) {
            const hoy = new Date();
            hoy.setHours(23, 59, 59, 999);
            const periodoDias = parseInt(currentFilters.periodo);
            if (!isNaN(periodoDias)) {
                const diasAtras = periodoDias - 1;
                const hoyInicio = new Date(hoy);
                hoyInicio.setHours(0, 0, 0, 0);
                const milisegundosPorDia = 24 * 60 * 60 * 1000;
                const fechaLimite = new Date(hoyInicio.getTime() - (diasAtras * milisegundosPorDia));
                data = data.filter(row => {
                    const fechaRow = parseFecha(row.fechaCreacion);
                    if (!fechaRow) return false;
                    const t = fechaRow.getTime();
                    return t >= fechaLimite.getTime() && t <= hoy.getTime();
                });
            }
        }

        return data;
    }

    // Función auxiliar para formatear fecha para mostrar (sin hora)
    // Toma una fecha en formato "1 ene 2026 08:00" y devuelve "1 ene 2026"
    function formatearFechaParaMostrar(fechaStr) {
        if (!fechaStr) return '';
        
        // Si tiene hora, removerla
        const partes = fechaStr.trim().split(/\s+/);
        if (partes.length >= 3) {
            // Tomar solo día, mes y año
            return `${partes[0]} ${partes[1]} ${partes[2]}`;
        }
        
        return fechaStr;
    }

    // Función auxiliar para parsear fechas en formato "1 ene 2026" o "1 ene 2026 08:00"
    function parseFecha(fechaStr) {
        if (!fechaStr) return null;
        
        // Mapeo de meses en español
        const meses = {
            'ene': 0, 'feb': 1, 'mar': 2, 'abr': 3, 'may': 4, 'jun': 5,
            'jul': 6, 'ago': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dic': 11
        };
        
        // Formato esperado: "1 ene 2026" o "1 ene 2026 08:00" o "01/01/2026" (si viene del date picker)
        const partes = fechaStr.trim().split(/[\s\/\-]+/);
        
        if (partes.length >= 3) {
            let dia, mes, año, hora = 0, minutos = 0;
            
            // Si tiene formato "1 ene 2026" o "1 ene 2026 08:00"
            if (partes[1].toLowerCase() in meses) {
                dia = parseInt(partes[0], 10);
                mes = meses[partes[1].toLowerCase()];
                año = parseInt(partes[2], 10);
                
                // Si tiene hora (formato "1 ene 2026 08:00")
                // partes[3] sería "08:00" si existe
                if (partes.length >= 4 && partes[3] && partes[3].includes(':')) {
                    const horaPartes = partes[3].split(':');
                    hora = parseInt(horaPartes[0], 10) || 0;
                    minutos = parseInt(horaPartes[1], 10) || 0;
                }
            } 
            // Si tiene formato "01/01/2026" (del date picker)
            else {
                dia = parseInt(partes[0], 10);
                mes = parseInt(partes[1], 10) - 1; // Los meses en JS son 0-indexed
                año = parseInt(partes[2], 10);
            }
            
            if (!isNaN(dia) && !isNaN(mes) && !isNaN(año)) {
                const fecha = new Date(año, mes, dia, hora, minutos);
                return fecha;
            }
        }
        
        return null;
    }

    function dateToYYYYMMDD(d) {
        if (!d || !(d instanceof Date)) return '';
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return y + '-' + m + '-' + day;
    }

    function escapeHtml(str) {
        if (str == null || str === '') return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function getPlanesParaDropdownSeguimiento() {
        if (typeof TAREAS_PLANES_DB !== 'undefined' && typeof TAREAS_PLANES_DB.getPlanesVistaPlanes === 'function') {
            const plans = TAREAS_PLANES_DB.getPlanesVistaPlanes();
            return plans.map(p => ({ id: String(p.id), name: p.name || p.title || ('Plan ' + p.id) }));
        }
        return [];
    }
    function getUsuariosParaDropdownSeguimiento() {
        if (typeof TAREAS_PLANES_DB !== 'undefined' && typeof TAREAS_PLANES_DB.getEmpleadosEjemplo === 'function') {
            const emp = TAREAS_PLANES_DB.getEmpleadosEjemplo();
            return emp.map((e, i) => ({ id: String(e.id || i), email: e.username || '', full_name: e.nombre || '', avatar_url: e.avatar || null }));
        }
        return [];
    }

    /** Convierte una fila de actividad (tarea) de seguimiento al formato task del panel de detalle */
    function rowToTask(row) {
        if (!row || row.tipo !== 'tarea') return null;
        const d = parseFecha(row.fechaFinalizacion);
        const endDate = dateToYYYYMMDD(d) || '';
        const status = row.estado === 'Finalizada' ? 'Finalizado' : row.estado === 'Vencida' ? 'Vencido' : 'Activo';
        const plans = getPlanesParaDropdownSeguimiento();
        const planMatch = row.plan ? plans.find(p => (p.name || '') === row.plan) : null;
        const planId = planMatch ? planMatch.id : null;
        return {
            id: row.id,
            name: row.nombre || '',
            description: row.description || '',
            endDate: endDate,
            priority: (row.prioridad || 'Media').toLowerCase(),
            status: status,
            assignee_name: row.asignado && row.asignado.nombre ? row.asignado.nombre : null,
            assignee_email: row.asignado && row.asignado.username ? row.asignado.username : null,
            assignee_avatar_url: row.asignado && row.asignado.avatar ? row.asignado.avatar : null,
            created_by: row.creador || '',
            created_by_avatar_url: (row.creador_avatar && String(row.creador_avatar).trim()) ? row.creador_avatar : null,
            planId: planId,
            planNombre: row.plan || '',
            done: row.estado === 'Finalizada',
            role: 'colaborador',
            comentarios: typeof row.comentarios === 'number' ? row.comentarios : 0
        };
    }

    /** Sincroniza el objeto task de vuelta a la fila row de SEGUIMIENTO_DATA */
    function syncTaskToRow(task, row) {
        if (!task || !row || row.tipo !== 'tarea') return;
        row.nombre = task.name || row.nombre;
        row.description = task.description;
        row.prioridad = (task.priority === 'alta' ? 'Alta' : task.priority === 'baja' ? 'Baja' : 'Media');
        row.estado = task.status === 'Finalizado' ? 'Finalizada' : task.status === 'Vencido' ? 'Vencida' : 'Iniciada';
        if (task.assignee_email === null || task.assignee_email === '') {
            row.asignado = null;
        } else {
            row.asignado = row.asignado || {};
            row.asignado.nombre = task.assignee_name || row.asignado.nombre;
            row.asignado.username = task.assignee_email || row.asignado.username;
            row.asignado.avatar = task.assignee_avatar_url || row.asignado.avatar;
        }
        const endDateStr = task.endDate;
        if (endDateStr) {
            const parts = endDateStr.split('-');
            if (parts.length === 3) {
                const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
                row.fechaFinalizacion = parts[2] + ' ' + (meses[parseInt(parts[1], 10) - 1] || '') + ' ' + parts[0];
            }
        }
    }

    let seguimientoTaskDetailState = { selectedRow: null, selectedTask: null, editingTask: {} };

    function closeTaskDetailPanelSeguimiento() {
        seguimientoTaskDetailState.selectedRow = null;
        seguimientoTaskDetailState.selectedTask = null;
        seguimientoTaskDetailState.editingTask = {};
        ['task-detail-assignee-overlay', 'task-detail-role-overlay', 'task-detail-priority-overlay'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.remove();
        });
        const overlay = document.getElementById('task-detail-overlay');
        if (overlay) overlay.style.display = 'none';
        renderTable();
    }

    function openTaskDetailPanelSeguimiento(row) {
        const overlay = document.getElementById('task-detail-overlay');
        const panel = document.getElementById('task-detail-panel');
        if (!overlay || !panel || !row) return;

        const task = rowToTask(row);
        if (!task) return;

        seguimientoTaskDetailState.selectedRow = row;
        seguimientoTaskDetailState.selectedTask = task;
        seguimientoTaskDetailState.editingTask = {
            name: task.name || '',
            description: task.description || '',
            endDate: task.endDate || '',
            priority: task.priority || 'media',
            role: task.role || 'colaborador'
        };

        const t = task;
        const edit = seguimientoTaskDetailState.editingTask;
        const taskName = edit.name !== undefined ? edit.name : (t.name || '');
        const desc = edit.description !== undefined ? edit.description : (t.description || '');
        const endDate = edit.endDate !== undefined ? edit.endDate : (t.endDate || '');
        const priority = edit.priority !== undefined ? edit.priority : (t.priority || 'media');
        const prioridadIcon = { alta: 'fa-chevrons-up', media: 'fa-chevron-up', baja: 'fa-chevron-down' };
        const prioridadBadgeVariant = { alta: 'error', media: 'warning', baja: 'info' };
        const priorityShortLabel = priority === 'alta' ? 'Alta' : priority === 'baja' ? 'Baja' : 'Media';
        const role = edit.role !== undefined ? edit.role : (t.role || 'colaborador');
        const roleLabel = role === 'administrador' ? 'Administrador' : 'Colaborador';
        const statusDisplay = t.status === 'Vencido' ? 'Vencida' : t.status === 'Activo' ? 'Iniciada' : 'Finalizada';
        const statusSlug = t.status === 'Vencido' ? 'error' : t.status === 'Activo' ? 'info' : 'success';
        const isFinalizada = t.status === 'Finalizado';
        const finishBtnLabel = isFinalizada ? 'Reabrir tarea' : 'Finalizar tarea';
        const finishBtnVariant = isFinalizada ? 'ubits-button--secondary' : 'ubits-button--primary';
        const assigneeName = (t.assignee_name && String(t.assignee_name).trim()) ? String(t.assignee_name).trim() : (t.assignee_email ? t.assignee_email.split('@')[0] : null) || 'Sin asignar';
        const assigneeAvatar = (t.assignee_avatar_url && String(t.assignee_avatar_url).trim()) ? t.assignee_avatar_url : null;
        let createdBy = (t.created_by && String(t.created_by).trim()) ? String(t.created_by).trim() : 'Sin especificar';
        let createdByAvatar = (t.created_by_avatar_url && String(t.created_by_avatar_url).trim()) ? t.created_by_avatar_url : null;
        if (!createdByAvatar && createdBy !== 'Sin especificar') {
            try {
                const creatorResolved = (typeof TAREAS_PLANES_DB !== 'undefined' && typeof TAREAS_PLANES_DB.getCreatorDisplay === 'function')
                    ? TAREAS_PLANES_DB.getCreatorDisplay(t.created_by || '')
                    : { name: createdBy, avatar: null };
                createdBy = creatorResolved.name || createdBy;
                createdByAvatar = (creatorResolved.avatar && String(creatorResolved.avatar).trim()) ? creatorResolved.avatar : null;
            } catch (e) {
                createdByAvatar = null;
            }
        }
        const taskInPlan = !!(t.planId || t.planNombre);
        const plansForAutocomplete = getPlanesParaDropdownSeguimiento();
        const taskPlanDisplayName = t.planNombre || (t.planId && plansForAutocomplete.length ? (plansForAutocomplete.find(p => String(p.id) === String(t.planId)) || {}).name : null) || '';
        const hasComments = typeof t.comentarios === 'number' && t.comentarios > 0;
        const sidebarContentHtml = hasComments
            ? '<p class="ubits-body-sm-regular task-detail-sidebar-content__list-helper">Historial de comentarios (próximamente).</p>'
            : '<div id="task-detail-sidebar-empty-container"></div>';

        const panelData = {
            taskName: taskName,
            desc: desc,
            statusDisplay: statusDisplay,
            statusSlug: statusSlug,
            assigneeName: assigneeName,
            assigneeAvatar: assigneeAvatar,
            createdBy: createdBy,
            createdByAvatar: createdByAvatar,
            taskInPlan: taskInPlan,
            hasComments: hasComments,
            finishBtnLabel: finishBtnLabel,
            finishBtnVariant: finishBtnVariant,
            priority: priority,
            priorityShortLabel: priorityShortLabel,
            roleLabel: roleLabel,
            role: role,
            sidebarContentHtml: sidebarContentHtml,
            prioridadIcon: prioridadIcon,
            prioridadBadgeVariant: prioridadBadgeVariant
        };
        panel.innerHTML = window.getTaskDetailPanelHTML(panelData, { escapeHtml: escapeHtml, renderAvatar: typeof renderAvatar === 'function' ? renderAvatar : undefined });

        if (!hasComments && typeof loadEmptyState === 'function') {
            const emptyContainer = document.getElementById('task-detail-sidebar-empty-container');
            if (emptyContainer) {
                loadEmptyState('task-detail-sidebar-empty-container', {
                    icon: 'fa-comment-dots',
                    iconSize: 'md',
                    title: 'Aún no hay comentarios',
                    description: 'Aquí podrás ver el historial de comentarios y evidencias de esta tarea. Agrega el primero para empezar.',
                    buttons: { secondary: { text: 'Agregar comentarios', icon: 'fa-plus', onClick: function() { if (typeof showToast === 'function') showToast('info', 'Próximamente: agregar comentario'); } } }
                });
            }
        }
        if (typeof renderSaveIndicator === 'function') renderSaveIndicator('task-detail-save-indicator', { state: 'idle', size: 'xs' });

        function endDateToDisplay(ymd) {
            if (!ymd || !String(ymd).trim()) return '';
            const parts = String(ymd).trim().split('-');
            if (parts.length !== 3) return ymd;
            return (parts[2].length === 1 ? '0' + parts[2] : parts[2]) + '/' + (parts[1].length === 1 ? '0' + parts[1] : parts[1]) + '/' + parts[0];
        }
        function displayToEndDate(dmy) {
            if (!dmy || !String(dmy).trim()) return '';
            const parts = String(dmy).trim().split('/');
            if (parts.length !== 3) return '';
            return parts[2] + '-' + parts[1].padStart(2, '0') + '-' + parts[0].padStart(2, '0');
        }
        if (typeof createInput === 'function') {
            createInput({
                containerId: 'task-detail-date-container',
                type: 'calendar',
                size: 'sm',
                showLabel: false,
                placeholder: 'Selecciona una fecha…',
                value: endDateToDisplay(endDate),
                onChange: function(dateStr) {
                    const ymd = displayToEndDate(dateStr);
                    seguimientoTaskDetailState.editingTask.endDate = ymd;
                    if (seguimientoTaskDetailState.selectedTask) seguimientoTaskDetailState.selectedTask.endDate = ymd;
                    const row = seguimientoTaskDetailState.selectedRow;
                    if (row && ymd) {
                        const parts = ymd.split('-');
                        if (parts.length === 3) {
                            const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
                            row.fechaFinalizacion = parts[2] + ' ' + (meses[parseInt(parts[1], 10) - 1] || '') + ' ' + parts[0];
                        }
                    }
                }
            });
            const dateInput = document.querySelector('#task-detail-date-container .ubits-input');
            if (dateInput) dateInput.setAttribute('aria-labelledby', 'task-detail-date-label');
            createInput({
                containerId: 'task-detail-plan-container',
                type: 'autocomplete',
                label: 'Mover tarea a un plan',
                placeholder: 'Selecciona un plan existente',
                autocompleteOptions: plansForAutocomplete.map(p => ({ value: String(p.id), text: p.name })),
                value: taskPlanDisplayName,
                onChange: function(selectedValue) {
                    const task = seguimientoTaskDetailState.selectedTask;
                    const row = seguimientoTaskDetailState.selectedRow;
                    if (!task) return;
                    if (!selectedValue || selectedValue === '') {
                        task.planId = null;
                        task.planNombre = null;
                        if (row) row.plan = null;
                    } else {
                        const plan = plansForAutocomplete.find(p => String(p.id) === String(selectedValue));
                        if (plan) {
                            task.planId = plan.id;
                            task.planNombre = plan.name;
                            if (row) row.plan = plan.name;
                        }
                    }
                    openTaskDetailPanelSeguimiento(row);
                }
            });
        }

        const closeBtn = document.getElementById('task-detail-close');
        const nameEl = document.getElementById('task-detail-name');
        const charCountEl = document.getElementById('task-detail-char-count');
        const descEl = document.getElementById('task-detail-desc');
        const priorityBtn = document.getElementById('task-detail-priority-btn');
        const assigneeTrigger = document.getElementById('task-detail-assignee-trigger');
        const roleBtn = document.getElementById('task-detail-role-btn');
        const deleteBtn = document.getElementById('task-detail-delete');
        const finishBtn = document.getElementById('task-detail-finish');

        if (closeBtn) closeBtn.addEventListener('click', closeTaskDetailPanelSeguimiento);
        overlay.onclick = function(ev) { if (ev.target === overlay) closeTaskDetailPanelSeguimiento(); };

        if (nameEl) {
            nameEl.addEventListener('input', function() {
                seguimientoTaskDetailState.editingTask.name = nameEl.value;
                if (seguimientoTaskDetailState.selectedTask) seguimientoTaskDetailState.selectedTask.name = nameEl.value;
                if (seguimientoTaskDetailState.selectedRow) seguimientoTaskDetailState.selectedRow.nombre = nameEl.value;
                if (charCountEl) charCountEl.textContent = nameEl.value.length;
            });
        }
        if (descEl) {
            descEl.addEventListener('input', function() {
                seguimientoTaskDetailState.editingTask.description = descEl.value;
                if (seguimientoTaskDetailState.selectedTask) seguimientoTaskDetailState.selectedTask.description = descEl.value;
                if (seguimientoTaskDetailState.selectedRow) seguimientoTaskDetailState.selectedRow.description = descEl.value;
            });
        }

        if (priorityBtn && typeof window.getDropdownMenuHtml === 'function' && typeof window.openDropdownMenu === 'function' && typeof window.closeDropdownMenu === 'function') {
            priorityBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                const overlayId = 'task-detail-priority-overlay';
                let existing = document.getElementById(overlayId);
                if (existing) existing.remove();
                const options = [{ text: 'Baja', value: 'baja', leftIcon: 'chevron-down' }, { text: 'Media', value: 'media', leftIcon: 'chevron-up' }, { text: 'Alta', value: 'alta', leftIcon: 'chevrons-up' }];
                const html = window.getDropdownMenuHtml({ overlayId: overlayId, options: options });
                document.body.insertAdjacentHTML('beforeend', html);
                const overlayEl = document.getElementById(overlayId);
                if (!overlayEl) return;
                overlayEl.style.zIndex = '10100';
                overlayEl.querySelectorAll('.ubits-dropdown-menu__option').forEach(btn => {
                    btn.addEventListener('click', function(ev) {
                        ev.stopPropagation();
                        const val = btn.getAttribute('data-value');
                        if (val) {
                            seguimientoTaskDetailState.editingTask.priority = val;
                            if (seguimientoTaskDetailState.selectedTask) seguimientoTaskDetailState.selectedTask.priority = val;
                            syncTaskToRow(seguimientoTaskDetailState.selectedTask, seguimientoTaskDetailState.selectedRow);
                        }
                        window.closeDropdownMenu(overlayId);
                        if (overlayEl.parentNode) overlayEl.remove();
                        openTaskDetailPanelSeguimiento(seguimientoTaskDetailState.selectedRow);
                    });
                });
                overlayEl.addEventListener('click', function(ev) { if (ev.target === overlayEl) { window.closeDropdownMenu(overlayId); if (overlayEl.parentNode) overlayEl.remove(); openTaskDetailPanelSeguimiento(seguimientoTaskDetailState.selectedRow); } });
                window.openDropdownMenu(overlayId, priorityBtn);
            });
        }

        if (assigneeTrigger && typeof window.getDropdownMenuHtml === 'function' && typeof window.openDropdownMenu === 'function' && typeof window.closeDropdownMenu === 'function') {
            assigneeTrigger.addEventListener('click', function(e) {
                e.stopPropagation();
                const overlayId = 'task-detail-assignee-overlay';
                let existing = document.getElementById(overlayId);
                if (existing) existing.remove();
                const users = getUsuariosParaDropdownSeguimiento();
                const options = [{ text: 'Sin asignar', value: 'none', avatar: null }].concat(users.map(u => ({ text: u.full_name || u.email || '', value: String(u.id), avatar: u.avatar_url || null })));
                const html = window.getDropdownMenuHtml({ overlayId: overlayId, hasAutocomplete: true, autocompletePlaceholder: 'Buscar...', options: options });
                document.body.insertAdjacentHTML('beforeend', html);
                const overlayEl = document.getElementById(overlayId);
                if (!overlayEl) return;
                overlayEl.style.zIndex = '10100';
                overlayEl.querySelectorAll('.ubits-dropdown-menu__option').forEach(btn => {
                    btn.addEventListener('click', function(ev) {
                        ev.stopPropagation();
                        const val = btn.getAttribute('data-value');
                        const task = seguimientoTaskDetailState.selectedTask;
                        const row = seguimientoTaskDetailState.selectedRow;
                        if (task) {
                            if (val === 'none') {
                                task.assignee_email = null;
                                task.assignee_name = null;
                                task.assignee_avatar_url = null;
                                if (row && row.asignado) row.asignado = null;
                            } else {
                                const user = users.find(u => String(u.id) === val);
                                if (user) {
                                    task.assignee_email = user.email;
                                    task.assignee_name = user.full_name || user.email;
                                    task.assignee_avatar_url = user.avatar_url || null;
                                    if (row) {
                                        row.asignado = row.asignado || {};
                                        row.asignado.nombre = user.full_name || user.email;
                                        row.asignado.username = user.email;
                                        row.asignado.avatar = user.avatar_url || null;
                                    }
                                }
                            }
                        }
                        window.closeDropdownMenu(overlayId);
                        if (overlayEl.parentNode) overlayEl.remove();
                        openTaskDetailPanelSeguimiento(seguimientoTaskDetailState.selectedRow);
                    });
                });
                overlayEl.addEventListener('click', function(ev) { if (ev.target === overlayEl) { window.closeDropdownMenu(overlayId); if (overlayEl.parentNode) overlayEl.remove(); openTaskDetailPanelSeguimiento(seguimientoTaskDetailState.selectedRow); } });
                window.openDropdownMenu(overlayId, assigneeTrigger);
            });
        }

        if (roleBtn && typeof window.getDropdownMenuHtml === 'function' && typeof window.openDropdownMenu === 'function' && typeof window.closeDropdownMenu === 'function') {
            roleBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                const overlayId = 'task-detail-role-overlay';
                let existing = document.getElementById(overlayId);
                if (existing) existing.remove();
                const options = [{ text: 'Colaborador', value: 'colaborador', selected: role === 'colaborador' }, { text: 'Administrador', value: 'administrador', selected: role === 'administrador' }];
                const html = window.getDropdownMenuHtml({ overlayId: overlayId, options: options });
                document.body.insertAdjacentHTML('beforeend', html);
                const overlayEl = document.getElementById(overlayId);
                if (!overlayEl) return;
                overlayEl.style.zIndex = '10100';
                overlayEl.querySelectorAll('.ubits-dropdown-menu__option').forEach(btn => {
                    btn.addEventListener('click', function(ev) {
                        ev.stopPropagation();
                        const r = btn.getAttribute('data-value');
                        if (r) {
                            seguimientoTaskDetailState.editingTask.role = r;
                            if (seguimientoTaskDetailState.selectedTask) seguimientoTaskDetailState.selectedTask.role = r;
                        }
                        window.closeDropdownMenu(overlayId);
                        if (overlayEl.parentNode) overlayEl.remove();
                        openTaskDetailPanelSeguimiento(seguimientoTaskDetailState.selectedRow);
                    });
                });
                overlayEl.addEventListener('click', function(ev) { if (ev.target === overlayEl) { window.closeDropdownMenu(overlayId); if (overlayEl.parentNode) overlayEl.remove(); openTaskDetailPanelSeguimiento(seguimientoTaskDetailState.selectedRow); } });
                window.openDropdownMenu(overlayId, roleBtn);
            });
        }

        if (deleteBtn) deleteBtn.addEventListener('click', function() {
            const row = seguimientoTaskDetailState.selectedRow;
            if (row && confirm('¿Eliminar esta tarea?')) {
                const idx = SEGUIMIENTO_DATA.findIndex(r => String(r.id) === String(row.id) && r.tipo === 'tarea');
                if (idx >= 0) SEGUIMIENTO_DATA.splice(idx, 1);
                closeTaskDetailPanelSeguimiento();
            }
        });

        if (finishBtn) finishBtn.addEventListener('click', function() {
            const task = seguimientoTaskDetailState.selectedTask;
            const row = seguimientoTaskDetailState.selectedRow;
            if (!task || !row) return;
            task.done = !task.done;
            task.status = task.done ? 'Finalizado' : 'Activo';
            row.estado = task.done ? 'Finalizada' : 'Iniciada';
            closeTaskDetailPanelSeguimiento();
            if (typeof showToast === 'function') showToast('success', task.done ? 'Tarea finalizada' : 'Tarea reabierta');
        });

        const addCommentBtn = panel.querySelector('.task-detail-btn-add');
        if (addCommentBtn) addCommentBtn.addEventListener('click', function() { if (typeof showToast === 'function') showToast('info', 'Próximamente: agregar comentario'); });

        const escHandler = function(ev) {
            if (ev.key === 'Escape' && seguimientoTaskDetailState.selectedTask) {
                document.removeEventListener('keydown', escHandler);
                closeTaskDetailPanelSeguimiento();
            }
        };
        document.addEventListener('keydown', escHandler);

        overlay.style.display = 'flex';
    }

    function initRowClick() {
        const tbody = document.getElementById('seguimiento-tbody');
        if (!tbody) return;
        tbody.addEventListener('click', function(ev) {
            const tr = ev.target.closest('tr');
            if (!tr || tr.closest('thead')) return;
            if (ev.target.closest('.seguimiento-row-check')) return;
            const id = tr.getAttribute('data-id');
            if (id == null) return;
            const row = SEGUIMIENTO_DATA.find(r => String(r.id) === String(id));
            if (!row) return;
            if (row.tipo === 'plan') {
                window.location.href = 'plan-detail.html?id=' + encodeURIComponent(row.id);
                return;
            }
            if (row.tipo === 'tarea') {
                openTaskDetailPanelSeguimiento(row);
            }
        });
    }

    // Aplicar ordenamiento
    function applySorting() {
        if (!currentSort.column) return;

        filteredData.sort((a, b) => {
            let valA = a[currentSort.column];
            let valB = b[currentSort.column];

            // Manejar objetos (asignado / asignados)
            if (currentSort.column === 'asignado' || currentSort.column === 'asignados') {
                valA = (a.asignados && a.asignados[0]) ? a.asignados[0].nombre : (a.asignado ? a.asignado.nombre : '');
                valB = (b.asignados && b.asignados[0]) ? b.asignados[0].nombre : (b.asignado ? b.asignado.nombre : '');
            }

            // Manejar fechas (fechaCreacion, fechaFinalizacion)
            if (currentSort.column === 'fechaCreacion' || currentSort.column === 'fechaFinalizacion') {
                const fechaA = parseFecha(valA);
                const fechaB = parseFecha(valB);
                
                if (fechaA && fechaB) {
                    const cmp = fechaA.getTime() - fechaB.getTime();
                    return currentSort.direction === 'asc' ? cmp : -cmp;
                }
                // Si alguna fecha no se puede parsear, ponerla al final
                if (fechaA && !fechaB) return currentSort.direction === 'asc' ? -1 : 1;
                if (!fechaA && fechaB) return currentSort.direction === 'asc' ? 1 : -1;
                return 0;
            }

            // Manejar progreso/avance (planes): número 0-100
            if (currentSort.column === 'avance') {
                const numA = typeof valA === 'number' ? valA : (parseInt(valA, 10) || 0);
                const numB = typeof valB === 'number' ? valB : (parseInt(valB, 10) || 0);
                return currentSort.direction === 'asc' ? numA - numB : numB - numA;
            }

            // Comparar strings
            if (typeof valA === 'string' && typeof valB === 'string') {
                const cmp = valA.localeCompare(valB, 'es', { sensitivity: 'base' });
                return currentSort.direction === 'asc' ? cmp : -cmp;
            }

            // Comparar números
            if (typeof valA === 'number' && typeof valB === 'number') {
                return currentSort.direction === 'asc' ? valA - valB : valB - valA;
            }

            return 0;
        });
    }

    // Obtener datos filtrados (y posiblemente solo seleccionados)
    function getDisplayData() {
        applyFiltersAndSearch();
        applySorting();

        if (viewOnlySelected && selectedIds.size > 0) {
            return filteredData.filter(r => selectedIds.has(r.id));
        }
        return filteredData;
    }

    // Renderizar tabla
    function renderTable() {
        buildTableHeader(); // Actualiza estado activo de los botones de filtro en encabezados
        const tbody = document.getElementById('seguimiento-tbody');
        const tableWrapper = document.querySelector('.widget-tabla-seguimiento');
        const emptyStateContainer = document.getElementById('seguimiento-empty-state');
        const paginatorContainer = document.querySelector('.widget-paginador-seguimiento');
        
        if (!tbody) return;

        const data = getDisplayData();
        const totalEnTab = getDataForCurrentTab().length;
        
        // Si no hay resultados, mostrar empty state (tres variantes)
        if (data.length === 0) {
            // Ocultar tabla y paginador
            if (tableWrapper) tableWrapper.style.display = 'none';
            if (paginatorContainer) paginatorContainer.style.display = 'none';
            
            const isNothingCreated = totalEnTab === 0;
            const dataWithoutPeriodAndDates = getDataFilteredExcludingPeriodAndDateRange();
            const isEmptyOnlyBecauseOfPeriodOrDates = totalEnTab > 0 && dataWithoutPeriodAndDates.length > 0;

            if (emptyStateContainer && typeof loadEmptyState === 'function') {
                emptyStateContainer.style.display = 'flex';

                if (isNothingCreated) {
                    // 1) Aún no hay tareas/planes creados: iconos iguales al subnav (fa-tasks / fa-layer-group)
                    const isTareas = activeTab === 'tareas';
                    loadEmptyState('seguimiento-empty-state', {
                        icon: isTareas ? 'fa-tasks' : 'fa-layer-group',
                        iconSize: 'lg',
                        title: isTareas ? 'Aún no hay tareas' : 'Aún no hay planes',
                        description: isTareas
                            ? 'Crea tu primera tarea para comenzar el seguimiento.'
                            : 'Crea tu primer plan para organizar las tareas.',
                        buttons: {
                            secondary: {
                                text: isTareas ? 'Crear tarea' : 'Crear plan',
                                icon: 'fa-plus',
                                onClick: function() { /* se delega al botón del header */ }
                            }
                        }
                    });
                    setTimeout(() => {
                        const createBtn = emptyStateContainer.querySelector('.ubits-button--secondary');
                        if (createBtn) {
                            createBtn.onclick = function(e) {
                                e.preventDefault();
                                e.stopPropagation();
                                const headerCreate = document.getElementById('seguimiento-crear-btn');
                                if (headerCreate) headerCreate.click();
                            };
                        }
                    }, 50);
                } else if (isEmptyOnlyBecauseOfPeriodOrDates) {
                    // 2) Hay datos pero el período/fechas seleccionados no tienen actividades
                    const isTareas = activeTab === 'tareas';
                    const periodoLabels = {
                        '7': 'últimos 7 días',
                        '15': 'últimos 15 días',
                        '30': 'últimos 30 días',
                        '90': 'últimos 3 meses',
                        '180': 'últimos 6 meses',
                        '365': 'el último año'
                    };
                    const periodoLabel = (currentFilters.fechaCreacionDesde && currentFilters.fechaCreacionHasta)
                        ? 'el período elegido'
                        : (periodoLabels[currentFilters.periodo] || 'el período seleccionado');
                    loadEmptyState('seguimiento-empty-state', {
                        icon: 'fa-calendar',
                        iconSize: 'lg',
                        title: isTareas ? 'Nada en este período' : 'Nada en este período',
                        description: 'No hay ' + (isTareas ? 'tareas' : 'planes') + ' en ' + periodoLabel + '. Cambia el período para ver más.',
                        buttons: {
                            secondary: {
                                text: 'Cambiar período',
                                icon: 'fa-calendar-days',
                                onClick: function() { /* abre el menú de período */ }
                            }
                        }
                    });
                    setTimeout(() => {
                        const periodBtn = emptyStateContainer.querySelector('.ubits-button--secondary');
                        if (periodBtn) {
                            periodBtn.onclick = function(e) {
                                e.preventDefault();
                                e.stopPropagation();
                                const periodoToggle = document.getElementById('seguimiento-periodo-toggle');
                                if (periodoToggle) periodoToggle.click();
                            };
                        }
                    }, 50);
                } else {
                    // 3) No se encontraron resultados por búsqueda/filtros de columna
                loadEmptyState('seguimiento-empty-state', {
                    icon: 'fa-search',
                    iconSize: 'lg',
                    title: 'No se encontraron resultados',
                    description: 'Intenta ajustar tu búsqueda o filtros para encontrar lo que buscas.',
                    buttons: {
                            secondary: {
                            text: 'Limpiar búsqueda',
                            icon: 'fa-times',
                                onClick: function() { /* se maneja con listener directo */ }
                        }
                    }
                });
                setTimeout(() => {
                        const clearBtn = emptyStateContainer.querySelector('.ubits-button--secondary');
                    if (clearBtn) {
                        clearBtn.onclick = function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                            clearAllFilters();
                        };
                    }
                }, 50);
                }
            }
            
            // Actualizar contador e indicadores
            updateResultsCount();
            updateIndicadores();
            return;
        }
        
        // Si hay resultados, ocultar empty state y mostrar tabla
        if (emptyStateContainer) {
            emptyStateContainer.style.display = 'none';
            emptyStateContainer.innerHTML = '';
        }
        if (tableWrapper) tableWrapper.style.display = 'block';
        if (paginatorContainer) paginatorContainer.style.display = 'flex';
        
        const start = (currentPage - 1) * itemsPerPage;
        const slice = data.slice(start, start + itemsPerPage);

        const statusClass = { Iniciada: 'info', Vencida: 'error', Finalizada: 'success' };
        const prioridadIcon = { Alta: 'fa-chevrons-up', Media: 'fa-chevron-up', Baja: 'fa-chevron-down' };
        const prioridadBadgeVariant = { Alta: 'error', Media: 'warning', Baja: 'info' };

        const columnIds = getColumnIds();
        tbody.innerHTML = slice.map(row => {
            const sel = selectedIds.has(row.id) ? ' checked' : '';
            let asignadoHtml;
            const tooltipOpts = activeTab === 'planes' ? { showTooltip: true, tooltipDelay: 500 } : {};
            if (row.asignados && Array.isArray(row.asignados) && row.asignados.length > 0) {
                asignadoHtml = typeof renderProfileList === 'function'
                    ? renderProfileList(row.asignados, { size: 'sm', maxVisible: 3, ...tooltipOpts })
                    : (row.asignado ? (typeof renderAvatar === 'function' ? renderAvatar(row.asignado, { size: 'sm', ...tooltipOpts }) + '<span class="ubits-body-sm-regular">' + row.asignado.nombre + '</span>' : '') : '');
            } else if (activeTab === 'planes' && row.asignado) {
                asignadoHtml = typeof renderProfileList === 'function'
                    ? renderProfileList([row.asignado], { size: 'sm', maxVisible: 3, ...tooltipOpts })
                    : (typeof renderAvatar === 'function' ? renderAvatar(row.asignado, { size: 'sm', ...tooltipOpts }) : '');
            } else if (typeof renderAvatar === 'function' && row.asignado) {
                asignadoHtml = renderAvatar(row.asignado, { size: 'sm', ...tooltipOpts }) + '<span class="ubits-body-sm-regular">' + row.asignado.nombre + '</span>';
            } else if (row.asignado) {
                asignadoHtml = row.asignado.avatar
                    ? '<div class="ubits-table__avatar"><img src="' + row.asignado.avatar + '" alt="" width="28" height="28"></div><span class="ubits-body-sm-regular">' + row.asignado.nombre + '</span>'
                    : '<div class="ubits-table__avatar ubits-table__avatar-icon"><i class="far fa-user"></i></div><span class="ubits-body-sm-regular">' + row.asignado.nombre + '</span>';
            } else {
                asignadoHtml = '';
            }
            const estadoTag = `<span class="ubits-status-tag ubits-status-tag--${statusClass[row.estado]} ubits-status-tag--sm"><span class="ubits-status-tag__text">${row.estado}</span></span>`;
            const prioridadHtml = row.prioridad && prioridadBadgeVariant[row.prioridad] ? `<span class="ubits-badge-tag ubits-badge-tag--outlined ubits-badge-tag--${prioridadBadgeVariant[row.prioridad]} ubits-badge-tag--sm ubits-badge-tag--with-icon"><i class="far ${prioridadIcon[row.prioridad]}"></i><span class="ubits-badge-tag__text">${row.prioridad}</span></span>` : '';
            const comentariosText = row.comentarios === 0 ? '0 comentarios' : `${row.comentarios} comentario${row.comentarios > 1 ? 's' : ''}`;
            const avanceNum = typeof row.avance === 'number' ? row.avance : parseInt(row.avance) || 0;
            const avanceHtml = `<div class="ubits-table__cell-progress"><div class="ubits-table__progress-bar"><div class="ubits-table__progress-bar-fill" style="width: ${avanceNum}%"></div></div><span class="ubits-body-sm-regular">${avanceNum}%</span></div>`;

            const cellByCol = {
                id: `<td data-col="id">${row.id}</td>`,
                nombre: `<td data-col="nombre"><span class="ubits-body-sm-regular">${row.nombre}</span></td>`,
                asignado: `<td data-col="asignado"><div class="ubits-table__cell-assignee">${asignadoHtml}</div></td>`,
                asignados: `<td data-col="asignados"><div class="ubits-table__cell-assignee">${asignadoHtml}</div></td>`,
                username: `<td data-col="username"><span class="ubits-body-sm-regular">${row.asignado ? (row.asignado.username || '') : ''}</span></td>`,
                cargo: `<td data-col="cargo"><span class="ubits-body-sm-regular">${row.cargo || ''}</span></td>`,
                areaAsignado: `<td data-col="areaAsignado"><span class="ubits-body-sm-regular">${row.area || ''}</span></td>`,
                areaCreador: `<td data-col="areaCreador"><span class="ubits-body-sm-regular">${(row.areaCreador != null ? row.areaCreador : row.area) || ''}</span></td>`,
                lider: `<td data-col="lider"><span class="ubits-body-sm-regular">${row.lider || ''}</span></td>`,
                creador: `<td data-col="creador"><span class="ubits-body-sm-regular">${row.creador}</span></td>`,
                plan: `<td data-col="plan"><span class="ubits-body-sm-regular">${row.plan || ''}</span></td>`,
                estado: `<td data-col="estado">${estadoTag}</td>`,
                prioridad: `<td data-col="prioridad">${prioridadHtml}</td>`,
                avance: `<td data-col="avance">${avanceHtml}</td>`,
                fechaCreacion: `<td data-col="fechaCreacion"><span class="ubits-body-sm-regular">${formatearFechaParaMostrar(row.fechaCreacion)}</span></td>`,
                fechaFinalizacion: `<td data-col="fechaFinalizacion"><span class="ubits-body-sm-regular">${formatearFechaParaMostrar(row.fechaFinalizacion)}</span></td>`,
                comentarios: `<td data-col="comentarios"><span class="ubits-body-sm-regular">${comentariosText}</span></td>`
            };
            const cells = ['<td class="ubits-table__td--checkbox" data-col="checkbox"><input type="checkbox" class="seguimiento-row-check" data-id="' + row.id + '"' + sel + '></td>'].concat(
                columnIds.map(col => cellByCol[col] || `<td data-col="${col}"></td>`)
            );
            const cols = ['_checkbox'].concat(columnIds);

            const out = cells.map((html, i) => {
                const col = cols[i];
                if (col === '_checkbox') return html;
                const hide = columnVisibility[col] === false;
                if (!hide) return html;
                return html.replace(/^<td /, '<td style="display:none;" ');
            }).join('');

            return `<tr data-id="${row.id}">${out}</tr>`;
        }).join('');

        // Toggle visibility of columns in thead
        document.querySelectorAll('#seguimiento-table thead th').forEach((th, i) => {
            if (i === 0) return; // Checkbox siempre visible
            const col = th.dataset?.col;
            if (col && columnVisibility[col] === false) th.style.display = 'none';
            else if (col) th.style.display = '';
        });

        // Re-attach row checkbox listeners
        tbody.querySelectorAll('.seguimiento-row-check').forEach(cb => {
            cb.addEventListener('change', function() {
                const id = Number(this.dataset.id);
                if (this.checked) selectedIds.add(id);
                else selectedIds.delete(id);
                updateSelectAll();
                toggleActionBar();
            });
        });

        // Tooltips en avatares solo en tab Planes (nombre al hacer hover 1 s)
        if (activeTab === 'planes' && typeof initTooltip === 'function') {
            initTooltip('#seguimiento-table .ubits-table__cell-assignee [data-tooltip]');
        }
    }

    // Actualizar checkbox "seleccionar todo"
    function updateSelectAll() {
        const all = document.getElementById('seguimiento-select-all');
        if (!all) return;
        const data = getDisplayData();
        const start = (currentPage - 1) * itemsPerPage;
        const pageData = data.slice(start, start + itemsPerPage);
        const pageIds = pageData.map(r => r.id);
        const checkedCount = pageIds.filter(id => selectedIds.has(id)).length;

        all.checked = pageIds.length > 0 && checkedCount === pageIds.length;
        all.indeterminate = checkedCount > 0 && checkedCount < pageIds.length;
    }

    // Mostrar/ocultar barra de acciones
    function toggleActionBar() {
        const bar = document.getElementById('seguimiento-action-bar');
        const btn = document.getElementById('seguimiento-ver-seleccionados');
        if (!bar || !btn) return;

        const n = selectedIds.size;
        if (n > 0) {
            bar.classList.add('is-visible');
            const icon = btn.querySelector('i');
            const span = btn.querySelector('span');
            if (viewOnlySelected) {
                icon.className = 'far fa-eye-slash';
                span.textContent = `Dejar de ver seleccionados (${n})`;
                btn.classList.add('active');
            } else {
                icon.className = 'far fa-eye';
                span.textContent = 'Ver seleccionados';
                btn.classList.remove('active');
            }
        } else {
            bar.classList.remove('is-visible');
            viewOnlySelected = false;
            const icon = btn.querySelector('i');
            const span = btn.querySelector('span');
            icon.className = 'far fa-eye';
            span.textContent = 'Ver seleccionados';
            btn.classList.remove('active');
        }
    }

    // Actualizar contador de resultados
    function updateResultsCount() {
        const el = document.getElementById('seguimiento-results-count');
        if (!el) return;
        const data = getDisplayData();
        const totalTab = getDataForCurrentTab().length;
        el.textContent = `${formatIndicatorNumber(data.length)}/${formatIndicatorNumber(totalTab)}`;
    }

    // Actualizar indicadores de seguimiento (según tab: Tareas o Planes)
    function updateIndicadores() {
        const data = filteredData;
        const totalItems = data.length;
        const finalizadas = data.filter(t => t.estado === 'Finalizada').length;
        const iniciadas = data.filter(t => t.estado === 'Iniciada').length;
        const vencidas = data.filter(t => t.estado === 'Vencida').length;
        const porcentajeFinalizadas = totalItems > 0 ? Math.round((finalizadas / totalItems) * 100) : 0;
        const porcentajeIniciadas = totalItems > 0 ? Math.round((iniciadas / totalItems) * 100) : 0;
        const porcentajeVencidas = totalItems > 0 ? Math.round((vencidas / totalItems) * 100) : 0;

        const labelFinalizadas = activeTab === 'planes' ? 'Finalizados' : 'Finalizadas';
        const labelIniciadas = activeTab === 'planes' ? 'Iniciados' : 'Iniciadas';
        const labelVencidas = activeTab === 'planes' ? 'Vencidos' : 'Vencidas';

        const cardTotal = document.querySelector('#seguimiento-indicadores .seguimiento-indicador-card:nth-child(1)');
        if (cardTotal) {
            const numberEl = cardTotal.querySelector('.indicador-number');
            if (numberEl) numberEl.textContent = formatIndicatorNumber(totalItems);
        }
        const cardFinalizadas = document.querySelector('#seguimiento-indicadores .seguimiento-indicador-card:nth-child(2)');
        if (cardFinalizadas) {
            const numberEl = cardFinalizadas.querySelector('.indicador-number');
            const percentageEl = cardFinalizadas.querySelector('.indicador-percentage');
            const labelEl = cardFinalizadas.querySelector('.indicador-label');
            if (numberEl) numberEl.textContent = formatIndicatorNumber(finalizadas);
            if (percentageEl) percentageEl.textContent = `${porcentajeFinalizadas}%`;
            if (labelEl) labelEl.textContent = labelFinalizadas;
        }
        const cardIniciadas = document.querySelector('#seguimiento-indicadores .seguimiento-indicador-card:nth-child(3)');
        if (cardIniciadas) {
            const numberEl = cardIniciadas.querySelector('.indicador-number');
            const percentageEl = cardIniciadas.querySelector('.indicador-percentage');
            const labelEl = cardIniciadas.querySelector('.indicador-label');
            if (numberEl) numberEl.textContent = formatIndicatorNumber(iniciadas);
            if (percentageEl) percentageEl.textContent = `${porcentajeIniciadas}%`;
            if (labelEl) labelEl.textContent = labelIniciadas;
        }
        const cardVencidas = document.querySelector('#seguimiento-indicadores .seguimiento-indicador-card:nth-child(4)');
        if (cardVencidas) {
            const numberEl = cardVencidas.querySelector('.indicador-number');
            const percentageEl = cardVencidas.querySelector('.indicador-percentage');
            const labelEl = cardVencidas.querySelector('.indicador-label');
            if (numberEl) numberEl.textContent = formatIndicatorNumber(vencidas);
            if (percentageEl) percentageEl.textContent = `${porcentajeVencidas}%`;
            if (labelEl) labelEl.textContent = labelVencidas;
        }
    }

    // Renderizar chips de filtros aplicados
    function renderFiltrosAplicados() {
        const container = document.getElementById('filtros-chips-container');
        const widget = document.getElementById('seguimiento-filtros-aplicados');
        if (!container || !widget) return;

        const chips = [];
        let hasFilters = false;

        // Búsqueda
        if (searchQuery && searchQuery.trim()) {
            hasFilters = true;
            chips.push({
                type: 'search',
                label: 'Búsqueda',
                value: searchQuery,
                remove: () => {
                    searchQuery = '';
                    const searchContainer = document.getElementById('seguimiento-search-container');
                    if (searchContainer) {
                        searchContainer.innerHTML = '';
                        searchContainer.style.display = 'none';
                    }
                    const searchToggle = document.getElementById('seguimiento-search-toggle');
                    if (searchToggle) {
                        searchToggle.style.display = 'flex';
                    }
                    isSearchMode = false; // para que la lupa vuelva a abrir el buscador
                    currentPage = 1;
                    applyFiltersAndSearch(); // Asegurar que los filtros se apliquen antes de renderizar
                    applySorting();
                    renderTable();
                    updateResultsCount();
                    updateIndicadores();
                    initPaginator();
                }
            });
        }

        // Plan o actividad - un chip por cada valor
        if (currentFilters.plan.length > 0) {
            hasFilters = true;
            currentFilters.plan.forEach((planValue, index) => {
                chips.push({
                    type: 'plan',
                    label: 'Plan/Actividad',
                    value: planValue,
                    remove: () => {
                        // Remover solo este valor del array
                        currentFilters.plan = currentFilters.plan.filter((_, i) => i !== index);
                        if (currentFilters.plan.length === 0) {
                            const planContainer = document.getElementById('filtros-buscar-plan');
                            if (planContainer) planContainer.innerHTML = '';
                        }
                        currentPage = 1;
                        renderTable();
                        updateResultsCount();
                        updateIndicadores();
                        initPaginator();
                    }
                });
            });
        }

        // Persona - un chip por cada valor
        if (currentFilters.persona.length > 0) {
            hasFilters = true;
            currentFilters.persona.forEach((personaValue, index) => {
                chips.push({
                    type: 'persona',
                    label: 'Persona',
                    value: personaValue,
                    remove: () => {
                        // Remover solo este valor del array
                        currentFilters.persona = currentFilters.persona.filter((_, i) => i !== index);
                        // Si no quedan valores, limpiar input de personas
                        if (currentFilters.persona.length === 0) {
                            const personasContainer = document.getElementById('filtros-buscar-personas');
                            if (personasContainer) {
                                personasContainer.innerHTML = '';
                                initFilterInputs();
                            }
                        }
                        currentPage = 1;
                        renderTable();
                        updateResultsCount();
                        updateIndicadores();
                        initPaginator();
                    }
                });
            });
        }

        // Username - un chip por cada valor
        if (currentFilters.username.length > 0) {
            hasFilters = true;
            currentFilters.username.forEach((usernameValue, index) => {
                chips.push({
                    type: 'username',
                    label: 'Username',
                    value: usernameValue,
                    remove: () => {
                        // Remover solo este valor del array
                        currentFilters.username = currentFilters.username.filter((_, i) => i !== index);
                        currentPage = 1;
                        applyFiltersAndSearch();
                        applySorting();
                        renderTable();
                        updateResultsCount();
                        updateIndicadores();
                        initPaginator();
                    }
                });
            });
        }

        // Área del asignado - un chip por cada valor
        if (currentFilters.areaAsignado.length > 0) {
            hasFilters = true;
            currentFilters.areaAsignado.forEach((areaValue, index) => {
                chips.push({
                    type: 'areaAsignado',
                    label: 'Área asignado',
                    value: areaValue,
                    remove: () => {
                        currentFilters.areaAsignado = currentFilters.areaAsignado.filter((_, i) => i !== index);
                        if (currentFilters.areaAsignado.length === 0) {
                            document.querySelectorAll('#filtros-area-asignado input').forEach(cb => { cb.checked = false; });
                        }
                        currentPage = 1;
                        renderTable();
                        updateResultsCount();
                        updateIndicadores();
                        initPaginator();
                    }
                });
            });
        }
        // Área del creador - un chip por cada valor
        if (currentFilters.areaCreador.length > 0) {
            hasFilters = true;
            currentFilters.areaCreador.forEach((areaValue, index) => {
                chips.push({
                    type: 'areaCreador',
                    label: 'Área creador',
                    value: areaValue,
                    remove: () => {
                        currentFilters.areaCreador = currentFilters.areaCreador.filter((_, i) => i !== index);
                        if (currentFilters.areaCreador.length === 0) {
                            document.querySelectorAll('#filtros-area-creador input').forEach(cb => { cb.checked = false; });
                        }
                        currentPage = 1;
                        renderTable();
                        updateResultsCount();
                        updateIndicadores();
                        initPaginator();
                    }
                });
            });
        }

        // Lider - un chip por cada valor
        if (currentFilters.lider.length > 0) {
            hasFilters = true;
            currentFilters.lider.forEach((liderValue, index) => {
                chips.push({
                    type: 'lider',
                    label: 'Lider',
                    value: liderValue,
                    remove: () => {
                        // Remover solo este valor del array
                        currentFilters.lider = currentFilters.lider.filter((_, i) => i !== index);
                        currentPage = 1;
                        applyFiltersAndSearch();
                        applySorting();
                        renderTable();
                        updateResultsCount();
                        updateIndicadores();
                        initPaginator();
                    }
                });
            });
        }

        // Nombre (actividad) - un chip por cada valor
        if (currentFilters.nombre.length > 0) {
            hasFilters = true;
            currentFilters.nombre.forEach((nombreValue, index) => {
                chips.push({
                    type: 'nombre',
                    label: 'Actividad',
                    value: nombreValue,
                    remove: () => {
                        // Remover solo este valor del array
                        currentFilters.nombre = currentFilters.nombre.filter((_, i) => i !== index);
                        currentPage = 1;
                        applyFiltersAndSearch();
                        applySorting();
                        renderTable();
                        updateResultsCount();
                        updateIndicadores();
                        initPaginator();
                    }
                });
            });
        }

        // Creador - un chip por cada valor
        if (currentFilters.creador.length > 0) {
            hasFilters = true;
            currentFilters.creador.forEach((creadorValue, index) => {
                chips.push({
                    type: 'creador',
                    label: 'Creador',
                    value: creadorValue,
                    remove: () => {
                        // Remover solo este valor del array
                        currentFilters.creador = currentFilters.creador.filter((_, i) => i !== index);
                        currentPage = 1;
                        applyFiltersAndSearch();
                        applySorting();
                        renderTable();
                        updateResultsCount();
                        updateIndicadores();
                        initPaginator();
                    }
                });
            });
        }

        // Estado - un chip por cada valor
        if (currentFilters.estado.length > 0) {
            hasFilters = true;
            currentFilters.estado.forEach((estadoValue, index) => {
                chips.push({
                    type: 'estado',
                    label: 'Estado',
                    value: estadoValue,
                    remove: () => {
                        // Remover solo este valor del array
                        currentFilters.estado = currentFilters.estado.filter((_, i) => i !== index);
                        // Actualizar checkboxes en el modal
                        const estadoCheckbox = document.querySelector(`#filtros-estado input[value="${estadoValue}"]`);
                        if (estadoCheckbox) {
                            estadoCheckbox.checked = false;
                        }
                        // Actualizar checkboxes en el menú de encabezado si está abierto
                        const checkboxMenu = document.getElementById('checkbox-menu');
                        if (checkboxMenu && checkboxMenu.style.display !== 'none') {
                            const activeColumn = checkboxMenu.dataset.column;
                            if (activeColumn === 'estado') {
                                const menuCheckbox = checkboxMenu.querySelector(`input[value="${estadoValue}"]`);
                                if (menuCheckbox) {
                                    menuCheckbox.checked = false;
                                }
                            }
                        }
                        currentPage = 1;
                        applyFiltersAndSearch();
                        applySorting();
                        renderTable();
                        updateResultsCount();
                        updateIndicadores();
                        initPaginator();
                    }
                });
            });
        }

        // Prioridad - un chip por cada valor (solo tab Tareas)
        if (activeTab === 'tareas' && currentFilters.prioridad.length > 0) {
            hasFilters = true;
            currentFilters.prioridad.forEach((prioridadValue, index) => {
                chips.push({
                    type: 'prioridad',
                    label: 'Prioridad',
                    value: prioridadValue,
                    remove: () => {
                        // Remover solo este valor del array
                        currentFilters.prioridad = currentFilters.prioridad.filter((_, i) => i !== index);
                        // Actualizar checkboxes en el modal
                        const prioridadCheckbox = document.querySelector(`#filtros-prioridad input[value="${prioridadValue}"]`);
                        if (prioridadCheckbox) {
                            prioridadCheckbox.checked = false;
                        }
                        // Actualizar checkboxes en el menú de encabezado si está abierto
                        const checkboxMenu = document.getElementById('checkbox-menu');
                        if (checkboxMenu && checkboxMenu.style.display !== 'none') {
                            const activeColumn = checkboxMenu.dataset.column;
                            if (activeColumn === 'prioridad') {
                                const menuCheckbox = checkboxMenu.querySelector(`input[value="${prioridadValue}"]`);
                                if (menuCheckbox) {
                                    menuCheckbox.checked = false;
                                }
                            }
                        }
                        currentPage = 1;
                        applyFiltersAndSearch();
                        applySorting();
                        renderTable();
                        updateResultsCount();
                        updateIndicadores();
                        initPaginator();
                    }
                });
            });
        }

        // Fechas de creación
        if (currentFilters.fechaCreacionDesde || currentFilters.fechaCreacionHasta) {
            hasFilters = true;
            let fechaText = '';
            if (currentFilters.fechaCreacionDesde && currentFilters.fechaCreacionHasta) {
                fechaText = `${currentFilters.fechaCreacionDesde} - ${currentFilters.fechaCreacionHasta}`;
            } else if (currentFilters.fechaCreacionDesde) {
                fechaText = `Desde ${currentFilters.fechaCreacionDesde}`;
            } else {
                fechaText = `Hasta ${currentFilters.fechaCreacionHasta}`;
            }
            chips.push({
                type: 'fechaCreacion',
                label: 'Fecha creación',
                value: fechaText,
                remove: () => {
                    currentFilters.fechaCreacionDesde = null;
                    currentFilters.fechaCreacionHasta = null;
                    // Limpiar inputs de fecha
                    const desdeContainer = document.getElementById('filtros-fecha-creacion-desde');
                    const hastaContainer = document.getElementById('filtros-fecha-creacion-hasta');
                    if (desdeContainer) desdeContainer.innerHTML = '';
                    if (hastaContainer) hastaContainer.innerHTML = '';
                    initFilterInputs();
                    currentPage = 1;
                    renderTable();
                    updateResultsCount();
                    updateIndicadores();
                    initPaginator();
                }
            });
        }

        // Fechas de vencimiento
        if (currentFilters.fechaVencimientoDesde || currentFilters.fechaVencimientoHasta) {
            hasFilters = true;
            let fechaText = '';
            if (currentFilters.fechaVencimientoDesde && currentFilters.fechaVencimientoHasta) {
                fechaText = `${currentFilters.fechaVencimientoDesde} - ${currentFilters.fechaVencimientoHasta}`;
            } else if (currentFilters.fechaVencimientoDesde) {
                fechaText = `Desde ${currentFilters.fechaVencimientoDesde}`;
            } else {
                fechaText = `Hasta ${currentFilters.fechaVencimientoHasta}`;
            }
            chips.push({
                type: 'fechaVencimiento',
                label: 'Fecha vencimiento',
                value: fechaText,
                remove: () => {
                    currentFilters.fechaVencimientoDesde = null;
                    currentFilters.fechaVencimientoHasta = null;
                    // Limpiar inputs de fecha
                    const desdeContainer = document.getElementById('filtros-fecha-vencimiento-desde');
                    const hastaContainer = document.getElementById('filtros-fecha-vencimiento-hasta');
                    if (desdeContainer) desdeContainer.innerHTML = '';
                    if (hastaContainer) hastaContainer.innerHTML = '';
                    initFilterInputs();
                    currentPage = 1;
                    renderTable();
                    updateResultsCount();
                    updateIndicadores();
                    initPaginator();
                }
            });
        }

        // Mostrar/ocultar widget
        if (hasFilters) {
            widget.style.display = 'flex';
            container.innerHTML = chips.map(chip => `
                <div class="filtro-chip">
                    <span class="filtro-chip-label">${chip.label}:</span>
                    <span class="filtro-chip-value">${chip.value}</span>
                    <button type="button" class="filtro-chip-remove" data-chip-type="${chip.type}" aria-label="Remover filtro ${chip.label}">
                        <i class="far fa-xmark"></i>
                    </button>
                </div>
            `).join('');

            // Agregar event listeners a los botones de remover
            container.querySelectorAll('.filtro-chip-remove').forEach((btn, index) => {
                btn.addEventListener('click', function() {
                    chips[index].remove();
                    renderFiltrosAplicados();
                });
            });
        } else {
            widget.style.display = 'none';
            container.innerHTML = '';
        }
    }

    // Construir menú de columnas
    function buildColumnsMenu() {
        const list = document.getElementById('columns-menu-list');
        if (!list) return;

        const labelsTareas = {
            id: 'ID de la tarea',
            nombre: 'Nombre de la tarea',
            asignado: 'Asignado',
            creador: 'Creador',
            areaAsignado: 'Área del asignado',
            areaCreador: 'Área del creador',
            estado: 'Estado',
            prioridad: 'Prioridad',
            plan: 'Plan al que pertenece',
            fechaCreacion: 'Fecha de creación',
            fechaFinalizacion: 'Fecha de vencimiento',
            comentarios: 'Número de comentarios'
        };
        const labelsPlanes = {
            id: 'ID del plan',
            nombre: 'Nombre del plan',
            asignados: 'Personas asignadas',
            creador: 'Creador del plan',
            estado: 'Estado del plan',
            avance: 'Progreso del plan',
            fechaCreacion: 'Fecha de creación',
            fechaFinalizacion: 'Fecha de finalización'
        };
        const labels = activeTab === 'planes' ? labelsPlanes : labelsTareas;
        const columnIds = getColumnIds();

        list.innerHTML = columnIds.map(col => {
            const checked = columnVisibility[col] !== false ? ' checked' : '';
            return `<label class="columns-menu-option"><input type="checkbox" data-col="${col}"${checked}><span class="ubits-body-sm-regular">${labels[col] || col}</span></label>`;
        }).join('');

        list.querySelectorAll('input[data-col]').forEach(cb => {
            cb.addEventListener('change', function() {
                columnVisibility[this.dataset.col] = this.checked;
                renderTable();
            });
        });
    }

    // Abrir/cerrar modal de filtros (muestra los filtros del tab activo)
    function openFiltersModal() {
        const overlay = document.getElementById('filtros-modal-overlay');
        if (overlay) {
            overlay.style.display = 'flex';
            overlay.setAttribute('aria-hidden', 'false');
            initFilterInputs();
            // Sincronizar checkboxes estado/prioridad con el tab activo
            document.querySelectorAll('#filtros-estado input').forEach(function(cb) {
                cb.checked = currentFilters.estado.indexOf(cb.value) >= 0;
            });
            document.querySelectorAll('#filtros-prioridad input').forEach(function(cb) {
                cb.checked = currentFilters.prioridad.indexOf(cb.value) >= 0;
            });
            // Prioridad solo aplica a Tareas: ocultar bloque en tab Planes; en Planes el select Estado ocupa todo el ancho
            var prioridadWrap = document.getElementById('filtros-prioridad-wrap');
            if (prioridadWrap) prioridadWrap.style.display = activeTab === 'tareas' ? '' : 'none';
            var groupRow = document.getElementById('filtros-group-row');
            if (groupRow) groupRow.classList.toggle('filtros-group-row--single', activeTab !== 'tareas');
            // Inicializar dropdowns de Estado y Prioridad (select con checkboxes)
            initFilterSelectDropdowns();
        }
    }

    function closeFiltersModal() {
        const overlay = document.getElementById('filtros-modal-overlay');
        if (overlay) {
            overlay.style.display = 'none';
            overlay.setAttribute('aria-hidden', 'true');
        }
    }

    function updateFilterSelectTriggerText(triggerTextId, checkboxContainerId, placeholder) {
        var container = document.getElementById(checkboxContainerId);
        var textEl = document.getElementById(triggerTextId);
        if (!container || !textEl) return;
        var checked = container.querySelectorAll('input:checked');
        var labels = Array.from(checked).map(function (cb) { return cb.value; });
        textEl.textContent = labels.length > 0 ? labels.join(', ') : placeholder;
        var wrap = textEl.closest('.filtros-select-wrap');
        var trigger = wrap ? wrap.querySelector('.filtros-select-trigger') : null;
        if (trigger) trigger.classList.toggle('filtros-select-has-value', labels.length > 0);
    }

    function initFilterSelectDropdowns() {
        var configs = [
            { triggerId: 'filtros-estado-trigger', dropdownId: 'filtros-estado-dropdown', listId: 'filtros-estado', triggerTextId: 'filtros-estado-trigger-text', placeholder: 'Seleccionar estado' },
            { triggerId: 'filtros-prioridad-trigger', dropdownId: 'filtros-prioridad-dropdown', listId: 'filtros-prioridad', triggerTextId: 'filtros-prioridad-trigger-text', placeholder: 'Seleccionar prioridad' }
        ];
        configs.forEach(function (cfg) {
            var trigger = document.getElementById(cfg.triggerId);
            var dropdown = document.getElementById(cfg.dropdownId);
            if (!trigger || !dropdown) return;
            updateFilterSelectTriggerText(cfg.triggerTextId, cfg.listId, cfg.placeholder);
            trigger.onclick = function (e) {
                e.stopPropagation();
                e.preventDefault();
                var isOpen = dropdown.classList.contains('is-open');
                configs.forEach(function (c) {
                    var d = document.getElementById(c.dropdownId);
                    var t = document.getElementById(c.triggerId);
                    if (d) { d.setAttribute('aria-hidden', 'true'); d.classList.remove('is-open'); d.removeAttribute('style'); }
                    if (t) t.setAttribute('aria-expanded', 'false');
                });
                if (isOpen) return;
                var rect = trigger.getBoundingClientRect();
                dropdown.style.position = 'fixed';
                dropdown.style.top = (rect.bottom + 4) + 'px';
                dropdown.style.left = rect.left + 'px';
                dropdown.style.right = 'auto';
                dropdown.style.width = rect.width + 'px';
                dropdown.style.minWidth = rect.width + 'px';
                dropdown.setAttribute('aria-hidden', 'false');
                dropdown.classList.add('is-open');
                trigger.setAttribute('aria-expanded', 'true');
            };
            dropdown.querySelectorAll('input[type="checkbox"]').forEach(function (cb) {
                cb.addEventListener('change', function () {
                    updateFilterSelectTriggerText(cfg.triggerTextId, cfg.listId, cfg.placeholder);
                });
            });
        });
        var overlay = document.getElementById('filtros-modal-overlay');
        function closeAllFilterDropdowns() {
            configs.forEach(function (c) {
                var d = document.getElementById(c.dropdownId);
                var t = document.getElementById(c.triggerId);
                if (d) { d.setAttribute('aria-hidden', 'true'); d.classList.remove('is-open'); }
                if (t) t.setAttribute('aria-expanded', 'false');
            });
        }
        if (overlay) {
            overlay.removeEventListener('click', closeAllFilterDropdowns);
            overlay.addEventListener('click', function (e) {
                if (e.target === overlay || e.target.closest('.ubits-drawer-content')) {
                    var inDropdown = e.target.closest('.filtros-select-dropdown');
                    var onTrigger = e.target.closest('.filtros-select-trigger');
                    if (!inDropdown && !onTrigger) closeAllFilterDropdowns();
                }
            });
        }
    }

    // Función para crear autocomplete con checkboxes en el modal de filtros (dropdown normal)
    function createFilterAutocompleteWithCheckboxes(containerId, options, placeholder, onSelectionChange) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = '';
        
        // Cargar valores ya seleccionados
        let currentFilterValues = [];
        if (containerId === 'filtros-buscar-personas') {
            currentFilterValues = currentFilters.persona;
        } else if (containerId === 'filtros-area-asignado') {
            currentFilterValues = currentFilters.areaAsignado;
        } else if (containerId === 'filtros-area-creador') {
            currentFilterValues = currentFilters.areaCreador;
        }
        
        // Usar createInput con autocomplete normal pero con checkboxes
        if (typeof createInput === 'function') {
            createInput({
                containerId: containerId,
                type: 'autocomplete',
                placeholder: placeholder,
                size: 'md',
                autocompleteOptions: options.map((opt, i) => ({ value: opt, text: opt })),
                multiple: true,
                showCheckboxes: true,
                onChange: function(val) {
                    // Este onChange no se ejecuta en modo múltiple con checkboxes
                }
            });
            
            // Después de crear el input, interceptar cambios en los checkboxes
            setTimeout(() => {
                const dropdown = container.querySelector('.ubits-autocomplete-dropdown');
                const inputElement = container.querySelector('input');
                
                if (dropdown && inputElement) {
                    // Cargar valores seleccionados en los checkboxes
                    function loadSelectedValues() {
                        if (Array.isArray(currentFilterValues) && currentFilterValues.length > 0) {
                            dropdown.querySelectorAll('.ubits-autocomplete-checkbox').forEach(checkbox => {
                                const optionText = checkbox.closest('.ubits-autocomplete-option')?.querySelector('.ubits-autocomplete-option-text')?.textContent;
                                if (optionText && currentFilterValues.includes(optionText)) {
                                    checkbox.checked = true;
                                }
                            });
                        }
                    }
                    
                    // Observar cambios en el dropdown para cargar valores cuando se rendericen
                    const observer = new MutationObserver(function() {
                        loadSelectedValues();
                    });
                    
                    observer.observe(dropdown, { childList: true, subtree: true });
                    
                    // Cargar valores inicialmente
                    loadSelectedValues();
                    
                    // Interceptar cambios en checkboxes
                    dropdown.addEventListener('change', function(e) {
                        if (e.target.classList.contains('ubits-autocomplete-checkbox')) {
                            // Obtener todos los checkboxes marcados
                            const selectedTexts = Array.from(dropdown.querySelectorAll('.ubits-autocomplete-checkbox:checked'))
                                .map(checkbox => {
                                    const optionText = checkbox.closest('.ubits-autocomplete-option')?.querySelector('.ubits-autocomplete-option-text')?.textContent;
                                    return optionText;
                                })
                                .filter(text => text && text.trim());
                            
                            // Actualizar filtros inmediatamente
                            onSelectionChange(selectedTexts);
                        }
                    });
                }
            }, 200);
        }
    }

    // Inicializar inputs de filtros (autocomplete y calendar). Se re-ejecuta al abrir el modal para reflejar el tab activo.
    function initFilterInputs() {
        // Obtener opciones únicas de los datos
        const personas = [...new Set(SEGUIMIENTO_DATA.map(r => r.asignado && r.asignado.nombre))].filter(Boolean);
        const areasAsignado = [...new Set(SEGUIMIENTO_DATA.map(r => r.area))].filter(Boolean);
        const areasCreador = [...new Set(SEGUIMIENTO_DATA.map(r => (r.areaCreador != null ? r.areaCreador : r.area)))].filter(Boolean);

        // Buscar asignados (con checkboxes)
        createFilterAutocompleteWithCheckboxes('filtros-buscar-personas', personas, 'Buscar asignados...', (selectedValues) => {
            currentFilters.persona = selectedValues;
            currentPage = 1;
            applyFiltersAndSearch();
            applySorting();
            renderTable();
            updateResultsCount();
            updateIndicadores();
            initPaginator();
            renderFiltrosAplicados();
        });

        // Área del asignado (con checkboxes)
        createFilterAutocompleteWithCheckboxes('filtros-area-asignado', areasAsignado, 'Buscar área asignado...', (selectedValues) => {
            currentFilters.areaAsignado = selectedValues;
            currentPage = 1;
            applyFiltersAndSearch();
            applySorting();
            renderTable();
            updateResultsCount();
            updateIndicadores();
            initPaginator();
            renderFiltrosAplicados();
        });

        // Área del creador (con checkboxes)
        createFilterAutocompleteWithCheckboxes('filtros-area-creador', areasCreador, 'Buscar área creador...', (selectedValues) => {
            currentFilters.areaCreador = selectedValues;
            currentPage = 1;
            applyFiltersAndSearch();
            applySorting();
            renderTable();
            updateResultsCount();
            updateIndicadores();
            initPaginator();
            renderFiltrosAplicados();
        });

        if (typeof createInput === 'function') {
            var calendarMax = getSeguimientoCalendarMaxDate();
            // Fechas de vencimiento (límite: 3 años en el futuro)
            createInput({
                containerId: 'filtros-fecha-vencimiento-desde',
                type: 'calendar',
                placeholder: 'Desde',
                size: 'md',
                calendarMaxDate: calendarMax,
                onChange: function(val) {
                    currentFilters.fechaVencimientoDesde = val || null;
                }
            });

            createInput({
                containerId: 'filtros-fecha-vencimiento-hasta',
                type: 'calendar',
                placeholder: 'Hasta',
                size: 'md',
                calendarMaxDate: calendarMax,
                onChange: function(val) {
                    currentFilters.fechaVencimientoHasta = val || null;
                }
            });
        }
    }

    // Leer checkboxes y radios de filtros (y selección de asignados/áreas del modal)
    function readFilterCheckboxes() {
        // Tipo actividad (radio button - solo uno)
        const tipoRadio = document.querySelector('#filtros-tipo-actividad input[type="radio"]:checked');
        currentFilters.tipoActividad = tipoRadio ? [tipoRadio.value] : ['todos'];

        // Estado
        const estadoChecks = document.querySelectorAll('#filtros-estado input:checked');
        currentFilters.estado = Array.from(estadoChecks).map(cb => cb.value);

        // Prioridad (solo tab Tareas; en Planes no se usa)
        if (activeTab === 'tareas') {
        const prioridadChecks = document.querySelectorAll('#filtros-prioridad input:checked');
        currentFilters.prioridad = Array.from(prioridadChecks).map(cb => cb.value);
        } else {
            currentFilters.prioridad = [];
        }

        // Asignados: leer del autocomplete (merge con lo ya seleccionado para no perder opciones fuera del dropdown visible)
        const personasContainer = document.getElementById('filtros-buscar-personas');
        if (personasContainer) {
            const dropdown = personasContainer.querySelector('.ubits-autocomplete-dropdown');
            if (dropdown) {
                const nextPersona = new Set(currentFilters.persona || []);
                dropdown.querySelectorAll('.ubits-autocomplete-option').forEach(function(opt) {
                    const textEl = opt.querySelector('.ubits-autocomplete-option-text');
                    const cb = opt.querySelector('.ubits-autocomplete-checkbox');
                    const text = textEl ? textEl.textContent.trim() : '';
                    if (text) {
                        if (cb && cb.checked) nextPersona.add(text);
                        else nextPersona.delete(text);
                    }
                });
                currentFilters.persona = Array.from(nextPersona);
            }
        }

        // Área del asignado
        const areaAsignadoContainer = document.getElementById('filtros-area-asignado');
        if (areaAsignadoContainer) {
            const dropdown = areaAsignadoContainer.querySelector('.ubits-autocomplete-dropdown');
            if (dropdown) {
                const nextArea = new Set(currentFilters.areaAsignado || []);
                dropdown.querySelectorAll('.ubits-autocomplete-option').forEach(function(opt) {
                    const textEl = opt.querySelector('.ubits-autocomplete-option-text');
                    const cb = opt.querySelector('.ubits-autocomplete-checkbox');
                    const text = textEl ? textEl.textContent.trim() : '';
                    if (text) {
                        if (cb && cb.checked) nextArea.add(text);
                        else nextArea.delete(text);
                    }
                });
                currentFilters.areaAsignado = Array.from(nextArea);
            }
        }
        // Área del creador
        const areaCreadorContainer = document.getElementById('filtros-area-creador');
        if (areaCreadorContainer) {
            const dropdown = areaCreadorContainer.querySelector('.ubits-autocomplete-dropdown');
            if (dropdown) {
                const nextArea = new Set(currentFilters.areaCreador || []);
                dropdown.querySelectorAll('.ubits-autocomplete-option').forEach(function(opt) {
                    const textEl = opt.querySelector('.ubits-autocomplete-option-text');
                    const cb = opt.querySelector('.ubits-autocomplete-checkbox');
                    const text = textEl ? textEl.textContent.trim() : '';
                    if (text) {
                        if (cb && cb.checked) nextArea.add(text);
                        else nextArea.delete(text);
                    }
                });
                currentFilters.areaCreador = Array.from(nextArea);
            }
        }
    }

    // Limpiar filtros (solo del tab activo)
    function clearFilters() {
        filtersByTab[activeTab] = getDefaultFilters();
        currentFilters = filtersByTab[activeTab];
        
        const periodoText = document.getElementById('seguimiento-periodo-text');
        if (periodoText) periodoText.textContent = 'Últimos 7 días';

        document.querySelectorAll('#filtros-estado input, #filtros-prioridad input').forEach(cb => {
            cb.checked = false;
        });
    }

    // Limpiar todos los filtros y búsqueda (usado por empty state)
    function clearAllFilters() {
        // Limpiar búsqueda
        searchQuery = '';
        const searchContainer = document.getElementById('seguimiento-search-container');
        if (searchContainer) {
            searchContainer.innerHTML = '';
            searchContainer.style.display = 'none';
        }
        const searchToggle = document.getElementById('seguimiento-search-toggle');
        if (searchToggle) {
            searchToggle.style.display = 'flex';
        }
        isSearchMode = false; // para que la lupa vuelva a abrir el buscador al hacer clic

        // Limpiar filtros
        clearFilters();

        // Reinicializar inputs de filtros
        initFilterInputs();

        // Resetear página y renderizar
        currentPage = 1;
        applyFiltersAndSearch(); // Asegurar que los filtros se apliquen antes de renderizar
        applySorting();
        renderTable();
        updateResultsCount();
        updateIndicadores();
        initPaginator();
        renderFiltrosAplicados();

        // Cerrar modal de filtros si está abierto
        closeFiltersModal();

        if (typeof showToast === 'function') {
            showToast('success', 'Búsqueda y filtros limpiados');
        }
    }

    // Toggle menú de columnas (Dropdown Menu oficial); si no hay API, no-op
    function toggleColumnsMenu() {
        if (typeof window.getDropdownMenuHtml !== 'function') return;
        var overlayId = 'seguimiento-columns-overlay';
        var overlayEl = document.getElementById(overlayId);
        if (overlayEl && overlayEl.style.display === 'block') {
            window.closeDropdownMenu(overlayId);
            return;
        }
        var labelsTareas = { id: 'ID de la tarea', nombre: 'Nombre de la tarea', asignado: 'Asignado', creador: 'Creador', areaAsignado: 'Área del asignado', areaCreador: 'Área del creador', estado: 'Estado', prioridad: 'Prioridad', plan: 'Plan al que pertenece', fechaCreacion: 'Fecha de creación', fechaFinalizacion: 'Fecha de vencimiento', comentarios: 'Número de comentarios' };
        var labelsPlanes = { id: 'ID del plan', nombre: 'Nombre del plan', asignados: 'Personas asignadas', creador: 'Creador del plan', estado: 'Estado del plan', avance: 'Progreso del plan', fechaCreacion: 'Fecha de creación', fechaFinalizacion: 'Fecha de finalización' };
        var labels = activeTab === 'planes' ? labelsPlanes : labelsTareas;
        var columnIds = getColumnIds();
        var options = columnIds.map(function(col) {
            return { text: labels[col] || col, value: col, checkbox: true, selected: columnVisibility[col] !== false };
        });
        if (document.getElementById(overlayId)) document.getElementById(overlayId).remove();
        var html = window.getDropdownMenuHtml({ overlayId: overlayId, options: options });
        document.body.insertAdjacentHTML('beforeend', html);
        overlayEl = document.getElementById(overlayId);
        var columnsBtn = document.getElementById('seguimiento-columns-toggle');
        if (overlayEl && columnsBtn) {
            overlayEl.querySelectorAll('.ubits-dropdown-menu__option-left input[type="checkbox"]').forEach(function(cb) {
                cb.addEventListener('change', function() {
                    columnVisibility[this.dataset.value] = this.checked;
                    renderTable();
                });
            });
            overlayEl.addEventListener('click', function(ev) {
                if (ev.target === overlayEl) window.closeDropdownMenu(overlayId);
            });
            window.openDropdownMenu(overlayId, columnsBtn);
        }
    }

    // Inicializar paginador
    function initPaginator() {
        const data = getDisplayData();
        const total = data.length;
        if (typeof loadPaginator !== 'function') return;
        loadPaginator('seguimiento-paginador', {
            totalItems: total || 1,
            itemsPerPage: itemsPerPage,
            itemsPerPageOptions: [10, 20, 50, 100],
            currentPage: currentPage,
            onPageChange: function(page) {
                currentPage = page;
                renderTable();
                updateSelectAll();
                updateResultsCount();
                updateIndicadores();
            },
            onItemsPerPageChange: function(ipp) {
                itemsPerPage = ipp;
                currentPage = 1;
                renderTable();
                updateSelectAll();
                updateResultsCount();
                initPaginator();
            }
        });
    }

    // Toggle de búsqueda
    function initSearchToggle() {
        const toggle = document.getElementById('seguimiento-search-toggle');
        const container = document.getElementById('seguimiento-search-container');
        if (!toggle || !container) return;

        toggle.addEventListener('click', function(e) {
            e.stopPropagation();
            if (!isSearchMode) {
                toggle.style.display = 'none';
                container.style.display = 'flex';
                container.innerHTML = '';
                if (typeof createInput === 'function') {
                    createInput({
                        containerId: 'seguimiento-search-container',
                        type: 'search',
                        placeholder: activeTab === 'planes' ? 'Buscar plan...' : 'Buscar tareas...',
                        size: 'md',
                        onChange: function(val) {
                            searchQuery = val || '';
                            currentPage = 1;
                            applyFiltersAndSearch(); // Asegurar que los filtros se apliquen antes de renderizar
                            applySorting();
                            renderTable();
                            updateResultsCount();
                            updateIndicadores();
                            initPaginator();
                            renderFiltrosAplicados();
                        }
                    });
                    setTimeout(() => {
                        const wrap = container.querySelector('.ubits-input-wrapper');
                        if (wrap) {
                            const closeBtn = document.createElement('button');
                            closeBtn.type = 'button';
                            closeBtn.className = 'ubits-button ubits-button--secondary ubits-button--sm ubits-button--icon-only';
                            closeBtn.style.marginLeft = '8px';
                            closeBtn.innerHTML = '<i class="far fa-times"></i>';
                            closeBtn.addEventListener('click', (e) => {
                                e.stopPropagation();
                                searchQuery = '';
                                container.innerHTML = '';
                                container.style.display = 'none';
                                toggle.style.display = 'flex';
                                isSearchMode = false;
                                currentPage = 1;
                                applyFiltersAndSearch(); // Asegurar que los filtros se apliquen antes de renderizar
                                applySorting();
                                renderTable();
                                updateResultsCount();
                                updateIndicadores();
                                initPaginator();
                            });
                            container.appendChild(closeBtn);
                            const inp = wrap.querySelector('input');
                            if (inp) inp.focus();
                        }
                    }, 100);
                }
                isSearchMode = true;
            }
        });

        document.addEventListener('click', function(e) {
            if (!isSearchMode) return;
            if (container.contains(e.target) || toggle.contains(e.target)) return;
            if (!searchQuery) {
                container.innerHTML = '';
                container.style.display = 'none';
                toggle.style.display = 'flex';
                isSearchMode = false;
            }
        });
    }

    // Inicializar navegación
    function initNav() {
        if (typeof loadSidebar === 'function') loadSidebar('tareas');
        if (typeof loadSubNav === 'function') loadSubNav('top-nav-container', 'tareas');
        if (typeof loadTabBar === 'function') loadTabBar('tab-bar-container');
        if (typeof loadFloatingMenu === 'function') loadFloatingMenu('floating-menu-container');
        if (typeof loadProfileMenu === 'function') loadProfileMenu('profile-menu-container');

        setTimeout(() => {
            document.querySelectorAll('.nav-tab, .hamburger-item').forEach(el => el.classList.remove('active'));
            const tab = document.querySelector('.nav-tab[data-tab="seguimiento"]');
            if (tab) tab.classList.add('active');
            const hamburger = document.querySelector('.hamburger-item[data-tab="seguimiento"]');
            if (hamburger) hamburger.classList.add('active');
            document.querySelectorAll('.nav-button').forEach(b => b.classList.remove('active'));
            const sb = document.querySelector('.nav-button[data-section="tareas"]');
            if (sb) sb.classList.add('active');
            document.querySelectorAll('.tab-bar-item').forEach(i => i.classList.remove('active'));
            const mod = document.querySelector('.tab-bar-item[data-tab="modulos"]');
            if (mod) mod.classList.add('active');
            if (typeof setActiveAccordionLink === 'function') setActiveAccordionLink('seguimiento');
        }, 200);
    }

    // Sincronizar texto del botón de período con los filtros del tab activo
    function syncPeriodButtonFromCurrentFilters() {
        const periodoText = document.getElementById('seguimiento-periodo-text');
        if (!periodoText) return;
        const periodoTexts = {
            '7': 'Últimos 7 días',
            '15': 'Últimos 15 días',
            '30': 'Últimos 30 días',
            '90': 'Últimos 3 meses',
            '180': 'Últimos 6 meses',
            '365': 'Último año'
        };
        if (currentFilters.fechaCreacionDesde && currentFilters.fechaCreacionHasta) {
            periodoText.textContent = currentFilters.fechaCreacionDesde + ' - ' + currentFilters.fechaCreacionHasta;
        } else if (currentFilters.periodo && periodoTexts[currentFilters.periodo]) {
            periodoText.textContent = periodoTexts[currentFilters.periodo];
        } else {
            periodoText.textContent = 'Últimos 7 días';
        }
    }

    // Cambiar tab Tareas | Planes (cada tab tiene sus propios filtros)
    function switchToTab(tab) {
        if (tab !== 'tareas' && tab !== 'planes') return;
        activeTab = tab;
        currentFilters = filtersByTab[tab];
        syncPeriodButtonFromCurrentFilters();
        renderFiltrosAplicados();
        document.querySelectorAll('#seguimiento-tabs .ubits-tab').forEach(btn => {
            const isActive = btn.dataset.tab === tab;
            btn.classList.toggle('ubits-tab--active', isActive);
            btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });
        const headerTitle = document.getElementById('seguimiento-header-title');
        if (headerTitle) headerTitle.textContent = tab === 'planes' ? 'Lista de planes' : 'Lista de tareas';
        selectedIds.clear();
        currentPage = 1;
        initColumnVisibility();
        buildTableHeader();
        initSortMenu();
        initFilterMenu();
        initCheckboxMenu();
        applyFiltersAndSearch();
        applySorting();
        renderTable();
        updateSelectAll();
        updateResultsCount();
        updateIndicadores();
        initPaginator();
        buildColumnsMenu();
        toggleActionBar();
        updateActionBarVisibilityForTab();
    }

    function updateActionBarVisibilityForTab() {
        const reasignar = document.getElementById('seguimiento-reasignar');
        const cambiarPrioridad = document.getElementById('seguimiento-cambiar-prioridad');
        const cambiarEstado = document.getElementById('seguimiento-cambiar-estado');
        const cambiarFechaPlan = document.getElementById('seguimiento-cambiar-fecha-plan');
        const anadirColaborador = document.getElementById('seguimiento-anadir-colaborador');
        const descargar = document.getElementById('seguimiento-descargar');
        const eliminar = document.getElementById('seguimiento-eliminar');
        if (activeTab === 'tareas') {
            if (reasignar) reasignar.style.display = TASK_EDIT ? '' : 'none';
            if (cambiarPrioridad) cambiarPrioridad.style.display = TASK_EDIT ? '' : 'none';
            if (cambiarEstado) cambiarEstado.style.display = TASK_EDIT ? '' : 'none';
            if (cambiarFechaPlan) { cambiarFechaPlan.style.display = TASK_EDIT ? '' : 'none'; cambiarFechaPlan.title = 'Cambiar fecha de vencimiento'; }
            if (anadirColaborador) anadirColaborador.style.display = 'none';
            if (descargar) descargar.style.display = '';
            if (eliminar) eliminar.style.display = TASK_DELETE ? '' : 'none';
        } else {
            if (reasignar) reasignar.style.display = 'none';
            if (cambiarPrioridad) cambiarPrioridad.style.display = 'none';
            if (cambiarEstado) cambiarEstado.style.display = TASK_EDIT ? '' : 'none';
            if (cambiarFechaPlan) { cambiarFechaPlan.style.display = TASK_EDIT ? '' : 'none'; cambiarFechaPlan.title = 'Cambiar fecha de finalización'; }
            if (anadirColaborador) anadirColaborador.style.display = TASK_EDIT ? '' : 'none';
            if (descargar) descargar.style.display = '';
            if (eliminar) eliminar.style.display = TASK_DELETE ? '' : 'none';
        }
    }

    function initTabSwitcher() {
        document.querySelectorAll('#seguimiento-tabs .ubits-tab[data-tab]').forEach(btn => {
            btn.addEventListener('click', function() {
                switchToTab(this.dataset.tab);
            });
        });
        updateActionBarVisibilityForTab();
    }

    // Inicializar modales
    function initModals() {
        // Drawer de filtros ya no se abre desde botón (se eliminó por feedback; se usan filtros de encabezados de tabla)
        const filtersClose = document.getElementById('filtros-modal-close');
        const filtersLimpiar = document.getElementById('filtros-limpiar');
        const filtersAplicar = document.getElementById('filtros-aplicar');
        const filtersOverlay = document.getElementById('filtros-modal-overlay');

        if (filtersClose) filtersClose.addEventListener('click', closeFiltersModal);
        if (filtersLimpiar) filtersLimpiar.addEventListener('click', function() {
            clearFilters();
            currentPage = 1;
            applyFiltersAndSearch(); // Asegurar que los filtros se apliquen antes de renderizar
            applySorting();
            renderTable();
            updateResultsCount();
            updateIndicadores();
            initPaginator();
            renderFiltrosAplicados();
        });
        if (filtersAplicar) filtersAplicar.addEventListener('click', function() {
            readFilterCheckboxes();
            currentPage = 1;
            applyFiltersAndSearch(); // Asegurar que los filtros se apliquen antes de renderizar
            applySorting();
            renderTable();
            updateResultsCount();
            updateIndicadores();
            initPaginator();
            renderFiltrosAplicados();
            closeFiltersModal();
            if (typeof showToast === 'function') showToast('success', 'Filtros aplicados correctamente');
        });
        if (filtersOverlay) {
            filtersOverlay.addEventListener('click', function(e) {
                if (e.target === filtersOverlay) closeFiltersModal();
            });
        }

        // Menú columnas
        const columnsBtn = document.getElementById('seguimiento-columns-toggle');
        const columnsOverlay = document.getElementById('columns-menu-overlay');
        if (columnsBtn) columnsBtn.addEventListener('click', function(e) { e.stopPropagation(); toggleColumnsMenu(); });
        if (columnsOverlay) columnsOverlay.addEventListener('click', toggleColumnsMenu);

        // Popover asignados: al hacer clic en +N del profile list (tab Planes) se muestra lista de personas restantes (solo visualización)
        function closeAsignadosPopover() {
            const overlay = document.getElementById('asignados-popover-overlay');
            const popover = document.getElementById('asignados-popover');
            if (overlay) { overlay.style.display = 'none'; overlay.setAttribute('aria-hidden', 'true'); }
            if (popover) popover.style.display = 'none';
        }
        const asignadosOverlay = document.getElementById('asignados-popover-overlay');
        if (asignadosOverlay) asignadosOverlay.addEventListener('click', closeAsignadosPopover);
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') closeAsignadosPopover();
        });
        document.addEventListener('click', function(e) {
            const chip = e.target.closest('.ubits-profile-list__count');
            if (!chip || activeTab !== 'planes') return;
            e.preventDefault();
            e.stopPropagation();
            const tr = chip.closest('tr');
            if (!tr) return;
            const rowId = tr.dataset.id;
            const data = getDisplayData();
            const row = data.find(function(r) { return String(r.id) === String(rowId); });
            if (!row || !row.asignados || row.asignados.length <= 3) return;
            var remaining = row.asignados.slice(3);
            var listEl = document.getElementById('asignados-popover-list');
            var popover = document.getElementById('asignados-popover');
            var overlay = document.getElementById('asignados-popover-overlay');
            if (!listEl || !popover || !overlay) return;
            listEl.innerHTML = '';
            remaining.forEach(function(p) {
                var nombre = (p && (p.nombre || p.name)) || 'Sin asignar';
                var div = document.createElement('div');
                div.className = 'asignados-popover-item';
                if (typeof renderAvatar === 'function') {
                    div.innerHTML = renderAvatar(p, { size: 'sm' });
                }
                var span = document.createElement('span');
                span.className = 'ubits-body-sm-regular';
                span.textContent = nombre;
                div.appendChild(span);
                listEl.appendChild(div);
            });
            var rect = chip.getBoundingClientRect();
            popover.style.top = (rect.bottom + 4) + 'px';
            popover.style.left = rect.left + 'px';
            overlay.style.display = 'block';
            overlay.setAttribute('aria-hidden', 'false');
            popover.style.display = 'block';
        });
    }

    // Inicializar menú de período (Dropdown Menu oficial)
    function initPeriodoMenu() {
        var periodoBtn = document.getElementById('seguimiento-periodo-toggle');
        var periodoText = document.getElementById('seguimiento-periodo-text');
        if (!periodoBtn || !periodoText || typeof window.getDropdownMenuHtml !== 'function') return;

        var periodoTexts = {
            '7': 'Últimos 7 días',
            '15': 'Últimos 15 días',
            '30': 'Últimos 30 días',
            '90': 'Últimos 3 meses',
            '180': 'Últimos 6 meses',
            '365': 'Último año'
        };

        function getSelectedPeriodo() {
            if (currentFilters.fechaCreacionDesde && currentFilters.fechaCreacionHasta) return 'personalizado';
            return currentFilters.periodo || '7';
        }
        
        var selectedPeriodo = getSelectedPeriodo();
        if (selectedPeriodo !== 'personalizado' && periodoTexts[selectedPeriodo]) {
            periodoText.textContent = periodoTexts[selectedPeriodo];
        }
        
        var overlayId = 'seguimiento-periodo-overlay';
        periodoBtn.addEventListener('click', function(e) {
            e.stopPropagation();
                selectedPeriodo = getSelectedPeriodo();
            var options = [
                { text: periodoTexts['7'], value: '7', selected: selectedPeriodo === '7' },
                { text: periodoTexts['15'], value: '15', selected: selectedPeriodo === '15' },
                { text: periodoTexts['30'], value: '30', selected: selectedPeriodo === '30' },
                { text: periodoTexts['90'], value: '90', selected: selectedPeriodo === '90' },
                { text: periodoTexts['180'], value: '180', selected: selectedPeriodo === '180' },
                { text: periodoTexts['365'], value: '365', selected: selectedPeriodo === '365' },
                { text: 'Personalizado', value: 'personalizado', selected: selectedPeriodo === 'personalizado' }
            ];
            var existing = document.getElementById(overlayId);
            if (existing) existing.remove();
            var html = window.getDropdownMenuHtml({ overlayId: overlayId, options: options });
            document.body.insertAdjacentHTML('beforeend', html);
            var overlayEl = document.getElementById(overlayId);
            if (overlayEl) {
                overlayEl.querySelectorAll('.ubits-dropdown-menu__option').forEach(function(opt) {
                    opt.addEventListener('click', function() {
                        var value = this.getAttribute('data-value');
                        window.closeDropdownMenu(overlayId);
                if (value === 'personalizado') {
                    openDatePicker();
                    return;
                }
                currentFilters.fechaCreacionDesde = null;
                currentFilters.fechaCreacionHasta = null;
                periodoText.textContent = periodoTexts[value];
                currentFilters.periodo = value;
                currentPage = 1;
                renderTable();
                updateResultsCount();
                updateIndicadores();
                initPaginator();
            });
                });
                overlayEl.addEventListener('click', function(ev) {
                    if (ev.target === overlayEl) window.closeDropdownMenu(overlayId);
                });
            }
            window.openDropdownMenu(overlayId, periodoBtn, { alignRight: true });
        });
    }

    // Inicializar selector de fechas personalizado (modal inyectado: overlay contiene el contenido)
    function initDatePicker() {
        const datePickerOverlay = document.getElementById('date-picker-overlay');
        const datePickerCancelar = document.getElementById('date-picker-cancelar');
        const datePickerAplicar = document.getElementById('date-picker-aplicar');
        const fechaInicioInput = document.getElementById('date-picker-fecha-inicio');
        const fechaFinInput = document.getElementById('date-picker-fecha-fin');
        const calendarContainer = document.getElementById('date-picker-calendar');
        const datePickerClose = document.getElementById('date-picker-close');
        
        if (!datePickerOverlay) return;

        let fechaInicio = null;
        let fechaFin = null;
        let currentMonth = new Date(2026, 2, 1); // Marzo 2026
        let selectingStart = true;
        
        // Guardar estado del filtro antes de abrir
        let savedFilterState = null;

        // Función para formatear fecha para mostrar en inputs (DD/MM/YYYY)
        function formatearFechaParaInput(fecha) {
            const dia = String(fecha.getDate()).padStart(2, '0');
            const mes = String(fecha.getMonth() + 1).padStart(2, '0');
            const anio = fecha.getFullYear();
            return `${dia}/${mes}/${anio}`;
        }

        // Función para formatear fecha para mostrar en botón (DD MMM YYYY)
        function formatearFechaParaMostrar(fecha) {
            const dia = fecha.getDate();
            const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
            const mes = meses[fecha.getMonth()];
            const anio = fecha.getFullYear();
            return `${dia} ${mes} ${anio}`;
        }

        // Función para parsear fecha desde formato DD/MM/YYYY
        function parsearFechaDesdeInput(texto) {
            if (!texto || texto.trim() === '') return null;
            
            // Intentar parsear DD/MM/YYYY
            const regex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
            const match = texto.trim().match(regex);
            
            if (!match) return null;
            
            const dia = parseInt(match[1], 10);
            const mes = parseInt(match[2], 10) - 1; // Meses son 0-indexed
            const anio = parseInt(match[3], 10);
            
            // Validar rango de fechas
            if (dia < 1 || dia > 31 || mes < 0 || mes > 11 || anio < 1900 || anio > 2100) {
                return null;
            }
            
            const fecha = new Date(anio, mes, dia);
            
            // Validar que la fecha es válida (evita fechas como 31/02/2026)
            if (fecha.getDate() !== dia || fecha.getMonth() !== mes || fecha.getFullYear() !== anio) {
                return null;
            }
            
            return fecha;
        }

        // Función para abrir el selector
        window.openDatePicker = function() {
            // Guardar el estado actual del filtro antes de abrir
            savedFilterState = {
                periodo: currentFilters.periodo,
                fechaCreacionDesde: currentFilters.fechaCreacionDesde,
                fechaCreacionHasta: currentFilters.fechaCreacionHasta
            };
            
            datePickerOverlay.style.display = 'flex';
            datePickerOverlay.setAttribute('aria-hidden', 'false');
            
            // Si hay fechas guardadas, restaurarlas
            if (currentFilters.fechaCreacionDesde && currentFilters.fechaCreacionHasta) {
                fechaInicio = parseFecha(currentFilters.fechaCreacionDesde);
                fechaFin = parseFecha(currentFilters.fechaCreacionHasta);
                updateInputs();
                // Mostrar el mes de la fecha de inicio
                if (fechaInicio) {
                    currentMonth = new Date(fechaInicio);
                    currentMonth.setDate(1);
                }
            } else {
                fechaInicio = null;
                fechaFin = null;
                fechaInicioInput.value = '';
                fechaFinInput.value = '';
                // Mostrar mes actual (marzo 2026)
                currentMonth = new Date(2026, 2, 1);
            }
            
            renderCalendar();
        };

        // Función para cerrar el selector
        function closeDatePicker() {
            datePickerOverlay.style.display = 'none';
            datePickerOverlay.setAttribute('aria-hidden', 'true');
        }
        
        // Función para cancelar y restaurar estado anterior
        function cancelDatePicker() {
            // Restaurar el estado del filtro guardado
            if (savedFilterState) {
                currentFilters.periodo = savedFilterState.periodo;
                currentFilters.fechaCreacionDesde = savedFilterState.fechaCreacionDesde;
                currentFilters.fechaCreacionHasta = savedFilterState.fechaCreacionHasta;
                
                // Actualizar texto del botón según el estado restaurado
                const periodoText = document.getElementById('seguimiento-periodo-text');
                if (periodoText) {
                    if (currentFilters.periodo) {
                        const periodoTexts = {
                            '7': 'Últimos 7 días',
                            '15': 'Últimos 15 días',
                            '30': 'Últimos 30 días',
                            '90': 'Últimos 3 meses',
                            '180': 'Últimos 6 meses',
                            '365': 'Último año'
                        };
                        periodoText.textContent = periodoTexts[currentFilters.periodo] || 'Últimos 7 días';
                    } else if (currentFilters.fechaCreacionDesde && currentFilters.fechaCreacionHasta) {
                        periodoText.textContent = `${currentFilters.fechaCreacionDesde} - ${currentFilters.fechaCreacionHasta}`;
                    } else {
                        periodoText.textContent = 'Últimos 7 días';
                    }
                }
            }
            
            closeDatePicker();
        }

        // Cerrar con clic en el overlay (no en el contenido)
        datePickerOverlay.addEventListener('click', function(e) {
            if (e.target === datePickerOverlay) cancelDatePicker();
        });

        // Cerrar con botón X del header
        if (datePickerClose) {
            datePickerClose.addEventListener('click', cancelDatePicker);
        }

        // Cerrar con botón cancelar
        if (datePickerCancelar) {
            datePickerCancelar.addEventListener('click', cancelDatePicker);
        }

        // Aplicar filtro
        if (datePickerAplicar) {
            datePickerAplicar.addEventListener('click', function() {
                if (!fechaInicio || !fechaFin) {
                    if (typeof showToast === 'function') {
                        showToast('warning', 'Por favor selecciona ambas fechas');
                    }
                    return;
                }
                var maxDate = getSeguimientoCalendarMaxDate();
                if (fechaInicio.getTime() > maxDate.getTime() || fechaFin.getTime() > maxDate.getTime()) {
                    if (typeof showToast === 'function') {
                        showToast('warning', 'Las fechas no pueden ser mayores a 3 años en el futuro');
                    }
                    return;
                }

                // Formatear fechas para el filtro (formato: "1 ene 2026")
                const fechaInicioStr = formatearFechaParaMostrar(fechaInicio);
                const fechaFinStr = formatearFechaParaMostrar(fechaFin);

                // Aplicar filtro personalizado
                currentFilters.periodo = null; // Limpiar filtro de período
                currentFilters.fechaCreacionDesde = fechaInicioStr;
                currentFilters.fechaCreacionHasta = fechaFinStr;

                // Actualizar texto del botón
                const periodoText = document.getElementById('seguimiento-periodo-text');
                if (periodoText) {
                    periodoText.textContent = `${fechaInicioStr} - ${fechaFinStr}`;
                }

                // Resetear página y renderizar
                currentPage = 1;
                applyFiltersAndSearch();
                applySorting();
                renderTable();
                updateResultsCount();
                updateIndicadores();
                initPaginator();

                closeDatePicker();
            });
        }



        // Actualizar inputs
        function updateInputs() {
            if (fechaInicio) {
                fechaInicioInput.value = formatearFechaParaInput(fechaInicio);
            } else {
                fechaInicioInput.value = '';
            }
            if (fechaFin) {
                fechaFinInput.value = formatearFechaParaInput(fechaFin);
            } else {
                fechaFinInput.value = '';
            }
        }

        // Manejar cambios en inputs de fecha
        function initDateInputs() {
            // Input de fecha de inicio
            fechaInicioInput.addEventListener('blur', function() {
                const texto = this.value.trim();
                if (texto === '') {
                    fechaInicio = null;
                    renderCalendar();
                    return;
                }
                
                const fecha = parsearFechaDesdeInput(texto);
                if (fecha) {
                    fecha.setHours(0, 0, 0, 0);
                    if (fecha.getTime() > getSeguimientoCalendarMaxDate().getTime()) {
                        this.value = '';
                        fechaInicio = null;
                        if (typeof showToast === 'function') showToast('warning', 'La fecha no puede ser mayor a 3 años en el futuro');
                        renderCalendar();
                        return;
                    }
                    fechaInicio = fecha;
                    this.value = formatearFechaParaInput(fechaInicio);
                    
                    // Actualizar mes mostrado si es necesario
                    if (fechaInicio.getMonth() !== currentMonth.getMonth() || 
                        fechaInicio.getFullYear() !== currentMonth.getFullYear()) {
                        currentMonth = new Date(fechaInicio);
                        currentMonth.setDate(1);
                    }
                    
                    renderCalendar();
                } else if (texto !== '') {
                    // Fecha inválida, restaurar valor anterior si existe
                    if (fechaInicio) {
                        this.value = formatearFechaParaInput(fechaInicio);
                    } else {
                        this.value = '';
                    }
                }
            });

            // Input de fecha de fin
            fechaFinInput.addEventListener('blur', function() {
                const texto = this.value.trim();
                if (texto === '') {
                    fechaFin = null;
                    renderCalendar();
                    return;
                }
                
                const fecha = parsearFechaDesdeInput(texto);
                if (fecha) {
                    fecha.setHours(23, 59, 59, 999);
                    if (fecha.getTime() > getSeguimientoCalendarMaxDate().getTime()) {
                        this.value = '';
                        fechaFin = null;
                        if (typeof showToast === 'function') showToast('warning', 'La fecha no puede ser mayor a 3 años en el futuro');
                        renderCalendar();
                        return;
                    }
                    fechaFin = fecha;
                    this.value = formatearFechaParaInput(fechaFin);
                    
                    // Actualizar mes mostrado si es necesario
                    if (fechaFin.getMonth() !== currentMonth.getMonth() || 
                        fechaFin.getFullYear() !== currentMonth.getFullYear()) {
                        currentMonth = new Date(fechaFin);
                        currentMonth.setDate(1);
                    }
                    
                    renderCalendar();
                } else if (texto !== '') {
                    // Fecha inválida, restaurar valor anterior si existe
                    if (fechaFin) {
                        this.value = formatearFechaParaInput(fechaFin);
                    } else {
                        this.value = '';
                    }
                }
            });

            // Permitir Enter para aplicar
            fechaInicioInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    this.blur();
                }
            });

            fechaFinInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    this.blur();
                }
            });
        }

        // Renderizar calendario oficial UBITS (createCalendar) en modo rango en el modal de fecha personalizada (límite: 3 años en el futuro)
        function renderCalendar() {
            if (!calendarContainer || typeof window.createCalendar !== 'function') return;
            calendarContainer.innerHTML = '';
            var initialDate = currentMonth ? new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1) : new Date();
            window.createCalendar({
                containerId: 'date-picker-calendar',
                range: true,
                initialDate: initialDate,
                selectedStartDate: fechaInicio || undefined,
                selectedEndDate: fechaFin || undefined,
                maxDate: getSeguimientoCalendarMaxDate(),
                onRangeSelect: function (startStr, endStr) {
                    if (!startStr) return;
                    var partsInicio = startStr.split('/').map(Number);
                    fechaInicio = new Date(partsInicio[2], partsInicio[1] - 1, partsInicio[0]);
                    fechaInicio.setHours(0, 0, 0, 0);
                    if (endStr) {
                        var partsFin = endStr.split('/').map(Number);
                        fechaFin = new Date(partsFin[2], partsFin[1] - 1, partsFin[0]);
                        fechaFin.setHours(23, 59, 59, 999);
                    } else {
                        fechaFin = null;
                    }
                    updateInputs();
                    renderCalendar();
                }
            });
        }

        // Inicializar event listeners de inputs
        initDateInputs();
    }

    // Inicializar menú de ordenamiento (Dropdown Menu oficial, sin footer: se aplica al hacer clic en la opción).
    function initSortMenu() {
        if (typeof window.getDropdownMenuHtml !== 'function') return;
        var overlayId = 'seguimiento-sort-overlay';

        document.addEventListener('click', function(e) {
            var btn = e.target.closest('.seguimiento-date-sort-btn');
            if (!btn) return;
                e.stopPropagation();
            var col = btn.dataset.sort;
            var isAvance = col === 'avance';
            var descText = isAvance ? 'Más avance primero' : 'Más reciente primero';
            var ascText = isAvance ? 'Menos avance primero' : 'Más reciente al final';
            var currentDir = currentSort.column === col ? currentSort.direction : null;
            var options = [
                { text: descText, value: 'desc', leftIcon: 'arrow-down', selected: currentDir === 'desc' },
                { text: ascText, value: 'asc', leftIcon: 'arrow-up', selected: currentDir === 'asc' }
            ];
            var existing = document.getElementById(overlayId);
            if (existing) existing.remove();
            var config = { overlayId: overlayId, options: options };
            var html = window.getDropdownMenuHtml(config);
            document.body.insertAdjacentHTML('beforeend', html);
            var overlayEl = document.getElementById(overlayId);
            if (overlayEl) {
                overlayEl.querySelectorAll('.ubits-dropdown-menu__option').forEach(function(opt) {
            opt.addEventListener('click', function() {
                        var dir = this.getAttribute('data-value');
                        currentSort.column = col;
                        currentSort.direction = dir;
                    renderTable();
                        window.closeDropdownMenu(overlayId);
            });
        });
                overlayEl.addEventListener('click', function(ev) {
                    if (ev.target === overlayEl) window.closeDropdownMenu(overlayId);
                });
            }
            window.openDropdownMenu(overlayId, btn);
        });
    }

    // Inicializar menú de filtro por columna (Dropdown Menu oficial: autocomplete + hasta 5 ítems visibles que cambian al escribir, datos deduplicados)
    function initFilterMenu() {
        if (typeof window.getDropdownMenuHtml !== 'function') return;
        var baseData = function() { return getDataFilteredByPeriodAndSearchOnly(); };
        // Datos deduplicados con Set (una sola vez cada valor)
        var filterDataMap = {
            nombre: function() { var d = baseData(); return [...new Set(d.map(function(r) { return r.nombre; }).filter(Boolean))].sort(function(a, b) { return a.localeCompare(b, 'es'); }); },
            asignado: function() { var d = baseData(); return [...new Set(d.map(function(r) { return r.asignado && r.asignado.nombre; }).filter(Boolean))].sort(function(a, b) { return a.localeCompare(b, 'es'); }); },
            username: function() { var d = baseData(); return [...new Set(d.map(function(r) { return r.asignado && r.asignado.username; }).filter(Boolean))].sort(function(a, b) { return a.localeCompare(b, 'es'); }); },
            areaAsignado: function() { var d = baseData(); return [...new Set(d.map(function(r) { return r.area; }).filter(Boolean))].sort(function(a, b) { return a.localeCompare(b, 'es'); }); },
            areaCreador: function() { var d = baseData(); return [...new Set(d.map(function(r) { return (r.areaCreador != null ? r.areaCreador : r.area); }).filter(Boolean))].sort(function(a, b) { return a.localeCompare(b, 'es'); }); },
            lider: function() { var d = baseData(); return [...new Set(d.map(function(r) { return r.lider; }).filter(Boolean))].sort(function(a, b) { return a.localeCompare(b, 'es'); }); },
            plan: function() { var d = baseData(); return [...new Set(d.map(function(r) { return r.plan; }).filter(Boolean))].sort(function(a, b) { return a.localeCompare(b, 'es'); }); },
            creador: function() { var d = baseData(); return [...new Set(d.map(function(r) { return r.creador; }).filter(Boolean))].sort(function(a, b) { return a.localeCompare(b, 'es'); }); }
        };
        var overlayId = 'seguimiento-filter-overlay';
        var FILTER_VISIBLE_MAX = 5;

        document.addEventListener('click', function(e) {
            var btn = e.target.closest('.seguimiento-filter-btn');
            if (!btn) return;
                e.stopPropagation();
            var col = btn.dataset.filter;
            var currentFilterValues = [];
            if (col === 'asignado') currentFilterValues = currentFilters.persona;
            else if (col === 'username') currentFilterValues = currentFilters.username;
            else if (col === 'plan') currentFilterValues = currentFilters.plan;
            else if (col === 'areaAsignado') currentFilterValues = currentFilters.areaAsignado;
            else if (col === 'areaCreador') currentFilterValues = currentFilters.areaCreador;
            else if (col === 'lider') currentFilterValues = currentFilters.lider;
            else if (col === 'nombre') currentFilterValues = currentFilters.nombre;
            else if (col === 'creador') currentFilterValues = currentFilters.creador;
            if (!Array.isArray(currentFilterValues)) currentFilterValues = [];

            var allOptions = (filterDataMap[col] || function() { return []; })();
            var options = allOptions.map(function(v) {
                return { text: v, value: v, checkbox: true, selected: currentFilterValues.indexOf(v) >= 0 };
            });
            var existing = document.getElementById(overlayId);
            if (existing) existing.remove();
            var autocompleteContainerId = overlayId + '-autocomplete';
            var config = {
                overlayId: overlayId,
                hasAutocomplete: true,
                autocompletePlaceholder: 'Filtrar por ' + col + '...',
                autocompleteContainerId: autocompleteContainerId,
                options: options,
                footerSecondaryLabel: 'Cancelar',
                footerPrimaryLabel: 'Aplicar',
                footerSecondaryId: overlayId + '-cancel',
                footerPrimaryId: overlayId + '-apply'
            };
            var html = window.getDropdownMenuHtml(config);
            document.body.insertAdjacentHTML('beforeend', html);
            var overlayEl = document.getElementById(overlayId);
            if (overlayEl) {
                var optionsContainer = overlayEl.querySelector('.ubits-dropdown-menu__options');
                var optionButtons = optionsContainer ? optionsContainer.querySelectorAll('.ubits-dropdown-menu__option') : [];

                function filterVisibleOptions(searchVal) {
                    var q = normalizeText(searchVal || '');
                    var shown = 0;
                    optionButtons.forEach(function(opt) {
                        var textEl = opt.querySelector('.ubits-dropdown-menu__option-text');
                        var text = textEl ? textEl.textContent : '';
                        var match = !q || normalizeText(text).indexOf(q) >= 0;
                        if (match && shown < FILTER_VISIBLE_MAX) {
                            opt.style.display = '';
                            shown++;
                            } else {
                            opt.style.display = 'none';
                        }
                    });
                }

                var inputEl = document.getElementById(overlayId + '-autocomplete-input');
                var clearIcon = document.getElementById(overlayId + '-autocomplete-clear');
                if (inputEl && clearIcon) {
                    inputEl.placeholder = 'Filtrar por ' + col + '...';
                    inputEl.value = '';
                    inputEl.setAttribute('aria-label', 'Filtrar por ' + col);
                    clearIcon.style.pointerEvents = 'auto';
                    clearIcon.style.display = 'none';
                    function toggleClearIcon() {
                        clearIcon.style.display = inputEl.value.length > 0 ? 'block' : 'none';
                    }
                    clearIcon.addEventListener('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        inputEl.value = '';
                        toggleClearIcon();
                        filterVisibleOptions('');
                        inputEl.focus();
                    });
                    inputEl.addEventListener('input', function() {
                        toggleClearIcon();
                        filterVisibleOptions(this.value);
                    });
                    inputEl.addEventListener('focus', function() {
                        filterVisibleOptions(this.value);
                    });
                    filterVisibleOptions('');
                    setTimeout(function() { inputEl.focus(); }, 100);
                    } else {
                    filterVisibleOptions('');
                }

                var cancelBtn = document.getElementById(overlayId + '-cancel');
                var applyBtn = document.getElementById(overlayId + '-apply');
                if (cancelBtn) cancelBtn.addEventListener('click', function() { window.closeDropdownMenu(overlayId); });
                if (applyBtn) applyBtn.addEventListener('click', function() {
                    var selectedOptions = [];
                    overlayEl.querySelectorAll('.ubits-dropdown-menu__option-left input[type="checkbox"]:checked').forEach(function(cb) {
                        var v = cb.dataset.value;
                        if (v && v.trim()) selectedOptions.push(v);
                    });
                    if (col === 'asignado') currentFilters.persona = selectedOptions;
                    else if (col === 'username') currentFilters.username = selectedOptions;
                    else if (col === 'plan') currentFilters.plan = selectedOptions;
                    else if (col === 'areaAsignado') currentFilters.areaAsignado = selectedOptions;
                    else if (col === 'areaCreador') currentFilters.areaCreador = selectedOptions;
                    else if (col === 'lider') currentFilters.lider = selectedOptions;
                    else if (col === 'nombre') currentFilters.nombre = selectedOptions;
                    else if (col === 'creador') currentFilters.creador = selectedOptions;
                    currentPage = 1;
                    applyFiltersAndSearch();
                    applySorting();
                    renderTable();
                    updateResultsCount();
                    updateIndicadores();
                    initPaginator();
                    renderFiltrosAplicados();
                    window.closeDropdownMenu(overlayId);
                });
                overlayEl.addEventListener('click', function(ev) {
                    if (ev.target === overlayEl) window.closeDropdownMenu(overlayId);
                });
            }
            window.openDropdownMenu(overlayId, btn);
        });
    }

    // Inicializar menú de checkboxes Estado/Prioridad (Dropdown Menu oficial)
    function initCheckboxMenu() {
        if (typeof window.getDropdownMenuHtml !== 'function') return;
        var optionsMap = { estado: ['Iniciada', 'Vencida', 'Finalizada'], prioridad: ['Alta', 'Media', 'Baja'] };
        var overlayId = 'seguimiento-checkbox-overlay';

        document.addEventListener('click', function(e) {
            var btn = e.target.closest('.seguimiento-checkbox-btn');
            if (!btn) return;
                e.stopPropagation();
            var col = btn.dataset.checkbox;
            var opts = optionsMap[col] || [];
            var currentSelected = col === 'estado' ? currentFilters.estado : currentFilters.prioridad;
            var options = opts.map(function(opt) {
                return { text: opt, value: opt, checkbox: true, selected: currentSelected.indexOf(opt) >= 0 };
            });
            var existing = document.getElementById(overlayId);
            if (existing) existing.remove();
            var config = { overlayId: overlayId, options: options };
            var html = window.getDropdownMenuHtml(config);
            document.body.insertAdjacentHTML('beforeend', html);
            var overlayEl = document.getElementById(overlayId);
            if (overlayEl) {
                function applyCheckboxSelection() {
                    var selected = [];
                    overlayEl.querySelectorAll('.ubits-dropdown-menu__option-left input[type="checkbox"]:checked').forEach(function(cb) {
                        selected.push(cb.dataset.value);
                    });
                    if (col === 'estado') {
                            currentFilters.estado = selected;
                        document.querySelectorAll('#filtros-estado input').forEach(function(modalCb) {
                            modalCb.checked = selected.indexOf(modalCb.value) >= 0;
                            });
                    } else if (col === 'prioridad') {
                            currentFilters.prioridad = selected;
                        document.querySelectorAll('#filtros-prioridad input').forEach(function(modalCb) {
                            modalCb.checked = selected.indexOf(modalCb.value) >= 0;
                            });
                        }
                        currentPage = 1;
                    applyFiltersAndSearch();
                        applySorting();
                        renderTable();
                        updateResultsCount();
                        updateIndicadores();
                        initPaginator();
                        renderFiltrosAplicados();
                }
                overlayEl.querySelectorAll('.ubits-dropdown-menu__option-left input[type="checkbox"]').forEach(function(cb) {
                    cb.addEventListener('change', applyCheckboxSelection);
                });
                overlayEl.addEventListener('click', function(ev) {
                    if (ev.target === overlayEl) window.closeDropdownMenu(overlayId);
                });
            }
            window.openDropdownMenu(overlayId, btn);
        });
    }

    // Inicializar checkboxes
    function initCheckboxes() {
        const selectAll = document.getElementById('seguimiento-select-all');
        if (selectAll) {
            selectAll.addEventListener('change', function() {
                const check = this.checked;
                const data = getDisplayData();
                const start = (currentPage - 1) * itemsPerPage;
                const pageData = data.slice(start, start + itemsPerPage);

                document.querySelectorAll('#seguimiento-tbody .seguimiento-row-check').forEach(cb => {
                    cb.checked = check;
                    const id = Number(cb.dataset.id);
                    if (check) selectedIds.add(id);
                    else selectedIds.delete(id);
                });
                toggleActionBar();
            });
        }
    }

    // Inicializar "Ver seleccionados"
    function initVerSeleccionados() {
        const btn = document.getElementById('seguimiento-ver-seleccionados');
        if (!btn) return;
        btn.addEventListener('click', function() {
            if (selectedIds.size === 0) return;
            viewOnlySelected = !viewOnlySelected;
            currentPage = 1;
            renderTable();
            initPaginator();
            updateResultsCount();
            updateIndicadores();
            toggleActionBar();
        });
    }

    // Inicializar botones de acción
    function initActionButtons() {
        // Eliminar
        const eliminar = document.getElementById('seguimiento-eliminar');
        const deleteOverlay = document.getElementById('delete-modal-overlay');
        const deleteClose = document.getElementById('delete-modal-close');
        const deleteCancel = document.getElementById('delete-modal-cancel');
        const deleteConfirm = document.getElementById('delete-modal-confirm');
        const deleteCount = document.getElementById('delete-count');
        const deleteTypeInput = document.getElementById('delete-modal-type-input');

        var deleteBodyText = document.querySelector('#delete-modal-overlay .ubits-modal-body p.ubits-body-md-regular');
        if (eliminar) {
            eliminar.addEventListener('click', function() {
                if (selectedIds.size === 0) return;
                if (deleteCount) deleteCount.textContent = selectedIds.size;
                if (deleteBodyText) deleteBodyText.innerHTML = activeTab === 'planes'
                    ? '¿Estás seguro de que deseas eliminar <strong id="delete-count">' + selectedIds.size + '</strong> plan(es) seleccionado(s)?'
                    : '¿Estás seguro de que deseas eliminar <strong id="delete-count">' + selectedIds.size + '</strong> elemento(s) seleccionado(s)?';
                if (deleteTypeInput) {
                    deleteTypeInput.value = '';
                    deleteTypeInput.focus();
                }
                if (deleteConfirm) deleteConfirm.disabled = true;
                if (deleteOverlay) {
                    deleteOverlay.style.display = 'flex';
                    deleteOverlay.setAttribute('aria-hidden', 'false');
                }
            });
        }

        if (deleteTypeInput && deleteConfirm) {
            deleteTypeInput.addEventListener('input', function() {
                deleteConfirm.disabled = this.value.trim().toLowerCase() !== 'eliminar';
            });
        }

        function closeDeleteModal() {
            if (deleteOverlay) {
                deleteOverlay.style.display = 'none';
                deleteOverlay.setAttribute('aria-hidden', 'true');
            }
            if (deleteTypeInput) deleteTypeInput.value = '';
            if (deleteConfirm) deleteConfirm.disabled = true;
        }

        if (deleteClose) deleteClose.addEventListener('click', closeDeleteModal);
        if (deleteCancel) deleteCancel.addEventListener('click', closeDeleteModal);
        if (deleteOverlay) {
            deleteOverlay.addEventListener('click', function(e) {
                if (e.target === deleteOverlay) closeDeleteModal();
            });
        }
        if (deleteConfirm) {
            deleteConfirm.addEventListener('click', function() {
                var idsToRemove = Array.from(selectedIds);
                closeDeleteModal();
                // Simular eliminación: quitar de datos y refrescar (Tareas y Planes)
                SEGUIMIENTO_DATA = SEGUIMIENTO_DATA.filter(function(r) { return !selectedIds.has(r.id); });
                selectedIds.clear();
                applyFiltersAndSearch();
                applySorting();
                renderTable();
                updateSelectAll();
                updateResultsCount();
                updateIndicadores();
                initPaginator();
                toggleActionBar();
                if (typeof showToast === 'function') showToast('success', idsToRemove.length + ' elemento(s) eliminado(s) correctamente');
            });
        }

        // Cambiar prioridad (Dropdown Menu oficial)
        const cambiarPrioridad = document.getElementById('seguimiento-cambiar-prioridad');
        if (cambiarPrioridad && typeof window.getDropdownMenuHtml === 'function') {
            cambiarPrioridad.addEventListener('click', function(e) {
                e.stopPropagation();
                if (selectedIds.size === 0) return;
                var overlayId = 'seguimiento-priority-overlay';
                var existing = document.getElementById(overlayId);
                if (existing) existing.remove();
                var config = {
                    overlayId: overlayId,
                    options: [
                        { text: 'Alta', value: 'Alta' },
                        { text: 'Media', value: 'Media' },
                        { text: 'Baja', value: 'Baja' }
                    ]
                };
                var html = window.getDropdownMenuHtml(config);
                document.body.insertAdjacentHTML('beforeend', html);
                var overlayEl = document.getElementById(overlayId);
                if (overlayEl) {
                    overlayEl.querySelectorAll('.ubits-dropdown-menu__option').forEach(function(opt) {
                opt.addEventListener('click', function() {
                            var val = this.getAttribute('data-value');
                            selectedIds.forEach(function(id) {
                                var row = SEGUIMIENTO_DATA.find(function(r) { return r.id === id; });
                        if (row) row.prioridad = val;
                    });
                            window.closeDropdownMenu(overlayId);
                    renderTable();
                            if (typeof showToast === 'function') showToast('success', 'Prioridad cambiada a ' + val + ' para ' + selectedIds.size + ' elemento(s)');
                });
            });
                    overlayEl.addEventListener('click', function(ev) {
                        if (ev.target === overlayEl) window.closeDropdownMenu(overlayId);
                    });
                }
                window.openDropdownMenu(overlayId, cambiarPrioridad);
            });
        }

        // Cambiar estado (Dropdown Menu oficial; Planes: modal reabrir/finalizar)
        const cambiarEstado = document.getElementById('seguimiento-cambiar-estado');
            var reabrirPlanOverlay = document.getElementById('reabrir-plan-overlay');
            var reabrirPlanTitle = document.getElementById('reabrir-plan-title');
            var reabrirPlanMessage = document.getElementById('reabrir-plan-message');
            var reabrirPlanCancel = document.getElementById('reabrir-plan-cancel');
            var reabrirPlanConfirm = document.getElementById('reabrir-plan-confirm');
            var reabrirPlanClose = document.getElementById('reabrir-plan-close');
            var pendingReabrirPlan = null;

            function closeReabrirPlanModal() {
                if (reabrirPlanOverlay) { reabrirPlanOverlay.style.display = 'none'; reabrirPlanOverlay.setAttribute('aria-hidden', 'true'); }
                pendingReabrirPlan = null;
            }

            function applyReabrirPlan() {
                if (!pendingReabrirPlan) return;
                var val = pendingReabrirPlan.val;
                var planNames = pendingReabrirPlan.planNames;
                selectedIds.forEach(function(id) {
                    var row = SEGUIMIENTO_DATA.find(function(r) { return r.id === id; });
                    if (row) row.estado = val;
                });
                if (planNames && planNames.length > 0) {
                    SEGUIMIENTO_DATA.forEach(function(r) {
                        if (r.tipo === 'tarea' && planNames.indexOf(r.plan) >= 0) r.estado = val;
                    });
                }
                closeReabrirPlanModal();
                renderTable();
                updateIndicadores();
                if (typeof showToast === 'function') showToast('success', 'Estado cambiado a ' + val + ' para ' + selectedIds.size + ' plan(es) y sus tareas asociadas');
            }

        if (reabrirPlanOverlay) reabrirPlanOverlay.addEventListener('click', function(e) { if (e.target === reabrirPlanOverlay) closeReabrirPlanModal(); });
        if (reabrirPlanClose) reabrirPlanClose.addEventListener('click', closeReabrirPlanModal);
        if (reabrirPlanCancel) reabrirPlanCancel.addEventListener('click', closeReabrirPlanModal);
            if (reabrirPlanConfirm) reabrirPlanConfirm.addEventListener('click', applyReabrirPlan);

        if (cambiarEstado && typeof window.getDropdownMenuHtml === 'function') {
            cambiarEstado.addEventListener('click', function(e) {
                e.stopPropagation();
                if (selectedIds.size === 0) return;
                var overlayId = 'seguimiento-status-overlay';
                var existing = document.getElementById(overlayId);
                if (existing) existing.remove();
                var statusOptions = activeTab === 'planes'
                    ? [{ text: 'Iniciada', value: 'Iniciada' }, { text: 'Finalizada', value: 'Finalizada' }]
                    : [{ text: 'Iniciada', value: 'Iniciada' }, { text: 'Vencida', value: 'Vencida' }, { text: 'Finalizada', value: 'Finalizada' }];
                var config = { overlayId: overlayId, options: statusOptions };
                var html = window.getDropdownMenuHtml(config);
                document.body.insertAdjacentHTML('beforeend', html);
                var overlayEl = document.getElementById(overlayId);
                if (overlayEl) {
                    overlayEl.querySelectorAll('.ubits-dropdown-menu__option').forEach(function(opt) {
                opt.addEventListener('click', function() {
                            var val = this.getAttribute('data-value');
                            window.closeDropdownMenu(overlayId);
                    if (activeTab === 'planes' && (val === 'Iniciada' || val === 'Finalizada')) {
                        var selectedPlans = SEGUIMIENTO_DATA.filter(function(r) { return r.tipo === 'plan' && selectedIds.has(r.id); });
                        var planNames = selectedPlans.map(function(p) { return p.nombre; });
                        pendingReabrirPlan = { val: val, planNames: planNames };
                        if (reabrirPlanTitle) reabrirPlanTitle.textContent = val === 'Iniciada' ? 'Reabrir plan(es)' : 'Finalizar plan(es)';
                        if (reabrirPlanMessage) {
                                    reabrirPlanMessage.textContent = val === 'Iniciada'
                                        ? 'Al reabrir este(s) plan(es), las tareas asociadas pasar\u00e1n a estado Iniciada. \u00bfContinuar?'
                                        : 'Al finalizar este(s) plan(es), las tareas asociadas pasar\u00e1n a estado Finalizada. \u00bfContinuar?';
                        }
                        if (reabrirPlanOverlay) { reabrirPlanOverlay.style.display = 'flex'; reabrirPlanOverlay.setAttribute('aria-hidden', 'false'); }
                        return;
                    }
                    selectedIds.forEach(function(id) {
                        var row = SEGUIMIENTO_DATA.find(function(r) { return r.id === id; });
                        if (row) row.estado = val;
                    });
                    renderTable();
                    updateIndicadores();
                    if (typeof showToast === 'function') showToast('success', 'Estado cambiado a ' + val + ' para ' + selectedIds.size + ' elemento(s)');
                });
            });
                    overlayEl.addEventListener('click', function(ev) {
                        if (ev.target === overlayEl) window.closeDropdownMenu(overlayId);
                    });
                }
                window.openDropdownMenu(overlayId, cambiarEstado);
            });
        }

        // Reasignar (Dropdown Menu oficial: autocomplete + footer)
        var reasignar = document.getElementById('seguimiento-reasignar');
        if (reasignar && typeof window.getDropdownMenuHtml === 'function') {
            reasignar.addEventListener('click', function(e) {
                e.stopPropagation();
                if (selectedIds.size === 0) return;
                var overlayId = 'seguimiento-reasignar-overlay';
                var autocompleteContainerId = overlayId + '-autocomplete';
                var reasignarPersona = null;
                var existing = document.getElementById(overlayId);
                if (existing) existing.remove();
                var config = {
                    overlayId: overlayId,
                    hasAutocomplete: true,
                    autocompletePlaceholder: 'Buscar persona...',
                    autocompleteContainerId: autocompleteContainerId,
                    footerSecondaryLabel: 'Cancelar',
                    footerPrimaryLabel: 'Aplicar',
                    footerSecondaryId: overlayId + '-cancel',
                    footerPrimaryId: overlayId + '-apply'
                };
                var html = window.getDropdownMenuHtml(config);
                document.body.insertAdjacentHTML('beforeend', html);
                var overlayEl = document.getElementById(overlayId);
                if (overlayEl) {
                    var personas = [];
                    SEGUIMIENTO_DATA.forEach(function(r) {
                        var n = r.asignado && r.asignado.nombre;
                        if (n && personas.indexOf(n) < 0) personas.push(n);
                    });
                    if (typeof createInput === 'function') {
                    createInput({
                            containerId: autocompleteContainerId,
                        type: 'autocomplete',
                        placeholder: 'Buscar persona...',
                        size: 'md',
                            autocompleteOptions: personas.map(function(p, i) { return { value: String(i), text: p }; }),
                        onChange: function(val) {
                                reasignarPersona = personas[parseInt(val, 10)] || val || null;
                        }
                    });
                }
                    var cancelBtn = document.getElementById(overlayId + '-cancel');
                    var applyBtn = document.getElementById(overlayId + '-apply');
                    if (cancelBtn) cancelBtn.addEventListener('click', function() { window.closeDropdownMenu(overlayId); });
                    if (applyBtn) applyBtn.addEventListener('click', function() {
                    if (reasignarPersona) {
                            var personaExistente = SEGUIMIENTO_DATA.find(function(r) { return r.asignado && r.asignado.nombre === reasignarPersona; }) || SEGUIMIENTO_DATA.find(function(r) { return r.asignados && r.asignados.some(function(a) { return a.nombre === reasignarPersona; }); });
                            var avatarPersona = personaExistente && (personaExistente.asignado || (personaExistente.asignados && personaExistente.asignados[0])) ? (personaExistente.asignado || personaExistente.asignados[0]).avatar : null;
                            var usernamePersona = personaExistente && (personaExistente.asignado || (personaExistente.asignados && personaExistente.asignados[0])) ? (personaExistente.asignado || personaExistente.asignados[0]).username || '' : '';
                            var nuevoAsignado = { nombre: reasignarPersona, avatar: avatarPersona, username: usernamePersona };
                            selectedIds.forEach(function(id) {
                                var row = SEGUIMIENTO_DATA.find(function(r) { return r.id === id; });
                            if (row) {
                                if (row.tipo === 'tarea' && row.plan) {
                                    var plan = SEGUIMIENTO_DATA.find(function(r) { return r.tipo === 'plan' && r.nombre === row.plan; });
                                        if (plan && plan.asignados && Array.isArray(plan.asignados) && !plan.asignados.some(function(a) { return a.nombre === reasignarPersona; })) {
                                            plan.asignados.push(nuevoAsignado);
                                    }
                                }
                                row.asignado = { nombre: reasignarPersona, avatar: avatarPersona, username: usernamePersona };
                            }
                        });
                        renderTable();
                        updateIndicadores();
                        if (typeof showToast === 'function') showToast('success', selectedIds.size + ' elemento(s) reasignado(s) a ' + reasignarPersona);
                    }
                        window.closeDropdownMenu(overlayId);
                    });
                    overlayEl.addEventListener('click', function(ev) {
                        if (ev.target === overlayEl) window.closeDropdownMenu(overlayId);
                    });
                }
                window.openDropdownMenu(overlayId, reasignar);
            });
        }

        // Descargar: menú desplegable con Excel y CSV (Dropdown Menu oficial)
        const descargar = document.getElementById('seguimiento-descargar');

        function closeDescargarMenu() {
            if (typeof window.closeDropdownMenu === 'function') window.closeDropdownMenu('seguimiento-descargar-overlay');
            if (descargar) descargar.setAttribute('aria-expanded', 'false');
        }

        function doDownloadExport(format) {
            if (selectedIds.size === 0) return;
            var isPlanes = activeTab === 'planes';
            var columnIds = isPlanes ? COLUMN_IDS_PLANES : COLUMN_IDS_TAREAS;
            var labelsPlanesExport = { id: 'ID del plan', nombre: 'Nombre del plan', asignados: 'Personas asignadas', creador: 'Creador del plan', estado: 'Estado del plan', avance: 'Progreso del plan', fechaCreacion: 'Fecha de creación', fechaFinalizacion: 'Fecha de finalización' };
            var labelsTareasExport = { id: 'ID de la tarea', nombre: 'Nombre de la tarea', asignado: 'Asignado', creador: 'Creador', areaAsignado: 'Área del asignado', areaCreador: 'Área del creador', estado: 'Estado', prioridad: 'Prioridad', plan: 'Plan al que pertenece', fechaCreacion: 'Fecha de creación', fechaFinalizacion: 'Fecha de vencimiento', comentarios: 'Número de comentarios' };
            var labelsExport = isPlanes ? labelsPlanesExport : labelsTareasExport;
            var selectedRows = SEGUIMIENTO_DATA.filter(function(r) {
                return selectedIds.has(r.id) && (isPlanes ? r.tipo === 'plan' : r.tipo === 'tarea');
            });
            function getExportVal(row, colId) {
                if (isPlanes) {
                    if (colId === 'id') return row.id;
                    if (colId === 'nombre') return row.nombre || '';
                    if (colId === 'asignados') {
                        if (!row.asignados || !row.asignados.length) return (row.asignado && row.asignado.nombre) ? String(row.asignado.nombre) : '';
                        return row.asignados.map(function(a) { return (a && a.nombre != null) ? String(a.nombre) : ''; }).filter(Boolean).join(', ');
                    }
                    if (colId === 'creador') return row.creador || '';
                    if (colId === 'estado') return row.estado || '';
                    if (colId === 'avance') return typeof row.avance === 'number' ? row.avance : (parseInt(row.avance, 10) || 0);
                    if (colId === 'fechaCreacion') return row.fechaCreacion || '';
                    if (colId === 'fechaFinalizacion') return row.fechaFinalizacion || '';
                    return '';
                }
                if (colId === 'id') return row.id;
                if (colId === 'nombre') return row.nombre || '';
                if (colId === 'asignado') return (row.asignado && row.asignado.nombre) ? String(row.asignado.nombre) : '';
                if (colId === 'username') return (row.asignado && row.asignado.username) ? String(row.asignado.username) : '';
                if (colId === 'cargo') return row.cargo || '';
                if (colId === 'areaAsignado') return row.area || '';
                if (colId === 'areaCreador') return (row.areaCreador != null ? row.areaCreador : row.area) || '';
                if (colId === 'lider') return row.lider || '';
                if (colId === 'creador') return row.creador || '';
                if (colId === 'plan') return row.plan || '';
                if (colId === 'estado') return row.estado || '';
                if (colId === 'prioridad') return row.prioridad || '';
                if (colId === 'avance') return typeof row.avance === 'number' ? row.avance : (parseInt(row.avance, 10) || 0);
                if (colId === 'fechaCreacion') return row.fechaCreacion || '';
                if (colId === 'fechaFinalizacion') return row.fechaFinalizacion || '';
                if (colId === 'comentarios') return typeof row.comentarios === 'number' ? row.comentarios : (parseInt(row.comentarios, 10) || 0);
                return '';
            }
            var baseName = (isPlanes ? 'planes_' : 'tareas_') + new Date().toISOString().split('T')[0];
            if (format === 'excel') {
                function isNumericColumn(colId) { return colId === 'id' || colId === 'avance' || colId === 'comentarios'; }
                var escapeXml = function(s) {
                    if (s == null) return '';
                    var t = String(s);
                    t = t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
                    return t.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
                };
                var sheetName = isPlanes ? 'Planes' : 'Tareas';
                var xml = '<?xml version="1.0" encoding="UTF-8"?>\n<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n<Styles><Style ss:ID="Default" ss:Name="Normal"><Alignment ss:Vertical="Bottom"/><Borders/><Font ss:FontName="Calibri" ss:Size="11" ss:Color="#000000"/><Interior/><NumberFormat/><Protection/></Style></Styles>\n<Worksheet ss:Name="' + escapeXml(sheetName) + '">\n<Table>\n<Row>\n';
                columnIds.forEach(function(colId) { xml += '<Cell><Data ss:Type="String">' + escapeXml(labelsExport[colId] || colId) + '</Data></Cell>\n'; });
                xml += '</Row>\n';
                selectedRows.forEach(function(row) {
                    xml += '<Row>\n';
                    columnIds.forEach(function(colId) {
                        var val = getExportVal(row, colId);
                        if (isNumericColumn(colId) && typeof val === 'number') xml += '<Cell><Data ss:Type="Number">' + val + '</Data></Cell>\n';
                        else xml += '<Cell><Data ss:Type="String">' + escapeXml(val == null ? '' : String(val)) + '</Data></Cell>\n';
                    });
                    xml += '</Row>\n';
                });
                xml += '</Table>\n</Worksheet>\n</Workbook>';
                var blob = new Blob(['\ufeff' + xml], { type: 'application/vnd.ms-excel;charset=utf-8' });
                var url = URL.createObjectURL(blob);
                var link = document.createElement('a');
                link.href = url;
                link.download = baseName + '.xls';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                if (typeof showToast === 'function') showToast('success', selectedIds.size + ' elemento(s) descargado(s)');
            } else {
                function escapeCsv(s) {
                    if (s == null) return '';
                    var t = String(s);
                    if (/[,\n"]/.test(t)) return '"' + t.replace(/"/g, '""') + '"';
                    return t;
                }
                var headers = columnIds.map(function(colId) { return escapeCsv(labelsExport[colId] || colId); });
                var csvRows = [headers.join(',')];
                selectedRows.forEach(function(row) {
                    var values = columnIds.map(function(colId) { return escapeCsv(getExportVal(row, colId)); });
                    csvRows.push(values.join(','));
                });
                var blob = new Blob(['\ufeff' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8' });
                var url = URL.createObjectURL(blob);
                var link = document.createElement('a');
                link.href = url;
                link.download = baseName + '.csv';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                if (typeof showToast === 'function') showToast('success', selectedIds.size + ' elemento(s) descargado(s) en CSV');
            }
        }

        if (descargar && typeof window.getDropdownMenuHtml === 'function' && typeof window.openDropdownMenu === 'function') {
            descargar.addEventListener('click', function(e) {
                if (selectedIds.size === 0) return;
                e.stopPropagation();
                var overlayId = 'seguimiento-descargar-overlay';
                var existing = document.getElementById(overlayId);
                if (existing) existing.remove();
                var config = {
                    overlayId: overlayId,
                    options: [
                        { text: 'Descargar Excel', value: 'excel' },
                        { text: 'Descargar CSV', value: 'csv' }
                    ]
                };
                var html = window.getDropdownMenuHtml(config);
                document.body.insertAdjacentHTML('beforeend', html);
                var overlayEl = document.getElementById(overlayId);
                if (overlayEl) {
                    overlayEl.querySelectorAll('.ubits-dropdown-menu__option').forEach(function(opt) {
                        opt.addEventListener('click', function() {
                            var format = this.getAttribute('data-value');
                    if (format === 'excel' || format === 'csv') doDownloadExport(format);
                    closeDescargarMenu();
                });
            });
                    overlayEl.addEventListener('click', function(ev) {
                        if (ev.target === overlayEl) closeDescargarMenu();
                    });
        }
                window.openDropdownMenu(overlayId, descargar);
                descargar.setAttribute('aria-expanded', 'true');
            });
        }

        // Cambiar fecha de finalización (Planes) - date picker + input sincronizados (mismo estilo que fecha personalizada)
        var planFechaBtn = document.getElementById('seguimiento-cambiar-fecha-plan');
        var planFechaOverlay = document.getElementById('plan-fecha-overlay');
        var planFechaInput = document.getElementById('plan-fecha-input');
        var planFechaCalendar = document.getElementById('plan-fecha-calendar');
        var planFechaClose = document.getElementById('plan-fecha-close');
        var planFechaCancel = document.getElementById('plan-fecha-cancel');
        var planFechaAplicar = document.getElementById('plan-fecha-aplicar');

        var planFechaSelected = null;
        var planFechaCurrentMonth = new Date(2026, 2, 1);

        function formatearFechaPlan(fecha) {
            var d = fecha.getDate();
            var m = fecha.getMonth() + 1;
            var y = fecha.getFullYear();
            return (d < 10 ? '0' : '') + d + '/' + (m < 10 ? '0' : '') + m + '/' + y;
        }
        function parsearFechaPlan(texto) {
            if (!texto || !texto.trim()) return null;
            var match = texto.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
            if (!match) return null;
            var dia = parseInt(match[1], 10);
            var mes = parseInt(match[2], 10) - 1;
            var anio = parseInt(match[3], 10);
            if (dia < 1 || dia > 31 || mes < 0 || mes > 11 || anio < 1900 || anio > 2100) return null;
            var f = new Date(anio, mes, dia);
            if (f.getDate() !== dia || f.getMonth() !== mes || f.getFullYear() !== anio) return null;
            return f;
        }

        function closePlanFechaModal() {
            if (planFechaOverlay) { planFechaOverlay.style.display = 'none'; planFechaOverlay.setAttribute('aria-hidden', 'true'); }
            if (planFechaInput) planFechaInput.value = '';
            planFechaSelected = null;
        }

        // Calendario oficial UBITS (createCalendar) en el modal cambiar fecha (límite: 3 años en el futuro)
        function renderPlanFechaCalendar() {
            if (!planFechaCalendar || typeof window.createCalendar !== 'function') return;
            planFechaCalendar.innerHTML = '';
            var initialDate = planFechaCurrentMonth ? new Date(planFechaCurrentMonth.getFullYear(), planFechaCurrentMonth.getMonth(), 1) : new Date();
            window.createCalendar({
                containerId: 'plan-fecha-calendar',
                initialDate: initialDate,
                selectedDate: planFechaSelected || undefined,
                maxDate: getSeguimientoCalendarMaxDate(),
                onDateSelect: function (dateStr) {
                    var parts = dateStr.split('/').map(Number);
                    planFechaSelected = new Date(parts[2], parts[1] - 1, parts[0]);
                    planFechaSelected.setHours(0, 0, 0, 0);
                    if (planFechaInput) planFechaInput.value = formatearFechaPlan(planFechaSelected);
                    renderPlanFechaCalendar();
                }
            });
        }

        var planFechaModalTitle = document.getElementById('plan-fecha-modal-title');
        if (planFechaBtn && planFechaOverlay) {
            planFechaBtn.addEventListener('click', function() {
                if (selectedIds.size === 0) return;
                if (planFechaModalTitle) planFechaModalTitle.textContent = activeTab === 'tareas' ? 'Cambiar fecha de vencimiento' : 'Cambiar fecha de finalización';
                planFechaSelected = null;
                planFechaCurrentMonth = new Date(2026, 2, 1);
                if (planFechaInput) planFechaInput.value = '';
                if (planFechaOverlay) { planFechaOverlay.style.display = 'flex'; planFechaOverlay.setAttribute('aria-hidden', 'false'); }
                renderPlanFechaCalendar();
            });
        }
        if (planFechaClose) planFechaClose.addEventListener('click', closePlanFechaModal);
        if (planFechaCancel) planFechaCancel.addEventListener('click', closePlanFechaModal);
        if (planFechaOverlay) planFechaOverlay.addEventListener('click', function(e) { if (e.target === planFechaOverlay) closePlanFechaModal(); });
        if (planFechaInput) {
            planFechaInput.addEventListener('blur', function() {
                var texto = this.value.trim();
                if (texto === '') {
                    planFechaSelected = null;
                    renderPlanFechaCalendar();
                    return;
                }
                var f = parsearFechaPlan(texto);
                if (f) {
                    f.setHours(0, 0, 0, 0);
                    if (f.getTime() > getSeguimientoCalendarMaxDate().getTime()) {
                        planFechaSelected = null;
                        this.value = '';
                        if (typeof showToast === 'function') showToast('warning', 'La fecha no puede ser mayor a 3 años en el futuro');
                        renderPlanFechaCalendar();
                        return;
                    }
                    planFechaSelected = f;
                    this.value = formatearFechaPlan(planFechaSelected);
                    planFechaCurrentMonth = new Date(planFechaSelected);
                    planFechaCurrentMonth.setDate(1);
                    renderPlanFechaCalendar();
                } else if (texto !== '' && planFechaSelected) {
                    this.value = formatearFechaPlan(planFechaSelected);
                }
            });
            planFechaInput.addEventListener('keypress', function(e) { if (e.key === 'Enter') this.blur(); });
        }
        function formatearFechaPlanParaTabla(fecha) {
            var d = fecha.getDate();
            var meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
            var m = meses[fecha.getMonth()];
            var y = fecha.getFullYear();
            return d + ' ' + m + ' ' + y;
        }

        if (planFechaAplicar) {
            planFechaAplicar.addEventListener('click', function() {
                if (!planFechaSelected) {
                    if (typeof showToast === 'function') showToast('warning', 'Selecciona una fecha en el calendario o escríbela en el campo (DD/MM/YYYY)');
                    return;
                }
                if (planFechaSelected.getTime() > getSeguimientoCalendarMaxDate().getTime()) {
                    if (typeof showToast === 'function') showToast('warning', 'La fecha no puede ser mayor a 3 años en el futuro');
                    return;
                }
                var fechaStr = formatearFechaPlanParaTabla(planFechaSelected);
                var hoy = new Date();
                hoy.setHours(0, 0, 0, 0);
                var sel = new Date(planFechaSelected);
                sel.setHours(0, 0, 0, 0);
                if (activeTab === 'tareas') {
                    selectedIds.forEach(function(id) {
                        var row = SEGUIMIENTO_DATA.find(function(r) { return r.id === id; });
                        if (row && row.tipo === 'tarea') {
                            row.fechaFinalizacion = fechaStr;
                            if (sel < hoy) row.estado = 'Vencida';
                        }
                    });
                    closePlanFechaModal();
                    renderTable();
                    updateIndicadores();
                    if (typeof showToast === 'function') showToast('success', 'Fecha de vencimiento actualizada para ' + selectedIds.size + ' tarea(s)');
                } else {
                    selectedIds.forEach(function(id) {
                        var row = SEGUIMIENTO_DATA.find(function(r) { return r.id === id; });
                        if (row && row.tipo === 'plan') {
                            row.fechaFinalizacion = fechaStr;
                            if (sel < hoy) row.estado = 'Vencida';
                        }
                    });
                    closePlanFechaModal();
                    renderTable();
                    updateIndicadores();
                    if (typeof showToast === 'function') showToast('success', 'Fecha de finalización actualizada para ' + selectedIds.size + ' plan(es)');
                }
            });
        }

        // Añadir colaborador al plan
        var anadirColabBtn = document.getElementById('seguimiento-anadir-colaborador');
        var anadirColabMenu = document.getElementById('anadir-colaborador-menu');
        var anadirColabOverlay = document.getElementById('anadir-colaborador-overlay');
        var anadirColabCancel = document.getElementById('anadir-colaborador-cancel');
        var anadirColabApply = document.getElementById('anadir-colaborador-apply');
        var anadirColaboradorPersona = null;

        function closeAnadirColaborador() {
            if (anadirColabOverlay) anadirColabOverlay.style.display = 'none';
            if (anadirColabMenu) anadirColabMenu.style.display = 'none';
            anadirColaboradorPersona = null;
        }

        if (anadirColabBtn && anadirColabMenu) {
            anadirColabBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                if (selectedIds.size === 0 || activeTab !== 'planes') return;
                var rect = this.getBoundingClientRect();
                anadirColabMenu.style.top = (rect.bottom + 4) + 'px';
                anadirColabMenu.style.left = rect.left + 'px';
                anadirColabMenu.style.display = 'block';
                if (anadirColabOverlay) anadirColabOverlay.style.display = 'block';
                var container = document.getElementById('anadir-colaborador-autocomplete');
                if (container) container.innerHTML = '';
                if (container && typeof createInput === 'function') {
                    var personas = [];
                    SEGUIMIENTO_DATA.forEach(function(r) {
                        if (r.asignado && r.asignado.nombre && personas.indexOf(r.asignado.nombre) < 0) personas.push(r.asignado.nombre);
                        if (r.asignados) r.asignados.forEach(function(a) { if (a.nombre && personas.indexOf(a.nombre) < 0) personas.push(a.nombre); });
                    });
                    createInput({
                        containerId: 'anadir-colaborador-autocomplete',
                        type: 'autocomplete',
                        placeholder: 'Buscar persona...',
                        size: 'md',
                        autocompleteOptions: personas.map(function(p, i) { return { value: String(i), text: p }; }),
                        onChange: function(val) {
                            var idx = parseInt(val, 10);
                            anadirColaboradorPersona = !isNaN(idx) && personas[idx] ? personas[idx] : (val || null);
                        }
                    });
                }
            });
        }
        if (anadirColabCancel) anadirColabCancel.addEventListener('click', closeAnadirColaborador);
        if (anadirColabOverlay) anadirColabOverlay.addEventListener('click', closeAnadirColaborador);
        if (anadirColabApply) {
            anadirColabApply.addEventListener('click', function() {
                if (anadirColaboradorPersona) {
                    var personaRef = SEGUIMIENTO_DATA.find(function(r) { return r.asignado && r.asignado.nombre === anadirColaboradorPersona; }) || SEGUIMIENTO_DATA.find(function(r) { return r.asignados && r.asignados.some(function(a) { return a.nombre === anadirColaboradorPersona; }); });
                    var nuevoColab = personaRef && (personaRef.asignado || (personaRef.asignados && personaRef.asignados[0])) ? { nombre: anadirColaboradorPersona, avatar: (personaRef.asignado || personaRef.asignados[0]).avatar, username: (personaRef.asignado || personaRef.asignados[0]).username || '' } : { nombre: anadirColaboradorPersona, avatar: null, username: '' };
                    selectedIds.forEach(function(id) {
                        var row = SEGUIMIENTO_DATA.find(function(r) { return r.id === id; });
                        if (row && row.tipo === 'plan' && row.asignados) {
                            if (!row.asignados.some(function(a) { return a.nombre === anadirColaboradorPersona; })) row.asignados.push(nuevoColab);
                        }
                    });
                    renderTable();
                    if (typeof showToast === 'function') showToast('success', anadirColaboradorPersona + ' añadido como colaborador a ' + selectedIds.size + ' plan(es)');
                }
                closeAnadirColaborador();
            });
        }
    }

    // Alerta móvil
    function initMobileAlert() {
        const container = document.getElementById('seguimiento-alert-container');
        const wrap = document.getElementById('seguimiento-alert-mobile');
        if (!container || !wrap) return;

        const mq = window.matchMedia('(max-width: 1023px)');
        function update() {
            if (mq.matches) {
                wrap.style.display = 'block';
                if (typeof showAlert === 'function') {
                    showAlert('info', 'Para una mejor experiencia revisa esta vista desde un computador.', { containerId: 'seguimiento-alert-container', noClose: true });
                } else {
                    container.innerHTML = '<p class="ubits-body-sm-regular" style="color: var(--ubits-fg-1-medium);">Para una mejor experiencia revisa esta vista desde un computador.</p>';
                }
            } else {
                wrap.style.display = 'none';
                container.innerHTML = '';
            }
        }
        mq.addListener(update);
        update();
    }

    // Inicialización principal
    // Inicializar botón de limpiar filtros
    function initClearFiltersButton() {
        const clearFiltersBtn = document.getElementById('seguimiento-clear-filters-btn');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', function() {
                clearAllFilters();
            });
        }
    }

    function init() {
        SEGUIMIENTO_DATA = generateData();
        initColumnVisibility();
        buildTableHeader();
        initNav();
        initTabSwitcher();
        buildColumnsMenu();
        applyFiltersAndSearch(); // Aplicar filtros (incluyendo período por defecto) antes de renderizar
        applySorting(); // Aplicar ordenamiento por defecto antes de renderizar
        renderTable();
        updateSelectAll();
        updateResultsCount();
        updateIndicadores();
        initPaginator();
        renderFiltrosAplicados();
        initSearchToggle();
        initModals();
        initSortMenu();
        initFilterMenu();
        initCheckboxMenu();
        initPeriodoMenu();
        initDatePicker();
        initCheckboxes();
        initVerSeleccionados();
        initActionButtons();
        initMobileAlert();
        initClearFiltersButton();
        initRowClick();
    }

    document.addEventListener('DOMContentLoaded', init);
})();
