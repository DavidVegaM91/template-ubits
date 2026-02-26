/* ========================================
   TASK-DETAIL - Vista inmersiva de tarea con subtareas
   Estructura según diseño: header-product + info tarea + subtareas (tirilla) + comentarios.
   Datos de ejemplo; luego se alimentará desde BD.
   ======================================== */

(function () {
    'use strict';

    const pad = (n) => String(n).padStart(2, '0');
    function getTodayString() {
        const d = new Date();
        return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
    }
    function formatDateDDMM(ymd) {
        if (!ymd) return '';
        const p = String(ymd).split('-');
        if (p.length !== 3) return ymd;
        return p[2] + '-' + p[1] + '-' + p[0];
    }
    function ymdToDmySlash(ymd) {
        if (!ymd) return '';
        const p = String(ymd).trim().split('-');
        if (p.length !== 3) return '';
        return p[2] + '/' + p[1] + '/' + p[0];
    }
    function dmySlashToYmd(dmy) {
        if (!dmy || !String(dmy).trim()) return '';
        const parts = String(dmy).trim().split('/');
        if (parts.length !== 3) return '';
        var d = parts[0].padStart(2, '0'), m = parts[1].padStart(2, '0'), y = parts[2];
        return y + '-' + m + '-' + d;
    }
    function escapeHtml(s) {
        if (s == null) return '';
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    /** Tiempo relativo: "Hace Xh", "Hace X días" (máx 2), o "DD MMM YYYY - H:MM am/pm" */
    function formatCommentTime(dateStr) {
        const d = new Date(dateStr);
        const now = new Date();
        const diffMs = now - d;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        if (diffMins < 60) return 'Hace ' + (diffMins <= 1 ? 'un momento' : diffMins + ' min');
        if (diffHours < 24) return 'Hace ' + (diffHours === 1 ? '1 h' : diffHours + ' h');
        if (diffDays <= 2) return 'Hace ' + (diffDays === 1 ? '1 día' : diffDays + ' días');
        const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
        const dia = d.getDate();
        const mes = meses[d.getMonth()];
        const anio = d.getFullYear();
        let h = d.getHours();
        const m = d.getMinutes();
        const am = h < 12;
        if (h === 0) h = 12; else if (h > 12) h -= 12;
        const hora = h + ':' + pad(m) + ' ' + (am ? 'a.m.' : 'p.m.');
        return dia + ' ' + mes + ' ' + anio + ' - ' + hora;
    }

    const today = getTodayString();
    var SAVE_INDICATOR_ID = 'task-detail-header-container-save-indicator';

    function triggerFakeSave() {
        if (typeof renderSaveIndicator !== 'function') return;
        renderSaveIndicator(SAVE_INDICATOR_ID, { state: 'saving', size: 'sm' });
        setTimeout(function () {
            renderSaveIndicator(SAVE_INDICATOR_ID, { state: 'saved', size: 'sm' });
            setTimeout(function () {
                renderSaveIndicator(SAVE_INDICATOR_ID, { state: 'idle', size: 'sm' });
            }, 2500);
        }, 800);
    }

    var estado = {
        task: null,
        subtasks: [],
        comments: [],
        activities: [],
        massPanelOpen: false,
        addingSubtask: false
    };
    var subtaskIdToDelete = null;

    function getMockTask() {
        return {
            id: 1,
            name: 'Integrar pasarela de pagos con Stripe',
            description: 'Configurar los endpoints necesarios para procesar pagos recurrentes y suscripciones. Asegurar que los webhooks estén correctamente configurados para manejar renovaciones y cancelaciones.',
            status: 'Activo',
            priority: 'alta',
            endDate: '2026-02-20',
            assignee_name: 'María González',
            assignee_avatar_url: null,
            assignee_email: 'mgonzalez@ejemplo.com',
            created_by: 'Carlos Ruiz',
            created_by_avatar_url: null
        };
    }

    function getMockSubtasks() {
        return [
            { id: 101, name: 'Crear cuenta de desarrollador en stripe', done: false, status: 'Activo', endDate: '2026-02-20', priority: 'alta', assignee_name: 'María González', assignee_avatar_url: null, assignee_email: 'mgonzalez@ejemplo.com' },
            { id: 102, name: 'Implementar Api de suscripciones', done: false, status: 'Activo', endDate: '2026-02-20', priority: 'alta', assignee_name: 'María González', assignee_avatar_url: null, assignee_email: 'mgonzalez@ejemplo.com' },
            { id: 103, name: 'Revisar contratos vigentes', done: true, status: 'Finalizado', endDate: '2026-02-20', priority: 'baja', assignee_name: 'Carlos Ruiz', assignee_avatar_url: null, assignee_email: 'cruiz@ejemplo.com' },
            { id: 104, name: 'Configurar webhooks de Stripe', done: false, status: 'Activo', endDate: '2026-02-20', priority: 'alta', assignee_name: 'María González', assignee_avatar_url: null, assignee_email: 'mgonzalez@ejemplo.com' }
        ];
    }

    /* Orden: más antiguo arriba, más reciente abajo. Ejemplo: 1 semana, hace unas horas. */
    function getMockComments() {
        var oneWeekAgo = new Date(Date.now() - 7 * 24 * 3600000).toISOString();
        var fewHoursAgo = new Date(Date.now() - 3 * 3600000).toISOString();
        return [
            { id: 1, author: 'Carlos Ruiz', authorAvatar: null, time: oneWeekAgo, text: '¿Ya terminaste con la integración de los webhooks? Necesito que esté listo para el deploy de mañana.', images: [] },
            { id: 2, author: 'María González', authorAvatar: null, time: fewHoursAgo, text: 'Estoy en ello. Justo acabo de pegar las subtareas pendientes en el sistema para que todos vean el progreso.', images: [] }
        ];
    }

    /**
     * Actividades de ejemplo: cronológicas y realistas.
     * Incluye todos los tipos de evento que puede registrar el sistema.
     * En producción estos registros vendrían del backend.
     */
    function getMockActivities() {
        var tenDaysAgo = new Date(Date.now() - 10 * 24 * 3600000).toISOString();
        var nineDaysAgo = new Date(Date.now() - 9 * 24 * 3600000).toISOString();
        var eightDays = new Date(Date.now() - 8 * 24 * 3600000).toISOString();
        var sixDays = new Date(Date.now() - 6 * 24 * 3600000).toISOString();
        var fiveDays = new Date(Date.now() - 5 * 24 * 3600000).toISOString();
        var threeDays = new Date(Date.now() - 3 * 24 * 3600000).toISOString();
        var yesterday = new Date(Date.now() - 1 * 24 * 3600000).toISOString();
        return [
            { id: 'act-0', time: tenDaysAgo, icon: 'fa-circle-plus', author: 'Carlos Ruiz', text: 'creó la tarea.' },
            { id: 'act-1', time: nineDaysAgo, icon: 'fa-user-pen', author: 'Carlos Ruiz', text: 'asignó la tarea a María González.' },
            { id: 'act-2', time: eightDays, icon: 'fa-chevrons-up', author: 'Carlos Ruiz', text: 'cambió la prioridad a Alta.' },
            { id: 'act-3', time: sixDays, icon: 'fa-circle-dot', author: 'María González', text: 'cambió el estado a Por hacer.' },
            { id: 'act-4', time: fiveDays, icon: 'fa-plus-circle', author: 'María González', text: 'añadió la subtarea \u201cCrear cuenta de desarrollador en Stripe\u201d.' },
            { id: 'act-5', time: fiveDays, icon: 'fa-plus-circle', author: 'María González', text: 'añadió la subtarea \u201cImplementar API de suscripciones\u201d.' },
            { id: 'act-6', time: threeDays, icon: 'fa-circle-check', author: 'Carlos Ruiz', text: 'marcó \u201cRevisar contratos vigentes\u201d como completada.' },
            { id: 'act-7', time: yesterday, icon: 'fa-calendar-pen', author: 'María González', text: 'cambió la fecha límite al 20 feb 2026.' }
        ];
    }

    /**
     * Registra una nueva actividad en el feed de la tarea.
     * @param {string} icon    - Clase Font Awesome sin 'far ' (e.g. 'fa-circle-check')
     * @param {string} author  - Nombre del usuario que realizó la acción
     * @param {string} text    - Resto de la descripción (sin el nombre), e.g. 'añadió la subtarea "X".'
     */
    function pushActivity(icon, author, text) {
        estado.activities.push({
            id: 'act-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
            time: new Date().toISOString(),
            icon: icon,
            author: author,
            text: text
        });
    }

    function getTaskStripOpts() {
        var getAssignee = function (t) {
            var name = (t.assignee_name || (t.assignee_email ? t.assignee_email.split('@')[0] : null)) || 'Sin asignar';
            return { name: name, avatar: t.assignee_avatar_url || null };
        };
        return {
            today: today,
            formatDate: formatDateDDMM,
            escapeHtml: escapeHtml,
            getAssignee: getAssignee,
            renderAvatar: typeof renderAvatar === 'function' ? renderAvatar : undefined,
            esVencidaSection: false,
            hideAddToPlan: true
        };
    }


    /* Helper: abrir dropdown asignado con autocomplete (tarea principal o subtarea) */
    function getUsuariosParaTaskDetail() {
        if (typeof TAREAS_PLANES_DB !== 'undefined' && typeof TAREAS_PLANES_DB.getEmpleadosEjemplo === 'function') {
            var emp = TAREAS_PLANES_DB.getEmpleadosEjemplo();
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

    function openAssigneeDropdown(anchorEl, entity, onAfterUpdate) {
        if (!anchorEl || !entity || typeof window.getDropdownMenuHtml !== 'function' || typeof window.openDropdownMenu !== 'function' || typeof window.closeDropdownMenu !== 'function') return;
        var overlayId = 'task-detail-assignee-overlay-' + (entity.id != null ? String(entity.id) : 'main');
        var existing = document.getElementById(overlayId);
        if (existing) existing.remove();
        var users = getUsuariosParaTaskDetail();
        var options = [{ text: 'Sin asignar', value: 'none', avatar: null }].concat(
            users.map(function (u) {
                return { value: u.id, text: u.full_name || u.email || '', avatar: u.avatar_url };
            })
        );
        var html = window.getDropdownMenuHtml({
            overlayId: overlayId,
            hasAutocomplete: true,
            autocompletePlaceholder: 'Buscar...',
            options: options
        });
        document.body.insertAdjacentHTML('beforeend', html);
        var overlayEl = document.getElementById(overlayId);
        if (!overlayEl) return;
        overlayEl.style.zIndex = '10100';
        var optionsContainer = overlayEl.querySelector('.ubits-dropdown-menu__options');
        if (optionsContainer) optionsContainer.classList.add('ubits-dropdown-menu__options--max-h-255');
        var contentEl = overlayEl.querySelector('.ubits-dropdown-menu__content');
        if (contentEl) contentEl.style.zIndex = '10100';
        var optionButtons = overlayEl.querySelectorAll('.ubits-dropdown-menu__option');
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
        var inputEl = document.getElementById(overlayId + '-autocomplete-input');
        var clearIcon = document.getElementById(overlayId + '-autocomplete-clear');
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
                var val = btn.getAttribute('data-value');
                if (val === 'none') {
                    entity.assignee_email = null;
                    entity.assignee_name = null;
                    entity.assignee_avatar_url = null;
                    pushActivity('fa-user-pen', currentUserName, 'dejó la tarea sin asignar.');
                } else {
                    var user = users.find(function (u) { return String(u.id) === val; });
                    if (user) {
                        var nuevoNombre = user.full_name || user.email || '';
                        entity.assignee_email = user.email;
                        entity.assignee_name = user.full_name || user.email;
                        entity.assignee_avatar_url = user.avatar_url;
                        pushActivity('fa-user-pen', currentUserName, 'asignó la tarea a ' + nuevoNombre + '.');
                    }
                }
                if (typeof window.closeDropdownMenu === 'function') window.closeDropdownMenu(overlayId);
                if (overlayEl.parentNode) overlayEl.remove();
                if (typeof onAfterUpdate === 'function') onAfterUpdate();
            });
        });
        overlayEl.addEventListener('click', function (ev) {
            if (ev.target === overlayEl) {
                if (typeof window.closeDropdownMenu === 'function') window.closeDropdownMenu(overlayId);
                if (overlayEl.parentNode) overlayEl.remove();
            }
        });
        window.openDropdownMenu(overlayId, anchorEl);
    }

    function renderInfoBlock() {
        var task = estado.task;
        if (!task) return;
        var statusDisplay = task.status === 'Finalizado' ? 'Finalizada' : (task.status === 'Vencido' ? 'Vencida' : 'Por hacer');
        var statusSlug = task.status === 'Finalizado' ? 'success' : (task.status === 'Vencido' ? 'error' : 'info');
        var prioridad = (task.priority || 'media').toLowerCase();
        var prioridadLabel = prioridad === 'alta' ? 'Alta' : prioridad === 'baja' ? 'Baja' : 'Media';
        var assigneeName = task.assignee_name || (task.assignee_email ? task.assignee_email.split('@')[0] : 'Sin asignar');
        var creatorName = task.created_by || 'Sin especificar';
        var assigneeBlock = typeof renderAvatar === 'function'
            ? renderAvatar({ nombre: assigneeName, avatar: task.assignee_avatar_url }, { size: 'sm' })
            : '<span class="ubits-avatar ubits-avatar--sm"><span class="ubits-avatar__fallback"><i class="far fa-user"></i></span></span>';
        var creatorBlock = typeof renderAvatar === 'function'
            ? renderAvatar({ nombre: creatorName, avatar: task.created_by_avatar_url }, { size: 'sm' })
            : '<span class="ubits-avatar ubits-avatar--sm"><span class="ubits-avatar__fallback"><i class="far fa-user"></i></span></span>';

        var prioridadIcon = { alta: 'fa-chevrons-up', media: 'fa-chevron-up', baja: 'fa-chevron-down' };
        var prioridadVariant = { alta: 'error', media: 'warning', baja: 'info' };
        var html =
            '<div class="task-detail-meta-row">' +
            '<div class="task-detail-meta-cell">' +
            '<span class="ubits-body-sm-semibold task-detail-meta-label">Asignado a</span>' +
            '<div class="task-detail-assignee-row" id="task-detail-assignee-row" role="button" tabindex="0">' +
            assigneeBlock +
            '<span class="ubits-body-sm-regular">' + escapeHtml(assigneeName) + '</span>' +
            '<i class="far fa-chevron-down" style="font-size: 12px; color: var(--ubits-fg-1-medium);"></i>' +
            '</div></div>' +
            '<div class="task-detail-meta-cell">' +
            '<span class="ubits-body-sm-semibold task-detail-meta-label">Creada por</span>' +
            '<div class="task-detail-creator-row">' +
            creatorBlock +
            '<span class="ubits-body-sm-regular">' + escapeHtml(creatorName) + '</span>' +
            '</div></div></div>' +
            '<textarea class="task-detail-title-editable ubits-body-md-bold" id="task-detail-title" placeholder="Título de la tarea" rows="1" maxlength="250">' + escapeHtml(task.name) + '</textarea>' +
            '<textarea class="task-detail-desc-editable ubits-body-sm-regular" id="task-detail-desc" placeholder="Descripción de la tarea" rows="1">' + escapeHtml(task.description || '') + '</textarea>' +
            '<div class="task-detail-attributes-row">' +
            '<span class="task-detail-meta-cell">' +
            '<span class="ubits-body-sm-semibold task-detail-meta-label">Estado</span>' +
            '<div class="task-detail-estado-trigger' + (task.status === 'Vencido' ? ' task-detail-estado-trigger--vencida' : '') + '" id="task-detail-estado-trigger" role="button" tabindex="0" aria-haspopup="listbox" aria-expanded="false"' +
            (task.status === 'Vencido' ? ' data-tooltip="Para reabrir la tarea cambia la fecha de vencimiento." data-tooltip-delay="300" data-tooltip-normal' : '') + '>' +
            '<span class="ubits-status-tag ubits-status-tag--sm ubits-status-tag--' + statusSlug + '"><span class="ubits-status-tag__text">' + escapeHtml(statusDisplay) + '</span></span>' +
            '</div></span>' +
            '<span class="task-detail-meta-cell">' +
            '<span class="ubits-body-sm-semibold task-detail-meta-label">Prioridad</span>' +
            '<div class="task-detail-prioridad-trigger" id="task-detail-prioridad-trigger" role="button" tabindex="0" aria-haspopup="listbox" aria-expanded="false">' +
            '<span class="ubits-badge-tag ubits-badge-tag--outlined ubits-badge-tag--' + (prioridadVariant[prioridad] || 'warning') + ' ubits-badge-tag--sm ubits-badge-tag--with-icon">' +
            '<i class="far ' + (prioridadIcon[prioridad] || 'fa-chevron-up') + '"></i><span class="ubits-badge-tag__text">' + escapeHtml(prioridadLabel) + '</span></span>' +
            '</div></span>' +
            '<span class="task-detail-meta-cell">' +
            '<span id="task-detail-vencimiento-label" class="ubits-body-sm-semibold task-detail-meta-label">Vencimiento</span>' +
            '<div id="task-detail-vencimiento-wrap"></div></span>' +
            '</div>';
        var el = document.getElementById('task-detail-info-block');
        if (el) el.innerHTML = html;
        if (typeof createInput === 'function') {
            createInput({
                containerId: 'task-detail-vencimiento-wrap',
                type: 'calendar',
                size: 'sm',
                showLabel: false,
                placeholder: 'Sin fecha',
                value: ymdToDmySlash(task.endDate),
                onChange: function (dateStr) {
                    var ymd = dmySlashToYmd(dateStr);
                    if (estado.task) {
                        estado.task.endDate = ymd;
                        if (ymd && ymd < today && estado.task.status === 'Activo') {
                            estado.task.status = 'Vencido';
                            pushActivity('fa-circle-dot', currentUserName, 'cambió el estado a Vencida.');
                        }
                        if (ymd && ymd >= today && estado.task.status === 'Vencido') {
                            estado.task.status = 'Activo';
                            pushActivity('fa-circle-dot', currentUserName, 'cambió el estado a Por hacer.');
                        }
                    }
                    pushActivity('fa-calendar-pen', currentUserName, 'cambió la fecha límite al ' + dateKeyLabel(ymd) + '.');
                    renderCommentsBlock();
                    setTimeout(function () { renderInfoBlock(); }, 0);
                    triggerFakeSave();
                }
            });
            var dateInput = document.querySelector('#task-detail-vencimiento-wrap .ubits-input');
            if (dateInput) dateInput.setAttribute('aria-labelledby', 'task-detail-vencimiento-label');
        }
        if (typeof initTooltip === 'function') initTooltip('#task-detail-info-block [data-tooltip]');
        resizeTaskDetailTitle();
        resizeTaskDetailDesc();
        requestAnimationFrame(function () { resizeTaskDetailDesc(); });
        var titleEl = document.getElementById('task-detail-title');
        if (titleEl) {
            titleEl.addEventListener('input', resizeTaskDetailTitle);
            titleEl.addEventListener('blur', function () {
                if (estado.task) {
                    estado.task.name = this.value.trim() || estado.task.name;
                    triggerFakeSave();
                }
            });
        }
        var descEl = document.getElementById('task-detail-desc');
        if (descEl) {
            descEl.addEventListener('input', resizeTaskDetailDesc);
            descEl.addEventListener('blur', function () {
                if (estado.task) {
                    estado.task.description = this.value.trim() || '';
                    triggerFakeSave();
                }
            });
        }

        /* Clic en asignado: abrir dropdown con autocomplete para cambiar asignado (tarea principal) */
        var assigneeRow = document.getElementById('task-detail-assignee-row');
        if (assigneeRow) {
            assigneeRow.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                if (estado.task) openAssigneeDropdown(assigneeRow, estado.task, function () { renderInfoBlock(); renderCommentsBlock(); triggerFakeSave(); });
            });
            assigneeRow.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    assigneeRow.click();
                }
            });
        }

        /* Clic en Estado: dropdown Reabrir tarea (si Finalizada) o Finalizada (si Por hacer); Vencida = solo tooltip (title) */
        var estadoTrigger = document.getElementById('task-detail-estado-trigger');
        if (estadoTrigger && task.status !== 'Vencido' && typeof window.getDropdownMenuHtml === 'function' && typeof window.openDropdownMenu === 'function' && typeof window.closeDropdownMenu === 'function') {
            estadoTrigger.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var overlayId = 'task-detail-estado-overlay';
                var existing = document.getElementById(overlayId);
                if (existing) existing.remove();
                var options = task.status === 'Finalizado'
                    ? [{ text: 'Reabrir tarea', value: 'reabrir' }]
                    : [{ text: 'Finalizar tarea', value: 'finalizada' }];
                var html = window.getDropdownMenuHtml({ overlayId: overlayId, options: options });
                document.body.insertAdjacentHTML('beforeend', html);
                var overlayEl = document.getElementById(overlayId);
                if (overlayEl) {
                    overlayEl.querySelectorAll('.ubits-dropdown-menu__option').forEach(function (opt) {
                        opt.addEventListener('click', function () {
                            var val = this.getAttribute('data-value');
                            var t = estado.task;
                            if (t) {
                                if (val === 'reabrir') {
                                    t.status = 'Activo';
                                    t.done = false;
                                    pushActivity('fa-circle-xmark', currentUserName, 'reabrió la tarea.');
                                } else if (val === 'finalizada') {
                                    t.status = 'Finalizado';
                                    t.done = true;
                                    pushActivity('fa-circle-check', currentUserName, 'marcó la tarea como finalizada.');
                                }
                            }
                            window.closeDropdownMenu(overlayId);
                            if (overlayEl.parentNode) overlayEl.remove();
                            renderInfoBlock();
                            renderCommentsBlock();
                            triggerFakeSave();
                        });
                    });
                    overlayEl.addEventListener('click', function (ev) {
                        if (ev.target === overlayEl) { window.closeDropdownMenu(overlayId); if (overlayEl.parentNode) overlayEl.remove(); }
                    });
                }
                window.openDropdownMenu(overlayId, estadoTrigger);
            });
            estadoTrigger.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); estadoTrigger.click(); }
            });
        }

        /* Clic en Prioridad: dropdown Alta, Media, Baja */
        var prioridadTrigger = document.getElementById('task-detail-prioridad-trigger');
        if (prioridadTrigger && typeof window.getDropdownMenuHtml === 'function' && typeof window.openDropdownMenu === 'function' && typeof window.closeDropdownMenu === 'function') {
            prioridadTrigger.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var overlayId = 'task-detail-prioridad-overlay';
                var existing = document.getElementById(overlayId);
                if (existing) existing.remove();
                var options = [
                    { text: 'Alta', value: 'alta' },
                    { text: 'Media', value: 'media' },
                    { text: 'Baja', value: 'baja' }
                ];
                var html = window.getDropdownMenuHtml({ overlayId: overlayId, options: options });
                document.body.insertAdjacentHTML('beforeend', html);
                var overlayEl = document.getElementById(overlayId);
                if (overlayEl) {
                    overlayEl.querySelectorAll('.ubits-dropdown-menu__option').forEach(function (opt) {
                        opt.addEventListener('click', function () {
                            var val = this.getAttribute('data-value');
                            var label = val === 'alta' ? 'Alta' : val === 'baja' ? 'Baja' : 'Media';
                            var t = estado.task;
                            if (t) {
                                t.priority = val;
                                pushActivity('fa-chevrons-up', currentUserName, 'cambió la prioridad a ' + label + '.');
                            }
                            window.closeDropdownMenu(overlayId);
                            if (overlayEl.parentNode) overlayEl.remove();
                            renderInfoBlock();
                            renderCommentsBlock();
                            triggerFakeSave();
                        });
                    });
                    overlayEl.addEventListener('click', function (ev) {
                        if (ev.target === overlayEl) { window.closeDropdownMenu(overlayId); if (overlayEl.parentNode) overlayEl.remove(); }
                    });
                }
                window.openDropdownMenu(overlayId, prioridadTrigger);
            });
            prioridadTrigger.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); prioridadTrigger.click(); }
            });
        }
    }

    function resizeTaskDetailTitle() {
        var ta = document.getElementById('task-detail-title');
        if (!ta) return;
        ta.style.height = 'auto';
        ta.style.height = Math.max(24, ta.scrollHeight) + 'px';
    }

    function resizeTaskDetailDesc() {
        var ta = document.getElementById('task-detail-desc');
        if (!ta) return;
        ta.style.height = '0';
        ta.style.height = ta.scrollHeight + 'px';
    }

    function renderSubtasksBlock() {
        var list = estado.subtasks;
        var ordered = list.slice().sort(function (a, b) {
            if (a.done !== b.done) return (a.done ? 1 : 0) - (b.done ? 1 : 0);
            if (a.done && b.done) return (a._justFinalized ? 0 : 1) - (b._justFinalized ? 0 : 1);
            return 0;
        });
        var completed = list.filter(function (t) { return t.done; }).length;
        var total = list.length;
        var opts = getTaskStripOpts();
        var listHtml = ordered.length
            ? ordered.map(function (t) { return window.renderTaskStrip(t, opts); }).join('')
            : '';
        var massPanel = estado.massPanelOpen
            ? '<div class="task-detail-mass-panel is-open" id="task-detail-mass-panel">' +
            '<div class="task-detail-mass-panel-header">' +
            '<h3 class="task-detail-mass-panel-title"><i class="far fa-folder"></i> Creación a partir de lista</h3>' +
            '<span class="task-detail-mass-panel-detected" id="task-detail-mass-detected">Se detectaron 0 subtareas</span></div>' +
            '<textarea class="task-detail-mass-panel-textarea" id="task-detail-mass-textarea" placeholder="Escribe una subtarea por línea&#10;Línea 1&#10;Línea 2&#10;..."></textarea>' +
            '<div class="task-detail-mass-panel-options">' +
            '<div class="task-detail-mass-panel-date"><span class="ubits-body-sm-regular">Vencimiento</span><div id="task-detail-mass-date-wrap"></div></div>' +
            '<div class="task-detail-mass-panel-priority"><span class="ubits-body-sm-regular">Prioridad</span><div id="task-detail-mass-priority-wrap"></div></div>' +
            '<div class="task-detail-mass-panel-actions">' +
            '<p class="task-detail-mass-panel-tip">Escribe varias líneas de texto para crear múltiples subtareas a la vez.</p>' +
            '<div class="task-detail-mass-panel-actions__btns">' +
            '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm" id="task-detail-mass-cancel"><span>Cancelar</span></button>' +
            '<button type="button" class="ubits-button ubits-button--primary ubits-button--sm" id="task-detail-mass-create"><span>Crear subtareas</span></button>' +
            '</div></div></div>' +
            '</div>'
            : '<div class="task-detail-mass-panel" id="task-detail-mass-panel"></div>';

        var addFormHtml = estado.addingSubtask
            ? '<form class="task-detail-add-subtask-form" id="task-detail-add-subtask-form">' +
            '<div class="task-detail-add-subtask-wrapper">' +
            '<div class="task-detail-add-subtask-icon"><i class="far fa-plus"></i></div>' +
            '<input type="text" class="ubits-input ubits-input--sm task-detail-add-subtask-input" placeholder="Nombre de la subtarea" data-subtask-add autofocus />' +
            '<button type="button" class="ubits-button ubits-button--primary ubits-button--sm task-detail-add-subtask-btn"><span>Añadir</span></button>' +
            '</div></form>'
            : '';
        var html =
            '<div class="task-detail-subtasks-header">' +
            '<h2 class="ubits-body-md-bold task-detail-subtasks-title"><i class="far fa-list-check"></i> Subtareas</h2>' +
            '<span class="ubits-body-sm-regular task-detail-subtasks-counter">' + completed + '/' + total + ' Completadas</span></div>' +
            '<div class="task-detail-subtasks-list" id="task-detail-subtasks-list">' + listHtml + '</div>' +
            addFormHtml +
            massPanel +
            '<div class="task-detail-add-row">' +
            '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm" id="task-detail-add-subtask-btn">' +
            '<i class="far fa-plus"></i><span>Agregar una subtarea</span></button>' +
            '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm" id="task-detail-mass-btn">' +
            '<i class="far fa-list"></i><span>Creación a partir de lista de texto</span></button>' +
            '</div>';
        var el = document.getElementById('task-detail-subtasks-block');
        if (el) el.innerHTML = html;

        if (typeof initTooltip === 'function') initTooltip('#task-detail-subtasks-block [data-tooltip]');

        var listEl = document.getElementById('task-detail-subtasks-list');
        if (listEl) {
            listEl.querySelectorAll('.tarea-done-radio').forEach(function (radioWrap) {
                var id = radioWrap.dataset.tareaId;
                if (!id) return;
                var input = radioWrap.querySelector('input[type="checkbox"]');
                if (input) {
                    input.addEventListener('change', function () {
                        var t = estado.subtasks.find(function (s) { return String(s.id) === String(id); });
                        if (t) {
                            var wasDone = t.done;
                            t.done = !!this.checked;
                            t.status = t.done ? 'Finalizado' : 'Activo';
                            if (t.done) t._justFinalized = true;
                            else t._justFinalized = false;
                            /* ── Actividad: completar o reabrir subtarea ── */
                            if (t.done && !wasDone) {
                                pushActivity('fa-circle-check', currentUserName, 'marcó "' + t.name + '" como completada.');
                            } else if (!t.done && wasDone) {
                                pushActivity('fa-circle-xmark', currentUserName, 'reabrió la subtarea "' + t.name + '".');
                            }
                            var row = radioWrap.closest('.tarea-item');
                            var oldRect = (row && t.done) ? row.getBoundingClientRect() : null;
                            renderSubtasksBlock();
                            triggerFakeSave();
                            if (t.done && oldRect) {
                                var listElAfter = document.getElementById('task-detail-subtasks-list');
                                var newRow = listElAfter ? listElAfter.querySelector('.tarea-item[data-tarea-id="' + id + '"]') : null;
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
                                        t._justFinalized = false;
                                    }
                                } else {
                                    t._justFinalized = false;
                                }
                            } else if (!t.done) {
                                t._justFinalized = false;
                            }
                            renderCommentsBlock();
                        }
                    });
                }
            });
            /* Clic en asignado (avatar) en cada subtarea: ahora manejado por delegación al final para ser más robusto */
        }

        function submitSubtaskForm(form) {
            var inp = form.querySelector('input[data-subtask-add]');
            if (!inp || !inp.value.trim()) return;
            var nombre = inp.value.trim();
            estado.subtasks.push({
                id: Date.now(),
                name: nombre,
                done: false,
                status: 'Activo',
                endDate: estado.task ? estado.task.endDate : today,
                priority: estado.task ? estado.task.priority : 'media',
                assignee_name: estado.task ? estado.task.assignee_name : null,
                assignee_email: estado.task ? estado.task.assignee_email : null,
                assignee_avatar_url: estado.task ? estado.task.assignee_avatar_url : null
            });
            pushActivity('fa-plus-circle', currentUserName, 'añadió la subtarea "' + nombre + '".');
            estado.addingSubtask = false;
            renderSubtasksBlock();
            renderCommentsBlock();
            triggerFakeSave();
        }

        function closeSubtaskFormIfEmpty() {
            var form = document.getElementById('task-detail-add-subtask-form');
            var inp = form && form.querySelector('input[data-subtask-add]');
            if (form && inp && !inp.value.trim()) {
                estado.addingSubtask = false;
                renderSubtasksBlock();
            }
        }

        var addSubtaskBtn = document.getElementById('task-detail-add-subtask-btn');
        if (addSubtaskBtn) {
            addSubtaskBtn.onclick = function () {
                estado.addingSubtask = true;
                renderSubtasksBlock();
                var form = document.getElementById('task-detail-add-subtask-form');
                var inp = form && form.querySelector('input[data-subtask-add]');
                if (inp) setTimeout(function () { inp.focus(); }, 50);
                if (form) {
                    var wrapper = form.querySelector('.task-detail-add-subtask-wrapper');
                    if (wrapper) {
                        setTimeout(function () {
                            function closeIfEmptyAndOutside(ev) {
                                if (!form.isConnected) {
                                    document.removeEventListener('click', closeIfEmptyAndOutside, true);
                                    return;
                                }
                                if (wrapper.contains(ev.target)) return;
                                closeSubtaskFormIfEmpty();
                                document.removeEventListener('click', closeIfEmptyAndOutside, true);
                            }
                            document.addEventListener('click', closeIfEmptyAndOutside, true);
                        }, 0);
                    }
                }
            };
        }
        var addForm = document.getElementById('task-detail-add-subtask-form');
        if (addForm) {
            addForm.onsubmit = function (e) {
                e.preventDefault();
                submitSubtaskForm(addForm);
            };
            var inp = addForm.querySelector('input[data-subtask-add]');
            if (inp) {
                inp.addEventListener('blur', function () {
                    closeSubtaskFormIfEmpty();
                }, { once: true });
            }
            var addSubtaskBtnEl = addForm.querySelector('.task-detail-add-subtask-btn');
            if (addSubtaskBtnEl) {
                addSubtaskBtnEl.onclick = function () {
                    submitSubtaskForm(addForm);
                };
            }
        }
        var massBtn = document.getElementById('task-detail-mass-btn');
        if (massBtn) {
            massBtn.onclick = function () {
                estado.massPanelOpen = true;
                renderSubtasksBlock();
            };
        }
        if (estado.massPanelOpen) {
            var panel = document.getElementById('task-detail-mass-panel');
            if (panel) {
                var ta = document.getElementById('task-detail-mass-textarea');
                if (ta) ta.addEventListener('input', updateMassPanelDetected);
                if (typeof createInput === 'function') {
                    var defaultDate = new Date();
                    defaultDate.setDate(defaultDate.getDate() + 7);
                    var ymd = defaultDate.getFullYear() + '-' + pad(defaultDate.getMonth() + 1) + '-' + pad(defaultDate.getDate());
                    createInput({ containerId: 'task-detail-mass-date-wrap', type: 'calendar', size: 'sm', showLabel: false, placeholder: 'Fecha', value: formatDateDDMM(ymd) });
                    createInput({ containerId: 'task-detail-mass-priority-wrap', type: 'select', size: 'sm', showLabel: false, placeholder: 'Prioridad', selectOptions: [{ value: 'alta', text: 'Alta' }, { value: 'media', text: 'Media' }, { value: 'baja', text: 'Baja' }], value: 'media' });
                }
                var cancel = document.getElementById('task-detail-mass-cancel');
                var createBtn = document.getElementById('task-detail-mass-create');
                if (cancel) cancel.onclick = function () { estado.massPanelOpen = false; renderSubtasksBlock(); };
                if (createBtn) createBtn.onclick = function () {
                    var textarea = document.getElementById('task-detail-mass-textarea');
                    var lines = (textarea ? textarea.value : '').split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
                    var priority = 'media';
                    var endDate = estado.task ? estado.task.endDate : today;
                    lines.forEach(function (name) {
                        estado.subtasks.push({
                            id: Date.now() + Math.random(),
                            name: name,
                            done: false,
                            status: 'Activo',
                            endDate: endDate,
                            priority: priority,
                            assignee_name: estado.task ? estado.task.assignee_name : null,
                            assignee_email: estado.task ? estado.task.assignee_email : null,
                            assignee_avatar_url: estado.task ? estado.task.assignee_avatar_url : null
                        });
                    });
                    /* ── Actividad: creación masiva de subtareas ── */
                    if (lines.length === 1) {
                        pushActivity('fa-plus-circle', currentUserName, 'añadió la subtarea "' + lines[0] + '".');
                    } else if (lines.length > 1) {
                        pushActivity('fa-list-plus', currentUserName, 'añadió ' + lines.length + ' subtareas en lote.');
                    }
                    estado.massPanelOpen = false;
                    renderSubtasksBlock();
                    renderCommentsBlock();
                    triggerFakeSave();
                };
            }
        }
    }

    function updateMassPanelDetected() {
        var ta = document.getElementById('task-detail-mass-textarea');
        var el = document.getElementById('task-detail-mass-detected');
        if (!el || !ta) return;
        var lines = (ta.value || '').split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
        el.textContent = lines.length === 0 ? 'Se detectaron 0 subtareas' : (lines.length === 1 ? 'Se detectó 1 subtarea' : 'Se detectaron ' + lines.length + ' subtareas');
    }

    var currentUserName = 'María Alejandra Sánchez Pardo';

    // Imágenes y documentos pendientes de envío (persisten entre re-renders del bloque de comentarios)
    var pendingImages = [];
    var pendingFiles = []; // documentos: { name, type, size }

    function renderPendingFilesPreview() {
        var strip = document.getElementById('task-detail-pending-files-strip');
        if (!strip) return;
        if (pendingFiles.length === 0) {
            strip.innerHTML = '';
            strip.style.display = 'none';
            return;
        }
        strip.style.display = 'flex';
        strip.innerHTML = pendingFiles.map(function (f, idx) {
            return '<span class="ubits-chip ubits-chip--sm ubits-chip--icon-left ubits-chip--close task-detail-pending-file-chip" data-idx="' + idx + '">' +
                '<i class="far fa-file-lines"></i>' +
                '<span class="ubits-chip__text">' + escapeHtml(f.name) + '</span>' +
                '<button type="button" class="ubits-chip__close task-detail-pending-file-remove" aria-label="Quitar documento" data-idx="' + idx + '"><i class="far fa-times"></i></button>' +
                '</span>';
        }).join('');
        strip.querySelectorAll('.task-detail-pending-file-remove').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var i = parseInt(this.dataset.idx, 10);
                pendingFiles.splice(i, 1);
                renderPendingFilesPreview();
            });
        });
    }

    function renderPendingImagesPreview() {
        var strip = document.getElementById('task-detail-pending-images-strip');
        if (!strip) return;
        if (pendingImages.length === 0) {
            strip.innerHTML = '';
            strip.style.display = 'none';
            return;
        }
        strip.style.display = 'flex';
        strip.innerHTML = pendingImages.map(function (src, idx) {
            return '<div class="task-detail-pending-img-wrap" data-idx="' + idx + '">' +
                '<img src="' + src + '" alt="Imagen adjunta" class="task-detail-pending-img" />' +
                '<button type="button" class="task-detail-pending-img-remove" aria-label="Eliminar imagen" data-idx="' + idx + '"><i class="far fa-times"></i></button>' +
                '</div>';
        }).join('');
        strip.querySelectorAll('.task-detail-pending-img-remove').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var i = parseInt(this.dataset.idx, 10);
                pendingImages.splice(i, 1);
                renderPendingImagesPreview();
            });
        });
    }

    /**
     * Convierte ISO string a clave de día YYYY-MM-DD (para agrupar por fecha).
     */
    function toDateKey(isoStr) {
        return isoStr ? isoStr.slice(0, 10) : '';
    }

    /**
     * Etiqueta legible del separador: 'Hoy', 'Ayer', o '13 feb 2026'.
     */
    function dateKeyLabel(dateKey) {
        var yesterdayObj = new Date(Date.now() - 86400000);
        var yesterdayKey = yesterdayObj.getFullYear() + '-' +
            pad(yesterdayObj.getMonth() + 1) + '-' +
            pad(yesterdayObj.getDate());
        if (dateKey === today) return 'Hoy';
        if (dateKey === yesterdayKey) return 'Ayer';
        var meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
        var parts = dateKey.split('-');
        return parseInt(parts[2], 10) + ' ' + meses[parseInt(parts[1], 10) - 1] + ' ' + parts[0];
    }

    function renderCommentsBlock() {
        var comments = estado.comments;
        var activities = estado.activities;
        var task = estado.task;
        /* Cuando creador y asignado son la misma persona, no mostrar sus comentarios (evitar "hablarse a sí mismo") */
        var isCreatorSameAsAssignee = task && task.created_by && task.assignee_name &&
            String(task.created_by).trim() === String(task.assignee_name).trim();
        var commentsToShow = isCreatorSameAsAssignee
            ? comments.filter(function (c) {
                var author = String(c.author || '').trim();
                var creator = String(task.created_by || '').trim();
                return author !== creator;
            })
            : comments;

        /* No mostrar comentarios ni actividades con fecha futura (datos de BD o mocks mal fechados) */
        var now = new Date();
        function isNotFuture(isoStr) {
            if (!isoStr) return false;
            var d = new Date(isoStr);
            return !isNaN(d.getTime()) && d.getTime() <= now.getTime();
        }

        /* ── Mezclar comentarios y actividades en timeline cronológico único ── */
        var allItems = [];
        commentsToShow.forEach(function (c) {
            if (isNotFuture(c.time)) allItems.push({ type: 'comment', time: c.time, data: c });
        });
        activities.forEach(function (a) {
            if (isNotFuture(a.time)) allItems.push({ type: 'activity', time: a.time, data: a });
        });
        var total = allItems.filter(function (i) { return i.type === 'comment'; }).length;
        allItems.sort(function (a, b) { return new Date(a.time) - new Date(b.time); });

        /* ── Renderizar items con separadores de fecha al cambiar de día ── */
        var feed = [];
        var lastDateKey = null;
        allItems.forEach(function (item) {
            var dateKey = toDateKey(item.time);
            if (dateKey !== lastDateKey) {
                feed.push('<div class="task-detail-comments-separator"><span>' + dateKeyLabel(dateKey) + '</span></div>');
                lastDateKey = dateKey;
            }
            if (item.type === 'comment') {
                var c = item.data;
                var isUser = c.author === currentUserName;
                var itemClass = 'task-detail-comment-item' + (isUser ? ' task-detail-comment-item--user' : '');
                var authorBlock = typeof renderAvatar === 'function'
                    ? renderAvatar({ nombre: c.author, avatar: c.authorAvatar }, { size: 'sm' })
                    : '<span class="ubits-avatar ubits-avatar--sm"><span class="ubits-avatar__fallback"><i class="far fa-user"></i></span></span>';
                feed.push(
                    '<div class="' + itemClass + '">' +
                    '<div class="task-detail-comment-avatar">' + authorBlock + '</div>' +
                    '<div class="task-detail-comment-body">' +
                    '<div class="task-detail-comment-meta">' +
                    '<span class="task-detail-comment-author">' + escapeHtml(c.author) + '</span>' +
                    '<span class="task-detail-comment-time">' + formatCommentTime(c.time) + '</span></div>' +
                    '<div class="task-detail-comment-bubble">' +
                    (c.text ? '<p class="task-detail-comment-text">' + escapeHtml(c.text) + '</p>' : '') +
                    (c.images && c.images.length ? '<div class="task-detail-comment-images">' + c.images.map(function (img) { return '<img src="' + escapeHtml(img) + '" alt="">'; }).join('') + '</div>' : '') +
                    (c.files && c.files.length ? '<div class="task-detail-comment-files">' + c.files.map(function (f) {
                        var url = (f && f.url) ? String(f.url).replace(/"/g, '&quot;') : '';
                        var name = (f && f.name) ? escapeHtml(f.name) : '';
                        var nameAttr = (f && f.name) ? String(f.name).replace(/"/g, '&quot;') : '';
                        return '<span class="ubits-chip ubits-chip--sm ubits-chip--icon-left task-detail-comment-file-chip" data-tooltip="Descargar archivo" data-file-url="' + url + '" data-file-name="' + nameAttr + '" role="' + (url ? 'button' : '') + '" tabindex="' + (url ? '0' : '-1') + '"><i class="far fa-file-lines"></i><span class="ubits-chip__text">' + name + '</span></span>';
                    }).join('') + '</div>' : '') +
                    '</div></div></div>'
                );
            } else {
                var a = item.data;
                /* Nombre en span semibold/high para igualar el autor de comentarios */
                var authorHtml = a.author
                    ? '<span class="task-detail-activity-author">' + escapeHtml(a.author) + '</span> '
                    : '';
                feed.push(
                    '<div class="task-detail-activity-item">' +
                    '<i class="far ' + (a.icon || 'fa-circle-info') + '"></i>' +
                    '<span class="task-detail-activity-text">' + authorHtml + escapeHtml(a.text) + '</span>' +
                    '<span class="task-detail-activity-time">' + formatCommentTime(a.time) + '</span>' +
                    '</div>'
                );
            }
        });

        var html =
            '<div class="task-detail-comments-header">' +
            '<h2 class="task-detail-comments-header-title"><i class="far fa-comments"></i> Comentarios</h2>' +
            '<span class="task-detail-comments-badge">' + total + '</span></div>' +
            '<div class="task-detail-comments-feed" id="task-detail-comments-feed">' + feed.join('') + '</div>' +
            '<input type="file" class="task-detail-comments-file-input" id="task-detail-comment-files" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.ppt,.pptx" multiple hidden />' +
            '<div class="task-detail-comments-input-wrap">' +
            '<div class="task-detail-pending-images-strip" id="task-detail-pending-images-strip"></div>' +
            '<div class="task-detail-pending-files-strip" id="task-detail-pending-files-strip"></div>' +
            '<div class="task-detail-comments-input-container">' +
            '<div class="task-detail-comments-input-inner">' +
            '<textarea class="task-detail-comments-input" id="task-detail-comment-input" placeholder="Escribe un comentario..." rows="1"></textarea>' +
            '</div>' +
            '<div class="task-detail-comments-input-actions">' +
            '<button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only task-detail-comments-attach" id="task-detail-comment-attach-btn" aria-label="Adjuntar imagen o documento"><i class="far fa-paperclip"></i></button>' +
            '<button type="button" class="ubits-button ubits-button--primary ubits-button--sm ubits-button--icon-only" id="task-detail-comment-send" aria-label="Enviar"><i class="far fa-paper-plane"></i></button>' +
            '</div></div></div>';
        var el = document.getElementById('task-detail-comments-block');
        if (el) el.innerHTML = html;


        var sendBtn = document.getElementById('task-detail-comment-send');
        var inputEl = document.getElementById('task-detail-comment-input');
        var fileInput = document.getElementById('task-detail-comment-files');
        var attachBtn = document.getElementById('task-detail-comment-attach-btn');

        // Restaurar el strip de previews si había imágenes o documentos pendientes
        renderPendingImagesPreview();
        renderPendingFilesPreview();

        if (attachBtn && fileInput) {
            attachBtn.addEventListener('click', function () { fileInput.click(); });
            fileInput.addEventListener('change', function () {
                var files = this.files;
                if (!files || !files.length) return;
                var toLoad = 0;
                for (var i = 0; i < files.length; i++) {
                    if (files[i].type.startsWith('image/')) toLoad++;
                }
                var loaded = 0;
                for (var j = 0; j < files.length; j++) {
                    var file = files[j];
                    if (file.type.startsWith('image/')) {
                        (function (f) {
                            var reader = new FileReader();
                            reader.onload = function () {
                                if (reader.result) pendingImages.push(reader.result);
                                loaded++;
                                if (loaded >= toLoad) renderPendingImagesPreview();
                            };
                            reader.readAsDataURL(f);
                        })(file);
                    } else {
                        var blobUrl = URL.createObjectURL(file);
                        pendingFiles.push({ name: file.name, type: file.type, size: file.size, url: blobUrl });
                        renderPendingFilesPreview();
                    }
                }
                this.value = '';
            });
        }

        if (sendBtn && inputEl) {
            // Auto-resize: crece hasta 5 líneas (~120px) y luego scroll interno
            var MAX_COMMENT_HEIGHT = 120;
            inputEl.addEventListener('input', function () {
                this.style.height = 'auto';
                this.style.height = Math.min(this.scrollHeight, MAX_COMMENT_HEIGHT) + 'px';
            });

            function doSend() {
                var text = (inputEl.value || '').trim();
                if (!text && pendingImages.length === 0 && pendingFiles.length === 0) return;
                estado.comments.push({
                    id: Date.now(),
                    author: currentUserName,
                    authorAvatar: null,
                    time: new Date().toISOString(),
                    text: text || '',
                    images: pendingImages.slice(),
                    files: pendingFiles.slice()
                });
                pendingImages.length = 0;
                pendingFiles.length = 0;
                inputEl.value = '';
                renderPendingFilesPreview();
                renderCommentsBlock();
            }
            sendBtn.onclick = doSend;
            inputEl.onkeydown = function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); doSend(); } };
        }

        function openImageOverlay(src) {
            var existing = document.getElementById('task-detail-image-overlay');
            if (existing) existing.remove();
            var overlay = document.createElement('div');
            overlay.id = 'task-detail-image-overlay';
            overlay.className = 'task-detail-image-overlay';
            overlay.setAttribute('role', 'dialog');
            overlay.setAttribute('aria-label', 'Ver imagen');
            overlay.innerHTML =
                '<div class="task-detail-image-overlay__img-wrap">' +
                '<img src="' + String(src).replace(/"/g, '&quot;') + '" alt="Imagen adjunta" class="task-detail-image-overlay__img" />' +
                '</div>' +
                '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm ubits-button--icon-only task-detail-image-overlay__close" data-tooltip="Cerrar" data-tooltip-position="bottom" aria-label="Cerrar">' +
                '<i class="far fa-times"></i></button>';
            document.body.appendChild(overlay);
            var tooltipContainer = document.getElementById('ubits-tooltip-container');
            if (tooltipContainer) tooltipContainer.style.zIndex = '10002';
            overlay.addEventListener('click', function (ev) {
                if (ev.target === overlay) closeImageOverlay();
            });
            overlay.querySelector('.task-detail-image-overlay__img-wrap').addEventListener('click', function (ev) { ev.stopPropagation(); });
            overlay.querySelector('.task-detail-image-overlay__close').addEventListener('click', function () { closeImageOverlay(); });
            if (typeof initTooltip === 'function') initTooltip('.task-detail-image-overlay__close');
        }
        function closeImageOverlay() {
            var el = document.getElementById('task-detail-image-overlay');
            if (el && el.parentNode) el.remove();
            var tooltipContainer = document.getElementById('ubits-tooltip-container');
            if (tooltipContainer) tooltipContainer.style.zIndex = '10000';
        }

        // Imágenes en el feed: click para ver en overlay (no modal); cerrar con botón o clic fuera
        var feedEl = document.getElementById('task-detail-comments-feed');
        if (feedEl) {
            feedEl.querySelectorAll('.task-detail-comment-images img').forEach(function (img) {
                img.style.cursor = 'pointer';
                img.addEventListener('click', function () {
                    openImageOverlay(img.src);
                });
            });

            // Documentos en el feed: tooltip "Descargar archivo" y clic para descargar (si hay URL)
            feedEl.querySelectorAll('.task-detail-comment-file-chip').forEach(function (chip) {
                var url = chip.getAttribute('data-file-url');
                if (url) chip.style.cursor = 'pointer';
                chip.addEventListener('click', function () {
                    var u = chip.getAttribute('data-file-url');
                    if (!u) return;
                    var a = document.createElement('a');
                    a.href = u;
                    a.download = chip.getAttribute('data-file-name') || '';
                    a.target = '_blank';
                    a.rel = 'noopener noreferrer';
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                });
                chip.addEventListener('keydown', function (e) {
                    if ((e.key === 'Enter' || e.key === ' ') && chip.getAttribute('data-file-url')) {
                        e.preventDefault();
                        chip.click();
                    }
                });
            });
            if (typeof initTooltip === 'function') initTooltip('.task-detail-comment-file-chip[data-tooltip]');

            /* Scroll automático al elemento más reciente (parte inferior del feed) */
            feedEl.scrollTop = feedEl.scrollHeight;
        }
    }

    function getTaskIdFromUrl() {
        var params = new URLSearchParams(window.location.search || '');
        var id = params.get('id');
        if (id == null || id === '') return null;
        var num = Number(id);
        return isNaN(num) ? id : num;
    }

    function initTaskDetailPage() {
        var taskId = getTaskIdFromUrl();
        var detail = null;

        /* ── Nivel 1: BD unificada (IDs reales generados por generarDatos) ── */
        if (taskId != null && typeof window.TAREAS_PLANES_DB !== 'undefined' && typeof window.TAREAS_PLANES_DB.getTaskDetail === 'function') {
            detail = window.TAREAS_PLANES_DB.getTaskDetail(taskId);
        }

        /* ── Nivel 2: sessionStorage fallback (IDs sintéticos: vista líder 90000+) ── */
        if (!detail && taskId != null) {
            try {
                var raw = sessionStorage.getItem('task_detail_fallback');
                if (raw) {
                    var fb = JSON.parse(raw);
                    /* Solo usar el fallback si coincide con el id de la URL */
                    if (fb && String(fb.id) === String(taskId)) {
                        /* Limpiar para que no se reutilice en otra navegación */
                        sessionStorage.removeItem('task_detail_fallback');
                        /* Construir un detalle mínimo con los datos de la tirilla */
                        detail = {
                            task: {
                                id: fb.id,
                                name: fb.name || 'Tarea sin título',
                                description: fb.description || null,
                                status: fb.status || 'Activo',
                                done: fb.status === 'Finalizado',
                                priority: fb.priority || 'media',
                                endDate: fb.endDate || null,
                                assignee_name: fb.assignee_name || null,
                                assignee_avatar_url: fb.assignee_avatar_url || null,
                                assignee_email: fb.assignee_email || null,
                                created_by: fb.created_by || null,
                                created_by_avatar_url: fb.created_by_avatar_url || null,
                                planId: fb.planId || null,
                                planNombre: fb.planNombre || null,
                                created_at: new Date().toISOString()
                            },
                            subtasks: [],
                            comments: [],
                            activities: []
                        };
                    }
                }
            } catch (e) { /* sessionStorage no disponible o JSON inválido */ }
        }

        /* ── Nivel 3: mocks (cuando no hay id en la URL o no hay datos) ── */
        if (detail && detail.task) {
            estado.task = detail.task;
            estado.subtasks = detail.subtasks || [];
            estado.comments = detail.comments || [];
            estado.activities = detail.activities || [];
        } else {
            estado.task = getMockTask();
            estado.subtasks = getMockSubtasks();
            estado.comments = getMockComments();
            estado.activities = getMockActivities();
        }

        /* Modal eliminar subtarea (igual que tareas.html: confirmación antes de eliminar) */
        var modalsContainer = document.getElementById('task-detail-modals-container');
        if (modalsContainer && typeof getModalHtml === 'function' && !document.getElementById('task-detail-delete-subtask-modal-overlay')) {
            var deleteSubtaskBody = '<p class="ubits-body-md-regular">¿Estás seguro? Esta acción no se puede deshacer y se perderán los datos de la subtarea.</p>';
            var deleteSubtaskFooter = '<button type="button" class="ubits-button ubits-button--secondary ubits-button--md" id="task-detail-delete-subtask-cancel"><span>Cancelar</span></button><button type="button" class="ubits-button ubits-button--error ubits-button--md" id="task-detail-delete-subtask-confirm"><span>Eliminar</span></button>';
            modalsContainer.innerHTML = getModalHtml({
                overlayId: 'task-detail-delete-subtask-modal-overlay',
                title: 'Eliminar subtarea',
                bodyHtml: deleteSubtaskBody,
                footerHtml: deleteSubtaskFooter,
                size: 'sm',
                closeButtonId: 'task-detail-delete-subtask-close'
            });
            var overlayDel = document.getElementById('task-detail-delete-subtask-modal-overlay');
            var closeBtn = document.getElementById('task-detail-delete-subtask-close');
            var cancelBtn = document.getElementById('task-detail-delete-subtask-cancel');
            var confirmBtn = document.getElementById('task-detail-delete-subtask-confirm');
            function closeDeleteSubtaskModal() {
                if (typeof closeModal === 'function') closeModal('task-detail-delete-subtask-modal-overlay');
                subtaskIdToDelete = null;
            }
            if (closeBtn) closeBtn.addEventListener('click', closeDeleteSubtaskModal);
            if (cancelBtn) cancelBtn.addEventListener('click', closeDeleteSubtaskModal);
            if (overlayDel) overlayDel.addEventListener('click', function (ev) { if (ev.target === overlayDel) closeDeleteSubtaskModal(); });
            if (confirmBtn) {
                confirmBtn.addEventListener('click', function () {
                    var id = subtaskIdToDelete;
                    if (id != null) {
                        var idx = estado.subtasks.findIndex(function (s) { return String(s.id) === String(id); });
                        if (idx >= 0) {
                            var name = estado.subtasks[idx].name || '';
                            estado.subtasks.splice(idx, 1);
                            pushActivity('fa-trash', currentUserName, 'eliminó la subtarea \u201C' + name + '\u201D.');
                            renderSubtasksBlock();
                            renderCommentsBlock();
                            triggerFakeSave();
                            if (typeof showToast === 'function') showToast('success', 'Subtarea eliminada');
                        }
                    }
                    closeDeleteSubtaskModal();
                });
            }
        }

        /* Delegación: clic en Eliminar de una subtarea (tirilla) abre el modal */
        document.body.addEventListener('click', function (e) {
            var list = document.getElementById('task-detail-subtasks-list');
            if (!list || !list.contains(e.target)) return;
            var btn = e.target.closest('.tarea-action-btn--delete');
            if (!btn) return;
            e.preventDefault();
            e.stopPropagation();
            var id = btn.getAttribute('data-tarea-id');
            if (id != null && id !== '') {
                subtaskIdToDelete = id;
                if (typeof showModal === 'function') showModal('task-detail-delete-subtask-modal-overlay');
            }
        });

        /* Abrir calendario para cambiar fecha de una subtarea */
        function openSubtaskFechaCalendar(triggerBtn, subtaskId) {
            var subtask = estado.subtasks.find(function (s) { return String(s.id) === String(subtaskId); });
            if (!subtask || typeof window.createCalendar !== 'function') return;
            var popoverId = 'task-detail-subtask-fecha-popover';
            var popover = document.getElementById(popoverId);
            if (!popover) {
                popover = document.createElement('div');
                popover.id = popoverId;
                popover.className = 'ubits-calendar-dropdown';
                popover.innerHTML = '<div id="task-detail-subtask-fecha-calendar-container"></div>';
                popover.style.cssText = 'position:fixed;display:none;z-index:10100;';
                document.body.appendChild(popover);
                document.addEventListener('click', function closeOnClickOutside(ev) {
                    if (popover.style.display !== 'none' && !popover.contains(ev.target) && !ev.target.closest('.tarea-fecha-btn')) {
                        popover.style.display = 'none';
                    }
                });
            }
            var container = document.getElementById('task-detail-subtask-fecha-calendar-container');
            if (!container) return;
            container.innerHTML = '';
            var rect = triggerBtn.getBoundingClientRect();
            var pad = 16, gapDown = 4, gapUp = 0;
            function positionWrapper() {
                var w = popover.offsetWidth || 312, h = popover.offsetHeight || 382;
                var vw = window.innerWidth, vh = window.innerHeight;
                var left = Math.max(pad, Math.min(vw - w - pad, rect.right - w));
                var spaceBelow = vh - rect.bottom - pad, spaceAbove = rect.top - pad;
                var top = spaceBelow >= h ? rect.bottom + gapDown : (spaceAbove >= h ? rect.top - h - gapUp : (spaceBelow >= spaceAbove ? rect.bottom + gapDown : rect.top - h - gapUp));
                top = Math.max(pad, Math.min(vh - h - pad, top));
                popover.style.left = left + 'px';
                popover.style.top = top + 'px';
            }
            popover.style.display = 'block';
            positionWrapper();
            var selectedDateDmy = subtask.endDate ? ymdToDmySlash(subtask.endDate) : '';
            window.createCalendar({
                containerId: 'task-detail-subtask-fecha-calendar-container',
                selectedDate: selectedDateDmy || undefined,
                initialDate: selectedDateDmy ? undefined : new Date(),
                onDateSelect: function (dateStr) {
                    var ymd = dmySlashToYmd(dateStr);
                    subtask.endDate = ymd || null;
                    renderSubtasksBlock();
                    renderCommentsBlock();
                    triggerFakeSave();
                    popover.style.display = 'none';
                    if (typeof showToast === 'function') showToast('success', 'Fecha de vencimiento actualizada');
                }
            });
            requestAnimationFrame(positionWrapper);
        }

        /* Delegación subtareas: prioridad, fecha y asignado en la tirilla (usar bloque para que siga funcionando tras cada render) */
        document.body.addEventListener('click', function (e) {
            var block = document.getElementById('task-detail-subtasks-block');
            if (!block || !block.contains(e.target)) return;

            var row = e.target.closest('.tarea-item');
            if (!row) return;
            var subtaskId = row.dataset.tareaId || row.getAttribute('data-tarea-id');
            var subtask = subtaskId != null ? estado.subtasks.find(function (s) { return String(s.id) === String(subtaskId); }) : null;
            if (!subtask) return;

            /* Clic en prioridad: dropdown Baja/Media/Alta */
            if (e.target.closest('.tarea-priority-badge') && typeof window.getDropdownMenuHtml === 'function' && typeof window.openDropdownMenu === 'function' && typeof window.closeDropdownMenu === 'function') {
                e.preventDefault();
                e.stopPropagation();
                var badge = e.target.closest('.tarea-priority-badge');
                var overlayId = 'task-detail-subtask-priority-overlay-' + subtaskId;
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
                            subtask.priority = val;
                            renderSubtasksBlock();
                            renderCommentsBlock();
                            triggerFakeSave();
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

            /* Clic en asignado (avatar): dropdown reasignar */
            if (e.target.closest('.tarea-assigned')) {
                e.preventDefault();
                e.stopPropagation();
                var assignedEl = e.target.closest('.tarea-assigned');
                openAssigneeDropdown(assignedEl, subtask, function () {
                    renderSubtasksBlock();
                    renderCommentsBlock();
                    triggerFakeSave();
                });
                return;
            }

            /* Clic en fecha: abrir calendario */
            if (e.target.closest('.tarea-fecha-btn')) {
                e.preventDefault();
                e.stopPropagation();
                openSubtaskFechaCalendar(e.target.closest('.tarea-fecha-btn'), subtaskId);
                return;
            }
        });

        if (typeof loadHeaderProduct === 'function') {
            loadHeaderProduct('task-detail-header-container', {
                productName: 'Detalle de la tarea',
                breadcrumbItems: [],
                backButton: {
                    onClick: function () { window.history.back(); }
                },
                secondaryButtons: [], // Sin botón Compartir; solo opciones (menú)
                menuButton: {
                    onClick: function () { /* opciones */ }
                }
            });
            if (typeof renderSaveIndicator === 'function') {
                renderSaveIndicator('task-detail-header-container-save-indicator', { state: 'idle', size: 'sm' });
            }
        }

        renderInfoBlock();
        renderSubtasksBlock();
        renderCommentsBlock();
    }

    window.initTaskDetailPage = initTaskDetailPage;
})();
