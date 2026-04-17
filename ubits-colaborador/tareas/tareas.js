/* ========================================
   VISTA DE TAREAS - BASADO EN COMPONENTE REACT
   Renderiza días del calendario dinámicamente con scroll infinito.
   Datos: bd-master/bd-tareas-y-planes.js (TAREAS_PLANES_DB).
   ======================================== */

// Datos de tareas: TAREAS_PLANES_DB.getTareasVistaTareas() ({ vencidas, porDia }); sinFechaVencimiento se fusiona en cliente.
let tareasEjemplo = { vencidas: [], porDia: {}, sinFechaVencimiento: [] };

// Planes y usuarios para dropdowns (mover tarea / asignar): desde BD unificada si existe.
function getPlanesParaDropdown() {
    if (typeof TAREAS_PLANES_DB !== 'undefined' && typeof TAREAS_PLANES_DB.getPlanesVistaPlanes === 'function') {
        const plans = TAREAS_PLANES_DB.getPlanesVistaPlanes();
        return plans.map(p => ({ id: String(p.id), name: p.name || p.title || ('Plan ' + p.id) }));
    }
    return [];
}
function getUsuariosParaDropdown() {
    if (typeof TAREAS_PLANES_DB !== 'undefined' && typeof TAREAS_PLANES_DB.getEmpleadosEjemplo === 'function') {
        const emp = TAREAS_PLANES_DB.getEmpleadosEjemplo();
        return emp.map((e, i) => ({ id: String(e.id || i), email: e.username || '', full_name: e.nombre || '', avatar_url: e.avatar || null }));
    }
    return [];
}
const planesEjemplo = getPlanesParaDropdown();
const usuariosEjemplo = getUsuariosParaDropdown();

// Estado de la aplicación
let estadoTareas = {
    selectedDay: null, // Fecha seleccionada en formato YYYY-MM-DD
    currentDate: new Date(), // Fecha actual para el mes mostrado
    showMonthPicker: false,
    showOverdueSection: true,
    showNoDueSection: false,
    diasRenderizados: [],
    diasCargados: 0,
    diasPorCarga: 7,
    addingTaskForDate: null, // Fecha para la cual se está agregando una tarea
    newTaskNameForDate: '', // Nombre de la nueva tarea que se está creando
    isCreatingTask: false, // Estado de carga al crear tarea
    taskIdToDelete: null, // ID de tarea pendiente de confirmar eliminar (modal)
    editingDateId: null, // ID de tarea cuya fecha se está editando
    moveTaskId: null, // ID de tarea que se está moviendo a otro plan
    userDropdownTaskId: null, // ID de tarea para la cual se muestra el dropdown de usuarios
    userSearch: '', // Búsqueda de usuarios
    pendingTaskClickTimeout: null, // Timeout para retrasar navegación al detalle y permitir doble clic en título
    userResults: [], // Resultados de búsqueda de usuarios
    loadingUsers: false, // Estado de carga de usuarios
    planSearch: '', // Búsqueda de planes
    showPlanDropdown: false, // Mostrar dropdown de planes
    availablePlans: [], // Planes disponibles para mover tarea
    loadingPlans: false, // Estado de carga de planes
    showAssigneeDropdown: false, // Dropdown para asignar usuario
    showRoleDropdown: false, // Dropdown para elegir rol
    filtros: {
        estados: [],      // [] = todos; si no vacío: ['Activo','Finalizado'] (Activo = 'Por hacer'). Sin 'Vencido': las vencidas tienen su sección propia.
        prioridades: [],   // [] = todas; si no vacío: ['alta','media','baja']
        asignacion: 'todas', // 'todas' | 'asignadas-por-mi' | 'asignadas-a-mi'
        asignadosEspecificos: [] // cuando asignacion === 'asignadas-por-mi': nombres de asignados a filtrar (vacío = todos)
    }
};

// Utilidades de fecha (sin problemas de zona horaria)
const pad = (n) => String(n).padStart(2, '0');

const createLocalDate = (year, month, day) => {
    const y = year;
    const m = pad(month + 1);
    const d = pad(day);
    return `${y}-${m}-${d}`;
};

const parseDateString = (dateString) => {
    if (!dateString) return null;
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
};

const getTodayString = () => {
    if (typeof TAREAS_PLANES_DB !== 'undefined' && TAREAS_PLANES_DB.getTodayString)
        return TAREAS_PLANES_DB.getTodayString();
    const now = new Date();
    return createLocalDate(now.getFullYear(), now.getMonth(), now.getDate());
};

let today = getTodayString();

/**
 * Demo playground (solo vista tareas): una tarea tipo Aprendizaje solo el día calendario actual (hoy), María Alejandra.
 * Mismo id fijo que la BD (TASK_ID_PROTO_APRENDIZAJE) para enlazar task-detail.html?id=…
 */
function ensureVistaTareasDemoAprendizaje(fechaKey) {
    if (!fechaKey || typeof TAREAS_PLANES_DB === 'undefined' || typeof TAREAS_PLANES_DB.getUsuarioActual !== 'function') return;
    if (fechaKey !== getTodayString()) return;
    var u = TAREAS_PLANES_DB.getUsuarioActual();
    if (!u || u.nombre !== 'María Alejandra Sánchez Pardo') return;
    if (!tareasEjemplo.porDia) tareasEjemplo.porDia = {};
    var list = tareasEjemplo.porDia[fechaKey] || [];
    var id1 = typeof TAREAS_PLANES_DB.TASK_ID_PROTO_APRENDIZAJE === 'number'
        ? TAREAS_PLANES_DB.TASK_ID_PROTO_APRENDIZAJE : 9000000000001;
    var id2 = typeof TAREAS_PLANES_DB.TASK_ID_PROTO_APRENDIZAJE_PROGRESO === 'number'
        ? TAREAS_PLANES_DB.TASK_ID_PROTO_APRENDIZAJE_PROGRESO : 9000000000002;
    var id3 = typeof TAREAS_PLANES_DB.TASK_ID_PROTO_APRENDIZAJE_COMPLETADA === 'number'
        ? TAREAS_PLANES_DB.TASK_ID_PROTO_APRENDIZAJE_COMPLETADA : 9000000000003;
    var demoIds = [id1, id2, id3];
    var hasAllDemo = demoIds.every(function (did) {
        return list.some(function (t) { return taskIdMatches(t, did); });
    });
    if (hasAllDemo) return;
    var planMeta = { id: null, name: null };
    if (typeof TAREAS_PLANES_DB.getPlanesVistaPlanes === 'function') {
        var planesList = TAREAS_PLANES_DB.getPlanesVistaPlanes();
        var metas = planesList.find(function (p) { return (p.name || '').indexOf('Metas personales') === 0; });
        if (metas) {
            planMeta.id = metas.id;
            planMeta.name = metas.name;
        }
    }
    var base = {
        endDate: fechaKey,
        priority: 'media',
        assignee_email: u.username || 'masanchez@fiqsha.demo',
        assignee_name: u.nombre,
        assignee_avatar_url: u.avatar || null,
        created_by: u.nombre,
        taskType: 'aprendizaje',
        planId: planMeta.id,
        planNombre: planMeta.name,
        _demoVistaTareasAprendizaje: true
    };
    var filtered = list.filter(function (t) {
        if (!t || !t._demoVistaTareasAprendizaje) return true;
        return !demoIds.some(function (did) { return taskIdMatches(t, did); });
    });
    var fake1 = Object.assign({}, base, {
        id: id1,
        name: 'Curso: Trabajo en equipo y colaboración',
        done: false,
        status: 'Activo',
        learningContentId: 'f012'
    });
    var fake2 = Object.assign({}, base, {
        id: id2,
        name: 'Curso: Comunicación asertiva para líderes',
        done: false,
        status: 'Activo',
        learningContentId: 'f016',
        learningContentProgress: 75,
        learningCardStatus: 'progress'
    });
    var fake3 = Object.assign({}, base, {
        id: id3,
        name: 'Curso: Emplea los valores del liderazgo femenino',
        done: true,
        status: 'Finalizado',
        learningContentId: 'u040',
        learningContentProgress: 100,
        learningCardStatus: 'completed'
    });
    tareasEjemplo.porDia[fechaKey] = [fake1, fake2, fake3].concat(filtered);
}

// Datos solo desde BD unificada
if (typeof TAREAS_PLANES_DB !== 'undefined' && typeof TAREAS_PLANES_DB.getTareasVistaTareas === 'function') {
    tareasEjemplo = TAREAS_PLANES_DB.getTareasVistaTareas();
    today = getTodayString();
}
if (!Array.isArray(tareasEjemplo.sinFechaVencimiento)) {
    tareasEjemplo.sinFechaVencimiento = [];
}
/** Tres tareas de ejemplo sin fecha de vencimiento (playground). IDs fijos 9200000000001–3. */
function ensureSinFechaVencimientoDemoTasks() {
    var DEMO_IDS = [9200000000001, 9200000000002, 9200000000003];
    if (!tareasEjemplo.sinFechaVencimiento) tareasEjemplo.sinFechaVencimiento = [];
    var list = tareasEjemplo.sinFechaVencimiento;
    var hasAll = DEMO_IDS.every(function (id) {
        return list.some(function (t) {
            return t && Number(t.id) === id;
        });
    });
    if (hasAll) return;
    var u = (typeof TAREAS_PLANES_DB !== 'undefined' && TAREAS_PLANES_DB.getUsuarioActual)
        ? TAREAS_PLANES_DB.getUsuarioActual()
        : { nombre: 'Usuario demo', username: 'usuario@ubits.demo', avatar: null };
    var nombre = u.nombre || 'Usuario demo';
    var username = u.username || 'usuario@ubits.demo';
    var filtered = list.filter(function (t) {
        return !t || !t._demoSinFechaVencimiento;
    });
    var planMeta = { id: null, name: null };
    if (typeof TAREAS_PLANES_DB !== 'undefined' && typeof TAREAS_PLANES_DB.getPlanesVistaPlanes === 'function') {
        var planesList = TAREAS_PLANES_DB.getPlanesVistaPlanes();
        var metas = planesList.find(function (p) { return (p.name || '').indexOf('Metas personales') === 0; });
        if (metas) {
            planMeta.id = metas.id;
            planMeta.name = metas.name;
        }
    }
    var base = {
        endDate: null,
        done: false,
        status: 'Activo',
        assignee_email: username,
        assignee_name: nombre,
        assignee_avatar_url: u.avatar || null,
        created_by: nombre,
        planId: planMeta.id,
        planNombre: planMeta.name,
        _demoSinFechaVencimiento: true
    };
    tareasEjemplo.sinFechaVencimiento = filtered.concat([
        Object.assign({}, base, { id: DEMO_IDS[0], name: 'Revisar documentación del módulo', priority: 'media' }),
        Object.assign({}, base, { id: DEMO_IDS[1], name: 'Coordinar reunión con stakeholders', priority: 'alta' }),
        Object.assign({}, base, { id: DEMO_IDS[2], name: 'Actualizar backlog en la herramienta', priority: 'baja' })
    ]);
}
ensureSinFechaVencimientoDemoTasks();
/* Quitar demos curso/aprendizaje (_demoVistaTareasAprendizaje) de días que no son hoy */
(function pruneDemoAprendizajeFromNonTodayDays() {
    if (!tareasEjemplo || !tareasEjemplo.porDia) return;
    var hoy = getTodayString();
    var pd = tareasEjemplo.porDia;
    for (var key in pd) {
        if (key === hoy) continue;
        var list = pd[key];
        if (!list || !list.length) continue;
        var next = list.filter(function (t) {
            return !t || !t._demoVistaTareasAprendizaje;
        });
        if (next.length !== list.length) pd[key] = next;
    }
})();
if (!estadoTareas.selectedDay) {
    estadoTareas.selectedDay = today;
}

// Lista de asignados a los que el usuario actual les asignó al menos una tarea (para filtro "Asignado específico").
function getAssigneesAsignadosPorMi() {
    const nombreActual = (typeof TAREAS_PLANES_DB !== 'undefined' && TAREAS_PLANES_DB.getUsuarioActual) ? (TAREAS_PLANES_DB.getUsuarioActual().nombre || '') : '';
    if (!nombreActual) return [];
    const seen = {};
    const list = [];
    function add(t) {
        if (t.created_by !== nombreActual || !t.assignee_name || t.assignee_name === nombreActual) return;
        const name = String(t.assignee_name).trim();
        if (!name || seen[name]) return;
        seen[name] = true;
        list.push(name);
    }
    (tareasEjemplo.vencidas || []).forEach(add);
    (tareasEjemplo.sinFechaVencimiento || []).forEach(add);
    const porDia = tareasEjemplo.porDia || {};
    for (const key in porDia) { (porDia[key] || []).forEach(add); }
    list.sort(function (a, b) { return a.localeCompare(b, 'es'); });
    return list;
}

