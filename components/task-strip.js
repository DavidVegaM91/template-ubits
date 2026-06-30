/**
 * Tirilla de tarea - Componente reutilizable.
 * Modelo único: el de tareas.html. Se reutiliza tal cual en tareas y en plan-detail.
 *
 * @param {Object} tarea - { id, name, done, status, endDate, priority, etiqueta, taskType?, planId?, planNombre?, assignee_email?, assignee_name?, assignee_avatar_url? }
 *   taskType: si es 'aprendizaje', variante con icono junto al título (primera línea alineada).
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
    var planNombreDisplay = (tarea.planNombre && String(tarea.planNombre).trim()) ? String(tarea.planNombre).trim() : '';
    if (!planNombreDisplay && tarea.planId != null && tarea.planId !== '' && typeof getPlanesParaTaskStripPicker === 'function') {
        var planesPicker = getPlanesParaTaskStripPicker();
        var planMatch = planesPicker.find(function (p) { return String(p.id) === String(tarea.planId); });
        if (planMatch && planMatch.name) planNombreDisplay = planMatch.name;
    }
    const hasPlan = !!planNombreDisplay || (tarea.planId != null && tarea.planId !== '');
    const planLabel = hasPlan ? escapeHtml(planNombreDisplay || 'Plan') : 'Agregar a un plan';
    const planIcon = hasPlan ? 'fa-layer-group' : 'fa-layer-plus';
    const planTooltip = hasPlan ? escapeAttr(planNombreDisplay || 'Plan') : 'Agregar a un plan';
    const planAria = hasPlan ? escapeHtml(planNombreDisplay || 'Plan') : 'Agregar a un plan';
    const esAprendizaje = tarea.taskType === 'aprendizaje';
    const classes = 'tarea-item' + (esFinalizada ? ' tarea-item--completed' : '') + (esVencidaReal ? ' tarea-item--overdue' : '') + (esAprendizaje ? ' tarea-item--aprendizaje' : '');
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
        (esAprendizaje
            ? '<div class="tarea-titulo-wrap tarea-titulo-wrap--aprendizaje">' +
              '<div class="tarea-titulo-row">' +
              '<span class="tarea-titulo-aprendizaje-icon-wrap" aria-hidden="true"><i class="far fa-graduation-cap"></i></span>' +
              '<div class="tarea-titulo-inner">' +
              '<h3 class="tarea-titulo ubits-body-md-regular">' + nameSafe + '</h3>' +
              '<button type="button" class="ubits-button ubits-button--secondary ubits-button--xs ubits-button--icon-only tarea-edit-name-btn" data-tarea-id="' + idSafe + '" data-tooltip="Cambiar nombre" aria-label="Cambiar nombre">' +
              '<i class="far fa-pen-to-square"></i>' +
              '</button>' +
              '</div>' +
              '</div>' +
              '</div>'
            : '<div class="tarea-titulo-wrap">' +
              '<div class="tarea-titulo-inner">' +
              '<h3 class="tarea-titulo ubits-body-md-regular">' + nameSafe + '</h3>' +
              '<button type="button" class="ubits-button ubits-button--secondary ubits-button--xs ubits-button--icon-only tarea-edit-name-btn" data-tarea-id="' + idSafe + '" data-tooltip="Cambiar nombre" aria-label="Cambiar nombre">' +
              '<i class="far fa-pen-to-square"></i>' +
              '</button>' +
              '</div>' +
              '</div>') +
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
        '<button type="button" class="ubits-button ubits-button--secondary ubits-button--xs tarea-fecha-btn" data-tarea-id="' + idSafe + '" data-tooltip="Fecha de vencimiento">' +
        (fechaDisplay ? '<span>' + escapeHtml(fechaDisplay) + '</span>' : '<span>Sin fecha</span>') +
        '</button>' +
        '</div>' +
        '<div class="tarea-actions">' +
        (hideAddToPlan ? '' : '<button type="button" class="ubits-button ubits-button--secondary ubits-button--xs tarea-action-btn tarea-action-btn--add-plan' + (hasPlan ? ' tarea-action-btn--add-plan--selected' : '') + '" data-tarea-id="' + idSafe + '" data-tooltip="' + planTooltip + '" aria-label="' + planAria + '">' +
        '<i class="far ' + planIcon + '"></i>' +
        '<span class="tarea-add-plan-btn__label">' + planLabel + '</span>' +
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

/**
 * Activa edición inline del nombre en una tirilla (.tarea-item).
 * Reemplaza el h3 por un input; al blur o Enter guarda y llama onSave(nuevoNombre); clics en el input no abren el detalle.
 * @param {Element} tareaItem - .tarea-item
 * @param {string|number} taskId - id de la tarea (para referencia)
 * @param {function(string)} onSave - callback con el nuevo nombre (ya recortado)
 */
