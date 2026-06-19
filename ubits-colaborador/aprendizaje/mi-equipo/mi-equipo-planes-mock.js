/**
 * Mi equipo — mock compartido de planes de formación (contenidos + competencias).
 * Asignaciones limitadas a subordinados directos E035–E040 (María Alejandra Sánchez Pardo).
 *
 * Persistencia opcional: sessionStorage clave `ubits-mi-equipo-planes-db`.
 */
(function () {
    'use strict';

    var STORAGE_KEY = 'ubits-mi-equipo-planes-db';

    function getSubordinados() {
        if (typeof window.getMiEquipoSubordinadosDirectos === 'function') {
            return window.getMiEquipoSubordinadosDirectos();
        }
        return [];
    }

    function contenidosDesdeIndices(entries) {
        var cat = window.CATALOGO_CURSOS_DRAWER || [];
        var out = [];
        (entries || []).forEach(function (x) {
            var idx = typeof x === 'number' ? x : (x && x.i != null ? x.i : null);
            if (idx == null) return;
            var c = cat[idx];
            if (!c) return;
            var item = {
                id: c.id,
                title: c.title,
                duration: c.duration || '60 min'
            };
            if (typeof x === 'object' && x.p != null) item.progress = x.p;
            if (typeof x === 'object' && x.s) item.status = x.s;
            out.push(item);
        });
        return out;
    }

    function competenciasDesdeIndices(entries) {
        var cat = window.CATALOGO_COMPETENCIAS_DRAWER || [];
        var out = [];
        (entries || []).forEach(function (x) {
            var idx = typeof x === 'number' ? x : (x && x.i != null ? x.i : null);
            if (idx == null) return;
            var c = cat[idx];
            if (!c) return;
            var progress = (typeof x === 'object' && x.p != null) ? x.p : 0;
            var status = (typeof x === 'object' && x.s) ? x.s : 'default';
            out.push({
                id: c.id,
                title: c.nombre,
                nombre: c.nombre,
                habilidades: (c.habilidades || []).slice(),
                progress: progress,
                status: status,
                image: c.image || null
            });
        });
        return out;
    }

    function buildContenidoPorUsuario(mapIndices) {
        var out = {};
        Object.keys(mapIndices || {}).forEach(function (cid) {
            out[cid] = contenidosDesdeIndices(mapIndices[cid]);
        });
        return out;
    }

    function buildCompetenciaPorUsuario(mapIndices) {
        var out = {};
        Object.keys(mapIndices || {}).forEach(function (cid) {
            out[cid] = competenciasDesdeIndices(mapIndices[cid]);
        });
        return out;
    }

    function buildAsignacionesContenidos(contenidoPorUsuario) {
        var subs = getSubordinados();
        var byId = {};
        subs.forEach(function (c) { byId[String(c.id)] = c; });
        return Object.keys(contenidoPorUsuario || {}).map(function (cid) {
            var col = byId[String(cid)];
            if (!col) return null;
            var cont = contenidoPorUsuario[cid] || [];
            return {
                id: 'fila-usuario-' + cid,
                colaboradorId: String(cid),
                nombreUsuario: (col.nombre || '').trim(),
                avatar: col.avatar || null,
                contenidos: cont.map(function (c) {
                    return { id: c.id, title: c.title, duration: c.duration || '60 min' };
                }),
                contenidosCount: cont.length
            };
        }).filter(Boolean);
    }

    function buildAsignacionesCompetencias(competenciaPorUsuario) {
        var subs = getSubordinados();
        var byId = {};
        subs.forEach(function (c) { byId[String(c.id)] = c; });
        return Object.keys(competenciaPorUsuario || {}).map(function (cid) {
            var col = byId[String(cid)];
            if (!col) return null;
            var comps = competenciaPorUsuario[cid] || [];
            return {
                id: 'fila-usuario-' + cid,
                colaboradorId: String(cid),
                nombreUsuario: (col.nombre || '').trim(),
                avatar: col.avatar || null,
                contenidos: comps.map(function (c) {
                    return { id: c.id, title: c.title || c.nombre, nombre: c.nombre, habilidades: (c.habilidades || []).slice() };
                }),
                contenidosCount: comps.length
            };
        }).filter(Boolean);
    }

    var ME_C1_INDICES = {
        E035: [{ i: 0, p: 100, s: 'completed' }, { i: 1, p: 50, s: 'progress' }, { i: 2, p: 30, s: 'progress' }],
        E036: [{ i: 3, p: 100, s: 'completed' }, { i: 4, p: 80, s: 'progress' }, { i: 5, p: 15, s: 'progress' }],
        E037: [{ i: 6, p: 100, s: 'completed' }, { i: 7, p: 100, s: 'completed' }, { i: 8, p: 10, s: 'progress' }],
        E038: [{ i: 9, p: 100, s: 'completed' }, { i: 10, p: 50, s: 'progress' }, { i: 11, p: 45, s: 'progress' }],
        E039: [{ i: 12, p: 60, s: 'progress' }, { i: 13, p: 40, s: 'progress' }, { i: 14, p: 0, s: 'default' }]
    };

    var ME_K1_INDICES = {
        E035: [{ i: 0, p: 100, s: 'completed' }, { i: 1, p: 40, s: 'progress' }],
        E036: [{ i: 2, p: 80, s: 'progress' }, { i: 3, p: 100, s: 'completed' }, { i: 4, p: 0, s: 'default' }],
        E037: [{ i: 5, p: 100, s: 'completed' }, { i: 6, p: 30, s: 'progress' }],
        E038: [{ i: 7, p: 60, s: 'progress' }, { i: 8, p: 100, s: 'completed' }, { i: 9, p: 0, s: 'default' }]
    };

    var ME_K2_INDICES = {
        E035: [{ i: 10, p: 90, s: 'progress' }, { i: 11, p: 100, s: 'completed' }],
        E036: [{ i: 12, p: 100, s: 'completed' }, { i: 13, p: 70, s: 'progress' }],
        E037: [{ i: 14, p: 50, s: 'progress' }, { i: 15, p: 0, s: 'default' }],
        E038: [{ i: 16, p: 100, s: 'completed' }, { i: 17, p: 85, s: 'progress' }]
    };

    function buildSeedPlanes() {
        var meC1Contenido = buildContenidoPorUsuario(ME_C1_INDICES);
        var meK1Comp = buildCompetenciaPorUsuario(ME_K1_INDICES);
        var meK2Comp = buildCompetenciaPorUsuario(ME_K2_INDICES);

        return [
            {
                id: 'me-c1',
                nombre: 'Capacitación operativa bodega Q1',
                fechaInicio: '01/01/2026',
                fechaFin: '31/03/2026',
                estado: 'Vigente',
                progreso: 42,
                tipo: 'contenidos',
                _contenidoIndices: ME_C1_INDICES,
                contenidoPorUsuario: meC1Contenido,
                asignaciones: buildAsignacionesContenidos(meC1Contenido)
            },
            {
                id: 'me-c2',
                nombre: 'Inducción equipo logística Q2',
                fechaInicio: '01/04/2026',
                fechaFin: '30/06/2026',
                estado: 'Planeado',
                progreso: 0,
                tipo: 'contenidos',
                contenidoPorUsuario: {},
                asignaciones: []
            },
            {
                id: 'me-k1',
                nombre: 'Competencias logística 2026',
                fechaInicio: '01/01/2026',
                fechaFin: '31/03/2026',
                estado: 'Vigente',
                progreso: 58,
                tipo: 'competencias',
                horasEstudioPorCompetencia: 4,
                _competenciaIndices: ME_K1_INDICES,
                competenciaPorUsuario: meK1Comp,
                asignaciones: buildAsignacionesCompetencias(meK1Comp)
            },
            {
                id: 'me-k2',
                nombre: 'Seguridad en rutas 2025',
                fechaInicio: '01/09/2025',
                fechaFin: '15/12/2025',
                estado: 'No vigente',
                progreso: 90,
                tipo: 'competencias',
                horasEstudioPorCompetencia: 4,
                _competenciaIndices: ME_K2_INDICES,
                competenciaPorUsuario: meK2Comp,
                asignaciones: buildAsignacionesCompetencias(meK2Comp)
            }
        ];
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

    function persistMiEquipoPlanesDb() {
        try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ planes: window.MI_EQUIPO_PLANES_DB.planes }));
        } catch (e) { /* noop */ }
    }

    var stored = loadFromStorage();
    window.MI_EQUIPO_PLANES_DB = {
        planes: stored || buildSeedPlanes()
    };

    window.persistMiEquipoPlanesDb = persistMiEquipoPlanesDb;

    function hydratePlanFromIndices(plan) {
        if (!plan) return plan;
        if (plan.tipo === 'contenidos' && plan._contenidoIndices) {
            var hasCatalog = (window.CATALOGO_CURSOS_DRAWER || []).length > 0;
            var empty = !plan.contenidoPorUsuario || !Object.keys(plan.contenidoPorUsuario).some(function (k) {
                return (plan.contenidoPorUsuario[k] || []).length > 0;
            });
            if (hasCatalog && empty) {
                plan.contenidoPorUsuario = buildContenidoPorUsuario(plan._contenidoIndices);
                plan.asignaciones = buildAsignacionesContenidos(plan.contenidoPorUsuario);
            }
        }
        if (plan.tipo === 'competencias' && plan._competenciaIndices) {
            var hasCompCat = (window.CATALOGO_COMPETENCIAS_DRAWER || []).length > 0;
            var emptyComp = !plan.competenciaPorUsuario || !Object.keys(plan.competenciaPorUsuario).some(function (k) {
                return (plan.competenciaPorUsuario[k] || []).length > 0;
            });
            if (hasCompCat && emptyComp) {
                plan.competenciaPorUsuario = buildCompetenciaPorUsuario(plan._competenciaIndices);
                plan.asignaciones = buildAsignacionesCompetencias(plan.competenciaPorUsuario);
            }
        }
        return plan;
    }

    window.getMiEquipoPlanById = function getMiEquipoPlanById(planId) {
        var id = String(planId || '');
        var plan = (window.MI_EQUIPO_PLANES_DB.planes || []).find(function (p) {
            return String(p.id) === id;
        }) || null;
        return hydratePlanFromIndices(plan);
    };

    window.getMiEquipoPlanesByTipo = function getMiEquipoPlanesByTipo(tipo) {
        var t = tipo === 'competencias' ? 'competencias' : 'contenidos';
        return (window.MI_EQUIPO_PLANES_DB.planes || []).filter(function (p) {
            return p.tipo === t;
        });
    };

    window.getMiEquipoPlanesListData = function getMiEquipoPlanesListData() {
        return (window.MI_EQUIPO_PLANES_DB.planes || []).map(function (p) {
            return {
                id: p.id,
                nombre: p.nombre,
                fechaInicio: p.fechaInicio,
                fechaFin: p.fechaFin,
                estado: p.estado,
                progreso: p.progreso,
                tipo: p.tipo
            };
        });
    };

    function nextPlanId(tipo) {
        var prefix = tipo === 'competencias' ? 'me-k' : 'me-c';
        var max = 0;
        (window.MI_EQUIPO_PLANES_DB.planes || []).forEach(function (p) {
            var m = String(p.id || '').match(new RegExp('^' + prefix + '(\\d+)$'));
            if (m) max = Math.max(max, parseInt(m[1], 10));
        });
        return prefix + (max + 1);
    }

    window.addMiEquipoPlan = function addMiEquipoPlan(plan) {
        if (!plan || !plan.nombre) return null;
        var tipo = plan.tipo === 'competencias' ? 'competencias' : 'contenidos';
        var nuevo = {
            id: plan.id || nextPlanId(tipo),
            nombre: plan.nombre,
            fechaInicio: plan.fechaInicio,
            fechaFin: plan.fechaFin,
            estado: plan.estado || 'Planeado',
            progreso: plan.progreso != null ? plan.progreso : 0,
            tipo: tipo,
            asignaciones: (plan.asignaciones || []).slice()
        };
        if (tipo === 'contenidos') {
            nuevo.contenidoPorUsuario = plan.contenidoPorUsuario || {};
            if (!Object.keys(nuevo.contenidoPorUsuario).length && nuevo.asignaciones.length) {
                var cpu = {};
                nuevo.asignaciones.forEach(function (a) {
                    if (a.colaboradorId) cpu[String(a.colaboradorId)] = (a.contenidos || []).slice();
                });
                nuevo.contenidoPorUsuario = cpu;
            }
        } else {
            nuevo.competenciaPorUsuario = plan.competenciaPorUsuario || {};
            if (plan.horasEstudioPorCompetencia != null) nuevo.horasEstudioPorCompetencia = plan.horasEstudioPorCompetencia;
        }
        window.MI_EQUIPO_PLANES_DB.planes.push(nuevo);
        persistMiEquipoPlanesDb();
        return nuevo;
    };

    window.updateMiEquipoPlan = function updateMiEquipoPlan(planId, patch) {
        var plan = window.getMiEquipoPlanById(planId);
        if (!plan || !patch) return null;
        Object.keys(patch).forEach(function (k) {
            if (patch[k] !== undefined) plan[k] = patch[k];
        });
        persistMiEquipoPlanesDb();
        return plan;
    };

    window.deleteMiEquipoPlans = function deleteMiEquipoPlans(ids) {
        if (!ids || !ids.length) return 0;
        var idSet = {};
        ids.forEach(function (id) { idSet[String(id)] = true; });
        var before = window.MI_EQUIPO_PLANES_DB.planes.length;
        window.MI_EQUIPO_PLANES_DB.planes = window.MI_EQUIPO_PLANES_DB.planes.filter(function (p) {
            return !idSet[String(p.id)];
        });
        persistMiEquipoPlanesDb();
        return before - window.MI_EQUIPO_PLANES_DB.planes.length;
    };

    window.hydrateMiEquipoPlanesCatalogData = function hydrateMiEquipoPlanesCatalogData() {
        window.MI_EQUIPO_PLANES_DB.planes.forEach(function (plan) {
            hydratePlanFromIndices(plan);
        });
        persistMiEquipoPlanesDb();
    };
})();
