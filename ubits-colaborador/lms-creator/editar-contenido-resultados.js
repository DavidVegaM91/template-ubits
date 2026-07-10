/**
 * LMS Creator — sección Resultados (editar-contenido.html)
 * Tablas vía createUbitsDataTable (spec contexto-edicion-contenidos.md).
 */
(function () {
    'use strict';

    var PERIODO_OPTS = {
        '30': { label: 'Últimos 30 días', slug: 'ultimos-30-dias' },
        '90': { label: 'Últimos 3 meses', slug: 'ultimos-3-meses' },
        '180': { label: 'Últimos 6 meses', slug: 'ultimos-6-meses' },
        '365': { label: 'Último año', slug: 'ultimo-ano' },
        'ano-actual': { label: 'Año actual', slug: 'ano-actual' }
    };

    var KPI_INFO_TOOLTIP_TEXT = 'Mide el porcentaje de personas que completaron todo el contenido.';

    var RESULTADOS_TAB_IDS = {
        progreso: true,
        evaluaciones: true,
        'gestion-intentos': true
    };

    function parseResultadosTabFromHash(hash) {
        var h = String(hash || '').replace(/^#/, '');
        if (h === 'resultados') return 'progreso';
        if (h.indexOf('resultados-') === 0) {
            var slug = h.slice('resultados-'.length);
            if (RESULTADOS_TAB_IDS[slug]) return slug;
        }
        return 'progreso';
    }

    function buildResultadosHash(tab) {
        return '#resultados-' + (tab || 'progreso');
    }

    function parseEditarContenidoHash(hash) {
        var h = String(hash || '').replace(/^#/, '');
        var resultadosTab = parseResultadosTabFromHash(hash);
        if (h === 'informacion' || h === 'portada') {
            return { section: 'informacion', resultadosTab: 'progreso' };
        }
        if (h === 'recursos') return { section: 'recursos', resultadosTab: 'progreso' };
        if (h === 'certificado') return { section: 'certificado', resultadosTab: 'progreso' };
        if (h === 'visibilidad' || h === 'publicacion') {
            return { section: 'visibilidad', resultadosTab: 'progreso' };
        }
        if (h === 'resultados' || h.indexOf('resultados-') === 0) {
            return { section: 'resultados', resultadosTab: resultadosTab };
        }
        return { section: 'resultados', resultadosTab: 'progreso' };
    }

    function resolveEditarContenidoHashForSection(section, currentHash) {
        var parsed = parseEditarContenidoHash(currentHash);
        if (section === 'resultados') {
            if (parsed.section === 'resultados') {
                return buildResultadosHash(parsed.resultadosTab);
            }
            return buildResultadosHash('progreso');
        }
        var HASH_SECTION = {
            resultados: '#resultados',
            informacion: '#informacion',
            recursos: '#recursos',
            certificado: '#certificado',
            visibilidad: '#visibilidad'
        };
        return HASH_SECTION[section] || '#resultados-progreso';
    }

    function applyResultadosTabUi(tabId) {
        var mount = document.getElementById('editar-contenido-resultados-mount');
        if (!mount) return;
        state.activeTab = tabId;
        mount.querySelectorAll('[data-ec-tab]').forEach(function (b) {
            b.classList.toggle('ubits-tab--active', b.getAttribute('data-ec-tab') === tabId);
        });
        mount.querySelectorAll('[data-ec-panel]').forEach(function (p) {
            p.classList.toggle('is-active', p.getAttribute('data-ec-panel') === tabId);
        });
    }

    function syncEditarContenidoResultadosTab(tabId) {
        var nextTab = RESULTADOS_TAB_IDS[tabId] ? tabId : 'progreso';
        applyResultadosTabUi(nextTab);
    }

    function updateResultadosTabHash(tabId) {
        var nextHash = buildResultadosHash(tabId);
        if (window.location.hash !== nextHash) {
            history.replaceState(null, '', window.location.pathname + window.location.search + nextHash);
        }
    }

    var state = {
        contentId: '',
        contentTitle: '',
        visibilidadLabel: 'Público',
        periodo: '30',
        activeTab: 'progreso',
        bloqueos: [],
        tables: {
            progreso: null,
            evaluaciones: null,
            gestion: null
        }
    };

    function formatIndicatorNumber(n) {
        var num = Number(n);
        if (!isFinite(num)) return '0';
        if (num >= 1000000) return (Math.round((num / 1000000) * 10) / 10).toLocaleString('es-CO') + ' M';
        if (num >= 10000) return (Math.round((num / 1000) * 10) / 10).toLocaleString('es-CO') + ' K';
        return num.toLocaleString('es-CO');
    }

    function escapeHtml(s) {
        return String(s != null ? s : '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function formatDateLong(iso) {
        if (!iso) return '—';
        try {
            var d = new Date(iso + 'T12:00:00');
            return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
        } catch (e) {
            return iso;
        }
    }

    function formatDateTableCell(iso) {
        if (!iso) return '—';
        if (typeof window.formatDateDDMmmAAAA === 'function') {
            return window.formatDateDDMmmAAAA(iso) || '—';
        }
        return iso;
    }

    function getResultadosRecord(contentId) {
        var db = window.BD_RESULTADOS_CONTENIDO || {};
        return db[String(contentId)] || {
            fechaPublicacion: null,
            evaluaciones: [],
            estudiantes: [],
            bloqueos: []
        };
    }

    function getPeriodBounds() {
        var end = new Date();
        end.setHours(23, 59, 59, 999);
        var start = new Date(end);
        if (state.periodo === 'ano-actual') {
            start = new Date(end.getFullYear(), 0, 1);
            start.setHours(0, 0, 0, 0);
        } else {
            var days = parseInt(state.periodo, 10);
            if (isNaN(days)) return { start: null, end: end };
            start.setDate(start.getDate() - (days - 1));
            start.setHours(0, 0, 0, 0);
        }
        return { start: start, end: end };
    }

    function filterByPeriod(isoDate) {
        if (!isoDate) return true;
        var bounds = getPeriodBounds();
        if (!bounds.start) return true;
        var d = new Date(isoDate + 'T12:00:00');
        return d >= bounds.start && d <= bounds.end;
    }

    function resolveAvatarByEmail(email) {
        var db = window.BD_MASTER_COLABORADORES;
        if (!db || !Array.isArray(db.colaboradores)) return null;
        var emailL = String(email || '').toLowerCase();
        for (var i = 0; i < db.colaboradores.length; i++) {
            var c = db.colaboradores[i];
            if (c.username && String(c.username).toLowerCase() === emailL) {
                return c.avatar || null;
            }
        }
        return null;
    }

    function getEstudiantesFiltrados(record) {
        return (record.estudiantes || [])
            .filter(function (e) {
                return filterByPeriod(e.fechaInicio);
            })
            .map(function (e, idx) {
                return Object.assign(
                    {
                        id: e.email || 'est-' + idx,
                        avatar: e.avatar || resolveAvatarByEmail(e.email)
                    },
                    e
                );
            });
    }

    function getBloqueosFiltrados() {
        return state.bloqueos
            .filter(function (b) {
                return filterByPeriod(b.fechaBloqueo);
            })
            .map(function (b) {
                return Object.assign(
                    {
                        avatar: b.avatar || resolveAvatarByEmail(b.email)
                    },
                    b
                );
            });
    }

    function computeFinalPonderada(est, evaluaciones) {
        var sumPeso = 0;
        var sumScore = 0;
        (evaluaciones || []).forEach(function (ev) {
            var cell = est.evaluaciones && est.evaluaciones[ev.id];
            if (!cell || cell.estado === 'Pendiente') return;
            var peso = Number(ev.peso) || 0;
            var pct = Number(cell.percent);
            if (!isFinite(pct)) return;
            sumPeso += peso;
            sumScore += (pct * peso) / 100;
        });
        if (sumPeso <= 0) return null;
        return Math.round((sumScore / sumPeso) * 100 * 10) / 10;
    }

    function evalCellText(cell) {
        if (!cell || cell.estado === 'Pendiente') return 'Pendiente';
        return (
            cell.estado +
            ' con ' +
            cell.percent +
            '% (' +
            cell.correctas +
            ' de ' +
            cell.total +
            ' preguntas)'
        );
    }

    function evalCellHtml(cell) {
        if (!cell || cell.estado === 'Pendiente') {
            return '<span class="ubits-body-sm-regular"><strong>Pendiente</strong></span>';
        }
        return (
            '<span class="ubits-body-sm-regular"><strong>' +
            escapeHtml(cell.estado) +
            '</strong> con ' +
            escapeHtml(String(cell.percent)) +
            '% <span class="ubits-body-xs-regular">(' +
            escapeHtml(String(cell.correctas)) +
            ' de ' +
            escapeHtml(String(cell.total)) +
            ' preguntas)</span></span>'
        );
    }

    function buildUsuarioCellHtml(row) {
        var nombre = row.nombre || '';
        var avatarUrl = row.avatar && String(row.avatar).trim() ? String(row.avatar) : '';
        return (
            '<div class="editar-contenido-resultados__usuario-cell">' +
            (avatarUrl
                ? '<span class="ubits-avatar ubits-avatar--sm"><img src="' +
                  escapeHtml(avatarUrl) +
                  '" alt="' +
                  escapeHtml(nombre) +
                  '" class="ubits-avatar__img"></span>'
                : '<span class="ubits-avatar ubits-avatar--sm"><span class="ubits-avatar__fallback"><i class="far fa-user"></i></span></span>') +
            '<span class="ubits-body-sm-regular">' +
            escapeHtml(nombre) +
            '</span></div>'
        );
    }

    function visibilidadToTagModifier(label) {
        var v = String(label || '').toLowerCase();
        if (v === 'público' || v === 'publico' || v === 'publicado') return 'success';
        if (v === 'privado') return 'warning';
        if (v === 'oculto' || v === 'archivado') return 'neutral';
        return 'info';
    }

    function periodoSlug() {
        var o = PERIODO_OPTS[state.periodo];
        return o ? o.slug : 'ultimos-30-dias';
    }

    function exportCsv(filename, headers, rows) {
        var lines = [headers.join(',')];
        rows.forEach(function (row) {
            lines.push(
                row
                    .map(function (cell) {
                        var s = String(cell != null ? cell : '');
                        if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
                        return s;
                    })
                    .join(',')
            );
        });
        var blob = new Blob(['\ufeff' + lines.join('\n')], { type: 'text/csv;charset=utf-8' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        a.click();
        setTimeout(function () {
            URL.revokeObjectURL(a.href);
        }, 500);
    }

    function exportProgresoCsv() {
        var record = getResultadosRecord(state.contentId);
        var table = state.tables.progreso;
        var rows = table && typeof table.getVisibleRows === 'function' ? table.getVisibleRows() : getEstudiantesFiltrados(record);
        exportCsv(
            'progreso-' + state.contentId + '-' + periodoSlug() + '.csv',
            ['Nombre del usuario', 'Email', 'Fecha de inicio', 'Fecha de finalización', 'Progreso'],
            rows.map(function (e) {
                return [
                    e.nombre,
                    e.email,
                    formatDateTableCell(e.fechaInicio),
                    e.fechaFin ? formatDateTableCell(e.fechaFin) : 'No ha finalizado',
                    String(e.progresoPercent || 0) + '%'
                ];
            })
        );
    }

    function exportEvaluacionesCsv() {
        var record = getResultadosRecord(state.contentId);
        var evals = record.evaluaciones || [];
        var table = state.tables.evaluaciones;
        var rows = table && typeof table.getVisibleRows === 'function' ? table.getVisibleRows() : getEstudiantesFiltrados(record);
        var headers = ['Nombre del usuario']
            .concat(evals.map(function (ev) { return ev.nombre + ' (' + ev.peso + '%)'; }))
            .concat(['Final ponderada']);
        exportCsv(
            'evaluaciones-' + state.contentId + '-' + periodoSlug() + '.csv',
            headers,
            rows.map(function (e) {
                var row = [e.nombre];
                evals.forEach(function (ev) {
                    row.push(evalCellText(e.evaluaciones && e.evaluaciones[ev.id]));
                });
                var fp = computeFinalPonderada(e, evals);
                row.push(fp != null ? fp + '%' : '—');
                return row;
            })
        );
    }

    function exportGestionCsv() {
        var table = state.tables.gestion;
        var rows = table && typeof table.getVisibleRows === 'function' ? table.getVisibleRows() : getBloqueosFiltrados();
        exportCsv(
            'gestion-intentos-' + state.contentId + '-' + periodoSlug() + '.csv',
            ['Nombre del usuario', 'Email', 'Nombre de la evaluación', 'Fecha de bloqueo'],
            rows.map(function (b) {
                return [b.nombre, b.email, b.evaluacionNombre, formatDateTableCell(b.fechaBloqueo)];
            })
        );
    }

    function renderShell(mount) {
        var periodoLabel = PERIODO_OPTS[state.periodo].label;
        var mod = visibilidadToTagModifier(state.visibilidadLabel);
        mount.innerHTML =
            '<div class="editar-contenido-resultados">' +
            '<div class="editar-contenido-resultados__header widget--transparent">' +
            '<div class="editar-contenido-resultados__title-row">' +
            '<div class="editar-contenido-resultados__title-block">' +
            '<h2 class="ubits-heading-h2 editar-contenido-resultados__title">Resultados</h2>' +
            '<p class="ubits-body-sm-regular editar-contenido-resultados__description">Consulta los resultados, el progreso, las evaluaciones y encuestas de este contenido. La información se actualiza cada 3 horas.</p>' +
            '</div>' +
            '<button type="button" class="ubits-button ubits-button--secondary ubits-button--md" id="ec-resultados-periodo-toggle" aria-label="Período" data-tooltip="Período" data-tooltip-delay="1000">' +
            '<span id="ec-resultados-periodo-text">' +
            escapeHtml(periodoLabel) +
            '</span>' +
            '<i class="far fa-chevron-down" aria-hidden="true"></i>' +
            '</button>' +
            '</div>' +
            '</div>' +
            '<div class="editar-contenido-resultados__widget editar-contenido-resultados__widget--resumen">' +
            '<div class="editar-contenido-resultados__meta">' +
            '<div class="editar-contenido-resultados__meta-item">' +
            '<i class="far fa-users editar-contenido-resultados__meta-icon" aria-hidden="true"></i>' +
            '<span><span class="ubits-body-sm-semibold">Estudiantes inscritos</span> <span class="ubits-body-sm-regular" id="ec-resultados-inscritos">0</span></span>' +
            '</div>' +
            '<div class="editar-contenido-resultados__meta-item">' +
            '<i class="far fa-calendar editar-contenido-resultados__meta-icon" aria-hidden="true"></i>' +
            '<span><span class="ubits-body-sm-semibold">Publicado el</span> <span class="ubits-body-sm-regular" id="ec-resultados-publicado">—</span></span>' +
            '</div>' +
            '<div class="editar-contenido-resultados__meta-item editar-contenido-resultados__meta-item--visibilidad">' +
            '<i class="far fa-eye editar-contenido-resultados__meta-icon" aria-hidden="true"></i>' +
            '<span><strong>Visibilidad actual:</strong> ' +
            '<span class="ubits-status-tag ubits-status-tag--sm ubits-status-tag--' +
            mod +
            '"><span class="ubits-status-tag__text">' +
            escapeHtml(state.visibilidadLabel) +
            '</span></span></span>' +
            '</div>' +
            '</div>' +
            '<div class="editar-contenido-resultados__kpi-section" id="ec-resultados-kpi-row"></div>' +
            '</div>' +
            '<div class="editar-contenido-resultados__widget editar-contenido-resultados__widget--detalle">' +
            '<div class="editar-contenido-resultados__tabs-bar">' +
            '<div class="ubits-tabs-on-bg" id="ec-resultados-tabs" role="tablist">' +
            '<button type="button" class="ubits-tab ubits-tab--sm ubits-tab--active" data-ec-tab="progreso" role="tab"><span>Progreso</span></button>' +
            '<button type="button" class="ubits-tab ubits-tab--sm" data-ec-tab="evaluaciones" role="tab"><span>Evaluaciones</span></button>' +
            '<button type="button" class="ubits-tab ubits-tab--sm" data-ec-tab="gestion-intentos" role="tab"><span>Gestión de intentos</span></button>' +
            '</div>' +
            '</div>' +
            '<div class="editar-contenido-resultados__widget-body">' +
            '<div id="ec-resultados-panel-progreso" class="editar-contenido-resultados__tab-panel is-active" data-ec-panel="progreso">' +
            '<div id="ec-progreso-dt-container"></div></div>' +
            '<div id="ec-resultados-panel-evaluaciones" class="editar-contenido-resultados__tab-panel" data-ec-panel="evaluaciones">' +
            '<div id="ec-eval-dt-container"></div></div>' +
            '<div id="ec-resultados-panel-gestion-intentos" class="editar-contenido-resultados__tab-panel" data-ec-panel="gestion-intentos">' +
            '<p class="editar-contenido-resultados__intro-text ubits-body-sm-regular">Desbloquear otorga 1 intento más a cada usuario.</p>' +
            '<div id="ec-gestion-dt-container"></div></div>' +
            '</div>' +
            '</div>' +
            '</div>';
    }

    function renderKpi(record) {
        var estudiantes = getEstudiantesFiltrados(record);
        var total = estudiantes.length;
        var completados = estudiantes.filter(function (e) {
            return e.fechaFin != null && String(e.fechaFin).trim() !== '';
        }).length;
        var pct = total > 0 ? Math.round((completados / total) * 100) : 0;
        var row = document.getElementById('ec-resultados-kpi-row');
        if (!row) return;
        var barHtml =
            typeof window.progressBarHtml === 'function'
                ? window.progressBarHtml({
                      value: pct,
                      size: 'lg',
                      rounded: true,
                      track: 'subtle',
                      id: 'ec-resultados-finalizacion-bar',
                      ariaLabel: 'Finalización del contenido'
                  })
                : '<span>' + pct + '%</span>';
        row.innerHTML =
            '<div class="editar-contenido-resultados__kpi editar-contenido-resultados__kpi--finalizacion">' +
            '<div class="editar-contenido-resultados__kpi-content">' +
            '<span class="ubits-body-sm-semibold editar-contenido-resultados__kpi-label">Finalización</span>' +
            '<div class="editar-contenido-resultados__kpi-bar">' +
            barHtml +
            '</div>' +
            '<div class="editar-contenido-resultados__kpi-stats">' +
            '<span class="ubits-body-sm-regular editar-contenido-resultados__kpi-ratio">' +
            formatIndicatorNumber(completados) +
            '/' +
            formatIndicatorNumber(total) +
            '</span>' +
            '<span class="editar-contenido-resultados__kpi-divider" aria-hidden="true"></span>' +
            '<span class="editar-contenido-resultados__kpi-percent">' +
            pct +
            '%</span>' +
            '</div>' +
            '</div>' +
            '<button type="button" class="ubits-button ubits-button--tertiary ubits-button--sm ubits-button--icon-only editar-contenido-resultados__kpi-info-btn" id="ec-resultados-kpi-info" aria-label="' +
            escapeHtml(KPI_INFO_TOOLTIP_TEXT) +
            '"><i class="far fa-circle-info" aria-hidden="true"></i></button>' +
            '</div>';
        var ins = document.getElementById('ec-resultados-inscritos');
        if (ins) ins.textContent = formatIndicatorNumber(total);
        var pub = document.getElementById('ec-resultados-publicado');
        if (pub) pub.textContent = formatDateLong(record.fechaPublicacion);
        wireKpiFinalizacionInfoTooltip();
    }

    function wireKpiFinalizacionInfoTooltip() {
        var btn = document.getElementById('ec-resultados-kpi-info');
        if (!btn || typeof window.showTooltip !== 'function' || typeof window.hideTooltip !== 'function') return;

        if (btn._ecKpiTooltipCleanup) {
            btn._ecKpiTooltipCleanup();
            btn._ecKpiTooltipCleanup = null;
        }

        var autoHideTimer = null;
        var outsideHandler = null;

        function clearAutoHide() {
            if (autoHideTimer) {
                clearTimeout(autoHideTimer);
                autoHideTimer = null;
            }
        }

        function removeOutsideListener() {
            if (outsideHandler) {
                document.removeEventListener('click', outsideHandler, true);
                outsideHandler = null;
            }
        }

        function hideKpiInfoTooltip() {
            clearAutoHide();
            removeOutsideListener();
            window.hideTooltip();
        }

        function showKpiInfoTooltip() {
            hideKpiInfoTooltip();
            window.showTooltip(btn, KPI_INFO_TOOLTIP_TEXT, {
                position: 'top',
                align: 'center',
                delay: 0,
                duration: 0
            });
            autoHideTimer = setTimeout(hideKpiInfoTooltip, 3000);
            setTimeout(function () {
                outsideHandler = function (docEv) {
                    if (btn.contains(docEv.target)) return;
                    hideKpiInfoTooltip();
                };
                document.addEventListener('click', outsideHandler, true);
            }, 0);
        }

        function onClick(ev) {
            ev.preventDefault();
            ev.stopPropagation();
            showKpiInfoTooltip();
        }

        function onKeydown(ev) {
            if (ev.key !== 'Enter' && ev.key !== ' ') return;
            ev.preventDefault();
            showKpiInfoTooltip();
        }

        btn.addEventListener('click', onClick);
        btn.addEventListener('keydown', onKeydown);

        btn._ecKpiTooltipCleanup = function () {
            hideKpiInfoTooltip();
            btn.removeEventListener('click', onClick);
            btn.removeEventListener('keydown', onKeydown);
        };
    }

    function initProgresoTable() {
        if (typeof window.createUbitsDataTable !== 'function') return;
        state.tables.progreso = window.createUbitsDataTable({
            containerId: 'ec-progreso-dt-container',
            tableId: 'ec-progreso-table',
            title: 'Progreso',
            columns: [
                { id: 'usuario', label: 'Nombre del usuario', sortable: true },
                { id: 'email', label: 'Email' },
                { id: 'fecha-inicio', label: 'Fecha de inicio', sortable: true, sortType: 'date' },
                { id: 'fecha-fin', label: 'Fecha de finalización', sortable: true, sortType: 'date' },
                { id: 'progreso', label: 'Progreso', sortable: true, sortType: 'number' }
            ],
            getData: function () {
                return getEstudiantesFiltrados(getResultadosRecord(state.contentId));
            },
            rowIdField: 'id',
            buildRowHtml: function (row) {
                var progCell =
                    typeof window.tableProgressCellHtml === 'function'
                        ? window.tableProgressCellHtml(row.progresoPercent || 0)
                        : '<span class="ubits-body-sm-regular">' + escapeHtml(String(row.progresoPercent || 0) + '%') + '</span>';
                return (
                    '<td data-col="usuario">' + buildUsuarioCellHtml(row) + '</td>' +
                    '<td data-col="email"><span class="ubits-body-sm-regular">' + escapeHtml(row.email) + '</span></td>' +
                    '<td data-col="fecha-inicio" data-date="' + escapeHtml(row.fechaInicio || '') + '"><span class="ubits-body-sm-regular">' +
                    escapeHtml(formatDateTableCell(row.fechaInicio)) +
                    '</span></td>' +
                    '<td data-col="fecha-fin" data-date="' + escapeHtml(row.fechaFin || '') + '"><span class="ubits-body-sm-regular">' +
                    escapeHtml(row.fechaFin ? formatDateTableCell(row.fechaFin) : 'No ha finalizado') +
                    '</span></td>' +
                    '<td data-col="progreso">' + progCell + '</td>'
                );
            },
            features: { search: true, resultsCount: true },
            searchColumnIds: ['usuario', 'email'],
            i18n: { buscarPlaceholder: 'Busca un estudiante' },
            primaryButton: {
                text: 'Descargar',
                icon: 'fa-download',
                variant: 'secondary',
                onClick: exportProgresoCsv
            },
            emptyState: {
                message: 'No se encontraron resultados',
                icon: 'far fa-search',
                description: 'Aún no hay estudiantes inscritos en este contenido para el periodo seleccionado.'
            }
        });
    }

    function initEvaluacionesTable(record) {
        if (typeof window.createUbitsDataTable !== 'function') return;
        var evals = record.evaluaciones || [];
        var columns = [{ id: 'usuario', label: 'Nombre del usuario', sortable: true }];
        evals.forEach(function (ev) {
            columns.push({
                id: 'eval-' + ev.id,
                label: ev.nombre + ' (' + ev.peso + '%)',
                labelHtml:
                    escapeHtml(ev.nombre) +
                    ' <span class="ubits-body-xs-regular">(' +
                    escapeHtml(String(ev.peso)) +
                    '%)</span>'
            });
        });
        columns.push({ id: 'final-ponderada', label: 'Final ponderada', sortable: true, sortType: 'number' });

        state.tables.evaluaciones = window.createUbitsDataTable({
            containerId: 'ec-eval-dt-container',
            tableId: 'ec-eval-table',
            title: 'Evaluaciones',
            columns: columns,
            getData: function () {
                return getEstudiantesFiltrados(getResultadosRecord(state.contentId));
            },
            rowIdField: 'id',
            buildRowHtml: function (row) {
                var html = '<td data-col="usuario">' + buildUsuarioCellHtml(row) + '</td>';
                evals.forEach(function (ev) {
                    var cell = row.evaluaciones && row.evaluaciones[ev.id];
                    html +=
                        '<td data-col="eval-' +
                        escapeHtml(ev.id) +
                        '">' +
                        evalCellHtml(cell) +
                        '</td>';
                });
                var fp = computeFinalPonderada(row, evals);
                html +=
                    '<td data-col="final-ponderada"><span class="ubits-body-sm-regular">' +
                    escapeHtml(fp != null ? fp + '%' : '—') +
                    '</span></td>';
                return html;
            },
            features: { search: true, resultsCount: true },
            searchColumnIds: ['usuario'],
            i18n: { buscarPlaceholder: 'Busca un estudiante' },
            primaryButton: {
                text: 'Descargar',
                icon: 'fa-download',
                variant: 'secondary',
                onClick: exportEvaluacionesCsv
            },
            emptyState: {
                message: 'No se encontraron resultados',
                icon: 'far fa-search',
                description: 'Aún no hay datos de evaluaciones para el periodo seleccionado.'
            }
        });
    }

    function updateGestionActionBar(selectedIds) {
        var container = document.getElementById('ec-gestion-dt-container');
        if (!container) return;
        var bar = container.querySelector('.ubits-dt-action-bar');
        if (!bar) return;
        var n = selectedIds ? selectedIds.length : 0;
        bar.classList.toggle('ec-gestion-action-bar--multi', n >= 2);
        var span = bar.querySelector('[data-action="desbloquear"] span');
        if (span) span.textContent = 'Desbloquear (' + formatIndicatorNumber(n) + ')';
    }

    function initGestionTable() {
        if (typeof window.createUbitsDataTable !== 'function') return;
        state.tables.gestion = window.createUbitsDataTable({
            containerId: 'ec-gestion-dt-container',
            tableId: 'ec-gestion-table',
            title: 'Gestión de intentos',
            columns: [
                { id: 'usuario', label: 'Nombre del usuario', sortable: true },
                { id: 'email', label: 'Email' },
                { id: 'evaluacion', label: 'Nombre de la evaluación' },
                { id: 'fecha-bloqueo', label: 'Fecha de bloqueo', sortable: true, sortType: 'date' },
                { id: 'acciones', label: 'Acciones' }
            ],
            getData: function () {
                return getBloqueosFiltrados();
            },
            rowIdField: 'id',
            buildRowHtml: function (row) {
                return (
                    '<td data-col="usuario">' + buildUsuarioCellHtml(row) + '</td>' +
                    '<td data-col="email"><span class="ubits-body-sm-regular">' + escapeHtml(row.email) + '</span></td>' +
                    '<td data-col="evaluacion"><span class="ubits-body-sm-regular">' + escapeHtml(row.evaluacionNombre) + '</span></td>' +
                    '<td data-col="fecha-bloqueo" data-date="' + escapeHtml(row.fechaBloqueo || '') + '"><span class="ubits-body-sm-regular">' +
                    escapeHtml(formatDateTableCell(row.fechaBloqueo)) +
                    '</span></td>' +
                    '<td data-col="acciones">' +
                    '<button type="button" class="ubits-button ubits-button--secondary ubits-button--xs ec-desbloquear-one" data-bloqueo-id="' +
                    escapeHtml(row.id) +
                    '"><span>Desbloquear</span></button></td>'
                );
            },
            features: { checkboxes: true, search: true, actionBar: true, resultsCount: true },
            searchColumnIds: ['usuario', 'email'],
            i18n: { buscarPlaceholder: 'Busca un estudiante' },
            primaryButton: {
                text: 'Descargar',
                icon: 'fa-download',
                variant: 'secondary',
                onClick: exportGestionCsv
            },
            actionBarButtons: [
                {
                    id: 'desbloquear',
                    label: 'Desbloquear (0)',
                    icon: 'fa-unlock',
                    variant: 'secondary',
                    onClick: function (selectedIds) {
                        if (!selectedIds || selectedIds.length < 2) return;
                        openDesbloqueoModal(selectedIds, function () {
                            desbloquearIds(selectedIds);
                        });
                    }
                }
            ],
            onSelectionChange: updateGestionActionBar,
            emptyState: {
                message: 'No hay estudiantes bloqueados',
                icon: 'far fa-user-unlock',
                description:
                    'No hay estudiantes que hayan alcanzado el límite de intentos en las evaluaciones de este contenido.'
            }
        });
    }

    function initDataTables() {
        var record = getResultadosRecord(state.contentId);
        initProgresoTable();
        initEvaluacionesTable(record);
        initGestionTable();
    }

    function refreshAllTables() {
        var record = getResultadosRecord(state.contentId);
        renderKpi(record);
        ['progreso', 'evaluaciones', 'gestion'].forEach(function (key) {
            var table = state.tables[key];
            if (table && typeof table.refresh === 'function') table.refresh();
        });
        updateGestionActionBar([]);
        if (typeof window.initTooltip === 'function') {
            window.initTooltip('#editar-contenido-resultados-mount [data-tooltip]');
        }
    }

    function openDesbloqueoModal(ids, onConfirm) {
        if (typeof window.openModal !== 'function') {
            onConfirm();
            return;
        }
        var n = ids.length;
        var title = n === 1 ? '¿Desbloquear usuario?' : '¿Desbloquear usuarios?';
        var desc =
            n === 1
                ? 'Al desbloquear, se otorgará 1 intento adicional y el usuario dejará de aparecer en esta lista.'
                : 'Al desbloquear, se otorgará 1 intento adicional a cada usuario y dejarán de aparecer en esta lista.';
        var overlay = window.openModal({
            title: title,
            bodyHtml: '<p class="ubits-body-md-regular">' + escapeHtml(desc) + '</p>',
            size: 'sm',
            closeOnOverlayClick: true,
            footerHtml:
                '<button type="button" class="ubits-button ubits-button--secondary ubits-button--md" id="ec-desbloqueo-cancel"><span>Cancelar</span></button>' +
                '<button type="button" class="ubits-button ubits-button--primary ubits-button--md" id="ec-desbloqueo-confirm"><span>Desbloquear</span></button>'
        });
        var overlayId = overlay && (overlay.id || overlay);
        setTimeout(function () {
            var cancel = document.getElementById('ec-desbloqueo-cancel');
            var confirm = document.getElementById('ec-desbloqueo-confirm');
            function closeModalDesbloqueo() {
                if (typeof window.closeModal === 'function' && overlayId) window.closeModal(overlayId);
            }
            if (cancel) cancel.addEventListener('click', closeModalDesbloqueo);
            if (confirm) {
                confirm.addEventListener('click', function () {
                    closeModalDesbloqueo();
                    onConfirm();
                });
            }
        }, 0);
    }

    function desbloquearIds(ids) {
        var set = {};
        ids.forEach(function (id) {
            set[id] = true;
        });
        state.bloqueos = state.bloqueos.filter(function (b) {
            return !set[b.id];
        });
        if (typeof window.showToast === 'function') {
            window.showToast(
                'success',
                ids.length === 1 ? 'Usuario desbloqueado exitosamente' : 'Usuarios desbloqueados exitosamente'
            );
        }
        refreshAllTables();
        if (typeof window.initTooltip === 'function') {
            window.initTooltip('#editar-contenido-resultados-mount [data-tooltip]');
        }
    }

    function initPeriodoMenu() {
        var periodoBtn = document.getElementById('ec-resultados-periodo-toggle');
        var periodoText = document.getElementById('ec-resultados-periodo-text');
        if (!periodoBtn || !periodoText || typeof window.getDropdownMenuHtml !== 'function') return;

        var overlayId = 'ec-resultados-periodo-overlay';

        periodoBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            var selectedPeriodo = state.periodo;
            var options = Object.keys(PERIODO_OPTS).map(function (key) {
                return {
                    text: PERIODO_OPTS[key].label,
                    value: key,
                    selected: key === selectedPeriodo
                };
            });
            var existing = document.getElementById(overlayId);
            if (existing) existing.remove();
            var html = window.getDropdownMenuHtml({ overlayId: overlayId, options: options });
            document.body.insertAdjacentHTML('beforeend', html);
            var overlayEl = document.getElementById(overlayId);
            if (overlayEl) {
                overlayEl.querySelectorAll('.ubits-dropdown-menu__option').forEach(function (opt) {
                    opt.addEventListener('click', function () {
                        var value = this.getAttribute('data-value');
                        window.closeDropdownMenu(overlayId);
                        if (!value || !PERIODO_OPTS[value]) return;
                        state.periodo = value;
                        periodoText.textContent = PERIODO_OPTS[value].label;
                        refreshAllTables();
                    });
                });
                overlayEl.addEventListener('click', function (ev) {
                    if (ev.target === overlayEl) window.closeDropdownMenu(overlayId);
                });
            }
            window.openDropdownMenu(overlayId, periodoBtn, { alignRight: true });
        });
    }

    function wirePanelEvents() {
        var mount = document.getElementById('editar-contenido-resultados-mount');
        if (!mount || mount._ecWired) return;
        mount._ecWired = true;

        mount.addEventListener('click', function (ev) {
            var tabBtn = ev.target.closest('[data-ec-tab]');
            if (tabBtn) {
                var tabId = tabBtn.getAttribute('data-ec-tab');
                if (!tabId) return;
                applyResultadosTabUi(tabId);
                updateResultadosTabHash(tabId);
                return;
            }

            var periodoBtn = ev.target.closest('#ec-resultados-periodo-toggle');
            if (periodoBtn) return;

            var oneBtn = ev.target.closest('.ec-desbloquear-one');
            if (oneBtn) {
                var bid = oneBtn.getAttribute('data-bloqueo-id');
                openDesbloqueoModal([bid], function () {
                    desbloquearIds([bid]);
                });
            }
        });
    }

    /**
     * @param {{ contentId: string, contentTitle: string, visibilidadLabel?: string }} opts
     */
    function initEditarContenidoResultados(opts) {
        opts = opts || {};
        var mount = document.getElementById('editar-contenido-resultados-mount');
        if (!mount) return;
        state.contentId = String(opts.contentId || '');
        state.contentTitle = String(opts.contentTitle || 'Contenido');
        state.visibilidadLabel = String(opts.visibilidadLabel || 'Público');
        var record = getResultadosRecord(state.contentId);
        state.bloqueos = (record.bloqueos || []).slice();
        state.tables = { progreso: null, evaluaciones: null, gestion: null };
        mount._ecWired = false;
        renderShell(mount);
        initPeriodoMenu();
        initDataTables();
        refreshAllTables();
        wirePanelEvents();
        syncEditarContenidoResultadosTab(parseResultadosTabFromHash(window.location.hash));
        if (!window._ecResultadosHashWired) {
            window._ecResultadosHashWired = true;
            window.addEventListener('hashchange', function () {
                if (typeof window.syncEditarContenidoResultadosTab === 'function') {
                    window.syncEditarContenidoResultadosTab(
                        window.parseResultadosTabFromHash(window.location.hash)
                    );
                }
            });
        }
        if (typeof window.initTooltip === 'function') {
            window.initTooltip('#editar-contenido-resultados-mount [data-tooltip]');
        }
        if (typeof window.initUbitsTabsScroll === 'function') {
            var tabsRow = document.getElementById('ec-resultados-tabs');
            if (tabsRow) window.initUbitsTabsScroll(tabsRow);
        }
    }

    window.initEditarContenidoResultados = initEditarContenidoResultados;
    window.parseEditarContenidoHash = parseEditarContenidoHash;
    window.resolveEditarContenidoHashForSection = resolveEditarContenidoHashForSection;
    window.syncEditarContenidoResultadosTab = syncEditarContenidoResultadosTab;
    window.parseResultadosTabFromHash = parseResultadosTabFromHash;
})();
