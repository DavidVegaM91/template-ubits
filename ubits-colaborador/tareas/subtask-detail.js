/* ========================================
   SUBTASK-DETAIL - Vista de detalle de una subtarea
   Sin comentarios ni lista de subtareas. Se llega desde task-detail al hacer clic en una subtarea.
   ======================================== */

(function () {
    'use strict';

    const pad = (n) => String(n).padStart(2, '0');
    function getTodayString() {
        const d = new Date();
        return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
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
    function dateKeyLabel(dateKey) {
        if (!dateKey) return '';
        var today = getTodayString();
        var yesterdayObj = new Date();
        yesterdayObj.setDate(yesterdayObj.getDate() - 1);
        var yesterdayKey = yesterdayObj.getFullYear() + '-' + pad(yesterdayObj.getMonth() + 1) + '-' + pad(yesterdayObj.getDate());
        if (dateKey === today) return 'Hoy';
        if (dateKey === yesterdayKey) return 'Ayer';
        var meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
        var parts = dateKey.split('-');
        return parseInt(parts[2], 10) + ' ' + meses[parseInt(parts[1], 10) - 1] + ' ' + parts[0];
    }

    var estado = { task: null, subtask: null };
    var today = getTodayString();
    var SAVE_INDICATOR_ID = 'subtask-detail-header-container-save-indicator';

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

    function getTaskIdFromUrl() {
        var params = new URLSearchParams(window.location.search || '');
        var id = params.get('taskId') || params.get('task');
        if (id == null || id === '') return null;
        var num = Number(id);
        return isNaN(num) ? id : num;
    }
    function getSubtaskIdFromUrl() {
        var params = new URLSearchParams(window.location.search || '');
        var id = params.get('id');
        if (id == null || id === '') return null;
        var num = Number(id);
        return isNaN(num) ? id : num;
    }

    function getSubtaskData() {
        var taskId = getTaskIdFromUrl();
        var subtaskId = getSubtaskIdFromUrl();
        if (taskId == null || subtaskId == null) return null;
        var detail = null;
        if (typeof window.TAREAS_PLANES_DB !== 'undefined' && typeof window.TAREAS_PLANES_DB.getTaskDetail === 'function') {
            detail = window.TAREAS_PLANES_DB.getTaskDetail(taskId);
        }
        if (!detail || !detail.task) return null;
        var subtasks = detail.subtasks || [];
        var sub = subtasks.find(function (s) { return String(s.id) === String(subtaskId); });
        if (!sub) return null;
        return { task: detail.task, subtask: sub };
    }

    function getUsuariosParaSubtaskDetail() {
        if (typeof window.TAREAS_PLANES_DB !== 'undefined' && typeof window.TAREAS_PLANES_DB.getEmpleadosEjemplo === 'function') {
            var emp = window.TAREAS_PLANES_DB.getEmpleadosEjemplo();
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
        var overlayId = 'subtask-detail-assignee-overlay-' + (entity.id != null ? String(entity.id) : '');
        var existing = document.getElementById(overlayId);
        if (existing) existing.remove();
        var users = getUsuariosParaSubtaskDetail();
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
            var q = normalizeText(searchVal || '');
            optionButtons.forEach(function (opt) {
                var textEl = opt.querySelector('.ubits-dropdown-menu__option-text');
                var text = textEl ? textEl.textContent : '';
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
                } else {
                    var user = users.find(function (u) { return String(u.id) === val; });
                    if (user) {
                        entity.assignee_email = user.email;
                        entity.assignee_name = user.full_name || user.email;
                        entity.assignee_avatar_url = user.avatar_url;
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
        var sub = estado.subtask;
        var task = estado.task;
        if (!sub) {
            var el = document.getElementById('subtask-detail-info-block');
            if (el) el.innerHTML = '<p class="ubits-body-md-regular">No se encontró la subtarea.</p>';
            return;
        }
        var statusDisplay = sub.done ? 'Finalizada' : (sub.status === 'Vencido' ? 'Vencida' : 'Por hacer');
        var statusSlug = sub.done ? 'success' : (sub.status === 'Vencido' ? 'error' : 'info');
        var prioridad = (sub.priority || 'media').toLowerCase();
        var prioridadLabel = prioridad === 'alta' ? 'Alta' : prioridad === 'baja' ? 'Baja' : 'Media';
        var assigneeName = sub.assignee_name || (sub.assignee_email ? sub.assignee_email.split('@')[0] : 'Sin asignar');
        var creatorName = (task && task.created_by) ? task.created_by : '—';
        var assigneeBlock = typeof renderAvatar === 'function'
            ? renderAvatar({ nombre: assigneeName, avatar: sub.assignee_avatar_url }, { size: 'sm' })
            : '<span class="ubits-avatar ubits-avatar--sm"><span class="ubits-avatar__fallback"><i class="far fa-user"></i></span></span>';
        var creatorBlock = typeof renderAvatar === 'function'
            ? renderAvatar({ nombre: creatorName, avatar: task && task.created_by_avatar_url }, { size: 'sm' })
            : '<span class="ubits-avatar ubits-avatar--sm"><span class="ubits-avatar__fallback"><i class="far fa-user"></i></span></span>';

        var prioridadIcon = { alta: 'fa-chevrons-up', media: 'fa-chevron-up', baja: 'fa-chevron-down' };
        var prioridadVariant = { alta: 'error', media: 'warning', baja: 'info' };
        var isVencida = sub.status === 'Vencido' && !sub.done;
        var html =
            '<div class="task-detail-title-row">' +
            '<textarea class="task-detail-title-editable ubits-heading-h1" id="subtask-detail-title" placeholder="Nombre de la subtarea" rows="1" maxlength="250">' + escapeHtml(sub.name || '') + '</textarea>' +
            '<button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only" id="subtask-detail-title-options-btn" aria-label="Opciones" data-tooltip="Opciones"><i class="far fa-ellipsis-vertical"></i></button>' +
            '</div>' +
            '<textarea class="task-detail-desc-editable ubits-body-sm-regular" id="subtask-detail-desc" placeholder="Descripción de la subtarea" rows="1">' + escapeHtml(sub.description || '') + '</textarea>' +
            '<div class="subtask-detail-info-row">' +
            '<div class="subtask-detail-info-group subtask-detail-info-group--meta">' +
            '<div class="subtask-detail-info-cell">' +
            '<span class="ubits-body-sm-semibold task-detail-meta-label">Asignado a</span>' +
            '<div class="task-detail-assignee-row" id="subtask-detail-assignee-row" role="button" tabindex="0">' +
            assigneeBlock +
            '<span class="ubits-body-sm-regular subtask-detail-name-text">' + escapeHtml(assigneeName) + '</span>' +
            '<i class="far fa-chevron-down" style="font-size: 12px; color: var(--ubits-fg-1-medium);"></i>' +
            '</div></div>' +
            '<div class="subtask-detail-info-cell">' +
            '<span class="ubits-body-sm-semibold task-detail-meta-label">Creada por</span>' +
            '<div class="task-detail-creator-row">' +
            creatorBlock +
            '<span class="ubits-body-sm-regular subtask-detail-name-text">' + escapeHtml(creatorName) + '</span>' +
            '</div></div>' +
            '</div>' +
            '<div class="subtask-detail-info-group subtask-detail-info-group--attrs">' +
            '<div class="subtask-detail-info-cell">' +
            '<span class="ubits-body-sm-semibold task-detail-meta-label">Estado</span>' +
            '<div class="task-detail-estado-trigger' + (isVencida ? ' task-detail-estado-trigger--vencida' : '') + '" id="subtask-detail-estado-trigger" role="button" tabindex="0" aria-haspopup="listbox" aria-expanded="false"' +
            (isVencida ? ' data-tooltip="Para reabrir la subtarea cambia la fecha de vencimiento." data-tooltip-delay="300" data-tooltip-normal' : '') + '>' +
            '<span class="ubits-status-tag ubits-status-tag--sm ubits-status-tag--' + statusSlug + '"><span class="ubits-status-tag__text">' + escapeHtml(statusDisplay) + '</span></span>' +
            '</div></div>' +
            '<div class="subtask-detail-info-cell">' +
            '<span class="ubits-body-sm-semibold task-detail-meta-label">Prioridad</span>' +
            '<div class="task-detail-prioridad-trigger" id="subtask-detail-prioridad-trigger" role="button" tabindex="0" aria-haspopup="listbox" aria-expanded="false">' +
            '<span class="ubits-badge-tag ubits-badge-tag--outlined ubits-badge-tag--' + (prioridadVariant[prioridad] || 'warning') + ' ubits-badge-tag--sm ubits-badge-tag--with-icon">' +
            '<i class="far ' + (prioridadIcon[prioridad] || 'fa-chevron-up') + '"></i><span class="ubits-badge-tag__text">' + escapeHtml(prioridadLabel) + '</span></span>' +
            '</div></div>' +
            '<div class="subtask-detail-info-cell">' +
            '<span id="subtask-detail-vencimiento-label" class="ubits-body-sm-semibold task-detail-meta-label">Vencimiento</span>' +
            '<div id="subtask-detail-vencimiento-wrap"></div></div>' +
            '</div>' +
            '</div>';
        var el = document.getElementById('subtask-detail-info-block');
        if (el) el.innerHTML = html;

        if (typeof createInput === 'function') {
            createInput({
                containerId: 'subtask-detail-vencimiento-wrap',
                type: 'calendar',
                size: 'sm',
                showLabel: false,
                placeholder: 'Sin fecha',
                value: ymdToDmySlash(sub.endDate),
                onChange: function (dateStr) {
                    var ymd = dmySlashToYmd(dateStr);
                    if (estado.subtask) {
                        estado.subtask.endDate = ymd || null;
                        if (ymd && ymd < today && !estado.subtask.done) {
                            estado.subtask.status = 'Vencido';
                        }
                        if (ymd && ymd >= today && estado.subtask.status === 'Vencido') {
                            estado.subtask.status = 'Activo';
                        }
                    }
                    setTimeout(function () { renderInfoBlock(); }, 0);
                    triggerFakeSave();
                }
            });
            var dateInput = document.querySelector('#subtask-detail-vencimiento-wrap .ubits-input');
            if (dateInput) dateInput.setAttribute('aria-labelledby', 'subtask-detail-vencimiento-label');
        }
        if (typeof initTooltip === 'function') initTooltip('#subtask-detail-info-block [data-tooltip]');

        function resizeTitle() {
            var ta = document.getElementById('subtask-detail-title');
            if (!ta) return;
            ta.style.height = 'auto';
            ta.style.height = Math.max(24, ta.scrollHeight) + 'px';
        }
        function resizeDesc() {
            var ta = document.getElementById('subtask-detail-desc');
            if (!ta) return;
            ta.style.height = '0';
            ta.style.height = ta.scrollHeight + 'px';
        }
        resizeTitle();
        resizeDesc();
        requestAnimationFrame(resizeDesc);

        var titleEl = document.getElementById('subtask-detail-title');
        if (titleEl) {
            titleEl.addEventListener('input', resizeTitle);
            titleEl.addEventListener('blur', function () {
                if (estado.subtask) estado.subtask.name = this.value.trim() || estado.subtask.name;
                triggerFakeSave();
            });
        }
        var descEl = document.getElementById('subtask-detail-desc');
        if (descEl) {
            descEl.addEventListener('input', resizeDesc);
            descEl.addEventListener('blur', function () {
                if (estado.subtask) estado.subtask.description = this.value.trim() || '';
                triggerFakeSave();
            });
        }

        var assigneeRow = document.getElementById('subtask-detail-assignee-row');
        if (assigneeRow) {
            assigneeRow.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                openAssigneeDropdown(assigneeRow, estado.subtask, function () { renderInfoBlock(); triggerFakeSave(); });
            });
            assigneeRow.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); assigneeRow.click(); }
            });
        }

        var estadoTrigger = document.getElementById('subtask-detail-estado-trigger');
        if (estadoTrigger && !isVencida && typeof window.getDropdownMenuHtml === 'function' && typeof window.openDropdownMenu === 'function' && typeof window.closeDropdownMenu === 'function') {
            estadoTrigger.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var overlayId = 'subtask-detail-estado-overlay';
                var existing = document.getElementById(overlayId);
                if (existing) existing.remove();
                var options = sub.done
                    ? [{ text: 'Reabrir tarea', value: 'reabrir' }]
                    : [{ text: 'Finalizar tarea', value: 'finalizada' }];
                var html = window.getDropdownMenuHtml({ overlayId: overlayId, options: options });
                document.body.insertAdjacentHTML('beforeend', html);
                var overlayEl = document.getElementById(overlayId);
                if (overlayEl) {
                    overlayEl.querySelectorAll('.ubits-dropdown-menu__option').forEach(function (opt) {
                        opt.addEventListener('click', function () {
                            var val = this.getAttribute('data-value');
                            if (estado.subtask) {
                                if (val === 'reabrir') {
                                    estado.subtask.done = false;
                                    estado.subtask.status = 'Activo';
                                } else if (val === 'finalizada') {
                                    estado.subtask.done = true;
                                    estado.subtask.status = 'Finalizado';
                                }
                            }
                            window.closeDropdownMenu(overlayId);
                            if (overlayEl.parentNode) overlayEl.remove();
                            renderInfoBlock();
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

        var prioridadTrigger = document.getElementById('subtask-detail-prioridad-trigger');
        if (prioridadTrigger && typeof window.getDropdownMenuHtml === 'function' && typeof window.openDropdownMenu === 'function' && typeof window.closeDropdownMenu === 'function') {
            prioridadTrigger.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var overlayId = 'subtask-detail-prioridad-overlay';
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
                            if (estado.subtask) estado.subtask.priority = val;
                            window.closeDropdownMenu(overlayId);
                            if (overlayEl.parentNode) overlayEl.remove();
                            renderInfoBlock();
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
        var titleOptionsBtn = document.getElementById('subtask-detail-title-options-btn');
        if (titleOptionsBtn && typeof window.getDropdownMenuHtml === 'function' && typeof window.openDropdownMenu === 'function' && typeof window.closeDropdownMenu === 'function') {
            titleOptionsBtn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var overlayId = 'subtask-detail-title-options-overlay';
                var existing = document.getElementById(overlayId);
                if (existing) existing.remove();
                var options = [
                    { text: 'Enviar recordatorio', value: 'recordatorio' },
                    { text: 'Eliminar', value: 'eliminar' }
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
                                if (typeof showToast === 'function') showToast('success', 'Recordatorio enviado');
                            } else if (val === 'eliminar') {
                                if (typeof showModal === 'function') showModal('subtask-detail-delete-subtask-modal-overlay');
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
    }

    function initSubtaskDetailPage() {
        var data = getSubtaskData();
        if (data) {
            estado.task = data.task;
            estado.subtask = data.subtask;
        } else {
            estado.task = null;
            estado.subtask = null;
        }

        var taskId = getTaskIdFromUrl();
        var backUrl = taskId != null ? ('task-detail.html?id=' + encodeURIComponent(taskId)) : 'task-detail.html';
        if (typeof loadHeaderProduct === 'function') {
            loadHeaderProduct('subtask-detail-header-container', {
                productName: 'Detalle de la subtarea',
                breadcrumbItems: [],
                backButton: {
                    onClick: function () { window.location.href = backUrl; }
                },
                secondaryButtons: []
            });
        }
        if (typeof renderSaveIndicator === 'function') {
            renderSaveIndicator('subtask-detail-header-container-save-indicator', { state: 'idle', size: 'sm' });
        }

        /* Modal eliminar subtarea (desde botón Opciones): al confirmar, ir a task-detail y toast */
        var modalsContainer = document.getElementById('subtask-detail-modals-container');
        if (modalsContainer && typeof getModalHtml === 'function' && !document.getElementById('subtask-detail-delete-subtask-modal-overlay')) {
            var deleteBody = '<p class="ubits-body-md-regular">¿Estás seguro? Esta acción no se puede deshacer y se perderán los datos de la subtarea.</p>';
            var deleteFooter = '<button type="button" class="ubits-button ubits-button--secondary ubits-button--md" id="subtask-detail-delete-subtask-cancel"><span>Cancelar</span></button><button type="button" class="ubits-button ubits-button--error ubits-button--md" id="subtask-detail-delete-subtask-confirm"><span>Eliminar</span></button>';
            modalsContainer.innerHTML = getModalHtml({
                overlayId: 'subtask-detail-delete-subtask-modal-overlay',
                title: 'Eliminar subtarea',
                bodyHtml: deleteBody,
                footerHtml: deleteFooter,
                size: 'sm',
                closeButtonId: 'subtask-detail-delete-subtask-close'
            });
            var overlayEl = document.getElementById('subtask-detail-delete-subtask-modal-overlay');
            var closeBtn = document.getElementById('subtask-detail-delete-subtask-close');
            var cancelBtn = document.getElementById('subtask-detail-delete-subtask-cancel');
            var confirmBtn = document.getElementById('subtask-detail-delete-subtask-confirm');
            function closeDeleteModal() {
                if (typeof closeModal === 'function') closeModal('subtask-detail-delete-subtask-modal-overlay');
            }
            if (overlayEl) {
                if (closeBtn) closeBtn.addEventListener('click', closeDeleteModal);
                if (cancelBtn) cancelBtn.addEventListener('click', closeDeleteModal);
                overlayEl.addEventListener('click', function (ev) { if (ev.target === overlayEl) closeDeleteModal(); });
            }
            if (confirmBtn) {
                confirmBtn.addEventListener('click', function () {
                    closeDeleteModal();
                    try {
                        sessionStorage.setItem('ubits-toast-pending', JSON.stringify({ type: 'success', message: 'Subtarea eliminada exitosamente' }));
                    } catch (e) {}
                    window.location.href = backUrl;
                });
            }
        }

        renderInfoBlock();
    }

    window.initSubtaskDetailPage = initSubtaskDetailPage;
})();
