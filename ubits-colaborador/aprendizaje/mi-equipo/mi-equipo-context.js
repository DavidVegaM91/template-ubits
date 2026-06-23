/**
 * Mi equipo — contexto compartido (modo colaborador, permiso líder).
 * Fuente de verdad de subordinados: bd-master-colaboradores.js (campo jefe).
 *
 * Usuario demo del playground: María Alejandra Sánchez Pardo (E006).
 * Subordinados directos en Fiqsha: E035–E040 (6 personas, área Logística).
 */
(function () {
    /** Nombre canónico del líder logueado en el playground (coincide con BD_MASTER_COLABORADORES). */
    window.MI_EQUIPO_CURRENT_LEADER = 'María Alejandra Sánchez Pardo';

    /**
     * Colaboradores con jefe === MI_EQUIPO_CURRENT_LEADER (solo reportes directos).
     * @returns {Array<Object>}
     */
    window.getMiEquipoSubordinadosDirectos = function getMiEquipoSubordinadosDirectos() {
        var leader = window.MI_EQUIPO_CURRENT_LEADER;
        var master = window.BD_MASTER_COLABORADORES;
        var list = (master && master.colaboradores) ? master.colaboradores : [];
        return list.filter(function (c) {
            if (!c || c.esGerenteGeneral) return false;
            return String(c.jefe || '').trim() === leader;
        });
    };

    /** IDs (E035, …) de subordinados directos — útil para filtrar asignaciones. */
    window.getMiEquipoSubordinadosIds = function getMiEquipoSubordinadosIds() {
        return window.getMiEquipoSubordinadosDirectos().map(function (c) {
            return String(c.id || c.idColaborador);
        });
    };

    window.getMiEquipoDetallePlanUrl = function getMiEquipoDetallePlanUrl(planId, tipo) {
        var base = tipo === 'competencias' ? 'detalle-plan-competencias.html' : 'detalle-plan.html';
        return base + '?id=' + encodeURIComponent(planId);
    };

    window.getMiEquipoEditarPlanUrl = function getMiEquipoEditarPlanUrl(planId, tipo) {
        var base = tipo === 'competencias' ? 'editar-plan-competencias.html' : 'editar-plan-contenidos.html';
        return base + '?id=' + encodeURIComponent(planId);
    };

    window.getMiEquipoCrearPlanUrl = function getMiEquipoCrearPlanUrl(tipo) {
        var t = String(tipo || '').trim().toLowerCase();
        if (t === 'competencias') return 'crear-plan-competencias.html';
        return 'crear-plan-contenidos.html';
    };

    function getUsernameColaboradorDrawer(c) {
        if (c.username) return c.username;
        var palabras = (c.nombre || '').toLowerCase().split(' ').filter(function (p) { return p.length > 0; });
        var iniciales = palabras.map(function (p) { return p.charAt(0); }).join('');
        return iniciales ? iniciales + '@fiqsha.demo' : 'user@fiqsha.demo';
    }

    /** Todos los subordinados directos para tablas del drawer (sin ocultar ya asignados). */
    window.getMiEquipoColaboradoresParaDrawer = function getMiEquipoColaboradoresParaDrawer() {
        var DPC = window.DrawerParticipantesColabTable;
        return window.getMiEquipoSubordinadosDirectos().map(function (c, idx) {
            if (DPC && typeof DPC.mapEmpleadoParaDrawerColab === 'function') {
                return DPC.mapEmpleadoParaDrawerColab(c, idx);
            }
            var id = c.id || c.idColaborador;
            var username = getUsernameColaboradorDrawer(c);
            return {
                id: id,
                username: username,
                nombre: (c.nombre || '').trim(),
                correo: username,
                area: (c.area || '').trim(),
                lider: (c.jefe || '').trim(),
                avatar: c.avatar || null
            };
        });
    };

    /** Añade contenidos a una asignación existente sin duplicar por id. */
    window.mergeContenidosEnAsignacion = function mergeContenidosEnAsignacion(item, nuevosCursos) {
        if (!item) return 0;
        if (!item.contenidos) item.contenidos = [];
        var idSet = {};
        item.contenidos.forEach(function (c) {
            if (c && c.id != null) idSet[String(c.id)] = true;
        });
        var added = 0;
        (nuevosCursos || []).forEach(function (c) {
            if (!c || c.id == null) return;
            if (idSet[String(c.id)]) return;
            item.contenidos.push(c);
            idSet[String(c.id)] = true;
            added++;
        });
        item.contenidosCount = item.contenidos.length;
        return added;
    };
})();
