/* ========================================
   VISTA DETALLE DEL PLAN
   Basado en plan-detail.tsx. Datos: solo tareas-base-unificada.js (TAREAS_PLANES_DB).
   ======================================== */

// Utilidades de fecha (usa fecha real de BD unificada si está cargada)
const pad = (n) => String(n).padStart(2, '0');
const getTodayString = () => {
    if (typeof TAREAS_PLANES_DB !== 'undefined' && TAREAS_PLANES_DB.getTodayString)
        return TAREAS_PLANES_DB.getTodayString();
    const now = new Date();
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};
let today = getTodayString();

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
                    <button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only tarea-action-btn tarea-action-btn--add-plan" title="Mover tarea">
                        <i class="far fa-layer-group"></i>
                    </button>
                    <button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only tarea-priority-btn ${prioridadClass}" title="Prioridad">
                        <i class="far fa-chevron-up"></i>
                    </button>
                    <div class="tarea-assigned">
                        ${typeof renderAvatar === 'function' ? renderAvatar({ nombre: tarea.assignee_name || tarea.assignee_email || '', avatar: tarea.assignee_avatar_url || null }, { size: 'sm' }) : (tarea.assignee_email ? `<div class="tarea-assigned-avatar-initials">${escapeHtml(tarea.assignee_email.substring(0, 2).toUpperCase())}</div>` : `<div class="tarea-assigned-placeholder"><i class="far fa-user"></i></div>`)}
                    </div>
                    <button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only tarea-action-btn tarea-action-btn--delete" title="Eliminar" data-tarea-id="${tarea.id}">
                        <i class="far fa-trash"></i>
                    </button>
                    <button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only tarea-action-btn tarea-action-btn--details" title="Detalles" data-tarea-id="${tarea.id}">
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

// Cache local por plan (para mutaciones cuando se usa BD unificada)
window.planDetailTasksCache = window.planDetailTasksCache || {};
window.planDetailPlanCache = window.planDetailPlanCache || {};

function getTasksForPlan(planId) {
    if (window.planDetailTasksCache[planId]) return window.planDetailTasksCache[planId];
    if (typeof TAREAS_PLANES_DB !== 'undefined' && typeof TAREAS_PLANES_DB.getTareasPorPlan === 'function')
        return TAREAS_PLANES_DB.getTareasPorPlan(planId) || [];
    return [];
}

function loadPlanAndTasks(planId) {
    let plan, tasks;
    const db = typeof TAREAS_PLANES_DB !== 'undefined' ? TAREAS_PLANES_DB : null;
    if (db && typeof db.getPlanDetalle === 'function' && typeof db.getTareasPorPlan === 'function') {
        if (!window.planDetailPlanCache[planId]) {
            plan = db.getPlanDetalle(planId);
            window.planDetailPlanCache[planId] = plan ? Object.assign({}, plan) : { name: 'Plan ' + planId, description: 'Sin datos.', created_by: '', end_date: null, status: 'Activo' };
            tasks = db.getTareasPorPlan(planId) || [];
            window.planDetailTasksCache[planId] = tasks.map(t => Object.assign({}, t));
        }
        plan = window.planDetailPlanCache[planId];
        tasks = window.planDetailTasksCache[planId] || [];
    } else {
        plan = { name: 'Plan ' + planId, description: 'Sin datos. Cargue tareas-base-unificada.js.', created_by: '', end_date: null, status: 'Activo' };
        tasks = [];
    }
    today = getTodayString();
    return { plan, tasks };
}

function renderPlanDetail(planId) {
    const { plan, tasks } = loadPlanAndTasks(planId);

    const headerTitleEl = document.querySelector('#header-product-container .ubits-header-product__product-title h2');
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

    if (headerTitleEl) headerTitleEl.textContent = (plan.name || 'Plan') + ':';
    if (cardEl) cardEl.style.display = 'block';
    if (tasksCardEl) tasksCardEl.style.display = 'block';

    if (descEl) descEl.textContent = plan.description || 'Sin descripción';
    const createdByEl = document.getElementById('plan-detail-created-by');
    if (createdByEl) createdByEl.textContent = plan.created_by || 'Sin especificar';
    if (countEl) countEl.textContent = `Tareas finalizadas ${tasks.filter(t => t.done).length}/${tasks.length}`;

    const progress = tasks.length > 0 ? Math.round((tasks.filter(t => t.done).length / tasks.length) * 100) : 0;
    if (barEl) barEl.style.width = progress + '%';
    if (percentEl) percentEl.textContent = progress + '%';

    const endDateStr = plan.end_date ? plan.end_date.split('T')[0] : null;
    const dateDisplay = endDateStr ? formatDateForDisplayDDMM(endDateStr).replace(/-/g, '/') : '';
    if (dateEl) dateEl.value = dateDisplay;

    const statusText = plan.status || 'Activo';
    const statusVariant = plan.status === 'Activo' ? 'info' : plan.status === 'Vencido' ? 'error' : 'success';
    if (statusEl) {
        statusEl.className = 'ubits-status-tag ubits-status-tag--sm ubits-status-tag--' + statusVariant;
        const textEl = statusEl.querySelector('.ubits-status-tag__text');
        if (textEl) textEl.textContent = statusText;
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
            const tasks = getTasksForPlan(planId);
            if (!planId || !tasks.length) return;
            const t = tasks.find(x => String(x.id) === id);
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
            const tasks = getTasksForPlan(planId);
            if (planId && tasks.length && confirm('¿Eliminar esta tarea?')) {
                const i = tasks.findIndex(t => String(t.id) === id);
                if (i >= 0) tasks.splice(i, 1);
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

    const finalizarBtn = document.getElementById('plan-detail-finalizar');
    if (finalizarBtn) {
        finalizarBtn.addEventListener('click', () => {
            const plan = (window.planDetailPlanCache && window.planDetailPlanCache[planId]) || loadPlanAndTasks(planId).plan;
            if (plan) { plan.status = 'Finalizado'; renderPlanDetail(planId); }
        });
    }

    const addTaskBtn = document.getElementById('plan-detail-add-task-btn');
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', () => {
            const tasks = getTasksForPlan(planId);
            if (tasks) {
                const name = prompt('Nombre de la tarea:', 'Nueva tarea') || 'Nueva tarea';
                const newId = 9000 + Date.now() % 1000;
                tasks.push({ id: newId, name: name.trim() || 'Nueva tarea', done: false, status: 'Activo', endDate: null, priority: 'media', assignee_email: null, etiqueta: null });
                renderPlanDetail(planId);
            }
        });
    }

    renderPlanDetail(planId);
}
