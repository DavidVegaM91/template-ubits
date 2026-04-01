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

    /**
     * createInput (autocomplete) coloca el dropdown como hermano del .ubits-input-wrapper dentro del contenedor;
     * con top:100% puede solapar el input. Mover el dropdown dentro del wrapper alinea el ancla al campo.
     * No modifica components/input.js (regla del template).
     */
    function reparentLearningAutocompleteDropdown(containerId) {
        var wrap = document.getElementById(containerId);
        if (!wrap) return;
        var dd = wrap.querySelector('.ubits-autocomplete-dropdown');
        var innerWrapper = wrap.querySelector('.ubits-input-wrapper');
        if (dd && innerWrapper && dd.parentNode === wrap) {
            innerWrapper.appendChild(dd);
        }
    }

    /** Máximo `maxChars` caracteres en pantalla; si sobra, corta y añade "...". */
    function truncateDisplayName(str, maxChars) {
        maxChars = typeof maxChars === 'number' ? maxChars : 25;
        if (str == null || str === '') return '';
        var s = String(str);
        if (s.length <= maxChars) return s;
        var ell = '...';
        var head = maxChars - ell.length;
        if (head < 1) head = 1;
        return s.slice(0, head) + ell;
    }

    /** Formato absoluto compartido (evita "Hace un momento" con fechas futuras por diff negativo). */
    function formatCommentTimeAbsolute(d) {
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

    /** Tiempo relativo: "Hace Xh", "Hace X días" (máx 2), o absoluto. Fechas futuras: solo absoluto (nunca relativo). */
    function formatCommentTime(dateStr) {
        const d = new Date(dateStr);
        const now = new Date();
        const diffMs = now - d;
        if (diffMs < 0) return formatCommentTimeAbsolute(d);
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        if (diffMins < 60) return 'Hace ' + (diffMins <= 1 ? 'un momento' : diffMins + ' min');
        if (diffHours < 24) return 'Hace ' + (diffHours === 1 ? '1 h' : diffHours + ' h');
        if (diffDays <= 2) return 'Hace ' + (diffDays === 1 ? '1 día' : diffDays + ' días');
        return formatCommentTimeAbsolute(d);
    }

    const today = getTodayString();
    var SAVE_INDICATOR_ID = 'task-detail-header-container-save-indicator';

    function triggerFakeSave() {
        if (typeof renderSaveIndicator !== 'function') return;
        renderSaveIndicator(SAVE_INDICATOR_ID, { state: 'saving', size: 'xs' });
        setTimeout(function () {
            renderSaveIndicator(SAVE_INDICATOR_ID, { state: 'saved', size: 'xs' });
            setTimeout(function () {
                renderSaveIndicator(SAVE_INDICATOR_ID, { state: 'idle', size: 'xs' });
            }, 2500);
        }, 800);
    }

    var estado = {
        task: null,
        subtasks: [],
        comments: [],
        activities: [],
        addingSubtask: false,
        commentsFeedFilter: 'all'  /* 'all' | 'comments' | 'events' */
    };
    var subtaskIdToDelete = null;
    var taskDetailSubtaskPendingClickTimeout = null;
    var taskDetailLastTapForEdit = null;

    function getMockTask() {
        return {
            id: 1,
            name: 'Integrar pasarela de pagos con Stripe',
            description: 'Configurar los endpoints necesarios para procesar pagos recurrentes y suscripciones. Asegurar que los webhooks estén correctamente configurados para manejar renovaciones y cancelaciones.',
            status: 'Activo',
            priority: 'alta',
            endDate: '2026-02-20',
            taskType: 'standard',
            assignee_name: 'María González',
            assignee_avatar_url: null,
            assignee_email: 'mgonzalez@ejemplo.com',
            created_by: 'Carlos Ruiz',
            created_by_avatar_url: null
        };
    }

    /** Tipo de tarea: solo `aprendizaje` o `standard` (por defecto todas las existentes). */
    function normalizeTaskTypeOnTask(task) {
        if (!task) return;
        if (task.taskType === 'aprendizaje') return;
        task.taskType = 'standard';
    }

    function taskTypeLabel(value) {
        return value === 'aprendizaje' ? 'Aprendizaje' : 'Estándar';
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

    function parseIsoMs(iso) {
        if (!iso) return NaN;
        var d = new Date(iso);
        return isNaN(d.getTime()) ? NaN : d.getTime();
    }

    /**
     * Garantiza historial mínimo (evento de creación de tarea y de cada subtarea) y que ningún
     * comentario quede con fecha anterior al evento de creación de la tarea.
     */
    function ensureTaskDetailHistoryAndOrder() {
        var task = estado.task;
        if (!task) return;
        var comments = estado.comments;
        var activities = estado.activities;
        var subtasks = estado.subtasks || [];

        var msCreated = parseIsoMs(task.created_at);
        var minCommentMs = Infinity;
        comments.forEach(function (c) {
            var m = parseIsoMs(c.time);
            if (!isNaN(m)) minCommentMs = Math.min(minCommentMs, m);
        });
        var minActMs = Infinity;
        activities.forEach(function (a) {
            var m = parseIsoMs(a.time);
            if (!isNaN(m)) minActMs = Math.min(minActMs, m);
        });
        var minSubMs = Infinity;
        subtasks.forEach(function (s) {
            var m = parseIsoMs(s.created_at);
            if (!isNaN(m)) minSubMs = Math.min(minSubMs, m);
        });
        var minContentMs = Math.min(minCommentMs, minActMs, minSubMs);

        var anchorMs;
        if (!isNaN(msCreated)) {
            anchorMs = msCreated;
            if (!isNaN(minContentMs) && minContentMs < anchorMs) {
                comments.forEach(function (c, i) {
                    var m = parseIsoMs(c.time);
                    if (!isNaN(m) && m < anchorMs) {
                        c.time = new Date(anchorMs + 1000 + i * 1000).toISOString();
                    }
                });
            }
        } else {
            if (minContentMs === Infinity) {
                anchorMs = Date.now() - 86400000;
            } else {
                anchorMs = minContentMs - 60000;
            }
            task.created_at = new Date(anchorMs).toISOString();
        }

        var hasCreacion = activities.some(function (a) {
            return a.text && /creó la tarea/i.test(String(a.text));
        });
        if (!hasCreacion) {
            var authorCreacion = task.created_by || 'Usuario';
            activities.push({
                id: 'act-seed-creacion-' + (task.id != null ? String(task.id) : 't'),
                time: new Date(anchorMs).toISOString(),
                icon: 'fa-circle-plus',
                author: authorCreacion,
                text: 'creó la tarea.'
            });
        }

        var hasBatchSubtasksEvent = activities.some(function (a) {
            return a && a.text && /subtareas en lote/i.test(String(a.text));
        });
        subtasks.forEach(function (st, idx) {
            if (hasBatchSubtasksEvent) return;
            var name = (st && st.name) ? String(st.name) : 'Subtarea';
            var hasSubEv = activities.some(function (a) {
                if (!a || !a.text) return false;
                var t = String(a.text);
                if (t.indexOf(name) === -1) return false;
                return /añadió la subtarea/i.test(t);
            });
            if (hasSubEv) return;
            var subMs = parseIsoMs(st.created_at);
            if (isNaN(subMs)) subMs = anchorMs + (idx + 1) * 60000;
            if (subMs <= anchorMs) subMs = anchorMs + (idx + 1) * 60000;
            var subAuthor = st.assignee_name || task.created_by || task.assignee_name || 'Usuario';
            activities.push({
                id: 'act-seed-sub-' + String(st.id) + '-' + (task.id != null ? String(task.id) : ''),
                time: new Date(subMs).toISOString(),
                icon: 'fa-plus-circle',
                author: subAuthor,
                text: 'añadió la subtarea \u201c' + name + '\u201d.'
            });
        });

        /* Si ya había evento "creó la tarea" pero con fecha >= al primer comentario, retroceder el evento */
        var creacionEvent = activities.find(function (a) {
            return a.text && /creó la tarea/i.test(String(a.text));
        });
        if (creacionEvent) {
            var minCommForCreacion = Infinity;
            comments.forEach(function (c) {
                var m = parseIsoMs(c.time);
                if (!isNaN(m)) minCommForCreacion = Math.min(minCommForCreacion, m);
            });
            var tEv = parseIsoMs(creacionEvent.time);
            if (!isNaN(minCommForCreacion) && !isNaN(tEv) && tEv >= minCommForCreacion) {
                creacionEvent.time = new Date(minCommForCreacion - 60000).toISOString();
            }
        }

        /* Comentarios posteriores al evento de creación */
        creacionEvent = activities.find(function (a) {
            return a.text && /creó la tarea/i.test(String(a.text));
        });
        var creacionMs = creacionEvent ? parseIsoMs(creacionEvent.time) : anchorMs;
        comments.forEach(function (c, i) {
            var m = parseIsoMs(c.time);
            if (!isNaN(m) && !isNaN(creacionMs) && m < creacionMs) {
                c.time = new Date(creacionMs + 1000 + i * 1000).toISOString();
            }
        });

        /* Comentarios no pueden quedar fechados después de «ahora» ni después del fin del día de la fecha límite (no confundir con vencimiento). */
        (function clampCommentsToReality() {
            var nowMs = Date.now();
            var endCap = task.endDate ? (function () {
                var p = String(task.endDate).split('-').map(Number);
                if (p.length !== 3) return nowMs;
                return new Date(p[0], p[1] - 1, p[2], 23, 59, 59, 999).getTime();
            })() : nowMs;
            var capMs = Math.min(nowMs, endCap);
            creacionMs = creacionEvent ? parseIsoMs(creacionEvent.time) : anchorMs;
            if (isNaN(creacionMs)) creacionMs = capMs - 3600000;
            comments.forEach(function (c, i) {
                var m = parseIsoMs(c.time);
                if (isNaN(m)) return;
                if (m > capMs) m = capMs - (comments.length - i) * 2000;
                if (m <= creacionMs) m = creacionMs + 2000 + i * 1500;
                if (m > capMs) m = capMs;
                c.time = new Date(m).toISOString();
            });
        })();
    }

    function getFeedSortKey(item) {
        var t = new Date(item.time).getTime();
        if (isNaN(t)) return 0;
        var tie = 0;
        if (item.type === 'activity' && item.data && item.data.text && /creó la tarea/i.test(String(item.data.text))) tie = 0;
        else if (item.type === 'activity') tie = 1;
        else tie = 2;
        return t * 100000 + tie;
    }

    /**
     * Modal UBITS de confirmación antes de enviar recordatorio por correo (tarea principal o subtarea).
     */
    function openTaskRecordatorioConfirmModal(onConfirm) {
        if (typeof onConfirm !== 'function') return;
        if (typeof getModalHtml !== 'function' || typeof showModal !== 'function') {
            onConfirm();
            return;
        }
        var overlayId = 'task-detail-recordatorio-confirm-overlay';
        var existing = document.getElementById(overlayId);
        if (existing) existing.remove();
        var modalsContainer = document.getElementById('task-detail-modals-container');
        if (!modalsContainer) {
            onConfirm();
            return;
        }
        var closeButtonId = 'task-detail-recordatorio-confirm-close';
        var bodyHtml = '<p class="ubits-body-md-regular">Se enviará un correo al asignado con un recordatorio sobre esta tarea.</p>';
        var footerHtml = '<button type="button" class="ubits-button ubits-button--secondary ubits-button--md" id="task-detail-recordatorio-cancel"><span>Cancelar</span></button><button type="button" class="ubits-button ubits-button--primary ubits-button--md" id="task-detail-recordatorio-confirm"><span>Confirmar</span></button>';
        modalsContainer.innerHTML += getModalHtml({
            overlayId: overlayId,
            title: 'Enviar recordatorio',
            bodyHtml: bodyHtml,
            footerHtml: footerHtml,
            size: 'sm',
            closeButtonId: closeButtonId
        });
        showModal(overlayId);
        var overlay = document.getElementById(overlayId);
        var closeBtn = document.getElementById(closeButtonId);
        var cancelBtn = document.getElementById('task-detail-recordatorio-cancel');
        var confirmBtn = document.getElementById('task-detail-recordatorio-confirm');
        function closeRecordatorioModal() {
            if (typeof closeModal === 'function') closeModal(overlayId);
            if (overlay && overlay.parentNode) overlay.remove();
        }
        if (closeBtn) closeBtn.addEventListener('click', closeRecordatorioModal);
        if (cancelBtn) cancelBtn.addEventListener('click', closeRecordatorioModal);
        if (overlay) overlay.addEventListener('click', function (e) { if (e.target === overlay) closeRecordatorioModal(); });
        if (confirmBtn) {
            confirmBtn.addEventListener('click', function () {
                closeRecordatorioModal();
                onConfirm();
            });
        }
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

    function normalizeName(str) {
        if (str == null) return '';
        return String(str)
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function getPlanesParaSelector() {
        var targetCreator = 'María Alejandra Sánchez Pardo';
        if (typeof TAREAS_PLANES_DB === 'undefined' || typeof TAREAS_PLANES_DB.getPlanesVistaPlanes !== 'function') return [];
        var planes = TAREAS_PLANES_DB.getPlanesVistaPlanes();
        if (!Array.isArray(planes)) return [];
        return planes
            .filter(function (p) {
                return normalizeName(p && p.created_by) === normalizeName(targetCreator);
            })
            .map(function (p) {
                return {
                    id: p.id,
                    name: p.name || 'Plan sin nombre'
                };
            });
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
                var isSubtask = estado.task && entity !== estado.task;
                if (val === 'none') {
                    entity.assignee_email = null;
                    entity.assignee_name = null;
                    entity.assignee_avatar_url = null;
                    pushActivity('fa-user-pen', currentUserName, isSubtask ? 'dejó la subtarea "' + (entity.name || '') + '" sin asignar.' : 'dejó la tarea sin asignar.');
                } else {
                    var user = users.find(function (u) { return String(u.id) === val; });
                    if (user) {
                        var nuevoNombre = user.full_name || user.email || '';
                        entity.assignee_email = user.email;
                        entity.assignee_name = user.full_name || user.email;
                        entity.assignee_avatar_url = user.avatar_url;
                        var assignText = isSubtask ? 'asignó la subtarea "' + (entity.name || '') + '" a ' + nuevoNombre + '.' : 'asignó la tarea a ' + nuevoNombre + '.';
                        pushActivity('fa-user-pen', currentUserName, assignText);
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
        var planesDisponibles = getPlanesParaSelector();
        var selectOptionsPlanes = [{ value: '', text: 'Seleccionar plan' }].concat(
            planesDisponibles.map(function (p) {
                return { value: String(p.id), text: p.name };
            })
        );
        var selectedPlanValue = '';
        if (task.planId != null && task.planId !== '') {
            selectedPlanValue = String(task.planId);
        } else if (task.planNombre) {
            var planByName = planesDisponibles.find(function (p) { return p.name === task.planNombre; });
            if (planByName) selectedPlanValue = String(planByName.id);
        }
        var assigneeName = task.assignee_name || (task.assignee_email ? task.assignee_email.split('@')[0] : 'Sin asignar');
        var creatorName = task.created_by || 'Sin especificar';
        var assigneeDisplay = truncateDisplayName(assigneeName, 25);
        var creatorDisplay = truncateDisplayName(creatorName, 25);
        var assigneeBlock = typeof renderAvatar === 'function'
            ? renderAvatar({ nombre: assigneeName, avatar: task.assignee_avatar_url }, { size: 'xs' })
            : '<span class="ubits-avatar ubits-avatar--sm"><span class="ubits-avatar__fallback"><i class="far fa-user"></i></span></span>';
        var creatorBlock = typeof renderAvatar === 'function'
            ? renderAvatar({ nombre: creatorName, avatar: task.created_by_avatar_url }, { size: 'xs' })
            : '<span class="ubits-avatar ubits-avatar--sm"><span class="ubits-avatar__fallback"><i class="far fa-user"></i></span></span>';

        var prioridadIcon = { alta: 'fa-chevrons-up', media: 'fa-chevron-up', baja: 'fa-chevron-down' };
        var prioridadVariant = { alta: 'error', media: 'warning', baja: 'info' };
        var isAprendizaje = task.taskType === 'aprendizaje';
        /** Con Aprendizaje + Finalizada no se muestra el buscador: el contenido ya no debe cambiarse. */
        var isLearningFinished = isAprendizaje && task.status === 'Finalizado';
        var showPlanAlert = !selectedPlanValue;
        var planAlertHtml = showPlanAlert
            ? '<div id="task-detail-plan-alert-wrap" class="task-detail-plan-alert-wrap">' +
              '<div class="ubits-alert ubits-alert--info ubits-alert--no-close" role="status">' +
              '<div class="ubits-alert__icon">' +
              '<i class="far fa-info-circle"></i>' +
              '</div>' +
              '<div class="ubits-alert__content">' +
              '<div class="ubits-alert__text">Asigna la tarea a un plan para simplificar su organización y facilitar su seguimiento.</div>' +
              '</div>' +
              '</div>' +
              '</div>'
            : '';
        var html =
            '<div class="task-detail-title-row">' +
            (isAprendizaje
                ? '<span class="task-detail-title-type-icon" title="Aprendizaje" aria-hidden="true"><i class="far fa-graduation-cap"></i></span>'
                : '') +
            '<textarea class="task-detail-title-editable ubits-heading-h1" id="task-detail-title" placeholder="Título de la tarea" rows="1" maxlength="250">' + escapeHtml(task.name) + '</textarea>' +
            '<div class="task-detail-title-actions">' +
            '<div class="task-detail-title-action-btns">' +
            '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm ubits-button--icon-only" id="task-detail-title-recordatorio-btn" aria-label="Enviar recordatorio" data-tooltip="Enviar recordatorio"><i class="far fa-bell"></i></button>' +
            '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm ubits-button--icon-only" id="task-detail-title-delete-btn" aria-label="Eliminar tarea" data-tooltip="Eliminar tarea"><i class="far fa-trash"></i></button>' +
            '</div>' +
            '<button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only task-detail-title-options-btn" id="task-detail-title-options-btn" aria-label="Opciones" data-tooltip="Opciones"><i class="far fa-ellipsis-vertical"></i></button>' +
            '</div>' +
            '</div>' +
            '<textarea class="task-detail-desc-editable ubits-body-sm-regular" id="task-detail-desc" placeholder="Descripción de la tarea" rows="1">' + escapeHtml(task.description || '') + '</textarea>' +
            '<div class="task-detail-meta-row">' +
            '<div class="task-detail-meta-cell">' +
            '<span class="ubits-body-sm-semibold task-detail-meta-label">Asignado a</span>' +
            '<div class="task-detail-assignee-row" id="task-detail-assignee-row" role="button" tabindex="0">' +
            assigneeBlock +
            '<span class="ubits-body-sm-regular task-detail-assignee-name-text" title="' + escapeHtml(assigneeName) + '">' + escapeHtml(assigneeDisplay) + '</span>' +
            '<i class="far fa-chevron-down" style="font-size: var(--font-size-sm); color: var(--ubits-fg-1-medium);"></i>' +
            '</div></div>' +
            '<div class="task-detail-meta-cell">' +
            '<span class="ubits-body-sm-semibold task-detail-meta-label">Creada por</span>' +
            '<div class="task-detail-creator-row">' +
            creatorBlock +
            '<span class="ubits-body-sm-regular task-detail-creator-name-text" title="' + escapeHtml(creatorName) + '">' + escapeHtml(creatorDisplay) + '</span>' +
            '</div></div>' +
            '<div class="task-detail-meta-cell">' +
            '<span id="task-detail-vencimiento-label" class="ubits-body-sm-semibold task-detail-meta-label">Finaliza el:</span>' +
            '<div id="task-detail-vencimiento-wrap"></div></div>' +
            '</div>' +
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
            '<span id="task-detail-plan-label" class="ubits-body-sm-semibold task-detail-meta-label">Plan</span>' +
            '<div id="task-detail-plan-wrap"></div></span>' +
            '<span class="task-detail-meta-cell">' +
            '<span id="task-detail-type-label" class="ubits-body-sm-semibold task-detail-meta-label">Tipo</span>' +
            '<div id="task-detail-type-wrap"></div></span>' +
            '</div>' +
            (isAprendizaje && showPlanAlert ? planAlertHtml : '') +
            (isAprendizaje
                ? '<div class="task-detail-learning-content-box' + (isLearningFinished ? ' task-detail-learning-content-box--finished' : '') + '">' +
                (isLearningFinished
                    ? ''
                    : '<div class="task-detail-learning-content-row">' +
                    '<div id="task-detail-learning-content-wrap"></div>' +
                    '</div>') +
                '<div id="task-detail-learning-content-card-wrap" class="task-detail-learning-content-card-wrap"></div>' +
                '</div>'
                : '') +
            (!isAprendizaje && showPlanAlert ? planAlertHtml : '');
        var el = document.getElementById('task-detail-info-block');
        if (el) el.innerHTML = html;
        if (typeof createInput === 'function') {
            createInput({
                containerId: 'task-detail-vencimiento-wrap',
                type: 'calendar',
                size: 'xs',
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
        if (typeof createInput === 'function') {
            var taskTypeValue = task.taskType === 'aprendizaje' ? 'aprendizaje' : 'standard';
            createInput({
                containerId: 'task-detail-type-wrap',
                type: 'select',
                size: 'xs',
                showLabel: false,
                placeholder: 'Tipo',
                selectOptions: [
                    { value: 'standard', text: 'Estándar' },
                    { value: 'aprendizaje', text: 'Aprendizaje' }
                ],
                value: taskTypeValue,
                onChange: function (val) {
                    if (!estado.task) return;
                    var next = val === 'aprendizaje' ? 'aprendizaje' : 'standard';
                    var prev = estado.task.taskType === 'aprendizaje' ? 'aprendizaje' : 'standard';
                    if (prev === next) return;
                    estado.task.taskType = next;
                    if (next !== 'aprendizaje') {
                        // Regla: al pasar a Estándar se desvincula el contenido.
                        // Si vuelve a Aprendizaje, debe elegir nuevamente.
                        estado.task.learningContentId = null;
                    }
                    pushActivity('fa-tag', currentUserName, 'cambió el tipo de tarea a ' + taskTypeLabel(next) + '.');
                    triggerFakeSave();
                    setTimeout(function () { renderInfoBlock(); }, 0);
                }
            });
            var typeInput = document.querySelector('#task-detail-type-wrap .ubits-input');
            if (typeInput) typeInput.setAttribute('aria-labelledby', 'task-detail-type-label');
        }
        if (typeof createInput === 'function') {
            createInput({
                containerId: 'task-detail-plan-wrap',
                type: 'select',
                size: 'xs',
                showLabel: false,
                placeholder: 'Seleccionar plan',
                selectOptions: selectOptionsPlanes,
                value: selectedPlanValue,
                onChange: function (val) {
                    if (!estado.task) return;
                    var selectedVal = val != null ? String(val) : '';
                    var previousName = estado.task.planNombre || '';
                    var planSeleccionado = planesDisponibles.find(function (p) { return String(p.id) === selectedVal; });
                    if (!planSeleccionado) {
                        estado.task.planId = null;
                        estado.task.planNombre = null;
                        if (previousName) pushActivity('fa-layer-group', currentUserName, 'quitó la tarea del plan "' + previousName + '".');
                        triggerFakeSave();
                        setTimeout(function () { renderInfoBlock(); }, 0);
                        return;
                    }
                    estado.task.planId = planSeleccionado.id;
                    estado.task.planNombre = planSeleccionado.name;
                    if (previousName !== planSeleccionado.name) {
                        pushActivity('fa-layer-group', currentUserName, 'asignó la tarea al plan "' + planSeleccionado.name + '".');
                    }
                    triggerFakeSave();
                    setTimeout(function () { renderInfoBlock(); }, 0);
                }
            });
            var planInput = document.querySelector('#task-detail-plan-wrap .ubits-input');
            if (planInput) planInput.setAttribute('aria-labelledby', 'task-detail-plan-label');
        }

        function normalizeImagePath(img) {
            if (!img) return '../../images/cards-learn/360-grados-Citas-glosas-reflexiones.jpeg';
            if (/^https?:\/\//i.test(img)) return img;
            if (img.indexOf('images/') === 0) return '../../' + img;
            return img;
        }

        function getNivelLabelFromId(nivelId) {
            if (nivelId === 'niv-001') return 'Básico';
            if (nivelId === 'niv-002') return 'Intermedio';
            if (nivelId === 'niv-003') return 'Avanzado';
            return 'Intermedio';
        }

        function getAllLearningContents() {
            var all = [];
            if (window.BDS_CONTENIDOS_UBITS && Array.isArray(window.BDS_CONTENIDOS_UBITS.contents)) {
                all = all.concat(window.BDS_CONTENIDOS_UBITS.contents);
            }
            if (window.BDS_CONTENIDOS_FIQSHA && Array.isArray(window.BDS_CONTENIDOS_FIQSHA.contents)) {
                all = all.concat(window.BDS_CONTENIDOS_FIQSHA.contents);
            }
            return all;
        }

        function findLearningContentById(id) {
            var all = getAllLearningContents();
            return all.find(function (c) { return String(c.id) === String(id); }) || null;
        }

        function buildLearningAutocompleteOptions() {
            var all = getAllLearningContents();
            var opts = all.map(function (c) {
                var t = c.titulo || c.title || 'Contenido';
                var origin = c.origen === 'empresa_fiqsha' ? 'Fiqsha' : 'UBITS';
                return { value: String(c.id), text: String(t) + ' · ' + origin };
            });
            opts.sort(function (a, b) {
                return String(a.text || '').localeCompare(String(b.text || ''), 'es', { sensitivity: 'base' });
            });
            return opts;
        }

        function renderSelectedLearningContentCard() {
            if (!isAprendizaje) return;
            var wrapId = 'task-detail-learning-content-card-wrap';
            var wrap = document.getElementById(wrapId);
            if (!wrap) return;
            wrap.innerHTML = '';

            var selectedId = estado.task && estado.task.learningContentId ? String(estado.task.learningContentId) : '';
            if (!selectedId) return;

            var content = findLearningContentById(selectedId);
            if (!content) {
                if (estado.task) estado.task.learningContentId = null;
                return;
            }

            if (typeof window.loadCardContentCompact !== 'function') return;

            var isFiqsha = content.origen === 'empresa_fiqsha';
            var provider = isFiqsha ? 'Fiqsha Smart Consulting' : 'UBITS';
            var providerLogo = isFiqsha ? '../../images/Favicons/Fiqsha Smart Consulting.jpg' : '../../images/Favicons/UBITS.jpg';

            var progressVal = 0;
            var statusVal = 'default';
            if (estado.task) {
                if (typeof estado.task.learningContentProgress === 'number') {
                    progressVal = estado.task.learningContentProgress;
                }
                if (estado.task.learningCardStatus === 'progress' || estado.task.learningCardStatus === 'completed') {
                    statusVal = estado.task.learningCardStatus;
                } else if (estado.task.learningCardStatus === 'default') {
                    statusVal = 'default';
                }
            }

            window.loadCardContentCompact(wrapId, [{
                type: content.tipoContenido || 'Curso',
                title: content.titulo || content.title || 'Contenido',
                provider: provider,
                providerLogo: providerLogo,
                duration: String(content.tiempoValor || 60) + ' min',
                level: getNivelLabelFromId(content.nivelId),
                progress: progressVal,
                status: statusVal,
                image: normalizeImagePath(content.imagen || content.image),
                competency: 'Productividad',
                language: content.idioma || 'Español'
            }]);
        }

        // Seleccionar contenido (solo Aprendizaje y tarea no finalizada)
        if (isAprendizaje && typeof createInput === 'function') {
            if (!isLearningFinished) {
                var learningOpts = buildLearningAutocompleteOptions();
                var learningInputValue = '';
                if (estado.task && estado.task.learningContentId) {
                    var cPre = findLearningContentById(estado.task.learningContentId);
                    if (cPre) {
                        var originPre = cPre.origen === 'empresa_fiqsha' ? 'Fiqsha' : 'UBITS';
                        learningInputValue = String(cPre.titulo || cPre.title || '') + ' · ' + originPre;
                    }
                }
                createInput({
                    containerId: 'task-detail-learning-content-wrap',
                    type: 'autocomplete',
                    label: '',
                    showLabel: false,
                    placeholder: 'Buscar contenido…',
                    size: 'xs',
                    value: learningInputValue,
                    autocompleteOptions: learningOpts,
                    autocompleteLazyPageSize: 10,
                    onChange: function (val) {
                        if (!val || !estado.task) return;
                        estado.task.learningContentId = String(val);
                        var chosen = findLearningContentById(val);
                        if (chosen) {
                            pushActivity('fa-graduation-cap', currentUserName, 'ligó la tarea al contenido \"' + (chosen.titulo || chosen.title || 'Contenido') + '\".');
                        }
                        // No triggerFakeSave ni renderInfoBlock aquí: el re-render completo recrea el input y
                        // renderSaveIndicator en cabecera puede hacer perder el foco al escribir en el buscador.
                        renderSelectedLearningContentCard();
                    }
                });
                reparentLearningAutocompleteDropdown('task-detail-learning-content-wrap');
                var contentInput = document.querySelector('#task-detail-learning-content-wrap .ubits-input');
                if (contentInput) {
                    contentInput.setAttribute('aria-label', 'Seleccionar contenido');
                    /* Feedback de guardado al salir del buscador (el onChange ya no llama triggerFakeSave). */
                    contentInput.addEventListener('blur', function () {
                        if (estado.task && estado.task.learningContentId) triggerFakeSave();
                    });
                }
            }

            renderSelectedLearningContentCard();
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

        /* Clic en Estado: Aprendizaje → toasts (no finalizar manual / no reabrir curso); resto: Reabrir o Finalizar; Vencida = tooltip */
        var estadoTrigger = document.getElementById('task-detail-estado-trigger');
        if (estadoTrigger && task.status !== 'Vencido' && typeof window.getDropdownMenuHtml === 'function' && typeof window.openDropdownMenu === 'function' && typeof window.closeDropdownMenu === 'function') {
            estadoTrigger.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var t0 = estado.task;
                if (t0 && t0.taskType === 'aprendizaje' && t0.status !== 'Finalizado') {
                    if (typeof showToast === 'function') {
                        showToast('info', 'La tarea finalizará automáticamente al completar el contenido.');
                    }
                    return;
                }
                if (t0 && t0.taskType === 'aprendizaje' && t0.status === 'Finalizado') {
                    if (typeof showToast === 'function') {
                        showToast('info', 'El curso ya está completado.');
                    }
                    return;
                }
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

        /* Clic en botón Opciones (al lado del título): dropdown Enviar recordatorio / Eliminar */
        var titleOptionsBtn = document.getElementById('task-detail-title-options-btn');
        if (titleOptionsBtn && typeof window.getDropdownMenuHtml === 'function' && typeof window.openDropdownMenu === 'function' && typeof window.closeDropdownMenu === 'function') {
            titleOptionsBtn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var overlayId = 'task-detail-title-options-overlay';
                var existing = document.getElementById(overlayId);
                if (existing) existing.remove();
                var options = [
                    { text: 'Enviar recordatorio', value: 'recordatorio', leftIcon: 'bell' },
                    { text: 'Eliminar', value: 'eliminar', leftIcon: 'trash' }
                ];
                var html = window.getDropdownMenuHtml({ overlayId: overlayId, options: options });
                document.body.insertAdjacentHTML('beforeend', html);
                var overlayEl = document.getElementById(overlayId);
                if (overlayEl) {
                    overlayEl.querySelectorAll('.ubits-dropdown-menu__option').forEach(function (opt) {
                        opt.addEventListener('click', function () {
                            var val = this.getAttribute('data-value');
                            window.closeDropdownMenu(overlayId);
                            if (overlayEl.parentNode) overlayEl.remove();
                            if (val === 'recordatorio') {
                                var taskName = estado.task && estado.task.name ? estado.task.name : 'esta tarea';
                                openTaskRecordatorioConfirmModal(function () {
                                    pushActivity('fa-bell', currentUserName, 'envió al asignado un recordatorio sobre "' + taskName + '".');
                                    renderCommentsBlock();
                                    triggerFakeSave();
                                    if (typeof showToast === 'function') showToast('success', 'Recordatorio enviado');
                                });
                            } else if (val === 'eliminar') {
                                if (typeof showModal === 'function') showModal('task-detail-delete-task-modal-overlay');
                            }
                        });
                    });
                    overlayEl.addEventListener('click', function (ev) {
                        if (ev.target === overlayEl) { window.closeDropdownMenu(overlayId); if (overlayEl.parentNode) overlayEl.remove(); }
                    });
                }
                window.openDropdownMenu(overlayId, titleOptionsBtn, { alignRight: true });
            });
        }
        /* Botones directos (desktop): Enviar recordatorio y Eliminar tarea */
        var recordatorioBtn = document.getElementById('task-detail-title-recordatorio-btn');
        if (recordatorioBtn) {
            recordatorioBtn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var taskName = estado.task && estado.task.name ? estado.task.name : 'esta tarea';
                openTaskRecordatorioConfirmModal(function () {
                    pushActivity('fa-bell', currentUserName, 'envió al asignado un recordatorio sobre "' + taskName + '".');
                    renderCommentsBlock();
                    triggerFakeSave();
                    if (typeof showToast === 'function') showToast('success', 'Recordatorio enviado');
                });
            });
        }
        var deleteTaskBtn = document.getElementById('task-detail-title-delete-btn');
        if (deleteTaskBtn) {
            deleteTaskBtn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                if (typeof showModal === 'function') showModal('task-detail-delete-task-modal-overlay');
            });
        }
    }

    function resizeTaskDetailTitle() {
        var ta = document.getElementById('task-detail-title');
        if (!ta) return;
        ta.style.height = 'auto';
        ta.style.overflowY = 'hidden';
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
        var addFormHtml = estado.addingSubtask
            ? '<form class="task-detail-add-subtask-form" id="task-detail-add-subtask-form">' +
            '<div class="task-detail-add-subtask-wrapper">' +
            '<textarea class="ubits-input ubits-input--sm task-detail-add-subtask-input" placeholder="Nombre de la subtarea" data-subtask-add rows="2" autofocus></textarea>' +
            '<button type="button" class="ubits-button ubits-button--primary ubits-button--sm task-detail-add-subtask-btn"><span class="ubits-body-sm-regular">Añadir</span></button>' +
            '<label class="ubits-checkbox ubits-checkbox--sm task-detail-add-subtask-multi-check"><input type="checkbox" class="ubits-checkbox__input" id="task-detail-add-multi-checkbox" data-subtask-multi><span class="ubits-checkbox__box"><i class="fas fa-check"></i></span><span class="ubits-checkbox__label">Agregar múltiples subtareas a partir de lista</span></label>' +
            '</div></form>'
            : '';
        /* Mientras el formulario de nueva subtarea está abierto, no mostrar de nuevo «Añadir subtarea» */
        var addSubtaskBtnRow = estado.addingSubtask
            ? ''
            : '<div class="task-detail-add-row">' +
            '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm" id="task-detail-add-subtask-btn">' +
            '<i class="far fa-plus"></i><span class="ubits-body-sm-regular">Añadir subtarea</span></button>' +
            '</div>';
        var barPercent = total > 0 ? (100 * completed / total) : 0;
        var progressRowHtml = total > 0
            ? '<div class="task-detail-subtasks-bar"><div class="task-detail-subtasks-bar-fill" style="width:' + barPercent + '%"></div></div>' +
            '<span class="ubits-body-sm-regular task-detail-subtasks-counter">' + completed + ' de ' + total + ' completadas</span>'
            : '';
        var html =
            '<div class="task-detail-subtasks-header">' +
            '<h2 class="ubits-body-md-bold task-detail-subtasks-title"><i class="far fa-list-check"></i> Subtareas</h2>' +
            progressRowHtml +
            '</div>' +
            addFormHtml +
            addSubtaskBtnRow +
            '<div class="task-detail-subtasks-list" id="task-detail-subtasks-list">' + listHtml + '</div>';
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
            var inp = form.querySelector('[data-subtask-add]');
            if (!inp || !inp.value.trim()) return;
            var multiCheck = form.querySelector('input[data-subtask-multi]');
            var isMulti = multiCheck && multiCheck.checked;
            var text = inp.value.trim();
            var names = isMulti ? text.split('\n').map(function (s) { return s.trim(); }).filter(Boolean) : [text];
            if (names.length === 0) return;
            var parentEndDate = estado.task ? estado.task.endDate : today;
            var parentPriority = estado.task ? estado.task.priority : 'media';
            /* unshift en orden inverso para que la primera línea quede arriba y la última recién añadida también arriba en lote */
            for (var ni = names.length - 1; ni >= 0; ni--) {
                estado.subtasks.unshift({
                    id: Date.now() + Math.random(),
                    name: names[ni],
                    done: false,
                    status: 'Activo',
                    endDate: parentEndDate,
                    priority: parentPriority,
                    assignee_name: estado.task ? estado.task.assignee_name : null,
                    assignee_email: estado.task ? estado.task.assignee_email : null,
                    assignee_avatar_url: estado.task ? estado.task.assignee_avatar_url : null
                });
            }
            if (names.length === 1) {
                pushActivity('fa-plus-circle', currentUserName, 'añadió la subtarea "' + names[0] + '".');
            } else {
                pushActivity('fa-layer-plus', currentUserName, 'añadió ' + names.length + ' subtareas en lote.');
            }
            estado.addingSubtask = false;
            renderSubtasksBlock();
            renderCommentsBlock();
            triggerFakeSave();
        }

        function closeSubtaskFormIfEmpty() {
            var formEl = document.getElementById('task-detail-add-subtask-form');
            var inp = formEl && formEl.querySelector('[data-subtask-add]');
            if (formEl && inp && !inp.value.trim()) {
                estado.addingSubtask = false;
                renderSubtasksBlock();
                return true;
            }
            return false;
        }

        var addSubtaskBtn = document.getElementById('task-detail-add-subtask-btn');
        if (addSubtaskBtn) {
            addSubtaskBtn.onclick = function () {
                estado.addingSubtask = true;
                renderSubtasksBlock();
                var form = document.getElementById('task-detail-add-subtask-form');
                var inp = form && form.querySelector('[data-subtask-add]');
                if (inp) setTimeout(function () { inp.focus(); }, 50);
                if (form) {
                    var wrapper = form.querySelector('.task-detail-add-subtask-wrapper');
                    if (wrapper) {
                        setTimeout(function () {
                            function closeIfEmptyAndOutside(ev) {
                                var target = ev.target;
                                if (target && typeof target.closest === 'function' && target.closest('.task-detail-add-subtask-form')) return;
                                if (!form.isConnected) {
                                    document.removeEventListener('click', closeIfEmptyAndOutside, true);
                                    return;
                                }
                                var inp = form.querySelector('[data-subtask-add]');
                                if (inp && inp.value.trim()) {
                                    /* Hay texto: no cerrar; no quitar el listener (si se quita, al borrar todo y clic fuera ya no cierra). */
                                    return;
                                }
                                if (closeSubtaskFormIfEmpty()) {
                                    document.removeEventListener('click', closeIfEmptyAndOutside, true);
                                }
                            }
                            document.addEventListener('click', closeIfEmptyAndOutside, true);
                        }, 0);
                    }
                }
            };
        }
        var addForm = document.getElementById('task-detail-add-subtask-form');
        if (addForm) {
            var inp = addForm.querySelector('[data-subtask-add]');
            var MIN_TEXTAREA_HEIGHT = 36;
            function autoResizeSubtaskTextarea(ta) {
                if (!ta || !ta.isConnected) return;
                ta.style.height = '0';
                ta.style.height = Math.max(MIN_TEXTAREA_HEIGHT, ta.scrollHeight) + 'px';
            }
            addForm.onsubmit = function (e) {
                e.preventDefault();
                submitSubtaskForm(addForm);
            };
            var addSubtaskBtnEl = addForm.querySelector('.task-detail-add-subtask-btn');
            if (addSubtaskBtnEl) {
                addSubtaskBtnEl.onclick = function () {
                    submitSubtaskForm(addForm);
                };
            }
            var multiCheck = addForm.querySelector('input[data-subtask-multi]');
            if (inp) {
                inp.addEventListener('input', function () { autoResizeSubtaskTextarea(inp); });
                inp.addEventListener('paste', function () { setTimeout(function () { autoResizeSubtaskTextarea(inp); }, 0); });
                inp.addEventListener('keydown', function (e) {
                    if (e.key === 'Enter' && !e.shiftKey && multiCheck && !multiCheck.checked) {
                        e.preventDefault();
                        submitSubtaskForm(addForm);
                    }
                });
                setTimeout(function () { autoResizeSubtaskTextarea(inp); }, 50);
            }
            if (multiCheck && inp) {
                multiCheck.addEventListener('change', function () {
                    if (this.checked) {
                        inp.placeholder = 'Una subtarea por línea';
                        inp.rows = 4;
                    } else {
                        inp.placeholder = 'Nombre de la subtarea';
                        inp.rows = 2;
                    }
                    setTimeout(function () { autoResizeSubtaskTextarea(inp); }, 0);
                });
            }
        }
    }

    var currentUserName = 'María Alejandra Sánchez Pardo';
    var currentUserAvatar = null;
    if (typeof TAREAS_PLANES_DB !== 'undefined' && typeof TAREAS_PLANES_DB.getUsuarioActual === 'function') {
        var u = TAREAS_PLANES_DB.getUsuarioActual();
        if (u) {
            if (u.nombre) currentUserName = u.nombre;
            if (u.avatar && String(u.avatar).trim()) currentUserAvatar = u.avatar;
        }
    }

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

        /* Comentarios: un mensaje no puede estar «escrito en el futuro»; si el backend/manda ISO
         * posterior a ahora, usamos la hora actual para agrupar y etiquetar (alineado con “lo acabo de escribir”). */
        var nowMs = Date.now();
        function hasValidFeedTime(isoStr) {
            if (!isoStr) return false;
            var d = new Date(isoStr);
            return !isNaN(d.getTime());
        }
        function clampCommentTimeToNow(isoStr) {
            if (!isoStr) return isoStr;
            var t = new Date(isoStr).getTime();
            if (isNaN(t)) return isoStr;
            if (t > nowMs) return new Date(nowMs).toISOString();
            return isoStr;
        }

        /* Actividades (creación tarea, subtareas, etc.): pueden ordenarse con fechas de planificación;
         * no aplicamos el mismo criterio que a comentarios. */
        /* ── Mezclar comentarios y actividades en timeline cronológico único ── */
        var allItems = [];
        commentsToShow.forEach(function (c) {
            if (hasValidFeedTime(c.time)) {
                allItems.push({ type: 'comment', time: clampCommentTimeToNow(c.time), data: c });
            }
        });
        activities.forEach(function (a) {
            if (hasValidFeedTime(a.time)) allItems.push({ type: 'activity', time: a.time, data: a });
        });
        allItems.sort(function (a, b) { return getFeedSortKey(a) - getFeedSortKey(b); });

        /* Aplicar filtro de feed (todo / solo comentarios / solo historial de eventos) */
        var filterVal = estado.commentsFeedFilter || 'all';
        var filteredItems = filterVal === 'all' ? allItems : allItems.filter(function (i) {
            return filterVal === 'comments' ? i.type === 'comment' : i.type === 'activity';
        });
        /* Contador del módulo: total de ítems visibles según filtro (comentarios + eventos en «Todo») */
        var badgeCount = filteredItems.length;

        /* ── Renderizar items con separadores de fecha al cambiar de día ── */
        var feed = [];
        var lastDateKey = null;
        filteredItems.forEach(function (item) {
            var dateKey = toDateKey(item.time);
            if (dateKey !== lastDateKey) {
                feed.push('<div class="task-detail-comments-separator"><span class="ubits-body-xs-regular">' + dateKeyLabel(dateKey) + '</span></div>');
                lastDateKey = dateKey;
            }
            if (item.type === 'comment') {
                var c = item.data;
                var isUser = c.author === currentUserName;
                var itemClass = 'task-detail-comment-item' + (isUser ? ' task-detail-comment-item--user' : '');
                var commentId = c.id != null ? String(c.id) : '';
                var authorBlock = typeof renderAvatar === 'function'
                    ? renderAvatar({ nombre: c.author, avatar: c.authorAvatar }, { size: 'xs' })
                    : '<span class="ubits-avatar ubits-avatar--sm"><span class="ubits-avatar__fallback"><i class="far fa-user"></i></span></span>';
                var timeLabel = formatCommentTime(c.time) + (c.edited ? ' - editado' : '');
                var optionsBtnHtml = isUser && commentId
                    ? '<button type="button" class="ubits-button ubits-button--tertiary ubits-button--xs ubits-button--icon-only task-detail-comment-options-btn" data-comment-id="' + escapeHtml(commentId) + '" aria-label="Opciones" data-tooltip="Opciones"><i class="far fa-ellipsis-vertical"></i></button>'
                    : '';
                feed.push(
                    '<div class="' + itemClass + '" data-comment-id="' + escapeHtml(commentId) + '">' +
                    '<div class="task-detail-comment-avatar">' + authorBlock + '</div>' +
                    '<div class="task-detail-comment-body">' +
                    '<div class="task-detail-comment-meta">' +
                    '<span class="ubits-body-sm-semibold task-detail-comment-author">' + escapeHtml(c.author) + '</span>' +
                    (optionsBtnHtml ? '<span class="task-detail-comment-meta-actions">' + optionsBtnHtml + '</span>' : '') +
                    '</div>' +
                    '<div class="task-detail-comment-bubble">' +
                    (c.text ? '<p class="ubits-body-sm-regular task-detail-comment-text">' + escapeHtml(c.text) + '</p>' : '') +
                    (c.images && c.images.length ? '<div class="task-detail-comment-images">' + c.images.map(function (img) { return '<img src="' + escapeHtml(img) + '" alt="">'; }).join('') + '</div>' : '') +
                    (c.files && c.files.length ? '<div class="task-detail-comment-files">' + c.files.map(function (f) {
                        var url = (f && f.url) ? String(f.url).replace(/"/g, '&quot;') : '';
                        var name = (f && f.name) ? escapeHtml(f.name) : '';
                        var nameAttr = (f && f.name) ? String(f.name).replace(/"/g, '&quot;') : '';
                        return '<span class="ubits-chip ubits-chip--sm ubits-chip--icon-left task-detail-comment-file-chip" data-tooltip="Descargar archivo" data-file-url="' + url + '" data-file-name="' + nameAttr + '" role="' + (url ? 'button' : '') + '" tabindex="' + (url ? '0' : '-1') + '"><i class="far fa-file-lines"></i><span class="ubits-chip__text">' + name + '</span></span>';
                    }).join('') + '</div>' : '') +
                    '</div>' +
                    '<span class="ubits-body-xs-regular task-detail-comment-time">' + escapeHtml(timeLabel) + '</span></div></div>'
                );
            } else {
                var a = item.data;
                /* Nombre en span semibold/high para igualar el autor de comentarios */
                var authorHtml = a.author
                    ? '<span class="ubits-body-sm-semibold task-detail-activity-author">' + escapeHtml(a.author) + '</span> '
                    : '';
                feed.push(
                    '<div class="task-detail-activity-item">' +
                    '<i class="far ' + (a.icon || 'fa-circle-info') + '"></i>' +
                    '<div class="task-detail-activity-content">' +
                    '<span class="ubits-body-sm-regular task-detail-activity-text">' + authorHtml + escapeHtml(a.text) + '</span>' +
                    '<span class="ubits-body-xs-regular task-detail-activity-time">' + formatCommentTime(a.time) + '</span>' +
                    '</div>' +
                    '</div>'
                );
            }
        });

        var html =
            '<div class="task-detail-comments-header">' +
            '<div class="task-detail-comments-header-left">' +
            '<h2 class="ubits-body-md-bold task-detail-comments-header-title"><i class="far fa-clock-rotate-left"></i> Historial</h2>' +
            '<span class="ubits-body-xs-semibold task-detail-comments-badge' + (badgeCount < 10 ? ' task-detail-comments-badge--circle' : '') + '">' + badgeCount + '</span>' +
            '</div>' +
            '<button type="button" class="ubits-button ubits-button--secondary ubits-button--xs" id="task-detail-comments-filter-btn" aria-label="Filtrar"><i class="far fa-filter"></i><span>Filtrar</span></button>' +
            '</div>' +
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
        var blockEl = document.getElementById('task-detail-comments-block');
        if (blockEl) blockEl.innerHTML = html;

        /* Botón filtro: al hacer clic se crea el dropdown en body (como el de opciones del título) y se abre con alignRight */
        var filterBtn = document.getElementById('task-detail-comments-filter-btn');
        if (filterBtn && typeof getDropdownMenuHtml === 'function' && typeof openDropdownMenu === 'function' && typeof closeDropdownMenu === 'function') {
            filterBtn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var filterOverlayId = 'task-detail-comments-filter-overlay';
                var existing = document.getElementById(filterOverlayId);
                if (existing) existing.remove();
                var currentFilter = estado.commentsFeedFilter || 'all';
                var htmlDropdown = getDropdownMenuHtml({
                    overlayId: filterOverlayId,
                    contentId: filterOverlayId + '-content',
                    radioGroup: true,
                    radioName: filterOverlayId + '-radio',
                    options: [
                        { text: 'Todo', value: 'all', selected: currentFilter === 'all' },
                        { text: 'Solo comentarios', value: 'comments', selected: currentFilter === 'comments' },
                        { text: 'Solo historial de cambios', value: 'events', selected: currentFilter === 'events' }
                    ]
                });
                document.body.insertAdjacentHTML('beforeend', htmlDropdown);
                var overlay = document.getElementById(filterOverlayId);
                if (overlay) {
                    overlay.addEventListener('click', function (ev) {
                        if (ev.target === overlay) {
                            closeDropdownMenu(filterOverlayId);
                            if (overlay.parentNode) overlay.remove();
                        }
                    });
                    var content = overlay.querySelector('.ubits-dropdown-menu__content');
                    if (content) content.addEventListener('click', function (ev) { ev.stopPropagation(); });
                    overlay.querySelectorAll('input[type=radio]').forEach(function (radio) {
                        radio.addEventListener('change', function () {
                            estado.commentsFeedFilter = this.value;
                            closeDropdownMenu(filterOverlayId);
                            if (overlay.parentNode) overlay.remove();
                            renderCommentsBlock();
                        });
                    });
                }
                openDropdownMenu(filterOverlayId, filterBtn, { alignRight: true });
                /* Re-aplicar alineación derecha en el siguiente frame (el ancho del contenido ya está calculado) */
                requestAnimationFrame(function () {
                    var ov = document.getElementById(filterOverlayId);
                    var cnt = ov ? ov.querySelector('.ubits-dropdown-menu__content') : null;
                    if (cnt && filterBtn) {
                        var br = filterBtn.getBoundingClientRect();
                        cnt.style.left = (br.right - cnt.offsetWidth) + 'px';
                    }
                });
            });
        }

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
                    authorAvatar: currentUserAvatar,
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
            if (typeof initTooltip === 'function') {
                initTooltip('.task-detail-comment-file-chip[data-tooltip]');
                initTooltip('.task-detail-comment-options-btn[data-tooltip]');
            }

            /* Delegación: botón opciones de comentario (dropdown Editar / Eliminar) */
            if (!blockEl._commentOptionsBound && typeof getDropdownMenuHtml === 'function' && typeof openDropdownMenu === 'function' && typeof closeDropdownMenu === 'function') {
                blockEl._commentOptionsBound = true;
                blockEl.addEventListener('click', function (ev) {
                    var optionsBtn = ev.target.closest('.task-detail-comment-options-btn');
                    if (!optionsBtn) return;
                    ev.preventDefault();
                    ev.stopPropagation();
                    var commentId = optionsBtn.getAttribute('data-comment-id');
                    if (!commentId) return;
                    var overlayId = 'task-detail-comment-options-overlay';
                    var existing = document.getElementById(overlayId);
                    if (existing) existing.remove();
                    var htmlDropdown = getDropdownMenuHtml({
                        overlayId: overlayId,
                        contentId: overlayId + '-content',
                        options: [
                            { text: 'Editar', value: 'edit' },
                            { text: 'Eliminar', value: 'delete' }
                        ]
                    });
                    document.body.insertAdjacentHTML('beforeend', htmlDropdown);
                    var overlay = document.getElementById(overlayId);
                    if (overlay) {
                        overlay.addEventListener('click', function (e) {
                            if (e.target === overlay) {
                                closeDropdownMenu(overlayId);
                                if (overlay.parentNode) overlay.remove();
                            }
                        });
                        var content = overlay.querySelector('.ubits-dropdown-menu__content');
                        if (content) content.addEventListener('click', function (e) { e.stopPropagation(); });
                        overlay.querySelectorAll('.ubits-dropdown-menu__option').forEach(function (opt) {
                            opt.addEventListener('click', function () {
                                var val = this.getAttribute('data-value');
                                closeDropdownMenu(overlayId);
                                if (overlay.parentNode) overlay.remove();
                                if (val === 'delete') {
                                    var idNum = Number(commentId);
                                    var idx = estado.comments.findIndex(function (co) { return (co.id !== undefined && (co.id === idNum || String(co.id) === commentId)); });
                                    if (idx !== -1) {
                                        estado.comments.splice(idx, 1);
                                        renderCommentsBlock();
                                    }
                                } else if (val === 'edit') {
                                    switchCommentToEditMode(commentId);
                                }
                            });
                        });
                    }
                    openDropdownMenu(overlayId, optionsBtn, { alignRight: true });
                    requestAnimationFrame(function () {
                        var ov = document.getElementById(overlayId);
                        var cnt = ov ? ov.querySelector('.ubits-dropdown-menu__content') : null;
                        if (cnt && optionsBtn) {
                            var br = optionsBtn.getBoundingClientRect();
                            cnt.style.left = (br.right - cnt.offsetWidth) + 'px';
                        }
                    });
                });
            }

            /* Scroll automático al elemento más reciente (parte inferior del feed) */
            feedEl.scrollTop = feedEl.scrollHeight;
        }
    }

    function switchCommentToEditMode(commentId) {
        var feedEl = document.getElementById('task-detail-comments-feed');
        if (!feedEl) return;
        var item = feedEl.querySelector('.task-detail-comment-item[data-comment-id="' + commentId.replace(/"/g, '\\"') + '"]');
        if (!item) return;
        var body = item.querySelector('.task-detail-comment-body');
        if (!body) return;
        var bubble = body.querySelector('.task-detail-comment-bubble');
        var timeSpan = body.querySelector('.task-detail-comment-time');
        if (!bubble || !timeSpan) return;
        var comment = estado.comments.find(function (c) {
            if (c.id === undefined) return false;
            return String(c.id) === commentId || c.id === Number(commentId);
        });
        if (!comment) return;
        var editWrap = document.createElement('div');
        editWrap.className = 'task-detail-comment-edit-wrap';
        editWrap.setAttribute('data-comment-id', commentId);
        editWrap.innerHTML =
            '<textarea class="ubits-input ubits-input--sm task-detail-comment-edit-textarea" rows="3" placeholder="Escribe tu comentario...">' + (comment.text || '') + '</textarea>' +
            '<div class="task-detail-comment-edit-actions">' +
            '<button type="button" class="ubits-button ubits-button--secondary ubits-button--xs task-detail-comment-edit-cancel"><span>Cancelar</span></button>' +
            '<button type="button" class="ubits-button ubits-button--primary ubits-button--xs task-detail-comment-edit-save"><span>Guardar</span></button>' +
            '</div>';
        body.insertBefore(editWrap, timeSpan);
        bubble.style.display = 'none';
        timeSpan.style.display = 'none';
        var textarea = editWrap.querySelector('.task-detail-comment-edit-textarea');
        var cancelBtn = editWrap.querySelector('.task-detail-comment-edit-cancel');
        var saveBtn = editWrap.querySelector('.task-detail-comment-edit-save');
        if (textarea) textarea.focus();
        if (cancelBtn) {
            cancelBtn.addEventListener('click', function () {
                renderCommentsBlock();
            });
        }
        if (saveBtn) {
            saveBtn.addEventListener('click', function () {
                var newText = (textarea && textarea.value) ? textarea.value.trim() : '';
                var co = estado.comments.find(function (c) {
                    if (c.id === undefined) return false;
                    return String(c.id) === commentId || c.id === Number(commentId);
                });
                if (co) {
                    co.text = newText;
                    co.edited = true;
                }
                renderCommentsBlock();
            });
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
        /* Toast pendiente (ej. tras eliminar subtarea y volver aquí) */
        try {
            var pending = sessionStorage.getItem('ubits-toast-pending');
            if (pending) {
                sessionStorage.removeItem('ubits-toast-pending');
                var data = JSON.parse(pending);
                if (data && data.message && typeof showToast === 'function') showToast(data.type || 'success', data.message);
            }
        } catch (e) {}

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
                                planId: fb.planId != null && fb.planId !== '' ? fb.planId : null,
                                planNombre: fb.planNombre || null,
                                taskType: fb.taskType || 'standard',
                                learningContentId: fb.learningContentId != null && fb.learningContentId !== '' ? String(fb.learningContentId) : null,
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
        normalizeTaskTypeOnTask(estado.task);

        ensureTaskDetailHistoryAndOrder();

        /* Modales: eliminar subtarea y eliminar tarea (opciones del título) */
        var modalsContainer = document.getElementById('task-detail-modals-container');
        if (modalsContainer && typeof getModalHtml === 'function' && !document.getElementById('task-detail-delete-subtask-modal-overlay')) {
            var deleteSubtaskBody = '<p class="ubits-body-md-regular">¿Estás seguro? Esta acción no se puede deshacer y se perderán los datos de la subtarea.</p>';
            var deleteSubtaskFooter = '<button type="button" class="ubits-button ubits-button--secondary ubits-button--md" id="task-detail-delete-subtask-cancel"><span class="ubits-body-sm-regular">Cancelar</span></button><button type="button" class="ubits-button ubits-button--error ubits-button--md" id="task-detail-delete-subtask-confirm"><span class="ubits-body-sm-regular">Eliminar</span></button>';
            var deleteTaskBody = '<p class="ubits-body-md-regular">Al eliminar esta tarea se eliminarán también todas sus subtareas (si tiene). Esta acción no se puede deshacer.</p>';
            var deleteTaskFooter = '<button type="button" class="ubits-button ubits-button--secondary ubits-button--md" id="task-detail-delete-task-cancel"><span class="ubits-body-sm-regular">Cancelar</span></button><button type="button" class="ubits-button ubits-button--error ubits-button--md" id="task-detail-delete-task-confirm"><span class="ubits-body-sm-regular">Eliminar</span></button>';
            modalsContainer.innerHTML = getModalHtml({
                overlayId: 'task-detail-delete-subtask-modal-overlay',
                title: 'Eliminar subtarea',
                bodyHtml: deleteSubtaskBody,
                footerHtml: deleteSubtaskFooter,
                size: 'xs',
                closeButtonId: 'task-detail-delete-subtask-close'
            }) + getModalHtml({
                overlayId: 'task-detail-delete-task-modal-overlay',
                title: 'Eliminar tarea',
                bodyHtml: deleteTaskBody,
                footerHtml: deleteTaskFooter,
                size: 'sm',
                closeButtonId: 'task-detail-delete-task-close'
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
                            if (typeof showToast === 'function') showToast('success', 'Subtarea eliminada exitosamente');
                        }
                    }
                    closeDeleteSubtaskModal();
                });
            }
        }

        /* Modal eliminar tarea (desde botón Opciones del título): al confirmar, volver atrás y toast */
        var overlayTask = document.getElementById('task-detail-delete-task-modal-overlay');
        if (modalsContainer && overlayTask) {
            var closeTaskBtn = document.getElementById('task-detail-delete-task-close');
            var cancelTaskBtn = document.getElementById('task-detail-delete-task-cancel');
            var confirmTaskBtn = document.getElementById('task-detail-delete-task-confirm');
            function closeDeleteTaskModal() {
                if (typeof closeModal === 'function') closeModal('task-detail-delete-task-modal-overlay');
            }
            if (overlayTask) {
                if (closeTaskBtn) closeTaskBtn.addEventListener('click', closeDeleteTaskModal);
                if (cancelTaskBtn) cancelTaskBtn.addEventListener('click', closeDeleteTaskModal);
                overlayTask.addEventListener('click', function (ev) { if (ev.target === overlayTask) closeDeleteTaskModal(); });
            }
            if (confirmTaskBtn) {
                confirmTaskBtn.addEventListener('click', function () {
                    closeDeleteTaskModal();
                    try {
                        sessionStorage.setItem('ubits-toast-pending', JSON.stringify({ type: 'success', message: 'Tarea eliminada exitosamente' }));
                    } catch (e) {}
                    window.history.back();
                });
            }
        }

        /* Delegación: clic en Opciones de una subtarea (tirilla) abre dropdown Cambiar nombre / Enviar recordatorio / Eliminar */
        document.body.addEventListener('click', function (e) {
            var list = document.getElementById('task-detail-subtasks-list');
            if (!list || !list.contains(e.target)) return;
            var btn = e.target.closest('.tarea-action-btn--options');
            if (!btn) return;
            e.preventDefault();
            e.stopPropagation();
            var id = btn.getAttribute('data-tarea-id');
            if (id == null || id === '') return;
            if (typeof window.getDropdownMenuHtml !== 'function' || typeof window.openDropdownMenu !== 'function' || typeof window.closeDropdownMenu !== 'function') return;
            var overlayId = 'task-detail-subtask-options-overlay-' + id;
            var existing = document.getElementById(overlayId);
            if (existing) existing.remove();
            var options = [
                { text: 'Cambiar nombre', value: 'cambiar-nombre', leftIcon: 'pen' },
                { text: 'Enviar recordatorio', value: 'recordatorio', leftIcon: 'bell' },
                { text: 'Eliminar', value: 'eliminar', leftIcon: 'trash' }
            ];
            var html = window.getDropdownMenuHtml({ overlayId: overlayId, options: options });
            document.body.insertAdjacentHTML('beforeend', html);
            var overlayEl = document.getElementById(overlayId);
            if (overlayEl) {
                overlayEl.style.zIndex = '10100';
                var tareaItem = btn.closest('.tarea-item');
                var subtask = id != null ? estado.subtasks.find(function (s) { return String(s.id) === String(id); }) : null;
                overlayEl.querySelectorAll('.ubits-dropdown-menu__option').forEach(function (opt) {
                    opt.addEventListener('click', function () {
                        var val = this.getAttribute('data-value');
                        window.closeDropdownMenu(overlayId);
                        if (overlayEl.parentNode) overlayEl.remove();
                        if (val === 'cambiar-nombre') {
                            if (tareaItem && subtask && typeof window.startInlineEditTaskName === 'function') {
                                window.startInlineEditTaskName(tareaItem, id, function (newName) {
                                    subtask.name = newName;
                                    renderSubtasksBlock();
                                    triggerFakeSave();
                                    if (typeof showToast === 'function') showToast('success', 'Nombre actualizado');
                                });
                            }
                        } else if (val === 'recordatorio') {
                            var subtaskName = subtask && subtask.name ? subtask.name : 'esta subtarea';
                            openTaskRecordatorioConfirmModal(function () {
                                pushActivity('fa-bell', currentUserName, 'envió al asignado un recordatorio sobre "' + subtaskName + '".');
                                renderCommentsBlock();
                                triggerFakeSave();
                                if (typeof showToast === 'function') showToast('success', 'Recordatorio enviado');
                            });
                        } else if (val === 'eliminar') {
                            subtaskIdToDelete = id;
                            if (typeof showModal === 'function') showModal('task-detail-delete-subtask-modal-overlay');
                        }
                    });
                });
                overlayEl.addEventListener('click', function (ev) {
                    if (ev.target === overlayEl) { window.closeDropdownMenu(overlayId); if (overlayEl.parentNode) overlayEl.remove(); }
                });
            }
            window.openDropdownMenu(overlayId, btn, { alignRight: true });
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

            /* Clic en botón "Cambiar nombre" (hover sobre el título): edición inline */
            if (e.target.closest('.tarea-edit-name-btn')) {
                e.preventDefault();
                e.stopPropagation();
                var editBtn = e.target.closest('.tarea-edit-name-btn');
                var row = editBtn.closest('.tarea-item');
                var subtaskIdFromRow = row ? (row.dataset.tareaId || row.getAttribute('data-tarea-id')) : null;
                if (!row || subtaskIdFromRow == null) return;
                var subtask = estado.subtasks.find(function (s) { return String(s.id) === String(subtaskIdFromRow); });
                if (!subtask || typeof window.startInlineEditTaskName !== 'function') return;
                window.startInlineEditTaskName(row, subtaskIdFromRow, function (newName) {
                    subtask.name = newName;
                    renderSubtasksBlock();
                    triggerFakeSave();
                    if (typeof showToast === 'function') showToast('success', 'Nombre actualizado');
                });
                return;
            }

            /* Clic en la fila (nombre/área no interactiva): abrir detalle de la subtarea; excluir edición inline del nombre y botón editar nombre */
            if (!e.target.closest('.tarea-action-btn--options') && !e.target.closest('.tarea-priority-badge') && !e.target.closest('.tarea-assigned') && !e.target.closest('.tarea-fecha-btn') && !e.target.closest('.tarea-done-radio') && !e.target.closest('input[type="checkbox"]') && !e.target.closest('.tarea-edit-name-btn') && !e.target.closest('.tarea-titulo-edit-wrap')) {
                e.preventDefault();
                var taskId = estado.task && estado.task.id != null ? estado.task.id : '';
                var row = e.target.closest('.tarea-item');
                var subtaskIdFromRow = row ? (row.dataset.tareaId || row.getAttribute('data-tarea-id')) : null;
                var clickOnTitle = e.target.closest('.tarea-titulo') || e.target.closest('.tarea-titulo-wrap');
                if (clickOnTitle && row) {
                    /* Doble toque en mobile: dos taps en el mismo título en <400ms = editar nombre */
                    var now = Date.now();
                    if (taskDetailLastTapForEdit && taskDetailLastTapForEdit.row === row && (now - taskDetailLastTapForEdit.time) < 400) {
                        taskDetailLastTapForEdit = null;
                        if (taskDetailSubtaskPendingClickTimeout) {
                            clearTimeout(taskDetailSubtaskPendingClickTimeout);
                            taskDetailSubtaskPendingClickTimeout = null;
                        }
                        e.stopPropagation();
                        var subtask = subtaskIdFromRow != null ? estado.subtasks.find(function (s) { return String(s.id) === String(subtaskIdFromRow); }) : null;
                        if (subtask && typeof window.startInlineEditTaskName === 'function') {
                            window.startInlineEditTaskName(row, subtaskIdFromRow, function (newName) {
                                subtask.name = newName;
                                renderSubtasksBlock();
                                triggerFakeSave();
                                if (typeof showToast === 'function') showToast('success', 'Nombre actualizado');
                            });
                        }
                        return;
                    }
                    taskDetailLastTapForEdit = { row: row, time: now };
                    if (taskDetailSubtaskPendingClickTimeout) clearTimeout(taskDetailSubtaskPendingClickTimeout);
                    taskDetailSubtaskPendingClickTimeout = setTimeout(function () {
                        taskDetailSubtaskPendingClickTimeout = null;
                        window.location.href = 'subtask-detail.html?taskId=' + encodeURIComponent(taskId) + '&id=' + encodeURIComponent(subtaskIdFromRow);
                    }, 300);
                } else if (row) {
                    window.location.href = 'subtask-detail.html?taskId=' + encodeURIComponent(taskId) + '&id=' + encodeURIComponent(subtaskIdFromRow);
                }
            }
        });

        /* Doble clic en el nombre de una subtarea: edición inline del nombre */
        document.body.addEventListener('dblclick', function (e) {
            var block = document.getElementById('task-detail-subtasks-block');
            if (!block || !block.contains(e.target)) return;
            if (!e.target.closest('.tarea-titulo') && !e.target.closest('.tarea-titulo-wrap')) return;
            var row = e.target.closest('.tarea-item');
            if (!row) return;
            e.preventDefault();
            e.stopPropagation();
            if (taskDetailSubtaskPendingClickTimeout) {
                clearTimeout(taskDetailSubtaskPendingClickTimeout);
                taskDetailSubtaskPendingClickTimeout = null;
            }
            var subtaskId = row.dataset.tareaId || row.getAttribute('data-tarea-id');
            var subtask = subtaskId != null ? estado.subtasks.find(function (s) { return String(s.id) === String(subtaskId); }) : null;
            if (!subtask || typeof window.startInlineEditTaskName !== 'function') return;
            window.startInlineEditTaskName(row, subtaskId, function (newName) {
                subtask.name = newName;
                renderSubtasksBlock();
                triggerFakeSave();
                if (typeof showToast === 'function') showToast('success', 'Nombre actualizado');
            });
        });

        if (typeof loadHeaderProduct === 'function') {
            loadHeaderProduct('task-detail-header-container', {
                productName: 'Detalle de la tarea',
                breadcrumbItems: [],
                backButton: {
                    onClick: function () { window.history.back(); }
                },
                secondaryButtons: []
            });
            if (typeof renderSaveIndicator === 'function') {
                renderSaveIndicator('task-detail-header-container-save-indicator', { state: 'idle', size: 'xs' });
            }
        }

        renderInfoBlock();
        renderSubtasksBlock();
        renderCommentsBlock();
    }

    window.initTaskDetailPage = initTaskDetailPage;
})();
