/**
 * Tirilla de tarea - Componente reutilizable.
 * Modelo único: el de tareas.html. Se reutiliza tal cual en tareas y en plan-detail.
 *
 * @param {Object} tarea - { id, name, done, status, endDate, priority, etiqueta, assignee_email?, assignee_name?, assignee_avatar_url? }
 * @param {Object} opts - { today, esVencidaSection?, formatDate, escapeHtml, getAssignee?, renderAvatar?, hideAddToPlan? }
 * @returns {string} HTML de una tarea-item
 */
function renderTaskStrip(tarea, opts) {
    opts = opts || {};
    const today = opts.today || '';
    const esVencidaSection = !!opts.esVencidaSection;
    const formatDate = typeof opts.formatDate === 'function' ? opts.formatDate : function (d) { return d || ''; };
    const escapeHtml = typeof opts.escapeHtml === 'function' ? opts.escapeHtml : function (s) { return (s == null ? '' : String(s)); };
    const escapeAttr = function (s) { return (escapeHtml(s) + '').replace(/"/g, '&quot;'); };
    const getAssignee = typeof opts.getAssignee === 'function' ? opts.getAssignee : null;
    const renderAvatar = typeof opts.renderAvatar === 'function' ? opts.renderAvatar : null;
    const hideAddToPlan = !!opts.hideAddToPlan;

    const fechaDisplay = tarea.endDate ? formatDate(tarea.endDate) : null;
    const esFinalizada = tarea.done === true || tarea.status === 'Finalizado';
    const esVencidaReal = !esFinalizada && (esVencidaSection || (tarea.endDate && tarea.endDate < today));

    const estadoTag = esFinalizada ? 'success' : (esVencidaReal ? 'error' : (tarea.status === 'Activo' ? 'info' : 'neutral'));
    const estadoTexto = esFinalizada ? 'Finalizada' : (esVencidaReal ? 'Vencida' : (tarea.status === 'Activo' ? 'Por hacer' : 'Finalizada'));
    const estadoIcon = esFinalizada ? 'fa-check-circle' : (esVencidaReal ? 'fa-exclamation-triangle' : (tarea.status === 'Activo' ? 'fa-spinner' : 'fa-check-circle'));

    const prioridad = (tarea.priority || 'media').toLowerCase();
    const prioridadLabel = prioridad === 'alta' ? 'Alta' : prioridad === 'baja' ? 'Baja' : 'Media';
    const prioridadIcon = { alta: 'fa-chevrons-up', media: 'fa-chevron-up', baja: 'fa-chevron-down' };
    const prioridadBadgeVariant = { alta: 'error', media: 'warning', baja: 'info' };

    const nameSafe = escapeHtml(tarea.name || '');
    const titleAttr = escapeHtml(tarea.name || '');

    let assignee = { name: 'Sin asignar', avatar: null };
    if (getAssignee) {
        assignee = getAssignee(tarea);
    } else if (tarea.assignee_name || tarea.assignee_email) {
        assignee = { name: tarea.assignee_name || tarea.assignee_email || '', avatar: tarea.assignee_avatar_url || null };
    }
    const assigneeInitials = assignee.name && assignee.name !== 'Sin asignar'
        ? assignee.name.split(/\s+/).map(function (p) { return p.charAt(0); }).join('').substring(0, 2).toUpperCase()
        : (tarea.assignee_email ? tarea.assignee_email.substring(0, 2).toUpperCase() : '?');

    function htmlAssignee() {
        if (renderAvatar) {
            return renderAvatar({ nombre: assignee.name, avatar: assignee.avatar || null }, { size: 'sm' });
        }
        if (assignee.avatar) {
            return '<img src="' + escapeHtml(assignee.avatar) + '" alt="" class="tarea-assigned-avatar-img" />';
        }
        if (assignee.name !== 'Sin asignar') {
            return '<div class="tarea-assigned-avatar-initials">' + escapeHtml(assigneeInitials) + '</div>';
        }
        return '<div class="tarea-assigned-placeholder"><i class="far fa-user"></i></div>';
    }

    const idSafe = escapeHtml(String(tarea.id));
    const classes = 'tarea-item' + (esFinalizada ? ' tarea-item--completed' : '') + (esVencidaReal ? ' tarea-item--overdue' : '');
    const etiquetaBlock = tarea.etiqueta
        ? '<div class="tarea-etiqueta"><span class="tarea-etiqueta-text">' + escapeHtml(tarea.etiqueta) + '</span></div>'
        : '';

    return (
        '<div class="' + classes + '" data-tarea-id="' + idSafe + '">' +
        '<div class="tarea-item__main">' +
        '<span class="tarea-item__radio">' +
        '<label class="ubits-checkbox ubits-checkbox--sm ubits-checkbox--round tarea-done-radio" data-tarea-id="' + idSafe + '" role="button" tabindex="0">' +
        '<input type="checkbox" class="ubits-checkbox__input" name="tarea-done-' + idSafe + '" value="1" ' + (esFinalizada ? 'checked' : '') + ' data-tarea-id="' + idSafe + '">' +
        '<span class="ubits-checkbox__box"><i class="fas fa-check"></i></span>' +
        '<span class="ubits-checkbox__label" aria-hidden="true">&nbsp;</span>' +
        '</label>' +
        '</span>' +
        '<div class="tarea-content">' +
        '<h3 class="tarea-titulo ubits-body-md-regular">' + nameSafe + '</h3>' +
        '</div>' +
        etiquetaBlock +
        '</div>' +
        '<div class="tarea-item__actions">' +
        '<div class="tarea-status">' +
        '<span class="ubits-status-tag ubits-status-tag--' + estadoTag + ' ubits-status-tag--sm ubits-status-tag--icon-left" data-tooltip="Estado: ' + escapeAttr(estadoTexto) + '" aria-label="Estado: ' + escapeHtml(estadoTexto) + '">' +
        '<i class="far ' + estadoIcon + '"></i>' +
        '<span class="ubits-status-tag__text">' + escapeHtml(estadoTexto) + '</span>' +
        '</span>' +
        '</div>' +
        '<div class="tarea-fecha ' + (!fechaDisplay ? 'tarea-fecha--sin-fecha' : '') + (esVencidaReal ? ' tarea-fecha--overdue' : '') + '">' +
        '<button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm tarea-fecha-btn" data-tarea-id="' + idSafe + '" data-tooltip="Fecha de vencimiento">' +
        (fechaDisplay ? '<span>' + escapeHtml(fechaDisplay) + '</span>' : '<span>Sin fecha</span>') +
        '</button>' +
        '</div>' +
        '<div class="tarea-actions">' +
        (hideAddToPlan ? '' : '<button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only tarea-action-btn tarea-action-btn--add-plan" data-tooltip="Agregar a un plan">' +
        '<i class="far fa-layer-group"></i>' +
        '</button>') +
        '<button type="button" class="ubits-badge-tag ubits-badge-tag--outlined ubits-badge-tag--' + (prioridadBadgeVariant[prioridad] || 'warning') + ' ubits-badge-tag--sm ubits-badge-tag--with-icon tarea-priority-badge" data-tarea-id="' + idSafe + '" data-tooltip="Prioridad" aria-label="Prioridad">' +
        '<i class="far ' + (prioridadIcon[prioridad] || 'fa-chevron-up') + '"></i>' +
        '<span class="ubits-badge-tag__text">' + escapeHtml(prioridadLabel) + '</span>' +
        '</button>' +
        '<div class="tarea-assigned" data-tooltip="Asignado a: ' + escapeAttr(assignee.name) + '">' + htmlAssignee() + '</div>' +
        '<button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only tarea-action-btn tarea-action-btn--options" data-tooltip="Opciones" data-tarea-id="' + idSafe + '" aria-label="Opciones">' +
        '<i class="far fa-ellipsis-vertical"></i>' +
        '</button>' +
        '<button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only tarea-action-btn tarea-action-btn--details" data-tooltip="Detalles" data-tarea-id="' + idSafe + '">' +
        '<i class="far fa-chevron-right"></i>' +
        '</button>' +
        '</div>' +
        '</div>' +
        '</div>'
    );
}

if (typeof window !== 'undefined') {
    window.renderTaskStrip = renderTaskStrip;
}
