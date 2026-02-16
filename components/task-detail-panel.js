/**
 * Panel de detalle de tarea - Componente reutilizable.
 * Usado en tareas.html. Solo genera el HTML interno del panel; la lógica y listeners quedan en la página.
 *
 * @param {Object} data - Datos para rellenar la plantilla
 * @param {Object} data.taskName - Nombre de la tarea
 * @param {Object} data.desc - Descripción
 * @param {string} data.statusDisplay - Texto del estado (Iniciada, Vencida, Finalizada)
 * @param {string} data.statusSlug - Clase del status (info, error, success)
 * @param {string} data.assigneeName - Nombre del asignado
 * @param {string|null} data.assigneeAvatar - URL avatar asignado
 * @param {string} data.createdBy - Creada por
 * @param {string|null} data.createdByAvatar - URL avatar creador
 * @param {boolean} data.taskInPlan - Si la tarea está en un plan
 * @param {boolean} data.hasComments - Si tiene comentarios (muestra botón Agregar)
 * @param {string} data.finishBtnLabel - Texto del botón (Finalizar tarea / Reabrir tarea)
 * @param {string} data.finishBtnVariant - Clase del botón (ubits-button--primary / ubits-button--secondary)
 * @param {string} data.priority - Clave prioridad (alta, media, baja)
 * @param {string} data.priorityShortLabel - Etiqueta corta (Alta, Media, Baja)
 * @param {string} data.roleLabel - Rol (Administrador, Colaborador)
 * @param {string} data.role - Clave rol
 * @param {string} data.sidebarContentHtml - HTML del contenido del sidebar (lista o empty container)
 * @param {Object} opts - escapeHtml, renderAvatar (opcional)
 * @returns {string} HTML del panel (task-detail-panel__inner y contenido)
 */
