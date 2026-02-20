// Estado de la aplicación
let fabState = {
    open: false
};

let templateDrawerState = {
    isOpen: false,
    formData: {
        templateName: '',
        description: ''
    },
    tasks: [],
    csvTasks: [],
    csvFile: null,
    taskCreationMode: 'excel', // 'excel' o 'manual'
    loading: false,
    error: null,
    isDragOver: false,
    showTaskCreator: false,
    templatePermission: 'empresarial' // 'empresarial' o 'individual'
};

// Estado del drawer de crear plan (PlanForm)
let planDrawerState = {
    isOpen: false,
    useTemplate: 'no', // 'yes' | 'no'
    selectedTemplateId: '',
    templates: [],
    formData: {
        title: '',
        description: '',
        endDate: ''
    },
    userAssignmentMode: 'platform', // 'platform' | 'excel'
    planConfiguration: 'everyone', // 'everyone' | 'individual'
    members: [],
    userSearch: '',
    userResults: [],
    userCsvFile: null,
    csvUsers: [],
    taskCreationMode: 'manual', // 'manual' | 'excel'
    tasks: [],
    csvTasks: [],
    csvFile: null,
    showTaskCreator: false,
    isDragOver: false,
    loading: false,
    error: null,
    openAccordion: 1 // 1 | 2 | 3
};

// ========================================
//   INTERFAZ DE PLANES - Basado en PlanCard.tsx
//   Datos: solo tareas-base-unificada.js (TAREAS_PLANES_DB).
// ========================================

let estadoPlanes = {
    plans: [],
    loading: false,
    filterInProgress: 'individual', // por defecto individual (planes dinámicos de María)
    filterFinished: 'individual',
    pageInProgress: 1,
    pageFinished: 1,
    plansPerPage: 6
};

// Planes solo desde BD unificada (tareas-base-unificada.js se carga antes que este script)
(function () {
    var db = typeof window !== 'undefined' ? window.TAREAS_PLANES_DB : (typeof TAREAS_PLANES_DB !== 'undefined' ? TAREAS_PLANES_DB : null);
    estadoPlanes.plans = (db && typeof db.getPlanesVistaPlanes === 'function') ? db.getPlanesVistaPlanes() : [];
})();

function escapePlanHtml(str) {
    if (str == null || str === '') return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function formatPlanDate(dateStr) {
    if (!dateStr) return 'Sin fecha';
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'numeric', year: 'numeric' });
}

function renderPlanCard(plan, isNew) {
    const progress = plan.tasksTotal > 0 ? Math.round((plan.tasksDone / plan.tasksTotal) * 100) : 0;
    const statusLabels = { Activo: 'Por hacer', Vencido: 'Vencido', Finalizado: 'Finalizado' };
    const statusIcons = { Activo: 'fa-play-circle', Vencido: 'fa-clock', Finalizado: 'fa-check-circle' };
    const statusVariant = plan.status === 'Activo' ? 'info' : plan.status === 'Vencido' ? 'error' : 'success';
    const label = statusLabels[plan.status] || plan.status;
    const statusIcon = statusIcons[plan.status] || 'fa-circle';
    return `
        <div class="plan-card" data-plan-id="${escapePlanHtml(plan.id)}" role="button" tabindex="0">
            <div class="plan-card__header">
                ${isNew ? '<div class="plan-card__new-dot" aria-hidden="true"></div>' : ''}
                <h3 class="plan-card__title" title="${escapePlanHtml(plan.name)}">${escapePlanHtml(plan.name)}</h3>
            </div>
            <div class="plan-card__body">
                <div class="plan-card__date">
                    <span class="plan-card__date-label">Finalización:</span> <span class="plan-card__date-value">${escapePlanHtml(formatPlanDate(plan.end_date))}</span>
                </div>
                <span class="ubits-status-tag ubits-status-tag--${statusVariant} ubits-status-tag--sm ubits-status-tag--icon-left" aria-label="Estado: ${escapePlanHtml(label)}">
                    <i class="far ${statusIcon}"></i>
                    <span class="ubits-status-tag__text">${escapePlanHtml(label)}</span>
                </span>
            </div>
            <div class="plan-card__tasks">
                <div class="plan-card__tasks-info">
                    <span>Tareas:</span>
                    <span class="plan-card__tasks-value">${plan.tasksDone}/${plan.tasksTotal}</span>
                </div>
                <div class="plan-card__progress-val">${progress}%</div>
            </div>
            <div class="plan-card__progress-bar">
                <div class="plan-card__progress-fill" style="width: ${progress}%"></div>
            </div>
        </div>
    `;
}

