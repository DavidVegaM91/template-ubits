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

// Resolver nombre y avatar del asignado desde la BD (igual que tareas.js: usuario actual, jefes, empleados).
function getAssigneeDisplayForPlanDetail(t) {
    var email = (t.assignee_email && String(t.assignee_email).trim()) ? String(t.assignee_email).trim() : '';
    // Usar datos ya presentes en la tarea (p. ej. planes grupales enriquecidos)
    if (t.assignee_name && String(t.assignee_name).trim()) {
        var name = String(t.assignee_name).trim();
        var avatar = (t.assignee_avatar_url && String(t.assignee_avatar_url).trim()) ? String(t.assignee_avatar_url).trim() : null;
        return { name: name, avatar: avatar };
    }
    var currentUser = (typeof TAREAS_PLANES_DB !== 'undefined' && typeof TAREAS_PLANES_DB.getUsuarioActual === 'function') ? TAREAS_PLANES_DB.getUsuarioActual() : null;
    var emailLower = (email || '').toLowerCase();
    if (currentUser && emailLower && ((currentUser.username || '').toLowerCase() === emailLower || (currentUser.email && currentUser.email.toLowerCase() === emailLower))) {
        return { name: currentUser.nombre || email.split('@')[0], avatar: currentUser.avatar || null };
    }
    if (!email) return { name: 'Sin asignar', avatar: null };
    var jefes = (typeof TAREAS_PLANES_DB !== 'undefined' && typeof TAREAS_PLANES_DB.getJefesEjemplo === 'function') ? TAREAS_PLANES_DB.getJefesEjemplo() : [];
    var empleados = (typeof TAREAS_PLANES_DB !== 'undefined' && typeof TAREAS_PLANES_DB.getEmpleadosEjemplo === 'function') ? TAREAS_PLANES_DB.getEmpleadosEjemplo() : [];
    var person = (jefes || []).find(function (e) { return (e.username || '').toLowerCase() === emailLower; }) || (empleados || []).find(function (e) { return (e.username || '').toLowerCase() === emailLower; });
    if (person) return { name: person.nombre || email.split('@')[0], avatar: person.avatar || null };
    return { name: email.split('@')[0], avatar: null };
}

function getAssigneeForPlanDetail(t) {
    return getAssigneeDisplayForPlanDetail(t);
}

function getPlanesParaDropdown() {
    if (typeof TAREAS_PLANES_DB !== 'undefined' && typeof TAREAS_PLANES_DB.getPlanesVistaPlanes === 'function') {
        var plans = TAREAS_PLANES_DB.getPlanesVistaPlanes();
        return plans.map(function (p) { return { id: String(p.id), name: p.name || p.title || ('Plan ' + p.id) }; });
    }
    return [];
}
function getUsuariosParaDropdown() {
    if (typeof TAREAS_PLANES_DB !== 'undefined' && typeof TAREAS_PLANES_DB.getEmpleadosEjemplo === 'function') {
        var emp = TAREAS_PLANES_DB.getEmpleadosEjemplo();
        return emp.map(function (e, i) { return { id: String(e.id || i), email: e.username || '', full_name: e.nombre || '', avatar_url: e.avatar || null }; });
    }
    return [];
}

function openTaskDetailPanel(task) {
    if (!task) return;
    try {
        sessionStorage.setItem('task_detail_fallback', JSON.stringify({
            id: task.id,
            name: task.name,
            description: task.description || null,
            status: task.status,
            priority: task.priority || 'media',
            endDate: task.endDate || null,
            assignee_name: task.assignee_name || null,
            assignee_avatar_url: task.assignee_avatar_url || null,
            assignee_email: task.assignee_email || null,
            created_by: task.created_by || null,
            created_by_avatar_url: task.created_by_avatar_url || null,
            planId: task.planId || null,
            planNombre: task.planNombre || null
        }));
    } catch (e) { /* sessionStorage no disponible */ }
    window.location.href = 'task-detail.html?id=' + encodeURIComponent(task.id);
}

function getPlanIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

// Cache local por plan (para mutaciones cuando se usa BD unificada)
window.planDetailTasksCache = window.planDetailTasksCache || {};
window.planDetailPlanCache = window.planDetailPlanCache || {};

function getTasksForPlan(planId) {
    if (!planId) return [];
    if (window.planDetailTasksCache && window.planDetailTasksCache[planId]) return window.planDetailTasksCache[planId];
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

    const statusText = plan.status === 'Activo' ? 'Por hacer' : (plan.status || 'Por hacer');
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
        var ordered = tasks.slice().sort(function (a, b) {
            if (a.done !== b.done) return (a.done ? 1 : 0) - (b.done ? 1 : 0);
            if (a.done && b.done) return (a._justFinalized ? 0 : 1) - (b._justFinalized ? 0 : 1);
            return 0;
        });
        const html = ordered.map(t => window.renderTaskStrip(t, { today, formatDate: formatDateForDisplayDDMM, escapeHtml, getAssignee: getAssigneeForPlanDetail, renderAvatar: typeof renderAvatar === 'function' ? renderAvatar : undefined, esVencidaSection: vencidas.some(v => v.id === t.id) })).join('');
        if (tasksListEl) tasksListEl.innerHTML = html;
        attachTaskListeners();
        if (typeof initTooltip === 'function') initTooltip('[data-tooltip]');
    }
}