function getTaskDetailPanelHTML(data, opts) {
    opts = opts || {};
    var escapeHtml = typeof opts.escapeHtml === 'function' ? opts.escapeHtml : function (s) { return (s == null ? '' : String(s)); };
    var renderAvatar = opts.renderAvatar;

    var taskName = data.taskName || '';
    var desc = data.desc || '';
    var statusDisplay = data.statusDisplay || '';
    var statusSlug = data.statusSlug || 'neutral';
    var assigneeName = data.assigneeName || 'Sin asignar';
    var assigneeAvatar = data.assigneeAvatar || null;
    var createdBy = data.createdBy || 'Sin especificar';
    var createdByAvatar = data.createdByAvatar || null;
    var taskInPlan = !!data.taskInPlan;
    var hasComments = !!data.hasComments;
    var finishBtnLabel = data.finishBtnLabel || 'Finalizar tarea';
    var finishBtnVariant = data.finishBtnVariant || 'ubits-button--primary';
    var priority = data.priority || 'media';
    var priorityShortLabel = data.priorityShortLabel || 'Media';
    var roleLabel = data.roleLabel || 'Colaborador';
    var role = data.role || 'colaborador';
    var sidebarContentHtml = data.sidebarContentHtml != null ? data.sidebarContentHtml : '<div id="task-detail-sidebar-empty-container"></div>';

    var prioridadIcon = data.prioridadIcon || { alta: 'fa-chevrons-up', media: 'fa-chevron-up', baja: 'fa-chevron-down' };
    var prioridadBadgeVariant = data.prioridadBadgeVariant || { alta: 'error', media: 'warning', baja: 'info' };

    var assigneeBlock = typeof renderAvatar === 'function'
        ? renderAvatar({ nombre: assigneeName, avatar: assigneeAvatar }, { size: 'sm' })
        : '<div class="task-detail-assignee-avatar">' + (assigneeAvatar ? '<img src="' + escapeHtml(assigneeAvatar) + '" alt="" class="task-detail-assignee-avatar-img" />' : '<i class="far fa-user"></i>') + '</div>';
    var createdByBlock = typeof renderAvatar === 'function'
        ? renderAvatar({ nombre: createdBy, avatar: createdByAvatar }, { size: 'sm' })
        : '<div class="task-detail-created-by-avatar">' + (createdByAvatar ? '<img src="' + escapeHtml(createdByAvatar) + '" alt="" class="task-detail-created-by-avatar-img" />' : '<i class="far fa-user"></i>') + '</div>';

    var charCount = (taskName || '').length;
    var planAlertBlock = !taskInPlan
        ? '<div class="ubits-alert ubits-alert--info ubits-alert--no-close task-detail-plan-alert" role="status" aria-live="off">' +
            '<div class="ubits-alert__icon"><i class="far fa-info-circle"></i></div>' +
            '<div class="ubits-alert__content">' +
                '<div class="ubits-alert__text">Asocia la tarea a un plan. Así podrás mantener todo en un solo lugar y hacerle un mejor seguimiento.</div>' +
            '</div>' +
          '</div>'
        : '';
    var addCommentBtn = hasComments ? '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm task-detail-btn-add"><i class="far fa-plus"></i><span>Agregar comentarios</span></button>' : '';

    return (
        '<div class="task-detail-panel__inner">' +
            '<div class="task-detail-header">' +
                '<div>' +
                    '<div class="task-detail-header__title-row">' +
                        '<h2 class="ubits-heading-h2 task-detail-header__title">Detalle de la tarea</h2>' +
                        '<div id="task-detail-save-indicator"></div>' +
                    '</div>' +
                    '<p class="ubits-body-md-regular task-detail-header__subtitle">Si haces algún cambio, quedará aplicado inmediatamente.</p>' +
                '</div>' +
                '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm ubits-button--icon-only" id="task-detail-close" aria-label="Cerrar">' +
                    '<i class="far fa-times"></i>' +
                '</button>' +
            '</div>' +
            '<div class="task-detail-body">' +
                '<div class="task-detail-main">' +
                    '<div class="task-detail-meta">' +
                        '<div class="task-detail-meta-row">' +
                            '<span class="task-detail-meta-cell">' +
                                '<span id="task-detail-assignee-label" class="ubits-body-sm-semibold task-detail-meta-label">Asignado a</span>' +
                                '<div class="task-detail-assignee-select" id="task-detail-assignee-trigger" role="button" tabindex="0" aria-labelledby="task-detail-assignee-label" aria-haspopup="listbox" aria-expanded="false">' +
                                    assigneeBlock +
                                    '<span class="ubits-body-sm-regular task-detail-assignee-text">' + escapeHtml(assigneeName) + '</span>' +
                                    '<i class="far fa-chevron-down task-detail-assignee-chevron"></i>' +
                                '</div>' +
                            '</span>' +
                            '<span class="task-detail-meta-cell">' +
                                '<span class="ubits-body-sm-semibold task-detail-meta-label">Creada por</span>' +
                                '<div class="task-detail-created-by-row">' +
                                    createdByBlock +
                                    '<span class="ubits-body-sm-regular task-detail-created-by-text">' + escapeHtml(createdBy) + '</span>' +
                                '</div>' +
                            '</span>' +
                        '</div>' +
                        '<div class="task-detail-meta-row">' +
                            '<span class="task-detail-meta-cell task-detail-meta-cell--date">' +
                                '<span id="task-detail-date-label" class="ubits-body-sm-semibold task-detail-meta-label">Finaliza el</span>' +
                                '<div id="task-detail-date-container"></div>' +
                            '</span>' +
                            '<span class="task-detail-meta-cell">' +
                                '<span class="ubits-body-sm-semibold task-detail-meta-label">Estado</span>' +
                                '<span class="ubits-status-tag ubits-status-tag--sm ubits-status-tag--' + statusSlug + ' task-detail-status-tag" aria-label="Estado: ' + escapeHtml(statusDisplay) + '">' +
                                    '<span class="ubits-status-tag__text">' + escapeHtml(statusDisplay) + '</span>' +
                                '</span>' +
                            '</span>' +
                            '<span class="task-detail-meta-cell">' +
                                '<span id="task-detail-priority-label" class="ubits-body-sm-semibold task-detail-meta-label">Prioridad</span>' +
                                '<div class="task-detail-priority-trigger" id="task-detail-priority-btn" role="button" tabindex="0" aria-haspopup="listbox" aria-expanded="false" aria-labelledby="task-detail-priority-label" aria-label="Prioridad: ' + escapeHtml(priorityShortLabel) + '">' +
                                    '<span class="ubits-badge-tag ubits-badge-tag--outlined ubits-badge-tag--' + (prioridadBadgeVariant[priority] || 'warning') + ' ubits-badge-tag--sm ubits-badge-tag--with-icon">' +
                                        '<i class="far ' + (prioridadIcon[priority] || 'fa-chevron-up') + '"></i>' +
                                        '<span class="ubits-badge-tag__text">' + escapeHtml(priorityShortLabel) + '</span>' +
                                    '</span>' +
                                '</div>' +
                            '</span>' +
                        '</div>' +
                    '</div>' +
                    '<div class="ubits-input-wrapper task-detail-section">' +
                        '<label for="task-detail-name" class="ubits-input-label">Nombre <span class="ubits-input-mandatory">*</span></label>' +
                        '<div class="ubits-input-inner">' +
                            '<input type="text" id="task-detail-name" class="ubits-input ubits-input--md" placeholder="Nombre de la tarea" value="' + escapeHtml(taskName) + '" maxlength="250" />' +
                        '</div>' +
                        '<div class="ubits-input-helper">' +
                            '<div class="ubits-input-helper-row">' +
                                '<span class="ubits-input-counter-label">Máximo de caracteres</span>' +
                                '<span class="ubits-input-counter"><span id="task-detail-char-count">' + charCount + '</span>/250</span>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="ubits-input-wrapper task-detail-section">' +
                        '<label for="task-detail-desc" class="ubits-input-label">Descripción</label>' +
                        '<textarea id="task-detail-desc" class="ubits-input ubits-input--md ubits-input-textarea task-detail-desc-textarea" rows="3" placeholder="Descripción de la tarea">' + escapeHtml(desc) + '</textarea>' +
                    '</div>' +
                    '<div class="task-detail-section" id="task-detail-plan-container"></div>' +
                    planAlertBlock +
                    '<div class="task-detail-section task-detail-section--tags">' +
                        '<div class="task-detail-role-wrap">' +
                            '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm" id="task-detail-role-btn" aria-label="Rol: ' + escapeHtml(roleLabel) + '" aria-haspopup="listbox" aria-expanded="false">' +
                                '<i class="far fa-id-card"></i>' +
                                '<span>' + escapeHtml(roleLabel) + '</span>' +
                                '<i class="far fa-chevron-down"></i>' +
                            '</button>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="task-detail-sidebar">' +
                    '<div class="task-detail-sidebar-header">' +
                        '<div>' +
                            '<p class="ubits-body-md-bold task-detail-sidebar__title">Comentarios y evidencias</p>' +
                            '<p class="ubits-body-sm-regular task-detail-sidebar__subtitle">Mira el historial de esta tarea</p>' +
                        '</div>' +
                        addCommentBtn +
                    '</div>' +
                    '<div class="task-detail-sidebar-content">' + sidebarContentHtml + '</div>' +
                '</div>' +
            '</div>' +
            '<div class="task-detail-footer">' +
                '<button type="button" class="ubits-button ubits-button--error-tertiary ubits-button--md" id="task-detail-delete" aria-label="Eliminar tarea">' +
                    '<span>Eliminar</span>' +
                '</button>' +
                '<button type="button" class="ubits-button ' + finishBtnVariant + ' ubits-button--md" id="task-detail-finish" aria-label="' + escapeHtml(finishBtnLabel) + '">' +
                    '<span>' + escapeHtml(finishBtnLabel) + '</span>' +
                '</button>' +
            '</div>' +
        '</div>'
    );
}

if (typeof window !== 'undefined') {
    window.getTaskDetailPanelHTML = getTaskDetailPanelHTML;
}
