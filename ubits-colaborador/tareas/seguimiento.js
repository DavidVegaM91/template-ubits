/* ========================================
   SEGUIMIENTO - Página de seguimiento
   Empresa: Decoraciones Premium S.A.S.
   Base de datos: seguimiento-data.js
   ======================================== */

(function() {
    'use strict';

    // Inyectar modales con componente oficial (modal.js getModalHtml) — una sola fuente de verdad
    if (typeof getModalHtml === 'function') {
        var modalsContainer = document.getElementById('seguimiento-modals-container');
        if (modalsContainer) {
            var filtrosBody = '<div class="filtros-group"><label class="ubits-body-sm-bold filtros-label">Buscar asignados</label><div id="filtros-buscar-personas"></div></div>' +
                '<div class="filtros-group"><label class="ubits-body-sm-bold filtros-label">Buscar áreas</label><div id="filtros-areas"></div></div>' +
                '<div class="filtros-group filtros-group-row"><div class="filtros-field"><label class="ubits-body-sm-bold filtros-label">Estado</label><div class="filtros-checkbox-list" id="filtros-estado">' +
                '<label class="filtros-checkbox-option"><input type="checkbox" value="Iniciada"><span class="ubits-body-sm-regular">Iniciada</span></label>' +
                '<label class="filtros-checkbox-option"><input type="checkbox" value="Vencida"><span class="ubits-body-sm-regular">Vencida</span></label>' +
                '<label class="filtros-checkbox-option"><input type="checkbox" value="Finalizada"><span class="ubits-body-sm-regular">Finalizada</span></label></div></div>' +
                '<div class="filtros-field"><label class="ubits-body-sm-bold filtros-label">Prioridad</label><div class="filtros-checkbox-list" id="filtros-prioridad">' +
                '<label class="filtros-checkbox-option"><input type="checkbox" value="Alta"><span class="ubits-body-sm-regular">Alta</span></label>' +
                '<label class="filtros-checkbox-option"><input type="checkbox" value="Media"><span class="ubits-body-sm-regular">Media</span></label>' +
                '<label class="filtros-checkbox-option"><input type="checkbox" value="Baja"><span class="ubits-body-sm-regular">Baja</span></label></div></div></div>';
            var filtrosFooter = '<button type="button" class="ubits-button ubits-button--secondary ubits-button--md" id="filtros-limpiar">Limpiar filtros</button>' +
                '<button type="button" class="ubits-button ubits-button--primary ubits-button--md" id="filtros-aplicar">Aplicar filtros</button>';
            modalsContainer.innerHTML += getModalHtml({ overlayId: 'filtros-modal-overlay', title: 'Filtros', bodyHtml: filtrosBody, footerHtml: filtrosFooter, size: 'md', closeButtonId: 'filtros-modal-close' });

            var datePickerBody = '<div class="date-picker-inputs"><div class="date-picker-input-group"><label class="ubits-body-sm-regular date-picker-label">Fecha de inicio</label><div class="date-picker-input-wrapper"><input type="text" class="date-picker-input" id="date-picker-fecha-inicio" placeholder="DD/MM/YYYY"></div></div>' +
                '<span class="date-picker-separator">-</span><div class="date-picker-input-group"><label class="ubits-body-sm-regular date-picker-label">Fecha de fin</label><div class="date-picker-input-wrapper"><input type="text" class="date-picker-input" id="date-picker-fecha-fin" placeholder="DD/MM/YYYY"></div></div></div>' +
                '<div class="date-picker-calendar" id="date-picker-calendar"></div>';
            var datePickerFooter = '<button type="button" class="ubits-button ubits-button--secondary ubits-button--md" id="date-picker-cancelar"><span>Cancelar</span></button>' +
                '<button type="button" class="ubits-button ubits-button--primary ubits-button--md" id="date-picker-aplicar"><span>Aplicar</span></button>';
            modalsContainer.innerHTML += getModalHtml({ overlayId: 'date-picker-overlay', title: 'Fecha personalizada', bodyHtml: datePickerBody, footerHtml: datePickerFooter, size: 'sm', contentId: 'date-picker-modal', closeButtonId: 'date-picker-close', overlayClass: 'date-picker-overlay', contentClass: 'date-picker-modal-content', headerClass: 'date-picker-modal-header', bodyClass: 'date-picker-modal-body', footerClass: 'date-picker-modal-footer' });

            var deleteBody = '<p class="ubits-body-md-regular">¿Estás seguro de que deseas eliminar <strong id="delete-count">0</strong> elemento(s) seleccionado(s)?</p><p class="ubits-body-sm-regular" style="color: var(--ubits-fg-1-medium);">Esta acción no se puede deshacer.</p>';
            var deleteFooter = '<button type="button" class="ubits-button ubits-button--secondary ubits-button--md" id="delete-modal-cancel">Cancelar</button><button type="button" class="ubits-button ubits-button--error ubits-button--md" id="delete-modal-confirm">Eliminar</button>';
            modalsContainer.innerHTML += getModalHtml({ overlayId: 'delete-modal-overlay', title: 'Confirmar eliminación', bodyHtml: deleteBody, footerHtml: deleteFooter, size: 'xs', closeButtonId: 'delete-modal-close' });

            var reabrirBody = '<p class="ubits-body-md-regular" id="reabrir-plan-message">Al reabrir este(s) plan(es), las tareas en estado Iniciada se marcarán como Finalizadas. ¿Continuar?</p>';
            var reabrirFooter = '<button type="button" class="ubits-button ubits-button--secondary ubits-button--md" id="reabrir-plan-cancel">Cancelar</button><button type="button" class="ubits-button ubits-button--primary ubits-button--md" id="reabrir-plan-confirm">Continuar</button>';
            modalsContainer.innerHTML += getModalHtml({ overlayId: 'reabrir-plan-overlay', title: 'Cambiar estado del plan', bodyHtml: reabrirBody, footerHtml: reabrirFooter, size: 'xs', titleId: 'reabrir-plan-title', closeButtonId: 'reabrir-plan-close' });

            var planFechaBody = '<div class="date-picker-input-group"><label class="ubits-body-sm-regular date-picker-label">Nueva fecha de finalización</label><div class="date-picker-input-wrapper"><input type="text" class="date-picker-input" id="plan-fecha-input" placeholder="DD/MM/YYYY"></div></div><div class="date-picker-calendar" id="plan-fecha-calendar"></div>';
            var planFechaFooter = '<button type="button" class="ubits-button ubits-button--secondary ubits-button--md" id="plan-fecha-cancel"><span>Cancelar</span></button><button type="button" class="ubits-button ubits-button--primary ubits-button--md" id="plan-fecha-aplicar"><span>Aplicar</span></button>';
            modalsContainer.innerHTML += getModalHtml({ overlayId: 'plan-fecha-overlay', title: 'Cambiar fecha de finalización', bodyHtml: planFechaBody, footerHtml: planFechaFooter, size: 'sm', contentId: 'plan-fecha-modal', titleId: 'plan-fecha-modal-title', closeButtonId: 'plan-fecha-close', overlayClass: 'date-picker-overlay', contentClass: 'date-picker-modal-content', headerClass: 'date-picker-modal-header', bodyClass: 'date-picker-modal-body', footerClass: 'date-picker-modal-footer' });
        }
    }

    // Los datos se cargan desde seguimiento-data.js (SEGUIMIENTO_DATABASE)
    // 3.2.2 Columnas disponibles en tab Tareas (selector con checkboxes 3.2.1)
    const COLUMN_IDS_TAREAS = ['id', 'nombre', 'asignado', 'creador', 'area', 'estado', 'prioridad', 'plan', 'fechaCreacion', 'fechaFinalizacion', 'comentarios'];
    // 3.2.3 Por defecto mostrar: Nombre, Asignado, Creador, Estado, Prioridad, Fecha de vencimiento
    const VISIBLE_BY_DEFAULT_TAREAS = ['nombre', 'asignado', 'creador', 'estado', 'prioridad', 'fechaFinalizacion'];
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
            area: [],
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

    // Generar datos desde la base de datos realista (seguimiento-data.js)
    // Empresa: Decoraciones Premium S.A.S.
    // Si SEGUIMIENTO_SCOPE === 'leader' y SEGUIMIENTO_CURRENT_LEADER está definido, solo actividades de reportes directos (TASK_VIEW_SCOPE_LEADER).
    function generateData() {
        if (typeof SEGUIMIENTO_DATABASE === 'undefined') return [];
        if (typeof SEGUIMIENTO_SCOPE !== 'undefined' && SEGUIMIENTO_SCOPE === 'leader' && typeof SEGUIMIENTO_CURRENT_LEADER !== 'undefined' && SEGUIMIENTO_DATABASE.getActividadesParaLider) {
            return SEGUIMIENTO_DATABASE.getActividadesParaLider(SEGUIMIENTO_CURRENT_LEADER);
        }
        if (SEGUIMIENTO_DATABASE.generarActividades) {
            return SEGUIMIENTO_DATABASE.generarActividades();
        }
        
        // Fallback si no se carga el archivo de datos
        console.warn('seguimiento-data.js no cargado. Usando datos de ejemplo mínimos.');
            return [{
                id: 10001,
                tipo: 'tarea',
                nombre: 'Tarea de ejemplo',
                plan: 'Plan de ejemplo',
                asignado: { nombre: 'Usuario Ejemplo', avatar: null },
                idColaborador: '1011000001',
                area: 'Administración',
                lider: 'Gerente Administrativa',
                estado: 'Iniciada',
                prioridad: 'Media',
                avance: 50,
                fechaCreacion: '1 ene 2025',
                fechaFinalizacion: '28 feb 2025',
                creador: 'Gerencia General',
                comentarios: 0
            }];
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
            area: 'Área',
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
                html += `<th class="seguimiento-th-filterable" data-col="${col}"${style}>${label} <button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only seguimiento-checkbox-btn" data-checkbox="estado" aria-label="Filtrar por estado"><i class="far fa-filter"></i></button></th>`;
            } else if (col === 'prioridad' && activeTab === 'tareas') {
                html += `<th class="seguimiento-th-filterable" data-col="${col}"${style}>${label} <button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only seguimiento-checkbox-btn" data-checkbox="prioridad" aria-label="Filtrar por prioridad"><i class="far fa-filter"></i></button></th>`;
            } else if ((col === 'fechaCreacion' || col === 'fechaFinalizacion') && (activeTab === 'tareas' || activeTab === 'planes')) {
                html += `<th class="seguimiento-th-sortable" data-col="${col}"${style}>${label} <button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only seguimiento-date-sort-btn" data-sort="${col}" aria-label="Ordenar por ${label}"><i class="far fa-arrow-up-arrow-down"></i></button></th>`;
            } else if (activeTab === 'tareas' && ['nombre', 'asignado', 'area', 'creador', 'plan'].indexOf(col) >= 0) {
                html += `<th class="seguimiento-th-filterable" data-col="${col}"${style}>${label} <button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only seguimiento-filter-btn" data-filter="${col}" aria-label="Filtrar por ${label}"><i class="far fa-filter"></i></button></th>`;
            } else if (activeTab === 'planes' && (col === 'nombre' || col === 'creador')) {
                html += `<th class="seguimiento-th-filterable" data-col="${col}"${style}>${label} <button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only seguimiento-filter-btn" data-filter="${col}" aria-label="Filtrar por ${label}"><i class="far fa-filter"></i></button></th>`;
            } else if (activeTab === 'planes' && col === 'estado') {
                html += `<th class="seguimiento-th-filterable" data-col="${col}"${style}>${label} <button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only seguimiento-checkbox-btn" data-checkbox="estado" aria-label="Filtrar por estado"><i class="far fa-filter"></i></button></th>`;
            } else if (activeTab === 'planes' && col === 'avance') {
                html += `<th class="seguimiento-th-sortable" data-col="${col}"${style}>${label} <button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only seguimiento-date-sort-btn" data-sort="${col}" aria-label="Ordenar por ${label}"><i class="far fa-arrow-up-arrow-down"></i></button></th>`;
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

        // Filtro área - sin tildes
        if (currentFilters.area.length > 0) {
            data = data.filter(row => 
                currentFilters.area.some(area => 
                    normalizeText(row.area).includes(normalizeText(area))
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

        // Filtro prioridad
        if (currentFilters.prioridad.length > 0) {
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
            const hoy = new Date(2026, 2, 22); // Domingo 22 de marzo de 2026
            hoy.setHours(23, 59, 59, 999); // Fin del día de hoy
            
            // Calcular fecha límite: para "últimos X días" desde el 22 de marzo (incluyendo hoy),
            // debemos incluir desde (X-1) días atrás desde hoy
            const periodoDias = parseInt(currentFilters.periodo);
            if (isNaN(periodoDias)) return; // Si no es un número válido, no aplicar filtro
            
            const diasAtras = periodoDias - 1; // Para incluir el día de hoy: restar (periodoDias - 1) días
            
            // Crear fecha límite: usar milisegundos de forma precisa
            // 22 de marzo 2026, 00:00:00 - diasAtras días
            const hoyInicio = new Date(2026, 2, 22, 0, 0, 0, 0);
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
        if (currentFilters.area.length > 0) {
            data = data.filter(row =>
                currentFilters.area.some(area =>
                    normalizeText(row.area).includes(normalizeText(area))
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
        if (currentFilters.prioridad.length > 0) {
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
            const hoy = new Date(2026, 2, 22);
            hoy.setHours(23, 59, 59, 999);
            const periodoDias = parseInt(currentFilters.periodo);
            if (!isNaN(periodoDias)) {
                const diasAtras = periodoDias - 1;
                const hoyInicio = new Date(2026, 2, 22, 0, 0, 0, 0);
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
                            primary: {
                                text: isTareas ? 'Crear tarea' : 'Crear plan',
                                icon: 'fa-plus',
                                onClick: function() { /* se delega al botón del header */ }
                            }
                        }
                    });
                    setTimeout(() => {
                        const createBtn = emptyStateContainer.querySelector('.ubits-button--primary');
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
                            primary: {
                                text: 'Cambiar período',
                                icon: 'fa-calendar-days',
                                onClick: function() { /* abre el menú de período */ }
                            }
                        }
                    });
                    setTimeout(() => {
                        const periodBtn = emptyStateContainer.querySelector('.ubits-button--primary');
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
                            primary: {
                                text: 'Limpiar búsqueda',
                                icon: 'fa-times',
                                onClick: function() { /* se maneja con listener directo */ }
                            }
                        }
                    });
                    setTimeout(() => {
                        const clearBtn = emptyStateContainer.querySelector('.ubits-button--primary');
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
        const prioridadColor = { Alta: 'var(--ubits-feedback-accent-error)', Media: 'var(--ubits-fg-1-medium)', Baja: 'var(--ubits-feedback-accent-info)' };

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
            const prioridadHtml = row.prioridad ? `<span class="ubits-table__cell-priority" style="color:${prioridadColor[row.prioridad]}"><i class="far ${prioridadIcon[row.prioridad]}"></i> ${row.prioridad}</span>` : '';
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
                area: `<td data-col="area"><span class="ubits-body-sm-regular">${row.area || ''}</span></td>`,
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
        el.textContent = `${data.length}/${totalTab}`;
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
            if (numberEl) numberEl.textContent = totalItems;
        }
        const cardFinalizadas = document.querySelector('#seguimiento-indicadores .seguimiento-indicador-card:nth-child(2)');
        if (cardFinalizadas) {
            const numberEl = cardFinalizadas.querySelector('.indicador-number');
            const percentageEl = cardFinalizadas.querySelector('.indicador-percentage');
            const labelEl = cardFinalizadas.querySelector('.indicador-label');
            if (numberEl) numberEl.textContent = finalizadas;
            if (percentageEl) percentageEl.textContent = `${porcentajeFinalizadas}%`;
            if (labelEl) labelEl.textContent = labelFinalizadas;
        }
        const cardIniciadas = document.querySelector('#seguimiento-indicadores .seguimiento-indicador-card:nth-child(3)');
        if (cardIniciadas) {
            const numberEl = cardIniciadas.querySelector('.indicador-number');
            const percentageEl = cardIniciadas.querySelector('.indicador-percentage');
            const labelEl = cardIniciadas.querySelector('.indicador-label');
            if (numberEl) numberEl.textContent = iniciadas;
            if (percentageEl) percentageEl.textContent = `${porcentajeIniciadas}%`;
            if (labelEl) labelEl.textContent = labelIniciadas;
        }
        const cardVencidas = document.querySelector('#seguimiento-indicadores .seguimiento-indicador-card:nth-child(4)');
        if (cardVencidas) {
            const numberEl = cardVencidas.querySelector('.indicador-number');
            const percentageEl = cardVencidas.querySelector('.indicador-percentage');
            const labelEl = cardVencidas.querySelector('.indicador-label');
            if (numberEl) numberEl.textContent = vencidas;
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

        // Área - un chip por cada valor
        if (currentFilters.area.length > 0) {
            hasFilters = true;
            currentFilters.area.forEach((areaValue, index) => {
                chips.push({
                    type: 'area',
                    label: 'Área',
                    value: areaValue,
                    remove: () => {
                        // Remover solo este valor del array
                        currentFilters.area = currentFilters.area.filter((_, i) => i !== index);
                        // Si no quedan valores, limpiar checkboxes de áreas
                        if (currentFilters.area.length === 0) {
                            document.querySelectorAll('#filtros-areas input').forEach(cb => {
                                cb.checked = false;
                            });
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

        // Prioridad - un chip por cada valor
        if (currentFilters.prioridad.length > 0) {
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
            area: 'Área',
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
        }
    }

    function closeFiltersModal() {
        const overlay = document.getElementById('filtros-modal-overlay');
        if (overlay) {
            overlay.style.display = 'none';
            overlay.setAttribute('aria-hidden', 'true');
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
        } else if (containerId === 'filtros-areas') {
            currentFilterValues = currentFilters.area;
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
        const personas = [...new Set(SEGUIMIENTO_DATA.map(r => r.asignado.nombre))];
        const areas = [...new Set(SEGUIMIENTO_DATA.map(r => r.area))];

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

        // Buscar área (con checkboxes)
        createFilterAutocompleteWithCheckboxes('filtros-areas', areas, 'Buscar área...', (selectedValues) => {
            currentFilters.area = selectedValues;
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

    // Leer checkboxes y radios de filtros
    function readFilterCheckboxes() {
        // Tipo actividad (radio button - solo uno)
        const tipoRadio = document.querySelector('#filtros-tipo-actividad input[type="radio"]:checked');
        currentFilters.tipoActividad = tipoRadio ? [tipoRadio.value] : ['todos'];

        // Estado
        const estadoChecks = document.querySelectorAll('#filtros-estado input:checked');
        currentFilters.estado = Array.from(estadoChecks).map(cb => cb.value);

        // Prioridad
        const prioridadChecks = document.querySelectorAll('#filtros-prioridad input:checked');
        currentFilters.prioridad = Array.from(prioridadChecks).map(cb => cb.value);
    }

    // Limpiar filtros (solo del tab activo)
    function clearFilters() {
        filtersByTab[activeTab] = getDefaultFilters();
        currentFilters = filtersByTab[activeTab];
        
        const periodoText = document.getElementById('seguimiento-periodo-text');
        if (periodoText) periodoText.textContent = 'Últimos 7 días';
        
        const periodoMenu = document.getElementById('periodo-menu');
        if (periodoMenu) {
            periodoMenu.querySelectorAll('.periodo-menu-option').forEach(opt => {
                opt.classList.remove('selected');
                if (opt.dataset.value === '7') opt.classList.add('selected');
            });
        }

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

    // Toggle menú de columnas
    function toggleColumnsMenu() {
        const menu = document.getElementById('columns-menu');
        const overlay = document.getElementById('columns-menu-overlay');
        if (!menu || !overlay) return;
        const visible = menu.style.display === 'block';
        menu.style.display = visible ? 'none' : 'block';
        overlay.style.display = visible ? 'none' : 'block';
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
        var vistaSuffix = (typeof SEGUIMIENTO_SCOPE !== 'undefined' && SEGUIMIENTO_SCOPE === 'leader') ? ' (vista líder)' : '';
        if (headerTitle) headerTitle.textContent = (tab === 'planes' ? 'Lista de planes' : 'Lista de tareas') + vistaSuffix;
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
        // Modal filtros
        const filtersBtn = document.getElementById('seguimiento-filters-toggle');
        const filtersClose = document.getElementById('filtros-modal-close');
        const filtersLimpiar = document.getElementById('filtros-limpiar');
        const filtersAplicar = document.getElementById('filtros-aplicar');
        const filtersOverlay = document.getElementById('filtros-modal-overlay');

        if (filtersBtn) filtersBtn.addEventListener('click', openFiltersModal);
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

    // Inicializar menú de período
    function initPeriodoMenu() {
        const periodoBtn = document.getElementById('seguimiento-periodo-toggle');
        const periodoMenu = document.getElementById('periodo-menu');
        const periodoOverlay = document.getElementById('periodo-menu-overlay');
        const periodoText = document.getElementById('seguimiento-periodo-text');
        
        if (!periodoBtn || !periodoMenu || !periodoOverlay || !periodoText) return;

        // Mapeo de valores a textos
        const periodoTexts = {
            '7': 'Últimos 7 días',
            '15': 'Últimos 15 días',
            '30': 'Últimos 30 días',
            '90': 'Últimos 3 meses',
            '180': 'Últimos 6 meses',
            '365': 'Último año'
        };

        // Función para determinar qué opción está seleccionada
        function getSelectedPeriodo() {
            // Si hay fechas personalizadas, "Personalizado" está seleccionado
            if (currentFilters.fechaCreacionDesde && currentFilters.fechaCreacionHasta) {
                return 'personalizado';
            }
            // Si no, usar el período normal (por defecto 7 días)
            return currentFilters.periodo || '7';
        }
        
        // Valor inicial (sincronizar con currentFilters)
        let selectedPeriodo = getSelectedPeriodo();
        
        // Sincronizar texto del botón con el valor inicial
        if (selectedPeriodo === 'personalizado') {
            // El texto ya está actualizado por el date picker
        } else if (periodoTexts[selectedPeriodo]) {
            periodoText.textContent = periodoTexts[selectedPeriodo];
        }
        
        // Marcar la opción seleccionada inicialmente
        periodoMenu.querySelectorAll('.periodo-menu-option').forEach(opt => {
            opt.classList.remove('selected');
            if (opt.dataset.value === selectedPeriodo) {
                opt.classList.add('selected');
            }
        });

        // Toggle del menú
        periodoBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            const rect = this.getBoundingClientRect();
            const visible = periodoMenu.style.display === 'block';
            
            if (visible) {
                periodoMenu.style.display = 'none';
                periodoOverlay.style.display = 'none';
            } else {
                periodoMenu.style.display = 'block';
                periodoOverlay.style.display = 'block';
                positionMenuSmartly(periodoMenu, rect, 200, 200);
                
                // Actualizar selectedPeriodo antes de marcar (por si cambió)
                selectedPeriodo = getSelectedPeriodo();
                
                // Marcar la opción seleccionada
                periodoMenu.querySelectorAll('.periodo-menu-option').forEach(opt => {
                    opt.classList.remove('selected');
                    if (opt.dataset.value === selectedPeriodo) {
                        opt.classList.add('selected');
                    }
                });
            }
        });

        // Cerrar al hacer clic en el overlay
        periodoOverlay.addEventListener('click', function() {
            periodoMenu.style.display = 'none';
            periodoOverlay.style.display = 'none';
        });

        // Manejar selección de opciones
        periodoMenu.querySelectorAll('.periodo-menu-option').forEach(option => {
            option.addEventListener('click', function(e) {
                e.stopPropagation();
                const value = this.dataset.value;
                
                // Si es "personalizado", abrir el selector de fechas
                if (value === 'personalizado') {
                    periodoMenu.style.display = 'none';
                    periodoOverlay.style.display = 'none';
                    openDatePicker();
                    return;
                }
                
                selectedPeriodo = value;
                
                // Limpiar filtro personalizado si existe
                currentFilters.fechaCreacionDesde = null;
                currentFilters.fechaCreacionHasta = null;
                
                // Actualizar texto del botón
                periodoText.textContent = periodoTexts[value];
                
                // Actualizar selección visual
                periodoMenu.querySelectorAll('.periodo-menu-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                this.classList.add('selected');
                
                // Aplicar filtro por período
                currentFilters.periodo = value;
                
                // Cerrar el menú
                periodoMenu.style.display = 'none';
                periodoOverlay.style.display = 'none';
                
                // Resetear página a 1 cuando se aplica un filtro
                currentPage = 1;
                
                // Renderizar tabla con el nuevo filtro
                renderTable();
                updateResultsCount();
                updateIndicadores();
                initPaginator();
            });
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

    // Inicializar menú de ordenamiento (fechas y progreso). Delegación para que funcione con botones re-renderizados (p. ej. al cambiar a Planes).
    function initSortMenu() {
        const sortMenu = document.getElementById('sort-menu');
        const sortOverlay = document.getElementById('sort-menu-overlay');
        const sortCancel = document.getElementById('sort-menu-cancel');
        const sortApply = document.getElementById('sort-menu-apply');
        let activeSortColumn = null;
        let selectedDirection = null;

        document.addEventListener('click', function(e) {
            const btn = e.target.closest('.seguimiento-date-sort-btn');
            if (!btn) return;
            e.stopPropagation();
            const col = btn.dataset.sort;
            activeSortColumn = col;

            // Posicionar menú inteligentemente
            const rect = btn.getBoundingClientRect();
            sortMenu.style.display = 'block';
            positionMenuSmartly(sortMenu, rect, 200, 150);
            sortOverlay.style.display = 'block';

            // Copys del menú según columna: avance (progreso) vs fechas
            const descOpt = sortMenu.querySelector('.sort-menu-option[data-dir="desc"] span');
            const ascOpt = sortMenu.querySelector('.sort-menu-option[data-dir="asc"] span');
            if (descOpt && ascOpt) {
                if (col === 'avance') {
                    descOpt.textContent = 'Más avance primero';
                    ascOpt.textContent = 'Menos avance primero';
                } else {
                    descOpt.textContent = 'Más reciente primero';
                    ascOpt.textContent = 'Más reciente al final';
                }
            }

            // Resetear selección
            sortMenu.querySelectorAll('.sort-menu-option').forEach(o => o.classList.remove('selected'));
            selectedDirection = null;

            // Si ya hay un orden en esta columna, marcarlo
            if (currentSort.column === col) {
                const opt = sortMenu.querySelector(`.sort-menu-option[data-dir="${currentSort.direction}"]`);
                if (opt) {
                    opt.classList.add('selected');
                    selectedDirection = currentSort.direction;
                }
            }
        });

        sortMenu.querySelectorAll('.sort-menu-option').forEach(opt => {
            opt.addEventListener('click', function() {
                sortMenu.querySelectorAll('.sort-menu-option').forEach(o => o.classList.remove('selected'));
                this.classList.add('selected');
                selectedDirection = this.dataset.dir;
                
                // Aplicar inmediatamente
                if (activeSortColumn && selectedDirection) {
                    currentSort.column = activeSortColumn;
                    currentSort.direction = selectedDirection;
                    renderTable();
                }
                
                // Cerrar menú
                sortMenu.style.display = 'none';
                sortOverlay.style.display = 'none';
                activeSortColumn = null;
                selectedDirection = null;
            });
        });

        if (sortOverlay) {
            sortOverlay.addEventListener('click', function() {
                sortMenu.style.display = 'none';
                sortOverlay.style.display = 'none';
            });
        }
    }

    // Inicializar menú de filtro con autocomplete (Nombre, Asignado, Plan, Creador)
    function initFilterMenu() {
        const filterMenu = document.getElementById('filter-menu');
        const filterOverlay = document.getElementById('filter-menu-overlay');
        const filterCancel = document.getElementById('filter-menu-cancel');
        const filterApply = document.getElementById('filter-menu-apply');
        const filterContainer = document.getElementById('filter-autocomplete-container');
        let activeFilterColumn = null;
        let selectedFilterValues = new Set(); // Set de valores (strings) directamente, no índices
        let filterApplied = false;

        // Opciones solo de lo que hay disponible en la vista actual (período + búsqueda aplicados)
        const baseData = () => getDataFilteredByPeriodAndSearchOnly();
        const filterDataMap = {
            nombre: () => [...new Set(baseData().map(r => r.nombre))].filter(Boolean).sort((a, b) => a.localeCompare(b, 'es')),
            asignado: () => [...new Set(baseData().map(r => r.asignado && r.asignado.nombre).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es')),
            username: () => [...new Set(baseData().map(r => r.asignado && r.asignado.username).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es')),
            area: () => [...new Set(baseData().map(r => r.area))].filter(Boolean).sort((a, b) => a.localeCompare(b, 'es')),
            lider: () => [...new Set(baseData().map(r => r.lider))].filter(Boolean).sort((a, b) => a.localeCompare(b, 'es')),
            plan: () => [...new Set(baseData().map(r => r.plan))].filter(Boolean).sort((a, b) => a.localeCompare(b, 'es')),
            creador: () => [...new Set(baseData().map(r => r.creador))].filter(Boolean).sort((a, b) => a.localeCompare(b, 'es'))
        };

        // Función para aplicar el filtro con valores seleccionados (o vacío si se deseleccionó todo)
        function applyFilterFromMenu() {
            if (!activeFilterColumn) return;

            filterApplied = true;
            const selectedOptions = Array.from(selectedFilterValues).filter(val => val && val.trim());

            if (activeFilterColumn === 'asignado') {
                currentFilters.persona = selectedOptions;
            } else if (activeFilterColumn === 'username') {
                currentFilters.username = selectedOptions;
            } else if (activeFilterColumn === 'plan') {
                currentFilters.plan = selectedOptions;
            } else if (activeFilterColumn === 'area') {
                currentFilters.area = selectedOptions;
            } else if (activeFilterColumn === 'lider') {
                currentFilters.lider = selectedOptions;
            } else if (activeFilterColumn === 'nombre') {
                currentFilters.nombre = selectedOptions;
            } else if (activeFilterColumn === 'creador') {
                currentFilters.creador = selectedOptions;
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

        // Función para cerrar el menú sin aplicar filtro
        function closeFilterMenu() {
            filterMenu.style.display = 'none';
            filterOverlay.style.display = 'none';
            filterContainer.innerHTML = '';
            activeFilterColumn = null;
            selectedFilterValues.clear();
            filterApplied = false;
        }

        document.querySelectorAll('.seguimiento-filter-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const col = this.dataset.filter;
                activeFilterColumn = col;
                selectedFilterValues.clear();
                filterApplied = false;

                // Cargar valores ya seleccionados en el filtro actual
                let currentFilterValues = [];
                if (col === 'asignado') {
                    currentFilterValues = currentFilters.persona;
                } else if (col === 'username') {
                    currentFilterValues = currentFilters.username;
                } else if (col === 'plan') {
                    currentFilterValues = currentFilters.plan;
                } else if (col === 'area') {
                    currentFilterValues = currentFilters.area;
                } else if (col === 'lider') {
                    currentFilterValues = currentFilters.lider;
                } else if (col === 'nombre') {
                    currentFilterValues = currentFilters.nombre;
                } else if (col === 'creador') {
                    currentFilterValues = currentFilters.creador;
                }

                // Posicionar menú inteligentemente
                const rect = this.getBoundingClientRect();
                filterMenu.style.display = 'block';
                positionMenuSmartly(filterMenu, rect, 280, 300); // Aumentar altura para mostrar opciones con checkboxes
                filterOverlay.style.display = 'block';

                // Crear input con opciones siempre visibles (variante tipo Google Sheets)
                filterContainer.innerHTML = '';
                const allOptions = filterDataMap[col]();
                
                // Cargar los valores ya seleccionados directamente en el Set
                if (Array.isArray(currentFilterValues) && currentFilterValues.length > 0) {
                    currentFilterValues.forEach(value => {
                        if (value && value.trim()) {
                            selectedFilterValues.add(value);
                        }
                    });
                }
                
                // Crear input básico sin usar createInput (para no interferir con el componente existente)
                const inputWrapper = document.createElement('div');
                inputWrapper.className = 'ubits-input-wrapper seguimiento-filter-input-wrapper';
                
                const inputElement = document.createElement('input');
                inputElement.type = 'text';
                inputElement.className = 'ubits-input ubits-input--md';
                inputElement.placeholder = `Filtrar por ${col}...`;
                inputElement.setAttribute('aria-label', `Filtrar por ${col}`);
                
                // Icono de búsqueda
                const searchIcon = document.createElement('i');
                searchIcon.className = 'far fa-search';
                searchIcon.style.position = 'absolute';
                searchIcon.style.right = '12px';
                searchIcon.style.top = '50%';
                searchIcon.style.transform = 'translateY(-50%)';
                searchIcon.style.color = 'var(--ubits-fg-1-medium)';
                searchIcon.style.pointerEvents = 'none';
                
                inputWrapper.style.position = 'relative';
                inputWrapper.appendChild(inputElement);
                inputWrapper.appendChild(searchIcon);
                
                // Contenedor de opciones siempre visibles
                const optionsContainer = document.createElement('div');
                optionsContainer.className = 'seguimiento-filter-options-container';
                optionsContainer.style.maxHeight = '200px';
                optionsContainer.style.overflowY = 'auto';
                optionsContainer.style.marginTop = '8px';
                optionsContainer.style.background = 'var(--ubits-bg-1)';
                
                // Función para renderizar opciones
                function renderFilterOptions(options) {
                    optionsContainer.innerHTML = '';
                    
                    options.forEach((option) => {
                        const optionElement = document.createElement('div');
                        optionElement.className = 'seguimiento-filter-option';
                        
                        // Guardar el valor directamente en lugar del índice
                        optionElement.dataset.value = option;
                        
                        // Checkbox
                        const checkbox = document.createElement('input');
                        checkbox.type = 'checkbox';
                        checkbox.className = 'seguimiento-filter-checkbox';
                        checkbox.checked = selectedFilterValues.has(option);
                        checkbox.dataset.value = option;
                        checkbox.id = `filter-option-${option.replace(/\s+/g, '-')}`;
                        
                        checkbox.addEventListener('change', function() {
                            if (this.checked) {
                                selectedFilterValues.add(this.dataset.value);
                            } else {
                                selectedFilterValues.delete(this.dataset.value);
                            }
                        });
                        
                        // Label para el checkbox
                        const label = document.createElement('label');
                        label.htmlFor = checkbox.id;
                        label.className = 'seguimiento-filter-option-label';
                        label.textContent = option;
                        
                        optionElement.appendChild(checkbox);
                        optionElement.appendChild(label);
                        
                        optionElement.addEventListener('click', function(e) {
                            if (e.target !== checkbox && e.target !== label) {
                                checkbox.checked = !checkbox.checked;
                                checkbox.dispatchEvent(new Event('change'));
                            }
                        });
                        
                        optionsContainer.appendChild(optionElement);
                    });
                }
                
                // Mostrar primeras 5 opciones por defecto
                function showDefaultFilterOptions() {
                    const defaultOptions = allOptions.slice(0, 5);
                    renderFilterOptions(defaultOptions);
                }
                
                // Filtrar opciones cuando se escribe - sin tildes
                inputElement.addEventListener('input', function() {
                    const searchText = this.value;
                    
                    if (searchText.length === 0) {
                        showDefaultFilterOptions();
                    } else {
                        const filtered = allOptions.filter(opt => 
                            normalizeText(opt).includes(normalizeText(searchText))
                        ).slice(0, 5);
                        renderFilterOptions(filtered);
                    }
                });
                
                // Agregar al contenedor
                filterContainer.appendChild(inputWrapper);
                filterContainer.appendChild(optionsContainer);
                
                // Mostrar opciones por defecto al abrir
                showDefaultFilterOptions();
                
                // Focus en el input
                setTimeout(() => {
                    inputElement.focus();
                }, 100);
            });
        });

        // Cerrar sin aplicar si se hace clic en el overlay
        if (filterOverlay) {
            filterOverlay.addEventListener('click', function() {
                closeFilterMenu();
            });
        }

        // Cerrar sin aplicar si se hace clic en cancelar
        if (filterCancel) {
            filterCancel.addEventListener('click', function() {
                closeFilterMenu();
            });
        }

        // Aplicar filtro cuando se hace clic en Aplicar
        if (filterApply) {
            filterApply.addEventListener('click', function() {
                applyFilterFromMenu();
                closeFilterMenu();
            });
        }
    }

    // Inicializar menú de checkboxes (Estado, Prioridad)
    function initCheckboxMenu() {
        const checkboxMenu = document.getElementById('checkbox-menu');
        const checkboxOverlay = document.getElementById('checkbox-menu-overlay');
        const checkboxCancel = document.getElementById('checkbox-menu-cancel');
        const checkboxApply = document.getElementById('checkbox-menu-apply');
        const checkboxOptions = document.getElementById('checkbox-menu-options');
        let activeCheckboxColumn = null;

        const optionsMap = {
            estado: ['Iniciada', 'Vencida', 'Finalizada'],
            prioridad: ['Alta', 'Media', 'Baja']
        };

        document.querySelectorAll('.seguimiento-checkbox-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const col = this.dataset.checkbox;
                activeCheckboxColumn = col;

                // Posicionar menú inteligentemente
                const rect = this.getBoundingClientRect();
                checkboxMenu.style.display = 'block';
                positionMenuSmartly(checkboxMenu, rect, 180, 180);
                checkboxOverlay.style.display = 'block';

                // Generar opciones
                const opts = optionsMap[col] || [];
                const currentSelected = col === 'estado' ? currentFilters.estado : currentFilters.prioridad;

                checkboxOptions.innerHTML = opts.map(opt => {
                    const checked = currentSelected.includes(opt) ? ' checked' : '';
                    return `<label class="checkbox-menu-option">
                        <input type="checkbox" value="${opt}"${checked}>
                        <span class="ubits-body-sm-regular">${opt}</span>
                    </label>`;
                }).join('');
                
                // Agregar event listeners para aplicar en vivo
                checkboxOptions.querySelectorAll('input').forEach(cb => {
                    cb.addEventListener('change', function() {
                        const selected = Array.from(checkboxOptions.querySelectorAll('input:checked')).map(c => c.value);
                        
                        if (activeCheckboxColumn === 'estado') {
                            currentFilters.estado = selected;
                            document.querySelectorAll('#filtros-estado input').forEach(modalCb => {
                                modalCb.checked = selected.includes(modalCb.value);
                            });
                        } else if (activeCheckboxColumn === 'prioridad') {
                            currentFilters.prioridad = selected;
                            document.querySelectorAll('#filtros-prioridad input').forEach(modalCb => {
                                modalCb.checked = selected.includes(modalCb.value);
                            });
                        }

                        currentPage = 1;
                        applyFiltersAndSearch(); // Asegurar que los filtros se apliquen antes de renderizar
                        applySorting();
                        renderTable();
                        updateResultsCount();
                        updateIndicadores();
                        initPaginator();
                        renderFiltrosAplicados();
                    });
                });
            });
        });

        if (checkboxOverlay) {
            checkboxOverlay.addEventListener('click', function() {
                checkboxMenu.style.display = 'none';
                checkboxOverlay.style.display = 'none';
            });
        }
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

        var deleteBodyText = document.querySelector('#delete-modal-overlay .ubits-modal-body p.ubits-body-md-regular');
        if (eliminar) {
            eliminar.addEventListener('click', function() {
                if (selectedIds.size === 0) return;
                if (deleteCount) deleteCount.textContent = selectedIds.size;
                if (deleteBodyText) deleteBodyText.innerHTML = activeTab === 'planes'
                    ? '¿Estás seguro de que deseas eliminar <strong id="delete-count">' + selectedIds.size + '</strong> plan(es) seleccionado(s)?'
                    : '¿Estás seguro de que deseas eliminar <strong id="delete-count">' + selectedIds.size + '</strong> elemento(s) seleccionado(s)?';
                if (deleteOverlay) {
                    deleteOverlay.style.display = 'flex';
                    deleteOverlay.setAttribute('aria-hidden', 'false');
                }
            });
        }

        function closeDeleteModal() {
            if (deleteOverlay) {
                deleteOverlay.style.display = 'none';
                deleteOverlay.setAttribute('aria-hidden', 'true');
            }
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

        // Cambiar prioridad
        const cambiarPrioridad = document.getElementById('seguimiento-cambiar-prioridad');
        const priorityMenu = document.getElementById('priority-menu');
        const priorityOverlay = document.getElementById('priority-menu-overlay');

        if (cambiarPrioridad && priorityMenu) {
            cambiarPrioridad.addEventListener('click', function(e) {
                e.stopPropagation();
                if (selectedIds.size === 0) return;
                const rect = this.getBoundingClientRect();
                priorityMenu.style.top = (rect.bottom + 4) + 'px';
                priorityMenu.style.left = rect.left + 'px';
                priorityMenu.style.display = 'block';
                priorityOverlay.style.display = 'block';
            });

            priorityMenu.querySelectorAll('.priority-menu-option').forEach(opt => {
                opt.addEventListener('click', function() {
                    const val = this.dataset.value;
                    selectedIds.forEach(id => {
                        const row = SEGUIMIENTO_DATA.find(r => r.id === id);
                        if (row) row.prioridad = val;
                    });
                    priorityMenu.style.display = 'none';
                    priorityOverlay.style.display = 'none';
                    renderTable();
                    if (typeof showToast === 'function') showToast('success', `Prioridad cambiada a ${val} para ${selectedIds.size} elemento(s)`);
                });
            });

            if (priorityOverlay) {
                priorityOverlay.addEventListener('click', function() {
                    priorityMenu.style.display = 'none';
                    priorityOverlay.style.display = 'none';
                });
            }
        }

        // Cambiar estado (Tareas: Iniciada/Vencida/Finalizada; Planes: Iniciada/Finalizada + advertencia al reabrir)
        const cambiarEstado = document.getElementById('seguimiento-cambiar-estado');
        const statusMenu = document.getElementById('status-menu');
        const statusOverlay = document.getElementById('status-menu-overlay');
        const statusOptionVencida = statusMenu ? statusMenu.querySelector('.status-menu-option[data-value="Vencida"]') : null;

        if (cambiarEstado && statusMenu) {
            cambiarEstado.addEventListener('click', function(e) {
                e.stopPropagation();
                if (selectedIds.size === 0) return;
                if (statusOptionVencida) statusOptionVencida.style.display = activeTab === 'planes' ? 'none' : '';
                const rect = this.getBoundingClientRect();
                statusMenu.style.top = (rect.bottom + 4) + 'px';
                statusMenu.style.left = rect.left + 'px';
                statusMenu.style.display = 'block';
                statusOverlay.style.display = 'block';
            });

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
                statusMenu.style.display = 'none';
                statusOverlay.style.display = 'none';
                closeReabrirPlanModal();
                renderTable();
                updateIndicadores();
                if (typeof showToast === 'function') showToast('success', 'Estado cambiado a ' + val + ' para ' + selectedIds.size + ' plan(es) y sus tareas asociadas');
            }

            if (reabrirPlanOverlay) reabrirPlanOverlay.addEventListener('click', function(e) { if (e.target === reabrirPlanOverlay) { closeReabrirPlanModal(); statusMenu.style.display = 'none'; statusOverlay.style.display = 'none'; } });
            if (reabrirPlanClose) reabrirPlanClose.addEventListener('click', function() { closeReabrirPlanModal(); statusMenu.style.display = 'none'; statusOverlay.style.display = 'none'; });
            if (reabrirPlanCancel) reabrirPlanCancel.addEventListener('click', function() { closeReabrirPlanModal(); statusMenu.style.display = 'none'; statusOverlay.style.display = 'none'; });
            if (reabrirPlanConfirm) reabrirPlanConfirm.addEventListener('click', applyReabrirPlan);

            statusMenu.querySelectorAll('.status-menu-option').forEach(opt => {
                opt.addEventListener('click', function() {
                    const val = this.dataset.value;
                    if (activeTab === 'planes' && (val === 'Iniciada' || val === 'Finalizada')) {
                        var selectedPlans = SEGUIMIENTO_DATA.filter(function(r) { return r.tipo === 'plan' && selectedIds.has(r.id); });
                        var planNames = selectedPlans.map(function(p) { return p.nombre; });
                        statusMenu.style.display = 'none';
                        statusOverlay.style.display = 'none';
                        pendingReabrirPlan = { val: val, planNames: planNames };
                        if (reabrirPlanTitle) reabrirPlanTitle.textContent = val === 'Iniciada' ? 'Reabrir plan(es)' : 'Finalizar plan(es)';
                        if (reabrirPlanMessage) {
                            if (val === 'Iniciada') {
                                reabrirPlanMessage.textContent = 'Al reabrir este(s) plan(es), las tareas asociadas pasar\u00e1n a estado Iniciada. \u00bfContinuar?';
                            } else {
                                reabrirPlanMessage.textContent = 'Al finalizar este(s) plan(es), las tareas asociadas pasar\u00e1n a estado Finalizada. \u00bfContinuar?';
                            }
                        }
                        if (reabrirPlanOverlay) { reabrirPlanOverlay.style.display = 'flex'; reabrirPlanOverlay.setAttribute('aria-hidden', 'false'); }
                        return;
                    }
                    selectedIds.forEach(function(id) {
                        var row = SEGUIMIENTO_DATA.find(function(r) { return r.id === id; });
                        if (row) row.estado = val;
                    });
                    statusMenu.style.display = 'none';
                    statusOverlay.style.display = 'none';
                    renderTable();
                    updateIndicadores();
                    if (typeof showToast === 'function') showToast('success', 'Estado cambiado a ' + val + ' para ' + selectedIds.size + ' elemento(s)');
                });
            });

            if (statusOverlay) {
                statusOverlay.addEventListener('click', function() {
                    statusMenu.style.display = 'none';
                    statusOverlay.style.display = 'none';
                });
            }
        }

        // Reasignar
        const reasignar = document.getElementById('seguimiento-reasignar');
        const reasignarMenu = document.getElementById('reasignar-menu');
        const reasignarOverlay = document.getElementById('reasignar-menu-overlay');
        const reasignarCancel = document.getElementById('reasignar-cancel');
        const reasignarApply = document.getElementById('reasignar-apply');
        let reasignarPersona = null;

        if (reasignar && reasignarMenu) {
            reasignar.addEventListener('click', function(e) {
                e.stopPropagation();
                if (selectedIds.size === 0) return;
                const rect = this.getBoundingClientRect();
                reasignarMenu.style.top = (rect.bottom + 4) + 'px';
                reasignarMenu.style.left = rect.left + 'px';
                reasignarMenu.style.display = 'block';
                reasignarOverlay.style.display = 'block';

                // Crear autocomplete si no existe
                const container = document.getElementById('reasignar-autocomplete');
                if (container && !container.querySelector('.ubits-input-wrapper') && typeof createInput === 'function') {
                    const personas = [...new Set(SEGUIMIENTO_DATA.map(r => r.asignado.nombre))];
                    createInput({
                        containerId: 'reasignar-autocomplete',
                        type: 'autocomplete',
                        placeholder: 'Buscar persona...',
                        size: 'md',
                        autocompleteOptions: personas.map((p, i) => ({ value: String(i), text: p })),
                        onChange: function(val) {
                            reasignarPersona = personas[parseInt(val)] || val || null;
                        }
                    });
                }
            });

            if (reasignarCancel) {
                reasignarCancel.addEventListener('click', function() {
                    reasignarMenu.style.display = 'none';
                    reasignarOverlay.style.display = 'none';
                    reasignarPersona = null;
                });
            }

            if (reasignarApply) {
                reasignarApply.addEventListener('click', function() {
                    if (reasignarPersona) {
                        const personaExistente = SEGUIMIENTO_DATA.find(r => r.asignado && r.asignado.nombre === reasignarPersona) || SEGUIMIENTO_DATA.find(r => r.asignados && r.asignados.some(a => a.nombre === reasignarPersona));
                        const avatarPersona = personaExistente && (personaExistente.asignado || (personaExistente.asignados && personaExistente.asignados[0])) ? (personaExistente.asignado || personaExistente.asignados[0]).avatar : null;
                        const usernamePersona = personaExistente && (personaExistente.asignado || (personaExistente.asignados && personaExistente.asignados[0])) ? (personaExistente.asignado || personaExistente.asignados[0]).username || '' : '';
                        const nuevoAsignado = { nombre: reasignarPersona, avatar: avatarPersona, username: usernamePersona };

                        selectedIds.forEach(id => {
                            const row = SEGUIMIENTO_DATA.find(r => r.id === id);
                            if (row) {
                                if (row.tipo === 'tarea' && row.plan) {
                                    var plan = SEGUIMIENTO_DATA.find(function(r) { return r.tipo === 'plan' && r.nombre === row.plan; });
                                    if (plan && plan.asignados && Array.isArray(plan.asignados)) {
                                        if (!plan.asignados.some(function(a) { return a.nombre === reasignarPersona; })) {
                                            plan.asignados.push(nuevoAsignado);
                                        }
                                    }
                                }
                                row.asignado = { nombre: reasignarPersona, avatar: avatarPersona, username: usernamePersona };
                            }
                        });
                        renderTable();
                        updateIndicadores();
                        if (typeof showToast === 'function') showToast('success', selectedIds.size + ' elemento(s) reasignado(s) a ' + reasignarPersona);
                    }
                    reasignarMenu.style.display = 'none';
                    reasignarOverlay.style.display = 'none';
                    reasignarPersona = null;
                });
            }

            if (reasignarOverlay) {
                reasignarOverlay.addEventListener('click', function() {
                    reasignarMenu.style.display = 'none';
                    reasignarOverlay.style.display = 'none';
                });
            }
        }

        // Descargar: menú desplegable con Excel y CSV (todas las columnas, solo filas seleccionadas)
        const descargar = document.getElementById('seguimiento-descargar');
        const descargarMenu = document.getElementById('descargar-menu');
        const descargarOverlay = document.getElementById('descargar-menu-overlay');

        function closeDescargarMenu() {
            if (descargarMenu) descargarMenu.style.display = 'none';
            if (descargarOverlay) descargarOverlay.style.display = 'none';
            if (descargar) descargar.setAttribute('aria-expanded', 'false');
        }

        function doDownloadExport(format) {
            if (selectedIds.size === 0) return;
            var isPlanes = activeTab === 'planes';
            var columnIds = isPlanes ? COLUMN_IDS_PLANES : COLUMN_IDS_TAREAS;
            var labelsPlanesExport = { id: 'ID del plan', nombre: 'Nombre del plan', asignados: 'Personas asignadas', creador: 'Creador del plan', estado: 'Estado del plan', avance: 'Progreso del plan', fechaCreacion: 'Fecha de creación', fechaFinalizacion: 'Fecha de finalización' };
            var labelsTareasExport = { id: 'ID de la tarea', nombre: 'Nombre de la tarea', asignado: 'Asignado', creador: 'Creador', area: 'Área', estado: 'Estado', prioridad: 'Prioridad', plan: 'Plan al que pertenece', fechaCreacion: 'Fecha de creación', fechaFinalizacion: 'Fecha de vencimiento', comentarios: 'Número de comentarios' };
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
                if (colId === 'area') return row.area || '';
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

        if (descargar) {
            descargar.addEventListener('click', function(e) {
                if (selectedIds.size === 0) return;
                e.stopPropagation();
                if (descargarMenu && descargarOverlay) {
                    var rect = descargar.getBoundingClientRect();
                    descargarMenu.style.display = 'block';
                    positionMenuSmartly(descargarMenu, rect, 220, 100);
                    descargarOverlay.style.display = 'block';
                    descargar.setAttribute('aria-expanded', 'true');
                }
            });
        }
        if (descargarMenu) {
            descargarMenu.querySelectorAll('.sort-menu-option[data-format]').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    var format = this.getAttribute('data-format');
                    if (format === 'excel' || format === 'csv') doDownloadExport(format);
                    closeDescargarMenu();
                });
            });
        }
        if (descargarOverlay) descargarOverlay.addEventListener('click', closeDescargarMenu);

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
    }

    document.addEventListener('DOMContentLoaded', init);
})();
