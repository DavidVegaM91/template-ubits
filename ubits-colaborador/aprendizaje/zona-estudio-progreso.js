/**
 * Zona de estudio — tab Progreso (vista líder: María + equipo).
 *
 * Escenarios demo vía `?demo=`:
 * - (sin param) / normal — equipo real (~7) y planes de BD
 * - equipo-grande — 25 personas; ProfileList maxVisible 10 (+N dropdown)
 * - sin-planes — mismo equipo grande; nadie tiene planes vigentes (empty state en hero)
 */
(function () {
    'use strict';

    var LEADER_ID = 'E006';
    var LEADER_AREA = 'Logística';
    var MESES_CORTO = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    var MAIL_TEMPLATE_PATH = 'mails/mail-recordatorio-plan-formacion.html';
    var MAIL_PREVIEW_DELAY_MS = 3000;
    var mailPreviewTimer = null;

    var PROGRESO_PROFILE_LIST_MAX_VISIBLE = 10;
    var PROGRESO_EQUIPO_GRANDE_SIZE = 25;
    var PROGRESO_HOME_BUSCAR = 'home-learn.html#buscar';
    var PROGRESO_EMPTY_TITLE = 'Sin planes asignados';
    var PROGRESO_EMPTY_DESC =
        'Contacta al responsable de recursos humanos de tu empresa para solicitar la asignación de un plan de formación. Mientras tanto, explora nuestro catálogo.';
    var PROGRESO_EMPTY_BTN = 'Explorar catálogo';

    function parseProgresoDemoScenario() {
        try {
            var params = new URLSearchParams(window.location.search || '');
            var v = params.get('demo');
            if (v === 'equipo-grande' || v === 'sin-planes') return v;
        } catch (e) { /* noop */ }
        return 'normal';
    }

    var progresoDemoScenario = parseProgresoDemoScenario();
    var progresoForceEmptyPlanes = progresoDemoScenario === 'sin-planes';

    var progresoState = {
        selectedColaboradorId: LEADER_ID,
        rankingEquipoScope: 'equipo',
        profileReady: false,
        overflowSelectReady: false,
        recordatorioReady: false,
        recordatorioEventsBound: false,
        rankingScopeReady: false,
        areasRendered: false
    };

    function getPf() {
        return window.BD_PLANES_FORMACION;
    }

    function parseYmd(str) {
        if (!str) return null;
        var p = String(str).split('-').map(Number);
        if (p.length < 3) return null;
        return new Date(p[0], p[1] - 1, p[2]);
    }

    function formatCierrePlan(fechaFinIso) {
        var d = parseYmd(fechaFinIso);
        if (!d) return 'Cierre: —';
        return 'Cierre: ' + MESES_CORTO[d.getMonth()] + ' ' + d.getDate();
    }

    function formatIndicatorNumber(n) {
        var num = Number(n);
        if (isNaN(num)) return '0';
        if (num >= 1000000) return (Math.round((num / 1000000) * 10) / 10).toLocaleString('es-CO') + ' M';
        if (num >= 10000) return (Math.round((num / 10000) * 10) / 10).toLocaleString('es-CO') + ' K';
        return num.toLocaleString('es-CO');
    }

    function getRecordatorioMailUrl() {
        try {
            return new URL(MAIL_TEMPLATE_PATH, window.location.href).href;
        } catch (e) {
            return MAIL_TEMPLATE_PATH;
        }
    }

    function openRecordatorioMailPreview() {
        if (mailPreviewTimer) {
            clearTimeout(mailPreviewTimer);
            mailPreviewTimer = null;
        }
        mailPreviewTimer = setTimeout(function () {
            window.open(getRecordatorioMailUrl(), '_blank', 'noopener,noreferrer');
            mailPreviewTimer = null;
        }, MAIL_PREVIEW_DELAY_MS);
    }

    function confirmRecordatorioEquipo() {
        openRecordatorioMailPreview();
        if (typeof showToast === 'function') {
            showToast('success', 'Recordatorios enviados', { containerId: 'ubits-toast-container' });
        }
    }

    function openRecordatorioConfirmModal() {
        if (typeof openModal !== 'function' || typeof closeModal !== 'function') return;
        var overlayId = 'zona-estudio-recordatorio-modal';
        var cancelId = 'zona-estudio-recordatorio-cancel';
        var confirmId = 'zona-estudio-recordatorio-confirm';
        var bodyHtml = '<p class="ubits-body-md-regular">Se enviará un recordatorio por correo a todas las personas de tu equipo que no hayan completado sus planes de formación, informándoles su avance hasta el momento y la fecha de vencimiento de cada plan.</p>';
        var footerHtml =
            '<button type="button" class="ubits-button ubits-button--secondary ubits-button--md" id="' + cancelId + '"><span>Cancelar</span></button>' +
            '<button type="button" class="ubits-button ubits-button--primary ubits-button--md" id="' + confirmId + '"><span>Confirmar</span></button>';
        openModal({
            overlayId: overlayId,
            title: 'Enviar recordatorio',
            bodyHtml: bodyHtml,
            footerHtml: footerHtml,
            size: 'sm'
        });
        setTimeout(function () {
            var cancelBtn = document.getElementById(cancelId);
            var confirmBtn = document.getElementById(confirmId);
            function closeRecordatorioModal() {
                closeModal(overlayId);
            }
            if (cancelBtn) cancelBtn.addEventListener('click', closeRecordatorioModal);
            if (confirmBtn) {
                confirmBtn.addEventListener('click', function () {
                    closeRecordatorioModal();
                    confirmRecordatorioEquipo();
                });
            }
        }, 0);
    }

    function initRecordatorio() {
        if (progresoState.recordatorioEventsBound) return;
        var wrap = document.getElementById('zona-estudio-progreso-recordatorio');
        if (!wrap) return;
        progresoState.recordatorioEventsBound = true;
        wrap.addEventListener('click', function (e) {
            var btn = e.target.closest('#zona-estudio-progreso-btn-recordatorio');
            if (!btn) return;
            openRecordatorioConfirmModal();
        });
    }
    function getColaboradorById(id) {
        var master = window.BD_MASTER_COLABORADORES;
        var list = (master && master.colaboradores) ? master.colaboradores : [];
        for (var i = 0; i < list.length; i++) {
            if (String(list[i].id) === String(id)) return list[i];
        }
        return null;
    }

    function getEquipoPersonas() {
        var out = [];
        var leader = getColaboradorById(LEADER_ID);
        if (leader) {
            out.push({
                id: String(leader.id),
                nombre: (leader.nombre || '').trim(),
                avatar: leader.avatar || null,
                area: (leader.area || LEADER_AREA).trim(),
                esLider: true
            });
        }
        var subs = typeof window.getMiEquipoSubordinadosDirectos === 'function'
            ? window.getMiEquipoSubordinadosDirectos()
            : [];
        subs.forEach(function (c) {
            out.push({
                id: String(c.id),
                nombre: (c.nombre || '').trim(),
                avatar: c.avatar || null,
                area: (c.area || '').trim(),
                esLider: false
            });
        });

        if (progresoDemoScenario === 'normal') return out;

        var seen = {};
        out.forEach(function (p) { seen[p.id] = true; });
        var master = window.BD_MASTER_COLABORADORES;
        var list = (master && master.colaboradores) ? master.colaboradores : [];
        for (var i = 0; i < list.length && out.length < PROGRESO_EQUIPO_GRANDE_SIZE; i++) {
            var c = list[i];
            if (!c || c.esGerenteGeneral) continue;
            var id = String(c.id);
            if (seen[id]) continue;
            seen[id] = true;
            out.push({
                id: id,
                nombre: (c.nombre || '').trim() || ('Colaborador ' + id),
                avatar: c.avatar || null,
                area: (c.area || LEADER_AREA).trim(),
                esLider: id === LEADER_ID
            });
        }
        return out.slice(0, PROGRESO_EQUIPO_GRANDE_SIZE);
    }

    function progresoProfileListMaxVisible(equipoLength) {
        if (progresoDemoScenario === 'equipo-grande' || progresoDemoScenario === 'sin-planes') {
            return Math.min(PROGRESO_PROFILE_LIST_MAX_VISIBLE, equipoLength);
        }
        return equipoLength;
    }

    function getPlanesVigentesParaColaborador(colaboradorId) {
        if (progresoForceEmptyPlanes) return [];
        var pf = getPf();
        if (!pf || typeof pf.getPlanesParaColaborador !== 'function') return [];
        return pf.getPlanesParaColaborador(colaboradorId, { estados: ['Vigente'] });
    }

    function getProgresoGeneralColaborador(colaboradorId) {
        var pf = getPf();
        var planes = getPlanesVigentesParaColaborador(colaboradorId);
        if (!planes.length) return { pct: 0, count: 0 };
        var sum = 0;
        planes.forEach(function (p) {
            sum += pf.getProgresoColaboradorEnPlan(p, colaboradorId);
        });
        return { pct: Math.round(sum / planes.length), count: planes.length };
    }

    function formatHorasMinutosAbreviado(totalMin) {
        var min = Math.max(0, Math.round(Number(totalMin) || 0));
        var h = Math.floor(min / 60);
        var m = min % 60;
        return h + ' hrs. ' + m + ' min.';
    }

    function formatMinutosEstudioVsMetaAbreviado(doneMin, totalMin) {
        return formatHorasMinutosAbreviado(doneMin) + ' de ' + formatHorasMinutosAbreviado(totalMin);
    }

    function parseDurationToMinutes(str) {
        if (!str) return 60;
        var s = String(str).trim().toLowerCase();
        var num = parseFloat(s.replace(/[^\d.]/g, '')) || 60;
        if (s.indexOf('h') >= 0) return Math.round(num * 60);
        return Math.round(num);
    }

    function getCompetenciaMinutosAbrevForPlan(plan, colaboradorId) {
        var pf = getPf();
        var metaHoras = (plan && plan.horasEstudioMeta != null)
            ? plan.horasEstudioMeta
            : ((pf && pf.HORAS_META_COMPETENCIAS) || 2);
        var totalMin = Math.round(Number(metaHoras) * 60);
        var cid = String(colaboradorId || '');
        var consumo = (plan && plan.consumoPorUsuario && plan.consumoPorUsuario[cid]) || { horas: 0 };
        var doneMin = Math.round((Number(consumo.horas) || 0) * 60);
        return formatMinutosEstudioVsMetaAbreviado(doneMin, totalMin);
    }

    function getMinutosEstudioColaboradorEnPlan(plan, colaboradorId) {
        var pf = getPf();
        var hydrated = pf && pf.hydratePlan ? pf.hydratePlan(plan) : plan;
        if (!hydrated) return 0;
        var cid = String(colaboradorId || '');
        if (hydrated.tipo === 'competencias') {
            var consumo = (hydrated.consumoPorUsuario || {})[cid] || { horas: 0 };
            return Math.round((Number(consumo.horas) || 0) * 60);
        }
        if (hydrated.tipo === 'contenidos') {
            var items = (hydrated.contenidoPorUsuario || {})[cid] || [];
            var total = 0;
            items.forEach(function (it) {
                var dur = parseDurationToMinutes(it.duration);
                var pct = Number(it.progress) || 0;
                total += Math.round(dur * pct / 100);
            });
            return total;
        }
        return 0;
    }

    function getMinutosEstudioTotalColaborador(colaboradorId) {
        var planes = getPlanesVigentesParaColaborador(colaboradorId);
        var total = 0;
        planes.forEach(function (rawPlan) {
            total += getMinutosEstudioColaboradorEnPlan(rawPlan, colaboradorId);
        });
        return total;
    }

    function getMinutosEstudioEnPlan(plan) {
        var pf = getPf();
        var hydrated = pf && pf.hydratePlan ? pf.hydratePlan(plan) : plan;
        if (!hydrated) return 0;
        var total = 0;
        (hydrated.asignaciones || []).forEach(function (a) {
            total += getMinutosEstudioColaboradorEnPlan(hydrated, a.colaboradorId);
        });
        return total;
    }

    function getEmpresaPersonas() {
        var master = window.BD_MASTER_COLABORADORES;
        var list = (master && master.colaboradores) ? master.colaboradores : [];
        return list.map(function (c) {
            return {
                id: String(c.id),
                nombre: (c.nombre || '').trim(),
                esLider: String(c.id) === LEADER_ID
            };
        });
    }

    function getKpisColaborador(colaboradorId) {
        var pf = getPf();
        var planes = getPlanesVigentesParaColaborador(colaboradorId);
        var kpis = { vigentes: planes.length, completados: 0, enCurso: 0, enRiesgo: 0 };
        planes.forEach(function (p) {
            var pct = pf.getProgresoColaboradorEnPlan(p, colaboradorId);
            if (pct >= 100) {
                kpis.completados += 1;
            } else if (pct <= 0) {
                kpis.enRiesgo += 1;
            } else {
                kpis.enCurso += 1;
            }
        });
        return kpis;
    }

    function planToCarouselSlide(plan, colaboradorId) {
        var pf = getPf();
        var pct = pf.getProgresoColaboradorEnPlan(plan, colaboradorId);
        var progressLabel = '';
        if (plan.tipo === 'competencias') {
            progressLabel = getCompetenciaMinutosAbrevForPlan(plan, colaboradorId);
        } else {
            var items = ((plan.contenidoPorUsuario || {})[String(colaboradorId)]) || [];
            var done = 0;
            items.forEach(function (it) {
                if (Number(it.progress) >= 100) done += 1;
            });
            progressLabel = done + '/' + items.length + ' contenidos';
        }
        return {
            planId: plan.id,
            planTipo: plan.tipo,
            cierre: formatCierrePlan(plan.fechaFinIso),
            title: plan.nombre || '',
            progress: pct,
            progressLabel: progressLabel,
            empty: pct <= 0,
            status: pct >= 100 ? 'completed' : (pct > 0 ? 'progress' : 'default')
        };
    }

    function renderProfileList() {
        var wrap = document.getElementById('zona-estudio-progreso-profile');
        if (!wrap) return;
        var personas = getEquipoPersonas();
        if (!personas.length) {
            wrap.innerHTML = '';
            return;
        }
        var listForRender = personas.map(function (p) {
            return { name: p.nombre, avatar: p.avatar, id: p.id };
        });
        var html = '';
        if (typeof window.renderProfileList === 'function') {
            html = window.renderProfileList(listForRender, {
                size: 'sm',
                maxVisible: progresoProfileListMaxVisible(listForRender.length),
                selectable: true
            });
        }
        wrap.innerHTML = html;
        var profileList = wrap.querySelector('.ubits-profile-list');
        if (!profileList) return;
        var avatars = profileList.querySelectorAll('.ubits-profile-list__avatar');
        avatars.forEach(function (el, i) {
            if (!personas[i]) return;
            el.setAttribute('data-colaborador-id', personas[i].id);
            el.classList.toggle('ubits-profile-list__avatar--selected',
                personas[i].id === progresoState.selectedColaboradorId);
        });
        if (!progresoState.profileReady) {
            progresoState.profileReady = true;
            wrap.addEventListener('click', function (e) {
                var avatar = e.target.closest('.ubits-profile-list__avatar');
                if (!avatar || !wrap.contains(avatar)) return;
                var cid = avatar.getAttribute('data-colaborador-id');
                if (!cid || cid === progresoState.selectedColaboradorId) return;
                progresoState.selectedColaboradorId = cid;
                renderNivel1();
                renderRankingEquipo();
                if (typeof initTooltip === 'function') {
                    initTooltip('#zona-estudio-panel-progreso [data-tooltip]');
                }
            });
        }
        if (!progresoState.overflowSelectReady) {
            progresoState.overflowSelectReady = true;
            document.addEventListener('click', function (e) {
                var item = e.target.closest('[data-profile-list-overflow-item-key]');
                if (!item) return;
                var panel = document.getElementById('zona-estudio-panel-progreso');
                if (!panel || panel.hasAttribute('hidden')) return;
                var cid = item.getAttribute('data-profile-list-overflow-item-key');
                if (!cid || cid === progresoState.selectedColaboradorId) return;
                progresoState.selectedColaboradorId = cid;
                if (typeof closeProfileListOverflowPopover === 'function') {
                    closeProfileListOverflowPopover();
                }
                renderNivel1();
                renderRankingEquipo();
                if (typeof initTooltip === 'function') {
                    initTooltip('#zona-estudio-panel-progreso [data-tooltip]');
                }
            });
        }
    }

    function renderHeroIdentity() {
        var persona = getColaboradorById(progresoState.selectedColaboradorId);
        var nameEl = document.getElementById('zona-estudio-progreso-hero-name');
        if (nameEl) {
            nameEl.textContent = persona ? persona.nombre : 'Colaborador';
        }
    }

    function renderProgresoGeneral() {
        var meta = getProgresoGeneralColaborador(progresoState.selectedColaboradorId);
        var pctEl = document.getElementById('zona-estudio-progreso-general-pct');
        var barEl = document.getElementById('zona-estudio-progreso-general-bar');
        var labelEl = document.getElementById('zona-estudio-progreso-general-label');
        if (labelEl) {
            labelEl.textContent = 'Cumplimiento promedio';
        }
        if (pctEl) pctEl.textContent = meta.pct + ' %';
        if (barEl && typeof progressBarHtml === 'function') {
            barEl.innerHTML = progressBarHtml({
                value: meta.pct,
                size: 'lg',
                rounded: true,
                track: 'subtle',
                ariaLabel: 'Cumplimiento promedio en planes vigentes'
            });
        }
    }

    function kpiCardHtml(number, label, iconClass, iconBg, iconBorder, iconColor) {
        return '<div class="zona-estudio-progreso-kpi-card">' +
            '<div class="zona-estudio-progreso-kpi-card__icon" style="background:' + iconBg + ';border-color:' + iconBorder + ';">' +
                '<i class="' + iconClass + '" style="color:' + iconColor + ';" aria-hidden="true"></i>' +
            '</div>' +
            '<div class="zona-estudio-progreso-kpi-card__content">' +
                '<div class="zona-estudio-progreso-kpi-card__number">' + formatIndicatorNumber(number) + '</div>' +
                '<div class="zona-estudio-progreso-kpi-card__label">' + label + '</div>' +
            '</div>' +
        '</div>';
    }

    function renderKpis() {
        var wrap = document.getElementById('zona-estudio-progreso-kpis');
        if (!wrap) return;
        var kpis = getKpisColaborador(progresoState.selectedColaboradorId);
        wrap.innerHTML =
            kpiCardHtml(
                kpis.vigentes,
                'Planes vigentes',
                'far fa-book-open',
                'var(--ubits-bg-2)',
                'var(--ubits-border-1)',
                'var(--ubits-fg-1-medium)'
            ) +
            kpiCardHtml(
                kpis.completados,
                'Completados',
                'far fa-check-circle',
                'var(--ubits-feedback-bg-success-subtle)',
                'var(--ubits-feedback-border-success)',
                'var(--ubits-feedback-fg-success-subtle)'
            ) +
            kpiCardHtml(
                kpis.enCurso,
                'En curso',
                'far fa-spinner',
                'var(--ubits-feedback-bg-info-subtle)',
                'var(--ubits-feedback-border-info)',
                'var(--ubits-feedback-fg-info-subtle)'
            ) +
            kpiCardHtml(
                kpis.enRiesgo,
                'Sin iniciar',
                'far fa-triangle-exclamation',
                'var(--ubits-feedback-bg-error-subtle)',
                'var(--ubits-feedback-border-error)',
                'var(--ubits-feedback-fg-error-subtle)'
            );
    }

    function onPlanCardClick(slide) {
        if (!slide || !slide.planId) return;
        var isLeader = progresoState.selectedColaboradorId === LEADER_ID;
        if (isLeader) {
            if (typeof window.zonaEstudioNavigateToPlan === 'function') {
                window.zonaEstudioNavigateToPlan(slide.planId, slide.planTipo);
            }
            return;
        }
        var pf = getPf();
        var plan = pf && typeof pf.getPlanById === 'function' ? pf.getPlanById(slide.planId) : null;
        if (!plan) return;
        var persona = getColaboradorById(progresoState.selectedColaboradorId);
        var userName = persona ? persona.nombre : 'Colaborador';
        if (slide.planTipo === 'competencias') {
            openProgresoCompetenciasDrawer(plan, progresoState.selectedColaboradorId, userName);
        } else {
            openProgresoContenidosDrawer(plan, progresoState.selectedColaboradorId, userName);
        }
    }

    function renderPlanesCarousel() {
        var mount = document.getElementById('zona-estudio-progreso-planes-carousel');
        if (!mount || typeof createCarouselContents !== 'function') return;
        var planes = getPlanesVigentesParaColaborador(progresoState.selectedColaboradorId);
        var slides = planes.map(function (p) {
            return planToCarouselSlide(p, progresoState.selectedColaboradorId);
        });
        mount.innerHTML = '';
        if (!slides.length) return;
        createCarouselContents({
            containerId: 'zona-estudio-progreso-planes-carousel',
            type: 'study-zone',
            sectionTitle: 'Planes activos',
            slides: slides,
            onPlanClick: onPlanCardClick
        });
    }

    function goExplorarCatalogo() {
        window.location.href = PROGRESO_HOME_BUSCAR;
    }

    function renderHeroMetricsOrEmpty() {
        var metrics = document.getElementById('zona-estudio-progreso-hero-metrics');
        var emptyHost = document.getElementById('zona-estudio-progreso-empty-planes');
        var planes = getPlanesVigentesParaColaborador(progresoState.selectedColaboradorId);
        var showEmpty = planes.length === 0;

        if (showEmpty) {
            if (metrics) metrics.style.display = 'none';
            if (emptyHost) {
                emptyHost.style.display = 'flex';
                if (typeof loadEmptyState === 'function') {
                    loadEmptyState('zona-estudio-progreso-empty-planes', {
                        icon: 'fa-book-open',
                        iconSize: 'lg',
                        title: PROGRESO_EMPTY_TITLE,
                        description: PROGRESO_EMPTY_DESC,
                        buttons: {
                            primary: {
                                text: PROGRESO_EMPTY_BTN,
                                icon: 'fa-search',
                                onClick: goExplorarCatalogo
                            }
                        }
                    });
                    setTimeout(function () {
                        var btn = emptyHost.querySelector('.ubits-button--primary');
                        if (btn) {
                            btn.onclick = function (e) {
                                e.preventDefault();
                                goExplorarCatalogo();
                            };
                        }
                    }, 50);
                }
            }
            return;
        }

        if (metrics) metrics.style.display = '';
        if (emptyHost) {
            emptyHost.style.display = 'none';
            emptyHost.innerHTML = '';
        }
        renderProgresoGeneral();
        renderKpis();
        renderPlanesCarousel();
    }

    function getRankingAreas() {
        if (progresoForceEmptyPlanes) return [];
        var pf = getPf();
        if (!pf || typeof pf.getPlanesVisiblesCreator !== 'function') return [];
        var planes = pf.getPlanesVisiblesCreator().filter(function (p) {
            return p.estado === 'Vigente' && p.tipo === 'contenidos';
        });
        var byArea = {};
        planes.forEach(function (rawPlan) {
            var plan = pf.hydratePlan(rawPlan);
            var area = (plan.area || '').trim();
            if (!area) return;
            if (!byArea[area]) byArea[area] = 0;
            byArea[area] += getMinutosEstudioEnPlan(plan);
        });
        return Object.keys(byArea).map(function (area) {
            return {
                area: area,
                minutos: byArea[area],
                isMine: area === LEADER_AREA
            };
        }).sort(function (a, b) { return b.minutos - a.minutos; });
    }

    function getRankingEquipo() {
        return getEquipoPersonas().map(function (person) {
            return {
                id: person.id,
                nombre: person.nombre,
                minutos: getMinutosEstudioTotalColaborador(person.id),
                esLider: person.esLider
            };
        }).sort(function (a, b) { return b.minutos - a.minutos; });
    }

    function getRankingEmpresa() {
        return getEmpresaPersonas().map(function (person) {
            return {
                id: person.id,
                nombre: person.nombre,
                minutos: getMinutosEstudioTotalColaborador(person.id),
                esLider: person.esLider
            };
        }).sort(function (a, b) { return b.minutos - a.minutos; });
    }

    function getMedalHtml(rank) {
        if (rank === 1) {
            return '<span class="zona-estudio-progreso-ranking-row__medal zona-estudio-progreso-ranking-row__medal--gold" aria-hidden="true"><i class="far fa-trophy"></i></span>';
        }
        if (rank === 2) {
            return '<span class="zona-estudio-progreso-ranking-row__medal zona-estudio-progreso-ranking-row__medal--silver" aria-hidden="true"><i class="far fa-medal"></i></span>';
        }
        if (rank === 3) {
            return '<span class="zona-estudio-progreso-ranking-row__medal zona-estudio-progreso-ranking-row__medal--bronze" aria-hidden="true"><i class="far fa-award"></i></span>';
        }
        return '<span class="zona-estudio-progreso-ranking-row__rank ubits-body-sm-bold">' + rank + '</span>';
    }

    function rankingAreaTimeRowHtml(rank, area, minutos, isMine) {
        var safeArea = escapeRankingHtml(area);
        return '<div class="zona-estudio-progreso-ranking-row zona-estudio-progreso-ranking-row--time zona-estudio-progreso-ranking-row--area' +
            (isMine ? ' zona-estudio-progreso-ranking-row--highlight' : '') + '">' +
            getMedalHtml(rank) +
            '<span class="zona-estudio-progreso-ranking-row__label ubits-body-sm-regular">' + safeArea + '</span>' +
            '<span class="zona-estudio-progreso-ranking-row__time ubits-body-sm-bold">' + formatHorasMinutosAbreviado(minutos) + '</span>' +
        '</div>';
    }

    function rankingTeamTimeRowHtml(rank, label, minutos, highlight, esLider, colaboradorId) {
        return '<div class="zona-estudio-progreso-ranking-row zona-estudio-progreso-ranking-row--time' +
            (highlight ? ' zona-estudio-progreso-ranking-row--highlight' : '') + '"' +
            ' data-rank="' + rank + '" data-colaborador-id="' + colaboradorId + '"' +
            (esLider ? ' data-es-lider="1"' : '') + '>' +
            getMedalHtml(rank) +
            rankingPersonLabelHtml(label) +
            '<span class="zona-estudio-progreso-ranking-row__time ubits-body-sm-bold">' + formatHorasMinutosAbreviado(minutos) + '</span>' +
        '</div>';
    }

    function escapeRankingHtml(str) {
        return String(str || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function rankingPersonLabelHtml(label) {
        var safe = escapeRankingHtml(label);
        return '<span class="zona-estudio-progreso-ranking-row__label ubits-body-sm-regular" title="' + safe + '">' + safe + '</span>';
    }

    function isSelectedColaborador(colaboradorId) {
        return String(colaboradorId) === String(progresoState.selectedColaboradorId);
    }

    function formatRankingPersonName(nombre, colaboradorId) {
        return (nombre || '').trim();
    }

    function applyRankingListScrollLimit(listEl) {
        if (!listEl) return;
        listEl.classList.add('zona-estudio-progreso-ranking-list--scroll-limit');
    }

    function clearRankingListScrollLimit(listEl) {
        if (!listEl) return;
        listEl.classList.remove('zona-estudio-progreso-ranking-list--scroll-limit');
    }

    function rankingPodiumDividerHtml() {
        return '<div class="zona-estudio-progreso-ranking-podium-divider" aria-hidden="true"></div>';
    }

    function splitRankingRowsHtml(rows, buildRowHtml) {
        var podium = '';
        var scroll = '';
        rows.forEach(function (row, idx) {
            var rank = idx + 1;
            var rowHtml = buildRowHtml(row, rank);
            if (rank <= 3) podium += rowHtml;
            else scroll += rowHtml;
        });
        if (rows.length > 3) podium += rankingPodiumDividerHtml();
        return { podium: podium, scroll: scroll };
    }

    function renderRankingSplitLists(podiumEl, scrollEl, rows, buildRowHtml, emptyMessage) {
        if (!scrollEl) return;
        if (!rows.length) {
            if (podiumEl) podiumEl.innerHTML = '';
            scrollEl.innerHTML = '<p class="ubits-body-sm-regular zona-estudio-progreso-empty">' + emptyMessage + '</p>';
            clearRankingListScrollLimit(scrollEl);
            return;
        }
        var parts = splitRankingRowsHtml(rows, buildRowHtml);
        if (podiumEl) podiumEl.innerHTML = parts.podium;
        scrollEl.innerHTML = parts.scroll;
        if (rows.length > 3) applyRankingListScrollLimit(scrollEl);
        else clearRankingListScrollLimit(scrollEl);
    }

    function scrollRankingEquipoToSelected() {
        var scrollList = document.getElementById('zona-estudio-progreso-ranking-equipo');
        var podiumList = document.getElementById('zona-estudio-progreso-ranking-equipo-podium');
        if (!scrollList) return;
        var selectedRow = (podiumList && podiumList.querySelector('[data-colaborador-id="' + progresoState.selectedColaboradorId + '"]')) ||
            scrollList.querySelector('[data-colaborador-id="' + progresoState.selectedColaboradorId + '"]');
        if (!selectedRow) return;
        var rank = parseInt(selectedRow.getAttribute('data-rank'), 10);
        if (isNaN(rank) || rank <= 3) {
            scrollList.scrollTop = 0;
            return;
        }
        var sampleRow = scrollList.querySelector('.zona-estudio-progreso-ranking-row');
        if (!sampleRow) return;
        var rowSlot = sampleRow.getBoundingClientRect().height;
        scrollList.scrollTop = Math.max(0, (rank - 4) * rowSlot);
    }

    function updateRankingEquipoDesc() {
        var descEl = document.getElementById('zona-estudio-progreso-equipo-desc');
        if (!descEl) return;
        descEl.textContent = 'De mayor a menor tiempo de estudio.';
    }

    function renderRankingAreas() {
        var podiumEl = document.getElementById('zona-estudio-progreso-ranking-areas-podium');
        var scrollEl = document.getElementById('zona-estudio-progreso-ranking-areas');
        if (!scrollEl || progresoState.areasRendered) return;
        var areas = getRankingAreas();
        renderRankingSplitLists(podiumEl, scrollEl, areas, function (row, rank) {
            return rankingAreaTimeRowHtml(rank, row.area, row.minutos, row.isMine);
        }, 'Sin datos de áreas.');
        progresoState.areasRendered = true;
    }

    function renderRankingEquipo() {
        var podiumEl = document.getElementById('zona-estudio-progreso-ranking-equipo-podium');
        var scrollEl = document.getElementById('zona-estudio-progreso-ranking-equipo');
        if (!scrollEl) return;
        updateRankingEquipoDesc();
        var rows = progresoState.rankingEquipoScope === 'empresa' ? getRankingEmpresa() : getRankingEquipo();
        renderRankingSplitLists(podiumEl, scrollEl, rows, function (row, rank) {
            return rankingTeamTimeRowHtml(
                rank,
                formatRankingPersonName(row.nombre, row.id),
                row.minutos,
                isSelectedColaborador(row.id),
                String(row.id) === LEADER_ID,
                row.id
            );
        }, 'Sin datos.');
        window.requestAnimationFrame(function () {
            window.requestAnimationFrame(function () {
                scrollRankingEquipoToSelected();
            });
        });
    }

    function initRankingEquipoScope() {
        if (progresoState.rankingScopeReady) return;
        var group = document.getElementById('zona-estudio-progreso-equipo-scope-group');
        if (!group || typeof initButtonGroup !== 'function') return;
        progresoState.rankingScopeReady = true;
        initButtonGroup(group, {
            variant: 'selectable',
            value: progresoState.rankingEquipoScope,
            onChange: function (value) {
                progresoState.rankingEquipoScope = value;
                renderRankingEquipo();
            }
        });
    }

    function renderRankings() {
        renderRankingAreas();
        initRankingEquipoScope();
        renderRankingEquipo();
    }

    function renderRecordatorio() {
        var wrap = document.getElementById('zona-estudio-progreso-recordatorio');
        if (!wrap || progresoState.recordatorioReady) return;
        progresoState.recordatorioReady = true;
        wrap.innerHTML =
            '<div class="zona-estudio-progreso-recordatorio">' +
                '<div class="zona-estudio-progreso-recordatorio__icon" aria-hidden="true">' +
                    '<i class="far fa-envelope"></i>' +
                '</div>' +
                '<div class="zona-estudio-progreso-recordatorio__copy">' +
                    '<p class="ubits-body-md-bold zona-estudio-progreso-recordatorio__title" id="zona-estudio-progreso-recordatorio-title">Recordatorio de estudio</p>' +
                    '<p class="ubits-body-sm-regular zona-estudio-progreso-recordatorio__desc">Enviar recordatorio a quienes no hayan completado sus planes de formación asignados.</p>' +
                '</div>' +
                '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm" id="zona-estudio-progreso-btn-recordatorio">' +
                    '<i class="far fa-paper-plane" aria-hidden="true"></i><span>Enviar recordatorio</span>' +
                '</button>' +
            '</div>';
        initRecordatorio();
    }

    function formatProgresoEmpleadoDrawerTitle(userName, plan) {
        var pf = getPf();
        var hydrated = pf && typeof pf.hydratePlan === 'function' ? pf.hydratePlan(plan) : plan;
        var planNombre = (hydrated && hydrated.nombre) ? String(hydrated.nombre).trim() : '';
        return (userName || 'Colaborador') + ' – ' + planNombre;
    }

    function openProgresoContenidosDrawer(plan, colaboradorId, userName) {
        if (typeof openDrawer !== 'function') return;
        var pf = getPf();
        var hydrated = pf && typeof pf.hydratePlan === 'function' ? pf.hydratePlan(plan) : plan;
        var detalleMap = (pf && typeof pf.getDetalleContenidoPorUsuario === 'function')
            ? pf.getDetalleContenidoPorUsuario(hydrated)
            : (hydrated.contenidoPorUsuario || {});
        var list = detalleMap[String(colaboradorId)] || [];
        var bodyHtml = '<div class="detalle-plan-panel-contenidos"><div class="detalle-plan-drawer-cards-bg">' +
            '<div id="zona-estudio-progreso-compact-cards" class="detalle-plan-drawer-cards-grid"></div></div></div>';
        var footerHtml = '<button type="button" class="ubits-button ubits-button--primary ubits-button--md" id="zona-estudio-progreso-contenidos-cerrar"><span>Cerrar</span></button>';
        openDrawer({
            overlayId: 'drawer-zona-estudio-progreso-contenidos',
            title: formatProgresoEmpleadoDrawerTitle(userName, plan),
            bodyHtml: bodyHtml,
            footerHtml: footerHtml,
            size: 'sm'
        });
        var overlay = document.getElementById('drawer-zona-estudio-progreso-contenidos');
        if (overlay) overlay.classList.add('drawer-progreso-empleado-host');
        var cerrar = overlay && overlay.querySelector('#zona-estudio-progreso-contenidos-cerrar');
        if (cerrar) {
            cerrar.addEventListener('click', function () {
                if (typeof closeDrawer === 'function') closeDrawer('drawer-zona-estudio-progreso-contenidos');
            });
        }
        if (typeof loadCardContentCompact === 'function') {
            var enrich = (window.CATALOGO_PROVEEDORES &&
                typeof window.CATALOGO_PROVEEDORES.enrichPlanContenidoItemForCard === 'function')
                ? window.CATALOGO_PROVEEDORES.enrichPlanContenidoItemForCard
                : null;
            var cardsData = list.map(function (c) {
                var item = enrich ? enrich(c) : c;
                var row = {
                    type: item.type || 'Curso',
                    title: item.title || '',
                    duration: item.duration || '',
                    progress: item.progress != null ? item.progress : 0,
                    status: item.status || 'default',
                    provider: item.provider || 'UBITS',
                    providerLogo: item.providerLogo || '../../images/Favicons/UBITS.jpg',
                    level: item.level || 'Intermedio',
                    competency: item.competency || '',
                    language: item.language || 'Español',
                    image: item.image || '../../images/Profile-image.jpg'
                };
                if (Array.isArray(item.providers) && item.providers.length > 1) {
                    row.providers = item.providers;
                }
                return row;
            });
            loadCardContentCompact('zona-estudio-progreso-compact-cards', cardsData);
        }
    }

    function openProgresoCompetenciasDrawer(plan, colaboradorId, userName) {
        var Shared = window.MiEquipoPlanCompetenciasShared;
        if (!Shared || typeof Shared.openPanelCompetenciasReadOnly !== 'function') return;
        var hydrated = getPf().hydratePlan(plan);
        var comps = ((hydrated.competenciaPorUsuario || {})[String(colaboradorId)]) || [];
        Shared.openPanelCompetenciasReadOnly({
            overlayId: 'drawer-zona-estudio-progreso-competencias',
            drawerTitle: formatProgresoEmpleadoDrawerTitle(userName, plan),
            userName: userName,
            competencias: comps,
            plan: hydrated,
            colaboradorId: colaboradorId,
            sinProgreso: false
        });
    }

    function renderNivel1() {
        renderProfileList();
        renderHeroIdentity();
        renderHeroMetricsOrEmpty();
    }

    function renderNivel2y3() {
        renderRecordatorio();
        renderRankings();
    }

    function renderZonaEstudioProgresoTab() {
        renderNivel1();
        renderNivel2y3();
        if (typeof initTooltip === 'function') {
            initTooltip('#zona-estudio-panel-progreso [data-tooltip]');
        }
    }

    window.renderZonaEstudioProgresoTab = renderZonaEstudioProgresoTab;
})();