function renderPlansInterface() {
    const container = document.getElementById('plans-content');
    if (!container) return;

    // SIEMPRE usar BD unificada para los plan-cards. Sin fallback a datos quemados.
    var db = typeof window !== 'undefined' ? window.TAREAS_PLANES_DB : (typeof TAREAS_PLANES_DB !== 'undefined' ? TAREAS_PLANES_DB : null);
    estadoPlanes.plans = (db && typeof db.getPlanesVistaPlanes === 'function') ? db.getPlanesVistaPlanes() : [];
    const allInProgress = estadoPlanes.plans.filter(p => !p.finished);
    const allFinished = estadoPlanes.plans.filter(p => p.finished);
    const inProgress = allInProgress.filter(p =>
        estadoPlanes.filterInProgress === 'individual' ? !p.hasMembers : p.hasMembers
    );
    const finished = allFinished.filter(p =>
        estadoPlanes.filterFinished === 'individual' ? !p.hasMembers : p.hasMembers
    );

    const countersInProgress = {
        iniciado: allInProgress.filter(p => p.status === 'Activo').length,
        vencido: estadoPlanes.plans.filter(p => p.status === 'Vencido').length
    };
    const totalPagesInProgress = Math.max(1, Math.ceil(inProgress.length / estadoPlanes.plansPerPage));
    const totalPagesFinished = Math.max(1, Math.ceil(finished.length / estadoPlanes.plansPerPage));

    const sliceStartInProgress = (estadoPlanes.pageInProgress - 1) * estadoPlanes.plansPerPage;
    const sliceEndInProgress = sliceStartInProgress + estadoPlanes.plansPerPage;
    const pageInProgressData = inProgress.slice(sliceStartInProgress, sliceEndInProgress);

    const sliceStartFinished = (estadoPlanes.pageFinished - 1) * estadoPlanes.plansPerPage;
    const sliceEndFinished = sliceStartFinished + estadoPlanes.plansPerPage;
    const pageFinishedData = finished.slice(sliceStartFinished, sliceEndFinished);

    if (estadoPlanes.loading) {
        container.innerHTML = '<div class="plans-loading">Cargando planes...</div>';
        return;
    }

    if (inProgress.length === 0 && finished.length === 0) {
        container.innerHTML = `
            <div class="plans-empty">
                <div class="plans-empty__content">
                    <div class="plans-empty__visual">
                        <i class="far fa-clipboard-list plans-empty__icon"></i>
                    </div>
                    <div class="plans-empty__text">
                        <h2 class="plans-empty__title">¡Crea tu primer plan!</h2>
                        <p class="plans-empty__desc">Empieza por crear tu primer plan y da el primer paso hacia cumplir tus objetivos.</p>
                        <button type="button" class="ubits-button ubits-button--primary plans-empty__btn" id="plans-empty-create">
                            Crear plan
                        </button>
                    </div>
                </div>
            </div>
        `;
        const btn = document.getElementById('plans-empty-create');
        if (btn) btn.addEventListener('click', openPlanDrawer);
        return;
    }

    container.innerHTML = `
        <div class="plans-sections">
            <!-- En curso -->
            <div class="plan-section">
                <div class="plan-section__header">
                    <div class="plan-section__top">
                        <div class="plan-section__top-left">
                            <h2 class="plan-section__title">En curso</h2>
                            <div class="plan-section__filters plan-section__tabs-wrap">
                                <div class="ubits-tabs-on-bg" role="tablist">
                                    <button type="button" class="ubits-tab ubits-tab--sm ${estadoPlanes.filterInProgress === 'individual' ? 'ubits-tab--active' : ''}" role="tab" data-filter="individual" aria-selected="${estadoPlanes.filterInProgress === 'individual'}">
                                        <i class="far fa-user"></i>
                                        <span>Individuales</span>
                                    </button>
                                    <button type="button" class="ubits-tab ubits-tab--sm ${estadoPlanes.filterInProgress === 'grupal' ? 'ubits-tab--active' : ''}" role="tab" data-filter="grupal" aria-selected="${estadoPlanes.filterInProgress === 'grupal'}">
                                        <i class="far fa-users"></i>
                                        <span>Grupales</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <button type="button" class="ubits-button ubits-button--secondary ubits-button--sm" id="plan-ver-filtros-progress">
                            <i class="far fa-search"></i>
                            <span>Ver filtros</span>
                        </button>
                    </div>
                    <div class="plan-section__counters">
                        <div class="plan-counter"><span class="plan-counter__dot plan-counter__dot--blue"></span> Por hacer: ${countersInProgress.iniciado}</div>
                        <div class="plan-counter"><span class="plan-counter__dot plan-counter__dot--red"></span> Vencidos: ${countersInProgress.vencido}</div>
                    </div>
                </div>
                ${inProgress.length === 0 ? '<div class="plan-section__empty">No hay planes en curso.</div>' : `
                    <div class="plan-grid" id="plan-grid-in-progress">
                        ${pageInProgressData.map((p, i) => renderPlanCard(p, i === 0 && estadoPlanes.pageInProgress === 1)).join('')}
                    </div>
                    <div class="plan-pagination">
                        <span>${estadoPlanes.pageInProgress} de ${totalPagesInProgress} páginas</span>
                        <button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only" id="plan-prev-in-progress" ${estadoPlanes.pageInProgress <= 1 ? 'disabled' : ''} aria-label="Anterior">
                            <i class="far fa-chevron-left"></i>
                        </button>
                        <button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only" id="plan-next-in-progress" ${estadoPlanes.pageInProgress >= totalPagesInProgress ? 'disabled' : ''} aria-label="Siguiente">
                            <i class="far fa-chevron-right"></i>
                        </button>
                    </div>
                `}
            </div>

            <!-- Finalizado -->
            <div class="plan-section">
                <div class="plan-section__header">
                    <div class="plan-section__top">
                        <div class="plan-section__top-left">
                            <h2 class="plan-section__title">Finalizado</h2>
                            <div class="plan-section__filters plan-section__tabs-wrap">
                                <div class="ubits-tabs-on-bg" role="tablist">
                                    <button type="button" class="ubits-tab ubits-tab--sm ${estadoPlanes.filterFinished === 'individual' ? 'ubits-tab--active' : ''}" role="tab" data-filter-finished="individual" aria-selected="${estadoPlanes.filterFinished === 'individual'}">
                                        <i class="far fa-user"></i>
                                        <span>Individuales</span>
                                    </button>
                                    <button type="button" class="ubits-tab ubits-tab--sm ${estadoPlanes.filterFinished === 'grupal' ? 'ubits-tab--active' : ''}" role="tab" data-filter-finished="grupal" aria-selected="${estadoPlanes.filterFinished === 'grupal'}">
                                        <i class="far fa-users"></i>
                                        <span>Grupales</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <button type="button" class="ubits-button ubits-button--secondary ubits-button--sm" id="plan-ver-filtros-finished">
                            <i class="far fa-search"></i>
                            <span>Ver filtros</span>
                        </button>
                    </div>
                    <div class="plan-section__counters">
                        <div class="plan-counter"><span class="plan-counter__dot plan-counter__dot--green"></span> Finalizados: ${finished.length}</div>
                    </div>
                </div>
                ${finished.length === 0 ? '<div class="plan-section__empty">Aquí podrás ver los planes que han sido finalizados, completados o vencidos.</div>' : `
                    <div class="plan-grid" id="plan-grid-finished">
                        ${pageFinishedData.map(p => renderPlanCard(p, false)).join('')}
                    </div>
                    <div class="plan-pagination">
                        <span>${estadoPlanes.pageFinished} de ${totalPagesFinished} páginas</span>
                        <button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only" id="plan-prev-finished" ${estadoPlanes.pageFinished <= 1 ? 'disabled' : ''} aria-label="Anterior">
                            <i class="far fa-chevron-left"></i>
                        </button>
                        <button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only" id="plan-next-finished" ${estadoPlanes.pageFinished >= totalPagesFinished ? 'disabled' : ''} aria-label="Siguiente">
                            <i class="far fa-chevron-right"></i>
                        </button>
                    </div>
                `}
            </div>
        </div>
    `;

    // Event listeners
    container.querySelectorAll('.plan-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = card.dataset.planId;
            if (id) handlePlanClick(id);
        });
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const id = card.dataset.planId;
                if (id) handlePlanClick(id);
            }
        });
    });

    container.querySelectorAll('[data-filter]').forEach(btn => {
        btn.addEventListener('click', () => {
            estadoPlanes.filterInProgress = btn.dataset.filter;
            estadoPlanes.pageInProgress = 1;
            renderPlansInterface();
        });
    });

    container.querySelectorAll('[data-filter-finished]').forEach(btn => {
        btn.addEventListener('click', () => {
            estadoPlanes.filterFinished = btn.dataset.filterFinished;
            estadoPlanes.pageFinished = 1;
            renderPlansInterface();
        });
    });

    const prevInProgress = document.getElementById('plan-prev-in-progress');
    const nextInProgress = document.getElementById('plan-next-in-progress');
    const prevFinished = document.getElementById('plan-prev-finished');
    const nextFinished = document.getElementById('plan-next-finished');

    if (prevInProgress) prevInProgress.addEventListener('click', () => { estadoPlanes.pageInProgress = Math.max(1, estadoPlanes.pageInProgress - 1); renderPlansInterface(); });
    if (nextInProgress) nextInProgress.addEventListener('click', () => { estadoPlanes.pageInProgress = Math.min(totalPagesInProgress, estadoPlanes.pageInProgress + 1); renderPlansInterface(); });
    if (prevFinished) prevFinished.addEventListener('click', () => { estadoPlanes.pageFinished = Math.max(1, estadoPlanes.pageFinished - 1); renderPlansInterface(); });
    if (nextFinished) nextFinished.addEventListener('click', () => { estadoPlanes.pageFinished = Math.min(totalPagesFinished, estadoPlanes.pageFinished + 1); renderPlansInterface(); });

    const verFiltrosProgress = document.getElementById('plan-ver-filtros-progress');
    const verFiltrosFinished = document.getElementById('plan-ver-filtros-finished');
    if (verFiltrosProgress) verFiltrosProgress.addEventListener('click', () => { /* TODO: Mostrar menú de filtros/orden */ });
    if (verFiltrosFinished) verFiltrosFinished.addEventListener('click', () => { /* TODO: Mostrar menú de filtros/orden */ });
}

function handlePlanClick(planId) {
    window.location.href = 'plan-detail.html?id=' + encodeURIComponent(planId);
}

function initPlansInterface() {
    var db = typeof window !== 'undefined' ? window.TAREAS_PLANES_DB : (typeof TAREAS_PLANES_DB !== 'undefined' ? TAREAS_PLANES_DB : null);
    estadoPlanes.plans = (db && typeof db.getPlanesVistaPlanes === 'function') ? db.getPlanesVistaPlanes() : [];
    renderPlansInterface();
}

// Opciones del menú FAB y del menú Crear del header (compartidas). Iconos alineados con subnav (plan, tarea, plantilla, IA).
const fabMenuOptions = [
    {
        label: 'Un plan',
        icon: 'fa-layer-group',
        onClick: () => {
            if (typeof window.openPlanDrawer === 'function') window.openPlanDrawer();
        }
    },
    {
        label: 'Una tarea',
        icon: 'fa-tasks',
        onClick: () => {
            // Sin acción
        }
    },
    {
        label: 'Una plantilla',
        icon: 'fa-rectangle-history',
        onClick: () => {
            if (typeof window.openTemplateDrawer === 'function') window.openTemplateDrawer();
        }
    },
    {
        label: 'Con IA',
        icon: 'fa-sparkles',
        onClick: () => {
            // Sin acción
        }
    }
];

var CREAR_MENU_OVERLAY_ID = 'crear-menu-overlay';

/** Asegura que exista el overlay del menú Crear (componente oficial). */
function ensureCrearMenuOverlay() {
    if (document.getElementById(CREAR_MENU_OVERLAY_ID)) return;
    if (typeof window.getDropdownMenuHtml !== 'function') return;
    var options = fabMenuOptions.map(function (opt, index) {
        var icon = (opt.icon && String(opt.icon).replace(/^fa-/, '')) || '';
        return { text: opt.label, value: String(index), leftIcon: icon || undefined };
    });
    var html = window.getDropdownMenuHtml({ overlayId: CREAR_MENU_OVERLAY_ID, options: options });
    document.body.insertAdjacentHTML('beforeend', html);
    var overlay = document.getElementById(CREAR_MENU_OVERLAY_ID);
    if (!overlay) return;
    var content = overlay.querySelector('.ubits-dropdown-menu__content');
    if (content) {
        content.addEventListener('click', function (e) {
            var opt = e.target.closest('.ubits-dropdown-menu__option');
            if (!opt) return;
            var val = opt.getAttribute('data-value');
            if (val === null) return;
            var index = parseInt(val, 10);
            if (typeof window.closeDropdownMenu === 'function') window.closeDropdownMenu(CREAR_MENU_OVERLAY_ID);
            if (fabMenuOptions[index] && typeof fabMenuOptions[index].onClick === 'function') fabMenuOptions[index].onClick();
        });
    }
    overlay.addEventListener('click', function (e) {
        if (e.target === overlay && typeof window.closeDropdownMenu === 'function') window.closeDropdownMenu(CREAR_MENU_OVERLAY_ID);
    });
}

/** Abre el menú desplegable "Crear" (componente oficial). Desktop: debajo, alineado a la derecha con el botón. Móvil: arriba del FAB, misma alineación. */
function openCrearMenu(anchorElement) {
    if (!anchorElement || !anchorElement.getBoundingClientRect) return;
    if (typeof window.openDropdownMenu !== 'function' || typeof window.closeDropdownMenu !== 'function') return;
    var overlay = document.getElementById(CREAR_MENU_OVERLAY_ID);
    if (overlay && overlay.style.display === 'block') {
        window.closeDropdownMenu(CREAR_MENU_OVERLAY_ID);
        return;
    }
    ensureCrearMenuOverlay();
    window.openDropdownMenu(CREAR_MENU_OVERLAY_ID, anchorElement, { alignRight: true });
}

