/* ========================================
   SEGUIMIENTO - Página de seguimiento
   Empresa: Decoraciones Premium S.A.S.
   Base de datos: seguimiento-data.js
   ======================================== */

(function() {
    'use strict';

    // Los datos se cargan desde seguimiento-data.js (SEGUIMIENTO_DATABASE)
    const COLUMN_IDS = ['id', 'nombre', 'asignado', 'username', 'cargo', 'area', 'lider', 'creador', 'plan', 'estado', 'prioridad', 'avance', 'fechaCreacion', 'fechaFinalizacion', 'comentarios'];
    const VISIBLE_BY_DEFAULT = ['nombre', 'asignado', 'estado', 'prioridad', 'avance', 'fechaCreacion'];

    // Estado global
    let SEGUIMIENTO_DATA = [];
    let filteredData = [];
    let columnVisibility = {};
    let currentPage = 1;
    let itemsPerPage = 10;
    let viewOnlySelected = false;
    let selectedIds = new Set();
    let currentSort = { column: 'fechaCreacion', direction: 'desc' }; // Por defecto: más reciente primero
    let currentFilters = {
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
        periodo: '30' // Días hacia atrás desde hoy (30, 90, 180, 365). Por defecto: 30 días
    };
    let searchQuery = '';

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
    // 50 empleados, cada uno con 2 planes y 10 tareas = 600 actividades
    function generateData() {
        if (typeof SEGUIMIENTO_DATABASE !== 'undefined' && SEGUIMIENTO_DATABASE.generarActividades) {
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

    // Inicializar visibilidad de columnas
    function initColumnVisibility() {
        COLUMN_IDS.forEach(col => {
            columnVisibility[col] = VISIBLE_BY_DEFAULT.includes(col);
        });
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
        let data = [...SEGUIMIENTO_DATA];

        // Búsqueda general (searchQuery) - sin tildes
        if (searchQuery) {
            const q = normalizeText(searchQuery);
            data = data.filter(row =>
                normalizeText(row.nombre).includes(q) ||
                normalizeText(row.asignado.nombre).includes(q) ||
                (row.asignado.username && normalizeText(row.asignado.username).includes(q)) ||
                normalizeText(row.plan).includes(q) ||
                normalizeText(row.creador).includes(q) ||
                String(row.id).includes(q)
            );
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

        // Filtro tipo actividad
        if (currentFilters.tipoActividad.length > 0 && !currentFilters.tipoActividad.includes('todos')) {
            const tipos = currentFilters.tipoActividad.map(t => t === 'planes' ? 'plan' : t === 'tareas' ? 'tarea' : t);
            data = data.filter(row => tipos.includes(row.tipo));
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

        // Filtro por período (últimos X días desde hoy)
        if (currentFilters.periodo) {
            const hoy = new Date(2026, 2, 22); // Domingo 22 de marzo de 2026
            hoy.setHours(23, 59, 59, 999); // Fin del día de hoy
            
            // Calcular fecha límite: para "últimos 30 días" desde el 22 de marzo (incluyendo hoy),
            // debemos incluir desde el 23 de febrero (29 días atrás desde hoy)
            const periodoDias = parseInt(currentFilters.periodo) || 30; // Asegurar que sea número
            const diasAtras = periodoDias - 1; // Para 30 días: 29 días atrás
            
            // Crear fecha límite: usar milisegundos de forma precisa
            // 22 de marzo 2026, 00:00:00 - 29 días = 23 de febrero 2026, 00:00:00
            const hoyInicio = new Date(2026, 2, 22, 0, 0, 0, 0);
            const fechaLimite = new Date(hoyInicio.getTime() - (diasAtras * 86400000)); // 86400000 ms = 1 día
            
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

            // Manejar objetos (asignado)
            if (currentSort.column === 'asignado') {
                valA = a.asignado.nombre;
                valB = b.asignado.nombre;
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
        
        // Si no hay resultados, mostrar empty state
        if (data.length === 0) {
            // Ocultar tabla y paginador
            if (tableWrapper) tableWrapper.style.display = 'none';
            if (paginatorContainer) paginatorContainer.style.display = 'none';
            
            // Mostrar empty state
            if (emptyStateContainer && typeof loadEmptyState === 'function') {
                emptyStateContainer.style.display = 'flex';
                loadEmptyState('seguimiento-empty-state', {
                    icon: 'fa-search',
                    iconSize: 'lg',
                    title: 'No se encontraron resultados',
                    description: 'Intenta ajustar tu búsqueda o filtros para encontrar lo que buscas.',
                    buttons: {
                        primary: {
                            text: 'Limpiar búsqueda',
                            icon: 'fa-times',
                            onClick: function() {
                                // Placeholder, manejaremos el click directamente
                            }
                        }
                    }
                });
                
                // Agregar event listener directo al botón después de que se carga
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

            const cols = ['_checkbox', 'id', 'nombre', 'asignado', 'username', 'cargo', 'area', 'lider', 'creador', 'plan', 'estado', 'prioridad', 'avance', 'fechaCreacion', 'fechaFinalizacion', 'comentarios'];
            const cells = [
                `<td class="seguimiento-td-checkbox"><input type="checkbox" class="seguimiento-row-check" data-id="${row.id}"${sel}></td>`,
                `<td class="seguimiento-td" data-col="id">${row.id}</td>`,
                `<td class="seguimiento-td" data-col="nombre"><span class="ubits-body-sm-regular">${row.nombre}</span></td>`,
                `<td class="seguimiento-td" data-col="asignado"><div class="seguimiento-asignado">${asignadoHtml}</div></td>`,
                `<td class="seguimiento-td" data-col="username"><span class="ubits-body-sm-regular">${row.asignado.username || ''}</span></td>`,
                `<td class="seguimiento-td" data-col="cargo"><span class="ubits-body-sm-regular">${row.cargo || ''}</span></td>`,
                `<td class="seguimiento-td" data-col="area"><span class="ubits-body-sm-regular">${row.area}</span></td>`,
                `<td class="seguimiento-td" data-col="lider"><span class="ubits-body-sm-regular">${row.lider || ''}</span></td>`,
                `<td class="seguimiento-td" data-col="creador"><span class="ubits-body-sm-regular">${row.creador}</span></td>`,
                `<td class="seguimiento-td" data-col="plan"><span class="ubits-body-sm-regular">${row.plan}</span></td>`,
                `<td class="seguimiento-td" data-col="estado">${estadoTag}</td>`,
                `<td class="seguimiento-td" data-col="prioridad">${prioridadHtml}</td>`,
                `<td class="seguimiento-td" data-col="avance">${avanceHtml}</td>`,
                `<td class="seguimiento-td" data-col="fechaCreacion"><span class="ubits-body-sm-regular">${formatearFechaParaMostrar(row.fechaCreacion)}</span></td>`,
                `<td class="seguimiento-td" data-col="fechaFinalizacion"><span class="ubits-body-sm-regular">${formatearFechaParaMostrar(row.fechaFinalizacion)}</span></td>`,
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

    // Actualizar indicadores de seguimiento
    function updateIndicadores() {
        // Usar filteredData directamente (ya contiene los datos filtrados)
        // NO llamar applyFiltersAndSearch() aquí porque ya se llamó antes
        const data = filteredData;
        
        // Filtrar solo tareas (no planes)
        const tareas = data.filter(item => item.tipo === 'tarea');
        const totalTareas = tareas.length;
        
        // Calcular indicadores
        const finalizadas = tareas.filter(t => t.estado === 'Finalizada').length;
        const iniciadas = tareas.filter(t => t.estado === 'Iniciada').length;
        const vencidas = tareas.filter(t => t.estado === 'Vencida').length;
        const totalActividades = data.length;
        
        // Calcular porcentajes
        const porcentajeFinalizadas = totalTareas > 0 ? Math.round((finalizadas / totalTareas) * 100) : 0;
        const porcentajeIniciadas = totalTareas > 0 ? Math.round((iniciadas / totalTareas) * 100) : 0;
        const porcentajeVencidas = totalTareas > 0 ? Math.round((vencidas / totalTareas) * 100) : 0;
        
        // Actualizar DOM - Total (primera card)
        const cardTotal = document.querySelector('#seguimiento-indicadores .seguimiento-indicador-card:nth-child(1)');
        if (cardTotal) {
            const numberEl = cardTotal.querySelector('.indicador-number');
            if (numberEl) numberEl.textContent = totalActividades;
        }
        
        // Actualizar DOM - Finalizadas (segunda card)
        const cardFinalizadas = document.querySelector('#seguimiento-indicadores .seguimiento-indicador-card:nth-child(2)');
        if (cardFinalizadas) {
            const numberEl = cardFinalizadas.querySelector('.indicador-number');
            const percentageEl = cardFinalizadas.querySelector('.indicador-percentage');
            if (numberEl) numberEl.textContent = finalizadas;
            if (percentageEl) percentageEl.textContent = `${porcentajeFinalizadas}%`;
        }
        
        // Actualizar DOM - Iniciadas (tercera card)
        const cardIniciadas = document.querySelector('#seguimiento-indicadores .seguimiento-indicador-card:nth-child(3)');
        if (cardIniciadas) {
            const numberEl = cardIniciadas.querySelector('.indicador-number');
            const percentageEl = cardIniciadas.querySelector('.indicador-percentage');
            if (numberEl) numberEl.textContent = iniciadas;
            if (percentageEl) percentageEl.textContent = `${porcentajeIniciadas}%`;
        }
        
        // Actualizar DOM - Vencidas (cuarta card)
        const cardVencidas = document.querySelector('#seguimiento-indicadores .seguimiento-indicador-card:nth-child(4)');
        if (cardVencidas) {
            const numberEl = cardVencidas.querySelector('.indicador-number');
            const percentageEl = cardVencidas.querySelector('.indicador-percentage');
            if (numberEl) numberEl.textContent = vencidas;
            if (percentageEl) percentageEl.textContent = `${porcentajeVencidas}%`;
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

        // Tipo de actividad (solo mostrar si NO es "todos")
        if (currentFilters.tipoActividad.length > 0 && !currentFilters.tipoActividad.includes('todos')) {
            hasFilters = true;
            const tipos = currentFilters.tipoActividad.map(t => t === 'planes' ? 'Planes' : t === 'tareas' ? 'Tareas' : t);
            chips.push({
                type: 'tipoActividad',
                label: 'Tipo',
                value: tipos.join(', '),
                remove: () => {
                    currentFilters.tipoActividad = [];
                    // Desmarcar todos los radio buttons
                    document.querySelectorAll('#filtros-tipo-actividad input').forEach(cb => {
                        cb.checked = false;
                    });
                    currentPage = 1;
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
                        // Si no quedan valores, limpiar input de plan
                        if (currentFilters.plan.length === 0) {
                            const planContainer = document.getElementById('filtros-buscar-plan');
                            if (planContainer) {
                                planContainer.innerHTML = '';
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

        const labels = {
            id: 'ID',
            nombre: 'Nombre de actividad',
            asignado: 'Asignado',
            username: 'Username',
            cargo: 'Cargo',
            area: 'Área',
            lider: 'Lider',
            plan: 'Plan',
            estado: 'Estado',
            prioridad: 'Prioridad',
            avance: 'Progreso',
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

    // Función para crear autocomplete con checkboxes en el modal de filtros (dropdown normal)
    function createFilterAutocompleteWithCheckboxes(containerId, options, placeholder, onSelectionChange) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = '';
        
        // Cargar valores ya seleccionados
        let currentFilterValues = [];
        if (containerId === 'filtros-buscar-plan') {
            currentFilterValues = currentFilters.plan;
        } else if (containerId === 'filtros-buscar-personas') {
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

    // Inicializar inputs de filtros (autocomplete y calendar)
    function initFilterInputs() {
        // Solo inicializar una vez
        if (document.getElementById('filtros-buscar-plan').querySelector('.seguimiento-filter-input-wrapper')) return;

        // Obtener opciones únicas de los datos
        const planes = [...new Set(SEGUIMIENTO_DATA.map(r => r.plan))];
        const nombresActividades = [...new Set(SEGUIMIENTO_DATA.map(r => r.nombre))];
        // Combinar planes y nombres de actividades para el autocomplete
        const opcionesPlan = [...new Set([...planes, ...nombresActividades])];
        const personas = [...new Set(SEGUIMIENTO_DATA.map(r => r.asignado.nombre))];
        const areas = [...new Set(SEGUIMIENTO_DATA.map(r => r.area))];

        // Buscar plan o tarea (con checkboxes)
        createFilterAutocompleteWithCheckboxes('filtros-buscar-plan', opcionesPlan, 'Buscar plan o tarea...', (selectedValues) => {
            currentFilters.plan = selectedValues;
            currentPage = 1;
            applyFiltersAndSearch();
            applySorting();
            renderTable();
            updateResultsCount();
            updateIndicadores();
            initPaginator();
            renderFiltrosAplicados();
        });

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
            periodo: '30' // Resetear a 30 días por defecto
        };
        
        // Resetear botón de período a "Últimos 30 días"
        const periodoText = document.getElementById('seguimiento-periodo-text');
        if (periodoText) {
            periodoText.textContent = 'Últimos 30 días';
        }
        
        // Resetear selección visual en el menú
        const periodoMenu = document.getElementById('periodo-menu');
        if (periodoMenu) {
            periodoMenu.querySelectorAll('.periodo-menu-option').forEach(opt => {
                opt.classList.remove('selected');
                if (opt.dataset.value === '30') {
                    opt.classList.add('selected');
                }
            });
        }

        // Limpiar radio buttons de tipo de actividad (desmarcar todos)
        document.querySelectorAll('#filtros-tipo-actividad input').forEach(cb => {
            cb.checked = false;
        });
        document.querySelectorAll('#filtros-estado input, #filtros-prioridad input').forEach(cb => {
            cb.checked = false;
        });

        // Limpiar inputs (si existen métodos)
        // Los inputs de createInput() no tienen un método clear estándar, se reinicializarán
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
            '30': 'Últimos 30 días',
            '90': 'Últimos 3 meses',
            '180': 'Últimos 6 meses',
            '365': 'Último año'
        };

        // Valor inicial (sincronizar con currentFilters)
        let selectedPeriodo = currentFilters.periodo || '30';
        
        // Sincronizar texto del botón con el valor inicial
        if (periodoTexts[selectedPeriodo]) {
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
                selectedPeriodo = value;
                
                // Actualizar texto del botón
                periodoText.textContent = periodoTexts[value];
                
                // Actualizar selección visual
                periodoMenu.querySelectorAll('.periodo-menu-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                this.classList.add('selected');
                
                // Cerrar el menú
                periodoMenu.style.display = 'none';
                periodoOverlay.style.display = 'none';
                
                // Aplicar filtro por período
                currentFilters.periodo = value;
                
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
        let selectedFilterValues = new Set(); // Set de valores (strings) directamente, no índices
        let filterApplied = false;

        const filterDataMap = {
            nombre: () => [...new Set(SEGUIMIENTO_DATA.map(r => r.nombre))].sort((a, b) => a.localeCompare(b, 'es')),
            asignado: () => [...new Set(SEGUIMIENTO_DATA.map(r => r.asignado.nombre))].sort((a, b) => a.localeCompare(b, 'es')),
            username: () => [...new Set(SEGUIMIENTO_DATA.map(r => r.asignado.username))].filter(u => u).sort((a, b) => a.localeCompare(b, 'es')),
            area: () => [...new Set(SEGUIMIENTO_DATA.map(r => r.area))].sort((a, b) => a.localeCompare(b, 'es')),
            lider: () => [...new Set(SEGUIMIENTO_DATA.map(r => r.lider))].filter(l => l).sort((a, b) => a.localeCompare(b, 'es')),
            plan: () => [...new Set(SEGUIMIENTO_DATA.map(r => r.plan))].sort((a, b) => a.localeCompare(b, 'es')),
            creador: () => [...new Set(SEGUIMIENTO_DATA.map(r => r.creador))].sort((a, b) => a.localeCompare(b, 'es'))
        };

        // Función para aplicar el filtro con valores seleccionados
        function applyFilterFromMenu() {
            if (activeFilterColumn && selectedFilterValues.size > 0) {
                filterApplied = true;
                
                // Convertir el Set directamente a un array (ya contiene los valores, no índices)
                const selectedOptions = Array.from(selectedFilterValues).filter(val => val && val.trim());
                
                // Reemplazar los valores del filtro con los nuevos seleccionados
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
                        // Buscar el avatar de la persona seleccionada en los datos existentes
                        const personaExistente = SEGUIMIENTO_DATA.find(r => r.asignado.nombre === reasignarPersona);
                        const avatarPersona = personaExistente ? personaExistente.asignado.avatar : null;
                        
                        selectedIds.forEach(id => {
                            const row = SEGUIMIENTO_DATA.find(r => r.id === id);
                            if (row) {
                                row.asignado.nombre = reasignarPersona;
                                row.asignado.avatar = avatarPersona;
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
                const headers = ['ID', 'Nombre', 'Asignado', 'Username', 'Cargo', 'Área', 'Lider', 'Creador', 'Plan', 'Estado', 'Prioridad', 'Progreso', 'Fecha Finalización', 'Fecha Creación', 'Comentarios'];
                const csvRows = [headers.join(',')];

                selectedRows.forEach(row => {
                    const values = [
                        row.id,
                        `"${row.nombre.replace(/"/g, '""')}"`,
                        `"${row.asignado.nombre.replace(/"/g, '""')}"`,
                        `"${(row.asignado.username || '').replace(/"/g, '""')}"`,
                        `"${(row.cargo || '').replace(/"/g, '""')}"`,
                        `"${row.area.replace(/"/g, '""')}"`,
                        `"${(row.lider || '').replace(/"/g, '""')}"`,
                        `"${row.creador.replace(/"/g, '""')}"`,
                        `"${row.plan.replace(/"/g, '""')}"`,
                        row.estado,
                        row.prioridad,
                        row.avance,
                        row.fechaFinalizacion,
                        row.fechaCreacion,
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
        filteredData = [...SEGUIMIENTO_DATA];
        initColumnVisibility();
        initNav();
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
        initCheckboxes();
        initVerSeleccionados();
        initActionButtons();
        initMobileAlert();
        initClearFiltersButton();
    }

    document.addEventListener('DOMContentLoaded', init);
})();
