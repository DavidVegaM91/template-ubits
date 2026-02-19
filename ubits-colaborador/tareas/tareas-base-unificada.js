/* ========================================
   BASE DE DATOS UNIFICADA - TAREAS Y PLANES
   Única fuente de datos para: planes.html, tareas.html, seguimiento.html,
   seguimiento-leader.html, plan-detail.html. Objetivo: no duplicar datos
   en otros JS; poder eliminar bases de datos que había por archivo.

   REGLAS (documentadas aquí para no crear archivos extra):

   1. Tareas por usuario por mes: 30 en total.
      - 10 individuales: no van a seguimiento; sí a tareas.html y planes (tab individual).
      - 20 grupales: sí a seguimiento, tareas.html y planes (tab grupal).

   2. Planes por usuario por mes: 4 en total.
      - 3 individuales: se forman agrupando las 10 tareas en 3 planes (3+3+4 tareas).
      - 1 grupal: el plan de su área ese mes (ej. "Plan Logística 01/2025").

   3. Distribución de estados en TAREAS (por usuario/mes):
      - Finalizadas: 70–85%
      - Iniciadas: 10–20%
      - Vencidas: 5–15%
      (función repartoEstados, determinista por seed)

   4. Distribución de estados en PLANES (asignada por seed, no derivada de tareas):
      - Finalizados: 70–85%
      - Iniciados (Activos): 10–20%
      - Vencidos: 5–15%
      (función repartoEstadoPlan, determinista por seed). El progreso (tasksDone/
      tasksTotal) sigue siendo el real de las tareas; el estado del plan es independiente
      para reflejar que se puede finalizar manualmente y mover tareas a otro plan.

   5. Rango de fechas: INICIO_RANGO – FIN_RANGO (constantes abajo).
   ======================================== */

