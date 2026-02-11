/* ========================================
   BASE DE DATOS UNIFICADA - TAREAS Y PLANES
   Alimenta: planes.html, tareas.html, seguimiento.html,
   seguimiento-leader.html, plan-detail.html

   DEPENDENCIA: seguimiento-data.js debe estar cargado antes
   para actividades de seguimiento (empresa, empleados,
   generarActividades, getActividadesParaLider).

   Este archivo NO está implementado en las páginas aún;
   solo define la estructura y los getters.
   ======================================== */

(function(global) {
    'use strict';

    // -------------------------------------------------------------------------
    // USUARIO ACTUAL (María Alejandra - debe coincidir con J005 en seguimiento-data)
    // -------------------------------------------------------------------------
    const USUARIO_ACTUAL = {
        id: 'J005',
        idColaborador: '1011000006',
        nombre: 'María Alejandra Sánchez Pardo',
        cargo: 'Jefe de Logística',
        area: 'Logística',
        username: 'masanchez@fiqsha.demo',
        avatar: '../../images/Profile-image.jpg',
        esJefe: true
    };

    // -------------------------------------------------------------------------
    // TAREAS VISTA TAREAS (tareas.html) - Solo de María Alejandra
    // Estructura: { vencidas: [], porDia: { 'YYYY-MM-DD': [] } }
    // Cada tarea: id, name, done, status, endDate, priority, assignee_email,
    // etiqueta, created_by, created_by_avatar_url, role
    // -------------------------------------------------------------------------
    const tareasVistaTareas = {
        vencidas: [
            {
                id: 1,
                name: 'Responde la evaluación "360 Talent Experience"',
                done: false,
                status: 'Vencido',
                endDate: '2025-12-31',
                priority: 'media',
                assignee_email: null,
                etiqueta: null,
                created_by: USUARIO_ACTUAL.nombre,
                created_by_avatar_url: USUARIO_ACTUAL.avatar,
                role: 'colaborador'
            },
            {
                id: 101,
                name: 'Completar informe trimestral',
                done: false,
                status: 'Vencido',
                endDate: '2026-01-15',
                priority: 'alta',
                assignee_email: null,
                etiqueta: null,
                created_by: USUARIO_ACTUAL.nombre,
                created_by_avatar_url: USUARIO_ACTUAL.avatar,
                role: 'colaborador'
            },
            {
                id: 102,
                name: 'Revisar documentación de onboarding',
                done: false,
                status: 'Vencido',
                endDate: '2026-01-20',
                priority: 'baja',
                assignee_email: null,
                etiqueta: null,
                created_by: USUARIO_ACTUAL.nombre,
                created_by_avatar_url: USUARIO_ACTUAL.avatar,
                role: 'colaborador'
            }
        ],
        porDia: {
            '2026-01-28': [
                {
                    id: 10,
                    name: 'Reunión de seguimiento semanal',
                    done: false,
                    status: 'Activo',
                    endDate: '2026-01-28',
                    priority: 'alta',
                    assignee_email: null,
                    etiqueta: null,
                    created_by: USUARIO_ACTUAL.nombre,
                    created_by_avatar_url: USUARIO_ACTUAL.avatar,
                    role: 'colaborador'
                },
                {
                    id: 11,
                    name: 'Actualizar reportes de ventas',
                    done: false,
                    status: 'Activo',
                    endDate: '2026-01-28',
                    priority: 'media',
                    assignee_email: null,
                    etiqueta: null,
                    created_by: USUARIO_ACTUAL.nombre,
                    created_by_avatar_url: USUARIO_ACTUAL.avatar,
                    role: 'colaborador'
                }
            ],
            '2026-01-29': [
                {
                    id: 2,
                    name: 'Nombre de la tarea',
                    done: false,
                    status: 'Activo',
                    endDate: '2026-01-29',
                    priority: 'alta',
                    assignee_email: null,
                    etiqueta: null,
                    created_by: USUARIO_ACTUAL.nombre,
                    created_by_avatar_url: USUARIO_ACTUAL.avatar,
                    role: 'colaborador'
                },
                {
                    id: 3,
                    name: 'Nombre de la tarea',
                    done: false,
                    status: 'Activo',
                    endDate: '2026-01-29',
                    priority: 'alta',
                    assignee_email: null,
                    etiqueta: null,
                    created_by: USUARIO_ACTUAL.nombre,
                    created_by_avatar_url: USUARIO_ACTUAL.avatar,
                    role: 'colaborador'
                },
                {
                    id: 4,
                    name: 'Segunda tarea en la app',
                    done: false,
                    status: 'Activo',
                    endDate: null,
                    priority: 'baja',
                    assignee_email: null,
                    etiqueta: null,
                    created_by: USUARIO_ACTUAL.nombre,
                    created_by_avatar_url: USUARIO_ACTUAL.avatar,
                    role: 'colaborador'
                },
                {
                    id: 5,
                    name: 'Preparar presentación para stakeholders',
                    done: false,
                    status: 'Activo',
                    endDate: '2026-01-29',
                    priority: 'media',
                    assignee_email: null,
                    etiqueta: null,
                    created_by: USUARIO_ACTUAL.nombre,
                    created_by_avatar_url: USUARIO_ACTUAL.avatar,
                    role: 'colaborador'
                }
            ]
        }
    };

    // -------------------------------------------------------------------------
    // PLANES VISTA PLANES (planes.html) - Individuales y grupales de María Alejandra
    // Cada plan: id, name, end_date, status, tasksDone, tasksTotal, finished, hasMembers
    // -------------------------------------------------------------------------
    const planesVistaPlanes = [
        { id: '1', name: 'Plan dayli', end_date: null, status: 'Activo', tasksDone: 0, tasksTotal: 2, finished: false, hasMembers: true },
        { id: '2', name: 'Plan dayli', end_date: null, status: 'Activo', tasksDone: 0, tasksTotal: 2, finished: false, hasMembers: true },
        { id: '3', name: 'Plan dayli', end_date: null, status: 'Activo', tasksDone: 0, tasksTotal: 2, finished: false, hasMembers: true },
        { id: '4', name: 'Proyecto lanzamiento de una evaluación', end_date: '2026-01-31', status: 'Vencido', tasksDone: 1, tasksTotal: 6, finished: false, hasMembers: true },
        { id: '5', name: 'Onboarding externos flota - Ciclo 1', end_date: '2026-01-31', status: 'Vencido', tasksDone: 0, tasksTotal: 10, finished: false, hasMembers: true },
        { id: '6', name: 'Checklist operativo ciclo 1 - enero', end_date: '2026-01-31', status: 'Vencido', tasksDone: 1, tasksTotal: 11, finished: false, hasMembers: true },
        { id: '7', name: 'Plan de capacitación Q1', end_date: '2026-03-15', status: 'Activo', tasksDone: 2, tasksTotal: 8, finished: false, hasMembers: true },
        { id: '8', name: 'Plan de onboarding 2026', end_date: '2026-02-28', status: 'Activo', tasksDone: 3, tasksTotal: 5, finished: false, hasMembers: true },
        { id: '9', name: 'Evaluación de desempeño - Ciclo 1', end_date: '2026-02-15', status: 'Activo', tasksDone: 0, tasksTotal: 4, finished: false, hasMembers: true },
        { id: '10', name: 'Plan de desarrollo profesional', end_date: null, status: 'Activo', tasksDone: 1, tasksTotal: 6, finished: false, hasMembers: true },
        { id: '11', name: 'Seguimiento de metas trimestrales', end_date: '2026-03-31', status: 'Activo', tasksDone: 5, tasksTotal: 12, finished: false, hasMembers: true },
        { id: '12', name: 'Formación en liderazgo', end_date: '2026-04-15', status: 'Activo', tasksDone: 0, tasksTotal: 3, finished: false, hasMembers: true },
        { id: '13', name: 'Plan de integración equipo nuevo', end_date: null, status: 'Activo', tasksDone: 2, tasksTotal: 7, finished: false, hasMembers: true },
        { id: '14', name: 'Certificación de competencias', end_date: '2026-02-28', status: 'Activo', tasksDone: 4, tasksTotal: 8, finished: false, hasMembers: true },
        { id: '15', name: 'Plan de mejora continua', end_date: '2026-05-01', status: 'Activo', tasksDone: 1, tasksTotal: 5, finished: false, hasMembers: true },
        { id: '16', name: 'Evaluación 360 - Ciclo anual', end_date: null, status: 'Activo', tasksDone: 0, tasksTotal: 10, finished: false, hasMembers: true },
        { id: '17', name: 'Plan de bienestar laboral', end_date: '2026-06-30', status: 'Activo', tasksDone: 3, tasksTotal: 6, finished: false, hasMembers: true },
        { id: '18', name: 'Capacitación en seguridad', end_date: '2026-02-15', status: 'Activo', tasksDone: 1, tasksTotal: 4, finished: false, hasMembers: true },
        { id: '19', name: 'Plan de mentoría Q1', end_date: null, status: 'Activo', tasksDone: 0, tasksTotal: 3, finished: false, hasMembers: true },
        { id: '20', name: 'Revisión de objetivos anuales', end_date: '2026-01-31', status: 'Vencido', tasksDone: 2, tasksTotal: 5, finished: false, hasMembers: true },
        { id: '21', name: 'Inducción nuevos colaboradores', end_date: '2026-01-15', status: 'Activo', tasksDone: 4, tasksTotal: 6, finished: false, hasMembers: true },
        { id: '22', name: 'Plan de formación técnica', end_date: '2025-12-31', status: 'Activo', tasksDone: 1, tasksTotal: 4, finished: false, hasMembers: true },
        { id: '23', name: 'Checklist operativo ciclo 1', end_date: '2025-12-28', status: 'Finalizado', tasksDone: 10, tasksTotal: 10, finished: true, hasMembers: true },
        { id: '24', name: 'Checklist operativo ciclo 1', end_date: null, status: 'Finalizado', tasksDone: 10, tasksTotal: 10, finished: true, hasMembers: true },
        { id: '25', name: 'Plan de capacitación T&P', end_date: '2025-10-30', status: 'Finalizado', tasksDone: 4, tasksTotal: 4, finished: true, hasMembers: true },
        { id: '26', name: 'Plan de Onboarding - Ventas', end_date: '2025-11-30', status: 'Finalizado', tasksDone: 4, tasksTotal: 4, finished: true, hasMembers: true }
    ];

    // -------------------------------------------------------------------------
    // PLAN DETALLE (plan-detail.html) - Metadata por planId
    // Campos: name, description, created_by, end_date, status
    // -------------------------------------------------------------------------
    const planDetalle = {
        '1': { name: 'Plan dayli', description: 'Plan de tareas diarias para seguimiento.', created_by: USUARIO_ACTUAL.nombre, end_date: null, status: 'Activo' },
        '2': { name: 'Plan dayli', description: 'Plan de tareas diarias.', created_by: USUARIO_ACTUAL.nombre, end_date: null, status: 'Activo' },
        '3': { name: 'Plan dayli', description: 'Plan de tareas diarias.', end_date: null, status: 'Activo', created_by: USUARIO_ACTUAL.nombre },
        '4': { name: 'Proyecto lanzamiento de una evaluación', description: 'Proyecto para el lanzamiento de evaluaciones.', end_date: '2026-01-31', status: 'Vencido', created_by: USUARIO_ACTUAL.nombre },
        '5': { name: 'Onboarding externos flota - Ciclo 1', description: 'Proceso de onboarding para externos.', end_date: '2026-01-31', status: 'Vencido', created_by: USUARIO_ACTUAL.nombre },
        '6': { name: 'Checklist operativo ciclo 1 - enero', description: 'Checklist operativo del primer ciclo.', end_date: '2026-01-31', status: 'Vencido', created_by: USUARIO_ACTUAL.nombre },
        '7': { name: 'Plan de capacitación Q1', description: 'Capacitaciones del primer trimestre.', end_date: '2026-03-15', status: 'Activo', created_by: USUARIO_ACTUAL.nombre },
        '8': { name: 'Plan de onboarding 2026', description: 'Onboarding de nuevos colaboradores.', end_date: '2026-02-28', status: 'Activo', created_by: USUARIO_ACTUAL.nombre },
        '23': { name: 'Checklist operativo ciclo 1', description: 'Checklist completado.', end_date: '2025-12-28', status: 'Finalizado', created_by: USUARIO_ACTUAL.nombre },
        '24': { name: 'Checklist operativo ciclo 1', description: 'Checklist completado.', end_date: null, status: 'Finalizado', created_by: USUARIO_ACTUAL.nombre },
        '25': { name: 'Plan de capacitación T&P', description: 'Capacitación T&P completada.', end_date: '2025-10-30', status: 'Finalizado', created_by: USUARIO_ACTUAL.nombre },
        '26': { name: 'Plan de Onboarding - Ventas', description: 'Onboarding equipo de ventas.', end_date: '2025-11-30', status: 'Finalizado', created_by: USUARIO_ACTUAL.nombre }
    };

    // -------------------------------------------------------------------------
    // TAREAS POR PLAN (plan-detail.html) - Array por planId
    // Cada tarea: id, name, done, status, endDate, priority, assignee_email, etiqueta
    // -------------------------------------------------------------------------
    const tareasPorPlan = {
        '1': [
            { id: 101, name: 'tarea 2', done: false, status: 'Activo', endDate: null, priority: 'media', assignee_email: null, etiqueta: null },
            { id: 102, name: 'tarea 1', done: false, status: 'Activo', endDate: null, priority: 'baja', assignee_email: null, etiqueta: null }
        ],
        '4': [
            { id: 401, name: 'Responde la evaluación "360 Talent Experience"', done: false, status: 'Vencido', endDate: '2025-12-31', priority: 'media', assignee_email: null, etiqueta: null },
            { id: 402, name: 'Revisar resultados de evaluación', done: false, status: 'Activo', endDate: '2026-02-15', priority: 'alta', assignee_email: null, etiqueta: null }
        ],
        '5': [
            { id: 501, name: 'Completar documentación de ingreso', done: false, status: 'Vencido', endDate: '2026-01-31', priority: 'alta', assignee_email: null, etiqueta: null },
            { id: 502, name: 'Asistir a sesión de bienvenida', done: false, status: 'Activo', endDate: null, priority: 'media', assignee_email: null, etiqueta: null }
        ],
        '8': [
            { id: 801, name: 'Completar módulo 1 de inducción', done: true, status: 'Finalizado', endDate: '2026-02-15', priority: 'alta', assignee_email: null, etiqueta: null },
            { id: 802, name: 'Reunión con mentor asignado', done: false, status: 'Activo', endDate: '2026-02-20', priority: 'media', assignee_email: null, etiqueta: null }
        ],
        '23': [
            { id: 2301, name: 'Revisión de checklist', done: true, status: 'Finalizado', endDate: '2025-12-28', priority: 'media', assignee_email: null, etiqueta: null }
        ]
    };

    // -------------------------------------------------------------------------
    // GETTERS - API pública (aún no usada por las páginas)
    // -------------------------------------------------------------------------

    function getUsuarioActual() {
        return Object.assign({}, USUARIO_ACTUAL);
    }

    function getTareasVistaTareas() {
        return {
            vencidas: tareasVistaTareas.vencidas.map(t => Object.assign({}, t)),
            porDia: Object.keys(tareasVistaTareas.porDia).reduce((acc, key) => {
                acc[key] = tareasVistaTareas.porDia[key].map(t => Object.assign({}, t));
                return acc;
            }, {})
        };
    }

    function getPlanesVistaPlanes() {
        return planesVistaPlanes.map(p => Object.assign({}, p));
    }

    function getPlanDetalle(planId) {
        const id = String(planId);
        return planDetalle[id] ? Object.assign({}, planDetalle[id]) : null;
    }

    function getTareasPorPlan(planId) {
        const id = String(planId);
        const list = tareasPorPlan[id];
        return list ? list.map(t => Object.assign({}, t)) : [];
    }

    /**
     * Actividades para seguimiento.html / seguimiento-leader.html.
     * Delega a SEGUIMIENTO_DATABASE si existe (seguimiento-data.js cargado).
     */
    function getActividadesSeguimiento() {
        if (typeof SEGUIMIENTO_DATABASE !== 'undefined' && SEGUIMIENTO_DATABASE.generarActividades) {
            return SEGUIMIENTO_DATABASE.generarActividades();
        }
        return [];
    }

    /**
     * Actividades de reportes directos del líder (seguimiento-leader).
     * Delega a SEGUIMIENTO_DATABASE si existe.
     */
    function getActividadesParaLider(nombreLider) {
        if (typeof SEGUIMIENTO_DATABASE !== 'undefined' && SEGUIMIENTO_DATABASE.getActividadesParaLider) {
            return SEGUIMIENTO_DATABASE.getActividadesParaLider(nombreLider);
        }
        return [];
    }

    // -------------------------------------------------------------------------
    // API PÚBLICA GLOBAL
    // Uso futuro: TAREAS_PLANES_DB.getTareasVistaTareas(), etc.
    // -------------------------------------------------------------------------
    global.TAREAS_PLANES_DB = {
        getUsuarioActual: getUsuarioActual,
        getTareasVistaTareas: getTareasVistaTareas,
        getPlanesVistaPlanes: getPlanesVistaPlanes,
        getPlanDetalle: getPlanDetalle,
        getTareasPorPlan: getTareasPorPlan,
        getActividadesSeguimiento: getActividadesSeguimiento,
        getActividadesParaLider: getActividadesParaLider
    };

})(typeof window !== 'undefined' ? window : this);