// Renderizar FAB Button. Al hacer clic abre el menú Crear (componente oficial) arriba del botón, alineado a la derecha.
function renderFabButton(forceOpen) {
    const container = document.getElementById('fab-button-container');
    if (!container) return;

    container.innerHTML = '';

    const fabButton = document.createElement('button');
    fabButton.className = 'flux-button-root flux-button tone-info tone-brand primary m flux-button-only-icon fab-button';
    fabButton.id = 'fab-button-main';
    fabButton.type = 'button';
    fabButton.setAttribute('data-loading', 'false');
    fabButton.setAttribute('data-flux-active', 'false');
    fabButton.setAttribute('data-accent', 'default');
    fabButton.setAttribute('aria-label', 'Abrir menú rápido');
    fabButton.setAttribute('aria-haspopup', 'menu');
    fabButton.setAttribute('aria-expanded', 'false');
    fabButton.innerHTML = `
        <div class="flux-button-content">
            <span class="flux-button-icon">
                <i class="fa-solid fa-plus"></i>
            </span>
            <span>Crear</span>
        </div>
    `;
    container.appendChild(fabButton);

    const mainButton = document.getElementById('fab-button-main');
    if (mainButton) {
        mainButton.addEventListener('click', function (e) {
            e.stopPropagation();
            if (typeof window.openCrearMenu === 'function') window.openCrearMenu(mainButton);
        });
    }

    if (forceOpen === true && mainButton && typeof window.openCrearMenu === 'function') {
        setTimeout(function () { window.openCrearMenu(mainButton); }, 0);
    }
}

// Abrir drawer de plantilla
function openTemplateDrawer() {
    templateDrawerState.isOpen = true;
    renderTemplateDrawer();
}

// Cerrar drawer de plantilla
function closeTemplateDrawer() {
    templateDrawerState.isOpen = false;
    // Resetear estado
    templateDrawerState.formData = { templateName: '', description: '' };
    templateDrawerState.tasks = [];
    templateDrawerState.csvTasks = [];
    templateDrawerState.csvFile = null;
    templateDrawerState.error = null;
    templateDrawerState.showTaskCreator = false;
    templateDrawerState.taskCreationMode = 'excel';
    renderTemplateDrawer();
}

// Crear overlay del drawer de plantilla con componente UBITS (una sola vez)
function ensureTemplateDrawerOverlayExists() {
    if (document.getElementById('create-template-drawer-overlay')) return;
    if (typeof getDrawerHtml !== 'function') return;
    var html = getDrawerHtml({
        overlayId: 'create-template-drawer-overlay',
        title: 'Crear una plantilla para un plan',
        subtitle: 'Es una base reutilizable para tus planes, úsalo siempre.',
        bodyHtml: '<div id="create-template-drawer"></div>',
        footerHtml: '<div id="create-template-drawer-footer"></div>',
        size: 'md',
        closeButtonId: 'template-drawer-close'
    });
    var wrap = document.createElement('div');
    wrap.innerHTML = html;
    var overlay = wrap.firstElementChild;
    document.body.appendChild(overlay);
    overlay.querySelector('#template-drawer-close').addEventListener('click', closeTemplateDrawer);
    overlay.addEventListener('click', function (e) {
        if (e.target === overlay) closeTemplateDrawer();
    });
    document.addEventListener('keydown', function templateDrawerEsc(ev) {
        if (ev.key === 'Escape' && templateDrawerState.isOpen) {
            closeTemplateDrawer();
        }
    });
}

// Renderizar drawer de plantilla (usa componente UBITS: body + footer en #create-template-drawer y #create-template-drawer-footer)
function renderTemplateDrawer() {
    ensureTemplateDrawerOverlayExists();
    const overlay = document.getElementById('create-template-drawer-overlay');
    const bodyEl = document.getElementById('create-template-drawer');
    const footerEl = document.getElementById('create-template-drawer-footer');
    if (!overlay || !bodyEl || !footerEl) return;

    if (templateDrawerState.isOpen) {
        overlay.style.display = 'flex';
        overlay.setAttribute('aria-hidden', 'false');

        var bodyContent = `
            <div class="template-drawer-body">
                <form id="template-form" onsubmit="handleTemplateSubmit(event)">
                    <!-- Nombre de la plantilla -->
                    <div class="template-form-group">
                        <label class="template-form-label" for="template-name-input">
                            Nombre de la plantilla *
                        </label>
                        <div id="template-name-input-container"></div>
                        <p class="template-form-helper template-form-helper--close-to-field">
                            Te servirá para identificar y usar esta plantilla en el futuro.
                        </p>
                    </div>

                    <!-- Descripción -->
                    <div class="template-form-group">
                        <label class="template-form-label" for="template-description-input">
                            Descripción
                        </label>
                        <div id="template-description-input-container"></div>
                    </div>

                    <!-- Configuración de permiso -->
                    <div class="template-form-group template-form-group--spaced-above-lg">
                        <label class="template-form-label">Configuración de permiso</label>
                        <div class="template-radio-group">
                            ${getUbitsRadioHtml({ name: 'templatePermission', value: 'empresarial', label: 'Plantilla empresarial', checked: templateDrawerState.templatePermission === 'empresarial', onchange: "templateDrawerState.templatePermission = 'empresarial'" })}
                            ${getUbitsRadioHtml({ name: 'templatePermission', value: 'individual', label: 'Plantilla individual', checked: templateDrawerState.templatePermission === 'individual', onchange: "templateDrawerState.templatePermission = 'individual'" })}
                        </div>
                    </div>

                    <!-- Creación de tareas -->
                    <div class="template-form-group template-form-group--spaced-above">
                        <label class="template-form-label">Creación de tareas</label>
                        <p class="template-form-helper template-form-helper--close-to-title">
                            Para más de 5 tareas, hazlo de forma rápida, sencilla y práctica desde un archivo.
                        </p>

                        <div class="template-task-creation-inner">
                            <!-- Radio buttons para modo de creación -->
                            <div class="template-radio-group">
                                ${getUbitsRadioHtml({ name: 'taskCreationMode', value: 'excel', label: 'Con un excel', checked: templateDrawerState.taskCreationMode === 'excel', onchange: "handleTaskCreationModeChange('excel')", id: 'task-creation-mode-excel' })}
                                ${getUbitsRadioHtml({ name: 'taskCreationMode', value: 'manual', label: 'Manualmente', checked: templateDrawerState.taskCreationMode === 'manual', onchange: "handleTaskCreationModeChange('manual')", id: 'task-creation-mode-manual' })}
                            </div>

                            ${renderTaskCreationSection()}
                        </div>
                    </div>

                    ${templateDrawerState.error ? `
                        <div class="ubits-alert ubits-alert--error">
                            <div class="ubits-alert__icon">
                                <i class="far fa-exclamation-circle"></i>
                            </div>
                            <div class="ubits-alert__content">
                                <div class="ubits-alert__text">${escapeHtml(templateDrawerState.error)}</div>
                            </div>
                        </div>
                    ` : ''}
                </form>
            </div>`;
        bodyEl.innerHTML = bodyContent;
        footerEl.innerHTML = `
            <button type="button" class="ubits-button ubits-button--secondary ubits-button--sm" onclick="closeTemplateDrawer()"><span>Cancelar</span></button>
            <button type="button" id="create-template-button" class="ubits-button ubits-button--primary ubits-button--sm" onclick="handleTemplateSubmit()" ${templateDrawerState.loading ? 'disabled' : ''}>
                ${templateDrawerState.loading ? '<i class="far fa-spinner fa-spin"></i>' : ''}<span>Crear plantilla</span>
            </button>`;

        // Inicializar inputs
        setTimeout(() => {
            if (typeof createInput === 'function') {
                createInput({
                    containerId: 'template-name-input-container',
                    label: '',
                    placeholder: 'Escribe un título que puedas encontrar rápido',
                    value: templateDrawerState.formData.templateName,
                    onChange: (value) => {
                        templateDrawerState.formData.templateName = value;
                    }
                });

                createInput({
                    containerId: 'template-description-input-container',
                    type: 'textarea',
                    label: '',
                    placeholder: 'Incluye detalles que ayuden a completar el plan.',
                    value: templateDrawerState.formData.description,
                    onChange: (value) => {
                        templateDrawerState.formData.description = value;
                    }
                });
            }
        }, 100);

        // Configurar drag & drop si está en modo excel
        setTimeout(() => {
            if (templateDrawerState.taskCreationMode === 'excel') {
                setupDragAndDrop();
            }
        }, 100);
    } else {
        overlay.style.display = 'none';
        overlay.setAttribute('aria-hidden', 'true');
    }
}