function startInlineEditTaskName(tareaItem, taskId, onSave) {
    var wrap = tareaItem && tareaItem.querySelector('.tarea-titulo-wrap');
    var inner = wrap && wrap.querySelector('.tarea-titulo-inner');
    var h3 = inner && inner.querySelector('.tarea-titulo');
    if (!wrap || !inner || !h3) return;
    var currentName = (h3.textContent || '').trim();
    var input = document.createElement('input');
    input.type = 'text';
    input.className = 'tarea-titulo-edit-input';
    input.value = currentName;
    input.setAttribute('data-tarea-id', String(taskId));
    var finished = false;

    function finishEdit(save) {
        if (finished) return;
        finished = true;
        inner.classList.remove('tarea-titulo-edit-wrap');
        var newName = input.value != null ? String(input.value) : '';
        var displayName = save ? newName : currentName;
        var newH3 = document.createElement('h3');
        newH3.className = 'tarea-titulo ubits-body-md-regular';
        newH3.textContent = displayName;
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'ubits-button ubits-button--secondary ubits-button--xs ubits-button--icon-only tarea-edit-name-btn';
        btn.setAttribute('data-tarea-id', String(taskId));
        btn.setAttribute('data-tooltip', 'Cambiar nombre');
        btn.setAttribute('aria-label', 'Cambiar nombre');
        btn.innerHTML = '<i class="far fa-pen-to-square"></i>';
        inner.innerHTML = '';
        inner.appendChild(newH3);
        inner.appendChild(btn);
        if (save && typeof onSave === 'function') onSave(newName);
    }

    input.addEventListener('click', function (e) { e.stopPropagation(); });
    input.addEventListener('mousedown', function (e) { e.stopPropagation(); });
    input.addEventListener('blur', function () { finishEdit(true); });
    input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); finishEdit(true); }
        if (e.key === 'Escape') { e.preventDefault(); finishEdit(false); }
    });

    inner.classList.add('tarea-titulo-edit-wrap');
    inner.innerHTML = '';
    inner.appendChild(input);
    input.focus();
    input.select();
}

function getPlanesParaTaskStripPicker() {
    if (typeof TAREAS_PLANES_DB !== 'undefined' && typeof TAREAS_PLANES_DB.getPlanesParaAsignarTarea === 'function') {
        return TAREAS_PLANES_DB.getPlanesParaAsignarTarea();
    }
    if (typeof TAREAS_PLANES_DB !== 'undefined' && typeof TAREAS_PLANES_DB.getPlanesVistaPlanes === 'function') {
        return TAREAS_PLANES_DB.getPlanesVistaPlanes().map(function (p) {
            return { id: p.id, name: p.name || 'Plan sin nombre' };
        });
    }
    return [];
}

/**
 * Abre dropdown con autocomplete para asignar la tarea a un plan (mismo patrón que avatar/asignado).
 * @param {Element} anchorEl - botón .tarea-action-btn--add-plan
 * @param {Object} tarea - objeto tarea mutable
 * @param {function} [onAfterSelect] - callback tras seleccionar plan
 */
function openTaskStripPlanPicker(anchorEl, tarea, onAfterSelect) {
    if (!anchorEl || !tarea || typeof window.getDropdownMenuHtml !== 'function' || typeof window.openDropdownMenu !== 'function' || typeof window.closeDropdownMenu !== 'function') return;
    var planes = getPlanesParaTaskStripPicker();
    var overlayId = 'task-strip-plan-overlay-' + (tarea.id != null ? String(tarea.id) : 'x');
    var existing = document.getElementById(overlayId);
    if (existing) existing.remove();
    var options = planes.map(function (p) {
        return { value: String(p.id), text: p.name || 'Plan sin nombre', leftIcon: 'layer-group' };
    });
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
            var planSeleccionado = planes.find(function (p) { return String(p.id) === val; });
            if (planSeleccionado) {
                tarea.planId = planSeleccionado.id;
                tarea.planNombre = planSeleccionado.name;
            }
            window.closeDropdownMenu(overlayId);
            if (overlayEl.parentNode) overlayEl.remove();
            if (typeof onAfterSelect === 'function') onAfterSelect(planSeleccionado || null);
        });
    });
    overlayEl.addEventListener('click', function (ev) {
        if (ev.target === overlayEl) {
            window.closeDropdownMenu(overlayId);
            if (overlayEl.parentNode) overlayEl.remove();
        }
    });
    window.openDropdownMenu(overlayId, anchorEl, { alignRight: true });
}

if (typeof window !== 'undefined') {
    window.renderTaskStrip = renderTaskStrip;
    window.startInlineEditTaskName = startInlineEditTaskName;
    window.openTaskStripPlanPicker = openTaskStripPlanPicker;
}
