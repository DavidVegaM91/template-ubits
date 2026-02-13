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
    const statusLabels = { Activo: 'Iniciado', Vencido: 'Vencido', Finalizado: 'Finalizado' };
    const statusClass = plan.status === 'Activo' ? 'plan-card-status--iniciada' : plan.status === 'Vencido' ? 'plan-card-status--vencido' : 'plan-card-status--finalizado';
    const label = statusLabels[plan.status] || plan.status;
    return `
        <div class="plan-card" data-plan-id="${escapePlanHtml(plan.id)}" role="button" tabindex="0">
            <div class="plan-card__header">
                ${isNew ? '<div class="plan-card__new-dot" aria-hidden="true"></div>' : ''}
                <h3 class="plan-card__title" title="${escapePlanHtml(plan.name)}">${escapePlanHtml(plan.name)}</h3>
            </div>
            <div class="plan-card__body">
                <div class="plan-card__date">
                    <span class="plan-card__date-label">Finalización:</span><br />
                    <span class="plan-card__date-value">${escapePlanHtml(formatPlanDate(plan.end_date))}</span>
                </div>
                <span class="plan-card__status ${statusClass}">${escapePlanHtml(label)}</span>
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
                            <div class="plan-section__filters">
                                <button type="button" class="plan-filter-chip ${estadoPlanes.filterInProgress === 'individual' ? 'plan-filter-chip--active' : ''}" data-filter="individual">
                                    <i class="far fa-user plan-filter-chip__icon"></i>
                                    Individuales
                                </button>
                                <button type="button" class="plan-filter-chip ${estadoPlanes.filterInProgress === 'grupal' ? 'plan-filter-chip--active' : ''}" data-filter="grupal">
                                    <i class="far fa-users plan-filter-chip__icon"></i>
                                    Grupales
                                </button>
                            </div>
                        </div>
                        <button type="button" class="plan-section__ver-filtros" id="plan-ver-filtros-progress">
                            <i class="far fa-search"></i>
                            Ver filtros
                        </button>
                    </div>
                    <div class="plan-section__counters">
                        <div class="plan-counter"><span class="plan-counter__dot plan-counter__dot--blue"></span> Iniciados: ${countersInProgress.iniciado}</div>
                        <div class="plan-counter"><span class="plan-counter__dot plan-counter__dot--red"></span> Vencidos: ${countersInProgress.vencido}</div>
                    </div>
                </div>
                ${inProgress.length === 0 ? '<div class="plan-section__empty">No hay planes en curso.</div>' : `
                    <div class="plan-grid" id="plan-grid-in-progress">
                        ${pageInProgressData.map((p, i) => renderPlanCard(p, i === 0 && estadoPlanes.pageInProgress === 1)).join('')}
                    </div>
                    <div class="plan-pagination">
                        <span>${estadoPlanes.pageInProgress} de ${totalPagesInProgress} páginas</span>
                        <button type="button" class="plan-pagination__btn" id="plan-prev-in-progress" ${estadoPlanes.pageInProgress <= 1 ? 'disabled' : ''} aria-label="Anterior">
                            <i class="far fa-chevron-left"></i>
                        </button>
                        <button type="button" class="plan-pagination__btn" id="plan-next-in-progress" ${estadoPlanes.pageInProgress >= totalPagesInProgress ? 'disabled' : ''} aria-label="Siguiente">
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
                            <div class="plan-section__filters">
                                <button type="button" class="plan-filter-chip plan-filter-chip--finished ${estadoPlanes.filterFinished === 'individual' ? 'plan-filter-chip--active' : ''}" data-filter-finished="individual">
                                    <i class="far fa-user plan-filter-chip__icon"></i>
                                    Individuales
                                </button>
                                <button type="button" class="plan-filter-chip plan-filter-chip--finished ${estadoPlanes.filterFinished === 'grupal' ? 'plan-filter-chip--active' : ''}" data-filter-finished="grupal">
                                    <i class="far fa-users plan-filter-chip__icon"></i>
                                    Grupales
                                </button>
                            </div>
                        </div>
                        <button type="button" class="plan-section__ver-filtros" id="plan-ver-filtros-finished">
                            <i class="far fa-search"></i>
                            Ver filtros
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
                        <button type="button" class="plan-pagination__btn" id="plan-prev-finished" ${estadoPlanes.pageFinished <= 1 ? 'disabled' : ''} aria-label="Anterior">
                            <i class="far fa-chevron-left"></i>
                        </button>
                        <button type="button" class="plan-pagination__btn" id="plan-next-finished" ${estadoPlanes.pageFinished >= totalPagesFinished ? 'disabled' : ''} aria-label="Siguiente">
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