// Renderizar sección de creación de tareas
function renderTaskCreationSection() {
    if (templateDrawerState.taskCreationMode === 'excel') {
        return `
            <div class="template-info-alert">
                <i class="far fa-info-circle template-info-alert__icon"></i>
                <p class="ubits-body-sm-regular">
                    Si tu plantilla tiene más de 5 tareas, te recomendamos crearla directamente desde Excel para que sea más rápido y fácil de cargar.
                </p>
            </div>

            <button 
                type="button"
                id="download-excel-button"
                class="ubits-button ubits-button--secondary ubits-button--md"
                onclick="handleDownloadTemplate()"
            >
                <i class="far fa-download"></i>
                <span>Descargar excel de ejemplo</span>
            </button>

            ${templateDrawerState.csvTasks.length > 0 ? renderFileLoaded() : renderUploadArea()}

            <input 
                type="file" 
                id="template-file-input" 
                class="template-file-input" 
                accept=".csv"
                onchange="handleFileChange(event)"
            />
        `;
    } else {
        return `
            <p class="template-form-helper">
                Ideal para pocas tareas. Asegúrate de crear mínimo 3 para que funcione bien.
            </p>

            <button 
                type="button"
                id="add-task-button"
                class="ubits-button ubits-button--primary ubits-button--md"
                onclick="handleAddTask()"
            >
                <i class="far fa-plus"></i>
                <span>Agregar una tarea</span>
            </button>

            ${templateDrawerState.tasks.length > 0 ? `
                <div class="template-tasks-list">
                    ${templateDrawerState.tasks.map((task, index) => renderTaskItem(task, index)).join('')}
                </div>
            ` : ''}

            ${templateDrawerState.showTaskCreator ? renderTaskCreator() : ''}
        `;
    }
}

// Renderizar área de carga
function renderUploadArea() {
    return `
        <div 
            class="template-upload-area ${templateDrawerState.isDragOver ? 'drag-over' : ''}"
            id="upload-excel-area"
            onclick="onPickFile()"
        >
            <div class="template-upload-icon">
                <i class="far fa-cloud-upload"></i>
            </div>
            <div>
                <p class="template-upload-text">Sube todas tus tareas en un solo paso y optimiza tu tiempo.</p>
                <p class="template-upload-subtext">CSV, hasta 50 MB</p>
            </div>
            <button type="button" class="ubits-button ubits-button--secondary ubits-button--sm">
                <i class="far fa-file"></i>
                <span>Cargar excel diligenciado</span>
            </button>
        </div>
    `;
}

// Renderizar archivo cargado
function renderFileLoaded() {
    return `
        <div class="template-file-loaded">
            <div class="template-file-loaded__info">
                <div class="template-file-loaded__icon">
                    <i class="far fa-check"></i>
                </div>
                <div class="template-file-loaded__details">
                    <p class="template-file-loaded__name">${escapeHtml(templateDrawerState.csvFile?.name || 'Archivo cargado')}</p>
                    <p class="template-file-loaded__meta">Tu plantilla cumple correctamente con todos los campos.</p>
                    <p class="template-file-loaded__meta">
                        Se crearán <strong>${templateDrawerState.csvTasks.length}</strong> tareas.
                    </p>
                </div>
            </div>
            <button 
                type="button"
                class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only"
                onclick="handleRemoveFile()"
                aria-label="Quitar archivo"
            >
                <i class="far fa-trash"></i>
            </button>
        </div>
    `;
}

// Renderizar item de tarea
function renderTaskItem(task, index) {
    return `
        <div class="template-task-item">
            <div class="template-task-item__content">
                <h4 class="template-task-item__title">${escapeHtml(task.title || 'Tarea sin título')}</h4>
                ${task.description ? `<p class="template-task-item__description">${escapeHtml(task.description)}</p>` : ''}
            </div>
            <button 
                type="button"
                class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only"
                onclick="handleRemoveTask(${index})"
                aria-label="Eliminar tarea"
            >
                <i class="far fa-trash"></i>
            </button>
        </div>
    `;
}

// Renderizar creador de tarea
function renderTaskCreator() {
    const taskCreatorHTML = `
        <div id="task-creator" style="background: var(--ubits-bg-1); border: 1px solid var(--ubits-border-1); border-radius: 8px; padding: 16px; margin-top: 8px;">
            <div style="display: flex; flex-direction: column; gap: 12px;">
                <div id="task-creator-title-container"></div>
                <div id="task-creator-description-container"></div>
                <div style="display: flex; gap: 8px; justify-content: flex-end; margin-top: 8px;">
                    <button 
                        type="button"
                        class="ubits-button ubits-button--secondary ubits-button--sm"
                        onclick="handleCancelTaskCreator()"
                    >
                        <span>Cancelar</span>
                    </button>
                    <button 
                        type="button"
                        class="ubits-button ubits-button--primary ubits-button--sm"
                        onclick="handleSaveTask()"
                    >
                        <span>Agregar</span>
                    </button>
                </div>
            </div>
        </div>
    `;

    // Inicializar inputs después de renderizar
    setTimeout(() => {
        if (typeof createInput === 'function') {
            createInput({
                containerId: 'task-creator-title-container',
                label: 'Título de la tarea',
                placeholder: 'Escribe el título de la tarea',
                onChange: (value) => {
                    if (!window.currentTask) window.currentTask = {};
                    window.currentTask.title = value;
                }
            });

            createInput({
                containerId: 'task-creator-description-container',
                type: 'textarea',
                label: 'Descripción',
                placeholder: 'Escribe la descripción de la tarea',
                onChange: (value) => {
                    if (!window.currentTask) window.currentTask = {};
                    window.currentTask.description = value;
                }
            });
        }
    }, 50);

    return taskCreatorHTML;
}

// Manejar cambio de modo de creación
function handleTaskCreationModeChange(mode) {
    templateDrawerState.taskCreationMode = mode;
    if (mode === 'excel') {
        templateDrawerState.showTaskCreator = false;
    } else {
        templateDrawerState.csvTasks = [];
        templateDrawerState.csvFile = null;
        const fileInput = document.getElementById('template-file-input');
        if (fileInput) fileInput.value = '';
    }
    renderTemplateDrawer();
}

// Configurar drag & drop
function setupDragAndDrop() {
    const uploadArea = document.getElementById('upload-excel-area');
    if (!uploadArea) return;

    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        templateDrawerState.isDragOver = true;
        uploadArea.classList.add('drag-over');
    });

    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        templateDrawerState.isDragOver = false;
        uploadArea.classList.remove('drag-over');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        templateDrawerState.isDragOver = false;
        uploadArea.classList.remove('drag-over');

        const file = e.dataTransfer.files[0];
        if (file && file.name.endsWith('.csv')) {
            handleFile(file);
        }
    });
}

// Seleccionar archivo
function onPickFile() {
    const fileInput = document.getElementById('template-file-input');
    if (fileInput) {
        fileInput.value = '';
        fileInput.click();
    }
}

// Manejar cambio de archivo
function handleFileChange(event) {
    const file = event.target.files?.[0] || null;
    if (file) {
        handleFile(file);
    }
}

// Procesar archivo CSV
function handleFile(file) {
    templateDrawerState.csvFile = file;
    templateDrawerState.error = null;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const content = e.target?.result;
            if (!content) {
                templateDrawerState.error = 'El archivo está vacío';
                renderTemplateDrawer();
                return;
            }

            const lines = content.split('\n').filter(line => line.trim());
            if (lines.length < 2) {
                templateDrawerState.error = 'El CSV debe tener encabezados y al menos una fila de datos';
                renderTemplateDrawer();
                return;
            }

            const firstLine = lines[0];
            const hasTabs = firstLine.includes('\t');
            const separator = hasTabs ? '\t' : ',';

            const headers = lines[0].split(separator).map(h => h.trim().toLowerCase());
            const dataLines = lines.slice(1);

            const csvTasks = dataLines.map((line, index) => {
                const values = line.split(separator);
                const titleIndex = headers.findIndex(h => h === 'title' || h === 'título');
                const descriptionIndex = headers.findIndex(h => h === 'description' || h === 'descripción');
                const priorityIndex = headers.findIndex(h => h === 'priority' || h === 'prioridad');
                const etiquetaIndex = headers.findIndex(h => h === 'etiqueta' || h === 'contexto');

                return {
                    title: values[titleIndex]?.trim() || `Tarea ${index + 1}`,
                    description: values[descriptionIndex]?.trim() || '',
                    priority: (values[priorityIndex]?.trim().toLowerCase() || 'media'),
                    etiqueta: values[etiquetaIndex]?.trim() || undefined
                };
            }).filter(task => task.title);

            if (csvTasks.length === 0) {
                templateDrawerState.error = 'No se encontraron tareas válidas en el CSV';
                renderTemplateDrawer();
                return;
            }

            templateDrawerState.csvTasks = csvTasks;
            templateDrawerState.error = null;
            renderTemplateDrawer();
        } catch (err) {
            templateDrawerState.error = 'Error procesando el archivo CSV';
            console.error('Error parsing CSV:', err);
            renderTemplateDrawer();
        }
    };
    reader.onerror = () => {
        templateDrawerState.error = 'Error leyendo el archivo';
        renderTemplateDrawer();
    };
    reader.readAsText(file);
}

