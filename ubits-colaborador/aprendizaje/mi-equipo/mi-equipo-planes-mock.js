/**
 * Mi equipo — capa sobre BD_PLANES_FORMACION (líder demo E006).
 * Requiere: bd-master-colaboradores.js, bd-contenidos-ubits.js, bd-planes-formacion.js
 */
(function () {
    'use strict';

    var LEADER_ID = 'E006';

    function bd() {
        return window.BD_PLANES_FORMACION;
    }

    function ensureBd() {
        if (!bd()) {
            console.warn('[mi-equipo-planes-mock] Falta bd-planes-formacion.js');
            return false;
        }
        return true;
    }

    window.MI_EQUIPO_PLANES_DB = {
        get planes() {
            if (!ensureBd()) return [];
            return bd().getPlanesVisiblesParaLider(LEADER_ID);
        }
    };

    window.persistMiEquipoPlanesDb = function persistMiEquipoPlanesDb() {
        if (ensureBd()) bd().persistPlanesDb();
    };

    window.getMiEquipoPlanById = function getMiEquipoPlanById(planId) {
        if (!ensureBd()) return null;
        var plan = bd().getPlanById(planId);
        if (!plan) return null;
        var subs = {};
        if (typeof window.getMiEquipoSubordinadosDirectos === 'function') {
            window.getMiEquipoSubordinadosDirectos().forEach(function (c) {
                subs[String(c.id)] = true;
            });
        }
        var visible = (plan.asignaciones || []).some(function (a) {
            return subs[String(a.colaboradorId)];
        });
        return visible ? plan : null;
    };

    window.getMiEquipoPlanesByTipo = function getMiEquipoPlanesByTipo(tipo) {
        if (!ensureBd()) return [];
        var t = tipo === 'competencias' ? 'competencias' : 'contenidos';
        return bd().getPlanesVisiblesParaLider(LEADER_ID).filter(function (p) {
            return p.tipo === t;
        });
    };

    window.getMiEquipoProgresoColaboradorEnPlan = function (planOrId, colaboradorId) {
        if (!ensureBd()) return 0;
        return bd().getProgresoColaboradorEnPlan(planOrId, colaboradorId);
    };

    window.getMiEquipoProgresoAgregadoPlan = function (planOrId) {
        if (!ensureBd()) return 0;
        return bd().getProgresoAgregadoPlan(planOrId);
    };

    window.getMiEquipoPlanAsignados = function (planOrId) {
        if (!ensureBd()) return [];
        return bd().getAsignadosFromPlan(planOrId);
    };

    window.getMiEquipoPlanesListData = function getMiEquipoPlanesListData() {
        if (!ensureBd()) return [];
        var contenidos = bd().getPlanesListData('contenidos', { leaderId: LEADER_ID });
        var competencias = bd().getPlanesListData('competencias', { leaderId: LEADER_ID });
        return contenidos.concat(competencias);
    };

    window.addMiEquipoPlan = function addMiEquipoPlan(plan) {
        if (!ensureBd() || !plan) return null;
        var tipo = plan.tipo === 'competencias' ? 'competencias' : 'contenidos';
        var nuevo = Object.assign({}, plan, {
            tipo: tipo,
            creadorId: LEADER_ID,
            id: plan.id || undefined
        });
        return bd().addPlan(nuevo);
    };

    window.updateMiEquipoPlan = function updateMiEquipoPlan(planId, patch) {
        if (!ensureBd()) return null;
        return bd().updatePlan(planId, patch);
    };

    window.deleteMiEquipoPlans = function deleteMiEquipoPlans(ids) {
        if (!ensureBd()) return 0;
        return bd().deletePlans(ids);
    };

    window.hydrateMiEquipoPlanesCatalogData = function hydrateMiEquipoPlanesCatalogData() {
        /* La BD ya incluye contenidoPorUsuario / competenciaPorUsuario generados. */
    };
})();
