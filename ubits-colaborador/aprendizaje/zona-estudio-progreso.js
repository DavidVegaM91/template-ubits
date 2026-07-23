/**
 * Progreso — vista líder (antes tab de Zona de estudio).
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
        'ene', 'feb', 'mar', 'abr', 'may', 'jun',
        'jul', 'ago', 'sep', 'oct', 'nov', 'dic'
    ];

    var MAIL_TEMPLATE_PATH = 'mails/mail-recordatorio-plan-formacion.html';
    var MAIL_PREVIEW_DELAY_MS = 3000;
    var mailPreviewTimer = null;

    var PROGRESO_PROFILE_LIST_MAX_VISIBLE = 10;
    var PROGRESO_EQUIPO_GRANDE_SIZE = 25;
    var PROGRESO_HOME_BUSCAR = 'home-learn.html#buscar';
    var PROGRESO_EMPTY_TITLE = 'Sin planes vigentes';
    var PROGRESO_EMPTY_DESC =
        'Contacta al responsable de recursos humanos de tu empresa para solicitar la asignación de un plan de formación. Mientras tanto, explora nuestro catálogo.';
    var PROGRESO_EMPTY_BTN = 'Explorar catálogo';
    var PROGRESO_RECORDATORIO_CONFIRM_BODY =
        'Se enviará un recordatorio por correo a todas las personas de tu equipo que no hayan completado sus planes de formación, informándoles su avance hasta el momento y la fecha de vencimiento de cada plan.';
    var PROGRESO_RECORDATORIO_EMPTY_BODY =
        'En este momento no hay personas con planes de formación sin completar.';
    var PROGRESO_RECORDATORIO_EMPTY_BTN = 'Entendido';
    var PROGRESO_RANKING_EQUIPO_EMPTY_TITLE = 'Aún nadie ha estudiado este mes';
    var PROGRESO_RANKING_EQUIPO_EMPTY_DESC =
        'Cuando alguien registre tiempo de estudio, aparecerá en este ranking.';
    var PROGRESO_RANKING_EQUIPO_EMPTY_ICON = 'fa-clock';
    var PROGRESO_RANKING_AREAS_EMPTY_TITLE = 'Aún no hay estudio registrado por área este mes';
    var PROGRESO_RANKING_AREAS_EMPTY_DESC =
        'El ranking se actualizará cuando haya actividad de estudio en las áreas.';
    var PROGRESO_RANKING_AREAS_EMPTY_ICON = 'fa-chart-simple';

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
        if (typeof window.formatDateDDMmmAAAA === 'function') {
            return 'Cierre: ' + window.formatDateDDMmmAAAA(fechaFinIso);
        }
        return 'Cierre: ' + d.getDate() + ' ' + MESES_CORTO[d.getMonth()] + ' ' + d.getFullYear();
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

    function hasPersonasConPlanesFormacionIncompletos() {
        if (progresoForceEmptyPlanes) return false;
        var pf = getPf();
        if (!pf || typeof pf.getProgresoColaboradorEnPlan !== 'function') return false;
        var equipo = getEquipoPersonas();
        for (var i = 0; i < equipo.length; i++) {
            var planes = getPlanesVigentesParaColaborador(equipo[i].id);
            for (var j = 0; j < planes.length; j++) {
                if (pf.getProgresoColaboradorEnPlan(planes[j], equipo[i].id) < 100) {
                    return true;
                }
            }
        }
        return false;
    }

    function openRecordatorioConfirmModal() {
        if (typeof openModal !== 'function' || typeof closeModal !== 'function') return;
        var overlayId = 'zona-estudio-recordatorio-modal';
        var canSend = hasPersonasConPlanesFormacionIncompletos();
        var bodyHtml =
            '<p class="ubits-body-md-regular">' +
            (canSend ? PROGRESO_RECORDATORIO_CONFIRM_BODY : PROGRESO_RECORDATORIO_EMPTY_BODY) +
            '</p>';
        var footerHtml;
        if (canSend) {
            var cancelId = 'zona-estudio-recordatorio-cancel';
            var confirmId = 'zona-estudio-recordatorio-confirm';
            footerHtml =
                '<button type="button" class="ubits-button ubits-button--secondary ubits-button--md" id="' + cancelId + '"><span>Cancelar</span></button>' +
                '<button type="button" class="ubits-button ubits-button--primary ubits-button--md" id="' + confirmId + '"><span>Confirmar</span></button>';
        } else {
            var understoodId = 'zona-estudio-recordatorio-entendido';
            footerHtml =
                '<button type="button" class="ubits-button ubits-button--primary ubits-button--md" id="' + understoodId + '"><span>' + PROGRESO_RECORDATORIO_EMPTY_BTN + '</span></button>';
        }
        openModal({
            overlayId: overlayId,
            title: 'Enviar recordatorio',
            bodyHtml: bodyHtml,
            footerHtml: footerHtml,
            size: 'sm'
        });
        setTimeout(function () {
            function closeRecordatorioModal() {
                closeModal(overlayId);
            }
            if (canSend) {
                var cancelBtn = document.getElementById('zona-estudio-recordatorio-cancel');
                var confirmBtn = document.getElementById('zona-estudio-recordatorio-confirm');
                if (cancelBtn) cancelBtn.addEventListener('click', closeRecordatorioModal);
                if (confirmBtn) {
                    confirmBtn.addEventListener('click', function () {
                        closeRecordatorioModal();
                        confirmRecordatorioEquipo();
                    });
                }
            } else {
                var understoodBtn = document.getElementById('zona-estudio-recordatorio-entendido');
                if (understoodBtn) understoodBtn.addEventListener('click', closeRecordatorioModal);
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
        var nombre = persona && persona.nombre ? String(persona.nombre).trim() : 'Colaborador';
        var cargo = persona && persona.cargo ? String(persona.cargo).trim() : '';
        var mail = persona && persona.username ? String(persona.username).trim() : '';
        var nameEl = document.getElementById('zona-estudio-progreso-hero-name');
        var cargoEl = document.getElementById('zona-estudio-progreso-hero-cargo');
        var mailEl = document.getElementById('zona-estudio-progreso-hero-mail');
        var avatarHost = document.getElementById('zona-estudio-progreso-hero-avatar');
        if (nameEl) nameEl.textContent = nombre;
        if (cargoEl) {
            cargoEl.textContent = cargo;
            cargoEl.hidden = !cargo;
        }
        if (mailEl) {
            mailEl.textContent = mail;
            mailEl.hidden = !mail;
        }
        if (avatarHost) {
            if (typeof renderAvatar === 'function') {
                avatarHost.innerHTML = renderAvatar(
                    { nombre: nombre, avatar: persona ? persona.avatar : null },
                    { size: 'xl', alt: nombre }
                );
            } else {
                avatarHost.innerHTML = '';
            }
        }
    }

    function renderProgresoGeneral() {
        var meta = getProgresoGeneralColaborador(progresoState.selectedColaboradorId);
        var pctEl = document.getElementById('zona-estudio-progreso-general-pct');
        var barEl = document.getElementById('zona-estudio-progreso-general-bar');
        var labelEl = document.getElementById('zona-estudio-progreso-general-label');
        if (labelEl) {
            labelEl.textContent = 'Cumplimiento promedio de los planes vigentes';
        }
        if (pctEl) pctEl.textContent = meta.pct + ' %';
        if (barEl && typeof progressBarHtml === 'function') {
            barEl.innerHTML = progressBarHtml({
                value: meta.pct,
                size: 'lg',
                rounded: true,
                track: 'subtle',
                ariaLabel: 'Cumplimiento promedio de los planes vigentes'
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
            sectionTitle: 'Planes vigentes',
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
        if (progresoForceEmptyPlanes) return [];
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
        if (progresoForceEmptyPlanes) return [];
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

    function renderRankingSplitLists(podiumEl, scrollEl, rows, buildRowHtml, emptyOpts) {
        if (!scrollEl) return;
        if (!rows.length) {
            if (podiumEl) podiumEl.innerHTML = '';
            clearRankingListScrollLimit(scrollEl);
            var hostId = (emptyOpts && emptyOpts.hostId) || (scrollEl.id + '-empty');
            scrollEl.innerHTML = '<div id="' + hostId + '" class="zona-estudio-progreso-ranking-empty"></div>';
            if (typeof loadEmptyState === 'function' && emptyOpts && emptyOpts.title) {
                loadEmptyState(hostId, {
                    icon: emptyOpts.icon || 'fa-inbox',
                    iconSize: 'lg',
                    title: emptyOpts.title,
                    description: emptyOpts.description || ' '
                });
            } else if (emptyOpts && emptyOpts.title) {
                scrollEl.innerHTML = '<p class="ubits-body-sm-regular zona-estudio-progreso-empty">' + emptyOpts.title + '</p>';
            }
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
        var emptyOpts = progresoForceEmptyPlanes
            ? {
                hostId: 'zona-estudio-progreso-ranking-areas-empty',
                icon: PROGRESO_RANKING_AREAS_EMPTY_ICON,
                title: PROGRESO_RANKING_AREAS_EMPTY_TITLE,
                description: PROGRESO_RANKING_AREAS_EMPTY_DESC
            }
            : {
                hostId: 'zona-estudio-progreso-ranking-areas-empty',
                icon: 'fa-inbox',
                title: 'Sin datos de áreas.',
                description: ' '
            };
        renderRankingSplitLists(podiumEl, scrollEl, areas, function (row, rank) {
            return rankingAreaTimeRowHtml(rank, row.area, row.minutos, row.isMine);
        }, emptyOpts);
        progresoState.areasRendered = true;
    }

    function renderRankingEquipo() {
        var podiumEl = document.getElementById('zona-estudio-progreso-ranking-equipo-podium');
        var scrollEl = document.getElementById('zona-estudio-progreso-ranking-equipo');
        if (!scrollEl) return;
        updateRankingEquipoDesc();
        var rows = progresoState.rankingEquipoScope === 'empresa' ? getRankingEmpresa() : getRankingEquipo();
        var emptyOpts = progresoForceEmptyPlanes
            ? {
                hostId: 'zona-estudio-progreso-ranking-equipo-empty',
                icon: PROGRESO_RANKING_EQUIPO_EMPTY_ICON,
                title: PROGRESO_RANKING_EQUIPO_EMPTY_TITLE,
                description: PROGRESO_RANKING_EQUIPO_EMPTY_DESC
            }
            : {
                hostId: 'zona-estudio-progreso-ranking-equipo-empty',
                icon: 'fa-inbox',
                title: 'Sin datos.',
                description: ' '
            };
        renderRankingSplitLists(podiumEl, scrollEl, rows, function (row, rank) {
            return rankingTeamTimeRowHtml(
                rank,
                formatRankingPersonName(row.nombre, row.id),
                row.minutos,
                isSelectedColaborador(row.id),
                String(row.id) === LEADER_ID,
                row.id
            );
        }, emptyOpts);
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
        bindGenerarPlanIAButton();
        if (typeof initTooltip === 'function') {
            initTooltip('#zona-estudio-panel-progreso [data-tooltip]');
        }
    }

    // ─── Agente de planes (IA panel) — paridad con React / evaluación Creator ───

    var PLAN_IA_TOKEN_COST = 80;
    var PLAN_IA_SUCCESS_MESSAGE =
        'Plan generado exitosamente. Lo verás en esta página cuando entre en vigencia.';
    var planIAState = null;
    var planIABound = false;
    var PLAN_IA_MESES = {
        enero: 1, ene: 1, febrero: 2, feb: 2, marzo: 3, mar: 3,
        abril: 4, abr: 4, mayo: 5, may: 5, junio: 6, jun: 6,
        julio: 7, jul: 7, agosto: 8, ago: 8, septiembre: 9, setiembre: 9,
        sep: 9, sept: 9, octubre: 10, oct: 10, noviembre: 11, nov: 11,
        diciembre: 12, dic: 12
    };

    function planIAGetTokens() {
        return window._ubitsAiTokenPool != null ? window._ubitsAiTokenPool : 500000;
    }

    function planIASetTokens(n) {
        window._ubitsAiTokenPool = Math.max(0, Number(n) || 0);
        if (typeof window.setIAPanelTokensBadgeValue === 'function') {
            window.setIAPanelTokensBadgeValue(window._ubitsAiTokenPool);
        }
    }

    function planIATrySpend(cost) {
        var cur = planIAGetTokens();
        if (cur < cost) {
            if (typeof showToast === 'function') {
                showToast('warning', 'No tienes suficientes tokens (' + cost + ' requeridos).');
            }
            return false;
        }
        planIASetTokens(cur - cost);
        return true;
    }

    function planIAMsg(text, opts) {
        if (typeof window.addIAPanelMessage === 'function') {
            window.addIAPanelMessage(text, 'ai', null, opts || null);
        }
    }

    function planIATipoLabel(tipo) {
        return tipo === 'competencias' ? 'competencias' : 'contenidos';
    }

    function normalizeText(value) {
        return String(value || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function planIAPad2(number) {
        return ('0' + number).slice(-2);
    }

    function parseFlexibleDate(raw) {
        var text = String(raw || '').trim();
        var match;
        var year;
        var month;
        var day;
        if (!text) return null;

        match = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
        if (match) {
            year = Number(match[1]);
            month = Number(match[2]);
            day = Number(match[3]);
        } else {
            match = text.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
            if (match) {
                day = Number(match[1]);
                month = Number(match[2]);
                year = Number(match[3]);
            } else {
                var normalized = normalizeText(text).replace(/\bde\b/g, ' ').replace(/\s+/g, ' ').trim();
                match = normalized.match(/^(\d{1,2})\s+([a-z]+)\s+(\d{4})$/);
                if (!match || !PLAN_IA_MESES[match[2]]) return null;
                day = Number(match[1]);
                month = PLAN_IA_MESES[match[2]];
                year = Number(match[3]);
            }
        }

        var date = new Date(year, month - 1, day);
        if (
            date.getFullYear() !== year ||
            date.getMonth() !== month - 1 ||
            date.getDate() !== day
        ) return null;
        return year + '-' + planIAPad2(month) + '-' + planIAPad2(day);
    }

    function formatDateLongEs(iso) {
        var parts = String(iso || '').split('-');
        var meses = [
            'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
            'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
        ];
        if (parts.length !== 3 || !meses[Number(parts[1]) - 1]) return iso;
        return Number(parts[2]) + ' de ' + meses[Number(parts[1]) - 1] + ' de ' + parts[0];
    }

    function planIAIsoToDisplay(iso) {
        var parts = String(iso || '').split('-');
        return parts.length === 3 ? parts[2] + '/' + parts[1] + '/' + parts[0] : iso;
    }

    function planIAEscapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function planIAEmptyDraft() {
        return {
            tipo: null,
            titulo: '',
            personas: [],
            personasTodos: false,
            fechaInicioIso: '',
            fechaFinIso: '',
            contenidos: [],
            competencias: [],
            horasPorCompetencia: {}
        };
    }

    function planIATokens(value) {
        return normalizeText(value).split(' ').filter(Boolean);
    }

    function planIANameMatches(persona, query) {
        var name = normalizeText(persona.nombre);
        var requested = normalizeText(query);
        if (!name || !requested) return false;
        if (name === requested || String(persona.id) === String(query).trim()) return true;
        if (name.indexOf(requested) !== -1 && requested.length >= 4) return true;
        var nameTokens = planIATokens(persona.nombre);
        var queryTokens = planIATokens(query);
        return queryTokens.length > 0 && queryTokens.every(function (token) {
            return nameTokens.some(function (nameToken) {
                return nameToken === token || (token.length >= 4 && nameToken.indexOf(token) === 0);
            });
        });
    }

    function matchPersonas(raw) {
        var text = String(raw || '').trim();
        var normalized = normalizeText(text);
        var equipo = getEquipoPersonas();
        if (
            /^(todos?|todo el equipo|a todo el equipo|mi equipo|el equipo completo|todo mi equipo)$/.test(normalized) ||
            (/\btodos\b/.test(normalized) && text.indexOf(',') === -1 && planIATokens(text).length <= 4)
        ) {
            return { matched: equipo.slice(), unknown: [], isTodos: true };
        }

        var segments = text.split(/\n|;|\by\b|,/i).map(function (segment) {
            return segment.replace(/^(para|a)\s+/i, '').trim();
        }).filter(Boolean);
        var matched = [];
        var unknown = [];
        var seen = {};
        segments.forEach(function (segment) {
            var normalizedSegment = normalizeText(segment);
            if (/^(mi|yo|para mi|para mi mismo|para mi misma|a mi|a mi misma)$/.test(normalizedSegment)) {
                var lider = equipo.filter(function (persona) { return persona.id === LEADER_ID; })[0];
                if (lider && !seen[lider.id]) {
                    seen[lider.id] = true;
                    matched.push(lider);
                } else if (!lider) {
                    unknown.push(segment);
                }
                return;
            }
            var hits = equipo.filter(function (persona) {
                return planIANameMatches(persona, segment);
            });
            if (!hits.length) {
                unknown.push(segment);
                return;
            }
            hits.forEach(function (persona) {
                if (!seen[persona.id]) {
                    seen[persona.id] = true;
                    matched.push(persona);
                }
            });
        });
        return { matched: matched, unknown: unknown, isTodos: false };
    }

    function planIAContentTitle(content) {
        return String((content && (content.title || content.titulo)) || '').trim();
    }

    function planIAContentDuration(content) {
        var value = (content && content.tiempoValor) || 60;
        return String((content && content.unidadTiempo) || 'minutos').toLowerCase().indexOf('hora') !== -1
            ? value + ' h'
            : value + ' min';
    }

    function planIAMatchScore(title, query) {
        var normalizedTitle = normalizeText(title);
        var normalizedQuery = normalizeText(query);
        if (!normalizedTitle || !normalizedQuery) return 0;
        if (normalizedTitle === normalizedQuery) return 1000;
        if (normalizedTitle.indexOf(normalizedQuery) !== -1 || normalizedQuery.indexOf(normalizedTitle) !== -1) {
            return 800 + Math.min(normalizedTitle.length, normalizedQuery.length);
        }
        var titleTokens = planIATokens(title);
        var queryTokens = planIATokens(query);
        var hits = queryTokens.filter(function (queryToken) {
            return titleTokens.some(function (titleToken) {
                return titleToken === queryToken ||
                    titleToken.indexOf(queryToken) === 0 ||
                    queryToken.indexOf(titleToken) === 0;
            });
        }).length;
        return hits ? hits * 50 + (hits === queryTokens.length ? 200 : 0) : 0;
    }

    function matchContenidos(raw) {
        var ubits = (window.BDS_CONTENIDOS_UBITS && window.BDS_CONTENIDOS_UBITS.contents) || [];
        var fiqshaDb = window.BDS_CONTENIDOS_FIQSHA || {};
        var catalog = ubits.concat(fiqshaDb.contents || [], fiqshaDb.contentsCreatorOnly || []);
        var lines = String(raw || '').split(/\n|;/).map(function (line) {
            return line.replace(/^[-•*]\s*/, '').trim();
        }).filter(Boolean);
        var segments = lines.length === 1 && lines[0].indexOf(',') !== -1
            ? lines[0].split(',').map(function (item) { return item.trim(); }).filter(Boolean)
            : lines;
        var matched = [];
        var unknown = [];
        var seen = {};
        segments.forEach(function (segment) {
            var best = null;
            var bestScore = 0;
            catalog.forEach(function (content) {
                var score = planIAMatchScore(planIAContentTitle(content), segment);
                if (score > bestScore) {
                    best = content;
                    bestScore = score;
                }
            });
            if (best && bestScore >= 100) {
                if (!seen[best.id]) {
                    seen[best.id] = true;
                    matched.push({
                        id: best.id,
                        title: planIAContentTitle(best),
                        duration: planIAContentDuration(best)
                    });
                }
            } else {
                unknown.push(segment);
            }
        });
        return { matched: matched, unknown: unknown };
    }

    function matchCompetencias(raw) {
        var master = window.BD_MASTER_COMPETENCIAS || {};
        var competencias = master.competencias || [];
        var segments = String(raw || '').split(/\n|;|,/).map(function (line) {
            return line.replace(/^[-•*]\s*/, '').trim();
        }).filter(Boolean);
        var matched = [];
        var unknown = [];
        var seen = {};
        segments.forEach(function (segment) {
            var normalizedSegment = normalizeText(segment);
            var best = null;
            var bestScore = 0;
            competencias.forEach(function (competencia) {
                var normalizedName = normalizeText(competencia.nombre);
                var score = 0;
                if (normalizedName === normalizedSegment) score = 1000;
                else if (
                    normalizedName.indexOf(normalizedSegment) !== -1 ||
                    normalizedSegment.indexOf(normalizedName) !== -1
                ) score = 700;
                else {
                    var matches = planIATokens(segment).filter(function (token) {
                        return planIATokens(competencia.nombre).indexOf(token) !== -1;
                    }).length;
                    score = matches * 80;
                }
                if (score > bestScore) {
                    best = competencia;
                    bestScore = score;
                }
            });
            if (best && bestScore >= 80) {
                if (!seen[best.id]) {
                    seen[best.id] = true;
                    matched.push({ id: best.id, nombre: best.nombre });
                }
            } else {
                unknown.push(segment);
            }
        });
        return { matched: matched, unknown: unknown };
    }

    function parseHoras(raw, competencias) {
        var text = String(raw || '').trim();
        if (!text || !competencias.length) {
            return { ok: false, error: 'Indica las horas de estudio (por ejemplo: 2, o «Comunicación: 3, Agilidad: 2»).' };
        }
        var single = text.match(/^(\d+(?:[.,]\d+)?)\s*(?:h|hrs?|horas?)?$/i);
        var map = {};
        if (single) {
            var hours = Number(String(single[1]).replace(',', '.'));
            if (!hours || hours <= 0) return { ok: false, error: 'Las horas deben ser un número mayor que 0.' };
            competencias.forEach(function (competencia) { map[competencia.id] = hours; });
            return { ok: true, map: map };
        }
        text.split(/,|\n|;/).forEach(function (part) {
            var match = part.trim().match(/^(.+?)\s*[:=\-]\s*(\d+(?:[.,]\d+)?)\s*(?:h|hrs?|horas?)?$/i);
            if (!match) return;
            var found = matchCompetencias(match[1]).matched[0];
            var hours = Number(String(match[2]).replace(',', '.'));
            if (found && hours > 0) map[found.id] = hours;
        });
        var missing = competencias.filter(function (competencia) {
            return map[competencia.id] == null;
        });
        return missing.length
            ? { ok: false, error: 'Faltan horas para: ' + missing.map(function (c) { return c.nombre; }).join(', ') + '. Usa un número para todas o «Nombre: horas».' }
            : { ok: true, map: map };
    }

    function tryParseOneShot(raw) {
        var text = String(raw || '').trim();
        var normalized = normalizeText(text);
        var looksLikeOneShot =
            /titulado/.test(normalized) &&
            (/(periodo|vigencia)/.test(normalized) || /del .+ al /.test(normalized)) &&
            /(incluye|contenidos|competencias)/.test(normalized);
        if (!looksLikeOneShot) return { looksLikeOneShot: false };

        var out = { looksLikeOneShot: true };
        var match = text.match(/plan\s+de\s+(contenidos|competencias)/i);
        if (match) out.tipo = match[1].toLowerCase();
        var titleAndPeople = text.match(
            /titulado\s+(.+)\s+para\s+(.+?)(?=\s*(?:,|\.|\n)?\s*(?:periodo|período|del|incluye)\b)/i
        );
        if (titleAndPeople) {
            out.titulo = titleAndPeople[1].trim().replace(/[.,;]+$/, '');
            out.personasRaw = titleAndPeople[2].trim();
        } else {
            match = text.match(/titulado\s+(.+?)(?=\s*(?:,|\.|\n)?\s*(?:periodo|período|del|incluye)\b|$)/i);
            if (match) out.titulo = match[1].trim().replace(/[.,;]+$/, '');
            match = text.match(/para\s+(.+?)(?=\s*(?:,|\.|\n)?\s*(?:periodo|período|del|incluye)\b|$)/i);
            if (match) out.personasRaw = match[1].trim();
        }
        match = text.match(/(?:periodo|período)(?:\s+de\s+vigencia)?\s*:?\s*del\s+(.+?)\s+al\s+(.+?)(?:\.|$|\n)/i) ||
            text.match(/del\s+(\d{1,2}\s+de\s+\w+\s+de\s+\d{4})\s+al\s+(\d{1,2}\s+de\s+\w+\s+de\s+\d{4})/i);
        if (match) {
            out.fechaInicioIso = parseFlexibleDate(match[1]);
            out.fechaFinIso = parseFlexibleDate(match[2]);
        }
        match = text.match(/incluye\s+los\s+siguientes\s+contenidos\s*:?\s*([\s\S]+)$/i);
        if (match) {
            out.tipo = out.tipo || 'contenidos';
            out.contenidos = matchContenidos(match[1]).matched;
        }
        match = text.match(/incluye\s+las?\s+siguientes?\s+competencias\s*:?\s*([\s\S]+?)(?=horas|$)/i);
        if (match) {
            out.tipo = out.tipo || 'competencias';
            out.competencias = matchCompetencias(match[1]).matched;
        }
        match = text.match(/horas(?:\s+de\s+estudio)?(?:\s+por\s+competencia)?\s*:?\s*([\s\S]+)$/i);
        if (match && out.competencias && out.competencias.length) {
            var parsedHours = parseHoras(match[1], out.competencias);
            if (parsedHours.ok) out.horasPorCompetencia = parsedHours.map;
        }
        return out;
    }

    function planIADraftReady(draft) {
        if (!draft || !draft.tipo || !draft.titulo.trim() || !draft.personas.length) return false;
        if (!draft.fechaInicioIso || !draft.fechaFinIso || draft.fechaFinIso < draft.fechaInicioIso) return false;
        if (draft.tipo === 'contenidos') return draft.contenidos.length > 0;
        return draft.competencias.length > 0 && draft.competencias.every(function (competencia) {
            return draft.horasPorCompetencia[competencia.id] > 0;
        });
    }

    function planIAPersonasLabel(draft) {
        if (draft.personasTodos) return 'todo el equipo';
        if (draft.personas.length === 1) return draft.personas[0].nombre;
        if (draft.personas.length <= 3) {
            return draft.personas.map(function (p) { return p.nombre; }).join(', ').replace(/, ([^,]*)$/, ' y $1');
        }
        return draft.personas.length + ' personas de tu equipo';
    }

    function buildAndPersistPlan(draft) {
        if (!planIADraftReady(draft)) return null;
        var pf = getPf();
        if (!pf || typeof pf.addPlan !== 'function') return null;
        var contenidoPorUsuario = {};
        var competenciaPorUsuario = {};
        var consumoPorUsuario = {};
        var asignaciones = [];
        if (draft.tipo === 'contenidos') {
            var items = draft.contenidos.map(function (content) {
                return { id: content.id, title: content.title, duration: content.duration || '60 min', progress: 0, status: 'default' };
            });
            draft.personas.forEach(function (persona) {
                contenidoPorUsuario[persona.id] = items.map(function (item) {
                    return { id: item.id, title: item.title, duration: item.duration, progress: item.progress, status: item.status };
                });
                asignaciones.push({
                    id: 'fila-usuario-' + persona.id,
                    colaboradorId: persona.id,
                    nombreUsuario: persona.nombre,
                    avatar: persona.avatar || null,
                    contenidos: items.map(function (item) { return { id: item.id, title: item.title, duration: item.duration }; }),
                    contenidosCount: items.length
                });
            });
        } else {
            var hoursValues = draft.competencias.map(function (competencia) {
                return draft.horasPorCompetencia[competencia.id] || 2;
            });
            var horasEstudioMeta = Math.max.apply(Math, hoursValues.concat([1]));
            draft.personas.forEach(function (persona) {
                competenciaPorUsuario[persona.id] = draft.competencias.map(function (competencia) {
                    return {
                        id: competencia.id, title: competencia.nombre, nombre: competencia.nombre,
                        habilidades: [], progress: 0, status: 'default',
                        horasMeta: draft.horasPorCompetencia[competencia.id]
                    };
                });
                consumoPorUsuario[persona.id] = { horas: 0, items: [] };
                asignaciones.push({
                    id: 'fila-usuario-' + persona.id,
                    colaboradorId: persona.id,
                    nombreUsuario: persona.nombre,
                    avatar: persona.avatar || null,
                    contenidos: draft.competencias.map(function (competencia) {
                        return { id: competencia.id, title: competencia.nombre, nombre: competencia.nombre, habilidades: [] };
                    }),
                    contenidosCount: draft.competencias.length
                });
            });
        }
        var plan = {
            tipo: draft.tipo,
            nombre: draft.titulo.trim(),
            fechaInicioIso: draft.fechaInicioIso,
            fechaFinIso: draft.fechaFinIso,
            fechaInicio: planIAIsoToDisplay(draft.fechaInicioIso),
            fechaFin: planIAIsoToDisplay(draft.fechaFinIso),
            creadorId: LEADER_ID,
            area: LEADER_AREA,
            asignaciones: asignaciones,
            progresoAgregado: 0
        };
        if (draft.tipo === 'contenidos') {
            plan.contenidoPorUsuario = contenidoPorUsuario;
        } else {
            plan.competenciaPorUsuario = competenciaPorUsuario;
            plan.consumoPorUsuario = consumoPorUsuario;
            plan.horasEstudioMeta = horasEstudioMeta;
            plan.horasEstudioPorCompetencia = horasEstudioMeta;
            plan.horasPorCompetencia = draft.horasPorCompetencia;
        }
        return pf.addPlan(plan);
    }

    function planIAShowConfirmation() {
        if (!planIAState || !planIADraftReady(planIAState.draft)) return;
        planIAState.step = 'pre_confirm';
        var draft = planIAState.draft;
        var tipo = planIATipoLabel(draft.tipo);
        var list = draft.tipo === 'competencias'
            ? draft.competencias.map(function (competencia) {
                return '<li>' + planIAEscapeHtml(competencia.nombre) + ' (' + planIAEscapeHtml(draft.horasPorCompetencia[competencia.id]) + ' h)</li>';
            }).join('')
            : draft.contenidos.map(function (content) {
                return '<li>' + planIAEscapeHtml(content.title) + '</li>';
            }).join('');
        var richHtml =
            '<p class="ubits-body-md-regular" style="margin:0 0 4px;">Crearé un plan de ' + tipo + ' titulado ' +
            planIAEscapeHtml(draft.titulo) + ' para ' + planIAEscapeHtml(planIAPersonasLabel(draft)) + '.</p>' +
            '<p class="ubits-body-md-regular" style="margin:0 0 4px;">Período de vigencia: del ' +
            formatDateLongEs(draft.fechaInicioIso) + ' al ' + formatDateLongEs(draft.fechaFinIso) + '.</p>' +
            '<p class="ubits-body-md-regular" style="margin:0 0 4px;">Incluye los siguientes ' + tipo + ':</p>' +
            '<ul class="ubits-body-md-regular" style="margin:0 0 12px;padding-left:20px;">' + list + '</ul>' +
            '<button type="button" id="zona-estudio-progreso-plan-ia-confirm-btn"' +
            ' class="ubits-ia-button ubits-ia-button--secondary ubits-ia-button--sm ubits-ia-button--with-token-cost">' +
            '<span>Generar plan</span>' +
            '<span class="ubits-ia-button__token-divider" aria-hidden="true"></span>' +
            '<span class="ubits-ia-button__token-cost" aria-hidden="true"><i class="far fa-coin-vertical"></i><span class="ubits-ia-button__token-number">' +
            PLAN_IA_TOKEN_COST +
            '</span></span>' +
            '</button>';

        planIAMsg('', { richHtml: richHtml, hideAiCopy: true });

        setTimeout(function () {
            var btn = document.getElementById('zona-estudio-progreso-plan-ia-confirm-btn');
            if (!btn) return;
            if (typeof window.initIaButtonSparkles === 'function') {
                window.initIaButtonSparkles(btn);
            }
            btn.addEventListener('click', function () {
                if (!planIATrySpend(PLAN_IA_TOKEN_COST)) return;
                if (!buildAndPersistPlan(draft)) {
                    if (typeof showToast === 'function') showToast('error', 'No se pudo guardar el plan. Intenta de nuevo.');
                    return;
                }
                planIAState.step = 'done';
                if (typeof window.closeIAPanel === 'function') window.closeIAPanel();
                if (typeof showToast === 'function') {
                    showToast('success', PLAN_IA_SUCCESS_MESSAGE, { duration: 10000, showClose: true });
                }
                renderNivel1();
                renderNivel2y3();
            });
        }, 100);
    }

    function planIAWithTyping(callback, delay) {
        var removeTyping = typeof window.showIAPanelTyping === 'function' ? window.showIAPanelTyping() : null;
        setTimeout(function () {
            if (typeof removeTyping === 'function') removeTyping();
            callback();
        }, delay || 600);
    }

    function planIAAskTitulo() {
        if (!planIAState) return;
        planIAState.step = 'await_titulo';
        planIAWithTyping(function () { planIAMsg('¿Cuál será el título del plan?'); });
    }

    function planIAAskPersonas() {
        planIAState.step = 'await_personas';
        planIAWithTyping(function () {
            planIAMsg('¿Para quiénes de tu equipo quieres crear el plan? Puedes nombrar a una o varias personas (nombre y apellido), incluirte a ti, o escribir «todos».');
        });
    }

    function planIAAskFechaInicio() {
        planIAState.step = 'await_fecha_inicio';
        planIAWithTyping(function () {
            planIAMsg('¿Cuál es la fecha de inicio? (por ejemplo: 20 de junio de 2026 o 20/06/2026)');
        });
    }

    function planIAAskFechaFin() {
        planIAState.step = 'await_fecha_fin';
        planIAWithTyping(function () {
            planIAMsg('¿Y la fecha de finalización? (por ejemplo: 30 de septiembre de 2026)');
        });
    }

    function planIAAskContenidos() {
        planIAState.step = 'await_contenidos';
        planIAWithTyping(function () {
            planIAMsg('¿Qué contenidos del catálogo quieres asignar? Escribe uno o varios títulos (uno por línea o separados por coma).');
        });
    }

    function planIAAskCompetencias() {
        planIAState.step = 'await_competencias';
        planIAWithTyping(function () {
            planIAMsg('¿Qué competencias oficiales de UBITS quieres asignar? Pueden ser una o varias (por ejemplo: Comunicación, Agilidad).');
        });
    }

    function planIAAskHoras() {
        planIAState.step = 'await_horas';
        planIAWithTyping(function () {
            planIAMsg('¿Cuántas horas de estudio asignas por competencia? Puedes indicar un número para todas (ej. 2) o detallar: «Comunicación: 3, Agilidad: 2».');
        });
    }

    function planIAStartFlow() {
        var cost = PLAN_IA_TOKEN_COST;
        if (planIAGetTokens() < cost) {
            planIAState = { step: 'no_tokens', draft: planIAEmptyDraft() };
            planIAMsg(
                'No tienes tokens suficientes para generar un plan (' +
                    cost +
                    ' requeridos). Recarga saldo e inténtalo de nuevo.'
            );
            return;
        }

        planIAState = { step: 'path_select', draft: planIAEmptyDraft() };
        planIAWithTyping(function () {
            planIAMsg('¿Qué tipo de plan quieres crear? Elige una opción para continuar.');
            setTimeout(function () {
                if (typeof window.addIAPanelInteraction !== 'function') return;
                window.addIAPanelInteraction('cards', {
                    items: [
                        {
                            value: 'contenidos',
                            emoji: '📚',
                            title: 'Plan por contenidos',
                            description: 'Arma un plan con cursos y recursos del catálogo.'
                        },
                        {
                            value: 'competencias',
                            emoji: '🎯',
                            title: 'Plan por competencias',
                            description: 'Define competencias y habilidades a desarrollar.'
                        }
                    ],
                    onReply: function (value) {
                        if (!planIAState) return;
                        planIAState.draft.tipo = value === 'competencias' ? 'competencias' : 'contenidos';
                        planIAAskTitulo();
                    }
                });
            }, 300);
        });
    }

    function planIAContinueFromDraft() {
        var draft = planIAState.draft;
        if (!draft.tipo) return planIAStartFlow();
        if (!draft.titulo) return planIAAskTitulo();
        if (!draft.personas.length) return planIAAskPersonas();
        if (!draft.fechaInicioIso) return planIAAskFechaInicio();
        if (!draft.fechaFinIso) return planIAAskFechaFin();
        if (draft.tipo === 'contenidos' && !draft.contenidos.length) return planIAAskContenidos();
        if (draft.tipo === 'competencias' && !draft.competencias.length) return planIAAskCompetencias();
        if (draft.tipo === 'competencias' && !draft.competencias.every(function (competencia) {
            return draft.horasPorCompetencia[competencia.id] > 0;
        })) return planIAAskHoras();
        planIAShowConfirmation();
    }

    function planIATryApplyOneShot(text) {
        var parsed = tryParseOneShot(text);
        if (!parsed.looksLikeOneShot || !planIAState) return false;
        var draft = planIAState.draft;
        if (parsed.tipo) draft.tipo = parsed.tipo;
        if (parsed.titulo) draft.titulo = parsed.titulo;
        if (parsed.fechaInicioIso) draft.fechaInicioIso = parsed.fechaInicioIso;
        if (parsed.fechaFinIso) draft.fechaFinIso = parsed.fechaFinIso;
        if (parsed.contenidos && parsed.contenidos.length) draft.contenidos = parsed.contenidos;
        if (parsed.competencias && parsed.competencias.length) draft.competencias = parsed.competencias;
        if (parsed.horasPorCompetencia) draft.horasPorCompetencia = parsed.horasPorCompetencia;
        if (parsed.personasRaw) {
            var result = matchPersonas(parsed.personasRaw);
            if (result.unknown.length && !result.matched.length) {
                planIAMsg(result.unknown[0] + ' no está bajo tu supervisión en el organigrama, así que no puedes crear un plan para ella. Elige a alguien de tu equipo (o escribe «todos»).');
                planIAState.step = 'await_personas';
                return true;
            }
            if (result.matched.length) {
                draft.personas = result.matched;
                draft.personasTodos = result.isTodos;
            }
        }
        planIAWithTyping(function () {
            if (planIADraftReady(draft)) {
                planIAMsg('Perfecto, armé el plan con lo que me compartiste. Confirma para generarlo:');
                setTimeout(planIAShowConfirmation, 300);
            } else {
                planIAMsg('Recibí parte del plan. Completemos lo que falta.');
                setTimeout(planIAContinueFromDraft, 400);
            }
        });
        return true;
    }

    function planIAHandleUserMsg(msg) {
        var trimmed = String(msg || '').trim();
        if (!planIAState || planIAState.step === 'done') return planIAStartFlow();
        if (planIAState.step === 'no_tokens') {
            if (trimmed) planIAMsg('Sigo sin poder generar el plan: el saldo es insuficiente. Cuando tengas tokens, cierra y vuelve a abrir el agente.');
            return;
        }
        if (planIAState.step === 'pre_confirm') return;
        if (trimmed && planIATryApplyOneShot(trimmed)) return;
        if (planIAState.step === 'path_select') return;

        var draft = planIAState.draft;
        if (planIAState.step === 'await_titulo') {
            if (!trimmed) return planIAMsg('Necesito un título para el plan. ¿Cómo lo llamamos?');
            draft.titulo = trimmed.replace(/^["«]|["»]$/g, '').trim();
            return planIAAskPersonas();
        }
        if (planIAState.step === 'await_personas') {
            if (!trimmed) return planIAMsg('Indica al menos una persona de tu equipo, o escribe «todos».');
            var personasResult = matchPersonas(trimmed);
            if (personasResult.unknown.length) {
                planIAMsg(
                    personasResult.unknown[0] +
                    ' no está bajo tu supervisión en el organigrama, así que no puedes crear un plan para ella. Elige a alguien de tu equipo (o escribe «todos»).' +
                    (personasResult.matched.length ? ' Las personas válidas que detecté son: ' + personasResult.matched.map(function (p) { return p.nombre; }).join(', ') + '.' : '')
                );
                return;
            }
            if (!personasResult.matched.length) return planIAMsg('No reconocí a nadie de tu equipo. Escribe un nombre y apellido, varios nombres, o «todos».');
            draft.personas = personasResult.matched;
            draft.personasTodos = personasResult.isTodos;
            planIAWithTyping(function () {
                if (personasResult.isTodos) {
                    planIAMsg('Perfecto. Crearé el plan para todo tu equipo (' + personasResult.matched.length + ' personas).');
                } else if (personasResult.matched.length === 1) {
                    planIAMsg('Listo. El plan será para ' + personasResult.matched[0].nombre + '.');
                } else {
                    planIAMsg('Listo. El plan será para ' + planIAPersonasLabel(draft) + '.');
                }
                setTimeout(planIAAskFechaInicio, 350);
            }, 500);
            return;
        }
        if (planIAState.step === 'await_fecha_inicio') {
            var startIso = parseFlexibleDate(trimmed);
            if (!startIso) return planIAMsg('No pude leer esa fecha. Prueba con «20 de junio de 2026» o «20/06/2026».');
            var hoyIso = (getPf() && getPf().PLAYGROUND_TODAY) || '2026-06-19';
            if (startIso < hoyIso) {
                return planIAMsg(
                    'La fecha de inicio no puede ser anterior a hoy (' +
                        formatDateLongEs(hoyIso) +
                        '). Prueba con una fecha posterior, por ejemplo «20 de junio de 2026».'
                );
            }
            draft.fechaInicioIso = startIso;
            return planIAAskFechaFin();
        }
        if (planIAState.step === 'await_fecha_fin') {
            var endIso = parseFlexibleDate(trimmed);
            if (!endIso) return planIAMsg('No pude leer esa fecha. Prueba con «30 de septiembre de 2026» o «30/09/2026».');
            if (draft.fechaInicioIso && endIso < draft.fechaInicioIso) {
                return planIAMsg('La fecha de finalización debe ser igual o posterior a la de inicio. ¿Cuál es la fecha de fin?');
            }
            draft.fechaFinIso = endIso;
            return draft.tipo === 'competencias' ? planIAAskCompetencias() : planIAAskContenidos();
        }
        if (planIAState.step === 'await_contenidos') {
            var contentsResult = matchContenidos(trimmed);
            if (!contentsResult.matched.length) return planIAMsg('No encontré esos títulos en el catálogo. Escribe el nombre exacto o muy parecido de uno o más contenidos.');
            draft.contenidos = contentsResult.matched;
            planIAWithTyping(function () {
                if (contentsResult.unknown.length) planIAMsg('Tomé ' + contentsResult.matched.length + ' contenido(s). No encontré: ' + contentsResult.unknown.join(', ') + '.');
                planIAShowConfirmation();
            });
            return;
        }
        if (planIAState.step === 'await_competencias') {
            var competenciasResult = matchCompetencias(trimmed);
            if (!competenciasResult.matched.length) return planIAMsg('No coinciden con las competencias oficiales de UBITS. Prueba con nombres como Comunicación, Agilidad o Gestión de proyectos.');
            draft.competencias = competenciasResult.matched;
            planIAWithTyping(function () {
                if (competenciasResult.unknown.length) planIAMsg('Asigné: ' + competenciasResult.matched.map(function (c) { return c.nombre; }).join(', ') + '. No reconocí: ' + competenciasResult.unknown.join(', ') + '.');
                planIAAskHoras();
            });
            return;
        }
        if (planIAState.step === 'await_horas') {
            var hoursResult = parseHoras(trimmed, draft.competencias);
            if (!hoursResult.ok) return planIAMsg(hoursResult.error);
            draft.horasPorCompetencia = hoursResult.map;
            planIAWithTyping(planIAShowConfirmation);
        }
    }

    function openGenerarPlanIA() {
        if (typeof window.destroyIAPanel === 'function') window.destroyIAPanel();
        if (typeof window.initIAPanel !== 'function') return;

        planIAState = null;
        var currentTokens = planIAGetTokens();

        window.initIAPanel({
            title: 'Agente de planes',
            agentLabel: 'Studio IA',
            welcomeTitle: 'Agente de planes',
            welcomeSubtitle: 'Genera un plan de formación para tu equipo con IA.',
            placeholder: 'Escribe aquí…',
            disclaimer: 'El agente puede cometer errores. Revisa el plan antes de asignarlo.',
            tokensBadge: { value: currentTokens, tooltip: 'Número de tokens restantes.' },
            onSend: function (msg) {
                planIAHandleUserMsg(msg);
            },
            onClose: function () {}
        });

        if (typeof window.openIAPanel === 'function') window.openIAPanel();

        setTimeout(function () {
            if (typeof window.addIAPanelMessage === 'function') {
                window.addIAPanelMessage(
                    '¡Hola! Soy el Agente de planes. Te ayudo a generar un plan de formación para tu equipo con IA. También puedes pegar un brief completo en un solo mensaje.',
                    'ai'
                );
            }
            setTimeout(function () {
                planIAStartFlow();
            }, 400);
        }, 250);
    }

    function bindGenerarPlanIAButton() {
        if (planIABound) return;
        var btn = document.getElementById('zona-estudio-progreso-btn-generar-plan-ia');
        if (!btn) return;
        planIABound = true;
        btn.addEventListener('click', function () {
            openGenerarPlanIA();
        });
        if (typeof window.initIaButtonSparkles === 'function') {
            window.initIaButtonSparkles(btn);
        }
    }

    window.renderZonaEstudioProgresoTab = renderZonaEstudioProgresoTab;
})();