// Renderizar drawer de plantilla
function renderTemplateDrawer() {
    const overlay = document.getElementById('create-template-drawer-overlay');
    const drawer = document.getElementById('create-template-drawer');
    
    if (!overlay || !drawer) {
        // Si no existen los elementos, crearlos
        if (!overlay) {
            const newOverlay = document.createElement('div');
            newOverlay.id = 'create-template-drawer-overlay';
            newOverlay.className = 'template-drawer-overlay';
            newOverlay.style.display = 'none';
            document.body.appendChild(newOverlay);
        }
        if (!drawer) {
            const newDrawer = document.createElement('div');
            newDrawer.id = 'create-template-drawer';
            newDrawer.className = 'template-drawer-content';
            if (overlay) {
                overlay.appendChild(newDrawer);
            } else {
                document.getElementById('create-template-drawer-overlay')?.appendChild(newDrawer);
            }
        }
        // Reintentar después de crear elementos
        setTimeout(() => renderTemplateDrawer(), 50);
        return;
    }

    if (templateDrawerState.isOpen) {
        overlay.style.display = 'flex';
        
        drawer.innerHTML = `
            <!-- Header -->
            <div class="template-drawer-header">
                <div class="template-drawer-header__top">
                    <div>
                        <h2 class="ubits-heading-h2">Crear una plantilla para un plan</h2>
                        <p class="ubits-body-sm-regular">Es una base reutilizable para tus planes, úsalo siempre.</p>
                    </div>
                    <button class="template-drawer-close" id="template-drawer-close">
                        <i class="far fa-times"></i>
                    </button>
                </div>
            </div>

            <!-- Body -->
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
                            <label class="template-radio-item ubits-radio ubits-radio--sm">
                                <input type="radio" name="templatePermission" class="ubits-radio__input" value="empresarial" ${templateDrawerState.templatePermission === 'empresarial' ? 'checked' : ''} onchange="templateDrawerState.templatePermission = 'empresarial'" />
                                <span class="ubits-radio__circle"></span>
                                <span class="ubits-radio__label">Plantilla empresarial</span>
                            </label>
                            <label class="template-radio-item ubits-radio ubits-radio--sm">
                                <input type="radio" name="templatePermission" class="ubits-radio__input" value="individual" ${templateDrawerState.templatePermission === 'individual' ? 'checked' : ''} onchange="templateDrawerState.templatePermission = 'individual'" />
                                <span class="ubits-radio__circle"></span>
                                <span class="ubits-radio__label">Plantilla individual</span>
                            </label>
                        </div>
                    </div>

                    <!-- Creación de tareas -->
                    <div class="template-form-group template-form-group--spaced-above">
                        <label class="template-form-label">Creación de tareas</label>
                        <p class="template-form-helper template-form-helper--close-to-title">
                            Para más de 5 tareas, hazlo de forma rápida, sencilla y práctica desde un archivo.
                        </p>

                        <div style="display: flex; flex-direction: column; gap: 16px; margin-top: 12px;">
                            <!-- Radio buttons para modo de creación -->
                            <div class="template-radio-group">
                                <label class="template-radio-item ubits-radio ubits-radio--sm" id="task-creation-mode-excel">
                                    <input type="radio" name="taskCreationMode" class="ubits-radio__input" value="excel" ${templateDrawerState.taskCreationMode === 'excel' ? 'checked' : ''} onchange="handleTaskCreationModeChange('excel')" />
                                    <span class="ubits-radio__circle"></span>
                                    <span class="ubits-radio__label">Con un excel</span>
                                </label>
                                <label class="template-radio-item ubits-radio ubits-radio--sm" id="task-creation-mode-manual">
                                    <input type="radio" name="taskCreationMode" class="ubits-radio__input" value="manual" ${templateDrawerState.taskCreationMode === 'manual' ? 'checked' : ''} onchange="handleTaskCreationModeChange('manual')" />
                                    <span class="ubits-radio__circle"></span>
                                    <span class="ubits-radio__label">Manualmente</span>
                                </label>
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
            </div>

            <!-- Footer -->
            <div class="template-drawer-footer">
                <button 
                    type="button"
                    class="ubits-button ubits-button--secondary ubits-button--md"
                    onclick="closeTemplateDrawer()"
                >
                    <span>Cancelar</span>
                </button>
                <button 
                    type="button"
                    id="create-template-button"
                    class="ubits-button ubits-button--primary ubits-button--md"
                    onclick="handleTemplateSubmit()"
                    ${templateDrawerState.loading ? 'disabled' : ''}
                >
                    ${templateDrawerState.loading ? '<i class="far fa-spinner fa-spin"></i>' : ''}
                    <span>Crear plantilla</span>
                </button>
            </div>
        `;

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

        // Event listener para cerrar
        const closeBtn = document.getElementById('template-drawer-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeTemplateDrawer);
        }

        // Cerrar al hacer clic en overlay
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeTemplateDrawer();
            }
        });

        // Cerrar con tecla ESC
        const escHandler = (e) => {
            if (e.key === 'Escape' && templateDrawerState.isOpen) {
                closeTemplateDrawer();
            }
        };
        document.addEventListener('keydown', escHandler);
        overlay.dataset.escHandler = 'true';

        // Configurar drag & drop si está en modo excel
        setTimeout(() => {
            if (templateDrawerState.taskCreationMode === 'excel') {
                setupDragAndDrop();
            }
        }, 100);
    } else {
        overlay.style.display = 'none';
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
            <button type="button" class="template-upload-button">
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
                class="template-file-loaded__remove"
                onclick="handleRemoveFile()"
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
                class="template-task-item__remove"
                onclick="handleRemoveTask(${index})"
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
                            <button type="button" class="template-file-loaded__remove" onclick="handlePlanRemoveFile()">
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
                        <button type="button" class="template-task-item__remove" onclick="handlePlanRemoveTask(${i})">
                            <i class="far fa-trash"></i>
                        </button>
                    </div>
                `).join('')}
            </div>
        ` : ''}
        ${s.showTaskCreator ? `
            <div class="plan-task-creator">
                <div class="plan-task-creator__title-row">
                    <div class="plan-task-creator__input-wrap">
                        <input type="text" id="plan-task-title-input" class="plan-task-creator__input" placeholder="Nueva tarea"
                            value="${escapeHtml((window.currentPlanTask || {}).title || '')}"
                            oninput="(window.currentPlanTask=window.currentPlanTask||{}).title=this.value" />
                    </div>
                    <div class="plan-task-creator__icons">
                        <button type="button" class="plan-task-creator__icon-btn" title="Editar"><i class="far fa-pen"></i></button>
                        <button type="button" class="plan-task-creator__icon-btn plan-task-creator__icon-btn--remove" title="Eliminar" onclick="handlePlanCancelTaskCreator()"><i class="far fa-times"></i></button>
                    </div>
                </div>
                <textarea id="plan-task-desc-input" class="plan-task-creator__textarea" placeholder="Descripción" rows="3"
                    oninput="(window.currentPlanTask=window.currentPlanTask||{}).description=this.value">${escapeHtml((window.currentPlanTask || {}).description || '')}</textarea>
                <div class="plan-task-creator__actions">
                    <button type="button" class="plan-task-action-btn" onclick="handlePlanTaskPriorityClick()">
                        <i class="far fa-flag"></i>
                        <span>Elegir una prioridad</span>
                    </button>
                    <button type="button" class="plan-task-action-btn" onclick="handlePlanTaskAssignClick()">
                        <i class="far fa-user"></i>
                        <span>Asignar a</span>
                    </button>
                    <button type="button" class="plan-task-action-btn" onclick="handlePlanTaskDateClick()">
                        <i class="far fa-calendar"></i>
                        <span>Elegir una fecha</span>
                    </button>
                </div>
            </div>
        ` : ''}
    `;
}

function renderPlanDrawer() {
    const overlay = document.getElementById('create-plan-drawer-overlay');
    const drawer = document.getElementById('create-plan-drawer');
    if (!overlay || !drawer) return;

    if (!planDrawerState.isOpen) {
        overlay.style.display = 'none';
        return;
    }

    overlay.style.display = 'flex';
    const open = planDrawerState.openAccordion;
    const useT = planDrawerState.useTemplate;
    const cfg = planDrawerState.planConfiguration;
    const taskMode = planDrawerState.taskCreationMode;

    drawer.innerHTML = `
        <div class="template-drawer-header">
            <div class="template-drawer-header__top">
                <div>
                    <h2 class="ubits-heading-h2">Crear un plan</h2>
                    <p class="plan-drawer-header__subtitle">Organiza tus pendientes, asigna tareas y lleva el control de tus avances con facilidad.</p>
                </div>
                <button type="button" class="template-drawer-close" id="plan-drawer-close">
                    <i class="far fa-times"></i>
                </button>
            </div>
        </div>
        <div class="template-drawer-body">
            <form id="plan-form" onsubmit="handlePlanSubmit(event)">
                ${planDrawerState.error ? `
                    <div class="ubits-alert ubits-alert--error" style="margin-bottom: 16px;">
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
                                <label class="template-radio-item ubits-radio ubits-radio--sm">
                                    <input type="radio" name="planUseTemplate" class="ubits-radio__input" value="yes" ${useT === 'yes' ? 'checked' : ''} onchange="handlePlanUseTemplateChange('yes')" />
                                    <span class="ubits-radio__circle"></span>
                                    <span class="ubits-radio__label">Sí</span>
                                </label>
                                <label class="template-radio-item ubits-radio ubits-radio--sm">
                                    <input type="radio" name="planUseTemplate" class="ubits-radio__input" value="no" ${useT === 'no' ? 'checked' : ''} onchange="handlePlanUseTemplateChange('no')" />
                                    <span class="ubits-radio__circle"></span>
                                    <span class="ubits-radio__label">No</span>
                                </label>
                            </div>
                        </div>
                        ${useT === 'yes' ? `
                            <div class="template-form-group">
                                <label class="template-form-label">Plantilla</label>
                                <select class="ubits-input" style="width:100%;padding:10px 12px;border-radius:8px;border:1px solid var(--ubits-border-1);"
                                    onchange="var o=this.options[this.selectedIndex]; planDrawerState.selectedTemplateId=o.value; if(o.value){ var t=planDrawerState.templates.find(x=>x.id===o.value); if(t) planDrawerState.formData.title=t.name; } renderPlanDrawer();">
                                    <option value="">Selecciona una plantilla</option>
                                    ${planDrawerState.templates.map(t => `
                                        <option value="${t.id}" ${planDrawerState.selectedTemplateId === t.id ? 'selected' : ''}>${escapeHtml(t.name)}</option>
                                    `).join('')}
                                </select>
                            </div>
                        ` : ''}
                        <div class="template-form-group">
                            <label class="template-form-label">Nombre del plan *</label>
                            <input type="text" class="ubits-input" placeholder="Escribe un título breve" value="${escapeHtml(planDrawerState.formData.title)}"
                                oninput="planDrawerState.formData.title=this.value" style="width:100%;padding:10px 12px;border-radius:8px;border:1px solid var(--ubits-border-1);" />
                        </div>
                        ${useT === 'no' ? `
                            <div class="template-form-group">
                                <label class="template-form-label">Descripción</label>
                                <textarea class="ubits-input" placeholder="Breve descripción del plan" rows="2" style="width:100%;padding:10px 12px;border-radius:8px;border:1px solid var(--ubits-border-1);resize:vertical;"
                                    oninput="planDrawerState.formData.description=this.value">${escapeHtml(planDrawerState.formData.description)}</textarea>
                            </div>
                        ` : ''}
                        <div class="template-form-group">
                            <label class="template-form-label">Fecha de finalización</label>
                            <input type="date" class="ubits-input" value="${escapeHtml(planDrawerState.formData.endDate)}"
                                oninput="planDrawerState.formData.endDate=this.value" style="width:100%;padding:10px 12px;border-radius:8px;border:1px solid var(--ubits-border-1);" />
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
                            <span class="template-form-helper" style="margin-left:4px;">(Obligatorio)</span>
                            <div class="template-radio-group" style="margin-top:8px;">
                                <label class="template-radio-item ubits-radio ubits-radio--sm">
                                    <input type="radio" name="planUserMode" class="ubits-radio__input" value="platform" ${planDrawerState.userAssignmentMode === 'platform' ? 'checked' : ''} onchange="handlePlanUserAssignmentModeChange('platform')" />
                                    <span class="ubits-radio__circle"></span>
                                    <span class="ubits-radio__label">Desde la plataforma</span>
                                </label>
                                <label class="template-radio-item ubits-radio ubits-radio--sm">
                                    <input type="radio" name="planUserMode" class="ubits-radio__input" value="excel" ${planDrawerState.userAssignmentMode === 'excel' ? 'checked' : ''} onchange="handlePlanUserAssignmentModeChange('excel')" />
                                    <span class="ubits-radio__circle"></span>
                                    <span class="ubits-radio__label">Desde un excel</span>
                                </label>
                            </div>
                        </div>
                        ${planDrawerState.userAssignmentMode === 'platform' && !planDrawerState.userCsvFile ? `
                        <div class="template-form-group">
                            <label class="template-form-label">¿A quién se lo quieres asignar? ⓘ</label>
                            <div style="display:flex;align-items:center;gap:8px;padding:12px;border:1px solid var(--ubits-border-1);border-radius:8px;background:var(--ubits-bg-1);">
                                <i class="far fa-search" style="color:var(--ubits-fg-1-medium);"></i>
                                <input type="text" id="plan-user-search" class="ubits-input" placeholder="Escribe un nombre o correo"
                                    value="${escapeHtml(planDrawerState.userSearch)}" oninput="planDrawerState.userSearch=this.value; clearTimeout(window._planUserSearchT); window._planUserSearchT=setTimeout(handlePlanUserSearch, 200);"
                                    style="flex:1;border:none;background:transparent;padding:0;outline:none;" />
                            </div>
                            ${planDrawerState.userResults.length > 0 ? `
                                <ul style="margin-top:8px;list-style:none;padding:0;border:1px solid var(--ubits-border-1);border-radius:8px;background:var(--ubits-bg-1);max-height:128px;overflow-y:auto;">
                                    ${planDrawerState.userResults.map((u, i) => `
                                        <li style="padding:10px 12px;cursor:pointer;border-bottom:1px solid var(--ubits-border-1);display:flex;flex-direction:column;gap:2px;" onclick="handleAddPlanMemberByIndex(${i})" onmouseover="this.style.background='var(--ubits-bg-2)'" onmouseout="this.style.background='transparent'">
                                            <span style="font-size:14px;color:var(--ubits-fg-1-high);">${escapeHtml((u.email || '').split('@')[0])}</span>
                                            <span style="font-size:12px;color:var(--ubits-fg-1-medium);">${escapeHtml(u.email || '')}</span>
                                        </li>
                                    `).join('')}
                                </ul>
                            ` : ''}
                            ${planDrawerState.members.length > 0 ? `
                                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px;">
                                    ${planDrawerState.members.map(m => `
                                        <span class="plan-member-chip">
                                            ${escapeHtml((m.email || '').split('@')[0])}
                                            <button type="button" class="plan-member-chip__remove" onclick="handleRemovePlanMember('${m.id}')"><i class="far fa-times"></i></button>
                                        </span>
                                    `).join('')}
                                </div>
                            ` : ''}
                        </div>
                        ` : ''}
                        ${planDrawerState.userAssignmentMode === 'excel' ? `
                        <div class="template-form-group">
                            ${!planDrawerState.userCsvFile ? `
                                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px;">
                                    <button type="button" class="ubits-button ubits-button--secondary ubits-button--md" onclick="handlePlanDownloadUserTemplate()">
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
                                    <button type="button" class="template-upload-button">
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
                                    <button type="button" class="template-file-loaded__remove" onclick="handlePlanRemoveUserCsvFile()">
                                        <i class="far fa-times"></i>
                                    </button>
                                </div>
                            `}
                        </div>
                        ` : ''}
                        <div class="template-form-group" style="margin-top:16px;padding-top:16px;border-top:1px solid var(--ubits-border-1);">
                            <span class="template-form-label">¿Cómo deseas configurar este plan?</span>
                            <span class="template-form-helper" style="margin-left:4px;">(Obligatorio)</span>
                            <div class="template-radio-group" style="margin-top:8px;">
                                <label class="template-radio-item ubits-radio ubits-radio--sm">
                                    <input type="radio" name="planConfig" class="ubits-radio__input" value="everyone" ${cfg === 'everyone' ? 'checked' : ''} onchange="handlePlanConfigChange('everyone')" />
                                    <span class="ubits-radio__circle"></span>
                                    <span class="ubits-radio__label">Un plan para todos</span>
                                </label>
                                <label class="template-radio-item ubits-radio ubits-radio--sm">
                                    <input type="radio" name="planConfig" class="ubits-radio__input" value="individual" ${cfg === 'individual' ? 'checked' : ''} onchange="handlePlanConfigChange('individual')" />
                                    <span class="ubits-radio__circle"></span>
                                    <span class="ubits-radio__label">Un plan para cada uno</span>
                                </label>
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
                                    <label class="template-form-label">¿Cómo quieres crear las tareas? <span class="template-form-helper" style="margin-left:2px;">(Obligatorio)</span></label>
                                    <div class="template-radio-group" style="margin-top:8px;">
                                        <label class="template-radio-item plan-radio-with-info ubits-radio ubits-radio--sm">
                                            <input type="radio" name="planTaskMode" class="ubits-radio__input" value="manual" ${taskMode === 'manual' ? 'checked' : ''} onchange="handlePlanTaskModeChange('manual')" />
                                            <span class="ubits-radio__circle"></span>
                                            <span class="ubits-radio__label">De forma manual</span>
                                            <i class="far fa-info-circle plan-radio-info-icon" title="Crear tareas una por una"></i>
                                        </label>
                                        <label class="template-radio-item plan-radio-with-info ubits-radio ubits-radio--sm">
                                            <input type="radio" name="planTaskMode" class="ubits-radio__input" value="excel" ${taskMode === 'excel' ? 'checked' : ''} onchange="handlePlanTaskModeChange('excel')" />
                                            <span class="ubits-radio__circle"></span>
                                            <span class="ubits-radio__label">De forma masiva</span>
                                            <i class="far fa-info-circle plan-radio-info-icon" title="Cargar varias tareas desde un archivo"></i>
                                        </label>
                                    </div>
                                </div>
                                <div class="plan-task-actions" style="margin-top:20px;">${renderPlanTaskSection()}</div>
                            </div>
                        `}
                    </div>
                </div>
            </form>
        </div>
        <div class="template-drawer-footer">
            <button type="button" class="ubits-button ubits-button--tertiary ubits-button--md" onclick="closePlanDrawer()">Cancelar</button>
            <button type="button" id="plan-submit-btn" class="ubits-button ubits-button--primary ubits-button--md" ${planDrawerState.loading ? 'disabled' : ''} onclick="document.getElementById('plan-form')?.requestSubmit();">
                ${planDrawerState.loading ? '<i class="far fa-spinner fa-spin"></i> ' : ''}<span>Crear plan</span>
            </button>
        </div>
    `;

    const closeBtn = document.getElementById('plan-drawer-close');
    if (closeBtn) closeBtn.addEventListener('click', closePlanDrawer);
    overlay.onclick = function(ev) {
        if (ev.target === overlay) closePlanDrawer();
    };
    if (window._planDrawerEscHandler) {
        document.removeEventListener('keydown', window._planDrawerEscHandler);
    }
    window._planDrawerEscHandler = function(ev) {
        if (ev.key === 'Escape' && planDrawerState.isOpen) closePlanDrawer();
    };
    document.addEventListener('keydown', window._planDrawerEscHandler);

    if (planDrawerState.showTaskCreator) {
        setTimeout(() => {
            const titleInput = document.getElementById('plan-task-title-input');
            if (titleInput) titleInput.focus();
        }, 80);
    }

    if (planDrawerState.taskCreationMode === 'excel') {
        setupPlanTaskUploadDragDrop();
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

// Inicializar FAB (se puede llamar desde cualquier página)
function initFabButton() {
    const container = document.getElementById('fab-button-container');
    if (container) renderFabButton();
}

// Inicializar
document.addEventListener('DOMContentLoaded', function() {
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
