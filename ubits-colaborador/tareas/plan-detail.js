/* ========================================
   VISTA DETALLE DEL PLAN
   Basado en plan-detail.tsx
   La tirilla de tareas es igual a la del tab de tareas
   ======================================== */

// Utilidades de fecha
const pad = (n) => String(n).padStart(2, '0');
const getTodayString = () => {
    const now = new Date();
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};
const today = getTodayString();

function formatDateForDisplayDDMM(dateString) {
    if (!dateString) return null;
    const [year, month, day] = dateString.split('-').map(Number);
    return `${pad(day)}-${pad(month)}-${year}`;
}

function escapeHtml(str) {
    if (str == null || str === '') return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Planes con descripción (para detalle) - IDs deben coincidir con planesEjemplo en planes.js
const planesDetalle = {
    '1': { name: 'Plan dayli', description: 'Plan de tareas diarias para seguimiento.', created_by: 'Maria Fernanda Ramirez Barrera', end_date: null, status: 'Activo' },
    '2': { name: 'Plan dayli', description: 'Plan de tareas diarias.', created_by: 'Maria Fernanda Ramirez Barrera', end_date: null, status: 'Activo' },
    '3': { name: 'Plan dayli', description: 'Plan de tareas diarias.', end_date: null, status: 'Activo' },
    '4': { name: 'Proyecto lanzamiento de una evaluación', description: 'Proyecto para el lanzamiento de evaluaciones.', end_date: '2026-01-31', status: 'Vencido' },
    '5': { name: 'Onboarding externos flota - Ciclo 1', description: 'Proceso de onboarding para externos.', end_date: '2026-01-31', status: 'Vencido' },
    '6': { name: 'Checklist operativo ciclo 1 - enero', description: 'Checklist operativo del primer ciclo.', end_date: '2026-01-31', status: 'Vencido' },
    '7': { name: 'Plan de capacitación Q1', description: 'Capacitaciones del primer trimestre.', end_date: '2026-03-15', status: 'Activo' },
    '8': { name: 'Plan de onboarding 2026', description: 'Onboarding de nuevos colaboradores.', end_date: '2026-02-28', status: 'Activo' },
    '23': { name: 'Checklist operativo ciclo 1', description: 'Checklist completado.', end_date: '2025-12-28', status: 'Finalizado' },
    '24': { name: 'Checklist operativo ciclo 1', description: 'Checklist completado.', end_date: null, status: 'Finalizado' },
    '25': { name: 'Plan de capacitación T&P', description: 'Capacitación T&P completada.', end_date: '2025-10-30', status: 'Finalizado' },
    '26': { name: 'Plan de Onboarding - Ventas', description: 'Onboarding equipo de ventas.', end_date: '2025-11-30', status: 'Finalizado' }
};

// Tareas por plan (simular API) - estructura igual a tareas del tab
const tareasPorPlan = {
    '1': [
        { id: 101, name: 'tarea 2', done: false, status: 'Activo', endDate: null, priority: 'media', assignee_email: null, etiqueta: null },
        { id: 102, name: 'tarea 1', done: false, status: 'Activo', endDate: null, priority: 'baja', assignee_email: null, etiqueta: null }
    ],
    '4': [
        { id: 401, name: 'Responde la evaluación "360 Talent Experience"', done: false, status: 'Vencido', endDate: '2025-12-31', priority: 'media', assignee_email: null, etiqueta: null },
        { id: 402, name: 'Revisar resultados de evaluación', done: false, status: 'Activo', endDate: '2026-02-15', priority: 'alta', assignee_email: null, etiqueta: null }
    ],
    '5': [
        { id: 501, name: 'Completar documentación de ingreso', done: false, status: 'Vencido', endDate: '2026-01-31', priority: 'alta', assignee_email: null, etiqueta: null },
        { id: 502, name: 'Asistir a sesión de bienvenida', done: false, status: 'Activo', endDate: null, priority: 'media', assignee_email: null, etiqueta: null }
    ],
    '8': [
        { id: 801, name: 'Completar módulo 1 de inducción', done: true, status: 'Finalizado', endDate: '2026-02-15', priority: 'alta', assignee_email: null, etiqueta: null },
        { id: 802, name: 'Reunión con mentor asignado', done: false, status: 'Activo', endDate: '2026-02-20', priority: 'media', assignee_email: null, etiqueta: null }
    ],
    '23': [
        { id: 2301, name: 'Revisión de checklist', done: true, status: 'Finalizado', endDate: '2025-12-28', priority: 'media', assignee_email: null, etiqueta: null }
    ]
};

// Tirilla de tarea - IGUAL al tab de tareas (tarea-item)
function renderTarea(tarea, esVencida = false) {
    const fechaDisplay = tarea.endDate ? formatDateForDisplayDDMM(tarea.endDate) : null;
    const esVencidaReal = esVencida && tarea.endDate && tarea.endDate < today;
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
        <div class="tarea-item ${tarea.done ? 'tarea-item--completed' : ''} ${esVencidaReal ? 'tarea-item--overdue' : ''}" data-tarea-id="${tarea.id}">
            <div class="tarea-item__main">
                <span class="tarea-item__radio">
                    <div class="tarea-checkbox">
                        <input type="checkbox" ${tarea.done ? 'checked' : ''} id="tarea-pd-${tarea.id}" data-tarea-id="${tarea.id}">
                        <label for="tarea-pd-${tarea.id}"></label>
                    </div>
                </span>
                <div class="tarea-content">
                    <h3 class="tarea-titulo ubits-body-md-regular">${escapeHtml(tarea.name)}</h3>
                </div>
                ${tarea.etiqueta ? `
                    <div class="tarea-etiqueta">
                        <span class="tarea-etiqueta-text">${escapeHtml(tarea.etiqueta)}</span>
                    </div>
                ` : ''}
            </div>
            <div class="tarea-item__actions">
                <div class="tarea-status">
                    <span class="ubits-status-tag ubits-status-tag--${estadoTag} ubits-status-tag--sm">
                        <span class="ubits-status-tag__text">${escapeHtml(estadoTexto)}</span>
                    </span>
                </div>
                <div class="tarea-fecha ${!fechaDisplay ? 'tarea-fecha--sin-fecha' : ''} ${esVencidaReal ? 'tarea-fecha--overdue' : ''}">
                    ${fechaDisplay ? escapeHtml(fechaDisplay) : '<span>Sin fecha</span>'}
                </div>
                <div class="tarea-actions">
                    <button class="tarea-action-btn tarea-action-btn--add-plan" title="Mover tarea">
                        <i class="far fa-layer-group"></i>
                    </button>
                    <button class="tarea-action-btn tarea-priority-btn ${prioridadClass}" title="Prioridad">
                        <i class="far fa-chevron-up"></i>
                    </button>
                    <div class="tarea-assigned">
                        ${tarea.assignee_email ? `
                            <div class="tarea-assigned-avatar-initials">${escapeHtml(tarea.assignee_email.substring(0, 2).toUpperCase())}</div>
                        ` : `
                            <div class="tarea-assigned-placeholder">
                                <i class="far fa-user"></i>
                            </div>
                        `}
                    </div>
                    <button class="tarea-action-btn tarea-action-btn--delete" title="Eliminar" data-tarea-id="${tarea.id}">
                        <i class="far fa-trash"></i>
                    </button>
                    <button class="tarea-action-btn tarea-action-btn--details" title="Detalles" data-tarea-id="${tarea.id}">
                        <i class="far fa-chevron-right"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

function getPlanIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

function loadPlanAndTasks(planId) {
    const plan = planesDetalle[planId] || { name: 'Plan ' + planId, description: 'Descripción del plan.', created_by: 'Usuario', end_date: null, status: 'Activo' };
    const tasks = tareasPorPlan[planId] || [
        { id: 9001, name: 'Tarea de ejemplo', done: false, status: 'Activo', endDate: null, priority: 'media', assignee_email: null, etiqueta: null }
    ];
    return { plan, tasks };
}

function renderPlanDetail(planId) {
    const { plan, tasks } = loadPlanAndTasks(planId);

    const titleEl = document.getElementById('plan-detail-title');
    const cardEl = document.getElementById('plan-detail-card');
    const tasksCardEl = document.getElementById('plan-detail-tasks-card');
    const descEl = document.getElementById('plan-detail-desc');
    const countEl = document.getElementById('plan-detail-tasks-count');
    const barEl = document.getElementById('plan-detail-bar-fill');
    const percentEl = document.getElementById('plan-detail-percent');
    const dateEl = document.getElementById('plan-detail-end-date');
    const statusEl = document.getElementById('plan-detail-status');
    const tasksListEl = document.getElementById('plan-detail-tasks-list');
    const emptyEl = document.getElementById('plan-detail-empty');
    const countIniciadasEl = document.getElementById('plan-detail-count-iniciadas');
    const countVencidasEl = document.getElementById('plan-detail-count-vencidas');
    const countFinalizadasEl = document.getElementById('plan-detail-count-finalizadas');

    if (titleEl) titleEl.textContent = (plan.name || 'Plan') + ':';
    if (cardEl) cardEl.style.display = 'block';
    if (tasksCardEl) tasksCardEl.style.display = 'block';

    if (descEl) descEl.textContent = plan.description || 'Sin descripción';
    if (countEl) countEl.textContent = `Tareas finalizadas ${tasks.filter(t => t.done).length}/${tasks.length}`;

    const progress = tasks.length > 0 ? Math.round((tasks.filter(t => t.done).length / tasks.length) * 100) : 0;
    if (barEl) barEl.style.width = progress + '%';
    if (percentEl) percentEl.textContent = progress + '%';

    const endDateStr = plan.end_date ? plan.end_date.split('T')[0] : null;
    const dateDisplay = endDateStr ? formatDateForDisplayDDMM(endDateStr).replace(/-/g, '/') : '';
    if (dateEl) dateEl.value = dateDisplay;

    const statusText = plan.status || 'Activo';
    const statusClass = plan.status === 'Activo' ? 'plan-detail-card__status--activo' : plan.status === 'Vencido' ? 'plan-detail-card__status--vencido' : 'plan-detail-card__status--finalizado';
    if (statusEl) {
        statusEl.textContent = statusText;
        statusEl.className = 'plan-detail-card__status ' + statusClass;
    }

    const finalizarBtn = document.getElementById('plan-detail-finalizar');
    if (finalizarBtn) {
        finalizarBtn.style.display = plan.status === 'Finalizado' ? 'none' : '';
    }

    const vencidas = tasks.filter(t => t.endDate && t.endDate < today && !t.done);
    const iniciadas = tasks.filter(t => !t.done && !(t.endDate && t.endDate < today));
    const finalizadas = tasks.filter(t => t.done);
    if (countIniciadasEl) countIniciadasEl.textContent = iniciadas.length;
    if (countVencidasEl) countVencidasEl.textContent = vencidas.length;
    if (countFinalizadasEl) countFinalizadasEl.textContent = finalizadas.length;

    if (tasks.length === 0) {
        if (tasksListEl) tasksListEl.innerHTML = '';
        if (emptyEl) emptyEl.style.display = 'flex';
    } else {
        if (emptyEl) emptyEl.style.display = 'none';
        const html = tasks.map(t => renderTarea(t, vencidas.some(v => v.id === t.id))).join('');
        if (tasksListEl) tasksListEl.innerHTML = html;
        attachTaskListeners();
    }
}

function attachTaskListeners() {
    const listEl = document.getElementById('plan-detail-tasks-list');
    if (!listEl) return;

    listEl.querySelectorAll('.tarea-checkbox input').forEach(input => {
        input.addEventListener('change', (e) => {
            const id = e.target.dataset.tareaId;
            const planId = getPlanIdFromUrl();
            if (!planId || !tareasPorPlan[planId]) return;
            const t = tareasPorPlan[planId].find(x => String(x.id) === id);
            if (t) {
                t.done = e.target.checked;
                t.status = t.done ? 'Finalizado' : 'Activo';
                renderPlanDetail(planId);
            }
        });
    });

    listEl.querySelectorAll('.tarea-action-btn--details').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.tareaId;
            console.log('Ver detalle tarea:', id);
            // TODO: Abrir modal de detalle de tarea como en tareas tab
        });
    });

    listEl.querySelectorAll('.tarea-action-btn--delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = e.currentTarget.dataset.tareaId;
            const planId = getPlanIdFromUrl();
            if (planId && tareasPorPlan[planId] && confirm('¿Eliminar esta tarea?')) {
                tareasPorPlan[planId] = tareasPorPlan[planId].filter(t => String(t.id) !== id);
                renderPlanDetail(planId);
            }
        });
    });

    listEl.querySelectorAll('.tarea-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (e.target.closest('.tarea-checkbox') || e.target.closest('.tarea-action-btn')) return;
            const id = item.dataset.tareaId;
            console.log('Click tarea:', id);
        });
    });
}

function initPlanDetail() {
    const planId = getPlanIdFromUrl();
    if (!planId) {
        window.location.href = 'planes.html';
        return;
    }

    const backBtn = document.getElementById('plan-detail-back');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            if (window.history.length > 1) {
                window.history.back();
            } else {
                window.location.href = 'planes.html';
            }
        });
    }

    const finalizarBtn = document.getElementById('plan-detail-finalizar');
    if (finalizarBtn) {
        finalizarBtn.addEventListener('click', () => {
            const plan = planesDetalle[planId];
            if (plan) { plan.status = 'Finalizado'; renderPlanDetail(planId); }
        });
    }

    const addTaskBtn = document.getElementById('plan-detail-add-task-btn');
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', () => {
            if (tareasPorPlan[planId]) {
                const name = prompt('Nombre de la tarea:', 'Nueva tarea') || 'Nueva tarea';
                const newId = 9000 + Date.now() % 1000;
                tareasPorPlan[planId].push({ id: newId, name: name.trim() || 'Nueva tarea', done: false, status: 'Activo', endDate: null, priority: 'media', assignee_email: null, etiqueta: null });
                renderPlanDetail(planId);
            }
        });
    }

    renderPlanDetail(planId);
}