// Devuelve { vencidas, porDia, sinFecha } aplicando filtros (Estado, Prioridad, Asignación). Fuente: tareasEjemplo.
function getTareasFiltradas() {
    const f = estadoTareas.filtros || {};
    const estados = f.estados || [];
    const prioridades = f.prioridades || [];
    const asignacion = f.asignacion || 'todas';
    const asignadosEspecificos = f.asignadosEspecificos || [];
    const nombreActual = (typeof TAREAS_PLANES_DB !== 'undefined' && TAREAS_PLANES_DB.getUsuarioActual) ? (TAREAS_PLANES_DB.getUsuarioActual().nombre || '') : '';

    function pasaFiltro(t) {
        if (estados.length > 0 && estados.indexOf(t.status) === -1) return false;
        const prio = (t.priority || 'media').toLowerCase();
        if (prioridades.length > 0 && prioridades.indexOf(prio) === -1) return false;
        if (asignacion === 'asignadas-por-mi') {
            if (nombreActual && (t.created_by !== nombreActual || t.assignee_name === nombreActual)) return false;
            if (asignadosEspecificos.length > 0 && (!t.assignee_name || asignadosEspecificos.indexOf(t.assignee_name) === -1)) return false;
        } else if (asignacion === 'asignadas-a-mi') {
            if (nombreActual && t.assignee_name !== nombreActual) return false;
        }
        return true;
    }

    const vencidas = (tareasEjemplo.vencidas || []).filter(pasaFiltro);
    const sinFecha = (tareasEjemplo.sinFechaVencimiento || []).filter(pasaFiltro);
    const porDia = {};
    const dias = tareasEjemplo.porDia || {};
    for (const fechaKey in dias) {
        const list = (dias[fechaKey] || []).filter(pasaFiltro);
        if (list.length > 0) porDia[fechaKey] = list;
    }
    return { vencidas, porDia, sinFecha };
}

/** Criterios de filtro activos en la vista (para badge del botón Filtros). */
function getTareasFiltrosAplicadosCount() {
    var f = estadoTareas.filtros || {};
    var n = 0;
    if ((f.estados || []).length > 0) n++;
    if ((f.prioridades || []).length > 0) n++;
    if (f.asignacion && f.asignacion !== 'todas') n++;
    if (f.asignacion === 'asignadas-por-mi' && (f.asignadosEspecificos || []).length > 0) n++;
    return n;
}

/**
 * Attention badge sm (error) en el botón Filtros solo cuando hay filtros aplicados.
 * Sin nodo en el DOM si el conteo es 0.
 * Estado visual “activo”: clase oficial ubits-button--active (secondary), como contenidos.html.
 */
function updateTareasFiltrosButtonBadge() {
    var btn = document.getElementById('tareas-filtros-btn');
    if (!btn) return;
    var c = getTareasFiltrosAplicadosCount();
    var badge = document.getElementById('tareas-filtros-btn-badge');
    if (c <= 0) {
        if (badge && badge.parentNode) badge.parentNode.removeChild(badge);
        btn.setAttribute('aria-label', 'Abrir filtros');
    } else {
        if (!badge) {
            badge = document.createElement('span');
            badge.id = 'tareas-filtros-btn-badge';
            badge.className = 'ubits-attention-badge ubits-attention-badge--sm ubits-attention-badge--error';
            btn.appendChild(badge);
        }
        badge.textContent = String(c);
        badge.classList.toggle('ubits-attention-badge--circle', c >= 1 && c <= 9);
        btn.setAttribute('aria-label', 'Abrir filtros (' + c + ' ' + (c === 1 ? 'filtro aplicado' : 'filtros aplicados') + ')');
    }
    btn.classList.toggle('ubits-button--active', c > 0);
}

// Filtros de tareas: dropdown con contenido personalizado (customBodyHtml), como encabezados de seguimiento.
var TAREAS_FILTROS_OVERLAY_ID = 'tareas-filtros-dropdown';
var TAREAS_FILTROS_ASIGNADOS_ESPECIFICOS_OVERLAY_ID = 'tareas-filtros-asignados-especificos-dropdown';

var TAREAS_FILTROS_ESTADO_OPTIONS = [
    { value: '', text: 'Todos' },
    { value: 'Activo', text: 'Por hacer' },
    { value: 'Finalizado', text: 'Finalizado' }
];
var TAREAS_FILTROS_PRIORIDAD_OPTIONS = [
    { value: '', text: 'Todos' },
    { value: 'alta', text: 'Alta' },
    { value: 'media', text: 'Media' },
    { value: 'baja', text: 'Baja' }
];
var TAREAS_FILTROS_ASIGNACION_OPTIONS = [
    { value: 'todas', text: 'Todas' },
    { value: 'asignadas-por-mi', text: 'Solo lo que asigné a otros' },
    { value: 'asignadas-a-mi', text: 'Solo lo asignado a mí' }
];

// Opciones para el input oficial "Asignado específico" (solo para mostrar texto; el dropdown real es el panel de checkboxes).
function buildAsignadoEspecificoSelectOptions() {
    var opts = [{ value: '', text: 'Seleccionar asignados' }, { value: '1', text: '1 asignado(s)' }];
    for (var i = 2; i <= 50; i++) opts.push({ value: String(i), text: i + ' asignados' });
    return opts;
}

function getFiltrosDropdownBodyHtml() {
    return '<div class="tareas-filtros-dropdown-body">' +
        '<div id="tareas-filtros-estado-container"></div>' +
        '<div id="tareas-filtros-prioridad-container"></div>' +
        '<div id="tareas-filtros-asignacion-container"></div>' +
        '<div class="tareas-filtros-asignado-especifico-wrap" id="tareas-filtros-asignado-especifico-wrap" style="display:none;">' +
        '<div id="tareas-filtros-asignado-especifico-container"></div>' +
        '</div>' +
        '</div>';
}

function openFiltrosDropdown() {
    var btn = document.getElementById('tareas-filtros-btn');
    if (!btn || typeof window.getDropdownMenuHtml !== 'function' || typeof window.openDropdownMenu !== 'function' || typeof window.closeDropdownMenu !== 'function') return;
    if (typeof createInput !== 'function') return;

    var existing = document.getElementById(TAREAS_FILTROS_OVERLAY_ID);
    if (existing) existing.remove();

    var f = estadoTareas.filtros || {};
    var estadoVal = (f.estados && f.estados.length > 0) ? f.estados[0] : '';
    var prioridadVal = (f.prioridades && f.prioridades.length > 0) ? f.prioridades[0] : '';
    var asignacionVal = f.asignacion || 'todas';

    var bodyHtml = getFiltrosDropdownBodyHtml();
    var html = window.getDropdownMenuHtml({
        overlayId: TAREAS_FILTROS_OVERLAY_ID,
        customBodyHtml: bodyHtml,
        footerSecondaryLabel: 'Limpiar',
        footerPrimaryLabel: 'Aplicar',
        footerSecondaryId: 'tareas-filtros-limpiar',
        footerPrimaryId: 'tareas-filtros-aplicar'
    });
    document.body.insertAdjacentHTML('beforeend', html);
    var overlayEl = document.getElementById(TAREAS_FILTROS_OVERLAY_ID);
    if (!overlayEl) return;

    btn.setAttribute('aria-expanded', 'true');
    var contentEl = overlayEl.querySelector('.ubits-dropdown-menu__content');
    if (contentEl) contentEl.classList.add('tareas-filtros-dropdown-content');

    var estadoInput = createInput({
        containerId: 'tareas-filtros-estado-container',
        type: 'select',
        label: 'Estado',
        placeholder: 'Todos',
        selectOptions: TAREAS_FILTROS_ESTADO_OPTIONS,
        value: estadoVal,
        size: 'sm'
    });
    var prioridadInput = createInput({
        containerId: 'tareas-filtros-prioridad-container',
        type: 'select',
        label: 'Prioridad',
        placeholder: 'Todos',
        selectOptions: TAREAS_FILTROS_PRIORIDAD_OPTIONS,
        value: prioridadVal,
        size: 'sm'
    });
    var asignacionInput = createInput({
        containerId: 'tareas-filtros-asignacion-container',
        type: 'select',
        label: 'Asignación',
        placeholder: 'Todas',
        selectOptions: TAREAS_FILTROS_ASIGNACION_OPTIONS,
        value: asignacionVal,
        size: 'sm'
    });

    var wrapAsignado = document.getElementById('tareas-filtros-asignado-especifico-wrap');
    var containerAsignado = document.getElementById('tareas-filtros-asignado-especifico-container');
    var asignadoInput = null;

    function getAsignacionValue() {
        var texto = asignacionInput && asignacionInput.getValue ? asignacionInput.getValue() : '';
        var opt = TAREAS_FILTROS_ASIGNACION_OPTIONS.find(function (o) { return o.text === texto; });
        return opt ? opt.value : 'todas';
    }

    function buildAsignadosEspecificosDropdownOptions() {
        var assignees = getAssigneesAsignadosPorMi();
        var selected = (estadoTareas.filtros.asignadosEspecificos || []).slice();
        return assignees.map(function (name) {
            return { text: name, value: name, checkbox: true, selected: selected.indexOf(name) !== -1 };
        });
    }

    function setAsignadoDisplayValue(n) {
        if (!asignadoInput || !asignadoInput.setValue) return;
        asignadoInput.setValue(n === 0 ? 'Seleccionar asignados' : (n === 1 ? '1 asignado(s)' : n + ' asignados'));
    }

    function openAsignadosEspecificosDropdown(anchorEl) {
        var existing = document.getElementById(TAREAS_FILTROS_ASIGNADOS_ESPECIFICOS_OVERLAY_ID);
        if (existing) existing.remove();
        var options = buildAsignadosEspecificosDropdownOptions();
        var html = window.getDropdownMenuHtml({
            overlayId: TAREAS_FILTROS_ASIGNADOS_ESPECIFICOS_OVERLAY_ID,
            options: options.length ? options : [{ text: 'No hay asignados', value: '' }]
        });
        document.body.insertAdjacentHTML('beforeend', html);
        var overlay = document.getElementById(TAREAS_FILTROS_ASIGNADOS_ESPECIFICOS_OVERLAY_ID);
        var content = overlay && overlay.querySelector('.ubits-dropdown-menu__content');
        if (overlay) {
            overlay.addEventListener('click', function (ev) {
                if (!ev.target.closest('.ubits-dropdown-menu__content')) {
                    var contentEl = overlay.querySelector('.ubits-dropdown-menu__content');
                    if (contentEl) {
                        var inputs = contentEl.querySelectorAll('input.ubits-checkbox__input:checked');
                        estadoTareas.filtros.asignadosEspecificos = Array.prototype.map.call(inputs, function (inp) { return inp.getAttribute('data-value') || inp.value || ''; }).filter(Boolean);
                    }
                    window.closeDropdownMenu(TAREAS_FILTROS_ASIGNADOS_ESPECIFICOS_OVERLAY_ID);
                    if (anchorEl) anchorEl.setAttribute('aria-expanded', 'false');
                    updateTareasFiltrosButtonBadge();
                    renderAllTasks();
                }
            });
        }
        if (content) {
            content.addEventListener('change', function () {
                var checked = content.querySelectorAll('input.ubits-checkbox__input:checked');
                setAsignadoDisplayValue(checked.length);
            });
        }
        window.openDropdownMenu(TAREAS_FILTROS_ASIGNADOS_ESPECIFICOS_OVERLAY_ID, anchorEl, { minWidthFromAnchor: true });
        var contentEl = document.getElementById(TAREAS_FILTROS_ASIGNADOS_ESPECIFICOS_OVERLAY_ID) && document.getElementById(TAREAS_FILTROS_ASIGNADOS_ESPECIFICOS_OVERLAY_ID).querySelector('.ubits-dropdown-menu__content');
        if (contentEl && anchorEl) {
            var rect = anchorEl.getBoundingClientRect();
            var gap = 4;
            contentEl.style.top = (rect.top - contentEl.offsetHeight - gap) + 'px';
            contentEl.style.bottom = 'auto';
            contentEl.style.left = (rect.right - contentEl.offsetWidth) + 'px';
        }
        if (anchorEl) anchorEl.setAttribute('aria-expanded', 'true');
    }

    function updateAsignadoEspecificoVisibility() {
        var esAsignadasPorMi = getAsignacionValue() === 'asignadas-por-mi';
        if (wrapAsignado) wrapAsignado.style.display = esAsignadasPorMi ? '' : 'none';
        if (!esAsignadasPorMi) return;
        var n = (estadoTareas.filtros.asignadosEspecificos || []).length;
        if (!containerAsignado) return;
        var asignadosDropdownAbierto = (function () {
            var el = document.getElementById(TAREAS_FILTROS_ASIGNADOS_ESPECIFICOS_OVERLAY_ID);
            return el && el.style.display !== 'none';
        })();
        if (!containerAsignado.querySelector('.ubits-input')) {
            asignadoInput = createInput({
                containerId: 'tareas-filtros-asignado-especifico-container',
                type: 'select',
                label: 'Asignado específico',
                placeholder: 'Seleccionar asignados',
                selectOptions: buildAsignadoEspecificoSelectOptions(),
                value: '',
                size: 'sm'
            });
            setAsignadoDisplayValue(n);
            var defaultDropdown = document.getElementById('ubits-input-select-tareas-filtros-asignado-especifico-container');
            if (defaultDropdown) defaultDropdown.remove();
            var inputEl = containerAsignado.querySelector('.ubits-input');
            if (inputEl) {
                inputEl.setAttribute('aria-haspopup', 'listbox');
                inputEl.setAttribute('aria-expanded', 'false');
                inputEl.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    openAsignadosEspecificosDropdown(inputEl);
                }, true);
            }
        } else if (asignadoInput && !asignadosDropdownAbierto) {
            setAsignadoDisplayValue(n);
        }
    }

    updateAsignadoEspecificoVisibility();
    var asignacionPoll = setInterval(function () {
        if (!overlayEl.parentNode) {
            clearInterval(asignacionPoll);
            return;
        }
        updateAsignadoEspecificoVisibility();
    }, 400);

    function closeFiltrosOverlay() {
        window.closeDropdownMenu(TAREAS_FILTROS_ASIGNADOS_ESPECIFICOS_OVERLAY_ID);
        var assigneesEl = document.getElementById(TAREAS_FILTROS_ASIGNADOS_ESPECIFICOS_OVERLAY_ID);
        if (assigneesEl && assigneesEl.parentNode) assigneesEl.remove();
        window.closeDropdownMenu(TAREAS_FILTROS_OVERLAY_ID);
        if (overlayEl.parentNode) overlayEl.remove();
        if (btn) btn.setAttribute('aria-expanded', 'false');
    }

    overlayEl.addEventListener('click', function (ev) {
        if (ev.target === overlayEl) {
            clearInterval(asignacionPoll);
            closeFiltrosOverlay();
        }
    });

    var limpiarBtn = document.getElementById('tareas-filtros-limpiar');
    var aplicarBtn = document.getElementById('tareas-filtros-aplicar');
    if (limpiarBtn) {
        limpiarBtn.addEventListener('click', function () {
            clearInterval(asignacionPoll);
            estadoTareas.filtros = { estados: [], prioridades: [], asignacion: 'todas', asignadosEspecificos: [] };
            closeFiltrosOverlay();
            renderAllTasks();
        });
    }
    if (aplicarBtn) {
        aplicarBtn.addEventListener('click', function () {
            clearInterval(asignacionPoll);
            var textoEstado = estadoInput && estadoInput.getValue ? estadoInput.getValue() : '';
            var textoPrioridad = prioridadInput && prioridadInput.getValue ? prioridadInput.getValue() : '';
            var textoAsignacion = asignacionInput && asignacionInput.getValue ? asignacionInput.getValue() : '';
            var optEstado = TAREAS_FILTROS_ESTADO_OPTIONS.find(function (o) { return o.text === textoEstado; });
            var optPrioridad = TAREAS_FILTROS_PRIORIDAD_OPTIONS.find(function (o) { return o.text === textoPrioridad; });
            var optAsignacion = TAREAS_FILTROS_ASIGNACION_OPTIONS.find(function (o) { return o.text === textoAsignacion; });
            estadoTareas.filtros.estados = optEstado && optEstado.value ? [optEstado.value] : [];
            estadoTareas.filtros.prioridades = optPrioridad && optPrioridad.value ? [optPrioridad.value] : [];
            estadoTareas.filtros.asignacion = optAsignacion ? optAsignacion.value : 'todas';
            if (estadoTareas.filtros.asignacion === 'asignadas-por-mi') {
                var asignadosOverlay = document.getElementById(TAREAS_FILTROS_ASIGNADOS_ESPECIFICOS_OVERLAY_ID);
                var asignadosContent = asignadosOverlay && asignadosOverlay.querySelector('.ubits-dropdown-menu__content');
                if (asignadosContent) {
                    var inputs = asignadosContent.querySelectorAll('input.ubits-checkbox__input:checked');
                    estadoTareas.filtros.asignadosEspecificos = Array.prototype.map.call(inputs, function (inp) { return inp.getAttribute('data-value') || inp.value || ''; }).filter(Boolean);
                }
            } else {
                estadoTareas.filtros.asignadosEspecificos = [];
            }
            closeFiltrosOverlay();
            renderAllTasks();
        });
    }

    window.openDropdownMenu(TAREAS_FILTROS_OVERLAY_ID, btn);
}

