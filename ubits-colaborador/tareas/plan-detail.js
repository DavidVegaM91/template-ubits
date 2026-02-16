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

var planDetailTaskDetailState = { selectedTask: null, editingTask: {} };

function closeTaskDetailPanel() {
    planDetailTaskDetailState.selectedTask = null;
    planDetailTaskDetailState.editingTask = {};
    ['task-detail-assignee-overlay', 'task-detail-role-overlay', 'task-detail-priority-overlay'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.remove();
    });
    var overlay = document.getElementById('task-detail-overlay');
    if (overlay) overlay.style.display = 'none';
}

function openTaskDetailPanel(task) {
    var overlay = document.getElementById('task-detail-overlay');
    var panel = document.getElementById('task-detail-panel');
    if (!overlay || !panel || !task) return;

    planDetailTaskDetailState.selectedTask = task;
    planDetailTaskDetailState.editingTask = {
        name: task.name || '',
        description: task.description || '',
        endDate: task.endDate || '',
        priority: task.priority || 'media',
        role: task.role || 'colaborador'
    };

    var t = task;
    var edit = planDetailTaskDetailState.editingTask;
    var taskName = edit.name !== undefined ? edit.name : (t.name || '');
    var desc = edit.description !== undefined ? edit.description : (t.description || '');
    var endDate = edit.endDate !== undefined ? edit.endDate : (t.endDate || '');
    var priority = edit.priority !== undefined ? edit.priority : (t.priority || 'media');
    var prioridadIcon = { alta: 'fa-chevrons-up', media: 'fa-chevron-up', baja: 'fa-chevron-down' };
    var prioridadBadgeVariant = { alta: 'error', media: 'warning', baja: 'info' };
    var priorityShortLabel = priority === 'alta' ? 'Alta' : priority === 'baja' ? 'Baja' : 'Media';
    var role = edit.role !== undefined ? edit.role : (t.role || 'colaborador');
    var roleLabel = role === 'administrador' ? 'Administrador' : 'Colaborador';
    var statusDisplay = t.status === 'Vencido' ? 'Vencida' : t.status === 'Activo' ? 'Iniciada' : 'Finalizada';
    var statusSlug = t.status === 'Vencido' ? 'error' : t.status === 'Activo' ? 'info' : 'success';
    var isFinalizada = t.status === 'Finalizado';
    var finishBtnLabel = isFinalizada ? 'Reabrir tarea' : 'Finalizar tarea';
    var finishBtnVariant = isFinalizada ? 'ubits-button--secondary' : 'ubits-button--primary';
    var assigneeResolved = getAssigneeDisplayForPlanDetail(t);
    var assigneeName = assigneeResolved.name || 'Sin asignar';
    var assigneeAvatar = assigneeResolved.avatar || null;
    var creatorResolved = (typeof TAREAS_PLANES_DB !== 'undefined' && typeof TAREAS_PLANES_DB.getCreatorDisplay === 'function')
        ? TAREAS_PLANES_DB.getCreatorDisplay(t.created_by || '')
        : { name: (t.created_by && String(t.created_by).trim()) ? String(t.created_by).trim() : 'Sin especificar', avatar: t.created_by_avatar_url || null };
    var createdBy = creatorResolved.name || 'Sin especificar';
    var createdByAvatar = creatorResolved.avatar || t.created_by_avatar_url || null;
    var taskInPlan = !!(t.planId || t.planNombre);
    var plansForAutocomplete = getPlanesParaDropdown();
    var taskPlanDisplayName = t.planNombre || (t.planId && plansForAutocomplete.length ? (plansForAutocomplete.find(function (p) { return String(p.id) === String(t.planId); }) || {}).name : null) || '';
    var hasComments = typeof t.comentarios === 'number' && t.comentarios > 0;
    var sidebarContentHtml = hasComments
        ? '<p class="ubits-body-sm-regular task-detail-sidebar-content__list-helper">Historial de comentarios (próximamente).</p>'
        : '<div id="task-detail-sidebar-empty-container"></div>';

    var panelData = {
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
        var emptyContainer = document.getElementById('task-detail-sidebar-empty-container');
        if (emptyContainer) {
            loadEmptyState('task-detail-sidebar-empty-container', {
                icon: 'fa-comment-dots',
                iconSize: 'md',
                title: 'Aún no hay comentarios',
                description: 'Aquí podrás ver el historial de comentarios y evidencias de esta tarea. Agrega el primero para empezar.',
                buttons: { secondary: { text: 'Agregar comentarios', icon: 'fa-plus', onClick: function () { if (typeof showToast === 'function') showToast('info', 'Próximamente: agregar comentario'); } } }
            });
        }
    }
    if (typeof renderSaveIndicator === 'function') renderSaveIndicator('task-detail-save-indicator', { state: 'idle', size: 'xs' });

    function endDateToDisplay(ymd) {
        if (!ymd || !String(ymd).trim()) return '';
        var parts = String(ymd).trim().split('-');
        if (parts.length !== 3) return ymd;
        return (parts[2].length === 1 ? '0' + parts[2] : parts[2]) + '/' + (parts[1].length === 1 ? '0' + parts[1] : parts[1]) + '/' + parts[0];
    }
    function displayToEndDate(dmy) {
        if (!dmy || !String(dmy).trim()) return '';
        var parts = String(dmy).trim().split('/');
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
            onChange: function (dateStr) {
                var ymd = displayToEndDate(dateStr);
                planDetailTaskDetailState.editingTask.endDate = ymd;
                if (planDetailTaskDetailState.selectedTask) planDetailTaskDetailState.selectedTask.endDate = ymd;
            }
        });
        var dateInput = document.querySelector('#task-detail-date-container .ubits-input');
        if (dateInput) dateInput.setAttribute('aria-labelledby', 'task-detail-date-label');
        createInput({
            containerId: 'task-detail-plan-container',
            type: 'autocomplete',
            label: 'Mover tarea a un plan',
            placeholder: 'Selecciona un plan existente',
            autocompleteOptions: plansForAutocomplete.map(function (p) { return { value: String(p.id), text: p.name }; }),
            value: taskPlanDisplayName,
            onChange: function (selectedValue) {
                var task = planDetailTaskDetailState.selectedTask;
                if (!task) return;
                if (!selectedValue || selectedValue === '') {
                    task.planId = null;
                    task.planNombre = null;
                } else {
                    var plan = plansForAutocomplete.find(function (p) { return String(p.id) === String(selectedValue); });
                    if (plan) { task.planId = plan.id; task.planNombre = plan.name; }
                }
                openTaskDetailPanel(task);
            }
        });
    }

    var closeBtn = document.getElementById('task-detail-close');
    var nameEl = document.getElementById('task-detail-name');
    var charCountEl = document.getElementById('task-detail-char-count');
    var descEl = document.getElementById('task-detail-desc');
    var priorityBtn = document.getElementById('task-detail-priority-btn');
    var assigneeTrigger = document.getElementById('task-detail-assignee-trigger');
    var roleBtn = document.getElementById('task-detail-role-btn');
    var deleteBtn = document.getElementById('task-detail-delete');
    var finishBtn = document.getElementById('task-detail-finish');

    if (closeBtn) closeBtn.addEventListener('click', closeTaskDetailPanel);
    overlay.onclick = function (ev) { if (ev.target === overlay) closeTaskDetailPanel(); };

    if (nameEl) {
        nameEl.addEventListener('input', function () {
            planDetailTaskDetailState.editingTask.name = nameEl.value;
            if (planDetailTaskDetailState.selectedTask) planDetailTaskDetailState.selectedTask.name = nameEl.value;
            if (charCountEl) charCountEl.textContent = nameEl.value.length;
        });
    }
    if (descEl) {
        descEl.addEventListener('input', function () {
            planDetailTaskDetailState.editingTask.description = descEl.value;
            if (planDetailTaskDetailState.selectedTask) planDetailTaskDetailState.selectedTask.description = descEl.value;
        });
    }

    if (priorityBtn && typeof window.getDropdownMenuHtml === 'function' && typeof window.openDropdownMenu === 'function' && typeof window.closeDropdownMenu === 'function') {
        priorityBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            var overlayId = 'task-detail-priority-overlay';
            var existing = document.getElementById(overlayId);
            if (existing) existing.remove();
            var options = [{ text: 'Baja', value: 'baja', leftIcon: 'chevron-down' }, { text: 'Media', value: 'media', leftIcon: 'chevron-up' }, { text: 'Alta', value: 'alta', leftIcon: 'chevrons-up' }];
            var config = { overlayId: overlayId, options: options };
            var html = window.getDropdownMenuHtml(config);
            document.body.insertAdjacentHTML('beforeend', html);
            var overlayEl = document.getElementById(overlayId);
            if (!overlayEl) return;
            overlayEl.style.zIndex = '10100';
            overlayEl.querySelectorAll('.ubits-dropdown-menu__option').forEach(function (btn) {
                btn.addEventListener('click', function (ev) {
                    ev.stopPropagation();
                    var val = btn.getAttribute('data-value');
                    if (val) {
                        planDetailTaskDetailState.editingTask.priority = val;
                        if (planDetailTaskDetailState.selectedTask) planDetailTaskDetailState.selectedTask.priority = val;
                    }
                    window.closeDropdownMenu(overlayId);
                    if (overlayEl.parentNode) overlayEl.remove();
                    openTaskDetailPanel(planDetailTaskDetailState.selectedTask);
                });
            });
            overlayEl.addEventListener('click', function (ev) { if (ev.target === overlayEl) { window.closeDropdownMenu(overlayId); if (overlayEl.parentNode) overlayEl.remove(); openTaskDetailPanel(planDetailTaskDetailState.selectedTask); } });
            window.openDropdownMenu(overlayId, priorityBtn);
        });
    }

    if (assigneeTrigger && typeof window.getDropdownMenuHtml === 'function' && typeof window.openDropdownMenu === 'function' && typeof window.closeDropdownMenu === 'function') {
        assigneeTrigger.addEventListener('click', function (e) {
            e.stopPropagation();
            var overlayId = 'task-detail-assignee-overlay';
            var existing = document.getElementById(overlayId);
            if (existing) existing.remove();
            var users = getUsuariosParaDropdown();
            var options = [{ text: 'Sin asignar', value: 'none', avatar: null }].concat(users.map(function (u) {
                return { text: u.full_name || u.email || '', value: String(u.id), avatar: u.avatar_url || null };
            }));
            var html = window.getDropdownMenuHtml({ overlayId: overlayId, hasAutocomplete: true, autocompletePlaceholder: 'Buscar...', options: options });
            document.body.insertAdjacentHTML('beforeend', html);
            var overlayEl = document.getElementById(overlayId);
            if (!overlayEl) return;
            overlayEl.style.zIndex = '10100';
            var optionButtons = overlayEl.querySelectorAll('.ubits-dropdown-menu__option');
            function closeAndApply() {
                window.closeDropdownMenu(overlayId);
                if (overlayEl.parentNode) overlayEl.remove();
                openTaskDetailPanel(planDetailTaskDetailState.selectedTask);
            }
            optionButtons.forEach(function (btn) {
                btn.addEventListener('click', function (ev) {
                    ev.stopPropagation();
                    var val = btn.getAttribute('data-value');
                    var task = planDetailTaskDetailState.selectedTask;
                    if (task) {
                        if (val === 'none') { task.assignee_email = null; task.assignee_name = null; task.assignee_avatar_url = null; }
                        else {
                            var user = users.find(function (u) { return String(u.id) === val; });
                            if (user) { task.assignee_email = user.email; task.assignee_name = user.full_name || user.email; task.assignee_avatar_url = user.avatar_url || null; }
                        }
                    }
                    closeAndApply();
                });
            });
            overlayEl.addEventListener('click', function (ev) { if (ev.target === overlayEl) closeAndApply(); });
            window.openDropdownMenu(overlayId, assigneeTrigger);
        });
    }

    if (roleBtn && typeof window.getDropdownMenuHtml === 'function' && typeof window.openDropdownMenu === 'function' && typeof window.closeDropdownMenu === 'function') {
        roleBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            var overlayId = 'task-detail-role-overlay';
            var existing = document.getElementById(overlayId);
            if (existing) existing.remove();
            var options = [{ text: 'Colaborador', value: 'colaborador', selected: role === 'colaborador' }, { text: 'Administrador', value: 'administrador', selected: role === 'administrador' }];
            var html = window.getDropdownMenuHtml({ overlayId: overlayId, options: options });
            document.body.insertAdjacentHTML('beforeend', html);
            var overlayEl = document.getElementById(overlayId);
            if (!overlayEl) return;
            overlayEl.style.zIndex = '10100';
            overlayEl.querySelectorAll('.ubits-dropdown-menu__option').forEach(function (btn) {
                btn.addEventListener('click', function (ev) {
                    ev.stopPropagation();
                    var r = btn.getAttribute('data-value');
                    if (r) {
                        planDetailTaskDetailState.editingTask.role = r;
                        if (planDetailTaskDetailState.selectedTask) planDetailTaskDetailState.selectedTask.role = r;
                    }
                    window.closeDropdownMenu(overlayId);
                    if (overlayEl.parentNode) overlayEl.remove();
                    openTaskDetailPanel(planDetailTaskDetailState.selectedTask);
                });
            });
            overlayEl.addEventListener('click', function (ev) { if (ev.target === overlayEl) { window.closeDropdownMenu(overlayId); if (overlayEl.parentNode) overlayEl.remove(); openTaskDetailPanel(planDetailTaskDetailState.selectedTask); } });
            window.openDropdownMenu(overlayId, roleBtn);
        });
    }

    if (deleteBtn) deleteBtn.addEventListener('click', function () {
        var task = planDetailTaskDetailState.selectedTask;
        if (task && confirm('¿Eliminar esta tarea?')) {
            var planId = getPlanIdFromUrl();
            var tasks = getTasksForPlan(planId);
            var i = tasks ? tasks.findIndex(function (t) { return String(t.id) === String(task.id); }) : -1;
            if (i >= 0) tasks.splice(i, 1);
            closeTaskDetailPanel();
            renderPlanDetail(planId);
        }
    });

    if (finishBtn) finishBtn.addEventListener('click', function () {
        var task = planDetailTaskDetailState.selectedTask;
        if (!task) return;
        task.done = !task.done;
        task.status = task.done ? 'Finalizado' : 'Activo';
        closeTaskDetailPanel();
        renderPlanDetail(getPlanIdFromUrl());
        if (typeof showToast === 'function') showToast('success', task.done ? 'Tarea finalizada' : 'Tarea reabierta');
    });

    var addCommentBtn = panel.querySelector('.task-detail-btn-add');
    if (addCommentBtn) addCommentBtn.addEventListener('click', function () { if (typeof showToast === 'function') showToast('info', 'Próximamente: agregar comentario'); });

    var escHandler = function (ev) {
        if (ev.key === 'Escape' && planDetailTaskDetailState.selectedTask) {
            document.removeEventListener('keydown', escHandler);
            closeTaskDetailPanel();
        }
    };
    document.addEventListener('keydown', escHandler);

    overlay.style.display = 'flex';
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
        const html = tasks.map(t => window.renderTaskStrip(t, { today, formatDate: formatDateForDisplayDDMM, escapeHtml, getAssignee: getAssigneeForPlanDetail, renderAvatar: typeof renderAvatar === 'function' ? renderAvatar : undefined, esVencidaSection: vencidas.some(v => v.id === t.id) })).join('');
        if (tasksListEl) tasksListEl.innerHTML = html;
        attachTaskListeners();
    }
}

function handlePlanDetailListClick(e) {
    const planId = getPlanIdFromUrl();
    const tasks = getTasksForPlan(planId);
    if (!planId || !tasks.length) return;

    // Toggle hecho (radio)
    if (e.target.closest('.tarea-done-radio')) {
        e.preventDefault();
        const control = e.target.closest('.tarea-done-radio');
        const input = control && control.querySelector('input.ubits-radio__input');
        if (input && input.dataset.tareaId) {
            const id = input.dataset.tareaId;
            const t = tasks.find(x => String(x.id) === String(id));
            if (t) {
                t.done = !t.done;
                t.status = t.done ? 'Finalizado' : 'Activo';
                input.checked = t.done;
                renderPlanDetail(planId);
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
    if (item && !e.target.closest('.tarea-done-radio') && !e.target.closest('.tarea-action-btn')) {
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
