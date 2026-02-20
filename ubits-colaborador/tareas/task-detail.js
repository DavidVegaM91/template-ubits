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

    var estado = {
        task: null,
        subtasks: [],
        comments: [],
        activities: [],
        massPanelOpen: false,
        addingSubtask: false
    };

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

    function getMockComments() {
        return [
            { id: 1, author: 'Carlos Ruiz', authorAvatar: null, time: new Date(Date.now() - 2 * 3600000).toISOString(), text: '¿Ya terminaste con la integración de los webhooks? Necesito que esté listo para el deploy de mañana.', images: [] },
            { id: 2, author: 'María González', authorAvatar: null, time: new Date(Date.now() - 1 * 3600000).toISOString(), text: 'Estoy en ello. Justo acabo de pegar las subtareas pendientes en el sistema para que todos vean el progreso.', images: [] }
        ];
    }

    function getMockActivities() {
        return [
            { id: 1, time: new Date().toISOString(), text: 'Sistema añadió 5 nuevas subtareas al listado.', icon: 'fa-arrows-rotate' }
        ];
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
            esVencidaSection: false
        };
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
        var fechaDisplay = formatDateDDMM(task.endDate) || 'Sin fecha';

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
            '<input type="text" class="task-detail-title-editable ubits-body-md-bold" id="task-detail-title" placeholder="Título de la tarea" value="' + escapeHtml(task.name) + '" maxlength="250" />' +
            '<textarea class="task-detail-desc-editable ubits-body-sm-regular" id="task-detail-desc" placeholder="Descripción de la tarea" rows="3">' + escapeHtml(task.description || '') + '</textarea>' +
            '<div class="task-detail-attributes-row">' +
            '<span class="task-detail-meta-cell">' +
            '<span class="ubits-body-sm-semibold task-detail-meta-label">Estado</span>' +
            '<span class="ubits-status-tag ubits-status-tag--sm ubits-status-tag--' + statusSlug + '"><span class="ubits-status-tag__text">' + escapeHtml(statusDisplay) + '</span></span></span>' +
            '<span class="task-detail-meta-cell">' +
            '<span class="ubits-body-sm-semibold task-detail-meta-label">Prioridad</span>' +
            '<span class="ubits-badge-tag ubits-badge-tag--outlined ubits-badge-tag--' + (prioridadVariant[prioridad] || 'warning') + ' ubits-badge-tag--sm ubits-badge-tag--with-icon">' +
            '<i class="far ' + (prioridadIcon[prioridad] || 'fa-chevron-up') + '"></i><span class="ubits-badge-tag__text">' + escapeHtml(prioridadLabel) + '</span></span></span>' +
            '<span class="task-detail-meta-cell">' +
            '<span class="ubits-body-sm-semibold task-detail-meta-label">Vencimiento</span>' +
            '<span class="ubits-body-sm-regular" style="display:inline-flex;align-items:center;gap:6px;"><i class="far fa-calendar" style="color: var(--ubits-fg-1-medium);"></i>' + escapeHtml(fechaDisplay) + '</span></span>' +
            '</div>';
        var el = document.getElementById('task-detail-info-block');
        if (el) el.innerHTML = html;
    }

    function renderSubtasksBlock() {
        var list = estado.subtasks;
        var completed = list.filter(function (t) { return t.done; }).length;
        var total = list.length;
        var opts = getTaskStripOpts();
        var listHtml = list.length
            ? list.map(function (t) { return window.renderTaskStrip(t, opts); }).join('')
            : '';
        var massPanel = estado.massPanelOpen
            ? '<div class="task-detail-mass-panel is-open" id="task-detail-mass-panel">' +
            '<div class="task-detail-mass-panel-header">' +
            '<h3 class="task-detail-mass-panel-title"><i class="far fa-folder"></i> Modo creación masiva</h3>' +
            '<span class="task-detail-mass-panel-detected" id="task-detail-mass-detected">Se detectaron 0 subtareas</span></div>' +
            '<textarea class="task-detail-mass-panel-textarea" id="task-detail-mass-textarea" placeholder="Escribe una subtarea por línea&#10;Línea 1&#10;Línea 2&#10;..."></textarea>' +
            '<div class="task-detail-mass-panel-options">' +
            '<div class="task-detail-mass-panel-date"><span class="ubits-body-sm-regular">Fecha</span><div id="task-detail-mass-date-wrap"></div></div>' +
            '<div class="task-detail-mass-panel-priority"><span class="ubits-body-sm-regular">Prioridad</span><div id="task-detail-mass-priority-wrap"></div></div>' +
            '<div class="task-detail-mass-panel-actions">' +
            '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm" id="task-detail-mass-cancel"><span>Cancelar</span></button>' +
            '<button type="button" class="ubits-button ubits-button--primary ubits-button--sm" id="task-detail-mass-create"><span>Crear subtareas</span></button>' +
            '</div></div>' +
            '<p class="task-detail-mass-panel-tip">Tip: Pega varias líneas de texto para crear múltiples subtareas a la vez.</p>' +
            '</div>'
            : '<div class="task-detail-mass-panel" id="task-detail-mass-panel"></div>';

        var html =
            '<div class="task-detail-subtasks-header">' +
            '<h2 class="ubits-body-md-bold task-detail-subtasks-title"><i class="far fa-list-check"></i> Subtareas</h2>' +
            '<span class="ubits-body-sm-regular task-detail-subtasks-counter">' + completed + '/' + total + ' Completadas</span></div>' +
            '<div class="task-detail-subtasks-list" id="task-detail-subtasks-list">' + listHtml + '</div>' +
            '<div class="task-detail-add-row">' +
            '<form class="task-detail-add-subtask-form" id="task-detail-add-subtask-form" style="max-width: 320px;">' +
            '<div class="tarea-add-icon"><i class="far fa-plus"></i></div>' +
            '<input type="text" class="ubits-input ubits-input--sm" placeholder="Agregar una subtarea" data-subtask-add />' +
            '</form>' +
            '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm" id="task-detail-mass-btn">' +
            '<i class="far fa-list"></i><span>Creación a partir de lista de texto</span></button>' +
            '</div>' + massPanel;
        var el = document.getElementById('task-detail-subtasks-block');
        if (el) el.innerHTML = html;

        if (typeof initTooltip === 'function') initTooltip('#task-detail-subtasks-block [data-tooltip]');

        var listEl = document.getElementById('task-detail-subtasks-list');
        if (listEl) {
            listEl.querySelectorAll('.tarea-done-radio').forEach(function (radioWrap) {
                var id = radioWrap.dataset.tareaId;
                if (!id) return;
                var input = radioWrap.querySelector('input[type="radio"]');
                if (input) {
                    input.addEventListener('change', function () {
                        var t = estado.subtasks.find(function (s) { return String(s.id) === String(id); });
                        if (t) {
                            t.done = !!this.checked;
                            t.status = t.done ? 'Finalizado' : 'Activo';
                            renderSubtasksBlock();
                        }
                    });
                }
            });
        }

        var addForm = document.getElementById('task-detail-add-subtask-form');
        if (addForm) {
            addForm.onsubmit = function (e) {
                e.preventDefault();
                var inp = addForm.querySelector('input[data-subtask-add]');
                if (inp && inp.value.trim()) {
                    estado.subtasks.push({
                        id: Date.now(),
                        name: inp.value.trim(),
                        done: false,
                        status: 'Activo',
                        endDate: estado.task ? estado.task.endDate : today,
                        priority: estado.task ? estado.task.priority : 'media',
                        assignee_name: estado.task ? estado.task.assignee_name : null,
                        assignee_email: null,
                        assignee_avatar_url: null
                    });
                    inp.value = '';
                    renderSubtasksBlock();
                }
            };
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
                        estado.subtasks.push({ id: Date.now() + Math.random(), name: name, done: false, status: 'Activo', endDate: endDate, priority: priority, assignee_name: null, assignee_email: null, assignee_avatar_url: null });
                    });
                    estado.massPanelOpen = false;
                    renderSubtasksBlock();
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

    function renderCommentsBlock() {
        var comments = estado.comments;
        var activities = estado.activities;
        var total = comments.length;
        var feed = [];
        comments.forEach(function (c) {
            var authorBlock = typeof renderAvatar === 'function'
                ? renderAvatar({ nombre: c.author, avatar: c.authorAvatar }, { size: 'sm' })
                : '<span class="ubits-avatar ubits-avatar--sm"><span class="ubits-avatar__fallback"><i class="far fa-user"></i></span></span>';
            feed.push(
                '<div class="task-detail-comment-item">' +
                '<div class="task-detail-comment-avatar">' + authorBlock + '</div>' +
                '<div class="task-detail-comment-body">' +
                '<div class="task-detail-comment-meta">' +
                '<span class="task-detail-comment-author">' + escapeHtml(c.author) + '</span>' +
                '<span class="task-detail-comment-time">' + formatCommentTime(c.time) + '</span></div>' +
                '<p class="task-detail-comment-text">' + escapeHtml(c.text) + '</p>' +
                (c.images && c.images.length ? '<div class="task-detail-comment-images">' + c.images.map(function (img) { return '<img src="' + escapeHtml(img) + '" alt="" style="max-width:120px;height:auto;border-radius:8px;">'; }).join('') + '</div>' : '') +
                '</div></div>'
            );
        });
        if (activities.length) {
            feed.push('<div class="task-detail-comments-separator"><span>Hoy</span></div>');
            activities.forEach(function (a) {
                feed.push(
                    '<div class="task-detail-activity-item">' +
                    '<i class="far ' + (a.icon || 'fa-circle-info') + '"></i>' +
                    '<span class="task-detail-activity-text">' + escapeHtml(a.text) + '</span></div>'
                );
            });
        }
        var html =
            '<div class="task-detail-comments-header">' +
            '<h2 class="task-detail-comments-header-title"><i class="far fa-comments"></i> Comentarios</h2>' +
            '<span class="task-detail-comments-badge">' + total + '</span></div>' +
            '<div class="task-detail-comments-feed" id="task-detail-comments-feed">' + feed.join('') + '</div>' +
            '<div class="task-detail-comments-input-wrap">' +
            '<div class="task-detail-comments-input-row">' +
            '<div class="ubits-input-wrapper" style="flex:1;min-width:0;">' +
            '<div class="ubits-input-inner">' +
            '<input type="text" class="ubits-input ubits-input--md" id="task-detail-comment-input" placeholder="Escribe un comentario..." />' +
            '</div></div>' +
            '<button type="button" class="ubits-button ubits-button--primary ubits-button--md ubits-button--icon-only" id="task-detail-comment-send" aria-label="Enviar"><i class="far fa-paper-plane"></i></button>' +
            '</div>' +
            '<div class="task-detail-comments-input-actions">' +
            '<button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only" aria-label="Adjuntar"><i class="far fa-paperclip"></i></button>' +
            '<button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only" aria-label="Emoji"><i class="far fa-face-smile"></i></button>' +
            '<button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only" aria-label="Mencionar"><i class="far fa-at"></i></button>' +
            '</div></div>';
        var el = document.getElementById('task-detail-comments-block');
        if (el) el.innerHTML = html;

        var sendBtn = document.getElementById('task-detail-comment-send');
        var inputEl = document.getElementById('task-detail-comment-input');
        if (sendBtn && inputEl) {
            function doSend() {
                var text = (inputEl.value || '').trim();
                if (!text) return;
                estado.comments.unshift({ id: Date.now(), author: 'María Alejandra Sánchez Pardo', authorAvatar: null, time: new Date().toISOString(), text: text, images: [] });
                inputEl.value = '';
                renderCommentsBlock();
            }
            sendBtn.onclick = doSend;
            inputEl.onkeydown = function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); doSend(); } };
        }
    }

    function initTaskDetailPage() {
        estado.task = getMockTask();
        estado.subtasks = getMockSubtasks();
        estado.comments = getMockComments();
        estado.activities = getMockActivities();

        var task = estado.task;
        var title = task ? (task.name || 'Detalle de tarea') : 'Detalle de tarea';

        if (typeof loadHeaderProduct === 'function') {
            loadHeaderProduct('task-detail-header-container', {
                productName: title,
                breadcrumbItems: [],
                backButton: {
                    onClick: function () { window.history.back(); }
                },
                secondaryButtons: [
                    { text: 'Compartir', icon: 'fa-share-nodes', onClick: function () { /* compartir */ } }
                ],
                menuButton: {
                    onClick: function () { /* opciones */ }
                }
            });
        }

        renderInfoBlock();
        renderSubtasksBlock();
        renderCommentsBlock();
    }

    window.initTaskDetailPage = initTaskDetailPage;
})();