// Formatear fecha para mostrar
const formatDate = (date) => {
    if (!date) return null;
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    return createLocalDate(year, month, day);
};

const formatDateForDisplay = (dateString) => {
    if (!dateString) return 'Sin fecha';
    const [year, month, day] = dateString.split('-').map(Number);
    return `${pad(day)}/${pad(month)}/${year}`;
};

const formatDateForDisplayDDMM = (dateString) => {
    if (!dateString) return 'Sin fecha';
    const [year, month, day] = dateString.split('-').map(Number);
    return `${pad(day)}-${pad(month)}-${year}`;
};

// Convertir yyyy-mm-dd a dd/mm/yyyy (para calendario oficial)
function ymdToDmySlash(ymd) {
    if (!ymd || !String(ymd).trim()) return '';
    const parts = String(ymd).trim().split('-');
    if (parts.length !== 3) return '';
    const [y, m, d] = parts;
    return (d.length === 1 ? '0' + d : d) + '/' + (m.length === 1 ? '0' + m : m) + '/' + y;
}
// Convertir dd/mm/yyyy (del calendario) a yyyy-mm-dd
function dmySlashToYmd(dmy) {
    if (!dmy || !String(dmy).trim()) return '';
    const parts = String(dmy).trim().split('/');
    if (parts.length !== 3) return '';
    const [d, m, y] = parts;
    return y + '-' + (m.length === 1 ? '0' + m : m) + '-' + (d.length === 1 ? '0' + d : d);
}

// Utilidades de fecha para UI
const getMonthName = (date) => {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return months[date.getMonth()];
};

const formatFullDate = (dateString) => {
    const date = parseDateString(dateString);
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    return `${months[date.getMonth()]} ${date.getDate()} · ${days[date.getDay()]}`;
};

const getRelativeDayName = (dateString) => {
    if (dateString === today) return 'Hoy';
    const [year, month, day] = today.split('-').map(Number);
    const tomorrowDate = new Date(year, month - 1, day + 1);
    const tomorrowString = createLocalDate(tomorrowDate.getFullYear(), tomorrowDate.getMonth(), tomorrowDate.getDate());
    if (dateString === tomorrowString) return 'Mañana';
    return null;
};

// Detectar viewport ≤769px: mostrar 4 días que ocupan todo el ancho (desktop ≥770: 7 días)
function isCalendarMobile() {
    return typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 769px)').matches;
}

// Obtener días del calendario horizontal (desktop: 7 = 3 antes, seleccionado, 3 después | móvil: 4 = 1 antes, seleccionado, 2 después)
const getDaysInMonth = () => {
    const days = [];
    const selectedDate = parseDateString(estadoTareas.selectedDay);
    const selectedYear = selectedDate.getFullYear();
    const selectedMonth = selectedDate.getMonth();
    const selectedDayNum = selectedDate.getDate();

    const mobile = isCalendarMobile();
    const daysBefore = mobile ? 2 : 3;
    const maxDays = mobile ? 5 : 7;

    // Día de inicio: N días antes del seleccionado (ahora permite días anteriores a hoy)
    let startDay = selectedDayNum - daysBefore;
    let startMonth = selectedMonth;
    let startYear = selectedYear;

    if (startDay < 1) {
        startMonth--;
        if (startMonth < 0) {
            startMonth = 11;
            startYear--;
        }
        const daysInPrevMonth = new Date(startYear, startMonth + 1, 0).getDate();
        startDay = daysInPrevMonth + startDay;
    }

    let currentDay = startDay;
    let currentMonth = startMonth;
    let currentYear = startYear;
    let daysAdded = 0;

    while (daysAdded < maxDays) {
        const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

        if (currentDay > daysInCurrentMonth) {
            currentDay = 1;
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
        }

        const currentDate = new Date(currentYear, currentMonth, currentDay);
        const dateString = createLocalDate(currentYear, currentMonth, currentDay);
        const dayNames = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];

        days.push({
            date: currentDate,
            dateString,
            dayName: dayNames[currentDate.getDay()],
            dayNumber: currentDay
        });

        currentDay++;
        daysAdded++;
    }

    return days;
};

// Renderizar calendario horizontal con 7 días
function renderCalendarHorizontal() {
    const container = document.querySelector('[data-role="horizontal-days"]');
    if (!container) {
        console.error('No se encontró el contenedor del calendario horizontal');
        return;
    }

    container.innerHTML = '';

    const daysInMonth = getDaysInMonth();

    console.log(`Renderizando ${daysInMonth.length} días del calendario`);

    daysInMonth.forEach(day => {
        const isSelected = day.dateString === estadoTareas.selectedDay;
        const isToday = day.dateString === today;

        const dayButton = document.createElement('button');
        dayButton.className = `calendar-horizontal__day ${isSelected ? 'calendar-horizontal__day--selected' : ''} ${isToday ? 'calendar-horizontal__day--today' : ''}`;
        dayButton.type = 'button';
        dayButton.dataset.date = day.dateString;
        if (isSelected) {
            dayButton.setAttribute('aria-current', 'date');
        }

        dayButton.innerHTML = `
            <span class="calendar-horizontal__weekday">${day.dayName}</span>
            <span class="calendar-horizontal__day-number">${day.dayNumber}</span>
        `;

        dayButton.addEventListener('click', () => {
            estadoTareas.selectedDay = day.dateString;
            renderCalendarHorizontal();
            ensureDayLoaded(day.dateString);
            // Espera para que el DOM/layout esté estable tras cargar días, luego ir al día
            setTimeout(() => scrollToDay(parseDateString(day.dateString)), 120);
        });

        container.appendChild(dayButton);
    });
}

// Resolver nombre y avatar del asignado desde la BD (tarea solo trae assignee_email; nombre/avatar se buscan en usuario actual, jefes y empleados).
function getAssigneeDisplay(tarea) {
    const email = (tarea.assignee_email && String(tarea.assignee_email).trim()) ? String(tarea.assignee_email).trim() : '';
    if (tarea.assignee_name && String(tarea.assignee_name).trim() && tarea.assignee_avatar_url && String(tarea.assignee_avatar_url).trim()) {
        return { name: String(tarea.assignee_name).trim(), avatar: String(tarea.assignee_avatar_url).trim() };
    }
    const currentUser = (typeof TAREAS_PLANES_DB !== 'undefined' && typeof TAREAS_PLANES_DB.getUsuarioActual === 'function') ? TAREAS_PLANES_DB.getUsuarioActual() : null;
    if (currentUser && email && (currentUser.username === email || (currentUser.email && currentUser.email === email))) {
        return { name: currentUser.nombre || email.split('@')[0], avatar: currentUser.avatar || null };
    }
    if (!email) return { name: 'Sin asignar', avatar: null };
    const jefes = (typeof TAREAS_PLANES_DB !== 'undefined' && typeof TAREAS_PLANES_DB.getJefesEjemplo === 'function') ? TAREAS_PLANES_DB.getJefesEjemplo() : [];
    const empleados = (typeof TAREAS_PLANES_DB !== 'undefined' && typeof TAREAS_PLANES_DB.getEmpleadosEjemplo === 'function') ? TAREAS_PLANES_DB.getEmpleadosEjemplo() : [];
    const person = (jefes || []).find(function (e) { return (e.username || '') === email; }) || (empleados || []).find(function (e) { return (e.username || '') === email; });
    if (person) return { name: person.nombre || email.split('@')[0], avatar: person.avatar || null };
    return { name: email.split('@')[0], avatar: null };
}

// Opciones para el componente tirilla (task-strip) - mismo componente en tareas y plan-detail
function getTaskStripOpts(esVencidaSection) {
    return {
        today: today,
        formatDate: formatDateForDisplayDDMM,
        escapeHtml: escapeTaskHtml,
        getAssignee: getAssigneeDisplay,
        renderAvatar: typeof renderAvatar === 'function' ? renderAvatar : undefined,
        esVencidaSection: !!esVencidaSection
    };
}

