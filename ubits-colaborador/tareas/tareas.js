/* ========================================
   VISTA DE TAREAS - BASADO EN COMPONENTE REACT
   Renderiza días del calendario dinámicamente con scroll infinito.
   Datos: solo tareas-base-unificada.js (TAREAS_PLANES_DB).
   ======================================== */

// Datos de tareas: única fuente TAREAS_PLANES_DB.getTareasVistaTareas() (estructura { vencidas, porDia }).
let tareasEjemplo = { vencidas: [], porDia: {} };

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
    userResults: [], // Resultados de búsqueda de usuarios
    loadingUsers: false, // Estado de carga de usuarios
    planSearch: '', // Búsqueda de planes
    showPlanDropdown: false, // Mostrar dropdown de planes
    availablePlans: [], // Planes disponibles para mover tarea
    loadingPlans: false, // Estado de carga de planes
    showAssigneeDropdown: false, // Dropdown para asignar usuario
    showRoleDropdown: false, // Dropdown para elegir rol
    filtros: {
        estados: [],      // [] = todos; si no vacío: ['Activo','Vencido','Finalizado'] (Activo = 'Por hacer')
        prioridades: [],   // [] = todas; si no vacío: ['alta','media','baja']
        asignacion: 'todas' // 'todas' | 'asignadas-por-mi' | 'asignadas-a-mi'
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

// Datos solo desde BD unificada
if (typeof TAREAS_PLANES_DB !== 'undefined' && typeof TAREAS_PLANES_DB.getTareasVistaTareas === 'function') {
    tareasEjemplo = TAREAS_PLANES_DB.getTareasVistaTareas();
    today = getTodayString();
}
if (!estadoTareas.selectedDay) {
    estadoTareas.selectedDay = today;
}

// Devuelve { vencidas, porDia } aplicando filtros (Estado, Prioridad, Asignación). Fuente: tareasEjemplo.
function getTareasFiltradas() {
    const f = estadoTareas.filtros || {};
    const estados = f.estados || [];
    const prioridades = f.prioridades || [];
    const asignacion = f.asignacion || 'todas';
    const nombreActual = (typeof TAREAS_PLANES_DB !== 'undefined' && TAREAS_PLANES_DB.getUsuarioActual) ? (TAREAS_PLANES_DB.getUsuarioActual().nombre || '') : '';

    function pasaFiltro(t) {
        if (estados.length > 0 && estados.indexOf(t.status) === -1) return false;
        const prio = (t.priority || 'media').toLowerCase();
        if (prioridades.length > 0 && prioridades.indexOf(prio) === -1) return false;
        if (asignacion === 'asignadas-por-mi') {
            if (nombreActual && (t.created_by !== nombreActual || t.assignee_name === nombreActual)) return false;
        } else if (asignacion === 'asignadas-a-mi') {
            if (nombreActual && t.assignee_name !== nombreActual) return false;
        }
        return true;
    }

    const vencidas = (tareasEjemplo.vencidas || []).filter(pasaFiltro);
    const porDia = {};
    const dias = tareasEjemplo.porDia || {};
    for (const fechaKey in dias) {
        const list = (dias[fechaKey] || []).filter(pasaFiltro);
        if (list.length > 0) porDia[fechaKey] = list;
    }
    return { vencidas, porDia };
}

// Filtros de tareas: dropdown con contenido personalizado (customBodyHtml), como encabezados de seguimiento.
var TAREAS_FILTROS_OVERLAY_ID = 'tareas-filtros-dropdown';

var TAREAS_FILTROS_ESTADO_OPTIONS = [
    { value: '', text: 'Todos' },
    { value: 'Activo', text: 'Por hacer' },
    { value: 'Vencido', text: 'Vencido' },
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

function getFiltrosDropdownBodyHtml() {
    return '<div class="tareas-filtros-dropdown-body">' +
        '<div id="tareas-filtros-estado-container"></div>' +
        '<div id="tareas-filtros-prioridad-container"></div>' +
        '<div id="tareas-filtros-asignacion-container"></div>' +
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

    overlayEl.addEventListener('click', function (ev) {
        if (ev.target === overlayEl) {
            window.closeDropdownMenu(TAREAS_FILTROS_OVERLAY_ID);
            if (overlayEl.parentNode) overlayEl.remove();
            if (btn) btn.setAttribute('aria-expanded', 'false');
        }
    });

    var limpiarBtn = document.getElementById('tareas-filtros-limpiar');
    var aplicarBtn = document.getElementById('tareas-filtros-aplicar');
    if (limpiarBtn) {
        limpiarBtn.addEventListener('click', function () {
            estadoTareas.filtros = { estados: [], prioridades: [], asignacion: 'todas' };
            window.closeDropdownMenu(TAREAS_FILTROS_OVERLAY_ID);
            if (overlayEl.parentNode) overlayEl.remove();
            if (btn) btn.setAttribute('aria-expanded', 'false');
            renderAllTasks();
        });
    }
    if (aplicarBtn) {
        aplicarBtn.addEventListener('click', function () {
            var textoEstado = estadoInput && estadoInput.getValue ? estadoInput.getValue() : '';
            var textoPrioridad = prioridadInput && prioridadInput.getValue ? prioridadInput.getValue() : '';
            var textoAsignacion = asignacionInput && asignacionInput.getValue ? asignacionInput.getValue() : '';
            var optEstado = TAREAS_FILTROS_ESTADO_OPTIONS.find(function (o) { return o.text === textoEstado; });
            var optPrioridad = TAREAS_FILTROS_PRIORIDAD_OPTIONS.find(function (o) { return o.text === textoPrioridad; });
            var optAsignacion = TAREAS_FILTROS_ASIGNACION_OPTIONS.find(function (o) { return o.text === textoAsignacion; });
            estadoTareas.filtros.estados = optEstado && optEstado.value ? [optEstado.value] : [];
            estadoTareas.filtros.prioridades = optPrioridad && optPrioridad.value ? [optPrioridad.value] : [];
            estadoTareas.filtros.asignacion = optAsignacion ? optAsignacion.value : 'todas';
            window.closeDropdownMenu(TAREAS_FILTROS_OVERLAY_ID);
            if (overlayEl.parentNode) overlayEl.remove();
            if (btn) btn.setAttribute('aria-expanded', 'false');
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
    const daysBefore = mobile ? 1 : 3;
    const maxDays = mobile ? 4 : 7;

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
    if (!container) return;

    const datos = getTareasFiltradas();
    const todasVencidas = (datos.vencidas || []).filter(t => t.status === 'Vencido' || t.done === true || t.status === 'Finalizado');
    const pendientes = todasVencidas.filter(t => !t.done && t.status !== 'Finalizado').sort((a, b) => (a.endDate || '').localeCompare(b.endDate || ''));
    const finalizadas = todasVencidas.filter(t => t.done === true || t.status === 'Finalizado');
    const listaOrdenada = pendientes.concat(finalizadas);
    const totalCount = listaOrdenada.length;

    if (section) section.style.display = totalCount === 0 ? 'none' : '';
    if (totalCount === 0) {
        container.innerHTML = '';
        return;
    }

    // >5: acordeón colapsado; ≤5: desplegado
    estadoTareas.showOverdueSection = totalCount <= 5;
    const content = document.getElementById('overdue-content');
    const toggleBtn = document.getElementById('overdue-toggle');
    const icon = toggleBtn ? toggleBtn.querySelector('i') : null;
    if (content) content.style.display = estadoTareas.showOverdueSection ? 'block' : 'none';
    if (icon) icon.style.transform = estadoTareas.showOverdueSection ? 'rotate(0deg)' : 'rotate(-90deg)';

    // Badge rojo con número total (circular si un solo dígito, pill si dos o más)
    if (header) {
        let badge = header.querySelector('.tareas-overdue-badge');
        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'tareas-overdue-badge';
            badge.setAttribute('aria-label', 'Cantidad de tareas vencidas');
            header.appendChild(badge);
        }
        badge.textContent = String(totalCount);
        badge.classList.toggle('tareas-overdue-badge--circle', totalCount >= 1 && totalCount <= 9);
    }

    container.innerHTML = listaOrdenada.map(tarea => window.renderTaskStrip(tarea, getTaskStripOpts(true))).join('');
    if (typeof initTooltip === 'function') initTooltip('[data-tooltip]');
}

// Renderizar sección de día (no finalizadas primero; finalizadas al final, la recién marcada como primera del bloque)
function renderDaySection(fecha) {
    const fechaKey = formatDate(fecha);
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
                ${tareasDelDia.length > 0 ? tareasDelDia.map(tarea => window.renderTaskStrip(tarea, getTaskStripOpts(false))).join('') : ''}
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
                        </div>
                    </form>
                ` : `
                    <button type="button" class="ubits-button ubits-button--secondary ubits-button--sm tarea-add-btn" data-date="${fechaKey}">
                        <i class="far fa-plus"></i>
                        <span>Añadir tarea</span>
                    </button>
                `) : ''}
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
                        showToast('success', 'Tarea eliminada correctamente');
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
                icon.style.transform = estadoTareas.showOverdueSection ? 'rotate(0deg)' : 'rotate(-90deg)';
            }
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
            if (e.target.closest('.tarea-action-btn--delete')) {
                const tareaItem = e.target.closest('.tarea-item');
                const tareaId = parseInt(tareaItem.querySelector('input.ubits-checkbox__input')?.dataset.tareaId, 10);
                if (!isNaN(tareaId)) {
                    estadoTareas.taskIdToDelete = tareaId;
                    if (typeof showModal === 'function') {
                        showModal('task-detail-delete-modal-overlay');
                    } else {
                        if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
                            handleDelete(tareaId);
                            renderTareasVencidas();
                            renderAllTasks();
                            if (typeof showToast === 'function') showToast('success', 'Tarea eliminada correctamente');
                        }
                    }
                }
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
                let tarea = tareasEjemplo.vencidas.find(function (t) { return taskIdMatches(t, tareaId); });
                if (!tarea) {
                    for (var fk in tareasEjemplo.porDia) {
                        tarea = tareasEjemplo.porDia[fk].find(function (t) { return taskIdMatches(t, tareaId); });
                        if (tarea) break;
                    }
                }
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
            /* Clic en la fila (nombre, etiqueta) abre el detalle; excluir radio y columna de acciones */
            if (e.target.closest('.tarea-item') && !e.target.closest('.tarea-item__radio') && !e.target.closest('.tarea-item__actions')) {
                const tareaItem = e.target.closest('.tarea-item');
                const tareaId = parseInt(tareaItem.dataset.tareaId || tareaItem.getAttribute('data-tarea-id'), 10);
                if (!isNaN(tareaId)) {
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
            endDate: null,
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
        tareasEjemplo.porDia[fechaKey].push(nuevaTarea);

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
    // Buscar tarea en vencidas
    let tarea = tareasEjemplo.vencidas.find(t => taskIdMatches(t, tareaId));
    let ubicacion = 'vencidas';

    if (!tarea) {
        // Buscar en tareas por día
        for (const fechaKey in tareasEjemplo.porDia) {
            tarea = tareasEjemplo.porDia[fechaKey].find(t => taskIdMatches(t, tareaId));
            if (tarea) {
                ubicacion = fechaKey;
                break;
            }
        }
    }

    if (tarea) {
        // Rotar prioridad: baja -> media -> alta -> baja
        const prioridades = ['baja', 'media', 'alta'];
        const indiceActual = prioridades.indexOf(tarea.priority);
        const nuevoIndice = (indiceActual + 1) % prioridades.length;
        tarea.priority = prioridades[nuevoIndice];

        // Re-renderizar
        if (ubicacion === 'vencidas') {
            renderTareasVencidas();
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

// Encontrar tarea por id (en vencidas o en porDia) y devolver { tarea, ubicacion } (ubicacion = 'vencidas' o fechaKey)
function findTaskById(tareaId) {
    let tarea = tareasEjemplo.vencidas.find(t => taskIdMatches(t, tareaId));
    if (tarea) return { tarea, ubicacion: 'vencidas' };
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
    } else if (ubicacion) {
        tareasEjemplo.porDia[ubicacion] = (tareasEjemplo.porDia[ubicacion] || []).filter(t => !taskIdMatches(t, tareaId));
    }

    if (newYmd) {
        if (!tareasEjemplo.porDia[newYmd]) tareasEjemplo.porDia[newYmd] = [];
        tareasEjemplo.porDia[newYmd].push(tarea);
    } else {
        tareasEjemplo.vencidas.push(tarea);
    }

    renderTareasVencidas();
    const daysContainer = document.getElementById('days-container');
    if (daysContainer) {
        [ubicacion, newYmd].filter(Boolean).forEach(fechaKey => {
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
                planId: tarea.planId || null,
                planNombre: tarea.planNombre || null
            }));
        }
    } catch (e) { /* sessionStorage no disponible (ej. file://) */ }
    window.location.href = 'task-detail.html?id=' + encodeURIComponent(tareaId);
}

// Exportar función de inicialización
window.initTareasView = initTareasView;
