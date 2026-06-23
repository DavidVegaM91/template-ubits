/**
 * Playground UBITS — planes de formación LMS Creator + Mi equipo.
 * Fuente única: contenidos (por área/trimestre) + competencias (corporativos por competencia/año).
 * Requiere: bd-master-colaboradores.js, bd-contenidos-ubits.js (opcional bd-master-competencias.js).
 * «Hoy» del playground: 2026-06-19. No mezclar con bd-tareas-y-planes.js.
 */
(function () {
    'use strict';

    var STORAGE_KEY = 'ubits-planes-formacion-db';
    var PLAYGROUND_TODAY = '2026-06-19';
    var HORAS_META_COMPETENCIAS = 2;

    var AREAS_LIDERES = [
        { slug: 'ventas', area: 'Ventas', leaderId: 'E002' },
        { slug: 'instalaciones', area: 'Instalaciones', leaderId: 'E003' },
        { slug: 'reparaciones', area: 'Reparaciones', leaderId: 'E004' },
        { slug: 'atencion-al-cliente', area: 'Atención al Cliente', leaderId: 'E005' },
        { slug: 'logistica', area: 'Logística', leaderId: 'E006' },
        { slug: 'administracion', area: 'Administración', leaderId: 'E007' },
        { slug: 'marketing', area: 'Marketing', leaderId: 'E008' },
        { slug: 'recursos-humanos', area: 'Recursos Humanos', leaderId: 'E052' },
        { slug: 'gerencia-general', area: 'Gerencia General', leaderId: 'E001' }
    ];

    var TRIMESTRES = [
        { key: '2025-Q1', label: 'Q1 2025', start: '2025-01-01', end: '2025-03-31' },
        { key: '2025-Q2', label: 'Q2 2025', start: '2025-04-01', end: '2025-06-30' },
        { key: '2025-Q3', label: 'Q3 2025', start: '2025-07-01', end: '2025-09-30' },
        { key: '2025-Q4', label: 'Q4 2025', start: '2025-10-01', end: '2025-12-31' },
        { key: '2026-Q1', label: 'Q1 2026', start: '2026-01-01', end: '2026-03-31' },
        { key: '2026-Q2', label: 'Q2 2026', start: '2026-04-01', end: '2026-06-30' },
        { key: '2026-Q3', label: 'Q3 2026', start: '2026-07-01', end: '2026-09-30' }
    ];

    var COMPETENCIAS_PLAYGROUND = [
        { id: 'comp-024', nombre: 'Liderazgo' },
        { id: 'comp-020', nombre: 'Inglés' },
        { id: 'comp-004', nombre: 'Comunicación' }
    ];

    var COMP_CREADORES = ['E052', 'E053', 'E054'];
    var ANIOS_COMPETENCIAS = [2025, 2026];

    function hashStr(s) {
        var h = 0;
        var str = String(s || '');
        for (var i = 0; i < str.length; i++) {
            h = ((h << 5) - h) + str.charCodeAt(i);
            h = h | 0;
        }
        return Math.abs(h);
    }

    function parseIsoDate(iso) {
        if (!iso) return null;
        var p = String(iso).trim().split('-');
        if (p.length < 3) return null;
        var d = new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10));
        return isNaN(d.getTime()) ? null : d;
    }

    function toIsoDate(d) {
        if (!d || isNaN(d.getTime())) return '';
        var y = d.getFullYear();
        var m = ('0' + (d.getMonth() + 1)).slice(-2);
        var day = ('0' + d.getDate()).slice(-2);
        return y + '-' + m + '-' + day;
    }

    function isoToDisplay(iso) {
        var d = parseIsoDate(iso);
        if (!d) return iso || '';
        return ('0' + d.getDate()).slice(-2) + '/' + ('0' + (d.getMonth() + 1)).slice(-2) + '/' + d.getFullYear();
    }

    function getColaboradores() {
        var bd = window.BD_MASTER_COLABORADORES;
        return (bd && bd.colaboradores) ? bd.colaboradores.slice() : [];
    }

    function getColaboradorById(id) {
        var cid = String(id || '');
        var list = getColaboradores();
        for (var i = 0; i < list.length; i++) {
            if (String(list[i].id) === cid) return list[i];
        }
        return null;
    }

    function getLiderById(leaderId) {
        return getColaboradorById(leaderId);
    }

    function getReportesDirectos(leaderId) {
        var lider = getLiderById(leaderId);
        if (!lider || !lider.nombre) return [];
        var nombreJefe = lider.nombre;
        return getColaboradores().filter(function (c) {
            return c.jefe === nombreJefe && !c.esGerenteGeneral;
        });
    }

    function getContenidosCatalogo() {
        var bd = window.BDS_CONTENIDOS_UBITS;
        return (bd && bd.contents) ? bd.contents.slice() : [];
    }

    function contenidosPorCompetencia(compId) {
        return getContenidosCatalogo().filter(function (c) {
            return c.competenciaPrincipalId === compId;
        });
    }

    function horasContenido(c) {
        if (!c) return 1;
        var v = Number(c.tiempoValor) || 60;
        var u = String(c.unidadTiempo || 'minutos').toLowerCase();
        if (u.indexOf('hora') >= 0) return v;
        return v / 60;
    }

    function formatDuration(c) {
        if (!c) return '60 min';
        var v = c.tiempoValor || 60;
        var u = String(c.unidadTiempo || 'minutos').toLowerCase();
        if (u.indexOf('hora') >= 0) return v + ' h';
        return v + ' min';
    }

    function progressStatus(pct) {
        if (pct >= 100) return 'completed';
        if (pct > 0) return 'progress';
        return 'default';
    }

    function getEstadoPlan(plan, hoyIso) {
        if (!plan) return 'Planeado';
        var hoy = parseIsoDate(hoyIso || PLAYGROUND_TODAY);
        var start = parseIsoDate(plan.fechaInicioIso || plan.fechaInicio);
        var end = parseIsoDate(plan.fechaFinIso || plan.fechaFin);
        if (plan.estado && String(plan.estado).indexOf('Procesando') === 0) return plan.estado;
        if (!start || !end || !hoy) return 'Planeado';
        if (hoy < start) return 'Planeado';
        if (hoy > end) return 'No vigente';
        return 'Vigente';
    }

    function planSinProgresoReal(estado) {
        if (!estado) return true;
        var e = String(estado);
        return e === 'Planeado' || e.indexOf('Procesando') === 0;
    }

    function pickContenidosParaPersona(planId, colaboradorId, quarterKey, pool, count) {
        var out = [];
        var used = {};
        var n = count || 3;
        var base = hashStr(planId + '|' + colaboradorId + '|' + quarterKey);
        for (var attempt = 0; attempt < pool.length * 2 && out.length < n; attempt++) {
            var idx = (base + attempt * 17) % pool.length;
            var c = pool[idx];
            if (!c || used[c.id]) continue;
            used[c.id] = true;
            out.push(c);
        }
        return out;
    }

    function genPctContenido(planId, colaboradorId, contentId, estado) {
        if (planSinProgresoReal(estado)) return 0;
        var h = hashStr(planId + colaboradorId + contentId);
        if (estado === 'No vigente') return Math.min(100, 25 + (h % 76));
        return Math.min(100, (h % 97));
    }

    function buildContenidoItem(c, pct) {
        return {
            id: c.id,
            title: c.title || c.titulo || '',
            duration: formatDuration(c),
            progress: pct,
            status: progressStatus(pct)
        };
    }

    function buildAsignacionContenidos(planId, col, contenidosItems) {
        return {
            id: 'fila-usuario-' + col.id,
            colaboradorId: String(col.id),
            nombreUsuario: (col.nombre || '').trim(),
            avatar: col.avatar || null,
            contenidos: contenidosItems.map(function (it) {
                return { id: it.id, title: it.title, duration: it.duration };
            }),
            contenidosCount: contenidosItems.length
        };
    }

    function progresoPromedioItems(items) {
        if (!items || !items.length) return 0;
        var sum = 0;
        items.forEach(function (it) { sum += Number(it.progress || 0); });
        return Math.round(sum / items.length);
    }

    function genConsumoCompetencia(planId, colaboradorId, compId, startIso, endIso, metaHoras, estado) {
        if (planSinProgresoReal(estado)) return { horas: 0, items: [] };
        var pool = contenidosPorCompetencia(compId);
        if (!pool.length) {
            pool = getContenidosCatalogo().slice(0, 20);
        }
        var h = hashStr(planId + colaboradorId);
        var targetPct = estado === 'No vigente'
            ? Math.min(100, 40 + (h % 61))
            : Math.min(100, (h % 95));
        var targetHoras = (targetPct / 100) * metaHoras;
        var consumidos = [];
        var acum = 0;
        var idx = h % Math.max(1, pool.length);
        for (var i = 0; i < pool.length && acum < targetHoras - 0.01; i++) {
            var c = pool[(idx + i) % pool.length];
            var hrs = horasContenido(c);
            consumidos.push({ contenidoId: c.id, horas: hrs, competenciaId: compId });
            acum += hrs;
        }
        return { horas: Math.min(acum, metaHoras * 1.2), items: consumidos };
    }

    function progresoCompetenciaPersona(consumo, metaHoras) {
        var h = consumo && consumo.horas ? consumo.horas : 0;
        return Math.min(100, Math.round((h / metaHoras) * 100));
    }

    function generateContenidosPlans() {
        var planes = [];
        var catalogo = getContenidosCatalogo();
        AREAS_LIDERES.forEach(function (areaDef) {
            TRIMESTRES.forEach(function (q) {
                var planId = 'pf-c-' + areaDef.slug + '-' + q.key.toLowerCase();
                var reportes = getReportesDirectos(areaDef.leaderId);
                var estado = getEstadoPlan({ fechaInicioIso: q.start, fechaFinIso: q.end }, PLAYGROUND_TODAY);
                var contenidoPorUsuario = {};
                var asignaciones = [];
                reportes.forEach(function (col) {
                    var picked = pickContenidosParaPersona(planId, col.id, q.key, catalogo, 3);
                    var items = picked.map(function (c) {
                        var pct = genPctContenido(planId, col.id, c.id, estado);
                        return buildContenidoItem(c, pct);
                    });
                    contenidoPorUsuario[String(col.id)] = items;
                    asignaciones.push(buildAsignacionContenidos(planId, col, items));
                });
                var progresoAgregado = 0;
                if (!planSinProgresoReal(estado) && asignaciones.length) {
                    var sum = 0;
                    Object.keys(contenidoPorUsuario).forEach(function (cid) {
                        sum += progresoPromedioItems(contenidoPorUsuario[cid]);
                    });
                    progresoAgregado = Math.round(sum / Object.keys(contenidoPorUsuario).length);
                }
                planes.push({
                    id: planId,
                    tipo: 'contenidos',
                    nombre: areaDef.area + ' capacitación ' + q.label,
                    fechaInicioIso: q.start,
                    fechaFinIso: q.end,
                    fechaInicio: isoToDisplay(q.start),
                    fechaFin: isoToDisplay(q.end),
                    estado: estado,
                    area: areaDef.area,
                    trimestre: q.key,
                    creadorId: areaDef.leaderId,
                    asignaciones: asignaciones,
                    contenidoPorUsuario: contenidoPorUsuario,
                    progresoAgregado: progresoAgregado
                });
            });
        });
        return planes;
    }

    function getTodosColaboradoresEmpresa() {
        return getColaboradores().filter(function (c) { return !c.esGerenteGeneral; });
    }

    function generateCompetenciasPlans() {
        var planes = [];
        COMPETENCIAS_PLAYGROUND.forEach(function (comp, compIdx) {
            ANIOS_COMPETENCIAS.forEach(function (anio, anioIdx) {
                var planId = 'pf-k-' + comp.id.replace('comp-', '') + '-' + anio;
                var start = anio + '-01-01';
                var end = anio + '-12-31';
                var estado = getEstadoPlan({ fechaInicioIso: start, fechaFinIso: end }, PLAYGROUND_TODAY);
                var creadorId = COMP_CREADORES[(compIdx + anioIdx) % COMP_CREADORES.length];
                var empleados = getTodosColaboradoresEmpresa();
                var competenciaPorUsuario = {};
                var consumoPorUsuario = {};
                var asignaciones = [];
                empleados.forEach(function (col) {
                    var consumo = genConsumoCompetencia(planId, col.id, comp.id, start, end, HORAS_META_COMPETENCIAS, estado);
                    var pct = progresoCompetenciaPersona(consumo, HORAS_META_COMPETENCIAS);
                    consumoPorUsuario[String(col.id)] = consumo;
                    var compItem = {
                        id: comp.id,
                        title: comp.nombre,
                        nombre: comp.nombre,
                        habilidades: [],
                        progress: pct,
                        status: progressStatus(pct)
                    };
                    competenciaPorUsuario[String(col.id)] = [compItem];
                    asignaciones.push({
                        id: 'fila-usuario-' + col.id,
                        colaboradorId: String(col.id),
                        nombreUsuario: (col.nombre || '').trim(),
                        avatar: col.avatar || null,
                        contenidos: [{ id: comp.id, title: comp.nombre, nombre: comp.nombre, habilidades: [] }],
                        contenidosCount: 1
                    });
                });
                var progresoAgregado = 0;
                if (!planSinProgresoReal(estado) && empleados.length) {
                    var sum = 0;
                    Object.keys(competenciaPorUsuario).forEach(function (cid) {
                        sum += progresoPromedioItems(competenciaPorUsuario[cid]);
                    });
                    progresoAgregado = Math.round(sum / Object.keys(competenciaPorUsuario).length);
                }
                planes.push({
                    id: planId,
                    tipo: 'competencias',
                    nombre: 'Empresa ' + comp.nombre + ' ' + anio,
                    fechaInicioIso: start,
                    fechaFinIso: end,
                    fechaInicio: isoToDisplay(start),
                    fechaFin: isoToDisplay(end),
                    estado: estado,
                    anio: anio,
                    competenciaId: comp.id,
                    horasEstudioMeta: HORAS_META_COMPETENCIAS,
                    horasEstudioPorCompetencia: HORAS_META_COMPETENCIAS,
                    creadorId: creadorId,
                    asignaciones: asignaciones,
                    competenciaPorUsuario: competenciaPorUsuario,
                    consumoPorUsuario: consumoPorUsuario,
                    progresoAgregado: progresoAgregado
                });
            });
        });
        return planes;
    }

    function buildSeedPlanes() {
        return generateContenidosPlans().concat(generateCompetenciasPlans());
    }

    function loadFromStorage() {
        try {
            var raw = sessionStorage.getItem(STORAGE_KEY);
            if (!raw) return null;
            var parsed = JSON.parse(raw);
            if (parsed && Array.isArray(parsed.planes)) return parsed.planes;
        } catch (e) { /* noop */ }
        return null;
    }

    function persistPlanesDb() {
        try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ planes: db.planes }));
        } catch (e) { /* noop */ }
    }

    function refreshEstadosPlanes() {
        db.planes.forEach(function (p) {
            if (p.estado && String(p.estado).indexOf('Procesando') === 0) return;
            p.estado = getEstadoPlan(p, PLAYGROUND_TODAY);
        });
    }

    var db = {
        version: '1.0',
        playgroundToday: PLAYGROUND_TODAY,
        planes: loadFromStorage() || buildSeedPlanes()
    };

    refreshEstadosPlanes();

    function findPlanIndex(id) {
        var sid = String(id || '');
        for (var i = 0; i < db.planes.length; i++) {
            if (String(db.planes[i].id) === sid) return i;
        }
        return -1;
    }

    function clonePlan(plan) {
        if (!plan) return null;
        return JSON.parse(JSON.stringify(plan));
    }

    function hydratePlan(plan) {
        if (!plan) return null;
        var p = clonePlan(plan);
        p.estado = getEstadoPlan(p, PLAYGROUND_TODAY);
        p.fechaInicio = p.fechaInicio || isoToDisplay(p.fechaInicioIso);
        p.fechaFin = p.fechaFin || isoToDisplay(p.fechaFinIso);
        if (p.tipo === 'competencias' && p.horasEstudioMeta != null) {
            p.horasEstudioPorCompetencia = p.horasEstudioMeta;
        }
        return p;
    }

    function getProgresoColaboradorEnPlan(planOrId, colaboradorId) {
        var plan = planOrId;
        if (planOrId != null && typeof planOrId !== 'object') {
            plan = getPlanById(planOrId);
        }
        plan = hydratePlan(plan);
        if (!plan || planSinProgresoReal(plan.estado)) return 0;
        var cid = String(colaboradorId || '');
        if (plan.tipo === 'contenidos') {
            return progresoPromedioItems((plan.contenidoPorUsuario || {})[cid] || []);
        }
        if (plan.tipo === 'competencias') {
            return progresoPromedioItems((plan.competenciaPorUsuario || {})[cid] || []);
        }
        return 0;
    }

    function getProgresoAgregadoPlan(planOrId) {
        var plan = planOrId;
        if (planOrId != null && typeof planOrId !== 'object') {
            plan = getPlanById(planOrId);
        }
        plan = hydratePlan(plan);
        if (!plan || planSinProgresoReal(plan.estado)) return 0;
        if (plan.progresoAgregado != null && !plan._progresoStale) {
            return plan.progresoAgregado;
        }
        var asignaciones = plan.asignaciones || [];
        if (!asignaciones.length) return 0;
        var sum = 0;
        asignaciones.forEach(function (a) {
            sum += getProgresoColaboradorEnPlan(plan, a.colaboradorId);
        });
        return Math.round(sum / asignaciones.length);
    }

    function getAsignadosFromPlan(planOrId) {
        var plan = planOrId;
        if (planOrId != null && typeof planOrId !== 'object') {
            plan = getPlanById(planOrId);
        }
        plan = hydratePlan(plan);
        if (!plan) return [];
        return (plan.asignaciones || []).map(function (a) {
            return {
                colaboradorId: String(a.colaboradorId || ''),
                nombre: (a.nombreUsuario || a.nombre || '').trim(),
                avatar: a.avatar || null
            };
        }).filter(function (p) { return p.nombre; });
    }

    function getPlanById(planId) {
        var idx = findPlanIndex(planId);
        if (idx < 0) return null;
        return hydratePlan(db.planes[idx]);
    }

    function getPlanesByTipo(tipo) {
        var t = tipo === 'competencias' ? 'competencias' : 'contenidos';
        return db.planes.filter(function (p) { return p.tipo === t; }).map(hydratePlan);
    }

    function getSubordinadosIds(leaderId) {
        return getReportesDirectos(leaderId).map(function (c) { return String(c.id); });
    }

    function planTieneColaborador(plan, colaboradorIds) {
        var ids = {};
        (colaboradorIds || []).forEach(function (id) { ids[String(id)] = true; });
        return (plan.asignaciones || []).some(function (a) {
            return ids[String(a.colaboradorId)];
        });
    }

    function getPlanesVisiblesParaLider(leaderId) {
        var subs = getSubordinadosIds(leaderId);
        if (!subs.length) return [];
        return db.planes.filter(function (p) {
            return planTieneColaborador(p, subs);
        }).map(hydratePlan);
    }

    function getPlanesVisiblesCreator() {
        return db.planes.map(hydratePlan);
    }

    function getPlanesListData(tipo, opts) {
        opts = opts || {};
        var list = tipo
            ? getPlanesByTipo(tipo)
            : (opts.leaderId ? getPlanesVisiblesParaLider(opts.leaderId) : getPlanesVisiblesCreator());
        return list.map(function (p) {
            return {
                id: p.id,
                nombre: p.nombre,
                fechaInicio: p.fechaInicio,
                fechaFin: p.fechaFin,
                estado: p.estado,
                progreso: getProgresoAgregadoPlan(p),
                progresoAgregado: getProgresoAgregadoPlan(p),
                tipo: p.tipo,
                asignados: getAsignadosFromPlan(p)
            };
        });
    }

    function toEditarView(plan) {
        plan = hydratePlan(plan);
        if (!plan) return null;
        var asignaciones = (plan.asignaciones || []).slice();
        return {
            id: plan.id,
            nombre: plan.nombre,
            fechaInicio: plan.fechaInicio,
            fechaFin: plan.fechaFin,
            estado: plan.estado,
            tipo: plan.tipo,
            horasEstudioPorCompetencia: plan.horasEstudioPorCompetencia,
            getAsignaciones: function () { return asignaciones.slice(); },
            asignaciones: asignaciones,
            contenidoPorUsuario: plan.contenidoPorUsuario || {},
            competenciaPorUsuario: plan.competenciaPorUsuario || {}
        };
    }

    function getDetalleContenidoPorUsuario(plan) {
        plan = hydratePlan(plan);
        if (!plan) return {};
        var out = {};
        var map = plan.contenidoPorUsuario || {};
        var sinProg = planSinProgresoReal(plan.estado);
        Object.keys(map).forEach(function (cid) {
            out[cid] = (map[cid] || []).map(function (c) {
                var copy = {};
                Object.keys(c).forEach(function (k) { copy[k] = c[k]; });
                if (sinProg) {
                    copy.progress = 0;
                    copy.status = 'default';
                }
                return copy;
            });
        });
        return out;
    }

    function nextPlanId(tipo) {
        var prefix = tipo === 'competencias' ? 'pf-k-user-' : 'pf-c-user-';
        var max = 0;
        db.planes.forEach(function (p) {
            if (String(p.id || '').indexOf(prefix) === 0) {
                var n = parseInt(String(p.id).slice(prefix.length), 10);
                if (!isNaN(n)) max = Math.max(max, n);
            }
        });
        return prefix + (max + 1);
    }

    function addPlan(plan) {
        if (!plan || !plan.nombre) return null;
        var nuevo = clonePlan(plan);
        nuevo.id = nuevo.id || nextPlanId(nuevo.tipo);
        nuevo.estado = nuevo.estado || 'Planeado';
        db.planes.push(nuevo);
        persistPlanesDb();
        return hydratePlan(nuevo);
    }

    function updatePlan(planId, patch) {
        var idx = findPlanIndex(planId);
        if (idx < 0 || !patch) return null;
        Object.keys(patch).forEach(function (k) {
            if (patch[k] !== undefined) db.planes[idx][k] = patch[k];
        });
        db.planes[idx]._progresoStale = true;
        persistPlanesDb();
        return hydratePlan(db.planes[idx]);
    }

    function deletePlans(ids) {
        if (!ids || !ids.length) return 0;
        var idSet = {};
        ids.forEach(function (id) { idSet[String(id)] = true; });
        var before = db.planes.length;
        db.planes = db.planes.filter(function (p) { return !idSet[String(p.id)]; });
        persistPlanesDb();
        return before - db.planes.length;
    }

    function resetToSeed() {
        db.planes = buildSeedPlanes();
        refreshEstadosPlanes();
        persistPlanesDb();
    }

    window.BD_PLANES_FORMACION = {
        PLAYGROUND_TODAY: PLAYGROUND_TODAY,
        HORAS_META_COMPETENCIAS: HORAS_META_COMPETENCIAS,
        get planes() { return db.planes; },
        getPlanById: getPlanById,
        getPlanesByTipo: getPlanesByTipo,
        getEstadoPlan: getEstadoPlan,
        getProgresoColaboradorEnPlan: getProgresoColaboradorEnPlan,
        getProgresoAgregadoPlan: getProgresoAgregadoPlan,
        getAsignadosFromPlan: getAsignadosFromPlan,
        getPlanesVisiblesParaLider: getPlanesVisiblesParaLider,
        getPlanesVisiblesCreator: getPlanesVisiblesCreator,
        getPlanesListData: getPlanesListData,
        toEditarView: toEditarView,
        getDetalleContenidoPorUsuario: getDetalleContenidoPorUsuario,
        hydratePlan: hydratePlan,
        addPlan: addPlan,
        updatePlan: updatePlan,
        deletePlans: deletePlans,
        persistPlanesDb: persistPlanesDb,
        resetToSeed: resetToSeed,
        isoToDisplay: isoToDisplay
    };
})();