// Renderizar sección de tareas vencidas: pendientes ordenadas por fecha (antigua → reciente) y finalizadas al final.
// Acordeón: >5 vencidas → colapsado; ≤5 → desplegado. Badge rojo con número siempre visible.
function renderTareasVencidas() {
    const container = document.getElementById('overdue-content');
    const section = document.getElementById('overdue-section');
    const header = document.getElementById('overdue-header');
    if (!container) {
        renderTareasSinFecha();
        return;
    }

    const datos = getTareasFiltradas();
    const todasVencidas = (datos.vencidas || []).filter(t => t.status === 'Vencido' || t.done === true || t.status === 'Finalizado');
    const pendientes = todasVencidas.filter(t => !t.done && t.status !== 'Finalizado').sort((a, b) => (a.endDate || '').localeCompare(b.endDate || ''));
    const finalizadas = todasVencidas.filter(t => t.done === true || t.status === 'Finalizado');
    const listaOrdenada = pendientes.concat(finalizadas);
    const totalCount = listaOrdenada.length;

    if (section) section.style.display = totalCount === 0 ? 'none' : '';
    if (totalCount === 0) {
        container.innerHTML = '';
        var overdueBadgeEl = document.getElementById('overdue-count-badge');
        if (overdueBadgeEl) overdueBadgeEl.remove();
        renderTareasSinFecha();
        return;
    }

    // >5: acordeón colapsado; ≤5: desplegado
    estadoTareas.showOverdueSection = totalCount <= 5;
    const content = document.getElementById('overdue-content');
    const toggleBtn = document.getElementById('overdue-toggle');
    const icon = toggleBtn ? toggleBtn.querySelector('i') : null;
    if (content) content.style.display = estadoTareas.showOverdueSection ? 'block' : 'none';
    if (icon) icon.style.transform = estadoTareas.showOverdueSection ? 'rotate(180deg)' : 'rotate(0deg)';

    // Attention badge (componente oficial): error / sm; círculo si 1–9 dígitos
    if (header) {
        let badge = document.getElementById('overdue-count-badge');
        if (!badge) {
            badge = document.createElement('span');
            badge.id = 'overdue-count-badge';
            badge.className = 'ubits-attention-badge ubits-attention-badge--sm ubits-attention-badge--error';
            badge.setAttribute('aria-label', 'Cantidad de tareas vencidas');
            header.appendChild(badge);
        }
        badge.textContent = String(totalCount);
        badge.classList.toggle('ubits-attention-badge--circle', totalCount >= 1 && totalCount <= 9);
    }

    container.innerHTML = listaOrdenada.map(tarea => window.renderTaskStrip(tarea, getTaskStripOpts(true))).join('');
    if (typeof initTooltip === 'function') initTooltip('[data-tooltip]');
    renderTareasSinFecha();
}

// Sin fecha de vencimiento: colapsado por defecto (estadoTareas.showNoDueSection); badge con total.
function renderTareasSinFecha() {
    const container = document.getElementById('no-due-content');
    const section = document.getElementById('no-due-section');
    const header = document.getElementById('no-due-header');
    const toggleBtn = document.getElementById('no-due-toggle');
    if (!container) return;

    const datos = getTareasFiltradas();
    const raw = datos.sinFecha || [];
    const listaOrdenada = raw.slice().sort(function (a, b) {
        if (a.done !== b.done) return (a.done ? 1 : 0) - (b.done ? 1 : 0);
        if (a.done && b.done) return (a._justFinalized ? 0 : 1) - (b._justFinalized ? 0 : 1);
        return 0;
    });
    const totalCount = listaOrdenada.length;

    if (section) section.style.display = totalCount === 0 ? 'none' : '';
    if (totalCount === 0) {
        container.innerHTML = '';
        if (header) {
            var oldNoDueBadge = document.getElementById('no-due-count-badge');
            if (oldNoDueBadge) oldNoDueBadge.remove();
        }
        return;
    }

    const expanded = !!estadoTareas.showNoDueSection;
    if (expanded) container.removeAttribute('hidden');
    else container.setAttribute('hidden', '');

    const icon = toggleBtn ? toggleBtn.querySelector('i') : null;
    if (icon) icon.style.transform = expanded ? 'rotate(180deg)' : 'rotate(0deg)';

    if (header) {
        var badge = document.getElementById('no-due-count-badge');
        if (!badge) {
            badge = document.createElement('span');
            badge.id = 'no-due-count-badge';
            badge.className = 'ubits-attention-badge ubits-attention-badge--sm ubits-attention-badge--info';
            badge.setAttribute('aria-label', 'Cantidad de tareas sin fecha de vencimiento');
            header.appendChild(badge);
        }
        badge.textContent = String(totalCount);
        badge.classList.toggle('ubits-attention-badge--circle', totalCount >= 1 && totalCount <= 9);
    }

    container.innerHTML = listaOrdenada.map(function (tarea) {
        return window.renderTaskStrip(tarea, getTaskStripOpts(false));
    }).join('');
    if (typeof initTooltip === 'function') initTooltip('[data-tooltip]');
}

// Renderizar sección de día (no finalizadas primero; finalizadas al final, la recién marcada como primera del bloque)
function renderDaySection(fecha) {
    const fechaKey = formatDate(fecha);
    ensureVistaTareasDemoAprendizaje(fechaKey);
    const fechaFormateada = formatFullDate(fechaKey);
    const relativeName = getRelativeDayName(fechaKey);
    const esPasado = fechaKey < today;
    const datos = getTareasFiltradas();
    const tareasDelDia = (datos.porDia[fechaKey] || [])
        .slice()
        .sort((a, b) => {
            if (a.done !== b.done) return (a.done ? 1 : 0) - (b.done ? 1 : 0);
            if (a.done && b.done) return (a._justFinalized ? 0 : 1) - (b._justFinalized ? 0 : 1);
            return 0;
        });

    const fullDateParts = fechaFormateada.split(' · ');
    const monthDay = fullDateParts[0];
    const dayName = fullDateParts[1];

    let headerText = '';
    if (relativeName) {
        headerText = `${monthDay} · ${relativeName} · ${dayName}`;
    } else {
        headerText = fechaFormateada;
    }

    return `
        <div class="tareas-day-container" data-date="${fechaKey}">
            <div class="tareas-day-header">
                <h2 class="ubits-body-md-bold">${headerText}</h2>
            </div>
            <div class="tareas-day-content">
                ${!esPasado ? (estadoTareas.addingTaskForDate === fechaKey ? `
                    <form class="tarea-add-form" data-date="${fechaKey}" onsubmit="event.preventDefault(); var inp = this.querySelector('.tarea-add-input'); if (inp && inp.value.trim()) handleCreateTaskInline(this.dataset.date, inp.value.trim()); return false;">
                        <div class="tarea-add-input-wrapper">
                            <div class="tarea-add-icon">
                                <i class="far fa-plus"></i>
                            </div>
                            <input 
                                type="text" 
                                class="ubits-input ubits-input--sm tarea-add-input" 
                                placeholder="Agregar una tarea"
                                value="${estadoTareas.newTaskNameForDate}"
                                autofocus
                            />
                            <button type="button" class="ubits-button ubits-button--primary ubits-button--sm tarea-add-form-btn" data-date="${fechaKey}">
                                <span>Añadir</span>
                            </button>
                        </div>
                    </form>
                ` : `
                    <button type="button" class="ubits-button ubits-button--secondary ubits-button--sm tarea-add-btn" data-date="${fechaKey}">
                        <i class="far fa-plus"></i>
                        <span>Añadir tarea</span>
                    </button>
                `) : ''}
                ${tareasDelDia.length > 0 ? tareasDelDia.map(tarea => window.renderTaskStrip(tarea, getTaskStripOpts(false))).join('') : ''}
            </div>
        </div>
    `;
}

// Cargar más días (scroll infinito hacia adelante, desde hoy)
function loadMoreDays() {
    const container = document.getElementById('days-container');
    if (!container) return;

    const inicio = estadoTareas.diasCargados;
    const fin = inicio + estadoTareas.diasPorCarga;

    // Empezar desde hoy hacia adelante
    const hoy = parseDateString(today);

    for (let i = inicio; i < fin; i++) {
        const fecha = new Date(hoy);
        fecha.setDate(hoy.getDate() + i);
        const fechaKey = formatDate(fecha);

        if (!estadoTareas.diasRenderizados.includes(fechaKey)) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = renderDaySection(fecha);
            const dayElement = tempDiv.firstElementChild;
            container.appendChild(dayElement);
            estadoTareas.diasRenderizados.push(fechaKey);
        }
    }

    estadoTareas.diasCargados = fin;
    if (typeof initTooltip === 'function') initTooltip('[data-tooltip]');
}

// Renderizar un día pasado (se inserta al inicio del contenedor, antes de hoy)
function loadPastDay(fechaKey) {
    const container = document.getElementById('days-container');
    if (!container) return;
    if (estadoTareas.diasRenderizados.includes(fechaKey)) return;

    const fecha = parseDateString(fechaKey);
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = renderDaySection(fecha);
    const dayElement = tempDiv.firstElementChild;

    // Insertar antes del primer hijo (los días pasados van arriba del todo)
    // Buscar si ya hay días pasados insertados: insertar en orden cronológico
    const existingDays = container.querySelectorAll('.tareas-day-container');
    let insertBefore = null;
    for (let i = 0; i < existingDays.length; i++) {
        const existingDate = existingDays[i].dataset.date;
        if (existingDate && existingDate > fechaKey) {
            insertBefore = existingDays[i];
            break;
        }
    }
    if (insertBefore) {
        container.insertBefore(dayElement, insertBefore);
    } else {
        container.appendChild(dayElement);
    }
    estadoTareas.diasRenderizados.push(fechaKey);
    if (typeof initTooltip === 'function') initTooltip('[data-tooltip]');
}

// Asegurar que el día esté cargado en la lista (soporta días pasados y futuros)
function ensureDayLoaded(fechaKey) {
    if (!fechaKey) return;
    if (fechaKey < today) {
        // Día pasado: insertar al inicio del contenedor en orden cronológico
        loadPastDay(fechaKey);
        return;
    }
    const maxLoads = 50; // límite para no iterar infinito
    let loads = 0;
    while (!estadoTareas.diasRenderizados.includes(fechaKey) && loads < maxLoads) {
        loadMoreDays();
        loads++;
    }
}