function handlePlanDetailListClick(e) {
    const planId = getPlanIdFromUrl();
    const tasks = getTasksForPlan(planId);
    if (!planId || !tasks.length) return;

    // Toggle hecho (checkbox): misma regla que tareas.html — orden (pendientes primero, finalizadas al final) y animación al mover
    if (e.target.closest('.tarea-done-radio')) {
        e.preventDefault();
        const control = e.target.closest('.tarea-done-radio');
        const input = control && control.querySelector('input.ubits-checkbox__input');
        if (input && input.dataset.tareaId) {
            const id = input.dataset.tareaId;
            const t = tasks.find(x => String(x.id) === String(id));
            if (t) {
                var wasDone = t.done;
                t.done = !t.done;
                t.status = t.done ? 'Finalizado' : 'Activo';
                if (t.done) t._justFinalized = true;
                else t._justFinalized = false;
                input.checked = t.done;
                var listEl = document.getElementById('plan-detail-tasks-list');
                var row = control.closest('.tarea-item');
                var oldRect = (row && t.done) ? row.getBoundingClientRect() : null;
                renderPlanDetail(planId);
                if (t.done && oldRect && listEl) {
                    var newRow = listEl.querySelector('.tarea-item[data-tarea-id="' + id + '"]');
                    if (newRow) {
                        var newRect = newRow.getBoundingClientRect();
                        var deltaY = oldRect.top - newRect.top;
                        if (Math.abs(deltaY) > 2) {
                            newRow.style.transition = 'none';
                            newRow.style.transform = 'translateY(' + deltaY + 'px)';
                            newRow.offsetHeight;
                            newRow.style.transition = 'transform 1s ease-out';
                            newRow.style.transform = '';
                            newRow.addEventListener('transitionend', function onEnd() {
                                newRow.style.transition = '';
                                newRow.removeEventListener('transitionend', onEnd);
                                if (t) t._justFinalized = false;
                            }, { once: true });
                        } else {
                            if (t) t._justFinalized = false;
                        }
                    } else {
                        if (t) t._justFinalized = false;
                    }
                } else if (!t.done && t) {
                    t._justFinalized = false;
                }
            }
        }
        return;
    }

    // Eliminar
    if (e.target.closest('.tarea-action-btn--delete')) {
        e.preventDefault();
        e.stopPropagation();
        const btn = e.target.closest('.tarea-action-btn--delete');
        const id = btn && btn.dataset.tareaId;
        if (id && confirm('¿Eliminar esta tarea?')) {
            const i = tasks.findIndex(t => String(t.id) === String(id));
            if (i >= 0) tasks.splice(i, 1);
            renderPlanDetail(planId);
        }
        return;
    }

    // Prioridad: abrir dropdown y actualizar prioridad de la tarea
    if (e.target.closest('.tarea-priority-badge') && typeof window.getDropdownMenuHtml === 'function' && typeof window.openDropdownMenu === 'function' && typeof window.closeDropdownMenu === 'function') {
        e.preventDefault();
        e.stopPropagation();
        const badge = e.target.closest('.tarea-priority-badge');
        const id = badge && (badge.dataset.tareaId || badge.getAttribute('data-tarea-id'));
        if (!id) return;
        const task = tasks.find(t => String(t.id) === String(id));
        if (!task) return;
        const overlayId = 'plan-detail-strip-priority-overlay-' + id;
        let overlayEl = document.getElementById(overlayId);
        if (overlayEl) overlayEl.remove();
        const options = [
            { text: 'Baja', value: 'baja', leftIcon: 'chevron-down' },
            { text: 'Media', value: 'media', leftIcon: 'chevron-up' },
            { text: 'Alta', value: 'alta', leftIcon: 'chevrons-up' }
        ];
        const html = window.getDropdownMenuHtml({ overlayId: overlayId, options: options });
        document.body.insertAdjacentHTML('beforeend', html);
        overlayEl = document.getElementById(overlayId);
        if (!overlayEl) return;
        overlayEl.style.zIndex = '10100';
        const priorityLabels = { alta: 'Alta', media: 'Media', baja: 'Baja' };
        overlayEl.querySelectorAll('.ubits-dropdown-menu__option').forEach(function (btn) {
            btn.addEventListener('click', function (ev) {
                ev.stopPropagation();
                const val = btn.getAttribute('data-value');
                if (val) {
                    task.priority = val;
                    renderPlanDetail(planId);
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

    // Abrir detalle: botón Detalles o clic en la fila (evitando radio y botones)
    if (e.target.closest('.tarea-action-btn--details')) {
        e.preventDefault();
        e.stopPropagation();
        const btn = e.target.closest('.tarea-action-btn--details');
        const id = btn && (btn.dataset.tareaId || btn.getAttribute('data-tarea-id'));
        if (id) {
            const task = tasks.find(t => String(t.id) === String(id));
            if (task) openTaskDetailPanel(task);
        }
        return;
    }

    const item = e.target.closest('.tarea-item');
    if (item && !e.target.closest('.tarea-done-radio') && !e.target.closest('.tarea-action-btn') && !e.target.closest('.tarea-priority-badge')) {
        e.preventDefault();
        const id = item.dataset.tareaId || item.getAttribute('data-tarea-id');
        if (id) {
            const task = tasks.find(t => String(t.id) === String(id));
            if (task) openTaskDetailPanel(task);
        }
    }
}

function attachTaskListeners() {
    const listEl = document.getElementById('plan-detail-tasks-list');
    if (!listEl) return;
    if (listEl._planDetailClickBound) return;
    listEl._planDetailClickBound = true;
    listEl.addEventListener('click', handlePlanDetailListClick);
}

function initPlanDetail() {
    const planId = getPlanIdFromUrl();
    if (!planId) {
        window.location.href = 'planes.html';
        return;
    }

    // Enlazar clics de la lista de tareas ANTES de renderizar (así funciona al llegar desde seguimiento)
    attachTaskListeners();

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