// Descargar template de ejemplo
function handleDownloadTemplate() {
    const csvContent = "Título,Descripción,Prioridad\nTarea de ejemplo,Descripción de la tarea,media";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'plantilla_ejemplo.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Remover archivo
function handleRemoveFile() {
    templateDrawerState.csvTasks = [];
    templateDrawerState.csvFile = null;
    const fileInput = document.getElementById('template-file-input');
    if (fileInput) fileInput.value = '';
    renderTemplateDrawer();
}

// Agregar tarea
function handleAddTask() {
    templateDrawerState.showTaskCreator = true;
    window.currentTask = { title: '', description: '', priority: 'media' };
    renderTemplateDrawer();
}

// Cancelar creador de tarea
function handleCancelTaskCreator() {
    templateDrawerState.showTaskCreator = false;
    window.currentTask = null;
    renderTemplateDrawer();
}

// Guardar tarea
function handleSaveTask() {
    if (!window.currentTask || !window.currentTask.title?.trim()) {
        templateDrawerState.error = 'El título de la tarea es obligatorio';
        renderTemplateDrawer();
        return;
    }

    templateDrawerState.tasks.push({
        title: window.currentTask.title.trim(),
        description: window.currentTask.description || '',
        priority: window.currentTask.priority || 'media'
    });

    templateDrawerState.showTaskCreator = false;
    window.currentTask = null;
    templateDrawerState.error = null;
    renderTemplateDrawer();
}

// Remover tarea
function handleRemoveTask(index) {
    templateDrawerState.tasks.splice(index, 1);
    renderTemplateDrawer();
}

// Enviar formulario
function handleTemplateSubmit(event) {
    if (event) event.preventDefault();

    templateDrawerState.loading = true;
    templateDrawerState.error = null;
    renderTemplateDrawer();

    // Simular creación (en producción sería una llamada a API)
    setTimeout(() => {
        const templateName = templateDrawerState.formData.templateName?.trim() || 'Plantilla sin nombre';
        const tasks = templateDrawerState.csvTasks.length > 0
            ? templateDrawerState.csvTasks
            : templateDrawerState.tasks;

        console.log('Creando plantilla:', {
            templateName,
            description: templateDrawerState.formData.description,
            permission: templateDrawerState.templatePermission,
            tasks
        });

        // Simular éxito
        templateDrawerState.loading = false;

        // Mostrar toast de éxito
        if (typeof showToast === 'function') {
            showToast('success', 'Plantilla creada correctamente');
        }

        closeTemplateDrawer();
    }, 1000);
}

// ========================================
//   DRAWER DE CREAR PLAN (PlanForm)
// ========================================

// Crear overlay del drawer de plan con componente UBITS (una sola vez)
function ensurePlanDrawerOverlayExists() {
    if (document.getElementById('create-plan-drawer-overlay')) return;
    if (typeof getDrawerHtml !== 'function') return;
    var html = getDrawerHtml({
        overlayId: 'create-plan-drawer-overlay',
        title: 'Crear un plan',
        subtitle: 'Organiza tus pendientes, asigna tareas y lleva el control de tus avances con facilidad.',
        bodyHtml: '<div id="create-plan-drawer"></div>',
        footerHtml: '<div id="create-plan-drawer-footer"></div>',
        size: 'md',
        closeButtonId: 'plan-drawer-close'
    });
    var wrap = document.createElement('div');
    wrap.innerHTML = html;
    var overlay = wrap.firstElementChild;
    document.body.appendChild(overlay);
    overlay.querySelector('#plan-drawer-close').addEventListener('click', closePlanDrawer);
    overlay.addEventListener('click', function (e) {
        if (e.target === overlay) closePlanDrawer();
    });
    document.addEventListener('keydown', function planDrawerEsc(ev) {
        if (ev.key === 'Escape' && planDrawerState.isOpen) closePlanDrawer();
    });
}

function openPlanDrawer() {
    planDrawerState.isOpen = true;
    resetPlanDrawerState();
    renderPlanDrawer();
}

function closePlanDrawer() {
    planDrawerState.isOpen = false;
    renderPlanDrawer();
}

function resetPlanDrawerState() {
    planDrawerState.useTemplate = 'no';
    planDrawerState.selectedTemplateId = '';
    planDrawerState.formData = { title: '', description: '', endDate: '' };
    planDrawerState.userAssignmentMode = 'platform';
    planDrawerState.planConfiguration = 'everyone';
    planDrawerState.members = [];
    planDrawerState.userSearch = '';
    planDrawerState.userResults = [];
    planDrawerState.userCsvFile = null;
    planDrawerState.csvUsers = [];
    planDrawerState.taskCreationMode = 'manual';
    planDrawerState.tasks = [];
    planDrawerState.csvTasks = [];
    planDrawerState.csvFile = null;
    planDrawerState.showTaskCreator = false;
    planDrawerState.isDragOver = false;
    planDrawerState.loading = false;
    planDrawerState.error = null;
    planDrawerState.openAccordion = 1;
    planDrawerState.templates = [
        { id: 't1', name: 'Plan de onboarding' },
        { id: 't2', name: 'Plan de ventas mensual' },
        { id: 't3', name: 'Plan de capacitación' }
    ];
}

function togglePlanAccordion(num) {
    if (num === 3 && planDrawerState.useTemplate === 'yes') return;
    planDrawerState.openAccordion = planDrawerState.openAccordion === num ? null : num;
    renderPlanDrawer();
}

function handlePlanUseTemplateChange(value) {
    planDrawerState.useTemplate = value;
    if (value === 'yes' && planDrawerState.selectedTemplateId && planDrawerState.templates.length) {
        const t = planDrawerState.templates.find(x => x.id === planDrawerState.selectedTemplateId);
        if (t) planDrawerState.formData.title = t.name;
    }
    renderPlanDrawer();
}

function handlePlanConfigChange(value) {
    planDrawerState.planConfiguration = value;
    renderPlanDrawer();
}

function handlePlanUserAssignmentModeChange(mode) {
    planDrawerState.userAssignmentMode = mode;
    if (mode === 'platform') {
        planDrawerState.userCsvFile = null;
        planDrawerState.csvUsers = [];
        planDrawerState.members = planDrawerState.members.filter(m => !m.id.startsWith('csv-'));
        const input = document.getElementById('plan-user-file-input');
        if (input) input.value = '';
    }
    renderPlanDrawer();
}

function handlePlanUserCsvUpload() {
    const input = document.getElementById('plan-user-file-input');
    if (input) {
        input.value = '';
        input.click();
    }
}

function handlePlanUserFileChange(e) {
    const file = e.target?.files?.[0] || null;
    if (!file) return;
    planDrawerState.userCsvFile = file;
    const reader = new FileReader();
    reader.onload = (ev) => {
        try {
            const text = (ev.target?.result || '').toString();
            const lines = text.split('\n').filter(l => l.trim());
            if (lines.length < 2) {
                planDrawerState.csvUsers = [];
                renderPlanDrawer();
                return;
            }
            const sep = lines[0].includes('\t') ? '\t' : ',';
            const headers = lines[0].split(sep).map(h => h.trim().toLowerCase());
            const rows = lines.slice(1);
            const users = [];
            const emailIdx = headers.findIndex(h => h.includes('email') || h.includes('correo'));
            const nameIdx = headers.findIndex(h => h.includes('name') || h.includes('nombre'));
            for (let i = 0; i < rows.length; i++) {
                const v = rows[i].split(sep).map(x => x.trim());
                const email = emailIdx >= 0 ? v[emailIdx] : v[0];
                if (!email) continue;
                users.push({
                    id: 'csv-' + i,
                    email: email,
                    name: nameIdx >= 0 ? v[nameIdx] : email.split('@')[0]
                });
            }
            planDrawerState.csvUsers = users;
            planDrawerState.members = planDrawerState.members.filter(m => !m.id.startsWith('csv-'));
            planDrawerState.members.push(...users.map(u => ({ ...u })));
        } catch (err) {
            planDrawerState.csvUsers = [];
        }
        renderPlanDrawer();
    };
    reader.readAsText(file);
}

function handlePlanRemoveUserCsvFile() {
    planDrawerState.userCsvFile = null;
    planDrawerState.csvUsers = [];
    planDrawerState.members = planDrawerState.members.filter(m => !m.id.startsWith('csv-'));
    const input = document.getElementById('plan-user-file-input');
    if (input) input.value = '';
    renderPlanDrawer();
}

function handlePlanDownloadUserTemplate() {
    const csv = 'email,nombre\nusuario@ejemplo.com,Nombre Usuario';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'plantilla_usuarios.csv';
    a.style.visibility = 'hidden';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function handlePlanTaskModeChange(mode) {
    planDrawerState.taskCreationMode = mode;
    if (mode === 'excel') {
        planDrawerState.showTaskCreator = false;
    } else {
        planDrawerState.csvTasks = [];
        planDrawerState.csvFile = null;
        const input = document.getElementById('plan-file-input');
        if (input) input.value = '';
    }
    renderPlanDrawer();
}

function handlePlanUserSearch() {
    const q = (planDrawerState.userSearch || '').trim().toLowerCase();
    if (q.length < 2) {
        planDrawerState.userResults = [];
    } else {
        planDrawerState.userResults = [
            { id: 'u1', email: 'usuario1@ejemplo.com' },
            { id: 'u2', email: 'usuario2@ejemplo.com' },
            { id: 'u3', email: 'colaborador@ejemplo.com' }
        ].filter(u => u.email.toLowerCase().includes(q));
    }
    renderPlanDrawer();
}

function handleAddPlanMember(user) {
    if (planDrawerState.members.some(m => m.id === user.id)) return;
    planDrawerState.members.push(user);
    planDrawerState.userSearch = '';
    planDrawerState.userResults = [];
    renderPlanDrawer();
}

function handleAddPlanMemberByIndex(i) {
    const u = planDrawerState.userResults[i];
    if (u) handleAddPlanMember(u);
}

function handleRemovePlanMember(userId) {
    planDrawerState.members = planDrawerState.members.filter(m => m.id !== userId);
    renderPlanDrawer();
}

function handlePlanAddTask() {
    if (planDrawerState.showTaskCreator && window.currentPlanTask?.title?.trim()) {
        handlePlanSaveTask();
    }
    planDrawerState.showTaskCreator = true;
    window.currentPlanTask = { title: '', description: '', priority: 'media' };
    renderPlanDrawer();
}

function handlePlanCancelTaskCreator() {
    planDrawerState.showTaskCreator = false;
    window.currentPlanTask = null;
    renderPlanDrawer();
}

function handlePlanSaveTask() {
    if (!window.currentPlanTask || !window.currentPlanTask.title?.trim()) {
        planDrawerState.error = 'El título de la tarea es obligatorio';
        renderPlanDrawer();
        return;
    }
    planDrawerState.tasks.push({
        title: window.currentPlanTask.title.trim(),
        description: window.currentPlanTask.description || '',
        priority: window.currentPlanTask.priority || 'media'
    });
    planDrawerState.showTaskCreator = false;
    window.currentPlanTask = null;
    planDrawerState.error = null;
    renderPlanDrawer();
}

function handlePlanRemoveTask(index) {
    planDrawerState.tasks.splice(index, 1);
    renderPlanDrawer();
}

function handlePlanTaskPriorityClick() {
    /* Placeholder: abrir selector de prioridad (Alta, Media, Baja) */
}

function handlePlanTaskAssignClick() {
    /* Placeholder: abrir selector de usuarios */
}

function handlePlanTaskDateClick() {
    /* Placeholder: abrir selector de fecha */
}

function handlePlanDownloadTemplate() {
    const csv = 'Título,Descripción,Prioridad\nTarea 1,Descripción,media\nTarea 2,Descripción,alta';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'plantilla_tareas_plan.csv';
    a.style.visibility = 'hidden';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function handlePlanRemoveFile() {
    planDrawerState.csvTasks = [];
    planDrawerState.csvFile = null;
    const input = document.getElementById('plan-file-input');
    if (input) input.value = '';
    renderPlanDrawer();
}

function handlePlanFileChange(e) {
    const file = e.target?.files?.[0] || null;
    if (!file) return;
    planDrawerState.csvFile = file;
    const reader = new FileReader();
    reader.onload = (ev) => {
        try {
            const text = (ev.target?.result || '').toString();
            const lines = text.split('\n').filter(l => l.trim());
            if (lines.length < 2) {
                planDrawerState.error = 'CSV debe tener encabezados y al menos una fila';
                renderPlanDrawer();
                return;
            }
            const sep = lines[0].includes('\t') ? '\t' : ',';
            const headers = lines[0].split(sep).map(h => h.trim().toLowerCase());
            const rows = lines.slice(1);
            const tasks = rows.map((line, i) => {
                const v = line.split(sep);
                const titleIdx = headers.findIndex(h => h === 'título' || h === 'title');
                const descIdx = headers.findIndex(h => h === 'descripción' || h === 'description');
                const prioIdx = headers.findIndex(h => h === 'prioridad' || h === 'priority');
                return {
                    title: (titleIdx >= 0 ? v[titleIdx] : v[0])?.trim() || `Tarea ${i + 1}`,
                    description: (descIdx >= 0 ? v[descIdx] : '')?.trim() || '',
                    priority: (prioIdx >= 0 ? (v[prioIdx]?.toLowerCase() || 'media') : 'media').replace(/[^a-z]/g, '') === 'alta' ? 'alta' : (v[prioIdx]?.toLowerCase() || 'media').replace(/[^a-z]/g, '') === 'baja' ? 'baja' : 'media'
                };
            }).filter(t => t.title);
            planDrawerState.csvTasks = tasks;
            planDrawerState.error = null;
        } catch (err) {
            planDrawerState.error = 'Error al procesar el CSV';
        }
        renderPlanDrawer();
    };
    reader.readAsText(file);
}

function handlePlanPickFile() {
    const input = document.getElementById('plan-file-input');
    if (input) {
        input.value = '';
        input.click();
    }
}

function handlePlanSubmit(e) {
    if (e) e.preventDefault();
    const title = (planDrawerState.formData.title || '').trim();
    if (!title) {
        planDrawerState.error = 'El nombre del plan es obligatorio';
        renderPlanDrawer();
        return;
    }
    planDrawerState.loading = true;
    planDrawerState.error = null;
    renderPlanDrawer();

    setTimeout(() => {
        planDrawerState.loading = false;
        if (typeof showToast === 'function') {
            showToast('success', 'Plan creado correctamente');
        }
        closePlanDrawer();
    }, 800);
}

function renderPlanTaskSection() {
    const s = planDrawerState;
    if (s.taskCreationMode === 'excel') {
        return `
            <div class="plan-massive-upload">
                <div class="plan-massive-upload__download">
                    <button type="button" class="ubits-button ubits-button--secondary ubits-button--md" onclick="handlePlanDownloadTemplate()">
                        <i class="far fa-download"></i>
                        <span>Descargar ejemplo</span>
                    </button>
                </div>
                <div class="plan-massive-upload__file-section">
                    <label class="template-form-label">Archivo:</label>
                    ${s.csvTasks.length > 0 ? `
                        <div class="template-file-loaded">
                            <div class="template-file-loaded__info">
                                <div class="template-file-loaded__icon"><i class="far fa-file-csv"></i></div>
                                <div>
                                    <p class="template-file-loaded__name">${escapeHtml(s.csvFile?.name || 'archivo.csv')}</p>
                                    <p class="ubits-body-sm-regular">${s.csvTasks.length} tarea(s) cargada(s)</p>
                                </div>
                            </div>
                            <button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only" onclick="handlePlanRemoveFile()" aria-label="Quitar archivo">
                                <i class="far fa-times"></i>
                            </button>
                        </div>
                    ` : `
                        <div class="plan-upload-area" id="plan-upload-area" onclick="handlePlanPickFile()">
                            <div class="plan-upload-area__icon"><i class="far fa-file-arrow-up"></i></div>
                            <p class="plan-upload-area__title">Subir archivos</p>
                            <p class="plan-upload-area__subtitle">Elige o suelta un archivo CSV</p>
                            <p class="plan-upload-area__limits">Máx. 1 archivos · Hasta 5 MB</p>
                            <button type="button" class="ubits-button ubits-button--secondary ubits-button--md plan-upload-area__btn">
                                <i class="far fa-arrow-up-from-line"></i>
                                <span>Seleccionar archivos</span>
                            </button>
                        </div>
                    `}
                </div>
            </div>
            <input type="file" id="plan-file-input" accept=".csv" class="template-file-input" onchange="handlePlanFileChange(event)" />
        `;
    }
    return `
        <button type="button" class="ubits-button ubits-button--secondary ubits-button--md plan-add-task-btn" onclick="handlePlanAddTask()">
            <i class="far fa-plus"></i>
            <span>Agregar tarea</span>
        </button>
        ${s.tasks.length > 0 ? `
            <div class="plan-tasks-label" style="margin-top:20px;margin-bottom:8px;">
                <span class="template-form-label">Tareas:</span>
            </div>
            <div class="template-tasks-list">
                ${s.tasks.map((t, i) => `
                    <div class="template-task-item">
                        <div class="template-task-item__content">
                            <span class="template-task-item__title">${escapeHtml(t.title)}</span>
                            ${t.description ? `<span class="template-task-item__description">${escapeHtml(t.description)}</span>` : ''}
                        </div>
                        <button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only" onclick="handlePlanRemoveTask(${i})" aria-label="Eliminar tarea">
                            <i class="far fa-trash"></i>
                        </button>
                    </div>
                `).join('')}
            </div>
        ` : ''}
        ${s.showTaskCreator ? `
            <div class="plan-task-creator">
                <div class="plan-task-creator__title-row">
                    <div class="plan-task-creator__input-wrap plan-task-creator__input-wrap--official">
                        <div id="plan-task-title-input-container"></div>
                    </div>
                    <div class="plan-task-creator__icons">
                        <button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only" title="Editar" aria-label="Editar"><i class="far fa-pen"></i></button>
                        <button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only" title="Eliminar" aria-label="Eliminar" onclick="handlePlanCancelTaskCreator()"><i class="far fa-times"></i></button>
                    </div>
                </div>
                <div id="plan-task-desc-input-container"></div>
                <div class="plan-task-creator__actions">
                    <button type="button" class="ubits-button ubits-button--secondary ubits-button--sm" onclick="handlePlanTaskPriorityClick()">
                        <i class="far fa-flag"></i>
                        <span>Elegir una prioridad</span>
                    </button>
                    <button type="button" class="ubits-button ubits-button--secondary ubits-button--sm" onclick="handlePlanTaskAssignClick()">
                        <i class="far fa-user"></i>
                        <span>Asignar a</span>
                    </button>
                    <button type="button" class="ubits-button ubits-button--secondary ubits-button--sm" onclick="handlePlanTaskDateClick()">
                        <i class="far fa-calendar"></i>
                        <span>Elegir una fecha</span>
                    </button>
                </div>
            </div>
        ` : ''}
    `;
}

function renderPlanDrawer() {
    ensurePlanDrawerOverlayExists();
    const overlay = document.getElementById('create-plan-drawer-overlay');
    const bodyEl = document.getElementById('create-plan-drawer');
    const footerEl = document.getElementById('create-plan-drawer-footer');
    if (!overlay || !bodyEl || !footerEl) return;

    if (!planDrawerState.isOpen) {
        overlay.style.display = 'none';
        overlay.setAttribute('aria-hidden', 'true');
        return;
    }

    overlay.style.display = 'flex';
    overlay.setAttribute('aria-hidden', 'false');
    const open = planDrawerState.openAccordion;
    const useT = planDrawerState.useTemplate;
    const cfg = planDrawerState.planConfiguration;
    const taskMode = planDrawerState.taskCreationMode;

    var bodyContent = `
        <div class="template-drawer-body">
            <form id="plan-form" onsubmit="handlePlanSubmit(event)">
                ${planDrawerState.error ? `
                    <div class="ubits-alert ubits-alert--error plan-alert-spaced">
                        <div class="ubits-alert__icon"><i class="far fa-exclamation-circle"></i></div>
                        <div class="ubits-alert__content">
                            <div class="ubits-alert__text">${escapeHtml(planDrawerState.error)}</div>
                        </div>
                    </div>
                ` : ''}

                <div class="plan-accordion ${open === 1 ? 'plan-accordion--open' : ''}" data-accordion="1">
                    <div class="plan-accordion__header" onclick="togglePlanAccordion(1)">
                        <div class="plan-accordion__header-text">
                            <div class="plan-accordion__title-row">
                                <span class="plan-accordion__number">1</span>
                                <span class="plan-accordion__title">Tipo de plan</span>
                            </div>
                            <p class="plan-accordion__subtitle">Selecciona el enfoque de creación que te resulte más práctico para avanzar más rápido.</p>
                        </div>
                        <i class="far fa-chevron-down plan-accordion__chevron"></i>
                    </div>
                    <div class="plan-accordion__body">
                        <div class="template-form-group">
                            <span class="template-form-label">¿Quieres usar una plantilla?</span>
                            <div class="template-radio-group">
                                ${getUbitsRadioHtml({ name: 'planUseTemplate', value: 'yes', label: 'Sí', checked: useT === 'yes', onchange: "handlePlanUseTemplateChange('yes')" })}
                                ${getUbitsRadioHtml({ name: 'planUseTemplate', value: 'no', label: 'No', checked: useT === 'no', onchange: "handlePlanUseTemplateChange('no')" })}
                            </div>
                        </div>
                        ${useT === 'yes' ? `
                            <div class="template-form-group">
                                <div id="plan-template-select-container"></div>
                            </div>
                        ` : ''}
                        <div class="template-form-group">
                            <div id="plan-title-input-container"></div>
                        </div>
                        ${useT === 'no' ? `
                            <div class="template-form-group">
                                <div id="plan-description-input-container"></div>
                            </div>
                        ` : ''}
                        <div class="template-form-group">
                            <div id="plan-enddate-input-container"></div>
                        </div>
                    </div>
                </div>

                <div class="plan-accordion ${open === 2 ? 'plan-accordion--open' : ''}" data-accordion="2">
                    <div class="plan-accordion__header" onclick="togglePlanAccordion(2)">
                        <div class="plan-accordion__header-text">
                            <div class="plan-accordion__title-row">
                                <span class="plan-accordion__number">2</span>
                                <span class="plan-accordion__title">Selección y asignación de usuarios</span>
                            </div>
                            <p class="plan-accordion__subtitle">Selecciona los usuarios que participarán en el plan y decide cómo quieres asignarles el plan.</p>
                        </div>
                        <i class="far fa-chevron-down plan-accordion__chevron"></i>
                    </div>
                    <div class="plan-accordion__body">
                        <div class="template-form-group">
                            <span class="template-form-label">¿Cómo quieres asignar los usuarios?</span>
                            <span class="template-form-helper template-form-helper--inline">(Obligatorio)</span>
                            <div class="template-radio-group template-radio-group--spaced">
                                ${getUbitsRadioHtml({ name: 'planUserMode', value: 'platform', label: 'Desde la plataforma', checked: planDrawerState.userAssignmentMode === 'platform', onchange: "handlePlanUserAssignmentModeChange('platform')" })}
                                ${getUbitsRadioHtml({ name: 'planUserMode', value: 'excel', label: 'Desde un excel', checked: planDrawerState.userAssignmentMode === 'excel', onchange: "handlePlanUserAssignmentModeChange('excel')" })}
                            </div>
                        </div>
                        ${planDrawerState.userAssignmentMode === 'platform' && !planDrawerState.userCsvFile ? `
                        <div class="template-form-group">
                            <label class="template-form-label">¿A quién se lo quieres asignar? ⓘ</label>
                            <div id="plan-user-search-input-container"></div>
                            ${planDrawerState.userResults.length > 0 ? `
                                <ul class="plan-user-results-list">
                                    ${planDrawerState.userResults.map((u, i) => `
                                        <li class="plan-user-result-item" onclick="handleAddPlanMemberByIndex(${i})">
                                            <span>${escapeHtml((u.email || '').split('@')[0])}</span>
                                            <span>${escapeHtml(u.email || '')}</span>
                                        </li>
                                    `).join('')}
                                </ul>
                            ` : ''}
                            ${planDrawerState.members.length > 0 ? `
                                <div class="plan-member-chips">
                                    ${planDrawerState.members.map(m => `
                                        <span class="plan-member-chip">
                                            ${escapeHtml((m.email || '').split('@')[0])}
                                            <button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only" onclick="handleRemovePlanMember('${m.id}')" aria-label="Quitar"><i class="far fa-times"></i></button>
                                        </span>
                                    `).join('')}
                                </div>
                            ` : ''}
                        </div>
                        ` : ''}
                        ${planDrawerState.userAssignmentMode === 'excel' ? `
                        <div class="template-form-group">
                            ${!planDrawerState.userCsvFile ? `
                                <div class="plan-download-wrap">
                                    <button type="button" class="ubits-button ubits-button--secondary ubits-button--sm" onclick="handlePlanDownloadUserTemplate()">
                                        <i class="far fa-download"></i>
                                        <span>Descargar plantilla de ejemplo de usuarios</span>
                                    </button>
                                </div>
                                <div class="template-upload-area" id="plan-user-upload-area" onclick="handlePlanUserCsvUpload()">
                                    <div class="template-upload-icon"><i class="far fa-cloud-upload"></i></div>
                                    <div>
                                        <p class="template-upload-text">Sube el archivo de tus usuarios para agilizar la gestión</p>
                                        <p class="template-upload-subtext">CSV, hasta 50 MB</p>
                                    </div>
                                    <button type="button" class="ubits-button ubits-button--secondary ubits-button--sm">
                                        <i class="far fa-file"></i>
                                        <span>Cargar plantilla de usuarios diligenciada</span>
                                    </button>
                                </div>
                                <input type="file" id="plan-user-file-input" accept=".csv" class="template-file-input" onchange="handlePlanUserFileChange(event)" />
                            ` : `
                                <div class="template-file-loaded">
                                    <div class="template-file-loaded__info">
                                        <div class="template-file-loaded__icon" style="background:var(--ubits-feedback-bg-success-subtle);color:var(--ubits-feedback-accent-success);"><i class="far fa-check"></i></div>
                                        <div>
                                            <p class="template-file-loaded__name">${escapeHtml(planDrawerState.userCsvFile?.name || '')}</p>
                                            <p class="ubits-body-sm-regular">Archivo con ${planDrawerState.csvUsers.length} usuario(s) cargado(s)</p>
                                        </div>
                                    </div>
                                    <button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only" onclick="handlePlanRemoveUserCsvFile()" aria-label="Quitar archivo">
                                        <i class="far fa-times"></i>
                                    </button>
                                </div>
                            `}
                        </div>
                        ` : ''}
                        <div class="template-form-group plan-form-group-divider">
                            <span class="template-form-label">¿Cómo deseas configurar este plan?</span>
                            <span class="template-form-helper template-form-helper--inline">(Obligatorio)</span>
                            <div class="template-radio-group template-radio-group--spaced">
                                ${getUbitsRadioHtml({ name: 'planConfig', value: 'everyone', label: 'Un plan para todos', checked: cfg === 'everyone', onchange: "handlePlanConfigChange('everyone')" })}
                                ${getUbitsRadioHtml({ name: 'planConfig', value: 'individual', label: 'Un plan para cada uno', checked: cfg === 'individual', onchange: "handlePlanConfigChange('individual')" })}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="plan-accordion ${open === 3 ? 'plan-accordion--open' : ''} ${useT === 'yes' ? 'plan-accordion--disabled' : ''}" data-accordion="3">
                    <div class="plan-accordion__header" onclick="togglePlanAccordion(3)">
                        <div class="plan-accordion__header-text">
                            <div class="plan-accordion__title-row">
                                <span class="plan-accordion__number">3</span>
                                <span class="plan-accordion__title">Creación de tareas</span>
                            </div>
                            <p class="plan-accordion__subtitle">${useT === 'yes' ? 'Al usar plantilla, las tareas vienen de la plantilla.' : 'Decide si prefieres crear tareas una por una o cargar un archivo con varias a la vez.'}</p>
                        </div>
                        <i class="far fa-chevron-down plan-accordion__chevron"></i>
                    </div>
                    <div class="plan-accordion__body">
                        ${useT === 'yes' ? '' : `
                            <div class="plan-task-creation-section">
                                <div class="template-form-group">
                                    <label class="template-form-label">¿Cómo quieres crear las tareas? <span class="template-form-helper template-form-helper--inline">(Obligatorio)</span></label>
                                    <div class="template-radio-group template-radio-group--spaced">
                                        ${getUbitsRadioHtml({ name: 'planTaskMode', value: 'manual', label: 'De forma manual', checked: taskMode === 'manual', onchange: "handlePlanTaskModeChange('manual')", extraClass: 'plan-radio-with-info', infoTitle: 'Crear tareas una por una' })}
                                        ${getUbitsRadioHtml({ name: 'planTaskMode', value: 'excel', label: 'De forma masiva', checked: taskMode === 'excel', onchange: "handlePlanTaskModeChange('excel')", extraClass: 'plan-radio-with-info', infoTitle: 'Cargar varias tareas desde un archivo' })}
                                    </div>
                                </div>
                                <div class="plan-task-actions plan-task-actions-spaced">${renderPlanTaskSection()}</div>
                            </div>
                        `}
                    </div>
                </div>
            </form>
        </div>`;
    bodyEl.innerHTML = bodyContent;
    footerEl.innerHTML = `
        <button type="button" class="ubits-button ubits-button--secondary ubits-button--sm" onclick="closePlanDrawer()"><span>Cancelar</span></button>
        <button type="button" id="plan-submit-btn" class="ubits-button ubits-button--primary ubits-button--sm" ${planDrawerState.loading ? 'disabled' : ''} onclick="document.getElementById('plan-form')?.requestSubmit();">
            ${planDrawerState.loading ? '<i class="far fa-spinner fa-spin"></i> ' : ''}<span>Crear plan</span>
        </button>`;

    setTimeout(() => {
        initPlanDrawerInputs();
        if (planDrawerState.showTaskCreator && window.planTaskTitleInputApi) {
            window.planTaskTitleInputApi.focus();
        }
        if (planDrawerState.taskCreationMode === 'excel') {
            setupPlanTaskUploadDragDrop();
        }
    }, 80);
}

function initPlanDrawerInputs() {
    if (typeof createInput !== 'function') return;
    const s = planDrawerState;

    if (document.getElementById('plan-template-select-container')) {
        createInput({
            containerId: 'plan-template-select-container',
            label: 'Plantilla',
            type: 'select',
            placeholder: 'Selecciona una plantilla',
            selectOptions: [{ value: '', text: 'Selecciona una plantilla' }].concat(s.templates.map(t => ({ value: t.id, text: t.name }))),
            value: s.selectedTemplateId || '',
            onChange: (val) => {
                planDrawerState.selectedTemplateId = val;
                if (val) {
                    const t = planDrawerState.templates.find(x => x.id === val);
                    if (t) planDrawerState.formData.title = t.name;
                }
                renderPlanDrawer();
            }
        });
    }
    if (document.getElementById('plan-title-input-container')) {
        createInput({
            containerId: 'plan-title-input-container',
            label: 'Nombre del plan *',
            placeholder: 'Escribe un título breve',
            value: s.formData.title || '',
            onChange: (v) => { planDrawerState.formData.title = v; }
        });
    }
    if (document.getElementById('plan-description-input-container')) {
        createInput({
            containerId: 'plan-description-input-container',
            label: 'Descripción',
            type: 'textarea',
            placeholder: 'Breve descripción del plan',
            value: s.formData.description || '',
            onChange: (v) => { planDrawerState.formData.description = v; }
        });
    }
    if (document.getElementById('plan-enddate-input-container')) {
        createInput({
            containerId: 'plan-enddate-input-container',
            label: 'Fecha de finalización',
            type: 'calendar',
            placeholder: 'Selecciona una fecha',
            value: s.formData.endDate || '',
            onChange: (v) => { planDrawerState.formData.endDate = v; }
        });
    }
    if (document.getElementById('plan-user-search-input-container')) {
        createInput({
            containerId: 'plan-user-search-input-container',
            type: 'search',
            placeholder: 'Escribe un nombre o correo',
            value: s.userSearch || '',
            showLabel: false,
            onChange: (v) => {
                planDrawerState.userSearch = v;
                clearTimeout(window._planUserSearchT);
                window._planUserSearchT = setTimeout(handlePlanUserSearch, 200);
            }
        });
    }
    if (document.getElementById('plan-task-title-input-container')) {
        window.planTaskTitleInputApi = createInput({
            containerId: 'plan-task-title-input-container',
            placeholder: 'Nueva tarea',
            size: 'sm',
            showLabel: false,
            value: (window.currentPlanTask || {}).title || '',
            onChange: (v) => {
                if (!window.currentPlanTask) window.currentPlanTask = {};
                window.currentPlanTask.title = v;
            }
        });
    }
    if (document.getElementById('plan-task-desc-input-container')) {
        createInput({
            containerId: 'plan-task-desc-input-container',
            type: 'textarea',
            placeholder: 'Descripción',
            showLabel: false,
            value: (window.currentPlanTask || {}).description || '',
            onChange: (v) => {
                if (!window.currentPlanTask) window.currentPlanTask = {};
                window.currentPlanTask.description = v;
            }
        });
    }
}

function setupPlanTaskUploadDragDrop() {
    const uploadArea = document.getElementById('plan-upload-area');
    const fileInput = document.getElementById('plan-file-input');
    if (!uploadArea || !fileInput) return;

    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.classList.add('plan-upload-area--drag-over');
    });
    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.classList.remove('plan-upload-area--drag-over');
    });
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.classList.remove('plan-upload-area--drag-over');
        const file = e.dataTransfer?.files?.[0];
        if (file && (file.name.endsWith('.csv') || file.type === 'text/csv')) {
            const dt = new DataTransfer();
            dt.items.add(file);
            fileInput.files = dt.files;
            fileInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
    });
}