// Llevar la vista al día seleccionado (lista de tareas)
function scrollToDay(fecha) {
    const fechaKey = formatDate(fecha);
    const daySection = document.querySelector(`.tareas-day-container[data-date="${fechaKey}"]`);

    if (!daySection) return;

    const scrollContainer = document.getElementById('tareas-scroll-container');
    if (scrollContainer && scrollContainer.scrollHeight > scrollContainer.clientHeight + 2) {
        const containerRect = scrollContainer.getBoundingClientRect();
        const sectionRect = daySection.getBoundingClientRect();
        const targetScrollTop = scrollContainer.scrollTop + (sectionRect.top - containerRect.top);
        scrollContainer.scrollTo({ top: Math.max(0, targetScrollTop), behavior: 'smooth' });
        return;
    }
    daySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Scroll-spy: al hacer scroll, actualizar el día seleccionado en el calendario horizontal según la sección visible.
var scrollSpyThrottle = null;
function updateSelectedDayFromScroll() {
    var scrollContainer = document.getElementById('tareas-scroll-container');
    if (!scrollContainer) return;
    var sections = scrollContainer.querySelectorAll('.tareas-day-container');
    if (!sections.length) return;
    var containerRect = scrollContainer.getBoundingClientRect();
    var threshold = 80;
    var activeSection = null;
    for (var i = 0; i < sections.length; i++) {
        var rect = sections[i].getBoundingClientRect();
        if (rect.top <= containerRect.top + threshold) activeSection = sections[i];
    }
    if (!activeSection) activeSection = sections[0];
    var dateKey = activeSection.dataset.date;
    if (dateKey && dateKey !== estadoTareas.selectedDay) {
        estadoTareas.selectedDay = dateKey;
        var parsed = parseDateString(dateKey);
        if (estadoTareas.currentDate && (parsed.getMonth() !== estadoTareas.currentDate.getMonth() || parsed.getFullYear() !== estadoTareas.currentDate.getFullYear())) {
            estadoTareas.currentDate = new Date(parsed.getFullYear(), parsed.getMonth(), 1);
            updateMonthYearDisplay();
        }
        renderCalendarHorizontal();
    }
}

function setupScrollSpy() {
    var scrollContainer = document.getElementById('tareas-scroll-container');
    if (!scrollContainer) return;
    scrollContainer.addEventListener('scroll', function () {
        if (scrollSpyThrottle) return;
        scrollSpyThrottle = setTimeout(function () {
            scrollSpyThrottle = null;
            updateSelectedDayFromScroll();
        }, 80);
    }, { passive: true });
}

// Navegación del calendario
const handlePreviousDay = () => {
    const [year, month, day] = estadoTareas.selectedDay.split('-').map(Number);
    const prevDate = new Date(year, month - 1, day - 1);
    const newDateString = createLocalDate(prevDate.getFullYear(), prevDate.getMonth(), prevDate.getDate());

    estadoTareas.selectedDay = newDateString;

    // Actualizar el mes mostrado si es necesario
    if (prevDate.getMonth() !== estadoTareas.currentDate.getMonth() || prevDate.getFullYear() !== estadoTareas.currentDate.getFullYear()) {
        estadoTareas.currentDate = new Date(prevDate.getFullYear(), prevDate.getMonth(), 1);
        updateMonthYearDisplay();
    }

    renderCalendarHorizontal();
    ensureDayLoaded(estadoTareas.selectedDay);
    setTimeout(() => scrollToDay(prevDate), 80);
};

const handleNextDay = () => {
    const [year, month, day] = estadoTareas.selectedDay.split('-').map(Number);
    const nextDate = new Date(year, month - 1, day + 1);
    const newDateString = createLocalDate(nextDate.getFullYear(), nextDate.getMonth(), nextDate.getDate());

    estadoTareas.selectedDay = newDateString;

    // Actualizar el mes mostrado si es necesario
    if (nextDate.getMonth() !== estadoTareas.currentDate.getMonth() || nextDate.getFullYear() !== estadoTareas.currentDate.getFullYear()) {
        estadoTareas.currentDate = new Date(nextDate.getFullYear(), nextDate.getMonth(), 1);
        updateMonthYearDisplay();
    }

    renderCalendarHorizontal();
    ensureDayLoaded(estadoTareas.selectedDay);
    setTimeout(() => scrollToDay(nextDate), 80);
};

const handleToday = () => {
    const hoy = parseDateString(today);
    estadoTareas.currentDate = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    estadoTareas.selectedDay = today;

    updateMonthYearDisplay();
    renderCalendarHorizontal();
    ensureDayLoaded(today);
    setTimeout(() => scrollToDay(parseDateString(today)), 80);
};

// Actualizar display de mes/año
function updateMonthYearDisplay() {
    const currentMonth = document.getElementById('current-month');
    const currentYear = document.getElementById('current-year');
    if (currentMonth && currentYear) {
        const selectedDate = parseDateString(estadoTareas.selectedDay);
        currentMonth.textContent = getMonthName(selectedDate);
        currentYear.textContent = selectedDate.getFullYear();
    }
}

// Nombres cortos de meses para el date picker
const MONTH_NAMES_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

// Renderizar grid de meses en el popup
function renderMonthPickerGrid() {
    const yearEl = document.getElementById('month-picker-year');
    const gridEl = document.getElementById('month-picker-grid');
    if (!yearEl || !gridEl) return;
    const d = estadoTareas.currentDate || new Date();
    const year = d.getFullYear();
    const currentMonth = d.getMonth();
    yearEl.textContent = year;
    gridEl.innerHTML = MONTH_NAMES_SHORT.map((name, index) => {
        const isSelected = index === currentMonth;
        return `<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm calendar-month-picker__month${isSelected ? ' calendar-month-picker__month--selected' : ''}" data-month="${index}" data-year="${year}"><span>${name}</span></button>`;
    }).join('');
}

// Ir al mes seleccionado: actualizar estado, cerrar popup, re-renderizar
function goToMonth(monthIndex, year) {
    const firstDay = createLocalDate(year, monthIndex, 1);
    estadoTareas.selectedDay = firstDay;
    estadoTareas.currentDate = new Date(year, monthIndex, 1);
    estadoTareas.showMonthPicker = false;
    const popup = document.querySelector('[data-role="month-popup"]');
    const monthSelectorBtn = document.querySelector('[data-role="month-selector"]');
    if (popup) popup.hidden = true;
    if (monthSelectorBtn) monthSelectorBtn.setAttribute('aria-expanded', 'false');
    updateMonthYearDisplay();
    renderCalendarHorizontal();
    ensureDayLoaded(firstDay);
    setTimeout(() => scrollToDay(parseDateString(firstDay)), 80);
}

// Cerrar popup al hacer clic fuera
function setupMonthPickerCloseOnClickOutside() {
    document.addEventListener('click', function closeMonthPicker(e) {
        if (!estadoTareas.showMonthPicker) return;
        const popup = document.querySelector('[data-role="month-popup"]');
        const btn = document.querySelector('[data-role="month-selector"]');
        if (popup && btn && !popup.contains(e.target) && !btn.contains(e.target)) {
            estadoTareas.showMonthPicker = false;
            popup.hidden = true;
            if (btn) btn.setAttribute('aria-expanded', 'false');
        }
    });
}

// Inicializar vista de tareas
function initTareasView() {
    console.log('Inicializando vista de tareas...');

    /* Toast pendiente (ej. tras eliminar tarea desde task-detail y volver aquí) */
    try {
        var pending = sessionStorage.getItem('ubits-toast-pending');
        if (pending) {
            sessionStorage.removeItem('ubits-toast-pending');
            var data = JSON.parse(pending);
            if (data && data.message && typeof showToast === 'function') showToast(data.type || 'success', data.message);
        }
    } catch (e) {}

    // Modal de confirmación eliminar tarea (componente UBITS)
    var modalsContainer = document.getElementById('tareas-modals-container');
    if (modalsContainer && typeof getModalHtml === 'function') {
        var deleteBody = '<p class="ubits-body-md-regular">¿Estás seguro? Esta acción no se puede deshacer y todos los datos de la tarea se perderán.</p>';
        var deleteFooter = '<button type="button" class="ubits-button ubits-button--secondary ubits-button--md" id="task-detail-delete-modal-cancel"><span>Cancelar</span></button><button type="button" class="ubits-button ubits-button--error ubits-button--md" id="task-detail-delete-modal-confirm"><span>Eliminar</span></button>';
        modalsContainer.innerHTML = getModalHtml({
            overlayId: 'task-detail-delete-modal-overlay',
            title: 'Eliminar tarea',
            bodyHtml: deleteBody,
            footerHtml: deleteFooter,
            size: 'sm',
            closeButtonId: 'task-detail-delete-modal-close'
        });
        var deleteOverlay = document.getElementById('task-detail-delete-modal-overlay');
        var deleteModalClose = document.getElementById('task-detail-delete-modal-close');
        var deleteModalCancel = document.getElementById('task-detail-delete-modal-cancel');
        var deleteModalConfirm = document.getElementById('task-detail-delete-modal-confirm');
        function closeDeleteModal() {
            if (typeof closeModal === 'function') closeModal('task-detail-delete-modal-overlay');
        }
        if (deleteModalClose) deleteModalClose.addEventListener('click', closeDeleteModal);
        if (deleteModalCancel) deleteModalCancel.addEventListener('click', closeDeleteModal);
        if (deleteModalConfirm) {
            deleteModalConfirm.addEventListener('click', function () {
                var taskId = estadoTareas.taskIdToDelete;
                if (taskId != null) {
                    handleDelete(taskId);
                    renderTareasVencidas();
                    renderAllTasks();
                    estadoTareas.taskIdToDelete = null;
                    if (typeof showToast === 'function') {
                        showToast('success', 'Tarea eliminada exitosamente');
                    }
                }
                closeDeleteModal();
            });
        }
        deleteOverlay.addEventListener('click', function (ev) {
            if (ev.target === deleteOverlay) closeDeleteModal();
        });
    }

    // Actualizar selector de mes/año
    updateMonthYearDisplay();

    // Configurar selector de mes/año: al hacer tap se despliega el date picker de meses
    const monthSelectorBtn = document.querySelector('[data-role="month-selector"]');
    const monthPopup = document.querySelector('[data-role="month-popup"]');
    if (monthSelectorBtn && monthPopup) {
        monthSelectorBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            estadoTareas.showMonthPicker = !estadoTareas.showMonthPicker;
            monthPopup.hidden = !estadoTareas.showMonthPicker;
            monthSelectorBtn.setAttribute('aria-expanded', estadoTareas.showMonthPicker);
            if (estadoTareas.showMonthPicker) {
                renderMonthPickerGrid();
            }
        });
    }
    // Cerrar popup al hacer clic fuera
    setupMonthPickerCloseOnClickOutside();
    // Delegación: año anterior/siguiente y clic en un mes
    const monthPickerContainer = document.getElementById('month-popup');
    if (monthPickerContainer) {
        monthPickerContainer.addEventListener('click', (e) => {
            const yearPrev = e.target.closest('[data-role="year-prev"]');
            const yearNext = e.target.closest('[data-role="year-next"]');
            const monthBtn = e.target.closest('.calendar-month-picker__month');
            if (yearPrev) {
                estadoTareas.currentDate = new Date(estadoTareas.currentDate.getFullYear() - 1, estadoTareas.currentDate.getMonth(), 1);
                renderMonthPickerGrid();
            } else if (yearNext) {
                estadoTareas.currentDate = new Date(estadoTareas.currentDate.getFullYear() + 1, estadoTareas.currentDate.getMonth(), 1);
                renderMonthPickerGrid();
            } else if (monthBtn) {
                const monthIndex = parseInt(monthBtn.dataset.month, 10);
                const year = parseInt(monthBtn.dataset.year, 10);
                goToMonth(monthIndex, year);
            }
        });
    }

    // Renderizar calendario horizontal (7 días desktop / 4 días móvil ≤600px)
    renderCalendarHorizontal();
    var calendarMedia = window.matchMedia && window.matchMedia('(max-width: 769px)');
    if (calendarMedia) {
        calendarMedia.addEventListener('change', function () {
            renderCalendarHorizontal();
        });
    }

    // Scroll-spy: al hacer scroll, el día visible se refleja como seleccionado en el calendario horizontal
    setupScrollSpy();

    // Renderizar tareas vencidas (PRIMERO)
    renderTareasVencidas();

    // Configurar toggle de sección vencidas
    const overdueToggle = document.getElementById('overdue-toggle');
    if (overdueToggle) {
        overdueToggle.addEventListener('click', () => {
            estadoTareas.showOverdueSection = !estadoTareas.showOverdueSection;
            const content = document.getElementById('overdue-content');
            const icon = overdueToggle.querySelector('i');
            if (content && icon) {
                content.style.display = estadoTareas.showOverdueSection ? 'block' : 'none';
                icon.style.transform = estadoTareas.showOverdueSection ? 'rotate(180deg)' : 'rotate(0deg)';
            }
        });
    }

    const noDueToggle = document.getElementById('no-due-toggle');
    if (noDueToggle) {
        noDueToggle.addEventListener('click', function () {
            estadoTareas.showNoDueSection = !estadoTareas.showNoDueSection;
            renderTareasSinFecha();
        });
    }

    // Botón filtros: abre dropdown (como encabezados de seguimiento)
    const filtrosBtn = document.getElementById('tareas-filtros-btn');
    if (filtrosBtn) {
        filtrosBtn.addEventListener('click', function () {
            if (typeof openFiltrosDropdown === 'function') openFiltrosDropdown();
        });
    }

    // Event listeners para acciones de tareas (delegación de eventos)
    const tareasContainer = document.getElementById('tareas-scroll-container');
    if (tareasContainer) {
        tareasContainer.addEventListener('click', (e) => {
            // Toggle completado (radio oficial: click = toggle estado)
            if (e.target.closest('.tarea-done-radio')) {
                e.preventDefault();
                const control = e.target.closest('.tarea-done-radio');
                const input = control.querySelector('input.ubits-checkbox__input');
                if (input && input.dataset.tareaId) {
                    const tareaId = parseInt(input.dataset.tareaId);
                    const overdueContent = document.getElementById('overdue-content');
                    const isInOverdueSection = overdueContent && overdueContent.contains(control);

                    let tarea = tareasEjemplo.vencidas.find(t => taskIdMatches(t, tareaId));
                    if (tarea) {
                        tarea.done = !tarea.done;
                        tarea.status = tarea.done ? 'Finalizado' : 'Vencido';
                        input.checked = tarea.done;
                        if (isInOverdueSection && tarea.done) {
                            const row = control.closest('.tarea-item');
                            const oldRect = row ? row.getBoundingClientRect() : null;
                            renderTareasVencidas();
                            if (oldRect) {
                                const newRow = document.querySelector(`#overdue-content .tarea-item[data-tarea-id="${tareaId}"]`);
                                if (newRow) {
                                    const newRect = newRow.getBoundingClientRect();
                                    const deltaY = oldRect.top - newRect.top;
                                    if (Math.abs(deltaY) > 2) {
                                        newRow.style.transition = 'none';
                                        newRow.style.transform = `translateY(${deltaY}px)`;
                                        newRow.offsetHeight; // reflow
                                        newRow.style.transition = 'transform 1s ease-out';
                                        newRow.style.transform = '';
                                        requestAnimationFrame(() => {
                                            newRow.addEventListener('transitionend', function onEnd() {
                                                newRow.style.transition = '';
                                                newRow.removeEventListener('transitionend', onEnd);
                                            }, { once: true });
                                        });
                                    }
                                }
                            }
                        } else {
                            renderTareasVencidas();
                        }
                        return;
                    }

                    const noDueContent = document.getElementById('no-due-content');
                    const isInNoDueSection = noDueContent && noDueContent.contains(control);
                    tarea = (tareasEjemplo.sinFechaVencimiento || []).find(function (t) { return taskIdMatches(t, tareaId); });
                    if (tarea && isInNoDueSection) {
                        tarea.done = !tarea.done;
                        tarea.status = tarea.done ? 'Finalizado' : 'Activo';
                        if (tarea.done) tarea._justFinalized = true;
                        else tarea._justFinalized = false;
                        input.checked = tarea.done;
                        renderTareasSinFecha();
                        return;
                    }

                    const dayContainer = control.closest('.tareas-day-container');
                    if (dayContainer) {
                        const fechaKey = dayContainer.dataset.date;
                        const tareasDelDia = tareasEjemplo.porDia[fechaKey] || [];
                        tarea = tareasDelDia.find(t => taskIdMatches(t, tareaId));
                        if (tarea) {
                            const wasDone = tarea.done;
                            tarea.done = !tarea.done;
                            tarea.status = tarea.done ? 'Finalizado' : 'Activo';
                            if (tarea.done) tarea._justFinalized = true;
                            else tarea._justFinalized = false;
                            input.checked = tarea.done;
                            const row = control.closest('.tarea-item');
                            const oldRect = (row && tarea.done) ? row.getBoundingClientRect() : null;
                            const fecha = parseDateString(fechaKey);
                            const tempDiv = document.createElement('div');
                            tempDiv.innerHTML = renderDaySection(fecha);
                            const newContent = tempDiv.firstElementChild;
                            dayContainer.innerHTML = newContent.innerHTML;
                            if (typeof initTooltip === 'function') initTooltip('[data-tooltip]');
                            if (tarea.done && oldRect) {
                                const newRow = dayContainer.querySelector(`.tarea-item[data-tarea-id="${tareaId}"]`);
                                if (newRow) {
                                    const newRect = newRow.getBoundingClientRect();
                                    const deltaY = oldRect.top - newRect.top;
                                    if (Math.abs(deltaY) > 2) {
                                        newRow.style.transition = 'none';
                                        newRow.style.transform = `translateY(${deltaY}px)`;
                                        newRow.offsetHeight;
                                        newRow.style.transition = 'transform 1s ease-out';
                                        newRow.style.transform = '';
                                        newRow.addEventListener('transitionend', function onEnd() {
                                            newRow.style.transition = '';
                                            newRow.removeEventListener('transitionend', onEnd);
                                            if (tarea) tarea._justFinalized = false;
                                        }, { once: true });
                                    } else if (tarea) {
                                        tarea._justFinalized = false;
                                    }
                                } else if (tarea) {
                                    tarea._justFinalized = false;
                                }
                            } else if (tarea && !tarea.done) {
                                tarea._justFinalized = false;
                            }
                        }
                    }
                }
            }

            // Botón "Añadir tarea"
            if (e.target.closest('.tarea-add-btn')) {
                const btn = e.target.closest('.tarea-add-btn');
                const fechaKey = btn.dataset.date;
                estadoTareas.addingTaskForDate = fechaKey;
                estadoTareas.newTaskNameForDate = '';
                const dayContainer = btn.closest('.tareas-day-container');
                if (dayContainer) {
                    const fecha = parseDateString(fechaKey);
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = renderDaySection(fecha);
                    const newContent = tempDiv.firstElementChild;
                    dayContainer.innerHTML = newContent.innerHTML;
                    if (typeof initTooltip === 'function') initTooltip('[data-tooltip]');
                    // Enfocar el input después de renderizar
                    setTimeout(() => {
                        const input = dayContainer.querySelector('.tarea-add-input');
                        if (input) input.focus();
                    }, 50);
                    // Cerrar al hacer clic fuera si el input está vacío (capture para ejecutar antes)
                    setTimeout(() => {
                        const form = dayContainer.querySelector('.tarea-add-form');
                        const wrapper = form && form.querySelector('.tarea-add-input-wrapper');
                        const inputEl = form && form.querySelector('.tarea-add-input');
                        if (!form || !wrapper || !inputEl) return;
                        function closeIfEmptyAndOutside(ev) {
                            if (!form.isConnected) {
                                document.removeEventListener('click', closeIfEmptyAndOutside, true);
                                return;
                            }
                            if (wrapper.contains(ev.target)) return;
                            if (!inputEl.value.trim()) {
                                estadoTareas.addingTaskForDate = null;
                                estadoTareas.newTaskNameForDate = '';
                                const cont = form.closest('.tareas-day-container');
                                if (cont) {
                                    const tempDiv2 = document.createElement('div');
                                    tempDiv2.innerHTML = renderDaySection(parseDateString(fechaKey));
                                    cont.innerHTML = tempDiv2.firstElementChild.innerHTML;
                                    if (typeof initTooltip === 'function') initTooltip('[data-tooltip]');
                                }
                                document.removeEventListener('click', closeIfEmptyAndOutside, true);
                            }
                        }
                        document.addEventListener('click', closeIfEmptyAndOutside, true);
                    }, 0);
                }
            }

            // Botón "Añadir" dentro del formulario inline (confirmar con clic)
            if (e.target.closest('.tarea-add-form-btn')) {
                const btn = e.target.closest('.tarea-add-form-btn');
                const form = btn.closest('.tarea-add-form');
                const input = form && form.querySelector('.tarea-add-input');
                if (form && input && input.value.trim() && !estadoTareas.isCreatingTask) {
                    handleCreateTaskInline(form.dataset.date, input.value.trim());
                }
            }

            // Formulario de agregar tarea - submit con Enter
            if (e.target.classList.contains('tarea-add-input')) {
                const input = e.target;
                const form = input.closest('.tarea-add-form');

                // Agregar listener para Enter (solo una vez por input)
                if (!input.dataset.enterListenerAdded) {
                    input.dataset.enterListenerAdded = 'true';
                    input.addEventListener('keydown', function (event) {
                        if (event.key === 'Enter' && this.value.trim() && !estadoTareas.isCreatingTask) {
                            event.preventDefault();
                            const form = this.closest('.tarea-add-form');
                            if (form) {
                                handleCreateTaskInline(form.dataset.date, this.value.trim());
                            }
                        }
                    });
                }
            }

            // Cerrar formulario de agregar tarea al hacer blur
            if (e.target.classList.contains('tarea-add-input')) {
                const input = e.target;
                input.addEventListener('blur', function () {
                    if (!this.value.trim()) {
                        const form = this.closest('.tarea-add-form');
                        if (form) {
                            const fechaKey = form.dataset.date;
                            estadoTareas.addingTaskForDate = null;
                            estadoTareas.newTaskNameForDate = '';
                            const dayContainer = form.closest('.tareas-day-container');
                            if (dayContainer) {
                                const fecha = parseDateString(fechaKey);
                                const tempDiv = document.createElement('div');
                                tempDiv.innerHTML = renderDaySection(fecha);
                                const newContent = tempDiv.firstElementChild;
                                dayContainer.innerHTML = newContent.innerHTML;
                                if (typeof initTooltip === 'function') initTooltip('[data-tooltip]');
                            }
                        }
                    }
                }, { once: true });
            }

            // Botones de acción
            if (e.target.closest('.tarea-action-btn--add-plan')) {
                const tareaItem = e.target.closest('.tarea-item');
                const tareaId = parseInt(tareaItem.querySelector('input.ubits-checkbox__input')?.dataset.tareaId);
                if (tareaId) {
                    estadoTareas.moveTaskId = estadoTareas.moveTaskId === tareaId ? null : tareaId;
                    renderAllTasks();
                }
            }
            /* Opciones de la tirilla: dropdown Enviar recordatorio / Eliminar (derecha alineada al botón) */
            if (e.target.closest('.tarea-action-btn--options') && typeof window.getDropdownMenuHtml === 'function' && typeof window.openDropdownMenu === 'function' && typeof window.closeDropdownMenu === 'function') {
                e.preventDefault();
                e.stopPropagation();
                const btn = e.target.closest('.tarea-action-btn--options');
                const tareaIdRaw = btn.dataset.tareaId || btn.getAttribute('data-tarea-id');
                const tareaId = tareaIdRaw != null ? parseInt(String(tareaIdRaw), 10) : NaN;
                if (isNaN(tareaId)) return;
                const overlayId = 'tareas-strip-options-overlay';
                let overlayEl = document.getElementById(overlayId);
                if (overlayEl) overlayEl.remove();
                const options = [
                    { text: 'Cambiar nombre', value: 'cambiar-nombre', leftIcon: 'pen' },
                    { text: 'Enviar recordatorio', value: 'recordatorio', leftIcon: 'bell' },
                    { text: 'Eliminar', value: 'eliminar', leftIcon: 'trash' }
                ];
                const html = window.getDropdownMenuHtml({ overlayId: overlayId, options: options });
                document.body.insertAdjacentHTML('beforeend', html);
                overlayEl = document.getElementById(overlayId);
                if (!overlayEl) return;
                overlayEl.style.zIndex = '10100';
                overlayEl.querySelectorAll('.ubits-dropdown-menu__option').forEach(function (opt) {
                    opt.addEventListener('click', function () {
                        const val = this.getAttribute('data-value');
                        window.closeDropdownMenu(overlayId);
                        if (overlayEl.parentNode) overlayEl.remove();
                        if (val === 'cambiar-nombre') {
                            const tareaItem = btn.closest('.tarea-item');
                            if (tareaItem && typeof window.startInlineEditTaskName === 'function') window.startInlineEditTaskName(tareaItem, tareaId, function (newName) {
                                const { tarea } = findTaskById(tareaId);
                                if (tarea) { tarea.name = newName; renderAllTasks(); }
                                if (typeof showToast === 'function') showToast('success', 'Nombre actualizado');
                            });
                        } else if (val === 'recordatorio') {
                            if (typeof showToast === 'function') showToast('success', 'Recordatorio enviado');
                        } else if (val === 'eliminar') {
                            estadoTareas.taskIdToDelete = tareaId;
                            if (typeof showModal === 'function') showModal('task-detail-delete-modal-overlay');
                            else {
                                if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
                                    handleDelete(tareaId);
                                    renderTareasVencidas();
                                    renderAllTasks();
                                    if (typeof showToast === 'function') showToast('success', 'Tarea eliminada exitosamente');
                                }
                            }
                        }
                    });
                });
                overlayEl.addEventListener('click', function (ev) {
                    if (ev.target === overlayEl) { window.closeDropdownMenu(overlayId); if (overlayEl.parentNode) overlayEl.remove(); }
                });
                window.openDropdownMenu(overlayId, btn, { alignRight: true });
            }
            if (e.target.closest('.tarea-action-btn--details')) {
                const btn = e.target.closest('.tarea-action-btn--details');
                // Leer tareaId del data-tarea-id del propio botón (más robusto que buscarlo en el radio input)
                const tareaId = parseInt(btn.dataset.tareaId || btn.getAttribute('data-tarea-id'), 10);
                if (!isNaN(tareaId)) {
                    handleTaskClick(tareaId);
                }
            }
            /* Clic en prioridad: abrir dropdown y actualizar prioridad de la tarea */
            if (e.target.closest('.tarea-priority-badge') && typeof window.getDropdownMenuHtml === 'function' && typeof window.openDropdownMenu === 'function' && typeof window.closeDropdownMenu === 'function') {
                e.preventDefault();
                e.stopPropagation();
                const badge = e.target.closest('.tarea-priority-badge');
                const tareaId = parseInt(badge.dataset.tareaId || badge.getAttribute('data-tarea-id'), 10);
                if (isNaN(tareaId)) return;
                const resPriority = findTaskById(tareaId);
                const tarea = resPriority.tarea;
                if (!tarea) return;
                var overlayId = 'tarea-strip-priority-overlay-' + tareaId;
                var existing = document.getElementById(overlayId);
                if (existing) existing.remove();
                var options = [
                    { text: 'Baja', value: 'baja', leftIcon: 'chevron-down' },
                    { text: 'Media', value: 'media', leftIcon: 'chevron-up' },
                    { text: 'Alta', value: 'alta', leftIcon: 'chevrons-up' }
                ];
                var html = window.getDropdownMenuHtml({ overlayId: overlayId, options: options });
                document.body.insertAdjacentHTML('beforeend', html);
                var overlayEl = document.getElementById(overlayId);
                if (!overlayEl) return;
                overlayEl.style.zIndex = '10100';
                var priorityLabels = { alta: 'Alta', media: 'Media', baja: 'Baja' };
                overlayEl.querySelectorAll('.ubits-dropdown-menu__option').forEach(function (btn) {
                    btn.addEventListener('click', function (ev) {
                        ev.stopPropagation();
                        var val = btn.getAttribute('data-value');
                        if (val) {
                            tarea.priority = val;
                            renderTareasVencidas();
                            renderAllTasks();
                            if (typeof showToast === 'function') showToast('success', 'Prioridad actualizada a ' + (priorityLabels[val] || val));
                        }
                        window.closeDropdownMenu(overlayId);
                        if (overlayEl.parentNode) overlayEl.remove();
                    });
                });
                overlayEl.addEventListener('click', function (ev) {
                    if (ev.target === overlayEl) {
                        window.closeDropdownMenu(overlayId);
                        if (overlayEl.parentNode) overlayEl.remove();
                    }
                });
                window.openDropdownMenu(overlayId, badge);
                return;
            }
            /* Clic en botón "Cambiar nombre" (hover sobre el título): edición inline */
            if (e.target.closest('.tarea-edit-name-btn')) {
                e.preventDefault();
                e.stopPropagation();
                var btn = e.target.closest('.tarea-edit-name-btn');
                var tareaItem = btn.closest('.tarea-item');
                var tareaId = parseInt(tareaItem.dataset.tareaId || tareaItem.getAttribute('data-tarea-id'), 10);
                if (!tareaItem || isNaN(tareaId)) return;
                if (typeof window.startInlineEditTaskName === 'function') {
                    window.startInlineEditTaskName(tareaItem, tareaId, function (newName) {
                        var res = findTaskById(tareaId);
                        if (res && res.tarea) {
                            res.tarea.name = newName;
                            renderAllTasks();
                        }
                        if (typeof showToast === 'function') showToast('success', 'Nombre actualizado');
                    });
                }
                return;
            }
            /* Clic en la fila (nombre, etiqueta) abre el detalle; excluir radio, columna de acciones, botón editar nombre y edición inline del nombre */
            if (e.target.closest('.tarea-item') && !e.target.closest('.tarea-item__radio') && !e.target.closest('.tarea-item__actions') && !e.target.closest('.tarea-edit-name-btn') && !e.target.closest('.tarea-titulo-edit-wrap')) {
                const tareaItem = e.target.closest('.tarea-item');
                const tareaId = parseInt(tareaItem.dataset.tareaId || tareaItem.getAttribute('data-tarea-id'), 10);
                if (isNaN(tareaId)) return;
                const clickOnTitle = e.target.closest('.tarea-titulo') || e.target.closest('.tarea-titulo-wrap');
                if (clickOnTitle) {
                    /* Doble toque en mobile (dblclick no se dispara en touch): dos taps en el mismo título en <400ms = editar nombre */
                    var now = Date.now();
                    if (estadoTareas.lastTapForEdit && estadoTareas.lastTapForEdit.tareaItem === tareaItem && (now - estadoTareas.lastTapForEdit.time) < 400) {
                        estadoTareas.lastTapForEdit = null;
                        if (estadoTareas.pendingTaskClickTimeout) {
                            clearTimeout(estadoTareas.pendingTaskClickTimeout);
                            estadoTareas.pendingTaskClickTimeout = null;
                        }
                        e.preventDefault();
                        e.stopPropagation();
                        if (typeof window.startInlineEditTaskName === 'function') {
                            window.startInlineEditTaskName(tareaItem, tareaId, function (newName) {
                                var res = findTaskById(tareaId);
                                if (res && res.tarea) {
                                    res.tarea.name = newName;
                                    renderAllTasks();
                                }
                                if (typeof showToast === 'function') showToast('success', 'Nombre actualizado');
                            });
                        }
                        return;
                    }
                    estadoTareas.lastTapForEdit = { tareaItem: tareaItem, time: now };
                    if (estadoTareas.pendingTaskClickTimeout) clearTimeout(estadoTareas.pendingTaskClickTimeout);
                    estadoTareas.pendingTaskClickTimeout = setTimeout(function () {
                        estadoTareas.pendingTaskClickTimeout = null;
                        handleTaskClick(tareaId);
                    }, 300);
                } else {
                    handleTaskClick(tareaId);
                }
            }
            if (e.target.closest('.tarea-fecha-btn')) {
                e.stopPropagation();
                const btn = e.target.closest('.tarea-fecha-btn');
                const tareaId = parseInt(btn.dataset.tareaId, 10);
                if (!isNaN(tareaId)) openTareaFechaCalendar(btn, tareaId);
            }
            /* Clic en asignado (avatar): mismo dropdown con autocomplete que en task-detail */
            if (e.target.closest('.tarea-assigned') && typeof window.getDropdownMenuHtml === 'function' && typeof window.openDropdownMenu === 'function' && typeof window.closeDropdownMenu === 'function') {
                e.preventDefault();
                e.stopPropagation();
                const assignedEl = e.target.closest('.tarea-assigned');
                const tareaItem = e.target.closest('.tarea-item');
                const tareaId = parseInt(tareaItem.dataset.tareaId || tareaItem.getAttribute('data-tarea-id'), 10);
                if (isNaN(tareaId)) return;
                const { tarea } = findTaskById(tareaId);
                if (!tarea) return;
                function getUsuariosTareas() {
                    if (typeof TAREAS_PLANES_DB !== 'undefined' && typeof TAREAS_PLANES_DB.getEmpleadosEjemplo === 'function') {
                        const emp = TAREAS_PLANES_DB.getEmpleadosEjemplo();
                        return emp.map(function (e, i) {
                            return {
                                id: String(e.id != null ? e.id : i),
                                email: e.username || '',
                                full_name: e.nombre || '',
                                avatar_url: (e.avatar && String(e.avatar).trim()) ? e.avatar : null
                            };
                        });
                    }
                    return [];
                }
                const users = getUsuariosTareas();
                const options = [{ text: 'Sin asignar', value: 'none', avatar: null }].concat(
                    users.map(function (u) {
                        return { value: u.id, text: u.full_name || u.email || '', avatar: u.avatar_url };
                    })
                );
                const overlayId = 'tareas-strip-assignee-overlay-' + tareaId;
                let existing = document.getElementById(overlayId);
                if (existing) existing.remove();
                const html = window.getDropdownMenuHtml({
                    overlayId: overlayId,
                    hasAutocomplete: true,
                    autocompletePlaceholder: 'Buscar...',
                    options: options
                });
                document.body.insertAdjacentHTML('beforeend', html);
                const overlayEl = document.getElementById(overlayId);
                if (!overlayEl) return;
                overlayEl.style.zIndex = '10100';
                const optionsContainer = overlayEl.querySelector('.ubits-dropdown-menu__options');
                if (optionsContainer) optionsContainer.classList.add('ubits-dropdown-menu__options--max-h-255');
                const contentEl = overlayEl.querySelector('.ubits-dropdown-menu__content');
                if (contentEl) contentEl.style.zIndex = '10100';
                const optionButtons = overlayEl.querySelectorAll('.ubits-dropdown-menu__option');
                function normalizeText(str) {
                    if (str == null) return '';
                    return String(str).toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                }
                function filterVisibleOptions(searchVal) {
                    const q = normalizeText(searchVal || '');
                    optionButtons.forEach(function (opt) {
                        const textEl = opt.querySelector('.ubits-dropdown-menu__option-text');
                        const text = textEl ? textEl.textContent : '';
                        opt.style.display = (!q || normalizeText(text).indexOf(q) >= 0) ? '' : 'none';
                    });
                }
                const inputEl = document.getElementById(overlayId + '-autocomplete-input');
                const clearIcon = document.getElementById(overlayId + '-autocomplete-clear');
                if (inputEl && clearIcon) {
                    clearIcon.style.pointerEvents = 'auto';
                    clearIcon.style.display = 'none';
                    clearIcon.addEventListener('click', function (ev) {
                        ev.preventDefault();
                        ev.stopPropagation();
                        inputEl.value = '';
                        filterVisibleOptions('');
                        inputEl.focus();
                    });
                    inputEl.addEventListener('input', function () {
                        clearIcon.style.display = inputEl.value.length > 0 ? 'block' : 'none';
                        filterVisibleOptions(inputEl.value);
                    });
                    filterVisibleOptions('');
                }
                optionButtons.forEach(function (btn) {
                    btn.addEventListener('click', function (ev) {
                        ev.stopPropagation();
                        const val = btn.getAttribute('data-value');
                        if (val === 'none') {
                            tarea.assignee_email = null;
                            tarea.assignee_name = null;
                            tarea.assignee_avatar_url = null;
                        } else {
                            const user = users.find(function (u) { return String(u.id) === val; });
                            if (user) {
                                tarea.assignee_email = user.email;
                                tarea.assignee_name = user.full_name || user.email;
                                tarea.assignee_avatar_url = user.avatar_url;
                            }
                        }
                        if (typeof window.closeDropdownMenu === 'function') window.closeDropdownMenu(overlayId);
                        if (overlayEl.parentNode) overlayEl.remove();
                        renderTareasVencidas();
                        renderAllTasks();
                        if (typeof showToast === 'function') showToast('success', 'Asignado actualizado');
                    });
                });
                overlayEl.addEventListener('click', function (ev) {
                    if (ev.target === overlayEl) {
                        if (typeof window.closeDropdownMenu === 'function') window.closeDropdownMenu(overlayId);
                        if (overlayEl.parentNode) overlayEl.remove();
                    }
                });
                window.openDropdownMenu(overlayId, assignedEl);
            }
        });
        tareasContainer.addEventListener('dblclick', function (e) {
            /* Doble clic solo en el nombre de la tarea: edición inline del nombre (mismo que "Cambiar nombre" del menú ⋮) */
            if (!e.target.closest('.tarea-titulo') && !e.target.closest('.tarea-titulo-wrap')) return;
            const tareaItem = e.target.closest('.tarea-item');
            if (!tareaItem) return;
            e.preventDefault();
            e.stopPropagation();
            if (estadoTareas.pendingTaskClickTimeout) {
                clearTimeout(estadoTareas.pendingTaskClickTimeout);
                estadoTareas.pendingTaskClickTimeout = null;
            }
            const tareaId = parseInt(tareaItem.dataset.tareaId || tareaItem.getAttribute('data-tarea-id'), 10);
            if (isNaN(tareaId) || typeof window.startInlineEditTaskName !== 'function') return;
            window.startInlineEditTaskName(tareaItem, tareaId, function (newName) {
                const res = findTaskById(tareaId);
                if (res && res.tarea) {
                    res.tarea.name = newName;
                    renderAllTasks();
                }
                if (typeof showToast === 'function') showToast('success', 'Nombre actualizado');
            });
        });
    }

    // Cargar días iniciales (precargar 21 días para incluir Feb 7-10 y siguientes)
    loadMoreDays();
    loadMoreDays();
    loadMoreDays();

    // Configurar scroll infinito
    const scrollContainer = document.getElementById('tareas-scroll-container');
    if (scrollContainer) {
        let isLoading = false;
        scrollContainer.addEventListener('scroll', () => {
            if (isLoading) return;

            const scrollTop = scrollContainer.scrollTop;
            const scrollHeight = scrollContainer.scrollHeight;
            const clientHeight = scrollContainer.clientHeight;

            // Cargar más días cuando esté cerca del final (80% del scroll)
            if (scrollTop + clientHeight >= scrollHeight * 0.8) {
                isLoading = true;
                const loadingIndicator = document.getElementById('loading-indicator');
                if (loadingIndicator) {
                    loadingIndicator.style.display = 'block';
                }

                setTimeout(() => {
                    loadMoreDays();
                    if (loadingIndicator) {
                        loadingIndicator.style.display = 'none';
                    }
                    isLoading = false;
                }, 300);
            }
        });
    }

    // Controles de navegación del calendario
    const calendarPrevBtn = document.querySelector('[data-role="horizontal-prev"]');
    const calendarNextBtn = document.querySelector('[data-role="horizontal-next"]');
    const calendarTodayBtn = document.querySelector('[data-role="go-today"]');

    if (calendarPrevBtn) {
        calendarPrevBtn.addEventListener('click', () => {
            handlePreviousDay();
        });
    }

    if (calendarNextBtn) {
        calendarNextBtn.addEventListener('click', () => {
            handleNextDay();
        });
    }

    if (calendarTodayBtn) {
        calendarTodayBtn.addEventListener('click', () => {
            handleToday();
        });
    }

    updateTareasFiltrosButtonBadge();
}