(function(global) {
    'use strict';

    const pad = (n) => String(n).padStart(2, '0');
    function getTodayString() {
        const d = new Date();
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    }

    function formatearFechaSeguimiento(fecha) {
        const dia = fecha.getDate();
        const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
        const mes = meses[fecha.getMonth()];
        const anio = fecha.getFullYear();
        return `${dia} ${mes} ${anio} 10:00`;
    }

    function generarUsername(nombre) {
        const palabras = (nombre || '').toLowerCase().split(' ').filter(p => p.length > 0);
        const iniciales = palabras.map(p => p.charAt(0)).join('');
        return iniciales ? `${iniciales}@fiqsha.demo` : 'user@fiqsha.demo';
    }

    function obtenerJefe(area, esJefe, jefes) {
        if (!area || area === 'Gerencia General') return null;
        if (esJefe && jefes) {
            const gg = jefes.find(j => j.area === 'Gerencia General');
            return gg ? gg.nombre : null;
        }
        const j = (jefes || []).find(x => x.area === area);
        return j ? j.nombre : null;
    }

    // Usuario actual (María Alejandra - J005)
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

    // ============================================
    // ESTRUCTURA DE EMPRESA (Fiqsha Decoraciones S.A.S.)
    // Áreas, líderes y personas. Esta base es la única fuente de datos; no depende de otras.
    // ============================================
    const EMPRESA_EJEMPLO = {
        nombre: 'Fiqsha Decoraciones S.A.S.',
        descripcion: 'Empresa colombiana dedicada a la venta, reparación e instalación de productos decorativos de lujo.',
        empleados: 51,
        fundada: 2015
    };

    const GERENTE_EJEMPLO = {
        id: 'E001',
        idColaborador: '1011000001',
        nombre: 'Patricia Elena Bermúdez Ríos',
        cargo: 'Gerente General',
        area: 'Gerencia General',
        genero: 'F',
        avatar: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=100&h=100&fit=crop',
        username: 'pateleber@fiqsha.demo',
        jefe: null,
        esJefe: true,
        esGerenteGeneral: true
    };

    const AREAS_EJEMPLO = [
        { id: 0, nombre: 'Gerencia General', descripcion: 'Dirección estratégica y toma de decisiones' },
        { id: 1, nombre: 'Ventas', descripcion: 'Asesoría comercial y cierre de negocios' },
        { id: 2, nombre: 'Instalaciones', descripcion: 'Instalación de productos en sitio' },
        { id: 3, nombre: 'Reparaciones', descripcion: 'Servicio técnico y mantenimiento' },
        { id: 4, nombre: 'Atención al Cliente', descripcion: 'Soporte y seguimiento postventa' },
        { id: 5, nombre: 'Logística', descripcion: 'Bodega, inventarios y entregas' },
        { id: 6, nombre: 'Administración', descripcion: 'Gestión administrativa y financiera' },
        { id: 7, nombre: 'Marketing', descripcion: 'Publicidad, diseño y redes sociales' },
        { id: 8, nombre: 'Recursos Humanos', descripcion: 'Gestión de personas, objetivos, encuestas y nómina' }
    ];

    const JEFES_EJEMPLO = [
        { id: 'E002', idColaborador: '1011000002', nombre: 'Ricardo Ospina Duque', cargo: 'Director Comercial', area: 'Ventas', genero: 'M', avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop', username: 'rospid@fiqsha.demo', jefe: GERENTE_EJEMPLO.nombre, esJefe: true },
        { id: 'E003', idColaborador: '1011000003', nombre: 'Fernando Castro Restrepo', cargo: 'Jefe de Instalaciones', area: 'Instalaciones', genero: 'M', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop', username: 'fcastr@fiqsha.demo', jefe: GERENTE_EJEMPLO.nombre, esJefe: true },
        { id: 'E004', idColaborador: '1011000004', nombre: 'Claudia Vargas Mendoza', cargo: 'Jefe de Servicio Técnico', area: 'Reparaciones', genero: 'F', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop', username: 'cvargm@fiqsha.demo', jefe: GERENTE_EJEMPLO.nombre, esJefe: true },
        { id: 'E005', idColaborador: '1011000005', nombre: 'Andrea Suárez Gómez', cargo: 'Coordinadora de Atención al Cliente', area: 'Atención al Cliente', genero: 'F', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop', username: 'asuarg@fiqsha.demo', jefe: GERENTE_EJEMPLO.nombre, esJefe: true },
        { id: 'E006', idColaborador: '1011000006', nombre: 'María Alejandra Sánchez Pardo', cargo: 'Jefe de Logística', area: 'Logística', genero: 'F', avatar: '../../images/Profile-image.jpg', username: 'masanchez@fiqsha.demo', jefe: GERENTE_EJEMPLO.nombre, esJefe: true },
        { id: 'E007', idColaborador: '1011000007', nombre: 'Mónica Jiménez Pérez', cargo: 'Gerente Administrativa', area: 'Administración', genero: 'F', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', username: 'mjimep@fiqsha.demo', jefe: GERENTE_EJEMPLO.nombre, esJefe: true },
        { id: 'E008', idColaborador: '1011000008', nombre: 'Alejandro Moreno Ruiz', cargo: 'Director de Marketing', area: 'Marketing', genero: 'M', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop', username: 'amorer@fiqsha.demo', jefe: GERENTE_EJEMPLO.nombre, esJefe: true },
        { id: 'E052', idColaborador: '1011000052', nombre: 'Carmen Rosa Díaz Herrera', cargo: 'Jefa de Recursos Humanos', area: 'Recursos Humanos', genero: 'F', avatar: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=100&h=100&fit=crop', username: 'crdiaz@fiqsha.demo', jefe: GERENTE_EJEMPLO.nombre, esJefe: true }
    ];

    const EMPLEADOS_EJEMPLO = [
        GERENTE_EJEMPLO,
        ...JEFES_EJEMPLO,
        { id: 'E009', idColaborador: '1011000009', nombre: 'Carlos Andrés García López', cargo: 'Asesor Comercial Senior', area: 'Ventas', genero: 'M', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop', jefe: 'Ricardo Ospina Duque', esJefe: false },
        { id: 'E010', idColaborador: '1011000010', nombre: 'Laura Valentina Rodríguez Martínez', cargo: 'Asesora Comercial', area: 'Ventas', genero: 'F', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop', jefe: 'Ricardo Ospina Duque', esJefe: false },
        { id: 'E011', idColaborador: '1011000011', nombre: 'Miguel Ángel Hernández Díaz', cargo: 'Asesor Comercial', area: 'Ventas', genero: 'M', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop', jefe: 'Ricardo Ospina Duque', esJefe: false },
        { id: 'E012', idColaborador: '1011000012', nombre: 'Natalia Sofía Torres Sánchez', cargo: 'Asesora Comercial', area: 'Ventas', genero: 'F', avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop', jefe: 'Ricardo Ospina Duque', esJefe: false },
        { id: 'E013', idColaborador: '1011000013', nombre: 'Sebastián Felipe Gómez Álvarez', cargo: 'Ejecutivo de Cuenta Corporativa', area: 'Ventas', genero: 'M', avatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=100&h=100&fit=crop', jefe: 'Ricardo Ospina Duque', esJefe: false },
        { id: 'E014', idColaborador: '1011000014', nombre: 'Juliana Andrea Pérez Castro', cargo: 'Ejecutiva de Cuenta Corporativa', area: 'Ventas', genero: 'F', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop', jefe: 'Ricardo Ospina Duque', esJefe: false },
        { id: 'E015', idColaborador: '1011000015', nombre: 'Juan David López González', cargo: 'Técnico Instalador de Persianas', area: 'Instalaciones', genero: 'M', avatar: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=100&h=100&fit=crop', jefe: 'Fernando Castro Restrepo', esJefe: false },
        { id: 'E016', idColaborador: '1011000016', nombre: 'Diego Alejandro Martínez Romero', cargo: 'Técnico Instalador de Pérgolas', area: 'Instalaciones', genero: 'M', avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=100&h=100&fit=crop', jefe: 'Fernando Castro Restrepo', esJefe: false },
        { id: 'E017', idColaborador: '1011000017', nombre: 'Camilo Ernesto Sánchez Vargas', cargo: 'Técnico Instalador de Toldos', area: 'Instalaciones', genero: 'M', avatar: 'https://images.unsplash.com/photo-1583195764036-6dc248ac07d9?w=100&h=100&fit=crop', jefe: 'Fernando Castro Restrepo', esJefe: false },
        { id: 'E018', idColaborador: '1011000018', nombre: 'Andrés Felipe Ruiz Mendoza', cargo: 'Técnico Instalador de Polarizados', area: 'Instalaciones', genero: 'M', avatar: 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=100&h=100&fit=crop', jefe: 'Fernando Castro Restrepo', esJefe: false },
        { id: 'E019', idColaborador: '1011000019', nombre: 'Santiago José Díaz Suárez', cargo: 'Técnico Instalador de Grama Sintética', area: 'Instalaciones', genero: 'M', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop', jefe: 'Fernando Castro Restrepo', esJefe: false },
        { id: 'E020', idColaborador: '1011000020', nombre: 'Daniel Esteban Ortiz Restrepo', cargo: 'Técnico Instalador de Papel de Colgadura', area: 'Instalaciones', genero: 'M', avatar: 'https://images.unsplash.com/photo-1557862921-37829c790f19?w=100&h=100&fit=crop', jefe: 'Fernando Castro Restrepo', esJefe: false },
        { id: 'E021', idColaborador: '1011000021', nombre: 'Carolina María Álvarez Torres', cargo: 'Coordinadora de Instalaciones', area: 'Instalaciones', genero: 'F', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop', jefe: 'Fernando Castro Restrepo', esJefe: false },
        { id: 'E022', idColaborador: '1011000022', nombre: 'Iván Mauricio Romero Jiménez', cargo: 'Auxiliar de Instalaciones', area: 'Instalaciones', genero: 'M', avatar: 'https://images.unsplash.com/photo-1600486913747-55e5470d6f40?w=100&h=100&fit=crop', jefe: 'Fernando Castro Restrepo', esJefe: false },
        { id: 'E023', idColaborador: '1011000023', nombre: 'José Luis González Pérez', cargo: 'Técnico de Reparación de Persianas', area: 'Reparaciones', genero: 'M', avatar: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=100&h=100&fit=crop', jefe: 'Claudia Vargas Mendoza', esJefe: false },
        { id: 'E024', idColaborador: '1011000024', nombre: 'Diana Patricia Morales Herrera', cargo: 'Técnica de Reparación de Cortinas', area: 'Reparaciones', genero: 'F', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&h=100&fit=crop', jefe: 'Claudia Vargas Mendoza', esJefe: false },
        { id: 'E025', idColaborador: '1011000025', nombre: 'Pablo Antonio Castro Ríos', cargo: 'Técnico de Reparación de Toldos', area: 'Reparaciones', genero: 'M', avatar: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=100&h=100&fit=crop', jefe: 'Claudia Vargas Mendoza', esJefe: false },
        { id: 'E026', idColaborador: '1011000026', nombre: 'Sandra Milena Rojas Pineda', cargo: 'Técnica de Reparación de Pérgolas', area: 'Reparaciones', genero: 'F', avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&h=100&fit=crop', jefe: 'Claudia Vargas Mendoza', esJefe: false },
        { id: 'E027', idColaborador: '1011000027', nombre: 'Gustavo Hernán Mejía López', cargo: 'Técnico Senior de Mantenimiento', area: 'Reparaciones', genero: 'M', avatar: 'https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?w=100&h=100&fit=crop', jefe: 'Claudia Vargas Mendoza', esJefe: false },
        { id: 'E028', idColaborador: '1011000028', nombre: 'Marcela Isabel Duque Vásquez', cargo: 'Coordinadora de Garantías', area: 'Reparaciones', genero: 'F', avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=100&h=100&fit=crop', jefe: 'Claudia Vargas Mendoza', esJefe: false },
        { id: 'E029', idColaborador: '1011000029', nombre: 'Paola Andrea Hernández Gil', cargo: 'Agente de Servicio al Cliente', area: 'Atención al Cliente', genero: 'F', avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=100&h=100&fit=crop', jefe: 'Andrea Suárez Gómez', esJefe: false },
        { id: 'E030', idColaborador: '1011000030', nombre: 'Nicolás Esteban Vargas Quintero', cargo: 'Agente de Servicio al Cliente', area: 'Atención al Cliente', genero: 'M', avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&h=100&fit=crop', jefe: 'Andrea Suárez Gómez', esJefe: false },
        { id: 'E031', idColaborador: '1011000031', nombre: 'Valentina Isabel Ospina Mejía', cargo: 'Especialista en Seguimiento Postventa', area: 'Atención al Cliente', genero: 'F', avatar: 'https://images.unsplash.com/photo-1548142813-c348350df52b?w=100&h=100&fit=crop', jefe: 'Andrea Suárez Gómez', esJefe: false },
        { id: 'E032', idColaborador: '1011000032', nombre: 'Óscar Eduardo Restrepo Cárdenas', cargo: 'Especialista en Quejas y Reclamos', area: 'Atención al Cliente', genero: 'M', avatar: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=100&h=100&fit=crop', jefe: 'Andrea Suárez Gómez', esJefe: false },
        { id: 'E033', idColaborador: '1011000033', nombre: 'Isabella Sofía Muñoz Arias', cargo: 'Agente de Cotizaciones', area: 'Atención al Cliente', genero: 'F', avatar: 'https://images.unsplash.com/photo-1558898479-33c0057a5d12?w=100&h=100&fit=crop', jefe: 'Andrea Suárez Gómez', esJefe: false },
        { id: 'E034', idColaborador: '1011000034', nombre: 'Camila Andrea Cárdenas Lozano', cargo: 'Recepcionista', area: 'Atención al Cliente', genero: 'F', avatar: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=100&h=100&fit=crop', jefe: 'Andrea Suárez Gómez', esJefe: false },
        { id: 'E035', idColaborador: '1011000035', nombre: 'Luis Fernando Giraldo Ochoa', cargo: 'Coordinador de Bodega', area: 'Logística', genero: 'M', avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=100&h=100&fit=crop', jefe: 'María Alejandra Sánchez Pardo', esJefe: false },
        { id: 'E036', idColaborador: '1011000036', nombre: 'Lina María Salazar Bedoya', cargo: 'Auxiliar de Inventarios', area: 'Logística', genero: 'F', avatar: 'https://images.unsplash.com/photo-1601412436009-d964bd02edbc?w=100&h=100&fit=crop', jefe: 'María Alejandra Sánchez Pardo', esJefe: false },
        { id: 'E037', idColaborador: '1011000037', nombre: 'Hernán Darío Zapata Monsalve', cargo: 'Conductor de Entregas', area: 'Logística', genero: 'M', avatar: 'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=100&h=100&fit=crop', jefe: 'María Alejandra Sánchez Pardo', esJefe: false },
        { id: 'E038', idColaborador: '1011000038', nombre: 'Ángela Patricia Londoño Henao', cargo: 'Auxiliar de Despachos', area: 'Logística', genero: 'F', avatar: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=100&h=100&fit=crop', jefe: 'María Alejandra Sánchez Pardo', esJefe: false },
        { id: 'E039', idColaborador: '1011000039', nombre: 'Eduardo José Arango Uribe', cargo: 'Conductor de Entregas', area: 'Logística', genero: 'M', avatar: 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=100&h=100&fit=crop', jefe: 'María Alejandra Sánchez Pardo', esJefe: false },
        { id: 'E040', idColaborador: '1011000040', nombre: 'Vanessa Alejandra Botero Ríos', cargo: 'Coordinadora de Rutas', area: 'Logística', genero: 'F', avatar: 'https://images.unsplash.com/photo-1592621385612-4d7129426394?w=100&h=100&fit=crop', jefe: 'María Alejandra Sánchez Pardo', esJefe: false },
        { id: 'E041', idColaborador: '1011000041', nombre: 'Lucía Fernanda Correa Marín', cargo: 'Contadora', area: 'Administración', genero: 'F', avatar: 'https://images.unsplash.com/photo-1614644147798-f8c0fc9da7f6?w=100&h=100&fit=crop', jefe: 'Mónica Jiménez Pérez', esJefe: false },
        { id: 'E042', idColaborador: '1011000042', nombre: 'Felipe Andrés Montoya Jaramillo', cargo: 'Auxiliar Contable', area: 'Administración', genero: 'M', avatar: 'https://images.unsplash.com/photo-1603415526960-f7e0328c63b1?w=100&h=100&fit=crop', jefe: 'Mónica Jiménez Pérez', esJefe: false },
        { id: 'E043', idColaborador: '1011000043', nombre: 'Daniela Cristina Velásquez Parra', cargo: 'Analista de Recursos Humanos', area: 'Administración', genero: 'F', avatar: 'https://images.unsplash.com/photo-1629747490241-624f07d70e1e?w=100&h=100&fit=crop', jefe: 'Mónica Jiménez Pérez', esJefe: false },
        { id: 'E044', idColaborador: '1011000044', nombre: 'Mauricio Alberto Escobar Flórez', cargo: 'Analista de Compras', area: 'Administración', genero: 'M', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop', jefe: 'Mónica Jiménez Pérez', esJefe: false },
        { id: 'E045', idColaborador: '1011000045', nombre: 'Paula Alejandra Naranjo Galeano', cargo: 'Asistente Administrativa', area: 'Administración', genero: 'F', avatar: 'https://images.unsplash.com/photo-1589571894960-20bbe2828d0a?w=100&h=100&fit=crop', jefe: 'Mónica Jiménez Pérez', esJefe: false },
        { id: 'E046', idColaborador: '1011000046', nombre: 'Catalina María Hoyos Rendón', cargo: 'Tesorera', area: 'Administración', genero: 'F', avatar: 'https://images.unsplash.com/photo-1619895862022-09114b41f16f?w=100&h=100&fit=crop', jefe: 'Mónica Jiménez Pérez', esJefe: false },
        { id: 'E047', idColaborador: '1011000047', nombre: 'Alejandra María Saldarriaga Tobón', cargo: 'Diseñadora Gráfica', area: 'Marketing', genero: 'F', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', jefe: 'Alejandro Moreno Ruiz', esJefe: false },
        { id: 'E048', idColaborador: '1011000048', nombre: 'David Santiago Gutiérrez Ossa', cargo: 'Community Manager', area: 'Marketing', genero: 'M', avatar: null, jefe: 'Alejandro Moreno Ruiz', esJefe: false },
        { id: 'E049', idColaborador: '1011000049', nombre: 'Sara Valentina Castaño Sierra', cargo: 'Fotógrafa de Producto', area: 'Marketing', genero: 'F', avatar: 'https://images.unsplash.com/photo-1508243771214-6e95d137426b?w=100&h=100&fit=crop', jefe: 'Alejandro Moreno Ruiz', esJefe: false },
        { id: 'E050', idColaborador: '1011000050', nombre: 'Mateo José Gómez Cardona', cargo: 'Especialista en Pauta Digital', area: 'Marketing', genero: 'M', avatar: 'https://images.unsplash.com/photo-1605462863863-10d9e47e15ee?w=100&h=100&fit=crop', jefe: 'Alejandro Moreno Ruiz', esJefe: false },
        { id: 'E051', idColaborador: '1011000051', nombre: 'María José Aristizábal Correa', cargo: 'Analista de Contenidos', area: 'Marketing', genero: 'F', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&h=100&fit=crop', jefe: 'Alejandro Moreno Ruiz', esJefe: false },
        { id: 'E053', idColaborador: '1011000053', nombre: 'Roberto Carlos Méndez Soto', cargo: 'Encargado de Objetivos y OKRs', area: 'Recursos Humanos', genero: 'M', avatar: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=100&h=100&fit=crop', jefe: 'Carmen Rosa Díaz Herrera', esJefe: false },
        { id: 'E054', idColaborador: '1011000054', nombre: 'Adriana Lucía Ríos Calle', cargo: 'Encargada de Encuestas (Cultura, Salud, 360)', area: 'Recursos Humanos', genero: 'F', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop', jefe: 'Carmen Rosa Díaz Herrera', esJefe: false },
        { id: 'E055', idColaborador: '1011000055', nombre: 'Martín Andrés Soto Vega', cargo: 'Encargado de Nómina', area: 'Recursos Humanos', genero: 'M', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop', jefe: 'Carmen Rosa Díaz Herrera', esJefe: false }
    ];

    function getReportesDirectosEjemplo(nombreLider) {
        return EMPLEADOS_EJEMPLO.filter(function(e) { return e.jefe === nombreLider; }).map(function(e) { return e.nombre; });
    }

    const INICIO_RANGO = '2025-01-01';
    const FIN_RANGO = '2026-02-28';

    const TITULOS_TAREAS = [
        'Revisar inventario bodega', 'Orden de compra pendiente', 'Seguimiento a proveedores', 'Cierre de ciclo logístico',
        'Informe de entregas', 'Coordinación con transporte', 'Actualizar trazabilidad', 'Revisión de KPIs logísticos',
        'Capacitación equipo bodega', 'Auditoría de procesos', 'Plan de contingencia', 'Reunión con operaciones',
        'Validar documentación de carga', 'Seguimiento reclamos', 'Optimización de rutas', 'Checklist de seguridad',
        'Reporte mensual logística', 'Alistamiento de pedidos', 'Coordinación con ventas', 'Revisar SLA de entregas',
        'Preparar presentación gerencia', 'Seguimiento indicadores', 'Actualizar procedimientos', 'Cierre de no conformidades',
        'Reunión semanal equipo', 'Revisar contratos de almacenamiento', 'Solicitud de cotizaciones', 'Análisis de costos',
        'Capacitación normativa', 'Inspección de instalaciones', 'Seguimiento metas trimestre', 'Preparar presupuesto área',
        'Evaluación de desempeño', 'Plan de mejora continua', 'Documentar lecciones aprendidas', 'Revisar política de devoluciones',
        'Coordinación con calidad', 'Seguimiento a indicadores', 'Cierre de incidentes', 'Reunión de seguimiento',
        'Actualizar base de datos', 'Verificar cumplimiento normativo', 'Preparar datos para auditoría', 'Revisar contratos vigentes',
        'Seguimiento a acciones correctivas', 'Capacitación en sistema WMS', 'Revisión de stock mínimo', 'Plan de abastecimiento'
    ];

    const NOMBRES_PLANES_IND = [
        'Metas personales Q1', 'Desarrollo profesional', 'Seguimiento objetivos', 'Plan de lectura', 'Capacitaciones personales',
        'Organización semanal', 'Proyectos propios', 'Mejora de procesos', 'Seguimiento indicadores', 'Plan de carrera',
        'Objetivos trimestrales', 'Formación continua', 'Tareas recurrentes', 'Seguimiento mensual', 'Plan de acción'
    ];

    function seeder(seed, i) {
        const x = Math.sin(seed * 9999 + i * 12345) * 10000;
        return x - Math.floor(x);
    }

    /** Regla 3: reparte TAREAS_POR_MES en Finalizadas (70-85%), Iniciadas (10-20%), Vencidas (5-15%) */
    function repartoEstados(seed, baseIndex) {
        const r = seeder(seed, baseIndex);
        const pFinalizadas = PCT_FINALIZADAS_MIN + r * PCT_FINALIZADAS_RANGO;
        const r2 = seeder(seed, baseIndex + 1);
        const pIniciadas = PCT_INICIADAS_MIN + r2 * PCT_INICIADAS_RANGO;
        const pVencidas = 1 - pFinalizadas - pIniciadas;
        const n = TAREAS_POR_MES;
        let nF = Math.round(n * pFinalizadas);
        let nI = Math.round(n * pIniciadas);
        let nV = n - nF - nI;
        if (nV < 0) { nV = 0; nI = n - nF; }
        if (nI < 0) { nI = 0; nV = n - nF; }
        return { nFinalizadas: nF, nIniciadas: nI, nVencidas: nV };
    }

    // Constantes de reglas (regla 1 y 2)
    const TAREAS_POR_MES = 30;
    const TAREAS_INDIVIDUALES_POR_MES = 10;
    const TAREAS_GRUPALES_POR_MES = 20;
    const PLANES_INDIVIDUALES_POR_MES = 3;
    // 95% tareas en plan, 5% sueltas (solo las ve el creador). 9 en 3 planes de 3, 1 suelta.
    const TAMANOS_GRUPOS_INDIVIDUALES = [3, 3, 3];

    // Regla 3: rangos de distribución de estados en tareas (70-85% / 10-20% / 5-15%)
    const PCT_FINALIZADAS_MIN = 0.70;
    const PCT_FINALIZADAS_RANGO = 0.15;
    const PCT_INICIADAS_MIN = 0.10;
    const PCT_INICIADAS_RANGO = 0.10;

    // Regla 4: rangos de distribución de estados en planes (70-85% / 10-20% / 5-15%)
    const PCT_PLAN_FINALIZADOS_MIN = 0.70;
    const PCT_PLAN_FINALIZADOS_RANGO = 0.15;
    const PCT_PLAN_INICIADOS_MIN = 0.10;
    const PCT_PLAN_INICIADOS_RANGO = 0.10;

    function repartoEstadoPlan(seed, planIndex) {
        const pF = PCT_PLAN_FINALIZADOS_MIN + seeder(seed, planIndex * 3) * PCT_PLAN_FINALIZADOS_RANGO;
        const pI = PCT_PLAN_INICIADOS_MIN + seeder(seed, planIndex * 3 + 1) * PCT_PLAN_INICIADOS_RANGO;
        const pV = 1 - pF - pI;
        const r = seeder(seed, planIndex * 3 + 2);
        if (r < pF) return 'Finalizado';
        if (r < pF + pI) return 'Activo';
        return 'Vencido';
    }

    let actividadesSeguimiento = [];
    let tareasPorEmpleadoParaVistaTareas = {};
    let currentUserEmpleadoId = null;
    let planesIndividualesMaria = [];
    let planDetalleCompleto = {};
    let tareasPorPlanCompleto = {};
    let planNombreToId = {};

    function generarDatos() {
        const empleados = (EMPLEADOS_EJEMPLO && EMPLEADOS_EJEMPLO.length)
            ? EMPLEADOS_EJEMPLO
            : [{
                id: USUARIO_ACTUAL.id,
                idColaborador: USUARIO_ACTUAL.idColaborador,
                nombre: USUARIO_ACTUAL.nombre,
                cargo: USUARIO_ACTUAL.cargo,
                area: USUARIO_ACTUAL.area,
                jefe: null,
                avatar: USUARIO_ACTUAL.avatar,
                esJefe: USUARIO_ACTUAL.esJefe,
                username: USUARIO_ACTUAL.username
            }];
        const jefes = (JEFES_EJEMPLO && JEFES_EJEMPLO.length) ? [GERENTE_EJEMPLO].concat(JEFES_EJEMPLO) : [];
        currentUserEmpleadoId = null;

        const todayStr = getTodayString();
        const [y0, m0] = INICIO_RANGO.split('-').map(Number);
        const [y1, m1] = FIN_RANGO.split('-').map(Number);
        const monthsTotal = (y1 - y0) * 12 + (m1 - m0) + 1;

        let idActividad = 10001;
        actividadesSeguimiento = [];
        tareasPorEmpleadoParaVistaTareas = {};
        planesIndividualesMaria = [];
        planDetalleCompleto = {};
        tareasPorPlanCompleto = {};
        planNombreToId = {};
        let planGlobalIndex = 0;
        const PLAN_SEED = 7777;

        empleados.forEach((emp, empIndex) => {
            const username = emp.username || generarUsername(emp.nombre);
            const empleadoId = emp.id || emp.idColaborador || String(empIndex);
            if (currentUserEmpleadoId == null && (emp.nombre === USUARIO_ACTUAL.nombre || username === USUARIO_ACTUAL.username)) currentUserEmpleadoId = empleadoId;
            if (empleados.length === 1) currentUserEmpleadoId = empleadoId;
            tareasPorEmpleadoParaVistaTareas[empleadoId] = { individuales: [], grupales: [] };
            const seed = (empIndex + 1) * 1000;

            for (let mi = 0; mi < monthsTotal; mi++) {
                const year = y0 + Math.floor(mi / 12);
                const month = (mi % 12) + 1;
                const daysInMonth = new Date(year, month, 0).getDate();
                const baseIdx = empIndex * 1000 + mi * TAREAS_POR_MES;
                const { nFinalizadas, nIniciadas, nVencidas } = repartoEstados(seed, baseIdx);
                const estados = [];
                for (let i = 0; i < nFinalizadas; i++) estados.push('Finalizada');
                for (let i = 0; i < nIniciadas; i++) estados.push('Iniciada');
                for (let i = 0; i < nVencidas; i++) estados.push('Vencida');
                for (let i = estados.length; i < TAREAS_POR_MES; i++) estados.push('Finalizada');
                shuffleArray(estados, seed + baseIdx);

                const planNombreGrupo = `Plan ${emp.area || 'General'} ${pad(month)}/${year}`;
                const lider = obtenerJefe(emp.area, emp.esJefe, jefes);
                const asignado = { nombre: emp.nombre, avatar: emp.avatar || '', username: username };
                const esAreaHR = (emp.area || '') === 'Recursos Humanos';
                const creadorNombre = esAreaHR ? (jefes.find(j => (j.area || '') === 'Recursos Humanos') || {}).nombre || emp.nombre : emp.nombre;
                const areaCreadorTarea = esAreaHR ? 'Recursos Humanos' : (emp.area || 'General');

                for (let i = 0; i < TAREAS_POR_MES; i++) {
                    const estado = estados[i];
                    const done = estado === 'Finalizada';
                    const r = seeder(seed, baseIdx + i + 100);
                    let day = Math.max(1, Math.min(daysInMonth, Math.floor(r * daysInMonth) + 1));
                    const endDateStr = `${year}-${pad(month)}-${pad(day)}`;
                    const endDate = new Date(year, month - 1, day);
                    const fechaCreacion = new Date(year, month - 1, Math.max(1, day - 2));
                    const prioridades = ['Alta', 'Media', 'Baja'];
                    const prioridad = prioridades[Math.floor(seeder(seed, baseIdx + i + 200) * 3)];
                    const nombreTarea = TITULOS_TAREAS[(baseIdx + i) % TITULOS_TAREAS.length];

                    const tareaVista = {
                        id: idActividad,
                        name: nombreTarea,
                        done: done,
                        status: estado === 'Finalizada' ? 'Finalizado' : (estado === 'Vencida' ? 'Vencido' : 'Activo'),
                        endDate: endDateStr,
                        priority: prioridad.toLowerCase(),
                        assignee_email: username,
                        assignee_name: emp.nombre || null,
                        assignee_avatar_url: (emp.avatar && String(emp.avatar).trim()) ? emp.avatar : null,
                        etiqueta: null,
                        created_by: emp.nombre,
                        created_by_avatar_url: emp.avatar || '',
                        role: 'colaborador',
                        planId: null,
                        planNombre: null,
                        description: seeder(seed, baseIdx + i + 400) > 0.7 ? 'Seguimiento y cierre.' : null
                    };

                    if (i < TAREAS_INDIVIDUALES_POR_MES) {
                        tareasPorEmpleadoParaVistaTareas[empleadoId].individuales.push(Object.assign({}, tareaVista));
                    } else {
                        const tareaGrupo = Object.assign({}, tareaVista, { planNombre: planNombreGrupo });
                        tareasPorEmpleadoParaVistaTareas[empleadoId].grupales.push(tareaGrupo);
                        actividadesSeguimiento.push({
                            id: idActividad,
                            tipo: 'tarea',
                            nombre: nombreTarea,
                            plan: planNombreGrupo,
                            asignado: asignado,
                            idColaborador: emp.idColaborador || emp.id,
                            area: emp.area || 'General',
                            areaCreador: areaCreadorTarea,
                            lider: lider,
                            cargo: emp.cargo || '',
                            estado: estado,
                            prioridad: prioridad,
                            avance: done ? 100 : 0,
                            fechaCreacion: formatearFechaSeguimiento(fechaCreacion),
                            fechaFinalizacion: formatearFechaSeguimiento(endDate),
                            creador: creadorNombre,
                            creador_avatar: (emp.avatar && String(emp.avatar).trim()) ? emp.avatar : null,
                            comentarios: Math.floor(seeder(seed, baseIdx + i + 300) * 5)
                        });
                    }
                    idActividad++;
                }

                if (empleadoId === currentUserEmpleadoId) {
                    const indBase = mi * TAREAS_INDIVIDUALES_POR_MES;
                    const inds = tareasPorEmpleadoParaVistaTareas[empleadoId].individuales;
                    const grupos = [];
                    let offset = 0;
                    for (let g = 0; g < TAMANOS_GRUPOS_INDIVIDUALES.length; g++) {
                        const size = TAMANOS_GRUPOS_INDIVIDUALES[g];
                        grupos.push(inds.slice(indBase + offset, indBase + offset + size));
                        offset += size;
                    }
                    const planFechaCreacion = `${year}-${pad(month)}-${pad(1)}`;
                    grupos.forEach((tasks, p) => {
                        if (tasks.length === 0) return;
                        const planId = 'ind-' + (empIndex * 100 + mi * 3 + p + 100);
                        const planEndDay = Math.max(1, Math.min(daysInMonth, 5 + p * 8));
                        const planEndDate = `${year}-${pad(month)}-${pad(planEndDay)}`;
                        const planName = NOMBRES_PLANES_IND[(mi + p) % NOMBRES_PLANES_IND.length] + ' ' + pad(month) + '/' + year;
                        const tasksDone = tasks.filter(t => t.done).length;
                        const statusPlan = repartoEstadoPlan(PLAN_SEED, planGlobalIndex++);
                        const finished = statusPlan === 'Finalizado';
                        const progress = tasks.length > 0 ? Math.round((tasksDone / tasks.length) * 100) : 0;
                        tasks.forEach(t => { t.planId = planId; });
                        const planObj = {
                            id: planId,
                            name: planName,
                            description: 'Plan individual de ' + emp.nombre + '.',
                            end_date: planEndDate,
                            status: statusPlan,
                            tasksDone: tasksDone,
                            tasksTotal: tasks.length,
                            finished: finished,
                            hasMembers: false,
                            created_by: emp.nombre,
                            fechaCreacion: planFechaCreacion,
                            progress: progress
                        };
                        planesIndividualesMaria.push(planObj);
                        planDetalleCompleto[planId] = planObj;
                        tareasPorPlanCompleto[planId] = tasks.map(t => Object.assign({}, t));
                    });
                }
            }
        });

        // Planes de compañía creados por HR: Objetivos Qx 20xx y Encuestas Qx 20xx. Una tarea por persona y por mes del trimestre (toda la compañía).
        const encargadoObjetivos = empleados.find(e => (e.cargo || '').indexOf('Objetivos') >= 0 && (e.area || '') === 'Recursos Humanos');
        const encargadaEncuestas = empleados.find(e => (e.cargo || '').indexOf('Encuestas') >= 0 && (e.area || '') === 'Recursos Humanos');
        const asignadosCompania = empleados.filter(e => (e.area || '') !== 'Recursos Humanos' && (e.area || '') !== 'Gerencia General');
        const quarters = [
            { label: 'Q1 2025', year: 2025, monthStart: 1 },
            { label: 'Q2 2025', year: 2025, monthStart: 4 },
            { label: 'Q3 2025', year: 2025, monthStart: 7 },
            { label: 'Q4 2025', year: 2025, monthStart: 10 },
            { label: 'Q1 2026', year: 2026, monthStart: 1 }
        ];
        const tareasObjetivos = ['Crear objetivos en la interfaz', 'Actualizar avance de objetivos', 'Cargar progreso final de objetivos'];
        const tareasEncuestas = ['Contestar encuesta de cultura', 'Contestar encuesta de salud', 'Contestar encuesta 360'];
        quarters.forEach(function(q, qIdx) {
            const year = q.year;
            const mesInicio = q.monthStart;
            ['Objetivos', 'Encuestas'].forEach(function(tipo, tipoIdx) {
                const nombrePlan = tipo + ' ' + q.label;
                const creadorEmp = tipo === 'Objetivos' ? encargadoObjetivos : encargadaEncuestas;
                const creadorNombre = creadorEmp ? creadorEmp.nombre : (tipo === 'Objetivos' ? 'Roberto Carlos Méndez Soto' : 'Adriana Lucía Ríos Calle');
                const tareasTitulos = tipo === 'Objetivos' ? tareasObjetivos : tareasEncuestas;
                for (let mes = 0; mes < 3; mes++) {
                    const m = mesInicio + mes;
                    const day = 15;
                    const endDateStr = year + '-' + pad(m) + '-' + pad(day);
                    const endDate = new Date(year, m - 1, day);
                    const fechaCreacion = new Date(year, m - 1, Math.max(1, day - 2));
                    asignadosCompania.forEach(function(empAsig, idxCompania) {
                        const asignado = { nombre: empAsig.nombre, avatar: empAsig.avatar || '', username: empAsig.username || generarUsername(empAsig.nombre) };
                        const estado = seeder(8888, idActividad + idxCompania * 10 + mes) < 0.75 ? 'Finalizada' : (seeder(8888, idActividad + idxCompania * 10 + mes + 1) < 0.5 ? 'Iniciada' : 'Vencida');
                        const done = estado === 'Finalizada';
                        actividadesSeguimiento.push({
                            id: idActividad,
                            tipo: 'tarea',
                            nombre: tareasTitulos[mes],
                            plan: nombrePlan,
                            asignado: asignado,
                            idColaborador: empAsig.idColaborador || empAsig.id,
                            area: empAsig.area || 'General',
                            areaCreador: 'Recursos Humanos',
                            lider: obtenerJefe(empAsig.area, empAsig.esJefe, jefes),
                            cargo: empAsig.cargo || '',
                            estado: estado,
                            prioridad: 'Media',
                            avance: done ? 100 : 0,
                            fechaCreacion: formatearFechaSeguimiento(fechaCreacion),
                            fechaFinalizacion: formatearFechaSeguimiento(endDate),
                            creador: creadorNombre,
                            creador_avatar: creadorEmp && (creadorEmp.avatar && String(creadorEmp.avatar).trim()) ? creadorEmp.avatar : null,
                            comentarios: 0
                        });
                        idActividad++;
                    });
                }
            });
        });

        // Construir actividades tipo 'plan' para el tab Planes de seguimiento (agrupando tareas por plan)
        const planIdBase = 50000;
        let planIdNext = planIdBase;
        const byPlan = {};
        actividadesSeguimiento.forEach(function(t) {
            if (t.tipo !== 'tarea' || !t.plan) return;
            const key = t.plan;
            if (!byPlan[key]) {
                byPlan[key] = { tareas: [], asignadosMap: new Map() };
            }
            byPlan[key].tareas.push(t);
            if (t.asignado && t.asignado.nombre) {
                byPlan[key].asignadosMap.set(t.asignado.nombre, {
                    id: t.idColaborador,
                    nombre: t.asignado.nombre,
                    avatar: t.asignado.avatar || '',
                    username: t.asignado.username || generarUsername(t.asignado.nombre)
                });
            }
        });
        Object.keys(byPlan).forEach(function(nombrePlan) {
            const g = byPlan[nombrePlan];
            const tareas = g.tareas;
            if (tareas.length === 0) return;
            const primera = tareas[0];
            const asignados = Array.from(g.asignadosMap.values());
            const tareasFinalizadas = tareas.filter(function(t) { return t.estado === 'Finalizada'; }).length;
            const avancePlan = tareas.length > 0 ? Math.round((tareasFinalizadas / tareas.length) * 100) : 0;
            const statusPlan = repartoEstadoPlan(PLAN_SEED, planGlobalIndex++);
            const estadoPlan = statusPlan === 'Finalizado' ? 'Finalizada' : (statusPlan === 'Vencido' ? 'Vencida' : 'Iniciada');
            const fechasCreacion = tareas.map(function(t) { return parseFechaSeguimiento(t.fechaCreacion); }).filter(Boolean);
            const fechasFinVal = tareas.map(function(t) { return parseFechaSeguimiento(t.fechaFinalizacion); }).filter(Boolean);
            const minCreacion = fechasCreacion.length ? new Date(Math.min.apply(null, fechasCreacion)) : primera.fechaCreacion;
            const maxFin = fechasFinVal.length ? new Date(Math.max.apply(null, fechasFinVal)) : primera.fechaFinalizacion;
            const planId = planIdNext++;
            const planEndDateStr = typeof maxFin === 'object' && maxFin instanceof Date ? (maxFin.getFullYear() + '-' + pad(maxFin.getMonth() + 1) + '-' + pad(maxFin.getDate())) : null;
            const planFechaCreacionStr = typeof minCreacion === 'object' && minCreacion instanceof Date ? (minCreacion.getFullYear() + '-' + pad(minCreacion.getMonth() + 1) + '-' + pad(minCreacion.getDate())) : null;
            const planObj = {
                id: planId,
                name: nombrePlan,
                description: 'Plan grupal de ' + (primera.area || 'área') + '.',
                end_date: planEndDateStr,
                status: estadoPlan === 'Finalizada' ? 'Finalizado' : (estadoPlan === 'Vencida' ? 'Vencido' : 'Activo'),
                tasksDone: tareasFinalizadas,
                tasksTotal: tareas.length,
                finished: estadoPlan === 'Finalizada',
                hasMembers: true,
                created_by: primera.creador,
                fechaCreacion: planFechaCreacionStr,
                progress: avancePlan
            };
            planDetalleCompleto[planId] = planObj;
            planNombreToId[nombrePlan] = planId;
            actividadesSeguimiento.push({
                id: planId,
                tipo: 'plan',
                nombre: nombrePlan,
                plan: nombrePlan,
                asignado: asignados[0] || { nombre: primera.creador, avatar: '', username: '' },
                asignados: asignados,
                idColaborador: primera.idColaborador,
                area: primera.area,
                areaCreador: primera.areaCreador != null ? primera.areaCreador : primera.area,
                lider: primera.lider,
                cargo: primera.cargo || '',
                estado: estadoPlan,
                prioridad: 'Media',
                avance: avancePlan,
                totalTareas: tareas.length,
                fechaCreacion: typeof minCreacion === 'object' && minCreacion instanceof Date ? formatearFechaSeguimiento(minCreacion) : primera.fechaCreacion,
                fechaFinalizacion: typeof maxFin === 'object' && maxFin instanceof Date ? formatearFechaSeguimiento(maxFin) : primera.fechaFinalizacion,
                creador: primera.creador,
                comentarios: 0
            });
        });
    }

    function parseFechaSeguimiento(fechaStr) {
        if (!fechaStr) return null;
        const meses = { 'ene': 0, 'feb': 1, 'mar': 2, 'abr': 3, 'may': 4, 'jun': 5, 'jul': 6, 'ago': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dic': 11 };
        const partes = fechaStr.trim().split(/[\s\/\-]+/);
        if (partes.length >= 3 && partes[1].toLowerCase() in meses) {
            const dia = parseInt(partes[0], 10);
            const mes = meses[partes[1].toLowerCase()];
            const anio = parseInt(partes[2], 10);
            if (!isNaN(dia) && !isNaN(mes) && !isNaN(anio)) return new Date(anio, mes, dia);
        }
        return null;
    }

    function shuffleArray(arr, seed) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(seeder(seed, i) * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }

    generarDatos();

    function getUsuarioActual() {
        return Object.assign({}, USUARIO_ACTUAL);
    }

    function getTareasVistaTareas() {
        const empleadoId = currentUserEmpleadoId != null ? currentUserEmpleadoId : USUARIO_ACTUAL.id;
        const data = tareasPorEmpleadoParaVistaTareas[empleadoId] || { individuales: [], grupales: [] };
        const todasTareas = []
            .concat(data.individuales.map(t => Object.assign({}, t, { created_by: USUARIO_ACTUAL.nombre, created_by_avatar_url: USUARIO_ACTUAL.avatar })))
            .concat(data.grupales.map(t => Object.assign({}, t, { created_by: USUARIO_ACTUAL.nombre, created_by_avatar_url: USUARIO_ACTUAL.avatar })));
        todasTareas.forEach(function(t) {
            if (t.planNombre && planNombreToId[t.planNombre] != null) t.planId = planNombreToId[t.planNombre];
        });

        const vencidas = todasTareas.filter(t => t.status === 'Vencido').map(t => Object.assign({}, t));
        const porDia = {};
        todasTareas.filter(t => t.endDate).forEach(t => {
            const c = Object.assign({}, t);
            if (!porDia[c.endDate]) porDia[c.endDate] = [];
            porDia[c.endDate].push(c);
        });
        return { vencidas, porDia };
    }

    function fechaSeguimientoToYYYYMMDD(fechaStr) {
        var d = parseFechaSeguimiento(fechaStr);
        if (!d) return null;
        return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
    }

    function estadoPlanToStatus(estado) {
        if (estado === 'Finalizada') return 'Finalizado';
        if (estado === 'Vencida') return 'Vencido';
        return 'Activo';
    }

    // Una sola BD de planes: lista y detalle usan el mismo objeto (cada vista usa los campos que necesita).
    function getPlanesVistaPlanes() {
        var individuales = planesIndividualesMaria.map(function(p) { return Object.assign({}, p); });
        var grupales = Object.keys(planDetalleCompleto).filter(function(k) {
            var n = parseInt(k, 10);
            return !isNaN(n) && n >= 50000;
        }).map(function(k) { return Object.assign({}, planDetalleCompleto[k]); });
        return individuales.concat(grupales);
    }

    function getPlanDetalle(planId) {
        var id = String(planId);
        if (planDetalleCompleto[id]) return Object.assign({}, planDetalleCompleto[id]);
        return null;
    }

    function getTareasPorPlan(planId) {
        var id = String(planId);
        var list = tareasPorPlanCompleto[id];
        if (list) return list.map(function(t) { return Object.assign({}, t); });
        var planIdNum = parseInt(planId, 10);
        if (planIdNum >= 50000) {
            var planGrupal = actividadesSeguimiento.find(function(a) { return a.tipo === 'plan' && a.id === planIdNum; });
            if (planGrupal) {
                var nombrePlan = planGrupal.nombre;
                return actividadesSeguimiento
                    .filter(function(a) { return a.tipo === 'tarea' && a.plan === nombrePlan; })
                    .map(function(t) {
                        var asignado = t.asignado || {};
                        return {
                            id: t.id,
                            name: t.nombre,
                            done: t.estado === 'Finalizada',
                            status: t.estado === 'Finalizada' ? 'Finalizado' : (t.estado === 'Vencida' ? 'Vencido' : 'Activo'),
                            endDate: fechaSeguimientoToYYYYMMDD(t.fechaFinalizacion),
                            priority: (t.prioridad || 'Media').toLowerCase(),
                            assignee_email: asignado.username || null,
                            assignee_name: asignado.nombre || null,
                            assignee_avatar_url: (asignado.avatar && String(asignado.avatar).trim()) ? asignado.avatar : null,
                            etiqueta: null,
                            planId: planIdNum,
                            planNombre: nombrePlan,
                            description: null,
                            created_by: t.creador || ''
                        };
                    });
            }
        }
        return [];
    }

    function getActividadesSeguimiento() {
        return actividadesSeguimiento.map(a => Object.assign({}, a));
    }

    function getActividadesParaLider(nombreLider) {
        const reportes = getReportesDirectosEjemplo(nombreLider) || [];
        const setReportes = new Set(reportes);
        return actividadesSeguimiento.filter(function(act) {
            if (act.tipo === 'tarea' && act.asignado) return setReportes.has(act.asignado.nombre);
            if (act.tipo === 'plan' && act.asignados && act.asignados.length) {
                return act.asignados.some(function(a) { return setReportes.has(a.nombre); });
            }
            return false;
        });
    }

    function normalizeNameForMatch(str) {
        if (str == null || typeof str !== 'string') return '';
        return str.replace(/\s+/g, ' ').trim();
    }

    /** Resuelve nombre y avatar del creador por nombre (para "Creada por" en panel de detalle). */
    function getCreatorDisplay(nombre) {
        var name = normalizeNameForMatch(nombre);
        if (!name) return { name: 'Sin especificar', avatar: null };
        var current = getUsuarioActual();
        if (current && current.nombre && normalizeNameForMatch(current.nombre) === name) return { name: current.nombre, avatar: (current.avatar && String(current.avatar).trim()) ? current.avatar : null };
        var jefes = getJefesEjemplo();
        var emp = (jefes || []).find(function(e) { return normalizeNameForMatch(e.nombre) === name; });
        if (emp) return { name: emp.nombre || name, avatar: (emp.avatar && String(emp.avatar).trim()) ? emp.avatar : null };
        var empleados = getEmpleadosEjemplo();
        emp = (empleados || []).find(function(e) { return normalizeNameForMatch(e.nombre) === name; });
        if (emp) return { name: emp.nombre || name, avatar: (emp.avatar && String(emp.avatar).trim()) ? emp.avatar : null };
        return { name: name, avatar: null };
    }

    global.TAREAS_PLANES_DB = {
        getUsuarioActual: getUsuarioActual,
        getTareasVistaTareas: getTareasVistaTareas,
        getPlanesVistaPlanes: getPlanesVistaPlanes,
        getPlanDetalle: getPlanDetalle,
        getTareasPorPlan: getTareasPorPlan,
        getActividadesSeguimiento: getActividadesSeguimiento,
        getActividadesParaLider: getActividadesParaLider,
        getCreatorDisplay: getCreatorDisplay,
        getTodayString: getTodayString,
        getReportesDirectos: getReportesDirectosEjemplo,
        getEmpresaEjemplo: function() { return Object.assign({}, EMPRESA_EJEMPLO); },
        getAreasEjemplo: function() { return AREAS_EJEMPLO.slice(); },
        getJefesEjemplo: function() { return JEFES_EJEMPLO.slice(); },
        getEmpleadosEjemplo: function() { return EMPLEADOS_EJEMPLO.slice(); }
    };

})(typeof window !== 'undefined' ? window : this);