// Escapar HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/** Genera el HTML de un radio oficial UBITS (evita markup hardcodeado). */
function getUbitsRadioHtml(opts) {
    const { name, value, label, checked, onchange, id = '', extraClass = '', infoTitle = '' } = opts;
    const idAttr = id ? ` id="${id}"` : '';
    const labelClass = ['ubits-radio', 'ubits-radio--sm'].concat(extraClass ? [extraClass] : []).join(' ');
    const infoIcon = infoTitle ? ` <i class="far fa-info-circle plan-radio-info-icon" title="${escapeHtml(infoTitle)}"></i>` : '';
    return `<label class="${labelClass}"${idAttr}><input type="radio" name="${escapeHtml(name)}" class="ubits-radio__input" value="${escapeHtml(value)}" ${checked ? 'checked' : ''} onchange="${onchange}" /><span class="ubits-radio__circle"></span><span class="ubits-radio__label">${escapeHtml(label)}</span>${infoIcon}</label>`;
}

// Inicializar FAB (se puede llamar desde cualquier página)
function initFabButton() {
    const container = document.getElementById('fab-button-container');
    if (container) renderFabButton();
}

// Inicializar
document.addEventListener('DOMContentLoaded', function () {
    // Solo inicializar el FAB automáticamente en la página de Planes
    if (document.body && document.body.classList.contains('page-planes')) {
        initFabButton();
    }
    renderTemplateDrawer();
    renderPlanDrawer();

    window.openTemplateDrawer = openTemplateDrawer;
    window.closeTemplateDrawer = closeTemplateDrawer;
    window.openPlanDrawer = openPlanDrawer;
    window.closePlanDrawer = closePlanDrawer;
    window.handleTaskCreationModeChange = handleTaskCreationModeChange;
    window.handleDownloadTemplate = handleDownloadTemplate;
    window.handleRemoveFile = handleRemoveFile;
    window.handleAddTask = handleAddTask;
    window.handleCancelTaskCreator = handleCancelTaskCreator;
    window.handleSaveTask = handleSaveTask;
    window.handleRemoveTask = handleRemoveTask;
    window.handleTemplateSubmit = handleTemplateSubmit;
    window.onPickFile = onPickFile;
    window.handleFileChange = handleFileChange;
    window.templateDrawerState = templateDrawerState;
    window.currentTask = null;
    window.initFabButton = initFabButton;
    window.renderFabButton = renderFabButton;
    window.fabState = fabState;
    window.openCrearMenu = openCrearMenu;
});