// Usuario por defecto para tareas creadas inline (modo colaborador)
const TAREA_INLINE_CREATED_BY = 'Maria Alejandra Sanchez Pardo';

// Función para crear tarea inline
function handleCreateTaskInline(fechaKey, nombreTarea) {
    if (!nombreTarea.trim() || estadoTareas.isCreatingTask) return;

    estadoTareas.isCreatingTask = true;

    // Simular creación de tarea (en producción sería una llamada a API)
    setTimeout(() => {
        const nuevaTarea = {
            id: Date.now(), // ID temporal
            name: nombreTarea.trim(),
            description: '',
            done: false,
            status: 'Activo',
            /* Fecha de vencimiento = día de la columna donde se pulsó «Añadir tarea» */
            endDate: fechaKey,
            priority: 'media',
            assignee_name: TAREA_INLINE_CREATED_BY,
            assignee_email: null,
            assignee_avatar_url: null,
            created_by: TAREA_INLINE_CREATED_BY,
            created_by_avatar_url: null,
            planId: null,
            planNombre: '',
            etiqueta: null
        };

        // Agregar tarea a la fecha correspondiente
        if (!tareasEjemplo.porDia[fechaKey]) {
            tareasEjemplo.porDia[fechaKey] = [];
        }
        tareasEjemplo.porDia[fechaKey].unshift(nuevaTarea);

        // Limpiar estado
        estadoTareas.addingTaskForDate = null;
        estadoTareas.newTaskNameForDate = '';
        estadoTareas.isCreatingTask = false;

        // Re-renderizar la sección del día
        const dayContainer = document.querySelector(`.tareas-day-container[data-date="${fechaKey}"]`);
        if (dayContainer) {
            const fecha = parseDateString(fechaKey);
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = renderDaySection(fecha);
            const newContent = tempDiv.firstElementChild;
            dayContainer.innerHTML = newContent.innerHTML;
            if (typeof initTooltip === 'function') initTooltip('[data-tooltip]');
        }
    }, 300);
}

