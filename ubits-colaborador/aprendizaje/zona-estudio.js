/**
 * Zona de estudio — vista colaborador (Plan de contenidos + Plan de competencias).
 * Figma: Learner v4 · 40006050:5454 · 40006073:17044
 */
(function () {
    'use strict';

    var PLAYGROUND_USER_ID = 'E006';
    var PLAN_DESC_CONTENIDOS = 'Contenidos que hacen parte de este plan de formación.';
    var PLAN_DESC_COMPETENCIAS = 'Sugerencias de contenidos para este plan de formación.';
    var EXCLUSIVO_DESC = 'Contenidos habilitados solo para ti. No tienen fecha límite para ser completados.';
    var HISTORIAL_DESC = 'Consulta lo que has visto y descarga certificados de contenidos finalizados que lo incluyan.';
    var HISTORIAL_COUNT = 40;
    var HISTORIAL_IN_PROGRESS_PCT = [75, 25, 42, 88, 53, 31, 67, 18, 92, 48, 61, 36];
    var HISTORIAL_CERTIFICADO_TOAST_MSG = 'Esta acción aún no está disponible en el Playground.';

    var COMPETENCIA_POR_CATEGORIA_FIQSHA = {
        'cfq-001': 'Liderazgo',
        'cfq-002': 'Comunicación',
        'cfq-003': 'Trabajo en equipo',
        'cfq-004': 'Gestión de proyectos',
        'cfq-005': 'Innovación',
        'cfq-006': 'Marketing digital',
        'cfq-007': 'Experiencia del cliente',
        'cfq-008': 'Gestión financiera',
        'cfq-009': 'People management',
        'cfq-010': 'Inteligencia emocional',
        'cfq-011': 'Resolución de problemas',
        'cfq-012': 'Productividad',
        'cfq-013': 'Negociación',
        'cfq-014': 'Ventas',
        'cfq-015': 'Marketing',
        'cfq-016': 'Gestión del cambio',
        'cfq-017': 'Desarrollo de software',
        'cfq-018': 'Data skills',
        'cfq-019': 'Wellness'
    };

    /** 4 contenidos Fiqsha demo: 2 completados, 1 en progreso, 1 sin iniciar. */
    var EXCLUSIVO_FIQSHA_ITEMS = [
        { id: 'f001', progress: 100 },
        { id: 'f002', progress: 100 },
        { id: 'f003', progress: 65 },
        { id: 'f004', progress: 0 }
    ];
    var TAB_IDS = ['progreso', 'contenidos', 'competencias', 'exclusivo', 'historial'];

    var MESES_LARGO = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];

    var state = {
        activeTab: 'progreso',
        selectedPlanByTab: { contenidos: '', competencias: '' },
        planesContenidos: [],
        planesCompetencias: [],
        filteredContents: [],
        exclusivoContents: [],
        exclusivoFilteredContents: [],
        exclusivoSearchQuery: '',
        historialContents: [],
        historialFilteredContents: [],
        historialSearchQuery: '',
        historialViewMode: 'grid',
        searchQuery: '',
        planSelectReady: { contenidos: false, competencias: false },
        exclusivoSearchReady: false,
        historialSearchReady: false,
        historialViewReady: false
    };

    var _historialCertificadoToastBound = false;

    function showHistorialCertificadoToast() {
        if (typeof showToast === 'function') {
            showToast('info', HISTORIAL_CERTIFICADO_TOAST_MSG, {
                containerId: 'ubits-toast-container',
                duration: 4000
            });
        }
    }

    function bindHistorialCertificadoToast() {
        if (_historialCertificadoToastBound) return;
        _historialCertificadoToastBound = true;
        document.addEventListener('ubits-certificado-download-request', function () {
            showHistorialCertificadoToast();
        });
    }

    function formatIndicatorNumber(n) {
        var num = Number(n);
        if (isNaN(num)) return '0';
        if (num >= 1000000) {
            return (Math.round((num / 1000000) * 10) / 10).toLocaleString('es-CO') + ' M';
        }
        if (num >= 10000) {
            return (Math.round((num / 10000) * 10) / 10).toLocaleString('es-CO') + ' K';
        }
        return num.toLocaleString('es-CO');
    }

    function parseYmd(str) {
        if (!str) return null;
        var p = String(str).split('-').map(Number);
        if (p.length < 3) return null;
        return new Date(p[0], p[1] - 1, p[2]);
    }

    function formatDateLongEs(dateStr) {
        var d = parseYmd(dateStr);
        if (!d) return '';
        return d.getDate() + ' de ' + MESES_LARGO[d.getMonth()] + ' de ' + d.getFullYear();
    }

    function getPlaygroundToday() {
        var pf = window.BD_PLANES_FORMACION;
        return (pf && pf.PLAYGROUND_TODAY) ? pf.PLAYGROUND_TODAY : '2026-06-19';
    }

    function daysUntilEnd(endIso) {
        var hoy = parseYmd(getPlaygroundToday());
        var end = parseYmd(endIso);
        if (!hoy || !end) return 0;
        var diff = end.getTime() - hoy.getTime();
        return Math.max(0, Math.ceil(diff / 86400000));
    }

    function daysSinceEnd(endIso) {
        var hoy = parseYmd(getPlaygroundToday());
        var end = parseYmd(endIso);
        if (!hoy || !end) return 0;
        var diff = hoy.getTime() - end.getTime();
        return Math.max(0, Math.ceil(diff / 86400000));
    }

    function calendarMonthsBetween(fromDate, toDate) {
        var months = (toDate.getFullYear() - fromDate.getFullYear()) * 12 + (toDate.getMonth() - fromDate.getMonth());
        if (toDate.getDate() < fromDate.getDate()) months -= 1;
        return Math.max(1, months);
    }

    function formatPlanVencidoHace(days, endIso) {
        if (days <= 0) return '0 días';
        if (days <= 6) {
            return days === 1 ? '1 día' : days + ' días';
        }
        var weeks = Math.floor(days / 7);
        if (weeks <= 6) {
            return weeks === 1 ? '1 semana' : weeks + ' semanas';
        }
        var end = parseYmd(endIso);
        var hoy = parseYmd(getPlaygroundToday());
        if (!end || !hoy) {
            var monthsFallback = Math.max(1, Math.floor(days / 30));
            return monthsFallback === 1 ? '1 mes' : monthsFallback + ' meses';
        }
        var months = calendarMonthsBetween(end, hoy);
        return months === 1 ? '1 mes' : months + ' meses';
    }

    function renderPlanVencidoAlert(prefix, plan) {
        var alertEl = document.getElementById(prefix + '-plan-vencido-alert');
        if (!alertEl) return;

        if (!plan || plan.estado !== 'No vigente') {
            alertEl.innerHTML = '';
            alertEl.hidden = true;
            return;
        }

        var daysSince = daysSinceEnd(plan.fechaFinIso);
        var haceText = formatPlanVencidoHace(daysSince, plan.fechaFinIso);
        var message =
            '<span class="ubits-alert__emphasis">Recordatorio:</span> Lo que completes después de la fecha límite no se suma al progreso del plan. ' +
            'Este plan se venció hace ' + escapeHtml(haceText) + '.';

        alertEl.hidden = false;
        if (typeof showAlert === 'function') {
            var alertResult = showAlert('error', message, {
                containerId: prefix + '-plan-vencido-alert',
                noClose: true
            });
            if (alertResult && alertResult.element) {
                alertResult.element.classList.add('ubits-alert--block-text');
            }
        } else {
            alertEl.innerHTML =
                '<div class="ubits-alert ubits-alert--error ubits-alert--no-close ubits-alert--block-text" role="alert">' +
                    '<div class="ubits-alert__icon"><i class="far fa-times-circle"></i></div>' +
                    '<div class="ubits-alert__content">' +
                        '<div class="ubits-alert__text">' + message + '</div>' +
                    '</div>' +
                '</div>';
        }
    }

    function getEstadoTagVariant(estado) {
        if (estado === 'Planeado') return 'info';
        if (String(estado || '').indexOf('Procesando') === 0) return 'warning';
        if (estado === 'Vigente') return 'success';
        if (estado === 'No vigente') return 'neutral';
        return 'neutral';
    }

    function buildPlanSelectOption(plan, tabId) {
        var metaText = '';
        if (tabId === 'competencias') {
            metaText = getCompetenciaProgressMinutes(plan).pct + '% de avance';
        } else {
            var prog = getContenidosProgressCount(plan);
            metaText = prog.done + ' de ' + prog.total + ' contenidos';
        }
        return {
            value: plan.id,
            text: plan.nombre,
            metaText: metaText,
            statusTag: {
                text: plan.estado || 'Vigente',
                variant: getEstadoTagVariant(plan.estado)
            }
        };
    }

    function getPlanesDb() {
        return window.BD_PLANES_FORMACION;
    }

    function planVisibleEnZonaEstudio(plan) {
        if (!plan) return false;
        var estado = String(plan.estado || '');
        if (estado === 'Planeado') return false;
        if (estado.indexOf('Procesando') === 0) return false;
        return true;
    }

    function loadPlanesFromBd() {
        var pf = getPlanesDb();
        if (!pf || typeof pf.getPlanesParaColaborador !== 'function') {
            state.planesContenidos = [];
            state.planesCompetencias = [];
            return;
        }
        if (typeof pf.reseedIfCorrupt === 'function') {
            pf.reseedIfCorrupt();
        }
        state.planesContenidos = pf.getPlanesParaColaborador(PLAYGROUND_USER_ID, { tipo: 'contenidos' })
            .filter(planVisibleEnZonaEstudio);
        state.planesCompetencias = pf.getPlanesParaColaborador(PLAYGROUND_USER_ID, { tipo: 'competencias' })
            .filter(planVisibleEnZonaEstudio);
        if (!state.selectedPlanByTab.contenidos || !state.planesContenidos.some(function (p) {
            return p.id === state.selectedPlanByTab.contenidos;
        })) {
            state.selectedPlanByTab.contenidos = state.planesContenidos.length ? state.planesContenidos[0].id : '';
        }
        if (!state.selectedPlanByTab.competencias || !state.planesCompetencias.some(function (p) {
            return p.id === state.selectedPlanByTab.competencias;
        })) {
            state.selectedPlanByTab.competencias = state.planesCompetencias.length ? state.planesCompetencias[0].id : '';
        }
    }

    function getPlansForTab(tabId) {
        return tabId === 'competencias' ? state.planesCompetencias : state.planesContenidos;
    }

    function getSelectedPlanId(tabId) {
        tabId = tabId || state.activeTab;
        var id = state.selectedPlanByTab[tabId];
        var list = getPlansForTab(tabId);
        if (id && list.some(function (p) { return p.id === id; })) return id;
        return list.length ? list[0].id : '';
    }

    function getSelectedPlan(tabId) {
        var id = getSelectedPlanId(tabId);
        var list = getPlansForTab(tabId);
        for (var i = 0; i < list.length; i++) {
            if (list[i].id === id) return list[i];
        }
        return list[0] || null;
    }

    function nivelNombrePorId(nivelId) {
        var niveles = window.BD_MASTER_NIVELES_CONTENIDO && window.BD_MASTER_NIVELES_CONTENIDO.niveles;
        if (!niveles || !nivelId) return 'Intermedio';
        for (var i = 0; i < niveles.length; i++) {
            if (niveles[i].id === nivelId) return niveles[i].nombre || 'Intermedio';
        }
        return 'Intermedio';
    }

    function aliadoPorId(proveedorAliadoId) {
        var aliados = window.BD_MASTER_ALIADOS && window.BD_MASTER_ALIADOS.aliados;
        if (!aliados || !proveedorAliadoId) return null;
        for (var i = 0; i < aliados.length; i++) {
            if (aliados[i].id === proveedorAliadoId) return aliados[i];
        }
        return null;
    }

    function competenciaMetaPorId(competenciaId) {
        var comps = window.BD_MASTER_COMPETENCIAS && window.BD_MASTER_COMPETENCIAS.competencias;
        if (!comps || !competenciaId) return { id: competenciaId, nombre: 'Competencia', archivoImagen: 'Liderazgo.jpg' };
        for (var i = 0; i < comps.length; i++) {
            if (comps[i].id === competenciaId) return comps[i];
        }
        return { id: competenciaId, nombre: 'Competencia', archivoImagen: 'Liderazgo.jpg' };
    }

    function competenciaNombrePorId(competenciaId) {
        return competenciaMetaPorId(competenciaId).nombre || 'Competencia';
    }

    function getContenidoCatalogoById(contentId) {
        var bd = window.BDS_CONTENIDOS_UBITS;
        if (!bd || !bd.contents || !contentId) return null;
        for (var i = 0; i < bd.contents.length; i++) {
            if (bd.contents[i].id === contentId) return bd.contents[i];
        }
        return null;
    }

    function getFiqshaContenidoById(contentId) {
        var bd = window.BDS_CONTENIDOS_FIQSHA;
        if (!bd || !bd.contents || !contentId) return null;
        for (var i = 0; i < bd.contents.length; i++) {
            if (bd.contents[i].id === contentId) return bd.contents[i];
        }
        return null;
    }

    function mapFiqshaContenidoToCard(c, progress) {
        var cp = window.CATALOGO_PROVEEDORES;
        var providerName = 'UBITS';
        var providerLogo = '../../images/Favicons/UBITS.jpg';
        if (cp && typeof cp.resolveProviderFromCatalogoItem === 'function') {
            var prov = cp.resolveProviderFromCatalogoItem(c, '../../');
            providerName = prov.nombre;
            providerLogo = prov.logo;
        } else {
            var a = aliadoPorId(c.proveedorAliadoId);
            providerName = a && a.nombre ? a.nombre : 'Fiqsha Smart Consulting';
            if (a && a.logo) {
                providerLogo = '../../' + String(a.logo).replace(/^\.\//, '');
            }
        }
        var durMin = c.tiempoValor != null ? String(c.tiempoValor) : '60';
        var imgPath = c.imagen
            ? ('../../' + String(c.imagen).replace(/^\.\//, ''))
            : '../../images/Profile-image.jpg';
        var pct = progress != null ? Number(progress) : 0;
        if (isNaN(pct)) pct = 0;
        return {
            type: c.tipoContenido || 'Curso',
            title: c.titulo || c.title || '',
            provider: providerName,
            providerLogo: providerLogo,
            duration: durMin + ' min',
            level: nivelNombrePorId(c.nivelId),
            progress: pct,
            status: pct >= 100 ? 'completed' : (pct > 0 ? 'progress' : 'default'),
            image: imgPath,
            competency: COMPETENCIA_POR_CATEGORIA_FIQSHA[c.categoriaFiqshaId] || 'Liderazgo',
            language: (c.idioma || 'Español').trim()
        };
    }

    function buildExclusivoCards() {
        var cards = [];
        EXCLUSIVO_FIQSHA_ITEMS.forEach(function (item) {
            var c = getFiqshaContenidoById(item.id);
            if (!c) return;
            cards.push(mapFiqshaContenidoToCard(c, item.progress));
        });
        return cards;
    }

    function applyExclusivoFilters() {
        var list = state.exclusivoContents.slice();
        var q = (state.exclusivoSearchQuery || '').toLowerCase().trim();
        if (q) {
            list = list.filter(function (c) {
                return (
                    (c.title || '').toLowerCase().indexOf(q) >= 0 ||
                    (c.competency || '').toLowerCase().indexOf(q) >= 0 ||
                    (c.type || '').toLowerCase().indexOf(q) >= 0 ||
                    (c.level || '').toLowerCase().indexOf(q) >= 0
                );
            });
        }
        state.exclusivoFilteredContents = list;
    }

    function updateExclusivoResultsCount() {
        var el = document.getElementById('zona-estudio-exclusivo-results-count');
        if (el) el.textContent = formatIndicatorNumber(state.exclusivoFilteredContents.length);
    }

    function renderExclusivoCards() {
        var grid = document.getElementById('zona-estudio-exclusivo-cards-grid');
        var empty = document.getElementById('zona-estudio-exclusivo-empty-state');
        if (!grid) return;

        if (!state.exclusivoFilteredContents.length) {
            grid.style.display = 'none';
            grid.innerHTML = '';
            if (empty) {
                empty.style.display = 'flex';
                if (typeof loadEmptyState === 'function') {
                    loadEmptyState('zona-estudio-exclusivo-empty-state', {
                        icon: 'fa-search',
                        iconSize: 'lg',
                        title: 'No se encontraron resultados',
                        description: state.exclusivoSearchQuery
                            ? 'Intenta ajustar tu búsqueda.'
                            : 'Intenta ajustar tu búsqueda o filtros para encontrar lo que buscas.',
                        buttons: state.exclusivoSearchQuery ? {
                            secondary: {
                                text: 'Limpiar búsqueda',
                                icon: 'fa-times',
                                onClick: function () {}
                            }
                        } : undefined
                    });
                    setTimeout(function () {
                        var btn = empty.querySelector('.ubits-button--secondary');
                        if (btn) {
                            btn.onclick = function (e) {
                                e.preventDefault();
                                if (typeof window.clearZonaEstudioExclusivoSearch === 'function') {
                                    window.clearZonaEstudioExclusivoSearch();
                                }
                            };
                        }
                    }, 50);
                }
            }
            updateExclusivoResultsCount();
            return;
        }

        if (empty) {
            empty.style.display = 'none';
            empty.innerHTML = '';
        }
        grid.style.display = 'grid';

        if (typeof loadCardContent === 'function') {
            loadCardContent('zona-estudio-exclusivo-cards-grid', state.exclusivoFilteredContents);
        }
        updateExclusivoResultsCount();
    }

    function renderExclusivoTab() {
        var descEl = document.getElementById('zona-estudio-exclusivo-desc');
        if (descEl) descEl.textContent = EXCLUSIVO_DESC;

        if (!state.exclusivoContents.length) {
            state.exclusivoContents = buildExclusivoCards();
        }
        applyExclusivoFilters();
        renderExclusivoCards();

        if (typeof initTooltip === 'function') {
            initTooltip('#zona-estudio-exclusivo-toolbar [data-tooltip]');
        }
    }

    function setupExclusivoSearch() {
        if (state.exclusivoSearchReady) return;

        var toggle = document.getElementById('zona-estudio-exclusivo-search-toggle');
        var inline = document.getElementById('zona-estudio-exclusivo-search-inline');
        var group = document.getElementById('zona-estudio-exclusivo-search-group');
        var isOpen = false;

        window.clearZonaEstudioExclusivoSearch = function () {
            state.exclusivoSearchQuery = '';
            applyExclusivoFilters();
            renderExclusivoCards();
            if (isOpen && inline && toggle) {
                inline.innerHTML = '';
                inline.style.display = 'none';
                inline.setAttribute('aria-hidden', 'true');
                toggle.style.display = 'flex';
                isOpen = false;
                if (group) group.classList.remove('zona-estudio-search-mode-active');
            }
        };

        function closeSearch() {
            if (!isOpen) return;
            inline.innerHTML = '';
            inline.style.display = 'none';
            inline.setAttribute('aria-hidden', 'true');
            toggle.style.display = 'flex';
            isOpen = false;
            if (group) group.classList.remove('zona-estudio-search-mode-active');
            state.exclusivoSearchQuery = '';
            applyExclusivoFilters();
            renderExclusivoCards();
        }

        if (!toggle || !inline) return;

        toggle.addEventListener('click', function (e) {
            e.stopPropagation();
            if (isOpen || typeof createInput !== 'function') return;
            toggle.style.display = 'none';
            inline.style.display = 'flex';
            inline.removeAttribute('aria-hidden');
            if (group) group.classList.add('zona-estudio-search-mode-active');
            createInput({
                containerId: 'zona-estudio-exclusivo-search-inline',
                type: 'search',
                placeholder: 'Buscar contenidos...',
                size: 'sm',
                onChange: function (val) {
                    state.exclusivoSearchQuery = val || '';
                    applyExclusivoFilters();
                    renderExclusivoCards();
                }
            });
            isOpen = true;
            setTimeout(function () {
                var input = inline.querySelector('input');
                if (input) input.focus();
            }, 80);
            if (typeof initTooltip === 'function') {
                initTooltip('#zona-estudio-exclusivo-toolbar [data-tooltip]');
            }
        });

        document.addEventListener('click', function (e) {
            if (!isOpen) return;
            if (e.target.closest && e.target.closest('#zona-estudio-exclusivo-filter-btn')) return;
            var inside = inline.contains(e.target) || toggle.contains(e.target);
            if (!inside && !state.exclusivoSearchQuery.trim()) closeSearch();
        });

        state.exclusivoSearchReady = true;
    }

    function historialSeed(str) {
        var h = 0;
        var s = String(str || '');
        for (var i = 0; i < s.length; i++) {
            h = ((h << 5) - h) + s.charCodeAt(i);
            h |= 0;
        }
        return Math.abs(h);
    }

    function getHistorialSourcePool() {
        var ubits = window.BDS_CONTENIDOS_UBITS && window.BDS_CONTENIDOS_UBITS.contents;
        var fiqsha = window.BDS_CONTENIDOS_FIQSHA && window.BDS_CONTENIDOS_FIQSHA.contents;
        var uList = [];
        var fList = [];
        if (ubits && ubits.length) {
            ubits.forEach(function (c) {
                uList.push({ source: 'ubits', c: c });
            });
        }
        if (fiqsha && fiqsha.length) {
            fiqsha.forEach(function (c) {
                fList.push({ source: 'fiqsha', c: c });
            });
        }
        uList.sort(function (a, b) {
            return historialSeed('hist-u-' + (a.c.id || '')) - historialSeed('hist-u-' + (b.c.id || ''));
        });
        fList.sort(function (a, b) {
            return historialSeed('hist-f-' + (a.c.id || '')) - historialSeed('hist-f-' + (b.c.id || ''));
        });
        var pool = [];
        var maxLen = Math.max(uList.length, fList.length);
        for (var i = 0; i < maxLen && pool.length < HISTORIAL_COUNT; i++) {
            if (i < uList.length && pool.length < HISTORIAL_COUNT) pool.push(uList[i]);
            if (i < fList.length && pool.length < HISTORIAL_COUNT) pool.push(fList[i]);
        }
        return pool.slice(0, HISTORIAL_COUNT);
    }

    function enrichHistorialFromCatalogo(c, card) {
        card.contentId = (c && c.id) ? c.id : '';
        card.conCertificacion = !!(c && c.conCertificacion);
        if (card.conCertificacion) {
            card.plantillaCertificadoId = (c && c.plantillaCertificadoId) || '';
            card.plantillaCertificado = (c && c.plantillaCertificado) || '';
        }
        var pct = Number(card.progress);
        if (isNaN(pct)) pct = 0;
        if (card.conCertificacion && pct >= 100) {
            card.certificadoRowActions = true;
            card.certificadoCardId = card.contentId;
        }
        return card;
    }

    function historialCertificadoCellHtml(row) {
        if (!row.conCertificacion) {
            return '<span class="ubits-body-sm-regular zona-estudio-historial__cert-text">No aplica</span>';
        }
        var pct = Number(row.progress);
        if (isNaN(pct)) pct = 0;
        pct = Math.min(100, Math.max(0, pct));
        if (pct >= 100) {
            return '<button type="button" class="ubits-button ubits-button--secondary ubits-button--xs zona-estudio-historial__cert-download" data-historial-cert-download="1">' +
                '<i class="far fa-down-to-line" aria-hidden="true"></i><span>Descargar</span></button>';
        }
        return '<span class="ubits-body-sm-regular zona-estudio-historial__cert-text">Pendiente</span>';
    }

    function buildHistorialCards() {
        var items = getHistorialSourcePool();
        var inProgressCount = Math.max(1, Math.round(HISTORIAL_COUNT * 0.1));
        var inProgressIndices = {};
        var rank = items.map(function (_, idx) { return idx; });
        rank.sort(function (a, b) {
            return historialSeed('ip-' + (items[a].c.id || '') + '-' + a) -
                historialSeed('ip-' + (items[b].c.id || '') + '-' + b);
        });
        for (var j = 0; j < inProgressCount && j < rank.length; j++) {
            inProgressIndices[rank[j]] = true;
        }

        var cards = [];
        items.forEach(function (item, idx) {
            var progress = 100;
            if (inProgressIndices[idx]) {
                var pctIdx = historialSeed('pct-' + (item.c.id || '') + '-' + idx) % HISTORIAL_IN_PROGRESS_PCT.length;
                progress = HISTORIAL_IN_PROGRESS_PCT[pctIdx];
            }
            var card;
            if (item.source === 'fiqsha') {
                card = mapFiqshaContenidoToCard(item.c, progress);
            } else {
                card = mapCatalogoToCard(item.c, progress);
            }
            cards.push(enrichHistorialFromCatalogo(item.c, card));
        });
        cards.sort(function (a, b) {
            var aInProgress = a.status === 'progress' ? 0 : 1;
            var bInProgress = b.status === 'progress' ? 0 : 1;
            return aInProgress - bInProgress;
        });
        return cards;
    }

    function applyHistorialFilters() {
        var list = state.historialContents.slice();
        var q = (state.historialSearchQuery || '').toLowerCase().trim();
        if (q) {
            list = list.filter(function (c) {
                return (
                    (c.title || '').toLowerCase().indexOf(q) >= 0 ||
                    (c.competency || '').toLowerCase().indexOf(q) >= 0 ||
                    (c.type || '').toLowerCase().indexOf(q) >= 0 ||
                    (c.level || '').toLowerCase().indexOf(q) >= 0
                );
            });
        }
        state.historialFilteredContents = list;
    }

    function updateHistorialResultsCount() {
        var el = document.getElementById('zona-estudio-historial-results-count');
        if (el) el.textContent = formatIndicatorNumber(state.historialFilteredContents.length);
    }

    function renderHistorialTable() {
        var tbody = document.getElementById('zona-estudio-historial-table-tbody');
        if (!tbody) return;

        var rows = state.historialFilteredContents;
        if (!rows.length) {
            tbody.innerHTML = '';
            return;
        }

        var html = '';
        rows.forEach(function (row) {
            var progressHtml = typeof tableProgressCellHtml === 'function'
                ? tableProgressCellHtml(row.progress)
                : '<div class="ubits-table__cell-progress"><span class="ubits-body-sm-regular">' + escapeHtml(String(row.progress)) + '%</span></div>';
            html += '<tr class="zona-estudio-historial-table__row">' +
                '<td data-col="nombre"><span class="ubits-body-sm-regular zona-estudio-historial-table__title">' + escapeHtml(row.title || '') + '</span></td>' +
                '<td data-col="tipo"><span class="ubits-body-sm-regular">' + escapeHtml(row.type || '') + '</span></td>' +
                '<td data-col="nivel"><span class="ubits-body-sm-regular">' + escapeHtml(row.level || '') + '</span></td>' +
                '<td data-col="progreso">' + progressHtml + '</td>' +
                '<td data-col="certificado">' + historialCertificadoCellHtml(row) + '</td>' +
                '</tr>';
        });
        tbody.innerHTML = html;
    }

    function renderHistorialContent() {
        var grid = document.getElementById('zona-estudio-historial-cards-grid');
        var tableWrap = document.getElementById('zona-estudio-historial-table-wrap');
        var empty = document.getElementById('zona-estudio-historial-empty-state');
        if (!grid) return;

        if (!state.historialFilteredContents.length) {
            grid.style.display = 'none';
            grid.innerHTML = '';
            if (tableWrap) tableWrap.hidden = true;
            if (empty) {
                empty.style.display = 'flex';
                if (typeof loadEmptyState === 'function') {
                    loadEmptyState('zona-estudio-historial-empty-state', {
                        icon: 'fa-search',
                        iconSize: 'lg',
                        title: 'No se encontraron resultados',
                        description: state.historialSearchQuery
                            ? 'Intenta ajustar tu búsqueda.'
                            : 'Intenta ajustar tu búsqueda o filtros para encontrar lo que buscas.',
                        buttons: state.historialSearchQuery ? {
                            secondary: {
                                text: 'Limpiar búsqueda',
                                icon: 'fa-times',
                                onClick: function () {}
                            }
                        } : undefined
                    });
                    setTimeout(function () {
                        var btn = empty.querySelector('.ubits-button--secondary');
                        if (btn) {
                            btn.onclick = function (e) {
                                e.preventDefault();
                                if (typeof window.clearZonaEstudioHistorialSearch === 'function') {
                                    window.clearZonaEstudioHistorialSearch();
                                }
                            };
                        }
                    }, 50);
                }
            }
            updateHistorialResultsCount();
            return;
        }

        if (empty) {
            empty.style.display = 'none';
            empty.innerHTML = '';
        }

        if (state.historialViewMode === 'list') {
            grid.style.display = 'none';
            grid.innerHTML = '';
            if (tableWrap) tableWrap.hidden = false;
            renderHistorialTable();
        } else {
            if (tableWrap) tableWrap.hidden = true;
            grid.style.display = 'grid';
            if (typeof loadCardContent === 'function') {
                loadCardContent('zona-estudio-historial-cards-grid', state.historialFilteredContents);
            }
            if (typeof initTooltip === 'function') {
                initTooltip('#zona-estudio-historial-cards-grid [data-tooltip]');
            }
        }
        updateHistorialResultsCount();
    }

    function renderHistorialCards() {
        renderHistorialContent();
    }

    function setupHistorialViewToggle() {
        if (state.historialViewReady) return;
        bindHistorialCertificadoToast();
        var tableWrap = document.getElementById('zona-estudio-historial-table-wrap');
        if (tableWrap) {
            tableWrap.addEventListener('click', function (e) {
                var btn = e.target.closest && e.target.closest('[data-historial-cert-download]');
                if (!btn) return;
                e.preventDefault();
                showHistorialCertificadoToast();
            });
        }
        if (typeof initButtonGroup === 'function') {
            initButtonGroup('#zona-estudio-historial-view-group', {
                variant: 'selectable',
                value: state.historialViewMode,
                onChange: function (val) {
                    state.historialViewMode = val === 'list' ? 'list' : 'grid';
                    renderHistorialContent();
                }
            });
        }
        state.historialViewReady = true;
    }

    function renderHistorialTab() {
        var descEl = document.getElementById('zona-estudio-historial-desc');
        if (descEl) descEl.textContent = HISTORIAL_DESC;

        if (!state.historialContents.length) {
            state.historialContents = buildHistorialCards();
        }
        applyHistorialFilters();
        renderHistorialContent();

        if (typeof initTooltip === 'function') {
            initTooltip('#zona-estudio-historial-toolbar [data-tooltip]');
        }
    }

    function setupHistorialSearch() {
        if (state.historialSearchReady) return;

        var toggle = document.getElementById('zona-estudio-historial-search-toggle');
        var inline = document.getElementById('zona-estudio-historial-search-inline');
        var group = document.getElementById('zona-estudio-historial-search-group');
        var isOpen = false;

        window.clearZonaEstudioHistorialSearch = function () {
            state.historialSearchQuery = '';
            applyHistorialFilters();
            renderHistorialCards();
            if (isOpen && inline && toggle) {
                inline.innerHTML = '';
                inline.style.display = 'none';
                inline.setAttribute('aria-hidden', 'true');
                toggle.style.display = 'flex';
                isOpen = false;
                if (group) group.classList.remove('zona-estudio-search-mode-active');
            }
        };

        function closeSearch() {
            if (!isOpen) return;
            inline.innerHTML = '';
            inline.style.display = 'none';
            inline.setAttribute('aria-hidden', 'true');
            toggle.style.display = 'flex';
            isOpen = false;
            if (group) group.classList.remove('zona-estudio-search-mode-active');
            state.historialSearchQuery = '';
            applyHistorialFilters();
            renderHistorialCards();
        }

        if (!toggle || !inline) return;

        toggle.addEventListener('click', function (e) {
            e.stopPropagation();
            if (isOpen || typeof createInput !== 'function') return;
            toggle.style.display = 'none';
            inline.style.display = 'flex';
            inline.removeAttribute('aria-hidden');
            if (group) group.classList.add('zona-estudio-search-mode-active');
            createInput({
                containerId: 'zona-estudio-historial-search-inline',
                type: 'search',
                placeholder: 'Buscar contenidos...',
                size: 'sm',
                onChange: function (val) {
                    state.historialSearchQuery = val || '';
                    applyHistorialFilters();
                    renderHistorialCards();
                }
            });
            isOpen = true;
            setTimeout(function () {
                var input = inline.querySelector('input');
                if (input) input.focus();
            }, 80);
            if (typeof initTooltip === 'function') {
                initTooltip('#zona-estudio-historial-toolbar [data-tooltip]');
            }
        });

        document.addEventListener('click', function (e) {
            if (!isOpen) return;
            if (e.target.closest && e.target.closest('#zona-estudio-historial-filter-btn')) return;
            var inside = inline.contains(e.target) || toggle.contains(e.target);
            if (!inside && !state.historialSearchQuery.trim()) closeSearch();
        });

        state.historialSearchReady = true;
    }

    function mapCatalogoToCard(c, progress) {
        var cp = window.CATALOGO_PROVEEDORES;
        var providerName = 'UBITS';
        var providerLogo = '../../images/Favicons/UBITS.jpg';
        var providersMulti = null;

        if (cp && typeof cp.buildCardFromCatalogoContent === 'function') {
            var nivel = nivelNombrePorId(c.nivelId);
            var pct = progress != null ? Number(progress) : 0;
            if (isNaN(pct)) pct = 0;
            var built = cp.buildCardFromCatalogoContent(c, '../../', {
                progress: pct,
                level: nivel,
                competency: competenciaNombrePorId(c.competenciaPrincipalId)
            });
            return built;
        }

        if (cp && typeof cp.resolvePrimaryAliadoId === 'function') {
            var primaryId = cp.resolvePrimaryAliadoId(c);
            var primary = cp.resolveAliadoDisplay(primaryId, '../../');
            providerName = primary.nombre;
            providerLogo = primary.logo;
            var provs = cp.resolveProveedoresCatalogoUbits(c, '../../');
            providersMulti = cp.buildProvidersMultiForCard(c, provs);
        } else {
            var aliadoId = (c.providersAliadosIds && c.providersAliadosIds.length)
                ? (function () {
                    var ids = c.providersAliadosIds;
                    for (var pi = 0; pi < ids.length; pi++) {
                        if (ids[pi] && ids[pi] !== 'aly-001') return ids[pi];
                    }
                    return ids[0];
                })()
                : c.aliadoId;
            var a = aliadoPorId(aliadoId);
            providerName = a && a.nombre ? a.nombre : 'UBITS';
            if (a && a.logo) {
                providerLogo = '../../' + String(a.logo).replace(/^\.\//, '');
            }
        }

        var durMin = c.tiempoValor != null ? String(c.tiempoValor) : '60';
        var imgPath = c.imagen
            ? ('../../' + String(c.imagen).replace(/^\.\//, ''))
            : '../../images/Profile-image.jpg';
        var pct = progress != null ? Number(progress) : 0;
        if (isNaN(pct)) pct = 0;
        var card = {
            type: c.tipoContenido || 'Curso',
            title: c.titulo || c.title || '',
            provider: providerName,
            providerLogo: providerLogo,
            duration: durMin + ' min',
            level: nivelNombrePorId(c.nivelId),
            progress: pct,
            status: pct >= 100 ? 'completed' : (pct > 0 ? 'progress' : 'default'),
            image: imgPath,
            competency: competenciaNombrePorId(c.competenciaPrincipalId),
            language: (c.idioma || 'Español').trim()
        };
        if (providersMulti) card.providers = providersMulti;
        return card;
    }

    function getContenidosCatalogoPorCompetencia(compId) {
        var bd = window.BDS_CONTENIDOS_UBITS;
        if (!bd || !bd.contents) return [];
        return bd.contents.filter(function (c) { return c.competenciaPrincipalId === compId; });
    }

    function getPlanContentsFromBd(plan) {
        if (!plan) return [];
        var pf = getPlanesDb();
        var items = ((plan.contenidoPorUsuario || {})[PLAYGROUND_USER_ID]) || [];
        var out = [];
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var c = getContenidoCatalogoById(item.id);
            if (!c) continue;
            var card = mapCatalogoToCard(c, item.progress);
            card.status = item.status || card.status;
            out.push(card);
        }
        return out;
    }

    function getCompetenciaProgressMinutes(plan) {
        var pf = getPlanesDb();
        var metaHoras = plan.horasEstudioMeta || (pf && pf.HORAS_META_COMPETENCIAS) || 2;
        var metaMin = Math.round(metaHoras * 60);
        var consumo = (plan.consumoPorUsuario || {})[PLAYGROUND_USER_ID] || { horas: 0 };
        var doneMin = Math.round((Number(consumo.horas) || 0) * 60);
        var pct = pf ? pf.getProgresoColaboradorEnPlan(plan, PLAYGROUND_USER_ID) : 0;
        return { doneMin: doneMin, totalMin: metaMin, pct: pct };
    }

    function getContenidosProgressCount(plan) {
        var items = ((plan.contenidoPorUsuario || {})[PLAYGROUND_USER_ID]) || [];
        var done = 0;
        items.forEach(function (it) {
            if (Number(it.progress) >= 100) done += 1;
        });
        var pf = getPlanesDb();
        var pct = pf ? pf.getProgresoColaboradorEnPlan(plan, PLAYGROUND_USER_ID) : 0;
        return { done: done, total: items.length, pct: pct };
    }

    function buildCardsForCompetenciaBlock(plan, compId) {
        var consumo = (plan.consumoPorUsuario || {})[PLAYGROUND_USER_ID] || { items: [] };
        var cards = [];
        var used = {};
        (consumo.items || []).forEach(function (it, idx) {
            var c = getContenidoCatalogoById(it.contenidoId);
            if (!c || used[c.id]) return;
            used[c.id] = true;
            var pct = idx === 0 ? Math.min(100, getCompetenciaProgressMinutes(plan).pct) : 0;
            cards.push(mapCatalogoToCard(c, pct));
        });
        var pool = getContenidosCatalogoPorCompetencia(compId);
        for (var i = 0; i < pool.length && cards.length < 12; i++) {
            if (used[pool[i].id]) continue;
            used[pool[i].id] = true;
            cards.push(mapCatalogoToCard(pool[i], 0));
        }
        return cards;
    }

    function applyFilters() {
        var plan = getSelectedPlan('contenidos');
        var list = plan ? getPlanContentsFromBd(plan) : [];
        var q = (state.searchQuery || '').toLowerCase().trim();
        if (q) {
            list = list.filter(function (c) {
                return (
                    (c.title || '').toLowerCase().indexOf(q) >= 0 ||
                    (c.competency || '').toLowerCase().indexOf(q) >= 0 ||
                    (c.type || '').toLowerCase().indexOf(q) >= 0 ||
                    (c.level || '').toLowerCase().indexOf(q) >= 0
                );
            });
        }
        state.filteredContents = list;
    }

    function renderPlanHeader(prefix, tabId) {
        var plan = getSelectedPlan(tabId);
        var vigenciaEl = document.getElementById(prefix + '-plan-vigencia');
        var descEl = document.getElementById(prefix + '-plan-desc');
        var countEl = document.getElementById(prefix + '-plan-progress-count');
        var pctEl = document.getElementById(prefix + '-plan-progress-pct');
        var barEl = document.getElementById(prefix + '-plan-progress-bar');
        var statusEl = document.getElementById(prefix + '-plan-status');

        if (!plan) {
            if (vigenciaEl) vigenciaEl.textContent = '';
            if (descEl) descEl.textContent = '';
            if (countEl) countEl.textContent = '';
            if (pctEl) pctEl.textContent = '';
            if (barEl) barEl.innerHTML = '';
            renderPlanVencidoAlert(prefix, null);
            return;
        }

        var daysLeft = daysUntilEnd(plan.fechaFinIso);
        if (vigenciaEl) {
            vigenciaEl.innerHTML =
                'Del ' + formatDateLongEs(plan.fechaInicioIso) + ' al ' + formatDateLongEs(plan.fechaFinIso) +
                ' - tu plan termina en <strong>' + daysLeft + ' días</strong>';
        }
        if (descEl) {
            descEl.textContent = tabId === 'competencias' ? PLAN_DESC_COMPETENCIAS : PLAN_DESC_CONTENIDOS;
        }
        if (statusEl) {
            statusEl.className = 'ubits-status-tag ubits-status-tag--' + getEstadoTagVariant(plan.estado) + ' ubits-status-tag--sm';
            var textEl = statusEl.querySelector('.ubits-status-tag__text');
            if (textEl) textEl.textContent = plan.estado || 'Vigente';
        }

        var pct = 0;
        if (tabId === 'competencias') {
            var mins = getCompetenciaProgressMinutes(plan);
            if (countEl) countEl.textContent = mins.doneMin + ' de ' + mins.totalMin + ' minutos';
            pct = mins.pct;
        } else {
            var prog = getContenidosProgressCount(plan);
            if (countEl) countEl.textContent = prog.done + ' de ' + prog.total + ' contenidos';
            pct = prog.pct;
        }
        if (pctEl) pctEl.textContent = pct + ' %';
        if (barEl && typeof progressBarHtml === 'function') {
            barEl.innerHTML = progressBarHtml({
                value: pct,
                size: 'lg',
                rounded: true,
                track: 'subtle',
                ariaLabel: 'Progreso del plan'
            });
        }
        renderPlanVencidoAlert(prefix, plan);
    }

    function resetPlanSelect(tabId) {
        var containerId = tabId === 'competencias' ? 'zona-estudio-comp-plan-select' : 'zona-estudio-plan-select';
        var container = document.getElementById(containerId);
        if (container) container.innerHTML = '';
        state.planSelectReady[tabId] = false;
    }

    function initPlanSelect(tabId) {
        if (state.planSelectReady[tabId] || typeof createInput !== 'function') return;
        var plans = getPlansForTab(tabId);
        var containerId = tabId === 'competencias' ? 'zona-estudio-comp-plan-select' : 'zona-estudio-plan-select';
        if (!plans.length) return;

        createInput({
            containerId: containerId,
            type: 'select',
            label: 'Filtrar por plan',
            placeholder: 'Seleccionar plan',
            size: 'md',
            value: getSelectedPlanId(tabId),
            selectOptions: plans.map(function (p) {
                return buildPlanSelectOption(p, tabId);
            }),
            onChange: function (val) {
                state.selectedPlanByTab[tabId] = val || plans[0].id;
                var prefix = tabId === 'competencias' ? 'zona-estudio-comp' : 'zona-estudio';
                renderPlanHeader(prefix, tabId);
                if (tabId === 'contenidos') {
                    applyFilters();
                    renderCards();
                    updateResultsCount();
                } else {
                    renderCompetenciaBlocks();
                }
            }
        });
        state.planSelectReady[tabId] = true;
    }

    function updateResultsCount() {
        var el = document.getElementById('zona-estudio-results-count');
        if (el) el.textContent = formatIndicatorNumber(state.filteredContents.length);
    }

    function renderCards() {
        var grid = document.getElementById('zona-estudio-cards-grid');
        var empty = document.getElementById('zona-estudio-empty-state');
        if (!grid) return;

        if (!state.filteredContents.length) {
            grid.style.display = 'none';
            grid.innerHTML = '';
            if (empty) {
                empty.style.display = 'flex';
                if (typeof loadEmptyState === 'function') {
                    loadEmptyState('zona-estudio-empty-state', {
                        icon: 'fa-search',
                        iconSize: 'lg',
                        title: 'No se encontraron resultados',
                        description: state.searchQuery
                            ? 'Intenta ajustar tu búsqueda.'
                            : 'Intenta ajustar tu búsqueda o filtros para encontrar lo que buscas.',
                        buttons: state.searchQuery ? {
                            secondary: {
                                text: 'Limpiar búsqueda',
                                icon: 'fa-times',
                                onClick: function () {}
                            }
                        } : undefined
                    });
                    setTimeout(function () {
                        var btn = empty.querySelector('.ubits-button--secondary');
                        if (btn) {
                            btn.onclick = function (e) {
                                e.preventDefault();
                                if (typeof window.clearZonaEstudioSearch === 'function') {
                                    window.clearZonaEstudioSearch();
                                }
                            };
                        }
                    }, 50);
                }
            }
            updateResultsCount();
            return;
        }

        if (empty) {
            empty.style.display = 'none';
            empty.innerHTML = '';
        }
        grid.style.display = 'grid';

        if (typeof loadCardContent === 'function') {
            loadCardContent('zona-estudio-cards-grid', state.filteredContents);
        }
        updateResultsCount();
    }

    function escapeHtml(str) {
        return String(str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function initCompetenciaCarousel(blockEl) {
        var track = blockEl.querySelector('.zona-estudio-competencia-block__carousel');
        var prevBtn = blockEl.querySelector('.zona-estudio-competencia-block__nav--prev');
        var nextBtn = blockEl.querySelector('.zona-estudio-competencia-block__nav--next');
        var indicatorsMount = blockEl.querySelector('.zona-estudio-competencia-block__indicators');
        if (!track || !prevBtn || !nextBtn) return;

        var indicatorsApi = null;

        function getItemsToMove() {
            var windowWidth = window.innerWidth;
            if (windowWidth <= 480) return 1;
            if (windowWidth <= 768) return 2;
            if (windowWidth <= 1365) return 3;
            return 4;
        }

        function getFirstVisibleIndex() {
            var cards = track.querySelectorAll('.course-card');
            if (!cards.length) return 0;
            var containerRect = track.getBoundingClientRect();
            var containerLeft = containerRect.left;
            for (var i = 0; i < cards.length; i++) {
                var cardRect = cards[i].getBoundingClientRect();
                if (cardRect.left >= containerLeft - 10) return i;
            }
            return 0;
        }

        function scrollToCardIndex(index) {
            var cards = track.querySelectorAll('.course-card');
            if (!cards[index]) return;
            cards[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
            setTimeout(updateNav, 400);
        }

        function initIndicators() {
            if (!indicatorsMount) return;
            var cards = track.querySelectorAll('.course-card');
            indicatorsMount.innerHTML = '';
            if (cards.length <= 1 || typeof initCarouselIndicators !== 'function') return;

            indicatorsApi = initCarouselIndicators({
                container: indicatorsMount,
                count: cards.length,
                activeIndex: 0,
                ariaLabel: 'Paginación del carrusel',
                onSelect: function (index) {
                    scrollToCardIndex(index);
                }
            });
        }

        function updateIndicators() {
            if (indicatorsApi) {
                indicatorsApi.setActive(getFirstVisibleIndex());
            }
        }

        function updateNav() {
            var maxScroll = track.scrollWidth - track.clientWidth;
            prevBtn.disabled = track.scrollLeft <= 4;
            nextBtn.disabled = track.scrollLeft >= maxScroll - 4;
            updateIndicators();
        }

        function scrollToNextGroup() {
            var cards = track.querySelectorAll('.course-card');
            if (!cards.length) return;

            var itemsToMove = getItemsToMove();
            var currentIndex = getFirstVisibleIndex();
            var nextIndex = Math.min(currentIndex + itemsToMove, cards.length - 1);

            if (nextIndex >= cards.length - 1) {
                var lastCard = cards[cards.length - 1];
                var lastCardRect = lastCard.getBoundingClientRect();
                var containerRect = track.getBoundingClientRect();
                track.scrollTo({
                    left: track.scrollLeft + (lastCardRect.right - containerRect.right),
                    behavior: 'smooth'
                });
                setTimeout(updateNav, 400);
                return;
            }

            var targetCard = cards[nextIndex];
            var targetCardRect = targetCard.getBoundingClientRect();
            var containerRectNext = track.getBoundingClientRect();
            track.scrollTo({
                left: track.scrollLeft + (targetCardRect.left - containerRectNext.left),
                behavior: 'smooth'
            });
            setTimeout(updateNav, 400);
        }

        function scrollToPrevGroup() {
            var cards = track.querySelectorAll('.course-card');
            if (!cards.length) return;

            var itemsToMove = getItemsToMove();
            var currentIndex = getFirstVisibleIndex();
            var prevIndex = Math.max(0, currentIndex - itemsToMove);

            if (prevIndex === 0) {
                track.scrollTo({ left: 0, behavior: 'smooth' });
                setTimeout(updateNav, 400);
                return;
            }

            var targetCard = cards[prevIndex];
            var targetCardRect = targetCard.getBoundingClientRect();
            var containerRectPrev = track.getBoundingClientRect();
            track.scrollTo({
                left: track.scrollLeft + (targetCardRect.left - containerRectPrev.left),
                behavior: 'smooth'
            });
            setTimeout(updateNav, 400);
        }

        prevBtn.addEventListener('click', function (e) {
            e.preventDefault();
            if (prevBtn.disabled) return;
            scrollToPrevGroup();
        });
        nextBtn.addEventListener('click', function (e) {
            e.preventDefault();
            if (nextBtn.disabled) return;
            scrollToNextGroup();
        });
        track.addEventListener('scroll', updateNav, { passive: true });
        window.addEventListener('resize', updateNav);
        initIndicators();
        updateNav();
    }

    function renderCompetenciaBlocks() {
        var listEl = document.getElementById('zona-estudio-competencias-list');
        var emptyEl = document.getElementById('zona-estudio-competencias-empty');
        if (!listEl) return;

        var selectedPlan = getSelectedPlan('competencias');
        var blocks = selectedPlan ? [selectedPlan] : [];
        if (!blocks.length) {
            listEl.innerHTML = '';
            if (emptyEl) {
                emptyEl.style.display = 'flex';
                if (typeof loadEmptyState === 'function') {
                    loadEmptyState('zona-estudio-competencias-empty', {
                        icon: 'fa-bullseye',
                        iconSize: 'lg',
                        title: 'Sin competencias en este plan',
                        description: 'Selecciona un plan de competencias para ver su contenido asignado.'
                    });
                }
            }
            return;
        }

        if (emptyEl) {
            emptyEl.style.display = 'none';
            emptyEl.innerHTML = '';
        }

        var html = '';
        blocks.forEach(function (plan, blockIdx) {
            var compId = plan.competenciaId;
            var meta = competenciaMetaPorId(compId);
            var mins = getCompetenciaProgressMinutes(plan);
            var imgSrc = '../../images/imagenes competencias/' + (meta.archivoImagen || 'Liderazgo.jpg');
            var cards = buildCardsForCompetenciaBlock(plan, compId);
            var trackId = 'zona-estudio-comp-track-' + blockIdx;
            var indicatorsId = 'zona-estudio-comp-indicators-' + blockIdx;
            var barHtml = typeof progressBarHtml === 'function'
                ? progressBarHtml({
                    value: mins.pct,
                    size: 'lg',
                    rounded: true,
                    track: 'subtle',
                    ariaLabel: 'Progreso de ' + meta.nombre
                })
                : '';

            html += '<section class="zona-estudio-competencia-block" data-plan-id="' + escapeHtml(plan.id) + '">' +
                '<div class="zona-estudio-competencia-block__head">' +
                    '<div class="zona-estudio-competencia-block__identity">' +
                        '<img class="zona-estudio-competencia-block__icon" src="' + escapeHtml(imgSrc) + '" alt="" width="50" height="50" />' +
                        '<div class="zona-estudio-competencia-block__meta">' +
                            '<h3 class="ubits-body-md-bold zona-estudio-competencia-block__title">' + escapeHtml(meta.nombre) + '</h3>' +
                            '<div class="zona-estudio-competencia-block__progress-row">' +
                                '<span class="ubits-body-sm-regular zona-estudio-competencia-block__progress-count">' +
                                    mins.doneMin + ' de ' + mins.totalMin + ' minutos</span>' +
                                '<span class="ubits-body-sm-bold zona-estudio-competencia-block__progress-pct">' + mins.pct + ' %</span>' +
                            '</div>' +
                            '<div class="zona-estudio-competencia-block__progress-bar">' + barHtml + '</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="zona-estudio-competencia-block__nav-group">' +
                        '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm ubits-button--icon-only zona-estudio-competencia-block__nav zona-estudio-competencia-block__nav--prev" data-tooltip="Anterior" data-tooltip-delay="1000" aria-label="Anterior">' +
                            '<i class="far fa-chevron-left"></i>' +
                        '</button>' +
                        '<button type="button" class="ubits-button ubits-button--secondary ubits-button--sm ubits-button--icon-only zona-estudio-competencia-block__nav zona-estudio-competencia-block__nav--next" data-tooltip="Siguiente" data-tooltip-delay="1000" aria-label="Siguiente">' +
                            '<i class="far fa-chevron-right"></i>' +
                        '</button>' +
                    '</div>' +
                '</div>' +
                '<div class="zona-estudio-competencia-block__carousel" id="' + trackId + '"></div>' +
                '<div class="zona-estudio-competencia-block__indicators" id="' + indicatorsId + '"></div>' +
            '</section>';
        });

        listEl.innerHTML = html;

        blocks.forEach(function (plan, blockIdx) {
            var trackId = 'zona-estudio-comp-track-' + blockIdx;
            var cards = buildCardsForCompetenciaBlock(plan, plan.competenciaId);
            if (typeof loadCardContent === 'function' && cards.length) {
                loadCardContent(trackId, cards);
            }
            var blockEl = listEl.querySelector('[data-plan-id="' + plan.id + '"]');
            if (blockEl) initCompetenciaCarousel(blockEl);
        });

        if (typeof initTooltip === 'function') {
            initTooltip('#zona-estudio-competencias-list [data-tooltip]');
        }
    }

    function setupSearch() {
        var toggle = document.getElementById('zona-estudio-search-toggle');
        var inline = document.getElementById('zona-estudio-search-inline');
        var group = document.getElementById('zona-estudio-search-group');
        var isOpen = false;

        window.clearZonaEstudioSearch = function () {
            state.searchQuery = '';
            applyFilters();
            renderCards();
            if (isOpen && inline && toggle) {
                inline.innerHTML = '';
                inline.style.display = 'none';
                inline.setAttribute('aria-hidden', 'true');
                toggle.style.display = 'flex';
                isOpen = false;
                if (group) group.classList.remove('zona-estudio-search-mode-active');
            }
        };

        function closeSearch() {
            if (!isOpen) return;
            inline.innerHTML = '';
            inline.style.display = 'none';
            inline.setAttribute('aria-hidden', 'true');
            toggle.style.display = 'flex';
            isOpen = false;
            if (group) group.classList.remove('zona-estudio-search-mode-active');
            state.searchQuery = '';
            applyFilters();
            renderCards();
        }

        if (!toggle || !inline) return;

        toggle.addEventListener('click', function (e) {
            e.stopPropagation();
            if (isOpen || typeof createInput !== 'function') return;
            toggle.style.display = 'none';
            inline.style.display = 'flex';
            inline.removeAttribute('aria-hidden');
            if (group) group.classList.add('zona-estudio-search-mode-active');
            createInput({
                containerId: 'zona-estudio-search-inline',
                type: 'search',
                placeholder: 'Buscar contenidos...',
                size: 'sm',
                onChange: function (val) {
                    state.searchQuery = val || '';
                    applyFilters();
                    renderCards();
                }
            });
            isOpen = true;
            setTimeout(function () {
                var input = inline.querySelector('input');
                if (input) input.focus();
            }, 80);
            if (typeof initTooltip === 'function') {
                initTooltip('#zona-estudio-toolbar [data-tooltip]');
            }
        });

        document.addEventListener('click', function (e) {
            if (!isOpen) return;
            if (e.target.closest && e.target.closest('#zona-estudio-filter-btn')) return;
            var inside = inline.contains(e.target) || toggle.contains(e.target);
            if (!inside && !state.searchQuery.trim()) closeSearch();
        });
    }

    function parseTabFromHash() {
        var hash = (location.hash || '').replace(/^#/, '').toLowerCase();
        if (TAB_IDS.indexOf(hash) >= 0) return hash;
        return 'progreso';
    }

    function updateHash(tabId) {
        var next = '#' + tabId;
        if (location.hash !== next) {
            if (history.replaceState) {
                history.replaceState(null, '', next);
            } else {
                location.hash = next;
            }
        }
    }

    function refreshActiveTabContent() {
        if (state.activeTab === 'contenidos') {
            resetPlanSelect('contenidos');
            initPlanSelect('contenidos');
            renderPlanHeader('zona-estudio', 'contenidos');
            applyFilters();
            renderCards();
        } else if (state.activeTab === 'competencias') {
            resetPlanSelect('competencias');
            initPlanSelect('competencias');
            renderPlanHeader('zona-estudio-comp', 'competencias');
            renderCompetenciaBlocks();
        }
    }

    function setActiveTab(tabId, opts) {
        opts = opts || {};
        if (TAB_IDS.indexOf(tabId) < 0) tabId = 'progreso';
        state.activeTab = tabId;

        var tabsRoot = document.getElementById('zona-estudio-tabs');
        if (tabsRoot) {
            tabsRoot.querySelectorAll('.ubits-tab[data-tab-id]').forEach(function (btn) {
                var active = btn.getAttribute('data-tab-id') === tabId;
                btn.classList.toggle('ubits-tab--active', active);
                btn.setAttribute('aria-selected', active ? 'true' : 'false');
            });
        }

        TAB_IDS.forEach(function (id) {
            var panel = document.getElementById('zona-estudio-panel-' + id);
            if (!panel) return;
            if (id === tabId) {
                panel.hidden = false;
                panel.removeAttribute('hidden');
            } else {
                panel.hidden = true;
            }
        });

        if (tabId === 'contenidos' || tabId === 'competencias') {
            refreshActiveTabContent();
        } else if (tabId === 'exclusivo') {
            renderExclusivoTab();
        } else if (tabId === 'historial') {
            renderHistorialTab();
        } else if (tabId === 'progreso') {
            if (typeof window.renderZonaEstudioProgresoTab === 'function') {
                window.renderZonaEstudioProgresoTab();
            }
        }

        if (!opts.skipHash) updateHash(tabId);

        if (typeof initUbitsTabsScroll === 'function') {
            initUbitsTabsScroll(document.getElementById('zona-estudio-tabs'));
        }
    }

    function setupTabs() {
        var tabsRoot = document.getElementById('zona-estudio-tabs');
        if (!tabsRoot) return;
        tabsRoot.querySelectorAll('.ubits-tab[data-tab-id]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                setActiveTab(btn.getAttribute('data-tab-id') || 'progreso');
            });
        });
        if (typeof initUbitsTabsScroll === 'function') {
            initUbitsTabsScroll(tabsRoot);
        }
        window.addEventListener('hashchange', function () {
            var tab = parseTabFromHash();
            if (tab !== state.activeTab) setActiveTab(tab, { skipHash: true });
        });
    }

    window.initZonaEstudioPage = function () {
        loadPlanesFromBd();
        setupSearch();
        setupExclusivoSearch();
        setupHistorialSearch();
        setupHistorialViewToggle();
        setupTabs();
        setActiveTab(parseTabFromHash(), { skipHash: true });
        updateHash(state.activeTab);

        window.zonaEstudioNavigateToPlan = function (planId, tipo) {
            var tabId = tipo === 'competencias' ? 'competencias' : 'contenidos';
            state.selectedPlanByTab[tabId] = planId || '';
            resetPlanSelect(tabId);
            setActiveTab(tabId);
        };

        if (typeof initTooltip === 'function') {
            initTooltip('#zona-estudio-toolbar [data-tooltip]');
        }
    };
})();
