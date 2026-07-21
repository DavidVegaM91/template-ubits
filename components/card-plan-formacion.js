/* ========================================
   UBITS CARD PLAN FORMACIÓN
   Tarjeta clickeable de plan de formación activo
   CSS: card-plan-formacion.css (+ progress-bar.css)
   ======================================== */

/**
 * @typedef {Object} CardPlanFormacionData
 * @property {string} [title] - Nombre del plan
 * @property {string} [cierre] - Meta de cierre (p. ej. "Cierre: Jun 30")
 * @property {string} [deadline] - Alias de cierre
 * @property {number} [progress] - 0–100
 * @property {string} [progressLabel] - Meta bajo la barra (p. ej. "2/6 contenidos")
 * @property {boolean} [empty] - Sin progreso: barra subtle y 0 %
 * @property {'default'|'progress'|'completed'} [status] - Estado visual (si no se pasa, se infiere del progress)
 * @property {string} [planId] - ID del plan (data-plan-id)
 * @property {string} [planTipo] - contenidos | competencias (data-plan-tipo)
 */

/**
 * Renderiza HTML de card-plan-formacion.
 * @param {CardPlanFormacionData} plan
 * @param {{ extraClass?: string, tabIndex?: number }} [options]
 * @returns {string}
 */
function resolveCardPlanFormacionStatus(plan) {
    if (plan.empty) return 'default';
    var explicit = plan.status;
    if (explicit === 'completed' || explicit === 'complete') return 'completed';
    if (explicit === 'progress') return 'progress';
    if (explicit === 'default') return 'default';
    var pct = Math.max(0, Math.min(100, Math.round(Number(plan.progress) || 0)));
    if (pct >= 100) return 'completed';
    if (pct > 0) return 'progress';
    return 'default';
}

/** Label visible «Tipo: Contenidos» | «Tipo: Competencias» según planTipo. */
function formatCardPlanFormacionTipoLabel(planTipo) {
    var t = String(planTipo || '').toLowerCase().trim();
    if (t === 'competencias') return 'Tipo: Competencias';
    if (t === 'contenidos') return 'Tipo: Contenidos';
    return '';
}

function renderCardPlanFormacion(plan, options) {
    plan = plan || {};
    options = options || {};
    var status = resolveCardPlanFormacionStatus(plan);
    var value = status === 'default'
        ? 0
        : Math.max(0, Math.min(100, Math.round(Number(plan.progress) || 0)));
    if (status === 'completed') value = 100;
    var progressBar = '';
    if (typeof progressBarHtml === 'function') {
        progressBar = progressBarHtml({
            value: value,
            size: 'sm',
            rounded: true,
            track: status === 'default' ? 'subtle' : 'default',
            status: status === 'completed' ? 'complete' : undefined,
            autoComplete: status === 'completed',
            ariaLabel: 'Progreso del plan'
        });
    } else {
        var barCls = 'ubits-progress-bar ubits-progress-bar--sm ubits-progress-bar--rounded' +
            (status === 'default' ? ' ubits-progress-bar--track-subtle' : '') +
            (status === 'completed' ? ' ubits-progress-bar--complete' : '');
        progressBar =
            '<div class="' + barCls + '" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + value +
            '" aria-label="Progreso del plan"' +
            (status === 'completed' ? ' data-status="complete"' : '') + '>' +
            '<div class="ubits-progress-bar__track"><div class="ubits-progress-bar__fill" style="width:' + value + '%"></div></div></div>';
    }
    var cierre = plan.cierre || plan.deadline || '';
    var title = plan.title || '';
    var progressLabel = plan.progressLabel || '';
    var tipoLabel = formatCardPlanFormacionTipoLabel(plan.planTipo);
    var pct = status === 'default' ? 0 : value;
    var dataAttrs = '';
    if (plan.planId) {
        dataAttrs += ' data-plan-id="' + String(plan.planId).replace(/"/g, '&quot;') + '"';
    }
    if (plan.planTipo) {
        dataAttrs += ' data-plan-tipo="' + String(plan.planTipo).replace(/"/g, '&quot;') + '"';
    }
    var tabIndex = options.tabIndex != null ? options.tabIndex : 0;
    var extraClass = options.extraClass ? ' ' + options.extraClass : '';
    var statusClass = status === 'completed'
        ? ' card-plan-formacion--completed'
        : (status === 'progress' ? ' card-plan-formacion--progress' : ' card-plan-formacion--default');

    var metaRow =
        '<div class="card-plan-formacion__meta">' +
            (tipoLabel
                ? '<p class="ubits-body-sm-regular card-plan-formacion__tipo">' + tipoLabel + '</p>'
                : '<span class="card-plan-formacion__tipo-spacer" aria-hidden="true"></span>') +
            '<p class="ubits-body-sm-regular card-plan-formacion__cierre">' + cierre + '</p>' +
        '</div>';

    return (
        '<article class="card-plan-formacion' + statusClass + extraClass + '" tabindex="' + tabIndex + '"' +
            ' data-status="' + status + '"' + dataAttrs + '>' +
            '<div class="card-plan-formacion__head">' +
                metaRow +
                '<p class="ubits-body-md-semibold card-plan-formacion__title">' + title + '</p>' +
            '</div>' +
            '<div class="card-plan-formacion__progress">' +
                progressBar +
                '<div class="card-plan-formacion__progress-meta">' +
                    '<span class="ubits-body-sm-regular card-plan-formacion__progress-label">' + progressLabel + '</span>' +
                    '<span class="ubits-body-sm-semibold card-plan-formacion__progress-pct">' + pct + '%</span>' +
                '</div>' +
            '</div>' +
        '</article>'
    );
}

/**
 * Monta una o más cards en un contenedor.
 * @param {string} containerId
 * @param {CardPlanFormacionData|CardPlanFormacionData[]} plans
 */
function loadCardPlanFormacion(containerId, plans) {
    var container = document.getElementById(containerId);
    if (!container) return;
    var list = Array.isArray(plans) ? plans : [plans];
    container.innerHTML = list.map(function (p) { return renderCardPlanFormacion(p); }).join('');
}

if (typeof window !== 'undefined') {
    window.renderCardPlanFormacion = renderCardPlanFormacion;
    window.loadCardPlanFormacion = loadCardPlanFormacion;
    window.formatCardPlanFormacionTipoLabel = formatCardPlanFormacionTipoLabel;
}