// Función para actualizar prioridad de tarea
function handleUpdatePriority(tareaId) {
    const found = findTaskById(tareaId);
    const tarea = found.tarea;
    const ubicacion = found.ubicacion;

    if (tarea) {
        // Rotar prioridad: baja -> media -> alta -> baja
        const prioridades = ['baja', 'media', 'alta'];
        const indiceActual = prioridades.indexOf(tarea.priority);
        const nuevoIndice = (indiceActual + 1) % prioridades.length;
        tarea.priority = prioridades[nuevoIndice];

        // Re-renderizar
        if (ubicacion === 'vencidas') {
            renderTareasVencidas();
        } else if (ubicacion === 'sin-fecha') {
            renderTareasSinFecha();
        } else {
            const dayContainer = document.querySelector(`.tareas-day-container[data-date="${ubicacion}"]`);
            if (dayContainer) {
                const fecha = parseDateString(ubicacion);
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = renderDaySection(fecha);
                const newContent = tempDiv.firstElementChild;
                dayContainer.innerHTML = newContent.innerHTML;
                if (typeof initTooltip === 'function') initTooltip('[data-tooltip]');
            }
        }
    }
}

// Función para eliminar tarea
function handleDelete(tareaId) {
    // Buscar y eliminar de vencidas
    const indexVencidas = tareasEjemplo.vencidas.findIndex(t => taskIdMatches(t, tareaId));
    if (indexVencidas !== -1) {
        tareasEjemplo.vencidas.splice(indexVencidas, 1);
        renderTareasVencidas();
        return;
    }

    const indexSinFecha = (tareasEjemplo.sinFechaVencimiento || []).findIndex(t => taskIdMatches(t, tareaId));
    if (indexSinFecha !== -1) {
        tareasEjemplo.sinFechaVencimiento.splice(indexSinFecha, 1);
        renderTareasSinFecha();
        return;
    }

    // Buscar y eliminar de tareas por día
    for (const fechaKey in tareasEjemplo.porDia) {
        const index = tareasEjemplo.porDia[fechaKey].findIndex(t => taskIdMatches(t, tareaId));
        if (index !== -1) {
            tareasEjemplo.porDia[fechaKey].splice(index, 1);
            const dayContainer = document.querySelector(`.tareas-day-container[data-date="${fechaKey}"]`);
            if (dayContainer) {
                const fecha = parseDateString(fechaKey);
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = renderDaySection(fecha);
                const newContent = tempDiv.firstElementChild;
                dayContainer.innerHTML = newContent.innerHTML;
                if (typeof initTooltip === 'function') initTooltip('[data-tooltip]');
            }
            return;
        }
    }
}

