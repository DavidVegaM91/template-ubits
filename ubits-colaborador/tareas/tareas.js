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
    selectedTask: null, // Tarea seleccionada para ver detalles
    showTaskDetail: false, // Mostrar modal de detalles
    editingTask: {}, // Datos en edición dentro del detalle
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
    showRoleDropdown: false // Dropdown para elegir rol
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

// Utilidades de fecha para UI
const getMonthName = (date) => {
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
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

// Obtener 7 días del calendario (3 antes, seleccionado, 3 después)
const getDaysInMonth = () => {
    const days = [];
    const selectedDate = parseDateString(estadoTareas.selectedDay);
    const selectedYear = selectedDate.getFullYear();
    const selectedMonth = selectedDate.getMonth();
    const selectedDayNum = selectedDate.getDate();
    
    const todayDate = parseDateString(today);
    const todayYear = todayDate.getFullYear();
    const todayMonth = todayDate.getMonth();
    const todayDayNum = todayDate.getDate();
    
    // Calcular el día de inicio (3 días antes del seleccionado, pero no antes de hoy)
    let startDay = selectedDayNum - 3;
    let startMonth = selectedMonth;
    let startYear = selectedYear;
    
    // Manejar el caso cuando startDay es negativo
    if (startDay < 1) {
        startMonth--;
        if (startMonth < 0) {
            startMonth = 11;
            startYear--;
        }
        const daysInPrevMonth = new Date(startYear, startMonth + 1, 0).getDate();
        startDay = daysInPrevMonth + startDay;
    }
    
    // Si el día de inicio es antes de hoy, empezar desde hoy
    const startDate = new Date(startYear, startMonth, startDay);
    const todayDateObj = new Date(todayYear, todayMonth, todayDayNum);
    if (startDate < todayDateObj) {
        startDay = todayDayNum;
        startMonth = todayMonth;
        startYear = todayYear;
    }
    
    // Generar los 7 días
    let currentDay = startDay;
    let currentMonth = startMonth;
    let currentYear = startYear;
    let daysAdded = 0;
    const maxDays = 7;
    
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

// Renderizar tarea individual según diseño React
// esVencidaSection = true cuando se pinta dentro de tareas-overdue-container (solo vencidas)
function renderTarea(tarea, esVencidaSection = false) {
    const fechaDisplay = tarea.endDate ? formatDateForDisplayDDMM(tarea.endDate) : null;
    const esVencidaReal = esVencidaSection || (tarea.endDate && tarea.endDate < today && !tarea.done);
    const estadoTag = esVencidaReal
        ? 'error'
        : (tarea.status === 'Activo'
            ? 'info'
            : (tarea.status === 'Finalizado' ? 'success' : 'neutral'));
    const estadoTexto = esVencidaReal
        ? 'Vencida'
        : (tarea.status === 'Activo' ? 'Iniciada' : 'Finalizada');
    const prioridadClass = tarea.priority === 'alta' ? 'tarea-priority--high' : (tarea.priority === 'baja' ? 'tarea-priority--low' : 'tarea-priority--medium');
    
    return `
        <div class="tarea-item ${tarea.done ? 'tarea-item--completed' : ''} ${esVencidaReal ? 'tarea-item--overdue' : ''}">
            <div class="tarea-item__main">
                <span class="tarea-item__radio">
                    <div class="tarea-checkbox">
                        <input type="checkbox" ${tarea.done ? 'checked' : ''} id="tarea-${tarea.id}" data-tarea-id="${tarea.id}">
                        <label for="tarea-${tarea.id}"></label>
                    </div>
                </span>
                <div class="tarea-content">
                    <h3 class="tarea-titulo ubits-body-md-regular" title="${tarea.name}">
                        ${tarea.name}
                    </h3>
                </div>
                ${tarea.etiqueta ? `
                    <div class="tarea-etiqueta">
                        <span class="tarea-etiqueta-text">${tarea.etiqueta}</span>
                    </div>
                ` : ''}
            </div>
            <div class="tarea-item__actions">
                <div class="tarea-status">
                    <span class="ubits-status-tag ubits-status-tag--${estadoTag} ubits-status-tag--sm">
                        <span class="ubits-status-tag__text">${estadoTexto}</span>
                    </span>
                </div>
                <div class="tarea-fecha ${!fechaDisplay ? 'tarea-fecha--sin-fecha' : ''} ${esVencidaReal ? 'tarea-fecha--overdue' : ''}">
                    ${fechaDisplay ? fechaDisplay : '<span>Sin fecha</span>'}
                </div>
                <div class="tarea-actions">
                    <button class="tarea-action-btn tarea-action-btn--add-plan" title="Agregar a un plan">
                        <i class="far fa-layer-group"></i>
                    </button>
                    <button class="tarea-action-btn tarea-priority-btn ${prioridadClass}" title="Prioridad">
                        <i class="far fa-chevron-up"></i>
                    </button>
                    <div class="tarea-assigned">
                        ${tarea.assignee_email ? `
                            <div class="tarea-assigned-avatar-initials">${tarea.assignee_email.substring(0, 2).toUpperCase()}</div>
                        ` : `
                            <div class="tarea-assigned-placeholder">
                                <i class="far fa-user"></i>
                            </div>
                        `}
                    </div>
                    <button class="tarea-action-btn tarea-action-btn--delete" title="Eliminar">
                        <i class="far fa-trash"></i>
                    </button>
                    <button class="tarea-action-btn tarea-action-btn--details" title="Detalles">
                        <i class="far fa-chevron-right"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Renderizar sección de tareas vencidas (solo tareas vencidas, nunca finalizadas)
function renderTareasVencidas() {
    const container = document.getElementById('overdue-content');
    const section = document.getElementById('overdue-section');
    if (!container) return;

    const soloVencidas = (tareasEjemplo.vencidas || []).filter(t => {
        if (t.done === true || t.status === 'Finalizado') return false;
        return t.status === 'Vencido';
    });

    if (section) section.style.display = soloVencidas.length === 0 ? 'none' : '';
    if (soloVencidas.length === 0) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = soloVencidas.map(tarea => renderTarea(tarea, true)).join('');
}

// Renderizar sección de día
function renderDaySection(fecha) {
    const fechaKey = formatDate(fecha);
    const fechaFormateada = formatFullDate(fechaKey);
    const relativeName = getRelativeDayName(fechaKey);
    const tareasDelDia = tareasEjemplo.porDia[fechaKey] || [];
    
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
                ${tareasDelDia.length > 0 ? tareasDelDia.map(tarea => renderTarea(tarea)).join('') : ''}
                ${estadoTareas.addingTaskForDate === fechaKey ? `
                    <form class="tarea-add-form" data-date="${fechaKey}">
                        <div class="tarea-add-input-wrapper">
                            <div class="tarea-add-icon">
                                <i class="far fa-plus"></i>
                            </div>
                            <input 
                                type="text" 
                                class="tarea-add-input" 
                                placeholder="Agregar una tarea"
                                value="${estadoTareas.newTaskNameForDate}"
                                autofocus
                            />
                        </div>
                    </form>
                ` : `
                    <button class="tarea-add-btn" data-date="${fechaKey}">
                        <i class="far fa-plus"></i>
                        <span>Añadir tarea</span>
                    </button>
                `}
            </div>
        </div>
    `;
}

// Cargar más días (scroll infinito)
function loadMoreDays() {
    const container = document.getElementById('days-container');
    if (!container) return;

    const inicio = estadoTareas.diasCargados;
    const fin = inicio + estadoTareas.diasPorCarga;
    
    // Empezar desde hoy
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
}

// Asegurar que el día esté cargado en la lista (solo días >= hoy)
function ensureDayLoaded(fechaKey) {
    if (!fechaKey || fechaKey < today) return;
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
    let daySection = document.querySelector(`.tareas-day-container[data-date="${fechaKey}"]`);

    if (!daySection && fechaKey < today) {
        daySection = document.querySelector(`.tareas-day-container[data-date="${today}"]`);
    }
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
    
    // No permitir navegar a días pasados
    if (newDateString < today) {
        return;
    }
    
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
        return `<button type="button" class="calendar-month-picker__month${isSelected ? ' calendar-month-picker__month--selected' : ''}" data-month="${index}" data-year="${year}">${name}</button>`;
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

    // Renderizar calendario horizontal con 7 días
    renderCalendarHorizontal();

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

    // Event listeners para acciones de tareas (delegación de eventos)
    const tareasContainer = document.getElementById('tareas-scroll-container');
    if (tareasContainer) {
        tareasContainer.addEventListener('click', (e) => {
            // Checkbox toggle
            if (e.target.type === 'checkbox' || e.target.closest('.tarea-checkbox')) {
                const checkbox = e.target.type === 'checkbox' ? e.target : e.target.closest('.tarea-checkbox').querySelector('input[type="checkbox"]');
                if (checkbox && checkbox.dataset.tareaId) {
                    const tareaId = parseInt(checkbox.dataset.tareaId);
                    
                    // Buscar en tareas vencidas
                    let tarea = tareasEjemplo.vencidas.find(t => t.id === tareaId);
                    if (tarea) {
                        tarea.done = checkbox.checked;
                        tarea.status = checkbox.checked ? 'Finalizado' : 'Vencido';
                        renderTareasVencidas();
                        return;
                    }
                    
                    // Buscar en tareas por día
                    const dayContainer = checkbox.closest('.tareas-day-container');
                    if (dayContainer) {
                        const fechaKey = dayContainer.dataset.date;
                        const tareasDelDia = tareasEjemplo.porDia[fechaKey] || [];
                        tarea = tareasDelDia.find(t => t.id === tareaId);
                        if (tarea) {
                            tarea.done = checkbox.checked;
                            tarea.status = checkbox.checked ? 'Finalizado' : 'Activo';
                            const fecha = parseDateString(fechaKey);
                            const tempDiv = document.createElement('div');
                            tempDiv.innerHTML = renderDaySection(fecha);
                            const newContent = tempDiv.firstElementChild;
                            dayContainer.innerHTML = newContent.innerHTML;
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
                    input.addEventListener('keydown', function(event) {
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
                input.addEventListener('blur', function() {
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
                            }
                        }
                    }
                }, { once: true });
            }
            
            // Botones de acción
            if (e.target.closest('.tarea-action-btn--add-plan')) {
                const tareaItem = e.target.closest('.tarea-item');
                const tareaId = parseInt(tareaItem.querySelector('input[type="checkbox"]')?.dataset.tareaId);
                if (tareaId) {
                    estadoTareas.moveTaskId = estadoTareas.moveTaskId === tareaId ? null : tareaId;
                    renderAllTasks();
                }
            }
            if (e.target.closest('.tarea-priority-btn')) {
                const tareaItem = e.target.closest('.tarea-item');
                const tareaId = parseInt(tareaItem.querySelector('input[type="checkbox"]')?.dataset.tareaId);
                if (tareaId) {
                    handleUpdatePriority(tareaId);
                }
            }
            if (e.target.closest('.tarea-action-btn--delete')) {
                const tareaItem = e.target.closest('.tarea-item');
                const tareaId = parseInt(tareaItem.querySelector('input[type="checkbox"]')?.dataset.tareaId);
                if (tareaId && confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
                    handleDelete(tareaId);
                }
            }
            if (e.target.closest('.tarea-action-btn--details')) {
                const tareaItem = e.target.closest('.tarea-item');
                const tareaId = parseInt(tareaItem.querySelector('input[type="checkbox"]')?.dataset.tareaId);
                if (tareaId) {
                    handleTaskClick(tareaId);
                }
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

// Función para crear tarea inline
function handleCreateTaskInline(fechaKey, nombreTarea) {
    if (!nombreTarea.trim() || estadoTareas.isCreatingTask) return;
    
    estadoTareas.isCreatingTask = true;
    
    // Simular creación de tarea (en producción sería una llamada a API)
    setTimeout(() => {
        const nuevaTarea = {
            id: Date.now(), // ID temporal
            name: nombreTarea.trim(),
            done: false,
            status: 'Activo',
            endDate: fechaKey,
            priority: 'media',
            assignee_email: null,
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
        }
    }, 300);
}

// Función para actualizar prioridad de tarea
function handleUpdatePriority(tareaId) {
    // Buscar tarea en vencidas
    let tarea = tareasEjemplo.vencidas.find(t => t.id === tareaId);
    let ubicacion = 'vencidas';
    
    if (!tarea) {
        // Buscar en tareas por día
        for (const fechaKey in tareasEjemplo.porDia) {
            tarea = tareasEjemplo.porDia[fechaKey].find(t => t.id === tareaId);
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
            }
        }
    }
}

// Función para eliminar tarea
function handleDelete(tareaId) {
    // Buscar y eliminar de vencidas
    const indexVencidas = tareasEjemplo.vencidas.findIndex(t => t.id === tareaId);
    if (indexVencidas !== -1) {
        tareasEjemplo.vencidas.splice(indexVencidas, 1);
        renderTareasVencidas();
        return;
    }
    
    // Buscar y eliminar de tareas por día
    for (const fechaKey in tareasEjemplo.porDia) {
        const index = tareasEjemplo.porDia[fechaKey].findIndex(t => t.id === tareaId);
        if (index !== -1) {
            tareasEjemplo.porDia[fechaKey].splice(index, 1);
            const dayContainer = document.querySelector(`.tareas-day-container[data-date="${fechaKey}"]`);
            if (dayContainer) {
                const fecha = parseDateString(fechaKey);
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = renderDaySection(fecha);
                const newContent = tempDiv.firstElementChild;
                dayContainer.innerHTML = newContent.innerHTML;
            }
            return;
        }
    }
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
            }
        });
    }
}

// Cerrar panel de detalle de tarea
function closeTaskDetail() {
    estadoTareas.showTaskDetail = false;
    estadoTareas.selectedTask = null;
    estadoTareas.editingTask = {};
    estadoTareas.showAssigneeDropdown = false;
    estadoTareas.showRoleDropdown = false;
    const overlay = document.getElementById('task-detail-overlay');
    if (overlay) overlay.style.display = 'none';
}

// Escapar HTML
function escapeTaskHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Función para renderizar modal de detalles de tarea
function renderTaskDetailModal() {
    const overlay = document.getElementById('task-detail-overlay');
    const panel = document.getElementById('task-detail-panel');
    if (!overlay || !panel) return;

    const t = estadoTareas.selectedTask;
    if (!t) {
        overlay.style.display = 'none';
        return;
    }

    const edit = estadoTareas.editingTask;
    const taskName = edit.name !== undefined ? edit.name : (t.name || '');
    const desc = edit.description !== undefined ? edit.description : (t.description || '');
    const endDate = edit.endDate !== undefined ? edit.endDate : (t.endDate || '');
    const priority = edit.priority !== undefined ? edit.priority : (t.priority || 'media');
    const priorityLabel = priority === 'alta' ? 'Prioridad Alta' : priority === 'baja' ? 'Prioridad Baja' : 'Prioridad Media';
    const role = edit.role !== undefined ? edit.role : (t.role || 'colaborador');
    const roleLabel = role === 'administrador' ? 'Administrador' : 'Colaborador';
    const statusDisplay = t.status === 'Vencido' ? 'Vencida' : t.status === 'Activo' ? 'Iniciada' : 'Finalizada';
    const statusClass = t.status === 'Vencido' ? 'task-detail-status--vencida' : t.status === 'Activo' ? 'task-detail-status--iniciada' : 'task-detail-status--finalizada';
    const assigneeName = t.assignee_name || (t.assignee_email || '').split('@')[0] || 'Sin asignar';
    const assigneeAvatar = t.assignee_avatar_url || null;
    const hasAssignee = !!(t.assignee_email || t.assignee_name);
    const createdBy = t.created_by || 'Sin especificar';
    const createdByAvatar = t.created_by_avatar_url || null;
    const showAssigneeDropdown = estadoTareas.showAssigneeDropdown;

    overlay.style.display = 'flex';

    panel.innerHTML = `
        <div class="task-detail-panel__inner">
            <div class="task-detail-header">
                <div>
                    <h2 class="task-detail-header__title">Detalle de la tarea</h2>
                    <p class="task-detail-header__subtitle">Si haces algún cambio, quedará aplicado inmediatamente.</p>
                </div>
                <button type="button" class="task-detail-close" id="task-detail-close" aria-label="Cerrar">
                    <i class="far fa-times"></i>
                </button>
            </div>

            <div class="task-detail-body">
                <div class="task-detail-main">
                    <div class="task-detail-section task-detail-section--has-dropdown">
                        <h3 class="task-detail-section__title">Asignado a:</h3>
                        <div class="task-detail-assignee-select" id="task-detail-assignee-trigger" role="button" tabindex="0">
                            ${hasAssignee ? `
                                <div class="task-detail-assignee-avatar">
                                    ${assigneeAvatar ? `<img src="${escapeTaskHtml(assigneeAvatar)}" alt="" class="task-detail-assignee-avatar-img" />` : assigneeName.substring(0, 2).toUpperCase()}
                                </div>
                                <span class="task-detail-assignee-text">${escapeTaskHtml(assigneeName)}</span>
                            ` : `
                                <div class="task-detail-assignee-avatar task-detail-assignee-avatar--empty">
                                    <i class="far fa-user"></i>
                                </div>
                                <span class="task-detail-assignee-text">Sin asignar</span>
                            `}
                            <i class="far fa-chevron-down task-detail-assignee-chevron"></i>
                        </div>
                        ${showAssigneeDropdown ? `
                            <div class="task-detail-dropdown" id="task-detail-assignee-dropdown">
                                <div class="task-detail-dropdown-item" data-assign="none">
                                    <i class="far fa-user"></i>
                                    <span>Sin asignar</span>
                                </div>
                                ${usuariosEjemplo.map(u => {
                                    const name = u.full_name || u.email.split('@')[0];
                                    const avatar = u.avatar_url ? `<img src="${escapeTaskHtml(u.avatar_url)}" alt="" class="task-detail-dropdown-avatar" />` : '';
                                    return `
                                    <div class="task-detail-dropdown-item" data-assign-id="${u.id}" data-assign-email="${escapeTaskHtml(u.email)}" data-assign-name="${escapeTaskHtml(name)}" data-assign-avatar="${escapeTaskHtml(u.avatar_url || '')}">
                                        ${avatar ? `<div class="task-detail-dropdown-item-avatar">${avatar}</div>` : ''}
                                        <span>${escapeTaskHtml(name)}</span>
                                    </div>
                                `}).join('')}
                            </div>
                        ` : ''}
                    </div>

                    <div class="task-detail-section">
                        <h3 class="task-detail-section__title">Creada por:</h3>
                        <div class="task-detail-created-by-row">
                            <div class="task-detail-created-by-avatar">
                                ${createdByAvatar ? `<img src="${escapeTaskHtml(createdByAvatar)}" alt="" class="task-detail-created-by-avatar-img" />` : escapeTaskHtml(createdBy.substring(0, 2).toUpperCase())}
                            </div>
                            <span class="task-detail-created-by-text">${escapeTaskHtml(createdBy)}</span>
                        </div>
                    </div>

                    <div class="task-detail-section">
                        <label class="task-detail-label">Nombre <span class="task-detail-label-required">*</span></label>
                        <div class="task-detail-name-wrap">
                            <input type="text" id="task-detail-name" class="task-detail-name-input" placeholder="Nombre de la tarea" value="${escapeTaskHtml(taskName)}" maxlength="250" />
                            <span class="task-detail-char-count"><span id="task-detail-char-count">${(taskName || '').length}</span>/250</span>
                        </div>
                    </div>

                    <div class="task-detail-section">
                        <label class="task-detail-label">Descripción</label>
                        <textarea id="task-detail-desc" class="task-detail-textarea" rows="4" placeholder="Nombre de la tarea">${escapeTaskHtml(desc)}</textarea>
                    </div>

                    <div class="task-detail-section">
                        <label class="task-detail-label">Fecha de finalización</label>
                        <div class="task-detail-date-wrap">
                            <input type="date" id="task-detail-date" class="task-detail-date-input" value="${escapeTaskHtml(endDate)}" />
                        </div>
                    </div>

                    <div class="task-detail-info-box">
                        <i class="far fa-info-circle task-detail-info-icon"></i>
                        <div>
                            <p class="task-detail-info-title">Asocia la tarea a un plan</p>
                            <p class="task-detail-info-text">Así podrás mantener todo en un solo lugar y hacerle un mejor seguimiento.</p>
                        </div>
                    </div>

                    <div class="task-detail-section">
                        <label class="task-detail-label">Mover tarea a un plan:</label>
                        <div class="task-detail-select-wrap">
                            <i class="far fa-search task-detail-select-icon"></i>
                            <span class="task-detail-select-placeholder">Selecciona un plan existente</span>
                        </div>
                    </div>

                    <div class="task-detail-section task-detail-section--tags">
                        <span class="task-detail-status-badge ${statusClass}">${escapeTaskHtml(statusDisplay)}</span>
                        <button type="button" class="task-detail-priority-btn" id="task-detail-priority-btn">
                            <i class="far fa-flag"></i>
                            <span>${escapeTaskHtml(priorityLabel)}</span>
                        </button>
                        <div class="task-detail-role-wrap">
                            <button type="button" class="task-detail-role-btn ${estadoTareas.showRoleDropdown ? 'task-detail-role-btn--open' : ''}" id="task-detail-role-btn">
                                <i class="far fa-id-card"></i>
                                <span>${escapeTaskHtml(roleLabel)}</span>
                                <i class="far fa-chevron-down"></i>
                            </button>
                            ${estadoTareas.showRoleDropdown ? `
                                <div class="task-detail-dropdown task-detail-dropdown--role" id="task-detail-role-dropdown">
                                    <div class="task-detail-dropdown-item ${role === 'colaborador' ? 'task-detail-dropdown-item--selected' : ''}" data-role="colaborador">Colaborador</div>
                                    <div class="task-detail-dropdown-item ${role === 'administrador' ? 'task-detail-dropdown-item--selected' : ''}" data-role="administrador">Administrador</div>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>

                <div class="task-detail-sidebar">
                    <div class="task-detail-sidebar-header">
                        <div>
                            <h3 class="task-detail-sidebar__title">Comentarios y evidencias</h3>
                            <p class="task-detail-sidebar__subtitle">Mira el historial de esta tarea</p>
                        </div>
                        <button type="button" class="task-detail-btn-add">
                            <i class="far fa-plus"></i>
                            <span>Agregar comentarios</span>
                        </button>
                    </div>
                    <div class="task-detail-sidebar-content">
                        <!-- Comentarios se cargarán aquí -->
                    </div>
                </div>
            </div>

            <div class="task-detail-footer">
                <button type="button" class="task-detail-footer-btn task-detail-footer-btn--delete" id="task-detail-delete">
                    Eliminar
                </button>
                <button type="button" class="task-detail-footer-btn task-detail-footer-btn--finish" id="task-detail-finish">
                    Finalizar tarea
                </button>
            </div>
        </div>
    `;

    const closeBtn = document.getElementById('task-detail-close');
    const nameEl = document.getElementById('task-detail-name');
    const charCountEl = document.getElementById('task-detail-char-count');
    const descEl = document.getElementById('task-detail-desc');
    const dateEl = document.getElementById('task-detail-date');
    const priorityBtn = document.getElementById('task-detail-priority-btn');
    const deleteBtn = document.getElementById('task-detail-delete');
    const finishBtn = document.getElementById('task-detail-finish');

    if (closeBtn) closeBtn.addEventListener('click', closeTaskDetail);
    overlay.onclick = (ev) => { if (ev.target === overlay) closeTaskDetail(); };

    if (nameEl) {
        nameEl.addEventListener('input', () => {
            estadoTareas.editingTask.name = nameEl.value;
            if (estadoTareas.selectedTask) estadoTareas.selectedTask.name = nameEl.value;
            if (charCountEl) charCountEl.textContent = nameEl.value.length;
        });
    }
    if (descEl) descEl.addEventListener('input', () => {
        estadoTareas.editingTask.description = descEl.value;
        if (estadoTareas.selectedTask) estadoTareas.selectedTask.description = descEl.value;
    });
    if (dateEl) dateEl.addEventListener('change', () => {
        estadoTareas.editingTask.endDate = dateEl.value;
        if (estadoTareas.selectedTask) estadoTareas.selectedTask.endDate = dateEl.value;
    });
    if (priorityBtn) {
        priorityBtn.addEventListener('click', () => {
            const priorities = ['baja', 'media', 'alta'];
            const idx = priorities.indexOf(estadoTareas.selectedTask?.priority || 'media');
            const next = priorities[(idx + 1) % 3];
            estadoTareas.editingTask.priority = next;
            if (estadoTareas.selectedTask) estadoTareas.selectedTask.priority = next;
            const labels = { baja: 'Prioridad Baja', media: 'Prioridad Media', alta: 'Prioridad Alta' };
            priorityBtn.querySelector('span').textContent = labels[next];
            renderTaskDetailModal();
        });
    }

    const assigneeTrigger = document.getElementById('task-detail-assignee-trigger');
    if (assigneeTrigger) {
        assigneeTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            estadoTareas.showAssigneeDropdown = !estadoTareas.showAssigneeDropdown;
            estadoTareas.showRoleDropdown = false;
            renderTaskDetailModal();
        });
    }

    document.querySelectorAll('#task-detail-assignee-dropdown .task-detail-dropdown-item').forEach(el => {
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            const assign = el.dataset.assign;
            if (assign === 'none') {
                if (estadoTareas.selectedTask) {
                    estadoTareas.selectedTask.assignee_email = null;
                    estadoTareas.selectedTask.assignee_name = null;
                    estadoTareas.selectedTask.assignee_avatar_url = null;
                }
            } else {
                const email = el.dataset.assignEmail;
                const name = el.dataset.assignName;
                const avatar = el.dataset.assignAvatar || null;
                if (estadoTareas.selectedTask) {
                    estadoTareas.selectedTask.assignee_email = email;
                    estadoTareas.selectedTask.assignee_name = name;
                    estadoTareas.selectedTask.assignee_avatar_url = avatar || null;
                }
            }
            estadoTareas.showAssigneeDropdown = false;
            renderTaskDetailModal();
        });
    });

    const roleBtn = document.getElementById('task-detail-role-btn');
    if (roleBtn) {
        roleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            estadoTareas.showRoleDropdown = !estadoTareas.showRoleDropdown;
            estadoTareas.showAssigneeDropdown = false;
            renderTaskDetailModal();
        });
    }

    document.querySelectorAll('#task-detail-role-dropdown .task-detail-dropdown-item').forEach(el => {
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            const r = el.dataset.role;
            estadoTareas.editingTask.role = r;
            if (estadoTareas.selectedTask) estadoTareas.selectedTask.role = r;
            estadoTareas.showRoleDropdown = false;
            renderTaskDetailModal();
        });
    });

    if (deleteBtn) deleteBtn.addEventListener('click', () => {
        if (estadoTareas.selectedTask && confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
            handleDelete(estadoTareas.selectedTask.id);
            closeTaskDetail();
            renderTareasVencidas();
            renderAllTasks();
        }
    });

    if (finishBtn) finishBtn.addEventListener('click', () => {
        if (estadoTareas.selectedTask) {
            estadoTareas.selectedTask.done = !estadoTareas.selectedTask.done;
            estadoTareas.selectedTask.status = estadoTareas.selectedTask.done ? 'Finalizado' : 'Activo';
            closeTaskDetail();
            renderTareasVencidas();
            renderAllTasks();
        }
    });

    if (window._taskDetailEscHandler) {
        document.removeEventListener('keydown', window._taskDetailEscHandler);
    }
    window._taskDetailEscHandler = (ev) => {
        if (ev.key === 'Escape' && estadoTareas.showTaskDetail) {
            document.removeEventListener('keydown', window._taskDetailEscHandler);
            closeTaskDetail();
        }
    };
    document.addEventListener('keydown', window._taskDetailEscHandler);
}

// Inicializar editingTask cuando se abre el detalle
function handleTaskClick(tareaId) {
    let tarea = tareasEjemplo.vencidas.find(t => t.id === tareaId);
    if (!tarea) {
        for (const fechaKey in tareasEjemplo.porDia) {
            tarea = tareasEjemplo.porDia[fechaKey].find(t => t.id === tareaId);
            if (tarea) break;
        }
    }

    if (tarea) {
        estadoTareas.selectedTask = tarea;
        estadoTareas.showTaskDetail = true;
        estadoTareas.editingTask = {
            name: tarea.name || '',
            description: tarea.description || '',
            endDate: tarea.endDate || '',
            priority: tarea.priority || 'media',
            role: tarea.role || 'colaborador'
        };
        renderTaskDetailModal();
    }
}

// Exportar función de inicialización
window.initTareasView = initTareasView;
