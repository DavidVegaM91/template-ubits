/**
 * Puente Creator ↔ BD_PLANES_FORMACION.
 * Requiere: bd-master-colaboradores.js, bd-contenidos-ubits.js, bd-planes-formacion.js
 */
(function () {
    'use strict';

    function bd() {
        return window.BD_PLANES_FORMACION;
    }

    window.loadPlanFormacionFromBd = function loadPlanFormacionFromBd(planId, tipo) {
        if (!bd()) return null;
        var t = tipo === 'competencias' ? 'competencias' : 'contenidos';
        var raw = planId ? bd().getPlanById(planId) : null;
        if (raw && raw.tipo !== t) raw = null;
        if (!raw) {
            var list = bd().getPlanesByTipo(t);
            raw = list.length ? list[0] : null;
        }
        return raw;
    };

    window.loadPlanEditarFromBd = function loadPlanEditarFromBd(planId, tipo) {
        var raw = window.loadPlanFormacionFromBd(planId, tipo);
        if (!raw || !bd()) return null;
        var view = bd().toEditarView(raw);
        if (tipo === 'competencias' && view) {
            view.horasPorCompetencia = String(
                view.horasEstudioPorCompetencia != null ? view.horasEstudioPorCompetencia : 2
            );
        }
        return view;
    };

    window.planFormacionToDetalleHeader = function planFormacionToDetalleHeader(raw) {
        if (!raw || !bd()) return null;
        return {
            nombre: raw.nombre,
            progreso: bd().getProgresoAgregadoPlan(raw),
            fechaInicio: raw.fechaInicio,
            fechaFin: raw.fechaFin,
            estado: raw.estado,
            horasEstudioPorCompetencia: raw.horasEstudioPorCompetencia != null
                ? raw.horasEstudioPorCompetencia
                : raw.horasEstudioMeta
        };
    };

    window.buildAsignacionesDetalleFromPlan = function buildAsignacionesDetalleFromPlan(planRaw) {
        return (planRaw && planRaw.asignaciones ? planRaw.asignaciones : []).map(function (a) {
            return {
                id: String(a.colaboradorId),
                usuario: a.nombreUsuario,
                avatar: a.avatar || null,
                ultimoAcceso: 'Hace 2 horas',
                ultimaFechaProgreso: null,
                progreso: 0
            };
        });
    };
})();