// Comparación de id robusta (por si viene number o string de la BD)
function taskIdMatches(t, id) {
    if (t == null || id == null) return false;
    const a = Number(t.id);
    const b = Number(id);
    if (!isNaN(a) && !isNaN(b)) return a === b;
    return String(t.id) === String(id);
}

// Encontrar tarea por id (vencidas, sin fecha, porDía). ubicacion: 'vencidas' | 'sin-fecha' | fechaKey YYYY-MM-DD
function findTaskById(tareaId) {
    let tarea = tareasEjemplo.vencidas.find(t => taskIdMatches(t, tareaId));
    if (tarea) return { tarea, ubicacion: 'vencidas' };
    tarea = (tareasEjemplo.sinFechaVencimiento || []).find(function (t) { return taskIdMatches(t, tareaId); });
    if (tarea) return { tarea, ubicacion: 'sin-fecha' };
    for (const fechaKey in tareasEjemplo.porDia) {
        tarea = tareasEjemplo.porDia[fechaKey].find(t => taskIdMatches(t, tareaId));
        if (tarea) return { tarea, ubicacion: fechaKey };
    }
    return { tarea: null, ubicacion: null };
}

// Función para actualizar fecha de vencimiento de una tarea
function handleUpdateTaskEndDate(tareaId, newYmd) {
    const { tarea, ubicacion } = findTaskById(tareaId);
    if (!tarea) return;
    const oldYmd = tarea.endDate || null;
    tarea.endDate = newYmd || null;

    if (ubicacion === 'vencidas') {
        tareasEjemplo.vencidas = tareasEjemplo.vencidas.filter(t => !taskIdMatches(t, tareaId));
    } else if (ubicacion === 'sin-fecha') {
        tareasEjemplo.sinFechaVencimiento = (tareasEjemplo.sinFechaVencimiento || []).filter(t => !taskIdMatches(t, tareaId));
    } else if (ubicacion) {
        tareasEjemplo.porDia[ubicacion] = (tareasEjemplo.porDia[ubicacion] || []).filter(t => !taskIdMatches(t, tareaId));
    }

    if (newYmd) {
        if (!tareasEjemplo.porDia[newYmd]) tareasEjemplo.porDia[newYmd] = [];
        tareasEjemplo.porDia[newYmd].push(tarea);
    } else {
        if (!tareasEjemplo.sinFechaVencimiento) tareasEjemplo.sinFechaVencimiento = [];
        tareasEjemplo.sinFechaVencimiento.push(tarea);
    }

    renderTareasVencidas();
    const daysContainer = document.getElementById('days-container');
    if (daysContainer) {
        [ubicacion, newYmd].filter(function (k) {
            return k && k !== 'vencidas' && k !== 'sin-fecha' && /^\d{4}-\d{2}-\d{2}$/.test(String(k));
        }).forEach(fechaKey => {
            const dayContainer = daysContainer.querySelector(`.tareas-day-container[data-date="${fechaKey}"]`);
            if (dayContainer) {
                const fecha = parseDateString(fechaKey);
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = renderDaySection(fecha);
                const newContent = tempDiv.firstElementChild;
                dayContainer.innerHTML = newContent.innerHTML;
                if (typeof initTooltip === 'function') initTooltip('[data-tooltip]');
            }
        });
    }
}

// Abrir popover con calendario oficial para cambiar fecha de vencimiento (misma lógica de posicionamiento que input calendar)
function openTareaFechaCalendar(triggerBtn, tareaId) {
    const { tarea } = findTaskById(tareaId);
    if (!tarea || typeof window.createCalendar !== 'function') return;

    let popover = document.getElementById('tarea-fecha-calendar-popover');
    if (!popover) {
        popover = document.createElement('div');
        popover.id = 'tarea-fecha-calendar-popover';
        popover.className = 'ubits-calendar-dropdown';
        popover.innerHTML = '<div id="tarea-fecha-calendar-container"></div>';
        popover.style.cssText = 'position:fixed;display:none;z-index:10100;';
        document.body.appendChild(popover);

        document.addEventListener('click', function closeOnClickOutside(e) {
            if (popover.style.display !== 'none' && !popover.contains(e.target) && !e.target.closest('.tarea-fecha-btn')) {
                popover.style.display = 'none';
            }
        });
    }

    const container = document.getElementById('tarea-fecha-calendar-container');
    if (!container) return;
    container.innerHTML = '';

    var rect = triggerBtn.getBoundingClientRect();
    var pad = 16;
    var gapDown = 4;
    var gapUp = 0;

    function positionWrapper() {
        var w = popover.offsetWidth || 312;
        var h = popover.offsetHeight || 382;
        var vw = window.innerWidth;
        var vh = window.innerHeight;
        var left = rect.right - w;
        left = Math.max(pad, Math.min(vw - w - pad, left));
        var spaceBelow = vh - rect.bottom - pad;
        var spaceAbove = rect.top - pad;
        var top;
        if (spaceBelow >= h) {
            top = rect.bottom + gapDown;
        } else if (spaceAbove >= h) {
            top = rect.top - h - gapUp;
        } else {
            top = spaceBelow >= spaceAbove ? rect.bottom + gapDown : rect.top - h - gapUp;
        }
        top = Math.max(pad, Math.min(vh - h - pad, top));
        popover.style.left = left + 'px';
        popover.style.top = top + 'px';
    }

    popover.style.display = 'block';
    positionWrapper();

    const selectedDateDmy = tarea.endDate ? ymdToDmySlash(tarea.endDate) : '';
    window.createCalendar({
        containerId: 'tarea-fecha-calendar-container',
        selectedDate: selectedDateDmy || undefined,
        initialDate: selectedDateDmy ? undefined : new Date(),
        onDateSelect: function (dateStr) {
            const ymd = dmySlashToYmd(dateStr);
            handleUpdateTaskEndDate(tareaId, ymd);
            popover.style.display = 'none';
            if (typeof showToast === 'function') showToast('success', 'Fecha de vencimiento actualizada');
        }
    });

    requestAnimationFrame(function () {
        positionWrapper();
    });
}

// Función para re-renderizar todas las tareas
function renderAllTasks() {
    renderTareasVencidas();
    const daysContainer = document.getElementById('days-container');
    if (daysContainer) {
        estadoTareas.diasRenderizados.forEach(fechaKey => {
            const dayContainer = daysContainer.querySelector(`.tareas-day-container[data-date="${fechaKey}"]`);
            if (dayContainer) {
                const fecha = parseDateString(fechaKey);
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = renderDaySection(fecha);
                const newContent = tempDiv.firstElementChild;
                dayContainer.innerHTML = newContent.innerHTML;
                if (typeof initTooltip === 'function') initTooltip('[data-tooltip]');
            }
        });
    }
    updateTareasFiltrosButtonBadge();
}

// Escapar HTML
function escapeTaskHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}


// Abrir detalle de tarea en la página task-detail.html (nuevo flujo; antes abría el panel)
function handleTaskClick(tareaId) {
    if (tareaId == null || tareaId === '') return;
    // Guardar datos básicos de la tarea en sessionStorage para que task-detail pueda
    // mostrar datos reales incluso si el ID es sintético (vista líder: rango 90000+).
    try {
        const { tarea } = findTaskById(tareaId);
        if (tarea) {
            sessionStorage.setItem('task_detail_fallback', JSON.stringify({
                id: tarea.id,
                name: tarea.name,
                description: tarea.description || null,
                status: tarea.status,
                priority: tarea.priority,
                endDate: tarea.endDate,
                assignee_name: tarea.assignee_name || null,
                assignee_avatar_url: tarea.assignee_avatar_url || null,
                assignee_email: tarea.assignee_email || null,
                created_by: tarea.created_by || null,
                created_by_avatar_url: tarea.created_by_avatar_url || null,
                planId: tarea.planId != null && tarea.planId !== '' ? tarea.planId : null,
                planNombre: tarea.planNombre || null,
                taskType: tarea.taskType || 'standard',
                learningContentId: tarea.learningContentId != null && tarea.learningContentId !== '' ? String(tarea.learningContentId) : null
            }));
        }
    } catch (e) { /* sessionStorage no disponible (ej. file://) */ }
    window.location.href = 'task-detail.html?id=' + encodeURIComponent(tareaId);
}

// Exportar función de inicialización
window.initTareasView = initTareasView;
