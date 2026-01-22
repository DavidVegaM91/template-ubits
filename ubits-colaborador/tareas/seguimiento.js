/* ========================================
   SEGUIMIENTO - Página de seguimiento
   ======================================== */

(function() {
    'use strict';

    // Mapeo de nombres a avatares (consistente por persona)
    const PERSONA_AVATARS = {
        'María García López': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
        'Carlos Rodríguez Pérez': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
        'Ana Martínez Sánchez': 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
        'José López Fernández': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
        'Laura Hernández Gómez': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
        'Miguel González Ruiz': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
        'Carmen Díaz Martín': 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop',
        'Francisco Moreno Jiménez': 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop',
        'Isabel Álvarez Vega': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop',
        'Antonio Romero Navarro': null, // Sin avatar - mostrará icono
        'Elena Torres Gil': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
        'David Sánchez Castro': 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop',
        'Sofía Ramírez Ortega': 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop',
        'Pablo Jiménez Ruiz': null, // Sin avatar - mostrará icono
        'Lucía Fernández Blanco': 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&h=100&fit=crop'
    };

    const NOMBRES = Object.keys(PERSONA_AVATARS);

    const ESTADOS = ['Iniciada', 'Vencida', 'Finalizada'];
    const PRIORIDADES = ['Alta', 'Media', 'Baja'];
    const PLANES_BASE = ['PDI HII 2025', 'Formación Liderazgo', 'Desarrollo Técnico', 'Onboarding 2025', 'Capacitación Ventas', 'Gestión del Talento', 'Transformación Digital'];
    const AREAS = ['Recursos Humanos', 'Tecnología', 'Marketing', 'Ventas', 'Operaciones', 'Finanzas', 'Legal'];

    const COLUMN_IDS = ['id', 'nombre', 'asignado', 'idColaborador', 'plan', 'estado', 'prioridad', 'avance', 'fechaCreacion', 'fechaFinalizacion', 'creador', 'comentarios'];
    const VISIBLE_BY_DEFAULT = ['nombre', 'asignado', 'estado', 'avance', 'fechaCreacion', 'plan'];

    // Estado global
    let SEGUIMIENTO_DATA = [];
    let filteredData = [];
    let columnVisibility = {};
    let currentPage = 1;
    let itemsPerPage = 10;
    let viewOnlySelected = false;
    let selectedIds = new Set();
    let currentSort = { column: null, direction: 'asc' };
    let currentFilters = {
        tipoActividad: [],
        plan: '',
        persona: '',
        area: '',
        estado: [],
        prioridad: [],
        fechaCreacionDesde: null,
        fechaCreacionHasta: null,
        fechaVencimientoDesde: null,
        fechaVencimientoHasta: null
    };
    let searchQuery = '';

    // Utilidades
    function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    function pick(arr) {
        return arr[randomInt(0, arr.length - 1)];
    }

    // Posicionar menú detectando viewport
    function positionMenuSmartly(menu, buttonRect, menuWidth = 200, menuHeight = 150) {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const scrollX = window.scrollX || window.pageXOffset;
        const scrollY = window.scrollY || window.pageYOffset;
        
        let left = buttonRect.left;
        let top = buttonRect.bottom + 4;

        // Si el menú se sale por la derecha, alinear a la derecha del botón
        if (left + menuWidth > viewportWidth - 16) {
            left = buttonRect.right - menuWidth;
        }

        // Si aún se sale, pegarlo al borde derecho
        if (left < 16) {
            left = 16;
        }
        if (left + menuWidth > viewportWidth - 16) {
            left = viewportWidth - menuWidth - 16;
        }

        // Si se sale por abajo, mostrar arriba del botón
        if (top + menuHeight > viewportHeight) {
            top = buttonRect.top - menuHeight - 4;
        }

        menu.style.left = left + 'px';
        menu.style.top = top + 'px';
    }

    // Generar datos de ejemplo (100 filas)
    function generateData() {
        const data = [];
        for (let i = 1; i <= 100; i++) {
            const nombrePersona = pick(NOMBRES);
            const avatar = PERSONA_AVATARS[nombrePersona]; // Avatar consistente por persona
            const area = pick(AREAS);
            data.push({
                id: 12400 + i,
                nombre: 'People Management-Gestión del desempeño ' + randomInt(50, 90) + '% práctico - Módulo ' + i,
                asignado: { nombre: nombrePersona, avatar: avatar },
                idColaborador: String(1000000000 + randomInt(100000, 999999)),
                plan: nombrePersona.split(' ')[0] + ' ' + pick(PLANES_BASE),
                area: area,
                estado: pick(ESTADOS),
                prioridad: pick(PRIORIDADES),
                avance: randomInt(0, 100), // Número de 0 a 100
                fechaFinalizacion: [randomInt(1, 28), 'feb', 2026].join(' '),
                fechaCreacion: [randomInt(1, 28), 'dic', 2025].join(' '),
                creador: 'DS Daniel Sanchez Restrepo',
                comentarios: randomInt(0, 5),
                tipo: randomInt(0, 1) === 0 ? 'plan' : 'tarea'
            });
        }
        return data;
    }

    // Inicializar visibilidad de columnas
    function initColumnVisibility() {
        COLUMN_IDS.forEach(col => {
            columnVisibility[col] = VISIBLE_BY_DEFAULT.includes(col);
        });
    }

    // Aplicar filtros y búsqueda
    function applyFiltersAndSearch() {
        let data = [...SEGUIMIENTO_DATA];

        // Búsqueda
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            data = data.filter(row =>
                row.nombre.toLowerCase().includes(q) ||
                row.asignado.nombre.toLowerCase().includes(q) ||
                row.plan.toLowerCase().includes(q) ||
                row.creador.toLowerCase().includes(q) ||
                String(row.id).includes(q)
            );
        }

        // Filtro tipo actividad
        if (currentFilters.tipoActividad.length > 0 && !currentFilters.tipoActividad.includes('todos')) {
            const tipos = currentFilters.tipoActividad.map(t => t === 'planes' ? 'plan' : t === 'tareas' ? 'tarea' : t);
            data = data.filter(row => tipos.includes(row.tipo));
        }

        // Filtro plan
        if (currentFilters.plan) {
            data = data.filter(row => row.plan.toLowerCase().includes(currentFilters.plan.toLowerCase()));
        }

        // Filtro persona
        if (currentFilters.persona) {
            data = data.filter(row => row.asignado.nombre.toLowerCase().includes(currentFilters.persona.toLowerCase()));
        }

        // Filtro área
        if (currentFilters.area) {
            data = data.filter(row => row.area.toLowerCase().includes(currentFilters.area.toLowerCase()));
        }

        // Filtro estado
        if (currentFilters.estado.length > 0) {
            data = data.filter(row => currentFilters.estado.includes(row.estado));
        }

        // Filtro prioridad
        if (currentFilters.prioridad.length > 0) {
            data = data.filter(row => currentFilters.prioridad.includes(row.prioridad));
        }

        filteredData = data;
    }

    // Aplicar ordenamiento
    function applySorting() {
        if (!currentSort.column) return;

        filteredData.sort((a, b) => {
            let valA = a[currentSort.column];
            let valB = b[currentSort.column];

            // Manejar objetos (asignado)
            if (currentSort.column === 'asignado') {
                valA = a.asignado.nombre;
                valB = b.asignado.nombre;
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
        if (!tbody) return;

        const data = getDisplayData();
        const start = (currentPage - 1) * itemsPerPage;
        const slice = data.slice(start, start + itemsPerPage);

        const statusClass = { Iniciada: 'info', Vencida: 'error', Finalizada: 'success' };
        const prioridadIcon = { Alta: 'fa-chevrons-up', Media: 'fa-chevron-up', Baja: 'fa-chevron-down' };
        const prioridadColor = { Alta: 'var(--ubits-feedback-accent-error)', Media: 'var(--ubits-fg-1-medium)', Baja: 'var(--ubits-feedback-accent-info)' };

        tbody.innerHTML = slice.map(row => {
            const sel = selectedIds.has(row.id) ? ' checked' : '';
            const asignadoHtml = row.asignado.avatar
                ? `<div class="seguimiento-avatar"><img src="${row.asignado.avatar}" alt="" width="28" height="28"></div><span class="ubits-body-sm-regular">${row.asignado.nombre}</span>`
                : `<div class="seguimiento-avatar seguimiento-avatar-icon"><i class="far fa-user"></i></div><span class="ubits-body-sm-regular">${row.asignado.nombre}</span>`;
            const estadoTag = `<span class="ubits-status-tag ubits-status-tag--${statusClass[row.estado]} ubits-status-tag--sm"><span class="ubits-status-tag__text">${row.estado}</span></span>`;
            const prioridadHtml = `<span class="seguimiento-prioridad" style="color:${prioridadColor[row.prioridad]}"><i class="far ${prioridadIcon[row.prioridad]}"></i> ${row.prioridad}</span>`;
            const comentariosText = row.comentarios === 0 ? '0 comentarios' : `${row.comentarios} comentario${row.comentarios > 1 ? 's' : ''}`;
            
            // Progress bar para avance
            const avanceNum = typeof row.avance === 'number' ? row.avance : parseInt(row.avance) || 0;
            const avanceHtml = `<div class="seguimiento-avance"><div class="seguimiento-progress-bar"><div class="seguimiento-progress-bar-fill" style="width: ${avanceNum}%"></div></div><span class="ubits-body-sm-regular">${avanceNum}%</span></div>`;

            const cols = ['_checkbox', 'id', 'nombre', 'asignado', 'idColaborador', 'plan', 'estado', 'prioridad', 'avance', 'fechaCreacion', 'fechaFinalizacion', 'creador', 'comentarios'];
            const cells = [
                `<td class="seguimiento-td-checkbox"><input type="checkbox" class="seguimiento-row-check" data-id="${row.id}"${sel}></td>`,
                `<td class="seguimiento-td" data-col="id">${row.id}</td>`,
                `<td class="seguimiento-td" data-col="nombre"><span class="ubits-body-sm-regular">${row.nombre}</span></td>`,
                `<td class="seguimiento-td" data-col="asignado"><div class="seguimiento-asignado">${asignadoHtml}</div></td>`,
                `<td class="seguimiento-td" data-col="idColaborador"><span class="ubits-body-sm-regular">${row.idColaborador}</span></td>`,
                `<td class="seguimiento-td" data-col="plan"><span class="ubits-body-sm-regular">${row.plan}</span></td>`,
                `<td class="seguimiento-td" data-col="estado">${estadoTag}</td>`,
                `<td class="seguimiento-td" data-col="prioridad">${prioridadHtml}</td>`,
                `<td class="seguimiento-td" data-col="avance">${avanceHtml}</td>`,
                `<td class="seguimiento-td" data-col="fechaCreacion"><span class="ubits-body-sm-regular">${row.fechaCreacion}</span></td>`,
                `<td class="seguimiento-td" data-col="fechaFinalizacion"><span class="ubits-body-sm-regular">${row.fechaFinalizacion}</span></td>`,
                `<td class="seguimiento-td" data-col="creador"><span class="ubits-body-sm-regular">${row.creador}</span></td>`,
                `<td class="seguimiento-td" data-col="comentarios"><span class="ubits-body-sm-regular">${comentariosText}</span></td>`
            ];

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
        el.textContent = `${data.length}/${SEGUIMIENTO_DATA.length}`;
    }

    // Construir menú de columnas
    function buildColumnsMenu() {
        const list = document.getElementById('columns-menu-list');
        if (!list) return;

        const labels = {
            id: 'ID',
            nombre: 'Nombre',
            asignado: 'Asignado',
            idColaborador: 'ID Colaborador',
            plan: 'Plan',
            estado: 'Estado',
            prioridad: 'Prioridad',
            avance: 'Avance',
            fechaFinalizacion: 'Fecha de finalización',
            fechaCreacion: 'Fecha de creación',
            creador: 'Creador',
            comentarios: 'Comentario'
        };

        list.innerHTML = COLUMN_IDS.map(col => {
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

    // Abrir/cerrar modal de filtros
    function openFiltersModal() {
        const overlay = document.getElementById('filtros-modal-overlay');
        if (overlay) {
            overlay.style.display = 'flex';
            overlay.setAttribute('aria-hidden', 'false');
            initFilterInputs();
        }
    }

    function closeFiltersModal() {
        const overlay = document.getElementById('filtros-modal-overlay');
        if (overlay) {
            overlay.style.display = 'none';
            overlay.setAttribute('aria-hidden', 'true');
        }
    }

    // Inicializar inputs de filtros (autocomplete y calendar)
    function initFilterInputs() {
        // Solo inicializar una vez
        if (document.getElementById('filtros-buscar-plan').querySelector('.ubits-input-wrapper')) return;

        // Obtener opciones únicas de los datos
        const planes = [...new Set(SEGUIMIENTO_DATA.map(r => r.plan))];
        const personas = [...new Set(SEGUIMIENTO_DATA.map(r => r.asignado.nombre))];
        const areas = [...new Set(SEGUIMIENTO_DATA.map(r => r.area))];

        if (typeof createInput === 'function') {
            // Buscar plan
            createInput({
                containerId: 'filtros-buscar-plan',
                type: 'autocomplete',
                placeholder: 'Buscar plan...',
                size: 'md',
                autocompleteOptions: planes.map((p, i) => ({ value: String(i), text: p })),
                onChange: function(val) {
                    const opt = planes.find((p, i) => String(i) === val);
                    currentFilters.plan = opt || val || '';
                }
            });

            // Buscar personas
            createInput({
                containerId: 'filtros-buscar-personas',
                type: 'autocomplete',
                placeholder: 'Buscar personas...',
                size: 'md',
                autocompleteOptions: personas.map((p, i) => ({ value: String(i), text: p })),
                onChange: function(val) {
                    const opt = personas.find((p, i) => String(i) === val);
                    currentFilters.persona = opt || val || '';
                }
            });

            // Todas las áreas
            createInput({
                containerId: 'filtros-areas',
                type: 'autocomplete',
                placeholder: 'Buscar área...',
                size: 'md',
                autocompleteOptions: areas.map((a, i) => ({ value: String(i), text: a })),
                onChange: function(val) {
                    const opt = areas.find((a, i) => String(i) === val);
                    currentFilters.area = opt || val || '';
                }
            });

            // Fechas de creación
            createInput({
                containerId: 'filtros-fecha-creacion-desde',
                type: 'calendar',
                placeholder: 'Desde',
                size: 'md',
                onChange: function(val) {
                    currentFilters.fechaCreacionDesde = val || null;
                }
            });

            createInput({
                containerId: 'filtros-fecha-creacion-hasta',
                type: 'calendar',
                placeholder: 'Hasta',
                size: 'md',
                onChange: function(val) {
                    currentFilters.fechaCreacionHasta = val || null;
                }
            });

            // Fechas de vencimiento
            createInput({
                containerId: 'filtros-fecha-vencimiento-desde',
                type: 'calendar',
                placeholder: 'Desde',
                size: 'md',
                onChange: function(val) {
                    currentFilters.fechaVencimientoDesde = val || null;
                }
            });

            createInput({
                containerId: 'filtros-fecha-vencimiento-hasta',
                type: 'calendar',
                placeholder: 'Hasta',
                size: 'md',
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

    // Limpiar filtros
    function clearFilters() {
        currentFilters = {
            tipoActividad: [],
            plan: '',
            persona: '',
            area: '',
            estado: [],
            prioridad: [],
            fechaCreacionDesde: null,
            fechaCreacionHasta: null,
            fechaVencimientoDesde: null,
            fechaVencimientoHasta: null
        };

        // Limpiar checkboxes
        document.querySelectorAll('#filtros-tipo-actividad input').forEach(cb => {
            cb.checked = cb.value === 'todos';
        });
        document.querySelectorAll('#filtros-estado input, #filtros-prioridad input').forEach(cb => {
            cb.checked = false;
        });

        // Limpiar inputs (si existen métodos)
        // Los inputs de createInput() no tienen un método clear estándar, se reinicializarán
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

        let isSearchMode = false;

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
                        placeholder: 'Buscar...',
                        size: 'md',
                        onChange: function(val) {
                            searchQuery = val || '';
                            currentPage = 1;
                            renderTable();
                            updateResultsCount();
                            initPaginator();
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
                                renderTable();
                                updateResultsCount();
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
        });
        if (filtersAplicar) filtersAplicar.addEventListener('click', function() {
            readFilterCheckboxes();
            currentPage = 1;
            renderTable();
            updateResultsCount();
            initPaginator();
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
    }

    // Inicializar menú de ordenamiento por fecha
    function initSortMenu() {
        const sortMenu = document.getElementById('sort-menu');
        const sortOverlay = document.getElementById('sort-menu-overlay');
        const sortCancel = document.getElementById('sort-menu-cancel');
        const sortApply = document.getElementById('sort-menu-apply');
        let activeSortColumn = null;
        let selectedDirection = null;

        document.querySelectorAll('.seguimiento-date-sort-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const col = this.dataset.sort;
                activeSortColumn = col;

                // Posicionar menú inteligentemente
                const rect = this.getBoundingClientRect();
                sortMenu.style.display = 'block';
                positionMenuSmartly(sortMenu, rect, 200, 150);
                sortOverlay.style.display = 'block';

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
        let selectedFilterValue = '';

        const filterDataMap = {
            nombre: () => [...new Set(SEGUIMIENTO_DATA.map(r => r.nombre))],
            asignado: () => [...new Set(SEGUIMIENTO_DATA.map(r => r.asignado.nombre))],
            plan: () => [...new Set(SEGUIMIENTO_DATA.map(r => r.plan))],
            creador: () => [...new Set(SEGUIMIENTO_DATA.map(r => r.creador))]
        };

        document.querySelectorAll('.seguimiento-filter-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const col = this.dataset.filter;
                activeFilterColumn = col;
                selectedFilterValue = '';

                // Posicionar menú inteligentemente
                const rect = this.getBoundingClientRect();
                filterMenu.style.display = 'block';
                positionMenuSmartly(filterMenu, rect, 280, 120);
                filterOverlay.style.display = 'block';

                // Crear autocomplete
                filterContainer.innerHTML = '';
                if (typeof createInput === 'function') {
                    const options = filterDataMap[col]();
                    createInput({
                        containerId: 'filter-autocomplete-container',
                        type: 'autocomplete',
                        placeholder: `Filtrar por ${col}...`,
                        size: 'md',
                        autocompleteOptions: options.slice(0, 50).map((o, i) => ({ value: String(i), text: o })),
                        onChange: function(val) {
                            const opt = options[parseInt(val)];
                            selectedFilterValue = opt || val || '';
                            
                            // Aplicar inmediatamente
                            if (activeFilterColumn && selectedFilterValue) {
                                if (activeFilterColumn === 'asignado') {
                                    currentFilters.persona = selectedFilterValue;
                                } else if (activeFilterColumn === 'plan') {
                                    currentFilters.plan = selectedFilterValue;
                                }
                                if (activeFilterColumn === 'nombre' || activeFilterColumn === 'creador') {
                                    searchQuery = selectedFilterValue;
                                }

                                currentPage = 1;
                                renderTable();
                                updateResultsCount();
                                initPaginator();
                            }
                            
                            // Cerrar menú
                            filterMenu.style.display = 'none';
                            filterOverlay.style.display = 'none';
                            filterContainer.innerHTML = '';
                            activeFilterColumn = null;
                            selectedFilterValue = '';
                        }
                    });
                }
            });
        });

        if (filterOverlay) {
            filterOverlay.addEventListener('click', function() {
                filterMenu.style.display = 'none';
                filterOverlay.style.display = 'none';
                filterContainer.innerHTML = '';
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
                        renderTable();
                        updateResultsCount();
                        initPaginator();
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

        if (eliminar) {
            eliminar.addEventListener('click', function() {
                if (selectedIds.size === 0) return;
                if (deleteCount) deleteCount.textContent = selectedIds.size;
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
                closeDeleteModal();
                if (typeof showToast === 'function') showToast('success', `${selectedIds.size} elemento(s) eliminado(s) correctamente`);
                // No eliminar realmente, es solo ejemplo
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

        // Cambiar estado
        const cambiarEstado = document.getElementById('seguimiento-cambiar-estado');
        const statusMenu = document.getElementById('status-menu');
        const statusOverlay = document.getElementById('status-menu-overlay');

        if (cambiarEstado && statusMenu) {
            cambiarEstado.addEventListener('click', function(e) {
                e.stopPropagation();
                if (selectedIds.size === 0) return;
                const rect = this.getBoundingClientRect();
                statusMenu.style.top = (rect.bottom + 4) + 'px';
                statusMenu.style.left = rect.left + 'px';
                statusMenu.style.display = 'block';
                statusOverlay.style.display = 'block';
            });

            statusMenu.querySelectorAll('.status-menu-option').forEach(opt => {
                opt.addEventListener('click', function() {
                    const val = this.dataset.value;
                    selectedIds.forEach(id => {
                        const row = SEGUIMIENTO_DATA.find(r => r.id === id);
                        if (row) row.estado = val;
                    });
                    statusMenu.style.display = 'none';
                    statusOverlay.style.display = 'none';
                    renderTable();
                    if (typeof showToast === 'function') showToast('success', `Estado cambiado a ${val} para ${selectedIds.size} elemento(s)`);
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
                        selectedIds.forEach(id => {
                            const row = SEGUIMIENTO_DATA.find(r => r.id === id);
                            if (row) {
                                row.asignado.nombre = reasignarPersona;
                                // Asignar avatar aleatorio o null
                                row.asignado.avatar = UNSPLASH_AVATARS[Math.floor(Math.random() * UNSPLASH_AVATARS.length)];
                            }
                        });
                        renderTable();
                        if (typeof showToast === 'function') showToast('success', `${selectedIds.size} elemento(s) reasignado(s) a ${reasignarPersona}`);
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

        // Descargar CSV
        const descargar = document.getElementById('seguimiento-descargar');
        if (descargar) {
            descargar.addEventListener('click', function() {
                if (selectedIds.size === 0) return;

                const selectedRows = SEGUIMIENTO_DATA.filter(r => selectedIds.has(r.id));
                const headers = ['ID', 'Nombre', 'Asignado', 'ID Colaborador', 'Plan', 'Estado', 'Prioridad', 'Avance', 'Fecha Finalización', 'Fecha Creación', 'Creador', 'Comentarios'];
                const csvRows = [headers.join(',')];

                selectedRows.forEach(row => {
                    const values = [
                        row.id,
                        `"${row.nombre.replace(/"/g, '""')}"`,
                        `"${row.asignado.nombre.replace(/"/g, '""')}"`,
                        row.idColaborador,
                        `"${row.plan.replace(/"/g, '""')}"`,
                        row.estado,
                        row.prioridad,
                        row.avance,
                        row.fechaFinalizacion,
                        row.fechaCreacion,
                        `"${row.creador.replace(/"/g, '""')}"`,
                        row.comentarios
                    ];
                    csvRows.push(values.join(','));
                });

                const csvContent = csvRows.join('\n');
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `seguimiento_${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);

                if (typeof showToast === 'function') showToast('success', `${selectedIds.size} elemento(s) descargado(s)`);
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
    function init() {
        SEGUIMIENTO_DATA = generateData();
        filteredData = [...SEGUIMIENTO_DATA];
        initColumnVisibility();
        initNav();
        buildColumnsMenu();
        renderTable();
        updateSelectAll();
        updateResultsCount();
        initPaginator();
        initSearchToggle();
        initModals();
        initSortMenu();
        initFilterMenu();
        initCheckboxMenu();
        initCheckboxes();
        initVerSeleccionados();
        initActionButtons();
        initMobileAlert();
    }

    document.addEventListener('DOMContentLoaded', init);
})();
